"use client";

import Autoplay from "embla-carousel-autoplay";
import { useRef } from "react";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
} from "@/components/ui/carousel";
import Image from "next/image";
import SectionTitle from "@/components/SectionTitle";
import Link from "next/link";
import { resolveImageUrl } from "@/lib/utils";
import { FeaturedCategory as FeaturedCategoryTypes } from "@/types/category";
import EmptySection from "@/components/emptySection";

export default function FeaturedCategory({
  featured,
}: {
  featured?: FeaturedCategoryTypes[];
}) {
  const autoplay = useRef<ReturnType<typeof Autoplay> | null>(null);

  if (!autoplay.current) {
    autoplay.current = Autoplay({ delay: 2000, stopOnInteraction: false });
  }

  return (
    <section className="mt-20">
      <SectionTitle title="Featured Categories" />

      {featured?.length ? (
        <div className="overflow-hidden relative">
          <Carousel plugins={[autoplay.current]} className="w-full">
            <CarouselContent className="-ml-1 flex gap-1 md:gap-2">
              {featured?.map((item) => {
                // Last product
                const lastProduct = item.products?.[item.products.length - 1];

                // Last variant of last product
                const lastVariant =
                  lastProduct?.variants?.[lastProduct.variants.length - 1];

                // Final image
                const imageUrl = lastVariant?.mediaUrl;

                return (
                  <CarouselItem
                    key={item.id}
                    className="basis-1/2 md:basis-1/3 lg:basis-1/4 xl:basis-1/5 pl-2"
                  >
                    <Link href={`/products?filter[categoryId]=${item.id}`}>
                      <div className="relative group overflow-hidden rounded-xl h-48 md:h-60">
                        <Image
                          width={250}
                          height={250}
                          src={resolveImageUrl(imageUrl)}
                          alt={item.name}
                          className="object-cover w-full h-full transition-transform duration-300 group-hover:scale-110"
                        />

                        {/* Overlay gradient */}
                        <div className="absolute inset-0 bg-linear-to-b from-black/70 via-black/20 to-transparent" />

                        {/* Label text */}
                        <div className="absolute top-0 left-0 right-0 p-4">
                          <h3 className="text-card font-semibold text-base md:text-xl line-clamp-1">
                            {item.name}
                          </h3>
                        </div>
                      </div>
                    </Link>
                  </CarouselItem>
                );
              })}
            </CarouselContent>
          </Carousel>
        </div>
      ) : (
        <EmptySection title="No featured categories available" />
      )}
    </section>
  );
}
