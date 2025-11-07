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

  // Sample thumbnails for the carousel
  const thumbnails = [
    "/thumbnails/1.jpg",
    "/thumbnails/2.jpg",
    "/thumbnails/3.jpg",
    "/thumbnails/4.jpg",
    "/thumbnails/5.jpg",
    "/thumbnails/6.jpg"
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
        <div className="grid lg:grid-cols-2 gap-8 lg:gap-12 items-start lg:items-center min-h-[70vh] lg:min-h-[80vh]">
          {/* Left Content Section */}
          <motion.div
            className="space-y-4 lg:space-y-5"
            variants={containerVariants}
            initial="hidden"
            animate="visible"
          >
            {/* AI-Powered Header */}
            <motion.div
              variants={itemVariants}
              className="flex items-center gap-2 text-xs sm:text-sm font-medium text-gray-700"
            >
              <div className="w-2 h-2 sm:w-3 sm:h-3 bg-[#FF0000] transform rotate-45"></div>
              <span>AI-Powered Thumbnail Generation</span>
              <ArrowRight className="w-3 h-3 sm:w-4 sm:h-4 text-[#FF0000]" />
            </motion.div>

            {/* Main Headline */}
            <motion.h1
              variants={itemVariants}
              className="text-3xl sm:text-4xl md:text-5xl lg:text-5xl lg:font-black font-bold text-gray-900 leading-[1.1]"
            >
              Create High-Performing{" "}
              <span className="bg-gradient-to-r from-[#FF0000] to-[#FF6B6B] bg-clip-text text-transparent">YouTube Thumbnails</span>{" "}
              in 60 Seconds!
            </motion.h1>

            {/* Description */}
            <motion.p
              variants={itemVariants}
              className="text-base sm:text-lg text-gray-600 max-w-xl leading-snug"
            >
              Generate context-aware, on-brand thumbnails automatically by combining your video content, brand assets, and proven templates.
            </motion.p>

            {/* Social Proof */}
            <motion.div
              variants={itemVariants}
              className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-3"
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
              className="flex flex-col sm:flex-row gap-2 sm:gap-3"
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
              className="flex flex-col sm:flex-row gap-2 sm:gap-3"
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

          {/* Right Thumbnails Section */}
          <motion.div
            variants={itemVariants}
            className="relative mt-8 lg:mt-0 flex items-center justify-center h-full"
            initial="hidden"
            animate="visible"
          >
            <div className="relative overflow-hidden space-y-5 lg:space-y-6 w-full">
              {/* First row of thumbnails */}
              <Marquee
                gradient={false}
                speed={25}
                pauseOnHover={true}
                direction="left"
                className="py-2"
              >
                {thumbnails.map((thumbnail, index) => (
                  <div
                    key={index}
                    className="relative w-48 sm:w-60 lg:w-80 aspect-[16/9] mx-2 sm:mx-3 rounded-xl overflow-hidden shadow-xl hover:shadow-2xl transition-all duration-300 hover:scale-[1.02] border-2 border-white/20"
                  >
                    <Image
                      src={thumbnail}
                      alt={`Thumbnail example ${index + 1}`}
                      fill
                      className="object-cover"
                      quality={95}
                      sizes="(max-width: 640px) 192px, (max-width: 1024px) 240px, 320px"
                    />
                    {index === 0 && (
                      <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent flex items-center justify-center">
                        <div className="w-10 h-10 sm:w-12 sm:h-12 lg:w-14 lg:h-14 bg-red-600 rounded-full flex items-center justify-center shadow-lg hover:bg-red-700 transition-colors">
                          <div className="w-0 h-0 border-l-[8px] sm:border-l-[10px] border-l-white border-y-[6px] sm:border-y-[8px] border-y-transparent ml-1"></div>
                        </div>
                      </div>
                    )}
                  </div>
                ))}
                {/* Duplicate thumbnails for seamless loop */}
                {thumbnails.map((thumbnail, index) => (
                  <div
                    key={`duplicate-${index}`}
                    className="relative w-48 sm:w-60 lg:w-80 aspect-[16/9] mx-2 sm:mx-3 rounded-xl overflow-hidden shadow-xl hover:shadow-2xl transition-all duration-300 hover:scale-[1.02] border-2 border-white/20"
                  >
                    <Image
                      src={thumbnail}
                      alt={`Thumbnail example ${index + 1}`}
                      fill
                      className="object-cover"
                      quality={95}
                      sizes="(max-width: 640px) 192px, (max-width: 1024px) 240px, 320px"
                    />
                    {index === 0 && (
                      <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent flex items-center justify-center">
                        <div className="w-10 h-10 sm:w-12 sm:h-12 lg:w-14 lg:h-14 bg-red-600 rounded-full flex items-center justify-center shadow-lg hover:bg-red-700 transition-colors">
                          <div className="w-0 h-0 border-l-[8px] sm:border-l-[10px] border-l-white border-y-[6px] sm:border-y-[8px] border-y-transparent ml-1"></div>
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </Marquee>

              {/* Second row of thumbnails */}
              <Marquee
                gradient={false}
                speed={20}
                pauseOnHover={true}
                direction="right"
                className="py-2"
              >
                {thumbnails.map((thumbnail, index) => (
                  <div
                    key={`row2-${index}`}
                    className="relative w-48 sm:w-60 lg:w-80 aspect-[16/9] mx-2 sm:mx-3 rounded-xl overflow-hidden shadow-xl hover:shadow-2xl transition-all duration-300 hover:scale-[1.02] border-2 border-white/20"
                  >
                    <Image
                      src={thumbnail}
                      alt={`Thumbnail example ${index + 1}`}
                      fill
                      className="object-cover"
                      quality={95}
                      sizes="(max-width: 640px) 192px, (max-width: 1024px) 240px, 320px"
                    />
                    {index === 2 && (
                      <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent flex items-center justify-center">
                        <div className="w-10 h-10 sm:w-12 sm:h-12 lg:w-14 lg:h-14 bg-red-600 rounded-full flex items-center justify-center shadow-lg hover:bg-red-700 transition-colors">
                          <div className="w-0 h-0 border-l-[8px] sm:border-l-[10px] border-l-white border-y-[6px] sm:border-y-[8px] border-y-transparent ml-1"></div>
                        </div>
                      </div>
                    )}
                  </div>
                ))}
                {/* Duplicate thumbnails for seamless loop */}
                {thumbnails.map((thumbnail, index) => (
                  <div
                    key={`row2-duplicate-${index}`}
                    className="relative w-48 sm:w-60 lg:w-80 aspect-[16/9] mx-2 sm:mx-3 rounded-xl overflow-hidden shadow-xl hover:shadow-2xl transition-all duration-300 hover:scale-[1.02] border-2 border-white/20"
                  >
                    <Image
                      src={thumbnail}
                      alt={`Thumbnail example ${index + 1}`}
                      fill
                      className="object-cover"
                      quality={95}
                      sizes="(max-width: 640px) 192px, (max-width: 1024px) 240px, 320px"
                    />
                    {index === 2 && (
                      <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent flex items-center justify-center">
                        <div className="w-10 h-10 sm:w-12 sm:h-12 lg:w-14 lg:h-14 bg-red-600 rounded-full flex items-center justify-center shadow-lg hover:bg-red-700 transition-colors">
                          <div className="w-0 h-0 border-l-[8px] sm:border-l-[10px] border-l-white border-y-[6px] sm:border-y-[8px] border-y-transparent ml-1"></div>
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
