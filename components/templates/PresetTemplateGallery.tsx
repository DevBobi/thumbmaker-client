import React from "react";
import { AdTemplate } from "@/contexts/AdContext";
import { Button } from "@/components/ui/button";
import { FileText } from "lucide-react";
import { TemplateCard } from "../cards/TemplateCard";

interface PresetTemplateGalleryProps {
  templates: AdTemplate[];
  searchTerm?: string;
  onUseTemplate?: (template: AdTemplate) => void;
}

const PresetTemplateGallery: React.FC<PresetTemplateGalleryProps> = ({
  templates,
  searchTerm = "",
}) => {
  if (templates.length === 0) {
    return (
      <div className="text-center py-12 border border-dashed rounded-lg">
        <div className="flex flex-col items-center gap-2">
          <div className="bg-muted rounded-full p-3">
            <FileText className="h-6 w-6 text-muted-foreground" />
          </div>
          <h3 className="font-medium text-lg">No templates found</h3>
          <p className="text-muted-foreground max-w-md">
            {searchTerm
              ? `No templates match "${searchTerm}". Try a different search term.`
              : "Try adjusting your filters or check back later for new templates."}
          </p>
          {searchTerm && (
            <Button
              variant="outline"
              className="mt-2"
              onClick={() => {
                /* Clear search function would go here */
              }}
            >
              Clear search
            </Button>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
      {templates.map((template) => (
        <TemplateCard key={template.id} template={template} type="normal" />
      ))}
    </div>
  );
};

export default PresetTemplateGallery;
