import React from 'react';
import { X, Sparkles, CheckCircle2, ShieldCheck, Tag, Info, ArrowRight } from 'lucide-react';
import { Product } from '../types';

interface ExplainablePriceModalProps {
  isOpen: boolean;
  onClose: () => void;
  product?: Product;
  basePriceINR: number;
  discountPercent?: number;
  discountReason?: string;
  appliedCampaignName?: string;
}

export const ExplainablePriceModal: React.FC<ExplainablePriceModalProps> = ({
  isOpen,
  onClose,
  product,
  basePriceINR,
  discountPercent = 0,
  discountReason = 'Standard Haute Couture Catalog Price',
  appliedCampaignName
}) => {
  if (!isOpen) return null;

  const discountAmountINR = Math.round((basePriceINR * discountPercent) / 100);
  const netTotalINR = basePriceINR - discountAmountINR;

  return (
    <div
      className="fixed inset-0 z-50 overflow-y-auto bg-neutral-900/70 backdrop-blur-xs flex items-center justify-center p-4 animate-fade-in"
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-md bg-white rounded-2xl shadow-2xl border border-neutral-200 overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="bg-neutral-900 text-white px-5 py-4 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Sparkles className="w-4 h-4 text-amber-400" />
            <h3 className="font-bold text-sm text-white tracking-wide">
              Explainable Pricing Calculation
            </h3>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-full text-neutral-400 hover:text-white hover:bg-neutral-800 transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Body */}
        <div className="p-6 space-y-4 text-xs">
          <div>
            <span className="text-[10px] uppercase tracking-wider font-bold text-neutral-500 block mb-1">
              Piece Valuation Breakdown
            </span>
            <h4 className="text-sm font-bold text-neutral-900">
              {product?.name || 'Selected Haute Couture Ensemble'}
            </h4>
            <p className="text-neutral-500 font-light text-[11px]">
              Every rupee charged is cryptographically verified against active campaign matrices and loyalty tiers.
            </p>
          </div>

          <div className="p-4 rounded-xl bg-neutral-50 border border-neutral-200 space-y-2.5 font-mono">
            <div className="flex justify-between items-center text-neutral-700">
              <span>1. Base Atelier MSRP</span>
              <span className="font-bold text-neutral-900">₹{basePriceINR.toLocaleString('en-IN')}</span>
            </div>

            {discountAmountINR > 0 ? (
              <div className="flex justify-between items-center text-neutral-900 font-semibold">
                <span className="flex items-center gap-1">
                  <Tag className="w-3 h-3 text-amber-700" />
                  <span>2. Campaign Privilege ({discountPercent}%)</span>
                </span>
                <span>-₹{discountAmountINR.toLocaleString('en-IN')}</span>
              </div>
            ) : (
              <div className="flex justify-between items-center text-neutral-400">
                <span>2. Campaign Privilege</span>
                <span>₹0 (Standard Tier)</span>
              </div>
            )}

            <div className="flex justify-between items-center text-neutral-700">
              <span>3. White-Glove Courier</span>
              <span className="text-neutral-900 font-semibold">₹0 (Complimentary)</span>
            </div>

            <div className="border-t border-neutral-300 pt-2 flex justify-between items-baseline text-sm">
              <span className="font-sans font-bold text-neutral-900">Net Authorized Total</span>
              <span className="font-bold text-neutral-950 text-base">
                ₹{netTotalINR.toLocaleString('en-IN')}
              </span>
            </div>
          </div>

          {/* Mathematical Rationale */}
          <div className="p-3 bg-neutral-100/80 rounded-xl text-[11px] text-neutral-700 space-y-1">
            <div className="flex items-center space-x-1.5 font-bold text-neutral-900">
              <Info className="w-3.5 h-3.5 text-neutral-700" />
              <span>Authorization Rationale:</span>
            </div>
            <p className="font-light leading-relaxed">
              {appliedCampaignName 
                ? `Special campaign "${appliedCampaignName}" applied ${discountPercent}% privilege rebate on verified MSRP.`
                : discountPercent > 0 
                  ? `${discountReason} automatically verified through our transparent valuation protocol.`
                  : `Standard atelier pricing verified with zero hidden fees or dynamic markups.`}
            </p>
          </div>

          <button
            onClick={onClose}
            className="w-full py-2.5 bg-neutral-900 hover:bg-black text-white text-xs font-bold uppercase tracking-wider rounded-xl transition-colors cursor-pointer"
          >
            Verified & Understood
          </button>
        </div>

        {/* Footer */}
        <div className="px-5 py-2.5 bg-neutral-50 border-t border-neutral-200 text-[10px] text-neutral-500 flex items-center justify-between font-mono">
          <span className="flex items-center gap-1">
            <ShieldCheck className="w-3 h-3 text-neutral-700" />
            <span>Explainable Money Standard</span>
          </span>
          <span>INR (₹)</span>
        </div>
      </div>
    </div>
  );
};
