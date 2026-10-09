"use client";

import { ShippingLabelData } from "@/types/sellerDashboard/Orders";
import { Printer } from "lucide-react";
import { getShippingLabel } from "./OrderAction";


interface Props {
  orderId: string;
}

function buildShippingLabelHtml(d: ShippingLabelData): string {
  return `
    <html>
      <head>
        <style>
          body { font-family: Arial, sans-serif; padding: 40px; color: #333; }
          .label { border: 2px solid #333; padding: 24px; max-width: 500px; margin: auto; }
          .header { text-align: center; font-size: 20px; font-weight: bold; border-bottom: 2px solid #333; padding-bottom: 12px; margin-bottom: 16px; }
          .section { margin-bottom: 16px; }
          .section h2 { font-size: 12px; text-transform: uppercase; color: #888; margin-bottom: 4px; }
          .section p { font-size: 14px; margin: 0; line-height: 1.6; }
          table { width: 100%; border-collapse: collapse; font-size: 13px; }
          th { text-align: left; background: #f5f5f5; padding: 6px; }
          td { padding: 6px; border-bottom: 1px solid #eee; }
          .footer { margin-top: 16px; font-size: 12px; color: #999; text-align: center; }
          @media print { body { padding: 0; } }
        </style>
      </head>
      <body>
        <div class="label">
          <div class="header">Shipping Label — ${d.orderNumber}</div>

          <div class="section">
            <h2>From</h2>
            <p><strong>${d.shipFrom.shopName}</strong><br/>${d.shipFrom.address}</p>
          </div>

          <div class="section">
            <h2>To</h2>
            <p>
              <strong>${d.shipTo.fullName}</strong><br/>
              ${d.shipTo.addressLine1}${d.shipTo.addressLine2 ? ", " + d.shipTo.addressLine2 : ""}<br/>
              ${d.shipTo.city}, ${d.shipTo.stateProvince} ${d.shipTo.postalCode}<br/>
              ${d.shipTo.country}<br/>
              📞 ${d.shipTo.phoneNumber}
            </p>
          </div>

          <div class="section">
            <h2>Carrier & Tracking</h2>
            <p>
              Carrier: ${d.carrier ?? "—"}<br/>
              Tracking: ${d.trackingNumber ?? "—"}<br/>
              Weight: ${d.weight}g
            </p>
          </div>

          <div class="section">
            <h2>Items</h2>
            <table>
              <tr><th>Product</th><th>Variant</th><th>Qty</th></tr>
              ${d.items.map((item) => `
                <tr>
                  <td>${item.productTitle}</td>
                  <td>${item.variantName}</td>
                  <td>${item.quantity}</td>
                </tr>
              `).join("")}
            </table>
          </div>

          ${d.estimatedDelivery ? `
            <div class="section">
              <h2>Estimated Delivery</h2>
              <p>${new Date(d.estimatedDelivery).toLocaleDateString()}</p>
            </div>
          ` : ""}

          <div class="footer">Print and attach to package</div>
        </div>
        <script>window.onload = () => window.print();</script>
      </body>
    </html>
  `;
}

const PrintShippingLabelButton = ({ orderId }: Props) => {
  const handlePrint = async () => {
    try {
      const data = await getShippingLabel(orderId);
      const html = buildShippingLabelHtml(data);
      const win = window.open("", "_blank");
      if (win) {
        win.document.write(html);
        win.document.close();
      }
    } catch (err) {
      console.error("Shipping label failed:", err);
    }
  };

  return (
    <div
      onClick={handlePrint}
      className="flex items-start gap-3 rounded-lg px-4 py-3 hover:bg-muted/50 cursor-pointer"
    >
      <Printer className="h-5 w-5 text-muted-foreground mt-1" />
      <div>
        <p className="text-sm font-medium">Print Shipping Label</p>
        <p className="text-xs text-muted-foreground">Ready to print</p>
      </div>
    </div>
  );
};

export default PrintShippingLabelButton;