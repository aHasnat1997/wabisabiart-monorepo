"use client";

import { AlertTriangle, Loader2 } from "lucide-react"; // Loader2 add koro
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/animate-ui/components/radix/dialog";
import { Button } from "@/components/ui/button";

interface Props {
  orderNumber: string; 
  open: boolean;
  isLoading?: boolean; 
  onClose: () => void;
  onConfirm: () => void;
}

const CancelOrderConfirmModal = ({ orderNumber, open, onClose, onConfirm, isLoading }: Props) => {
  return (
    <Dialog open={open} onOpenChange={(val) => !val && !isLoading && onClose()}>
      <DialogContent className="rounded-xl p-6 animate-fade-in">
        <div className="flex items-center gap-3 mb-4">
          <div className="p-2 bg-destructive/10 rounded-full">
            <AlertTriangle className="h-6 w-6 text-destructive" />
          </div>
          <DialogHeader>
            <DialogTitle className="text-lg font-semibold">Cancel Order</DialogTitle>
          </DialogHeader>
        </div>

        <p className="text-sm text-muted-foreground mb-6">
          Are you sure you want to cancel order <strong>{orderNumber}</strong>? 
          This action cannot be undone and the customer will be notified.
        </p>

        <DialogFooter className="flex justify-end gap-3">
          <Button variant="outline" onClick={onClose} disabled={isLoading}>
            No, keep order
          </Button>
          <Button variant="destructive" onClick={onConfirm} disabled={isLoading}>
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Cancelling...
              </>
            ) : (
              "Yes, cancel order"
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default CancelOrderConfirmModal;