"use client";

import React, { useState, useEffect } from "react";
import { FormSheet } from "@/components/ui/form-sheet";
import { useToast } from "@/hooks/use-toast";
import { useRouter } from "next/navigation";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Plus, X, Image } from "lucide-react";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { useAuthFetch } from "@/hooks/use-auth-fetch";
import { uploadToStorage } from "@/actions/upload";

// Form validation schema
const formSchema = z.object({
  videoTitle: z.string().min(2, {
    message: "Title must be at least 2 characters.",
  }),
  videoDescription: z.string().min(10, {
    message: "Description must be at least 10 characters.",
  }),
  targetAudience: z.string().min(10, {
    message: "Target audience must be at least 10 characters.",
  }),
  image: z.string().optional(),
});

interface VideoProjectSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  projectId?: string;
  mode?: "create" | "edit" | "view";
  onSuccess?: () => void;
}

export function VideoProjectSheet({
  open,
  onOpenChange,
  projectId,
  mode = "create",
  onSuccess,
}: VideoProjectSheetProps) {
  const router = useRouter();
  const { authFetch } = useAuthFetch();
  const { toast } = useToast();
  const [isSaving, setIsSaving] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [highlights, setHighlights] = useState<string[]>([""]);
  const [currentMode, setCurrentMode] = useState<"create" | "edit" | "view">(mode);
  const [projectData, setProjectData] = useState<any>(null);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);

  // Initialize form
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      videoTitle: "",
      videoDescription: "",
      targetAudience: "",
      image: "",
    },
  });

  // Update current mode when prop changes
  useEffect(() => {
    setCurrentMode(mode);
  }, [mode]);

  // Load project data if in edit or view mode
  useEffect(() => {
    if ((mode === "edit" || mode === "view") && projectId && open) {
      loadProjectData();
    }
  }, [mode, projectId, open]);

  const loadProjectData = async () => {
    setIsLoading(true);
    try {
      const response = await authFetch(`/api/projects/${projectId}`);
      if (!response.ok) {
        throw new Error("Failed to load project");
      }
      const data = await response.json();
      setProjectData(data);

      form.reset({
        videoTitle: data.title || "",
        videoDescription: data.description || "",
        targetAudience: data.targetAudience || "",
        image: data.image || "",
      });

      // Set image preview if image exists
      if (data.image) {
        setImagePreview(data.image);
      }

      if (Array.isArray(data.highlights) && data.highlights.length > 0) {
        setHighlights(data.highlights);
      } else {
        setHighlights([""]);
      }
    } catch (error) {
      console.error("Failed to load project:", error);
      toast({
        title: "Error loading project",
        description: "Failed to load project data",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleSave = async () => {
    const isValid = await form.trigger();
    if (!isValid) return;

    const values = form.getValues();
    setIsSaving(true);

    try {
      let imageUrl = values.image;
      
      // Upload image if a new file was selected
      if (imageFile) {
        const formData = new FormData();
        formData.append('file', imageFile); // Note: server action expects 'file' key
        
        const uploadResult = await uploadToStorage(formData);
        
        if (uploadResult.success && uploadResult.fileUrl) {
          imageUrl = uploadResult.fileUrl;
        } else {
          throw new Error(uploadResult.error || 'Failed to upload image');
        }
      }

      const projectData = {
        title: values.videoTitle,
        description: values.videoDescription,
        highlights: highlights.filter((h) => h.trim()),
        targetAudience: values.targetAudience,
        image: imageUrl,
      };

      const url =
        mode === "edit"
          ? `/api/projects/${projectId}`
          : "/api/projects/create";
      const method = mode === "edit" ? "PUT" : "POST";

      const response = await authFetch(url, {
        method,
        body: JSON.stringify(projectData),
      });

      if (!response.ok) {
        throw new Error(`Error: ${response.status} - ${response.statusText}`);
      }

      const data = await response.json();

      toast({
        title: mode === "edit" ? "Project updated" : "Project created",
        description:
          mode === "edit"
            ? `${values.videoTitle} has been updated.`
            : `${values.videoTitle} has been added to your projects.`,
      });

      // Reset form and close sheet
      form.reset();
      setHighlights([""]);
      onOpenChange(false);

      // Call success callback or navigate
      if (onSuccess) {
        onSuccess();
      } else if (mode === "create") {
        router.push(`/dashboard/video-projects`);
      } else {
        router.push("/dashboard/video-projects");
      }
    } catch (error) {
      console.error("Failed to save project:", error);
      toast({
        title: `Error ${mode === "edit" ? "updating" : "creating"} project`,
        description:
          error instanceof Error
            ? error.message
            : "An unexpected error occurred",
        variant: "destructive",
      });
    } finally {
      setIsSaving(false);
    }
  };

  const handleCancel = () => {
    if (currentMode === "edit") {
      // If in edit mode, go back to view mode
      setCurrentMode("view");
    } else {
      // If in view mode or create mode, close the sheet
      form.reset();
      setHighlights([""]);
      setProjectData(null);
      setImageFile(null);
      setImagePreview(null);
      onOpenChange(false);
    }
  };

  const handleEdit = () => {
    setCurrentMode("edit");
  };

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setImageFile(file);
      const reader = new FileReader();
      reader.onload = (e) => {
        setImagePreview(e.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const removeImage = () => {
    setImageFile(null);
    setImagePreview(null);
    form.setValue("image", "");
  };

  const addHighlight = () => {
    setHighlights([...highlights, ""]);
  };

  const removeHighlight = (index: number) => {
    const newHighlights = highlights.filter((_, i) => i !== index);
    setHighlights(newHighlights.length > 0 ? newHighlights : [""]);
  };

  const updateHighlight = (index: number, value: string) => {
    const newHighlights = [...highlights];
    newHighlights[index] = value;
    setHighlights(newHighlights);
  };

  return (
    <FormSheet
      open={open}
      onOpenChange={onOpenChange}
      title={
        currentMode === "view" 
          ? "Project Details" 
          : currentMode === "edit" 
          ? "Edit Project" 
          : "Create New Project"
      }
      description={
        currentMode === "view"
          ? "View your project information"
          : currentMode === "edit"
          ? "Update your project information"
          : "Add a new project to your collection"
      }
      onSave={handleSave}
      onCancel={handleCancel}
      saveLabel={currentMode === "edit" ? "Update Project" : "Create Project"}
      hideSaveButton={currentMode === "view"}
      isSaving={isSaving}
      isLoading={isLoading}
      size="md"
    >
      {currentMode === "view" ? (
        <div className="space-y-6">
          {/* View Mode Content */}
          <div className="space-y-4">
            {projectData?.image && (
              <div>
                <label className="text-sm font-medium text-muted-foreground">Project Image</label>
                <div className="mt-2">
                  <img 
                    src={projectData.image} 
                    alt={projectData.title || "Project image"} 
                    className="w-full h-48 object-cover rounded-lg border"
                  />
                </div>
              </div>
            )}
            
            <div>
              <label className="text-sm font-medium text-muted-foreground">Title</label>
              <p className="text-lg font-semibold">{projectData?.title || "No title"}</p>
            </div>
            
            <div>
              <label className="text-sm font-medium text-muted-foreground">Description</label>
              <p className="text-sm text-foreground whitespace-pre-wrap">
                {projectData?.description || "No description"}
              </p>
            </div>
            
            <div>
              <label className="text-sm font-medium text-muted-foreground">Key Highlights</label>
              <div className="space-y-2">
                {projectData?.highlights && projectData.highlights.length > 0 ? (
                  projectData.highlights.map((highlight: string, index: number) => (
                    <div key={index} className="flex items-center gap-2">
                      <div className="w-2 h-2 bg-brand-600 rounded-full flex-shrink-0"></div>
                      <span className="text-sm">{highlight}</span>
                    </div>
                  ))
                ) : (
                  <p className="text-sm text-muted-foreground">No highlights added</p>
                )}
              </div>
            </div>
            
            <div>
              <label className="text-sm font-medium text-muted-foreground">Target Audience</label>
              <p className="text-sm text-foreground whitespace-pre-wrap">
                {projectData?.targetAudience || "No target audience specified"}
              </p>
            </div>
          </div>
          
          <div className="flex gap-2 pt-4 border-t">
            <Button onClick={handleEdit} className="flex-1">
              Edit Project Information
            </Button>
          </div>
        </div>
      ) : (
        <Form {...form}>
          <form className="space-y-6">
          {/* Title Field */}
          <FormField
            control={form.control}
            name="videoTitle"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-base font-medium">
                  Title
                </FormLabel>
                <FormControl>
                  <Input placeholder="e.g. 'How to Master SEO in 2024'" {...field} />
                </FormControl>
                <FormMessage           />
          </FormItem>
        )}
      />

      {/* Image Upload Field */}
      <FormField
        control={form.control}
        name="image"
        render={({ field }) => (
          <FormItem>
            <FormLabel className="text-base font-medium">
              Project Image
            </FormLabel>
            <FormControl>
              <div className="space-y-4">
                {imagePreview && (
                  <div className="relative">
                    <img 
                      src={imagePreview} 
                      alt="Preview" 
                      className="w-full h-48 object-cover rounded-lg border"
                    />
                    <button
                      type="button"
                      onClick={removeImage}
                      className="absolute top-2 right-2 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-sm hover:bg-red-600"
                    >
                      ×
                    </button>
                  </div>
                )}
                <div className="flex items-center gap-4">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleImageUpload}
                    className="hidden"
                    id="image-upload"
                  />
                  <label
                    htmlFor="image-upload"
                    className="flex-1 cursor-pointer border-2 border-dashed border-gray-300 rounded-lg p-4 text-center hover:border-gray-400 transition-colors"
                  >
                    <div className="flex flex-col items-center gap-2">
                      <Image className="h-8 w-8 text-gray-400" />
                      <span className="text-sm text-gray-600">
                        {imagePreview ? "Change Image" : "Upload Image"}
                      </span>
                      <span className="text-xs text-gray-400">
                        PNG, JPG, GIF up to 10MB
                      </span>
                    </div>
                  </label>
                </div>
              </div>
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

      {/* Description Field */}
          <FormField
            control={form.control}
            name="videoDescription"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-base font-medium">
                  Description
                </FormLabel>
                <FormControl>
                  <Textarea
                    placeholder="Provide a brief description of your content"
                    rows={4}
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Highlights Field */}
          <FormItem>
            <FormLabel className="text-base font-medium">
              Key Highlights
            </FormLabel>
            <div className="space-y-2">
              {highlights.map((highlight, index) => (
                <div key={index} className="flex gap-2">
                  <Input
                    placeholder={`Highlight ${index + 1}`}
                    value={highlight}
                    onChange={(e) => updateHighlight(index, e.target.value)}
                    className="flex-1"
                  />
                  {highlights.length > 1 && (
                    <Button
                      type="button"
                      variant="outline"
                      size="icon"
                      onClick={() => removeHighlight(index)}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  )}
                </div>
              ))}
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={addHighlight}
                className="w-full"
              >
                <Plus className="h-4 w-4 mr-2" />
                Add Highlight
              </Button>
            </div>
          </FormItem>

          {/* Target Audience Field */}
          <FormField
            control={form.control}
            name="targetAudience"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-base font-medium">
                  Target Audience
                </FormLabel>
                <FormControl>
                  <Textarea
                    placeholder="Describe your target audience for this content"
                    rows={3}
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </form>
      </Form>
      )}
    </FormSheet>
  );
}


