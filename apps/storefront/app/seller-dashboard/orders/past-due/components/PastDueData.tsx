"use client";

import { useEffect, useState } from "react";
import AllOrdersTable from "@/app/seller-dashboard/orders/components/AllOrdersTable";
import { Order } from "@/types/sellerDashboard/Orders";
import { getPastDueOrders } from "./Action";


export default function PastDueData() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);

  useEffect(() => {
    const fetchOrders = async () => {
      setIsLoading(true);
      setError(null);
      try {
        // Using the specific past-due endpoint action
        const result = await getPastDueOrders(page, 20, 30);
        
        setOrders(result.orders);
        setTotal(result.total);
        setTotalPages(result.totalPages || 1);
      } catch (err) {
        setError("Failed to load past due orders.");
      } finally {
        setIsLoading(false);
      }
    };
    fetchOrders();
  }, [page]);

  if (isLoading)
    return (
      <div className="flex items-center justify-center h-48 text-muted-foreground text-sm">
        <div className="animate-pulse">Loading past due orders...</div>
      </div>
    );

  if (error)
    return (
      <div className="flex items-center justify-center h-48 text-destructive text-sm">
        {error}
      </div>
    );

  return (
    <div className="space-y-4">
      {/* Dynamic title using the total count from the new API */}
      <AllOrdersTable orders={orders} title={`Past Due Orders (${total})`} />

      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-2 mt-6">
          <button
            className="px-4 py-2 text-sm font-medium border rounded-md hover:bg-muted disabled:opacity-40 transition-colors"
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            disabled={page === 1}
          >
            Previous
          </button>
          <span className="text-sm font-medium">
            Page {page} of {totalPages}
          </span>
          <button
            className="px-4 py-2 text-sm font-medium border rounded-md hover:bg-muted disabled:opacity-40 transition-colors"
            onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
            disabled={page === totalPages}
          >
            Next
          </button>
        </div>
      )}
    </div>
  );
}