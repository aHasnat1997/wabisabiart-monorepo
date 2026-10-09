import SectionTitle from "@/components/SectionTitle";
import { getOrders } from "./components/action";
import { OrderPageClient } from "./components/OrderClient";

interface OrderPageProps {
  searchParams: Promise<{ page?: string; status?: string }>;
}

export default async function OrderPage({ searchParams }: OrderPageProps) {
  const { page, status } = await searchParams;
  const currentPage = Number(page) || 1;

  const OrderStatus = [
    "all orders",
    "pending_payment",
    "payment_failed",
    "paid",
    // "processing",
    "shipped",
    // "in_transit",
    "delivered",
    "cancelled",
    "refunded",
    // "disputed",
  ];

  const statusParam = status && status !== "all orders" ? status : undefined;
  const { data: orders, meta } = await getOrders(statusParam);

  return (
    <div className="min-h-screen">
      <SectionTitle title="My Orders" />
      <OrderPageClient
        orders={orders}
        meta={meta}
        currentPage={currentPage}
        OrderStatus={OrderStatus}
      />
    </div>
  );
}
