"use client";

import React from "react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import Link from "next/link";
import Image from "next/image";
import { useUser } from "@clerk/nextjs";
import { landingPrimaryButton } from "./buttonStyles";

// Constants
const carouselThumbnails = [
  "/carousel/The Satisfying Downfall of Ashton Hall.png",
  "/carousel/Trump's Tariff Plan Explained.png",
  "/carousel/Dubai's Insane $100B Branded Megaprojects.png",
  "/carousel/How Samuel Onuha Sniffed His Way to Prison.png",
  "/carousel/How One Person Destroyed 239 Lives.png",
  "/carousel/How History's Biggest Idiot Accidentally Became a...png",
];

// Reusable Button component styled like in the image
const ActionButton = ({ children, href }: { children: React.ReactNode; href: string }) => (
  <Link href={href} className="w-full sm:w-auto">
    <motion.button
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
      className={`${landingPrimaryButton} mt-6 w-full px-6 py-3 text-base sm:mt-8 sm:w-auto sm:px-8`}
    >
      {children}
    </motion.button>
  </Link>
);

// The main hero component
export function Hero() {
  const { isSignedIn } = useUser();

  // Animation variants for the text content
  const FADE_IN_ANIMATION_VARIANTS = {
    hidden: { opacity: 0, y: 10 },
    show: { opacity: 1, y: 0, transition: { type: "spring" as const, stiffness: 100, damping: 20 } },
  };

  // Data
  const description = "Stop guessing what works. Let AI create 20 high-converting thumbnails at once for your video idea or existing videos.";
  const ctaText = "Start Free Trial";
  const images = carouselThumbnails;

  // Duplicate images for a seamless loop
  const duplicatedImages = [...images, ...images];

  return (
    <section
      className={cn(
        "relative flex w-full min-h-[100svh] flex-col items-center justify-between overflow-hidden bg-background px-4 pt-12 pb-28 text-center sm:pt-16 sm:pb-20 lg:pt-20 lg:pb-16"
      )}
    >
      <div className="z-10 flex w-full max-w-3xl flex-col items-center gap-4 pt-2 sm:pt-4 md:pt-10">
        {/* Tagline */}
        <motion.div
          initial="hidden"
          animate="show"
          variants={FADE_IN_ANIMATION_VARIANTS}
          className="mb-4 inline-flex items-center gap-2 rounded-full bg-gray-900 px-5 py-2 text-[13px] font-semibold text-white shadow-lg shadow-gray-900/20"
        >
          Trusted by{" "}
          <span className="text-rose-200">
            500,000+ Users
          </span>
        </motion.div>

        {/* Main Title */}
        <motion.h1
          initial="hidden"
          animate="show"
          variants={{
            hidden: {},
            show: {
              transition: {
                staggerChildren: 0.1,
              },
            },
          }}
          className="text-4xl font-bold leading-tight text-gray-900 sm:text-5xl lg:text-[58px]"
        >
          <span className="block text-transparent bg-gradient-to-r from-[#E44491] to-[#121212] bg-clip-text">
            Generate 20 Viral
          </span>
          Thumbnails in 2{" "}
          <span className="relative inline-flex items-center">
            <motion.span
              className="text-4xl font-semibold text-rose-500 sm:text-[52px] drop-shadow-lg leading-none"
              style={{ fontFamily: '"Caveat", "Comic Sans MS", cursive' }}
              animate={{ rotate: [-3, 2, -3], scale: [1, 1.05, 1] }}
              transition={{ repeat: Infinity, duration: 4.2, ease: "easeInOut" }}
            >
              Minute&apos;s
            </motion.span>
            <motion.span
              className="absolute -top-3 -right-8 text-xl text-gray-400 line-through decoration-[3px] decoration-rose-500 sm:text-2xl leading-none"
              style={{ fontFamily: '"Caveat", "Comic Sans MS", cursive' }}
              animate={{ rotate: [2, -2, 2], scale: [1, 0.95, 1] }}
              transition={{ repeat: Infinity, duration: 4.2, ease: "easeInOut", delay: 0.3 }}
            >
              Hours
            </motion.span>
          </span>
        </motion.h1>

        {/* Description */}
        <motion.p
          initial="hidden"
          animate="show"
          variants={FADE_IN_ANIMATION_VARIANTS}
          transition={{ delay: 0.5 }}
          className="mt-4 max-w-xl text-base text-muted-foreground sm:text-lg"
        >
          {description}
        </motion.p>

        {/* Call to Action Button */}
        <motion.div
          className="w-full"
          initial="hidden"
          animate="show"
          variants={FADE_IN_ANIMATION_VARIANTS}
          transition={{ delay: 0.6 }}
        >
          <ActionButton href={isSignedIn ? "/dashboard" : "/sign-up"}>{ctaText}</ActionButton>
        </motion.div>

        {/* Animated Scroll Wheel Indicator */}
        <motion.div
          className="mt-4 flex flex-col items-center gap-2 text-xs text-muted-foreground sm:mt-6"
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.9 }}
        >
          <motion.div
            className="h-10 w-6 rounded-full border border-border flex items-start justify-center py-1"
            animate={{ opacity: [0.6, 1, 0.6] }}
            transition={{ repeat: Infinity, duration: 1.6, ease: "easeInOut" }}
          >
            <motion.div
              className="h-2 w-2 rounded-full bg-foreground"
              animate={{ y: [0, 16, 0] }}
              transition={{ repeat: Infinity, duration: 1.6, ease: "easeInOut" }}
            />
          </motion.div>
          <span>Scroll</span>
        </motion.div>
      </div>

      {/* Animated Image Marquee - Two Rows */}
      <div className="pointer-events-none absolute bottom-0 left-0 w-full h-1/3 md:h-2/5 [mask-image:linear-gradient(to_bottom,transparent,black_20%,black_80%,transparent)]">
        <div className="space-y-3 sm:space-y-4">
          {/* First Row - Scrolls Left */}
          <motion.div
            className="flex gap-6 md:gap-8"
            animate={{
              x: ["-50%", "0%"],
              transition: {
                ease: "linear",
                duration: 40,
                repeat: Infinity,
              },
            }}
          >
            {duplicatedImages.map((src, index) => (
              <div
                key={`row1-${index}`}
                className="relative aspect-video h-32 md:h-40 flex-shrink-0"
                style={{
                  rotate: `${(index % 2 === 0 ? -2 : 5)}deg`,
                }}
              >
                <Image
                  src={src}
                  alt={`Showcase image ${index + 1}`}
                  className="object-cover rounded-2xl shadow-md"
                  fill
                  sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                />
              </div>
            ))}
          </motion.div>

          {/* Second Row - Scrolls Right */}
          <motion.div
            className="flex gap-6 md:gap-8"
            animate={{
              x: ["0%", "-50%"],
              transition: {
                ease: "linear",
                duration: 40,
                repeat: Infinity,
              },
            }}
          >
            {duplicatedImages.map((src, index) => (
              <div
                key={`row2-${index}`}
                className="relative aspect-video h-32 md:h-40 flex-shrink-0"
                style={{
                  rotate: `${(index % 2 === 0 ? 5 : -2)}deg`,
                }}
              >
                <Image
                  src={src}
                  alt={`Showcase image ${index + 1}`}
                  className="object-cover rounded-2xl shadow-md opacity-90"
                  fill
                  sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                />
              </div>
            ))}
          </motion.div>
        </div>
      </div>
    </section>
  );
}
