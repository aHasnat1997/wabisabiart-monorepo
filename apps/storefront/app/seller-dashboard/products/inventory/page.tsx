

import StatsCards from "./components/StatsCards";
import { getAllProductsForStats,  getProductsInventory } from "../components/Action";
import { Product } from "@/types/sellerDashboard/Products";
import TableData from "./components/TableData";
import { TableSkeleton } from "../components/ListingTable";
import { Suspense } from "react";




interface InventoryProps {
  searchParams: Promise<{ page?: string }>;
  
}

const Inventory = async ({ searchParams }: InventoryProps & { products: Product[] }) => {
  const params = await searchParams;
  const currentPage = Math.max(1, Number(params.page ?? "1"));

  const [{ products, total }, allProducts] = await Promise.all([
    getProductsInventory(currentPage),
    getAllProductsForStats(),
  ]);

  const totalPages = Math.ceil(total /  10);

  // ── Calculate stats from all products ──
  const totalStock = allProducts.reduce((s, p) => s + (p.totalQuantity ?? 0), 0);
  const totalSold = allProducts.reduce((s, p) => s + (p.salesCount ?? 0), 0);

  let lowStockCount = 0;
  let outOfStockCount = 0;

  allProducts.forEach((p) => {
    p.variants?.forEach((v) => {
      if (v.quantity === 0) outOfStockCount++;
      else if (v.quantity <= (p.lowStockThreshold ?? 0)) lowStockCount++;
    });
  });

  return (
    <div className="md:p-6 p-4 space-y-6">
      {/* Page Header */}
      <div>
        <h2 className="text-xl font-semibold">Inventory Management</h2>
        <p className="text-sm text-muted-foreground mt-0.5">
          Manage stock levels across all product variants and sizes
        </p>
      </div>

      {/* Stats Cards */}
      <StatsCards
        totalStock={totalStock}
        totalSold={totalSold}
        lowStockCount={lowStockCount}
        outOfStockCount={outOfStockCount}
      />

      {/* Stock Table with pagination */}
      <Suspense  fallback={<TableSkeleton />}>
        <TableData  
        products={products}
        currentPage={currentPage}
        totalPages={totalPages}
        totalProducts={total}
      />
      </Suspense>
    </div>
  );
};

export default Inventory;