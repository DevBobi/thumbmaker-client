"use client";
import React, { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Save, Trash } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import ProductEditForm from "@/components/products/ProductEditForm";
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
import { uploadToStorage } from "@/actions/upload";

const ProductEdit = () => {
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
    id: "",
    name: "",
    overview: "",
    features: "",
    uvp: "",
    targetAudience: "",
    logo: null as string | null,
  });

  const [logo, setLogo] = useState<File | null>(null);
  const [logoPreview, setLogoPreview] = useState<string | null>(null);

  useEffect(() => {
    const fetchProduct = async () => {
      if (id) {
        try {
          setIsLoading(true);
          const response = await authFetch(`/api/products/${id}`);

          if (response.status === 404) {
            toast({
              title: "Product not found",
              description: "This product might have been deleted.",
              variant: "destructive",
            });
            router.push("/");
            return;
          }

          if (!response.ok) {
            throw new Error("Failed to fetch product");
          }

          const product = await response.json();

          if (product) {
            setFormData({
              id: product.id,
              name: product.name,
              overview: product.overview,
              features: product.features,
              uvp: product.uvp,
              targetAudience: product.targetAudience,
              logo: product.image || null,
            });
            setLogoPreview(product.image || null);
          } else {
            toast({
              title: "Product not found",
              description: "This product might have been deleted.",
              variant: "destructive",
            });
            router.push("/");
          }
        } catch (error) {
          console.error("Error fetching product:", error);
          toast({
            title: "Error",
            description: "Failed to load product details",
            variant: "destructive",
          });
          router.push("/");
        } finally {
          setIsLoading(false);
        }
      }
    };

    if (id) {
      fetchProduct();
    } else {
      setIsLoading(false);
    }
  }, [id]);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    try {
      let logoUrl: string | null = formData.logo;

      // If there's a new logo file, upload it first
      if (logo) {
        const formData = new FormData();
        formData.append("file", logo);

        const uploadResult = await uploadToStorage(formData);

        if (!uploadResult.success || !uploadResult.fileUrl) {
          throw new Error(uploadResult.error || "Failed to upload logo");
        }

        logoUrl = uploadResult.fileUrl;
      }

      // Update the form data with the new logo URL
      const updatedFormData = {
        ...formData,
        logo: logoUrl,
      };

      const response = await authFetch(`/api/products/${id}`, {
        method: "PUT",
        body: JSON.stringify(updatedFormData),
      });

      router.refresh();

      if (response.ok) {
        toast({
          title: "Product updated",
          description: "Your changes have been saved successfully.",
        });
      }
    } catch (error) {
      toast({
        title: "Error",
        description:
          error instanceof Error
            ? error.message
            : "Failed to save product changes. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSaving(false);
    }
  };

  const handleDeleteClick = () => {
    setDeleteDialogOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (id) {
      setIsDeleting(true);
      const response = await authFetch(`/api/products/${id}`, {
        method: "DELETE",
      });

      if (response.ok) {
        toast({
          title: "Product deleted",
          description: "The product has been permanently removed.",
        });
        router.push("/dashboard");
      } else {
        toast({
          title: "Error",
          description: "Failed to delete the product. Please try again.",
          variant: "destructive",
        });
      }
      setIsDeleting(false);
    }
    setDeleteDialogOpen(false);
  };

  // Skeleton loader component
  const ProductEditSkeleton = () => (
    <div className="space-y-6">
      <Skeleton className="h-12 w-3/4" />
      <div className="space-y-4">
        <Skeleton className="h-10 w-full" />
        <Skeleton className="h-32 w-full" />
        <Skeleton className="h-32 w-full" />
        <Skeleton className="h-10 w-full" />
        <Skeleton className="h-32 w-full" />
        <Skeleton className="h-40 w-full" />
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
          { label: "Edit Product", href: `/dashboard/edit-product/${id}` },
        ]}
      />

      <h1 className="text-3xl font-bold">Edit Product</h1>

      <Card className="rounded-md hover:shadow-md shadow-none transition-all duration-200">
        <CardHeader>
          <CardTitle>Product Details</CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <ProductEditSkeleton />
          ) : (
            <form onSubmit={handleSubmit} className="space-y-6">
              <ProductEditForm
                formData={formData}
                handleChange={handleChange}
                handleSubmit={handleSubmit}
                logo={logo}
                setLogo={setLogo}
                logoPreview={logoPreview}
                setLogoPreview={setLogoPreview}
                setFormData={setFormData}
              />

              <div className="flex justify-between pt-4">
                <Button variant="outline" className="gap-2" asChild>
                  <Link href="/dashboard">
                    <ArrowLeft className="h-4 w-4" />
                    Cancel
                  </Link>
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
            </form>
          )}
        </CardContent>
      </Card>

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
    </div>
  );
};

export default ProductEdit;
