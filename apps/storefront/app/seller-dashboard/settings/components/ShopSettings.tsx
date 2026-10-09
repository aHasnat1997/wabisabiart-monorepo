"use client";

import React, { useEffect, useRef, useState } from "react";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import z from "zod";
import { toast } from "sonner";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/animate-ui/components/buttons/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";

import {
  Store,
  MapPin,
  FileText,
  Share2,
  Loader2,
  X,
  CheckCircle2,
  Image as ImageIcon,
} from "lucide-react";
import Image from "next/image";

import { useFileUpload } from "@/components/uploadFile";
import RichTextEditor from "../../products/components/RichTextEditor";
import { Shop } from "@/types/seller-profile";
import { updateStoreSettings } from "./SecurityAction";

// ─── Schema ────────────────────────────────────────────────────────────────────

const ShopSettingsSchema = z.object({
  shopName: z.string().min(2, "Shop name is required"),
  shopDescription: z.string().min(10, "Description is required"),
  shopAnnouncement: z.string().optional(),
  address: z.string().min(2, "Address is required"),
  shopLogo: z.string().optional(),
  shopBannerImage: z.string().optional(),
  shopPolicies: z.string().optional(),
  returnPolicy: z.string().optional(),
  privacyPolicy: z.string().optional(),
  shippingPolicy: z.string().optional(),
  facebookUrl: z.string().url("Invalid URL").optional().or(z.literal("")),
  instagramUrl: z.string().url("Invalid URL").optional().or(z.literal("")),
  twitterUrl: z.string().url("Invalid URL").optional().or(z.literal("")),
  websiteUrl: z.string().url("Invalid URL").optional().or(z.literal("")),
});

type ShopSettingsForm = z.infer<typeof ShopSettingsSchema>;

// ─── Section Header ─────────────────────────────────────────────────────────────

const SectionHeader = ({
  icon: Icon,
  title,
}: {
  icon: React.ElementType;
  title: string;
}) => (
  <div className="flex items-center gap-2 mb-4">
    <Icon className="size-4 text-primary" />
    <h3 className="text-sm font-medium text-foreground">{title}</h3>
    <div className="flex-1 h-px bg-border ml-1" />
  </div>
);

// ─── Image Upload Field ─────────────────────────────────────────────────────────

interface ImageUploadFieldProps {
  label: string;
  fieldName: "shopLogo" | "shopBannerImage";
  /** Existing URL from the server (shown on first load) */
  initialUrl?: string;
  onUpload?: (url: string, key: string) => void;
  setValue: (field: "shopLogo" | "shopBannerImage", value: string) => void;
  aspectHint?: string;
}

const ImageUploadField: React.FC<ImageUploadFieldProps> = ({
  label,
  fieldName,
  initialUrl,
  onUpload,
  setValue,
  aspectHint,
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Track whether the user has interacted; if not, show the server image.
  const [userInteracted, setUserInteracted] = useState(false);

  const handleUploadWithField = (url: string, key: string) => {
    setValue(fieldName, url);
    onUpload?.(url, key);
  };

  const {
    uploadedFile,
    localPreview,
    isUploading,
    error,
    handleUpload,
    handleRemove,
  } = useFileUpload({ onUpload: handleUploadWithField });

  // After interaction: prefer the hook's state.
  // On first load (no interaction): fall back to the server initialUrl.
  const newUrl = uploadedFile
    ? `${process.env.NEXT_PUBLIC_MEDIA_URL}/${uploadedFile.url}`
    : (localPreview ?? null);

  const displayUrl = userInteracted ? newUrl : (newUrl ?? initialUrl ?? null);

  const hasImage = Boolean(displayUrl);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    setUserInteracted(true);
    // If there was a previously uploaded file in this session, remove it first.
    if (uploadedFile) {
      await handleRemove();
    }
    handleUpload(e);
  };

  const onRemove = async () => {
    setUserInteracted(true);
    await handleRemove();
    setValue(fieldName, "");
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const isBanner = fieldName === "shopBannerImage";

  return (
    <div className="space-y-2">
      <Label className="text-foreground">{label}</Label>
      {aspectHint && (
        <p className="text-xs text-muted-foreground">{aspectHint}</p>
      )}

      <div className="bg-muted rounded-lg p-5 text-center hover:bg-muted/70 transition-colors">
        <input
          ref={fileInputRef}
          type="file"
          id={fieldName}
          className="hidden"
          accept=".png,.jpg,.jpeg"
          onChange={handleFileChange}
          disabled={isUploading}
        />

        {hasImage ? (
          <div className="space-y-1">
            <div
              className={`relative mx-auto overflow-hidden rounded-lg bg-card border ${
                isBanner ? "w-full h-32" : "w-24 h-24"
              }`}
            >
              <Image
                src={displayUrl!}
                alt={label}
                fill
                className="object-contain p-2"
                sizes={isBanner ? "400px" : "128px"}
                unoptimized
              />

              {isUploading && (
                <div className="absolute inset-0 bg-black/40 rounded-lg flex items-center justify-center">
                  <Loader2 className="size-6 text-card animate-spin" />
                </div>
              )}

              {!isUploading && (
                <button
                  type="button"
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    onRemove();
                  }}
                  className="absolute top-1.5 right-1.5 w-6 h-6 bg-destructive text-card rounded-full flex items-center justify-center hover:bg-destructive/90 transition-colors cursor-pointer shadow-md z-10"
                  aria-label="Remove image"
                >
                  <X className="size-3.5" />
                </button>
              )}
            </div>

            {isUploading ? (
              <p className="text-sm text-muted-foreground flex items-center justify-center gap-1">
                <Loader2 className="size-3 animate-spin" /> Uploading…
              </p>
            ) : uploadedFile ? (
              <p className="text-sm text-chart-2 flex items-center justify-center gap-1">
                <CheckCircle2 className="size-3" /> Uploaded successfully
              </p>
            ) : (
              // Showing the server image — no upload state yet
              <p className="text-sm text-muted-foreground flex items-center justify-center gap-1">
                <CheckCircle2 className="size-3" /> Current image
              </p>
            )}

            {!isUploading && (
              <label
                htmlFor={fieldName}
                className="text-sm text-muted-foreground cursor-pointer hover:text-primary transition-colors"
              >
                Click to change image
              </label>
            )}
          </div>
        ) : (
          <label htmlFor={fieldName} className="cursor-pointer block space-y-2">
            <p className="flex flex-col items-center text-muted-foreground">
              <ImageIcon className="size-8 mb-3 opacity-60" />
              Drag and drop your image here, or click to upload
            </p>
            <p className="text-sm text-muted-foreground">
              PNG, JPG · up to 5 MB
            </p>
          </label>
        )}

        {error && <p className="text-sm text-destructive mt-2">{error}</p>}
      </div>
    </div>
  );
};

// ─── Main Component ─────────────────────────────────────────────────────────────

export default function ShopSettings({
  shopInofo,
}: {
  shopInofo: Shop | null;
}) {
  const [isLoading, setIsLoading] = useState(false);

  // Guard: only reset the form the first time real data arrives,
  // never again while the user is editing.
  const hasReset = useRef(false);

  const {
    register,
    handleSubmit,
    control,
    setValue,
    reset,
    formState: { errors },
  } = useForm<ShopSettingsForm>({
    resolver: zodResolver(ShopSettingsSchema),
    defaultValues: {
      shopName: "",
      shopDescription: "",
      shopAnnouncement: "",
      address: "",
      shopLogo: "",
      shopBannerImage: "",
      shopPolicies: "",
      returnPolicy: "",
      privacyPolicy: "",
      shippingPolicy: "",
      facebookUrl: "",
      instagramUrl: "",
      twitterUrl: "",
      websiteUrl: "",
    },
    mode: "onChange",
  });

  useEffect(() => {
    if (!shopInofo || hasReset.current) return;
    hasReset.current = true;
    reset({
      shopName: shopInofo.shopName || "",
      shopDescription: shopInofo.shopDescription || "",
      shopAnnouncement: shopInofo.shopAnnouncement || "",
      address: shopInofo.address || "",
      shopLogo: shopInofo.shopLogo || "",
      shopBannerImage: shopInofo.shopBannerImage || "",
      shopPolicies: shopInofo.shopPolicies || "",
      returnPolicy: shopInofo.returnPolicy || "",
      privacyPolicy: shopInofo.privacyPolicy || "",
      shippingPolicy: shopInofo.shippingPolicy || "",
      facebookUrl: shopInofo.facebookUrl || "",
      instagramUrl: shopInofo.instagramUrl || "",
      twitterUrl: shopInofo.twitterUrl || "",
      websiteUrl: shopInofo.websiteUrl || "",
    });
  }, [shopInofo, reset]);

  const onSubmit = async (data: ShopSettingsForm) => {
    setIsLoading(true);
    try {
      const res = await updateStoreSettings(data);
      console.log("Update Store Settings Response:", res);
      if (res.success) {
        toast.success(res.message || "Shop settings saved successfully");
        reset();
        window.location.href = "/seller-dashboard/settings?tab=shop";
      }
    } catch (error: unknown) {
      toast.error(
        error instanceof Error ? error.message : "Failed to save shop settings",
      );
    } finally {
      setIsLoading(false);
    }
  };

  const policyFields = [
    { name: "shopPolicies", label: "General Shop Policies" },
    { name: "returnPolicy", label: "Return Policy" },
    { name: "privacyPolicy", label: "Privacy Policy" },
    { name: "shippingPolicy", label: "Shipping Policy" },
  ] as const;

  const socialFields = [
    {
      id: "facebookUrl",
      name: "facebookUrl",
      label: "Facebook URL",
      placeholder: "https://facebook.com/yourshop",
    },
    {
      id: "instagramUrl",
      name: "instagramUrl",
      label: "Instagram URL",
      placeholder: "https://instagram.com/yourshop",
    },
    {
      id: "twitterUrl",
      name: "twitterUrl",
      label: "Twitter / X URL",
      placeholder: "https://twitter.com/yourshop",
    },
    {
      id: "websiteUrl",
      name: "websiteUrl",
      label: "Website URL",
      placeholder: "https://yourshop.com",
    },
  ] as const;

  return (
    <div className="w-full max-w-3xl mx-auto space-y-5">
      {/* Page Header */}
      <Card className="w-full shadow-md">
        <CardHeader>
          <CardTitle className="text-lg flex font-normal items-center gap-3">
            <Store className="text-primary" />
            <p>Shop Settings</p>
          </CardTitle>
        </CardHeader>
      </Card>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
        {/* ── General Info ──────────────────────────────────────────────── */}
        <Card className="shadow-md">
          <CardContent className="pt-6 space-y-5">
            <SectionHeader icon={Store} title="General Information" />

            <div className="space-y-2">
              <Label htmlFor="shopName">Shop Name</Label>
              <Input
                id="shopName"
                {...register("shopName")}
                placeholder="e.g. Amina's Handcrafts"
                className="bg-muted"
              />
              {errors.shopName && (
                <p className="text-sm text-destructive">
                  {errors.shopName.message}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="shopDescription">Shop Description</Label>
              <Controller
                name="shopDescription"
                control={control}
                render={({ field }) => (
                  <Textarea
                    {...field}
                    id="shopDescription"
                    placeholder="Tell customers what makes your shop special…"
                    className="min-h-28 bg-muted resize-none"
                    maxLength={500}
                  />
                )}
              />
              {errors.shopDescription && (
                <p className="text-sm text-destructive">
                  {errors.shopDescription.message}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="shopAnnouncement">
                Shop Announcement{" "}
                <span className="text-muted-foreground text-xs">
                  (optional)
                </span>
              </Label>
              <Input
                id="shopAnnouncement"
                {...register("shopAnnouncement")}
                placeholder="e.g. New arrivals this week!"
                className="bg-muted"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="address">
                <span className="flex items-center gap-1.5">
                  <MapPin className="size-3.5 text-primary" /> Address / City
                </span>
              </Label>
              <Input
                id="address"
                {...register("address")}
                placeholder="e.g. Accra, Ghana"
                className="bg-muted"
              />
              {errors.address && (
                <p className="text-sm text-destructive">
                  {errors.address.message}
                </p>
              )}
            </div>
          </CardContent>
        </Card>

        {/* ── Media ─────────────────────────────────────────────────────── */}
        <Card className="shadow-md">
          <CardContent className="pt-6 space-y-5">
            <SectionHeader icon={ImageIcon} title="Shop Media" />

            <ImageUploadField
              label="Shop Logo (Optional)"
              fieldName="shopLogo"
              initialUrl={
                shopInofo?.shopLogo
                  ? `${process.env.NEXT_PUBLIC_MEDIA_URL}/${shopInofo.shopLogo}`
                  : undefined
              }
              setValue={setValue}
              aspectHint="Recommended: square image, at least 200×200 px"
            />

            <ImageUploadField
              label="Shop Banner (Optional)"
              fieldName="shopBannerImage"
              initialUrl={
                shopInofo?.shopBannerImage
                  ? `${process.env.NEXT_PUBLIC_MEDIA_URL}/${shopInofo.shopBannerImage}`
                  : undefined
              }
              setValue={setValue}
              aspectHint="Recommended: 1200×300 px or wider"
            />
          </CardContent>
        </Card>

        {/* ── Policies ──────────────────────────────────────────────────── */}
        <Card className="shadow-md">
          <CardContent className="pt-6 space-y-5">
            <SectionHeader icon={FileText} title="Policies" />

            {policyFields.map(({ name, label }) => (
              <div key={name} className="space-y-2">
                <Label>{label}</Label>
                <Controller
                  name={name}
                  control={control}
                  render={({ field }) => (
                    // key forces RichTextEditor to re-mount with the correct
                    // initial HTML when shopInofo first arrives (e.g. after SSR).
                    <RichTextEditor
                      key={`${name}-${shopInofo?.shopName ?? "new"}`}
                      value={field.value ?? ""}
                      onChange={(html) =>
                        setValue(name, html, { shouldValidate: true })
                      }
                      error={errors[name]?.message}
                    />
                  )}
                />
              </div>
            ))}
          </CardContent>
        </Card>

        {/* ── Social Links ──────────────────────────────────────────────── */}
        <Card className="shadow-md">
          <CardContent className="pt-6 space-y-5">
            <SectionHeader icon={Share2} title="Social Links" />

            {socialFields.map(({ id, name, label, placeholder }) => (
              <div key={id} className="space-y-2">
                <Label htmlFor={id}>{label}</Label>
                <Input
                  id={id}
                  {...register(name)}
                  placeholder={placeholder}
                  className="bg-muted"
                />
                {errors[name] && (
                  <p className="text-sm text-destructive">
                    {errors[name]?.message}
                  </p>
                )}
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Submit */}
        <Button
          type="submit"
          disabled={isLoading}
          className="w-full bg-primary hover:bg-olive-800 text-card"
        >
          {isLoading ? (
            <>
              <Loader2 className="size-4 animate-spin mr-2" />
              Saving…
            </>
          ) : (
            "Save Changes"
          )}
        </Button>
      </form>
    </div>
  );
}
