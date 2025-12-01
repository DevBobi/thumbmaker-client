"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useUser } from "@clerk/nextjs";
import NewOnboarding, { OnboardingProjectInput } from "./NewOnboarding";
import OnboardingImageStep from "./OnboardingImageStep";
import ProjectCreatedScreen from "./ProjectCreatedScreen";
import OnboardingHeader from "./OnboardingHeader";
import PricingScreen from "./PricingScreen";
import { Project } from "@/types";

type OnboardingStep = "details" | "image" | "success" | "pricing";

export default function OnboardingFlow() {
  const [step, setStep] = useState<OnboardingStep>("details");
  const [projectInput, setProjectInput] = useState<OnboardingProjectInput | null>(null);
  const [project, setProject] = useState<Project | null>(null);
  const router = useRouter();
  const { user } = useUser();

  const totalSteps = 4;
  const currentStepNumber =
    step === "details" ? 1 : step === "image" ? 2 : step === "success" ? 3 : 4;

  const handleBack = () => {
    if (step === "pricing") {
      setStep("success");
    } else if (step === "success") {
      setStep("image");
    } else if (step === "image") {
      setStep("details");
    }
  };

  const markOnboardingComplete = async () => {
    if (!user) return;

    try {
      // Update Clerk metadata to mark onboarding as complete
      await user.update({
        unsafeMetadata: {
          ...user.unsafeMetadata,
          hasCompletedOnboarding: true,
          hasCompletedNewOnboarding: true,
          onboardingCompletedAt: new Date().toISOString(),
        },
      });

      // Also update localStorage for backward compatibility
      if (user.id) {
        localStorage.setItem(`hasCompletedNewOnboarding_${user.id}`, "true");
      }
    } catch (error) {
      console.error("Error updating user metadata:", error);
      // Fallback to localStorage only if metadata update fails
      if (user.id) {
        localStorage.setItem(`hasCompletedNewOnboarding_${user.id}`, "true");
      }
    }
  };

  const handleSkip = async () => {
    await markOnboardingComplete();
    router.push("/dashboard");
  };

  const handleOnboardingComplete = async () => {
    await markOnboardingComplete();
    router.push("/dashboard");
  };

  const showBack = step !== "details";
  const showSkip = step === "pricing";

  let content = null;
  if (step === "details") {
    content = (
      <NewOnboarding
        onContinue={(data) => {
          setProjectInput(data);
          setStep("image");
        }}
      />
    );
  } else if (step === "image") {
    content = (
      <OnboardingImageStep
        projectData={projectInput}
        onBack={() => setStep("details")}
        onCreated={(createdProject) => {
          setProject(createdProject);
          setStep("success");
        }}
      />
    );
  } else if (step === "success" && project) {
    content = (
      <ProjectCreatedScreen
        project={project}
        onNext={() => setStep("pricing")}
      />
    );
  } else if (step === "pricing") {
    content = <PricingScreen onComplete={handleOnboardingComplete} />;
  }

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <OnboardingHeader
        onSkip={showSkip ? handleSkip : undefined}
        showSkip={showSkip}
        currentStepName={
          step === "details"
            ? "Project"
            : step === "image"
            ? "Image"
            : step === "success"
            ? "Review"
            : "Pricing"
        }
      />

      <div className="pt-16 flex-1 overflow-y-auto">
        <div className="w-full flex items-start justify-center px-4 py-10">
          {content}
        </div>
      </div>
    </div>
  );
}

