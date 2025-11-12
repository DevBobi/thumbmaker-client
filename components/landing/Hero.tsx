"use client";

import { Button } from "@/components/ui/button";
import Link from "next/link";
import { useUser } from "@clerk/nextjs";
import { CheckCircle2, Star, ArrowRight } from "lucide-react";
import { motion } from "framer-motion";
import Image from "next/image";
import Marquee from "react-fast-marquee";
import { useRouter } from "next/navigation";

export function Hero() {
  const { isSignedIn } = useUser();
  const router = useRouter();

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

  // Featured thumbnails mapped to actual templates
  const thumbnailsWithTemplateIds = [
    { image: "/thumbnails/1.jpg", templateId: "cmhss5bit00l1rpa0ljfxipmd", creator: "Our Rich Journey", title: "The Real Reason Americans Are Leaving Po..." },
    { image: "/thumbnails/2.jpg", templateId: "cmhss5a2700j1rpa0rq0mfl0x", creator: "Ramit Sethi", title: "You Can Change Your Finances in 6 Months..." },
    { image: "/thumbnails/3.jpg", templateId: "cmhss5ask00k1rpa0b4u5a66x", creator: "The Financial Diet", title: "How 'Sex & The City' Ruined Women's Rela..." },
    { image: "/thumbnails/4.jpg", templateId: "cmhss59ux00irrpa0fic2e7s0", creator: "Meet Kevin", title: "Yikes: WSJ *Just* Exposed Covid Vaccines..." },
    { image: "/thumbnails/5.jpg", templateId: "cmhss5a3n00j3rpa0h8jd45hv", creator: "Ramit Sethi", title: "These are the 2 Worst Banks in America (..." },
    { image: "/thumbnails/6.jpg", templateId: "cmhss5a5500j5rpa03oo8redr", creator: "Ramit Sethi", title: "Money Expert Reacts to Finance TikToks..." },
    { image: "/thumbnails/7.jpg", templateId: "cmhss5a9i00jbrpa0ebebyo7y", creator: "Ramit Sethi", title: "Why You Should Stop Listening To These F..." },
    { image: "/thumbnails/8.jpg", templateId: "cmhss5au000k3rpa012qqqdw3", creator: "The Financial Diet", title: "An Honest Conversation On The Problem Wi..." },
    { image: "/thumbnails/9.jpg", templateId: "cmhss5bk900l3rpa0io4tkmav", creator: "Our Rich Journey", title: "Why You Need to Leave America Before It'..." },
    { image: "/thumbnails/10.jpg", templateId: "cmhss5avh00k5rpa0t3hqtc7k", creator: "The Financial Diet", title: "How The Wealthy Gaslight America..." },
    { image: "/thumbnails/11.jpg", templateId: "cmhss5awx00k7rpa0h65of4r3", creator: "The Financial Diet", title: "5 \"Growing Up Poor\" Habits You May Not R..." },
    { image: "/thumbnails/12.jpg", templateId: "cmhss5a6l00j7rpa0ixwolbv4", creator: "Ramit Sethi", title: "Renting vs Buying a Home: The Lie You've..." },
    { image: "/thumbnails/13.jpg", templateId: "cmhss5a8200j9rpa05689h5rv", creator: "Ramit Sethi", title: "How to Become a Millionaire on a Low Sal..." },
    { image: "/thumbnails/14.jpg", templateId: "cmhss5aye00k9rpa0k58b24tn", creator: "The Financial Diet", title: "The \"Growing Up Poor\" Tax..." },
    { image: "/thumbnails/15.jpg", templateId: "cmhss5azw00kbrpa0w6dx4qsf", creator: "The Financial Diet", title: "How Gen Z Became The \"Buy Everything, Ow..." },
    { image: "/thumbnails/16.jpg", templateId: "cmhss59wd00itrpa0siw4fkit", creator: "Meet Kevin", title: "Boxabl's $3 Billion Dollar Fraud | Elon ..." },
    { image: "/thumbnails/17.jpg", templateId: "cmhss59xu00ivrpa0w7kxkz7s", creator: "Meet Kevin", title: "Tucker Carlson Interviews Putin [Full Su..." },
  ];

  const handleThumbnailClick = (templateId: string) => {
    if (!isSignedIn) {
      // Store redirect path for after login
      if (typeof window !== 'undefined') {
        sessionStorage.setItem('redirectAfterLogin', `/dashboard/templates?template=${templateId}`);
      }
      router.push('/sign-in');
    } else {
      router.push(`/dashboard/templates?template=${templateId}`);
    }
  };

  return (
    <div className="relative min-h-screen pt-12 sm:pt-14 md:pt-16 overflow-x-hidden">
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

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-10 md:py-12 lg:py-16 xl:py-20 relative z-10 overflow-x-hidden">
        <div className="grid lg:grid-cols-2 gap-8 sm:gap-10 md:gap-12 lg:gap-16 items-start lg:items-center min-h-[calc(100vh-6rem)] sm:min-h-[calc(100vh-5rem)] lg:min-h-[75vh]">
          {/* Left Content Section */}
          <motion.div
            className="space-y-4 sm:space-y-5 md:space-y-6 lg:space-y-7 max-w-full overflow-hidden"
            variants={containerVariants}
            initial="hidden"
            animate="visible"
          >
            {/* AI-Powered Header */}
            <motion.div
              variants={itemVariants}
              className="flex items-center gap-2 text-xs sm:text-sm md:text-base font-medium text-muted-foreground flex-wrap"
            >
              <div className="w-2 h-2 sm:w-2.5 sm:h-2.5 md:w-3 md:h-3 bg-[#FF0000] transform rotate-45 flex-shrink-0"></div>
              <span className="whitespace-nowrap">AI-Powered Thumbnail Generation</span>
              <ArrowRight className="w-3 h-3 sm:w-4 sm:h-4 md:w-5 md:h-5 text-[#FF0000] flex-shrink-0" />
            </motion.div>

            {/* Main Headline */}
            <motion.h1
              variants={itemVariants}
              className="font-bold lg:font-black text-foreground max-w-full"
              style={{ 
                lineHeight: '1.2',
                wordWrap: 'break-word', 
                overflowWrap: 'break-word' 
              }}
            >
              <span className="block sm:inline text-lg sm:text-xl md:text-2xl lg:text-3xl xl:text-4xl">Create High-Performing </span>
              <span className="block text-3xl sm:text-4xl md:text-5xl lg:text-6xl xl:text-7xl bg-gradient-to-r from-[#FF0000] to-[#FF6B6B] bg-clip-text text-transparent">
                YouTube Thumbnails
              </span>{" "}
              <span className="block sm:inline mt-1 sm:mt-0 text-lg sm:text-xl md:text-2xl lg:text-3xl xl:text-4xl">in 60 Seconds!</span>
            </motion.h1>

            {/* Description */}
            <motion.p
              variants={itemVariants}
              className="text-xs sm:text-sm md:text-base lg:text-lg xl:text-xl text-muted-foreground leading-relaxed max-w-full lg:max-w-2xl"
              style={{ wordWrap: 'break-word', overflowWrap: 'break-word' }}
            >
              Generate context-aware, on-brand thumbnails automatically by combining your video content, brand assets, and proven templates.
            </motion.p>

            {/* Social Proof */}
            <motion.div
              variants={itemVariants}
              className="flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-4 max-w-full"
            >
              <div className="flex -space-x-2 sm:-space-x-3 flex-shrink-0">
                {[
                  "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&h=100&fit=crop&crop=faces",
                  "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop&crop=faces",
                  "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=100&h=100&fit=crop&crop=faces",
                  "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=100&h=100&fit=crop&crop=faces",
                  "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&h=100&fit=crop&crop=faces"
                ].map((url, i) => (
                  <div
                    key={i}
                    className="relative w-8 h-8 sm:w-10 sm:h-10 md:w-12 md:h-12 rounded-full border-2 sm:border-3 border-white overflow-hidden flex-shrink-0"
                  >
                    <Image
                      src={url}
                      alt={`User avatar ${i + 1}`}
                      fill
                      className="object-cover"
                    />
                  </div>
                ))}
                <div className="w-8 h-8 sm:w-10 sm:h-10 md:w-12 md:h-12 rounded-full bg-muted border-2 sm:border-3 border-white flex items-center justify-center text-[10px] sm:text-xs md:text-sm font-semibold text-muted-foreground flex-shrink-0">
                  +2M
                </div>
              </div>
              <div className="flex items-center gap-1 sm:gap-1.5 flex-wrap">
                {[1, 2, 3, 4, 5].map((i) => (
                  <Star key={i} className="w-4 h-4 sm:w-5 sm:h-5 fill-yellow-400 text-yellow-400 flex-shrink-0" />
                ))}
                <span className="text-xs sm:text-sm md:text-base font-medium text-muted-foreground ml-1 sm:ml-2 whitespace-nowrap">
                  Trusted by creators
                </span>
              </div>
            </motion.div>

            {/* Trust Indicators */}
            <motion.div
              variants={itemVariants}
              className="flex flex-col sm:flex-row gap-2 sm:gap-4 md:gap-5 flex-wrap max-w-full"
            >
              <div className="flex items-center gap-2 text-xs sm:text-sm md:text-base text-green-600">
                <CheckCircle2 className="w-4 h-4 sm:w-5 sm:h-5 flex-shrink-0" />
                <span className="whitespace-nowrap">No credit card required</span>
              </div>
              <div className="flex items-center gap-2 text-xs sm:text-sm md:text-base text-green-600">
                <CheckCircle2 className="w-4 h-4 sm:w-5 sm:h-5 flex-shrink-0" />
                <span className="whitespace-nowrap">10 free thumbnails</span>
              </div>
            </motion.div>

            {/* CTA Buttons */}
            <motion.div
              variants={itemVariants}
              className="flex flex-row gap-2 sm:gap-3 md:gap-4 pt-2 sm:pt-3 flex-wrap"
            >
              {!isSignedIn ? (
                <>
                  <Button 
                    variant="default"
                    className="flex-1 min-w-[130px] sm:flex-none sm:min-w-[140px] md:min-w-[160px] lg:min-w-[180px] h-11 sm:h-11 md:h-12 lg:h-13 xl:h-14 text-[11px] sm:text-sm md:text-base lg:text-lg px-4 sm:px-6 md:px-8 lg:px-10 font-semibold" 
                    asChild
                  >
                    <Link href="/dashboard">Get Started</Link>
                  </Button>
                  <Button 
                    variant="outline" 
                    className="border-primary text-primary hover:bg-primary/10 flex-1 min-w-[130px] sm:flex-none sm:min-w-[140px] md:min-w-[160px] lg:min-w-[180px] h-11 sm:h-11 md:h-12 lg:h-13 xl:h-14 text-[11px] sm:text-sm md:text-base lg:text-lg px-4 sm:px-6 md:px-8 lg:px-10 font-semibold" 
                    asChild
                  >
                    <Link
                      target="_blank"
                      href="https://cal.com/jayships/30-min-meeting-krillion-ai"
                    >
                      Book a Demo
                    </Link>
                  </Button>
                </>
              ) : (
                <Button
                  variant="default"
                  className="flex-1 min-w-[130px] sm:flex-none sm:min-w-[140px] md:min-w-[160px] lg:min-w-[180px] h-11 sm:h-11 md:h-12 lg:h-13 xl:h-14 text-[11px] sm:text-sm md:text-base lg:text-lg px-4 sm:px-6 md:px-8 lg:px-10 font-semibold" 
                  asChild
                >
                  <Link href="/dashboard">Dashboard</Link>
                </Button>
              )}
            </motion.div>
          </motion.div>

          {/* Right Thumbnails Section */}
          <motion.div
            variants={itemVariants}
            className="relative mt-8 sm:mt-10 lg:mt-0 flex items-center justify-center h-full order-first lg:order-last"
            initial="hidden"
            animate="visible"
          >
            <div className="relative overflow-hidden space-y-3 sm:space-y-4 md:space-y-5 lg:space-y-6 w-full max-w-full -mx-4 sm:mx-0">
              {/* First row of thumbnails */}
              <Marquee
                gradient={false}
                speed={25}
                pauseOnHover={true}
                direction="left"
                className="py-1 sm:py-1.5 md:py-2"
                play={true}
                loop={0}
              >
                {[...Array(8)].map((_, setIndex) => (
                  thumbnailsWithTemplateIds.map((thumbnail, index) => (
                    <div
                      key={`set-${setIndex}-${index}`}
                      onClick={() => handleThumbnailClick(thumbnail.templateId)}
                      className="relative w-36 sm:w-44 md:w-52 lg:w-60 xl:w-72 2xl:w-80 aspect-[16/9] mx-1.5 sm:mx-2 md:mx-2.5 lg:mx-3 rounded-lg md:rounded-xl overflow-hidden shadow-lg md:shadow-xl hover:shadow-2xl transition-all duration-300 hover:scale-[1.02] border-2 border-white/20 cursor-pointer"
                    >
                      <Image
                        src={thumbnail.image}
                        alt={`${thumbnail.creator} - ${thumbnail.title}`}
                        fill
                        className="object-cover"
                        quality={95}
                        sizes="(max-width: 640px) 144px, (max-width: 768px) 176px, (max-width: 1024px) 208px, (max-width: 1280px) 240px, (max-width: 1536px) 288px, 320px"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 hover:opacity-100 transition-opacity flex items-center justify-center">
                        <span className="text-white text-xs sm:text-sm font-semibold px-2 text-center">View Template</span>
                        </div>
                    </div>
                  ))
                ))}
              </Marquee>

              {/* Second row of thumbnails */}
              <Marquee
                gradient={false}
                speed={22}
                pauseOnHover={true}
                direction="right"
                className="py-1 sm:py-1.5 md:py-2"
                play={true}
                loop={0}
              >
                {[...Array(8)].map((_, setIndex) => (
                  thumbnailsWithTemplateIds.map((thumbnail, index) => (
                    <div
                      key={`row2-set-${setIndex}-${index}`}
                      onClick={() => handleThumbnailClick(thumbnail.templateId)}
                      className="relative w-36 sm:w-44 md:w-52 lg:w-60 xl:w-72 2xl:w-80 aspect-[16/9] mx-1.5 sm:mx-2 md:mx-2.5 lg:mx-3 rounded-lg md:rounded-xl overflow-hidden shadow-lg md:shadow-xl hover:shadow-2xl transition-all duration-300 hover:scale-[1.02] border-2 border-white/20 cursor-pointer"
                    >
                      <Image
                        src={thumbnail.image}
                        alt={`${thumbnail.creator} - ${thumbnail.title}`}
                        fill
                        className="object-cover"
                        quality={95}
                        sizes="(max-width: 640px) 144px, (max-width: 768px) 176px, (max-width: 1024px) 208px, (max-width: 1280px) 240px, (max-width: 1536px) 288px, 320px"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 hover:opacity-100 transition-opacity flex items-center justify-center">
                        <span className="text-white text-xs sm:text-sm font-semibold px-2 text-center">View Template</span>
                        </div>
                    </div>
                  ))
                ))}
              </Marquee>
            </div>
          </motion.div>
        </div>

        {/* Trusted By Section */}
        <motion.div
          variants={itemVariants}
          className="text-center mt-8 sm:mt-12 md:mt-16 lg:mt-20 px-3 sm:px-4"
          initial="hidden"
          animate="visible"
        >
          <p className="text-[10px] xs:text-xs sm:text-sm md:text-base font-semibold text-muted-foreground mb-3 sm:mb-4 md:mb-6 lg:mb-8">
            TRUSTED BY 1,000+ CREATORS & AGENCIES
          </p>
          <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-7 gap-2 xs:gap-2.5 sm:gap-3 md:gap-4 lg:gap-6 xl:gap-8 max-w-6xl mx-auto">
            {[1, 2, 3, 4, 5, 6, 7].map((i) => (
              <div
                key={i}
                className="w-full aspect-square bg-white rounded-md sm:rounded-lg shadow-sm hover:shadow-md transition-shadow flex items-center justify-center p-2 xs:p-2.5 sm:p-3 md:p-4"
              >
                <Image
                  src={`/logo/brand-logos/${i}.png`}
                  alt={`Brand ${i}`}
                  width={80}
                  height={80}
                  className="w-full h-full object-contain"
                />
              </div>
            ))}
          </div>
        </motion.div>
      </div>
    </div>
  );
}