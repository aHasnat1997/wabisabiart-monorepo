"use client";

import Image from "next/image";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import tableImage from "@/assets/images/dashboardImages/ImageWithFallback.png";
import { useEffect, useState } from "react";
import { getsalesIncome, getTopSellingProducts } from "./InsightsAction";
import { get } from "http";
import { getImageUrl } from "../../products/components/getImageUrl";

/* -------------------- Types -------------------- */
type RevenueColor = "purple" | "orange" | "green";

interface Product {
  id: string;
  title: string;
  imageUrl: string;
  totalSold: number;
  totalRevenue: string;
  averageRating: string;
}

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

/* -------------------- Component -------------------- */
export default function InSightsCards() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [data , setData] = useState<RevenueData | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await getTopSellingProducts();
        console.log("Top Selling Products API Response:", res);
        if (res && res.success) {
          setProducts(res.data as Product[]);
        }
      } catch (error) {
        console.error("Error fetching top selling products:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  useEffect(() => {
    const fetchRevenueData = async () => {

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
        console.error("Error fetching sales income:", error);
      }finally {
        setLoading(false);
      }

    }
    fetchRevenueData();
  }, []);

  if (loading) {
    return <div>Loading...</div>;
  }

  const breakdown = data?.revenueBreakdown || {productSales: "0", shippingFees: "0", tips: "0"};
  const totalRevenue = Number(data?.totalRevenue || 0);

  const getPercent = (value: string | number) => {
   if (!totalRevenue || Number(totalRevenue) === 0) return 0;
   const percentage = (Number(value) / Number(totalRevenue)) * 100;
    return Math.round(percentage);
  };


  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* ---------------- Top Selling Products ---------------- */}
      <Card className="rounded-2xl">
        <CardHeader>
          <CardTitle>Top Selling Products</CardTitle>
          <CardDescription>Best performers this month</CardDescription>
        </CardHeader>

        <CardContent>
          {/* Header → desktop only */}
          <div className="hidden lg:grid grid-cols-[1fr_80px_150px_100px] font-semibold text-sm text-muted-foreground mb-6">
            <span>Product</span>
            <span className="text-right">Total Sold</span>
            <span className="text-right">Total Revenue</span>
            <span className="text-right">Status</span>
          </div>

          <div className="space-y-5">
            {products.map((p) => (
              <div key={p.id} className="space-y-3">
                {/* Desktop row */}
                <div className="hidden lg:grid grid-cols-[1fr_80px_150px_100px] items-center gap-4">
                  <div className="flex items-center gap-3">
                    {/* Image Wrapper with fixed size */}
                    <div className="relative h-9 w-9 shrink-0 overflow-hidden rounded-md border bg-muted">
                      <Image
                        src={getImageUrl(p.imageUrl)}
                        alt={p.title}
                        fill
                        sizes="36px"
                        className="object-cover"
                      />
                    </div>

                    {/* Title */}
                    <span className="text-sm font-medium truncate max-w-[150px]">
                      {p.title}
                    </span>
                  </div>

                  <span className="text-sm text-right">{p.totalSold}</span>
                  <span className="text-sm text-right">${p.totalRevenue}</span>

                  <div className="flex justify-end">
                    <Badge
                      variant="outline"
                      className="text-primary border-primary"
                    >
                      ✓ {p.averageRating}
                    </Badge>
                  </div>
                </div>

                {/* Mobile / Tablet card */}
                <div className="lg:hidden flex gap-4 items-start">
                  <Image
                    src={tableImage}
                    alt={p.title}
                    width={44}
                    height={44}
                    className="rounded-md shrink-0"
                  />

                  <div className="flex-1 space-y-2">
                    <p className="text-sm font-medium truncate">{p.title}</p>

                    <div className="flex justify-between text-xs text-muted-foreground">
                      <span>Sold: {p.totalSold}</span>
                      <span>${p.totalRevenue}</span>
                    </div>

                    <Badge
                      variant="outline"
                      className="text-primary border-primary text-xs w-fit"
                    >
                      ✓ {p.averageRating}
                    </Badge>
                  </div>
                </div>

                <hr />
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* ---------------- Revenue Breakdown ---------------- */}
      <Card className="rounded-2xl">
        <CardHeader>
          <CardTitle>Revenue Breakdown</CardTitle>
        </CardHeader>

        <CardContent className="space-y-4">
          <RevenueItem
            label="Product Sales"
            value={Number(breakdown.productSales)}
            percent={getPercent(breakdown.productSales)}
            color="purple"
          />
          <RevenueItem
            label="Shipping Fees"
            value={Number(breakdown.shippingFees)}
            percent={getPercent(breakdown.shippingFees)}
            color="orange"
          />
          <RevenueItem
            label="Tips Received"
            value={Number(breakdown.tips)}
            percent={getPercent(breakdown.tips)}
            color="green"
          />

          <div className="border-t pt-4 space-y-3">
            <div className="flex justify-between text-sm font-medium">
              <span>Total Revenue</span>
              <span>${totalRevenue.toLocaleString()}</span>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="bg-primary/5 p-4 rounded-xl">
                <p className="text-sm text-muted-foreground">Gross Profit</p>
                <p className="text-lg font-semibold">${(totalRevenue * 0.7).toLocaleString()}</p>
                <p className="text-xs text-primary">{getPercent(totalRevenue * 0.7)}% margin</p>
              </div>

              <div className="bg-chart-8/5 p-4 rounded-xl">
                <p className="text-sm text-muted-foreground">Net Income</p>
                <p className="text-lg font-semibold">${(totalRevenue * 0.56).toLocaleString()}</p>
                <p className="text-xs text-chart-8">{getPercent(totalRevenue * 0.56)}% margin</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

/* ---------------- Revenue Item ---------------- */
function RevenueItem({
  label,
  value,
  percent,
  color,
}: {
  label: string;
  value: number;
  percent: number;
  color: RevenueColor;
}) {
  return (
    <div className="space-y-1">
      <div className="flex justify-between text-sm font-medium">
        <span>{label}</span>
        <span>${value.toLocaleString()}</span>
      </div>

      <div className="flex items-center gap-3">
        <Progress
          value={percent}
          className={`
            h-2
            [&>div]:transition-all
            [&>div]:duration-500
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
