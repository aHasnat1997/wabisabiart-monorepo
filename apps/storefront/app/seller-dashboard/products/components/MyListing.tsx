
import {  Package, CheckCircle, AlertTriangle, FileText } from "lucide-react";
import StatCardList from "../../components/CardList";
import ListingTable from "./ListingTable";
import { getProductStats } from "./Action";
import SectionTitle from "@/components/SectionTitle";


const MyListing = async ({
  searchParams,
}: {
  searchParams?: Promise<{ page?: string; status?: string }> | { page?: string; status?: string };
}) => {
  const stats = await getProductStats();
  console.log("Product stats:", stats);
   const params = await searchParams;
  const activeStatus = params?.status ?? "";

  const productStats = [
  {
    id: 1,
    ctitle: "Total Products",
    value: stats?.totalProducts ?? 0,
    icon: <Package className="w-6 h-6" />,
    color: "bg-chart-4 text-card",
    textColor: "bg-emerald-50 text-primary",
    status: "",  
  },
  {
    id: 2,
    ctitle: "Active Listings",
    value: stats?.activeProducts ?? 0,
    icon: <CheckCircle className="w-6 h-6" />,
    color: "bg-primary text-card",
    textColor: "bg-card text-primary",
    status: "active",  
  },
  
    {
    id: 5,
    ctitle: "Pending Review",
    value: stats?.pendingReviewProducts ?? 0,
    icon: <FileText className="w-6 h-6" />,
    color: "bg-chart-8 text-card",
    textColor: "bg-card text-primary",
    status: "pending_review",
  },
  
  {
    id: 4,
    ctitle: "Drafts",
    value: stats?.draftProducts ?? 0,
    icon: <FileText className="w-6 h-6" />,
    color: "bg-chart-7 text-card",
    textColor: "bg-card text-primary",
    status: "draft",
  },
  {
    id: 3,
    ctitle: "Low Stock",
    value: stats?.lowStockProducts ?? 0,
    icon: <AlertTriangle className="w-6 h-6" />,
    color: "bg-destructive text-card",
    textColor: "bg-card text-primary",
    status: "low_stock",
  },
];

  return (
    <div className="flex flex-col gap-4 pb-4">
     
      <SectionTitle title="My Listing" subtitle="Manage your product listings and inventory"/>
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 mb-6 gap-4 w-full">
  {productStats.map((stat) => (
    <StatCardList
      key={stat.id}
      ctitle={stat.ctitle}
      value={stat.value}
      icon={stat.icon}
      color={stat.color}
      textColor={stat.textColor}
       status={stat.status}
    />
  ))}
</div>
      
      <ListingTable searchParams={searchParams} />
    </div>
  );
};

export default MyListing;