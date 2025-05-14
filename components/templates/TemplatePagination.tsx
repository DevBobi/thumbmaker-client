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

          {Array.from({ length: pagination.pages }, (_, i) => i + 1)
            .filter((p) => {
              // Show first page, last page, current page, and pages around current
              return (
                p === 1 ||
                p === pagination.pages ||
                (p >= pagination.page - 1 && p <= pagination.page + 1)
              );
            })
            .map((p, i, arr) => {
              // If there's a gap in the sequence, show ellipsis
              const showEllipsisBefore = i > 0 && p > arr[i - 1] + 1;
              const showEllipsisAfter =
                i < arr.length - 1 && p < arr[i + 1] - 1;

              return (
                <React.Fragment key={p}>
                  {showEllipsisBefore && (
                    <PaginationItem>
                      <PaginationEllipsis />
                    </PaginationItem>
                  )}

                  <PaginationItem>
                    <PaginationLink
                      isActive={pagination.page === p}
                      onClick={() => onPageChange(p)}
                    >
                      {p}
                    </PaginationLink>
                  </PaginationItem>

                  {showEllipsisAfter && (
                    <PaginationItem>
                      <PaginationEllipsis />
                    </PaginationItem>
                  )}
                </React.Fragment>
              );
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
