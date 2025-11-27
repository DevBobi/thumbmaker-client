"use client";

import Link from "next/link";

export default function LessonsFrom10000ThumbnailsPage() {
  return (
    <main className="bg-white">
      <article className="mx-auto max-w-3xl px-4 py-20 sm:px-6">
        <p className="inline-flex items-center rounded-full bg-rose-50 px-3 py-1 text-xs redus uppercase tracking-[0.3em] text-rose-500">
          Data
        </p>
        <h1 className="mt-6 text-4xl font-semibold leading-tight text-gray-900">
          What We Learned After Generating 10,000 AI Thumbnails
        </h1>
        <p className="mt-4 text-base text-muted-foreground">
          Color palettes, framing, and copy angles that consistently outperformed the control thumbnails our customers uploaded.
        </p>

        <div className="mt-10 space-y-6 text-base leading-relaxed text-gray-700">
          <p>
            Across 10k generations, four elements correlated with higher CTR: high-contrast subject cutouts, one emotional keyword, strong diagonals, and simplified backgrounds.
            When all four were present, the variant beat the control 78% of the time.
          </p>
          <p>
            Colors: “Warm subject + cool background” outperformed “cool subject + warm background” in educational channels,
            while challenge-style creators saw the opposite. Keep two palettes on standby and match them to the video’s energy.
          </p>
          <p>
            Faces still matter, but not in the way you think. Medium zoom with clear eye-lines outperformed ultra-close framing by 12%.
            We now default to “torso up” crops unless the channel brief specifically calls for dramatic close-ups.
          </p>
          <p>
            Lastly, text. Two words max. Anything longer performed worse unless it was a proper noun (brand, city, celebrity). ThumbMaker now highlights instructions if your copy exceeds 12 characters.
          </p>
          <p>
            Drop this data into your next batch by using the “Channel Style” field inside projects. We’ll keep learning from the aggregate so your results get sharper every week.
          </p>
        </div>

        <div className="mt-10 flex flex-wrap gap-3 text-sm font-semibold">
          <Link href="/blog" className="rounded-full border border-gray-200 px-5 py-2 text-gray-900 hover:bg-gray-50">
            ← Back to Blog
          </Link>
          <Link href="/dashboard/history" className="rounded-full bg-gray-900 px-5 py-2 text-white hover:opacity-90">
            Review your data
          </Link>
        </div>
      </article>
    </main>
  );
}


