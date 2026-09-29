# STEP 4 — REVIEWER RESPONSE DRAFT (claim calibration: domain / generalization)

Covers **R1-06, R1-20, R1-26, R2-02**. All edits are in `CC.tex` (authoritative). No code/experiment change.

Evidence boundary used throughout:
- **Experimentally evaluated:** livestock pedigree only.
- **Conceptual adaptation only:** academic credentials, professional licenses.
- **Not established:** cross-domain empirical generalizability.

---

## R1-06 — "Provide technical justification for the domain-agnostic claim."
### Reviewer concern
The domain-agnostic claim was asserted without technical justification or scope limits.
### Revision performed
Reframed the claim as **domain-extensible architecture** / **domain-independent lifecycle abstraction** (an architectural property), and added concrete conceptual mappings for livestock, academic credential, and professional license.
### Evidence boundary
Only livestock is implemented/evaluated. The adaptation table is explicitly labeled conceptual.
### Scope clarification
Cross-domain applicability = architectural extension + future work, not an experimental result.
### CC.tex locations
Abstract L47; Introduction L63, L67, L71; Framework §3 L115; L_semantic item L171; Conceptual adaptation tables (Discussion §6.5) L495–L523.

---

## R1-20 — "Testnet use and generalizability are not adequately discussed."
### Reviewer concern
Generalizability (and testnet scope) overstated / under-discussed.
### Revision performed
Strengthened Limitations to state cross-domain generalizability cannot be established, and enumerated what differs across domains (lifecycle rules, authorization/governance, metadata, suspension/revocation semantics).
### Evidence boundary
Livestock pedigree, evaluated conditions only.
### Scope clarification
Other domains → future validation.
### CC.tex locations
Limitations L482; Discussion §6.5 L489 (blueprint reusable "in principle", cross-domain assessment = future work).

---

## R1-26 — "Testnet results are generalized into absolute performance claims."
### Reviewer concern
Results generalized beyond the evaluated scope.
### Revision performed
Kept performance numbers tied to the evaluated conditions and removed language implying validated cross-domain deployment (e.g. "real-world deployment across multiple domains" → "empirically evaluated Layer-2 deployment, demonstrated here for the livestock pedigree domain").
### Evidence boundary
Livestock pedigree; evaluated testnet workloads.
### Scope clarification
No absolute/production or cross-domain performance is claimed.
### CC.tex locations
Introduction contributions L71; Implications L489.

---

## R2-02 — "Domain-agnostic claims are broader than the evidence."
### Reviewer concern
Domain-agnostic wording exceeds the livestock-only evidence.
### Revision performed
Replaced "domain-agnostic" with "domain-extensible/independent" at the architectural level throughout; added the conceptual adaptation table with an explicit label that the non-livestock columns are not implementations or validations; separated the revocation row as a non-evaluated framework extension.
### Evidence boundary
Livestock evaluated; academic/professional conceptual only.
### Scope clarification
Consistent evidence boundary across Abstract, Introduction, Framework, Discussion, Limitations, Conclusion.
### CC.tex locations
Abstract L47; Intro L63/L67; §3 L115/L171; Limitations L482; Conclusion L502; adaptation tables L495–L523.

---

## Terminology policy applied
Preferred: *domain-extensible architectural framework*, *domain-independent lifecycle abstraction*, *livestock pedigree case study*, *conceptual adaptation*, *cross-domain empirical validation remains future work*.
Removed/restricted: *domain-agnostic* (removed from all narrative claims), *validated across domains*, *inherently cross-domain*, *real-world deployment across multiple domains*.
