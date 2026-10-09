
import { PaginatedMeta } from "@/types/journal";
import { getAllJournals } from "./components/action";
import { BlogCard } from "./components/BlogCard";
import { JournalPaginationWrapper } from "./components/JournalPaginationWrapper";

export const dynamic = "force-dynamic";

// ─── Skeleton (used by loading.tsx or Suspense fallback) ─────────────────────

export function BlogCardSkeleton() {
  return (
    <div className="bg-card border border-border rounded-2xl overflow-hidden animate-pulse">
      <div className="h-48 bg-muted" />
      <div className="p-4 space-y-3">
        <div className="h-2 bg-muted rounded w-1/3" />
        <div className="h-4 bg-muted rounded w-3/4" />
        <div className="h-3 bg-muted rounded w-full" />
        <div className="h-3 bg-muted rounded w-2/3" />
      </div>
    </div>
  );
}

// ─── Page ───────────────────────────────

export default async function BlogPage({
  searchParams,
}: {
  searchParams?: { page?: string };
}) {
  const currentPage = searchParams?.page ? Number(searchParams.page) : 1;
  const limit = 12;
  const journals = await getAllJournals(currentPage, limit);
const meta = journals?.meta as PaginatedMeta;
  const totalPages = meta?.totalPages || 1;
  return (
    <div className="min-h-screen">
      {/* ── Decorative Header ─────────────────────────────────────────────── */}
      <div className="relative overflow-hidden bg-card border-b border-border">
        {/* subtle grid */}
        <div
          className="absolute inset-0 opacity-[0.04]"
          style={{
            backgroundImage:
              "linear-gradient(to right, currentColor 1px, transparent 1px), linear-gradient(to bottom, currentColor 1px, transparent 1px)",
            backgroundSize: "40px 40px",
          }}
        />

        {/* glow blobs */}
        <div className="absolute -top-20 -left-20 w-80 h-80 rounded-full bg-primary/10 blur-3xl pointer-events-none" />
        <div className="absolute -bottom-20 right-0 w-64 h-64 rounded-full bg-primary/8 blur-3xl pointer-events-none" />

        <div className="relative max-w-6xl mx-auto px-4 py-14 md:py-20">
          {/* eyebrow */}
          <div className="flex items-center gap-2.5 mb-5">
            <span className="h-px w-8 bg-primary" />
            <span className="text-primary text-xs font-semibold uppercase tracking-[0.18em]">
              Our Journal
            </span>
          </div>

          {/* headline */}
          <h1 className="text-foreground text-4xl md:text-6xl font-bold tracking-tight leading-[1.1] max-w-xl">
            Stories &amp;{" "}
            <span className="relative inline-block">
              <span className="relative z-10">Insights</span>
              <svg
                className="absolute -bottom-1 left-0 w-full"
                viewBox="0 0 200 8"
                preserveAspectRatio="none"
                aria-hidden
              >
                <path
                  d="M0 6 Q50 1 100 5 Q150 9 200 4"
                  stroke="hsl(var(--primary))"
                  strokeWidth="2.5"
                  fill="none"
                  strokeLinecap="round"
                />
              </svg>
            </span>
          </h1>

          <p className="mt-5 text-muted-foreground text-base md:text-lg max-w-md leading-relaxed">
            Local news, community voices, and the stories that shape our
            neighbourhood.
          </p>
        </div>
      </div>

     {/* ── Cards & Pagination ────────────────────────────────────────────── */}
      <div className="px-4 py-10 md:py-14">
        {journals?.data?.length === 0 ? (
          <p className="text-center text-muted-foreground py-20">
            No articles yet.
          </p>
        ) : (
          <div className="flex flex-col items-center">
            {/* Grid */}
            <div className="grid w-full grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 mb-10">
              {journals?.data?.map((j) => ( 
                <BlogCard key={j.id} journal={j} />
              ))}
            </div>
            
            {/* Pagination Component (Now perfectly aligned and padded) */}
            {totalPages > 1 && (
              <JournalPaginationWrapper
                currentPage={currentPage}
                totalPages={totalPages}
              />
            )}
          </div>
        )}
      </div>
    </div>
  );
}