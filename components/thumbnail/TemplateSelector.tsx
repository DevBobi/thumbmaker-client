"use client";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useAuthFetch } from "@/hooks/use-auth-fetch";
import { cn } from "@/lib/utils";
import { useQuery } from "@tanstack/react-query";
import {
  Check,
  ExternalLink,
  X,
  FilterX,
  Tag,
  User,
  ChevronDown,
  Search,
  Search as SearchIcon,
} from "lucide-react";
import React, { useCallback, useEffect, useState } from "react";

// Types
interface Template {
  id: string;
  userId: string | null;
  title: string;
  description: string;
  image: string;
  link: string;
  tags: string[];
  creator: string;
  createdAt: string;
  updatedAt: string;
}

interface PaginatedResponse {
  templates: Template[];
  pagination: {
    total: number;
    page: number;
    limit: number;
    pages: number;
  };
}

interface TemplateSelectorProps {
  onSelect: (newSelection: string[] | ((prev: string[]) => string[])) => void;
  selectedTemplateIds?: string[];
  className?: string;
  maxSelections?: number;
  preSelectedTemplates?: any[]; // Add this to pass full template objects
  onTemplateObjectSelect?: (template: Template) => void; // Callback when template is selected with its object
}

interface FilterState {
  searchQuery: string;
  creator: string;
  tag: string;
}

interface SelectedTemplateProps {
  templateId: string;
  index: number;
  onRemove: (id: string) => void;
  template: Template;
}

// Constants
const TEMPLATES_PER_PAGE = 12;

// Components
const SelectedTemplate: React.FC<SelectedTemplateProps> = React.memo(
  ({ templateId, index, onRemove, template }) => (
    <div className="relative flex-shrink-0 group">
      <div className="aspect-video relative rounded-lg overflow-hidden border-2 border-violet-500">
        <Image
          src={template.image}
          alt={template.title}
          fill
          className="object-cover"
          sizes="(max-width: 640px) 50vw, (max-width: 768px) 33vw, (max-width: 1024px) 25vw, (max-width: 1280px) 20vw, 16vw"
        />
        <div className="absolute top-1 right-1 bg-violet-500 text-white rounded-full p-0.5">
          <div className="flex items-center gap-0.5">
            <span className="text-[10px] font-medium leading-none">{index + 1}</span>
            <Check className="h-2.5 w-2.5" />
          </div>
        </div>
        <button
          onClick={(e) => {
            e.stopPropagation();
            onRemove(templateId);
          }}
          className="absolute top-1 left-1 bg-violet-500 text-white rounded-full p-0.5 opacity-100 sm:opacity-0 group-hover:opacity-100 transition-opacity hover:bg-violet-600"
        >
          <X className="h-2.5 w-2.5" />
        </button>
      </div>
      <p className="text-xs mt-1 truncate text-muted-foreground">{template.title}</p>
    </div>
  )
);
SelectedTemplate.displayName = "SelectedTemplate";

const TemplateCard: React.FC<{
  template: Template;
  isSelected: boolean;
  selectionIndex: number;
  onClick: () => void;
}> = React.memo(({ template, isSelected, selectionIndex, onClick }) => (
  <div
    className={cn(
      "relative group cursor-pointer rounded-lg overflow-hidden border-2 transition-all",
      isSelected
        ? "border-violet-500"
        : "border-transparent hover:border-violet-500/50"
    )}
    onClick={onClick}
  >
    <div className="aspect-video relative">
      <Image
        src={template.image}
        alt={template.title}
        fill
        className="object-cover"
        sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
      />
      <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
        <div className="text-white text-center p-4">
          <h4 className="font-medium">{template.title}</h4>
          <p className="text-sm capitalize">{template.tags.join(", ")}</p>
        </div>
      </div>
      {isSelected && (
        <div className="absolute top-2 right-2 bg-violet-500 text-white rounded-full p-1">
          <div className="flex items-center gap-1">
            <span className="text-xs font-medium">{selectionIndex + 1}</span>
            <Check className="h-3 w-3" />
          </div>
        </div>
      )}
      <a
        href={template.link}
        target="_blank"
        rel="noopener noreferrer"
        onClick={(e) => e.stopPropagation()}
        className="absolute top-2 left-2 bg-black/60 text-white rounded-full p-2 opacity-0 group-hover:opacity-100 transition-opacity hover:bg-black/80"
      >
        <ExternalLink className="h-4 w-4" />
      </a>
    </div>
  </div>
));
TemplateCard.displayName = "TemplateCard";

// Main component
const TemplateSelector: React.FC<TemplateSelectorProps> = ({
  onSelect,
  selectedTemplateIds = [],
  className,
  maxSelections = 5,
  preSelectedTemplates = [],
  onTemplateObjectSelect,
}) => {
  const { authFetch } = useAuthFetch();

  // State
  const [filters, setFilters] = useState<FilterState>({
    searchQuery: "",
    creator: "all",
    tag: "all",
  });
  const [creatorSearch, setCreatorSearch] = useState("");
  const [categorySearch, setCategorySearch] = useState("");
  const [templateType, setTemplateType] = useState<"preset" | "user">("preset");
  const [currentPage, setCurrentPage] = useState(1);

  // Reset to page 1 when template type changes
  useEffect(() => {
    setCurrentPage(1);
  }, [templateType]);

  // Query for fetching ALL templates metadata (for filters)
  const { data: allTemplatesData } = useQuery<PaginatedResponse, Error>({
    queryKey: ["templates-metadata", templateType],
    queryFn: async () => {
      const params = new URLSearchParams({
        page: "1",
        limit: "1000", // Get a large number to fetch all metadata
      });

      if (templateType === "user") params.append("type", "user");

      const endpoint = templateType === "user" 
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

  // Query for fetching templates with pagination
  const { data, status, error } = useQuery<
    PaginatedResponse,
    Error
  >({
    queryKey: ["templates", filters, templateType, currentPage],
    queryFn: async () => {
      const params = new URLSearchParams({
        page: currentPage.toString(),
        limit: TEMPLATES_PER_PAGE.toString(),
      });

      if (filters.searchQuery) params.append("search", filters.searchQuery);
      if (filters.creator !== "all") params.append("creator", filters.creator);
      if (filters.tag !== "all") {
        params.append("tags", filters.tag);
        console.log("🔍 Filtering by tag:", filters.tag);
      }
      if (templateType === "user") params.append("type", "user");

      // Use different endpoint based on template type
      const endpoint = templateType === "user" 
        ? `/templates/user?${params.toString()}`
        : `/templates/presets?${params.toString()}`;
      
      console.log("📡 API Request:", endpoint);
      
      const response = await authFetch(endpoint);

      if (!response.ok) {
        throw new Error(`Failed to fetch ${templateType} templates: ${response.statusText}`);
      }

      const result = await response.json();
      console.log("📊 Results:", {
        total: result.pagination?.total,
        count: result.templates?.length,
        filter: filters.tag !== "all" ? filters.tag : "none"
      });

      return result;
    },
  });

  // Compute templates from current page
  const templates = React.useMemo(() => data?.templates || [], [data?.templates]);
  const totalPages = data?.pagination?.pages || 1;

  // Extract unique creators and tags from ALL templates (not just current page)
  const allTemplates = React.useMemo(() => allTemplatesData?.templates || [], [allTemplatesData?.templates]);

  const uniqueCreators = React.useMemo(() => {
    const creators = new Set<string>();
    allTemplates.forEach(template => {
      if (template.creator) creators.add(template.creator);
    });
    return Array.from(creators).sort();
  }, [allTemplates]);

  const uniqueTags = React.useMemo(() => {
    const tags = new Set<string>();
    allTemplates.forEach(template => {
      template.tags?.forEach(tag => {
        if (tag && tag.length <= 25) {
          tags.add(tag);
        }
      });
    });
    return Array.from(tags).sort();
  }, [allTemplates]);

  // Filtered creators and categories for search
  const filteredCreators = React.useMemo(() => {
    return uniqueCreators.filter(creator => 
      creator.toLowerCase().includes(creatorSearch.toLowerCase())
    );
  }, [uniqueCreators, creatorSearch]);

  const filteredCategories = React.useMemo(() => {
    return uniqueTags.filter(tag =>
      tag.toLowerCase().includes(categorySearch.toLowerCase())
    );
  }, [uniqueTags, categorySearch]);

  // Handlers
  const handleTemplateClick = useCallback(
    (templateId: string) => {
      // Find the template object from current page or pre-selected templates
      const template = templates.find((t) => t.id === templateId) || 
                      preSelectedTemplates.find((t) => t.id === templateId);
      
      onSelect((prevIds: string[]) => {
        const isSelected = prevIds.includes(templateId);
        if (isSelected) {
          return prevIds.filter((id) => id !== templateId);
        }
        if (prevIds.length >= maxSelections) {
          // If template object is available, notify parent
          if (template && onTemplateObjectSelect) {
            onTemplateObjectSelect(template);
          }
          return [...prevIds.slice(1), templateId];
        }
        // If template object is available, notify parent
        if (template && onTemplateObjectSelect) {
          onTemplateObjectSelect(template);
        }
        return [...prevIds, templateId];
      });
    },
    [maxSelections, onSelect, templates, preSelectedTemplates, onTemplateObjectSelect]
  );

  const handleRemoveTemplate = useCallback(
    (templateId: string) => {
      onSelect((prevIds: string[]) =>
        prevIds.filter((id) => id !== templateId)
      );
    },
    [onSelect]
  );

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  const hasActiveFilters = filters.searchQuery.trim() !== "" || filters.creator !== "all" || filters.tag !== "all";

  const clearFilters = () => {
    setFilters({
      searchQuery: "",
      creator: "all",
      tag: "all",
    });
    setCurrentPage(1);
  };

  return (
    <div className={cn("space-y-6  max-w-7xl mx-auto", className)}>
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h3 className="text-xl font-semibold">Select Templates</h3>
          <p className="text-sm text-muted-foreground mt-1">
            Choose up to {maxSelections} template styles for your thumbnail
          </p>
        </div>
        {selectedTemplateIds.length > 0 && (
          <div className="text-sm text-muted-foreground">
            {selectedTemplateIds.length} of {maxSelections} selected
          </div>
        )}
      </div>

      {/* Selected Templates */}
      {selectedTemplateIds.length > 0 && (
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <p className="text-sm font-medium text-muted-foreground">
              Selected Templates ({selectedTemplateIds.length})
            </p>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
            {selectedTemplateIds.map((templateId, index) => {
              // First try to find in pre-selected templates (from localStorage), then in current page templates
              let template = preSelectedTemplates.find((t) => t && t.id === templateId);
              if (!template) {
                template = templates.find((t) => t.id === templateId);
              }
              
              // If template still not found, show a placeholder
              if (!template) {
                return (
                  <div key={templateId} className="relative flex-shrink-0 group">
                    <div className="aspect-video relative rounded-lg overflow-hidden border-2 border-dashed border-muted-foreground/30 bg-muted/50">
                      <div className="w-full h-full flex flex-col items-center justify-center p-4 text-center">
                        <div className="h-8 w-8 rounded-full bg-muted-foreground/20 flex items-center justify-center mb-2">
                          <span className="text-xs font-medium text-muted-foreground">{index + 1}</span>
                        </div>
                        <p className="text-[10px] text-muted-foreground">Loading...</p>
                      </div>
                    </div>
                  </div>
                );
              }

              return (
                <SelectedTemplate
                  key={templateId}
                  templateId={templateId}
                  index={index}
                  onRemove={handleRemoveTemplate}
                  template={template}
                />
              );
            })}
          </div>
        </div>
      )}

      {/* Template Type Selection and Create Button */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-4">
        <div className="grid grid-cols-2 sm:flex items-center gap-2">
          <Button
            variant={templateType === "preset" ? "default" : "outline"}
            onClick={() => setTemplateType("preset")}
            className="w-full sm:w-auto"
          >
            Preset Templates
          </Button>
          <Button
            variant={templateType === "user" ? "default" : "outline"}
            onClick={() => setTemplateType("user")}
            className="w-full sm:w-auto"
          >
            Your Templates
          </Button>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="space-y-4">
        {/* Search Input - On its own line */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search templates..."
            value={filters.searchQuery}
            onChange={(e) => {
              setFilters((prev) => ({ ...prev, searchQuery: e.target.value }));
              setCurrentPage(1);
            }}
            className="pl-9"
          />
        </div>

        <div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
          {/* Tag Filter - Badges with More dropdown */}
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
                  setCurrentPage(1);
                }}
              >
                All
              </Badge>
              
              {/* First 5 tags as badges */}
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
                    setCurrentPage(1);
                  }}
                >
                  {tag}
                </Badge>
              ))}
              
              {/* More dropdown for additional tags */}
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
                        {/* If searching, show all filtered tags. Otherwise, show only those after the first 9 */}
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
                                  setCurrentPage(1);
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

          {/* Creator Filter and Clear Button - inline with tags */}
          <div className="flex items-center gap-3 w-full lg:w-auto min-w-[220px] justify-start lg:justify-end flex-wrap">
            <div className="w-full sm:w-60 lg:w-64">
              <Select
                value={filters.creator}
                onValueChange={(value) => {
                  setFilters((prev) => ({ ...prev, creator: value }));
                  setCurrentPage(1);
                }}
              >
                <SelectTrigger className="w-full">
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

            {/* Clear Filters Button - aligned with creator filter */}
            {hasActiveFilters && (
              <Button
                variant="ghost"
                size="sm"
                onClick={clearFilters}
                className="h-9 px-3 flex-shrink-0"
              >
                <FilterX className="h-4 w-4 mr-2" />
                Clear Filters
              </Button>
            )}
          </div>
        </div>
      </div>

      {/* Template Grid */}
      <div className="relative bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="min-h-[350px]">
          {status === "error" && (
            <div className="text-red-500 text-center py-4">
              {error instanceof Error ? error.message : "An error occurred"}
            </div>
          )}

          {status === "pending" && (
            <div className="text-center py-8">
              <div className="flex items-center justify-center gap-2 text-muted-foreground">
                <div className="h-4 w-4 animate-spin rounded-full border-2 border-primary border-t-transparent" />
                <span>Loading {templateType} templates...</span>
              </div>
            </div>
          )}

          {status === "success" && templates.length === 0 && (
            <div className="text-center py-8">
              <div className="text-muted-foreground">
                <p className="text-lg font-medium mb-2">No {templateType} templates found</p>
                <p className="text-sm">
                  {templateType === "user" 
                    ? "You haven't created any custom templates yet." 
                    : "No preset templates available at the moment."
                  }
                </p>
              </div>
            </div>
          )}

          {status === "success" && templates.length > 0 && (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-4">
              {templates.map((template) => {
              const isSelected = selectedTemplateIds.includes(template.id);
              const selectionIndex = selectedTemplateIds.indexOf(template.id);

              return (
                <TemplateCard
                  key={template.id}
                  template={template}
                  isSelected={isSelected}
                  selectionIndex={selectionIndex}
                  onClick={() => handleTemplateClick(template.id)}
                />
              );
            })}
            </div>
          )}

          {/* Pagination */}
          {totalPages > 1 && (
            <Pagination className="mt-8">
              <PaginationContent>
                <PaginationItem>
                  <PaginationPrevious
                    onClick={() => handlePageChange(currentPage - 1)}
                    className={cn(
                      "cursor-pointer",
                      currentPage === 1 && "pointer-events-none opacity-50"
                    )}
                  />
                </PaginationItem>

                {[...Array(totalPages)].map((_, index) => {
                  const page = index + 1;

                  // Show first page, last page, and pages around current page
                  if (
                    page === 1 ||
                    page === totalPages ||
                    (page >= currentPage - 1 && page <= currentPage + 1)
                  ) {
                    return (
                      <PaginationItem key={page}>
                        <PaginationLink
                          onClick={() => handlePageChange(page)}
                          isActive={currentPage === page}
                          className="cursor-pointer"
                        >
                          {page}
                        </PaginationLink>
                      </PaginationItem>
                    );
                  }

                  // Show ellipsis for gaps
                  if (page === 2 || page === totalPages - 1) {
                    return (
                      <PaginationItem key={page}>
                        <PaginationEllipsis />
                      </PaginationItem>
                    );
                  }

                  return null;
                })}

                <PaginationItem>
                  <PaginationNext
                    onClick={() => handlePageChange(currentPage + 1)}
                    className={cn(
                      "cursor-pointer",
                      currentPage === totalPages &&
                        "pointer-events-none opacity-50"
                    )}
                  />
                </PaginationItem>
              </PaginationContent>
            </Pagination>
          )}
        </div>
      </div>
    </div>
  );
};

export default TemplateSelector;
