# .gitignore Audit

Excludes secrets and volatile build output; preserves authoritative evidence.

- `.env`, `.env.*` excluded; `!.env.example` kept. ✅
- `node_modules/`, `cache/`, `cache-zk/`, `artifacts/`, `artifacts-zk/`, `dist/` excluded. ✅
- `output/`, `file_logs/`, `*.log`, `deployments/`, `deployments-zk/` excluded. ✅
- Authoritative evidence preserved (NOT ignored): `!replay-artifacts/`, `!benchmark-final-results/`. ✅

Current `.gitignore`:
```
# --- secrets ---
.env
.env.*
!.env.example

# --- OS ---
.DS_Store

# --- dependencies ---
node_modules/

# --- build / cache ---
dist/
cache/
cache-zk/
artifacts/
artifacts-zk/

# STEP 6 replay conformance outputs are tracked evidence (kept out of hardhat's artifacts/)
!replay-artifacts/
# STEP 7 benchmark outputs are tracked evidence (kept out of hardhat's artifacts/)
!benchmark-final-results/


# --- hardhat / deployments outputs ---
deployments/
deployments-zk/

# --- logs / outputs ---
output/
file_logs/
*.log

# --- optional local tooling ---
.zenflow/
.zencoder/
.zenflow
.zencoder
```
