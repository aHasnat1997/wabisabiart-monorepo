# WabiSaviArt — Multi-Vendor Handmade Goods Marketplace

## Hero Summary

WabiSaviArt is a full-stack multi-vendor marketplace for handmade, vintage, and
customized goods — an Etsy-style platform with three distinct user roles (Buyer,
Seller, Admin), full Stripe Connect payment infrastructure, and a real-time
messaging layer. Built solo as a client project, it spans a NestJS REST API with
20+ domain modules, a React admin dashboard, a PostgreSQL database split across
19 schema namespaces, and is deployed on a VPS via Docker.

---

## The Problem

The client needed a dedicated marketplace for independent makers and artisans to
sell handmade and vintage goods directly to buyers — without relying on a
third-party platform that takes aggressive commissions and offers no control over
the storefront experience.

Specifically, the platform needed to solve three concrete problems that generic
e-commerce tools couldn't handle out of the box:

- **Seller trust** — buyers needed confidence that sellers were legitimate
  makers, not resellers. There was no verification layer anywhere in their
  existing workflow.
- **Payment distribution** — with multiple sellers per transaction, money needed
  to flow correctly to each seller after the platform took its fee, with admin
  oversight before payouts were released.
- **Dispute and refund ownership** — when something went wrong, neither sellers
  nor buyers had a structured way to raise and resolve issues. Everything
  happened over email with no audit trail.

---

## My Role

I designed and built the entire platform solo — from database schema to deployed
Docker containers. That included:

- Architecting the PostgreSQL schema across 19 domain namespaces using Prisma's
  multi-schema setup
- Building the full NestJS API (20+ feature modules, 80+ REST endpoints)
- Implementing Stripe Connect seller onboarding, checkout, and manual payout
  release flows
- Integrating S3-compatible object storage (RustFS) for all media uploads
- Building the Socket.IO real-time chat system with room-based messaging,
  read receipts, and typing indicators
- Building the React admin dashboard (Refine + Ant Design) served from the same
  NestJS process
- Writing all DTOs with Zod via `nestjs-zod`, custom guards, decorators, and a
  reusable `QueryBuilder` decorator for pagination, filtering, and sorting
- Containerizing the full stack with Docker and deploying to a VPS via Dokploy

---

## Technical Decisions & Architecture

### NestJS over Express

NestJS gave me a forced module boundary per domain — `auth`, `order`, `stripe`,
`chat`, `marketing`, etc. — each with its own controller, service, and DTOs.
For a marketplace with this many moving parts (orders, refunds, disputes,
coupons, promotions, payouts, messaging), having the compiler enforce separation
of concerns was worth the overhead. Express would have turned into a mess of
loosely related route files.

### Prisma multi-schema PostgreSQL

Rather than dumping 40+ models into a single schema, I split the database into
19 named PostgreSQL schemas — `user`, `order`, `payment`, `message`, `refund`,
`dispute`, `coupon`, etc. This mirrors the domain boundaries in the API and
makes it immediately clear which part of the system owns which data. Prisma 7's
multi-schema support handles this cleanly, with a `base.prisma` entry point that
pulls in all split schema files.

### JWT in httpOnly cookies + token auto-renewal

JWTs are stored in `httpOnly; secure; sameSite=none` cookies — never in
`localStorage`. The `AuthGuard` handles both HTTP and WebSocket contexts from a
single implementation: for HTTP it extracts from cookie or `Authorization`
header; for WebSocket it parses the cookie from the raw handshake headers. If a
token is expired but `stayLoggedIn` was set at login, the guard silently issues
a new token and sends it back via both the cookie and an `X-Access-Token`
response header — no client-side refresh logic needed.

### Stripe Connect with admin-gated payouts

The payment flow uses Stripe Checkout Sessions and PaymentIntents. When a buyer
pays, the money lands on the platform account. The webhook handler marks the
order `paid` — but the seller doesn't receive funds immediately. An admin must
explicitly approve the payout, at which point the API calls
`stripe.transfers.create` with `source_transaction` pointing at the original
charge, and the platform fee is deducted before the transfer. This is
intentional — it gives the platform a dispute window before releasing funds.
Webhook idempotency is handled by checking order status before any DB write:
`checkout.session.completed` and `payment_intent.succeeded` can both fire for
the same payment, and whichever arrives second silently skips.

### S3-compatible storage via RustFS

Rather than paying for AWS S3 in development and forcing a cloud dependency, I
self-hosted RustFS (an S3-compatible object store) on the same VPS. The AWS SDK
v3 points at the RustFS endpoint with `forcePathStyle: true`. The `MediaService`
auto-creates the bucket on startup if it doesn't exist, applies a public-read
bucket policy, and syncs placeholder images. Files are stored as relative keys
(`images/products/timestamp-filename.jpg`), not full URLs — the public URL is
constructed at response time from the `ENDPOINT` env var, which makes the bucket
URL portable without a DB migration.

### QueryBuilder decorator

Every list endpoint needed pagination, filtering, and sorting. Rather than
duplicating that logic across 20+ services, I built a `@QueryBuilder()` param
decorator that parses URL query params (`?page`, `?limit`, `?sort`,
`?filter[field]`, `?q`) into a Prisma-compatible query object, with automatic
enum and boolean coercion. Controllers pass it directly into an `executeQuery`
helper that wraps `prisma.model.findMany` + `count` and returns the standard
`{ items, page, limit, total }` envelope.

### Discount engine

The checkout flow layers multiple discount types in a defined order: product-
level discounts → active seller promotions (via a `DiscountEngineService` that
picks the best applicable promotion) → coupon code → free shipping rules. Each
step is resolved within a Prisma transaction so the final `totalAmount` written
to the DB reflects all applied discounts atomically.

---

## Challenges & How I Solved Them

**Challenge:** Stripe webhooks deliver the same payment confirmation via two
separate events — `checkout.session.completed` and
`payment_intent.succeeded` — and either can arrive first. Running both handlers
naively would double-write the `paid` status and create duplicate
`OrderStatusHistory` records.

**Solution:** Both handlers start with an idempotency check:
`if (order.status === 'paid') return`. The `checkout.session.completed` handler
is designated the primary — it reliably carries `orderId` in session metadata.
The `payment_intent.succeeded` handler falls back to matching by
`stripePaymentIntentId` on the order record if no `orderId` metadata is present,
which covers the case where Stripe fires the intent event before the session
event populates metadata.

---

**Challenge:** The Socket.IO `AuthGuard` was written for HTTP — it reads the JWT
from `req.cookies`. WebSocket connections don't have an HTTP request object, so
the same guard would throw before the connection was established.

**Solution:** I extended `AuthGuard.canActivate` to branch on
`context.getType() === 'ws'`. For WebSocket contexts it extracts the JWT from
three locations in priority order: `handshake.auth.token`, the `Authorization`
header, and the raw `Cookie` header string (parsed with a regex against the
configured cookie name). The same `@Auth()` decorator works on both HTTP
controllers and WebSocket gateway handlers without any changes at the call site.

---

**Challenge:** Media is stored as relative S3 keys in the database, but Stripe
Checkout Sessions require fully qualified HTTPS image URLs for line item product
images. Passing a relative path to Stripe's API results in a rejected session.

**Solution:** The `StripeService` has a private `toAbsoluteImageUrl` method that
checks whether the stored value is already an absolute URL, and if not,
constructs it from `ENDPOINT + BUCKET_NAME + path`. It validates the resulting
URL with the native `URL` constructor, rejects anything non-HTTPS, and properly
URL-encodes path segments to handle filenames with spaces or special characters.
The method returns `undefined` on any failure, which causes the image to be
omitted from the Stripe line item rather than crashing the checkout.

---

## Key Features

- Role-based access via a single `@Auth('role')` decorator that applies JWT
  validation and role checks across both HTTP and WebSocket contexts.
- Stripe Connect onboarding with Express accounts, seller payout dashboard
  links, and admin-gated `stripe.transfers` release before funds reach sellers.
- Full refund pipeline: buyer request → seller acknowledgement → admin approval
  → Stripe partial or full refund triggered server-side, with `reverse_transfer`
  and `refund_application_fee` flags set.
- Dispute lifecycle: open → under review → resolved (buyer-favored or seller-
  favored), with the resolution outcome determining the final order status.
- S3-compatible media with automatic bucket provisioning, public-read policy,
  and placeholder image sync on startup — zero manual bucket setup required.
- Socket.IO `/chat` namespace with conversation rooms, `newMessage` broadcast,
  `userTyping` indicator, `messagesRead` receipts, and paginated message history
  via REST.
- Maker verification system: sellers submit authenticity proof, admin approves
  via a dedicated workflow, verified sellers receive an authenticity badge on
  their shop profile.
- Wishlist-triggered auto-coupons: sellers configure a coupon that's
  automatically issued when a buyer adds their product to a wishlist — tracked
  via `WishlistCouponLog`.
- Discount engine layering: product discounts → active promotions → coupon
  codes → free shipping rules, all resolved and committed atomically in a single
  Prisma transaction at checkout.
- Fully self-hosted: API, admin dashboard, PostgreSQL, Redis, and RustFS all run
  in Docker on a single VPS behind Dokploy with no AWS bill.

---

## Outcome / Results

Delivered a production-ready multi-vendor marketplace to the client, covering
the full buyer, seller, and admin workflows end-to-end. The platform supports:

- The complete order lifecycle from cart → checkout → Stripe payment →
  fulfillment → delivery → post-delivery (refund, dispute, review)
- A seller self-service layer: shop setup, product management, marketing tools
  (coupons, promotions, free shipping rules), analytics, and Stripe dashboard
  access
- An admin control surface: order oversight, payout approvals, dispute
  resolution, maker verification, platform fee configuration, and support ticket
  management
- A documented integration contract (`CHAT_INTEGRATION.md`,
  `PROJECT_CONTEXT.md`, Postman collections for all modules) handed off to the
  client for frontend team integration

---

## Tech Stack

| Layer          | Technologies                                                                                 |
| -------------- | -------------------------------------------------------------------------------------------- |
| Frontend       | React, Refine, Ant Design, Recharts, Vite                                                    |
| Backend        | NestJS v11, TypeScript 5.7, Node.js (ESM)                                                    |
| Database       | PostgreSQL (multi-schema), Prisma v7, Redis                                                  |
| Infrastructure | Docker, Docker Compose, Dokploy, VPS, RustFS                                                 |
| Integrations   | Stripe Connect v22, AWS SDK v3 (S3), Socket.IO, Twilio, Nodemailer/Gmail SMTP, Google OAuth2 |
