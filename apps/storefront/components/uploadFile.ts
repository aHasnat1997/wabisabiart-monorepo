import { useState, useCallback } from "react";
import { uploadMedia, deleteMedia, uploadMultipleMedia } from "@/lib/action";

export interface UploadedFile {
  url: string;
  key: string;
}

interface UseFileUploadOptions {
  onUpload?: (url: string, key: string) => void; // Single file / first file
  onUploadAll?: (files: UploadedFile[]) => void; // ← NEW: All files when multiple
  multiple?: boolean;
}

interface UseFileUploadReturn {
  file: File | null;
  files: File[];
  uploadedFile: UploadedFile | null;
  uploadedFiles: UploadedFile[];
  localPreview: string | null;
  localPreviews: string[];
  isUploading: boolean;
  error: string | null;
  handleUpload: (e: React.ChangeEvent<HTMLInputElement>) => Promise<void>;
  handleRemove: (key?: string) => Promise<void>;
  reset: () => void;
}

export function useFileUpload({
  onUpload,
  onUploadAll,
  multiple = false,
}: UseFileUploadOptions = {}): UseFileUploadReturn {
  const [file, setFile] = useState<File | null>(null);
  const [files, setFiles] = useState<File[]>([]);

  const [uploadedFile, setUploadedFile] = useState<UploadedFile | null>(null);
  const [uploadedFiles, setUploadedFiles] = useState<UploadedFile[]>([]);

  const [localPreview, setLocalPreview] = useState<string | null>(null);
  const [localPreviews, setLocalPreviews] = useState<string[]>([]);

  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const deleteCurrentFile = useCallback(async (key: string) => {
    try {
      await deleteMedia(key);
    } catch (err) {
      console.error("Failed to delete file:", err);
    }
  }, []);

  const handleUpload = useCallback(
    async (e: React.ChangeEvent<HTMLInputElement>) => {
      const selectedFiles = Array.from(e.target.files || []);
      if (!selectedFiles.length) return;

      setError(null);
      setIsUploading(true);

      try {
        // ===============================
        // MULTIPLE FILE UPLOAD
        // ===============================
        if (multiple) {
          const previews = selectedFiles.map((file) =>
            URL.createObjectURL(file),
          );

          setFiles(selectedFiles);
          setLocalPreviews(previews);

          const uploaded = await uploadMultipleMedia(selectedFiles);

          if (uploaded?.length) {
            const mapped = uploaded.map((item) => ({
              url: item.url,
              key: item.key,
            }));

            setUploadedFiles(mapped);

            // Callback for first file (backward compatibility)
            onUpload?.(mapped[0].url, mapped[0].key);

            // ← NEW: Callback for ALL files
            onUploadAll?.(mapped);
          }

          previews.forEach((url) => URL.revokeObjectURL(url));
          setLocalPreviews([]);
        }

        // ===============================
        // SINGLE FILE UPLOAD
        // ===============================
        else {
          const selected = selectedFiles[0];

          const objectUrl = URL.createObjectURL(selected);
          setLocalPreview(objectUrl);
          setFile(selected);

          if (uploadedFile?.key) {
            await deleteCurrentFile(uploadedFile.key);
            setUploadedFile(null);
          }

          const uploaded = await uploadMedia(selected);
          // console.log("uploaded response:", uploaded);

          if (uploaded) {
            setUploadedFile({ url: uploaded.url, key: uploaded.key });
            onUpload?.(uploaded.url, uploaded.key);
          }

          URL.revokeObjectURL(objectUrl);
          setLocalPreview(null);
        }
      } catch (err) {
        setError("Upload failed. Please try again.");
        console.error("Upload error:", err);
      } finally {
        setIsUploading(false);
      }
    },
    [multiple, uploadedFile, deleteCurrentFile, onUpload, onUploadAll],
  );

  const handleRemove = useCallback(
    async (key?: string) => {
      if (multiple) {
        if (key) {
          await deleteCurrentFile(key);
          setUploadedFiles((prev) => prev.filter((file) => file.key !== key));
        }
      } else {
        if (uploadedFile?.key) {
          await deleteCurrentFile(uploadedFile.key);
        }

        if (localPreview) {
          URL.revokeObjectURL(localPreview);
        }

        setFile(null);
        setUploadedFile(null);
        setLocalPreview(null);
      }

      setError(null);
    },
    [multiple, uploadedFile, localPreview, deleteCurrentFile],
  );

  const reset = useCallback(() => {
    localPreviews.forEach((url) => URL.revokeObjectURL(url));
    if (localPreview) URL.revokeObjectURL(localPreview);

    setFile(null);
    setFiles([]);
    setUploadedFile(null);
    setUploadedFiles([]);
    setLocalPreview(null);
    setLocalPreviews([]);
    setIsUploading(false);
    setError(null);
  }, [localPreview, localPreviews]);

  return {
    file,
    files,
    uploadedFile,
    uploadedFiles,
    localPreview,
    localPreviews,
    isUploading,
    error,
    handleUpload,
    handleRemove,
    reset,
  };
}
