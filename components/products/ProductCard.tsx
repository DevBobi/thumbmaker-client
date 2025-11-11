import React from "react";
import Image from "next/image";
import { getDaysAgo } from "@/lib/utils";
import { Project } from "@/types";
import { Clock, ImageIcon, Play, Video } from "lucide-react";

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
      <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl overflow-hidden shadow-sm hover:shadow-2xl transition-all duration-300">
        {/* Image/Logo Section with YouTube-style overlay */}
        <div className="aspect-video relative bg-gradient-to-br from-gray-900 to-gray-800 overflow-hidden">
          {project.image ? (
            <>
              <Image
                src={project.image}
                alt={project.title}
                fill
                className="object-cover group-hover:scale-105 transition-transform duration-500"
              />
              {/* Dark overlay on hover */}
              <div className="absolute inset-0 bg-black/0 group-hover:bg-black/30 transition-all duration-300" />
              {/* YouTube-style Play Button */}
              <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-300">
                <div className="relative">
                  <div className="absolute inset-0 bg-red-600 rounded-full blur-xl opacity-50 animate-pulse" />
                  <div className="relative bg-red-600 hover:bg-red-700 rounded-full p-4 shadow-2xl transform group-hover:scale-110 transition-all duration-300">
                    <Play className="h-8 w-8 text-white fill-white" />
                  </div>
                </div>
              </div>
              {/* Video duration badge (bottom right) */}
              <div className="absolute bottom-2 right-2 bg-black/80 text-white text-xs px-2 py-1 rounded font-semibold">
                <Video className="h-3 w-3 inline mr-1" />
                Project
              </div>
            </>
          ) : (
            <div className="flex items-center justify-center h-full relative">
              <div className="text-center z-10">
                <div className="w-16 h-16 mx-auto mb-2 bg-white/10 backdrop-blur-sm rounded-lg flex items-center justify-center">
                  <ImageIcon className="h-8 w-8 text-gray-400" />
                </div>
                <span className="text-xs text-gray-400">No thumbnail</span>
              </div>
              {/* Play button for no-image state */}
              <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-300">
                <div className="bg-red-600 hover:bg-red-700 rounded-full p-4 shadow-2xl transform group-hover:scale-110 transition-all duration-300">
                  <Play className="h-8 w-8 text-white fill-white" />
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Content Section */}
        <div className="p-4">
          {/* Title with YouTube-style font */}
          <h3 className="font-bold text-lg text-gray-900 dark:text-gray-100 mb-2 line-clamp-2 group-hover:text-red-600 dark:group-hover:text-red-500 transition-colors">
            {project.title}
          </h3>

          {/* Description */}
          <p className="text-sm text-gray-600 dark:text-gray-400 line-clamp-2 mb-3">
            {project.description || "No description available"}
          </p>

          {/* Footer with metadata */}
          <div className="flex items-center justify-between text-xs text-gray-500 dark:text-gray-400">
            <div className="flex items-center">
              <Clock className="h-3.5 w-3.5 mr-1" />
              <span suppressHydrationWarning>
                {project.createdAt ? getDaysAgo(project.createdAt) : "No date"}
              </span>
            </div>
            {/* YouTube-style view indicator */}
            <div className="flex items-center gap-1 text-xs font-medium text-gray-400">
              <div className="w-1.5 h-1.5 bg-red-500 rounded-full animate-pulse" />
              <span>Active</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductCard;
