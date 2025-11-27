"use client";

import Link from "next/link";

export default function DesignSystemsForYouTubePage() {
  return (
    <main className="bg-white">
      <article className="mx-auto max-w-3xl px-4 py-20 sm:px-6">
        <p className="inline-flex items-center rounded-full bg-rose-50 px-3 py-1 text-xs font-semibold uppercase tracking-[0.3em] text-rose-500">
          Templates
        </p>
        <h1 className="mt-6 text-4xl font-semibold leading-tight text-gray-900">
          Design Systems for Clickable YouTube Thumbnails
        </h1>
        <p className="mt-4 text-base text-muted-foreground">
          How agencies and solo creators use ThumbMaker to build reusable systems that keep every upload on brand.
        </p>

        <div className="mt-10 space-y-6 text-base leading-relaxed text-gray-700">
          <p>
            Treat your thumbnail workflow like a proper design system. Start with reusable project briefs—logo placement, typography rules, color tokens—and lock those into ThumbMaker templates.
            This lets anyone on the team spin up new concepts without babysitting the details each time.
          </p>
          <p>
            Our best-performing channels run “theme packs”: dark mode news, punchy red alerts, minimalist storytime, etc.
            Each pack has 3–5 templates with slight variations so they can stay visually consistent while still testing micro changes like subject framing or background texture.
          </p>
          <p>
            When you need variety, duplicate a template and swap the “design language” instructions (e.g., “Apple keynote minimalism” vs. “MrBeast neon chaos”).
            Because projects store your asset uploads, fonts, and prompts, you can generate 20+ on-brand options in the time it used to take to mock up one PSD.
          </p>
          <p>
            If you want to level this up, drop into the Template Creator inside your account. You can lock layers, share a template library with clients, or publish your designs to other ThumbMaker teams.
          </p>
        </div>

        <div className="mt-10 flex flex-wrap gap-3 text-sm font-semibold">
          <Link href="/blog" className="rounded-full border border-gray-200 px-5 py-2 text-gray-900 hover:bg-gray-50">
            ← Back to Blog
          </Link>
          <Link href="/dashboard/templates" className="rounded-full bg-gray-900 px-5 py-2 text-white hover:opacity-90">
            Explore templates
          </Link>
        </div>
      </article>
    </main>
  );
}


