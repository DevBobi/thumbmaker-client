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
import thumbnailsData from "@/data/thumbnails.json";
import { landingSecondaryButton } from "./buttonStyles";

type ThumbnailRecord = {
  creator: string;
  video_link: string;
  title: string;
  image: string;
  id: string;
  tags: string[];
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
      const tags = item.tags?.join(" ").toLowerCase() ?? "";

      return normalizedTerms.every((term) => title.includes(term) || tags.includes(term));
    });
  }, [selectedCreator, tagQuery]);

  const visibleThumbnails = useMemo(
    () => filteredThumbnails.slice(0, MAX_RESULTS),
    [filteredThumbnails]
  );

  const filtersActive = selectedCreator !== "all" || tagQuery.trim().length > 0;

  return (
    <section id="gallery" className="bg-white px-4 py-24 sm:px-6">
      <div className="mx-auto max-w-6xl space-y-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="text-center space-y-4"
        >
          <p className="inline-flex items-center rounded-full bg-rose-50 px-3 py-1 text-xs font-semibold uppercase tracking-[0.3em] text-rose-500">
            See it in action
          </p>
          <h2 className="text-3xl font-semibold text-gray-900 sm:text-5xl">
            All these thumbnails were one-shot by{" "}
            <span className="bg-gradient-to-r from-[#FF0000] to-[#FF6B6B] bg-clip-text text-transparent">
              ThumbMaker
            </span>
          </h2>
          <p className="mx-auto max-w-2xl text-base text-muted-foreground">
            Filter by your favorite creators or search by topic to see how ThumbMaker adapts to any
            style.
          </p>
        </motion.div>

        <div className="rounded-[32px] border border-gray-100 bg-white/60 p-6 shadow-lg shadow-gray-900/5">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-end">
            <div className="w-full sm:max-w-xs">
              <p className="mb-2 text-xs font-medium uppercase tracking-wide text-gray-500">
                Creator
              </p>
              <Select value={selectedCreator} onValueChange={setSelectedCreator}>
                <SelectTrigger className="h-11 rounded-2xl border border-gray-200 bg-white text-sm focus:border-rose-300 focus:ring-rose-100">
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
              <p className="mb-2 text-xs font-medium uppercase tracking-wide text-gray-500">
                Search tags or titles
              </p>
              <Input
                value={tagQuery}
                onChange={(event) => setTagQuery(event.target.value)}
                placeholder="e.g. finance, vlog, story"
                className="h-11 rounded-2xl border border-gray-200 focus:border-rose-300 focus:ring-rose-100"
              />
            </div>

            <div className="w-full sm:w-auto">
              <p className="invisible mb-2 text-xs font-medium uppercase tracking-wide text-gray-500">
                Clear filters
              </p>
              <button
                type="button"
                disabled={!filtersActive}
                onClick={() => {
                  setSelectedCreator("all");
                  setTagQuery("");
                }}
                className={`${landingSecondaryButton} h-11 w-full px-6 disabled:cursor-not-allowed disabled:bg-gray-400 disabled:shadow-none sm:w-auto`}
              >
                Clear filters
              </button>
            </div>
          </div>

          <div className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {visibleThumbnails.map((item) => (
              <Link
                key={item.id}
                href={item.video_link}
                target="_blank"
                rel="noopener noreferrer"
                className="group space-y-2 rounded-2xl border border-gray-100 bg-white/80 p-3 shadow-sm transition-transform hover:-translate-y-1 hover:shadow-lg"
              >
                <div className="relative aspect-[16/9] overflow-hidden rounded-xl bg-gray-100">
                  <Image
                    src={item.image}
                    alt={item.title}
                    fill
                    sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                    className="object-cover transition-transform duration-300 group-hover:scale-[1.03]"
                    quality={90}
                  />
                </div>
                <div className="space-y-1 text-left">
                  <h3 className="text-sm font-semibold text-gray-900 line-clamp-2 leading-tight">
                    {item.title}
                  </h3>
                  <p className="text-xs text-gray-600">{item.creator}</p>
                </div>
              </Link>
            ))}
          </div>

          {filteredThumbnails.length === 0 && (
            <div className="mt-8 rounded-2xl border border-dashed border-gray-200 bg-gray-50 py-12 text-center">
              <p className="text-base font-semibold text-gray-900">No thumbnails found</p>
              <p className="mt-2 text-sm text-gray-600">Try a different creator, tag, or keyword.</p>
            </div>
          )}

          {filteredThumbnails.length > MAX_RESULTS && (
            <p className="mt-4 text-center text-sm text-gray-500">
              Showing {MAX_RESULTS} of {filteredThumbnails.length} matching thumbnails. Refine your
              search to narrow the results.
            </p>
          )}
        </div>
      </div>
    </section>
  );
}
