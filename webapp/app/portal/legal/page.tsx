"use client";

import { useState } from "react";
import { Scale, AlertTriangle, Copy, Download, CheckCircle2, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";

interface LetterTemplate {
  id: string;
  category: "FDCPA" | "FCRA" | "CFPB";
  label: string;
  statutes: string[];
  power: "medium" | "strong" | "nuclear";
  desc: string;
}

const TEMPLATES: LetterTemplate[] = [
  {
    id: "fdcpa_debt_validation",
    category: "FDCPA",
    label: "Debt Validation Demand",
    statutes: ["15 U.S.C. § 1692g"],
    power: "strong",
    desc: "Forces collector to prove the debt is valid and they have the right to collect.",
  },
  {
    id: "fdcpa_cease_desist",
    category: "FDCPA",
    label: "Cease & Desist Letter",
    statutes: ["15 U.S.C. § 1692c(c)"],
    power: "strong",
    desc: "Commands all collection contact to stop immediately upon receipt.",
  },
  {
    id: "fdcpa_intent_to_sue",
    category: "FDCPA",
    label: "Intent to Sue Notice",
    statutes: ["15 U.S.C. § 1692k"],
    power: "nuclear",
    desc: "Notice of intent to file a § 1692k lawsuit for $1,000 statutory damages per violation.",
  },
  {
    id: "fdcpa_false_representation",
    category: "FDCPA",
    label: "False Representation Demand",
    statutes: ["15 U.S.C. § 1692e"],
    power: "strong",
    desc: "Challenges false, deceptive, or misleading collection communications.",
  },
  {
    id: "fdcpa_time_barred",
    category: "FDCPA",
    label: "Time-Barred Debt Demand",
    statutes: ["15 U.S.C. § 1692e", "15 U.S.C. § 1692f"],
    power: "strong",
    desc: "Asserts the statute of limitations has expired and suing would be an FDCPA violation.",
  },
  {
    id: "fcra_method_verification",
    category: "FCRA",
    label: "Method of Verification Demand",
    statutes: ["15 U.S.C. § 1681i(a)(7)"],
    power: "strong",
    desc: "Demands the bureau disclose the method used to verify a disputed item.",
  },
  {
    id: "fcra_willful_noncompliance",
    category: "FCRA",
    label: "§ 1681n Willful Noncompliance",
    statutes: ["15 U.S.C. § 1681n"],
    power: "nuclear",
    desc: "Asserts willful FCRA noncompliance — actual + punitive damages + attorney fees.",
  },
  {
    id: "fcra_furnisher_escalation",
    category: "FCRA",
    label: "Furnisher Direct Escalation",
    statutes: ["15 U.S.C. § 1681s-2(b)"],
    power: "strong",
    desc: "Sends dispute directly to the data furnisher after bureau failure to correct.",
  },
  {
    id: "fcra_identity_theft_block",
    category: "FCRA",
    label: "Identity Theft Block Demand",
    statutes: ["15 U.S.C. § 1681c-2"],
    power: "nuclear",
    desc: "Demands immediate block of fraudulent information under the identity theft provisions.",
  },
  {
    id: "cfpb_complaint_followup",
    category: "CFPB",
    label: "CFPB Complaint Follow-Up",
    statutes: ["12 U.S.C. § 5511", "15 U.S.C. § 1681s"],
    power: "medium",
    desc: "References CFPB complaint number and demands resolution citing regulatory authority.",
  },
];

const POWER_CONFIG = {
  medium:  { label: "Medium",  cls: "badge-blue",   warn: null },
  strong:  { label: "Strong",  cls: "badge-amber",  warn: null },
  nuclear: { label: "Nuclear", cls: "badge-red",    warn: "This is a pre-litigation demand. Only send if you have documented violations." },
};

function generateLetter(id: string, form: FormFields): string {
  const today = new Date().toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" });
  const header = `${form.senderName}
${form.senderAddress}
${form.senderCityStateZip}

${today}

${form.recipientName}
${form.recipientAddress}

RE: ${form.caseRef ? `Case Reference: ${form.caseRef} — ` : ""}${form.accountRef ? `Account: ${form.accountRef}` : ""}
Via Certified Mail, Return Receipt Requested

`;

  const sig = `

Sincerely,

${form.senderName}

NOTICE: This letter is sent pursuant to federal law. All violations are documented and preserved for potential litigation. This letter constitutes written notice.`;

  const vio = form.violationDesc ? `\n\nSpecific violation(s): ${form.violationDesc}` : "";

  switch (id) {
    case "fdcpa_debt_validation":
      return header + `To Whom It May Concern:

This letter is your formal notice that I dispute the alleged debt referenced above and demand validation pursuant to the Fair Debt Collection Practices Act, 15 U.S.C. § 1692g.

Pursuant to § 1692g(b), you are required to cease all collection activity until you provide:
1. The amount of the alleged debt;
2. The name and address of the original creditor;
3. Verification or a copy of a judgment;
4. Proof that your agency is licensed to collect debts in my state.${vio}

You have thirty (30) days from receipt of this letter to provide validation. Failure to validate while continuing collection efforts constitutes a willful violation of the FDCPA, exposing you to liability for actual damages, $1,000 statutory damages per violation, and attorney fees under § 1692k.

Case law: Jerman v. Carlisle (2010), 559 U.S. 573 — ignorance of the law is no defense.` + sig;

    case "fdcpa_cease_desist":
      return header + `To Whom It May Concern:

Pursuant to my rights under the Fair Debt Collection Practices Act, 15 U.S.C. § 1692c(c), I hereby demand that you CEASE AND DESIST all collection activity and all communication with me regarding the referenced account, effective immediately upon your receipt of this letter.${vio}

Under § 1692c(c), after receipt of this notice you may only contact me to:
• Advise that collection efforts are being terminated;
• Notify me of specific remedies you may invoke.

Any further contact beyond what is permitted by § 1692c(c) will constitute a willful violation of the FDCPA and will be reported to the CFPB, FTC, and state attorney general, and will form the basis of a civil action under § 1692k.

This letter is your final notice. Govern yourself accordingly.` + sig;

    case "fdcpa_intent_to_sue":
      return header + `NOTICE OF INTENT TO FILE SUIT — FDCPA VIOLATION

To Whom It May Concern:

This letter constitutes formal notice of my intent to file suit against your organization in federal court pursuant to the Fair Debt Collection Practices Act, 15 U.S.C. § 1692k.${vio}

Your conduct constitutes one or more violations of the FDCPA. Under § 1692k, I am entitled to:
• Actual damages sustained as a result of your violations;
• Statutory damages of $1,000 per violation;
• Attorney fees and costs upon successful litigation.

Relevant precedent: Crawford v. LVNV Funding, LLC, 758 F.3d 1254 (11th Cir. 2014) — FDCPA applies regardless of the validity of the underlying debt.

You have fifteen (15) days from receipt of this letter to resolve this matter or I will file suit without further notice.` + sig;

    case "fdcpa_false_representation":
      return header + `To Whom It May Concern:

I write to demand that you immediately correct the false, deceptive, and misleading representations your organization has made in connection with the collection of the referenced account, in violation of 15 U.S.C. § 1692e.${vio}

Section 1692e prohibits any false, deceptive, or misleading representation in connection with the collection of a debt, including:
• False representations about the character, amount, or legal status of the debt (§ 1692e(2));
• False representation that you are an attorney (§ 1692e(3));
• Threats to take actions that cannot legally be taken (§ 1692e(5)).

Each false representation constitutes a separate violation under the FDCPA. I have documented these violations and will pursue statutory damages of $1,000 per violation under § 1692k if not corrected immediately.` + sig;

    case "fdcpa_time_barred":
      return header + `To Whom It May Concern:

Please be advised that the alleged debt referenced above is TIME-BARRED and collection activity, including threats of litigation, constitutes a violation of the Fair Debt Collection Practices Act.${vio}

The statute of limitations applicable to this debt has expired. Threatening to sue or suing on a time-barred debt violates:
• 15 U.S.C. § 1692e (false and misleading representations);
• 15 U.S.C. § 1692f (unfair or unconscionable means).

Relevant precedent: Kimber v. Federal Financial Corp., 668 F. Supp. 1480 (M.D. Ala. 1987); Crawford v. LVNV Funding, 758 F.3d 1254 (11th Cir. 2014).

You are hereby notified to cease all collection activity on this time-barred account. Any further collection attempts will be reported to the CFPB and will form the basis of litigation.` + sig;

    case "fcra_method_verification":
      return header + `To Whom It May Concern:

Pursuant to the Fair Credit Reporting Act, 15 U.S.C. § 1681i(a)(7), I hereby request the complete description of the method of verification you used to verify the disputed item(s) referenced above.${vio}

Under § 1681i(a)(7), upon my request following your reinvestigation, you are required to provide me with:
• A description of the procedure used to determine accuracy;
• The name, business address, and telephone number of any furnisher contacted.

Your failure to conduct a reasonable reinvestigation violates § 1681i. Relevant case law: Gorman v. Wolpoff & Abramson, LLP, 584 F.3d 1147 (9th Cir. 2009) — bureaus must conduct a reasonable reinvestigation.

Please provide the requested information within 15 days. Failure to comply will result in a complaint filed with the CFPB and potential civil action under § 1681n (willful) or § 1681o (negligent).` + sig;

    case "fcra_willful_noncompliance":
      return header + `NOTICE OF WILLFUL FCRA NONCOMPLIANCE — DEMAND FOR IMMEDIATE REMEDY

To Whom It May Concern:

This letter serves as formal notice that your organization has willfully violated the Fair Credit Reporting Act, 15 U.S.C. § 1681n.${vio}

Under § 1681n, any consumer reporting agency or person who willfully fails to comply with the FCRA is liable for:
• Actual damages or statutory damages of $100–$1,000 per violation;
• Punitive damages as the court deems appropriate;
• Attorney fees and costs.

Relevant precedent: Safeco Insurance Co. of America v. Burr, 551 U.S. 47 (2007) — "willful" includes reckless disregard of FCRA requirements; Trans Union Corp. v. FTC, 245 F.3d 809 (D.C. Cir. 2001).

You have ten (10) days to remedy the violations identified herein and provide written confirmation of the correction. Failure to do so will result in the filing of a civil action in federal district court seeking the full measure of statutory, actual, and punitive damages.` + sig;

    case "fcra_furnisher_escalation":
      return header + `To Whom It May Concern:

This letter constitutes my formal dispute directly to you as a data furnisher pursuant to the Fair Credit Reporting Act, 15 U.S.C. § 1681s-2(b).${vio}

The credit bureaus have failed to correct or delete the inaccurate information you are furnishing regarding the referenced account. Under § 1681s-2(b), upon receiving notice of a consumer dispute, you are required to:
1. Conduct a reasonable investigation with respect to the disputed information;
2. Review all relevant information provided;
3. Report the results to the applicable consumer reporting agency;
4. Delete or modify information you cannot verify.

Your failure to comply constitutes a violation of § 1681s-2(b). Relevant case law: Drew v. Equifax Information Services, 690 F.3d 1100 (9th Cir. 2012) — furnishers have independent obligation to investigate.

Demand: Correct or delete the inaccurate tradeline within 30 days and provide written confirmation.` + sig;

    case "fcra_identity_theft_block":
      return header + `DEMAND FOR IMMEDIATE BLOCK — IDENTITY THEFT

To Whom It May Concern:

Pursuant to the Fair Credit Reporting Act, 15 U.S.C. § 1681c-2, I hereby demand the IMMEDIATE BLOCK of all information in my consumer file that resulted from identity theft.${vio}

Under § 1681c-2, you are required to block the reporting of information you have been notified is a result of identity theft, not later than four (4) business days after receiving:
1. Appropriate proof of my identity;
2. A copy of an identity theft report;
3. The identification of information resulting from identity theft.

I have enclosed/will provide the required documentation. Any failure to block the fraudulent information within the statutory timeframe constitutes a willful violation of § 1681n, subjecting you to statutory damages, punitive damages, and attorney fees.

This matter will be escalated to the FTC and CFPB if not resolved within 4 business days.` + sig;

    case "cfpb_complaint_followup":
      return header + `To Whom It May Concern:

This letter is a follow-up to CFPB Complaint ${form.caseRef || "[CFPB-COMPLAINT-NUMBER]"} filed against your organization regarding the violations referenced above.${vio}

The CFPB has broad authority under 12 U.S.C. § 5511 to supervise and enforce federal consumer financial laws. The Bureau has the authority to impose civil money penalties and order remediation.

Additionally, the FCRA grants the CFPB concurrent enforcement authority under 15 U.S.C. § 1681s, including the power to:
• Conduct examinations of consumer reporting agencies;
• Issue subpoenas;
• Seek civil monetary penalties.

My complaint has not been adequately resolved. I demand a written response addressing each violation within 30 days, or I will escalate to the FTC, state attorney general, and retain private counsel.` + sig;

    default:
      return "Template not found.";
  }
}

interface FormFields {
  senderName: string;
  senderAddress: string;
  senderCityStateZip: string;
  recipientName: string;
  recipientAddress: string;
  caseRef: string;
  accountRef: string;
  violationDesc: string;
}

export default function LegalLettersPage() {
  const [selected, setSelected] = useState<LetterTemplate | null>(null);
  const [form, setForm] = useState<FormFields>({
    senderName: "", senderAddress: "", senderCityStateZip: "",
    recipientName: "", recipientAddress: "",
    caseRef: "", accountRef: "", violationDesc: "",
  });
  const [generatedLetter, setGeneratedLetter] = useState("");
  const [copied, setCopied] = useState(false);
  const [activeCategory, setActiveCategory] = useState<"FDCPA" | "FCRA" | "CFPB" | "all">("all");

  const categories = ["all", "FDCPA", "FCRA", "CFPB"] as const;

  const filteredTemplates = TEMPLATES.filter(
    (t) => activeCategory === "all" || t.category === activeCategory
  );

  function handleGenerate() {
    if (!selected) return;
    setGeneratedLetter(generateLetter(selected.id, form));
  }

  async function handleCopy() {
    await navigator.clipboard.writeText(generatedLetter);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  function handleDownload() {
    const blob = new Blob([generatedLetter], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${selected?.id ?? "legal-letter"}-${Date.now()}.txt`;
    a.click();
    URL.revokeObjectURL(url);
  }

  return (
    <div className="p-8 space-y-6">
      <div>
        <p className="section-label mb-1">Legal Tools</p>
        <h1 className="text-2xl font-bold text-white">Legal Letter Generator</h1>
        <p className="text-slate-400 text-sm mt-1">FDCPA &amp; FCRA demand letters grounded in real statutes and landmark case law</p>
      </div>

      {/* Legal disclaimer */}
      <div className="card p-4 border-brand-gold/10 bg-brand-gold/5 flex items-start gap-3">
        <Scale className="w-5 h-5 text-brand-gold flex-shrink-0 mt-0.5" />
        <p className="text-xs text-slate-400 leading-relaxed">
          These letters are provided for educational purposes. Williams Equity Capital is a licensed credit repair organization (CROA), not a law firm. These letters do not constitute legal advice. For litigation, retain a licensed consumer rights attorney.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Template selector */}
        <div className="space-y-4">
          {/* Category filter */}
          <div className="flex gap-1.5 flex-wrap">
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setActiveCategory(cat)}
                className={cn(
                  "px-3 py-1.5 rounded-lg text-xs font-medium transition-all",
                  activeCategory === cat
                    ? "bg-brand-gold text-brand-navy"
                    : "bg-surface-2 text-slate-400 hover:text-white"
                )}
              >
                {cat === "all" ? "All" : cat}
              </button>
            ))}
          </div>

          {/* Templates */}
          <div className="space-y-2">
            {filteredTemplates.map((t) => {
              const pc = POWER_CONFIG[t.power];
              const isSelected = selected?.id === t.id;
              return (
                <button
                  key={t.id}
                  onClick={() => { setSelected(t); setGeneratedLetter(""); }}
                  className={cn(
                    "w-full text-left p-4 rounded-xl border transition-all",
                    isSelected
                      ? "bg-brand-gold/10 border-brand-gold/30"
                      : "bg-surface-1 border-white/[0.06] hover:border-white/20 hover:bg-surface-2"
                  )}
                >
                  <div className="flex items-start justify-between gap-2 mb-1">
                    <span className="text-sm font-medium text-white">{t.label}</span>
                    <span className={pc.cls}>{pc.label}</span>
                  </div>
                  <div className="text-xs text-slate-500 mb-1.5">{t.desc}</div>
                  <div className="flex flex-wrap gap-1">
                    {t.statutes.map((s) => (
                      <span key={s} className="text-[10px] bg-surface-3 text-slate-400 rounded px-1.5 py-0.5 font-mono">{s}</span>
                    ))}
                  </div>
                  {isSelected && <ChevronRight className="w-3.5 h-3.5 text-brand-gold mt-2 ml-auto" />}
                </button>
              );
            })}
          </div>
        </div>

        {/* Form + preview */}
        <div className="lg:col-span-2 space-y-4">
          {!selected ? (
            <div className="card p-10 text-center h-full flex flex-col items-center justify-center">
              <Scale className="w-10 h-10 text-slate-600 mb-3" />
              <p className="text-slate-400 text-sm">Select a letter type from the left to get started</p>
            </div>
          ) : (
            <>
              {/* Nuclear warning */}
              {POWER_CONFIG[selected.power].warn && (
                <div className="card p-4 border-status-cancelled/20 bg-status-cancelled/5 flex items-start gap-3">
                  <AlertTriangle className="w-4 h-4 text-status-cancelled flex-shrink-0 mt-0.5" />
                  <p className="text-xs text-slate-400">{POWER_CONFIG[selected.power].warn}</p>
                </div>
              )}

              {/* Form */}
              <div className="card p-6 space-y-4">
                <h2 className="font-semibold text-white">Your Information</h2>
                <div className="grid grid-cols-2 gap-3">
                  <div className="col-span-2">
                    <label className="block text-xs text-slate-400 mb-1">Full Name</label>
                    <input value={form.senderName} onChange={(e) => setForm({ ...form, senderName: e.target.value })}
                      placeholder="Your full legal name" />
                  </div>
                  <div className="col-span-2">
                    <label className="block text-xs text-slate-400 mb-1">Street Address</label>
                    <input value={form.senderAddress} onChange={(e) => setForm({ ...form, senderAddress: e.target.value })}
                      placeholder="123 Main St" />
                  </div>
                  <div className="col-span-2">
                    <label className="block text-xs text-slate-400 mb-1">City, State ZIP</label>
                    <input value={form.senderCityStateZip} onChange={(e) => setForm({ ...form, senderCityStateZip: e.target.value })}
                      placeholder="Atlanta, GA 30301" />
                  </div>
                </div>

                <h2 className="font-semibold text-white pt-2">Recipient</h2>
                <div className="grid grid-cols-2 gap-3">
                  <div className="col-span-2">
                    <label className="block text-xs text-slate-400 mb-1">Recipient Name / Company</label>
                    <input value={form.recipientName} onChange={(e) => setForm({ ...form, recipientName: e.target.value })}
                      placeholder="Debt collector or credit bureau name" />
                  </div>
                  <div className="col-span-2">
                    <label className="block text-xs text-slate-400 mb-1">Recipient Address</label>
                    <input value={form.recipientAddress} onChange={(e) => setForm({ ...form, recipientAddress: e.target.value })}
                      placeholder="Full mailing address" />
                  </div>
                </div>

                <h2 className="font-semibold text-white pt-2">Case Details</h2>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs text-slate-400 mb-1">Case / Complaint Ref</label>
                    <input value={form.caseRef} onChange={(e) => setForm({ ...form, caseRef: e.target.value })}
                      placeholder="WEC-XXXX or CFPB-XXXX" />
                  </div>
                  <div>
                    <label className="block text-xs text-slate-400 mb-1">Account Reference</label>
                    <input value={form.accountRef} onChange={(e) => setForm({ ...form, accountRef: e.target.value })}
                      placeholder="Account # or creditor name" />
                  </div>
                  <div className="col-span-2">
                    <label className="block text-xs text-slate-400 mb-1">Describe the Specific Violation(s)</label>
                    <textarea value={form.violationDesc} onChange={(e) => setForm({ ...form, violationDesc: e.target.value })}
                      rows={3} placeholder="e.g. Collector called 9 times on June 3, 2026 before 8am, violating § 1692c(a)(1)..."
                      className="resize-none" />
                  </div>
                </div>

                <button onClick={handleGenerate} className="btn-gold w-full justify-center">
                  Generate {selected.label}
                </button>
              </div>

              {/* Generated letter */}
              {generatedLetter && (
                <div className="card p-6 space-y-4">
                  <div className="flex items-center justify-between">
                    <h2 className="font-semibold text-white">Generated Letter</h2>
                    <div className="flex gap-2">
                      <button onClick={handleCopy} className="btn-ghost text-xs">
                        {copied ? <><CheckCircle2 className="w-3.5 h-3.5" /> Copied</> : <><Copy className="w-3.5 h-3.5" /> Copy</>}
                      </button>
                      <button onClick={handleDownload} className="btn-ghost text-xs">
                        <Download className="w-3.5 h-3.5" /> Download .txt
                      </button>
                    </div>
                  </div>
                  <pre className="bg-surface-2 rounded-xl p-4 text-xs text-slate-300 whitespace-pre-wrap font-mono leading-relaxed overflow-x-auto max-h-96 overflow-y-auto border border-white/[0.05]">
                    {generatedLetter}
                  </pre>
                  <div className="p-3 rounded-xl bg-surface-3 border border-white/[0.05]">
                    <p className="text-xs text-slate-500 leading-relaxed">
                      <strong className="text-slate-400">Next steps:</strong> Print this letter, sign it, and send via USPS Certified Mail with Return Receipt Requested (green card). Keep the tracking number and green card as proof of delivery. This is essential for your records if litigation becomes necessary.
                    </p>
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}
