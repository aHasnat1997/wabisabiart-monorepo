"use client";

import dynamic from "next/dynamic";
import { useEffect, useMemo, useState } from "react";
import { getCustomerByCategory } from "./InsightsAction";

const Chart = dynamic(() => import("react-apexcharts"), { ssr: false });

interface CategoryData {
  categoryName: string;
  totalSales: number;
}

const colors = ["var(--chart-1)", "var(--chart-2)", "var(--chart-3)", "var(--chart-4)", "var(--chart-5)"];

const InSightsSellerPieChart = () => {
  const [chartData, setChartData] = useState<number[]>([]);
  const [chartLabels, setChartLabels] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await getCustomerByCategory();
        // Validation: Response data asholei array kina check kora
        if (response?.success && Array.isArray(response?.data)) {
          const apiData = response.data as unknown as CategoryData[];
          
          // NaN prothirodh korar jonno default value (0) use kora hoyeche
          const sales = apiData.map((item) => Number(item.totalSales) || 0);
          const names = apiData.map((item) => item.categoryName || "Unknown");

          setChartData(sales);
          setChartLabels(names);
        }
      } catch (error) {
        console.error("Failed to load insights:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const totalSalesCount = useMemo(() => {
    return chartData.reduce((acc, curr) => acc + (curr || 0), 0);
  }, [chartData]);

  const options: ApexCharts.ApexOptions = useMemo(() => ({
    chart: { 
      type: "donut",
      animations: { enabled: true }
    },
    labels: chartLabels.length > 0 ? chartLabels : ["No Data"],
    colors: colors,
    legend: { show: false },
    dataLabels: { enabled: false },
    stroke: { show: false },
    plotOptions: { 
      pie: { 
        donut: { 
          size: "70%",
          labels: {
            show: true,
            total: {
              show: true,
              label: "Total Sales",
              // Ekhane value check kora hoyeche jate NaN na dekhay
              formatter: () => String(totalSalesCount)
            }
          }
        } 
      } 
    },
    tooltip: { 
      y: { formatter: (val) => `${val || 0} Units Sold` } 
    },
    noData: { 
      text: "Loading data...",
      align: 'center',
      verticalAlign: 'middle',
    }
  }), [chartLabels, totalSalesCount]);

  if (loading) {
    return (
      <div className="h-72 flex items-center justify-center">
        <div className="animate-spin h-6 w-6 border-4 border-muted-foreground/30 rounded-full border-t-primary"></div>
      </div>
    );
  }

  return (
    <div className="p-4">
      <div className="mb-4">
        <h1 className="text-lg font-bold">Sales By Category</h1>
        <p className="text-sm text-muted-foreground">Revenue Distribution</p>
      </div>

      <div className="min-h-[250px] flex justify-center items-center">
        {chartData.length > 0 ? (
          <Chart options={options} series={chartData} type="donut" width={320} />
        ) : (
          <div className="text-sm text-muted-foreground italic py-10">No sales data found</div>
        )}
      </div>

      {/* Legend Grid - Legend-e key use kora hoyeche jate mapping error na hoy */}
      <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-2 text-sm">
        {chartLabels.map((label, index) => (
          <div key={`${label}-${index}`} className="flex items-center justify-between">
            <div className="flex items-center gap-2 overflow-hidden">
              <span
                className="h-2.5 w-2.5 rounded-full shrink-0"
                style={{ backgroundColor: colors[index % colors.length] }}
              />
              <span className="text-muted-foreground truncate max-w-[140px]">{label}</span>
            </div>
            <span className="font-semibold">{chartData[index] || 0}</span>
          </div>
        ))}
      </div>
    </div>
  );
};

export default InSightsSellerPieChart;