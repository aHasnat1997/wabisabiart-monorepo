"use client";

import { ImportHistoryItem } from "@/types/sellerDashboard/ImportReview";
import { Card, CardContent } from "@/components/ui/card";
import { CheckCircle2, Package } from "lucide-react";
import { cn } from "@/lib/utils";

interface Props {
  items: ImportHistoryItem[];
}

export function ImportHistoryList({ items }: Props) {
  return (
    <div className="space-y-3 p-4">
      <h2 className="mb-4 text-sm font-medium ml-2">Import History</h2>
      {items.map((item) => {
        // Determine colors based on source
        const bgColor = item.source.includes("shopify")
          ? "bg-primary/5"
          : item.source.includes("etsy")
          ? "bg-chart-3/10"
          : "bg-chart-4/5";

        const textColor = item.source.includes("shopify")
          ? "text-primary"
          : item.source.includes("etsy")
          ? "text-chart-3"
          : "text-chart-4";

        return (
        <Card
  key={item.id}
  className="flex items-start justify-between p-4 transition-shadow hover:shadow-md"
>
  <div className="flex-1"> {/* <-- Add flex-1 here */}
    <CardContent className="flex items-center gap-4 p-0">
      {/* Icon */}
      <div className={cn("p-3 rounded-lg", bgColor, textColor)}>
        <Package size={20} />
      </div>

      {/* Source + Date + Review Count */}
      <div className="flex flex-col">
        <span className="font-medium text-sm text-foreground">{item.source}</span>
        <span className="text-xs text-muted-foreground mt-0.5">
          {new Date(item.importedAt).toLocaleDateString()} • {item.reviewCount.toLocaleString()} reviews
        </span>
      </div>
    </CardContent>
  </div>

  {/* Status */}
  <div>
    <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-semibold bg-primary/5 text-primary">
      <CheckCircle2 size={12} /> {item.status}
    </span>
  </div>
</Card>

        );
      })}
    </div>
  );
}
