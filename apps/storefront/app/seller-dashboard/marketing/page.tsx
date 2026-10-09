import StatCardList from "../components/CardList";
import { Megaphone, Percent, Store, Truck } from "lucide-react";
import PromotionCard from "./components/PromotionItems";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/animate-ui/components/buttons/button";
import Link from "next/link";

import {
  getAllPromotions,
  getPromotionStats,
} from "./components/PromotionAction";
import SectionTitle from "@/components/SectionTitle";

export const dynamic = "force-dynamic";

const Marketing = async () => {
  const stats = await getPromotionStats();
  // console.log("Marketting  stats:", stats)

  const promotions = await getAllPromotions();
  const totalRevenue = promotions.reduce((sum, promo) => {
    const numericRevenue = Number(promo.revenue.replace(/[^0-9.-]+/g, "")) || 0;
    return sum + numericRevenue;
  }, 0);

  const marketingStats = [
    {
      id: 1,
      ctitle: "Active Promotion",
      value: stats?.activePromotions ?? 0,
      // badge: "+5% this month",
      icon: <Megaphone className="w-4 h-4" />,
      color: "bg-[#6D8040] text-card",
      textColor: "bg-emerald-50 text-[#6D8040]",
    },
    {
      id: 2,
      ctitle: "Total Discount Given",
      value: stats?.totalDiscountsGiven ?? 0,
      // badge: "+12% this week",
      icon: <Percent className="w-4 h-4" />,
      color: "bg-[#F59E0B] text-card",
      textColor: "bg-card text-[#F59E0B]",
    },
    {
      id: 3,
      ctitle: "Coupon Redemption",
      value: stats?.couponRedemptions ?? 0,
      // badge: "Open Rate: 45%",
      icon: <Store className="w-4 h-4" />,
      color: "bg-[#EF4444] text-card",
      textColor: "bg-card text-[#EF4444]",
    },
    {
      id: 4,
      ctitle: "Free Shipping Orders",
      value: stats?.freeShippingOrders ?? 0,
      // badge: "+8% vs last month",
      icon: <Truck className="w-4 h-4" />,
      color: "bg-[#3B82F6] text-card",
      textColor: "bg-card text-[#3B82F6]",
    },
  ];

  return (
    <div>
      {/* Marketing Overview Stats */}
      {/* <StatCardList
        dtitle="Marketing Overview"
        description="Manage promotions, discounts, and marketing campaigns"
        items={marketingStats}
      /> */}

      <SectionTitle
        title="Marketing Overview"
        subtitle="Manage promotions, discounts, and marketing campaigns"
      />

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 mb-6 gap-4 w-full">
        {marketingStats.map((stat) => (
          <StatCardList
            key={stat.id}
            ctitle={stat.ctitle}
            value={stat.value}
            icon={stat.icon}
            color={stat.color}
            textColor={stat.textColor}
          ></StatCardList>
        ))}
      </div>

      <Card className="p-2 sm:p-4 space-y-4">
        {/* Header */}
        <div className="flex flex-col sm:flex-row gap-3 sm:items-center sm:justify-between">
          <div>
            <h1 className="text-popover-foreground font-semibold text-base sm:text-lg">
              Promotion & Discount
            </h1>
            <p className="text-muted-foreground text-xs sm:text-sm">
              {promotions.length} campaigns • Total revenue: $
              {totalRevenue.toLocaleString()}
            </p>
          </div>

          <Link href="?create-promotion-modal=create-promotion">
            <Button className="bg-primary text-card w-full sm:w-auto">
              + Create Promotion
            </Button>
          </Link>
        </div>

        {/* Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {promotions.length === 0 ? (
            <p>No promotions found.</p>
          ) : (
            promotions.map((promo) => (
              <PromotionCard key={promo.id} promo={promo} />
            ))
          )}
        </div>
      </Card>
    </div>
  );
};
export default Marketing;
