"use client";

import Link from "next/link";

const channels = [
  {
    label: "Sales & demos",
    description: "Walk through ThumbMaker with our product team and see how we adapt to your channel workflow.",
    action: "sales@thumbmaker.ai",
  },
  {
    label: "Support",
    description: "Questions about credits, billing, or project setup? We usually respond within one business day.",
    action: "support@thumbmaker.ai",
  },
  {
    label: "Partnerships",
    description: "Media companies, MCNs, or agencies interested in higher-volume access and shared template libraries.",
    action: "partners@thumbmaker.ai",
  },
];

export default function ContactPage() {
  return (
    <main className="bg-white">
      <section className="mx-auto flex max-w-4xl flex-col gap-10 px-4 py-20 sm:px-6">
        <div className="space-y-4 text-center">
          <p className="inline-flex items-center rounded-full bg-rose-50 px-3 py-1 text-xs font-semibold uppercase tracking-[0.3em] text-rose-500">
            Contact
          </p>
          <h1 className="text-4xl font-semibold text-gray-900 sm:text-5xl">Talk with the ThumbMaker team</h1>
          <p className="mx-auto max-w-2xl text-base text-muted-foreground">
            Whether you need help migrating assets, want to embed our workflow into your agency, or have a feature request, we&apos;re here to help.
          </p>
        </div>

        <div className="space-y-4 rounded-3xl border border-gray-200 p-8">
          {channels.map((channel) => (
            <div key={channel.label} className="rounded-2xl bg-gray-50 p-6">
              <p className="text-xs font-semibold uppercase tracking-[0.3em] text-gray-500">{channel.label}</p>
              <p className="mt-2 text-sm text-muted-foreground">{channel.description}</p>
              <a
                href={`mailto:${channel.action}`}
                className="mt-4 inline-flex text-sm font-semibold text-gray-900"
              >
                {channel.action}
              </a>
            </div>
          ))}
        </div>

        <div className="rounded-3xl bg-gray-900 p-8 text-white">
          <h2 className="text-2xl font-semibold">Prefer to self-serve?</h2>
          <p className="mt-2 text-sm text-white/80">
            Explore pricing, review our help center, or join the community to learn how other creators run ThumbMaker.
          </p>
          <div className="mt-6 flex flex-wrap gap-3">
            <Link href="/pricing" className="rounded-full bg-white px-6 py-2 text-sm font-semibold text-gray-900 shadow-lg shadow-black/30">
              View pricing
            </Link>
            <Link
              href="/help"
              className="rounded-full border border-white/40 px-6 py-2 text-sm font-semibold text-white hover:bg-white/10"
            >
              Visit help center
            </Link>
          </div>
        </div>
      </section>
    </main>
  );
}


