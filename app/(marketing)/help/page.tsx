"use client";

import Link from "next/link";

const sections = [
  {
    title: "Account & billing",
    items: [
      "Resetting your password or Clerk login",
      "Understanding credit usage and refresh dates",
      "Switching between Starter, Pro, and Power plans",
    ],
  },
  {
    title: "Projects & templates",
    items: [
      "Creating reusable project briefs for every channel",
      "Locking templates for teams and agencies",
      "Regenerating thumbnails without re-uploading assets",
    ],
  },
  {
    title: "Generation workflow",
    items: [
      "Writing prompts that match your channel style",
      "Collaborating inside the history / edit flow",
      "Exporting versions for A/B testing on YouTube",
    ],
  },
];

export default function HelpPage() {
  return (
    <main className="bg-white">
      <section className="mx-auto flex max-w-4xl flex-col gap-12 px-4 py-20 sm:px-6">
        <div className="space-y-4 text-center">
          <p className="inline-flex items-center rounded-full bg-rose-50 px-3 py-1 text-xs font-semibold uppercase tracking-[0.3em] text-rose-500">
            Help Center
          </p>
          <h1 className="text-4xl font-semibold text-gray-900 sm:text-5xl">Answers for every stage of growth</h1>
          <p className="mx-auto max-w-2xl text-base text-muted-foreground">
            ThumbMaker is built for channels that move fast. Browse our most-requested guides or send us a note.
          </p>
        </div>

        <div className="space-y-6">
          {sections.map((section) => (
            <div key={section.title} className="rounded-3xl border border-gray-200 p-6">
              <div className="flex items-center gap-2 text-sm font-semibold uppercase tracking-[0.2em] text-gray-500">
                <span className="h-2 w-2 rounded-full bg-rose-500" />
                {section.title}
              </div>
              <ul className="mt-4 space-y-3 text-sm text-muted-foreground">
                {section.items.map((item) => (
                  <li key={item} className="flex items-start gap-2">
                    <span className="mt-1 h-1.5 w-1.5 rounded-full bg-gray-900" />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="rounded-3xl bg-gray-50 p-8 text-center">
          <h2 className="text-2xl font-semibold text-gray-900">Didn&apos;t find what you were looking for?</h2>
          <p className="mt-2 text-sm text-muted-foreground">
            Email us at{" "}
            <a href="mailto:support@thumbmaker.ai" className="font-semibold text-gray-900">
              support@thumbmaker.ai
            </a>{" "}
            or jump into the community to share requests with other thumbnail teams.
          </p>
          <div className="mt-6 flex flex-wrap justify-center gap-3">
            <Link
              href="/community"
              className="rounded-full border border-gray-200 bg-white px-6 py-2 text-sm font-semibold text-gray-900 hover:bg-gray-50"
            >
              Visit the community
            </Link>
            <Link
              href="/contact"
              className="rounded-full bg-gray-900 px-6 py-2 text-sm font-semibold text-white shadow-lg shadow-gray-900/20"
            >
              Contact support
            </Link>
          </div>
        </div>
      </section>
    </main>
  );
}


