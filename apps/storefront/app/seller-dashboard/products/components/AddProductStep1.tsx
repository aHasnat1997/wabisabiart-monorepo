"use client";

import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Controller, useFormContext } from "react-hook-form";
import { ProductFormValues } from "./ProductSchema";
import { CircleAlert } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useEffect, useState } from "react";
import RichTextEditor from "./RichTextEditor";
import { Category, getAllCategories, getSubCategoriesByCategoryId, SubCategory } from "./Action";
import { Textarea } from "@/components/ui/textarea";
import { ScrollArea } from "@/components/ui/scroll-area";

interface AddProductStep1Props {
  step: number;
}

const AddProductStep1 = ({ step }: AddProductStep1Props) => {
  const {
    register, control, watch, setValue,
    formState: { errors },
  } = useFormContext<ProductFormValues>();

  const descriptionValue = watch("description") ?? "";
  const selectedType = watch("categoryType");
  const selectedCategory = watch("category");

  const [allCategories, setAllCategories] = useState<Category[]>([]);
  const [subCategories, setSubCategories] = useState<SubCategory[]>([]);
  const [loadingCategories, setLoadingCategories] = useState(false);
  const [loadingSubCategories, setLoadingSubCategories] = useState(false);

  useEffect(() => {
    const fetchCategories = async () => {
      setLoadingCategories(true);
      setValue("category", "");
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
  }, [setValue]);

  useEffect(() => {
    setValue("category", "");
    setValue("subCategory", "");
    setSubCategories([]);
  }, [selectedType, setValue]);

  useEffect(() => {
    if (!selectedCategory || allCategories.length === 0) {
      setSubCategories([]);
      return;
    }

    const found = allCategories.find((c) => c.id === selectedCategory);
    if (!found) return;

    const fetchSubCategories = async () => {
      setLoadingSubCategories(true);
      setValue("subCategory", "");
      try {
        const subCategories = await getSubCategoriesByCategoryId(found.id);
        setSubCategories(subCategories);
      } catch (err) {
        console.error("Failed to fetch subcategories", err);
      } finally {
        setLoadingSubCategories(false);
      }
    };
    fetchSubCategories();
  }, [selectedCategory, allCategories, setValue]);

  const filteredCategories = allCategories.filter((c) => c.type === selectedType);

  if (step !== 0) return null;

  return (
   <ScrollArea >
     <div className="space-y-5">
      {/* Info Alert */}
      <div className="bg-chart-8/20 flex items-start gap-2 text-chart-8 text-sm p-3 rounded-md">
        <CircleAlert className="shrink-0 mt-0.5" size={16} />
        <div>
          <p className="font-medium">Product Basics</p>
          <p className="text-xs mt-0.5">
            Enter the core information about your product. You&apos;ll be able to add variants with
            different images and options in the next step.
          </p>
        </div>
      </div>

      {/* Title */}
      <div>
        <Label>Product Title *</Label>
        <Input
          className="mt-2 h-10 focus-visible:ring-0 focus-visible:ring-offset-0 focus-visible:border-primary"
          placeholder="e.g. Handwoven Ceramic Mug"
          {...register("title")}
        />
        {errors.title && (
          <p className="text-xs text-destructive mt-1">{errors.title.message}</p>
        )}
      </div>

      {/* Subtitle */}
      <div>
        <Label>Subtitle *</Label>
        <Textarea
          className="mt-2 h-16 resize-none"
          placeholder="Brief one-line description shown in listings"
          {...register("subtitle")}
        />
        {errors.subtitle && (
          <p className="text-xs text-destructive mt-1">{errors.subtitle.message}</p>
        )}
      </div>

      {/* Description */}
      <div>
        <Label>Description *</Label>
        <div className="mt-2">
          <RichTextEditor
            value={descriptionValue}
            onChange={(html) => setValue("description", html, { shouldValidate: true })}
            error={errors.description?.message}
          />
        </div>
        {errors.description && (
          <p className="text-xs text-destructive mt-1">{errors.description.message}</p>
        )}
      </div>

      {/* Category Type + Category + Subcategory */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {/* Category Type */}
        <div>
          <Label className="mb-2 block">Category Type *</Label>
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
            <p className="text-xs text-destructive mt-1">{errors.categoryType.message}</p>
          )}
        </div>

        {/* Category */}
        <div>
          <Label className="mb-2 block">Category *</Label>
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
                    placeholder={loadingCategories ? "Loading..." : "Select category"}
                  />
                </SelectTrigger>
                <SelectContent>
                  {filteredCategories.length === 0 ? (
                    <SelectItem value="_empty" disabled>
                      No categories found
                    </SelectItem>
                  ) : (
                    filteredCategories.map((cat) => (
                      <SelectItem key={cat.id} value={cat.id}>
                        {cat.name}
                      </SelectItem>
                    ))
                  )}
                </SelectContent>
              </Select>
            )}
          />
          {errors.category && (
            <p className="text-xs text-destructive mt-1">{errors.category.message}</p>
          )}
        </div>

        {/* Subcategory */}
        <div>
          <Label className="mb-2 block">Subcategory *</Label>
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
                    placeholder={loadingSubCategories ? "Loading..." : "Select subcategory"}
                  />
                </SelectTrigger>
                <SelectContent>
                  {subCategories.length === 0 ? (
                    <SelectItem value="_empty" disabled>
                      {selectedCategory ? "No subcategories found" : "Select a category first"}
                    </SelectItem>
                  ) : (
                    subCategories.map((sub) => (
                      <SelectItem key={sub.id} value={sub.id}>
                        {sub.name}
                      </SelectItem>
                    ))
                  )}
                </SelectContent>
              </Select>
            )}
          />
          {errors.subCategory && (
            <p className="text-xs text-destructive mt-1">{errors.subCategory.message}</p>
          )}
        </div>
      </div>

      {/* Base Price + Processing Time */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <Label>Base Price *</Label>
          <Input
            type="number"
            placeholder="$ 0.00"
            className="mt-2 h-10"
            {...register("price", { valueAsNumber: true })}
          />
          <p className="text-xs text-muted-foreground mt-1">
            This is the base price. Variants can have different prices if needed.
          </p>
          {errors.price && (
            <p className="text-xs text-destructive mt-1">{errors.price.message}</p>
          )}
        </div>
        <div>
          <Label>Processing Time (days)</Label>
          <Input
            type="number"
            placeholder="e.g. 7"
            className="mt-2 h-10"
            {...register("processingTime", { valueAsNumber: true })}
          />
          <p className="text-xs text-muted-foreground mt-1">
            How many days to prepare the order before shipping.
          </p>
          {errors.processingTime && (
            <p className="text-xs text-destructive mt-1">{errors.processingTime.message}</p>
          )}
        </div>
      </div>
    </div>
   </ScrollArea>
  );
};

export default AddProductStep1;