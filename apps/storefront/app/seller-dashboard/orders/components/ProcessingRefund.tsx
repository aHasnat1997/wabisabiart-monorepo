import { Order } from "@/types/sellerDashboard/Orders";
import { LoaderCircleIcon } from "lucide-react";


interface Props {
  orderId: string;
  orderNumber?: string;
  open: boolean;
  onClose: () => void;
  onConfirm: ()=> void;
}

const ProcessingRefund = ({ orderId, orderNumber, open, onClose , onConfirm}: Props) => {
  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/40">
      <div className="max-w-sm rounded-xl p-6 space-y-4 bg-card shadow-lg">
        <div className="flex items-center gap-3">
          <LoaderCircleIcon className="h-6 w-6 text-destructive" />
          <h3 className="text-lg font-semibold">Process Refund</h3>
        </div>

        <p className="text-sm text-muted-foreground">
          Are you sure you want to process a refund of $130 for order {orderId}? This will return the payment to the customer.
        </p>

        <div className="flex justify-end gap-3 pt-4">
          <button
            onClick={onClose}
            className="px-4 py-2 text-sm rounded-md border hover:bg-muted"
          >
           Cancel
          </button>

          <button
            onClick={onConfirm}
            className="px-4 py-2 text-sm rounded-md bg-primary text-card hover:bg-primary/90"
          >
            Confirm Refund
          </button>
        </div>
      </div>
    </div>
  )
}

export default ProcessingRefund;