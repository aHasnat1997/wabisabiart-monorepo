"use client";
import { useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import { Journal } from "@/types/sellerDashboard/JournalsItems";
import { getJournalById } from "./JournalAction";
import CreatePostDialog from "./CreatePostDialog";

const JournalEditWrapper = () => {
  const searchParams = useSearchParams();
  const id = searchParams.get("id");
  const [post, setPost] = useState<Journal | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!id) return;
    const fetchPost = async () => {
      try {
        const data = await getJournalById(id);
        setPost(data);
      } catch {
        // handle error
      } finally {
        setLoading(false);
      }
    };
    fetchPost();
  }, [id]);

  if (loading) return <p className="p-4 text-sm text-muted-foreground">Loading...</p>;
  if (!post) return <p className="p-4 text-sm text-destructive">Post not found</p>;

  return <CreatePostDialog mode="edit" post={post} />;
};

export default JournalEditWrapper;