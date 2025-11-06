import React from "react";
import Link from "next/link";
import Image from "next/image";
import { getDaysAgo } from "@/lib/utils";
import { Project } from "@/types";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Clock, ImageIcon } from "lucide-react";

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
    <div onClick={handleClick} className="group block cursor-pointer">
      <div className="bg-white border border-gray-200 rounded-xl overflow-hidden shadow-sm hover:shadow-lg transition-all duration-300">
        {/* Image/Logo Section */}
        <div className="aspect-video relative bg-muted">
          {project.image ? (
            <Image
              src={project.image}
              alt={project.title}
              fill
              className="object-contain"
            />
          ) : (
            <div className="flex items-center justify-center h-full">
              <div className="text-center">
                <div className="w-16 h-16 mx-auto mb-2 bg-white/50 rounded-lg flex items-center justify-center">
                  <ImageIcon className="h-8 w-8 text-gray-400" />
                </div>
                <span className="text-xs text-gray-400">No image</span>
              </div>
            </div>
          )}
        </div>

        {/* Content Section */}
        <div className="p-4">
          {/* Title */}
          <h3 className="font-bold text-lg text-gray-900 mb-2 line-clamp-2 group-hover:text-brand-600 transition-colors">
            {project.title}
          </h3>

          {/* Description */}
          <p className="text-sm text-gray-600 line-clamp-2 mb-3">
            {project.description || "No description available"}
          </p>

          {/* Footer */}
          <div className="flex items-center text-xs text-gray-500">
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
