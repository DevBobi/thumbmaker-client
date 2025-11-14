"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { Check, LayoutTemplate, Youtube, Upload, Loader2, Sparkles, Video, Info, X, Search, CheckSquare } from "lucide-react";
import { useAuthFetch } from "@/hooks/use-auth-fetch";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Project } from "@/types";
import TemplateSelector from "@/components/thumbnail/TemplateSelector";
import { uploadToStorage } from "@/actions/upload";
import { useRouter } from "next/navigation";
import { useToast } from "@/hooks/use-toast";
import Link from "next/link";

type GenerationMode = "template" | "youtube";

interface ThumbnailAsset {
  file: File;
  type: string;
  url?: string;
}

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

export default function CreateYoutubeThumbnail() {
  const router = useRouter();
  const { authFetch } = useAuthFetch();
  const { toast } = useToast();
  const [projects, setProjects] = useState<Project[]>([]);
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const [generationMode, setGenerationMode] = useState<GenerationMode>("template");
  const [allSelectedTemplates, setAllSelectedTemplates] = useState<string[]>([]);
  const [inspirationUrl, setInspirationUrl] = useState("");
  const [inspirationPreview, setInspirationPreview] = useState<string | null>(null);
  const [channelStyle, setChannelStyle] = useState<string>("");
  const [thumbnailGoal, setThumbnailGoal] = useState<string>("");
  const [additionalInstructions, setAdditionalInstructions] = useState("");
  const [templateVariations, setTemplateVariations] = useState(1);
  const [thumbnailAssets, setThumbnailAssets] = useState<ThumbnailAsset[]>([]);
  const [isGenerating, setIsGenerating] = useState(false);
  const [hasSubmitted, setHasSubmitted] = useState(false);
  const [showProjectSelector, setShowProjectSelector] = useState(false);
  const [projectSearchQuery, setProjectSearchQuery] = useState("");
  const [validationErrors, setValidationErrors] = useState<{
    channelStyle?: boolean;
    thumbnailGoal?: boolean;
  }>({});
  const MAX_SELECTIONS = 10; // Maximum templates user can select

  // Fetch projects on mount
  const fetchProjects = async () => {
    try {
      const response = await authFetch("/api/projects");
      if (response.ok) {
        const data = await response.json();
        // Handle different response structures
        const projectsArray = Array.isArray(data) ? data : (data.projects || []);
        setProjects(projectsArray);
        
        // Don't auto-select - let user choose their project
        
        // If no projects, show helpful message
        if (projectsArray.length === 0) {
          console.log("No projects found. User should create a project first.");
        }
      } else {
        console.error("Failed to fetch projects:", response.status, response.statusText);
        setProjects([]);
      }
    } catch (error) {
      console.error("Error fetching projects:", error);
      setProjects([]);
    }
  };

  // Load projects on mount
  useEffect(() => {
    fetchProjects();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Filter projects based on search query
  const filteredProjects = projects.filter((project) => {
    if (!projectSearchQuery.trim()) return true;
    
    const query = projectSearchQuery.toLowerCase();
    return (
      project.title?.toLowerCase().includes(query) ||
      project.targetAudience?.toLowerCase().includes(query) ||
      project.description?.toLowerCase().includes(query)
    );
  });

  const handleInspirationUrlChange = (url: string) => {
    // Split by newlines and process each URL
    const urls = url.split('\n');
    const duplicates: string[] = [];
    
    // Extract video IDs to detect duplicates
    const videoIds = new Set<string>();
    const processedUrls: string[] = [];
    
    urls.forEach(line => {
      const trimmedUrl = line.trim();
      if (!trimmedUrl) {
        processedUrls.push(''); // Keep empty lines for formatting
        return;
      }
      
      // Extract video ID
      const videoId = trimmedUrl.match(
        /(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/\s]{11})/
      )?.[1];
      
      if (videoId) {
        if (videoIds.has(videoId)) {
          // Duplicate detected
          duplicates.push(trimmedUrl);
        } else {
          videoIds.add(videoId);
          processedUrls.push(trimmedUrl);
        }
      } else {
        // Not a valid YouTube URL, but keep it (user might be typing)
        processedUrls.push(trimmedUrl);
      }
    });
    
    // Join back and set
    const cleanedUrl = processedUrls.join('\n');
    setInspirationUrl(cleanedUrl);
    
    // Show toast if duplicates were found
    if (duplicates.length > 0) {
      toast({
        title: "Duplicate links removed",
        description: `${duplicates.length} duplicate video link${duplicates.length > 1 ? 's were' : ' was'} automatically removed.`,
        variant: "default",
      });
    }
    
    // Set preview if we have at least one valid video
    if (videoIds.size > 0) {
      const firstVideoId = Array.from(videoIds)[0];
      setInspirationPreview(
        `https://img.youtube.com/vi/${firstVideoId}/maxresdefault.jpg`
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

  // Check if we have valid YouTube links
  const hasValidYoutubeLinks = React.useMemo(() => {
    if (!inspirationUrl.trim()) return false;
    
    const urls = inspirationUrl.split('\n').filter(url => url.trim());
    return urls.some(url => {
      const videoId = url.match(
        /(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/\s]{11})/
      )?.[1];
      return !!videoId;
    });
  }, [inspirationUrl]);

  // Check if button should be enabled
  const hasInputSource = allSelectedTemplates.length > 0 || hasValidYoutubeLinks;

  const handleGenerate = async () => {
    if (isGenerating || hasSubmitted) {
      return;
    }

    try {
      setIsGenerating(true);
      setHasSubmitted(true);

      if (!selectedProject) {
        toast({
          title: "Project required",
          description: "Please select a project before generating thumbnails.",
          variant: "destructive",
        });
        setIsGenerating(false);
        setHasSubmitted(false);
        return;
      }

      const hasTemplates = allSelectedTemplates && allSelectedTemplates.length > 0;
      const hasInspirationUrl = inspirationUrl && inspirationUrl.trim().length > 0;
      
      if (!hasTemplates && !hasInspirationUrl) {
        const errorMessage = generationMode === "template" 
          ? "Please select at least one template to generate thumbnails."
          : "Please provide at least one YouTube link for inspiration.";
        
        toast({
          title: generationMode === "template" ? "Template required" : "YouTube link required",
          description: errorMessage,
          variant: "destructive",
        });
        setIsGenerating(false);
        setHasSubmitted(false);
        return;
      }

      if (hasTemplates && allSelectedTemplates.length > MAX_SELECTIONS) {
        toast({
          title: "Too many templates",
          description: `You can only select up to ${MAX_SELECTIONS} templates at a time.`,
          variant: "destructive",
        });
        setIsGenerating(false);
        setHasSubmitted(false);
        return;
      }

      if (!channelStyle) {
        setValidationErrors({ channelStyle: true });
        toast({
          title: "Channel style required",
          description: "Please select a channel style to continue.",
          variant: "destructive",
        });
        setIsGenerating(false);
        setHasSubmitted(false);
        document.getElementById("channel-style-card")?.scrollIntoView({ behavior: "smooth", block: "center" });
        return;
      }

      if (!thumbnailGoal) {
        setValidationErrors({ thumbnailGoal: true });
        toast({
          title: "Thumbnail goal required",
          description: "Please select a thumbnail goal to continue.",
          variant: "destructive",
        });
        setIsGenerating(false);
        setHasSubmitted(false);
        document.getElementById("thumbnail-goal-card")?.scrollIntoView({ behavior: "smooth", block: "center" });
        return;
      }
      
      setValidationErrors({});

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
      const allMediaFiles: string[] = [];
      
      if (selectedProject.image) {
        allMediaFiles.push(selectedProject.image);
      } else if (hasTemplates) {
        toast({
          title: "No project image",
          description: "Your project doesn't have an image. The template will be used as a base. Consider adding a project image for better results.",
          variant: "default",
        });
      }
      
      uploadedAssets.forEach((asset) => {
        if (asset.url) {
          allMediaFiles.push(asset.url);
        }
      });

      const requestBody: any = {
        projectId: selectedProject.id,
        mediaFiles: allMediaFiles,
        channelStyle,
        thumbnailGoal,
        additionalInstructions,
        variations: templateVariations,
      };

      if (hasTemplates) {
        const templateIds = allSelectedTemplates.map(id => String(id));
        requestBody.templates = templateIds;
      } else if (hasInspirationUrl) {
        requestBody.inspirationUrl = inspirationUrl;
      }

      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 30000);

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
        
        if (response.status === 429) {
          const retryAfter = errorData.retryAfter || 10;
          throw new Error(`Please wait ${retryAfter} seconds before creating another thumbnail.`);
        }
        
        const errorMessage = errorData.error || errorData.message || `Server error (${response.status})`;
        throw new Error(errorMessage);
      }

      const data = await response.json();

      if (!data.id) {
        throw new Error("Invalid response from server");
      }
      
      router.push(`/dashboard/generated-thumbnails/${data.id}`);
    } catch (error) {
      console.error("Error generating thumbnail:", error);
      
      const errorMessage = error instanceof Error ? error.message : "Failed to generate thumbnail. Please try again.";
      
      toast({
        title: "Generation failed",
        description: errorMessage,
        variant: "destructive",
      });
      
      setHasSubmitted(false);
      setIsGenerating(false);
    }
  };

  return (
    <div className="container mx-auto px-4 sm:px-6 max-w-6xl">
      {/* Breadcrumb */}
      <Breadcrumb className="mb-4">
        <BreadcrumbList>
          <BreadcrumbItem>
            <BreadcrumbLink asChild>
              <Link href="/dashboard">Dashboard</Link>
            </BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbPage>Create Thumbnail</BreadcrumbPage>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>

      {/* Page Title */}
      <div className="mb-6">
        <h1 className="text-2xl sm:text-3xl font-bold mb-2">Create YouTube Thumbnail</h1>
        <p className="text-sm sm:text-base text-muted-foreground">
          Configure and generate your thumbnail
        </p>
      </div>

      {/* Form Content */}
      <div className="space-y-6 mb-8">
        {/* Generation Method Tabs */}
        <Card>
          <CardHeader>
            <CardTitle>Generation Method</CardTitle>
            <CardDescription>
              Choose how you want to generate your thumbnail
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Tabs value={generationMode} onValueChange={(value) => setGenerationMode(value as GenerationMode)}>
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="template" className="flex items-center gap-2">
                  <LayoutTemplate className="h-4 w-4" />
                  Templates
                </TabsTrigger>
                <TabsTrigger value="youtube" className="flex items-center gap-2">
                  <Youtube className="h-4 w-4" />
                  YouTube Link
                </TabsTrigger>
              </TabsList>
              <TabsContent value="template" className="space-y-4 mt-4">
                <TemplateSelector
                  selectedTemplateIds={allSelectedTemplates}
                  onSelect={setAllSelectedTemplates}
                  maxSelections={MAX_SELECTIONS}
                  preSelectedTemplates={[]}
                />
                
                {allSelectedTemplates.length > 0 && (
                  <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg border">
                    <div className="space-y-1">
                      <p className="text-sm font-medium">
                        {allSelectedTemplates.length} template{allSelectedTemplates.length > 1 ? 's' : ''} selected
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {templateVariations} variation{templateVariations > 1 ? 's' : ''} each = {allSelectedTemplates.length * templateVariations} total thumbnail{allSelectedTemplates.length * templateVariations > 1 ? 's' : ''}
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-muted-foreground">Variations:</span>
                      {[1, 2, 3].map((num) => (
                        <Button
                          key={num}
                          variant={templateVariations === num ? "default" : "outline"}
                          size="sm"
                          onClick={() => setTemplateVariations(num)}
                          className="h-8 w-8 p-0"
                        >
                          {num}
                        </Button>
                      ))}
                    </div>
                  </div>
                )}
              </TabsContent>
              <TabsContent value="youtube" className="space-y-4 mt-4">
                <Card className="border-2 border-dashed border-primary/30 bg-gradient-to-br from-primary/5 via-background to-background">
                  <CardContent className="p-6">
                    <div className="space-y-4">
                      {/* Header */}
                      <div className="flex items-center gap-3">
                        <div className="flex-shrink-0 w-12 h-12 rounded-full bg-red-500/10 flex items-center justify-center">
                          <Youtube className="h-6 w-6 text-red-500" />
                        </div>
                        <div className="flex-1">
                          <h3 className="text-lg font-semibold">YouTube Inspiration</h3>
                          <p className="text-sm text-muted-foreground">
                            Paste single or multiple YouTube URLs (one per line)
                          </p>
                        </div>
                      </div>

                      {/* Textarea for bulk paste */}
                      <div className="space-y-2">
                        <Textarea
                          placeholder="Paste YouTube URLs here...&#10;https://youtube.com/watch?v=...&#10;https://youtu.be/...&#10;&#10;💡 Tip: Paste multiple links, one per line!"
                          value={inspirationUrl}
                          onChange={(e) => handleInspirationUrlChange(e.target.value)}
                          rows={6}
                          className="resize-none font-mono text-sm"
                        />
                        <div className="flex items-center justify-between text-xs text-muted-foreground">
                          <span className="flex items-center gap-1">
                            <Sparkles className="h-3 w-3" />
                            Each URL will generate a unique thumbnail
                          </span>
                          {inspirationUrl.trim() && (
                            <Button
                              type="button"
                              variant="ghost"
                              size="sm"
                              onClick={() => {
                                setInspirationUrl("");
                                setInspirationPreview(null);
                              }}
                              className="h-7 px-2"
                            >
                              <X className="h-3 w-3 mr-1" />
                              Clear All
                            </Button>
                          )}
                        </div>
                      </div>

                      {/* Preview Grid */}
                      {inspirationPreview && (
                        <div className="border-t pt-4">
                          <div className="flex items-center gap-2 mb-3">
                            <CheckSquare className="h-4 w-4 text-green-500" />
                            <span className="text-sm font-medium">Preview</span>
                          </div>
                          <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                            {inspirationUrl.split('\n').filter(url => url.trim()).map((url, index) => {
                              const videoId = url.match(
                                /(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/\s]{11})/
                              )?.[1];
                              
                              if (!videoId) return null;
                              
                              return (
                                <div key={index} className="relative group">
                                  <div className="relative aspect-video rounded-lg overflow-hidden border-2 border-primary/20">
                                    <Image
                                      src={`https://img.youtube.com/vi/${videoId}/maxresdefault.jpg`}
                                      alt={`Video ${index + 1}`}
                                      fill
                                      className="object-cover"
                                      sizes="(max-width: 768px) 50vw, 33vw"
                                    />
                                    <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                      <Youtube className="h-8 w-8 text-white" />
                                    </div>
                                    <div className="absolute top-2 right-2">
                                      <Badge variant="secondary" className="text-xs">
                                        #{index + 1}
                                      </Badge>
                                    </div>
                                  </div>
                                </div>
                              );
                            })}
                          </div>
                          <div className="mt-3 p-3 bg-blue-50 dark:bg-blue-950/20 rounded-lg border border-blue-200 dark:border-blue-800">
                            <p className="text-sm text-blue-900 dark:text-blue-100 flex items-start gap-2">
                              <Info className="h-4 w-4 mt-0.5 flex-shrink-0" />
                              <span>
                                {inspirationUrl.split('\n').filter(url => url.trim()).length} video{inspirationUrl.split('\n').filter(url => url.trim()).length > 1 ? 's' : ''} detected. Each will generate a unique thumbnail inspired by its style.
                              </span>
                            </p>
                          </div>
                        </div>
                      )}

                      {/* Helper Text */}
                      {!inspirationUrl.trim() && (
                        <div className="flex items-start gap-3 p-4 bg-muted/50 rounded-lg border border-dashed">
                          <Sparkles className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" />
                          <div className="space-y-1 text-sm">
                            <p className="font-medium">Quick Start:</p>
                            <ul className="list-disc list-inside space-y-1 text-muted-foreground">
                              <li>Paste one YouTube URL for single inspiration</li>
                              <li>Paste multiple URLs (one per line) for bulk generation</li>
                              <li>Mix and match different video styles</li>
                            </ul>
                          </div>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>

        {/* Project Selection */}
        <Card>
          <CardHeader>
            <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
              <div className="flex-1">
                <CardTitle className="flex items-center gap-2 mb-1.5">
                  <Video className="h-5 w-5" />
                  Select Project
                  {!selectedProject && (
                    <Badge variant="destructive" className="text-xs">Required</Badge>
                  )}
                </CardTitle>
                <CardDescription>
                  Choose which project to create thumbnails for
                </CardDescription>
              </div>
              
              {/* Search Input - Top Right */}
              <div className="relative w-full sm:w-64">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search projects..."
                  value={projectSearchQuery}
                  onChange={(e) => {
                    setProjectSearchQuery(e.target.value);
                    // Auto-open dropdown when typing
                    if (!showProjectSelector && e.target.value.trim()) {
                      setShowProjectSelector(true);
                    }
                  }}
                  onFocus={() => {
                    // Open dropdown on focus if there's text or no project selected
                    if (projectSearchQuery.trim() || !selectedProject) {
                      setShowProjectSelector(true);
                    }
                  }}
                  className="pl-9 h-9"
                />
              </div>
            </div>
          </CardHeader>
          <CardContent>
            {selectedProject ? (
              <div className="space-y-2">
                <div className="flex items-center justify-between p-4 bg-blue-50 dark:bg-blue-950/20 rounded-lg border border-blue-200 dark:border-blue-800">
                  <div className="flex items-center gap-4">
                    <div className="relative w-28 h-20 flex-shrink-0 overflow-hidden rounded-lg bg-gradient-to-br from-blue-100 to-purple-100 dark:from-blue-900/30 dark:to-purple-900/30">
                      {selectedProject.image ? (
                        <Image 
                          src={selectedProject.image} 
                          alt={selectedProject.title}
                          fill
                          className="object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <Video className="h-6 w-6 text-blue-600 dark:text-blue-400 opacity-50" />
                        </div>
                      )}
                    </div>
                    <div>
                      <p className="text-sm font-medium">{selectedProject.title}</p>
                      <p className="text-xs text-muted-foreground">
                        Target: {selectedProject.targetAudience}
                      </p>
                      {selectedProject.image && (
                        <p className="text-xs text-green-600 dark:text-green-400 mt-1 font-medium">
                          ✓ Project image available
                        </p>
                      )}
                    </div>
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

                {showProjectSelector && (
                  <div className="border rounded-lg p-3 bg-background">
                    <div className="flex items-center justify-between mb-3">
                      <p className="text-sm font-medium">Choose a different project:</p>
                      <Badge variant="secondary" className="text-xs">
                        {filteredProjects.length} of {projects.length}
                      </Badge>
                    </div>
                    
                    {filteredProjects.length > 0 ? (
                      <div className="space-y-2 max-h-[300px] overflow-y-auto">
                        {filteredProjects.map((project) => (
                          <div
                            key={project.id}
                            className={`cursor-pointer p-3 rounded-lg border transition-all hover:shadow-md ${
                              selectedProject?.id === project.id
                                ? 'border-primary bg-primary/5'
                                : 'border-border hover:border-primary/50'
                            }`}
                            onClick={() => {
                              setSelectedProject(project);
                              setShowProjectSelector(false);
                              setProjectSearchQuery(""); // Clear search after selection
                            }}
                          >
                            <div className="flex items-center gap-3">
                              <div className="relative w-20 h-14 flex-shrink-0 overflow-hidden rounded-md bg-gradient-to-br from-blue-100 to-purple-100 dark:from-blue-900/30 dark:to-purple-900/30">
                                {project.image ? (
                                  <Image 
                                    src={project.image} 
                                    alt={project.title}
                                    fill
                                    className="object-cover"
                                  />
                                ) : (
                                  <div className="w-full h-full flex items-center justify-center">
                                    <Video className="h-5 w-5 text-blue-600 dark:text-blue-400 opacity-50" />
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
                          {projectSearchQuery.trim() 
                            ? `No projects found matching "${projectSearchQuery}"`
                            : "No projects available"
                          }
                        </p>
                      </div>
                    )}
                  </div>
                )}
              </div>
            ) : (
              <div className="border rounded-lg p-3 bg-background">
                <div className="flex items-center justify-between mb-3">
                  <p className="text-sm font-medium">Select a project:</p>
                  <Badge variant="secondary" className="text-xs">
                    {filteredProjects.length} of {projects.length}
                  </Badge>
                </div>
                
                {filteredProjects.length > 0 ? (
                  <div className="space-y-2 max-h-[400px] overflow-y-auto">
                    {filteredProjects.map((project) => (
                      <div
                        key={project.id}
                        className="cursor-pointer p-3 rounded-lg border transition-all hover:shadow-md hover:border-primary/50"
                        onClick={() => {
                          setSelectedProject(project);
                          setProjectSearchQuery(""); // Clear search after selection
                        }}
                      >
                        <div className="flex items-center gap-3">
                          <div className="relative w-20 h-14 flex-shrink-0 overflow-hidden rounded-md bg-gradient-to-br from-blue-100 to-purple-100 dark:from-blue-900/30 dark:to-purple-900/30">
                            {project.image ? (
                              <Image 
                                src={project.image} 
                                alt={project.title}
                                fill
                                className="object-cover"
                              />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center">
                                <Video className="h-5 w-5 text-blue-600 dark:text-blue-400 opacity-50" />
                              </div>
                            )}
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium truncate">{project.title}</p>
                            <p className="text-xs text-muted-foreground truncate">
                              {project.targetAudience}
                            </p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <Video className="h-12 w-12 mx-auto text-muted-foreground mb-3 opacity-50" />
                    <p className="text-sm text-muted-foreground mb-1">
                      {projectSearchQuery.trim() 
                        ? `No projects found matching "${projectSearchQuery}"`
                        : "No projects available"
                      }
                    </p>
                    {!projectSearchQuery.trim() && (
                      <p className="text-xs text-muted-foreground">
                        Create a project first to get started
                      </p>
                    )}
                  </div>
                )}
              </div>
            )}
            </CardContent>
          </Card>

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
                  Click to upload additional assets (optional)
                </p>
                <p className="text-xs text-muted-foreground mt-1">
                  JPG, PNG, SVG formats accepted (max 4 files)
                </p>
                {selectedProject?.image && (
                  <p className="text-xs text-green-600 dark:text-green-400 mt-2">
                    ℹ️ Project image will be used automatically
                  </p>
                )}
              </div>
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
                className="mt-4 w-full"
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
              <div className="mt-4">
                <p className="text-sm text-muted-foreground mb-3">
                  {thumbnailAssets.length} files selected
                </p>
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                  {thumbnailAssets.map((asset, index) => (
                    <div
                      key={index}
                      className="relative aspect-video rounded-lg overflow-hidden border group"
                    >
                      <div className="relative aspect-video">
                        <Image
                          src={URL.createObjectURL(asset.file)}
                          alt={asset.file.name}
                          fill
                          className="object-cover"
                          unoptimized
                          sizes="(max-width: 768px) 100vw, 300px"
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
          </CardContent>
        </Card>

        {/* Channel Style */}
        <Card id="channel-style-card" className={validationErrors.channelStyle ? "ring-2 ring-destructive" : ""}>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              Channel Style
              {validationErrors.channelStyle && (
                <Badge variant="destructive" className="text-xs">Required</Badge>
              )}
              <Tooltip>
                <TooltipTrigger asChild>
                  <button className="inline-flex items-center justify-center">
                    <Info className="h-4 w-4 text-muted-foreground hover:text-foreground transition-colors" />
                  </button>
                </TooltipTrigger>
                <TooltipContent side="right" className="max-w-xs">
                  <p>
                    Choose the visual style that aligns with your channel's branding and content type. 
                    This helps tailor the thumbnail design to match your audience's expectations.
                  </p>
                </TooltipContent>
              </Tooltip>
            </CardTitle>
            <CardDescription>
              Select the style that best matches your channel
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-2">
              {channelStyles.map((style) => (
                <Tooltip key={style.value}>
                  <TooltipTrigger asChild>
                    <Badge
                      variant={channelStyle === style.value ? "default" : "outline"}
                      className={`cursor-pointer px-4 py-2 text-sm font-medium transition-all hover:scale-105 ${
                        channelStyle === style.value
                          ? 'shadow-sm'
                          : validationErrors.channelStyle
                          ? 'border-destructive text-destructive hover:bg-destructive/10'
                          : 'hover:bg-primary/10 hover:text-primary hover:border-primary'
                      }`}
                      onClick={() => {
                        setChannelStyle(style.value);
                        setValidationErrors(prev => ({ ...prev, channelStyle: false }));
                      }}
                    >
                      {style.label}
                      {channelStyle === style.value && (
                        <Check className="ml-1.5 h-3.5 w-3.5" />
                      )}
                    </Badge>
                  </TooltipTrigger>
                  <TooltipContent side="top" className="max-w-xs">
                    <p className="font-medium mb-1">{style.label}</p>
                    <p className="text-sm">{style.description}</p>
                  </TooltipContent>
                </Tooltip>
              ))}
              </div>
            </CardContent>
          </Card>

        {/* Primary Thumbnail Goal */}
        <Card id="thumbnail-goal-card" className={validationErrors.thumbnailGoal ? "ring-2 ring-destructive" : ""}>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              Primary Thumbnail Goal
              {validationErrors.thumbnailGoal && (
                <Badge variant="destructive" className="text-xs">Required</Badge>
              )}
              <Tooltip>
                <TooltipTrigger asChild>
                  <button className="inline-flex items-center justify-center">
                    <Info className="h-4 w-4 text-muted-foreground hover:text-foreground transition-colors" />
                  </button>
                </TooltipTrigger>
                <TooltipContent side="right" className="max-w-xs">
                  <p>
                    Define the primary objective for your thumbnail. This influences the visual hierarchy, 
                    emotional tone, and design elements to maximize your desired outcome.
                  </p>
                </TooltipContent>
              </Tooltip>
            </CardTitle>
            <CardDescription>
              What do you want to achieve with this thumbnail?
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-2">
              {thumbnailGoals.map((goal) => (
                <Tooltip key={goal.value}>
                  <TooltipTrigger asChild>
                    <Badge
                      variant={thumbnailGoal === goal.value ? "default" : "outline"}
                      className={`cursor-pointer px-4 py-2 text-sm font-medium transition-all hover:scale-105 ${
                        thumbnailGoal === goal.value
                          ? 'shadow-sm'
                          : validationErrors.thumbnailGoal
                          ? 'border-destructive text-destructive hover:bg-destructive/10'
                          : 'hover:bg-primary/10 hover:text-primary hover:border-primary'
                      }`}
                      onClick={() => {
                        setThumbnailGoal(goal.value);
                        setValidationErrors(prev => ({ ...prev, thumbnailGoal: false }));
                      }}
                    >
                      {goal.label}
                      {thumbnailGoal === goal.value && (
                        <Check className="ml-1.5 h-3.5 w-3.5" />
                      )}
                    </Badge>
                  </TooltipTrigger>
                  <TooltipContent side="top" className="max-w-xs">
                    <p className="font-medium mb-1">{goal.label}</p>
                    <p className="text-sm">{goal.description}</p>
                  </TooltipContent>
                </Tooltip>
              ))}
        </div>
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
        <div className="relative group">
          {/* Animated gradient background */}
          <div className="absolute -inset-0.5 bg-gradient-to-r from-primary/50 via-purple-500/50 to-primary/50 rounded-lg blur-sm opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
          
          <Button
            onClick={handleGenerate}
            variant="brand"
            size="lg"
            className="relative w-full overflow-hidden transition-all duration-500 hover:shadow-2xl hover:shadow-primary/20 py-6 text-lg font-semibold tracking-wide disabled:opacity-50 disabled:cursor-not-allowed"
            disabled={!selectedProject || !hasInputSource || isGenerating || hasSubmitted}
            type="button"
          >
            {/* Shimmer effect */}
            <div className="absolute inset-0 -translate-x-full group-hover:translate-x-full transition-transform duration-700 ease-in-out bg-gradient-to-r from-transparent via-white/20 to-transparent" />
            
            {/* Button content */}
            <span className="relative">
              {isGenerating ? (
                <span className="flex items-center justify-center gap-3">
                  <Loader2 className="h-5 w-5 animate-spin" />
                  <span>Generating your thumbnails</span>
                  <span className="inline-flex gap-1">
                    <span className="h-1 w-1 bg-white rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></span>
                    <span className="h-1 w-1 bg-white rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></span>
                    <span className="h-1 w-1 bg-white rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></span>
                  </span>
                </span>
              ) : hasSubmitted ? (
                <span className="flex items-center justify-center gap-2">
                  <Check className="h-5 w-5" />
                  <span>Success! Redirecting...</span>
                </span>
              ) : (
                <span className="group-hover:tracking-wider transition-all duration-300">
                  Generate Thumbnails
                </span>
              )}
            </span>
          </Button>
        </div>
        
        {/* Status Messages */}
        {(isGenerating || hasSubmitted) ? (
          <div className="text-center animate-in fade-in duration-500">
            <p className="text-sm text-muted-foreground">
              Please do not refresh or close this page
            </p>
          </div>
        ) : !hasInputSource && selectedProject ? (
          <div className="text-center animate-in fade-in duration-300">
            <p className="text-sm text-amber-600 dark:text-amber-400 flex items-center justify-center gap-2">
              <Info className="h-4 w-4" />
              {generationMode === "template" 
                ? "Please select at least one template to continue"
                : "Please paste at least one YouTube link to continue"
              }
            </p>
          </div>
        ) : !selectedProject ? (
          <div className="text-center animate-in fade-in duration-300">
            <p className="text-sm text-amber-600 dark:text-amber-400 flex items-center justify-center gap-2">
              <Info className="h-4 w-4" />
              Please select a project to continue
            </p>
          </div>
        ) : null}
      </div>
    </div>
  );
}
