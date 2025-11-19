"use client";

import { Button } from "@/components/ui/button";
import { useUser } from "@clerk/nextjs";
import Link from "next/link";
import { Menu, X } from "lucide-react";
import { useState } from "react";

const navItems = [
  { label: "Features", href: "/#how-it-works" },
  { label: "Pricing", href: "/#pricing" },
  { label: "FAQ's", href: "/#faq" },
];

export function Navbar() {
  const { isSignedIn } = useUser();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const primaryCta = isSignedIn ? (
    <Button className="rounded-full px-5" asChild>
      <Link href="/dashboard">Dashboard</Link>
    </Button>
  ) : (
    <Button className="rounded-full px-5 shadow-lg shadow-black/5" asChild>
      <Link href="/sign-up">Sign Up</Link>
    </Button>
  );

  return (
    <header className="sticky top-0 inset-x-0 z-50 border-b border-black/5 bg-white/80 backdrop-blur-xl">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4 sm:px-6">
        <Link href="/" className="text-xl font-semibold tracking-tight text-gray-900">
          ThumbMaker
        </Link>

        <nav className="hidden md:flex items-center gap-8">
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
            >
              {item.label}
            </Link>
          ))}
        </nav>

        <div className="hidden md:flex items-center gap-3">
          {!isSignedIn && (
            <Button variant="ghost" className="rounded-full px-4 text-sm font-medium" asChild>
              <Link href="/sign-in">Log In</Link>
            </Button>
          )}
          {primaryCta}
        </div>

        <button
          className="md:hidden rounded-full border border-black/10 p-2 text-muted-foreground"
          onClick={() => setMobileMenuOpen((prev) => !prev)}
          aria-label="Toggle navigation"
        >
          {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>
      </div>

      {mobileMenuOpen && (
        <div className="md:hidden border-t border-black/5 bg-white">
          <div className="mx-auto flex max-w-6xl flex-col gap-6 px-4 py-6">
            <div className="flex flex-col gap-4">
              {navItems.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className="text-base font-medium text-foreground"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  {item.label}
                </Link>
              ))}
            </div>
            <div className="flex flex-col gap-3">
              {!isSignedIn && (
                <Button variant="ghost" className="w-full rounded-full" asChild>
                  <Link href="/sign-in">Log In</Link>
                </Button>
              )}
              {isSignedIn ? (
                <Button className="w-full rounded-full" asChild>
                  <Link href="/dashboard">Dashboard</Link>
                </Button>
              ) : (
                <Button className="w-full rounded-full shadow-md" asChild>
                  <Link href="/sign-up">Sign Up</Link>
                </Button>
              )}
            </div>
          </div>
        </div>
      )}
    </header>
  );
}
