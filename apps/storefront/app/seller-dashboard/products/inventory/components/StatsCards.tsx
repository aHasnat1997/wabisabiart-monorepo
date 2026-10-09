"use client";

import { Package, TrendingUp, AlertTriangle, XCircle } from "lucide-react";

interface StatsCardsProps {
  totalStock: number;
  totalSold: number;
  lowStockCount: number;
  outOfStockCount: number;
}

const cards = (props: StatsCardsProps) => [
  {
    label: "Total Stock",
    value: props.totalStock,
    icon: Package,
    iconBg: "bg-green-100",
    iconColor: "text-green-600",
  },
  {
    label: "Total Sold",
    value: props.totalSold,
    icon: TrendingUp,
    iconBg: "bg-green-100",
    iconColor: "text-green-600",
  },
  {
    label: "Low Stock Sizes",
    value: props.lowStockCount,
    icon: AlertTriangle,
    iconBg: "bg-orange-100",
    iconColor: "text-orange-500",
  },
  {
    label: "Out of Stock",
    value: props.outOfStockCount,
    icon: XCircle,
    iconBg: "bg-red-100",
    iconColor: "text-red-500",
  },
];

export default function StatsCards(props: StatsCardsProps) {
  return (
    <div className="grid grid-cols-1  lg:grid-cols-4 gap-4 mb-6">
      {cards(props).map((card) => (
        <div
          key={card.label}
          className="bg-card border rounded-xl px-5 py-4 flex items-center gap-4 shadow-sm"
        >
          <div className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 ${card.iconBg}`}>
            <card.icon size={20} className={card.iconColor} />
          </div>
          <div>
            <p className="text-xs text-muted-foreground">{card.label}</p>
            <p className="text-2xl font-bold leading-tight">{card.value}</p>
          </div>
        </div>
      ))}
    </div>
  );
}