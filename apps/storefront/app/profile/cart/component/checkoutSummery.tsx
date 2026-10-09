"use client";

import { useState } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Input } from "@/components/ui/input";
import { Tag, X } from "lucide-react";
import { Button } from "@/components/animate-ui/components/buttons/button";
import { CartCalculation } from "@/types/order";
import { Checkbox } from "@/components/animate-ui/components/base/checkbox";
import Link from "next/link";

const checkoutFormSchema = z.object({
  couponCode: z.string().optional(),
  markAsGift: z.boolean(),
});

type CheckoutFormValues = z.infer<typeof checkoutFormSchema>;

export default function CheckoutSummary({
  mode,
  cartCalculation,
  shippingAddressId,
}: {
  cartCalculation: CartCalculation | null;
  shippingAddressId?: string | null;
  mode: "checkout" | "cart";
}) {
  const [showCouponInput, setShowCouponInput] = useState(false);
  const [appliedCoupon, setAppliedCoupon] = useState("");

  const form = useForm<CheckoutFormValues>({
    resolver: zodResolver(checkoutFormSchema),
    defaultValues: {
      couponCode: "",
      markAsGift: false,
    },
  });

  const handleApplyCoupon = () => {
    const couponValue = form.getValues("couponCode");
    if (couponValue && couponValue.trim()) {
      setAppliedCoupon(couponValue);
      setShowCouponInput(false);
      console.log("Applied coupon:", couponValue);
    }
  };

  const couponApplied = (cartCalculation?.couponDiscount ?? 0) > 0;

  return (
    <Card className="w-full md:w-1/2 xl:w-1/3 border-0 shadow-none md:sticky top-0 p-0">
      <CardContent className="w-full">
        <div className="space-y-2 lg:space-y-4">
          {/* Item(s) total */}
          <div className="flex justify-between text-base lg:text-xl">
            <span>
              Product ({cartCalculation?.totalItems} item
              {cartCalculation?.totalItems !== 1 ? "s" : ""})
            </span>
            <span>
              $
              {cartCalculation?.itemsTotal !== undefined
                ? cartCalculation.itemsTotal.toFixed(2)
                : "0.00"}
            </span>
          </div>

          {/* Shop discount */}
          <div className="flex justify-between text-base lg:text-xl text-primary">
            <span>Shop discount</span>
            <span>
              - $
              {cartCalculation?.shopDiscount !== undefined
                ? cartCalculation.shopDiscount.toFixed(2)
                : "0.00"}
            </span>
          </div>

          {/* Subtotal */}
          <div className="flex justify-between text-base lg:text-xl">
            <span>Subtotal</span>
            <span>
              $
              {cartCalculation?.subtotal !== undefined
                ? cartCalculation.subtotal.toFixed(2)
                : "0.00"}
            </span>
          </div>

          {/* Shipping */}
          <div className="flex justify-between text-base lg:text-xl">
            <span className="flex items-end gap-2">
              Shipping
              <span className="text-muted-foreground text-sm lg:text-base">
                (to usa)
              </span>
            </span>
            <span>
              $
              {cartCalculation?.shipping !== undefined
                ? cartCalculation.shipping.toFixed(2)
                : "0.00"}
            </span>
          </div>

          <Separator />

          {/* Total */}
          <div className="flex justify-between text-base lg:text-xl font-medium">
            <span>Total</span>
            <span>
              $
              {cartCalculation?.total !== undefined
                ? cartCalculation.total.toFixed(2)
                : "0.00"}
            </span>
          </div>

          {/* Coupon section */}
          {couponApplied ? (
            <div className="flex items-center justify-between p-3 bg-primary/10 border border-primary/30 rounded-xl">
              <div className="flex items-center gap-2">
                <Tag className="w-4 h-4 text-primary" />
                <span className="text-sm font-medium text-primary">
                  Coupon: {appliedCoupon}
                </span>
              </div>
              <span className="text-sm font-medium text-primary">
                - ${cartCalculation?.couponDiscount?.toFixed(2)}
              </span>
            </div>
          ) : showCouponInput ? (
            <div className="py-3.5 space-y-2">
              <p className="text-sm font-medium">Enter coupon code</p>
              <div className="flex gap-2 items-center">
                <Button
                  type="button"
                  variant="destructive"
                  onClick={() => setShowCouponInput(false)}
                >
                  <X className="w-4 h-4" />
                </Button>
                <Input
                  placeholder="Enter code"
                  value={form.watch("couponCode") || ""}
                  onChange={(e) => form.setValue("couponCode", e.target.value)}
                  className="flex-1"
                />
                <Button
                  type="button"
                  onClick={handleApplyCoupon}
                  disabled={!form.watch("couponCode")?.trim()}
                >
                  Apply
                </Button>
              </div>
            </div>
          ) : (
            <Button
              type="button"
              variant="outline"
              onClick={() => setShowCouponInput(true)}
              className="w-full py-6 border-2 border-dashed bg-card text-primary hover:text-primary hover:bg-primary/5 border-primary/50 hover:border-primary font-medium my-5 transition-all"
            >
              <Tag className="w-5 h-5 mr-2" />
              Apply coupon code
            </Button>
          )}

          {/* Mark as gift */}
          <div
            className="flex items-center gap-2 mt-4 border rounded-lg p-3 cursor-pointer"
            onClick={() =>
              form.setValue("markAsGift", !form.watch("markAsGift"))
            }
          >
            <Checkbox
              checked={form.watch("markAsGift")}
              onCheckedChange={(checked) =>
                form.setValue("markAsGift", !!checked)
              }
              onClick={(e) => e.stopPropagation()}
            />

            <label className="flex-1 text-sm font-medium cursor-pointer">
              Mark order as gift
            </label>
          </div>

          {mode === "cart" && (
            <Link href="/profile/cart/check-out">
              <Button className="w-full py-5 text-base rounded-full mt-2">
                Proceed to Checkout
              </Button>
            </Link>
          )}

          {mode === "checkout" && (
            <Link
              className="w-full"
              href={`?checkout-modal=checkout&shippingAddressId=${shippingAddressId}&markAsGift=${form.watch("markAsGift")}`}
            >
              <Button className="w-full py-5 text-base rounded-full mt-2">
                Place Order
              </Button>
            </Link>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

