// STEP 7 — Read-only diagnostics (NO gas). Figures out why issueCert reverts.
// Run:  npx hardhat run scripts/benchmark-final/diagnose.ts --network zkSyncTestnet
import { ethers } from "hardhat";

async function main() {
  const [admin] = await ethers.getSigners();
  // pick contract by the network we are actually connected to
  const net0 = await ethers.provider.getNetwork();
  const isZk = Number(net0.chainId) === 300;
  const addr = (isZk ? (process.env.ZKSYNC_CONTRACT || process.env.ZKSYNC_CONTRACT_TEST)
                     : (process.env.SEPOLIA_CONTRACT || process.env.ETH_CONTRACT_TEST))!;
  console.log("admin:", admin.address);
  console.log("chainId:", Number(net0.chainId));
  console.log("contract:", addr);

  const provider = ethers.provider;
  const code = await provider.getCode(addr);
  console.log("bytecode length:", code.length, code === "0x" ? " NO CONTRACT AT THIS ADDRESS" : " contract present");
  if (code === "0x") return;

  const c = await ethers.getContractAt("NFTCowCert", addr);

  // Probe read-only views defensively
  async function tryCall(label: string, fn: () => Promise<any>) {
    try { const v = await fn(); console.log(`  ${label} = ${v}`); }
    catch (e: any) { console.log(`  ${label} -> REVERT/err: ${String(e?.shortMessage || e?.message || e).slice(0,90)}`); }
  }
  console.log("\n-- read-only probes --");
  await tryCall("owner()", () => (c as any).owner());
  await tryCall("adminCount()", () => (c as any).adminCount());
  await tryCall("certCount()", () => (c as any).certCount());
  await tryCall(`isAdmin(${admin.address})`, () => (c as any).isAdmin(admin.address));
  await tryCall("name()", () => (c as any).name());
  await tryCall("symbol()", () => (c as any).symbol());

  // Try a STATIC call of issueCert (no gas, no state change) to see the revert reason
  console.log("\n-- staticCall issueCert (no gas) --");
  try {
    const cowId = "DIAG-001";
    const cowHash = ethers.keccak256(ethers.toUtf8Bytes(cowId));
    await (c as any).issueCert.staticCall(admin.address, "bafkreidiag", cowId, cowHash);
    console.log("issueCert staticCall succeeded (admin can mint)");
  } catch (e: any) {
    console.log("issueCert staticCall reverted:", String(e?.shortMessage || e?.reason || e?.message || e).slice(0,160));
  }
}
main().catch((e) => { console.error(e); process.exit(1); });
