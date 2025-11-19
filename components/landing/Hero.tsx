"use client";

import { useEffect, useState } from "react";

import { Button } from "@/components/ui/button";
import { useUser } from "@clerk/nextjs";
import { motion } from "framer-motion";
import Image from "next/image";
import Link from "next/link";
import { ChevronDown, PlayCircle, Sparkles } from "lucide-react";
import Marquee from "react-fast-marquee";

const carouselThumbnails = [
  "/carousel/The Satisfying Downfall of Ashton Hall.png",
  "/carousel/Trump's Tariff Plan Explained.png",
  "/carousel/Dubai's Insane $100B Branded Megaprojects.png",
  "/carousel/How Samuel Onuha Sniffed His Way to Prison.png",
  "/carousel/How One Person Destroyed 239 Lives.png",
  "/carousel/How History's Biggest Idiot Accidentally Became a...png",
];

export function Hero() {
  const { isSignedIn } = useUser();
  const demoVideoUrl = "https://youtu.be/KrLj6nc516A";
  const [animatedUserCount, setAnimatedUserCount] = useState(0);

  useEffect(() => {
    const targetCount = 524_906;
    const duration = 1500; // ms
    const startTime = performance.now();

    const easeOutCubic = (t: number) => 1 - Math.pow(1 - t, 3);

    const animate = (currentTime: number) => {
      const elapsed = currentTime - startTime;
      const progress = Math.min(elapsed / duration, 1);
      const easedProgress = easeOutCubic(progress);
      setAnimatedUserCount(Math.floor(targetCount * easedProgress));

      if (progress < 1) {
        requestAnimationFrame(animate);
      }
    };

    const rafId = requestAnimationFrame(animate);

    return () => cancelAnimationFrame(rafId);
  }, []);

  return (
    <section className="relative overflow-hidden bg-white pt-24 pb-16">
      <div className="absolute inset-0 -z-10">
        <div className="absolute inset-x-0 top-0 h-[500px] bg-gradient-to-b from-white via-rose-50 to-white" />
        <div className="absolute inset-x-0 top-10 h-[350px] bg-white/60 blur-[120px]" />
      </div>

      <div className="mx-auto flex max-w-6xl flex-col items-center px-4 text-center sm:px-6">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="space-y-6"
        >
          <div className="inline-flex items-center gap-2 rounded-full bg-gray-900 px-5 py-2 text-[13px] font-semibold text-white shadow-lg shadow-gray-900/20">
            Trusted by{" "}
            <span className="text-rose-200">
              {animatedUserCount.toLocaleString()} Users
            </span>
          </div>

          <h1 className="text-4xl font-bold leading-tight text-gray-900 sm:text-5xl lg:text-[58px]">
            <span className="block text-transparent bg-gradient-to-r from-[#E44491] to-[#121212] bg-clip-text">
              Generate 20 Viral
            </span>
            Thumbnails in 2{" "}
            <span className="relative inline-flex flex-col items-center">
              <span className="text-3xl font-semibold text-rose-500 sm:text-[42px]">Minute&apos;s</span>
              <span className="absolute -bottom-6 text-2xl text-gray-400 line-through decoration-[3px] decoration-rose-500">
                Hours
              </span>
            </span>
          </h1>

          <p className="text-base text-muted-foreground sm:text-lg">
            Stop guessing what works. Let AI create 20 high-converting thumbnails at once for your
            video idea or existing videos.
          </p>

          <div className="flex flex-wrap items-center justify-center gap-4">
            <Button
              size="lg"
              className="h-12 rounded-full bg-gray-900 px-8 text-base font-semibold text-white shadow-xl shadow-gray-900/15"
              asChild
            >
              <Link href={isSignedIn ? "/dashboard" : "/sign-up"}>
                <Sparkles className="mr-2 h-4 w-4" />
                Start Free Trial
              </Link>
            </Button>
            <Button
              size="lg"
              variant="ghost"
              className="h-12 rounded-full border border-black/10 px-6 text-base font-semibold text-gray-900 shadow-sm"
              asChild
            >
              <Link href={demoVideoUrl} target="_blank">
                <PlayCircle className="mr-2 h-5 w-5" />
                Watch Demo
                <span className="ml-2 text-sm text-muted-foreground">90 sec</span>
              </Link>
            </Button>
          </div>

          <div className="flex items-center justify-center gap-2 text-sm font-medium text-muted-foreground">
            <ChevronDown className="h-4 w-4" />
            <span>Learn more</span>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2, duration: 0.6 }}
          className="relative mt-16 w-full rounded-[40px] border border-black/5 bg-white/80 p-6 shadow-[0_30px_120px_rgba(15,23,42,0.12)]"
        >
          <div className="pointer-events-none absolute inset-y-0 left-0 w-24 bg-gradient-to-r from-white via-white/80 to-transparent" />
          <div className="pointer-events-none absolute inset-y-0 right-0 w-24 bg-gradient-to-l from-white via-white/80 to-transparent" />

          <div className="space-y-5">
            <Marquee gradient={false} speed={25} pauseOnHover className="py-2">
              {[...Array(2)].map((_, loopIndex) =>
                carouselThumbnails.map((src, index) => (
                  <div
                    key={`top-${loopIndex}-${index}`}
                    className="relative mx-2 h-32 w-48 overflow-hidden rounded-2xl border border-black/10 shadow-lg"
                  >
                    <Image
                      src={src}
                      alt={`Carousel thumbnail ${index + 1}`}
                      fill
                      className="object-cover"
                      sizes="(max-width: 768px) 200px, 240px"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/25 via-transparent to-transparent" />
                  </div>
                )),
              )}
            </Marquee>

            <Marquee gradient={false} speed={22} direction="right" pauseOnHover className="py-2">
              {[...Array(2)].map((_, loopIndex) =>
                carouselThumbnails.map((src, index) => (
                  <div
                    key={`bottom-${loopIndex}-${index}`}
                    className="relative mx-2 h-32 w-48 overflow-hidden rounded-2xl border border-black/10 shadow-lg opacity-90"
                  >
                    <Image
                      src={src}
                      alt={`Carousel thumbnail ${index + 1}`}
                      fill
                      className="object-cover"
                      sizes="(max-width: 768px) 200px, 240px"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/25 via-transparent to-transparent" />
                  </div>
                )),
              )}
            </Marquee>
          </div>
        </motion.div>
      </div>
    </section>
  );
}