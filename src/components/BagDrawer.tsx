import React, { useState, useEffect, useMemo } from 'react';
import { 
  X, 
  Trash2, 
  Plus, 
  Minus, 
  ShoppingBag, 
  Gift, 
  ArrowRight, 
  Check, 
  Tag, 
  Sparkles, 
  Gem, 
  ArrowUpRight, 
  Info,
  Bookmark,
  Clock,
  RotateCcw,
  Bell,
  AlertCircle,
  CheckCircle2,
  Layers,
  Lock
} from 'lucide-react';
import { CartItem, Currency, Product } from '../types';
import { useMerchant } from '../context/MerchantContext';
import { useAuth } from '../context/AuthContext';
import { PRODUCTS } from '../data/products';
import { ExplainablePriceModal } from './ExplainablePriceModal';
import { 
  getFrequentlyBoughtTogetherAccessories, 
  FrequentlyBoughtTogetherData 
} from '../utils/frequentlyBoughtTogether';

interface BagDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  items?: CartItem[];
  cart?: CartItem[];
  currency?: Currency;
  onUpdateQuantity: (id: string, delta: number) => void;
  onRemoveItem: (id: string) => void;
  onAddToCart?: (product: Product, size: string, colorIndex?: number) => void;
  onProceedToCheckout?: (appliedDiscount: number, giftPackaging: boolean, giftMessage: string) => void;
  onRequireAuth?: () => void;
  onOpenUpsellCrossSell?: (baseProduct: Product) => void;
  onExploreCollection?: () => void;
  onSelectProduct?: (product: Product) => void;
}

export const BagDrawer: React.FC<BagDrawerProps> = ({
  isOpen,
  onClose,
  items: propItems,
  cart: propCart,
  onUpdateQuantity,
  onRemoveItem,
  onAddToCart,
  onProceedToCheckout,
  onRequireAuth,
  onOpenUpsellCrossSell,
  onExploreCollection,
  onSelectProduct,
}) => {
  const { user } = useAuth();
  const { 
    catalog, 
    activeCampaigns, 
    updateProductStock, 
    isSimulatedOutOfStockActive,
    recordUpsellEvent,
    recordCrossSellEvent,
    deactivatedPromoCodes
  } = useMerchant();
  const [giftPackaging, setGiftPackaging] = useState(false);
  const [giftMessage, setGiftMessage] = useState('');
  const [promoCode, setPromoCode] = useState('');
  const [discountPercent, setDiscountPercent] = useState(0);
  const [promoError, setPromoError] = useState('');
  const [promoSuccess, setPromoSuccess] = useState('');

  // Saved for Later state
  const [savedForLater, setSavedForLater] = useState<CartItem[]>(() => {
    try {
      const saved = localStorage.getItem('luxora_saved_for_later');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  const [restockNotice, setRestockNotice] = useState<string | null>(null);

  const items = propItems || propCart || [];

  // Helper to fetch live stock from merchant catalog
  const getProductStock = (productId: string, fallbackStock?: number) => {
    const liveProd = catalog.find((p) => p.id === productId || p.sku === productId);
    if (liveProd && typeof liveProd.stock === 'number') {
      return liveProd.stock;
    }
    return fallbackStock ?? 10;
  };

  // Check if item is out of stock in active cart
  const isItemOutOfStock = (item: CartItem) => {
    if (isSimulatedOutOfStockActive && items[0]?.id === item.id) {
      return true;
    }
    return getProductStock(item.product.id, item.product.stock) <= 0;
  };

  // Automatically move items from Saved for Later back to cart when inventory updates
  useEffect(() => {
    if (savedForLater.length === 0) return;

    const restockedItems: CartItem[] = [];
    const remainingItems: CartItem[] = [];

    savedForLater.forEach((saved) => {
      const currentStock = getProductStock(saved.product.id, saved.product.stock);
      if (currentStock > 0) {
        restockedItems.push({
          ...saved,
          product: catalog.find((p) => p.id === saved.product.id) || saved.product,
        });
      } else {
        remainingItems.push(saved);
      }
    });

    if (restockedItems.length > 0) {
      // Automatically add them back to cart
      restockedItems.forEach((restocked) => {
        if (onAddToCart) {
          onAddToCart(restocked.product, restocked.selectedSize, 0);
        }
      });

      setSavedForLater(remainingItems);
      try {
        localStorage.setItem('luxora_saved_for_later', JSON.stringify(remainingItems));
      } catch (err) {
        console.error('Error saving updated list', err);
      }

      const names = restockedItems.map((i) => i.product.name).join(', ');
      setRestockNotice(`Atelier Restock: ${names} is back in stock and has been automatically moved back to your Shopping Bag!`);
    }
  }, [catalog, onAddToCart, savedForLater]);

  const handleSaveForLater = (item: CartItem) => {
    onRemoveItem(item.id);
    setSavedForLater((prev) => {
      const exists = prev.some(
        (p) => p.product.id === item.product.id && p.selectedSize === item.selectedSize
      );
      const updated = exists ? prev : [...prev, item];
      try {
        localStorage.setItem('luxora_saved_for_later', JSON.stringify(updated));
      } catch (err) {
        console.error('Error saving to storage', err);
      }
      return updated;
    });
    setRestockNotice(`${item.product.name} saved for later. It will automatically return to your bag once restocked!`);
  };

  const handleRemoveSaved = (savedId: string) => {
    setSavedForLater((prev) => {
      const updated = prev.filter((i) => i.id !== savedId);
      try {
        localStorage.setItem('luxora_saved_for_later', JSON.stringify(updated));
      } catch (err) {
        console.error('Error saving to storage', err);
      }
      return updated;
    });
  };

  const handleMoveSavedToBag = (savedItem: CartItem) => {
    if (onAddToCart) {
      onAddToCart(savedItem.product, savedItem.selectedSize, 0);
    }
    handleRemoveSaved(savedItem.id);
  };

  const handleSimulateRestock = (productId: string) => {
    updateProductStock(productId, 8);
  };

  const subtotalINR = (items || []).reduce(
    (sum, item) => sum + (item?.product?.price || 0) * (item?.quantity || 1),
    0
  );
  const discountINR = (subtotalINR * (discountPercent || 0)) / 100;
  const totalINR = subtotalINR - discountINR;

  // In-cart items identification for personalized styling synergies
  const primaryItem = items.length > 0 ? items[items.length - 1] : null;
  const baseProduct = primaryItem?.product;
  const inCartProductIds = new Set(items.map((i) => i.product.id));

  // 1. Curated Haute Upgrade (Upsell): Higher value luxury silhouette in same category
  const upsellProduct = baseProduct
    ? (baseProduct.upsellProductId && !inCartProductIds.has(baseProduct.upsellProductId)
        ? catalog.find((p) => p.id === baseProduct.upsellProductId)
        : catalog.find(
            (p) =>
              p.id !== baseProduct.id &&
              !inCartProductIds.has(p.id) &&
              p.category === baseProduct.category &&
              p.price > baseProduct.price
          ) ||
          catalog.find(
            (p) =>
              p.id !== baseProduct.id &&
              !inCartProductIds.has(p.id) &&
              p.price > baseProduct.price
          ))
    : null;

  // 2. Curated Complementary Pairing (Cross-Sell): Matching jewelry, handbag, or outerwear
  const crossSellProduct = baseProduct
    ? (baseProduct.crossSellProductId && !inCartProductIds.has(baseProduct.crossSellProductId)
        ? catalog.find((p) => p.id === baseProduct.crossSellProductId)
        : catalog.find(
            (p) =>
              p.id !== baseProduct.id &&
              !inCartProductIds.has(p.id) &&
              p.category !== baseProduct.category
          ))
    : null;

  // Frequently Bought Together logic: suggests relevant accessories when specific luxury items are in cart
  const frequentlyBoughtData: FrequentlyBoughtTogetherData | null = useMemo(() => {
    return getFrequentlyBoughtTogetherAccessories(items, catalog);
  }, [items, catalog]);

  const [justAddedAccessoryId, setJustAddedAccessoryId] = useState<string | null>(null);
  const [bundleJustAdded, setBundleJustAdded] = useState<boolean>(false);

  const handleAddAccessoryToBag = (accessoryProduct: Product, role: string) => {
    if (!onAddToCart) return;
    const defaultSize = accessoryProduct.sizes?.[0] || 'One Size';
    onAddToCart(accessoryProduct, defaultSize, 0);
    setJustAddedAccessoryId(accessoryProduct.id);
    setTimeout(() => setJustAddedAccessoryId(null), 2000);
    recordCrossSellEvent(true, accessoryProduct.price, `Frequently Bought (${role}): ${accessoryProduct.name}`);
  };

  const handleAddAllFrequentlyBought = (data: FrequentlyBoughtTogetherData) => {
    if (!onAddToCart) return;
    data.accessories.forEach((acc) => {
      const defaultSize = acc.product.sizes?.[0] || 'One Size';
      onAddToCart(acc.product, defaultSize, 0);
      recordCrossSellEvent(true, acc.product.price, `Frequently Bought Bundle: ${acc.product.name}`);
    });
    setBundleJustAdded(true);
    setTimeout(() => setBundleJustAdded(false), 2500);
  };

  // Free shipping threshold (₹15,000 INR)
  const freeShippingThresholdINR = 15000;
  const progressPercent = Math.min(Math.round((subtotalINR / freeShippingThresholdINR) * 100), 100);

  const [showExplainableModal, setShowExplainableModal] = useState<boolean>(false);

  const handleApplyPromo = (e: React.FormEvent) => {
    e.preventDefault();
    setPromoError('');
    setPromoSuccess('');

    const cleanCode = promoCode.trim().toUpperCase();
    
    // Explicitly deactivated coupons check
    if (deactivatedPromoCodes?.some(dc => dc.toUpperCase() === cleanCode)) {
      setPromoError(`Privilege code "${cleanCode}" has been deactivated and is no longer valid.`);
      setDiscountPercent(0);
      return;
    }

    // Graceful Failure Recovery Scenario: Expired Promo Code
    if (cleanCode === 'EXPIRED20' || cleanCode === 'SUMMER2025' || cleanCode === 'VIPONLY') {
      setDiscountPercent(10);
      setPromoSuccess(`Graceful Recovery: "${cleanCode}" has expired, but LUXORA AI Concierge has auto-applied active privilege "VIPATELIER10" (10% off) for you!`);
      return;
    }

    // Check if matching any live business campaign
    const matchingCampaign = activeCampaigns?.find(
      c => c.promoCode && c.promoCode.toUpperCase() === cleanCode
    );

    if (matchingCampaign) {
      const disc = matchingCampaign.discountPercent || 15;
      setDiscountPercent(disc);
      setPromoSuccess(`${disc}% ${matchingCampaign.title || 'Exclusive'} campaign privilege applied.`);
      return;
    }

    if (cleanCode === 'VIPATELIER10' || cleanCode === 'LUXORA10' || cleanCode === 'WELCOME10') {
      setDiscountPercent(10);
      setPromoSuccess('10% Haute Couture VIP privilege applied.');
    } else if (cleanCode === 'ATELIER15' || cleanCode === 'LUXORA15' || cleanCode === 'ROYAL15' || cleanCode === 'FIRSTBUY') {
      setDiscountPercent(15);
      setPromoSuccess('15% Atelier Concierge privilege applied.');
    } else if (cleanCode === 'HAUTE20') {
      setDiscountPercent(20);
      setPromoSuccess('20% Atelier Silhouette privilege applied.');
    } else {
      const availableSuggestions = activeCampaigns?.filter(c => c.promoCode).map(c => c.promoCode).join(', ');
      setPromoError(`Invalid privilege code. Try active codes: ${availableSuggestions ? availableSuggestions + ', ' : ''}LUXORA10, LUXORA15, or expired code simulation (EXPIRED20).`);
    }
  };

  if (!isOpen) return null;

  return (
    <div
      id="bag-drawer-overlay"
      className="fixed inset-0 z-50 overflow-hidden bg-black/60 backdrop-blur-xs flex justify-end animate-fade-in font-['Archivo_Narrow']"
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-md bg-[#fbf9f4] h-full shadow-2xl flex flex-col justify-between border-l border-black/10"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Drawer Header */}
        <div className="p-5 border-b border-black/10 bg-[#fbf9f4]/95 backdrop-blur-md flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <ShoppingBag className="w-5 h-5 text-black" />
            <h2 className="text-xl font-bold text-black tracking-tight">
              Shopping Bag ({(items || []).reduce((s, i) => s + (i?.quantity || 1), 0)})
            </h2>
          </div>
          <button
            id="close-bag-btn"
            onClick={onClose}
            className="p-1.5 hover:bg-black hover:text-white rounded-full transition-colors border border-black/15 cursor-pointer"
            aria-label="Close"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Restock & Saved for Later Notification */}
        {restockNotice && (
          <div className="mx-5 mt-3 p-3 bg-emerald-50 border border-emerald-300 rounded-lg flex items-start justify-between gap-2 shadow-2xs animate-fade-in">
            <div className="flex items-start gap-2">
              <Sparkles className="w-4 h-4 text-emerald-600 mt-0.5 shrink-0" />
              <p className="text-xs font-semibold text-emerald-900 leading-snug">
                {restockNotice}
              </p>
            </div>
            <button
              onClick={() => setRestockNotice(null)}
              className="text-emerald-700 hover:text-emerald-950 p-0.5 cursor-pointer"
              aria-label="Dismiss notice"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        )}

        {/* Free Shipping Progress Indicator */}
        <div className="px-5 py-2.5 bg-[#f2efe9] border-b border-black/5 text-xs text-[#444748]">
          <div className="flex justify-between items-center mb-1 text-[11px] uppercase tracking-wider font-semibold">
            <span>
              {progressPercent >= 100
                ? 'Complimentary White-Glove Delivery Unlocked'
                : `Add ₹${Math.max(0, freeShippingThresholdINR - subtotalINR).toLocaleString('en-IN')} for Free White-Glove Delivery`}
            </span>
            <span className="font-bold text-black">{progressPercent}%</span>
          </div>
          <div className="w-full bg-neutral-300 h-1.5 rounded-full overflow-hidden">
            <div
              className="bg-[#fc6018] h-full transition-all duration-500 rounded-full"
              style={{ width: `${progressPercent}%` }}
            />
          </div>
        </div>

        {/* Items List */}
        <div className="flex-1 overflow-y-auto p-5 space-y-4 custom-scrollbar">
          {items.length === 0 && savedForLater.length === 0 ? (
            <div className="py-20 text-center text-[#444748] space-y-3">
              <ShoppingBag className="w-10 h-10 mx-auto text-neutral-300 stroke-1" />
              <p className="text-lg font-bold text-black">
                Your bag is currently empty
              </p>
              <p className="text-xs text-[#444748]">
                Explore our curated collection to select your first piece.
              </p>
              <button
                onClick={() => {
                  onClose();
                  if (onExploreCollection) onExploreCollection();
                }}
                className="px-6 py-2.5 bg-black text-white text-xs uppercase tracking-wider rounded font-bold hover:bg-[#474746] transition-colors cursor-pointer"
              >
                Discover Silhouettes
              </button>
            </div>
          ) : (
            <>
              {items.length === 0 && savedForLater.length > 0 && (
                <div className="py-6 text-center text-[#444748] bg-white border border-black/10 rounded-lg p-4 space-y-2">
                  <ShoppingBag className="w-6 h-6 mx-auto text-neutral-400 stroke-1" />
                  <p className="text-xs font-bold text-black">
                    Your active bag is empty
                  </p>
                  <p className="text-[11px] text-[#767777]">
                    You have pieces saved for later below that will auto-move back when restocked.
                  </p>
                </div>
              )}

              {items.map((item) => {
                const outOfStock = isItemOutOfStock(item);
                const liveStock = getProductStock(item.product.id, item.product.stock);

                return (
                  <div
                    key={item.id}
                    className={`p-3.5 bg-white border flex flex-col space-y-2.5 rounded-lg shadow-2xs transition-all ${
                      outOfStock ? 'border-amber-400/80 bg-amber-50/20' : 'border-black/10'
                    }`}
                  >
                    <div className="flex space-x-3.5 items-start">
                      <img
                        src={item.product?.images?.[0] || item.product?.imageUrl || ''}
                        alt={item.product?.name || 'Product'}
                        className="w-16 h-20 object-cover shrink-0 rounded-xs bg-[#eae8e3]"
                        referrerPolicy="no-referrer"
                      />

                      <div className="flex-1 min-w-0">
                        <div className="flex justify-between items-start">
                          <div>
                            <span className="text-[10px] uppercase tracking-widest text-[#444748] font-bold truncate block">
                              {item.product?.brand || item.product?.designer || 'LUXORA'}
                            </span>
                            <h4 className="text-[13px] font-bold text-black truncate">
                              {item.product?.name}
                            </h4>
                          </div>
                          <div className="flex items-center space-x-1">
                            <button
                              onClick={() => handleSaveForLater(item)}
                              className="text-neutral-400 hover:text-black p-1 cursor-pointer transition-colors"
                              title="Save for Later (Auto-return when restocked)"
                            >
                              <Bookmark className="w-3.5 h-3.5" />
                            </button>
                            <button
                              onClick={() => onRemoveItem(item.id)}
                              className="text-neutral-400 hover:text-red-600 p-1 cursor-pointer"
                              title="Remove item"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </div>

                        <div className="text-[11px] text-[#444748] space-x-2 my-1">
                          <span>Size: <strong className="text-black font-bold">{item.selectedSize}</strong></span>
                          <span>•</span>
                          <span>Color: <strong className="text-black">{typeof item.selectedColor === 'object' ? item.selectedColor?.name : item.selectedColor || item.product?.color || 'Standard'}</strong></span>
                        </div>

                        <div className="flex items-center justify-between pt-1">
                          {/* Quantity Selector with Delta Controls */}
                          <div className="flex items-center border border-black/20 rounded-xs bg-[#fbf9f4]">
                            <button
                              id={`bag-qty-minus-${item.id}`}
                              onClick={() => onUpdateQuantity(item.id, -1)}
                              className="px-2.5 py-1 text-[#444748] hover:bg-black/10 active:scale-90 transition-all cursor-pointer flex items-center justify-center"
                              title="Decrease quantity by 1"
                              aria-label="Decrease quantity"
                            >
                              <Minus className="w-2.5 h-2.5" />
                            </button>
                            <span className="px-2 text-xs font-bold text-black min-w-[20px] text-center select-none">
                              {item.quantity}
                            </span>
                            <button
                              id={`bag-qty-plus-${item.id}`}
                              onClick={() => onUpdateQuantity(item.id, 1)}
                              className="px-2.5 py-1 text-[#444748] hover:bg-black/10 active:scale-90 transition-all cursor-pointer flex items-center justify-center"
                              title="Increase quantity by 1"
                              aria-label="Increase quantity"
                            >
                              <Plus className="w-2.5 h-2.5" />
                            </button>
                          </div>

                          <span className="text-[13px] font-bold text-black">
                            ₹{(item.product.price * item.quantity).toLocaleString('en-IN')}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Out of Stock Warning Banner & Save for Later Action */}
                    {outOfStock && (
                      <div className="p-2.5 bg-amber-50 border border-amber-200 rounded flex items-center justify-between gap-2">
                        <div className="flex items-center gap-1.5 min-w-0">
                          <AlertCircle className="w-3.5 h-3.5 text-amber-600 shrink-0" />
                          <span className="text-[11px] text-amber-900 font-semibold truncate">
                            Currently Out of Stock ({liveStock} in Atelier)
                          </span>
                        </div>
                        <button
                          onClick={() => handleSaveForLater(item)}
                          className="px-2.5 py-1 bg-black hover:bg-[#333] text-white text-[10px] uppercase tracking-wider font-bold rounded flex items-center gap-1 cursor-pointer transition-colors shadow-2xs shrink-0"
                          title="Save this piece for later. It will automatically move back to cart when restocked."
                        >
                          <Bookmark className="w-3 h-3 text-[#fc6018]" />
                          <span>Save for Later</span>
                        </button>
                      </div>
                    )}

                    {/* AI Upsell/Cross-sell shortcut trigger */}
                    {onOpenUpsellCrossSell && (
                      <div className="pt-1.5 border-t border-black/5 flex items-center justify-between text-[11px]">
                        <button
                          onClick={() => onOpenUpsellCrossSell(item.product)}
                          className="text-[#a83900] hover:underline font-bold inline-flex items-center space-x-1 cursor-pointer"
                        >
                          <Sparkles className="w-3 h-3 text-[#fc6018]" />
                          <span>AI Pairing Recommendations</span>
                        </button>
                        
                        {!outOfStock && (
                          <button
                            onClick={() => handleSaveForLater(item)}
                            className="text-[11px] text-neutral-500 hover:text-black flex items-center gap-1 cursor-pointer font-medium"
                          >
                            <Bookmark className="w-2.5 h-2.5" />
                            <span>Save for later</span>
                          </button>
                        )}
                      </div>
                    )}
                  </div>
                );
              })}

              {/* In-Bag Upsell & Cross-Sell: Personalized Styling Synergies */}
              {(upsellProduct || crossSellProduct) && (
                <div
                  id="in-bag-styling-synergies"
                  className="p-4 bg-gradient-to-b from-[#fdfbf7] to-[#f4efe4] border border-black/15 rounded-xl space-y-3.5 shadow-2xs transition-all mt-2"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <Sparkles className="w-4 h-4 text-[#fc6018]" />
                      <h3 className="text-xs font-bold uppercase tracking-wider text-black">
                        Personalized Styling Synergies
                      </h3>
                    </div>
                    <span className="text-[9px] text-[#a83900] font-bold uppercase tracking-widest bg-orange-50 border border-orange-200/80 px-2 py-0.5 rounded">
                      AI Curated
                    </span>
                  </div>

                  <p className="text-[11px] text-[#555] leading-relaxed">
                    Elevated pairings tailored to your selected piece{items.length > 1 ? 's' : ''} ({baseProduct?.name || 'In Bag'}):
                  </p>

                  <div className="space-y-2.5">
                    {/* 1. UPSELL RECOMMENDATION */}
                    {upsellProduct && (
                      <div
                        id={`upsell-card-${upsellProduct.id}`}
                        className="p-3 bg-white border border-black/10 rounded-lg flex items-center justify-between gap-3 shadow-2xs hover:border-black/25 transition-all"
                      >
                        <img
                          src={upsellProduct.images?.[0] || upsellProduct.imageUrl || ''}
                          alt={upsellProduct.name}
                          className="w-12 h-16 object-cover rounded-xs bg-[#eae8e3] shrink-0"
                          referrerPolicy="no-referrer"
                        />
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-1.5 flex-wrap">
                            <span className="px-1.5 py-0.5 rounded bg-[#f2efe9] text-black text-[9px] font-bold uppercase tracking-wider">
                              Haute Upgrade
                            </span>
                            {baseProduct && upsellProduct.price > baseProduct.price && (
                              <span className="text-[10px] text-emerald-700 font-bold">
                                +₹{(upsellProduct.price - baseProduct.price).toLocaleString('en-IN')} delta
                              </span>
                            )}
                          </div>
                          <h4 className="text-xs font-bold text-black truncate mt-0.5">
                            {upsellProduct.name}
                          </h4>
                          <div className="text-[11px] text-[#fc6018] font-bold">
                            ₹{upsellProduct.price.toLocaleString('en-IN')}
                          </div>
                        </div>
                        <div className="flex flex-col gap-1.5 shrink-0 items-end">
                          <button
                            id={`add-upsell-bag-btn-${upsellProduct.id}`}
                            onClick={() => {
                              if (onAddToCart) {
                                onAddToCart(upsellProduct, upsellProduct.sizes?.[0] || 'FR 36 (US 2)', 0);
                                recordUpsellEvent(
                                  true,
                                  Math.max(0, upsellProduct.price - (baseProduct?.price || 0)),
                                  upsellProduct.name
                                );
                              }
                            }}
                            className="px-2.5 py-1.5 bg-black hover:bg-[#333] active:scale-95 text-white text-[10px] uppercase tracking-wider font-bold rounded flex items-center gap-1 cursor-pointer transition-all shadow-2xs whitespace-nowrap"
                            title="Add this elevated piece to your bag"
                          >
                            <Plus className="w-3 h-3" />
                            <span>Add to Bag</span>
                          </button>
                          {onSelectProduct && (
                            <button
                              onClick={() => onSelectProduct(upsellProduct)}
                              className="text-[9px] text-[#444748] hover:text-black font-semibold hover:underline cursor-pointer"
                            >
                              View Details
                            </button>
                          )}
                        </div>
                      </div>
                    )}

                    {/* 2. CROSS-SELL RECOMMENDATION */}
                    {crossSellProduct && (
                      <div
                        id={`cross-sell-card-${crossSellProduct.id}`}
                        className="p-3 bg-white border border-black/10 rounded-lg flex items-center justify-between gap-3 shadow-2xs hover:border-black/25 transition-all"
                      >
                        <img
                          src={crossSellProduct.images?.[0] || crossSellProduct.imageUrl || ''}
                          alt={crossSellProduct.name}
                          className="w-12 h-16 object-cover rounded-xs bg-[#eae8e3] shrink-0"
                          referrerPolicy="no-referrer"
                        />
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-1.5 flex-wrap">
                            <span className="px-1.5 py-0.5 rounded bg-[#f2efe9] text-black text-[9px] font-bold uppercase tracking-wider">
                              Complementary Pairing
                            </span>
                          </div>
                          <h4 className="text-xs font-bold text-black truncate mt-0.5">
                            {crossSellProduct.name}
                          </h4>
                          <div className="text-[11px] text-[#fc6018] font-bold">
                            ₹{crossSellProduct.price.toLocaleString('en-IN')}
                          </div>
                        </div>
                        <div className="flex flex-col gap-1.5 shrink-0 items-end">
                          <button
                            id={`add-cross-sell-bag-btn-${crossSellProduct.id}`}
                            onClick={() => {
                              if (onAddToCart) {
                                onAddToCart(crossSellProduct, crossSellProduct.sizes?.[0] || 'Standard', 0);
                                recordCrossSellEvent(true, crossSellProduct.price, crossSellProduct.name);
                              }
                            }}
                            className="px-2.5 py-1.5 bg-[#fc6018] hover:bg-[#e05312] active:scale-95 text-white text-[10px] uppercase tracking-wider font-bold rounded flex items-center gap-1 cursor-pointer transition-all shadow-2xs whitespace-nowrap"
                            title="Add this pairing piece to your bag"
                          >
                            <Plus className="w-3 h-3" />
                            <span>Pair Piece</span>
                          </button>
                          {onSelectProduct && (
                            <button
                              onClick={() => onSelectProduct(crossSellProduct)}
                              className="text-[9px] text-[#444748] hover:text-black font-semibold hover:underline cursor-pointer"
                            >
                              View Details
                            </button>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Frequently Bought Together: Relevant Accessories for Luxury Cart Items */}
              {frequentlyBoughtData && frequentlyBoughtData.accessories.length > 0 && (
                <div
                  id="frequently-bought-together-section"
                  className="p-4 bg-[#fbf9f5] border border-black/15 rounded-xl space-y-3.5 shadow-2xs transition-all mt-2.5"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <Layers className="w-4 h-4 text-[#a83900]" />
                      <h3 className="text-xs font-bold uppercase tracking-wider text-black">
                        Frequently Bought Together
                      </h3>
                    </div>
                    <span className="text-[9px] text-[#a83900] font-bold uppercase tracking-widest bg-[#faeedd] border border-[#e8d5bf] px-2 py-0.5 rounded">
                      Ensemble Accents
                    </span>
                  </div>

                  <p className="text-[11px] text-[#555] leading-relaxed">
                    Accessories frequently styled with your{' '}
                    <span className="font-bold text-black">{frequentlyBoughtData.anchorItem.product.name}</span>:
                  </p>

                  <div className="space-y-2.5">
                    {frequentlyBoughtData.accessories.map((item) => {
                      const isJustAdded = justAddedAccessoryId === item.product.id;
                      return (
                        <div
                          key={item.product.id}
                          id={`fbt-accessory-${item.product.id}`}
                          className="p-3 bg-white border border-black/10 rounded-lg flex items-center justify-between gap-3 shadow-2xs hover:border-black/25 transition-all"
                        >
                          <img
                            src={item.product.images?.[0] || item.product.imageUrl || ''}
                            alt={item.product.name}
                            className="w-12 h-16 object-cover rounded-xs bg-[#eae8e3] shrink-0"
                            referrerPolicy="no-referrer"
                          />

                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-1.5 flex-wrap">
                              <span className="px-1.5 py-0.5 rounded bg-[#f2efe9] text-black text-[9px] font-bold uppercase tracking-wider">
                                {item.pairingRole}
                              </span>
                              <span className="inline-flex items-center gap-0.5 text-[10px] text-emerald-700 font-bold bg-emerald-50 px-1.5 py-0.5 rounded border border-emerald-100">
                                <CheckCircle2 className="w-2.5 h-2.5 text-emerald-600" />
                                {item.frequencyPercent}% pair rate
                              </span>
                            </div>

                            <h4 className="text-xs font-bold text-black truncate mt-1">
                              {item.product.name}
                            </h4>

                            <p className="text-[10px] text-[#666] line-clamp-1 mt-0.5">
                              {item.stylingNote}
                            </p>

                            <div className="text-[11px] text-[#fc6018] font-bold mt-0.5">
                              ₹{item.product.price.toLocaleString('en-IN')}
                            </div>
                          </div>

                          <div className="flex flex-col gap-1.5 shrink-0 items-end">
                            <button
                              id={`fbt-add-btn-${item.product.id}`}
                              onClick={() => handleAddAccessoryToBag(item.product, item.pairingRole)}
                              disabled={isJustAdded}
                              className={`px-2.5 py-1.5 text-[10px] uppercase tracking-wider font-bold rounded flex items-center gap-1 cursor-pointer transition-all shadow-2xs whitespace-nowrap ${
                                isJustAdded
                                  ? 'bg-emerald-600 text-white cursor-default'
                                  : 'bg-black hover:bg-[#333] active:scale-95 text-white'
                              }`}
                              title={`Add ${item.product.name} to bag`}
                            >
                              {isJustAdded ? (
                                <>
                                  <Check className="w-3 h-3 text-white" />
                                  <span>Added ✓</span>
                                </>
                              ) : (
                                <>
                                  <Plus className="w-3 h-3" />
                                  <span>Add to Bag</span>
                                </>
                              )}
                            </button>

                            {onSelectProduct && (
                              <button
                                onClick={() => onSelectProduct(item.product)}
                                className="text-[9px] text-[#444748] hover:text-black font-semibold hover:underline cursor-pointer"
                              >
                                View Details
                              </button>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>

                  {/* Complete the Ensemble Bundle Action */}
                  {frequentlyBoughtData.accessories.length >= 2 && (
                    <div className="pt-2 border-t border-black/10 flex items-center justify-between gap-2">
                      <div>
                        <div className="text-[10px] uppercase tracking-wider font-bold text-[#444748]">
                          Complete the Ensemble
                        </div>
                        <div className="text-xs font-bold text-black">
                          Total: ₹{frequentlyBoughtData.bundleTotalPrice.toLocaleString('en-IN')}{' '}
                          <span className="text-[10px] font-normal text-neutral-500">
                            ({frequentlyBoughtData.accessories.length} accessories)
                          </span>
                        </div>
                      </div>

                      <button
                        id="fbt-add-bundle-btn"
                        onClick={() => handleAddAllFrequentlyBought(frequentlyBoughtData)}
                        disabled={bundleJustAdded}
                        className={`px-3 py-1.5 text-[10px] uppercase tracking-wider font-bold rounded flex items-center gap-1.5 cursor-pointer transition-all shadow-2xs whitespace-nowrap ${
                          bundleJustAdded
                            ? 'bg-emerald-700 text-white'
                            : 'bg-[#fc6018] hover:bg-[#e05312] active:scale-95 text-white'
                        }`}
                      >
                        {bundleJustAdded ? (
                          <>
                            <Check className="w-3.5 h-3.5 text-white" />
                            <span>All Added ✓</span>
                          </>
                        ) : (
                          <>
                            <ShoppingBag className="w-3.5 h-3.5 text-white" />
                            <span>Add All Accessories</span>
                          </>
                        )}
                      </button>
                    </div>
                  )}
                </div>
              )}
            </>
          )}

          {/* Saved for Later Section */}
          {savedForLater.length > 0 && (
            <div className="mt-6 pt-5 border-t border-black/10 space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <Bookmark className="w-4 h-4 text-[#fc6018]" />
                  <h3 className="text-xs font-bold uppercase tracking-wider text-black">
                    Saved For Later ({savedForLater.length})
                  </h3>
                </div>
                <span className="text-[10px] text-neutral-500 font-medium">
                  Auto-syncs on Restock
                </span>
              </div>
              <p className="text-[11px] text-[#767777] leading-relaxed">
                Pieces saved here will automatically return to your active bag as soon as atelier inventory is replenished.
              </p>

              <div className="space-y-3">
                {savedForLater.map((savedItem) => {
                  const liveStock = getProductStock(savedItem.product.id, savedItem.product.stock);
                  const inStock = liveStock > 0;

                  return (
                    <div
                      key={savedItem.id}
                      className="p-3 bg-white border border-black/10 rounded-lg space-y-2.5 shadow-2xs"
                    >
                      <div className="flex space-x-3 items-center">
                        <img
                          src={savedItem.product?.images?.[0] || savedItem.product?.imageUrl || ''}
                          alt={savedItem.product?.name}
                          className="w-14 h-18 object-cover rounded-xs bg-[#eae8e3] shrink-0"
                          referrerPolicy="no-referrer"
                        />
                        <div className="flex-1 min-w-0">
                          <span className="text-[9px] uppercase tracking-widest text-[#444748] font-bold block truncate">
                            {savedItem.product?.brand || savedItem.product?.designer || 'LUXORA ATELIER'}
                          </span>
                          <h4 className="text-xs font-bold text-black truncate">
                            {savedItem.product?.name}
                          </h4>
                          <div className="text-[10px] text-[#444748] space-x-1.5 my-0.5">
                            <span>Size: <strong className="text-black">{savedItem.selectedSize}</strong></span>
                            <span>•</span>
                            <span>₹{savedItem.product.price.toLocaleString('en-IN')}</span>
                          </div>

                          {/* Inventory status pill */}
                          <div className="mt-1">
                            {!inStock ? (
                              <span className="inline-flex items-center gap-1 text-[10px] text-amber-800 bg-amber-50 px-2 py-0.5 rounded font-medium border border-amber-200/70">
                                <Clock className="w-2.5 h-2.5 text-amber-600" />
                                <span>Awaiting Restock (0 in Atelier)</span>
                              </span>
                            ) : (
                              <span className="inline-flex items-center gap-1 text-[10px] text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded font-medium border border-emerald-200/70">
                                <CheckCircle2 className="w-2.5 h-2.5 text-emerald-600" />
                                <span>Restocked ({liveStock} in Atelier)</span>
                              </span>
                            )}
                          </div>
                        </div>

                        <button
                          onClick={() => handleRemoveSaved(savedItem.id)}
                          className="text-neutral-400 hover:text-red-600 p-1 cursor-pointer self-start"
                          title="Remove from saved"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>

                      {/* Action Bar */}
                      <div className="flex items-center justify-between pt-2 border-t border-black/5 gap-2">
                        <button
                          onClick={() => handleMoveSavedToBag(savedItem)}
                          className="flex-1 py-1.5 px-3 bg-black hover:bg-[#474746] text-white text-[10px] font-bold uppercase tracking-wider rounded-xs transition-colors flex items-center justify-center gap-1 cursor-pointer shadow-2xs"
                        >
                          <RotateCcw className="w-3 h-3" />
                          <span>Move to Bag</span>
                        </button>

                        {/* Inventory Replenishment Action */}
                        <button
                          onClick={() => handleSimulateRestock(savedItem.product.id)}
                          className="py-1.5 px-2.5 bg-[#f2efe9] hover:bg-[#eae6de] border border-black/15 text-neutral-800 text-[10px] font-semibold rounded-xs transition-colors flex items-center gap-1 cursor-pointer whitespace-nowrap"
                          title="Replenish atelier stock to trigger automated migration to active bag"
                        >
                          <Sparkles className="w-3 h-3 text-[#fc6018]" />
                          <span>Restock Inventory (+8)</span>
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {items.length > 0 && (
            <>
              {/* Luxury Gift Packaging Option */}
              <div className="p-3.5 bg-[#f2efe9] border border-black/10 space-y-2 rounded-lg">
                <label className="flex items-center space-x-2 cursor-pointer text-xs">
                  <input
                    type="checkbox"
                    checked={giftPackaging}
                    onChange={(e) => setGiftPackaging(e.target.checked)}
                    className="accent-black rounded-xs"
                  />
                  <span className="font-bold text-black flex items-center space-x-1.5">
                    <Gift className="w-3.5 h-3.5 text-[#fc6018]" />
                    <span>Complimentary Signature Gift Packaging</span>
                  </span>
                </label>
                {giftPackaging && (
                  <textarea
                    value={giftMessage}
                    onChange={(e) => setGiftMessage(e.target.value)}
                    placeholder="Include a bespoke handwritten message on ivory cardstock..."
                    rows={2}
                    className="w-full bg-white border border-black/20 p-2 text-xs text-black placeholder:text-[#767777] focus:outline-none focus:border-black rounded-xs"
                  />
                )}
              </div>

              {/* Promo Privilege Code */}
              <form onSubmit={handleApplyPromo} className="space-y-1">
                <div className="flex space-x-2">
                  <input
                    type="text"
                    value={promoCode}
                    onChange={(e) => setPromoCode(e.target.value)}
                    placeholder="Privilege Code (e.g. LUXORA10)"
                    className="flex-1 bg-white border border-black/20 px-3 py-2 text-xs uppercase placeholder:normal-case focus:outline-none focus:border-black rounded-xs"
                  />
                  <button
                    type="submit"
                    className="px-4 py-2 bg-black hover:bg-[#474746] text-white text-xs uppercase tracking-wider font-bold rounded-xs cursor-pointer"
                  >
                    Apply
                  </button>
                </div>
                {promoError && <p className="text-[11px] text-red-600 font-medium">{promoError}</p>}
                {promoSuccess && <p className="text-[11px] text-emerald-700 font-bold">{promoSuccess}</p>}
              </form>
            </>
          )}
        </div>

        {/* Drawer Footer & Checkout Action */}
        {items.length > 0 && (
          <div className="p-5 bg-white border-t border-black/10 space-y-3 shadow-lg">
            <div className="space-y-1.5 text-xs text-[#444748]">
              <div className="flex justify-between">
                <span>Subtotal</span>
                <span className="font-bold text-black">₹{subtotalINR.toLocaleString('en-IN')}</span>
              </div>
              {discountPercent > 0 && (
                <div className="flex justify-between text-emerald-700 font-bold">
                  <span>Privilege Discount ({discountPercent}%)</span>
                  <span>-₹{discountINR.toLocaleString('en-IN')}</span>
                </div>
              )}
              <div className="flex justify-between">
                <span>White-Glove Courier</span>
                <span className="text-black uppercase text-[10px] tracking-wider font-bold">Complimentary</span>
              </div>
              <div className="w-full h-px bg-black/10 my-1" />
              
              <div className="flex justify-between items-center text-xs">
                <button
                  type="button"
                  onClick={() => setShowExplainableModal(true)}
                  className="text-[11px] text-neutral-600 hover:text-black flex items-center gap-1 font-semibold underline underline-offset-2 cursor-pointer"
                >
                  <Sparkles className="w-3 h-3 text-amber-600" />
                  <span>Explainable Pricing Breakdown</span>
                </button>
              </div>

              <div className="flex justify-between text-base font-bold text-black">
                <span>Total Amount</span>
                <span className="text-lg">₹{totalINR.toLocaleString('en-IN')}</span>
              </div>
            </div>

            {!user && (
              <div className="p-3 bg-amber-50/90 border border-amber-200/90 rounded-xl flex items-center gap-2.5 text-amber-950 text-xs shadow-2xs">
                <Lock className="w-4 h-4 text-[#a83900] shrink-0" />
                <span className="text-[11px] leading-snug">
                  <strong>Login Required:</strong> Please sign in or register to proceed to checkout.
                </span>
              </div>
            )}

            <button
              id="checkout-drawer-btn"
              onClick={() => {
                if (!user) {
                  if (onRequireAuth) {
                    onRequireAuth();
                  } else if (onProceedToCheckout) {
                    onProceedToCheckout(discountPercent, giftPackaging, giftMessage);
                  }
                  return;
                }
                if (onProceedToCheckout) {
                  onProceedToCheckout(discountPercent, giftPackaging, giftMessage);
                }
              }}
              className="w-full py-3.5 bg-black hover:bg-[#474746] text-white text-[13px] uppercase tracking-widest font-bold transition-all flex items-center justify-center space-x-2 rounded-xs cursor-pointer shadow-md hover:scale-[1.01]"
            >
              {user ? (
                <>
                  <span>Proceed to Checkout</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              ) : (
                <>
                  <Lock className="w-4 h-4 text-amber-300" />
                  <span>Sign In to Proceed to Checkout</span>
                </>
              )}
            </button>
          </div>
        )}

      </div>

      <ExplainablePriceModal
        isOpen={showExplainableModal}
        onClose={() => setShowExplainableModal(false)}
        basePriceINR={subtotalINR}
        discountPercent={discountPercent}
        discountReason={discountPercent > 0 ? `${discountPercent}% Verified Privilege Code` : 'Haute Couture Standard MSRP'}
      />
    </div>
  );
};
