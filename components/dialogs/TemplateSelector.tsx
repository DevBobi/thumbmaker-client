"use client";

import React, { useState, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { useAuthFetch } from "@/hooks/use-auth-fetch";
import { AdTemplate } from "@/contexts/AdContext";
import { TemplateCard } from "@/components/cards/TemplateCard";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Search, Loader2, CheckSquare, Square } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface TemplateSelectorProps {
  selectedTemplates: AdTemplate[];
  onSelectionChange: (templates: AdTemplate[]) => void;
}

export const TemplateSelector: React.FC<TemplateSelectorProps> = ({
  selectedTemplates,
  onSelectionChange,
}) => {
  const { authFetch } = useAuthFetch();
  const [activeTab, setActiveTab] = useState("preset-templates");
  const [searchTerm, setSearchTerm] = useState("");
  const [creatorFilter, setCreatorFilter] = useState<string | null>(null);
  const [nicheFilter, setNicheFilter] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const limit = 12;

  // Build query parameters
  const buildQueryParams = () => {
    const params = new URLSearchParams();
    params.append("page", page.toString());
    params.append("limit", limit.toString());

    if (searchTerm) params.append("search", searchTerm);
    if (creatorFilter) params.append("creator", creatorFilter);
    if (nicheFilter) params.append("niche", nicheFilter);

    return params.toString();
  };

  // Fetch preset templates
  const {
    data: presetTemplatesData,
    isLoading: isLoadingPresets,
  } = useQuery({
    queryKey: ["presetTemplates", page, limit, searchTerm, creatorFilter, nicheFilter, activeTab],
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
  } = useQuery({
    queryKey: ["userTemplates", page, limit, searchTerm, creatorFilter, nicheFilter, activeTab],
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

  // Fetch filter options
  const { data: filterOptions } = useQuery({
    queryKey: ["templateFilters"],
    queryFn: async () => {
      const response = await authFetch("/api/templates/filters");
      if (!response.ok) {
        throw new Error("Failed to fetch filters");
      }
      return response.json();
    },
  });

  // Determine which data to use based on active tab
  const templatesData =
    activeTab === "preset-templates" ? presetTemplatesData : userTemplatesData;

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
    activeTab === "preset-templates" ? isLoadingPresets : isLoadingUserTemplates;

  const handleTemplateToggle = (template: AdTemplate) => {
    const isSelected = selectedTemplates.some((t) => t.id === template.id);
    if (isSelected) {
      onSelectionChange(selectedTemplates.filter((t) => t.id !== template.id));
    } else {
      onSelectionChange([...selectedTemplates, template]);
    }
  };

  const handleSelectAll = () => {
    const currentTemplateIds = new Set(selectedTemplates.map((t) => t.id));
    const newTemplates = templates.filter((t: AdTemplate) => !currentTemplateIds.has(t.id));
    onSelectionChange([...selectedTemplates, ...newTemplates]);
  };

  const handleDeselectAll = () => {
    const currentTemplateIds = new Set(templates.map((t: AdTemplate) => t.id));
    onSelectionChange(selectedTemplates.filter((t) => !currentTemplateIds.has(t.id)));
  };

  const allCurrentSelected = templates.length > 0 && templates.every((t: AdTemplate) =>
    selectedTemplates.some((st) => st.id === t.id)
  );

  return (
    <div className="space-y-4">
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="preset-templates">Preset Templates</TabsTrigger>
          <TabsTrigger value="user-templates">Your Templates</TabsTrigger>
        </TabsList>

        <div className="mt-4 space-y-4">
          {/* Search and Filters */}
          <div className="flex flex-col sm:flex-row gap-2">
            <div className="relative flex-1">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search templates..."
                className="pl-8"
                value={searchTerm}
                onChange={(e) => {
                  setSearchTerm(e.target.value);
                  setPage(1);
                }}
              />
            </div>
            <Select
              value={creatorFilter || "all"}
              onValueChange={(value) => {
                setCreatorFilter(value === "all" ? null : value);
                setPage(1);
              }}
            >
              <SelectTrigger className="w-full sm:w-[180px]">
                <SelectValue placeholder="Creator" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Creators</SelectItem>
                {filterOptions?.creators?.map((creator: string) => (
                  <SelectItem key={creator} value={creator}>
                    {creator}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select
              value={nicheFilter || "all"}
              onValueChange={(value) => {
                setNicheFilter(value === "all" ? null : value);
                setPage(1);
              }}
            >
              <SelectTrigger className="w-full sm:w-[180px]">
                <SelectValue placeholder="Niche" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Niches</SelectItem>
                {filterOptions?.niches?.map((niche: string) => (
                  <SelectItem key={niche} value={niche}>
                    {niche}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Select All / Deselect All */}
          <div className="flex items-center justify-between">
            <p className="text-sm text-muted-foreground">
              {selectedTemplates.length} template(s) selected
            </p>
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={handleSelectAll}
                disabled={allCurrentSelected || templates.length === 0}
              >
                <CheckSquare className="h-4 w-4 mr-2" />
                Select All on Page
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={handleDeselectAll}
                disabled={!allCurrentSelected}
              >
                <Square className="h-4 w-4 mr-2" />
                Deselect All on Page
              </Button>
            </div>
          </div>

          {/* Templates Grid */}
          <TabsContent value="preset-templates" className="mt-0">
            {isLoading ? (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="h-8 w-8 animate-spin text-brand-600" />
              </div>
            ) : templates.length === 0 ? (
              <div className="text-center py-12 border border-dashed rounded-lg">
                <p className="text-muted-foreground">No templates found</p>
              </div>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
                {templates.map((template: AdTemplate) => (
                  <div key={template.id} onClick={() => handleTemplateToggle(template)}>
                    <TemplateCard
                      template={template}
                      type="select"
                      isSelected={selectedTemplates.some((t) => t.id === template.id)}
                      onSelect={handleTemplateToggle}
                    />
                  </div>
                ))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="user-templates" className="mt-0">
            {isLoading ? (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="h-8 w-8 animate-spin text-brand-600" />
              </div>
            ) : templates.length === 0 ? (
              <div className="text-center py-12 border border-dashed rounded-lg">
                <p className="text-muted-foreground">No templates found</p>
              </div>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
                {templates.map((template: AdTemplate) => (
                  <div key={template.id} onClick={() => handleTemplateToggle(template)}>
                    <TemplateCard
                      template={template}
                      type="select"
                      isSelected={selectedTemplates.some((t) => t.id === template.id)}
                      onSelect={handleTemplateToggle}
                    />
                  </div>
                ))}
              </div>
            )}
          </TabsContent>

          {/* Pagination */}
          {pagination.pages > 1 && (
            <div className="flex items-center justify-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page === 1}
              >
                Previous
              </Button>
              <span className="text-sm text-muted-foreground">
                Page {page} of {pagination.pages}
              </span>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setPage((p) => Math.min(pagination.pages, p + 1))}
                disabled={page === pagination.pages}
              >
                Next
              </Button>
            </div>
          )}
        </div>
      </Tabs>
    </div>
  );
};

