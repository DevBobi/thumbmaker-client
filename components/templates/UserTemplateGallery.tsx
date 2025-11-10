import React from "react";
import { AdTemplate } from "@/contexts/AdContext";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { FileText, Plus, Trash, Pencil } from "lucide-react";
import TemplateCreator from "@/components/dialogs/TemplateCreator";
import TemplateEditor from "@/components/dialogs/TemplateEditor";
import TemplateDeleteConfirm from "@/components/dialogs/TemplateDeleteConfirm";

interface UserTemplateGalleryProps {
  templates: AdTemplate[];
  onEditTemplate?: (updatedTemplate: AdTemplate) => void;
  onDeleteTemplate?: (templateId: string) => void;
  searchTerm?: string;
  onClearSearch?: () => void;
}

const UserTemplateGallery: React.FC<UserTemplateGalleryProps> = ({
  templates,
  onEditTemplate,
  onDeleteTemplate,
  searchTerm = "",
  onClearSearch,
}) => {
  if (templates.length === 0) {
    return (
      <div className="text-center py-12 border border-dashed rounded-lg">
        <div className="flex flex-col items-center gap-2">
          <div className="bg-muted rounded-full p-3">
            <FileText className="h-6 w-6 text-muted-foreground" />
          </div>
          <h3 className="font-medium text-lg">No custom templates yet</h3>
          <p className="text-muted-foreground max-w-md">
            {searchTerm
              ? `No templates match "${searchTerm}". Try a different search term.`
              : "You haven't created any custom templates yet."}
          </p>
          {searchTerm ? (
            <Button variant="outline" className="mt-2" onClick={onClearSearch}>
              Clear search
            </Button>
          ) : (
            <TemplateCreator
              triggerClassName="mt-4"
              onTemplateCreated={onEditTemplate}
            />
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        <TemplateCreator
          customTrigger={
            <div className="border-dashed bg-accent hover:bg-accent/5 cursor-pointer flex items-center justify-center rounded-lg overflow-hidden transition-all hover:shadow-md hover:border-brand-300 group">
              <div className="bg-accent/5 flex items-center justify-center">
                <div className="flex flex-col items-center text-center p-6">
                  <div className="h-12 w-12 rounded-full bg-brand-100 flex items-center justify-center mb-3">
                    <Plus className="h-6 w-6 text-brand-600" />
                  </div>
                  <h3 className="font-medium">Create New Template</h3>
                  <p className="text-sm text-muted-foreground mt-1">
                    Design your own custom thumbnail template
                  </p>
                </div>
              </div>
            </div>
          }
          onTemplateCreated={onEditTemplate}
        />
        {templates.map((template) => (
          <div
            key={template.id}
            className="group relative rounded-lg overflow-hidden border transition-all hover:shadow-md"
          >
            {/* Action buttons in top-right corner - visible on hover */}
            <div className="absolute top-2 right-2 z-10 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
              {onEditTemplate && (
                <TemplateEditor
                  template={template}
                  onSave={onEditTemplate}
                  trigger={
                    <Button
                      variant="secondary"
                      size="icon"
                      className="h-8 w-8 rounded-full cursor-pointer bg-white/90 hover:bg-white shadow-sm"
                    >
                      <Pencil className="h-4 w-4" />
                    </Button>
                  }
                />
              )}
              {onDeleteTemplate && (
                <TemplateDeleteConfirm
                  templateId={template.id}
                  templateName={`"${template.brand}" template`}
                  onDelete={onDeleteTemplate}
                  trigger={
                    <Button
                      variant="secondary"
                      size="icon"
                      className="h-8 w-8 rounded-full cursor-pointer bg-white/90 hover:bg-white shadow-sm text-red-600 hover:text-red-700"
                    >
                      <Trash className="h-4 w-4" />
                    </Button>
                  }
                />
              )}
            </div>

            <div className="aspect-video relative">
              <Image
                src={template.image}
                alt={`Template ${template.id}`}
                fill
                className="object-contain bg-muted"
              />
              <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors" />
            </div>

            <div className="p-3 bg-background space-y-1.5">
              {/* Creator Name */}
              <h3 className="font-medium text-sm truncate text-foreground">
                {template.brand}
              </h3>

              {/* Niche */}
              {template.niche && (
                <p className="text-xs text-muted-foreground truncate">
                  {template.niche}
                </p>
              )}

              {/* Tags */}
              {template.tags && template.tags.length > 0 && (
                <div className="flex flex-wrap gap-1 pt-1">
                  {template.tags.slice(0, 3).map((tag, index) => (
                    <span 
                      key={index} 
                      className="inline-flex items-center px-1.5 py-0.5 rounded text-[10px] bg-muted text-muted-foreground"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default UserTemplateGallery;
