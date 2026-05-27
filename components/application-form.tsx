"use client";

import { useState } from "react";
import { CheckCircle, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

export function ApplicationForm() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    // Simulate form submission
    await new Promise((resolve) => setTimeout(resolve, 1500));
    
    setIsSubmitting(false);
    setIsSubmitted(true);
  };

  if (isSubmitted) {
    return (
      <section id="apply" className="py-20 sm:py-28 bg-background">
        <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-card rounded-2xl shadow-xl p-8 sm:p-12 text-center border border-border">
            <div className="w-20 h-20 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-6">
              <CheckCircle className="w-10 h-10 text-primary" />
            </div>
            <h2 className="text-2xl sm:text-3xl font-bold text-foreground mb-4">
              Application Received!
            </h2>
            <p className="text-lg text-muted-foreground mb-6">
              Thank you for choosing Williams Equity Capital. Our team will review 
              your information and contact you within 24 hours to discuss your 
              personalized credit repair plan.
            </p>
            <p className="text-sm text-muted-foreground">
              Check your email for a confirmation and next steps.
            </p>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section id="apply" className="py-20 sm:py-28 bg-background">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="text-3xl sm:text-4xl font-bold text-foreground text-balance">
            Start Your Free Credit Evaluation
          </h2>
          <p className="mt-4 text-lg text-muted-foreground leading-relaxed max-w-2xl mx-auto">
            Complete the form below to receive a complimentary credit analysis 
            and personalized action plan from our experts.
          </p>
        </div>

        <form
          onSubmit={handleSubmit}
          className="bg-card rounded-2xl shadow-xl p-6 sm:p-10 border border-border"
        >
          <fieldset className="mb-8">
            <legend className="text-sm font-semibold text-primary uppercase tracking-wider mb-4">
              Personal Information
            </legend>
            <div className="grid sm:grid-cols-2 gap-4">
              <div>
                <label htmlFor="firstName" className="block text-sm font-medium text-foreground mb-2">
                  First Name <span className="text-destructive">*</span>
                </label>
                <input
                  type="text"
                  id="firstName"
                  name="firstName"
                  required
                  className="w-full px-4 py-3 rounded-lg border border-border bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-colors"
                  placeholder="John"
                />
              </div>
              <div>
                <label htmlFor="lastName" className="block text-sm font-medium text-foreground mb-2">
                  Last Name <span className="text-destructive">*</span>
                </label>
                <input
                  type="text"
                  id="lastName"
                  name="lastName"
                  required
                  className="w-full px-4 py-3 rounded-lg border border-border bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-colors"
                  placeholder="Doe"
                />
              </div>
              <div>
                <label htmlFor="dob" className="block text-sm font-medium text-foreground mb-2">
                  Date of Birth <span className="text-destructive">*</span>
                </label>
                <input
                  type="date"
                  id="dob"
                  name="dob"
                  required
                  className="w-full px-4 py-3 rounded-lg border border-border bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-colors"
                />
              </div>
              <div>
                <label htmlFor="ssn" className="block text-sm font-medium text-foreground mb-2">
                  SSN Last 4 Digits <span className="text-destructive">*</span>
                </label>
                <input
                  type="text"
                  id="ssn"
                  name="ssn"
                  required
                  maxLength={4}
                  pattern="\d{4}"
                  className="w-full px-4 py-3 rounded-lg border border-border bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-colors"
                  placeholder="XXXX"
                />
              </div>
            </div>
          </fieldset>

          <fieldset className="mb-8">
            <legend className="text-sm font-semibold text-primary uppercase tracking-wider mb-4">
              Address
            </legend>
            <div className="space-y-4">
              <div>
                <label htmlFor="address" className="block text-sm font-medium text-foreground mb-2">
                  Street Address <span className="text-destructive">*</span>
                </label>
                <input
                  type="text"
                  id="address"
                  name="address"
                  required
                  className="w-full px-4 py-3 rounded-lg border border-border bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-colors"
                  placeholder="123 Main Street"
                />
              </div>
              <div className="grid sm:grid-cols-3 gap-4">
                <div>
                  <label htmlFor="city" className="block text-sm font-medium text-foreground mb-2">
                    City <span className="text-destructive">*</span>
                  </label>
                  <input
                    type="text"
                    id="city"
                    name="city"
                    required
                    className="w-full px-4 py-3 rounded-lg border border-border bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-colors"
                    placeholder="Houston"
                  />
                </div>
                <div>
                  <label htmlFor="state" className="block text-sm font-medium text-foreground mb-2">
                    State <span className="text-destructive">*</span>
                  </label>
                  <input
                    type="text"
                    id="state"
                    name="state"
                    required
                    defaultValue="TX"
                    className="w-full px-4 py-3 rounded-lg border border-border bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-colors"
                  />
                </div>
                <div>
                  <label htmlFor="zip" className="block text-sm font-medium text-foreground mb-2">
                    ZIP <span className="text-destructive">*</span>
                  </label>
                  <input
                    type="text"
                    id="zip"
                    name="zip"
                    required
                    pattern="\d{5}"
                    maxLength={5}
                    className="w-full px-4 py-3 rounded-lg border border-border bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-colors"
                    placeholder="77001"
                  />
                </div>
              </div>
            </div>
          </fieldset>

          <fieldset className="mb-8">
            <legend className="text-sm font-semibold text-primary uppercase tracking-wider mb-4">
              Contact Information
            </legend>
            <div className="grid sm:grid-cols-2 gap-4">
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-foreground mb-2">
                  Email <span className="text-destructive">*</span>
                </label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  required
                  className="w-full px-4 py-3 rounded-lg border border-border bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-colors"
                  placeholder="john@example.com"
                />
              </div>
              <div>
                <label htmlFor="phone" className="block text-sm font-medium text-foreground mb-2">
                  Phone <span className="text-destructive">*</span>
                </label>
                <input
                  type="tel"
                  id="phone"
                  name="phone"
                  required
                  className="w-full px-4 py-3 rounded-lg border border-border bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-colors"
                  placeholder="(555) 000-0000"
                />
              </div>
            </div>
          </fieldset>

          <fieldset className="mb-8">
            <legend className="text-sm font-semibold text-primary uppercase tracking-wider mb-4">
              Service Options
            </legend>
            <div className="grid sm:grid-cols-2 gap-4">
              <div>
                <label htmlFor="plan" className="block text-sm font-medium text-foreground mb-2">
                  Plan Tier <span className="text-destructive">*</span>
                </label>
                <select
                  id="plan"
                  name="plan"
                  required
                  className="w-full px-4 py-3 rounded-lg border border-border bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-colors"
                >
                  <option value="standard">Standard - $99/month</option>
                  <option value="premium">Premium - $149/month</option>
                </select>
              </div>
              <div>
                <label htmlFor="source" className="block text-sm font-medium text-foreground mb-2">
                  Credit Report Source <span className="text-destructive">*</span>
                </label>
                <select
                  id="source"
                  name="source"
                  required
                  className="w-full px-4 py-3 rounded-lg border border-border bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-colors"
                >
                  <option value="identityiq">IdentityIQ</option>
                  <option value="transunion">TransUnion</option>
                  <option value="equifax">Equifax</option>
                  <option value="experian">Experian</option>
                </select>
              </div>
            </div>
          </fieldset>

          <fieldset className="mb-8">
            <legend className="text-sm font-semibold text-primary uppercase tracking-wider mb-4">
              Agreements <span className="text-destructive">*</span>
            </legend>
            <div className="space-y-4">
              <label className="flex items-start gap-3 cursor-pointer group">
                <input
                  type="checkbox"
                  name="consent"
                  required
                  className="mt-1 w-5 h-5 rounded border-border text-primary focus:ring-primary/20"
                />
                <span className="text-sm text-muted-foreground group-hover:text-foreground transition-colors">
                  I consent to Williams Equity Capital contacting me and acting 
                  on my behalf to dispute inaccurate credit items.
                </span>
              </label>
              <label className="flex items-start gap-3 cursor-pointer group">
                <input
                  type="checkbox"
                  name="croa"
                  required
                  className="mt-1 w-5 h-5 rounded border-border text-primary focus:ring-primary/20"
                />
                <span className="text-sm text-muted-foreground group-hover:text-foreground transition-colors">
                  I acknowledge the required CROA disclosures, including my right 
                  to dispute inaccurate information directly with credit bureaus at no cost.
                </span>
              </label>
              <label className="flex items-start gap-3 cursor-pointer group">
                <input
                  type="checkbox"
                  name="terms"
                  required
                  className="mt-1 w-5 h-5 rounded border-border text-primary focus:ring-primary/20"
                />
                <span className="text-sm text-muted-foreground group-hover:text-foreground transition-colors">
                  I have read and agree to the Credit Repair Organizations Act 
                  (CROA) contract terms.
                </span>
              </label>
            </div>
          </fieldset>

          <button
            type="submit"
            disabled={isSubmitting}
            className={cn(
              "w-full py-4 px-6 rounded-lg font-semibold text-primary-foreground transition-all",
              "bg-primary hover:bg-primary/90 shadow-lg hover:shadow-xl",
              "disabled:opacity-70 disabled:cursor-not-allowed",
              "flex items-center justify-center gap-2"
            )}
          >
            {isSubmitting ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                Submitting...
              </>
            ) : (
              "Submit Application"
            )}
          </button>

          <p className="mt-4 text-xs text-center text-muted-foreground">
            By submitting this form, you agree to our Terms of Service and Privacy Policy.
            Your information is protected with bank-level encryption.
          </p>
        </form>
      </div>
    </section>
  );
}
