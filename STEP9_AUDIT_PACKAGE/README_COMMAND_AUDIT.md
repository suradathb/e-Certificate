# README Command Audit

Sandbox cannot execute `npx hardhat`/`npm`/`git`/`pdflatex` (blocks /usr). Local commands that are pure Python/logic were validated in-process. Testnet/IPFS/compile commands are documented and must run locally.

| Command | Purpose | Executed | Result |
|---------|---------|----------|--------|
| `npm install` | install deps | NOT EXECUTED | requires npm; run locally |
| `npx hardhat compile` | compile contracts | NOT EXECUTED | requires hardhat toolchain; run locally |
| `npm test` | unit+replay+checkpoint tests | NOT EXECUTED | requires hardhat; previously user-run: lifecycle 11/11, replay 13+2, checkpoint 10, benchmark 11 PASS |
| `npm run test:replay` | replay tests | NOT EXECUTED | requires hardhat; user-confirmed PASS in STEP 6 |
| `python analysis/regenerate_stats_and_figures.py` | regenerate stats+figs from frozen evidence | VALIDATED (in-process) | stats + Fig.7/8/9 regenerated; values MATCH manuscript |
| `npx tsx scripts/uploadToIPFS.ts` | upload metadata to local IPFS | NOT EXECUTED | LOCAL IPFS NODE REQUIRED (localhost:5001); no CID fabricated |
| benchmark live commands | public-testnet re-execution | NOT EXECUTED | requires funded testnet wallet + RPC; not required to verify frozen evidence |

STATIC/BUILD VALIDATION (analysis, frozen-evidence): PASS. LIVE IPFS UPLOAD: NOT EXECUTED — LOCAL IPFS NODE REQUIRED.
