 "use client";

import { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { ClipboardList, Plus, Sparkles, X, Upload } from "lucide-react";
import { cn } from "@/lib/utils";
import { useToast } from "@/hooks/use-toast";

export type CreationMethod = "manual" | "text" | "youtube" | "document";

export interface OnboardingProjectInput {
  title: string;
  description: string;
  targetAudience: string;
  highlights: string[];
  creationMethod: CreationMethod;
  textContent?: string;
  youtubeLink?: string;
  documentFile?: File | null;
}

interface NewOnboardingProps {
  onContinue: (data: OnboardingProjectInput) => void;
}

const creationMethodCopy: Record<
  CreationMethod,
  { title: string; description: string }
> = {
  manual: {
    title: "Manual setup",
    description: "Fill out the full brief yourself.",
  },
  text: {
    title: "Paste content",
    description: "Drop in a script or blog post (100+ characters).",
  },
  youtube: {
    title: "YouTube link",
    description: "We’ll analyze the video and pull the title for you.",
  },
  document: {
    title: "Upload document",
    description: "Attach a PDF, DOCX, or TXT file for AI analysis.",
  },
};

export default function NewOnboarding({ onContinue }: NewOnboardingProps) {
  const { toast } = useToast();
  // Default to AI-powered YouTube flow
  const [creationMethod, setCreationMethod] =
    useState<CreationMethod>("youtube");
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [targetAudience, setTargetAudience] = useState("");
  const [highlights, setHighlights] = useState<string[]>([""]);
  const [textContent, setTextContent] = useState("");
  const [youtubeLink, setYoutubeLink] = useState("");
  const [documentFile, setDocumentFile] = useState<File | null>(null);

  const requiresTitle = creationMethod !== "youtube";

  const isValidYoutubeUrl = (url: string) => {
    try {
      const parsed = new URL(url);
      const host = parsed.hostname.replace("www.", "");
      if (host === "youtu.be") {
        return !!parsed.pathname.slice(1);
      }
      if (host === "youtube.com") {
        return !!parsed.searchParams.get("v");
      }
      return false;
    } catch {
      return false;
    }
  };

  const validateAndContinue = () => {
    if (requiresTitle && !title.trim()) {
      toast({
        title: "Add project title",
        description: "Give your project a title to continue.",
        variant: "destructive",
      });
      return;
    }

    if (creationMethod === "manual") {
      if (!description.trim() || description.trim().length < 10) {
        toast({
          title: "Add description",
          description: "Provide at least 10 characters describing your project.",
          variant: "destructive",
        });
        return;
      }
      if (!targetAudience.trim()) {
        toast({
          title: "Add target audience",
          description: "Describe who this project is for.",
          variant: "destructive",
        });
        return;
      }
    } else if (creationMethod === "text") {
      if (!textContent || textContent.trim().length < 100) {
        toast({
          title: "Add script/content",
          description: "Please provide at least 100 characters for AI analysis.",
          variant: "destructive",
        });
        return;
      }
    } else if (creationMethod === "youtube") {
      const link = youtubeLink.trim();
      if (!link || !isValidYoutubeUrl(link)) {
        toast({
          title: "Enter a valid YouTube link",
          description: "Use a full YouTube URL like https://youtube.com/watch?v=...",
          variant: "destructive",
        });
        return;
      }
    } else if (creationMethod === "document") {
      if (!documentFile) {
        toast({
          title: "Upload document",
          description: "Please upload a document file.",
          variant: "destructive",
        });
        return;
      }
    }

    onContinue({
      title: requiresTitle ? title.trim() : "",
      description: description.trim(),
      targetAudience: targetAudience.trim(),
      highlights: highlights.filter((h) => h.trim()),
      creationMethod,
      textContent: creationMethod === "text" ? textContent.trim() : undefined,
      youtubeLink:
        creationMethod === "youtube" ? youtubeLink.trim() : undefined,
      documentFile: creationMethod === "document" ? documentFile : null,
    });
  };

  const handleHighlightChange = (index: number, value: string) => {
    setHighlights((prev) => {
      const next = [...prev];
      next[index] = value;
      return next;
    });
  };

  const addHighlight = () => {
    setHighlights((prev) => [...prev, ""]);
  };

  const removeHighlight = (index: number) => {
    setHighlights((prev) => prev.filter((_, i) => i !== index));
  };

  return (
    <div className="w-full max-w-4xl space-y-8">
      <div className="text-center space-y-3">
        <div className="inline-flex items-center gap-2 rounded-full border px-3 py-1 text-xs font-semibold uppercase tracking-[0.3em] text-muted-foreground">
          <Sparkles className="h-3 w-3 text-brand-600" />
          <span>Step 1 of 4</span>
        </div>
        <h1 className="text-3xl font-bold tracking-tight">
          Describe your project
        </h1>
        <p className="text-muted-foreground max-w-2xl mx-auto">
          Kick things off with a clear brief so the AI knows exactly what to design.
        </p>
      </div>

      <div className="space-y-6 border rounded-2xl p-6 shadow-sm bg-card/60">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <p className="text-xs uppercase tracking-[0.3em] text-muted-foreground">
              Creation method
            </p>
            <p className="text-base font-semibold">
              How do you want to get started?
            </p>
          </div>
          <Tabs
            value={creationMethod === "manual" ? "manual" : "ai"}
            onValueChange={(value) => {
              if (value === "manual") {
                setCreationMethod("manual");
              } else if (creationMethod === "manual") {
                // Default to YouTube when switching from manual to AI-powered
                setCreationMethod("youtube");
              }
            }}
            className="md:w-[240px]"
          >
            <TabsList className="grid grid-cols-2 w-full">
              <TabsTrigger value="ai">AI Powered</TabsTrigger>
              <TabsTrigger value="manual">Manual</TabsTrigger>
            </TabsList>
          </Tabs>
        </div>

        {creationMethod === "manual" ? (
          <div className="rounded-xl border bg-muted/30 p-4 flex items-start gap-3">
            <div className="p-2 rounded-full bg-primary/10 text-primary">
              <ClipboardList className="h-4 w-4" />
            </div>
            <div className="space-y-1">
              <p className="text-sm font-semibold">Manual brief</p>
              <p className="text-sm text-muted-foreground">
                Fill everything out yourself for maximum control over the story you want told.
              </p>
            </div>
          </div>
        ) : (
          <div className="rounded-xl border bg-background/60">
            <Tabs
              value={creationMethod}
              onValueChange={(value) =>
                setCreationMethod(value as CreationMethod)
              }
            >
              <TabsList className="grid grid-cols-3 w-full">
                <TabsTrigger value="youtube">YouTube</TabsTrigger>
                <TabsTrigger value="text">Text</TabsTrigger>
                <TabsTrigger value="document">Document</TabsTrigger>
              </TabsList>

              <div className="p-4 text-sm text-muted-foreground">
                {creationMethodCopy[creationMethod].description}
              </div>

              <TabsContent value="text" />
              <TabsContent value="youtube" />
              <TabsContent value="document" />
            </Tabs>
          </div>
        )}

        <div className="grid gap-6 lg:grid-cols-[minmax(0,2fr)]">
          <section className="space-y-6">
            {creationMethod === "youtube" ? (
              <div className="space-y-2">
                <label className="text-sm font-medium">Project Title</label>
                <p className="text-sm text-muted-foreground">
                  We’ll pull the title directly from the YouTube video.
                </p>
              </div>
            ) : (
              <div className="space-y-2">
                <label className="text-sm font-medium">Project Title</label>
                <Input
                  placeholder="e.g., Minecraft Survival Ep. 1"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  maxLength={150}
                />
              </div>
            )}

            {creationMethod === "manual" && (
              <>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Description</label>
                  <Textarea
                    rows={4}
                    placeholder="Describe what happens in your video..."
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium">
                    Target audience or persona
                  </label>
                  <Input
                    placeholder="e.g., Casual gamers who love survival guides"
                    value={targetAudience}
                    onChange={(e) => setTargetAudience(e.target.value)}
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium">Key highlights</label>
                  <div className="space-y-2">
                    {highlights.map((highlight, index) => (
                      <div key={`highlight-${index}`} className="flex gap-2">
                        <Input
                          placeholder={`Highlight ${index + 1}`}
                          value={highlight}
                          onChange={(e) =>
                            handleHighlightChange(index, e.target.value)
                          }
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
                      className="w-full"
                      onClick={addHighlight}
                    >
                      <Plus className="h-4 w-4 mr-2" />
                      Add highlight
                    </Button>
                  </div>
                </div>
              </>
            )}

            {creationMethod === "text" && (
              <div className="space-y-2">
                <label className="text-sm font-medium">Paste your content</label>
                <Textarea
                  rows={6}
                  placeholder="Paste your script or content here (100+ characters)"
                  value={textContent}
                  onChange={(e) => setTextContent(e.target.value)}
                />
              </div>
            )}

            {creationMethod === "youtube" && (
              <div className="space-y-2">
                <label className="text-sm font-medium">YouTube video URL</label>
                <Input
                  placeholder="https://youtube.com/watch?v=..."
                  value={youtubeLink}
                  onChange={(e) => setYoutubeLink(e.target.value)}
                />
              </div>
            )}

            {creationMethod === "document" && (
              <div className="space-y-2">
                <label className="text-sm font-medium">
                  Upload supporting document
                </label>
                <label
                  htmlFor="document-upload"
                  className={cn(
                    "flex items-center justify-between gap-4 border-2 border-dashed rounded-lg px-4 py-3 cursor-pointer transition-colors",
                    documentFile ? "border-primary/60" : "border-border"
                  )}
                >
                  <div className="flex items-center gap-3">
                    <Upload className="h-5 w-5 text-muted-foreground" />
                    <div>
                      <p className="text-sm font-medium">
                        {documentFile ? documentFile.name : "Upload document"}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        PDF, DOCX or TXT · 10MB max
                      </p>
                    </div>
                  </div>
                  <span className="text-sm text-primary">Browse</span>
                  <input
                    id="document-upload"
                    type="file"
                    accept=".pdf,.doc,.docx,.txt"
                    className="hidden"
                    onChange={(e) =>
                      setDocumentFile(e.target.files?.[0] || null)
                    }
                  />
                </label>
              </div>
            )}
          </section>
        </div>

        <div className="border-t pt-4 flex flex-col gap-3 sm:flex-row">
          <Button size="lg" className="w-full sm:w-auto" onClick={validateAndContinue}>
            Continue to image upload
          </Button>
        </div>
      </div>
    </div>
  );
}
