import { Hero } from "@/components/landing/Hero";
import { Features } from "@/components/landing/Features";
import { CTA } from "@/components/landing/CTA";
import { Faq } from "@/components/landing/Faq";
import { Metrics } from "@/components/landing/Metrics";
import { Pricing } from "@/components/landing/Pricing";

export default function Home() {
  return (
    <div className="bg-white overflow-x-hidden">
      <Hero />
      <Metrics />
      <Features />
      <Pricing />
      <Faq />
      <CTA />
    </div>
  );
}
