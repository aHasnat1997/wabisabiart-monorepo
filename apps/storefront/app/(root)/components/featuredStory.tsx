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
import Image from "next/image";
import { RiVerifiedBadgeFill } from "react-icons/ri";
import { FaStar } from "react-icons/fa";
import SectionTitle from "@/components/SectionTitle";
import { FeaturedShop } from "@/types/seller-form";
import { resolveImageUrl } from "@/lib/utils";
import EmptySection from "@/components/emptySection";

export default function FeaturedStory({
  featuredStory,
}: {
  featuredStory: FeaturedShop[];
}) {
  const [api, setApi] = useState<CarouselApi | null>(null);

  return (
    <section id="maker-story" className="mt-20">
      {/* SECTION HEADER WITH EXTERNAL CONTROLS */}
      <SectionTitle
        title="Featured Maker Story"
        button={
          <span className="flex gap-2">
            <Button
              variant="outline"
              className="rounded-full"
              size="icon-sm"
              onClick={() => api?.scrollPrev()}
            >
              <ChevronLeft className="w-5 h-5" />
            </Button>

            <Button
              variant="outline"
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
      {featuredStory?.length ? (
        <div className="overflow-hidden relative">
          <Carousel setApi={setApi} className="w-full">
            <CarouselContent className="-ml-1 flex gap-2">
              {featuredStory.map((product) => (
                <CarouselItem
                  key={product.id}
                  className="basis-full md:basis-1/2 pl-2"
                >
                  <div className="group relative overflow-hidden rounded-2xl h-84 lg:h-100 xl:h-125 cursor-pointer">
                    <Image
                      width={1000}
                      height={1000}
                      src={resolveImageUrl(product.user.avatarUrl)}
                      alt={product.user.fullName}
                      className="object-cover w-full h-full"
                    />

                    <div className="absolute bottom-3 py-1.5 lg:py-3 mx-4 lg:w-2/3 xl:1/2 px-3 lg:px-5 bg-card rounded-lg text-foreground">
                      <h3 className="font-bold text-xl lg:text-2xl">
                        {product.user.fullName}
                      </h3>
                      <h4 className="text-xs text-primary">
                        {product.shopDescription}
                      </h4>
                      <h3 className="font-semibold text-sm lg:text-base flex items-center gap-2 my-2 lg:my-4">
                        {product.shopName}{" "}
                        {
                          <span className="text-primary text-lg lg:text-xl">
                            <RiVerifiedBadgeFill />
                          </span>
                        }
                      </h3>
                      <div>
                        <p className="text-xs text-muted-foreground flex items-center gap-2">
                          <FaStar className="text-orange-400 size-4 lg:size-5" />
                          {product.averageRating} ({product.totalReviews})
                          Reviews
                        </p>
                      </div>
                    </div>
                  </div>
                </CarouselItem>
              ))}
            </CarouselContent>
          </Carousel>
        </div>
      ) : (
        <EmptySection title="No maker stories available" />
      )}
    </section>
  );
}

const makers = [
  {
    id: 1,
    name: "Amina Badu",
    role: "Trusted Maker",
    studio: "Amina Textiles Studio",
    rating: 4.9,
    reviews: 162,
    verified: true,
    image:
      "https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=400&q=80",
  },
  {
    id: 2,
    name: "Rahim Uddin",
    role: "Top Seller",
    studio: "Rahim Leather Works",
    rating: 4.8,
    reviews: 210,
    verified: true,
    image:
      "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&w=400&q=80",
  },
  {
    id: 3,
    name: "Sadia Noor",
    role: "Premium Maker",
    studio: "Noor Handicrafts",
    rating: 4.7,
    reviews: 98,
    verified: false,
    image:
      "https://images.unsplash.com/photo-1524504388940-b1c1722653e1?auto=format&fit=crop&w=400&q=80",
  },
  {
    id: 4,
    name: "Imran Khan",
    role: "Trusted Maker",
    studio: "Imran Wood Studio",
    rating: 4.9,
    reviews: 184,
    verified: true,
    image:
      "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=400&q=80",
  },
  {
    id: 5,
    name: "Farzana Akter",
    role: "Popular Seller",
    studio: "Farzana Fashion House",
    rating: 4.6,
    reviews: 76,
    verified: false,
    image:
      "https://images.unsplash.com/photo-1547425260-76bcadfb4f2c?auto=format&fit=crop&w=400&q=80",
  },
];
