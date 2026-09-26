# HOW TO RUN THE LIFECYCLE TESTS (author's machine)

> STATUS: **EXECUTED SUCCESSFULLY on the author's machine — 11 passing, 0 failing, 0 skipped.**
> (The assistant sandbox could not run npm/npx: `EPERM ... /usr`. The commands below are what
> actually worked on the author's macOS terminal.)

## What actually worked (recorded)
1. `npm install`
2. `npm install --save-dev "@nomicfoundation/hardhat-chai-matchers@^2.0.0"`
3. `npx hardhat compile`  → fixed HH8 by the `hardhat.config.ts` dummy-key fallback
4. `npx hardhat test test/lifecycle.spec.ts`  → 11 passing

## 1. Install test dependencies
The current `package.json` deploys via matterlabs/hardhat-zksync but has **no test runner**.
Add these dev deps (versions are indicative — align with your lockfile):

```bash
npm i -D @nomicfoundation/hardhat-toolbox chai @types/chai @types/mocha mocha
```

`hardhat.config.ts` already imports `@nomicfoundation/hardhat-ethers`, which the toolbox
also provides. Make sure the config is loaded for the default (in-process) Hardhat network
so tests run without a live RPC. The lifecycle tests use `ethers` from `hardhat` and the
built-in Hardhat Network — no zkSync RPC is required.

## 2. Compile
```bash
npx hardhat compile
```
Note: the contract source file is `contracts/NFTCowCert_v2.sol` but the **contract name**
is `NFTCowCert`. The test uses `getContractFactory("NFTCowCert")` accordingly.

## 3. Run
```bash
npx hardhat test test/lifecycle.spec.ts
```

## 4. Expected coverage (must match FORMAL_MODEL_ALIGNMENT.md)
- valid: issue; issue→transfer; issue→suspend→reinstate
- guarded: transfer-while-suspended reverts; non-admin issue reverts; unauthorized transfer reverts; suspend nonexistent reverts
- idempotent: repeated suspend; reinstate-when-not-suspended
- read-only: fetch/certs/getCertStatus/isCertBlocked do not change state
- extension: no `revoke` function in ABI

## 5. If a test fails
Do not "fix the contract to make the test pass" silently. Record the mismatch, root cause,
and whether the intended fix is in scope, then add a regression test. (See STEP 2.5 rules.)
