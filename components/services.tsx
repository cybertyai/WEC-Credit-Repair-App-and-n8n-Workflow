import { FileText, Search, Mail, BarChart3, Shield, Headphones } from "lucide-react";

const services = [
  {
    icon: Search,
    title: "Credit Report Analysis",
    description:
      "Comprehensive review of all three credit bureaus to identify inaccurate, outdated, or unverifiable items affecting your score.",
  },
  {
    icon: FileText,
    title: "Dispute Letter Generation",
    description:
      "Professionally crafted dispute letters tailored to your specific situation, maximizing the chances of successful removals.",
  },
  {
    icon: Mail,
    title: "Bureau Communication",
    description:
      "Direct communication with Equifax, Experian, and TransUnion on your behalf, tracking every response and deadline.",
  },
  {
    icon: BarChart3,
    title: "Progress Tracking",
    description:
      "Real-time dashboard showing your credit score improvements, dispute statuses, and projected timeline to your goals.",
  },
  {
    icon: Shield,
    title: "CROA Compliant",
    description:
      "Full compliance with the Credit Repair Organizations Act, ensuring your rights are protected throughout the process.",
  },
  {
    icon: Headphones,
    title: "Dedicated Support",
    description:
      "Personal case manager assigned to your account, available to answer questions and provide guidance every step of the way.",
  },
];

export function Services() {
  return (
    <section id="services" className="py-20 sm:py-28 bg-card">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <h2 className="text-3xl sm:text-4xl font-bold text-foreground text-balance">
            Comprehensive Credit Repair Services
          </h2>
          <p className="mt-4 text-lg text-muted-foreground leading-relaxed">
            Our proven methodology combines advanced technology with personalized 
            attention to deliver results that transform your financial future.
          </p>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-8">
          {services.map((service) => (
            <div
              key={service.title}
              className="group p-6 sm:p-8 bg-background rounded-xl border border-border hover:border-primary/30 hover:shadow-lg transition-all duration-300"
            >
              <div className="w-14 h-14 bg-primary/10 rounded-xl flex items-center justify-center mb-6 group-hover:bg-primary/20 transition-colors">
                <service.icon className="w-7 h-7 text-primary" />
              </div>
              <h3 className="text-xl font-semibold text-foreground mb-3">
                {service.title}
              </h3>
              <p className="text-muted-foreground leading-relaxed">
                {service.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
