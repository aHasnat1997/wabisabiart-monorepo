"use client";

import { useEffect, useState } from "react";
import { Bell, Search } from "lucide-react";
import Link from "next/link";
import { MessageIcon } from "@/public/icons/messageIcon";
import { SidebarTrigger } from "@/components/animate-ui/components/radix/sidebar";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { usePathname, useRouter } from "next/navigation";
import { cn } from "@/lib/utils";
import { useIsMobile } from "@/hooks/use-mobile";

import {
  InputGroup,
  InputGroupAddon,
  InputGroupInput,
} from "@/components/ui/input-group";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/animate-ui/components/radix/dialog";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { User } from "@/types/auth";
import { getInitials } from "@/lib/getInitials";
import { profileInfo } from "@/lib/auth-server";

const SidebarNav = () => {
  const [profileData, setProfileData] = useState<User>();

  useEffect(() => {
    const loadProfile = async () => {
      try {
        const response = await profileInfo();
        setProfileData(response ?? undefined);
      } catch (error) {
        console.error(error);
      }
    };

    loadProfile();
  }, []);

  const router = useRouter();
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const isMobile = useIsMobile();

  const pathname = usePathname();
  const isMessageActive =
    pathname === "/seller-dashboard/messages" ||
    pathname.startsWith("/seller-dashboard/messages/");

  return (
    <nav className="sticky top-0  z-50 w-full bg-card border-b">
      <div className="flex items-center justify-between px-3 sm:px-4 py-3 gap-2">
        {/* LEFT */}
        <div className="flex items-center gap-2  shrink-0">
          <SidebarTrigger />

          <div className="hidden md:block">
            <div className="flex items-start  justify-center flex-col">
              <h3 className="font-semibold text-sm sm:text-base whitespace-nowrap">
                Seller Dashboard
              </h3>
              <p className="text-muted-foreground text-xs">
                {new Date().toLocaleDateString(undefined, {
                  day: "numeric",
                  month: "long",
                  year: "numeric",
                })}
              </p>
            </div>
          </div>
        </div>

        {/* DESKTOP SEARCH */}
        <div className="hidden md:flex flex-1 justify-center px-7 py-1">
          <Input
            type="text"
            placeholder="Search products, orders..."
            className="w-full max-w-142.5 h-11 rounded-lg bg-sidebar-accent"
          />
        </div>

        {/* RIGHT */}
        <div className="flex items-center gap-1 sm:gap-3 shrink-0">
          {/* MOBILE SEARCH TOGGLE */}
          {isMobile && (
            <button
              onClick={() => setIsSearchOpen(true)}
              className="p-2 cursor-pointer hover:bg-background rounded-md"
            >
              <Search className="size-5" />
            </button>
          )}
          <Dialog open={isSearchOpen} onOpenChange={setIsSearchOpen}>
            <DialogContent className="top-0 translate-y-0 max-w-full w-full p-2 rounded-none border-x-0 border-t-0">
              <DialogHeader className="sr-only">
                <DialogTitle>Search</DialogTitle>
              </DialogHeader>

              <div className="w-full">
                <InputGroup className="rounded-full flex-1">
                  <InputGroupInput placeholder="Search..." autoFocus />
                  <InputGroupAddon>
                    <Search />
                  </InputGroupAddon>
                </InputGroup>
              </div>
            </DialogContent>
          </Dialog>

          {/* NOTIFICATIONS */}
          <Link href="?sellerBoard-notification-modal=sellerBoard-notification">
            <Button className="bg-muted" variant="ghost" size="icon">
              <Bell className="h-5 w-5" />
            </Button>
          </Link>

          {/* MESSAGES */}
          <Button
            className={cn(
              "bg-muted",
              isMessageActive
                ? "bg-sidebar-primary text-card"
                : "hover:bg-muted text-muted-foreground",
            )}
            onClick={() => router.push("/seller-dashboard/messages")}
            aria-label="Open messages"
          >
            <MessageIcon />
          </Button>
          {/* DIVIDER */}
          <div className="hidden sm:block h-6 w-px bg-muted-foreground/30" />

          {/* PROFILE */}
          <div className="flex items-center gap-2">
            <Avatar className="h-9 w-9 sm:h-10 sm:w-10">
              <AvatarImage src="" alt="Amina Babu" />

              <AvatarFallback className="text-card bg-primary font-medium">
                {getInitials(profileData?.fullName || "U")}
              </AvatarFallback>
            </Avatar>

            {/* USER INFO (hide on small screens) */}
            <div className="hidden sm:block leading-tight">
              <h3 className="font-medium text-sm">{profileData?.fullName}</h3>
              <p className="text-xs text-primary">{profileData?.email}</p>
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default SidebarNav;
