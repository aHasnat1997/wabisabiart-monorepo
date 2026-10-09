"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { deleteProduct } from "./Action";
import { toast } from "sonner";


const DeleteProductModal = () => {
  const searchParams = useSearchParams();
  const productId = searchParams.get("id");
  const productName = searchParams.get("name");
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const handleClose = () => {
    router.replace(window.location.pathname, { scroll: false });
  };

  const handleDelete = async () => {
    if (!productId) return;
    try {
      setLoading(true);
      await deleteProduct(productId);
      toast.success("Product deleted successfully!");
      router.replace(window.location.pathname, { scroll: false });
    } catch (err) {
      toast.error("Failed to delete product.");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full p-1 md:p-2 pb-12">
      <h2 className="text-lg font-semibold text-destructive">Delete Product</h2>
      <p className="text-sm text-muted-foreground mt-8">
        Are you sure you want to delete{" "}
        <span className="text-sm font-bold text-destructive">
          {productName ?? "this product"}
        </span>
        ? This action cannot be undone.
      </p>
      <div className="flex justify-end gap-2 pt-2">
        <Button variant="outline" onClick={handleClose}>
          Cancel
        </Button>
        <Button variant="destructive" onClick={handleDelete} disabled={loading}>
          {loading ? "Deleting..." : "Delete"}
        </Button>
      </div>
    </div>
  );
};

export default DeleteProductModal;