"use client";

import { useEffect, useState } from "react";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/animate-ui/components/buttons/button";
import { ApplyPromotion } from "./ApplyPromotion";
import { Sparkles } from "lucide-react";
import { PromotionFormValues, promotionSchema } from "./PromotionSchema";
import Stepper from "./Stepper";
import { createPromotion, updatePromotion, getAllPromotionById } from "./PromotionAction"; 
import { useSearchParams } from "next/navigation"; 

import { Category, getProductsMyListing } from "../../products/components/Action";
import { getAllCategories } from "@/components/actions";
import { toast } from "sonner";
import { useModal } from "@/components/modal/Modal";
import { BackendPromotion } from "@/types/sellerDashboard/PromotionItems";

type ApplyProduct = {
  id: string;
  name: string;
  category: string;
  price: number;
};

const steps = ["Basic Info", "Apply To", "Restrictions"];

const PromotionDialog = ({ mode = "create", initialStep = 0}: { mode?: "create" | "edit"; initialStep?: number }) => {
  const [step, setStep] = useState(initialStep);
  const [categories, setCategories] = useState<Category[]>([]);  
  const [products, setProducts] = useState<ApplyProduct[]>([]); 
  const [loading, setLoading] = useState(false);
  const [isFetchingEdit, setIsFetchingEdit] = useState(mode === "edit"); // 👈 Track initial data load
  const { close } = useModal();
  
  // 👈 Get ID from URL for edit mode
  const searchParams = useSearchParams();
  const editId = searchParams.get("id"); 

  const [applyTo, setApplyTo] = useState<"ALL_PRODUCTS" | "BY_CATEGORY" | "SPECIFIC_PRODUCTS">("ALL_PRODUCTS");
  const [selectedCategoryIds, setSelectedCategoryIds] = useState<string[]>([]);
  const [selectedProductIds,  setSelectedProductIds]  = useState<string[]>([]);

  const { register, handleSubmit, control, reset, watch, formState: { errors } } = useForm<PromotionFormValues>({
    resolver: zodResolver(promotionSchema),
    defaultValues: {
      name: "",
      discountType: undefined,
      discountValue: "",
      startDate: "",
      endDate: "",
      minAmount: 0,
      useLimit: 0,
      onePerCustomer: false,
      applyTo: "ALL_PRODUCTS",   
      categoryIds: [],
      productIds: [],
    },
  });

  const watchDiscountType = watch("discountType");

 
 useEffect(() => {
    if (mode === "edit" && editId) {
      setIsFetchingEdit(true);
      
      getAllPromotionById(editId)
        .then((promo: BackendPromotion) => { 

          reset({
            name: promo.name,
            discountType: promo.discountType,
            discountValue: promo.discountValue?.toString() || "",
            startDate: promo.startDate ? new Date(promo.startDate).toISOString().split('T')[0] : "",
            endDate: promo.endDate ? new Date(promo.endDate).toISOString().split('T')[0] : "",
            minAmount: Number(promo.minimumPurchase) || 0,
            useLimit: promo.usageLimit || 0,
            onePerCustomer: promo.onePerCustomer || false,
            applyTo: promo.applyTo,
          });

          
          setApplyTo(promo.applyTo);
          
          
          if (promo.categories) {
            setSelectedCategoryIds(promo.categories.map((c: { id: string }) => c.id));
          }
          if (promo.products) {
            setSelectedProductIds(promo.products.map((p: { id: string }) => p.id));
          }
        })
        .catch((err) => {
          console.error("Failed to load promotion:", err);
          toast.error("Failed to load promotion details.");
        })
        .finally(() => setIsFetchingEdit(false));
    }
  }, [mode, editId, reset]);

  
  useEffect(() => {
    if (step === 1 && categories.length === 0) { 
      setLoading(true);
      Promise.all([
        getAllCategories(),
        getProductsMyListing(1, 100),
      ])
        .then(([cats, { products: prods }]) => {
          setCategories(cats);
          setProducts(
            prods.map((p) => ({
              id:       p.id,
              name:     p.title,        
              category: "",             
              price:    Number(p.price),
            }))
          );
        })
        .catch(console.error)
        .finally(() => setLoading(false));
    }
  }, [step, categories.length]);

  const onSubmit = async (data: PromotionFormValues) => {
    let resolvedApplyTo: "ALL_PRODUCTS" | "BY_CATEGORY" | "SPECIFIC_PRODUCTS" = "ALL_PRODUCTS";
    if (selectedProductIds.length > 0)      resolvedApplyTo = "SPECIFIC_PRODUCTS";
    else if (selectedCategoryIds.length > 0) resolvedApplyTo = "BY_CATEGORY";

    const payload = {
      name:            data.name,
      discountType:    data.discountType,
      discountValue:   data.discountType === "BOGO" 
                         ? 1 
                         : Number(data.discountValue?.toString().replace(/[^0-9.]/g, "") || 0),
      applyTo:         resolvedApplyTo,
      ...(resolvedApplyTo === "BY_CATEGORY"       && { categoryIds: selectedCategoryIds }),
      ...(resolvedApplyTo === "SPECIFIC_PRODUCTS" && { productIds:  selectedProductIds  }),
      startDate:       new Date(data.startDate).toISOString(),
      endDate:         data.endDate ? new Date(data.endDate).toISOString() : undefined,
      minimumPurchase: data.minAmount  ?? 0,
      usageLimit:      data.useLimit   ?? 0,
      onePerCustomer:  data.onePerCustomer,
    };

    try {
    
      if (mode === "edit" && editId) {
        await updatePromotion(editId, payload);
        toast.success("Promotion updated successfully!");
        close("promotion-edit-modal", ["promotion-edit"]);
      } else {
        await createPromotion(payload);
        toast.success("Promotion created successfully!");
        close("create-promotion-modal", ["create-promotion"]); 
      }
    } catch (err) {
      console.error("Submit failed:", err);
      toast.error(`Failed to ${mode} promotion. Please try again.`);
    }
  };

 
  if (isFetchingEdit) {
    return <div className="p-8 text-center text-muted-foreground animate-pulse">Loading promotion data...</div>;
  }

  return (
    <div className="w-full p-1 md:p-2 pb-12">
      <div>
        <div className="text-lg font-medium">
          {mode === "create" ? "Create New Promotion" : "Edit Promotion"}
        </div>
        <p className="text-muted-foreground text-sm mb-4">
          {mode === "create" ? "Set up the basic details of your promotion" : "Update your promotion details"}
        </p>
      </div>

      <Stepper steps={steps} currentStep={step} />

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 py-4">

        {/* STEP 0 — Basic Info */}
        {step === 0 && (
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Campaign Name*</Label>
              <Input {...register("name")} placeholder="Summer Sale / Black Friday Deal" />
              {errors.name && <p className="text-destructive text-sm">{errors.name.message}</p>}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="space-y-1">
                <Label>Discount Type*</Label>
                <Controller
                  name="discountType"
                  control={control}
                  render={({ field }) => (
                    <Select onValueChange={field.onChange} value={field.value}>
                      <SelectTrigger className="w-full">
                        <SelectValue placeholder="Select discount type" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="PERCENTAGE">Percentage (%)</SelectItem>
                        <SelectItem value="FIXED">Fixed Amount</SelectItem>
                        <SelectItem value="BOGO">Buy One Get One</SelectItem>
                      </SelectContent>
                    </Select>
                  )}
                />
                {errors.discountType && <p className="text-destructive text-sm">{errors.discountType.message}</p>}
              </div>

              {watchDiscountType !== "BOGO" && (
                <div className="space-y-1">
                  <Label>Discount Value*</Label>
                  <Input {...register("discountValue")} placeholder="e.g. 10" />
                  {errors.discountValue && <p className="text-destructive text-sm">{errors.discountValue.message}</p>}
                </div>
              )}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="space-y-1">
                <Label>Start Date*</Label>
                <Input type="date" {...register("startDate")} />
                {errors.startDate && <p className="text-destructive text-sm">{errors.startDate.message}</p>}
              </div>
              <div className="space-y-1">
                <Label>End Date</Label>
                <Input type="date" {...register("endDate")} />
              </div>
            </div>
          </div>
        )}

        {/* STEP 1 — Apply To */}
         {step === 1 && (
          loading
            ? <p className="text-sm text-muted-foreground animate-pulse py-8 text-center">Loading...</p>
            : <ApplyPromotion
                applyTo={applyTo}
                onApplyToChange={setApplyTo}
                selectedCategoryIds={selectedCategoryIds}
                onCategoryChange={setSelectedCategoryIds}
                selectedProductIds={selectedProductIds}
                onProductChange={setSelectedProductIds}
                categories={categories}   
                products={products}       
              />
        )}

        {/* STEP 2 — Restrictions */}
        {step === 2 && (
          <div className="space-y-4">
            <div className="grid w-full gap-3">
              <Label>Minimum Purchase Amount</Label>
              <Input type="number" {...register("minAmount", { valueAsNumber: true })} placeholder="0" className="h-12" />
              {errors.minAmount && <p className="text-destructive text-sm">{errors.minAmount.message}</p>}
            </div>

            <div className="grid w-full gap-3">
              <Label>Use Limit</Label>
              <Input type="number" {...register("useLimit", { valueAsNumber: true })} placeholder="0" className="h-12" />
              {errors.useLimit && <p className="text-destructive text-sm">{errors.useLimit.message}</p>}
            </div>

            <div className="flex items-center justify-between rounded-md border p-3">
              <div>
                <p className="text-sm font-medium">One Per Customer</p>
                <p className="text-xs mt-1 text-muted-foreground">Limit each customer to one use</p>
              </div>
              <Controller
                name="onePerCustomer"
                control={control}
                render={({ field }) => <Switch checked={field.value} onCheckedChange={field.onChange} />}
              />
            </div>

            <div className="flex items-center bg-blue-50 justify-between rounded-md border p-3">
              <div>
                <div className="flex gap-2">
                  <Sparkles className="text-chart-8" size={18} />
                  <p className="text-sm font-medium">Pro Tip</p>
                </div>
                <p className="text-xs mt-1 ml-6 text-muted-foreground">
                  Setting a minimum purchase amount and usage limits can help protect your margins.
                </p>
              </div>
            </div>
          </div>
        )}

        <hr />

    <div className="flex justify-between">
      <Button 
        variant="outline" 
        disabled={step === 0} 
        type="button"
        onClick={(e) => {
          e.preventDefault(); 
          setStep(step - 1);
        }} 
      >
        Back
      </Button>

      {step < steps.length - 1 ? (
        <Button 
          className="bg-primary text-card" 
          type="button" 
          onClick={(e) => {
            e.preventDefault(); 
            setStep(step + 1);
          }} 
        >
          Continue
        </Button>
      ) : (
        <Button 
          className="bg-primary text-card" 
          type="submit" 
        >
          {mode === "create" ? "Create Promotion" : "Update Promotion"}
        </Button>
      )}
    </div>

      </form>
    </div>
  );
};

export default PromotionDialog;