import { Suspense } from "react";
import ListingTableClient from "./ListingTableClient";
import { getProductsMyListing } from "./Action";




// Skeleton loader
export function TableSkeleton() {
  return (
    <div className="w-full animate-pulse">
      <div className="h-10 bg-muted rounded mb-4 w-full" />
      {[...Array(5)].map((_, i) => (
        <div key={i} className="h-12 bg-muted/70 rounded mb-2 w-full" />
      ))}
    </div>
  );
}

// Inner async component
async function ListingTableContent({
  currentPage,
  status,
}: {
  currentPage: number;
  status: string;
}) {
  const { products, total, totalPages } = await getProductsMyListing(currentPage, 10, status);

  return (
    <ListingTableClient
      products={products}
      total={total}
      totalPages={totalPages}
      currentPage={currentPage}
    />
  );
}

export default async function ListingTable({
  searchParams,
}: {
  searchParams?: Promise<{ page?: string; status?: string }> | { page?: string; status?: string };
}) {
  const resolvedParams = await Promise.resolve(searchParams);
  const currentPage = Number(resolvedParams?.page) || 1;
  const status = resolvedParams?.status ?? "";

  return (
    <Suspense fallback={<TableSkeleton />}>
      <ListingTableContent currentPage={currentPage} status={status} />
    </Suspense>
  );
}