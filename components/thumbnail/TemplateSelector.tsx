import React from "react";
import { cn } from "@/lib/utils";
import { Check } from "lucide-react";

interface Template {
  id: string;
  title: string;
  image: string;
  category: string;
}

interface TemplateSelectorProps {
  onSelect: (templateIds: string[]) => void;
  selectedTemplateIds?: string[];
  className?: string;
  maxSelections?: number;
}

const MOCK_TEMPLATES: Template[] = [
  {
    id: "1",
    title: "Gaming Action",
    image: "https://picsum.photos/1280/720?random=1",
    category: "gaming",
  },
  {
    id: "2",
    title: "Tech Review",
    image: "https://picsum.photos/1280/720?random=2",
    category: "tech",
  },
  {
    id: "3",
    title: "Vlog Style",
    image: "https://picsum.photos/1280/720?random=3",
    category: "vlog",
  },
  {
    id: "4",
    title: "Tutorial",
    image: "https://picsum.photos/1280/720?random=4",
    category: "tutorial",
  },
  {
    id: "5",
    title: "Product Showcase",
    image: "https://picsum.photos/1280/720?random=5",
    category: "product",
  },
  {
    id: "6",
    title: "News Style",
    image: "https://picsum.photos/1280/720?random=6",
    category: "news",
  },
  {
    id: "7",
    title: "Entertainment",
    image: "https://picsum.photos/1280/720?random=7",
    category: "entertainment",
  },
  {
    id: "8",
    title: "Educational",
    image: "https://picsum.photos/1280/720?random=8",
    category: "education",
  },
  {
    id: "9",
    title: "Sports",
    image: "https://picsum.photos/1280/720?random=9",
    category: "sports",
  },
  {
    id: "10",
    title: "Music",
    image: "https://picsum.photos/1280/720?random=10",
    category: "music",
  },
  {
    id: "11",
    title: "Cooking",
    image: "https://picsum.photos/1280/720?random=11",
    category: "cooking",
  },
  {
    id: "12",
    title: "Travel",
    image: "https://picsum.photos/1280/720?random=12",
    category: "travel",
  },
];

const TemplateSelector = ({
  onSelect,
  selectedTemplateIds = [],
  className,
  maxSelections = 5,
}: TemplateSelectorProps) => {
  const handleTemplateClick = (templateId: string) => {
    const isSelected = selectedTemplateIds.includes(templateId);
    let newSelection: string[];

    if (isSelected) {
      newSelection = selectedTemplateIds.filter(id => id !== templateId);
    } else {
      if (selectedTemplateIds.length >= maxSelections) {
        // Remove the oldest selection if we're at max
        newSelection = [...selectedTemplateIds.slice(1), templateId];
      } else {
        newSelection = [...selectedTemplateIds, templateId];
      }
    }

    onSelect(newSelection);
  };

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

      <div className="relative">
        <div className="overflow-y-auto max-h-[600px] pr-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {MOCK_TEMPLATES.map((template) => {
              const isSelected = selectedTemplateIds.includes(template.id);
              const selectionIndex = selectedTemplateIds.indexOf(template.id);
              
              return (
                <div
                  key={template.id}
                  className={cn(
                    "relative group cursor-pointer rounded-lg overflow-hidden border-2 transition-all",
                    isSelected
                      ? "border-primary"
                      : "border-transparent hover:border-primary/50"
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
                      <div className="absolute top-2 right-2 bg-primary text-primary-foreground rounded-full p-1">
                        <div className="flex items-center gap-1">
                          <span className="text-xs font-medium">{selectionIndex + 1}</span>
                          <Check className="h-3 w-3" />
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};

export default TemplateSelector; 