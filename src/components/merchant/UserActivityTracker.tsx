import React, { useState } from 'react';
import { 
  Users, 
  Eye, 
  ShoppingBag, 
  Sparkles, 
  Tag, 
  Send, 
  Search, 
  Filter, 
  Clock, 
  CheckCircle2, 
  ArrowUpRight, 
  Percent, 
  Gift, 
  X, 
  ChevronRight, 
  ExternalLink,
  ShieldCheck,
  TrendingUp,
  AlertCircle,
  Copy,
  Check
} from 'lucide-react';
import { useMerchant } from '../../context/MerchantContext';
import { UserActivityRecord, Product, GrowthCampaign } from '../../types';

interface UserActivityTrackerProps {
  onSwitchToCampaignsTab?: () => void;
}

export const UserActivityTracker: React.FC<UserActivityTrackerProps> = ({ onSwitchToCampaignsTab }) => {
  const { 
    userActivities, 
    catalog, 
    createExclusiveOfferCampaign,
    campaigns
  } = useMerchant();

  // Search & Filter State
  const [searchQuery, setSearchQuery] = useState('');
  const [filterCategory, setFilterCategory] = useState<'ALL' | 'VIP Customer' | 'High Intent' | 'Window Shopper' | 'Dormant Cart'>('ALL');
  const [selectedUser, setSelectedUser] = useState<UserActivityRecord | null>(null);

  // Exclusive Offer Modal State
  const [isOfferModalOpen, setIsOfferModalOpen] = useState(false);
  const [offerUser, setOfferUser] = useState<UserActivityRecord | null>(null);
  const [offerTitle, setOfferTitle] = useState('');
  const [discountPercent, setDiscountPercent] = useState<number>(15);
  const [promoCode, setPromoCode] = useState('');
  const [selectedProductIds, setSelectedProductIds] = useState<string[]>([]);
  const [emailSubject, setEmailSubject] = useState('');
  const [emailBody, setEmailBody] = useState('');
  const [isCopiedLink, setIsCopiedLink] = useState(false);
  const [justLaunchedCampaign, setJustLaunchedCampaign] = useState<GrowthCampaign | null>(null);

  // Filtered Users
  const filteredUsers = userActivities.filter(u => {
    const matchesSearch = 
      u.userName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      u.userEmail.toLowerCase().includes(searchQuery.toLowerCase()) ||
      u.viewedItems.some(item => item.productName.toLowerCase().includes(searchQuery.toLowerCase())) ||
      u.purchasedItems.some(item => item.productName.toLowerCase().includes(searchQuery.toLowerCase()));

    const matchesCategory = filterCategory === 'ALL' || u.intentCategory === filterCategory;

    return matchesSearch && matchesCategory;
  });

  // KPIs
  const totalTracked = userActivities.length;
  const vipCount = userActivities.filter(u => u.intentCategory === 'VIP Customer').length;
  const highIntentCount = userActivities.filter(u => u.intentCategory === 'High Intent').length;
  const totalViewsLogged = userActivities.reduce((acc, u) => acc + u.viewedItems.reduce((sum, item) => sum + item.count, 0), 0);
  const totalExclusiveDispatched = userActivities.reduce((acc, u) => acc + u.exclusiveOffersReceived.length, 0);

  // Open Offer Modal with AI pre-fill
  const handleOpenCreateOffer = (user: UserActivityRecord) => {
    setOfferUser(user);
    setJustLaunchedCampaign(null);
    setIsCopiedLink(false);

    // Pick targeted products from viewed items
    const topViewedIds = user.viewedItems.slice(0, 2).map(v => v.productId);
    setSelectedProductIds(topViewedIds.length > 0 ? topViewedIds : [catalog[0]?.id || 'LX-WD-001']);

    const firstName = user.userName.split(' ')[0] || 'Patron';
    const topItemName = user.viewedItems[0]?.productName || 'Bespoke Atelier Collection';
    const initialDiscount = user.intentCategory === 'VIP Customer' ? 15 : 12;
    const generatedCode = `VIP-${firstName.toUpperCase()}-${initialDiscount}`;

    setDiscountPercent(initialDiscount);
    setPromoCode(generatedCode);
    setOfferTitle(`Exclusive ${initialDiscount}% Private Privilege for ${user.userName}`);
    setEmailSubject(`Private Invitation: A curated ${initialDiscount}% Atelier privilege for ${user.userName}`);
    setEmailBody(
      `Dear ${user.userName},\n\nWe noticed your discerning interest in our ${topItemName}. As a gesture of appreciation from Maison LUXORA, we are delighted to reserve your curated pieces with a private ${initialDiscount}% privilege.\n\nUse exclusive code: ${generatedCode} at express checkout.\n\nWarm regards,\nMaison LUXORA Atelier Concierge`
    );

    setIsOfferModalOpen(true);
  };

  // Launch the exclusive offer
  const handleLaunchOffer = (e: React.FormEvent) => {
    e.preventDefault();
    if (!offerUser) return;

    const newCampaign = createExclusiveOfferCampaign(offerUser.userId, {
      title: offerTitle,
      discountPercent: discountPercent,
      promoCode: promoCode,
      targetProductIds: selectedProductIds,
      emailSubject: emailSubject,
      emailBody: emailBody,
    });

    setJustLaunchedCampaign(newCampaign);
  };

  const handleCopyOfferLink = (code: string) => {
    const link = `${window.location.origin}/?promo=${code}`;
    navigator.clipboard.writeText(link);
    setIsCopiedLink(true);
    setTimeout(() => setIsCopiedLink(false), 2500);
  };

  return (
    <div className="space-y-8 animate-fade-in pb-16 font-['Archivo_Narrow']">
      
      {/* Top Banner & Header */}
      <div className="bg-gradient-to-r from-[#1c1b18] via-[#2a2723] to-[#1a1917] rounded-3xl p-6 sm:p-8 text-white shadow-xl border border-amber-950/40 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-[#a83900]/10 rounded-full blur-3xl pointer-events-none" />
        
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2 max-w-2xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-400/10 border border-amber-400/20 text-amber-300 text-xs font-bold uppercase tracking-widest">
              <Users className="w-3.5 h-3.5" />
              <span>Real-Time Client Telemetry</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-bold font-sans text-white tracking-tight">
              User Activity & Exclusive Offers Engine
            </h2>
            <p className="text-neutral-300 text-sm leading-relaxed">
              Track real-time browsing behaviors, item view frequencies, and purchase milestones per patron. Trigger bespoke 1-on-1 private discount campaigns and VIP recovery invitations with autonomous AI copywriting.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <button
              onClick={() => handleOpenCreateOffer(userActivities[0])}
              className="px-5 py-2.5 bg-gradient-to-r from-[#D9531E] to-[#b33d0e] hover:from-[#c24514] hover:to-[#963007] text-white font-bold text-xs uppercase tracking-wider rounded-xl transition-all shadow-md flex items-center gap-2 cursor-pointer"
            >
              <Gift className="w-4 h-4" />
              <span>New Exclusive Offer</span>
            </button>
          </div>
        </div>

        {/* Quick KPI Cards Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-8 pt-6 border-t border-white/10">
          <div className="bg-white/5 backdrop-blur-sm rounded-2xl p-4 border border-white/10">
            <div className="flex items-center justify-between text-neutral-400 text-xs font-bold uppercase tracking-wider mb-1">
              <span>Tracked Patrons</span>
              <Users className="w-4 h-4 text-neutral-400" />
            </div>
            <div className="text-2xl font-bold text-white font-mono">{totalTracked}</div>
            <div className="text-[11px] text-emerald-400 mt-1 flex items-center gap-1">
              <TrendingUp className="w-3 h-3" />
              <span>100% Active Logging</span>
            </div>
          </div>

          <div className="bg-white/5 backdrop-blur-sm rounded-2xl p-4 border border-white/10">
            <div className="flex items-center justify-between text-neutral-400 text-xs font-bold uppercase tracking-wider mb-1">
              <span>Catalog Views Logged</span>
              <Eye className="w-4 h-4 text-neutral-400" />
            </div>
            <div className="text-2xl font-bold text-white font-mono">{totalViewsLogged}</div>
            <div className="text-[11px] text-neutral-300 mt-1">
              Across all boutique categories
            </div>
          </div>

          <div className="bg-white/5 backdrop-blur-sm rounded-2xl p-4 border border-white/10">
            <div className="flex items-center justify-between text-neutral-400 text-xs font-bold uppercase tracking-wider mb-1">
              <span>High-Intent Shoppers</span>
              <Sparkles className="w-4 h-4 text-amber-300" />
            </div>
            <div className="text-2xl font-bold text-amber-300 font-mono">{highIntentCount}</div>
            <div className="text-[11px] text-amber-200/80 mt-1">
              {vipCount} VIP Couture Patrons
            </div>
          </div>

          <div className="bg-white/5 backdrop-blur-sm rounded-2xl p-4 border border-white/10">
            <div className="flex items-center justify-between text-neutral-400 text-xs font-bold uppercase tracking-wider mb-1">
              <span>Exclusive Offers Sent</span>
              <Tag className="w-4 h-4 text-emerald-400" />
            </div>
            <div className="text-2xl font-bold text-emerald-400 font-mono">{totalExclusiveDispatched}</div>
            <div className="text-[11px] text-emerald-300/80 mt-1">
              1-on-1 Targeted Campaigns
            </div>
          </div>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4 bg-[#fbf9f4] p-4 rounded-2xl border border-black/10">
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-neutral-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by patron name, email, or viewed luxury item..."
            className="w-full pl-10 pr-4 py-2.5 bg-white rounded-xl border border-black/10 text-xs font-medium text-black placeholder-neutral-400 focus:outline-none focus:border-black transition-colors"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-black text-xs"
            >
              Clear
            </button>
          )}
        </div>

        <div className="flex items-center gap-2 overflow-x-auto pb-1 sm:pb-0">
          <Filter className="w-3.5 h-3.5 text-neutral-400 shrink-0 ml-1" />
          {(['ALL', 'VIP Customer', 'High Intent', 'Window Shopper'] as const).map((cat) => (
            <button
              key={cat}
              onClick={() => setFilterCategory(cat)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all cursor-pointer ${
                filterCategory === cat
                  ? 'bg-black text-white shadow-sm'
                  : 'bg-white text-neutral-600 hover:text-black border border-black/10'
              }`}
            >
              {cat === 'ALL' ? 'All Patrons' : cat}
            </button>
          ))}
        </div>
      </div>

      {/* User Activity Cards List */}
      <div className="space-y-6">
        {filteredUsers.length === 0 ? (
          <div className="bg-white rounded-3xl p-12 text-center border border-black/10">
            <Users className="w-12 h-12 text-neutral-300 mx-auto mb-3" />
            <h3 className="text-base font-bold text-black font-sans">No Patrons Found</h3>
            <p className="text-xs text-neutral-500 max-w-sm mx-auto mt-1">
              No patron activity records match your current search query or filter.
            </p>
          </div>
        ) : (
          filteredUsers.map((user) => {
            const hasPurchased = user.purchasedItems.length > 0;
            const hasViewed = user.viewedItems.length > 0;
            const mostViewedItem = [...user.viewedItems].sort((a, b) => b.count - a.count)[0];

            return (
              <div 
                key={user.userId}
                className="bg-white rounded-3xl p-6 sm:p-7 border border-black/10 shadow-xs hover:shadow-md transition-all space-y-6"
              >
                {/* Header: User Profile Meta & Status */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-5 border-b border-black/5">
                  <div className="flex items-start gap-3.5">
                    <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-neutral-900 to-neutral-700 text-white flex items-center justify-center font-bold text-base font-sans shadow-sm shrink-0">
                      {user.userName.charAt(0)}
                    </div>
                    <div>
                      <div className="flex items-center gap-2 flex-wrap">
                        <h3 className="text-base sm:text-lg font-bold text-black font-sans">
                          {user.userName}
                        </h3>
                        <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                          user.intentCategory === 'VIP Customer'
                            ? 'bg-amber-100 text-amber-900 border border-amber-300'
                            : user.intentCategory === 'High Intent'
                            ? 'bg-emerald-100 text-emerald-900 border border-emerald-300'
                            : 'bg-neutral-100 text-neutral-700 border border-neutral-200'
                        }`}>
                          {user.intentCategory}
                        </span>
                      </div>
                      <div className="flex items-center gap-3 text-xs text-neutral-500 mt-1 flex-wrap font-sans">
                        <span>{user.userEmail}</span>
                        {user.userPhone && (
                          <>
                            <span>•</span>
                            <span>{user.userPhone}</span>
                          </>
                        )}
                        <span>•</span>
                        <span className="flex items-center gap-1 text-neutral-600">
                          <Clock className="w-3 h-3" />
                          Last active {Math.max(1, Math.round((Date.now() - user.lastActiveAt) / 60000))}m ago
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 self-start sm:self-center">
                    <div className="text-right hidden sm:block">
                      <span className="text-[10px] uppercase font-bold tracking-wider text-neutral-400 block">
                        Lifetime Spend
                      </span>
                      <span className="text-sm font-bold text-black font-mono">
                        ₹{user.totalSpentINR.toLocaleString('en-IN')}
                      </span>
                    </div>

                    <button
                      onClick={() => handleOpenCreateOffer(user)}
                      className="px-4 py-2.5 bg-black hover:bg-[#D9531E] text-white rounded-xl text-xs font-bold uppercase tracking-wider flex items-center gap-2 transition-all cursor-pointer shadow-sm"
                    >
                      <Gift className="w-3.5 h-3.5" />
                      <span>Create Exclusive Offer</span>
                    </button>
                  </div>
                </div>

                {/* AI Behavioral Insight Box */}
                {user.aiBehavioralInsight && (
                  <div className="p-4 bg-[#fbf9f4] rounded-2xl border border-amber-900/10 flex items-start gap-3">
                    <div className="p-2 rounded-xl bg-amber-400/20 text-[#a83900] shrink-0 mt-0.5">
                      <Sparkles className="w-4 h-4" />
                    </div>
                    <div className="space-y-1">
                      <span className="text-[10px] uppercase tracking-widest font-bold text-[#a83900] block">
                        AI Behavioral & Affinity Assessment
                      </span>
                      <p className="text-xs text-neutral-700 leading-relaxed font-sans italic">
                        "{user.aiBehavioralInsight}"
                      </p>
                    </div>
                  </div>
                )}

                {/* Activity Dual Columns: Viewed vs Purchased */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  
                  {/* Viewed Items History */}
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-neutral-800">
                        <Eye className="w-3.5 h-3.5 text-neutral-500" />
                        <span>Recently Viewed Pieces ({user.viewedItems.length})</span>
                      </div>
                      <span className="text-[11px] text-neutral-400">
                        Total Views: {user.viewedItems.reduce((acc, i) => acc + i.count, 0)}
                      </span>
                    </div>

                    {user.viewedItems.length === 0 ? (
                      <div className="p-4 rounded-2xl bg-neutral-50 border border-neutral-100 text-xs text-neutral-400 italic">
                        No product views recorded yet.
                      </div>
                    ) : (
                      <div className="space-y-2 max-h-56 overflow-y-auto pr-1">
                        {user.viewedItems.map((item) => (
                          <div
                            key={item.productId}
                            className="p-3 bg-[#faf9f6] rounded-2xl border border-black/5 flex items-center justify-between gap-3 hover:bg-[#f2efe9] transition-colors"
                          >
                            <div className="flex items-center gap-3 min-w-0">
                              {item.imageUrl ? (
                                <img
                                  src={item.imageUrl}
                                  alt={item.productName}
                                  referrerPolicy="no-referrer"
                                  className="w-10 h-12 object-cover rounded-lg border border-black/10 shrink-0"
                                />
                              ) : (
                                <div className="w-10 h-12 bg-neutral-200 rounded-lg flex items-center justify-center text-[10px] text-neutral-500 shrink-0 font-mono">
                                  SKU
                                </div>
                              )}
                              <div className="min-w-0">
                                <h4 className="text-xs font-bold text-black truncate font-sans">
                                  {item.productName}
                                </h4>
                                <div className="flex items-center gap-2 text-[11px] text-neutral-500 mt-0.5">
                                  <span className="font-mono font-medium text-black">
                                    ₹{item.price.toLocaleString('en-IN')}
                                  </span>
                                  <span>•</span>
                                  <span>{item.category}</span>
                                </div>
                              </div>
                            </div>

                            <div className="text-right shrink-0">
                              <span className="px-2 py-0.5 rounded-md bg-amber-100 text-amber-900 text-[10px] font-bold font-mono">
                                {item.count}x Viewed
                              </span>
                              <span className="text-[10px] text-neutral-400 block mt-1">
                                {Math.max(1, Math.round((Date.now() - item.viewedAt) / 60000))}m ago
                              </span>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Purchased Items History */}
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-neutral-800">
                        <ShoppingBag className="w-3.5 h-3.5 text-neutral-500" />
                        <span>Order & Purchase History ({user.purchasedItems.length})</span>
                      </div>
                      <span className="text-[11px] font-bold font-mono text-emerald-700">
                        ₹{user.totalSpentINR.toLocaleString('en-IN')} Total
                      </span>
                    </div>

                    {user.purchasedItems.length === 0 ? (
                      <div className="p-4 rounded-2xl bg-amber-50/50 border border-amber-200/60 text-xs text-amber-900/80 flex items-center justify-between gap-3">
                        <div className="flex items-center gap-2">
                          <AlertCircle className="w-4 h-4 text-amber-600 shrink-0" />
                          <span>No orders yet — high opportunity for Cart Recovery discount!</span>
                        </div>
                        <button
                          onClick={() => handleOpenCreateOffer(user)}
                          className="text-[11px] font-bold text-[#a83900] underline uppercase tracking-wider cursor-pointer whitespace-nowrap"
                        >
                          Target Now
                        </button>
                      </div>
                    ) : (
                      <div className="space-y-2 max-h-56 overflow-y-auto pr-1">
                        {user.purchasedItems.map((item, idx) => (
                          <div
                            key={`${item.orderId}-${idx}`}
                            className="p-3 bg-emerald-50/40 rounded-2xl border border-emerald-200/50 flex items-center justify-between gap-3"
                          >
                            <div className="flex items-center gap-3 min-w-0">
                              {item.imageUrl ? (
                                <img
                                  src={item.imageUrl}
                                  alt={item.productName}
                                  referrerPolicy="no-referrer"
                                  className="w-10 h-12 object-cover rounded-lg border border-black/10 shrink-0"
                                />
                              ) : (
                                <div className="w-10 h-12 bg-emerald-100 rounded-lg flex items-center justify-center text-[10px] text-emerald-700 shrink-0 font-mono">
                                  ORD
                                </div>
                              )}
                              <div className="min-w-0">
                                <div className="flex items-center gap-2">
                                  <h4 className="text-xs font-bold text-black truncate font-sans">
                                    {item.productName}
                                  </h4>
                                  <span className="text-[10px] font-bold font-mono text-emerald-800 bg-emerald-100 px-1.5 py-0.2 rounded">
                                    #{item.orderNumber}
                                  </span>
                                </div>
                                <div className="text-[11px] text-neutral-500 mt-0.5 font-mono">
                                  ₹{item.price.toLocaleString('en-IN')} (Qty: {item.quantity})
                                </div>
                              </div>
                            </div>

                            <div className="text-right shrink-0">
                              <span className="px-2 py-0.5 rounded-md bg-emerald-100 text-emerald-900 text-[10px] font-bold uppercase">
                                Verified
                              </span>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                </div>

                {/* Received Exclusive Offers History */}
                {user.exclusiveOffersReceived.length > 0 && (
                  <div className="pt-4 border-t border-black/5">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-xs font-bold uppercase tracking-wider text-neutral-500 flex items-center gap-1.5">
                        <Tag className="w-3 h-3 text-[#a83900]" />
                        <span>Exclusive Offers Dispatched to Patron ({user.exclusiveOffersReceived.length})</span>
                      </span>
                    </div>

                    <div className="flex flex-wrap gap-2">
                      {user.exclusiveOffersReceived.map((offer, idx) => (
                        <div
                          key={idx}
                          className="px-3 py-1.5 rounded-xl bg-amber-50 border border-amber-200 text-xs flex items-center gap-2 text-amber-900"
                        >
                          <span className="font-bold">{offer.title}</span>
                          <span className="font-mono bg-white px-1.5 py-0.5 rounded border border-amber-300 font-bold text-black">
                            {offer.promoCode} ({offer.discountPercent}% OFF)
                          </span>
                          <span className="text-[10px] text-amber-700">
                            {offer.status}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

              </div>
            );
          })
        )}
      </div>

      {/* CREATE EXCLUSIVE OFFER MODAL */}
      {isOfferModalOpen && offerUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-fade-in">
          <div className="bg-white w-full max-w-2xl rounded-3xl shadow-2xl border border-black/10 max-h-[90vh] flex flex-col overflow-hidden">
            
            {/* Modal Header */}
            <div className="p-6 bg-gradient-to-r from-neutral-900 via-neutral-800 to-neutral-950 text-white flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2.5 rounded-2xl bg-amber-400/20 text-amber-300">
                  <Gift className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-lg font-bold font-sans">Create Exclusive 1-on-1 Offer</h3>
                  <p className="text-xs text-neutral-300">
                    Targeted directly to <span className="text-amber-300 font-bold">{offerUser.userName}</span> ({offerUser.userEmail})
                  </p>
                </div>
              </div>
              <button
                onClick={() => setIsOfferModalOpen(false)}
                className="p-2 rounded-xl text-neutral-400 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-6 overflow-y-auto flex-1 space-y-6">
              {justLaunchedCampaign ? (
                /* Success Confirmation State */
                <div className="text-center py-6 space-y-4">
                  <div className="w-14 h-14 bg-emerald-100 text-emerald-700 rounded-full flex items-center justify-center mx-auto shadow-inner">
                    <CheckCircle2 className="w-8 h-8" />
                  </div>
                  <div className="space-y-1">
                    <h4 className="text-xl font-bold text-black font-sans">
                      Exclusive Offer Campaign Dispatched!
                    </h4>
                    <p className="text-xs text-neutral-600 max-w-md mx-auto">
                      The personalized invitation for <span className="font-bold text-black">{offerUser.userName}</span> is now active across the storefront banner and Razorpay checkout engine.
                    </p>
                  </div>

                  {/* Campaign Card Details */}
                  <div className="p-5 bg-[#fbf9f4] rounded-2xl border border-amber-900/10 text-left space-y-3 max-w-lg mx-auto font-sans">
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-neutral-500 uppercase font-bold">Promo Code</span>
                      <span className="font-mono text-sm font-bold bg-white px-2.5 py-1 rounded-lg border border-black/10 text-black">
                        {justLaunchedCampaign.promoCode}
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-neutral-500 uppercase font-bold">Privilege Rate</span>
                      <span className="text-sm font-bold text-emerald-700">
                        {justLaunchedCampaign.discountPercent}% OFF
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-neutral-500 uppercase font-bold">Recipient</span>
                      <span className="text-xs font-medium text-black">
                        {offerUser.userName} ({offerUser.userEmail})
                      </span>
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex items-center justify-center gap-3 pt-4">
                    <button
                      onClick={() => handleCopyOfferLink(justLaunchedCampaign.promoCode || promoCode)}
                      className="px-4 py-2.5 bg-neutral-100 hover:bg-neutral-200 text-black font-bold text-xs uppercase tracking-wider rounded-xl transition-all flex items-center gap-2 cursor-pointer"
                    >
                      {isCopiedLink ? <Check className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4" />}
                      <span>{isCopiedLink ? 'Direct Link Copied!' : 'Copy Direct Patron Link'}</span>
                    </button>

                    <button
                      onClick={() => {
                        setIsOfferModalOpen(false);
                        if (onSwitchToCampaignsTab) {
                          onSwitchToCampaignsTab();
                        }
                      }}
                      className="px-5 py-2.5 bg-black hover:bg-[#D9531E] text-white font-bold text-xs uppercase tracking-wider rounded-xl transition-all flex items-center gap-2 cursor-pointer shadow-sm"
                    >
                      <span>View in Campaigns Dashboard</span>
                      <ChevronRight className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ) : (
                /* Form State */
                <form onSubmit={handleLaunchOffer} className="space-y-5">
                  
                  {/* Target User Browsing Summary */}
                  <div className="p-4 bg-[#fbf9f4] rounded-2xl border border-black/5 space-y-2">
                    <span className="text-[10px] uppercase tracking-widest font-bold text-neutral-500 block">
                      History Highlights for this Patron
                    </span>
                    <div className="flex items-center gap-2 flex-wrap text-xs">
                      {offerUser.viewedItems.map(item => (
                        <span key={item.productId} className="bg-white px-2 py-1 rounded-md border border-black/10 font-medium">
                          👁️ {item.productName} ({item.count}x)
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* Campaign Title */}
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-neutral-800 uppercase tracking-wider">
                      Campaign Title
                    </label>
                    <input
                      type="text"
                      value={offerTitle}
                      onChange={(e) => setOfferTitle(e.target.value)}
                      required
                      className="w-full px-3.5 py-2.5 rounded-xl border border-black/10 text-xs font-medium text-black focus:outline-none focus:border-black"
                    />
                  </div>

                  {/* Discount & Promo Code Row */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <label className="text-xs font-bold text-neutral-800 uppercase tracking-wider flex items-center justify-between">
                        <span>Discount Privilege</span>
                        <span className="text-[#a83900] font-mono">{discountPercent}%</span>
                      </label>
                      <div className="flex items-center gap-2">
                        {[10, 15, 20, 25].map(pct => (
                          <button
                            key={pct}
                            type="button"
                            onClick={() => {
                              setDiscountPercent(pct);
                              const firstName = offerUser.userName.split(' ')[0] || 'VIP';
                              setPromoCode(`VIP-${firstName.toUpperCase()}-${pct}`);
                            }}
                            className={`flex-1 py-2 text-xs font-bold rounded-xl transition-all cursor-pointer ${
                              discountPercent === pct
                                ? 'bg-black text-white'
                                : 'bg-neutral-100 text-neutral-700 hover:bg-neutral-200'
                            }`}
                          >
                            {pct}%
                          </button>
                        ))}
                      </div>
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-xs font-bold text-neutral-800 uppercase tracking-wider">
                        Promo Code
                      </label>
                      <input
                        type="text"
                        value={promoCode}
                        onChange={(e) => setPromoCode(e.target.value.toUpperCase())}
                        required
                        className="w-full px-3.5 py-2.5 rounded-xl border border-black/10 text-xs font-mono font-bold text-black uppercase focus:outline-none focus:border-black"
                      />
                    </div>
                  </div>

                  {/* Target Pieces Selection */}
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-neutral-800 uppercase tracking-wider block">
                      Targeted Pieces from Catalog
                    </label>
                    <div className="grid grid-cols-2 gap-2 max-h-36 overflow-y-auto p-2 bg-[#faf9f6] rounded-xl border border-black/5">
                      {catalog.slice(0, 8).map(prod => {
                        const isSelected = selectedProductIds.includes(prod.id);
                        return (
                          <button
                            key={prod.id}
                            type="button"
                            onClick={() => {
                              setSelectedProductIds(prev => 
                                isSelected ? prev.filter(id => id !== prod.id) : [...prev, prod.id]
                              );
                            }}
                            className={`p-2 rounded-xl text-left text-xs flex items-center gap-2 transition-all cursor-pointer border ${
                              isSelected
                                ? 'bg-amber-100/70 border-amber-400 font-bold text-black'
                                : 'bg-white border-black/5 text-neutral-700 hover:border-black/20'
                            }`}
                          >
                            <span className="w-4 h-4 rounded-full border border-black/30 flex items-center justify-center text-[10px] shrink-0">
                              {isSelected ? '✓' : ''}
                            </span>
                            <span className="truncate">{prod.name}</span>
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* Personalized Email Subject & Preview */}
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-neutral-800 uppercase tracking-wider">
                      VIP Email Subject
                    </label>
                    <input
                      type="text"
                      value={emailSubject}
                      onChange={(e) => setEmailSubject(e.target.value)}
                      required
                      className="w-full px-3.5 py-2.5 rounded-xl border border-black/10 text-xs font-medium text-black focus:outline-none focus:border-black"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-neutral-800 uppercase tracking-wider">
                      Personalized Message Body
                    </label>
                    <textarea
                      rows={4}
                      value={emailBody}
                      onChange={(e) => setEmailBody(e.target.value)}
                      required
                      className="w-full px-3.5 py-2.5 rounded-xl border border-black/10 text-xs font-sans text-black leading-relaxed focus:outline-none focus:border-black"
                    />
                  </div>

                  {/* Modal Footer Actions */}
                  <div className="flex items-center justify-end gap-3 pt-4 border-t border-black/10">
                    <button
                      type="button"
                      onClick={() => setIsOfferModalOpen(false)}
                      className="px-4 py-2.5 text-xs font-bold text-neutral-600 hover:text-black uppercase tracking-wider cursor-pointer"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="px-6 py-2.5 bg-black hover:bg-[#D9531E] text-white rounded-xl text-xs font-bold uppercase tracking-wider transition-all flex items-center gap-2 cursor-pointer shadow-md"
                    >
                      <Send className="w-3.5 h-3.5" />
                      <span>Launch Exclusive Offer</span>
                    </button>
                  </div>

                </form>
              )}
            </div>

          </div>
        </div>
      )}

    </div>
  );
};
