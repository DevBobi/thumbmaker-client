"use client";

import React, { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { useToast } from "@/hooks/use-toast";
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
import { VideoProjectSheet } from "@/components/projects/VideoProjectSheet";

const EditVideoProject = () => {
  const router = useRouter();
  const { authFetch } = useAuthFetch();
  const params = useParams<{ id: string }>();
  const id = params?.id;

  const { toast } = useToast();
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isSheetOpen, setIsSheetOpen] = useState(true);

  // Auto-open sheet on mount
  useEffect(() => {
    if (id) {
      setIsSheetOpen(true);
    }
  }, [id]);

  // Handle sheet close - navigate back to projects
  const handleSheetClose = (open: boolean) => {
    setIsSheetOpen(open);
    if (!open) {
      router.push("/dashboard/projects");
    }
  };

  const handleConfirmDelete = async () => {
    if (id) {
      setIsDeleting(true);
      try {
        const response = await authFetch(`/api/projects/${id}`, {
          method: "DELETE",
        });

        if (response.ok) {
          toast({
            title: "Video project deleted",
            description: "The video project has been permanently removed.",
          });
          setIsSheetOpen(false);
          router.push("/dashboard/projects");
        } else {
          toast({
            title: "Error",
            description: "Failed to delete the video project. Please try again.",
            variant: "destructive",
          });
        }
      } catch {
        toast({
          title: "Error",
          description: "Failed to delete the video project. Please try again.",
          variant: "destructive",
        });
      } finally {
        setIsDeleting(false);
        setDeleteDialogOpen(false);
      }
    }
  };

  if (!id) {
    return null;
  }

  return (
    <>
      <VideoProjectSheet
        open={isSheetOpen}
        onOpenChange={handleSheetClose}
        projectId={id}
        mode="edit"
        onSuccess={() => {
          router.push("/dashboard/projects");
        }}
      />

      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the
              video project and remove it from our servers.
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
    </>
  );
};

export default EditVideoProject;
