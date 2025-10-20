"use client";

import React, { useState, useEffect } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import TemplateSelector from "@/components/thumbnail/TemplateSelector";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { X, Upload, Loader2, Sparkles, Check, LayoutTemplate, Youtube, Video } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { FormSheet } from "@/components/ui/form-sheet";
import { uploadToStorage } from "@/actions/upload";
import { useRouter } from "next/navigation";
import { useAuthFetch } from "@/hooks/use-auth-fetch";
import Image from "next/image";

const channelStyles = [
  {
    value: "professional & educational",
    label: "Professional & Educational",
    description:
      "Clean, informative, and authoritative style suitable for educational content",
  },
  {
    value: "entertainment & gaming",
    label: "Entertainment & Gaming",
    description:
      "Dynamic, energetic, and engaging style for entertainment content",
  },
  {
    value: "lifestyle & vlog",
    label: "Lifestyle & Vlog",
    description:
      "Personal, authentic, and relatable style for lifestyle content",
  },
  {
    value: "tech & reviews",
    label: "Tech & Reviews",
    description: "Modern, sleek, and technical style for technology content",
  },
];

const thumbnailGoals = [
  {
    value: "clickbait & curiosity",
    label: "Clickbait & Curiosity",
    description: "Create intrigue and curiosity to drive clicks",
  },
  {
    value: "content preview",
    label: "Content Preview",
    description: "Show a preview of the video content",
  },
  {
    value: "branding recognition",
    label: "Brand Recognition",
    description: "Focus on brand identity and recognition",
  },
  {
    value: "emotion response",
    label: "Emotional Response",
    description: "Evoke specific emotions from viewers",
  },
];

interface ThumbnailAsset {
  file: File;
  type: string;
  url?: string;
}

interface ThumbnailCreationSheetProps {
  isOpen: boolean;
  onClose: () => void;
  selectedTemplates: any[];
  selectedProject: any;
  onProjectChange?: (project: any) => void; // New callback to change project
  availableProjects?: any[]; // Pass projects from parent
  youtubeLinks?: string[];
  maxSelections?: number; // Make configurable
}

export default function ThumbnailCreationSheet({
  isOpen,
  onClose,
  selectedTemplates: preSelectedTemplates,
  selectedProject,
  onProjectChange,
  availableProjects = [],
  youtubeLinks = [],
  maxSelections = 5, // Default to match CreateYoutubeThumbnail page
}: ThumbnailCreationSheetProps) {
  const router = useRouter();
  const { authFetch } = useAuthFetch();
  const [allSelectedTemplates, setAllSelectedTemplates] = useState<string[]>([]);
  const [inspirationUrl, setInspirationUrl] = useState("");
  const [inspirationPreview, setInspirationPreview] = useState<string | null>(null);
  const [allYoutubeLinks, setAllYoutubeLinks] = useState<string[]>([]);
  const [channelStyle, setChannelStyle] = useState<string>("");
  const [thumbnailGoal, setThumbnailGoal] = useState<string>("");
  const [additionalInstructions, setAdditionalInstructions] = useState("");
  const [videoVariations, setVideoVariations] = useState(1);
  const [templateVariations, setTemplateVariations] = useState(1);
  const [thumbnailAssets, setThumbnailAssets] = useState<ThumbnailAsset[]>([]);
  const [isGenerating, setIsGenerating] = useState(false);
  const [hasSubmitted, setHasSubmitted] = useState(false);
  const [activeTab, setActiveTab] = useState<string>("youtube");
  const [showProjectSelector, setShowProjectSelector] = useState(false);

  // Use projects passed from parent
  const projects = availableProjects;

  // Log projects when sheet opens (for debugging)
  useEffect(() => {
    if (isOpen) {
      console.log("🚪 Sheet opened. Available projects:", projects.length);
    }
  }, [isOpen, projects.length]);

  // Initialize with pre-selected templates or youtube links when sheet opens
  useEffect(() => {
    if (isOpen && preSelectedTemplates && preSelectedTemplates.length > 0) {
      const preSelectedIds = preSelectedTemplates.map(t => t.id);
      setAllSelectedTemplates(preSelectedIds);
      // Set templates tab as active when there are pre-selected templates
      setActiveTab("templates");
    } else if (isOpen && youtubeLinks && youtubeLinks.length > 0) {
      // Store all YouTube links
      setAllYoutubeLinks(youtubeLinks);
      // If YouTube links are provided, set the first one as inspiration URL
      const firstLink = youtubeLinks[0];
      setInspirationUrl(firstLink);
      // Extract video ID and set preview
      const videoId = firstLink.match(
        /(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/\s]{11})/
      )?.[1];
      if (videoId) {
        setInspirationPreview(`https://img.youtube.com/vi/${videoId}/maxresdefault.jpg`);
      }
      // Set youtube tab as active
      setActiveTab("youtube");
    } else if (!isOpen) {
      setAllSelectedTemplates([]);
      setInspirationUrl("");
      setInspirationPreview(null);
      setAllYoutubeLinks([]);
      setActiveTab("youtube"); // Reset to default when sheet closes
    }
  }, [isOpen, preSelectedTemplates, youtubeLinks]);

  const handleInspirationUrlChange = (url: string) => {
    setInspirationUrl(url);
    const videoId = url.match(
      /(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/\s]{11})/
    )?.[1];
    if (videoId) {
      setInspirationPreview(
        `https://img.youtube.com/vi/${videoId}/maxresdefault.jpg`
      );
    } else {
      setInspirationPreview(null);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const newFiles = Array.from(e.target.files);
      const remainingSlots = 4 - thumbnailAssets.length;
      if (remainingSlots > 0) {
        setThumbnailAssets((prev) => [
          ...prev,
          ...newFiles.slice(0, remainingSlots).map((file) => ({
            file,
            type: file.type.split("/")[1],
          })),
        ]);
      }
    }
  };

  const handleRemoveFile = (index: number) => {
    setThumbnailAssets((prev) => prev.filter((_, i) => i !== index));
  };

  const handleGenerate = async () => {
    // Prevent multiple submissions
    if (isGenerating || hasSubmitted) {
      console.log("⚠️ Generation already in progress, ignoring duplicate request");
      return;
    }

    try {
      setIsGenerating(true);
      setHasSubmitted(true);

      // Validation
      if (!selectedProject) {
        alert("Please select a project");
        setIsGenerating(false);
        setHasSubmitted(false);
        return;
      }

      // Check if we have at least one template or YouTube link
      const hasTemplates = allSelectedTemplates && allSelectedTemplates.length > 0;
      const hasYoutubeLinks = allYoutubeLinks && allYoutubeLinks.length > 0;
      const hasInspirationUrl = inspirationUrl && inspirationUrl.trim().length > 0;
      
      if (!hasTemplates && !hasYoutubeLinks && !hasInspirationUrl) {
        alert("Please select at least one template or provide a YouTube link");
        setIsGenerating(false);
        setHasSubmitted(false);
        return;
      }

      // Edge case: Check if we exceed maximum selections
      if (hasTemplates && allSelectedTemplates.length > maxSelections) {
        alert(`You can only select up to ${maxSelections} templates`);
        setIsGenerating(false);
        setHasSubmitted(false);
        return;
      }

      if (!channelStyle) {
        alert("Please select a channel style");
        setIsGenerating(false);
        setHasSubmitted(false);
        return;
      }

      if (!thumbnailGoal) {
        alert("Please select a thumbnail goal");
        setIsGenerating(false);
        setHasSubmitted(false);
        return;
      }

      // Upload all media files first
      const uploadPromises = thumbnailAssets.map(async (asset) => {
        const formData = new FormData();
        formData.append("file", asset.file);

        const uploadResult = await uploadToStorage(formData);

        if (!uploadResult.success) {
          throw new Error(
            `Failed to upload ${asset.file.name}: ${uploadResult.error}`
          );
        }

        return {
          ...asset,
          url: uploadResult.fileUrl,
        };
      });

      const uploadedAssets = await Promise.all(uploadPromises);

      // Prepare request body based on generation method
      let requestBody: any = {
        projectId: selectedProject.id,
        mediaFiles: uploadedAssets.map((asset) => asset.url),
        channelStyle,
        thumbnailGoal,
        additionalInstructions,
        variations: templateVariations,
      };

      // Handle different generation methods
      if (hasTemplates) {
        // Template-based generation
        requestBody.templates = allSelectedTemplates;
      } else if (hasYoutubeLinks || hasInspirationUrl) {
        // YouTube-based generation - create a special "youtube" template
        // For now, we'll use a placeholder template ID that the backend can recognize
        requestBody.templates = ["youtube-inspiration"];
        requestBody.youtubeLinks = allYoutubeLinks.length > 0 ? allYoutubeLinks : [inspirationUrl];
        requestBody.inspirationUrl = inspirationUrl;
      }

      console.log("📤 Sending thumbnail generation request:", requestBody);

      // Add a unique request ID to track this request
      const requestId = Date.now();
      console.log(`🔑 Request ID: ${requestId}`);

      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 30000); // 30 second timeout

      const response = await authFetch("/api/thumbnails/create", {
        method: "POST",
        body: JSON.stringify(requestBody),
        signal: controller.signal,
      }).catch((error) => {
        if (error.name === 'AbortError') {
          throw new Error("Request timeout. Please try again.");
        }
        throw error;
      }).finally(() => {
        clearTimeout(timeoutId);
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        console.error("❌ API Error:", errorData);
        
        // Handle rate limiting
        if (response.status === 429) {
          const retryAfter = errorData.retryAfter || 10;
          throw new Error(`Please wait ${retryAfter} seconds before creating another thumbnail.`);
        }
        
        throw new Error(errorData.error || errorData.message || "Failed to generate thumbnail");
      }

      const data = await response.json();
      console.log("✅ Thumbnail generation response:", data);

      if (!data.id) {
        throw new Error("Invalid response from server");
      }

      console.log(`✅ Request ${requestId} completed successfully, redirecting...`);
      
      // Close the sheet and navigate
      onClose();
      router.push(`/dashboard/generated-thumbnails/${data.id}`);
    } catch (error) {
      console.error("Error generating thumbnail:", error);
      alert(error instanceof Error ? error.message : "Failed to generate thumbnail. Please try again.");
      
      // Reset flags on error so user can try again
      setHasSubmitted(false);
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <FormSheet
      open={isOpen}
      onOpenChange={(open) => !open && onClose()}
      title="Configure Thumbnail"
      description={`Creating thumbnail for "${selectedProject?.title}"`}
      hideFooter={true}
      size="lg"
    >
      <div className="space-y-6">
        {/* Generation Method Indicator */}
        <div className="flex items-center justify-between p-4 bg-muted/50 rounded-lg border">
          <div className="flex items-center gap-3">
            <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
              preSelectedTemplates.length > 0 ? 'bg-primary/10' : 'bg-red-500/10'
            }`}>
              {preSelectedTemplates.length > 0 ? (
                <LayoutTemplate className="h-5 w-5 text-primary" />
              ) : (
                <Youtube className="h-5 w-5 text-red-500" />
              )}
            </div>
            <div>
              <p className="text-sm font-medium">Generation Method</p>
            <p className="text-xs text-muted-foreground">
              {preSelectedTemplates.length > 0
                ? `Using ${preSelectedTemplates.length} template${preSelectedTemplates.length > 1 ? 's' : ''}`
                : allYoutubeLinks.length > 0 
                  ? `Using ${allYoutubeLinks.length} YouTube link${allYoutubeLinks.length > 1 ? 's' : ''}`
                  : 'No method selected'
              }
              </p>
            </div>
          </div>
          <Badge variant={preSelectedTemplates.length > 0 ? "default" : "secondary"}>
            {preSelectedTemplates.length > 0 ? "Template Mode" : "YouTube Mode"}
          </Badge>
        </div>

        {/* Selected Project Information */}
        {selectedProject && (
          <div className="space-y-2">
            <div className="flex items-center justify-between p-4 bg-blue-50 dark:bg-blue-950/20 rounded-lg border border-blue-200 dark:border-blue-800">
              <div className="flex items-center gap-3">
                {/* Project Image */}
                <div className="relative w-12 h-8 flex-shrink-0 overflow-hidden rounded-md bg-gradient-to-br from-blue-100 to-purple-100 dark:from-blue-900/30 dark:to-purple-900/30">
                  {selectedProject.image ? (
                    <Image 
                      src={selectedProject.image} 
                      alt={selectedProject.title}
                      fill
                      className="object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <Video className="h-3 w-3 text-blue-600 dark:text-blue-400 opacity-50" />
                    </div>
                  )}
                </div>
                <div>
                  <p className="text-sm font-medium">Selected Project</p>
                  <p className="text-xs text-muted-foreground">
                    {selectedProject.title}
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">
                    Target: {selectedProject.targetAudience}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <div className="text-right">
                  <p className="text-xs text-muted-foreground">
                    {selectedProject.highlights?.length || 0} highlights
                  </p>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setShowProjectSelector(!showProjectSelector)}
                  className="h-8"
                >
                  Change
                </Button>
              </div>
            </div>

            {/* Project Selector Dropdown */}
            {showProjectSelector && (
              <div className="border rounded-lg p-3 bg-background max-h-[300px] overflow-y-auto">
                <div className="flex items-center justify-between mb-2">
                  <p className="text-sm font-medium">Choose a different project:</p>
                  <Badge variant="secondary" className="text-xs">
                    {projects.length} available
                  </Badge>
                </div>
                {projects.length > 0 ? (
                  <div className="space-y-2">
                    {projects.map((project) => (
                      <div
                        key={project.id}
                        className={`cursor-pointer p-3 rounded-lg border transition-all hover:shadow-md ${
                          selectedProject?.id === project.id
                            ? 'border-primary bg-primary/5'
                            : 'border-border hover:border-primary/50'
                        }`}
                        onClick={() => {
                          if (onProjectChange) {
                            onProjectChange(project);
                          }
                          setShowProjectSelector(false);
                        }}
                      >
                        <div className="flex items-center gap-3">
                          <div className="relative w-10 h-7 flex-shrink-0 overflow-hidden rounded-md bg-gradient-to-br from-blue-100 to-purple-100 dark:from-blue-900/30 dark:to-purple-900/30">
                            {project.image ? (
                              <Image 
                                src={project.image} 
                                alt={project.title}
                                fill
                                className="object-cover"
                              />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center">
                                <Video className="h-3 w-3 text-blue-600 dark:text-blue-400 opacity-50" />
                              </div>
                            )}
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium truncate">{project.title}</p>
                            <p className="text-xs text-muted-foreground truncate">
                              {project.targetAudience}
                            </p>
                          </div>
                          {selectedProject?.id === project.id && (
                            <Check className="h-4 w-4 text-primary flex-shrink-0" />
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-4">
                    <p className="text-sm text-muted-foreground">
                      No projects available
                    </p>
                    <p className="text-xs text-muted-foreground mt-1">
                      Create a project first to get started
                    </p>
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        {/* Thumbnail Assets */}
        <Card>
          <CardHeader>
            <CardTitle>Thumbnail Assets</CardTitle>
            <CardDescription>
              Upload images to use in your thumbnail
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="border-2 border-dashed rounded-lg p-6">
              <div className="flex flex-col items-center">
                <Upload className="h-12 w-12 text-muted-foreground mb-2" />
                <p className="text-muted-foreground">
                  Click to upload thumbnail assets
                </p>
                <p className="text-xs text-muted-foreground mt-1">
                  JPG, PNG, SVG formats accepted (max 4 files)
                </p>
                <Input
                  type="file"
                  className="hidden"
                  multiple
                  accept="image/jpeg,image/png,image/svg+xml"
                  onChange={handleFileChange}
                  id="thumbnail-assets"
                  disabled={thumbnailAssets.length >= 4}
                />
                <Button
                  variant="outline"
                  className="mt-4"
                  onClick={() =>
                    document.getElementById("thumbnail-assets")?.click()
                  }
                  disabled={thumbnailAssets.length >= 4}
                >
                  {thumbnailAssets.length >= 4
                    ? "Maximum files reached"
                    : "Upload Files"}
                </Button>
              </div>
              {thumbnailAssets.length > 0 && (
                <div>
                  <p className="text-muted-foreground">
                    {thumbnailAssets.length} files selected
                  </p>
                  <div className="mt-4 grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                    {thumbnailAssets.map((asset, index) => (
                      <div
                        key={index}
                        className="relative aspect-video rounded-lg overflow-hidden border group"
                      >
                        <div className="relative aspect-video">
                          <img
                            src={URL.createObjectURL(asset.file)}
                            alt={asset.file.name}
                            className="w-full h-full object-cover"
                          />
                          <button
                            onClick={() => handleRemoveFile(index)}
                            className="absolute top-2 right-2 p-1 bg-black/50 rounded-full hover:bg-black/70 transition-colors"
                          >
                            <X className="h-4 w-4 text-white" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Channel Style */}
        <Card>
          <CardHeader>
            <CardTitle>Channel Style</CardTitle>
            <CardDescription>
              Select the style that best matches your channel
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Select value={channelStyle} onValueChange={setChannelStyle}>
              <SelectTrigger className="w-full text-left py-6">
                <SelectValue placeholder="Select channel style" />
              </SelectTrigger>
              <SelectContent>
                {channelStyles.map((style) => (
                  <SelectItem key={style.value} value={style.value}>
                    <div>
                      <div className="font-medium">{style.label}</div>
                      <div className="text-sm text-muted-foreground">
                        {style.description}
                      </div>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </CardContent>
        </Card>

        {/* Primary Thumbnail Goal */}
        <Card>
          <CardHeader>
            <CardTitle>Primary Thumbnail Goal</CardTitle>
            <CardDescription>
              What do you want to achieve with this thumbnail?
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Select value={thumbnailGoal} onValueChange={setThumbnailGoal}>
              <SelectTrigger className="w-full text-left py-6">
                <SelectValue placeholder="Select thumbnail goal" />
              </SelectTrigger>
              <SelectContent>
                {thumbnailGoals.map((goal) => (
                  <SelectItem key={goal.value} value={goal.value}>
                    <div>
                      <div className="font-medium">{goal.label}</div>
                      <div className="text-sm text-muted-foreground">
                        {goal.description}
                      </div>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </CardContent>
        </Card>

        {/* Generation Method Tabs */}
        <Card>
          <CardHeader>
            <CardTitle>Generation Method</CardTitle>
            <CardDescription>
              Choose how you want to generate your thumbnail
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="youtube">Use a YouTube Video</TabsTrigger>
                <TabsTrigger value="templates">
                  Choose from Templates
                </TabsTrigger>
              </TabsList>

              <TabsContent value="youtube" className="space-y-4">
                {/* Display all YouTube links from the page */}
                {allYoutubeLinks.length > 0 && (
                  <div className="space-y-3">
                    <h3 className="text-lg font-medium">
                      YouTube Links from Page ({allYoutubeLinks.length})
                    </h3>
                    <div className="space-y-2">
                      {allYoutubeLinks.map((link, index) => {
                        const videoId = link.match(
                          /(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/\s]{11})/
                        )?.[1];
                        return (
                          <div key={index} className="flex items-center gap-3 p-3 bg-muted rounded-lg">
                            <div className="flex-shrink-0">
                              {videoId ? (
                                <img
                                  src={`https://img.youtube.com/vi/${videoId}/maxresdefault.jpg`}
                                  alt={`Video ${index + 1}`}
                                  className="w-16 h-12 object-cover rounded"
                                />
                              ) : (
                                <div className="w-16 h-12 bg-muted-foreground/20 rounded flex items-center justify-center">
                                  <Youtube className="h-6 w-6 text-muted-foreground" />
                                </div>
                              )}
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="text-sm font-medium truncate">
                                Video {index + 1}
                              </p>
                              <p className="text-xs text-muted-foreground truncate">
                                {link}
                              </p>
                            </div>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => {
                                setInspirationUrl(link);
                                if (videoId) {
                                  setInspirationPreview(`https://img.youtube.com/vi/${videoId}/maxresdefault.jpg`);
                                }
                              }}
                            >
                              Use as Inspiration
                            </Button>
                          </div>
                        );
                      })}
                    </div>
                    <div className="text-sm text-muted-foreground">
                      Click "Use as Inspiration" to set any of these videos as your inspiration source.
                    </div>
                  </div>
                )}

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <h3 className="text-lg font-medium mb-2">
                      {allYoutubeLinks.length > 0 ? "Additional YouTube Video URL" : "YouTube Video URL"}
                    </h3>
                    <div className="flex gap-2">
                      <Input
                        placeholder="https://youtube.com/watch?v=..."
                        value={inspirationUrl}
                        onChange={(e) =>
                          handleInspirationUrlChange(e.target.value)
                        }
                      />
                      <Button
                        type="button"
                        variant="outline"
                        size="icon"
                        className="shrink-0"
                        onClick={() => {
                          setInspirationUrl("");
                          setInspirationPreview(null);
                        }}
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                    <p className="text-sm text-muted-foreground mt-2">
                      Paste a YouTube video URL to use its thumbnail as
                      inspiration
                    </p>
                  </div>

                  {inspirationPreview && (
                    <div className="relative aspect-video rounded-lg overflow-hidden border">
                      <img
                        src={inspirationPreview}
                        alt="Inspiration thumbnail preview"
                        className="object-cover w-full h-full"
                      />
                      <div className="absolute inset-0 bg-black/40 opacity-0 hover:opacity-100 transition-opacity flex items-center justify-center">
                        <div className="text-white text-center p-4">
                          <p className="text-sm">Inspiration Thumbnail</p>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </TabsContent>

              <TabsContent value="templates" className="space-y-4">
                <div className="space-y-4">
                  {/* Selected Templates Display */}
                  {allSelectedTemplates.length > 0 && (
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <h3 className="text-lg font-medium">
                          Selected Templates ({allSelectedTemplates.length})
                        </h3>
                        <p className="text-xs text-muted-foreground">
                          Total: {allSelectedTemplates.length * templateVariations} thumbnail{allSelectedTemplates.length * templateVariations > 1 ? 's' : ''}
                        </p>
                      </div>
                      <div className="text-sm text-muted-foreground mb-2">
                        Each template will generate {templateVariations} variation{templateVariations > 1 ? 's' : ''}
                      </div>
                    </div>
                  )}
                  
                  {/* Template Selection */}
                  <div className="space-y-3">
                    <h3 className="text-lg font-medium">Select Templates</h3>
                    <p className="text-sm text-muted-foreground">
                      Choose templates to generate thumbnails. Your selections from the previous page are pre-selected.
                    </p>
                    <TemplateSelector
                      selectedTemplateIds={allSelectedTemplates}
                      onSelect={setAllSelectedTemplates}
                      maxSelections={maxSelections}
                      preSelectedTemplates={preSelectedTemplates}
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <h3 className="text-lg font-medium">
                      Variations per Template
                    </h3>
                    <div className="flex gap-2">
                      {[1, 2, 3].map((num) => (
                        <Button
                          key={num}
                          variant={
                            templateVariations === num ? "default" : "outline"
                          }
                          onClick={() => setTemplateVariations(num)}
                        >
                          {num}
                        </Button>
                      ))}
                    </div>
                  </div>
                </div>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>

        {/* Additional Instructions */}
        <Card>
          <CardHeader>
            <CardTitle>Additional Instructions</CardTitle>
            <CardDescription>
              Add any specific requirements or preferences
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Textarea
              placeholder="Enter any additional instructions or requirements for the thumbnail generation..."
              value={additionalInstructions}
              onChange={(e) => setAdditionalInstructions(e.target.value)}
              rows={4}
            />
          </CardContent>
        </Card>

        {/* Generate Button */}
        <Button
          onClick={handleGenerate}
          variant="brand"
          className="px-8 w-full text-center"
          disabled={!selectedProject || isGenerating || hasSubmitted}
          type="button"
        >
          {isGenerating ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Generating Thumbnails... (Please wait)
            </>
          ) : hasSubmitted ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Redirecting...
            </>
          ) : (
            <>
              <Sparkles className="mr-2 h-4 w-4" />
              Generate Thumbnails
            </>
          )}
        </Button>
        {(isGenerating || hasSubmitted) && (
          <p className="text-sm text-center text-muted-foreground">
            Please do not refresh or close this page
          </p>
        )}
      </div>
    </FormSheet>
  );
}
