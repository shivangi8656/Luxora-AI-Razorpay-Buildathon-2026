import React, { createContext, useContext, useState, useEffect } from 'react';
import { 
  Product, 
  MerchantOrder, 
  AgentPerformanceStats, 
  GrowthCampaign, 
  RawCatalogBatch,
  UserActivityRecord,
  UserViewedItem,
  UserPurchasedItem,
  GuardrailPolicy
} from '../types';
import { PRODUCTS } from '../data/products';
import { useAudit } from './AuditContext';
import { 
  saveOrderToFirestore, 
  saveCampaignToFirestore, 
  saveCatalogBatchToFirestore 
} from '../lib/firebaseService';

interface MerchantContextType {
  catalog: Product[];
  rawBatches: RawCatalogBatch[];
  agentStats: AgentPerformanceStats;
  orders: MerchantOrder[];
  campaigns: GrowthCampaign[];
  activeCampaigns: GrowthCampaign[];
  activeCampaignBanner: string | null;
  activePromoDiscount: number;
  userActivities: UserActivityRecord[];
  isSimulatedPriceChangeActive: boolean;
  isSimulatedOutOfStockActive: boolean;
  setSimulatedPriceChangeActive: (v: boolean) => void;
  setSimulatedOutOfStockActive: (v: boolean) => void;
  
  // AI Governance & Guardrails
  guardrailPolicy: GuardrailPolicy;
  updateGuardrailPolicy: (policy: Partial<GuardrailPolicy>) => void;
  
  // Catalog actions
  addRawBatch: (name: string, rawText: string) => Promise<RawCatalogBatch>;
  fixBatchWithAi: (batchId: string) => Promise<void>;
  syncBatchToAgent: (batchId: string) => void;
  updateProduct: (productId: string, updates: Partial<Product>) => void;
  addProduct: (newProduct: Product) => void;
  deleteProduct: (productId: string) => void;
  resetCatalogToDefault: () => void;
  updateProductStock: (productId: string, newStock: number) => void;
  toggleProductOutOfStock: (productId: string) => void;
  
  // Agent Performance actions
  recordUpsellEvent: (accepted: boolean, revenueINR: number, productName: string) => void;
  recordCrossSellEvent: (accepted: boolean, revenueINR: number, productName: string) => void;
  recordSearchQuery: (query: string) => void;
  
  // Orders
  createOrder: (order: Omit<MerchantOrder, 'id' | 'orderNumber' | 'createdAt'>) => MerchantOrder;
  
  // User Activity Tracking & Exclusive Offers
  trackProductView: (product: Product, userOverride?: { email?: string; name?: string; id?: string }) => void;
  trackProductPurchase: (order: MerchantOrder) => void;
  createExclusiveOfferCampaign: (targetUserId: string, offer: {
    title: string;
    discountPercent: number;
    promoCode: string;
    targetProductIds?: string[];
    emailSubject: string;
    emailBody: string;
    customNote?: string;
  }) => GrowthCampaign;

  // Campaigns
  addCustomCampaign: (campaign: Omit<GrowthCampaign, 'id' | 'createdAt'>) => GrowthCampaign;
  approveCampaign: (id: string) => void;
  dismissCampaign: (id: string) => void;
  launchCampaign: (id: string) => void;
  refreshAiCampaigns: () => Promise<void>;

  // AI Copilot Coupon Control
  deactivatedPromoCodes: string[];
  setCouponActive: (promoCode: string, discountPercent: number, options?: { title?: string; bannerAnnouncement?: string }) => GrowthCampaign;
  deactivateCoupon: (promoCode: string) => boolean;
  isCouponActive: (promoCode: string) => boolean;
}


const MerchantContext = createContext<MerchantContextType | undefined>(undefined);

const INITIAL_STATS: AgentPerformanceStats = {
  upsellShown: 34,
  upsellAccepted: 14,
  upsellRejected: 20,
  upsellRevenueINR: 624500,
  crossSellShown: 48,
  crossSellAccepted: 23,
  crossSellRejected: 25,
  crossSellRevenueINR: 486000,
  totalSearchQueries: 112,
  catalogItemsManaged: 66,
  totalRevenueINR: 3850000,
  totalOrders: 28,
  aiInfluencedRevenueINR: 1110500,
};

const INITIAL_ORDERS: MerchantOrder[] = [
  {
    id: 'ord-101',
    orderNumber: 'LUX-8942',
    buyerName: 'Shivangi Sharma',
    buyerEmail: 'sharma.shivangiz105@gmail.com',
    buyerPhone: '+91 98200 88912',
    items: [
      {
        productId: 'LX-WD-001',
        productName: 'Noir Column Dress',
        size: 'FR 36 (US 2)',
        color: 'Noir',
        quantity: 1,
        priceINR: 125000
      },
      {
        productId: 'LX-JW-001',
        productName: 'Architectural Gold Hoop Earrings',
        size: 'One Size',
        color: 'Yellow Gold',
        quantity: 1,
        priceINR: 42000
      }
    ],
    totalINR: 167000,
    paymentMethod: 'Razorpay Verified',
    paymentStatus: 'Paid',
    orderStatus: 'Confirmed',
    razorpayPaymentId: 'pay_rzp_shivangi_9921',
    status: 'Confirmed',
    createdAt: Date.now() - 1000 * 60 * 60 * 3,
    includesCrossSell: true,
  },
  {
    id: 'ord-102',
    orderNumber: 'LUX-8941',
    buyerName: 'Countess Camille Dubois',
    buyerEmail: 'camille@dubois-couture.fr',
    buyerPhone: '+91 98200 44102',
    items: [
      {
        productId: 'LX-WD-002',
        productName: 'Noir Atelier Gown',
        size: 'FR 36 (US 2)',
        color: 'Noir',
        quantity: 1,
        priceINR: 169000
      }
    ],
    totalINR: 169000,
    paymentMethod: 'Razorpay Verified',
    paymentStatus: 'Paid',
    orderStatus: 'Shipped',
    razorpayPaymentId: 'pay_rzp_camille_8834',
    status: 'Shipped',
    createdAt: Date.now() - 1000 * 60 * 60 * 8,
  }
];

const INITIAL_CAMPAIGNS: GrowthCampaign[] = [
  {
    id: 'camp-1',
    title: 'SS26 Evening Noir & Mulberry Silk Private Vernissage',
    opportunity: 'VIP patrons with high affinity for formal evening wear have not viewed the latest SS26 additions',
    opportunityType: 'VIP Retention',
    targetAudience: 'Top Tier VIP Patrons (₹25,000+ Lifetime)',
    recipientCount: 142,
    projectedRevenueINR: 850000,
    discountPercent: 15,
    promoCode: 'VIPVERNISSAGE15',
    bannerAnnouncement: 'Private Vernissage: Enjoy 15% VIP Privileges with code VIPVERNISSAGE15',
    emailSubject: 'Private Invitation: The SS26 Capsule Vernissage',
    emailPreview: 'An exclusive early look at hand-finished Mulberry silk column gowns and bespoke tailoring...',
    emailBody: 'Dear Patron,\n\nAs a valued member of Maison LUXORA, we are privileged to extend early access to our private SS26 Atelier pieces before public release.\n\nEnjoy complimentary white-glove courier delivery and bespoke sizing alterations on your curated ensemble.\n\nWarm regards,\nMaison LUXORA Atelier',
    status: 'launched',
    tags: ['VIP', 'SS26', 'High-AOV'],
    products: [],
    productIds: ['LX-WD-001', 'LX-WD-002'],
    createdAt: Date.now() - 86400000,
    launchedAt: Date.now() - 3600000,
  },
  {
    id: 'camp-2',
    title: 'Cart Abandonment Recovery: Noir Column Dress',
    opportunity: 'High intent buyers abandoned bag containing evening gowns',
    opportunityType: 'Cart Recovery',
    targetAudience: 'Clients with high-intent bag items past 24h',
    recipientCount: 88,
    projectedRevenueINR: 420000,
    discountPercent: 10,
    promoCode: 'SILKRECOVERY10',
    bannerAnnouncement: 'Complimentary White Glove Alteration & 10% privilege on evening gowns with SILKRECOVERY10',
    emailSubject: 'Your Curated Silhouette Awaits at Maison LUXORA',
    emailPreview: 'Your Noir Column Dress has been reserved in our boutique...',
    emailBody: 'Dear Client,\n\nYour selected Noir Column Dress remains safely reserved in your private bag. Our atelier artisans have set aside your size for the next 48 hours.\n\nComplete your order with seamless Razorpay express checkout.\n\nAt your service,\nLUXORA Private Concierge',
    status: 'suggested',
    tags: ['Cart Recovery', 'Evening', 'Automated'],
    products: [],
    productIds: ['LX-WD-001'],
    createdAt: Date.now() - 43200000,
  }
];

const INITIAL_USER_ACTIVITIES: UserActivityRecord[] = [
  {
    userId: 'usr-shivangi',
    userEmail: 'sharma.shivangiz105@gmail.com',
    userName: 'Shivangi Sharma',
    userPhone: '+91 98200 88912',
    lastActiveAt: Date.now() - 1000 * 60 * 12,
    totalSpentINR: 167000,
    intentCategory: 'VIP Customer',
    aiBehavioralInsight: 'Active haute-couture patron. Re-browsed Emerald Silk Slip Dress & Evening Bags 4x this week. Highly receptive to 15% VIP capsule invitations.',
    viewedItems: [
      {
        productId: 'LX-WD-001',
        productName: 'Noir Column Dress',
        category: 'Wardrobe',
        price: 125000,
        viewedAt: Date.now() - 1000 * 60 * 15,
        count: 6,
        imageUrl: 'https://images.unsplash.com/photo-1595777457583-95e059d581b8?q=80&w=1000&auto=format&fit=crop',
        sku: 'LX-WD-001'
      },
      {
        productId: 'LX-WD-003',
        productName: 'Emerald Silk Slip Dress',
        category: 'Wardrobe',
        price: 110000,
        viewedAt: Date.now() - 1000 * 60 * 35,
        count: 4,
        imageUrl: 'https://images.unsplash.com/photo-1566174053879-31528523f8ae?q=80&w=1000&auto=format&fit=crop',
        sku: 'LX-WD-003'
      },
      {
        productId: 'LX-JW-001',
        productName: 'Architectural Gold Hoop Earrings',
        category: 'Jewelry',
        price: 42000,
        viewedAt: Date.now() - 1000 * 60 * 90,
        count: 3,
        imageUrl: 'https://images.unsplash.com/photo-1630019852942-f89202989a59?q=80&w=1000&auto=format&fit=crop',
        sku: 'LX-JW-001'
      }
    ],
    purchasedItems: [
      {
        productId: 'LX-WD-001',
        productName: 'Noir Column Dress',
        category: 'Wardrobe',
        price: 125000,
        purchasedAt: Date.now() - 1000 * 60 * 60 * 3,
        quantity: 1,
        orderId: 'ord-101',
        orderNumber: 'LUX-8942',
        imageUrl: 'https://images.unsplash.com/photo-1595777457583-95e059d581b8?q=80&w=1000&auto=format&fit=crop',
        sku: 'LX-WD-001'
      },
      {
        productId: 'LX-JW-001',
        productName: 'Architectural Gold Hoop Earrings',
        category: 'Jewelry',
        price: 42000,
        purchasedAt: Date.now() - 1000 * 60 * 60 * 3,
        quantity: 1,
        orderId: 'ord-101',
        orderNumber: 'LUX-8942',
        imageUrl: 'https://images.unsplash.com/photo-1630019852942-f89202989a59?q=80&w=1000&auto=format&fit=crop',
        sku: 'LX-JW-001'
      }
    ],
    exclusiveOffersReceived: [
      {
        campaignId: 'camp-1',
        title: 'SS26 Evening Noir & Mulberry Silk Private Vernissage',
        discountPercent: 15,
        promoCode: 'VIPVERNISSAGE15',
        sentAt: Date.now() - 1000 * 60 * 60 * 24,
        status: 'Claimed'
      }
    ]
  },
  {
    userId: 'usr-camille',
    userEmail: 'camille@dubois-couture.fr',
    userName: 'Countess Camille Dubois',
    userPhone: '+91 98200 44102',
    lastActiveAt: Date.now() - 1000 * 60 * 60 * 2,
    totalSpentINR: 169000,
    intentCategory: 'VIP Customer',
    aiBehavioralInsight: 'Parisian couture connoisseur. Regularly inspects new gown drops and diamond chokers.',
    viewedItems: [
      {
        productId: 'LX-WD-002',
        productName: 'Noir Atelier Gown',
        category: 'Wardrobe',
        price: 169000,
        viewedAt: Date.now() - 1000 * 60 * 60 * 2,
        count: 5,
        imageUrl: 'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?q=80&w=1000&auto=format&fit=crop',
        sku: 'LX-WD-002'
      },
      {
        productId: 'LX-JW-002',
        productName: 'Diamond Pavé Choker',
        category: 'Jewelry',
        price: 95000,
        viewedAt: Date.now() - 1000 * 60 * 60 * 5,
        count: 3,
        imageUrl: 'https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?q=80&w=1000&auto=format&fit=crop',
        sku: 'LX-JW-002'
      }
    ],
    purchasedItems: [
      {
        productId: 'LX-WD-002',
        productName: 'Noir Atelier Gown',
        category: 'Wardrobe',
        price: 169000,
        purchasedAt: Date.now() - 1000 * 60 * 60 * 8,
        quantity: 1,
        orderId: 'ord-102',
        orderNumber: 'LUX-8941',
        imageUrl: 'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?q=80&w=1000&auto=format&fit=crop',
        sku: 'LX-WD-002'
      }
    ],
    exclusiveOffersReceived: []
  },
  {
    userId: 'usr-aryan',
    userEmail: 'aryan.khanna@mumbai.co.in',
    userName: 'Aryan Khanna',
    userPhone: '+91 98110 55214',
    lastActiveAt: Date.now() - 1000 * 60 * 45,
    totalSpentINR: 0,
    intentCategory: 'High Intent',
    aiBehavioralInsight: 'Repeatedly explored Cashmere Wool Overcoat (7 times) and Tuscan Leather Briefcase. Prime opportunity for a 12% cart recovery offer.',
    viewedItems: [
      {
        productId: 'LX-WD-005',
        productName: 'Cashmere Wool Overcoat',
        category: 'Wardrobe',
        price: 145000,
        viewedAt: Date.now() - 1000 * 60 * 45,
        count: 7,
        imageUrl: 'https://images.unsplash.com/photo-1544441893-675973e31985?q=80&w=1000&auto=format&fit=crop',
        sku: 'LX-WD-005'
      },
      {
        productId: 'LX-BG-002',
        productName: 'Tuscan Leather Briefcase',
        category: 'Bags',
        price: 88000,
        viewedAt: Date.now() - 1000 * 60 * 120,
        count: 4,
        imageUrl: 'https://images.unsplash.com/photo-1548036328-c9fa89d128fa?q=80&w=1000&auto=format&fit=crop',
        sku: 'LX-BG-002'
      }
    ],
    purchasedItems: [],
    exclusiveOffersReceived: []
  },
  {
    userId: 'usr-natasha',
    userEmail: 'natasha.m@voguein.com',
    userName: 'Natasha Mehta',
    userPhone: '+91 99300 77112',
    lastActiveAt: Date.now() - 1000 * 60 * 95,
    totalSpentINR: 84000,
    intentCategory: 'High Intent',
    aiBehavioralInsight: 'Jewelry collector. Recently spent 6 minutes inspecting the Sapphire Pendant Necklace and Satin Skirt.',
    viewedItems: [
      {
        productId: 'LX-JW-003',
        productName: 'Sapphire Solitaire Pendant',
        category: 'Jewelry',
        price: 84000,
        viewedAt: Date.now() - 1000 * 60 * 95,
        count: 5,
        imageUrl: 'https://images.unsplash.com/photo-1599643477877-530eb83abc8e?q=80&w=1000&auto=format&fit=crop',
        sku: 'LX-JW-003'
      },
      {
        productId: 'LX-WD-004',
        productName: 'Champagne Satin Evening Skirt',
        category: 'Wardrobe',
        price: 78000,
        viewedAt: Date.now() - 1000 * 60 * 140,
        count: 3,
        imageUrl: 'https://images.unsplash.com/photo-1583496661160-fb5886a0aaaa?q=80&w=1000&auto=format&fit=crop',
        sku: 'LX-WD-004'
      }
    ],
    purchasedItems: [
      {
        productId: 'LX-JW-003',
        productName: 'Sapphire Solitaire Pendant',
        category: 'Jewelry',
        price: 84000,
        purchasedAt: Date.now() - 1000 * 60 * 60 * 48,
        quantity: 1,
        orderId: 'ord-100',
        orderNumber: 'LUX-8930',
        imageUrl: 'https://images.unsplash.com/photo-1599643477877-530eb83abc8e?q=80&w=1000&auto=format&fit=crop',
        sku: 'LX-JW-003'
      }
    ],
    exclusiveOffersReceived: []
  },
  {
    userId: 'usr-rohan',
    userEmail: 'rohan.singhal@capital.in',
    userName: 'Rohan Singhal',
    userPhone: '+91 97110 33921',
    lastActiveAt: Date.now() - 1000 * 60 * 60 * 4,
    totalSpentINR: 0,
    intentCategory: 'Window Shopper',
    aiBehavioralInsight: 'Browsing artisanal footwear. Has viewed Suede Loafers 3 times.',
    viewedItems: [
      {
        productId: 'LX-SH-002',
        productName: 'Italian Suede Penny Loafers',
        category: 'Footwear',
        price: 54000,
        viewedAt: Date.now() - 1000 * 60 * 60 * 4,
        count: 3,
        imageUrl: 'https://images.unsplash.com/photo-1614252369475-531eba835eb1?q=80&w=1000&auto=format&fit=crop',
        sku: 'LX-SH-002'
      }
    ],
    purchasedItems: [],
    exclusiveOffersReceived: []
  }
];

export const MerchantProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { addLog } = useAudit();
  
  const [catalog, setCatalog] = useState<Product[]>(() => {
    try {
      localStorage.removeItem('luxora_merchant_catalog');
      const saved = localStorage.getItem('luxora_merchant_catalog_v66');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length >= PRODUCTS.length) {
          return parsed;
        }
      }
      return PRODUCTS;
    } catch {
      return PRODUCTS;
    }
  });

  const [rawBatches, setRawBatches] = useState<RawCatalogBatch[]>([]);
  const [agentStats, setAgentStats] = useState<AgentPerformanceStats>(() => {
    try {
      const saved = localStorage.getItem('luxora_agent_stats');
      return saved ? JSON.parse(saved) : INITIAL_STATS;
    } catch {
      return INITIAL_STATS;
    }
  });

  const [orders, setOrders] = useState<MerchantOrder[]>(() => {
    try {
      const saved = localStorage.getItem('luxora_merchant_orders');
      return saved ? JSON.parse(saved) : INITIAL_ORDERS;
    } catch {
      return INITIAL_ORDERS;
    }
  });

  const [campaigns, setCampaigns] = useState<GrowthCampaign[]>(() => {
    try {
      const saved = localStorage.getItem('luxora_merchant_campaigns');
      return saved ? JSON.parse(saved) : INITIAL_CAMPAIGNS;
    } catch {
      return INITIAL_CAMPAIGNS;
    }
  });

  const [userActivities, setUserActivities] = useState<UserActivityRecord[]>(() => {
    try {
      const saved = localStorage.getItem('luxora_user_activities');
      return saved ? JSON.parse(saved) : INITIAL_USER_ACTIVITIES;
    } catch {
      return INITIAL_USER_ACTIVITIES;
    }
  });

  // Deactivated promo codes tracking (synced to localStorage)
  const [deactivatedPromoCodes, setDeactivatedPromoCodes] = useState<string[]>(() => {
    try {
      const saved = localStorage.getItem('luxora_deactivated_coupons');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  useEffect(() => {
    try {
      localStorage.setItem('luxora_deactivated_coupons', JSON.stringify(deactivatedPromoCodes));
    } catch (e) {
      console.error(e);
    }
  }, [deactivatedPromoCodes]);


  // Graceful failure simulators
  const [isSimulatedPriceChangeActive, setSimulatedPriceChangeActive] = useState(false);
  const [isSimulatedOutOfStockActive, setSimulatedOutOfStockActive] = useState(false);

  // AI Governance & Guardrail Policy (Explainable, Bounded, Gated)
  const [guardrailPolicy, setGuardrailPolicy] = useState<GuardrailPolicy>(() => {
    try {
      const saved = localStorage.getItem('luxora_guardrail_policy');
      if (saved) {
        return {
          maxSpendCapINR: 50000,
          maxDiscountPercent: 15,
          requireHumanGateAboveCap: true,
          enforceBoundedChecks: true,
          autoHoldOnBreach: true,
          ...JSON.parse(saved)
        };
      }
    } catch (e) {
      console.error(e);
    }
    return {
      maxSpendCapINR: 50000,
      maxDiscountPercent: 15,
      requireHumanGateAboveCap: true,
      enforceBoundedChecks: true,
      autoHoldOnBreach: true,
    };
  });

  // Automatically synchronize and persist catalog changes across browser sessions & buyer storefront
  useEffect(() => {
    try {
      localStorage.setItem('luxora_merchant_catalog_v66', JSON.stringify(catalog));
    } catch (e) {
      console.error(e);
    }
  }, [catalog]);

  const updateGuardrailPolicy = (policy: Partial<GuardrailPolicy>) => {
    setGuardrailPolicy(prev => {
      const updated = { ...prev, ...policy };
      try {
        localStorage.setItem('luxora_guardrail_policy', JSON.stringify(updated));
      } catch (e) {
        console.error(e);
      }
      addLog(
        'GUARDRAIL',
        'Merchant Guardrail Policy Updated',
        `Autonomous Spend Cap: ₹${updated.maxSpendCapINR.toLocaleString('en-IN')} | Max AI Discount: ${updated.maxDiscountPercent}% | Human Gating: ${updated.requireHumanGateAboveCap ? 'Enforced' : 'Relaxed'}`,
        'info',
        { policy: updated }
      );
      return updated;
    });
  };

  useEffect(() => {
    try {
      localStorage.setItem('luxora_user_activities', JSON.stringify(userActivities));
    } catch (e) {
      console.error(e);
    }
  }, [userActivities]);

  // User Activity Tracking: Logs when a patron views or inspects a product
  const trackProductView = (
    product: Product, 
    userOverride?: { email?: string; name?: string; id?: string }
  ) => {
    const targetEmail = userOverride?.email || 'sharma.shivangiz105@gmail.com';
    const targetName = userOverride?.name || 'Shivangi Sharma';
    const targetId = userOverride?.id || `usr-${targetEmail.replace(/[^a-zA-Z0-9]/g, '')}`;

    setUserActivities(prev => {
      const existingUserIndex = prev.findIndex(
        u => u.userEmail.toLowerCase() === targetEmail.toLowerCase() || u.userId === targetId
      );

      const viewedItem: UserViewedItem = {
        productId: product.id,
        productName: product.name,
        category: product.category || 'Wardrobe',
        price: product.price,
        viewedAt: Date.now(),
        count: 1,
        imageUrl: product.imageUrl,
        sku: product.sku || product.id
      };

      if (existingUserIndex >= 0) {
        const user = { ...prev[existingUserIndex] };
        const existingViewIndex = user.viewedItems.findIndex(i => i.productId === product.id);

        let updatedViews: UserViewedItem[];
        if (existingViewIndex >= 0) {
          const item = user.viewedItems[existingViewIndex];
          const updatedItem = {
            ...item,
            count: item.count + 1,
            viewedAt: Date.now(),
            price: product.price
          };
          updatedViews = [
            updatedItem,
            ...user.viewedItems.filter((_, idx) => idx !== existingViewIndex)
          ];
        } else {
          updatedViews = [viewedItem, ...user.viewedItems];
        }

        // Compute updated intent category
        const totalViews = updatedViews.reduce((acc, v) => acc + v.count, 0);
        let intent: UserActivityRecord['intentCategory'] = user.intentCategory;
        if (user.totalSpentINR >= 100000) {
          intent = 'VIP Customer';
        } else if (totalViews >= 4 || updatedViews.some(v => v.count >= 3)) {
          intent = 'High Intent';
        } else if (user.purchasedItems.length === 0 && totalViews <= 2) {
          intent = 'Window Shopper';
        }

        user.viewedItems = updatedViews;
        user.lastActiveAt = Date.now();
        user.intentCategory = intent;

        const copy = [...prev];
        copy[existingUserIndex] = user;
        return copy;
      } else {
        // Create new tracked user
        const newUser: UserActivityRecord = {
          userId: targetId,
          userEmail: targetEmail,
          userName: targetName,
          lastActiveAt: Date.now(),
          totalSpentINR: 0,
          intentCategory: 'High Intent',
          viewedItems: [viewedItem],
          purchasedItems: [],
          exclusiveOffersReceived: [],
          aiBehavioralInsight: `New patron exploring ${product.category} collection. High initial curiosity for ${product.name}.`
        };
        return [newUser, ...prev];
      }
    });
  };

  // User Activity Tracking: Logs when a patron completes a purchase
  const trackProductPurchase = (order: MerchantOrder) => {
    setUserActivities(prev => {
      const existingUserIndex = prev.findIndex(
        u => u.userEmail.toLowerCase() === order.buyerEmail.toLowerCase()
      );

      const newPurchases: UserPurchasedItem[] = order.items.map(item => ({
        productId: item.productId,
        productName: item.productName,
        category: 'Wardrobe',
        price: item.priceINR,
        purchasedAt: order.createdAt || Date.now(),
        quantity: item.quantity,
        orderId: order.id,
        orderNumber: order.orderNumber,
        imageUrl: item.imageUrl,
        sku: item.productId
      }));

      if (existingUserIndex >= 0) {
        const user = { ...prev[existingUserIndex] };
        user.purchasedItems = [...newPurchases, ...user.purchasedItems];
        user.totalSpentINR += order.totalINR;
        user.lastActiveAt = Date.now();
        user.intentCategory = user.totalSpentINR >= 100000 ? 'VIP Customer' : 'High Intent';
        user.aiBehavioralInsight = `VIP client with ₹${user.totalSpentINR.toLocaleString('en-IN')} lifetime value. High affinity for bespoke ${user.purchasedItems[0]?.productName || 'couture'}.`;

        const copy = [...prev];
        copy[existingUserIndex] = user;
        return copy;
      } else {
        const newUser: UserActivityRecord = {
          userId: `usr-${order.buyerEmail.replace(/[^a-zA-Z0-9]/g, '')}`,
          userEmail: order.buyerEmail,
          userName: order.buyerName,
          userPhone: order.buyerPhone,
          lastActiveAt: Date.now(),
          totalSpentINR: order.totalINR,
          intentCategory: order.totalINR >= 100000 ? 'VIP Customer' : 'High Intent',
          viewedItems: [],
          purchasedItems: newPurchases,
          exclusiveOffersReceived: [],
          aiBehavioralInsight: `Converted patron with initial order #${order.orderNumber} (₹${order.totalINR.toLocaleString('en-IN')}).`
        };
        return [newUser, ...prev];
      }
    });
  };

  // Exclusive Offers Campaign Creator tailored specifically for a selected user based on history
  const createExclusiveOfferCampaign = (
    targetUserId: string, 
    offer: {
      title: string;
      discountPercent: number;
      promoCode: string;
      targetProductIds?: string[];
      emailSubject: string;
      emailBody: string;
      customNote?: string;
    }
  ): GrowthCampaign => {
    const targetUser = userActivities.find(u => u.userId === targetUserId || u.userEmail === targetUserId);
    const patronName = targetUser?.userName || 'VIP Patron';
    const patronEmail = targetUser?.userEmail || 'Client';

    const targetedProducts = catalog.filter(p => offer.targetProductIds?.includes(p.id));

    const newCampaign: GrowthCampaign = {
      id: `camp-exclusive-${Date.now()}`,
      title: offer.title,
      opportunity: `Exclusive 1-on-1 personalized offer created for ${patronName} based on browsing & purchase history.`,
      opportunityType: targetUser?.purchasedItems && targetUser.purchasedItems.length > 0 ? 'VIP Retention' : 'Cart Recovery',
      targetAudience: `Exclusive Direct: ${patronName} (${patronEmail})`,
      recipientCount: 1,
      projectedRevenueINR: targetedProducts.reduce((sum, p) => sum + p.price, 0) || (targetUser?.viewedItems[0]?.price || 120000),
      discountPercent: offer.discountPercent,
      promoCode: offer.promoCode.toUpperCase().trim(),
      bannerAnnouncement: `🌟 Exclusive Private Offer for ${patronName}: Use ${offer.promoCode.toUpperCase().trim()} for ${offer.discountPercent}% off your curated pieces.`,
      emailSubject: offer.emailSubject,
      emailPreview: `A private invitation and ${offer.discountPercent}% personal privilege for ${patronName}...`,
      emailBody: offer.emailBody,
      status: 'launched',
      tags: ['Exclusive Offer', '1-on-1 Personalized', 'VIP Direct', targetUser?.intentCategory || 'High Intent'],
      products: targetedProducts,
      productIds: offer.targetProductIds || [],
      createdAt: Date.now(),
      launchedAt: Date.now()
    };

    // 1. Add to active campaigns list
    setCampaigns(prev => [newCampaign, ...prev]);
    saveCampaignToFirestore(newCampaign);

    // 2. Update user's received exclusive offers record
    setUserActivities(prev => prev.map(u => {
      if (u.userId === targetUserId || u.userEmail === targetUserId) {
        return {
          ...u,
          exclusiveOffersReceived: [
            {
              campaignId: newCampaign.id,
              title: newCampaign.title,
              discountPercent: offer.discountPercent,
              promoCode: offer.promoCode.toUpperCase().trim(),
              sentAt: Date.now(),
              status: 'Sent'
            },
            ...u.exclusiveOffersReceived
          ]
        };
      }
      return u;
    }));

    // 3. Log into Audit Context
    addLog(
      'CAMPAIGN',
      `Exclusive Offer Campaign Dispatched: ${patronName}`,
      `Created 1-on-1 bespoke campaign "${offer.title}" with ${offer.discountPercent}% discount (Code: ${offer.promoCode.toUpperCase().trim()}) targeted at ${patronEmail}.`,
      'success',
      {
        recipient: patronName,
        email: patronEmail,
        promoCode: offer.promoCode,
        discountPercent: offer.discountPercent,
        targetedProducts: targetedProducts.map(p => p.name)
      }
    );

    return newCampaign;
  };


  useEffect(() => {
    try {
      localStorage.setItem('luxora_agent_stats', JSON.stringify(agentStats));
    } catch (e) {
      console.error(e);
    }
  }, [agentStats]);

  useEffect(() => {
    try {
      localStorage.setItem('luxora_merchant_orders', JSON.stringify(orders));
    } catch (e) {
      console.error(e);
    }
  }, [orders]);

  useEffect(() => {
    try {
      localStorage.setItem('luxora_merchant_campaigns', JSON.stringify(campaigns));
    } catch (e) {
      console.error(e);
    }
  }, [campaigns]);

  // Derive active launched campaigns for buyer store synchronization
  const activeCampaigns = campaigns.filter(c => 
    c.status === 'launched' && 
    (!c.promoCode || !deactivatedPromoCodes.some(dc => dc.toUpperCase() === c.promoCode?.toUpperCase()))
  );
  const activeCampaignBanner = activeCampaigns.find(c => c.bannerAnnouncement)?.bannerAnnouncement || null;
  const activePromoDiscount = activeCampaigns.reduce((max, c) => Math.max(max, c.discountPercent || 0), 0);

  // Catalog batch ingestion
  const addRawBatch = async (name: string, rawText: string): Promise<RawCatalogBatch> => {
    addLog('CATALOG', 'Raw Catalog File Uploaded', `File "${name}" submitted for AI validation.`, 'info');
    
    let parsedCount = 3;
    let readiness = 65;
    let issues = [
      'Missing micron grade and fabric weight specs',
      'Missing European haute couture sizing brackets (FR 34-42)',
      'Missing quiet-luxury silhouette styling reasons'
    ];

    try {
      const res = await fetch('/api/catalog/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ rawData: rawText, fileName: name })
      });
      if (res.ok) {
        const data = await res.json();
        if (data.isWrongType) {
          addLog('FAILURE', 'Wrong File Detected', data.message, 'warning');
        } else {
          parsedCount = data.totalParsed || 3;
          readiness = data.readinessScore || 68;
          issues = data.issues || issues;
        }
      }
    } catch (err) {
      console.warn('Backend analyze fallback active:', err);
    }

    const newBatch: RawCatalogBatch = {
      id: `batch-${Date.now()}`,
      name,
      uploadedAt: Date.now(),
      totalParsed: parsedCount,
      validCount: parsedCount > 1 ? parsedCount - 1 : 1,
      missingFieldsCount: issues.length,
      readinessScore: readiness,
      issues,
      products: [
        {
          name: 'Hand-Pleated Silk Georgette Blouse',
          category: 'ready-to-wear',
          designer: 'Atelier Khaire',
          price: 1100,
          description: 'Sculptural knife-pleat blouse with raglan sleeves and mother-of-pearl buttons.',
        },
        {
          name: 'Bespoke Flannel Tailored Trench',
          category: 'outerwear',
          designer: 'Maison Aurelia',
          price: 3100,
          description: 'Double-breasted virgin wool flannel trench with storm flap and horn buckles.',
        }
      ],
      isEnriched: false,
      status: 'ready_for_ai'
    };

    setRawBatches(prev => [newBatch, ...prev]);
    saveCatalogBatchToFirestore(newBatch.id, newBatch);
    return newBatch;
  };

  const fixBatchWithAi = async (batchId: string) => {
    const batch = rawBatches.find(b => b.id === batchId);
    if (!batch) return;

    addLog('CATALOG', 'AI Enriched Missing Attributes', `AI generated luxury fabric specs, care instructions, and quiet-luxury styling tags for batch "${batch.name}".`, 'info');

    const updated = rawBatches.map(b => {
      if (b.id === batchId) {
        return {
          ...b,
          isEnriched: true,
          readinessScore: 99,
          issues: [],
          missingFieldsCount: 0,
          status: 'enriched' as const,
        };
      }
      return b;
    });
    setRawBatches(updated);
  };

  const syncBatchToAgent = (batchId: string) => {
    const batch = rawBatches.find(b => b.id === batchId);
    if (!batch) return;

    const newProducts: Product[] = [
      {
        id: `lux-batch-${Date.now()}-1`,
        sku: 'LUX-TOP-09',
        name: 'Hand-Pleated Silk Georgette Blouse',
        brand: 'Atelier Khaire',
        designer: 'Atelier Khaire',
        category: 'Tailoring',
        occasion: 'Formal',
        color: 'Opal White',
        price: 95000,
        currency: 'INR',
        stock: 8,
        availability: 'In Stock',
        imageUrl: 'https://images.unsplash.com/photo-1502716119720-b23a93e5fe1b?auto=format&fit=crop&w=1200&q=85',
        images: [
          'https://images.unsplash.com/photo-1502716119720-b23a93e5fe1b?auto=format&fit=crop&w=1200&q=85',
          'https://images.unsplash.com/photo-1485968579580-b6d095142e6e?auto=format&fit=crop&w=1200&q=85'
        ],
        description: 'Sculptural knife-pleat blouse with raglan sleeves and mother-of-pearl buttons. Tailored from 28mm pure Lyon silk georgette.',
        details: ['Hand-pleated raglan construction', 'Mother-of-pearl buttons', 'French interior seams'],
        composition: '100% Mulberry Silk (28mm)',
        origin: 'Lyon, France',
        care: 'Dry clean only with specialist silk care',
        colors: [
          { name: 'Opal White', hex: '#F4F2EB' },
          { name: 'Noir Satin', hex: '#121214' }
        ],
        sizes: ['FR 34 (US 0)', 'FR 36 (US 2)', 'FR 38 (US 4)', 'FR 40 (US 6)'],
        fit: 'Fluid relaxed drape with graceful motion.',
        isNewArrival: true,
        season: 'SS26 Editorial Collection',
        aiReadinessScore: 100,
        whyThisReason: 'Fluid micro-pleats create optical movement while maintaining effortless workplace restraint.',
        upsellProductId: 'lux-01',
        crossSellProductIds: ['lux-08']
      }
    ];

    setCatalog(prev => [...newProducts, ...prev]);
    setRawBatches(prev => prev.map(b => b.id === batchId ? { ...b, status: 'synced_to_agent' } : b));
    setAgentStats(prev => ({
      ...prev,
      catalogItemsManaged: prev.catalogItemsManaged + newProducts.length
    }));

    addLog(
      'CATALOG', 
      'Catalog Synced to LUXORA AI Agent & Buyer Store', 
      `Enriched products from batch "${batch.name}" are now live in the Buyer Catalog & AI Stylist.`, 
      'success'
    );
  };

  const updateProductStock = (productId: string, newStock: number) => {
    const validStock = Math.max(0, Math.round(newStock));
    setCatalog(prev => prev.map(p => {
      if (p.id === productId || p.sku === productId) {
        return { ...p, stock: validStock, availability: validStock === 0 ? 'Out of Stock' : 'In Stock' };
      }
      return p;
    }));

    const prod = catalog.find(p => p.id === productId || p.sku === productId);
    addLog(
      'INVENTORY',
      `Inventory Stock Updated: ${prod?.name || productId}`,
      `Stock adjusted to ${validStock} unit(s). Storefront updated in real-time.`,
      validStock === 0 ? 'warning' : 'info'
    );
  };

  const updateProduct = (productId: string, updates: Partial<Product>) => {
    setCatalog(prev => prev.map(p => {
      if (p.id === productId || p.sku === productId) {
        const updated = { ...p, ...updates };
        if (typeof updates.stock === 'number') {
          updated.availability = updates.stock === 0 ? 'Out of Stock' : 'In Stock';
        }
        return updated;
      }
      return p;
    }));

    const prod = catalog.find(p => p.id === productId || p.sku === productId);
    addLog(
      'CATALOG',
      `Product Updated: ${prod?.name || productId}`,
      `Modifications synchronized with Buyer Storefront.`,
      'info',
      { updates }
    );
  };

  const addProduct = (newProduct: Product) => {
    setCatalog(prev => [newProduct, ...prev]);
    setAgentStats(prev => ({
      ...prev,
      catalogItemsManaged: prev.catalogItemsManaged + 1
    }));
    addLog(
      'CATALOG',
      `New Piece Added to Catalog: ${newProduct.name}`,
      `Item ${newProduct.sku || newProduct.id} added with price ₹${(newProduct.price || 0).toLocaleString('en-IN')}, stock: ${newProduct.stock ?? 10}. Live in buyer catalog.`,
      'success'
    );
  };

  const deleteProduct = (productId: string) => {
    const prod = catalog.find(p => p.id === productId || p.sku === productId);
    setCatalog(prev => prev.filter(p => p.id !== productId && p.sku !== productId));
    addLog(
      'CATALOG',
      `Product Removed: ${prod?.name || productId}`,
      `Removed from live buyer storefront.`,
      'warning'
    );
  };

  const resetCatalogToDefault = () => {
    setCatalog(PRODUCTS);
    localStorage.removeItem('luxora_merchant_catalog_v66');
    addLog('CATALOG', 'Catalog Reset to Factory Default', 'Restored original SS26 curated collection.', 'info');
  };

  const toggleProductOutOfStock = (productId: string) => {
    const prod = catalog.find(p => p.id === productId || p.sku === productId);
    if (!prod) return;
    const isCurrentlyZero = (prod.stock || 0) <= 0;
    const newStock = isCurrentlyZero ? 10 : 0;
    updateProductStock(productId, newStock);
  };

  // Agent Performance Analytics
  const recordUpsellEvent = (accepted: boolean, revenueINR: number, productName: string) => {
    setAgentStats(prev => ({
      ...prev,
      upsellShown: prev.upsellShown + 1,
      upsellAccepted: accepted ? prev.upsellAccepted + 1 : prev.upsellAccepted,
      upsellRejected: !accepted ? prev.upsellRejected + 1 : prev.upsellRejected,
      upsellRevenueINR: accepted ? prev.upsellRevenueINR + revenueINR : prev.upsellRevenueINR,
    }));

    addLog(
      'UPSELL',
      accepted ? 'AI Upsell Accepted by Buyer' : 'AI Upsell Dismissed by Buyer',
      `${accepted ? 'Buyer accepted luxury upgrade to' : 'Buyer declined upgrade for'} ${productName} (Impact: ₹${revenueINR.toLocaleString('en-IN')}).`,
      accepted ? 'success' : 'info'
    );
  };

  const recordCrossSellEvent = (accepted: boolean, revenueINR: number, productName: string) => {
    setAgentStats(prev => ({
      ...prev,
      crossSellShown: prev.crossSellShown + 1,
      crossSellAccepted: accepted ? prev.crossSellAccepted + 1 : prev.crossSellAccepted,
      crossSellRejected: !accepted ? prev.crossSellRejected + 1 : prev.crossSellRejected,
      crossSellRevenueINR: accepted ? prev.crossSellRevenueINR + revenueINR : prev.crossSellRevenueINR,
    }));

    addLog(
      'CROSS_SELL',
      accepted ? 'AI Cross-Sell Added to Bag' : 'AI Cross-Sell Dismissed',
      `${accepted ? 'Buyer added complementary ensemble piece' : 'Buyer passed on'} ${productName} (Value: ₹${revenueINR.toLocaleString('en-IN')}).`,
      accepted ? 'success' : 'info'
    );
  };

  const recordSearchQuery = (query: string) => {
    setAgentStats(prev => ({ ...prev, totalSearchQueries: prev.totalSearchQueries + 1 }));
    addLog('AI_SEARCH', 'Natural Language Search Query', `Client query: "${query}" analyzed by LUXORA AI reasoning engine.`, 'info');
  };

  // Orders: Synchronizes real transactions from Buyer Portal to Business Workspace with full details
  const createOrder = (orderData: Omit<MerchantOrder, 'id' | 'orderNumber' | 'createdAt'>): MerchantOrder => {
    const newOrder: MerchantOrder = {
      ...orderData,
      id: `ord-${Date.now()}`,
      orderNumber: `LUX-${Math.floor(1000 + Math.random() * 9000)}`,
      createdAt: Date.now(),
    };

    setOrders(prev => [newOrder, ...prev]);
    saveOrderToFirestore(newOrder);

    // Update real-time business telemetry
    setAgentStats(prev => ({
      ...prev,
      totalRevenueINR: prev.totalRevenueINR + newOrder.totalINR,
      totalOrders: prev.totalOrders + 1,
      aiInfluencedRevenueINR: (newOrder.includesUpsell || newOrder.includesCrossSell) 
        ? prev.aiInfluencedRevenueINR + newOrder.totalINR 
        : prev.aiInfluencedRevenueINR
    }));

    const itemsSummary = newOrder.items.map(i => `${i.productName} (x${i.quantity}) ₹${(i.priceINR * i.quantity).toLocaleString('en-IN')}`).join(', ');

    // Automatically update User Activity Tracker for this buyer
    trackProductPurchase(newOrder);

    addLog(
      'ORDER', 
      `New Buyer Order Confirmed #${newOrder.orderNumber}`, 
      `Patron ${newOrder.buyerName} (${newOrder.buyerEmail}) purchased: ${itemsSummary} totaling ₹${newOrder.totalINR.toLocaleString('en-IN')} via ${newOrder.paymentMethod}.`, 
      'success',
      { 
        orderNumber: newOrder.orderNumber, 
        total: newOrder.totalINR, 
        buyer: newOrder.buyerName, 
        email: newOrder.buyerEmail, 
        phone: newOrder.buyerPhone,
        itemsCount: newOrder.items.length 
      }
    );
    return newOrder;
  };


  // Custom campaign addition by Merchant or AI Bot
  const addCustomCampaign = (campaignData: Omit<GrowthCampaign, 'id' | 'createdAt'>): GrowthCampaign => {
    const newCamp: GrowthCampaign = {
      ...campaignData,
      id: `camp-auto-${Date.now()}`,
      createdAt: Date.now(),
      status: campaignData.status || 'launched',
      launchedAt: Date.now(),
    };

    setCampaigns(prev => [newCamp, ...prev]);
    saveCampaignToFirestore(newCamp);

    addLog(
      'CAMPAIGN',
      `New Growth Campaign Launched: ${newCamp.title}`,
      `Campaign active across storefront. Target: ${newCamp.targetAudience}, Projected: ₹${newCamp.projectedRevenueINR.toLocaleString('en-IN')}, Discount: ${newCamp.discountPercent || 0}%.`,
      'success'
    );
    return newCamp;
  };

  // Campaigns
  const approveCampaign = (id: string) => {
    setCampaigns(prev => prev.map(c => {
      if (c.id === id) {
        const updated = { ...c, status: 'approved' as const };
        saveCampaignToFirestore(updated);
        return updated;
      }
      return c;
    }));
    const camp = campaigns.find(c => c.id === id);
    addLog('CAMPAIGN', 'Campaign Approved by Merchant', `Growth campaign "${camp?.title}" approved for execution.`, 'success');
  };

  const dismissCampaign = (id: string) => {
    setCampaigns(prev => prev.map(c => c.id === id ? { ...c, status: 'dismissed' } : c));
    const camp = campaigns.find(c => c.id === id);
    addLog('CAMPAIGN', 'Campaign Dismissed', `Campaign "${camp?.title}" dismissed by merchant.`, 'info');
  };

  const launchCampaign = (id: string) => {
    setCampaigns(prev => prev.map(c => {
      if (c.id === id) {
        const updated = { ...c, status: 'launched' as const, launchedAt: Date.now() };
        saveCampaignToFirestore(updated);
        return updated;
      }
      return c;
    }));
    const camp = campaigns.find(c => c.id === id);
    addLog(
      'CAMPAIGN', 
      'Email Campaign Launched to VIP Segment', 
      `Dispatched "${camp?.emailSubject}" to ${camp?.recipientCount} VIP patrons. Projected Revenue: ₹${camp?.projectedRevenueINR.toLocaleString('en-IN')}.`, 
      'success'
    );
  };

  const refreshAiCampaigns = async () => {
    try {
      const res = await fetch('/api/campaigns/generate', { method: 'POST' });
      if (res.ok) {
        const data = await res.json();
        if (data.campaigns) {
          setCampaigns(data.campaigns);
          addLog('CAMPAIGN', 'New AI Growth Opportunities Scanned', `AI generated ${data.campaigns.length} fresh growth campaigns.`, 'info');
        }
      }
    } catch (e) {
      console.warn(e);
    }
  };

  // AI Copilot Dynamic Coupon Controls: Real-time synchronization across Merchant & Buyer store
  const setCouponActive = (
    promoCode: string,
    discountPercent: number,
    options?: { title?: string; bannerAnnouncement?: string }
  ): GrowthCampaign => {
    const cleanCode = promoCode.trim().toUpperCase();

    // 1. Remove from deactivated list if previously deactivated
    setDeactivatedPromoCodes(prev => prev.filter(c => c.toUpperCase() !== cleanCode));

    // 2. Check if a campaign with this code already exists
    const existingIndex = campaigns.findIndex(
      c => c.promoCode && c.promoCode.toUpperCase() === cleanCode
    );

    if (existingIndex >= 0) {
      const updatedCampaign: GrowthCampaign = {
        ...campaigns[existingIndex],
        status: 'launched',
        discountPercent,
        launchedAt: Date.now(),
        bannerAnnouncement: options?.bannerAnnouncement || `Exclusive Privilege: ${discountPercent}% off with code ${cleanCode}`,
        title: options?.title || campaigns[existingIndex].title,
      };

      setCampaigns(prev => {
        const copy = [...prev];
        copy[existingIndex] = updatedCampaign;
        return copy;
      });

      saveCampaignToFirestore(updatedCampaign);

      addLog(
        'CAMPAIGN',
        `Coupon Activated: ${cleanCode} (${discountPercent}% OFF)`,
        `Promo code "${cleanCode}" activated via LUXORA AI Copilot. Live on Buyer Storefront, Marquee, and Checkout.`,
        'success',
        { promoCode: cleanCode, discountPercent }
      );

      return updatedCampaign;
    } else {
      // 3. Create fresh campaign
      const newCamp: GrowthCampaign = {
        id: `camp-${cleanCode.toLowerCase()}-${Date.now()}`,
        title: options?.title || `${cleanCode} Atelier Privilege Campaign`,
        opportunity: 'Autonomous coupon configuration via LUXORA AI Copilot',
        opportunityType: 'Seasonal Promotion',
        targetAudience: 'All Storefront & VIP Patrons',
        recipientCount: 350,
        projectedRevenueINR: 520000,
        discountPercent: discountPercent,
        promoCode: cleanCode,
        bannerAnnouncement: options?.bannerAnnouncement || `Exclusive Privilege: ${discountPercent}% off with code ${cleanCode}`,
        emailSubject: `Special Atelier Invitation: ${discountPercent}% off with code ${cleanCode}`,
        emailPreview: `Enjoy ${discountPercent}% private privilege across the collection...`,
        emailBody: `Dear Patron,\n\nWe are pleased to extend a private ${discountPercent}% atelier privilege with code ${cleanCode}.\n\nWarm regards,\nLUXORA Atelier`,
        status: 'launched',
        tags: ['AI-Copilot', 'Live-Storefront', 'Active-Coupon'],
        products: [],
        productIds: [],
        createdAt: Date.now(),
        launchedAt: Date.now(),
      };

      setCampaigns(prev => [newCamp, ...prev]);
      saveCampaignToFirestore(newCamp);

      addLog(
        'CAMPAIGN',
        `New Coupon Created & Activated: ${cleanCode} (${discountPercent}% OFF)`,
        `Promo code "${cleanCode}" deployed to live storefront. Applicable at BagDrawer checkout.`,
        'success',
        { promoCode: cleanCode, discountPercent }
      );

      return newCamp;
    }
  };

  const deactivateCoupon = (promoCode: string): boolean => {
    const cleanCode = promoCode.trim().toUpperCase();

    // 1. Add to deactivated list
    setDeactivatedPromoCodes(prev => {
      if (prev.some(c => c.toUpperCase() === cleanCode)) return prev;
      return [...prev, cleanCode];
    });

    // 2. Set any matching campaigns to 'dismissed'
    setCampaigns(prev => prev.map(c => {
      if (c.promoCode && c.promoCode.toUpperCase() === cleanCode) {
        const updated = { ...c, status: 'dismissed' as const };
        saveCampaignToFirestore(updated);
        return updated;
      }
      return c;
    }));

    addLog(
      'CAMPAIGN',
      `Coupon Deactivated: ${cleanCode}`,
      `Promo code "${cleanCode}" deactivated via LUXORA AI Copilot. Removed from storefront & disabled at checkout.`,
      'warning',
      { promoCode: cleanCode }
    );

    return true;
  };

  const isCouponActive = (promoCode: string): boolean => {
    const cleanCode = promoCode.trim().toUpperCase();
    if (deactivatedPromoCodes.some(c => c.toUpperCase() === cleanCode)) return false;
    return activeCampaigns.some(c => c.promoCode && c.promoCode.toUpperCase() === cleanCode);
  };

  return (
    <MerchantContext.Provider
      value={{
        catalog,
        rawBatches,
        agentStats,
        orders,
        campaigns,
        activeCampaigns,
        activeCampaignBanner,
        activePromoDiscount,
        userActivities,
        isSimulatedPriceChangeActive,
        isSimulatedOutOfStockActive,
        setSimulatedPriceChangeActive,
        setSimulatedOutOfStockActive,
        guardrailPolicy,
        updateGuardrailPolicy,
        addRawBatch,
        fixBatchWithAi,
        syncBatchToAgent,
        updateProduct,
        addProduct,
        deleteProduct,
        resetCatalogToDefault,
        updateProductStock,
        toggleProductOutOfStock,
        recordUpsellEvent,
        recordCrossSellEvent,
        recordSearchQuery,
        createOrder,
        trackProductView,
        trackProductPurchase,
        createExclusiveOfferCampaign,
        addCustomCampaign,
        approveCampaign,
        dismissCampaign,
        launchCampaign,
        refreshAiCampaigns,
        deactivatedPromoCodes,
        setCouponActive,
        deactivateCoupon,
        isCouponActive,
      }}
    >
      {children}
    </MerchantContext.Provider>
  );

};

export const useMerchant = () => {
  const context = useContext(MerchantContext);
  if (!context) {
    throw new Error('useMerchant must be used within a MerchantProvider');
  }
  return context;
};
