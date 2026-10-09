"use client";

import { Button } from "@/components/animate-ui/components/buttons/button";

import {  Percent, Info, DollarSign, Gift } from "lucide-react";
import { useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import { getAllPromotionById } from "./PromotionAction";
import { BackendPromotion } from "@/types/sellerDashboard/PromotionItems";

export const PreviewDialog = () => {

   const searchParams = useSearchParams()
   const id = searchParams.get("id")
   console.log("promotion id: ", id)
   const [promo, setPromo] = useState<BackendPromotion>()
   const [loading, setLoading] = useState(true);

   useEffect(() => {
    if(id){
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setLoading(true)
      getAllPromotionById(id)
      .then((data)=> setPromo(data))
      .catch((err) => console.error("Error loading promo preview:", err))
        .finally(() => setLoading(false));
    }
   }, [id])
   if (loading) {
    return <div className="p-8 text-center text-muted-foreground animate-pulse">Loading preview...</div>;
  }

  if (!promo) {
    return <div className="p-8 text-center text-destructive">Promotion not found.</div>;
  }

  const startDate = new Date(promo.startDate).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
  const endDate = promo.endDate ? new Date(promo.endDate).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }) : "Ongoing";

  let displayDiscount = "";
  let PromoIcon = Percent; 

  if (promo.discountType === "PERCENTAGE") {
    displayDiscount = `${promo.discountValue}% OFF`;
    PromoIcon = Percent;
  } else if (promo.discountType === "FIXED") {
    displayDiscount = `$${promo.discountValue} OFF`;
    PromoIcon = DollarSign; 
  } else if (promo.discountType === "BOGO") {
    displayDiscount = "Buy One  Get One";
    PromoIcon = Gift; 
  }

  const formattedApplyTo = promo.applyTo.split("_").map((word: string) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase()).join(" ");

  return (
    <div>
      

      <div className="w-full p-1 md:p-2 pb-12">
        {/* HEADER */}
        <div className="border-b px-6 py-4">
          <div className="text-base font-semibold">
            Promotion Preview
          </div>
          <p className="text-sm text-muted-foreground">
            How customers will see this promotion
          </p>
        </div>

        {/* BODY */}
        <div className="p-6 space-y-4">
          {/* PROMO CARD */}
          <div className="rounded-xl border bg-muted p-5 text-center">
            <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-primary text-card">
             
              <PromoIcon className="h-5 w-5" />
            </div>

            <h3 className="text-sm font-medium text-muted-foreground">
              {promo.name}
            </h3>


            <p className="mt-1 text-xl font-semibold text-primary/80">
              {displayDiscount}
            </p>

            <p className="mt-1 text-xs text-primary/80">
              Valid {startDate} – {endDate}
            </p>

            <Button
              className="mt-4  rounded-lg"
            >
              Apply Discount
            </Button>
          </div>

          {/* INFO BOX */}
          <div className="flex items-start gap-3 rounded-lg border border-chart-8/10 bg-chart-8/5 p-4">
            <Info className="mt-0.5 h-4 w-4 text-chart-8/95" />
            <div>
              <p className="text-sm font-medium text-chart-8">
               Applies to: {formattedApplyTo}
              </p>
              <p className="text-xs text-chart-8/95">
                {promo.usageCount} customers have used this promotion
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
