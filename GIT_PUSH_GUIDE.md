# Git Push Guide (run locally)

The assistant cannot run git in its sandbox. Run these steps locally to publish to
https://github.com/suradathb/e-Certificate.git

## ⚠️ Pre-push safety (MANDATORY)

1. **Confirm `.env` is NOT tracked** (it holds real testnet keys):
```bash
git status --ignored | grep -n "\.env$" || echo "not shown (good if ignored)"
git ls-files | grep -E "^\.env$" && echo "DANGER: .env is TRACKED" || echo "OK: .env not tracked"
```
2. **Confirm history never contained a secret** (throwaway keys are still best rotated):
```bash
git log --all --full-history -- .env
```
If `.env` ever appears above, rotate those keys and clean history (git filter-repo / BFG)
BEFORE pushing.

3. **Verify the contract is unchanged in semantics** (only comments were edited):
```bash
git diff -- contracts/
# review: expect only comment lines (English) changed, no logic
```

## Publish

```bash
cd e-Certificate

# stage the finalized repository (respects .gitignore: .env, node_modules, artifacts excluded)
git add -A
git status                     # review what will be committed

git commit -m "STEP 9: repository finalization — local IPFS docs, English comments, \
reproduction guides, frozen evidence, analysis scripts, audit package"

# tag a release so the paper's 'tagged release + commit identifier' claim becomes true
git tag -a v2.0.0 -m "NFTCowCert V2 — Journal of Supercomputing revision artifact"

git push origin main           # or your default branch
git push origin v2.0.0
```

## After push — update the manuscript reproducibility block

Once pushed, capture the REAL commit hash and put it in CC.tex (replace the current
placeholder `0xe022…`, which is not a valid git commit):
```bash
git rev-parse HEAD             # 40-hex commit id -> paste into CC.tex Reproducibility
```
Update CC.tex:
- Release version: `v2.0.0`
- Commit hash: `<git rev-parse HEAD output>`  ← real 40-hex SHA, not the old 64-char string

## Sanity check the public repo
- README renders, GETTING_STARTED.md + REPRODUCING.md + DEPLOYED_CONTRACTS.md present
- `.env` absent; `.env.example` present
- results/final present; SHA256SUMS.txt present
