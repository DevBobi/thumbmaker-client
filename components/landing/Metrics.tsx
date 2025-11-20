"use client";

import Link from "next/link";

const stats = [
  { value: "17k+", label: "Thumbnails Generated" },
  { value: "400+", label: "Creators" },
  { value: "1,400+", label: "Proven Templates" },
  { value: "98%", label: "Faster than Photoshop" },
];

export function Metrics() {
  const demoVideoUrl = "https://youtu.be/KrLj6nc516A";
  const embedUrl = "https://www.youtube.com/embed/KrLj6nc516A?rel=0&modestbranding=1";

  return (
    <section
      id="metrics"
      className="bg-white px-4 py-20 sm:px-6 lg:py-24"
    >
      <div className="mx-auto flex max-w-6xl flex-col gap-12 lg:gap-14">
        {/* Heading + Metrics */}
        <div className="grid gap-10 lg:grid-cols-[minmax(0,1.2fr)_minmax(0,1.5fr)] lg:items-center">
          {/* Left: Copy */}
          <div className="space-y-4">
            <p className="inline-flex items-center rounded-full bg-rose-50 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-rose-500">
              Proof it works
            </p>
            <h2 className="text-3xl font-semibold tracking-tight text-gray-900 sm:text-4xl">
              We let the{" "}
              <span className="text-rose-500">numbers</span> do the talking
            </h2>
            <p className="max-w-md text-sm text-gray-600 sm:text-base">
              ThumbMaker is already powering channels across YouTube. From
              solo creators to growing teams, these are the outcomes they see
              after switching from manual thumbnail design.
            </p>
          </div>

          {/* Right: Stat cards */}
          <div className="grid w-full grid-cols-2 gap-4 sm:gap-6">
            {stats.map((stat) => (
              <div
                key={stat.label}
                className="group relative overflow-hidden rounded-2xl border border-gray-100 bg-gradient-to-br from-white via-white to-rose-50/40 p-4 shadow-sm transition-all hover:-translate-y-0.5 hover:border-rose-200 hover:shadow-md"
              >
                <div className="pointer-events-none absolute inset-0 bg-gradient-to-br from-rose-500/0 via-rose-500/[0.02] to-rose-500/5 opacity-0 transition-opacity group-hover:opacity-100" />
                <div className="relative">
                  <div className="text-2xl font-semibold text-gray-900 sm:text-3xl">
                    {stat.value}
                  </div>
                  <div className="mt-1 text-xs font-medium uppercase tracking-wide text-gray-500">
                    {stat.label}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Demo video */}
        <div className="rounded-[32px] border border-black/5 bg-gradient-to-br from-gray-950 via-black to-gray-900 p-3 shadow-[0_40px_120px_rgba(15,23,42,0.22)]">
          <div className="relative overflow-hidden rounded-[28px] bg-black">
            <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/60 via-black/10 to-transparent" />
            <iframe
              className="h-full w-full aspect-video rounded-[28px] border border-white/5"
              src={embedUrl}
              title="ThumbMaker demo"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
            />
            <div className="pointer-events-none absolute inset-x-0 top-0 h-8 bg-gradient-to-b from-black/60 via-black/10 to-transparent" />
            <div className="absolute left-4 top-4 flex items-center gap-2 rounded-full bg-white/10 px-3 py-1 text-[11px] font-medium text-white backdrop-blur">
              <span className="h-2 w-2 rounded-full bg-rose-500 animate-pulse" />
              Live demo walkthrough
            </div>
            <Link
              href={demoVideoUrl}
              target="_blank"
              className="absolute bottom-4 right-4 inline-flex items-center gap-1 rounded-full bg-white/10 px-3 py-1.5 text-[11px] font-semibold text-white/90 backdrop-blur transition hover:bg-white/20"
            >
              <span>Watch on YouTube</span>
              <span aria-hidden>↗</span>
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
