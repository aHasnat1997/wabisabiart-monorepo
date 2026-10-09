
import { DollarSign, MessageSquare, PanelBottomClose } from "lucide-react";
import StatCardList from "../components/CardList";
import CustomerDirectory from "./components/CusromerDirectory";
import { getCustomersList } from "./components/CustomerAction";
import SectionTitle from "@/components/SectionTitle";

interface CustomerData {
  totalCustomers?: number | string;
  totalCustomerValue?: number | string;
  totalLikes?: number | string;
  totalComments?: number | string;
}



const Customers = async() => {

  const res =  await getCustomersList()
  // console.log("Customer List:", res);

 const data: CustomerData = res && typeof res === 'object' && 'data' in res ? (res.data as CustomerData) : {};

  const customers = [
  {
    id: 1,
    ctitle: "Total Customers",
    value: data?.totalCustomers ?? "0",

    icon: <PanelBottomClose className="w-4 h-4" />,
    color: "bg-chart-4 text-card",
    textColor: "bg-card text-muted-foreground",
  },
  {
    id: 2,
    ctitle: "Total customers Value",
    value: data?.totalCustomerValue ? `$${data.totalCustomerValue}` : "$0",

    icon: <DollarSign className="w-4 h-4" />,
    color: "bg-chart-1 text-card",
    textColor: "bg-card text-chart-1",
  },

  {
    id: 3,
    ctitle: "Total Likes",
    value: data?.totalLikes ?? "0",

    icon: <MessageSquare className="w-4 h-4" />,
    color: "bg-chart-6 text-card",
    textColor: "bg-card text-chart-2",
  },
  {
    id: 4,
    ctitle: "Total Comments",
    value: data?.totalComments ?? "0",

    icon: <PanelBottomClose className="w-4 h-4" />,
    color: "bg-ring text-card",
    textColor: "bg-card text-muted-foreground",
  },
];
  

  return (
    <div>
      <SectionTitle title="Customer Management" subtitle="Share your craft story and connect with customers"/>
      {/* <div className="">
        <StatCardList
     
          items={customers}
        />
      </div> */}
      
   <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 mb-6 gap-4 w-full">
        {
        customers.map((item)=> {
          return (
            <StatCardList
              key={item.id}
              ctitle={item.ctitle}
              icon={item.icon}
              value={item.value}
              color={item.color}
              textColor={item.textColor}
            />
          )
        })
      }
  </div>

      <div>
        <CustomerDirectory></CustomerDirectory>
      </div>
    </div>
  );
};

export default Customers;
