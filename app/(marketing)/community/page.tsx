"use client";

import Link from "next/link";

const pillars = [
  {
    title: "Office hours",
    description:
      "Live calls twice a month where the ThumbMaker design team shares prompt breakdowns, asset packs, and A/B testing results.",
  },
  {
    title: "Shared template library",
    description:
      "Swap channel styles with other power users. Submit your templates and remix proven layouts to keep your feed fresh.",
  },
  {
    title: "Feedback loops",
    description:
      "Post a thumbnail draft and get async critique from channel managers, editors, and our product designers.",
  },
];

export default function CommunityPage() {
  return (
    <main className="bg-white">
      <section className="mx-auto flex max-w-4xl flex-col gap-10 px-4 py-20 sm:px-6">
        <div className="space-y-4 text-center">
          <p className="inline-flex items-center rounded-full bg-rose-50 px-3 py-1 text-xs font-semibold uppercase tracking-[0.3em] text-rose-500">
            Community
          </p>
          <h1 className="text-4xl font-semibold text-gray-900 sm:text-5xl">Ship better thumbnails together</h1>
          <p className="mx-auto max-w-2xl text-base text-muted-foreground">
            Join other YouTube teams who rely on ThumbMaker for collaborative feedback, template swaps, and creative ops tips.
          </p>
        </div>

        <div className="grid gap-6 md:grid-cols-3">
          {pillars.map((pillar) => (
            <div key={pillar.title} className="rounded-3xl border border-gray-200 p-6">
              <p className="text-xs font-semibold uppercase tracking-[0.3em] text-gray-500">{pillar.title}</p>
              <p className="mt-3 text-sm text-muted-foreground">{pillar.description}</p>
            </div>
          ))}
        </div>

        <div className="rounded-3xl bg-gradient-to-br from-gray-900 to-black p-8 text-white">
          <h2 className="text-2xl font-semibold">Apply for early community access</h2>
          <p className="mt-2 text-sm text-white/80">
            We add new creators every Monday. Share your channel link and we&apos;ll send a welcome kit with project templates.
          </p>
          <div className="mt-6 flex flex-wrap gap-3">
            <Link
              href="/contact"
              className="rounded-full bg-white px-6 py-2 text-sm font-semibold text-gray-900 shadow-lg shadow-black/30"
            >
              Request invite
            </Link>
            <a
              href="mailto:community@thumbmaker.ai"
              className="rounded-full border border-white/30 px-6 py-2 text-sm font-semibold text-white hover:bg-white/10"
            >
              Email community team
            </a>
          </div>
        </div>
      </section>
    </main>
  );
}


