import { Wallet } from "zksync-ethers";
import { Deployer } from "@matterlabs/hardhat-zksync-deploy";
import { parseEther } from "ethers";
import * as dotenv from "dotenv";
import { HardhatRuntimeEnvironment } from "hardhat/types";

dotenv.config();

export default async function (hre: HardhatRuntimeEnvironment) {
  const wallet = new Wallet(process.env.PRIVATE_KEY!);
  const deployer = new Deployer(hre, wallet);

  const artifact = await deployer.loadArtifact("BCTToken");
  const totalSupply = parseEther("1000000000").toString();

  const token = await deployer.deploy(artifact, [totalSupply]);

  console.log("✅ BCT deployed at:", token.target);
}
