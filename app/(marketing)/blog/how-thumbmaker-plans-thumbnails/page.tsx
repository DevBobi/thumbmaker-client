"use client";

import Link from "next/link";

export default function HowThumbMakerPlansThumbnailsPage() {
  return (
    <main className="bg-white">
      <article className="mx-auto max-w-3xl px-4 py-20 sm:px-6">
        <p className="inline-flex items-center rounded-full bg-rose-50 px-3 py-1 text-xs font-semibold uppercase tracking-[0.3em] text-rose-500">
          Workflow
        </p>
        <h1 className="mt-6 text-4xl font-semibold leading-tight text-gray-900">
          How ThumbMaker Plans Thumbnails Like a Creative Director
        </h1>
        <p className="mt-4 text-base text-muted-foreground">
          A peek into the prompts, project briefs, and edit loops that keep our production partners shipping new thumbnails every week.
        </p>

        <div className="mt-10 space-y-6 text-base leading-relaxed text-gray-700">
          <p>
            Every ThumbMaker project begins with a “channel brief.” We capture tone, hosts, color systems, and performance guardrails (no neon green, avoid cluttered lower thirds, etc.).
            This makes each regeneration feel like it came from an in-house design lead instead of a generic AI template.
          </p>
          <p>
            Next, we run a multi-prompt batch: a base prompt for safe explorations, a remix prompt for bold experiments, and a fallback prompt that mirrors the creator’s last winning thumbnail.
            Teams usually keep 3–4 variations for A/B testing and archive the rest for future reference.
          </p>
          <p>
            When edits are needed, ThumbMaker rehydrates the entire set—project, template, and assets—so the editor can tweak instructions (“remove the door in the background, keep host on left”)
            without re-uploading the original still. This keeps iteration under five minutes no matter how many stakeholders are in the loop.
          </p>
          <p>
            Want more behind-the-scenes tips? Join our community office hours where the product design team shares the exact prompt stacks and template locks we use for marquee channels.
          </p>
        </div>

        <div className="mt-10 flex flex-wrap gap-3 text-sm font-semibold">
          <Link href="/blog" className="rounded-full border border-gray-200 px-5 py-2 text-gray-900 hover:bg-gray-50">
            ← Back to Blog
          </Link>
          <Link href="/community" className="rounded-full bg-gray-900 px-5 py-2 text-white hover:opacity-90">
            Join office hours
          </Link>
        </div>
      </article>
    </main>
  );
}


