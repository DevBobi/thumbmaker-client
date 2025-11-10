"use client";
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
import { AdTemplate } from "@/contexts/AdContext";
import { useAuthFetch } from "@/hooks/use-auth-fetch";
import { toast } from "@/hooks/use-toast";
import { extractYouTubeThumbnail } from "@/lib/youtube";
import { zodResolver } from "@hookform/resolvers/zod";
import { Plus, Upload, Link2, Loader2, Download } from "lucide-react";
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
                      <TabsList className="grid w-full grid-cols-2">
                        <TabsTrigger value="youtube">
                          <Link2 className="h-4 w-4 mr-2" />
                          YouTube Link
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
                            <div className="border-2 border-dashed rounded-md p-4">
                              <img
                                src={imagePreview}
                                alt="Extracted thumbnail"
                                className="max-h-72 mx-auto rounded-md object-contain"
                              />
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

                      <TabsContent value="upload" className="mt-4">
                        <div className="space-y-2">
                          <div
                            className="flex flex-col items-center border-2 border-dashed rounded-md p-6 cursor-pointer"
                            onClick={() =>
                              document.getElementById("template-image")?.click()
                            }
                          >
                            {imagePreview ? (
                              <div className="w-full">
                                <img
                                  src={imagePreview}
                                  alt="Template preview"
                                  className="max-h-72 mx-auto rounded-md object-contain"
                                />
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

            {/* Creator Input (Auto-filled from YouTube) */}
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

            {/* Niche Selection (Auto-detected from YouTube) */}
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
            </div>

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
          </form>
        </Form>
      </SheetContent>
    </Sheet>
  );
};

export default TemplateCreator;
