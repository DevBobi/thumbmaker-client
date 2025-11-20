"use client";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
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
import { useCreditSummary } from "@/hooks/use-credit-summary";

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
  const { data: creditSummary } = useCreditSummary();
  const paidCredits = creditSummary?.credits ?? 0;
  const trialCredits =
    creditSummary?.trialStatus === "ACTIVE" ? creditSummary.trialCredits : 0;

  return (
    <header className="border-b border-border bg-background">
      <div className="flex h-16 items-center justify-between px-4 md:px-6">
        <div className="flex items-center gap-4">
          <SidebarTrigger
            icon={MenuIcon}
            className="cursor-pointer hover:text-foreground"
          />
        </div>

        {/* Credits section at top right */}
        <div className="flex items-center gap-6">
          <div className="text-sm text-muted-foreground text-right">
            <span className="font-medium block">Credits</span>
            <div className="flex items-center gap-2 justify-end mt-1">
              <span className="bg-muted px-2 py-1 rounded-md text-foreground font-semibold min-w-[48px] text-center">
                {creditSummary ? paidCredits : "—"}
              </span>
              {trialCredits > 0 && (
                <Badge variant="secondary" className="text-[11px]">
                  {trialCredits} trial
                </Badge>
              )}
            </div>
            {!creditSummary?.hasCredits && (
              <Link
                href="/dashboard/billing"
                className="text-xs text-primary font-medium mt-1 inline-flex justify-end w-full"
              >
                Add more credits →
              </Link>
            )}
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
