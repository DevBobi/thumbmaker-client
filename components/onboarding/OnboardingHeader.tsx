"use client";

import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";
import { useUser } from "@clerk/nextjs";
import { cn } from "@/lib/utils";

interface OnboardingHeaderProps {
  onSkip?: () => void;
  showSkip?: boolean;
  currentStepName: string;
}

const steps = ["Project", "Image", "Review", "Pricing"];

export default function OnboardingHeader({
  onSkip,
  showSkip = true,
  currentStepName,
}: OnboardingHeaderProps) {
  const router = useRouter();
  const { user } = useUser();

  const handleSkip = () => {
    if (!showSkip) return;

    if (onSkip) {
      onSkip();
    } else {
      // Default skip behavior
      if (user?.id) {
        localStorage.setItem(`hasCompletedNewOnboarding_${user.id}`, "true");
      }
      router.push("/dashboard");
    }
  };

  return (
    <div className="fixed top-0 left-0 right-0 z-50 border-b border-border/70 bg-background/90 backdrop-blur-lg shadow-sm">
      <div className="max-w-6xl mx-auto px-4 sm:px-6">
        <div className="flex flex-col gap-4 py-4 lg:flex-row lg:items-center lg:justify-between">
          {/* Brand */}
          <div className="shrink-0">
            <p className="text-xs uppercase tracking-[0.3em] text-muted-foreground">
              ThumbMaker
            </p>
            <p className="text-lg font-semibold tracking-tight">
              Guided onboarding
            </p>
          </div>

          {/* Timeline */}
          <div className="flex-1 max-w-2xl mx-auto">
            <ol className="flex items-center justify-center gap-4 sm:gap-6">
              {steps.map((step, index) => {
                const isActive = step === currentStepName;
                const isCompleted = steps.indexOf(currentStepName) > index;
                const isLast = index === steps.length - 1;

                return (
                  <li key={step} className="flex items-center gap-2 sm:gap-3">
                    <div className="flex flex-col items-center gap-1">
                      <div
                        className={cn(
                          "flex h-7 w-7 items-center justify-center rounded-full border text-xs font-semibold",
                          isActive
                            ? "bg-primary text-primary-foreground border-primary shadow-sm"
                            : isCompleted
                            ? "bg-primary/5 text-foreground border-primary/50"
                            : "bg-background text-muted-foreground border-border"
                        )}
                      >
                        {index + 1}
                      </div>
                      <span
                        className={cn(
                          "text-[11px] font-medium",
                          isActive
                            ? "text-foreground"
                            : isCompleted
                            ? "text-foreground/80"
                            : "text-muted-foreground"
                        )}
                      >
                        {step}
                      </span>
                    </div>
                    {!isLast && (
                      <div className="h-px w-8 sm:w-14 bg-border/70" />
                    )}
                  </li>
                );
              })}
            </ol>
          </div>

          {/* Skip */}
          <div className="flex items-center justify-end">
            <Button
              variant="secondary"
              size="sm"
              onClick={handleSkip}
              disabled={!showSkip}
              className={cn(
                "text-sm font-medium",
                !showSkip && "opacity-60 cursor-not-allowed"
              )}
            >
              Skip
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}

