import React from 'react';
import { X, Trash2, ShoppingBag, Heart, ArrowRight } from 'lucide-react';
import { Product, Currency } from '../types';
import { CURRENCIES } from '../data/products';

interface WishlistDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  wishlistProducts: Product[];
  currency: Currency;
  onRemoveWishlist: (product: Product) => void;
  onMoveToCart: (product: Product) => void;
}

export const WishlistDrawer: React.FC<WishlistDrawerProps> = ({
  isOpen,
  onClose,
  wishlistProducts,
  currency,
  onRemoveWishlist,
  onMoveToCart,
}) => {
  if (!isOpen) return null;
  const cur = CURRENCIES[currency];

  return (
    <div
      id="wishlist-drawer-overlay"
      className="fixed inset-0 z-50 overflow-hidden bg-black/60 backdrop-blur-xs flex justify-end animate-fade-in"
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-md bg-[#F8F7F4] h-full shadow-2xl flex flex-col justify-between border-l border-[#121212]/10"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Drawer Header */}
        <div className="p-5 border-b border-[#121212]/10 bg-[#F8F7F4]/95 backdrop-blur-md flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Heart className="w-4 h-4 text-[#D9531E] fill-[#D9531E]" />
            <h2 className="font-serif text-xl font-light text-[#121212]">
              Saved Wishlist ({wishlistProducts.length})
            </h2>
          </div>
          <button
            id="close-wishlist-btn"
            onClick={onClose}
            className="p-1.5 hover:bg-black hover:text-white rounded-full transition-colors border border-neutral-300"
            aria-label="Close"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Wishlist Items Stream */}
        <div className="flex-1 overflow-y-auto p-5 space-y-4 custom-scrollbar">
          {wishlistProducts.length === 0 ? (
            <div className="py-20 text-center text-neutral-500">
              <Heart className="w-8 h-8 mx-auto mb-3 text-neutral-400 stroke-1" />
              <p className="font-serif text-lg font-light text-neutral-800 mb-1">
                Your wishlist is currently empty.
              </p>
              <p className="text-xs text-neutral-500 mb-4">
                Click the heart on any piece to save it to your personal curation.
              </p>
            </div>
          ) : (
            wishlistProducts.map((prod) => (
              <div
                key={prod.id}
                className="p-3 bg-white border border-neutral-200 flex space-x-3.5 items-center"
              >
                <img
                  src={prod.images?.[0] || prod.imageUrl || ''}
                  alt={prod.name}
                  className="w-16 h-20 object-cover flex-shrink-0"
                  referrerPolicy="no-referrer"
                />
                <div className="flex-1 min-w-0">
                  <div className="flex justify-between items-start">
                    <div>
                      <span className="text-[9px] uppercase tracking-widest text-neutral-500 truncate block">
                        {prod.designer}
                      </span>
                      <h4 className="text-xs font-medium text-neutral-900 truncate">
                        {prod.name}
                      </h4>
                    </div>
                    <button
                      onClick={() => onRemoveWishlist(prod)}
                      className="text-neutral-400 hover:text-red-600 p-1"
                      title="Remove"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  <div className="text-xs font-mono font-semibold text-neutral-900 my-1">
                    {cur.symbol}{Math.round(prod.price * cur.rate).toLocaleString()} {currency}
                  </div>

                  <button
                    onClick={() => onMoveToCart(prod)}
                    className="text-[11px] uppercase tracking-wider font-medium text-[#121212] hover:text-[#D9531E] flex items-center space-x-1 mt-2"
                  >
                    <ShoppingBag className="w-3 h-3" />
                    <span>Move to Bag</span>
                  </button>
                </div>
              </div>
            ))
          )}
        </div>

        {wishlistProducts.length > 0 && (
          <div className="p-5 bg-white border-t border-[#121212]/10">
            <button
              onClick={() => {
                wishlistProducts.forEach((p) => onMoveToCart(p));
                onClose();
              }}
              className="w-full py-3.5 bg-[#121212] hover:bg-[#D9531E] text-white text-xs uppercase tracking-[0.24em] font-medium transition-colors flex items-center justify-center space-x-2"
            >
              <span>Add All to Bag</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
