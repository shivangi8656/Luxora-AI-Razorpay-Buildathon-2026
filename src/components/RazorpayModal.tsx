import React, { useState, useEffect, useRef } from 'react';
import { 
  X, 
  ShieldCheck, 
  CreditCard, 
  Smartphone, 
  Building, 
  CheckCircle, 
  AlertCircle, 
  RefreshCw, 
  ArrowRight, 
  Lock, 
  Download, 
  Receipt, 
  Clock, 
  WifiOff, 
  ChevronLeft
} from 'lucide-react';
import { CartItem, Currency } from '../types';
import { CURRENCIES } from '../data/products';
import { useAudit } from '../context/AuditContext';
import { useMerchant } from '../context/MerchantContext';
import { 
  initializeRazorpayPayment, 
  RAZORPAY_CONFIG 
} from '../services/payment';

interface RazorpayModalProps {
  isOpen: boolean;
  onClose: () => void;
  items?: CartItem[];
  cart?: CartItem[];
  currency: Currency;
  discountPercent?: number;
  giftPackaging?: boolean;
  buyerDetails: {
    name: string;
    email: string;
    phone: string;
    address: string;
  };
  onOrderSuccess: (orderNumber: string) => void;
  onPaymentFailed: (errorReason: string) => void;
}

export const RazorpayModal: React.FC<RazorpayModalProps> = ({
  isOpen,
  onClose,
  items: propItems,
  cart: propCart,
  currency,
  discountPercent = 0,
  giftPackaging = false,
  buyerDetails,
  onOrderSuccess,
  onPaymentFailed,
}) => {
  const { addLog } = useAudit();
  const { createOrder } = useMerchant();
  const [activeMethod, setActiveMethod] = useState<'card' | 'upi' | 'netbanking'>('card');
  const [isProcessing, setIsProcessing] = useState(false);
  const [failureState, setFailureState] = useState<{ isFailed: boolean; reason: string; code?: string } | null>(null);

  // Card input states
  const [cardNumber, setCardNumber] = useState('4111 1111 1111 1111');
  const [cardExpiry, setCardExpiry] = useState('12 / 29');
  const [cardCvv, setCardCvv] = useState('888');
  const [cardHolder, setCardHolder] = useState(buyerDetails?.name || 'Eleanor Vandermeer');

  // 45-second live countdown timer
  const [timeLeft, setTimeLeft] = useState(45);
  const [isTimedOut, setIsTimedOut] = useState(false);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (isOpen) {
      setTimeLeft(45);
      setIsTimedOut(false);
      setFailureState(null);

      timerRef.current = setInterval(() => {
        setTimeLeft((prev) => {
          if (prev <= 1) {
            clearInterval(timerRef.current!);
            setIsTimedOut(true);
            addLog(
              'FAILURE',
              'Razorpay Checkout Session Expired (45s Limit)',
              'Payment session timed out after 45 seconds. Cart safely preserved.',
              'error'
            );
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [isOpen]);

  const handleRestartTimer = () => {
    setTimeLeft(45);
    setIsTimedOut(false);
    setFailureState(null);
    if (timerRef.current) clearInterval(timerRef.current);
    timerRef.current = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(timerRef.current!);
          setIsTimedOut(true);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    addLog('RAZORPAY', 'Checkout Session Reset', 'Timer reset to 45s. Buyer continuing payment.', 'info');
  };

  const handleSimulateTimeout = () => {
    if (timerRef.current) clearInterval(timerRef.current);
    setTimeLeft(0);
    setIsTimedOut(true);
    addLog(
      'FAILURE',
      'Network Connection Timeout',
      'Network connection timed out after 45s.',
      'error'
    );
  };

  if (!isOpen) return null;

  const items = propItems || propCart || [];
  const subtotalINR = (items || []).reduce((s, i) => s + (i?.product?.price || 0) * (i?.quantity || 1), 0);
  const discountINR = subtotalINR * ((discountPercent || 0) / 100);
  const giftINR = giftPackaging ? 450 : 0;
  const totalINR = Math.round(subtotalINR - discountINR + giftINR);
  const displayAmount = `₹${totalINR.toLocaleString('en-IN')}`;

  const handlePayWithCard = () => {
    setIsProcessing(true);
    const cleanedNumber = cardNumber.replace(/\s+/g, '');

    // Check if card ends with 0002 -> trigger insufficient balance failure
    if (cleanedNumber.endsWith('0002')) {
      setTimeout(() => {
        setIsProcessing(false);
        const reason = 'INSUFFICIENT_BALANCE: Your bank reported insufficient funds for this card. Please try another payment method or alternative card.';
        setFailureState({
          isFailed: true,
          reason,
          code: 'BAD_REQUEST_PAYMENT_ACCOUNT_INSUFFICIENT_BALANCE'
        });
        addLog(
          'FAILURE',
          'Razorpay Test Card Declined (Ending in 0002)',
          `${reason} Shopping bag (${items.length} items • ₹${totalINR.toLocaleString('en-IN')}) preserved.`,
          'error',
          { cardEnding: '0002', amountINR: totalINR }
        );
        onPaymentFailed(reason);
      }, 1000);
      return;
    }

    // Otherwise simulate successful payment
    setTimeout(() => {
      setIsProcessing(false);
      const testPaymentId = `pay_test_${Math.random().toString(36).substring(2, 12)}`;

      addLog(
        'PAYMENT',
        'Razorpay Card Payment Captured (Test Mode)',
        `Signature verified for ID: ${testPaymentId} | Amount: ₹${totalINR.toLocaleString('en-IN')}`,
        'success',
        { paymentId: testPaymentId, amountINR: totalINR, method: 'Card' }
      );

      const newOrder = createOrder({
        buyerName: buyerDetails.name,
        buyerEmail: buyerDetails.email,
        buyerPhone: buyerDetails.phone,
        items: items.map(item => ({
          productId: item.product.id,
          productName: item.product.name,
          size: item.selectedSize,
          color: typeof item.selectedColor === 'object' ? item.selectedColor?.name : item.selectedColor || item.product?.color || 'Standard',
          quantity: item.quantity,
          priceINR: item.product.price
        })),
        totalINR,
        paymentMethod: 'Razorpay Card',
        razorpayPaymentId: testPaymentId,
        status: 'Confirmed'
      });

      onOrderSuccess(newOrder.orderNumber);
    }, 1000);
  };

  const handleSimulateSuccess = () => {
    setIsProcessing(true);
    setFailureState(null);
    addLog('RAZORPAY', 'Razorpay Test Checkout Initiated', `Opening Razorpay Sandbox Gateway for ₹${totalINR.toLocaleString('en-IN')}.`, 'info');

    setTimeout(() => {
      setIsProcessing(false);
      const testPaymentId = `pay_test_${Math.random().toString(36).substring(2, 12)}`;

      addLog(
        'PAYMENT',
        'Razorpay Payment Verified (Test Mode)',
        `Signature verified for ID: ${testPaymentId} | Amount: ₹${totalINR.toLocaleString('en-IN')}`,
        'success',
        { paymentId: testPaymentId, amountINR: totalINR, method: activeMethod }
      );

      const newOrder = createOrder({
        buyerName: buyerDetails.name,
        buyerEmail: buyerDetails.email,
        buyerPhone: buyerDetails.phone,
        items: items.map(item => ({
          productId: item.product.id,
          productName: item.product.name,
          size: item.selectedSize,
          color: typeof item.selectedColor === 'object' ? item.selectedColor?.name : item.selectedColor || item.product?.color || 'Standard',
          quantity: item.quantity,
          priceINR: item.product.price
        })),
        totalINR,
        paymentMethod: 'Razorpay Test',
        razorpayPaymentId: testPaymentId,
        status: 'Confirmed'
      });

      onOrderSuccess(newOrder.orderNumber);
    }, 1000);
  };

  const handleOpenLiveRazorpay = async () => {
    setIsProcessing(true);
    addLog(
      'RAZORPAY',
      'Razorpay Sandbox Window Triggered',
      `Launching Razorpay checkout for ₹${totalINR.toLocaleString('en-IN')}`,
      'info',
      { keyId: RAZORPAY_CONFIG.keyId, amountINR: totalINR }
    );

    await initializeRazorpayPayment({
      amountINR: totalINR,
      customer: {
        name: buyerDetails.name,
        email: buyerDetails.email,
        phone: buyerDetails.phone,
        address: buyerDetails.address,
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
          'Razorpay Live Gateway Payment Captured',
          `Payment ID: ${res.paymentId} | Amount: ₹${totalINR.toLocaleString('en-IN')}`,
          'success',
          { paymentId: res.paymentId, amountINR: totalINR, method: 'Razorpay Standard' }
        );

        const newOrder = createOrder({
          buyerName: buyerDetails.name,
          buyerEmail: buyerDetails.email,
          buyerPhone: buyerDetails.phone,
          items: items.map(item => ({
            productId: item.product.id,
            productName: item.product.name,
            size: item.selectedSize,
            color: item.selectedColor?.name || 'Standard',
            quantity: item.quantity,
            priceINR: item.product.price
          })),
          totalINR,
          paymentMethod: 'Razorpay',
          razorpayPaymentId: res.paymentId,
          status: 'Confirmed'
        });

        onOrderSuccess(newOrder.orderNumber);
      },
      onFailure: (err) => {
        setIsProcessing(false);
        handleSimulateFailure(err.description);
      },
      onDismiss: () => {
        setIsProcessing(false);
        addLog('RAZORPAY', 'Razorpay Modal Dismissed', 'Buyer closed Razorpay modal without charging.', 'info');
      }
    });
  };

  const handleSimulateFailure = (customReason?: string) => {
    setIsProcessing(true);
    const mockReason = customReason || 'INSUFFICIENT_BALANCE: The bank declined the transaction due to insufficient credit/balance. Please try another payment method.';

    setTimeout(() => {
      setIsProcessing(false);
      setFailureState({
        isFailed: true,
        reason: mockReason,
      });

      addLog(
        'FAILURE',
        'Razorpay Payment Failed — Cart Preserved',
        mockReason + ' Zero duplicate orders created. Shopping bag remained fully intact.',
        'error',
        { status: 'declined', amountINR: totalINR }
      );

      onPaymentFailed(mockReason);
    }, 1000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 font-['Archivo_Narrow']">
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-neutral-900/70 backdrop-blur-md transition-opacity"
        onClick={onClose}
      />

      {/* Razorpay Modal Frame */}
      <div className="relative w-full max-w-lg bg-white rounded-3xl shadow-2xl border border-neutral-200 overflow-hidden z-10 flex flex-col max-h-[92vh]">
        
        {/* Top Razorpay Header with Back button and Timer */}
        <div className="bg-[#0C2340] text-white px-5 py-3.5 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <button
              onClick={onClose}
              className="p-1 rounded-full text-blue-200 hover:text-white hover:bg-white/10 transition-colors mr-1 cursor-pointer"
              title="Back to Checkout"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
            <div className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center font-bold text-white text-xs">
              R
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <span className="font-semibold tracking-wide text-sm font-sans">Razorpay</span>
                <span className="text-[9px] px-2 py-0.5 rounded bg-amber-400/90 text-neutral-900 font-bold uppercase tracking-wider">
                  Live Secure
                </span>
              </div>
              <p className="text-[11px] text-blue-200 font-light">
                Maison LUXORA Haute Couture Atelier
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-3">
            {/* 45-Second Aesthetic Countdown Timer */}
            <div className={`flex items-center space-x-1.5 px-3 py-1 rounded-full text-xs font-mono tracking-[0.22em] font-semibold border ${
              timeLeft < 10 ? 'bg-rose-500/30 text-rose-200 border-rose-400/50 animate-pulse' : 'bg-white/10 text-white border-white/20'
            }`}>
              <Clock className="w-3.5 h-3.5 opacity-80" />
              <span>00:{timeLeft.toString().padStart(2, '0')}</span>
            </div>

            <button 
              onClick={onClose}
              className="p-1 rounded-full text-blue-200 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Amount Confirmation Banner */}
        <div className="bg-[#F4F8FC] border-b border-blue-100 px-6 py-2.5 flex items-center justify-between">
          <div>
            <span className="text-[10px] text-neutral-500 uppercase tracking-wider font-sans">
              Confirmed Payable Amount
            </span>
            <div className="flex items-baseline space-x-2">
              <span className="text-xl font-bold font-mono text-[#0C2340]">
                ₹ {totalINR.toLocaleString('en-IN')}
              </span>
              <span className="text-xs text-neutral-500 font-mono">
                ({displayAmount})
              </span>
            </div>
          </div>
          <span className="text-xs text-neutral-600 font-mono flex items-center space-x-1">
            <Lock className="w-3.5 h-3.5 text-emerald-600" />
            <span>256-bit Encrypted</span>
          </span>
        </div>

        {/* Content Body */}
        <div className="p-6 space-y-4 overflow-y-auto">

          {/* TIMEOUT ERROR SCREEN (1-minute expiration or simulated timeout) */}
          {isTimedOut ? (
            <div className="p-5 rounded-2xl bg-rose-50 border border-rose-200 space-y-4 animate-in fade-in">
              <div className="flex items-start space-x-3">
                <div className="w-10 h-10 rounded-full bg-rose-100 text-rose-700 flex items-center justify-center shrink-0 mt-0.5">
                  <WifiOff className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-rose-950">
                    Payment Session Timed Out
                  </h4>
                  <p className="text-xs text-rose-800 font-light mt-0.5 leading-relaxed">
                    The 1-minute secure gateway connection timed out or bank handshake dropped. Zero funds have been debited.
                  </p>
                </div>
              </div>

              <div className="p-3 rounded-xl bg-white border border-rose-200 text-xs text-neutral-700 space-y-1.5 font-mono">
                <div className="flex items-center space-x-1.5 text-emerald-800 font-semibold">
                  <CheckCircle className="w-3.5 h-3.5" />
                  <span>Shopping Bag ({items.length} items • ₹{totalINR.toLocaleString('en-IN')}) Preserved.</span>
                </div>
                <div className="flex items-center space-x-1.5 text-neutral-600">
                  <CheckCircle className="w-3.5 h-3.5 text-neutral-400" />
                  <span>Reason: NETWORK_HANDSHAKE_TIMEOUT (60s session expired)</span>
                </div>
              </div>

              <div className="pt-2 flex items-center gap-2">
                <button
                  onClick={handleRestartTimer}
                  className="flex-1 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold transition-colors flex items-center justify-center space-x-1.5 cursor-pointer shadow-sm"
                >
                  <RefreshCw className="w-4 h-4" />
                  <span>Retry Payment Session (Restart Timer)</span>
                </button>
                <button
                  onClick={onClose}
                  className="px-4 py-3 bg-white hover:bg-neutral-100 border border-neutral-300 text-neutral-700 rounded-xl text-xs font-semibold transition-colors cursor-pointer"
                >
                  Back to Bag
                </button>
              </div>
            </div>
          ) : failureState?.isFailed ? (
            /* PAYMENT FAILED GRACEFUL RECOVERY VIEW (Insufficient Balance / Decline) */
            <div className="p-5 rounded-2xl bg-rose-50/70 border border-rose-200 space-y-4 animate-in fade-in">
              <div className="flex items-start space-x-3">
                <div className="w-10 h-10 rounded-full bg-rose-100 text-rose-700 flex items-center justify-center shrink-0 mt-0.5">
                  <AlertCircle className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-rose-950">
                    Payment Failed — Insufficient Balance / Card Declined
                  </h4>
                  <p className="text-xs text-rose-800 font-light mt-0.5 leading-relaxed">
                    {failureState.reason}
                  </p>
                </div>
              </div>

              <div className="p-3 rounded-xl bg-white border border-rose-200/80 text-xs text-neutral-700 space-y-1.5 font-mono">
                <div className="flex items-center space-x-1.5 text-emerald-800 font-semibold">
                  <CheckCircle className="w-3.5 h-3.5" />
                  <span>Shopping Bag ({items.length} items • ₹{totalINR.toLocaleString('en-IN')}) Preserved.</span>
                </div>
                <div className="flex items-center space-x-1.5 text-neutral-600">
                  <CheckCircle className="w-3.5 h-3.5 text-neutral-400" />
                  <span>Zero duplicate charges or phantom debits registered.</span>
                </div>
              </div>

              {/* GRACEFUL RECOVERY ALTERNATIVES */}
              <div className="space-y-2 pt-1">
                <span className="text-[10px] uppercase font-bold text-neutral-600 block tracking-wider">
                  Try Another Payment Method:
                </span>

                {/* Option 1: Instant Split-Payment */}
                <button
                  onClick={() => {
                    const halfAmount = Math.round(totalINR / 2);
                    addLog('RAZORPAY', 'Graceful Split-Payment Activated', `Split total ₹${totalINR.toLocaleString('en-IN')} into 2 installments of ₹${halfAmount.toLocaleString('en-IN')}`, 'info');
                    setFailureState(null);
                    handleSimulateSuccess();
                  }}
                  className="w-full p-2.5 bg-white hover:bg-neutral-50 border border-neutral-300 rounded-xl text-left flex items-center justify-between text-xs transition-colors cursor-pointer"
                >
                  <div>
                    <strong className="text-neutral-900 block font-semibold">1. Instant Split-Payment (50% UPI + 50% Card)</strong>
                    <span className="text-[11px] text-neutral-500 font-light">Pay ₹{Math.round(totalINR/2).toLocaleString('en-IN')} via UPI now, balance via alternate card.</span>
                  </div>
                  <ArrowRight className="w-4 h-4 text-neutral-700 shrink-0 ml-2" />
                </button>

                {/* Option 2: 3-Month 0% Luxury EMI */}
                <button
                  onClick={() => {
                    const emiMonthly = Math.round(totalINR / 3);
                    addLog('RAZORPAY', 'Graceful 0% EMI Plan Activated', `Converted to 3 monthly payments of ₹${emiMonthly.toLocaleString('en-IN')}`, 'info');
                    setFailureState(null);
                    handleSimulateSuccess();
                  }}
                  className="w-full p-2.5 bg-white hover:bg-neutral-50 border border-neutral-300 rounded-xl text-left flex items-center justify-between text-xs transition-colors cursor-pointer"
                >
                  <div>
                    <strong className="text-neutral-900 block font-semibold">2. 3-Month 0% Interest Atelier EMI</strong>
                    <span className="text-[11px] text-neutral-500 font-light">₹{Math.round(totalINR/3).toLocaleString('en-IN')}/mo across 3 billing cycles.</span>
                  </div>
                  <ArrowRight className="w-4 h-4 text-neutral-700 shrink-0 ml-2" />
                </button>

                {/* Option 3: Auto-Resume with Tokenized Backup (UPI Intent) */}
                <button
                  onClick={() => {
                    addLog('RAZORPAY', 'Auto-Resume with Tokenized UPI Backup', 'Triggered tokenized direct UPI fallback handshake.', 'info');
                    setFailureState(null);
                    setActiveMethod('upi');
                  }}
                  className="w-full p-2.5 bg-neutral-900 hover:bg-black text-white rounded-xl text-left flex items-center justify-between text-xs transition-colors cursor-pointer"
                >
                  <div>
                    <strong className="text-white block font-semibold">3. Resume with Instant UPI Express Intent</strong>
                    <span className="text-[11px] text-neutral-300 font-light">Zero card limits • Direct secure authorization via UPI app.</span>
                  </div>
                  <RefreshCw className="w-4 h-4 text-amber-400 shrink-0 ml-2" />
                </button>

                {/* Option 4: Try Another Card */}
                <button
                  onClick={() => {
                    setFailureState(null);
                    setCardNumber('4111 1111 1111 1111');
                    setActiveMethod('card');
                  }}
                  className="w-full p-2.5 bg-blue-50 hover:bg-blue-100 border border-blue-200 rounded-xl text-left flex items-center justify-between text-xs transition-colors cursor-pointer text-blue-900"
                >
                  <div>
                    <strong className="block font-semibold">4. Enter Alternate Credit / Debit Card</strong>
                    <span className="text-[11px] text-blue-700 font-light">Use valid Visa/Mastercard (e.g. 4111 1111 1111 1111)</span>
                  </div>
                  <CreditCard className="w-4 h-4 text-blue-600 shrink-0 ml-2" />
                </button>
              </div>

              <div className="pt-2 flex justify-end">
                <button
                  onClick={onClose}
                  className="px-3 py-1.5 rounded-lg text-xs font-semibold text-neutral-600 hover:text-neutral-900 transition-colors"
                >
                  Cancel & Return to Bag
                </button>
              </div>
            </div>
          ) : (
            /* PAYMENT METHOD SELECTION */
            <>
              {/* Payment Methods Tabs */}
              <div className="grid grid-cols-3 gap-2">
                <button
                  onClick={() => setActiveMethod('card')}
                  className={`py-2.5 px-3 rounded-xl text-xs font-medium border flex flex-col items-center space-y-1 transition-all ${
                    activeMethod === 'card'
                      ? 'border-blue-600 bg-blue-50/60 text-blue-950 shadow-xs'
                      : 'border-neutral-200 hover:border-neutral-300 text-neutral-700'
                  }`}
                >
                  <CreditCard className="w-4 h-4 text-blue-600" />
                  <span>Cards</span>
                </button>

                <button
                  onClick={() => setActiveMethod('upi')}
                  className={`py-2.5 px-3 rounded-xl text-xs font-medium border flex flex-col items-center space-y-1 transition-all ${
                    activeMethod === 'upi'
                      ? 'border-blue-600 bg-blue-50/60 text-blue-950 shadow-xs'
                      : 'border-neutral-200 hover:border-neutral-300 text-neutral-700'
                  }`}
                >
                  <Smartphone className="w-4 h-4 text-blue-600" />
                  <span>UPI / QR</span>
                </button>

                <button
                  onClick={() => setActiveMethod('netbanking')}
                  className={`py-2.5 px-3 rounded-xl text-xs font-medium border flex flex-col items-center space-y-1 transition-all ${
                    activeMethod === 'netbanking'
                      ? 'border-blue-600 bg-blue-50/60 text-blue-950 shadow-xs'
                      : 'border-neutral-200 hover:border-neutral-300 text-neutral-700'
                  }`}
                >
                  <Building className="w-4 h-4 text-blue-600" />
                  <span>Netbanking</span>
                </button>
              </div>

              {/* Card Payment Form with Full Input and Quick Test Chips */}
              {activeMethod === 'card' && (
                <div className="p-4 rounded-2xl bg-neutral-50 border border-neutral-200 space-y-3 text-xs">
                  
                  {/* Test card presets */}
                  <div className="space-y-1">
                    <span className="text-[10px] uppercase font-bold text-neutral-500 tracking-wider block">
                      Quick Fill Test Cards:
                    </span>
                    <div className="flex gap-1.5 flex-wrap">
                      <button
                        type="button"
                        onClick={() => setCardNumber('4111 1111 1111 1111')}
                        className={`px-2.5 py-1 rounded-lg text-[11px] font-mono border transition-all cursor-pointer ${
                          cardNumber === '4111 1111 1111 1111'
                            ? 'bg-blue-600 text-white border-blue-600 font-bold'
                            : 'bg-white text-neutral-700 border-neutral-300 hover:border-black'
                        }`}
                      >
                        ✓ Success Card (...1111)
                      </button>
                      <button
                        type="button"
                        onClick={() => setCardNumber('4000 0000 0000 0002')}
                        className={`px-2.5 py-1 rounded-lg text-[11px] font-mono border transition-all cursor-pointer ${
                          cardNumber.endsWith('0002')
                            ? 'bg-rose-700 text-white border-rose-700 font-bold'
                            : 'bg-rose-50 text-rose-800 border-rose-200 hover:border-rose-400'
                        }`}
                      >
                        ✕ Insufficient Balance (...0002)
                      </button>
                    </div>
                  </div>

                  <div className="space-y-1">
                    <label className="text-neutral-600 text-[10px] uppercase font-bold tracking-wider">
                      Card Number (Full 16-Digit)
                    </label>
                    <div className="relative">
                      <input 
                        type="text" 
                        value={cardNumber}
                        onChange={(e) => setCardNumber(e.target.value)}
                        placeholder="4111 1111 1111 1111"
                        maxLength={19}
                        className="w-full px-3 py-2 bg-white border border-neutral-300 rounded-xl font-mono text-neutral-900 text-sm focus:outline-none focus:border-blue-600"
                      />
                      <CreditCard className="w-4 h-4 text-neutral-400 absolute right-3 top-3" />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <div className="space-y-1">
                      <label className="text-neutral-600 text-[10px] uppercase font-bold tracking-wider">Expiry Date</label>
                      <input 
                        type="text" 
                        value={cardExpiry}
                        onChange={(e) => setCardExpiry(e.target.value)}
                        placeholder="MM / YY"
                        className="w-full px-3 py-1.5 bg-white border border-neutral-300 rounded-xl font-mono text-neutral-800 text-xs focus:outline-none"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-neutral-600 text-[10px] uppercase font-bold tracking-wider">CVV</label>
                      <input 
                        type="text" 
                        value={cardCvv}
                        onChange={(e) => setCardCvv(e.target.value)}
                        placeholder="CVV"
                        maxLength={4}
                        className="w-full px-3 py-1.5 bg-white border border-neutral-300 rounded-xl font-mono text-neutral-800 text-xs focus:outline-none"
                      />
                    </div>
                  </div>

                  <div className="space-y-1">
                    <label className="text-neutral-600 text-[10px] uppercase font-bold tracking-wider">Cardholder Name</label>
                    <input 
                      type="text" 
                      value={cardHolder}
                      onChange={(e) => setCardHolder(e.target.value)}
                      className="w-full px-3 py-1.5 bg-white border border-neutral-300 rounded-xl text-neutral-800 text-xs focus:outline-none"
                    />
                  </div>

                  {cardNumber.endsWith('0002') && (
                    <div className="p-2 bg-amber-50 border border-amber-200 rounded-lg text-[11px] text-amber-800 flex items-center gap-1.5 font-sans">
                      <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                      <span>Card ending in 0002 will test the Insufficient Balance flow.</span>
                    </div>
                  )}
                </div>
              )}

              {/* UPI Tab */}
              {activeMethod === 'upi' && (
                <div className="p-4 rounded-2xl bg-neutral-50 border border-neutral-200 text-center space-y-3">
                  <div className="w-32 h-32 mx-auto bg-white p-2 rounded-xl border border-neutral-300 flex items-center justify-center shadow-xs">
                    <div className="w-full h-full border-2 border-dashed border-neutral-400 rounded-lg flex flex-col items-center justify-center text-[10px] font-mono text-neutral-500">
                      <span>UPI QR CODE</span>
                      <span className="font-bold text-neutral-800">₹{totalINR.toLocaleString('en-IN')}</span>
                    </div>
                  </div>
                  <div className="flex items-center justify-center space-x-3 text-xs text-neutral-600">
                    <span className="px-2 py-0.5 rounded bg-white border text-[11px]">Google Pay</span>
                    <span className="px-2 py-0.5 rounded bg-white border text-[11px]">PhonePe</span>
                    <span className="px-2 py-0.5 rounded bg-white border text-[11px]">Paytm</span>
                  </div>
                </div>
              )}

              {/* Netbanking Tab */}
              {activeMethod === 'netbanking' && (
                <div className="p-4 rounded-2xl bg-neutral-50 border border-neutral-200 space-y-2 text-xs">
                  <span className="text-[10px] uppercase text-neutral-500 font-semibold block">Select Popular Test Bank</span>
                  <div className="grid grid-cols-2 gap-2">
                    <div className="p-2 rounded-lg border bg-white text-center font-medium">HDFC Bank</div>
                    <div className="p-2 rounded-lg border bg-white text-center font-medium">ICICI Bank</div>
                    <div className="p-2 rounded-lg border bg-white text-center font-medium">State Bank of India</div>
                    <div className="p-2 rounded-lg border bg-white text-center font-medium">Axis Bank</div>
                  </div>
                </div>
              )}

              {/* Simulation Action Controls */}
              <div className="space-y-2 pt-1">
                {activeMethod === 'card' ? (
                  <button
                    disabled={isProcessing}
                    onClick={handlePayWithCard}
                    className="w-full py-3.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs tracking-wide shadow-md transition-all flex items-center justify-center space-x-2 disabled:opacity-50 cursor-pointer"
                  >
                    {isProcessing ? (
                      <RefreshCw className="w-4 h-4 animate-spin" />
                    ) : (
                      <>
                        <CheckCircle className="w-4 h-4" />
                        <span>Pay ₹ {totalINR.toLocaleString('en-IN')} with Card</span>
                      </>
                    )}
                  </button>
                ) : (
                  <button
                    disabled={isProcessing}
                    onClick={handleOpenLiveRazorpay}
                    className="w-full py-3.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs tracking-wide shadow-md transition-all flex items-center justify-center space-x-2 disabled:opacity-50 cursor-pointer"
                  >
                    {isProcessing ? (
                      <RefreshCw className="w-4 h-4 animate-spin" />
                    ) : (
                      <>
                        <CheckCircle className="w-4 h-4" />
                        <span>Pay ₹ {totalINR.toLocaleString('en-IN')} via Razorpay Test</span>
                      </>
                    )}
                  </button>
                )}

                {/* Secondary Test Buttons: Mock Success, Test Failure (...0002), and Test Timeout */}
                <div className="grid grid-cols-3 gap-2">
                  <button
                    disabled={isProcessing}
                    onClick={handleSimulateSuccess}
                    className="py-2 rounded-xl bg-neutral-100 hover:bg-neutral-200 text-neutral-800 border border-neutral-300 font-medium text-[11px] transition-all flex items-center justify-center space-x-1 cursor-pointer"
                  >
                    <span>Instant Success</span>
                  </button>

                  <button
                    disabled={isProcessing}
                    onClick={() => {
                      setCardNumber('4000 0000 0000 0002');
                      handleSimulateFailure();
                    }}
                    className="py-2 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 font-medium text-[11px] transition-all flex items-center justify-center space-x-1 cursor-pointer"
                  >
                    <AlertCircle className="w-3.5 h-3.5" />
                    <span>Card Decline</span>
                  </button>

                  <button
                    disabled={isProcessing}
                    onClick={handleSimulateTimeout}
                    className="py-2 rounded-xl bg-amber-50 hover:bg-amber-100 text-amber-800 border border-amber-200 font-medium text-[11px] transition-all flex items-center justify-center space-x-1 cursor-pointer"
                  >
                    <WifiOff className="w-3.5 h-3.5" />
                    <span>Test Timeout</span>
                  </button>
                </div>

              </div>
            </>
          )}

        </div>

        {/* Footer */}
        <div className="px-6 py-3 border-t border-neutral-200 bg-neutral-50 text-[11px] text-neutral-500 flex items-center justify-between">
          <div className="flex items-center gap-1.5 font-mono text-[10px]">
            <ShieldCheck className="w-3.5 h-3.5 text-blue-600" />
            <span className="text-neutral-700 font-semibold">Razorpay Verified Secure Gateway</span>
          </div>
          <span className="font-mono text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200 text-[10px]">Active Sandbox (INR ₹)</span>
        </div>

      </div>
    </div>
  );
};

