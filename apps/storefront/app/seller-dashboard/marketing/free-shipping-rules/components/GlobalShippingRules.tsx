"use client";
import { useState } from "react";
import { Button } from "@/components/animate-ui/components/buttons/button";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Truck, Loader2 } from "lucide-react";
import { toggleShippingStatus, updateGlobalShipping } from "./shippingAction";
import { toast } from "sonner";
import { ShippingConfig } from "@/types/sellerDashboard/FreeShippingRules";


type Props = {
  shipping: ShippingConfig | null;
};

const GlobalFreeShipping = ({ shipping }: Props) => {
  const [loading, setLoading] = useState(false);
  const [amount, setAmount] = useState<string>(shipping?.minimumOrderAmount || "0");

 const handleStatusToggle = async () => {
  try {
    setLoading(true);
    const res = await toggleShippingStatus(); 
    if (res.success) {
      toast.success(`Free shipping status changed successfully`);
    }
  } catch (error) {
    toast.error("Failed to toggle shipping status");
  } finally {
    setLoading(false);
  }
};

  // Update Amount Threshold
  const handleAmountUpdate = async () => {
    try {
      setLoading(true);
      const res = await updateGlobalShipping({ minimumOrderAmount: Number(amount) });
      if (res.success) {
        toast.success("Shipping threshold updated successfully");
      }
    } catch (error) {
      toast.error("Failed to update amount");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="rounded-xl border bg-chart-8/5 p-4">
      <div className="flex items-start justify-between gap-4">
        <div className="flex gap-3">
          <div className="rounded-md bg-card p-2 shadow-sm">
            <Truck className="h-5 w-5 text-chart-8" />
          </div>

          <div>
            <p className="text-sm font-medium">Global Free Shipping</p>
            <p className="text-xs text-muted-foreground">
              Set a default threshold for all products
            </p>
          </div>
        </div>

        <Switch 
          checked={shipping?.isEnabled} 
          onCheckedChange={handleStatusToggle}
          disabled={loading}
        />
      </div>

      <div className="mt-4 flex items-center gap-3">
        <Input
          className="max-w-full bg-card"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
          type="number"
          placeholder="Minimum order amount"
        />
        <Button 
          size="sm" 
          className="bg-chart-8 text-card hover:bg-chart-8/90"
          onClick={handleAmountUpdate}
          disabled={loading}
        >
          {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : "Update"}
        </Button>
      </div>

      <p className="mt-2 text-[11px] text-muted-foreground">
        Orders over <span className="font-bold text-foreground">${amount || "0"}</span> will qualify for free shipping
      </p>
    </div>
  );
};

export default GlobalFreeShipping;