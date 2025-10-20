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
      <Card className="overflow-hidden hover:shadow-lg transition-all duration-300 border border-border hover:border-primary/50">
        {/* Image/Logo Section */}
        <div className="aspect-video relative bg-gradient-to-br from-muted/30 to-muted/10">
          {project.image ? (
            <Image
              src={project.image}
              alt={project.title}
              fill
              className="object-contain p-6 group-hover:scale-105 transition-transform duration-300"
            />
          ) : (
            <div className="flex items-center justify-center h-full">
              <div className="text-center">
                <div className="w-16 h-16 mx-auto mb-2 bg-muted rounded-lg flex items-center justify-center">
                  <ImageIcon className="h-8 w-8 text-muted-foreground" />
                </div>
                <span className="text-xs text-muted-foreground">No image</span>
              </div>
            </div>
          )}
        </div>

        {/* Content Section */}
        <CardContent className="p-4">
          <div className="space-y-3">
            {/* Title */}
            <h3 className="font-semibold text-base line-clamp-1 group-hover:text-primary transition-colors">
              {project.title}
            </h3>

            {/* Description */}
            <p className="text-sm text-muted-foreground line-clamp-2 leading-relaxed">
              {project.description || "No description available"}
            </p>

            {/* Footer */}
            <div className="flex items-center justify-between pt-2 border-t border-border">
              <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                <Clock className="h-3.5 w-3.5" />
                <span suppressHydrationWarning>
                  {project.createdAt ? getDaysAgo(project.createdAt) : "No date"}
                </span>
              </div>
              <Badge variant="secondary" className="text-xs">
                Project
              </Badge>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default ProductCard;
