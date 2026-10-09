import Image from "next/image";
import Link from "next/link";
import { MessageCircle, Clock, ArrowUpRight } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { LikeButton } from "./LikeButton";
import { JournalListItem } from "@/types/journal";
import defaultImage from "@/assets/images/defaultimage.png";
import { resolveImageUrl } from "@/lib/utils";

// ─── Helpers ──────────────────────────────────────────────────────────────────

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric",
  });
}

function readingTime(content?: string) {
  const safeContent = content ?? "";
  const words = safeContent.replace(/<[^>]+>/g, "").split(/\s+/).length;
  return `${Math.ceil(words / 200)} min read`;
}

function stripHtml(html?: string) {
  return (html ?? "").replace(/<[^>]+>/g, "");
}

// ─── Component ──────────────────────────────────

export function BlogCard({ journal }: { journal: JournalListItem }) {
  return (
    <div className="group block">
      <div className="bg-card border border-border rounded-2xl overflow-hidden hover:shadow-lg hover:-translate-y-0.5 transition-all duration-300">
        {/* Image */}
        <Link href={`/blog/${journal.id}`} className="block">
          <div className="relative h-48 overflow-hidden">
            <Image
              src={
                journal.bannerImage
                  ? `${resolveImageUrl(journal.bannerImage)}`
                  : defaultImage
              }
              alt={journal.title || "Journal Image"}
              fill
              className="object-cover group-hover:scale-105 transition-transform duration-500"
            />
            <div className="absolute top-3 left-3">
              <Badge className="capitalize">{journal.postStatus}</Badge>
            </div>
          </div>
        </Link>

        {/* Body */}
        <div className="p-4 space-y-3 flex flex-col justify-between h-53">
          <Link href={`/blog/${journal.id}`} className="block space-y-3">
            {/* Meta */}
            <div className="flex items-center gap-3 text-xs text-muted-foreground">
              <span className="flex items-center gap-1">
                <Clock size={11} />
                {readingTime(journal.shortExcerpt)}
              </span>
              <span>·</span>
              <span>{formatDate(journal.createdAt)}</span>
            </div>

            {/* Title */}
            <h3 className="text-foreground font-semibold text-base leading-snug line-clamp-1 group-hover:text-primary transition-colors">
              {journal.title}
            </h3>

            {/* Excerpt */}
            <p className="text-muted-foreground text-sm text-justify line-clamp-3 leading-relaxed">
              {stripHtml(journal.shortExcerpt)}
            </p>
          </Link>

          {/* Footer */}
          <div className="flex items-center justify-between pt-2 border-t border-border">
            <div className="flex items-center gap-1">
              {/* Client island — only this re-renders on like */}
              <LikeButton
                journalId={journal.id}
                initialLiked={journal.isLikedByCurrentUser}
                initialCount={journal._count.shopJournalLikes}
              />

              {/* Comments count — static, stays on server */}
              <Link
                href={`/blog/${journal.id}#comments`}
                className="flex items-center gap-1 px-2 text-xs text-muted-foreground hover:text-foreground"
              >
                <MessageCircle size={13} />
                {journal._count.shopJournalComments}
              </Link>
            </div>

            <Link href={`/blog/${journal.id}`}>
              <ArrowUpRight
                size={15}
                className="text-muted-foreground group-hover:text-primary group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-all"
              />
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
