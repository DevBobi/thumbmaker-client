import React from "react";
import {
  Pagination,
  PaginationItem,
  PaginationContent,
  PaginationLink,
  PaginationPrevious,
  PaginationEllipsis,
  PaginationNext,
} from "../ui/pagination";

export const TemplatePagination = ({
  pagination,
  onPageChange,
  isLoadingMore,
}: {
  pagination: { total: number; page: number; limit: number; pages: number };
  onPageChange: (page: number) => void;
  isLoadingMore: boolean;
}) => {
  if (pagination.pages <= 1) return null;

  return (
    <div className="mt-8">
      <Pagination>
        <PaginationContent>
          <PaginationItem>
            <PaginationPrevious
              onClick={() => onPageChange(pagination.page - 1)}
              className={
                pagination.page <= 1 ? "pointer-events-none opacity-50" : ""
              }
            />
          </PaginationItem>

          {[...Array(pagination.pages)].map((_, index) => {
            const page = index + 1;

            // Show first page, last page, and pages around current page
            if (
              page === 1 ||
              page === pagination.pages ||
              (page >= pagination.page - 1 && page <= pagination.page + 1)
            ) {
              return (
                <PaginationItem key={page}>
                  <PaginationLink
                    onClick={() => onPageChange(page)}
                    isActive={pagination.page === page}
                    className="cursor-pointer"
                  >
                    {page}
                  </PaginationLink>
                </PaginationItem>
              );
            }

            // Show ellipsis for gaps
            if (page === 2 || page === pagination.pages - 1) {
              return (
                <PaginationItem key={page}>
                  <PaginationEllipsis />
                </PaginationItem>
              );
            }

            return null;
          })}

          <PaginationItem>
            <PaginationNext
              onClick={() => onPageChange(pagination.page + 1)}
              className={
                pagination.page >= pagination.pages
                  ? "pointer-events-none opacity-50"
                  : ""
              }
            />
          </PaginationItem>
        </PaginationContent>
      </Pagination>

      {isLoadingMore && (
        <div className="flex justify-center mt-4">
          <div className="flex items-center gap-2">
            <div className="h-5 w-5 animate-spin rounded-full border-2 border-brand-500 border-t-transparent"></div>
            <span>Loading...</span>
          </div>
        </div>
      )}
    </div>
  );
};
