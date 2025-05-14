"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { useClerk } from "@clerk/nextjs";
import { Menu } from "lucide-react";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Badge } from "@/components/ui/badge";

const navItems = [
  {
    label: "Gallery",
    href: "/#gallery",
  },
  {
    label: "Features",
    href: "/#features",
  },
  {
    label: "Pricing",
    href: "/pricing",
  },
  {
    label: "FAQ",
    href: "/#faq",
  },
];

export function Navbar() {
  const { isSignedIn } = useClerk();

  return (
    <nav className="fixed top-0 w-full z-50 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between relative">
        {/* Left: Logo + Beta */}
        <div className="flex items-center gap-2">
          <Link href="/" className="flex items-center gap-2">
            <h1 className="text-xl sm:text-2xl font-bold bg-gradient-to-r from-brand-400 to-brand-600 bg-clip-text text-transparent">
              KRILLION
            </h1>
          </Link>
          <Badge variant="outline" className="uppercase text-[8px]">
            Beta
          </Badge>
        </div>

        {/* Center: Nav Items (hidden on mobile, absolutely centered) */}
        <div className="hidden md:flex absolute left-1/2 -translate-x-1/2">
          <div className="flex items-center gap-8">
            {navItems.map((item) => (
              <Link
                href={item.href}
                key={item.href}
                className="text-sm text-muted-foreground hover:text-foreground transition-colors"
              >
                {item.label}
              </Link>
            ))}
          </div>
        </div>

        {/* Right: Auth Buttons */}
        <div className="flex items-center gap-4">
          {isSignedIn ? (
            <Button variant="brand" asChild>
              <Link href="/dashboard">Dashboard</Link>
            </Button>
          ) : (
            <>
              <Button variant="ghost" asChild>
                <Link href="/sign-in">Sign In</Link>
              </Button>
              <Button asChild>
                <Link href="/sign-up">Get Started</Link>
              </Button>
            </>
          )}
        </div>
      </div>
    </nav>
  );
}
