# STEP 5 — RELATED WORK CITATION AUDIT

> Evidence gate (no CC.tex edit yet). Baseline preserved: `baseline_snapshot/pre-step5/CC.tex` + `CC.bib`.
> Principle: verified literature is authoritative; current manuscript may contain citation corruption.

## SECOND-AUDIT UPDATE (post additional verification)
- Unverifiable refs **REMOVED** from the proposed set (identity not established from authoritative source): `gupta2022zkp`, `arora2022sok`, `chen2023cert`. Not replaced with guessed metadata.
- Verified works **ADDED**: `szalachowski2020smartcert` (arXiv, preprint), `zhao2021nftcert` (IEEE Blockchain 2021), `krishnan2025dairy` (Systems 13(1):65), `zkbarv2025` (Sensors 25(11):3450).
- Final prior-work count = **7** (W1–W7), excluding "This work". Optional 8th = `poornima2024academic` (review).
- **Novelty claims** L108 ("first work") and L110 ("no study") audited in `NOVELTY_CLAIM_AUDIT.md` → both NOT supportable; bounded wording proposed.
- See rebuilt `STEP5_LITERATURE_EVIDENCE_MATRIX.md` (15-column, cell-level).

## A. Citation corruption found (narrative ↔ citation key ↔ actual paper)

| Narrative statement (CC.tex Related Work) | Current key | Actual paper (verified) | Match? | Action |
|---|---|---|---|---|
| "Srivastava et al. proposed **SmartCert**, an Ethereum-based framework enabling **educational institutions** to issue verifiable digital credentials" (L98) | `cheng2018blockchain` | Cheng, Lee, Chi, Chen, "Blockchain and smart contract for digital certificate systems," ICASI 2018 (hash+QR certificate). **AND** the real SmartCert = Szalachowski, arXiv:2003.13259, a **TLS/PKI** work. | ❌ triple mismatch (author, system name, domain) | CORRECT narrative + re-map |
| "Singh and Yadav introduced **NFTCert**, which integrates NFT-based credentials with **online payments for e-commerce**" (L98) | `hawashin2024blockchain` | Real NFTCert = **Zhao & Si**, IEEE Blockchain 2021 (academic certificates, payment gateway). `hawashin2024blockchain` = Hawashin et al., **UAV parts** traceability, JIII 2024. | ❌ wrong authors, wrong key, wrong domain | REPLACE citation (add NFTCert Zhao&Si) + retain Hawashin as separate work |
| "Poojitha et al. presented a decentralized platform where students manage/share academic achievements as NFTs" (L98) | `poornima2024academic` | Poornima, "Academic certificate authenticity using blockchain: **A review**," IJRASET 2024. It is a **review**, not a student NFT platform; author is Poornima not "Poojitha". | ❌ author + work-type mismatch | CORRECT description (label as review) or REPLACE |
| "SmartCert / educational" narrative overall | mixed | — | ❌ | Rebuild §2 on verified facts |

## B. Per-reference classification (current CC.bib entries used in §2)

| Key | Real identity (verified) | Class | Note |
|---|---|---|---|
| `bangnikrai2022blockchain` | Bangnikrai & Prayote, NFTCowCert V1, RI2C 2022, DOI 10.1109/RI2C56397.2022.9910295 | **correct (self/prior work)** | keep; V1 baseline |
| `cheng2018blockchain` | Cheng et al., ICASI 2018 (hash+QR digital certificate) | **retain with corrected description** | NOT SmartCert; NOT educational-NFT |
| `hawashin2024blockchain` | Hawashin et al., UAV parts traceability+certification, JIII 2024, DOI 10.1016/j.jii.2024.100597 | **narrative mismatch** | NOT NFTCert; keep as UAV/manufacturing NFT traceability work |
| `poornima2024academic` | Poornima, review, IJRASET 2024 | **narrative mismatch** | it is a review, not a system |
| `polygon2024zkEVM`, `starkware2024starknet`, `zksync2022whitepaper`, `zksyncdocs2024`, `buterin2021roadmap` | vendor whitepapers/docs | **retain (grey literature)** | L2 platforms; label as whitepaper/docs, not peer-reviewed certificate systems |
| `merlo2025carbon`, `saraji2021carbon` | carbon-market blockchain (review / arXiv) | retain (context) | saraji = arXiv preprint |
| `gupta2022zkp` | "Survey on ZKP for Layer-2," IEEE Blockchain Lett. | **unverifiable metadata** | DOI 10.1109/BlockchainLetters.2022.314159 looks placeholder ("314159"); flag |
| `arora2022sok` | "A Systematic Review of Blockchain-Based Certificate Management Systems," IEEE Access 2022 | **unverified** | could not confirm DOI/pages from source; flag before use |
| `chen2023cert` | "Blockchain-Based Digital Certificate Authentication System," Computers & Security 2023 | **unverified** | could not confirm vol/pages/DOI from source; flag before use |
| `chaliasos2024snarkvulns`, `malavolta2024modular`, `l2beat2024zk` | SNARK security / DA / L2 stats | retain (discussion) | not certificate systems |
| `xu2019architecture`, `walpole2012statistics` | textbooks | retain (method/background) | — |

## C. New verified works to ADD (for a proper comparison set)
1. **SmartCert** — Szalachowski, "SmartCert: Redesigning Digital Certificates with Smart Contracts," arXiv:2003.13259, 2020 (**preprint**; TLS/PKI). VERIFIED via arXiv abstract.
2. **NFTCert** — Zhao & Si, "NFTCert: NFT-Based Certificates With Online Payment Gateway," IEEE Int. Conf. Blockchain 2021, Melbourne, pp. 221–228 (also arXiv:2202.09511). VERIFIED via arXiv + UvA camera-ready.

## D. Unresolved (do NOT use until verified)
- `gupta2022zkp` DOI appears placeholder ("...314159").
- `arora2022sok` and `chen2023cert` metadata not confirmed from an authoritative source in this pass.
- These are flagged in the evidence matrix as "Not established from verified source".
