import React, { useState, useEffect, useRef } from 'react';
import { 
  X, 
  CheckCircle, 
  ShieldCheck, 
  Truck, 
  CreditCard, 
  Lock, 
  Sparkles, 
  ArrowRight, 
  Download, 
  Package, 
  UserCheck, 
  AlertTriangle,
  Smartphone,
  Check,
  Clock,
  WifiOff,
  RefreshCw,
  Bot,
  ChevronLeft,
  Terminal,
  KeyRound,
  AlertCircle,
  CheckCircle2,
  Info,
  ExternalLink
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { CartItem, Currency } from '../types';
import { CURRENCIES } from '../data/products';
import { useAuth } from '../context/AuthContext';
import { useMerchant } from '../context/MerchantContext';
import { useAudit } from '../context/AuditContext';
import { PriceChangeModal, OutOfStockModal } from './GracefulFailureBanner';
import { RazorpayModal } from './RazorpayModal';
import { 
  initializeRazorpayPayment, 
  RAZORPAY_CONFIG 
} from '../services/payment';

interface CheckoutModalProps {
  isOpen: boolean;
  onClose: () => void;
  items?: CartItem[];
  cart?: CartItem[];
  currency: Currency;
  discountPercent?: number;
  giftPackaging?: boolean;
  giftMessage?: string;
  onOrderCompleted?: () => void;
  onClearCart?: () => void;
  onOpenAuditTrail?: () => void;
}

export const CheckoutModal: React.FC<CheckoutModalProps> = ({
  isOpen,
  onClose,
  items: propItems,
  cart: propCart,
  currency,
  discountPercent = 0,
  giftPackaging = false,
  giftMessage = '',
  onOrderCompleted,
  onClearCart,
  onOpenAuditTrail,
}) => {
  const { user } = useAuth();
  const { 
    isSimulatedPriceChangeActive, 
    isSimulatedOutOfStockActive, 
    createOrder,
    catalog,
    guardrailPolicy
  } = useMerchant();
  const { addLog } = useAudit();

  const [step, setStep] = useState<'shipping' | 'payment' | 'ai-checkout' | 'confirmed'>('shipping');
  const [isProcessing, setIsProcessing] = useState(false);
  const [isRazorpayOpen, setIsRazorpayOpen] = useState(false);

  // Gated & Bounded approval states
  const [isGateApproved, setIsGateApproved] = useState(false);
  const [gateNotice, setGateNotice] = useState<string | null>(null);

  // Failure simulation modal states
  const [isPriceModalOpen, setIsPriceModalOpen] = useState(false);
  const [isStockModalOpen, setIsStockModalOpen] = useState(false);
  const [approvedPriceOverride, setApprovedPriceOverride] = useState(false);
  const [cardDeclineError, setCardDeclineError] = useState<string | null>(null);

  // Razorpay failure & retry modal state
  const [razorpayFailure, setRazorpayFailure] = useState<{
    isOpen: boolean;
    reason: string;
    errorCode?: string;
    paymentId?: string;
    source?: string;
    step?: string;
  } | null>(null);

  // 45-second live countdown timer
  const [checkoutTimeLeft, setCheckoutTimeLeft] = useState(45);
  const [isCheckoutTimedOut, setIsCheckoutTimedOut] = useState(false);
  const checkoutTimerRef = useRef<NodeJS.Timeout | null>(null);

  // AI Checkout Agent states
  const [aiLogs, setAiLogs] = useState<Array<{ text: string; status: 'pending' | 'success' | 'warning' | 'info'; timestamp: string }>>([]);
  const [aiStep, setAiStep] = useState<'analyzing' | 'gate1' | 'gate2' | 'gate3_approval_needed' | 'completed'>('analyzing');
  const [patronApproved, setPatronApproved] = useState(false);

  const items = propItems || propCart || [];

  // Form states with Auth pre-filling
  const [formData, setFormData] = useState({
    firstName: 'Eleanor',
    lastName: 'Vandermeer',
    email: 'e.vandermeer@private.lux',
    phone: '+91 98200 12345',
    address: '740 Park Avenue, Apt 14B',
    city: 'Mumbai',
    state: 'Maharashtra',
    postalCode: '400001',
    country: 'India',
    shippingMethod: 'white-glove',
    paymentMethod: 'credit-card',
    cardNumber: '4111 1111 1111 1111',
    cardExpiry: '09/29',
    cardCvc: '888',
    cardHolder: 'Eleanor Vandermeer'
  });

  // Reset checkout session whenever modal is opened so new orders start fresh
  useEffect(() => {
    if (isOpen) {
      setStep('shipping');
      setIsProcessing(false);
      setIsRazorpayOpen(false);
      setIsGateApproved(false);
      setGateNotice(null);
      setCardDeclineError(null);
      setApprovedPriceOverride(false);
      setIsPriceModalOpen(false);
      setIsStockModalOpen(false);
      setRazorpayFailure(null);
      setAiStep('analyzing');
      setAiLogs([]);
      setPatronApproved(false);
      setCheckoutTimeLeft(45);
      setIsCheckoutTimedOut(false);
    }
  }, [isOpen]);

  const handleCloseModal = () => {
    setStep('shipping');
    setIsProcessing(false);
    onClose();
  };

  useEffect(() => {
    if (user) {
      const parts = (user.displayName || '').split(' ');
      setFormData(prev => ({
        ...prev,
        firstName: parts[0] || prev.firstName,
        lastName: parts.slice(1).join(' ') || prev.lastName,
        email: user.email || prev.email,
        cardHolder: user.displayName || prev.cardHolder,
      }));
    }
  }, [user]);

  // Timer lifecycle (45 seconds)
  useEffect(() => {
    if (isOpen && step !== 'confirmed') {
      setCheckoutTimeLeft(45);
      setIsCheckoutTimedOut(false);
      setCardDeclineError(null);

      checkoutTimerRef.current = setInterval(() => {
        setCheckoutTimeLeft(prev => {
          if (prev <= 1) {
            clearInterval(checkoutTimerRef.current!);
            setIsCheckoutTimedOut(true);
            addLog('FAILURE', 'Checkout Session Expired (45s Limit)', '45-second checkout security lock expired. Cart preserved.', 'error');
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }

    return () => {
      if (checkoutTimerRef.current) clearInterval(checkoutTimerRef.current);
    };
  }, [isOpen, step]);

  const handleResetCheckoutTimer = () => {
    setCheckoutTimeLeft(45);
    setIsCheckoutTimedOut(false);
    setCardDeclineError(null);
    if (checkoutTimerRef.current) clearInterval(checkoutTimerRef.current);
    checkoutTimerRef.current = setInterval(() => {
      setCheckoutTimeLeft(prev => {
        if (prev <= 1) {
          clearInterval(checkoutTimerRef.current!);
          setIsCheckoutTimedOut(true);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    addLog('CHECKOUT', 'Checkout Timer Reset', 'Buyer renewed 45s checkout session.', 'info');
  };

  const handleTriggerCheckoutTimeout = () => {
    if (checkoutTimerRef.current) clearInterval(checkoutTimerRef.current);
    setCheckoutTimeLeft(0);
    setIsCheckoutTimedOut(true);
    addLog('FAILURE', 'Network Connection Timeout (45s Expired)', 'Payment session timed out. Graceful recovery prompt engaged.', 'error');
  };

  const [orderTrackingId, setOrderTrackingId] = useState('');

  // Bounded discount calculations via Merchant Guardrail Policy
  const rawDiscountPercent = discountPercent || 0;
  const isDiscountBounded = (guardrailPolicy?.enforceBoundedChecks ?? true) && rawDiscountPercent > (guardrailPolicy?.maxDiscountPercent ?? 15);
  const effectiveDiscountPercent = isDiscountBounded ? (guardrailPolicy?.maxDiscountPercent ?? 15) : rawDiscountPercent;

  const subtotalINR = (items || []).reduce((sum, item) => sum + (item?.product?.price || 0) * (item?.quantity || 1), 0);
  const discountINR = Math.round((subtotalINR * effectiveDiscountPercent) / 100);
  const totalINR = subtotalINR - discountINR;

  const handleAuthorizeHumanGate = () => {
    setIsGateApproved(true);
    setGateNotice(null);
    addLog(
      'GATE_APPROVAL',
      'Human Gate Authorization Granted',
      `Buyer verified order total ₹${totalINR.toLocaleString('en-IN')} and released autonomous payment lock.`,
      'success',
      { amountINR: totalINR, patron: `${formData.firstName} ${formData.lastName}` }
    );
  };

  // Check if resilience scenarios apply when initiating checkout
  const handleProceedToPayment = () => {
    // 1. Check if simulated out of stock is triggered
    if (isSimulatedOutOfStockActive && items.length > 0) {
      addLog('FAILURE', 'Graceful Recovery: Stock Depleted During Checkout', 'Piece currently has 0 inventory in boutique atelier.', 'warning');
      setIsStockModalOpen(true);
      return;
    }

    // 2. Check if simulated price change is triggered and not yet approved
    if (isSimulatedPriceChangeActive && !approvedPriceOverride && items.length > 0) {
      addLog('FAILURE', 'Graceful Recovery: Atelier Price Updated', 'Checkout stopped. Buyer approval required.', 'warning');
      setIsPriceModalOpen(true);
      return;
    }

    setStep('payment');
  };

  const handleOpenRazorpayGateway = () => {
    setIsRazorpayOpen(true);
  };

  const handlePayWithRazorpay = async () => {
    setIsProcessing(true);

    addLog(
      'RAZORPAY',
      'Razorpay Payment Gateway Triggered',
      `Initializing Razorpay Checkout Window for ${formData.firstName} ${formData.lastName} (Amount: ₹${totalINR.toLocaleString('en-IN')}).`,
      'info',
      { amountINR: totalINR, keyId: RAZORPAY_CONFIG.keyId }
    );

    await initializeRazorpayPayment({
      amountINR: totalINR,
      customer: {
        name: `${formData.firstName} ${formData.lastName}`,
        email: formData.email,
        phone: formData.phone,
        address: formData.address,
        city: formData.city,
        postalCode: formData.postalCode,
      },
      items: items.map(item => ({
        productId: item.product.id,
        name: item.product.name,
        size: item.selectedSize,
        color: item.selectedColor?.name,
        quantity: item.quantity,
        priceINR: item.product.price
      })),
      onSuccess: (res) => {
        setIsProcessing(false);
        addLog(
          'PAYMENT',
          'Razorpay Payment Captured & Verified',
          `Payment ID: ${res.paymentId} | Amount: ₹${totalINR.toLocaleString('en-IN')} | Order: ${res.orderId || 'Direct'}`,
          'success',
          { paymentId: res.paymentId, amountINR: totalINR, method: 'Razorpay Gateway' }
        );

        const newOrder = createOrder({
          buyerName: `${formData.firstName} ${formData.lastName}`,
          buyerEmail: formData.email,
          buyerPhone: formData.phone,
          items: items.map(item => ({
            productId: item.product.id,
            productName: item.product.name,
            size: item.selectedSize,
            color: item.selectedColor?.name || 'Standard',
            quantity: item.quantity,
            priceINR: item.product.price
          })),
          totalINR,
          paymentMethod: 'Razorpay Gateway',
          razorpayPaymentId: res.paymentId,
          status: 'Confirmed'
        });

        setOrderTrackingId(newOrder.orderNumber);
        setStep('confirmed');
        if (onOrderCompleted) onOrderCompleted();
        if (onClearCart) onClearCart();
      },
      onFailure: (err) => {
        setIsProcessing(false);
        setIsRazorpayOpen(false);
        setStep('payment');
        addLog(
          'FAILURE',
          'Razorpay Payment Failed — Order Preserved',
          `Reason: ${err.description} (Code: ${err.code}) | Bag items preserved.`,
          'error',
          { errorCode: err.code, reason: err.reason, paymentId: err.paymentId }
        );
        setRazorpayFailure({
          isOpen: true,
          reason: err.description || 'Payment authorization was declined or cancelled during gateway verification.',
          errorCode: err.code || 'PAYMENT_FAILED',
          paymentId: err.paymentId,
          step: err.reason || 'bank_authentication',
          source: 'Razorpay Sandbox Gateway'
        });
      },
      onDismiss: () => {
        setIsProcessing(false);
        addLog(
          'RAZORPAY',
          'Razorpay Window Dismissed',
          'Client closed the Razorpay checkout window before completing authorization.',
          'info'
        );
      }
    });
  };

  const handleTriggerRazorpayFailure = (customReason?: string) => {
    setIsProcessing(false);
    setIsRazorpayOpen(false);
    setStep('payment');
    const reason = customReason || 'Bank gateway rejected authorization in test mode. (Simulated Failure Challenge)';
    addLog(
      'FAILURE',
      'Razorpay Test Failure Triggered — Bag Preserved',
      `${reason} | Zero funds debited. Items safely preserved in bag.`,
      'error',
      { errorCode: 'TEST_GATEWAY_DECLINE', reason }
    );
    setRazorpayFailure({
      isOpen: true,
      reason,
      errorCode: 'TEST_GATEWAY_DECLINE',
      step: 'challenge_failure',
      source: 'Razorpay Sandbox Challenge'
    });
  };

  const handleRazorpaySuccess = (orderNumber: string) => {
    setOrderTrackingId(orderNumber);
    setIsRazorpayOpen(false);
    setStep('confirmed');
    if (onOrderCompleted) onOrderCompleted();
    if (onClearCart) onClearCart();
  };

  // AI AUTONOMOUS CHECKOUT HANDLER
  const startAiCheckout = () => {
    setStep('ai-checkout');
    setAiStep('analyzing');
    setPatronApproved(false);
    setAiLogs([
      { text: `[AGENT_INIT] Connecting to LUXORA Autonomous Agent Kernel v2.4...`, status: 'info', timestamp: new Date().toLocaleTimeString() }
    ]);

    setTimeout(() => {
      setAiLogs(prev => [
        ...prev,
        { text: `[GATE_1_INVENTORY] Validating atelier SKU stock and warehouse integrity...`, status: 'pending', timestamp: new Date().toLocaleTimeString() },
        { text: `✓ Verified: All ${items.length} items have reserved atelier inventory allocated.`, status: 'success', timestamp: new Date().toLocaleTimeString() }
      ]);
      setAiStep('gate1');

      setTimeout(() => {
        setAiLogs(prev => [
          ...prev,
          { text: `[GATE_2_EXPLAINABLE_MATH] Applying verified rule discounts (-${effectiveDiscountPercent}%) & complimentary courier...`, status: 'pending', timestamp: new Date().toLocaleTimeString() },
          { text: `✓ Mathematical Formula: Total = (₹${subtotalINR.toLocaleString('en-IN')} - ₹${discountINR.toLocaleString('en-IN')}) = ₹${totalINR.toLocaleString('en-IN')}`, status: 'success', timestamp: new Date().toLocaleTimeString() },
          ...(isDiscountBounded ? [{ text: `✓ Bounded Check: Discount bounded to merchant policy ceiling of ${guardrailPolicy?.maxDiscountPercent}%.`, status: 'info' as const, timestamp: new Date().toLocaleTimeString() }] : [])
        ]);
        setAiStep('gate2');

        setTimeout(() => {
          const spendingThreshold = guardrailPolicy?.maxSpendCapINR || 50000;
          const requiresHumanSignoff = (guardrailPolicy?.requireHumanGateAboveCap ?? true) || totalINR > spendingThreshold || !isGateApproved;

          if (!requiresHumanSignoff) {
            // Auto-Approve when within policy cap and Human Gating is not required
            setAiLogs(prev => [
              ...prev,
              { text: `[GATE_3_AUTONOMOUS_BOUNDS] Evaluating spending cap. Amount ₹${totalINR.toLocaleString('en-IN')} <= ₹${spendingThreshold.toLocaleString('en-IN')} threshold limit.`, status: 'info', timestamp: new Date().toLocaleTimeString() },
              { text: `✓ Autonomous Authorization Granted within policy bounds. Executing settlement...`, status: 'success', timestamp: new Date().toLocaleTimeString() }
            ]);
            finalizeAiOrder(false);
          } else {
            // Requires Human Gate Approval
            setAiLogs(prev => [
              ...prev,
              { text: `[GATE_3_HUMAN_IN_THE_LOOP] Monetary safety policy engaged (Cap: ₹${spendingThreshold.toLocaleString('en-IN')}).`, status: 'warning', timestamp: new Date().toLocaleTimeString() },
              { text: `⚠ AI Agent cannot debit funds autonomously without direct human confirmation. Awaiting 1-click human gate sign-off...`, status: 'warning', timestamp: new Date().toLocaleTimeString() }
            ]);
            setAiStep('gate3_approval_needed');
          }
        }, 1200);
      }, 1200);
    }, 1000);
  };

  const handlePatronApprove = () => {
    setPatronApproved(true);
    setIsGateApproved(true);
    setGateNotice(null);
    addLog(
      'GATE_APPROVAL',
      'Human Gate Authorization Granted',
      `Buyer verified order total ₹${totalINR.toLocaleString('en-IN')} and released autonomous payment gate.`,
      'success',
      { amountINR: totalINR, patron: `${formData.firstName} ${formData.lastName}` }
    );
    setAiLogs(prev => [
      ...prev,
      { text: `[PATRON_AUTH] 1-Click Gate Approval Confirmed: Patron signed & approved transaction of ₹${totalINR.toLocaleString('en-IN')}.`, status: 'success', timestamp: new Date().toLocaleTimeString() },
      { text: `Executing atomic settlement and generating SHA-256 audit receipt...`, status: 'info', timestamp: new Date().toLocaleTimeString() }
    ]);
    finalizeAiOrder(true);
  };

  const finalizeAiOrder = (wasHumanApproved: boolean) => {
    setTimeout(() => {
      const authReceipt = `audit_sha256_${Math.random().toString(36).substring(2, 14)}`;
      addLog(
        'CHECKOUT',
        'Autonomous AI Buyer Acquisition Executed',
        `Agent executed checkout for ₹${totalINR.toLocaleString('en-IN')} (${wasHumanApproved ? 'Patron Human-Gated' : 'Autonomous Bound <= Cap'}). Hash: ${authReceipt}`,
        'success',
        { amountINR: totalINR, method: 'Autonomous AI Buyer', hash: authReceipt }
      );

      const newOrder = createOrder({
        buyerName: `${formData.firstName} ${formData.lastName}`,
        buyerEmail: formData.email,
        buyerPhone: formData.phone,
        items: items.map(item => ({
          productId: item.product.id,
          productName: item.product.name,
          size: item.selectedSize,
          color: item.selectedColor?.name || 'Standard',
          quantity: item.quantity,
          priceINR: item.product.price
        })),
        totalINR,
        paymentMethod: wasHumanApproved ? 'Autonomous AI Buyer (Human Gate Approved)' : 'Autonomous AI Buyer (Auto-Cap)',
        status: 'Confirmed'
      });

      setOrderTrackingId(newOrder.orderNumber);
      setAiStep('completed');

      setTimeout(() => {
        setStep('confirmed');
        if (onOrderCompleted) onOrderCompleted();
        if (onClearCart) onClearCart();
      }, 1200);
    }, 1200);
  };

  const handleStandardCompleteOrder = () => {
    setCardDeclineError(null);
    setGateNotice(null);

    const spendingThreshold = guardrailPolicy?.maxSpendCapINR || 50000;
    if ((guardrailPolicy?.requireHumanGateAboveCap || totalINR > spendingThreshold) && !isGateApproved) {
      setGateNotice('Human Gate Confirmation Required: As per Merchant Guardrail Policy, transactions of this tier require 1-click human authorization prior to debit.');
      return;
    }

    const cleanedCard = (formData.cardNumber || '').replace(/\s+/g, '');

    // Automatic Insufficient balance detection when card ends with 0002
    if (formData.paymentMethod === 'credit-card' && cleanedCard.endsWith('0002')) {
      setIsProcessing(true);
      setTimeout(() => {
        setIsProcessing(false);
        setCardDeclineError('Transaction Declined: Your banking institution reported insufficient balance. Please choose another payment method or try an alternate card.');
        addLog(
          'FAILURE',
          'Card Payment Declined: Insufficient Balance',
          'Bank returned error: INSUFFICIENT_BALANCE for card ending in 0002. Shopping bag preserved.',
          'error',
          { amountINR: totalINR, cardEnding: '0002' }
        );
      }, 800);
      return;
    }

    setIsProcessing(true);
    addLog('CHECKOUT', 'Standard Checkout Processing', `Authorizing order for ${formData.firstName} ${formData.lastName}.`, 'info');

    setTimeout(() => {
      const newOrder = createOrder({
        buyerName: `${formData.firstName} ${formData.lastName}`,
        buyerEmail: formData.email,
        buyerPhone: formData.phone,
        items: items.map(item => ({
          productId: item.product.id,
          productName: item.product.name,
          size: item.selectedSize,
          color: item.selectedColor?.name || 'Standard',
          quantity: item.quantity,
          priceINR: item.product.price
        })),
        totalINR,
        paymentMethod: formData.paymentMethod === 'apple-pay' ? 'Apple Pay' : 'Private Luxury Card',
        status: 'Confirmed'
      });

      setOrderTrackingId(newOrder.orderNumber);
      setIsProcessing(false);
      setStep('confirmed');
      if (onOrderCompleted) onOrderCompleted();
      if (onClearCart) onClearCart();
    }, 1200);
  };

  if (!isOpen) return null;

  return (
    <>
      <motion.div
        id="checkout-modal-overlay"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.3 }}
        className="fixed inset-0 z-50 overflow-y-auto bg-black/70 backdrop-blur-xs flex items-center justify-center p-2 sm:p-4 lg:p-6 font-['Archivo_Narrow']"
        onClick={handleCloseModal}
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.96, y: 14 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.96, y: 14 }}
          transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
          className="relative w-full max-w-4xl bg-[#F8F7F4] shadow-2xl border border-[#121212]/10 overflow-hidden my-auto rounded-2xl"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Modal Header with Back Button and 45-Second Aesthetic Timer */}
          <div className="p-4 sm:p-5 border-b border-[#121212]/10 bg-[#F8F7F4] flex items-center justify-between">
            <div className="flex items-center space-x-3">
              {step !== 'confirmed' && (
                <button
                  onClick={() => {
                    if (step === 'payment' || step === 'ai-checkout') setStep('shipping');
                    else handleCloseModal();
                  }}
                  className="p-1.5 rounded-full hover:bg-neutral-200 text-neutral-700 transition-colors flex items-center gap-1 text-xs cursor-pointer"
                  title="Go Back"
                >
                  <ChevronLeft className="w-4 h-4" />
                  <span className="hidden sm:inline text-[11px] uppercase tracking-wider font-semibold">
                    {step === 'shipping' ? 'Back to Bag' : 'Back'}
                  </span>
                </button>
              )}
              <div className="flex items-center space-x-2">
                <Lock className="w-4 h-4 text-[#D9531E]" />
                <h2 className="font-serif text-lg sm:text-xl font-light text-[#121212]">
                  {step === 'confirmed' 
                    ? 'Haute Couture Order Confirmed' 
                    : step === 'ai-checkout'
                    ? 'LUXORA Autonomous Agent Checkout'
                    : 'LUXORA Private Concierge Checkout'}
                </h2>
              </div>
            </div>

            <div className="flex items-center space-x-3">
              {/* 45-Second Live Countdown Timer with Aesthetic Font */}
              {step !== 'confirmed' && (
                <div className={`flex items-center space-x-1.5 px-3.5 py-1 rounded-full text-xs font-mono tracking-[0.22em] font-semibold border transition-all ${
                  checkoutTimeLeft < 10 ? 'bg-rose-50 text-rose-700 border-rose-300 animate-pulse' : 'bg-[#f4efe6] text-[#8c3500] border-[#8c3500]/25 shadow-2xs'
                }`}>
                  <Clock className="w-3.5 h-3.5 opacity-80" />
                  <span>00:{checkoutTimeLeft.toString().padStart(2, '0')}</span>
                </div>
              )}

              {step !== 'confirmed' && (
                <button
                  onClick={handleCloseModal}
                  className="p-1.5 hover:bg-black hover:text-white rounded-full transition-colors border border-neutral-300 cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>
          </div>

          {/* TIMEOUT ERROR SCREEN (When 45s expires) */}
          {isCheckoutTimedOut && step !== 'confirmed' ? (
            <div className="p-8 sm:p-12 text-center space-y-5 max-w-xl mx-auto">
              <div className="w-14 h-14 rounded-full bg-rose-100 text-rose-700 flex items-center justify-center mx-auto">
                <WifiOff className="w-7 h-7" />
              </div>
              <div>
                <span className="text-[10px] uppercase font-bold text-rose-700 tracking-[0.2em] block mb-1">
                  Payment Session Expired
                </span>
                <h3 className="font-serif text-2xl font-light text-neutral-900">
                  Checkout Security Handshake Timed Out
                </h3>
              </div>
              <p className="text-xs text-neutral-600 leading-relaxed max-w-md mx-auto font-light">
                The secure banking session elapsed. Zero funds were debited and your boutique shopping bag ({items.length} items) remains 100% preserved. Please retry your payment to proceed.
              </p>

              <div className="pt-2 flex flex-col sm:flex-row justify-center gap-3">
                <button
                  onClick={handleResetCheckoutTimer}
                  className="px-6 py-3.5 bg-blue-600 hover:bg-blue-700 text-white text-xs uppercase tracking-widest font-semibold transition-colors flex items-center justify-center space-x-2 shadow-sm rounded-xl cursor-pointer"
                >
                  <RefreshCw className="w-4 h-4" />
                  <span>Retry Payment</span>
                </button>
                <button
                  onClick={onClose}
                  className="px-6 py-3.5 bg-white hover:bg-neutral-100 border border-neutral-300 text-neutral-700 text-xs uppercase tracking-widest font-medium transition-colors rounded-xl cursor-pointer"
                >
                  Back to Bag
                </button>
              </div>
            </div>
          ) : step === 'ai-checkout' ? (
            /* AUTONOMOUS AI CHECKOUT TERMINAL VIEW WITH GREEN BLINKING DOT */
            <div className="p-6 sm:p-8 space-y-6 max-h-[85vh] overflow-y-auto">
              <div className="flex items-center justify-between pb-3 border-b border-neutral-200">
                <div className="flex items-center space-x-3">
                  <div className="relative flex items-center justify-center w-4 h-4">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500"></span>
                  </div>
                  <div>
                    <h3 className="font-semibold text-neutral-900 text-sm flex items-center gap-1.5">
                      <Bot className="w-4 h-4 text-emerald-600" />
                      <span>LUXORA Autonomous Buyer Agent</span>
                    </h3>
                    <p className="text-[11px] text-neutral-500 font-mono">
                      Autonomous Bounds: Cap ≤ ₹25,000 | Multi-Factor Patron Gating &gt; ₹25,000
                    </p>
                  </div>
                </div>

                <span className="text-[10px] uppercase font-bold tracking-wider px-2.5 py-1 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-300 flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-600 animate-pulse"></span>
                  Agent Active
                </span>
              </div>

              {/* Chat / Terminal Log Stream */}
              <div className="bg-[#121212] text-emerald-400 p-4 sm:p-6 rounded-2xl font-mono text-xs space-y-2.5 shadow-inner border border-neutral-800 max-h-72 overflow-y-auto custom-scrollbar">
                <div className="flex items-center justify-between pb-2 border-b border-neutral-800 text-[10px] text-neutral-400">
                  <span className="flex items-center gap-1.5">
                    <Terminal className="w-3.5 h-3.5 text-emerald-500" />
                    <span>KERNEL EXECUTION STREAM</span>
                  </span>
                  <span>SESSION_ID: {Math.random().toString(36).substring(2, 9).toUpperCase()}</span>
                </div>

                {aiLogs.map((log, idx) => (
                  <div key={idx} className="leading-relaxed flex items-start space-x-2">
                    <span className="text-neutral-500 text-[10px] shrink-0 mt-0.5">{log.timestamp}</span>
                    <span className={`flex-1 ${
                      log.status === 'success' 
                        ? 'text-emerald-300' 
                        : log.status === 'warning' 
                        ? 'text-amber-300' 
                        : log.status === 'info' 
                        ? 'text-blue-300' 
                        : 'text-neutral-300'
                    }`}>
                      {log.text}
                    </span>
                  </div>
                ))}

                {aiStep !== 'completed' && aiStep !== 'gate3_approval_needed' && (
                  <div className="flex items-center space-x-2 text-neutral-400 pt-1">
                    <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping"></span>
                    <span className="italic text-[11px]">Processing cryptographic checks...</span>
                  </div>
                )}
              </div>

              {/* Gating Confirmation Step (If > ₹25k) */}
              {aiStep === 'gate3_approval_needed' && !patronApproved && (
                <div className="p-5 rounded-2xl bg-amber-50 border border-amber-300 space-y-3 animate-in fade-in">
                  <div className="flex items-start space-x-3">
                    <div className="w-10 h-10 rounded-full bg-amber-100 text-amber-800 flex items-center justify-center shrink-0">
                      <KeyRound className="w-5 h-5" />
                    </div>
                    <div>
                      <h4 className="text-sm font-bold text-amber-950">
                        Gate 3: Multi-Factor Patron Confirmation Required
                      </h4>
                      <p className="text-xs text-amber-900 font-light mt-0.5 leading-relaxed">
                        Total order value (<strong>₹{totalINR.toLocaleString('en-IN')}</strong>) exceeds the autonomous threshold of ₹25,000. Autonomous acquisition requires your cryptographic human confirmation.
                      </p>
                    </div>
                  </div>

                  <div className="pt-2 flex items-center gap-3">
                    <button
                      onClick={handlePatronApprove}
                      className="flex-1 py-3 bg-[#121212] hover:bg-black text-white rounded-xl text-xs uppercase tracking-widest font-semibold transition-all flex items-center justify-center space-x-2 shadow-md cursor-pointer"
                    >
                      <Sparkles className="w-4 h-4 text-amber-400" />
                      <span>Authorize Transaction as Patron (₹{totalINR.toLocaleString('en-IN')})</span>
                    </button>
                    <button
                      onClick={() => setStep('payment')}
                      className="px-4 py-3 bg-white hover:bg-neutral-100 border border-neutral-300 text-neutral-700 rounded-xl text-xs font-semibold"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              )}

              {aiStep === 'completed' && (
                <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-300 text-emerald-900 text-xs flex items-center space-x-2">
                  <CheckCircle className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>Autonomous transaction settled successfully. Redirecting to confirmation...</span>
                </div>
              )}

              <div className="pt-2 flex justify-between items-center text-xs">
                <button
                  onClick={() => setStep('payment')}
                  className="text-neutral-500 hover:text-black uppercase tracking-wider flex items-center gap-1"
                >
                  <ChevronLeft className="w-3.5 h-3.5" />
                  <span>Back to Standard Payment</span>
                </button>
              </div>
            </div>
          ) : step !== 'confirmed' ? (
            <div className="grid grid-cols-1 lg:grid-cols-12 max-h-[85vh] overflow-y-auto custom-scrollbar">
              
              {/* Left: Form Fields */}
              <div className="lg:col-span-7 p-6 sm:p-8 space-y-6">
                
                {/* Step Tabs */}
                <div className="flex items-center space-x-4 border-b border-neutral-200 pb-3 text-xs uppercase tracking-widest">
                  <button
                    onClick={() => setStep('shipping')}
                    className={`pb-1 ${step === 'shipping' ? 'font-bold border-b-2 border-black text-black' : 'text-neutral-400'}`}
                  >
                    1. Shipping & White-Glove Courier
                  </button>
                  <span className="text-neutral-300">/</span>
                  <button
                    onClick={handleProceedToPayment}
                    className={`pb-1 ${step === 'payment' ? 'font-bold border-b-2 border-black text-black' : 'text-neutral-400'}`}
                  >
                    2. Payment & Verification
                  </button>
                </div>

                {step === 'shipping' ? (
                  <div className="space-y-4 text-xs">
                    <h3 className="font-serif text-lg font-light text-neutral-900">
                      Recipient & Delivery Destination
                    </h3>

                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="block text-[10px] uppercase tracking-wider text-neutral-500 mb-1">First Name</label>
                        <input
                          type="text"
                          value={formData.firstName}
                          onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                          className="w-full bg-white border border-neutral-300 px-3 py-2 text-xs focus:outline-none"
                        />
                      </div>
                      <div>
                        <label className="block text-[10px] uppercase tracking-wider text-neutral-500 mb-1">Last Name</label>
                        <input
                          type="text"
                          value={formData.lastName}
                          onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                          className="w-full bg-white border border-neutral-300 px-3 py-2 text-xs focus:outline-none"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="block text-[10px] uppercase tracking-wider text-neutral-500 mb-1">Private Email</label>
                        <input
                          type="email"
                          value={formData.email}
                          onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                          className="w-full bg-white border border-neutral-300 px-3 py-2 text-xs focus:outline-none"
                        />
                      </div>
                      <div>
                        <label className="block text-[10px] uppercase tracking-wider text-neutral-500 mb-1">Phone (Courier Contact)</label>
                        <input
                          type="tel"
                          value={formData.phone}
                          onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                          className="w-full bg-white border border-neutral-300 px-3 py-2 text-xs focus:outline-none"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-[10px] uppercase tracking-wider text-neutral-500 mb-1">Street Address</label>
                      <input
                        type="text"
                        value={formData.address}
                        onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                        className="w-full bg-white border border-neutral-300 px-3 py-2 text-xs focus:outline-none"
                      />
                    </div>

                    <div className="grid grid-cols-3 gap-3">
                      <div>
                        <label className="block text-[10px] uppercase tracking-wider text-neutral-500 mb-1">City</label>
                        <input
                          type="text"
                          value={formData.city}
                          onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                          className="w-full bg-white border border-neutral-300 px-3 py-2 text-xs focus:outline-none"
                        />
                      </div>
                      <div>
                        <label className="block text-[10px] uppercase tracking-wider text-neutral-500 mb-1">State / Province</label>
                        <input
                          type="text"
                          value={formData.state}
                          onChange={(e) => setFormData({ ...formData, state: e.target.value })}
                          className="w-full bg-white border border-neutral-300 px-3 py-2 text-xs focus:outline-none"
                        />
                      </div>
                      <div>
                        <label className="block text-[10px] uppercase tracking-wider text-neutral-500 mb-1">Postal Code</label>
                        <input
                          type="text"
                          value={formData.postalCode}
                          onChange={(e) => setFormData({ ...formData, postalCode: e.target.value })}
                          className="w-full bg-white border border-neutral-300 px-3 py-2 text-xs focus:outline-none"
                        />
                      </div>
                    </div>

                    <div className="pt-3 flex items-center gap-3">
                      <button
                        onClick={handleProceedToPayment}
                        className="flex-1 py-3.5 bg-[#121212] hover:bg-[#D9531E] text-white text-xs uppercase tracking-[0.2em] font-medium transition-colors flex items-center justify-center space-x-2"
                      >
                        <span>Proceed to Payment</span>
                        <ArrowRight className="w-4 h-4" />
                      </button>
                      <button
                        onClick={onClose}
                        className="px-5 py-3.5 bg-neutral-200 hover:bg-neutral-300 text-neutral-800 text-xs uppercase tracking-wider font-semibold transition-colors"
                      >
                        Back to Bag
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-4 text-xs">
                    <div className="flex items-center justify-between">
                      <h3 className="font-serif text-lg font-light text-neutral-900">
                        Select Payment Method
                      </h3>
                      <button
                        onClick={handleTriggerCheckoutTimeout}
                        className="text-[10px] text-neutral-500 hover:text-[#a83900] underline font-serif cursor-pointer"
                        title="Evaluate 45s gateway latency expiration and graceful session extension"
                      >
                        Test Session Latency / Timeout
                      </button>
                    </div>

                    {/* 1-Click Merchant & Buyer Gate Approval Banner (Gated Human-in-the-Loop) */}
                    <div className={`p-4 rounded-xl border transition-all ${
                      isGateApproved 
                        ? 'bg-emerald-50/90 border-emerald-300 text-emerald-950' 
                        : 'bg-amber-50/90 border-amber-300 text-amber-950 shadow-xs'
                    }`}>
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex items-start space-x-3">
                          <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${
                            isGateApproved ? 'bg-emerald-200 text-emerald-800' : 'bg-amber-200 text-amber-800'
                          }`}>
                            <ShieldCheck className="w-4 h-4" />
                          </div>
                          <div>
                            <div className="flex items-center gap-2">
                              <h4 className="font-bold text-xs text-neutral-900">
                                {isGateApproved ? 'Human Gate Verification: Approved' : 'Human Gate Approval Required'}
                              </h4>
                              <span className={`text-[9px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full ${
                                isGateApproved ? 'bg-emerald-200 text-emerald-900' : 'bg-amber-200 text-amber-900 animate-pulse'
                              }`}>
                                {isGateApproved ? 'GATED ✓ SIGNED OFF' : 'GATED ⚠ HUMAN CONFIRMATION'}
                              </span>
                            </div>
                            <p className="text-[11px] text-neutral-600 leading-relaxed mt-0.5">
                              {isGateApproved
                                ? `Explicit human authorization logged. Payment lock released for ₹${totalINR.toLocaleString('en-IN')}.`
                                : `AI Agent cannot debit funds without patron/merchant review. Verify amount (₹${totalINR.toLocaleString('en-IN')}) and click below to release lock.`
                              }
                            </p>
                          </div>
                        </div>
                      </div>

                      {!isGateApproved ? (
                        <div className="mt-3 pt-2.5 border-t border-amber-200/80 flex flex-wrap items-center justify-between gap-2">
                          <span className="text-[10px] text-amber-900 font-mono">
                            Policy Bound: Cap ₹{guardrailPolicy?.maxSpendCapINR.toLocaleString('en-IN')}
                          </span>
                          <button
                            type="button"
                            onClick={handleAuthorizeHumanGate}
                            className="px-3.5 py-1.5 bg-black hover:bg-neutral-800 text-white rounded-lg text-[11px] font-semibold tracking-wider flex items-center gap-1.5 shadow-xs transition-all cursor-pointer"
                          >
                            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                            <span>1-Click Gate Approval (Release Payment)</span>
                          </button>
                        </div>
                      ) : (
                        <div className="mt-2 text-[10px] text-emerald-800 flex items-center gap-1 font-mono">
                          <Check className="w-3 h-3 text-emerald-600" />
                          <span>Human Authorization Confirmed • Token #GATE-{Date.now().toString().slice(-6)}</span>
                        </div>
                      )}
                    </div>

                    {gateNotice && !isGateApproved && (
                      <div className="p-3 bg-rose-50 border border-rose-200 text-rose-800 rounded-xl text-xs flex items-center gap-2">
                        <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0" />
                        <span className="flex-1">{gateNotice}</span>
                        <button
                          type="button"
                          onClick={handleAuthorizeHumanGate}
                          className="px-2.5 py-1 bg-rose-700 text-white text-[10px] font-bold uppercase rounded cursor-pointer shrink-0"
                        >
                          Approve Now
                        </button>
                      </div>
                    )}

                    {/* INLINE PROBLEM / FAILURE DETECTION BOX ON PRIVATE CONCIERGE CHECKOUT */}
                    {razorpayFailure && (
                      <div 
                        id="inline-payment-issue-card"
                        className="p-4 sm:p-5 rounded-xl bg-rose-50/95 border border-rose-300 text-rose-950 space-y-3 shadow-xs animate-in fade-in"
                      >
                        <div className="flex items-start justify-between gap-3">
                          <div className="flex items-start space-x-3">
                            <div className="w-8 h-8 rounded-lg bg-rose-100 text-rose-700 flex items-center justify-center shrink-0 mt-0.5">
                              <AlertCircle className="w-5 h-5" />
                            </div>
                            <div className="space-y-1">
                              <div className="flex items-center gap-2 flex-wrap">
                                <h4 className="font-bold text-xs text-rose-950 font-sans tracking-wide">
                                  Problem Detected: Payment Authorization Declined
                                </h4>
                                {razorpayFailure.errorCode && (
                                  <span className="text-[9px] uppercase font-mono font-bold tracking-wider px-2 py-0.5 rounded bg-rose-200 text-rose-900 border border-rose-300">
                                    {razorpayFailure.errorCode}
                                  </span>
                                )}
                              </div>
                              <p className="text-xs text-rose-900 leading-relaxed font-normal">
                                {razorpayFailure.reason}
                              </p>
                              <div className="text-[10px] text-rose-700/90 font-mono pt-0.5 flex flex-wrap items-center gap-2">
                                <span>Source: {razorpayFailure.source || 'Razorpay Gateway'}</span>
                                <span>•</span>
                                <span className="text-emerald-800 font-sans font-medium">
                                  ✓ Shopping bag ({items.length} items) preserved • Zero funds deducted
                                </span>
                              </div>
                            </div>
                          </div>

                          <button
                            type="button"
                            onClick={() => setRazorpayFailure(null)}
                            className="text-rose-400 hover:text-rose-700 p-1 rounded transition-colors cursor-pointer"
                            title="Dismiss notification"
                          >
                            <X className="w-4 h-4" />
                          </button>
                        </div>

                        {/* Inline Resolution Actions */}
                        <div className="pt-2 border-t border-rose-200/80 flex flex-wrap items-center gap-2">
                          <button
                            type="button"
                            onClick={() => {
                              setRazorpayFailure(null);
                              handlePayWithRazorpay();
                            }}
                            className="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-[10px] uppercase font-bold tracking-wider flex items-center gap-1.5 transition-colors cursor-pointer shadow-2xs"
                          >
                            <RefreshCw className="w-3.5 h-3.5" />
                            <span>Retry Razorpay (₹{totalINR.toLocaleString('en-IN')})</span>
                          </button>
                          <button
                            type="button"
                            onClick={() => {
                              setRazorpayFailure(null);
                              setFormData(prev => ({ ...prev, paymentMethod: 'credit-card' }));
                            }}
                            className="px-3 py-1.5 bg-white hover:bg-neutral-100 border border-rose-300 text-neutral-800 rounded-lg text-[10px] font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
                          >
                            <CreditCard className="w-3.5 h-3.5 text-neutral-600" />
                            <span>Pay with Card</span>
                          </button>
                          <button
                            type="button"
                            onClick={() => {
                              setRazorpayFailure(null);
                              setFormData(prev => ({ ...prev, paymentMethod: 'ai-agent' }));
                              startAiCheckout();
                            }}
                            className="px-3 py-1.5 bg-emerald-700 hover:bg-emerald-800 text-white rounded-lg text-[10px] uppercase font-bold tracking-wider flex items-center gap-1.5 transition-colors cursor-pointer"
                          >
                            <Bot className="w-3.5 h-3.5" />
                            <span>Autonomous AI Buyer</span>
                          </button>
                        </div>
                      </div>
                    )}

                    {/* Insufficient Balance / Card Decline Notification */}
                    {cardDeclineError && (
                      <div className="p-4 rounded-xl bg-rose-50 border border-rose-300 text-rose-900 space-y-2.5 animate-in fade-in">
                        <div className="flex items-start space-x-2.5">
                          <AlertCircle className="w-4 h-4 text-rose-700 shrink-0 mt-0.5" />
                          <div>
                            <h4 className="font-bold text-xs text-rose-950">Payment Authorization Declined</h4>
                            <p className="text-[11px] text-rose-800 leading-relaxed mt-0.5">
                              {cardDeclineError}
                            </p>
                          </div>
                        </div>
                        <div className="pt-1 flex items-center gap-2">
                          <button
                            type="button"
                            onClick={() => {
                              setCardDeclineError(null);
                              setFormData(prev => ({ ...prev, paymentMethod: 'razorpay' }));
                              handleOpenRazorpayGateway();
                            }}
                            className="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-[10px] uppercase font-bold tracking-wider transition-colors cursor-pointer"
                          >
                            Switch to Razorpay
                          </button>
                          <button
                            type="button"
                            onClick={() => {
                              setCardDeclineError(null);
                              setFormData(prev => ({ ...prev, cardNumber: '4111 1111 1111 1111' }));
                            }}
                            className="px-3 py-1.5 bg-white border border-rose-300 text-neutral-800 rounded-lg text-[10px] font-semibold hover:bg-neutral-50 transition-colors cursor-pointer"
                          >
                            Try Alternate Card
                          </button>
                        </div>
                      </div>
                    )}

                    <div className="space-y-2">
                      {/* LUXURY CREDIT CARD OPTION */}
                      <label 
                        className={`flex items-center justify-between p-3.5 rounded-xl cursor-pointer transition-all border ${
                          formData.paymentMethod === 'credit-card'
                            ? 'border-black bg-[#fbf9f4] shadow-xs'
                            : 'border-black/10 bg-white hover:border-black/30'
                        }`}
                      >
                        <div className="flex items-center space-x-2.5">
                          <input
                            type="radio"
                            name="paymentMethod"
                            checked={formData.paymentMethod === 'credit-card'}
                            onChange={() => {
                              setCardDeclineError(null);
                              setFormData({ ...formData, paymentMethod: 'credit-card' });
                            }}
                            className="accent-black"
                          />
                          <div>
                            <span className="font-semibold text-neutral-900 font-sans">Credit / Debit Card</span>
                            <p className="text-[11px] text-neutral-600 font-light">Visa, Mastercard, American Express</p>
                          </div>
                        </div>
                        <CreditCard className="w-4 h-4 text-neutral-800" />
                      </label>

                      {/* CARD DETAILS FORM (When credit card is selected) */}
                      {formData.paymentMethod === 'credit-card' && (
                        <div className="p-4 bg-white border border-neutral-300 rounded-xl space-y-3 shadow-xs">
                          <div>
                            <label className="block text-[10px] uppercase tracking-wider text-neutral-600 font-bold mb-1">
                              Card Number (16 Digits)
                            </label>
                            <input
                              type="text"
                              value={formData.cardNumber}
                              onChange={(e) => {
                                setCardDeclineError(null);
                                setFormData({ ...formData, cardNumber: e.target.value });
                              }}
                              placeholder="4111 1111 1111 1111"
                              maxLength={19}
                              className="w-full bg-[#fbf9f4] border border-neutral-300 rounded-lg px-3 py-2 text-xs font-mono focus:outline-none focus:border-black"
                            />
                          </div>

                          <div className="grid grid-cols-2 gap-3">
                            <div>
                              <label className="block text-[10px] uppercase tracking-wider text-neutral-600 font-bold mb-1">
                                Expiry Date
                              </label>
                              <input
                                type="text"
                                value={formData.cardExpiry}
                                onChange={(e) => setFormData({ ...formData, cardExpiry: e.target.value })}
                                placeholder="MM / YY"
                                className="w-full bg-[#fbf9f4] border border-neutral-300 rounded-lg px-3 py-2 text-xs font-mono focus:outline-none focus:border-black"
                              />
                            </div>
                            <div>
                              <label className="block text-[10px] uppercase tracking-wider text-neutral-600 font-bold mb-1">
                                CVV / Security Code
                              </label>
                              <input
                                type="text"
                                value={formData.cardCvc}
                                onChange={(e) => setFormData({ ...formData, cardCvc: e.target.value })}
                                placeholder="CVV"
                                maxLength={4}
                                className="w-full bg-[#fbf9f4] border border-neutral-300 rounded-lg px-3 py-2 text-xs font-mono focus:outline-none focus:border-black"
                              />
                            </div>
                          </div>

                          <div>
                            <label className="block text-[10px] uppercase tracking-wider text-neutral-600 font-bold mb-1">
                              Cardholder Name
                            </label>
                            <input
                              type="text"
                              value={formData.cardHolder}
                              onChange={(e) => setFormData({ ...formData, cardHolder: e.target.value })}
                              placeholder="Cardholder Name"
                              className="w-full bg-[#fbf9f4] border border-neutral-300 rounded-lg px-3 py-2 text-xs focus:outline-none focus:border-black"
                            />
                          </div>
                        </div>
                      )}

                      {/* RAZORPAY OPTION */}
                      <label 
                        className={`flex items-center justify-between p-3.5 rounded-xl cursor-pointer transition-all border ${
                          formData.paymentMethod === 'razorpay'
                            ? 'border-black bg-[#fbf9f4] shadow-xs'
                            : 'border-black/10 bg-white hover:border-black/30'
                        }`}
                      >
                        <div className="flex items-center space-x-2.5">
                          <input
                            type="radio"
                            name="paymentMethod"
                            checked={formData.paymentMethod === 'razorpay'}
                            onChange={() => {
                              setCardDeclineError(null);
                              setFormData({ ...formData, paymentMethod: 'razorpay' });
                            }}
                            className="accent-blue-600"
                          />
                          <div>
                            <div className="flex items-center space-x-2">
                              <span className="font-semibold text-neutral-900 font-sans">Razorpay</span>
                              <span className="text-[9px] px-1.5 py-0.5 rounded bg-blue-100 text-blue-900 font-bold uppercase tracking-wider">
                                UPI / Cards / Netbanking
                              </span>
                            </div>
                            <p className="text-[11px] text-neutral-600 font-light">Official secure payment gateway & merchant portal</p>
                          </div>
                        </div>
                        <span className="text-[10px] font-serif uppercase font-bold text-blue-800">Direct Gateway</span>
                      </label>

                      {/* AUTONOMOUS AI CHECKOUT OPTION */}
                      <label 
                        className={`flex items-center justify-between p-3.5 rounded-xl cursor-pointer transition-all border ${
                          formData.paymentMethod === 'ai-agent'
                            ? 'border-black bg-[#fbf9f4] shadow-xs'
                            : 'border-black/10 bg-white hover:border-black/30'
                        }`}
                      >
                        <div className="flex items-center space-x-2.5">
                          <input
                            type="radio"
                            name="paymentMethod"
                            checked={formData.paymentMethod === 'ai-agent'}
                            onChange={() => {
                              setCardDeclineError(null);
                              setFormData({ ...formData, paymentMethod: 'ai-agent' });
                            }}
                            className="accent-emerald-600"
                          />
                          <div>
                            <div className="flex items-center space-x-2">
                              <span className="font-semibold text-neutral-900 font-sans">Autonomous AI Buyer</span>
                              <span className="relative flex h-2 w-2">
                                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                              </span>
                            </div>
                            <p className="text-[11px] text-neutral-600 font-light">Spending cap (≤ ₹25,000) & Human Gating confirmation</p>
                          </div>
                        </div>
                        <span className="text-[10px] font-mono uppercase font-bold text-emerald-800 bg-emerald-200/60 px-2 py-0.5 rounded">AI Kernel</span>
                      </label>

                      {/* APPLE PAY */}
                      <label 
                        className={`flex items-center justify-between p-3.5 rounded-xl cursor-pointer transition-all border ${
                          formData.paymentMethod === 'apple-pay'
                            ? 'border-black bg-[#fbf9f4] shadow-xs'
                            : 'border-black/10 bg-white hover:border-black/30'
                        }`}
                      >
                        <div className="flex items-center space-x-2.5">
                          <input
                            type="radio"
                            name="paymentMethod"
                            checked={formData.paymentMethod === 'apple-pay'}
                            onChange={() => {
                              setCardDeclineError(null);
                              setFormData({ ...formData, paymentMethod: 'apple-pay' });
                            }}
                            className="accent-black"
                          />
                          <span className="font-medium text-neutral-900">Apple Pay / Biometric</span>
                        </div>
                        <span className="text-[10px] font-mono uppercase text-neutral-500">Touch ID</span>
                      </label>
                    </div>

                    <div className="pt-2 space-y-2">
                      {formData.paymentMethod === 'ai-agent' ? (
                        <button
                          id="pay-ai-agent-btn"
                          type="button"
                          onClick={startAiCheckout}
                          className="w-full py-4 bg-emerald-700 hover:bg-emerald-800 text-white text-xs uppercase tracking-[0.24em] font-semibold transition-all flex items-center justify-center space-x-2 shadow-md rounded-xl cursor-pointer"
                        >
                          <span className="relative flex h-2.5 w-2.5 mr-1">
                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-300 opacity-75"></span>
                            <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-white"></span>
                          </span>
                          <span>Launch Autonomous AI Checkout (₹{totalINR.toLocaleString('en-IN')})</span>
                        </button>
                      ) : formData.paymentMethod === 'razorpay' ? (
                        <div className="space-y-2">
                          <button
                            id="pay-razorpay-btn"
                            type="button"
                            onClick={handlePayWithRazorpay}
                            disabled={isProcessing}
                            className="w-full py-4 bg-blue-600 hover:bg-blue-700 text-white text-xs uppercase tracking-[0.24em] font-semibold transition-all flex items-center justify-center space-x-2 shadow-md rounded-xl cursor-pointer disabled:opacity-60"
                          >
                            {isProcessing ? (
                              <RefreshCw className="w-4 h-4 animate-spin" />
                            ) : (
                              <Sparkles className="w-4 h-4 text-amber-300" />
                            )}
                            <span>{isProcessing ? 'Connecting Gateway...' : `Pay ₹${totalINR.toLocaleString('en-IN')} with Razorpay`}</span>
                          </button>
                        </div>
                      ) : (
                        <button
                          id="place-order-btn"
                          type="button"
                          onClick={handleStandardCompleteOrder}
                          disabled={isProcessing}
                          className="w-full py-4 bg-[#121212] hover:bg-[#D9531E] text-white text-xs uppercase tracking-[0.24em] font-medium transition-colors flex items-center justify-center space-x-2 rounded-xl cursor-pointer"
                        >
                          {isProcessing ? (
                            <RefreshCw className="w-4 h-4 animate-spin" />
                          ) : (
                            <Sparkles className="w-4 h-4 text-[#D9531E]" />
                          )}
                          <span>{isProcessing ? 'Authorizing Payment...' : `Authorize Payment • ₹${totalINR.toLocaleString('en-IN')}`}</span>
                        </button>
                      )}

                      <div className="flex items-center justify-between pt-1">
                        <button
                          onClick={() => setStep('shipping')}
                          className="text-xs text-neutral-500 hover:text-black uppercase tracking-wider flex items-center gap-1 cursor-pointer"
                        >
                          <ChevronLeft className="w-3.5 h-3.5" />
                          <span>Back to Shipping</span>
                        </button>
                        <button
                          onClick={onClose}
                          className="text-xs text-neutral-500 hover:text-black uppercase tracking-wider cursor-pointer"
                        >
                          Back to Bag
                        </button>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Right: Order Summary Sidebar */}
              <div className="lg:col-span-5 p-6 sm:p-8 bg-[#ECE8DF] border-t lg:border-t-0 lg:border-l border-[#121212]/10 space-y-4">
                <h3 className="font-serif text-lg font-light text-neutral-900">
                  Order Summary ({items.length} items)
                </h3>

                <div className="space-y-3 max-h-60 overflow-y-auto pr-1 custom-scrollbar">
                  {items.map((it) => (
                    <div key={it.id} className="flex space-x-3 text-xs items-center">
                      <img src={it.product?.images?.[0] || it.product?.imageUrl || ''} alt={it.product?.name || 'Product'} className="w-12 h-14 object-cover" referrerPolicy="no-referrer" />
                      <div className="flex-1 min-w-0">
                        <h4 className="font-medium text-neutral-900 truncate">{it.product?.name}</h4>
                        <p className="text-[10px] text-neutral-500">{it.selectedSize} • Qty {it.quantity}</p>
                        <span className="font-mono font-semibold text-neutral-800">
                          ₹{((it.product?.price || 0) * it.quantity).toLocaleString('en-IN')}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="border-t border-neutral-300 pt-3 space-y-2.5 text-xs text-neutral-700">
                  <div className="flex justify-between">
                    <span>Subtotal</span>
                    <span className="font-mono">₹{subtotalINR.toLocaleString('en-IN')}</span>
                  </div>

                  {/* Line-item Explainable AI Discount */}
                  {effectiveDiscountPercent > 0 && (
                    <div className="space-y-1">
                      <div className="flex justify-between text-emerald-800 font-medium">
                        <span>Privilege VIP ({effectiveDiscountPercent}%)</span>
                        <span className="font-mono">-₹{discountINR.toLocaleString('en-IN')}</span>
                      </div>
                      <div className="p-2 bg-[#f4f7f4] border border-emerald-200/80 rounded-lg text-[10px] space-y-0.5">
                        <div className="flex items-center gap-1 font-semibold text-emerald-900">
                          <Sparkles className="w-3 h-3 text-emerald-600 shrink-0" />
                          <span>Rule Explainability: AI Privilege VIP Synergy</span>
                        </div>
                        <p className="text-emerald-800 leading-snug font-light">
                          {isDiscountBounded 
                            ? `Applied for VIP cart tier. Bounded by merchant guardrail ceiling (Clamped to ${guardrailPolicy?.maxDiscountPercent}% vs proposed ${rawDiscountPercent}%).`
                            : `Automatically granted for orders qualifying under active atelier growth campaigns or VIP acquisition tier.`}
                        </p>
                      </div>
                    </div>
                  )}

                  {/* Line-item Explainable Logistics / White Glove Courier */}
                  <div className="space-y-1">
                    <div className="flex justify-between items-center">
                      <span>White-Glove Atelier Courier</span>
                      <span className="font-mono text-emerald-800 font-semibold uppercase text-[10px] tracking-wider">
                        Complimentary (₹0)
                      </span>
                    </div>
                    <div className="p-2 bg-neutral-100/80 border border-neutral-200/80 rounded-lg text-[10px] space-y-0.5">
                      <div className="flex items-center gap-1 font-semibold text-neutral-800">
                        <Truck className="w-3 h-3 text-[#a83900] shrink-0" />
                        <span>Rule Explainability: Logistics Fee Waiver</span>
                      </div>
                      <p className="text-neutral-600 leading-snug font-light">
                        Haute couture courier fee (₹2,500) automatically waived by rule for orders meeting luxury threshold (&gt; ₹10,000).
                      </p>
                    </div>
                  </div>

                  {/* Line-item Keepsake Packaging */}
                  {giftPackaging && (
                    <div className="space-y-1">
                      <div className="flex justify-between items-center text-neutral-800">
                        <span>Signature Keepsake Archival Box</span>
                        <span className="font-mono text-emerald-800 text-[10px] font-semibold">Included (₹0)</span>
                      </div>
                      <div className="p-2 bg-neutral-100/80 border border-neutral-200/80 rounded-lg text-[10px] space-y-0.5">
                        <div className="flex items-center gap-1 font-semibold text-neutral-800">
                          <Package className="w-3 h-3 text-[#a83900] shrink-0" />
                          <span>Rule Explainability: Archival Preservation</span>
                        </div>
                        <p className="text-neutral-600 leading-snug font-light">
                          Silk-touch archival wrapping and humidity seal assigned automatically for delicate garments.
                        </p>
                      </div>
                    </div>
                  )}

                  {/* Total Amount & Policy Bound Status */}
                  <div className="border-t border-neutral-300 pt-2 space-y-1.5">
                    <div className="flex justify-between text-sm font-semibold text-neutral-900">
                      <span>Total Amount</span>
                      <span className="font-mono text-base">₹{totalINR.toLocaleString('en-IN')}</span>
                    </div>
                    <div className="flex items-center justify-between text-[10px] text-neutral-500 pt-0.5">
                      <span className="flex items-center gap-1">
                        <ShieldCheck className="w-3 h-3 text-emerald-600" />
                        <span>Policy Cap: ₹{guardrailPolicy?.maxSpendCapINR.toLocaleString('en-IN')}</span>
                      </span>
                      <span className={totalINR <= (guardrailPolicy?.maxSpendCapINR || 50000) ? "text-emerald-700 font-semibold" : "text-amber-700 font-semibold"}>
                        {totalINR <= (guardrailPolicy?.maxSpendCapINR || 50000) ? "✓ Within Safe Bounds" : "⚠ Exceeds Cap — Gating Enforced"}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

            </div>
          ) : (
            /* Confirmation Screen */
            <div className="p-8 sm:p-12 text-center space-y-6 max-w-2xl mx-auto animate-fade-in">
              <div className="w-16 h-16 bg-[#121212] text-white rounded-full flex items-center justify-center mx-auto">
                <CheckCircle className="w-8 h-8 text-[#D9531E]" />
              </div>

              <div>
                <span className="text-[10px] uppercase tracking-[0.3em] font-semibold text-[#D9531E] block mb-1">
                  Order Confirmed & Verified
                </span>
                <h2 className="font-serif text-3xl sm:text-4xl font-light text-[#121212]">
                  Thank you, {formData.firstName}
                </h2>
              </div>

              <p className="text-xs text-neutral-600 font-light leading-relaxed max-w-md mx-auto">
                Your haute couture ensemble is being hand-inspected, wrapped in our signature ivory satin ribbon, and assigned to a private white-glove courier.
              </p>

              <div className="p-4 bg-white border border-neutral-200 space-y-2 text-xs text-left max-w-md mx-auto">
                <div className="flex justify-between">
                  <span className="text-neutral-500 uppercase text-[10px] tracking-wider">Tracking Reference</span>
                  <span className="font-mono font-bold text-neutral-900">{orderTrackingId}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-neutral-500 uppercase text-[10px] tracking-wider">Payment Method</span>
                  <span className="font-medium text-neutral-800">{formData.paymentMethod === 'razorpay' ? 'Razorpay Test Gateway (₹ Verified)' : formData.paymentMethod === 'ai-agent' ? 'Autonomous AI Buyer' : 'Private Card'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-neutral-500 uppercase text-[10px] tracking-wider">Delivery Destination</span>
                  <span className="font-medium text-neutral-800">{formData.address}, {formData.city}</span>
                </div>
              </div>

              <div className="pt-4 flex justify-center space-x-3">
                <button
                  id="close-confirmation-btn"
                  onClick={handleCloseModal}
                  className="px-6 py-3 bg-[#121212] hover:bg-[#D9531E] text-white text-xs uppercase tracking-widest font-medium transition-colors cursor-pointer"
                >
                  Return to Atelier
                </button>
              </div>
            </div>
          )}

        </motion.div>
      </motion.div>

      {/* RAZORPAY TEST MODAL */}
      <RazorpayModal
        isOpen={isRazorpayOpen}
        onClose={() => setIsRazorpayOpen(false)}
        items={items}
        currency={currency}
        discountPercent={discountPercent}
        giftPackaging={giftPackaging}
        buyerDetails={{
          name: `${formData.firstName} ${formData.lastName}`,
          email: formData.email,
          phone: formData.phone,
          address: `${formData.address}, ${formData.city}`
        }}
        onOrderSuccess={handleRazorpaySuccess}
        onPaymentFailed={(reason) => {
          setIsRazorpayOpen(false);
          setStep('payment');
          setRazorpayFailure({
            isOpen: true,
            reason: reason || 'Card authorization declined by issuer or insufficient balance.',
            errorCode: 'GATEWAY_DECLINE',
            source: 'Razorpay Test Simulator'
          });
        }}
      />

      {/* GRACEFUL FAILURE 1: PRICE CHANGE MODAL */}
      {items.length > 0 && (
        <PriceChangeModal
          isOpen={isPriceModalOpen}
          item={items[0]}
          oldPriceUSD={items[0].product.price}
          newPriceUSD={items[0].product.price + 180}
          currency={currency}
          onApprove={() => {
            setApprovedPriceOverride(true);
            setIsPriceModalOpen(false);
            setStep('payment');
          }}
          onRejectRemove={() => {
            setIsPriceModalOpen(false);
          }}
        />
      )}

      {/* GRACEFUL FAILURE 2: OUT OF STOCK MODAL */}
      {items.length > 0 && (
        <OutOfStockModal
          isOpen={isStockModalOpen}
          outOfStockItem={items[0]}
          alternativeProduct={catalog.find(p => p.id !== items[0].product.id)}
          currency={currency}
          onReplaceAlternative={(alt) => {
            setIsStockModalOpen(false);
            setStep('payment');
          }}
          onRemoveAndPreserveRemaining={() => {
            setIsStockModalOpen(false);
          }}
        />
      )}
    </>
  );
};

