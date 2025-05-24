"use client";
import React, { useState } from "react";
import { usePathname } from "next/navigation";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";
import { cn } from "@/lib/utils";
import {
  LayoutDashboard,
  History,
  Crown,
  User,
  PlusCircle,
  Package,
  FileText,
  HelpCircle,
  Loader2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { NavUser } from "@/components/NavUser";
import { Badge } from "@/components/ui/badge";
import { useFreeCredits } from "@/hooks/use-free-credits";

type User = {
  name: string;
  email: string;
  avatar: string;
};
type Subscription = {
  credits: number;
  isActive: boolean;
  gotFreeCredits: boolean;
};

const navigationItems = [
  {
    title: "Dashboard",
    path: "/dashboard",
    icon: LayoutDashboard,
  },
  {
    title: "Create Ad",
    path: "/dashboard/create-ad",
    icon: PlusCircle,
  },
  {
    title: "Create Video Project",
    path: "/dashboard/create-video-project",
    icon: PlusCircle,
  },
  {
    title: "Create Youtube Thumbnail",
    path: "/dashboard/create-youtube-thumbnail",
    icon: PlusCircle,
  },
  {
    title: "All Products",
    path: "/dashboard/products",
    icon: Package,
  },
  {
    title: "All Projects",
    path: "/dashboard/video-projects",
    icon: FileText,
  },
  {
    title: "Templates",
    path: "/dashboard/templates",
    icon: FileText,
  },
  {
    title: "History",
    path: "/dashboard/history",
    icon: History,
  },
  // {
  //   title: "Support",
  //   path: "/dashboard/support",
  //   icon: HelpCircle,
  // },
];

export function AppSidebar({
  user,
  subscription,
}: {
  user: User;
  subscription: Subscription;
}) {
  const pathname = usePathname();
  const { isLoading, error, handleGetFreeCredits } = useFreeCredits();

  return (
    <Sidebar className="bg-sidebar">
      <SidebarHeader className="px-4 space-y-0">
        <div className="flex items-center gap-2">
          <Link href="/dashboard">
            <h1 className="text-2xl font-bold bg-gradient-to-r from-brand-400 to-brand-600 bg-clip-text text-transparent">
              KRILLION
            </h1>
          </Link>
          <Badge variant="outline" className="uppercase text-[8px]">
            Beta
          </Badge>
        </div>
        <p className="text-xs text-muted-foreground font-medium">
          AI Ad Generator
        </p>
      </SidebarHeader>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupContent>
            <SidebarMenu>
              {navigationItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild>
                    <Link
                      href={item.path}
                      className={cn(
                        "flex items-center gap-3",
                        pathname === item.path
                          ? "text-foreground font-medium"
                          : "text-muted-foreground"
                      )}
                    >
                      <item.icon className="h-5 w-5" />
                      <span>{item.title}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
      {/* <SidebarFooter>
        <Button
          variant="default"
          className="w-full bg-brand-600 hover:bg-brand-700 gap-2"
          asChild
        >
          <Link href="/upgrade">
            <Crown className="h-4 w-4" />
            Upgrade
          </Link>
        </Button>
      </SidebarFooter> */}
      <SidebarFooter className="pb-8">
        <NavUser user={user} />
        {subscription.isActive ? (
          ""
        ) : (
          <>
            {!subscription.gotFreeCredits && (
              <Button size="lg">
                <Link href="/pricing">Get 10 Free Ad Credits</Link>
              </Button>
            )}
            <Button variant="brand" size="lg" asChild>
              <Link href="/pricing">
                <Crown className="h-4 w-4" />
                Upgrade
              </Link>
            </Button>
          </>
        )}
      </SidebarFooter>
    </Sidebar>
  );
}

export default AppSidebar;
