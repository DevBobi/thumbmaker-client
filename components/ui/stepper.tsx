"use client";

import { Check } from "lucide-react";
import React from "react";
import { cn } from "@/lib/utils";

export interface StepConfig {
  id: number;
  name: string;
}

interface StepperProps {
  currentStep: number;
  steps: StepConfig[];
  className?: string;
}

const Stepper: React.FC<StepperProps> = ({ currentStep, steps, className }) => {
  return (
    <div className={cn("mb-8", className)}>
      <div className="overflow-x-auto pb-2">
        <div className="flex min-w-[520px] items-center justify-between gap-2 pr-4">
          {steps.map((step, index) => (
            <React.Fragment key={step.id}>
              <div className="flex flex-col items-center gap-2 text-center">
                <div
                  className={cn(
                    "flex h-10 w-10 items-center justify-center rounded-full border-2 text-sm font-semibold transition-colors",
                    currentStep >= step.id
                      ? "bg-brand-600 border-brand-600 text-white"
                      : "border-border text-muted-foreground"
                  )}
                >
                  {currentStep > step.id ? (
                    <Check className="h-4 w-4" />
                  ) : (
                    <span>{step.id}</span>
                  )}
                </div>
                <span
                  className={cn(
                    "text-xs font-medium uppercase tracking-wide",
                    currentStep >= step.id
                      ? "text-brand-600"
                      : "text-muted-foreground"
                  )}
                >
                  {step.name}
                </span>
              </div>
              {index < steps.length - 1 && (
                <div
                  className={cn(
                    "mx-1 h-0.5 flex-1 rounded-full transition-colors",
                    currentStep > step.id ? "bg-brand-600" : "bg-muted"
                  )}
                />
              )}
            </React.Fragment>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Stepper;


