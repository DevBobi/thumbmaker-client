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

// Form validation schema
const formSchema = z.object({
  name: z.string().min(2, {
    message: "Product name must be at least 2 characters.",
  }),
  overview: z.string().min(10, {
    message: "Overview must be at least 10 characters.",
  }),
  features: z.string().min(10, {
    message: "Features must be at least 10 characters.",
  }),
  valueProposition: z.string().min(10, {
    message: "Value proposition must be at least 10 characters.",
  }),
  targetAudience: z.string().min(10, {
    message: "Target audience must be at least 10 characters.",
  }),
});

const ManualEntryForm = () => {
  const router = useRouter();
  const { authFetch } = useAuthFetch();
  const { toast } = useToast();
  const [isGenerating, setIsGenerating] = useState(false);
  const [logo, setLogo] = useState<File | null>(null);
  const [logoPreview, setLogoPreview] = useState<string | null>(null);

  // Initialize form
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      overview: "",
      features: "",
      valueProposition: "",
      targetAudience: "",
    },
  });

  const handleSubmit = async (values: z.infer<typeof formSchema>) => {
    setIsGenerating(true);

    try {
      const product = {
        name: values.name,
        overview: values.overview,
        features: values.features,
        uvp: values.valueProposition,
        targetAudience: values.targetAudience,
      };

      const response = await authFetch("/api/products/create", {
        method: "POST",
        body: JSON.stringify(product),
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
        title: "Product created",
        description: `${values.name} has been added to your products.`,
      });

      // Navigate to the product edit page
      router.push(`/dashboard/edit-product/${data.id}`);
    } catch (error) {
      console.error("Failed to create product:", error);
      toast({
        title: "Error creating product",
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
        <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
          <CardContent className="space-y-6">
            {/* Logo Upload Field */}
            <FormItem>
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
                  Adding a logo helps personalize your product details
                </FormDescription>
              )}
            </FormItem>

            {/* Product Name Field */}
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-base font-medium">
                    Product/Service Name
                  </FormLabel>
                  <FormControl>
                    <Input
                      placeholder="e.g. 'AI-powered CRM'"
                      className=" "
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Overview Field */}
            <FormField
              control={form.control}
              name="overview"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-base font-medium">
                    Product/Service Overview
                  </FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Provide a brief overview of your product or service"
                      className=""
                      rows={3}
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Features Field */}
            <FormField
              control={form.control}
              name="features"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-base font-medium">
                    Key Features & Benefits
                  </FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="List the main features and benefits of your product"
                      className=""
                      rows={4}
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Value Proposition Field */}
            <FormField
              control={form.control}
              name="valueProposition"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-base font-medium">
                    Unique Value Proposition (UVP)
                  </FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="What makes your product unique in the market?"
                      className=""
                      rows={3}
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
                      placeholder="Describe your ideal customers or users"
                      className=""
                      rows={3}
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </CardContent>

          <CardFooter className="mt-4 px-6">
            <Button
              type="submit"
              variant="brand"
              size="lg"
              className="w-full cursor-pointer"
              disabled={isGenerating}
            >
              {isGenerating ? (
                <>
                  <span className="animate-pulse">Creating...</span>
                  <span className="ml-2 h-4 w-4 rounded-full border-2 border-white border-t-transparent animate-spin"></span>
                </>
              ) : (
                "Create Product"
              )}
            </Button>
          </CardFooter>
        </form>
      </Form>
    </Card>
  );
};

export default ManualEntryForm;
