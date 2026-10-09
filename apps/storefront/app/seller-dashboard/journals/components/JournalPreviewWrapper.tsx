"use client";
import { useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import { Journal } from "@/types/sellerDashboard/JournalsItems";
import { getJournalById } from "./JournalAction";
import JournalPreviewModal from "./JournalPreviewModal";


const JournalPreviewWrapper = () => {
  const searchParams = useSearchParams();
  const id = searchParams.get("id");
  const [post, setPost] = useState<Journal | null>(null);

  useEffect(() => {
    if (!id) return;
    getJournalById(id).then(setPost).catch(console.error);
  }, [id]);

  if (!post) return (
    <div className="flex items-center justify-center py-12 text-sm text-muted-foreground">
      Loading...
    </div>
  );

  return <JournalPreviewModal post={post} />;
};

export default JournalPreviewWrapper;