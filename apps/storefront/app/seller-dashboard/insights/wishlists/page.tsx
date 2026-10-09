"use client";

import React, { useEffect, useState } from "react";
import StatCardList from "../../components/CardList";
import { DollarSign, Heart, PanelTopOpen, Percent } from "lucide-react";
import WishListsTable from "./components/WishListsTable";
import WishListsCard from "./components/WishListsCard";
import { getwishListAnalytics } from "../components/InsightsAction";
import { WishlistAnalyticsData } from "@/types/sellerDashboard/Marketting";


const Wishlists = () => {
  const [analytics, setAnalytics] = useState<WishlistAnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await getwishListAnalytics();
        if (res.success) {
          setAnalytics(res.data);
        }
      } catch (err) {
        console.error("Failed to load wishlist analytics", err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  // Transform API data into the StatCard format
  const wishlistStats = [
    {
      id: 1,
      ctitle: "Total Wishlists",
      value: analytics?.totalWishlists || 0,
      badge: analytics?.wishlistGrowth || "0%",
      icon: <Heart className="w-4 h-4" />,
      color: "bg-[#6D8040] text-card",
      textColor: "bg-emerald-50 text-[#6D8040]",
      period: "Total items saved by users",
    },
    {
      id: 2,
      ctitle: "Conversions",
      value: analytics?.wishlistConversions || 0,
      badge: "In period",
      icon: <PanelTopOpen className="w-4 h-4" />,
      color: "bg-[#F59E0B] text-card",
      textColor: "bg-card text-[#F59E0B]",
      period: "Converted to successful sales",
    },
    {
      id: 3,
      ctitle: "Conversion Rate",
      value: analytics?.conversionRate || "0%",
      badge: "Avg",
      icon: <Percent className="w-4 h-4" />,
      color: "bg-[#EF4444] text-red-100",
      textColor: "bg-card text-[#EF4444]",
      period: "Wishlist to Cart performance",
    },
    {
      id: 4,
      ctitle: "Top Product Count",
      value: analytics?.topWishlistedProducts?.length || 0,
      badge: "Active",
      icon: <DollarSign className="w-4 h-4" />,
      color: "bg-[#3B82F6] text-purple-600",
      textColor: "bg-card text-[#3B82F6]",
      period: "Trending products in wishlists",
    },
  ];

  if (loading) return <div className="p-10 text-center">Loading Analytics...</div>;

  return (
    <div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 mb-6 gap-4 w-full">
  {wishlistStats.map((stat) => (
    <StatCardList
      key={stat.id}
      ctitle={stat.ctitle}
      value={stat.value}
      icon={stat.icon}
      color={stat.color}
      textColor={stat.textColor}
      badge={stat.badge}
      period={stat.period}
    />
  ))}
</div>

      <div className="mt-8">
        {/* Pass data to Table if it accepts it, otherwise it can fetch its own */}
        <WishListsTable data={analytics?.topWishlistedProducts} />
      </div>

      <div className="mt-6">
        {/* Pass the full analytics data to your Card component */}
        <WishListsCard data={analytics} />
      </div>
    </div>
  );
};

export default Wishlists;