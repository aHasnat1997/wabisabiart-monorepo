"use client";

import { Card } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Download,
  EllipsisVertical,
  Eye,
  Mail,
  MessageSquare,
  MousePointer,
} from "lucide-react";

import { Button } from "@/components/animate-ui/components/buttons/button";
import { Order } from "@/types/sellerDashboard/Orders";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { getInitials } from "@/lib/getInitials";
import { useState } from "react";
import Link from "next/link";

interface Props {
  orders: Order[];
  title?: string;
}

/* ---------------- Table Data ---------------- */


const AllOrdersTable = ({ orders: propOrders, title }: Props) => {


  const [selectedOrders, setSelectedOrders] = useState<string[]>([]);
  const [search, setSearch] = useState("");

  const filteredOrders = propOrders.filter(
    (order) =>
      order.customer.name.toLowerCase().includes(search.toLowerCase()) ||
      order.orderNumber.toLowerCase().includes(search.toLowerCase()),
  );

  const allSelected = selectedOrders.length === filteredOrders.length;

  const toggleAll = () => {
    if (allSelected) setSelectedOrders([]);
    else setSelectedOrders(filteredOrders.map((o) => o.orderNumber));
  };

  const toggleOne = (orderNumber: string) => {
    if (selectedOrders.includes(orderNumber))
      setSelectedOrders(selectedOrders.filter((o) => o !== orderNumber));
    else setSelectedOrders([...selectedOrders, orderNumber]);
  };

 
  return (
    <Card className="p-4">
      {/* ================= HEADER ================= */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3 mb-4">
        <div>
          <h1 className="text-lg font-medium">{title}</h1>
          {/* <p className="text-muted-foreground text-xs">
            {title={`All Orders (${total})`}} orders
          </p> */}
        </div>

        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 sm:gap-4">
          <Input
            placeholder="Search orders..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="h-9 w-full sm:w-40"
          />

          <div className="md:flex space-y-2 md:gap-2">
            <Button className="flex items-center gap-2 bg-muted text-muted-foreground w-full sm:w-auto">
              <Download size={16} />
              Export
            </Button>

            <Button
              className="flex items-center gap-2 bg-muted text-muted-foreground w-full sm:w-auto"
              onClick={toggleAll}
            >
              <MousePointer size={16} />
              {allSelected ? "Unselect All" : "All Select"}
            </Button>
          </div>
        </div>
      </div>

      {/* ================= TABLE (Tablet & Desktop) ================= */}
      <div className="hidden md:block overflow-x-auto rounded-lg">
        <Table className="min-w-237.5">
          <TableHeader className="bg-muted">
            <TableRow>
              <TableHead className="w-10" />
              <TableHead>Order</TableHead>
              <TableHead>Customer</TableHead>
              <TableHead>Product</TableHead>
              <TableHead>Date</TableHead>
              <TableHead>Amount</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>

          <TableBody>
            {filteredOrders.map((item) => (
              <TableRow key={item.id}>
                <TableCell>
                  <input
                    type="checkbox"
                    className="accent-primary"
                    checked={selectedOrders.includes(item.orderNumber)}
                    onChange={() => toggleOne(item.orderNumber)}
                  />
                </TableCell>

                <TableCell className="font-medium">
                  {item.orderNumber}
                </TableCell>

                <TableCell>
                  <div className="flex items-center gap-3">
                    <Avatar className="h-10 w-10">
                      {item.customer.avatar ? (
                        <AvatarImage src={item.customer.avatar} />
                      ) : (
                        <AvatarFallback className="bg-primary text-card">
                          {getInitials(item.customer.name)}
                        </AvatarFallback>
                      )}
                    </Avatar>

                    <div>
                      <p className="font-medium">{item.customer.name}</p>
                      <p className="text-xs text-muted-foreground flex items-center gap-1">
                        <Mail size={12} />
                        {item.customer.email}
                      </p>
                    </div>
                  </div>
                </TableCell>

                <TableCell>{item.product}</TableCell>

                <TableCell className="text-xs text-muted-foreground">
                  {item.date}
                </TableCell>

                <TableCell className="font-medium">
                  {item.amount.toLocaleString()}
                </TableCell>

                <TableCell>
                  <Badge>{item.status}</Badge>
                </TableCell>

                <TableCell>
                  <div className="flex gap-3">
                    <Link href={`?details-modal=details&id=${item.uuid}`}>
                      <Eye size={18} className="cursor-pointer" />
                    </Link>
                    <Link href={`?chart-modal=chart&id=${item.customer.email}`}>
                      <MessageSquare size={18} className="cursor-pointer" />
                    </Link>
                    <Link
                      href={`?action-modal=action&id=${item.uuid}&orderNumber=${encodeURIComponent(item.orderNumber)}&status=${encodeURIComponent(item.status)}`}
                    >
                      <EllipsisVertical size={18} />
                    </Link>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      {/* ================= MOBILE CARD VIEW ================= */}
      <div className="md:hidden space-y-3">
        {filteredOrders.map((item) => (
          <div key={item.id} className="border rounded-lg p-4 space-y-3">
            <div className="flex justify-between items-center">
              <div className="flex gap-2">
                <input
                  type="checkbox"
                  className="accent-primary"
                  checked={selectedOrders.includes(item.orderNumber)}
                  onChange={() => toggleOne(item.orderNumber)}
                />
                <p className="font-medium text-sm text-primary">
                  {item.orderNumber}
                </p>
              </div>
              <div>
                <Badge>{item.status}</Badge>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <Avatar className="h-9 w-9">
                {item.customer.avatar ? (
                  <AvatarImage src={item.customer.avatar} />
                ) : (
                  <AvatarFallback className="bg-primary text-card">
                    {getInitials(item.customer.name)}
                  </AvatarFallback>
                )}
              </Avatar>

              <div>
                <p className="text-sm font-medium">{item.customer.name}</p>
                <p className="text-xs text-muted-foreground">
                  {item.customer.email}
                </p>
              </div>
            </div>

            <div className="flex justify-between text-xs text-muted-foreground">
              <span>{item.product}</span>
              <span>{item.date}</span>
            </div>

            <div className="flex justify-between items-center ">
              <p className="font-medium text-sm">
                Amount: {item.amount.toLocaleString()}
              </p>
              <div>
                <Link href={`?details-modal=details&id=${item.id}`}>
                  <Eye size={18} className="cursor-pointer" />
                </Link>
                <Link href={`?chart-modal=chart&id=${item.customer.email}`}>
                  <MessageSquare size={18} className="cursor-pointer" />
                </Link>
                <Link
                  href={`?action-modal=action&id=${item.uuid}&orderNumber=${encodeURIComponent(item.orderNumber)}&status=${encodeURIComponent(item.status)}`}
                >
                  <EllipsisVertical size={18} className="cursor-pointer" />
                </Link>
              </div>
            </div>
          </div>
        ))}
      </div>
    </Card>
  );
};

export default AllOrdersTable;
