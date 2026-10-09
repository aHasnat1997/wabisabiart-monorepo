import { DollarSign, PanelTopOpen, TrendingUp, UsersRound } from 'lucide-react';
import StatCardList from '../components/CardList';
import AppBarChart from '../components/BarChart';
import InSightsCards from './components/InSightsCard';
import { Card } from '@/components/ui/card';
import InSightsSellerPieChart from './components/InSightsSellerPieChart';
import InSightsCustomerPieChart from './components/InSightsCustomerPieChart';
import { getsalesIncome } from './components/InsightsAction';
import SectionTitle from '@/components/SectionTitle';

const Insights = async () => {
  const res = await getsalesIncome() as {
    data: {
      totalRevenue: string;
      totalOrders: number;
      averageOrderValue: string;
      revenueGrowth: string;
      ordersGrowth: string;
      revenueBreakdown: {
        productSales: string;
        shippingFees: string;
        tips: string;
      };
    };
  };

  const d = res?.data;

  const insights = [
    {
      id: 1,
      ctitle: "Total Revenue",
      value: parseFloat(d?.totalRevenue ?? "0"),
      prefix: "$",
      badge: d?.revenueGrowth ?? "0%",
      icon: <DollarSign className="w-4 h-4" />,
      color: "bg-[#6D8040] text-card",
      textColor: "bg-emerald-50 text-[#6D8040]",
      period: `Product sales: $${d?.revenueBreakdown?.productSales ?? "0"}`,
    },
    {
      id: 2,
      ctitle: "Total Orders",
      value: d?.totalOrders ?? 0,
      badge: d?.ordersGrowth ?? "0%",
      icon: <PanelTopOpen className="w-4 h-4" />,
      color: "bg-[#F59E0B] text-card",
      textColor: "bg-card text-[#F59E0B]",
      period: `${d?.totalOrders ?? 0} orders this period`,
    },
    {
      id: 3,
      ctitle: "Shipping Fees",
      value: parseFloat(d?.revenueBreakdown?.shippingFees ?? "0"),
      prefix: "$",
      badge: d?.revenueGrowth ?? "0%",
      icon: <UsersRound className="w-4 h-4" />,
      color: "bg-[#EF4444] text-red-100",
      textColor: "bg-card text-[#EF4444]",
      period: `Tips collected: $${d?.revenueBreakdown?.tips ?? "0"}`,
    },
    {
      id: 4,
      ctitle: "AVG Order Value",
      value: parseFloat(d?.averageOrderValue ?? "0"),
      prefix: "$",
      badge: d?.revenueGrowth ?? "0%",
      icon: <TrendingUp className="w-4 h-4" />,
      color: "bg-[#3B82F6] text-purple-600",
      textColor: "bg-card text-[#3B82F6]",
      period: `Based on ${d?.totalOrders ?? 0} orders`,
    },
  ];

  return (
    <div>
      <div >
        {/* <StatCardList
          dtitle="Insights Overview"
          description="Comprehensive insights into your store performance"
          items={insights}
        /> */}

        <SectionTitle title="Insights Overview" subtitle="Comprehensive insights into your store performance" />

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 mb-6 gap-4 w-full">
          {
          insights.map((item) => {
            return (
              <StatCardList
                key={item.id}
                ctitle={item.ctitle}
                value={item.value}
                prefix={item.prefix}
                badge={item.badge}
                icon={item.icon}
                color={item.color}
                textColor={item.textColor}
                period={item.period}
              />

            )
          })
        }

        </div>
      </div>
      <div className="bg-primary-foreground md:p-4 border-2 rounded-lg lg:col-span-2 xl:col-span-1 2xl:col-span-2 mb-6">
        <AppBarChart />
      </div>
      <div>
        <InSightsCards />
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-6">
        <div className="flex-1">
          <Card>
            <InSightsSellerPieChart />
          </Card>
        </div>
        <div className="flex-1">
          <Card>
            <InSightsCustomerPieChart />
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Insights;