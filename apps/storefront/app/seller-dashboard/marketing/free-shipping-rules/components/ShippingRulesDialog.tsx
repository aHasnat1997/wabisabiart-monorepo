"use client";

import { useEffect, useState } from "react";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";

import { Button } from "@/components/animate-ui/components/buttons/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";
import { useModal } from "@/components/modal/Modal";
import { shippingRuleSchema, ShippingRuleFormValues } from "./ShippingRuleSchema";
import { createShippingRule, updateShippingRule } from "./shippingAction";

type ShippingRuleData = {
  id?: string | number;
  name?: string;
  minimumOrderAmount?: number | string;
  region?: string;
};

type Props = {
  mode?: "create" | "edit";
  initialData?: ShippingRuleData;
  onSuccess?: () => void;
};

// API Region Mapping logic
const validRegions = ["All Countries", "United States", "Asia", "Europe", "International"];

const ShippingRulesDialog = ({ mode = "create", initialData, onSuccess }: Props) => {
  const [isLoading, setIsLoading] = useState(false);
  const { close } = useModal();
  
  const {
    register,
    handleSubmit,
    control,
    reset,
    formState: { errors },
  } = useForm<ShippingRuleFormValues>({
    resolver: zodResolver(shippingRuleSchema),
  });

  useEffect(() => {
    if (mode === "edit" && initialData) {
     
      const displayRegion = initialData.region === "US" ? "United States" : initialData.region;

      reset({
        name: initialData.name || "",
        minOrderAmount: Number(initialData.minimumOrderAmount) || 0,
        region: displayRegion && validRegions.includes(displayRegion) 
          ? (displayRegion as ShippingRuleFormValues['region']) 
          : undefined,
      });
    }
  }, [initialData, mode, reset]);

  const onSubmit = async (data: ShippingRuleFormValues) => {
    try {
      setIsLoading(true);
      
      const payload = {
        name: data.name,
        minimumOrderAmount: data.minOrderAmount,
        region: data.region === "United States" ? "US" : data.region, 
      };

      if (mode === "create") {
        const res = await createShippingRule(payload);
        if (res.success) {
          toast.success("Shipping rule created successfully!");
          close("shipping-rules-modal", ["shipping-rules-create"]);
          reset();
          if (onSuccess) onSuccess();
        }
      } 
      else if (mode === "edit" && initialData?.id) {
       
        const res = await updateShippingRule(String(initialData.id), payload);
        if (res.success) {
          toast.success("Shipping rule updated successfully!");
          close("shipping-rules-modal", ["shipping-rules-edit"]);
          if (onSuccess) onSuccess();
        }
      }
    } catch (error) {
      console.error("Save error:", error);
      toast.error("Failed to save shipping rule");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="w-full p-1 md:p-2">
      <div>
        <h3 className="text-lg font-medium">
          {mode === "create" ? "Create Shipping Rule" : "Edit Shipping Rule"}
        </h3>
        <p className="text-sm text-muted-foreground mb-4">
          Set up a custom free shipping rule for specific regions
        </p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 py-2">
        <div className="space-y-1.5">
          <Label>Rule Name*</Label>
          <Input
            placeholder="e.g., Free Shipping for US"
            {...register("name")}
            className={errors.name ? "border-destructive" : ""}
          />
          {errors.name && <p className="text-[11px] text-destructive">{errors.name.message}</p>}
        </div>

        <div className="space-y-1.5">
          <Label>Minimum Order Amount ($)*</Label>
          <Input
            type="number"
            placeholder="100"
            {...register("minOrderAmount", { valueAsNumber: true })}
            className={errors.minOrderAmount ? "border-destructive" : ""}
          />
          {errors.minOrderAmount && <p className="text-[11px] text-destructive">{errors.minOrderAmount.message}</p>}
        </div>

        <div className="space-y-1.5">
          <Label>Region*</Label>
          <Controller
            name="region"
            control={control}
            render={({ field }) => (
              <Select value={field.value} onValueChange={field.onChange}>
                <SelectTrigger className={errors.region ? "border-destructive" : ""}>
                  <SelectValue placeholder="Select region" />
                </SelectTrigger>
                <SelectContent>
                  {validRegions.map((reg) => (
                    <SelectItem key={reg} value={reg}>{reg === "United States" ? "United States (US)" : reg}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
          />
          {errors.region && <p className="text-[11px] text-destructive">{errors.region.message}</p>}
        </div>

        <div className="flex justify-end gap-3 pt-4 border-t mt-6">
          <Button 
            type="button" 
            variant="ghost" 
            disabled={isLoading}
            onClick={() => close("shipping-rules-modal", [mode === "create" ? "shipping-rules-create" : "shipping-rules-edit"])}
          >
            Cancel
          </Button>
          <Button 
            type="submit" 
            className="bg-primary text-card min-w-[120px]" 
            disabled={isLoading}
          >
            {isLoading ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : mode === "create" ? (
              "Create Rule"
            ) : (
              "Update Rule"
            )}
          </Button>
        </div>
      </form>
    </div>
  );
};

export default ShippingRulesDialog;