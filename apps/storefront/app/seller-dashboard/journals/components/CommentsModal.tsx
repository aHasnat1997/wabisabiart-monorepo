"use client";

import { useState } from "react";
import { toast } from "sonner";
import { 
  MessageSquareOff, Send, Loader2, Trash2, 
  CornerDownRight, MoreVertical 
} from "lucide-react";

import { CommentReply, Journal, JournalCommentRaw, PostComment } from "@/types/sellerDashboard/JournalsItems";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { 
  DropdownMenu, DropdownMenuContent, 
  DropdownMenuItem, DropdownMenuTrigger 
} from "@/components/ui/dropdown-menu";

// Server Actions & Types
import { 
  postJournalComment, 
  deleteJournalComment, 
  postJournalReply, 
  deleteJournalReply,
} from "./JournalAction";

type Props = { post: Journal; };

// ─── Helpers ────────────────
const PALETTE = ["bg-emerald-500", "bg-blue-500", "bg-pink-500", "bg-orange-500", "bg-violet-500", "bg-teal-500"];
const avatarBg = (name: string) => PALETTE[(name?.charCodeAt(0) ?? 65) % PALETTE.length];
const getInitials = (name: string) => name.trim().split(" ").map((n) => n[0]).join("").toUpperCase().slice(0, 2);
const timeAgo = (dateStr: string) => {
  if (!dateStr) return "";
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return "just now";
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  return `${Math.floor(hrs / 24)}d ago`;
};

// ─── Main Component 
const CommentsModal = ({ post }: Props) => {
  const normalizeComment = (c: JournalCommentRaw): PostComment => ({
    id: c.id,
    userId: c.userId,
    journalId: c.journalId,
    comment: c.comment ?? "",
    createdAt: c.createdAt ?? new Date().toISOString(),
    user: c.user,
    shopJournalCommentReplies: (c.shopJournalCommentReplies ?? []).map((r) => ({
    id: r.id,
    userId: r.userId,
    commentId: r.commentId,
    reply: r.reply ?? "",
    createdAt: r.createdAt ?? new Date().toISOString(),
    user: r.user,
    })),
  });

  const initialComments: PostComment[] = (post.shopJournalComments ?? []).map(normalizeComment);

  const [comments, setComments] = useState<PostComment[]>(initialComments);
  const [newComment, setNewComment] = useState<string>("");
  const [isPosting, setIsPosting] = useState<boolean>(false);
  const [replyingTo, setReplyingTo] = useState<string | null>(null);
  const [replyText, setReplyText] = useState<string>("");

  if (!post) return null;

  // --- Actions ---
  const handleAddComment = async () => {
    if (!newComment.trim() || isPosting) return;
    setIsPosting(true);
    try {
      const res: PostComment = await postJournalComment(post.id, newComment.trim());
      setComments((prev) => [res, ...prev]);
      setNewComment("");
      toast.success("Comment added!");
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (error: any) {
      toast.error(error.message || "Failed to post");
    } finally { setIsPosting(false); }
  };

  const handleDeleteComment = async (commentId: string) => {
    try {
      await deleteJournalComment(commentId);
      setComments((prev) => prev.filter(c => c.id !== commentId));
      toast.success("Comment deleted");
    } catch { toast.error("Failed to delete"); }
  };

  const handleAddReply = async (commentId: string) => {
    if (!replyText.trim() || isPosting) return;
    setIsPosting(true);
    try {
      const res: CommentReply = await postJournalReply(commentId, replyText.trim());
      setComments(prev => prev.map((c: PostComment) => {
        if (c.id === commentId) {
          return { 
            ...c, 
            shopJournalCommentReplies: [...(c.shopJournalCommentReplies || []), res] 
          };
        }
        return c;
      }));
      setReplyText("");
      setReplyingTo(null);
      toast.success("Reply added!");
    } catch { toast.error("Failed to reply"); }
    finally { setIsPosting(false); }
  };

  const handleDeleteReply = async (commentId: string, replyId: string) => {
    try {
      await deleteJournalReply(replyId);
      setComments(prev => prev.map((c: PostComment) => {
        if (c.id === commentId) {
          return { 
            ...c, 
            shopJournalCommentReplies: (c.shopJournalCommentReplies ?? []).filter((r: CommentReply) => r.id !== replyId),
          };
        }
        return c;
      }));
      toast.success("Reply deleted");
    } catch {
      toast.error("Failed to delete reply");
    }
  };

  return (
    <div className="flex flex-col h-[85vh] w-full  rounded-xl overflow-hidden">
      {/* HEADER */}
      <div className="p-4 border-b bg-card shrink-0 flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold tracking-tight">Comments</h2>
          <p className="text-xs text-muted-foreground">{comments.length}  this post</p>
        </div>
      </div>

      {/* SCROLLABLE CONTENT */}
      <ScrollArea className="flex-1 px-4 h-96 py-6 bg-muted/5">
        {comments.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-muted-foreground">
            <MessageSquareOff className="w-12 h-12 opacity-10 mb-4" />
            <p className="font-medium">No comments yet. Start the buzz!</p>
          </div>
        ) : (
          <div className="flex flex-col gap-8 mb-4">
            {comments.map((c: PostComment) => {
              const cName = c.user?.fullName || "User";
              return (
                <div key={c.id} className="group flex flex-col gap-3">
                  <div className="flex gap-3">
                    <Avatar className="w-10 h-10 shrink-0 border shadow-sm">
                      <AvatarImage src={c.user?.avatarUrl} />
                      <AvatarFallback className={`text-xs font-bold text-white ${avatarBg(cName)}`}>
                        {getInitials(cName)}
                      </AvatarFallback>
                    </Avatar>

                    <div className="flex-1 min-w-0 space-y-1">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-bold text-foreground">{cName}</span>
                          <span className="text-[10px] text-muted-foreground">{timeAgo(c.createdAt)}</span>
                        </div>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon" className="h-8 w-8 opacity-0 group-hover:opacity-100 transition-opacity">
                              <MoreVertical className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem 
                              className="text-destructive flex gap-2 cursor-pointer"
                              onClick={() => handleDeleteComment(c.id)}
                            >
                              <Trash2 className="h-4 w-4" /> Delete
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                      
                      <div className="bg-background border rounded-2xl rounded-tl-none px-4 py-3 shadow-sm">
                        <p className="text-sm text-foreground/90 leading-relaxed">{c.comment}</p>
                      </div>

                      <div className="flex items-center gap-4 mt-1 ml-1">
                        <button 
                          onClick={() => setReplyingTo(replyingTo === c.id ? null : c.id)}
                          className="text-[11px] font-bold text-primary hover:underline"
                        >
                          Reply
                        </button>
                      </div>

                      {/* REPLIES LIST */}
                      <div className="space-y-4">
                        {c.shopJournalCommentReplies?.map((r: CommentReply) => {
                          const rName = r.user?.fullName || "User";
                          return (
                            <div key={r.id} className="flex gap-2 mt-4 ml-2">
                              <CornerDownRight className="w-4 h-4 text-muted-foreground/30 shrink-0 mt-2" />
                              <Avatar className="w-7 h-7 shrink-0 border">
                                <AvatarFallback className={`text-[10px] font-bold text-white ${avatarBg(rName)}`}>
                                  {getInitials(rName)}
                                </AvatarFallback>
                              </Avatar>
                              <div className="flex-1 bg-muted/30 border rounded-xl px-3 py-2 group/reply">
                                <div className="flex items-center justify-between gap-2 mb-1">
                                  <span className="text-xs font-bold">{rName}</span>
                                  <button onClick={() => handleDeleteReply(c.id, r.id)} className="opacity-0 group-hover/reply:opacity-100 transition-opacity">
                                    <Trash2 className="h-3 w-3 text-muted-foreground hover:text-destructive" />
                                  </button>
                                </div>
                                <p className="text-xs text-muted-foreground">{r.reply}</p>
                              </div>
                            </div>
                          );
                        })}
                      </div>

                      {/* REPLY INPUT */}
                      {replyingTo === c.id && (
                        <div className="flex gap-2 mt-3 ml-6">
                          <Input 
                            autoFocus
                            placeholder="Write a reply..." 
                            value={replyText}
                            onChange={(e) => setReplyText(e.target.value)}
                            onKeyDown={(e) => e.key === "Enter" && handleAddReply(c.id)}
                            className="h-8 text-xs rounded-full"
                          />
                          <Button size="sm" className="h-8 rounded-full px-3" onClick={() => handleAddReply(c.id)}>
                            {isPosting ? <Loader2 className="w-3 h-3 animate-spin" /> : <Send className="w-3 h-3" />}
                          </Button>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </ScrollArea>

      {/* FIXED FOOTER INPUT */}
      <div className="p-4 border-t bg-card shrink-0">
        <div className="flex items-center gap-3 max-w-3xl mx-auto">
          <Avatar className="w-9 h-9 shrink-0 border hidden sm:flex">
            <AvatarFallback className="bg-primary/5 text-primary text-[10px] font-black">YOU</AvatarFallback>
          </Avatar>
          <div className="relative flex-1">
            <Input 
              placeholder="Add a comment..." 
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleAddComment()}
              className="pr-12 h-12 rounded-full bg-muted/40 border-none focus-visible:ring-1 transition-all"
              disabled={isPosting}
            />
            <Button 
              size="icon"
              onClick={handleAddComment}
              disabled={!newComment.trim() || isPosting}
              className="absolute right-1.5 top-1.5 h-9 w-9 rounded-full shadow-sm"
            >
              {isPosting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CommentsModal;