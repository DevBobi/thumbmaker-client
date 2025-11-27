"use client";
import React, { useState, useEffect, useMemo, useRef } from "react";
import { useSearchParams } from "next/navigation";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { AdTemplate } from "@/contexts/AdContext";
import PresetTemplateGallery from "@/components/templates/PresetTemplateGallery";
import UserTemplateGallery from "@/components/templates/UserTemplateGallery";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useAuthFetch } from "@/hooks/use-auth-fetch";
import { TemplatePagination } from "@/components/templates/TemplatePagination";
import Breadcrumb from "@/components/Breadcrumb";
import { useToast } from "@/hooks/use-toast";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
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
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Search, User, Tag, FilterX, Search as SearchIcon, ChevronDown, AlertCircle, RefreshCw, Plus, Sparkles } from "lucide-react";
import TemplateCreator from "@/components/dialogs/TemplateCreator";

// Constants
const TEMPLATES_PER_PAGE = 12; // Match TemplateSelector

const AllTemplates = () => {
  const { authFetch } = useAuthFetch();
  const queryClient = useQueryClient();
  const searchParams = useSearchParams();
  const { toast } = useToast();
  const [searchTerm, setSearchTerm] = useState("");
  const [creatorSearch, setCreatorSearch] = useState("");
  const [categorySearch, setCategorySearch] = useState("");
  const [activeTab, setActiveTab] = useState("preset-templates");
  const [page, setPage] = useState(1);
  const [limit] = useState(TEMPLATES_PER_PAGE);
  const [highlightTemplateId, setHighlightTemplateId] = useState<string | null>(null);
  const [openTemplateCreator, setOpenTemplateCreator] = useState(false);
  const templateCreatorTriggerRef = useRef<HTMLButtonElement>(null);

  const [filters, setFilters] = useState({
    creator: "all",
    tag: "all",
  });

  // State to track loaded templates
  const [loadedTemplates, setLoadedTemplates] = useState<AdTemplate[]>([]);
  
  // State to track if we should refetch after tab switch
  const [shouldRefetchOnTabSwitch, setShouldRefetchOnTabSwitch] = useState(false);

  // Trigger template creator when openTemplateCreator state changes
  useEffect(() => {
    if (openTemplateCreator && templateCreatorTriggerRef.current) {
      templateCreatorTriggerRef.current.click();
      setOpenTemplateCreator(false);
    }
  }, [openTemplateCreator]);

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
        ? `/templates/user?${params.toString()}`
        : `/templates/presets?${params.toString()}`;
      
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
      params.append("tags", filters.tag);
    }

    return params.toString();
  };

  // Fetch preset templates
  const {
    data: presetTemplatesData,
    isLoading: isLoadingPresets,
    error: presetsError,
    refetch: refetchPresets,
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
  const refetch = activeTab === "preset-templates" ? refetchPresets : refetchUserTemplates;

  // Extract unique creators and tags from ALL templates (not just current page)
  const { uniqueTags, filteredCreators, filteredCategories } = useMemo(() => {
    const creators = new Set<string>();
    const tags = new Set<string>();

    allTemplatesData?.templates?.forEach((template: any) => {
      if (template.creator) {
        creators.add(template.creator);
      }
      template.tags?.forEach((tag: string) => {
        // Filter out extremely long tags that might be titles
        if (tag && tag.length <= 25) {
          tags.add(tag);
        }
      });
    });

    const uniqueCreatorsList = Array.from(creators).sort();
    const uniqueTagsList = Array.from(tags).sort();

    return {
      uniqueTags: uniqueTagsList,
      filteredCreators: uniqueCreatorsList.filter(creator => 
        creator.toLowerCase().includes(creatorSearch.toLowerCase())
      ),
      filteredCategories: uniqueTagsList.filter(tag =>
        tag.toLowerCase().includes(categorySearch.toLowerCase())
      )
    };
  }, [allTemplatesData, creatorSearch, categorySearch]);

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

  // Refetch when tab switches to user-templates after template creation
  useEffect(() => {
    if (activeTab === "user-templates" && shouldRefetchOnTabSwitch) {
      // Invalidate all user templates queries
      queryClient.invalidateQueries({ queryKey: ["userTemplates"] });
      queryClient.invalidateQueries({ queryKey: ["templates-metadata", "user-templates"] });
      
      // Refetch the current query
      refetchUserTemplates();
      
      // Reset the flag
      setShouldRefetchOnTabSwitch(false);
    }
  }, [activeTab, shouldRefetchOnTabSwitch, queryClient, refetchUserTemplates]);

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
      const response = await authFetch(`/templates/${templateId}`, {
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
        <div className="hidden">
          <TemplateCreator
            customTrigger={
              <button
                ref={templateCreatorTriggerRef}
                style={{ display: 'none' }}
                aria-hidden="true"
              />
            }
            onTemplateCreated={() => {
              // Switch to user templates tab and mark for refetch
              setShouldRefetchOnTabSwitch(true);
              setActiveTab("user-templates");
            }}
          />
        </div>
        <TemplateCreator
          onTemplateCreated={() => {
            // Switch to user templates tab and mark for refetch
            setShouldRefetchOnTabSwitch(true);
            setActiveTab("user-templates");
          }}
        />
      </div>

      <Tabs value={activeTab} onValueChange={handleTabChange}>
        <TabsList className="mb-6">
          <TabsTrigger value="preset-templates">Preset Templates</TabsTrigger>
          <TabsTrigger value="user-templates">Your Templates</TabsTrigger>
        </TabsList>

        {/* Search and Filters */}
        <div className="space-y-4 mb-6">
          {/* Search Input - Full width */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search templates by name, tag, or description..."
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                setPage(1);
              }}
              className="pl-9"
            />
          </div>

          {/* Filters Row */}
          <div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
            {/* Category Filter - Badges with More dropdown */}
            {uniqueTags.length > 0 && (
              <div className="flex items-center gap-2 flex-1 min-w-0 flex-wrap lg:flex-nowrap">
                <span className="text-sm text-muted-foreground flex items-center gap-1.5">
                  <Tag className="h-3.5 w-3.5" />
                  Tags:
                </span>
                
                {/* All Badge */}
                <Badge
                  variant={filters.tag === "all" ? "default" : "outline"}
                  className="cursor-pointer hover:bg-primary/10 transition-colors h-7 px-2 text-xs"
                  onClick={() => {
                    setFilters((prev) => ({ ...prev, tag: "all" }));
                    setPage(1);
                  }}
                >
                  All
                </Badge>
                
                {/* First 5 categories as badges */}
                {uniqueTags.slice(0, 5).map((tag) => (
                  <Badge
                    key={tag}
                    variant={filters.tag === tag ? "default" : "outline"}
                    className="cursor-pointer hover:bg-primary/10 transition-colors h-7 px-2 text-xs"
                    onClick={() => {
                      setFilters((prev) => ({
                        ...prev,
                        tag: prev.tag === tag ? "all" : tag,
                      }));
                      setPage(1);
                    }}
                  >
                    {tag}
                  </Badge>
                ))}
                
                {/* More dropdown for additional categories */}
                {uniqueTags.length > 5 && (
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="outline" size="sm" className="h-7 px-2 gap-1">
                        More
                        <ChevronDown className="h-3.5 w-3.5" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent 
                      align="start"
                      side="bottom"
                      sideOffset={4}
                      className="w-[calc(100vw-2rem)] sm:w-[min(320px,calc(100vw-2rem))] md:w-[min(360px,calc(100vw-2rem))] lg:w-[min(400px,calc(100vw-2rem))] p-0"
                    >
                      <div className="relative px-3 pt-2">
                        <SearchIcon className="absolute left-6 top-5 h-4 w-4 text-muted-foreground" />
                        <Input
                          placeholder="Search tags..."
                          value={categorySearch}
                          onChange={(e) => setCategorySearch(e.target.value)}
                          className="pl-8 h-9 mb-2"
                          onClick={(e) => e.stopPropagation()}
                        />
                      </div>
                      <div className="max-h-[50vh] sm:max-h-[400px] overflow-y-auto p-2">
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                          {/* If searching, show all filtered categories. Otherwise, show only those after the first 5 */}
                          {(() => {
                            const firstFiveTags = uniqueTags.slice(0, 5);
                            const categoriesToShow = categorySearch.trim() 
                              ? filteredCategories // When searching, show all matching results
                              : filteredCategories.filter(tag => !firstFiveTags.includes(tag)); // When not searching, exclude first 5
                            
                            return categoriesToShow.length > 0 ? (
                              categoriesToShow.map((tag) => (
                                <Badge
                                  key={tag}
                                  variant={filters.tag === tag ? "default" : "outline"}
                                  className="cursor-pointer hover:bg-primary/10 transition-colors justify-center text-xs sm:text-sm"
                                  onClick={() => {
                                    setFilters((prev) => ({
                                      ...prev,
                                      tag: prev.tag === tag ? "all" : tag,
                                    }));
                                    setPage(1);
                                    setCategorySearch(""); // Clear search after selection
                                  }}
                                >
                                  {tag}
                                </Badge>
                              ))
                            ) : (
                              <div className="col-span-full text-center py-4 text-sm text-muted-foreground">
                                {categorySearch.trim() ? "No tags found" : "No additional tags"}
                              </div>
                            );
                          })()}
                        </div>
                      </div>
                    </DropdownMenuContent>
                  </DropdownMenu>
                )}
              </div>
            )}

            {/* Creator Filter and Clear Button Row */}
            <div className="flex items-center gap-3 w-full lg:w-auto min-w-[220px] justify-start lg:justify-end flex-wrap">
              {/* Creator Filter */}
              <div className="w-full sm:w-60 lg:w-64">
                <Select
                  value={filters.creator}
                  onValueChange={(value) => {
                    setFilters((prev) => ({ ...prev, creator: value }));
                    setPage(1);
                  }}
                >
                  <SelectTrigger className="w-full sm:w-full">
                    <div className="flex items-center gap-2">
                      <User className="h-4 w-4" />
                      <SelectValue placeholder="Filter by creator" />
                    </div>
                  </SelectTrigger>
                  <SelectContent className="p-0 w-[calc(100vw-2rem)] sm:w-[300px] md:w-[400px] max-w-[95vw]">
                    <div className="relative px-3 pt-2">
                      <SearchIcon className="absolute left-6 top-5 h-4 w-4 text-muted-foreground" />
                      <Input
                        placeholder="Search creators..."
                        value={creatorSearch}
                        onChange={(e) => setCreatorSearch(e.target.value)}
                        className="pl-8 h-9 mb-2"
                        onClick={(e) => e.stopPropagation()}
                      />
                    </div>
                    <div className="max-h-[50vh] sm:max-h-[400px] overflow-y-auto px-1">
                      <SelectItem value="all" className="font-medium">All Creators</SelectItem>
                      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-2 gap-1">
                        {filteredCreators.map((creator) => (
                          <SelectItem 
                            key={creator} 
                            value={creator}
                            className="col-span-1 text-xs sm:text-sm"
                          >
                            {creator}
                          </SelectItem>
                        ))}
                        {filteredCreators.length === 0 && (
                          <div className="col-span-full text-center py-4 text-sm text-muted-foreground">
                            No creators found
                          </div>
                        )}
                      </div>
                    </div>
                  </SelectContent>
                </Select>
              </div>

              {/* Clear Filters Button - Now right next to the creator filter */}
              {hasActiveFilters && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleClearFilters}
                  className="h-9 px-3 flex-shrink-0"
                >
                  <FilterX className="h-4 w-4 mr-2" />
                  Clear Filters
                </Button>
              )}
            </div>
          </div>

          {/* Show message if no categories available for user templates */}
          {uniqueTags.length === 0 && activeTab === "user-templates" && (
            <div className="text-sm text-muted-foreground italic">
              Your custom templates don't have tags yet. Tags are available for preset templates.
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
          ) : error && activeTab === "user-templates" ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              <Card 
                className="group cursor-pointer hover:shadow-lg transition-all duration-300 border-2 border-dashed hover:border-primary/50 bg-gradient-to-br from-muted/50 to-muted"
                onClick={() => setOpenTemplateCreator(true)}
              >
                <CardContent className="flex flex-col items-center justify-center min-h-[280px] p-6 text-center">
                  <div className="relative mb-4">
                    <div className="absolute inset-0 bg-primary/10 rounded-full blur-xl group-hover:bg-primary/20 transition-colors" />
                    <div className="relative bg-primary/10 rounded-full p-4 group-hover:bg-primary/20 transition-colors">
                      <Plus className="h-8 w-8 text-primary" />
                    </div>
                  </div>
                  <h3 className="text-xl font-bold mb-2 group-hover:text-primary transition-colors">
                    Create Your First Template
                  </h3>
                  <p className="text-sm text-muted-foreground mb-4 max-w-xs">
                    Start building your custom thumbnail template library.
                  </p>
                  <Button 
                    size="default" 
                    className="gap-2 group-hover:scale-105 transition-transform"
                    onClick={(e) => {
                      e.stopPropagation();
                      setOpenTemplateCreator(true);
                    }}
                  >
                    <Plus className="h-4 w-4" />
                    Create Template
                  </Button>
                  <div className="mt-4 flex items-center gap-2 text-xs text-muted-foreground">
                    <Sparkles className="h-3 w-3" />
                    <span>Unlock unlimited creativity</span>
                  </div>
                </CardContent>
              </Card>
            </div>
          ) : error ? (
            <Card className="max-w-2xl mx-auto">
              <CardContent className="pt-6">
                <Alert variant="destructive">
                  <AlertCircle className="h-4 w-4" />
                  <AlertTitle className="text-base font-semibold">
                    Unable to Load Templates
                  </AlertTitle>
                  <AlertDescription className="mt-2 space-y-3">
                    <p className="text-sm">
                      We couldn't load the preset templates. This might be due to a network issue or server problem.
                    </p>
                    <div className="flex flex-col sm:flex-row gap-2 pt-2">
                      <Button
                        variant="default"
                        size="sm"
                        onClick={() => refetch()}
                        className="w-full sm:w-auto"
                      >
                        <RefreshCw className="h-4 w-4 mr-2" />
                        Try Again
                      </Button>
                    </div>
                  </AlertDescription>
                </Alert>
              </CardContent>
            </Card>
          ) : loadedTemplates.length === 0 ? (
            <div className="text-center py-10 space-y-4">
              <div>
                <p className="text-lg font-medium mb-1">No templates found</p>
                {hasActiveFilters ? (
                  <>
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
                  </>
                ) : activeTab === "user-templates" ? (
                  <div className="space-y-3">
                    <p className="text-sm text-muted-foreground">
                      You haven&apos;t created any custom templates yet.
                    </p>
                    <Button
                      onClick={() => setOpenTemplateCreator(true)}
                      className="inline-flex items-center gap-2 px-5"
                    >
                      <Plus className="h-4 w-4" />
                      Add Template
                    </Button>
                  </div>
                ) : (
                  <p className="text-sm text-muted-foreground">
                    No preset templates available at the moment.
                  </p>
                )}
              </div>
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
