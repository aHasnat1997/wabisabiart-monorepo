import { DollarSign, Download, PanelTopOpen, TrendingUp } from "lucide-react";
import StatCardList from "../../components/CardList";
import AppAreaChart from "./components/AppAreaChart";
import { Card } from "@/components/ui/card";
import RevenueBreakDown from "./components/RevenueBreakDown";
import { IncomeSummaryCard } from "./components/InComeSummary";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { OrderBarChart } from "./components/OrderBarChart";
import OrderLineChart from "./components/OrderLineChart";
import { getsalesIncome } from "../components/InsightsAction";


const SalesAndIncome = async () => {

    const salesdata = await getsalesIncome();
      // console.log("Sales and Income Data:", salesdata);
      
 
 const salesAndIncome = [
  {
    id: 1,
    ctitle: "Total Revenue",
    value: salesdata?.data?.totalRevenue || 0,
    prefix: "$",
    badge: salesdata ? `+${Number(salesdata.data.totalRevenue) - 10000} vs yesterday` : "" ,
    icon: <DollarSign className="w-4 h-4" />,
    color: "bg-[#6D8040] text-card",
    textColor: "bg-emerald-50 text-[#6D8040]",
    period: salesdata ? `+${Number(salesdata.data.totalRevenue) - 10000} vs yesterday` : "",
  },
  {
    id: 2,
    ctitle: "Total Orders",
    value: salesdata?.data?.totalOrders || 0,
    badge: salesdata ? `+${Number(salesdata.data.totalOrders) - 200} vs last week` : "",
    icon: <PanelTopOpen className="w-4 h-4" />,
    color: "bg-[#F59E0B] text-card",
    textColor: "bg-card text-[#F59E0B]",
    period: salesdata ? `+${Number(salesdata.data.totalOrders) - 200} vs last week` : "",
  },

  {
    id: 3,
    ctitle: "AVG Order Value",
    value: salesdata?.data?.averageOrderValue || 0,
    prefix: "$",
    badge: salesdata ? `+${Number(salesdata.data.averageOrderValue) - 100} vs last month` : "",
    icon: <TrendingUp className="w-4 h-4" />,
    color: "bg-[#3B82F6] text-purple-600",
    textColor: "bg-card text-[#3B82F6]",
    period: salesdata ? `+${Number(salesdata.data.averageOrderValue) - 100} vs last month` : "",
  },
  // {
  //   id: 4,
  //   ctitle: "Net Income",
  //   value: salesdata?.data?.netIncome || 0,
  //   prefix: "$",
  //   badge: salesdata ? `+${Number(salesdata.data.netIncome) - 1000} vs last month` : "",
  //   icon: <PanelTopOpen className="w-4 h-4" />,
  //   color: "bg-[#EF4444] text-red-100",
  //   textColor: "bg-card text-[#EF4444]",
  //   period: salesdata ? `+${Number(salesdata.data.netIncome) - 1000} vs last month` : "",
  // },
];

  return (
    <div>
      <div className="">
        <StatCardList
          dtitle="Sales & Income"
          description="Detailed revenue and sales performance"
          actionIcon={<Download className="h-4 w-4" />}
          items={salesAndIncome}
        />
      </div>

      <div>
        <Tabs defaultValue="Revenue">
          <TabsList className="bg-card">
            <TabsTrigger value="Revenue">Revenue</TabsTrigger>
            <TabsTrigger value="Orders">Orders</TabsTrigger>
            <TabsTrigger value="Avg Orders Value">Avg Orders Value</TabsTrigger>
          </TabsList>
          <TabsContent value="Revenue">
            <div>
              <Card className="md:p-8 p-1 mt-6 hover:shadow-md transition">
                <AppAreaChart />
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="Orders">
            <div>
              <Card className="md:p-8  mt-6 hover:shadow-md transition">
                <OrderBarChart></OrderBarChart>
              </Card>
            </div>
          </TabsContent>
          <TabsContent value="Avg Orders Value">
            <div>
              <Card className="md:p-8 mt-6 hover:shadow-md transition">
                <OrderLineChart></OrderLineChart>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>

      <div className="mt-6 grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div>
          <Card>
            <RevenueBreakDown></RevenueBreakDown>
          </Card>
        </div>
        <div>
          <Card>
            <IncomeSummaryCard></IncomeSummaryCard>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default SalesAndIncome;
