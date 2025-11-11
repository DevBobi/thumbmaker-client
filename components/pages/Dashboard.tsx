"use client";
import React, { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Sparkles, Plus, Image, Video, Zap, FolderOpen, LayoutTemplate, PlayCircle } from "lucide-react";
import Link from "next/link";
import ProductCard from "@/components/products/ProductCard";
import { GuaranteePopup } from "@/components/GuaranteePopup";
import { Project } from "@/types";
import { useAuthFetch } from "@/hooks/use-auth-fetch";
import { Card, CardContent } from "@/components/ui/card";
import { VideoProjectSheet } from "@/components/projects/VideoProjectSheet";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

const Dashboard = () => {
  const [isCreateSheetOpen, setIsCreateSheetOpen] = useState(false);
  const [isEditSheetOpen, setIsEditSheetOpen] = useState(false);
  const [editingProjectId, setEditingProjectId] = useState<string | null>(null);
  const [isTutorialOpen, setIsTutorialOpen] = useState(false);
  const { authFetch } = useAuthFetch();

  // Fetch projects using React Query
  const fetchProjects = async (): Promise<Project[]> => {
    const response = await authFetch("/api/projects");
    if (!response.ok) {
      throw new Error("Failed to fetch projects");
    }
    return response.json();
  };

  const {
    data: projects = [],
    isLoading,
    refetch,
  } = useQuery({
    queryKey: ["projects"],
    queryFn: fetchProjects,
  });

  const handleEditProject = (projectId: string) => {
    setEditingProjectId(projectId);
    setIsEditSheetOpen(true);
  };

  // Sort projects by last updated date (newest first)
  const sortedProjects = [...projects].sort((a, b) => {
    const dateA = new Date(a.updatedAt || a.createdAt || 0).getTime();
    const dateB = new Date(b.updatedAt || b.createdAt || 0).getTime();
    return dateB - dateA; // Descending order (newest first)
  });

  return (
    <div className="space-y-8">
      <GuaranteePopup />
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">Dashboard</h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">Manage your YouTube thumbnails and projects</p>
        </div>
        <div className="flex flex-wrap gap-3">
          <Button 
            variant="outline" 
            className="gap-2"
            onClick={() => setIsTutorialOpen(true)}
          >
            <PlayCircle className="h-4 w-4" />
            Watch Tutorial
          </Button>
          <Button variant="outline" className="gap-2" asChild>
            <Link href="/dashboard/projects">
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
          <Card className="bg-white border-gray-200 shadow-sm hover:shadow-lg transition-all duration-300 cursor-pointer group">
            <CardContent className="p-5">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-primary/10 rounded-lg group-hover:bg-primary/20 transition-colors">
                  {/* eslint-disable-next-line jsx-a11y/alt-text */}
                  <Image className="h-6 w-6 text-primary" />
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold text-base mb-1">Create Thumbnail</h3>
                  <p className="text-xs text-gray-600">Generate AI-powered thumbnails</p>
                </div>
                <Zap className="h-5 w-5 text-gray-400 group-hover:text-primary transition-colors" />
              </div>
            </CardContent>
          </Card>
        </Link>

        <Card className="bg-white border-gray-200 shadow-sm hover:shadow-lg transition-all duration-300 cursor-pointer group" onClick={() => setIsCreateSheetOpen(true)}>
          <CardContent className="p-5">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-blue-100 dark:bg-blue-900/30 rounded-lg group-hover:bg-blue-200 dark:group-hover:bg-blue-900/50 transition-colors">
                <Video className="h-6 w-6 text-blue-600 dark:text-blue-400" />
              </div>
              <div className="flex-1">
                <h3 className="font-semibold text-base mb-1">New Project</h3>
                <p className="text-xs text-gray-600">Add a video project</p>
              </div>
              <Plus className="h-5 w-5 text-gray-400 group-hover:text-primary transition-colors" />
            </div>
          </CardContent>
        </Card>

        <Link href="/dashboard/templates">
          <Card className="bg-white border-gray-200 shadow-sm hover:shadow-lg transition-all duration-300 cursor-pointer group">
            <CardContent className="p-5">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-purple-100 dark:bg-purple-900/30 rounded-lg group-hover:bg-purple-200 dark:group-hover:bg-purple-900/50 transition-colors">
                  <LayoutTemplate className="h-6 w-6 text-purple-600 dark:text-purple-400" />
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold text-base mb-1">Browse Templates</h3>
                  <p className="text-xs text-gray-600">Explore pre-made designs</p>
                </div>
                <Sparkles className="h-5 w-5 text-gray-400 group-hover:text-primary transition-colors" />
              </div>
            </CardContent>
          </Card>
        </Link>
      </section>

      {/* Featured Section */}
      <section>
        <Card className="relative overflow-hidden bg-gradient-to-r from-red-500 via-purple-600 to-blue-600 border-0 shadow-xl">
          <div className="absolute inset-0 bg-[url('/grid.svg')] opacity-10" />
          <CardContent className="relative p-8">
            <div className="flex flex-col md:flex-row items-center justify-between gap-6">
              <div className="flex-1 text-center md:text-left">
                <div className="inline-flex items-center gap-2 bg-white/20 backdrop-blur-sm text-white px-3 py-1 rounded-full text-xs font-semibold mb-4">
                  <Sparkles className="h-3.5 w-3.5" />
                  <span>AI-POWERED</span>
                </div>
                <h2 className="text-3xl font-bold text-white mb-3">
                  Create Stunning YouTube Thumbnails in Seconds
                </h2>
                <p className="text-white/90 text-base mb-6">
                  Use AI to generate eye-catching thumbnails that boost your video views and engagement
                </p>
                <div className="flex flex-wrap items-center gap-3 justify-center md:justify-start">
                  <Button 
                    size="lg" 
                    className="bg-white text-purple-600 hover:bg-gray-100 shadow-lg gap-2"
                    asChild
                  >
                    <Link href="/dashboard/create-youtube-thumbnail">
                      <Zap className="h-4 w-4" />
                      Start Creating
                    </Link>
                  </Button>
                  <Button 
                    size="lg" 
                    variant="outline" 
                    className="bg-white/10 backdrop-blur-sm text-white border-white/30 hover:bg-white/20 gap-2"
                    onClick={() => setIsTutorialOpen(true)}
                  >
                    <PlayCircle className="h-4 w-4" />
                    Watch Tutorial
                  </Button>
                </div>
              </div>
              <div className="relative">
                <div className="relative bg-white/10 backdrop-blur-sm rounded-2xl p-6 border border-white/20">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="text-center">
                      <div className="text-3xl font-bold text-white mb-1">
                        {projects.length}
                      </div>
                      <div className="text-white/80 text-sm">Projects</div>
                    </div>
                    <div className="text-center">
                      <div className="text-3xl font-bold text-white mb-1">AI</div>
                      <div className="text-white/80 text-sm">Powered</div>
                    </div>
                    <div className="text-center">
                      <div className="text-3xl font-bold text-white mb-1">∞</div>
                      <div className="text-white/80 text-sm">Templates</div>
                    </div>
                    <div className="text-center">
                      <div className="text-3xl font-bold text-white mb-1">HD</div>
                      <div className="text-white/80 text-sm">Quality</div>
                    </div>
                  </div>
                </div>
                <div className="absolute -top-4 -right-4 w-24 h-24 bg-yellow-400 rounded-full blur-2xl opacity-50" />
                <div className="absolute -bottom-4 -left-4 w-24 h-24 bg-pink-400 rounded-full blur-2xl opacity-50" />
              </div>
            </div>
          </CardContent>
        </Card>
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
          {sortedProjects && sortedProjects.length > 0 ? (
              <>
                {sortedProjects.slice(0, 6).map((project: Project) => (
              <ProductCard key={project.id} project={project} onEdit={handleEditProject} />
                ))}
                {sortedProjects.length > 6 && (
                  <Card className="border-dashed border-2 hover:border-primary/50 hover:bg-accent/5 transition-all">
                    <CardContent className="p-6 h-full flex items-center justify-center">
                      <Link href="/dashboard/projects" className="flex flex-col items-center gap-3 text-center w-full">
                        <div className="p-3 bg-muted rounded-full">
                          <FolderOpen className="h-6 w-6 text-muted-foreground" />
                        </div>
                        <div>
                          <p className="font-medium mb-1">View All Projects</p>
                          <p className="text-xs text-muted-foreground">
                            {sortedProjects.length - 6} more project{sortedProjects.length - 6 !== 1 ? 's' : ''}
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
          refetch(); // Refresh projects list
        }}
      />

      <VideoProjectSheet
        open={isEditSheetOpen}
        onOpenChange={setIsEditSheetOpen}
        mode="view"
        projectId={editingProjectId || undefined}
        onSuccess={() => {
          refetch(); // Refresh projects list
          setEditingProjectId(null);
        }}
      />

      {/* Tutorial Video Dialog */}
      <Dialog open={isTutorialOpen} onOpenChange={setIsTutorialOpen}>
        <DialogContent className="!max-w-none !w-[65vw] p-6">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <PlayCircle className="h-5 w-5 text-red-600" />
              Getting Started Tutorial
            </DialogTitle>
            <DialogDescription>
              Learn how to create amazing YouTube thumbnails with our platform
            </DialogDescription>
          </DialogHeader>
          <div className="relative w-full" style={{ paddingBottom: '56.25%' }}>
            <iframe
              className="absolute top-0 left-0 w-full h-full rounded-lg"
              src="https://www.youtube.com/embed/tcxPTCZ863A"
              title="Tutorial Video"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
            />
          </div>
        </DialogContent>
      </Dialog>

    </div>
  );
};

export default Dashboard;
