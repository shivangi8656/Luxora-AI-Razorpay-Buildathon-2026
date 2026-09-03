import React, { useState, useRef, useEffect } from 'react';
import { 
  Store, 
  Upload, 
  Sparkles, 
  TrendingUp, 
  Mail, 
  FileSpreadsheet, 
  CheckCircle, 
  AlertTriangle, 
  Clock, 
  RefreshCw, 
  Check, 
  X, 
  Plus, 
  Search, 
  ChevronRight, 
  ShieldCheck, 
  DollarSign, 
  Eye, 
  Send,
  Zap,
  Tag,
  Layers,
  ArrowRight,
  ShoppingBag,
  Sliders,
  ChevronDown,
  ExternalLink,
  LogOut,
  Package,
  User as UserIcon,
  Building,
  CheckCircle2,
  AlertCircle,
  Percent,
  Megaphone,
  Truck,
  Square,
  Users,
  Edit3,
  Trash2,
  RotateCcw,
  Filter,
  FileText
} from 'lucide-react';
import { useMerchant } from '../../context/MerchantContext';
import { useAudit } from '../../context/AuditContext';
import { useAuth } from '../../context/AuthContext';
import { GrowthCampaign, RawCatalogBatch, Product } from '../../types';
import { UserActivityTracker } from './UserActivityTracker';

interface MerchantWorkspaceProps {
  onSwitchToBuyerStore?: () => void;
  onOpenAuditTrail: () => void;
  onOpenAuth: () => void;
  onOpenBag: () => void;
  cartCount?: number;
  initialTab?: 'growth' | 'catalog' | 'agent' | 'campaigns' | 'orders' | 'users';
}

export const MerchantWorkspace: React.FC<MerchantWorkspaceProps> = ({
  onSwitchToBuyerStore,
  onOpenAuditTrail,
  onOpenAuth,
  onOpenBag,
  cartCount = 0,
  initialTab = 'agent',
}) => {
  const { 
    catalog,
    rawBatches, 
    agentStats, 
    orders, 
    campaigns, 
    userActivities,
    addRawBatch, 
    fixBatchWithAi, 
    syncBatchToAgent,
    updateProduct,
    addProduct,
    deleteProduct,
    resetCatalogToDefault,
    addCustomCampaign,
    approveCampaign,
    dismissCampaign,
    launchCampaign,
    refreshAiCampaigns,
    updateProductStock,
    toggleProductOutOfStock,
    isSimulatedPriceChangeActive,
    setSimulatedPriceChangeActive,
    isSimulatedOutOfStockActive,
    setSimulatedOutOfStockActive,
    guardrailPolicy,
    updateGuardrailPolicy,
    setCouponActive,
    deactivateCoupon,
    isCouponActive,
    deactivatedPromoCodes
  } = useMerchant();

  const { addLog } = useAudit();
  const { user, handleSignOut } = useAuth();

  const [activeTab, setActiveTab] = useState<'growth' | 'catalog' | 'agent' | 'campaigns' | 'orders' | 'users'>(initialTab);

  
  // Navbar Profile Dropdown
  const [isProfileDropdownOpen, setIsProfileDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsProfileDropdownOpen(false);
      }
    };
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setIsProfileDropdownOpen(false);
        setIsNewCampaignOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, []);

  // Catalog upload state
  const [isUploading, setIsUploading] = useState(false);
  const [rawTextInput, setRawTextInput] = useState('');
  const [selectedBatchId, setSelectedBatchId] = useState<string | null>(null);

  // Strategy Applied State
  const [appliedStrategies, setAppliedStrategies] = useState<Record<string, boolean>>({});

  // Catalog Management Extended State (Search, Filter, Edit Modal, Add Modal, Toast)
  const [catalogSearch, setCatalogSearch] = useState('');
  const [catalogCategoryFilter, setCatalogCategoryFilter] = useState('ALL');
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [isAddProductOpen, setIsAddProductOpen] = useState(false);
  const [syncToastMessage, setSyncToastMessage] = useState<string | null>(null);
  const [deleteConfirmProductId, setDeleteConfirmProductId] = useState<string | null>(null);

  // New Product Form State
  const [newProdName, setNewProdName] = useState('');
  const [newProdSku, setNewProdSku] = useState('');
  const [newProdCategory, setNewProdCategory] = useState<'Dresses' | 'Jewelry' | 'Footwear' | 'Outerwear' | 'Knitwear' | 'Accessories'>('Dresses');
  const [newProdPrice, setNewProdPrice] = useState<number>(95000);
  const [newProdStock, setNewProdStock] = useState<number>(10);
  const [newProdImage, setNewProdImage] = useState('https://images.unsplash.com/photo-1595777457583-95e059d581b8?auto=format&fit=crop&w=800&q=80');
  const [newProdDesc, setNewProdDesc] = useState('');
  const [newProdComposition, setNewProdComposition] = useState('100% Mulberry Silk');

  const triggerSyncToast = (msg: string) => {
    setSyncToastMessage(msg);
    setTimeout(() => setSyncToastMessage(null), 3500);
  };

  const handleSaveProductEdit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingProduct) return;
    updateProduct(editingProduct.id, {
      name: editingProduct.name,
      price: Number(editingProduct.price),
      stock: Number(editingProduct.stock),
      category: editingProduct.category,
      sku: editingProduct.sku,
      description: editingProduct.description,
      composition: editingProduct.composition,
      imageUrl: editingProduct.imageUrl || (editingProduct.images && editingProduct.images[0]) || '',
      images: editingProduct.imageUrl ? [editingProduct.imageUrl] : editingProduct.images
    });
    addLog('PRODUCT_UPDATED', `Merchant updated item ${editingProduct.name} (Price: ₹${Number(editingProduct.price).toLocaleString('en-IN')}, Stock: ${editingProduct.stock})`);
    triggerSyncToast(`Updated "${editingProduct.name}" — Buyer Storefront is immediately updated!`);
    setEditingProduct(null);
  };

  const handleCreateNewProduct = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newProdName.trim()) return;
    const prodId = `LX-CUSTOM-${Date.now().toString().slice(-4)}`;
    const stockCount = Number(newProdStock) || 10;
    const created: Product = {
      id: prodId,
      name: newProdName.trim(),
      sku: newProdSku.trim() || `SKU-${Date.now().toString().slice(-4)}`,
      category: newProdCategory,
      price: Number(newProdPrice) || 50000,
      currency: 'INR',
      stock: stockCount,
      availability: stockCount <= 0 ? 'Out of Stock' : stockCount === 1 ? 'Low Stock' : 'In Stock',
      imageUrl: newProdImage.trim() || 'https://images.unsplash.com/photo-1595777457583-95e059d581b8?auto=format&fit=crop&w=800&q=80',
      images: [newProdImage.trim() || 'https://images.unsplash.com/photo-1595777457583-95e059d581b8?auto=format&fit=crop&w=800&q=80'],
      description: newProdDesc.trim() || 'Hand-finished luxury atelier garment with artisanal tailoring.',
      composition: newProdComposition.trim() || '100% Mulberry Silk',
      brand: 'LUXORA Atelier',
      occasion: 'Evening',
      sizes: ['FR 34 (US 0)', 'FR 36 (US 2)', 'FR 38 (US 4)', 'FR 40 (US 6)'],
      color: 'Noir',
      aiReadinessScore: 98
    };
    addProduct(created);
    addLog('PRODUCT_CREATED', `Merchant added new luxury piece: ${created.name} (₹${created.price.toLocaleString('en-IN')}, Stock: ${created.stock})`);
    triggerSyncToast(`Added "${created.name}" to Live Catalog — now live on Buyer Storefront!`);
    setIsAddProductOpen(false);
    // Reset form
    setNewProdName('');
    setNewProdSku('');
    setNewProdPrice(95000);
    setNewProdStock(10);
    setNewProdDesc('');
  };

  const handleDeleteProduct = (productId: string, productName: string) => {
    deleteProduct(productId);
    addLog('PRODUCT_DELETED', `Merchant removed piece from catalog: ${productName} (ID: ${productId})`);
    triggerSyncToast(`Removed "${productName}" from Live Catalog & Buyer Storefront.`);
    setDeleteConfirmProductId(null);
  };

  const handleResetCatalog = () => {
    if (window.confirm('Reset all catalog items, stock counts, and prices back to original atelier defaults?')) {
      resetCatalogToDefault();
      addLog('CATALOG_RESET', 'Merchant reset the entire catalog to default factory states.');
      triggerSyncToast('Catalog successfully reset to original atelier default items.');
    }
  };

  // Filtered Catalog
  const filteredCatalog = catalog.filter((item) => {
    const matchesSearch = 
      item.name.toLowerCase().includes(catalogSearch.toLowerCase()) ||
      (item.sku && item.sku.toLowerCase().includes(catalogSearch.toLowerCase())) ||
      item.id.toLowerCase().includes(catalogSearch.toLowerCase()) ||
      item.category.toLowerCase().includes(catalogSearch.toLowerCase());
    const matchesCategory = 
      catalogCategoryFilter === 'ALL' || 
      item.category.toLowerCase() === catalogCategoryFilter.toLowerCase();
    return matchesSearch && matchesCategory;
  });

  // New Custom Campaign Modal / Form State
  const [isNewCampaignOpen, setIsNewCampaignOpen] = useState(false);
  const [newCampTitle, setNewCampTitle] = useState('');
  const [newCampAudience, setNewCampAudience] = useState('All High-Intent VIP Patrons');
  const [newCampDiscount, setNewCampDiscount] = useState(15);
  const [newCampPromo, setNewCampPromo] = useState('LUXORAVIP15');
  const [newCampBanner, setNewCampBanner] = useState('Exclusive Privilege: Enjoy 15% off with code LUXORAVIP15');
  const [newCampSubject, setNewCampSubject] = useState('Private Atelier Privilege: Special Curated Invitation');
  const [newCampBody, setNewCampBody] = useState('Dear Patron,\n\nWe are pleased to extend exclusive privileges on our hand-finished garments.\n\nWarm regards,\nLUXORA Atelier');

  // Merchant AI Copilot Chat State
  interface MerchantAgentMessage {
    id: string;
    sender: 'user' | 'agent';
    text: string;
    timestamp: number;
    growthHighlights?: string[];
    lossOrRiskHighlights?: string[];
    actionPlan?: string[];
    suggestedActions?: string[];
    executableAction?: {
      label: string;
      actionType: string;
      campaignTitle?: string;
      discount?: number;
      promoCode?: string;
      bannerAnnouncement?: string;
      targetAudience?: string;
      productId?: string;
      productName?: string;
      stockCount?: number;
      price?: number;
      requiresConfirmation?: boolean;
      confirmationPrompt?: string;
      isExecuted?: boolean;
      isCancelled?: boolean;
    };
  }

  const [merchantMessages, setMerchantMessages] = useState<MerchantAgentMessage[]>([
    {
      id: 'agent-welcome',
      sender: 'agent',
      text: `Bonjour ${user?.displayName || 'Business Executive'}! I am your LUXORA AI Executive Business Intelligence Agent.\n\nI continuously monitor your live telemetry across your entire atelier catalog, cart abandonments, conversion funnels, and customer intent.\n\nAsk me anything about revenue growth, checkout losses, friction points, or how to launch automated recovery campaigns that immediately reflect on the Buyer Storefront.`,
      timestamp: Date.now(),
      growthHighlights: [
        'Eveningwear category up +42.4% following AI capsule styling suggestions',
        'AI Assisted GMV represents 28.8% of total gross revenue (₹32.4 Lakhs)',
        'Average Order Value lifted by 33.2% through automated pairings'
      ],
      lossOrRiskHighlights: [
        'Cart abandonment concentrated in Silk Evening Slips (₹2.98L potential revenue at risk due to lack of sizing clarity)',
        'Out-of-stock bounce rate on Size FR 38 Black Evening Gowns costing ~₹1.85L/week',
        'Checkout drop-off at payment selection step (14.2% rate before Razorpay completion)'
      ],
      actionPlan: [
        '1. Launch automated VIP cart-recovery campaign offering bespoke alteration guarantees.',
        '2. Configure AI Stylist to proactively suggest emerald green and champagne silk alternates when FR 38 is low in stock.',
        '3. Activate 1-click Razorpay Fast-Track checkout with complimentary White Glove insurance.'
      ],
      suggestedActions: [
        'Where is revenue loss occurring, why is it happening, and how can we resolve it?',
        'Why are users dropping off on silk evening dresses?',
        'How to increase AOV by 30% through automated pairings?',
        'Launch VIP Cart Recovery Campaign with 15% discount'
      ],
      executableAction: {
        label: 'Launch Silk Slip VIP Recovery Campaign',
        actionType: 'LAUNCH_CAMPAIGN',
        campaignTitle: 'Silk Slip Evening Recovery (Auto-Triggered)',
        discount: 15,
        promoCode: 'SILKRECOVERY15',
        bannerAnnouncement: 'Limited Atelier Offer: 15% off Silk Slips with code SILKRECOVERY15',
        targetAudience: 'Clients with Silk Slips in cart > 2 hours'
      }
    }
  ]);

  const [merchantInput, setMerchantInput] = useState('');
  const [isMerchantAiLoading, setIsMerchantAiLoading] = useState(false);
  const [pendingAction, setPendingAction] = useState<NonNullable<MerchantAgentMessage['executableAction']> | null>(null);
  const [executedActionIds, setExecutedActionIds] = useState<Record<string, boolean>>({});
  const [deployingActionIds, setDeployingActionIds] = useState<Record<string, boolean>>({});
  const merchantAbortControllerRef = useRef<AbortController | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Auto-scroll chat stream whenever new messages, loading state, or deploying states change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [merchantMessages, isMerchantAiLoading, deployingActionIds]);

  const handleStopMerchantAi = () => {
    if (merchantAbortControllerRef.current) {
      merchantAbortControllerRef.current.abort();
      merchantAbortControllerRef.current = null;
    }
    setIsMerchantAiLoading(false);
  };

  const handleExecuteAgentAction = async (
    action: NonNullable<MerchantAgentMessage['executableAction']>,
    messageId?: string
  ) => {
    const actionKey = messageId || `${action.actionType}-${action.promoCode || action.productId || Date.now()}`;
    setDeployingActionIds(prev => ({ ...prev, [actionKey]: true, ...(messageId ? { [messageId]: true } : {}) }));

    // Provide a crisp 450ms visual synchronization delay so user clearly sees the deploying & synchronizing status
    await new Promise(resolve => setTimeout(resolve, 450));

    try {
      if (action.actionType === 'ACTIVATE_COUPON') {
        const code = (action.promoCode || 'LUXORA15').trim().toUpperCase();
        const disc = action.discount || 15;
        const title = action.campaignTitle || `${code} Atelier Strategic Privilege`;
        const bannerAnnouncement = action.bannerAnnouncement || `Exclusive Atelier Privilege: ${disc}% off with code ${code}`;

        setCouponActive(code, disc, {
          title,
          bannerAnnouncement
        });

        triggerSyncToast(`✓ Coupon "${code}" (${disc}% OFF) is now live on Buyer Storefront!`);

        const confirmMsg: MerchantAgentMessage = {
          id: `confirm-${Date.now()}`,
          sender: 'agent',
          text: `✓ **Successfully Deployed & Active on Storefront!**\n\n• **Promo Code**: \`${code}\` (${disc}% OFF)\n• **Storefront Status**: Live on the Hero Coupon Marquee & Promotional Banners\n• **Bag Checkout**: Ready for auto-deduction in client shopping bags\n• **Merchant Governance**: Registered in Live Campaigns and Audit Trail\n\nYou can switch to the Buyer Storefront to verify the offer live in action!`,
          timestamp: Date.now()
        };
        setMerchantMessages(prev => [...prev, confirmMsg]);
      } else if (action.actionType === 'DEACTIVATE_COUPON') {
        const code = (action.promoCode || 'SILKRECOVERY15').trim().toUpperCase();
        deactivateCoupon(code);

        triggerSyncToast(`✓ Coupon "${code}" deactivated and removed from Storefront.`);

        const confirmMsg: MerchantAgentMessage = {
          id: `confirm-${Date.now()}`,
          sender: 'agent',
          text: `✓ **Successfully Deactivated!**\n\n• **Promo Code**: \`${code}\` has been deactivated\n• **Buyer Storefront**: Removed from Hero Marquee and promotional banners\n• **Buyer Bag Drawer**: Disabled at checkout\n• **Status**: Logged in Merchant Governance\n\nPatrons attempting to apply \`${code}\` will be informed that the privilege has expired.`,
          timestamp: Date.now()
        };
        setMerchantMessages(prev => [...prev, confirmMsg]);
      } else if (action.actionType === 'LAUNCH_CAMPAIGN') {
        const code = (action.promoCode || 'SILKRECOVERY15').trim().toUpperCase();
        const disc = action.discount || 15;
        const title = action.campaignTitle || 'Silk Slip Evening Recovery (Auto-Triggered)';
        const banner = action.bannerAnnouncement || `Limited Atelier Offer: ${disc}% off Silk Slips with code ${code}`;

        setCouponActive(code, disc, {
          title,
          bannerAnnouncement: banner
        });

        addCustomCampaign({
          title,
          opportunity: 'Autonomous AI recovery triggered to capture high-intent demand',
          opportunityType: 'Cart Recovery',
          targetAudience: action.targetAudience || 'High-intent VIP cart abandoners',
          recipientCount: 128,
          projectedRevenueINR: 420000,
          discountPercent: disc,
          promoCode: code,
          bannerAnnouncement: banner,
          emailSubject: `Private Privilege: ${title}`,
          emailPreview: 'Exclusive atelier access and bespoke alteration guarantees...',
          emailBody: 'Dear Patron,\n\nWe have reserved your curated pieces with complimentary white-glove delivery.\n\nWarm regards,\nLUXORA Atelier',
          status: 'launched',
          tags: ['AI-Auto', 'VIP-Recovery', 'Storefront-Active']
        });

        addLog(
          'CAMPAIGN',
          `Autonomous AI Campaign Deployed: ${title}`,
          `Triggered direct from LUXORA Merchant AI Agent. Live promo code "${code}" now active on Buyer Storefront.`,
          'success',
          { action }
        );

        triggerSyncToast(`✓ Campaign "${title}" deployed live! Promo code ${code} is active on Storefront.`);

        const confirmMsg: MerchantAgentMessage = {
          id: `confirm-${Date.now()}`,
          sender: 'agent',
          text: `✓ **Successfully Deployed & Active on Storefront!**\n\n• **Campaign**: "${title}"\n• **Promo Code**: \`${code}\` (${disc}% OFF)\n• **Buyer Storefront**: Hero marquee & promo banner updated\n• **Bag Drawer**: Auto-applicable for clients at checkout\n• **Campaigns Tab**: Added to Active Campaigns`,
          timestamp: Date.now()
        };
        setMerchantMessages(prev => [...prev, confirmMsg]);
      } else if (action.actionType === 'UPDATE_STOCK' || action.actionType === 'RESTOCK_SKU') {
        if (action.productId) {
          const newCount = action.stockCount ?? 15;
          updateProductStock(action.productId, newCount);
          addLog(
            'MERCHANT_ACTION',
            `AI Inventory Sync: Stock Updated for ${action.productName || action.productId}`,
            `Inventory set to ${newCount} units. Immediately synchronized with buyer storefront.`,
            'success',
            { productId: action.productId, newStock: newCount }
          );
          triggerSyncToast(`✓ Inventory updated for ${action.productName || action.productId} (${newCount} units)`);

          const confirmMsg: MerchantAgentMessage = {
            id: `confirm-${Date.now()}`,
            sender: 'agent',
            text: `✓ **Inventory Updated & Synchronized**\n\nStock for **${action.productName || action.productId}** is now set to **${newCount} units** and immediately live across the Buyer Storefront.`,
            timestamp: Date.now()
          };
          setMerchantMessages(prev => [...prev, confirmMsg]);
        }
      } else if (action.actionType === 'SET_OUT_OF_STOCK') {
        if (action.productId) {
          toggleProductOutOfStock(action.productId);
          addLog(
            'MERCHANT_ACTION',
            `AI Inventory Sync: Marked Out of Stock for ${action.productName || action.productId}`,
            `Product status updated. "Sold Out" state and "Notify Me" trigger now active on buyer storefront.`,
            'warning',
            { productId: action.productId }
          );
          triggerSyncToast(`✓ Marked ${action.productName || action.productId} as Out of Stock`);

          const confirmMsg: MerchantAgentMessage = {
            id: `confirm-${Date.now()}`,
            sender: 'agent',
            text: `✓ **Inventory Status Updated**\n\n**${action.productName || action.productId}** is now marked **Sold Out** on the Buyer Storefront with waitlist triggers active.`,
            timestamp: Date.now()
          };
          setMerchantMessages(prev => [...prev, confirmMsg]);
        }
      } else if (action.actionType === 'UPDATE_PRICE') {
        if (action.productId && action.price) {
          updateProduct(action.productId, { price: action.price });
          addLog(
            'MERCHANT_ACTION',
            `AI Price Sync: Price Updated for ${action.productName || action.productId}`,
            `Price set to ₹${action.price.toLocaleString('en-IN')}. Immediately synchronized with buyer storefront.`,
            'success',
            { productId: action.productId, newPrice: action.price }
          );
          triggerSyncToast(`✓ Price updated for ${action.productName || action.productId} (₹${action.price.toLocaleString('en-IN')})`);

          const confirmMsg: MerchantAgentMessage = {
            id: `confirm-${Date.now()}`,
            sender: 'agent',
            text: `✓ **Price Updated & Synchronized**\n\n**${action.productName || action.productId}** is now priced at **₹${action.price.toLocaleString('en-IN')}** across the Buyer Storefront and catalog.`,
            timestamp: Date.now()
          };
          setMerchantMessages(prev => [...prev, confirmMsg]);
        }
      }

      setExecutedActionIds(prev => ({
        ...prev,
        [actionKey]: true,
        ...(messageId ? { [messageId]: true } : {}),
        ...(action.promoCode ? { [action.promoCode]: true } : {})
      }));
      setPendingAction(null);
    } finally {
      setDeployingActionIds(prev => ({
        ...prev,
        [actionKey]: false,
        ...(messageId ? { [messageId]: false } : {})
      }));
    }
  };

  const handleSendMerchantMessage = async (customPrompt?: string) => {
    const promptToSend = customPrompt || merchantInput;
    if (!promptToSend.trim() || isMerchantAiLoading) return;

    // Check if user is confirming or cancelling a pending confirmation action
    if (pendingAction) {
      const lower = promptToSend.trim().toLowerCase();
      const isAffirmative = /^(yes|yeah|yep|sure|proceed|confirm|haan|ha|kardo|kr do|kar do|apply|ok|okay|theek hai|bilkul|deploy|chalu karo|kr dena|kar dena)\b/i.test(lower);
      const isNegative = /^(no|nah|cancel|stop|abort|nahi|mat karo|rehndo|rehne do|don't|dont|nhi)\b/i.test(lower);

      if (isAffirmative) {
        const userMsg: MerchantAgentMessage = {
          id: `merchant-user-${Date.now()}`,
          sender: 'user',
          text: promptToSend,
          timestamp: Date.now()
        };
        setMerchantMessages(prev => [...prev, userMsg]);
        setMerchantInput('');
        handleExecuteAgentAction(pendingAction);
        return;
      }

      if (isNegative) {
        const userMsg: MerchantAgentMessage = {
          id: `merchant-user-${Date.now()}`,
          sender: 'user',
          text: promptToSend,
          timestamp: Date.now()
        };
        const cancelReply: MerchantAgentMessage = {
          id: `merchant-agent-cancel-${Date.now()}`,
          sender: 'agent',
          text: 'Action cancelled. No modifications were made to your store coupons, storefront campaigns, or inventory.',
          timestamp: Date.now()
        };
        setMerchantMessages(prev => [...prev, userMsg, cancelReply]);
        setMerchantInput('');
        setPendingAction(null);
        return;
      }
    }

    const controller = new AbortController();
    merchantAbortControllerRef.current = controller;

    const userMsg: MerchantAgentMessage = {
      id: `merchant-user-${Date.now()}`,
      sender: 'user',
      text: promptToSend,
      timestamp: Date.now()
    };

    setMerchantMessages(prev => [...prev, userMsg]);
    setMerchantInput('');
    setIsMerchantAiLoading(true);

    try {
      const historyPayload = merchantMessages.slice(-6).map(m => ({
        role: m.sender === 'user' ? 'user' : 'model',
        content: m.text
      }));

      const response = await fetch('/api/merchant/agent', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prompt: promptToSend,
          storeMetrics: agentStats,
          history: historyPayload
        }),
        signal: controller.signal,
      });

      const data = await response.json();

      const agentReply: MerchantAgentMessage = {
        id: `merchant-agent-${Date.now()}`,
        sender: 'agent',
        text: data.text || 'Store telemetry analyzed: We have identified key growth bottlenecks and generated immediate corrective actions.',
        timestamp: Date.now(),
        growthHighlights: data.growthHighlights || [
          'High demand for Noir Tailored Eveningwear (+38%)',
          'VIP client repeat purchases driving 44% of revenue'
        ],
        lossOrRiskHighlights: data.lossOrRiskHighlights || [
          'Checkout funnel drop-off at address verification (12.4%)',
          'Mobile view sizing ambiguity causing cart holds'
        ],
        actionPlan: data.actionPlan || [
          '1. Trigger targeted VIP promotional campaign with verified promo code.',
          '2. Synchronize active offers across buyer catalog and checkout.'
        ],
        suggestedActions: data.suggestedActions || [
          'Where is revenue loss occurring, why is it happening, and how can we resolve it?',
          'How to improve conversion by 15%?',
          'Create new festive capsule campaign'
        ],
        executableAction: data.executableAction
      };

      if (data.executableAction?.requiresConfirmation) {
        setPendingAction(data.executableAction);
      } else {
        setPendingAction(null);
      }

      setMerchantMessages(prev => [...prev, agentReply]);
    } catch (err: any) {
      if (err?.name === 'AbortError') {
        console.log('Merchant AI agent query cancelled by user.');
        return;
      }
      console.error('Merchant AI query error:', err);
      setMerchantMessages(prev => [
        ...prev,
        {
          id: `merchant-agent-fallback-${Date.now()}`,
          sender: 'agent',
          text: 'Telemetry analysis synthesized: Highest growth potential lies in evening separates and tailored outerwear. Automated campaign triggers are ready to deploy.',
          timestamp: Date.now(),
          growthHighlights: [
            'Tailored outerwear showing strong conversion (+34%)'
          ],
          lossOrRiskHighlights: [
            'Cart abandonment in high-value evening gowns'
          ],
          actionPlan: [
            '1. Deploy 15% VIP Recovery Campaign with code SILKRECOVERY15.',
            '2. Offer complimentary White-Glove alterations.'
          ],
          suggestedActions: [
            'Where is revenue loss occurring, why is it happening, and how can we resolve it?',
            'Launch VIP Cart Recovery Campaign with 15% discount',
            'How to increase AOV by 30% through automated pairings?'
          ],
          executableAction: {
            label: 'Deploy Automated VIP Recovery Campaign',
            actionType: 'LAUNCH_CAMPAIGN',
            campaignTitle: 'Silk Slip Evening Recovery (Auto-Triggered)',
            discount: 15,
            promoCode: 'SILKRECOVERY15',
            bannerAnnouncement: 'Limited Atelier Offer: 15% off Silk Slips with code SILKRECOVERY15',
            targetAudience: 'High-Intent Cart Abandoners'
          }
        }
      ]);
    } finally {
      setIsMerchantAiLoading(false);
      merchantAbortControllerRef.current = null;
    }
  };

  const handleCreateCustomCampaignSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCampTitle.trim()) return;

    addCustomCampaign({
      title: newCampTitle,
      opportunity: 'Merchant bespoke growth campaign',
      opportunityType: 'Seasonal Promotion',
      targetAudience: newCampAudience,
      recipientCount: 250,
      projectedRevenueINR: 650000,
      discountPercent: Number(newCampDiscount) || 10,
      promoCode: newCampPromo.trim().toUpperCase(),
      bannerAnnouncement: newCampBanner.trim(),
      emailSubject: newCampSubject,
      emailPreview: 'Exclusive private collection preview...',
      emailBody: newCampBody,
      status: 'launched',
      tags: ['Merchant-Created', 'Live-Storefront']
    });

    setIsNewCampaignOpen(false);
    setNewCampTitle('');
    setActiveTab('campaigns');
  };

  const handleApplyStrategy = (strategyId: string, title: string, impact: string) => {
    setAppliedStrategies(prev => ({ ...prev, [strategyId]: true }));
    addLog(
      'MERCHANT_ACTION',
      `Applied AI Growth Strategy: "${title}"`,
      `Strategy "${title}" activated successfully with estimated impact: ${impact}.`,
      'success',
      { strategyId, impact, timestamp: new Date().toISOString() }
    );
  };

  // Sample CSV Data
  const SAMPLE_CSV = `SKU,Name,Category,Designer,PriceUSD,Description,Composition
LUX-901,Hand-Pleated Georgette Blouse,tops,Atelier Khaire,215,Pleated blouse with asymmetric drape,100% Mulberry Silk
LUX-902,Bespoke Flannel Tailored Trench,outerwear,Maison Aurelia,600,Double-breasted trench with horn buckles,100% Virgin Wool
LUX-903,Pavé Diamond Arch Ear Cuff,accessories,Aurum Studio,335,18k Gold ear cuff with micro-diamonds,18k Gold`;

  const handleUploadRawData = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!rawTextInput.trim()) return;

    setIsUploading(true);
    try {
      const batch = await addRawBatch(`Catalog_Batch_${new Date().toISOString().slice(0, 10)}.csv`, rawTextInput);
      setSelectedBatchId(batch.id);
      setRawTextInput('');
    } catch (err) {
      console.error(err);
    } finally {
      setIsUploading(false);
    }
  };

  const handleFixWithAi = async (batchId: string) => {
    setIsUploading(true);
    await fixBatchWithAi(batchId);
    setIsUploading(false);
  };

  const selectedBatch = rawBatches.find(b => b.id === selectedBatchId) || rawBatches[0];

  const onSignOutClick = async () => {
    setIsProfileDropdownOpen(false);
    await handleSignOut();
  };

  return (
    <div className="min-h-screen bg-[#fbf9f4] text-[#1b1c19] flex flex-col font-sans selection:bg-[#fc6018] selection:text-[#531800]">
      
      {/* Top Floating Glass Navigation Bar with LUXORA BUSINESS typography matching landing page */}
      <nav className="fixed top-4 md:top-6 left-1/2 -translate-x-1/2 w-[94%] max-w-[1440px] rounded-full glass-nav shadow-sm hover:shadow-md transition-all duration-300 z-50 px-6 sm:px-8 py-3 flex justify-between items-center">
        
        {/* Brand Logo: LUXORA BUSINESS */}
        <div className="flex items-center gap-3">
          <button 
            onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
            className="text-xl sm:text-2xl font-bold tracking-tight text-black hover:opacity-80 transition-opacity font-['Archivo_Narrow'] cursor-pointer flex items-center gap-2"
          >
            <span>LUXORA</span>
            <span className="text-xs sm:text-sm font-semibold tracking-widest text-[#a83900] uppercase bg-[#f5ede5] px-2.5 py-0.5 rounded-full border border-[#e4d3c4]">
              BUSINESS
            </span>
          </button>
        </div>

        {/* Navigation Tabs */}
        <div className="flex items-center gap-4 sm:gap-7 text-[13px] sm:text-[14px] font-medium font-['Archivo_Narrow']">
          <button
            onClick={() => setActiveTab('agent')}
            className={`pb-0.5 transition-all duration-150 flex items-center gap-1.5 cursor-pointer ${
              activeTab === 'agent'
                ? 'text-black border-b-2 border-black font-bold'
                : 'text-[#444748]/70 hover:text-black'
            }`}
          >
            <Sparkles className="w-3.5 h-3.5 text-[#a83900]" />
            <span>AI Bot & Strategy</span>
          </button>

          <button
            onClick={() => setActiveTab('users')}
            className={`pb-0.5 transition-colors duration-200 flex items-center gap-1.5 cursor-pointer ${
              activeTab === 'users'
                ? 'text-black border-b-2 border-black font-bold'
                : 'text-[#444748]/70 hover:text-black'
            }`}
          >
            <Users className="w-3.5 h-3.5 text-[#a83900]" />
            <span>Patron Activity & Offers ({userActivities.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('campaigns')}
            className={`pb-0.5 transition-colors duration-200 cursor-pointer ${
              activeTab === 'campaigns'
                ? 'text-black border-b-2 border-black font-bold'
                : 'text-[#444748]/70 hover:text-black'
            }`}
          >
            Campaigns ({campaigns.length})
          </button>

          <button
            onClick={() => setActiveTab('orders')}
            className={`pb-0.5 transition-colors duration-200 cursor-pointer ${
              activeTab === 'orders'
                ? 'text-black border-b-2 border-black font-bold'
                : 'text-[#444748]/70 hover:text-black'
            }`}
          >
            Live Orders ({orders.length})
          </button>

          <button
            onClick={() => setActiveTab('catalog')}
            className={`pb-0.5 transition-colors duration-200 hidden md:inline-block cursor-pointer ${
              activeTab === 'catalog'
                ? 'text-black border-b-2 border-black font-bold'
                : 'text-[#444748]/70 hover:text-black'
            }`}
          >
            Catalog ({catalog.length})
          </button>

          <button
            onClick={() => setActiveTab('growth')}
            className={`pb-0.5 transition-colors duration-200 hidden lg:inline-block cursor-pointer ${
              activeTab === 'growth'
                ? 'text-black border-b-2 border-black font-bold'
                : 'text-[#444748]/70 hover:text-black'
            }`}
          >
            Growth Telemetry
          </button>
        </div>


        {/* Trailing Icon Actions & Profile Dropdown */}
        <div className="flex items-center gap-3 sm:gap-4 text-black relative">
          
          {/* Audit Trail quick button */}
          <button
            onClick={onOpenAuditTrail}
            aria-label="Security Audit Trail"
            className="p-1.5 hover:scale-105 transition-transform text-emerald-800 hover:text-black relative cursor-pointer"
            title="Security Audit Trail"
          >
            <ShieldCheck className="w-5 h-5 text-emerald-700" />
          </button>

          {/* Business Profile Avatar & Dropdown */}
          <div className="relative" ref={dropdownRef}>
            <button
              onClick={() => setIsProfileDropdownOpen(prev => !prev)}
              aria-label="Business Account Options"
              className="p-1 hover:scale-105 transition-transform duration-150 relative cursor-pointer flex items-center gap-1.5"
              title={`Signed in as ${user?.displayName || user?.email || 'Business Administrator'}`}
            >
              <div className="w-8 h-8 rounded-full bg-black text-white text-xs font-bold flex items-center justify-center border-2 border-amber-400 shadow-xs">
                {user?.displayName ? user.displayName.charAt(0).toUpperCase() : 'B'}
              </div>
            </button>

            {/* Profile Dropdown Menu */}
            {isProfileDropdownOpen && (
              <div className="absolute right-0 top-full mt-3 w-80 bg-white/95 backdrop-blur-2xl border border-black/10 rounded-2xl shadow-2xl overflow-hidden z-50 animate-in fade-in zoom-in-95 duration-150 font-['Archivo_Narrow']">
                
                {/* Header */}
                <div className="p-4 bg-[#fbf9f4] border-b border-black/10">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-black text-amber-400 font-bold flex items-center justify-center text-sm border border-amber-300 shadow-xs">
                      <Building className="w-5 h-5" />
                    </div>
                    <div className="min-w-0">
                      <h4 className="font-bold text-sm text-black truncate">
                        {user?.displayName || 'Business Administrator'}
                      </h4>
                      <p className="text-xs text-neutral-500 font-mono truncate">
                        {user?.email || 'admin@luxora.ai'}
                      </p>
                      <div className="flex items-center gap-1.5 mt-1">
                        <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                        <span className="text-[10px] uppercase tracking-wider font-bold text-amber-900 bg-amber-50 border border-amber-200 px-2 py-0.2 rounded-full">
                          LUXORA Business Admin
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Dropdown Options */}
                <div className="p-2 space-y-1 text-sm">
                  {/* 1. Analytics & AI Telemetry */}
                  <button
                    onClick={() => {
                      setIsProfileDropdownOpen(false);
                      setActiveTab('agent');
                    }}
                    className="w-full px-3 py-2 rounded-xl text-left hover:bg-[#fbf9f4] text-neutral-800 hover:text-black flex items-center justify-between group transition-colors cursor-pointer"
                  >
                    <div className="flex items-center gap-2.5">
                      <Sparkles className="w-4 h-4 text-[#a83900]" />
                      <span className="font-medium text-xs">AI Agent & Telemetry</span>
                    </div>
                    <ArrowRight className="w-3.5 h-3.5 text-neutral-400 group-hover:text-black group-hover:translate-x-0.5 transition-all" />
                  </button>

                  {/* 2. Patron Activity & Exclusive Offers */}
                  <button
                    onClick={() => {
                      setIsProfileDropdownOpen(false);
                      setActiveTab('users');
                    }}
                    className="w-full px-3 py-2 rounded-xl text-left hover:bg-[#fbf9f4] text-neutral-800 hover:text-black flex items-center justify-between group transition-colors cursor-pointer"
                  >
                    <div className="flex items-center gap-2.5">
                      <Users className="w-4 h-4 text-[#a83900]" />
                      <span className="font-medium text-xs">Patron Activity & Offers ({userActivities.length})</span>
                    </div>
                    <ArrowRight className="w-3.5 h-3.5 text-neutral-400 group-hover:text-black group-hover:translate-x-0.5 transition-all" />
                  </button>

                  {/* 3. Marketing Campaigns */}
                  <button
                    onClick={() => {
                      setIsProfileDropdownOpen(false);
                      setActiveTab('campaigns');
                    }}
                    className="w-full px-3 py-2 rounded-xl text-left hover:bg-[#fbf9f4] text-neutral-800 hover:text-black flex items-center justify-between group transition-colors cursor-pointer"
                  >
                    <div className="flex items-center gap-2.5">
                      <Megaphone className="w-4 h-4 text-purple-600" />
                      <span className="font-medium text-xs">Growth Campaigns ({campaigns.length})</span>
                    </div>
                    <ArrowRight className="w-3.5 h-3.5 text-neutral-400 group-hover:text-black group-hover:translate-x-0.5 transition-all" />
                  </button>


                  {/* 3. Orders & Transactions */}
                  <button
                    onClick={() => {
                      setIsProfileDropdownOpen(false);
                      setActiveTab('orders');
                    }}
                    className="w-full px-3 py-2 rounded-xl text-left hover:bg-[#fbf9f4] text-neutral-800 hover:text-black flex items-center justify-between group transition-colors cursor-pointer"
                  >
                    <div className="flex items-center gap-2.5">
                      <Package className="w-4 h-4 text-[#a83900]" />
                      <span className="font-medium text-xs">Store Orders & Invoices ({orders.length})</span>
                    </div>
                    <ArrowRight className="w-3.5 h-3.5 text-neutral-400 group-hover:text-black group-hover:translate-x-0.5 transition-all" />
                  </button>

                  {/* 4. Catalog Management */}
                  <button
                    onClick={() => {
                      setIsProfileDropdownOpen(false);
                      setActiveTab('catalog');
                    }}
                    className="w-full px-3 py-2 rounded-xl text-left hover:bg-[#fbf9f4] text-neutral-800 hover:text-black flex items-center justify-between group transition-colors cursor-pointer"
                  >
                    <div className="flex items-center gap-2.5">
                      <Layers className="w-4 h-4 text-neutral-700" />
                      <span className="font-medium text-xs">Catalog & Inventory ({catalog.length})</span>
                    </div>
                    <ArrowRight className="w-3.5 h-3.5 text-neutral-400 group-hover:text-black group-hover:translate-x-0.5 transition-all" />
                  </button>

                  {/* 5. Autonomous Strategies */}
                  <button
                    onClick={() => {
                      setIsProfileDropdownOpen(false);
                      setActiveTab('growth');
                    }}
                    className="w-full px-3 py-2 rounded-xl text-left hover:bg-[#fbf9f4] text-neutral-800 hover:text-black flex items-center justify-between group transition-colors cursor-pointer"
                  >
                    <div className="flex items-center gap-2.5">
                      <TrendingUp className="w-4 h-4 text-emerald-600" />
                      <span className="font-medium text-xs">Autonomous Playbooks</span>
                    </div>
                    <ArrowRight className="w-3.5 h-3.5 text-neutral-400 group-hover:text-black group-hover:translate-x-0.5 transition-all" />
                  </button>

                  {/* 6. Security & Audit Trail */}
                  <button
                    onClick={() => {
                      setIsProfileDropdownOpen(false);
                      onOpenAuditTrail();
                    }}
                    className="w-full px-3 py-2 rounded-xl text-left hover:bg-[#fbf9f4] text-neutral-800 hover:text-black flex items-center justify-between group transition-colors cursor-pointer"
                  >
                    <div className="flex items-center gap-2.5">
                      <ShieldCheck className="w-4 h-4 text-emerald-600" />
                      <span className="font-medium text-xs">Security & Live Audit Trail</span>
                    </div>
                    <ArrowRight className="w-3.5 h-3.5 text-neutral-400 group-hover:text-black group-hover:translate-x-0.5 transition-all" />
                  </button>
                </div>

                {/* Sign Out Button */}
                <div className="p-2 border-t border-black/10 bg-[#fbf9f4]">
                  <button
                    onClick={onSignOutClick}
                    className="w-full px-3 py-2 rounded-xl text-left bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 text-xs font-bold uppercase tracking-wider flex items-center justify-center gap-2 transition-colors cursor-pointer"
                  >
                    <LogOut className="w-3.5 h-3.5" />
                    <span>Sign Out</span>
                  </button>
                </div>

              </div>
            )}
          </div>

        </div>

      </nav>

      {/* Main Content Area */}
      <main className="flex-1 w-full max-w-[1440px] mx-auto px-5 sm:px-8 md:px-12 pt-28 sm:pt-32 pb-20">
        
        {/* TAB 1: AI BOT & STRATEGIC GROWTH INTELLIGENCE (Optimized long & aesthetic view) */}
        {activeTab === 'agent' && (
          <div className="space-y-8 animate-fade-in font-['Archivo_Narrow']">
            
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 border-b border-[#e4e2dd] pb-6">
              <div>
                <div className="flex items-center space-x-2">
                  <span className="text-[11px] uppercase tracking-[0.25em] font-semibold text-[#a83900]">
                    Executive Business Intelligence
                  </span>
                  <span className="px-2.5 py-0.5 bg-black text-white text-[10px] font-mono rounded-full font-bold">
                    LUXORA AI Intelligence Engine
                  </span>
                </div>
                <h1 className="text-3xl sm:text-4xl font-bold tracking-tight text-black font-sans mt-1">
                  Autonomous Growth, Revenue & Risk Agent
                </h1>
                <p className="text-sm text-[#444748] mt-1 font-light">
                  Continuous real-time telemetry analysis across your catalog, cart friction, and buyer conversions. Actions and campaigns launched here instantly reflect in the Buyer Storefront.
                </p>
              </div>

              {/* Status and Actions */}
              <div className="flex items-center gap-2 flex-wrap sm:flex-nowrap">
                <a
                  href="/Luxora_AI_Commerce_5Min_Video_Script.pdf"
                  download="Luxora_AI_Commerce_5Min_Video_Script.pdf"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-3.5 py-2 bg-[#1b1c19] hover:bg-black text-white text-xs font-bold uppercase tracking-wider rounded-full transition-all flex items-center gap-1.5 cursor-pointer shadow-xs border border-white/10"
                  title="Download Hackathon 5-Minute Video Pitch & Demo Script PDF"
                >
                  <FileText className="w-4 h-4 text-amber-400" />
                  <span>Script PDF</span>
                </a>

                <button
                  onClick={() => setIsNewCampaignOpen(true)}
                  className="px-4 py-2 bg-[#a83900] hover:bg-[#882e00] text-white text-xs font-bold uppercase tracking-wider rounded-full transition-all flex items-center gap-1.5 cursor-pointer shadow-xs"
                >
                  <Plus className="w-4 h-4" />
                  <span>Create Campaign</span>
                </button>
              </div>
            </div>

            {/* Quick Inquiry Chips */}
            <div className="space-y-2">
              <span className="text-[11px] uppercase tracking-wider font-bold text-[#767777] block">
                Recommended Strategic Inquiries:
              </span>
              <div className="flex flex-wrap gap-2">
                {[
                  'Where is revenue loss occurring, why is it happening, and how can we resolve it?',
                  'Why are customers abandoning carts on silk evening gowns?',
                  'How to increase AOV by 30% through automated pairings?',
                  'Launch VIP Cart Recovery Campaign with 15% discount',
                  'Which low-stock SKUs require immediate atelier re-order?'
                ].map((prompt, promptIdx) => (
                  <button
                    key={promptIdx}
                    onClick={() => handleSendMerchantMessage(prompt)}
                    disabled={isMerchantAiLoading}
                    className="px-3.5 py-2 bg-white hover:bg-black hover:text-white text-black border border-black/15 text-xs font-medium rounded-full transition-all shadow-2xs cursor-pointer flex items-center gap-1.5"
                  >
                    <Sparkles className="w-3.5 h-3.5 text-[#a83900]" />
                    <span>{prompt}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Long & Aesthetic Two-Column Canvas */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              
              {/* Left & Center Column: Full-Height Aesthetic Conversational Copilot Stream */}
              <div className="lg:col-span-2 bg-[#fbf9f4] border border-black/10 rounded-3xl p-6 shadow-sm flex flex-col min-h-[640px] max-h-[820px]">
                
                {/* Chat Stream */}
                <div className="flex-1 overflow-y-auto space-y-4 pr-2 custom-scrollbar">
                  {merchantMessages.map((msg) => {
                    const isUser = msg.sender === 'user';
                    return (
                      <div
                        key={msg.id}
                        className={`flex flex-col ${isUser ? 'items-end' : 'items-start'} transition-all`}
                      >
                        <div className="flex items-center space-x-1.5 mb-1.5 text-[11px] uppercase tracking-wider text-[#444748]">
                          <span>{isUser ? 'You (Business Executive)' : 'LUXORA Growth Copilot'}</span>
                          <span>•</span>
                          <span>{new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                        </div>

                        <div
                          className={`p-5 max-w-2xl text-[14px] leading-relaxed rounded-2xl ${
                            isUser
                              ? 'bg-black text-white font-normal shadow-sm rounded-tr-xs'
                              : 'bg-white border border-black/10 text-black shadow-xs rounded-tl-xs space-y-4'
                          }`}
                        >
                          <p className="whitespace-pre-line">{msg.text}</p>

                          {/* Growth Highlights */}
                          {!isUser && msg.growthHighlights && msg.growthHighlights.length > 0 && (
                            <div className="p-3.5 bg-emerald-50/90 border border-emerald-200 rounded-xl space-y-1.5">
                              <span className="text-[11px] uppercase tracking-wider font-bold text-emerald-900 flex items-center gap-1.5">
                                <TrendingUp className="w-3.5 h-3.5 text-emerald-700" />
                                Growth Drivers & High Traction
                              </span>
                              <ul className="space-y-1 text-xs text-emerald-950 font-normal list-disc list-inside">
                                {msg.growthHighlights.map((gh, ghIdx) => (
                                  <li key={ghIdx}>{gh}</li>
                                ))}
                              </ul>
                            </div>
                          )}

                          {/* Loss / Risk Highlights */}
                          {!isUser && msg.lossOrRiskHighlights && msg.lossOrRiskHighlights.length > 0 && (
                            <div className="p-3.5 bg-rose-50/90 border border-rose-200 rounded-xl space-y-1.5">
                              <span className="text-[11px] uppercase tracking-wider font-bold text-rose-900 flex items-center gap-1.5">
                                <AlertTriangle className="w-3.5 h-3.5 text-rose-700" />
                                Revenue Losses & Bottlenecks
                              </span>
                              <ul className="space-y-1 text-xs text-rose-950 font-normal list-disc list-inside">
                                {msg.lossOrRiskHighlights.map((lh, lhIdx) => (
                                  <li key={lhIdx}>{lh}</li>
                                ))}
                              </ul>
                            </div>
                          )}

                          {/* Action Plan */}
                          {!isUser && msg.actionPlan && msg.actionPlan.length > 0 && (
                            <div className="p-3.5 bg-[#fbf9f4] border border-black/10 rounded-xl space-y-1.5">
                              <span className="text-[11px] uppercase tracking-wider font-bold text-black flex items-center gap-1.5">
                                <Zap className="w-3.5 h-3.5 text-[#a83900]" />
                                Strategic Resolution & Storefront Sync Plan
                              </span>
                              <div className="space-y-1 text-xs text-neutral-800">
                                {msg.actionPlan.map((ap, apIdx) => (
                                  <p key={apIdx}>{ap}</p>
                                ))}
                              </div>
                            </div>
                          )}

                          {/* 1-Click Executable Action Trigger & Confirmation Panel */}
                          {!isUser && msg.executableAction && (() => {
                            const isActionDone = Boolean(
                              executedActionIds[msg.id] ||
                              (msg.executableAction.promoCode && executedActionIds[msg.executableAction.promoCode]) ||
                              (msg.executableAction.actionType === 'ACTIVATE_COUPON' && msg.executableAction.promoCode && isCouponActive(msg.executableAction.promoCode)) ||
                              (msg.executableAction.actionType === 'DEACTIVATE_COUPON' && msg.executableAction.promoCode && !isCouponActive(msg.executableAction.promoCode))
                            );

                            const actionKey = msg.id;
                            const isDeploying = Boolean(
                              deployingActionIds[msg.id] ||
                              (msg.executableAction.promoCode && deployingActionIds[msg.executableAction.promoCode]) ||
                              deployingActionIds[`${msg.executableAction.actionType}-${msg.executableAction.promoCode || msg.executableAction.productId}`]
                            );

                            return (
                              <div className="pt-2 border-t border-black/10 space-y-2.5">
                                {isActionDone ? (
                                  <div className="p-3.5 bg-emerald-50 border border-emerald-300 rounded-xl text-xs flex items-center justify-between shadow-2xs">
                                    <div className="flex items-center gap-2.5">
                                      <CheckCircle2 className="w-4 h-4 text-emerald-700 shrink-0" />
                                      <div>
                                        <span className="font-bold text-emerald-950 block">
                                          {msg.executableAction.actionType === 'DEACTIVATE_COUPON'
                                            ? `Coupon "${msg.executableAction.promoCode}" Deactivated`
                                            : `Action Executed & Live on Storefront`}
                                        </span>
                                        <span className="text-emerald-800 text-[11px]">
                                          {msg.executableAction.promoCode ? `Promo Code: ${msg.executableAction.promoCode} ` : ''}
                                          {msg.executableAction.discount ? `(${msg.executableAction.discount}% OFF) ` : ''}
                                          — Active across Buyer Storefront, Marquee & Checkout
                                        </span>
                                      </div>
                                    </div>
                                    <span className="text-[10px] uppercase font-bold bg-emerald-200 text-emerald-900 px-2.5 py-1 rounded-full shrink-0">
                                      ✓ Live & Deployed
                                    </span>
                                  </div>
                                ) : (
                                  <div className="space-y-2">
                                    <div className="p-3.5 bg-amber-50/90 border border-amber-300 rounded-xl text-xs space-y-1.5 shadow-2xs">
                                      <div className="flex items-center justify-between">
                                        <span className="text-[11px] uppercase tracking-wider font-bold text-amber-900 flex items-center gap-1.5">
                                          <AlertCircle className="w-3.5 h-3.5 text-amber-700" />
                                          {msg.executableAction.requiresConfirmation ? 'Confirmation Required Before Execution' : 'Action Ready to Deploy'}
                                        </span>
                                        <span className="text-[10px] uppercase font-bold bg-amber-200 text-amber-900 px-2 py-0.5 rounded-full">
                                          Syncs to Storefront
                                        </span>
                                      </div>
                                      <p className="font-semibold text-amber-950 text-xs">
                                        {msg.executableAction.confirmationPrompt || msg.executableAction.campaignTitle || msg.executableAction.label}
                                      </p>
                                      {msg.executableAction.promoCode && (
                                        <div className="text-amber-800 text-[11px] flex items-center gap-2">
                                          <span>Promo Code: <strong className="text-amber-950">{msg.executableAction.promoCode}</strong></span>
                                          {msg.executableAction.discount && <span>• Discount: <strong className="text-amber-950">{msg.executableAction.discount}% OFF</strong></span>}
                                        </div>
                                      )}
                                    </div>

                                    <div className="flex items-center gap-2">
                                      <button
                                        onClick={() => handleExecuteAgentAction(msg.executableAction!, msg.id)}
                                        disabled={isDeploying}
                                        className="flex-1 py-2.5 px-4 bg-[#a83900] hover:bg-[#882e00] text-white text-xs font-bold uppercase tracking-wider rounded-xl transition-all flex items-center justify-center gap-2 cursor-pointer shadow-sm disabled:opacity-70"
                                      >
                                        {isDeploying ? (
                                          <>
                                            <Sparkles className="w-3.5 h-3.5 animate-spin" />
                                            <span>Deploying & Synchronizing...</span>
                                          </>
                                        ) : (
                                          <>
                                            <CheckCircle2 className="w-3.5 h-3.5" />
                                            <span>{msg.executableAction.label || 'Deploy to Storefront'}</span>
                                            <ArrowRight className="w-3.5 h-3.5" />
                                          </>
                                        )}
                                      </button>

                                      {msg.executableAction.requiresConfirmation && (
                                        <button
                                          onClick={() => {
                                            setPendingAction(null);
                                            setMerchantMessages(prev => [
                                              ...prev,
                                              {
                                                id: `cancel-${Date.now()}`,
                                                sender: 'agent',
                                                text: 'Action cancelled. No modifications were made to coupons, campaigns, or inventory.',
                                                timestamp: Date.now()
                                              }
                                            ]);
                                          }}
                                          className="py-2.5 px-4 bg-neutral-100 hover:bg-neutral-200 text-neutral-800 text-xs font-bold uppercase tracking-wider rounded-xl transition-all cursor-pointer"
                                        >
                                          Cancel
                                        </button>
                                      )}
                                    </div>
                                  </div>
                                )}
                              </div>
                            );
                          })()}

                          {/* Dynamic Suggested Follow-ups */}
                          {!isUser && msg.suggestedActions && msg.suggestedActions.length > 0 && (
                            <div className="pt-2 border-t border-black/5 flex flex-wrap gap-1.5">
                              {msg.suggestedActions.map((sug, sugIdx) => (
                                <button
                                  key={sugIdx}
                                  onClick={() => handleSendMerchantMessage(sug)}
                                  className="text-[11px] px-2.5 py-1 bg-neutral-100 hover:bg-black hover:text-white rounded-lg text-neutral-800 transition-colors font-medium cursor-pointer"
                                >
                                  {sug}
                                </button>
                              ))}
                            </div>
                          )}
                        </div>
                      </div>
                    );
                  })}

                  {isMerchantAiLoading && (
                    <div className="flex items-center justify-between p-3.5 bg-white rounded-2xl border border-black/10 max-w-md shadow-2xs gap-3">
                      <div className="flex items-center space-x-2 text-[12px] text-[#444748] font-medium italic animate-pulse">
                        <Sparkles className="w-3.5 h-3.5 text-[#a83900] animate-spin shrink-0" />
                        <span className="truncate">Synthesizing store metrics, margins, and friction points...</span>
                      </div>
                      <button
                        type="button"
                        onClick={handleStopMerchantAi}
                        className="px-2.5 py-1 bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 rounded-lg text-[11px] font-bold uppercase tracking-wider flex items-center gap-1 transition-all cursor-pointer shadow-2xs shrink-0"
                        title="Cancel agent synthesis"
                      >
                        <Square className="w-2.5 h-2.5 fill-rose-700" />
                        <span>Stop</span>
                      </button>
                    </div>
                  )}
                  <div ref={messagesEndRef} />
                </div>

                {/* Input Bar */}
                <div className="pt-4 mt-2 border-t border-black/10">
                  <form
                    onSubmit={(e) => {
                      e.preventDefault();
                      handleSendMerchantMessage();
                    }}
                    className="flex items-center space-x-2"
                  >
                    <input
                      type="text"
                      value={merchantInput}
                      onChange={(e) => setMerchantInput(e.target.value)}
                      placeholder={isMerchantAiLoading ? "AI processing... Click Stop to cancel and rewrite" : "Ask about revenue growth, loss diagnosis, or strategic actions..."}
                      className="flex-1 bg-white border border-black/20 px-4 py-3 text-xs text-black placeholder:text-neutral-400 focus:outline-none focus:border-black rounded-2xl"
                    />
                    {isMerchantAiLoading ? (
                      <button
                        type="button"
                        onClick={handleStopMerchantAi}
                        className="px-5 py-3 bg-rose-600 hover:bg-rose-700 text-white text-xs uppercase tracking-widest font-bold rounded-2xl flex items-center space-x-1.5 cursor-pointer shadow-sm animate-pulse"
                        title="Cancel AI response"
                      >
                        <Square className="w-3 h-3 fill-white" />
                        <span>Stop</span>
                      </button>
                    ) : (
                      <button
                        type="submit"
                        disabled={!merchantInput.trim()}
                        className="px-5 py-3 bg-black hover:bg-neutral-800 text-white text-xs uppercase tracking-widest font-bold rounded-2xl disabled:opacity-40 flex items-center space-x-1.5 cursor-pointer shadow-sm"
                      >
                        <span>Ask AI</span>
                        <Send className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </form>
                </div>

              </div>

              {/* Right Column: Live Telemetry & Quick Action Hub */}
              <div className="space-y-6">
                
                {/* Telemetry Summary Card */}
                <div className="bg-white border border-[#e4e2dd] rounded-2xl p-6 space-y-4 shadow-xs">
                  <h3 className="font-bold text-base text-black flex items-center gap-2">
                    <TrendingUp className="w-4 h-4 text-[#a83900]" />
                    <span>Real-time Financial Telemetry</span>
                  </h3>
                  <div className="space-y-3 text-xs">
                    <div className="flex justify-between p-3 bg-[#fbf9f4] rounded-xl border border-black/5">
                      <span className="font-semibold text-neutral-700">Gross Platform Revenue:</span>
                      <span className="font-mono font-bold text-black">₹{(agentStats.totalRevenueINR || 3850000).toLocaleString('en-IN')}</span>
                    </div>
                    <div className="flex justify-between p-3 bg-[#fbf9f4] rounded-xl border border-black/5">
                      <span className="font-semibold text-neutral-700">AI-Attributed Revenue:</span>
                      <span className="font-mono font-bold text-emerald-700">₹{(agentStats.aiInfluencedRevenueINR || 1110500).toLocaleString('en-IN')}</span>
                    </div>
                    <div className="flex justify-between p-3 bg-[#fbf9f4] rounded-xl border border-black/5">
                      <span className="font-semibold text-neutral-700">Total Confirmed Orders:</span>
                      <span className="font-mono font-bold text-black">{orders.length} Verified Orders</span>
                    </div>
                    <div className="flex justify-between p-3 bg-rose-50/70 rounded-xl border border-rose-100">
                      <span className="font-semibold text-rose-900">Revenue at Abandonment Risk:</span>
                      <span className="font-mono font-bold text-rose-700">₹2,98,400</span>
                    </div>
                  </div>
                </div>

                {/* Active Storefront Synchronization Status */}
                <div className="bg-white border border-[#e4e2dd] rounded-2xl p-6 space-y-3 shadow-xs">
                  <h3 className="font-bold text-sm text-black flex items-center gap-2">
                    <Megaphone className="w-4 h-4 text-[#a83900]" />
                    <span>Live Storefront Campaign Status</span>
                  </h3>
                  <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl space-y-1 text-xs">
                    <span className="font-bold text-emerald-900 block">Synchronized with Live Storefront</span>
                    <p className="text-[11px] text-emerald-800">
                      {campaigns.filter(c => c.status === 'launched').length} active campaign(s) running on the buyer catalog with verified promo codes.
                    </p>
                  </div>
                </div>

                {/* AI Monetary Guardrail Policy (Explainable, Bounded, Gated) */}
                <div className="bg-white border border-[#e4e2dd] rounded-2xl p-6 space-y-4 shadow-xs">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <ShieldCheck className="w-5 h-5 text-[#a83900]" />
                      <div>
                        <h3 className="font-bold text-base text-black">AI Monetary Guardrail Policy</h3>
                        <p className="text-[11px] text-neutral-500">Autonomous spend bounds & human gating protocols</p>
                      </div>
                    </div>
                    <span className="text-[10px] uppercase font-bold tracking-wider px-2.5 py-1 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-300 flex items-center gap-1.5">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-600 animate-pulse"></span>
                      Strict Bounds Active
                    </span>
                  </div>

                  <div className="p-3.5 bg-[#fbf9f4] border border-black/5 rounded-xl space-y-3">
                    {/* Max Spend Cap Slider */}
                    <div>
                      <div className="flex justify-between items-center text-xs mb-1.5">
                        <span className="font-semibold text-neutral-800">Max Autonomous Spend Cap</span>
                        <span className="font-mono font-bold text-black bg-white px-2 py-0.5 rounded border border-black/10">
                          ₹{guardrailPolicy.maxSpendCapINR.toLocaleString('en-IN')}
                        </span>
                      </div>
                      <input 
                        type="range"
                        min={10000}
                        max={100000}
                        step={5000}
                        value={guardrailPolicy.maxSpendCapINR}
                        onChange={(e) => updateGuardrailPolicy({ maxSpendCapINR: Number(e.target.value) })}
                        className="w-full accent-black cursor-pointer h-1.5 bg-neutral-200 rounded-lg"
                      />
                      <div className="flex justify-between text-[10px] text-neutral-500 font-mono mt-1">
                        <span>₹10,000 (Conservative)</span>
                        <span>₹50,000 (Standard)</span>
                        <span>₹1,00,000 (VIP High)</span>
                      </div>
                    </div>

                    {/* Max Discount Allowed Slider */}
                    <div className="pt-2 border-t border-black/5">
                      <div className="flex justify-between items-center text-xs mb-1.5">
                        <span className="font-semibold text-neutral-800">Max AI Discount Allowed</span>
                        <span className="font-mono font-bold text-[#a83900] bg-white px-2 py-0.5 rounded border border-black/10">
                          {guardrailPolicy.maxDiscountPercent}%
                        </span>
                      </div>
                      <input 
                        type="range"
                        min={5}
                        max={25}
                        step={1}
                        value={guardrailPolicy.maxDiscountPercent}
                        onChange={(e) => updateGuardrailPolicy({ maxDiscountPercent: Number(e.target.value) })}
                        className="w-full accent-[#a83900] cursor-pointer h-1.5 bg-neutral-200 rounded-lg"
                      />
                      <div className="flex justify-between text-[10px] text-neutral-500 font-mono mt-1">
                        <span>5% (Minimal)</span>
                        <span>15% (Standard Cap)</span>
                        <span>25% (Ceiling)</span>
                      </div>
                    </div>

                    {/* Strict Bounded Enforcement Toggle */}
                    <div className="pt-2 border-t border-black/5 flex items-center justify-between text-xs">
                      <div>
                        <span className="font-semibold text-neutral-800 block">Strict Bounded Check</span>
                        <span className="text-[10px] text-neutral-500">Auto-clamp any AI proposal exceeding limits</span>
                      </div>
                      <button
                        type="button"
                        onClick={() => updateGuardrailPolicy({ enforceBoundedChecks: !guardrailPolicy.enforceBoundedChecks })}
                        className={`w-11 h-6 rounded-full transition-colors relative cursor-pointer ${
                          guardrailPolicy.enforceBoundedChecks ? 'bg-black' : 'bg-neutral-300'
                        }`}
                      >
                        <span className={`absolute top-1 left-1 bg-white w-4 h-4 rounded-full transition-transform ${
                          guardrailPolicy.enforceBoundedChecks ? 'translate-x-5' : 'translate-x-0'
                        }`} />
                      </button>
                    </div>

                    {/* Mandatory Human Gating Toggle */}
                    <div className="pt-2 border-t border-black/5 flex items-center justify-between text-xs">
                      <div>
                        <span className="font-semibold text-neutral-800 block">Mandatory Human Gating</span>
                        <span className="text-[10px] text-neutral-500">Require buyer/merchant 1-click confirmation before debit</span>
                      </div>
                      <button
                        type="button"
                        onClick={() => updateGuardrailPolicy({ requireHumanGateAboveCap: !guardrailPolicy.requireHumanGateAboveCap })}
                        className={`w-11 h-6 rounded-full transition-colors relative cursor-pointer ${
                          guardrailPolicy.requireHumanGateAboveCap ? 'bg-black' : 'bg-neutral-300'
                        }`}
                      >
                        <span className={`absolute top-1 left-1 bg-white w-4 h-4 rounded-full transition-transform ${
                          guardrailPolicy.requireHumanGateAboveCap ? 'translate-x-5' : 'translate-x-0'
                        }`} />
                      </button>
                    </div>
                  </div>

                  <div className="flex items-center justify-between text-[11px] pt-1">
                    <span className="text-neutral-500">Audit Rule Verification:</span>
                    <button
                      type="button"
                      onClick={onOpenAuditTrail}
                      className="text-[#a83900] hover:text-black font-semibold uppercase tracking-wider text-[10px] flex items-center gap-1 cursor-pointer"
                    >
                      <span>Inspect Audit Trail</span>
                      <ChevronRight className="w-3 h-3" />
                    </button>
                  </div>
                </div>

                {/* Autonomous Resilience Controls */}
                <div className="bg-white border border-[#e4e2dd] rounded-2xl p-6 space-y-4 shadow-xs">
                  <div className="flex items-center space-x-2">
                    <Sliders className="w-4 h-4 text-[#a83900]" />
                    <h3 className="font-bold text-base text-black">Resilience & Failure Scenario Controls</h3>
                  </div>
                  <p className="text-xs text-neutral-600 leading-relaxed font-light">
                    Activate dynamic scenarios to evaluate how LUXORA AI handles pricing volatility or inventory depletion gracefully.
                  </p>
                  
                  <div className="space-y-3 pt-1 text-xs">
                    <label className="flex items-start gap-3 p-3 bg-[#fbf9f4] border border-black/5 rounded-xl cursor-pointer hover:bg-neutral-100 transition-colors">
                      <input 
                        type="checkbox" 
                        checked={isSimulatedPriceChangeActive} 
                        onChange={(e) => setSimulatedPriceChangeActive(e.target.checked)}
                        className="mt-0.5 rounded border-neutral-300 accent-black cursor-pointer"
                      />
                      <div>
                        <span className="font-bold text-black block">Price Volatility Resilience Scenario (₹ INR)</span>
                        <span className="text-[11px] text-neutral-500">Atelier price changes during checkout. AI halts charge and requests patron approval for delta.</span>
                      </div>
                    </label>

                    <label className="flex items-start gap-3 p-3 bg-[#fbf9f4] border border-black/5 rounded-xl cursor-pointer hover:bg-neutral-100 transition-colors">
                      <input 
                        type="checkbox" 
                        checked={isSimulatedOutOfStockActive} 
                        onChange={(e) => setSimulatedOutOfStockActive(e.target.checked)}
                        className="mt-0.5 rounded border-neutral-300 accent-black cursor-pointer"
                      />
                      <div>
                        <span className="font-bold text-black block">Inventory Depletion Resilience Scenario</span>
                        <span className="text-[11px] text-neutral-500">Stock drops to 0 during checkout. AI preserves cart and offers matching in-stock alternative.</span>
                      </div>
                    </label>
                  </div>
                </div>

              </div>

            </div>
          </div>
        )}

        {/* TAB 2: MARKETING CAMPAIGNS TAB */}
        {activeTab === 'campaigns' && (
          <div className="space-y-8 animate-fade-in font-['Archivo_Narrow']">
            <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 border-b border-[#e4e2dd] pb-6">
              <div>
                <h1 className="text-3xl font-bold tracking-tight text-black font-sans">
                  Growth & VIP Marketing Campaigns
                </h1>
                <p className="text-sm text-[#444748] mt-1 font-light">
                  AI-driven dispatch for high-intent customer re-engagement. Any campaign launched here is immediately broadcast to the buyer storefront.
                </p>
              </div>

              <button
                onClick={() => setIsNewCampaignOpen(true)}
                className="px-4 py-2.5 bg-black hover:bg-[#a83900] text-white text-xs font-bold uppercase tracking-wider rounded-xl transition-all flex items-center gap-1.5 cursor-pointer shadow-xs"
              >
                <Plus className="w-4 h-4" />
                <span>Create New Campaign</span>
              </button>
            </div>

            {/* Campaigns Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {campaigns.map((camp) => (
                <div 
                  key={camp.id} 
                  className="bg-white border border-[#e4e2dd] rounded-2xl p-6 flex flex-col justify-between space-y-4 hover:shadow-md transition-all shadow-xs"
                >
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-mono uppercase bg-[#f0eee9] px-2.5 py-0.5 rounded-full text-neutral-800 font-bold">
                        {camp.targetAudience}
                      </span>
                      <span className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full uppercase ${
                        camp.status === 'launched' || camp.status === 'approved' 
                          ? 'bg-emerald-100 text-emerald-800 border border-emerald-300' 
                          : 'bg-amber-100 text-amber-800 border border-amber-300'
                      }`}>
                        {camp.status}
                      </span>
                    </div>

                    <h3 className="font-bold text-base text-black leading-snug">{camp.title}</h3>
                    <p className="text-xs text-neutral-600 font-light leading-relaxed">{camp.emailPreview || camp.opportunity}</p>

                    {camp.promoCode && (
                      <div className="p-2.5 bg-[#fbf9f4] border border-black/10 rounded-xl flex items-center justify-between text-xs">
                        <span className="text-neutral-500 font-medium">Promo Code:</span>
                        <span className="font-mono font-bold text-[#a83900] bg-white px-2 py-0.5 rounded border border-black/10">{camp.promoCode}</span>
                      </div>
                    )}
                  </div>

                  <div className="pt-4 border-t border-[#e4e2dd] flex items-center justify-between">
                    <div>
                      <span className="text-[10px] uppercase font-bold text-neutral-400 block">Projected Revenue</span>
                      <span className="text-xs font-mono font-bold text-black">
                        ₹{(camp.projectedRevenueINR || 450000).toLocaleString('en-IN')}
                      </span>
                    </div>

                    <button
                      onClick={() => launchCampaign(camp.id)}
                      className={`px-3.5 py-1.5 text-xs font-bold uppercase tracking-wider rounded-xl transition-colors cursor-pointer ${
                        camp.status === 'launched'
                          ? 'bg-neutral-900 text-white'
                          : 'bg-black text-white hover:bg-[#a83900]'
                      }`}
                    >
                      {camp.status === 'launched' ? 'Active & Live' : 'Launch Campaign'}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* TAB 3: LIVE STORE ORDERS (Full customer detail synchronization) */}
        {activeTab === 'orders' && (
          <div className="space-y-8 animate-fade-in font-['Archivo_Narrow']">
            <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 border-b border-[#e4e2dd] pb-6">
              <div>
                <h1 className="text-3xl font-bold tracking-tight text-black font-sans">
                  Store Orders & Client Transactions
                </h1>
                <p className="text-sm text-[#444748] mt-1 font-light">
                  Live purchases placed in the Buyer Storefront are recorded in real-time with full patron identity, acquired piece details, and transaction totals.
                </p>
              </div>
              <span className="text-xs font-mono font-bold bg-[#f0eee9] px-3.5 py-1.5 rounded-full text-black">
                {orders.length} Verified Orders
              </span>
            </div>

            <div className="space-y-4">
              {orders.map((ord) => (
                <div 
                  key={ord.id}
                  className="p-5 bg-white border border-black/10 rounded-2xl shadow-xs hover:shadow-sm transition-all space-y-4"
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-black/5 pb-3">
                    <div className="flex items-center gap-2.5">
                      <span className="font-mono font-bold text-sm text-black">
                        #{ord.orderNumber}
                      </span>
                      <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-emerald-100 text-emerald-800 border border-emerald-300">
                        {ord.paymentStatus || 'Paid'} via {ord.paymentMethod}
                      </span>
                      <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                        ord.status === 'Delivered' 
                          ? 'bg-blue-100 text-blue-800' 
                          : ord.status === 'Shipped' 
                            ? 'bg-purple-100 text-purple-800' 
                            : 'bg-amber-100 text-amber-800'
                      }`}>
                        Status: {ord.status || 'Confirmed'}
                      </span>
                    </div>

                    <div className="text-xs text-neutral-500 font-mono flex items-center gap-1">
                      <Clock className="w-3.5 h-3.5" />
                      <span>{new Date(ord.createdAt).toLocaleDateString('en-IN', { month: 'short', day: 'numeric', year: 'numeric' })} • {new Date(ord.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                    </div>
                  </div>

                  {/* Customer / Patron Detail */}
                  <div className="grid sm:grid-cols-2 gap-2 text-xs">
                    <div>
                      <span className="text-[10px] uppercase font-bold text-neutral-400 block">Patron Identification</span>
                      <p className="font-semibold text-black">{ord.buyerName}</p>
                      <p className="text-neutral-500 font-mono text-[11px]">{ord.buyerEmail} • {ord.buyerPhone}</p>
                    </div>
                    <div>
                      <span className="text-[10px] uppercase font-bold text-neutral-400 block">Payment Gateway Reference</span>
                      <p className="font-mono text-neutral-700 text-[11px] truncate">{ord.razorpayPaymentId || 'pay_razorpay_verified'}</p>
                      <p className="text-[11px] text-emerald-700 font-semibold mt-0.5">Complimentary White Glove Courier Included</p>
                    </div>
                  </div>

                  {/* Line Items */}
                  <div className="space-y-2 pt-2 border-t border-black/5">
                    <span className="text-[10px] uppercase font-bold text-neutral-400 block">Acquired Luxury Pieces ({ord.items.length})</span>
                    <div className="divide-y divide-black/5">
                      {ord.items.map((item, itemIdx) => {
                        const productMatch = catalog.find(p => p.id === item.productId);
                        return (
                          <div key={itemIdx} className="py-2 flex items-center justify-between gap-3">
                            <div className="flex items-center gap-3">
                              <img 
                                src={productMatch?.images?.[0] || productMatch?.imageUrl || 'https://images.unsplash.com/photo-1539109136881-3be0616acf4b?auto=format&fit=crop&q=80&w=800'} 
                                alt={item.productName}
                                className="w-10 h-12 object-cover rounded-lg bg-neutral-100"
                                referrerPolicy="no-referrer"
                              />
                              <div>
                                <h4 className="font-bold text-xs text-black">{item.productName}</h4>
                                <p className="text-[11px] text-neutral-500 font-mono">
                                  Size: {item.size} • Color: {item.color} • Qty: {item.quantity}
                                </p>
                              </div>
                            </div>
                            <span className="font-bold text-xs text-black font-mono">
                              ₹{(item.priceINR * item.quantity).toLocaleString('en-IN')}
                            </span>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  {/* Total Amount */}
                  <div className="flex items-center justify-between pt-3 border-t border-black/10">
                    <span className="text-xs text-neutral-500">Order verified by LUXORA Cryptographic Framework</span>
                    <div className="text-right">
                      <span className="text-[10px] uppercase font-bold text-neutral-400 block">Total Transaction Value</span>
                      <span className="text-base font-bold text-[#fc6018] font-mono">
                        ₹{(ord.totalINR || 0).toLocaleString('en-IN')}
                      </span>
                    </div>
                  </div>

                </div>
              ))}
            </div>
          </div>
        )}

        {/* TAB 4: CATALOG MANAGEMENT TAB */}
        {activeTab === 'catalog' && (
          <div className="space-y-8 animate-fade-in font-['Archivo_Narrow']">
            <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 border-b border-[#e4e2dd] pb-6">
              <div>
                <h1 className="text-3xl font-bold tracking-tight text-black font-sans">
                  Catalog Graph & Ingestion
                </h1>
                <p className="text-sm text-[#444748] mt-1 font-light">
                  Raw inventory ingestion, automated semantic structuring, and AI readiness scoring.
                </p>
              </div>
            </div>

            {/* Ingestion Area */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              
              {/* CSV Upload Form */}
              <div className="lg:col-span-1 bg-white border border-[#e4e2dd] rounded-2xl p-6 space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="font-bold text-sm text-black flex items-center gap-1.5">
                    <FileSpreadsheet className="w-4 h-4 text-[#a83900]" />
                    <span>Upload Raw CSV / Data</span>
                  </h3>
                  <button
                    type="button"
                    onClick={() => setRawTextInput(SAMPLE_CSV)}
                    className="text-[11px] text-[#a83900] hover:underline font-mono"
                  >
                    Load Sample
                  </button>
                </div>

                <form onSubmit={handleUploadRawData} className="space-y-3">
                  <textarea
                    rows={6}
                    value={rawTextInput}
                    onChange={(e) => setRawTextInput(e.target.value)}
                    placeholder="Paste CSV with SKU, Name, Category, Price, Composition..."
                    className="w-full text-xs font-mono bg-[#fbf9f4] border border-[#e4e2dd] rounded-lg p-3 focus:outline-none focus:border-black"
                  />

                  <button
                    type="submit"
                    disabled={isUploading || !rawTextInput.trim()}
                    className="w-full py-2.5 bg-black text-white text-xs uppercase tracking-wider font-semibold rounded-full hover:bg-[#a83900] transition-colors disabled:opacity-40"
                  >
                    {isUploading ? 'Ingesting Batch...' : 'Parse & Score Batch'}
                  </button>
                </form>
              </div>

              {/* Batches Table */}
              <div className="lg:col-span-2 bg-white border border-[#e4e2dd] rounded-2xl p-6 space-y-4">
                <h3 className="font-bold text-sm text-black">
                  Processed Inventory Batches ({rawBatches.length})
                </h3>

                <div className="space-y-3">
                  {rawBatches.map((batch) => (
                    <div 
                      key={batch.id}
                      className={`p-4 rounded-xl border transition-all ${
                        selectedBatch?.id === batch.id 
                          ? 'border-black bg-[#fbf9f4]' 
                          : 'border-[#e4e2dd] bg-white hover:border-neutral-400'
                      }`}
                    >
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="font-semibold text-xs text-neutral-900">{batch.name}</span>
                            <span className={`px-2 py-0.5 text-[10px] rounded font-mono uppercase font-bold ${
                              batch.readinessScore > 80 ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'
                            }`}>
                              Score: {batch.readinessScore}%
                            </span>
                          </div>
                          <p className="text-[11px] text-neutral-500 mt-0.5">
                            {batch.totalParsed} items • Ingested {new Date(batch.uploadedAt).toLocaleTimeString()}
                          </p>
                        </div>

                        <div className="flex items-center gap-2">
                          {batch.readinessScore < 90 && (
                            <button
                              onClick={() => handleFixWithAi(batch.id)}
                              disabled={isUploading}
                              className="px-3 py-1.5 bg-amber-50 text-amber-800 border border-amber-300 rounded-full text-xs font-semibold hover:bg-amber-100 flex items-center gap-1 cursor-pointer"
                            >
                              <Sparkles className="w-3 h-3 text-amber-600" />
                              <span>Fix with AI</span>
                            </button>
                          )}
                          <button
                            onClick={() => syncBatchToAgent(batch.id)}
                            className="px-3 py-1.5 bg-black text-white rounded-full text-xs font-semibold hover:bg-[#a83900] flex items-center gap-1 cursor-pointer"
                          >
                            <Check className="w-3 h-3" />
                            <span>Sync to Live Store</span>
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

            </div>

            {/* Live Catalog Table in INR with Real-time Stock & Item Management */}
            <div className="bg-white border border-[#e4e2dd] rounded-2xl p-6 space-y-5 shadow-xs">
              
              {/* Sync Toast Notification */}
              {syncToastMessage && (
                <div className="p-3.5 bg-emerald-50 border border-emerald-300 rounded-xl text-emerald-900 text-xs font-semibold flex items-center justify-between animate-fade-in shadow-xs">
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                    <span>{syncToastMessage}</span>
                  </div>
                  <span className="text-[10px] font-mono uppercase bg-emerald-200 text-emerald-900 px-2 py-0.5 rounded font-bold">
                    Live Synced
                  </span>
                </div>
              )}

              {/* Table Header with Stats & Actions */}
              <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 border-b border-[#e4e2dd] pb-4">
                <div>
                  <h3 className="font-bold text-base text-black flex items-center gap-2">
                    <Package className="w-4 h-4 text-[#a83900]" />
                    <span>Active Live Catalog & Storefront Controller ({catalog.length} Total Pieces)</span>
                  </h3>
                  <p className="text-xs text-neutral-500 mt-0.5">
                    Any modification to prices, stocks, or item attributes in this portal immediately reflects across the Buyer Storefront dress cards and checkout.
                  </p>
                </div>
                
                <div className="flex items-center gap-2 flex-wrap">
                  <button
                    type="button"
                    onClick={() => setIsAddProductOpen(true)}
                    className="px-4 py-2 bg-black hover:bg-[#D9531E] text-white text-xs font-bold uppercase tracking-wider rounded-xl transition-all flex items-center gap-1.5 shadow-sm cursor-pointer"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Add New Piece</span>
                  </button>

                  <button
                    type="button"
                    onClick={handleResetCatalog}
                    className="px-3.5 py-2 bg-neutral-100 hover:bg-neutral-200 text-neutral-700 text-xs font-bold uppercase tracking-wider rounded-xl transition-all flex items-center gap-1.5 border border-neutral-300 cursor-pointer"
                    title="Reset catalog back to factory defaults"
                  >
                    <RotateCcw className="w-3.5 h-3.5" />
                    <span>Reset Defaults</span>
                  </button>
                </div>
              </div>

              {/* Search & Category Filter Controls */}
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 bg-[#fbf9f4] p-3 rounded-xl border border-black/5">
                <div className="relative flex-1">
                  <Search className="w-4 h-4 text-neutral-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    value={catalogSearch}
                    onChange={(e) => setCatalogSearch(e.target.value)}
                    placeholder="Search by piece name, SKU, or category..."
                    className="w-full pl-9 pr-4 py-2 bg-white rounded-lg border border-neutral-300 text-xs font-medium text-black placeholder-neutral-400 focus:outline-none focus:border-black"
                  />
                  {catalogSearch && (
                    <button
                      onClick={() => setCatalogSearch('')}
                      className="absolute right-2.5 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-black text-xs font-bold"
                    >
                      ×
                    </button>
                  )}
                </div>

                <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0">
                  <span className="text-[11px] font-bold text-neutral-500 uppercase tracking-wider pl-1 pr-1 flex items-center gap-1">
                    <Filter className="w-3 h-3" />
                    <span>Filter:</span>
                  </span>
                  {['ALL', 'Dresses', 'Jewelry', 'Footwear', 'Outerwear', 'Knitwear', 'Accessories'].map((cat) => (
                    <button
                      key={cat}
                      type="button"
                      onClick={() => setCatalogCategoryFilter(cat)}
                      className={`px-2.5 py-1 rounded-lg text-xs font-semibold whitespace-nowrap transition-all cursor-pointer ${
                        catalogCategoryFilter.toLowerCase() === cat.toLowerCase()
                          ? 'bg-black text-white'
                          : 'bg-white text-neutral-600 hover:text-black border border-neutral-200'
                      }`}
                    >
                      {cat}
                    </button>
                  ))}
                </div>
              </div>

              {/* Catalog Items Table */}
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead>
                    <tr className="border-b border-[#e4e2dd] text-[#444748] uppercase tracking-wider font-mono">
                      <th className="pb-3 font-semibold">SKU / Item Details</th>
                      <th className="pb-3 font-semibold">Category</th>
                      <th className="pb-3 font-semibold">Price (INR)</th>
                      <th className="pb-3 font-semibold">Live Stock Count</th>
                      <th className="pb-3 font-semibold">Inventory Status</th>
                      <th className="pb-3 font-semibold text-right">Actions & Controls</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#e4e2dd]/60">
                    {filteredCatalog.length === 0 ? (
                      <tr>
                        <td colSpan={6} className="py-8 text-center text-neutral-500 italic">
                          No atelier catalog pieces match the current search or category filter.
                        </td>
                      </tr>
                    ) : (
                      filteredCatalog.map((prod) => {
                        const currentStock = prod.stock ?? 10;
                        const isOutOfStock = currentStock <= 0;
                        const isLowStock = currentStock === 1;

                        return (
                          <tr key={prod.id} className="hover:bg-[#fbf9f4] transition-colors">
                            <td className="py-3.5 pr-4 flex items-center gap-3">
                              <img 
                                src={prod.images?.[0] || prod.imageUrl || ''} 
                                alt={prod.name} 
                                className={`w-11 h-14 object-cover rounded-lg border transition-all ${isOutOfStock ? 'grayscale opacity-60' : 'border-neutral-200'}`} 
                                referrerPolicy="no-referrer" 
                              />
                              <div className="min-w-0">
                                <p className="font-bold text-neutral-900 truncate max-w-xs">{prod.name}</p>
                                <p className="text-[10px] text-neutral-400 font-mono">
                                  {prod.sku || prod.id} • {prod.brand || 'LUXORA Atelier'}
                                </p>
                                <p className="text-[10px] text-neutral-500 line-clamp-1 italic mt-0.5">
                                  {prod.composition || 'Haute Couture Fabrication'}
                                </p>
                              </div>
                            </td>

                            <td className="py-3.5 text-neutral-700 capitalize font-mono text-[11px]">
                              <span className="px-2 py-0.5 bg-neutral-100 rounded-md">
                                {prod.category}
                              </span>
                            </td>

                            <td className="py-3.5 font-bold text-neutral-900 text-sm font-mono">
                              ₹{(prod.price || 0).toLocaleString('en-IN')}
                            </td>
                            
                            {/* Stock Count Editor (+ / - / direct input) */}
                            <td className="py-3.5">
                              <div className="flex items-center space-x-1.5">
                                <button
                                  type="button"
                                  onClick={() => updateProductStock(prod.id, Math.max(0, currentStock - 1))}
                                  className="w-7 h-7 rounded bg-neutral-100 hover:bg-neutral-200 text-neutral-800 font-bold flex items-center justify-center transition-colors cursor-pointer border border-neutral-300"
                                  title="Decrease stock by 1"
                                >
                                  -
                                </button>
                                <input
                                  type="number"
                                  min="0"
                                  max="999"
                                  value={currentStock}
                                  onChange={(e) => updateProductStock(prod.id, parseInt(e.target.value) || 0)}
                                  className="w-12 h-7 text-center font-mono font-bold text-xs bg-white border border-neutral-300 rounded focus:outline-none focus:border-black"
                                />
                                <button
                                  type="button"
                                  onClick={() => updateProductStock(prod.id, currentStock + 1)}
                                  className="w-7 h-7 rounded bg-neutral-100 hover:bg-neutral-200 text-neutral-800 font-bold flex items-center justify-center transition-colors cursor-pointer border border-neutral-300"
                                  title="Increase stock by 1"
                                >
                                  +
                                </button>
                              </div>
                            </td>

                            {/* Inventory Status Badge */}
                            <td className="py-3.5">
                              {isOutOfStock ? (
                                <span className="px-2.5 py-1 rounded-full font-mono text-[10px] font-bold bg-rose-100 text-rose-800 border border-rose-300 flex items-center gap-1 w-fit">
                                  <span className="w-1.5 h-1.5 rounded-full bg-rose-600"></span>
                                  Out of Stock (0)
                                </span>
                              ) : isLowStock ? (
                                <span className="px-2.5 py-1 rounded-full font-mono text-[10px] font-bold bg-amber-100 text-amber-900 border border-amber-300 flex items-center gap-1 w-fit">
                                  <span className="w-1.5 h-1.5 rounded-full bg-amber-600 animate-pulse"></span>
                                  Only 1 Left!
                                </span>
                              ) : (
                                <span className="px-2.5 py-1 rounded-full font-mono text-[10px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-300 flex items-center gap-1 w-fit">
                                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-600"></span>
                                  In Stock ({currentStock})
                                </span>
                              )}
                            </td>

                            {/* Quick Actions: Edit, Toggle Out of Stock, Delete */}
                            <td className="py-3.5 text-right">
                              <div className="flex items-center justify-end gap-1.5">
                                <button
                                  type="button"
                                  onClick={() => setEditingProduct({ ...prod })}
                                  className="p-1.5 bg-neutral-100 hover:bg-neutral-200 text-neutral-800 rounded-lg transition-colors cursor-pointer border border-neutral-200"
                                  title="Edit Piece Details (Price, SKU, Stock, Composition)"
                                >
                                  <Edit3 className="w-3.5 h-3.5" />
                                </button>

                                <button
                                  type="button"
                                  onClick={() => toggleProductOutOfStock(prod.id)}
                                  className={`px-2.5 py-1.5 rounded-lg text-[10px] font-bold uppercase tracking-wider transition-all cursor-pointer ${
                                    isOutOfStock
                                      ? 'bg-emerald-600 hover:bg-emerald-700 text-white shadow-xs'
                                      : 'bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200'
                                  }`}
                                >
                                  {isOutOfStock ? 'Set Stock (10)' : 'Mark OOS'}
                                </button>

                                {deleteConfirmProductId === prod.id ? (
                                  <div className="flex items-center gap-1">
                                    <button
                                      type="button"
                                      onClick={() => handleDeleteProduct(prod.id, prod.name)}
                                      className="px-2 py-1 bg-rose-600 hover:bg-rose-700 text-white rounded text-[10px] font-bold"
                                    >
                                      Confirm
                                    </button>
                                    <button
                                      type="button"
                                      onClick={() => setDeleteConfirmProductId(null)}
                                      className="px-1.5 py-1 bg-neutral-200 hover:bg-neutral-300 text-neutral-700 rounded text-[10px]"
                                    >
                                      Cancel
                                    </button>
                                  </div>
                                ) : (
                                  <button
                                    type="button"
                                    onClick={() => setDeleteConfirmProductId(prod.id)}
                                    className="p-1.5 hover:bg-rose-100 text-neutral-400 hover:text-rose-600 rounded-lg transition-colors cursor-pointer"
                                    title="Delete from Catalog"
                                  >
                                    <Trash2 className="w-3.5 h-3.5" />
                                  </button>
                                )}
                              </div>
                            </td>
                          </tr>
                        );
                      })
                    )}
                  </tbody>
                </table>
              </div>
            </div>

            {/* EDIT PRODUCT MODAL */}
            {editingProduct && (
              <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-fade-in font-['Archivo_Narrow']">
                <div className="bg-white w-full max-w-xl rounded-3xl shadow-2xl border border-black/10 max-h-[90vh] flex flex-col overflow-hidden">
                  <div className="p-6 bg-gradient-to-r from-neutral-900 to-neutral-800 text-white flex items-center justify-between">
                    <div>
                      <h3 className="text-lg font-bold">Edit Luxury Piece</h3>
                      <p className="text-xs text-neutral-300">
                        Editing <span className="text-amber-300 font-bold">{editingProduct.name}</span> ({editingProduct.sku || editingProduct.id})
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={() => setEditingProduct(null)}
                      className="p-2 text-neutral-400 hover:text-white transition-colors cursor-pointer"
                    >
                      <X className="w-5 h-5" />
                    </button>
                  </div>

                  <form onSubmit={handleSaveProductEdit} className="p-6 overflow-y-auto space-y-4 flex-1 text-xs">
                    <div className="space-y-1">
                      <label className="font-bold text-neutral-800 uppercase tracking-wider block">
                        Piece Title / Name
                      </label>
                      <input
                        type="text"
                        value={editingProduct.name}
                        onChange={(e) => setEditingProduct({ ...editingProduct, name: e.target.value })}
                        required
                        className="w-full px-3.5 py-2.5 rounded-xl border border-neutral-300 text-xs font-medium text-black focus:outline-none focus:border-black"
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <div className="space-y-1">
                        <label className="font-bold text-neutral-800 uppercase tracking-wider block">
                          Category
                        </label>
                        <select
                          value={editingProduct.category}
                          onChange={(e) => setEditingProduct({ ...editingProduct, category: e.target.value as any })}
                          className="w-full px-3.5 py-2.5 rounded-xl border border-neutral-300 text-xs font-medium text-black focus:outline-none focus:border-black bg-white"
                        >
                          <option value="Dresses">Dresses</option>
                          <option value="Jewelry">Jewelry</option>
                          <option value="Footwear">Footwear</option>
                          <option value="Outerwear">Outerwear</option>
                          <option value="Knitwear">Knitwear</option>
                          <option value="Accessories">Accessories</option>
                        </select>
                      </div>

                      <div className="space-y-1">
                        <label className="font-bold text-neutral-800 uppercase tracking-wider block">
                          SKU Identifier
                        </label>
                        <input
                          type="text"
                          value={editingProduct.sku || ''}
                          onChange={(e) => setEditingProduct({ ...editingProduct, sku: e.target.value })}
                          className="w-full px-3.5 py-2.5 rounded-xl border border-neutral-300 text-xs font-mono font-medium text-black focus:outline-none focus:border-black"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <div className="space-y-1">
                        <label className="font-bold text-neutral-800 uppercase tracking-wider block">
                          Price in INR (₹)
                        </label>
                        <input
                          type="number"
                          min="0"
                          value={editingProduct.price}
                          onChange={(e) => setEditingProduct({ ...editingProduct, price: Number(e.target.value) })}
                          required
                          className="w-full px-3.5 py-2.5 rounded-xl border border-neutral-300 text-xs font-mono font-bold text-black focus:outline-none focus:border-black"
                        />
                      </div>

                      <div className="space-y-1">
                        <label className="font-bold text-neutral-800 uppercase tracking-wider block">
                          Live Stock Count
                        </label>
                        <input
                          type="number"
                          min="0"
                          value={editingProduct.stock ?? 10}
                          onChange={(e) => setEditingProduct({ ...editingProduct, stock: Number(e.target.value) })}
                          required
                          className="w-full px-3.5 py-2.5 rounded-xl border border-neutral-300 text-xs font-mono font-bold text-black focus:outline-none focus:border-black"
                        />
                      </div>
                    </div>

                    <div className="space-y-1">
                      <label className="font-bold text-neutral-800 uppercase tracking-wider block">
                        Image URL
                      </label>
                      <input
                        type="url"
                        value={editingProduct.imageUrl || (editingProduct.images && editingProduct.images[0]) || ''}
                        onChange={(e) => setEditingProduct({ ...editingProduct, imageUrl: e.target.value })}
                        className="w-full px-3.5 py-2.5 rounded-xl border border-neutral-300 text-xs font-medium text-black focus:outline-none focus:border-black"
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="font-bold text-neutral-800 uppercase tracking-wider block">
                        Composition / Material
                      </label>
                      <input
                        type="text"
                        value={editingProduct.composition || ''}
                        onChange={(e) => setEditingProduct({ ...editingProduct, composition: e.target.value })}
                        className="w-full px-3.5 py-2.5 rounded-xl border border-neutral-300 text-xs font-medium text-black focus:outline-none focus:border-black"
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="font-bold text-neutral-800 uppercase tracking-wider block">
                        Editorial Description
                      </label>
                      <textarea
                        rows={3}
                        value={editingProduct.description || ''}
                        onChange={(e) => setEditingProduct({ ...editingProduct, description: e.target.value })}
                        className="w-full px-3.5 py-2.5 rounded-xl border border-neutral-300 text-xs font-medium text-black focus:outline-none focus:border-black"
                      />
                    </div>

                    <div className="flex items-center justify-end gap-3 pt-4 border-t border-neutral-200">
                      <button
                        type="button"
                        onClick={() => setEditingProduct(null)}
                        className="px-4 py-2.5 text-neutral-600 hover:text-black font-bold uppercase tracking-wider"
                      >
                        Cancel
                      </button>
                      <button
                        type="submit"
                        className="px-6 py-2.5 bg-black hover:bg-[#D9531E] text-white rounded-xl font-bold uppercase tracking-wider transition-all shadow-md"
                      >
                        Save & Sync to Storefront
                      </button>
                    </div>
                  </form>
                </div>
              </div>
            )}

            {/* ADD NEW PRODUCT MODAL */}
            {isAddProductOpen && (
              <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-fade-in font-['Archivo_Narrow']">
                <div className="bg-white w-full max-w-xl rounded-3xl shadow-2xl border border-black/10 max-h-[90vh] flex flex-col overflow-hidden">
                  <div className="p-6 bg-gradient-to-r from-neutral-900 to-neutral-800 text-white flex items-center justify-between">
                    <div>
                      <h3 className="text-lg font-bold">Add New Haute Couture Piece</h3>
                      <p className="text-xs text-neutral-300">
                        Create and publish a new luxury item directly to the live buyer storefront
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={() => setIsAddProductOpen(false)}
                      className="p-2 text-neutral-400 hover:text-white transition-colors cursor-pointer"
                    >
                      <X className="w-5 h-5" />
                    </button>
                  </div>

                  <form onSubmit={handleCreateNewProduct} className="p-6 overflow-y-auto space-y-4 flex-1 text-xs">
                    <div className="space-y-1">
                      <label className="font-bold text-neutral-800 uppercase tracking-wider block">
                        Piece Title / Name *
                      </label>
                      <input
                        type="text"
                        value={newProdName}
                        onChange={(e) => setNewProdName(e.target.value)}
                        placeholder="e.g. Sculptural Crêpe Evening Cape"
                        required
                        className="w-full px-3.5 py-2.5 rounded-xl border border-neutral-300 text-xs font-medium text-black focus:outline-none focus:border-black"
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <div className="space-y-1">
                        <label className="font-bold text-neutral-800 uppercase tracking-wider block">
                          Category *
                        </label>
                        <select
                          value={newProdCategory}
                          onChange={(e) => setNewProdCategory(e.target.value as any)}
                          className="w-full px-3.5 py-2.5 rounded-xl border border-neutral-300 text-xs font-medium text-black focus:outline-none focus:border-black bg-white"
                        >
                          <option value="Dresses">Dresses</option>
                          <option value="Jewelry">Jewelry</option>
                          <option value="Footwear">Footwear</option>
                          <option value="Outerwear">Outerwear</option>
                          <option value="Knitwear">Knitwear</option>
                          <option value="Accessories">Accessories</option>
                        </select>
                      </div>

                      <div className="space-y-1">
                        <label className="font-bold text-neutral-800 uppercase tracking-wider block">
                          SKU Identifier
                        </label>
                        <input
                          type="text"
                          value={newProdSku}
                          onChange={(e) => setNewProdSku(e.target.value)}
                          placeholder="e.g. LX-DR-099"
                          className="w-full px-3.5 py-2.5 rounded-xl border border-neutral-300 text-xs font-mono font-medium text-black focus:outline-none focus:border-black"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <div className="space-y-1">
                        <label className="font-bold text-neutral-800 uppercase tracking-wider block">
                          Price in INR (₹) *
                        </label>
                        <input
                          type="number"
                          min="1000"
                          value={newProdPrice}
                          onChange={(e) => setNewProdPrice(Number(e.target.value))}
                          required
                          className="w-full px-3.5 py-2.5 rounded-xl border border-neutral-300 text-xs font-mono font-bold text-black focus:outline-none focus:border-black"
                        />
                      </div>

                      <div className="space-y-1">
                        <label className="font-bold text-neutral-800 uppercase tracking-wider block">
                          Initial Stock Count *
                        </label>
                        <input
                          type="number"
                          min="0"
                          value={newProdStock}
                          onChange={(e) => setNewProdStock(Number(e.target.value))}
                          required
                          className="w-full px-3.5 py-2.5 rounded-xl border border-neutral-300 text-xs font-mono font-bold text-black focus:outline-none focus:border-black"
                        />
                      </div>
                    </div>

                    <div className="space-y-1">
                      <label className="font-bold text-neutral-800 uppercase tracking-wider block">
                        High-Res Image URL
                      </label>
                      <input
                        type="url"
                        value={newProdImage}
                        onChange={(e) => setNewProdImage(e.target.value)}
                        placeholder="https://images.unsplash.com/..."
                        className="w-full px-3.5 py-2.5 rounded-xl border border-neutral-300 text-xs font-medium text-black focus:outline-none focus:border-black"
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="font-bold text-neutral-800 uppercase tracking-wider block">
                        Composition / Fabrication
                      </label>
                      <input
                        type="text"
                        value={newProdComposition}
                        onChange={(e) => setNewProdComposition(e.target.value)}
                        placeholder="e.g. 100% Organic Silk Failled"
                        className="w-full px-3.5 py-2.5 rounded-xl border border-neutral-300 text-xs font-medium text-black focus:outline-none focus:border-black"
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="font-bold text-neutral-800 uppercase tracking-wider block">
                        Product Description
                      </label>
                      <textarea
                        rows={3}
                        value={newProdDesc}
                        onChange={(e) => setNewProdDesc(e.target.value)}
                        placeholder="Describe garment silhouettes, draping, and artisanal construction..."
                        className="w-full px-3.5 py-2.5 rounded-xl border border-neutral-300 text-xs font-medium text-black focus:outline-none focus:border-black"
                      />
                    </div>

                    <div className="flex items-center justify-end gap-3 pt-4 border-t border-neutral-200">
                      <button
                        type="button"
                        onClick={() => setIsAddProductOpen(false)}
                        className="px-4 py-2.5 text-neutral-600 hover:text-black font-bold uppercase tracking-wider"
                      >
                        Cancel
                      </button>
                      <button
                        type="submit"
                        className="px-6 py-2.5 bg-black hover:bg-[#D9531E] text-white rounded-xl font-bold uppercase tracking-wider transition-all shadow-md"
                      >
                        Publish to Live Storefront
                      </button>
                    </div>
                  </form>
                </div>
              </div>
            )}

          </div>
        )}

        {/* TAB 5: GROWTH STRATEGIES */}
        {activeTab === 'growth' && (
          <div className="space-y-8 animate-fade-in font-['Archivo_Narrow']">
            <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 border-b border-[#e4e2dd] pb-6">
              <div>
                <h1 className="text-3xl font-bold tracking-tight text-black font-sans">
                  Autonomous Growth Strategies
                </h1>
                <p className="text-sm text-[#444748] mt-1 font-light">
                  One-click execution of high-margin AI recommendations and merchandising playbooks.
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-white border border-[#e4e2dd] rounded-2xl p-6 space-y-4 shadow-xs">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-800 bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200">
                    +33.2% Projected AOV Lift
                  </span>
                  <Zap className="w-4 h-4 text-[#a83900]" />
                </div>
                <h3 className="font-bold text-lg text-black">Automated Cross-Sell Accessory Bundling</h3>
                <p className="text-xs text-neutral-600 font-light leading-relaxed">
                  Automatically pairs high-margin jewellery and leather goods with evening dresses in the buyer cart drawer.
                </p>
                <button
                  onClick={() => handleApplyStrategy('strat-01', 'Accessory Bundling Playbook', '+33.2% AOV')}
                  className={`w-full py-2.5 rounded-xl text-xs font-bold uppercase tracking-wider transition-all cursor-pointer ${
                    appliedStrategies['strat-01'] 
                      ? 'bg-neutral-900 text-white' 
                      : 'bg-black text-white hover:bg-[#a83900]'
                  }`}
                >
                  {appliedStrategies['strat-01'] ? 'Strategy Active & Deployed' : 'Deploy Strategy'}
                </button>
              </div>

              <div className="bg-white border border-[#e4e2dd] rounded-2xl p-6 space-y-4 shadow-xs">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-purple-800 bg-purple-50 px-2.5 py-0.5 rounded-full border border-purple-200">
                    +18.5% Checkout Recovery
                  </span>
                  <Zap className="w-4 h-4 text-[#a83900]" />
                </div>
                <h3 className="font-bold text-lg text-black">Fast-Track Razorpay VIP Flow</h3>
                <p className="text-xs text-neutral-600 font-light leading-relaxed">
                  Enables 1-click Razorpay test sandbox checkout with instant pre-filled white-glove shipping.
                </p>
                <button
                  onClick={() => handleApplyStrategy('strat-02', 'Fast-Track Razorpay Flow', '+18.5% Recovery')}
                  className={`w-full py-2.5 rounded-xl text-xs font-bold uppercase tracking-wider transition-all cursor-pointer ${
                    appliedStrategies['strat-02'] 
                      ? 'bg-neutral-900 text-white' 
                      : 'bg-black text-white hover:bg-[#a83900]'
                  }`}
                >
                  {appliedStrategies['strat-02'] ? 'Strategy Active & Deployed' : 'Deploy Strategy'}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* TAB 6: PATRON ACTIVITY & EXCLUSIVE OFFERS ENGINE */}
        {activeTab === 'users' && (
          <UserActivityTracker 
            onSwitchToCampaignsTab={() => setActiveTab('campaigns')} 
          />
        )}

      </main>


      {/* CREATE NEW CAMPAIGN MODAL */}
      {isNewCampaignOpen && (
        <div 
          className="fixed inset-0 z-50 overflow-y-auto bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 font-['Archivo_Narrow']"
          onClick={() => setIsNewCampaignOpen(false)}
        >
          <div 
            className="relative w-full max-w-lg bg-[#fbf9f4] border border-black/15 rounded-3xl shadow-2xl overflow-hidden p-6 space-y-5"
            onClick={e => e.stopPropagation()}
          >
            <div className="flex items-center justify-between border-b border-black/10 pb-3">
              <div>
                <h3 className="font-bold text-lg text-black">Create Storefront Marketing Campaign</h3>
                <p className="text-xs text-neutral-500">Will immediately publish promotional privileges to the Buyer Storefront.</p>
              </div>
              <button onClick={() => setIsNewCampaignOpen(false)} className="p-1 hover:bg-neutral-200 rounded-full cursor-pointer">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateCustomCampaignSubmit} className="space-y-4 text-xs">
              <div>
                <label className="font-bold text-black block mb-1">Campaign Title</label>
                <input 
                  type="text" 
                  value={newCampTitle}
                  onChange={e => setNewCampTitle(e.target.value)}
                  placeholder="e.g. Festive Silk Capsule Vernissage" 
                  required
                  className="w-full p-2.5 bg-white border border-black/15 rounded-xl text-xs focus:outline-none focus:border-black font-semibold text-black"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-black block mb-1">Discount (%)</label>
                  <input 
                    type="number" 
                    value={newCampDiscount}
                    onChange={e => setNewCampDiscount(Number(e.target.value))}
                    min={1}
                    max={70}
                    className="w-full p-2.5 bg-white border border-black/15 rounded-xl text-xs focus:outline-none focus:border-black font-mono font-bold text-black"
                  />
                </div>
                <div>
                  <label className="font-bold text-black block mb-1">Promo Code</label>
                  <input 
                    type="text" 
                    value={newCampPromo}
                    onChange={e => setNewCampPromo(e.target.value.toUpperCase())}
                    placeholder="e.g. LUXORAVIP15" 
                    className="w-full p-2.5 bg-white border border-black/15 rounded-xl text-xs focus:outline-none focus:border-black font-mono font-bold text-[#a83900]"
                  />
                </div>
              </div>

              <div>
                <label className="font-bold text-black block mb-1">Storefront Announcement Banner</label>
                <input 
                  type="text" 
                  value={newCampBanner}
                  onChange={e => setNewCampBanner(e.target.value)}
                  placeholder="Banner text shown to buyers on top of catalog" 
                  className="w-full p-2.5 bg-white border border-black/15 rounded-xl text-xs focus:outline-none focus:border-black text-black"
                />
              </div>

              <div>
                <label className="font-bold text-black block mb-1">Target Audience</label>
                <input 
                  type="text" 
                  value={newCampAudience}
                  onChange={e => setNewCampAudience(e.target.value)}
                  className="w-full p-2.5 bg-white border border-black/15 rounded-xl text-xs focus:outline-none focus:border-black text-black"
                />
              </div>

              <div className="pt-3 border-t border-black/10 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsNewCampaignOpen(false)}
                  className="px-4 py-2 bg-neutral-100 hover:bg-neutral-200 text-black font-bold rounded-xl text-xs cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-black hover:bg-[#a83900] text-white font-bold uppercase tracking-wider rounded-xl text-xs cursor-pointer shadow-xs"
                >
                  Launch & Broadcast to Store
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Shared Footer */}
      <footer className="w-full py-8 border-t border-[#e4e2dd] bg-[#fbf9f4] text-[#444748]">
        <div className="flex flex-col md:flex-row justify-between items-center px-5 sm:px-8 md:px-16 max-w-[1440px] mx-auto gap-4 text-xs font-mono">
          <div className="font-bold text-black text-sm">LUXORA Business Intelligence Framework</div>
          <div className="flex gap-6">
            <button onClick={onOpenAuditTrail} className="hover:underline cursor-pointer">Security Audit Trail</button>
            <button onClick={onSignOutClick} className="hover:underline text-rose-700 cursor-pointer">Sign Out</button>
          </div>
          <div className="text-neutral-400">© 2026 LUXORA Haute Digital Atelier</div>
        </div>
      </footer>

    </div>
  );
};
