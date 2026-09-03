export type Currency = 'INR' | 'USD' | 'EUR' | 'GBP' | 'JPY';

export interface ProductColor {
  name: string;
  hex: string;
  image?: string;
}

export interface Product {
  id: string;
  sku: string;
  brand: string;
  designer?: string; // alias for brand
  name: string;
  category: string; // 'Dresses' | 'Tailoring' | 'Outerwear' | 'Accessories' | 'Footwear' | 'Jewelry'
  occasion: string; // 'Evening' | 'Formal' | 'Occasion' | 'Smart Casual' | 'Winter'
  color: string;
  description: string;
  price: number; // in INR (₹)
  currency: 'INR';
  stock: number;
  availability: 'In Stock' | 'Low Stock' | 'Out of Stock';
  sizes: string[];
  imageUrl: string;
  images: string[];
  imageSource?: string;
  sourceUrl?: string;
  upsellProductId?: string;
  crossSellProductIds?: string[];
  pairingIds?: string[];
  aiReadinessScore: number;
  aiAttributes?: {
    formality: 'Formal' | 'Ultra-Formal' | 'Elevated Casual' | 'Black Tie';
    silhouette: string;
    fabric: string;
    stylingNote: string;
    temperatureTag: string;
  };
  details?: string[];
  composition?: string;
  origin?: string;
  season?: string;
  care?: string;
  colors?: ProductColor[];
  fit?: string;
  whyThisReason?: string;
  isNewArrival?: boolean;
  isBestseller?: boolean;
  isEditorialPick?: boolean;
}

export interface CartItem {
  id: string;
  product: Product;
  selectedColor?: ProductColor | any;
  selectedSize: string;
  quantity: number;
  isPriceChanged?: boolean;
  oldPrice?: number;
  newPrice?: number;
  isOutOfStock?: boolean;
}

export interface WishlistItem {
  product: Product;
  addedAt: number;
}

export interface StylistOutfitBreakdown {
  theme: string;
  rationale: string;
  items: string[];
}

export interface StylistMessage {
  id: string;
  sender: 'user' | 'stylist' | 'system';
  text: string;
  timestamp: number;
  recommendedProductIds?: string[];
  suggestedActions?: string[];
  upsellProductId?: string;
  crossSellProductIds?: string[];
  recommendationType?: 'standard' | 'upsell' | 'cross_sell' | 'alternative';
  outfitBreakdown?: StylistOutfitBreakdown;
  whyThisMap?: Record<string, string>;
  isNoMatchFallback?: boolean;
}

export interface UpsellRecommendation {
  originalProduct: Product;
  upsellProduct: Product;
  priceDifferenceINR: number;
  rationale: string;
}

export interface CrossSellRecommendation {
  baseProduct: Product;
  crossSellProducts: Product[];
  stylingRationale: string;
}

export interface SizingRecommendation {
  recommendedSize: string;
  confidence: number;
  fitAssessment: string;
}

export interface CapsuleSlot {
  id: string;
  role: string;
  product?: Product;
}

export interface EditorialHotspot {
  productId: string;
  x: number;
  y: number;
  label: string;
}

export interface EditorialStory {
  id: string;
  title: string;
  subtitle: string;
  heroImage?: string;
  coverImage?: string;
  quote?: string;
  narrative?: string;
  description?: string;
  featuredProductIds: string[];
  hotspots?: EditorialHotspot[];
}

export interface RawCatalogBatch {
  id: string;
  name: string;
  uploadedAt: number;
  totalParsed: number;
  validCount: number;
  missingFieldsCount: number;
  readinessScore: number;
  issues: string[];
  products: any[];
  isEnriched: boolean;
  status: 'ready_for_ai' | 'enriched' | 'synced_to_agent' | 'failed';
  rawText?: string;
  sourceType?: 'csv' | 'json' | 'text';
}

// ==================== AUDIT TRAIL ====================
export type AuditCategory = 
  | 'CATALOG'
  | 'AI_SEARCH'
  | 'RECOMMENDATION'
  | 'UPSELL'
  | 'CROSS_SELL'
  | 'CART'
  | 'USER_APPROVAL'
  | 'CHECKOUT'
  | 'RAZORPAY'
  | 'PAYMENT'
  | 'ORDER'
  | 'CAMPAIGN'
  | 'GUARDRAIL'
  | 'GATE_APPROVAL'
  | 'FAILURE'
  | 'MERCHANT_ACTION'
  | 'SYSTEM';

export interface GuardrailPolicy {
  maxSpendCapINR: number;
  maxDiscountPercent: number;
  requireHumanGateAboveCap: boolean;
  enforceBoundedChecks: boolean;
  autoHoldOnBreach: boolean;
}

export interface AuditEntry {
  id: string;
  timestamp: number;
  category: AuditCategory;
  title: string;
  details: string;
  status: 'info' | 'success' | 'warning' | 'error';
  actor?: 'Buyer' | 'Merchant' | 'AI Agent' | 'Razorpay' | 'System';
  action?: string;
  result?: string;
  relatedOrderId?: string;
  relatedProductId?: string;
  metadata?: Record<string, any>;
}

// ==================== MERCHANT & AGENT PERFORMANCE ====================
export interface AgentPerformanceStats {
  upsellShown: number;
  upsellAccepted: number;
  upsellRejected: number;
  upsellRevenueINR: number;
  crossSellShown: number;
  crossSellAccepted: number;
  crossSellRejected: number;
  crossSellRevenueINR: number;
  totalSearchQueries: number;
  catalogItemsManaged: number;
  totalRevenueINR: number;
  totalOrders: number;
  aiInfluencedRevenueINR: number;
}

export type OrderPaymentStatus = 'Paid' | 'Pending' | 'Payment Failed';
export type OrderStatus = 'Pending' | 'Processing' | 'Paid' | 'Shipped' | 'Delivered' | 'Cancelled' | 'Payment Failed' | 'Confirmed';

export interface MerchantOrder {
  id: string;
  orderNumber: string;
  buyerName: string;
  buyerEmail: string;
  buyerPhone: string;
  shippingAddress?: string;
  items: {
    productId: string;
    productName: string;
    size: string;
    color: string;
    quantity: number;
    priceINR: number;
    imageUrl?: string;
  }[];
  totalINR: number;
  paymentMethod: string;
  paymentStatus?: OrderPaymentStatus;
  orderStatus?: OrderStatus;
  status: OrderStatus;
  razorpayPaymentId?: string;
  createdAt: number;
  includesUpsell?: boolean;
  includesCrossSell?: boolean;
}

export interface GrowthCampaign {
  id: string;
  title: string;
  opportunity?: string;
  opportunityType: 'VIP Retention' | 'Cart Recovery' | 'New Capsule Drop' | 'Seasonal Promotion' | 'Cross-Sell Bundle';
  targetAudience: string;
  recipientCount: number;
  projectedRevenueINR: number;
  actualRevenueINR?: number;
  conversionRate?: number;
  discountPercent?: number;
  promoCode?: string;
  bannerAnnouncement?: string;
  products?: Product[];
  productIds?: string[];
  emailSubject: string;
  emailPreview: string;
  emailBody: string;
  status: 'draft' | 'suggested' | 'approved' | 'executing' | 'launched' | 'failed' | 'dismissed';
  failureReason?: string;
  createdAt?: number;
  launchedAt?: number;
  tags: string[];
}

export interface UserViewedItem {
  productId: string;
  productName: string;
  category: string;
  price: number;
  viewedAt: number;
  count: number;
  imageUrl?: string;
  sku?: string;
}

export interface UserPurchasedItem {
  productId: string;
  productName: string;
  category: string;
  price: number;
  purchasedAt: number;
  quantity: number;
  orderId: string;
  orderNumber: string;
  imageUrl?: string;
  sku?: string;
}

export interface UserActivityRecord {
  userId: string;
  userEmail: string;
  userName: string;
  userPhone?: string;
  lastActiveAt: number;
  totalSpentINR: number;
  intentCategory: 'High Intent' | 'VIP Customer' | 'Window Shopper' | 'Dormant Cart';
  viewedItems: UserViewedItem[];
  purchasedItems: UserPurchasedItem[];
  exclusiveOffersReceived: {
    campaignId: string;
    title: string;
    discountPercent: number;
    promoCode: string;
    sentAt: number;
    status: 'Sent' | 'Claimed' | 'Expired';
  }[];
  aiBehavioralInsight?: string;
}

export interface UserProfile {
  id: string;
  email: string;
  displayName: string;
  role: 'buyer' | 'merchant';
  phone?: string;
  address?: string;
  createdAt: number;
}

