import { DollarSign, MessageSquare, PanelBottomClose } from "lucide-react";

export interface CustomerData {
  // Total number of customers (usually an integer)
  totalCustomers: number; 

  // Financial value (API-te string thakleo amra number-e convert kore use korbo)
  totalCustomerValue: number | string; 

  // Social engagement metrics
  totalLikes: number;
  totalComments: number;
}

export const getStatsConfig = (data: CustomerData) => [
  {
    id: 1,
    ctitle: "Total Customers",
    value: data?.totalCustomers ?? "0",
    icon: <PanelBottomClose className="w-4 h-4" />,
    color: "bg-chart-4/10 text-chart-4",
    textColor: "bg-chart-4 text-white",
  },
  {
    id: 2,
    ctitle: "Total Value",
    value: data?.totalCustomerValue ? `$${data.totalCustomerValue}` : "$0",
    icon: <DollarSign className="w-4 h-4" />,
    color: "bg-chart-1/10 text-chart-1",
    textColor: "bg-chart-1 text-white",
  },
  {
    id: 3,
    ctitle: "Total Likes",
    value: data?.totalLikes ?? "0",
    icon: <MessageSquare className="w-4 h-4" />,
    color: "bg-chart-2/10 text-chart-2",
    textColor: "bg-chart-2 text-white",
  },
  {
    id: 4,
    ctitle: "Total Comments",
    value: data?.totalComments ?? "0",
    icon: <PanelBottomClose className="w-4 h-4" />,
    color: "bg-slate-100 text-slate-600",
    textColor: "bg-slate-600 text-white",
  },
];