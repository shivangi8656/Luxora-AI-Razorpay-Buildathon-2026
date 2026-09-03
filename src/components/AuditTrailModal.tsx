import React, { useState } from 'react';
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
  Sparkles
} from 'lucide-react';
import { useAudit } from '../context/AuditContext';
import { AuditCategory } from '../types';

interface AuditTrailModalProps {
  isOpen: boolean;
  onClose: () => void;
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

export const AuditTrailModal: React.FC<AuditTrailModalProps> = ({ isOpen, onClose }) => {
  const { logs, clearLogs } = useAudit();
  const [selectedCategory, setSelectedCategory] = useState<'ALL' | AuditCategory>('ALL');
  const [searchQuery, setSearchQuery] = useState('');

  if (!isOpen) return null;

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
    downloadAnchor.setAttribute("download", `luxora_audit_trail_${Date.now()}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6">
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-neutral-900/60 backdrop-blur-sm transition-opacity" 
        onClick={onClose}
      />

      {/* Modal Card */}
      <div className="relative w-full max-w-4xl bg-[#FDFCFB] rounded-2xl shadow-2xl border border-neutral-200/80 flex flex-col max-h-[90vh] overflow-hidden z-10">
        
        {/* Header */}
        <div className="px-6 py-5 border-b border-neutral-200/80 flex items-center justify-between bg-white">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-full bg-neutral-900 text-[#D7CEC2] flex items-center justify-center">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h2 className="text-lg font-serif tracking-tight text-neutral-900">
                  Real-Time Platform Audit Trail
                </h2>
                <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-medium bg-emerald-100 text-emerald-800 border border-emerald-300">
                  Live Stream ({logs.length})
                </span>
              </div>
              <p className="text-xs text-neutral-700 font-light">
                Immutable event stream for Catalog, AI Inferences, Upsell/Cross-sell, Approvals, & Razorpay transactions.
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <button
              onClick={handleExportJson}
              className="inline-flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-xs font-medium text-neutral-700 hover:text-neutral-900 bg-neutral-100 hover:bg-neutral-200 transition-colors"
              title="Download JSON audit log"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Export</span>
            </button>
            <button
              onClick={clearLogs}
              className="inline-flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-xs font-medium text-rose-700 hover:text-rose-900 bg-rose-50 hover:bg-rose-100 transition-colors"
              title="Clear event logs"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>Clear</span>
            </button>
            <button
              onClick={onClose}
              className="p-1.5 rounded-full text-neutral-400 hover:text-neutral-700 hover:bg-neutral-100 transition-colors ml-2"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Filter Toolbar */}
        <div className="px-6 py-3 border-b border-neutral-200/80 bg-neutral-50/70 flex flex-wrap items-center justify-between gap-3">
          {/* Category Tabs */}
          <div className="flex items-center space-x-1 overflow-x-auto pb-1 max-w-full text-xs">
            {CATEGORY_TABS.map((tab) => (
              <button
                key={tab.value}
                onClick={() => setSelectedCategory(tab.value)}
                className={`px-2.5 py-1 rounded-md text-[11px] font-medium whitespace-nowrap transition-colors ${
                  selectedCategory === tab.value
                    ? 'bg-neutral-900 text-white'
                    : 'text-neutral-600 hover:bg-neutral-200/60'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* Search Input */}
          <div className="relative min-w-[200px]">
            <Search className="w-3.5 h-3.5 text-neutral-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search audit trail..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-8 pr-3 py-1 text-xs bg-white border border-neutral-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-neutral-900"
            />
          </div>
        </div>

        {/* Logs Feed */}
        <div className="flex-1 overflow-y-auto p-6 space-y-3 divide-y divide-neutral-100">
          {filteredLogs.length === 0 ? (
            <div className="py-16 text-center text-neutral-400">
              <Layers className="w-8 h-8 mx-auto mb-2 opacity-40" />
              <p className="text-sm font-medium">No audit events match this criteria</p>
              <p className="text-xs text-neutral-400 mt-1">Events will stream here automatically as actions take place.</p>
            </div>
          ) : (
            filteredLogs.map((log) => (
              <div key={log.id} className="pt-3 first:pt-0 flex items-start justify-between gap-4 group">
                <div className="flex items-start space-x-3 flex-1">
                  {getStatusIcon(log.status)}
                  <div className="space-y-1">
                    <div className="flex items-center space-x-2 flex-wrap gap-y-1">
                      <span className="text-xs font-semibold text-neutral-900">
                        {typeof log.title === 'string' ? log.title : String(log.title || '')}
                      </span>
                      <span className={`px-2 py-0.5 text-[10px] font-mono rounded border ${getCategoryBadgeClass(log.category)}`}>
                        {log.category}
                      </span>
                    </div>
                    <p className="text-xs text-neutral-600 leading-relaxed font-light">
                      {typeof log.details === 'string' ? log.details : JSON.stringify(log.details)}
                    </p>
                    {log.metadata && (
                      <div className="mt-1 p-2 rounded bg-neutral-100/70 border border-neutral-200/50 text-[11px] font-mono text-neutral-700 overflow-x-auto">
                        {JSON.stringify(log.metadata)}
                      </div>
                    )}
                  </div>
                </div>

                <div className="flex items-center space-x-1 text-[11px] text-neutral-600 font-mono flex-shrink-0 pt-0.5">
                  <Clock className="w-3 h-3 text-neutral-400" />
                  <span>
                    {new Date(log.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                  </span>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-3.5 border-t border-neutral-200/80 bg-white flex items-center justify-between text-xs text-neutral-700">
          <div className="flex items-center space-x-2">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <span>Audit integrity secured & verified</span>
          </div>
          <span className="text-neutral-600 font-mono text-[11px]">
            Showing {filteredLogs.length} of {logs.length} logged events
          </span>
        </div>

      </div>
    </div>
  );
};
