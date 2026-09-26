// Lifecycle conformance tests for NFTCowCert V2 (STEP 2.5)
// Proves the smart contract behavior matches the revised formal model:
//   S = {Active, Suspended} (+ pre-existence), A = {issue, transfer, suspend, reinstate}
//   fetch = read-only (no state transition), revoke = NOT IMPLEMENTED (extension)
//
// Run (on a machine with a working toolchain):
//   npx hardhat test test/lifecycle.spec.ts
//
// Reviewer traceability: R1-14, R1-16, R2-01, R2-04

import { expect } from "chai";
import { ethers } from "hardhat";

// keccak256 helper for cowHash
function cowHashOf(cowId: string): string {
  return ethers.keccak256(ethers.toUtf8Bytes(cowId));
}

describe("NFTCowCert V2 — lifecycle conformance", () => {
  async function deploy() {
    const [admin, alice, bob, stranger] = await ethers.getSigners();
    const Factory = await ethers.getContractFactory("NFTCowCert");
    const c = await Factory.deploy(admin.address);
    await c.waitForDeployment();
    return { c, admin, alice, bob, stranger };
  }

  const CID = "bafkreie_test_cid";

  async function issue(c: any, to: string, cowId = "COW-001") {
    const tx = await c.issueCert(to, CID, cowId, cowHashOf(cowId));
    const rcpt = await tx.wait();
    // tokenId from ERC-721 Transfer(0x0,to,tokenId)
    let tokenId: bigint | undefined;
    for (const log of rcpt.logs ?? []) {
      try {
        const parsed = c.interface.parseLog(log);
        if (parsed?.name === "Transfer" && parsed.args?.from === ethers.ZeroAddress) {
          tokenId = parsed.args.tokenId;
        }
      } catch {}
    }
    return tokenId!;
  }

  // ---------- VALID LIFECYCLE ----------
  describe("valid lifecycle", () => {
    it("issue creates a certificate in Active (isBlocked=false) and emits CertIssued", async () => {
      const { c, admin, alice } = await deploy();
      await expect(c.issueCert(alice.address, CID, "COW-001", cowHashOf("COW-001")))
        .to.emit(c, "CertIssued");
      const tokenId = 1n;
      expect(await c.isCertBlocked(tokenId)).to.equal(false); // Active
      expect(await c.ownerOf(tokenId)).to.equal(alice.address);
    });

    it("issue -> transfer (Active -> Active) succeeds", async () => {
      const { c, admin, alice, bob } = await deploy();
      const tokenId = await issue(c, alice.address);
      await expect(
        c.connect(alice).safeTransferFrom(alice.address, bob.address, tokenId)
      ).to.emit(c, "Transfer");
      expect(await c.ownerOf(tokenId)).to.equal(bob.address);
    });

    it("issue -> suspend -> reinstate (Active -> Suspended -> Active)", async () => {
      const { c, admin, alice } = await deploy();
      const tokenId = await issue(c, alice.address);
      await expect(c.blockCert(tokenId)).to.emit(c, "CertBlocked");
      expect(await c.isCertBlocked(tokenId)).to.equal(true); // Suspended
      await expect(c.unblockCert(tokenId)).to.emit(c, "CertUnblocked");
      expect(await c.isCertBlocked(tokenId)).to.equal(false); // Active
    });
  });

  // ---------- INVALID / GUARDED LIFECYCLE ----------
  describe("invalid / guarded transitions", () => {
    it("transfer while Suspended is rejected", async () => {
      const { c, admin, alice, bob } = await deploy();
      const tokenId = await issue(c, alice.address);
      await c.blockCert(tokenId); // Suspended
      await expect(
        c.connect(alice).safeTransferFrom(alice.address, bob.address, tokenId)
      ).to.be.revertedWith("This certificate is blocked and cannot be transferred");
    });

    it("unauthorized (non-admin) issue is rejected", async () => {
      const { c, stranger, alice } = await deploy();
      await expect(
        c.connect(stranger).issueCert(alice.address, CID, "COW-XX", cowHashOf("COW-XX"))
      ).to.be.revertedWith("Not authorized");
    });

    it("unauthorized transfer (not owner/approved) is rejected", async () => {
      const { c, alice, bob, stranger } = await deploy();
      const tokenId = await issue(c, alice.address);
      await expect(
        c.connect(stranger).safeTransferFrom(alice.address, bob.address, tokenId)
      ).to.be.reverted;
    });

    it("suspend on nonexistent token reverts", async () => {
      const { c } = await deploy();
      await expect(c.blockCert(999)).to.be.revertedWith("Token does not exist");
    });
  });

  // ---------- IDEMPOTENT (documented) BEHAVIOR ----------
  describe("idempotent behavior (no current-value guard)", () => {
    it("repeated suspend keeps Suspended (no revert)", async () => {
      const { c, alice } = await deploy();
      const tokenId = await issue(c, alice.address);
      await c.blockCert(tokenId);
      await expect(c.blockCert(tokenId)).to.emit(c, "CertBlocked"); // still allowed
      expect(await c.isCertBlocked(tokenId)).to.equal(true);
    });

    it("reinstate when not suspended keeps Active (no revert)", async () => {
      const { c, alice } = await deploy();
      const tokenId = await issue(c, alice.address);
      await expect(c.unblockCert(tokenId)).to.emit(c, "CertUnblocked"); // allowed no-op
      expect(await c.isCertBlocked(tokenId)).to.equal(false);
    });
  });

  // ---------- READ-ONLY: fetch must NOT change state ----------
  describe("fetch is read-only", () => {
    it("certs()/getCertStatus()/isCertBlocked() do not change lifecycle state", async () => {
      const { c, alice } = await deploy();
      const tokenId = await issue(c, alice.address);
      const before = await c.isCertBlocked(tokenId);
      await c.certs(tokenId);
      await c.getCertStatus(tokenId);
      await c.isCertBlocked(tokenId);
      const after = await c.isCertBlocked(tokenId);
      expect(after).to.equal(before);
      expect(await c.ownerOf(tokenId)).to.equal(alice.address);
    });
  });

  // ---------- EXTENSION: revoke is NOT implemented ----------
  describe("revoke is not implemented (framework extension)", () => {
    it("no revoke function exists on the contract ABI", async () => {
      const { c } = await deploy();
      const hasRevoke = c.interface.fragments.some(
        (f: any) => f.type === "function" && /revoke/i.test(f.name ?? "")
      );
      expect(hasRevoke).to.equal(false);
    });
  });
});
