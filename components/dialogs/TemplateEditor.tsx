"use client";
import React, { useMemo, useState } from "react";
import Image from "next/image";
import { Edit, Upload, X } from "lucide-react";
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
import { AdTemplate } from "@/contexts/AdContext";
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
import { uploadToStorage } from "@/actions/upload";
import { useAuthFetch } from "@/hooks/use-auth-fetch";

interface TemplateEditorProps {
  template: AdTemplate;
  onSave: (updatedTemplate: AdTemplate) => void;
  trigger?: React.ReactNode;
  className?: string;
}

const formSchema = z.object({
  brand: z.string().min(1, "Creator name is required"),
  tagsInput: z
    .string()
    .min(1, "At least one tag is required")
    .refine(
      (value) => value.split(",").some((tag) => tag.trim().length > 0),
      "Please provide at least one valid tag"
    ),
  image: z.any().optional(),
});

type FormValues = z.infer<typeof formSchema>;

const TemplateEditor: React.FC<TemplateEditorProps> = ({
  template,
  onSave,
  trigger,
  className,
}) => {
  const { authFetch } = useAuthFetch();
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [templateImage, setTemplateImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(
    template.image
  );

  const defaultTagsInput = useMemo(() => {
    if (template.tags && template.tags.length > 0) {
      return template.tags.join(", ");
    }
    if (template.niche) {
      return template.niche;
    }
    return "";
  }, [template.tags, template.niche]);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      brand: template.brand,
      tagsInput: defaultTagsInput,
    },
  });

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setTemplateImage(file);
      form.setValue("image", file);

      // Create preview
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const parseTags = (input: string) => {
    return input
      .split(",")
      .map((tag) => tag.trim())
      .filter(Boolean)
      .map((tag) => tag.slice(0, 40))
      .slice(0, 8);
  };

  const handleUpdateTemplate = async (values: FormValues) => {
    try {
      setIsLoading(true);
      const parsedTags = parseTags(values.tagsInput);
      const primaryTag = parsedTags[0] || template.niche || template.brand;

      let imageUrl = template.image;

      // If a new image was uploaded, process it
      if (templateImage) {
        const formData = new FormData();
        formData.append("file", templateImage);
        const { fileUrl } = await uploadToStorage(formData);
        imageUrl = fileUrl || "";
      }

      // Submit to API endpoint
      const response = await authFetch(`/templates/${template.id}`, {
        method: "PUT",
        body: JSON.stringify({
          image: imageUrl,
          creator: values.brand,
          brand: values.brand,
          niche: primaryTag,
          tags: parsedTags,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Template update failed");
      }

      const updatedTemplate = await response.json();

      // Update template in parent component
      onSave({
        ...template,
        image: updatedTemplate.image,
        brand: updatedTemplate.brand,
        niche: updatedTemplate.niche,
        tags:
          parsedTags.length > 0
            ? parsedTags
            : [
                updatedTemplate.brand,
                updatedTemplate.niche,
              ].filter(Boolean) as string[],
      });

      toast({
        title: "Template updated",
        description: "Your template has been successfully updated",
      });

      // Close dialog
      setIsOpen(false);
    } catch (error) {
      console.error("Error updating template:", error);
      toast({
        title: "Template update failed",
        description: "Please try again",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleOpenChange = (open: boolean) => {
    setIsOpen(open);
    if (!open) {
      // Reset to original values if dialog is closed without saving
      setImagePreview(template.image);
      form.reset({
        brand: template.brand,
        tagsInput: defaultTagsInput,
      });
      setTemplateImage(null);
    }
  };

  return (
    <Sheet open={isOpen} onOpenChange={handleOpenChange}>
      <SheetTrigger asChild>
        {trigger || (
          <Button variant="ghost" size="sm" className={className}>
            <Edit className="h-4 w-4 mr-2" />
            Edit Template
          </Button>
        )}
      </SheetTrigger>
      <SheetContent className="sm:max-w-[600px] overflow-y-auto" side="right">
        <SheetHeader>
          <SheetTitle>Edit Template</SheetTitle>
        </SheetHeader>

        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(handleUpdateTemplate)}
            className="flex flex-col h-full"
          >
            <div className="flex-1 space-y-6 px-4 py-6">
            {/* Image Upload */}
            <FormField
              control={form.control}
              name="image"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>
                    Template Image <span className="text-red-500">*</span>
                  </FormLabel>
                  <FormControl>
                    <div className="relative">
                      <label
                        htmlFor="template-image"
                        className="flex flex-col items-center border-2 border-dashed rounded-md p-6 cursor-pointer transition hover:border-primary/70"
                      >
                      {imagePreview ? (
                        <div className="w-full flex justify-center">
                          <div className="relative w-full max-h-72 overflow-hidden rounded-md" style={{ aspectRatio: '16/9' }}>
                            <Image
                              src={imagePreview}
                              alt="Template preview"
                              fill
                              className="object-cover"
                              sizes="(max-width: 768px) 100vw, 600px"
                            />
                            <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/10 to-transparent opacity-0 hover:opacity-100 transition flex flex-col items-center justify-center text-white text-sm gap-2">
                              <Upload className="h-5 w-5" />
                              <span>Click to change image</span>
                            </div>
                          </div>
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
                      </label>
                      {imagePreview && (
                        <Button
                          type="button"
                          variant="secondary"
                          size="icon"
                          className="absolute top-4 right-4 h-8 w-8 rounded-full shadow-md"
                          onClick={(e) => {
                            e.stopPropagation();
                            e.preventDefault();
                            setImagePreview(null);
                            setTemplateImage(null);
                            form.setValue("image", undefined);
                          }}
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      )}
                      <Input
                        id="template-image"
                        type="file"
                        className="hidden"
                        accept="image/jpeg,image/png,image/svg+xml"
                        onChange={(e) => {
                          handleImageChange(e);
                          field.onChange(e);
                        }}
                      />
                    </div>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Creator Input */}
            <FormField
              control={form.control}
              name="brand"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>
                    Creator <span className="text-red-500">*</span>
                  </FormLabel>
                  <FormControl>
                    <Input placeholder="Enter creator name" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Tags Input */}
            <FormField
              control={form.control}
              name="tagsInput"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>
                    Tags <span className="text-red-500">*</span>
                  </FormLabel>
                  <FormControl>
                    <Input
                      placeholder="Add tags (comma separated, e.g., Technology, Audio, Awards)"
                      {...field}
                    />
                  </FormControl>
                  <p className="text-xs text-muted-foreground">
                    Use 1-3 word tags. Separate each tag with a comma.
                  </p>
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
                {isLoading ? "Updating..." : "Update Template"}
              </Button>
            </SheetFooter>
          </form>
        </Form>
      </SheetContent>
    </Sheet>
  );
};

export default TemplateEditor;
