"use client";

import {
  Carousel,
  CarouselContent,
  CarouselItem,
} from "@/components/ui/carousel";
import { Button } from "@/components/ui/button";
import Image from "next/image";
import { Search } from "lucide-react";
import Autoplay from "embla-carousel-autoplay";
import { useRef } from "react";
import SectionTitle from "@/components/SectionTitle";
import Link from "next/link";
import { FeaturedCategory } from "@/types/category";
import { resolveImageUrl } from "@/lib/utils";
import EmptySection from "@/components/emptySection";

export default function Gifts({
  giftCategories,
}: {
  giftCategories: FeaturedCategory[];
}) {
  const availableGifts = giftCategories?.filter(
    (category) => category?.latestVariantImage,
  );

  const autoplay = useRef<ReturnType<typeof Autoplay> | null>(null);

  if (!autoplay.current) {
    autoplay.current = Autoplay({ delay: 2000, stopOnInteraction: false });
  }
  return (
    <section className="mt-20">
      {/* SECTION HEADER WITH EXTERNAL CONTROLS */}
      <SectionTitle
        title="Gifts that feel special"
        button={
          <Link href="/products/gifts">
            <Button className="rounded-full" variant={"outline"}>
              View All
            </Button>
          </Link>
        }
      />

      {availableGifts.length ? (
        <div className="overflow-hidden relative">
          <Carousel plugins={[autoplay.current]} className="w-full">
            <CarouselContent className="-ml-1 flex gap-1 md:gap-2">
              {giftCategories
                .filter((category) => category?.latestVariantImage)
                .map((category, idx) => (
                  <CarouselItem
                    key={idx}
                    className="basis-1/2 md:basis-1/3 lg:basis-1/4 xl:basis-1/5 pl-2"
                  >
                    <Link href={`/products/gifts?label=${category?.name}`}>
                      <div className="relative group overflow-hidden rounded-xl h-48 md:h-60 cursor-pointer">
                        <Image
                          width={500}
                          height={500}
                          src={
                            resolveImageUrl(category?.latestVariantImage) || ""
                          }
                          alt={category?.name}
                          className="object-cover w-full h-full"
                        />
                        <div className="absolute bottom-3 left-1/2 transform -translate-x-1/2 w-fit px-5 py-1.5">
                          <Button
                            className="rounded-full bg-secondary/75 text-sm md:text-base font-semibold"
                            variant={"secondary"}
                          >
                            <Search /> {category?.name}
                          </Button>
                        </div>
                      </div>
                    </Link>
                  </CarouselItem>
                ))}
            </CarouselContent>
          </Carousel>
        </div>
      ) : (
        <EmptySection title="No gifts available" />
      )}
    </section>
  );
}
