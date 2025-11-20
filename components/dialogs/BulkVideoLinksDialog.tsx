"use client";

import React, { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Loader2, Link2, Video, CheckCircle2, XCircle, Sparkles } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { CREDIT_BLOCK_MESSAGE } from "@/constants/credits";
import { extractYouTubeThumbnail } from "@/lib/youtube";
import Image from "next/image";
import { TemplateSelector } from "./TemplateSelector";
import { AdTemplate } from "@/contexts/AdContext";
import { useAuthFetch } from "@/hooks/use-auth-fetch";

interface VideoData {
  url: string;
  title: string;
  channelName: string;
  thumbnail: string;
  status: "pending" | "processing" | "success" | "error";
  error?: string;
}

interface BulkVideoLinksDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  projectId?: string;
  onSuccess?: () => void;
}

export const BulkVideoLinksDialog: React.FC<BulkVideoLinksDialogProps> = ({
  open,
  onOpenChange,
  projectId,
  onSuccess,
}) => {
  const { toast } = useToast();
  const { authFetch } = useAuthFetch();
  const [activeTab, setActiveTab] = useState<"links" | "templates" | "generate">("links");
  const [bulkUrls, setBulkUrls] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);
  const [videos, setVideos] = useState<VideoData[]>([]);
  const [selectedTemplates, setSelectedTemplates] = useState<AdTemplate[]>([]);
  const [isGenerating, setIsGenerating] = useState(false);
  const [generationProgress, setGenerationProgress] = useState({
    total: 0,
    current: 0,
    succeeded: 0,
    failed: 0,
  });

  const handleExtractVideos = async () => {
    const urls = bulkUrls
      .split("\n")
      .map((url) => url.trim())
      .filter((url) => url.length > 0);

    if (urls.length === 0) {
      toast({
        title: "No URLs provided",
        description: "Please enter at least one YouTube URL",
        variant: "destructive",
      });
      return;
    }

    if (urls.length > 5) {
      toast({
        title: "Too many URLs",
        description: "Please limit to 5 URLs at a time",
        variant: "destructive",
      });
      return;
    }

    setIsProcessing(true);
    const extractedVideos: VideoData[] = [];

    for (const url of urls) {
      try {
        const result = await extractYouTubeThumbnail(url);
        if (result) {
          extractedVideos.push({
            url,
            title: result.title || "Untitled Video",
            channelName: result.channelName || "",
            thumbnail: URL.createObjectURL(result.file),
            status: "success",
          });
        } else {
          extractedVideos.push({
            url,
            title: "Failed to extract",
            channelName: "",
            thumbnail: "",
            status: "error",
            error: "Failed to extract video data",
          });
        }
      } catch (error) {
        extractedVideos.push({
          url,
          title: "Failed to extract",
          channelName: "",
          thumbnail: "",
          status: "error",
          error: error instanceof Error ? error.message : "Unknown error",
        });
      }
    }

    setVideos(extractedVideos);
    setIsProcessing(false);

    const successCount = extractedVideos.filter((v) => v.status === "success").length;
    if (successCount > 0) {
      toast({
        title: "Videos extracted",
        description: `Successfully extracted ${successCount} video(s)`,
      });
      setActiveTab("templates");
    } else {
      toast({
        title: "Extraction failed",
        description: "Failed to extract any videos. Please check the URLs.",
        variant: "destructive",
      });
    }
  };

  const handleTemplateSelection = (templates: AdTemplate[]) => {
    setSelectedTemplates(templates);
  };

  const handleProceedToGeneration = () => {
    if (selectedTemplates.length === 0) {
      toast({
        title: "No templates selected",
        description: "Please select at least one template",
        variant: "destructive",
      });
      return;
    }

    const successfulVideos = videos.filter((v) => v.status === "success");
    if (successfulVideos.length === 0) {
      toast({
        title: "No videos available",
        description: "Please add videos first",
        variant: "destructive",
      });
      return;
    }

    setActiveTab("generate");
  };

  const handleGenerateThumbnails = async () => {
    if (!projectId) {
      toast({
        title: "No project selected",
        description: "Please select a project first",
        variant: "destructive",
      });
      return;
    }

    const successfulVideos = videos.filter((v) => v.status === "success");
    const totalThumbnails = successfulVideos.length * selectedTemplates.length;

    setIsGenerating(true);
    setGenerationProgress({
      total: totalThumbnails,
      current: 0,
      succeeded: 0,
      failed: 0,
    });

    let succeeded = 0;
    let failed = 0;
    let current = 0;

    // Generate thumbnails for each video-template combination
    for (const video of successfulVideos) {
      for (const template of selectedTemplates) {
        try {
          current++;
          setGenerationProgress((prev) => ({ ...prev, current }));

          // Call API to generate thumbnail for this specific video-template pair
          const response = await authFetch("/api/thumbnails/create", {
            method: "POST",
            body: JSON.stringify({
              projectId,
              templates: [template.id], // Single template per request
              youtubeLinks: [video.url], // Single video per request
              channelStyle: "professional & educational",
              thumbnailGoal: "clickbait & curiosity",
              additionalInstructions: `Video Title: ${video.title}\nChannel: ${video.channelName}`,
              variations: 1,
              mediaFiles: [],
            }),
          });

          if (response.ok) {
            succeeded++;
            setGenerationProgress((prev) => ({ ...prev, succeeded }));
          } else {
            const errorData = await response.json().catch(() => ({}));
            console.error("Failed to generate thumbnail:", errorData);
            failed++;
            setGenerationProgress((prev) => ({ ...prev, failed }));
            
            const message =
              response.status === 402
                ? errorData.error || CREDIT_BLOCK_MESSAGE
                : errorData.error || `Failed: ${video.title} + ${template.brand}`;

            toast({
              title: "Generation failed",
              description: message,
              variant: "destructive",
            });
          }
        } catch (error) {
          console.error("Failed to generate thumbnail:", error);
          failed++;
          setGenerationProgress((prev) => ({ ...prev, failed }));
        }

        // Add a small delay between requests to avoid overwhelming the server
        await new Promise(resolve => setTimeout(resolve, 500));
      }
    }

    setIsGenerating(false);

    toast({
      title: "Generation complete",
      description: `Successfully queued ${succeeded} thumbnail(s) for generation. ${failed > 0 ? `Failed: ${failed}` : ""}`,
    });

    if (succeeded > 0 && onSuccess) {
      onSuccess();
    }

    // Reset and close
    setTimeout(() => {
      handleReset();
      onOpenChange(false);
    }, 2000);
  };

  const handleReset = () => {
    setBulkUrls("");
    setVideos([]);
    setSelectedTemplates([]);
    setActiveTab("links");
    setGenerationProgress({ total: 0, current: 0, succeeded: 0, failed: 0 });
  };

  const successfulVideos = videos.filter((v) => v.status === "success");

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-5xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Add YouTube Links & Generate Thumbnails</DialogTitle>
          <DialogDescription>
            Add multiple YouTube video links, select templates, and generate thumbnails in bulk
          </DialogDescription>
        </DialogHeader>

        <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as any)} className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="links" disabled={isProcessing || isGenerating}>
              <Link2 className="h-4 w-4 mr-2" />
              1. Add Links
            </TabsTrigger>
            <TabsTrigger value="templates" disabled={videos.length === 0 || isGenerating}>
              <Video className="h-4 w-4 mr-2" />
              2. Select Templates
            </TabsTrigger>
            <TabsTrigger value="generate" disabled={selectedTemplates.length === 0 || isGenerating}>
              <Sparkles className="h-4 w-4 mr-2" />
              3. Generate
            </TabsTrigger>
          </TabsList>

          <TabsContent value="links" className="space-y-4 mt-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">
                Paste YouTube URLs (one per line, max 5)
              </label>
              <Textarea
                placeholder="https://www.youtube.com/watch?v=abc123&#10;https://youtu.be/def456&#10;https://www.youtube.com/watch?v=ghi789"
                value={bulkUrls}
                onChange={(e) => setBulkUrls(e.target.value)}
                disabled={isProcessing}
                className="min-h-[150px] font-mono text-sm"
              />
              <div className="flex items-center justify-between">
                <p className="text-xs text-muted-foreground">
                  {bulkUrls.split("\n").filter((url) => url.trim().length > 0).length} URL(s) detected
                </p>
              </div>
            </div>

            {videos.length > 0 && (
              <div className="space-y-2">
                <label className="text-sm font-medium">Extracted Videos</label>
                <div className="grid grid-cols-1 gap-2 max-h-[300px] overflow-y-auto">
                  {videos.map((video, index) => (
                    <div
                      key={index}
                      className={`flex items-center gap-3 p-3 rounded-lg border ${
                        video.status === "success"
                          ? "bg-green-50 border-green-200"
                          : "bg-red-50 border-red-200"
                      }`}
                    >
                      {video.status === "success" && video.thumbnail && (
                        <div className="relative w-24 h-16 flex-shrink-0 rounded overflow-hidden">
                          <Image
                            src={video.thumbnail}
                            alt={video.title}
                            fill
                            className="object-cover"
                          />
                        </div>
                      )}
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium truncate">{video.title}</p>
                        {video.channelName && (
                          <p className="text-xs text-muted-foreground truncate">
                            {video.channelName}
                          </p>
                        )}
                        {video.error && (
                          <p className="text-xs text-red-600">{video.error}</p>
                        )}
                      </div>
                      {video.status === "success" ? (
                        <CheckCircle2 className="h-5 w-5 text-green-600 flex-shrink-0" />
                      ) : (
                        <XCircle className="h-5 w-5 text-red-600 flex-shrink-0" />
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div className="flex gap-2 justify-end">
              {videos.length > 0 && (
                <Button variant="outline" onClick={handleReset} disabled={isProcessing}>
                  Reset
                </Button>
              )}
              <Button onClick={handleExtractVideos} disabled={isProcessing || !bulkUrls.trim()}>
                {isProcessing ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Extracting...
                  </>
                ) : (
                  <>
                    <Link2 className="h-4 w-4 mr-2" />
                    Extract Videos
                  </>
                )}
              </Button>
              {successfulVideos.length > 0 && (
                <Button onClick={() => setActiveTab("templates")} variant="brand">
                  Next: Select Templates
                </Button>
              )}
            </div>
          </TabsContent>

          <TabsContent value="templates" className="space-y-4 mt-4">
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label className="text-sm font-medium">
                  Select Templates ({selectedTemplates.length} selected)
                </label>
                <p className="text-xs text-muted-foreground">
                  {successfulVideos.length} video(s) × {selectedTemplates.length} template(s) ={" "}
                  {successfulVideos.length * selectedTemplates.length} thumbnail(s)
                </p>
              </div>
              <TemplateSelector
                selectedTemplates={selectedTemplates}
                onSelectionChange={handleTemplateSelection}
              />
            </div>

            <div className="flex gap-2 justify-end">
              <Button variant="outline" onClick={() => setActiveTab("links")}>
                Back
              </Button>
              <Button
                onClick={handleProceedToGeneration}
                disabled={selectedTemplates.length === 0}
                variant="brand"
              >
                Next: Generate Thumbnails
              </Button>
            </div>
          </TabsContent>

          <TabsContent value="generate" className="space-y-4 mt-4">
            <div className="space-y-4">
              <div className="bg-muted/50 rounded-lg p-4 space-y-3">
                <h3 className="font-medium">Generation Summary</h3>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <p className="text-muted-foreground">Videos</p>
                    <p className="font-medium">{successfulVideos.length}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Templates</p>
                    <p className="font-medium">{selectedTemplates.length}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Total Thumbnails</p>
                    <p className="font-medium">
                      {successfulVideos.length * selectedTemplates.length}
                    </p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Project</p>
                    <p className="font-medium">{projectId || "Not selected"}</p>
                  </div>
                </div>
              </div>

              {isGenerating && (
                <div className="border rounded-lg p-4 space-y-3">
                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-sm">
                      <span className="font-medium">
                        Progress: {generationProgress.current} / {generationProgress.total}
                      </span>
                      <span className="text-muted-foreground">
                        {Math.round((generationProgress.current / generationProgress.total) * 100)}%
                      </span>
                    </div>
                    <div className="w-full bg-muted rounded-full h-2 overflow-hidden">
                      <div
                        className="bg-brand-600 h-full transition-all duration-300"
                        style={{
                          width: `${(generationProgress.current / generationProgress.total) * 100}%`,
                        }}
                      />
                    </div>
                    <div className="flex items-center gap-4 text-xs">
                      <span className="text-green-600 font-medium">
                        ✓ Succeeded: {generationProgress.succeeded}
                      </span>
                      {generationProgress.failed > 0 && (
                        <span className="text-red-600 font-medium">
                          ✗ Failed: {generationProgress.failed}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              )}

              <div className="flex gap-2 justify-end">
                <Button
                  variant="outline"
                  onClick={() => setActiveTab("templates")}
                  disabled={isGenerating}
                >
                  Back
                </Button>
                <Button
                  onClick={handleGenerateThumbnails}
                  disabled={isGenerating || !projectId}
                  variant="brand"
                >
                  {isGenerating ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Generating...
                    </>
                  ) : (
                    <>
                      <Sparkles className="h-4 w-4 mr-2" />
                      Generate All Thumbnails
                    </>
                  )}
                </Button>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
};

