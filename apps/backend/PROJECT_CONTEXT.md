# Project Context — rightkitkatie-devscout-nest

> Paste this file into any AI agent to get full context for building features or fixing bugs.

---

## What This Project Is

A full-stack **marketplace platform** (think Etsy-style) for handmade, vintage, and customized goods. It has:

- A **NestJS REST API** (this repo root — `src/`)
- A **React admin dashboard** (`admin-dashboard/`) built with Refine + Ant Design + Vite
- A **PostgreSQL** database with **multi-schema** Prisma setup
- **Redis** for caching and OTP storage
- **Stripe** for payments, seller onboarding, and payouts
- **AWS S3-compatible** object storage (RustFS) for media
- **Twilio** for SMS OTP
- **Nodemailer/Gmail SMTP** for email

The project name in code/domain is **WabiSaviArt** (wabisabiart.com).

---

## Tech Stack

| Layer            | Technology                                                 |
| ---------------- | ---------------------------------------------------------- |
| Runtime          | Node.js (ESM, `"type": "module"`)                          |
| Framework        | NestJS v11                                                 |
| Language         | TypeScript 5.7                                             |
| ORM              | Prisma v7 (multi-schema, `@prisma/adapter-pg`)             |
| Database         | PostgreSQL (multi-schema)                                  |
| Cache            | Redis via `cache-manager-redis-store` + `ioredis`          |
| Validation       | `nestjs-zod` + Zod v4                                      |
| Auth             | JWT (cookie-based) + Google OAuth2 + OTP (email/SMS)       |
| Payments         | Stripe v22 (PaymentIntent + Checkout Sessions + Connect)   |
| Media            | AWS S3 SDK → RustFS (S3-compatible)                        |
| Email            | Nodemailer (Gmail SMTP)                                    |
| SMS              | Twilio                                                     |
| Views            | Handlebars (HBS) for email templates                       |
| Admin UI         | React + Refine + Ant Design + Vite (in `admin-dashboard/`) |
| Package Manager  | pnpm (root) / bun (used in prod start script)              |
| Containerization | Docker + Docker Compose                                    |

---

## Project Structure

```
/
├── src/                         # NestJS API source
│   ├── main.ts                  # Bootstrap: CORS, cookies, session, seeds, port
│   ├── app.module.ts            # Root module — imports all feature modules
│   ├── app.controller.ts / app.service.ts
│   ├── common/
│   │   ├── exceptions.filter.ts # Global exception filter
│   │   └── response.utils.ts
│   ├── decorators/
│   │   ├── auth.decorator.ts    # @Auth('role') shorthand guard + decorator
│   │   ├── current-user.decorator.ts  # @CurrentUser('id') param decorator
│   │   └── query-builder.decorator.ts # @QueryBuilder() for pagination/filter/sort
│   ├── interceptors/
│   │   └── response.interceptor.ts  # Wraps all responses in standard envelope
│   ├── media/                   # S3/RustFS file upload module
│   ├── module/                  # Feature modules (see below)
│   ├── services/
│   │   ├── redis.service.ts     # Redis client + token blacklist
│   │   ├── otp.service.ts       # OTP generate/send/verify (email + SMS)
│   │   ├── email.service.ts     # Nodemailer email sending
│   │   └── twilio.service.ts    # Twilio SMS
│   ├── types/                   # TypeScript type declarations
│   ├── utils/
│   │   └── media-url.util.ts    # Build public media URLs
│   └── view/
│       ├── pages/index.hbs      # Admin login page (session-based)
│       └── templates/           # Email HBS templates (OTP, welcome)
├── ../packages/db/              # Prisma schema, migrations, client, and seeders
├── admin-dashboard/             # React admin SPA (Refine + Ant Design)
│   └── src/
│       ├── api/                 # API call functions per resource
│       ├── components/          # Reusable UI components
│       ├── pages/               # Route pages per resource
│       ├── providers/           # dataProvider.ts (Refine data provider)
│       └── resources/           # Refine resource definitions
├── api_collections/             # Postman collections for all endpoints
├── public/                      # Static files served at root
├── SQL/                         # Raw SQL dump
├── docker-compose.yml
├── .env                         # Environment variables (see section below)
└── package.json
```

---

## Feature Modules (`src/module/`)

### `auth` — Authentication

- POST `/api/v1/auth/login` — Email/password login, sets JWT cookie
- POST `/api/v1/auth/google` — Google OAuth2 login
- POST `/api/v1/auth/verifyTwoFactorAuth` — Verify 2FA OTP
- POST `/api/v1/auth/forget-password` — Send forget-password OTP
- POST `/api/v1/auth/verify-forget-password-otp` — Verify OTP, returns short-lived token
- POST `/api/v1/auth/reset-password` — Reset password (consumes token, blacklists it in Redis)
- POST `/api/v1/auth/logout` — Clears JWT cookie

**JWT** is stored in an `httpOnly` cookie named by `ACCESS_TOKEN_COOKIE_NAME` env var. Token payload: `{ id, email, role, stayLoggedIn, rememberUntil }`.

---

### `user` — Users & Shops

- POST `/api/v1/user` — Register new user
- POST `/api/v1/user/send-email-otp` / `verify-email-otp` — Email verification flow
- POST `/api/v1/user/send-phone-otp` / `verify-phone-otp` — Phone verification flow
- POST `/api/v1/user/two-factor-otp` / `toggle-two-factor-verification` — 2FA management
- GET `/api/v1/user/profile` — Get own profile (any authenticated user)
- PATCH `/api/v1/user/profile` — Update own profile
- PATCH `/api/v1/user/seller-profile` — Update seller profile (seller only)
- GET `/api/v1/user/shops/featured` — Public: list featured shops
- GET `/api/v1/user/shops/:shopId/public` — Public: shop details
- GET `/api/v1/user/admin/shops` — Admin: list all shops
- GET `/api/v1/user/admin/shops/:sellerId` — Admin: shop detail
- PATCH `/api/v1/user/admin/shops/:sellerId/featured` — Admin: toggle featured
- PATCH `/api/v1/user/admin/shops/:sellerId/approve` — Admin: approve shop request
- PATCH `/api/v1/user/admin/shops/:sellerId/reject` — Admin: reject shop request
- POST `/api/v1/user/setup-shop` — Seller: submit shop setup request

**User roles:** `customer`, `seller`, `admin`, `support`

---

### `product` — Products

- POST `/api/v1/product` — Create product (seller)
- GET `/api/v1/product` — List products (public, paginated, filterable)
- GET `/api/v1/product/best-deals` — Products with discounts (public)
- GET `/api/v1/product/my-products` — Seller's own products
- GET `/api/v1/product/pending_review` — Products awaiting admin review (admin)
- GET `/api/v1/product/my-listing-status` — Seller listing status summary
- GET `/api/v1/product/:id` — Single product detail
- PATCH `/api/v1/product/:id` — Update product (seller)
- DELETE `/api/v1/product/:id` — Soft delete (seller)
- POST `/api/v1/product/variant/:id` — Add variant to product (seller)
- PATCH `/api/v1/product/status/:id` — Change product status (admin: active/rejected/etc.)
- PATCH `/api/v1/product/refill-stock/:variantId` — Refill stock (seller)
- DELETE `/api/v1/product/variant/:variantId` — Remove variant (seller)

**Product statuses:** `draft`, `pending_review`, `active`, `inactive`, `out_of_stock`, `rejected`

---

### `category` — Categories & Subcategories

- POST `/api/v1/category` — Create category (admin)
- POST `/api/v1/category/subcategory` — Create subcategory (admin)
- POST `/api/v1/category/featured/:id` — Toggle featured (admin)
- POST `/api/v1/category/good-for-gift/:id` — Toggle "good for gift" flag (admin)
- GET `/api/v1/category` — List all categories
- GET `/api/v1/category/featured` — Featured categories with products
- GET `/api/v1/category/good-for-gift` — Good-for-gift categories
- GET `/api/v1/category/best-selling` — Best selling categories (paginated)
- GET `/api/v1/category/:id` — Single category
- DELETE `/api/v1/category/:id` — Remove category (admin)
- DELETE `/api/v1/category/subcategory/:id` — Remove subcategory (admin)

**Category types:** `crafts`, `customization`, `commissions`, `vintage`

---

### `cart` — Shopping Cart

- POST `/api/v1/cart` — Add item to cart
- GET `/api/v1/cart` — Get my cart
- GET `/api/v1/cart/calculate` — Calculate cart totals (supports `?coupon=CODE`)
- GET `/api/v1/cart/all` — All carts (admin)
- PATCH `/api/v1/cart` — Update item quantity
- DELETE `/api/v1/cart` — Remove item from cart

---

### `order` — Orders, Refunds, Disputes

**Customer:**

- POST `/api/v1/orders/coupon/preview` — Preview coupon discount (read-only)
- POST `/api/v1/orders/checkout` — Place order from cart
- GET `/api/v1/orders/my` — Order history (`?view=unshipped|undelivered|past`)
- GET `/api/v1/orders/my/:id` — Order detail
- PATCH `/api/v1/orders/my/:id/cancel` — Request cancellation
- POST `/api/v1/orders/my/:id/dispute` — Open dispute
- POST `/api/v1/orders/my/:id/refund-request` — Request refund
- GET `/api/v1/orders/my/:id/history` — Order status history

**Seller:**

- GET `/api/v1/orders/seller` — Seller orders (`?view=pending_shipment|past_due|delivery_delays|refund_requests|disputes|past`)
- GET `/api/v1/orders/seller/order-summary` — Order summary stats
- GET `/api/v1/orders/seller/:id` — Order detail
- PATCH `/api/v1/orders/seller/:id/ship` — Mark shipped
- PATCH `/api/v1/orders/seller/:id/deliver` — Mark delivered
- PATCH `/api/v1/orders/seller/:id/cancel` — Cancel order
- POST `/api/v1/orders/seller/:id/refund` — Process refund
- GET `/api/v1/orders/seller/:id/invoice` — Invoice data
- GET `/api/v1/orders/seller/:id/shipping-label` — Shipping label data
- GET `/api/v1/orders/seller/:id/history` — Status history

**Admin:**

- GET `/api/v1/orders/admin` — All orders (`?view=cancel_requests|disputes|processing|shipped|delivered|cancelled|refunded`)
- GET `/api/v1/orders/admin/:id` — Full order detail
- PATCH `/api/v1/orders/admin/:id/approve-cancel` — Approve cancel request
- PATCH `/api/v1/orders/admin/:id/reject-cancel` — Reject cancel request
- PATCH `/api/v1/orders/admin/:id/resolve-dispute` — Resolve dispute
- GET `/api/v1/orders/admin/payouts/pending` — Pending seller payouts
- POST `/api/v1/orders/admin/:id/release-payout` — Release Stripe transfer to seller
- GET `/api/v1/orders/admin/refund-requests` — All pending refund requests
- PATCH `/api/v1/orders/admin/refunds/:refundId/approve` — Approve refund (triggers Stripe)
- PATCH `/api/v1/orders/admin/refunds/:refundId/reject` — Reject refund

**Order statuses:** `pending_payment` → `paid` → `processing` → `shipped` → `in_transit` → `delivered` | `cancelled` | `refunded` | `disputed` | `payment_failed`

---

### `stripe` — Stripe Payments

- POST `/api/v1/stripe/seller/onboard` — Start Stripe Connect onboarding (seller)
- GET `/api/v1/stripe/seller/dashboard-link` — Stripe Express dashboard link
- GET `/api/v1/stripe/seller/onboarding-status` — Check onboarding status (syncs from Stripe)
- POST `/api/v1/stripe/checkout/intent` — Create PaymentIntent (customer)
- POST `/api/v1/stripe/checkout/session` — Create Checkout Session (customer)
- POST `/api/v1/stripe/refund` — Refund order (admin)
- GET `/api/v1/stripe/payment-methods` — List saved cards (customer)
- DELETE `/api/v1/stripe/payment-methods/:pmId` — Detach saved card
- POST `/api/v1/stripe/webhook` — Stripe webhook receiver

**Webhook events handled:** `checkout.session.completed`, `payment_intent.succeeded`, `payment_intent.payment_failed`, `payment_intent.canceled`, `charge.refunded`, `charge.dispute.created`, `account.updated`, `account.application.deauthorized`

---

### `marketing` — Coupons, Promotions, Free Shipping, Wishlist Coupons

**Coupons** (`/api/v1/seller/marketing/coupons`) — seller-scoped:

- GET / POST — List / create coupons
- GET `/generate-code` — Generate random coupon code
- GET `/stats` — Coupon dashboard stats
- GET/PATCH/DELETE `/:id` — Get / update / delete coupon
- PATCH `/:id/toggle` — Toggle active state

**Promotions** (`/api/v1/seller/marketing/promotions`) — seller-scoped:

- GET / POST — List / create promotions
- GET `/overview` — Overview stats
- GET/PATCH/DELETE `/:id` — Get / update / delete promotion
- PATCH `/:id/toggle` — Toggle active state

**Free Shipping** (`/api/v1/seller/marketing/free-shipping`) — seller-scoped:

- GET/PATCH `/config` — Get / update global free shipping config
- PATCH `/config/toggle` — Toggle global config on/off
- GET/POST `/rules` — List / create per-product/category rules
- GET `/stats` — Dashboard stats
- PATCH/DELETE/PATCH(toggle) `/rules/:id`

**Wishlist Coupons** (`/api/v1/seller/marketing/wishlist-coupons`) — seller-scoped:

- GET/PATCH `/config` — Get / update auto-coupon config
- PATCH `/config/toggle` — Enable/disable
- GET `/stats` — Stats
- GET `/activity` — Recent coupon activity

---

### `wishlist` — Wishlist Collections

- POST `/api/v1/wishlist/collection` — Create collection
- GET `/api/v1/wishlist/collections` — All collections
- GET `/api/v1/wishlist/collection/:id` — Collection with items
- PATCH `/api/v1/wishlist/collection/:id` — Update collection
- DELETE `/api/v1/wishlist/collection/:id` — Delete collection
- POST `/api/v1/wishlist/item` — Add product to wishlist
- GET `/api/v1/wishlist/categories` — Wishlist categories
- PUT `/api/v1/wishlist/item/:id` — Move item to different collection
- DELETE `/api/v1/wishlist/item/:id` — Remove item
- GET `/api/v1/wishlist/items` — Items with pagination/filter (`?type=Items|Collections&id=<collectionId>`)

---

### `review` — Product Reviews

- POST `/api/v1/review` — Create review
- GET `/api/v1/review` — List all reviews
- GET `/api/v1/review/:id` — Single review
- PATCH `/api/v1/review/:id` — Update review
- DELETE `/api/v1/review/:id` — Remove review

**Review statuses:** `pending`, `approved`, `rejected`, `flagged`

---

### `journal` — Shop Journals / Blog Posts

- GET `/api/v1/journal` — Public list of published journals
- POST `/api/v1/journal` — Create journal (seller)
- GET `/api/v1/journal/my` — Seller's own journals
- GET `/api/v1/journal/my/status` — Journal status summary
- GET `/api/v1/journal/:id` — Single journal (public)
- PATCH `/api/v1/journal/:id` — Update (seller, own journals)
- DELETE `/api/v1/journal/:id` — Delete (seller, own journals)
- POST `/api/v1/journal/like-unlike/:id` — Like/unlike (`?action=like|unlike`)
- POST `/api/v1/journal/comment/:id` — Add comment
- POST `/api/v1/journal/reply/:commentId` — Reply to comment
- DELETE `/api/v1/journal/comment/:commentId` — Delete comment
- DELETE `/api/v1/journal/reply/:replyId` — Delete reply
- GET `/api/v1/journal/admin` — Admin: all journals with views filter
- GET `/api/v1/journal/admin/:id` — Admin: journal detail
- PATCH `/api/v1/journal/admin/:id/status` — Admin: `publish | reject | block`

**Journal statuses:** `draft`, `pending_review`, `published`, `archived`, `rejected`, `blocked` (called `publishing_request` in flow)

---

### `address` — User Addresses

- POST `/api/v1/address` — Create address
- GET `/api/v1/address` — List own addresses
- GET `/api/v1/address/default?type=shipping|billing` — Get default address
- GET `/api/v1/address/:id` — Single address
- PATCH `/api/v1/address/:id` — Update
- DELETE `/api/v1/address/:id` — Remove
- PATCH `/api/v1/address/default/:id?type=shipping|billing` — Set as default

---

### `insights` — Analytics (Seller + Admin)

All routes support `?range=7|30|90|365` (days). Admin routes optionally accept `?sellerId=`.

**Seller:** `/api/v1/insights/seller/...`

- `sales-income` — Revenue, order count, avg order value, trend
- `top-products` — Top products by revenue (`?limit=10`)
- `wishlist-analytics` — Wishlist adds, conversions
- `sales-by-category` — Category breakdown
- `customers-by-region` — Customer geo distribution

**Admin:** `/api/v1/insights/admin/...` (same endpoints, platform-wide)

---

### `seller-dashboard` — Seller Dashboard Widgets

All routes `@Auth(seller)`. Range param: `?range=7|30|90|365`.

**Orders:** `/api/v1/seller-dashboard/orders/...`

- `summary`, `status-breakdown`, `past-due`, `delivery-delays`, `refunds`, `disputes`

**Marketing:** `/api/v1/seller-dashboard/marketing/...`

- `summary`, `activity-feed`, `engagement-metrics`, `top-products`, `customer-growth`

**Customers:** `/api/v1/seller-dashboard/customers/...`

- `stats`, `list`, `engagement-metrics`, `regional-breakdown`

**Insights:** `/api/v1/seller-dashboard/insights/...`

- `net-income`, `top-products-status`, `inventory-health`, `revenue-breakdown`

---

### `seller-settings` — Seller Settings

- GET `/api/v1/seller-settings/overview` — Full settings overview
- PATCH `/api/v1/seller-settings/profile` — Update profile
- PATCH `/api/v1/seller-settings/store` — Update store settings
- GET/POST `/api/v1/seller-settings/authenticity/submit` — Authenticity proof
- GET `/api/v1/seller-settings/security` — Security settings
- PATCH `/api/v1/seller-settings/security/password` — Change password
- GET `/api/v1/seller-settings/billing-fees` — Platform fee info (seller view)
- GET/PATCH `/api/v1/seller-settings/admin/billing-fees` — Admin: manage platform fees

---

### `support` — Support Tickets & Emails

- GET/POST `/api/v1/support/seller/tickets` — Seller support tickets
- GET `/api/v1/support/seller/tickets/:id` — Ticket detail
- POST `/api/v1/support/seller/email` — Send support email
- GET `/api/v1/support/admin/emails` — Admin: all support emails
- GET `/api/v1/support/admin/tickets` — Admin: all tickets
- GET `/api/v1/support/admin/tickets/:id` — Admin: ticket detail
- PATCH `/api/v1/support/admin/tickets/:id` — Admin: update ticket status

**Ticket categories:** `ACCOUNT_LOGIN`, `BILLING_PAYMENTS`, `TECHNICAL_ERROR_BUG`, `FEATURE_REQUEST`, `DATA_LOSS_RECOVERY`, `PRIVACY_SECURITY`, `INTEGRATION_API`, `PERFORMANCE_SLOWDOWN`, `REPORTING_ANALYTICS`, `OTHER`

**Ticket statuses:** `OPEN`, `IN_PROGRESS`, `RESOLVED`, `CLOSED`

---

### `customers` — Customer Management

- GET `/api/v1/customers` — List all customers (admin, Refine-compatible)
- GET `/api/v1/customers/:id` — Customer detail (admin)
- GET `/api/v1/customers/admin` — Admin customer list (with full query builder)
- GET `/api/v1/customers/admin/:customerId` — Admin customer detail
- PATCH `/api/v1/customers/:customerId/status` — Activate/deactivate
- GET `/api/v1/customers/seller` — Seller's customers (only buyers who purchased from them)

---

### `media` — File Upload (S3/RustFS)

- POST `/api/v1/media/upload` — Upload single file (multipart, field `file`)
- POST `/api/v1/media/upload-multiple` — Upload up to 20 files (field `files`)
- DELETE `/api/v1/media/delete?key=...` — Delete file by key
- GET `/api/v1/media/url/:key` — Get public + signed URL for a file

Optional `customFolder` body param to organize uploads into subfolders.

---

## Database Schema (Prisma Multi-Schema)

Each schema maps to a PostgreSQL schema namespace:

| Schema         | Models                                                                                                                                                                                                             |
| -------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| `user`         | User, Address, SellerProfile, ShopSetupRequest                                                                                                                                                                     |
| `product`      | Product, ProductVariant                                                                                                                                                                                            |
| `category`     | Category, SubCategory                                                                                                                                                                                              |
| `order`        | Order, OrderItem, OrderStatusHistory                                                                                                                                                                               |
| `payment`      | PaymentMethod, PaymentTransaction                                                                                                                                                                                  |
| `shipment`     | Shipment, ShipmentTrackingUpdate                                                                                                                                                                                   |
| `refund`       | Refund, RefundAnalytics                                                                                                                                                                                            |
| `dispute`      | Dispute, DisputeMessage                                                                                                                                                                                            |
| `coupon`       | Coupon, CouponUsageLog                                                                                                                                                                                             |
| `promotion`    | Promotion, PromotionUsageLog                                                                                                                                                                                       |
| `cart`         | Cart, CartItem                                                                                                                                                                                                     |
| `wishlist`     | Wishlist, WishlistItem, WishlistAutoCouponConfig, WishlistCouponLog                                                                                                                                                |
| `review`       | Review                                                                                                                                                                                                             |
| `notification` | Notification, Announcement                                                                                                                                                                                         |
| `message`      | Conversation, ChatMessage                                                                                                                                                                                          |
| `support`      | SupportTicket, SupportEmail                                                                                                                                                                                        |
| `customer`     | CustomerMetrics                                                                                                                                                                                                    |
| `seller`       | SellerPayout                                                                                                                                                                                                       |
| `others`       | ActivityLog, Report, SearchHistory, InventoryReservation, FreeShippingRule, GlobalFreeShippingConfig, PlatformFeeSetting, ShopJournal, ShopJournalComment, ShopJournalCommentReply, ShopJournalLikes, ShopFollower |
| `enums`        | (all enum types)                                                                                                                                                                                                   |

**Key model relationships:**

- `User` → `SellerProfile` (1:1, seller only)
- `User` → `ShopSetupRequest` (1:1, seller applicants)
- `SellerProfile` → `Order[]`, `Product[]`, `Coupon[]`, `Promotion[]`, `FreeShippingRule[]`
- `Order` → `OrderItem[]`, `PaymentTransaction[]`, `Shipment[]`, `Refund[]`, `Dispute[]`, `OrderStatusHistory[]`
- `Product` → `ProductVariant[]`, `OrderItem[]`, `CartItem[]`, `WishlistItem[]`, `Review[]`

---

## Auth System

**Guards:**

- `AuthGuard` — validates JWT from cookie or `Authorization: Bearer` header
- `OptionalAuthGuard` — passes even without token (attaches user if present)
- `SellerOwnsCouponGuard`, `SellerOwnsPromotionGuard`, `SellerOwnsFreeShippingRuleGuard` — resource ownership guards

**Decorators:**

- `@Auth('role1', 'role2')` — sets metadata + applies `AuthGuard`; no args = any authenticated user
- `@CurrentUser('id')` — extracts field from `req.user`

**Token flow:**

1. Login → JWT signed with `JWT_SECRET`, set as `httpOnly` cookie
2. All subsequent requests: guard extracts JWT from cookie, verifies, attaches full user + sellerProfile to `req.user`
3. Token blacklist in Redis (used for password reset tokens)

---

## QueryBuilder Decorator

The `@QueryBuilder()` decorator parses URL query params into a Prisma-compatible query object. Supports:

| Param            | Example                  | Effect                             |
| ---------------- | ------------------------ | ---------------------------------- |
| `q`              | `?q=handmade`            | Full-text search on `searchFields` |
| `filter[field]`  | `?filter[status]=active` | Exact match filter                 |
| `sort`           | `?sort=createdAt:desc`   | Order by                           |
| `page` / `limit` | `?page=2&limit=20`       | Pagination                         |
| enum/boolean     | auto-casts               | Enum and boolean field coercion    |

---

## Standard API Response Envelope

All responses go through `ResponseInterceptor`:

```json
{
  "statusCode": 200,
  "message": "Success",
  "data": { ... }
}
```

Paginated list response:

```json
{
  "data": {
    "items": [...],
    "page": 1,
    "limit": 10,
    "total": 100
  }
}
```

Errors from `ExceptionsFilter`:

```json
{
  "statusCode": 400,
  "message": "Error message",
  "error": "Bad Request"
}
```

---

## Environment Variables

```env
# Server
PORT=8080

# Database
DATABASE_URL=postgresql://user:pass@host:port/db?schema=public

# CORS (comma-separated origins)
CORS_ORIGINS=http://localhost:5173,https://wabisabiart.com

# Google OAuth
GOOGLE_CLIENT_ID=...
GOOGLE_CLIENT_SECRET=...

# S3/RustFS Media
ENDPOINT=https://media.domani.com
BUCKET_NAME=rightkitkatie-media
ACCESS_KEY_ID=...
SECRET_ACCESS_KEY=...
DEFAULT_AVATAR_URL=placeholders/profile-placeholder.png
DEFAULT_IMAGE_URL=placeholders/image-placeholder.png

# Auth
JWT_SECRET=...
ACCESS_TOKEN_COOKIE_NAME=wsa-access-token
BCRYPT_SALT_OR_ROUNDS=10
ADMIN_SESSION_SECRET=...

# Redis
REDIS_HOST=localhost
REDIS_PORT=6379
REDIS_PASSWORD=...

# Email (SMTP)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=...
SMTP_PASS=...
SMTP_FROM=WabiSaviArt <email>
APP_URL=http://localhost:8080
VERIFY_EMAIL_URL_WEBHOOKS=http://localhost:8080

# Twilio
TWILIO_ACCOUNT_SID=...
TWILIO_AUTH_TOKEN=...
TWILIO_PHONE_NUMBER=+1...

# Seed Admin
ADMIN_EMAIL=admin@admin.com
ADMIN_FULL_NAME=Admin User
ADMIN_AVATAR_URL=placeholders/seed-admin.jpg
ADMIN_PASSWORD=admin@admin.com

# Stripe
STRIPE_SECRET_KEY=sk_test_...
STRIPE_PUBLISHABLE_KEY=pk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...
FRONTEND_URL=http://localhost:3000
```

---

## Startup Behavior (`main.ts`)

1. Sets global prefix: `api/v1`
2. Enables CORS from `CORS_ORIGINS` env
3. Attaches `cookie-parser` and `express-session`
4. Serves `public/` as static files (avatars, placeholders, logos)
5. Serves `admin-dashboard/dist/` as static files (React SPA)
6. Registers global `ZodValidationPipe` and `ExceptionsFilter`
7. Runs `seedAdmin()` and `seedCategories()` on every startup (idempotent)
8. Listens on `PORT`

---

## Admin Dashboard (`admin-dashboard/`)

React SPA served from the same NestJS server at the root URL (non-`/api/v1` paths). Built with:

- **Refine** — data fetching, routing, CRUD
- **Ant Design** — UI components
- **Recharts** — Charts/graphs
- **Google Maps** (delivery map widget)

Resources managed: Dashboard, Orders, Customers, Products, Stores, Couriers, Categories, Billing Fees, Journals, Insights, Support, Authenticity

The `dataProvider.ts` calls the NestJS API using Refine's simple REST convention.

---

## Docker Setup

```yaml
# docker-compose.yml
services:
  api:
    build: .
    ports: ['8080:8080']
    networks: [app-network] # external network shared with DB/Redis/RustFS containers
```

**External services** (DB, Redis, RustFS) are expected to already exist on `app-network`. Create with:

```bash
docker network create rightkitkatie-services
docker network connect rightkitkatie-services <db-container>
docker network connect rightkitkatie-services <redis-container>
```

Run:

```bash
docker compose --env-file /dev/null up --build
```

---

## Dev Commands

```bash
bun install            # Install workspace dependencies
bun run dev:backend    # Development (watch mode)
bun run build:backend  # Build the backend and its database package
bunx turbo test --filter=@wabisabiart/backend
bun run db:generate    # Generate Prisma client from packages/db
```

---

## Database Commands

Database schema, migrations, client generation, and seeders live in `packages/db`.
The backend consumes the shared `@wabisabiart/db` package.

```bash
bun run db:generate
bun run db:migrate
bun run db:migrate:deploy
bun run db:seed
```

---

## Known Patterns & Conventions

- **Module structure:** Every feature = `module/`, `controller/`, `service/`, `dto/`, `entities/` (optional)
- **DTOs use Zod** via `nestjs-zod` — define schema with `z.object()`, export with `createZodDto()`
- **All controller methods** return plain objects; `ResponseInterceptor` wraps them
- **Seller identity:** In seller routes, `req.user?.sellerProfile?.id` is the `sellerId` used in DB queries
- **Guard pattern:** `@Auth('seller')` = `@SetMetadata(ROLES_KEY, ['seller']) @UseGuards(AuthGuard)`
- **Pagination:** All list endpoints use `QueryBuilder` + return `{ items, page, limit, total }`
- **Soft deletes:** Products use `deletedAt` timestamp; users use `isActive` flag
- **Seeds are idempotent** — safe to run on every startup (upsert pattern)
- **Multi-cart support:** Cart is per-seller; one user can have cart items from multiple sellers, each creates a separate order on checkout
