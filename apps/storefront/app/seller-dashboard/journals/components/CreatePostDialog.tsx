"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Upload, Loader2, X } from "lucide-react";
import {
  Journal,
  JournalPostResponse,
} from "@/types/sellerDashboard/JournalsItems";
import { useForm } from "react-hook-form";
import { CreatePostSchema, PostFormValues } from "./CreatePostSchema";
import { zodResolver } from "@hookform/resolvers/zod";
import Image from "next/image";
import { toast } from "sonner";
import { createJournalPost, updateJournalPost } from "./JournalAction";
import RichTextEditor from "../../products/components/RichTextEditor";
import { useRouter } from "next/navigation";
import { useFileUpload } from "@/components/uploadFile";
import { getImageUrl } from "../../products/components/getImageUrl";

type Props = {
  mode?: "create" | "edit";
  post?: Journal;
};

const CreatePostDialog = ({ mode, post }: Props) => {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [savingDraft, setSavingDraft] = useState(false);
  //  Tracks whether the user explicitly removed the existing banner
  const [bannerRemoved, setBannerRemoved] = useState(false);
  const isPublished = post?.postStatus === "published";

  const {
    uploadedFile,
    isUploading,
    handleUpload,
    handleRemove,
    localPreview,
    reset: resetUpload,
  } = useFileUpload();

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    reset,
    formState: { errors },
  } = useForm<PostFormValues>({
    resolver: zodResolver(CreatePostSchema),
    defaultValues: { title: "", excerpt: "", content: "" },
  });

  useEffect(() => {
    if (mode === "edit" && post) {
      reset({
        title: post.title ?? "",
        excerpt: post.shortExcerpt ?? "",
        content: post.content ?? "",
      });
    }
  }, [mode, post, reset]);

  const closeModalFn = () => {
    reset();
    resetUpload();
    setBannerRemoved(false);
    router.back();
  };

  // ─── Image preview logic ───────────────────
  const newFilePreview =
    localPreview || (uploadedFile?.url ? getImageUrl(uploadedFile.url) : "");

console.log("uploadedFile state:", uploadedFile);
console.log("newFilePreview:", newFilePreview);


  const existingBannerPreview =
    !bannerRemoved && post?.bannerImage ? getImageUrl(post.bannerImage) : "";

  const previewSrc = newFilePreview || existingBannerPreview;
  const hasPreview = Boolean(previewSrc);

  const isShowingExistingBanner =
    !newFilePreview && Boolean(existingBannerPreview);

  // ─── Remove handler ────────────────────────
const handleImageRemove = async () => {
  console.log("1. uploadedFile:", uploadedFile);
  console.log("2. localPreview:", localPreview);
  if (uploadedFile?.key) {
    console.log("3. deleting key:", uploadedFile.key);
    await handleRemove(uploadedFile.key);
  }
  console.log("4. calling resetUpload");
  resetUpload();
  setBannerRemoved(true);
  console.log("5. done");
};
  // ─── Submit handler ────────────────────

  const onSubmit =
    (status: "draft" | "published", shouldClose = true) =>
    async (data: PostFormValues) => {
      try {
        if (status === "published") setIsSubmitting(true);
        else setSavingDraft(true);

        const hasNewUpload = Boolean(uploadedFile?.url);

        const existingImageUrl = hasNewUpload
          ? uploadedFile!.url
          : bannerRemoved
            ? null
            : post?.bannerImage || null;

        let response: JournalPostResponse;

        if (mode === "edit" && post?.id) {
          response = await updateJournalPost(
            post.id,
            data,
            null,
            null,
            status,
            existingImageUrl,
          );
        } else {
          response = await createJournalPost(
            data,
            null,
            null,
            status,
            existingImageUrl,
          );
        }
        if (response.success) {
          toast.success(status === "draft" ? "Draft saved!" : "Post saved!");
          if (shouldClose) closeModalFn();
        }
      } catch (error: unknown) {
        const message =
          error instanceof Error ? error.message : "Failed to save post";
        toast.error(message);
      } finally {
        setIsSubmitting(false);
        setSavingDraft(false);
      }
    };

  return (
    <div className="w-full p-1 md:p-2 pb-12">
      <div>
        <div className="text-lg font-medium">
          {mode === "edit" ? "Edit Post" : "Create New Post"}
        </div>
        <p className="text-muted-foreground text-sm mb-4">
          Share your story with customers
        </p>
      </div>

      <form className="space-y-4">
        {/* Title */}
        <div className="space-y-1">
          <label className="text-sm font-medium">Post Title *</label>
          <Input {...register("title")} placeholder="Enter title" />
          {errors.title && (
            <p className="text-xs text-destructive">{errors.title.message}</p>
          )}
        </div>

        {/* Excerpt */}
        <div className="space-y-1">
          <label className="text-sm font-medium">Short Excerpt</label>
          <Input {...register("excerpt")} placeholder="Brief summary" />
        </div>

        {/* Content */}
        <div className="space-y-1">
          <label className="text-sm font-medium">Post Content *</label>
          <RichTextEditor
            value={watch("content")}
            onChange={(html) =>
              setValue("content", html, { shouldValidate: true })
            }
          />
          {errors.content && (
            <p className="text-xs text-destructive">{errors.content.message}</p>
          )}
        </div>

        {/* Featured Image */}
        <div className="space-y-2">
          <label className="text-sm font-medium">Featured Image</label>
          <div className="relative flex flex-col items-center justify-center gap-2 rounded-lg border border-dashed p-6 text-center bg-muted/30 min-h-[200px]">
            {hasPreview ? (
              <div className="relative h-48 w-full">
                <Image
                  src={previewSrc}
                  alt="Preview"
                  fill
                  className="object-cover rounded-md"
                  unoptimized={Boolean(localPreview)}
                />

                {isUploading && (
                  <div className="absolute inset-0 bg-black/40 rounded-md flex flex-col items-center justify-center text-white">
                    <Loader2 className="h-8 w-8 animate-spin mb-2" />
                    <span className="text-xs font-medium">Uploading...</span>
                  </div>
                )}

                {/*  X clears both new upload and existing banner */}
                <button
                  type="button"
                  onClick={handleImageRemove}
                  className="absolute -top-2 -right-2 bg-destructive text-white rounded-full p-1 shadow-md hover:bg-destructive/90 z-10"
                >
                  <X className="h-4 w-4" />
                </button>

                {/*  Hover overlay to swap image when showing existing banner */}
                {isShowingExistingBanner && (
                  <label className="absolute inset-0 flex flex-col items-center justify-center bg-black/0 hover:bg-black/50 transition-colors rounded-md cursor-pointer group">
                    <div className="opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center gap-1 text-white">
                      <Upload className="h-6 w-6" />
                      <span className="text-xs font-medium">Change image</span>
                    </div>
                    <input
                      type="file"
                      className="hidden"
                      accept="image/*"
                      onChange={(e) => {
                        setBannerRemoved(true); // clear old banner reference
                        handleUpload(e);
                      }}
                    />
                  </label>
                )}
              </div>
            ) : isUploading ? (
              <div className="flex flex-col items-center gap-2 py-8">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
                <p className="text-xs text-muted-foreground">
                  Preparing upload...
                </p>
              </div>
            ) : (
              <label className="w-full cursor-pointer py-8 flex flex-col items-center">
                <Upload className="w-8 h-8 text-muted-foreground mb-2" />
                <p className="text-sm text-muted-foreground">
                  Click to upload featured image
                </p>
                <p className="text-xs text-muted-foreground mt-1">
                  Recommended: 1200x630px
                </p>
                <input
                  type="file"
                  className="hidden"
                  accept="image/*"
                  onChange={handleUpload}
                />
              </label>
            )}
          </div>

          {/* Tips */}
          <div className="rounded-lg bg-chart-1/10 p-4 text-sm text-black/75">
            <p className="font-medium mb-1">Post Tips</p>
            <ul className="list-disc pl-4 space-y-1">
              <li>Share your creative process and inspiration</li>
              <li>Include behind-the-scenes photos or videos</li>
              <li>Regular posts help build trust and authenticity</li>
            </ul>
          </div>
        </div>
      </form>

      {/* Footer Buttons */}
      <div className="mt-6 flex justify-between">
        <Button variant="outline" onClick={closeModalFn}>
          Cancel
        </Button>
        <div className="flex gap-2">
          {!isPublished && (
            <>
              {/* <Button
                variant="secondary"
                disabled={isUploading || savingDraft || isSubmitting}
                onClick={handleSubmit(onSubmit("draft", false))}
              >
                {savingDraft ? "Saving..." : "Save Draft"}
              </Button> */}
              <Button
                disabled={isUploading || isSubmitting || savingDraft}
                onClick={handleSubmit(onSubmit("published", true))}
              >
                {isSubmitting
                  ? "Publishing..."
                  : mode === "edit"
                    ? "Update Post"
                    : "Publish Post"}
              </Button>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default CreatePostDialog;
