/**
 * @wabisabiart/types-admin
 * Central barrel for all TypeScript types used in the admin dashboard (Vite + Refine).
 * Add admin-specific types here and import from this package in apps/admin.
 */

// ─── API Resource Types ───────────────────────────────────────────────────────

export interface AdminUser {
  id: string;
  email: string;
  fullName: string;
  role: 'ADMIN' | 'SUPER_ADMIN';
  avatarUrl?: string;
  createdAt: string;
  updatedAt: string;
}

export interface AdminProduct {
  id: string;
  title: string;
  slug: string;
  price: number;
  stock: number;
  status: 'ACTIVE' | 'DRAFT' | 'ARCHIVED';
  sellerId: string;
  categoryId: string;
  createdAt: string;
  updatedAt: string;
}

export interface AdminOrder {
  id: string;
  orderNumber: string;
  status: string;
  totalAmount: number;
  buyerId: string;
  sellerId: string;
  createdAt: string;
  updatedAt: string;
}

export interface AdminSeller {
  id: string;
  shopName: string;
  email: string;
  status: 'PENDING' | 'APPROVED' | 'SUSPENDED';
  totalSales: number;
  createdAt: string;
}

export interface AdminCategory {
  id: string;
  name: string;
  slug: string;
  parentId?: string;
  imageUrl?: string;
}

export interface AdminDashboardStats {
  totalRevenue: number;
  totalOrders: number;
  totalUsers: number;
  totalSellers: number;
  pendingSellerApprovals: number;
  openSupportTickets: number;
}

// ─── API Response Wrappers ────────────────────────────────────────────────────

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface ApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
}

// ─── Form / Filter Types ──────────────────────────────────────────────────────

export interface AdminProductFilters {
  status?: string;
  categoryId?: string;
  sellerId?: string;
  search?: string;
  minPrice?: number;
  maxPrice?: number;
}

export interface AdminOrderFilters {
  status?: string;
  buyerId?: string;
  sellerId?: string;
  dateFrom?: string;
  dateTo?: string;
}
