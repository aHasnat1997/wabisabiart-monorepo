
"use client";

import { useEffect, useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/animate-ui/components/radix/dialog";
import { getOrderHistory } from "./OrderAction";
import { OrderHistoryEntry } from "@/types/sellerDashboard/Orders";

/* ─── status → display label & color ───────────────────── */
const STATUS_STYLE: Record<string, { label: string; color: string }> = {
  paid:             { label: "Order Placed",      color: "bg-gray-400" },
  pending:          { label: "Pending",            color: "bg-yellow-400" },
  processing:       { label: "Processing",         color: "bg-yellow-500" },
  shipped:          { label: "Shipped",            color: "bg-purple-500" },
  out_for_delivery: { label: "Out for Delivery",   color: "bg-blue-400" },
  delivered:        { label: "Delivered",          color: "bg-green-500" },
  cancelled:        { label: "Cancelled",          color: "bg-red-500" },
  refund_requested: { label: "Refund Requested",   color: "bg-orange-400" },
  refunded:         { label: "Refunded",           color: "bg-teal-500" },
  dispute:          { label: "Dispute Opened",     color: "bg-red-400" },
  delivery_delay:   { label: "Delivery Delay",     color: "bg-amber-500" },
};

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

/* ─── Skeleton loader ───────────────────────────────────── */
const TimelineSkeleton = () => (
  <div className="space-y-6 animate-pulse mt-6">
    {[1, 2, 3].map((i) => (
      <div key={i} className="flex gap-4">
        <div className="flex flex-col items-center">
          <div className="h-3 w-3 rounded-full bg-muted" />
          {i !== 3 && <div className="w-px flex-1 bg-muted mt-1 min-h-10" />}
        </div>
        <div className="space-y-1 flex-1">
          <div className="h-3 w-32 rounded bg-muted" />
          <div className="h-2 w-24 rounded bg-muted" />
          <div className="h-2 w-48 rounded bg-muted" />
        </div>
      </div>
    ))}
  </div>
);

interface Props {
  orderId: string;
  orderNumber?: string;
  open: boolean;
  onClose: () => void;
}

const ViewOrderHistoryModal = ({ orderId, orderNumber, open, onClose }: Props) => {
  const [history, setHistory] = useState<OrderHistoryEntry[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!open || !orderId) return;

    const fetchHistory = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const data = await getOrderHistory(orderId);
        setHistory(data);
      } catch {
        setError("Failed to load order history.");
      } finally {
        setIsLoading(false);
      }
    };

    fetchHistory();
  }, [open, orderId]);

  return (
    <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
      <DialogContent className="max-w-lg rounded-xl p-6">
        {/* Header */}
        <DialogHeader className="flex flex-row items-start justify-between">
          <div>
            <DialogTitle className="text-lg font-semibold">
              Order History {orderNumber ? `— ${orderNumber}` : ""}
            </DialogTitle>
            <p className="text-sm text-muted-foreground">
              Timeline and updates for this order
            </p>
          </div>
        </DialogHeader>

        {/* States */}
        {isLoading && <TimelineSkeleton />}

        {!isLoading && error && (
          <p className="text-sm text-destructive mt-6 text-center">{error}</p>
        )}

        {!isLoading && !error && history.length === 0 && (
          <p className="text-sm text-muted-foreground mt-6 text-center">
            No history available for this order.
          </p>
        )}

        {/* Timeline */}
        {!isLoading && !error && history.length > 0 && (
          <div className="mt-6 space-y-6">
            {[...history].reverse().map((step, index, arr) => {
              const style = STATUS_STYLE[step.status.toLowerCase()] ?? {
                label: step.status,
                color: "bg-gray-400",
              };

              return (
                <div key={step.id} className="flex gap-4">
                  <div className="flex flex-col items-center">
                    <div className={`h-3 w-3 rounded-full flex-none ${style.color}`} />
                    {index !== arr.length - 1 && (
                      <div className="w-px flex-1 bg-border mt-1" />
                    )}
                  </div>
                  <div className="pb-1">
                    <p className="text-sm font-medium">{style.label}</p>
                    <p className="text-xs text-muted-foreground">
                      {formatDate(step.createdAt)}
                    </p>
                    {step.note && (
                      <p className="text-xs text-muted-foreground mt-1">
                        {step.note}
                      </p>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default ViewOrderHistoryModal;
