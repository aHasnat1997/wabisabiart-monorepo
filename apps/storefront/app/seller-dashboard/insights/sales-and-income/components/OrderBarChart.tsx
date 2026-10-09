"use client";

import { useState, useEffect, useMemo } from "react";
import dynamic from "next/dynamic";
import type { ApexOptions } from "apexcharts";
import { CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { getsalesIncome } from "../../components/InsightsAction"; // Path check koren
import { Loader2 } from "lucide-react";

type DailyData = {
  date: string;
  orders: number;
};

// SSR issue avoid korar jonno dynamic import
const ReactApexChart = dynamic(() => import("react-apexcharts"), {
  ssr: false,
});

export function OrderBarChart() {
  const [chartHeight, setChartHeight] = useState(350);
  const [orderData, setOrderData] = useState<number[]>([]);
  const [dateLabels, setDateLabels] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);

  // Responsive chart height
  useEffect(() => {
    const handleResize = () => {
      const w = window.innerWidth;
      if (w <= 320) setChartHeight(220);
      else if (w <= 375) setChartHeight(250);
      else if (w <= 480) setChartHeight(280);
      else setChartHeight(350);
    };

    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // Fetch API Data
  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await getsalesIncome();
        if (res && res.success && res.data.dailyData) {
          const daily: DailyData[] = res.data.dailyData as DailyData[];

          // Mapping data
          const orders = daily.map((item) => item.orders);
          const dates = daily.map((item) => {
            const d = new Date(item.date);
            return d.toLocaleDateString("en-US", { day: "numeric", month: "short" });
          });

          setOrderData(orders);
          setDateLabels(dates);
        }
      } catch (error) {
        console.error("Order Chart Fetch Error:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const series = [
    {
      name: "Orders",
      data: orderData,
    },
  ];

  const options: ApexOptions = useMemo(() => ({
    chart: {
      type: "bar",
      height: chartHeight,
      toolbar: { show: false },
    },
    plotOptions: {
      bar: {
        borderRadius: 8,
        columnWidth: "60%",
        distributed: false,
      },
    },
    dataLabels: { enabled: false },
    colors: ["var(--chart-4)"],
    xaxis: {
      categories: dateLabels,
      axisBorder: { show: false },
      axisTicks: { show: false },
      labels: { 
        rotate: 0,
        style: { colors: "#94a3b8", fontSize: "12px" }
      },
    },
    yaxis: {
      tickAmount: 4,
      labels: {
        style: { colors: "#94a3b8" },
      },
    },
    grid: { 
      strokeDashArray: 4,
      borderColor: "#f1f5f9"
    },
    tooltip: { 
      theme: "light",
      y: { formatter: (val) => `${val} Orders` } 
    },
  }), [chartHeight, dateLabels]);

  if (loading) {
    return (
      <div className="h-[350px] flex items-center justify-center border rounded-xl">
        <Loader2 className="animate-spin h-6 w-6 text-primary" />
      </div>
    );
  }

  return (
    <div className="">
      <CardHeader>
        <CardTitle className="text-lg font-semibold">Order Trend</CardTitle>
      </CardHeader>

      <CardContent style={{ width: "100%" }}>
        {orderData.length > 0 ? (
          <ReactApexChart
            options={options}
            series={series}
            type="bar"
            height={chartHeight}
          />
        ) : (
          <div className="h-[250px] flex items-center justify-center text-muted-foreground italic">
            No order data found
          </div>
        )}
      </CardContent>
    </div>
  );
}