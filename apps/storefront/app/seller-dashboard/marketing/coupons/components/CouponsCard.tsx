"use client";
import { Badge } from "@/components/ui/badge";
import { Coupon } from "@/types/sellerDashboard/CouponsItems";
import {
  DollarSign,
  Edit,
  Loader2,
  PanelTopClose,
  Percent,
  Trash2,
  Truck,
} from "lucide-react";
import React, { useState } from "react";
import { Button } from "@/components/animate-ui/components/buttons/button";
import { Slider } from "@/components/ui/slider";

import Link from "next/link";
import { Switch } from "@/components/ui/switch";
import { deleteCoupon, toggleCouponStatus } from "./CouponsAction";
import { toast } from "sonner";
import CouponDeleteButton from "./CouponDeleteButton";

type Props = {
  coupon: Coupon;
};

export const CouponsCard = ({ coupon }: Props) => {
  const [value, setValue] = useState<number[]>([coupon.usedCount || 0]);
  const isFreeShipping = coupon.value === "Free Shipping";
  const isFixed = coupon.value.includes("$");
  const IconToUse = isFreeShipping ? Truck : isFixed ? DollarSign : Percent;
  const [isPending, setIsPending] = useState(false);

  const handleToggle = async () => {
    try {
      setIsPending(true);
      const response = await toggleCouponStatus(coupon.id);
      
      if (response && response.success) {
        toast.success(`Coupon ${coupon.status === "active" ? "deactivated" : "activated"} successfully`);
      } else {
        toast.error("Failed to change status");
      }
    } catch (error) {
      toast.error("Something went wrong");
    } finally {
      setIsPending(false);
    }
  };

  // const handleDelete = async () => {
  //   try {
  //     toast.loading("Deleting coupon...", { id: "delete-coupon" });
  //     const response = await deleteCoupon(coupon.id);

  //     if(response && response.success){
  //       toast.success("Coupon Delete Successfull", {id:"delete-coupon"})
  //     }else {
  //       toast.error("Failed to delete coupon", { id: "delete-coupon" });
  //     }
  //   } catch (error) {
  //     toast.error("Something went wrong while deleting", { id: "delete-coupon" });
  //   }
  // }

  return (
    <div className="border rounded-lg p-4 bg-card shadow-sm flex flex-col justify-between">
      {/* Header */}
      <div className="flex justify-between items-start">
        <div className="flex gap-3 items-center">
          <h3 className="font-semibold text-popover-foreground">
            {coupon.title}
          </h3>

          <Badge
            className={`mt-1 capitalize ${coupon.status === "active" ? "bg-primary/10  text-primary" : "bg-destructive/10 text-destructive"}`}
          >
            {coupon.status}
          </Badge>
        </div>
        <div>
          <div className="flex items-center gap-2">
      {isPending && <Loader2 className="w-3 h-3  animate-spin text-muted-foreground" />}
      <Switch 

        checked={coupon.status === "active"} 
        onCheckedChange={handleToggle}
        disabled={isPending}
      />
    </div>
        </div>
      </div>
      <div className="flex  gap-3">
        <IconToUse className="mt-3 bg-primary/60 text-primary p-2 rounded-full" size={28} />

        {/* Value */}
        <p className="text-lg text-primary font-bold mt-3">{coupon.value}</p>
      </div>

      {/* Applied To */}

      <div className="flex mt-3 gap-2">
        <p className="text-xs text-muted-foreground">Min.Purchases:</p>
        <p className="text-xs text-muted-foreground font-medium">
          {coupon.minPurchase}
        </p>
      </div>

      {/* Stats */}
      <div className="flex  mt-3 text-xs mb-2.5 text-muted-foreground">
        <div className="lg:w-72 w-32">
          <p>Redemption</p>
          <p className="mt-2 mb-2">
            Value: {value[0]}/{coupon.maxUses || 100}
          </p>
          <Slider
            value={value}
            onValueChange={(val) => setValue(val)}
            max={coupon.maxUses || 100}
            step={1}
            disabled
          >
            {/* <SliderTrack>
          <SliderRange />
        </SliderTrack>
        <SliderThumb /> */}
          </Slider>
        </div>
        <div className="ml-6">
          <p>Customer Type</p>
          <div>
            {coupon.customerType === "New Customer" && (
              <Badge className="mt-1 bg-chart-4/10 text-chart-4">
                {coupon.customerType}
              </Badge>
            )}
            {coupon.customerType === "All Customer" && (
              <Badge className="mt-1 bg-muted text-muted-foreground">
                {coupon.customerType}
              </Badge>
            )}
            {coupon.customerType === "VIP Only" && (
              <Badge className="mt-1 bg-chart-8/10 text-chart-8">
                {coupon.customerType}
              </Badge>
            )}
            {coupon.customerType === "Returning Customer" && (
              <Badge className="mt-1 bg-chart-2/10 text-chart-2">
                {coupon.customerType}
              </Badge>
            )}
          </div>
        </div>
      </div>

      <hr />

      {/* Period */}

      {/* Actions */}
      <div className="flex justify-between gap-2 mt-3">
        <div className="flex gap-2 mt-2">
          <PanelTopClose size={16} />
          <p className="text-xs text-muted-foreground ">Expires :</p>
          <p className="text-xs text-muted-foreground ">{coupon.expiresDate}</p>
        </div>

        <div className="flex gap-2">
          <Link href={`?coupon-modal=edit-coupon&id=${coupon.id}`}>
            <Button variant="ghost" className="flex cursor-pointer items-center text-primary bg-muted border" size="icon">
              <Edit  />
            </Button>
          </Link>

          <CouponDeleteButton id={coupon.id}></CouponDeleteButton>
        </div>
      </div>
    </div>
  );
};
