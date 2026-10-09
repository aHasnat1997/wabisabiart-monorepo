import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '@wabisabiart/db';
import {
  CustomerListResponse,
  CustomerDetail,
  CustomerStatistics,
  OrderSummary,
} from './dto/customer.dto.js';
import type { ParsedQuery } from '../../../src/decorators/query-builder.decorator.js';

@Injectable()
export class CustomersService {
  constructor(private readonly prisma: PrismaService) {}

  /**
   * Get all customers for seller's store
   */
  async getSellerCustomers(
    sellerId: string,
    query: ParsedQuery & { page: number; limit: number },
  ): Promise<CustomerListResponse> {
    const { where, orderBy, skip, take, page, limit } = query;

    // Get all unique customers who have ordered from this seller
    const customerIds = await this.prisma.order.findMany({
      where: { sellerId },
      select: { buyerId: true },
      distinct: ['buyerId'],
    });

    const uniqueCustomerIds = [...new Set(customerIds.map((o) => o.buyerId))];

    // Merge seller filter with any additional where clauses from query
    const whereClause = {
      ...where,
      id: { in: uniqueCustomerIds },
    };

    // Get customer details
    const customers = await this.prisma.user.findMany({
      where: whereClause,
      select: {
        id: true,
        fullName: true,
        email: true,
        phoneNumber: true,
        avatarUrl: true,
        isActive: true,
        createdAt: true,
        addresses: {
          where: { isDefaultShipping: true },
          select: {
            city: true,
            stateProvince: true,
            country: true,
          },
          take: 1,
        },
        buyerOrders: {
          where: { sellerId },
          select: {
            id: true,
            totalAmount: true,
            createdAt: true,
          },
          orderBy: { createdAt: 'desc' },
        },
      },
      skip,
      take,
      orderBy: orderBy || { createdAt: 'desc' },
    });

    const formattedCustomers = customers.map((c) => {
      const totalSpent = c.buyerOrders.reduce(
        (sum, order) => sum + Number(order.totalAmount),
        0,
      );
      const location = c.addresses[0]
        ? `${c.addresses[0].city}, ${c.addresses[0].country}`
        : 'Unknown';

      return {
        id: c.id,
        fullName: c.fullName,
        email: c.email,
        phoneNumber: c.phoneNumber,
        avatarUrl: c.avatarUrl,
        totalOrders: c.buyerOrders.length,
        totalSpent: totalSpent.toFixed(2),
        location,
        isActive: c.isActive,
        lastOrderDate: c.buyerOrders[0]?.createdAt?.toISOString() || null,
        createdAt: c.createdAt.toISOString(),
      };
    });

    return {
      customers: formattedCustomers,
      total: uniqueCustomerIds.length,
      page,
      limit,
      totalPages: Math.ceil(uniqueCustomerIds.length / limit),
    };
  }

  /**
   * Get all customers (admin view)
   */
  async getAllCustomers(
    query: ParsedQuery & { page: number; limit: number },
  ): Promise<CustomerListResponse> {
    const { where, orderBy, skip, take, page, limit } = query;

    const whereClause: Record<string, unknown> = {
      ...where,
      role: 'customer',
    };

    const total = await this.prisma.user.count({
      where: whereClause,
    });

    const customers = await this.prisma.user.findMany({
      where: whereClause,
      select: {
        id: true,
        fullName: true,
        email: true,
        phoneNumber: true,
        avatarUrl: true,
        isActive: true,
        createdAt: true,
        addresses: {
          where: { isDefaultShipping: true },
          select: {
            city: true,
            stateProvince: true,
            country: true,
          },
          take: 1,
        },
        buyerOrders: {
          select: {
            id: true,
            totalAmount: true,
            createdAt: true,
          },
          orderBy: { createdAt: 'desc' },
        },
      },
      skip,
      take,
      orderBy: orderBy || { createdAt: 'desc' },
    });

    const formattedCustomers = customers.map((c) => {
      const totalSpent = c.buyerOrders.reduce(
        (sum, order) => sum + Number(order.totalAmount),
        0,
      );
      const location = c.addresses[0]
        ? `${c.addresses[0].city}, ${c.addresses[0].country}`
        : 'Unknown';

      return {
        id: c.id,
        fullName: c.fullName,
        email: c.email,
        phoneNumber: c.phoneNumber,
        avatarUrl: c.avatarUrl,
        totalOrders: c.buyerOrders.length,
        totalSpent: totalSpent.toFixed(2),
        location,
        isActive: c.isActive,
        lastOrderDate: c.buyerOrders[0]?.createdAt?.toISOString() || null,
        createdAt: c.createdAt.toISOString(),
      };
    });

    return {
      customers: formattedCustomers,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  /**
   * Get customer details with order history and statistics
   */
  async getCustomerDetail(customerId: string): Promise<CustomerDetail> {
    const customer = await this.prisma.user.findUnique({
      where: { id: customerId },
      select: {
        id: true,
        fullName: true,
        email: true,
        phoneNumber: true,
        avatarUrl: true,
        dob: true,
        isActive: true,
        emailVerified: true,
        phoneVerified: true,
        createdAt: true,
        lastLoginAt: true,
        addresses: {
          select: {
            id: true,
            fullName: true,
            addressLine1: true,
            addressLine2: true,
            city: true,
            stateProvince: true,
            postalCode: true,
            country: true,
            label: true,
            isDefaultShipping: true,
            isDefaultBilling: true,
          },
        },
        buyerOrders: {
          select: {
            id: true,
            status: true,
            totalAmount: true,
            createdAt: true,
            items: {
              select: { quantity: true },
            },
          },
          orderBy: { createdAt: 'desc' },
        },
      },
    });

    if (!customer) {
      throw new NotFoundException('Customer not found');
    }

    // Calculate statistics
    const stats = this.calculateCustomerStatistics(
      customer.buyerOrders,
      customer.createdAt,
    );

    // Valid statuses for the UI
    const validStatuses = [
      'pending',
      'confirmed',
      'processing',
      'shipped',
      'delivered',
      'cancelled',
      'returned',
    ];

    // Format orders for display
    const orders: OrderSummary[] = customer.buyerOrders
      .filter((order) => validStatuses.includes(order.status))
      .map((order) => {
        const status = order.status as
          | 'pending'
          | 'confirmed'
          | 'processing'
          | 'shipped'
          | 'delivered'
          | 'cancelled'
          | 'returned';
        return {
          id: order.id,
          orderNumber: `ORD-${order.id.slice(0, 8).toUpperCase()}`,
          totalAmount: Number(order.totalAmount).toFixed(2),
          status,
          orderDate: order.createdAt.toISOString(),
          items: order.items.reduce((sum, item) => sum + item.quantity, 0),
        };
      });

    return {
      id: customer.id,
      fullName: customer.fullName,
      email: customer.email,
      phoneNumber: customer.phoneNumber,
      avatarUrl: customer.avatarUrl,
      dob: customer.dob?.toISOString() || null,
      isActive: customer.isActive,
      emailVerified: customer.emailVerified,
      phoneVerified: customer.phoneVerified,
      createdAt: customer.createdAt.toISOString(),
      lastLoginAt: customer.lastLoginAt?.toISOString() || null,
      addresses: customer.addresses,
      statistics: stats,
      orders,
    };
  }

  /**
   * Activate or deactivate a customer
   */
  async activateDeactivateCustomer(
    customerId: string,
    isActive: boolean,
  ): Promise<{ success: boolean; message: string }> {
    // Check if customer exists first
    const customer = await this.prisma.user.findUnique({
      where: { id: customerId },
    });

    if (!customer) {
      throw new NotFoundException('Customer not found');
    }

    await this.prisma.user.update({
      where: { id: customerId },
      data: { isActive },
    });

    return {
      success: true,
      message: `Customer ${isActive ? 'activated' : 'deactivated'} successfully`,
    };
  }

  /**
   * Calculate customer statistics
   */
  private calculateCustomerStatistics(
    orders: Array<{
      id: string;
      status: string;
      totalAmount: any;
      createdAt: Date;
      items: Array<{ quantity: number }>;
    }>,
    customerCreatedAt: Date,
  ): CustomerStatistics {
    const now = new Date();
    const currentMonth = new Date(now.getFullYear(), now.getMonth(), 1);

    // All orders
    const totalOrders = orders.length;
    const totalSpent = orders.reduce(
      (sum, o) => sum + Number(o.totalAmount),
      0,
    );
    const avgOrderValue = totalOrders > 0 ? totalSpent / totalOrders : 0;

    // This month
    const thisMonthOrders = orders.filter((o) => o.createdAt >= currentMonth);
    const thisMonthSpent = thisMonthOrders.reduce(
      (sum, o) => sum + Number(o.totalAmount),
      0,
    );

    // Cancelled and returned
    const cancelledOrdersArray = orders.filter((o) => o.status === 'cancelled');
    const cancelledOrders = cancelledOrdersArray.length;
    const returnedOrdersArray = orders.filter((o) => o.status === 'returned');
    const returnedOrders = returnedOrdersArray.length;

    // Average products per order
    const totalItems = orders.reduce(
      (sum, o) => sum + o.items.reduce((s, i) => s + i.quantity, 0),
      0,
    );
    const avgProductsPerOrder =
      totalOrders > 0 ? (totalItems / totalOrders).toFixed(2) : '0';

    // Member since days - use customer account creation date
    const joinDate = customerCreatedAt;
    const memberSinceDays = Math.floor(
      (now.getTime() - joinDate.getTime()) / (1000 * 60 * 60 * 24),
    );

    return {
      totalOrders,
      totalSpent: totalSpent.toFixed(2),
      averageOrderValue: avgOrderValue.toFixed(2),
      lastOrderDate: orders[0]?.createdAt?.toISOString() || null,
      joinDate: joinDate.toISOString(),
      memberSinceDays,
      ordersThisMonth: thisMonthOrders.length,
      spentThisMonth: thisMonthSpent.toFixed(2),
      cancelledOrders,
      returnedOrders,
      avgProductsPerOrder,
    };
  }
}
