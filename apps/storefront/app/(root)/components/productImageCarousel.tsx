"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import Image from "next/image";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselApi,
} from "@/components/ui/carousel";
import { ChevronLeft, ChevronRight, Flag } from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { ProductVariant } from "@/types/productDetails";
import { useRouter, usePathname, useSearchParams } from "next/navigation";

export default function ProductImageCarousel({
  variants,
  productId,
}: {
  variants: ProductVariant[];
  productId: string;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const variantId = searchParams.get("variantId");
  const [api, setApi] = useState<CarouselApi>();
  const [current, setCurrent] = useState(0);
  const thumbContainerRef = useRef<HTMLDivElement>(null);
  const [showLeftArrow, setShowLeftArrow] = useState(false);
  const [showRightArrow, setShowRightArrow] = useState(false);
  const searchParamsRef = useRef(searchParams);

  useEffect(() => {
    searchParamsRef.current = searchParams;
  }, [searchParams]);

  /* Sync carousel index + update variantId in URL */
  useEffect(() => {
    if (!api) return;

    const updateCurrent = () => {
      const index = api.selectedScrollSnap();
      setCurrent(index);

      const currentVariantId = variants[index]?.id;

      // Only touch the URL if variantId actually needs to change.
      // Previously this ran unconditionally on mount too, which caused
      // a race with other navigations (e.g. the Report link) writing
      // to the URL at the same time — whichever replace resolved last
      // would silently win, making the first click look like it did nothing.
      if (
        currentVariantId &&
        searchParamsRef.current.get("variantId") !== currentVariantId
      ) {
        const params = new URLSearchParams(searchParamsRef.current.toString());
        params.set("variantId", currentVariantId);
        router.replace(`${pathname}?${params.toString()}`, { scroll: false });
      }
    };;

    updateCurrent();
    api.on("select", updateCurrent);

    return () => {
      api.off("select", updateCurrent);
    };
  }, [api, variants, pathname, router]);

  /* Scroll to variantId on mount */
  useEffect(() => {
    if (!api || !variantId) return;

    const index = variants.findIndex((v) => v.id === variantId);
    if (index !== -1) {
      api.scrollTo(index, true);
    }
  }, [api, variantId, variants]);

  /* Thumbnail scroll arrows visibility */
  useEffect(() => {
    const checkScroll = () => {
      if (!thumbContainerRef.current) return;

      const container = thumbContainerRef.current;
      setShowLeftArrow(container.scrollLeft > 0);
      setShowRightArrow(
        container.scrollLeft + container.clientWidth <
          container.scrollWidth - 1,
      );
    };

    checkScroll();
    window.addEventListener("resize", checkScroll);

    const container = thumbContainerRef.current;
    container?.addEventListener("scroll", checkScroll);

    return () => {
      window.removeEventListener("resize", checkScroll);
      container?.removeEventListener("scroll", checkScroll);
    };
  }, [variants]);

  /* Keep active thumbnail in view */
  useEffect(() => {
    if (!thumbContainerRef.current) return;

    const thumb = thumbContainerRef.current.children[current] as HTMLElement;
    if (!thumb) return;

    const container = thumbContainerRef.current;
    const thumbRect = thumb.getBoundingClientRect();
    const containerRect = container.getBoundingClientRect();

    if (thumbRect.left < containerRect.left) {
      container.scrollTo({
        left: container.scrollLeft + (thumbRect.left - containerRect.left) - 10,
        behavior: "smooth",
      });
    } else if (thumbRect.right > containerRect.right) {
      container.scrollTo({
        left:
          container.scrollLeft + (thumbRect.right - containerRect.right) + 10,
        behavior: "smooth",
      });
    }
  }, [current]);

  const scrollTo = useCallback(
    (index: number) => {
      api?.scrollTo(index);
    },
    [api],
  );

  const scrollThumbsLeft = () => {
    thumbContainerRef.current?.scrollBy({ left: -200, behavior: "smooth" });
  };

  const scrollThumbsRight = () => {
    thumbContainerRef.current?.scrollBy({ left: 200, behavior: "smooth" });
  };

  // Preserve existing query params (e.g. variantId) instead of overwriting
  // the whole query string, so the Report link doesn't clobber carousel state.
  const reportHref = (() => {
    const params = new URLSearchParams(searchParams.toString());
    params.set("report-product-modal", "report-product");
    params.set("productId", productId);
    return `?${params.toString()}`;
  })();

  return (
    <div className="w-full lg:w-1/2 lg:sticky top-4">
      {/* Main Carousel */}
      <Carousel setApi={setApi} className="w-full">
        <CarouselContent>
          {variants.map((variant: ProductVariant, index: number) => (
            <CarouselItem key={variant.id}>
              <div className="relative aspect-square overflow-hidden rounded-xl">
                <Image
                  src={`${process.env.NEXT_PUBLIC_MEDIA_URL}${variant.mediaUrl}`}
                  alt={`${variant.name} - ${variant.id}`}
                  fill
                  className="object-cover"
                  priority={index === 0}
                />
              </div>
            </CarouselItem>
          ))}
        </CarouselContent>
      </Carousel>

      <div className="text-end">
        <Link scroll={false} href={reportHref}>
          <Button
            className="text-foreground cursor-pointer"
            size="sm"
            variant="link"
          >
            <Flag /> Report this Item
          </Button>
        </Link>
      </div>

      {/* Thumbnails */}
      <div className="mt-2 responsive-tabs relative">
        {showLeftArrow && variants.length > 4 && (
          <Button
            onClick={scrollThumbsLeft}
            size="icon"
            variant="outline"
            className="absolute left-0 top-1/2 -translate-y-1/2 z-10 rounded-full"
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
        )}

        {showRightArrow && variants.length > 4 && (
          <Button
            onClick={scrollThumbsRight}
            size="icon"
            variant="outline"
            className="absolute right-0 top-1/2 -translate-y-1/2 z-10 rounded-full"
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
        )}

        <div ref={thumbContainerRef} className="flex gap-2 overflow-x-hidden">
          {variants.map((variant: ProductVariant, index: number) => (
            <button
              key={variant.id}
              onClick={() => scrollTo(index)}
              className={`shrink-0 border-2 rounded-lg transition-all ${
                current === index ? "border-primary" : "hover:border-primary"
              }`}
            >
              <div className="relative w-20 h-20 md:w-30 xl:w-40 xl:h-40 md:h-30 overflow-hidden rounded-lg">
                <Image
                  src={`${process.env.NEXT_PUBLIC_MEDIA_URL}${variant.mediaUrl}`}
                  alt={`Thumbnail ${index + 1}`}
                  fill
                  className="object-cover"
                />
                {current === index && (
                  <div className="absolute inset-0 bg-primary/10" />
                )}
              </div>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}