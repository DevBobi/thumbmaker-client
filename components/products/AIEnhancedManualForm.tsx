import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import LogoUpload from "./LogoUpload";
import { useRouter } from "next/navigation";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
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
import { useAuthFetch } from "@/hooks/use-auth-fetch";
import { uploadToStorage } from "@/actions/upload";
import { Sparkles, Loader2 } from "lucide-react";

// Form validation schema
const formSchema = z.object({
  title: z.string().min(2, {
    message: "Title must be at least 2 characters.",
  }),
  briefDescription: z.string().min(20, {
    message: "Brief description must be at least 20 characters.",
  }),
  description: z.string().optional(),
  highlights: z.string().optional(),
  targetAudience: z.string().optional(),
});

const AIEnhancedManualForm = () => {
  const router = useRouter();
  const { authFetch } = useAuthFetch();
  const { toast } = useToast();
  const [isEnhancing, setIsEnhancing] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  const [isEnhanced, setIsEnhanced] = useState(false);
  const [logo, setLogo] = useState<File | null>(null);
  const [logoPreview, setLogoPreview] = useState<string | null>(null);

  // Initialize form
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: "",
      briefDescription: "",
      description: "",
      highlights: "",
      targetAudience: "",
    },
  });

  const handleEnhance = async () => {
    const title = form.getValues("title");
    const briefDescription = form.getValues("briefDescription");

    if (!title || !briefDescription) {
      toast({
        title: "Input required",
        description: "Please provide both title and brief description.",
        variant: "destructive",
      });
      return;
    }

    if (briefDescription.length < 20) {
      toast({
        title: "Input too short",
        description: "Brief description must be at least 20 characters.",
        variant: "destructive",
      });
      return;
    }

    setIsEnhancing(true);

    try {
      const response = await authFetch("/api/projects/enhance-brief", {
        method: "POST",
        body: JSON.stringify({
          title,
          briefDescription,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(
          errorData.error || "Failed to enhance project description"
        );
      }

      const data = await response.json();

      // Populate the form with AI-generated content
      form.setValue("description", data.description || "");
      form.setValue(
        "highlights",
        Array.isArray(data.highlights) ? data.highlights.join("\n") : ""
      );
      form.setValue("targetAudience", data.targetAudience || "");

      setIsEnhanced(true);

      toast({
        title: "Enhanced successfully",
        description:
          "AI has generated detailed content. Review and edit as needed.",
      });
    } catch (error) {
      console.error("Failed to enhance:", error);
      toast({
        title: "Enhancement failed",
        description:
          error instanceof Error
            ? error.message
            : "An unexpected error occurred",
        variant: "destructive",
      });
    } finally {
      setIsEnhancing(false);
    }
  };

  const handleSubmit = async (values: z.infer<typeof formSchema>) => {
    if (!isEnhanced) {
      toast({
        title: "Enhance first",
        description: "Please enhance with AI before creating the project.",
        variant: "destructive",
      });
      return;
    }

    setIsCreating(true);

    try {
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

      const projectData = {
        title: values.title,
        description: values.description,
        highlights: values.highlights
          ?.split("\n")
          .filter((f: string) => f.trim()),
        targetAudience: values.targetAudience,
        image: imageUrl,
      };

      const response = await authFetch("/api/projects/create", {
        method: "POST",
        body: JSON.stringify(projectData),
      });

      if (!response.ok) {
        throw new Error(`Error: ${response.status} - ${response.statusText}`);
      }

      const data = await response.json();

      if (!data || !data.id) {
        throw new Error("Invalid response data from server");
      }

      // Show success message
      toast({
        title: "Project created",
        description: `${values.title} has been created successfully.`,
      });

      // Navigate to the project edit page
      router.push(`/dashboard/edit-product/${data.id}`);
    } catch (error) {
      console.error("Failed to create project:", error);
      toast({
        title: "Error creating project",
        description:
          error instanceof Error
            ? error.message
            : "An unexpected error occurred",
        variant: "destructive",
      });
    } finally {
      setIsCreating(false);
    }
  };

  return (
    <Card>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
          <CardContent className="space-y-6">
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
                  Adding an image helps personalize your project
                </FormDescription>
              )}
            </FormItem>

            {/* Title Field */}
            <FormField
              control={form.control}
              name="title"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-base font-medium">
                    Project Title
                  </FormLabel>
                  <FormControl>
                    <Input
                      placeholder="e.g. 'AI-powered CRM Platform'"
                      className=""
                      {...field}
                      disabled={isEnhanced}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Brief Description Field */}
            <FormField
              control={form.control}
              name="briefDescription"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-base font-medium">
                    Brief Description
                  </FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Provide a brief overview of your project (minimum 20 characters)"
                      className=""
                      rows={3}
                      {...field}
                      disabled={isEnhanced}
                    />
                  </FormControl>
                  <FormDescription>
                    Our AI will expand this into a detailed description with
                    highlights
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Enhance Button */}
            {!isEnhanced && (
              <Button
                type="button"
                variant="outline"
                className="w-full"
                onClick={handleEnhance}
                disabled={isEnhancing}
              >
                {isEnhancing ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Enhancing with AI...
                  </>
                ) : (
                  <>
                    <Sparkles className="mr-2 h-4 w-4" />
                    Enhance with AI
                  </>
                )}
              </Button>
            )}

            {/* AI-Generated Fields (shown after enhancement) */}
            {isEnhanced && (
              <>
                <div className="bg-brand-50 border border-brand-200 rounded-lg p-4">
                  <p className="text-sm text-brand-700 font-medium flex items-center gap-2">
                    <Sparkles className="h-4 w-4" />
                    AI-Enhanced Content - Review and edit as needed
                  </p>
                </div>

                {/* Full Description Field */}
                <FormField
                  control={form.control}
                  name="description"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-base font-medium">
                        Full Description
                      </FormLabel>
                      <FormControl>
                        <Textarea
                          placeholder="AI-generated description"
                          className=""
                          rows={4}
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Highlights Field */}
                <FormField
                  control={form.control}
                  name="highlights"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-base font-medium">
                        Key Highlights (one per line)
                      </FormLabel>
                      <FormControl>
                        <Textarea
                          placeholder="AI-generated highlights"
                          className=""
                          rows={5}
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Target Audience Field */}
                <FormField
                  control={form.control}
                  name="targetAudience"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-base font-medium">
                        Target Audience
                      </FormLabel>
                      <FormControl>
                        <Textarea
                          placeholder="AI-generated target audience"
                          className=""
                          rows={3}
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <Button
                  type="button"
                  variant="ghost"
                  className="w-full"
                  onClick={() => {
                    setIsEnhanced(false);
                    form.setValue("description", "");
                    form.setValue("highlights", "");
                    form.setValue("targetAudience", "");
                  }}
                >
                  Reset & Re-enhance
                </Button>
              </>
            )}
          </CardContent>

          {isEnhanced && (
            <CardFooter className="mt-4 px-6">
              <Button
                type="submit"
                variant="brand"
                size="lg"
                className="w-full cursor-pointer"
                disabled={isCreating}
              >
                {isCreating ? (
                  <>
                    <span className="animate-pulse">Creating...</span>
                    <span className="ml-2 h-4 w-4 rounded-full border-2 border-white border-t-transparent animate-spin"></span>
                  </>
                ) : (
                  "Create Project"
                )}
              </Button>
            </CardFooter>
          )}
        </form>
      </Form>
    </Card>
  );
};

export default AIEnhancedManualForm;

