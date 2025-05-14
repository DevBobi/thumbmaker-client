"use client";
import React, { useState, useEffect } from "react";
import { SidebarTrigger, useSidebar } from "@/components/ui/sidebar";
import Link from "next/link";
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
import {
  CreditCardIcon,
  LogOutIcon,
  MenuIcon,
  UserCircleIcon,
  HelpCircleIcon,
} from "lucide-react";
import { useAuth, useUser } from "@clerk/nextjs";
import { useAuthFetch } from "@/hooks/use-auth-fetch";
import { usePathname } from "next/navigation";
import { Badge } from "@/components/ui/badge";

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
  const { authFetch } = useAuthFetch();
  const pathname = usePathname();
  const [credits, setCredits] = useState(0);

  useEffect(() => {
    const getCredits = async () => {
      const response = await authFetch("/api/user/credits");
      const data = await response.json();
      setCredits(data.credits);
    };

    getCredits();
  }, [pathname]);

  // Get sidebar state to check if it's open
  const { open } = useSidebar();

  return (
    <header className="border-b border-border bg-background">
      <div className="flex h-16 items-center justify-between px-4 md:px-6">
        <div className="flex items-center gap-4">
          <SidebarTrigger
            icon={MenuIcon}
            className="cursor-pointer dark:text-white hover:text-foreground"
          />

          {/* Only show app name when sidebar is closed */}
          {!open && (
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
          )}
        </div>

        {/* Credits section at top right */}
        <div className="flex items-center gap-6">
          <div className="text-sm text-muted-foreground">
            <span className="font-medium">Credits:</span>
            <span className="ml-2 bg-muted px-2 py-1 rounded-md text-foreground">
              {credits}
            </span>
          </div>

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
              <DropdownMenuContent className="w-56 rounded-lg" align="end">
                <DropdownMenuLabel className="p-0 font-normal">
                  <div className="flex items-center gap-2 px-1 py-1.5 text-left text-sm">
                    <Avatar className="h-8 w-8 rounded-full">
                      <AvatarImage
                        src={user?.imageUrl || ""}
                        alt={user?.fullName || ""}
                      />
                      <AvatarFallback className="rounded-lg">JD</AvatarFallback>
                    </Avatar>
                    <div className="grid flex-1 text-left text-sm leading-tight">
                      {user?.fullName && (
                        <span className="truncate font-medium">
                          {user?.fullName}
                        </span>
                      )}
                      {user?.emailAddresses[0].emailAddress && (
                        <span className="truncate text-xs text-muted-foreground">
                          {user?.emailAddresses[0].emailAddress}
                        </span>
                      )}
                    </div>
                  </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuGroup>
                  {NavbarItems.map((item) => (
                    <Link href={item.href} key={item.label}>
                      <DropdownMenuItem className="cursor-pointer">
                        <item.icon />
                        {item.label}
                      </DropdownMenuItem>
                    </Link>
                  ))}
                </DropdownMenuGroup>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  onClick={() => signOut()}
                  className="cursor-pointer"
                >
                  <LogOutIcon className="mr-2 h-4 w-4" />
                  Log out
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </div>
    </header>
  );
}
