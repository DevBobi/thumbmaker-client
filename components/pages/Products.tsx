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
  CalendarDays,
  ArrowUpDown,
  Loader2,
  ImageIcon,
  Sparkles,
} from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import { useAuthFetch } from "@/hooks/use-auth-fetch";
import { getDaysAgo } from "@/lib/utils";
import Breadcrumb from "@/components/Breadcrumb";
import { ProductSheet } from "@/components/products/ProductSheet";

// Define the Product type matching API response
interface Product {
  id: string;
  title: string;
  image?: string;
  description: string;
  highlights: string[];
  targetAudience: string;
  createdAt: string;
  updatedAt: string;
  userId: string;
}

const Products = () => {
  // Use React Query to fetch products
  const { authFetch } = useAuthFetch();
  const [searchTerm, setSearchTerm] = useState("");
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [sortBy, setSortBy] = useState<"name" | "date">("date");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc");
  const [isSheetOpen, setIsSheetOpen] = useState(false);

  // Function to fetch products from the API
  const fetchProducts = async (): Promise<Product[]> => {
    const response = await authFetch("/projects");
    if (!response.ok) {
      throw new Error("Failed to fetch products");
    }
    return response.json();
  };
  const {
    data: products = [],
    isLoading,
    isError,
  } = useQuery({
    queryKey: ["products"],
    queryFn: fetchProducts,
  });

  // Filter products based on search term
  const filteredProducts = products.filter(
    (product) =>
      product.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      product.description?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Sort products
  const sortedProducts = [...filteredProducts].sort((a, b) => {
    if (sortBy === "name") {
      return sortOrder === "asc"
        ? (a.title || "").localeCompare(b.title || "")
        : (b.title || "").localeCompare(a.title || "");
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
          <p className="text-muted-foreground">Loading products...</p>
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
            <h3 className="font-medium text-lg">Error loading products</h3>
            <p className="text-muted-foreground">
              There was a problem loading your products. Please try again later.
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
          { label: "Products", href: "/dashboard/products" },
        ]}
      />
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold">All Products</h1>
          <p className="text-muted-foreground mt-1">
            Manage your products and create thumbnails for them
          </p>
        </div>
        <Button
          variant="brand"
          size="lg"
          className="gap-2 shadow-sm"
          onClick={() => setIsSheetOpen(true)}
        >
          <Plus className="h-4 w-4" />
          Add Product
        </Button>
      </div>

      <div className="flex flex-col sm:flex-row gap-4 mb-6">
        <div className="relative flex-1">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search products..."
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

      {sortedProducts.length === 0 ? (
        <div className="text-center py-12 border-2 border-dashed rounded-lg">
          <div className="flex flex-col items-center gap-4 max-w-md mx-auto">
            <div className="relative">
              <div className="bg-muted rounded-full p-4">
                <Search className="h-8 w-8 text-muted-foreground" />
              </div>
              {!searchTerm && (
                <div className="absolute -top-1 -right-1 w-6 h-6 bg-primary rounded-full flex items-center justify-center">
                  <Sparkles className="h-3.5 w-3.5 text-primary-foreground" />
                </div>
              )}
            </div>
            <div>
              <h3 className="font-semibold text-lg mb-2">
                {searchTerm ? "No products found" : "No products yet"}
              </h3>
              <p className="text-muted-foreground text-sm mb-4">
                {searchTerm
                  ? `No products match "${searchTerm}". Try a different search term.`
                  : "Create your first product to start generating thumbnails."}
              </p>
            </div>
            {searchTerm ? (
              <Button
                variant="outline"
                onClick={() => setSearchTerm("")}
              >
                Clear search
              </Button>
            ) : (
              <Button 
                className="gap-2"
                size="lg"
                onClick={() => setIsSheetOpen(true)}
              >
                <Plus className="h-4 w-4" />
                Create Your First Product
              </Button>
            )}
          </div>
        </div>
      ) : viewMode === "grid" ? (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {sortedProducts.map((product) => (
            <Link
              key={product.id}
              href={`/dashboard/edit-product/${product.id}`}
              className="group block"
            >
              <div className="border rounded-lg overflow-hidden transition-all hover:shadow-lg hover:border-primary/50 bg-card">
                <div className="aspect-video relative bg-gradient-to-br from-muted/30 to-muted/10">
                  {product.image ? (
                    <Image
                      src={product.image}
                      alt={product.title}
                      fill
                      className="object-contain p-6 group-hover:scale-105 transition-transform duration-300"
                    />
                  ) : (
                    <div className="flex items-center justify-center h-full">
                      <div className="text-center">
                        <div className="w-16 h-16 mx-auto mb-2 bg-muted rounded-lg flex items-center justify-center">
                          <ImageIcon className="h-8 w-8 text-muted-foreground" />
                        </div>
                        <span className="text-xs text-muted-foreground">No image</span>
                      </div>
                    </div>
                  )}
                </div>
                <div className="p-4">
                  <h3 className="font-semibold text-base mb-2 line-clamp-1 group-hover:text-primary transition-colors">
                    {product.title}
                  </h3>
                  <p className="text-muted-foreground text-sm line-clamp-2 mb-3 leading-relaxed">
                    {product.description}
                  </p>
                  <div className="flex items-center justify-between pt-2 border-t">
                    <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                      <CalendarDays className="h-3.5 w-3.5" />
                      <span suppressHydrationWarning>
                        {product.createdAt ? getDaysAgo(product.createdAt) : "No date"}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </Link>
          ))}
        </div>
      ) : (
        <div className="flex flex-col gap-3">
          {sortedProducts.map((product) => (
            <Link
              key={product.id}
              href={`/dashboard/edit-product/${product.id}`}
              className="group block"
            >
              <div className="border rounded-lg overflow-hidden transition-all hover:shadow-md hover:bg-accent/5 p-4 bg-card">
                <div className="flex gap-4 flex-wrap sm:flex-nowrap">
                  <div className="h-20 w-20 bg-gradient-to-br from-muted/30 to-muted/10 rounded-lg flex-shrink-0 relative">
                    {product.image ? (
                      <Image
                        src={product.image}
                        alt={product.title}
                        fill
                        className="object-contain p-2 group-hover:scale-105 transition-transform duration-300"
                      />
                    ) : (
                      <div className="flex items-center justify-center h-full">
                        <ImageIcon className="h-8 w-8 text-muted-foreground" />
                      </div>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-base group-hover:text-primary transition-colors">
                      {product.title}
                    </h3>
                    <p className="text-muted-foreground text-sm line-clamp-2 mt-1 leading-relaxed">
                      {product.description}
                    </p>
                    <div className="flex items-center gap-1.5 text-xs text-muted-foreground mt-2">
                      <CalendarDays className="h-3.5 w-3.5" />
                      <span suppressHydrationWarning>
                        {product.createdAt
                          ? getDaysAgo(product.createdAt)
                          : "No date"}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}

      {/* Product Sheet */}
      <ProductSheet
        open={isSheetOpen}
        onOpenChange={setIsSheetOpen}
        mode="create"
        onSuccess={() => {
          // Refetch products after successful creation
          window.location.reload();
        }}
      />
    </div>
  );
};

export default Products;
