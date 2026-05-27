import { ArrowRight, Shield, TrendingUp, Clock } from "lucide-react";
import Link from "next/link";

export function Hero() {
  return (
    <section className="relative overflow-hidden bg-gradient-to-br from-primary via-primary to-primary/90">
      <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxwYXRoIGQ9Ik0zNiAxOGMtOS45NDEgMC0xOCA4LjA1OS0xOCAxOHM4LjA1OSAxOCAxOCAxOCAxOC04LjA1OSAxOC0xOC04LjA1OS0xOC0xOC0xOHptMCAzMmMtNy43MzIgMC0xNC02LjI2OC0xNC0xNHM2LjI2OC0xNCAxNC0xNCAxNCA2LjI2OCAxNCAxNC02LjI2OCAxNC0xNCAxNHoiIGZpbGw9IiNmZmYiIGZpbGwtb3BhY2l0eT0iLjAyIi8+PC9nPjwvc3ZnPg==')] opacity-30" />
      
      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 sm:py-28 lg:py-36">
        <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">
          <div className="text-center lg:text-left">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-accent/20 rounded-full mb-6">
              <Shield className="w-4 h-4 text-accent" />
              <span className="text-sm font-medium text-accent">
                Trusted by 2,500+ Clients
              </span>
            </div>
            
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-primary-foreground leading-tight text-balance">
              Take Control of Your{" "}
              <span className="text-accent">Credit Future</span>
            </h1>
            
            <p className="mt-6 text-lg sm:text-xl text-primary-foreground/80 max-w-xl mx-auto lg:mx-0 leading-relaxed">
              Williams Equity Capital&apos;s professional credit repair program disputes 
              inaccurate items on your behalf with a proven track record of success.
            </p>

            <div className="mt-8 flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
              <Link
                href="#apply"
                className="inline-flex items-center justify-center gap-2 px-8 py-4 bg-accent text-accent-foreground font-semibold rounded-lg hover:bg-accent/90 transition-all shadow-lg hover:shadow-xl"
              >
                Start Free Consultation
                <ArrowRight className="w-5 h-5" />
              </Link>
              <Link
                href="#process"
                className="inline-flex items-center justify-center gap-2 px-8 py-4 border-2 border-primary-foreground/30 text-primary-foreground font-medium rounded-lg hover:bg-primary-foreground/10 transition-colors"
              >
                See How It Works
              </Link>
            </div>

            <div className="mt-12 grid grid-cols-3 gap-6 max-w-md mx-auto lg:mx-0">
              <div className="text-center lg:text-left">
                <div className="text-3xl sm:text-4xl font-bold text-accent">98%</div>
                <div className="text-sm text-primary-foreground/70 mt-1">Success Rate</div>
              </div>
              <div className="text-center lg:text-left">
                <div className="text-3xl sm:text-4xl font-bold text-accent">45+</div>
                <div className="text-sm text-primary-foreground/70 mt-1">Avg. Points Gained</div>
              </div>
              <div className="text-center lg:text-left">
                <div className="text-3xl sm:text-4xl font-bold text-accent">90</div>
                <div className="text-sm text-primary-foreground/70 mt-1">Day Results</div>
              </div>
            </div>
          </div>

          <div className="relative hidden lg:block">
            <div className="absolute -inset-4 bg-accent/10 rounded-3xl blur-3xl" />
            <div className="relative bg-card rounded-2xl shadow-2xl p-8">
              <div className="flex items-center gap-4 mb-6">
                <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center">
                  <TrendingUp className="w-6 h-6 text-primary" />
                </div>
                <div>
                  <div className="font-semibold text-foreground">Credit Score Increase</div>
                  <div className="text-sm text-muted-foreground">Average client results</div>
                </div>
              </div>
              
              <div className="space-y-4">
                <div className="flex items-end justify-between">
                  <span className="text-sm text-muted-foreground">Before</span>
                  <span className="text-2xl font-bold text-destructive">580</span>
                </div>
                <div className="h-3 bg-secondary rounded-full overflow-hidden">
                  <div className="h-full w-[58%] bg-gradient-to-r from-destructive to-destructive/70 rounded-full" />
                </div>
                
                <div className="flex items-end justify-between pt-4">
                  <span className="text-sm text-muted-foreground">After 90 Days</span>
                  <span className="text-2xl font-bold text-primary">720</span>
                </div>
                <div className="h-3 bg-secondary rounded-full overflow-hidden">
                  <div className="h-full w-[72%] bg-gradient-to-r from-primary to-accent rounded-full" />
                </div>
              </div>

              <div className="mt-6 pt-6 border-t border-border flex items-center justify-between">
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Clock className="w-4 h-4" />
                  <span>Results in 90 days or less</span>
                </div>
                <span className="text-lg font-bold text-primary">+140 pts</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
