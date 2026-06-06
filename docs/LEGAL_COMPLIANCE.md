# WEC Credit Repair App — Legal Compliance Specification

## CROA Required Disclosures (15 U.S.C. § 1679c)

The following disclosure MUST appear:
- On the onboarding screen before any user action
- In the header of every AI-generated dispute letter
- In the footer of every app screen

### Required disclosure text (do not modify):
> "Williams Equity Capital is not a law firm and does not provide legal advice.
> We help you understand your rights under federal consumer protection law and
> draft dispute correspondence based on those rights. You have the right to
> dispute inaccurate information on your credit report yourself, for free, by
> contacting the credit bureaus directly. Using a credit repair organization
> like Williams Equity Capital does not improve your legal standing. Under the
> Credit Repair Organizations Act (15 U.S.C. § 1679), you have the right to
> cancel this service within 3 business days without penalty."

---

## AI Content Guardrails

All Claude-generated content must comply with these rules. Enforced in the system prompt AND validated by `lib/dispute-engine/content-filter.ts`.

### Hard rules (never violate):
1. Never tell a user to pay or not pay any specific debt
2. Never state a negative item "will be" removed — use "may be disputable under §..."
3. Always cite the specific statute for every recommendation
4. Never recommend a specific legal action (filing suit, hiring attorney for X purpose)
5. Never generate output that could constitute practicing law in any jurisdiction

### Required language in every AI output:
> "This is for educational purposes only and is not legal advice."

### Escalation trigger phrases (content filter must catch all):
If user input contains any of these — respond with the escalation template, do not generate dispute content:
- "should I sue"
- "take them to court"
- "legal action against"
- "FDCPA lawsuit"
- "file a lawsuit"
- "sue the bureau"
- "attorney for my case"
- "file in small claims"

### Escalation response template:
> "This question involves specific legal strategy that requires a licensed attorney.
> I can explain your rights under the FDCPA, but I'm not able to advise you on
> whether or how to pursue legal action."

### Banned phrases in AI output (content filter scans all generated text):
- "will be removed"
- "guaranteed to"
- "your debt is invalid"
- "stop paying"
- "don't pay"
- "you should pay"
- "pay this debt"
- "file a lawsuit"
- "take legal action"
- "hire a lawyer to sue"

---

## Dispute Strategy Matrix

| Negative Item Type | Primary Strategy | Governing Law | Letter Template |
|---|---|---|---|
| Late payment | Goodwill adjustment + verification request | FCRA § 1681i | templates/late-payment.md |
| Collections account | Debt validation + cease communication | FDCPA § 1692g, FCRA § 1681s-2 | templates/collections.md |
| Unauthorized hard inquiry | Permissible purpose dispute | FCRA § 1681b | templates/hard-inquiry.md |
| Charge-off | Obsolescence audit + accuracy dispute | FCRA § 1681c | templates/charge-off.md |
| Bankruptcy | Re-aging check + reporting period audit | FCRA § 1681c(a)(1) | templates/bankruptcy.md |
| Medical debt | CFPB medical debt rules + accuracy dispute | CFPB 2023 guidance, FCRA § 1681i | templates/medical-debt.md |

---

## Dispute Round Legal Framework

| Round | Legal Basis | Strategy |
|---|---|---|
| Round 1 | FCRA § 1681i(a)(1) | Factual inaccuracy dispute — request investigation within 30 days |
| Round 2 | FCRA § 1681i(a)(7) | Method of verification demand — require proof of procedure used |
| Round 3 | FCRA § 1681n | Willful non-compliance notice — pre-litigation, attorney referral |

---

## Bureau Mailing Addresses (for letter dispatch via Lob)

**Equifax Information Services LLC**
P.O. Box 740256
Atlanta, GA 30374-0256

**Experian**
P.O. Box 4500
Allen, TX 75013

**TransUnion LLC Consumer Dispute Center**
P.O. Box 2000
Chester, PA 19016

---

## CROA Statutory Reference (15 U.S.C. § 1679)

Key provisions enforced in this application:

- **§ 1679b** — Prohibited practices: no upfront fees, no false representations
- **§ 1679c** — Required disclosures: must be provided in writing before any contract
- **§ 1679d** — Written contract required with right to cancel
- **§ 1679e** — Right to cancel within 3 business days (enforced by WF00 cooling-off period)
- **§ 1679f** — Noncompliance: civil liability to the consumer

---

## FCRA Key Sections Referenced

- **§ 1681b** — Permissible purposes for consumer reports
- **§ 1681c** — Requirements relating to information contained in consumer reports (7-year / 10-year reporting limits)
- **§ 1681e** — Compliance procedures
- **§ 1681i** — Procedure in case of disputed accuracy (30-day reinvestigation requirement)
- **§ 1681i(a)(5)** — Treatment of inaccurate or unverifiable information
- **§ 1681i(a)(7)** — Description of reinvestigation procedure
- **§ 1681n** — Civil liability for willful noncompliance
- **§ 1681o** — Civil liability for negligent noncompliance
- **§ 1681s-2** — Responsibilities of furnishers of information

---

## FDCPA Key Sections Referenced

- **§ 1692e** — False or misleading representations
- **§ 1692f** — Unfair practices
- **§ 1692g** — Validation of debts (30-day dispute window)
- **§ 1692g(b)** — Cease collection during dispute period

---

## Landmark Cases (cite where applicable)

- **Gorman v. Wolpoff & Abramson, LLP**, 584 F.3d 1147 (9th Cir. 2009) — furnisher investigation standards under § 1681s-2
- **Safeco Insurance Co. v. Burr**, 551 U.S. 47 (2007) — "willful" standard for § 1681n liability
- **Drew v. Equifax Information Services**, 690 F.3d 1100 (9th Cir. 2012) — adequacy of reinvestigation

---

## Version History

| Version | Date | Change |
|---|---|---|
| 1.0 | 2026-06-06 | Initial compliance spec |
