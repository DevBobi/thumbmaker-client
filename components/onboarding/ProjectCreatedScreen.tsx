"use client";

import { Project } from "@/types";
import { Button } from "@/components/ui/button";
import { CheckCircle2, ImageIcon, Sparkles } from "lucide-react";
import Image from "next/image";
import { getDaysAgo } from "@/lib/utils";
import { Clock } from "lucide-react";

interface ProjectCreatedScreenProps {
  project: Project;
  onNext: () => void;
}

export default function ProjectCreatedScreen({
  project,
  onNext,
}: ProjectCreatedScreenProps) {
  return (
    <div className="flex items-center justify-center w-full py-10 px-4">
      <div className="w-full max-w-2xl space-y-8">
        {/* Success Message */}
        <div className="text-center space-y-4">
          <div className="flex justify-center">
            <div className="p-3 rounded-full bg-green-100 dark:bg-green-900/20">
              <CheckCircle2 className="h-8 w-8 text-green-600 dark:text-green-400" />
            </div>
          </div>
          <h1 className="text-3xl font-bold">Project Created</h1>
          <p className="text-muted-foreground">
            Your project has been successfully created!
          </p>
        </div>

        {/* Project Card - matching ProductCard style */}
        <div className="max-w-md mx-auto">
          <div className="bg-card border rounded-xl overflow-hidden transition-all duration-300 flex flex-col h-full shadow-sm">
            {/* Image/Logo Section */}
            <div className="aspect-video relative bg-muted flex-shrink-0">
              {project.image ? (
                <Image
                  src={project.image}
                  alt={project.title}
                  fill
                  className="object-contain transition-transform duration-500"
                />
              ) : (
                <div className="flex items-center justify-center h-full relative">
                  <div className="text-center z-10">
                    <div className="w-16 h-16 mx-auto mb-2 bg-muted/20 backdrop-blur-sm rounded-lg flex items-center justify-center">
                      <ImageIcon className="h-8 w-8 text-muted-foreground" />
                    </div>
                    <span className="text-xs text-muted-foreground">
                      No thumbnail
                    </span>
                  </div>
                </div>
              )}
            </div>

            {/* Content Section */}
            <div className="p-4 flex flex-col flex-grow">
              <h3 className="font-bold text-lg text-foreground mb-2 line-clamp-2 min-h-[3.5rem]">
                {project.title}
              </h3>

              <p className="text-sm text-muted-foreground line-clamp-2 mb-3 flex-grow min-h-[2.5rem]">
                {project.description || "No description available"}
              </p>

              <div className="flex items-center text-xs text-muted-foreground/70 mb-4">
                <Clock className="h-3.5 w-3.5 mr-1" />
                <span suppressHydrationWarning>
                  {project.createdAt
                    ? getDaysAgo(project.createdAt)
                    : "Just now"}
                </span>
              </div>

              {/* Button at bottom */}
              <Button className="w-full gap-2" onClick={onNext}>
                <Sparkles className="h-4 w-4" />
                Let&apos;s Make Some Thumbnails
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

