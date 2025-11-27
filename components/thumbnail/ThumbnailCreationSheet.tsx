"use client";

import React, { useState, useEffect, useMemo } from "react";
import Image from "next/image";
import Link from "next/link";
import TemplateSelector from "@/components/thumbnail/TemplateSelector";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { X, Upload, Loader2, Sparkles, Check, LayoutTemplate, Youtube, Video, CheckSquare, Info, AlertTriangle } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
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
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { FormSheet } from "@/components/ui/form-sheet";
import { uploadToStorage } from "@/actions/upload";
import { useRouter } from "next/navigation";
import { useAuthFetch } from "@/hooks/use-auth-fetch";
import { useToast } from "@/hooks/use-toast";
import { useQuery } from "@tanstack/react-query";

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
  onProjectChange?: (project: any) => void;
  availableProjects?: any[];
  youtubeLinks?: string[];
  maxSelections?: number;
  initialMode?: "template" | "youtube";
  mode?: "create" | "edit";
  showCreditReminder?: boolean;
  creditReminderMessage?: string;
  onGenerateComplete?: (data: any) => void;
  initialInspirationUrl?: string;
  existingAssetUrls?: string[];
  initialChannelStyle?: string;
  initialThumbnailGoal?: string;
  initialVariations?: number;
  initialInstructions?: string;
  lockedTemplateIds?: string[];
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
  initialMode = "youtube", // Default to YouTube mode
  mode = "create",
  showCreditReminder = false,
  creditReminderMessage = "Each edit or regeneration consumes credits.",
  onGenerateComplete,
  initialInspirationUrl = "",
  existingAssetUrls = [],
  initialChannelStyle = "",
  initialThumbnailGoal = "",
  initialVariations = 1,
  initialInstructions = "",
  lockedTemplateIds: lockedTemplateIdsProp,
}: ThumbnailCreationSheetProps) {
  const router = useRouter();
  const { authFetch } = useAuthFetch();
  const { toast } = useToast();
  const isEditMode = mode === "edit";
  const primaryIdleLabel = isEditMode ? "Apply Prompt Fix" : "Generate Thumbnails";
  const generatingLabel = isEditMode ? "Submitting Fix..." : "Generating Thumbnails... (Please wait)";
  const [allSelectedTemplates, setAllSelectedTemplates] = useState<string[]>([]);
  const [inspirationUrl, setInspirationUrl] = useState("");
  const [inspirationPreview, setInspirationPreview] = useState<string | null>(null);
  const [allYoutubeLinks, setAllYoutubeLinks] = useState<string[]>([]);
  const [channelStyle, setChannelStyle] = useState<string>("");
  const [thumbnailGoal, setThumbnailGoal] = useState<string>("");
  const [additionalInstructions, setAdditionalInstructions] = useState("");
  const [templateVariations, setTemplateVariations] = useState(1);
  const [thumbnailAssets, setThumbnailAssets] = useState<ThumbnailAsset[]>([]);
  const [isGenerating, setIsGenerating] = useState(false);
  const [hasSubmitted, setHasSubmitted] = useState(false);
  const [showProjectSelector, setShowProjectSelector] = useState(false);
  const [validationErrors, setValidationErrors] = useState<{
    channelStyle?: boolean;
    thumbnailGoal?: boolean;
  }>({});
  const hasExistingAssets = existingAssetUrls.length > 0;
  const lockedTemplateIds = useMemo(() => {
    if (isEditMode && lockedTemplateIdsProp && lockedTemplateIdsProp.length > 0) {
      return lockedTemplateIdsProp.map(String);
    }
    return (preSelectedTemplates || []).map((t: any) => String(t.id));
  }, [isEditMode, lockedTemplateIdsProp, preSelectedTemplates]);
  const lockedYoutubeLinks = useMemo(() => youtubeLinks || [], [youtubeLinks]);
  const channelStyleLabel = useMemo(() => {
    const match = channelStyles.find((style) => style.value === channelStyle);
    return match?.label || channelStyle || "Not specified";
  }, [channelStyle]);
  const thumbnailGoalLabel = useMemo(() => {
    const match = thumbnailGoals.find((goal) => goal.value === thumbnailGoal);
    return match?.label || thumbnailGoal || "Not specified";
  }, [thumbnailGoal]);

  const {
    data: subscription,
    isLoading: isSubscriptionLoading,
    error: subscriptionError,
  } = useQuery({
    queryKey: ["thumbnail-subscription"],
    queryFn: async () => {
      const response = await authFetch("/api/user/subscription");
      if (!response.ok) {
        throw new Error("Failed to load subscription details");
      }
      return response.json();
    },
    enabled: isOpen,
    staleTime: 30_000,
    retry: false,
  });

  useEffect(() => {
    if (subscriptionError) {
      toast({
        title: "Unable to verify credits",
        description: "We couldn't confirm your credit balance. Please refresh the page.",
        variant: "destructive",
      });
    }
  }, [subscriptionError, toast]);

  const creditsAvailable = subscription?.credits ?? 0;
  const showGenerationLocked = !isSubscriptionLoading && creditsAvailable <= 0;

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
    if (isOpen) {
      if (preSelectedTemplates && preSelectedTemplates.length > 0) {
        console.log("📋 Pre-selected templates:", preSelectedTemplates);
        // Ensure template IDs are strings
        const preSelectedIds = preSelectedTemplates.map((t) => String(t.id));
        console.log("📋 Converted template IDs:", preSelectedIds);
        setAllSelectedTemplates(preSelectedIds);
      }

      if (youtubeLinks && youtubeLinks.length > 0) {
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
          setInspirationPreview(
            `https://img.youtube.com/vi/${videoId}/maxresdefault.jpg`
          );
        }
      }

      if (initialInspirationUrl) {
        setInspirationUrl(initialInspirationUrl);
        const videoId = initialInspirationUrl.match(
          /(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/\s]{11})/
        )?.[1];
        if (videoId) {
          setInspirationPreview(
            `https://img.youtube.com/vi/${videoId}/maxresdefault.jpg`
          );
        } else {
          setInspirationPreview(null);
        }
      }
    } else {
      // Reset state when sheet closes
      setAllSelectedTemplates([]);
      setInspirationUrl("");
      setInspirationPreview(null);
      setAllYoutubeLinks([]);
    }
  }, [isOpen, preSelectedTemplates, youtubeLinks, initialMode, initialInspirationUrl, existingAssetUrls]);

  useEffect(() => {
    if (!isOpen) return;

    if (isEditMode) {
      setChannelStyle(initialChannelStyle || "");
      setThumbnailGoal(initialThumbnailGoal || "");
      setTemplateVariations(initialVariations || 1);
      setAdditionalInstructions(initialInstructions || "");
    } else {
      if (!channelStyle && initialChannelStyle) {
        setChannelStyle(initialChannelStyle);
      }
      if (!thumbnailGoal && initialThumbnailGoal) {
        setThumbnailGoal(initialThumbnailGoal);
      }
      if (!additionalInstructions && initialInstructions) {
        setAdditionalInstructions(initialInstructions);
      }
      if (!templateVariations && initialVariations) {
        setTemplateVariations(initialVariations);
      }
    }
    // We intentionally omit the state setters from deps so user edits aren’t reset.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen, isEditMode, initialChannelStyle, initialThumbnailGoal, initialVariations, initialInstructions]);

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

      if (showGenerationLocked) {
        toast({
          title: "Add credits to continue",
          description: "Start your free trial or upgrade your plan to generate new thumbnails.",
          variant: "destructive",
        });
        setIsGenerating(false);
        setHasSubmitted(false);
        return;
      }

      // Validation
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

      const effectiveTemplateIds = isEditMode ? lockedTemplateIds : allSelectedTemplates;
      const effectiveYoutubeLinks = isEditMode ? lockedYoutubeLinks : allYoutubeLinks;
      const requestInspirationUrl = isEditMode ? initialInspirationUrl : inspirationUrl;
      const effectiveVariations = isEditMode ? 1 : templateVariations;

      // Check if we have at least one template or YouTube link
      const hasTemplates = effectiveTemplateIds && effectiveTemplateIds.length > 0;
      const hasYoutubeLinks = effectiveYoutubeLinks && effectiveYoutubeLinks.length > 0;
      const hasInspirationUrl = requestInspirationUrl && requestInspirationUrl.trim().length > 0;
      
      console.log("🔍 Validation check:");
      console.log("  - Has templates:", hasTemplates, "Count:", allSelectedTemplates?.length);
      console.log("  - Has YouTube links:", hasYoutubeLinks, "Count:", allYoutubeLinks?.length);
      console.log("  - Has inspiration URL:", hasInspirationUrl, "URL:", inspirationUrl);
      console.log("  - Initial mode:", initialMode);
      
      if (!hasTemplates && !hasYoutubeLinks && !hasInspirationUrl) {
        const errorMessage = initialMode === "template" 
          ? "Please select at least one template to generate thumbnails."
          : "Please provide at least one YouTube link for inspiration.";
        
        toast({
          title: initialMode === "template" ? "Template required" : "YouTube link required",
          description: errorMessage,
          variant: "destructive",
        });
        setIsGenerating(false);
        setHasSubmitted(false);
        
        // Scroll to the generation method section
        setTimeout(() => {
          document.getElementById("generation-method-tabs")?.scrollIntoView({ behavior: "smooth", block: "center" });
        }, 100);
        return;
      }

      // Edge case: Check if we exceed maximum selections
      if (!isEditMode && hasTemplates && effectiveTemplateIds.length > maxSelections) {
        toast({
          title: "Too many templates",
          description: `You can only select up to ${maxSelections} templates at a time.`,
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
        
        // Scroll to channel style field
        setTimeout(() => {
          document.getElementById("channel-style-card")?.scrollIntoView({ behavior: "smooth", block: "center" });
        }, 100);
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
        
        // Scroll to thumbnail goal field
        setTimeout(() => {
          document.getElementById("thumbnail-goal-card")?.scrollIntoView({ behavior: "smooth", block: "center" });
        }, 100);
        return;
      }
      
      // Clear validation errors if all is good
      setValidationErrors({});

      // Upload all media files first (only allowed in create mode)
      const uploadPromises = isEditMode
        ? []
        : thumbnailAssets.map(async (asset) => {
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

      // Collect all media files: existing assets + project image + uploaded assets
      const allMediaFiles: string[] = [];

      const appendMediaFile = (url?: string | null) => {
        if (!url) return;
        if (allMediaFiles.includes(url)) return;
        allMediaFiles.push(url);
      };

      // Include existing assets captured during the original generation (user uploads, reference shots, etc.)
      if (existingAssetUrls.length > 0) {
        existingAssetUrls.forEach((assetUrl) => appendMediaFile(assetUrl));
      }
      
      // CRITICAL: Add project image if it exists and wasn't already part of the asset list
      if (selectedProject.image) {
        appendMediaFile(selectedProject.image);
        console.log("✅ Project image retained for regeneration:", selectedProject.image);
      } else if (hasTemplates && existingAssetUrls.length === 0) {
        // If using templates but no project image, warn the user
        console.warn("⚠️ No project image found - template will be applied with uploaded assets only");
        
        // Show a toast notification
        toast({
          title: "No project image",
          description: "Your project doesn't have an image. The template will be used as a base. Consider adding a project image for better results.",
          variant: "default",
        });
      }
      
      // Add any manually uploaded assets (these will be additional reference images)
      if (!isEditMode) {
        uploadedAssets.forEach((asset) => appendMediaFile(asset.url));
      }
      
      console.log(`📸 Total media files: ${allMediaFiles.length} (${selectedProject.image ? 'with' : 'without'} project image)`);

      // Prepare request body based on generation method
      const requestBody: any = {
        projectId: selectedProject.id,
        mediaFiles: allMediaFiles, // Now includes project image + uploaded assets
        channelStyle,
        thumbnailGoal,
        additionalInstructions,
        variations: effectiveVariations,
      };

      // Handle different generation methods
      if (hasTemplates) {
        // Template-based generation
        console.log("📋 Has templates:", hasTemplates);
        console.log("📋 Locked template IDs:", effectiveTemplateIds);
        console.log("📋 Template count:", effectiveTemplateIds.length);
        
        if (!effectiveTemplateIds || effectiveTemplateIds.length === 0) {
          toast({
            title: "No templates selected",
            description: "Please select at least one template to generate thumbnails.",
            variant: "destructive",
          });
          setIsGenerating(false);
          setHasSubmitted(false);
          return;
        }
        
        // Convert template IDs to strings (API expects string IDs)
        const templateIds = effectiveTemplateIds.map((id) => String(id));
        
        console.log("📋 Final template IDs being sent:", templateIds);
        requestBody.templates = templateIds;
      } else if (hasYoutubeLinks || hasInspirationUrl) {
        // YouTube-based generation - DON'T send templates field, backend handles this
        console.log("🎥 Using YouTube/Inspiration URL generation");
        console.log("🎥 YouTube links:", effectiveYoutubeLinks);
        console.log("🎥 Inspiration URL:", requestInspirationUrl);
        
        // Only send youtubeLinks or inspirationUrl, NOT templates
        if (effectiveYoutubeLinks.length > 0) {
          requestBody.youtubeLinks = effectiveYoutubeLinks;
        }
        if (requestInspirationUrl && requestInspirationUrl.trim()) {
          requestBody.inspirationUrl = requestInspirationUrl;
        }
      }

      console.log("📤 Sending thumbnail generation request:", JSON.stringify(requestBody, null, 2));

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
        console.error("❌ API Error Response:", errorData);
        console.error("❌ API Error Status:", response.status);
        console.error("❌ Request that failed:", JSON.stringify(requestBody, null, 2));

        if (response.status === 400 && (errorData?.error || "").toLowerCase().includes("credit")) {
          const creditError = new Error(
            "You don't have enough credits to run this edit. Please upgrade your plan or refill credits."
          );
          (creditError as Error & { code?: string }).code = "INSUFFICIENT_CREDITS";
          throw creditError;
        }

        if (response.status === 429) {
          const retryAfter = errorData.retryAfter || 10;
          throw new Error(`Please wait ${retryAfter} seconds before creating another thumbnail.`);
        }

        const errorMessage = errorData.error || errorData.message || `Server error (${response.status})`;
        throw new Error(errorMessage);
      }

      const data = await response.json();
      console.log("✅ Thumbnail generation response:", data);

      if (!data.id) {
        throw new Error("Invalid response from server");
      }

      console.log(`✅ Request ${requestId} completed successfully, redirecting...`);

      if (onGenerateComplete) {
        onGenerateComplete(data);
        setIsGenerating(false);
        setHasSubmitted(false);
      } else {
        // Navigate immediately (router.push is non-blocking)
        router.push(`/dashboard/generated-thumbnails/${data.id}`);

        // Close sheet after a brief delay to allow navigation to start
        setTimeout(() => {
          onClose();
          setIsGenerating(false); // Reset state after closing
        }, 300);
      }
    } catch (error) {
      console.error("Error generating thumbnail:", error);
      
      let errorMessage = error instanceof Error ? error.message : "Failed to generate thumbnail. Please try again.";
      
      // Add specific guidance based on the error
      if (errorMessage.includes("template")) {
        errorMessage += "\n\nTip: Make sure you have selected templates from the Templates tab.";
      } else if (errorMessage.includes("project")) {
        errorMessage += "\n\nTip: Make sure you have selected a project.";
      }
      
      const creditHelp = error instanceof Error && ((error as Error & { code?: string }).code === "INSUFFICIENT_CREDITS" || error.message.toLowerCase().includes("credit"));

      toast({
        title: "Generation failed",
        description: creditHelp ? (
          <div className="space-y-1">
            <p>{errorMessage}</p>
            <a href="/dashboard/support" className="text-primary underline font-medium" target="_blank" rel="noreferrer">
              Contact support
            </a>
          </div>
        ) : errorMessage,
        variant: "destructive",
      });
      
      // Reset flags on error so user can try again
      setHasSubmitted(false);
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
        {showGenerationLocked && (
          <Alert className="border-red-300 bg-red-50 text-red-900 dark:bg-red-500/10 dark:text-red-100">
            <AlertTriangle className="text-red-500 dark:text-red-200" />
            <AlertTitle>Generation locked</AlertTitle>
            <AlertDescription>
              <p className="mb-3 text-sm">
                You’ve used all available credits. Pick a plan to keep generating thumbnails with ThumbMaker AI.
              </p>
              <div className="flex flex-col gap-2 sm:flex-row">
                <Button size="sm" className="w-full sm:w-auto" asChild>
                  <Link href="/pricing">Choose a plan</Link>
                </Button>
                <Button size="sm" variant="outline" className="w-full sm:w-auto" asChild>
                  <Link href="/dashboard/billing">Open billing</Link>
                </Button>
              </div>
            </AlertDescription>
          </Alert>
        )}
        {isEditMode && showCreditReminder && !showGenerationLocked && (
          <Alert className="border-amber-300 bg-amber-50 text-amber-900 dark:bg-amber-500/10 dark:text-amber-200">
            <Sparkles className="text-amber-500 dark:text-amber-200" />
            <AlertTitle>Reminder</AlertTitle>
            <AlertDescription>
              {creditReminderMessage}
            </AlertDescription>
          </Alert>
        )}
        {/* Generation Method Indicator */}
        <div className="flex items-center justify-between p-4 bg-muted/50 rounded-lg border">
          <div className="flex items-center gap-3">
            <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
              initialMode === 'template' ? 'bg-primary/10' : 'bg-red-500/10'
            }`}>
              {initialMode === 'template' ? (
                <LayoutTemplate className="h-5 w-5 text-primary" />
              ) : (
                <Youtube className="h-5 w-5 text-red-500" />
              )}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <p className="text-sm font-medium">Generation Method</p>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <button className="inline-flex items-center justify-center">
                      <Info className="h-4 w-4 text-muted-foreground hover:text-foreground transition-colors" />
                    </button>
                  </TooltipTrigger>
                  <TooltipContent side="right" className="max-w-xs">
                    {initialMode === 'template' ? (
                      <p>
                        Your <strong>project content</strong> will be styled using the <strong>template's design</strong>. 
                        The final thumbnail will feature your project with the template's visual aesthetic applied.
                      </p>
                    ) : (
                      <p>
                        Thumbnails will be generated by analyzing the <strong>style and elements</strong> from your YouTube video links and applying them to your <strong>project content</strong>.
                      </p>
                    )}
                  </TooltipContent>
                </Tooltip>
              </div>
              <p className="text-xs text-muted-foreground">
                {initialMode === 'template'
                  ? 'Using template-based generation'
                  : 'Using YouTube link inspiration'
                }
              </p>
            </div>
          </div>
          <Badge variant={initialMode === 'template' ? "default" : "secondary"}>
            {initialMode === 'template' ? "Template Mode" : "YouTube Mode"}
          </Badge>
        </div>

        {/* Project Selection - Required First */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Video className="h-5 w-5" />
              Select Project
              {!selectedProject && (
                <Badge variant="destructive" className="text-xs">Required</Badge>
              )}
            </CardTitle>
            <CardDescription>
              Choose which project to create thumbnails for
            </CardDescription>
          </CardHeader>
          <CardContent>
            {selectedProject ? (
              <div className="space-y-2">
                <div className="flex items-center justify-between p-4 bg-blue-50 dark:bg-blue-950/20 rounded-lg border border-blue-200 dark:border-blue-800">
                  <div className="flex items-center gap-4">
                    {/* Project Image */}
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
                  {!isEditMode && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setShowProjectSelector(!showProjectSelector)}
                      className="h-8"
                    >
                      Change
                    </Button>
                  )}
                </div>

                {/* Project Selector Dropdown */}
                {showProjectSelector && !isEditMode && (
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
            ) : !isEditMode ? (
              /* Show project list when no project selected */
              <div className="border rounded-lg p-3 bg-background max-h-[400px] overflow-y-auto">
                <div className="flex items-center justify-between mb-3">
                  <p className="text-sm font-medium">Select a project:</p>
                  <Badge variant="secondary" className="text-xs">
                    {projects.length} available
                  </Badge>
                </div>
                {projects.length > 0 ? (
                  <div className="space-y-2">
                    {projects.map((project) => (
                      <div
                        key={project.id}
                        className="cursor-pointer p-3 rounded-lg border transition-all hover:shadow-md hover:border-primary/50"
                        onClick={() => {
                          if (onProjectChange) {
                            onProjectChange(project);
                          }
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
                      No projects available
                    </p>
                    <p className="text-xs text-muted-foreground">
                      Create a project first to get started
                    </p>
                  </div>
                )}
              </div>
            ) : (
              <p className="text-sm text-muted-foreground">
                Project details unavailable. Open this thumbnail directly from your project list to edit further.
              </p>
            )}
          </CardContent>
        </Card>

        {/* Generation Method - Always visible, positioned after project selection */}
        <Card id="generation-method-tabs">
          <CardContent className="pt-6">
            {/* YouTube Mode */}
            {initialMode === "youtube" && (
              <div className="space-y-4">
                {/* Display all YouTube links from the page */}
                {allYoutubeLinks.length > 0 && (
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <h3 className="text-lg font-medium">
                        YouTube Links from Page ({allYoutubeLinks.length})
                      </h3>
                      <div className="text-sm text-brand-600 font-medium">
                        Will generate {allYoutubeLinks.length} thumbnail{allYoutubeLinks.length !== 1 ? 's' : ''}
                      </div>
                    </div>
                    <div className="space-y-2">
                      {allYoutubeLinks.map((link, index) => {
                        const videoId = link.match(
                          /(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/\s]{11})/
                        )?.[1];
                        return (
                          <div key={index} className="flex items-center gap-3 p-3 bg-green-50 dark:bg-green-950 border border-green-200 dark:border-green-800 rounded-lg">
                            <div className="flex-shrink-0">
                              {videoId ? (
                                <Image
                                  src={`https://img.youtube.com/vi/${videoId}/maxresdefault.jpg`}
                                  alt={`Video ${index + 1}`}
                                  width={64}
                                  height={48}
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
                            <div className="flex items-center gap-2 text-green-600 dark:text-green-400">
                              <CheckSquare className="h-5 w-5" />
                              <span className="text-sm font-medium">Selected</span>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                    <div className="bg-blue-50 dark:bg-blue-950 border border-blue-200 dark:border-blue-800 rounded-lg p-3">
                      <div className="flex items-start gap-2">
                        <Sparkles className="h-5 w-5 text-blue-600 dark:text-blue-400 mt-0.5 flex-shrink-0" />
                        <div className="text-sm text-blue-900 dark:text-blue-100">
                          <p className="font-medium mb-1">All videos will be used as inspiration</p>
                          <p className="text-blue-700 dark:text-blue-300">
                            Each YouTube video will generate a separate thumbnail inspired by its style and applied to your project content.
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {!isEditMode && (
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
                        <Image
                          src={inspirationPreview}
                          alt="Inspiration thumbnail preview"
                          fill
                          className="object-cover"
                          sizes="(max-width: 768px) 100vw, 600px"
                        />
                        <div className="absolute inset-0 bg-black/40 opacity-0 hover:opacity-100 transition-opacity flex items-center justify-center">
                          <div className="text-white text-center p-4">
                            <p className="text-sm">Inspiration Thumbnail</p>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                )}
                {isEditMode && inspirationPreview && (
                  <div className="relative aspect-video rounded-lg overflow-hidden border">
                    <Image
                      src={inspirationPreview}
                      alt="Inspiration thumbnail preview"
                      fill
                      className="object-cover"
                      sizes="(max-width: 768px) 100vw, 600px"
                    />
                    <div className="absolute inset-0 bg-black/60 text-white flex items-center justify-center text-sm">
                      Original inspiration thumbnail
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Template Mode */}
            {initialMode === "template" && (
              <div className="space-y-4">
                {isEditMode ? (
                  <div className="space-y-3">
                    <p className="text-sm text-muted-foreground">
                      The same template set from your original generation will be reused.
                    </p>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                      {preSelectedTemplates && preSelectedTemplates.length > 0 ? (
                        preSelectedTemplates
                          .filter((template: any) =>
                            lockedTemplateIds.includes(String(template.id))
                          )
                          .map((template: any) => (
                          <div
                            key={template.id}
                            className="flex items-center gap-3 rounded-lg border bg-muted/30 p-3"
                          >
                            <div className="relative w-16 h-12 rounded-md overflow-hidden bg-muted">
                              {template.image ? (
                                <Image
                                  src={template.image}
                                  alt={template.title || "Template"}
                                  fill
                                  className="object-cover"
                                  sizes="128px"
                                />
                              ) : (
                                <LayoutTemplate className="w-5 h-5 text-muted-foreground absolute inset-0 m-auto" />
                              )}
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="text-sm font-medium line-clamp-1">
                                {template.title || "Template"}
                              </p>
                              {template.description && (
                                <p className="text-xs text-muted-foreground line-clamp-1">
                                  {template.description}
                                </p>
                              )}
                            </div>
                          </div>
                        ))
                      ) : (
                        <p className="text-sm text-muted-foreground">
                          Templates unavailable. Open the original generation detail page to view more info.
                        </p>
                      )}
                    </div>
                    <p className="text-xs text-muted-foreground">
                      Variations: 1 (single cleanup run)
                    </p>
                  </div>
                ) : (
                  <>
                    <TemplateSelector
                      selectedTemplateIds={allSelectedTemplates}
                      onSelect={setAllSelectedTemplates}
                      maxSelections={maxSelections}
                      preSelectedTemplates={preSelectedTemplates}
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
                  </>
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
              Keep your original upload or add new reference images
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {hasExistingAssets && (
              <div className="space-y-3">
                <div className="flex flex-col gap-1">
                  <p className="text-sm font-medium text-muted-foreground">
                    Original uploads (person shots, props, etc.)
                  </p>
                  <p className="text-xs text-muted-foreground">
                    These are locked to ensure we edit the same photo. Update instructions below to describe the cleanup you need.
                  </p>
                </div>
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                  {existingAssetUrls.map((assetUrl) => (
                    <div
                      key={assetUrl}
                      className="relative aspect-video rounded-lg overflow-hidden border bg-muted/20"
                    >
                      <Image
                        src={assetUrl}
                        alt="Existing asset"
                        fill
                        className="object-cover"
                        unoptimized
                        sizes="(max-width: 768px) 100vw, 300px"
                      />
                      <div className="absolute top-2 left-2">
                        <Badge className="text-[10px]">Included</Badge>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {!isEditMode && (
              <>
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
                      {thumbnailAssets.length} file{thumbnailAssets.length !== 1 ? "s" : ""} selected
                    </p>
                    <div className="mt-4 grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                      {thumbnailAssets.map((asset, index) => (
                        <div
                          key={`${asset.file.name}-${index}`}
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
              </>
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
            {isEditMode ? (
              <div className="rounded-lg border bg-muted/30 p-4">
                <p className="text-sm font-medium">{channelStyleLabel}</p>
                <p className="text-xs text-muted-foreground mt-1">
                  Locked to your original generation.
                </p>
              </div>
            ) : (
              <Select 
                value={channelStyle} 
                onValueChange={(value) => {
                  setChannelStyle(value);
                  setValidationErrors(prev => ({ ...prev, channelStyle: false }));
                }}
              >
                <SelectTrigger className={`w-full text-left py-6 ${validationErrors.channelStyle ? "border-destructive" : ""}`}>
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
            )}
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
            {isEditMode ? (
              <div className="rounded-lg border bg-muted/30 p-4">
                <p className="text-sm font-medium">{thumbnailGoalLabel}</p>
                <p className="text-xs text-muted-foreground mt-1">
                  Locked to your original generation.
                </p>
              </div>
            ) : (
              <Select 
                value={thumbnailGoal} 
                onValueChange={(value) => {
                  setThumbnailGoal(value);
                  setValidationErrors(prev => ({ ...prev, thumbnailGoal: false }));
                }}
              >
                <SelectTrigger className={`w-full text-left py-6 ${validationErrors.thumbnailGoal ? "border-destructive" : ""}`}>
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
            )}
          </CardContent>
        </Card>

        {/* Prompt Instructions */}
        <Card>
          <CardHeader>
            <CardTitle>{isEditMode ? "Fix Prompt" : "Additional Instructions"}</CardTitle>
            <CardDescription>
              {isEditMode
                ? "Explain the cleanup you need (e.g., “Remove the brown door behind me and soften shadows”)."
                : "Add any specific requirements or preferences"}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Textarea
              placeholder={
                isEditMode
                  ? "Describe what to fix. Example: “Remove the wooden door behind me and blur the background slightly.”"
                  : "Enter any additional instructions or requirements for the thumbnail generation..."
              }
              value={additionalInstructions}
              onChange={(e) => setAdditionalInstructions(e.target.value)}
              rows={4}
            />
            {isEditMode && (
              <p className="text-xs text-muted-foreground mt-2">
                Each fix still consumes a credit. Need bigger changes? Generate a brand new thumbnail instead.
              </p>
            )}
          </CardContent>
        </Card>

        {/* Generate Actions */}
        <div className="space-y-3">
          <Button
            onClick={handleGenerate}
            variant="brand"
            className="px-8 w-full text-center"
            disabled={!selectedProject || isGenerating || hasSubmitted || showGenerationLocked}
            type="button"
          >
            {isGenerating ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                {generatingLabel}
              </>
            ) : hasSubmitted ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Redirecting...
              </>
            ) : (
              <>
                <Sparkles className="mr-2 h-4 w-4" />
                {primaryIdleLabel}
              </>
            )}
          </Button>

          {!isEditMode && (
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  type="button"
                  variant="outline"
                  className="w-full text-center"
                  disabled
                >
                  Replace Existing (Coming Soon)
                </Button>
              </TooltipTrigger>
              <TooltipContent className="max-w-xs text-sm">
                Direct replacement requires a backend update. Generate a new version instead, then manage it from History.
              </TooltipContent>
            </Tooltip>
          )}
        </div>
        {(isGenerating || hasSubmitted) && (
          <p className="text-sm text-center text-muted-foreground">
            Please do not refresh or close this page
          </p>
        )}
      </div>
    </FormSheet>
  );
}
