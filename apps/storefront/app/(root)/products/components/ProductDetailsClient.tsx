"use client";

import { Badge } from "@/components/ui/badge";
import { Rating, RatingButton } from "@/components/ui/shadcn-io/rating";
import { Button } from "@/components/ui/button";
import { LiaShoppingBagSolid } from "react-icons/lia";
import { IconButton } from "@/components/animate-ui/components/buttons/icon";
import { cn, resolveImageUrl } from "@/lib/utils";
import { Award, ExternalLink, Heart } from "lucide-react";
import LocationIcon from "@/assets/icons/location.svg";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import Link from "next/link";
import { BiMessageRoundedDetail } from "react-icons/bi";
import { MdVerifiedUser } from "react-icons/md";
import { CiEdit } from "react-icons/ci";
import Image from "next/image";
import ProductImageCarousel from "@/app/(root)/components/productImageCarousel";
import { useEffect, useState } from "react";
import { addToCart, addToWishList } from "../../components/action";
import { ProductDetail } from "@/types/productDetails";
import { getInitials } from "@/lib/getInitials";
import { Spinner } from "@/components/ui/spinner";
import VariantOptions from "../components/VariantOptions";
import { QuantityInput } from "@/components/ui/quantity-input";
import { toast } from "sonner";
import { isUser } from "@/lib/auth-server";
import { Review } from "@/types/reviews";
import HtmlRenderer from "@/components/htmlRenderer";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/animate-ui/components/radix/accordionCopy";

interface Props {
  data: ProductDetail;
  variantId: string | null;
  reviews: Review[];
}

export default function ProductDetailsClient({
  data,
  variantId,
  reviews,
}: Props) {
  const [cartQuantity, setCartQuantity] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [isFavorite, setIsFavorite] = useState<boolean>(data.isWishlist);
  const [authenticated, setAuthenticated] = useState(false);

  useEffect(() => {
    const checkAuth = async () => {
      const auth = await isUser();
      setAuthenticated(auth);
    };
    checkAuth();
  }, []);

  const activeVariant =
    data.variants.find((v) => v.id === variantId) ?? data.variants[0];

  const handleAddToCart = async () => {
    if (!activeVariant) return;
    setIsLoading(true);
    try {
      const res = await addToCart({
        productId: data.id,
        variantId: activeVariant.id,
        quantity: cartQuantity,
      });
      toast.success(res?.message);
    } catch (error: unknown) {
      toast.error(
        error instanceof Error ? error.message : "Something went wrong",
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleFavourite = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    try {
      const res = await addToWishList(data.id);
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

  return (
    <>
      {/* HERO SECTION */}
      <section className="flex flex-col lg:flex-row items-start gap-7">
        <ProductImageCarousel variants={data.variants} productId={data.id} />
        <div className="w-full lg:w-1/2">
          <h1 className="text-[32px] xl:text-[40px] font-semibold mb-3">
            {data.title}
          </h1>
          <div className="flex items-center gap-3">
            <Rating defaultValue={4.5} readOnly>
              {Array.from({ length: 5 }).map((_, i) => (
                <RatingButton className="text-orange-400" key={i} />
              ))}
            </Rating>
            <p className="text-xl text-foreground">4.5</p>
            <p className="text-xl text-muted-foreground">(71 reviews)</p>
          </div>

          <div className="flex items-center gap-4 my-3.5">
            <span className="text-2xl xl:text-[32px] text-foreground">
              ${data.finalPrice}
            </span>
            {data.discountType !== "none" && (
              <span className="text-base xl:text-2xl line-through ml-2 text-muted-foreground">
                ${data.price}
              </span>
            )}
            {data.discountType !== "none" && (
              <Badge className="capitalize">
                {data.discountType === "percentage"
                  ? `${data.discountValue}% off`
                  : `$${data.discountValue} off`}
              </Badge>
            )}
          </div>

          <p className="text-muted-foreground text-base xl:text-xl text-justify border-b pb-4 leading-6">
            {data.subtitle}
          </p>
          <VariantOptions data={data} variantId={variantId} />

          <div className="pt-4 space-y-3.5">
            <div className="flex items-center gap-4">
              <QuantityInput
                onChange={(value) => setCartQuantity(value)}
                min={1}
                max={activeVariant?.quantity || data.totalQuantity || 0}
                defaultValue={1}
              />
              <p className="text-muted-foreground text-base md:text-xl">
                Only {activeVariant?.quantity ?? 0} left in stock
              </p>
            </div>

            <div className="flex items-center gap-4 w-full">
              <Button
                disabled={isLoading}
                onClick={handleAddToCart}
                className="h-10! xl:h-12! flex-1 rounded-full text-base xl:text-lg"
              >
                {isLoading ? (
                  <Spinner className="size-6" />
                ) : (
                  <LiaShoppingBagSolid className="size-6" />
                )}
                Add to Cart
              </Button>
              <IconButton
                variant="destructive"
                className={cn(
                  "bg-card hover:text-destructive cursor-pointer text-primary w-10 xl:w-12 h-10 xl:h-12 shrink-0 border-2 border-primary hover:bg-card rounded-full duration-200",
                  isFavorite && "text-destructive",
                )}
                onClick={handleFavourite}
              >
                <Heart
                  className={cn(
                    "size-6 xl:size-7 hover:fill-destructive",
                    isFavorite && "fill-destructive",
                  )}
                />
              </IconButton>
            </div>
          </div>

          {/* Seller Card */}
          <div className="bg-background mt-6 p-5 rounded-lg">
            <div className="flex flex-col md:flex-row gap-2 items-start justify-between">
              <div className="flex flex-col md:flex-row gap-4">
                <Avatar className="w-16 h-16">
                  <AvatarImage
                    src={data.seller.sellerProfile?.shopLogo || ""}
                    alt={data.seller.sellerProfile?.shopName}
                  />
                  <AvatarFallback className="uppercase font-medium text-xl text-card bg-primary">
                    {getInitials(
                      data.seller.sellerProfile?.shopName ||
                        data.seller.fullName,
                    )}
                  </AvatarFallback>
                </Avatar>
                <div className="space-y-1 xl:space-y-2">
                  <div className="flex flex-col md:flex-row md:items-center md:gap-6">
                    <h4 className="text-2xl text-foreground">
                      {data.seller.sellerProfile?.shopName}
                    </h4>
                    {/* <Link
                      className="text-primary hover:underline flex items-center gap-1.5"
                      href={`/seller-profile?sellerId=${data.seller.sellerProfile?.id}`}
                    >
                      Visit Shop <ExternalLink size={20} />
                    </Link> */}
                  </div>
                  <p className="flex items-center gap-2 text-muted-foreground">
                    <LocationIcon /> {data.seller.sellerProfile?.address}
                  </p>
                  <div className="flex items-center gap-2">
                    <Rating
                      defaultValue={parseInt(
                        data.seller.sellerProfile?.averageRating,
                      )}
                      readOnly
                    >
                      {Array.from({ length: 5 }).map((_, i) => (
                        <RatingButton className="text-orange-400" key={i} />
                      ))}
                    </Rating>
                    <p>({data.seller.sellerProfile?.totalReviews} reviews)</p>
                  </div>
                </div>
              </div>
              {/* <div className="flex items-center gap-1.5">
                <Award className="text-primary size-6 xl:size-8" />
                <span className="flex flex-col gap-0">
                  <p className="text-sm xl:text-base text-muted-foreground">
                    Sales
                  </p>
                  <h4 className="text-foreground text-base xl:text-xl">
                    {data.seller.sellerProfile?.totalSales}
                  </h4>
                </span>
              </div> */}
              <Link
                className="text-primary hover:underline flex items-center gap-1.5"
                href={`/seller-profile?sellerId=${data.seller.sellerProfile?.id}`}
              >
                Visit Shop <ExternalLink size={20} />
              </Link>
            </div>

            <p className="text-muted-foreground text-base xl:text-xl my-5 text-justify leading-6">
              {data.seller.sellerProfile?.shopDescription}
            </p>
            <div className="flex items-center gap-4 w-full">
              <Button
                variant="outline"
                className="h-10 xl:h-12 flex-1 bg-card text-primary border-primary rounded-full text-base xl:text-lg"
              >
                <BiMessageRoundedDetail className="size-6" /> Contact Maker
              </Button>
              <IconButton
                variant="destructive"
                className={cn(
                  "bg-card hover:text-destructive cursor-pointer text-primary w-10 xl:w-12 h-10 xl:h-12 shrink-0 border-2 border-primary hover:bg-card rounded-full duration-200",
                  isFavorite && "text-destructive",
                )}
              >
                <Heart
                  className={cn(
                    "size-6 xl:size-7 hover:fill-destructive",
                    isFavorite && "fill-destructive",
                  )}
                />
              </IconButton>
            </div>
          </div>
        </div>
      </section>

      <section className="mt-16">
        <h2 className="text-2xl font-semibold">Product Details</h2>
        <div>
          {data.description ? (
            <HtmlRenderer html={data.description} />
          ) : (
            <p>No description available.</p>
          )}
        </div>
      </section>

      {/* REVIEWS SECTION */}
      <section className="mt-16 flex flex-col-reverse lg:flex-row items-start gap-16">
        <div className="w-full lg:w-2/3">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
            <h3 className="text-xl md:text-2xl font-semibold">
              Ratings & Reviews of {data.title}
            </h3>
            {authenticated && (
              <Link
                scroll={false}
                href={`?add-review-modal=add-review&productId=${data.id}`}
              >
                <Button
                  size="lg"
                  variant="outline"
                  className="rounded-full border-primary text-primary"
                >
                  <CiEdit /> Write a Review
                </Button>
              </Link>
            )}
          </div>
          <div className="mt-4 space-y-3">
            <h2 className="text-[40px] font-bold text-foreground">
              4.5
              <span className="text-muted-foreground text-2xl font-normal">
                /5
              </span>
            </h2>
            <Rating defaultValue={4.5} readOnly>
              {Array.from({ length: 5 }).map((_, i) => (
                <RatingButton size={32} className="text-orange-400" key={i} />
              ))}
            </Rating>
            <p className="text-muted-foreground text-xl">71 reviews</p>
          </div>

          <div className="mt-12">
            <h4 className="text-xl font-medium">Product Reviews</h4>
            <div className="mt-2">
              {reviews.map((review, index) => (
                <div key={index} className="space-y-2 border-b py-4">
                  <span className="flex items-center gap-2">
                    <h4 className="text-foreground font-semibold">
                      {review?.user?.fullName || "Anonymous"}
                    </h4>
                    {review.verifiedPurchase && (
                      <p className="flex items-center gap-2 text-muted-foreground">
                        Verified Purchase{" "}
                        <MdVerifiedUser className="text-primary" />
                      </p>
                    )}
                  </span>
                  <Rating defaultValue={review.rating} readOnly>
                    {Array.from({ length: 5 }).map((_, i) => (
                      <RatingButton className="text-orange-400" key={i} />
                    ))}
                  </Rating>
                  <p className="text-muted-foreground text-justify">
                    {review.comment}
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {review.images?.map((img, idx) => (
                      <Image
                        className="h-24 bg-background w-auto rounded-lg"
                        src={resolveImageUrl(img)}
                        alt="product"
                        key={idx}
                        width={200}
                        height={200}
                      />
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
        <div className="w-full lg:w-1/3 lg:sticky top-4">
          <Accordion
            type="single"
            collapsible
            defaultValue={faqData[0]?.id}
            className="w-full"
          >
            {faqData.map((item) => (
              <AccordionItem
                className="mb-6 bg-background rounded-3xl border-b-0!"
                key={item.id}
                value={item.id}
              >
                <AccordionTrigger className="text-base cursor-pointer md:text-xl">
                  {item.title}
                </AccordionTrigger>
                <AccordionContent className="p-5">
                  <ul className="space-y-2 md:space-y-4">
                    {item.content.map((text, index) => (
                      <li
                        key={index}
                        className="text-sm md:text-lg text-justify text-muted-foreground"
                      >
                        {text}
                      </li>
                    ))}
                  </ul>
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </div>
      </section>
    </>
  );
}

const faqData = [
  {
    id: "shipping-return",
    title: "Shipping & Return Policy",
    content: [
      "Order today to get by Nov 19–28",
      "Returns & exchanges accepted within 30 days",
      "Cost to ship: USD 4.99",
      "Ships from: China",
    ],
  },
  {
    id: "did-you-know",
    title: "Did You Know?",
    content: [
      "Each piece is carefully crafted with attention to detail.",
      "Small variations in color and texture make every item unique.",
      "Handmade products support skilled artisans and traditional techniques.",
    ],
  },
  {
    id: "meet-your-seller",
    title: "Meet Your Seller",
    content: [
      "We are a passionate team dedicated to creating high-quality handmade products.",
      "Our mission is to blend craftsmanship with modern design.",
      "Customer satisfaction and product quality are our top priorities.",
    ],
  },
];
