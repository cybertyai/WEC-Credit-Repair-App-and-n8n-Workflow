"use client";

import { useState } from "react";
import Link from "next/link";

interface FormData {
  first_name: string;
  last_name: string;
  date_of_birth: string;
  ssn_last4: string;
  street: string;
  city: string;
  state: string;
  zip: string;
  email: string;
  phone: string;
  plan_tier: string;
  credit_data_source: string;
  consent_given: boolean;
  disclosure_acknowledged: boolean;
  croa_contract_signed: boolean;
}

const initialForm: FormData = {
  first_name: "",
  last_name: "",
  date_of_birth: "",
  ssn_last4: "",
  street: "",
  city: "",
  state: "",
  zip: "",
  email: "",
  phone: "",
  plan_tier: "standard",
  credit_data_source: "identityiq",
  consent_given: false,
  disclosure_acknowledged: false,
  croa_contract_signed: false,
};

export default function HomePage() {
  const [form, setForm] = useState<FormData>(initialForm);
  const [submitting, setSubmitting] = useState(false);
  const [caseId, setCaseId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  function handleChange(
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) {
    const target = e.target;
    if (target instanceof HTMLInputElement && target.type === "checkbox") {
      setForm((prev) => ({ ...prev, [target.name]: target.checked }));
    } else {
      setForm((prev) => ({ ...prev, [target.name]: target.value }));
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    setError(null);

    try {
      const webhookUrl = process.env.NEXT_PUBLIC_N8N_INTAKE_WEBHOOK!;
      const res = await fetch(webhookUrl, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });

      if (!res.ok) {
        throw new Error(`Submission failed (${res.status}). Please try again.`);
      }

      const data = await res.json().catch(() => ({}));
      const id: string =
        data?.case_id ??
        data?.id ??
        `CR-${Date.now().toString(36).toUpperCase()}`;
      setCaseId(id);
      setForm(initialForm);
    } catch (err: unknown) {
      setError(
        err instanceof Error ? err.message : "An unexpected error occurred."
      );
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="min-h-screen bg-white">
      <header className="bg-white border-b border-slate-200 sticky top-0 z-10">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 py-4 flex items-center justify-between">
          <span className="text-xl font-bold text-indigo-700 tracking-tight">
            Williams Equity Capital
          </span>
          <Link
            href="/login"
            className="text-sm font-medium text-slate-600 hover:text-indigo-700 transition-colors"
          >
            Client Login
          </Link>
        </div>
      </header>

      <section className="bg-gradient-to-br from-indigo-50 to-white py-16 px-4 text-center">
        <h1 className="text-4xl sm:text-5xl font-extrabold text-slate-900 mb-4">
          Start Repairing Your Credit Today
        </h1>
        <p className="text-lg text-slate-600 max-w-2xl mx-auto">
          Williams Equity Capital&apos;s professional credit repair program
          disputes inaccurate items on your behalf — fast, transparent, and
          effective.
        </p>
      </section>

      <main className="max-w-2xl mx-auto px-4 sm:px-6 py-12">
        {caseId ? (
          <div className="rounded-xl border border-green-200 bg-green-50 p-8 text-center">
            <div className="text-3xl mb-4">&#10003;</div>
            <h2 className="text-2xl font-bold text-green-800 mb-2">
              Application Received!
            </h2>
            <p className="text-green-700 mb-4">
              Your case ID is:{" "}
              <span className="font-mono font-bold">{caseId}</span>
            </p>
            <p className="text-slate-600">
              Check your email for next steps. Track your case in the{" "}
              <Link href="/login" className="text-indigo-600 underline">
                client portal
              </Link>
              .
            </p>
          </div>
        ) : (
          <form
            onSubmit={handleSubmit}
            className="space-y-6 bg-white rounded-xl border border-slate-200 shadow-sm p-6 sm:p-8"
          >
            <h2 className="text-2xl font-bold text-slate-900">
              Free Case Evaluation
            </h2>

            {error && (
              <div className="rounded-lg bg-red-50 border border-red-200 p-4 text-red-700 text-sm">
                {error}
              </div>
            )}

            <fieldset className="space-y-4">
              <legend className="text-sm font-semibold text-slate-500 uppercase tracking-wide">
                Personal Information
              </legend>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">
                    First Name <span className="text-red-500">*</span>
                  </label>
                  <input type="text" name="first_name" value={form.first_name} onChange={handleChange} required
                    className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">
                    Last Name <span className="text-red-500">*</span>
                  </label>
                  <input type="text" name="last_name" value={form.last_name} onChange={handleChange} required
                    className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500" />
                </div>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">
                    Date of Birth <span className="text-red-500">*</span>
                  </label>
                  <input type="date" name="date_of_birth" value={form.date_of_birth} onChange={handleChange} required
                    className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">
                    SSN Last 4 Digits <span className="text-red-500">*</span>
                  </label>
                  <input type="text" name="ssn_last4" value={form.ssn_last4} onChange={handleChange} required
                    maxLength={4} pattern="\d{4}" placeholder="XXXX"
                    className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500" />
                </div>
              </div>
            </fieldset>

            <fieldset className="space-y-4">
              <legend className="text-sm font-semibold text-slate-500 uppercase tracking-wide">
                Address
              </legend>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Street Address <span className="text-red-500">*</span>
                </label>
                <input type="text" name="street" value={form.street} onChange={handleChange} required
                  className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500" />
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                <div className="col-span-2">
                  <label className="block text-sm font-medium text-slate-700 mb-1">City <span className="text-red-500">*</span></label>
                  <input type="text" name="city" value={form.city} onChange={handleChange} required
                    className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">State <span className="text-red-500">*</span></label>
                  <input type="text" name="state" value={form.state} onChange={handleChange} required maxLength={2} placeholder="TX"
                    className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">ZIP <span className="text-red-500">*</span></label>
                  <input type="text" name="zip" value={form.zip} onChange={handleChange} required maxLength={10}
                    className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500" />
                </div>
              </div>
            </fieldset>

            <fieldset className="space-y-4">
              <legend className="text-sm font-semibold text-slate-500 uppercase tracking-wide">
                Contact Information
              </legend>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Email <span className="text-red-500">*</span></label>
                  <input type="email" name="email" value={form.email} onChange={handleChange} required
                    className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Phone <span className="text-red-500">*</span></label>
                  <input type="tel" name="phone" value={form.phone} onChange={handleChange} required placeholder="(555) 000-0000"
                    className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500" />
                </div>
              </div>
            </fieldset>

            <fieldset className="space-y-4">
              <legend className="text-sm font-semibold text-slate-500 uppercase tracking-wide">
                Service Options
              </legend>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Plan Tier <span className="text-red-500">*</span></label>
                  <select name="plan_tier" value={form.plan_tier} onChange={handleChange} required
                    className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white">
                    <option value="standard">Standard</option>
                    <option value="premium">Premium</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Credit Report Source <span className="text-red-500">*</span></label>
                  <select name="credit_data_source" value={form.credit_data_source} onChange={handleChange} required
                    className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white">
                    <option value="identityiq">IdentityIQ</option>
                    <option value="transunion">TransUnion</option>
                    <option value="equifax">Equifax</option>
                    <option value="experian">Experian</option>
                  </select>
                </div>
              </div>
            </fieldset>

            <fieldset className="space-y-3">
              <legend className="text-sm font-semibold text-slate-500 uppercase tracking-wide">
                Agreements <span className="text-red-500">*</span>
              </legend>
              <label className="flex items-start gap-3 cursor-pointer">
                <input type="checkbox" name="consent_given" checked={form.consent_given} onChange={handleChange} required
                  className="mt-0.5 h-4 w-4 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500" />
                <span className="text-sm text-slate-700">
                  I consent to Williams Equity Capital contacting me and acting on my behalf to dispute inaccurate credit items.
                </span>
              </label>
              <label className="flex items-start gap-3 cursor-pointer">
                <input type="checkbox" name="disclosure_acknowledged" checked={form.disclosure_acknowledged} onChange={handleChange} required
                  className="mt-0.5 h-4 w-4 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500" />
                <span className="text-sm text-slate-700">
                  I acknowledge the required CROA disclosures, including my right to dispute inaccurate information directly with credit bureaus at no cost.
                </span>
              </label>
              <label className="flex items-start gap-3 cursor-pointer">
                <input type="checkbox" name="croa_contract_signed" checked={form.croa_contract_signed} onChange={handleChange} required
                  className="mt-0.5 h-4 w-4 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500" />
                <span className="text-sm text-slate-700">
                  I have read and agree to the Credit Repair Organizations Act (CROA) contract terms.
                </span>
              </label>
            </fieldset>

            <button type="submit" disabled={submitting}
              className="w-full rounded-lg bg-indigo-600 py-3 px-6 text-white font-semibold text-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 disabled:opacity-60 disabled:cursor-not-allowed transition-colors">
              {submitting ? "Submitting..." : "Submit Application"}
            </button>
          </form>
        )}
      </main>

      <footer className="border-t border-slate-200 py-8 text-center text-xs text-slate-400">
        &copy; {new Date().getFullYear()} Williams Equity Capital. All rights reserved.
      </footer>
    </div>
  );
}
