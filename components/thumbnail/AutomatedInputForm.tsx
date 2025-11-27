import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  FormDescription,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { useRouter } from "next/navigation";
import { useToast } from "@/components/ui/use-toast";
import { uploadToStorage } from "@/actions/upload";
import { useAuthFetch } from "@/hooks/use-auth-fetch";
import LogoUpload from "@/components/products/LogoUpload";

const formSchema = z
  .object({
    videoTitle: z.string().min(1, "Video title is required"),
    scriptContent: z.string().optional(),
    youtubeLink: z.string().optional(),
    documentFile: z.any().optional(),
  })
  .refine(
    (data) => {
      // Ensure at least one input method is provided
      return data.scriptContent || data.youtubeLink || data.documentFile;
    },
    {
      message:
        "Please provide content through text, YouTube link, or document upload",
      path: ["scriptContent"],
    }
  );

interface AutomatedInputFormProps {
  defaultTab?: "text" | "youtube" | "document";
}

const AutomatedInputForm = ({ defaultTab = "text" }: AutomatedInputFormProps) => {
  const [isGenerating, setIsGenerating] = useState(false);
  const [activeTab, setActiveTab] = useState<"text" | "youtube" | "document">(defaultTab);
  const [documentFile, setDocumentFile] = useState<File | null>(null);
  const [logo, setLogo] = useState<File | null>(null);
  const [logoPreview, setLogoPreview] = useState<string | null>(null);
  const router = useRouter();
  const { toast } = useToast();
  const { authFetch } = useAuthFetch();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      videoTitle: "",
      scriptContent: "",
      youtubeLink: "",
    },
  });

  const handleAutoGenerate = async (values: z.infer<typeof formSchema>) => {
    try {
      setIsGenerating(true);

      if (!values.videoTitle) {
        toast({
          title: "Input required",
          description: "Please enter a video title.",
          variant: "destructive",
        });
        return;
      }

      if (activeTab === "text") {
        if (!values.scriptContent) {
          toast({
            title: "Input required",
            description: "Please enter script content.",
            variant: "destructive",
          });
          return;
        }

        if (values.scriptContent.length < 100) {
          toast({
            title: "Input required",
            description: "Script content must be at least 100 characters.",
            variant: "destructive",
          });
          return;
        }

        // Upload logo if provided
        let imageUrl = null;
        if (logo) {
          const formData = new FormData();
          formData.append("file", logo);
          
          const uploadResult = await uploadToStorage(formData);
          
          if (!uploadResult.success || !uploadResult.fileUrl) {
            throw new Error(uploadResult.error || "Failed to upload image");
          }
          
          imageUrl = uploadResult.fileUrl;
        }

        const response = await authFetch("/projects/create-with-text", {
          method: "POST",
          body: JSON.stringify({
            title: values.videoTitle,
            content: values.scriptContent,
            image: imageUrl,
          }),
        });

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(
            errorData.error || "Failed to create project from text"
          );
        }

        const data = await response.json();

        toast({
          title: "Project created",
          description:
            "Your project has been automatically generated from the provided information.",
        });

        router.push(`/dashboard/create-project/edit/${data.id}`);
        return;
      }

      if (activeTab === "youtube") {
        if (!values.youtubeLink) {
          toast({
            title: "Input required",
            description: "Please enter a valid YouTube URL.",
            variant: "destructive",
          });
          return;
        }

        // Upload logo if provided
        let imageUrl = null;
        if (logo) {
          const formData = new FormData();
          formData.append("file", logo);
          
          const uploadResult = await uploadToStorage(formData);
          
          if (!uploadResult.success || !uploadResult.fileUrl) {
            throw new Error(uploadResult.error || "Failed to upload image");
          }
          
          imageUrl = uploadResult.fileUrl;
        }

        const response = await authFetch("/projects/create-with-youtube", {
          method: "POST",
          body: JSON.stringify({
            title: values.videoTitle,
            youtubeLink: values.youtubeLink,
            image: imageUrl,
          }),
        });

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(
            errorData.error || "Failed to create project from YouTube"
          );
        }

        const data = await response.json();

        toast({
          title: "Project created",
          description:
            "Your project has been automatically generated from the YouTube video.",
        });

        router.push(`/dashboard/create-project/edit/${data.id}`);
        return;
      }

      if (activeTab === "document") {
        if (!documentFile) {
          toast({
            title: "Input required",
            description: "Please upload a document.",
            variant: "destructive",
          });
          return;
        }

        // Check document size (5MB limit)
        if (documentFile.size > 5 * 1024 * 1024) {
          toast({
            title: "File too large",
            description: "Please upload a file smaller than 5MB.",
            variant: "destructive",
          });
          return;
        }

        // Upload logo if provided
        let imageUrl = null;
        if (logo) {
          const formData = new FormData();
          formData.append("file", logo);
          
          const uploadResult = await uploadToStorage(formData);
          
          if (!uploadResult.success || !uploadResult.fileUrl) {
            throw new Error(uploadResult.error || "Failed to upload image");
          }
          
          imageUrl = uploadResult.fileUrl;
        }

        const documentFormData = new FormData();
        documentFormData.append("file", documentFile);

        const { success: documentSuccess, fileUrl: documentUrl } =
          await uploadToStorage(documentFormData);

        if (!documentSuccess) {
          throw new Error("Failed to upload document");
        }

        const response = await authFetch("/projects/create-with-document", {
          method: "POST",
          body: JSON.stringify({
            title: values.videoTitle,
            document: documentUrl,
            image: imageUrl,
          }),
        });

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(
            errorData.error || "Failed to create project from document"
          );
        }

        const data = await response.json();

        toast({
          title: "Project created",
          description:
            "Your project has been automatically generated from the document.",
        });

        router.push(`/dashboard/create-project/edit/${data.id}`);
        return;
      }
    } catch (error) {
      console.error("Error creating project:", error);
      toast({
        title: "Generation failed",
        description:
          error instanceof Error
            ? error.message
            : "An unexpected error occurred",
        variant: "destructive",
      });
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <Card>
      <Form {...form}>
        <form
          onSubmit={form.handleSubmit(handleAutoGenerate)}
          className="space-y-8"
        >
          <CardContent className="space-y-8">
            {/* Logo Upload Field */}
            <FormItem>
              <FormLabel className="text-base font-medium">
                Project Image (Optional)
              </FormLabel>
              <FormControl>
                <LogoUpload
                  logoPreview={logoPreview}
                  setLogo={setLogo}
                  setLogoPreview={setLogoPreview}
                />
              </FormControl>
              {!logoPreview && (
                <FormDescription className="text-xs italic text-center">
                  Adding a logo helps personalize your project
                </FormDescription>
              )}
            </FormItem>

            <FormField
              control={form.control}
              name="videoTitle"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Video Title</FormLabel>
                  <FormControl>
                    <Input placeholder="Enter your video title" {...field} />
                  </FormControl>
                  <FormDescription>
                    This will be used to generate relevant thumbnails
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <Tabs
              value={activeTab}
              className="w-full"
              onValueChange={(value) => setActiveTab(value as "text" | "youtube" | "document")}
            >
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="text">Text Input</TabsTrigger>
                <TabsTrigger value="youtube">YouTube Link</TabsTrigger>
                <TabsTrigger value="document">Upload Document</TabsTrigger>
              </TabsList>

              <TabsContent value="text">
                <FormField
                  control={form.control}
                  name="scriptContent"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Script / Overview</FormLabel>
                      <FormControl>
                        <Textarea
                          placeholder="Paste your video script or overview here"
                          className="min-h-[200px]"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </TabsContent>

              <TabsContent value="youtube">
                <FormField
                  control={form.control}
                  name="youtubeLink"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>YouTube Video Link</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="https://youtube.com/watch?v=..."
                          {...field}
                        />
                      </FormControl>
                      <FormDescription>
                        We'll extract the content from your YouTube video
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </TabsContent>

              <TabsContent value="document">
                <FormField
                  control={form.control}
                  name="documentFile"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Upload Document</FormLabel>
                      <FormControl>
                        <Input
                          type="file"
                          accept=".doc,.docx,.txt,.pdf"
                          onChange={(e) => {
                            const file = e.target.files?.[0];
                            if (file) {
                              setDocumentFile(file);
                              field.onChange(file);
                            }
                          }}
                        />
                      </FormControl>
                      <FormDescription>
                        Upload your script document (DOC, DOCX, TXT, or PDF)
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </TabsContent>
            </Tabs>

            <Button
              type="submit"
              className="w-full"
              variant="brand"
              size="lg"
              disabled={isGenerating}
            >
              {isGenerating ? "Generating..." : "Continue"}
            </Button>
          </CardContent>
        </form>
      </Form>
    </Card>
  );
};

export default AutomatedInputForm;
