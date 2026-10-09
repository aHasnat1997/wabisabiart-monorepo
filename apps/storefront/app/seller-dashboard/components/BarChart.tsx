"use client";

import dynamic from "next/dynamic";
import { useState, useEffect, useMemo } from "react";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";

import { Loader2 } from "lucide-react";
import { getsalesIncome } from "../insights/components/InsightsAction";

// ApexCharts SSR fix
const Chart = dynamic(() => import("react-apexcharts"), { ssr: false });

interface DailyData {
  date: string;
  revenue: string | number;
  orders: number;
}

const AppBarChart = () => {
  const [selectedRange, setSelectedRange] = useState("12months");
  const [selectedYear, setSelectedYear] = useState("2026");
  const [chartHeight, setChartHeight] = useState(300);
  const [apiData, setApiData] = useState<DailyData[]>([]);
  const [loading, setLoading] = useState(true);

  // Dynamic height based on screen width
  useEffect(() => {
    const handleResize = () => {
      const w = window.innerWidth;
      if (w <= 480) setChartHeight(250);
      else setChartHeight(300);
    };
    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // Fetch Data from API
  useEffect(() => {
    const fetchChartData = async () => {
      setLoading(true);
      try {
        const res = await getsalesIncome();
        if (res?.success && res.data?.dailyData) {
          setApiData(res.data.dailyData as DailyData[]);
        }
      } catch (error) {
        console.error("Chart Data Fetch Error:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchChartData();
  }, []);

  // Filter logic based on Tabs
  const filteredData = useMemo(() => {

    const yearData = apiData.filter((d) => d.date.startsWith(selectedYear));
   switch (selectedRange) {
      case "30days":
        return yearData.slice(-30);
      case "7days":
        return yearData.slice(-7);
      case "24hours":
        return yearData.slice(-1);
      default:
        return yearData;
    }
  }, [apiData, selectedRange, selectedYear]);

  // Chart Series Data
  const chartSeries = [
    {
      name: "Revenue",
      data: filteredData.map((d) => parseFloat(String(d.revenue))),
    },
    {
      name: "Orders",
      data: filteredData.map((d) => d.orders),
    },
  ];

  // Chart Options
  const options: ApexCharts.ApexOptions = {
    chart: {
      type: "bar",
      toolbar: { show: false },
      height: chartHeight,
      stacked: false,
    },
    plotOptions: {
      bar: {
        borderRadius: 4,
        columnWidth: "55%",
      },
    },
    colors: ["#7C3AED", "#F27E56"],
    dataLabels: { enabled: false },
    xaxis: {
      categories: filteredData.map((d) => {
        const date = new Date(d.date);
        return date.toLocaleDateString("en-US", { day: "numeric", month: "short" });
      }),
      labels: { style: { fontSize: "10px", colors: "#64748b" } },
    },
    yaxis: [
      {
        title: { text: "Revenue", style: { color: "#7C3AED" } },
        labels: {
          formatter: (val) => `$${Math.round(val).toLocaleString()}`,
          style: { colors: "#64748b" },
        },
      },
      {
        opposite: true,
        title: { text: "Orders", style: { color: "#F27E56" } },
        labels: {
          formatter: (val) => Math.round(val).toString(),
          style: { colors: "#64748b" },
        },
      },
    ],
    grid: { strokeDashArray: 4, borderColor: "#f1f5f9" },
    legend: { position: "top", horizontalAlign: "right" },
    tooltip: {
      shared: true,
      intersect: false,
      y: {
        formatter: (val: number, opts?: any) => 
          opts?.seriesIndex === 0 ? `$${val.toLocaleString()}` : `${val} Orders`
      }
    }
  };

 

  if (loading) {
    return (
      <div className="h-[350px] flex items-center justify-center bg-card rounded-xl border border-dashed">
        <Loader2 className="animate-spin h-8 w-8 text-primary" />
      </div>
    );
  }

  return (
    <div className="w-full bg-card rounded-xl">
      {/* HEADER */}
      <div className="flex flex-col md:flex-row md:p-4 p-4 md:justify-between md:items-center gap-4">
        <div>
          <h1 className="text-lg font-semibold">Sales & Orders Trend</h1>
          <p className="text-sm text-muted-foreground">
            Daily performance breakdown for revenue and total orders
          </p>
        </div>

        {/* CONTROLS */}
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-2 bg-muted/50 px-3 py-1.5 rounded-lg border">
            <span className="text-xs font-medium">Year</span>
            <select
              value={selectedYear}
              onChange={(e) => setSelectedYear(e.target.value)}
              className="bg-transparent text-xs focus:outline-none font-bold"
            >
              {["2026", "2025", "2024"].map((y) => (
                <option key={y} value={y}>{y}</option>
              ))}
            </select>
          </div>

        <Tabs value={selectedRange} onValueChange={setSelectedRange} className="w-auto">
            <TabsList className="bg-muted">
              <TabsTrigger value="12months" className="text-xs">All</TabsTrigger>
              <TabsTrigger value="30days" className="text-xs">30D</TabsTrigger>
              <TabsTrigger value="7days" className="text-xs">7D</TabsTrigger>
            </TabsList>
          </Tabs>
        </div>
      </div>

      {/* CHART */}
      <div className="p-2 md:p-4 w-full">
        {filteredData.length > 0 ? (
          <Chart key={`${selectedRange}-${selectedYear}`} 
            options={options}
            series={chartSeries}
            type="bar"
            height={chartHeight} />
        ) : (
          <div className="h-62.5 flex items-center justify-center text-muted-foreground italic">
            No sales data available for this selection.
          </div>
        )}
      </div>
    </div>
  );
};

export default AppBarChart;