"use client";

import {
  Carousel,
  CarouselContent,
  CarouselItem,
} from "@/components/ui/carousel";
import { Button } from "@/components/ui/button";
import Autoplay from "embla-carousel-autoplay";
import { useRef } from "react";
import SectionTitle from "@/components/SectionTitle";
import Link from "next/link";
import { FeaturedCategory } from "@/types/category";
import ProductCard from "./card";
import EmptySection from "@/components/emptySection";

export default function CharacterCostumes({
  featured,
}: {
  featured: FeaturedCategory;
}) {
  const autoplay = useRef<ReturnType<typeof Autoplay> | null>(null);

  if (!autoplay.current) {
    autoplay.current = Autoplay({ delay: 2000, stopOnInteraction: false });
  }

  console.log("Featured Category:", featured.products);
  return (
    <section className="mt-20">
      {/* SECTION HEADER WITH EXTERNAL CONTROLS */}
      <SectionTitle
        title={featured?.name || "Featured Products"}
        button={
          <Link href={`/products?filter[categoryId]=${featured?.id}`}>
            <Button className="rounded-full" variant={"outline"}>
              View All
            </Button>
          </Link>
        }
      />

      {featured?.products?.length ? (
        <div className="overflow-hidden relative">
          <Carousel plugins={[autoplay.current]} className="w-full">
            <CarouselContent className="-ml-1 flex gap-2 responsive-tabs">
              {featured?.products?.map((product) => (
                <CarouselItem
                  key={product.id}
                  className="basis-1/2 md:basis-1/3 xl:basis-1/4 pl-2"
                >
                  <ProductCard product={product} />
                </CarouselItem>
              ))}
            </CarouselContent>
          </Carousel>
        </div>
      ) : (
        <EmptySection title={`No products in ${featured.name}`} />
      )}
    </section>
  );
}
