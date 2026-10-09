-- Active: 1769188084260@@localhost@4001@rightkitkatie_db
-- =====================================================
-- ETSY-LIKE E-COMMERCE DATABASE SCHEMA
-- Optimized, Scalable, Production-Ready
-- PostgreSQL 14+
-- =====================================================

-- Extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pg_trgm";      -- For fuzzy text search
CREATE EXTENSION IF NOT EXISTS "pgcrypto";     -- For encryption

-- =====================================================
-- CUSTOM TYPES (Enums for data integrity)
-- =====================================================

CREATE TYPE user_role AS ENUM ('customer', 'seller', 'admin', 'support');
CREATE TYPE product_status AS ENUM ('draft', 'pending_review', 'active', 'inactive', 'out_of_stock', 'deleted');
CREATE TYPE order_status AS ENUM ('pending_payment', 'payment_failed', 'paid', 'processing', 'shipped', 'in_transit', 'delivered', 'cancelled', 'refunded', 'disputed');
CREATE TYPE payment_status AS ENUM ('pending', 'processing', 'succeeded', 'failed', 'refunded', 'partially_refunded', 'cancelled');
CREATE TYPE shipment_status AS ENUM ('pending', 'label_created', 'picked_up', 'in_transit', 'out_for_delivery', 'delivered', 'failed_delivery', 'returned');
CREATE TYPE refund_status AS ENUM ('requested', 'approved', 'rejected', 'processing', 'completed', 'failed');
CREATE TYPE dispute_status AS ENUM ('open', 'under_review', 'resolved_buyer', 'resolved_seller', 'closed', 'escalated');
CREATE TYPE review_status AS ENUM ('pending', 'approved', 'rejected', 'flagged');
CREATE TYPE cart_status AS ENUM ('active', 'abandoned', 'converted', 'merged', 'expired');
CREATE TYPE coupon_type AS ENUM ('percentage', 'fixed_amount', 'free_shipping', 'buy_x_get_y');

-- =====================================================
-- HELPER FUNCTIONS
-- =====================================================

-- Auto-update updated_at timestamp
CREATE OR REPLACE FUNCTION trigger_set_timestamp()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Generate unique order number
CREATE OR REPLACE FUNCTION generate_order_number()
RETURNS TEXT AS $$
BEGIN
  RETURN 'ORD-' || TO_CHAR(NOW(), 'YYYYMMDD') || '-' || UPPER(SUBSTRING(MD5(RANDOM()::TEXT) FROM 1 FOR 8));
END;
$$ LANGUAGE plpgsql;

-- =====================================================
-- CORE TABLES
-- =====================================================

-- ----------------------------------------------------
-- Users (Both buyers and sellers)
-- ----------------------------------------------------
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email TEXT UNIQUE NOT NULL,
    password_hash TEXT NOT NULL,
    display_name TEXT,
    first_name TEXT,
    last_name TEXT,
    avatar_url TEXT,
    phone_number TEXT,
    
    -- Flags
    email_verified BOOLEAN DEFAULT false,
    phone_verified BOOLEAN DEFAULT false,
    is_active BOOLEAN DEFAULT true,
    two_factor_enabled BOOLEAN DEFAULT false,
    
    -- Marketing preferences
    marketing_emails_enabled BOOLEAN DEFAULT true,
    
    -- Tracking
    last_login_at TIMESTAMP WITH TIME ZONE,
    last_login_ip INET,
    deleted_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    CONSTRAINT email_format CHECK (email ~* '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$')
);

CREATE INDEX idx_users_email ON users(email) WHERE deleted_at IS NULL;
CREATE INDEX idx_users_active ON users(id) WHERE is_active = true AND deleted_at IS NULL;
CREATE TRIGGER set_users_timestamp BEFORE UPDATE ON users FOR EACH ROW EXECUTE FUNCTION trigger_set_timestamp();

-- ----------------------------------------------------
-- User Addresses
-- ----------------------------------------------------
CREATE TABLE addresses (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    
    -- Address details
    full_name TEXT NOT NULL,
    address_line1 TEXT NOT NULL,
    address_line2 TEXT,
    city TEXT NOT NULL,
    state_province TEXT,
    postal_code TEXT NOT NULL,
    country TEXT NOT NULL,
    phone_number TEXT,
    
    -- Metadata
    is_default_shipping BOOLEAN DEFAULT false,
    is_default_billing BOOLEAN DEFAULT false,
    label TEXT, -- 'Home', 'Work', etc.
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_addresses_user_id ON addresses(user_id);
CREATE INDEX idx_addresses_default_shipping ON addresses(user_id, is_default_shipping) WHERE is_default_shipping = true;
CREATE TRIGGER set_addresses_timestamp BEFORE UPDATE ON addresses FOR EACH ROW EXECUTE FUNCTION trigger_set_timestamp();

-- ----------------------------------------------------
-- Seller Profiles (Extended user info for sellers)
-- ----------------------------------------------------
CREATE TABLE seller_profiles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID UNIQUE NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    
    -- Shop info
    shop_name TEXT UNIQUE NOT NULL,
    shop_slug TEXT UNIQUE NOT NULL,
    shop_description TEXT,
    shop_announcement TEXT, -- Current announcement/banner
    shop_banner_url TEXT,
    shop_logo_url TEXT,
    
    -- Policies
    shop_policies TEXT, -- General shop policies
    return_policy TEXT,
    privacy_policy TEXT,
    shipping_policy TEXT,
    
    -- Stats (denormalized for performance)
    total_sales INTEGER DEFAULT 0,
    total_reviews INTEGER DEFAULT 0,
    average_rating DECIMAL(3,2) DEFAULT 0.00,
    
    -- Status
    is_verified BOOLEAN DEFAULT false, -- Verified authentic maker
    is_active BOOLEAN DEFAULT true,
    verification_date TIMESTAMP WITH TIME ZONE,
    
    -- Social
    facebook_url TEXT,
    instagram_url TEXT,
    twitter_url TEXT,
    website_url TEXT,
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    CONSTRAINT shop_slug_format CHECK (shop_slug ~* '^[a-z0-9-]+$')
);

CREATE INDEX idx_seller_profiles_user_id ON seller_profiles(user_id);
CREATE INDEX idx_seller_profiles_shop_slug ON seller_profiles(shop_slug);
CREATE INDEX idx_seller_profiles_active ON seller_profiles(id) WHERE is_active = true;
CREATE TRIGGER set_seller_profiles_timestamp BEFORE UPDATE ON seller_profiles FOR EACH ROW EXECUTE FUNCTION trigger_set_timestamp();

-- =====================================================
-- PRODUCT CATALOG
-- =====================================================

-- ----------------------------------------------------
-- Categories (Hierarchical)
-- ----------------------------------------------------
CREATE TABLE categories (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    slug TEXT UNIQUE NOT NULL,
    description TEXT,
    parent_id UUID REFERENCES categories(id) ON DELETE CASCADE,
    
    -- SEO
    meta_title TEXT,
    meta_description TEXT,
    
    -- Display
    icon_url TEXT,
    display_order INTEGER DEFAULT 0,
    is_active BOOLEAN DEFAULT true,
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_categories_parent_id ON categories(parent_id);
CREATE INDEX idx_categories_slug ON categories(slug) WHERE is_active = true;
CREATE TRIGGER set_categories_timestamp BEFORE UPDATE ON categories FOR EACH ROW EXECUTE FUNCTION trigger_set_timestamp();

-- ----------------------------------------------------
-- Products
-- ----------------------------------------------------
CREATE TABLE products (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    seller_id UUID NOT NULL REFERENCES seller_profiles(id) ON DELETE CASCADE,
    category_id UUID REFERENCES categories(id) ON DELETE SET NULL,
    
    -- Basic info
    title TEXT NOT NULL,
    slug TEXT NOT NULL,
    description TEXT NOT NULL,
    
    -- Pricing
    price DECIMAL(12,2) NOT NULL CHECK (price >= 0),
    compare_at_price DECIMAL(12,2) CHECK (compare_at_price >= price), -- For showing discounts
    cost_per_item DECIMAL(12,2), -- For profit calculation
    currency TEXT DEFAULT 'USD',
    
    -- Inventory
    quantity INTEGER NOT NULL DEFAULT 0 CHECK (quantity >= 0),
    sku TEXT,
    track_inventory BOOLEAN DEFAULT true,
    allow_backorders BOOLEAN DEFAULT false,
    low_stock_threshold INTEGER DEFAULT 5,
    
    -- Status
    status product_status DEFAULT 'draft',
    is_featured BOOLEAN DEFAULT false,
    
    -- Shipping
    weight DECIMAL(10,2), -- in kg
    length DECIMAL(10,2), -- in cm
    width DECIMAL(10,2),
    height DECIMAL(10,2),
    
    -- Customization
    allows_personalization BOOLEAN DEFAULT false,
    personalization_instructions TEXT,
    
    -- Processing time (in business days)
    processing_time_min INTEGER DEFAULT 1,
    processing_time_max INTEGER DEFAULT 3,
    
    -- SEO
    meta_title TEXT,
    meta_description TEXT,
    
    -- Stats (denormalized)
    view_count INTEGER DEFAULT 0,
    favorite_count INTEGER DEFAULT 0,
    sales_count INTEGER DEFAULT 0,
    average_rating DECIMAL(3,2) DEFAULT 0.00,
    review_count INTEGER DEFAULT 0,
    
    deleted_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    CONSTRAINT unique_seller_slug UNIQUE(seller_id, slug)
);

CREATE INDEX idx_products_seller_id ON products(seller_id);
CREATE INDEX idx_products_category_id ON products(category_id);
CREATE INDEX idx_products_status ON products(status) WHERE deleted_at IS NULL;
CREATE INDEX idx_products_active ON products(id) WHERE status = 'active' AND deleted_at IS NULL;
CREATE INDEX idx_products_featured ON products(id) WHERE is_featured = true AND status = 'active';
CREATE INDEX idx_products_created_at ON products(created_at DESC) WHERE status = 'active';

-- Full-text search indexes
CREATE INDEX idx_products_title_search ON products USING GIN(to_tsvector('english', title));
CREATE INDEX idx_products_description_search ON products USING GIN(to_tsvector('english', description));
CREATE INDEX idx_products_title_trgm ON products USING GIN(title gin_trgm_ops);

CREATE TRIGGER set_products_timestamp BEFORE UPDATE ON products FOR EACH ROW EXECUTE FUNCTION trigger_set_timestamp();

-- ----------------------------------------------------
-- Product Images
-- ----------------------------------------------------
CREATE TABLE product_images (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    product_id UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
    
    image_url TEXT NOT NULL,
    thumbnail_url TEXT,
    alt_text TEXT,
    display_order INTEGER DEFAULT 0,
    is_primary BOOLEAN DEFAULT false,
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_product_images_product_id ON product_images(product_id);
CREATE INDEX idx_product_images_primary ON product_images(product_id, is_primary) WHERE is_primary = true;
CREATE TRIGGER set_product_images_timestamp BEFORE UPDATE ON product_images FOR EACH ROW EXECUTE FUNCTION trigger_set_timestamp();

-- ----------------------------------------------------
-- Product Variants (Optional - for size, color, etc.)
-- ----------------------------------------------------
CREATE TABLE product_variants (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    product_id UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
    
    -- Variant details
    variant_name TEXT NOT NULL, -- e.g., "Red / Large"
    sku TEXT,
    
    -- Pricing
    price_adjustment DECIMAL(12,2) DEFAULT 0.00, -- Added to base price
    
    -- Inventory
    quantity INTEGER NOT NULL DEFAULT 0 CHECK (quantity >= 0),
    
    -- Variant options (stored as JSONB for flexibility)
    -- Example: {"color": "Red", "size": "Large"}
    options JSONB NOT NULL,
    
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    CONSTRAINT unique_product_variant UNIQUE(product_id, options)
);

CREATE INDEX idx_product_variants_product_id ON product_variants(product_id);
CREATE INDEX idx_product_variants_options ON product_variants USING GIN(options);
CREATE TRIGGER set_product_variants_timestamp BEFORE UPDATE ON product_variants FOR EACH ROW EXECUTE FUNCTION trigger_set_timestamp();

-- ----------------------------------------------------
-- Product Tags
-- ----------------------------------------------------
CREATE TABLE product_tags (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    product_id UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
    tag TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    CONSTRAINT unique_product_tag UNIQUE(product_id, tag)
);

CREATE INDEX idx_product_tags_product_id ON product_tags(product_id);
CREATE INDEX idx_product_tags_tag ON product_tags(tag);

-- =====================================================
-- INVENTORY MANAGEMENT
-- =====================================================

-- ----------------------------------------------------
-- Inventory Transactions (Audit trail)
-- ----------------------------------------------------
CREATE TABLE inventory_transactions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    product_id UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
    variant_id UUID REFERENCES product_variants(id) ON DELETE CASCADE,
    
    quantity_change INTEGER NOT NULL, -- positive = add, negative = reduce
    quantity_after INTEGER NOT NULL,
    
    transaction_type TEXT NOT NULL, -- 'purchase', 'sale', 'return', 'adjustment', 'reservation', 'release'
    reference_type TEXT, -- 'order', 'return', 'manual'
    reference_id UUID,
    
    notes TEXT,
    created_by UUID REFERENCES users(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_inventory_transactions_product_id ON inventory_transactions(product_id, created_at DESC);
CREATE INDEX idx_inventory_transactions_reference ON inventory_transactions(reference_type, reference_id);

-- ----------------------------------------------------
-- Inventory Reservations (During checkout)
-- ----------------------------------------------------
CREATE TABLE inventory_reservations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    product_id UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
    variant_id UUID REFERENCES product_variants(id) ON DELETE CASCADE,
    
    quantity INTEGER NOT NULL CHECK (quantity > 0),
    
    -- Who reserved it
    user_id UUID REFERENCES users(id),
    session_id TEXT,
    
    reserved_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    expires_at TIMESTAMP WITH TIME ZONE NOT NULL, -- e.g., 15 minutes from reservation
    released_at TIMESTAMP WITH TIME ZONE,
    
    -- Conversion tracking
    converted_to_order_id UUID,
    
    CONSTRAINT check_reservation_owner CHECK (user_id IS NOT NULL OR session_id IS NOT NULL)
);

CREATE INDEX idx_inventory_reservations_product ON inventory_reservations(product_id);
CREATE INDEX idx_inventory_reservations_expires ON inventory_reservations(expires_at) WHERE released_at IS NULL;
CREATE INDEX idx_inventory_reservations_session ON inventory_reservations(session_id) WHERE released_at IS NULL;

-- =====================================================
-- SHOPPING CART & WISHLIST
-- =====================================================

-- ----------------------------------------------------
-- Shopping Carts
-- ----------------------------------------------------
CREATE TABLE carts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    session_id TEXT,
    
    status cart_status DEFAULT 'active',
    
    -- Tracking
    expires_at TIMESTAMP WITH TIME ZONE,
    converted_to_order_id UUID, -- Track conversion
    merged_into_cart_id UUID REFERENCES carts(id), -- Guest → User cart merge
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    CONSTRAINT check_cart_owner CHECK (user_id IS NOT NULL OR session_id IS NOT NULL)
);

CREATE INDEX idx_carts_user_id ON carts(user_id) WHERE status = 'active';
CREATE INDEX idx_carts_session_id ON carts(session_id) WHERE status = 'active';
CREATE INDEX idx_carts_expires_at ON carts(expires_at) WHERE status = 'active';
CREATE TRIGGER set_carts_timestamp BEFORE UPDATE ON carts FOR EACH ROW EXECUTE FUNCTION trigger_set_timestamp();

-- ----------------------------------------------------
-- Cart Items
-- ----------------------------------------------------
CREATE TABLE cart_items (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    cart_id UUID NOT NULL REFERENCES carts(id) ON DELETE CASCADE,
    product_id UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
    variant_id UUID REFERENCES product_variants(id) ON DELETE CASCADE,
    
    quantity INTEGER NOT NULL CHECK (quantity > 0),
    price_snapshot DECIMAL(12,2) NOT NULL, -- Price when added to cart
    
    -- Personalization
    personalization_text TEXT,
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    CONSTRAINT unique_cart_product UNIQUE(cart_id, product_id, variant_id)
);

CREATE INDEX idx_cart_items_cart_id ON cart_items(cart_id);
CREATE INDEX idx_cart_items_product_id ON cart_items(product_id);
CREATE TRIGGER set_cart_items_timestamp BEFORE UPDATE ON cart_items FOR EACH ROW EXECUTE FUNCTION trigger_set_timestamp();

-- ----------------------------------------------------
-- Wishlists (Favorites)
-- ----------------------------------------------------
CREATE TABLE wishlists (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    
    name TEXT DEFAULT 'My Favorites',
    is_public BOOLEAN DEFAULT false,
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_wishlists_user_id ON wishlists(user_id);
CREATE TRIGGER set_wishlists_timestamp BEFORE UPDATE ON wishlists FOR EACH ROW EXECUTE FUNCTION trigger_set_timestamp();

-- ----------------------------------------------------
-- Wishlist Items
-- ----------------------------------------------------
CREATE TABLE wishlist_items (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    wishlist_id UUID NOT NULL REFERENCES wishlists(id) ON DELETE CASCADE,
    product_id UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
    variant_id UUID REFERENCES product_variants(id) ON DELETE CASCADE,
    
    added_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    CONSTRAINT unique_wishlist_product UNIQUE(wishlist_id, product_id, variant_id)
);

CREATE INDEX idx_wishlist_items_wishlist_id ON wishlist_items(wishlist_id);
CREATE INDEX idx_wishlist_items_product_id ON wishlist_items(product_id);

-- =====================================================
-- ORDERS & CHECKOUT
-- =====================================================

-- ----------------------------------------------------
-- Orders (One order per seller - like Etsy)
-- ----------------------------------------------------
CREATE TABLE orders (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    order_number TEXT UNIQUE NOT NULL DEFAULT generate_order_number(),
    
    -- Parties involved
    buyer_id UUID NOT NULL REFERENCES users(id) ON DELETE RESTRICT,
    seller_id UUID NOT NULL REFERENCES seller_profiles(id) ON DELETE RESTRICT,
    
    -- Amounts
    subtotal DECIMAL(12,2) NOT NULL CHECK (subtotal >= 0),
    shipping_cost DECIMAL(12,2) DEFAULT 0.00 CHECK (shipping_cost >= 0),
    tax_amount DECIMAL(12,2) DEFAULT 0.00 CHECK (tax_amount >= 0),
    discount_amount DECIMAL(12,2) DEFAULT 0.00 CHECK (discount_amount >= 0),
    tip_amount DECIMAL(12,2) DEFAULT 0.00 CHECK (tip_amount >= 0),
    total_amount DECIMAL(12,2) NOT NULL CHECK (total_amount >= 0),
    currency TEXT DEFAULT 'USD',
    
    -- Status
    status order_status DEFAULT 'pending_payment',
    
    -- Addresses (snapshot at time of order)
    shipping_address JSONB NOT NULL,
    billing_address JSONB NOT NULL,
    
    -- Coupon used
    coupon_code TEXT,
    
    -- Fulfillment
    estimated_ship_date DATE,
    estimated_delivery_date DATE,
    
    -- Notes
    buyer_note TEXT,
    seller_note TEXT,
    
    -- Cancellation
    cancelled_at TIMESTAMP WITH TIME ZONE,
    cancellation_reason TEXT,
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_orders_buyer_id ON orders(buyer_id, created_at DESC);
CREATE INDEX idx_orders_seller_id ON orders(seller_id, created_at DESC);
CREATE INDEX idx_orders_order_number ON orders(order_number);
CREATE INDEX idx_orders_status ON orders(status, created_at DESC);
CREATE INDEX idx_orders_created_at ON orders(created_at DESC);
CREATE TRIGGER set_orders_timestamp BEFORE UPDATE ON orders FOR EACH ROW EXECUTE FUNCTION trigger_set_timestamp();

-- ----------------------------------------------------
-- Order Items
-- ----------------------------------------------------
CREATE TABLE order_items (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    order_id UUID NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
    product_id UUID NOT NULL REFERENCES products(id) ON DELETE RESTRICT,
    variant_id UUID REFERENCES product_variants(id) ON DELETE RESTRICT,
    
    -- Snapshot data (prices can change after order)
    product_title TEXT NOT NULL,
    product_image_url TEXT,
    variant_name TEXT,
    
    quantity INTEGER NOT NULL CHECK (quantity > 0),
    unit_price DECIMAL(12,2) NOT NULL CHECK (unit_price >= 0),
    total_price DECIMAL(12,2) NOT NULL CHECK (total_price >= 0),
    
    -- Personalization
    personalization_text TEXT,
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_order_items_order_id ON order_items(order_id);
CREATE INDEX idx_order_items_product_id ON order_items(product_id);
CREATE TRIGGER set_order_items_timestamp BEFORE UPDATE ON order_items FOR EACH ROW EXECUTE FUNCTION trigger_set_timestamp();

-- =====================================================
-- PAYMENTS
-- =====================================================

-- ----------------------------------------------------
-- Payment Methods (Saved cards, PayPal, etc.)
-- ----------------------------------------------------
CREATE TABLE payment_methods (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    
    type TEXT NOT NULL, -- 'card', 'paypal', 'bank_account'
    provider TEXT, -- 'stripe', 'paypal'
    
    -- Card details (tokenized)
    card_last_four TEXT,
    card_brand TEXT, -- 'visa', 'mastercard', 'amex'
    card_exp_month INTEGER,
    card_exp_year INTEGER,
    
    -- External references
    gateway_customer_id TEXT, -- Stripe customer ID
    gateway_payment_method_id TEXT, -- Stripe payment method ID
    
    is_default BOOLEAN DEFAULT false,
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_payment_methods_user_id ON payment_methods(user_id);
CREATE TRIGGER set_payment_methods_timestamp BEFORE UPDATE ON payment_methods FOR EACH ROW EXECUTE FUNCTION trigger_set_timestamp();

-- ----------------------------------------------------
-- Payment Transactions
-- ----------------------------------------------------
CREATE TABLE payment_transactions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    order_id UUID NOT NULL REFERENCES orders(id) ON DELETE RESTRICT,
    payment_method_id UUID REFERENCES payment_methods(id) ON DELETE SET NULL,
    
    amount DECIMAL(12,2) NOT NULL CHECK (amount >= 0),
    currency TEXT DEFAULT 'USD',
    
    status payment_status DEFAULT 'pending',
    
    -- Gateway info
    gateway TEXT NOT NULL, -- 'stripe', 'paypal'
    gateway_transaction_id TEXT UNIQUE,
    gateway_response JSONB,
    
    -- Failure tracking
    failure_code TEXT,
    failure_message TEXT,
    
    processed_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_payment_transactions_order_id ON payment_transactions(order_id);
CREATE INDEX idx_payment_transactions_gateway_id ON payment_transactions(gateway_transaction_id);
CREATE INDEX idx_payment_transactions_status ON payment_transactions(status);
CREATE TRIGGER set_payment_transactions_timestamp BEFORE UPDATE ON payment_transactions FOR EACH ROW EXECUTE FUNCTION trigger_set_timestamp();

-- =====================================================
-- SHIPPING
-- =====================================================

-- ----------------------------------------------------
-- Shipping Profiles (Seller's shipping settings)
-- ----------------------------------------------------
CREATE TABLE shipping_profiles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    seller_id UUID NOT NULL REFERENCES seller_profiles(id) ON DELETE CASCADE,
    
    name TEXT NOT NULL,
    
    -- Processing time
    processing_time_min INTEGER DEFAULT 1, -- business days
    processing_time_max INTEGER DEFAULT 3,
    
    -- Origin
    origin_country TEXT NOT NULL,
    origin_postal_code TEXT,
    
    is_default BOOLEAN DEFAULT false,
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_shipping_profiles_seller_id ON shipping_profiles(seller_id);
CREATE TRIGGER set_shipping_profiles_timestamp BEFORE UPDATE ON shipping_profiles FOR EACH ROW EXECUTE FUNCTION trigger_set_timestamp();

-- ----------------------------------------------------
-- Shipping Rates
-- ----------------------------------------------------
CREATE TABLE shipping_rates (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    shipping_profile_id UUID NOT NULL REFERENCES shipping_profiles(id) ON DELETE CASCADE,
    
    -- Destination
    destination_country TEXT NOT NULL,
    destination_region TEXT, -- Optional state/province
    
    -- Rates
    base_cost DECIMAL(10,2) NOT NULL CHECK (base_cost >= 0),
    additional_item_cost DECIMAL(10,2) DEFAULT 0.00 CHECK (additional_item_cost >= 0),
    
    -- Delivery time
    estimated_days_min INTEGER,
    estimated_days_max INTEGER,
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_shipping_rates_profile_id ON shipping_rates(shipping_profile_id);
CREATE INDEX idx_shipping_rates_destination ON shipping_rates(destination_country, destination_region);
CREATE TRIGGER set_shipping_rates_timestamp BEFORE UPDATE ON shipping_rates FOR EACH ROW EXECUTE FUNCTION trigger_set_timestamp();

-- ----------------------------------------------------
-- Shipments (Tracking info)
-- ----------------------------------------------------
CREATE TABLE shipments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    order_id UUID NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
    
    -- Carrier info
    carrier TEXT, -- 'USPS', 'FedEx', 'UPS', 'DHL'
    tracking_number TEXT,
    tracking_url TEXT,
    
    -- Label
    label_url TEXT,
    label_created_at TIMESTAMP WITH TIME ZONE,
    
    -- Status
    status shipment_status DEFAULT 'pending',
    
    -- Dates
    shipped_at TIMESTAMP WITH TIME ZONE,
    estimated_delivery_date DATE,
    delivered_at TIMESTAMP WITH TIME ZONE,
    
    -- Events (stored as JSONB array)
    tracking_events JSONB DEFAULT '[]',
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_shipments_order_id ON shipments(order_id);
CREATE INDEX idx_shipments_tracking_number ON shipments(tracking_number);
CREATE INDEX idx_shipments_status ON shipments(status);
CREATE TRIGGER set_shipments_timestamp BEFORE UPDATE ON shipments FOR EACH ROW EXECUTE FUNCTION trigger_set_timestamp();

-- =====================================================
-- REVIEWS & RATINGS
-- =====================================================

-- ----------------------------------------------------
-- Product Reviews
-- ----------------------------------------------------
CREATE TABLE reviews (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    product_id UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
    order_item_id UUID REFERENCES order_items(id) ON DELETE SET NULL,
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    
    rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
    title TEXT,
    comment TEXT,
    
    status review_status DEFAULT 'pending',
    
    -- Helpful votes
    helpful_count INTEGER DEFAULT 0,
    not_helpful_count INTEGER DEFAULT 0,
    
    -- Seller response
    seller_response TEXT,
    seller_responded_at TIMESTAMP WITH TIME ZONE,
    
    -- Verification
    is_verified_purchase BOOLEAN DEFAULT false,
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    CONSTRAINT unique_user_product_review UNIQUE(user_id, product_id, order_item_id)
);

CREATE INDEX idx_reviews_product_id ON reviews(product_id, created_at DESC);
CREATE INDEX idx_reviews_user_id ON reviews(user_id);
CREATE INDEX idx_reviews_status ON reviews(status);
CREATE TRIGGER set_reviews_timestamp BEFORE UPDATE ON reviews FOR EACH ROW EXECUTE FUNCTION trigger_set_timestamp();

-- ----------------------------------------------------
-- Review Images
-- ----------------------------------------------------
CREATE TABLE review_images (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    review_id UUID NOT NULL REFERENCES reviews(id) ON DELETE CASCADE,
    
    image_url TEXT NOT NULL,
    thumbnail_url TEXT,
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_review_images_review_id ON review_images(review_id);

-- =====================================================
-- MARKETING & PROMOTIONS
-- =====================================================

-- ----------------------------------------------------
-- Coupons
-- ----------------------------------------------------
CREATE TABLE coupons (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    seller_id UUID REFERENCES seller_profiles(id) ON DELETE CASCADE,
    
    code TEXT UNIQUE NOT NULL,
    type coupon_type NOT NULL,
    
    -- Discount details
    discount_value DECIMAL(12,2) NOT NULL CHECK (discount_value > 0),
    
    -- Restrictions
    min_purchase_amount DECIMAL(12,2) DEFAULT 0.00,
    max_discount_amount DECIMAL(12,2),
    
    -- Usage limits
    usage_limit INTEGER, -- NULL = unlimited
    usage_limit_per_customer INTEGER,
    current_usage_count INTEGER DEFAULT 0,
    
    -- Eligibility
    applies_to_product_ids UUID[], -- Specific products (NULL = all products)
    applies_to_category_ids UUID[], -- Specific categories
    customer_eligibility TEXT DEFAULT 'all', -- 'all', 'new_customers', 'returning'
    
    -- Validity
    starts_at TIMESTAMP WITH TIME ZONE NOT NULL,
    expires_at TIMESTAMP WITH TIME ZONE,
    
    is_active BOOLEAN DEFAULT true,
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_coupons_code ON coupons(code) WHERE is_active = true;
CREATE INDEX idx_coupons_seller_id ON coupons(seller_id);
CREATE INDEX idx_coupons_validity ON coupons(starts_at, expires_at) WHERE is_active = true;
CREATE TRIGGER set_coupons_timestamp BEFORE UPDATE ON coupons FOR EACH ROW EXECUTE FUNCTION trigger_set_timestamp();

-- ----------------------------------------------------
-- Coupon Usage (Track redemptions)
-- ----------------------------------------------------
CREATE TABLE coupon_usages (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    coupon_id UUID NOT NULL REFERENCES coupons(id) ON DELETE CASCADE,
    order_id UUID NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    
    discount_amount DECIMAL(12,2) NOT NULL,
    
    used_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_coupon_usages_coupon_id ON coupon_usages(coupon_id);
CREATE INDEX idx_coupon_usages_user_id ON coupon_usages(user_id);

-- =====================================================
-- CUSTOMER SERVICE
-- =====================================================

-- ----------------------------------------------------
-- Conversations (Buyer-Seller messaging)
-- ----------------------------------------------------
CREATE TABLE conversations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    
    -- Participants
    buyer_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    seller_id UUID NOT NULL REFERENCES seller_profiles(id) ON DELETE CASCADE,
    
    -- Context
    order_id UUID REFERENCES orders(id) ON DELETE SET NULL,
    product_id UUID REFERENCES products(id) ON DELETE SET NULL,
    
    subject TEXT,
    
    -- Status
    is_closed BOOLEAN DEFAULT false,
    closed_at TIMESTAMP WITH TIME ZONE,
    
    -- Last message tracking
    last_message_at TIMESTAMP WITH TIME ZONE,
    last_message_from_buyer BOOLEAN,
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_conversations_buyer_id ON conversations(buyer_id, last_message_at DESC);
CREATE INDEX idx_conversations_seller_id ON conversations(seller_id, last_message_at DESC);
CREATE INDEX idx_conversations_order_id ON conversations(order_id);
CREATE TRIGGER set_conversations_timestamp BEFORE UPDATE ON conversations FOR EACH ROW EXECUTE FUNCTION trigger_set_timestamp();

-- ----------------------------------------------------
-- Messages
-- ----------------------------------------------------
CREATE TABLE messages (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    conversation_id UUID NOT NULL REFERENCES conversations(id) ON DELETE CASCADE,
    sender_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    
    message_text TEXT NOT NULL,
    
    -- Attachments
    attachment_urls TEXT[],
    
    -- Read status
    read_at TIMESTAMP WITH TIME ZONE,
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_messages_conversation_id ON messages(conversation_id, created_at DESC);
CREATE INDEX idx_messages_unread ON messages(conversation_id) WHERE read_at IS NULL;

-- ----------------------------------------------------
-- Refund Requests
-- ----------------------------------------------------
CREATE TABLE refund_requests (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    order_id UUID NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
    order_item_id UUID REFERENCES order_items(id) ON DELETE CASCADE,
    
    -- Requester (usually buyer)
    requested_by UUID NOT NULL REFERENCES users(id) ON DELETE RESTRICT,
    
    reason TEXT NOT NULL,
    detailed_explanation TEXT,
    
    -- Amount
    refund_amount DECIMAL(12,2) NOT NULL CHECK (refund_amount > 0),
    
    status refund_status DEFAULT 'requested',
    
    -- Resolution
    resolution_notes TEXT,
    resolved_by UUID REFERENCES users(id),
    resolved_at TIMESTAMP WITH TIME ZONE,
    
    -- Refund processing
    refunded_at TIMESTAMP WITH TIME ZONE,
    refund_transaction_id TEXT,
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_refund_requests_order_id ON refund_requests(order_id);
CREATE INDEX idx_refund_requests_status ON refund_requests(status);
CREATE TRIGGER set_refund_requests_timestamp BEFORE UPDATE ON refund_requests FOR EACH ROW EXECUTE FUNCTION trigger_set_timestamp();

-- ----------------------------------------------------
-- Disputes (Escalated issues)
-- ----------------------------------------------------
CREATE TABLE disputes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    order_id UUID NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
    
    -- Parties
    filed_by UUID NOT NULL REFERENCES users(id) ON DELETE RESTRICT,
    disputed_with UUID NOT NULL REFERENCES users(id) ON DELETE RESTRICT,
    
    reason TEXT NOT NULL,
    detailed_explanation TEXT,
    
    status dispute_status DEFAULT 'open',
    
    -- Resolution
    resolution_details TEXT,
    resolved_by UUID REFERENCES users(id), -- Support agent
    resolved_at TIMESTAMP WITH TIME ZONE,
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_disputes_order_id ON disputes(order_id);
CREATE INDEX idx_disputes_status ON disputes(status);
CREATE TRIGGER set_disputes_timestamp BEFORE UPDATE ON disputes FOR EACH ROW EXECUTE FUNCTION trigger_set_timestamp();

-- ----------------------------------------------------
-- Support Tickets
-- ----------------------------------------------------
CREATE TABLE support_tickets (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    
    subject TEXT NOT NULL,
    description TEXT NOT NULL,
    category TEXT, -- 'account', 'payment', 'shipping', 'product', 'other'
    priority TEXT DEFAULT 'medium', -- 'low', 'medium', 'high', 'urgent'
    
    status TEXT DEFAULT 'open', -- 'open', 'in_progress', 'waiting_customer', 'resolved', 'closed'
    
    -- Assignment
    assigned_to UUID REFERENCES users(id),
    
    -- Resolution
    resolved_at TIMESTAMP WITH TIME ZONE,
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_support_tickets_user_id ON support_tickets(user_id);
CREATE INDEX idx_support_tickets_status ON support_tickets(status);
CREATE INDEX idx_support_tickets_assigned_to ON support_tickets(assigned_to) WHERE status IN ('open', 'in_progress');
CREATE TRIGGER set_support_tickets_timestamp BEFORE UPDATE ON support_tickets FOR EACH ROW EXECUTE FUNCTION trigger_set_timestamp();

-- =====================================================
-- ANALYTICS & TRACKING
-- =====================================================

-- ----------------------------------------------------
-- Product Views (For analytics)
-- ----------------------------------------------------
CREATE TABLE product_views (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    product_id UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
    
    user_id UUID REFERENCES users(id) ON DELETE SET NULL,
    session_id TEXT,
    
    -- Tracking
    referrer TEXT,
    user_agent TEXT,
    ip_address INET,
    
    viewed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_product_views_product_id ON product_views(product_id, viewed_at DESC);
CREATE INDEX idx_product_views_user_id ON product_views(user_id) WHERE user_id IS NOT NULL;

-- Partition by date for scalability
-- ALTER TABLE product_views PARTITION BY RANGE (viewed_at);

-- ----------------------------------------------------
-- Search Queries (For improving search)
-- ----------------------------------------------------
CREATE TABLE search_queries (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    
    query TEXT NOT NULL,
    
    user_id UUID REFERENCES users(id) ON DELETE SET NULL,
    session_id TEXT,
    
    -- Results
    results_count INTEGER,
    clicked_product_id UUID REFERENCES products(id) ON DELETE SET NULL,
    
    searched_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_search_queries_query ON search_queries(query);
CREATE INDEX idx_search_queries_searched_at ON search_queries(searched_at DESC);

-- =====================================================
-- NOTIFICATIONS
-- =====================================================

-- ----------------------------------------------------
-- Notifications
-- ----------------------------------------------------
CREATE TABLE notifications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    
    type TEXT NOT NULL, -- 'order_update', 'message', 'review', 'promotion', 'system'
    title TEXT NOT NULL,
    message TEXT NOT NULL,
    
    -- Action link
    action_url TEXT,
    
    -- Status
    is_read BOOLEAN DEFAULT false,
    read_at TIMESTAMP WITH TIME ZONE,
    
    -- Related entities
    related_type TEXT, -- 'order', 'product', 'conversation'
    related_id UUID,
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_notifications_user_id ON notifications(user_id, created_at DESC);
CREATE INDEX idx_notifications_unread ON notifications(user_id) WHERE is_read = false;

-- =====================================================
-- AUDIT & SECURITY
-- =====================================================

-- ----------------------------------------------------
-- Audit Logs (For compliance & debugging)
-- ----------------------------------------------------
CREATE TABLE audit_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    
    -- What
    table_name TEXT NOT NULL,
    record_id UUID NOT NULL,
    action TEXT NOT NULL, -- 'INSERT', 'UPDATE', 'DELETE'
    
    -- Who
    user_id UUID REFERENCES users(id) ON DELETE SET NULL,
    
    -- When & Where
    ip_address INET,
    user_agent TEXT,
    
    -- Changes
    old_values JSONB,
    new_values JSONB,
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_audit_logs_table_record ON audit_logs(table_name, record_id);
CREATE INDEX idx_audit_logs_user_id ON audit_logs(user_id);
CREATE INDEX idx_audit_logs_created_at ON audit_logs(created_at DESC);

-- ----------------------------------------------------
-- Login History
-- ----------------------------------------------------
CREATE TABLE login_history (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    
    success BOOLEAN NOT NULL,
    
    ip_address INET,
    user_agent TEXT,
    location TEXT, -- Geo-location (optional)
    
    failure_reason TEXT, -- If success = false
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_login_history_user_id ON login_history(user_id, created_at DESC);

-- =====================================================
-- MATERIALIZED VIEWS (For performance)
-- =====================================================

-- ----------------------------------------------------
-- Seller Statistics (Updated daily)
-- ----------------------------------------------------
CREATE MATERIALIZED VIEW seller_statistics AS
SELECT 
    sp.id as seller_id,
    sp.shop_name,
    
    -- Product stats
    COUNT(DISTINCT p.id) as total_products,
    COUNT(DISTINCT p.id) FILTER (WHERE p.status = 'active') as active_products,
    
    -- Order stats
    COUNT(DISTINCT o.id) as total_orders,
    COUNT(DISTINCT o.id) FILTER (WHERE o.created_at > NOW() - INTERVAL '30 days') as orders_last_30_days,
    COUNT(DISTINCT o.id) FILTER (WHERE o.status = 'delivered') as delivered_orders,
    
    -- Revenue stats
    COALESCE(SUM(o.total_amount) FILTER (WHERE o.status NOT IN ('cancelled', 'refunded')), 0) as total_revenue,
    COALESCE(SUM(o.total_amount) FILTER (WHERE o.created_at > NOW() - INTERVAL '30 days'), 0) as revenue_last_30_days,
    
    -- Review stats
    AVG(r.rating) as average_rating,
    COUNT(r.id) as total_reviews,
    
    -- Last activity
    MAX(o.created_at) as last_order_at,
    MAX(p.created_at) as last_product_added_at
    
FROM seller_profiles sp
LEFT JOIN products p ON p.seller_id = sp.id AND p.deleted_at IS NULL
LEFT JOIN orders o ON o.seller_id = sp.id
LEFT JOIN order_items oi ON oi.order_id = o.id
LEFT JOIN reviews r ON r.product_id = p.id AND r.status = 'approved'
GROUP BY sp.id, sp.shop_name;

CREATE UNIQUE INDEX idx_seller_statistics_seller_id ON seller_statistics(seller_id);

-- Refresh daily
-- REFRESH MATERIALIZED VIEW CONCURRENTLY seller_statistics;

-- ----------------------------------------------------
-- Product Analytics (Updated daily)
-- ----------------------------------------------------
CREATE MATERIALIZED VIEW product_analytics AS
SELECT 
    p.id as product_id,
    p.title,
    p.seller_id,
    
    -- View stats
    COUNT(DISTINCT pv.id) as total_views,
    COUNT(DISTINCT pv.id) FILTER (WHERE pv.viewed_at > NOW() - INTERVAL '7 days') as views_last_7_days,
    COUNT(DISTINCT pv.id) FILTER (WHERE pv.viewed_at > NOW() - INTERVAL '30 days') as views_last_30_days,
    
    -- Sales stats
    COUNT(DISTINCT oi.id) as total_sales,
    COALESCE(SUM(oi.quantity), 0) as units_sold,
    COALESCE(SUM(oi.total_price), 0) as revenue_generated,
    
    -- Conversion rate
    CASE 
        WHEN COUNT(DISTINCT pv.id) > 0 
        THEN (COUNT(DISTINCT oi.id)::FLOAT / COUNT(DISTINCT pv.id)::FLOAT) * 100 
        ELSE 0 
    END as conversion_rate,
    
    -- Review stats
    AVG(r.rating) as average_rating,
    COUNT(r.id) as review_count,
    
    -- Favorite stats
    COUNT(DISTINCT wi.id) as favorite_count
    
FROM products p
LEFT JOIN product_views pv ON pv.product_id = p.id
LEFT JOIN order_items oi ON oi.product_id = p.id
LEFT JOIN reviews r ON r.product_id = p.id AND r.status = 'approved'
LEFT JOIN wishlist_items wi ON wi.product_id = p.id
WHERE p.deleted_at IS NULL
GROUP BY p.id, p.title, p.seller_id;

CREATE UNIQUE INDEX idx_product_analytics_product_id ON product_analytics(product_id);

-- =====================================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- =====================================================

-- Enable RLS on sensitive tables
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE addresses ENABLE ROW LEVEL SECURITY;
ALTER TABLE payment_methods ENABLE ROW LEVEL SECURITY;
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE payment_transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE carts ENABLE ROW LEVEL SECURITY;
ALTER TABLE wishlists ENABLE ROW LEVEL SECURITY;

-- Users: Own data only
CREATE POLICY users_own_data ON users
    FOR ALL USING (id = current_setting('app.user_id', true)::UUID);

-- Addresses: Own addresses only
CREATE POLICY addresses_own_data ON addresses
    FOR ALL USING (user_id = current_setting('app.user_id', true)::UUID);

-- Payment Methods: Own payment methods only
CREATE POLICY payment_methods_own_data ON payment_methods
    FOR ALL USING (user_id = current_setting('app.user_id', true)::UUID);

-- Orders: Buyer or seller can see
CREATE POLICY orders_participant_access ON orders
    FOR SELECT USING (
        buyer_id = current_setting('app.user_id', true)::UUID OR
        seller_id IN (SELECT id FROM seller_profiles WHERE user_id = current_setting('app.user_id', true)::UUID)
    );

-- Carts: Own cart only
CREATE POLICY carts_own_data ON carts
    FOR ALL USING (user_id = current_setting('app.user_id', true)::UUID);

-- Wishlists: Own wishlists only (or public ones for read)
CREATE POLICY wishlists_own_data ON wishlists
    FOR ALL USING (user_id = current_setting('app.user_id', true)::UUID);

CREATE POLICY wishlists_public_read ON wishlists
    FOR SELECT USING (is_public = true);

-- =====================================================
-- USEFUL FUNCTIONS
-- =====================================================

-- Calculate order total
CREATE OR REPLACE FUNCTION calculate_order_total(
    p_subtotal DECIMAL(12,2),
    p_shipping_cost DECIMAL(12,2),
    p_tax_amount DECIMAL(12,2),
    p_discount_amount DECIMAL(12,2),
    p_tip_amount DECIMAL(12,2)
)
RETURNS DECIMAL(12,2) AS $$
BEGIN
    RETURN p_subtotal + p_shipping_cost + p_tax_amount - p_discount_amount + p_tip_amount;
END;
$$ LANGUAGE plpgsql IMMUTABLE;

-- Update product rating
CREATE OR REPLACE FUNCTION update_product_rating()
RETURNS TRIGGER AS $$
BEGIN
    UPDATE products
    SET 
        average_rating = (SELECT AVG(rating) FROM reviews WHERE product_id = NEW.product_id AND status = 'approved'),
        review_count = (SELECT COUNT(*) FROM reviews WHERE product_id = NEW.product_id AND status = 'approved')
    WHERE id = NEW.product_id;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_product_rating_on_review
AFTER INSERT OR UPDATE ON reviews
FOR EACH ROW
EXECUTE FUNCTION update_product_rating();

-- Update seller rating
CREATE OR REPLACE FUNCTION update_seller_rating()
RETURNS TRIGGER AS $$
BEGIN
    UPDATE seller_profiles
    SET 
        average_rating = (
            SELECT AVG(r.rating) 
            FROM reviews r
            JOIN products p ON p.id = r.product_id
            WHERE p.seller_id = (SELECT seller_id FROM products WHERE id = NEW.product_id)
            AND r.status = 'approved'
        ),
        total_reviews = (
            SELECT COUNT(*) 
            FROM reviews r
            JOIN products p ON p.id = r.product_id
            WHERE p.seller_id = (SELECT seller_id FROM products WHERE id = NEW.product_id)
            AND r.status = 'approved'
        )
    WHERE id = (SELECT seller_id FROM products WHERE id = NEW.product_id);
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_seller_rating_on_review
AFTER INSERT OR UPDATE ON reviews
FOR EACH ROW
EXECUTE FUNCTION update_seller_rating();

-- Auto-expire cart reservations
CREATE OR REPLACE FUNCTION expire_cart_reservations()
RETURNS void AS $$
BEGIN
    UPDATE carts
    SET status = 'expired'
    WHERE status = 'active'
    AND expires_at < NOW();
    
    -- Release inventory reservations
    UPDATE inventory_reservations
    SET released_at = NOW()
    WHERE released_at IS NULL
    AND expires_at < NOW();
END;
$$ LANGUAGE plpgsql;

-- =====================================================
-- SAMPLE DATA QUERIES (For testing)
-- =====================================================

-- Top selling products
-- SELECT 
--     p.id,
--     p.title,
--     p.price,
--     pa.units_sold,
--     pa.revenue_generated,
--     pa.average_rating
-- FROM products p
-- JOIN product_analytics pa ON pa.product_id = p.id
-- WHERE p.status = 'active'
-- ORDER BY pa.units_sold DESC
-- LIMIT 20;

-- Seller dashboard stats
-- SELECT * FROM seller_statistics 
-- WHERE seller_id = 'YOUR_SELLER_ID';

-- Recent orders for a seller
-- SELECT 
--     o.order_number,
--     o.total_amount,
--     o.status,
--     o.created_at,
--     u.display_name as buyer_name
-- FROM orders o
-- JOIN users u ON u.id = o.buyer_id
-- WHERE o.seller_id = 'YOUR_SELLER_ID'
-- ORDER BY o.created_at DESC
-- LIMIT 20;

-- =====================================================
-- PERFORMANCE OPTIMIZATION NOTES
-- =====================================================

/*
1. INDEXING STRATEGY:
   - All foreign keys indexed
   - Composite indexes for common queries
   - Partial indexes for filtered queries
   - GIN indexes for full-text search
   - BRIN indexes for time-series data (optional)

2. PARTITIONING:
   - Consider partitioning orders by date range
   - Consider partitioning product_views by date
   - Use RANGE partitioning for time-series data

3. MATERIALIZED VIEWS:
   - Refresh seller_statistics daily
   - Refresh product_analytics daily
   - Consider incremental refresh strategies

4. CACHING STRATEGY:
   - Cache product catalog in Redis
   - Cache user sessions in Redis
   - Cache frequently accessed seller profiles

5. DATABASE CONFIGURATION:
   - Increase shared_buffers (25% of RAM)
   - Tune work_mem for complex queries
   - Enable pg_stat_statements for monitoring
   - Use connection pooling (PgBouncer/pgpool)

6. MONITORING:
   - Track slow queries with pg_stat_statements
   - Monitor index usage with pg_stat_user_indexes
   - Set up alerts for table bloat
   - Monitor replication lag if using replicas

7. BACKUP STRATEGY:
   - Daily full backups
   - Continuous WAL archiving
   - Test restore procedures regularly
   - Keep 30 days of backups

8. SCALABILITY:
   - Read replicas for reporting/analytics
   - Sharding by seller_id for massive scale
   - Consider TimescaleDB for time-series data
   - Use pgvector for ML-based recommendations
*/

-- =====================================================
-- END OF SCHEMA
-- =====================================================
