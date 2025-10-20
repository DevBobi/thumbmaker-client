"use client";

import { Button } from "@/components/ui/button";
import Link from "next/link";
import { useUser } from "@clerk/nextjs";
import { CheckCircle2, Star, ArrowRight } from "lucide-react";
import { motion } from "framer-motion";
import Image from "next/image";
import Marquee from "react-fast-marquee";

export function Hero() {
  const { isSignedIn } = useUser();

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.2,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.5,
      },
    },
  };

  // Sample ads for the carousel
  const ads = [
    "/ads/ad-1.jpg",
    "/ads/ad-2.jpg", 
    "/ads/ad-3.jpg",
    "/ads/ad-4.jpg",
    "/ads/ad-5.jpg",
    "/ads/ad-6.jpg"
  ];

  return (
    <div className="relative min-h-screen">
      {/* Hero overlay background */}
      <div className="absolute inset-0 z-0 bg-white">
        <Image
          src="/hero/hero-overlay.png"
          alt="Hero overlay"
          fill
          className="object-cover"
          priority
        />
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 lg:py-16 relative z-10"
      >
        <div className="grid lg:grid-cols-2 gap-8 lg:gap-12 items-center min-h-[70vh] lg:min-h-[80vh]">
          {/* Left Content Section */}
          <motion.div
            className="space-y-6 lg:space-y-8"
            variants={containerVariants}
            initial="hidden"
            animate="visible"
          >
            {/* AI-Powered Header */}
            <motion.div
              variants={itemVariants}
              className="flex items-center gap-2 text-xs sm:text-sm font-medium text-gray-700"
            >
              <div className="w-2 h-2 sm:w-3 sm:h-3 bg-purple-600 transform rotate-45"></div>
              <span>AI-Powered Thumbnail Generation</span>
              <ArrowRight className="w-3 h-3 sm:w-4 sm:h-4 text-purple-600" />
            </motion.div>

            {/* Main Headline */}
            <motion.h1
              variants={itemVariants}
              className="text-3xl sm:text-4xl md:text-5xl lg:text-5xl lg:font-black font-bold text-gray-900 leading-tight"
            >
              Create High-Performing{" "}
              <span className="bg-gradient-to-r from-[#B049F4] to-[#F98888] bg-clip-text text-transparent">YouTube Thumbnails</span>{" "}
              in 60 Seconds!
            </motion.h1>

            {/* Description */}
            <motion.p
              variants={itemVariants}
              className="text-base sm:text-lg text-gray-600 max-w-xl leading-relaxed"
            >
              Generate context-aware, on-brand thumbnails automatically by combining your video content, brand assets, and proven templates.
            </motion.p>

            {/* Social Proof */}
            <motion.div
              variants={itemVariants}
              className="flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-4"
            >
              <div className="flex -space-x-2">
                {[
                  "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&h=100&fit=crop&crop=faces",
                  "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop&crop=faces",
                  "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=100&h=100&fit=crop&crop=faces",
                  "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=100&h=100&fit=crop&crop=faces",
                  "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&h=100&fit=crop&crop=faces"
                ].map((url, i) => (
                  <div
                    key={i}
                    className="relative w-6 h-6 sm:w-8 sm:h-8 rounded-full border-2 border-white overflow-hidden"
                  >
                    <Image
                      src={url}
                      alt={`User avatar ${i + 1}`}
                      fill
                      className="object-cover"
                    />
                  </div>
                ))}
                <div className="w-6 h-6 sm:w-8 sm:h-8 rounded-full bg-gray-200 border-2 border-white flex items-center justify-center text-xs font-semibold text-gray-600">
                  +2M
                </div>
              </div>
              <div className="flex items-center gap-1">
                {[1, 2, 3, 4, 5].map((i) => (
                  <Star key={i} className="w-3 h-3 sm:w-4 sm:h-4 fill-yellow-400 text-yellow-400" />
                ))}
                <span className="text-xs sm:text-sm font-medium text-gray-700 ml-2">
                  Trusted by creators
                </span>
              </div>
            </motion.div>

            {/* Trust Indicators */}
            <motion.div
              variants={itemVariants}
              className="flex flex-col sm:flex-row gap-2 sm:gap-4"
            >
              <div className="flex items-center gap-2 text-xs sm:text-sm text-green-600">
                <CheckCircle2 className="w-3 h-3 sm:w-4 sm:h-4" />
                <span>No credit card required</span>
              </div>
              <div className="flex items-center gap-2 text-xs sm:text-sm text-green-600">
                <CheckCircle2 className="w-3 h-3 sm:w-4 sm:h-4" />
                <span>10 free thumbnails</span>
              </div>
            </motion.div>

            {/* CTA Buttons */}
            <motion.div
              variants={itemVariants}
              className="flex flex-col sm:flex-row gap-3 sm:gap-4"
            >
              {!isSignedIn ? (
                <>
                  <Button variant="brand" size="lg" className="w-full sm:w-auto" asChild>
                    <Link href="/dashboard">Get Started</Link>
                  </Button>
                  <Button size="lg" variant="outline" className="w-full sm:w-auto" asChild>
                    <Link
                      target="_blank"
                      href="https://cal.com/jayships/30-min-meeting-krillion-ai"
                    >
                      Book a Demo
                    </Link>
                  </Button>
                </>
              ) : (
                <>
                  <Button variant="brand" size="lg" className="w-full sm:w-auto" asChild>
                    <Link href="/dashboard">Dashboard</Link>
                  </Button>
                </>
              )}
            </motion.div>
          </motion.div>

          {/* Right Ads Section */}
          <motion.div
            variants={itemVariants}
            className="relative mt-8 lg:mt-0"
            initial="hidden"
            animate="visible"
          >
            <div className="relative overflow-hidden space-y-3 lg:space-y-4">
              {/* First row of ads */}
              <Marquee
                gradient={false}
                speed={30}
                pauseOnHover={true}
                direction="left"
                className="py-2"
              >
                {ads.map((ad, index) => (
                  <div
                    key={index}
                    className="relative aspect-square w-32 h-32 sm:w-40 sm:h-40 lg:w-48 lg:h-48 mx-1 sm:mx-2 rounded-lg overflow-hidden shadow-lg hover:shadow-xl transition-shadow duration-300"
                  >
                    <Image
                      src={ad}
                      alt={`Ad example ${index + 1}`}
                      fill
                      className="object-cover"
                      sizes="(max-width: 640px) 128px, (max-width: 1024px) 160px, 192px"
                    />
                    {index === 0 && (
                      <div className="absolute inset-0 bg-black/20 flex items-center justify-center">
                        <div className="w-8 h-8 sm:w-10 sm:h-10 lg:w-12 lg:h-12 bg-red-600 rounded-full flex items-center justify-center">
                          <div className="w-0 h-0 border-l-[6px] sm:border-l-[8px] border-l-white border-y-[4px] sm:border-y-[6px] border-y-transparent ml-1"></div>
                        </div>
                      </div>
                    )}
                  </div>
                ))}
                {/* Duplicate ads for seamless loop */}
                {ads.map((ad, index) => (
                  <div
                    key={`duplicate-${index}`}
                    className="relative aspect-square w-32 h-32 sm:w-40 sm:h-40 lg:w-48 lg:h-48 mx-1 sm:mx-2 rounded-lg overflow-hidden shadow-lg hover:shadow-xl transition-shadow duration-300"
                  >
                    <Image
                      src={ad}
                      alt={`Ad example ${index + 1}`}
                      fill
                      className="object-cover"
                      sizes="(max-width: 640px) 128px, (max-width: 1024px) 160px, 192px"
                    />
                    {index === 0 && (
                      <div className="absolute inset-0 bg-black/20 flex items-center justify-center">
                        <div className="w-8 h-8 sm:w-10 sm:h-10 lg:w-12 lg:h-12 bg-red-600 rounded-full flex items-center justify-center">
                          <div className="w-0 h-0 border-l-[6px] sm:border-l-[8px] border-l-white border-y-[4px] sm:border-y-[6px] border-y-transparent ml-1"></div>
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </Marquee>

              {/* Second row of ads */}
              <Marquee
                gradient={false}
                speed={25}
                pauseOnHover={true}
                direction="right"
                className="py-2"
              >
                {ads.map((ad, index) => (
                  <div
                    key={`row2-${index}`}
                    className="relative aspect-square w-32 h-32 sm:w-40 sm:h-40 lg:w-48 lg:h-48 mx-1 sm:mx-2 rounded-lg overflow-hidden shadow-lg hover:shadow-xl transition-shadow duration-300"
                  >
                    <Image
                      src={ad}
                      alt={`Ad example ${index + 1}`}
                      fill
                      className="object-cover"
                      sizes="(max-width: 640px) 128px, (max-width: 1024px) 160px, 192px"
                    />
                    {index === 2 && (
                      <div className="absolute inset-0 bg-black/20 flex items-center justify-center">
                        <div className="w-8 h-8 sm:w-10 sm:h-10 lg:w-12 lg:h-12 bg-red-600 rounded-full flex items-center justify-center">
                          <div className="w-0 h-0 border-l-[6px] sm:border-l-[8px] border-l-white border-y-[4px] sm:border-y-[6px] border-y-transparent ml-1"></div>
                        </div>
                      </div>
                    )}
                  </div>
                ))}
                {/* Duplicate ads for seamless loop */}
                {ads.map((ad, index) => (
                  <div
                    key={`row2-duplicate-${index}`}
                    className="relative aspect-square w-32 h-32 sm:w-40 sm:h-40 lg:w-48 lg:h-48 mx-1 sm:mx-2 rounded-lg overflow-hidden shadow-lg hover:shadow-xl transition-shadow duration-300"
                  >
                    <Image
                      src={ad}
                      alt={`Ad example ${index + 1}`}
                      fill
                      className="object-cover"
                      sizes="(max-width: 640px) 128px, (max-width: 1024px) 160px, 192px"
                    />
                    {index === 2 && (
                      <div className="absolute inset-0 bg-black/20 flex items-center justify-center">
                        <div className="w-8 h-8 sm:w-10 sm:h-10 lg:w-12 lg:h-12 bg-red-600 rounded-full flex items-center justify-center">
                          <div className="w-0 h-0 border-l-[6px] sm:border-l-[8px] border-l-white border-y-[4px] sm:border-y-[6px] border-y-transparent ml-1"></div>
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </Marquee>
            </div>
          </motion.div>
        </div>

        {/* Trusted By Section */}
        <motion.div
          variants={itemVariants}
          className="text-center mt-12 lg:mt-16"
          initial="hidden"
          animate="visible"
        >
          <p className="text-xs sm:text-sm font-semibold text-gray-700 mb-4 sm:mb-6">
            TRUSTED BY 1,000+ CREATORS & AGENCIES
          </p>
          <div className="flex justify-center items-center gap-8 sm:gap-12 lg:gap-16 flex-wrap">
            {[1, 2, 3, 4, 5, 6, 7].map((i) => (
              <div
                key={i}
                className="w-16 h-16 sm:w-20 sm:h-20 lg:w-24 lg:h-24 bg-white rounded-lg shadow-sm flex items-center justify-center"
              >
                <Image
                  src={`/logo/brand-logos/${i}.png`}
                  alt={`Brand ${i}`}
                  width={48}
                  height={48}
                  className="w-12 h-12 sm:w-14 sm:h-14 lg:w-16 lg:h-16 object-contain"
                />
              </div>
            ))}
          </div>
        </motion.div>
      </div>
    </div>
  );
}
