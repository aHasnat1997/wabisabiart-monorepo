import AppBarChart from "@/app/seller-dashboard/components/BarChart";
import StatCardList from "@/app/seller-dashboard/components/CardList";
import InfoCard from "@/app/seller-dashboard/components/InfoCard";
import SectionTitle from "@/components/SectionTitle";
import {
  RecentActivityItem,
  RequireAttentionItem,
} from "@/types/sellerDashboard/CardItems";
import { DollarSign, Package, ShoppingCart, TrendingUp } from "lucide-react";


export default  function SellerDashboard() {

  return (
    <div>
      <SectionTitle
        title="Dashboard Overview"
        subtitle="Overview of your store performance and key metrics"
      />
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 mb-6 gap-4 w-full">
        {stats.map((stat) => (
          <StatCardList
            key={stat.id}
            ctitle={stat.ctitle}
            value={stat.value}
            prefix={stat.prefix}
            badge={stat.badge}
            icon={stat.icon}
            color={stat.color}
            textColor={stat.textColor}
          />
        ))}
      </div>

      <div className="mb-6">
        <AppBarChart />
      </div>

      <div className="mt-2 grid  grid-cols-1 md:grid-cols-2 gap-4">
        <InfoCard<RequireAttentionItem>
          title="Require Attention"
          items={requireAttentionData}
          variant="require"
        />

        <InfoCard<RecentActivityItem>
          title="Recent Activity"
          items={recentActivityData}
          variant="recent"
        />
      </div>
    </div>
  );
}


const stats = [
  {
    id: 1,
    ctitle: "Today's Revenue",
    value: 1240,
    prefix: "$",
    badge: "+12.5%",
    icon: <DollarSign className="w-4 h-4" />,
    color: "bg-[#6D8040] text-card",
    textColor: "bg-emerald-50 text-[#6D8040]",
  },
  {
    id: 2,
    ctitle: "Pending Orders",
    value: 12,
    badge: "Need Attention",
    icon: <ShoppingCart className="w-4 h-4" />,
    color: "bg-[#F59E0B] text-card",
    textColor: "bg-card text-[#F59E0B]",
  },
  {
    id: 3,
    ctitle: "Low Stock",
    value: 5,
    badge: "Restock Needed",
    icon: <Package className="w-4 h-4" />,
    color: "bg-[#EF4444] text-red-100",
    textColor: "bg-card text-[#EF4444]",
  },
  {
    id: 4,
    ctitle: "This Month",
    value: 1842,
    prefix: "$",
    badge: "+23.1%",
    icon: <TrendingUp className="w-4 h-4" />,
    color: "bg-[#3B82F6] text-muted",
    textColor: "bg-card text-[#3B82F6]",
  },
  
];
const requireAttentionData: RequireAttentionItem[] = [
  {
    name: "2 Past Due Orders",
    status: "View Orders",
    description: "Orders require immediate shipment update",
    bgColor: "#FEF2F2",
  },
  {
    name: "Pending Refunds",
    status: "Process Now",
    description: "Customer refund requests awaiting approval",
    bgColor: "#FFF7ED",
  },
  {
    name: "Payment Failed",
    status: "View Inventory",
    description: "Multiple payment attempts failed for recent orders",
    bgColor: "#FFF7ED",
  },
];

const recentActivityData: RecentActivityItem[] = [
  {
    name: "New Order #1234",
    info: "Jasmin Reed - Handwoven Indigo Scarf",
    time: "2 minutes ago",
  },
  {
    name: "New Seller Registered",
    info: "Seller: Artisan Crafts Co.",
    time: "15 minutes ago",
  },
  {
    name: "Stock Updated",
    info: "Inventory adjusted for 5 products",
    time: "1 hour ago",
  },
 
];