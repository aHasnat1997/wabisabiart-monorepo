"use client";

import { Card } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import Image from "next/image";
import { TopProductItem } from "@/types/sellerDashboard/TableData";
import tableImage1 from "@/assets/images/dashboardImages/ImageWithFallback (1).png";
import { useEffect, useState } from "react";
import { getTopSellingProducts } from "../../components/InsightsAction";
import { Loader2 } from "lucide-react";
import { getImageUrl } from "@/app/seller-dashboard/products/components/getImageUrl";

interface Product {
  id: string;
  title: string;
  imageUrl: string;
  totalSold: number;
  totalRevenue: string;
  averageRating: string;
}
/* ---------------- Table Data ---------------- */
// const productsData: TopProductItem[] = [
//   {
//     product: "Wireless Headphones",
//     sold: 86,
//     revenue: 3440,
//     status: "Verified",
//   },
//   { product: "Smart Watch", sold: 64, revenue: 2880, status: "Excellent" },
//   { product: "Gaming Mouse 122", sold: 29, revenue: 870, status: "Average" },
//   { product: "Bluetooth Speaker", sold: 112, revenue: 4480, status: "Good" },
// ];

/* ---------------- Component ---------------- */
const ProductsTable = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

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

  // const getBadgeClass = (status: string) => {
  //   switch (status) {
  //     case "Verified":
  //       return "bg-primary/10 text-primary";
  //     case "Good":
  //       return "bg-chart-8/10 text-chart-8";
  //     case "Excellent":
  //       return "bg-green-500/10 text-green-500";
  //     default:
  //       return "bg-chart-7/10 text-chart-7";
  //   }
  // };

  if (loading) {
    return (
      <Card className="p-10 flex justify-center items-center">
        <Loader2 className="h-6 w-6 animate-spin text-primary" />
      </Card>
    );
  }

  return (
    <Card className="p-4 space-y-4">
      {/* Header */}
      <div className="">
        <h1 className="text-lg font-semibold">Top Selling Products</h1>
        <p className="text-sm text-muted-foreground">
          Best performers this month
        </p>
      </div>

      {/* Desktop Table */}
      <div className="hidden md:hidden md:space-y-2 lg:block overflow-x-auto w-full">
        <Table className="w-full min-w-150">
          <TableHeader>
            <TableRow>
              <TableHead className="text-left font-semibold">Product</TableHead>
              <TableHead className="text-center font-semibold">
                Total Sold
              </TableHead>
              <TableHead className="text-right font-semibold">
                Total Revenue
              </TableHead>
              <TableHead className="text-right font-semibold">Status</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {products.map((item) => (
              <TableRow key={item.id}>
                <TableCell className="font-medium">
                  <div className="flex items-center gap-3">
                    <div className="relative h-9 w-9 shrink-0 overflow-hidden rounded-md border bg-muted">
                      <Image
                        src={getImageUrl(item.imageUrl)}
                        alt={item.title}
                        fill
                        className="object-cover"
                        sizes="36px"
                      />
                    </div>

                   
                    <span className="line-clamp-1 max-w-[200px]">
                      {item.title}
                    </span>
                  </div>
                </TableCell>
                <TableCell className="text-center font-medium">
                  {item.totalSold}
                </TableCell>
                <TableCell className="text-right font-medium">
                  ${item.totalRevenue}
                </TableCell>
                <TableCell className="text-right">
                  {/* <Badge
                    className={
                      item. === "Verified"
                        ? "bg-primary/10 text-primary"
                        : item.status === "Good"
                          ? "bg-chart-8/10 text-chart-8"
                          : "bg-chart-7/10 text-chart-7"
                    }
                  >
                    {item.status}
                  </Badge> */}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      {/* Mobile Cards */}
      <div className="lg:hidden  sm:block  flex flex-col gap-4">
        {products.map((item) => (
          <Card key={item.id} className="p-4">
            <div className="flex justify-between mb-2">
              <div className="flex items-center gap-3">
                    <div className="relative h-9 w-9 shrink-0 overflow-hidden rounded-md border bg-muted">
                      <Image
                        src={getImageUrl(item.imageUrl)}
                        alt={item.title}
                        fill
                        className="object-cover"
                        sizes="36px"
                      />
                    </div>

                   
                    <span className="line-clamp-1 max-w-[200px]">
                      {item.title}
                    </span>
                  </div>
              {/* <Badge
                className={
                  item.status === "Verified"
                    ? "bg-primary/10 text-primary"
                    : item.status === "Good"
                      ? "bg-chart-8/10 text-chart-8"
                      : "bg-chart-7/10 text-chart-7"
                }
              >
                {item.status}
              </Badge> */}
            </div>

            <div className="flex justify-between text-sm">
              <span>Total Sold</span>
              <span>{item.totalSold}</span>
            </div>

            <div className="flex justify-between text-sm mt-1">
              <span>Revenue</span>
              <span>${item.totalRevenue.toLocaleString()}</span>
            </div>
          </Card>
        ))}
      </div>
    </Card>
  );
};

export default ProductsTable;
