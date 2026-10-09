"use client";

import { resolveImageUrl } from "@/lib/utils";
import Image from "next/image";
import { toast } from "sonner";
import { WishlistCollection, WishlistItem } from "@/types/wishlist";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuPortal,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useRef, useState } from "react";
import { EllipsisVertical } from "lucide-react";
import { moveToCollection, removeFromWishlist } from "./action";
import { Button } from "@/components/ui/button";
import Link from "next/link";

export default function FavCard({
  product,
  collections,
}: {
  product: WishlistItem;
  collections: WishlistCollection[];
}) {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const closeTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const handleMouseEnter = () => {
    if (closeTimer.current) {
      clearTimeout(closeTimer.current);
      closeTimer.current = null;
    }
    setIsDropdownOpen(true);
  };

  const handleMouseLeave = () => {
    closeTimer.current = setTimeout(() => {
      setIsDropdownOpen(false);
    }, 200); // 200ms delay before closing
  };

  const handleRemove = async (id: string) => {
    try {
      const res = await removeFromWishlist(id);
      if (res.success) {
        toast.success(res.message || "Item removed from wishlist");
      }
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "An unknown error occurred",
      );
    }
  };

  const handleMoveToCollection = async (itemId: string, wishlistId: string) => {
    try {
      const res = await moveToCollection(itemId, wishlistId);
      if (res.success) {
        toast.success(res.message || "Item moved to collection");
      }
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "An unknown error occurred",
      );
    }
  };

  return (
    <Link
      href={`/products/${product?.product?.id}`}
      className="group relative overflow-hidden rounded-lg lg:rounded-xl h-52 lg:h-75 hover:shadow-xl duration-300"
    >
      <Image
        width={500}
        height={500}
        src={resolveImageUrl(product?.product?.imageUrl)}
        alt="product"
        className="object-cover w-full rounded-lg lg:rounded-xl h-52 lg:h-75 group-hover:scale-103 transition-all duration-300 ease-in-out cursor-pointer"
      />

      <DropdownMenu open={isDropdownOpen} onOpenChange={setIsDropdownOpen}>
        <DropdownMenuTrigger
          className="absolute top-3 right-3 p-1 md:p-1.5 rounded-full transition-opacity duration-300"
          asChild
          onMouseEnter={handleMouseEnter}
          onMouseLeave={handleMouseLeave}
          onClick={(e) => e.preventDefault()}
        >
          <Button
            size={"icon"}
            variant="outline"
            className="rounded-full hover:bg-background hover:text-foreground w-7 lg:h-8 h-7 lg:w-8"
          >
            <EllipsisVertical />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent
          className="w-40 border-primary/50 shadow-2xl"
          align="end"
          onMouseEnter={handleMouseEnter}
          onMouseLeave={handleMouseLeave}
          onClick={(e) => e.stopPropagation()}
        >
          <DropdownMenuGroup className="max-h-36 overflow-y-auto">
            <DropdownMenuSub>
              <DropdownMenuSubTrigger className="cursor-pointer">
                Move to
              </DropdownMenuSubTrigger>
              <DropdownMenuPortal>
                <DropdownMenuSubContent>
                  {collections?.map((collection) => (
                    <DropdownMenuItem
                      className="cursor-pointer"
                      key={collection.id}
                      onClick={(e) => {
                        e.stopPropagation();
                        handleMoveToCollection(product?.id, collection.id);
                      }}
                    >
                      {collection.name}
                    </DropdownMenuItem>
                  ))}
                </DropdownMenuSubContent>
              </DropdownMenuPortal>
            </DropdownMenuSub>
          </DropdownMenuGroup>
          <DropdownMenuGroup>
            <DropdownMenuItem
              onClick={(e) => {
                e.stopPropagation();
                handleRemove(product?.id);
              }}
              className="text-destructive bg-destructive/10 hover:text-card hover:bg-destructive! cursor-pointer"
            >
              Remove
            </DropdownMenuItem>
          </DropdownMenuGroup>
        </DropdownMenuContent>
      </DropdownMenu>

      <div
        // onClick={handleNavigate}
        className="absolute bottom-3 left-3 right-3 bg-linear-to-t from-primary to-primary/50 px-1.5 lg:px-3 py-0.5 lg:py-2 border rounded-lg text-card cursor-pointer"
      >
        <h3 className="font-semibold text-sm lg:text-xl line-clamp-1">
          {product?.product?.title}
        </h3>

        <span className="text-sm lg:text-xl font-medium">
          ${product?.product?.price}
        </span>
      </div>
    </Link>
  );
}
