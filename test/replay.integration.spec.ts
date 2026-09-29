// STEP 6 — Integration/conformance test.
// Deploys the REAL contract on the in-process Hardhat network, performs real
// lifecycle operations, collects REAL emitted logs, reconstructs state from those
// logs (without querying the contract during reconstruction), then queries the
// contract and compares. Run: npx hardhat test test/replay.integration.spec.ts

import { expect } from "chai";
import { ethers } from "hardhat";
import { reconstructFromLogs } from "../src/replay/reconstructCertificateState";
import { compareState, ContractState } from "../src/replay/compareContractState";

function cidFor(i: number) { return `bafkreicid${i.toString().padStart(4, "0")}`; }
function cowId(i: number) { return `COW-${i.toString().padStart(4, "0")}`; }

async function contractStateOf(c: any, tokenId: string): Promise<ContractState> {
  try {
    const owner = await c.ownerOf(tokenId);
    const cert = await c.certs(tokenId);
    const isBlocked = await c.isCertBlocked(tokenId);
    return {
      exists: true,
      owner: String(owner).toLowerCase(),
      status: isBlocked ? "Suspended" : "Active",
      metadataCID: String(cert.metadataCID),
    };
  } catch {
    return { exists: false, owner: null, status: null, metadataCID: null };
  }
}

describe("STEP 6 — replay integration (real logs vs contract)", function () {
  this.timeout(120000);

  it("reconstructs owner/status/metadata from real emitted logs and matches contract", async () => {
    const [admin, alice, bob] = await ethers.getSigners();
    const Factory = await ethers.getContractFactory("NFTCowCert");
    const c = await Factory.deploy(admin.address);
    await c.waitForDeployment();

    // Perform a deterministic lifecycle scenario over several certificates.
    // cert1: issue -> transfer(alice->bob) -> suspend -> reinstate
    // cert2: issue -> suspend
    // cert3: issue only
    await (await c.issueCert(alice.address, cidFor(1), cowId(1), ethers.keccak256(ethers.toUtf8Bytes(cowId(1))))).wait();
    await (await c.issueCert(alice.address, cidFor(2), cowId(2), ethers.keccak256(ethers.toUtf8Bytes(cowId(2))))).wait();
    await (await c.issueCert(bob.address, cidFor(3), cowId(3), ethers.keccak256(ethers.toUtf8Bytes(cowId(3))))).wait();

    await (await c.connect(alice).safeTransferFrom(alice.address, bob.address, 1)).wait();
    await (await c.blockCert(1)).wait();
    await (await c.unblockCert(1)).wait();
    await (await c.blockCert(2)).wait();

    // Collect ALL logs from the contract across the full range.
    const addr = await c.getAddress();
    const logs = await ethers.provider.getLogs({ address: addr, fromBlock: 0, toBlock: "latest" });

    // Reconstruct from logs ONLY.
    const reconstructed = reconstructFromLogs(logs as any);

    // Compare each token against authoritative contract state.
    let matches = 0, mismatches = 0;
    for (const tokenId of ["1", "2", "3"]) {
      const replayed = reconstructed.get(tokenId)!;
      const contractState = await contractStateOf(c, tokenId);
      const row = compareState(replayed, contractState, { compareMetadata: true });
      if (row.overall) matches++; else { mismatches++; console.error("MISMATCH", row); }
    }
    expect(mismatches).to.equal(0);
    expect(matches).to.equal(3);

    // Spot-check specific expectations
    expect(reconstructed.get("1")!.owner).to.equal(bob.address.toLowerCase());
    expect(reconstructed.get("1")!.status).to.equal("Active");
    expect(reconstructed.get("2")!.status).to.equal("Suspended");
    expect(reconstructed.get("3")!.metadataCID).to.equal(cidFor(3));
  });

  it("negative test: dropping the last unblock event yields MISMATCH", async () => {
    const [admin, alice] = await ethers.getSigners();
    const Factory = await ethers.getContractFactory("NFTCowCert");
    const c = await Factory.deploy(admin.address);
    await c.waitForDeployment();

    await (await c.issueCert(alice.address, cidFor(1), cowId(1), ethers.keccak256(ethers.toUtf8Bytes(cowId(1))))).wait();
    await (await c.blockCert(1)).wait();
    await (await c.unblockCert(1)).wait(); // contract ends Active

    const addr = await c.getAddress();
    let logs = (await ethers.provider.getLogs({ address: addr, fromBlock: 0, toBlock: "latest" })) as any[];

    // TAMPER (test-only): drop the CertUnblocked log => replay should end Suspended
    // Identify unblock topic and remove the last matching log.
    const iface = new ethers.Interface([
      "event CertUnblocked(uint256 indexed id)",
    ]);
    const unblockTopic = iface.getEvent("CertUnblocked")!.topicHash;
    const idx = [...logs].reverse().findIndex((l) => l.topics[0] === unblockTopic);
    if (idx >= 0) logs.splice(logs.length - 1 - idx, 1);

    const reconstructed = reconstructFromLogs(logs);
    const replayed = reconstructed.get("1")!;
    const contractState = await contractStateOf(c, "1");
    const row = compareState(replayed, contractState, { compareMetadata: true });

    // replay says Suspended, contract says Active => mismatch on status
    expect(replayed.status).to.equal("Suspended");
    expect(row.statusMatch).to.equal(false);
    expect(row.overall).to.equal(false);
  });
});
