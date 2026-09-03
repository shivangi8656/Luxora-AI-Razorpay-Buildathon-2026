import React, { useState } from 'react';
import { 
  X, 
  Bot, 
  Terminal, 
  ShieldCheck, 
  CheckCircle2, 
  AlertCircle, 
  Lock, 
  Sparkles, 
  DollarSign, 
  Sliders, 
  ArrowRight, 
  RefreshCw, 
  Copy, 
  Check, 
  Code, 
  Layers,
  ShoppingBag,
  ExternalLink,
  Key,
  Activity,
  WifiOff,
  AlertTriangle,
  RotateCcw,
  Zap
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { PRODUCTS } from '../data/products';
import { useAudit } from '../context/AuditContext';
import { useMerchant } from '../context/MerchantContext';

interface AgentBuyerTerminalModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const AgentBuyerTerminalModal: React.FC<AgentBuyerTerminalModalProps> = ({
  isOpen,
  onClose
}) => {
  const { addLog } = useAudit();
  const { createOrder } = useMerchant();

  const [selectedProductId, setSelectedProductId] = useState<string>('LX-WD-001');
  const [selectedSize, setSelectedSize] = useState<string>('FR 38');
  const [spendingCapINR, setSpendingCapINR] = useState<number>(35000);
  const [promoCode, setPromoCode] = useState<string>('VIPATELIER10');
  const [isHumanApproved, setIsHumanApproved] = useState<boolean>(true);
  const [gatingTokenInput, setGatingTokenInput] = useState<string>('GATE-AUTH-8829');
  
  // Connectivity Diagnostics state (categorized strictly under Connectivity Diagnostics)
  const [connectivityDiagnostic, setConnectivityDiagnostic] = useState<
    'NONE' | 'INSUFFICIENT_BALANCE' | 'STOCK_DEPLETION' | 'NETWORK_TIMEOUT' | 'GATED_CHALLENGE'
  >('NONE');

  const [isExecuting, setIsExecuting] = useState<boolean>(false);
  const [terminalResult, setTerminalResult] = useState<any>(null);
  const [activeTab, setActiveTab] = useState<'playground' | 'curl' | 'gates'>('playground');
  const [copiedCurl, setCopiedCurl] = useState<boolean>(false);

  if (!isOpen) return null;

  const currentProduct = PRODUCTS.find(p => p.id === selectedProductId) || PRODUCTS[0];
  const basePriceINR = currentProduct.price;
  const isEligibleDiscount = promoCode === 'VIPATELIER10' || promoCode === 'LUXORA10' || promoCode === 'ATELIER15';
  const discountPercent = promoCode === 'ATELIER15' ? 15 : (isEligibleDiscount ? 10 : 0);
  const discountAmountINR = Math.round((basePriceINR * discountPercent) / 100);
  const calculatedTotalINR = basePriceINR - discountAmountINR;
  const isOverBudget = calculatedTotalINR > spendingCapINR;

  const handleExecuteAgentTransaction = async (overrideDiagnostic?: string) => {
    const activeDiagnostic = overrideDiagnostic !== undefined ? overrideDiagnostic : connectivityDiagnostic;
    setIsExecuting(true);
    setTerminalResult(null);

    const diagnosticTag = activeDiagnostic !== 'NONE' ? ` [Diagnostic: ${activeDiagnostic}]` : '';

    addLog(
      activeDiagnostic !== 'NONE' ? 'FAILURE' : 'AI_SEARCH',
      `Autonomous Agent Transaction Handshake Initiated${diagnosticTag}`,
      `Agent "Gemini-Wardrobe-Buyer" targeting ${currentProduct.name} (Budget Cap: ₹${spendingCapINR.toLocaleString('en-IN')})`,
      activeDiagnostic !== 'NONE' ? 'warning' : 'info',
      { productId: currentProduct.id, capINR: spendingCapINR, connectivityDiagnostic: activeDiagnostic }
    );

    try {
      const payload: any = {
        agentId: 'gemini-autonomous-buyer-v2',
        agentName: 'Gemini Haute Couture Agent',
        buyerName: 'Lady Eleanor Vandermeer',
        buyerEmail: 'e.vandermeer@private.lux',
        items: [
          {
            productId: currentProduct.id,
            quantity: 1,
            size: selectedSize,
            color: currentProduct.color
          }
        ],
        maxBudgetINR: spendingCapINR,
        campaignPromoCode: promoCode,
        gatingToken: isHumanApproved ? gatingTokenInput : undefined,
        isApprovedByHuman: isHumanApproved
      };

      if (activeDiagnostic !== 'NONE') {
        payload.connectivityDiagnostic = activeDiagnostic;
      }

      const response = await fetch('/api/agent/transact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      const data = await response.json();
      setTerminalResult({
        httpStatus: response.status,
        diagnosticMode: activeDiagnostic !== 'NONE' ? activeDiagnostic : undefined,
        ...data
      });

      if (response.ok && data.success) {
        addLog(
          'ORDER',
          `Autonomous Purchase Executed • ${data.orderNumber}`,
          `Explainable total: ₹${data.explainablePricing?.authorizedPayableINR?.toLocaleString('en-IN')} | All 3 Gated checks passed.`,
          'success',
          { orderNumber: data.orderNumber, auditHash: data.auditHash, amountINR: calculatedTotalINR }
        );

        // Record order in merchant state
        createOrder({
          buyerName: 'Lady Eleanor Vandermeer (via Gemini AI Buyer)',
          buyerEmail: 'e.vandermeer@private.lux',
          buyerPhone: '+91 98200 12345',
          items: [
            {
              productId: currentProduct.id,
              productName: currentProduct.name,
              size: selectedSize,
              color: currentProduct.color,
              quantity: 1,
              priceINR: currentProduct.price
            }
          ],
          totalINR: data.explainablePricing?.authorizedPayableINR || calculatedTotalINR,
          paymentMethod: 'Autonomous Agent Token (Razorpay Sandbox)',
          razorpayPaymentId: `pay_agent_${data.transactionId?.slice(-6)}`,
          status: 'Confirmed'
        });
      } else {
        addLog(
          'FAILURE',
          `Autonomous Transaction Stopped • ${data.error || 'GATE_BLOCKED'}`,
          data.message || 'Spending bounds or gating requirement triggered.',
          'warning',
          { error: data.error, gate: data.gateFailed, diagnostic: activeDiagnostic }
        );
      }
    } catch (err: any) {
      setTerminalResult({
        httpStatus: 500,
        success: false,
        error: 'NETWORK_EXCEPTION',
        message: err?.message || 'Agent endpoint unreachable',
        diagnosticMode: activeDiagnostic !== 'NONE' ? activeDiagnostic : undefined
      });
    } finally {
      setIsExecuting(false);
    }
  };

  const curlCommand = `curl -X POST https://ais-dev-udyzsnwuyzi3o6ijj5x4yk-234154916326.asia-east1.run.app/api/agent/transact \\
  -H "Content-Type: application/json" \\
  -d '{
    "agentId": "gemini-autonomous-buyer",
    "agentName": "Gemini Fashion Agent",
    "buyerEmail": "patron@luxury.ai",
    "items": [{ "productId": "${currentProduct.id}", "quantity": 1, "size": "${selectedSize}" }],
    "maxBudgetINR": ${spendingCapINR},
    "campaignPromoCode": "${promoCode}",
    "gatingToken": "${gatingTokenInput}",
    "isApprovedByHuman": ${isHumanApproved}${connectivityDiagnostic !== 'NONE' ? `,\n    "connectivityDiagnostic": "${connectivityDiagnostic}"` : ''}
  }'`;

  const copyCurlToClipboard = () => {
    navigator.clipboard.writeText(curlCommand);
    setCopiedCurl(true);
    setTimeout(() => setCopiedCurl(false), 2000);
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.3 }}
      className="fixed inset-0 z-50 overflow-y-auto bg-neutral-900/80 backdrop-blur-sm flex items-center justify-center p-3 sm:p-6"
      onClick={onClose}
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.96, y: 12 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.96, y: 12 }}
        transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
        className="relative w-full max-w-4xl bg-white rounded-2xl shadow-2xl border border-neutral-200 overflow-hidden flex flex-col my-auto max-h-[92vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Terminal Header */}
        <div className="bg-neutral-950 text-white px-6 py-4 flex items-center justify-between border-b border-neutral-800">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 rounded-xl bg-neutral-800 border border-neutral-700 flex items-center justify-center text-white">
              <Bot className="w-4 h-4 text-amber-400" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h3 className="font-bold text-sm text-white tracking-wide">
                  Autonomous AI Buyer Endpoint
                </h3>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-neutral-800 text-amber-400 border border-neutral-700 font-mono font-semibold">
                  POST /api/agent/transact
                </span>
              </div>
              <p className="text-xs text-neutral-400 font-light">
                Evaluation Criteria: Explainable • Bounded • Gated Machine-to-Machine Commerce
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-full text-neutral-400 hover:text-white hover:bg-neutral-800 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Navigation */}
        <div className="bg-neutral-100 px-6 py-2 border-b border-neutral-200 flex items-center justify-between">
          <div className="flex space-x-2 text-xs font-semibold">
            <button
              onClick={() => setActiveTab('playground')}
              className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
                activeTab === 'playground'
                  ? 'bg-neutral-900 text-white shadow-xs'
                  : 'text-neutral-600 hover:text-neutral-900 hover:bg-neutral-200'
              }`}
            >
              Interactive Playground
            </button>
            <button
              onClick={() => setActiveTab('gates')}
              className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
                activeTab === 'gates'
                  ? 'bg-neutral-900 text-white shadow-xs'
                  : 'text-neutral-600 hover:text-neutral-900 hover:bg-neutral-200'
              }`}
            >
              3-Tier Gating Architecture
            </button>
            <button
              onClick={() => setActiveTab('curl')}
              className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
                activeTab === 'curl'
                  ? 'bg-neutral-900 text-white shadow-xs'
                  : 'text-neutral-600 hover:text-neutral-900 hover:bg-neutral-200'
              }`}
            >
              cURL / Machine Payload
            </button>
          </div>

          <span className="text-[11px] text-neutral-500 font-mono flex items-center gap-1">
            <ShieldCheck className="w-3.5 h-3.5 text-neutral-700" />
            <span>Tamper-Evident SHA-256</span>
          </span>
        </div>

        {/* Body Content */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6 custom-scrollbar bg-neutral-50/50">
          
          {activeTab === 'playground' && (
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
              
              {/* Left Column: Configuration Controls */}
              <div className="lg:col-span-6 space-y-5 bg-white p-5 rounded-2xl border border-neutral-200 shadow-2xs">
                <div>
                  <h4 className="text-xs font-bold uppercase tracking-wider text-neutral-500 mb-1">
                    1. Target Haute Couture SKU
                  </h4>
                  <select
                    value={selectedProductId}
                    onChange={(e) => setSelectedProductId(e.target.value)}
                    className="w-full bg-neutral-50 border border-neutral-300 rounded-xl px-3 py-2 text-xs font-semibold text-neutral-900 focus:outline-none focus:border-neutral-900"
                  >
                    {PRODUCTS.map(p => (
                      <option key={p.id} value={p.id}>
                        {p.name} — ₹{p.price.toLocaleString('en-IN')} ({p.category})
                      </option>
                    ))}
                  </select>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[10px] uppercase font-bold text-neutral-500 mb-1">
                      Size Selection
                    </label>
                    <select
                      value={selectedSize}
                      onChange={(e) => setSelectedSize(e.target.value)}
                      className="w-full bg-neutral-50 border border-neutral-300 rounded-xl px-3 py-1.5 text-xs font-semibold text-neutral-900"
                    >
                      {(currentProduct.sizes || ['FR 36', 'FR 38', 'FR 40']).map(s => (
                        <option key={s} value={s}>{s}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-[10px] uppercase font-bold text-neutral-500 mb-1">
                      Campaign Privilege Code
                    </label>
                    <input
                      type="text"
                      value={promoCode}
                      onChange={(e) => setPromoCode(e.target.value)}
                      placeholder="e.g. VIPATELIER10"
                      className="w-full bg-neutral-50 border border-neutral-300 rounded-xl px-3 py-1.5 text-xs font-mono font-semibold uppercase text-neutral-900"
                    />
                  </div>
                </div>

                {/* BOUNDED GUARDRAIL SLIDER */}
                <div className="p-4 rounded-xl bg-amber-50/60 border border-amber-200 space-y-2">
                  <div className="flex justify-between items-center text-xs">
                    <span className="font-bold text-neutral-900 flex items-center gap-1.5">
                      <Sliders className="w-3.5 h-3.5 text-amber-700" />
                      <span>Bounded Spending Guardrail</span>
                    </span>
                    <span className="font-mono font-bold text-neutral-950 text-sm">
                      ₹{spendingCapINR.toLocaleString('en-IN')}
                    </span>
                  </div>
                  <input
                    type="range"
                    min={10000}
                    max={60000}
                    step={2500}
                    value={spendingCapINR}
                    onChange={(e) => setSpendingCapINR(Number(e.target.value))}
                    className="w-full accent-neutral-900 cursor-pointer"
                  />
                  <div className="flex justify-between text-[10px] text-neutral-500 font-mono">
                    <span>₹10,000 (Strict Cap)</span>
                    <span>₹60,000 (Generous)</span>
                  </div>
                  {isOverBudget && (
                    <p className="text-[11px] font-semibold text-rose-700 flex items-center gap-1 pt-1">
                      <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                      <span>Order (₹{calculatedTotalINR.toLocaleString('en-IN')}) will exceed bound by ₹{(calculatedTotalINR - spendingCapINR).toLocaleString('en-IN')}!</span>
                    </p>
                  )}
                </div>

                {/* GATED APPROVAL TOGGLE */}
                <div className="p-4 rounded-xl bg-neutral-50 border border-neutral-200 space-y-2.5">
                  <label className="flex items-center space-x-2.5 cursor-pointer text-xs">
                    <input
                      type="checkbox"
                      checked={isHumanApproved}
                      onChange={(e) => setIsHumanApproved(e.target.checked)}
                      className="accent-neutral-900 w-4 h-4 rounded cursor-pointer"
                    />
                    <span className="font-bold text-neutral-900 flex items-center gap-1">
                      <Key className="w-3.5 h-3.5 text-neutral-700" />
                      <span>Human Patron Gate Pre-Authorization</span>
                    </span>
                  </label>
                  {isHumanApproved ? (
                    <div className="flex items-center space-x-2 text-xs">
                      <span className="text-neutral-500 font-mono text-[10px]">Auth Token:</span>
                      <input
                        type="text"
                        value={gatingTokenInput}
                        onChange={(e) => setGatingTokenInput(e.target.value)}
                        className="flex-1 bg-white border border-neutral-300 rounded px-2 py-1 font-mono text-xs"
                      />
                    </div>
                  ) : (
                    <p className="text-[11px] text-neutral-500 font-light">
                      If unchecked and order &gt; ₹20,000, Gate 3 will block autonomous charge and request patron challenge.
                    </p>
                  )}
                </div>

                {/* CONNECTIVITY DIAGNOSTICS SECTION */}
                <div className="p-4 rounded-xl bg-neutral-900 text-white border border-neutral-800 space-y-3 shadow-inner">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold uppercase tracking-wider text-amber-400 flex items-center gap-1.5">
                      <Activity className="w-3.5 h-3.5 text-amber-400" />
                      <span>Connectivity Diagnostics</span>
                    </span>
                    <span className="text-[10px] px-2 py-0.5 rounded bg-neutral-800 font-mono text-neutral-300 border border-neutral-700">
                      Resilience Engine
                    </span>
                  </div>

                  <div>
                    <label className="block text-[10px] text-neutral-400 uppercase font-semibold mb-1">
                      Diagnostic Condition Select
                    </label>
                    <select
                      value={connectivityDiagnostic}
                      onChange={(e) => setConnectivityDiagnostic(e.target.value as any)}
                      className="w-full bg-neutral-950 border border-neutral-700 text-white rounded-lg px-3 py-2 text-xs font-medium focus:outline-none focus:border-amber-400 cursor-pointer"
                    >
                      <option value="NONE">Standard Interconnect (Nominal Production Flow)</option>
                      <option value="INSUFFICIENT_BALANCE">Insufficient Balance (Bounded Cap Exceeded)</option>
                      <option value="STOCK_DEPLETION">Stock Depletion (Inventory Exhaustion)</option>
                      <option value="NETWORK_TIMEOUT">Network Timeout (Gateway Interruption)</option>
                      <option value="GATED_CHALLENGE">Patron Authorization Required (High-Ticket Gate)</option>
                    </select>
                  </div>

                  {connectivityDiagnostic !== 'NONE' && (
                    <div className="p-2.5 rounded-lg bg-neutral-800/80 border border-neutral-700 text-[11px] text-neutral-300 space-y-1">
                      <div className="flex items-center gap-1 text-amber-300 font-bold text-[10px] uppercase">
                        <AlertTriangle className="w-3 h-3 text-amber-300" />
                        <span>Diagnostic Mode Active</span>
                      </div>
                      <p className="font-light text-neutral-400 leading-snug">
                        {connectivityDiagnostic === 'INSUFFICIENT_BALANCE' && 'Evaluates Gate 2 bounded limit enforcement when total expenditure exceeds patron cap.'}
                        {connectivityDiagnostic === 'STOCK_DEPLETION' && 'Evaluates Gate 1 inventory interlock, asserting zero duplicate debit and alternative SKU recommendation.'}
                        {connectivityDiagnostic === 'NETWORK_TIMEOUT' && 'Evaluates upstream gateway 504 timeout recovery with cached idempotency token.'}
                        {connectivityDiagnostic === 'GATED_CHALLENGE' && 'Evaluates Gate 3 multi-factor challenge prompt for high-ticket autonomous purchases.'}
                      </p>
                    </div>
                  )}

                  <button
                    type="button"
                    disabled={isExecuting}
                    onClick={() => handleExecuteAgentTransaction()}
                    className="w-full py-2 bg-neutral-800 hover:bg-neutral-700 border border-neutral-700 text-amber-300 rounded-lg text-xs font-semibold tracking-wide transition-all flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-50"
                  >
                    <Zap className="w-3.5 h-3.5 text-amber-400" />
                    <span>Run Connectivity Diagnostic Routine</span>
                  </button>
                </div>

                {/* Primary Action Button */}
                <button
                  disabled={isExecuting}
                  onClick={() => handleExecuteAgentTransaction('NONE')}
                  className="w-full py-3.5 bg-neutral-950 hover:bg-neutral-800 text-white rounded-xl text-xs uppercase tracking-wider font-bold transition-all shadow-md flex items-center justify-center space-x-2 cursor-pointer disabled:opacity-50"
                >
                  {isExecuting ? (
                    <>
                      <RefreshCw className="w-4 h-4 animate-spin text-amber-400" />
                      <span>Evaluating 3-Tier Security Gates...</span>
                    </>
                  ) : (
                    <>
                      <Bot className="w-4 h-4 text-amber-400" />
                      <span>Execute Agent Transaction via API</span>
                    </>
                  )}
                </button>
              </div>

              {/* Right Column: Explainable Math & Real-Time Inspection */}
              <div className="lg:col-span-6 space-y-5">
                
                {/* EXPLAINABLE PRICING CARD */}
                <div className="bg-white p-5 rounded-2xl border border-neutral-200 shadow-2xs space-y-3">
                  <div className="flex items-center justify-between border-b border-neutral-100 pb-2">
                    <span className="text-xs font-bold uppercase tracking-wider text-neutral-500 flex items-center gap-1.5">
                      <Sparkles className="w-3.5 h-3.5 text-amber-600" />
                      <span>Explainable Pricing Calculation</span>
                    </span>
                    <span className="text-[10px] px-2 py-0.5 rounded bg-neutral-100 font-mono text-neutral-700">
                      Pre-Debit Verified
                    </span>
                  </div>

                  <div className="space-y-2 text-xs">
                    <div className="flex justify-between text-neutral-600">
                      <span>Base Atelier MSRP ({currentProduct.sku})</span>
                      <span className="font-mono font-semibold text-neutral-900">₹{basePriceINR.toLocaleString('en-IN')}</span>
                    </div>

                    {discountAmountINR > 0 ? (
                      <div className="flex justify-between text-neutral-900 font-semibold">
                        <span>Campaign Rebate ({promoCode} • {discountPercent}%)</span>
                        <span className="font-mono">-₹{discountAmountINR.toLocaleString('en-IN')}</span>
                      </div>
                    ) : (
                      <div className="flex justify-between text-neutral-400">
                        <span>Campaign Rebate (None applied)</span>
                        <span className="font-mono">₹0</span>
                      </div>
                    )}

                    <div className="flex justify-between text-neutral-600">
                      <span>White-Glove Courier Dispatch</span>
                      <span className="font-mono text-neutral-900 font-semibold">₹0 (Complimentary)</span>
                    </div>

                    <div className="border-t border-neutral-200 pt-2 flex justify-between items-baseline">
                      <span className="font-bold text-neutral-900 text-sm">Authorized Net Total</span>
                      <span className="font-mono text-lg font-bold text-neutral-950">
                        ₹{calculatedTotalINR.toLocaleString('en-IN')}
                      </span>
                    </div>

                    <div className="p-2.5 rounded-lg bg-neutral-50 border border-neutral-200 text-[11px] text-neutral-600 font-mono">
                      <strong>Audit Formula:</strong> ₹{basePriceINR.toLocaleString('en-IN')} - ₹{discountAmountINR.toLocaleString('en-IN')} = ₹{calculatedTotalINR.toLocaleString('en-IN')} net payable
                    </div>
                  </div>
                </div>

                {/* LIVE API RESPONSE CONSOLE */}
                <div className="bg-neutral-950 text-neutral-200 p-4 rounded-2xl border border-neutral-800 font-mono text-xs space-y-2 shadow-inner">
                  <div className="flex items-center justify-between text-[10px] text-neutral-400 border-b border-neutral-800 pb-1.5">
                    <span className="flex items-center gap-1.5">
                      <Terminal className="w-3.5 h-3.5 text-amber-400" />
                      <span>Live Response Output</span>
                    </span>
                    {terminalResult && (
                      <div className="flex items-center gap-1.5">
                        {terminalResult.diagnosticMode && (
                          <span className="px-1.5 py-0.5 rounded bg-neutral-800 text-amber-300 border border-neutral-700 text-[9px]">
                            {terminalResult.diagnosticMode}
                          </span>
                        )}
                        <span className={`px-1.5 py-0.5 rounded text-[9px] font-bold ${
                          terminalResult.success ? 'bg-neutral-800 text-white border border-neutral-700' : 'bg-rose-950 text-rose-300'
                        }`}>
                          HTTP {terminalResult.httpStatus || (terminalResult.success ? 200 : 400)}
                        </span>
                      </div>
                    )}
                  </div>

                  {terminalResult ? (
                    <div className="max-h-64 overflow-y-auto custom-scrollbar text-[11px] space-y-2 text-neutral-300">
                      {terminalResult.success ? (
                        <>
                          <div className="text-white font-bold flex items-center gap-1">
                            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                            <span>TRANSACTION EXECUTED SUCCESSFULLY</span>
                          </div>
                          <div>Order #: <strong className="text-white">{terminalResult.orderNumber}</strong></div>
                          <div>Transaction ID: <strong className="text-neutral-200">{terminalResult.transactionId}</strong></div>
                          <div>Audit Hash: <span className="text-[10px] text-neutral-400 truncate block">{terminalResult.auditHash}</span></div>
                          <div className="text-[10px] text-neutral-400 pt-1 border-t border-neutral-800">
                            Gates Passed: {terminalResult.gatesEvaluation?.gate1_InventoryIntegrity} • {terminalResult.gatesEvaluation?.gate2_SpendingBounds}
                          </div>
                        </>
                      ) : (
                        <>
                          <div className="text-rose-400 font-bold flex items-center gap-1">
                            <AlertCircle className="w-3.5 h-3.5 text-rose-400 shrink-0" />
                            <span>GRACEFUL FAILURE HANDLER TRIGGERED: {terminalResult.error}</span>
                          </div>
                          <p className="text-neutral-200 text-[11px] leading-relaxed">{terminalResult.message}</p>
                          
                          {terminalResult.gateFailed && (
                            <div className="text-amber-400 text-[10px] flex items-center gap-1">
                              <ShieldCheck className="w-3 h-3 text-amber-400" />
                              <span>Interlock Enforced: {terminalResult.gateFailed}</span>
                            </div>
                          )}

                          {terminalResult.diagnosticDetails && (
                            <div className="p-2.5 rounded-lg bg-neutral-900 border border-neutral-800 text-[10px] space-y-1 text-neutral-400 mt-1">
                              <div className="text-white font-semibold flex items-center gap-1">
                                <RotateCcw className="w-3 h-3 text-amber-400" />
                                <span>Graceful Recovery & Mitigation:</span>
                              </div>
                              <p className="text-neutral-300">{terminalResult.diagnosticDetails.remedy}</p>
                              {terminalResult.diagnosticDetails.idempotencyKey && (
                                <div className="text-neutral-500 font-mono">
                                  Idempotency Token: {terminalResult.diagnosticDetails.idempotencyKey}
                                </div>
                              )}
                              {terminalResult.diagnosticDetails.zeroDebitGuaranteed && (
                                <div className="text-emerald-400 font-semibold">
                                  Guaranteed Status: Zero customer debit executed.
                                </div>
                              )}
                            </div>
                          )}
                        </>
                      )}
                    </div>
                  ) : (
                    <div className="py-8 text-center text-neutral-500 text-[11px]">
                      Awaiting execution. Tap "Run Connectivity Diagnostic Routine" or "Execute Agent Transaction via API" to inspect machine handshake.
                    </div>
                  )}
                </div>

              </div>

            </div>
          )}

          {activeTab === 'gates' && (
            <div className="space-y-4">
              <div className="p-4 bg-white rounded-xl border border-neutral-200 flex items-start space-x-3 shadow-2xs">
                <div className="w-8 h-8 rounded-lg bg-neutral-900 text-white flex items-center justify-center font-bold text-xs shrink-0">
                  G1
                </div>
                <div>
                  <h4 className="text-xs font-bold text-neutral-900 uppercase tracking-wide">
                    Gate 1: SKU & Inventory Stock Verification
                  </h4>
                  <p className="text-xs text-neutral-600 font-light mt-0.5">
                    Before pricing is calculated, the catalog engine verifies that the requested SKU exists in the active product catalog and has stock &gt; 0. If depleted, it returns structured failure code <code className="bg-neutral-100 px-1 py-0.5 rounded text-[11px]">STOCK_DEPLETED</code> with alternative product recommendations without charging.
                  </p>
                </div>
              </div>

              <div className="p-4 bg-white rounded-xl border border-neutral-200 flex items-start space-x-3 shadow-2xs">
                <div className="w-8 h-8 rounded-lg bg-neutral-900 text-white flex items-center justify-center font-bold text-xs shrink-0">
                  G2
                </div>
                <div>
                  <h4 className="text-xs font-bold text-neutral-900 uppercase tracking-wide">
                    Gate 2: Bounded Spending Guardrail Compliance
                  </h4>
                  <p className="text-xs text-neutral-600 font-light mt-0.5">
                    Evaluates the net authorized amount against user-defined bounded caps (e.g. ₹35,000 max per autonomous transaction). If an autonomous buyer attempts to purchase beyond this cap, the transaction is rejected safely with HTTP 422 <code className="bg-neutral-100 px-1 py-0.5 rounded text-[11px]">BOUNDED_LIMIT_EXCEEDED</code>.
                  </p>
                </div>
              </div>

              <div className="p-4 bg-white rounded-xl border border-neutral-200 flex items-start space-x-3 shadow-2xs">
                <div className="w-8 h-8 rounded-lg bg-neutral-900 text-white flex items-center justify-center font-bold text-xs shrink-0">
                  G3
                </div>
                <div>
                  <h4 className="text-xs font-bold text-neutral-900 uppercase tracking-wide">
                    Gate 3: Multi-Factor Human Authorization Handshake
                  </h4>
                  <p className="text-xs text-neutral-600 font-light mt-0.5">
                    For high-ticket luxury acquisitions (&gt; ₹20,000), autonomous AI agents must provide a cryptographic gating token or pre-authorized human approval state. Without it, the engine returns HTTP 403 <code className="bg-neutral-100 px-1 py-0.5 rounded text-[11px]">GATED_APPROVAL_REQUIRED</code> with an interactive challenge token.
                  </p>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'curl' && (
            <div className="space-y-3">
              <div className="flex justify-between items-center text-xs text-neutral-600">
                <span>Direct Machine-to-Machine cURL Example:</span>
                <button
                  onClick={copyCurlToClipboard}
                  className="px-3 py-1 bg-neutral-900 text-white rounded-lg hover:bg-black transition-colors font-semibold flex items-center gap-1.5 cursor-pointer text-xs"
                >
                  {copiedCurl ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copiedCurl ? 'Copied cURL' : 'Copy cURL'}</span>
                </button>
              </div>

              <pre className="p-4 rounded-xl bg-neutral-950 text-neutral-200 font-mono text-xs overflow-x-auto leading-relaxed border border-neutral-800">
                {curlCommand}
              </pre>
            </div>
          )}

        </div>

        {/* Modal Footer */}
        <div className="px-6 py-3 border-t border-neutral-200 bg-neutral-50 flex items-center justify-between text-xs text-neutral-500">
          <span className="font-mono text-[11px]">Razorpay Active Key: rzp_test_TTIym4sF9tQr0m</span>
          <button
            onClick={onClose}
            className="px-4 py-1.5 bg-neutral-900 hover:bg-neutral-800 text-white rounded-lg text-xs font-semibold cursor-pointer"
          >
            Close Inspector
          </button>
        </div>

      </motion.div>
    </motion.div>
  );
};
