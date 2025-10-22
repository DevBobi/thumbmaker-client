import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Product } from "@/contexts/ProductContext";
import { useAuthFetch } from "@/hooks/use-auth-fetch";
import { useDebounce } from "@/hooks/use-debounce";
import { useQuery } from "@tanstack/react-query";
import { Loader2, Search } from "lucide-react";
import React, { useState } from "react";

interface ProductSelectorProps {
  onSelectProduct: (product: Product) => void;
  selectedProduct: Product | null;
}

const ProductSelector: React.FC<ProductSelectorProps> = ({
  onSelectProduct,
  selectedProduct,
}) => {
  const { authFetch } = useAuthFetch();
  const [searchTerm, setSearchTerm] = useState("");
  const debouncedSearchTerm = useDebounce(searchTerm, 300);
  const [tempSelectedProduct, setTempSelectedProduct] =
    useState<Product | null>(selectedProduct);
  const [isOpen, setIsOpen] = useState(false);

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
  };

  // Search products API query
  const {
    data: searchResults,
    isLoading,
    error,
  } = useQuery({
    queryKey: ["productSearch", debouncedSearchTerm],
    queryFn: async () => {
      if (!debouncedSearchTerm.trim()) {
        // Return recent products when no search term is provided
        const response = await authFetch("/api/projects/recent?take=3");
        if (!response.ok) {
          throw new Error("Failed to fetch recent products");
        }
        return response.json();
      }

      const response = await authFetch(
        `/api/projects/search?query=${encodeURIComponent(
          debouncedSearchTerm
        )}&take=3`
      );
      if (!response.ok) {
        throw new Error("Failed to search products");
      }
      return response.json();
    },
    enabled: isOpen, // Only run query when dialog is open
  });

  // Display products based on search results
  const displayProducts = searchResults || [];

  const handleSelect = (product: Product) => {
    setTempSelectedProduct(product);
  };

  const handleConfirm = () => {
    if (tempSelectedProduct) {
      onSelectProduct(tempSelectedProduct);
    }
    setIsOpen(false);
  };

  const handleOpenChange = (open: boolean) => {
    setIsOpen(open);
    if (open) {
      setTempSelectedProduct(selectedProduct);
      setSearchTerm(""); // Reset search when opening
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>
        <Button
          variant="outline"
          className="w-full justify-start text-left font-normal"
        >
          {selectedProduct ? selectedProduct.name : "Select a Product"}
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[600px] max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Select a Product</DialogTitle>
        </DialogHeader>

        <div className="relative">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search products..."
            value={searchTerm}
            onChange={handleSearch}
            className="pl-8"
          />
        </div>

        <div className="grid gap-2 max-h-[400px] overflow-y-auto">
          {isLoading ? (
            <div className="flex justify-center items-center p-4">
              <Loader2 className="h-6 w-6 animate-spin text-primary" />
              <span className="ml-2">Searching products...</span>
            </div>
          ) : error ? (
            <div className="text-center p-4 text-destructive">
              Error loading products. Please try again.
            </div>
          ) : displayProducts.length > 0 ? (
            displayProducts.map((product: Product) => (
              <div
                key={product.id}
                className={`p-3 border rounded-md cursor-pointer hover:bg-accent transition-colors ${
                  tempSelectedProduct?.id === product.id
                    ? "bg-accent/80 border-primary"
                    : ""
                }`}
                onClick={() => handleSelect(product)}
              >
                <div className="font-medium">{product.name}</div>
                <div className="text-sm text-muted-foreground line-clamp-1">
                  {product.overview}
                </div>
              </div>
            ))
          ) : (
            <div className="text-center p-4 text-muted-foreground">
              No products found. Please create a product first.
            </div>
          )}
        </div>

        <DialogFooter>
          <DialogClose asChild>
            <Button variant="outline">Cancel</Button>
          </DialogClose>
          <Button onClick={handleConfirm} disabled={!tempSelectedProduct}>
            Select
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default ProductSelector;
