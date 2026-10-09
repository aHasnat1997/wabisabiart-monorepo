import React from "react";
import {
  Control,
  FieldErrors,
  UseFormWatch,
  Controller,
  SubmitHandler,
  UseFormHandleSubmit,
} from "react-hook-form";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import UploadIcon from "@/assets/icons/uploadIcon.svg";
import SectionTitle from "@/components/SectionTitle";
import Image from "next/image";
import { X, Loader2, CheckCircle2 } from "lucide-react";
import { useFileUpload } from "@/components/uploadFile";
import { Spinner } from "@/components/ui/spinner";
import { ShopFormValues } from "./setup-schema";

interface ShopProfileStepProps {
  step: number;
  control: Control<ShopFormValues>;
  errors: FieldErrors<ShopFormValues>;
  watch: UseFormWatch<ShopFormValues>;
  handleSubmit: UseFormHandleSubmit<ShopFormValues>;
  onSubmit: SubmitHandler<ShopFormValues>;
  onUpload?: (url: string, key: string) => void;
  isLoading?: boolean;
}

const ShopProfileStep: React.FC<ShopProfileStepProps> = ({
  step,
  control,
  errors,
  handleSubmit,
  onSubmit,
  onUpload,
  isLoading,
}) => {
  const fileInputRef = React.useRef<HTMLInputElement>(null);
  const {
    file,
    uploadedFile,
    localPreview,
    isUploading,
    error,
    handleUpload,
    handleRemove,
  } = useFileUpload({ onUpload });

  const displayUrl = uploadedFile
    ? `${process.env.NEXT_PUBLIC_MEDIA_URL}/${uploadedFile.url}`
    : (localPreview ?? null);

  const hasImage = Boolean(displayUrl);

  const onRemove = async () => {
    await handleRemove();
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  if (step !== 6) return null;

  return (
    <div className="w-full">
      <SectionTitle
        title="Set Up Your Shop Profile"
        subtitle="Share your unique story and vision with the Maker's Marketplace community."
      />

      <div className="space-y-6 mt-6">
        {/* Shop Name */}
        <div className="space-y-2">
          <Label htmlFor="shopName" className="text-foreground">
            Shop Name
          </Label>
          <Controller
            name="shopName"
            control={control}
            render={({ field }) => (
              <Input
                {...field}
                id="shopName"
                type="text"
                placeholder="e.g. Artisan Crafts by [Your Name]"
                className="h-9! md:h-11! bg-background border-0 rounded-lg text-foreground placeholder:text-muted-foreground text-sm md:text-base"
              />
            )}
          />
          {errors.shopName && (
            <p className="text-sm text-destructive">
              {errors.shopName.message}
            </p>
          )}
        </div>

        {/* Country / City */}
        <div className="space-y-2">
          <Label htmlFor="countryCity" className="text-foreground">
            Country/City
          </Label>
          <Controller
            name="countryCity"
            control={control}
            render={({ field }) => (
              <Input
                {...field}
                id="countryCity"
                type="text"
                placeholder="e.g. New York, USA"
                className="h-9! md:h-11! bg-background border-0 rounded-lg text-foreground placeholder:text-muted-foreground text-sm md:text-base"
              />
            )}
          />
          {errors.countryCity && (
            <p className="text-sm text-destructive">
              {errors.countryCity.message}
            </p>
          )}
        </div>

        {/* Short Bio */}
        <div className="space-y-2">
          <Label htmlFor="craftDescription" className="text-foreground">
            Short Bio
          </Label>
          <Controller
            name="craftDescription"
            control={control}
            render={({ field }) => (
              <Textarea
                {...field}
                id="craftDescription"
                placeholder="Describe your craft and process. What inspires you? What unique materials do you use? (Max 500 characters)"
                className="min-h-28 bg-background border-0 rounded-lg text-foreground placeholder:text-muted-foreground resize-none text-sm md:text-base"
                maxLength={500}
              />
            )}
          />
          {errors.craftDescription && (
            <p className="text-sm text-destructive">
              {errors.craftDescription.message}
            </p>
          )}
        </div>

        {/* Profile Image Upload */}
        <div>
          <Label className="text-foreground">
            Profile Photo / Shop Logo (Optional)
          </Label>

          <div className="bg-background rounded-lg p-5 mt-2 text-center hover:bg-muted/50 transition-colors">
            <input
              ref={fileInputRef}
              type="file"
              id="profileImage"
              className="hidden"
              accept=".png,.jpg,.jpeg"
              onChange={handleUpload}
              disabled={isUploading}
            />

            {hasImage ? (
              <div className="space-y-0.5">
                <div className="relative w-24 h-24 mx-auto">
                  <div
                    title={file?.name}
                    className="w-full h-full rounded-lg overflow-hidden bg-card border"
                  >
                    <Image
                      src={displayUrl!}
                      alt="Profile preview"
                      fill
                      className="object-contain p-2"
                      sizes="128px"
                      unoptimized
                    />
                  </div>

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
                      className="absolute -top-2 -right-2 w-6 h-6 bg-destructive text-card rounded-full flex items-center justify-center hover:bg-destructive/90 transition-colors cursor-pointer shadow-md z-10"
                      aria-label="Remove image"
                    >
                      <X className="size-4" />
                    </button>
                  )}
                </div>

                {isUploading ? (
                  <p className="text-sm text-muted-foreground flex items-center justify-center gap-1">
                    <Loader2 className="size-3 animate-spin" /> Uploading...
                  </p>
                ) : uploadedFile ? (
                  <p className="text-sm text-chart-2 flex items-center justify-center gap-1">
                    <CheckCircle2 className="size-3" /> Uploaded successfully
                  </p>
                ) : null}

                {!isUploading && (
                  <label
                    htmlFor="profileImage"
                    className="text-sm text-muted-foreground cursor-pointer hover:text-chart-1 transition-colors"
                  >
                    Click to change image
                  </label>
                )}
              </div>
            ) : (
              <label
                htmlFor="profileImage"
                className="cursor-pointer block space-y-2"
              >
                <p className="flex flex-col items-center text-muted-foreground">
                  <UploadIcon size={32} className="mb-3 opacity-75" />
                  Drag and drop your image here, or click to upload
                </p>
                <p className="text-sm text-muted-foreground">
                  PNG, JPG, up to 5MB
                </p>
              </label>
            )}

            {error && <p className="text-sm text-destructive mt-2">{error}</p>}
          </div>
        </div>

        <Button
          type="button"
          disabled={isUploading || isLoading}
          className="flex-1 h-9! md:h-11! rounded-full text-sm md:text-base hover:shadow-lg transition-shadow duration-300 w-full"
          onClick={() => handleSubmit(onSubmit)()}
        >
          Next Step {(isLoading || isUploading) && <Spinner />}
        </Button>
      </div>
    </div>
  );
};

export default ShopProfileStep;
