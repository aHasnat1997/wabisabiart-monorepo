"use client";

import { Loader2, Newspaper, RefreshCcw, ShipIcon, Trash } from "lucide-react";
import { useState } from "react";
import { useModal } from "@/components/modal/Modal";
import ViewOrderHistoryModal from "./ViewOrderHistoryModal";
import CancelOrderConfirmModal from "./CancelAlertModal";
import ProcessingRefund from "./ProcessingRefund";
import DownloadInvoiceButton from "./DownloadInvoiceButton";
import PrintShippingLabelButton from "./PrintShippinfLevelButton";
import { GrDeliver } from "react-icons/gr";
import { toast } from "sonner";
import { cancelOrder, deliverOrder, shipOrder } from "./OrderAction";
import { useRouter, useSearchParams } from "next/navigation";

const ActionModal = () => {
  const [isShipping, setIsShipping]   = useState(false);
  const [isDelivering, setIsDelivering] = useState(false);
  const [showOrder, setShowOrder]     = useState(false);
  const [isCancelling, setIsCancelling] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [showConfirmProcess, setShowConfirmProcess] = useState(false);

  const { close } = useModal();
  const router = useRouter();
  const searchParams = useSearchParams();

  const uuid        = searchParams.get("id");
  const orderNumber = searchParams.get("orderNumber") ?? "";
  const status      = searchParams.get("status") ?? "";

  if (!uuid) return null;

  // Trim trailing space — your status values sometimes have one e.g. "Pending Shipment "
  const normalStatus = status.trim();

  const canShip    = normalStatus === "Pending Shipment";
  const canDeliver = normalStatus === "Shipped";
  const canCancel  = normalStatus === "Past Due" || normalStatus === "Pending Shipment";
  const canRefund  = normalStatus === "Refund Requested";

  const handleShipClick = async () => {
    if (isShipping || !uuid) return;
    setIsShipping(true);
    try {
      const res = await shipOrder(uuid);
      //  console.log("Full response:", JSON.stringify(res));
      if (res?.success) {
        toast.success("Order marked as shipped!");
        // router.refresh();
        close("action-modal");
      // router.push(window.location.pathname); 
     
      } else {
        toast.error(res?.message ?? "Failed to update order");
      }
    } catch (error) {
      console.error("Ship error:", error);
      toast.error("Something went wrong!");
    } finally {
      setIsShipping(false); 
    }
  };

  const handleDeliverClick = async () => {
    if (isDelivering) return;
    setIsDelivering(true);
    try {
      const res = await deliverOrder(uuid);
      if (res?.success) {
        toast.success(res.data?.message ?? "Order marked as delivered!");
        // router.refresh();
        close("action-modal");
      } else {
        toast.error("Failed to mark as delivered");
      }
    } catch (error) {
      console.error("Deliver error:", error);
      toast.error("Something went wrong!");
    } finally {
      setIsDelivering(false); //  always resets
    }
  };

  const handleCancelOrder = async () => {
  if (isCancelling || !uuid) return;
  setIsCancelling(true);
  try {
    const res = await cancelOrder(uuid);
    if (res?.success) {
      toast.success("Order cancelled successfully");
      setShowConfirm(false); // Alert modal bondho koro
      close("action-modal"); // Main action modal bondho koro
    } else {
      toast.error(res?.message || "Failed to cancel order");
    }
  } catch (error) {
    toast.error("Something went wrong!");
  } finally {
    setIsCancelling(false);
  }
};


  return (
    <div className="w-full rounded-xl bg-card">
      {/* Header */}
      <div className="px-6 py-4">
        <h3 className="text-lg font-semibold">Order Actions</h3>
        <p className="text-sm text-muted-foreground mt-1">Manage order {orderNumber}</p>
      </div>

      {/* Body */}
      <div className="p-6 space-y-2">
        <DownloadInvoiceButton orderId={uuid} />
        <PrintShippingLabelButton orderId={uuid} />

        {/* Ship — only when Pending Shipment */}
        {canShip && (
          <div
            onClick={handleShipClick}
            className={`flex items-start gap-3 rounded-lg px-4 py-3 hover:bg-muted/50 cursor-pointer transition-opacity ${
              isShipping ? "opacity-50 pointer-events-none" : ""
            }`}
          >
            {isShipping ? (
              <Loader2 className="h-5 w-5 text-muted-foreground mt-0.5 animate-spin" />
            ) : (
              <ShipIcon className="h-5 w-5 text-muted-foreground mt-0.5" />
            )}
            <div>
              <p className="text-sm font-medium">Mark as Shipped</p>
              <p className="text-xs text-muted-foreground">
                {isShipping ? "Processing..." : "Notify buyer and update status"}
              </p>
            </div>
          </div>
        )}

        {/* Deliver — only when Shipped */}
        {canDeliver && (
          <div
            onClick={handleDeliverClick}
            className={`flex items-start gap-3 rounded-lg px-4 py-3 hover:bg-muted/50 cursor-pointer transition-opacity ${
              isDelivering ? "opacity-50 pointer-events-none" : ""
            }`}
          >
            {isDelivering ? (
              <Loader2 className="h-5 w-5 text-muted-foreground mt-0.5 animate-spin" />
            ) : (
              <GrDeliver className="h-5 w-5 text-muted-foreground mt-0.5" />
            )}
            <div>
              <p className="text-sm font-medium">Mark as Delivered</p>
              <p className="text-xs text-muted-foreground">
                {isDelivering ? "Updating..." : "Mark order as completed"}
              </p>
            </div>
          </div>
        )}

        {/* View Order History — always visible */}
        <div
          onClick={() => setShowOrder(true)}
          className="flex items-start gap-3 rounded-lg px-4 py-3 hover:bg-muted/50 cursor-pointer"
        >
          <Newspaper className="h-5 w-5 text-muted-foreground mt-0.5" />
          <div>
            <p className="text-sm font-medium">View Order History</p>
            <p className="text-xs text-muted-foreground">Timeline & updates</p>
          </div>
        </div>

        {/* Cancel — only when Past Due or Pending Shipment */}
       {canCancel && (
          <div
            onClick={() => setShowConfirm(true)}
            className="flex items-start gap-3 rounded-lg px-4 py-3 border-t border-destructive/20 cursor-pointer hover:bg-destructive/5 mt-2"
          >
            <Trash className="h-5 w-5 text-destructive mt-0.5" />
            <div>
              <p className="text-sm font-medium text-destructive">Cancel Order</p>
              <p className="text-xs text-destructive/70">This action cannot be undone</p>
            </div>
          </div>
        )}

        {/* Refund — only when Refund Requested */}
        {canRefund && (
          <>
            <div className="my-1 h-px bg-border" />
            <div
              onClick={() => setShowConfirmProcess(true)}
              className="flex items-start gap-3 rounded-lg px-4 py-3 hover:bg-primary/5 cursor-pointer"
            >
              <RefreshCcw className="h-5 w-5 text-primary mt-0.5" />
              <div>
                <p className="text-sm font-medium text-primary">Process Refund</p>
                <p className="text-xs text-primary/70">Review and confirm refund amount</p>
              </div>
            </div>
          </>
        )}
      </div>

      {/* Modals */}
      <ViewOrderHistoryModal
        orderId={uuid}
        orderNumber={orderNumber}
        open={showOrder}
        onClose={() => {
          setShowOrder(false);
          close("action-modal");
        }}
      />
{showConfirm && (
       <CancelOrderConfirmModal
  open={showConfirm}
  orderNumber={orderNumber}
  isLoading={isCancelling}
  onClose={() => setShowConfirm(false)}
  onConfirm={handleCancelOrder}
/>
      )}

      {/* {showConfirmProcess && (
        <ProcessingRefund
          orderId={uuid}
          orderNumber={orderNumber}
          onClose={() => setShowConfirmProcess(false)}
          onConfirm={() => {
            setShowConfirmProcess(false);
            close("action-modal");
          }}
        />
      )} */}
    </div>
  );
};

export default ActionModal;