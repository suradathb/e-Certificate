import { ethers } from "hardhat";
import { parseUnits } from "ethers";
import * as dotenv from "dotenv";

dotenv.config();

async function main() {
  const [deployer] = await ethers.getSigners();
  console.log("Deployer:", deployer.address);

  const Token = await ethers.getContractFactory("BenchmarkToken");
  const initialSupply = parseUnits("1000000", 18);
  const token = await Token.deploy(initialSupply);

  await token.waitForDeployment();

  console.log(`✅ Token deployed at: ${token.target}`);
}

main().catch((err) => {
  console.error("❌ Deployment failed:", err);
});
