"use client";
import { Journal } from "@/types/sellerDashboard/JournalsItems";
import { getImageUrl } from "../../products/components/getImageUrl";
import {  Heart, MessageSquare, Calendar, CheckCircle, Clock } from "lucide-react";
import Image from "next/image";
import { useState } from "react";
import { likeUnlikeJournal } from "./JournalAction";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";

type Props = {
  post: Journal;
};

const formatDate = (dateString: string) => {
  return new Date(dateString).toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
};

const JournalPreviewModal = ({ post }: Props) => {
  
  const [liked, setLiked] = useState(false);
  const [likeCount, setLikeCount] = useState(post._count?.shopJournalLikes ?? 0);
  const [liking, setLiking] = useState(false);

  const handleLike = async () => {
    try {
      setLiking(true);
      const action = liked ? "unlike" : "like";
      await likeUnlikeJournal(post.id, action);
      setLiked(!liked);
      setLikeCount((prev) => (liked ? prev - 1 : prev + 1));
    } catch {
      // silent
    } finally {
      setLiking(false);
    }
  };

  return (
    <ScrollArea>
        <div className="w-full   p-1 md:p-2">
      {/* Header */}
      <div className="flex items-start justify-between gap-4 mb-4">
        <div className="flex-1">
          <h2 className="text-xl font-semibold leading-snug">{post.title}</h2>
          <div className="flex flex-wrap items-center gap-3 mt-2">
            <span className="flex items-center gap-1 text-xs text-muted-foreground">
              <Calendar className="w-3 h-3" />
              {formatDate(post.createdAt)}
            </span>
            <span
              className={`flex items-center gap-1 text-xs font-medium px-2 py-0.5 rounded-full ${
                post.postStatus === "publishing_request"
                  ? "bg-muted text-muted-foreground"
                  : "bg-primary/20 text-primary"
              }`}
            >
              {post.postStatus === "publishing_request" ? (
                <><CheckCircle className="w-3 h-3" />Publishing request</>
              ) : (
                <><Clock className="w-3 h-3" /> Published</>
              )}
            </span>
            {post.approved && (
              <span className="text-xs font-medium px-2 py-0.5 rounded-full bg-chart-8/20 text-chart-8">
                Approved
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Banner Image */}
      {post.bannerImage && (
        <div className="relative w-full h-52 rounded-xl overflow-hidden mb-4">
          <Image
            src={getImageUrl(post.bannerImage)}
            alt={post.title}
            fill
            unoptimized
            className="object-cover"
          />
        </div>
      )}

      {/* Short Excerpt */}
      {post.shortExcerpt && (
        <p className="text-sm text-muted-foreground italic border-l-4 border-primary/40 pl-3 mb-4">
          {post.shortExcerpt}
        </p>
      )}

      {/* Content */}
      <div
        className="prose prose-sm max-w-none text-foreground"
        dangerouslySetInnerHTML={{ __html: post.content }}
      />

      {/* Footer Stats */}
      <div className="flex items-center gap-4 mt-6 pt-4 border-t text-xs text-muted-foreground">
        <Button
          variant="ghost"
          size="sm"
          disabled={liking}
          onClick={handleLike}
          className={`flex items-center gap-1 px-2 h-7 ${
            liked ? "text-destructive" : "text-muted-foreground"
          }`}
        >
          <Heart className={`w-4 h-4 ${liked ? "fill-destructive" : ""}`} />
          {likeCount} Likes
        </Button>

        <span className="flex items-center gap-1">
          <MessageSquare className="w-4 h-4" />
          {post._count?.shopJournalComments ?? 0} Comments
        </span>
      </div>
    </div>
    </ScrollArea>
  );
};

export default JournalPreviewModal;