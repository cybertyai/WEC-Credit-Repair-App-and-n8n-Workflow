import Link from "next/link";
import { Phone, Mail, MapPin } from "lucide-react";

export function Footer() {
  return (
    <footer className="bg-foreground text-background">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-12">
          <div className="lg:col-span-2">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-12 h-12 bg-primary rounded-lg flex items-center justify-center">
                <span className="text-primary-foreground font-bold text-xl">WEC</span>
              </div>
              <div>
                <div className="text-lg font-semibold text-background">
                  Williams Equity Capital
                </div>
                <div className="text-xs text-background/60 tracking-wide">
                  CREDIT REPAIR SERVICES
                </div>
              </div>
            </div>
            <p className="text-background/70 max-w-md leading-relaxed mb-6">
              Helping individuals take control of their financial future through 
              professional credit repair services. We dispute inaccurate items 
              and work tirelessly to improve your credit score.
            </p>
            <div className="flex items-center gap-2">
              <span className="px-3 py-1 bg-background/10 rounded-full text-xs font-medium text-background/80">
                CROA Compliant
              </span>
              <span className="px-3 py-1 bg-background/10 rounded-full text-xs font-medium text-background/80">
                BBB Accredited
              </span>
            </div>
          </div>

          <div>
            <h3 className="font-semibold text-background mb-4">Quick Links</h3>
            <ul className="space-y-3">
              <li>
                <Link
                  href="#services"
                  className="text-background/70 hover:text-accent transition-colors"
                >
                  Services
                </Link>
              </li>
              <li>
                <Link
                  href="#process"
                  className="text-background/70 hover:text-accent transition-colors"
                >
                  Our Process
                </Link>
              </li>
              <li>
                <Link
                  href="#testimonials"
                  className="text-background/70 hover:text-accent transition-colors"
                >
                  Success Stories
                </Link>
              </li>
              <li>
                <Link
                  href="#faq"
                  className="text-background/70 hover:text-accent transition-colors"
                >
                  FAQ
                </Link>
              </li>
              <li>
                <Link
                  href="#apply"
                  className="text-background/70 hover:text-accent transition-colors"
                >
                  Get Started
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="font-semibold text-background mb-4">Contact Us</h3>
            <ul className="space-y-4">
              <li className="flex items-start gap-3">
                <Phone className="w-5 h-5 text-accent flex-shrink-0 mt-0.5" />
                <div>
                  <div className="text-background/70">Call Us</div>
                  <a
                    href="tel:+18005551234"
                    className="text-background hover:text-accent transition-colors"
                  >
                    (800) 555-1234
                  </a>
                </div>
              </li>
              <li className="flex items-start gap-3">
                <Mail className="w-5 h-5 text-accent flex-shrink-0 mt-0.5" />
                <div>
                  <div className="text-background/70">Email Us</div>
                  <a
                    href="mailto:info@williamsequitycapital.com"
                    className="text-background hover:text-accent transition-colors"
                  >
                    info@williamsequitycapital.com
                  </a>
                </div>
              </li>
              <li className="flex items-start gap-3">
                <MapPin className="w-5 h-5 text-accent flex-shrink-0 mt-0.5" />
                <div>
                  <div className="text-background/70">Office</div>
                  <address className="not-italic text-background">
                    Houston, TX
                  </address>
                </div>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-12 pt-8 border-t border-background/10">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <p className="text-sm text-background/60">
              &copy; {new Date().getFullYear()} Williams Equity Capital. All rights reserved.
            </p>
            <div className="flex items-center gap-6 text-sm">
              <Link
                href="#"
                className="text-background/60 hover:text-background transition-colors"
              >
                Privacy Policy
              </Link>
              <Link
                href="#"
                className="text-background/60 hover:text-background transition-colors"
              >
                Terms of Service
              </Link>
              <Link
                href="#"
                className="text-background/60 hover:text-background transition-colors"
              >
                CROA Disclosure
              </Link>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
