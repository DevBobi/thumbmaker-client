"use client";
import React, { useState, useEffect, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Sparkles, Plus, Image, Video, Zap, FolderOpen, LayoutTemplate } from "lucide-react";
import Link from "next/link";
import ProductCard from "@/components/products/ProductCard";
import { GuaranteePopup } from "@/components/GuaranteePopup";
import { Project } from "@/types";
import { useAuthFetch } from "@/hooks/use-auth-fetch";
import { Card, CardContent } from "@/components/ui/card";
import { VideoProjectSheet } from "@/components/video-projects/VideoProjectSheet";

interface DashboardProps {
  projects?: Project[];
}

const Dashboard = ({ projects: initialProjects }: DashboardProps) => {
  const [projects, setProjects] = useState<Project[]>(initialProjects || []);
  const [isLoading, setIsLoading] = useState(!initialProjects);
  const [isCreateSheetOpen, setIsCreateSheetOpen] = useState(false);
  const [isEditSheetOpen, setIsEditSheetOpen] = useState(false);
  const [editingProjectId, setEditingProjectId] = useState<string | null>(null);
  const { authFetch } = useAuthFetch();

  const fetchProjects = useCallback(async () => {
    try {
      const response = await authFetch("/api/projects");
      
      if (response.ok) {
        const data = await response.json();
        setProjects(data);
      } else {
        console.error("Failed to fetch projects:", response.statusText);
      }
    } catch (error) {
      console.error("Error fetching projects:", error);
    } finally {
      setIsLoading(false);
    }
  }, [authFetch]);

  const handleEditProject = (projectId: string) => {
    setEditingProjectId(projectId);
    setIsEditSheetOpen(true);
  };

  useEffect(() => {
    if (!initialProjects) {
      fetchProjects();
    }
  }, [initialProjects, fetchProjects]);

  return (
    <div className="space-y-8">
      <GuaranteePopup />
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">Dashboard</h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">Manage your YouTube thumbnails and projects</p>
        </div>
        <div className="flex gap-3">
          <Button variant="outline" className="gap-2" asChild>
            <Link href="/dashboard/video-projects">
              <Video className="h-4 w-4" />
              All Projects
            </Link>
          </Button>
          <Button className="gap-2" asChild>
            <Link href="/dashboard/create-youtube-thumbnail">
              {/* eslint-disable-next-line jsx-a11y/alt-text */}
              <Image className="h-4 w-4" />
              Create Thumbnail
            </Link>
          </Button>
        </div>
      </div>


      {/* Quick Actions */}
      <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        <Link href="/dashboard/create-youtube-thumbnail">
          <Card className="hover:shadow-md transition-all cursor-pointer group">
            <CardContent className="p-6">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-primary/10 rounded-lg group-hover:bg-primary/20 transition-colors">
                  {/* eslint-disable-next-line jsx-a11y/alt-text */}
                  <Image className="h-6 w-6 text-primary" />
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold mb-1">Create Thumbnail</h3>
                  <p className="text-xs text-muted-foreground">Generate AI-powered thumbnails</p>
                </div>
                <Zap className="h-5 w-5 text-muted-foreground group-hover:text-primary transition-colors" />
              </div>
            </CardContent>
          </Card>
        </Link>

        <Card className="hover:shadow-md transition-all cursor-pointer group" onClick={() => setIsCreateSheetOpen(true)}>
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-blue-100 dark:bg-blue-900/30 rounded-lg group-hover:bg-blue-200 dark:group-hover:bg-blue-900/50 transition-colors">
                <Video className="h-6 w-6 text-blue-600 dark:text-blue-400" />
              </div>
              <div className="flex-1">
                <h3 className="font-semibold mb-1">New Project</h3>
                <p className="text-xs text-muted-foreground">Add a video project</p>
              </div>
              <Plus className="h-5 w-5 text-muted-foreground group-hover:text-primary transition-colors" />
            </div>
          </CardContent>
        </Card>

        <Link href="/dashboard/templates">
          <Card className="hover:shadow-md transition-all cursor-pointer group">
            <CardContent className="p-6">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-purple-100 dark:bg-purple-900/30 rounded-lg group-hover:bg-purple-200 dark:group-hover:bg-purple-900/50 transition-colors">
                  <LayoutTemplate className="h-6 w-6 text-purple-600 dark:text-purple-400" />
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold mb-1">Browse Templates</h3>
                  <p className="text-xs text-muted-foreground">Explore pre-made designs</p>
                </div>
                <Sparkles className="h-5 w-5 text-muted-foreground group-hover:text-primary transition-colors" />
      </div>
            </CardContent>
          </Card>
        </Link>
    </section>


      {/* Video Projects Section */}
      <section>
        <div className="flex justify-between items-center mb-6">
          <div>
            <h2 className="text-2xl font-semibold">Recent Projects</h2>
            <p className="text-sm text-muted-foreground mt-1">Your latest video projects</p>
          </div>
        </div>

        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <Card key={i} className="overflow-hidden">
                <div className="h-40 bg-muted animate-pulse" />
                <CardContent className="p-4 space-y-3">
                  <div className="h-5 bg-muted rounded animate-pulse" />
                  <div className="h-4 bg-muted rounded w-3/4 animate-pulse" />
                  <div className="h-3 bg-muted rounded w-1/2 animate-pulse" />
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {projects && projects.length > 0 ? (
              <>
                {projects.slice(0, 6).map((project: Project) => (
              <ProductCard key={project.id} project={project} onEdit={handleEditProject} />
                ))}
                {projects.length > 6 && (
                  <Card className="border-dashed border-2 hover:border-primary/50 hover:bg-accent/5 transition-all">
                    <CardContent className="p-6 h-full flex items-center justify-center">
                      <Link href="/dashboard/video-projects" className="flex flex-col items-center gap-3 text-center w-full">
                        <div className="p-3 bg-muted rounded-full">
                          <FolderOpen className="h-6 w-6 text-muted-foreground" />
                        </div>
                        <div>
                          <p className="font-medium mb-1">View All Projects</p>
                          <p className="text-xs text-muted-foreground">
                            {projects.length - 6} more project{projects.length - 6 !== 1 ? 's' : ''}
                          </p>
                        </div>
                      </Link>
                    </CardContent>
                  </Card>
                )}
              </>
            ) : (
              <div className="col-span-full">
                <Card className="border-dashed border-2">
                  <CardContent className="p-12 text-center">
                    <div className="flex flex-col items-center gap-4 max-w-md mx-auto">
                      <div className="relative">
                        <div className="p-4 bg-gradient-to-br from-purple-100 to-blue-100 dark:from-purple-900/30 dark:to-blue-900/30 rounded-full">
                          <Video className="h-8 w-8 text-purple-600 dark:text-purple-400" />
                        </div>
                        <div className="absolute -top-1 -right-1 w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center">
                          <Sparkles className="h-3.5 w-3.5 text-white" />
                        </div>
                      </div>
                      <div>
                        <h3 className="text-lg font-semibold mb-2">Ready to create amazing thumbnails?</h3>
                        <p className="text-sm text-muted-foreground mb-6">
                          Start by creating your first video project. Once you have a project, you can generate eye-catching thumbnails with AI.
                        </p>
                        <div className="flex justify-center">
                          <Button size="lg" onClick={() => setIsCreateSheetOpen(true)}>
                            <Plus className="h-4 w-4 mr-2" />
                            Create Your First Project
                          </Button>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
            </div>
          )}
        </div>
        )}
      </section>

      {/* Sheet Components */}
      <VideoProjectSheet
        open={isCreateSheetOpen}
        onOpenChange={setIsCreateSheetOpen}
        mode="create"
        onSuccess={() => {
          fetchProjects(); // Refresh projects list
        }}
      />

      <VideoProjectSheet
        open={isEditSheetOpen}
        onOpenChange={setIsEditSheetOpen}
        mode="view"
        projectId={editingProjectId || undefined}
        onSuccess={() => {
          fetchProjects(); // Refresh projects list
          setEditingProjectId(null);
        }}
      />

    </div>
  );
};

export default Dashboard;
