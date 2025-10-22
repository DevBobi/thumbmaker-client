"use client";
import { Button } from "@/components/ui/button";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
} from "@/components/ui/command";
import { Input } from "@/components/ui/input";
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
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { useAuthFetch } from "@/hooks/use-auth-fetch";
import { cn } from "@/lib/utils";
import { useQuery } from "@tanstack/react-query";
import {
  ArrowUpDown,
  Check,
  ChevronsUpDown,
  ExternalLink,
  Plus,
  Search,
  X,
} from "lucide-react";
import React, { useCallback, useEffect, useState } from "react";
import CreateTemplateThumbnail from "./CreateTemplateThumbnail";

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
}

interface FilterState {
  creator: string;
  tag: string;
  searchQuery: string;
  sortAlphabetically: boolean;
}

interface SelectedTemplateProps {
  templateId: string;
  index: number;
  onRemove: (id: string) => void;
  template: Template;
}

// Constants
const TEMPLATES_PER_PAGE = 12;

const DUMMY_CREATORS = [
  { value: "all", label: "All Creators" },
  { value: "mkbhd", label: "MKBHD" },
  { value: "casey", label: "Casey Neistat" },
  { value: "peter", label: "Peter McKinnon" },
  { value: "linus", label: "Linus Tech Tips" },
  { value: "sara", label: "Sara Dietschy" },
  { value: "ali", label: "Ali Abdaal" },
  { value: "thomas", label: "Thomas Frank" },
  { value: "matt", label: "Matt D'Avella" },
];

const DUMMY_TAGS = [
  { value: "all", label: "All Tags" },
  { value: "tech", label: "Technology" },
  { value: "lifestyle", label: "Lifestyle" },
  { value: "education", label: "Education" },
  { value: "gaming", label: "Gaming" },
  { value: "music", label: "Music" },
  { value: "vlog", label: "Vlog" },
  { value: "tutorial", label: "Tutorial" },
  { value: "review", label: "Review" },
];

// Components
const SelectedTemplate: React.FC<SelectedTemplateProps> = React.memo(
  ({ templateId, index, onRemove, template }) => (
    <div className="relative flex-shrink-0 w-full sm:w-64 md:w-48 group">
      <div className="aspect-video relative rounded-lg overflow-hidden border-2 border-violet-500">
        <img
          src={template.image}
          alt={template.title}
          className="object-cover w-full h-full"
        />
        <div className="absolute top-2 right-2 bg-violet-500 text-white rounded-full p-1">
          <div className="flex items-center gap-1">
            <span className="text-xs font-medium">{index + 1}</span>
            <Check className="h-3 w-3" />
          </div>
        </div>
        <button
          onClick={(e) => {
            e.stopPropagation();
            onRemove(templateId);
          }}
          className="absolute top-2 left-2 bg-violet-500 text-white rounded-full p-1 opacity-100 sm:opacity-0 group-hover:opacity-100 transition-opacity hover:bg-violet-600"
        >
          <X className="h-3 w-3" />
        </button>
      </div>
      <p className="text-sm mt-1 truncate">{template.title}</p>
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
      <img
        src={template.image}
        alt={template.title}
        className="object-cover w-full h-full"
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
}) => {
  const { authFetch } = useAuthFetch();

  // State
  const [filters, setFilters] = useState<FilterState>({
    creator: "all",
    tag: "all",
    searchQuery: "",
    sortAlphabetically: false,
  });
  const [templateType, setTemplateType] = useState<"preset" | "user">("preset");
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);

  // Reset to page 1 when template type changes
  useEffect(() => {
    setCurrentPage(1);
  }, [templateType]);

  // Query for fetching templates with pagination
  const { data, status, error, isFetching } = useQuery<
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
      if (filters.tag !== "all") params.append("tag", filters.tag);
      if (filters.creator !== "all") params.append("creator", filters.creator);
      if (templateType === "user") params.append("type", "user");

      // Use different endpoint based on template type
      const endpoint = templateType === "user" 
        ? `/api/templates/user?${params.toString()}`
        : `/api/templates/presets?${params.toString()}`;
      
      const response = await authFetch(endpoint);

      if (!response.ok) {
        throw new Error(`Failed to fetch ${templateType} templates: ${response.statusText}`);
      }

      return response.json();
    },
  });

  // Compute templates from current page
  const templates = data?.templates || [];
  const totalPages = data?.pagination?.pages || 1;

  // Handlers
  const handleTemplateClick = useCallback(
    (templateId: string) => {
      onSelect((prevIds: string[]) => {
        const isSelected = prevIds.includes(templateId);
        if (isSelected) {
          return prevIds.filter((id) => id !== templateId);
        }
        if (prevIds.length >= maxSelections) {
          return [...prevIds.slice(1), templateId];
        }
        return [...prevIds, templateId];
      });
    },
    [maxSelections, onSelect]
  );

  const handleRemoveTemplate = useCallback(
    (templateId: string) => {
      onSelect((prevIds: string[]) =>
        prevIds.filter((id) => id !== templateId)
      );
    },
    [onSelect]
  );

  const handleCreateTemplate = useCallback((formData: unknown) => {
    setIsCreateModalOpen(false);
    console.log(formData);
  }, []);

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
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
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {selectedTemplateIds.map((templateId, index) => {
            // First try to find in current page templates, then in pre-selected templates
            let template = templates.find((t) => t.id === templateId);
            if (!template) {
              template = preSelectedTemplates.find((t) => t.id === templateId);
            }
            if (!template) return null;

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
        <Button
          variant="brand"
          className="w-full sm:w-auto sm:ml-auto"
          onClick={() => setIsCreateModalOpen(true)}
        >
          <Plus className="h-4 w-4 mr-2" />
          Create a Template
        </Button>
      </div>

      {/* Search and Filters */}
      <div className="space-y-4">
        <div className="relative">
          <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search templates..."
            value={filters.searchQuery}
            onChange={(e) =>
              setFilters((prev) => ({ ...prev, searchQuery: e.target.value }))
            }
            className="pl-8"
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:flex items-center gap-4">
          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                role="combobox"
                className="w-full lg:w-[240px] justify-between"
              >
                {filters.creator === "all"
                  ? "All Creators"
                  : DUMMY_CREATORS.find(
                      (creator) => creator.value === filters.creator
                    )?.label}
                <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-full lg:w-[240px] p-0">
              <Command>
                <CommandInput
                  placeholder="Search creators..."
                  value={filters.creator}
                  onValueChange={(value) =>
                    setFilters((prev) => ({ ...prev, creator: value }))
                  }
                />
                <CommandEmpty>No creator found.</CommandEmpty>
                <CommandGroup className="max-h-[200px] overflow-y-auto">
                  {DUMMY_CREATORS.map((creator) => (
                    <CommandItem
                      key={creator.value}
                      value={creator.value}
                      onSelect={(currentValue) => {
                        setFilters((prev) => ({
                          ...prev,
                          creator:
                            currentValue === filters.creator
                              ? "all"
                              : currentValue,
                        }));
                      }}
                    >
                      <Check
                        className={cn(
                          "mr-2 h-4 w-4",
                          filters.creator === creator.value
                            ? "opacity-100"
                            : "opacity-0"
                        )}
                      />
                      {creator.label}
                    </CommandItem>
                  ))}
                </CommandGroup>
              </Command>
            </PopoverContent>
          </Popover>

          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                role="combobox"
                className="w-full lg:w-[240px] justify-between"
              >
                {filters.tag === "all"
                  ? "All Tags"
                  : DUMMY_TAGS.find((tag) => tag.value === filters.tag)?.label}
                <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-full lg:w-[240px] p-0">
              <Command>
                <CommandInput
                  placeholder="Search tags..."
                  value={filters.tag}
                  onValueChange={(value) =>
                    setFilters((prev) => ({ ...prev, tag: value }))
                  }
                />
                <CommandEmpty>No tag found.</CommandEmpty>
                <CommandGroup className="max-h-[200px] overflow-y-auto">
                  {DUMMY_TAGS.map((tag) => (
                    <CommandItem
                      key={tag.value}
                      value={tag.value}
                      onSelect={(currentValue) => {
                        setFilters((prev) => ({
                          ...prev,
                          tag:
                            currentValue === filters.tag ? "all" : currentValue,
                        }));
                      }}
                    >
                      <Check
                        className={cn(
                          "mr-2 h-4 w-4",
                          filters.tag === tag.value
                            ? "opacity-100"
                            : "opacity-0"
                        )}
                      />
                      {tag.label}
                    </CommandItem>
                  ))}
                </CommandGroup>
              </Command>
            </PopoverContent>
          </Popover>

          <Button
            variant="outline"
            size="icon"
            onClick={() =>
              setFilters((prev) => ({
                ...prev,
                sortAlphabetically: !prev.sortAlphabetically,
              }))
            }
            className={cn(
              "w-full sm:w-10 lg:ml-auto",
              filters.sortAlphabetically && "bg-primary/10"
            )}
          >
            <ArrowUpDown className="h-4 w-4" />
          </Button>
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

      <CreateTemplateThumbnail
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onSubmit={handleCreateTemplate}
      />
    </div>
  );
};

export default TemplateSelector;
