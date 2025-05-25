"use client";
import React, { useState, useCallback, useMemo } from "react";
import { cn } from "@/lib/utils";
import { Check, Search, ArrowUpDown, Plus, ExternalLink, X, ChevronsUpDown } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { MOCK_USER_TEMPLATES, type SelfTemplate } from "./TemplateSelector.constants";
import MOCK_TEMPLATES from "@/data/thumbnails.json";
import CreateTemplateThumbnail from "./CreateTemplateThumbnail";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
} from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

// Types
interface TemplateSelectorProps {
  onSelect: (newSelection: string[] | ((prev: string[]) => string[])) => void;
  selectedTemplateIds?: string[];
  className?: string;
  maxSelections?: number;
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
  template: SelfTemplate;
}

// Constants
const TEMPLATES_PER_PAGE = 12;
const CREATOR_OPTIONS = [
  { value: "all", label: "All Creators" },
  ...Array.from(new Set(MOCK_TEMPLATES.map((template) => template.creator))).map((creator: string) => ({
    value: creator,
    label: creator,
  }))
];

const TAG_OPTIONS = [
  { value: "all", label: "All Tags" },
  ...Array.from(new Set(MOCK_TEMPLATES.map((template) => template.tags))).map((tag: string) => ({
    value: tag,
    label: tag,
  }))
];

// Utility functions
const sanitizeRegex = (str: string) => {
  return str.replace(/[.*+?^${}()|[$$\$$]/g, '\\$&');
};

// Components
const SelectedTemplate: React.FC<SelectedTemplateProps> = React.memo(({ templateId, index, onRemove, template }) => (
  <div className="relative flex-shrink-0 w-48 group">
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
        className="absolute top-2 left-2 bg-violet-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity hover:bg-violet-600"
      >
        <X className="h-3 w-3" />
      </button>
    </div>
    <p className="text-sm mt-1 truncate">{template.title}</p>
  </div>
));
SelectedTemplate.displayName = 'SelectedTemplate';

const TemplateCard: React.FC<{
  template: SelfTemplate;
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
          <p className="text-sm capitalize">{template.tags}</p>
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
        href={template.video_link}
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
TemplateCard.displayName = 'TemplateCard';

// Custom hooks
const useInfiniteScroll = (
  loadMoreRef: React.RefObject<HTMLDivElement>,
  hasMore: boolean,
  isLoading: boolean,
  onIntersect: () => void
) => {
  React.useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && hasMore && !isLoading) {
          onIntersect();
        }
      },
      { threshold: 0.1 }
    );

    const currentRef = loadMoreRef.current;
    if (currentRef) {
      observer.observe(currentRef);
    }

    return () => {
      if (currentRef) {
        observer.unobserve(currentRef);
      }
    };
  }, [hasMore, isLoading, onIntersect, loadMoreRef]);
};

const useFilteredTemplates = (
  templates: SelfTemplate[],
  filters: FilterState
) => {
  return useMemo(() => {
    const filtered = templates.filter((template) => {
      const matchesSearch = filters.searchQuery === "" ||
        new RegExp(sanitizeRegex(filters.searchQuery), 'i').test(template.title) ||
        new RegExp(sanitizeRegex(filters.searchQuery), 'i').test(template.creator) ||
        new RegExp(sanitizeRegex(filters.searchQuery), 'i').test(template.tags);

      const matchesCreator = filters.creator === "all" || template.creator === filters.creator;
      const matchesTag = filters.tag === "all" || template.tags === filters.tag;

      return matchesSearch && matchesCreator && matchesTag;
    });

    return filters.sortAlphabetically
      ? [...filtered].sort((a, b) => a.title.localeCompare(b.title))
      : filtered;
  }, [templates, filters]);
};

// Main component
const TemplateSelector: React.FC<TemplateSelectorProps> = ({
  onSelect,
  selectedTemplateIds = [],
  className,
  maxSelections = 5,
}) => {
  // State
  const [filters, setFilters] = useState<FilterState>({
    creator: "all",
    tag: "all",
    searchQuery: "",
    sortAlphabetically: false,
  });
  const [templateType, setTemplateType] = useState<"preset" | "user">("preset");
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [visibleTemplates, setVisibleTemplates] = useState<SelfTemplate[]>([]);
  const [page, setPage] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const loadMoreRef = React.useRef<HTMLDivElement>(null) as React.RefObject<HTMLDivElement>;

  // Derived state
  const currentTemplates = templateType === "preset" ? MOCK_TEMPLATES : MOCK_USER_TEMPLATES;
  const allTemplates = useMemo(() => [...MOCK_TEMPLATES, ...MOCK_USER_TEMPLATES], []);
  const filteredTemplates = useFilteredTemplates(currentTemplates, filters);

  // Handlers
  const handleTemplateClick = useCallback((templateId: string) => {
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
  }, [maxSelections, onSelect]);

  const handleRemoveTemplate = useCallback((templateId: string) => {
    onSelect((prevIds: string[]) => prevIds.filter((id) => id !== templateId));
  }, [onSelect]);

  const handleCreateTemplate = useCallback((formData: unknown) => {
    setIsCreateModalOpen(false);
    console.log(formData);
  }, []);

  const loadMoreTemplates = useCallback(() => {
    if (isLoading || !hasMore) return;

    setIsLoading(true);
    const endIndex = page * TEMPLATES_PER_PAGE;
    const newTemplates = filteredTemplates.slice(0, endIndex);

    setVisibleTemplates(newTemplates);
    setHasMore(endIndex < filteredTemplates.length);
    setIsLoading(false);
  }, [isLoading, hasMore, page, filteredTemplates]);

  // Effects
  React.useEffect(() => {
    setPage(1);
    setVisibleTemplates([]);
    setHasMore(true);
    const initialTemplates = filteredTemplates.slice(0, TEMPLATES_PER_PAGE);
    setVisibleTemplates(initialTemplates);
    setHasMore(TEMPLATES_PER_PAGE < filteredTemplates.length);
  }, [filters, templateType, filteredTemplates]);

  useInfiniteScroll(loadMoreRef, hasMore, isLoading, () => setPage(p => p + 1));

  React.useEffect(() => {
    if (page > 1) {
      loadMoreTemplates();
    }
  }, [page, loadMoreTemplates]);

  // Filtered creators for search
  const filteredCreators = useMemo(() => {
    const searchTerm = filters.creator.toLowerCase();
    return CREATOR_OPTIONS.filter(creator =>
      creator.label.toLowerCase().includes(searchTerm)
    );
  }, [filters.creator]);

  return (
    <div className={cn("space-y-4", className)}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-medium">Select Templates</h3>
          <p className="text-sm text-muted-foreground">
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
        <div className="flex gap-4 overflow-x-auto pb-2">
          {selectedTemplateIds.map((templateId, index) => {
            const template = allTemplates.find(t => t.id === templateId);
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
      <div className="flex flex-col md:flex-row items-center gap-4">
        <div className="flex items-center gap-2">
          <Button
            variant={templateType === "preset" ? "default" : "outline"}
            onClick={() => setTemplateType("preset")}
          >
            Preset Templates
          </Button>
          <Button
            variant={templateType === "user" ? "default" : "outline"}
            onClick={() => setTemplateType("user")}
          >
            Your Templates
          </Button>
        </div>
        <Button
          variant="brand"
          className="ml-auto w-[90%] md:w-auto"
          onClick={() => setIsCreateModalOpen(true)}
        >
          <Plus className="h-4 w-4 mr-2" />
          Create a Template
        </Button>
      </div>

      {/* Search and Filters */}
      <div className="relative flex-1">
        <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Search templates..."
          value={filters.searchQuery}
          onChange={(e) => setFilters(prev => ({ ...prev, searchQuery: e.target.value }))}
          className="pl-8"
        />
      </div>

      <div className="flex flex-col md:flex-row items-center gap-4">
        <Popover>
          <PopoverTrigger asChild>
            <Button
              variant="outline"
              role="combobox"
              className="w-full md:w-[47%] justify-between"
            >
              {filters.creator === "all"
                ? "All Creators"
                : CREATOR_OPTIONS.find((creator) => creator.value === filters.creator)?.label}
              <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-[100%] mr-18 p-0 h-[50vh]"> 
            <Command>
              <CommandInput
                placeholder="Search creators..."
                value={filters.creator}
                onValueChange={(value) => setFilters(prev => ({ ...prev, creator: value }))}
              />
              <CommandEmpty>No creator found.</CommandEmpty>
              <CommandGroup>
                {CREATOR_OPTIONS.map((creator) => (
                  <CommandItem
                    key={creator.value}
                    value={creator.value}
                    onSelect={(currentValue) => {
                      setFilters(prev => ({
                        ...prev,
                        creator: currentValue === filters.creator ? "all" : currentValue
                      }));
                    }}
                  >
                    <Check
                      className={cn(
                        "mr-2 h-4 w-4",
                        filters.creator === creator.value ? "opacity-100" : "opacity-0"
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
              className="w-full md:w-[47%] justify-between"
            >
              {filters.tag === "all"
                ? "All Tags"
                : TAG_OPTIONS.find((tag) => tag.value === filters.tag)?.label}
              <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-[65%] ml-32 p-0 h-[50vh]">
            <Command>
              <CommandInput
                placeholder="Search tags..."
                value={filters.tag}
                onValueChange={(value) => setFilters(prev => ({ ...prev, tag: value }))}
              />
              <CommandEmpty>No tag found.</CommandEmpty>
              <CommandGroup>
                {TAG_OPTIONS.map((tag) => (
                  <CommandItem
                    key={tag.value}
                    value={tag.value}
                    onSelect={(currentValue) => {
                      setFilters(prev => ({
                        ...prev,
                        tag: currentValue === filters.tag ? "all" : currentValue
                      }));
                    }}
                  >
                    <Check
                      className={cn(
                        "mr-2 h-4 w-4",
                        filters.tag === tag.value ? "opacity-100" : "opacity-0"
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
          onClick={() => setFilters(prev => ({ ...prev, sortAlphabetically: !prev.sortAlphabetically }))}
          className={cn(filters.sortAlphabetically && "bg-primary/10")}
        >
          <ArrowUpDown className="h-4 w-4" />
        </Button>
      </div>

      {/* Template Grid */}
      <div className="relative">
        <div className="overflow-y-auto h-[350px] pr-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {visibleTemplates.map((template) => {
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

          {/* Loading indicator and intersection observer target */}
          <div ref={loadMoreRef} className="h-20 flex items-center justify-center">
            {isLoading && (
              <div className="flex items-center gap-2 text-muted-foreground">
                <div className="h-4 w-4 animate-spin rounded-full border-2 border-primary border-t-transparent" />
                <span>Loading more templates...</span>
              </div>
            )}
          </div>
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