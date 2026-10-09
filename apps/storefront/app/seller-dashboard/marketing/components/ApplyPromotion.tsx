import { Label } from "@/components/ui/label";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";

type ApplyTo = "ALL_PRODUCTS" | "BY_CATEGORY" | "SPECIFIC_PRODUCTS";

type Category = { id: string; name: string };
type Product  = { id: string; name: string; category: string; price: number };

type ApplyPromotionProps = {
  applyTo: ApplyTo;
  onApplyToChange: (val: ApplyTo) => void;
  selectedCategoryIds: string[];
  onCategoryChange: (ids: string[]) => void;
  selectedProductIds: string[];
  onProductChange: (ids: string[]) => void;
  categories: Category[];
  products: Product[];
};

export const ApplyPromotion = ({
  applyTo,
  onApplyToChange,
  selectedCategoryIds,
  onCategoryChange,
  selectedProductIds,
  onProductChange,
  categories,
  products,
}: ApplyPromotionProps) => {

  const options: { value: ApplyTo; label: string; desc: string }[] = [
    { value: "ALL_PRODUCTS",       label: "All Products",       desc: "Apply to entire catalog" },
    { value: "BY_CATEGORY",        label: "By Category",        desc: "Select categories" },
    { value: "SPECIFIC_PRODUCTS",  label: "Specific Products",  desc: "Choose individual items" },
  ];

  const toggleCategory = (id: string) => {
    onCategoryChange(
      selectedCategoryIds.includes(id)
        ? selectedCategoryIds.filter((c) => c !== id)
        : [...selectedCategoryIds, id]
    );
  };

  const toggleProduct = (id: string) => {
    onProductChange(
      selectedProductIds.includes(id)
        ? selectedProductIds.filter((p) => p !== id)
        : [...selectedProductIds, id]
    );
  };

  return (
    <div>
      <Label>Apply Promotion To*</Label>

      <div className="grid grid-cols-1 sm:grid-cols-3 mt-2 gap-3">
        {options.map((opt) => (
          <div
            key={opt.value}
            onClick={() => onApplyToChange(opt.value)}
            className={cn(
              "cursor-pointer rounded-lg border p-4 flex items-start flex-col justify-center gap-2",
              applyTo === opt.value ? "border-primary bg-muted" : "border-muted"
            )}
          >
            <div className={cn("rounded-full border-2 p-1", applyTo === opt.value && "border-primary")}>
              <div className={cn("h-4 w-4 rounded-full border", applyTo === opt.value && "border-primary bg-primary")} />
            </div>
            <span className="text-sm font-medium">{opt.label}</span>
            <p className="text-muted-foreground text-xs">{opt.desc}</p>
          </div>
        ))}
      </div>

      {/* Category Selection */}
      {applyTo === "BY_CATEGORY" && (
        <div className="mt-4 rounded-lg border p-4 space-y-2">
          <p className="text-sm font-medium">Select Categories</p>
          <ScrollArea className="h-40">
            <div className="grid grid-cols-1 gap-2">
              {categories.map((cat) => (
                <label key={cat.id} className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    className="accent-primary"
                    checked={selectedCategoryIds.includes(cat.id)}
                    onChange={() => toggleCategory(cat.id)}
                  />
                  <span className="text-sm">{cat.name}</span>
                </label>
              ))}
            </div>
          </ScrollArea>
        </div>
      )}

      {/* Product Selection */}
      {applyTo === "SPECIFIC_PRODUCTS" && (
        <div className="mt-4 rounded-lg border p-4 space-y-2">
          <p className="text-sm font-medium">Select Products</p>
          <ScrollArea className="h-60">
            <div className="space-y-3 pr-3">
              {products.map((product) => (
                <label key={product.id} className="flex items-start gap-3 cursor-pointer rounded-md p-2 hover:bg-muted">
                  <input
                    type="checkbox"
                    className="accent-primary w-5 h-5 mt-1"
                    checked={selectedProductIds.includes(product.id)}
                    onChange={() => toggleProduct(product.id)}
                  />
                  <div className="flex flex-col">
                    <p className="text-sm font-medium">{product.name}</p>
                    <div className="text-xs text-muted-foreground flex gap-1">
                      <span>${product.price}</span>
                      <span>-</span>
                      <span>{product.category}</span>
                    </div>
                  </div>
                </label>
              ))}
            </div>
          </ScrollArea>
        </div>
      )}
    </div>
  );
};