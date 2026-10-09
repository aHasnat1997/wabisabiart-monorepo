"use client";

import { useRouter, useSearchParams } from "next/navigation";
import {
  Tabs,
  TabsPanel,
  TabsPanels,
  TabsList,
  TabsTab,
} from "@/components/animate-ui/components/base/tabstabs";
import OrderCard from "./OrderCard";
import { CommonPagination } from "@/components/commonPagination";
import { Order, ApiMeta } from "@/types/order";

interface OrderPageClientProps {
  orders: Order[];
  meta: ApiMeta;
  currentPage: number;
  OrderStatus: string[];
}

export function OrderPageClient({
  orders,
  meta,
  currentPage,
  OrderStatus,
}: OrderPageClientProps) {
  const router = useRouter();
  const searchParams = useSearchParams();

  const currentStatus = searchParams.get("status") || "all orders";

  const handlePageChange = (page: number) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set("page", String(page));
    router.push(`?${params.toString()}`);
  };

  const handleStatusChange = (status: string) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set("status", status);
    params.set("page", "1"); // reset to page 1 on tab change
    router.push(`?${params.toString()}`);
  };

  const getFilteredOrders = (status: string) => {
    if (status === "all orders") return orders;
    return orders.filter((order) => order.status === status);
  };

  return (
    <div>
      <Tabs value={currentStatus} onValueChange={handleStatusChange}>
        <TabsList className="flex sticky border-b py-1.5 top-0 z-30 rounded-none bg-card! responsive-tabs gap-4 md:gap-6 lg:gap-16 xl:gap-24">
          {OrderStatus.map((status) => (
            <TabsTab className="capitalize" key={status} value={status}>
              {status.replace(/_/g, " ")}
            </TabsTab>
          ))}
        </TabsList>

        <TabsPanels className="py-6">
          {OrderStatus.map((status) => (
            <TabsPanel key={status} value={status}>
              <div className="space-y-4">
                {getFilteredOrders(status).map((order) => (
                  <OrderCard key={order.id} order={order} />
                ))}
                {getFilteredOrders(status).length === 0 && (
                  <p className="text-center text-gray-500 py-8">
                    No {status.replace(/_/g, " ")} orders found
                  </p>
                )}
              </div>
            </TabsPanel>
          ))}
        </TabsPanels>
      </Tabs>

      <div className="mt-6 flex justify-center">
        {meta?.totalPages && meta.totalPages > 1 ? (
          <CommonPagination
            currentPage={currentPage}
            totalPages={meta.totalPages}
            onPageChange={handlePageChange}
          />
        ) : null}
      </div>
    </div>
  );
}
