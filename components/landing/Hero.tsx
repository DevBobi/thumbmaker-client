"use client";

import { Button } from "@/components/ui/button";
import Link from "next/link";
import { ShaderGradientComponent } from "../ui/shader-gradient";
import { useEffect } from "react";
import { useState } from "react";
import { useUser } from "@clerk/nextjs";
import { CheckCircle2 } from "lucide-react";
import {
  HoverCard,
  HoverCardContent,
  HoverCardTrigger,
} from "@/components/ui/hover-card";
import { useTheme } from "next-themes";
import { motion } from "framer-motion";

export function Hero() {
  const [mounted, setMounted] = useState(false);
  const { isSignedIn } = useUser();
  const { theme } = useTheme();

  useEffect(() => {
    setMounted(true);
  }, []);

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

  return (
    <div className="relative">
      <div className="absolute inset-0 -z-0 h-screen w-full  dark:bg-[radial-gradient(#1b1b1b_1px,transparent_1px)] bg-[radial-gradient(#e5e7eb_1px,transparent_1px)] [background-size:16px_16px]"></div>

      <div className="max-w-6xl mx-auto md:py-24 py-16 overflow-hidden relative z-10">
        <div className="px-4 sm:px-6 lg:px-8 py-16 w-full">
          {/* Header Section */}
          <motion.div
            className="text-center"
            variants={containerVariants}
            initial="hidden"
            animate="visible"
          >
            <motion.h1
              variants={itemVariants}
              className="max-w-3xl mx-auto text-3xl sm:text-4xl md:text-5xl font-bold mb-4 sm:mb-6 text-foreground leading-tight"
            >
              The AI platform for world-class static ads
            </motion.h1>
            <motion.p
              variants={itemVariants}
              className="text-base sm:text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto mb-8 sm:mb-10 leading-relaxed"
            >
              Create revenue-generating ads in seconds, modeled after campaigns
              that drove billions in sales.
            </motion.p>

            <motion.div
              variants={itemVariants}
              className="flex flex-col sm:flex-row items-center justify-center gap-4"
            >
              {!isSignedIn ? (
                <>
                  <Button variant="brand" size="lg" asChild>
                    <Link href="/dashboard">Get Started</Link>
                  </Button>
                  <Button size="lg" variant="outline" asChild>
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
                  <Button variant="brand" size="lg" asChild>
                    <Link href="/dashboard">Dashboard</Link>
                  </Button>
                </>
              )}
            </motion.div>
            <motion.div
              variants={itemVariants}
              className="flex items-center justify-center"
            >
              <HoverCard>
                <HoverCardTrigger asChild>
                  <p className="max-w-2xl flex items-center gap-2 mt-4 text-sm text-brand-600 dark:text-brand-400 font-semibold mb-8 sm:mb-10 underline cursor-pointer">
                    100% money back guarantee
                  </p>
                </HoverCardTrigger>
                <HoverCardContent className="w-80">
                  <div className="space-y-2">
                    <h4 className="text-sm font-semibold">Our Guarantee</h4>
                    <p className="text-sm">
                      If you generate no more than 10 ads and don't like the
                      outputs, we'll give you a 100% refund. No questions asked!
                    </p>
                  </div>
                </HoverCardContent>
              </HoverCard>
            </motion.div>
            <motion.div
              variants={itemVariants}
              className="flex items-center justify-center z-30"
            >
              <iframe
                className="w-full sm:w-[90%] md:w-[80%] max-w-4xl aspect-video rounded-2xl shadow-2xl ring-2 ring-brand-600 z-30"
                src="https://www.youtube.com/embed/MI-6kyULoUE"
                title="Product Demo Video"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
              />
            </motion.div>
          </motion.div>
        </div>
      </div>
      <div className="relative h-full w-full bg-[#f8fafc]">
        <div className="absolute bottom-0 left-0 right-0 top-0 bg-[linear-gradient(to_right,#0000001a_1px,transparent_1px),linear-gradient(to_bottom,#0000001a_1px,transparent_1px)] bg-[size:40px_40px] "></div>
      </div>
    </div>
  );
}
