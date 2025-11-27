"use client";

import Link from "next/link";

const posts = [
  {
    title: "How ThumbMaker Plans Thumbnails Like a Creative Director",
    description:
      "Behind the scenes: prompts, project briefs, and edit flows that keep YouTube teams shipping faster.",
    readTime: "6 min read",
    href: "/blog/how-thumbmaker-plans-thumbnails",
  },
  {
    title: "Design Systems for Clickable YouTube Thumbnails",
    description:
      "Repeatable styling, project templates, and asset kits you can reuse across every channel you manage.",
    readTime: "8 min read",
    href: "/blog/design-systems-for-youtube",
  },
  {
    title: "What We Learned After Generating 10,000 AI Thumbnails",
    description:
      "Data-backed lessons on colors, framing, and prompts that consistently outperform stock screenshots.",
    readTime: "10 min read",
    href: "/blog/lessons-from-10000-thumbnails",
  },
];

export default function BlogPage() {
  return (
    <main className="bg-white">
      <section className="mx-auto flex min-h-[60vh] max-w-5xl flex-col gap-12 px-4 py-20 sm:px-6">
        <div className="space-y-4 text-center">
          <p className="inline-flex items-center rounded-full bg-rose-50 px-3 py-1 text-xs font-semibold uppercase tracking-[0.3em] text-rose-500">
            Blog
          </p>
          <h1 className="text-4xl font-semibold text-gray-900 sm:text-5xl">Insights from the ThumbMaker team</h1>
          <p className="mx-auto max-w-3xl text-base text-muted-foreground">
            Workflow guides, prompt breakdowns, and experiments from helping creators generate scroll-stopping thumbnails.
          </p>
        </div>

        <div className="grid gap-6 md:grid-cols-2">
          {posts.map((post) => (
            <Link
              key={post.title}
              href={post.href}
              className="rounded-3xl border border-gray-200 p-6 transition hover:border-gray-900/20 hover:shadow-lg"
            >
              <p className="text-xs font-semibold uppercase tracking-[0.3em] text-rose-500">{post.readTime}</p>
              <h2 className="mt-3 text-2xl font-semibold text-gray-900">{post.title}</h2>
              <p className="mt-2 text-sm text-muted-foreground">{post.description}</p>
              <span className="mt-6 inline-flex items-center text-sm font-semibold text-gray-900">
                Read story →
              </span>
            </Link>
          ))}
        </div>

        <div className="rounded-3xl bg-gray-50 p-8 text-center">
          <h3 className="text-xl font-semibold text-gray-900">Need help implementing a workflow?</h3>
          <p className="mt-2 text-sm text-muted-foreground">
            Our product team can walk you through project setup, template ops, and edit loops for your channel.
          </p>
          <Link
            href="/contact"
            className="mt-6 inline-flex items-center justify-center rounded-full bg-gray-900 px-6 py-2 text-sm font-semibold text-white shadow-lg shadow-gray-900/20"
          >
            Talk to us
          </Link>
        </div>
      </section>
    </main>
  );
}


