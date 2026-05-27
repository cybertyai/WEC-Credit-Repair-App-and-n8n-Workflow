"use client";

import Link from "next/link";
import { Menu, X } from "lucide-react";
import { useState } from "react";

export function Header() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 bg-card/95 backdrop-blur-sm border-b border-border">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 sm:h-20">
          <Link href="/" className="flex items-center gap-3">
            <div className="w-10 h-10 sm:w-12 sm:h-12 bg-primary rounded-lg flex items-center justify-center">
              <span className="text-primary-foreground font-bold text-lg sm:text-xl">
                WEC
              </span>
            </div>
            <div className="hidden sm:block">
              <div className="text-lg font-semibold text-foreground">
                Williams Equity Capital
              </div>
              <div className="text-xs text-muted-foreground tracking-wide">
                CREDIT REPAIR SERVICES
              </div>
            </div>
          </Link>

          <nav className="hidden md:flex items-center gap-8">
            <Link
              href="#services"
              className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
            >
              Services
            </Link>
            <Link
              href="#process"
              className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
            >
              Our Process
            </Link>
            <Link
              href="#testimonials"
              className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
            >
              Results
            </Link>
            <Link
              href="#faq"
              className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
            >
              FAQ
            </Link>
          </nav>

          <div className="flex items-center gap-3">
            <Link
              href="#apply"
              className="hidden sm:inline-flex px-5 py-2.5 bg-primary text-primary-foreground text-sm font-medium rounded-lg hover:bg-primary/90 transition-colors"
            >
              Free Consultation
            </Link>
            <button
              className="md:hidden p-2 text-muted-foreground hover:text-foreground"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              aria-label="Toggle menu"
            >
              {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </div>

        {mobileMenuOpen && (
          <div className="md:hidden py-4 border-t border-border">
            <nav className="flex flex-col gap-4">
              <Link
                href="#services"
                className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
                onClick={() => setMobileMenuOpen(false)}
              >
                Services
              </Link>
              <Link
                href="#process"
                className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
                onClick={() => setMobileMenuOpen(false)}
              >
                Our Process
              </Link>
              <Link
                href="#testimonials"
                className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
                onClick={() => setMobileMenuOpen(false)}
              >
                Results
              </Link>
              <Link
                href="#faq"
                className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
                onClick={() => setMobileMenuOpen(false)}
              >
                FAQ
              </Link>
              <Link
                href="#apply"
                className="inline-flex justify-center px-5 py-2.5 bg-primary text-primary-foreground text-sm font-medium rounded-lg hover:bg-primary/90 transition-colors"
                onClick={() => setMobileMenuOpen(false)}
              >
                Free Consultation
              </Link>
            </nav>
          </div>
        )}
      </div>
    </header>
  );
}
