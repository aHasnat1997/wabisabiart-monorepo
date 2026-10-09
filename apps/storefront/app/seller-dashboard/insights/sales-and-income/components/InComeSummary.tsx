"use client";
import { useEffect, useState } from "react";
import {
  CardHeader,
  CardTitle,
  CardContent,
  CardFooter,
} from "@/components/ui/card";
import { Loader2 } from "lucide-react";
import { getsalesIncome } from "../../components/InsightsAction";

type Item = {
  label: string;
  value: string;
  variant?: "success" | "danger" | "default" | "info";
};

type SalesIncomeData = {
  totalRevenue: number;
  productSales: number;
  shippingFees: number;
  tips: number;
};

// Screenshot-er moto exact colors ar rounded shapes
const rowStyles: Record<NonNullable<Item["variant"]>, string> = {
  success: "bg-[#eefcf4] text-[#1e293b] border-none", // Light green bg for Gross
  danger: "bg-[#f8fafc] text-[#ef4444] border-none",  // Light gray bg with red text for minus values
  info: "bg-[#eff6ff] text-[#1e293b] border-none",    // Light blue bg for Net
  default: "bg-[#f8fafc] text-[#1e293b] border-none",
};

export const IncomeSummaryCard = () => {
  const [data, setData] = useState<SalesIncomeData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await getsalesIncome();
        if (res && res.success && res.data) {
          setData({
            totalRevenue: Number(res.data.totalRevenue),
            productSales: Number(res.data.revenueBreakdown.productSales),
            shippingFees: Number(res.data.revenueBreakdown.shippingFees),
            tips: Number(res.data.revenueBreakdown.tips),
          });
        }
      } catch (error) {
        console.error("Fetch error:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  if (loading) return <div className="flex justify-center p-10"><Loader2 className="animate-spin h-5 w-5" /></div>;

  const grossRevenue = data?.totalRevenue || 0;
  
  const costOfGoods = grossRevenue * 0.2; 
  const operatingExpenses = grossRevenue * 0.1;
  const netIncome = grossRevenue - (costOfGoods + operatingExpenses);
  
  const profitMargin = grossRevenue > 0 ? ((netIncome / grossRevenue) * 100).toFixed(1) : "0.0";

  const items: Item[] = [
    { label: "Gross Revenue", value: `$${grossRevenue.toLocaleString()}`, variant: "success" },
    { label: "Cost of Goods", value: `-$${costOfGoods.toLocaleString()}`, variant: "danger" },
    { label: "Operating Expenses", value: `-$${operatingExpenses.toLocaleString()}`, variant: "danger" },
    { label: "Net Income", value: `$${netIncome.toLocaleString()}`, variant: "info" },
  ];

  return (
    <div className="bg-white ">
      <CardHeader className="p-5">
        <CardTitle className="text-[17px] font-semibold text-muted-foreground">Income Summary</CardTitle>
      </CardHeader>

      <CardContent className="space-y-3 px-5">
        {items.map((item) => (
          <div
            key={item.label}
            className={`flex items-center justify-between rounded-[14px] px-4 py-4 text-[15px] font-medium transition-all ${
              rowStyles[item.variant ?? "default"]
            }`}
          >
            <span className="text-[#475569]">{item.label}</span>
            <span className={`${item.variant === "danger" ? "text-destructive" : "text-muted-foreground"} font-semibold`}>
              {item.value}
            </span>
          </div>
        ))}
      </CardContent>

      <div className="mt-4 px-5">
        <div className="h-[1px] bg-[#f1f5f9] w-full" /> {/* Custom Divider */}
      </div>

      <CardFooter className="flex items-center justify-between p-5 mt-1">
        <span className="text-[#64748b] text-[15px] font-medium">Profit Margin</span>
        <span className="font-bold text-primary text-[15px]">{profitMargin}%</span>
      </CardFooter>
    </div>
  );
};