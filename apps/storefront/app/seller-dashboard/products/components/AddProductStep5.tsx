"use client";

import Image from "next/image";
import { useState, useRef, useEffect, useMemo, useCallback } from "react";
import { useFormContext } from "react-hook-form";
import { CustomField, ProductFormValues } from "./ProductSchema";
import { Badge } from "@/components/ui/badge";
import { Rating, RatingButton } from "@/components/ui/shadcn-io/rating";
import { Button } from "@/components/ui/button";
import { LiaShoppingBagSolid } from "react-icons/lia";
import { cn } from "@/lib/utils";
import {
  Award,
  ExternalLink,
  Heart,
  ChevronLeft,
  ChevronRight,
  ChevronDown,
  Check,
} from "lucide-react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { BiMessageRoundedDetail } from "react-icons/bi";
import { Label } from "@/components/ui/label";
import { getImageUrl } from "./getImageUrl";
import { ScrollArea } from "@/components/ui/scroll-area";

interface AddProductStep5Props {
  step: number;
}

// ── Dropdown ─────────────────────────────────────────────────────────────────
interface DropdownProps {
  value: string;
  options: string[];
  placeholder?: string;
  onChange: (val: string) => void;
}

function Dropdown({ value, options, placeholder, onChange }: DropdownProps) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  return (
    <div ref={ref} className="relative w-full">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className={cn(
          "w-full flex items-center justify-between gap-2",
          "px-4 h-10 rounded-full border border-primary",
          "text-base font-medium text-primary bg-background",
          "transition-all duration-150",
          "hover:bg-primary/5 focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/40",
          open && "bg-primary/5",
        )}
      >
        <span className={cn(!value && "text-primary/50")}>{value || placeholder}</span>
        <ChevronDown className={cn("size-4 shrink-0 text-primary transition-transform duration-200", open && "rotate-180")} />
      </button>

      {open && (
        <div className={cn(
          "absolute z-50 mt-1.5 w-full",
          "bg-background border border-border rounded-2xl shadow-lg",
          "py-1 overflow-hidden",
          "animate-in fade-in-0 zoom-in-95 duration-100",
        )}>
          {options.map((opt) => {
            const isSelected = opt === value;
            return (
              <button
                key={opt}
                type="button"
                onClick={() => { onChange(opt); setOpen(false); }}
                className={cn(
                  "w-full flex items-center justify-between gap-2 px-4 py-2 text-base text-left transition-colors duration-100",
                  isSelected ? "text-primary font-medium bg-primary/5" : "text-foreground hover:bg-muted",
                )}
              >
                <span>{opt}</span>
                {isSelected && <Check className="size-4 text-primary shrink-0" />}
              </button>
            );
          })}
          
        </div>
      )}
    </div>
  );
}

// ── QuantityInput ─────────────────────────────────────────────────────────────
function QuantityInput({ value, min = 1, max, onChange }: { value: number; min?: number; max?: number; onChange: (v: number) => void }) {
  return (
    <div className="flex items-center border border-border rounded-lg overflow-hidden select-none">
      <button type="button" onClick={() => onChange(Math.max(min, value - 1))} disabled={value <= min}
        className="px-3 py-2 text-xl font-light hover:bg-muted transition disabled:opacity-40">−</button>
      <span className="px-5 py-2 text-sm font-semibold border-x border-border min-w-[2.5rem] text-center">{value}</span>
      <button type="button" onClick={() => onChange(max !== undefined ? Math.min(max, value + 1) : value + 1)} disabled={max !== undefined && value >= max}
        className="px-3 py-2 text-xl font-light hover:bg-muted transition disabled:opacity-40">+</button>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────

const AddProductStep5 = ({ step }: AddProductStep5Props) => {
  const { watch } = useFormContext<ProductFormValues>();

  const [activeThumb, setActiveThumb] = useState(0);
  const [selectedOptions, setSelectedOptions] = useState<Record<string, string>>({});
  const [cartQty, setCartQty] = useState(1);
  const stripRef = useRef<HTMLDivElement>(null);



  const values = watch();
  const customFields: CustomField[] = values.customFields ?? [];
  const variants = values.variants ?? [];
  const tags = values.tags ?? [];

  const allImages = variants
    .map((v) => v.mediaUrl)
    .filter((url): url is string => !!url && url !== "");

  // ── Seed selectedOptions from variant[0].options on mount ────────────────
  useEffect(() => {
    if (variants[0]?.options?.length) {
      const init: Record<string, string> = {};
      variants[0].options.forEach((o) => { init[o.name] = o.value; });
      setSelectedOptions(init);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ── Option schema derived from customFields ───────────────────────────────
  // For Color Picker: options = unique hex values across all variants for that field
  // For Dropdown: options = CSV split from customField.value
  const optionSchema = useMemo(() => {
    return customFields.map((field) => {
      if (field.type === "Color Picker") {
        // Collect all unique hex values from variants
        const hexValues = Array.from(
          new Set(
            variants
              .map((v) => v.options?.find((o) => o.name === field.title)?.value)
              .filter((v): v is string => !!v && v.startsWith("#")),
          ),
        );
        return { title: field.title, type: "Color Picker" as const, options: hexValues };
      } else {
        const options = (field.value ?? "")
          .split(",")
          .map((o) => o.trim())
          .filter(Boolean);
        return { title: field.title, type: "Dropdown" as const, options };
      }
    });
  }, [customFields, variants]);

  // ── Find best matching variant for current selectedOptions ────────────────
  // Mirrors VariantOptions scoring: exact → must-have-changed → overall best
  const findBestVariantIndex = useCallback(
    (next: Record<string, string>, changedField?: string): number => {
      // 1. Exact match — all options align
      const exact = variants.findIndex((v) =>
        v.options?.every((o) => next[o.name] === o.value),
      );
      if (exact !== -1) return exact;

      // 2. Must have changed field, then highest score
      if (changedField) {
        const withChanged = variants
          .map((v, i) => {
            const hasChanged = v.options?.some(
              (o) => o.name === changedField && o.value === next[changedField],
            );
            if (!hasChanged) return null;
            const score = v.options?.filter((o) => next[o.name] === o.value).length ?? 0;
            return { i, score };
          })
          .filter(Boolean) as { i: number; score: number }[];
        withChanged.sort((a, b) => b.score - a.score);
        if (withChanged[0]) return withChanged[0].i;
      }

      // 3. Fallback: overall best score
      const fallback = variants
        .map((v, i) => ({
          i,
          score: v.options?.filter((o) => next[o.name] === o.value).length ?? 0,
        }))
        .sort((a, b) => b.score - a.score);
      return fallback[0]?.i ?? 0;
    },
    [variants],
  );

  // ── Thumbnail click → sync dropdowns from variant.options ─────────────────
  const handleThumbClick = useCallback(
    (index: number) => {
      setActiveThumb(index);
      const variant = variants[index];
      if (variant?.options?.length) {
        const next: Record<string, string> = {};
        variant.options.forEach((o) => { next[o.name] = o.value; });
        setSelectedOptions(next);
      }
    },
    [variants],
  );

  // ── Option change → find best variant → update image ─────────────────────
  const handleOptionChange = useCallback(
    (fieldTitle: string, value: string) => {
      const next = { ...selectedOptions, [fieldTitle]: value };
      setSelectedOptions(next);
      const bestIdx = findBestVariantIndex(next, fieldTitle);
      if (allImages[bestIdx]) setActiveThumb(bestIdx);
      else {
        // even if no image, still track active variant for stock
        setActiveThumb(bestIdx);
      }
    },
    [selectedOptions, findBestVariantIndex, allImages],
  );

   

  const scrollStrip = (dir: "left" | "right") => {
    if (!stripRef.current) return;
    stripRef.current.scrollBy({ left: dir === "left" ? -200 : 200, behavior: "smooth" });
  };

  //  if product null
  
   if (step !== 4) return null;

  // ── Pricing ──────────────────────────────
  const originalPrice = values.price ?? 0;
  const discountType = values.discountType;
  const discountValue = values.discountValue ?? 0;
  let finalPrice = originalPrice;
  let discountLabel = "";
  if (discountType === "percentage" && discountValue > 0) {
    finalPrice = originalPrice * (1 - discountValue / 100);
    discountLabel = `${discountValue}% off`;
  } else if (discountType === "fixed_amount" && discountValue > 0) {
    finalPrice = Math.max(0, originalPrice - discountValue);
    discountLabel = `$${discountValue} off`;
  }
  const hasDiscount = discountLabel !== "";

  // activeVariant = whichever variant is currently selected (by thumb index)
  const activeVariant = variants[activeThumb] ?? variants[0];

  // ─────────────────────────────────────────────────────────────────────────

  return (
    <ScrollArea>
      <div className="space-y-4">
        {/* Preview Notice */}
        <div className="text-xs text-chart-5 bg-chart-3/10 border border-chart-3/20 rounded-lg px-4 py-2.5 flex items-center gap-2">
          <span>⚠️</span>
          <span>
            <strong>Preview mode.</strong> This is how your product will appear
            to buyers. Go back to edit.
          </span>
        </div>

        {/* MAIN SECTION */}
        <section className="flex flex-col lg:flex-row items-start gap-7">
          {/* LEFT: Image Carousel */}
          <div className="w-full lg:w-1/2 flex flex-col gap-3">
            <div className="relative w-full aspect-square rounded-2xl overflow-hidden bg-muted border border-border">
              {allImages[activeThumb] ? (
                <Image
                  src={getImageUrl(allImages[activeThumb])}
                  alt="Product preview"
                  fill
                  unoptimized
                  className="object-cover transition-all duration-300"
                />
              ) : (
                <div className="flex flex-col items-center justify-center h-full gap-3 text-muted-foreground">
                  <LiaShoppingBagSolid size={48} />
                  <p className="text-sm">No image uploaded yet</p>
                  <p className="text-xs">Upload variant images in Step 2</p>
                </div>
              )}
            </div>

            {allImages.length > 0 ? (
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => scrollStrip("left")}
                  className="shrink-0 h-8 w-8 rounded-full border border-border bg-card shadow-sm flex items-center justify-center hover:bg-muted transition"
                >
                  <ChevronLeft size={16} />
                </button>
                <div
                  ref={stripRef}
                  className="flex flex-row gap-2 overflow-x-auto overflow-y-hidden flex-1 pb-0.5"
                  style={{
                    scrollbarWidth: "none",
                    WebkitOverflowScrolling: "touch",
                  }}
                >
                  {allImages.map((src, i) => (
                    <button
                      key={i}
                      type="button"
                      onClick={() => handleThumbClick(i)}
                      className={cn(
                        "relative shrink-0 h-[90px] w-[90px] rounded-xl overflow-hidden border-2 transition-all duration-150",
                        activeThumb === i
                          ? "border-primary"
                          : "border-border hover:border-primary/40",
                      )}
                    >
                      <Image
                        src={getImageUrl(src)}
                        alt={`Thumb ${i + 1}`}
                        fill
                        unoptimized
                        className="object-cover"
                      />
                    </button>
                  ))}
                </div>
                <button
                  type="button"
                  onClick={() => scrollStrip("right")}
                  className="shrink-0 h-8 w-8 rounded-full border border-border bg-card shadow-sm flex items-center justify-center hover:bg-muted transition"
                >
                  <ChevronRight size={16} />
                </button>
              </div>
            ) : (
              <div className="flex gap-2">
                {[0, 1, 2, 3].map((i) => (
                  <div
                    key={i}
                    className={cn(
                      "shrink-0 h-[90px] w-[90px] rounded-xl border-2 bg-muted",
                      i === 0 ? "border-primary" : "border-border",
                    )}
                  />
                ))}
              </div>
            )}
          </div>

          {/* RIGHT: Product Details — STICKY */}
          <div className="w-full lg:w-1/2 lg:sticky lg:top-4 lg:self-start">
            <h1 className="text-[32px] xl:text-[40px] font-semibold mb-3">
              {values.title || "Your Product Title"}
            </h1>

            <div className="flex items-center gap-3">
              <Rating defaultValue={4.7} readOnly>
                {Array.from({ length: 5 }).map((_, index) => (
                  <RatingButton className="text-chart-7/80" key={index} />
                ))}
              </Rating>
              <p className="text-xl text-foreground">4.7</p>
              <p className="text-xl text-muted-foreground">(preview only)</p>
            </div>

            <div className="flex items-center gap-4 my-3.5">
              <span className="text-2xl xl:text-[32px] text-foreground">
                $
                {hasDiscount ? finalPrice.toFixed(2) : originalPrice.toFixed(2)}
              </span>
              {hasDiscount && (
                <>
                  <span className="text-base xl:text-2xl line-through ml-2 text-muted-foreground">
                    ${originalPrice.toFixed(2)}
                  </span>
                  <Badge className="capitalize">{discountLabel}</Badge>
                </>
              )}
            </div>

            <p className="text-muted-foreground text-base xl:text-xl text-justify border-b pb-4 leading-6">
              {values.subtitle || "Your product subtitle will appear here."}
            </p>

            <p className="text-primary font-semibold text-base xl:text-xl text-justify leading-6 pt-4">
              {activeVariant?.quantity || 0}{" "}
              {activeVariant?.quantity === 1 ? "item" : "items"} in stock
            </p>

            {/* ── Variant Options ── */}
            {optionSchema.length > 0 && (
              <div className="pt-4 grid grid-cols-1 gap-4">
                {optionSchema.map(({ title, type, options }) => {
                  const currentValue =
                    selectedOptions[title] ?? options[0] ?? "";

                  return (
                    <div key={title}>
                      <Label className="text-base md:text-xl text-foreground mb-2 block">
                        Select your {title}
                        {/* Show selected color name for Color Picker */}
                        {type === "Color Picker" && currentValue && (
                          <span className="ml-2 text-sm font-normal text-muted-foreground">
                            —{" "}
                            <span
                              className="inline-block h-3 w-3 rounded-full border align-middle mr-1"
                              style={{ backgroundColor: currentValue }}
                            />
                            {currentValue}
                          </span>
                        )}
                      </Label>

                      {type === "Color Picker" ? (
                        <div className="flex flex-wrap gap-2">
                          {options.map((hex, ci) => (
                            <button
                              key={ci}
                              type="button"
                              onClick={() => handleOptionChange(title, hex)}
                              className={cn(
                                "h-8 w-8 rounded-full border-2 shadow-sm transition-all duration-150",
                                currentValue === hex
                                  ? "ring-2 ring-primary ring-offset-1 border-primary scale-110"
                                  : "border-border hover:border-primary/50 hover:scale-105",
                              )}
                              style={{ backgroundColor: hex }}
                              title={hex}
                            />
                          ))}
                        </div>
                      ) : (
                        <Dropdown
                          value={currentValue}
                          options={options}
                          placeholder={`Select a ${title}`}
                          onChange={(val) => handleOptionChange(title, val)}
                        />
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </section>

        {/* PRODUCT DETAILS SECTION */}
        <section className="mt-10">
          <h2 className="text-2xl font-semibold">Product Details</h2>
          {values.description ? (
            <div
              className="mt-2 text-muted-foreground prose prose-sm max-w-none prose-p:my-1 prose-h2:text-base prose-h2:font-bold prose-h2:my-2 prose-ul:list-disc prose-ul:pl-5 prose-ol:list-decimal prose-ol:pl-5 prose-strong:font-bold prose-em:italic"
              dangerouslySetInnerHTML={{ __html: values.description }}
            />
          ) : (
            <p className="text-muted-foreground mt-2">
              Your product description will appear here.
            </p>
          )}
        </section>

        {/* Summary pills */}
        {(hasDiscount || values.trackInventory || values.scheduleCall) && (
          <div className="flex flex-wrap gap-3 mt-4">
            {hasDiscount && (
              <div className="flex items-center gap-2 bg-green-50 border border-green-200 text-green-800 text-xs px-4 py-2 rounded-full font-medium">
                🏷️ {discountLabel} applied
              </div>
            )}
            {values.trackInventory && (
              <div className="flex items-center gap-2 bg-orange-50 border border-orange-200 text-orange-800 text-xs px-4 py-2 rounded-full font-medium">
                📦 Stock alert at {values.lowStockThreshold ?? 0} units
              </div>
            )}
            {values.scheduleCall && (
              <div className="flex items-center gap-2 bg-blue-50 border border-blue-200 text-blue-800 text-xs px-4 py-2 rounded-full font-medium">
                📞 Call: {values.callDate} at {values.callTime}
              </div>
            )}
          </div>
        )}
      </div>
    </ScrollArea>
  );
};

export default AddProductStep5;