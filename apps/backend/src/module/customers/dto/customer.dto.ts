import { createZodDto } from 'nestjs-zod';
import z from 'zod';

// ─────────────────────────────────────────────────────────────────────────
// CUSTOMER LIST ITEM
// ─────────────────────────────────────────────────────────────────────────

const CustomerListItemSchema = z.object({
  id: z.string().uuid(),
  fullName: z.string(),
  email: z.string().email(),
  phoneNumber: z.string().optional().nullable(),
  avatarUrl: z.string().optional().nullable(),
  totalOrders: z.number().int().nonnegative(),
  totalSpent: z.string(), // formatted currency
  location: z.string(), // city, country
  isActive: z.boolean(),
  lastOrderDate: z.string().datetime().optional().nullable(),
  createdAt: z.string().datetime(),
});

// ─────────────────────────────────────────────────────────────────────────
// CUSTOMER LIST RESPONSE
// ─────────────────────────────────────────────────────────────────────────

const CustomerListResponseSchema = z.object({
  customers: z.array(CustomerListItemSchema),
  total: z.number().int().nonnegative(),
  page: z.number().int().positive(),
  limit: z.number().int().positive(),
  totalPages: z.number().int().nonnegative(),
});

// ─────────────────────────────────────────────────────────────────────────
// ORDER SUMMARY (for customer detail)
// ─────────────────────────────────────────────────────────────────────────

const OrderSummarySchema = z.object({
  id: z.string().uuid(),
  orderNumber: z.string(),
  totalAmount: z.string(),
  status: z.enum([
    'pending',
    'confirmed',
    'processing',
    'shipped',
    'delivered',
    'cancelled',
    'returned',
  ]),
  orderDate: z.string().datetime(),
  items: z.number().int().nonnegative(),
});

// ─────────────────────────────────────────────────────────────────────────
// CUSTOMER STATISTICS
// ─────────────────────────────────────────────────────────────────────────

const CustomerStatisticsSchema = z.object({
  totalOrders: z.number().int().nonnegative(),
  totalSpent: z.string(),
  averageOrderValue: z.string(),
  lastOrderDate: z.string().datetime().optional().nullable(),
  joinDate: z.string().datetime(),
  memberSinceDays: z.number().int().nonnegative(),
  ordersThisMonth: z.number().int().nonnegative(),
  spentThisMonth: z.string(),
  cancelledOrders: z.number().int().nonnegative(),
  returnedOrders: z.number().int().nonnegative(),
  avgProductsPerOrder: z.string(),
});

// ─────────────────────────────────────────────────────────────────────────
// CUSTOMER DETAIL RESPONSE
// ─────────────────────────────────────────────────────────────────────────

const CustomerDetailSchema = z.object({
  id: z.string().uuid(),
  fullName: z.string(),
  email: z.string().email(),
  phoneNumber: z.string().optional().nullable(),
  avatarUrl: z.string().optional().nullable(),
  dob: z.string().datetime().optional().nullable(),
  isActive: z.boolean(),
  emailVerified: z.boolean(),
  phoneVerified: z.boolean(),
  createdAt: z.string().datetime(),
  lastLoginAt: z.string().datetime().optional().nullable(),
  addresses: z
    .array(
      z.object({
        id: z.string().uuid(),
        fullName: z.string(),
        addressLine1: z.string(),
        addressLine2: z.string().optional().nullable(),
        city: z.string(),
        stateProvince: z.string().optional().nullable(),
        postalCode: z.string(),
        country: z.string(),
        label: z.string().optional().nullable(),
        isDefaultShipping: z.boolean(),
        isDefaultBilling: z.boolean(),
      }),
    )
    .default([]),
  statistics: CustomerStatisticsSchema,
  orders: z.array(OrderSummarySchema),
});

// ─────────────────────────────────────────────────────────────────────────
// ACTIVATE/DEACTIVATE DTO
// ─────────────────────────────────────────────────────────────────────────

const ActivateDeactivateSchema = z.object({
  isActive: z.boolean(),
});

// ─────────────────────────────────────────────────────────────────────────
// DTO Classes
// ─────────────────────────────────────────────────────────────────────────

export class CustomerListItemDto extends createZodDto(CustomerListItemSchema) {}
export class CustomerListResponseDto extends createZodDto(
  CustomerListResponseSchema,
) {}
export class CustomerDetailResponseDto extends createZodDto(
  CustomerDetailSchema,
) {}
export class ActivateDeactivateDto extends createZodDto(
  ActivateDeactivateSchema,
) {}

// ─────────────────────────────────────────────────────────────────────────
// Type Exports
// ─────────────────────────────────────────────────────────────────────────

export type CustomerListItem = z.infer<typeof CustomerListItemSchema>;
export type CustomerListResponse = z.infer<typeof CustomerListResponseSchema>;
export type OrderSummary = z.infer<typeof OrderSummarySchema>;
export type CustomerStatistics = z.infer<typeof CustomerStatisticsSchema>;
export type CustomerDetail = z.infer<typeof CustomerDetailSchema>;
export type ActivateDeactivate = z.infer<typeof ActivateDeactivateSchema>;
