import { Hero } from "@/components/landing/Hero";
import { Features } from "@/components/landing/Features";
import { CTA } from "@/components/landing/CTA";
import { ExploreGallery } from "@/components/landing/ExploreGallery";
import { Faq } from "@/components/landing/Faq";

export default function Home() {
  return (
    <div className="bg-white">
      <Hero />
      <ExploreGallery />
      <Features />
      {/* <Gallery /> */}
      <Faq />
      <CTA />
    </div>
  );
}
