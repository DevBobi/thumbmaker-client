import React from "react";
import { Check } from "lucide-react";
import { AdTemplate } from "@/contexts/AdContext";
import Zoom from "react-medium-image-zoom";
import Image from "next/image";

interface TemplateCardProps {
  template: AdTemplate;
  isSelected?: boolean;
  onSelect?: (template: AdTemplate) => void;
  type?: "select" | "normal";
  isHighlighted?: boolean;
}

export const TemplateCard = ({
  template,
  isSelected = false,
  onSelect,
  type = "normal",
  isHighlighted = false,
}: TemplateCardProps) => {
  return (
    <div
      key={template.id}
      className={`relative border rounded-lg overflow-hidden cursor-pointer group transition-all duration-200 bg-card ${
        isSelected 
          ? "ring-2 ring-primary shadow-lg" 
          : isHighlighted 
          ? "ring-4 ring-primary shadow-2xl border-primary" 
          : "hover:shadow-lg hover:border-primary/50"
      }`}
    >
      {type === "select" && (
        <div className="absolute top-2 right-2 flex gap-2 z-10">
          <button
            onClick={() => onSelect?.(template)}
            className={`rounded-full border cursor-pointer p-1 ${
              isSelected ? "bg-brand-500" : "bg-white"
            }`}
          >
            <Check
              className={`h-4 w-4 text-black ${isSelected ? "text-white" : ""}`}
            />
          </button>
        </div>
      )}
      <Zoom
        zoomImg={{
          src: template.image,
          alt: `${template.brand || 'Template'} - ${template.niche || 'Thumbnail template'}`,
          width: 800,
          height: 600,
        }}
        zoomMargin={40}
        classDialog="custom-zoom"
      >
        <div className="relative w-full aspect-video bg-muted/50">
          <Image
            src={template.image}
            alt={`${template.brand || 'Template'} - ${template.niche || 'Thumbnail template'}`}
            fill
            sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
            className="object-cover group-hover:scale-105 transition-transform duration-200"
            priority={false}
          />
          <div className="absolute inset-0 bg-black/0 group-hover:bg-black/5 transition-colors duration-200" />
        </div>
      </Zoom>
      <div className="p-3 bg-background space-y-1.5">
        {/* Brand Name */}
        <h3 className="font-medium text-sm truncate text-foreground">
          {template.brand || 'Unknown Brand'}
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
  );
};
