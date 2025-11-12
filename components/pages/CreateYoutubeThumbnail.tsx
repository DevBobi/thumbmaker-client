"use client";

import React, { useState, useEffect } from "react";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { Check, LayoutTemplate, Youtube } from "lucide-react";
import { useAuthFetch } from "@/hooks/use-auth-fetch";
import {
  Card,
  CardContent,
} from "@/components/ui/card";
import { Project } from "@/types";
import ThumbnailCreationSheet from "@/components/thumbnail/ThumbnailCreationSheet";
import Link from "next/link";

type GenerationMode = "template" | "youtube";

export default function CreateYoutubeThumbnail() {
  const { authFetch } = useAuthFetch();
  const [projects, setProjects] = useState<Project[]>([]);
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const [isSheetOpen, setIsSheetOpen] = useState(false);
  const [generationMode, setGenerationMode] = useState<GenerationMode>("template");
  const MAX_SELECTIONS = 5; // Maximum templates user can select

  // Fetch projects on mount
  const fetchProjects = async () => {
    try {
      const response = await authFetch("/api/projects");
      if (response.ok) {
        const data = await response.json();
        // Handle different response structures
        const projectsArray = Array.isArray(data) ? data : (data.projects || []);
        setProjects(projectsArray);
        
        // Don't auto-select - let user choose their project
        
        // If no projects, show helpful message
        if (projectsArray.length === 0) {
          console.log("No projects found. User should create a project first.");
        }
      } else {
        console.error("Failed to fetch projects:", response.status, response.statusText);
        setProjects([]);
      }
    } catch (error) {
      console.error("Error fetching projects:", error);
      setProjects([]);
    }
  };

  // Load projects on mount
  useEffect(() => {
    fetchProjects();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Handle mode selection and open sheet
  const handleModeSelection = (mode: GenerationMode) => {
    setGenerationMode(mode);
    setIsSheetOpen(true);
  };

  return (
    <div className="container mx-auto px-4 sm:px-6">
      {/* Breadcrumb */}
      <Breadcrumb className="mb-4">
        <BreadcrumbList>
          <BreadcrumbItem>
            <BreadcrumbLink asChild>
              <Link href="/dashboard">Dashboard</Link>
            </BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbPage>Create Thumbnail</BreadcrumbPage>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>

      {/* Page Title */}
      <div className="mb-6 sm:mb-8">
        <h1 className="text-2xl sm:text-3xl font-bold mb-2">Create YouTube Thumbnail</h1>
        <p className="text-sm sm:text-base text-muted-foreground">
          Choose a generation method to get started
        </p>
      </div>

      <div className="space-y-4 sm:space-y-6">
        {/* Selection Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl mx-auto">
          {/* Template Selection Card */}
          <Card 
            className="cursor-pointer transition-all hover:shadow-lg hover:scale-105 border-2 hover:border-primary"
            onClick={() => handleModeSelection("template")}
          >
            <CardContent className="p-8 text-center">
              <div className="w-16 h-16 mx-auto mb-4 bg-primary/10 rounded-full flex items-center justify-center">
                <LayoutTemplate className="h-8 w-8 text-primary" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Use Templates</h3>
              <p className="text-sm text-muted-foreground mb-4">
                Choose from our pre-designed templates to create professional thumbnails quickly
              </p>
              <div className="flex items-center justify-center gap-2 text-xs text-muted-foreground">
                <Check className="h-3 w-3" />
                <span>Select up to {MAX_SELECTIONS} templates</span>
              </div>
            </CardContent>
          </Card>

          {/* YouTube Link Card */}
          <Card 
            className="cursor-pointer transition-all hover:shadow-lg hover:scale-105 border-2 hover:border-primary"
            onClick={() => handleModeSelection("youtube")}
          >
            <CardContent className="p-8 text-center">
              <div className="w-16 h-16 mx-auto mb-4 bg-red-500/10 rounded-full flex items-center justify-center">
                <Youtube className="h-8 w-8 text-red-500" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Use YouTube Links</h3>
              <p className="text-sm text-muted-foreground mb-4">
                Generate thumbnails inspired by existing YouTube videos
              </p>
              <div className="flex items-center justify-center gap-2 text-xs text-muted-foreground">
                <Check className="h-3 w-3" />
                <span>Add YouTube video links for inspiration</span>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Thumbnail Creation Sheet */}
      <ThumbnailCreationSheet
        isOpen={isSheetOpen}
        onClose={() => setIsSheetOpen(false)}
        selectedTemplates={[]}
        selectedProject={selectedProject}
        onProjectChange={setSelectedProject}
        availableProjects={projects}
        youtubeLinks={[]}
        maxSelections={MAX_SELECTIONS}
        initialMode={generationMode}
      />
    </div>
  );
}
