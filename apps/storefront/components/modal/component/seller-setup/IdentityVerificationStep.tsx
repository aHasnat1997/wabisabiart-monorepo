import React, { useState, useEffect } from "react";
import {
  Control,
  FieldErrors,
  UseFormHandleSubmit,
  Controller,
  useWatch,
} from "react-hook-form";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import UploadIcon from "@/assets/icons/uploadIcon.svg";
import { Checkbox } from "@/components/animate-ui/components/base/checkbox";
import Image from "next/image";
import { X, Loader2, CheckCircle2 } from "lucide-react";
import SectionTitle from "@/components/SectionTitle";
import { Spinner } from "@/components/ui/spinner";
import { useFileUpload, UploadedFile } from "@/components/uploadFile";
import { ShopFormValues } from "./setup-schema";

interface IdentityVerificationStepProps {
  step: number;
  control: Control<ShopFormValues>;
  errors: FieldErrors<ShopFormValues>;
  handleSubmit: UseFormHandleSubmit<ShopFormValues>;
  onSubmit: (data: ShopFormValues) => void;
  isLoading: boolean;
  onIdUpload?: (url: string, key: string) => void;
  onProductsUpload?: (urls: string[]) => void;
}

const IdentityVerificationStep: React.FC<IdentityVerificationStepProps> = ({
  step,
  control,
  errors,
  handleSubmit,
  onSubmit,
  isLoading,
  onIdUpload,
  onProductsUpload,
}) => {
  const handcraftedItems = useWatch({ control, name: "handcraftedItems" });

  const idFileInputRef = React.useRef<HTMLInputElement>(null);
  const {
    file: idFile,
    uploadedFile: uploadedIdFile,
    localPreview: idLocalPreview,
    isUploading: isIdUploading,
    error: idUploadError,
    handleUpload: handleIdUpload,
    handleRemove: handleIdRemove,
  } = useFileUpload({
    onUpload: (url, key) => onIdUpload?.(url, key),
    multiple: false,
  });

  const idDisplayUrl = uploadedIdFile
    ? `${process.env.NEXT_PUBLIC_MEDIA_URL}/${uploadedIdFile.url}`
    : (idLocalPreview ?? null);
  const hasIdImage = Boolean(idDisplayUrl);

  const onIdRemove = async () => {
    await handleIdRemove();
    if (idFileInputRef.current) idFileInputRef.current.value = "";
  };

  const productFileInputRef = React.useRef<HTMLInputElement>(null);
  const [accumulatedProductUploads, setAccumulatedProductUploads] = useState<
    UploadedFile[]
  >([]);

  const {
    uploadedFiles: newlyUploadedFiles,
    localPreviews: productLocalPreviews,
    isUploading: isProductsUploading,
    error: productsUploadError,
    handleUpload: handleProductsUploadRaw,
    handleRemove: handleProductRemoveRaw,
  } = useFileUpload({ multiple: true });

  const handleProductsUpload = async (
    e: React.ChangeEvent<HTMLInputElement>,
  ) => {
    if (!e.target.files?.length) return;
    await handleProductsUploadRaw(e);
    if (productFileInputRef.current) productFileInputRef.current.value = "";
  };

  const onProductRemove = async (key: string) => {
    await handleProductRemoveRaw(key);
    setAccumulatedProductUploads((prev) => prev.filter((f) => f.key !== key));
  };

  useEffect(() => {
    if (newlyUploadedFiles && newlyUploadedFiles.length > 0) {
      setTimeout(() => {
        setAccumulatedProductUploads((prev) => {
          const existingKeys = new Set(prev.map((f) => f.key));
          const uniqueNew = newlyUploadedFiles.filter(
            (f) => !existingKeys.has(f.key),
          );
          if (uniqueNew.length === 0) return prev;
          return [...prev, ...uniqueNew];
        });
      }, 0);
    }
  }, [newlyUploadedFiles]);

  useEffect(() => {
    if (onProductsUpload) {
      onProductsUpload(accumulatedProductUploads.map((f) => `${f.url}`));
    }
  }, [accumulatedProductUploads, onProductsUpload]);

  const displayProductUploads = accumulatedProductUploads;
  const totalProductImages =
    displayProductUploads.length + productLocalPreviews.length;

  if (step !== 7) return null;

  const isSubmitting = isLoading || isIdUploading || isProductsUploading;

  return (
    <div className="w-full">
      <SectionTitle
        title="Identity Verification"
        subtitle="To ensure community safety, we require all makers to verify their identity and the origin of their crafts."
      />

      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* ID Upload */}
          <div className="flex flex-col h-full">
            <Label className="text-foreground mb-3">
              Upload ID or Proof of Ownership
            </Label>
            <div className="flex-1 bg-background rounded-xl p-4 hover:bg-muted/50 transition-colors cursor-pointer border-2 border-dashed border-muted hover:border-primary/50 h-64">
              <input
                ref={idFileInputRef}
                type="file"
                id="idFile"
                className="hidden"
                accept=".pdf,.jpg,.jpeg,.png"
                onChange={handleIdUpload}
                disabled={isIdUploading}
              />
              <label htmlFor="idFile" className="cursor-pointer block h-full">
                {hasIdImage ? (
                  <div className="flex flex-col h-full">
                    <div className="flex-1 flex flex-col justify-center">
                      <div className="relative w-full mx-auto aspect-video">
                        <div className="w-full h-full rounded-lg overflow-hidden bg-muted/20 border">
                          {idFile?.type === "application/pdf" ? (
                            <div className="w-full h-full flex flex-col items-center justify-center p-4">
                              <div className="text-4xl mb-2">📄</div>
                              <div className="text-foreground font-medium truncate text-center px-2">
                                {idFile.name}
                              </div>
                              <div className="text-sm text-muted-foreground mt-1">
                                PDF Document
                              </div>
                            </div>
                          ) : (
                            <Image
                              src={idDisplayUrl!}
                              alt="ID preview"
                              fill
                              className="object-contain p-3"
                              sizes="(max-width: 768px) 100vw, 50vw"
                              unoptimized
                            />
                          )}
                        </div>
                        {isIdUploading && (
                          <div className="absolute inset-0 bg-black/40 rounded-lg flex items-center justify-center">
                            <Loader2 className="size-6 text-card animate-spin" />
                          </div>
                        )}
                        {!isIdUploading && (
                          <button
                            type="button"
                            onClick={(e) => {
                              e.preventDefault();
                              e.stopPropagation();
                              onIdRemove();
                            }}
                            className="absolute -top-2 -right-2 w-6 h-6 bg-destructive text-card rounded-full flex items-center justify-center text-xs cursor-pointer font-bold hover:bg-destructive/90 transition-colors shadow-md z-10"
                          >
                            <X className="size-4" />
                          </button>
                        )}
                      </div>
                    </div>
                    <div className="mt-4 px-2">
                      <div className="text-foreground font-medium truncate text-center w-full">
                        {idFile?.name}
                      </div>
                      {isIdUploading ? (
                        <p className="text-sm text-muted-foreground flex items-center justify-center gap-1 mt-2">
                          <Loader2 className="size-3 animate-spin" />{" "}
                          Uploading...
                        </p>
                      ) : uploadedIdFile ? (
                        <p className="text-sm text-chart-2 flex items-center justify-center gap-1 mt-2">
                          <CheckCircle2 className="size-3" /> Uploaded
                          successfully
                        </p>
                      ) : (
                        <p className="text-sm text-muted-foreground text-center mt-2">
                          Click to change file
                        </p>
                      )}
                    </div>
                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center h-full min-h-70 p-4">
                    <div className="space-y-4 text-center">
                      <div className="flex justify-center">
                        <UploadIcon
                          size={48}
                          className="text-muted-foreground opacity-75"
                        />
                      </div>
                      <div>
                        <p className="text-muted-foreground font-medium mb-1">
                          Click to upload ID or proof
                        </p>
                        <p className="text-sm text-muted-foreground">
                          PDF, PNG, JPG up to 5MB
                        </p>
                      </div>
                    </div>
                  </div>
                )}
              </label>
            </div>
            {idUploadError && (
              <p className="text-sm text-destructive mt-2">{idUploadError}</p>
            )}
            <p className="text-sm text-muted-foreground mt-3">
              e.g., Passport, Driver&apos;s License
            </p>
          </div>

          {/* Product Images Upload */}
          <div className="flex flex-col h-full">
            <Label className="text-foreground mb-3">
              Upload Sample Product Images
            </Label>
            <div className="flex-1 bg-background rounded-xl hover:bg-muted/50 transition-colors cursor-pointer border-2 border-dashed border-muted hover:border-primary/50 h-64">
              <input
                ref={productFileInputRef}
                type="file"
                id="productImages"
                className="hidden"
                accept=".jpg,.jpeg,.png"
                multiple
                onChange={handleProductsUpload}
                disabled={isProductsUploading}
              />
              <label
                htmlFor="productImages"
                className="cursor-pointer block h-full"
              >
                {totalProductImages > 0 ? (
                  <div className="flex flex-col h-full">
                    <div className="flex-1 p-4 overflow-y-auto">
                      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 auto-rows-fr">
                        {displayProductUploads.map((uploaded, index) => (
                          <div key={uploaded.key} className="relative">
                            <div className="aspect-square w-full rounded-lg overflow-hidden bg-card border">
                              <Image
                                src={`${process.env.NEXT_PUBLIC_MEDIA_URL}/${uploaded.url}`}
                                alt={`Product preview ${index + 1}`}
                                fill
                                className="object-cover rounded"
                                sizes="(max-width: 640px) 50vw, (max-width: 768px) 33vw, 25vw"
                                unoptimized
                              />
                            </div>
                            {!isProductsUploading && (
                              <button
                                type="button"
                                onClick={(e) => {
                                  e.preventDefault();
                                  e.stopPropagation();
                                  onProductRemove(uploaded.key);
                                }}
                                className="absolute -top-2 -right-2 w-5 h-5 bg-destructive text-card rounded-full flex items-center justify-center text-xs font-bold hover:bg-destructive/90 cursor-pointer transition-colors shadow-md z-10"
                              >
                                <X className="size-4" />
                              </button>
                            )}
                          </div>
                        ))}
                        {productLocalPreviews.map((preview, index) => (
                          <div key={`preview-${index}`} className="relative">
                            <div className="aspect-square w-full rounded-lg overflow-hidden bg-card border">
                              <Image
                                src={preview}
                                alt={`Product preview ${displayProductUploads.length + index + 1}`}
                                fill
                                className="object-cover rounded"
                                sizes="(max-width: 640px) 50vw, (max-width: 768px) 33vw, 25vw"
                              />
                            </div>
                            {isProductsUploading && (
                              <div className="absolute inset-0 bg-black/40 rounded-lg flex items-center justify-center">
                                <Loader2 className="size-4 text-card animate-spin" />
                              </div>
                            )}
                          </div>
                        ))}
                        {totalProductImages < 6 && (
                          <label
                            htmlFor="productImages"
                            className="aspect-square border-2 border-dashed border-muted rounded-lg flex flex-col items-center justify-center cursor-pointer hover:border-primary/50 hover:bg-muted/20 transition-colors"
                          >
                            <div className="text-2xl text-muted-foreground mb-1">
                              +
                            </div>
                            <div className="text-xs text-muted-foreground text-center px-2">
                              Add more
                            </div>
                          </label>
                        )}
                      </div>
                    </div>
                    <div className="mt-4 p-2">
                      <div className="text-foreground font-medium text-center">
                        {totalProductImages} image(s) selected
                        {totalProductImages >= 6 && (
                          <span className="text-destructive ml-2 text-sm">
                            (Max 6 images)
                          </span>
                        )}
                      </div>
                      {isProductsUploading ? (
                        <p className="text-sm text-muted-foreground flex items-center justify-center gap-1 mt-2">
                          <Loader2 className="size-3 animate-spin" />{" "}
                          Uploading...
                        </p>
                      ) : (
                        <p className="text-sm text-muted-foreground text-center mt-2">
                          Click or drag to add more images
                        </p>
                      )}
                    </div>
                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center h-64 p-4">
                    <div className="space-y-4 text-center">
                      <div className="flex justify-center">
                        <UploadIcon
                          size={48}
                          className="text-muted-foreground opacity-75"
                        />
                      </div>
                      <div>
                        <p className="text-muted-foreground font-medium mb-1">
                          Click to upload images
                        </p>
                        <p className="text-sm text-muted-foreground mt-1">
                          Max 06 images
                        </p>
                      </div>
                    </div>
                  </div>
                )}
              </label>
            </div>
            {productsUploadError && (
              <p className="text-sm text-destructive mt-2">
                {productsUploadError}
              </p>
            )}
            <p className="text-sm text-muted-foreground mt-3">
              This helps us understand your craft.
            </p>
          </div>
        </div>

        <div className="flex items-center space-x-2">
          <Controller
            name="handcraftedItems"
            control={control}
            render={({ field }) => (
              <Checkbox
                id="handcraftedItems"
                checked={field.value}
                onCheckedChange={field.onChange}
              />
            )}
          />
          <Label htmlFor="handcraftedItems" className="text-foreground">
            My items are handcrafted or ethically sourced.
          </Label>
        </div>
        {errors.handcraftedItems && (
          <p className="text-sm text-destructive">
            {errors.handcraftedItems.message}
          </p>
        )}

        <div className="bg-background rounded-lg md:rounded-xl text-sm md:text-base space-y-2 text-justify p-4 mb-4">
          <p className="text-foreground leading-5">
            We will review your submission within 3–5 business days. You will
            receive an email notification once your verification is complete.
          </p>
          <p className="text-foreground leading-5">
            This step helps us maintain a trusted community where authenticity
            and ethical practices are valued.
          </p>
        </div>

        <Button
          type="button"
          className="h-9! md:h-11! rounded-full text-sm md:text-base hover:shadow-lg transition-shadow duration-300 w-full"
          onClick={() => handleSubmit(onSubmit)()}
          disabled={!uploadedIdFile || isSubmitting || !handcraftedItems}
        >
          Submit for Review {isSubmitting && <Spinner />}
        </Button>
      </div>
    </div>
  );
};

export default IdentityVerificationStep;
