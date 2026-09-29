# STEP 5 — LITERATURE EVIDENCE MATRIX (rebuilt, cell-level traceable)

> Values: Yes / No / Partial / Not reported / NES (Not established from verified source) / N/A.
> A feature is NOT "No" merely because an abstract omits it — use NES unless the source establishes absence.
> "This work" (NFTCowCert V2) is listed AFTER the prior works and does NOT count toward the 7–10.

## Final verified PRIOR/EXTERNAL works (count = 7)

| # | Key | Exact title | Authors | Year | Venue | DOI / ID | Status | Authoritative source | Reason for inclusion |
|---|-----|-------------|---------|------|-------|----------|--------|----------------------|----------------------|
| W1 | `bangnikrai2022blockchain` | Blockchain certificates for pedigree management (NFTCowCert V1) | S. Bangnikrai, A. Prayote | 2022 | IEEE RI2C | 10.1109/RI2C56397.2022.9910295 | peer-reviewed (conf) | IEEE (bib DOI) | prior work (V1) — direct predecessor |
| W2 | `szalachowski2020smartcert` | SmartCert: Redesigning Digital Certificates with Smart Contracts | P. Szalachowski | 2020 | arXiv | arXiv:2003.13259 | **preprint** | arXiv abstract (fetched) | smart-contract certificate lifecycle/validation state (PKI) |
| W3 | `zhao2021nftcert` | NFTCert: NFT-Based Certificates With Online Payment Gateway | X. Zhao, Y.-W. Si | 2021 | IEEE Int. Conf. Blockchain, Melbourne, pp. 221–228 | 10.1109/Blockchain53845.2021.00081 | peer-reviewed (conf) | arXiv:2202.09511 + UvA camera-ready | NFT-based certificates w/ minting, verification, **revocation** |
| W4 | `cheng2018blockchain` | Blockchain and smart contract for digital certificate systems | J.-C. Cheng, N.-Y. Lee, C. Chi, Y.-H. Chen | 2018 | IEEE ICASI | 10.1109/ICASI.2018.8394455 | peer-reviewed (conf) | search + bib (authors confirmed) | early blockchain digital-certificate issuance/verification |
| W5 | `hawashin2024blockchain` | Blockchain and NFT-based traceability and certification for UAV parts in manufacturing | D. Hawashin, M. Nemer, K. Salah, R. Jayaraman, D. Svetinovic, E. Damiani | 2024 | J. Ind. Inf. Integr. 39:100597 | 10.1016/j.jii.2024.100597 | peer-reviewed (journal) | Elsevier (bib DOI) + search | NFT asset traceability/certification (non-credential domain) |
| W6 | `krishnan2025dairy` | Integrated Dairy Production and Cattle Healthcare Management Using Blockchain NFTs and Smart Contracts | S. Krishnan, L. P. Ganesan | 2025 | Systems 13(1):65 | 10.3390/systems13010065 | peer-reviewed (journal) | MDPI page (fetched) | **livestock/cattle NFT certificates on ZK-Rollup L2** w/ perf eval |
| W7 | `zkbarv2025` | A Zero-Knowledge Proof-Enabled Blockchain-Based Academic Record Verification System (ZKBAR-V) | (AUT/Crown authors) | 2025 | Sensors 25(11):3450 | 10.3390/s25113450 | peer-reviewed (journal) | MDPI page (fetched) | academic credentials on **zkEVM L2 + IPFS + DID**, L1-vs-L2 cost |

Optional 8th (review, if a review is wanted): `poornima2024academic` — Poornima, "Academic certificate authenticity using blockchain: A review," IJRASET 12(12):906–910, 2024, DOI 10.22214/ijraset.2024.65924 (VERIFIED; label as **review**).

## Comparison / feature matrix (cell-level)

| Work | Domain | Blockchain/Platform | Cert. representation | Lifecycle ops | Suspension | Revocation | Ownership transfer | Storage | Layer-2 | Evaluation type | Performance eval | Public artifact | Main limitation (rel. this study) | Evidence |
|------|--------|---------------------|----------------------|---------------|-----------|-----------|--------------------|---------|---------|-----------------|------------------|-----------------|-----------------------------------|----------|
| W1 V1 | livestock pedigree | Ethereum L1 | ERC-721 NFT | issue, transfer | No | Not reported | Yes | IPFS+on-chain | No | prototype demo | Partial (qualitative) | Not identified | L1 cost/latency; no L2; no formal lifecycle | RI2C paper/bib |
| W2 SmartCert | TLS/PKI web certs | Ethereum contracts | contract-based cert | validation-state updates | Partial | Partial (CA update) | N/A | on-chain state | No | implementation+eval | Partial | NES | not credential/NFT; preprint | arXiv abstract |
| W3 NFTCert | academic certs | Ethereum (NFT) | NFT + schema | mint, verify, revoke | Not reported | **Yes** | Yes (NFT) | on/off-chain | No | prototype+functional | Partial | NES | L1; no L2 eval; no suspension reported | arXiv + IEEE camera-ready |
| W4 Cheng2018 | digital certs (edu/paper) | Ethereum contract | hash + QR | issue, verify | No | Not reported | No | on-chain hash | No | prototype demo | No | Not identified | issuance/verification only | search+bib |
| W5 Hawashin2024 | UAV parts (mfg) | Ethereum NFT | NFT | traceability, certification | Not reported | Not reported | Yes | on/off-chain | No | functional eval | Partial | NES | different domain; not L2 | Elsevier+search |
| W6 Krishnan2025 | livestock/cattle health | ZK-Rollup **L2** | NFT as digital cert | issue, records | Not reported | Not reported | Yes | on/off-chain | **Yes** | performance eval | **Yes** (TPS, gas, finality) | NES | cattle *health* not pedigree; platform generic ZK-rollup | MDPI page |
| W7 ZKBAR-V 2025 | academic credentials | zkEVM **L2** | credential + DID | issue, verify | Not reported | Partial (correction) | N/A | IPFS + dual-chain | **Yes** | implementation+eval | **Yes** (cost vs mainnet) | Partial (states open-source) | credentials not NFT pedigree | MDPI page |
| **This work — NFTCowCert V2** | livestock pedigree (evaluated) | zkSync Era **L2** + L1 baseline | ERC-721 NFT | **issue, transfer, suspend, reinstate** | **Yes** | **No — conceptual extension only** | Yes | IPFS + on-chain refs | **Yes** | perf + lifecycle conformance (11/11 tests) | **Yes** | **Yes** (github.com/suradathb/e-Certificate) | revocation not implemented; livestock-only scope | STEP 2–3 + repo |

## Comparison categories (must not be mixed)
- **Literature comparators:** W2 SmartCert, W3 NFTCert, W4 Cheng2018, W5 Hawashin2024, W6 Krishnan2025, W7 ZKBAR-V (+ W1 V1 as prior work). NOT reimplemented → **not experimental benchmarks**.
- **Experimental baseline:** only this study's own Ethereum Sepolia (L1) measurements (provenance from STEP 1 — currently `output/` results NOT in baseline; must be located before any L1-vs-L2 numeric claim).
- **This work:** NFTCowCert V2 (zkSync Era).

## Current-reference disposition (Related Work in CC.tex)
| Key | Disposition | Reason |
|-----|-------------|--------|
| `bangnikrai2022blockchain` | **KEEP** | verified prior work (V1) |
| `cheng2018blockchain` | **CORRECT** | keep paper, fix narrative (NOT "SmartCert", NOT Srivastava, NOT educational-NFT) |
| `hawashin2024blockchain` | **CORRECT** | keep paper, fix narrative (UAV parts, NOT "NFTCert / Singh & Yadav / e-commerce") |
| `poornima2024academic` | **CORRECT** | describe as review, correct author (Poornima) |
| `szalachowski2020smartcert` | **ADD** | real SmartCert (TLS/PKI, preprint) |
| `zhao2021nftcert` | **ADD** | real NFTCert (Zhao & Si, IEEE 2021) |
| `krishnan2025dairy` | **ADD** | livestock NFT cert on L2 (novelty-relevant) |
| `zkbarv2025` | **ADD** | academic credential on zkEVM L2 (novelty-relevant) |
| `gupta2022zkp` | **REMOVE** | identity unverifiable; DOI placeholder-like; real L2 survey is a different work |
| `arora2022sok` | **REMOVE** | IEEE Access 2022 title/pages not confirmed from authoritative source |
| `chen2023cert` | **REMOVE** | Computers & Security 2023 vol/pages/DOI not confirmed |
| L2 vendor refs (`polygon2024zkEVM`, `starkware2024starknet`, `zksync2022whitepaper`, `zksyncdocs2024`) | KEEP (grey lit) | label as whitepaper/docs, not certificate systems |
| `saraji2021carbon`, `merlo2025carbon` | KEEP (context) | carbon-market context; saraji = arXiv preprint |
| `chaliasos2024snarkvulns`, `malavolta2024modular`, `l2beat2024zk`, `buterin2021roadmap`, `xu2019architecture`, `walpole2012statistics` | KEEP | discussion/method/background |

## Unresolved evidence (not guessed)
- Public Artifact for W2, W3, W5, W6 = **NES** (no authoritative repo link located this pass).
- ZKBAR-V "open-source" stated in abstract → Public Artifact = **Partial** (claim present; repo URL not yet located).
- W7 author list not fully captured from the page (affiliations only) → complete author names to be confirmed before BibTeX.
- Gap statement wording (conservative): "Among the reviewed systems, we did not identify one combining a formally specified reversible-suspension lifecycle, a verifiable semantic→execution (φ) binding, and zkSync-Era evaluation with a public artifact." (matrix-supported; avoid "first/no study").
