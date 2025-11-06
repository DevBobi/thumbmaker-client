import { uploadToStorage } from "@/actions/upload";
import LogoUpload from "@/components/products/LogoUpload";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { zodResolver } from "@hookform/resolvers/zod";
import { Plus, X } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useForm } from "react-hook-form";
import * as z from "zod";

const formSchema = z.object({
  videoTitle: z.string().min(1, "Video title is required"),
  videoDescription: z.string().min(1, "Video description is required"),
  highlights: z
    .array(z.string())
    .min(2, "At least two highlights are required")
    .max(5, "Maximum 5 highlights allowed"),
  targetAudience: z.string().min(1, "Target audience is required"),
});

interface ManualInputFormProps {
  onSubmit: (data: z.infer<typeof formSchema>) => Promise<{ id: string }>;
  initialValues?: {
    videoTitle: string;
    videoDescription: string;
    highlights: string[];
    targetAudience: string;
  };
}

const ManualInputForm = ({ onSubmit, initialValues }: ManualInputFormProps) => {
  const { toast } = useToast();
  const router = useRouter();
  const [highlightCount, setHighlightCount] = useState(
    initialValues?.highlights?.length || 2
  );
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [inspirationPreview, setInspirationPreview] = useState<string | null>(
    null
  );
  const [logo, setLogo] = useState<File | null>(null);
  const [logoPreview, setLogoPreview] = useState<string | null>(null);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: initialValues || {
      videoTitle: "",
      videoDescription: "",
      highlights: ["", ""],
      targetAudience: "",
    },
  });

  const addHighlight = () => {
    if (highlightCount < 5) {
      const currentHighlights = form.getValues("highlights");
      form.setValue("highlights", [...currentHighlights, ""]);
      setHighlightCount((prev) => prev + 1);
    }
  };

  const removeHighlight = (index: number) => {
    if (highlightCount > 2) {
      const currentHighlights = form.getValues("highlights");
      const newHighlights = currentHighlights.filter((_, i) => i !== index);
      form.setValue("highlights", newHighlights);
      setHighlightCount((prev) => prev - 1);
    }
  };

  const submit = async (data: z.infer<typeof formSchema>) => {
    try {
      const nonEmptyHighlights = data.highlights.filter(
        (highlight) => highlight.trim() !== ""
      );

      if (nonEmptyHighlights.length < 2) {
        toast({
          title: "Invalid highlights",
          description: "Please provide at least two non-empty highlights",
          variant: "destructive",
        });
        return;
      }

      setIsSubmitting(true);
      
      // Upload image if provided
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
      
      // Add image URL to the data
      const dataWithImage = {
        ...data,
        image: imageUrl,
      };
      
      const project = await onSubmit(dataWithImage);
      
      toast({
        title: "Project created successfully",
        description: "Redirecting to all projects...",
      });
      
      // Navigate to all projects page
      router.push("/dashboard/projects");
    } catch (error) {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to create project",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Card>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(submit)} className="space-y-8">
          <CardContent className="space-y-8">
            {/* Image Upload Field */}
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
              <FormDescription className="text-xs text-center">
                Upload an image to represent your project
              </FormDescription>
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
                    The main title that will appear in your thumbnail
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="videoDescription"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Video Description</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Enter a brief description of your video"
                      className="min-h-[100px]"
                      {...field}
                    />
                  </FormControl>
                  <FormDescription>
                    This helps us understand the context of your video
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-medium">Script Highlights</h3>
                  <p className="text-sm text-muted-foreground">
                    Add 2-5 key points or highlights from your video
                  </p>
                </div>
                {highlightCount < 5 && (
                  <Button
                    type="button"
                    variant="brand"
                    onClick={addHighlight}
                    className="py-4 px-4"
                  >
                    <Plus className="h-4 w-4" />
                    &nbsp; Add more Highlights
                  </Button>
                )}
              </div>

              {form.getValues("highlights").map((_, index) => (
                <div key={index} className="flex gap-2">
                  <FormField
                    control={form.control}
                    name={`highlights.${index}`}
                    render={({ field }) => (
                      <FormItem className="flex-1">
                        <FormLabel>Highlight {index + 1}</FormLabel>
                        <div className="flex gap-2">
                          <FormControl>
                            <Input
                              placeholder={`Enter highlight ${index + 1}`}
                              {...field}
                            />
                          </FormControl>
                          {index >= 2 && (
                            <Button
                              type="button"
                              variant="outline"
                              size="icon"
                              onClick={() => removeHighlight(index)}
                              className="h-10 w-10 flex-shrink-0"
                            >
                              <X className="h-4 w-4" />
                            </Button>
                          )}
                        </div>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              ))}
            </div>

            <FormField
              control={form.control}
              name="targetAudience"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Target Audience</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="Who is this video for? (e.g., Beginners, Tech enthusiasts)"
                      {...field}
                    />
                  </FormControl>
                  <FormDescription>
                    This helps us tailor the thumbnail style to your audience
                  </FormDescription>
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
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <>
                  <span className="animate-pulse">Submitting...</span>
                  <span className="ml-2 h-4 w-4 rounded-full border-2 border-white border-t-transparent animate-spin"></span>
                </>
              ) : (
                "Submit"
              )}
            </Button>
          </CardFooter>
        </form>
      </Form>
    </Card>
  );
};

export default ManualInputForm;
