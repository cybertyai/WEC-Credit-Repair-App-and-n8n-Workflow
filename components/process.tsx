import { ClipboardCheck, FileSearch, Send, RefreshCw } from "lucide-react";

const steps = [
  {
    number: "01",
    icon: ClipboardCheck,
    title: "Free Consultation",
    description:
      "Complete our simple intake form and receive a complimentary credit analysis. We'll identify which items can be disputed and create a personalized action plan.",
  },
  {
    number: "02",
    icon: FileSearch,
    title: "Credit Report Review",
    description:
      "Our team thoroughly analyzes your credit reports from all three bureaus, documenting every inaccurate, outdated, or unverifiable item.",
  },
  {
    number: "03",
    icon: Send,
    title: "Dispute Submission",
    description:
      "We craft and submit professionally written dispute letters to the credit bureaus and creditors, challenging questionable items on your report.",
  },
  {
    number: "04",
    icon: RefreshCw,
    title: "Monitor & Repeat",
    description:
      "We track all responses, follow up on unresolved disputes, and continue the process until you achieve your credit goals.",
  },
];

export function Process() {
  return (
    <section id="process" className="py-20 sm:py-28 bg-background">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <h2 className="text-3xl sm:text-4xl font-bold text-foreground text-balance">
            Our Proven 4-Step Process
          </h2>
          <p className="mt-4 text-lg text-muted-foreground leading-relaxed">
            A systematic approach that has helped thousands of clients improve 
            their credit scores and achieve their financial goals.
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
          {steps.map((step, index) => (
            <div key={step.number} className="relative">
              {index < steps.length - 1 && (
                <div className="hidden lg:block absolute top-12 left-full w-full h-0.5 bg-gradient-to-r from-primary/30 to-transparent -translate-x-4 z-0" />
              )}
              <div className="relative bg-card rounded-xl p-6 sm:p-8 border border-border h-full">
                <div className="flex items-center gap-4 mb-6">
                  <div className="w-14 h-14 bg-primary rounded-xl flex items-center justify-center">
                    <step.icon className="w-7 h-7 text-primary-foreground" />
                  </div>
                  <span className="text-4xl font-bold text-primary/20">
                    {step.number}
                  </span>
                </div>
                <h3 className="text-xl font-semibold text-foreground mb-3">
                  {step.title}
                </h3>
                <p className="text-muted-foreground leading-relaxed">
                  {step.description}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
