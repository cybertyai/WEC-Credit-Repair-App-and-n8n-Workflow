import { Check } from "lucide-react";
import Link from "next/link";

const plans = [
  {
    name: "Standard",
    price: 99,
    description: "Perfect for individuals starting their credit repair journey",
    features: [
      "Full credit report analysis",
      "Dispute letters to all 3 bureaus",
      "Monthly progress reports",
      "Email support",
      "Client portal access",
      "Up to 5 disputes per month",
    ],
    popular: false,
  },
  {
    name: "Premium",
    price: 149,
    description: "Comprehensive service for faster, more aggressive results",
    features: [
      "Everything in Standard",
      "Priority dispute processing",
      "Unlimited disputes per month",
      "Dedicated case manager",
      "Phone support",
      "Creditor intervention letters",
      "Debt validation letters",
      "Score improvement guarantee",
    ],
    popular: true,
  },
];

export function Pricing() {
  return (
    <section id="pricing" className="py-20 sm:py-28 bg-background">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <h2 className="text-3xl sm:text-4xl font-bold text-foreground text-balance">
            Transparent, Affordable Pricing
          </h2>
          <p className="mt-4 text-lg text-muted-foreground leading-relaxed">
            No hidden fees, no long-term contracts. Cancel anytime.
            Choose the plan that fits your credit repair needs.
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
          {plans.map((plan) => (
            <div
              key={plan.name}
              className={`relative rounded-2xl border ${
                plan.popular
                  ? "border-primary shadow-xl scale-105"
                  : "border-border"
              } bg-card p-8`}
            >
              {plan.popular && (
                <div className="absolute -top-4 left-1/2 -translate-x-1/2 px-4 py-1 bg-accent text-accent-foreground text-sm font-medium rounded-full">
                  Most Popular
                </div>
              )}

              <div className="text-center mb-8">
                <h3 className="text-2xl font-bold text-foreground">
                  {plan.name}
                </h3>
                <p className="mt-2 text-muted-foreground">
                  {plan.description}
                </p>
                <div className="mt-6">
                  <span className="text-5xl font-bold text-foreground">
                    ${plan.price}
                  </span>
                  <span className="text-muted-foreground">/month</span>
                </div>
              </div>

              <ul className="space-y-4 mb-8">
                {plan.features.map((feature) => (
                  <li key={feature} className="flex items-start gap-3">
                    <Check className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
                    <span className="text-foreground">{feature}</span>
                  </li>
                ))}
              </ul>

              <Link
                href="#apply"
                className={`block w-full py-3 px-6 rounded-lg font-semibold text-center transition-colors ${
                  plan.popular
                    ? "bg-primary text-primary-foreground hover:bg-primary/90"
                    : "bg-secondary text-secondary-foreground hover:bg-secondary/80"
                }`}
              >
                Get Started
              </Link>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
