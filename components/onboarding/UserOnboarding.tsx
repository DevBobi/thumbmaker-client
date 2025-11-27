"use client";

import { useEffect, useMemo, useState } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import {
  Sparkles,
  Upload,
  Youtube,
  Layers,
  Crown,
  CheckCircle2,
  Loader2,
  Info,
  Check,
} from "lucide-react";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import Stepper, { StepConfig } from "@/components/ui/stepper";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import TemplateSelector from "@/components/thumbnail/TemplateSelector";
import { useAuthFetch } from "@/hooks/use-auth-fetch";
import { useToast } from "@/hooks/use-toast";
import { uploadToStorage } from "@/actions/upload";
import { Project } from "@/types";
import { cn } from "@/lib/utils";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";

type GenerationMode = "template" | "youtube";

interface UserOnboardingProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onFinish?: () => void;
}

const steps: StepConfig[] = [
  { id: 1, name: "Project Details" },
  { id: 2, name: "Source" },
  { id: 3, name: "Templates" },
  { id: 4, name: "Customize" },
  { id: 5, name: "Pricing" },
  { id: 6, name: "Results" },
];

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

const pricing = [
  {
    id: "starter",
    name: "Starter",
    price: "$29",
    limit: "50 thumbnail generations/month",
    features: [
      "Unlimited template access",
      "YouTube import",
      "Custom asset uploads",
      "Email support",
    ],
  },
  {
    id: "pro",
    name: "Pro",
    price: "$79",
    limit: "200 thumbnail generations/month",
    popular: true,
    features: [
      "Unlimited template access",
      "Custom template creation",
      "Priority email support",
      "Brand libraries",
    ],
  },
  {
    id: "power",
    name: "Power",
    price: "$199",
    limit: "700 thumbnail generations/month",
    features: [
      "Unlimited template access",
      "Custom asset uploads",
      "Custom template creation",
      "Priority WhatsApp support",
    ],
  },
];

export function UserOnboarding({
  open,
  onOpenChange,
  onFinish,
}: UserOnboardingProps) {
  const router = useRouter();
  const { authFetch } = useAuthFetch();
  const { toast } = useToast();

  const [currentStep, setCurrentStep] = useState(1);
  const [mode, setMode] = useState<"ai" | "manual">("ai");
  const [projectForm, setProjectForm] = useState({
    title: "",
    description: "",
    targetAudience: "",
  });
  const [project, setProject] = useState<Project | null>(null);
  const [isProjectSaving, setIsProjectSaving] = useState(false);
  const [isImageUploading, setIsImageUploading] = useState(false);
  const [generationMode, setGenerationMode] =
    useState<GenerationMode>("template");
  const [selectedTemplates, setSelectedTemplates] = useState<string[]>([]);
  const [templateObjects, setTemplateObjects] = useState<any[]>([]);
  const [inspirationUrl, setInspirationUrl] = useState("");
  const [channelStyle, setChannelStyle] = useState("");
  const [thumbnailGoal, setThumbnailGoal] = useState("");
  const [customGoal, setCustomGoal] = useState("");
  const [selectedPlan, setSelectedPlan] = useState("pro");
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedResult, setGeneratedResult] = useState<any>(null);

  useEffect(() => {
    if (!open) {
      setCurrentStep(1);
      setProject(null);
      setSelectedTemplates([]);
      setTemplateObjects([]);
      setInspirationUrl("");
      setChannelStyle("");
      setThumbnailGoal("");
      setCustomGoal("");
      setSelectedPlan("pro");
      setGeneratedResult(null);
      setProjectForm({
        title: "",
        description: "",
        targetAudience: "",
      });
    }
  }, [open]);

  const youtubeVideoIds = useMemo(() => {
    if (!inspirationUrl.trim()) return [];
    const lines = inspirationUrl
      .split("\n")
      .map((line) => line.trim())
      .filter(Boolean);
    const ids = new Set<string>();
    lines.forEach((line) => {
      const match = line.match(
        /(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/\s]{11})/
      );
      if (match?.[1]) {
        ids.add(match[1]);
      }
    });
    return Array.from(ids);
  }, [inspirationUrl]);

  const hasTemplateInput = selectedTemplates.length > 0;
  const hasYoutubeInput = youtubeVideoIds.length > 0;
  const hasGenerationInput =
    generationMode === "template" ? hasTemplateInput : hasYoutubeInput;

  const primaryLabel = useMemo(() => {
    if (currentStep === 1) {
      return project
        ? "Continue"
        : isProjectSaving
          ? "Creating..."
          : "Create Project";
    }
    if (currentStep === 2) {
      return project?.image ? "Continue" : "Upload image to continue";
    }
    if (currentStep === 3) {
      return "Continue";
    }
    if (currentStep === 4) {
      return "Continue";
    }
    if (currentStep === 5) {
      return isGenerating ? "Generating..." : "Generate thumbnails";
    }
    if (currentStep === 6) {
      return generatedResult?.id ? "View results" : "Close";
    }
    return "Continue";
  }, [currentStep, project, isProjectSaving, isGenerating, generatedResult]);

  const handleCreateProject = async () => {
    if (
      !projectForm.title.trim() ||
      !projectForm.description.trim() ||
      !projectForm.targetAudience.trim()
    ) {
      toast({
        title: "Add project details",
        description:
          "Give your project a title, description, and audience to continue.",
        variant: "destructive",
      });
      return;
    }

    setIsProjectSaving(true);
    try {
      const response = await authFetch("/projects/create", {
        method: "POST",
        body: JSON.stringify({
          title: projectForm.title,
          description: projectForm.description,
          targetAudience: projectForm.targetAudience,
          highlights: [],
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to create project");
      }

      const data = await response.json();
      setProject(data);
      toast({
        title: "Project created",
        description: "Next, add a hero image so we can style your workspace.",
      });
      setCurrentStep(2);
    } catch (error) {
      console.error(error);
      toast({
        title: "Unable to create project",
        description: "Please try again or check your connection.",
        variant: "destructive",
      });
    } finally {
      setIsProjectSaving(false);
    }
  };

  const handleProjectImageUpload = async (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    if (!project) {
      toast({
        title: "Create a project first",
        description: "Finish step one before uploading media.",
        variant: "destructive",
      });
      return;
    }

    const file = event.target.files?.[0];
    if (!file) return;

    setIsImageUploading(true);
    try {
      const formData = new FormData();
      formData.append("file", file);
      const uploadResult = await uploadToStorage(formData);

      if (!uploadResult.success || !uploadResult.fileUrl) {
        throw new Error(uploadResult.error || "Failed to upload image");
      }

      const response = await authFetch(`/projects/${project.id}`, {
        method: "PUT",
        body: JSON.stringify({
          title: project.title,
          description: project.description,
          targetAudience: project.targetAudience,
          image: uploadResult.fileUrl,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to attach image to project");
      }

      const updated = await response.json();
      setProject(updated);
      toast({
        title: "Image saved",
        description: "Workspace ready—let's pick your starting template.",
      });

      // Automatically advance to templates
      setTimeout(() => setCurrentStep(3), 500);
    } catch (error) {
      console.error(error);
      toast({
        title: "Upload failed",
        description: "Please try a different image or check your connection.",
        variant: "destructive",
      });
    } finally {
      setIsImageUploading(false);
      event.target.value = "";
    }
  };

  const handleTemplateObjectSelect = (template: any) => {
    setTemplateObjects((prev) => {
      if (prev.find((item) => item.id === template.id)) {
        return prev;
      }
      return [...prev, template];
    });
  };

  const handlePrimaryAction = async () => {
    if (currentStep === 1) {
      if (project) {
        setCurrentStep(2);
      } else {
        await handleCreateProject();
      }
      return;
    }

    if (currentStep === 2) {
      if (!project?.image) {
        toast({
          title: "Upload an image",
          description: "Add a hero image to demonstrate the workspace setup.",
          variant: "destructive",
        });
        return;
      }
      setCurrentStep(3);
      return;
    }

    if (currentStep === 3) {
      if (!hasGenerationInput) {
        toast({
          title: "Add a starting point",
          description:
            generationMode === "template"
              ? "Select at least one template to continue."
              : "Paste at least one valid YouTube link.",
          variant: "destructive",
        });
        return;
      }
      setCurrentStep(4);
      return;
    }

    if (currentStep === 4) {
      if (!channelStyle || !thumbnailGoal) {
        toast({
          title: "Customize your brief",
          description: "Pick a channel style and primary outcome.",
          variant: "destructive",
        });
        return;
      }
      setCurrentStep(5);
      return;
    }

    if (currentStep === 5) {
      if (!selectedPlan) {
        toast({
          title: "Choose a plan",
          description: "Select a plan to generate without watermarks.",
          variant: "destructive",
        });
        return;
      }
      await handleGenerateThumbnails();
      return;
    }

    if (currentStep === 6) {
      onFinish?.();
      onOpenChange(false);
      if (generatedResult?.id) {
        router.push(`/dashboard/generated-thumbnails/${generatedResult.id}`);
      }
    }
  };

  const handleGenerateThumbnails = async () => {
    if (!project) {
      toast({
        title: "Missing project",
        description: "Create a project before generating thumbnails.",
        variant: "destructive",
      });
      return;
    }

    setIsGenerating(true);
    try {
      const mediaFiles = project.image ? [project.image] : [];
      const body: Record<string, unknown> = {
        projectId: project.id,
        mediaFiles,
        channelStyle,
        thumbnailGoal,
        additionalInstructions: customGoal,
        variations: Math.max(1, selectedTemplates.length) > 3 ? 2 : 1,
      };

      if (generationMode === "template") {
        body.templates = selectedTemplates;
      } else {
        body.inspirationUrl = inspirationUrl;
      }

      const response = await authFetch("/thumbnails/create", {
        method: "POST",
        body: JSON.stringify(body),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || "Failed to generate thumbnails");
      }

      const data = await response.json();
      setGeneratedResult(data);
      toast({
        title: "Generation started",
        description: "We’ll redirect you to the results.",
      });
      setCurrentStep(6);
    } catch (error) {
      console.error(error);
      toast({
        title: "Generation failed",
        description:
          error instanceof Error
            ? error.message
            : "Please try again in a moment.",
        variant: "destructive",
      });
    } finally {
      setIsGenerating(false);
    }
  };

  const handleBack = () => {
    if (currentStep === 1) return;
    setCurrentStep((prev) => Math.max(1, prev - 1));
  };

  const renderStep = () => {
    switch (currentStep) {
      case 1:
        return (
          <div className="max-w-2xl mx-auto space-y-6">
            <div className="text-center space-y-2">
              <p className="text-sm uppercase tracking-[0.2em] text-brand-600">
                Step 1
              </p>
              <h2 className="text-3xl font-bold">Create your project</h2>
              <p className="text-muted-foreground">
                The same workflow you’ll use inside the dashboard.
              </p>
            </div>
            <div className="flex flex-wrap items-center justify-center gap-3">
              <Button
                variant={mode === "ai" ? "default" : "outline"}
                className="gap-2"
                onClick={() => setMode("ai")}
              >
                <Sparkles className="h-4 w-4" />
                AI Enhanced
              </Button>
              <Button
                variant={mode === "manual" ? "default" : "outline"}
                className="gap-2"
                onClick={() => setMode("manual")}
              >
                <Layers className="h-4 w-4" />
                Manual
              </Button>
            </div>

            <div className="grid gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Project title</label>
                <Input
                  placeholder="e.g., Minecraft Survival Ep. 1"
                  value={projectForm.title}
                  onChange={(e) =>
                    setProjectForm((prev) => ({
                      ...prev,
                      title: e.target.value,
                    }))
                  }
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">
                  Description (what happens in the video?)
                </label>
                <Textarea
                  rows={4}
                  value={projectForm.description}
                  onChange={(e) =>
                    setProjectForm((prev) => ({
                      ...prev,
                      description: e.target.value,
                    }))
                  }
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">
                  Target audience or persona
                </label>
                <Input
                  placeholder="e.g., Casual gamers who love survival guides"
                  value={projectForm.targetAudience}
                  onChange={(e) =>
                    setProjectForm((prev) => ({
                      ...prev,
                      targetAudience: e.target.value,
                    }))
                  }
                />
              </div>
            </div>
          </div>
        );
      case 2:
        return (
          <div className="space-y-6 text-center max-w-2xl mx-auto">
            <div className="space-y-2">
              <p className="text-sm uppercase tracking-[0.2em] text-brand-600">
                Step 2
              </p>
              <h2 className="text-3xl font-bold">Add a hero image</h2>
              <p className="text-muted-foreground">
                This is exactly how the dashboard asks you for source assets.
              </p>
            </div>

            <label className="block cursor-pointer rounded-3xl border-2 border-dashed border-brand-200 bg-brand-50/40 p-8 transition hover:border-brand-400">
              <div className="flex flex-col items-center gap-3 text-brand-600">
                {isImageUploading ? (
                  <Loader2 className="h-8 w-8 animate-spin" />
                ) : (
                  <Upload className="h-8 w-8" />
                )}
                <p className="font-semibold">
                  {project?.image
                    ? "Image uploaded! Select again to replace."
                    : "Choose a file or drag & drop it here"}
                </p>
                <p className="text-sm text-muted-foreground">
                  JPG, PNG, MP4 up to 50MB
                </p>
              </div>
              <input
                type="file"
                accept="image/*,video/mp4"
                className="sr-only"
                onChange={handleProjectImageUpload}
                disabled={isImageUploading}
              />
            </label>

            {project?.image && (
              <div className="rounded-2xl border bg-card p-4 text-left">
                <p className="text-sm font-semibold mb-3">Preview</p>
                <div className="relative aspect-video rounded-xl overflow-hidden border">
                  <Image
                    src={project.image}
                    alt={project.title || "Project image"}
                    fill
                    className="object-cover"
                  />
                </div>
              </div>
            )}
          </div>
        );
      case 3:
        return (
          <div className="space-y-6">
            <div className="text-center space-y-2">
              <p className="text-sm uppercase tracking-[0.2em] text-brand-600">
                Step 3
              </p>
              <h2 className="text-3xl font-bold">Choose a starting point</h2>
              <p className="text-muted-foreground">
                Same template & YouTube import flow as the dashboard.
              </p>
            </div>

            <Tabs
              value={generationMode}
              onValueChange={(value) => setGenerationMode(value as GenerationMode)}
            >
              <TabsList className="grid grid-cols-2 w-full">
                <TabsTrigger value="template">Template library</TabsTrigger>
                <TabsTrigger value="youtube">YouTube link</TabsTrigger>
              </TabsList>

              <TabsContent value="template" className="space-y-4 mt-4">
                <TemplateSelector
                  selectedTemplateIds={selectedTemplates}
                  onSelect={setSelectedTemplates}
                  maxSelections={8}
                  preSelectedTemplates={templateObjects}
                  onTemplateObjectSelect={handleTemplateObjectSelect}
                />

                {selectedTemplates.length > 0 && (
                  <div className="p-3 rounded-xl border bg-muted/40 text-sm flex items-center justify-between">
                    <span>
                      {selectedTemplates.length} template
                      {selectedTemplates.length > 1 ? "s" : ""} selected
                    </span>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setSelectedTemplates([])}
                    >
                      Clear
                    </Button>
                  </div>
                )}
              </TabsContent>

              <TabsContent value="youtube" className="space-y-4 mt-4">
                <Textarea
                  rows={5}
                  placeholder="Paste one YouTube link per line..."
                  value={inspirationUrl}
                  onChange={(e) => setInspirationUrl(e.target.value)}
                />
                {youtubeVideoIds.length > 0 && (
                  <div className="grid gap-3 md:grid-cols-3">
                    {youtubeVideoIds.slice(0, 3).map((id) => (
                      <div
                        key={id}
                        className="relative aspect-video rounded-xl overflow-hidden border"
                      >
                        <Image
                          src={`https://img.youtube.com/vi/${id}/maxresdefault.jpg`}
                          alt="YouTube reference"
                          fill
                          className="object-cover"
                        />
                        <div className="absolute top-2 right-2">
                          <Badge className="bg-black/70">Link</Badge>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </TabsContent>
            </Tabs>
          </div>
        );
      case 4:
        return (
          <div className="space-y-6">
            <div className="text-center space-y-2">
              <p className="text-sm uppercase tracking-[0.2em] text-brand-600">
                Step 4
              </p>
              <h2 className="text-3xl font-bold">Customize the brief</h2>
              <p className="text-muted-foreground">
                Exactly the same knobs you’ll use on the real generator.
              </p>
            </div>

            <Card className={!channelStyle ? "ring-1 ring-destructive/60" : ""}>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-base">
                  Channel Style
                  {!channelStyle && (
                    <Badge variant="destructive" className="text-xs">
                      Required
                    </Badge>
                  )}
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <button className="inline-flex items-center justify-center">
                        <Info className="h-4 w-4 text-muted-foreground hover:text-foreground transition-colors" />
                      </button>
                    </TooltipTrigger>
                    <TooltipContent side="right" className="max-w-xs text-sm">
                      Choose the visual style that aligns with your channel's
                      branding and content type. This helps tailor the thumbnail
                      design to match your audience's expectations.
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
                          variant={
                            channelStyle === style.value ? "default" : "outline"
                          }
                          className={cn(
                            "cursor-pointer px-4 py-2 text-sm font-medium transition-all hover:scale-105",
                            channelStyle === style.value
                              ? "shadow-sm"
                              : !channelStyle
                                ? "hover:bg-primary/10 hover:text-primary hover:border-primary"
                                : "hover:bg-primary/10 hover:text-primary hover:border-primary"
                          )}
                          onClick={() => setChannelStyle(style.value)}
                        >
                          {style.label}
                          {channelStyle === style.value && (
                            <Check className="ml-1.5 h-3.5 w-3.5" />
                          )}
                        </Badge>
                      </TooltipTrigger>
                      <TooltipContent side="top" className="max-w-xs text-sm">
                        {style.description}
                      </TooltipContent>
                    </Tooltip>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card className={!thumbnailGoal ? "ring-1 ring-destructive/60" : ""}>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-base">
                  Primary Thumbnail Goal
                  {!thumbnailGoal && (
                    <Badge variant="destructive" className="text-xs">
                      Required
                    </Badge>
                  )}
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <button className="inline-flex items-center justify-center">
                        <Info className="h-4 w-4 text-muted-foreground hover:text-foreground transition-colors" />
                      </button>
                    </TooltipTrigger>
                    <TooltipContent side="right" className="max-w-xs text-sm">
                      Define the primary objective for your thumbnail. This
                      influences the visual hierarchy, emotional tone, and
                      design elements to maximize your desired outcome.
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
                          variant={
                            thumbnailGoal === goal.value ? "default" : "outline"
                          }
                          className={cn(
                            "cursor-pointer px-4 py-2 text-sm font-medium transition-all hover:scale-105",
                            thumbnailGoal === goal.value
                              ? "shadow-sm"
                              : !thumbnailGoal
                                ? "hover:bg-primary/10 hover:text-primary hover:border-primary"
                                : "hover:bg-primary/10 hover:text-primary hover:border-primary"
                          )}
                          onClick={() => setThumbnailGoal(goal.value)}
                        >
                          {goal.label}
                          {thumbnailGoal === goal.value && (
                            <Check className="ml-1.5 h-3.5 w-3.5" />
                          )}
                        </Badge>
                      </TooltipTrigger>
                      <TooltipContent side="top" className="max-w-xs text-sm">
                        {goal.description}
                      </TooltipContent>
                    </Tooltip>
                  ))}
                </div>
              </CardContent>
            </Card>

            <div className="space-y-2">
              <label className="text-sm font-medium">
                Custom instructions (optional)
              </label>
              <Textarea
                rows={4}
                value={customGoal}
                onChange={(e) => setCustomGoal(e.target.value)}
                placeholder="E.g., punchy white text on purple, shocked emoji, hero on right..."
              />
            </div>
          </div>
        );
      case 5:
        return (
          <div className="space-y-6">
            <div className="text-center space-y-2">
              <p className="text-sm uppercase tracking-[0.2em] text-brand-600">
                Step 5
              </p>
              <h2 className="text-3xl font-bold">Unlock your masterpiece</h2>
              <p className="text-muted-foreground">
                Pick the same plan prompt you’ll see after onboarding—then we
                call the real API.
              </p>
            </div>

            <div className="grid gap-4 md:grid-cols-3">
              {pricing.map((plan) => (
                <Card
                  key={plan.id}
                  className={cn(
                    "border-2",
                    selectedPlan === plan.id
                      ? "border-brand-600 shadow-lg"
                      : "border-border"
                  )}
                >
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <CardTitle>{plan.name}</CardTitle>
                      {plan.popular && (
                        <Badge className="bg-brand-600">Popular</Badge>
                      )}
                    </div>
                    <div className="flex items-baseline gap-1">
                      <span className="text-3xl font-bold">{plan.price}</span>
                      <span className="text-sm text-muted-foreground">
                        /month
                      </span>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      {plan.limit}
                    </p>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <ul className="space-y-2 text-sm text-muted-foreground">
                      {plan.features.map((feature) => (
                        <li key={feature} className="flex items-center gap-2">
                          <CheckCircle2 className="h-4 w-4 text-brand-500" />
                          {feature}
                        </li>
                      ))}
                    </ul>
                    <Button
                      className="w-full"
                      variant={selectedPlan === plan.id ? "default" : "outline"}
                      onClick={() => setSelectedPlan(plan.id)}
                    >
                      {selectedPlan === plan.id ? "Selected" : "Choose plan"}
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        );
      default:
        return (
          <div className="space-y-8 text-center">
            <div className="space-y-3">
              <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-brand-50 text-brand-600">
                <Crown className="h-8 w-8" />
              </div>
              <h2 className="text-3xl font-bold">Your workflow is live</h2>
              <p className="text-muted-foreground">
                We just triggered the real generation API. Head to the
                dashboard to watch it process.
              </p>
            </div>
            {generatedResult?.id && (
              <div className="rounded-2xl border bg-card p-6 max-w-2xl mx-auto">
                <p className="text-sm text-muted-foreground">
                  Batch ID: {generatedResult.id}
                </p>
                <p className="text-sm text-muted-foreground mt-1">
                  Project: {project?.title}
                </p>
              </div>
            )}
          </div>
        );
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="w-full max-w-4xl md:max-w-5xl border-none bg-background/95 p-0 shadow-2xl max-h-[92vh] overflow-y-auto">
        <div className="flex h-full flex-col gap-6 p-6 md:p-8">
          <div className="flex flex-col gap-2 text-center">
            <p className="text-xs uppercase tracking-[0.3em] text-brand-600">
              ThumbMaker
            </p>
            <h1 className="text-2xl font-semibold">
              Guided onboarding for new creators
            </h1>
            <p className="text-sm text-muted-foreground">
              Follow the exact dashboard workflow once, with training wheels.
            </p>
          </div>
          <Stepper currentStep={currentStep} steps={steps} />
          <div className="min-h-[420px] max-h-[60vh] flex-1 overflow-y-auto pr-1">
            {renderStep()}
          </div>
          <div className="flex flex-wrap items-center justify-between gap-4 pt-2">
            <Button
              variant="ghost"
              onClick={handleBack}
              disabled={currentStep === 1 || isProjectSaving || isGenerating}
            >
              Back
            </Button>
            <div className="flex flex-wrap items-center gap-3">
              <Button
                onClick={handlePrimaryAction}
                size="lg"
                disabled={
                  isProjectSaving || isImageUploading || isGenerating
                }
              >
                {primaryLabel}
              </Button>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

export default UserOnboarding;


