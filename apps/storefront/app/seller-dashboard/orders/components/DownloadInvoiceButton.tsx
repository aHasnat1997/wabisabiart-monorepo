"use client";

import { InvoiceData } from "@/types/sellerDashboard/Orders";
import { Download } from "lucide-react";
import { getOrderInvoice } from "./OrderAction";


interface Props {
  orderId: string;
}

function buildInvoiceHtml(data: InvoiceData): string {
  return `
    <html>
      <head>
        <style>
          body { font-family: Arial, sans-serif; padding: 40px; color: #333; }
          h1 { font-size: 24px; margin-bottom: 4px; }
          .meta { font-size: 13px; color: #666; margin-bottom: 24px; }
          .section { margin-bottom: 20px; }
          .section h2 { font-size: 14px; font-weight: bold; border-bottom: 1px solid #eee; padding-bottom: 4px; margin-bottom: 8px; }
          table { width: 100%; border-collapse: collapse; font-size: 13px; }
          th { text-align: left; padding: 8px; background: #f5f5f5; }
          td { padding: 8px; border-bottom: 1px solid #f0f0f0; }
          .total { font-size: 15px; font-weight: bold; text-align: right; margin-top: 12px; }
        </style>
      </head>
      <body>
        <h1>Invoice — ${data.invoiceNumber}</h1>
        <div class="meta">Issued: ${new Date(data.issuedAt).toLocaleDateString()}</div>

        <div class="section">
          <h2>Seller</h2>
          <p>${data.seller.shopName}<br/>${data.seller.address}</p>
        </div>

        <div class="section">
          <h2>Buyer</h2>
          <p>${data.buyer.fullName}<br/>${data.buyer.email}</p>
        </div>

        <div class="section">
          <h2>Shipping Address</h2>
          <p>
            ${data.shippingAddress.fullName}<br/>
            ${data.shippingAddress.addressLine1}<br/>
            ${data.shippingAddress.city}, ${data.shippingAddress.country} ${data.shippingAddress.postalCode}
          </p>
        </div>

        <div class="section">
          <h2>Items</h2>
          <table>
            <tr><th>Product</th><th>Qty</th><th>Unit Price</th><th>Total</th></tr>
            ${data.lineItems.map((item) => `
              <tr>
                <td>${item.productTitle}<br/><small>${item.variantName}</small></td>
                <td>${item.quantity}</td>
                <td>$${item.unitPrice}</td>
                <td>$${item.totalPrice}</td>
              </tr>
            `).join("")}
          </table>
        </div>

        <div class="section">
          <h2>Summary</h2>
          <table>
            <tr><td>Subtotal</td><td>$${data.summary.subtotal}</td></tr>
            <tr><td>Shipping</td><td>$${data.summary.shippingCost}</td></tr>
            <tr><td>Discount</td><td>-$${data.summary.discountAmount}</td></tr>
            <tr><td>Tax</td><td>$${data.summary.taxAmount}</td></tr>
            <tr><td>Tip</td><td>$${data.summary.tipAmount}</td></tr>
          </table>
          <div class="total">Total: $${data.summary.totalAmount} ${data.summary.currency}</div>
        </div>
      </body>
    </html>
  `;
}

const DownloadInvoiceButton = ({ orderId }: Props) => {
  const handleDownload = async () => {
    try {
      const data = await getOrderInvoice(orderId);
      const html = buildInvoiceHtml(data);
      const blob = new Blob([html], { type: "text/html" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `${data.invoiceNumber}.html`;
      a.click();
      URL.revokeObjectURL(url);
    } catch (err) {
      console.error("Invoice download failed:", err);
    }
  };

  return (
    <div
      onClick={handleDownload}
      className="flex items-start gap-3 rounded-lg px-4 py-3 hover:bg-muted/50 cursor-pointer"
    >
      <Download className="h-5 w-5 text-muted-foreground mt-1" />
      <div>
        <p className="text-sm font-medium">Download Invoice</p>
        <p className="text-xs text-muted-foreground">PDF format</p>
      </div>
    </div>
  );
};

export default DownloadInvoiceButton;