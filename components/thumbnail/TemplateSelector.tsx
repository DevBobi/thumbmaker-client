"use client";
import React, { useState } from "react";
import { cn } from "@/lib/utils";
import { Check, Search, ArrowUpDown, Plus, ExternalLink, X } from "lucide-react";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { CONTENT_OPTIONS, NICHE_OPTIONS, SUB_NICHE_OPTIONS, MOCK_USER_TEMPLATES, type SelfTemplate } from "./TemplateSelector.constants";
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
import { ChevronsUpDown } from "lucide-react";

interface TemplateSelectorProps {
  onSelect: (templateIds: string[]) => void;
  selectedTemplateIds?: string[];
  className?: string;
  maxSelections?: number;
}


const CREATOR_OPTIONS = [
  { value: "all", label: "All Creators" },
  ...Array.from(new Set(MOCK_TEMPLATES.map((template) => template.creator))).map((creator: string) => ({
    value: creator,
    label: creator,
  }))
];

const TemplateSelector = ({
  onSelect,
  selectedTemplateIds = [],
  className,
  maxSelections = 5,
}: TemplateSelectorProps) => {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedNiche, setSelectedNiche] = useState("all");
  const [selectedSubNiche, setSelectedSubNiche] = useState("all");
  const [selectedContent, setSelectedContent] = useState("all");
  const [selectedCreator, setSelectedCreator] = useState("all");
  const [sortAlphabetically, setSortAlphabetically] = useState(false);
  const [templateType, setTemplateType] = useState<"preset" | "user">("preset");
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [visibleTemplates, setVisibleTemplates] = useState<SelfTemplate[]>([]);
  const [page, setPage] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const templatesPerPage = 12;
  const loadMoreRef = React.useRef<HTMLDivElement>(null);

  const handleTemplateClick = (templateId: string) => {
    const isSelected = selectedTemplateIds.includes(templateId);
    let newSelection: string[];

    if (isSelected) {
      newSelection = selectedTemplateIds.filter(id => id !== templateId);
    } else {
      if (selectedTemplateIds.length >= maxSelections) {
        newSelection = [...selectedTemplateIds.slice(1), templateId];
      } else {
        newSelection = [...selectedTemplateIds, templateId];
      }
    }

    onSelect(newSelection);
  };

  const handleRemoveTemplate = (templateId: string) => {
    const newSelection = selectedTemplateIds.filter(id => id !== templateId);
    onSelect(newSelection);
  };

  const handleCreateTemplate = (formData: any) => {
    // Here you would typically handle the form submission
    // For now, closing the modal
    setIsCreateModalOpen(false);
  };

  const currentTemplates = templateType === "preset" ? MOCK_TEMPLATES : MOCK_USER_TEMPLATES;
  const allTemplates = [...MOCK_TEMPLATES, ...MOCK_USER_TEMPLATES];

  // Filter and sort templates
  const filteredTemplates = React.useMemo(() => {
    const sanitizeRegex = (str: string) => {
      return str.replace(/[.*+?^${}()|[$$\$$]/g, '\\$&');
    };
    
    return currentTemplates.filter((template) => {
      const matchesSearch = searchQuery === "" || 
        new RegExp(sanitizeRegex(searchQuery), 'i').test(template.title) ||
        new RegExp(sanitizeRegex(searchQuery), 'i').test(template.creator) ||
        new RegExp(sanitizeRegex(searchQuery), 'i').test(template.category);

      const matchesNiche = selectedNiche === "all" || template.category === selectedNiche;
      const matchesSubNiche = selectedSubNiche === "all" || template.category === selectedSubNiche;
      const matchesContent = selectedContent === "all" || template.category === selectedContent;
      const matchesCreator = selectedCreator === "all" || template.creator === selectedCreator;

      return matchesSearch && matchesNiche && matchesSubNiche && matchesContent && matchesCreator;
    });
  }, [currentTemplates, searchQuery, selectedNiche, selectedSubNiche, selectedContent, selectedCreator]);

  const sortedTemplates = React.useMemo(() => {
    return sortAlphabetically
      ? [...filteredTemplates].sort((a, b) => a.title.localeCompare(b.title))
      : filteredTemplates;
  }, [filteredTemplates, sortAlphabetically]);

  // Load more templates when scrolling
  const loadMoreTemplates = React.useCallback(() => {
    if (isLoading || !hasMore) return;

    setIsLoading(true);
    const startIndex = 0;
    const endIndex = page * templatesPerPage;
    const newTemplates = sortedTemplates.slice(startIndex, endIndex);
    
    setVisibleTemplates(newTemplates);
    setHasMore(endIndex < sortedTemplates.length);
    setIsLoading(false);
  }, [isLoading, hasMore, page, sortedTemplates, templatesPerPage]);

  // Reset and load initial templates when filters change
  React.useEffect(() => {
    setPage(1);
    setVisibleTemplates([]);
    setHasMore(true);
    loadMoreTemplates();
  }, [searchQuery, selectedNiche, selectedSubNiche, selectedContent, selectedCreator, sortAlphabetically, templateType]);

  // Setup intersection observer
  React.useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && hasMore && !isLoading) {
          setPage((prevPage) => prevPage + 1);
          loadMoreTemplates();
        }
      },
      { threshold: 0.1 }
    );

    if (loadMoreRef.current) {
      observer.observe(loadMoreRef.current);
    }

    return () => {
      if (loadMoreRef.current) {
        observer.unobserve(loadMoreRef.current);
      }
    };
  }, [hasMore, isLoading, loadMoreTemplates]);

  // Filter creators based on search
  const filteredCreators = React.useMemo(() => {
    const searchTerm = selectedCreator.toLowerCase();
    return CREATOR_OPTIONS.filter(creator => 
      creator.label.toLowerCase().includes(searchTerm)
    );
  }, [selectedCreator]);

  return (
    <div className={cn("space-y-4", className)}>
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

      <div className="flex flex-col gap-4">
        {selectedTemplateIds.length > 0 && (
          <div className="flex gap-4 overflow-x-auto pb-2">
            {selectedTemplateIds.map((templateId, index) => {
              const template = allTemplates.find(t => t.id === templateId);
              if (!template) return null;
              
              return (
                <div key={templateId} className="relative flex-shrink-0 w-48 group">
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
                        handleRemoveTemplate(templateId);
                      }}
                      className="absolute top-2 left-2 bg-violet-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity hover:bg-violet-600"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </div>
                  <p className="text-sm mt-1 truncate">{template.title}</p>
                </div>
              );
            })}
          </div>
        )}

        <div className="flex items-center gap-4">
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
            className="ml-auto"
            onClick={() => setIsCreateModalOpen(true)}
          >
            <Plus className="h-4 w-4 mr-2" />
            Create a Template
          </Button>
        </div>

        <div className="relative flex-1">
          <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search templates..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-8"
          />
        </div>
        <div className="flex items-center gap-4">
          <Select value={selectedNiche} onValueChange={setSelectedNiche}>
            <SelectTrigger className="w-[250px]">
              <SelectValue placeholder="Niche" />
            </SelectTrigger>
            <SelectContent>
              {NICHE_OPTIONS.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select value={selectedSubNiche} onValueChange={setSelectedSubNiche}>
            <SelectTrigger className="w-[250px]">
              <SelectValue placeholder="Sub-niche" />
            </SelectTrigger>
            <SelectContent>
              {SUB_NICHE_OPTIONS.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select value={selectedContent} onValueChange={setSelectedContent}>
            <SelectTrigger className="w-[250px]">
              <SelectValue placeholder="Content" />
            </SelectTrigger>
            <SelectContent>
              {CONTENT_OPTIONS.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          
          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                role="combobox"
                className="w-[250px] justify-between"
              >
                {selectedCreator === "all"
                  ? "All Creators"
                  : CREATOR_OPTIONS.find((creator) => creator.value === selectedCreator)?.label}
                <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-[250px] p-0 h-[50vh]">
              <Command>
                <CommandInput 
                  placeholder="Search creators..." 
                  value={selectedCreator}
                  onValueChange={setSelectedCreator}
                />
                <CommandEmpty>No creator found.</CommandEmpty>
                <CommandGroup>
                  {filteredCreators.map((creator) => (
                    <CommandItem
                      key={creator.value}
                      value={creator.value}
                      onSelect={(currentValue) => {
                        setSelectedCreator(currentValue === selectedCreator ? "all" : currentValue);
                      }}
                    >
                      <Check
                        className={cn(
                          "mr-2 h-4 w-4",
                          selectedCreator === creator.value ? "opacity-100" : "opacity-0"
                        )}
                      />
                      {creator.label}
                    </CommandItem>
                  ))}
                </CommandGroup>
              </Command>
            </PopoverContent>
          </Popover>

          <Button
            variant="outline"
            size="icon"
            onClick={() => setSortAlphabetically(!sortAlphabetically)}
            className={cn(sortAlphabetically && "bg-primary/10")}
          >
            <ArrowUpDown className="h-4 w-4" />
          </Button>
        </div>

        <div className="relative">
          <div className="overflow-y-auto h-[350px] pr-4">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {visibleTemplates.map((template) => {
                const isSelected = selectedTemplateIds.includes(template.id);
                const selectionIndex = selectedTemplateIds.indexOf(template.id);
                
                return (
                  <div
                    key={template.id}
                    className={cn(
                      "relative group cursor-pointer rounded-lg overflow-hidden border-2 transition-all",
                      isSelected
                        ? "border-violet-500"
                        : "border-transparent hover:border-violet-500/50"
                    )}
                    onClick={() => handleTemplateClick(template.id)}
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
                          <p className="text-sm capitalize">{template.category}</p>
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