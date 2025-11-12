"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { CheckCircle2, ArrowRight, Sparkles } from "lucide-react";
import Image from "next/image";
import { motion } from "framer-motion";

export function CTA() {
  return (
    <section className="relative bg-gradient-to-b from-white via-gray-50 to-white overflow-hidden">
      {/* Decorative background elements */}
      <div className="absolute inset-0 opacity-5">
        <div className="absolute top-0 left-1/3 w-96 h-96 bg-brand-600 rounded-full blur-3xl"></div>
        <div className="absolute bottom-0 right-1/3 w-96 h-96 bg-red-500 rounded-full blur-3xl"></div>
      </div>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-24 relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="space-y-8 text-center"
        >
          <div className="space-y-4">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-brand-50 rounded-full border border-brand-200">
              <Sparkles className="w-4 h-4 text-brand-600" />
              <span className="text-sm font-medium text-brand-700">Join 50K+ Creators</span>
            </div>
            <h2 className="text-4xl md:text-5xl lg:text-6xl text-foreground leading-tight font-bold">
              Create Viral Thumbnails with{" "}
              <span className="bg-gradient-to-r from-[#FF0000] to-[#FF6B6B] bg-clip-text text-transparent">
                THUMBMAKER
              </span>
            </h2>
            <p className="mx-auto max-w-[700px] text-muted-foreground text-base sm:text-lg md:text-xl">
              Join thousands of creators that have revolutionized their YouTube presence. Start
              creating high-converting thumbnails today.
            </p>
          </div>

          {/* Trust indicators */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 sm:gap-8">
            <div className="flex items-center gap-2 text-sm font-medium text-green-600">
              <CheckCircle2 className="w-5 h-5" />
              <span>No credit card required</span>
            </div>
            <div className="flex items-center gap-2 text-sm font-medium text-green-600">
              <CheckCircle2 className="w-5 h-5" />
              <span>10 free thumbnails</span>
            </div>
          </div>

          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            <Button
              variant="default"
              className="group rounded-full w-44 md:w-48 lg:w-52 gap-2 px-4 sm:px-6 md:px-8 py-4 sm:py-5 md:py-6 text-base sm:text-lg font-medium shadow-lg hover:shadow-xl transition-all duration-300"
              size="lg"
              asChild
            >
              <Link href="/sign-up">
                Start Creating Now
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </Link>
            </Button>
          </motion.div>

          {/* Thumbnail examples */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.3 }}
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 mt-12 max-w-5xl mx-auto"
          >
            {[
              { src: "/thumbnails/8.jpg", alt: "Gaming reaction thumbnail preview" },
              { src: "/thumbnails/12.jpg", alt: "Educational marketing thumbnail preview" },
              { src: "/thumbnails/16.jpg", alt: "Creator interview thumbnail preview" },
            ].map((thumb, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: 0.4 + index * 0.1 }}
                className="relative w-full aspect-[16/9] rounded-xl overflow-hidden shadow-xl hover:shadow-2xl transition-all duration-300 hover:-translate-y-2 group"
              >
                <Image
                  src={thumb.src}
                  alt={thumb.alt}
                  fill
                  className="object-cover group-hover:scale-105 transition-transform duration-300"
                  quality={95}
                  sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
              </motion.div>
            ))}
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
}
