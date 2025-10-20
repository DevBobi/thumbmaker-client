import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { useProducts } from "@/contexts/ProductContext";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Globe, Upload, Wand2 } from "lucide-react";
import { Separator } from "@/components/ui/separator";
import LogoUpload from "./LogoUpload";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useAuthFetch } from "@/hooks/use-auth-fetch";
import { uploadToStorage } from "@/actions/upload";
import { Textarea } from "../ui/textarea";

// Form validation schema
const formSchema = z.object({
  productName: z.string().min(2, {
    message: "Product name must be at least 2 characters.",
  }),
  details: z.string().optional().or(z.literal("")),
  websiteUrl: z
    .string()
    .url({
      message: "Please enter a valid URL.",
    })
    .optional()
    .or(z.literal("")),
  // File validation will be handled separately
});

const AutomatedGeneration = () => {
  const { addProduct } = useProducts();
  const { authFetch } = useAuthFetch();
  const router = useRouter();
  const { toast } = useToast();

  const [isGenerating, setIsGenerating] = useState(false);
  const [logo, setLogo] = useState<File | null>(null);
  const [logoPreview, setLogoPreview] = useState<string | null>(null);
  const [activeSource, setActiveSource] = useState<"text" | "url" | "document">(
    "text"
  );
  const [isHovering, setIsHovering] = useState(false);
  const [documentFile, setDocumentFile] = useState<File | null>(null);

  // Initialize form
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      productName: "",
      websiteUrl: "",
      details: "",
    },
  });

  const handleAutoGenerate = async (values: z.infer<typeof formSchema>) => {
    try {
      setIsGenerating(true);

      if (!values.productName) {
        toast({
          title: "Input required",
          description: "Please enter a product name.",
          variant: "destructive",
        });
        return;
      }

      if (activeSource === "text") {
        if (!values.details) {
          toast({
            title: "Input required",
            description: "Please enter product details.",
            variant: "destructive",
          });
          return;
        }

        if (values.details.length < 200) {
          toast({
            title: "Input required",
            description: "Product details must be at least 200 characters.",
            variant: "destructive",
          });
          return;
        }

        let fileUrl = null;

        if (logo) {
          const formData = new FormData();
          formData.append("file", logo as Blob);

          const uploadResult = await uploadToStorage(formData);

          if (!uploadResult.success) {
            throw new Error("Failed to upload logo");
          }

          fileUrl = uploadResult.fileUrl;
        }

        const response = await authFetch("/api/projects/create-with-text", {
          method: "POST",
          body: JSON.stringify({
            title: values.productName,
            content: values.details,
          }),
        });

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(
            errorData.error || "Failed to generate product from text"
          );
        }

        const data = await response.json();

        toast({
          title: "Product generated",
          description:
            "Your product has been automatically generated from the provided information.",
        });

        router.push(`/dashboard/edit-product/${data.id}`);
        return;
      }

      if (activeSource === "url") {
        if (!values.websiteUrl) {
          toast({
            title: "Input required",
            description: "Please enter a valid website URL.",
            variant: "destructive",
          });
          return;
        }

        let fileUrl = null;

        if (logo) {
          const formData = new FormData();
          formData.append("file", logo as Blob);

          const uploadResult = await uploadToStorage(formData);

          if (!uploadResult.success) {
            throw new Error("Failed to upload logo");
          }

          fileUrl = uploadResult.fileUrl;
        }

        const response = await authFetch("/api/projects/create-with-youtube", {
          method: "POST",
          body: JSON.stringify({
            title: values.productName,
            youtubeLink: values.websiteUrl,
          }),
        });

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(
            errorData.error || "Failed to generate product from website"
          );
        }

        const data = await response.json();

        toast({
          title: "Product generated",
          description:
            "Your product has been automatically generated from the provided information.",
        });

        router.push(`/dashboard/edit-product/${data.id}`);
        return;
      }

      if (activeSource === "document") {
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

        let logoUrl = null;

        if (logo) {
          const formData = new FormData();
          formData.append("file", logo as Blob);

          const { success: logoSuccess, fileUrl } = await uploadToStorage(
            formData
          );

          if (!logoSuccess) {
            throw new Error("Failed to upload logo");
          }

          logoUrl = fileUrl;
        }

        const documentFormData = new FormData();
        documentFormData.append("file", documentFile);

        const { success: documentSuccess, fileUrl: documentUrl } =
          await uploadToStorage(documentFormData);

        if (!documentSuccess) {
          throw new Error("Failed to upload document");
        }

        const response = await authFetch("/api/projects/create-with-document", {
          method: "POST",
          body: JSON.stringify({
            title: values.productName,
            document: documentUrl,
          }),
        });

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(
            errorData.error || "Failed to generate product from document"
          );
        }

        const data = await response.json();

        toast({
          title: "Product generated",
          description:
            "Your product has been automatically generated from the provided information.",
        });

        router.push(`/dashboard/edit-product/${data.id}`);
        return;
      }
    } catch (error) {
      console.error("Error generating product:", error);
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

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      const file = files[0];

      // Check file size (5MB limit)
      if (file.size > 5 * 1024 * 1024) {
        toast({
          title: "File too large",
          description: "Please upload a file smaller than 5MB.",
          variant: "destructive",
        });
        return;
      }

      // Check file type
      const validTypes = [
        "application/pdf",
        "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
        "text/plain",
      ];
      if (!validTypes.includes(file.type)) {
        toast({
          title: "Invalid file type",
          description: "Please upload a PDF, DOCX, or TXT file.",
          variant: "destructive",
        });
        return;
      }

      setDocumentFile(file);
      toast({
        title: "File uploaded",
        description:
          "Your document has been uploaded and is ready for processing.",
      });
    }
  };

  return (
    <Card>
      {/* <CardHeader className="bg-gradient-to-r from-brand-50 to-transparent pb-4">
        <CardTitle className="text-2xl font-bold text-brand-700">
          Automated Product Generation
        </CardTitle>
        <CardDescription className="text-base">
          Let our AI analyze your website or brand document to automatically
          generate comprehensive product details.
        </CardDescription>
      </CardHeader> */}

      <Form {...form}>
        <form onSubmit={form.handleSubmit(handleAutoGenerate)}>
          <CardContent className="space-y-8">
            {/* Logo Upload Field */}
            <FormItem className="space-y-3">
              <FormLabel className="text-base font-medium">
                Brand Logo
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
                  Adding a logo helps personalize your generated product details
                </FormDescription>
              )}
            </FormItem>

            {/* Product Name Field */}
            <FormField
              control={form.control}
              name="productName"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-base font-medium">
                    Product/Service Name
                  </FormLabel>
                  <FormControl>
                    <Input
                      placeholder="e.g. 'AI-powered CRM'"
                      className=""
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <Separator className="my-6" />

            {/* Tabs for URL or Document */}
            <Tabs
              defaultValue="text"
              onValueChange={(value) =>
                setActiveSource(value as "text" | "url" | "document")
              }
            >
              <TabsList className="grid w-full h-fit md:grid-cols-3 mb-6">
                <TabsTrigger value="text">Text Input</TabsTrigger>
                <TabsTrigger value="url">Website URL</TabsTrigger>
                <TabsTrigger value="document">Document Upload</TabsTrigger>
              </TabsList>

              <TabsContent value="text" className="space-y-3">
                <FormField
                  control={form.control}
                  name="details"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-base font-medium">
                        Copy and paste your product details here
                      </FormLabel>
                      <FormControl>
                        <Textarea
                          placeholder="e.g. 'AI-powered CRM'"
                          {...field}
                          rows={4}
                        />
                      </FormControl>
                      <FormDescription>
                        We'll analyze your website content to generate accurate
                        product details
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </TabsContent>

              <TabsContent value="url" className="space-y-3">
                <FormField
                  control={form.control}
                  name="websiteUrl"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-base font-medium">
                        Enter Website URL
                      </FormLabel>
                      <FormControl>
                        <div className="relative">
                          <Globe className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                          <Input
                            placeholder="https://example.com"
                            className="pl-10 "
                            {...field}
                          />
                        </div>
                      </FormControl>
                      <FormDescription>
                        We'll analyze your website content to generate accurate
                        product details
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </TabsContent>

              <TabsContent value="document" className="space-y-3">
                <FormItem className="space-y-3">
                  <FormLabel className="text-base font-medium">
                    Upload Document
                  </FormLabel>
                  <FormControl>
                    <div
                      className={`flex justify-center ${
                        isHovering
                          ? "border-brand-400 bg-brand-50"
                          : "border-dashed"
                      } rounded-lg p-8 border-border transition-colors`}
                      onDragOver={(e) => {
                        e.preventDefault();
                        setIsHovering(true);
                      }}
                      onDragLeave={() => setIsHovering(false)}
                      onDrop={(e) => {
                        e.preventDefault();
                        setIsHovering(false);
                        // Handle file drop logic here
                        if (e.dataTransfer.files.length) {
                          handleFileUpload({
                            target: { files: e.dataTransfer.files },
                          } as any);
                        }
                      }}
                    >
                      <div className="text-center">
                        <Upload
                          className={`h-12 w-12 mx-auto mb-4 ${
                            isHovering
                              ? "text-brand-600"
                              : "text-muted-foreground"
                          } transition-colors`}
                        />
                        <p className="text-sm text-muted-foreground mb-3">
                          {documentFile
                            ? documentFile.name
                            : "Drag and drop your document here or click to browse"}
                        </p>
                        <Input
                          id="file-upload"
                          type="file"
                          className="hidden"
                          onChange={handleFileUpload}
                          accept=".pdf,.docx,.txt"
                        />
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          className="hover:bg-brand-50 hover:text-brand-600"
                          onClick={() =>
                            document.getElementById("file-upload")?.click()
                          }
                        >
                          {documentFile ? "Change File" : "Browse Files"}
                        </Button>
                      </div>
                    </div>
                  </FormControl>
                  <FormDescription>
                    Supported formats: PDF, DOCX, TXT (max 5MB)
                  </FormDescription>
                </FormItem>
              </TabsContent>
            </Tabs>
          </CardContent>

          <CardFooter className="mt-4 px-6">
            <Button
              type="submit"
              variant="brand"
              size="lg"
              className="w-full cursor-pointer"
              disabled={isGenerating}
            >
              <Wand2 className="h-5 w-5" />
              {isGenerating ? (
                <>
                  <span className="animate-pulse">Generating...</span>
                  <span className="ml-2 h-4 w-4 rounded-full border-2 border-white border-t-transparent animate-spin"></span>
                </>
              ) : (
                "Generate Product Details"
              )}
            </Button>
          </CardFooter>
        </form>
      </Form>
    </Card>
  );
};

export default AutomatedGeneration;
