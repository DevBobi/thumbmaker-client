"use client";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { useAuth, useUser } from "@clerk/nextjs";
import {
  CreditCardIcon,
  HelpCircleIcon,
  LogOutIcon,
  MenuIcon,
  UserCircleIcon,
} from "lucide-react";
import Link from "next/link";
import { useSubscription } from "@/hooks/use-subscription";
import { CoinsIcon } from "lucide-react";
import { useEffect, useState } from "react";

const NavbarItems = [
  {
    label: "Profile",
    href: "/dashboard/profile",
    icon: UserCircleIcon,
  },
  {
    label: "Billing",
    href: "/dashboard/billing",
    icon: CreditCardIcon,
  },
  {
    label: "Support",
    href: "/dashboard/support",
    icon: HelpCircleIcon,
  },
];

export default function Navbar() {
  const { user } = useUser();
  const { signOut } = useAuth();
  const { credits, isLoading: isLoadingCredits, subscription } = useSubscription();
  const [hasLoadedCredits, setHasLoadedCredits] = useState(false);
  const [displayCredits, setDisplayCredits] = useState(credits);

  // Track if we've ever loaded credits to prevent blinking during refreshes
  useEffect(() => {
    if (subscription) {
      if (!hasLoadedCredits) {
        // First time we have subscription data
        setHasLoadedCredits(true);
      }
      // Always update display credits when subscription data is available
      // This ensures we show the latest credits without blinking
      setDisplayCredits(credits);
    }
  }, [subscription, credits, hasLoadedCredits]);

  // Only show loading state on initial load, not during background refreshes
  // Once we have subscription data, we keep showing credits even during refreshes
  const showLoadingState = isLoadingCredits && !hasLoadedCredits;

  return (
    <header className="border-b border-border bg-background">
      <div className="flex h-16 items-center justify-between px-3 md:px-6">
        <div className="flex items-center gap-4">
          <SidebarTrigger
            icon={MenuIcon}
            className="cursor-pointer text-muted-foreground hover:text-foreground"
          />
        </div>

        {/* Right section: credits + user */}
        <div className="flex items-center gap-4 md:gap-6">
          {showLoadingState ? (
            <div className="flex items-center gap-2 rounded-full border border-dashed border-muted-foreground/20 px-2.5 py-1 text-xs text-muted-foreground">
              <CoinsIcon className="h-3.5 w-3.5" />
              <span className="tracking-tight">Checking credits…</span>
            </div>
          ) : (
            <div className="flex items-center gap-2 rounded-full border border-border/70 bg-muted/40 px-2.5 py-1 text-xs text-muted-foreground">
              <CoinsIcon className="h-3.5 w-3.5 text-amber-500" />
              <span className="font-medium text-foreground">
                {displayCredits}
              </span>
              <span className="text-[11px] uppercase tracking-[0.16em]">
                Credits
              </span>
            </div>
          )}

          <div className="flex items-center gap-4">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button className="rounded-full overflow-hidden">
                  <Avatar className="h-8 w-8 rounded-lg">
                    <AvatarImage
                      src={user?.imageUrl || ""}
                      alt={user?.fullName || ""}
                    />
                    <AvatarFallback className="rounded-lg">
                      {user?.fullName?.charAt(0) || "JD"}
                    </AvatarFallback>
                  </Avatar>
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent
                className="w-72 rounded-2xl border border-border/60 bg-white/95 dark:bg-gray-950/95 shadow-2xl backdrop-blur-xl p-3"
                align="end"
              >
                <DropdownMenuLabel className="p-0 font-normal mb-3">
                  <div className="relative overflow-hidden bg-gradient-to-br from-primary/5 via-primary/10 to-primary/5 dark:from-primary/10 dark:via-primary/20 dark:to-primary/10 rounded-2xl p-3 border border-primary/10 dark:border-primary/20">
                    <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/5 to-transparent" />
                    <div className="relative flex items-center gap-3">
                      <Avatar className="h-10 w-10 rounded-xl ring-2 ring-primary/30 shadow-lg">
                        <AvatarImage
                          src={user?.imageUrl || ""}
                          alt={user?.fullName || ""}
                          className="object-cover"
                        />
                        <AvatarFallback className="rounded-xl bg-gradient-to-br from-primary to-primary/80 text-white font-bold text-sm">
                          {user?.fullName?.charAt(0) || "U"}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1 min-w-0">
                        <span className="block truncate font-semibold text-sm text-gray-900 dark:text-white">
                          {user?.fullName || "User"}
                        </span>
                        {user?.emailAddresses[0].emailAddress && (
                          <span className="block truncate text-xs text-gray-600 dark:text-gray-400 font-medium">
                            {user?.emailAddresses[0].emailAddress}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator className="my-2 bg-gray-200 dark:bg-gray-800" />
                <DropdownMenuGroup className="space-y-1">
                  {NavbarItems.map((item) => (
                    <Link href={item.href} key={item.label}>
                      <DropdownMenuItem className="cursor-pointer rounded-xl px-3 py-2.5 focus:bg-gray-100 dark:focus:bg-gray-900/70 transition-all duration-200 group">
                        <div className="flex items-center gap-3 w-full">
                          <div className="p-1.5 rounded-lg bg-gray-100 dark:bg-gray-900 group-hover:bg-primary/10 dark:group-hover:bg-primary/20 transition-colors">
                            <item.icon className="h-4 w-4 text-gray-600 dark:text-gray-400 group-hover:text-primary transition-colors" />
                          </div>
                          <span className="font-medium text-sm text-gray-700 dark:text-gray-300 group-hover:text-gray-900 dark:group-hover:text-white">
                            {item.label}
                          </span>
                        </div>
                      </DropdownMenuItem>
                    </Link>
                  ))}
                </DropdownMenuGroup>
                <DropdownMenuSeparator className="my-2 bg-gray-200 dark:bg-gray-800" />
                <DropdownMenuItem
                  onClick={() => signOut()}
                  className="cursor-pointer rounded-xl px-3 py-2.5 focus:bg-red-50 dark:focus:bg-red-950/30 transition-all duration-200 group"
                >
                  <div className="flex items-center gap-3 w-full">
                    <div className="p-1.5 rounded-lg bg-gray-100 dark:bg-gray-900 group-hover:bg-red-50 dark:group-hover:bg-red-950/50 transition-colors">
                      <LogOutIcon className="h-4 w-4 text-gray-600 dark:text-gray-400 group-hover:text-red-600 dark:group-hover:text-red-400 transition-colors" />
                    </div>
                    <span className="font-semibold text-sm text-gray-700 dark:text-gray-300 group-hover:text-red-600 dark:group-hover:text-red-400">
                      Log out
                    </span>
                  </div>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </div>
    </header>
  );
}
