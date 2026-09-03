import React from 'react';
import { 
  X, 
  AlertTriangle, 
  AlertOctagon, 
  RefreshCw, 
  CreditCard, 
  Bot, 
  ShieldCheck, 
  Lock, 
  CheckCircle2, 
  ArrowRight,
  Receipt,
  HelpCircle,
  Clock
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { useAudit } from '../context/AuditContext';

export interface PaymentFailureDetails {
  isOpen?: boolean;
  reason?: string;
  errorCode?: string;
  paymentId?: string;
  source?: string;
  step?: string;
}

export interface PaymentFailureModalProps {
  isOpen: boolean;
  onClose: () => void;
  onRetryRazorpay: () => void;
  onSwitchToCard: () => void;
  onSwitchToAiAgent: () => void;
  failureDetails?: PaymentFailureDetails | null;
  totalINR: number;
  itemCount: number;
  orderNumber?: string;
}

export const PaymentFailureModal: React.FC<PaymentFailureModalProps> = ({
  isOpen,
  onClose,
  onRetryRazorpay,
  onSwitchToCard,
  onSwitchToAiAgent,
  failureDetails,
  totalINR,
  itemCount,
  orderNumber,
}) => {
  const { addLog } = useAudit();

  // Totally disabled as requested: errors now render inline on LUXORA Private Concierge Checkout page
  return null;

  const errorMessage = 
    failureDetails?.reason || 
    'The payment transaction could not be authorized by your bank or the gateway timed out.';
  const errorCode = failureDetails?.errorCode || 'GATEWAY_DECLINE';
  const paymentSource = failureDetails?.source || 'Razorpay Gateway';

  const handleRetry = () => {
    addLog(
      'RAZORPAY',
      'Buyer Initiated Payment Retry',
      'Re-attempting authorization on Razorpay gateway with preserved cart.',
      'info'
    );
    onRetryRazorpay();
  };

  const handleCardFallback = () => {
    addLog(
      'PAYMENT_FALLBACK',
      'Switched to Luxury Vault Card Payment',
      'Buyer switched away from failed Razorpay session to direct card payment.',
      'info'
    );
    onSwitchToCard();
  };

  const handleAiFallback = () => {
    addLog(
      'AGENT_DISPATCH',
      'Delegated Recovery to Autonomous Concierge',
      'Buyer selected LUXORA Autonomous Agent to complete settlement with bounded guardrails.',
      'info'
    );
    onSwitchToAiAgent();
  };

  return (
    <AnimatePresence>
      <div 
        id="payment-failure-modal-overlay" 
        className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 overflow-y-auto"
      >
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="fixed inset-0 bg-neutral-950/70 backdrop-blur-sm"
        />

        {/* Modal Window */}
        <motion.div
          id="payment-failure-dialog"
          role="dialog"
          aria-modal="true"
          aria-labelledby="payment-failure-title"
          initial={{ opacity: 0, scale: 0.96, y: 16 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.96, y: 16 }}
          transition={{ duration: 0.22, ease: 'easeOut' }}
          className="relative w-full max-w-lg bg-white rounded-2xl shadow-2xl border border-rose-200/80 overflow-hidden z-10 my-8"
        >
          {/* Top Decorative Amber/Rose Accent Bar */}
          <div className="h-1.5 w-full bg-gradient-to-r from-rose-500 via-amber-500 to-rose-600" />

          {/* Header */}
          <div className="p-6 sm:p-7 border-b border-neutral-100">
            <div className="flex items-start justify-between">
              <div className="flex items-start space-x-3.5">
                <div 
                  id="failure-icon-badge"
                  className="w-12 h-12 rounded-xl bg-rose-50 border border-rose-200 text-rose-600 flex items-center justify-center flex-shrink-0 shadow-xs"
                >
                  <AlertOctagon className="w-6 h-6" />
                </div>
                <div>
                  <div className="flex items-center space-x-2">
                    <span className="text-[10px] font-mono uppercase tracking-widest text-rose-700 font-semibold px-2 py-0.5 rounded-full bg-rose-50 border border-rose-100">
                      Payment Interrupted
                    </span>
                    <span className="text-[10px] font-mono text-neutral-400">
                      {errorCode}
                    </span>
                  </div>
                  <h2 
                    id="payment-failure-title"
                    className="text-xl font-serif font-semibold text-neutral-900 mt-1 tracking-tight"
                  >
                    Authorization Unsuccessful
                  </h2>
                </div>
              </div>
              <button
                id="close-failure-modal-btn"
                type="button"
                onClick={onClose}
                className="text-neutral-400 hover:text-neutral-700 p-1.5 rounded-lg hover:bg-neutral-100 transition-colors"
                aria-label="Close dialog"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Reassurance Banner */}
            <div 
              id="zero-debit-reassurance-box"
              className="mt-4 p-3.5 rounded-xl bg-emerald-50/90 border border-emerald-200/90 flex items-start space-x-2.5"
            >
              <CheckCircle2 className="w-4 h-4 text-emerald-700 flex-shrink-0 mt-0.5" />
              <div className="text-xs">
                <p className="font-semibold text-emerald-900">
                  Zero Funds Debited • Bag 100% Preserved
                </p>
                <p className="text-emerald-700 font-light mt-0.5">
                  No charge was made to your account. All {itemCount} reserved atelier piece{itemCount !== 1 ? 's' : ''} remain securely held in your shopping bag.
                </p>
              </div>
            </div>
          </div>

          {/* Body Content */}
          <div className="p-6 sm:p-7 space-y-5">
            {/* Error Detail Card */}
            <div 
              id="failure-details-card"
              className="p-4 rounded-xl bg-neutral-50 border border-neutral-200 space-y-3"
            >
              <div className="flex justify-between items-center text-xs">
                <span className="text-neutral-500 font-medium">Gateway Reason:</span>
                <span className="text-neutral-600 font-mono text-[11px]">{paymentSource}</span>
              </div>
              <p className="text-xs text-neutral-800 leading-relaxed font-mono bg-white p-2.5 rounded-lg border border-neutral-200/80">
                {errorMessage}
              </p>
              
              <div className="pt-2 border-t border-neutral-200/70 grid grid-cols-2 gap-3 text-xs">
                <div>
                  <span className="text-neutral-500 block text-[11px]">Hold Amount</span>
                  <span className="font-mono font-semibold text-neutral-900 text-sm">
                    ₹{totalINR.toLocaleString('en-IN')}
                  </span>
                </div>
                {orderNumber && (
                  <div>
                    <span className="text-neutral-500 block text-[11px]">Reference ID</span>
                    <span className="font-mono text-neutral-700 text-xs truncate block">
                      {orderNumber}
                    </span>
                  </div>
                )}
              </div>
            </div>

            {/* Recovery Options Label */}
            <div>
              <p className="text-xs font-semibold uppercase tracking-wider text-neutral-500 font-mono mb-2.5">
                Select a Recovery Path
              </p>

              <div className="space-y-2.5">
                {/* Option 1: Retry Razorpay */}
                <button
                  id="retry-razorpay-btn"
                  type="button"
                  onClick={handleRetry}
                  className="w-full group p-3.5 rounded-xl border border-neutral-300 hover:border-neutral-900 bg-white hover:bg-neutral-50 transition-all flex items-center justify-between text-left shadow-xs"
                >
                  <div className="flex items-center space-x-3">
                    <div className="w-9 h-9 rounded-lg bg-neutral-100 group-hover:bg-neutral-900 group-hover:text-white text-neutral-700 flex items-center justify-center transition-colors">
                      <RefreshCw className="w-4 h-4" />
                    </div>
                    <div>
                      <p className="text-xs font-semibold text-neutral-900">
                        Retry with Razorpay Gateway
                      </p>
                      <p className="text-[11px] text-neutral-500 font-light">
                        Try UPI (GPay/PhonePe), Netbanking, or another card
                      </p>
                    </div>
                  </div>
                  <ArrowRight className="w-4 h-4 text-neutral-400 group-hover:text-neutral-900 transition-transform group-hover:translate-x-0.5" />
                </button>

                {/* Option 2: Fallback to Direct Card */}
                <button
                  id="switch-to-card-btn"
                  type="button"
                  onClick={handleCardFallback}
                  className="w-full group p-3.5 rounded-xl border border-neutral-300 hover:border-neutral-900 bg-white hover:bg-neutral-50 transition-all flex items-center justify-between text-left shadow-xs"
                >
                  <div className="flex items-center space-x-3">
                    <div className="w-9 h-9 rounded-lg bg-neutral-100 group-hover:bg-neutral-900 group-hover:text-white text-neutral-700 flex items-center justify-center transition-colors">
                      <CreditCard className="w-4 h-4" />
                    </div>
                    <div>
                      <p className="text-xs font-semibold text-neutral-900">
                        Switch to Direct Card Settlement
                      </p>
                      <p className="text-[11px] text-neutral-500 font-light">
                        Use encrypted LUXORA Luxury Vault card processing
                      </p>
                    </div>
                  </div>
                  <ArrowRight className="w-4 h-4 text-neutral-400 group-hover:text-neutral-900 transition-transform group-hover:translate-x-0.5" />
                </button>

                {/* Option 3: Autonomous Concierge Agent */}
                <button
                  id="switch-to-ai-agent-btn"
                  type="button"
                  onClick={handleAiFallback}
                  className="w-full group p-3.5 rounded-xl border border-amber-300 bg-gradient-to-r from-amber-50/60 via-amber-50/30 to-amber-100/40 hover:from-amber-100/70 hover:to-amber-100/90 transition-all flex items-center justify-between text-left shadow-xs"
                >
                  <div className="flex items-center space-x-3">
                    <div className="w-9 h-9 rounded-lg bg-amber-900 text-amber-100 flex items-center justify-center">
                      <Bot className="w-4 h-4" />
                    </div>
                    <div>
                      <div className="flex items-center space-x-1.5">
                        <p className="text-xs font-semibold text-neutral-900">
                          Hand Over to Autonomous Concierge
                        </p>
                        <span className="text-[9px] font-mono uppercase bg-amber-200 text-amber-900 px-1.5 py-0.2 rounded font-bold">
                          AI Agent
                        </span>
                      </div>
                      <p className="text-[11px] text-neutral-600 font-light">
                        Guided 3-gate bounded sign-off with spending limit safety
                      </p>
                    </div>
                  </div>
                  <ArrowRight className="w-4 h-4 text-amber-800 transition-transform group-hover:translate-x-0.5" />
                </button>
              </div>
            </div>
          </div>

          {/* Footer & Security Note */}
          <div className="p-5 bg-neutral-50 border-t border-neutral-100 flex items-center justify-between">
            <div className="flex items-center space-x-2 text-[11px] text-neutral-500">
              <ShieldCheck className="w-4 h-4 text-neutral-400" />
              <span>TLS 1.3 256-bit Encrypted • Audit Trail Synced</span>
            </div>
            <button
              id="dismiss-failure-modal-btn"
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-lg text-xs font-medium text-neutral-600 hover:text-neutral-900 hover:bg-neutral-200/60 transition-colors"
            >
              Return to Bag
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
