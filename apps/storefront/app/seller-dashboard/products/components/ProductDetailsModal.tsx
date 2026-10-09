"use client"

import { Badge } from "@/components/ui/badge";
import { getProductById } from "./Action";
import Image from "next/image";
import { useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { getImageUrl } from "./getImageUrl";


// ─── Type (matched to your API response) ─────────────────────────────────────

interface VariantOption {
  name: string;
  value: string;
  type: string;
  quantity: number;
}

interface Variant {
  id: string;
  mediaUrl: string;
  name: string;
  quantity: number;
  options: VariantOption[];
  isActive: boolean;
}

interface Product {
  id: string;
  title: string;
  subtitle: string;
  description: string;
  price: string;
  currency: string;
  status: "active" | "draft" | "inactive" | "archived";
  subCategoryId: string;
  categoryType: string;
  salesCount: number;
  lowStockThreshold: number;
  favoriteCount: number;
  averageRating: string;
  variants: Variant[];
}

// ─── Helpers ──────────────────────────────────────────────────────────────────



const getTotalStock = (variants: Variant[]) =>
  variants.reduce((acc, v) => acc + v.quantity, 0);

const statusStyle: Record<string, string> = {
  active: "bg-green-100 text-green-700",
  draft: "bg-yellow-100 text-yellow-700",
  inactive: "bg-muted text-muted-foreground",
  archived: "bg-destructive/10 text-destructive",
};

// ─── Component ────────────────────────────────────────────────────────────────

const ProductDetailsModal = () => {
  const searchParams = useSearchParams();
  const productId = searchParams.get("id");

  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!productId) return;
    getProductById(productId)
      .then((res) => setProduct(res.data as unknown as Product))
      .catch(() => toast.error("Failed to load product details"))
      .finally(() => setLoading(false));
  }, [productId]);

  if (loading) return (
    <div className="flex flex-col items-center justify-center py-16 space-y-3">
      <div className="h-8 w-8 rounded-full border-4 border-primary border-t-transparent animate-spin" />
      <p className="text-sm text-muted-foreground">Loading product details...</p>
    </div>
  );

  if (!product) return null;

  const displayImage = product.variants[0]?.mediaUrl || "/placeholders/product-placeholder.png";
  const totalStock = getTotalStock(product.variants);
  const isLowStock = totalStock <= product.lowStockThreshold;

  return (
    <div className="w-full p-6 space-y-5">
      {/* Header */}
      <div className="space-y-1">
        <h2 className="text-lg font-semibold">Product Details</h2>
        <p className="text-sm text-muted-foreground">
          View complete product information and pricing
        </p>
      </div>

      {/* Image */}
      <div className="relative w-full h-52 rounded-xl overflow-hidden border">
        <Image
          src={getImageUrl(displayImage)}
          alt={product.title}
          fill
          className="object-cover"
        />
      </div>

      {/* Info */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="font-semibold text-base">{product.title}</h3>
          <Badge className={statusStyle[product.status]}>
  {product.status
    .split("_")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ")}
</Badge>
        </div>

        {product.subtitle && (
          <p className="text-sm text-muted-foreground">{product.subtitle}</p>
        )}

        <p className="text-xs text-muted-foreground capitalize">
          {product.categoryType} · {product.subCategoryId}
        </p>

        <div className="grid grid-cols-3 gap-4 text-sm pt-2">
          <div className="flex flex-col">
            <span className="text-muted-foreground">Price</span>
            <span className="font-medium">${product.price}</span>
          </div>
          <div className="flex flex-col">
            <span className="text-muted-foreground">Stock</span>
            <span className={`font-medium ${isLowStock ? "text-destructive" : ""}`}>
              {totalStock}
              {isLowStock && <span className="ml-1 text-xs text-chart-7">low</span>}
            </span>
          </div>
          <div className="flex flex-col">
            <span className="text-muted-foreground">Sold</span>
            <span className="font-medium">{product.salesCount}</span>
          </div>
        </div>

        {product.variants.length > 0 && (
          <div className="pt-2 space-y-2">
            <p className="text-sm font-medium">
              Variants ({product.variants.length})
            </p>
            <div className="space-y-2">
              {product.variants.map((variant) => (
                <div
                  key={variant.id}
                  className="flex items-center justify-between rounded-lg border px-3 py-2 text-sm"
                >
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded overflow-hidden border border-border shrink-0">
                      <Image
                        src={getImageUrl(variant.mediaUrl)}
                        alt={variant.name}
                        width={32}
                        height={32}
                        className="object-cover w-full h-full"
                      />
                    </div>
                    <span className="font-medium">{variant.name}</span>
                  </div>
                  <div className="flex items-center gap-3 text-muted-foreground text-xs">
                    <span>Qty: <strong className="text-foreground">{variant.quantity}</strong></span>
                    <span className={`font-medium ${variant.isActive ? "text-primary" : "text-muted-foreground"}`}>
                      {variant.isActive ? "Active" : "Inactive"}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ProductDetailsModal;