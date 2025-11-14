"use client";
import React, { useState, useEffect, useMemo } from "react";
import { useSearchParams } from "next/navigation";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { AdTemplate } from "@/contexts/AdContext";
import PresetTemplateGallery from "@/components/templates/PresetTemplateGallery";
import UserTemplateGallery from "@/components/templates/UserTemplateGallery";
import { useQuery } from "@tanstack/react-query";
import { useAuthFetch } from "@/hooks/use-auth-fetch";
import { TemplatePagination } from "@/components/templates/TemplatePagination";
import Breadcrumb from "@/components/Breadcrumb";
import { useToast } from "@/hooks/use-toast";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Search, User, Tag, ChevronDown, FilterX } from "lucide-react";

// Constants
const TEMPLATES_PER_PAGE = 12; // Match TemplateSelector

const AllTemplates = () => {
  const { authFetch } = useAuthFetch();
  const searchParams = useSearchParams();
  const { toast } = useToast();
  const [searchTerm, setSearchTerm] = useState("");
  const [activeTab, setActiveTab] = useState("preset-templates");
  const [page, setPage] = useState(1);
  const [limit] = useState(TEMPLATES_PER_PAGE);
  const [highlightTemplateId, setHighlightTemplateId] = useState<string | null>(null);

  const [filters, setFilters] = useState({
    creator: "all",
    tag: "all",
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

  // Query for fetching ALL templates metadata (for filters)
  const { data: allTemplatesData } = useQuery({
    queryKey: ["templates-metadata", activeTab],
    queryFn: async () => {
      const params = new URLSearchParams({
        page: "1",
        limit: "1000", // Get a large number to fetch all metadata
      });

      const endpoint = activeTab === "user-templates" 
        ? `/api/templates/user?${params.toString()}`
        : `/api/templates/presets?${params.toString()}`;
      
      const response = await authFetch(endpoint);

      if (!response.ok) {
        throw new Error(`Failed to fetch template metadata`);
      }

      return response.json();
    },
    staleTime: 5 * 60 * 1000, // Cache for 5 minutes
  });

  // Build query parameters
  const buildQueryParams = () => {
    const params = new URLSearchParams();
    params.append("page", page.toString());
    params.append("limit", limit.toString());

    if (searchTerm) params.append("search", searchTerm);
    if (filters.creator !== "all") params.append("creator", filters.creator);
    if (filters.tag !== "all") {
      params.append("tag", filters.tag);
      params.append("category", filters.tag);
    }

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

  // Extract unique creators and tags from ALL templates (not just current page)
  const allTemplates = useMemo(() => {
    const data = allTemplatesData;
    return Array.isArray(data) ? data : data?.templates || [];
  }, [allTemplatesData]);

  const uniqueCreators = useMemo(() => {
    const creators = new Set<string>();
    allTemplates.forEach((template: any) => {
      if (template.creator) creators.add(template.creator);
    });
    return Array.from(creators).sort();
  }, [allTemplates]);

  const uniqueTags = useMemo(() => {
    const tags = new Set<string>();
    allTemplates.forEach((template: any) => {
      template.tags?.forEach((tag: string) => tags.add(tag));
    });
    return Array.from(tags).sort();
  }, [allTemplates]);

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

  const handleClearFilters = () => {
    setFilters({
      creator: "all",
      tag: "all",
    });
    setSearchTerm("");
    setPage(1);
  };

  const handleTabChange = (value: string) => {
    setActiveTab(value);
    setPage(1); // Reset to page 1 when changing tabs
    
    // Clear filters when switching tabs to avoid "no templates found" issues
    // User templates might not have the same tags/categories as preset templates
    setFilters({
      creator: "all",
      tag: "all",
    });
    setSearchTerm("");
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
      const response = await authFetch(`/api/templates/${templateId}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: "Failed to delete template" }));
        throw new Error(errorData.error || "Failed to delete template");
      }

      // Show success toast
      toast({
        title: "Success",
        description: "Template deleted successfully",
      });

      // Refetch user templates after deletion
      await refetchUserTemplates();
    } catch (error) {
      console.error("Error deleting template:", error);
      
      // Show error toast
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to delete template",
        variant: "destructive",
      });
    }
  };

  const handleUseTemplate = (template: AdTemplate) => {
    console.log("Use template:", template);
    // Implement use template functionality
  };

  const hasActiveFilters = searchTerm.trim() !== "" || filters.creator !== "all" || filters.tag !== "all";

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
          <h1 className="text-3xl font-bold text-foreground">Thumbnail Templates</h1>
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

        {/* Modern Filters - Match TemplateSelector */}
        <div className="space-y-4 mb-6">
          {/* Search Bar and Dropdowns */}
          <div className="flex flex-col lg:flex-row gap-3">
            {/* Search Input */}
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search templates..."
                value={searchTerm}
                onChange={(e) => {
                  setSearchTerm(e.target.value);
                  setPage(1);
                }}
                className="pl-9"
              />
            </div>

            {/* Dropdowns */}
            <div className="flex gap-3">
              {/* Creator Filter */}
              <Select
                value={filters.creator}
                onValueChange={(value) => {
                  setFilters((prev) => ({ ...prev, creator: value }));
                  setPage(1);
                }}
              >
                <SelectTrigger className="w-[180px]">
                  <div className="flex items-center gap-2">
                    <User className="h-4 w-4" />
                    <SelectValue placeholder="All Creators" />
                  </div>
                </SelectTrigger>
                <SelectContent className="max-h-[400px] w-[320px]">
                  <SelectItem value="all">All Creators</SelectItem>
                  <div className="grid grid-cols-2 gap-1 p-1">
                    {uniqueCreators.map((creator) => (
                      <SelectItem key={creator} value={creator} className="col-span-1">
                        {creator}
                      </SelectItem>
                    ))}
                  </div>
                </SelectContent>
              </Select>

              {/* Category Dropdown (synced with badges) */}
              <Select
                value={filters.tag}
                onValueChange={(value) => {
                  setFilters((prev) => ({ ...prev, tag: value }));
                  setPage(1);
                }}
              >
                <SelectTrigger className="w-[180px]">
                  <div className="flex items-center gap-2">
                    <Tag className="h-4 w-4" />
                    <SelectValue placeholder="All Categories" />
                  </div>
                </SelectTrigger>
                <SelectContent className="max-h-[400px]">
                  <SelectItem value="all">All Categories</SelectItem>
                  <div className="grid grid-cols-2 gap-1 p-1">
                    {uniqueTags.map((tag) => (
                      <SelectItem key={tag} value={tag} className="col-span-1">
                        {tag}
                      </SelectItem>
                    ))}
                  </div>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Category Badges - Only show if there are categories */}
          {uniqueTags.length > 0 && (
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-sm text-muted-foreground flex items-center gap-1.5">
                <Tag className="h-3.5 w-3.5" />
                Categories:
              </span>
              
              {/* All Badge */}
              <Badge
                variant={filters.tag === "all" ? "default" : "outline"}
                className="cursor-pointer hover:bg-primary/10 transition-colors"
                onClick={() => {
                  setFilters((prev) => ({ ...prev, tag: "all" }));
                  setPage(1);
                }}
              >
                All
              </Badge>
              
              {/* First 4 categories */}
              {uniqueTags.slice(0, 4).map((tag) => (
                <Badge
                  key={tag}
                  variant={filters.tag === tag ? "default" : "outline"}
                  className="cursor-pointer hover:bg-primary/10 transition-colors"
                  onClick={() => {
                    setFilters((prev) => ({ ...prev, tag }));
                    setPage(1);
                  }}
                >
                  {tag}
                </Badge>
              ))}
              
              {/* More dropdown */}
              {uniqueTags.length > 4 && (
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="outline" size="sm" className="h-7 px-2 gap-1">
                      More
                      <ChevronDown className="h-3.5 w-3.5" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent className="w-[400px] max-h-[300px] overflow-y-auto p-3">
                    <div className="grid grid-cols-2 gap-2">
                      {uniqueTags.slice(4).map((tag) => (
                        <Badge
                          key={tag}
                          variant={filters.tag === tag ? "default" : "outline"}
                          className="cursor-pointer hover:bg-primary/10 transition-colors justify-center"
                          onClick={() => {
                            setFilters((prev) => ({ ...prev, tag }));
                            setPage(1);
                          }}
                        >
                          {tag}
                        </Badge>
                      ))}
                    </div>
                  </DropdownMenuContent>
                </DropdownMenu>
              )}

              {/* Clear Filters */}
              {hasActiveFilters && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleClearFilters}
                  className="h-7 px-2 ml-2"
                >
                  <FilterX className="h-3.5 w-3.5 mr-1.5" />
                  Clear
                </Button>
              )}
            </div>
          )}
          
          {/* Show message if no categories available for user templates */}
          {uniqueTags.length === 0 && activeTab === "user-templates" && (
            <div className="text-sm text-muted-foreground italic">
              Your custom templates don't have categories yet. Categories are available for preset templates.
            </div>
          )}

          {/* Results Count */}
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <span className="font-medium text-foreground">
              {pagination.total}
            </span>
            <span>
              template{pagination.total !== 1 ? 's' : ''} {hasActiveFilters ? 'found' : 'available'}
            </span>
          </div>
        </div>

        <div className="mt-6" id="templates-results">
          {isLoading ? (
            <div className="text-center py-10">Loading templates...</div>
          ) : error ? (
            <div className="text-center py-10 text-red-500">
              Error loading templates: {(error as Error).message}
            </div>
          ) : loadedTemplates.length === 0 ? (
            <div className="text-center py-10">
              <p className="text-lg font-medium mb-2">No templates found</p>
              {hasActiveFilters ? (
                <div className="space-y-2">
                  <p className="text-sm text-muted-foreground">
                    No templates match your current filters.
                  </p>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleClearFilters}
                    className="mt-3"
                  >
                    <FilterX className="h-4 w-4 mr-2" />
                    Clear all filters
                  </Button>
                </div>
              ) : activeTab === "user-templates" ? (
                <p className="text-sm text-muted-foreground">
                  You haven't created any custom templates yet.
                </p>
              ) : (
                <p className="text-sm text-muted-foreground">
                  No preset templates available at the moment.
                </p>
              )}
            </div>
          ) : (
            <>
              <TabsContent value="preset-templates">
                <PresetTemplateGallery
                  templates={loadedTemplates}
                  searchTerm={searchTerm}
                  onUseTemplate={handleUseTemplate}
                  highlightTemplateId={highlightTemplateId}
                />
              </TabsContent>

              <TabsContent value="user-templates">
                <UserTemplateGallery
                  templates={loadedTemplates}
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
