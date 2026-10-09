"use client";

import { useState } from "react";
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerTrigger,
} from "@/components/ui/drawer";
import { Button } from "@/components/ui/button";
import { Menu, X } from "lucide-react";
import SideBar from "./SideBar";
import { WishlistCategory, WishlistCollection } from "@/types/wishlist";

interface MobileDrawerProps {
  categories?: WishlistCategory[];
  collections?: WishlistCollection[];
}

export default function MobileDrawer({
  categories,
  collections,
}: MobileDrawerProps) {
  const [open, setOpen] = useState(false);

  return (
    <Drawer open={open} onOpenChange={setOpen} direction="left">
      <DrawerTrigger asChild>
        <Button variant="ghost" size="icon">
          <Menu className="h-5 w-5" />
        </Button>
      </DrawerTrigger>
      <DrawerContent className="sm:w-56! px-4">
        <DrawerClose asChild>
          <Button className="ml-auto" variant="ghost" size="icon">
            <X className="h-4 w-4" />
          </Button>
        </DrawerClose>
        <SideBar categories={categories} collections={collections} />
      </DrawerContent>
    </Drawer>
  );
}
