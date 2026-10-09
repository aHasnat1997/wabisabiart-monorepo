import { createZodDto } from 'nestjs-zod';
import z from 'zod';

// ─── Customer: Checkout from cart ──────────────────────────────────────────
const CheckoutSchema = z.object({
  shippingAddressId: z.uuid(),
  buyerNote: z.string().optional(),
  couponCode: z.string().optional(),
  customerRegion: z.string().optional(),
  shippingCost: z.coerce.number().min(0).optional(),
  tipAmount: z.coerce.string().optional(),
  redirectUrl: z.string().optional(),
  markOrderAsGift: z.boolean().optional(),
});

// ─── Seller: Mark order as shipped ─────────────────────────────────────────
const MarkShippedSchema = z.object({
  carrier: z.string().min(1),
  trackingNumber: z.string().optional(),
  trackingUrl: z.url().optional(),
  estimatedDeliveryDate: z.string().optional(),
  weight: z.number().positive().optional(),
});

// ─── Seller: Process refund ─────────────────────────────────────────────────
const ProcessRefundSchema = z.object({
  amount: z.string(),
  reason: z.string().min(1),
});

// ─── Customer / Seller: Cancel order ───────────────────────────────────────
const CancelOrderSchema = z.object({
  note: z.string().optional(),
});

// ─── Customer: Open dispute ─────────────────────────────────────────────────
const OpenDisputeSchema = z.object({
  reason: z.string().min(1),
  description: z.string().min(1),
});

// ─── Admin: Reject cancel request ──────────────────────────────────────────
const AdminRejectCancelSchema = z.object({
  reason: z.string().min(1),
});

// ─── Admin: Resolve dispute ─────────────────────────────────────────────────
const AdminResolveDisputeSchema = z.object({
  resolution: z.string().min(1),
  outcome: z.enum(['resolved_buyer', 'resolved_seller', 'closed']),
});

export class CheckoutDto extends createZodDto(CheckoutSchema) {}
export class MarkShippedDto extends createZodDto(MarkShippedSchema) {}
export class ProcessRefundDto extends createZodDto(ProcessRefundSchema) {}
export class CancelOrderDto extends createZodDto(CancelOrderSchema) {}
export class OpenDisputeDto extends createZodDto(OpenDisputeSchema) {}
export class AdminRejectCancelDto extends createZodDto(
  AdminRejectCancelSchema,
) {}
export class AdminResolveDisputeDto extends createZodDto(
  AdminResolveDisputeSchema,
) {}
