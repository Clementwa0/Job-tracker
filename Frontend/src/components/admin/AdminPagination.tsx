import { ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { PaginatedMeta } from "@/types/admin";
import {
  PAGE_SIZES,
  pageRangeLabel,
  visiblePageNumbers,
  type PageSize,
} from "@/hooks/useAdminPagination";
import { cn } from "@/lib/utils";

interface AdminPaginationProps {
  meta: PaginatedMeta;
  page: number;
  limit: PageSize;
  onPageChange: (page: number) => void;
  onLimitChange: (limit: PageSize) => void;
  loading?: boolean;
  className?: string;
}

export default function AdminPagination({
  meta,
  page,
  limit,
  onPageChange,
  onLimitChange,
  loading,
  className,
}: AdminPaginationProps) {
  const { total, totalPages } = meta;
  if (total === 0) return null;

  const pages = visiblePageNumbers(page, totalPages);

  return (
    <nav
      className={cn(
        "flex flex-col gap-3 border-t border-border pt-4 sm:flex-row sm:items-center sm:justify-between",
        className,
      )}
      aria-label="Pagination"
    >
      <p className="text-sm text-muted-foreground">{pageRangeLabel(page, limit, total)}</p>

      <div className="flex flex-wrap items-center gap-3">
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <span className="hidden sm:inline">Per page</span>
          <Select
            value={String(limit)}
            onValueChange={(v) => onLimitChange(Number(v) as PageSize)}
            disabled={loading}
          >
            <SelectTrigger className="h-8 w-[72px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {PAGE_SIZES.map((size) => (
                <SelectItem key={size} value={String(size)}>
                  {size}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="flex items-center gap-1">
          <Button
            variant="outline"
            size="sm"
            disabled={page <= 1 || loading}
            onClick={() => onPageChange(page - 1)}
            aria-label="Previous page"
          >
            <ChevronLeft className="h-4 w-4" />
            <span className="hidden sm:inline">Previous</span>
          </Button>

          {pages.map((p) => (
            <Button
              key={p}
              variant={p === page ? "default" : "outline"}
              size="sm"
              className="min-w-9 px-2"
              disabled={loading}
              onClick={() => onPageChange(p)}
              aria-label={`Page ${p}`}
              aria-current={p === page ? "page" : undefined}
            >
              {p}
            </Button>
          ))}

          <Button
            variant="outline"
            size="sm"
            disabled={page >= totalPages || loading}
            onClick={() => onPageChange(page + 1)}
            aria-label="Next page"
          >
            <span className="hidden sm:inline">Next</span>
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </nav>
  );
}
