import React from 'react';
import { 
  X, 
  Sparkles, 
  ArrowUpRight, 
  Plus, 
  Check, 
  ShieldCheck, 
  ArrowRight,
  HelpCircle,
  Gem
} from 'lucide-react';
import { Product, Currency } from '../types';
import { useMerchant } from '../context/MerchantContext';

interface UpsellCrossSellModalProps {
  isOpen: boolean;
  onClose: () => void;
  baseProduct: Product;
  currency?: Currency;
  onAcceptUpsell?: (upsellProduct: Product) => void;
  onAcceptCrossSell?: (crossSellProduct: Product) => void;
  onContinueToBag?: () => void;
}

export const UpsellCrossSellModal: React.FC<UpsellCrossSellModalProps> = ({
  isOpen,
  onClose,
  baseProduct,
  onAcceptUpsell,
  onAcceptCrossSell,
  onContinueToBag,
}) => {
  const { catalog, recordUpsellEvent, recordCrossSellEvent } = useMerchant();

  if (!isOpen) return null;

  // Find Upsell & Cross-Sell products from live catalog
  const upsellProduct = baseProduct.upsellProductId 
    ? catalog.find(p => p.id === baseProduct.upsellProductId)
    : catalog.find(p => p.id !== baseProduct.id && p.price > baseProduct.price);

  const crossSellProduct = baseProduct.crossSellProductId
    ? catalog.find(p => p.id === baseProduct.crossSellProductId)
    : catalog.find(p => p.id !== baseProduct.id && p.category !== baseProduct.category);

  const formatPrice = (inr: number) => {
    return `₹${Math.round(inr).toLocaleString('en-IN')}`;
  };

  const handleAcceptUpsell = () => {
    if (upsellProduct) {
      const revenueINR = Math.max(0, upsellProduct.price - baseProduct.price);
      recordUpsellEvent(true, revenueINR, upsellProduct.name);
      onAcceptUpsell?.(upsellProduct);
      onClose();
    }
  };

  const handleDeclineUpsell = () => {
    if (upsellProduct) {
      const revenueINR = Math.max(0, upsellProduct.price - baseProduct.price);
      recordUpsellEvent(false, revenueINR, upsellProduct.name);
    }
  };

  const handleAcceptCrossSell = () => {
    if (crossSellProduct) {
      const revenueINR = crossSellProduct.price;
      recordCrossSellEvent(true, revenueINR, crossSellProduct.name);
      onAcceptCrossSell?.(crossSellProduct);
      onClose();
    }
  };

  const handleDeclineCrossSell = () => {
    if (crossSellProduct) {
      const revenueINR = crossSellProduct.price;
      recordCrossSellEvent(false, revenueINR, crossSellProduct.name);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 font-['Archivo_Narrow']">
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-black/60 backdrop-blur-xs transition-opacity"
        onClick={onClose}
      />

      {/* Modal Container */}
      <div className="relative w-full max-w-2xl bg-[#fbf9f4] rounded-lg shadow-2xl border border-black/10 overflow-hidden z-10 flex flex-col max-h-[90vh]">
        
        {/* Header */}
        <div className="px-6 py-4 border-b border-black/10 bg-white flex items-center justify-between">
          <div className="flex items-center space-x-2.5">
            <div className="w-8 h-8 rounded-full bg-[#f2efe9] border border-black/10 text-black flex items-center justify-center">
              <Sparkles className="w-4 h-4 text-[#fc6018]" />
            </div>
            <div>
              <span className="text-[10px] uppercase tracking-widest text-[#a83900] font-bold block">
                LUXORA AI Curatorial Recommendations
              </span>
              <h3 className="text-base font-bold text-black">
                Personalized Styling Synergies
              </h3>
            </div>
          </div>

          <button 
            onClick={onClose}
            className="p-1.5 rounded-full text-[#444748] hover:text-black hover:bg-black/5 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-6 overflow-y-auto space-y-6">
          
          {/* Currently Selected Summary */}
          <div className="p-3.5 rounded-md bg-[#f2efe9] border border-black/10 flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <img 
                src={baseProduct.images?.[0] || baseProduct.imageUrl || ''} 
                alt={baseProduct.name} 
                className="w-12 h-14 object-cover rounded-xs bg-[#eae8e3]"
              />
              <div>
                <span className="text-[10px] text-[#444748] uppercase tracking-wider block font-semibold">
                  Selected Piece
                </span>
                <h4 className="text-xs font-bold text-black">
                  {baseProduct.name}
                </h4>
                <p className="text-xs font-bold text-[#fc6018]">
                  {formatPrice(baseProduct.price)}
                </p>
              </div>
            </div>
            <span className="text-[11px] font-bold text-emerald-800 bg-emerald-50 px-2.5 py-1 rounded border border-emerald-200">
              In Bag
            </span>
          </div>

          {/* 1. AI UPSELL OPPORTUNITY */}
          {upsellProduct && (
            <div className="p-5 rounded-lg bg-white border border-black/10 shadow-2xs space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <span className="px-2 py-0.5 rounded bg-[#f2efe9] text-black text-[10px] font-bold uppercase tracking-wider">
                    AI Haute Upgrade (Upsell)
                  </span>
                  <span className="text-xs text-[#444748]">
                    +{formatPrice(upsellProduct.price - baseProduct.price)} Delta
                  </span>
                </div>
                <span className="text-xs font-bold text-black">
                  {formatPrice(upsellProduct.price)}
                </span>
              </div>

              <div className="flex gap-4">
                <img 
                  src={upsellProduct.images?.[0] || upsellProduct.imageUrl || ''} 
                  alt={upsellProduct.name} 
                  className="w-20 h-24 object-cover rounded-xs shrink-0 bg-[#eae8e3]"
                />
                <div className="space-y-1.5 flex-1">
                  <h4 className="text-sm font-bold text-black">
                    {upsellProduct.name}
                  </h4>
                  <p className="text-xs text-[#444748] leading-relaxed">
                    {upsellProduct.whyThisReason || upsellProduct.description}
                  </p>
                  <p className="text-[11px] text-[#a83900] font-bold">
                    {upsellProduct.composition || upsellProduct.category} — {upsellProduct.origin || 'Atelier'}
                  </p>
                </div>
              </div>

              <div className="flex items-center justify-end space-x-2 pt-2 border-t border-black/5">
                <button
                  onClick={handleDeclineUpsell}
                  className="px-3 py-1.5 text-xs text-[#444748] hover:text-black transition-colors cursor-pointer"
                >
                  Keep Current
                </button>
                <button
                  onClick={handleAcceptUpsell}
                  className="px-4 py-1.5 rounded-xs bg-black hover:bg-[#474746] text-white text-xs font-bold inline-flex items-center space-x-1.5 transition-colors cursor-pointer"
                >
                  <Gem className="w-3.5 h-3.5 text-[#fc6018]" />
                  <span>Upgrade to {upsellProduct.name.split(' ')[0]}</span>
                </button>
              </div>
            </div>
          )}

          {/* 2. AI CROSS-SELL OPPORTUNITY */}
          {crossSellProduct && (
            <div className="p-5 rounded-lg bg-white border border-black/10 shadow-2xs space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <span className="px-2 py-0.5 rounded bg-[#f2efe9] text-black text-[10px] font-bold uppercase tracking-wider">
                    AI Ensemble Pairing (Cross-Sell)
                  </span>
                </div>
                <span className="text-xs font-bold text-black">
                  {formatPrice(crossSellProduct.price)}
                </span>
              </div>

              <div className="flex gap-4">
                <img 
                  src={crossSellProduct.images?.[0] || crossSellProduct.imageUrl || ''} 
                  alt={crossSellProduct.name} 
                  className="w-20 h-24 object-cover rounded-xs shrink-0 bg-[#eae8e3]"
                />
                <div className="space-y-1.5 flex-1">
                  <h4 className="text-sm font-bold text-black">
                    {crossSellProduct.name}
                  </h4>
                  <p className="text-xs text-[#444748] leading-relaxed">
                    Styling rationale: Pairs seamlessly with {baseProduct.name} to establish balanced proportions and specular accents.
                  </p>
                  <p className="text-[11px] text-[#444748]">
                    Category: {crossSellProduct.category} • {crossSellProduct.brand || crossSellProduct.designer}
                  </p>
                </div>
              </div>

              <div className="flex items-center justify-end space-x-2 pt-2 border-t border-black/5">
                <button
                  onClick={handleDeclineCrossSell}
                  className="px-3 py-1.5 text-xs text-[#444748] hover:text-black transition-colors cursor-pointer"
                >
                  No, thanks
                </button>
                <button
                  onClick={handleAcceptCrossSell}
                  className="px-4 py-1.5 rounded-xs bg-black hover:bg-[#474746] text-white text-xs font-bold inline-flex items-center space-x-1.5 transition-colors cursor-pointer"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Add Pairing to Bag</span>
                </button>
              </div>
            </div>
          )}

        </div>

        {/* Footer */}
        <div className="px-6 py-3 border-t border-black/10 bg-[#f2efe9] flex items-center justify-between text-xs text-[#444748]">
          <span className="flex items-center space-x-1.5">
            <ShieldCheck className="w-4 h-4 text-emerald-700" />
            <span>AI recommendation backed by real atelier inventory</span>
          </span>
          <button 
            onClick={() => {
              if (onContinueToBag) {
                onContinueToBag();
              } else {
                onClose();
              }
            }}
            className="px-4 py-2 bg-neutral-900 hover:bg-black text-white text-xs font-bold rounded-lg flex items-center gap-1.5 transition-all shadow-xs cursor-pointer"
          >
            <span>Continue to Bag</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

      </div>
    </div>
  );
};
