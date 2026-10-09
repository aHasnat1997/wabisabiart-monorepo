"use client";

import { useEffect, useRef, useState } from "react";
import { useForm, FormProvider } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
import Stepper from "../../marketing/components/Stepper";
import AddProductStep1 from "./AddProductStep1";
import { ProductFormValues, productSchema } from "./ProductSchema";
import { createProduct } from "./Action";
import AddProductStep3 from "./AddProductStep3";
import AddProductStep4 from "./AddProductStep4";
import AddProductStep5 from "./AddProductStep5";
import AddProductStep2 from "./AddProductStep2";
import { toast } from "sonner";
import { useRouter } from "next/navigation";

const steps = [
  "Basic Info",
  "Attributes",
  "Variants & Fields",
  "Offers & Settings",
  "Review & Submit",
];

const STORAGE_KEY = "add_product_draft";

const stepFields: Record<number, (keyof ProductFormValues)[]> = {
  0: [
    "title",
    "subtitle",
    "description",
    "categoryType",
    "category",
    "subCategory",
    "price",
    "tags",
    "customizable",
    "handmade",
    "madeToOrder",
    "processingTime",
  ],
  1: ["customFields"], // Step 2: Attributes only
  2: ["variants"], // Step 3: Variants only
  3: [
    "discountType",
    "discountValue",
    "trackInventory",
    "lowStockThreshold",
    "scheduleCall",
    "callDate",
    "callTime",
    "callNote",
  ],
  4: [], // Step 5: Review
};
const AddProduct = ({
  defaultData,
}: {
  defaultData?: Partial<ProductFormValues>;
}) => {
  const [step, setStep] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const totalStep = steps.length;
  const router = useRouter();

  const methods = useForm<ProductFormValues, unknown, ProductFormValues>({
    resolver: zodResolver(productSchema),
    defaultValues: {
      title: defaultData?.title ?? "",
      subtitle: defaultData?.subtitle ?? "",
      description: defaultData?.description ?? "",
      categoryType: defaultData?.categoryType ?? "crafts",
      category: defaultData?.category ?? "",
      subCategory: defaultData?.subCategory ?? "",
      price: defaultData?.price ?? 0,
      tags: defaultData?.tags ?? [],
      customizable: defaultData?.customizable ?? false,
      handmade: defaultData?.handmade ?? false,
      madeToOrder: defaultData?.madeToOrder ?? false,
      processingTime: defaultData?.processingTime ?? 0,
      images: defaultData?.images ?? [],
      variants: defaultData?.variants ?? [],
      customFields: defaultData?.customFields ?? [],
      discountType: defaultData?.discountType ?? "none",
      discountValue: defaultData?.discountValue ?? 0,
      trackInventory: defaultData?.trackInventory ?? false,
      lowStockThreshold: defaultData?.lowStockThreshold ?? 0,
      scheduleCall: defaultData?.scheduleCall ?? false,
      callDate: defaultData?.callDate ?? "",
      callTime: defaultData?.callTime ?? "",
      callNote: defaultData?.callNote ?? "",
    },
    shouldUnregister: false,
  });

  const { watch, trigger } = methods;

  const handleNext = async () => {
    if (step >= totalStep - 1) return;

    const fields = stepFields[step];
    const isValid = await trigger(fields as Parameters<typeof trigger>[0]);
    if (!isValid) return;

    console.log(` Step ${step + 1} — "${steps[step]}"`, watch());
    setStep((s) => s + 1);
  };

  const handleBack = () => {
    console.log(` Step ${step + 1} — "${steps[step]}"`, watch());
    setStep((s) => s - 1);
  };

  const isSubmittedRef = useRef(false);

  useEffect(() => {
    if (isSubmittedRef.current) return;
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        methods.reset(parsed);
      } catch {}
    }
  }, []);

  useEffect(() => {
    const subscription = watch((data) => {
      if (!isSubmittedRef.current) {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
      }
    });
    return () => subscription.unsubscribe();
  }, [watch]);
  const handleFinalSubmit = async (data: ProductFormValues) => {
    isSubmittedRef.current = true;
    setIsLoading(true);
    const payload = {
      title: data.title,
      subtitle: data.subtitle ?? "",
      price: data.price,
      description: data.description,
      discountType:
        data.discountType === "none" ? "percentage" : data.discountType,
      discountValue:
        data.discountType === "none" ? 0 : (data.discountValue ?? 0),
      trackInventory: data.trackInventory ?? false,
      lowStockThreshold: data.lowStockThreshold ?? 0,
      categoryType: data.categoryType,
      categoryId: data.category,
      subCategoryId: data.subCategory,
      tags: data.tags ?? [],
      customizable: data.customizable ?? false,
      handmade: data.handmade ?? false,
      madeToOrder: data.madeToOrder ?? false,
      processingTime: data.processingTime ?? 0,
      variants: (data.variants ?? []).map((v) => {
        console.log("mediaUrl raw:", v.mediaUrl);
        return {
          name: v.name?.trim() || "Default Variant",
          quantity: v.quantity ?? 0,
          isActive: v.isActive ?? true,
          ...(v.mediaUrl?.trim() ? { mediaUrl: v.mediaUrl.trim() } : {}),
          options: (v.options ?? [])
            .filter((o) => {
              const validTypes = ["dropdown", "color_picker"];
              return (
                validTypes.includes(o.type) &&
                (o?.name ?? "").trim() !== "" &&
                (o?.value ?? "").trim() !== ""
              );
            })
            .map((o) => ({
              name: (o.name ?? "").trim(),
              value: (o.value ?? "").trim(),
              type: o.type as "dropdown" | "color_picker",
              quantity: o.quantity ?? 0,
            })),
        };
      }),
    };

    try {
      const res = await createProduct(payload);
      console.log("Product created:", res);
      toast.success("Product created successfully!");
      localStorage.removeItem(STORAGE_KEY);
      methods.reset({
        title: "",
        subtitle: "",
        description: "",
        categoryType: "crafts",
        category: "",
        subCategory: "",
        price: 0,
        tags: [],
        customizable: false,
        handmade: false,
        madeToOrder: false,
        processingTime: 0,
        images: [],
        variants: [],
        customFields: [],
        discountType: "none",
        discountValue: 0,
        trackInventory: false,
        lowStockThreshold: 0,
        scheduleCall: false,
        callDate: "",
        callTime: "",
        callNote: "",
      });
      router.push("/seller-dashboard/products");
    } catch (err) {
      console.error(err);
      toast.error("Failed to create product. Please try again.");
    } finally {
      setIsLoading(false);
      setTimeout(() => {
        isSubmittedRef.current = false;
      }, 100);
    }
  };


  return (
    <div className="p-2 w-full h-full">
      <div className="font-medium text-lg mb-2">Add New Product</div>
      <div className="text-muted-foreground text-xs mb-4">
        Step {step + 1} of {totalStep}
      </div>

      <Stepper steps={steps} currentStep={step} />

      <FormProvider {...methods}>
        <form
          onSubmit={methods.handleSubmit(handleFinalSubmit, (errors) => {
            console.log("Validation errors:", errors);
          })}
          className="space-y-4 py-4"
        >
          {step === 0 && <AddProductStep1 step={step} />}
          {step === 1 && <AddProductStep2 step={step} />}
          {step === 2 && <AddProductStep3 step={step} />}
          {step === 3 && <AddProductStep4 step={step} />}
          {step === 4 && <AddProductStep5 step={step} />}

          <div className="flex justify-end pt-4">
            <div className="flex gap-2">
              <Button
                type="button"
                variant="outline"
                disabled={step === 0}
                onClick={handleBack}
              >
                Back
              </Button>

              {step < totalStep - 1 ? (
                <Button
                  type="button"
                  onClick={(e) => {
                    e.preventDefault();
                    handleNext();
                  }}
                >
                  Continue
                </Button>
              ) : (
                <Button type="submit" disabled={isLoading}>
                  {isLoading ? "Creating..." : "Create Product"}
                </Button>
              )}
            </div>
          </div>
        </form>
      </FormProvider>
    </div>
  );
};

export default AddProduct;
