"use client";
import { CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { RevenueColor } from "@/types/sellerDashboard/Revenue";
import { useEffect, useState } from "react";
import { Loader2 } from "lucide-react";
import { getsalesIncome } from "../../components/InsightsAction";

interface RevenueData {
  totalRevenue: number | string;
  revenueBreakdown: {
    productSales: string;
    shippingFees: string;
    tips: string;
  };
}

interface ApiResponse {
  success: boolean;
  data: RevenueData;
}

const RevenueBreakDown = () => {
  const [data, setData] = useState<RevenueData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {

    const fetchData = async () => {
      try {
        const res = (await getsalesIncome()) as unknown as ApiResponse;
        console.log("API Response:", res);
        if (res && res.success) {
          setData({
            totalRevenue: Number(res.data.totalRevenue),
            revenueBreakdown: res.data.revenueBreakdown,
          });
        }
        
      } catch (error) {
        console.error("Fetch error:", error);
      } finally{
        setLoading(false);
      }
    }

    fetchData();
  
  }, []);

  if (loading) return <div className="flex justify-center p-10"><Loader2 className="animate-spin" /></div>;

  
  const breakdown = data?.revenueBreakdown || { productSales: "0", shippingFees: "0", tips: "0" };
  const totalRevenue = Number(data?.totalRevenue || 0);

  const revenueItems = [
    { label: "Product Sales", value: Number(breakdown.productSales), color: "purple" as RevenueColor },
    { label: "Shipping Fees", value: Number(breakdown.shippingFees), color: "orange" as RevenueColor },
    { label: "Tips Received", value: Number(breakdown.tips), color: "green" as RevenueColor },
  ];

  return (
    <div>
      <CardHeader>
        <CardTitle>Revenue Breakdown</CardTitle>
      </CardHeader>

      <CardContent className="space-y-6">
        {revenueItems.map((item) => {
       
          const percent = totalRevenue > 0 
            ? Number(((item.value / totalRevenue) * 100).toFixed(1)) 
            : 0;

          return (
            <RevenueItem
              key={item.label}
              label={item.label}
              value={item.value}
              percent={percent}
              color={item.color}
            />
          );
        })}

        <div className="border-t pt-2">
          <div className="flex justify-between text-sm font-medium">
            <span>Total Revenue</span>
            <span>${totalRevenue.toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
          </div>
        </div>
      </CardContent>
    </div>
  );
};

/* ---------------- Revenue Item ---------------- */
function RevenueItem({ label, value, percent, color }: { label: string; value: number; percent: number; color: RevenueColor }) {
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const timer = setTimeout(() => {
      setProgress(percent);
    }, 150);
    return () => clearTimeout(timer);
  }, [percent]);

  return (
    <div className="space-y-1">
      <div className="flex justify-between text-sm font-medium">
        <span>{label}</span>
        <span>${value.toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
      </div>

      <div className="flex items-center gap-3">
        <Progress
          value={progress}
          className={`h-2 [&>div]:transition-all [&>div]:duration-700 [&>div]:ease-out
            ${color === "purple" ? "[&>div]:bg-chart-4" : ""}
            ${color === "green" ? "[&>div]:bg-primary" : ""}
            ${color === "orange" ? "[&>div]:bg-chart-7" : ""}
          `}
        />
        <span className="text-xs text-muted-foreground">{percent}%</span>
      </div>
    </div>
  );
}

export default RevenueBreakDown;