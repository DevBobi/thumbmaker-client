// contexts/AdCreationContext.tsx
import React, { createContext, useContext, useState, ReactNode } from "react";
import { Product } from "@/contexts/ProductContext";
import { BrandTone, AdTemplate } from "@/contexts/AdContext";
import { useAuthFetch } from "@/hooks/use-auth-fetch";
import { uploadToStorage } from "@/actions/upload";
import { useRouter } from "next/navigation";

// Define the shape of our ad creation data
export interface AdCreationData {
  // Step 1: Ad Details
  product?: Product;
  brandTone?: BrandTone;
  aspectRatio?: string;
  adGoal?: string;
  callToAction?: string;
  variationCount?: number;
  mediaFiles: File[];
  additionalContext?: string;
  additionalInstructions?: string;

  // Step 2: Templates
  selectedTemplates: AdTemplate[];
}

// Define the context interface
interface AdCreationContextType {
  adCreationData: AdCreationData;
  updateAdCreationData: (data: Partial<AdCreationData>) => void;
  addMediaFile: (file: File) => void;
  removeMediaFile: (index: number) => void;
  addTemplate: (template: AdTemplate) => void;
  removeTemplate: (template: AdTemplate) => void;
  resetAdCreationData: () => void;
  submitAdCreation: () => Promise<void>;
  isSubmitting: boolean;
}

// Create the context with a default value
const AdCreationContext = createContext<AdCreationContextType | undefined>(
  undefined
);

// Initial state for the ad creation data
const initialAdCreationData: AdCreationData = {
  mediaFiles: [],
  selectedTemplates: [],
  variationCount: 2,
};

// Provider component
export const AdCreationProvider: React.FC<{ children: ReactNode }> = ({
  children,
}) => {
  const { authFetch } = useAuthFetch();
  const router = useRouter();
  const [adCreationData, setAdCreationData] = useState<AdCreationData>(
    initialAdCreationData
  );
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Update ad creation data
  const updateAdCreationData = (data: Partial<AdCreationData>) => {
    setAdCreationData((prev) => ({ ...prev, ...data }));
  };

  // Add a media file
  const addMediaFile = (file: File) => {
    setAdCreationData((prev) => ({
      ...prev,
      mediaFiles: [...prev.mediaFiles, file],
    }));
  };

  // Remove a media file
  const removeMediaFile = (index: number) => {
    setAdCreationData((prev) => ({
      ...prev,
      mediaFiles: prev.mediaFiles.filter((_, i) => i !== index),
    }));
  };

  // Add a template ID
  const addTemplate = (template: AdTemplate) => {
    // Check if template ID is already selected
    if (adCreationData.selectedTemplates.some((t) => t.id === template.id)) {
      return;
    }

    setAdCreationData((prev) => ({
      ...prev,
      selectedTemplates: [...prev.selectedTemplates, template],
    }));
  };

  // Remove a template ID
  const removeTemplate = (template: AdTemplate) => {
    setAdCreationData((prev) => ({
      ...prev,
      selectedTemplates: prev.selectedTemplates.filter(
        (t) => t.id !== template.id
      ),
    }));
  };

  // Reset ad creation data
  const resetAdCreationData = () => {
    setAdCreationData(initialAdCreationData);
  };

  // Submit ad creation data
  const submitAdCreation = async () => {
    try {
      setIsSubmitting(true);

      // Validate required fields
      if (!adCreationData.product) {
        throw new Error("Product is required");
      }

      if (!adCreationData.brandTone) {
        throw new Error("Brand tone is required");
      }

      if (!adCreationData.aspectRatio) {
        throw new Error("Aspect ratio is required");
      }

      // Validate media files
      if (adCreationData.mediaFiles.length === 0) {
        throw new Error("At least one media file is required");
      }

      if (adCreationData.selectedTemplates.length === 0) {
        throw new Error("At least one template must be selected");
      }

      // Upload all media files to storage
      const uploadedMediaUrls = await Promise.all(
        adCreationData.mediaFiles.map(async (file) => {
          const formData = new FormData();
          formData.append("file", file as Blob);
          const uploadResult = await uploadToStorage(formData);
          return uploadResult.fileUrl;
        })
      );

      // Prepare data for submission with uploaded media URLs
      const submissionData = {
        product: adCreationData.product,
        brandTone: adCreationData.brandTone,
        aspectRatio: adCreationData.aspectRatio,
        adGoal: adCreationData.adGoal,
        callToAction: adCreationData.callToAction,
        variationCount: adCreationData.variationCount,
        mediaFiles: uploadedMediaUrls,
        additionalContext: adCreationData.additionalContext,
        additionalInstructions: adCreationData.additionalInstructions,
        templates: adCreationData.selectedTemplates.map((t) => t.id),
      };

      // Submit the data to your API endpoint
      const response = await authFetch("/api/ads/create", {
        method: "POST",
        body: JSON.stringify(submissionData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to create ad");
      }

      const data = await response.json();

      router.push(`/dashboard/generated-ads/${data.id}`);

      // Reset the form after successful submission
      resetAdCreationData();

      console.log("Ad creation submitted successfully:", submissionData);
    } catch (error) {
      console.error("Error submitting ad creation:", error);
      throw error;
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <AdCreationContext.Provider
      value={{
        adCreationData,
        updateAdCreationData,
        addMediaFile,
        removeMediaFile,
        addTemplate,
        removeTemplate,
        resetAdCreationData,
        submitAdCreation,
        isSubmitting,
      }}
    >
      {children}
    </AdCreationContext.Provider>
  );
};

// Custom hook to use the ad creation context
export const useAdCreation = () => {
  const context = useContext(AdCreationContext);
  if (context === undefined) {
    throw new Error("useAdCreation must be used within an AdCreationProvider");
  }
  return context;
};
