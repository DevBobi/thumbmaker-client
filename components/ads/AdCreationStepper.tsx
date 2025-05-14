import React from "react";
import { Check, ArrowRight } from "lucide-react";

interface StepperProps {
  currentStep: number;
  steps: {
    id: number;
    name: string;
  }[];
}

const AdCreationStepper: React.FC<StepperProps> = ({ currentStep, steps }) => {
  return (
    <div className="mb-8">
      <div className="flex items-center justify-between">
        {steps.map((step, index) => (
          <React.Fragment key={step.id}>
            <div className="flex flex-col items-center">
              <div
                className={`flex items-center justify-center w-8 h-8 rounded-full border-2 ${
                  currentStep >= step.id
                    ? "bg-brand-600 border-brand-600 text-white"
                    : "border-gray-300 text-gray-400"
                }`}
              >
                {currentStep > step.id ? (
                  <Check className="w-4 h-4" />
                ) : (
                  <span>{step.id}</span>
                )}
              </div>
              <span
                className={`mt-2 text-sm font-medium ${
                  currentStep >= step.id ? "text-brand-600" : "text-gray-500"
                }`}
              >
                {step.name}
              </span>
            </div>
            {index < steps.length - 1 && (
              <div
                className={`flex-1 h-0.5 mx-2 ${
                  currentStep > index + 1 ? "bg-brand-600" : "bg-gray-300"
                }`}
              ></div>
            )}
          </React.Fragment>
        ))}
      </div>
    </div>
  );
};

export default AdCreationStepper;
