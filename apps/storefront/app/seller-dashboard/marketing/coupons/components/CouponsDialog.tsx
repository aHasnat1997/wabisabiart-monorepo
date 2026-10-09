"use client";

import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useEffect, useState } from "react";

import { Button } from "@/components/animate-ui/components/buttons/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";

import { CouponFormValues, couponSchema } from "./CouponShema";
import { createCoupons, generateRandomCode, getCouponById, updateCoupon } from "./CouponsAction";
import { Loader2, Sparkles } from "lucide-react";
import { useModal } from "@/components/modal/Modal";
import { toast } from "sonner";
import { useSearchParams } from "next/navigation";
import {  CouponRequestPayload } from "@/types/sellerDashboard/CouponsItems";

type CouponsDialogProps = {
  mode?: "create" | "edit";
  defaultData?: Partial<CouponFormValues>;
  onSave?: (data: CouponFormValues) => void;
  onCancel?: () => void;
};

export default function CouponsDialog({  defaultData, onSave, onCancel }: CouponsDialogProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const { close } = useModal();

  const searchParams = useSearchParams();
  const modalType = searchParams.get("coupon-modal");
  const couponId = searchParams.get("id");

  const mode = modalType === "edit-coupon" ? "edit" : "create";

  const [isFetchingData, setIsFetchingData] = useState(mode === "edit");

  // We ensure the generic type <CouponFormValues> is strictly applied
  const { control, handleSubmit, watch, setValue,reset, clearErrors, formState: { errors } } = useForm<CouponFormValues>({
    resolver: zodResolver(couponSchema),
    defaultValues: {
      code: defaultData?.code || "",
      // Cast literal strings to match the strict Zod union types
      discountType: (defaultData?.discountType || "percentage") as "percentage" | "fixed" | "free_shipping",
      discountValue: defaultData?.discountValue || 0, 
      maxUses: defaultData?.maxUses || 100,     
      expiresAt: defaultData?.expiresAt || new Date().toISOString().split("T")[0], 
      minPurchase: defaultData?.minPurchase || 0,   
      customerRestriction: (defaultData?.customerRestriction || "New Customer") as "New Customer" | "All Customer" | "VIP Customer" | "Returning Customer",
      onePerCustomer: defaultData?.onePerCustomer || false,
    },
  });

  const discountType = watch("discountType");


  useEffect(() => {
    const fetchAndSetCouponData = async () => {
      if (mode === "edit" && couponId) {
        setIsFetchingData(true);
        const apiData = await getCouponById(couponId);
        
        if (apiData) {
          
          const restrictionMap: Record<string, "All Customer" | "New Customer" | "VIP Customer" | "Returning Customer"> = {
            "ALL_CUSTOMERS": "All Customer",
            "NEW_CUSTOMERS": "New Customer",
            "VIP_CUSTOMERS": "VIP Customer", 
            "RETURNING_CUSTOMERS": "Returning Customer"
          };

         
          const discountMap: Record<string, "percentage" | "fixed" | "free_shipping"> = {
            "PERCENTAGE": "percentage",
            "FIXED": "fixed",
            "FREE_SHIPPING": "free_shipping"
          };

         
          reset({
            code: apiData.code,
            discountType: discountMap[apiData.discountType] || "percentage", 
            discountValue: Number(apiData.discountValue),
            maxUses: apiData.maximumUses,
            expiresAt: apiData.expiresAt ? apiData.expiresAt.split("T")[0] : "",
            minPurchase: Number(apiData.minimumPurchaseAmount || 0),
            customerRestriction: restrictionMap[apiData.customerRestriction] || "All Customer",
            onePerCustomer: false,
          });
        }
        setIsFetchingData(false);
      }
    };

    fetchAndSetCouponData();
  }, [mode, couponId, reset]);

//  const onSubmit = async (data: CouponFormValues) => {
//   console.log("Current Mode:", mode);
//     console.log("Coupon ID to Update:", couponId);
//     try {
//       setIsLoading(true);

//       const restrictionMap: Record<string, "ALL_CUSTOMERS" | "NEW_CUSTOMERS" | "VIP_CUSTOMERS" | "RETURNING_CUSTOMERS"> = {
//         "All Customer": "ALL_CUSTOMERS",
//         "New Customer": "NEW_CUSTOMERS",
//         "VIP Customer": "VIP_CUSTOMERS",
//         "VIP Only": "VIP_CUSTOMERS",
//         "Returning Customer": "RETURNING_CUSTOMERS",
//       };

//       const discountMap: Record<string, "PERCENTAGE" | "FIXED" | "FREE_SHIPPING"> = {
//         "percentage": "PERCENTAGE",
//         "fixed": "FIXED",
//         "free_shipping": "FREE_SHIPPING",
//       };

//       const apiPayload: CouponRequestPayload = {
//         code: data.code,
//         discountType: discountMap[data.discountType] || "PERCENTAGE",
//         discountValue: Number(data.discountValue),
//         maximumUses: Number(data.maxUses),
//         expirationDate: new Date(`${data.expiresAt}T23:59:59Z`).toISOString(),
//         minimumPurchase: Number(data.minPurchase),
//         customerRestriction: restrictionMap[data.customerRestriction] || "ALL_CUSTOMERS",
//         isActive: true, 
//       };

//       // 🌟 Create Mode
//       if (mode === "create") {
//         const response = await createCoupons(apiPayload);
        
       
//         if (response && response.success) {
//           toast.success("Successfully Created Coupon");
//           close("coupon-modal", ["create-coupon"]); 
          
//           if (onSave) onSave(data);
//           if (onCancel) onCancel();
//         } else {
          
//           toast.error("Failed to create coupon");
//         }
//       } 
//       // 🌟 Edit Mode
//       else if (mode === "edit" && couponId) {
//         const response = await updateCoupon(couponId, apiPayload);

       
//         if (response && response.success) {
//           toast.success("Successfully Updated Coupon");
//           close("coupon-modal", ["edit-coupon"]); 
          
//           if (onSave) onSave(data);
//           if (onCancel) onCancel();
//         } else {
          
//           toast.error("Failed to update coupon");
//         }
//       }
//     } catch (error) {
//       console.error(`Failed to ${mode} coupon:`, error);
     
//       toast.error(`Failed to ${mode} coupon. Please try again.`);
//     } finally {
//       setIsLoading(false);
//     }
//   };

  const onSubmit = async (data: CouponFormValues) => {
    try {
      setIsLoading(true);

      const discountMap: Record<string, string> = {
        "percentage": "PERCENTAGE",
        "fixed": "FIXED",
        "free_shipping": "FREE_SHIPPING",
      };

     
      if (mode === "edit" && couponId) {
        const editPayload = {
          // discountType: discountMap[data.discountType],
          discountValue: Number(data.discountValue),
          expirationDate: new Date(`${data.expiresAt}T23:59:59Z`).toISOString(),
         
          maximumUses: Number(data.maxUses),
          minimumPurchase: Number(data.minPurchase),
        };

        console.log("Updating with clean payload:", editPayload);

        const response = await updateCoupon(couponId, editPayload as CouponRequestPayload);

        if (response && response.success) {
          toast.success("Successfully Updated Coupon");
          close("coupon-modal", ["edit-coupon"]);
          if (onSave) onSave(data);
          if (onCancel) onCancel();
        } else {
          toast.error("Failed to update coupon");
        }
      } 
      
     
      else if (mode === "create") {
        const restrictionMap: Record<string, string> = {
          "All Customer": "ALL_CUSTOMERS",
          "New Customer": "NEW_CUSTOMERS",
          "VIP Customer": "VIP_CUSTOMERS",
          "Returning Customer": "RETURNING_CUSTOMERS",
        };

        const createPayload = {
          code: data.code.toUpperCase(),
          discountType: discountMap[data.discountType],
          discountValue: Number(data.discountValue),
          maximumUses: Number(data.maxUses),
          expirationDate: new Date(`${data.expiresAt}T23:59:59Z`).toISOString(),
          minimumPurchase: Number(data.minPurchase),
          customerRestriction: restrictionMap[data.customerRestriction] || "ALL_CUSTOMERS",
          isActive: true,
        };

        const response = await createCoupons(createPayload as CouponRequestPayload);
        if (response?.success) {
          toast.success("Successfully Created Coupon");
          close("coupon-modal", ["create-coupon"]);
          if (onCancel) onCancel();
        }
      }
    } catch (error) {
      console.error("Error saving coupon:", error);
      toast.error("Update failed. Check console for Prisma error.");
    } finally {
      setIsLoading(false);
    }
  };
  const handleGenerateCode = async () => {
    setIsGenerating(true);
    const newCode = await generateRandomCode(); 
    
    if (newCode) {
      setValue("code", newCode); 
      clearErrors("code"); 
    }
    setIsGenerating(false);
  };

  if (isFetchingData) {
    return (
      <div className="w-full p-12 flex flex-col items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary mb-4" />
        <p className="text-muted-foreground">Loading coupon details...</p>
      </div>
    );
  }
  return (
    <div className="w-full p-1 md:p-2 pb-12">
      <div>
        <h2 className="text-lg font-medium">
          {mode === "create" ? "Create Coupon Rules" : "Edit Coupon Rules"}
        </h2>
        <p className="text-sm text-muted-foreground mb-4">
          {mode === "create" 
            ? "Set up a new coupon code for your customers" 
            : "Update the rules and restrictions for this coupon"}
        </p>
      </div>
      <form className="space-y-4 py-4" onSubmit={handleSubmit(onSubmit)}>
        
        <div className="space-y-1.5">
          <Label className=" font-medium">Coupon Code *</Label>
          
          <div className="flex items-center gap-2">
            {/* Input Field */}
            <Controller
              name="code"
              control={control}
              render={({ field }) => (
                <Input 
                  {...field} 
                  placeholder="E.G., WELCOME10" 
                  className="flex-1 uppercase bg-muted-foreground/50" 
                />
              )}
            />
            
            {/* Sparkles Generate Button */}
            <Button 
              type="button" 
              variant="outline" 
              size="icon"
              className="w-10 h-10 shrink-0 bg-muted-foreground/50 hover:bg-muted-foreground/10"
              onClick={handleGenerateCode}
              disabled={isGenerating}
              title="Generate Random Code"
            >
              {isGenerating ? (
                <Loader2 className="w-4 h-4 animate-spin text-muted-foreground/80" />
              ) : (
                <Sparkles className="w-4 h-4 text-muted-foreground/80" />
              )}
            </Button>
          </div>
          
          {/* Helper Text or Error */}
          {errors.code ? (
            <p className="text-destructive text-xs mt-1">{errors.code.message}</p>
          ) : (
            <p className="text-[11px] text-muted-foreground mt-1">
              Letters and numbers only, no spaces
            </p>
          )}
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div className="space-y-1">
            <Label>Discount Type*</Label>
            <Controller
              name="discountType"
              control={control}
              render={({ field }) => (
                <Select value={field.value} onValueChange={(val) => field.onChange(val)}>
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Select discount type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="percentage">PERCENTAGE (%)</SelectItem>
                    <SelectItem value="fixed">FIXED AMOUNT</SelectItem>
                    <SelectItem value="free_shipping">FREE_SHIPPING</SelectItem>
                  </SelectContent>
                </Select>
              )}
            />
            {errors.discountType && <p className="text-destructive text-xs">{errors.discountType.message}</p>}
          </div>

          <div className="space-y-1">
            <Label>{discountType === "percentage" ? "Discount Percentage*" : "Discount Amount*"}</Label>
            <Controller
              name="discountValue"
              control={control}
              // FIX 2: Convert string input to Number to satisfy Zod schema
              render={({ field }) => (
                <Input 
                  {...field} 
                  type="number" 
                  placeholder="10" 
                  onChange={(e) => field.onChange(Number(e.target.value))} 
                />
              )}
            />
            {errors.discountValue && <p className="text-destructive text-xs">{errors.discountValue.message}</p>}
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div className="space-y-1">
            <Label>Maximum Uses</Label>
            <Controller 
              name="maxUses" 
              control={control} 
              // FIX 2: Convert to Number
              render={({ field }) => (
                <Input 
                  {...field} 
                  type="number" 
                  onChange={(e) => field.onChange(Number(e.target.value))} 
                />
              )} 
            />
            {errors.maxUses && <p className="text-destructive text-xs">{errors.maxUses.message}</p>}
          </div>

          <div className="space-y-1">
            <Label>Expiration Date*</Label>
            <Controller
              name="expiresAt"
              control={control}
              render={({ field }) => <Input {...field} type="date" />}
            />
            {errors.expiresAt && <p className="text-destructive text-xs">{errors.expiresAt.message}</p>}
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div className="space-y-1">
            <Label>Minimum Purchase</Label>
            <Controller 
              name="minPurchase" 
              control={control} 
              // FIX 2: Convert to Number
              render={({ field }) => (
                <Input 
                  {...field} 
                  type="number" 
                  onChange={(e) => field.onChange(Number(e.target.value))} 
                />
              )} 
            />
            {errors.minPurchase && <p className="text-destructive text-xs">{errors.minPurchase.message}</p>}
          </div>

          <div className="space-y-1">
            <Label>Customer Restriction</Label>
            <Controller
              name="customerRestriction"
              control={control}
              render={({ field }) => (
                <Select value={field.value} onValueChange={field.onChange}>
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Select Customer Type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="New Customer">New Customer</SelectItem>
                    <SelectItem value="All Customer">All Customer</SelectItem>
                    {/* <SelectItem value="VIP Customer">VIP Customer</SelectItem>
                    <SelectItem value="Returning Customer">Returning Customer</SelectItem> */}
                  </SelectContent>
                </Select>
              )}
            />
          </div>
        </div>

        <div className="flex items-center justify-between rounded-md border p-3">
          <div>
            <p className="text-sm font-medium">One Per Customer</p>
            <p className="text-xs mt-1 ">Limit each customer to one use of this coupon</p>
          </div>
          <Controller
            name="onePerCustomer"
            control={control}
            render={({ field }) => (
              <Switch 
                checked={field.value} 
                onCheckedChange={field.onChange} 
              />
            )}
          />
        </div>

        <div className="flex justify-end gap-3 mt-4">
          <Button type="button" variant="outline" onClick={onCancel} disabled={isLoading}>
            Cancel
          </Button>
          <Button type="submit" className="bg-primary text-card" disabled={isLoading}>
            {isLoading ? "Saving..." : mode === "create" ? "Create Coupon" : "Update Coupon"}
          </Button>
        </div>
      </form>
    </div>
  );
}