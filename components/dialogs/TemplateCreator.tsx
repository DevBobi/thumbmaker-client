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
import { Input } from "@/components/ui/input";
import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetFooter,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { AdTemplate } from "@/contexts/AdContext";
import { useAuthFetch } from "@/hooks/use-auth-fetch";
import { toast } from "@/hooks/use-toast";
import { extractYouTubeThumbnail, extractVideoId } from "@/lib/youtube";
import { zodResolver } from "@hookform/resolvers/zod";
import { Plus, Upload, Loader2, Download, ListPlus } from "lucide-react";
import React, { useMemo, useState } from "react";
import { useForm } from "react-hook-form";
import * as z from "zod";

interface TemplateCreatorProps {
  triggerClassName?: string;
  customTrigger?: React.ReactNode;
  onTemplateCreated?: (template: AdTemplate) => void;
}

const formSchema = z.object({
  brand: z.string().min(1, "Creator name is required"),
  niche: z.string().min(1, "Niche is required"),
  image: z
    .instanceof(File, { message: "Template image is required" })
    .nullable()
    .refine((file) => file !== null, {
      message: "Template image is required",
    }),
});

type FormValues = z.infer<typeof formSchema>;

const buildTagList = (...candidateGroups: Array<Array<string | null | undefined>>) => {
  const tags: string[] = [];
  const seen = new Set<string>();

  const addTags = (values: Array<string | null | undefined>) => {
    values.forEach((value) => {
      if (!value) return;
      const normalized = value.toString().replace(/\s+/g, " ").trim();
      
      // Skip if empty or too long (max 25 chars to keep badges clean)
      if (!normalized || normalized.length > 25) return;

      const key = normalized.toLowerCase();
      if (seen.has(key)) return;
      seen.add(key);
      tags.push(normalized);
    });
  };

  candidateGroups.forEach(addTags);
  return tags.slice(0, 6);
};

const TemplateCreator: React.FC<TemplateCreatorProps> = ({
  triggerClassName,
  customTrigger,
  onTemplateCreated,
}) => {
  const { authFetch } = useAuthFetch();
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [templateImage, setTemplateImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<string>("bulk");
  
  // Bulk import state
  const [bulkUrls, setBulkUrls] = useState<string>("");
  const [isBulkProcessing, setIsBulkProcessing] = useState(false);
  const [downloadingPreviewId, setDownloadingPreviewId] = useState<string | null>(null);
  const [bulkProgress, setBulkProgress] = useState<{
    total: number;
    current: number;
    succeeded: number;
    failed: number;
    results: Array<{ url: string; status: 'success' | 'failed'; message: string }>;
  } | null>(null);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      brand: "",
      niche: "",
      image: undefined,
    },
  });

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setTemplateImage(file);
      form.setValue("image", file, { shouldValidate: true });

      // Create preview
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleDownloadThumbnail = () => {
    if (!templateImage || !imagePreview) {
      toast({
        title: "No thumbnail to download",
        description: "Please extract a thumbnail first",
        variant: "destructive",
      });
      return;
    }

    try {
      // Create a download link
      const link = document.createElement("a");
      link.href = imagePreview;
      link.download = templateImage.name || "youtube-thumbnail.jpg";
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      toast({
        title: "Download started",
        description: "Your thumbnail is being downloaded",
      });
    } catch (error) {
      console.error("Error downloading thumbnail:", error);
      toast({
        title: "Download failed",
        description: "Failed to download the thumbnail",
        variant: "destructive",
      });
    }
  };

  // Validate YouTube URLs in bulk import
  const getValidYouTubeUrls = (urlsText: string): string[] => {
    if (!urlsText.trim()) return [];
    
    return urlsText
      .split('\n')
      .map(url => url.trim())
      .filter(url => url.length > 0 && extractVideoId(url) !== null);
  };

  const validYouTubeUrls = getValidYouTubeUrls(bulkUrls);
  const previewItems = useMemo(() => {
    return validYouTubeUrls
      .map((url, index) => {
        const videoId = extractVideoId(url);
        if (!videoId) {
          return null;
        }

        return {
          key: `${videoId}-${index}`,
          videoId,
          thumbnailUrl: `https://img.youtube.com/vi/${videoId}/hqdefault.jpg`,
          originalUrl: url,
        };
      })
      .filter(
        (
          item
        ): item is {
          key: string;
          videoId: string;
          thumbnailUrl: string;
          originalUrl: string;
        } => item !== null
      );
  }, [validYouTubeUrls]);

  const handleDownloadBulkPreview = async (videoId: string, thumbnailUrl: string) => {
    try {
      setDownloadingPreviewId(videoId);
      const response = await fetch(thumbnailUrl);

      if (!response.ok) {
        throw new Error("Failed to download preview image");
      }

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `youtube-thumbnail-${videoId}.jpg`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);

      toast({
        title: "Download started",
        description: "Preview thumbnail is downloading.",
      });
    } catch (error) {
      console.error("Failed to download preview thumbnail:", error);
      toast({
        title: "Download failed",
        description: "Unable to download the preview thumbnail.",
        variant: "destructive",
      });
    } finally {
      setDownloadingPreviewId(null);
    }
  };

  const handleBulkImport = async () => {
    // Get valid YouTube URLs
    const urls = getValidYouTubeUrls(bulkUrls);

    if (urls.length === 0) {
      toast({
        title: "No valid YouTube URLs",
        description: "Please enter at least one valid YouTube URL (youtube.com or youtu.be)",
        variant: "destructive",
      });
      return;
    }

    setIsBulkProcessing(true);
    setBulkProgress({
      total: urls.length,
      current: 0,
      succeeded: 0,
      failed: 0,
      results: [],
    });

    const results: Array<{ url: string; status: 'success' | 'failed'; message: string }> = [];
    let succeeded = 0;
    let failed = 0;

    for (let i = 0; i < urls.length; i++) {
      const url = urls[i];
      
      try {
        // Update progress
        setBulkProgress(prev => prev ? { ...prev, current: i + 1 } : null);

        // Extract thumbnail and metadata
        const result = await extractYouTubeThumbnail(url);

        if (!result) {
          throw new Error("Failed to extract thumbnail");
        }

        const { file, title, channelName } = result;

        // Upload to storage
        const formData = new FormData();
        formData.append("file", file);
        const { fileUrl } = await uploadToStorage(formData);

        // Detect niche with AI + generate tags
        let niche = "Entertainment";
        let aiTags: string[] = [];
        if (title && channelName) {
          try {
            const nicheResponse = await authFetch("/api/templates/detect-niche", {
              method: "POST",
              body: JSON.stringify({ title, channelName }),
            });

            if (nicheResponse.ok) {
              const nicheData = await nicheResponse.json();
              if (nicheData.niche) {
                niche = nicheData.niche;
              }
              if (Array.isArray(nicheData.tags)) {
                aiTags = buildTagList(nicheData.tags);
              }
            }
          } catch (error) {
            console.error("Failed to detect niche:", error);
          }
        }

        const fallbackTags = buildTagList(aiTags, [niche, channelName]);
        const finalTags = fallbackTags.length > 0 ? fallbackTags : ["General"];

        const cleanedTitle =
          title?.trim() || channelName || "YouTube Template";
        const cleanedDescription = title
          ? `Imported from YouTube video: ${title.trim()}`
          : channelName
          ? `Imported from YouTube channel: ${channelName.trim()}`
          : "Imported from YouTube";

        // Create template
        const response = await authFetch("/api/templates/create", {
          method: "POST",
          body: JSON.stringify({
            image: fileUrl,
            creator: channelName || "Unknown Creator",
            brand: channelName || "Unknown Creator",
            niche: niche,
            tags: finalTags,
            title: cleanedTitle.slice(0, 200),
            description: cleanedDescription.slice(0, 300),
          }),
        });

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.error || "Template creation failed");
        }

        // Note: We don't call onTemplateCreated here for bulk import
        // It will be called once after all templates are processed if at least one succeeded

        succeeded++;
        results.push({
          url,
          status: 'success',
          message: `Created template for ${channelName || 'video'}`,
        });

        // Update progress
        setBulkProgress(prev => prev ? { ...prev, succeeded } : null);

      } catch (error) {
        failed++;
        const errorMessage = error instanceof Error ? error.message : "Unknown error";
        results.push({
          url,
          status: 'failed',
          message: errorMessage,
        });

        // Update progress
        setBulkProgress(prev => prev ? { ...prev, failed } : null);

        console.error(`Failed to process ${url}:`, error);
      }
    }

    // Update final progress
    setBulkProgress(prev => prev ? { ...prev, results } : null);
    setIsBulkProcessing(false);

    // Show summary toast
    toast({
      title: "Bulk import completed",
      description: `Successfully created ${succeeded} template(s). ${failed > 0 ? `Failed: ${failed}` : ''}`,
      variant: failed > 0 ? "default" : "default",
    });

    // Switch to user templates tab if at least one template was successfully created
    if (succeeded > 0 && onTemplateCreated) {
      // Call callback once to trigger tab switch in parent component
      // Pass a dummy template since we just want to trigger the tab switch
      onTemplateCreated({
        id: "",
        image: "",
        brand: "",
        niche: "",
        tags: [],
      });
    }
  };

  const handleCreateTemplate = async (values: FormValues) => {
    try {
      setIsLoading(true);

      // Check if image exists before proceeding
      if (!values.image) {
        toast({
          title: "Missing image",
          description: "Please upload a template image",
        });
        setIsLoading(false);
        return;
      }

      console.log(values.image);

      const formData = new FormData();
      formData.append("file", values.image);

      const { fileUrl } = await uploadToStorage(formData);

      // Create new template
      const response = await authFetch("/api/templates/create", {
        method: "POST",
        body: JSON.stringify({
          image: fileUrl,
          creator: values.brand,
          brand: values.brand,
          niche: values.niche,
          tags: buildTagList([values.brand], [values.niche]),
          title: values.brand.slice(0, 200),
          description: values.niche.slice(0, 300),
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Template creation failed");
      }

      const data = await response.json();

      // Create the template object
      const newTemplate = {
        id: data.id,
        image: data.image,
        creator: data.creator,
        brand: data.brand,
        niche: data.niche,
        tags: [data.brand, data.niche],
      };

      // Call the context function
      // createCustomTemplate(newTemplate);

      // Call the callback if provided
      if (onTemplateCreated) {
        onTemplateCreated(newTemplate);
      }

      toast({
        title: "Template created",
        description: "Your new template has been added to the gallery",
      });

      // Close dialog and reset form
      setIsOpen(false);
      resetForm();
    } catch (error) {
      console.error("Error creating template:", error);
      toast({
        title: "Template creation failed",
        description: "Please try again",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleOpenChange = (open: boolean) => {
    setIsOpen(open);
    if (!open) {
      resetForm();
    }
  };

  const resetForm = () => {
    setTemplateImage(null);
    setImagePreview(null);
    setBulkUrls("");
    setBulkProgress(null);
    setActiveTab("bulk");
    form.reset();
  };

  return (
    <Sheet open={isOpen} onOpenChange={handleOpenChange}>
      <SheetTrigger asChild>
        {customTrigger || (
          <Button
            variant="outline"
            className={`gap-2 ${triggerClassName || ""}`}
          >
            <Plus className="h-4 w-4" />
            Create a Template
          </Button>
        )}
      </SheetTrigger>
      <SheetContent className="sm:max-w-[600px] overflow-y-auto" side="right">
        <SheetHeader>
          <SheetTitle>Create New Template</SheetTitle>
        </SheetHeader>

        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(handleCreateTemplate)}
            className="flex flex-col h-full"
          >
            <div className="flex-1 space-y-6 px-4 py-6">
            {/* Image Upload with Tabs */}
            <FormField
              control={form.control}
              name="image"
              // eslint-disable-next-line @typescript-eslint/no-unused-vars
              render={({ field: { onChange, value, ...rest } }) => (
                <FormItem>
                  <FormLabel>
                    Template Image <span className="text-red-500">*</span>
                  </FormLabel>
                  <FormControl>
                    <Tabs
                      value={activeTab}
                      onValueChange={setActiveTab}
                      className="w-full"
                    >
                      <TabsList className="grid w-full grid-cols-2">
                        <TabsTrigger value="bulk">
                          <ListPlus className="h-4 w-4 mr-2" />
                          Bulk Import
                        </TabsTrigger>
                        <TabsTrigger value="upload">
                          <Upload className="h-4 w-4 mr-2" />
                          Upload Image
                        </TabsTrigger>
                      </TabsList>

                      <TabsContent value="bulk" className="mt-4">
                        <div className="space-y-4">
                          <div className="space-y-2">
                            <Textarea
                              placeholder="Paste multiple YouTube URLs here (one per line)&#10;Example:&#10;https://www.youtube.com/watch?v=abc123&#10;https://youtu.be/def456&#10;https://www.youtube.com/watch?v=ghi789"
                              value={bulkUrls}
                              onChange={(e) => setBulkUrls(e.target.value)}
                              disabled={isBulkProcessing}
                              className="min-h-[150px] font-mono text-sm"
                            />
                            <div className="flex items-center justify-between">
                              <div className="flex flex-col gap-1">
                                <p className="text-xs text-muted-foreground">
                                  {validYouTubeUrls.length > 0 ? (
                                    <span className="text-green-600 font-medium">
                                      {validYouTubeUrls.length} valid YouTube URL(s)
                                    </span>
                                  ) : bulkUrls.trim() ? (
                                    <span className="text-red-600 font-medium">
                                      No valid YouTube URLs found
                                    </span>
                                  ) : (
                                    "Enter YouTube URLs (one per line)"
                                  )}
                                </p>
                                {bulkUrls.split('\n').filter(url => url.trim().length > 0).length > validYouTubeUrls.length && bulkUrls.trim() && (
                                  <p className="text-xs text-amber-600">
                                    {bulkUrls.split('\n').filter(url => url.trim().length > 0).length - validYouTubeUrls.length} invalid URL(s) will be skipped
                                  </p>
                                )}
                              </div>
                              <Button
                                type="button"
                                onClick={handleBulkImport}
                                disabled={isBulkProcessing || validYouTubeUrls.length === 0}
                              >
                                {isBulkProcessing ? (
                                  <>
                                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                                    Processing...
                                  </>
                                ) : (
                                  <>
                                    <ListPlus className="h-4 w-4 mr-2" />
                                    Import All
                                  </>
                                )}
                              </Button>
                            </div>
                          </div>

                          {previewItems.length > 0 && (
                            <div className="space-y-2">
                              <p className="text-xs text-muted-foreground">
                                Preview thumbnails ({previewItems.length})
                              </p>
                              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                {previewItems.map((item) => (
                                  <div
                                    key={item.key}
                                    className="relative border rounded-md overflow-hidden"
                                  >
                                    <div className="relative w-full aspect-video bg-muted">
                                      <Image
                                        src={item.thumbnailUrl}
                                        alt="YouTube thumbnail preview"
                                        fill
                                        className="object-cover"
                                        sizes="400px"
                                        unoptimized
                                      />
                                    </div>
                                    <Button
                                      type="button"
                                      size="icon"
                                      variant="secondary"
                                      className="absolute top-3 right-3 rounded-full shadow-lg"
                                      onClick={() =>
                                        handleDownloadBulkPreview(item.videoId, item.thumbnailUrl)
                                      }
                                      disabled={downloadingPreviewId === item.videoId}
                                    >
                                      {downloadingPreviewId === item.videoId ? (
                                        <Loader2 className="h-4 w-4 animate-spin" />
                                      ) : (
                                        <Download className="h-4 w-4" />
                                      )}
                                    </Button>
                                  </div>
                                ))}
                              </div>
                            </div>
                          )}

                          {/* Progress Display */}
                          {bulkProgress && (
                            <div className="border rounded-md p-4 space-y-3">
                              <div className="space-y-2">
                                <div className="flex items-center justify-between text-sm">
                                  <span className="font-medium">
                                    Progress: {bulkProgress.current} / {bulkProgress.total}
                                  </span>
                                  <span className="text-muted-foreground">
                                    {Math.round((bulkProgress.current / bulkProgress.total) * 100)}%
                                  </span>
                                </div>
                                <div className="w-full bg-muted rounded-full h-2 overflow-hidden">
                                  <div
                                    className="bg-blue-600 h-full transition-all duration-300"
                                    style={{
                                      width: `${(bulkProgress.current / bulkProgress.total) * 100}%`,
                                    }}
                                  />
                                </div>
                                <div className="flex items-center gap-4 text-xs">
                                  <span className="text-green-600 font-medium">
                                    ✓ Succeeded: {bulkProgress.succeeded}
                                  </span>
                                  {bulkProgress.failed > 0 && (
                                    <span className="text-red-600 font-medium">
                                      ✗ Failed: {bulkProgress.failed}
                                    </span>
                                  )}
                                </div>
                              </div>

                              {/* Results List */}
                              {bulkProgress.results.length > 0 && (
                                <div className="space-y-1 max-h-[200px] overflow-y-auto">
                                  <p className="text-xs font-medium text-muted-foreground">Results:</p>
                                  {bulkProgress.results.map((result, index) => (
                                    <div
                                      key={index}
                                      className={`text-xs p-2 rounded ${
                                        result.status === 'success'
                                          ? 'bg-green-50 text-green-800 border border-green-200'
                                          : 'bg-red-50 text-red-800 border border-red-200'
                                      }`}
                                    >
                                      <div className="font-medium truncate">
                                        {result.status === 'success' ? '✓' : '✗'} {result.message}
                                      </div>
                                      <div className="text-[10px] opacity-70 truncate mt-0.5">
                                        {result.url}
                                      </div>
                                    </div>
                                  ))}
                                </div>
                              )}
                            </div>
                          )}
                        </div>
                      </TabsContent>

                      <TabsContent value="upload" className="mt-4">
                        <div className="space-y-2">
                          <div
                            className="flex flex-col items-center border-2 border-dashed rounded-md p-6 cursor-pointer"
                            onClick={() =>
                              document.getElementById("template-image")?.click()
                            }
                          >
                            {imagePreview ? (
                              <div className="w-full flex justify-center">
                                <div className="relative w-full max-h-72" style={{ aspectRatio: '16/9' }}>
                                  <Image
                                    src={imagePreview}
                                    alt="Template preview"
                                    fill
                                    className="rounded-md object-contain"
                                    sizes="(max-width: 768px) 100vw, 600px"
                                  />
                                </div>
                                <p className="text-sm text-muted-foreground text-center mt-2">
                                  Click to change image
                                </p>
                              </div>
                            ) : (
                              <div className="flex flex-col items-center">
                                <Upload className="h-12 w-12 text-muted-foreground mb-2" />
                                <p className="text-muted-foreground">
                                  Click to upload template image
                                </p>
                                <p className="text-xs text-muted-foreground mt-1">
                                  JPG, PNG, SVG formats accepted
                                </p>
                              </div>
                            )}
                            <Input
                              id="template-image"
                              type="file"
                              className="hidden"
                              accept="image/jpeg,image/png,image/svg+xml"
                              onChange={(e) => {
                                handleImageChange(e);
                                onChange(e.target.files?.[0] || null);
                              }}
                              {...rest}
                            />
                          </div>
                          {imagePreview && (
                            <div className="flex justify-end">
                              <Button
                                type="button"
                                variant="outline"
                                size="sm"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleDownloadThumbnail();
                                }}
                                className="gap-2"
                              >
                                <Download className="h-4 w-4" />
                                Download
                              </Button>
                            </div>
                          )}
                        </div>
                      </TabsContent>
                    </Tabs>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Creator Input - Only shown for upload tab */}
            {activeTab === "upload" && (
            <FormField
              control={form.control}
              name="brand"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>
                    Creator <span className="text-red-500">*</span>
                  </FormLabel>
                  <FormControl>
                    <Input 
                      placeholder="Creator name" 
                      {...field} 
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            )}

            {/* Niche Selection - Only shown for upload tab */}
            {activeTab === "upload" && (
            <FormField
              control={form.control}
              name="niche"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>
                    Niche <span className="text-red-500">*</span>
                  </FormLabel>
                  <FormControl>
                    <Input 
                      placeholder="Niche" 
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            )}
            </div>

            {/* Footer - Only shown for upload tab (bulk import has its own button) */}
            {activeTab === "upload" && (
            <SheetFooter className="flex-row gap-2">
              <SheetClose asChild>
                <Button variant="outline" type="button" className="flex-1">
                  Cancel
                </Button>
              </SheetClose>
              <Button variant="brand" type="submit" disabled={isLoading} className="flex-1">
                {isLoading ? "Creating..." : "Create Template"}
              </Button>
            </SheetFooter>
            )}
          </form>
        </Form>
      </SheetContent>
    </Sheet>
  );
};

export default TemplateCreator;
