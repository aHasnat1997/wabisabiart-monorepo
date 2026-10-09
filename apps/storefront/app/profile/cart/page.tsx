import { Badge } from "@/components/ui/badge";
import Image from "next/image";
import HatIcon from "@/assets/icons/hat.svg";
import { Rating, RatingButton } from "@/components/ui/shadcn-io/rating";
import CheckoutSummary from "./component/checkoutSummery";
import SectionTitle from "@/components/SectionTitle";
import { getCartCalculation, getCartProduct } from "./component/actions";
import { Cart, CartCalculation } from "@/types/order";
import CartBtn from "./component/CartBtn";
import { ShoppingCart } from "lucide-react";
import { Button } from "@/components/animate-ui/components/buttons/button";
import Link from "next/link";

export default async function CartPage() {
  let cartProduct: Cart | null = null;
  let cartCalculation: CartCalculation | null = null;

  try {
    cartProduct = await getCartProduct();
  } catch (error) {
    console.error(error);
  }

  try {
    cartCalculation = await getCartCalculation();
  } catch (error) {
    console.error(error);
  }

  return (
    <div>
      <SectionTitle title="My Cart" />
      <div className="flex flex-col-reverse md:flex-row gap-12 md:gap-2 xl:gap-4 items-start">
        <section className="grid grid-cols-1 gap-8 w-full md:w-1/2 xl:w-2/3">
          {cartProduct?.items?.length === 0 || !cartProduct?.items ? (
            <div className="flex flex-col items-center justify-center py-16 gap-4 text-center">
              <ShoppingCart className="w-16 h-16 text-muted-foreground/40" />
              <div className="space-y-1">
                <h2 className="text-xl font-medium text-foreground">
                  Your cart is empty
                </h2>
                <p className="text-sm text-muted-foreground">
                  Looks like you haven&apos;t added anything yet.
                </p>
              </div>
              <Button asChild>
                <Link href="/products">Browse Products</Link>
              </Button>
            </div>
          ) : (
            cartProduct.items.map((item) => (
              <div key={item.id}>
                <div className="border p-3 lg:p-4 xl:p-5 rounded-lg">
                  <div className="flex flex-col xl:flex-row gap-6 items-start border-b pb-4">
                    <Image
                      className="h-54 w-full xl:w-1/3 rounded-md border xl:rounded-lg object-cover"
                      src={`${process.env.NEXT_PUBLIC_MEDIA_URL}${item?.variant?.mediaUrl}`}
                      alt={item?.product?.title}
                      height={500}
                      width={500}
                    />
                    <div className="w-full xl:w-2/3 space-y-3">
                      <h2 className="text-xl lg:text-2xl font-medium line-clamp-2 text-foreground">
                        {item?.product?.title}
                      </h2>
                      <div className="flex justify-between items-center">
                        <span className="flex items-center gap-4">
                          <p className="text-xl lg:text-2xl font-medium text-foreground">
                            ${item?.product?.finalPrice}
                          </p>
                          {item.product.discountType !== "none" && (
                            <p className="text-lg lg:text-xl text-muted-foreground line-through">
                              ${item?.product?.price}
                            </p>
                          )}
                        </span>
                        {item.product.discountType !== "none" && (
                          <Badge>
                            {item.product?.discountType === "percentage"
                              ? `${item.product?.discountValue}% off`
                              : `$${item.product?.discountValue} off`}
                          </Badge>
                        )}
                      </div>
                      <div className="flex flex-wrap gap-2 items-center">
                        {item?.variant?.options?.map((option, index) => (
                          <span
                            key={index}
                            className="text-muted-foreground text-sm"
                          >
                            {option?.name === "Color" ? (
                              <span className="flex items-center gap-3">
                                Color:{" "}
                                <span
                                  style={{ backgroundColor: option?.value }}
                                  className={`w-4 h-4 ring-2 ring-primary/50 border rounded-full shadow-md bg-[${option?.value}] inline-block`}
                                ></span>
                              </span>
                            ) : (
                              <Badge
                                className="border-none bg-sidebar-border"
                                variant={"outline"}
                              >
                                {option?.name} : {option?.value}
                              </Badge>
                            )}
                          </span>
                        ))}
                      </div>
                      <CartBtn
                        productId={item?.productId}
                        // list_of_item_ids={item?.id}
                        quantity={item?.quantity}
                        maxQuantity={item?.variant?.quantity}
                      />
                    </div>
                  </div>
                  <div className="pt-4 flex flex-col lg:flex-row items-center justify-between gap-3">
                    <span className="flex items-center gap-2">
                      <HatIcon />
                      <p className="text-lg text-nowrap font-medium text-foreground">
                        {item?.product?.seller?.sellerProfile?.shopName}
                      </p>
                    </span>
                    <span className="flex items-center gap-1 text-nowrap">
                      <Rating
                        defaultValue={parseInt(
                          item?.product?.seller?.sellerProfile?.averageRating,
                        )}
                        readOnly
                      >
                        {Array.from({ length: 5 }).map((_, index) => (
                          <RatingButton
                            className="text-orange-400"
                            key={index}
                          />
                        ))}
                      </Rating>
                      <p className="text-muted-foreground text-sm">
                        ({item?.product?.seller?.sellerProfile?.totalReviews}{" "}
                        reviews)
                      </p>
                    </span>
                  </div>
                </div>
              </div>
            ))
          )}
        </section>

        <CheckoutSummary mode="cart" cartCalculation={cartCalculation} />
      </div>
    </div>
  );
}
