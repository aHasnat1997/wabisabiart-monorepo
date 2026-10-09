"use client";

import Image from "next/image";
import { Heart } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { cn, resolveImageUrl } from "@/lib/utils";
import { IconButton } from "@/components/animate-ui/components/buttons/icon";
import { useRouter } from "next/navigation";
import {
  Carousel,
  CarouselApi,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";
import { toast } from "sonner";
import { Product } from "@/types/product";
import { ShopProduct } from "@/types/seller-profile";
import { useEffect, useState } from "react";
import { addToWishList } from "./action";

type ProductCardProps = {
  product: Product | ShopProduct;
};

const normalizeVariants = (
  product: Product | ShopProduct,
): { id: string; mediaUrl: string }[] => {
  return product.variants ?? [];
};

export default function ProductCard({ product }: ProductCardProps) {
  const router = useRouter();
  const imageVariants = normalizeVariants(product);
  const [api, setApi] = useState<CarouselApi>();
  const [variantId, setVariantId] = useState<string>(
    imageVariants[0]?.id ?? "",
  );
  const [isFavorite, setIsFavorite] = useState(
    "isWishlist" in product ? product.isWishlist : false,
  );

  useEffect(() => {
    if (!api) return;

    const onSelect = () => {
      const index = api.selectedScrollSnap();
      const id = imageVariants[index]?.id;
      if (id) setVariantId(id);
    };

    api.on("select", onSelect);
    return () => {
      api.off("select", onSelect);
    };
  }, [api, imageVariants]);


  const handleFavourite = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    try {
      const res = await addToWishList(product.id);
      console.log(res, "res of wihs");
      toast.success(res.message);
      setIsFavorite(!isFavorite);
    } catch (error) {
      toast.error(
        error instanceof Error
          ? error.message
          : "Failed to update favorite list",
      );
    }
  };

  const handleNavigate = () => {
    const productId = String(product.id);
    const query = variantId ? `?variantId=${variantId}` : "";
    router.push(`/products/${productId}${query}`);
  };

  const title = (("name" in product ? product.name : null) ??
    ("title" in product ? product.title : null) ??
    "Untitled product") as unknown as string;

  const priceNumber = Number(product.price || 0);
  const finalPrice =
    "finalPrice" in product ? product.finalPrice : priceNumber.toFixed(2);

  const originalPrice =
    "originalPrice" in product ? Number(product.originalPrice) : null;

  const hasDiscount =
    originalPrice !== null && !isNaN(originalPrice) && originalPrice > 0;

  return (
    <div className="group relative overflow-hidden rounded-xl h-52 lg:h-75 hover:shadow-xl duration-300">
      <Carousel
        setApi={setApi}
        className="w-full relative"
        opts={{ watchDrag: true }}
      >
        <CarouselContent>
          {imageVariants.length > 0 ? (
            imageVariants.map((variant) => (
              <CarouselItem key={variant.id} onClick={handleNavigate}>
                <Image
                  width={500}
                  height={500}
                  src={resolveImageUrl(variant.mediaUrl)}
                  alt={`image ${variant.id}`}
                  className="object-cover w-full rounded-xl h-52 lg:h-75 group-hover:scale-103 transition-all duration-300 ease-in-out cursor-pointer"
                />
              </CarouselItem>
            ))
          ) : (
            <div className="flex h-52 lg:h-75 items-center justify-center rounded-xl bg-muted text-muted-foreground">
              No image available
            </div>
          )}
        </CarouselContent>
        <CarouselPrevious className="absolute left-2 border-primary top-1/2 -translate-y-1/2 z-10" />
        <CarouselNext className="absolute right-2 top-1/2 -translate-y-1/2 z-10 border-primary" />
      </Carousel>

      <div className="absolute top-3 right-3 z-10">
        <IconButton
          onClick={handleFavourite}
          variant="destructive"
          className={cn(
            "bg-card hover:text-destructive cursor-pointer border border-primary/25 text-muted-foreground w-8 h-8 hover:bg-card rounded-full duration-200",
            isFavorite && "text-destructive",
          )}
        >
          <Heart
            className={cn(
              "size-4.5 hover:fill-destructive",
              isFavorite && "fill-destructive",
            )}
          />
        </IconButton>
      </div>

      {product.badge && (
        <div className="absolute top-3 left-3 z-10 capitalize">
          <Badge className="border border-card/50">{product.badge}</Badge>
        </div>
      )}

      <div
        onClick={handleNavigate}
        className="absolute bottom-3 left-3 right-3 bg-linear-to-t from-primary to-primary/50 px-1.5 lg:px-3 py-0.5 lg:py-2 border rounded-lg text-card cursor-pointer"
      >
        <h3 className="font-semibold text-sm lg:text-xl line-clamp-1">
          {String(title)}
        </h3>

        <span>
          <span className="text-sm lg:text-xl font-medium">${finalPrice}</span>

          {hasDiscount && originalPrice !== null && (
            <span className="text-xs lg:text-base line-through ml-2">
              ${originalPrice.toFixed(2)}
            </span>
          )}
        </span>
      </div>
    </div>
  );
}
