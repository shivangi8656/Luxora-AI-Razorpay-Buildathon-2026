import React, { useState, useRef, useEffect, useTransition } from 'react';
import { 
  ShoppingBag, 
  Store, 
  Sparkles, 
  ArrowRight, 
  Layers, 
  Check, 
  TrendingUp, 
  Database, 
  BarChart3, 
  ShieldCheck, 
  Search, 
  Sliders, 
  CreditCard, 
  Truck,
  ArrowUpRight,
  Zap,
  Tag,
  Eye,
  RefreshCw,
  Clock,
  Sparkle,
  Menu,
  X
} from 'lucide-react';
import { motion, AnimatePresence, useMotionValue, useSpring } from 'motion/react';
import { useAuth } from '../context/AuthContext';

interface LandingHeroProps {
  onSelectBuyerMode: () => void;
  onSelectMerchantMode: () => void;
  onOpenAuditTrail: () => void;
  onOpenAuth: (role?: 'buyer' | 'merchant') => void;
  onOpenBag: () => void;
  onOpenAtelier: () => void;
  cartCount?: number;
}

export const LandingHero: React.FC<LandingHeroProps> = ({
  onSelectBuyerMode,
  onSelectMerchantMode,
  onOpenAuditTrail,
  onOpenAuth,
  onOpenBag,
  onOpenAtelier,
  cartCount = 0,
}) => {
  const { user } = useAuth();
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const cinemaVideoRef = useRef<HTMLVideoElement | null>(null);
  const businessVideoRef = useRef<HTMLVideoElement | null>(null);
  const heroSectionRef = useRef<HTMLElement | null>(null);
  const businessHeroSectionRef = useRef<HTMLElement | null>(null);

  // Parallax motion values for depth-enhanced editorial motion
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);

  // Restrained, silky luxury spring physics for editorial weight
  const springX = useSpring(mouseX, { damping: 28, stiffness: 90, mass: 0.5 });
  const springY = useSpring(mouseY, { damping: 28, stiffness: 90, mass: 0.5 });

  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);
  const [scrollYOffset, setScrollYOffset] = useState(0);
  const [videoError, setVideoError] = useState(false);
  const [businessVideoError, setBusinessVideoError] = useState(false);
  const [mobileNavOpen, setMobileNavOpen] = useState(false);
  
  // Central Mode Switch: 'buyer' | 'merchant'
  const [landingMode, setLandingMode] = useState<'buyer' | 'merchant'>('buyer');
  const [displayMode, setDisplayMode] = useState<'buyer' | 'merchant'>('buyer');
  const [, startTransition] = useTransition();

  const handleToggleMode = (targetMode?: 'buyer' | 'merchant') => {
    const nextMode = targetMode || (displayMode === 'buyer' ? 'merchant' : 'buyer');
    if (nextMode === displayMode) return;
    
    // Immediate visual response for buttery smooth 60/120fps sliding animation
    setDisplayMode(nextMode);
    
    // Defer heavy DOM mounting/unmounting so it does not block the frame rate of the toggle
    startTransition(() => {
      setLandingMode(nextMode);
    });

    window.dispatchEvent(
      new CustomEvent('luxoraModeChange', {
        detail: { mode: nextMode === 'merchant' ? 'business' : 'buyer' }
      })
    );
  };

  // Detect user preference for reduced motion
  useEffect(() => {
    if (typeof window === 'undefined') return;
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    setPrefersReducedMotion(mediaQuery.matches);
    const listener = (e: MediaQueryListEvent) => setPrefersReducedMotion(e.matches);
    mediaQuery.addEventListener('change', listener);
    return () => mediaQuery.removeEventListener('change', listener);
  }, []);

  // Restrained scroll parallax
  useEffect(() => {
    if (prefersReducedMotion) return;
    let ticking = false;
    const handleScroll = () => {
      if (!ticking) {
        window.requestAnimationFrame(() => {
          const scroll = window.scrollY;
          if (scroll < (typeof window !== 'undefined' ? window.innerHeight : 900)) {
            setScrollYOffset(scroll * 0.08);
          }
          ticking = false;
        });
        ticking = true;
      }
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, [prefersReducedMotion]);

  // Handle mouse move on the Hero section for opposite-direction parallax
  const handleHeroMouseMove = (e: React.MouseEvent<HTMLElement>) => {
    if (prefersReducedMotion) return;
    // Skip on touch/mobile devices
    if (typeof window !== 'undefined' && window.matchMedia('(hover: none)').matches) return;

    const heroEl = heroSectionRef.current;
    if (!heroEl) return;
    const rect = heroEl.getBoundingClientRect();

    // Normalized coordinates from -1 (left/top) to +1 (right/bottom)
    const normalizedX = (e.clientX - (rect.left + rect.width / 2)) / (rect.width / 2);
    const normalizedY = (e.clientY - (rect.top + rect.height / 2)) / (rect.height / 2);

    const clampedX = Math.max(-1, Math.min(1, normalizedX));
    const clampedY = Math.max(-1, Math.min(1, normalizedY));

    // Move in the OPPOSITE direction of the cursor for physical depth
    // Moving up to 20px horizontally and 14px vertically
    const targetX = -clampedX * 20;
    const targetY = -clampedY * 14;

    mouseX.set(targetX);
    mouseY.set(targetY);
  };

  const handleHeroMouseLeave = () => {
    // Smoothly return video to neutral center
    mouseX.set(0);
    mouseY.set(0);
  };

  useEffect(() => {
    const playCurrentVideo = () => {
      const activeRef = landingMode === 'buyer' ? videoRef.current : businessVideoRef.current;
      if (activeRef) {
        activeRef.defaultMuted = true;
        activeRef.muted = true;
        activeRef.setAttribute('muted', '');
        activeRef.setAttribute('playsinline', '');
        const playPromise = activeRef.play();
        if (playPromise !== undefined) {
          playPromise.catch(() => {
            // Autoplay waiting for gesture or permission
          });
        }
      }
    };

    playCurrentVideo();

    // Browser/iframe autoplay unlock on first user gesture (click, scroll, touch)
    const handleGestureUnlock = () => {
      playCurrentVideo();
      window.removeEventListener('click', handleGestureUnlock);
      window.removeEventListener('touchstart', handleGestureUnlock);
      window.removeEventListener('scroll', handleGestureUnlock);
    };

    window.addEventListener('click', handleGestureUnlock, { passive: true });
    window.addEventListener('touchstart', handleGestureUnlock, { passive: true });
    window.addEventListener('scroll', handleGestureUnlock, { passive: true });

    return () => {
      window.removeEventListener('click', handleGestureUnlock);
      window.removeEventListener('touchstart', handleGestureUnlock);
      window.removeEventListener('scroll', handleGestureUnlock);
    };
  }, [landingMode]);

  const handleBuyerSignIn = () => {
    if (user) {
      onSelectBuyerMode();
    } else {
      onOpenAuth('buyer');
    }
  };

  const handleMerchantSignIn = () => {
    if (user && user.role === 'merchant') {
      onSelectMerchantMode();
    } else {
      onOpenAuth('merchant');
    }
  };

  const handleMerchantAction = () => {
    if (user && user.role === 'merchant') {
      onSelectMerchantMode();
    } else {
      onOpenAuth('merchant');
    }
  };

  const scrollToElement = (id: string) => {
    const el = document.getElementById(id);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <div className="font-['Archivo_Narrow'] min-h-screen bg-[#fbf9f4] text-[#1b1c19] selection:bg-[#fc6018] selection:text-[#531800] relative overflow-x-hidden antialiased">
      
      {/* 1. TOP NAVBAR WITH DYNAMIC BUYER/MERCHANT TOGGLE */}
      <header className="fixed top-3 sm:top-4 left-1/2 -translate-x-1/2 w-[94%] max-w-[1440px] rounded-full glass-nav transition-all duration-300 z-50 px-4 sm:px-8 py-2 sm:py-2.5 shadow-sm">
        <div className="relative flex items-center justify-between w-full gap-2 sm:gap-4">
          
          {/* Brand Title */}
          <div className="flex items-center shrink-0">
            <button
              onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
              className="text-lg sm:text-2xl font-bold tracking-tighter text-black hover:opacity-80 transition-opacity font-['Archivo_Narrow'] cursor-pointer flex items-center gap-1.5"
            >
              <span>LUXORA</span>
              {landingMode === 'merchant' && (
                <span className="text-[10px] sm:text-xs font-semibold uppercase tracking-wider bg-black text-white px-2 py-0.5 rounded-full">
                  Business
                </span>
              )}
            </button>
          </div>

          {/* LUXORA · BUYER / BUSINESS TOGGLE - Symmetrical dual-slot with centered text */}
          <div
            id="hdr-toggle-container"
            role="switch"
            aria-checked={displayMode === 'merchant'}
            tabIndex={0}
            onClick={() => handleToggleMode()}
            onKeyDown={(e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                handleToggleMode();
              }
            }}
            className="relative z-10 w-36 sm:w-44 h-8 sm:h-9.5 rounded-full p-0.5 sm:p-1 flex items-center cursor-pointer group outline-none focus-visible:ring-2 focus-visible:ring-neutral-400 select-none justify-between active:scale-[0.985] transition-transform duration-150 shrink-0"
            style={{
              background: 'linear-gradient(180deg, #eae8e1 0%, #dedbd2 100%)',
              boxShadow: 'inset 0 2px 4px rgba(0,0,0,0.08), inset 0 -1px 2px rgba(255,255,255,0.8), 0 1px 2px rgba(0,0,0,0.04)',
              border: '1px solid #d4d0c5',
              willChange: 'transform',
            }}
          >
            {/* Sliding thumb - Hardware-accelerated smooth spring transition */}
            <motion.div
              id="hdr-toggle-thumb"
              className="absolute top-0.5 sm:top-1 bottom-0.5 sm:bottom-1 left-0.5 sm:left-1 w-[calc(50%-2px)] sm:w-[calc(50%-4px)] rounded-full z-0 pointer-events-none"
              animate={{
                x: displayMode === 'merchant' ? '100%' : '0%',
              }}
              transition={{
                type: 'spring',
                stiffness: 500,
                damping: 38,
                mass: 0.5,
              }}
              style={{
                background: 'linear-gradient(180deg, #1b1c19 0%, #000000 100%)',
                boxShadow: '0 2px 6px rgba(0,0,0,0.28), inset 0 1px 1px rgba(255,255,255,0.22)',
                willChange: 'transform',
                transform: 'translateZ(0)',
              }}
            />

            {/* Buyer Segment - Centered inside toggle's left half */}
            <div
              id="hdr-buyer-segment"
              onClick={(e) => {
                e.stopPropagation();
                handleToggleMode('buyer');
              }}
              className="relative z-10 w-1/2 h-full flex items-center justify-center text-center cursor-pointer px-1"
            >
              <span
                id="hdr-toggle-text-buyer"
                className={`w-full text-center flex items-center justify-center text-[11px] sm:text-xs tracking-wide transition-colors duration-200 select-none font-['Archivo_Narrow'] leading-none ${
                  displayMode === 'buyer'
                    ? 'font-bold text-white'
                    : 'font-medium text-neutral-600 group-hover:text-neutral-900'
                }`}
              >
                Buyer
              </span>
            </div>

            {/* Business Segment - Centered inside toggle's right half */}
            <div
              id="hdr-business-segment"
              onClick={(e) => {
                e.stopPropagation();
                handleToggleMode('merchant');
              }}
              className="relative z-10 w-1/2 h-full flex items-center justify-center text-center cursor-pointer px-1"
            >
              <span
                id="hdr-business-label"
                className={`w-full text-center flex items-center justify-center text-[11px] sm:text-xs tracking-wide transition-colors duration-200 select-none font-['Archivo_Narrow'] leading-none ${
                  displayMode === 'merchant'
                    ? 'font-bold text-white'
                    : 'font-medium text-neutral-600 group-hover:text-neutral-900'
                }`}
              >
                Business
              </span>
            </div>
          </div>

          {/* Desktop Navigation Links */}
          {landingMode === 'buyer' ? (
            /* Buyer Top Navigation */
            <div className="hidden md:flex items-center gap-6">
              <nav className="flex items-center gap-6 text-[15px] font-medium font-['Archivo_Narrow']">
                <button
                  onClick={onSelectBuyerMode}
                  className="text-[#444748] hover:text-black transition-colors cursor-pointer"
                >
                  Shop
                </button>
                <button
                  onClick={() => scrollToElement('buyer-how-it-works')}
                  className="text-[#444748] hover:text-black transition-colors cursor-pointer"
                >
                  How It Works
                </button>
                <button
                  onClick={() => {
                    if (user) {
                      onOpenAtelier();
                    } else {
                      onOpenAuth('buyer');
                    }
                  }}
                  className="text-[#444748] hover:text-black transition-colors flex items-center gap-1.5 cursor-pointer"
                >
                  <Sparkles className="w-3.5 h-3.5 text-[#a83900]" />
                  <span>AI Shopping Agent</span>
                </button>
                <button
                  onClick={() => {
                    if (user) {
                      onOpenAuditTrail();
                    } else {
                      onOpenAuth('buyer');
                    }
                  }}
                  className="text-[#444748] hover:text-black transition-colors cursor-pointer"
                >
                  Orders
                </button>
              </nav>

              <div className="flex items-center gap-3">
                <button
                  onClick={handleBuyerSignIn}
                  className="text-sm font-semibold text-black hover:opacity-75 transition-opacity px-3 py-1.5 cursor-pointer font-['Archivo_Narrow']"
                >
                  {user && user.role === 'buyer' ? (user.displayName || 'My Account') : 'Sign In'}
                </button>
                <button
                  onClick={onSelectBuyerMode}
                  className="px-5 py-2 rounded-full bg-black text-white text-sm font-semibold shadow-sm hover:shadow-md hover:bg-neutral-800 hover:scale-105 transition-all duration-200 cursor-pointer font-['Archivo_Narrow']"
                >
                  Get Started
                </button>
              </div>
            </div>
          ) : (
            /* Merchant Top Navigation */
            <div className="hidden md:flex items-center gap-6">
              <nav className="flex items-center gap-6 text-[15px] font-medium font-['Archivo_Narrow']">
                <button
                  onClick={() => scrollToElement('merchant-benefits')}
                  className="text-[#444748] hover:text-black transition-colors cursor-pointer"
                >
                  Product
                </button>
                <button
                  onClick={() => scrollToElement('merchant-how-it-works')}
                  className="text-[#444748] hover:text-black transition-colors cursor-pointer"
                >
                  How It Works
                </button>
                <button
                  onClick={() => scrollToElement('merchant-ai-agent')}
                  className="text-[#444748] hover:text-black transition-colors flex items-center gap-1.5 cursor-pointer"
                >
                  <Sparkles className="w-3.5 h-3.5 text-[#a83900]" />
                  <span>AI Sales Agent</span>
                </button>
                <button
                  onClick={() => scrollToElement('merchant-catalog')}
                  className="text-[#444748] hover:text-black transition-colors cursor-pointer"
                >
                  Catalog
                </button>
                <button
                  onClick={() => scrollToElement('merchant-analytics')}
                  className="text-[#444748] hover:text-black transition-colors cursor-pointer"
                >
                  Orders & Analytics
                </button>
              </nav>

              <div className="flex items-center gap-3">
                <button
                  onClick={handleMerchantSignIn}
                  className="text-sm font-semibold text-black hover:opacity-75 transition-opacity px-3 py-1.5 cursor-pointer font-['Archivo_Narrow']"
                >
                  {user && user.role === 'merchant' ? (user.displayName || 'Business Portal') : 'Sign In'}
                </button>
                <button
                  onClick={handleMerchantAction}
                  className="px-5 py-2 rounded-full bg-black text-white text-sm font-semibold shadow-sm hover:shadow-md hover:bg-neutral-800 hover:scale-105 transition-all duration-200 cursor-pointer font-['Archivo_Narrow']"
                >
                  Get Started
                </button>
              </div>
            </div>
          )}

          {/* Mobile Menu Toggle Button */}
          <div className="flex md:hidden items-center">
            <button
              onClick={() => setMobileNavOpen((prev) => !prev)}
              className="p-1.5 rounded-full text-neutral-800 hover:bg-neutral-100 hover:text-black transition-colors cursor-pointer"
              aria-label="Toggle Navigation Menu"
            >
              {mobileNavOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>

        </div>

        {/* Mobile Dropdown Navigation Drawer */}
        <AnimatePresence>
          {mobileNavOpen && (
            <motion.div
              initial={{ opacity: 0, y: -10, scale: 0.98 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -10, scale: 0.98 }}
              transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
              className="absolute top-full left-0 right-0 mt-3 p-4 sm:p-5 bg-white/95 backdrop-blur-2xl border border-black/10 rounded-3xl shadow-2xl flex flex-col gap-2.5 font-['Archivo_Narrow'] z-50"
            >
              {landingMode === 'buyer' ? (
                <>
                  <button
                    onClick={() => { onSelectBuyerMode(); setMobileNavOpen(false); }}
                    className="w-full text-left py-2.5 px-3.5 rounded-xl hover:bg-neutral-100 font-semibold text-sm flex items-center justify-between text-neutral-900 cursor-pointer"
                  >
                    <span>Explore Collection</span>
                    <ArrowRight className="w-4 h-4 text-neutral-400" />
                  </button>
                  <button
                    onClick={() => { scrollToElement('buyer-how-it-works'); setMobileNavOpen(false); }}
                    className="w-full text-left py-2.5 px-3.5 rounded-xl hover:bg-neutral-100 font-semibold text-sm text-neutral-700 cursor-pointer"
                  >
                    How It Works
                  </button>
                  <button
                    onClick={() => {
                      setMobileNavOpen(false);
                      if (user) onOpenAtelier();
                      else onOpenAuth('buyer');
                    }}
                    className="w-full text-left py-2.5 px-3.5 rounded-xl hover:bg-neutral-100 font-semibold text-sm flex items-center gap-2 text-[#a83900] cursor-pointer"
                  >
                    <Sparkles className="w-4 h-4" />
                    <span>AI Personal Stylist</span>
                  </button>
                  <button
                    onClick={() => {
                      setMobileNavOpen(false);
                      if (user) onOpenAuditTrail();
                      else onOpenAuth('buyer');
                    }}
                    className="w-full text-left py-2.5 px-3.5 rounded-xl hover:bg-neutral-100 font-semibold text-sm text-neutral-700 cursor-pointer"
                  >
                    Orders & Shipments
                  </button>
                  <div className="pt-2 border-t border-neutral-100 flex flex-col gap-2">
                    <button
                      onClick={() => { handleBuyerSignIn(); setMobileNavOpen(false); }}
                      className="w-full py-2.5 px-4 rounded-xl border border-neutral-200 text-sm font-semibold text-neutral-900 text-center hover:bg-neutral-50 cursor-pointer"
                    >
                      {user && user.role === 'buyer' ? (user.displayName || 'My Account') : 'Sign In'}
                    </button>
                    <button
                      onClick={() => { onSelectBuyerMode(); setMobileNavOpen(false); }}
                      className="w-full py-3 px-4 rounded-xl bg-black text-white text-sm font-bold text-center shadow-sm hover:bg-neutral-800 cursor-pointer flex items-center justify-center gap-2"
                    >
                      <span>Start Shopping</span>
                      <ArrowRight className="w-4 h-4" />
                    </button>
                  </div>
                </>
              ) : (
                <>
                  <button
                    onClick={() => { scrollToElement('merchant-benefits'); setMobileNavOpen(false); }}
                    className="w-full text-left py-2.5 px-3.5 rounded-xl hover:bg-neutral-100 font-semibold text-sm text-neutral-700 cursor-pointer"
                  >
                    Product & Capabilities
                  </button>
                  <button
                    onClick={() => { scrollToElement('merchant-how-it-works'); setMobileNavOpen(false); }}
                    className="w-full text-left py-2.5 px-3.5 rounded-xl hover:bg-neutral-100 font-semibold text-sm text-neutral-700 cursor-pointer"
                  >
                    Merchant Flow
                  </button>
                  <button
                    onClick={() => { scrollToElement('merchant-ai-agent'); setMobileNavOpen(false); }}
                    className="w-full text-left py-2.5 px-3.5 rounded-xl hover:bg-neutral-100 font-semibold text-sm flex items-center gap-2 text-[#a83900] cursor-pointer"
                  >
                    <Sparkles className="w-4 h-4" />
                    <span>AI Sales Agent</span>
                  </button>
                  <button
                    onClick={() => { scrollToElement('merchant-analytics'); setMobileNavOpen(false); }}
                    className="w-full text-left py-2.5 px-3.5 rounded-xl hover:bg-neutral-100 font-semibold text-sm text-neutral-700 cursor-pointer"
                  >
                    Orders & Analytics
                  </button>
                  <div className="pt-2 border-t border-neutral-100 flex flex-col gap-2">
                    <button
                      onClick={() => { handleMerchantSignIn(); setMobileNavOpen(false); }}
                      className="w-full py-2.5 px-4 rounded-xl border border-neutral-200 text-sm font-semibold text-neutral-900 text-center hover:bg-neutral-50 cursor-pointer"
                    >
                      {user && user.role === 'merchant' ? (user.displayName || 'Business Portal') : 'Merchant Sign In'}
                    </button>
                    <button
                      onClick={() => { handleMerchantAction(); setMobileNavOpen(false); }}
                      className="w-full py-3 px-4 rounded-xl bg-black text-white text-sm font-bold text-center shadow-sm hover:bg-neutral-800 cursor-pointer flex items-center justify-center gap-2"
                    >
                      <span>Launch Portal</span>
                      <ArrowRight className="w-4 h-4" />
                    </button>
                  </div>
                </>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </header>

      {/* 2. DEDICATED BUYER EXPERIENCE */}
      {landingMode === 'buyer' && (
        <div className="w-full animate-fade-in">
          
          {/* Full Screen Buyer Hero Section with Mouse Parallax Depth */}
          <motion.section 
            ref={heroSectionRef}
            onMouseMove={handleHeroMouseMove}
            onMouseLeave={handleHeroMouseLeave}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.9, ease: [0.16, 1, 0.3, 1] }}
            className="min-h-[560px] lg:min-h-[640px] flex items-center relative pt-28 sm:pt-32 lg:pt-36 pb-12 sm:pb-16 px-6 sm:px-12 md:px-20 z-10 overflow-hidden bg-[#faf8f5]"
          >
            {/* Background Full-Bleed Video Canvas on Right with Seamless Fade to Left */}
            <div className="absolute right-0 top-0 bottom-0 w-full md:w-[58%] lg:w-[54%] xl:w-[50%] h-full z-0 overflow-hidden pointer-events-none bg-neutral-950">
              
              {/* Parallax Video Layer: subtly shifts opposite to cursor direction for physical depth */}
              <motion.div
                initial={{ opacity: 0, scale: 1.05 }}
                animate={{ 
                  opacity: 1, 
                  scale: 1.02,
                  y: prefersReducedMotion ? 0 : scrollYOffset
                }}
                transition={{ 
                  opacity: { duration: 1.2, ease: [0.16, 1, 0.3, 1] },
                  scale: { duration: 1.6, ease: [0.16, 1, 0.3, 1] },
                  y: { ease: 'linear', duration: 0 }
                }}
                style={{
                  x: prefersReducedMotion ? 0 : springX,
                  y: prefersReducedMotion ? 0 : springY,
                }}
                className="absolute -inset-2 w-[calc(100%+16px)] h-[calc(100%+16px)] transform-gpu will-change-transform"
              >
                {!videoError ? (
                  <video
                    ref={videoRef}
                    id="hero-runway-video"
                    autoPlay
                    muted
                    loop
                    playsInline
                    disablePictureInPicture
                    preload="auto"
                    onLoadedData={() => {
                      if (videoRef.current) {
                        videoRef.current.play().catch(() => {});
                      }
                    }}
                    onError={(e) => {
                      console.warn('Hero runway video error', e);
                      setVideoError(true);
                    }}
                    className="w-full h-full object-cover object-[34%_center] select-none pointer-events-none"
                  >
                    <source src="/videos/fashion_runway.mp4.mp4" type="video/mp4" />
                    <source src="/videos/fashion_runway.mp4" type="video/mp4" />
                  </video>
                ) : (
                  <div 
                    className="w-full h-full bg-[#121212]"
                  />
                )}
              </motion.div>

              {/* Clean Horizontal Fade Gradient: Soft gentle fade at the edge so both runway models stay fully visible */}
              <div className="absolute inset-0 bg-gradient-to-r from-[#faf8f5] via-[#faf8f5]/20 via-10% md:via-transparent to-transparent pointer-events-none z-10 w-full" />
              {/* Subtle monochrome tint for haute couture editorial contrast */}
              <div className="absolute inset-0 bg-black/[0.02] pointer-events-none z-10" />
            </div>

            {/* Main Hero Grid Content */}
            <div className="max-w-[1440px] w-full grid grid-cols-1 md:grid-cols-12 gap-8 lg:gap-12 relative z-20 items-center">
              
              {/* Left Column: Ultra Crisp, High Contrast Typography & CTAs */}
              <motion.div 
                initial={{ opacity: 0, x: -28 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.8, delay: 0.15, ease: [0.16, 1, 0.3, 1] }}
                className="md:col-span-6 lg:col-span-6 flex flex-col justify-center space-y-6 sm:space-y-7 max-w-xl"
              >
                <div className="space-y-3 sm:space-y-3.5">
                  <motion.div 
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6, delay: 0.2 }}
                    className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/95 backdrop-blur-md border border-neutral-200/80 shadow-2xs text-xs font-bold uppercase tracking-widest text-[#a83900]"
                  >
                    <Sparkles className="w-3.5 h-3.5 animate-pulse text-[#a83900]" />
                    <span>Curated Luxury Atelier</span>
                  </motion.div>

                  <motion.h1 
                    initial={{ opacity: 0, y: 15 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.7, delay: 0.25, ease: [0.16, 1, 0.3, 1] }}
                    className="text-4xl sm:text-5xl md:text-6xl xl:text-[62px] font-bold text-neutral-950 tracking-tight leading-[1.06] font-['Archivo_Narrow'] text-balance"
                  >
                    Effortless Luxury, Styled for You.
                  </motion.h1>

                  <motion.p 
                    initial={{ opacity: 0, y: 15 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.7, delay: 0.3, ease: [0.16, 1, 0.3, 1] }}
                    className="text-base sm:text-lg lg:text-xl text-neutral-700 max-w-md font-medium leading-relaxed font-['Archivo_Narrow']"
                  >
                    Find the perfect look in seconds. Explore handcrafted luxury pieces and let your personal AI stylist tailor every outfit to your occasion.
                  </motion.p>
                </div>

                {/* Primary & Secondary CTAs with rounded-full */}
                <motion.div 
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.7, delay: 0.35 }}
                  className="flex flex-col sm:flex-row gap-4 w-full max-w-md"
                >
                  <motion.button
                    whileHover={{ scale: 1.03 }}
                    whileTap={{ scale: 0.97 }}
                    onClick={onSelectBuyerMode}
                    className="group flex items-center justify-center gap-2.5 w-full bg-neutral-950 text-white px-8 py-3.5 sm:py-4 rounded-full hover:bg-neutral-800 transition-all duration-300 shadow-md hover:shadow-xl cursor-pointer font-['Archivo_Narrow'] font-bold text-base"
                  >
                    <span>Start Shopping</span>
                    <ArrowRight className="w-4 h-4 transform group-hover:translate-x-1.5 transition-transform" />
                  </motion.button>

                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={handleBuyerSignIn}
                    className="flex items-center justify-center w-full border border-neutral-300/90 bg-white/90 backdrop-blur-xl text-neutral-900 px-8 py-3.5 sm:py-4 rounded-full hover:bg-white hover:border-black/40 transition-all duration-300 cursor-pointer font-['Archivo_Narrow'] font-semibold text-base shadow-xs"
                  >
                    <span>Sign In</span>
                  </motion.button>
                </motion.div>
              </motion.div>

              {/* Right Column: Clean Editorial Runway Showcase highlighting the Two Models */}
              <div className="md:col-span-6 lg:col-span-6 relative min-h-[280px] sm:min-h-[360px] lg:min-h-[440px] pointer-events-none" />

            </div>
          </motion.section>

          {/* Buyer Core Benefits Grid (Visual & Scannable) */}
          <section id="buyer-benefits" className="py-20 px-6 sm:px-12 md:px-20 max-w-[1440px] mx-auto border-t border-black/5">
            <div className="text-center max-w-2xl mx-auto mb-16 space-y-3">
              <span className="text-xs uppercase tracking-[0.25em] font-bold text-[#a83900]">
                Curated For Patrons
              </span>
              <h2 className="text-3xl sm:text-4xl md:text-5xl font-semibold text-neutral-950 tracking-tight font-['Archivo_Narrow']">
                Five Pillars of Intelligent Shopping
              </h2>
              <p className="text-base text-[#444748] font-light leading-relaxed">
                Every interaction is calibrated to eliminate browsing friction and deliver perfect fit, style, and luxury service.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              
              {/* Benefit 1 */}
              <div className="bg-white/60 backdrop-blur-2xl border border-white/80 p-8 rounded-3xl shadow-[0_8px_32px_0_rgba(0,0,0,0.04)] hover:-translate-y-2 transition-all duration-300 space-y-4">
                <div className="w-12 h-12 rounded-full bg-black text-white flex items-center justify-center shadow-sm">
                  <Search className="w-5 h-5 text-amber-300" />
                </div>
                <h3 className="text-xl font-bold text-black font-['Archivo_Narrow']">
                  AI-Powered Product Discovery
                </h3>
                <p className="text-sm text-[#444748] leading-relaxed font-light">
                  Ask freely in natural language—describe a gala theme, color palette, or silhouette, and Gemini curates exact matches instantly.
                </p>
                <div className="pt-2">
                  <button 
                    onClick={onSelectBuyerMode}
                    className="inline-flex items-center gap-1 text-xs font-bold uppercase tracking-wider text-black hover:text-[#a83900] transition-colors"
                  >
                    <span>Explore Collection</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

              {/* Benefit 2 */}
              <div className="bg-white/60 backdrop-blur-2xl border border-white/80 p-8 rounded-3xl shadow-[0_8px_32px_0_rgba(0,0,0,0.04)] hover:-translate-y-2 transition-all duration-300 space-y-4">
                <div className="w-12 h-12 rounded-full bg-black text-white flex items-center justify-center shadow-sm">
                  <Sparkles className="w-5 h-5 text-[#fc6018]" />
                </div>
                <h3 className="text-xl font-bold text-black font-['Archivo_Narrow']">
                  Personalized Recommendations
                </h3>
                <p className="text-sm text-[#444748] leading-relaxed font-light">
                  Tailored suggestions informed by your private size profile (FR/IT/US), fabric preferences, and purchase history.
                </p>
                <div className="pt-2">
                  <button 
                    onClick={() => {
                      if (user) {
                        onOpenAtelier();
                      } else {
                        onOpenAuth('buyer');
                      }
                    }}
                    className="inline-flex items-center gap-1 text-xs font-bold uppercase tracking-wider text-black hover:text-[#a83900] transition-colors"
                  >
                    <span>Consult Stylist</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

              {/* Benefit 3 */}
              <div className="bg-white/60 backdrop-blur-2xl border border-white/80 p-8 rounded-3xl shadow-[0_8px_32px_0_rgba(0,0,0,0.04)] hover:-translate-y-2 transition-all duration-300 space-y-4">
                <div className="w-12 h-12 rounded-full bg-black text-white flex items-center justify-center shadow-sm">
                  <Layers className="w-5 h-5 text-emerald-400" />
                </div>
                <h3 className="text-xl font-bold text-black font-['Archivo_Narrow']">
                  Intelligent Upsell & Cross-sell
                </h3>
                <p className="text-sm text-[#444748] leading-relaxed font-light">
                  Seamlessly complete your look with curated accessory, footwear, and outerwear pairings that elevate your ensemble.
                </p>
                <div className="pt-2">
                  <button 
                    onClick={onSelectBuyerMode}
                    className="inline-flex items-center gap-1 text-xs font-bold uppercase tracking-wider text-black hover:text-[#a83900] transition-colors"
                  >
                    <span>View Pairings</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

              {/* Benefit 4 */}
              <div className="bg-white/60 backdrop-blur-2xl border border-white/80 p-8 rounded-3xl shadow-[0_8px_32px_0_rgba(0,0,0,0.04)] hover:-translate-y-2 transition-all duration-300 space-y-4">
                <div className="w-12 h-12 rounded-full bg-black text-white flex items-center justify-center shadow-sm">
                  <CreditCard className="w-5 h-5 text-blue-400" />
                </div>
                <h3 className="text-xl font-bold text-black font-['Archivo_Narrow']">
                  Seamless Checkout
                </h3>
                <p className="text-sm text-[#444748] leading-relaxed font-light">
                  Transparent ₹ INR pricing, gift messaging, white-glove packaging, and instant razorpay test & live settlement.
                </p>
                <div className="pt-2">
                  <span className="text-xs font-mono font-bold text-neutral-600">Encrypted 256-Bit</span>
                </div>
              </div>

              {/* Benefit 5 */}
              <div className="md:col-span-2 bg-white/60 backdrop-blur-2xl border border-white/80 p-8 rounded-3xl shadow-[0_8px_32px_0_rgba(0,0,0,0.04)] hover:-translate-y-2 transition-all duration-300 space-y-4 flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div className="space-y-2 max-w-lg">
                  <div className="w-12 h-12 rounded-full bg-black text-white flex items-center justify-center shadow-sm">
                    <Truck className="w-5 h-5 text-amber-300" />
                  </div>
                  <h3 className="text-xl font-bold text-black font-['Archivo_Narrow']">
                    Orders & Real-Time Tracking
                  </h3>
                  <p className="text-sm text-[#444748] leading-relaxed font-light">
                    Follow your bespoke garments from atelier tailoring to door-to-door delivery with live dispatch milestones and downloadable VAT invoices.
                  </p>
                </div>
                <div className="shrink-0">
                  <button
                    onClick={() => {
                      if (user) {
                        onOpenAuditTrail();
                      } else {
                        onOpenAuth('buyer');
                      }
                    }}
                    className="px-6 py-3 rounded-full bg-black text-white text-xs font-bold uppercase tracking-wider hover:bg-neutral-800 transition-colors shadow-sm"
                  >
                    View My Orders
                  </button>
                </div>
              </div>

            </div>
          </section>

          {/* Buyer How It Works */}
          <section id="buyer-how-it-works" className="py-24 px-6 sm:px-12 md:px-20 max-w-[1440px] mx-auto border-t border-black/5">
            <div className="text-center max-w-xl mx-auto mb-16 space-y-3">
              <span className="text-xs uppercase tracking-[0.25em] font-bold text-[#a83900]">
                Simplicity by Design
              </span>
              <h2 className="text-3xl sm:text-4xl font-semibold text-black tracking-tight font-['Archivo_Narrow']">
                How It Works for Buyers
              </h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div className="bg-white/50 backdrop-blur-xl border border-white/60 p-8 rounded-3xl space-y-3 text-center">
                <span className="w-10 h-10 rounded-full bg-black text-white flex items-center justify-center font-bold text-sm mx-auto">
                  01
                </span>
                <h4 className="text-lg font-bold text-black">Express Your Vision</h4>
                <p className="text-xs text-[#444748] font-light leading-relaxed">
                  Type your aesthetic preferences, upcoming event requirements, or budget constraints directly to the stylist.
                </p>
              </div>

              <div className="bg-white/50 backdrop-blur-xl border border-white/60 p-8 rounded-3xl space-y-3 text-center">
                <span className="w-10 h-10 rounded-full bg-black text-white flex items-center justify-center font-bold text-sm mx-auto">
                  02
                </span>
                <h4 className="text-lg font-bold text-black">Instant Atelier Curation</h4>
                <p className="text-xs text-[#444748] font-light leading-relaxed">
                  Gemini analyzes fabric drape, colors, and cuts from our curated gallery to present impeccable combinations.
                </p>
              </div>

              <div className="bg-white/50 backdrop-blur-xl border border-white/60 p-8 rounded-3xl space-y-3 text-center">
                <span className="w-10 h-10 rounded-full bg-black text-white flex items-center justify-center font-bold text-sm mx-auto">
                  03
                </span>
                <h4 className="text-lg font-bold text-black">White Glove Delivery</h4>
                <p className="text-xs text-[#444748] font-light leading-relaxed">
                  Complete order with 1-click in ₹ INR, receive tailored status updates, and track luxury dispatch in real-time.
                </p>
              </div>
            </div>

            {/* Bottom Call to Action */}
            <div className="mt-16 text-center">
              <button
                onClick={onSelectBuyerMode}
                className="px-10 py-4 rounded-full bg-black text-white font-bold text-sm uppercase tracking-widest hover:bg-neutral-800 hover:scale-105 transition-all shadow-md cursor-pointer"
              >
                Start Shopping Now
              </button>
            </div>
          </section>

        </div>
      )}

      {/* 3. DEDICATED MERCHANT EXPERIENCE */}
      {landingMode === 'merchant' && (
        <div className="w-full animate-fade-in">
          
          {/* Merchant Hero Section with Mouse Parallax Depth & Business Portal Video */}
          <motion.section 
            ref={businessHeroSectionRef}
            onMouseMove={handleHeroMouseMove}
            onMouseLeave={handleHeroMouseLeave}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.9, ease: [0.16, 1, 0.3, 1] }}
            className="min-h-[560px] lg:min-h-[640px] flex items-center relative pt-28 sm:pt-32 lg:pt-36 pb-12 sm:pb-16 px-6 sm:px-12 md:px-20 z-10 overflow-hidden bg-[#fbf9f4]"
          >
            {/* Background Full-Bleed Video Canvas on Right with Seamless Fade to Left */}
            <div className="absolute right-0 top-0 bottom-0 w-full md:w-[68%] lg:w-[62%] xl:w-[58%] h-full z-0 overflow-hidden pointer-events-none bg-[#fbf9f4]">
              
              {/* Parallax Video Layer: subtly shifts opposite to cursor direction for physical depth */}
              <motion.div
                initial={{ opacity: 0, scale: 1.08 }}
                animate={{ 
                  opacity: 1, 
                  scale: 1.05,
                  y: prefersReducedMotion ? 0 : scrollYOffset
                }}
                transition={{ 
                  opacity: { duration: 1.2, ease: [0.16, 1, 0.3, 1] },
                  scale: { duration: 1.6, ease: [0.16, 1, 0.3, 1] },
                  y: { ease: 'linear', duration: 0 }
                }}
                style={{
                  x: prefersReducedMotion ? 0 : springX,
                  y: prefersReducedMotion ? 0 : springY,
                }}
                className="absolute -inset-4 w-[calc(100%+32px)] h-[calc(100%+32px)] transform-gpu will-change-transform"
              >
                {!businessVideoError ? (
                  <video
                    ref={businessVideoRef}
                    id="business-portal-hero-video"
                    autoPlay
                    muted
                    loop
                    playsInline
                    disablePictureInPicture
                    preload="auto"
                    onError={() => setBusinessVideoError(true)}
                    className="w-full h-full object-cover object-[46%_center] sm:object-[45%_center] md:object-[44%_center] select-none pointer-events-none"
                  >
                    <source src="/videos/business%20portal.mp4" type="video/mp4" />
                    <source src="/videos/business portal.mp4" type="video/mp4" />
                  </video>
                ) : (
                  <div className="w-full h-full bg-[#f2efe9]" />
                )}
              </motion.div>

              {/* Clean Horizontal Fade Gradient: Video gently blends on the left side where text sits */}
              <div className="absolute inset-0 bg-gradient-to-r from-[#fbf9f4] via-[#fbf9f4]/85 via-20% md:via-[#fbf9f4]/30 to-transparent pointer-events-none z-10 w-full" />
              {/* Subtle bottom fade to blend with next section */}
              <div className="absolute inset-0 bg-gradient-to-t from-[#fbf9f4] via-transparent to-transparent h-24 bottom-0 pointer-events-none z-10" />
            </div>

            {/* Main Business Hero Grid Content */}
            <div className="max-w-[1440px] w-full grid grid-cols-1 md:grid-cols-12 gap-8 lg:gap-12 relative z-20 items-center">
              
              {/* Left Column: Merchant Hero Content & CTAs */}
              <motion.div 
                initial={{ opacity: 0, x: -28 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.8, delay: 0.15, ease: [0.16, 1, 0.3, 1] }}
                className="md:col-span-6 lg:col-span-6 flex flex-col justify-center space-y-6 sm:space-y-7 max-w-xl"
              >
                <div className="space-y-3 sm:space-y-3.5">
                  <motion.div 
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6, delay: 0.2 }}
                    className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/95 backdrop-blur-md border border-neutral-200/80 shadow-2xs text-xs font-bold uppercase tracking-widest text-[#a83900]"
                  >
                    <BarChart3 className="w-3.5 h-3.5" />
                    <span>Autonomous Commerce Engine</span>
                  </motion.div>

                  <motion.h1 
                    initial={{ opacity: 0, y: 15 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.7, delay: 0.25, ease: [0.16, 1, 0.3, 1] }}
                    className="text-4xl sm:text-5xl md:text-6xl xl:text-[62px] font-bold text-neutral-950 tracking-tight leading-[1.06] font-['Archivo_Narrow'] text-balance"
                  >
                    Turn Every Visit Into a Sale.
                  </motion.h1>

                  <motion.p 
                    initial={{ opacity: 0, y: 15 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.7, delay: 0.3, ease: [0.16, 1, 0.3, 1] }}
                    className="text-base sm:text-lg text-[#444748] max-w-md font-light leading-relaxed font-['Archivo_Narrow']"
                  >
                    Give your store an AI Sales Agent that understands your catalog, assists customers, and intelligently increases conversions.
                  </motion.p>
                </div>

                {/* Primary & Secondary CTAs with rounded-full */}
                <motion.div 
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.7, delay: 0.35, ease: [0.16, 1, 0.3, 1] }}
                  className="flex flex-col sm:flex-row gap-4 w-full max-w-md"
                >
                  <button
                    onClick={handleMerchantAction}
                    className="group flex items-center justify-center gap-2 w-full bg-black text-white px-8 py-4 rounded-full hover:bg-neutral-800 hover:scale-[1.02] transition-all duration-300 shadow-md hover:shadow-xl cursor-pointer font-['Archivo_Narrow'] font-bold text-base"
                  >
                    <span>Start Selling</span>
                    <ArrowRight className="w-4 h-4 transform group-hover:translate-x-1.5 transition-transform" />
                  </button>

                  <button
                    onClick={handleMerchantSignIn}
                    className="flex items-center justify-center w-full border border-black/20 bg-white/70 backdrop-blur-xl text-black px-8 py-4 rounded-full hover:bg-white hover:border-black/40 transition-all duration-300 cursor-pointer font-['Archivo_Narrow'] font-semibold text-base shadow-xs"
                  >
                    <span>Business Sign In</span>
                  </button>
                </motion.div>

                {/* Micro trust indicators */}
                <motion.div 
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 0.8, delay: 0.4 }}
                  className="flex items-center gap-6 pt-2 text-xs text-[#767777]"
                >
                  <div className="flex items-center gap-1.5">
                    <TrendingUp className="w-4 h-4 text-emerald-600" />
                    <span>+33.2% AOV Uplift</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <Zap className="w-4 h-4 text-[#a83900]" />
                    <span>LUXORA AI Intelligence Engine</span>
                  </div>
                </motion.div>
              </motion.div>

              {/* Right Column: Clean Open Canvas Showcasing Video with Minimal Glass Pill */}
              <div className="md:col-span-6 lg:col-span-6 flex justify-end items-end relative min-h-[140px] md:min-h-[380px] pointer-events-none">
                <motion.div 
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.8, delay: 0.45 }}
                  className="hidden sm:inline-flex items-center gap-2.5 px-4 py-2 rounded-full bg-white/85 backdrop-blur-md border border-white/90 shadow-sm text-xs font-['Archivo_Narrow'] text-neutral-800 pointer-events-auto select-none"
                >
                  <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                  <span className="font-bold tracking-wide text-black uppercase text-[11px]">Business Portal</span>
                  <span className="text-neutral-300">|</span>
                  <span className="text-neutral-600 text-[11px]">Autonomous Merchant Node</span>
                </motion.div>
              </div>

            </div>
          </motion.section>

          {/* Bento Feature Highlights Section right below Hero */}
          <section className="py-10 sm:py-14 px-6 sm:px-12 md:px-20 max-w-[1440px] mx-auto relative z-20">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 items-stretch">
              
              {/* Feature Card 1: AI Sales Agent */}
              <div className="bg-white/80 backdrop-blur-2xl border border-white/90 p-6 rounded-2xl shadow-[0_8px_30px_rgba(0,0,0,0.04)] hover:-translate-y-1 hover:shadow-[0_14px_36px_rgba(0,0,0,0.07)] transition-all duration-300 flex flex-col justify-between space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-[11px] uppercase tracking-widest text-[#767777] font-semibold">Feature 01</span>
                  <div className="w-8 h-8 rounded-full bg-black text-white flex items-center justify-center shadow-2xs">
                    <Sparkles className="w-4 h-4 text-[#fc6018]" />
                  </div>
                </div>
                <div>
                  <h3 className="text-lg font-bold text-black font-['Archivo_Narrow']">AI Sales Agent</h3>
                  <p className="text-xs text-[#444748] leading-relaxed font-light mt-1.5">
                    An autonomous agent driving intelligent upsell and cross-sell interactions around the clock.
                  </p>
                </div>
                <div className="pt-2.5 border-t border-black/5 flex items-center justify-between text-[11px]">
                  <span className="text-emerald-700 font-semibold flex items-center gap-1.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                    24/7 Active
                  </span>
                  <span className="font-mono text-neutral-500 text-[10px]">99.8% SLA</span>
                </div>
              </div>

              {/* Feature Card 2: Agent-Readable Catalog */}
              <div className="bg-white/80 backdrop-blur-2xl border border-white/90 p-6 rounded-2xl shadow-[0_8px_30px_rgba(0,0,0,0.04)] hover:-translate-y-1 hover:shadow-[0_14px_36px_rgba(0,0,0,0.07)] transition-all duration-300 flex flex-col justify-between space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-[11px] uppercase tracking-widest text-[#767777] font-semibold">Feature 02</span>
                  <div className="w-8 h-8 rounded-full bg-black text-white flex items-center justify-center shadow-2xs">
                    <Database className="w-4 h-4 text-emerald-400" />
                  </div>
                </div>
                <div>
                  <h3 className="text-lg font-bold text-black font-['Archivo_Narrow']">Agent-Readable Catalog</h3>
                  <p className="text-xs text-[#444748] leading-relaxed font-light mt-1.5">
                    Automated taxonomy structuring for seamless catalog management, CSV imports, and inventory sync.
                  </p>
                </div>
                <div className="pt-2.5 border-t border-black/5 flex items-center justify-between text-[11px]">
                  <span className="text-neutral-800 font-semibold">Live Inventory</span>
                  <span className="font-mono text-neutral-500 text-[10px]">SKU Taxonomy</span>
                </div>
              </div>

              {/* Feature Card 3: Conversion Insights */}
              <div className="sm:col-span-2 lg:col-span-1 bg-white/80 backdrop-blur-2xl border border-white/90 p-6 rounded-2xl shadow-[0_8px_30px_rgba(0,0,0,0.04)] hover:-translate-y-1 hover:shadow-[0_14px_36px_rgba(0,0,0,0.07)] transition-all duration-300 flex flex-col justify-between space-y-4">
                <div className="flex justify-between items-center">
                  <div className="flex items-center gap-2">
                    <span className="text-[11px] uppercase tracking-widest text-[#767777] font-semibold">Feature 03</span>
                    <span className="px-2 py-0.5 rounded-full bg-amber-100 text-amber-900 text-[10px] font-bold font-mono">+33.2% Lift</span>
                  </div>
                  <div className="w-8 h-8 rounded-full bg-black text-white flex items-center justify-center shadow-2xs">
                    <TrendingUp className="w-4 h-4 text-amber-300" />
                  </div>
                </div>
                <div>
                  <h3 className="text-lg font-bold text-black font-['Archivo_Narrow']">Conversion Insights</h3>
                  <p className="text-xs text-[#444748] leading-relaxed font-light mt-1.5">
                    Deep telemetry reporting on revenue performance, cart abandonment risks, and growth opportunities.
                  </p>
                </div>
                <div className="pt-2.5 border-t border-black/5 flex items-center justify-between text-[11px]">
                  <span className="text-neutral-800 font-semibold">Live Telemetry</span>
                  <span className="font-mono text-neutral-500 text-[10px]">Auto Insights</span>
                </div>
              </div>

            </div>
          </section>

          {/* Merchant Features & Benefits Sections (Short, Visual & Benefit-Focused) */}
          <section id="merchant-benefits" className="py-24 px-6 sm:px-12 md:px-20 max-w-[1440px] mx-auto border-t border-black/5">
            <div className="text-center max-w-2xl mx-auto mb-16 space-y-3">
              <span className="text-xs uppercase tracking-[0.25em] font-bold text-[#a83900]">
                Business Capabilities
              </span>
              <h2 className="text-3xl sm:text-4xl md:text-5xl font-semibold text-black tracking-tight font-['Archivo_Narrow']">
                Autonomous Intelligence for Luxury Retail
              </h2>
              <p className="text-base text-[#444748] font-light leading-relaxed">
                Elevate your conversion rates with AI infrastructure built specifically for high-ticket apparel and ateliers.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              
              {/* Feature 1: AI Sales Agent */}
              <div id="merchant-ai-agent" className="bg-white/60 backdrop-blur-2xl border border-white/80 p-8 rounded-3xl shadow-[0_8px_32px_0_rgba(0,0,0,0.04)] hover:-translate-y-2 transition-all duration-300 space-y-4">
                <div className="w-12 h-12 rounded-full bg-black text-white flex items-center justify-center shadow-sm">
                  <Sparkles className="w-5 h-5 text-amber-300" />
                </div>
                <h3 className="text-xl font-bold text-black font-['Archivo_Narrow']">
                  AI Sales Agent
                </h3>
                <p className="text-sm text-[#444748] leading-relaxed font-light">
                  A 24/7 dedicated sales concierge that knows every silhouette, fabric composition, and sizing nuance to guide clients toward conversion.
                </p>
                <div className="pt-2">
                  <button 
                    onClick={handleMerchantAction}
                    className="group inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-black hover:text-[#a83900] transition-all cursor-pointer py-1.5 px-3 rounded-full hover:bg-black/5 active:scale-95"
                  >
                    <span className="group-hover:translate-x-0.5 transition-transform">Configure Agent</span>
                    <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
                  </button>
                </div>
              </div>

              {/* Feature 2: Agent-Readable Catalog */}
              <div id="merchant-catalog" className="bg-white/60 backdrop-blur-2xl border border-white/80 p-8 rounded-3xl shadow-[0_8px_32px_0_rgba(0,0,0,0.04)] hover:-translate-y-2 transition-all duration-300 space-y-4">
                <div className="w-12 h-12 rounded-full bg-black text-white flex items-center justify-center shadow-sm">
                  <Database className="w-5 h-5 text-emerald-400" />
                </div>
                <h3 className="text-xl font-bold text-black font-['Archivo_Narrow']">
                  Agent-Readable Catalog
                </h3>
                <p className="text-sm text-[#444748] leading-relaxed font-light">
                  Turn static product CSVs into dynamic vector-indexed catalogs. The AI interprets subtle cut, drape, and pairing attributes automatically.
                </p>
                <div className="pt-2">
                  <button 
                    onClick={handleMerchantAction}
                    className="group inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-black hover:text-[#a83900] transition-all cursor-pointer py-1.5 px-3 rounded-full hover:bg-black/5 active:scale-95"
                  >
                    <span className="group-hover:translate-x-0.5 transition-transform">Manage Catalog</span>
                    <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
                  </button>
                </div>
              </div>

              {/* Feature 3: Intelligent Upsell & Cross-sell */}
              <div className="bg-white/60 backdrop-blur-2xl border border-white/80 p-8 rounded-3xl shadow-[0_8px_32px_0_rgba(0,0,0,0.04)] hover:-translate-y-2 transition-all duration-300 space-y-4">
                <div className="w-12 h-12 rounded-full bg-black text-white flex items-center justify-center shadow-sm">
                  <Layers className="w-5 h-5 text-[#fc6018]" />
                </div>
                <h3 className="text-xl font-bold text-black font-['Archivo_Narrow']">
                  Intelligent Upsell & Cross-sell
                </h3>
                <p className="text-sm text-[#444748] leading-relaxed font-light">
                  Automated pairing rules trigger during cart additions and checkout previews, lifting average order value by +33.2%.
                </p>
                <div className="pt-2">
                  <button 
                    onClick={handleMerchantAction}
                    className="group inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-black hover:text-[#a83900] transition-all cursor-pointer py-1.5 px-3 rounded-full hover:bg-black/5 active:scale-95"
                  >
                    <span className="group-hover:translate-x-0.5 transition-transform">View Growth Rules</span>
                    <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
                  </button>
                </div>
              </div>

              {/* Feature 4: Product & Catalog Management */}
              <div className="bg-white/60 backdrop-blur-2xl border border-white/80 p-8 rounded-3xl shadow-[0_8px_32px_0_rgba(0,0,0,0.04)] hover:-translate-y-2 transition-all duration-300 space-y-4">
                <div className="w-12 h-12 rounded-full bg-black text-white flex items-center justify-center shadow-sm">
                  <Sliders className="w-5 h-5 text-blue-400" />
                </div>
                <h3 className="text-xl font-bold text-black font-['Archivo_Narrow']">
                  Product & Catalog Management
                </h3>
                <p className="text-sm text-[#444748] leading-relaxed font-light">
                  1-click bulk CSV imports, real-time inventory adjustments, pricing updates, and instant SKU taxonomy enrichment.
                </p>
                <div className="pt-2">
                  <span className="text-xs font-mono font-bold text-neutral-600">Live Catalog Synced</span>
                </div>
              </div>

              {/* Feature 5: Orders & Analytics */}
              <div id="merchant-analytics" className="bg-white/60 backdrop-blur-2xl border border-white/80 p-8 rounded-3xl shadow-[0_8px_32px_0_rgba(0,0,0,0.04)] hover:-translate-y-2 transition-all duration-300 space-y-4">
                <div className="w-12 h-12 rounded-full bg-black text-white flex items-center justify-center shadow-sm">
                  <BarChart3 className="w-5 h-5 text-amber-300" />
                </div>
                <h3 className="text-xl font-bold text-black font-['Archivo_Narrow']">
                  Orders & Analytics
                </h3>
                <p className="text-sm text-[#444748] leading-relaxed font-light">
                  Track real-time GMV (₹32.4L+), AI-attributed revenue share (28.8%), fulfillment pipelines, and return frequencies in one place.
                </p>
                <div className="pt-2">
                  <button 
                    onClick={handleMerchantAction}
                    className="group inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-black hover:text-[#a83900] transition-all cursor-pointer py-1.5 px-3 rounded-full hover:bg-black/5 active:scale-95"
                  >
                    <span className="group-hover:translate-x-0.5 transition-transform">View Analytics</span>
                    <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
                  </button>
                </div>
              </div>

              {/* Feature 6: Customer Conversion Insights */}
              <div className="bg-white/60 backdrop-blur-2xl border border-white/80 p-8 rounded-3xl shadow-[0_8px_32px_0_rgba(0,0,0,0.04)] hover:-translate-y-2 transition-all duration-300 space-y-4">
                <div className="w-12 h-12 rounded-full bg-black text-white flex items-center justify-center shadow-sm">
                  <TrendingUp className="w-5 h-5 text-emerald-400" />
                </div>
                <h3 className="text-xl font-bold text-black font-['Archivo_Narrow']">
                  Customer Conversion Insights
                </h3>
                <p className="text-sm text-[#444748] leading-relaxed font-light">
                  Ask Gemini directly about where revenue loss occurs, why carts are abandoned, and execute 1-click strategic recovery campaigns.
                </p>
                <div className="pt-2">
                  <button 
                    onClick={handleMerchantAction}
                    className="group inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-black hover:text-[#a83900] transition-all cursor-pointer py-1.5 px-3 rounded-full hover:bg-black/5 active:scale-95"
                  >
                    <span className="group-hover:translate-x-0.5 transition-transform">Ask AI Agent</span>
                    <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
                  </button>
                </div>
              </div>

            </div>
          </section>

          {/* Merchant How It Works */}
          <section id="merchant-how-it-works" className="py-24 px-6 sm:px-12 md:px-20 max-w-[1440px] mx-auto border-t border-black/5">
            <div className="text-center max-w-xl mx-auto mb-16 space-y-3">
              <span className="text-xs uppercase tracking-[0.25em] font-bold text-[#a83900]">
                Deployment Workflow
              </span>
              <h2 className="text-3xl sm:text-4xl font-semibold text-black tracking-tight font-['Archivo_Narrow']">
                How It Works for Business
              </h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div className="bg-white/50 backdrop-blur-xl border border-white/60 p-8 rounded-3xl space-y-3 text-center">
                <span className="w-10 h-10 rounded-full bg-black text-white flex items-center justify-center font-bold text-sm mx-auto">
                  01
                </span>
                <h4 className="text-lg font-bold text-black">Connect Your Catalog</h4>
                <p className="text-xs text-[#444748] font-light leading-relaxed">
                  Import CSV files or sync atelier products. LUXORA parses sizes, fabrics, and designer metadata automatically.
                </p>
              </div>

              <div className="bg-white/50 backdrop-blur-xl border border-white/60 p-8 rounded-3xl space-y-3 text-center">
                <span className="w-10 h-10 rounded-full bg-black text-white flex items-center justify-center font-bold text-sm mx-auto">
                  02
                </span>
                <h4 className="text-lg font-bold text-black">Activate AI Sales Agent</h4>
                <p className="text-xs text-[#444748] font-light leading-relaxed">
                  Configure styling tone, upsell thresholds, and margin objectives. The agent immediately begins advising visitors.
                </p>
              </div>

              <div className="bg-white/50 backdrop-blur-xl border border-white/60 p-8 rounded-3xl space-y-3 text-center">
                <span className="w-10 h-10 rounded-full bg-black text-white flex items-center justify-center font-bold text-sm mx-auto">
                  03
                </span>
                <h4 className="text-lg font-bold text-black">Scale GMV & Conversions</h4>
                <p className="text-xs text-[#444748] font-light leading-relaxed">
                  Monitor real-time telemetry, gain instant insights on friction points, and trigger autonomous growth campaigns.
                </p>
              </div>
            </div>

            {/* Bottom Call to Action */}
            <div className="mt-16 text-center">
              <button
                onClick={handleMerchantAction}
                className="px-10 py-4 rounded-full bg-black text-white font-bold text-sm uppercase tracking-widest hover:bg-neutral-800 hover:scale-105 transition-all shadow-md cursor-pointer"
              >
                Start Selling with LUXORA
              </button>
            </div>
          </section>

        </div>
      )}

      {/* 4. UNIFIED GLASSMORPHIC FOOTER */}
      <footer className="w-full py-12 border-t border-black/10 bg-white/40 backdrop-blur-xl z-10 relative">
        <div className="flex flex-col md:flex-row justify-between items-center px-6 sm:px-12 md:px-20 max-w-[1440px] mx-auto gap-6">
          <div className="flex items-center gap-3">
            <span className="font-bold text-lg text-black font-['Archivo_Narrow']">
              {landingMode === 'buyer' ? 'LUXORA' : 'LUXORA Business'}
            </span>
          </div>

          <nav className="flex flex-wrap justify-center gap-6 text-xs text-[#444748] font-medium font-['Archivo_Narrow']">
            <button onClick={() => {}} className="hover:text-black transition-colors cursor-pointer">Privacy Policy</button>
            <button onClick={() => {}} className="hover:text-black transition-colors cursor-pointer">Terms of Service</button>
            <button onClick={() => {}} className="hover:text-black transition-colors cursor-pointer">Sustainability</button>
            <button onClick={() => {}} className="hover:text-black transition-colors cursor-pointer">Contact</button>
          </nav>

          <span className="text-xs text-[#767777] font-['Archivo_Narrow']">
            {landingMode === 'buyer' 
              ? '© 2024 Luxora Digital Atelier. All Rights Reserved.' 
              : '© 2024 Luxora Business Solutions. All Rights Reserved.'}
          </span>
        </div>
      </footer>

    </div>
  );
};
