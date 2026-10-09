/**
 * @wabisabiart/types-storefront
 * Central barrel for all TypeScript types used in the storefront (Next.js) app.
 * Keep types here, import from this package in apps/storefront.
 */

// ── Re-export all domain type files ──────────────────────────────────────────
export * from './address';
export * from './auth';
export * from './cards';
export * from './category';
export * from './chat';
export * from './checkout';
export * from './contact';
export * from './inbox';
export * from './journal';
export * from './order';
export * from './product';
export * from './productDetails';
export * from './reviews';
export * from './seller-form';
export * from './seller-profile';
export * from './wishlist';

// ── Seller Dashboard sub-namespace ───────────────────────────────────────────
export * from './sellerDashboard/CardItems';
export * from './sellerDashboard/CouponsItems';
export * from './sellerDashboard/Customers';
export * from './sellerDashboard/FreeShippingRules';
export * from './sellerDashboard/ImportReview';
export * from './sellerDashboard/JournalsItems';
export * from './sellerDashboard/Marketting';
export * from './sellerDashboard/NotificationType';
export * from './sellerDashboard/Orders';
export * from './sellerDashboard/Products';
export * from './sellerDashboard/PromotionItems';
export * from './sellerDashboard/Revenue';
export * from './sellerDashboard/Settings';
export * from './sellerDashboard/Support';
export * from './sellerDashboard/TableData';
export * from './sellerDashboard/sidebar';
