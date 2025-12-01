"use client";

import { useState } from "react";
import Image from "next/image";
import { Upload } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuthFetch } from "@/hooks/use-auth-fetch";
import { useToast } from "@/hooks/use-toast";
import { uploadToStorage } from "@/actions/upload";
import { Project } from "@/types";
import { OnboardingProjectInput } from "./NewOnboarding";

interface OnboardingImageStepProps {
  projectData: OnboardingProjectInput | null;
  onBack: () => void;
  onCreated: (project: Project) => void;
}

export default function OnboardingImageStep({
  projectData,
  onBack,
  onCreated,
}: OnboardingImageStepProps) {
  const { authFetch } = useAuthFetch();
  const { toast } = useToast();
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [isCreating, setIsCreating] = useState(false);

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    setImageFile(file);
    const reader = new FileReader();
    reader.onload = (e) => setImagePreview(e.target?.result as string);
    reader.readAsDataURL(file);
  };

  const removeImage = () => {
    setImageFile(null);
    setImagePreview(null);
  };

  const handleCreateProject = async () => {
    if (!projectData) {
      toast({
        title: "Missing details",
        description: "Please complete project details first.",
        variant: "destructive",
      });
      return;
    }

    setIsCreating(true);
    try {
      let imageUrl: string | null = null;
      if (imageFile) {
        const formData = new FormData();
        formData.append("file", imageFile);
        const uploadResult = await uploadToStorage(formData);
        if (!uploadResult.success || !uploadResult.fileUrl) {
          throw new Error(uploadResult.error || "Failed to upload image");
        }
        imageUrl = uploadResult.fileUrl;
      }

      let createdProject: Project | null = null;

      if (projectData.creationMethod === "manual") {
        const response = await authFetch("/projects/create", {
          method: "POST",
          body: JSON.stringify({
            title: projectData.title,
            description: projectData.description,
            highlights: projectData.highlights,
            targetAudience: projectData.targetAudience,
            image: imageUrl,
          }),
        });
        if (!response.ok) throw new Error("Failed to create project");
        createdProject = await response.json();
      } else {
        let endpoint = "";
        const body: Record<string, unknown> = {
          title: projectData.title,
          image: imageUrl,
        };

        if (projectData.creationMethod === "text") {
          endpoint = "/projects/create-with-text";
          body.content = projectData.textContent;
        } else if (projectData.creationMethod === "youtube") {
          endpoint = "/projects/create-with-youtube";
          body.youtubeLink = projectData.youtubeLink;
        } else if (projectData.creationMethod === "document") {
          if (!projectData.documentFile) {
            throw new Error("Document file missing");
          }
          const docFormData = new FormData();
          docFormData.append("file", projectData.documentFile);
          const docUpload = await uploadToStorage(docFormData);
          if (!docUpload.success || !docUpload.fileUrl) {
            throw new Error(docUpload.error || "Failed to upload document");
          }
          endpoint = "/projects/create-with-document";
          body.document = docUpload.fileUrl;
        }

        const response = await authFetch(endpoint, {
          method: "POST",
          body: JSON.stringify(body),
        });
        if (!response.ok) throw new Error("Failed to create project");
        createdProject = await response.json();
      }

      if (!createdProject) throw new Error("Project creation failed");

      toast({
        title: "Project created",
        description: "Your project is ready for review.",
      });
      onCreated(createdProject);
    } catch (error) {
      toast({
        title: "Creation failed",
        description:
          error instanceof Error
            ? error.message
            : "Unable to create project. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsCreating(false);
    }
  };

  return (
    <div className="w-full max-w-2xl space-y-8">
      <div className="text-center space-y-2">
        <p className="text-xs font-semibold uppercase tracking-[0.3em] text-muted-foreground">
          Step 2 of 4
        </p>
        <h1 className="text-3xl font-bold tracking-tight">
          Upload a project image
        </h1>
        <p className="text-muted-foreground">
          Add an image or logo to help the AI understand your brand.
        </p>
      </div>

      <div className="space-y-4 border rounded-2xl p-6 shadow-sm bg-card/60">
        <div className="space-y-2">
          <label className="text-sm font-medium">Project Image</label>
          <div className="space-y-4">
            {imagePreview && (
              <div className="relative bg-muted/30 rounded-lg border p-2 min-h-[220px]">
                <Image
                  src={imagePreview}
                  alt="Preview"
                  fill
                  className="object-contain rounded-lg"
                  sizes="(max-width: 768px) 100vw, 600px"
                  unoptimized
                />
                <button
                  type="button"
                  onClick={removeImage}
                  className="absolute top-3 right-3 bg-red-500 text-white rounded-full w-7 h-7 flex items-center justify-center text-sm hover:bg-red-600 shadow-lg"
                >
                  ×
                </button>
              </div>
            )}

            <div>
              <input
                type="file"
                accept="image/*"
                onChange={handleImageUpload}
                className="hidden"
                id="onboarding-image-upload"
              />
              <label
                htmlFor="onboarding-image-upload"
                className="flex flex-col items-center justify-center border-2 border-dashed rounded-lg p-6 text-center cursor-pointer hover:border-primary/60 transition-colors"
              >
                <Upload className="h-6 w-6 text-muted-foreground mb-2" />
                <span className="text-sm text-muted-foreground">
                  {imagePreview ? "Change image" : "Upload image"}
                </span>
                <span className="text-xs text-muted-foreground/70">
                  PNG, JPG up to 10MB
                </span>
              </label>
            </div>
          </div>
        </div>

        <div className="flex flex-col gap-3 sm:flex-row">
          <Button variant="outline" className="w-full sm:flex-1" onClick={onBack}>
            Back
          </Button>
          <Button
            className="w-full sm:flex-1"
            onClick={handleCreateProject}
            disabled={isCreating}
          >
            {isCreating ? "Creating..." : "Create Project"}
          </Button>
        </div>
      </div>
    </div>
  );
}

