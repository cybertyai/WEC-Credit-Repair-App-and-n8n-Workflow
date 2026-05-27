import { Header } from "@/components/header";
import { Hero } from "@/components/hero";
import { Services } from "@/components/services";
import { Process } from "@/components/process";
import { Testimonials } from "@/components/testimonials";
import { Pricing } from "@/components/pricing";
import { FAQ } from "@/components/faq";
import { ApplicationForm } from "@/components/application-form";
import { Footer } from "@/components/footer";

export default function Home() {
  return (
    <>
      <Header />
      <main>
        <Hero />
        <Services />
        <Process />
        <Testimonials />
        <Pricing />
        <FAQ />
        <ApplicationForm />
      </main>
      <Footer />
    </>
  );
}
