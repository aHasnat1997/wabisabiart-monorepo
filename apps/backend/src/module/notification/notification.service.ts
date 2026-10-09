import { Injectable } from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';
import { PrismaService } from '@wabisabiart/db';
import { SseService } from '../../services/sse.service.js';

export interface NotificationPayload {
  userId: string;
  type: string;
  title: string;
  message: string;
  actionUrl?: string;
  metadata?: Record<string, any>;
}

@Injectable()
export class NotificationService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly sse: SseService,
  ) {}

  async send(payload: NotificationPayload) {
    await this.prisma.notification.create({ data: payload });
    this.sse.push(payload.userId, {
      type: payload.type,
      title: payload.title,
      message: payload.message,
      actionUrl: payload.actionUrl,
      metadata: payload.metadata,
    });
  }

  async sendToAllSellers(payload: Omit<NotificationPayload, 'userId'>) {
    const sellers = await this.prisma.user.findMany({
      where: { role: 'seller', isActive: true, deletedAt: null },
      select: { id: true },
    });
    await Promise.all(sellers.map((s) => this.send({ ...payload, userId: s.id })));
  }

  async sendToAllAdmins(payload: Omit<NotificationPayload, 'userId'>) {
    const admins = await this.prisma.user.findMany({
      where: { role: 'admin', isActive: true, deletedAt: null },
      select: { id: true },
    });
    await Promise.all(admins.map((a) => this.send({ ...payload, userId: a.id })));
  }

  findAll(userId: string) {
    return this.prisma.notification.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
    });
  }

  unreadCount(userId: string) {
    return this.prisma.notification.count({ where: { userId, isRead: false } });
  }

  markRead(id: string, userId: string) {
    return this.prisma.notification.update({
      where: { id, userId },
      data: { isRead: true, readAt: new Date() },
    });
  }

  markAllRead(userId: string) {
    return this.prisma.notification.updateMany({
      where: { userId, isRead: false },
      data: { isRead: true, readAt: new Date() },
    });
  }

  // ══════════════════════════════════════════════════════════════════════════
  // CUSTOMER EVENTS
  // ══════════════════════════════════════════════════════════════════════════

  @OnEvent('order.shipped')
  async onOrderShipped(e: { buyerId: string; orderNumber: string; orderId: string }) {
    await this.send({
      userId: e.buyerId,
      type: 'ORDER_SHIPPED',
      title: 'Your order has been shipped!',
      message: `Order #${e.orderNumber} is on its way.`,
      actionUrl: `/orders/${e.orderId}`,
    });
  }

  @OnEvent('order.delivered')
  async onOrderDelivered(e: { buyerId: string; orderNumber: string; orderId: string }) {
    await this.send({
      userId: e.buyerId,
      type: 'ORDER_DELIVERED',
      title: 'Order delivered!',
      message: `Order #${e.orderNumber} has been delivered.`,
      actionUrl: `/orders/${e.orderId}`,
    });
  }

  @OnEvent('order.cancelled')
  async onOrderCancelled(e: { buyerId: string; orderNumber: string; orderId: string }) {
    await this.send({
      userId: e.buyerId,
      type: 'ORDER_CANCELLED',
      title: 'Order cancelled',
      message: `Order #${e.orderNumber} has been cancelled.`,
      actionUrl: `/orders/${e.orderId}`,
    });
  }

  // ══════════════════════════════════════════════════════════════════════════
  // SELLER EVENTS
  // ══════════════════════════════════════════════════════════════════════════

  @OnEvent('shop.approved')
  async onShopApproved(e: { sellerId: string; shopName: string }) {
    await this.send({
      userId: e.sellerId,
      type: 'SHOP_APPROVED',
      title: 'Your shop has been approved!',
      message: `Congratulations! "${e.shopName}" is now live.`,
      actionUrl: '/seller/dashboard',
    });
  }

  @OnEvent('shop.frozen')
  async onShopFrozen(e: { sellerId: string; shopName: string }) {
    await this.send({
      userId: e.sellerId,
      type: 'SHOP_FROZEN',
      title: 'Your shop has been frozen',
      message: `"${e.shopName}" has been frozen by admin. Please contact support.`,
      actionUrl: '/seller/settings',
    });
  }

  @OnEvent('shop.unfrozen')
  async onShopUnfrozen(e: { sellerId: string; shopName: string }) {
    await this.send({
      userId: e.sellerId,
      type: 'SHOP_UNFROZEN',
      title: 'Your shop has been reactivated',
      message: `"${e.shopName}" is now active again.`,
      actionUrl: '/seller/dashboard',
    });
  }

  @OnEvent('shop.featured')
  async onShopFeatured(e: { sellerId: string; shopName: string }) {
    await this.send({
      userId: e.sellerId,
      type: 'SHOP_FEATURED',
      title: 'Your shop is now featured!',
      message: `"${e.shopName}" has been featured on the platform.`,
      actionUrl: '/seller/dashboard',
    });
  }

  @OnEvent('product.approved')
  async onProductApproved(e: { sellerId: string; productTitle: string; productId: string }) {
    await this.send({
      userId: e.sellerId,
      type: 'PRODUCT_APPROVED',
      title: 'Product approved!',
      message: `"${e.productTitle}" is now live.`,
      actionUrl: `/seller/products/${e.productId}`,
    });
  }

  @OnEvent('product.rejected')
  async onProductRejected(e: { sellerId: string; productTitle: string; productId: string }) {
    await this.send({
      userId: e.sellerId,
      type: 'PRODUCT_REJECTED',
      title: 'Product rejected',
      message: `"${e.productTitle}" was not approved. Please review and resubmit.`,
      actionUrl: `/seller/products/${e.productId}`,
    });
  }

  @OnEvent('journal.approved')
  async onJournalApproved(e: { sellerId: string; journalTitle: string; journalId: string }) {
    await this.send({
      userId: e.sellerId,
      type: 'JOURNAL_APPROVED',
      title: 'Journal post published!',
      message: `"${e.journalTitle}" is now live.`,
      actionUrl: `/journal/${e.journalId}`,
    });
  }

  @OnEvent('journal.rejected')
  async onJournalRejected(e: { sellerId: string; journalTitle: string; journalId: string }) {
    await this.send({
      userId: e.sellerId,
      type: 'JOURNAL_REJECTED',
      title: 'Journal post rejected',
      message: `"${e.journalTitle}" was not approved.`,
      actionUrl: `/seller/journal/${e.journalId}`,
    });
  }

  @OnEvent('billing.updated')
  async onBillingUpdated() {
    await this.sendToAllSellers({
      type: 'BILLING_UPDATED',
      title: 'Platform fees updated',
      message: 'Billing & fee settings have been updated. Check your dashboard.',
      actionUrl: '/seller/settings/billing',
    });
  }

  // ══════════════════════════════════════════════════════════════════════════
  // ADMIN EVENTS
  // ══════════════════════════════════════════════════════════════════════════

  @OnEvent('shop.pending_approval')
  async onShopPendingApproval(e: { shopName: string; sellerId: string }) {
    await this.sendToAllAdmins({
      type: 'ADMIN_SHOP_PENDING',
      title: 'New shop awaiting approval',
      message: `"${e.shopName}" has submitted a shop setup request.`,
      actionUrl: `/admin/sellers/${e.sellerId}`,
    });
  }

  @OnEvent('product.pending_review')
  async onProductPendingReview(e: { productTitle: string; productId: string }) {
    await this.sendToAllAdmins({
      type: 'ADMIN_PRODUCT_PENDING',
      title: 'Product awaiting review',
      message: `"${e.productTitle}" needs approval.`,
      actionUrl: `/admin/products/${e.productId}`,
    });
  }

  @OnEvent('journal.pending_review')
  async onJournalPendingReview(e: { journalTitle: string; journalId: string }) {
    await this.sendToAllAdmins({
      type: 'ADMIN_JOURNAL_PENDING',
      title: 'Journal post awaiting review',
      message: `"${e.journalTitle}" needs approval.`,
      actionUrl: `/admin/journal/${e.journalId}`,
    });
  }

  @OnEvent('support.ticket_created')
  async onSupportTicketCreated(e: { subject: string; ticketId: string }) {
    await this.sendToAllAdmins({
      type: 'ADMIN_SUPPORT_TICKET',
      title: 'New support ticket',
      message: `Ticket: "${e.subject}"`,
      actionUrl: `/admin/support/tickets/${e.ticketId}`,
    });
  }

  @OnEvent('support.email_received')
  async onSupportEmailReceived(e: { subject: string; emailId: string }) {
    await this.sendToAllAdmins({
      type: 'ADMIN_SUPPORT_EMAIL',
      title: 'New support email',
      message: `"${e.subject}"`,
      actionUrl: `/admin/support/emails/${e.emailId}`,
    });
  }

  @OnEvent('report.created')
  async onReportCreated(e: { productTitle: string; reportId: string }) {
    await this.sendToAllAdmins({
      type: 'ADMIN_REPORT',
      title: 'New product report',
      message: `"${e.productTitle}" has been reported and needs action.`,
      actionUrl: `/admin/reports/${e.reportId}`,
    });
  }
}
