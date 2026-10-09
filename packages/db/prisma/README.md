# RightKitKatie E-commerce Database - Prisma Schema

A comprehensive Prisma ORM schema for a production-ready Etsy-like e-commerce platform.

## 🚀 Features

- **Complete E-commerce Support**: Users, sellers, products, orders, payments, shipments
- **Advanced Product Management**: Variants, images, tags, categories
- **Full Order Lifecycle**: From cart to delivery with tracking
- **Payment Processing**: Stripe integration support with multiple payment methods
- **Review System**: Product reviews with seller responses
- **Coupon System**: Multiple discount types (percentage, fixed, free shipping, BOGO)
- **Dispute Management**: Order disputes with messaging
- **Analytics**: Product views, search history, activity logs
- **Wishlist & Cart**: Shopping cart and wishlist functionality
- **Notifications**: User notification system

## 📋 Prerequisites

- Node.js 18+ or Bun
- PostgreSQL 14+
- Prisma 5.x (latest)

## 🛠️ Installation

### 1. Install Prisma

```bash
npm install prisma @prisma/client --save-dev
# or
bun add -d prisma @prisma/client
```

### 2. Set up PostgreSQL Extensions

Before running migrations, ensure these PostgreSQL extensions are installed:

```sql
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pg_trgm";      -- For fuzzy text search
CREATE EXTENSION IF NOT EXISTS "pgcrypto";     -- For encryption
```

### 3. Configure Database Connection

Create a `.env` file in your project root:

```env
DATABASE_URL="postgresql://username:password@localhost:5432/rightkitkatie_db?schema=public"
```

### 4. Generate Prisma Client

```bash
npx prisma generate
# or
bunx prisma generate
```

### 5. Create Database and Run Migrations

```bash
# Create migration from schema
npx prisma migrate dev --name init

# or if database already exists with schema
npx prisma db pull  # Pull existing schema
npx prisma generate  # Generate client
```

## 📚 Usage Examples

### Initialize Prisma Client

```typescript
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// Enable query logging (optional, for development)
const prisma = new PrismaClient({
  log: ['query', 'info', 'warn', 'error'],
});
```

### User Management

```typescript
// Create a new user
const user = await prisma.user.create({
  data: {
    email: 'user@example.com',
    passwordHash: 'hashed_password_here',
    firstName: 'John',
    lastName: 'Doe',
    displayName: 'johndoe',
  },
});

// Find user with seller profile
const userWithProfile = await prisma.user.findUnique({
  where: { email: 'user@example.com' },
  include: { sellerProfile: true },
});
```

### Seller Profile

```typescript
// Create seller profile
const seller = await prisma.sellerProfile.create({
  data: {
    userId: user.id,
    shopName: 'Amazing Crafts',
    shopSlug: 'amazing-crafts',
    shopDescription: 'Handmade crafts with love',
    isVerified: true,
  },
});

// Update seller stats
await prisma.sellerProfile.update({
  where: { id: seller.id },
  data: {
    totalSales: { increment: 1 },
    averageRating: 4.8,
  },
});
```

### Product Management

```typescript
// Create product with images and tags
const product = await prisma.product.create({
  data: {
    title: 'Handmade Leather Wallet',
    slug: 'handmade-leather-wallet',
    description: 'Beautiful handcrafted leather wallet',
    price: 49.99,
    quantity: 50,
    status: 'active',
    sellerId: seller.id,
    categoryId: category.id,
    images: {
      create: [
        {
          imageUrl: 'https://example.com/image1.jpg',
          isPrimary: true,
          displayOrder: 0,
        },
        {
          imageUrl: 'https://example.com/image2.jpg',
          displayOrder: 1,
        },
      ],
    },
    tags: {
      create: [
        {
          tag: {
            connectOrCreate: {
              where: { slug: 'leather' },
              create: { name: 'Leather', slug: 'leather' },
            },
          },
        },
        {
          tag: {
            connectOrCreate: {
              where: { slug: 'wallet' },
              create: { name: 'Wallet', slug: 'wallet' },
            },
          },
        },
      ],
    },
  },
  include: {
    images: true,
    tags: { include: { tag: true } },
  },
});

// Get products with relations
const products = await prisma.product.findMany({
  where: {
    status: 'active',
    deletedAt: null,
  },
  include: {
    images: { where: { isPrimary: true } },
    seller: { select: { shopName: true, shopSlug: true } },
    category: true,
  },
  orderBy: { createdAt: 'desc' },
  take: 20,
});
```

### Product Variants

```typescript
// Create product with variants
const productWithVariants = await prisma.product.create({
  data: {
    // ... product data
    variants: {
      create: [
        {
          name: 'Small - Black',
          sku: 'WALLET-SM-BLK',
          price: 49.99,
          quantity: 20,
          option1Name: 'Size',
          option1Value: 'Small',
          option2Name: 'Color',
          option2Value: 'Black',
        },
        {
          name: 'Large - Brown',
          sku: 'WALLET-LG-BRN',
          price: 59.99,
          quantity: 15,
          option1Name: 'Size',
          option1Value: 'Large',
          option2Name: 'Color',
          option2Value: 'Brown',
        },
      ],
    },
  },
  include: { variants: true },
});
```

### Shopping Cart

```typescript
// Get or create active cart
const cart = await prisma.cart.upsert({
  where: {
    userId_status: {
      userId: user.id,
      status: 'active',
    },
  },
  create: {
    userId: user.id,
    status: 'active',
    expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days
  },
  update: {},
});

// Add item to cart
await prisma.cartItem.create({
  data: {
    cartId: cart.id,
    productId: product.id,
    quantity: 2,
  },
});

// Get cart with items
const cartWithItems = await prisma.cart.findUnique({
  where: { id: cart.id },
  include: {
    items: {
      include: {
        product: {
          include: { images: { where: { isPrimary: true } } },
        },
      },
    },
  },
});
```

### Order Management

```typescript
// Create order
const order = await prisma.order.create({
  data: {
    orderNumber: `ORD-${Date.now()}-${Math.random().toString(36).substring(7).toUpperCase()}`,
    buyerId: user.id,
    sellerId: seller.id,
    status: 'pending_payment',
    subtotal: 99.98,
    shippingCost: 5.0,
    taxAmount: 8.5,
    totalAmount: 113.48,
    items: {
      create: [
        {
          productId: product.id,
          productTitle: product.title,
          productSlug: product.slug,
          quantity: 2,
          unitPrice: 49.99,
          totalPrice: 99.98,
        },
      ],
    },
  },
  include: { items: true },
});

// Update order status
await prisma.order.update({
  where: { id: order.id },
  data: {
    status: 'paid',
    paidAt: new Date(),
  },
});

// Track order status history
await prisma.orderStatusHistory.create({
  data: {
    orderId: order.id,
    status: 'paid',
    note: 'Payment received via Stripe',
  },
});
```

### Payment Processing

```typescript
// Create payment transaction
const payment = await prisma.paymentTransaction.create({
  data: {
    orderId: order.id,
    amount: order.totalAmount,
    currency: 'USD',
    status: 'succeeded',
    provider: 'stripe',
    providerTransactionId: 'ch_1234567890',
    processedAt: new Date(),
  },
});
```

### Shipment Tracking

```typescript
// Create shipment
const shipment = await prisma.shipment.create({
  data: {
    orderId: order.id,
    carrier: 'USPS',
    trackingNumber: '1Z999AA10123456784',
    trackingUrl:
      'https://tools.usps.com/go/TrackConfirmAction?tLabels=1Z999AA10123456784',
    status: 'label_created',
    estimatedDeliveryDate: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000),
  },
});

// Add tracking update
await prisma.shipmentTrackingUpdate.create({
  data: {
    shipmentId: shipment.id,
    status: 'in_transit',
    description: 'Package picked up',
    location: 'New York, NY',
    occurredAt: new Date(),
  },
});
```

### Reviews

```typescript
// Create review
const review = await prisma.review.create({
  data: {
    productId: product.id,
    userId: user.id,
    orderId: order.id,
    rating: 5,
    title: 'Excellent quality!',
    comment: "Best wallet I've ever owned. Highly recommend!",
    verifiedPurchase: true,
    status: 'approved',
  },
});

// Add seller response
await prisma.review.update({
  where: { id: review.id },
  data: {
    sellerResponse: 'Thank you for your kind words!',
    sellerRespondedAt: new Date(),
  },
});
```

### Coupons

```typescript
// Create percentage discount coupon
const coupon = await prisma.coupon.create({
  data: {
    sellerId: seller.id,
    code: 'SUMMER20',
    description: '20% off summer sale',
    type: 'percentage',
    discountValue: 20,
    minimumPurchase: 50,
    usageLimit: 100,
    usageLimitPerUser: 1,
    startsAt: new Date(),
    expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days
  },
});

// Apply coupon to order
const orderWithCoupon = await prisma.order.create({
  data: {
    // ... order data
    couponId: coupon.id,
    couponCode: coupon.code,
    discountAmount: 20,
  },
});
```

### Search & Analytics

```typescript
// Track product view
await prisma.productView.create({
  data: {
    productId: product.id,
    userId: user.id,
    sessionId: 'session_123',
    ipAddress: '192.168.1.1',
    userAgent: 'Mozilla/5.0...',
  },
});

// Save search history
await prisma.searchHistory.create({
  data: {
    userId: user.id,
    query: 'leather wallet',
    filters: { category: 'accessories', priceRange: [0, 100] },
    resultsCount: 25,
  },
});

// Get popular products
const popularProducts = await prisma.product.findMany({
  where: { status: 'active' },
  orderBy: { viewCount: 'desc' },
  take: 10,
  include: {
    images: { where: { isPrimary: true } },
    seller: { select: { shopName: true } },
  },
});
```

### Complex Queries

```typescript
// Get seller dashboard stats
const sellerStats = await prisma.sellerProfile.findUnique({
  where: { id: seller.id },
  include: {
    _count: {
      select: {
        products: { where: { status: 'active' } },
        sellerOrders: {
          where: {
            createdAt: { gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) },
          },
        },
      },
    },
    sellerOrders: {
      where: {
        status: { in: ['paid', 'processing', 'shipped'] },
      },
      select: {
        totalAmount: true,
      },
    },
  },
});

// Calculate total revenue
const totalRevenue = sellerStats.sellerOrders.reduce(
  (sum, order) => sum + Number(order.totalAmount),
  0,
);

// Get products needing restock
const lowStockProducts = await prisma.product.findMany({
  where: {
    sellerId: seller.id,
    quantity: { lte: prisma.product.fields.lowStockThreshold },
    status: 'active',
    trackInventory: true,
  },
  select: {
    id: true,
    title: true,
    quantity: true,
    lowStockThreshold: true,
  },
});
```

## 🔒 Row Level Security (RLS)

The schema includes RLS policies for sensitive tables. When implementing RLS in your application:

```typescript
// Set user context for RLS
await prisma.$executeRaw`SET app.user_id = ${userId}`;

// Then perform queries - RLS policies will automatically apply
const userOrders = await prisma.order.findMany();
```

## 🔄 Transactions

```typescript
// Use transactions for complex operations
const result = await prisma.$transaction(async (tx) => {
  // Create order
  const order = await tx.order.create({ data: orderData });

  // Update product inventory
  await tx.product.update({
    where: { id: productId },
    data: { quantity: { decrement: quantity } },
  });

  // Create inventory reservation
  await tx.inventoryReservation.create({
    data: {
      productId,
      quantity,
      reservedFor: order.id,
      expiresAt: new Date(Date.now() + 15 * 60 * 1000), // 15 minutes
    },
  });

  return order;
});
```

## 📊 Migrations

```bash
# Create a new migration
npx prisma migrate dev --name add_feature_name

# Apply migrations in production
npx prisma migrate deploy

# Reset database (development only)
npx prisma migrate reset
```

## 🎨 Prisma Studio

Explore your database with Prisma Studio:

```bash
npx prisma studio
```

## 🧪 Seeding

Create a seed file `prisma/seed.ts`:

```typescript
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  // Create test users
  const user = await prisma.user.create({
    data: {
      email: 'test@example.com',
      passwordHash: 'hashed_password',
      displayName: 'Test User',
    },
  });

  console.log('Database seeded successfully!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
```

Run seeding:

```bash
npx prisma db seed
```

## ⚡ Performance Tips

1. **Use selective includes**: Only include relations you need
2. **Implement pagination**: Use `skip` and `take` for large result sets
3. **Index optimization**: All foreign keys are already indexed
4. **Connection pooling**: Configure `connection_limit` in DATABASE_URL
5. **Query optimization**: Use `select` to fetch only needed fields

```typescript
// Good - selective fields
const users = await prisma.user.findMany({
  select: { id: true, email: true, displayName: true },
});

// Good - pagination
const products = await prisma.product.findMany({
  skip: (page - 1) * pageSize,
  take: pageSize,
});
```

## 📝 Best Practices

1. Always use transactions for operations affecting multiple tables
2. Implement soft deletes where applicable (deletedAt field)
3. Use enums for status fields to ensure data integrity
4. Denormalize sparingly (like product stats) and keep in sync
5. Implement proper error handling and logging
6. Use connection pooling in production
7. Regularly back up your database
8. Monitor slow queries and optimize indexes

## 🤝 Contributing

This schema is based on production e-commerce requirements and follows PostgreSQL and Prisma best practices.

## 📄 License

MIT

## 🙋 Support

For issues or questions about this schema, please refer to:

- [Prisma Documentation](https://www.prisma.io/docs)
- [PostgreSQL Documentation](https://www.postgresql.org/docs/)
