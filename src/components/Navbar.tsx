import React, { useState, useRef, useEffect } from 'react';
import { 
  ShoppingBag, 
  Heart, 
  Sparkles, 
  User as UserIcon, 
  ShieldCheck, 
  Store, 
  Home,
  Compass,
  Layers,
  Menu,
  X,
  Settings,
  LogOut,
  Package,
  Sliders,
  ChevronDown,
  CheckCircle2,
  Building,
  ArrowRight
} from 'lucide-react';
import { Currency } from '../types';
import { CURRENCIES } from '../data/products';
import { useAuth } from '../context/AuthContext';
import { useAudit } from '../context/AuditContext';

interface NavbarProps {
  activeTab: 'shop' | 'lookbook' | 'atelier';
  setActiveTab: (tab: 'shop' | 'lookbook' | 'atelier') => void;
  currency: Currency;
  setCurrency: (c: Currency) => void;
  cartCount: number;
  wishlistCount: number;
  onOpenCart: () => void;
  onOpenWishlist: () => void;
  onOpenAtelier: () => void;
  onOpenAuth: () => void;
  onToggleSearch: () => void;
  onSwitchToMerchant?: () => void;
  onSwitchToLanding?: () => void;
  onOpenAuditTrail?: () => void;
  onOpenSettings?: (tab?: 'orders' | 'profile' | 'security' | 'preferences') => void;
  onOpenAgentBuyer?: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  activeTab,
  setActiveTab,
  currency,
  setCurrency,
  cartCount,
  wishlistCount,
  onOpenCart,
  onOpenWishlist,
  onOpenAtelier,
  onOpenAuth,
  onToggleSearch,
  onSwitchToMerchant,
  onSwitchToLanding,
  onOpenAuditTrail,
  onOpenSettings,
  onOpenAgentBuyer,
}) => {
  const { user, handleSignOut } = useAuth();
  const { logs } = useAudit();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [isProfileDropdownOpen, setIsProfileDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown on outside click or Escape
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsProfileDropdownOpen(false);
      }
    };
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setIsProfileDropdownOpen(false);
        setMobileMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, []);

  const handleAtelierClick = () => {
    if (!user) {
      onOpenAuth();
    } else {
      onOpenAtelier();
    }
  };

  const handleProfileClick = () => {
    if (!user) {
      onOpenAuth();
    } else {
      setIsProfileDropdownOpen(prev => !prev);
    }
  };

  const handleOpenTab = (tab: 'orders' | 'profile' | 'security' | 'preferences') => {
    setIsProfileDropdownOpen(false);
    if (onOpenSettings) {
      onOpenSettings(tab);
    } else if (onOpenAuditTrail) {
      onOpenAuditTrail();
    }
  };

  const onSignOutClick = async () => {
    setIsProfileDropdownOpen(false);
    setMobileMenuOpen(false);
    await handleSignOut();
    if (onSwitchToLanding) {
      onSwitchToLanding();
    }
  };

  return (
    <nav className="fixed top-4 md:top-6 left-1/2 -translate-x-1/2 w-[94%] max-w-[1440px] rounded-full glass-nav shadow-sm hover:shadow-md transition-all duration-300 z-50 px-6 sm:px-8 py-3 flex justify-between items-center">
      
      {/* Brand Logo */}
      <div className="flex items-center gap-3">
        <button 
          onClick={() => {
            if (user) {
              // Authenticated Buyer: Preserve current page/view, smoothly scroll to top
              window.scrollTo({ top: 0, behavior: 'smooth' });
            } else {
              // Not signed in: Take user to public landing page top
              if (onSwitchToLanding) {
                onSwitchToLanding();
              }
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }
          }}
          className="text-xl sm:text-2xl font-bold tracking-tighter text-black hover:opacity-80 transition-opacity font-['Archivo_Narrow'] cursor-pointer"
          title={user ? "Scroll to Top" : "LUXORA Maison"}
        >
          LUXORA
        </button>
      </div>

      {/* Navigation Links */}
      <div className="hidden md:flex items-center gap-8 text-[15px] font-medium font-['Archivo_Narrow']">
        <button
          onClick={handleAtelierClick}
          className={`pb-0.5 transition-all duration-150 flex items-center gap-1.5 cursor-pointer ${
            activeTab === 'atelier'
              ? 'text-black border-b-2 border-black font-semibold'
              : 'text-[#444748]/70 hover:text-black'
          }`}
          title={user ? "AI Personal Stylist" : "Sign in to access AI Stylist"}
        >
          <Sparkles className="w-3.5 h-3.5 text-[#a83900]" />
          <span>AI Stylist</span>
        </button>

        <button
          onClick={() => setActiveTab('shop')}
          className={`pb-0.5 transition-colors duration-200 cursor-pointer ${
            activeTab === 'shop'
              ? 'text-black border-b-2 border-black font-semibold'
              : 'text-[#444748]/70 hover:text-black'
          }`}
        >
          Catalog
        </button>

        <button
          onClick={() => setActiveTab('lookbook')}
          className={`pb-0.5 transition-colors duration-200 cursor-pointer ${
            activeTab === 'lookbook'
              ? 'text-black border-b-2 border-black font-semibold'
              : 'text-[#444748]/70 hover:text-black'
          }`}
        >
          Lookbook
        </button>
      </div>

      {/* Trailing Icon Actions */}
      <div className="flex items-center gap-3 sm:gap-4 text-black relative">
        {/* Wishlist Icon */}
        <button
          onClick={onOpenWishlist}
          aria-label="Wishlist"
          className="p-1.5 hover:scale-105 transition-transform duration-150 relative cursor-pointer"
          title="Curated Wishlist"
        >
          <Heart className="w-5 h-5 text-neutral-800 hover:text-[#a83900] transition-colors" />
          {wishlistCount > 0 && (
            <span className="absolute -top-1 -right-1 w-4 h-4 bg-[#a83900] text-white text-[9px] font-bold flex items-center justify-center rounded-full">
              {wishlistCount}
            </span>
          )}
        </button>

        {/* Shopping Bag Button */}
        <button
          onClick={onOpenCart}
          aria-label="Shopping Bag"
          className="p-1.5 hover:scale-105 transition-transform duration-150 relative cursor-pointer"
        >
          <ShoppingBag className="w-5 h-5 text-neutral-800 hover:text-black transition-colors" />
          {cartCount > 0 && (
            <span className="absolute -top-1 -right-1 w-4 h-4 bg-black text-white text-[9px] font-bold flex items-center justify-center rounded-full">
              {cartCount}
            </span>
          )}
        </button>

        {/* Account Profile / Dropdown Trigger */}
        <div className="relative" ref={dropdownRef}>
          <button
            onClick={handleProfileClick}
            aria-label="Account Access"
            className="p-1 hover:scale-105 transition-transform duration-150 relative cursor-pointer flex items-center gap-1.5 rounded-full"
            title={user ? `Signed in as ${user.displayName || user.email}` : "Sign In"}
          >
            {user ? (
              <div className="w-7 h-7 rounded-full bg-black text-white text-xs font-semibold flex items-center justify-center border border-[#fc6018] shadow-xs">
                {user.displayName ? user.displayName.charAt(0).toUpperCase() : user.email?.charAt(0).toUpperCase()}
              </div>
            ) : (
              <div className="w-7 h-7 rounded-full bg-neutral-100 hover:bg-neutral-200 text-neutral-800 flex items-center justify-center transition-colors">
                <UserIcon className="w-4 h-4" />
              </div>
            )}
          </button>

          {/* User Profile Dropdown Menu */}
          {user && isProfileDropdownOpen && (
            <div className="absolute right-0 top-full mt-3 w-80 sm:w-88 bg-white/95 backdrop-blur-2xl border border-black/10 rounded-2xl shadow-2xl overflow-hidden z-50 animate-in fade-in zoom-in-95 duration-150 font-['Archivo_Narrow']">
              
              {/* Patron Header */}
              <div className="p-4 bg-[#fbf9f4] border-b border-black/10 flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-black text-white font-bold flex items-center justify-center text-sm border-2 border-[#fc6018] shadow-xs">
                    {user.displayName ? user.displayName.charAt(0).toUpperCase() : user.email?.charAt(0).toUpperCase()}
                  </div>
                  <div className="min-w-0">
                    <h4 className="font-bold text-sm text-black truncate">
                      {user.displayName || 'Haute Couture Patron'}
                    </h4>
                    <p className="text-xs text-neutral-500 font-mono truncate">
                      {user.email || 'patron@luxora.ai'}
                    </p>
                    <div className="flex items-center gap-1.5 mt-1">
                      <span className="inline-block w-2 h-2 rounded-full bg-[#fc6018] animate-pulse" />
                      <span className="text-[10px] uppercase tracking-wider font-bold text-neutral-900 bg-neutral-100 border border-neutral-300 px-2 py-0.2 rounded-full">
                        {user.role === 'merchant' ? 'Business Admin' : 'Maison VIP Patron'}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Menu Options */}
              <div className="p-2 space-y-1 text-sm">
                
                {/* 1. Profile */}
                <button
                  onClick={() => handleOpenTab('profile')}
                  className="w-full px-3 py-2.5 rounded-xl text-left hover:bg-[#fbf9f4] text-neutral-800 hover:text-black flex items-center justify-between group transition-colors cursor-pointer"
                >
                  <div className="flex items-center gap-2.5">
                    <UserIcon className="w-4 h-4 text-black" />
                    <span className="font-medium text-xs">Profile & Sizing</span>
                  </div>
                  <ArrowRight className="w-3.5 h-3.5 text-neutral-400 group-hover:text-black group-hover:translate-x-0.5 transition-all" />
                </button>

                {/* 2. My Orders & Deliveries */}
                <button
                  onClick={() => handleOpenTab('orders')}
                  className="w-full px-3 py-2.5 rounded-xl text-left hover:bg-[#fbf9f4] text-neutral-800 hover:text-black flex items-center justify-between group transition-colors cursor-pointer"
                >
                  <div className="flex items-center gap-2.5">
                    <Package className="w-4 h-4 text-[#a83900]" />
                    <span className="font-medium text-xs">Orders & Invoices</span>
                  </div>
                  <ArrowRight className="w-3.5 h-3.5 text-neutral-400 group-hover:text-black group-hover:translate-x-0.5 transition-all" />
                </button>

                {/* 3. Curated Wishlist */}
                <button
                  onClick={() => {
                    setIsProfileDropdownOpen(false);
                    onOpenWishlist();
                  }}
                  className="w-full px-3 py-2.5 rounded-xl text-left hover:bg-[#fbf9f4] text-neutral-800 hover:text-black flex items-center justify-between group transition-colors cursor-pointer"
                >
                  <div className="flex items-center gap-2.5">
                    <Heart className="w-4 h-4 text-[#a83900]" />
                    <span className="font-medium text-xs">Curated Wishlist</span>
                  </div>
                  {wishlistCount > 0 && (
                    <span className="text-[10px] font-bold bg-[#a83900] text-white px-2 py-0.5 rounded-full">
                      {wishlistCount}
                    </span>
                  )}
                </button>

                {/* 4. Account Settings */}
                <button
                  onClick={() => handleOpenTab('preferences')}
                  className="w-full px-3 py-2.5 rounded-xl text-left hover:bg-[#fbf9f4] text-neutral-800 hover:text-black flex items-center justify-between group transition-colors cursor-pointer"
                >
                  <div className="flex items-center gap-2.5">
                    <Settings className="w-4 h-4 text-neutral-700" />
                    <span className="font-medium text-xs">Account Settings</span>
                  </div>
                  <ArrowRight className="w-3.5 h-3.5 text-neutral-400 group-hover:text-black group-hover:translate-x-0.5 transition-all" />
                </button>

                {/* 5. Help & Security Audit */}
                <button
                  onClick={() => handleOpenTab('security')}
                  className="w-full px-3 py-2.5 rounded-xl text-left hover:bg-[#fbf9f4] text-neutral-800 hover:text-black flex items-center justify-between group transition-colors cursor-pointer"
                >
                  <div className="flex items-center gap-2.5">
                    <ShieldCheck className="w-4 h-4 text-emerald-600" />
                    <span className="font-medium text-xs">Help & Security Audit</span>
                  </div>
                  <ArrowRight className="w-3.5 h-3.5 text-neutral-400 group-hover:text-black group-hover:translate-x-0.5 transition-all" />
                </button>

                {/* 6. Switch to LUXORA Business */}
                {onSwitchToMerchant && (
                  <button
                    onClick={() => {
                      setIsProfileDropdownOpen(false);
                      onSwitchToMerchant();
                    }}
                    className="w-full px-3 py-2.5 rounded-xl text-left bg-neutral-50 hover:bg-neutral-100 text-black flex items-center justify-between group transition-colors border border-black/5 cursor-pointer"
                  >
                    <div className="flex items-center gap-2.5">
                      <Building className="w-4 h-4 text-amber-700" />
                      <span className="font-semibold text-xs">Switch to LUXORA Business</span>
                    </div>
                    <ArrowRight className="w-3.5 h-3.5 text-black group-hover:translate-x-0.5 transition-transform" />
                  </button>
                )}

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

        {/* Mobile menu trigger */}
        <button
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          className="md:hidden p-1 text-black cursor-pointer"
        >
          {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </button>
      </div>

      {/* Mobile Drawer Navigation */}
      {mobileMenuOpen && (
        <div className="absolute top-full left-0 right-0 mt-3 p-4 bg-[#fbf9f4] border border-[#e4e2dd] rounded-2xl shadow-xl flex flex-col gap-3 md:hidden z-50 font-['Archivo_Narrow']">
          <button
            onClick={() => { setActiveTab('shop'); setMobileMenuOpen(false); }}
            className="text-left font-semibold text-sm py-2 px-3 rounded-xl hover:bg-neutral-100 cursor-pointer"
          >
            Catalog
          </button>
          <button
            onClick={() => { setActiveTab('lookbook'); setMobileMenuOpen(false); }}
            className="text-left font-semibold text-sm py-2 px-3 rounded-xl hover:bg-neutral-100 cursor-pointer"
          >
            Lookbook
          </button>
          <button
            onClick={() => { handleAtelierClick(); setMobileMenuOpen(false); }}
            className="text-left font-semibold text-sm py-2 px-3 rounded-xl hover:bg-neutral-100 flex items-center gap-2 text-[#a83900] cursor-pointer"
          >
            <Sparkles className="w-4 h-4" />
            <span>AI Stylist</span>
          </button>
          {user && (
            <>
              <button
                onClick={() => { handleOpenTab('orders'); setMobileMenuOpen(false); }}
                className="text-left font-semibold text-sm py-2 px-3 rounded-xl hover:bg-neutral-100 flex items-center gap-2 text-black cursor-pointer"
              >
                <Package className="w-4 h-4 text-[#a83900]" />
                <span>My Orders & Invoices</span>
              </button>
              <button
                onClick={() => { handleOpenTab('security'); setMobileMenuOpen(false); }}
                className="text-left font-semibold text-sm py-2 px-3 rounded-xl hover:bg-neutral-100 flex items-center gap-2 text-black cursor-pointer"
              >
                <ShieldCheck className="w-4 h-4" />
                <span>Settings & Security Audit</span>
              </button>
              <button
                onClick={onSignOutClick}
                className="text-left font-bold text-xs py-2 px-3 rounded-xl bg-rose-50 text-rose-700 border border-rose-200 uppercase tracking-wider flex items-center gap-2 cursor-pointer mt-1"
              >
                <LogOut className="w-3.5 h-3.5" />
                <span>Sign Out</span>
              </button>
            </>
          )}
          {!user && onSwitchToLanding && (
            <button
              onClick={() => { onSwitchToLanding(); setMobileMenuOpen(false); }}
              className="text-left font-semibold text-sm py-2 px-3 rounded-xl hover:bg-neutral-100 cursor-pointer"
            >
              Public Landing Page
            </button>
          )}
        </div>
      )}
    </nav>
  );
};
