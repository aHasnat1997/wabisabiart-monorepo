"use client";

import Link from "next/link";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { BsFillGridFill } from "react-icons/bs";
import { WishlistCategory, WishlistCollection } from "@/types/wishlist";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { useRouter, useSearchParams } from "next/navigation";
import { useState } from "react";

interface SideBarProps {
  categories?: WishlistCategory[];
  collections?: WishlistCollection[];
}

const SHOW_LIMIT = 5;

export default function SideBar({ categories, collections }: SideBarProps) {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [showAllCategories, setShowAllCategories] = useState(false);
  const [showAllCollections, setShowAllCollections] = useState(false);

  const activeCategoryId = searchParams.get("filter[categoryId]");
  const activeCollectionId = searchParams.get("id");

  const handleCategoryClick = (categoryId: string) => {
    const params = new URLSearchParams();
    if (activeCategoryId !== categoryId) {
      params.set("filter[categoryId]", categoryId);
    }
    router.push(`?${params.toString()}`);
  };

  const handleCollectionClick = (collectionId: string) => {
    const params = new URLSearchParams();
    if (activeCollectionId !== collectionId) {
      params.set("id", collectionId);
    }
    router.push(`?${params.toString()}`);
  };

  const visibleCategories = showAllCategories
    ? categories
    : categories?.slice(0, SHOW_LIMIT);

  const visibleCollections = showAllCollections
    ? collections
    : collections?.slice(0, SHOW_LIMIT);

  return (
    <div className="flex flex-col gap-4 sticky top-0">
      <div>
        <h3 className="text-lg text-foreground font-semibold flex items-center gap-4">
          <BsFillGridFill /> Items
        </h3>
        <ScrollArea className={`grid grid-cols-1 mt-2 h-[25vh]`}>
          {visibleCategories?.map((item) => (
            <p
              key={item.id}
              onClick={() => handleCategoryClick(item.id)}
              className={`text-foreground line-clamp-1 p-2.5 text-sm sm:text-base font-medium rounded-lg border-l-3 cursor-pointer hover:bg-linear-to-r from-primary/15 to-primary/0 hover:border-primary transition-all duration-300 ease-in-out ${
                activeCategoryId === item.id
                  ? "bg-linear-to-r border-primary"
                  : "border-transparent"
              }`}
            >
              {item.name}
            </p>
          ))}
        </ScrollArea>
        {(categories?.length ?? 0) > SHOW_LIMIT && (
          <div className="mt-2">
            <Button
              className="text-foreground text-lg font-semibold"
              variant="link"
              onClick={() => setShowAllCategories((prev) => !prev)}
            >
              {showAllCategories ? "View Less" : "View All"}
            </Button>
          </div>
        )}
      </div>

      <div>
        <h3 className="text-lg text-foreground font-semibold flex items-center gap-4">
          <BsFillGridFill />
          Collections
          <Link href="?add-fav-collection-modal=add-fav-collection">
            <Plus className="hover:text-primary" />
          </Link>
        </h3>
        <ScrollArea className={`grid grid-cols-1 mt-2 h-[25vh]`}>
          <div className="grid grid-cols-1 mt-2">
            {visibleCollections?.map((item) => (
              <p
                key={item.id}
                onClick={() => handleCollectionClick(item.id)}
                className={`text-foreground line-clamp-1 p-2.5 text-sm sm:text-base font-medium rounded-lg border-l-3 cursor-pointer hover:bg-linear-to-r from-primary/15 to-primary/0 hover:border-primary transition-all duration-300 ease-in-out flex items-center gap-1 justify-between ${
                  activeCollectionId === item.id
                    ? "bg-linear-to-r border-primary"
                    : "border-transparent"
                }`}
              >
                {item.name}{" "}
                {item.itemCount > 0 && <Badge>{item.itemCount}</Badge>}
              </p>
            ))}
          </div>
        </ScrollArea>
        {(collections?.length ?? 0) > SHOW_LIMIT && (
          <div className="mt-2">
            <Button
              className="text-foreground text-lg font-semibold"
              variant="link"
              onClick={() => setShowAllCollections((prev) => !prev)}
            >
              {showAllCollections ? "View Less" : "View All"}
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
