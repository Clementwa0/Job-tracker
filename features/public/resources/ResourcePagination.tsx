import { ChevronLeft, ChevronRight } from "lucide-react";

import { Button } from "@/components/ui/button";
import { visiblePageNumbers } from "@/features/admin/hooks/useAdminPagination";

export default function ResourcePagination({
  page,
  totalPages,
  onPageChange,
  disabled,
}: {
  page: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  disabled?: boolean;
}) {
  if (totalPages <= 1) return null;
  return (
    <nav className="mt-8 flex items-center justify-center gap-1" aria-label="Pagination">
      <Button variant="outline" size="sm" disabled={page <= 1 || disabled} onClick={() => onPageChange(page - 1)} aria-label="Previous page">
        <ChevronLeft />
        <span className="hidden sm:inline">Previous</span>
      </Button>
      {visiblePageNumbers(page, totalPages).map((p) => (
        <Button
          key={p}
          variant={p === page ? "default" : "outline"}
          size="sm"
          className="min-w-8 px-2"
          disabled={disabled}
          onClick={() => onPageChange(p)}
          aria-label={`Page ${p}`}
          aria-current={p === page ? "page" : undefined}
        >
          {p}
        </Button>
      ))}
      <Button variant="outline" size="sm" disabled={page >= totalPages || disabled} onClick={() => onPageChange(page + 1)} aria-label="Next page">
        <span className="hidden sm:inline">Next</span>
        <ChevronRight />
      </Button>
    </nav>
  );
}
