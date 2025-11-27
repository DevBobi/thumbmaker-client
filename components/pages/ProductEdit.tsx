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
import { ProductSheet } from "@/components/products/ProductSheet";

const ProductEdit = () => {
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

  // Handle sheet close - navigate back to products
  const handleSheetClose = (open: boolean) => {
    setIsSheetOpen(open);
    if (!open) {
      router.push("/dashboard/products");
    }
  };

  const handleConfirmDelete = async () => {
    if (id) {
      setIsDeleting(true);
      try {
        const response = await authFetch(`/projects/${id}`, {
          method: "DELETE",
        });

        if (response.ok) {
          toast({
            title: "Product deleted",
            description: "The product has been permanently removed.",
          });
          setIsSheetOpen(false);
          router.push("/dashboard/products");
        } else {
          toast({
            title: "Error",
            description: "Failed to delete the product. Please try again.",
            variant: "destructive",
          });
        }
      } catch {
        toast({
          title: "Error",
          description: "Failed to delete the product. Please try again.",
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
      <ProductSheet
        open={isSheetOpen}
        onOpenChange={handleSheetClose}
        productId={id}
        mode="edit"
        onSuccess={() => {
          router.push("/dashboard/products");
        }}
      />

      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the
              product and remove it from our servers.
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

export default ProductEdit;
