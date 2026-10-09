"use client";

import { useEffect, useRef, useMemo, useState, useCallback } from "react";
import { useRouter, usePathname, useSearchParams } from "next/navigation";
import { ChevronDown, Check } from "lucide-react";
import { Label } from "@/components/ui/label";
import ColorPicker from "@/components/ui/ColorPicker";
import { ProductDetail } from "@/types/productDetails";
import { cn } from "@/lib/utils";

interface VariantOptionsProps {
  data: ProductDetail;
  variantId?: string | null;
}

type OptionMap = Record<string, string>;

// ── Custom fully-controlled Dropdown ─────────────────────────────────────────
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
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const handleSelect = (val: string) => {
    onChange(val);
    setOpen(false);
  };

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
        <span className={cn(!value && "text-primary/50")}>
          {value || placeholder}
        </span>
        <ChevronDown
          className={cn(
            "size-4 shrink-0 text-primary transition-transform duration-200 cursor-pointer",
            open && "rotate-180",
          )}
        />
      </button>

      {open && (
        <div
          className={cn(
            "absolute z-50 mt-1.5 w-full",
            "bg-background border border-border rounded-2xl shadow-lg",
            "py-1 overflow-hidden",
            "animate-in fade-in-0 zoom-in-95 duration-100",
          )}
        >
          {options.map((opt) => {
            const isSelected = opt === value;
            return (
              <button
                key={opt}
                type="button"
                onClick={() => handleSelect(opt)}
                className={cn(
                  "w-full flex items-center justify-between gap-2",
                  "px-4 py-2 text-base text-left",
                  "transition-colors duration-100",
                  isSelected
                    ? "text-primary font-medium bg-primary/5"
                    : "text-foreground hover:bg-muted",
                )}
              >
                <span>{opt}</span>
                {isSelected && (
                  <Check className="size-4 text-primary shrink-0" />
                )}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}

// ── Main component ─────────────────────────────────────────────────────────────
export default function VariantOptions({
  data,
  variantId,
}: VariantOptionsProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  // Always hold latest searchParams in a ref — same pattern as carousel
  const searchParamsRef = useRef(searchParams);
  useEffect(() => {
    searchParamsRef.current = searchParams;
  }, [searchParams]);

  // All unique option names + ALL values across every variant
  const optionSchema = useMemo(() => {
    const schema: Record<
      string,
      { type: "color_picker" | "dropdown"; values: string[] }
    > = {};
    for (const variant of data.variants) {
      for (const opt of variant.options) {
        if (!schema[opt.name]) {
          schema[opt.name] = {
            type: opt.type as "color_picker" | "dropdown",
            values: [],
          };
        }
        if (!schema[opt.name].values.includes(opt.value)) {
          schema[opt.name].values.push(opt.value);
        }
      }
    }
    return schema;
  }, [data.variants]);

  // Current selections derived purely from active variantId
  const currentSelections = useMemo<OptionMap>(() => {
    const target =
      data.variants.find((v) => v.id === variantId) ?? data.variants[0];
    if (!target) return {};
    return Object.fromEntries(target.options.map((o) => [o.name, o.value]));
  }, [data.variants, variantId]);

  // Set default variantId in URL on mount if missing
  useEffect(() => {
    if (!variantId && data.variants[0]) {
      const params = new URLSearchParams(searchParamsRef.current.toString());
      params.set("variantId", data.variants[0].id);
      router.replace(`${pathname}?${params.toString()}`, { scroll: false });
    }
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const handleOptionChange = useCallback(
    (changedName: string, changedValue: string) => {
      const desired: OptionMap = {
        ...currentSelections,
        [changedName]: changedValue,
      };

      // 1. Exact match — all options align
      const exact = data.variants.find((v) =>
        v.options.every((o) => desired[o.name] === o.value),
      );

      // 2. Must have the changed option, then highest score
      const best =
        exact ??
        data.variants
          .filter((v) =>
            v.options.some(
              (o) => o.name === changedName && o.value === changedValue,
            ),
          )
          .map((v) => ({
            v,
            score: v.options.filter((o) => desired[o.name] === o.value).length,
          }))
          .sort((a, b) => b.score - a.score)[0]?.v ??
        // 3. Fallback: overall best score
        data.variants
          .map((v) => ({
            v,
            score: v.options.filter((o) => desired[o.name] === o.value).length,
          }))
          .sort((a, b) => b.score - a.score)[0]?.v;

      if (best) {
        const params = new URLSearchParams(searchParamsRef.current.toString());
        params.set("variantId", best.id);
        router.replace(`${pathname}?${params.toString()}`, { scroll: false });
      }
    },
    [currentSelections, data.variants, pathname, router],
  );

  if (!data.variants.length) return null;

  return (
    <div className="pt-4 grid grid-cols-1 gap-4">
      {Object.entries(optionSchema).map(([name, { type, values }]) => {
        const currentValue = currentSelections[name] ?? values[0] ?? "";

        return (
          <div key={name}>
            <Label className="text-base md:text-xl text-foreground mb-2 block">
              Select your {name}
            </Label>

            {type === "color_picker" ? (
              <ColorPicker
                key={`${name}-${currentValue}`}
                colors={values.map((code) => ({ label: code, code }))}
                defaultSelected={currentValue}
                onChange={(color) => handleOptionChange(name, color)}
              />
            ) : (
              <Dropdown
                value={currentValue}
                options={values}
                placeholder={`Select a ${name}`}
                onChange={(val) => handleOptionChange(name, val)}
              />
            )}
          </div>
        );
      })}
    </div>
  );
}
