"use client";

import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import Image from "next/image";
import React, { useState } from "react";
import { cn } from "@/lib/utils";
import Marquee from "react-fast-marquee";

// Sample gallery images - replace with your actual images
const gallery = [
  {
    category: "Cosmetics",
    images: [
      { src: "/ads/cosmetics/1.png", alt: "Cosmetics photography example 1" },
      { src: "/ads/cosmetics/2.png", alt: "Cosmetics photography example 2" },
      { src: "/ads/cosmetics/3.png", alt: "Cosmetics photography example 3" },
      { src: "/ads/cosmetics/4.png", alt: "Cosmetics photography example 4" },
      { src: "/ads/cosmetics/5.png", alt: "Cosmetics photography example 5" },
      { src: "/ads/cosmetics/6.png", alt: "Cosmetics photography example 6" },
      { src: "/ads/cosmetics/7.png", alt: "Cosmetics photography example 7" },
      { src: "/ads/cosmetics/8.png", alt: "Cosmetics photography example 8" },
      { src: "/ads/cosmetics/9.png", alt: "Cosmetics photography example 9" },
      { src: "/ads/cosmetics/10.png", alt: "Cosmetics photography example 10" },
      { src: "/ads/cosmetics/11.png", alt: "Cosmetics photography example 11" },
    ],
  },
  {
    category: "Fashion & Apparel",
    images: [
      {
        src: "/ads/fashion/1.png",
        alt: "Fashion & Apparel photography example 1",
      },
      {
        src: "/ads/fashion/2.png",
        alt: "Fashion & Apparel photography example 2",
      },
      {
        src: "/ads/fashion/3.png",
        alt: "Fashion & Apparel photography example 3",
      },
      {
        src: "/ads/fashion/4.png",
        alt: "Fashion & Apparel photography example 4",
      },
      {
        src: "/ads/fashion/5.png",
        alt: "Fashion & Apparel photography example 5",
      },
      {
        src: "/ads/fashion/6.png",
        alt: "Fashion & Apparel photography example 6",
      },
      {
        src: "/ads/fashion/7.png",
        alt: "Fashion & Apparel photography example 7",
      },
    ],
  },
  {
    category: "Gadgets & Wearables",
    images: [
      { src: "/ads/gadgets/1.png", alt: "Gadgets photography example 1" },
      { src: "/ads/gadgets/2.png", alt: "Gadgets photography example 2" },
      { src: "/ads/gadgets/3.png", alt: "Gadgets photography example 3" },
      { src: "/ads/gadgets/4.png", alt: "Gadgets photography example 4" },
      { src: "/ads/gadgets/5.png", alt: "Gadgets photography example 5" },
      { src: "/ads/gadgets/6.png", alt: "Gadgets photography example 6" },
    ],
  },
  {
    category: "SaaS",
    images: [
      { src: "/ads/saas/1.png", alt: "SaaS photography example 1" },
      { src: "/ads/saas/2.png", alt: "SaaS photography example 2" },
      { src: "/ads/saas/3.png", alt: "SaaS photography example 3" },
      { src: "/ads/saas/4.png", alt: "SaaS photography example 4" },
      { src: "/ads/saas/5.png", alt: "SaaS photography example 5" },
      { src: "/ads/saas/6.png", alt: "SaaS photography example 6" },
      { src: "/ads/saas/7.png", alt: "SaaS photography example 7" },
      { src: "/ads/saas/8.png", alt: "SaaS photography example 8" },
    ],
  },
  {
    category: "Snacks & Drinks",
    images: [
      {
        src: "/ads/snacks/1.png",
        alt: "Snacks & Drinks photography example 1",
      },
      {
        src: "/ads/snacks/2.png",
        alt: "Snacks & Drinks photography example 2",
      },
      {
        src: "/ads/snacks/3.png",
        alt: "Snacks & Drinks photography example 3",
      },
      {
        src: "/ads/snacks/4.png",
        alt: "Snacks & Drinks photography example 4",
      },
      {
        src: "/ads/snacks/5.png",
        alt: "Snacks & Drinks photography example 5",
      },
      {
        src: "/ads/snacks/6.png",
        alt: "Snacks & Drinks photography example 6",
      },
      {
        src: "/ads/snacks/7.png",
        alt: "Snacks & Drinks photography example 7",
      },
    ],
  },
  {
    category: "Home & Kitchen",
    images: [
      { src: "/ads/kitchen/1.png", alt: "Product photography example 1" },
      { src: "/ads/kitchen/2.png", alt: "Product photography example 2" },
      { src: "/ads/kitchen/3.png", alt: "Product photography example 3" },
      { src: "/ads/kitchen/4.png", alt: "Product photography example 4" },
      { src: "/ads/kitchen/5.png", alt: "Product photography example 5" },
    ],
  },
];

const MarqueeGallery = ({
  images,
}: {
  images: { src: string; alt: string }[];
}) => {
  return (
    <div className="max-w-6xl mx-auto mt-8">
      <Marquee gradient={false} speed={40} pauseOnHover={true} direction="left">
        {images.map((img, idx) => (
          <div
            key={idx}
            className="mx-2 rounded-xl overflow-hidden shadow-lg bg-white hover:shadow-xl transition-shadow duration-300"
          >
            <div className="relative aspect-square w-[200px] h-[200px] md:w-[350px] md:h-[350px]">
              <Image
                src={img.src}
                alt={img.alt}
                fill
                sizes="(max-width: 768px) 200px, 350px"
                className="object-cover border"
                priority={idx === 0}
                quality={90}
              />
            </div>
          </div>
        ))}
      </Marquee>
    </div>
  );
};

export function ExploreGallery() {
  const [selectedCategory, setSelectedCategory] = useState(gallery[0].category);

  return (
    <section
      id="gallery"
      className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-20 bg-white"
    >
      <div className="">
        <div className="max-w-6xl mx-auto">
          <h3 className="text-sm mb-4 font-medium text-gray-600">Examples ads generated</h3>
          <h1 className="text-4xl md:text-5xl lg:text-6xl text-gray-900 leading-tight mb-2 font-bold">
            All these ads were one-shot by THUMBMAKER. Try it to believe!
          </h1>
        </div>
        <Tabs
          value={selectedCategory}
          onValueChange={setSelectedCategory}
          className="mt-8"
        >
          <div className="max-w-6xl w-full mx-auto">
            <TabsList className="gap-2 bg-transparent p-0 flex-wrap h-fit justify-start">
              {gallery.map((cat) => (
                <TabsTrigger
                  key={cat.category}
                  value={cat.category}
                  className={cn(
                    "border bg-transparent w-auto inline-flex shrink-0 flex-none px-6 py-2 rounded-full transition-all duration-300 cursor-pointer",
                    selectedCategory === cat.category
                      ? "border-brand-600 text-brand-600"
                      : "border-gray-300 text-gray-600 hover:border-brand-600/50"
                  )}
                >
                  {cat.category}
                </TabsTrigger>
              ))}
            </TabsList>
          </div>
          {gallery.map((cat) => (
            <TabsContent key={cat.category} value={cat.category}>
              <MarqueeGallery images={cat.images} />
            </TabsContent>
          ))}
        </Tabs>
      </div>
    </section>
  );
}
