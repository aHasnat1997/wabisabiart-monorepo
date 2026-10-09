


"use client";

import { useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import { getOrderDetails } from "./OrderAction";
import { OrderDetails } from "@/types/sellerDashboard/Orders";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Card, CardContent } from "@/components/ui/card";
import { Package, MapPin, User, CreditCard, Truck } from "lucide-react";
import { getInitials } from "@/lib/getInitials";
import { getImageUrl } from "../../products/components/getImageUrl";
import Image from "next/image";

/* ─── Status badge variant map ───────────────────────────── */
const STATUS_MAP: Record<string, { label: string; variant: "default" | "secondary" | "destructive" | "outline" }> = {
  delivered:        { label: "Delivered",        variant: "default" },
  shipped:          { label: "Shipped",          variant: "secondary" },
  paid:             { label: "Paid",             variant: "secondary" },
  pending_shipment: { label: "Pending Shipment", variant: "outline" },
  cancelled:        { label: "Cancelled",        variant: "destructive" },
  // past_due:         { label: "Past Due",         variant: "destructive" },
};

function fmt(amount: string, currency = "USD") {
  return new Intl.NumberFormat("en-US", { style: "currency", currency }).format(parseFloat(amount));
}

function fmtDate(iso: string) {
  return new Date(iso).toLocaleDateString("en-US", {
    month: "short", day: "numeric", year: "numeric",
  });
}

/* ─── Skeleton ───────────────────────────────────────────── */
const Skeleton = () => (
  <div className="w-full p-4 space-y-4 animate-pulse">
    <div className="h-5 w-48 bg-muted rounded" />
    <div className="h-3 w-32 bg-muted rounded" />
    <div className="grid grid-cols-2 gap-4 mt-4">
      {[1, 2].map((i) => (
        <div key={i} className="space-y-2 p-4 border rounded-lg">
          <div className="h-3 w-24 bg-muted rounded" />
          <div className="h-3 w-32 bg-muted rounded" />
          <div className="h-3 w-28 bg-muted rounded" />
        </div>
      ))}
    </div>
    <div className="h-20 bg-muted rounded-lg" />
    <div className="space-y-2 pt-4">
      {[1, 2, 3].map((i) => (
        <div key={i} className="flex justify-between">
          <div className="h-3 w-20 bg-muted rounded" />
          <div className="h-3 w-16 bg-muted rounded" />
        </div>
      ))}
    </div>
  </div>
);

/* ─── Main Component ─────────────────────────────────────── */
const OrderDetailsModal = () => {
  const searchParams = useSearchParams();
  const orderId = searchParams.get("id") ?? "";

  const [order, setOrder] = useState<OrderDetails | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  

  useEffect(() => {
  if (!orderId) return;
  
  getOrderDetails(orderId)
    .then((data) => {
      if (!data) setError("Order not found.");
      else setOrder(data);
    })
    .catch(() => setError("Failed to load order."))
    .finally(() => setLoading(false));
}, [orderId]);

  if (loading) return <Skeleton />;

  if (error || !order) {
    return (
      <div className="flex items-center justify-center py-16 text-destructive text-sm">
        {error ?? "Something went wrong."}
      </div>
    );
  }

  const statusInfo = STATUS_MAP[order.status] ?? { label: order.status, variant: "outline" as const };
  const shipment = order.shipments?.[0] ?? null;
  const addr = order.shippingAddress;
  const discount = parseFloat(order.discountAmount);

  return (
    <ScrollArea className="max-h-[80vh]">
      <div className="w-full p-4 space-y-5">

        {/* Header */}
        <div className="flex items-start justify-between">
          <div>
            <h3 className="font-semibold text-lg">{order.orderNumber}</h3>
            <p className="text-xs text-muted-foreground mt-0.5">
              Placed on {fmtDate(order.createdAt)}
            </p>
          </div>
          <Badge variant={statusInfo.variant} className="capitalize">
  {statusInfo.label.replace(/_/g, ' ')}
</Badge>
        </div>

        <Separator />

        {/* Customer + Shipping */}
        <div className="grid grid-cols-2 gap-3">
          <Card className="border shadow-none">
            <CardContent className="p-4 space-y-3">
              <div className="flex items-center gap-2 text-xs text-muted-foreground font-medium uppercase tracking-wide">
                <User size={12} /> Customer
              </div>
              <div className="flex items-center gap-3">
                <Avatar className="h-8 w-8">
                  <AvatarFallback className="bg-primary text-primary-foreground text-xs">
                    {getInitials(order.buyer.fullName)}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <p className="text-sm font-medium">{order.buyer.fullName}</p>
                  <p className="text-xs text-muted-foreground">{order.buyer.email}</p>
                  {order.buyer.phoneNumber && (
                    <p className="text-xs text-muted-foreground">{order.buyer.phoneNumber}</p>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border shadow-none">
            <CardContent className="p-4 space-y-3">
              <div className="flex items-center gap-2 text-xs text-muted-foreground font-medium uppercase tracking-wide">
                <MapPin size={12} /> Ship To
              </div>
              <div className="text-sm space-y-0.5">
                <p className="font-medium">{addr.fullName}</p>
                <p className="text-xs text-muted-foreground">{addr.addressLine1}</p>
                {addr.addressLine2 && (
                  <p className="text-xs text-muted-foreground">{addr.addressLine2}</p>
                )}
                <p className="text-xs text-muted-foreground">
                  {addr.city}, {addr.stateProvince} {addr.postalCode}
                </p>
                <p className="text-xs text-muted-foreground">{addr.country}</p>
                {addr.phoneNumber && (
                  <p className="text-xs text-muted-foreground">{addr.phoneNumber}</p>
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Order Items */}
        <div>
          <div className="flex items-center gap-2 text-xs text-muted-foreground font-medium uppercase tracking-wide mb-3">
            <Package size={12} /> Order Items
          </div>
          <div className="space-y-2">
            {order.items.map((item) => (
              
              <Card key={item.id} className="border shadow-none">
                <CardContent className="p-3 flex items-center gap-3">
       {(() => {
  const src = getImageUrl(item.imageUrl);
  return src ? (
    <Image
      src={src}
      alt={item.productTitle}
      width={68}
      height={68}
      className="rounded-md object-cover shrink-0"
    />
  ) : null;
})()}
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">{item.productTitle}</p>
                    <p className="text-xs text-muted-foreground">{item.variantName}</p>
                    <p className="text-xs text-muted-foreground">Qty: {item.quantity}</p>
                  </div>
                  <div className="text-right shrink-0">
                    <p className="text-sm font-semibold">{fmt(item.totalPrice)}</p>
                    <p className="text-xs text-muted-foreground">{fmt(item.unitPrice)} each</p>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* Price Summary */}
        <Card className="border shadow-none">
          <CardContent className="p-4 space-y-2 text-sm">
            <div className="flex items-center gap-2 text-xs text-muted-foreground font-medium uppercase tracking-wide mb-3">
              <CreditCard size={12} /> Summary
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Subtotal</span>
              <span>{fmt(order.subtotal)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Shipping</span>
              <span>{fmt(order.shippingCost)}</span>
            </div>
            {parseFloat(order.taxAmount) > 0 && (
              <div className="flex justify-between">
                <span className="text-muted-foreground">Tax</span>
                <span>{fmt(order.taxAmount)}</span>
              </div>
            )}
            {discount > 0 && (
              <div className="flex justify-between text-green-600">
                <span>Discount{order.couponCode ? ` (${order.couponCode})` : ""}</span>
                <span>-{fmt(order.discountAmount)}</span>
              </div>
            )}
            {parseFloat(order.tipAmount) > 0 && (
              <div className="flex justify-between">
                <span className="text-muted-foreground">Tip</span>
                <span>{fmt(order.tipAmount)}</span>
              </div>
            )}
            <Separator />
            <div className="flex justify-between font-semibold text-base">
              <span>Total</span>
              <span>{fmt(order.totalAmount)}</span>
            </div>
          </CardContent>
        </Card>

        {/* Shipment / Tracking */}
        {shipment && (
          <Card className="border shadow-none">
            <CardContent className="p-4 space-y-2 text-sm">
              <div className="flex items-center gap-2 text-xs text-muted-foreground font-medium uppercase tracking-wide mb-2">
                <Truck size={12} /> Shipment
              </div>
              {/* <div className="flex justify-between">
                <span className="text-muted-foreground">Carrier</span>
                <span>{shipment.carrier ?? "—"}</span>
              </div> */}
              <div className="flex justify-between">
                <span className="text-muted-foreground">Tracking</span>
                {shipment.trackingNumber ? (
                  shipment.trackingUrl ? (
                    <a href={shipment.trackingUrl} target="_blank" rel="noopener noreferrer" className="text-blue-600 underline text-xs">
                      {shipment.trackingNumber}
                    </a>
                  ) : (
                    <span>{shipment.trackingNumber}</span>
                  )
                ) : (
                  <span className="text-muted-foreground">—</span>
                )}
              </div>
              {order.deliveredAt && (
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Delivered</span>
                  <span>{fmtDate(order.deliveredAt)}</span>
                </div>
              )}
            </CardContent>
          </Card>
        )}

        {/* Buyer Note */}
        {order.buyerNote && (
          <Card className="border shadow-none bg-muted/30">
            <CardContent className="p-4 text-sm">
              <p className="text-xs text-muted-foreground mb-1 uppercase tracking-wide font-medium">Buyer Note</p>
              <p>{order.buyerNote}</p>
            </CardContent>
          </Card>
        )}

      </div>
    </ScrollArea>
  );
};

export default OrderDetailsModal;