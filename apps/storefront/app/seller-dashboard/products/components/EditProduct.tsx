"use client";

import {useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ProductFormValues, productSchema } from "./ProductSchema";
import {
  updateProduct,
  getProductById,
  getAllCategories,
  getSubCategoriesByCategoryId,
  Category,
  SubCategory,
} from "./Action";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useModal } from "@/components/modal/Modal";
import RichTextEditor from "./RichTextEditor";
import { Textarea } from "@/components/ui/textarea";
import { ProductDetail } from "@/types/productDetails";
import { toast } from "sonner";



const EditProduct = () => {
  const searchParams = useSearchParams();
  const productId = searchParams.get("id");
  const { close } = useModal();

  const [product, setProduct] = useState<ProductDetail | null>(null);
  const [loading, setLoading] = useState(false);
  const [submitLoading, setSubmitLoading] = useState(false);
  const [statusLoading, setStatusLoading] = useState(false);

  const [allCategories, setAllCategories] = useState<Category[]>([]);
  const [subCategories, setSubCategories] = useState<SubCategory[]>([]);
  const [loadingCategories, setLoadingCategories] = useState(false);
  const [loadingSubCategories, setLoadingSubCategories] = useState(false);
  

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    watch,
    control,
    formState: { errors },
  } = useForm<ProductFormValues>({
    resolver: zodResolver(productSchema),
  });

  const descriptionValue = watch("description") ?? "";
  const selectedType = watch("categoryType");
  const selectedCategory = watch("category");

  // Product fetch
  useEffect(() => {
    if (!productId) return;
    const fetchProduct = async () => {
      try {
        setLoading(true);
        const res = await getProductById(productId);
        setProduct(res.data);
        // setCurrentStatus(res.data.status);
      } catch (err) {
        console.error("Failed to fetch product", err);
      } finally {
        setLoading(false);
      }
    };
    fetchProduct();
  }, [productId]);

  // All categories fetch
  useEffect(() => {
    const fetchCategories = async () => {
      setLoadingCategories(true);
      try {
        const categories = await getAllCategories();
        setAllCategories(categories);
      } catch (err) {
        console.error("Failed to fetch categories", err);
      } finally {
        setLoadingCategories(false);
      }
    };
    fetchCategories();
  }, []);

  // SubCategories fetch
  useEffect(() => {
    if (!selectedCategory || allCategories.length === 0) {
      setSubCategories([]);
      return;
    }
    const found = allCategories.find((c) => c.name === selectedCategory);
    if (!found) return;

    const fetchSubCategories = async () => {
      setLoadingSubCategories(true);
      try {
        const subCats = await getSubCategoriesByCategoryId(found.id);
        setSubCategories(subCats);
      } catch (err) {
        console.error("Failed to fetch subcategories", err);
      } finally {
        setLoadingSubCategories(false);
      }
    };
    fetchSubCategories();
  }, [selectedCategory, allCategories]);

  // Form populate
  useEffect(() => {
    if (!product) return;
    reset({
      title: product.title,
      subtitle: product.subtitle,
      badge: product.badge ?? undefined,
      description: product.description,
      price: parseFloat(product.price),
      lowStockThreshold: product.lowStockThreshold,
      categoryType: product.categoryType as
        | "crafts"
        | "customization"
        | "commissions",
      category: product.category,
      subCategory: product.subCategory,
      discountType: product.discountType as
        | "none"
        | "percentage"
        | "fixed_amount",
      discountValue: parseFloat(product.discountValue) || 0,
      processingTime: product.processingTime,
      trackInventory: product.trackInventory,
    });
  }, [product, reset]);

  const filteredCategories = allCategories.filter(
    (c) => c.type === selectedType,
  );

  const isOut = (product?.totalQuantity ?? 0) === 0;
  const isLow =
    (product?.totalQuantity ?? 0) > 0 &&
    (product?.totalQuantity ?? 0) <= (product?.lowStockThreshold ?? 0);
  const stockLabel = isOut ? "Out of Stock" : isLow ? "Low Stock" : "In Stock";
  const stockColor = isOut
    ? "text-red-500"
    : isLow
      ? "text-yellow-500"
      : "text-green-600";

 const submitHandler = async (data: ProductFormValues) => {
  if (!product) return;
  try {
    setSubmitLoading(true);
    await updateProduct(product.id, data);
    toast.success("Sucessfuly Updated Product");
    close("product-edit-modal", ["id"]); 
  } catch (err) {
    toast.error("Invalid Updated Product");
    console.error(err);
  } finally {
    setSubmitLoading(false);
  }
};

  if (loading)
    return (
      <div className="p-6 flex items-center justify-center min-h-50">
        <p className="text-sm text-muted-foreground">Loading product...</p>
      </div>
    );

  if (!product)
    return (
      <div className="p-6 flex items-center justify-center min-h-50">
        <p className="text-sm text-muted-foreground">
          Open this modal from a product edit button.
        </p>
      </div>
    );

  return (
    <ScrollArea>
      <form
        onSubmit={handleSubmit(submitHandler)}
        className="w-full p-4 space-y-4"
      >
        <div>
          <h2 className="text-lg font-semibold">Edit Product</h2>
          <p className="text-sm text-muted-foreground">
            Update product information and pricing
          </p>
        </div>

        <div className="space-y-1">
          <label className="text-sm font-medium">Product Name</label>
          <Input className="h-12" {...register("title")} />
          {errors.title && (
            <p className="text-destructive text-sm">{errors.title.message}</p>
          )}
        </div>

        <div className="space-y-1">
          <label className="text-sm font-medium">Subtitle</label>
          <Textarea {...register("subtitle")} />
          {errors.subtitle && (
            <p className="text-destructive text-sm">
              {errors.subtitle.message}
            </p>
          )}
        </div>

        <div className="space-y-1">
          <label className="text-sm font-medium">Badge</label>
          <Input className="h-12" {...register("badge")} />
        </div>

        <div className="space-y-1">
          <label className="text-sm font-medium">Description</label>
          <RichTextEditor
            value={descriptionValue}
            onChange={(html) =>
              setValue("description", html, { shouldValidate: true })
            }
            error={errors.description?.message}
          />
          {errors.description && (
            <p className="text-destructive text-sm">
              {errors.description.message}
            </p>
          )}
        </div>

        <div className="flex items-start gap-4">
          <div className="space-y-1 flex-1">
            <label className="text-sm font-medium">Price ($)</label>
            <Input
              type="number"
              {...register("price", { valueAsNumber: true })}
            />
            {errors.price && (
              <p className="text-destructive text-sm">{errors.price.message}</p>
            )}
          </div>
          <div className="space-y-1 flex-1">
            <label className="text-sm font-medium">Discount Type</label>
            <Controller
              name="discountType"
              control={control}
              render={({ field }) => (
                <Select value={field.value} onValueChange={field.onChange}>
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Select discount type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">None</SelectItem>
                    <SelectItem value="percentage">Percentage</SelectItem>
                    <SelectItem value="fixed_amount">Fixed Amount</SelectItem>
                  </SelectContent>
                </Select>
              )}
            />
          </div>
        </div>

        <div className="space-y-1">
          <label className="text-sm font-medium">Discount Value</label>
          <Input
            type="number"
            {...register("discountValue", { valueAsNumber: true })}
          />
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          <div className="space-y-1">
            <label className="text-sm font-medium">Category Type</label>
            <Controller
              name="categoryType"
              control={control}
              render={({ field }) => (
                <Select value={field.value} onValueChange={field.onChange}>
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Select type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="crafts">Crafts</SelectItem>
                    <SelectItem value="customization">Customization</SelectItem>
                    <SelectItem value="commissions">Commissions</SelectItem>
                  </SelectContent>
                </Select>
              )}
            />
            {errors.categoryType && (
              <p className="text-destructive text-sm">
                {errors.categoryType.message}
              </p>
            )}
          </div>

          <div className="space-y-1">
            <label className="text-sm font-medium">Category</label>
            <Controller
              name="category"
              control={control}
              render={({ field }) => (
                <Select
                  value={field.value}
                  onValueChange={field.onChange}
                  disabled={!selectedType || loadingCategories}
                >
                  <SelectTrigger className="w-full">
                    <SelectValue
                      placeholder={
                        loadingCategories ? "Loading..." : "Select category"
                      }
                    />
                  </SelectTrigger>
                  <SelectContent>
                    {filteredCategories.length === 0 ? (
                      <SelectItem value="_empty" disabled>
                        No categories found
                      </SelectItem>
                    ) : (
                      filteredCategories.map((cat) => (
                        <SelectItem key={cat.id} value={cat.name}>
                          {cat.name}
                        </SelectItem>
                      ))
                    )}
                  </SelectContent>
                </Select>
              )}
            />
            {errors.category && (
              <p className="text-destructive text-sm">
                {errors.category.message}
              </p>
            )}
          </div>

          <div className="space-y-1">
            <label className="text-sm font-medium">Sub Category</label>
            <Controller
              name="subCategory"
              control={control}
              render={({ field }) => (
                <Select
                  value={field.value}
                  onValueChange={field.onChange}
                  disabled={!selectedCategory || loadingSubCategories}
                >
                  <SelectTrigger className="w-full">
                    <SelectValue
                      placeholder={
                        loadingSubCategories
                          ? "Loading..."
                          : "Select subcategory"
                      }
                    />
                  </SelectTrigger>
                  <SelectContent>
                    {subCategories.length === 0 ? (
                      <SelectItem value="_empty" disabled>
                        {selectedCategory
                          ? "No subcategories found"
                          : "Select a category first"}
                      </SelectItem>
                    ) : (
                      subCategories.map((sub) => (
                        <SelectItem key={sub.id} value={sub.name}>
                          {sub.name}
                        </SelectItem>
                      ))
                    )}
                  </SelectContent>
                </Select>
              )}
            />
            {errors.subCategory && (
              <p className="text-destructive text-sm">
                {errors.subCategory.message}
              </p>
            )}
          </div>
        </div>

        <div className="space-y-1">
          <label className="text-sm font-medium">Processing Time (days)</label>
          <Input
            type="number"
            {...register("processingTime", { valueAsNumber: true })}
          />
        </div>

        <div className="space-y-1">
          <label className="text-sm font-medium">Low Stock Threshold</label>
          <Input
            type="number"
            {...register("lowStockThreshold", { valueAsNumber: true })}
          />
          {errors.lowStockThreshold && (
            <p className="text-destructive text-sm">
              {errors.lowStockThreshold.message}
            </p>
          )}
        </div>

        <div className="space-y-1">
          <label className="text-sm font-medium">Stock Status</label>
          <p className={`text-sm font-semibold ${stockColor}`}>
            {stockLabel}{" "}
            <span className="text-muted-foreground font-normal">
              ({product.totalQuantity} remaining)
            </span>
          </p>
        </div>

        <div className="space-y-1">
          <label className="text-sm font-medium">Product Status</label>
          <Select value={product.status} disabled={statusLoading}>
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Select status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="active">Active</SelectItem>
              <SelectItem value="draft">Draft</SelectItem>
            </SelectContent>
          </Select>
          {statusLoading && (
            <p className="text-xs text-muted-foreground">Updating status...</p>
          )}
        </div>

        <div className="flex justify-end gap-2 pt-2">
          <Button
            variant="outline"
            type="button"
            onClick={() => {
              close("product-edit-modal", ["id"]);
            }}
          >
            Cancel
          </Button>
          <Button type="submit" disabled={submitLoading}>
            {submitLoading ? "Saving..." : "Save Changes"}
          </Button>
        </div>
      </form>
    </ScrollArea>
  );
};

export default EditProduct;
