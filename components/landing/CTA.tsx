"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import Image from "next/image";
import { motion } from "framer-motion";
import { TRIAL_CREDIT_ALLOCATION } from "@/constants/credits";

const ctaThumbnails = [
  {
    src: "/carousel/How History's Biggest Idiot Accidentally Became a...png",
    alt: "How History's Biggest Idiot Accidentally Became a...",
  },
  {
    src: "/carousel/How One Person Destroyed 239 Lives.png",
    alt: "How One Person Destroyed 239 Lives thumbnail",
  },
  {
    src: "/carousel/How Samuel Onuha Sniffed His Way to Prison.png",
    alt: "How Samuel Onuha Sniffed His Way to Prison thumbnail",
  },
  {
    src: "/carousel/Dubai's Insane $100B Branded Megaprojects.png",
    alt: "Dubai's Insane $100B Branded Megaprojects thumbnail",
  },
  {
    src: "/carousel/The Satisfying Downfall of Ashton Hall.png",
    alt: "The Satisfying Downfall of Ashton Hall thumbnail",
  },
  {
    src: "/carousel/Trump's Tariff Plan Explained.png",
    alt: "Trump's Tariff Plan Explained thumbnail",
  },
];

export function CTA() {
  return (
    <section className="bg-white px-4 py-24 sm:px-6">
      <motion.div
        initial={{ opacity: 0, y: 40 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.6 }}
        className="mx-auto flex max-w-6xl flex-col gap-10 px-6 py-12 text-center sm:px-12"
      >
        <div className="space-y-4">
          <p className="text-xs font-semibold uppercase tracking-[0.3em] text-rose-500">
            Unlock your free trial
          </p>
          <h2 className="text-3xl font-semibold text-gray-900 sm:text-5xl">
            Your Next Viral Thumbnail is One Click Away
          </h2>
          <p className="mx-auto max-w-3xl text-base text-muted-foreground">
            Stop spending hours in Photoshop. Add your card once, get {TRIAL_CREDIT_ALLOCATION} free credits, and start generating thumbnails that actually get clicks.
          </p>
        </div>

        <div className="relative mx-auto w-full max-w-5xl overflow-hidden bg-white/70 p-2">
          <div className="flex items-center justify-center">
            {ctaThumbnails.map(({ src, alt }, index) => (
              <div
                key={src}
                className={`relative aspect-video w-[230px] shrink-0 overflow-hidden ${
                  index === 0 || index === ctaThumbnails.length - 1 ? "opacity-60" : ""
                }`}
              >
                <Image
                  src={src}
                  alt={alt}
                  fill
                  className="object-cover"
                  sizes="(max-width: 640px) 80vw, (max-width: 1024px) 60vw, 230px"
                />
              </div>
            ))}
          </div>
          <div className="pointer-events-none absolute inset-y-0 left-0 w-32 bg-gradient-to-r from-white via-white/90 to-transparent" />
          <div className="pointer-events-none absolute inset-y-0 right-0 w-32 bg-gradient-to-l from-white via-white/90 to-transparent" />
        </div>

        <div className="flex flex-col items-center gap-4">
          <Button className="h-12 rounded-full px-10 text-base font-semibold shadow-lg" size="lg" asChild>
            <Link href="/sign-up">Activate Free Trial</Link>
          </Button>
          <p className="text-sm text-muted-foreground">
            Secure Stripe checkout. No charges until you upgrade.
          </p>
        </div>
      </motion.div>
    </section>
  );
}
