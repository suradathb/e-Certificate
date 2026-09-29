# NOVELTY CLAIM AUDIT — STEP 5

> Purpose: audit the manuscript's absolute novelty claims against verified literature. No CC.tex edit yet.
> Rule: failure to find a paper ≠ proof none exists. Replace absolute wording unless a systematic search justifies it.

## Manuscript claims audited (verbatim locations in current CC.tex)
1. L108: "To the best of our knowledge, this is the **first work** to design and empirically benchmark an NFT-based certification system using zkSync Era for agricultural pedigree management."
2. L110: "To date, **no study has empirically benchmarked** NFT-based certification systems across L1 and L2 environments."

## Audit table

| # | Current claim | Search scope | Evidence found (verified) | Supportable? | Recommended wording |
|---|---|---|---|---|---|
| 1 | "first work … NFT-based certification on **zkSync Era** for **agricultural pedigree**" | "NFT certificate Layer-2 zkSync", "livestock cattle pedigree blockchain NFT L2", "certificate zkRollup" | **Krishnan & Ganesan (2025)**, *Integrated Dairy Production and Cattle Healthcare Management Using Blockchain NFTs and Smart Contracts*, Systems 13(1):65, DOI 10.3390/systems13010065 — uses **NFTs as digital certificates for cattle** on **ZK-Rollup Layer-2**, with performance evaluation (TPS, gas, finality). Domain = cattle healthcare (not pedigree), platform = generic ZK-Rollup (not specifically zkSync Era). | **Partial only.** The *specific* combination (zkSync Era + pedigree) may still be narrowly distinct, but the broad "first NFT certificate on L2 for livestock" is **not** defensible. | "Among the reviewed works, we found **limited** prior empirical evaluation of NFT-based *pedigree* certification specifically on the zkSync Era validity rollup; the closest prior work applies NFTs as cattle health certificates on a ZK-rollup Layer-2 [Krishnan2025]." |
| 2 | "no study has empirically benchmarked NFT-based certification across **L1 and L2**" | "certificate L1 L2 benchmark", "NFT credential rollup", "academic certificate Layer-2", "zk-rollup implementation evaluation" | **ZKBAR-V (2025)**, MDPI Sensors 25(11):3450, DOI 10.3390/s25113450 — academic credentials on **zkEVM L2 + IPFS + DID**, reports cost reduction **vs Ethereum mainnet** (i.e., an L1↔L2 cost comparison). Also *An Implementation and Evaluation of Layer 2 for Ethereum with zk-Rollup* (2023) benchmarks L2 gas vs batch size. | **No** — an absolute "no study" claim is refuted; credential/certificate L1-vs-L2 cost comparisons exist. | "We found **limited** prior work that empirically benchmarks *NFT-based pedigree* certification across L1 and L2; existing L1–L2 comparisons focus on academic credentials [ZKBAR-V] or general rollup cost models." |

## Verified works relevant to novelty (added to matrix)
- Krishnan & Ganesan (2025), Systems 13(1):65 — livestock/cattle NFT certificates on ZK-Rollup L2. VERIFIED (MDPI page fetched).
- ZKBAR-V (2025), Sensors 25(11):3450 — academic credential verification on zkEVM L2 + IPFS + DID. VERIFIED (MDPI page fetched).

## Conclusion
Both absolute claims (L108 "first work", L110 "no study") are **not supportable** as written. Recommended replacement uses bounded language ("we found limited prior empirical evaluation …", "among the reviewed works …"). Final wording to be applied to CC.tex only in the write phase, after the second audit passes. Novelty can be re-scoped to the *specific* combination NFTCowCert V2 targets: formal reversible-suspension lifecycle + φ binding + zkSync Era pedigree evaluation + public artifact — stated conservatively.
