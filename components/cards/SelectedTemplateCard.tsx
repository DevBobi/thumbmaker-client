import React from "react";
import Image from "next/image";
import { AdTemplate } from "@/contexts/AdContext";
import { X } from "lucide-react";

interface SelectedTemplateCardProps {
  template: AdTemplate;
  onRemove: (templateId: string) => void;
}

const SelectedTemplateCard: React.FC<SelectedTemplateCardProps> = ({
  template,
  onRemove,
}) => {
  return (
    <div className="relative group">
      <div className="aspect-square rounded-md overflow-hidden border-2 border-primary/20 hover:border-primary/50 transition-colors">
        <div className="relative w-full h-full">
          <Image
            src={template.image}
            alt={`Template ${template.id}`}
            fill
            sizes="(max-width: 640px) 50vw, (max-width: 768px) 33vw, (max-width: 1024px) 25vw, 20vw"
            className="object-cover"
            priority={false}
          />
        </div>
        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors" />
        <button
          onClick={(e) => {
            e.stopPropagation();
            onRemove(template.id);
          }}
          className="absolute top-2 right-2 bg-destructive text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity shadow-md"
          aria-label="Remove template"
        >
          <X className="h-3.5 w-3.5" />
        </button>
      </div>
      {/* <div className="mt-1.5 text-xs text-muted-foreground truncate text-center">
        {template.name || `Template ${template.id.slice(0, 6)}`}
      </div> */}
    </div>
  );
};

export default SelectedTemplateCard;
