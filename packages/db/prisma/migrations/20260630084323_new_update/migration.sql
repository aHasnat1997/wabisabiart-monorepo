-- CreateSchema
CREATE SCHEMA IF NOT EXISTS "cart";

-- CreateSchema
CREATE SCHEMA IF NOT EXISTS "category";

-- CreateSchema
CREATE SCHEMA IF NOT EXISTS "coupon";

-- CreateSchema
CREATE SCHEMA IF NOT EXISTS "customer";

-- CreateSchema
CREATE SCHEMA IF NOT EXISTS "dispute";

-- CreateSchema
CREATE SCHEMA IF NOT EXISTS "legal";

-- CreateSchema
CREATE SCHEMA IF NOT EXISTS "message";

-- CreateSchema
CREATE SCHEMA IF NOT EXISTS "notification";

-- CreateSchema
CREATE SCHEMA IF NOT EXISTS "order";

-- CreateSchema
CREATE SCHEMA IF NOT EXISTS "others";

-- CreateSchema
CREATE SCHEMA IF NOT EXISTS "payment";

-- CreateSchema
CREATE SCHEMA IF NOT EXISTS "product";

-- CreateSchema
CREATE SCHEMA IF NOT EXISTS "promotion";

-- CreateSchema
CREATE SCHEMA IF NOT EXISTS "refund";

-- CreateSchema
CREATE SCHEMA IF NOT EXISTS "review";

-- CreateSchema
CREATE SCHEMA IF NOT EXISTS "seller";

-- CreateSchema
CREATE SCHEMA IF NOT EXISTS "shipment";

-- CreateSchema
CREATE SCHEMA IF NOT EXISTS "support";

-- CreateSchema
CREATE SCHEMA IF NOT EXISTS "user";

-- CreateSchema
CREATE SCHEMA IF NOT EXISTS "wishlist";

-- CreateEnum
CREATE TYPE "user"."user_role" AS ENUM ('customer', 'seller', 'admin', 'support');

-- CreateEnum
CREATE TYPE "user"."otp_provider" AS ENUM ('email', 'phone');

-- CreateEnum
CREATE TYPE "user"."shop_setup_request_status" AS ENUM ('pending', 'approved', 'rejected');

-- CreateEnum
CREATE TYPE "user"."shop_journal_status" AS ENUM ('draft', 'published', 'archived', 'publishing_request', 'rejected', 'blocked');

-- CreateEnum
CREATE TYPE "product"."product_status" AS ENUM ('draft', 'pending_review', 'active', 'inactive', 'out_of_stock', 'rejected');

-- CreateEnum
CREATE TYPE "product"."discount_type" AS ENUM ('none', 'percentage', 'fixed_amount');

-- CreateEnum
CREATE TYPE "category"."category_type" AS ENUM ('crafts', 'customization', 'commissions', 'vintage');

-- CreateEnum
CREATE TYPE "message"."conversation_type" AS ENUM ('general', 'order_inquiry', 'refund_request', 'product_inquiry', 'support');

-- CreateEnum
CREATE TYPE "order"."order_status" AS ENUM ('pending_payment', 'payment_failed', 'paid', 'processing', 'shipped', 'in_transit', 'delivered', 'cancelled', 'refunded', 'disputed');

-- CreateEnum
CREATE TYPE "payment"."payment_status" AS ENUM ('pending', 'processing', 'succeeded', 'failed', 'refunded', 'partially_refunded', 'cancelled');

-- CreateEnum
CREATE TYPE "shipment"."shipment_status" AS ENUM ('pending', 'label_created', 'picked_up', 'in_transit', 'out_for_delivery', 'delivered', 'failed_delivery', 'returned');

-- CreateEnum
CREATE TYPE "refund"."refund_status" AS ENUM ('requested', 'approved', 'rejected', 'processing', 'completed', 'failed');

-- CreateEnum
CREATE TYPE "dispute"."dispute_status" AS ENUM ('open', 'under_review', 'resolved_buyer', 'resolved_seller', 'closed', 'escalated');

-- CreateEnum
CREATE TYPE "review"."review_status" AS ENUM ('pending', 'approved', 'rejected', 'flagged');

-- CreateEnum
CREATE TYPE "review"."review_platform" AS ENUM ('WABISAVIART', 'SHOPIFY', 'ETSY');

-- CreateEnum
CREATE TYPE "review"."external_platform" AS ENUM ('SHOPIFY', 'ETSY');

-- CreateEnum
CREATE TYPE "cart"."cart_status" AS ENUM ('active', 'cancel', 'expired', 'ordered', 'completed');

-- CreateEnum
CREATE TYPE "coupon"."coupon_type" AS ENUM ('percentage', 'fixed_amount', 'free_shipping', 'buy_x_get_y');

-- CreateEnum
CREATE TYPE "promotion"."promotion_discount_type" AS ENUM ('PERCENTAGE', 'FIXED', 'BOGO');

-- CreateEnum
CREATE TYPE "promotion"."promotion_apply_to" AS ENUM ('ALL_PRODUCTS', 'BY_CATEGORY', 'SPECIFIC_PRODUCTS');

-- CreateEnum
CREATE TYPE "coupon"."coupon_discount_type" AS ENUM ('PERCENTAGE', 'FIXED', 'FREE_SHIPPING');

-- CreateEnum
CREATE TYPE "coupon"."customer_restriction" AS ENUM ('ALL_CUSTOMERS', 'NEW_CUSTOMERS');

-- CreateEnum
CREATE TYPE "wishlist"."wishlist_coupon_status" AS ENUM ('GENERATED', 'REDEEMED', 'EXPIRED');

-- CreateEnum
CREATE TYPE "support"."support_ticket_category" AS ENUM ('ACCOUNT_LOGIN', 'BILLING_PAYMENTS', 'TECHNICAL_ERROR_BUG', 'FEATURE_REQUEST', 'DATA_LOSS_RECOVERY', 'PRIVACY_SECURITY', 'INTEGRATION_API', 'PERFORMANCE_SLOWDOWN', 'REPORTING_ANALYTICS', 'OTHER');

-- CreateEnum
CREATE TYPE "support"."support_ticket_priority" AS ENUM ('LOW', 'MEDIUM', 'HIGH');

-- CreateEnum
CREATE TYPE "support"."support_ticket_status" AS ENUM ('OPEN', 'IN_PROGRESS', 'RESOLVED', 'CLOSED');

-- CreateEnum
CREATE TYPE "legal"."legal_page_type" AS ENUM ('TERMS_OF_USE', 'PRIVACY_POLICY', 'COOKIE_POLICY');

-- CreateEnum
CREATE TYPE "others"."report_status" AS ENUM ('pending', 'approved', 'rejected');

-- CreateEnum
CREATE TYPE "others"."report_reason" AS ENUM ('spam', 'counterfeit', 'inappropriate', 'misleading', 'other');

-- CreateTable
CREATE TABLE "cart"."Cart" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "userId" UUID NOT NULL,
    "status" "cart"."cart_status" NOT NULL DEFAULT 'active',
    "createdAt" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Cart_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "cart"."CartItem" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "cartId" UUID NOT NULL,
    "productId" UUID NOT NULL,
    "variantId" UUID,
    "quantity" INTEGER NOT NULL DEFAULT 1,
    "customization" TEXT,
    "addedAt" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "CartItem_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "category"."Category" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "name" TEXT NOT NULL,
    "type" "category"."category_type" NOT NULL DEFAULT 'crafts',
    "description" TEXT,
    "promotionId" UUID,
    "isFeatured" BOOLEAN NOT NULL DEFAULT false,
    "isGoodForGift" BOOLEAN NOT NULL DEFAULT false,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Category_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "category"."SubCategory" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "categoryId" UUID NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "SubCategory_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "coupon"."Coupon" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "sellerId" UUID NOT NULL,
    "code" TEXT NOT NULL,
    "discountType" "coupon"."coupon_discount_type" NOT NULL DEFAULT 'PERCENTAGE',
    "description" TEXT,
    "discountValue" DECIMAL(12,2) NOT NULL,
    "minimumPurchase" DECIMAL(12,2),
    "minimumPurchaseAmount" DECIMAL(12,2) NOT NULL DEFAULT 0,
    "maximumDiscount" DECIMAL(12,2),
    "buyQuantity" INTEGER,
    "getQuantity" INTEGER,
    "usageLimit" INTEGER,
    "maximumUses" INTEGER NOT NULL DEFAULT 100,
    "usageLimitPerUser" INTEGER,
    "usedCount" INTEGER NOT NULL DEFAULT 0,
    "usageCount" INTEGER NOT NULL DEFAULT 0,
    "startsAt" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "expiresAt" TIMESTAMPTZ(6) NOT NULL,
    "customerRestriction" "coupon"."customer_restriction" NOT NULL DEFAULT 'ALL_CUSTOMERS',
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Coupon_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "coupon"."CouponUsageLog" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "couponId" UUID NOT NULL,
    "orderId" TEXT NOT NULL,
    "customerId" UUID NOT NULL,
    "discountAmount" DECIMAL(12,2) NOT NULL,
    "createdAt" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "CouponUsageLog_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "customer"."CustomerMetrics" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "userId" UUID NOT NULL,
    "period" TEXT NOT NULL,
    "orderCount" INTEGER NOT NULL DEFAULT 0,
    "totalSpent" DECIMAL(12,2) NOT NULL,
    "avgOrderValue" DECIMAL(12,2) NOT NULL,
    "lastOrderDate" TIMESTAMPTZ(6),
    "repeatPurchase" BOOLEAN NOT NULL DEFAULT false,
    "npsScore" INTEGER,
    "churnRiskPercent" DECIMAL(5,2),
    "repurchaseInterval" INTEGER,
    "createdAt" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "CustomerMetrics_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "user"."ShopJournal" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "shopId" UUID NOT NULL,
    "title" TEXT NOT NULL,
    "bannerImage" TEXT DEFAULT 'placeholders/image-placeholder.png',
    "shortExcerpt" TEXT,
    "content" TEXT NOT NULL,
    "published" BOOLEAN DEFAULT false,
    "approved" BOOLEAN DEFAULT false,
    "postStatus" "user"."shop_journal_status" DEFAULT 'publishing_request',
    "createdAt" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ShopJournal_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "user"."ShopJournalLikes" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "userId" UUID NOT NULL,
    "journalId" UUID NOT NULL,
    "createdAt" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ShopJournalLikes_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "user"."ShopJournalComment" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "userId" UUID NOT NULL,
    "journalId" UUID NOT NULL,
    "comment" TEXT NOT NULL,
    "createdAt" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ShopJournalComment_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "user"."ShopJournalCommentReply" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "userId" UUID NOT NULL,
    "commentId" UUID NOT NULL,
    "reply" TEXT NOT NULL,
    "createdAt" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ShopJournalCommentReply_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "legal"."LegalPage" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "type" "legal"."legal_page_type" NOT NULL,
    "content" TEXT NOT NULL,
    "createdAt" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "LegalPage_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "legal"."FaqCategory" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "name" TEXT NOT NULL,
    "order" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "FaqCategory_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "legal"."FaqQuestion" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "question" TEXT NOT NULL,
    "answer" TEXT NOT NULL,
    "order" INTEGER NOT NULL DEFAULT 0,
    "categoryId" UUID NOT NULL,
    "createdAt" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "FaqQuestion_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "promotion"."GlobalFreeShippingConfig" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "sellerId" UUID NOT NULL,
    "isEnabled" BOOLEAN NOT NULL DEFAULT false,
    "minimumOrderAmount" DECIMAL(12,2) NOT NULL DEFAULT 0,
    "triggerCount" INTEGER NOT NULL DEFAULT 0,
    "updatedAt" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "GlobalFreeShippingConfig_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "promotion"."FreeShippingRule" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "sellerId" UUID NOT NULL,
    "name" TEXT NOT NULL,
    "minimumOrderAmount" DECIMAL(12,2) NOT NULL,
    "region" TEXT NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "orderCount" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "FreeShippingRule_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "wishlist"."WishlistAutoCouponConfig" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "sellerId" UUID NOT NULL,
    "isEnabled" BOOLEAN NOT NULL DEFAULT false,
    "discountPercentage" DECIMAL(5,2) NOT NULL DEFAULT 5,
    "validityDays" INTEGER NOT NULL DEFAULT 30,
    "sendEmailNotification" BOOLEAN NOT NULL DEFAULT true,
    "autoApplyAtCheckout" BOOLEAN NOT NULL DEFAULT true,
    "updatedAt" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "WishlistAutoCouponConfig_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "wishlist"."WishlistCouponLog" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "sellerId" UUID NOT NULL,
    "customerId" UUID NOT NULL,
    "productId" UUID NOT NULL,
    "productName" TEXT NOT NULL,
    "couponCode" TEXT NOT NULL,
    "status" "wishlist"."wishlist_coupon_status" NOT NULL DEFAULT 'GENERATED',
    "generatedAt" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "redeemedAt" TIMESTAMPTZ(6),
    "expiresAt" TIMESTAMPTZ(6) NOT NULL,
    "discountAmount" DECIMAL(12,2),

    CONSTRAINT "WishlistCouponLog_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "message"."Conversation" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "customerId" UUID NOT NULL,
    "sellerId" UUID,
    "orderId" UUID,
    "type" "message"."conversation_type" NOT NULL DEFAULT 'general',
    "isArchived" BOOLEAN NOT NULL DEFAULT false,
    "lastMessage" TEXT,
    "lastMessageAt" TIMESTAMPTZ(6),
    "createdAt" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Conversation_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "message"."ChatMessage" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "conversationId" UUID NOT NULL,
    "senderId" UUID NOT NULL,
    "content" TEXT NOT NULL,
    "attachments" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "isRead" BOOLEAN NOT NULL DEFAULT false,
    "readAt" TIMESTAMPTZ(6),
    "createdAt" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ChatMessage_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "notification"."Notification" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "userId" UUID NOT NULL,
    "type" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "message" TEXT NOT NULL,
    "actionUrl" TEXT,
    "metadata" JSONB,
    "isRead" BOOLEAN NOT NULL DEFAULT false,
    "readAt" TIMESTAMPTZ(6),
    "createdAt" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Notification_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "order"."Order" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "orderNumber" TEXT NOT NULL,
    "stripePaymentIntentId" TEXT,
    "stripeChargeId" TEXT,
    "buyerId" UUID NOT NULL,
    "sellerId" UUID NOT NULL,
    "status" "order"."order_status" NOT NULL DEFAULT 'pending_payment',
    "subtotal" DECIMAL(12,2) NOT NULL,
    "shippingCost" DECIMAL(12,2) NOT NULL DEFAULT 0,
    "taxAmount" DECIMAL(12,2) NOT NULL DEFAULT 0,
    "discountAmount" DECIMAL(12,2) NOT NULL DEFAULT 0,
    "tipAmount" DECIMAL(12,2) NOT NULL DEFAULT 0,
    "totalAmount" DECIMAL(12,2) NOT NULL,
    "currency" TEXT NOT NULL DEFAULT 'USD',
    "shippingAddressId" UUID,
    "couponId" UUID,
    "couponCode" TEXT,
    "markOrderAsGift" BOOLEAN NOT NULL DEFAULT false,
    "buyerNote" TEXT,
    "sellerNote" TEXT,
    "internalNote" TEXT,
    "ipAddress" INET,
    "userAgent" TEXT,
    "paidAt" TIMESTAMPTZ(6),
    "shippedAt" TIMESTAMPTZ(6),
    "deliveredAt" TIMESTAMPTZ(6),
    "cancelledAt" TIMESTAMPTZ(6),
    "dispatchedAt" TIMESTAMPTZ(6),
    "sourceCampaign" TEXT,
    "acquisitionCost" DECIMAL(12,2),
    "refundInitiatedAt" TIMESTAMPTZ(6),
    "refundApprovedAt" TIMESTAMPTZ(6),
    "refundCompletedAt" TIMESTAMPTZ(6),
    "createdAt" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Order_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "order"."OrderItem" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "orderId" UUID NOT NULL,
    "productId" UUID NOT NULL,
    "variantId" UUID,
    "productTitle" TEXT NOT NULL,
    "productSlug" TEXT NOT NULL,
    "variantName" TEXT,
    "sku" TEXT,
    "imageUrl" TEXT,
    "quantity" INTEGER NOT NULL DEFAULT 1,
    "unitPrice" DECIMAL(12,2) NOT NULL,
    "totalPrice" DECIMAL(12,2) NOT NULL,
    "customization" TEXT,
    "giftMessage" TEXT,
    "createdAt" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "OrderItem_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "order"."OrderStatusHistory" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "orderId" UUID NOT NULL,
    "status" "order"."order_status" NOT NULL,
    "note" TEXT,
    "createdBy" UUID,
    "createdAt" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "OrderStatusHistory_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "others"."ActivityLog" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "userId" UUID NOT NULL,
    "action" TEXT NOT NULL,
    "entityType" TEXT NOT NULL,
    "entityId" UUID,
    "metadata" JSONB,
    "ipAddress" INET NOT NULL,
    "userAgent" TEXT NOT NULL,
    "createdAt" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ActivityLog_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "others"."PlatformFeeSetting" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "key" TEXT NOT NULL DEFAULT 'default',
    "platformFeePercent" DECIMAL(5,2) NOT NULL DEFAULT 5.00,
    "paymentProcessingPercent" DECIMAL(5,2) NOT NULL DEFAULT 2.90,
    "paymentProcessingFlat" DECIMAL(10,2) NOT NULL DEFAULT 0.30,
    "notes" TEXT,
    "createdAt" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "PlatformFeeSetting_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "others"."SearchHistory" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "userId" UUID,
    "query" TEXT NOT NULL,
    "filters" JSONB,
    "resultsCount" INTEGER NOT NULL,
    "searchedAt" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "SearchHistory_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "others"."ShopFollower" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "userId" UUID NOT NULL,
    "sellerId" UUID NOT NULL,
    "followedAt" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ShopFollower_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "others"."Announcement" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "sellerId" UUID NOT NULL,
    "title" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "startsAt" TIMESTAMPTZ(6),
    "expiresAt" TIMESTAMPTZ(6),
    "createdAt" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Announcement_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "others"."InventoryReservation" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "productId" UUID NOT NULL,
    "quantity" INTEGER NOT NULL,
    "reservedFor" TEXT NOT NULL,
    "expiresAt" TIMESTAMPTZ(6) NOT NULL,
    "releasedAt" TIMESTAMPTZ(6),
    "createdAt" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "InventoryReservation_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "others"."Report" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "reporterId" UUID NOT NULL,
    "reportedUserId" UUID,
    "productId" UUID NOT NULL,
    "reason" "others"."report_reason" NOT NULL,
    "description" TEXT,
    "status" "others"."report_status" NOT NULL DEFAULT 'pending',
    "reviewedBy" UUID,
    "resolution" TEXT,
    "createdAt" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "reviewedAt" TIMESTAMPTZ(6),

    CONSTRAINT "Report_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "payment"."PaymentMethod" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "userId" UUID NOT NULL,
    "cardBrand" TEXT NOT NULL,
    "cardLast4" TEXT NOT NULL,
    "cardExpMonth" INTEGER NOT NULL,
    "cardExpYear" INTEGER NOT NULL,
    "billingName" TEXT NOT NULL,
    "billingAddress" TEXT,
    "billingCity" TEXT,
    "billingState" TEXT,
    "billingZip" TEXT,
    "billingCountry" TEXT,
    "stripePaymentMethodId" TEXT,
    "isDefault" BOOLEAN NOT NULL DEFAULT false,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "PaymentMethod_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "payment"."PaymentTransaction" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "orderId" UUID NOT NULL,
    "paymentMethodId" UUID,
    "amount" DECIMAL(12,2) NOT NULL,
    "currency" TEXT NOT NULL DEFAULT 'USD',
    "status" "payment"."payment_status" NOT NULL DEFAULT 'pending',
    "provider" TEXT NOT NULL,
    "providerTransactionId" TEXT,
    "providerResponse" JSONB,
    "failureReason" TEXT,
    "metadata" JSONB,
    "processedAt" TIMESTAMPTZ(6),
    "createdAt" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "PaymentTransaction_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "product"."Product" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "sellerId" UUID NOT NULL,
    "title" TEXT,
    "subtitle" TEXT,
    "description" TEXT,
    "badge" TEXT DEFAULT 'new',
    "price" DECIMAL(12,2),
    "currency" TEXT NOT NULL DEFAULT 'USD',
    "discountType" "product"."discount_type" NOT NULL DEFAULT 'none',
    "discountValue" DECIMAL(12,2),
    "trackInventory" BOOLEAN NOT NULL DEFAULT true,
    "lowStockThreshold" INTEGER NOT NULL DEFAULT 5,
    "status" "product"."product_status" NOT NULL DEFAULT 'pending_review',
    "categoryType" "category"."category_type" DEFAULT 'crafts',
    "categoryId" UUID,
    "subCategoryId" UUID,
    "promotionId" UUID,
    "isFeatured" BOOLEAN NOT NULL DEFAULT false,
    "tags" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "customizable" BOOLEAN NOT NULL DEFAULT false,
    "handmade" BOOLEAN NOT NULL DEFAULT false,
    "madeToOrder" BOOLEAN NOT NULL DEFAULT false,
    "processingTime" INTEGER,
    "favoriteCount" INTEGER NOT NULL DEFAULT 0,
    "salesCount" INTEGER NOT NULL DEFAULT 0,
    "reportCount" INTEGER NOT NULL DEFAULT 0,
    "averageRating" DECIMAL(3,2) NOT NULL DEFAULT 0.00,
    "deletedAt" TIMESTAMPTZ(6),
    "createdAt" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Product_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "product"."ProductVariant" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "productId" UUID NOT NULL,
    "mediaUrl" TEXT DEFAULT 'placeholders/image-placeholder.png',
    "name" TEXT NOT NULL,
    "quantity" INTEGER NOT NULL DEFAULT 0,
    "options" JSON,
    "isLowStock" BOOLEAN NOT NULL DEFAULT false,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ProductVariant_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "promotion"."Promotion" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "sellerId" UUID NOT NULL,
    "name" TEXT NOT NULL,
    "discountType" "promotion"."promotion_discount_type" NOT NULL,
    "discountValue" DECIMAL(12,2) NOT NULL,
    "applyTo" "promotion"."promotion_apply_to" NOT NULL,
    "startDate" TIMESTAMPTZ(6) NOT NULL,
    "endDate" TIMESTAMPTZ(6),
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "minimumPurchase" DECIMAL(12,2) NOT NULL DEFAULT 0,
    "usageLimit" INTEGER,
    "usageCount" INTEGER NOT NULL DEFAULT 0,
    "onePerCustomer" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Promotion_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "promotion"."PromotionUsageLog" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "promotionId" UUID NOT NULL,
    "orderId" TEXT NOT NULL,
    "customerId" UUID NOT NULL,
    "discountAmount" DECIMAL(12,2) NOT NULL,
    "createdAt" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "PromotionUsageLog_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "refund"."Refund" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "orderId" UUID NOT NULL,
    "amount" DECIMAL(12,2) NOT NULL,
    "reason" TEXT NOT NULL,
    "status" "refund"."refund_status" NOT NULL DEFAULT 'requested',
    "requestedBy" UUID,
    "processedBy" UUID,
    "rejectionReason" TEXT,
    "providerRefundId" TEXT,
    "requestedAt" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "processedAt" TIMESTAMPTZ(6),
    "completedAt" TIMESTAMPTZ(6),
    "createdAt" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Refund_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "dispute"."Dispute" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "orderId" UUID NOT NULL,
    "reason" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "status" "dispute"."dispute_status" NOT NULL DEFAULT 'open',
    "openedBy" UUID NOT NULL,
    "resolution" TEXT,
    "resolvedBy" UUID,
    "openedAt" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "resolvedAt" TIMESTAMPTZ(6),
    "createdAt" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Dispute_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "dispute"."DisputeMessage" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "disputeId" UUID NOT NULL,
    "senderId" UUID NOT NULL,
    "message" TEXT NOT NULL,
    "attachments" JSONB,
    "createdAt" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "DisputeMessage_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "refund"."RefundAnalytics" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "period" TEXT NOT NULL,
    "sellerId" UUID,
    "productId" UUID,
    "totalRefunds" INTEGER NOT NULL DEFAULT 0,
    "totalRefundValue" DECIMAL(12,2) NOT NULL,
    "totalOrders" INTEGER NOT NULL DEFAULT 0,
    "refundRate" DECIMAL(5,2) NOT NULL DEFAULT 0,
    "topRefundReason" TEXT,
    "trend" TEXT,
    "createdAt" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "RefundAnalytics_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "review"."Review" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "productId" UUID NOT NULL,
    "userId" UUID NOT NULL,
    "orderId" UUID,
    "rating" INTEGER NOT NULL,
    "comment" TEXT,
    "images" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "verifiedPurchase" BOOLEAN NOT NULL DEFAULT false,
    "helpfulCount" INTEGER NOT NULL DEFAULT 0,
    "notHelpfulCount" INTEGER NOT NULL DEFAULT 0,
    "sellerResponse" TEXT,
    "sellerRespondedAt" TIMESTAMPTZ(6),
    "createdAt" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "platform" "review"."review_platform" NOT NULL DEFAULT 'WABISAVIART',

    CONSTRAINT "Review_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "review"."ExternalStoreConnection" (
    "id" TEXT NOT NULL,
    "sellerProfileId" UUID NOT NULL,
    "platform" "review"."external_platform" NOT NULL,
    "shopDomain" TEXT NOT NULL,
    "accessToken" TEXT NOT NULL,
    "refreshToken" TEXT,
    "expiresAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ExternalStoreConnection_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "seller"."SellerPayout" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "sellerId" UUID NOT NULL,
    "period" TEXT NOT NULL,
    "grossRevenue" DECIMAL(12,2) NOT NULL,
    "refundsIssued" DECIMAL(12,2) NOT NULL,
    "platformFeePercent" DECIMAL(5,2) NOT NULL,
    "platformFeeAmount" DECIMAL(12,2) NOT NULL,
    "netPayment" DECIMAL(12,2) NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'pending',
    "dueDate" TIMESTAMPTZ(6) NOT NULL,
    "paidDate" TIMESTAMPTZ(6),
    "paymentMethod" TEXT,
    "notes" TEXT,
    "createdAt" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "SellerPayout_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "shipment"."Shipment" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "orderId" UUID NOT NULL,
    "carrier" TEXT NOT NULL,
    "trackingNumber" TEXT,
    "trackingUrl" TEXT,
    "status" "shipment"."shipment_status" NOT NULL DEFAULT 'pending',
    "shippingLabelUrl" TEXT,
    "weight" DECIMAL(10,2),
    "estimatedDeliveryDate" TIMESTAMPTZ(6),
    "actualDeliveryDate" TIMESTAMPTZ(6),
    "shippedAt" TIMESTAMPTZ(6),
    "createdAt" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Shipment_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "shipment"."ShipmentTrackingUpdate" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "shipmentId" UUID NOT NULL,
    "status" TEXT NOT NULL,
    "description" TEXT,
    "location" TEXT,
    "occurredAt" TIMESTAMPTZ(6) NOT NULL,
    "createdAt" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ShipmentTrackingUpdate_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "support"."SupportContactDetails" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "phoneNumber" TEXT,
    "availableTimeRange" TEXT,
    "availableWeekRange" TEXT,
    "responseTime" TEXT,
    "createdAt" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "SupportContactDetails_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "support"."SupportTicket" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "userId" UUID NOT NULL,
    "subject" TEXT NOT NULL,
    "category" "support"."support_ticket_category" NOT NULL,
    "message" TEXT NOT NULL,
    "status" "support"."support_ticket_status" DEFAULT 'OPEN',
    "priority" "support"."support_ticket_priority" NOT NULL DEFAULT 'MEDIUM',
    "attachments" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "resolvedAt" TIMESTAMPTZ(6),
    "createdAt" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "SupportTicket_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "support"."SupportEmail" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "firstName" TEXT NOT NULL,
    "lastName" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "subject" TEXT NOT NULL,
    "message" TEXT NOT NULL,
    "isRead" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "SupportEmail_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "user"."User" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "email" TEXT NOT NULL,
    "phoneNumber" TEXT,
    "passwordHash" TEXT NOT NULL,
    "fullName" TEXT NOT NULL,
    "dob" TIMESTAMPTZ(6),
    "role" "user"."user_role" NOT NULL DEFAULT 'customer',
    "avatarUrl" TEXT DEFAULT '/placeholders/profile-placeholder.png',
    "emailVerified" BOOLEAN NOT NULL DEFAULT false,
    "phoneVerified" BOOLEAN NOT NULL DEFAULT false,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "twoFactorEnabled" BOOLEAN NOT NULL DEFAULT false,
    "otpProvider" "user"."otp_provider" DEFAULT 'email',
    "marketingEmailsEnabled" BOOLEAN NOT NULL DEFAULT false,
    "acceptSellerAgreement" BOOLEAN NOT NULL DEFAULT false,
    "isVip" BOOLEAN NOT NULL DEFAULT false,
    "stripeCustomerId" TEXT,
    "lastLoginAt" TIMESTAMPTZ(6),
    "lastLoginIp" INET,
    "deletedAt" TIMESTAMPTZ(6),
    "createdAt" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "user"."UserSession" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "userId" UUID NOT NULL,
    "token" TEXT NOT NULL,
    "device" TEXT,
    "ipAddress" INET,
    "location" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "expiresAt" TIMESTAMPTZ(6) NOT NULL,

    CONSTRAINT "UserSession_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "user"."Address" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "userId" UUID NOT NULL,
    "fullName" TEXT NOT NULL,
    "addressLine1" TEXT NOT NULL,
    "addressLine2" TEXT,
    "city" TEXT NOT NULL,
    "stateProvince" TEXT,
    "postalCode" TEXT NOT NULL,
    "country" TEXT NOT NULL,
    "phoneNumber" TEXT,
    "isDefaultShipping" BOOLEAN NOT NULL DEFAULT false,
    "isDefaultBilling" BOOLEAN NOT NULL DEFAULT false,
    "label" TEXT,
    "createdAt" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Address_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "user"."SellerProfile" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "userId" UUID NOT NULL,
    "stripeAccountId" TEXT,
    "stripeOnboardingDone" BOOLEAN NOT NULL DEFAULT false,
    "stripeChargesEnabled" BOOLEAN NOT NULL DEFAULT false,
    "stripePayoutsEnabled" BOOLEAN NOT NULL DEFAULT false,
    "shopName" TEXT NOT NULL,
    "shopDescription" TEXT,
    "shopAnnouncement" TEXT,
    "shopBannerImage" TEXT DEFAULT '/placeholders/image-placeholder.png',
    "shopLogo" TEXT DEFAULT '/placeholders/image-placeholder.png',
    "address" TEXT,
    "shopPolicies" TEXT,
    "returnPolicy" TEXT,
    "privacyPolicy" TEXT,
    "shippingPolicy" TEXT,
    "totalSales" INTEGER NOT NULL DEFAULT 0,
    "totalReviews" INTEGER NOT NULL DEFAULT 0,
    "averageRating" DECIMAL(65,30) NOT NULL DEFAULT 0.00,
    "isVerified" BOOLEAN NOT NULL DEFAULT false,
    "isFeatured" BOOLEAN NOT NULL DEFAULT false,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "proofOfIdentity" TEXT,
    "sampleProducts" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "isAgreedToTermsAndConditions" BOOLEAN NOT NULL DEFAULT false,
    "isHandcraftedOrEthicallySourced" BOOLEAN NOT NULL DEFAULT false,
    "verificationDate" TIMESTAMPTZ(6),
    "isVerifiedByAdmin" BOOLEAN DEFAULT false,
    "facebookUrl" TEXT,
    "instagramUrl" TEXT,
    "twitterUrl" TEXT,
    "websiteUrl" TEXT,
    "createdAt" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "SellerProfile_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "user"."ShopSetupRequest" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "userId" UUID NOT NULL,
    "shopName" TEXT NOT NULL,
    "shopDescription" TEXT,
    "address" TEXT,
    "shopLogo" TEXT DEFAULT '/placeholders/image-placeholder.png',
    "shopBannerImage" TEXT DEFAULT '/placeholders/image-placeholder.png',
    "proofOfIdentity" TEXT,
    "sampleProducts" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "isAgreedToTermsAndConditions" BOOLEAN NOT NULL DEFAULT false,
    "isHandcraftedOrEthicallySourced" BOOLEAN NOT NULL DEFAULT false,
    "status" "user"."shop_setup_request_status" NOT NULL DEFAULT 'pending',
    "reviewNote" TEXT,
    "reviewedAt" TIMESTAMPTZ(6),
    "reviewedByAdminId" UUID,
    "createdAt" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ShopSetupRequest_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "wishlist"."Wishlist" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "userId" UUID NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "isPublic" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Wishlist_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "wishlist"."WishlistItem" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "wishlistId" UUID NOT NULL,
    "productId" UUID NOT NULL,
    "note" TEXT,
    "addedAt" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "WishlistItem_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Cart_userId_key" ON "cart"."Cart"("userId");

-- CreateIndex
CREATE INDEX "Cart_userId_idx" ON "cart"."Cart"("userId");

-- CreateIndex
CREATE INDEX "CartItem_cartId_idx" ON "cart"."CartItem"("cartId");

-- CreateIndex
CREATE INDEX "CartItem_productId_idx" ON "cart"."CartItem"("productId");

-- CreateIndex
CREATE UNIQUE INDEX "CartItem_cartId_productId_key" ON "cart"."CartItem"("cartId", "productId");

-- CreateIndex
CREATE UNIQUE INDEX "Category_name_key" ON "category"."Category"("name");

-- CreateIndex
CREATE UNIQUE INDEX "SubCategory_categoryId_name_key" ON "category"."SubCategory"("categoryId", "name");

-- CreateIndex
CREATE INDEX "Coupon_sellerId_idx" ON "coupon"."Coupon"("sellerId");

-- CreateIndex
CREATE INDEX "Coupon_code_idx" ON "coupon"."Coupon"("code");

-- CreateIndex
CREATE INDEX "Coupon_expiresAt_idx" ON "coupon"."Coupon"("expiresAt");

-- CreateIndex
CREATE UNIQUE INDEX "Coupon_sellerId_code_key" ON "coupon"."Coupon"("sellerId", "code");

-- CreateIndex
CREATE INDEX "CouponUsageLog_couponId_idx" ON "coupon"."CouponUsageLog"("couponId");

-- CreateIndex
CREATE INDEX "CouponUsageLog_customerId_idx" ON "coupon"."CouponUsageLog"("customerId");

-- CreateIndex
CREATE INDEX "CouponUsageLog_orderId_idx" ON "coupon"."CouponUsageLog"("orderId");

-- CreateIndex
CREATE INDEX "CustomerMetrics_createdAt_churnRiskPercent_idx" ON "customer"."CustomerMetrics"("createdAt", "churnRiskPercent");

-- CreateIndex
CREATE UNIQUE INDEX "CustomerMetrics_userId_period_key" ON "customer"."CustomerMetrics"("userId", "period");

-- CreateIndex
CREATE INDEX "ShopJournal_shopId_idx" ON "user"."ShopJournal"("shopId");

-- CreateIndex
CREATE INDEX "ShopJournalLikes_userId_idx" ON "user"."ShopJournalLikes"("userId");

-- CreateIndex
CREATE INDEX "ShopJournalLikes_journalId_idx" ON "user"."ShopJournalLikes"("journalId");

-- CreateIndex
CREATE INDEX "ShopJournalLikes_journalId_userId_idx" ON "user"."ShopJournalLikes"("journalId", "userId");

-- CreateIndex
CREATE INDEX "ShopJournalComment_userId_idx" ON "user"."ShopJournalComment"("userId");

-- CreateIndex
CREATE INDEX "ShopJournalComment_journalId_idx" ON "user"."ShopJournalComment"("journalId");

-- CreateIndex
CREATE INDEX "ShopJournalCommentReply_userId_idx" ON "user"."ShopJournalCommentReply"("userId");

-- CreateIndex
CREATE INDEX "ShopJournalCommentReply_commentId_idx" ON "user"."ShopJournalCommentReply"("commentId");

-- CreateIndex
CREATE UNIQUE INDEX "LegalPage_type_key" ON "legal"."LegalPage"("type");

-- CreateIndex
CREATE UNIQUE INDEX "FaqCategory_name_key" ON "legal"."FaqCategory"("name");

-- CreateIndex
CREATE UNIQUE INDEX "GlobalFreeShippingConfig_sellerId_key" ON "promotion"."GlobalFreeShippingConfig"("sellerId");

-- CreateIndex
CREATE INDEX "GlobalFreeShippingConfig_sellerId_idx" ON "promotion"."GlobalFreeShippingConfig"("sellerId");

-- CreateIndex
CREATE INDEX "FreeShippingRule_sellerId_idx" ON "promotion"."FreeShippingRule"("sellerId");

-- CreateIndex
CREATE INDEX "FreeShippingRule_sellerId_isActive_idx" ON "promotion"."FreeShippingRule"("sellerId", "isActive");

-- CreateIndex
CREATE UNIQUE INDEX "WishlistAutoCouponConfig_sellerId_key" ON "wishlist"."WishlistAutoCouponConfig"("sellerId");

-- CreateIndex
CREATE INDEX "WishlistAutoCouponConfig_sellerId_idx" ON "wishlist"."WishlistAutoCouponConfig"("sellerId");

-- CreateIndex
CREATE INDEX "WishlistCouponLog_sellerId_idx" ON "wishlist"."WishlistCouponLog"("sellerId");

-- CreateIndex
CREATE INDEX "WishlistCouponLog_customerId_idx" ON "wishlist"."WishlistCouponLog"("customerId");

-- CreateIndex
CREATE INDEX "WishlistCouponLog_productId_idx" ON "wishlist"."WishlistCouponLog"("productId");

-- CreateIndex
CREATE INDEX "WishlistCouponLog_couponCode_idx" ON "wishlist"."WishlistCouponLog"("couponCode");

-- CreateIndex
CREATE INDEX "WishlistCouponLog_status_idx" ON "wishlist"."WishlistCouponLog"("status");

-- CreateIndex
CREATE INDEX "Conversation_customerId_idx" ON "message"."Conversation"("customerId");

-- CreateIndex
CREATE INDEX "Conversation_sellerId_idx" ON "message"."Conversation"("sellerId");

-- CreateIndex
CREATE INDEX "Conversation_type_idx" ON "message"."Conversation"("type");

-- CreateIndex
CREATE UNIQUE INDEX "Conversation_customerId_sellerId_orderId_key" ON "message"."Conversation"("customerId", "sellerId", "orderId");

-- CreateIndex
CREATE INDEX "ChatMessage_conversationId_idx" ON "message"."ChatMessage"("conversationId");

-- CreateIndex
CREATE INDEX "ChatMessage_conversationId_createdAt_idx" ON "message"."ChatMessage"("conversationId", "createdAt");

-- CreateIndex
CREATE INDEX "ChatMessage_conversationId_isRead_idx" ON "message"."ChatMessage"("conversationId", "isRead");

-- CreateIndex
CREATE INDEX "Notification_userId_idx" ON "notification"."Notification"("userId");

-- CreateIndex
CREATE INDEX "Notification_userId_isRead_idx" ON "notification"."Notification"("userId", "isRead");

-- CreateIndex
CREATE INDEX "Notification_createdAt_idx" ON "notification"."Notification"("createdAt");

-- CreateIndex
CREATE UNIQUE INDEX "Order_orderNumber_key" ON "order"."Order"("orderNumber");

-- CreateIndex
CREATE UNIQUE INDEX "Order_stripePaymentIntentId_key" ON "order"."Order"("stripePaymentIntentId");

-- CreateIndex
CREATE UNIQUE INDEX "Order_stripeChargeId_key" ON "order"."Order"("stripeChargeId");

-- CreateIndex
CREATE INDEX "Order_buyerId_idx" ON "order"."Order"("buyerId");

-- CreateIndex
CREATE INDEX "Order_sellerId_idx" ON "order"."Order"("sellerId");

-- CreateIndex
CREATE INDEX "Order_createdAt_idx" ON "order"."Order"("createdAt");

-- CreateIndex
CREATE INDEX "Order_orderNumber_idx" ON "order"."Order"("orderNumber");

-- CreateIndex
CREATE INDEX "OrderItem_orderId_idx" ON "order"."OrderItem"("orderId");

-- CreateIndex
CREATE INDEX "OrderItem_productId_idx" ON "order"."OrderItem"("productId");

-- CreateIndex
CREATE INDEX "OrderStatusHistory_orderId_idx" ON "order"."OrderStatusHistory"("orderId");

-- CreateIndex
CREATE INDEX "OrderStatusHistory_createdAt_idx" ON "order"."OrderStatusHistory"("createdAt");

-- CreateIndex
CREATE INDEX "ActivityLog_userId_idx" ON "others"."ActivityLog"("userId");

-- CreateIndex
CREATE INDEX "ActivityLog_createdAt_idx" ON "others"."ActivityLog"("createdAt");

-- CreateIndex
CREATE INDEX "ActivityLog_entityType_entityId_idx" ON "others"."ActivityLog"("entityType", "entityId");

-- CreateIndex
CREATE UNIQUE INDEX "PlatformFeeSetting_key_key" ON "others"."PlatformFeeSetting"("key");

-- CreateIndex
CREATE INDEX "SearchHistory_userId_idx" ON "others"."SearchHistory"("userId");

-- CreateIndex
CREATE INDEX "SearchHistory_searchedAt_idx" ON "others"."SearchHistory"("searchedAt");

-- CreateIndex
CREATE INDEX "ShopFollower_userId_idx" ON "others"."ShopFollower"("userId");

-- CreateIndex
CREATE INDEX "ShopFollower_sellerId_idx" ON "others"."ShopFollower"("sellerId");

-- CreateIndex
CREATE UNIQUE INDEX "ShopFollower_userId_sellerId_key" ON "others"."ShopFollower"("userId", "sellerId");

-- CreateIndex
CREATE INDEX "Announcement_sellerId_idx" ON "others"."Announcement"("sellerId");

-- CreateIndex
CREATE INDEX "Announcement_sellerId_isActive_idx" ON "others"."Announcement"("sellerId", "isActive");

-- CreateIndex
CREATE INDEX "Announcement_startsAt_idx" ON "others"."Announcement"("startsAt");

-- CreateIndex
CREATE INDEX "Announcement_expiresAt_idx" ON "others"."Announcement"("expiresAt");

-- CreateIndex
CREATE INDEX "InventoryReservation_productId_idx" ON "others"."InventoryReservation"("productId");

-- CreateIndex
CREATE INDEX "InventoryReservation_expiresAt_idx" ON "others"."InventoryReservation"("expiresAt");

-- CreateIndex
CREATE INDEX "InventoryReservation_reservedFor_idx" ON "others"."InventoryReservation"("reservedFor");

-- CreateIndex
CREATE INDEX "Report_reporterId_idx" ON "others"."Report"("reporterId");

-- CreateIndex
CREATE INDEX "Report_reportedUserId_idx" ON "others"."Report"("reportedUserId");

-- CreateIndex
CREATE INDEX "Report_productId_idx" ON "others"."Report"("productId");

-- CreateIndex
CREATE INDEX "Report_status_idx" ON "others"."Report"("status");

-- CreateIndex
CREATE UNIQUE INDEX "Report_reporterId_productId_key" ON "others"."Report"("reporterId", "productId");

-- CreateIndex
CREATE UNIQUE INDEX "PaymentMethod_stripePaymentMethodId_key" ON "payment"."PaymentMethod"("stripePaymentMethodId");

-- CreateIndex
CREATE INDEX "PaymentMethod_userId_idx" ON "payment"."PaymentMethod"("userId");

-- CreateIndex
CREATE INDEX "PaymentMethod_userId_isDefault_idx" ON "payment"."PaymentMethod"("userId", "isDefault");

-- CreateIndex
CREATE UNIQUE INDEX "PaymentTransaction_providerTransactionId_key" ON "payment"."PaymentTransaction"("providerTransactionId");

-- CreateIndex
CREATE INDEX "PaymentTransaction_orderId_idx" ON "payment"."PaymentTransaction"("orderId");

-- CreateIndex
CREATE INDEX "PaymentTransaction_createdAt_idx" ON "payment"."PaymentTransaction"("createdAt");

-- CreateIndex
CREATE INDEX "Product_sellerId_idx" ON "product"."Product"("sellerId");

-- CreateIndex
CREATE INDEX "Product_status_idx" ON "product"."Product"("status");

-- CreateIndex
CREATE INDEX "Product_isFeatured_idx" ON "product"."Product"("isFeatured");

-- CreateIndex
CREATE INDEX "Product_deletedAt_idx" ON "product"."Product"("deletedAt");

-- CreateIndex
CREATE INDEX "ProductVariant_productId_idx" ON "product"."ProductVariant"("productId");

-- CreateIndex
CREATE INDEX "ProductVariant_isActive_idx" ON "product"."ProductVariant"("isActive");

-- CreateIndex
CREATE INDEX "ProductVariant_isLowStock_idx" ON "product"."ProductVariant"("isLowStock");

-- CreateIndex
CREATE INDEX "Promotion_sellerId_idx" ON "promotion"."Promotion"("sellerId");

-- CreateIndex
CREATE INDEX "Promotion_isActive_idx" ON "promotion"."Promotion"("isActive");

-- CreateIndex
CREATE INDEX "Promotion_startDate_endDate_idx" ON "promotion"."Promotion"("startDate", "endDate");

-- CreateIndex
CREATE INDEX "PromotionUsageLog_promotionId_idx" ON "promotion"."PromotionUsageLog"("promotionId");

-- CreateIndex
CREATE INDEX "PromotionUsageLog_customerId_idx" ON "promotion"."PromotionUsageLog"("customerId");

-- CreateIndex
CREATE INDEX "PromotionUsageLog_orderId_idx" ON "promotion"."PromotionUsageLog"("orderId");

-- CreateIndex
CREATE INDEX "Refund_orderId_idx" ON "refund"."Refund"("orderId");

-- CreateIndex
CREATE INDEX "Refund_requestedBy_idx" ON "refund"."Refund"("requestedBy");

-- CreateIndex
CREATE INDEX "Refund_processedBy_idx" ON "refund"."Refund"("processedBy");

-- CreateIndex
CREATE INDEX "Dispute_orderId_idx" ON "dispute"."Dispute"("orderId");

-- CreateIndex
CREATE INDEX "Dispute_openedBy_idx" ON "dispute"."Dispute"("openedBy");

-- CreateIndex
CREATE INDEX "Dispute_resolvedBy_idx" ON "dispute"."Dispute"("resolvedBy");

-- CreateIndex
CREATE INDEX "DisputeMessage_disputeId_idx" ON "dispute"."DisputeMessage"("disputeId");

-- CreateIndex
CREATE INDEX "DisputeMessage_senderId_idx" ON "dispute"."DisputeMessage"("senderId");

-- CreateIndex
CREATE INDEX "RefundAnalytics_refundRate_period_idx" ON "refund"."RefundAnalytics"("refundRate", "period");

-- CreateIndex
CREATE UNIQUE INDEX "RefundAnalytics_period_sellerId_productId_key" ON "refund"."RefundAnalytics"("period", "sellerId", "productId");

-- CreateIndex
CREATE INDEX "Review_productId_idx" ON "review"."Review"("productId");

-- CreateIndex
CREATE INDEX "Review_userId_idx" ON "review"."Review"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "ExternalStoreConnection_sellerProfileId_key" ON "review"."ExternalStoreConnection"("sellerProfileId");

-- CreateIndex
CREATE UNIQUE INDEX "ExternalStoreConnection_sellerProfileId_platform_key" ON "review"."ExternalStoreConnection"("sellerProfileId", "platform");

-- CreateIndex
CREATE INDEX "SellerPayout_status_dueDate_idx" ON "seller"."SellerPayout"("status", "dueDate");

-- CreateIndex
CREATE INDEX "SellerPayout_createdAt_idx" ON "seller"."SellerPayout"("createdAt");

-- CreateIndex
CREATE UNIQUE INDEX "SellerPayout_sellerId_period_key" ON "seller"."SellerPayout"("sellerId", "period");

-- CreateIndex
CREATE INDEX "Shipment_orderId_idx" ON "shipment"."Shipment"("orderId");

-- CreateIndex
CREATE INDEX "Shipment_trackingNumber_idx" ON "shipment"."Shipment"("trackingNumber");

-- CreateIndex
CREATE INDEX "Shipment_status_idx" ON "shipment"."Shipment"("status");

-- CreateIndex
CREATE INDEX "Shipment_estimatedDeliveryDate_idx" ON "shipment"."Shipment"("estimatedDeliveryDate");

-- CreateIndex
CREATE INDEX "Shipment_actualDeliveryDate_idx" ON "shipment"."Shipment"("actualDeliveryDate");

-- CreateIndex
CREATE INDEX "Shipment_shippedAt_idx" ON "shipment"."Shipment"("shippedAt");

-- CreateIndex
CREATE INDEX "ShipmentTrackingUpdate_shipmentId_idx" ON "shipment"."ShipmentTrackingUpdate"("shipmentId");

-- CreateIndex
CREATE INDEX "ShipmentTrackingUpdate_occurredAt_idx" ON "shipment"."ShipmentTrackingUpdate"("occurredAt");

-- CreateIndex
CREATE UNIQUE INDEX "SupportContactDetails_email_key" ON "support"."SupportContactDetails"("email");

-- CreateIndex
CREATE INDEX "SupportTicket_userId_idx" ON "support"."SupportTicket"("userId");

-- CreateIndex
CREATE INDEX "SupportTicket_status_idx" ON "support"."SupportTicket"("status");

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "user"."User"("email");

-- CreateIndex
CREATE UNIQUE INDEX "User_phoneNumber_key" ON "user"."User"("phoneNumber");

-- CreateIndex
CREATE UNIQUE INDEX "User_stripeCustomerId_key" ON "user"."User"("stripeCustomerId");

-- CreateIndex
CREATE INDEX "User_email_idx" ON "user"."User"("email");

-- CreateIndex
CREATE INDEX "User_id_isActive_deletedAt_idx" ON "user"."User"("id", "isActive", "deletedAt");

-- CreateIndex
CREATE UNIQUE INDEX "UserSession_token_key" ON "user"."UserSession"("token");

-- CreateIndex
CREATE INDEX "UserSession_userId_idx" ON "user"."UserSession"("userId");

-- CreateIndex
CREATE INDEX "UserSession_token_idx" ON "user"."UserSession"("token");

-- CreateIndex
CREATE INDEX "Address_userId_idx" ON "user"."Address"("userId");

-- CreateIndex
CREATE INDEX "Address_userId_isDefaultShipping_idx" ON "user"."Address"("userId", "isDefaultShipping");

-- CreateIndex
CREATE UNIQUE INDEX "SellerProfile_userId_key" ON "user"."SellerProfile"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "SellerProfile_stripeAccountId_key" ON "user"."SellerProfile"("stripeAccountId");

-- CreateIndex
CREATE INDEX "SellerProfile_userId_idx" ON "user"."SellerProfile"("userId");

-- CreateIndex
CREATE INDEX "SellerProfile_id_isActive_idx" ON "user"."SellerProfile"("id", "isActive");

-- CreateIndex
CREATE UNIQUE INDEX "ShopSetupRequest_userId_key" ON "user"."ShopSetupRequest"("userId");

-- CreateIndex
CREATE INDEX "ShopSetupRequest_userId_idx" ON "user"."ShopSetupRequest"("userId");

-- CreateIndex
CREATE INDEX "ShopSetupRequest_status_idx" ON "user"."ShopSetupRequest"("status");

-- CreateIndex
CREATE INDEX "ShopSetupRequest_reviewedByAdminId_idx" ON "user"."ShopSetupRequest"("reviewedByAdminId");

-- CreateIndex
CREATE INDEX "Wishlist_userId_idx" ON "wishlist"."Wishlist"("userId");

-- CreateIndex
CREATE INDEX "WishlistItem_wishlistId_idx" ON "wishlist"."WishlistItem"("wishlistId");

-- CreateIndex
CREATE INDEX "WishlistItem_productId_idx" ON "wishlist"."WishlistItem"("productId");

-- CreateIndex
CREATE UNIQUE INDEX "WishlistItem_wishlistId_productId_key" ON "wishlist"."WishlistItem"("wishlistId", "productId");

-- AddForeignKey
ALTER TABLE "cart"."Cart" ADD CONSTRAINT "Cart_userId_fkey" FOREIGN KEY ("userId") REFERENCES "user"."User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "cart"."CartItem" ADD CONSTRAINT "CartItem_cartId_fkey" FOREIGN KEY ("cartId") REFERENCES "cart"."Cart"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "cart"."CartItem" ADD CONSTRAINT "CartItem_productId_fkey" FOREIGN KEY ("productId") REFERENCES "product"."Product"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "cart"."CartItem" ADD CONSTRAINT "CartItem_variantId_fkey" FOREIGN KEY ("variantId") REFERENCES "product"."ProductVariant"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "category"."Category" ADD CONSTRAINT "Category_promotionId_fkey" FOREIGN KEY ("promotionId") REFERENCES "promotion"."Promotion"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "category"."SubCategory" ADD CONSTRAINT "SubCategory_categoryId_fkey" FOREIGN KEY ("categoryId") REFERENCES "category"."Category"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "coupon"."Coupon" ADD CONSTRAINT "Coupon_sellerId_fkey" FOREIGN KEY ("sellerId") REFERENCES "user"."SellerProfile"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "coupon"."CouponUsageLog" ADD CONSTRAINT "CouponUsageLog_couponId_fkey" FOREIGN KEY ("couponId") REFERENCES "coupon"."Coupon"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "customer"."CustomerMetrics" ADD CONSTRAINT "CustomerMetrics_userId_fkey" FOREIGN KEY ("userId") REFERENCES "user"."User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "user"."ShopJournal" ADD CONSTRAINT "ShopJournal_shopId_fkey" FOREIGN KEY ("shopId") REFERENCES "user"."SellerProfile"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "user"."ShopJournalLikes" ADD CONSTRAINT "ShopJournalLikes_userId_fkey" FOREIGN KEY ("userId") REFERENCES "user"."User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "user"."ShopJournalLikes" ADD CONSTRAINT "ShopJournalLikes_journalId_fkey" FOREIGN KEY ("journalId") REFERENCES "user"."ShopJournal"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "user"."ShopJournalComment" ADD CONSTRAINT "ShopJournalComment_userId_fkey" FOREIGN KEY ("userId") REFERENCES "user"."User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "user"."ShopJournalComment" ADD CONSTRAINT "ShopJournalComment_journalId_fkey" FOREIGN KEY ("journalId") REFERENCES "user"."ShopJournal"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "user"."ShopJournalCommentReply" ADD CONSTRAINT "ShopJournalCommentReply_userId_fkey" FOREIGN KEY ("userId") REFERENCES "user"."User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "user"."ShopJournalCommentReply" ADD CONSTRAINT "ShopJournalCommentReply_commentId_fkey" FOREIGN KEY ("commentId") REFERENCES "user"."ShopJournalComment"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "legal"."FaqQuestion" ADD CONSTRAINT "FaqQuestion_categoryId_fkey" FOREIGN KEY ("categoryId") REFERENCES "legal"."FaqCategory"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "promotion"."GlobalFreeShippingConfig" ADD CONSTRAINT "GlobalFreeShippingConfig_sellerId_fkey" FOREIGN KEY ("sellerId") REFERENCES "user"."SellerProfile"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "promotion"."FreeShippingRule" ADD CONSTRAINT "FreeShippingRule_sellerId_fkey" FOREIGN KEY ("sellerId") REFERENCES "user"."SellerProfile"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "wishlist"."WishlistAutoCouponConfig" ADD CONSTRAINT "WishlistAutoCouponConfig_sellerId_fkey" FOREIGN KEY ("sellerId") REFERENCES "user"."SellerProfile"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "wishlist"."WishlistCouponLog" ADD CONSTRAINT "WishlistCouponLog_sellerId_fkey" FOREIGN KEY ("sellerId") REFERENCES "user"."SellerProfile"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "message"."Conversation" ADD CONSTRAINT "Conversation_customerId_fkey" FOREIGN KEY ("customerId") REFERENCES "user"."User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "message"."Conversation" ADD CONSTRAINT "Conversation_sellerId_fkey" FOREIGN KEY ("sellerId") REFERENCES "user"."SellerProfile"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "message"."ChatMessage" ADD CONSTRAINT "ChatMessage_conversationId_fkey" FOREIGN KEY ("conversationId") REFERENCES "message"."Conversation"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "message"."ChatMessage" ADD CONSTRAINT "ChatMessage_senderId_fkey" FOREIGN KEY ("senderId") REFERENCES "user"."User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "notification"."Notification" ADD CONSTRAINT "Notification_userId_fkey" FOREIGN KEY ("userId") REFERENCES "user"."User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "order"."Order" ADD CONSTRAINT "Order_buyerId_fkey" FOREIGN KEY ("buyerId") REFERENCES "user"."User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "order"."Order" ADD CONSTRAINT "Order_sellerId_fkey" FOREIGN KEY ("sellerId") REFERENCES "user"."SellerProfile"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "order"."Order" ADD CONSTRAINT "Order_shippingAddressId_fkey" FOREIGN KEY ("shippingAddressId") REFERENCES "user"."Address"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "order"."Order" ADD CONSTRAINT "Order_couponId_fkey" FOREIGN KEY ("couponId") REFERENCES "coupon"."Coupon"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "order"."OrderItem" ADD CONSTRAINT "OrderItem_orderId_fkey" FOREIGN KEY ("orderId") REFERENCES "order"."Order"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "order"."OrderItem" ADD CONSTRAINT "OrderItem_productId_fkey" FOREIGN KEY ("productId") REFERENCES "product"."Product"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "order"."OrderItem" ADD CONSTRAINT "OrderItem_variantId_fkey" FOREIGN KEY ("variantId") REFERENCES "product"."ProductVariant"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "order"."OrderStatusHistory" ADD CONSTRAINT "OrderStatusHistory_orderId_fkey" FOREIGN KEY ("orderId") REFERENCES "order"."Order"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "others"."ActivityLog" ADD CONSTRAINT "ActivityLog_userId_fkey" FOREIGN KEY ("userId") REFERENCES "user"."User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "others"."SearchHistory" ADD CONSTRAINT "SearchHistory_userId_fkey" FOREIGN KEY ("userId") REFERENCES "user"."User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "others"."ShopFollower" ADD CONSTRAINT "ShopFollower_userId_fkey" FOREIGN KEY ("userId") REFERENCES "user"."User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "others"."ShopFollower" ADD CONSTRAINT "ShopFollower_sellerId_fkey" FOREIGN KEY ("sellerId") REFERENCES "user"."SellerProfile"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "others"."Announcement" ADD CONSTRAINT "Announcement_sellerId_fkey" FOREIGN KEY ("sellerId") REFERENCES "user"."SellerProfile"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "others"."InventoryReservation" ADD CONSTRAINT "InventoryReservation_productId_fkey" FOREIGN KEY ("productId") REFERENCES "product"."Product"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "others"."Report" ADD CONSTRAINT "Report_reporterId_fkey" FOREIGN KEY ("reporterId") REFERENCES "user"."User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "others"."Report" ADD CONSTRAINT "Report_reportedUserId_fkey" FOREIGN KEY ("reportedUserId") REFERENCES "user"."User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "payment"."PaymentMethod" ADD CONSTRAINT "PaymentMethod_userId_fkey" FOREIGN KEY ("userId") REFERENCES "user"."User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "payment"."PaymentTransaction" ADD CONSTRAINT "PaymentTransaction_orderId_fkey" FOREIGN KEY ("orderId") REFERENCES "order"."Order"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "payment"."PaymentTransaction" ADD CONSTRAINT "PaymentTransaction_paymentMethodId_fkey" FOREIGN KEY ("paymentMethodId") REFERENCES "payment"."PaymentMethod"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "product"."Product" ADD CONSTRAINT "Product_sellerId_fkey" FOREIGN KEY ("sellerId") REFERENCES "user"."User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "product"."Product" ADD CONSTRAINT "Product_categoryId_fkey" FOREIGN KEY ("categoryId") REFERENCES "category"."Category"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "product"."Product" ADD CONSTRAINT "Product_subCategoryId_fkey" FOREIGN KEY ("subCategoryId") REFERENCES "category"."SubCategory"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "product"."Product" ADD CONSTRAINT "Product_promotionId_fkey" FOREIGN KEY ("promotionId") REFERENCES "promotion"."Promotion"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "product"."ProductVariant" ADD CONSTRAINT "ProductVariant_productId_fkey" FOREIGN KEY ("productId") REFERENCES "product"."Product"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "promotion"."Promotion" ADD CONSTRAINT "Promotion_sellerId_fkey" FOREIGN KEY ("sellerId") REFERENCES "user"."SellerProfile"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "promotion"."PromotionUsageLog" ADD CONSTRAINT "PromotionUsageLog_promotionId_fkey" FOREIGN KEY ("promotionId") REFERENCES "promotion"."Promotion"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "refund"."Refund" ADD CONSTRAINT "Refund_orderId_fkey" FOREIGN KEY ("orderId") REFERENCES "order"."Order"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "dispute"."Dispute" ADD CONSTRAINT "Dispute_orderId_fkey" FOREIGN KEY ("orderId") REFERENCES "order"."Order"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "dispute"."DisputeMessage" ADD CONSTRAINT "DisputeMessage_disputeId_fkey" FOREIGN KEY ("disputeId") REFERENCES "dispute"."Dispute"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "review"."Review" ADD CONSTRAINT "Review_productId_fkey" FOREIGN KEY ("productId") REFERENCES "product"."Product"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "review"."Review" ADD CONSTRAINT "Review_userId_fkey" FOREIGN KEY ("userId") REFERENCES "user"."User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "review"."ExternalStoreConnection" ADD CONSTRAINT "ExternalStoreConnection_sellerProfileId_fkey" FOREIGN KEY ("sellerProfileId") REFERENCES "user"."SellerProfile"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "seller"."SellerPayout" ADD CONSTRAINT "SellerPayout_sellerId_fkey" FOREIGN KEY ("sellerId") REFERENCES "user"."SellerProfile"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "shipment"."Shipment" ADD CONSTRAINT "Shipment_orderId_fkey" FOREIGN KEY ("orderId") REFERENCES "order"."Order"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "shipment"."ShipmentTrackingUpdate" ADD CONSTRAINT "ShipmentTrackingUpdate_shipmentId_fkey" FOREIGN KEY ("shipmentId") REFERENCES "shipment"."Shipment"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "support"."SupportTicket" ADD CONSTRAINT "SupportTicket_userId_fkey" FOREIGN KEY ("userId") REFERENCES "user"."User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "user"."UserSession" ADD CONSTRAINT "UserSession_userId_fkey" FOREIGN KEY ("userId") REFERENCES "user"."User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "user"."Address" ADD CONSTRAINT "Address_userId_fkey" FOREIGN KEY ("userId") REFERENCES "user"."User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "user"."SellerProfile" ADD CONSTRAINT "SellerProfile_userId_fkey" FOREIGN KEY ("userId") REFERENCES "user"."User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "user"."ShopSetupRequest" ADD CONSTRAINT "ShopSetupRequest_userId_fkey" FOREIGN KEY ("userId") REFERENCES "user"."User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "wishlist"."Wishlist" ADD CONSTRAINT "Wishlist_userId_fkey" FOREIGN KEY ("userId") REFERENCES "user"."User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "wishlist"."WishlistItem" ADD CONSTRAINT "WishlistItem_wishlistId_fkey" FOREIGN KEY ("wishlistId") REFERENCES "wishlist"."Wishlist"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "wishlist"."WishlistItem" ADD CONSTRAINT "WishlistItem_productId_fkey" FOREIGN KEY ("productId") REFERENCES "product"."Product"("id") ON DELETE CASCADE ON UPDATE CASCADE;
