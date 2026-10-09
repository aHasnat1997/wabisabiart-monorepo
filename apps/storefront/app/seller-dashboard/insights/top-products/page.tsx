import {
  Box,
  ChartSpline,
  DollarSign,
  Download,
  TrendingUp,
} from "lucide-react";
import ProductCard from "./components/ProductCard";
import ProductsTable from "./components/ProductsTable";

const topProducts = [
  {
    id: 1,
    cTitle: "Total Products",
    value: "127",
    prefix: "$",
    icon: <Box className="w-4 h-4" />,
    color: "bg-chart-4/15 text-chart-4",
    textColor: "bg-card text-muted-foreground",
    period: "45 active products",
  },
  {
    id: 2,
    cTitle: "Best Seller",
    value: "Premium Headphones",
    icon: <TrendingUp className="w-4 h-4" />,
    color: "bg-chart-6/15 text-chart-6",
    textColor: "bg-card text-chart-6",
    period: "89 units sold",
  },

  {
    id: 3,
    cTitle: "Top Revenue",
    value: "26.611",
    prefix: "$",
    icon: <DollarSign className="w-4 h-4" />,
    color: "bg-chart-2/15 text-chart-2",
    textColor: "bg-card text-chart-2",
    period: "+From top 5 products",
  },
  {
    id: 4,
    cTitle: "Avg Rating",
    value: "4.5 ",
    prefix: "⭐",
    icon: <ChartSpline className="w-4 h-4" />,
    color: "bg-chart-1/15 text-chart-1",
    textColor: "bg-card text-muted-foreground",
    period: "From 234 reviews",
  },
];

const TopProducts = () => {
  return (
    <div>
      <div className="">
        <ProductCard
          pTitle="Sales & Income"
          pDescription="Detailed revenue and sales performance"
          actionIcon={<Download className="h-4 w-4" />}
          items={topProducts}
        />
      </div>
      <div>
        <ProductsTable></ProductsTable>
      </div>
    </div>
  );
};

export default TopProducts;
