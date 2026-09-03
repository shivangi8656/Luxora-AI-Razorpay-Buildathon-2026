import React, { useState } from 'react';
import { X, Heart, ShoppingBag, Sparkles, Check, Ruler, ArrowRight, ArrowUpRight, Plus, HelpCircle, CreditCard } from 'lucide-react';
import { Product, Currency, SizingRecommendation } from '../types';
import { PRODUCTS } from '../data/products';

interface ProductDetailModalProps {
  product: Product | null;
  currency?: Currency;
  isWishlisted: boolean;
  isOpen?: boolean;
  allProducts?: Product[];
  onClose: () => void;
  onToggleWishlist: (product: Product) => void;
  onAddToCart: (product: Product, size: string, colorIndex: number) => void;
  onBuyNow?: (product: Product, size: string, colorIndex: number) => void;
  onSelectPairingProduct?: (product: Product) => void;
  onSelectRelatedProduct?: (product: Product) => void;
  onOpenAtelierWithPrompt?: (prompt: string) => void;
  onOpenAtelierWithProduct?: (product: Product) => void;
}

export const ProductDetailModal: React.FC<ProductDetailModalProps> = ({
  product,
  currency = 'INR',
  isWishlisted,
  allProducts,
  onClose,
  onToggleWishlist,
  onAddToCart,
  onBuyNow,
  onSelectPairingProduct,
  onSelectRelatedProduct,
  onOpenAtelierWithPrompt,
  onOpenAtelierWithProduct,
}) => {
  if (!product) return null;

  const handleSelectRelated = (p: Product) => {
    if (onSelectPairingProduct) onSelectPairingProduct(p);
    if (onSelectRelatedProduct) onSelectRelatedProduct(p);
  };

  const handleOpenStylist = (promptText?: string) => {
    if (onOpenAtelierWithProduct) onOpenAtelierWithProduct(product);
    if (onOpenAtelierWithPrompt) onOpenAtelierWithPrompt(promptText || `How should I style the ${product.name}?`);
  };

  const [activeImageIndex, setActiveImageIndex] = useState(0);
  const [selectedColorIndex, setSelectedColorIndex] = useState(0);
  const [selectedSize, setSelectedSize] = useState<string>(product.sizes?.[0] || 'Standard');
  const [justAdded, setJustAdded] = useState(false);
  const [notified, setNotified] = useState(false);

  const isOutOfStock = product.stock === 0 || product.availability === 'Out of Stock';

  // AI Sizing Advisor State
  const [showSizingAdvisor, setShowSizingAdvisor] = useState(false);
  const [heightCm, setHeightCm] = useState('175');
  const [weightKg, setWeightKg] = useState('58');
  const [fitPreference, setFitPreference] = useState<'snug' | 'tailored' | 'relaxed'>('tailored');
  const [sizingLoading, setSizingLoading] = useState(false);
  const [sizingResult, setSizingResult] = useState<SizingRecommendation | null>(null);

  const productSource = (allProducts && allProducts.length > 0) ? allProducts : PRODUCTS;

  // Curated pairing / cross-sell items
  const pairingItems = (product.pairingIds || [])
    .map((id) => productSource.find((p) => p.id === id || p.sku === id))
    .filter(Boolean) as Product[];

  // Upsell item (e.g. from the same category with higher tier)
  const upsellItem = productSource.find(
    (p) => p.category === product.category && p.price > product.price && p.id !== product.id
  );

  const handleAddToCart = () => {
    if (!selectedSize) return;
    onAddToCart(product, selectedSize, selectedColorIndex);
    setJustAdded(true);
    setTimeout(() => {
      setJustAdded(false);
      onClose();
    }, 600);
  };

  const handleBuyNow = () => {
    if (!selectedSize) return;
    if (onBuyNow) {
      onBuyNow(product, selectedSize, selectedColorIndex);
    } else {
      onAddToCart(product, selectedSize, selectedColorIndex);
    }
  };

  const handleCalculateSizing = async () => {
    setSizingLoading(true);
    try {
      const res = await fetch('/api/atelier/sizing', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          productId: product.id,
          heightCm: Number(heightCm),
          weightKg: Number(weightKg),
          fitPreference,
        }),
      });
      const data = await res.json();
      setSizingResult(data);
      if (data.recommendedSize) {
        setSelectedSize(data.recommendedSize);
      }
    } catch (err) {
      console.error('Sizing error:', err);
    } finally {
      setSizingLoading(false);
    }
  };

  return (
    <div
      id="product-detail-modal"
      className="fixed inset-0 z-50 overflow-y-auto bg-black/60 backdrop-blur-xs flex items-center justify-center p-2 sm:p-4 lg:p-6 animate-fade-in font-['Archivo_Narrow']"
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-5xl bg-[#fbf9f4] shadow-2xl border border-black/10 rounded-lg overflow-hidden my-auto"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close Button */}
        <button
          id="close-product-detail-btn"
          onClick={onClose}
          className="absolute top-4 right-4 z-20 p-2 bg-[#fbf9f4]/90 hover:bg-black hover:text-white transition-colors rounded-full border border-black/15 cursor-pointer shadow-xs"
          aria-label="Close"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="grid grid-cols-1 lg:grid-cols-12 max-h-[90vh] overflow-y-auto custom-scrollbar">
          
          {/* Left: Gallery & Zoomable Visuals */}
          <div className="lg:col-span-7 p-4 sm:p-8 bg-[#f2efe9] flex flex-col justify-between">
            <div className="relative aspect-3/4 w-full overflow-hidden bg-[#eae8e3] rounded-md mb-4 shadow-xs">
              <img
                src={product.images?.[activeImageIndex] || product.images?.[0] || product.imageUrl || ''}
                alt={product.name}
                className="w-full h-full object-cover object-center transition-all duration-500"
                referrerPolicy="no-referrer"
              />
              <div className="absolute top-3 left-3 bg-black/80 backdrop-blur-xs text-white text-[10px] uppercase tracking-wider font-semibold px-2.5 py-1 rounded">
                Angle {activeImageIndex + 1} / {product.images?.length || 1}
              </div>
            </div>

            {/* Thumbnails */}
            <div className="flex items-center space-x-3 overflow-x-auto no-scrollbar py-1">
              {(product.images || []).map((img, idx) => (
                <button
                  key={idx}
                  onClick={() => setActiveImageIndex(idx)}
                  className={`relative w-16 h-20 shrink-0 overflow-hidden rounded-xs border transition-all cursor-pointer ${
                    activeImageIndex === idx
                      ? 'border-black ring-2 ring-black'
                      : 'border-transparent opacity-60 hover:opacity-100'
                  }`}
                >
                  <img src={img} alt="thumbnail" className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                </button>
              ))}
            </div>
          </div>

          {/* Right: Product Narrative, Sizing & Actions */}
          <div className="lg:col-span-5 p-6 sm:p-8 flex flex-col justify-between space-y-6">
            
            {/* Header: Brand, Title, Price */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <span className="text-[11px] uppercase tracking-widest font-bold text-[#a83900]">
                  {product.brand || product.designer} • {product.category}
                </span>
                <span className="text-[11px] uppercase tracking-wider text-[#444748]">
                  {product.occasion}
                </span>
              </div>
              <h2 className="text-2xl sm:text-3xl font-bold text-black leading-tight mb-2">
                {product.name}
              </h2>
              <div className="flex items-center justify-between">
                <div className="text-2xl font-bold text-black">
                  ₹{product.price.toLocaleString('en-IN')}
                </div>
                {product.stock === 0 || product.availability === 'Out of Stock' ? (
                  <span className="text-xs uppercase font-bold text-rose-700 bg-rose-50 px-3 py-1 rounded-full border border-rose-200">
                    Out of Stock
                  </span>
                ) : product.stock === 1 ? (
                  <span className="text-xs uppercase font-bold text-amber-700 bg-amber-50 px-3 py-1 rounded-full border border-amber-200 animate-pulse">
                    Only 1 Left in Stock
                  </span>
                ) : null}
              </div>
            </div>

            {/* "Why This Piece?" Stylist Insight */}
            {product.whyThisReason && (
              <div className="bg-[#f2efe9] p-3 rounded-md border-l-3 border-[#fc6018] space-y-1">
                <div className="flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-wider text-[#a83900]">
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>Why This Silhouette?</span>
                </div>
                <p className="text-[12px] text-[#444748] leading-relaxed">
                  {product.whyThisReason}
                </p>
              </div>
            )}

            {/* Colorway Selection */}
            {product.colors && product.colors.length > 0 && (
              <div>
                <span className="text-[11px] uppercase tracking-widest text-[#444748] font-bold block mb-2">
                  Selected Shade: <strong className="text-black">{product.colors[selectedColorIndex]?.name || product.color}</strong>
                </span>
                <div className="flex items-center space-x-2.5">
                  {product.colors.map((c, idx) => (
                    <button
                      key={c.name}
                      onClick={() => setSelectedColorIndex(idx)}
                      className={`flex items-center space-x-2 px-3 py-1.5 border rounded-xs text-xs transition-all cursor-pointer ${
                        selectedColorIndex === idx
                          ? 'border-black bg-black/5 font-bold'
                          : 'border-neutral-200 hover:border-black text-[#444748]'
                      }`}
                    >
                      <span
                        className="w-3 h-3 rounded-full border border-neutral-300 inline-block"
                        style={{ backgroundColor: c.hex }}
                      />
                      <span>{c.name}</span>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Size Selector & AI Sizing Advisor Toggle */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-[11px] uppercase tracking-widest text-[#444748] font-bold">
                  Select Size
                </span>
                <button
                  id="ai-sizing-advisor-btn"
                  onClick={() => setShowSizingAdvisor(!showSizingAdvisor)}
                  className="text-[11px] uppercase tracking-wider text-[#a83900] hover:text-black font-bold flex items-center space-x-1 cursor-pointer"
                >
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>{showSizingAdvisor ? 'Close Sizing Advisor' : 'AI Fit Advisor'}</span>
                </button>
              </div>

              {/* Sizes Buttons */}
              <div className="grid grid-cols-3 gap-2">
                {product.sizes.map((sz) => (
                  <button
                    key={sz}
                    onClick={() => setSelectedSize(sz)}
                    className={`py-2 px-2 text-xs transition-all text-center rounded-xs border cursor-pointer ${
                      selectedSize === sz
                        ? 'border-black bg-black text-white font-bold'
                        : 'border-neutral-200 hover:border-black text-black'
                    }`}
                  >
                    {sz}
                  </button>
                ))}
              </div>
              <p className="text-[11px] text-[#444748] mt-1.5">
                Fit profile: <span className="font-medium text-black">{product.fit}</span>
              </p>
            </div>

            {/* AI Sizing Advisor Sub-Panel */}
            {showSizingAdvisor && (
              <div className="p-4 bg-[#f2efe9] border border-black/10 rounded-md space-y-3 animate-fade-in">
                <div className="flex items-center space-x-1.5 text-xs font-bold uppercase tracking-wider text-black">
                  <Ruler className="w-4 h-4 text-[#a83900]" />
                  <span>Bespoke Silhouette Recommendation</span>
                </div>
                <div className="grid grid-cols-2 gap-2 text-xs">
                  <div>
                    <label className="block text-[10px] uppercase tracking-wider text-[#444748] font-semibold mb-1">Height (cm)</label>
                    <input
                      type="number"
                      value={heightCm}
                      onChange={(e) => setHeightCm(e.target.value)}
                      className="w-full bg-white border border-black/20 px-2 py-1 text-xs rounded-xs focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] uppercase tracking-wider text-[#444748] font-semibold mb-1">Weight (kg)</label>
                    <input
                      type="number"
                      value={weightKg}
                      onChange={(e) => setWeightKg(e.target.value)}
                      className="w-full bg-white border border-black/20 px-2 py-1 text-xs rounded-xs focus:outline-none"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[10px] uppercase tracking-wider text-[#444748] font-semibold mb-1">Fit Preference</label>
                  <div className="grid grid-cols-3 gap-1">
                    {(['snug', 'tailored', 'relaxed'] as const).map((fit) => (
                      <button
                        key={fit}
                        onClick={() => setFitPreference(fit)}
                        className={`py-1 text-[10px] uppercase tracking-wider border rounded-xs cursor-pointer ${
                          fitPreference === fit ? 'bg-black text-white border-black font-bold' : 'bg-white text-[#444748] border-neutral-300'
                        }`}
                      >
                        {fit}
                      </button>
                    ))}
                  </div>
                </div>

                <button
                  id="calculate-fit-btn"
                  onClick={handleCalculateSizing}
                  disabled={sizingLoading}
                  className="w-full py-2 bg-black hover:bg-[#474746] text-white text-xs uppercase tracking-wider font-semibold transition-colors flex items-center justify-center space-x-1.5 rounded-xs cursor-pointer"
                >
                  <Sparkles className="w-3.5 h-3.5 text-[#fc6018]" />
                  <span>{sizingLoading ? 'Analyzing Silhouette...' : 'Calculate Precision Fit'}</span>
                </button>

                {sizingResult && (
                  <div className="pt-2 border-t border-black/10 text-xs space-y-1.5 text-black">
                    <div className="flex items-center justify-between">
                      <span className="font-bold">Recommended Size:</span>
                      <span className="font-bold text-sm bg-white px-2 py-0.5 border border-black/20 rounded-xs">
                        {sizingResult.recommendedSize}
                      </span>
                    </div>
                    <p className="text-[11px] italic leading-relaxed text-[#444748]">
                      "{sizingResult.fitAssessment}"
                    </p>
                  </div>
                )}
              </div>
            )}

            {/* Primary Action Buttons */}
            <div className="space-y-2 pt-2">
              {isOutOfStock ? (
                <button
                  id="modal-notify-btn"
                  onClick={() => {
                    setNotified(true);
                    setTimeout(() => setNotified(false), 3000);
                  }}
                  className={`w-full py-3.5 text-xs uppercase tracking-widest font-bold flex items-center justify-center space-x-2 transition-all rounded-xs cursor-pointer ${
                    notified
                      ? 'bg-emerald-800 text-white'
                      : 'bg-black text-white hover:bg-neutral-800'
                  }`}
                >
                  {notified ? (
                    <>
                      <Check className="w-4 h-4" />
                      <span>We will notify you upon restock</span>
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-4 h-4 text-amber-400" />
                      <span>Notify Me When In Stock</span>
                    </>
                  )}
                </button>
              ) : (
                <div className="flex flex-col sm:flex-row gap-2.5">
                  {/* Button 1: Add to Bag */}
                  <button
                    id="modal-add-to-cart-btn"
                    onClick={handleAddToCart}
                    className={`flex-1 py-3.5 px-4 text-xs uppercase tracking-widest font-bold flex items-center justify-center space-x-2 transition-all rounded-xs cursor-pointer shadow-2xs ${
                      justAdded
                        ? 'bg-neutral-800 text-white'
                        : 'bg-white border border-black text-black hover:bg-black hover:text-white active:scale-95'
                    }`}
                  >
                    {justAdded ? (
                      <>
                        <Check className="w-4 h-4 text-emerald-400" />
                        <span>Added to Bag</span>
                      </>
                    ) : (
                      <>
                        <ShoppingBag className="w-4 h-4" />
                        <span>Add to Bag</span>
                      </>
                    )}
                  </button>

                  {/* Button 2: Buy Now */}
                  <button
                    id="modal-buy-now-btn"
                    onClick={handleBuyNow}
                    className="flex-1 py-3.5 px-4 bg-[#fc6018] hover:bg-[#e05312] text-white text-xs uppercase tracking-widest font-bold flex items-center justify-center space-x-2 transition-all rounded-xs cursor-pointer active:scale-95 shadow-2xs"
                  >
                    <CreditCard className="w-4 h-4" />
                    <span>Buy Now • ₹{product.price.toLocaleString('en-IN')}</span>
                  </button>
                </div>
              )}

              <div className="flex gap-2">
                <button
                  id="modal-wishlist-btn"
                  onClick={() => onToggleWishlist(product)}
                  className="flex-1 py-2.5 border border-black/20 hover:border-black text-xs uppercase tracking-wider font-bold flex items-center justify-center space-x-1.5 text-black transition-colors rounded-xs cursor-pointer"
                >
                  <Heart className={`w-3.5 h-3.5 ${isWishlisted ? 'fill-[#fc6018] text-[#fc6018]' : ''}`} />
                  <span>{isWishlisted ? 'Wishlisted' : 'Save to Wishlist'}</span>
                </button>

                <button
                  onClick={() => {
                    onClose();
                    handleOpenStylist(`What can I wear with the ${product.name}?`);
                  }}
                  className="flex-1 py-2.5 bg-[#f2efe9] hover:bg-black hover:text-white border border-black/15 text-xs uppercase tracking-wider font-bold flex items-center justify-center space-x-1.5 text-black transition-all rounded-xs cursor-pointer"
                >
                  <Sparkles className="w-3.5 h-3.5 text-[#fc6018]" />
                  <span>Stylist Advice</span>
                </button>
              </div>
            </div>

            {/* Upsell Opportunity Card */}
            {upsellItem && (
              <div className="p-3 bg-[#fbf9f4] border border-black/15 rounded-md space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] uppercase tracking-widest font-bold text-[#a83900] flex items-center gap-1">
                    <ArrowUpRight className="w-3.5 h-3.5" />
                    <span>Premium Atelier Upgrade</span>
                  </span>
                  <span className="text-[11px] font-bold text-black">
                    ₹{upsellItem.price.toLocaleString('en-IN')}
                  </span>
                </div>
                <div 
                  onClick={() => handleSelectRelated(upsellItem)}
                  className="flex items-center gap-3 p-2 bg-white rounded-xs border border-black/5 hover:border-black/20 transition-all cursor-pointer group"
                >
                  <img src={upsellItem.images?.[0] || upsellItem.imageUrl || ''} alt={upsellItem.name} className="w-10 h-13 object-cover rounded-xs" referrerPolicy="no-referrer" />
                  <div className="flex-1 min-w-0">
                    <span className="text-[9px] uppercase tracking-wider text-[#444748] block">{upsellItem.brand || upsellItem.designer}</span>
                    <h4 className="text-[12px] font-bold text-black truncate group-hover:text-[#a83900]">{upsellItem.name}</h4>
                    <p className="text-[10px] text-[#444748] truncate">{upsellItem.composition || upsellItem.category}</p>
                  </div>
                  <ArrowRight className="w-3.5 h-3.5 text-black group-hover:translate-x-1 transition-transform" />
                </div>
              </div>
            )}

            {/* Craftsmanship & Composition Notes */}
            <div className="border-t border-black/10 pt-4 space-y-2.5 text-xs text-[#444748]">
              <div>
                <span className="font-bold text-black uppercase tracking-wider text-[10px] block mb-0.5">Description</span>
                <p className="leading-relaxed">{product.description}</p>
              </div>

              <div className="grid grid-cols-2 gap-2 pt-1 text-[11px]">
                <div>
                  <span className="font-bold text-black uppercase tracking-wider text-[9px] block">Composition</span>
                  <span>{product.composition}</span>
                </div>
                <div>
                  <span className="font-bold text-black uppercase tracking-wider text-[9px] block">Provenance</span>
                  <span>{product.origin}</span>
                </div>
              </div>

              <div className="pt-1">
                <span className="font-bold text-black uppercase tracking-wider text-[9px] block">Care</span>
                <span className="text-[11px]">{product.care}</span>
              </div>
            </div>

            {/* Complete the Look (Pairings & Cross-sells) */}
            {pairingItems.length > 0 && (
              <div className="border-t border-black/10 pt-4">
                <span className="text-[10px] uppercase tracking-widest font-bold text-[#444748] block mb-2 flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-[#fc6018]" />
                  <span>Complete the Look (Pairings)</span>
                </span>
                <div className="grid grid-cols-2 gap-2">
                  {pairingItems.slice(0, 2).map((item) => (
                    <div
                      key={item.id}
                      onClick={() => handleSelectRelated(item)}
                      className="group/pair p-2 bg-white hover:bg-[#f2efe9] border border-black/10 rounded-xs transition-colors flex items-center space-x-2.5 cursor-pointer shadow-2xs"
                    >
                      <img src={item.images?.[0] || item.imageUrl || ''} alt={item.name} className="w-10 h-13 object-cover rounded-xs" referrerPolicy="no-referrer" />
                      <div className="flex-1 min-w-0">
                        <span className="text-[9px] uppercase tracking-wider text-[#444748] truncate block">{item.brand || item.designer}</span>
                        <h4 className="text-[11px] font-bold text-black truncate group-hover/pair:text-[#a83900]">{item.name}</h4>
                        <span className="text-[11px] font-bold text-black">₹{(item.price || 0).toLocaleString('en-IN')}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

          </div>

        </div>
      </div>
    </div>
  );
};
