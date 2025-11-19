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
    <section id="metrics" className="bg-white px-4 py-20 sm:px-6">
      <div className="mx-auto flex max-w-6xl flex-col gap-12">
        <div className="flex flex-col gap-8 lg:flex-row lg:items-stretch">
          <div className="flex items-center gap-4 border-b border-black/10 pb-6 lg:w-auto lg:flex-col lg:items-start lg:gap-4 lg:border-b-0 lg:border-r lg:pr-8">
            <div className="h-16 w-px bg-black/40 lg:h-full" />
            <p className="text-sm font-medium text-gray-800 leading-relaxed">
              We speak with
              <br />
              our powerfull
              <br />
              statistics
            </p>
          </div>

          <div className="flex flex-1 flex-wrap items-center justify-between gap-8">
            {stats.map((stat) => (
              <div key={stat.label} className="min-w-[140px] text-left">
                <div className="text-3xl font-semibold text-gray-900">
                  {stat.value}
                </div>
                <div className="mt-1 text-sm text-gray-600">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>

        <div className="rounded-[32px] border border-black/5 bg-black p-3 shadow-[0_40px_120px_rgba(15,23,42,0.18)]">
          <div className="relative overflow-hidden rounded-[28px] bg-black">
            <iframe
              className="h-full w-full aspect-video rounded-[28px]"
              src={embedUrl}
              title="ThumbMaker demo"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
            />
            <Link
              href={demoVideoUrl}
              target="_blank"
              className="absolute bottom-4 right-4 text-xs font-semibold text-white/80 underline underline-offset-4"
            >
              Watch on YouTube
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}

