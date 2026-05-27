"use client";

import { useState } from "react";
import { ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";

const faqs = [
  {
    question: "How long does the credit repair process take?",
    answer:
      "Most clients see significant improvements within 45-90 days. However, the exact timeline depends on the number and type of items being disputed. We provide regular updates and a projected timeline during your free consultation.",
  },
  {
    question: "Is credit repair legal?",
    answer:
      "Absolutely. The Fair Credit Reporting Act (FCRA) gives you the legal right to dispute any information on your credit report that you believe is inaccurate, outdated, or unverifiable. We operate in full compliance with the Credit Repair Organizations Act (CROA).",
  },
  {
    question: "What items can be removed from my credit report?",
    answer:
      "We can dispute any inaccurate, outdated, misleading, or unverifiable items including collections, late payments, charge-offs, bankruptcies, repossessions, foreclosures, and inquiries. Items must be factually disputable to be removed.",
  },
  {
    question: "How much does credit repair cost?",
    answer:
      "We offer transparent pricing with no hidden fees. Our Standard plan starts at $99/month, and our Premium plan is $149/month. You'll know exactly what you're paying for, and we never charge for results we haven't delivered.",
  },
  {
    question: "Do I need to provide my credit report?",
    answer:
      "We can pull your credit reports through our secure integration with IdentityIQ, or you can provide reports from TransUnion, Equifax, or Experian directly. We guide you through the process during enrollment.",
  },
  {
    question: "What if the disputes are rejected?",
    answer:
      "If a dispute is initially rejected, we don't give up. We analyze the response, strengthen our argument with additional documentation, and resubmit. Our experienced team knows how to navigate the appeals process effectively.",
  },
];

export function FAQ() {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  return (
    <section id="faq" className="py-20 sm:py-28 bg-card">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-3xl sm:text-4xl font-bold text-foreground text-balance">
            Frequently Asked Questions
          </h2>
          <p className="mt-4 text-lg text-muted-foreground leading-relaxed">
            Get answers to common questions about our credit repair services.
          </p>
        </div>

        <div className="space-y-4">
          {faqs.map((faq, index) => (
            <div
              key={index}
              className="border border-border rounded-xl overflow-hidden bg-background"
            >
              <button
                className="w-full px-6 py-5 flex items-center justify-between text-left hover:bg-muted/50 transition-colors"
                onClick={() => setOpenIndex(openIndex === index ? null : index)}
                aria-expanded={openIndex === index}
              >
                <span className="font-medium text-foreground pr-4">
                  {faq.question}
                </span>
                <ChevronDown
                  className={cn(
                    "w-5 h-5 text-muted-foreground flex-shrink-0 transition-transform duration-200",
                    openIndex === index && "rotate-180"
                  )}
                />
              </button>
              <div
                className={cn(
                  "grid transition-all duration-200",
                  openIndex === index ? "grid-rows-[1fr]" : "grid-rows-[0fr]"
                )}
              >
                <div className="overflow-hidden">
                  <p className="px-6 pb-5 text-muted-foreground leading-relaxed">
                    {faq.answer}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
