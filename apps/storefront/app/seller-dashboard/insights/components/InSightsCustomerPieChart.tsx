"use client";

import { Loader2 } from "lucide-react";
import dynamic from "next/dynamic";
import { getCustomersByRegion } from "./InsightsAction";
import { useEffect, useState, useMemo } from "react";

// ApexCharts SSR safe import
const Chart = dynamic(() => import("react-apexcharts"), { ssr: false });

interface RegionData {
  region: string;
  customerCount: number;
}

const colors = ["var(--chart-4)", "var(--chart-5)", "var(--chart-6)", "#8884d8", "#82ca9d"];

const InSightsCustomerPieChart = () => {
  const [chartData, setChartData] = useState<number[]>([]);
  const [chartLabels, setChartLabels] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      try {
        const res = await getCustomersByRegion();
        if (res.success && res.data) {
          const apiData = res.data as unknown as RegionData[];
          // API field name 'customerCount' ekhane use kora hoyeche
          const counts = apiData.map((item) => Number(item.customerCount));
          const regions = apiData.map((item) => item.region);

          setChartData(counts);
          setChartLabels(regions);
        }
      } catch (error) {
        console.error("Error fetching customer data:", error);
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, []);

  // Options ke useMemo diye define korle double rendering ba conflict hobe na
  const options: ApexCharts.ApexOptions = useMemo(() => ({
    chart: { type: "donut" },
    labels: chartLabels,
    colors: colors,
    legend: { show: false },
    dataLabels: { enabled: false },
    plotOptions: { 
      pie: { 
        donut: { 
          size: "60%",
          labels: {
            show: true,
            total: {
              show: true,
              label: "Total",
              formatter: () => String(chartData.reduce((a, b) => a + b, 0))
            }
          }
        } 
      } 
    },
    tooltip: { y: { formatter: (val) => `${val} Customers` } },
    noData: { text: "No data found" }
  }), [chartLabels, chartData]);

  if (loading) {
    return (
      <div className="h-64 flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="p-4 ">
      <h1 className="text-lg font-bold">Customer By Region</h1>
      <p className="text-sm text-muted-foreground mb-4">
        Geographic Distribution
      </p>

      {/* Chart wrapper e height fixed kore dilam jate layout shift na hoy */}
      <div className="h-64 flex justify-center items-center">
        {chartData.length > 0 ? (
          <Chart options={options} series={chartData} type="donut" width={300} />
        ) : (
          <div className="text-muted-foreground">No data available</div>
        )}
      </div>

      {/* Legend section */}
      <div className="mt-6 grid grid-cols-2 gap-4 text-sm">
        {chartLabels.map((label, index) => (
          <div key={label} className="flex items-center gap-2 overflow-hidden">
            <span
              className="h-3 w-3 rounded-full shrink-0"
              style={{ backgroundColor: colors[index % colors.length] }}
            />
            <span className="text-muted-foreground truncate">{label}</span>
            <span className="font-medium ml-auto">{chartData[index]}</span>
          </div>
        ))}
      </div>
    </div>
  );
};

export default InSightsCustomerPieChart;