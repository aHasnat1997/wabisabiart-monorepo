"use client";

import { Box, Clock, DollarSign, OctagonAlert } from "lucide-react";
import StatCardList from "../../components/CardList";
import AllOrdersTable from "./AllOrdersTable";
import { useCallback, useEffect, useState } from "react";
import { Order } from "@/types/sellerDashboard/Orders";
import { getAllOrders, getOrderStats } from "./OrderAction";
import { buildOrderStats, OrdersStats } from "./OrderStatsConfig";
import { useSearchParams } from "next/navigation";
import { CommonPagination } from "@/components/commonPagination";


const iconMap: Record<string, React.ReactNode> = {
  box:    <Box className="w-4 h-4" />,
  clock:  <Clock className="w-4 h-4" />,
  alert:  <OctagonAlert className="w-4 h-4" />,
  dollar: <DollarSign className="w-4 h-4" />,
};

const AllOrders = () => {
  const [orders, setOrders]       = useState<Order[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError]         = useState<string | null>(null);
  const [page, setPage]           = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal]         = useState(0);

  // Updated state to match your API response keys
  const [stats, setStats] = useState<OrdersStats>({
    totalOrders: 0,
    totalRevenue: "0",
    avgOrderValue: "0",
    revenueGrowth: "0%",
    ordersGrowth: "0%",
  });

  const searchParams = useSearchParams();
  const actionModal  = searchParams.get("action-modal");

  const fetchOrders = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const result = await getAllOrders(page, 10, "");
      setOrders(result.orders);
      setTotal(result.total);
      setTotalPages(result.totalPages);
    } catch {
      setError("Failed to load orders.");
    } finally {
      setIsLoading(false);
    }
  }, [page]);

  const fetchStats = useCallback(async () => {
    try {
      const s = await getOrderStats();
      setStats(s);
    } catch (e) {
      console.error("Stats fetch error:", e);
    }
  }, []);

  useEffect(() => {
    fetchOrders();
  }, [fetchOrders]);

  useEffect(() => {
    fetchStats();
  }, [fetchStats]);

  // Refetch data when a modal is closed (actionModal becomes null)
  useEffect(() => {
    if (actionModal === null) {
      fetchOrders();
      fetchStats();
    }
  }, [actionModal, fetchOrders, fetchStats]);

  // Build stats using the config
  const ordersStats = buildOrderStats(stats).map((s) => ({
    ...s,
    icon: iconMap[s.iconName] || iconMap.box, // Fallback icon
  }));

  const handlePageChange = (newPage: number) => {
    setPage(newPage);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Reusable Stat Section to avoid code duplication in Loading/Error states
  const RenderStats = () => (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 mb-6 gap-4 w-full">
      {ordersStats.map((stat) => (
        <StatCardList
          key={stat.id}
          ctitle={stat.ctitle}
          value={stat.value}
          icon={stat.icon}
          color={stat.color}
          textColor={stat.textColor}
          status={stat.status}
          badge={stat.badge} // Make sure your config includes growth badges
        />
      ))}
    </div>
  );

  return (
    <div className="space-y-6">
      <RenderStats />

      {isLoading ? (
        <div className="flex items-center justify-center h-48 text-muted-foreground text-sm">
          Loading orders...
        </div>
      ) : error ? (
        <div className="flex items-center justify-center h-48 text-destructive text-sm">
          {error}
        </div>
      ) : (
        <>
          <AllOrdersTable orders={orders} title={`All Orders (${total})`} />
          
          {totalPages > 1 && (
            <div className="mt-6">
              <CommonPagination
                currentPage={page}
                totalPages={totalPages}
                onPageChange={handlePageChange}
              />
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default AllOrders;