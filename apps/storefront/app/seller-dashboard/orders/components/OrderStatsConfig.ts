// Update the interface to match your actual API response
export interface OrdersStats {
  totalOrders: number;
  totalRevenue: string | number;
  avgOrderValue: string | number;
  revenueGrowth: string;
  ordersGrowth: string;
}

export const buildOrderStats = (stats: OrdersStats) => [
  {
    id: 1,
    ctitle: "Total Orders",
    value: stats.totalOrders,
    badge: stats.ordersGrowth, // Showing the +800.00%
    iconName: "box",
    color: "bg-chart-4 text-card",
    textColor: "bg-emerald-50 text-[#6D8040]",
    status: "", 
  },
  {
    id: 2,
    ctitle: "Total Revenue",
    value: stats.totalRevenue,
    prefix: "$",
    badge: stats.revenueGrowth, 
    iconName: "dollar",
    color: "bg-primary/60 text-card",
    textColor: "bg-card text-[#3B82F6]",
    status: "revenue",
  },
  {
    id: 3,
    ctitle: "Avg. Order Value",
    value: stats.avgOrderValue,
    prefix: "$",
    iconName: "clock", 
    color: "bg-chart-7 text-card",
    textColor: "bg-card text-[#F59E0B]",
    status: "avg",
  },
  {
    id: 4,
    ctitle: "Status Overview",
    value: "Healthy", 
    badge: "Active",
    iconName: "alert",
    color: "bg-destructive text-card",
    textColor: "bg-card text-[#EF4444]",
    status: "status",
  },
];