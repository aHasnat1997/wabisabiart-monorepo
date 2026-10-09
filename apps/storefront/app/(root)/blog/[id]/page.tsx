import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Clock, BookOpen, Lightbulb, ArrowLeft, Newspaper } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import { LikeButton } from "../components/LikeButton";
import { CommentSection } from "../components/CommentSection";
import { ShareButton } from "../components/ShareButton";
import { getJournalById } from "../components/action";
import HtmlRenderer from "@/components/htmlRenderer";
import type { Comment } from "@/types/journal";

// ─── Helpers ──────────────────────────────────────────────────────────────────

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric",
  });
}

function readingTime(content: string) {
  const words = content.replace(/<[^>]+>/g, "").split(/\s+/).length;
  return `${Math.ceil(words / 200)} min read`;
}

function getInitials(name: string) {
  return name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);
}

// ─── Post Tips Sidebar Card ───────────────────────────────────────────────────

const POST_TIPS = [
  "Share your creative process and inspiration",
  "Include behind-the-scenes photos or videos",
  "Engage with customers by telling your story",
  "Regular posts help build trust and authenticity",
];

function PostTipsCard() {
  return (
    <div className="bg-muted/50 border border-border rounded-2xl p-5">
      <div className="flex items-center gap-2 mb-4">
        <Lightbulb size={16} className="text-primary" />
        <span className="font-semibold text-sm text-foreground">Post Tips</span>
      </div>
      <ul className="space-y-2.5">
        {POST_TIPS.map((tip) => (
          <li
            key={tip}
            className="flex items-start gap-2 text-xs text-muted-foreground leading-relaxed"
          >
            <span className="mt-1 h-1 w-1 rounded-full bg-primary shrink-0" />
            {tip}
          </li>
        ))}
      </ul>
    </div>
  );
}

// ─── Browse Journal Card (replaces MoreFromJournalCard) ───────────────────────

function BrowseJournalCard() {
  return (
    <div className="bg-card border border-border rounded-2xl p-5">
      <div className="flex items-center gap-2 mb-3">
        <Newspaper size={15} className="text-primary" />
        <span className="font-semibold text-sm text-foreground">
          Explore the Journal
        </span>
      </div>
      <p className="text-xs text-muted-foreground leading-relaxed mb-4">
        Discover more stories, local news, and community voices from our
        journal. New articles are published regularly.
      </p>
      <Link
        href="/blog"
        className="flex items-center justify-center gap-2 w-full rounded-xl border border-border bg-muted/50 hover:bg-muted transition-colors px-4 py-2.5 text-sm font-medium text-foreground"
      >
        <BookOpen size={14} />
        Browse all articles
      </Link>
    </div>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default async function JournalDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const journal = await getJournalById(id);
  if (!journal) notFound();

  const author = journal.shop?.user ?? null;
  const shopName = journal.shop?.shopName ?? null;
  const shareUrl = `${process.env.NEXT_PUBLIC_APP_URL}/blog/${journal.id}`;

  return (
    <div className="px-4 py-8">
      {/* ── Back button ─────────────────────────────────────────────────── */}
      <Link
        href="/blog"
        className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors mb-6 group"
      >
        <ArrowLeft
          size={15}
          className="group-hover:-translate-x-0.5 transition-transform"
        />
        Back to Journal
      </Link>

      <div className="flex flex-col lg:flex-row gap-8 items-start">
        {/* ── Main Article ──────────────────────────────────────────────── */}
        <article className="flex-1 min-w-0">
          <div className="bg-card border border-border rounded-2xl overflow-hidden">
            {/* Banner */}
            <div className="relative h-64 md:h-96 w-full overflow-hidden">
              <Image
                src={`${process.env.NEXT_PUBLIC_MEDIA_URL}/${journal.bannerImage}`}
                alt={journal?.title}
                fill
                className="object-cover"
                priority
              />
            </div>

            <div className="p-6 md:p-8">
              {/* Meta row */}
              <div className="flex items-center gap-4 text-xs text-muted-foreground mb-4">
                <span>{formatDate(journal?.createdAt)}</span>
                <span className="flex items-center gap-1">
                  <Clock size={11} />
                  {readingTime(journal.content)}
                </span>
                <Badge className="capitalize">{journal.postStatus}</Badge>
              </div>

              {/* Title */}
              <h1 className="text-foreground text-2xl md:text-3xl font-bold leading-tight mb-6">
                {journal?.title}
              </h1>

              {/* Author chip — from shop.user */}
              {author && (
                <div className="flex items-center gap-3 bg-muted/50 rounded-xl px-4 py-3 mb-6">
                  <Avatar className="h-9 w-9">
                    <AvatarImage
                      src={`${process.env.NEXT_PUBLIC_MEDIA_URL}${author.avatarUrl}`}
                      alt={author.fullName}
                    />
                    <AvatarFallback className="text-xs">
                      {getInitials(author.fullName)}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="text-sm font-semibold text-foreground leading-none">
                      {author.fullName}
                    </p>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      {shopName}
                    </p>
                  </div>
                </div>
              )}

              {/* Short excerpt pull-quote */}
              <blockquote className="border-l-4 border-primary pl-4 py-1 mb-6 bg-primary/5 rounded-r-lg">
                <p className="text-sm text-muted-foreground leading-relaxed italic">
                  {journal.shortExcerpt}
                </p>
              </blockquote>

              {/* HTML Content */}
              <HtmlRenderer html={journal.content ?? ""} />

              <Separator className="my-4" />

              {/* Footer actions */}
              <div className="flex items-center justify-between">
                <LikeButton
                  journalId={journal.id}
                  initialLiked={journal.isLikedByCurrentUser}
                  initialCount={journal._count.shopJournalLikes}
                />
                <ShareButton url={shareUrl} title={journal.title} />
              </div>
            </div>
          </div>

          {/* ── Comments ───────────────────────────────────────────────── */}
          <CommentSection
            journalId={journal.id}
            comments={journal.shopJournalComments ?? ([] as Comment[])}
            totalCount={journal._count.shopJournalComments}
          />
        </article>

        {/* ── Sticky Sidebar ────────────────────────────────────────────── */}
        <aside className="w-full lg:w-84 shrink-0 lg:sticky lg:top-8 space-y-4">
          {/* About the Author */}
          {author && (
            <div className="bg-card border border-border rounded-2xl p-5">
              <p className="text-sm font-semibold text-foreground mb-4">
                About the Author
              </p>
              <div className="flex flex-col items-center text-center gap-2">
                <Avatar className="h-16 w-16">
                  <AvatarImage
                    src={`${process.env.NEXT_PUBLIC_MEDIA_URL}${author.avatarUrl}`}
                    alt={author.fullName}
                  />
                  <AvatarFallback>
                    {getInitials(author.fullName)}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <p className="font-semibold text-sm text-foreground">
                    {author.fullName}
                  </p>
                  <p className="text-xs text-primary mt-0.5">{shopName}</p>
                </div>
              </div>
            </div>
          )}

          <PostTipsCard />
          <BrowseJournalCard />
        </aside>
      </div>
    </div>
  );
}
