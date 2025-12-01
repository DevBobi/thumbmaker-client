"use client";

import { useEffect, useState } from "react";
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
  const [shouldRender, setShouldRender] = useState(false);
  const [isRedirecting, setIsRedirecting] = useState(false);

  useEffect(() => {
    // Wait for Clerk to load
    if (!isLoaded) {
      return;
    }

    // If no user, allow render (auth will handle redirect)
    if (!user) {
      setShouldRender(true);
      return;
    }

    // If already on onboarding page, allow render
    if (pathname === "/onboarding") {
      setShouldRender(true);
      return;
    }

    // Check if user has completed onboarding from Clerk metadata
    const hasCompletedOnboarding = 
      user.unsafeMetadata?.hasCompletedOnboarding === true ||
      user.unsafeMetadata?.hasCompletedNewOnboarding === true ||
      user.publicMetadata?.hasCompletedOnboarding === true ||
      user.publicMetadata?.hasCompletedNewOnboarding === true;

    // Fallback to localStorage for backward compatibility
    const hasCompletedLocalStorage = typeof window !== "undefined" 
      ? localStorage.getItem(`hasCompletedNewOnboarding_${user.id}`)
      : null;

    const hasCompleted = hasCompletedOnboarding || !!hasCompletedLocalStorage;

    // If not completed and on a dashboard page, redirect immediately
    if (!hasCompleted && pathname?.startsWith("/dashboard")) {
      setIsRedirecting(true);
      // Use replace to avoid adding to history and prevent flash
      router.replace("/onboarding");
      return;
    }

    // Allow render if onboarding is complete or not on dashboard
    setShouldRender(true);
  }, [user, isLoaded, pathname, router]);

  // Don't render anything while checking or redirecting
  if (!isLoaded || isRedirecting || !shouldRender) {
    return null;
  }

  return <>{children}</>;
}

