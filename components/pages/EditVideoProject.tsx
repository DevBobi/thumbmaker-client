"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Save, Trash } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import VideoProjectEditForm from "@/components/thumbnail/VideoProjectEditForm";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { useAuthFetch } from "@/hooks/use-auth-fetch";
import { Skeleton } from "@/components/ui/skeleton";
import Breadcrumb from "@/components/Breadcrumb";
import Link from "next/link";

const EditVideoProject = () => {
  const router = useRouter();
  const { authFetch } = useAuthFetch();
  const params = useParams<{ id: string }>();
  const id = params?.id;

  const { toast } = useToast();
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  const [formData, setFormData] = useState({
    videoTitle: "",
    videoDescription: "",
    highlights: [""],
    targetAudience: "",
  });

  useEffect(() => {
    const fetchProject = async () => {
      if (id) {
        try {
          setIsLoading(true);
          const response = await authFetch(`/api/video-projects/${id}`);

          if (response.status === 404) {
            // For development/testing, set mock data
            const mockData = {
              videoTitle: "Sample Video Title",
              videoDescription: "This is a sample video description that would typically come from the backend. It's being used as mock data while the backend is under construction.",
              highlights: [
                "Key highlight point 1",
                "Important feature or benefit",
                "Another compelling point"
              ],
              targetAudience: "Digital marketers and small business owners"
            };
            // ##################################
            
            setFormData(mockData);
            setIsLoading(false);

            return;
          }

          if (!response.ok) {
            throw new Error("Failed to fetch project");
          }

          const project = await response.json();

          if (project) {
            // Ensure we have valid data for all fields
            setFormData({
              videoTitle: project.videoTitle || "",
              videoDescription: project.videoDescription || "",
              highlights: Array.isArray(project.highlights) && project.highlights.length > 0 
                ? project.highlights 
                : [""],
              targetAudience: project.targetAudience || "",
            });
          } else {
            throw new Error("Project data is empty");
          }
        } catch (error) {
          console.error("Error fetching project:", error);
          toast({
            title: "Error",
            description: "Failed to load project details. Using sample data instead.",
            variant: "destructive",
          });
          
          // Set mock data on error as well
          setFormData({
            videoTitle: "Sample Video Title",
            videoDescription: "This is a sample video description that would typically come from the backend. It's being used as mock data while the backend is under construction.",
            highlights: [
              "Key highlight point 1",
              "Important feature or benefit",
              "Another compelling point"
            ],
            targetAudience: "Digital marketers and small business owners"
          });
        } finally {
          setIsLoading(false);
        }
      }
    };

    if (id) {
      fetchProject();
    } else {
      setIsLoading(false);
    }
  }, [id]);

  const handleSubmit = async (data: any) => {
    setIsSaving(true);
    try {
      const response = await authFetch(`/api/video-projects/${id}`, {
        method: "PUT",
        body: JSON.stringify(data),
      });

      if (response.ok) {
        toast({
          title: "Project updated",
          description: "Your changes have been saved successfully.",
        });
        router.refresh();
      } else {
        throw new Error("Failed to update project");
      }
    } catch (error) {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to save project changes. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSaving(false);
    }
  };

  const handleDeleteClick = () => {
    setDeleteDialogOpen(true);
  };

  const handleReturnBack = () => {
      router.back();
  }

  const handleConfirmDelete = async () => {
    if (id) {
      setIsDeleting(true);
      const response = await authFetch(`/api/video-projects/${id}`, {
        method: "DELETE",
      });

      if (response.ok) {
        toast({
          title: "Project deleted",
          description: "The project has been permanently removed.",
        });
        router.push("/dashboard");
      } else {
        toast({
          title: "Error",
          description: "Failed to delete the project. Please try again.",
          variant: "destructive",
        });
      }
      setIsDeleting(false);
    }
    setDeleteDialogOpen(false);
  };

  // Skeleton loader component
  const ProjectEditSkeleton = () => (
    <div className="space-y-6">
      <Skeleton className="h-12 w-3/4" />
      <div className="space-y-4">
        <Skeleton className="h-10 w-full" />
        <Skeleton className="h-32 w-full" />
        <Skeleton className="h-32 w-full" />
        <Skeleton className="h-10 w-full" />
        <Skeleton className="h-32 w-full" />
      </div>
      <div className="flex justify-between pt-4">
        <Skeleton className="h-10 w-24" />
        <div className="space-x-2">
          <Skeleton className="h-10 w-24 inline-block" />
          <Skeleton className="h-10 w-32 inline-block" />
        </div>
      </div>
    </div>
  );

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <Breadcrumb
        items={[
          { label: "Dashboard", href: "/dashboard" },
          { label: "Edit Project", href: `/dashboard/create-video-project/edit/${id}` },
        ]}
      />

      <h1 className="text-3xl font-bold">Edit Video Project</h1>

      <Card className="rounded-md hover:shadow-md shadow-none transition-all duration-200">
        <CardHeader>
          <CardTitle>Project Details</CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <ProjectEditSkeleton />
          ) : (
            <div className="space-y-6">
              <VideoProjectEditForm 
                initialValues={formData}
                onSubmit={handleSubmit}
                isSaving={isSaving}
              />

              <div className="flex justify-between pt-4">
                <Button variant="outline" className="gap-2" asChild>
                  <Button onClick={handleReturnBack} variant="outline">
                    <ArrowLeft className="h-4 w-4" />
                    Cancel
                  </Button>
                </Button>
                <div className="space-x-2">
                  <Button
                    type="button"
                    variant="destructive"
                    className="gap-2"
                    onClick={handleDeleteClick}
                  >
                    <Trash className="h-4 w-4" />
                    Delete
                  </Button>
                  <Button
                    type="submit"
                    className="gap-2 bg-brand-600 hover:bg-brand-700 text-brand-foreground"
                    disabled={isSaving}
                    onClick={() => handleSubmit(formData)}
                  >
                    {isSaving ? (
                      <>
                        <div className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
                        Saving...
                      </>
                    ) : (
                      <>
                        <Save className="h-4 w-4" />
                        Save Changes
                      </>
                    )}
                  </Button>
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the
              project and remove it from our servers.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isDeleting}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleConfirmDelete}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              disabled={isDeleting}
            >
              {isDeleting ? "Deleting..." : "Delete"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default EditVideoProject; 