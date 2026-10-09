"use client";

import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";

interface CommonPaginationProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
}

export function CommonPagination({
  currentPage,
  totalPages,
  onPageChange,
}: CommonPaginationProps) {
  return (
    <Pagination>
      <PaginationContent className="gap-2">
        <PaginationItem>
          <PaginationPrevious
            onClick={() => onPageChange(currentPage - 1)}
            className={
              currentPage === 1
                ? "pointer-events-none opacity-50 bg-muted rounded-lg"
                : "cursor-pointer bg-muted hover:bg-primary rounded-lg"
            }
          />
        </PaginationItem>

        {/* Show first page if not showing */}
        {currentPage > 2 && (
          <>
            <PaginationItem>
              <PaginationLink
                onClick={() => onPageChange(1)}
                className="cursor-pointer rounded-lg border border-border hover:border-2 hover:border-primary hover:bg-primary hover:text-primary-foreground"
              >
                1
              </PaginationLink>
            </PaginationItem>
            {currentPage > 3 && (
              <PaginationItem>
                <PaginationEllipsis className="rounded-lg border border-border" />
              </PaginationItem>
            )}
          </>
        )}

        {/* Previous page if not first */}
        {currentPage > 1 && (
          <PaginationItem>
            <PaginationLink
              onClick={() => onPageChange(currentPage - 1)}
              className="cursor-pointer rounded-lg border border-border hover:border-2 hover:border-primary hover:bg-primary hover:text-primary-foreground"
            >
              {currentPage - 1}
            </PaginationLink>
          </PaginationItem>
        )}

        {/* Current page */}
        <PaginationItem>
          <PaginationLink
            isActive
            className="cursor-pointer rounded-lg border-2 border-primary bg-primary text-primary-foreground"
          >
            {currentPage}
          </PaginationLink>
        </PaginationItem>

        {/* Next page if not last */}
        {currentPage < totalPages && (
          <PaginationItem>
            <PaginationLink
              onClick={() => onPageChange(currentPage + 1)}
              className="cursor-pointer rounded-lg border border-border hover:border-2 hover:border-primary hover:bg-primary hover:text-primary-foreground"
            >
              {currentPage + 1}
            </PaginationLink>
          </PaginationItem>
        )}

        {/* Show last page if not showing */}
        {currentPage < totalPages - 1 && (
          <>
            {currentPage < totalPages - 2 && (
              <PaginationItem>
                <PaginationEllipsis className="rounded-lg border border-border" />
              </PaginationItem>
            )}
            <PaginationItem>
              <PaginationLink
                onClick={() => onPageChange(totalPages)}
                className="cursor-pointer rounded-lg border border-border hover:border-2 hover:border-primary hover:bg-primary hover:text-primary-foreground"
              >
                {totalPages}
              </PaginationLink>
            </PaginationItem>
          </>
        )}

        <PaginationItem>
          <PaginationNext
            onClick={() => onPageChange(currentPage + 1)}
            className={
              currentPage === totalPages
                ? "pointer-events-none opacity-50 bg-muted rounded-lg"
                : "cursor-pointer bg-muted hover:bg-primary rounded-lg"
            }
          />
        </PaginationItem>
      </PaginationContent>
    </Pagination>
  );
}
