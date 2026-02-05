import { HardhatUserConfig } from "hardhat/config";
import "@matterlabs/hardhat-zksync-deploy";
import "@matterlabs/hardhat-zksync-solc";
import "@nomicfoundation/hardhat-ethers";
import "@matterlabs/hardhat-zksync-verify";
// import mintAfterUpload from "./scripts/mintAfterUpload";
import * as dotenv from "dotenv";

dotenv.config();

const config: HardhatUserConfig = {
  defaultNetwork: "zkSyncTestnet",
  networks: {
    zkSyncTestnet: {
      url: process.env.ZKSYNC_RPC || "",
      ethNetwork: process.env.ETH_RPC || "",
      zksync: true,
      accounts: [process.env.PRIVATE_KEY || ""],
      verifyURL: "https://sepolia.explorer.zksync.dev/contract_verification",
    },
    opSepolia: {
      url: process.env.OPTIMISM_RPC || "",
      ethNetwork: process.env.ETH_RPC || "",
      zksync: false,
      accounts: [process.env.PRIVATE_KEY || ""],
    },
    zkCustom: {
      url: "http://localhost:3050",
      ethNetwork: "goerli", // local ใช้อะไรก็ได้
      zksync: true,
      accounts: [process.env.PRIVATE_KEY || ""],
    },
    // ✅ เพิ่ม L1 Sepolia โดยตรง
    ethereumSepolia: {
      url: process.env.ETH_RPC || "", // เช่น Alchemy/Infura URL
      chainId: 11155111,
      accounts: [process.env.PRIVATE_KEY || ""],
    },
    // ✅ เพิ่ม BNB Testnet
    bnbTestnet: {
      url: process.env.BNB_RPC || "",
      chainId: 97,
      accounts: [process.env.PRIVATE_KEY_BNB || ""],
    },
  },
  zksolc: {
    version: "1.5.1",
    compilerSource: "binary",
    settings: {
      optimizer: {
        enabled: true,
        runs: 200,
      },
    },
  },
  solidity: {
    version: "0.8.20",
  },
};

export default config;
