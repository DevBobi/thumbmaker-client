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
}

export const TemplateCard = ({
  template,
  isSelected = false,
  onSelect,
  type = "normal",
}: TemplateCardProps) => {
  return (
    <div
      key={template.id}
      className={`relative border rounded-md overflow-hidden cursor-pointer group transition-all ${
        isSelected ? "ring-2 ring-brand-500" : "hover:shadow-md"
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
          alt: `${template.brand || 'Template'} thumbnail template - ${template.category} category`,
          width: 800,
          height: 600,
        }}
        zoomMargin={40}
        classDialog="custom-zoom"
      >
        <div className="relative w-full aspect-[4/3]">
          <Image
            src={template.image}
            alt={`${template.brand || 'Template'} thumbnail template - ${template.category} category`}
            fill
            sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
            className="object-cover"
            priority={false}
          />
        </div>
      </Zoom>
      <div className="p-2 bg-background">
        <div>
          <h3 className="font-medium text-sm truncate">{template.brand}</h3>

          <div className="flex items-center justify-between gap-1 mt-1">
            <div>
              <p className="text-[8px] text-muted-foreground truncate">Niche</p>
              <div className="text-[9px] py-0.5">{template.niche}</div>
            </div>
            <div>
              <p className="text-[8px] text-muted-foreground truncate">
                Category
              </p>
              <div className="text-[9px] py-0.5">{template.category}</div>
            </div>
            <div>
              <p className="text-[8px] text-muted-foreground truncate">
                Sub Niche
              </p>
              <div className="text-[9px] py-0.5">{template.subNiche}</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
