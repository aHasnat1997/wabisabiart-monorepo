"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
} from "@/components/ui/carousel";
import type { CarouselApi } from "@/components/ui/carousel";
import { ChevronLeft, ChevronRight } from "lucide-react";
import ProductCard from "./card";
import { products } from "@/const/product";
import SectionTitle from "@/components/SectionTitle";
import { Product } from "@/types/product";
import EmptySection from "@/components/emptySection";

export default function Deals({ dealsData }: { dealsData: Product[] }) {
  const [api, setApi] = useState<CarouselApi | null>(null);

  return (
    <section className="mt-20">
      {/* SECTION HEADER WITH EXTERNAL CONTROLS */}
      <SectionTitle
        title="Todays Big Deals"
        // date="Ends Date: 20 May 2026"
        button={
          <span className="flex gap-2">
            <Button
              className="rounded-full"
              size="icon-sm"
              onClick={() => api?.scrollPrev()}
            >
              <ChevronLeft />
            </Button>

            <Button
              className="rounded-full"
              size="icon-sm"
              onClick={() => api?.scrollNext()}
            >
              <ChevronRight />
            </Button>
          </span>
        }
      />

      {/* CAROUSEL */}
      {dealsData?.length ? (
        <div className="overflow-visible relative px-2 sm:px-0">
          <Carousel setApi={setApi} className="w-full">
            <CarouselContent className="-ml-1 flex gap-2 responsive-tabs">
              {dealsData?.map((product) => (
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
        <EmptySection title="No deals available" />
      )}
    </section>
  );
}
