"use client";

import { Card } from "@/components/ui/card";
import { CheckCircle2, Info } from "lucide-react";


interface WishlistProduct {
  productTitle: string;
  totalWishlists: number;
  conversions: number;
  conversionRate: string; 
}

interface WishListsCardProps {
  data: {
    topWishlistedProducts: WishlistProduct[];
  } | null;
}

const WishListsCard = ({ data }: WishListsCardProps) => {
  const products = data?.topWishlistedProducts || [];

 
  const topPerformer = products.length > 0
    ? [...products].sort((a, b) => parseFloat(b.conversionRate) - parseFloat(a.conversionRate))[0]
    : null;

  const opportunity = products.length > 0
    ? [...products].sort((a, b) => {
        if (b.totalWishlists !== a.totalWishlists) {
          return b.totalWishlists - a.totalWishlists;
        }
        return parseFloat(a.conversionRate) - parseFloat(b.conversionRate);
      })[0]
    : null;

   

  // Fallback if no data exists yet
  if (products.length === 0) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Card className="p-4 border-dashed text-center text-muted-foreground text-sm">
          No wishlist data available to analyze performers.
        </Card>
        <Card className="p-4 border-dashed text-center text-muted-foreground text-sm">
          No opportunities identified yet.
        </Card>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
      {/* Top Performer */}
      {topPerformer && (
        <Card className="flex flex-col sm:flex-row gap-4 p-4 rounded-xl border border-pink-100 bg-chart-4/10">
          <div className="flex h-10 w-10 sm:h-8 sm:w-8 items-center justify-center rounded-full bg-card shrink-0">
            <CheckCircle2 className="h-6 w-6 sm:h-4 sm:w-4 text-primary" />
          </div>

          <div className="space-y-1">
            <p className="text-sm font-medium text-foreground">Top Performer</p>
            <p className="text-sm text-muted-foreground">
              <span className="font-medium text-foreground">{topPerformer.productTitle}</span>{" "}
              has the highest conversion rate at{" "}
              <span className="font-medium text-foreground">
                {parseFloat(topPerformer.conversionRate).toFixed(1)}%
              </span>
            </p>
            <p className="text-xs text-muted-foreground">
              Consider promoting similar products or running targeted campaigns
            </p>
          </div>
        </Card>
      )}

      {/* Opportunity */}
      {opportunity && (
        <Card className="flex flex-col sm:flex-row gap-4 p-4 rounded-xl border border-chart-8/10 bg-secondary-foreground/15">
          <div className="flex h-10 w-10 sm:h-8 sm:w-8 items-center justify-center rounded-full bg-card shrink-0">
            <Info className="h-6 w-6 sm:h-4 sm:w-4 text-chart-8" />
          </div>

          <div className="space-y-1">
            <p className="text-sm font-medium text-foreground">Opportunity</p>
            <p className="text-sm text-muted-foreground">
              <span className="font-medium text-foreground">{opportunity.productTitle}</span>{" "}
              has{" "}
              <span className="font-medium text-foreground">
                {opportunity.totalWishlists} wishlist adds
              </span>{" "}
              but only <span className="font-medium text-foreground">{parseFloat(opportunity.conversionRate).toFixed(1)}%</span>{" "}
              conversion
            </p>
            <p className="text-xs text-muted-foreground">
              Send reminder emails or offer limited-time discounts to boost conversions
            </p>
          </div>
        </Card>
      )}
    </div>
  );
};

export default WishListsCard;