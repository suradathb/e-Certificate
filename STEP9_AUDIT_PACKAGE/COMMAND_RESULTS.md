# Command Results

| Command | Exit | Result |
|---------|------|--------|
| git (status/rev-parse/remote) | - | NOT EXECUTABLE IN CURRENT SANDBOX — RUN LOCALLY REQUIRED |
| analysis regeneration (in-process Python) | 0 | PASS — stats + Fig.7/8/9 regenerated; values MATCH manuscript |
| SHA-256 manifest (results/final) | 0 | 67 files hashed, verify 67/67 OK |
| secret scan | 0 | NO EXPOSED SECRET in tracked content (.env git-ignored) |
| thai/emoji source scan | 0 | 0 remaining |
| npm install / hardhat compile / npm test | - | NOT EXECUTED (toolchain blocked in sandbox); run locally. Prior user runs: lifecycle 11/11, replay 13+2, checkpoint 10, benchmark 11 PASS |
| npx tsx uploadToIPFS.ts | - | NOT EXECUTED — LOCAL IPFS NODE REQUIRED (no CID fabricated) |
