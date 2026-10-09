"use client";

import React, { useState, useEffect, useMemo } from "react";
import dynamic from "next/dynamic";
import type { ApexOptions } from "apexcharts";
import { getsalesIncome } from "../../components/InsightsAction"; // Action path check koren
import { Loader2 } from "lucide-react";

interface DailyData {
  revenue: string;
  orders?: number;
  date: string;
}

// SSR fix
const ReactApexChart = dynamic(() => import("react-apexcharts"), {
  ssr: false,
});

const OrderLineChart = () => {
  const [chartHeight, setChartHeight] = useState(350);
  const [aovData, setAovData] = useState<number[]>([]);
  const [dateLabels, setDateLabels] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const handleResize = () => {
      const w = window.innerWidth;
      if (w <= 320) setChartHeight(220);
      else if (w <= 480) setChartHeight(280);
      else setChartHeight(350);
    };

    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await getsalesIncome();
        if (res && res.success && res.data.dailyData) {
          const daily = res.data.dailyData as DailyData[];

          // Calculate AOV per day: Revenue / Orders
          const calculatedAOV = daily.map((item: DailyData) => {
            const revenue = parseFloat(item.revenue);
            const orders = item.orders || 1; // Division by zero avoid korte
            return parseFloat((revenue / orders).toFixed(2));
          });

          const dates = daily.map((item: DailyData) => {
            const d = new Date(item.date);
            return d.toLocaleDateString("en-US", { day: "numeric", month: "short" });
          });

          setAovData(calculatedAOV);
          setDateLabels(dates);
        }
      } catch (error) {
        console.error("AOV Chart Fetch Error:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const series = [
    {
      name: "Average Order Value",
      data: aovData,
    },
  ];

  const options: ApexOptions = useMemo(() => ({
    chart: {
      type: "line",
      height: chartHeight,
      dropShadow: {
        enabled: true,
        color: "#000",
        top: 10,
        left: 5,
        blur: 5,
        opacity: 0.1,
      },
      zoom: { enabled: false },
      toolbar: { show: false },
    },
    colors: ["#3b82f6"], // Shundor blue color
    dataLabels: { 
      enabled: true,
      formatter: (val) => `$${val}`,
      style: { fontSize: '10px', colors: ["#3b82f6"] }
    },
    stroke: { curve: "smooth", width: 3 },
    title: { 
      text: "Daily AOV Trend ($)", 
      align: "left",
      style: { color: "#64748b", fontWeight: "600" } 
    },
    grid: {
      borderColor: "#f1f5f9",
      row: { colors: ["#f8fafc", "transparent"], opacity: 0.5 },
    },
    markers: { size: 4, hover: { size: 6 } },
    xaxis: {
      categories: dateLabels,
      labels: { rotate: 0, style: { colors: "#94a3b8" } },
      axisBorder: { show: false },
    },
    yaxis: { 
      labels: {
        style: { colors: "#94a3b8" },
        formatter: (val) => `$${val}`
      }
    },
    tooltip: { 
      theme: "light",
      y: { formatter: (val) => `$${val.toLocaleString()}` } 
    },
  }), [chartHeight, dateLabels]);

  if (loading) {
    return (
      <div className="h-[350px] flex items-center justify-center border rounded-xl bg-white">
        <Loader2 className="animate-spin h-6 w-6 text-primary" />
      </div>
    );
  }

  return (
    <div className="p-4 ">
      <ReactApexChart
        options={options}
        series={series}
        type="line"
        height={chartHeight}
      />
    </div>
  );
};

export default OrderLineChart;