"use client";
import React, { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Sparkles, Plus, Image, Video, FolderOpen, LayoutTemplate, PlayCircle, ArrowRight } from "lucide-react";
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

  // Check if user is visiting dashboard for the first time
  useEffect(() => {
    const hasVisitedDashboard = localStorage.getItem("hasVisitedDashboard");
    if (!hasVisitedDashboard) {
      setIsTutorialOpen(true);
      localStorage.setItem("hasVisitedDashboard", "true");
    }
  }, []);

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
    <div className="mx-auto space-y-6">
      <GuaranteePopup />
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Dashboard</h1>
          <p className="text-muted-foreground mt-1">Manage your YouTube thumbnails and projects</p>
        </div>
        <div className="flex flex-wrap gap-3">
          <Button 
            variant="outline" 
            className="relative gap-2 group overflow-hidden hover:border-primary transition-all duration-500 hover:scale-105 hover:shadow-lg hover:shadow-primary/20"
            onClick={() => setIsTutorialOpen(true)}
            style={{
              animation: 'glow 2s ease-in-out infinite, breathe 3s ease-in-out infinite',
            }}
          >
            {/* Rotating gradient glow */}
            <div 
              className="absolute -inset-1 bg-gradient-to-r from-primary via-purple-500 to-primary rounded-md opacity-60 blur-sm -z-10"
              style={{ animation: 'spin 3s linear infinite' }}
            />
            
            {/* Animated gradient background */}
            <div 
              className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 rounded-md"
              style={{
                background: 'linear-gradient(90deg, transparent, hsl(var(--primary) / 0.1), transparent)',
                animation: 'shimmer 2s infinite',
              }}
            />
            
            {/* Moving wave shimmer */}
            <div 
              className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent rounded-md"
              style={{
                animation: 'wave 3s ease-in-out infinite',
                transform: 'translateX(-100%)',
              }}
            />
            
            {/* Pulsing dot */}
            <div 
              className="absolute -top-1 -right-1 w-2 h-2 bg-primary rounded-full"
              style={{ animation: 'ping 1.5s cubic-bezier(0, 0, 0.2, 1) infinite' }}
            />
            
            <PlayCircle 
              className="h-4 w-4 text-primary group-hover:text-primary/80 relative z-10 transition-all duration-300"
              style={{ animation: 'bounce 2s ease-in-out infinite' }}
            />
            <span className="relative z-10 font-semibold text-primary">
              Watch Tutorial
            </span>
          </Button>
          
          <style jsx>{`
            @keyframes glow {
              0%, 100% {
                box-shadow: 0 0 5px hsl(var(--primary) / 0.3);
              }
              50% {
                box-shadow: 0 0 20px hsl(var(--primary) / 0.5), 0 0 30px hsl(var(--primary) / 0.3);
              }
            }
            
            @keyframes breathe {
              0%, 100% {
                transform: scale(1);
              }
              50% {
                transform: scale(1.02);
              }
            }
            
            @keyframes shimmer {
              0% {
                transform: translateX(-100%);
              }
              100% {
                transform: translateX(100%);
              }
            }
            
            @keyframes wave {
              0% {
                transform: translateX(-100%);
              }
              50% {
                transform: translateX(100%);
              }
              100% {
                transform: translateX(-100%);
              }
            }
            
            @keyframes spin {
              from {
                transform: rotate(0deg);
              }
              to {
                transform: rotate(360deg);
              }
            }
            
            @keyframes bounce {
              0%, 100% {
                transform: translateY(0);
              }
              50% {
                transform: translateY(-2px);
              }
            }
            
            @keyframes ping {
              75%, 100% {
                transform: scale(2);
                opacity: 0;
              }
            }
          `}</style>
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
                  <h3 className="font-semibold text-base mb-1 text-foreground">Create Thumbnail</h3>
                  <p className="text-xs text-muted-foreground">Generate AI-powered thumbnails</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </Link>

        <Card className="bg-white border-gray-200 shadow-sm hover:shadow-lg transition-all duration-300 cursor-pointer group" onClick={() => setIsCreateSheetOpen(true)}>
          <CardContent className="p-5">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-blue-100 rounded-lg group-hover:bg-blue-200 transition-colors">
                <Video className="h-6 w-6 text-blue-600" />
              </div>
              <div className="flex-1">
                <h3 className="font-semibold text-base mb-1 text-foreground">New Project</h3>
                <p className="text-xs text-muted-foreground">Add a video project</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Link href="/dashboard/templates">
          <Card className="bg-white border-gray-200 shadow-sm hover:shadow-lg transition-all duration-300 cursor-pointer group">
            <CardContent className="p-5">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-purple-100 rounded-lg group-hover:bg-purple-200 transition-colors">
                  <LayoutTemplate className="h-6 w-6 text-purple-600" />
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold text-base mb-1 text-foreground">Browse Templates</h3>
                  <p className="text-xs text-muted-foreground">Explore pre-made designs</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </Link>
      </section>

      {/* Video Projects Section */}
      <section>
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
          <div>
            <h2 className="text-2xl font-bold text-foreground">Recent Projects</h2>
            <p className="text-muted-foreground mt-1">Your latest video projects</p>
          </div>
          <Button variant="outline" className="gap-2" asChild>
            <Link href="/dashboard/projects">
              All Projects
              <ArrowRight className="h-4 w-4" />
            </Link>
          </Button>
        </div>

        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <Card key={i} className="bg-white border-gray-200 overflow-hidden">
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
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4 auto-rows-fr">
          {sortedProjects && sortedProjects.length > 0 ? (
              <>
                {sortedProjects.slice(0, 6).map((project: Project) => (
              <ProductCard key={project.id} project={project} onEdit={handleEditProject} />
                ))}
                {sortedProjects.length > 6 && (
                  <Card className="relative border-2 border-dashed border-gray-300 hover:border-primary/50 hover:bg-gradient-to-br hover:from-primary/5 hover:to-purple-500/5 transition-all duration-500 h-full flex flex-col group overflow-hidden hover:-translate-y-1 hover:shadow-xl hover:shadow-primary/10">
                    {/* Animated background circles */}
                    <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500">
                      <div className="absolute top-0 right-0 w-32 h-32 bg-primary/10 rounded-full blur-3xl" />
                      <div className="absolute bottom-0 left-0 w-32 h-32 bg-purple-500/10 rounded-full blur-3xl" />
                    </div>
                    
                    <CardContent className="p-6 flex-1 flex items-center justify-center relative z-10">
                      <Link href="/dashboard/projects" className="flex flex-col items-center gap-4 text-center w-full">
                        <div className="relative">
                          <div className="p-4 bg-gradient-to-br from-primary/10 to-purple-500/10 rounded-2xl group-hover:scale-110 group-hover:rotate-3 transition-all duration-500 border border-primary/20">
                            <FolderOpen className="h-8 w-8 text-primary" />
                          </div>
                          {/* Floating badge */}
                          <div className="absolute -top-1 -right-1 w-6 h-6 bg-gradient-to-br from-primary to-purple-600 rounded-full flex items-center justify-center text-white text-xs font-bold shadow-lg">
                            {sortedProjects.length - 6}
                          </div>
                        </div>
                        <div>
                          <p className="font-bold text-base mb-1 group-hover:bg-gradient-to-r group-hover:from-primary group-hover:to-purple-600 group-hover:bg-clip-text group-hover:text-transparent transition-all duration-300">
                            View All Projects
                          </p>
                          <p className="text-xs text-muted-foreground font-medium">
                            {sortedProjects.length - 6} more project{sortedProjects.length - 6 !== 1 ? 's' : ''} waiting
                          </p>
                        </div>
                      </Link>
                    </CardContent>
                  </Card>
                )}
              </>
            ) : (
              <div className="col-span-full">
                <Card className="bg-white border-gray-200 border-dashed border-2">
                  <CardContent className="p-12 text-center">
                    <div className="flex flex-col items-center gap-4 max-w-md mx-auto">
                      <div className="relative">
                        <div className="p-4 bg-gradient-to-br from-purple-100 to-blue-100 rounded-full">
                          <Video className="h-8 w-8 text-purple-600" />
                        </div>
                        <div className="absolute -top-1 -right-1 w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center">
                          <Sparkles className="h-3.5 w-3.5 text-white" />
                        </div>
                      </div>
                      <div>
                        <h3 className="text-lg font-semibold mb-2 text-foreground">Ready to create amazing thumbnails?</h3>
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
        onOpenChange={(open) => {
          setIsEditSheetOpen(open);
          if (!open) {
            // Clear the editing project ID when sheet closes
            setEditingProjectId(null);
          }
        }}
        mode="view"
        projectId={editingProjectId || undefined}
        onSuccess={() => {
          refetch(); // Refresh projects list
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
