import { Injectable } from '@nestjs/common';
import { CreateCartDto } from './dto/cart.dto.js';
import { PrismaService } from '@wabisabiart/db';

@Injectable()
export class CartService {
  constructor(private readonly prisma: PrismaService) {}

  private async create(userId: string, createCartDto: CreateCartDto) {
    const cart = await this.prisma.cart.findMany({
      where: { userId },
    });

    const variant = await this.prisma.productVariant.findUnique({
      where: { id: createCartDto.variantId },
    });

    if (!variant) {
      throw new Error('Variant not found');
    }

    if (variant?.quantity < createCartDto.quantity) {
      throw new Error('Out of stock');
    }

    if (cart.length === 0) {
      const cart = await this.prisma.cart.create({
        data: { userId },
      });

      const addedCart = await this.prisma.cartItem.create({
        data: {
          cartId: cart.id,
          productId: createCartDto.productId,
          variantId: createCartDto.variantId,
          quantity: createCartDto.quantity,
        },
      });

      return addedCart;
    }

    const addedCart = await this.prisma.cartItem.create({
      data: {
        cartId: cart[0].id,
        productId: createCartDto.productId,
        variantId: createCartDto.variantId,
        quantity: createCartDto.quantity,
      },
    });

    return addedCart;
  }

  async addToCart(userId: string, createCartDto: CreateCartDto) {
    return await this.create(userId, createCartDto);
  }

  async findAllCart() {
    const cart = await this.prisma.cart.findMany({
      include: { items: { include: { product: true, variant: true } } },
    });

    return cart;
  }

  async cartCalculate(userId: string, couponCode?: string) {
    const cart = await this.prisma.cart.findFirst({
      where: { userId },
      include: {
        items: {
          include: {
            product: {
              select: {
                id: true,
                price: true,
                discountType: true,
                discountValue: true,
                sellerId: true,
              },
            },
          },
        },
      },
    });

    if (!cart || cart.items.length === 0) {
      return {
        totalItems: 0,
        itemsTotal: 0,
        shopDiscount: 0,
        couponDiscount: 0,
        subtotal: 0,
        shipping: 0,
        total: 0,
      };
    }

    let itemsTotal = 0;
    let shopDiscount = 0;

    // Build per-seller subtotals for coupon application
    const sellerSubtotals = new Map<string, number>();

    cart.items.forEach((item) => {
      const price = Number(item.product.price);
      const quantity = item.quantity;
      const itemTotal = price * quantity;
      itemsTotal += itemTotal;

      const discountType = item.product.discountType;
      const discountValue = Number(item.product.discountValue || 0);
      let itemDiscount = 0;

      if (discountType === 'fixed_amount') {
        itemDiscount = discountValue * quantity;
      } else if (discountType === 'percentage') {
        itemDiscount = (itemTotal * discountValue) / 100;
      }
      shopDiscount += itemDiscount;

      const sellerId = item.product.sellerId;
      sellerSubtotals.set(
        sellerId,
        (sellerSubtotals.get(sellerId) ?? 0) +
          Math.max(0, itemTotal - itemDiscount),
      );
    });

    // Apply coupon if provided
    let couponDiscount = 0;
    let couponApplied: {
      code: string;
      sellerId: string;
      productIds: string[];
    } | null = null;
    let freeShipping = false;

    if (couponCode) {
      const normalizedCode = couponCode.trim().toUpperCase();
      const coupon = await this.prisma.coupon.findFirst({
        where: {
          code: normalizedCode,
          sellerId: { in: Array.from(sellerSubtotals.keys()) },
          isActive: true,
          expiresAt: { gt: new Date() },
        },
      });

      if (coupon && coupon.usageCount < coupon.maximumUses) {
        const sellerTotal = sellerSubtotals.get(coupon.sellerId) ?? 0;
        if (sellerTotal >= Number(coupon.minimumPurchaseAmount || 0)) {
          const dv = Number(coupon.discountValue || 0);
          if (coupon.discountType === 'PERCENTAGE') {
            couponDiscount = (sellerTotal * dv) / 100;
            if (coupon.maximumDiscount)
              couponDiscount = Math.min(
                couponDiscount,
                Number(coupon.maximumDiscount),
              );
          } else if (coupon.discountType === 'FIXED') {
            couponDiscount = Math.min(dv, sellerTotal);
          } else if (coupon.discountType === 'FREE_SHIPPING') {
            freeShipping = true;
          }

          const productIds = cart.items
            .filter((i) => i.product.sellerId === coupon.sellerId)
            .map((i) => i.product.id);

          couponApplied = {
            code: coupon.code,
            sellerId: coupon.sellerId,
            productIds,
          };
        }
      }
    }

    const subtotal = itemsTotal - shopDiscount - couponDiscount;
    const shipping = freeShipping ? 0 : subtotal > 0 ? 46.44 : 0;
    const total = subtotal + shipping;

    return {
      totalItems: cart.items.length,
      itemsTotal: Number(itemsTotal.toFixed(2)),
      shopDiscount: Number(shopDiscount.toFixed(2)),
      couponDiscount: Number(couponDiscount.toFixed(2)),
      subtotal: Number(subtotal.toFixed(2)),
      shipping: Number(shipping.toFixed(2)),
      total: Number(total.toFixed(2)),
      ...(couponApplied && { couponApplied }),
    };
  }

  async findMyCart(userId: string) {
    const cart = await this.prisma.cart.findMany({
      where: { userId },
      include: {
        items: {
          include: {
            product: {
              select: {
                id: true,
                title: true,
                price: true,
                discountType: true,
                discountValue: true,
                seller: {
                  select: {
                    sellerProfile: {
                      select: {
                        shopName: true,
                        averageRating: true,
                        totalReviews: true,
                      },
                    },
                  },
                },
              },
            },
            variant: {
              select: {
                id: true,
                mediaUrl: true,
                options: true,
                quantity: true,
              },
            },
          },
        },
      },
    });

    const cartData = cart[0];

    if (!cartData) {
      return cartData;
    }

    return {
      ...cartData,
      items: cartData.items.map((item) => ({
        ...item,
        product: {
          ...item.product,
          finalPrice: this.calculateFinalPrice(
            Number(item.product.price),
            String(item.product.discountType),
            item.product.discountValue ? Number(item.product.discountValue) : 0,
          ),
        },
      })),
    };
  }

  private calculateFinalPrice(
    price: number,
    discountType: string,
    discountValue: number,
  ): number {
    if (discountType === 'fixed_amount') {
      return price - discountValue;
    }
    if (discountType === 'percentage') {
      return price - (price * discountValue) / 100;
    }
    return price;
  }

  async updateQuantity(userId: string, productId: string, quantity: number) {
    const cart = await this.prisma.cart.findMany({
      where: { userId },
    });

    const isVariant = await this.prisma.cartItem.findFirst({
      where: { cartId: cart[0].id, productId },
      include: { variant: true },
    });

    if (!isVariant?.variant) {
      throw new Error('Variant not found');
    }

    if (isVariant.variant?.quantity < quantity) {
      throw new Error('Not enough stock');
    }

    return await this.prisma.cartItem.updateMany({
      where: { cartId: cart[0].id, productId },
      data: { quantity },
    });
  }

  async removeFromCart(userId: string, productId: string) {
    const cart = await this.prisma.cart.findMany({
      where: { userId },
    });

    return await this.prisma.cartItem.deleteMany({
      where: { cartId: cart[0].id, productId },
    });
  }
}
