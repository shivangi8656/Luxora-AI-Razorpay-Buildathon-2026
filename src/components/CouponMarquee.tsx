import React, { useState, useEffect } from 'react';
import { Tag, Check, Sparkles, Gift, Percent, Zap, ArrowRight, ShieldCheck } from 'lucide-react';
import { useMerchant } from '../context/MerchantContext';

interface CouponItem {
  code: string;
  badge: string;
  title: string;
  description: string;
  discount: string;
  type: 'new-user' | 'atelier' | 'vip' | 'festive' | 'shipping';
}

const STATIC_COUPONS: CouponItem[] = [
  {
    code: 'WELCOME10',
    badge: 'New User Privilege',
    title: '10% Welcome Gift',
    description: 'Flat 10% off for first-time patrons',
    discount: '10% OFF',
    type: 'new-user',
  },
  {
    code: 'HAUTE20',
    badge: 'Atelier Silhouette',
    title: '20% Eveningwear Special',
    description: 'Valid on Haute Couture gowns & silk slips',
    discount: '20% OFF',
    type: 'atelier',
  },
  {
    code: 'ROYAL15',
    badge: 'VIP Patron Access',
    title: '15% Bespoke Discount',
    description: 'Privilege on orders above ₹25,000',
    discount: '15% OFF',
    type: 'vip',
  },
  {
    code: 'FESTIVE25',
    badge: 'Festive Grand Capsule',
    title: '₹2,500 Instant Rebate',
    description: 'Instant deduction on gala collections',
    discount: '₹2,500 OFF',
    type: 'festive',
  },
  {
    code: 'FIRSTBUY',
    badge: 'First Order Privilege',
    title: 'Flat 15% First Order',
    description: 'Exclusive introductory client invitation',
    discount: '15% OFF',
    type: 'new-user',
  },
  {
    code: 'WHITEGLOVE',
    badge: 'Complimentary Dispatch',
    title: 'Free Armored Delivery',
    description: 'Free courier & bespoke garment bag',
    discount: 'FREE COURIER',
    type: 'shipping',
  },
];

interface CouponMarqueeProps {
  onApplyCoupon?: (code: string) => void;
}

export const CouponMarquee: React.FC<CouponMarqueeProps> = ({ onApplyCoupon }) => {
  const { activeCampaigns, deactivatedPromoCodes } = useMerchant();
  const [copiedCode, setCopiedCode] = useState<string | null>(null);
  const [activeCouponIndex, setActiveCouponIndex] = useState(0);

  // Combine static luxury coupons with any live campaigns from the Merchant portal
  const dynamicCampaignCoupons: CouponItem[] = (activeCampaigns || [])
    .filter((c) => c.promoCode && !deactivatedPromoCodes?.some(dc => dc.toUpperCase() === c.promoCode?.toUpperCase()))
    .map((c) => ({
      code: c.promoCode!,
      badge: 'Merchant Live Campaign',
      title: c.title || 'Atelier Privilege',
      description: c.bannerAnnouncement || c.targetAudience || 'Exclusive privilege for atelier patrons',
      discount: `${c.discountPercent}% OFF`,
      type: 'atelier' as const,
    }));

  const filteredStaticCoupons = STATIC_COUPONS.filter(
    (sc) => !deactivatedPromoCodes?.some(dc => dc.toUpperCase() === sc.code.toUpperCase())
  );

  const allCoupons = [...dynamicCampaignCoupons, ...filteredStaticCoupons];

  // Rotate featured coupon periodically for the banner header
  useEffect(() => {
    const interval = setInterval(() => {
      setActiveCouponIndex((prev) => (prev + 1) % allCoupons.length);
    }, 4500);
    return () => clearInterval(interval);
  }, [allCoupons.length]);

  const handleCopyCode = (code: string, e?: React.MouseEvent) => {
    e?.stopPropagation();
    navigator.clipboard?.writeText(code);
    setCopiedCode(code);
    if (onApplyCoupon) {
      onApplyCoupon(code);
    }
    setTimeout(() => setCopiedCode(null), 2500);
  };

  const activeFeatured = allCoupons[activeCouponIndex] || allCoupons[0];

  return (
    <section className="w-full bg-[#141413] text-[#fbf9f4] border-y border-neutral-800 shadow-md font-['Archivo_Narrow'] overflow-hidden">
      
      {/* 1. Continuous Ticker / Marquee Stream */}
      <div className="relative py-2.5 bg-black border-b border-neutral-800/80 overflow-hidden">
        {/* Glow gradients on edges */}
        <div className="absolute left-0 top-0 bottom-0 w-16 bg-gradient-to-r from-black to-transparent z-10 pointer-events-none" />
        <div className="absolute right-0 top-0 bottom-0 w-16 bg-gradient-to-l from-black to-transparent z-10 pointer-events-none" />

        <div className="flex items-center gap-6 whitespace-nowrap animate-marquee hover:[animation-play-state:paused] cursor-pointer">
          {/* Repeat list twice for seamless endless marquee */}
          {[...allCoupons, ...allCoupons].map((coupon, idx) => {
            const isCopied = copiedCode === coupon.code;
            return (
              <div
                key={`${coupon.code}-${idx}`}
                onClick={() => handleCopyCode(coupon.code)}
                className="inline-flex items-center gap-2.5 px-3.5 py-1 rounded-full bg-neutral-900/90 hover:bg-neutral-800 border border-neutral-700/60 transition-all hover:border-[#fc6018] group shrink-0"
                title={`Click to copy privilege code ${coupon.code}`}
              >
                <span className="w-1.5 h-1.5 rounded-full bg-[#fc6018] animate-pulse" />
                <span className="text-[10px] uppercase font-bold tracking-widest text-[#fc6018] bg-[#fc6018]/10 px-1.5 py-0.5 rounded">
                  {coupon.badge}
                </span>
                <span className="text-xs font-semibold text-neutral-200 group-hover:text-white">
                  {coupon.title}
                </span>
                <span className="text-[11px] font-mono font-bold text-white bg-white/10 px-2 py-0.5 rounded-full border border-white/20 flex items-center gap-1">
                  <Tag className="w-2.5 h-2.5 text-[#fc6018]" />
                  <span>{coupon.code}</span>
                  {isCopied ? (
                    <Check className="w-2.5 h-2.5 text-emerald-400" />
                  ) : (
                    <span className="text-[9px] text-neutral-400 font-sans group-hover:text-amber-300">Copy</span>
                  )}
                </span>
              </div>
            );
          })}
        </div>
      </div>

      {/* 2. Interactive Spotlight Carousel Row */}
      <div className="max-w-[1440px] mx-auto px-5 sm:px-8 md:px-16 py-3.5 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs">
        
        {/* Active Featured Coupon Spotlight */}
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-[#fc6018]/20 border border-[#fc6018]/40 flex items-center justify-center shrink-0">
            <Gift className="w-4 h-4 text-[#fc6018]" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-mono uppercase tracking-widest text-[#fc6018] font-bold">
                {activeFeatured.badge}
              </span>
              <span className="text-[11px] font-bold text-white">
                {activeFeatured.title} ({activeFeatured.discount})
              </span>
            </div>
            <p className="text-[11px] text-neutral-400">
              {activeFeatured.description} • Auto-applied at Bag & Checkout
            </p>
          </div>
        </div>

        {/* Quick Copy Action for Featured Coupon */}
        <div className="flex items-center gap-2 shrink-0">
          <span className="text-[11px] text-neutral-400 font-mono hidden md:inline">
            Active Privilege:
          </span>
          <button
            onClick={() => handleCopyCode(activeFeatured.code)}
            className={`px-4 py-1.5 rounded-full font-mono text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer shadow-xs ${
              copiedCode === activeFeatured.code
                ? 'bg-emerald-600 text-white'
                : 'bg-white text-black hover:bg-[#fc6018] hover:text-white hover:scale-105'
            }`}
          >
            <Tag className="w-3 h-3 text-[#fc6018] group-hover:text-white" />
            <span>{activeFeatured.code}</span>
            {copiedCode === activeFeatured.code ? (
              <span className="text-[10px] uppercase font-sans font-bold flex items-center gap-1">
                <Check className="w-3 h-3" /> Copied & Applied!
              </span>
            ) : (
              <span className="text-[10px] uppercase font-sans text-neutral-600 hover:text-white">
                Apply Code
              </span>
            )}
          </button>
        </div>

      </div>

      {/* Tailwind CSS Marquee animation styling */}
      <style>{`
        @keyframes marquee {
          0% { transform: translateX(0%); }
          100% { transform: translateX(-50%); }
        }
        .animate-marquee {
          display: flex;
          width: max-content;
          animation: marquee 28s linear infinite;
        }
        .animate-marquee:hover {
          animation-play-state: paused;
        }
      `}</style>
    </section>
  );
};
