import { ethers } from "ethers";
import * as fs from "fs";
import * as dotenv from "dotenv";
dotenv.config();

async function main() {
  const provider = new ethers.JsonRpcProvider(process.env.ETH_RPC!);
  const signer = new ethers.Wallet(process.env.PRIVATE_KEY!, provider);

  const artifact = JSON.parse(
    fs.readFileSync("./artifacts/contracts/NFTCowCert_v2.sol/NFTCowCert.json", "utf-8")
  );

  const factory = new ethers.ContractFactory(artifact.abi, artifact.bytecode, signer);

  console.log("Deploying contract with:", await signer.getAddress());

  // pass only initialOwner (address)
  const contract = await factory.deploy(await signer.getAddress());

  await contract.waitForDeployment();

  console.log(" Contract deployed at:", contract.target);
}

main().catch((err) => {
  console.error(" Deployment error:", err);
});
