"use client";

import { useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";
import { useUser } from "@clerk/nextjs";

export default function OnboardingRedirect({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const { user, isLoaded } = useUser();

  useEffect(() => {
    if (!isLoaded || !user) return;

    // Don't redirect if already on onboarding page
    if (pathname === "/onboarding") {
      return;
    }

    // Check if user has completed onboarding
    const hasCompletedOnboarding = localStorage.getItem(
      `hasCompletedNewOnboarding_${user.id}`
    );

    // If not completed and on a dashboard page, redirect to onboarding
    if (!hasCompletedOnboarding && pathname?.startsWith("/dashboard")) {
      router.push("/onboarding");
    }
  }, [user, isLoaded, pathname, router]);

  return <>{children}</>;
}

