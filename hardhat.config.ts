import { HardhatUserConfig } from "hardhat/config";
// Revision (revision-jos-2026): load Hardhat chai matchers (.emit/.revertedWith/.reverted) for tests.
// Use hardhat-chai-matchers directly (Hardhat 2 compatible) instead of hardhat-toolbox (Hardhat 3 only).
import "@nomicfoundation/hardhat-chai-matchers";
import "@matterlabs/hardhat-zksync-deploy";
import "@matterlabs/hardhat-zksync-solc";
import "@nomicfoundation/hardhat-ethers";
import "@matterlabs/hardhat-zksync-verify";
// import mintAfterUpload from "./scripts/mintAfterUpload";
import * as dotenv from "dotenv";

dotenv.config();

// --- Revision note (revision-jos-2026) ---
// For local compile/test on the in-process Hardhat network we do NOT need a real
// private key. When PRIVATE_KEY is missing/empty, fall back to a well-formed dummy
// 32-byte key so config loading does not fail with HH8 "private key too short".
// Real deployments continue to use the real PRIVATE_KEY from .env unchanged.
const DUMMY_PK =
  "0x0000000000000000000000000000000000000000000000000000000000000001";

function acct(pk?: string): string[] {
  const v = (pk || "").trim();
  // accept only a proper 0x + 64 hex; otherwise use dummy (test/compile only)
  return [/^0x[0-9a-fA-F]{64}$/.test(v) ? v : DUMMY_PK];
}

const config: HardhatUserConfig = {
  defaultNetwork: "hardhat",
  networks: {
    // In-process network for compile/tests (no key, no RPC required)
    hardhat: {},
    zkSyncTestnet: {
      url: process.env.ZKSYNC_RPC || "",
      ethNetwork: process.env.ETH_RPC || "",
      zksync: true,
      accounts: acct(process.env.PRIVATE_KEY),
      verifyURL: "https://sepolia.explorer.zksync.dev/contract_verification",
    },
    opSepolia: {
      url: process.env.OPTIMISM_RPC || "",
      ethNetwork: process.env.ETH_RPC || "",
      zksync: false,
      accounts: acct(process.env.PRIVATE_KEY),
    },
    zkCustom: {
      url: "http://localhost:3050",
      ethNetwork: "goerli", // local ใช้อะไรก็ได้
      zksync: true,
      accounts: acct(process.env.PRIVATE_KEY),
    },
    // ✅ เพิ่ม L1 Sepolia โดยตรง
    ethereumSepolia: {
      url: process.env.ETH_RPC || "", // เช่น Alchemy/Infura URL
      chainId: 11155111,
      accounts: acct(process.env.PRIVATE_KEY),
    },
    // ✅ เพิ่ม BNB Testnet
    bnbTestnet: {
      url: process.env.BNB_RPC || "",
      chainId: 97,
      accounts: acct(process.env.PRIVATE_KEY_BNB),
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
