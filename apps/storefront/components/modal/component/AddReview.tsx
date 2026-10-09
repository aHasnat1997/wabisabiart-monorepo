"use client";

import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Rating, RatingButton } from "@/components/ui/shadcn-io/rating";
import { Textarea } from "@/components/ui/textarea";
import { useRouter, useSearchParams } from "next/navigation";
import { useForm, Controller, SubmitHandler } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useFileUpload } from "@/components/uploadFile";
import Image from "next/image";
import { X, Loader2, CheckCircle2, ImagePlus } from "lucide-react";
import { Spinner } from "@/components/ui/spinner";
import { useRef, useCallback, useId, useState, useEffect } from "react";
import { giveReview } from "@/components/actions";
import { toast } from "sonner";

const reviewSchema = z.object({
  rating: z.number({ message: "Please select a rating" }).min(1).max(5),
  comment: z.string().min(5, "Min 5 characters").max(500, "Max 500 characters"),
});

type ReviewFormValues = z.infer<typeof reviewSchema>;

const MAX_IMAGES = 5;

// ── Each uploaded image preview ───────────────────────────────────────────────

function UploadedPreview({
  file,
  uploadedFile,
  localPreview,
  isUploading,
  onRemove,
}: {
  file: File | null;
  uploadedFile: { url: string } | null;
  localPreview: string | null;
  isUploading: boolean;
  onRemove: () => void;
}) {
  const displayUrl = uploadedFile
    ? `${process.env.NEXT_PUBLIC_MEDIA_URL}/${uploadedFile.url}`
    : localPreview;

  if (!displayUrl) return null;

  return (
    <div className="relative w-20 h-20 rounded-lg overflow-visible">
      <div className="w-full h-full rounded-lg overflow-hidden border bg-background">
        <Image
          src={displayUrl}
          alt={file?.name ?? "upload"}
          fill
          className="object-cover"
          sizes="80px"
          unoptimized
        />
      </div>
      {isUploading ? (
        <div className="absolute inset-0 bg-black/40 rounded-lg flex items-center justify-center">
          <Loader2 className="size-5 text-white animate-spin" />
        </div>
      ) : (
        <>
          {uploadedFile && (
            <div className="absolute bottom-1 right-1 bg-green-500 rounded-full p-0.5">
              <CheckCircle2 className="size-3 text-white" />
            </div>
          )}
          <button
            type="button"
            onClick={onRemove}
            className="absolute -top-2 -right-2 w-5 h-5 bg-destructive text-white rounded-full flex items-center justify-center hover:bg-destructive/90 z-10 shadow"
            aria-label="Remove image"
          >
            <X className="size-3" />
          </button>
        </>
      )}
    </div>
  );
}

// ── Single slot that holds one upload ─────────────────────────────────────────

function ImageSlot({
  pendingFile,
  showInput,
  onUploaded,
  onRemoved,
  onMultipleFiles,
}: {
  pendingFile?: File | null;
  showInput: boolean;
  onUploaded: (url: string) => void;
  onRemoved: () => void;
  onMultipleFiles: (files: File[]) => void;
}) {
  const uid = useId();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const {
    file,
    uploadedFile,
    localPreview,
    isUploading,
    error,
    handleUpload,
    handleRemove,
  } = useFileUpload({ onUpload: onUploaded });

  // Auto-upload when parent passes a pending file (from multi-select)
  useEffect(() => {
    if (!pendingFile) return;
    const dt = new DataTransfer();
    dt.items.add(pendingFile);
    handleUpload({
      target: { files: dt.files },
    } as React.ChangeEvent<HTMLInputElement>);
  }, [pendingFile]); // eslint-disable-line react-hooks/exhaustive-deps

  const hasPreview = !!(uploadedFile
    ? `${process.env.NEXT_PUBLIC_MEDIA_URL}/${uploadedFile.url}`
    : localPreview);

  const onFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files ?? []);
    if (!files.length) return;
    // First file → this slot; extras → parent spawns new slots
    const dt = new DataTransfer();
    dt.items.add(files[0]);
    handleUpload({
      target: { files: dt.files },
    } as React.ChangeEvent<HTMLInputElement>);
    if (files.length > 1) onMultipleFiles(files.slice(1));
  };

  const onRemove = async () => {
    await handleRemove();
    if (fileInputRef.current) fileInputRef.current.value = "";
    onRemoved();
  };

  return (
    <div className="flex items-center gap-3 flex-wrap">
      {/* Preview (only when file selected) */}
      {hasPreview && (
        <UploadedPreview
          file={file}
          uploadedFile={uploadedFile}
          localPreview={localPreview ?? null}
          isUploading={isUploading}
          onRemove={onRemove}
        />
      )}

      {/* Empty input — only shown on the last slot and when no preview yet */}
      {showInput && !hasPreview && (
        <>
          <input
            ref={fileInputRef}
            id={uid}
            type="file"
            accept=".png,.jpg,.jpeg"
            multiple
            className="hidden"
            onChange={onFileChange}
            disabled={isUploading}
          />
          <label
            htmlFor={uid}
            className="w-20 h-20 rounded-lg border-2 border-dashed border-border flex flex-col items-center justify-center cursor-pointer hover:bg-muted/50 transition-colors gap-1"
          >
            <ImagePlus className="size-5 text-muted-foreground" />
            <span className="text-[9px] text-muted-foreground">add photo</span>
          </label>
        </>
      )}

      {error && <p className="text-[10px] text-destructive">{error}</p>}
    </div>
  );
}

// ── Main form ─────────────────────────────────────────────────────────────────

export default function AddReview() {
  const router = useRouter();
  const [slotCount, setSlotCount] = useState(1);
  const [pendingFiles, setPendingFiles] = useState<Record<number, File>>({});
  const uploadedUrlsRef = useRef<(string | null)[]>(
    Array(MAX_IMAGES).fill(null),
  );
  const [isLoading, setIsLoading] = useState(false);
  const searchParams = useSearchParams();
  const productId = searchParams.get("productId");

  const {
    control,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<ReviewFormValues>({
    resolver: zodResolver(reviewSchema),
    defaultValues: { rating: 0, comment: "" },
  });

  const handleUploaded = useCallback((idx: number, url: string) => {
    uploadedUrlsRef.current[idx] = url;
    setPendingFiles((p) => {
      const n = { ...p };
      delete n[idx];
      return n;
    });
    // Append a new empty input slot after upload (if under limit)
    setSlotCount((prev) =>
      idx === prev - 1 && prev < MAX_IMAGES ? prev + 1 : prev,
    );
  }, []);

  const handleRemoved = useCallback((idx: number) => {
    uploadedUrlsRef.current[idx] = null;
    // Collapse: remove this slot and shift everything down
    setSlotCount((prev) => Math.max(1, prev - 1));
    uploadedUrlsRef.current.splice(idx, 1);
    uploadedUrlsRef.current.push(null);
  }, []);

  const handleMultipleFiles = useCallback((idx: number, files: File[]) => {
    setSlotCount((prev) => {
      const canAdd = Math.min(files.length, MAX_IMAGES - prev);
      if (canAdd <= 0) return prev;
      const newPending: Record<number, File> = {};
      for (let i = 0; i < canAdd; i++) newPending[prev + i] = files[i];
      setPendingFiles((p) => ({ ...p, ...newPending }));
      return prev + canAdd;
    });
  }, []);

  const onSubmit: SubmitHandler<ReviewFormValues> = useCallback(
    async (data) => {
      const images = uploadedUrlsRef.current.filter(Boolean) as string[];
      setIsLoading(true);
      if (!productId) return;
      try {
        const res = await giveReview({ ...data, images, productId });
        console.log("Review response:", res);
        if (res.success) {
          reset();
          toast.success(res.message || "Review added successfully");
        }
      } catch (error: unknown) {
        console.error(error);
        toast.error(
          error instanceof Error ? error.message : "Failed to add review",
        );
      } finally {
        window.history.back();
        setIsLoading(false);
      }
    },
    [productId, reset],
  );

  return (
    <div className="space-y-5 p-2 max-w-xl">
      {/* Rating */}
      <div className="space-y-1.5">
        <Label className="text-sm sm:text-base">Your Rating</Label>
        <Controller
          name="rating"
          control={control}
          render={({ field }) => (
            <Rating value={field.value} onValueChange={field.onChange}>
              {Array.from({ length: 5 }).map((_, i) => (
                <RatingButton className="text-orange-400" key={i} size={28} />
              ))}
            </Rating>
          )}
        />
        {errors.rating && (
          <p className="text-xs text-destructive">{errors.rating.message}</p>
        )}
      </div>

      {/* Review Text */}
      <div className="space-y-1.5">
        <Label className="text-sm sm:text-base">Your Review</Label>
        <Controller
          name="comment"
          control={control}
          render={({ field }) => (
            <Textarea
              {...field}
              placeholder="Write your review here… (min 5 characters)"
              className="resize-none min-h-28"
              maxLength={500}
            />
          )}
        />
        {errors.comment && (
          <p className="text-xs text-destructive">{errors.comment.message}</p>
        )}
      </div>

      {/* Images */}
      <div className="space-y-2">
        <Label className="text-sm sm:text-base">
          Add Photos{" "}
          <span className="text-muted-foreground font-normal">
            (up to {MAX_IMAGES})
          </span>
        </Label>
        <div className="flex flex-wrap gap-3">
          {Array.from({ length: slotCount }).map((_, idx) => (
            <ImageSlot
              key={idx}
              pendingFile={pendingFiles[idx] ?? null}
              showInput={idx === slotCount - 1}
              onUploaded={(url) => handleUploaded(idx, url)}
              onRemoved={() => handleRemoved(idx)}
              onMultipleFiles={(files) => handleMultipleFiles(idx, files)}
            />
          ))}
        </div>
        <p className="text-xs text-muted-foreground">
          PNG, JPG up to 5MB — select multiple at once
        </p>
      </div>

      {/* Actions */}
      <div className="flex gap-2 pt-1">
        <Button
          type="button"
          variant="outline"
          onClick={() => router.back()}
          className="rounded-full"
        >
          Cancel
        </Button>
        <Button
          type="button"
          className="rounded-full"
          disabled={isSubmitting || isLoading}
          onClick={(e) => handleSubmit(onSubmit)(e)}
        >
          Post Review {(isSubmitting || isLoading) && <Spinner />}
        </Button>
      </div>
    </div>
  );
}
