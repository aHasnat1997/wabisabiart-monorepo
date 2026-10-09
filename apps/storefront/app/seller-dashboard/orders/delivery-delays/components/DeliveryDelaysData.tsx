// "use client"

// import AllOrdersTable, { orders } from "../../components/AllOrdersTable";




// const DeliveryDelaysData = () =>  {
//     // const { data: orders = [], isLoading, isError } = useGetOrdersQuery();
//   const pendingOrders = orders.filter(
//     (order) => order.status === "Delivery Delay"
//   );

//   return (
//     <AllOrdersTable
//       orders={pendingOrders}
//       title="Delivery Delays Orders"
//     />
//   );
// }

// export default DeliveryDelaysData;



"use client";

import { useEffect, useState } from "react";
import AllOrdersTable from "../../components/AllOrdersTable";

import { Order } from "@/types/sellerDashboard/Orders";
import { getAllOrders } from "../../components/OrderAction";

const DeliveryDelaysData = () => {
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
        const result = await getAllOrders(page, 10, "delivery_delay");
        setOrders(result.orders);
        setTotal(result.total);
        setTotalPages(result.totalPages);
      } catch {
        setError("Failed to load delivery delay orders.");
      } finally {
        setIsLoading(false);
      }
    };

    fetchOrders();
  }, [page]);

  if (isLoading)
    return (
      <div className="flex items-center justify-center h-48 text-muted-foreground text-sm">
        Loading...
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
      <AllOrdersTable orders={orders} title={`Delivery Delays (${total})`} />

      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-2">
          <button
            className="px-3 py-1 text-sm border rounded disabled:opacity-40"
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            disabled={page === 1}
          >
            Previous
          </button>
          <span className="text-sm text-muted-foreground">
            Page {page} of {totalPages}
          </span>
          <button
            className="px-3 py-1 text-sm border rounded disabled:opacity-40"
            onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
            disabled={page === totalPages}
          >
            Next
          </button>
        </div>
      )}
    </div>
  );
};

export default DeliveryDelaysData;