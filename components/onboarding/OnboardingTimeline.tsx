"use client";

import { Check } from "lucide-react";
import { cn } from "@/lib/utils";

interface OnboardingTimelineProps {
  currentStep: number;
  totalSteps: number;
  stepNames: string[];
}

export default function OnboardingTimeline({
  currentStep,
  totalSteps,
  stepNames,
}: OnboardingTimelineProps) {
  return (
    <div className="w-full py-3">
      <div className="max-w-3xl mx-auto px-4 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        {Array.from({ length: totalSteps }).map((_, index) => {
          const stepNumber = index + 1;
          const isCompleted = stepNumber < currentStep;
          const isCurrent = stepNumber === currentStep;
          const isUpcoming = stepNumber > currentStep;
          const stepName = stepNames[index] || `Step ${stepNumber}`;

          return (
            <div key={index} className="flex items-center sm:flex-1">
              <div className="flex flex-col items-center gap-1 flex-1">
                <div
                  className={cn(
                    "flex h-8 w-8 sm:h-9 sm:w-9 items-center justify-center rounded-full border-2 text-xs sm:text-sm font-semibold transition-all",
                    isCompleted
                      ? "bg-brand-600 border-brand-600 text-white"
                      : isCurrent
                        ? "bg-brand-600 border-brand-600 text-white ring-2 ring-brand-200"
                        : "border-muted bg-background text-muted-foreground"
                  )}
                >
                  {isCompleted ? (
                    <Check className="h-5 w-5" />
                  ) : (
                    <span>{stepNumber}</span>
                  )}
                </div>
                <span
                  className={cn(
                    "text-[11px] sm:text-xs font-medium text-center max-w-[80px] sm:max-w-[120px] leading-snug",
                    isCompleted || isCurrent
                      ? "text-brand-600"
                      : "text-muted-foreground"
                  )}
                >
                  {stepName}
                </span>
              </div>
              {index < totalSteps - 1 && (
                <div
                  className={cn(
                    "hidden sm:block h-0.5 flex-1 mx-2 transition-colors",
                    isCompleted ? "bg-brand-600" : "bg-muted"
                  )}
                />
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

