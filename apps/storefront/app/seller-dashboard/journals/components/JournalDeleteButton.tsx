"use client";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Trash2 } from "lucide-react";
import { toast } from "sonner";
import { deleteJournalPost } from "./JournalAction";

const JournalDeleteButton = ({ id }: { id: string }) => {
  const [isDeleting, setIsDeleting] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  const handleDelete = async () => {
    try {
      setIsDeleting(true);
      await deleteJournalPost(id);
      toast("Post deleted successfully ✅");
    } catch {
      toast("Failed to delete post ❌");
    } finally {
      setIsDeleting(false);
      setShowConfirm(false);
    }
  };

  if (showConfirm) {
    return (
      <div className="flex items-center gap-1">
        <Button
          size="sm"
          variant="destructive"
          disabled={isDeleting}
          onClick={handleDelete}
          className="h-8 text-xs px-2"
        >
          {isDeleting ? "Deleting..." : "Yes"}
        </Button>
        <Button
          size="sm"
          variant="ghost"
          disabled={isDeleting}
          onClick={() => setShowConfirm(false)}
          className="h-8 text-xs px-2"
        >
          No
        </Button>
      </div>
    );
  }

  return (
    <Button
      size="icon"
      variant="ghost"
      onClick={() => setShowConfirm(true)}
      className="text-destructive hover:bg-destructive h-8 w-8"
    >
      <Trash2 className="w-4 h-4" />
    </Button>
  );
};

export default JournalDeleteButton;