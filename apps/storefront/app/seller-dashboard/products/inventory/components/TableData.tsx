"use client";

import { useState } from "react";
import Image from "next/image";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { ChevronDown, ChevronRight, ChevronLeft, Plus, Trash2, Upload, X } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { uploadImage } from "../../components/UploadAction";
import { CommonPagination } from "@/components/commonPagination";
import { addVariant, refillStock, removeVariant } from "../../components/Action";
import { NewVariantForm, Product, TableDataProps, Variant } from "@/types/sellerDashboard/Products";
import { getImageUrl } from "../../components/getImageUrl";




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
const getColorLabel = (hex: string): string => {
  return PRESET_COLORS.find((c) => c.code === hex)?.label ?? hex;
};

const defaultForm = (): NewVariantForm => ({
  name: "",
  quantity: 0,
  imageFile: null,
  imagePreview: null,
  selectedColors: [],
  customColor: "",
});

const getVariantColors = (variant: Variant): string[] => {
  const colors: string[] = [];
  for (const opt of variant.options) {
    if (opt.type === "color_picker") {
      opt.value.split(",").forEach((part) => {
        const t = part.trim();
        if (t.startsWith("#") && !colors.includes(t)) colors.push(t);
      });
    }
  }
  return colors;
};

// ── Pagination UI Component ──
function Pagination({
  currentPage,
  totalPages,
  onPageChange,
}: {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
}) {
  if (totalPages <= 1) return null;

  const getPages = () => {
    const pages: (number | "...")[] = [];
    if (totalPages <= 7) {
      return Array.from({ length: totalPages }, (_, i) => i + 1);
    }
    pages.push(1);
    if (currentPage > 3) pages.push("...");
    for (let i = Math.max(2, currentPage - 1); i <= Math.min(totalPages - 1, currentPage + 1); i++) {
      pages.push(i);
    }
    if (currentPage < totalPages - 2) pages.push("...");
    pages.push(totalPages);
    return pages;
  };

  return (
    <div className="flex items-center justify-between px-4 py-3 border-t">
      <p className="text-xs text-muted-foreground hidden sm:block">
        Page {currentPage} of {totalPages}
      </p>
      <div className="flex items-center gap-1 mx-auto sm:mx-0">
        <button
          onClick={() => onPageChange(currentPage - 1)}
          disabled={currentPage === 1}
          className="h-8 w-8 flex items-center justify-center rounded-lg border text-xs disabled:opacity-40 hover:bg-muted/30 transition"
        >
          <ChevronLeft size={14} />
        </button>

        {getPages().map((page, idx) =>
          page === "..." ? (
            <span key={`dot-${idx}`} className="h-8 w-8 flex items-center justify-center text-xs text-muted-foreground">
              …
            </span>
          ) : (
            <button
              key={page}
              onClick={() => onPageChange(page as number)}
              className={`h-8 w-8 flex items-center justify-center rounded-lg border text-xs font-medium transition ${
                page === currentPage
                  ? "bg-primary text-primary-foreground border-primary"
                  : "hover:bg-muted/30"
              }`}
            >
              {page}
            </button>
          )
        )}

        <button
          onClick={() => onPageChange(currentPage + 1)}
          disabled={currentPage === totalPages}
          className="h-8 w-8 flex items-center justify-center rounded-lg border text-xs disabled:opacity-40 hover:bg-muted/30 transition"
        >
          <ChevronRight size={14} />
        </button>
      </div>
    </div>
  );
}

export default function TableData({
  products: initialProducts,
  currentPage,
  totalPages,
  totalProducts,
}: TableDataProps) {
  const router = useRouter();
  const [products, setProducts] = useState<Product[]>(initialProducts);
  const [expandedIds, setExpandedIds] = useState<Set<string>>(new Set());
  const [stockEdits, setStockEdits] = useState<Record<string, number>>(() => {
    const edits: Record<string, number> = {};
    initialProducts.forEach((p) =>
      p.variants.forEach((v) => {
        edits[v.id] = v.quantity;
      })
    );
    return edits;
  });
  const [updating, setUpdating] = useState<Record<string, boolean>>({});
  const [removing, setRemoving] = useState<Record<string, boolean>>({});
  const [addFormOpen, setAddFormOpen] = useState<Record<string, boolean>>({});
  const [addForms, setAddForms] = useState<Record<string, NewVariantForm>>({});
  const [submitting, setSubmitting] = useState<Record<string, boolean>>({});
const searchParams = useSearchParams();
  const pathname = usePathname();
   const handlePageChange = (page: number) => {
    if (page < 1 || page > totalPages) return;
    const params = new URLSearchParams(searchParams.toString());
    params.set("page", page.toString());
    router.push(`${pathname}?${params.toString()}`);
  };

  const toggleExpand = (id: string) => {
    setExpandedIds((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  };

  // Update stock quantity for a variant and update local state

  const handleUpdate = async (variantId: string, productId: string) => {
  const newQty = stockEdits[variantId];
  if (newQty === undefined) return;
  setUpdating((prev) => ({ ...prev, [variantId]: true }));
  try {
    await refillStock(variantId, newQty);
    setProducts((prev) =>
      prev.map((p) =>
        p.id !== productId
          ? p
          : {
              ...p,
              variants: p.variants.map((v) =>
                v.id === variantId ? { ...v, quantity: newQty } : v
              ),
              totalQuantity: p.variants.reduce(
                (sum, v) => sum + (v.id === variantId ? newQty : v.quantity),
                0
              ),
            }
      )
    );
    toast.success("Stock updated!");
  } catch {
    toast.error("Failed to update stock");
  } finally {
    setUpdating((prev) => ({ ...prev, [variantId]: false }));
  }
};

  const handleAddVariant = async (productId: string) => {
    const form = addForms[productId];
    if (!form || !form.name.trim()) return;

    setSubmitting((prev) => ({ ...prev, [productId]: true }));
    try {
      let mediaUrl = "";
      if (form.imageFile) {
        mediaUrl = await uploadImage(form.imageFile);
      }

      const payload = {
        name: form.name,
        quantity: form.quantity,
        isActive: true,
        mediaUrl,
        options:
          form.selectedColors.length > 0
            ? [{ name: "Color", value: form.selectedColors.join(","), type: "color_picker" }]
            : [],
      };

    // API call to add variant
  const res = await addVariant(productId, payload);
// console.log("[handleAddVariant] res.data:", JSON.stringify(res.data, null, 2)); 

      setProducts((prev) =>
        prev.map((p) =>
          p.id !== productId
            ? p
            : {
                ...p,
                variants: [...p.variants, res.data],
                totalQuantity: p.totalQuantity + form.quantity,
              }
        )
      );

      setStockEdits((prev) => ({ ...prev, [res.data.id]: res.data.quantity }));
      toast.success("Variant added!");
      closeAddForm(productId);
    } catch {
      toast.error("Failed to add variant");
    } finally {
      setSubmitting((prev) => ({ ...prev, [productId]: false }));
    }
  };

  // Remove variant and update local state

  const handleRemoveVariant = async (variantId: string, productId: string) => {
    setRemoving((prev) => ({ ...prev, [variantId]: true }));
    try {
      await removeVariant(variantId);
      setProducts((prev) =>
        prev.map((p) =>
          p.id !== productId
            ? p
            : {
                ...p,
                variants: p.variants.filter((v) => v.id !== variantId),
                totalQuantity: p.variants
                  .filter((v) => v.id !== variantId)
                  .reduce((sum, v) => sum + v.quantity, 0),
              }
        )
      );
      toast.success("Variant removed!");
    } catch {
      toast.error("Failed to remove variant");
    } finally {
      setRemoving((prev) => ({ ...prev, [variantId]: false }));
    }
  };

  const openAddForm = (productId: string) => {
    setAddFormOpen((prev) => ({ ...prev, [productId]: true }));
    setAddForms((prev) => ({ ...prev, [productId]: defaultForm() }));
  };

  const closeAddForm = (productId: string) => {
    setAddFormOpen((prev) => ({ ...prev, [productId]: false }));
  };

  const updateForm = (productId: string, patch: Partial<NewVariantForm>) => {
    setAddForms((prev) => ({ ...prev, [productId]: { ...prev[productId], ...patch } }));
  };

  const handleImageSelect = (productId: string, file: File) => {
    const preview = URL.createObjectURL(file);
    updateForm(productId, { imageFile: file, imagePreview: preview });
  };

  const toggleColor = (productId: string, hex: string) => {
    const form = addForms[productId];
    if (!form) return;
    const already = form.selectedColors.includes(hex);
    updateForm(productId, {
      selectedColors: already
        ? form.selectedColors.filter((c) => c !== hex)
        : [...form.selectedColors, hex],
    });
  };

  const handleAddCustomColor = (productId: string) => {
    const form = addForms[productId];
    if (!form) return;
    const hex = form.customColor.trim();
    if (!hex.startsWith("#") || form.selectedColors.includes(hex)) return;
    updateForm(productId, {
      selectedColors: [...form.selectedColors, hex],
      customColor: "",
    });
  };

  const totalVariants = products.reduce((s, p) => s + p.variants.length, 0);
  const totalOptions = products.reduce(
    (s, p) => s + p.variants.reduce((vs, v) => vs + v.options.length, 0),
    0
  );

  return (
    <div className="bg-card border rounded-2xl md:p-6 p-4">
      <div className="mb-4 flex items-start justify-between">
        <div>
          <h3 className="text-base font-semibold">Stock Management</h3>
          <p className="text-xs text-muted-foreground mt-0.5">
            {totalProducts} products · {totalVariants} color variants · {totalOptions} size entries
          </p>
        </div>
        <p className="text-xs text-muted-foreground hidden sm:block">
          Showing {products.length} of {totalProducts}
        </p>
      </div>

      {products.length === 0 && (
        <p className="text-sm text-muted-foreground text-center py-10">No products found.</p>
      )}

      <div className="space-y-2">
        {products.map((product) => {
          const isExpanded = expandedIds.has(product.id);
          const hasVariants = product.variants.length > 0;
          const isLow =
            product.totalQuantity > 0 && product.totalQuantity <= product.lowStockThreshold;
          const isOut = product.totalQuantity === 0;
          const displayImage = product.variants[0]?.mediaUrl ?? null;
          const allColors = [
            ...new Set(product.variants.flatMap((v) => getVariantColors(v))),
          ].slice(0, 5);
          const isFormOpen = addFormOpen[product.id] ?? false;
          const form = addForms[product.id] ?? defaultForm();
          const isSubmitting = submitting[product.id] ?? false;

          return (
            <div key={product.id} className="border rounded-xl overflow-hidden">
              {/* Product Row - Desktop */}
              <div className="hidden md:block">
                <div
                  className={`flex items-center gap-3 px-4 py-3 cursor-pointer hover:bg-muted/10 transition ${isExpanded ? "bg-muted/10" : ""}`}
                  onClick={() => toggleExpand(product.id)}
                >
                  <div className="w-12 h-12 rounded-lg overflow-hidden border border-border shrink-0 bg-muted flex items-center justify-center">
                    {displayImage ? (
                      <Image
                        src={getImageUrl(displayImage)}
                        alt={product.title}
                        width={48}
                        height={48}
                        unoptimized
                        className="object-cover w-full h-full"
                      />
                    ) : (
                      <span className="text-[10px] text-muted-foreground text-center px-1">
                        No image
                      </span>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-sm truncate">{product.title}</p>
                    <div className="flex items-center gap-3 text-xs text-muted-foreground mt-0.5">
                      {allColors.length > 0 && (
                        <span className="flex items-center gap-1">
                          <svg width="11" height="11" viewBox="0 0 12 12">
                            <circle cx="6" cy="6" r="5" stroke="currentColor" strokeWidth="1" fill="none" />
                            <circle cx="6" cy="6" r="2" fill="currentColor" />
                          </svg>
                          {allColors.length} color{allColors.length > 1 ? "s" : ""}
                        </span>
                      )}
                      {product.variants.length > 0 && (
                        <span>
                          {product.variants.length} variant{product.variants.length > 1 ? "s" : ""}
                        </span>
                      )}
                    </div>
                  </div>
                  <div className="flex items-start gap-3 shrink-0">
                    <div>
                      {allColors.length > 0 && (
                        <div className="hidden sm:flex gap-2 mt-1">
                          {allColors.map((hex) => (
                            <span
                              key={hex}
                              className="w-3.5 h-3.5 rounded-full border border-card shadow-sm"
                              style={{ backgroundColor: hex }}
                            />
                          ))}
                        </div>
                      )}
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-semibold flex items-center justify-center flex-row gap-2">
                        <span className={isOut || isLow ? "text-destructive" : ""}>
                          {product.totalQuantity} stock
                        </span>
                        {(isLow || isOut) && (
                          <span className="text-[10px] font-medium text-chart-7 bg-chart-7/5 border border-chart-7/20 px-1.5 rounded-full">
                            {isOut ? "out" : "low"}
                          </span>
                        )}
                      </p>
                      <p className="text-xs text-muted-foreground">{product.salesCount} sold</p>
                    </div>
                    <span className="text-muted-foreground">
                      {isExpanded ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
                    </span>
                  </div>
                </div>
              </div>

              {/* Product Row - Mobile */}
              <div className="md:hidden block">
                <div
                  className={`flex items-center gap-2 px-3 py-3 cursor-pointer hover:bg-muted/10 transition ${isExpanded ? "bg-muted/10" : ""}`}
                  onClick={() => toggleExpand(product.id)}
                >
                  <div className="w-10 h-10 rounded-lg overflow-hidden border border-border shrink-0 bg-muted flex items-center justify-center">
                    {displayImage ? (
                      <Image
                        src={getImageUrl(displayImage)}
                        alt={product.title}
                        width={40}
                        height={40}
                        unoptimized
                        className="object-cover w-full h-full"
                      />
                    ) : (
                      <span className="text-[10px] text-muted-foreground text-center px-1">
                        No image
                      </span>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-sm truncate">{product.title}</p>
                    <div className="flex items-center gap-2 text-xs text-muted-foreground mt-0.5">
                      {product.variants.length > 0 && (
                        <span>
                          {product.variants.length} variant{product.variants.length > 1 ? "s" : ""}
                        </span>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-1.5 shrink-0">
                    <div className="text-right">
                      <p className="text-xs font-semibold flex items-center justify-end gap-1">
                        <span className={isOut || isLow ? "text-destructive" : ""}>
                          {product.totalQuantity}
                        </span>
                        {(isLow || isOut) && (
                          <span className="text-[10px] font-medium text-chart-7 bg-chart-7/5 border border-chart-7/20 px-1 py-0.5 rounded-full">
                            {isOut ? "out" : "low"}
                          </span>
                        )}
                      </p>
                      <p className="text-[11px] text-muted-foreground">{product.salesCount} sold</p>
                    </div>
                    <span className="text-muted-foreground">
                      {isExpanded ? <ChevronDown size={15} /> : <ChevronRight size={15} />}
                    </span>
                  </div>
                </div>
              </div>

              {/* Expanded Section */}
              {isExpanded && (
                <div className="border-t">
                  {/* Desktop Table */}
                  {hasVariants && (
                    <div className="hidden md:block">
                      <table className="w-full text-sm">
                        <thead>
                          <tr className="bg-muted/30 text-xs text-muted-foreground">
                            <th className="text-left px-5 py-2 font-medium">Variant</th>
                            <th className="text-left px-3 py-2 font-medium">Colors</th>
                            <th className="text-center px-3 py-2 font-medium">Stock</th>
                            <th className="text-center px-3 py-2 font-medium">Status</th>
                            <th className="text-center px-3 py-2 font-medium">Sold</th>
                            <th className="text-right px-5 py-2 font-medium">Actions</th>
                          </tr>
                        </thead>
                        <tbody>
                          {product.variants.map((variant, vIdx) => {
                            const variantColors = getVariantColors(variant);
                            const isVariantLow =
                              variant.quantity > 0 &&
                              variant.quantity <= product.lowStockThreshold;
                            const isVariantOut = variant.quantity === 0;
                            const isUpdating = updating[variant.id];
                            const isRemoving = removing[variant.id];
                            const currentEdit = stockEdits[variant.id] ?? variant.quantity;
                            const hasChanged = currentEdit !== variant.quantity;

                            return (
                              <tr
                                key={variant.id}
                                className={`${vIdx !== 0 ? "border-t" : ""} hover:bg-muted/5`}
                              >
                                <td className="px-5 py-3">
                                  <div className="flex items-center gap-2.5">
                                    <div className="w-9 h-9 rounded-lg overflow-hidden border border-border shrink-0 bg-muted flex items-center justify-center">
                                      {variant.mediaUrl ? (
                                        <Image
                                          src={getImageUrl(variant.mediaUrl)}
                                          alt={variant.name}
                                          width={36}
                                          height={36}
                                          unoptimized
                                          className="object-cover w-full h-full"
                                        />
                                      ) : (
                                        <span className="text-[9px] text-muted-foreground">—</span>
                                      )}
                                    </div>
                                    <span className="font-medium text-xs truncate max-w-[120px]">
                                      {variant.name}
                                    </span>
                                  </div>
                                </td>
                                <td className="px-3 py-3">
                                  <div className="flex items-center gap-1">
                                    {variantColors.length > 0 ? (
                                      variantColors.map((hex) => (
                                        <span
                                          key={hex}
                                          className="w-4 h-4 rounded-full border border-card shadow-sm shrink-0"
                                          style={{ backgroundColor: hex }}
                                          title={getColorLabel(hex)} 
                                        />
                                      ))
                                    ) : (
                                      <span className="text-xs text-muted-foreground">-</span>
                                    )}
                                  </div>
                                </td>
                                <td className="px-3 py-3">
                                  <div className="flex justify-center">
                                    <Input
                                      type="number"
                                      min={0}
                                      className="h-7 w-20 text-xs text-center px-1"
                                      value={currentEdit}
                                      onChange={(e) =>
                                        setStockEdits((prev) => ({
                                          ...prev,
                                          [variant.id]: Number(e.target.value),
                                        }))
                                      }
                                    />
                                  </div>
                                </td>
                                <td className="px-3 py-3 text-center">
                                  <span
                                    className={`text-[11px] font-semibold px-2 py-0.5 rounded-full border ${
                                      isVariantOut
                                        ? "text-destructive bg-destructive/5 border-destructive/20"
                                        : isVariantLow
                                        ? "text-chart-7 bg-chart-7/5 border-chart-7/20"
                                        : "text-primary bg-primary/5 border-primary/20"
                                    }`}
                                  >
                                  
                                    {isVariantOut ? "Out" : isVariantLow ? "Low" : "OK"}
                                  </span>
                                </td>
                                <td className="px-3 py-3 text-center text-xs text-muted-foreground">
                                  {product.salesCount}
                                </td>
                                <td className="px-5 py-3">
                                  <div className="flex items-center justify-end gap-2">
                                    <Button
                                      size="sm"
                                      className="h-7 px-3 text-xs bg-primary hover:bg-primary/90"
                                      disabled={!hasChanged || isUpdating}
                                      onClick={() => handleUpdate(variant.id, product.id)}
                                    >
                                      {isUpdating ? "..." : "Update"}
                                    </Button>
                                    <Button
                                      size="sm"
                                      variant="ghost"
                                      className="h-7 w-7 p-0 hover:bg-destructive/10"
                                      disabled={isRemoving}
                                      onClick={() => handleRemoveVariant(variant.id, product.id)}
                                    >
                                      {isRemoving ? (
                                        <span className="text-[10px]">...</span>
                                      ) : (
                                        <Trash2 size={14} className="text-destructive" />
                                      )}
                                    </Button>
                                  </div>
                                </td>
                              </tr>
                            );
                          })}
                        </tbody>
                      </table>
                    </div>
                  )}

                  {/* Mobile Cards */}
                  {hasVariants && (
                    <div className="md:hidden divide-y">
                      {product.variants.map((variant) => {
                        const variantColors = getVariantColors(variant);
                        const isVariantLow =
                          variant.quantity > 0 && variant.quantity <= product.lowStockThreshold;
                        const isVariantOut = variant.quantity === 0;
                        const isUpdating = updating[variant.id];
                        const isRemoving = removing[variant.id];
                        const currentEdit = stockEdits[variant.id] ?? variant.quantity;
                        const hasChanged = currentEdit !== variant.quantity;

                        return (
                          <div key={variant.id} className="px-2 py-3 space-y-3">
                            <div className="flex items-center gap-2.5">
                              <div className="w-10 h-10 rounded-lg overflow-hidden border border-border shrink-0 bg-muted flex items-center justify-center">
                                {variant.mediaUrl ? (
                                  <Image
                                    src={getImageUrl(variant.mediaUrl)}
                                    alt={variant.name}
                                    width={40}
                                    height={40}
                                    unoptimized
                                    className="object-cover w-full h-full"
                                  />
                                ) : (
                                  <span className="text-[9px] text-muted-foreground">—</span>
                                )}
                              </div>
                              <div className="flex-1 min-w-0">
                                <p className="font-medium text-xs truncate">{variant.name}</p>
                                {variantColors.length > 0 && (
                                  <div className="flex gap-1 mt-1">
                                    {variantColors.map((hex) => (
                                      <span
                                        key={hex}
                                        className="w-3.5 h-3.5 rounded-full border border-card shadow-sm"
                                        style={{ backgroundColor: hex }}
                                      />
                                    ))}
                                  </div>
                                )}
                              </div>
                              <span
                                className={`text-[11px] font-semibold px-2 py-0.5 rounded-full border shrink-0 ${
                                  isVariantOut
                                    ? "text-destructive bg-destructive/5 border-destructive/20"
                                    : isVariantLow
                                    ? "text-chart-7 bg-chart-7/5 border-chart-7/20"
                                    : "text-primary bg-primary/5 border-primary/20"
                                }`}
                              >
                                {isVariantOut ? "Out" : isVariantLow ? "Low" : "OK"}
                              </span>
                              <Button
                                size="sm"
                                variant="ghost"
                                className="h-7 w-7 p-0 hover:bg-destructive/10 shrink-0"
                                disabled={isRemoving}
                                onClick={() => handleRemoveVariant(variant.id, product.id)}
                              >
                                {isRemoving ? (
                                  <span className="text-[10px]">...</span>
                                ) : (
                                  <Trash2 size={13} className="text-destructive" />
                                )}
                              </Button>
                            </div>
                            <div className="flex items-center gap-1.5">
                              <span className="text-[11px] text-muted-foreground shrink-0">Stock:</span>
                              <Input
                                type="number"
                                min={0}
                                className="h-7 w-14 text-xs text-center px-1 shrink-0"
                                value={currentEdit}
                                onChange={(e) =>
                                  setStockEdits((prev) => ({
                                    ...prev,
                                    [variant.id]: Number(e.target.value),
                                  }))
                                }
                              />
                              <span className="text-[11px] text-muted-foreground shrink-0">
                                Sold: {product.salesCount}
                              </span>
                              <div className="flex-1" />
                              <Button
                                size="sm"
                                className="h-7 px-2 text-[11px] bg-primary hover:bg-primary/90 shrink-0"
                                disabled={!hasChanged || isUpdating}
                                onClick={() => handleUpdate(variant.id, product.id)}
                              >
                                {isUpdating ? "..." : "Update"}
                              </Button>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}

                  {/* Add Variant Form */}
                  {isFormOpen ? (
                    <div className="border-t px-5 py-4 space-y-4">
                      <div className="flex items-center justify-between">
                        <p className="text-sm font-semibold">New Variant</p>
                        <button
                          onClick={() => closeAddForm(product.id)}
                          className="text-muted-foreground hover:text-foreground"
                        >
                          <X size={16} />
                        </button>
                      </div>
                      <div>
                        <p className="text-xs font-medium mb-1.5">Variant Image</p>
                        <label className="w-24 h-24 border-2 border-dashed border-border rounded-xl flex flex-col items-center justify-center cursor-pointer hover:bg-muted/20 transition overflow-hidden relative">
                          {form.imagePreview ? (
                            <Image src={form.imagePreview} alt="preview" fill className="object-cover" />
                          ) : (
                            <>
                              <Upload size={18} className="text-muted-foreground mb-1" />
                              <span className="text-[10px] text-muted-foreground">Upload</span>
                            </>
                          )}
                          <input
                            type="file"
                            accept="image/*"
                            className="hidden"
                            onChange={(e) => {
                              const file = e.target.files?.[0];
                              if (file) handleImageSelect(product.id, file);
                            }}
                          />
                        </label>
                      </div>
                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <p className="text-xs font-medium mb-1">Variant Name</p>
                          <Input
                            placeholder="e.g. Navy Classic"
                            className="h-8 text-sm"
                            value={form.name}
                            onChange={(e) => updateForm(product.id, { name: e.target.value })}
                          />
                        </div>
                        <div>
                          <p className="text-xs font-medium mb-1">Stock</p>
                          <Input
                            type="number"
                            min={0}
                            className="h-8 text-sm"
                            value={form.quantity}
                            onChange={(e) =>
                              updateForm(product.id, { quantity: Number(e.target.value) })
                            }
                          />
                        </div>
                      </div>
                      <div>
                        <p className="text-xs font-medium mb-1.5">
                          Color{" "}
                          <span className="text-[10px] text-muted-foreground bg-muted px-1.5 py-0.5 rounded-full ml-1">
                            color
                          </span>
                        </p>
                        <div className="flex flex-wrap gap-2 mb-2">
                          {PRESET_COLORS.map((color) => {
                            const isSelected = form.selectedColors.includes(color.code);

                                return (
                                  <button
                                    key={color.code}
                                    type="button"
                                    onClick={() => {
                                      const updated = isSelected
                                        ? ""
                                        : color.label;
                                      toggleColor(product.id, color.code);
                                    }}
                                    className={`h-6 w-6 rounded-md border-2 transition ${
                                      isSelected
                                        ? "ring-2 ring-primary ring-offset-1"
                                        : "border-amber-800/20 hover:border-amber-800"
                                    }`}
                                    style={{ backgroundColor: color.code }}
                                  />
                                );
                              })}
                        </div>
                        <div className="flex gap-2">
                          <Input
                            placeholder="Or type custom Color e.g. #FF0000"
                            className="h-8 text-xs"
                            value={form.customColor}
                            onChange={(e) => updateForm(product.id, { customColor: e.target.value })}
                            onKeyDown={(e) => e.key === "Enter" && handleAddCustomColor(product.id)}
                          />
                          <Button
                            size="sm"
                            variant="outline"
                            className="h-8 px-3 text-xs shrink-0"
                            onClick={() => handleAddCustomColor(product.id)}
                          >
                            Add
                          </Button>
                        </div>
                        {form.selectedColors.length > 0 && (
                          <div className="flex gap-1.5 mt-2">
                            {form.selectedColors.map((hex) => (
                              <span
                                key={hex}
                                className="w-5 h-5 rounded-full border border-card shadow-sm"
                                style={{ backgroundColor: hex }}
                                title={hex}
                              />
                            ))}
                          </div>
                        )}
                      </div>
                      <div className="flex justify-end gap-2 pt-1">
                        <Button
                          size="sm"
                          variant="outline"
                          className="h-8 px-4 text-xs"
                          onClick={() => closeAddForm(product.id)}
                        >
                          Cancel
                        </Button>
                        <Button
                          size="sm"
                          className="h-8 px-4 text-xs bg-primary hover:bg-primary/90"
                          disabled={isSubmitting || !form.name.trim()}
                          onClick={() => handleAddVariant(product.id)}
                        >
                          {isSubmitting ? "Adding..." : "Add Variant"}
                        </Button>
                      </div>
                    </div>
                  ) : (
                    <div className="px-5 py-3 border-t">
                      <Button
                        className="flex items-center gap-1.5 text-xs text-card hover:text-foreground border border-dashed border-border rounded-lg px-3 py-2 w-full justify-center hover:bg-muted/10 transition"
                        onClick={(e) => {
                          e.stopPropagation();
                          openAddForm(product.id);
                        }}
                      >
                        <Plus size={13} />
                        Add Another Variant
                      </Button>
                    </div>
                  )}
                </div>
              )}
            </div>
          );
        })}

  </div>

      {/* ── Backend Pagination ── */}
      {totalPages > 1 && (
  <div className="mt-4 pt-4 border-t">
    <CommonPagination
      currentPage={currentPage}
      totalPages={totalPages}
      onPageChange={handlePageChange}
    />
  </div>
)}
      
    </div>
  );
}