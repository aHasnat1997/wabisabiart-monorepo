"use client";
import { Button } from "@/components/animate-ui/components/buttons/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Input } from "@/components/ui/input";
import { getInitials } from "@/lib/getInitials";
import { Loader2, Mail, MapPin } from "lucide-react";
import {  useEffect, useMemo, useState } from "react";
import { getCustomersList } from "./CustomerAction";
import { getImageUrl } from "../../products/components/getImageUrl";
import { formatDate } from "./DateFormat";
import { CommonPagination } from "@/components/commonPagination";


// export const customers = [
//   {
//     id: 1,
//     name: "Jasmin Reed",
//     email: "jasmin.reed@email.com",
//     location: "New York, USA",
//     orders: 3,
//     totalSpent: 120,
//     lastOrder: "4 days ago",
//     avatar: null,
//   },
//   {
//     id: 2,
//     name: "Marcus Chen",
//     email: "marcus.chen@email.com",
//     location: "Los Angeles, USA",
//     orders: 5,
//     totalSpent: 280,
//     lastOrder: "1 week ago",
//     avatar: null,
//   },
//   {
//     id: 3,
//     name: "Sofia Rodriguez",
//     email: "sofia.r@email.com",
//     location: "Madrid, Spain",
//     orders: 2,
//     totalSpent: 95,
//     lastOrder: "2 days ago",
//     avatar: null,
//   },
//   {
//     id: 4,
//     name: "David Kim",
//     email: "david.kim@email.com",
//     location: "Seoul, South Korea",
//     orders: 7,
//     totalSpent: 445,
//     lastOrder: "5 days ago",
//     avatar: null,
//   },
//   {
//     id: 5,
//     name: "Emma Wilson",
//     email: "emma.w@email.com",
//     location: "London, UK",
//     orders: 4,
//     totalSpent: 310,
//     lastOrder: "3 days ago",
//     avatar: null,
//   },
//   {
//     id: 6,
//     name: "Alex Turner",
//     email: "alex.turner@email.com",
//     location: "Toronto, Canada",
//     orders: 6,
//     totalSpent: 420,
//     lastOrder: "1 week ago",
//     avatar: null,
//   },
// ];

export type Customer = {
  id: string; 
  fullName: string;
  email: string;
  location: string;
  totalOrders: number;
  totalSpent: string; 
  lastOrderDate: string;
  avatarUrl: string | null;
};

export default function CustomerDirectory() {
 const [search, setSearch] = useState("");
  const [customerData, setCustomerData] = useState<Customer[]>([]); 
  const [isLoading, setIsLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  

  useEffect(() => {
    const fetchCustomers = async () => {
      try {
        setIsLoading(true);
        const response = await getCustomersList();
        
      
        if (response && response.success) {
          setCustomerData(response.data);
        }
      } catch (error) {
        console.error("Failed to load customers:", error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchCustomers();
  }, []);

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const filteredCustomers = useMemo(() => {
    return customerData.filter((customer) =>
      customer.fullName.toLowerCase().includes(search.toLowerCase()) ||
      customer.email.toLowerCase().includes(search.toLowerCase())
    );
  }, [search, customerData]);

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center p-20 gap-4">
        <Loader2 className="animate-spin text-primary" size={40} />
        <p className="text-muted-foreground animate-pulse">Loading directory...</p>
      </div>
    );
  }

  return (
    <div className="p-4 md:p-6 bg-card rounded-xl shadow-md w-full">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 mb-4">
        <h2 className="text-lg font-semibold">Customer Directory</h2>
        <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto">
          <Input
            type="search"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search customers..."
            className="w-full sm:w-64"
          />
          <Button className="bg-chart-7 text-card px-4 py-1 rounded-md text-sm w-full sm:w-auto">
            Export
          </Button>
        </div>
      </div>

      <p className="text-sm text-muted-foreground mb-4">
        {customerData.length} active customers
      </p>

      {/* Desktop / Laptop Grid */}
      <div className="hidden md:grid grid-cols-[auto_1fr_1fr_1fr_1fr] gap-6 items-center">
        {filteredCustomers.map((customer) => (
          <div
            key={customer.id}
            className="contents" // keep grid structure
          >
            {/* Avatar + Name + Email */}
            <div className="flex items-center gap-3">
              <Avatar className="w-10 h-10 shrink-0">
                {customer.avatarUrl ? (
                  <AvatarImage src={getImageUrl(customer.avatarUrl)} alt={customer.fullName} />
                ) : (
                  <AvatarFallback className="bg-primary text-card uppercase">
                    {getInitials(customer.fullName)}
                  </AvatarFallback>
                )}
              </Avatar>
              <div className="flex flex-col gap-1">
                <p className="font-medium">{customer.fullName}</p>
                <div className="flex text-muted-foreground text-xs gap-1 items-center">
                  <Mail size={14} /> <span>{customer.email}</span>
                </div>
              </div>
            </div>

            {/* Location */}
            <div className="flex items-center text-muted-foreground text-sm">
              <MapPin size={14} /> <span>{customer.location}</span>
            </div>

            {/* Orders */}
            <div>
              <p className="text-sm text-muted-foreground">Orders</p>
              <p className="font-medium">{customer.totalOrders}</p>
            </div>

            {/* Total Spent */}
            <div>
              <p className="text-sm text-muted-foreground">Total Spent</p>
              <p className="font-medium">${customer.totalSpent}</p>
            </div>

            {/* Last Order + Message */}
            <div className="flex flex-col items-end text-right">
              <p className="text-sm text-muted-foreground">
                Last order:{" "}
                <span className="font-medium">{formatDate(customer.lastOrderDate)}</span>
              </p>
              <button className="text-chart-7 text-sm mt-1">Message</button>
            </div>
          </div>
        ))}
      </div>

      {/* Mobile / Tablet Cards */}
      <div className="md:hidden flex flex-col gap-4">
        {customerData.map((customer) => (
          <div
            key={customer.id}
            className="flex flex-col gap-3 p-4 bg-muted-foreground/10 rounded-lg"
          >
            {/* Avatar + Name + Email */}
            <div className="flex items-center gap-3">
              <Avatar className="w-10 h-10 shrink-0">
                {customer.avatarUrl ? (
                  <AvatarImage src={getImageUrl(customer.avatarUrl)} alt={customer.fullName} />
                ) : (
                  <AvatarFallback className="bg-primary text-card uppercase">
                    {getInitials(customer.fullName)}
                  </AvatarFallback>
                )}
              </Avatar>
              <div className="flex flex-col gap-1">
                <p className="font-medium">{customer.fullName}</p>
                <div className="flex text-muted-foreground text-xs gap-1 items-center">
                  <Mail size={14} /> <span>{customer.email}</span>
                </div>
              </div>
            </div>

            {/* Location */}
            <div className="flex items-center text-muted-foreground text-sm gap-1">
              <MapPin size={14} /> <span>{customer.location}</span>
            </div>

            {/* Orders + Total */}
            <div className="flex justify-between text-sm text-muted-foreground">
              <div>
                Orders: <span className="font-medium">{customer.totalOrders}</span>
              </div>
              <div>
                Total Spent:{" "}
                <span className="font-medium">${customer.totalSpent}</span>
              </div>
            </div>

            {/* Last Order + Message */}
            <div className="flex justify-between items-center text-sm text-muted-foreground">
              <div>
                Last order:{" "}
                <span className="font-medium">{customer.lastOrderDate}</span>
              </div>
              <button className="text-chart-7 text-sm">Message</button>
            </div>
          </div>
        ))}
      </div>
      {/* Pagination */}
      {totalPages > 1 && (
        <div className="mt-8 flex justify-center border-t pt-6">
          <CommonPagination
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={handlePageChange}
          />
        </div>
      )}
    </div>
  );
}
