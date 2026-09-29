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

  // artifact name must match the CONTRACT name (NFTCowCert), not the file name
  const artifact = await deployer.loadArtifact("NFTCowCert");

  // if the constructor takes (address initialOwner), use this form
  const contract = await deployer.deploy(artifact, [wallet.address]);

  // wait for the deploy tx to confirm (avoids logging before confirmation)
  await contract.waitForDeployment();

  const address =
    // ethers v6 style
    (contract as any).target ||
    // fallback
    (await (contract as any).getAddress?.());

  console.log(" NFTCowCert_v2 deployed at:", address);

  const tx = contract.deploymentTransaction?.();
  if (tx) console.log(" Deployment TX hash:", tx.hash);
}
// npx hardhat deploy-zksync --script deploy_NFTCowCer_v2.ts --network zkSyncTestnet  