import Link from "next/link";
import { Button } from "@/components/ui/button";
import { CheckCircle2 } from "lucide-react";
import Image from "next/image";

export function CTA() {
  return (
    <section className="bg-white">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-24 space-y-8 text-center">
        <h2 className="text-4xl md:text-5xl lg:text-6xl text-gray-900 leading-tight font-bold">
          Create Viral Thumbnails with THUMBMAKER
        </h2>
        <p className="mx-auto max-w-[700px] text-gray-600 text-base sm:text-lg md:text-xl">
          Join thousands of creators that have revolutionized their
          YouTube presence. Start creating high-converting thumbnails today.
        </p>
        
        {/* Trust indicators */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 sm:gap-8">
          <div className="flex items-center gap-2 text-sm text-green-600">
            <CheckCircle2 className="w-4 h-4" />
            <span>No credit card required</span>
          </div>
          <div className="flex items-center gap-2 text-sm text-green-600">
            <CheckCircle2 className="w-4 h-4" />
            <span>10 free thumbnails</span>
          </div>
        </div>
        
        <Button
          className="rounded-full w-44 md:w-48 lg:w-52 gap-1.5 sm:gap-2 px-4 sm:px-6 md:px-8 py-4 sm:py-5 md:py-6 text-base sm:text-lg font-medium shadow-md hover:shadow-xl transition-all duration-300"
          size="lg"
          asChild
        >
          <Link href="/sign-in">Start Creating Now</Link>
        </Button>
        
        {/* Thumbnail examples */}
        <div className="flex justify-center items-center gap-6 mt-12">
          <div className="relative w-48 h-48 sm:w-56 sm:h-56 lg:w-64 lg:h-64 rounded-lg overflow-hidden shadow-lg">
            <Image
              src="/ads/ad-1.jpg"
              alt="Thumbnail example 1"
              fill
              className="object-cover"
              sizes="(max-width: 640px) 192px, (max-width: 1024px) 224px, 256px"
            />
          </div>
          <div className="relative w-48 h-48 sm:w-56 sm:h-56 lg:w-64 lg:h-64 rounded-lg overflow-hidden shadow-lg">
            <Image
              src="/ads/ad-2.jpg"
              alt="Thumbnail example 2"
              fill
              className="object-cover"
              sizes="(max-width: 640px) 192px, (max-width: 1024px) 224px, 256px"
            />
          </div>
          <div className="relative w-48 h-48 sm:w-56 sm:h-56 lg:w-64 lg:h-64 rounded-lg overflow-hidden shadow-lg">
            <Image
              src="/ads/ad-3.jpg"
              alt="Thumbnail example 3"
              fill
              className="object-cover"
              sizes="(max-width: 640px) 192px, (max-width: 1024px) 224px, 256px"
            />
          </div>
        </div>
      </div>
    </section>
  );
}
