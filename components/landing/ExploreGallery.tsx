"use client";

import Image from "next/image";
import Link from "next/link";
import React, { useMemo, useState } from "react";
import { motion } from "framer-motion";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import thumbnailsData from "@/data/thumbnails.json";

type ThumbnailRecord = {
  creator: string;
  video_link: string;
  title: string;
  image: string;
  id: string;
  tags: string;
};

const thumbnails = thumbnailsData as ThumbnailRecord[];
const MAX_RESULTS = 6;

export function ExploreGallery() {
  const [selectedCreator, setSelectedCreator] = useState<string>("all");
  const [tagQuery, setTagQuery] = useState<string>("");

  const creators = useMemo(() => {
    const uniqueCreators = Array.from(
      new Set(
        thumbnails
          .map((item) => item.creator?.trim())
          .filter((value): value is string => Boolean(value))
      )
    );
    return uniqueCreators.sort((a, b) => a.localeCompare(b));
  }, []);

  const filteredThumbnails = useMemo(() => {
    const normalizedTerms = tagQuery
      .toLowerCase()
      .split(/[,\s]+/)
      .map((term) => term.trim())
      .filter(Boolean);

    return thumbnails.filter((item) => {
      const matchesCreator =
        selectedCreator === "all" || item.creator.toLowerCase() === selectedCreator.toLowerCase();

      if (!matchesCreator) {
        return false;
      }

      if (normalizedTerms.length === 0) {
        return true;
      }

      const title = item.title?.toLowerCase() ?? "";
      const tags = item.tags?.toLowerCase() ?? "";

      return normalizedTerms.every((term) => title.includes(term) || tags.includes(term));
    });
  }, [selectedCreator, tagQuery]);

  const visibleThumbnails = useMemo(
    () => filteredThumbnails.slice(0, MAX_RESULTS),
    [filteredThumbnails]
  );

  const filtersActive = selectedCreator !== "all" || tagQuery.trim().length > 0;

  return (
    <section
      id="gallery"
      className="relative max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-20 bg-white overflow-hidden"
    >
      {/* Decorative background */}
      <div className="absolute inset-0 opacity-5">
        <div className="absolute top-0 right-1/4 w-96 h-96 bg-brand-600 rounded-full blur-3xl"></div>
        <div className="absolute bottom-0 left-1/4 w-96 h-96 bg-red-500 rounded-full blur-3xl"></div>
      </div>
      <div className="relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="max-w-6xl mx-auto"
        >
          <h3 className="text-sm mb-4 font-medium text-gray-600">Example thumbnails generated</h3>
          <h1 className="text-4xl md:text-5xl lg:text-6xl text-gray-900 leading-tight mb-2 font-bold">
            All these thumbnails were one-shot by{" "}
            <span className="bg-gradient-to-r from-[#FF0000] to-[#FF6B6B] bg-clip-text text-transparent">
              THUMBMAKER
            </span>
            . Try it to believe!
          </h1>
        </motion.div>

        <div className="mt-8 space-y-6">
          <div className="flex flex-col lg:flex-row gap-2 lg:items-end">
            <div className="w-full sm:max-w-xs">
              <p className="text-xs font-medium text-gray-700 mb-2">Creator</p>
              <Select value={selectedCreator} onValueChange={setSelectedCreator}>
                <SelectTrigger className="bg-white border-2 border-gray-300 focus:border-brand-600 focus:ring-2 focus:ring-brand-200 h-11">
                  <SelectValue placeholder="Select creator" />
                </SelectTrigger>
                <SelectContent className="max-h-64">
                  <SelectItem value="all">All creators</SelectItem>
                  {creators.map((creator) => (
                    <SelectItem key={creator} value={creator}>
                      {creator}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="w-full">
              <p className="text-xs font-medium text-gray-700 mb-2">Search by tags or title keywords</p>
              <Input
                value={tagQuery}
                onChange={(event) => setTagQuery(event.target.value)}
                placeholder="e.g. motivation, finance, vlog"
                className="h-11 border-2 border-gray-300 focus:border-brand-600 focus:ring-2 focus:ring-brand-200"
              />
            </div>

            <div className="w-full sm:w-auto">
              <p className="text-xs font-medium text-gray-500 mb-2 invisible">Clear filters</p>
              <Button
                variant="outline"
                className="w-full sm:w-auto h-11 border-2 border-gray-300 hover:border-gray-400 disabled:opacity-50"
                disabled={!filtersActive}
                onClick={() => {
                  setSelectedCreator("all");
                  setTagQuery("");
                }}
              >
                Clear filters
              </Button>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {visibleThumbnails.map((item) => {
              return (
                <div
                  key={item.id}
                  className="group cursor-pointer"
                >
                  <Link href={item.video_link} target="_blank" rel="noopener noreferrer">
                    <div className="relative w-full aspect-[16/9] bg-gray-100 rounded-lg overflow-hidden mb-2">
                      <Image
                        src={item.image}
                        alt={item.title}
                        fill
                        sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                        className="object-cover transition-transform duration-200 group-hover:scale-[1.02]"
                        quality={90}
                      />
                    </div>
                    <div className="space-y-1">
                      <h3 className="text-sm font-medium text-gray-900 line-clamp-2 leading-tight group-hover:text-brand-600 transition-colors">
                        {item.title}
                      </h3>
                      <p className="text-xs text-gray-600">
                        {item.creator}
                      </p>
                    </div>
                  </Link>
                </div>
              );
            })}
          </div>

          {filteredThumbnails.length === 0 && (
            <div className="rounded-xl border border-dashed border-gray-300 bg-gray-50 py-12 text-center">
              <p className="text-base font-semibold text-gray-900">No thumbnails found</p>
              <p className="text-sm text-gray-600 mt-2">
                Try a different creator, tag, or title keyword.
              </p>
            </div>
          )}

          {filteredThumbnails.length > MAX_RESULTS && (
            <p className="text-center text-sm text-gray-500">
              Showing {MAX_RESULTS} of {filteredThumbnails.length} matching thumbnails. Refine your
              search to narrow the results.
            </p>
          )}
        </div>
      </div>
    </section>
  );
}
