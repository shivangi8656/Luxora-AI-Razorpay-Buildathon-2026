import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ShoppingBag, Check } from 'lucide-react';
import { Product, CartItem, Currency } from './types';
import { PRODUCTS } from './data/products';
import { Navbar } from './components/Navbar';
import { HeroEditorial } from './components/HeroEditorial';
import { CouponMarquee } from './components/CouponMarquee';
import { ProductGrid } from './components/ProductGrid';
import { ProductDetailModal } from './components/ProductDetailModal';
import { AtelierStylist } from './components/AtelierStylist';
import { EditorialLookbook } from './components/EditorialLookbook';
import { BagDrawer } from './components/BagDrawer';
import { CheckoutModal } from './components/CheckoutModal';
import { WishlistDrawer } from './components/WishlistDrawer';
import { AuthModal } from './components/AuthModal';
import { Footer } from './components/Footer';
import { LandingHero } from './components/LandingHero';
import { MerchantWorkspace } from './components/merchant/MerchantWorkspace';
import { SettingsModal } from './components/SettingsModal';
import { AuditTrailModal } from './components/AuditTrailModal';
import { UpsellCrossSellModal } from './components/UpsellCrossSellModal';
import { AgentBuyerTerminalModal } from './components/AgentBuyerTerminalModal';
import { AuthProvider, useAuth } from './context/AuthContext';
import { AuditProvider, useAudit } from './context/AuditContext';
import { MerchantProvider, useMerchant } from './context/MerchantContext';

function LuxoraApp() {
  // App Mode: 'landing' (Default Landing Page) | 'buyer' (Buyer Storefront) | 'merchant' (Merchant Overview)
  const [appMode, setAppMode] = useState<'landing' | 'buyer' | 'merchant'>('landing');
  const [pendingMode, setPendingMode] = useState<'buyer' | 'merchant' | null>(null);

  // Navigation & View state inside Buyer Mode
  const [activeTab, setActiveTab] = useState<'shop' | 'lookbook' | 'atelier'>('shop');
  const [currency, setCurrency] = useState<Currency>('INR');

  // Interactive Drawers & Modals
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isWishlistOpen, setIsWishlistOpen] = useState(false);
  const [isAtelierOpen, setIsAtelierOpen] = useState(false);
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);
  const [isAuthOpen, setIsAuthOpen] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isAuditOpen, setIsAuditOpen] = useState(false);
  const [isAgentBuyerOpen, setIsAgentBuyerOpen] = useState(false);
  const [bagToast, setBagToast] = useState<{ name: string; size: string } | null>(null);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);

  // Auth modal role hint
  const [authRole, setAuthRole] = useState<'buyer' | 'merchant'>('buyer');

  // Upsell & Cross-Sell Modal
  const [upsellBaseProduct, setUpsellBaseProduct] = useState<Product | null>(null);

  // Global Contexts
  const { catalog, trackProductView } = useMerchant();
  const { addLog } = useAudit();
  const { user } = useAuth();

  const handleSelectProduct = (p: Product) => {
    setSelectedProduct(p);
    trackProductView(
      p, 
      user ? { email: user.email || undefined, name: user.displayName || undefined, id: user.uid } : undefined
    );
  };


  // Listen for global sign-out event to redirect to landing page from anywhere
  useEffect(() => {
    const handleGlobalSignOut = () => {
      setAppMode('landing');
      setIsCartOpen(false);
      setIsWishlistOpen(false);
      setIsAtelierOpen(false);
      setIsCheckoutOpen(false);
      setIsSettingsOpen(false);
      setIsAuthOpen(false);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    window.addEventListener('luxoraSignOut', handleGlobalSignOut);
    return () => {
      window.removeEventListener('luxoraSignOut', handleGlobalSignOut);
    };
  }, []);

  // Mode Switchers
  const handleSelectBuyerMode = () => {
    setAppMode('buyer');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleSelectMerchantMode = () => {
    // If not signed in or not a verified merchant, open merchant sign in first
    if (!user || user.role !== 'merchant') {
      setAuthRole('merchant');
      setPendingMode('merchant');
      setIsAuthOpen(true);
      return;
    }
    setAppMode('merchant');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleOpenAtelier = (prompt?: string) => {
    if (!user) {
      setAuthRole('buyer');
      setIsAuthOpen(true);
      return;
    }
    if (prompt) {
      setAtelierPrompt(prompt);
    }
    setIsAtelierOpen(true);
  };

  // Cart & Wishlist state
  const [cart, setCart] = useState<CartItem[]>([
    {
      id: 'cart-init-1',
      product: PRODUCTS[0], // The Obsidian Silk Slip
      selectedColor: PRODUCTS[0]?.colors?.[0] || { name: PRODUCTS[0]?.color || 'Black', hex: '#121212' },
      selectedSize: PRODUCTS[0]?.sizes?.[0] || 'FR 36 (US 2)',
      quantity: 1,
    }
  ]);

  // Wishlist state: strictly empty by default for all new users and sessions
  const [wishlistIds, setWishlistIds] = useState<string[]>(() => {
    try {
      const savedUser = localStorage.getItem('luxora_auth_user');
      const uid = savedUser ? JSON.parse(savedUser)?.uid : 'guest';
      const saved = localStorage.getItem(`luxora_wishlist_${uid}`);
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  // Keep wishlist isolated per user; new users always start with an empty wishlist
  useEffect(() => {
    try {
      const uid = user?.uid || 'guest';
      const saved = localStorage.getItem(`luxora_wishlist_${uid}`);
      if (saved) {
        setWishlistIds(JSON.parse(saved));
      } else {
        // Strict requirement: new user wishlist must be empty by default
        setWishlistIds([]);
      }
    } catch {
      setWishlistIds([]);
    }
  }, [user?.uid]);

  // Persist user wishlist updates locally
  useEffect(() => {
    try {
      const uid = user?.uid || 'guest';
      localStorage.setItem(`luxora_wishlist_${uid}`, JSON.stringify(wishlistIds));
    } catch (e) {
      // ignore
    }
  }, [wishlistIds, user?.uid]);

  // Checkout meta
  const [appliedDiscount, setAppliedDiscount] = useState(0);
  const [giftPackaging, setGiftPackaging] = useState(true);
  const [giftMessage, setGiftMessage] = useState('');
  const [atelierPrompt, setAtelierPrompt] = useState<string | undefined>();
  const [pendingCheckoutAfterAuth, setPendingCheckoutAfterAuth] = useState(false);

  // Cart Actions
  const handleAddToCart = (product: Product, size: string, colorIndex: number) => {
    const color = product.colors?.[colorIndex] || product.colors?.[0] || { name: product.color || 'Standard', hex: '#121212' };
    const colorName = typeof color === 'string' ? color : color?.name || product.color || 'Standard';

    setCart((prev) => {
      const existingIndex = prev.findIndex(
        (item) =>
          item.product.id === product.id &&
          item.selectedSize === size &&
          (typeof item.selectedColor === 'object' ? item.selectedColor?.name : item.selectedColor) === colorName
      );

      if (existingIndex > -1) {
        const updated = [...prev];
        updated[existingIndex] = {
          ...updated[existingIndex],
          quantity: updated[existingIndex].quantity + 1,
        };
        return updated;
      } else {
        const newItem: CartItem = {
          id: `cart-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
          product,
          selectedColor: color,
          selectedSize: size,
          quantity: 1,
        };
        return [...prev, newItem];
      }
    });

    addLog(
      'CART',
      'Piece Added to Bag',
      `${product.name} (${size}) placed in shopping bag.`,
      'info'
    );

    // Provide unobtrusive luxury toast feedback without forcing open the drawer
    setBagToast({ name: product.name, size });
    setTimeout(() => {
      setBagToast((curr) => (curr?.name === product.name ? null : curr));
    }, 3000);
  };

  const handleBuyNow = (product: Product, size?: string, colorIndex?: number) => {
    const chosenSize = size || product.sizes?.[0] || 'Standard';
    const chosenColorIdx = colorIndex ?? 0;
    const color = product.colors?.[chosenColorIdx] || product.colors?.[0] || { name: product.color || 'Standard', hex: '#121212' };
    const colorName = typeof color === 'string' ? color : color?.name || product.color || 'Standard';

    setCart((prev) => {
      const existingIndex = prev.findIndex(
        (item) =>
          item.product.id === product.id &&
          item.selectedSize === chosenSize &&
          (typeof item.selectedColor === 'object' ? item.selectedColor?.name : item.selectedColor) === colorName
      );

      if (existingIndex > -1) {
        return prev;
      } else {
        const newItem: CartItem = {
          id: `cart-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
          product,
          selectedColor: color,
          selectedSize: chosenSize,
          quantity: 1,
        };
        return [...prev, newItem];
      }
    });

    addLog(
      'CHECKOUT',
      'Instant Buy Now Initiated',
      `${product.name} (${chosenSize}) added to bag. Opening shopping bag drawer to proceed to checkout.`,
      'info'
    );

    // Open bag drawer directly so user can review and tap 'Proceed to Checkout'
    setSelectedProduct(null);
    setIsCartOpen(true);
    setIsCheckoutOpen(false);
  };

  const handleQuickAdd = (product: Product, size: string) => {
    handleAddToCart(product, size || product.sizes?.[0] || 'Standard', 0);
  };

  // Fixed Quantity Update: Decrement/Increment by delta (-1 or +1), smoothly reducing 3 -> 2 -> 1 without abrupt item deletion
  const handleUpdateQuantity = (itemId: string, delta: number) => {
    setCart((prev) =>
      prev
        .map((item) => {
          if (item.id === itemId) {
            const newQuantity = item.quantity + delta;
            return { ...item, quantity: newQuantity };
          }
          return item;
        })
        .filter((item) => item.quantity > 0)
    );
  };

  const handleRemoveFromCart = (itemId: string) => {
    setCart((prev) => prev.filter((item) => item.id !== itemId));
  };

  // Wishlist Actions
  const handleToggleWishlist = (product: Product) => {
    if (wishlistIds.includes(product.id)) {
      setWishlistIds((prev) => prev.filter((id) => id !== product.id));
      addLog('WISHLIST', 'Removed from Wishlist', `${product.name} removed.`, 'info');
    } else {
      setWishlistIds((prev) => [...prev, product.id]);
      addLog('WISHLIST', 'Added to Wishlist', `${product.name} saved to private wishlist.`, 'info');
    }
  };

  const handleMoveWishlistToBag = (product: Product) => {
    handleAddToCart(product, product.sizes?.[0] || 'FR 36 (US 2)', 0);
    setWishlistIds((prev) => prev.filter((id) => id !== product.id));
  };

  const handleOpenAtelierWithPrompt = (prompt: string) => {
    if (!user) {
      setAuthRole('buyer');
      setIsAuthOpen(true);
      return;
    }
    setAtelierPrompt(prompt);
    setIsAtelierOpen(true);
  };

  const totalCartCount = (cart || []).reduce((sum, item) => sum + (item?.quantity || 1), 0);

  // Centralized live product state ensures immediate reactive updates from Merchant Workspace to Detail Modal
  const liveSelectedProduct = selectedProduct
    ? (catalog.find((p) => p.id === selectedProduct.id || p.sku === selectedProduct.sku) || selectedProduct)
    : null;

  return (
    <div className="min-h-screen bg-[#fbf9f4] text-[#1b1c19] selection:bg-[#fc6018] selection:text-[#531800]">
      
      {/* Centralized Page Transition Orchestrator */}
      <AnimatePresence mode="wait" initial={false}>
        {/* 1. LANDING PAGE MODE (Default) */}
        {appMode === 'landing' && (
          <motion.div
            key="landing-mode"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.32, ease: [0.22, 1, 0.36, 1] }}
          >
            <LandingHero
              onSelectBuyerMode={handleSelectBuyerMode}
              onSelectMerchantMode={handleSelectMerchantMode}
              onOpenAuditTrail={() => {
                if (user) {
                  setIsSettingsOpen(true);
                } else {
                  setAuthRole('buyer');
                  setIsAuthOpen(true);
                }
              }}
              onOpenAuth={(role) => {
                const targetRole = role || 'buyer';
                setAuthRole(targetRole);
                setPendingMode(targetRole);
                setIsAuthOpen(true);
              }}
              onOpenBag={() => setIsCartOpen(true)}
              onOpenAtelier={() => handleOpenAtelier()}
              cartCount={totalCartCount}
            />
          </motion.div>
        )}

        {/* 2. MERCHANT WORKSPACE MODE */}
        {appMode === 'merchant' && (
          <motion.div
            key="merchant-mode"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.32, ease: [0.22, 1, 0.36, 1] }}
          >
            <MerchantWorkspace
              onSwitchToBuyerStore={handleSelectBuyerMode}
              onOpenAuditTrail={() => {
                if (user) {
                  setIsSettingsOpen(true);
                } else {
                  setAuthRole('merchant');
                  setIsAuthOpen(true);
                }
              }}
              onOpenAuth={() => {
                setAuthRole('merchant');
                setIsAuthOpen(true);
              }}
              onOpenBag={() => setIsCartOpen(true)}
              cartCount={totalCartCount}
            />
          </motion.div>
        )}

        {/* 3. BUYER STOREFRONT MODE */}
        {appMode === 'buyer' && (
          <motion.div
            key="buyer-mode"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.32, ease: [0.22, 1, 0.36, 1] }}
          >
            {/* Buyer Navigation */}
            <Navbar
              activeTab={activeTab}
              setActiveTab={setActiveTab}
              currency={currency}
              setCurrency={setCurrency}
              cartCount={totalCartCount}
              wishlistCount={wishlistIds.length}
              onOpenCart={() => setIsCartOpen(true)}
              onOpenWishlist={() => setIsWishlistOpen(true)}
              onOpenAtelier={() => handleOpenAtelier()}
              onOpenAuth={() => {
                if (user) {
                  setIsSettingsOpen(true);
                } else {
                  setAuthRole('buyer');
                  setIsAuthOpen(true);
                }
              }}
              onToggleSearch={() => {}}
              onSwitchToLanding={() => {
                setAppMode('landing');
                window.scrollTo({ top: 0, behavior: 'smooth' });
              }}
              onOpenAuditTrail={() => {
                if (user) {
                  setIsSettingsOpen(true);
                } else {
                  setAuthRole('buyer');
                  setIsAuthOpen(true);
                }
              }}
              onOpenSettings={() => setIsSettingsOpen(true)}
              onOpenAgentBuyer={() => setIsAgentBuyerOpen(true)}
            />

            {/* Main Storefront Views with Smooth Tab Cross-Fades */}
            <main className="min-h-screen">
              <AnimatePresence mode="wait">
                {activeTab === 'shop' && (
                  <motion.div
                    key="tab-shop"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    transition={{ duration: 0.32, ease: [0.22, 1, 0.36, 1] }}
                  >
                    <HeroEditorial
                      onExploreCollection={() => {
                        const el = document.getElementById('catalog-section');
                        el?.scrollIntoView({ behavior: 'smooth' });
                      }}
                      onOpenAtelier={() => handleOpenAtelier()}
                      onOpenLookbook={() => setActiveTab('lookbook')}
                      onApplyPromoCode={(code) => {
                        setAppliedDiscount(15);
                      }}
                    />
                    <CouponMarquee
                      onApplyCoupon={(code) => {
                        setAppliedDiscount(15);
                      }}
                    />
                    <ProductGrid
                      products={catalog}
                      currency={currency}
                      wishlistIds={wishlistIds}
                      onToggleWishlist={handleToggleWishlist}
                      onSelectProduct={(p) => handleSelectProduct(p)}
                      onQuickAdd={handleQuickAdd}
                      onBuyNow={handleBuyNow}
                      onOpenAtelierWithPrompt={handleOpenAtelierWithPrompt}
                      onOpenAtelier={() => handleOpenAtelier()}
                    />
                  </motion.div>
                )}

                {activeTab === 'lookbook' && (
                  <motion.div
                    key="tab-lookbook"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    transition={{ duration: 0.32, ease: [0.22, 1, 0.36, 1] }}
                  >
                    <EditorialLookbook
                      products={catalog}
                      currency={currency}
                      onSelectProduct={(p) => handleSelectProduct(p)}
                      onAddToCart={handleAddToCart}
                      onQuickAdd={handleQuickAdd}
                      onOpenAtelier={handleOpenAtelierWithPrompt}
                    />
                  </motion.div>
                )}
              </AnimatePresence>
            </main>

            {/* Footer */}
            <Footer 
              onOpenAtelier={() => handleOpenAtelier()} 
              onSwitchToMerchant={() => {
                setAppMode('merchant');
                window.scrollTo({ top: 0, behavior: 'smooth' });
              }}
              onOpenAuditTrail={() => {
                if (user) {
                  setIsSettingsOpen(true);
                } else {
                  setAuthRole('buyer');
                  setIsAuthOpen(true);
                }
              }}
            />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Global Drawers & Modals */}
      
      {/* Product Detail Modal (Connected directly to Live Centralized Store State) */}
      {liveSelectedProduct && (
        <ProductDetailModal
          product={liveSelectedProduct}
          allProducts={catalog}
          currency={currency}
          isOpen={Boolean(liveSelectedProduct)}
          onClose={() => setSelectedProduct(null)}
          onAddToCart={handleAddToCart}
          onBuyNow={handleBuyNow}
          isWishlisted={wishlistIds.includes(liveSelectedProduct.id)}
          onToggleWishlist={handleToggleWishlist}
          onSelectRelatedProduct={(p) => handleSelectProduct(p)}
          onOpenAtelierWithProduct={(p) => {
            setSelectedProduct(null);
            handleOpenAtelierWithPrompt(`How should I style the ${p.name} by ${p.designer || p.brand}?`);
          }}
        />
      )}

      {/* AI Upsell & Cross-Sell Opportunity Popup */}
      <UpsellCrossSellModal
        isOpen={Boolean(upsellBaseProduct)}
        onClose={() => setUpsellBaseProduct(null)}
        baseProduct={upsellBaseProduct}
        currency={currency}
        onAddPairingToBag={(prod) => {
          handleQuickAdd(prod, prod.sizes?.[0] || 'Standard');
          setUpsellBaseProduct(null);
        }}
      />

      {/* Shopping Bag Drawer */}
      <BagDrawer
        isOpen={isCartOpen}
        onClose={() => setIsCartOpen(false)}
        cart={cart}
        currency={currency}
        onUpdateQuantity={handleUpdateQuantity}
        onRemoveItem={handleRemoveFromCart}
        onAddToCart={(product, size, colorIndex) => handleAddToCart(product, size, colorIndex || 0)}
        onProceedToCheckout={(discount, giftPkg, giftMsg) => {
          setAppliedDiscount(discount);
          setGiftPackaging(giftPkg);
          setGiftMessage(giftMsg);
          if (!user) {
            setPendingCheckoutAfterAuth(true);
            setAuthRole('buyer');
            setPendingMode('buyer');
            setIsAuthOpen(true);
            return;
          }
          setIsCartOpen(false);
          setIsCheckoutOpen(true);
        }}
        onRequireAuth={() => {
          setPendingCheckoutAfterAuth(true);
          setAuthRole('buyer');
          setPendingMode('buyer');
          setIsAuthOpen(true);
        }}
        onExploreCollection={() => {
          setIsCartOpen(false);
          setAppMode('buyer');
          setActiveTab('shop');
        }}
        onSelectProduct={(p) => {
          setIsCartOpen(false);
          handleSelectProduct(p);
        }}
      />

      {/* Wishlist Drawer */}
      <WishlistDrawer
        isOpen={isWishlistOpen}
        onClose={() => setIsWishlistOpen(false)}
        wishlistIds={wishlistIds}
        products={catalog}
        currency={currency}
        onToggleWishlist={handleToggleWishlist}
        onMoveToBag={handleMoveWishlistToBag}
        onSelectProduct={(p) => {
          setIsWishlistOpen(false);
          handleSelectProduct(p);
        }}
      />

      {/* Conversational AI Stylist */}
      <AtelierStylist
        isOpen={isAtelierOpen}
        onClose={() => setIsAtelierOpen(false)}
        products={catalog}
        currency={currency}
        initialPrompt={atelierPrompt}
        onSelectProduct={(p) => {
          handleSelectProduct(p);
        }}
        onAddToCart={handleAddToCart}
      />


      {/* Controlled AI Checkout with Razorpay Test Mode */}
      <CheckoutModal
        isOpen={isCheckoutOpen}
        onClose={() => setIsCheckoutOpen(false)}
        cart={cart}
        currency={currency}
        discountPercent={appliedDiscount}
        giftPackaging={giftPackaging}
        giftMessage={giftMessage}
        onClearCart={() => setCart([])}
        onOpenAuditTrail={() => setIsSettingsOpen(true)}
        onRequireAuth={() => {
          setPendingCheckoutAfterAuth(true);
          setAuthRole('buyer');
          setPendingMode('buyer');
          setIsAuthOpen(true);
        }}
      />

      {/* Auth Modal (Supports master credential sharma.shivangiz105@gmail.com / Shivangi@1) */}
      <AuthModal
        isOpen={isAuthOpen}
        onClose={() => {
          setIsAuthOpen(false);
          setPendingMode(null);
          setPendingCheckoutAfterAuth(false);
        }}
        cartItemCount={totalCartCount}
        initialRole={authRole}
        onLoginSuccess={(role) => {
          const target = pendingMode || role || 'buyer';
          setPendingMode(null);
          setAppMode(target);
          if (pendingCheckoutAfterAuth) {
            setPendingCheckoutAfterAuth(false);
            setIsCartOpen(false);
            setIsCheckoutOpen(true);
          }
          window.scrollTo({ top: 0, behavior: 'smooth' });
        }}
      />

      {/* Settings Modal (Houses Security & Real-Time Audit Trail, Profile, AI settings - accessible after sign-in) */}
      <SettingsModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
      />

      {/* Autonomous AI Buyer Direct API Endpoint Terminal Modal */}
      <AgentBuyerTerminalModal
        isOpen={isAgentBuyerOpen}
        onClose={() => setIsAgentBuyerOpen(false)}
      />

      {/* Fallback Direct Audit Trail Modal if needed */}
      <AuditTrailModal
        isOpen={isAuditOpen}
        onClose={() => setIsAuditOpen(false)}
      />

      {/* Non-intrusive Luxury Add-To-Bag Toast Notification */}
      <AnimatePresence>
        {bagToast && (
          <motion.div
            id="bag-added-toast"
            initial={{ opacity: 0, y: -20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -20, scale: 0.95 }}
            transition={{ duration: 0.25 }}
            className="fixed top-20 right-4 sm:right-8 z-50 bg-[#121212] text-white p-3.5 rounded-xl shadow-2xl border border-white/15 flex items-center gap-3 max-w-sm font-['Archivo_Narrow']"
          >
            <div className="w-8 h-8 rounded-full bg-[#fc6018] flex items-center justify-center shrink-0">
              <ShoppingBag className="w-4 h-4 text-white" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="text-[10px] uppercase font-bold tracking-wider text-neutral-400">Added to Bag</div>
              <div className="text-xs font-semibold truncate text-white">{bagToast.name}</div>
              <div className="text-[10px] text-neutral-400 font-mono">Size: {bagToast.size}</div>
            </div>
            <button
              id="toast-view-bag-btn"
              onClick={() => {
                setBagToast(null);
                setIsCartOpen(true);
              }}
              className="px-2.5 py-1.5 bg-white/15 hover:bg-white text-white hover:text-black text-[10px] uppercase font-bold tracking-wider rounded transition-colors shrink-0 cursor-pointer"
            >
              View Bag
            </button>
          </motion.div>
        )}
      </AnimatePresence>

    </div>
  );
}

export function App() {
  return (
    <AuthProvider>
      <AuditProvider>
        <MerchantProvider>
          <LuxoraApp />
        </MerchantProvider>
      </AuditProvider>
    </AuthProvider>
  );
}

export default App;
