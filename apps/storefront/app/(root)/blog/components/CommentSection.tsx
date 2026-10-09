"use client";

import { useState } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import {
  MessageCircle,
  Send,
  CornerDownRight,
  ChevronDown,
  ChevronUp,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import { addComment, addReply } from "./action";
import type { Reply, Comment } from "@/types/journal";

// ─── Helpers ──────────────────────────────────────────────────────────────────

function getInitials(name: string) {
  return name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);
}

function avatarSrc(url: string) {
  if (!url) return "";
  if (url.startsWith("http")) return url;
  return `${process.env.NEXT_PUBLIC_MEDIA_URL}${url}`;
}

function formatTimestamp(iso?: string): string {
  if (!iso) return "";
  const date = new Date(iso);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffSec = Math.floor(diffMs / 1000);
  const diffMin = Math.floor(diffSec / 60);
  const diffHr = Math.floor(diffMin / 60);
  const diffDay = Math.floor(diffHr / 24);

  if (diffSec < 60) return "just now";
  if (diffMin < 60) return `${diffMin}m ago`;
  if (diffHr < 24) return `${diffHr}h ago`;
  if (diffDay < 7) return `${diffDay}d ago`;

  return date.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: date.getFullYear() !== now.getFullYear() ? "numeric" : undefined,
  });
}

// ─── Reply Box ────────────────────────────────────────────────────────────────

function ReplyBox({
  onSubmit,
  onCancel,
}: {
  onSubmit: (text: string) => Promise<void>;
  onCancel: () => void;
}) {
  const [text, setText] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!text.trim()) return;
    setSubmitting(true);
    await onSubmit(text.trim());
    setText("");
    setSubmitting(false);
  };

  return (
    <form onSubmit={handleSubmit} className="mt-3 flex gap-2.5 items-start">
      <Avatar className="h-7 w-7 shrink-0 mt-0.5">
        <AvatarImage src="/placeholders/profile-placeholder.png" alt="You" />
        <AvatarFallback className="text-[9px] bg-primary/10 text-primary font-semibold">
          YO
        </AvatarFallback>
      </Avatar>
      <div className="flex-1 space-y-2">
        <Textarea
          autoFocus
          placeholder="Write a reply…"
          value={text}
          onChange={(e) => setText(e.target.value)}
          rows={2}
          className="resize-none text-sm bg-background"
        />
        <div className="flex items-center justify-end gap-2">
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={onCancel}
            className="h-7 text-xs text-muted-foreground"
          >
            Cancel
          </Button>
          <Button
            type="submit"
            size="sm"
            disabled={!text.trim() || submitting}
            className="h-7 text-xs gap-1"
          >
            <Send size={11} />
            {submitting ? "Posting…" : "Reply"}
          </Button>
        </div>
      </div>
    </form>
  );
}

// ─── Reply Item ───────────────────────────────────────────────────────────────

function ReplyItem({ reply }: { reply: Reply }) {
  return (
    <div className="flex gap-2.5 items-start">
      <Avatar className="h-7 w-7 shrink-0">
        <AvatarImage
          src={avatarSrc(reply.user.avatarUrl)}
          alt={reply.user.fullName}
        />
        <AvatarFallback className="text-[9px] bg-primary/10 text-primary font-semibold">
          {getInitials(reply.user.fullName)}
        </AvatarFallback>
      </Avatar>
      <div className="flex-1 bg-muted/30 border border-border/40 rounded-2xl rounded-tl-sm px-3.5 py-2.5">
        <div className="flex items-center justify-between gap-2 mb-1">
          <p className="text-[11px] font-semibold text-foreground">
            {reply.user.fullName}
          </p>
          {reply.createdAt && (
            <span className="text-[10px] text-muted-foreground/70 shrink-0">
              {formatTimestamp(reply.createdAt)}
            </span>
          )}
        </div>
        {/* Reply type uses "reply" field — matches API */}
        <p className="text-xs text-muted-foreground leading-relaxed">
          {reply.reply}
        </p>
      </div>
    </div>
  );
}

// ─── Comment Item ─────────────────────────────────────────────────────────────

function CommentItem({
  comment,
  journalId,
}: {
  comment: Comment;
  journalId: string;
}) {
  const [showReplyBox, setShowReplyBox] = useState(false);
  const [showReplies, setShowReplies] = useState(false);

  // Fix: async, closes box on success, keeps box open on error
  const handleReply = async (text: string) => {
    try {
      const res = await addReply(comment.id, text);
      if (res.success) {
        toast.success(res.message);
        setShowReplyBox(false); // ← close on success
        setShowReplies(true); // ← auto-expand replies so user sees it
      } else {
        toast.error(res.message);
        // box stays open so user can retry
      }
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "An error occurred");
    }
    void journalId;
  };

  const replyCount = comment.shopJournalCommentReplies?.length ?? 0;

  return (
    <div className="flex gap-3 items-start">
      {/* Avatar + thread line */}
      <div className="flex flex-col items-center shrink-0">
        <Avatar className="h-9 w-9">
          <AvatarImage
            src={avatarSrc(comment.user.avatarUrl)}
            alt={comment.user.fullName}
          />
          <AvatarFallback className="text-[9px] bg-primary/10 text-primary font-semibold">
            {getInitials(comment.user.fullName)}
          </AvatarFallback>
        </Avatar>
        {showReplies && replyCount > 0 && (
          <div className="w-px flex-1 mt-1.5 bg-border/60 min-h-4" />
        )}
      </div>

      {/* Content */}
      <div className="flex-1 min-w-0 pb-1">
        {/* Bubble */}
        <div className="bg-muted/40 border border-border/60 rounded-2xl rounded-tl-sm px-4 py-3">
          <div className="flex items-center justify-between gap-2 mb-1.5">
            <p className="text-xs font-semibold text-foreground">
              {comment.user.fullName}
            </p>
            {comment.createdAt && (
              <span className="text-[10px] text-muted-foreground/70 shrink-0">
                {formatTimestamp(comment.createdAt)}
              </span>
            )}
          </div>
          <p className="text-sm text-muted-foreground leading-relaxed">
            {comment.comment}
          </p>
        </div>

        {/* Action row */}
        <div className="flex items-center gap-3 mt-1.5 pl-1">
          <button
            type="button"
            onClick={() => setShowReplyBox((v) => !v)}
            className={cn(
              "flex items-center gap-1 text-[11px] font-medium transition-colors",
              showReplyBox
                ? "text-primary"
                : "text-muted-foreground hover:text-foreground",
            )}
          >
            <CornerDownRight size={11} />
            Reply
          </button>

          {replyCount > 0 && (
            <button
              type="button"
              onClick={() => setShowReplies((v) => !v)}
              className="flex items-center gap-1 text-[11px] font-medium text-muted-foreground hover:text-foreground transition-colors"
            >
              {showReplies ? (
                <ChevronUp size={11} />
              ) : (
                <ChevronDown size={11} />
              )}
              {replyCount} {replyCount === 1 ? "reply" : "replies"}
            </button>
          )}
        </div>

        {/* Inline reply input */}
        {showReplyBox && (
          <ReplyBox
            onSubmit={handleReply}
            onCancel={() => setShowReplyBox(false)}
          />
        )}

        {/* Replies list */}
        {showReplies && replyCount > 0 && (
          <div className="mt-3 space-y-3 pl-3 border-l-2 border-border/50 ml-1">
            {comment.shopJournalCommentReplies.map((r) => (
              <ReplyItem key={r.id} reply={r} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

// ─── Comment Section (exported) ───────────────────────────────────────────────

export function CommentSection({
  journalId,
  comments,
  totalCount,
}: {
  journalId: string;
  comments: Comment[];
  totalCount: number;
}) {
  const [text, setText] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!text.trim()) return;
    setSubmitting(true);

    try {
      const res = await addComment(journalId, text);
      if (res.success) {
        setText("");
        toast.success(res.message);
      } else {
        toast.error(res.message);
      }
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "An error occurred");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div
      id="comments"
      className="mt-4 bg-card border border-border rounded-2xl p-6 md:p-8"
    >
      {/* Header */}
      <div className="flex items-center gap-2 mb-6">
        <MessageCircle size={16} className="text-primary" />
        <span className="font-semibold text-foreground text-sm">Comments</span>
        <span className="text-xs text-muted-foreground bg-muted px-2 py-0.5 rounded-full">
          {Math.max(totalCount, comments.length)}
        </span>
      </div>

      {/* New comment input */}
      <form onSubmit={handleSubmit} className="mb-8 flex gap-3 items-start">
        <Avatar className="h-9 w-9 shrink-0 mt-0.5">
          <AvatarImage src="/placeholders/profile-placeholder.png" alt="You" />
          <AvatarFallback className="text-[9px] bg-primary/10 text-primary font-semibold">
            YOU
          </AvatarFallback>
        </Avatar>
        <div className="flex-1 space-y-2">
          <Textarea
            placeholder="Write a comment…"
            value={text}
            onChange={(e) => setText(e.target.value)}
            rows={3}
            className="resize-none text-sm"
          />
          <div className="flex justify-end">
            <Button
              type="submit"
              size="sm"
              disabled={!text.trim() || submitting}
              className="gap-1.5"
            >
              <Send size={13} />
              {submitting ? "Posting…" : "Post"}
            </Button>
          </div>
        </div>
      </form>

      {/* Divider */}
      {comments.length > 0 && <div className="border-t border-border mb-6" />}

      {/* Comment list */}
      <div className="space-y-6">
        {comments.length === 0 ? (
          <p className="text-center text-muted-foreground text-sm py-6">
            No comments yet. Be the first!
          </p>
        ) : (
          comments.map((c) => (
            <CommentItem key={c.id} comment={c} journalId={journalId} />
          ))
        )}
      </div>
    </div>
  );
}
