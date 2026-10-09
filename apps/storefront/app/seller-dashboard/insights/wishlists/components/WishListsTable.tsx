"use client"

import { Card } from "@/components/ui/card"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Heart, PanelTopOpen } from "lucide-react"
import { Progress } from "@/components/ui/progress"
import { PerformanceStatus } from "@/types/sellerDashboard/TableData"
import { useState } from "react"

/* ---------------- Types ---------------- */
interface WishlistProduct {
  productTitle: string;
  totalWishlists: number;
  conversions: number;
  conversionRate: string; 
}

interface WishListsTableProps {
  data?: WishlistProduct[];
}

/* ---------------- Helpers ---------------- */
// Logic to determine status based on conversion percentage
const getStatus = (rate: number): PerformanceStatus => {
  if (rate >= 20) return "Excellent";
  if (rate >= 10) return "Good";
  return "Average";
};

const progressColor = (status: PerformanceStatus) => {
  if (status === "Excellent") return "[&>div]:bg-green-500"
  if (status === "Good") return "[&>div]:bg-chart-5"
  return "[&>div]:bg-yellow-500"
}

const iconColor = (status: PerformanceStatus) => {
  if (status === "Excellent") return "text-primary"
  if (status === "Good") return "text-blue-500"
  return "text-yellow-500"
}

/* ---------------- Component ---------------- */
const WishListsTable = ({ data = [] }: WishListsTableProps) => {
  const [searchTerm, setSearchTerm] = useState("");

  // Filter data based on search input
  const filteredData = data.filter(item => 
    item.productTitle.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <Card className="p-4">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-4">
        <h1 className="text-lg font-semibold">Product Performance</h1>

        <div className="flex items-center gap-2 text-sm">
          <span className="text-muted-foreground hidden sm:inline">Search:</span>
          <Input
            placeholder="Product name..."
            className="h-8 w-full sm:w-40"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      {/* Table wrapper for Desktop/Tablet */}
      <div className="hidden lg:block w-full overflow-x-auto">
        <Table className="w-full min-w-200">
          <TableHeader>
            <TableRow>
              <TableHead className="font-semibold text-left">Product</TableHead>
              <TableHead className="font-semibold text-center">Wishlist Adds</TableHead>
              <TableHead className="font-semibold text-left">Purchases</TableHead>
              <TableHead className="font-semibold text-right">Conversion</TableHead>
              <TableHead className="font-semibold text-right">Status</TableHead>
            </TableRow>
          </TableHeader>

          <TableBody>
            {filteredData.map((item) => {
              const rateNum = parseFloat(item.conversionRate);
              const status = getStatus(rateNum);

              return (
                <TableRow key={item.productTitle}>
                  <TableCell className="font-medium">{item.productTitle}</TableCell>
                  <TableCell className="text-center">
                    <div className="inline-flex items-center gap-2 whitespace-nowrap">
                      <Heart className="h-4 w-4 text-chart-6" />
                      {item.totalWishlists}
                    </div>
                  </TableCell>
                  <TableCell className="text-left">
                    <div className="inline-flex items-center gap-2 whitespace-nowrap">
                      <PanelTopOpen className={`h-4 w-4 ${iconColor(status)}`} />
                      {item.conversions}
                    </div>
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex flex-col items-end gap-1 min-w-25">
                      <Progress value={rateNum} className={`h-2 ${progressColor(status)}`} />
                      <span className="text-xs text-muted-foreground">{rateNum.toFixed(1)}%</span>
                    </div>
                  </TableCell>
                  <TableCell className="text-right">
                    <Badge className={
                        status === "Excellent" ? "bg-primary/10 text-primary" :
                        status === "Good" ? "bg-chart-8/10 text-chart-8" :
                        "bg-chart-7/10 text-chart-7"
                    }>
                      {status}
                    </Badge>
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </div>

      {/* Mobile Cards (Visible on smaller screens) */}
      <div className="lg:hidden flex flex-col gap-4">
        {filteredData.length === 0 && <p className="text-center text-muted-foreground py-4">No data found</p>}
        {filteredData.map(item => {
           const rateNum = parseFloat(item.conversionRate);
           const status = getStatus(rateNum);
           return (
            <Card key={item.productTitle} className="p-4 border-muted/50">
              <div className="flex justify-between mb-2">
                <span className="font-medium text-sm">{item.productTitle}</span>
                <Badge className={
                  status === "Excellent" ? "bg-primary/10 text-primary" :
                  status === "Good" ? "bg-chart-8/10 text-chart-8" :
                  "bg-chart-7/10 text-chart-7"
                }>{status}</Badge>
              </div>
              <div className="flex justify-between mb-3 text-sm">
                <span className="inline-flex items-center gap-2">
                  <Heart className="h-4 w-4 text-chart-6" /> {item.totalWishlists}
                </span>
                <span className="inline-flex items-center gap-2">
                  <PanelTopOpen className={`h-4 w-4 ${iconColor(status)}`} /> {item.conversions}
                </span>
              </div>
              <div className="space-y-1">
                <div className="flex justify-between text-xs text-muted-foreground">
                  <span>Conversion</span>
                  <span>{rateNum.toFixed(1)}%</span>
                </div>
                <Progress value={rateNum} className={`h-2 ${progressColor(status)}`} />
              </div>
            </Card>
           );
        })}
      </div>
    </Card>
  )
}

export default WishListsTable