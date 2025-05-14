"use client";

import React, { useState } from "react";
import { CreateAdForm } from "@/components/ads/CreateAdForm";
import AdTemplateSearch from "./AdTemplateSearch";
import { AdCreationProvider } from "@/contexts/AdCreationContext";
import Breadcrumb from "@/components/Breadcrumb";

const AdCreate: React.FC = () => {
  const [step, setStep] = useState(1);

  const handleNext = () => {
    setStep(2);
  };

  const handleBack = () => {
    setStep(1);
  };

  return (
    <AdCreationProvider>
      <div className="mx-auto">
        <div className="mb-6">
          <Breadcrumb
            items={[
              { label: "Dashboard", href: "/dashboard" },
              { label: "Ad Create", href: "/dashboard/ad-create" },
            ]}
          />
        </div>
        {step === 1 ? (
          <CreateAdForm onNext={handleNext} />
        ) : (
          <AdTemplateSearch onBack={handleBack} />
        )}
      </div>
    </AdCreationProvider>
  );
};

export default AdCreate;
