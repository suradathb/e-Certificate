import { Deployer } from "@matterlabs/hardhat-zksync-deploy";
import { Wallet } from "zksync-ethers";
import { parseUnits } from "ethers";
import * as dotenv from "dotenv";
import { HardhatRuntimeEnvironment } from "hardhat/types";

dotenv.config();

export default async function (hre: HardhatRuntimeEnvironment) {
  const wallet = new Wallet(process.env.PRIVATE_KEY!);
  const deployer = new Deployer(hre, wallet);

  const artifact = await deployer.loadArtifact("BenchmarkToken");

  const initialSupply = parseUnits("1000000", 18).toString(); // ✅ convert BigInt to string

  const tokenContract = await deployer.deploy(artifact, [initialSupply]);

  console.log("📦 Deploy result:", tokenContract);

  // ✅ ใช้ .target แทน .address
  if (tokenContract && "target" in tokenContract) {
    console.log(`✅ Token deployed at: ${tokenContract.target}`);
  } else {
    console.error("❌ Deployment succeeded but no contract address found");
  }

  // 🧾 Optional: log TX hash
  const tx = tokenContract.deploymentTransaction?.();
  if (tx) {
    console.log(`📨 Deployment TX hash: ${tx.hash}`);
  }
}
