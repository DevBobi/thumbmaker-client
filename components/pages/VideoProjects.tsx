"use client";
import React, { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Plus,
  Search,
  Grid3X3,
  List,
  ArrowUpDown,
  Loader2,
} from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import { useAuthFetch } from "@/hooks/use-auth-fetch";
import { getDaysAgo } from "@/lib/utils";
import Breadcrumb from "@/components/Breadcrumb";
import { VideoProjectSheet } from "@/components/video-projects/VideoProjectSheet";

// Define the VideoProject type
interface VideoProject {
  id: string;
  title: string;
  description: string;
  image?: string | null;
  createdAt: string;
  updatedAt: string;
  userId: string;
}

const VideoProjects = () => {
  // Use React Query to fetch projects
  const { authFetch } = useAuthFetch();
  const [searchTerm, setSearchTerm] = useState("");
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [sortBy, setSortBy] = useState<"name" | "date">("date");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc");
  const [isCreateSheetOpen, setIsCreateSheetOpen] = useState(false);
  const [isEditSheetOpen, setIsEditSheetOpen] = useState(false);
  const [editingProjectId, setEditingProjectId] = useState<string | null>(null);

  const handleEditProject = (projectId: string) => {
    setEditingProjectId(projectId);
    setIsEditSheetOpen(true);
  };

  // Function to fetch projects from the API
  const fetchVideoProjects = async (): Promise<VideoProject[]> => {
    const response = await authFetch("/api/projects");
    if (!response.ok) {
      throw new Error("Failed to fetch projects");
    }
    const data = await response.json();
    console.log("Fetched projects data:", data);
    return data;
  };

  const {
    data: projects = [],
    isLoading,
    isError,
    refetch,
  } = useQuery({
    queryKey: ["projects"],
    queryFn: fetchVideoProjects,
  });

  // Filter projects based on search term
  const filteredProjects = projects.filter(
    (project) =>
      project.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      project.description.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Sort projects
  const sortedProjects = [...filteredProjects].sort((a, b) => {
    if (sortBy === "name") {
      return sortOrder === "asc"
        ? a.title.localeCompare(b.title)
        : b.title.localeCompare(a.title);
    } else {
      // Sort by date
      const dateA = a.updatedAt ? new Date(a.updatedAt).getTime() : 0;
      const dateB = b.updatedAt ? new Date(b.updatedAt).getTime() : 0;
      return sortOrder === "asc" ? dateA - dateB : dateB - dateA;
    }
  });

  const toggleSortOrder = () => {
    setSortOrder(sortOrder === "asc" ? "desc" : "asc");
  };

  const handleSortChange = (value: "name" | "date") => {
    if (sortBy === value) {
      toggleSortOrder();
    } else {
      setSortBy(value);
      setSortOrder("asc");
    }
  };

  // Show loading state
  if (isLoading) {
    return (
      <div className="max-w-7xl mx-auto flex items-center justify-center h-64">
        <div className="flex flex-col items-center gap-2">
          <Loader2 className="h-8 w-8 animate-spin text-brand-600" />
          <p className="text-muted-foreground">Loading projects...</p>
        </div>
      </div>
    );
  }

  // Show error state
  if (isError) {
    return (
      <div className="max-w-7xl mx-auto flex items-center justify-center h-64">
        <div className="text-center py-12 border border-dashed rounded-lg max-w-md mx-auto">
          <div className="flex flex-col items-center gap-2">
            <div className="bg-red-100 rounded-full p-3">
              <Search className="h-6 w-6 text-red-500" />
            </div>
            <h3 className="font-medium text-lg">
              Error loading projects
            </h3>
            <p className="text-muted-foreground">
              There was a problem loading your projects. Please try again
              later.
            </p>
            <Button
              variant="outline"
              className="mt-4"
              onClick={() => window.location.reload()}
            >
              Retry
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto space-y-8">
      <Breadcrumb
        items={[
          { label: "Dashboard", href: "/dashboard" },
          { label: "Projects", href: "/dashboard/video-projects" },
        ]}
      />
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold">All Projects</h1>
          <p className="text-muted-foreground mt-1">
            Manage your projects and create thumbnails
          </p>
        </div>
        <Button 
          variant="brand" 
          size="lg" 
          className="gap-2 shadow-sm"
          onClick={() => setIsCreateSheetOpen(true)}
        >
          <Plus className="h-4 w-4" />
          New Project
        </Button>
      </div>

      <div className="flex flex-col sm:flex-row gap-4 mb-6">
        <div className="relative flex-1">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search projects..."
            className="pl-8"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <div className="flex gap-2 flex-wrap sm:flex-nowrap">
          <Button
            variant="outline"
            size="icon"
            onClick={() => setViewMode("grid")}
            className={viewMode === "grid" ? "bg-accent" : ""}
          >
            <Grid3X3 className="h-4 w-4" />
          </Button>
          <Button
            variant="outline"
            size="icon"
            onClick={() => setViewMode("list")}
            className={viewMode === "list" ? "bg-accent" : ""}
          >
            <List className="h-4 w-4" />
          </Button>
          <div className="border-l mx-1 hidden sm:block"></div>
          <Button
            variant="outline"
            size="default"
            onClick={() => handleSortChange("name")}
            className="gap-1"
          >
            Name
            {sortBy === "name" && (
              <ArrowUpDown className="h-3.5 w-3.5 text-muted-foreground" />
            )}
          </Button>
          <Button
            variant="outline"
            size="default"
            onClick={() => handleSortChange("date")}
            className="gap-1"
          >
            Date
            {sortBy === "date" && (
              <ArrowUpDown className="h-3.5 w-3.5 text-muted-foreground" />
            )}
          </Button>
        </div>
      </div>

      {sortedProjects.length === 0 ? (
        <div className="text-center py-12 border border-dashed rounded-lg">
          <div className="flex flex-col items-center gap-2">
            <div className="bg-muted rounded-full p-3">
              <Search className="h-6 w-6 text-muted-foreground" />
            </div>
            <h3 className="font-medium text-lg">No projects found</h3>
            <p className="text-muted-foreground max-w-md">
              {searchTerm
                ? `No projects match "${searchTerm}". Try a different search term.`
                : "You haven't created any projects yet. Create your first project to get started."}
            </p>
            {searchTerm && (
              <Button
                variant="outline"
                className="mt-2"
                onClick={() => setSearchTerm("")}
              >
                Clear search
              </Button>
            )}
            {!searchTerm && (
              <Button variant="brand" className="mt-4 gap-2" asChild>
                <Link href="/dashboard/create-video-project">
                  <Plus className="h-4 w-4" />
                  New Project
                </Link>
              </Button>
            )}
          </div>
        </div>
      ) : viewMode === "grid" ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {sortedProjects.map((project) => {
            console.log("Rendering project:", project);
            return (
            <div
              key={project.id}
              onClick={() => handleEditProject(project.id)}
              className="group cursor-pointer"
            >
              <div className="border rounded-lg overflow-hidden transition-all hover:shadow-md">
                <div className="aspect-video relative bg-accent/10">
                  <Image
                    src={project.image || "/logo/youtube.png"}
                    alt={project.title}
                    fill
                    className="object-cover"
                    onError={(e) => {
                      console.log("Image load error:", e);
                      e.currentTarget.src = "/logo/youtube.png";
                    }}
                  />
                </div>
                <div className="p-5">
                  <div className="flex justify-between items-start mb-2">
                    <h3 className="font-semibold text-lg text-foreground group-hover:text-brand-600 transition-colors duration-200">
                      {project.title}
                    </h3>
                  </div>

                  <p className="text-muted-foreground text-sm line-clamp-2 mb-4">
                    {project.description}
                  </p>

                  <div className="flex items-center text-xs text-muted-foreground">
                    {project.createdAt && getDaysAgo(project.createdAt)}
                  </div>
                </div>
              </div>
            </div>
            );
          })}
        </div>
      ) : (
        <div className="flex flex-col gap-3">
          {sortedProjects.map((project) => (
            <div
              key={project.id}
              onClick={() => handleEditProject(project.id)}
              className="group cursor-pointer"
            >
              <div className="border rounded-lg overflow-hidden transition-all hover:shadow-md hover:bg-accent/5 p-4">
                <div className="flex gap-4 flex-wrap sm:flex-nowrap">
                  <div className="h-16 w-24 bg-accent/10 rounded-md flex-shrink-0 relative">
                    <Image
                      src={project.image || "/logo/youtube.png"}
                      alt={project.title}
                      fill
                      className="object-cover"
                      onError={(e) => {
                        console.log("Image load error:", e);
                        e.currentTarget.src = "/logo/youtube.png";
                      }}
                    />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-lg text-foreground group-hover:text-brand-600 transition-colors duration-200">
                      {project.title}
                    </h3>
                    <p className="text-muted-foreground text-sm line-clamp-2 mt-1">
                      {project.description}
                    </p>
                    <div className="flex items-center text-xs text-muted-foreground mt-2">
                      {project.createdAt
                        ? getDaysAgo(project.createdAt)
                        : "No date"}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Project Creation Sheet */}
      <VideoProjectSheet
        open={isCreateSheetOpen}
        onOpenChange={setIsCreateSheetOpen}
        mode="create"
        onSuccess={() => {
          refetch();
        }}
      />

      {/* Project View/Edit Sheet */}
      <VideoProjectSheet
        open={isEditSheetOpen}
        onOpenChange={setIsEditSheetOpen}
        mode="view"
        projectId={editingProjectId || undefined}
        onSuccess={() => {
          refetch();
          setEditingProjectId(null);
        }}
      />
    </div>
  );
};

export default VideoProjects;
