import { Button } from "@/components/ui/button";
import { Journal } from "@/types/sellerDashboard/JournalsItems";
import { Edit, Eye, MessageSquare } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { getJournalPost } from "./JournalAction";
import { getImageUrl } from "../../products/components/getImageUrl";
import JournalDeleteButton from "./JournalDeleteButton";

const formatDate = (dateString: string) => {
  return new Date(dateString).toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
};

const JournalsCard = async () => {
  let posts: Journal[] = [];

  try {
    posts = await getJournalPost();
  } catch {
    posts = [];
  }

  return (
    <div className="bg-card rounded-xl p-4 md:p-6 space-y-6 shadow-sm">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h2 className="text-lg font-semibold">My Posts</h2>
          <p className="text-sm text-muted-foreground">
            {posts.length} published posts
          </p>
        </div>
        <Link href="?journal-post-create-modal=journal-post">
          <Button className="bg-primary cursor-pointer text-card text-sm w-full sm:w-auto">
            + Create Post
          </Button>
        </Link>
      </div>

      {/* Empty State */}
      {posts.length === 0 && (
        <div className="text-center py-12 text-muted-foreground text-sm">
          No posts yet. Create your first post!
        </div>
      )}

      {/* Post List */}
      <div className="space-y-4">
        {posts.map((post) => (
          <div
            key={post.id}
            className="flex flex-col sm:flex-row items-start justify-between gap-4 rounded-lg bg-muted/40 p-4"
          >
            {/* Image */}
            {post.bannerImage && (
              <div className="shrink-0 w-full sm:w-24 h-24 relative rounded-md overflow-hidden">
                <Image
                  src={getImageUrl(post.bannerImage)}
                  alt={post.title ?? "Post Image"}
                  fill
                  unoptimized
                  className="object-cover"
                />
              </div>
            )}

            {/* Content */}
            <div className="flex-1 min-w-0">
              <h3 className="font-medium text-sm md:text-base line-clamp-2">
                {post.title}
              </h3>
              <p className="text-sm text-muted-foreground line-clamp-2 mt-1">
                {post.shortExcerpt}
              </p>
              <div className="flex flex-wrap items-center gap-3 mt-2">
                <p className="text-xs text-muted-foreground">
                  {formatDate(post.createdAt)}
                </p>
                <span
                  className={`text-xs font-medium capitalize px-2 py-0.5 rounded-full ${
                    post.postStatus === "publishing_request"
                      ? "bg-muted text-muted-foreground"
                      : "bg-primary/30 text-primary"
                      
                  }`}
                >
                  {post.postStatus === "publishing_request"
                    ? "publishing request"
                    : "published"}
                </span>
              </div>
            </div>

            {/* Actions + Stats */}
            <div className="flex flex-row sm:flex-col items-center sm:items-end justify-between sm:justify-start gap-3 w-full sm:w-auto">
              {/* Action Buttons */}
              <div className="flex gap-2">
                <Link
                  href={`?journal-preview-modal=journal-preview&id=${post.id}`}
                >
                  <Button
                    size="icon"
                    variant="ghost"
                    className="text-muted-foreground hover:text-white h-8 w-8"
                  >
                    <Eye className="w-4 h-4" />
                  </Button>
                </Link>

                <Link
                  href={`?journal-post-edit-modal=journal-edit&id=${post.id}`}
                >
                  <Button
                    size="icon"
                    variant="ghost"
                    className="text-muted-foreground hover:text-white h-8 w-8"
                  >
                    <Edit className="w-4 h-4" />
                  </Button>
                </Link>

                <JournalDeleteButton id={post.id} />
              </div>

              {/* Stats */}
             <div className="flex items-center gap-3">
               {/* <span className="flex items-center gap-1 cursor-pointer text-xs text-muted-foreground">
                <Heart className="w-4 h-4" />
                {post._count?.shopJournalLikes ?? 0}
              </span> */}
              <Link
                  href={`?journal-post-comments-modal=journal-comment&id=${post.id}`}
                >
               <Button className="flex items-center bg-primary/40 text-white gap-1 text-xs cursor-pointer">
          <MessageSquare className="w-4 h-4" />
          {post._count?.shopJournalComments ?? 0} Comments
        </Button>
        </Link>
             </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default JournalsCard;
