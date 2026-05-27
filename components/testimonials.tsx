import { Star, Quote } from "lucide-react";

const testimonials = [
  {
    name: "Marcus J.",
    location: "Houston, TX",
    score: { before: 520, after: 695 },
    text: "I was skeptical at first, but WEC delivered results beyond my expectations. My score jumped 175 points in just 4 months. I was finally able to qualify for a mortgage!",
  },
  {
    name: "Sarah T.",
    location: "Dallas, TX",
    score: { before: 580, after: 720 },
    text: "The team at Williams Equity Capital made everything so easy. They handled all the disputes and kept me updated every step of the way. Highly recommend!",
  },
  {
    name: "David R.",
    location: "Austin, TX",
    score: { before: 490, after: 640 },
    text: "After years of struggling with bad credit, WEC helped me remove multiple inaccurate collections. My credit score improved by 150 points and I can finally breathe.",
  },
];

export function Testimonials() {
  return (
    <section id="testimonials" className="py-20 sm:py-28 bg-primary">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <h2 className="text-3xl sm:text-4xl font-bold text-primary-foreground text-balance">
            Real Results from Real Clients
          </h2>
          <p className="mt-4 text-lg text-primary-foreground/80 leading-relaxed">
            Join thousands of satisfied clients who have transformed their 
            credit scores and achieved their financial dreams.
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8">
          {testimonials.map((testimonial) => (
            <div
              key={testimonial.name}
              className="bg-card rounded-xl p-6 sm:p-8 shadow-lg"
            >
              <div className="flex items-center gap-1 mb-4">
                {[...Array(5)].map((_, i) => (
                  <Star
                    key={i}
                    className="w-5 h-5 fill-accent text-accent"
                  />
                ))}
              </div>

              <Quote className="w-10 h-10 text-primary/20 mb-4" />

              <p className="text-foreground leading-relaxed mb-6">
                {testimonial.text}
              </p>

              <div className="pt-6 border-t border-border">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <div className="font-semibold text-foreground">
                      {testimonial.name}
                    </div>
                    <div className="text-sm text-muted-foreground">
                      {testimonial.location}
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-sm text-muted-foreground">Score Increase</div>
                    <div className="text-lg font-bold text-primary">
                      +{testimonial.score.after - testimonial.score.before} pts
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-4 text-sm">
                  <div className="flex-1">
                    <div className="text-muted-foreground mb-1">Before</div>
                    <div className="font-semibold text-destructive">
                      {testimonial.score.before}
                    </div>
                  </div>
                  <div className="w-px h-8 bg-border" />
                  <div className="flex-1">
                    <div className="text-muted-foreground mb-1">After</div>
                    <div className="font-semibold text-primary">
                      {testimonial.score.after}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
