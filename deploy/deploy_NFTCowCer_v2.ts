import { Deployer } from "@matterlabs/hardhat-zksync-deploy";
import { Wallet } from "zksync-ethers";
import * as dotenv from "dotenv";
import { HardhatRuntimeEnvironment } from "hardhat/types";

dotenv.config();

export default async function (hre: HardhatRuntimeEnvironment) {
  const pk = process.env.PRIVATE_KEY;
  if (!pk) throw new Error("Missing PRIVATE_KEY in .env");

  const wallet = new Wallet(pk);
  const deployer = new Deployer(hre, wallet);

  // ชื่อ artifact ต้องตรงกับชื่อ contract
  const artifact = await deployer.loadArtifact("NFTCowCert_v2");

  // ถ้า constructor รับ (address initialOwner) ให้ใช้แบบนี้
  const contract = await deployer.deploy(artifact, [wallet.address]);

  // รอให้ deploy tx confirm (กันบางกรณี log ออกก่อน)
  await contract.waitForDeployment();

  const address =
    // ethers v6 style
    (contract as any).target ||
    // fallback
    (await (contract as any).getAddress?.());

  console.log("✅ NFTCowCert_v2 deployed at:", address);

  const tx = contract.deploymentTransaction?.();
  if (tx) console.log("📨 Deployment TX hash:", tx.hash);
}
// npx hardhat deploy-zksync --script deploy_NFTCowCer_v2.ts --network zkSyncTestnet  