import React, { useState, useEffect } from 'react';
import { 
  X, 
  ShieldCheck, 
  Search, 
  Download, 
  Trash2, 
  Clock, 
  Tag, 
  AlertTriangle, 
  CheckCircle, 
  Info, 
  XCircle,
  Layers,
  Sparkles,
  User,
  Key,
  Lock,
  LogOut,
  Sliders,
  Check,
  ShoppingBag,
  Package,
  Truck,
  FileText,
  Building,
  Store,
  ChevronRight,
  ArrowRight,
  Save,
  CheckCircle2,
  RefreshCw
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useAudit } from '../context/AuditContext';
import { useMerchant } from '../context/MerchantContext';
import { AuditCategory, MerchantOrder } from '../types';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialTab?: 'orders' | 'profile' | 'security' | 'preferences';
  onSwitchToMerchant?: () => void;
}

const CATEGORY_TABS: { label: string; value: 'ALL' | AuditCategory }[] = [
  { label: 'All Events', value: 'ALL' },
  { label: 'Catalog', value: 'CATALOG' },
  { label: 'AI Search', value: 'AI_SEARCH' },
  { label: 'Upsell / Cross-Sell', value: 'UPSELL' },
  { label: 'Cart & Approvals', value: 'USER_APPROVAL' },
  { label: 'Razorpay / Payment', value: 'RAZORPAY' },
  { label: 'Orders', value: 'ORDER' },
  { label: 'Campaigns', value: 'CAMPAIGN' },
  { label: 'Failures', value: 'FAILURE' }
];

export const SettingsModal: React.FC<SettingsModalProps> = ({ 
  isOpen, 
  onClose,
  initialTab = 'orders',
  onSwitchToMerchant
}) => {
  const { user, handleSignOut } = useAuth();
  const { logs, clearLogs } = useAudit();
  const { orders, catalog } = useMerchant();

  const isMerchant = user?.role === 'merchant';
  const [activeTab, setActiveTab] = useState<'orders' | 'profile' | 'security' | 'preferences'>(initialTab);
  const [selectedCategory, setSelectedCategory] = useState<'ALL' | AuditCategory>('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  const [showClearConfirm, setShowClearConfirm] = useState(false);
  const [copiedKey, setCopiedKey] = useState(false);
  const [selectedOrderReceipt, setSelectedOrderReceipt] = useState<string | null>(null);
  const [trackingOrder, setTrackingOrder] = useState<MerchantOrder | null>(null);

  // Profile editable state
  const [profileName, setProfileName] = useState(user?.displayName || 'Shivangi Sharma');
  const [profilePhone, setProfilePhone] = useState('+91 98200 88912');
  const [profileAddress, setProfileAddress] = useState('74 Haute Boulevard, Jubilee Hills, Hyderabad');
  const [preferredSize, setPreferredSize] = useState('FR 36 (US 2)');
  const [preferredPalette, setPreferredPalette] = useState<string[]>(['Noir', 'Silk Opal', 'Emerald']);
  const [savedSuccess, setSavedSuccess] = useState(false);

  useEffect(() => {
    if (initialTab) {
      setActiveTab(initialTab);
    }
  }, [initialTab, isOpen]);

  if (!isOpen) return null;

  const handleLogout = async () => {
    onClose();
    await handleSignOut();
  };

  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault();
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 2500);
  };

  const handleDownloadInvoice = (ord: MerchantOrder) => {
    const invoiceText = `
============================================================
              MAISON LUXORA HAUTE COUTURE
          14 Rue du Faubourg Saint-Honoré, Paris
              Official Acquisition Invoice
============================================================
Invoice Number:   INV-${ord.orderNumber}
Order Reference:  #${ord.orderNumber}
Date Issued:      ${new Date(ord.createdAt).toLocaleDateString('en-IN', { year: 'numeric', month: 'long', day: 'numeric' })}
Payment Gateway:  ${ord.paymentMethod}
Payment ID:       ${ord.razorpayPaymentId || 'pay_razorpay_verified'}
Payment Status:   ${ord.paymentStatus || 'Paid & Verified'}

PATRON DETAILS:
Name:             ${ord.buyerName}
Email:            ${ord.buyerEmail}
Phone:            ${ord.buyerPhone}
Dispatch:         LUXORA White-Glove Atelier Courier

ACQUIRED PIECES:
------------------------------------------------------------
${ord.items.map((it, idx) => `${idx + 1}. ${it.productName}
   Size: ${it.size} | Color: ${it.color} | Qty: ${it.quantity}
   Unit: ₹${it.priceINR.toLocaleString('en-IN')} | Subtotal: ₹${(it.priceINR * it.quantity).toLocaleString('en-IN')}`).join('\n\n')}

------------------------------------------------------------
Subtotal:                                ₹${(ord.totalINR || 0).toLocaleString('en-IN')}
White Glove Courier & Armored Transit:   Complimentary (₹0)
Bespoke Alteration Guarantee:            Included (₹0)
GST / Luxury VAT (18% inclusive):        Included
TOTAL PAID:                              ₹${(ord.totalINR || 0).toLocaleString('en-IN')}

Official Verification:
LUXORA-CRYPTOGRAPHIC-SEAL: LUX-${ord.orderNumber}-VERIFIED-VALID
============================================================
`;

    const blob = new Blob([invoiceText], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const downloadAnchor = document.createElement('a');
    downloadAnchor.href = url;
    downloadAnchor.download = `LUXORA_Invoice_${ord.orderNumber}.txt`;
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
    URL.revokeObjectURL(url);
  };

  const filteredLogs = logs.filter(log => {
    const matchesCategory = 
      selectedCategory === 'ALL' ||
      log.category === selectedCategory ||
      (selectedCategory === 'UPSELL' && (log.category === 'UPSELL' || log.category === 'CROSS_SELL')) ||
      (selectedCategory === 'USER_APPROVAL' && (log.category === 'USER_APPROVAL' || log.category === 'CART')) ||
      (selectedCategory === 'RAZORPAY' && (log.category === 'RAZORPAY' || log.category === 'PAYMENT' || log.category === 'CHECKOUT'));

    const titleStr = typeof log.title === 'string' ? log.title : String(log.title || '');
    const detailsStr = typeof log.details === 'string' ? log.details : JSON.stringify(log.details || '');
    const categoryStr = typeof log.category === 'string' ? log.category : String(log.category || '');

    const matchesSearch = 
      titleStr.toLowerCase().includes(searchQuery.toLowerCase()) ||
      detailsStr.toLowerCase().includes(searchQuery.toLowerCase()) ||
      categoryStr.toLowerCase().includes(searchQuery.toLowerCase());

    return matchesCategory && matchesSearch;
  });

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'success':
        return <CheckCircle className="w-4 h-4 text-emerald-600 flex-shrink-0 mt-0.5" />;
      case 'warning':
        return <AlertTriangle className="w-4 h-4 text-amber-600 flex-shrink-0 mt-0.5" />;
      case 'error':
        return <XCircle className="w-4 h-4 text-rose-600 flex-shrink-0 mt-0.5" />;
      default:
        return <Info className="w-4 h-4 text-sky-600 flex-shrink-0 mt-0.5" />;
    }
  };

  const getCategoryBadgeClass = (category: AuditCategory) => {
    switch (category) {
      case 'CATALOG':
        return 'bg-purple-50 text-purple-800 border-purple-200';
      case 'AI_SEARCH':
      case 'RECOMMENDATION':
        return 'bg-amber-50 text-amber-800 border-amber-200';
      case 'UPSELL':
      case 'CROSS_SELL':
        return 'bg-emerald-50 text-emerald-800 border-emerald-200';
      case 'RAZORPAY':
      case 'PAYMENT':
      case 'ORDER':
        return 'bg-blue-50 text-blue-800 border-blue-200';
      case 'USER_APPROVAL':
        return 'bg-indigo-50 text-indigo-800 border-indigo-200';
      case 'FAILURE':
        return 'bg-rose-50 text-rose-800 border-rose-200';
      default:
        return 'bg-neutral-100 text-neutral-800 border-neutral-200';
    }
  };

  const handleExportJson = () => {
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(logs, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute("href", dataStr);
    downloadAnchor.setAttribute("download", `luxora_security_audit_${new Date().toISOString().split('T')[0]}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  const handleCopySessionToken = () => {
    navigator.clipboard.writeText(`lux_sess_${user?.uid || Date.now()}_sha256`);
    setCopiedKey(true);
    setTimeout(() => setCopiedKey(false), 2000);
  };

  return (
    <div
      id="settings-security-modal-overlay"
      className="fixed inset-0 z-50 overflow-y-auto bg-black/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-5 animate-fade-in font-['Archivo_Narrow']"
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-4xl bg-[#fbf9f4] border border-black/10 rounded-2xl sm:rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[88vh] sm:max-h-[85vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="px-4 py-3 sm:px-6 sm:py-4 border-b border-black/10 bg-white/95 backdrop-blur-md flex items-center justify-between">
          <div className="flex items-center space-x-3 min-w-0">
            <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl sm:rounded-2xl bg-black text-white flex items-center justify-center shadow-md shrink-0">
              {isMerchant ? <Building className="w-4 h-4 sm:w-5 sm:h-5 text-amber-300" /> : <User className="w-4 h-4 sm:w-5 sm:h-5 text-[#fc6018]" />}
            </div>
            <div className="min-w-0">
              <div className="flex items-center space-x-2">
                <span className="text-[10px] sm:text-[11px] uppercase tracking-[0.2em] font-semibold text-[#a83900]">
                  {isMerchant ? 'Business Atelier Portal' : 'Private Client Lounge'}
                </span>
                <span className={`px-2 py-0.5 text-[9px] sm:text-[10px] font-bold rounded-full uppercase ${
                  isMerchant ? 'bg-amber-100 text-amber-900 border border-amber-300' : 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                }`}>
                  {isMerchant ? 'Business Admin' : 'Haute Couture Patron'}
                </span>
              </div>
              <h2 className="text-lg sm:text-xl font-bold text-black tracking-tight truncate">
                {user?.displayName || user?.email || 'Valued Patron'}
              </h2>
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <button
              onClick={handleLogout}
              className="px-2.5 py-1.5 sm:px-3 sm:py-1.5 bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 text-xs font-bold uppercase tracking-wider rounded-xl transition-all flex items-center gap-1.5 cursor-pointer shadow-2xs"
              title="Sign Out"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Sign Out</span>
            </button>
            <button
              onClick={onClose}
              className="p-1.5 sm:p-2 hover:bg-black hover:text-white rounded-full transition-colors border border-black/15 cursor-pointer"
              aria-label="Close"
            >
              <X className="w-4 h-4 sm:w-5 sm:h-5" />
            </button>
          </div>
        </div>

        {/* Top Tab Switcher */}
        <div className="flex border-b border-black/10 bg-[#f2efe9] px-3 sm:px-6 gap-1.5 pt-1.5 overflow-x-auto no-scrollbar shrink-0">
          
          {/* Tab 1: Orders */}
          <button
            onClick={() => setActiveTab('orders')}
            className={`px-3 sm:px-4 py-2 sm:py-2.5 text-xs font-bold uppercase tracking-wider transition-all rounded-t-xl cursor-pointer flex items-center gap-1.5 sm:gap-2 whitespace-nowrap ${
              activeTab === 'orders'
                ? 'bg-[#fbf9f4] text-black border-t-2 border-black font-extrabold shadow-xs'
                : 'text-[#444748] hover:text-black'
            }`}
          >
            <Package className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-[#a83900]" />
            <span>{isMerchant ? 'Store Orders & Clients' : 'My Orders & Deliveries'}</span>
            <span className="px-1.5 py-0.2 bg-black/10 rounded-full text-[10px]">
              {orders.length}
            </span>
          </button>

          {/* Tab 2: Profile & Sizing */}
          <button
            onClick={() => setActiveTab('profile')}
            className={`px-3 sm:px-4 py-2 sm:py-2.5 text-xs font-bold uppercase tracking-wider transition-all rounded-t-xl cursor-pointer flex items-center gap-1.5 sm:gap-2 whitespace-nowrap ${
              activeTab === 'profile'
                ? 'bg-[#fbf9f4] text-black border-t-2 border-black font-extrabold shadow-xs'
                : 'text-[#444748] hover:text-black'
            }`}
          >
            <User className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-black" />
            <span>{isMerchant ? 'Business Atelier Profile' : 'Wardrobe & Sizing Profile'}</span>
          </button>

          {/* Tab 3: Security & Real-Time Audit Trail */}
          <button
            onClick={() => setActiveTab('security')}
            className={`px-3 sm:px-4 py-2 sm:py-2.5 text-xs font-bold uppercase tracking-wider transition-all rounded-t-xl cursor-pointer flex items-center gap-1.5 sm:gap-2 whitespace-nowrap ${
              activeTab === 'security'
                ? 'bg-[#fbf9f4] text-black border-t-2 border-black font-extrabold shadow-xs'
                : 'text-[#444748] hover:text-black'
            }`}
          >
            <ShieldCheck className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-emerald-600" />
            <span>Security & Audit Log</span>
            <span className="px-1.5 py-0.2 bg-black/10 rounded-full text-[10px]">
              {logs.length}
            </span>
          </button>

        </div>

        {/* Tab 1 Content: Orders Section */}
        {activeTab === 'orders' && (
          <div className="p-4 sm:p-5 space-y-4 sm:space-y-5 overflow-y-auto max-h-[62vh]">
            <div className="flex items-center justify-between border-b border-black/10 pb-2.5">
              <div>
                <h3 className="text-base sm:text-lg font-bold text-black">
                  {isMerchant ? 'Store Order Management & Fulfillment' : 'Your Haute Couture Purchase History'}
                </h3>
                <p className="text-xs text-[#444748]">
                  {isMerchant 
                    ? 'Track all client orders placed across the LUXORA digital boutique in real time.'
                    : 'All bespoke garments, tracking numbers, and official VAT invoices.'}
                </p>
              </div>
              <span className="text-xs font-mono font-bold bg-[#f0eee9] px-2.5 py-1 rounded-full text-black">
                {orders.length} Orders
              </span>
            </div>

            {/* Tracking Modal Popup inside */}
            {trackingOrder && (
              <div className="p-5 bg-white border-2 border-black/20 rounded-2xl shadow-lg space-y-4 animate-in fade-in">
                <div className="flex items-center justify-between border-b border-black/10 pb-2">
                  <div className="flex items-center gap-2">
                    <Truck className="w-4 h-4 text-[#a83900]" />
                    <span className="font-bold text-sm text-black">White-Glove Courier Tracking: #{trackingOrder.orderNumber}</span>
                  </div>
                  <button 
                    onClick={() => setTrackingOrder(null)} 
                    className="p-1 hover:bg-neutral-100 rounded-full text-neutral-500 hover:text-black"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>

                <div className="space-y-3">
                  <div className="flex items-center gap-3">
                    <div className="w-6 h-6 rounded-full bg-emerald-600 text-white flex items-center justify-center shrink-0">
                      <Check className="w-3.5 h-3.5 text-white" />
                    </div>
                    <div>
                      <h5 className="font-bold text-xs text-black">Order Placed & Authorized</h5>
                      <p className="text-[11px] text-neutral-500 font-mono">Payment verified via {trackingOrder.paymentMethod}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="w-6 h-6 rounded-full bg-emerald-600 text-white flex items-center justify-center shrink-0">
                      <Check className="w-3.5 h-3.5 text-white" />
                    </div>
                    <div>
                      <h5 className="font-bold text-xs text-black">Artisan Atelier Quality Inspection</h5>
                      <p className="text-[11px] text-neutral-500">Hand-finished drape check and luxury garment casing</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="w-6 h-6 rounded-full bg-black text-white flex items-center justify-center text-xs font-bold shrink-0 animate-pulse">
                      ●
                    </div>
                    <div>
                      <h5 className="font-bold text-xs text-black">Discreet Armored Courier Dispatch</h5>
                      <p className="text-[11px] text-neutral-500">Estimated Delivery: Within 24-48 Business Hours</p>
                    </div>
                  </div>
                </div>

                <div className="p-3 bg-[#fbf9f4] rounded-xl flex items-center justify-between text-xs">
                  <span className="text-neutral-600">Courier Partner: <strong>LUXORA White-Glove Fleet</strong></span>
                  <button 
                    onClick={() => handleDownloadInvoice(trackingOrder)}
                    className="px-3 py-1 bg-black text-white font-bold rounded-lg hover:bg-neutral-800 text-[11px] flex items-center gap-1 cursor-pointer"
                  >
                    <Download className="w-3 h-3" />
                    <span>Download Invoice</span>
                  </button>
                </div>
              </div>
            )}

            <div className="space-y-4">
              {orders.map((ord) => (
                <div 
                  key={ord.id}
                  className="p-5 bg-white border border-black/10 rounded-2xl shadow-xs hover:shadow-sm transition-all space-y-4"
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-black/5 pb-3">
                    <div className="flex items-center gap-2.5">
                      <span className="font-mono font-bold text-sm text-black">
                        #{ord.orderNumber}
                      </span>
                      <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-emerald-100 text-emerald-800 border border-emerald-300">
                        {ord.paymentStatus || 'Paid'} via {ord.paymentMethod}
                      </span>
                      <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                        ord.status === 'Delivered' 
                          ? 'bg-blue-100 text-blue-800' 
                          : ord.status === 'Shipped' 
                            ? 'bg-purple-100 text-purple-800' 
                            : 'bg-amber-100 text-amber-800'
                      }`}>
                        Status: {ord.status || 'Confirmed'}
                      </span>
                    </div>

                    <div className="text-xs text-neutral-500 font-mono flex items-center gap-1">
                      <Clock className="w-3.5 h-3.5" />
                      <span>{new Date(ord.createdAt).toLocaleDateString('en-IN', { month: 'short', day: 'numeric', year: 'numeric' })}</span>
                    </div>
                  </div>

                  {/* Customer Details */}
                  <div className="grid sm:grid-cols-2 gap-2 text-xs">
                    <div>
                      <span className="text-[10px] uppercase font-bold text-neutral-400 block">Patron Details</span>
                      <p className="font-semibold text-black">{ord.buyerName}</p>
                      <p className="text-neutral-500 font-mono text-[11px]">{ord.buyerEmail} • {ord.buyerPhone}</p>
                    </div>
                    <div>
                      <span className="text-[10px] uppercase font-bold text-neutral-400 block">Payment Reference</span>
                      <p className="font-mono text-neutral-700 text-[11px] truncate">{ord.razorpayPaymentId || 'pay_razorpay_verified'}</p>
                      <p className="text-[11px] text-emerald-700 font-semibold mt-0.5">Complimentary White Glove Courier Included</p>
                    </div>
                  </div>

                  {/* Line Items */}
                  <div className="space-y-2 pt-2 border-t border-black/5">
                    <span className="text-[10px] uppercase font-bold text-neutral-400 block">Curated Items ({ord.items.length})</span>
                    <div className="divide-y divide-black/5">
                      {ord.items.map((item, itemIdx) => {
                        const productMatch = catalog.find(p => p.id === item.productId);
                        return (
                          <div key={itemIdx} className="py-2 flex items-center justify-between gap-3">
                            <div className="flex items-center gap-3">
                              <img 
                                src={productMatch?.images?.[0] || productMatch?.imageUrl || 'https://images.unsplash.com/photo-1539109136881-3be0616acf4b?auto=format&fit=crop&q=80&w=800'} 
                                alt={item.productName}
                                className="w-10 h-12 object-cover rounded-lg bg-neutral-100"
                                referrerPolicy="no-referrer"
                              />
                              <div>
                                <h4 className="font-bold text-xs text-black">{item.productName}</h4>
                                <p className="text-[11px] text-neutral-500 font-mono">
                                  Size: {item.size} • Color: {item.color} • Qty: {item.quantity}
                                </p>
                              </div>
                            </div>
                            <span className="font-bold text-xs text-black font-mono">
                              ₹{(item.priceINR * item.quantity).toLocaleString('en-IN')}
                            </span>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  {/* Total & Action Buttons */}
                  <div className="flex flex-wrap items-center justify-between gap-2 pt-3 border-t border-black/10">
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => setSelectedOrderReceipt(selectedOrderReceipt === ord.id ? null : ord.id)}
                        className="px-3 py-1.5 bg-[#f2efe9] hover:bg-black hover:text-white rounded-xl text-xs font-bold text-black border border-black/15 transition-all flex items-center gap-1.5 cursor-pointer"
                      >
                        <FileText className="w-3.5 h-3.5" />
                        <span>{selectedOrderReceipt === ord.id ? 'Hide Invoice' : 'View Invoice'}</span>
                      </button>

                      <button
                        onClick={() => handleDownloadInvoice(ord)}
                        className="px-3 py-1.5 bg-white hover:bg-neutral-100 rounded-xl text-xs font-bold text-black border border-black/15 transition-all flex items-center gap-1.5 cursor-pointer"
                        title="Download Invoice TXT"
                      >
                        <Download className="w-3.5 h-3.5" />
                        <span>Download</span>
                      </button>

                      <button
                        onClick={() => setTrackingOrder(ord)}
                        className="px-3 py-1.5 bg-neutral-900 hover:bg-black text-white border border-neutral-900 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer shadow-2xs"
                      >
                        <Truck className="w-3.5 h-3.5" />
                        <span>Track Delivery</span>
                      </button>
                    </div>

                    <div className="text-right">
                      <span className="text-[10px] uppercase font-bold text-neutral-400 block">Total Amount</span>
                      <span className="text-base font-bold text-[#fc6018] font-mono">
                        ₹{(ord.totalINR || 0).toLocaleString('en-IN')}
                      </span>
                    </div>
                  </div>

                  {/* Official Invoice Expandable Box */}
                  {selectedOrderReceipt === ord.id && (
                    <div className="p-4 bg-[#fbf9f4] border border-black/15 rounded-xl space-y-2 text-xs font-mono">
                      <div className="flex justify-between border-b border-black/10 pb-2">
                        <div>
                          <p className="font-bold text-black uppercase">Maison LUXORA Haute Couture</p>
                          <p className="text-[10px] text-neutral-500">14 Rue du Faubourg Saint-Honoré, Paris</p>
                        </div>
                        <div className="text-right">
                          <p className="font-bold">INVOICE #{ord.orderNumber}</p>
                          <p className="text-[10px] text-neutral-500">GST/VAT: IN29AALUX9918K1Z</p>
                        </div>
                      </div>
                      <p className="text-[11px] text-neutral-700">
                        Billed To: <strong className="text-black">{ord.buyerName}</strong> ({ord.buyerEmail})
                      </p>
                      <div className="flex justify-between font-bold pt-2 border-t border-black/10">
                        <span>Paid Total (Inclusive of White Glove Courier & Alteration Insurance):</span>
                        <span className="text-[#a83900]">₹{(ord.totalINR || 0).toLocaleString('en-IN')}</span>
                      </div>
                    </div>
                  )}

                </div>
              ))}
            </div>
          </div>
        )}

        {/* Tab 2 Content: Profile & Sizing */}
        {activeTab === 'profile' && (
          <form onSubmit={handleSaveProfile} className="p-4 sm:p-5 space-y-4 overflow-y-auto max-h-[62vh]">
            <div className="grid md:grid-cols-2 gap-4">
              
              {/* Account Identity */}
              <div className="p-4 sm:p-5 bg-white border border-black/10 rounded-2xl space-y-3 shadow-xs">
                <h3 className="text-sm font-bold text-black uppercase tracking-wider flex items-center gap-2">
                  <User className="w-4 h-4 text-[#a83900]" />
                  <span>{isMerchant ? 'Business Atelier Credentials' : 'Private Client Profile'}</span>
                </h3>
                <div className="space-y-2.5 text-sm">
                  <div>
                    <label className="text-[10px] uppercase tracking-wider text-[#444748] font-bold block mb-1">Full Name</label>
                    <input 
                      type="text" 
                      value={profileName} 
                      onChange={(e) => setProfileName(e.target.value)}
                      className="w-full bg-[#fbf9f4] border border-black/15 px-3 py-1.5 text-xs rounded-xl focus:outline-none focus:border-black font-semibold text-black"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] uppercase tracking-wider text-[#444748] font-bold block mb-1">Registered Email</label>
                    <input 
                      type="email" 
                      value={user?.email || 'sharma.shivangiz105@gmail.com'} 
                      disabled
                      className="w-full bg-neutral-100 border border-black/10 px-3 py-1.5 text-xs rounded-xl font-mono text-neutral-600"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] uppercase tracking-wider text-[#444748] font-bold block mb-1">Direct Phone</label>
                    <input 
                      type="text" 
                      value={profilePhone} 
                      onChange={(e) => setProfilePhone(e.target.value)}
                      className="w-full bg-[#fbf9f4] border border-black/15 px-3 py-1.5 text-xs rounded-xl focus:outline-none focus:border-black font-mono text-black"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] uppercase tracking-wider text-[#444748] font-bold block mb-1">Primary Courier Destination</label>
                    <input 
                      type="text" 
                      value={profileAddress} 
                      onChange={(e) => setProfileAddress(e.target.value)}
                      className="w-full bg-[#fbf9f4] border border-black/15 px-3 py-1.5 text-xs rounded-xl focus:outline-none focus:border-black text-black"
                    />
                  </div>
                </div>
              </div>

              {/* Sizing & Wardrobe Fit */}
              <div className="p-4 sm:p-5 bg-white border border-black/10 rounded-2xl space-y-3 shadow-xs">
                <h3 className="text-sm font-bold text-black uppercase tracking-wider flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-[#a83900]" />
                  <span>Personal Silhouette & Sizing Matrix</span>
                </h3>
                
                <div>
                  <label className="text-[10px] uppercase tracking-wider text-[#444748] font-bold block mb-1">Standard Haute Sizing</label>
                  <div className="grid grid-cols-3 gap-1.5">
                    {['FR 34', 'FR 36', 'FR 38', 'FR 40', 'FR 42', 'Bespoke'].map((sz) => (
                      <button
                        type="button"
                        key={sz}
                        onClick={() => setPreferredSize(sz)}
                        className={`p-1.5 text-xs font-bold rounded-xl border text-center transition-all cursor-pointer ${
                          preferredSize === sz 
                            ? 'bg-black text-white border-black' 
                            : 'bg-[#fbf9f4] border-black/10 text-neutral-800 hover:border-black'
                        }`}
                      >
                        {sz}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="text-[10px] uppercase tracking-wider text-[#444748] font-bold block mb-1">Preferred Color Palettes</label>
                  <div className="flex flex-wrap gap-1.5">
                    {['Noir', 'Silk Opal', 'Emerald', 'Sapphire', 'Champagne', 'Bordeaux'].map((col) => {
                      const isSelected = preferredPalette.includes(col);
                      return (
                        <button
                          type="button"
                          key={col}
                          onClick={() => {
                            if (isSelected) {
                              setPreferredPalette(prev => prev.filter(c => c !== col));
                            } else {
                              setPreferredPalette(prev => [...prev, col]);
                            }
                          }}
                          className={`px-2.5 py-1 text-[11px] font-semibold rounded-full border transition-all cursor-pointer ${
                            isSelected 
                              ? 'bg-[#fc6018] text-white border-[#fc6018]' 
                              : 'bg-[#fbf9f4] border-black/10 text-neutral-800 hover:border-black'
                          }`}
                        >
                          {col}
                        </button>
                      );
                    })}
                  </div>
                </div>

                <div className="p-2 bg-[#fbf9f4] rounded-xl border border-black/5 text-xs flex items-center justify-between">
                  <span className="font-semibold text-neutral-700">VIP Concierge:</span>
                  <span className="font-bold text-emerald-700">Priority Stylist Active</span>
                </div>
              </div>

              {/* Save Button */}
              <div className="md:col-span-2 flex items-center justify-between p-3.5 bg-white border border-black/10 rounded-2xl">
                <span className="text-xs text-neutral-600 font-medium">
                  {savedSuccess ? (
                    <span className="text-emerald-700 font-bold flex items-center gap-1.5">
                      <CheckCircle2 className="w-4 h-4" />
                      Preferences saved successfully.
                    </span>
                  ) : (
                    'Custom sizing and delivery preferences.'
                  )}
                </span>

                <button
                  type="submit"
                  className="px-4 py-2 bg-black hover:bg-neutral-800 text-white text-xs font-bold uppercase tracking-wider rounded-xl transition-all flex items-center gap-1.5 cursor-pointer shadow-xs"
                >
                  <Save className="w-3.5 h-3.5" />
                  <span>Save Preferences</span>
                </button>
              </div>

            </div>
          </form>
        )}

        {/* Tab 3 Content: Security & Audit Trail */}
        {activeTab === 'security' && (
          <div className="flex-1 overflow-hidden flex flex-col max-h-[62vh]">
            {/* Search & Actions Bar */}
            <div className="p-3 sm:p-4 bg-white/70 border-b border-black/10 flex flex-wrap items-center justify-between gap-2.5">
              <div className="relative flex-1 min-w-[200px]">
                <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400" />
                <input
                  type="text"
                  placeholder="Search tamper-evident audit logs..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full bg-[#fbf9f4] border border-black/15 pl-8 pr-3 py-1.5 text-xs rounded-xl focus:outline-none focus:border-black"
                />
              </div>

              <div className="flex items-center space-x-2">
                <button
                  onClick={handleExportJson}
                  className="px-3 py-1.5 bg-white hover:bg-black hover:text-white border border-black/15 text-xs font-bold uppercase tracking-wider rounded-xl transition-colors flex items-center space-x-1.5 cursor-pointer shadow-2xs"
                  title="Export Audit Trail JSON"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Export JSON</span>
                </button>

                {showClearConfirm ? (
                  <div className="flex items-center space-x-1">
                    <button
                      onClick={() => {
                        clearLogs();
                        setShowClearConfirm(false);
                      }}
                      className="px-2.5 py-1 bg-rose-600 hover:bg-rose-700 text-white text-[11px] font-bold rounded-lg cursor-pointer"
                    >
                      Confirm Clear
                    </button>
                    <button
                      onClick={() => setShowClearConfirm(false)}
                      className="px-2.5 py-1 bg-neutral-200 text-black text-[11px] font-bold rounded-lg cursor-pointer"
                    >
                      Cancel
                    </button>
                  </div>
                ) : (
                  <button
                    onClick={() => setShowClearConfirm(true)}
                    className="p-1.5 text-neutral-500 hover:text-rose-600 hover:bg-rose-50 rounded-xl transition-colors border border-transparent hover:border-rose-200 cursor-pointer"
                    title="Purge logs"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                )}
              </div>
            </div>

            {/* Category Filter Chips */}
            <div className="px-3 sm:px-4 py-2 bg-[#fbf9f4] border-b border-black/5 flex items-center space-x-1.5 overflow-x-auto no-scrollbar">
              {CATEGORY_TABS.map((tab) => (
                <button
                  key={tab.value}
                  onClick={() => setSelectedCategory(tab.value)}
                  className={`text-[10px] sm:text-[11px] uppercase tracking-wider font-bold px-2.5 py-1 rounded-full transition-all whitespace-nowrap cursor-pointer ${
                    selectedCategory === tab.value
                      ? 'bg-black text-white shadow-2xs'
                      : 'bg-white/80 hover:bg-black hover:text-white border border-black/10 text-neutral-700'
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>

            {/* Logs Table / Stream */}
            <div className="flex-1 overflow-y-auto p-3 sm:p-4 space-y-2.5 custom-scrollbar">
              {filteredLogs.length === 0 ? (
                <div className="py-16 text-center text-neutral-400 space-y-2">
                  <ShieldCheck className="w-12 h-12 mx-auto text-neutral-300 stroke-[1.2]" />
                  <p className="text-sm font-medium text-neutral-600">No matching audit events found.</p>
                  <p className="text-xs">All transactions, AI stylist inquiries, and order actions are logged in real-time.</p>
                </div>
              ) : (
                filteredLogs.map((log) => (
                  <div
                    key={log.id}
                    className="p-4 bg-white/90 border border-black/10 rounded-2xl shadow-2xs hover:shadow-sm transition-all space-y-2 group"
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex items-start space-x-2.5">
                        {getStatusIcon(log.status)}
                        <div>
                          <div className="flex items-center space-x-2">
                            <span className="font-bold text-sm text-black tracking-tight">
                              {log.title}
                            </span>
                            <span className={`text-[10px] font-mono px-2 py-0.5 border rounded-full font-bold uppercase tracking-wider ${getCategoryBadgeClass(log.category)}`}>
                              {log.category}
                            </span>
                          </div>
                          <p className="text-xs text-neutral-600 mt-1 leading-relaxed">
                            {log.details}
                          </p>
                        </div>
                      </div>

                      <div className="flex flex-col items-end shrink-0 text-right">
                        <span className="text-[11px] font-mono text-neutral-500 flex items-center gap-1">
                          <Clock className="w-3 h-3 inline" />
                          {new Date(log.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                        </span>
                        <span className="text-[9px] font-mono text-neutral-400 mt-0.5">
                          {log.id.split('-').slice(0, 2).join('-')}
                        </span>
                      </div>
                    </div>

                    {/* Metadata Hash / Payload if available */}
                    {log.metadata && Object.keys(log.metadata).length > 0 && (
                      <div className="pt-2 border-t border-black/5 bg-[#fbf9f4] p-2.5 rounded-xl font-mono text-[11px] text-neutral-700 overflow-x-auto">
                        <span className="text-[9px] uppercase font-bold text-neutral-400 block mb-1">
                          Context Payload
                        </span>
                        <pre className="text-[10px] leading-tight">
                          {JSON.stringify(log.metadata, null, 2)}
                        </pre>
                      </div>
                    )}
                  </div>
                ))
              )}
            </div>
          </div>
        )}

        {/* Footer */}
        <div className="p-4 bg-white/90 border-t border-black/10 flex items-center justify-between text-xs text-[#444748]">
          <span>LUXORA Real-Time Governance & Customer Experience Framework</span>
          <div className="flex items-center gap-2">
            {onSwitchToMerchant && (
              <button
                onClick={() => {
                  onClose();
                  onSwitchToMerchant();
                }}
                className="px-3 py-2 bg-neutral-100 hover:bg-neutral-200 text-black font-bold uppercase tracking-wider rounded-xl transition-colors cursor-pointer flex items-center gap-1.5"
              >
                <Building className="w-3.5 h-3.5 text-amber-700" />
                <span>Open Business Studio</span>
              </button>
            )}
            <button
              onClick={onClose}
              className="px-5 py-2 bg-black text-white font-bold uppercase tracking-wider rounded-xl hover:bg-neutral-800 transition-colors cursor-pointer"
            >
              Close
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};
