import React from "react";
import Image from "next/image";
import { getDaysAgo } from "@/lib/utils";
import { Project } from "@/types";
import { Clock, ImageIcon, Eye } from "lucide-react";

interface ProductCardProps {
  project: Project;
  onEdit?: (projectId: string) => void;
}

const ProductCard = ({ project, onEdit }: ProductCardProps) => {
  const handleClick = () => {
    if (onEdit) {
      onEdit(project.id);
    }
  };

  return (
    <div onClick={handleClick} className="group cursor-pointer h-full">
      <div className="bg-card border rounded-xl overflow-hidden transition-all duration-300 flex flex-col h-full shadow-sm hover:shadow-lg">
        {/* Image/Logo Section */}
        <div className="aspect-video relative bg-muted flex-shrink-0">
          {project.image ? (
            <>
              <Image
                src={project.image}
                alt={project.title}
                fill
                className="object-contain group-hover:scale-105 transition-transform duration-500"
              />
              {/* Hover overlay with icon */}
              <div className="absolute inset-0 bg-black/0 group-hover:bg-black/40 transition-all duration-300 flex items-center justify-center">
                <div className="opacity-0 group-hover:opacity-100 transition-all duration-300 transform scale-75 group-hover:scale-100">
                  <div className="bg-background dark:bg-card rounded-full p-3 shadow-xl">
                    <Eye className="h-6 w-6 text-primary" />
                  </div>
                </div>
              </div>
            </>
          ) : (
            <div className="flex items-center justify-center h-full relative">
              <div className="text-center z-10">
                <div className="w-16 h-16 mx-auto mb-2 bg-muted/20 backdrop-blur-sm rounded-lg flex items-center justify-center">
                  <ImageIcon className="h-8 w-8 text-muted-foreground" />
                </div>
                <span className="text-xs text-muted-foreground">No thumbnail</span>
              </div>
            </div>
          )}
        </div>

        {/* Content Section */}
        <div className="p-4 flex flex-col flex-grow">
          <h3 className="font-bold text-lg text-foreground mb-2 line-clamp-2 group-hover:text-primary transition-colors min-h-[3.5rem]">
            {project.title}
          </h3>

          <p className="text-sm text-muted-foreground line-clamp-2 mb-3 flex-grow min-h-[2.5rem]">
            {project.description || "No description available"}
          </p>

          <div className="flex items-center text-xs text-muted-foreground/70 mt-auto">
            <Clock className="h-3.5 w-3.5 mr-1" />
            <span suppressHydrationWarning>
              {project.createdAt ? getDaysAgo(project.createdAt) : "No date"}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductCard;
