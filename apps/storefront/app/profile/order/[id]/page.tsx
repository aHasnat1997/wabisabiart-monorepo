import { Button } from "@/components/ui/button";
import { getOrderDetails } from "../components/action";
import { resolveImageUrl } from "@/lib/utils";
import Image from "next/image";
import Link from "next/link";
import { ChevronLeft } from "lucide-react";

function formatCurrency(amount: number | string) {
  const numAmount = typeof amount === "string" ? parseFloat(amount) : amount;
  return `$${numAmount.toFixed(2)}`;
}

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function getStatusLabel(status: string) {
  return status
    .split("_")
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(" ");
}

// ─── Timeline Logic ───────────────────────────────────────────────────────────
const STEP_LABELS = [
  "Order Placed",
  "Processing",
  "Shipped",
  "In Transit",
  "Delivered",
];

function getStepIndex(status: string): number {
  const map: Record<string, number> = {
    pending_payment: 0,
    paid: 0,
    processing: 1,
    shipped: 2,
    in_transit: 3,
    delivered: 4,
  };
  return map[status] ?? -1;
}

const TERMINAL_STATES = ["cancelled", "refunded", "disputed", "payment_failed"];

// ─── Sub-components ───────────────────────────────────────────────────────────
function StatusBadge({ status }: { status: string }) {
  const badgeMap: Record<string, { bg: string; text: string; dot: string }> = {
    pending_payment: {
      bg: "bg-muted",
      text: "text-muted-foreground",
      dot: "bg-muted-foreground",
    },
    paid: { bg: "bg-primary/10", text: "text-primary", dot: "bg-primary" },
    payment_failed: {
      bg: "bg-destructive/10",
      text: "text-destructive",
      dot: "bg-destructive",
    },
    processing: {
      bg: "bg-primary/10",
      text: "text-primary",
      dot: "bg-primary",
    },
    shipped: {
      bg: "bg-secondary/10",
      text: "text-secondary",
      dot: "bg-secondary",
    },
    in_transit: {
      bg: "bg-primary/10",
      text: "text-primary",
      dot: "bg-primary",
    },
    delivered: { bg: "bg-primary/10", text: "text-primary", dot: "bg-primary" },
    cancelled: {
      bg: "bg-destructive/10",
      text: "text-destructive",
      dot: "bg-destructive",
    },
    refunded: {
      bg: "bg-destructive/10",
      text: "text-destructive",
      dot: "bg-destructive",
    },
    disputed: {
      bg: "bg-destructive/10",
      text: "text-destructive",
      dot: "bg-destructive",
    },
  };

  const style = badgeMap[status] ?? badgeMap["pending_payment"];

  return (
    <span
      className={`inline-flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1.5 rounded-full uppercase tracking-[0.4px] ${style.bg} ${style.text}`}
    >
      <span className={`w-1.5 h-1.5 rounded-full inline-block ${style.dot}`} />
      {getStatusLabel(status)}
    </span>
  );
}

function ColorOption({ value }: { value: string }) {
  const isHex = value.startsWith("#");
  return (
    <span className="inline-flex items-center gap-1 text-xs font-medium px-2 py-0.5 rounded-full bg-muted text-muted-foreground border border-border">
      {isHex && (
        <span
          className="w-2 h-2 rounded-full inline-block"
          style={{ background: value }}
        />
      )}
      {isHex ? "Color" : value}
    </span>
  );
}

function Tag({ children }: { children: React.ReactNode }) {
  return (
    <span className="text-xs font-medium px-2 py-0.5 rounded-full bg-muted text-muted-foreground border border-border">
      {children}
    </span>
  );
}

function StatusTimeline({ status }: { status: string }) {
  const activeIdx = getStepIndex(status);
  const isTerminal = TERMINAL_STATES.includes(status);

  return (
    <div className="px-6 py-5">
      <div className="relative">
        {STEP_LABELS.map((label, i) => {
          const isActive = !isTerminal && i <= activeIdx;
          const isCurrent = !isTerminal && i === activeIdx;
          const isLast = i === STEP_LABELS.length - 1;

          return (
            <div
              key={label}
              className={`flex items-center gap-3.5 relative ${isLast ? "pb-0" : "pb-6"}`}
            >
              {/* Connector line */}
              {!isLast && (
                <div
                  className={`absolute left-[11px] top-6 bottom-0 w-0.5 ${
                    i < activeIdx && !isTerminal ? "bg-primary" : "bg-border"
                  }`}
                />
              )}

              {/* Dot */}
              <div
                className={`w-6 h-6 rounded-full shrink-0 z-10 flex items-center justify-center transition-colors
                  ${
                    isCurrent
                      ? "bg-primary ring-4 ring-primary/20"
                      : isActive
                        ? "bg-primary"
                        : "bg-muted"
                  }`}
              >
                {isActive && <div className="w-2 h-2 rounded-full bg-card" />}
              </div>

              {/* Label */}
              <span
                className={`text-sm ${
                  isCurrent
                    ? "font-bold text-primary"
                    : isActive
                      ? "font-medium text-foreground"
                      : "font-medium text-muted-foreground"
                }`}
              >
                {label}
              </span>
            </div>
          );
        })}
      </div>

      {/* Terminal state indicator */}
      {isTerminal && (
        <div className="mt-2 flex items-center gap-3.5">
          <div className="w-6 h-6 rounded-full shrink-0 z-10 flex items-center justify-center bg-destructive ring-4 ring-destructive/20">
            <div className="w-2 h-2 rounded-full bg-card" />
          </div>
          <span className="text-sm font-bold text-destructive">
            {getStatusLabel(status)}
          </span>
        </div>
      )}
    </div>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────
export default async function OrderDetailsPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const order = await getOrderDetails(id);

  if (!order) {
    return (
      <div className="p-12 text-center text-muted-foreground">
        Order not found.
      </div>
    );
  }

  const card =
    "bg-card text-card-foreground rounded-xl border border-border shadow-sm overflow-hidden";

  return (
    <div className="min-h-screen py-7 text-foreground">
      {/* ── Header ── */}
      <div className="flex items-center justify-between mb-6">
        <span className="flex items-center gap-2">
          <Link
            href="/profile/order"
            className="text-sm text-muted-foreground hover:text-foreground transition-colors"
          >
            <ChevronLeft />
          </Link>
          <h1 className="text-2xl font-bold tracking-tight">Order Details</h1>
        </span>
        <Button>Manage Orders</Button>
      </div>

      {/* ── Two-column layout ── */}
      <div className="grid grid-cols-1 md:grid-cols-[1fr_320px] gap-4 items-start">
        {/* ── Left ── */}
        <div className="flex flex-col gap-4">
          {/* Order Meta Card */}
          <div className={card}>
            <div className="flex justify-between items-center px-6 py-5 gap-4">
              <div>
                <div className="text-xs font-medium text-muted-foreground uppercase tracking-[0.6px] mb-1.5">
                  Order ID
                </div>
                <div className="font-mono text-[13px] font-medium">
                  {order.orderNumber}
                </div>
              </div>

              <StatusBadge status={order.status} />

              <div className="text-right">
                <div className="text-xs font-medium text-muted-foreground uppercase tracking-[0.6px] mb-1.5">
                  Created At
                </div>
                <div className="font-mono text-[13px] font-medium">
                  {formatDate(order.createdAt)}
                </div>
              </div>
            </div>
          </div>

          {/* Items Table Card */}
          <div className={card}>
            {/* Table Header */}
            <div className="grid grid-cols-[1fr_80px_100px] px-6 py-3 border-b border-border bg-muted">
              {["Details", "Qty", "Net Price"].map((h, i) => (
                <span
                  key={h}
                  className={`text-xs font-semibold text-muted-foreground uppercase tracking-[0.6px] ${i > 0 ? "text-center" : "text-left"}`}
                >
                  {h}
                </span>
              ))}
            </div>

            {/* Rows */}
            {order.items.map((item, idx) => (
              <Link
                href={`/products/${item.productId}`}
                key={item.id}
                className={`flex flex-col sm:grid sm:grid-cols-[1fr_64px_90px] gap-2 sm:gap-0 sm:items-center px-3 sm:px-4 md:px-6 py-3 md:py-4 ${idx < order.items.length - 1 ? "border-b border-border" : ""}`}
              >
                {/* Product info */}
                <div className="flex items-center gap-2 min-w-0">
                  <div className="w-12 h-12 sm:w-12 md:w-14 sm:h-12 md:h-14 relative rounded-md overflow-hidden bg-muted shrink-0">
                    <Image
                      src={resolveImageUrl(item.imageUrl)}
                      alt={item.productTitle}
                      fill
                      className="object-cover"
                      sizes="56px"
                    />
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="text-xs md:text-sm font-medium leading-[1.4] truncate">
                      {item.productTitle}
                    </div>
                    <div className="flex gap-1 mt-1 flex-wrap">
                      {item.variant.options.map((opt) =>
                        opt.type === "color_picker" ? (
                          <ColorOption key={opt.name} value={opt.value} />
                        ) : (
                          <Tag key={opt.name}>
                            {opt.name}: {opt.value}
                          </Tag>
                        ),
                      )}
                    </div>
                  </div>

                  {/* Mobile: inline qty + price */}
                  <div className="flex items-center gap-3 ml-auto sm:hidden shrink-0">
                    <span className="text-xs text-muted-foreground">
                      ×{item.quantity}
                    </span>
                    <span className="text-sm font-semibold font-mono">
                      {formatCurrency(item?.totalPrice)}
                    </span>
                  </div>
                </div>

                {/* Desktop: separate qty + price columns */}
                <div className="hidden sm:block text-center text-sm font-semibold">
                  {item.quantity}
                </div>
                <div className="hidden sm:block text-center text-sm font-semibold font-mono">
                  {formatCurrency(item?.totalPrice)}
                </div>
              </Link>
            ))}
          </div>
        </div>

        {/* ── Right Column ── */}
        <div className="flex flex-col gap-4">
          {/* Summary Card */}
          <div className={card}>
            <div className="px-6 pt-5 pb-3.5 border-b border-border text-base font-bold tracking-tight">
              Summary
            </div>
            <div className="px-6 py-4">
              {[
                {
                  label: `Subtotal (${order.items.length} product${order.items.length > 1 ? "s" : ""})`,
                  value: formatCurrency(order.subtotal),
                  color: "text-card-foreground",
                },
                {
                  label: "Shipping Fee",
                  value: formatCurrency(order.shippingCost),
                  color: "text-card-foreground",
                },
                {
                  label: "Tax",
                  value: formatCurrency(order.taxAmount),
                  color: "text-card-foreground",
                },
                {
                  label: "Discount",
                  value: `− ${formatCurrency(order.discountAmount)}`,
                  color: "text-primary",
                },
              ].map((row, i, arr) => (
                <div
                  key={row.label}
                  className={`flex justify-between py-2 ${i < arr.length - 1 ? "border-b border-border" : ""}`}
                >
                  <span className="text-[13px] text-muted-foreground">
                    {row.label}
                  </span>
                  <span
                    className={`text-[13px] font-semibold font-mono ${row.color}`}
                  >
                    {row.value}
                  </span>
                </div>
              ))}

              {/* Total row */}
              <div className="flex justify-between pt-3 mt-1 border-t-2 border-border">
                <span className="text-[15px] font-bold">Total</span>
                <span className="text-base font-bold font-mono">
                  {formatCurrency(order.totalAmount)}
                </span>
              </div>
            </div>
          </div>

          {/* Status Timeline Card */}
          <div className={card}>
            <div className="px-6 pt-5 pb-3.5 border-b border-border text-base font-bold tracking-tight">
              Order Status
            </div>
            <StatusTimeline status={order.status} />
          </div>
        </div>
      </div>
    </div>
  );
}
