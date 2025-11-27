"use client";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useQuery } from "@tanstack/react-query";
import { Loader2 } from "lucide-react";
import Image from "next/image";
import React, { useEffect, useState } from "react";

// UI Components
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

// Icons
import { ArrowLeft, Check, X } from "lucide-react";

// Custom Components
import AdCreationStepper from "@/components/ads/AdCreationStepper";
import TemplateCreator from "@/components/dialogs/TemplateCreator";
import EnhancedTemplateFilters from "@/components/templates/EnhancedTemplateFilters";
import { TemplatePagination } from "@/components/templates/TemplatePagination";

// Hooks and Context
import { TemplateCard } from "@/components/cards/TemplateCard";
import { filterOptions } from "@/constants/filters";
import { AdTemplate } from "@/contexts/AdContext";
import { useAdCreation } from "@/contexts/AdCreationContext";
import { useAuthFetch } from "@/hooks/use-auth-fetch";
import { toast } from "@/hooks/use-toast";

interface AdTemplateSearchProps {
  onBack: () => void;
}

const AdTemplateSearch: React.FC<AdTemplateSearchProps> = ({ onBack }) => {
  const { authFetch } = useAuthFetch();
  const {
    adCreationData,
    addTemplate,
    removeTemplate,
    submitAdCreation,
    isSubmitting,
  } = useAdCreation();

  // State for filters and pagination
  const [searchTerm, setSearchTerm] = useState("");
  const [activeTab, setActiveTab] = useState("preset-templates");
  const [sortBy, setSortBy] = useState<"category" | "brand" | "niche">(
    "category"
  );
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("asc");
  const [page, setPage] = useState(1);
  const limit = 16; // Show more templates per page
  const [loadedTemplates, setLoadedTemplates] = useState<AdTemplate[]>([]);

  const [filters, setFilters] = useState({
    creator: null as string | null,
    niche: null as string | null,
  });

  // Add a new state to track if we're loading more templates
  const [isLoadingMore, setIsLoadingMore] = useState(false);

  // Add state for the loading dialog
  const [showLoadingDialog, setShowLoadingDialog] = useState(false);
  const [uploadProgress, setUploadProgress] = useState("Preparing files...");

  // Build query parameters
  const buildQueryParams = () => {
    const params = new URLSearchParams();
    params.append("page", page.toString());
    params.append("limit", limit.toString());

    if (searchTerm) params.append("search", searchTerm);
    if (filters.creator) params.append("creator", filters.creator);
    if (filters.niche) params.append("niche", filters.niche);

    return params.toString();
  };

  // Fetch preset templates
  const {
    data: presetTemplatesData,
    isLoading: isLoadingPresets,
    error: presetsError,
    refetch: refetchPresetTemplates,
  } = useQuery({
    queryKey: ["presetTemplates", page, limit, searchTerm, filters, activeTab],
    queryFn: async () => {
      const response = await authFetch(
        `/templates/presets?${buildQueryParams()}`
      );
      if (!response.ok) {
        throw new Error("Failed to fetch preset templates");
      }
      return response.json();
    },
    enabled: activeTab === "preset-templates",
  });

  // Fetch user templates
  const {
    data: userTemplatesData,
    isLoading: isLoadingUserTemplates,
    error: userTemplatesError,
    refetch: refetchUserTemplates,
  } = useQuery({
    queryKey: ["userTemplates", page, limit, searchTerm, filters, activeTab],
    queryFn: async () => {
      const response = await authFetch(
        `/templates/user?${buildQueryParams()}`
      );
      if (!response.ok) {
        throw new Error("Failed to fetch user templates");
      }
      return response.json();
    },
    enabled: activeTab === "user-templates",
  });

  // Fetch all templates for the selected templates section
  const {
    data: allTemplatesData,
    refetch: refetchAllTemplates,
  } = useQuery({
    queryKey: ["allTemplates"],
    queryFn: async () => {
      // Fetch both preset and user templates without pagination
      const presetResponse = await authFetch(
        `/templates/presets?limit=100`
      );
      const userResponse = await authFetch(`/templates/user?limit=100`);

      if (!presetResponse.ok || !userResponse.ok) {
        throw new Error("Failed to fetch all templates");
      }

      const presetData = await presetResponse.json();
      const userData = await userResponse.json();

      return {
        templates: [...presetData.templates, ...userData.templates],
      };
    },
  });

  // Update allTemplates when data is fetched
  useEffect(() => {
    if (allTemplatesData?.templates) {
      setLoadedTemplates(
        activeTab === "preset-templates"
          ? presetTemplatesData?.templates || []
          : userTemplatesData?.templates || []
      );
    }
  }, [allTemplatesData, activeTab, presetTemplatesData, userTemplatesData]);

  // Determine which data to use based on active tab
  const templatesData =
    activeTab === "preset-templates" ? presetTemplatesData : userTemplatesData;

  const pagination = templatesData?.pagination || {
    total: 0,
    page: 1,
    limit: 16,
    pages: 1,
  };
  const isLoading =
    activeTab === "preset-templates"
      ? isLoadingPresets
      : isLoadingUserTemplates;
  const error =
    activeTab === "preset-templates" ? presetsError : userTemplatesError;

  // Reset to page 1 when filters change
  useEffect(() => {
    setPage(1);
  }, [searchTerm, filters, activeTab]);

  // Update the useEffect to handle templates based on active tab
  useEffect(() => {
    if (templatesData?.templates) {
      if (page === 1) {
        // Reset templates when filters change (page is reset to 1)
        setLoadedTemplates(templatesData.templates);
      } else if (
        activeTab === "preset-templates" &&
        presetTemplatesData?.templates
      ) {
        // Append new preset templates to existing ones
        setLoadedTemplates((prev) => {
          // Create a Set of existing template IDs to avoid duplicates
          const existingIds = new Set(prev.map((t) => t.id));
          // Only add templates that don't already exist
          const newTemplates = presetTemplatesData.templates.filter(
            (t: AdTemplate) => !existingIds.has(t.id)
          );
          return [...prev, ...newTemplates];
        });
      } else if (
        activeTab === "user-templates" &&
        userTemplatesData?.templates
      ) {
        // Append new user templates to existing ones
        setLoadedTemplates((prev) => {
          // Create a Set of existing template IDs to avoid duplicates
          const existingIds = new Set(prev.map((t) => t.id));
          // Only add templates that don't already exist
          const newTemplates = userTemplatesData.templates.filter(
            (t: AdTemplate) => !existingIds.has(t.id)
          );
          return [...prev, ...newTemplates];
        });
      }
    }
  }, [templatesData, page, activeTab, presetTemplatesData, userTemplatesData]);

  // Apply client-side sorting
  const sortedTemplates = [...loadedTemplates].sort((a, b) => {
    let valueA: string, valueB: string;

    switch (sortBy) {
      case "category":
        valueA = a.category || "";
        valueB = b.category || "";
        break;
      case "brand":
        valueA = a.brand || "";
        valueB = b.brand || "";
        break;
      case "niche":
        valueA = a.niche || "";
        valueB = b.niche || "";
        break;
      default:
        valueA = a.category || "";
        valueB = b.category || "";
    }

    if (sortOrder === "asc") {
      return valueA.localeCompare(valueB);
    } else {
      return valueB.localeCompare(valueA);
    }
  });

  // Get selected templates for display
  const selectedTemplates = adCreationData.selectedTemplates.map(
    (selectedTemplate) => {
      // Find the full template data from either preset or user templates
      const fullTemplate = [
        ...(presetTemplatesData?.templates || []),
        ...(userTemplatesData?.templates || []),
      ].find((t) => t.id === selectedTemplate.id);
      return fullTemplate || selectedTemplate;
    }
  );

  // Handlers
  const handleSearchChange = (value: string) => {
    setSearchTerm(value);
  };

  const handleFilterChange = (name: string, value: string | null) => {
    setFilters((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleClearFilters = () => {
    setFilters({
      creator: null,
      niche: null,
    });
    setSearchTerm("");
  };

  const handleTabChange = (value: string) => {
    setActiveTab(value);
  };

  const handleSortChange = (sortType: "category" | "brand" | "niche") => {
    setSortBy(sortType);
    setSortOrder(sortOrder === "asc" ? "desc" : "asc");
  };

  // Modify the handlePageChange function to handle pagination
  const handlePageChange = async (newPage: number) => {
    if (newPage < 1 || newPage > pagination.pages) return;

    setIsLoadingMore(true);
    setPage(newPage);

    // Wait for the query to complete
    if (activeTab === "preset-templates") {
      await refetchPresetTemplates();
    } else {
      await refetchUserTemplates();
    }

    setIsLoadingMore(false);

    // Scroll to top of results
    window.scrollTo({
      top: document.getElementById("templates-results")?.offsetTop || 0,
      behavior: "smooth",
    });
  };

  const handleSelectTemplate = (template: AdTemplate) => {
    // Check if the user has already selected 4 templates
    if (
      adCreationData.selectedTemplates.length >= 5 &&
      !adCreationData.selectedTemplates.some((t) => t.id === template.id)
    ) {
      toast({
        title: "Maximum templates reached",
        description: "You can select a maximum of 5 templates.",
        variant: "destructive",
      });
      return;
    }

    addTemplate(template);

    // Refetch all templates to update the selected templates section
    refetchAllTemplates();

    toast({
      title: "Template selected",
      description: `${template.category} template has been added to your selection.`,
      variant: "default",
    });
  };

  const handleRemoveTemplate = (template: AdTemplate) => {
    removeTemplate(template);

    // Refetch all templates to update the selected templates section
    refetchAllTemplates();
  };

  const handleProceed = async () => {
    if (adCreationData.selectedTemplates.length === 0) {
      toast({
        title: "No templates selected",
        description: "Please select at least one template to proceed.",
        variant: "destructive",
      });
      return;
    }

    try {
      // Show the loading dialog
      setShowLoadingDialog(true);

      // Start with preparing files message
      setUploadProgress("Preparing files...");

      // Wait a moment to show the initial message
      await new Promise((resolve) => setTimeout(resolve, 500));

      // Update to uploading message
      setUploadProgress("Uploading media files...");

      // Submit the ad creation
      await submitAdCreation();

      // Update to redirecting message
      setUploadProgress("Redirecting to your progress page...");

      toast({
        title: "Ad creation submitted",
        description:
          "Your ad creation is in progress. Please check your progress page for updates.",
        variant: "default",
      });

      // The redirect happens in the submitAdCreation function via router.push
    } catch (error) {
      // Hide the dialog on error
      setShowLoadingDialog(false);

      toast({
        title: "Error",
        description:
          error instanceof Error ? error.message : "Failed to create ad",
        variant: "destructive",
      });
    }
  };

  // Add a function to handle template creation
  const handleTemplateCreated = () => {
    // Refetch templates to include the newly created one
    if (activeTab === "preset-templates") {
      refetchPresetTemplates();
    } else {
      refetchUserTemplates();
    }

    // Also refetch all templates for the selected templates section
    refetchAllTemplates();

    // Optionally, automatically select the newly created template
    // addTemplate(newTemplate);

    // Show success toast
    toast({
      title: "Template created",
      description: "Your new template has been added and selected.",
      variant: "default",
    });
  };

  return (
    <div className="mx-auto space-y-6">
      <div className="">
        <Button variant="ghost" className="gap-1" onClick={onBack}>
          <ArrowLeft className="h-4 w-4" />
          Back to Thumbnail Details
        </Button>

        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <h1 className="text-xl sm:text-2xl font-bold">Select Thumbnail Templates</h1>

          <div className="flex gap-2">
            <TemplateCreator onTemplateCreated={handleTemplateCreated} />
            <Button
              onClick={handleProceed}
              variant="brand"
              className="gap-2"
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                "Submitting..."
              ) : (
                <>
                  <Check className="h-4 w-4" />
                  Create Thumbnail
                </>
              )}
            </Button>
          </div>
        </div>
      </div>

      <AdCreationStepper
        currentStep={2}
        steps={[
          { id: 1, name: "Ad Details" },
          { id: 2, name: "Select Template" },
        ]}
      />

      {/* Selected Templates Section - Always visible */}
      <div className="mb-6 bg-muted/30 p-4 rounded-lg border">
        <div className="flex justify-between items-center mb-3">
          <h2 className="text-lg font-semibold">Selected Templates</h2>
          <div className="text-sm text-muted-foreground">
            {selectedTemplates.length} of 5 selected
          </div>
        </div>
        <div className="text-sm text-muted-foreground mb-3">
          Credit cost:{" "}
          {selectedTemplates.length * (adCreationData.variationCount || 1)}{" "}
          credits total ({adCreationData.variationCount || 1} credits per
          template)
        </div>

        {selectedTemplates.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            No templates selected yet. Select templates from below to add them
            here.
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-5 gap-3">
            {selectedTemplates.map((template) => (
              <div
                key={template.id}
                className="relative border rounded-md overflow-hidden  bg-background"
              >
                <div className="relative w-full aspect-[4/3]">
                  <Image
                    src={template.image}
                    alt={template.category}
                    fill
                    sizes="(max-width: 640px) 50vw, (max-width: 1024px) 25vw, 20vw"
                    className="object-cover"
                    priority={false}
                  />
                </div>
                <div className="p-2">
                  <p className="font-medium text-xs truncate">
                    {template.category}
                  </p>
                  <p className="text-xs text-muted-foreground truncate">
                    {template.brand}
                  </p>
                </div>
                <button
                  className="absolute top-1 right-1 bg-red-500 text-white rounded-full p-1"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleRemoveTemplate(template);
                  }}
                >
                  <X className="h-3 w-3" />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      <Tabs value={activeTab} onValueChange={handleTabChange}>
        <TabsList className="mb-6">
          <TabsTrigger value="preset-templates">Preset Templates</TabsTrigger>
          <TabsTrigger value="user-templates">Your Templates</TabsTrigger>
        </TabsList>

        <EnhancedTemplateFilters
          searchTerm={searchTerm}
          onSearchChange={handleSearchChange}
          filters={filters}
          onFilterChange={handleFilterChange}
          onClearFilters={handleClearFilters}
          sortBy={sortBy}
          sortOrder={sortOrder}
          onSortChange={handleSortChange}
          creatorOptions={filterOptions.brands}
          nicheOptions={filterOptions.niches}
        />

        <div className="mt-6" id="templates-results">
          {isLoading ? (
            <div className="text-center py-10">Loading templates...</div>
          ) : error ? (
            <div className="text-center py-10 text-red-500">
              Error loading templates: {(error as Error).message}
            </div>
          ) : sortedTemplates.length === 0 ? (
            <div className="text-center py-10">
              No templates found. Try adjusting your filters.
            </div>
          ) : (
            <>
              <TabsContent value="preset-templates">
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                  {sortedTemplates.map((template) => (
                    <TemplateCard
                      key={template.id}
                      template={template}
                      isSelected={adCreationData.selectedTemplates.some(
                        (t) => t.id === template.id
                      )}
                      onSelect={handleSelectTemplate}
                      type="select"
                    />
                  ))}
                </div>
              </TabsContent>

              <TabsContent value="user-templates">
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                  {sortedTemplates.map((template) => (
                    <TemplateCard
                      key={template.id}
                      template={template}
                      isSelected={adCreationData.selectedTemplates.some(
                        (t) => t.id === template.id
                      )}
                      onSelect={handleSelectTemplate}
                      type="select"
                    />
                  ))}
                </div>
              </TabsContent>

              {/* Pagination */}
              <TemplatePagination
                pagination={pagination}
                onPageChange={handlePageChange}
                isLoadingMore={isLoadingMore}
              />
            </>
          )}
        </div>
      </Tabs>

      <div className="mb-6"></div>

      {/* Add the loading dialog */}
      <Dialog open={showLoadingDialog} onOpenChange={setShowLoadingDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Creating Your Ad</DialogTitle>
            <DialogDescription>
              Please wait while we process your request.
            </DialogDescription>
          </DialogHeader>
          <div className="flex flex-col items-center justify-center py-6">
            <Loader2 className="h-10 w-10 text-brand-500 animate-spin mb-4" />
            <p className="text-center text-sm">{uploadProgress}</p>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AdTemplateSearch;
