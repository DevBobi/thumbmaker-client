"use client";
import React, { useState, useEffect } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { ArrowRight, AlertTriangle } from "lucide-react";
import { BrandTone } from "@/contexts/AdContext";
import { Product } from "@/contexts/ProductContext";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";

// Components
import ProductSelector from "@/components/dialogs/ProductSelector";
import MediaUploader from "@/components/ads/MediaUploader";
import ToneSelector from "@/components/ads/ToneSelector";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import AdCreationStepper from "@/components/ads/AdCreationStepper";
import AdDimensionSelector from "@/components/ads/AdDimensionSelector";

// Context
import { useAdCreation } from "@/contexts/AdCreationContext";

// Ad goal type
type AdGoal =
  | "Increase Brand Awareness"
  | "Generate Leads"
  | "Boost Sales / Conversions"
  | "Drive Website Traffic"
  | "Encourage Engagement";

// Define the form schema
const formSchema = z.object({
  product: z.any().optional(),
  brandTone: z.string().min(1, "Please select a brand tone"),
  adGoal: z.string().min(1, "Please select a primary goal"),
  aspectRatio: z.string().min(1, "Please select an ad format"),
  variationCount: z.number().min(1).max(10),
  additionalContext: z.string().optional(),
  additionalInstructions: z.string().optional(),
});

interface CreateAdFormProps {
  onNext: () => void;
}

export const CreateAdForm: React.FC<CreateAdFormProps> = ({ onNext }) => {
  const {
    adCreationData,
    updateAdCreationData,
    addMediaFile,
    removeMediaFile,
  } = useAdCreation();
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [adGoal, setAdGoal] = useState<AdGoal | "">(
    (adCreationData.adGoal as AdGoal) || ""
  );
  const [variationCount, setVariationCount] = useState<number>(
    adCreationData.variationCount || 3
  );
  const [aspectRatio, setAspectRatio] = useState<string>(
    adCreationData.aspectRatio || ""
  );

  // Initialize form
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      product: adCreationData.product,
      brandTone: adCreationData.brandTone || "",
      adGoal: adGoal,
      aspectRatio: aspectRatio,
      variationCount: variationCount,
      additionalContext: adCreationData.additionalContext || "",
      additionalInstructions: adCreationData.additionalInstructions || "",
    },
  });

  // Update form when adCreationData changes
  useEffect(() => {
    form.setValue("product", adCreationData.product);
    form.setValue("brandTone", adCreationData.brandTone || "");
    form.setValue("adGoal", adGoal);
    form.setValue("aspectRatio", aspectRatio);
    form.setValue("variationCount", variationCount);
    form.setValue("additionalContext", adCreationData.additionalContext || "");
    form.setValue(
      "additionalInstructions",
      adCreationData.additionalInstructions || ""
    );
  }, [adCreationData, adGoal, aspectRatio, variationCount, form]);

  const handleProductSelect = (product: Product) => {
    updateAdCreationData({ product });
    form.setValue("product", product);
    if (errors.product) {
      setErrors((prev) => ({ ...prev, product: "" }));
    }
  };

  const handleToneChange = (tone: BrandTone) => {
    updateAdCreationData({ brandTone: tone });
    form.setValue("brandTone", tone);
    if (errors.brandTone) {
      setErrors((prev) => ({ ...prev, brandTone: "" }));
    }
  };

  const handleGoalChange = (goal: string) => {
    setAdGoal(goal as AdGoal);
    form.setValue("adGoal", goal);

    // Also update callToAction based on goal
    let callToAction = "";
    switch (goal) {
      case "Increase Brand Awareness":
        callToAction = "Learn More";
        break;
      case "Generate Leads":
        callToAction = "Sign Up";
        break;
      case "Boost Sales / Conversions":
        callToAction = "Buy Now";
        break;
      case "Drive Website Traffic":
        callToAction = "Visit Website";
        break;
      case "Encourage Engagement":
        callToAction = "Join Now";
        break;
      default:
        callToAction = "Learn More";
    }
    updateAdCreationData({ adGoal: goal, callToAction });

    if (errors.adGoal) {
      setErrors((prev) => ({ ...prev, adGoal: "" }));
    }
  };

  const handleTextChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    updateAdCreationData({ [name]: value } as any);
    form.setValue(name as any, value);
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: "" }));
    }
  };

  const handleAspectRatioChange = (groupId: string, primaryRatio: string) => {
    setAspectRatio(primaryRatio);
    form.setValue("aspectRatio", primaryRatio);
    updateAdCreationData({
      aspectRatio: primaryRatio,
    });

    if (errors.aspectRatio) {
      setErrors((prev) => ({ ...prev, aspectRatio: "" }));
    }
  };

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!adCreationData.product) {
      newErrors.product = "Please select a product";
    }

    if (!adCreationData.brandTone) {
      newErrors.brandTone = "Please select a brand tone";
    }

    if (!adGoal) {
      newErrors.adGoal = "Please select a primary goal for the ad set";
    }

    if (!aspectRatio) {
      newErrors.aspectRatio = "Please select an ad format";
    }

    // Add validation for media files
    if (adCreationData.mediaFiles.length === 0) {
      newErrors.mediaFiles = "Please upload at least one media file";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const onSubmit = (values: z.infer<typeof formSchema>) => {
    // First validate using our custom validation function
    if (!validateForm()) {
      // If validation fails, don't proceed
      return;
    }

    // Update adCreationData with form values
    updateAdCreationData({
      product: values.product,
      brandTone: values.brandTone as BrandTone,
      aspectRatio: values.aspectRatio,
      adGoal: values.adGoal,
      variationCount: values.variationCount,
      additionalContext: values.additionalContext,
      additionalInstructions: values.additionalInstructions,
    });

    // Use onNext to proceed to the next step
    onNext();
  };

  return (
    <div className="mx-auto">
      <div className="mb-6">
        <h1 className="text-3xl font-bold">Create Thumbnail</h1>
        <p className="text-muted-foreground">
          Configure your thumbnail details before choosing a template
        </p>
      </div>

      <AdCreationStepper
        currentStep={1}
        steps={[
          { id: 1, name: "Thumbnail Details" },
          { id: 2, name: "Select Template" },
        ]}
      />

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <Card className="rounded-lg">
            <CardHeader>
              <CardTitle>Product Details</CardTitle>
              <CardDescription>
                Select the product you want to create a thumbnail for
              </CardDescription>
            </CardHeader>
            <CardContent>
              <FormField
                control={form.control}
                name="product"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Product</FormLabel>
                    <FormControl>
                      <ProductSelector
                        selectedProduct={adCreationData.product || null}
                        onSelectProduct={handleProductSelect}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              {errors.product && (
                <p className="text-destructive text-sm flex items-center mt-1">
                  <AlertTriangle className="h-4 w-4 mr-1" />
                  {errors.product}
                </p>
              )}
            </CardContent>
          </Card>

          <Card className="rounded-lg">
            <CardHeader>
              <CardTitle>Media</CardTitle>
              <CardDescription>
                Upload images of your product and other relevant assets to use
                in your ad
              </CardDescription>
            </CardHeader>
            <CardContent>
              <MediaUploader
                files={adCreationData.mediaFiles}
                onAddFile={addMediaFile}
                onRemoveFile={removeMediaFile}
                maxFiles={4}
              />
              {errors.mediaFiles && (
                <p className="text-destructive text-sm flex items-center mt-2">
                  <AlertTriangle className="h-4 w-4 mr-1" />
                  {errors.mediaFiles}
                </p>
              )}
            </CardContent>
          </Card>

          <Card className="rounded-lg">
            <CardHeader>
              <CardTitle>Ad Format</CardTitle>
              <CardDescription>
                Choose the format that best fits your advertising needs
              </CardDescription>
            </CardHeader>
            <CardContent>
              <FormField
                control={form.control}
                name="aspectRatio"
                render={({ field }) => (
                  <FormItem>
                    <FormControl>
                      <AdDimensionSelector
                        selectedGroup={
                          aspectRatio
                            ? dimensionGroupForRatio(aspectRatio)
                            : null
                        }
                        onChange={handleAspectRatioChange}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              {errors.aspectRatio && (
                <p className="text-destructive text-sm flex items-center mt-1">
                  <AlertTriangle className="h-4 w-4 mr-1" />
                  {errors.aspectRatio}
                </p>
              )}
            </CardContent>
          </Card>

          <Card className="rounded-lg">
            <CardHeader>
              <CardTitle>Ad Configuration</CardTitle>
              <CardDescription>
                Define the tone and content of your ad
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <FormField
                control={form.control}
                name="brandTone"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Brand Tone</FormLabel>
                    <FormControl>
                      <ToneSelector
                        value={adCreationData.brandTone || null}
                        onChange={handleToneChange}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              {errors.brandTone && (
                <p className="text-destructive text-sm flex items-center mt-1">
                  <AlertTriangle className="h-4 w-4 mr-1" />
                  {errors.brandTone}
                </p>
              )}

              <FormField
                control={form.control}
                name="adGoal"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Primary Goal of the Ad Set</FormLabel>
                    <FormControl>
                      <Select onValueChange={handleGoalChange} value={adGoal}>
                        <SelectTrigger className="w-full">
                          <SelectValue placeholder="Select a primary goal" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Increase Brand Awareness">
                            Increase Brand Awareness
                          </SelectItem>
                          <SelectItem value="Generate Leads">
                            Generate Leads
                          </SelectItem>
                          <SelectItem value="Boost Sales / Conversions">
                            Boost Sales / Conversions
                          </SelectItem>
                          <SelectItem value="Drive Website Traffic">
                            Drive Website Traffic
                          </SelectItem>
                          <SelectItem value="Encourage Engagement">
                            Encourage Engagement
                          </SelectItem>
                        </SelectContent>
                      </Select>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              {errors.adGoal && (
                <p className="text-destructive text-sm flex items-center mt-1">
                  <AlertTriangle className="h-4 w-4 mr-1" />
                  {errors.adGoal}
                </p>
              )}

              <FormField
                control={form.control}
                name="variationCount"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Number of Ad Variations</FormLabel>
                    <FormControl>
                      <div>
                        <div className="flex items-center gap-4 mt-3">
                          {[1, 2, 3].map((num) => (
                            <button
                              key={num}
                              type="button"
                              onClick={() => {
                                setVariationCount(num);
                                form.setValue("variationCount", num);
                              }}
                              className={`
                              w-14 h-14 rounded-lg flex items-center justify-center text-lg font-medium
                              border-2 transition-all
                              ${
                                num === variationCount
                                  ? "bg-brand-100 dark:bg-brand-900/20 text-brand-700 dark:text-brand-300 border-brand-500 shadow-md"
                                  : "bg-background text-foreground border-border hover:border-brand-300 dark:hover:border-brand-700 hover:bg-brand-50 dark:hover:bg-brand-900/10"
                              }
                            `}
                            >
                              {num}
                            </button>
                          ))}
                        </div>
                        {/* <div className="mt-3 text-sm text-muted-foreground">
                          Generate {variationCount}{" "}
                          {variationCount === 1 ? "variation" : "variations"}
                        </div> */}
                        <div className="mt-2 text-sm text-muted-foreground">
                          Credit cost: {variationCount} credit
                          {variationCount !== 1 ? "s" : ""} per template
                        </div>
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="additionalContext"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Additional Context (Optional)</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="e.g., 'Black Friday sale – up to 60% off', 'Use bright holiday colors'"
                        {...field}
                        onChange={(e) => {
                          field.onChange(e);
                          handleTextChange(e);
                        }}
                        rows={3}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="additionalInstructions"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Additional Instructions (Optional)</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="e.g., 'Highlight the new feature', 'Focus on sustainability'"
                        {...field}
                        onChange={(e) => {
                          field.onChange(e);
                          handleTextChange(e);
                        }}
                        rows={3}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </CardContent>
            <CardFooter className="justify-end">
              <Button type="submit" variant="brand" size="lg" className="gap-2">
                Select a Template
                <ArrowRight className="h-4 w-4" />
              </Button>
            </CardFooter>
          </Card>
        </form>
      </Form>
    </div>
  );
};

// Helper function to determine the group ID from the aspect ratio
const dimensionGroupForRatio = (ratio: string): string => {
  switch (ratio) {
    case "1:1":
    case "4:5":
      return "feed-gallery";
    case "3:2":
    case "16:9":
    case "4:3":
      return "widescreen-display";
    case "2:3":
    case "9:16":
      return "story-vertical";
    default:
      return "";
  }
};
