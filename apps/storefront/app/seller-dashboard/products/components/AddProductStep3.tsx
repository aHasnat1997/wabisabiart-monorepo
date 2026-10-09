"use client";
import { useState, useEffect } from "react";
import { useFormContext } from "react-hook-form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Plus, X, Upload, ChevronUp, ChevronDown, Lock } from "lucide-react";

import { ProductFormValues } from "./ProductSchema";
import { uploadImage, deleteImage } from "./UploadAction";
import { toast } from "sonner";
import Image from "next/image";
import { getImageUrl } from "./getImageUrl";
import { ScrollArea } from "@/components/ui/scroll-area";

interface Props {
  step: number;
}

const PRESET_COLORS = [
  { label: "Black", code: "#000000" },
  { label: "White", code: "#FFFFFF" },
  { label: "Gray", code: "#9CA3AF" },
  { label: "Silver", code: "#C0C0C0" },
  { label: "Red", code: "#EF4444" },
  { label: "Blue", code: "#3B82F6" },
  { label: "Navy", code: "#1E3A8A" },
  { label: "Green", code: "#10B981" },
  { label: "Olive", code: "#6B8E23" },
  { label: "Yellow", code: "#FACC15" },
  { label: "Orange", code: "#FB923C" },
  { label: "Pink", code: "#EC4899" },
  { label: "Purple", code: "#8B5CF6" },
  { label: "Brown", code: "#92400E" },
  { label: "Gold", code: "#D4AF37" },
];

const AddProductStep3 = ({ step }: Props) => {
  const { watch, setValue } = useFormContext<ProductFormValues>();
  const [expanded, setExpanded] = useState<number[]>([0]);

  const attributes = watch("customFields") ?? [];
  const variants = watch("variants") ?? [];

  // Sync variants when attributes change
  useEffect(() => {
    if (variants.length === 0 || step !== 2) return;

    const getSelectableAttributes = () =>
      attributes.filter(
        (attr) => attr.type === "Color Picker" || attr.type === "Dropdown",
      );

    const selectableAttrs = getSelectableAttributes();
    const hasAttributeChanges = variants.some((variant) => {
      const currentOptionNames = variant.options?.map((o) => o.name) ?? [];
      const expectedOptionNames = selectableAttrs.map((a) => a.title);

      return (
        currentOptionNames.length !== expectedOptionNames.length ||
        !currentOptionNames.every((name) => expectedOptionNames.includes(name))
      );
    });

    if (hasAttributeChanges) {
      const updated = variants.map((variant) => ({
        ...variant,
        options: selectableAttrs.map((attr) => {
          const existingOption = variant.options?.find(
            (o) => o.name === attr.title,
          );
          return (
            existingOption || {
              name: attr.title,
              value: "",
              type: (attr.type === "Color Picker"
                ? "color_picker"
                : "dropdown") as "dropdown" | "color_picker",
              quantity: 0,
            }
          );
        }),
      }));

      setValue("variants", updated as ProductFormValues["variants"]);
    }
  }, [attributes, variants, setValue, step]);

  if (step !== 2) return null;

  const addVariant = () => {
    console.log("attributes:", JSON.stringify(attributes, null, 2));
    const newOptions = attributes
      .filter(
        (attr) => attr.type === "Color Picker" || attr.type === "Dropdown",
      )
      .map((attr) => ({
        name: attr.title,
        value: "",
        type: (attr.type === "Color Picker" ? "color_picker" : "dropdown") as
          | "dropdown"
          | "color_picker",
        quantity: 0,
      }));

    console.log("newOptions:", newOptions);

    setValue("variants", [
      ...variants,
      {
        name: "",
        quantity: 0,
        mediaUrl: "",
        isActive: true,
        options: newOptions,
      },
    ]);

    setTimeout(() => {
      console.log(
        "variants in form after set:",
        JSON.stringify(watch("variants"), null, 2),
      );
    }, 200);

    setExpanded((prev) => [...prev, variants.length]);
  };

  const removeVariant = (index: number) => {
    setValue(
      "variants",
      variants.filter((_, i) => i !== index),
    );
    setExpanded((prev) =>
      prev.filter((i) => i !== index).map((i) => (i > index ? i - 1 : i)),
    );
  };

  const toggleExpand = (index: number) => {
    setExpanded((prev) =>
      prev.includes(index) ? prev.filter((i) => i !== index) : [...prev, index],
    );
  };

  const updateVariant = (vIndex: number, key: string, value: unknown) => {
    const updated = [...variants];
    if (!updated[vIndex]) return;
    updated[vIndex] = { ...updated[vIndex], [key]: value };
    setValue("variants", updated as ProductFormValues["variants"]);
  };
  const updateOption = (vIndex: number, attrTitle: string, value: string) => {
    const updated = [...variants];
    if (!updated[vIndex]?.options) return;
    console.log("options:", updated[vIndex].options);
    console.log("looking for:", attrTitle);
    const oIndex = updated[vIndex].options.findIndex(
      (o) => o.name === attrTitle,
    );
    console.log("found index:", oIndex);
    if (oIndex === -1) return;
    updated[vIndex].options[oIndex].value = value;
    setValue("variants", updated as ProductFormValues["variants"]);
  };

  const handleImageUpload = async (
    e: React.ChangeEvent<HTMLInputElement>,
    vIndex: number,
  ) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // ১. Local preview URL (blob) set kora
    const previewUrl = URL.createObjectURL(file);
    updateVariant(vIndex, "mediaUrl", previewUrl);

    try {
      const url = await uploadImage(file);
      // ২. Server theke asha permanent URL set kora
      updateVariant(vIndex, "mediaUrl", url);
    } catch {
      updateVariant(vIndex, "mediaUrl", "");
      toast.error("Upload failed");
    }
    e.target.value = "";
  };

  const handleImageRemove = async (vIndex: number) => {
    const url = variants[vIndex]?.mediaUrl ?? "";
    if (url && !url.startsWith("blob:")) {
      try {
        await deleteImage(url);
        toast.success("Image removed successfully!");
      } catch {
        toast.error("Failed to remove image.");
      }
    }
    updateVariant(vIndex, "mediaUrl", "");
  };

  const totalStock = variants.reduce((sum, v) => sum + (v.quantity || 0), 0);

  return (
    <ScrollArea>
      <div className="space-y-4">
        {/* Attribute Schema Badge */}
        {attributes.length > 0 && (
          <div className="flex items-center gap-2 border rounded-lg px-4 py-2 bg-muted/20 flex-wrap">
            <Lock size={13} className="text-muted-foreground shrink-0" />
            <span className="text-xs text-muted-foreground">
              Attribute schema:
            </span>
            {attributes.map((attr) => (
              <span
                key={attr.title}
                className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                  attr.type === "Color Picker"
                    ? "bg-chart-5/20 text-chart-5"
                    : attr.type === "Dropdown"
                      ? "bg-chart-8/10 text-chart-8"
                      : "bg-muted-foreground/10 text-muted-foreground"
                }`}
              >
                {attr.title}{" "}
                <span className="opacity-60">
                  (
                  {attr.type === "Color Picker"
                    ? "color"
                    : attr.type === "Dropdown"
                      ? "dropdown"
                      : "text"}
                  )
                </span>
              </span>
            ))}
          </div>
        )}

        {/* Info Banner */}
        <div className="bg-chart-8/5 border border-chart-8/20 rounded-lg px-4 py-3">
          <p className="text-sm font-medium text-chart-8">Create Variants</p>
          <p className="text-xs text-chart-8 mt-0.5">
            Each variant follows the attribute framework you defined in Step 2.
            Upload images, set stock, and fill in the attribute values.
          </p>
        </div>

        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3 text-xs text-muted-foreground">
            <span className="font-medium text-foreground">
              Variants ({variants.length})
            </span>
            <span>{attributes.length} attributes</span>
            <span>{totalStock} total stock</span>
          </div>
          <Button
            type="button"
            size="sm"
            onClick={addVariant}
            className="gap-1"
          >
            <Plus size={14} /> Add Variant
          </Button>
        </div>

        {/* Variant Cards */}
        {variants.length === 0 && (
          <div className="border-2 border-dashed rounded-lg py-10 text-center text-muted-foreground text-sm">
            No variants yet. Click Add Variant to get started.
          </div>
        )}

        {variants.map((variant, vIndex) => {
          const isOpen = expanded.includes(vIndex);
          const filledAttrs =
            variant.options?.filter((o) => o.value).length ?? 0;
          const totalAttrs = attributes.length;

          return (
            <div key={vIndex} className="border rounded-lg overflow-hidden">
              {/* Variant Header */}
              <div
                className="flex items-center gap-3 px-4 py-3 bg-muted/20 cursor-pointer"
                onClick={() => toggleExpand(vIndex)}
              >
                <span className="flex items-center justify-center h-6 w-6 rounded-full bg-primary text-card text-xs font-bold shrink-0">
                  {vIndex + 1}
                </span>
                <div className="h-8 w-8 rounded border overflow-hidden bg-muted shrink-0 flex items-center justify-center relative">
                  {variant.mediaUrl ? (
                    <Image
                      src={getImageUrl(variant.mediaUrl)} // <--- Ekhane add korun
                      alt=""
                      fill
                      unoptimized
                      crossOrigin="anonymous"
                      className="object-cover"
                    />
                  ) : (
                    <Upload size={12} className="text-muted-foreground" />
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate">
                    {variant.name || (
                      <span className="text-muted-foreground italic">
                        Unnamed variant
                      </span>
                    )}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {variant.quantity} stock · {filledAttrs}/{totalAttrs}{" "}
                    attributes
                  </p>
                </div>
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="h-7 w-7 text-destructive hover:bg-destructive/10"
                  onClick={(e) => {
                    e.stopPropagation();
                    removeVariant(vIndex);
                  }}
                >
                  <X size={14} />
                </Button>
                {isOpen ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
              </div>

              {/* Variant Body */}
              {isOpen && (
                <div className="space-y-5">
                  {/* Image Upload */}
                  <div className="px-4">
                    <Label className="text-sm font-medium">
                      Variant Image *
                    </Label>
                    <p className="text-xs text-muted-foreground mb-2">
                      Upload a photo of this specific variant.
                    </p>
                    <div className="flex gap-3 flex-wrap">
                      {variant.mediaUrl ? (
                        <div className="relative h-20 w-20 rounded-lg border overflow-hidden group">
                          <Image
                            src={getImageUrl(variant.mediaUrl)}
                            alt="variant"
                            fill
                            unoptimized
                            crossOrigin="anonymous"
                            className="object-cover"
                          />
                          <button
                            type="button"
                            onClick={() => handleImageRemove(vIndex)}
                            className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition"
                          >
                            <X size={16} className="text-card" />
                          </button>
                        </div>
                      ) : (
                        <label className="h-20 w-20 rounded-lg border-2 border-dashed flex flex-col items-center justify-center cursor-pointer hover:bg-muted/30 transition">
                          <Upload size={18} className="text-muted-foreground" />
                          <span className="text-xs text-muted-foreground mt-1">
                            Upload
                          </span>
                          <input
                            type="file"
                            accept="image/png,image/jpeg"
                            className="hidden"
                            onChange={(e) => handleImageUpload(e, vIndex)}
                          />
                        </label>
                      )}
                    </div>
                  </div>

                  {/* Name + Stock */}
                  <div className="grid md:grid-cols-2 grid-cols-1 gap-3 px-4">
                    <div>
                      <Label className="text-sm">Variant Name</Label>
                      <Input
                        className="mt-1 h-9"
                        placeholder="e.g. Navy Classic"
                        value={variant.name ?? ""}
                        onChange={(e) =>
                          updateVariant(vIndex, "name", e.target.value)
                        }
                      />
                    </div>
                    <div>
                      <Label className="text-sm">Stock *</Label>
                      <Input
                        type="number"
                        className="mt-1 h-9"
                        placeholder="0"
                        value={variant.quantity}
                        onChange={(e) =>
                          updateVariant(
                            vIndex,
                            "quantity",
                            Number(e.target.value),
                          )
                        }
                      />
                    </div>
                  </div>

                  {/* Attributes */}
                  {attributes.length > 0 && (
                    <div className="space-y-3">
                      <div className="flex items-center gap-2 px-4">
                        <Lock size={13} className="text-muted-foreground" />
                        <Label className="text-sm">
                          Attributes{" "}
                          <span className="text-muted-foreground font-normal">
                            (shared structure)
                          </span>
                        </Label>
                      </div>

                      <div className="flex flex-col">
                        {attributes.map((attr) => {
                          const optVal =
                            variant.options?.find((o) => o.name === attr.title)
                              ?.value ?? "";

                          if (attr.type === "Color Picker") {
                            const selectedColors = optVal
                              ? optVal.split(",").filter(Boolean)
                              : [];
                            return (
                              <div
                                key={attr.title}
                                className="space-y-2 border-t px-4 py-3"
                              >
                                <div className="flex items-center gap-2">
                                  <Label className="text-sm">
                                    {attr.title}
                                  </Label>
                                  <span className="text-xs bg-chart-5/20 text-chart-5 px-1.5 py-0.5 rounded">
                                    color
                                  </span>
                                </div>
                                {/* Preset swatches — single select */}

                                <div className="flex flex-wrap gap-2">
                                  {PRESET_COLORS.map((color) => {
                                    const isSelected = selectedColors.includes(
                                      color.code,
                                    );

                                    return (
                                      <button
                                        key={color.code}
                                        type="button"
                                        onClick={() => {
                                          const updated = isSelected
                                            ? ""
                                            : color.code;
                                          updateOption(
                                            vIndex,
                                            attr.title,
                                            updated,
                                          );
                                        }}
                                        className={`relative h-6 w-6 rounded-md border-2 transition group ${
                                          isSelected
                                            ? "ring-2 ring-primary ring-offset-1"
                                            : "border-amber-800/20 hover:border-amber-800"
                                        }`}
                                        style={{ backgroundColor: color.code }}
                                        title={color.label}
                                      >
                                        {/* Label tooltip */}
                                        <span className="absolute -top-7 left-1/2 -translate-x-1/2 bg-foreground text-background text-[10px] px-1.5 py-0.5 rounded whitespace-nowrap opacity-0 group-hover:opacity-100 transition pointer-events-none z-10">
                                          {color.label}
                                        </span>
                                      </button>
                                    );
                                  })}
                                </div>

                                {selectedColors.length > 0 && (
                                  <p className="text-xs text-muted-foreground mt-1">
                                    Selected:{" "}
                                    <span className="font-medium text-foreground">
                                      {PRESET_COLORS.find(
                                        (c) => c.code === selectedColors[0],
                                      )?.label ?? selectedColors[0]}
                                    </span>
                                  </p>
                                )}
                                {/* Custom hex input */}
                                {/* <div className="flex items-center gap-3 border rounded-lg px-3 py-2 bg-muted/20">
                              <Input
                                className="h-8 flex-1 text-sm"
                                placeholder="Custom hex e.g. #FF5733"
                                onChange={(e) => {
                                  const val = e.target.value.trim();
                                  if (val.startsWith("#") && val.length === 7) {
                                    updateOption(vIndex, attr.title, val);
                                  }
                                }}
                              />
                              {selectedColors.length > 0 && (
                                <p className="text-xs text-muted-foreground mt-1">
                                  Selected:{" "}
                                  <span className="font-medium text-foreground">
                                    {PRESET_COLORS.find(
                                      (c) => c.code === selectedColors[0],
                                    )?.label ?? selectedColors[0]}
                                  </span>
                                </p>
                              )}
                              <span className="text-xs text-muted-foreground">
                                {selectedColors[selectedColors.length - 1] ??
                                  ""}
                              </span>
                            </div> */}
                              </div>
                            );
                          }

                          if (attr.type === "Dropdown") {
                            const attrOptions = (attr.value ?? "")
                              .split(",")
                              .map((o) => o.trim())
                              .filter(Boolean);
                            const selectedTags = optVal
                              ? optVal.split(",").filter(Boolean)
                              : [];
                            return (
                              <div
                                key={attr.title}
                                className="space-y-2 border-t px-4 py-3"
                              >
                                <div className="flex items-center gap-2">
                                  <Label className="text-sm">
                                    {attr.title}
                                  </Label>
                                  <span className="text-xs bg-chart-8/10 text-chart-8 px-1.5 py-0.5 rounded">
                                    dropdown
                                  </span>
                                </div>
                                {attrOptions.length > 0 && (
                                  <div className="flex flex-wrap gap-2">
                                    {attrOptions.map((opt) => (
                                      <button
                                        key={opt}
                                        type="button"
                                        onClick={() => {
                                          const updated = selectedTags.includes(
                                            opt,
                                          )
                                            ? ""
                                            : opt;
                                          updateOption(
                                            vIndex,
                                            attr.title,
                                            updated,
                                          );
                                        }}
                                        className={`text-xs px-3 py-1 rounded-full border transition ${
                                          selectedTags.includes(opt)
                                            ? "bg-primary text-card border-primary"
                                            : "bg-card border-muted-foreground/10"
                                        }`}
                                      >
                                        {opt}
                                      </button>
                                    ))}
                                    {selectedTags.length === 0 && (
                                      <p className="text-sm text-destructive">
                                        Please select one option
                                      </p>
                                    )}
                                  </div>
                                )}
                                {/* <Input
                              className="h-9 text-sm"
                              placeholder={`Or type custom ${attr.title}`}
                              onKeyDown={(e) => {
                                if (e.key === "Enter") {
                                  e.preventDefault();
                                  const val = (
                                    e.target as HTMLInputElement
                                  ).value.trim();
                                  if (val && !selectedTags.includes(val)) {
                                    updateOption(
                                      vIndex,
                                      attr.title,
                                      [...selectedTags, val].join(","),
                                    );
                                    (e.target as HTMLInputElement).value = "";
                                  }
                                }
                              }}
                            /> */}
                              </div>
                            );
                          }

                          return null;
                        })}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          );
        })}

        {/* Add Another */}
        {variants.length > 0 && (
          <button
            type="button"
            onClick={addVariant}
            className="w-full border-2 border-dashed rounded-lg py-3 text-sm text-muted-foreground hover:bg-muted/20 transition flex items-center justify-center gap-2"
          >
            <Plus size={14} /> Add Another Variant
          </button>
        )}
      </div>
    </ScrollArea>
  );
};;;;;;;;;;;;;;;;;;;;;;

export default AddProductStep3;
