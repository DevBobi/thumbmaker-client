"use client";

import Image from "next/image";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { motion } from "framer-motion";
import feature1 from "@/public/features/feature-1.png";
import feature2 from "@/public/features/feature-2.png";
import feature3 from "@/public/features/feature-3.png";

const steps = [
  {
    title: "Create a Project",
    description:
      "Paste your script, drop a YouTube link, or describe your video manually. ThumbMaker builds a project profile automatically so every thumbnail matches the story.",
    tag: "Template library",
    image: feature1,
    bg: "bg-[#F7F0F2]",
  },
  {
    title: "Choose Your Templates",
    description:
      "AI creates 20 thumbnail variations instantly. Pick your top 3, upload to YouTube, and let the data choose your winner.",
    tag: "Template library",
    image: feature2,
    bg: "bg-transparent !border-none",
  },
  {
    title: "Generate & Test",
    description:
      "Explore 5,000+ design templates based on millions of high-performing thumbnails. Browse by category, style, or search by tags.",
    tag: "Template library",
    image: feature3,
    bg: "bg-[#F7F0F2]",
  },
];

export function Features() {
  return (
    <section id="how-it-works" className="bg-[#FFFCF9] px-4 py-24 sm:px-6">
      <div className="mx-auto max-w-6xl space-y-12">
        <div className="text-center space-y-4">
          <p className="text-xs font-semibold uppercase tracking-[0.3em] text-rose-500">
            How it works
          </p>
          <h2 className="text-3xl font-semibold text-gray-900 sm:text-5xl">
            Three simple steps to viral thumbnails
          </h2>
          <p className="mx-auto max-w-2xl text-base text-muted-foreground">
            From concept to upload-ready assets in minutes. No design skills needed.
          </p>
        </div>

        <div className="space-y-10">
          {steps.map((step, index) => (
            <motion.div
              key={step.title}
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              className={`rounded-[32px] border border-black/5 ${step.bg} px-6 py-8 sm:px-10`}
            >
              <div
                className={`grid items-center gap-8 lg:grid-cols-2 ${
                  index % 2 === 1 ? "lg:[&>*:first-child]:order-2 lg:[&>*:last-child]:order-1" : ""
                }`}
              >
                <div className="space-y-4">
                  <span className="inline-flex items-center rounded-full border border-black/10 bg-white/70 px-4 py-1 text-xs font-semibold uppercase tracking-[0.2em] text-muted-foreground">
                    {step.tag}
                  </span>
                  <h3 className="text-2xl font-semibold text-gray-900 sm:text-3xl">{step.title}</h3>
                  <p className="text-base text-muted-foreground">{step.description}</p>
                  <Button asChild className="rounded-full px-5 shadow-sm">
                    <Link href="/sign-up">Try For Free ✨</Link>
                  </Button>
                </div>
                <div className="relative w-full flex justify-center">
                  <div
                    className={`relative w-full  ${
                      index === steps.length - 1 ? "max-w-[320px]" : "max-w-[360px]"
                    } ${
                      index === 0
                        ? " "
                        : index === 1
                          ? ""
                          : index === 2
                            ? ""
                            : "rounded-md border border-black/5 bg-white shadow-xl p-3"
                    }`}
                  >
                    <Image
                      src={step.image}
                      alt={step.title}
                      className={`w-full h-auto ${
                        index === steps.length - 1 ? "max-h-[300px] object-contain" : ""
                      }${index === 0 ? " rounded-2xl" : ""}`}
                      priority={index === 0}
                      placeholder="blur"
                      quality={100}
                    />
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
