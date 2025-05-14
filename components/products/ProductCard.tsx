import React from "react";
import Link from "next/link";
import Image from "next/image";
import { Product } from "@/contexts/ProductContext";
import { getDaysAgo } from "@/lib/utils";

interface ProductCardProps {
  product: Product;
}

const ProductCard = ({ product }: ProductCardProps) => {
  return (
    <Link
      key={product.id}
      href={`/dashboard/edit-product/${product.id}`}
      className="group"
    >
      <div
        className={`relative border border-border rounded-md overflow-hidden cursor-pointer group transition-all hover:shadow-md `}
      >
        <div className="aspect-video relative bg-accent/10">
          {product.image ? (
            <Image
              src={product.image}
              alt={product.name}
              fill
              className="object-contain p-4"
            />
          ) : (
            <div className="flex items-center justify-center h-full">
              <span className="text-muted-foreground">No logo</span>
            </div>
          )}
        </div>
        <div className="p-5">
          <div className="flex justify-between items-start mb-2">
            <h3 className="font-semibold text-lg text-foreground group-hover:text-brand-600 transition-colors duration-200">
              {product.name}
            </h3>
          </div>

          <p className="text-muted-foreground text-sm line-clamp-2 mb-4">
            {product.overview}
          </p>

          <div className="flex items-center text-xs text-muted-foreground">
            <span>
              {product.createdAt ? getDaysAgo(product.createdAt) : "No date"}
            </span>
          </div>
        </div>
      </div>
    </Link>
  );
};

export default ProductCard;
