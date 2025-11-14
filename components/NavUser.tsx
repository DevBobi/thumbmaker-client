"use client";
import { useClerk } from "@clerk/nextjs";

import {
  CreditCardIcon,
  HelpCircleIcon,
  LogOutIcon,
  MoreVerticalIcon,
  UserCircleIcon,
} from "lucide-react";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { cn } from "@/lib/utils";
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
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "@/components/ui/sidebar";
import Link from "next/link";

const NavUserItems = [
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

export function NavUser({
  user,
  isCollapsed = false,
}: {
  user: {
    name: string;
    email: string;
    avatar: string;
  };
  isCollapsed?: boolean;
}) {
  const { isMobile } = useSidebar();
  const { signOut } = useClerk();
  return (
    <SidebarMenu>
      <SidebarMenuItem>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <SidebarMenuButton
              size="lg"
              className={cn(
                "group data-[state=open]:bg-gradient-to-r data-[state=open]:from-gray-50 data-[state=open]:to-gray-100/80 dark:data-[state=open]:from-gray-900 dark:data-[state=open]:to-gray-900/80 hover:bg-gradient-to-r hover:from-gray-50 hover:to-gray-100/80 dark:hover:from-gray-900 dark:hover:to-gray-900/80 rounded-2xl transition-all duration-300 border border-gray-200/80 dark:border-gray-800/80 hover:border-gray-300 dark:hover:border-gray-700 hover:shadow-md shadow-sm",
                isCollapsed ? "p-2 justify-center" : "p-3"
              )}
            >
              <div className="relative">
                <Avatar className={cn(
                  "rounded-xl ring-2 ring-gray-200/50 dark:ring-gray-800/50 group-hover:ring-primary/30 dark:group-hover:ring-primary/40 transition-all duration-300 shadow-md",
                  isCollapsed ? "h-9 w-9" : "h-10 w-10"
                )}>
                  <AvatarImage src={user.avatar} alt={user.name} className="object-cover" />
                  <AvatarFallback className="rounded-xl bg-gradient-to-br from-primary via-primary/95 to-primary/80 text-white font-bold text-sm">
                    {user.name?.charAt(0) || "U"}
                  </AvatarFallback>
                </Avatar>
                {!isCollapsed && (
                  <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-green-500 rounded-full border-[2.5px] border-white dark:border-gray-950 shadow-md ring-1 ring-green-400/30" />
                )}
              </div>
              {!isCollapsed && (
                <>
                  <div className="grid flex-1 text-left leading-tight min-w-0">
                    <span className="truncate font-bold text-[13px] text-gray-900 dark:text-white mb-0.5">{user.name}</span>
                    <span className="truncate text-[11px] text-gray-500 dark:text-gray-400 font-medium">
                      {user.email}
                    </span>
                  </div>
                  <div className="ml-auto flex items-center justify-center w-6 h-6 rounded-lg bg-gray-100 dark:bg-gray-900 group-hover:bg-gray-200 dark:group-hover:bg-gray-800 transition-colors flex-shrink-0">
                    <MoreVerticalIcon className="size-3.5 text-gray-500 dark:text-gray-400 group-hover:text-gray-700 dark:group-hover:text-gray-300 transition-colors" />
                  </div>
                </>
              )}
            </SidebarMenuButton>
          </DropdownMenuTrigger>
          <DropdownMenuContent
            className="w-[--radix-dropdown-menu-trigger-width] min-w-72 rounded-2xl shadow-2xl border-gray-200/50 dark:border-gray-800/50 p-3 bg-white/95 dark:bg-gray-950/95 backdrop-blur-xl"
            side={isMobile ? "bottom" : "right"}
            align="end"
            sideOffset={8}
          >
            <DropdownMenuLabel className="p-0 font-normal mb-3">
              <div className="relative overflow-hidden bg-gradient-to-br from-primary/5 via-primary/10 to-primary/5 dark:from-primary/10 dark:via-primary/20 dark:to-primary/10 rounded-2xl p-4 border border-primary/10 dark:border-primary/20">
                <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/5 to-transparent" />
                <div className="relative flex items-center gap-3">
                  <div className="relative">
                    <Avatar className="h-12 w-12 rounded-xl ring-2 ring-primary/30 shadow-lg">
                      <AvatarImage src={user.avatar} alt={user.name} className="object-cover" />
                      <AvatarFallback className="rounded-xl bg-gradient-to-br from-primary to-primary/80 text-white font-bold text-base">
                        {user.name?.charAt(0) || "U"}
                      </AvatarFallback>
                    </Avatar>
                    <div className="absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 bg-green-500 rounded-full border-2 border-white dark:border-gray-950 shadow-md" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-0.5">
                      <span className="truncate font-bold text-gray-900 dark:text-white text-base">{user.name}</span>
                    </div>
                    <span className="truncate text-xs text-gray-600 dark:text-gray-400 font-medium block">
                      {user.email}
                    </span>
                    <div className="flex items-center gap-1.5 mt-1.5">
                      <div className="px-2 py-0.5 bg-primary/10 dark:bg-primary/20 rounded-md">
                        <span className="text-[10px] font-bold text-primary uppercase tracking-wide">Pro Trial</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </DropdownMenuLabel>
            <DropdownMenuSeparator className="my-2 bg-gray-200 dark:bg-gray-800" />
            <DropdownMenuGroup className="space-y-1">
              {NavUserItems.map((item) => (
                <Link href={item.href} key={item.label}>
                  <DropdownMenuItem className="cursor-pointer rounded-xl px-3 py-3 focus:bg-gray-100 dark:focus:bg-gray-900/70 transition-all duration-200 group">
                    <div className="flex items-center gap-3 w-full">
                      <div className="p-1.5 rounded-lg bg-gray-100 dark:bg-gray-900 group-hover:bg-primary/10 dark:group-hover:bg-primary/20 transition-colors">
                        <item.icon className="h-4 w-4 text-gray-600 dark:text-gray-400 group-hover:text-primary transition-colors" />
                      </div>
                      <span className="font-semibold text-sm text-gray-700 dark:text-gray-300 group-hover:text-gray-900 dark:group-hover:text-white">{item.label}</span>
                    </div>
                  </DropdownMenuItem>
                </Link>
              ))}
            </DropdownMenuGroup>
            <DropdownMenuSeparator className="my-2 bg-gray-200 dark:bg-gray-800" />
            <DropdownMenuItem
              onClick={() => signOut()}
              className="cursor-pointer rounded-xl px-3 py-3 focus:bg-red-50 dark:focus:bg-red-950/30 transition-all duration-200 group"
            >
              <div className="flex items-center gap-3 w-full">
                <div className="p-1.5 rounded-lg bg-gray-100 dark:bg-gray-900 group-hover:bg-red-50 dark:group-hover:bg-red-950/50 transition-colors">
                  <LogOutIcon className="h-4 w-4 text-gray-600 dark:text-gray-400 group-hover:text-red-600 dark:group-hover:text-red-400 transition-colors" />
                </div>
                <span className="font-semibold text-sm text-gray-700 dark:text-gray-300 group-hover:text-red-600 dark:group-hover:text-red-400">Log out</span>
              </div>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </SidebarMenuItem>
    </SidebarMenu>
  );
}
