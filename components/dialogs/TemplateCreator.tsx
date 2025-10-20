"use client";
import React, { useState } from "react";
import { Upload, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
  SheetFooter,
  SheetClose,
} from "@/components/ui/sheet";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { AdTemplate, useAdContext } from "@/contexts/AdContext";
import { toast } from "@/hooks/use-toast";
import { useForm } from "react-hook-form";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import * as z from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useAuthFetch } from "@/hooks/use-auth-fetch";
import { uploadToStorage } from "@/actions/upload";
import { filterOptions } from "@/constants/filters";

interface TemplateCreatorProps {
  triggerClassName?: string;
  customTrigger?: React.ReactNode;
  onTemplateCreated?: (template: AdTemplate) => void;
}

const formSchema = z.object({
  brand: z.string().min(1, "Brand name is required"),
  category: z.string().min(1, "Category is required"),
  niche: z.string().min(1, "Niche is required"),
  subNiche: z.string().optional(),
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
  const { createCustomTemplate } = useAdContext();
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [templateImage, setTemplateImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      brand: "",
      category: "",
      subNiche: "",
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
          category: values.category,
          subNiche: values.subNiche,
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
        category: data.category,
        subNiche: data.subNiche,
        brand: data.brand,
        niche: data.niche,
        tags: [data.category, data.brand, data.niche, data.subNiche],
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
            {/* Image Upload */}
            <FormField
              control={form.control}
              name="image"
              render={({ field: { onChange, value, ...rest } }) => (
                <FormItem>
                  <FormLabel>
                    Template Image <span className="text-red-500">*</span>
                  </FormLabel>
                  <FormControl>
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
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Brand Input */}
            <FormField
              control={form.control}
              name="brand"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>
                    Brand <span className="text-red-500">*</span>
                  </FormLabel>
                  <FormControl>
                    <Input placeholder="Enter brand name" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Type Selection */}
            <FormField
              control={form.control}
              name="category"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>
                    Category <span className="text-red-500">*</span>
                  </FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                  >
                    <FormControl>
                      <SelectTrigger className="w-full">
                        <SelectValue placeholder="Select type" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {filterOptions.categories.map((option) => (
                        <SelectItem key={option.value} value={option.value}>
                          {option.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Niche Selection */}
            <FormField
              control={form.control}
              name="niche"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>
                    Niche <span className="text-red-500">*</span>
                  </FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                  >
                    <FormControl>
                      <SelectTrigger className="w-full">
                        <SelectValue placeholder="Select niche" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {filterOptions.niches.map((option) => (
                        <SelectItem key={option.value} value={option.value}>
                          {option.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="subNiche"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Sub Niche</FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                  >
                    <FormControl>
                      <SelectTrigger className="w-full">
                        <SelectValue placeholder="Select sub niche" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {filterOptions.subNiches.map((option) => (
                        <SelectItem key={option.value} value={option.value}>
                          {option.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
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
