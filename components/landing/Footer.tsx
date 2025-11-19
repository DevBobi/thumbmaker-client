import Link from "next/link";

const footerColumns = [
  {
    title: "Product",
    links: [
      { label: "Features", href: "/#how-it-works" },
      { label: "Templates", href: "/dashboard/templates" },
      { label: "Pricing", href: "/#pricing" },
      { label: "API", href: "/contact" },
    ],
  },
  {
    title: "Resources",
    links: [
      { label: "Blog", href: "/blog" },
      { label: "Help Center", href: "/help" },
      { label: "Community", href: "/community" },
      { label: "Contact", href: "/contact" },
    ],
  },
  {
    title: "Newsletter",
    links: [
      { label: "Blog", href: "/blog" },
      { label: "Help Center", href: "/help" },
      { label: "Community", href: "/community" },
      { label: "Contact", href: "/contact" },
    ],
  },
];

export function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="border-t bg-white">
      <div className="mx-auto max-w-6xl px-4 py-12 sm:px-6">
        <div className="grid gap-10 md:grid-cols-4">
          <div className="space-y-4">
            <Link href="/" className="text-2xl font-semibold text-gray-900">
              ThumbMaker
            </Link>
            <p className="text-sm text-muted-foreground">
              AI-powered YouTube thumbnail generation for creators who want to grow faster.
            </p>
          </div>
          {footerColumns.map((column) => (
            <div key={column.title} className="space-y-4">
              <p className="text-sm font-semibold uppercase tracking-[0.2em] text-gray-500">
                {column.title}
              </p>
              <ul className="space-y-2 text-sm text-muted-foreground">
                {column.links.map((link) => (
                  <li key={link.label}>
                    <Link className="transition-colors hover:text-gray-900" href={link.href}>
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
        <div className="mt-12 border-t border-black/5 pt-6 text-center text-xs text-muted-foreground">
          © {currentYear} ThumbMaker · All Rights Reserved
        </div>
      </div>
    </footer>
  );
}
