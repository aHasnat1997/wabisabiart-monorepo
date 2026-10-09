"use client";

import { useRef, useState, useCallback, useEffect } from "react";
import {
  Paperclip,
  Send,
  X,
  Loader2,
  CheckCircle2,
  ImageIcon,
} from "lucide-react";
import { Button } from "@/components/animate-ui/components/buttons/button";
import {
  InputGroup,
  InputGroupAddon,
  InputGroupInput,
} from "@/components/ui/input-group";
import Image from "next/image";
import { useFileUpload } from "@/components/uploadFile";
import { resolveImageUrl } from "@/lib/utils";

interface ChatInputProps {
  onSend: (content: string, attachments: string[]) => void;
  onTyping: (typing: boolean) => void;
  disabled?: boolean;
}

// ── Attachment preview chip ───────────────────────────────────────────────────
function AttachmentChip({
  localPreview,
  uploadedUrl,
  isUploading,
  onRemove,
}: {
  localPreview: string | null;
  uploadedUrl: string | null;
  isUploading: boolean;
  onRemove: () => void;
}) {
  const src = uploadedUrl ? resolveImageUrl(uploadedUrl) : localPreview;

  return (
    <div className="relative w-20 h-20 shrink-0 rounded-xl overflow-visible">
      <div className="w-full h-full rounded-xl overflow-hidden border-2 border-border bg-muted">
        {src ? (
          <Image
            src={src}
            alt="attachment"
            fill
            className="object-cover"
            sizes="80px"
            unoptimized
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <ImageIcon className="size-6 text-muted-foreground" />
          </div>
        )}
      </div>

      {/* uploading overlay */}
      {isUploading && (
        <div className="absolute inset-0 bg-black/50 rounded-xl flex items-center justify-center">
          <Loader2 className="size-5 text-white animate-spin" />
        </div>
      )}

      {/* done indicator */}
      {!isUploading && uploadedUrl && (
        <div className="absolute bottom-1 right-1 bg-green-500 rounded-full p-0.5 shadow">
          <CheckCircle2 className="size-3 text-white" />
        </div>
      )}

      {/* remove button */}
      <button
        type="button"
        onClick={onRemove}
        className="absolute -top-2 -right-2 w-5 h-5 bg-destructive text-white rounded-full flex items-center justify-center hover:bg-destructive/80 z-10 shadow-md transition-colors"
      >
        <X className="size-3" />
      </button>
    </div>
  );
}

// ── SlotUploader ──────────────────────────────────────────────────────────────
function SlotUploader({
  index,
  pendingFile,
  onUploaded,
  onRemoved,
  onUploadingChange,
}: {
  index: number;
  pendingFile: File | null;
  onUploaded: (idx: number, url: string) => void;
  onRemoved: (idx: number) => void;
  onUploadingChange: (idx: number, uploading: boolean) => void;
}) {
  const {
    uploadedFile,
    localPreview,
    isUploading,
    handleUpload,
    handleRemove,
  } = useFileUpload({ onUpload: (url) => onUploaded(index, url) });

  useEffect(() => {
    if (!pendingFile) return;
    const dt = new DataTransfer();
    dt.items.add(pendingFile);
    handleUpload({
      target: { files: dt.files },
    } as React.ChangeEvent<HTMLInputElement>);
  }, [pendingFile]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    onUploadingChange(index, isUploading);
  }, [isUploading, index, onUploadingChange]);

  const handleRemoveSlot = async () => {
    await handleRemove();
    onRemoved(index);
  };

  return (
    <AttachmentChip
      localPreview={localPreview}
      uploadedUrl={uploadedFile?.url ?? null}
      isUploading={isUploading}
      onRemove={handleRemoveSlot}
    />
  );
}

// ── Main ChatInput ────────────────────────────────────────────────────────────
export function ChatInput({ onSend, onTyping, disabled }: ChatInputProps) {
  const [messageText, setMessageText] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [slotCount, setSlotCount] = useState(0);
  const [pendingFiles, setPendingFiles] = useState<Record<number, File>>({});
  const [uploadedUrls, setUploadedUrls] = useState<Record<number, string>>({});
  const [uploadingSlots, setUploadingSlots] = useState<Record<number, boolean>>(
    {},
  );

  const MAX = 5;

  const handleUploaded = useCallback((idx: number, url: string) => {
    setUploadedUrls((prev) => ({ ...prev, [idx]: url }));
  }, []);

  const handleRemoved = useCallback((idx: number) => {
    setSlotCount((prev) => Math.max(0, prev - 1));
    setUploadedUrls((prev) => {
      const next: Record<number, string> = {};
      Object.entries(prev).forEach(([k, v]) => {
        const ki = parseInt(k);
        if (ki < idx) next[ki] = v;
        else if (ki > idx) next[ki - 1] = v;
      });
      return next;
    });
    setPendingFiles((prev) => {
      const next: Record<number, File> = {};
      Object.entries(prev).forEach(([k, v]) => {
        const ki = parseInt(k);
        if (ki < idx) next[ki] = v;
        else if (ki > idx) next[ki - 1] = v;
      });
      return next;
    });
    setUploadingSlots((prev) => {
      const next: Record<number, boolean> = {};
      Object.entries(prev).forEach(([k, v]) => {
        const ki = parseInt(k);
        if (ki < idx) next[ki] = v;
        else if (ki > idx) next[ki - 1] = v;
      });
      return next;
    });
  }, []);

  const handleUploadingChange = useCallback(
    (idx: number, uploading: boolean) => {
      setUploadingSlots((prev) => ({ ...prev, [idx]: uploading }));
    },
    [],
  );

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files ?? []);
    if (!files.length) return;
    const canAdd = Math.min(files.length, MAX - slotCount);
    if (canAdd <= 0) return;
    const newPending: Record<number, File> = {};
    for (let i = 0; i < canAdd; i++) newPending[slotCount + i] = files[i];
    setPendingFiles((prev) => ({ ...prev, ...newPending }));
    setSlotCount((prev) => prev + canAdd);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const handleSend = () => {
    const text = messageText.trim();
    const attachments = Object.values(uploadedUrls).filter(Boolean);
    if (!text && attachments.length === 0) return;
    onSend(text, attachments);
    setMessageText("");
    setSlotCount(0);
    setPendingFiles({});
    setUploadedUrls({});
    setUploadingSlots({});
    onTyping(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const anyUploading = Object.values(uploadingSlots).some(Boolean);
  const canSend =
    (messageText.trim().length > 0 || slotCount > 0) && !anyUploading;
  const hasAttachments = slotCount > 0;

  return (
    <div className="relative">
      {/* ── Floating attachment popup — input এর উপরে ── */}
      {hasAttachments && (
        <div className="absolute bottom-full left-0 right-0 mb-2 mx-0">
          <div className="bg-background border border-border rounded-2xl shadow-xl p-3">
            {/* header */}
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-medium text-muted-foreground">
                {slotCount} attachment{slotCount > 1 ? "s" : ""}
                {anyUploading && (
                  <span className="ml-2 text-primary inline-flex items-center gap-1">
                    <Loader2 className="size-3 animate-spin" /> uploading...
                  </span>
                )}
              </span>
              {slotCount < MAX && (
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="text-xs text-primary hover:underline flex items-center gap-1"
                >
                  <Paperclip className="size-3" />
                  Add more
                </button>
              )}
            </div>

            {/* previews */}
            <div className="flex gap-3 flex-wrap">
              {Array.from({ length: slotCount }).map((_, idx) => (
                <SlotUploader
                  key={idx}
                  index={idx}
                  pendingFile={pendingFiles[idx] ?? null}
                  onUploaded={handleUploaded}
                  onRemoved={handleRemoved}
                  onUploadingChange={handleUploadingChange}
                />
              ))}
            </div>
          </div>

          {/* little arrow pointing down */}
          <div className="flex justify-start pl-6">
            <div className="w-3 h-3 bg-background border-r border-b border-border rotate-45 -mt-1.5 shadow" />
          </div>
        </div>
      )}

      {/* ── Input row ── */}
      <div className="flex items-center gap-2">
        <input
          ref={fileInputRef}
          type="file"
          accept=".png,.jpg,.jpeg,.gif,.webp,.pdf"
          multiple
          className="hidden"
          onChange={handleFileChange}
          disabled={disabled || slotCount >= MAX}
        />

        <InputGroup className="flex-1 bg-card">
          <InputGroupInput
            placeholder="Type your message..."
            value={messageText}
            onChange={(e) => {
              setMessageText(e.target.value);
              onTyping(e.target.value.length > 0);
            }}
            onKeyDown={handleKeyDown}
            disabled={disabled}
          />
          <InputGroupAddon
            className={`cursor-pointer transition-colors ${
              hasAttachments ? "text-primary" : "hover:text-primary"
            } ${slotCount >= MAX ? "opacity-40 cursor-not-allowed" : ""}`}
            align="inline-end"
            onClick={() => slotCount < MAX && fileInputRef.current?.click()}
          >
            <div className="relative">
              <Paperclip className="w-4 h-4" />
              {/* badge */}
              {slotCount > 0 && (
                <span className="absolute -top-2 -right-2 w-4 h-4 bg-primary text-primary-foreground rounded-full text-[9px] flex items-center justify-center font-bold">
                  {slotCount}
                </span>
              )}
            </div>
          </InputGroupAddon>
        </InputGroup>

        <Button onClick={handleSend} disabled={!canSend || disabled}>
          <Send className="w-4 h-4" />
          Send
        </Button>
      </div>
    </div>
  );
}
