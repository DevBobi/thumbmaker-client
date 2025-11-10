"use client";
import React, { useState } from "react";
import { Edit, Upload } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
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
  niche: z.string().min(1, "Niche is required"),
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

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      brand: template.brand,
      niche: template.niche,
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

  const handleUpdateTemplate = async (values: FormValues) => {
    try {
      setIsLoading(true);

      let imageUrl = template.image;

      // If a new image was uploaded, process it
      if (templateImage) {
        const formData = new FormData();
        formData.append("file", templateImage);
        const { fileUrl } = await uploadToStorage(formData);
        imageUrl = fileUrl || "";
      }

      // Submit to API endpoint
      const response = await authFetch(`/api/templates/${template.id}`, {
        method: "PUT",
        body: JSON.stringify({
          image: imageUrl,
          creator: values.brand,
          brand: values.brand,
          niche: values.niche,
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
        tags: [
          updatedTemplate.brand,
          updatedTemplate.niche,
        ],
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
        niche: template.niche,
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

            {/* Niche Input */}
            <FormField
              control={form.control}
              name="niche"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>
                    Niche <span className="text-red-500">*</span>
                  </FormLabel>
                  <FormControl>
                    <Input placeholder="Enter niche (e.g., Finance, Gaming)" {...field} />
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
