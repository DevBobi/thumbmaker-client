"use client";

import Image from "next/image";
import { uploadToStorage } from "@/actions/upload";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { FormSheet } from "@/components/ui/form-sheet";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useAuthFetch } from "@/hooks/use-auth-fetch";
import { useToast } from "@/hooks/use-toast";
import { useQueryClient } from "@tanstack/react-query";
import { zodResolver } from "@hookform/resolvers/zod";
import { Plus, X, Sparkles, Loader2, Trash2, Image as ImageIcon } from "lucide-react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import React, { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

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
  const { authFetch } = useAuthFetch();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [isSaving, setIsSaving] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [highlights, setHighlights] = useState<string[]>([""]);
  const [currentMode, setCurrentMode] = useState<"create" | "edit" | "view">(mode);
  const [projectData, setProjectData] = useState<any>(null);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  
  // New states for creation methods
  const [creationMethod, setCreationMethod] = useState<"manual" | "ai-enhanced" | "text" | "youtube" | "document">("manual");
  const [isEnhancing, setIsEnhancing] = useState(false);
  const [isEnhanced, setIsEnhanced] = useState(false);
  const [briefDescription, setBriefDescription] = useState("");
  const [textContent, setTextContent] = useState("");
  const [youtubeLink, setYoutubeLink] = useState("");
  const [documentFile, setDocumentFile] = useState<File | null>(null);
  
  // Delete dialog state
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

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

  // Reset state when sheet closes
  useEffect(() => {
    if (!open) {
      // Reset all state when sheet closes
      setProjectData(null);
      setImageFile(null);
      setImagePreview(null);
      setHighlights([""]);
      setBriefDescription("");
      setIsEnhanced(false);
      setTextContent("");
      setYoutubeLink("");
      setDocumentFile(null);
      form.reset({
        videoTitle: "",
        videoDescription: "",
        targetAudience: "",
        image: "",
      });
    }
  }, [open, form]);

  // Load project data if in edit or view mode
  useEffect(() => {
    if ((mode === "edit" || mode === "view") && projectId && open) {
      loadProjectData();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
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

  const handleEnhanceWithAI = async () => {
    const title = form.getValues("videoTitle");
    if (!title || !briefDescription) {
      toast({
        title: "Input required",
        description: "Please provide both title and brief description.",
        variant: "destructive",
      });
      return;
    }

    setIsEnhancing(true);
    try {
      const response = await authFetch("/api/projects/enhance-brief", {
        method: "POST",
        body: JSON.stringify({ title, briefDescription }),
      });

      if (!response.ok) {
        throw new Error("Failed to enhance project");
      }

      const data = await response.json();
      form.setValue("videoDescription", data.description || "");
      form.setValue("targetAudience", data.targetAudience || "");
      if (Array.isArray(data.highlights)) {
        setHighlights(data.highlights);
      }
      setIsEnhanced(true);
      toast({
        title: "Enhanced successfully",
        description: "AI has generated detailed content. Review and edit as needed.",
      });
    } catch (error) {
      toast({
        title: "Enhancement failed",
        description: error instanceof Error ? error.message : "An unexpected error occurred",
        variant: "destructive",
      });
    } finally {
      setIsEnhancing(false);
    }
  };

  const handleAutomatedCreation = async (method: "text" | "youtube" | "document") => {
    const title = form.getValues("videoTitle");
    if (!title) {
      toast({
        title: "Title required",
        description: "Please enter a project title.",
        variant: "destructive",
      });
      return;
    }

    setIsSaving(true);
    try {
      // Upload logo if provided
      let imageUrl = null;
      if (imageFile) {
        const formData = new FormData();
        formData.append("file", imageFile);
        const uploadResult = await uploadToStorage(formData);
        if (!uploadResult.success || !uploadResult.fileUrl) {
          throw new Error(uploadResult.error || "Failed to upload image");
        }
        imageUrl = uploadResult.fileUrl;
      }

      let endpoint = "";
      const body: any = { title, image: imageUrl };

      if (method === "text") {
        if (!textContent || textContent.length < 100) {
          toast({
            title: "Content required",
            description: "Please provide at least 100 characters of content.",
            variant: "destructive",
          });
          setIsSaving(false);
          return;
        }
        endpoint = "/api/projects/create-with-text";
        body.content = textContent;
      } else if (method === "youtube") {
        if (!youtubeLink) {
          toast({
            title: "YouTube link required",
            description: "Please provide a YouTube video URL.",
            variant: "destructive",
          });
          setIsSaving(false);
          return;
        }
        endpoint = "/api/projects/create-with-youtube";
        body.youtubeLink = youtubeLink;
      } else if (method === "document") {
        if (!documentFile) {
          toast({
            title: "Document required",
            description: "Please upload a document file.",
            variant: "destructive",
          });
          setIsSaving(false);
          return;
        }
        const docFormData = new FormData();
        docFormData.append("file", documentFile);
        const docUpload = await uploadToStorage(docFormData);
        if (!docUpload.success || !docUpload.fileUrl) {
          throw new Error("Failed to upload document");
        }
        endpoint = "/api/projects/create-with-document";
        body.document = docUpload.fileUrl;
      }

      const response = await authFetch(endpoint, {
        method: "POST",
        body: JSON.stringify(body),
      });

      if (!response.ok) {
        throw new Error("Failed to create project");
      }

      await response.json();
      toast({
        title: "Project created",
        description: "Your project has been created successfully.",
      });

      // Invalidate projects query to refetch data
      await queryClient.invalidateQueries({ queryKey: ["projects"] });

      // Reset and close
      form.reset();
      setHighlights([""]);
      setImageFile(null);
      setImagePreview(null);
      onOpenChange(false);

      if (onSuccess) {
        onSuccess();
      }
    } catch (error) {
      toast({
        title: "Creation failed",
        description: error instanceof Error ? error.message : "An unexpected error occurred",
        variant: "destructive",
      });
    } finally {
      setIsSaving(false);
    }
  };

  const handleSave = async () => {
    // Handle automated creation methods
    if (currentMode === "create" && (creationMethod === "text" || creationMethod === "youtube" || creationMethod === "document")) {
      await handleAutomatedCreation(creationMethod);
      return;
    }

    // AI-enhanced needs to be enhanced first
    if (currentMode === "create" && creationMethod === "ai-enhanced" && !isEnhanced) {
      toast({
        title: "Enhancement required",
        description: "Please enhance with AI before creating the project.",
        variant: "destructive",
      });
      return;
    }

    // Handle manual and edit modes
    const isValid = await form.trigger();
    if (!isValid) return;

    const values = form.getValues();
    setIsSaving(true);

    try {
      let imageUrl = values.image;
      
      // Upload image if a new file was selected
      if (imageFile) {
        const formData = new FormData();
        formData.append('file', imageFile);
        
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

      const url = currentMode === "edit" ? `/api/projects/${projectId}` : "/api/projects/create";
      const method = currentMode === "edit" ? "PUT" : "POST";

      const response = await authFetch(url, {
        method,
        body: JSON.stringify(projectData),
      });

      if (!response.ok) {
        throw new Error(`Error: ${response.status} - ${response.statusText}`);
      }

      await response.json();

      toast({
        title: currentMode === "edit" ? "Project updated" : "Project created",
        description:
          currentMode === "edit"
            ? `${values.videoTitle} has been updated.`
            : `${values.videoTitle} has been added to your projects.`,
      });

      // Invalidate projects query to refetch data
      await queryClient.invalidateQueries({ queryKey: ["projects"] });

      // Reset form and close sheet
      form.reset();
      setHighlights([""]);
      setImageFile(null);
      setImagePreview(null);
      setBriefDescription("");
      setIsEnhanced(false);
      onOpenChange(false);

      // Call success callback
      if (onSuccess) {
        onSuccess();
      }
    } catch (error) {
      console.error("Failed to save project:", error);
      toast({
        title: `Error ${currentMode === "edit" ? "updating" : "creating"} project`,
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

  const handleDeleteClick = () => {
    setDeleteDialogOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (!projectId) return;
    
    setIsDeleting(true);
    try {
      const response = await authFetch(`/api/projects/${projectId}`, {
        method: "DELETE",
      });

      if (response.ok) {
        toast({
          title: "Project deleted",
          description: "The project has been permanently removed.",
        });
        
        // Invalidate projects query to refetch data
        await queryClient.invalidateQueries({ queryKey: ["projects"] });
        
        setDeleteDialogOpen(false);
        onOpenChange(false);
        
        // Call success callback to refresh the list
        if (onSuccess) {
          onSuccess();
        }
      } else {
        throw new Error("Failed to delete project");
      }
    } catch {
      toast({
        title: "Error",
        description: "Failed to delete the project. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsDeleting(false);
    }
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
    <>
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
                <div className="mt-2 flex justify-center bg-muted/30 rounded-lg border p-2 relative" style={{ minHeight: '256px' }}>
                  <Image 
                    src={projectData.image} 
                    alt={projectData.title || "Project image"} 
                    fill
                    className="object-contain rounded-lg"
                    sizes="(max-width: 768px) 100vw, 600px"
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
            <Button onClick={handleEdit} className="flex-1" variant={"outline"}>
              Edit Project Information
            </Button>
            <Button 
              onClick={handleDeleteClick} 
              variant="destructive"
              className="gap-2"
            >
              <Trash2 className="h-4 w-4" />
              Delete
            </Button>
          </div>
        </div>
      ) : currentMode === "create" ? (
        // Create mode with tabs
        <div className="space-y-4">
          <Tabs value={creationMethod === "ai-enhanced" || creationMethod === "text" || creationMethod === "youtube" || creationMethod === "document" ? "ai" : "manual"} onValueChange={(value: any) => {
            if (value === "manual") {
              setCreationMethod("manual");
            } else {
              setCreationMethod("ai-enhanced");
            }
          }}>
            <TabsList className="grid w-full grid-cols-2 mb-4">
              <TabsTrigger value="manual">Manual</TabsTrigger>
              <TabsTrigger value="ai">AI-Enhanced</TabsTrigger>
            </TabsList>

            <TabsContent value="manual">
              <p className="text-sm text-muted-foreground mb-4">Fill in all project details manually</p>
            </TabsContent>
            
            <TabsContent value="ai">
              <Tabs value={creationMethod === "manual" ? "ai-enhanced" : creationMethod} onValueChange={(value: any) => setCreationMethod(value)}>
                <TabsList className="grid w-full grid-cols-4 mb-4">
                  <TabsTrigger value="ai-enhanced">AI Form</TabsTrigger>
                  <TabsTrigger value="text">Text</TabsTrigger>
                  <TabsTrigger value="youtube">YouTube</TabsTrigger>
                  <TabsTrigger value="document">Document</TabsTrigger>
                </TabsList>

                <TabsContent value="ai-enhanced">
                  <p className="text-sm text-muted-foreground mb-4">Provide a brief description and let AI expand it</p>
                </TabsContent>
                <TabsContent value="text">
                  <p className="text-sm text-muted-foreground mb-4">Paste your content and AI will analyze it</p>
                </TabsContent>
                <TabsContent value="youtube">
                  <p className="text-sm text-muted-foreground mb-4">Provide a YouTube link for automatic extraction</p>
                </TabsContent>
                <TabsContent value="document">
                  <p className="text-sm text-muted-foreground mb-4">Upload a document for AI analysis</p>
                </TabsContent>
              </Tabs>
            </TabsContent>
          </Tabs>

          {/* Method-specific content */}
          {(creationMethod === "text" || creationMethod === "youtube" || creationMethod === "document") && (
            <Form {...form}>
              <FormField
                control={form.control}
                name="videoTitle"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Project Title</FormLabel>
                    <FormControl>
                      <Input placeholder="Enter project title" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </Form>
          )}
          
          {creationMethod === "ai-enhanced" && (
            <div className="space-y-4">
              <Form {...form}>
                <FormField
                  control={form.control}
                  name="videoTitle"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Project Title</FormLabel>
                      <FormControl>
                        <Input placeholder="Enter project title" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </Form>
              <div>
                <label className="text-sm font-medium">Brief Description</label>
                <Textarea
                  placeholder="Provide a brief description (20+ characters)"
                  value={briefDescription}
                  onChange={(e) => setBriefDescription(e.target.value)}
                  rows={3}
                  className="mt-2"
                  disabled={isEnhanced}
                />
              </div>
              {!isEnhanced && (
                <Button onClick={handleEnhanceWithAI} disabled={isEnhancing} className="w-full">
                  {isEnhancing ? (
                    <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Enhancing...</>
                  ) : (
                    <><Sparkles className="mr-2 h-4 w-4" /> Enhance with AI</>
                  )}
                </Button>
              )}
            </div>
          )}

          {creationMethod === "text" && (
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium">Paste Your Content</label>
                <Textarea
                  placeholder="Paste your script or content here (100+ characters)"
                  value={textContent}
                  onChange={(e) => setTextContent(e.target.value)}
                  rows={6}
                  className="mt-2"
                />
              </div>
              <div>
                <label className="text-sm font-medium">Project Image (Optional)</label>
                <div className="mt-2">
                  {imagePreview && (
                    <div className="relative mb-2 bg-muted/30 rounded-lg border p-2" style={{ minHeight: '192px' }}>
                      <Image src={imagePreview} alt="Preview" fill className="object-contain rounded-lg" sizes="(max-width: 768px) 100vw, 600px" unoptimized />
                      <button type="button" onClick={removeImage} className="absolute top-2 right-2 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-sm hover:bg-red-600 shadow-lg">×</button>
                    </div>
                  )}
                  <input type="file" accept="image/*" onChange={handleImageUpload} className="hidden" id="text-image-upload" />
                  <label htmlFor="text-image-upload" className="cursor-pointer border-2 border-dashed border-border rounded-lg p-4 text-center hover:border-primary/50 transition-colors block">
                    <div className="flex flex-col items-center gap-2">
                      <ImageIcon className="h-6 w-6 text-muted-foreground" />
                      <span className="text-sm text-muted-foreground">{imagePreview ? "Change Image" : "Upload Image"}</span>
                      <span className="text-xs text-muted-foreground/60">PNG, JPG, GIF up to 10MB</span>
                    </div>
                  </label>
                </div>
              </div>
            </div>
          )}

          {creationMethod === "youtube" && (
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium">YouTube Video URL</label>
                <Input
                  placeholder="https://youtube.com/watch?v=..."
                  value={youtubeLink}
                  onChange={(e) => setYoutubeLink(e.target.value)}
                  className="mt-2"
                />
              </div>
              <div>
                <label className="text-sm font-medium">Project Image (Optional)</label>
                <div className="mt-2">
                  {imagePreview && (
                    <div className="relative mb-2 bg-muted/30 rounded-lg border p-2" style={{ minHeight: '192px' }}>
                      <Image src={imagePreview} alt="Preview" fill className="object-contain rounded-lg" sizes="(max-width: 768px) 100vw, 600px" unoptimized />
                      <button type="button" onClick={removeImage} className="absolute top-2 right-2 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-sm hover:bg-red-600 shadow-lg">×</button>
                    </div>
                  )}
                  <input type="file" accept="image/*" onChange={handleImageUpload} className="hidden" id="youtube-image-upload" />
                  <label htmlFor="youtube-image-upload" className="cursor-pointer border-2 border-dashed border-border rounded-lg p-4 text-center hover:border-primary/50 transition-colors block">
                    <div className="flex flex-col items-center gap-2">
                      <ImageIcon className="h-6 w-6 text-muted-foreground" />
                      <span className="text-sm text-muted-foreground">{imagePreview ? "Change Image" : "Upload Image"}</span>
                      <span className="text-xs text-muted-foreground/60">PNG, JPG, GIF up to 10MB</span>
                    </div>
                  </label>
                </div>
              </div>
            </div>
          )}

          {creationMethod === "document" && (
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium">Upload Document</label>
                <Input
                  type="file"
                  accept=".pdf,.doc,.docx,.txt"
                  onChange={(e) => setDocumentFile(e.target.files?.[0] || null)}
                  className="mt-2"
                />
                {documentFile && <p className="text-sm text-muted-foreground mt-2">{documentFile.name}</p>}
              </div>
              <div>
                <label className="text-sm font-medium">Project Image (Optional)</label>
                <div className="mt-2">
                  {imagePreview && (
                    <div className="relative mb-2 bg-muted/30 rounded-lg border p-2" style={{ minHeight: '192px' }}>
                      <Image src={imagePreview} alt="Preview" fill className="object-contain rounded-lg" sizes="(max-width: 768px) 100vw, 600px" unoptimized />
                      <button type="button" onClick={removeImage} className="absolute top-2 right-2 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-sm hover:bg-red-600 shadow-lg">×</button>
                    </div>
                  )}
                  <input type="file" accept="image/*" onChange={handleImageUpload} className="hidden" id="doc-image-upload" />
                  <label htmlFor="doc-image-upload" className="cursor-pointer border-2 border-dashed border-border rounded-lg p-4 text-center hover:border-primary/50 transition-colors block">
                    <div className="flex flex-col items-center gap-2">
                      <ImageIcon className="h-6 w-6 text-muted-foreground" />
                      <span className="text-sm text-muted-foreground">{imagePreview ? "Change Image" : "Upload Image"}</span>
                      <span className="text-xs text-muted-foreground/60">PNG, JPG, GIF up to 10MB</span>
                    </div>
                  </label>
                </div>
              </div>
            </div>
          )}

          {/* Common form fields shown for all methods (or after enhancement for AI method) */}
          {(creationMethod === "manual" || isEnhanced) && (
            <Form {...form}>
              <div className="space-y-4">
                <FormField
                  control={form.control}
                  name="videoTitle"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Title</FormLabel>
                      <FormControl>
                        <Input placeholder="Project title" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="image"
                  render={() => (
                    <FormItem>
                      <FormLabel>Project Image</FormLabel>
                      <FormControl>
                        <div className="space-y-4">
                          {imagePreview && (
                            <div className="relative bg-muted/30 rounded-lg border p-2" style={{ minHeight: '192px' }}>
                              <Image src={imagePreview} alt="Preview" fill className="object-contain rounded-lg" sizes="(max-width: 768px) 100vw, 600px" unoptimized />
                              <button type="button" onClick={removeImage} className="absolute top-2 right-2 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-sm hover:bg-red-600 shadow-lg">×</button>
                            </div>
                          )}
                          <div>
                            <input type="file" accept="image/*" onChange={handleImageUpload} className="hidden" id="image-upload" />
                            <label htmlFor="image-upload" className="flex-1 cursor-pointer border-2 border-dashed border-border rounded-lg p-4 text-center hover:border-primary/50 transition-colors block">
                              <div className="flex flex-col items-center gap-2">
                                <ImageIcon className="h-6 w-6 text-muted-foreground" />
                                <span className="text-sm text-muted-foreground">{imagePreview ? "Change" : "Upload"}</span>
                              </div>
                            </label>
                          </div>
                        </div>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="videoDescription"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Description</FormLabel>
                      <FormControl>
                        <Textarea placeholder="Project description" rows={3} {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormItem>
                  <FormLabel>Key Highlights</FormLabel>
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
                          <Button type="button" variant="outline" size="icon" onClick={() => removeHighlight(index)}>
                            <X className="h-4 w-4" />
                          </Button>
                        )}
                      </div>
                    ))}
                    <Button type="button" variant="outline" size="sm" onClick={addHighlight} className="w-full">
                      <Plus className="h-4 w-4 mr-2" /> Add Highlight
                    </Button>
                  </div>
                </FormItem>

                <FormField
                  control={form.control}
                  name="targetAudience"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Target Audience</FormLabel>
                      <FormControl>
                        <Textarea placeholder="Describe your target audience" rows={2} {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </Form>
          )}
        </div>
      ) : (
        // Edit mode
        <Form {...form}>
          <form className="space-y-6">
            <FormField
              control={form.control}
              name="videoTitle"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Title</FormLabel>
                  <FormControl>
                    <Input placeholder="e.g. 'How to Master SEO in 2024'" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="image"
              render={() => (
                <FormItem>
                  <FormLabel>Project Image</FormLabel>
                  <FormControl>
                    <div className="space-y-4">
                      {imagePreview && (
                        <div className="relative bg-muted/30 rounded-lg border p-2" style={{ minHeight: '192px' }}>
                          <Image src={imagePreview} alt="Preview" fill className="object-contain rounded-lg" sizes="(max-width: 768px) 100vw, 600px" unoptimized />
                          <button type="button" onClick={removeImage} className="absolute top-2 right-2 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-sm hover:bg-red-600 shadow-lg">×</button>
                        </div>
                      )}
                      <div className="flex items-center gap-4">
                        <input type="file" accept="image/*" onChange={handleImageUpload} className="hidden" id="image-upload" />
                        <label htmlFor="image-upload" className="flex-1 cursor-pointer border-2 border-dashed border-border rounded-lg p-4 text-center hover:border-primary/50 transition-colors">
                          <div className="flex flex-col items-center gap-2">
                            <ImageIcon className="h-8 w-8 text-muted-foreground" />
                            <span className="text-sm text-muted-foreground">{imagePreview ? "Change Image" : "Upload Image"}</span>
                            <span className="text-xs text-muted-foreground/60">PNG, JPG, GIF up to 10MB</span>
                          </div>
                        </label>
                      </div>
                    </div>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="videoDescription"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Description</FormLabel>
                  <FormControl>
                    <Textarea placeholder="Provide a brief description of your content" rows={4} {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormItem>
              <FormLabel>Key Highlights</FormLabel>
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
                      <Button type="button" variant="outline" size="icon" onClick={() => removeHighlight(index)}>
                        <X className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                ))}
                <Button type="button" variant="outline" size="sm" onClick={addHighlight} className="w-full">
                  <Plus className="h-4 w-4 mr-2" /> Add Highlight
                </Button>
              </div>
            </FormItem>

            <FormField
              control={form.control}
              name="targetAudience"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Target Audience</FormLabel>
                  <FormControl>
                    <Textarea placeholder="Describe your target audience for this content" rows={3} {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </form>
        </Form>
      )}
    </FormSheet>

    <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
          <AlertDialogDescription>
            This action cannot be undone. This will permanently delete the
            project and remove it from our servers.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={isDeleting}>Cancel</AlertDialogCancel>
          <AlertDialogAction
            onClick={handleConfirmDelete}
            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            disabled={isDeleting}
          >
            {isDeleting ? "Deleting..." : "Delete"}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
    </>
  );
}


