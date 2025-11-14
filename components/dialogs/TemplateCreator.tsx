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
import { extractYouTubeThumbnail } from "@/lib/youtube";
import { zodResolver } from "@hookform/resolvers/zod";
import { Plus, Upload, Link2, Loader2, Download, ListPlus } from "lucide-react";
import React, { useState } from "react";
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
  const [activeTab, setActiveTab] = useState<string>("youtube");
  const [youtubeUrl, setYoutubeUrl] = useState<string>("");
  const [isExtractingThumbnail, setIsExtractingThumbnail] = useState(false);
  
  // Bulk import state
  const [bulkUrls, setBulkUrls] = useState<string>("");
  const [isBulkProcessing, setIsBulkProcessing] = useState(false);
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

  const handleExtractFromYouTube = async () => {
    if (!youtubeUrl.trim()) {
      toast({
        title: "YouTube URL required",
        description: "Please enter a valid YouTube URL",
        variant: "destructive",
      });
      return;
    }

    try {
      setIsExtractingThumbnail(true);

      const result = await extractYouTubeThumbnail(youtubeUrl);

      if (!result) {
        throw new Error("Failed to extract thumbnail");
      }

      const { file, title, channelName } = result;

      // Set the file and preview
      setTemplateImage(file);
      form.setValue("image", file, { shouldValidate: true });

      // Auto-fill creator name from channel
      if (channelName) {
        form.setValue("brand", channelName, { shouldValidate: true });
      }

      // Use AI to detect niche from title and channel
      if (title && channelName) {
        try {
          const nicheResponse = await authFetch("/api/templates/detect-niche", {
            method: "POST",
            body: JSON.stringify({
              title,
              channelName,
            }),
          });

          if (nicheResponse.ok) {
            const nicheData = await nicheResponse.json();
            if (nicheData.niche) {
              form.setValue("niche", nicheData.niche, { shouldValidate: true });
            }
          }
        } catch (error) {
          console.error("Failed to detect niche with AI:", error);
          // Fallback to default
          form.setValue("niche", "Entertainment", { shouldValidate: true });
        }
      }

      // Create preview
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);

      toast({
        title: "Thumbnail extracted",
        description: "Thumbnail and metadata extracted successfully",
      });
    } catch (error) {
      console.error("Error extracting YouTube thumbnail:", error);
      toast({
        title: "Extraction failed",
        description:
          error instanceof Error
            ? error.message
            : "Failed to extract thumbnail from YouTube URL",
        variant: "destructive",
      });
    } finally {
      setIsExtractingThumbnail(false);
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

  const handleBulkImport = async () => {
    if (!bulkUrls.trim()) {
      toast({
        title: "No URLs provided",
        description: "Please enter at least one YouTube URL",
        variant: "destructive",
      });
      return;
    }

    // Parse URLs from textarea (one per line)
    const urls = bulkUrls
      .split('\n')
      .map(url => url.trim())
      .filter(url => url.length > 0);

    if (urls.length === 0) {
      toast({
        title: "No valid URLs",
        description: "Please enter valid YouTube URLs",
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

        // Detect niche with AI
        let niche = "Entertainment";
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
            }
          } catch (error) {
            console.error("Failed to detect niche:", error);
          }
        }

        // Create template
        const response = await authFetch("/api/templates/create", {
          method: "POST",
          body: JSON.stringify({
            image: fileUrl,
            creator: channelName || "Unknown Creator",
            brand: channelName || "Unknown Creator",
            niche: niche,
          }),
        });

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.error || "Template creation failed");
        }

        const data = await response.json();

        // Call callback with new template
        if (onTemplateCreated) {
          const newTemplate = {
            id: data.id,
            image: data.image,
            creator: data.creator,
            brand: data.brand,
            niche: data.niche,
            tags: [data.brand, data.niche],
          };
          onTemplateCreated(newTemplate);
        }

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
    setYoutubeUrl("");
    setBulkUrls("");
    setBulkProgress(null);
    setActiveTab("youtube");
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
                      <TabsList className="grid w-full grid-cols-3">
                        <TabsTrigger value="youtube">
                          <Link2 className="h-4 w-4 mr-2" />
                          Single URL
                        </TabsTrigger>
                        <TabsTrigger value="bulk">
                          <ListPlus className="h-4 w-4 mr-2" />
                          Bulk Import
                        </TabsTrigger>
                        <TabsTrigger value="upload">
                          <Upload className="h-4 w-4 mr-2" />
                          Upload Image
                        </TabsTrigger>
                      </TabsList>

                      <TabsContent value="youtube" className="mt-4">
                        <div className="space-y-4">
                          <div className="flex gap-2">
                            <Input
                              placeholder="Paste YouTube video URL here..."
                              value={youtubeUrl}
                              onChange={(e) => setYoutubeUrl(e.target.value)}
                              onKeyDown={(e) => {
                                if (e.key === "Enter") {
                                  e.preventDefault();
                                  handleExtractFromYouTube();
                                }
                              }}
                              disabled={isExtractingThumbnail}
                            />
                            <Button
                              type="button"
                              onClick={handleExtractFromYouTube}
                              disabled={isExtractingThumbnail || !youtubeUrl.trim()}
                              className="shrink-0"
                            >
                              {isExtractingThumbnail ? (
                                <>
                                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                                  Extracting...
                                </>
                              ) : (
                                "Extract"
                              )}
                            </Button>
                          </div>

                          {imagePreview && (
                            <div className="border-2 border-dashed rounded-md p-4 flex justify-center">
                              <div className="relative w-full max-h-72" style={{ aspectRatio: '16/9' }}>
                                <Image
                                  src={imagePreview}
                                  alt="Extracted thumbnail"
                                  fill
                                  className="rounded-md object-contain"
                                  sizes="(max-width: 768px) 100vw, 600px"
                                />
                              </div>
                              <div className="flex items-center justify-between mt-3">
                                <p className="text-sm text-green-600 font-medium">
                                  ✓ Thumbnail and metadata extracted
                                </p>
                                <Button
                                  type="button"
                                  variant="outline"
                                  size="sm"
                                  onClick={handleDownloadThumbnail}
                                  className="gap-2"
                                >
                                  <Download className="h-4 w-4" />
                                  Download
                                </Button>
                              </div>
                            </div>
                          )}

                          {!imagePreview && (
                            <div className="border-2 border-dashed rounded-md p-6 text-center">
                              <Link2 className="h-12 w-12 text-muted-foreground mx-auto mb-2" />
                              <p className="text-muted-foreground">
                                Enter a YouTube URL to extract thumbnail
                              </p>
                              <p className="text-xs text-muted-foreground mt-1">
                                Supports youtube.com and youtu.be links
                              </p>
                              <p className="text-xs text-green-600 mt-2">
                                Creator name and niche will be auto-filled
                              </p>
                            </div>
                          )}
                        </div>
                      </TabsContent>

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
                              <p className="text-xs text-muted-foreground">
                                {bulkUrls.split('\n').filter(url => url.trim().length > 0).length} URL(s) detected
                              </p>
                              <Button
                                type="button"
                                onClick={handleBulkImport}
                                disabled={isBulkProcessing || !bulkUrls.trim()}
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

                          {/* Info Card */}
                          {!bulkProgress && (
                            <div className="border-2 border-dashed rounded-md p-6 text-center">
                              <ListPlus className="h-12 w-12 text-muted-foreground mx-auto mb-2" />
                              <p className="text-muted-foreground font-medium">
                                Bulk Import YouTube Thumbnails
                              </p>
                              <p className="text-xs text-muted-foreground mt-1">
                                Paste multiple YouTube URLs (one per line) to create templates in bulk
                              </p>
                              <div className="mt-3 space-y-1 text-xs text-left max-w-md mx-auto">
                                <p className="text-green-600">✓ Auto-extracts thumbnails</p>
                                <p className="text-green-600">✓ Auto-detects creator names</p>
                                <p className="text-green-600">✓ AI-powered niche detection</p>
                                <p className="text-green-600">✓ Creates templates automatically</p>
                              </div>
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

            {/* Creator Input (Auto-filled from YouTube) - Hidden for bulk import */}
            {activeTab !== "bulk" && (
            <FormField
              control={form.control}
              name="brand"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>
                    Creator <span className="text-red-500">*</span>
                    {imagePreview && (
                      <span className="ml-2 text-xs text-green-600 font-normal">
                        ✓ Auto-filled (editable)
                      </span>
                    )}
                  </FormLabel>
                  <FormControl>
                    <Input 
                      placeholder="Creator name (auto-filled from YouTube)" 
                      {...field} 
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            )}

            {/* Niche Selection (Auto-detected from YouTube) - Hidden for bulk import */}
            {activeTab !== "bulk" && (
            <FormField
              control={form.control}
              name="niche"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>
                    Niche <span className="text-red-500">*</span>
                    {imagePreview && field.value && (
                      <span className="ml-2 text-xs text-green-600 font-normal">
                        ✓ AI-detected (editable)
                      </span>
                    )}
                  </FormLabel>
                  <FormControl>
                    <Input 
                      placeholder="Niche (auto-detected from video)" 
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            )}
            </div>

            {/* Footer - Hidden for bulk import (bulk import has its own button) */}
            {activeTab !== "bulk" && (
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
