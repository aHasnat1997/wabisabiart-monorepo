"use client";

import * as React from "react";
import { useEffect, useState } from "react";

import {
  SidebarInset,
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarRail,
  SidebarGroup,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarMenuSub,
  SidebarMenuSubItem,
  SidebarMenuSubButton,
  useSidebar,
} from "@/components/animate-ui/components/radix/sidebar";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/animate-ui/primitives/radix/collapsible";
import {
  ChevronRight,
  Dock,
  Headset,
  LayoutDashboard,
  // LayoutDashboard,
  LogOut,
  Megaphone,
  Newspaper,
  Settings,
  ShoppingCart,
  Users,
  X,
} from "lucide-react";
import { HiOutlineChartBarSquare } from "react-icons/hi2";
import { cn } from "@/lib/utils";
import { ScrollArea } from "@/components/ui/scroll-area";
import Link from "next/link";
import { NavItem } from "@/types/sellerDashboard/sidebar";
import Image from "next/image";
import logImg from "@/assets/images/Logo.png";
import { getAllOrders } from "../orders/components/OrderAction";
import { logoutUser } from "@/lib/action";
import { toast } from "sonner";
import { usePathname, useRouter } from "next/navigation";
import { useIsMobile } from "@/hooks/use-mobile";
import SidebarNav from "./SidebarNav";


/* ---------------- DATA ---------------- */

const DATA: { navMain: NavItem[] } = {
  navMain: [
    {
      title: "Dashboard",
      url: "/seller-dashboard",
      icon: LayoutDashboard,
      arrow: false,
    },
    {
      title: "Orders",
      url: "/seller-dashboard/orders",
      icon: ShoppingCart,
      items: [
        { title: "All Orders", url: "/seller-dashboard/orders" },
        {
          title: "Pending Shipment",
          url: "/seller-dashboard/orders/pending-shipment",
        },
        { title: "Past Due", url: "/seller-dashboard/orders/past-due" },
        {
          title: "Delivery Delays",
          url: "/seller-dashboard/orders/delivery-delays",
        },
        {
          title: "Refund Request",
          url: "/seller-dashboard/orders/refund-request",
        },
        { title: "Disputes", url: "/seller-dashboard/orders/disputes" },
      ],
      arrow: true,
    },
    {
      title: "Products",
      url: "/seller-dashboard/products",
      icon: Dock,
      items: [
        { title: "My Listings", url: "/seller-dashboard/products" },
        {
          title: "Add Products",
          url: "/seller-dashboard/products/add-products",
        },

        { title: "Inventory", url: "/seller-dashboard/products/inventory" },
        {
          title: "Import Review",
          url: "/seller-dashboard/products/import-review",
        },
      ],
      arrow: true,
    },
    {
      title: "Marketing",
      url: "/seller-dashboard/marketing",
      icon: Megaphone,
      items: [
        { title: "Promotion", url: "/seller-dashboard/marketing" },
        { title: "Coupons", url: "/seller-dashboard/marketing/coupons" },
        {
          title: "Free Shipping Rules",
          url: "/seller-dashboard/marketing/free-shipping-rules",
        },
        {
          title: "Wishlist Auto-Coupons",
          url: "/seller-dashboard/marketing/wishlist-auto-coupons",
        },
      ],
      arrow: true,
    },
    {
      title: "Insights",
      url: "/seller-dashboard/insights",
      icon: HiOutlineChartBarSquare,
      items: [
        { title: "Analytics", url: "/seller-dashboard/insights" },
        {
          title: "Sales & Income",
          url: "/seller-dashboard/insights/sales-and-income",
        },

        {
          title: "Wishlists",
          url: "/seller-dashboard/insights/wishlists",
        },
        {
          title: "Top Products",
          url: "/seller-dashboard/insights/top-products",
        },
      ],
      arrow: true,
    },
    {
      title: "Journals",
      url: "/seller-dashboard/journals",
      icon: Newspaper,
      arrow: false,
    },
    {
      title: "Customers",
      url: "/seller-dashboard/customers",
      icon: Users,
      arrow: false,
    },
    {
      title: "Settings",
      url: "/seller-dashboard/settings",
      icon: Settings,
      arrow: false,
    },
  ],
};

const STATUS_MAP: Record<string, string> = {
  "All Orders": "",
  "Pending Shipment": "paid",
  "Past Due": "past_due",
  "Delivery Delays": "delivery_delay",
  "Refund Request": "refund_requested",
  Disputes: "dispute",
};

export default function DashboardLayoutContent({ children }: { children: React.ReactNode }) {
  const { setOpenMobile, openMobile } = useSidebar();
  const router = useRouter();
  const pathname = usePathname();
  const isSubActive = pathname === "/seller-dashboard/support";
  const isMobile = useIsMobile();
  const [orderCounts, setOrderCounts] = useState<Record<string, number>>({});
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  useEffect(() => {
    const fetchCounts = async () => {
      try {
        const entries = Object.entries(STATUS_MAP);
        const results = await Promise.all(
          entries.map(([title, status]) =>
            getAllOrders(1, 1, status).then(
              (res) => [title, res.total] as const,
            ),
          ),
        );
        setOrderCounts(Object.fromEntries(results));
      } catch (err) {
        console.error("Failed to fetch order counts:", err);
      }
    };

    fetchCounts();
  }, []);
  // ---------- LOGOUT HANDLER ----------
  const handleLogout = async () => {
    try {
      setIsLoggingOut(true);

      // Ekhane type define kore dewa holo
      const response = (await logoutUser()) as {
        success: boolean;
        message?: string;
      };

      if (response.success) {
        toast.success("Logout successful 🏃‍♂️‍➡️");
        router.push("/");
      } else {
        toast.error(response.message || "Failed to logout. Please try again.");
        console.error("Logout error:", response.message);
      }
    } catch (error) {
      toast.error("An unexpected error occurred!");
      console.error("An error occurred during logout:", error);
    } finally {
      setIsLoggingOut(false);
    }
  };

  return (
    <>
      <div
        className={`**:data-[sidebar=sidebar]:bg-card **:data-[sidebar=sidebar]:pr-2`}
      >
        <Sidebar collapsible="offcanvas">
          {openMobile && isMobile && (
            <div className="absolute top-1  right-2 z-50">
              <button
                onClick={() => setOpenMobile(false)}
                className="p-2 rounded-md hover:bg-muted"
              >
                <X size={20} />
              </button>
            </div>
          )}

          <Link className="py-4 flex justify-center" href="/">
            <Image
              className="w-10 md:w-12 h-auto"
              src={logImg}
              alt="logo"
              height={50}
              width={50}
            />
          </Link>
          <ScrollArea className="h-[80vh]">
            <SidebarContent>
              <SidebarGroup>
                <SidebarMenu>
                  {/* ---------- CONTENT ---------- */}

                  {DATA.navMain.map((item) => {
                    const isItemActive =
                      item.url === "/seller-dashboard"
                        ? pathname === "/seller-dashboard"
                        : pathname === item.url ||
                          pathname.startsWith(item.url + "/");

                    // if items has no subitems
                    if (!item.items) {
                      return (
                        <SidebarMenuItem key={item.title}>
                          <SidebarMenuButton
                            onClick={() => {
                              router.push(item.url);
                            }}
                            data-active={isItemActive}
                            className="data-[active=true]:bg-sidebar-primary text-[16px] cursor-pointer text-sidebar-text data-[active=true]:text-[#dededd]"
                          >
                            <span className="flex-none">
                              <item.icon size={20} />
                            </span>
                            <span>{item.title}</span>
                          </SidebarMenuButton>
                        </SidebarMenuItem>
                      );
                    }

                    // if items has subitems
                    return (
                      <Collapsible
                        key={item.title}
                        defaultOpen={isItemActive}
                        data-active={isItemActive}
                        className="group/collapsible data-[active=true]:bg-sidebar-accent   rounded-lg"
                      >
                        <SidebarMenuItem>
                          <CollapsibleTrigger asChild>
                            <SidebarMenuButton
                              onClick={() => {
                                router.push(item.url);
                              }}
                              data-active={isItemActive}
                              className="data-[active=true]:bg-sidebar-primary text-[16px] cursor-pointer text-sidebar-text  data-[active=true]:text-[#dededd]"
                            >
                              <span className="flex-none">
                                <item.icon size={20} />
                              </span>
                              <span>{item.title}</span>
                              <ChevronRight className="ml-auto  transition-transform group-data-[state=open]/collapsible:rotate-90" />
                            </SidebarMenuButton>
                          </CollapsibleTrigger>
                          <CollapsibleContent>
                            <SidebarMenuSub>
                              {item.items?.map((sub) => {
                                const isSubActive = pathname === sub.url;

                                const count = orderCounts[sub.title];

                                return (
                                  <SidebarMenuSubItem key={sub.title}>
                                    <SidebarMenuSubButton
                                      onClick={() => {
                                        router.push(sub.url);
                                        if (isMobile) setOpenMobile(false);
                                      }}
                                      data-active={isSubActive}
                                      className={cn(
                                        "justify-between cursor-pointer text-primary/60 text-sm mt-1 mb-1 transition-colors",
                                        "hover:text-sidebar-primary hover:bg-sidebar-secondary/50",
                                        "data-[active=true]:text-primary data-[active=true]:font-semibold",
                                      )}
                                    >
                                      {/* left side title */}
                                      <span>{sub.title}</span>

                                      {item.title === "Orders" &&
                                        count !== undefined && (
                                          <span className="text-xs text-primary">
                                            {count}
                                          </span>
                                        )}
                                    </SidebarMenuSubButton>
                                  </SidebarMenuSubItem>
                                );
                              })}
                            </SidebarMenuSub>
                          </CollapsibleContent>
                        </SidebarMenuItem>
                      </Collapsible>
                    );
                  })}
                </SidebarMenu>
              </SidebarGroup>
            </SidebarContent>
          </ScrollArea>

          {/* ---------- FOOTER ---------- */}
          <SidebarFooter>
            <SidebarMenuItem>
              <SidebarMenuButton asChild>
                <Link
                  href="/seller-dashboard/support"
                  className={cn(
                    "flex items-center gap-2 text-sm transition-colors",
                    isSubActive
                      ? "text-accent-foreground bg-primary font-semibold"
                      : "text-muted-foreground hover:text-foreground",
                  )}
                >
                  <Headset className="h-4 w-4" />
                  <span>Support</span>
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>

            <SidebarMenuItem>
              <SidebarMenuButton onClick={handleLogout} disabled={isLoggingOut}>
                <LogOut className="size-4" />
                <span>{isLoggingOut ? "Logging out..." : "Logout"}</span>
              </SidebarMenuButton>
            </SidebarMenuItem>
          </SidebarFooter>

          <SidebarRail />
        </Sidebar>
      </div>
      {/* ---------- MAIN ---------- */}

      <SidebarInset>
        <header className="h-20 flex bg-card items-center">
           <SidebarNav />
        </header>
        <ScrollArea className="lg:h-[calc(100vh-81px)] w-full">
          <main className="lg:px-7.5 lg:py-6 p-2 w-full">{children}</main>
        </ScrollArea>
      </SidebarInset>
    </>
  );
}
