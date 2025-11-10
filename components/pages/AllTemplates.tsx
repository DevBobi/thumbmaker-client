"use client";
import React, { useState, useEffect, useMemo } from "react";
import { useSearchParams } from "next/navigation";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { AdTemplate } from "@/contexts/AdContext";
import PresetTemplateGallery from "@/components/templates/PresetTemplateGallery";
import UserTemplateGallery from "@/components/templates/UserTemplateGallery";
import EnhancedTemplateFilters from "@/components/templates/EnhancedTemplateFilters";
import { useQuery } from "@tanstack/react-query";
import { useAuthFetch } from "@/hooks/use-auth-fetch";
import { TemplatePagination } from "@/components/templates/TemplatePagination";
import { useTemplateFilters } from "@/hooks/use-template-filters";
import Breadcrumb from "@/components/Breadcrumb";
import { useToast } from "@/hooks/use-toast";

// Constants
const TEMPLATES_PER_PAGE = 12; // Match TemplateSelector

const AllTemplates = () => {
  const { authFetch } = useAuthFetch();
  const searchParams = useSearchParams();
  const { toast } = useToast();
  const [searchTerm, setSearchTerm] = useState("");
  const [activeTab, setActiveTab] = useState("preset-templates");
  const [sortBy, setSortBy] = useState<
    "category" | "brand" | "niche" | "subNiche"
  >("category");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("asc");
  const [page, setPage] = useState(1);
  const [limit] = useState(TEMPLATES_PER_PAGE);
  const [highlightTemplateId, setHighlightTemplateId] = useState<string | null>(null);

  const [filters, setFilters] = useState({
    creator: null as string | null,
    niche: null as string | null,
  });

  // State to track loaded templates
  const [loadedTemplates, setLoadedTemplates] = useState<AdTemplate[]>([]);

  // Handle query parameter for template highlighting
  useEffect(() => {
    const templateId = searchParams.get("template");
    if (templateId) {
      setHighlightTemplateId(templateId);
      setActiveTab("preset-templates");
      
      // Show toast notification
      toast({
        title: "Template Highlighted",
        description: `Showing Template ${templateId}`,
      });

      // Scroll after a short delay to ensure the page is loaded
      setTimeout(() => {
        const element = document.getElementById(`template-${templateId}`);
        if (element) {
          element.scrollIntoView({ behavior: "smooth", block: "center" });
        }
      }, 500);

      // Clear highlight after 3 seconds
      setTimeout(() => {
        setHighlightTemplateId(null);
      }, 3000);

      // Clear the query parameter from URL
      const url = new URL(window.location.href);
      url.searchParams.delete("template");
      window.history.replaceState({}, "", url.toString());
    }
  }, [searchParams, toast]);

  // Fetch filter options
  const { data: filterOptions, isLoading: isLoadingFilters } = useTemplateFilters();

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
  } = useQuery({
    queryKey: ["presetTemplates", page, limit, searchTerm, filters, activeTab],
    queryFn: async () => {
      const response = await authFetch(
        `/api/templates/presets?${buildQueryParams()}`
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
        `/api/templates/user?${buildQueryParams()}`
      );
      if (!response.ok) {
        throw new Error("Failed to fetch user templates");
      }
      return response.json();
    },
    enabled: activeTab === "user-templates",
  });

  // Determine which data to use based on active tab
  const templatesData =
    activeTab === "preset-templates" ? presetTemplatesData : userTemplatesData;
  
  // Handle different response structures - some APIs return arrays directly, others return objects
  const templates = useMemo(() => {
    return Array.isArray(templatesData) ? templatesData : templatesData?.templates || [];
  }, [templatesData]);
  
  const pagination = useMemo(() => {
    return templatesData?.pagination || {
      total: templates.length,
      page: page,
      limit: limit,
      pages: Math.ceil(templates.length / limit),
    };
  }, [templatesData, templates.length, page, limit]);
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
    if (templates && templates.length > 0) {
      // Always replace templates with the current page data instead of appending
      setLoadedTemplates(templates);
    } else {
      // Clear templates when no data
      setLoadedTemplates([]);
    }
  }, [templates]);


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

  const handleSortChange = (
    field: "category" | "brand" | "niche" | "subNiche"
  ) => {
    if (sortBy === field) {
      setSortOrder(sortOrder === "asc" ? "desc" : "asc");
    } else {
      setSortBy(field);
      setSortOrder("asc");
    }
  };

  const handleTabChange = (value: string) => {
    setActiveTab(value);
    setPage(1); // Reset to page 1 when changing tabs
  };

  // Simplified handlePageChange function - following TemplateSelector pattern
  const handlePageChange = (newPage: number) => {
    if (newPage < 1 || newPage > pagination.pages) return;
    
    setPage(newPage);
    
    // Scroll to top of results
    setTimeout(() => {
      window.scrollTo({
        top: document.getElementById("templates-results")?.offsetTop || 0,
        behavior: "smooth",
      });
    }, 100);
  };

  const handleEditTemplate = (template: AdTemplate) => {
    console.log("Edit template:", template);
    // Implement edit functionality
  };

  const handleDeleteTemplate = async (templateId: string) => {
    try {
      const response = await fetch(`/api/templates/${templateId}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        throw new Error("Failed to delete template");
      }

      // Refetch user templates after deletion
      refetchUserTemplates();
    } catch (error) {
      console.error("Error deleting template:", error);
    }
  };

  const handleUseTemplate = (template: AdTemplate) => {
    console.log("Use template:", template);
    // Implement use template functionality
  };

  // Apply client-side sorting to loadedTemplates instead of templates
  const sortedTemplates = [...loadedTemplates].sort((a, b) => {
    let valueA, valueB;

    switch (sortBy) {
      case "category":
        valueA = a.category;
        valueB = b.category;
        break;
      case "brand":
        valueA = a.brand;
        valueB = b.brand;
        break;
      case "niche":
        valueA = a.niche;
        valueB = b.niche;
        break;
      case "subNiche":
        valueA = a.subNiche;
        valueB = b.subNiche;
        break;
      default:
        valueA = a.category;
        valueB = b.category;
    }

    // Handle undefined/null values
    if (!valueA && !valueB) return 0;
    if (!valueA) return 1;
    if (!valueB) return -1;

    if (sortOrder === "asc") {
      return valueA.localeCompare(valueB);
    } else {
      return valueB.localeCompare(valueA);
    }
  });

  // Add a function to clear search
  const handleClearSearch = () => {
    setSearchTerm("");
  };

  return (
    <div className="space-y-6">
      <Breadcrumb
        items={[
          { label: "Dashboard", href: "/dashboard" },
          { label: "Templates", href: "/dashboard/templates" },
        ]}
      />
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">Thumbnail Templates</h1>
          <p className="text-muted-foreground mt-1">
            Browse our preset templates or create your own custom templates
          </p>
        </div>
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
          creatorOptions={filterOptions?.creators || []}
          nicheOptions={filterOptions?.niches || []}
          isLoadingFilters={isLoadingFilters}
          totalCount={pagination.total}
          filteredCount={sortedTemplates.length}
        />

        <div className="mt-6" id="templates-results">
          {isLoading ? (
            <div className="text-center py-10">Loading templates...</div>
          ) : error ? (
            <div className="text-center py-10 text-red-500">
              Error loading templates: {(error as Error).message}
            </div>
          ) : sortedTemplates.length === 0 &&
            activeTab === "preset-templates" ? (
            <div className="text-center py-10">
              No templates found. Try adjusting your filters.
            </div>
          ) : (
            <>
              <TabsContent value="preset-templates">
                <PresetTemplateGallery
                  templates={sortedTemplates}
                  searchTerm={searchTerm}
                  onUseTemplate={handleUseTemplate}
                  highlightTemplateId={highlightTemplateId}
                />
              </TabsContent>

              <TabsContent value="user-templates">
                <UserTemplateGallery
                  templates={sortedTemplates}
                  searchTerm={searchTerm}
                  onEditTemplate={(updatedTemplate) => {
                    // This will handle both edits and new template creation
                    handleEditTemplate(updatedTemplate);
                    // Refetch to ensure the list is updated
                    refetchUserTemplates();
                  }}
                  onDeleteTemplate={handleDeleteTemplate}
                  onClearSearch={handleClearSearch}
                />
              </TabsContent>

              {/* Replace the old pagination with TemplatePagination */}
              <TemplatePagination
                pagination={pagination}
                onPageChange={handlePageChange}
                isLoadingMore={isLoading}
              />
            </>
          )}
        </div>
      </Tabs>
    </div>
  );
};

export default AllTemplates;
