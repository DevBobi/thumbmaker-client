"use client";

import React, { useState, useEffect } from "react";
import { FormSheet } from "@/components/ui/form-sheet";
import { useToast } from "@/hooks/use-toast";
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
import LogoUpload from "./LogoUpload";
import { uploadToStorage } from "@/actions/upload";

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

interface ProductSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  productId?: string;
  mode?: "create" | "edit";
  onSuccess?: () => void;
}

export function ProductSheet({
  open,
  onOpenChange,
  productId,
  mode = "create",
  onSuccess,
}: ProductSheetProps) {
  const router = useRouter();
  const { authFetch } = useAuthFetch();
  const { toast } = useToast();
  const [isSaving, setIsSaving] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
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

  // Load product data if in edit mode
  useEffect(() => {
    if (mode === "edit" && productId && open) {
      loadProductData();
    }
  }, [mode, productId, open]);

  const loadProductData = async () => {
    setIsLoading(true);
    try {
      const response = await authFetch(`/api/projects/${productId}`);
      if (!response.ok) {
        throw new Error("Failed to load product");
      }
      const data = await response.json();

      form.reset({
        name: data.title || "",
        overview: data.description || "",
        features: Array.isArray(data.highlights)
          ? data.highlights.join("\n")
          : data.highlights || "",
        valueProposition: data.uvp || "",
        targetAudience: data.targetAudience || "",
      });

      if (data.logo) {
        setLogoPreview(data.logo);
      }
    } catch (error) {
      console.error("Failed to load product:", error);
      toast({
        title: "Error loading product",
        description: "Failed to load product data",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleSave = async () => {
    const isValid = await form.trigger();
    if (!isValid) return;

    const values = form.getValues();
    setIsSaving(true);

    try {
      // Upload logo if changed
      let logoUrl = logoPreview;
      if (logo) {
        const formData = new FormData();
        formData.append("file", logo);
        const uploadResult = await uploadToStorage(formData);
        if (uploadResult.success && uploadResult.fileUrl) {
          logoUrl = uploadResult.fileUrl;
        }
      }

      const projectData = {
        title: values.name,
        description: values.overview,
        highlights: values.features.split("\n").filter((f: string) => f.trim()),
        targetAudience: values.targetAudience,
        logo: logoUrl,
      };

      const url =
        mode === "edit"
          ? `/api/projects/${productId}`
          : "/api/projects/create";
      const method = mode === "edit" ? "PUT" : "POST";

      const response = await authFetch(url, {
        method,
        body: JSON.stringify(projectData),
      });

      if (!response.ok) {
        throw new Error(`Error: ${response.status} - ${response.statusText}`);
      }

      const data = await response.json();

      toast({
        title: mode === "edit" ? "Product updated" : "Product created",
        description:
          mode === "edit"
            ? `${values.name} has been updated.`
            : `${values.name} has been added to your products.`,
      });

      // Reset form and close sheet
      form.reset();
      setLogo(null);
      setLogoPreview(null);
      onOpenChange(false);

      // Call success callback or navigate
      if (onSuccess) {
        onSuccess();
      } else if (mode === "create") {
        router.push(`/dashboard/products`);
      } else {
        router.push("/dashboard/products");
      }
    } catch (error) {
      console.error("Failed to save product:", error);
      toast({
        title: `Error ${mode === "edit" ? "updating" : "creating"} product`,
        description:
          error instanceof Error
            ? error.message
            : "An unexpected error occurred",
        variant: "destructive",
      });
    } finally {
      setIsSaving(false);
    }
  };

  const handleCancel = () => {
    form.reset();
    setLogo(null);
    setLogoPreview(null);
    onOpenChange(false);
  };

  return (
    <FormSheet
      open={open}
      onOpenChange={onOpenChange}
      title={mode === "edit" ? "Edit Product" : "Create New Product"}
      description={
        mode === "edit"
          ? "Update your product information"
          : "Add a new product to your collection"
      }
      onSave={handleSave}
      onCancel={handleCancel}
      saveLabel={mode === "edit" ? "Update Product" : "Create Product"}
      isSaving={isSaving}
      isLoading={isLoading}
      size="md"
    >
      <Form {...form}>
        <form className="space-y-6">
          {/* Logo Upload Field */}
          <FormItem>
            <FormLabel className="text-base font-medium">Brand Logo</FormLabel>
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
                  <Input placeholder="e.g. 'AI-powered CRM'" {...field} />
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
                    rows={3}
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </form>
      </Form>
    </FormSheet>
  );
}


