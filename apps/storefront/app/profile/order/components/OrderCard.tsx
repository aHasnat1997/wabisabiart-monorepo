import { Button } from "@/components/animate-ui/components/buttons/button";
import { Badge } from "@/components/ui/badge";
import { cn, resolveImageUrl } from "@/lib/utils";
import { Order, OrderStatus } from "@/types/order";
import { ChevronRight } from "lucide-react";
import Image from "next/image";
import Link from "next/link";

export default function OrderCard({ order }: { order: Order }) {
  const firstItem = order.items[0];

  const getStatusStyles = (status: OrderStatus) => {
    const styles: Record<OrderStatus, string> = {
      pending_payment: "bg-chart-1/10 text-chart-1 border-chart-1",
      payment_failed: "bg-destructive/10 text-destructive border-destructive",
      paid: "bg-chart-2/10 text-chart-2 border-chart-2",
      processing: "bg-chart-5/10 text-chart-5 border-chart-5",
      shipped: "bg-chart-4/10 text-chart-4 border-chart-4",
      in_transit: "bg-chart-3/10 text-chart-3 border-chart-3",
      delivered: "bg-primary/10 text-primary border-primary",
      cancelled: "bg-destructive/10 text-destructive border-destructive",
      refunded: "bg-chart-3/10 text-chart-3 border-chart-3",
      disputed: "bg-chart-1/10 text-chart-1 border-chart-1",
    };
    return styles[status];
  };

  return (
    <div className="rounded-lg border bg-card p-3 shadow-sm transition-all duration-500 ease-in-out hover:-translate-y-1 hover:shadow-md">
      {/* ── Top row: status badge + price ─────────────────────── */}
      <div className="flex md:hidden items-center justify-between gap-2 mb-3">
        <Badge
          variant="outline"
          className={cn(
            "capitalize font-semibold text-xs px-2 py-0.5",
            getStatusStyles(order.status),
          )}
        >
          {order.status.replace(/_/g, " ")}
        </Badge>
        <p className="text-base font-bold shrink-0">
          {order.currency} {order.totalAmount}
        </p>
      </div>

      {/* ── Main row: image + info ─────────────────────────────── */}
      <div className="flex items-center gap-3">
        {/* Image */}
        <div className="shrink-0">
          <Image
            className="h-18 w-18 md:h-25 md:w-25 rounded-md object-cover"
            src={resolveImageUrl(firstItem.imageUrl)}
            alt={firstItem?.productTitle}
            width={100}
            height={100}
          />
        </div>

        {/* Info */}
        <div className="flex flex-col gap-0.5 min-w-0 flex-1">
          {/* Product title — highlighted */}
          <span className="flex items-center justify-between gap-2">
            <h3 className="font-semibold text-sm sm:text-base text-foreground leading-snug line-clamp-1">
              {firstItem.productTitle}
            </h3>
            <div className="hidden md:flex items-center justify-between gap-4">
              <Badge
                variant="outline"
                className={cn(
                  "capitalize font-semibold text-xs px-2 py-0.5",
                  getStatusStyles(order.status),
                )}
              >
                {order.status.replace(/_/g, " ")}
              </Badge>
              <p className="text-base font-bold shrink-0">
                {order.currency} {order.totalAmount}
              </p>
            </div>{" "}
          </span>

          {/* Variant + qty */}
          <div className="flex items-center justify-between gap-2">
            <span>
              <p className="text-muted-foreground text-xs md:text-base truncate">
                {firstItem.variantName} &bull; Qty: {firstItem.quantity}
              </p>

              {/* Shop + order meta */}
              <p className="text-muted-foreground text-xs md:text-sm truncate">
                {order.seller.shopName}
              </p>
              <p className="text-muted-foreground text-xs md:text-sm">
                {order.orderNumber} &bull;{" "}
                {new Date(order.createdAt).toLocaleDateString("en-US", {
                  year: "numeric",
                  month: "short",
                  day: "numeric",
                })}
              </p>

              {order.items.length > 1 && (
                <p className="text-xs text-muted-foreground">
                  +{order.items.length - 1} more item
                  {order.items.length > 2 ? "s" : ""}
                </p>
              )}
            </span>
            <Link href={`/profile/order/${order.id}`}>
              <Button
                size="sm"
                variant="outline"
                className="gap-1 w-full sm:w-auto hidden md:flex"
              >
                View Details
                <ChevronRight className="h-3.5 w-3.5" />
              </Button>
            </Link>
          </div>
        </div>
      </div>

      {/* ── CTA ───────────────────────────────────────────────── */}
      <Link
        className="mt-3 flex md:hidden justify-end"
        href={`/profile/order/${order.id}`}
      >
        <Button size="sm" variant="outline" className="gap-1 w-full sm:w-auto">
          View Details
          <ChevronRight className="h-3.5 w-3.5" />
        </Button>
      </Link>
    </div>
  );
}