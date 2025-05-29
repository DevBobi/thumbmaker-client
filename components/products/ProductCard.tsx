import React from "react";
import Link from "next/link";
import Image from "next/image";
import { getDaysAgo } from "@/lib/utils";
import { Project } from "@/types";

interface ProductCardProps {
  project: Project;
}

const ProductCard = ({ project }: ProductCardProps) => {
  return (
    <Link
      key={project.id}
      href={`/dashboard/edit-product/${project.id}`}
      className="group"
    >
      <div
        className={`relative border border-border rounded-md overflow-hidden cursor-pointer group transition-all hover:shadow-md `}
      >
        <div className="aspect-video relative bg-accent/10">
          {project.image ? (
            <Image
              src={project.image}
              alt={project.title}
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
              {project.title}
            </h3>
          </div>

          <p className="text-muted-foreground text-sm line-clamp-2 mb-4">
            {project.description}
          </p>

          <div className="flex items-center text-xs text-muted-foreground">
            <span>
              {project.createdAt ? getDaysAgo(project.createdAt) : "No date"}
            </span>
          </div>
        </div>
      </div>
    </Link>
  );
};

export default ProductCard;
