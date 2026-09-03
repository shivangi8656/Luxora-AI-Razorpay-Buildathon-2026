import React from 'react';
import { 
  AlertTriangle, 
  XCircle, 
  CheckCircle, 
  ArrowRight, 
  RefreshCw, 
  Sparkles, 
  X,
  FileSpreadsheet,
  Layers
} from 'lucide-react';
import { Product, Currency, CartItem } from '../types';
import { CURRENCIES } from '../data/products';
import { useAudit } from '../context/AuditContext';

interface PriceChangeModalProps {
  isOpen: boolean;
  item: CartItem;
  oldPriceUSD: number;
  newPriceUSD: number;
  currency: Currency;
  onApprove: () => void;
  onRejectRemove: () => void;
}

export const PriceChangeModal: React.FC<PriceChangeModalProps> = ({
  isOpen,
  item,
  oldPriceUSD,
  newPriceUSD,
  currency,
  onApprove,
  onRejectRemove,
}) => {
  const { addLog } = useAudit();
  const cur = CURRENCIES[currency];

  if (!isOpen) return null;

  const oldPrice = Math.round(oldPriceUSD * cur.rate);
  const newPrice = Math.round(newPriceUSD * cur.rate);
  const delta = newPrice - oldPrice;

  const handleApprove = () => {
    addLog(
      'USER_APPROVAL',
      'Buyer Approved Updated Price',
      `Buyer accepted updated price for ${item.product.name} (Old: ${cur.symbol}${oldPrice.toLocaleString()} → New: ${cur.symbol}${newPrice.toLocaleString()}).`,
      'success'
    );
    onApprove();
  };

  const handleReject = () => {
    addLog(
      'USER_APPROVAL',
      'Buyer Declined Price Increase',
      `Buyer declined price update of +${cur.symbol}${delta.toLocaleString()} on ${item.product.name}. Item removed from bag.`,
      'warning'
    );
    onRejectRemove();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="fixed inset-0 bg-neutral-900/60 backdrop-blur-sm" />
      
      <div className="relative w-full max-w-md bg-white rounded-2xl shadow-2xl border border-amber-300 p-6 z-10 space-y-4">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 rounded-full bg-amber-100 text-amber-800 flex items-center justify-center flex-shrink-0">
            <AlertTriangle className="w-5 h-5" />
          </div>
          <div>
            <span className="text-[10px] font-mono uppercase tracking-wider text-amber-800 font-bold">
              Graceful Failure: Price Verification
            </span>
            <h3 className="text-base font-serif font-semibold text-neutral-900">
              Live Atelier Price Update
            </h3>
          </div>
        </div>

        <p className="text-xs text-neutral-600 font-light leading-relaxed">
          Checkout was paused because the artisan price for <strong className="text-neutral-900">{item.product.name}</strong> was updated while in your bag. Explicit buyer approval is required.
        </p>

        <div className="p-3.5 rounded-xl bg-neutral-50 border border-neutral-200 space-y-2">
          <div className="flex justify-between text-xs">
            <span className="text-neutral-500">Original Bag Price:</span>
            <span className="line-through text-neutral-500 font-mono">
              {cur.symbol} {oldPrice.toLocaleString(currency === 'INR' ? 'en-IN' : 'en-US')}
            </span>
          </div>
          <div className="flex justify-between text-xs font-semibold">
            <span className="text-neutral-900">Updated Current Price:</span>
            <span className="text-emerald-700 font-mono text-sm">
              {cur.symbol} {newPrice.toLocaleString(currency === 'INR' ? 'en-IN' : 'en-US')}
            </span>
          </div>
          <div className="text-[11px] text-amber-800 font-medium text-right">
            Difference: +{cur.symbol} {delta.toLocaleString(currency === 'INR' ? 'en-IN' : 'en-US')}
          </div>
        </div>

        <div className="flex items-center space-x-3 pt-2">
          <button
            onClick={handleReject}
            className="flex-1 py-2.5 rounded-xl border border-neutral-300 text-xs font-medium text-neutral-700 hover:bg-neutral-100 transition-colors"
          >
            Remove from Bag
          </button>
          <button
            onClick={handleApprove}
            className="flex-1 py-2.5 rounded-xl bg-neutral-900 hover:bg-neutral-800 text-white text-xs font-medium transition-colors shadow-xs"
          >
            Approve & Proceed
          </button>
        </div>
      </div>
    </div>
  );
};

interface OutOfStockModalProps {
  isOpen: boolean;
  outOfStockItem: CartItem;
  alternativeProduct?: Product;
  currency: Currency;
  onReplaceAlternative: (alt: Product) => void;
  onRemoveAndPreserveRemaining: () => void;
}

export const OutOfStockModal: React.FC<OutOfStockModalProps> = ({
  isOpen,
  outOfStockItem,
  alternativeProduct,
  currency,
  onReplaceAlternative,
  onRemoveAndPreserveRemaining,
}) => {
  const { addLog } = useAudit();
  const cur = CURRENCIES[currency];

  if (!isOpen) return null;

  const handlePreserveRemaining = () => {
    addLog(
      'CART',
      'Out of Stock Handled: Remaining Cart Preserved',
      `Blocked ${outOfStockItem.product.name} due to zero inventory. Remaining bag items preserved safely.`,
      'warning'
    );
    onRemoveAndPreserveRemaining();
  };

  const handleSwapAlternative = () => {
    if (alternativeProduct) {
      addLog(
        'RECOMMENDATION',
        'Buyer Swapped to AI In-Stock Alternative',
        `Replaced out-of-stock piece with ${alternativeProduct.name}.`,
        'success'
      );
      onReplaceAlternative(alternativeProduct);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="fixed inset-0 bg-neutral-900/60 backdrop-blur-sm" />
      
      <div className="relative w-full max-w-md bg-white rounded-2xl shadow-2xl border border-rose-300 p-6 z-10 space-y-4">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 rounded-full bg-rose-100 text-rose-800 flex items-center justify-center flex-shrink-0">
            <XCircle className="w-5 h-5" />
          </div>
          <div>
            <span className="text-[10px] font-mono uppercase tracking-wider text-rose-800 font-bold">
              Graceful Failure: Stock Check
            </span>
            <h3 className="text-base font-serif font-semibold text-neutral-900">
              Piece Currently Reserved / Out of Stock
            </h3>
          </div>
        </div>

        <p className="text-xs text-neutral-600 font-light leading-relaxed">
          <strong className="text-neutral-900">{outOfStockItem.product.name}</strong> just reached zero inventory in the atelier boutique. 
          <span className="text-emerald-700 font-medium ml-1">
            All your other bag items remain 100% preserved.
          </span>
        </p>

        {alternativeProduct && (
          <div className="p-3 rounded-xl bg-amber-50/70 border border-amber-200/80 space-y-2">
            <span className="text-[10px] uppercase font-bold text-amber-900 font-mono block">
              Suggested In-Stock Haute Alternative:
            </span>
            <div className="flex items-center space-x-3">
              <img 
                src={alternativeProduct.images?.[0] || alternativeProduct.imageUrl || ''} 
                alt={alternativeProduct.name} 
                className="w-12 h-14 object-cover rounded-md flex-shrink-0"
              />
              <div className="text-xs space-y-0.5 flex-1">
                <p className="font-serif font-semibold text-neutral-900">{alternativeProduct.name}</p>
                <p className="font-mono text-neutral-700">
                  {cur.symbol} {Math.round(alternativeProduct.price * cur.rate).toLocaleString()}
                </p>
                <span className="text-[10px] text-emerald-700 font-medium">In Stock ({alternativeProduct.stockCount || 5} units)</span>
              </div>
            </div>
            <button
              onClick={handleSwapAlternative}
              className="w-full py-1.5 rounded-lg bg-amber-900 hover:bg-amber-800 text-white text-xs font-medium transition-colors"
            >
              Replace with In-Stock Alternative
            </button>
          </div>
        )}

        <div className="pt-2">
          <button
            onClick={handlePreserveRemaining}
            className="w-full py-2.5 rounded-xl border border-neutral-300 text-xs font-medium text-neutral-700 hover:bg-neutral-100 transition-colors"
          >
            Remove Sold Out Item & Keep Rest of Bag
          </button>
        </div>
      </div>
    </div>
  );
};
