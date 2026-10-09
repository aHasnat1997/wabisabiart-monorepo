"use client";

import { useState, useEffect, useMemo } from "react";
import dynamic from "next/dynamic";
import type { ApexOptions } from "apexcharts";
import { getsalesIncome } from "../../components/InsightsAction"; // Action path check koren
import { Loader2 } from "lucide-react";

const ReactApexChart = dynamic(() => import("react-apexcharts"), {
  ssr: false,
});

interface DailyData {
  date: string;
  revenue: string;
  orders: number;
}

const AppAreaChart = () => {
  const [chartHeight, setChartHeight] = useState(350);
  const [revenueData, setRevenueData] = useState<number[]>([]);
  const [dateLabels, setDateLabels] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);

  // Responsive height logic
  useEffect(() => {
    const handleResize = () => {
      const w = window.innerWidth;
      if (w <= 320) setChartHeight(200);
      else if (w <= 375) setChartHeight(220);
      else if (w <= 480) setChartHeight(250);
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
          const apiData: DailyData[] = res.data.dailyData as DailyData[];
          
          // Map Revenue and Dates
          const revenues = apiData.map((item) => Number(item.revenue));
          const dates = apiData.map((item) => {
            // Date format ektu shundor korar jonno (e.g., "12 Mar")
            const d = new Date(item.date);
            return d.toLocaleDateString("en-US", { day: "numeric", month: "short" });
          });

          setRevenueData(revenues);
          setDateLabels(dates);
        }
      } catch (error) {
        console.error("Chart Fetch Error:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const series = [
    {
      name: "Revenue",
      data: revenueData,
    },
  ];

  const options: ApexOptions = useMemo(() => ({
    chart: {
      type: "area",
      height: chartHeight,
      toolbar: { show: false },
      sparkline: { enabled: false },
    },
    colors: ["var(--chart-2)"],
    dataLabels: { enabled: false },
    stroke: { curve: "smooth", width: 2 },
    fill: {
      type: "gradient",
      gradient: {
        shadeIntensity: 1,
        opacityFrom: 0.5,
        opacityTo: 0.1,
        stops: [0, 90, 100],
      },
    },
    xaxis: {
      categories: dateLabels,
      axisBorder: { show: false },
      axisTicks: { show: false },
      labels: { 
        style: { colors: "#94a3b8", fontSize: "12px" },
        rotate: 0 
      },
    },
    yaxis: {
      labels: {
        style: { colors: "#94a3b8" },
        formatter: (val) => `$${val.toLocaleString()}`,
      },
    },
    grid: { 
      borderColor: "#f1f5f9",
      strokeDashArray: 4,
      xaxis: { lines: { show: true } }
    },
    tooltip: { 
      theme: "light",
      y: { formatter: (val) => `$${val.toLocaleString()}` } 
    },
  }), [chartHeight, dateLabels]);

  if (loading) {
    return (
      <div className="h-[350px] flex items-center justify-center">
        <Loader2 className="animate-spin h-6 w-6 text-primary" />
      </div>
    );
  }

  return (
    <div style={{ width: "100%" }}>
      <h1 className="text-lg font-bold mb-6">Revenue Trend</h1>
      {revenueData.length > 0 ? (
        <ReactApexChart
          options={options}
          series={series}
          type="area"
          height={chartHeight}
        />
      ) : (
        <div className="h-[350px] flex items-center justify-center text-muted-foreground">
          No trend data found
        </div>
      )}
    </div>
  );
};

export default AppAreaChart;