import React, { useState } from 'react';
import { Sparkles, ArrowRight, ShieldCheck, Mail, Globe, MapPin, Check } from 'lucide-react';

interface FooterProps {
  onOpenAtelier?: () => void;
  onSwitchToMerchant?: () => void;
  onOpenAuditTrail?: () => void;
}

export const Footer: React.FC<FooterProps> = ({
  onOpenAtelier,
  onSwitchToMerchant,
  onOpenAuditTrail,
}) => {
  const [email, setEmail] = useState('');
  const [isSubscribed, setIsSubscribed] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;
    setIsSubscribed(true);
    setTimeout(() => {
      setEmail('');
    }, 2000);
  };

  return (
    <footer id="luxora-footer" className="bg-[#101010] text-[#F8F7F4] pt-16 pb-12 border-t border-neutral-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Top: Newsletter & Haute Couture Dispatch */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 pb-14 border-b border-neutral-800/80 items-end">
          <div className="lg:col-span-6 space-y-2">
            <span className="text-[10px] uppercase tracking-[0.3em] font-semibold text-[#D9531E] block">
              The Private Atelier
            </span>
            <h3 className="font-serif text-2xl sm:text-3xl font-light text-[#F8F7F4]">
              Receive Bespoke Atelier Dispatches
            </h3>
            <p className="text-xs text-neutral-400 font-light max-w-md">
              Private invitations to seasonal vernissages, private boutique fittings, and early previews of limited-run capsule releases.
            </p>
          </div>

          <div className="lg:col-span-6">
            {isSubscribed ? (
              <div className="p-3.5 bg-neutral-900 border border-emerald-500/40 rounded text-xs text-emerald-400 font-medium flex items-center gap-2">
                <Check className="w-4 h-4 text-emerald-400" />
                <span>Thank you. You are registered for private atelier invitations and capsule drops.</span>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="flex space-x-2">
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Enter your email address"
                  required
                  className="flex-1 bg-neutral-900 border border-neutral-700 px-4 py-3 text-xs text-white placeholder:text-neutral-500 focus:outline-none focus:border-white"
                />
                <button
                  type="submit"
                  className="px-6 py-3 bg-[#F8F7F4] hover:bg-[#D9531E] text-[#121212] hover:text-white text-xs uppercase tracking-[0.2em] font-medium transition-colors cursor-pointer"
                >
                  Join
                </button>
              </form>
            )}
          </div>
        </div>

        {/* Middle: Brand Ethos, Atelier Boutiques, Concierge */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 py-12 text-xs font-light text-neutral-400">
          
          {/* Flagship Boutiques */}
          <div className="space-y-3">
            <h4 className="font-medium text-white uppercase tracking-[0.2em] text-[11px]">
              Flagship Boutiques
            </h4>
            <ul className="space-y-1.5 text-[11px]">
              <li>Paris — 14 Rue du Faubourg Saint-Honoré</li>
              <li>London — 32 Mount Street, Mayfair</li>
              <li>Milan — Via Montenapoleone 8</li>
              <li>New York — 742 Madison Avenue</li>
              <li>Tokyo — 6-10-1 Ginza, Chuo-ku</li>
            </ul>
          </div>

          {/* Client Concierge */}
          <div className="space-y-3">
            <h4 className="font-medium text-white uppercase tracking-[0.2em] text-[11px]">
              Client Concierge
            </h4>
            <ul className="space-y-1.5 text-[11px]">
              <li>Bespoke Alteration Appointments</li>
              <li>White Glove Courier Protocol</li>
              <li>Complimentary Global Returns (30 Days)</li>
              <li>Care & Provenance Archiving</li>
              <li>concierge@luxora-atelier.com</li>
            </ul>
          </div>

          {/* Maison Principles */}
          <div className="space-y-3">
            <h4 className="font-medium text-white uppercase tracking-[0.2em] text-[11px]">
              Maison Charter
            </h4>
            <ul className="space-y-1.5 text-[11px]">
              <li>Biella Wool & Mongolian Cashmere</li>
              <li>100% Traceable Silk Supply Chain</li>
              <li>Zero Synthetic Microfibers</li>
              <li>Artisanal Heritage Guilds</li>
              <li>Climate-Neutral Logistics</li>
            </ul>
          </div>

          {/* Intelligence & Design */}
          <div className="space-y-3">
            <h4 className="font-medium text-white uppercase tracking-[0.2em] text-[11px]">
              Intelligence & Design
            </h4>
            <p className="text-[11px] leading-relaxed text-neutral-400">
              LUXORA integrates algorithmic neural styling models with master atelier drape logic, preserving classical bespoke craftsmanship with modern precision.
            </p>
            <div className="pt-2 flex flex-col gap-1.5">
              {onSwitchToMerchant && (
                <button onClick={onSwitchToMerchant} className="text-left text-neutral-300 hover:text-white underline cursor-pointer text-[11px]">
                  LUXORA Business Portal
                </button>
              )}
              {onOpenAuditTrail && (
                <button onClick={onOpenAuditTrail} className="text-left text-neutral-300 hover:text-white underline cursor-pointer text-[11px]">
                  Live Cryptographic Audit Trail
                </button>
              )}
            </div>
          </div>

        </div>

        {/* Bottom bar */}
        <div className="pt-8 border-t border-neutral-900 flex flex-col sm:flex-row items-center justify-between text-[10px] uppercase tracking-[0.25em] text-neutral-500 gap-4">
          <span>© {new Date().getFullYear()} LUXORA Haute Couture S.A. All rights reserved.</span>
          <div className="flex space-x-6">
            <span>Privacy Policy</span>
            <span>Terms of Service</span>
            <span>Accessibility</span>
          </div>
        </div>

      </div>
    </footer>
  );
};
