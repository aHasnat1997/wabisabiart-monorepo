"use client";

import { PaymentMethod } from "@/types/cards";
import { useCallback, useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { getSavedCards } from "../../account/components/action";
import { toast } from "sonner";
import { Spinner } from "@/components/ui/spinner";
import { Button } from "@/components/ui/button";
import {
  paymentWithSavedCard,
  processCheckout,
  processPayment,
} from "./actions";

export default function CheckoutModal() {
  const searchParams = useSearchParams();
  const shippingAddressId = searchParams.get("shippingAddressId");
  const markOrderAsGift = searchParams.get("markAsGift") === "true";
  const router = useRouter();
  const [savedCards, setSavedCards] = useState<PaymentMethod[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchSavedCards = useCallback(async () => {
    try {
      setIsLoading(true);
      const cards = await getSavedCards();
      setSavedCards(cards || []);
    } catch (error) {
      console.error("Error fetching saved cards:", error);
      toast.error("Failed to load saved cards");
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchSavedCards();
  }, [fetchSavedCards]);

  const handlePay = async () => {
    const redirectUrl = "";
    console.log(shippingAddressId, "shipping Id");
    if (!shippingAddressId) {
      console.error("No shipping address selected");
      return;
    }
    setIsLoading(true);
    try {
      const res = await processCheckout(
        shippingAddressId,
        markOrderAsGift,
        redirectUrl,
      );
      if (res?.success) {
        const orderId = res.data.data[0].id;
        console.log("Order ID:", orderId);
        const successUrl = `${window.location.origin}?payment-success-modal=payment-success&`;
        const cancelUrl = `${window.location.origin}?payment-failed-modal=payment-failed&`;
        const url = await processPayment(orderId, successUrl, cancelUrl);
        console.log("Stripe checkout URL:", url);
        if (url) {
          window.location.href = url;
        }
      }
    } catch (error) {
      console.error(error);
      toast.error("Payment failed. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handlePayWithSavedCard = async (paymentMethodId: string) => {
    const redirectUrl = "";
    console.log(shippingAddressId, "shipping Id");
    if (!shippingAddressId) {
      console.error("No shipping address selected");
      return;
    }
    setIsLoading(true);
    try {
      const res = await processCheckout(
        shippingAddressId,
        markOrderAsGift,
        redirectUrl,
      );
      if (res?.success) {
        const orderId = res.data.data[0].id;

        const response = await paymentWithSavedCard(orderId, paymentMethodId);
        if (response?.success) {
          toast.success("Payment successful!");
          router.push("?payment-success-modal=payment-success");
        }
      }
    } catch (error) {
      console.error(error);
      toast.error("Payment failed. Please try again.");
      router.push("?payment-failed-modal=payment-failed");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="p-2">
      <h2 className="text-lg font-semibold mb-4">Choose a payment method</h2>
      <div className="space-y-2">
        {isLoading && savedCards.length === 0 ? (
          <div className="flex justify-center py-4">
            <Spinner />
          </div>
        ) : savedCards.length === 0 ? (
          <p className="text-sm text-muted-foreground py-4 text-center">
            No saved cards yet.
          </p>
        ) : (
          savedCards.map((pm) => {
            const style = BRAND_STYLES[pm.card.brand] ?? BRAND_STYLES.default;
            return (
              <button
                key={pm.id}
                type="button"
                onClick={() => handlePayWithSavedCard(pm.id)}
                className="w-full flex items-center justify-between cursor-pointer gap-3 rounded-lg border p-3 text-left hover:border-primary/50 hover:bg-primary/5 transition-colors disabled:opacity-60"
              >
                <div className="flex items-center gap-3">
                  <div
                    className={`h-8 w-12 rounded-md bg-linear-to-br ${style.gradient} flex items-center justify-center text-[9px] font-bold text-white/90`}
                  >
                    {style.label.slice(0, 4)}
                  </div>
                  <div>
                    <p className="text-sm font-medium">•••• {pm.card.last4}</p>
                    <p className="text-xs text-muted-foreground">
                      Expires {String(pm.card.exp_month).padStart(2, "0")}/
                      {String(pm.card.exp_year).slice(-2)}
                    </p>
                  </div>
                </div>
              </button>
            );
          })
        )}

        <Button
          type="button"
          variant="outline"
          className="w-full"
          disabled={isLoading}
          onClick={handlePay}
        >
          {isLoading ? <Spinner className="mr-2 h-4 w-4" /> : null}
          Pay another way
        </Button>
      </div>
    </div>
  );
}

const BRAND_STYLES: Record<string, { gradient: string; label: string }> = {
  visa: {
    gradient: "from-[#1A1F71] via-[#2540A6] to-[#1A1F71]",
    label: "VISA",
  },
  mastercard: {
    gradient: "from-[#2b2b2b] via-[#3a3a3a] to-[#1f1f1f]",
    label: "Mastercard",
  },
  amex: {
    gradient: "from-[#006FCF] via-[#0089D6] to-[#006FCF]",
    label: "AMEX",
  },
  discover: {
    gradient: "from-[#FF6000] via-[#f97316] to-[#c2410c]",
    label: "DISCOVER",
  },
  default: {
    gradient: "from-neutral-700 via-neutral-800 to-neutral-900",
    label: "CARD",
  },
};
