"use client";

import { Trash2 } from "lucide-react";
import { Button } from "@/components/animate-ui/components/buttons/button";
import {
  AlertDialog,
  AlertDialogBackdrop,
  AlertDialogClose,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogPopup,
  AlertDialogPortal,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/animate-ui/primitives/base/alert-dialog";
import { QuantityInput } from "@/components/ui/quantity-input";
import { useState, useEffect, useRef } from "react";
import { removeCartItem, updateQuantity } from "./actions";
import { toast } from "sonner";

export default function CartBtn({
  // list_of_item_ids,
  quantity,
  maxQuantity,
  productId,
}: {
  // list_of_item_ids: string;
  quantity: number;
  maxQuantity: number;
  productId: string;
}) {
  const [quantityValue, setQuantityValue] = useState(quantity);
  const isFirstRender = useRef(true);

  const handleQuantityChange = async (quantity: number) => {
    try {
      await updateQuantity(productId, quantity);
    } catch (error) {
      toast.error(
        error instanceof Error
          ? error.message
          : "Failed to update item quantity",
      );
    }
  };

  useEffect(() => {
    if (isFirstRender.current) {
      isFirstRender.current = false;
      return;
    }

    const timer = setTimeout(() => {
      handleQuantityChange(quantityValue);
    }, 500);

    return () => clearTimeout(timer);
  }, [quantityValue]);

  const handleRemove = async () => {
    try {
      await removeCartItem(productId);
      toast.success("Item removed from cart");
    } catch (error) {
      toast.error(
        error instanceof Error
          ? error.message
          : "Failed to remove item from cart",
      );
    }
  };

  return (
    <div className="flex justify-between items-center">
      <QuantityInput
        onChange={(value) => setQuantityValue(value)}
        defaultValue={quantity}
        max={maxQuantity}
      />

      <AlertDialog>
        <AlertDialogTrigger>
          <Button
            variant="ghost"
            className="h-8 px-3 hover:bg-destructive/10 hover:text-destructive"
          >
            <Trash2 />
            Remove
          </Button>
        </AlertDialogTrigger>

        <AlertDialogPortal>
          <AlertDialogBackdrop className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm" />
          <AlertDialogPopup
            className="sm:max-w-md fixed left-[50%] top-[50%] translate-x-[-50%] translate-y-[-50%] z-50 
                 border bg-background p-6 rounded-md shadow-lg"
          >
            <AlertDialogHeader className="space-y-2">
              <AlertDialogTitle className="text-lg font-semibold text-destructive">
                Are you sure remove this item?
              </AlertDialogTitle>
              <AlertDialogDescription className="text-sm text-muted-foreground">
                This action cannot be undone. The item will be removed from your
                cart and you will need to add it again if you change your mind.
              </AlertDialogDescription>
            </AlertDialogHeader>

            <AlertDialogFooter className="mt-6 flex justify-end gap-3">
              <AlertDialogClose className="px-4 py-2 cursor-pointer text-sm font-medium rounded-md border-secondary border hover:bg-muted/80 transition-colors">
                Cancel
              </AlertDialogClose>
              <AlertDialogClose
                onClick={handleRemove}
                className="px-4 py-2 text-sm cursor-pointer font-medium rounded-md bg-destructive text-destructive-foreground hover:bg-destructive/90 transition-colors"
              >
                Remove
              </AlertDialogClose>
            </AlertDialogFooter>
          </AlertDialogPopup>
        </AlertDialogPortal>
      </AlertDialog>
    </div>
  );
}
