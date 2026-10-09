"use client";

import { useState } from "react";
import { AlertTriangle, Truck } from "lucide-react";
import { NotificationData } from "@/types/sellerDashboard/NotificationType";
import { ScrollArea } from "@/components/ui/scroll-area";

export const notification: NotificationData[] = [
  {
    id: 1,
    type: "warning",
    title: "Order Past Due for Shipment",
    description:
      "Order #9825 from Marcus Chen is past the expected shipping date",
    time: "10 min ago",
    unread: true,
  },
  {
    id: 2,
    type: "warning",
    title: "Order Past Due for Shipment",
    description:
      "Order #9820 from Sofia Rodriguez is past the expected shipping date",
    time: "1 hour ago",
    unread: true,
  },
  {
    id: 3,
    type: "delay",
    title: "Delivery Delay Reported",
    description: "Order #9815 shipment is experiencing delays · Carrier: UPS",
    time: "2 hours ago",
    unread: false,
  },
  {
    id: 4,
    type: "delay",
    title: "Delivery Delay Reported",
    description: "Order #9810 shipment is experiencing delays · Carrier: USPS",
    time: "3 hours ago",
    unread: false,
  },
  {
    id: 2,
    type: "warning",
    title: "Order Past Due for Shipment",
    description:
      "Order #9820 from Sofia Rodriguez is past the expected shipping date",
    time: "1 hour ago",
    unread: true,
  },
  {
    id: 8,
    type: "delay",
    title: "Delivery Delay Reported",
    description: "Order #9815 shipment is experiencing delays · Carrier: UPS",
    time: "2 hours ago",
    unread: true,
  },
  {
    id: 4,
    type: "delay",
    title: "Delivery Delay Reported",
    description: "Order #9810 shipment is experiencing delays · Carrier: USPS",
    time: "3 hours ago",
    unread: false,
  },
];

export default function NotificationPanel() {
  const [notifications, setNotifications] =
    useState<NotificationData[]>(notification);

  const unreadCount = notifications.filter((n) => n.unread).length;

  const markAllRead = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, unread: false })));
  };

  return (
    <div className="w-full p-1 md:p-2 pb-12">
      {/* Header */}
      <div className="flex items-center justify-between border-b px-4 py-3">
        <div>
          <h2 className="text-sm font-semibold">Notifications</h2>
          <p className="text-xs text-muted-foreground">{unreadCount} unread</p>
        </div>

        <button
          onClick={markAllRead}
          className="text-xs text-primary hover:underline"
        >
          Mark all read
        </button>
      </div>

      {/* List */}
      <ScrollArea className="h-137.5">
        <div className="  p-3 space-y-3">
          {notifications.map((n) => (
            <div
              key={n.id}
              className={`
              group relative rounded-xl border p-3
              transition-all duration-200
              hover:shadow-md hover:-translate-y
              ${
                n.type === "warning"
                  ? "bg-destructive/10 border-destructive/70"
                  : "bg-chart-7/10 border-chart-7/70"
              }
              ${
                n.unread === false
                  ? "bg-card border-chart-7"
                  : "bg-chart-7/10 border-chart-7/70"
              }
            `}
            >
              {/* Unread dot */}
              {n.unread && (
                <span className="absolute right-3 top-3 h-2 w-2 rounded-full bg-primary" />
              )}

              <div className="flex gap-3">
                {/* Icon */}
                <div className="mt-0.5">
                  {n.type === "warning" ? (
                    <AlertTriangle className="h-5 w-5 text-destructive" />
                  ) : (
                    <Truck className="h-5 w-5 text-chart-7" />
                  )}
                </div>

                {/* Content */}
                <div className="flex-1">
                  <p className="text-sm font-medium text-foreground">
                    {n.title}
                  </p>

                  <p className="mt-0.5 text-xs text-muted-foreground">
                    {n.description}
                  </p>

                  <div className="mt-2 flex items-center justify-between">
                    <span className="text-xs text-muted-foreground">
                      {n.time}
                    </span>

                    <button className="text-xs font-medium text-primary opacity-0 transition-opacity group-hover:opacity-100">
                      View Order
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}

          {notifications.length === 0 && (
            <p className="text-center text-sm text-muted-foreground">
              No notifications
            </p>
          )}
        </div>
      </ScrollArea>
    </div>
  );
}
