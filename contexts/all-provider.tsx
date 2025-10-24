"use client";

import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Next13ProgressBar } from "next13-progressbar";
import { ProductProvider } from "@/contexts/ProductContext";
import { AdProvider } from "@/contexts/AdContext";
import { ClerkProvider } from "@clerk/nextjs";
import { ThemeProvider } from "./ThemProvider";

const queryClient = new QueryClient();

export function AllProvider({ children }: { children: React.ReactNode }) {
  return (
    <ThemeProvider
      attribute="class"
      defaultTheme="light"
      disableTransitionOnChange
    >
      <ClerkProvider
      publishableKey={process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY}
      signInUrl="/sign-in"
      signUpUrl="/sign-up"
      afterSignInUrl="/dashboard"
      afterSignUpUrl="/dashboard"
      >
        <QueryClientProvider client={queryClient}>
          <ProductProvider>
            <AdProvider>
              <TooltipProvider>
                {children}
                <Next13ProgressBar
                  height="2px"
                  color="#9f75ff"
                  options={{ showSpinner: true }}
                  showOnShallow
                />
                <Toaster />
                <Sonner />
              </TooltipProvider>
            </AdProvider>
          </ProductProvider>
        </QueryClientProvider>
      </ClerkProvider>
    </ThemeProvider>
  );
}
