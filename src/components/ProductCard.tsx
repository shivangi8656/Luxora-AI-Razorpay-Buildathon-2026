import React, { useState } from 'react';
import { Heart, Plus, Eye, Check, Bell, AlertCircle, ShoppingBag, CreditCard } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { Product, Currency } from '../types';

interface ProductCardProps {
  product: Product;
  currency?: Currency;
  isWishlisted: boolean;
  onToggleWishlist: (product: Product) => void;
  onSelectProduct: (product: Product) => void;
  onQuickAdd: (product: Product, size: string) => void;
  onBuyNow?: (product: Product, size: string) => void;
}

export const ProductCard: React.FC<ProductCardProps> = ({
  product,
  isWishlisted,
  onToggleWishlist,
  onSelectProduct,
  onQuickAdd,
  onBuyNow,
}) => {
  const [isHovered, setIsHovered] = useState(false);
  const [selectedColorIndex, setSelectedColorIndex] = useState(0);
  const [quickSizeMenu, setQuickSizeMenu] = useState(false);
  const [justAdded, setJustAdded] = useState(false);
  const [notified, setNotified] = useState(false);

  const isOutOfStock = product.stock === 0 || product.availability === 'Out of Stock';
  const isOnlyOneLeft = product.stock === 1;

  const handleQuickAddClick = (size: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (isOutOfStock) return;
    onQuickAdd(product, size);
    setJustAdded(true);
    setQuickSizeMenu(false);
    setTimeout(() => setJustAdded(false), 1800);
  };

  const handleBuyNowClick = (size: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (isOutOfStock) return;
    if (onBuyNow) {
      onBuyNow(product, size);
    } else {
      onQuickAdd(product, size);
    }
  };

  const handleNotifyMe = (e: React.MouseEvent) => {
    e.stopPropagation();
    setNotified(true);
    setTimeout(() => setNotified(false), 3000);
  };

  return (
    <motion.div
      id={`product-card-${product.id}`}
      initial={{ opacity: 0, y: 15 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-40px" }}
      transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
      whileHover={{ y: -4 }}
      className="group relative flex flex-col cursor-pointer transition-all duration-300 font-['Archivo_Narrow'] bg-white/40 p-2.5 rounded-3xl border border-black/5 hover:border-black/15 hover:shadow-md"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => {
        setIsHovered(false);
        setQuickSizeMenu(false);
      }}
      onClick={() => onSelectProduct(product)}
    >
      {/* Image Container with rounded-2xl corners */}
      <div className="relative aspect-3/4 w-full overflow-hidden bg-[#eae8e3] rounded-2xl mb-3 shadow-2xs">
        <img
          src={product.images?.[selectedColorIndex] || product.images?.[0] || product.imageUrl || ''}
          alt={product.name}
          className={`w-full h-full object-cover object-center transition-transform duration-700 ease-out group-hover:scale-105 ${
            isHovered && product.images?.[1] ? 'opacity-0' : 'opacity-100'
          } ${isOutOfStock ? 'grayscale-40 opacity-80' : ''}`}
          referrerPolicy="no-referrer"
          loading="lazy"
        />

        {product.images?.[1] && (
          <img
            src={product.images[1]}
            alt={`${product.name} alternate angle`}
            className={`absolute inset-0 w-full h-full object-cover object-center transition-all duration-700 ease-out ${
              isHovered ? 'opacity-100 scale-105' : 'opacity-0 scale-100'
            } ${isOutOfStock ? 'grayscale-40 opacity-80' : ''}`}
            referrerPolicy="no-referrer"
            loading="lazy"
          />
        )}

        {/* Minimal Tags with rounded-full pill design */}
        <div className="absolute top-3 left-3 flex flex-col gap-1 z-10">
          {isOutOfStock ? (
            <span className="bg-rose-700 text-white text-[9px] uppercase tracking-[0.2em] font-bold px-2.5 py-0.5 rounded-full shadow-2xs">
              Out of Stock
            </span>
          ) : isOnlyOneLeft ? (
            <span className="bg-amber-600 text-white text-[9px] uppercase tracking-[0.18em] font-bold px-2.5 py-0.5 rounded-full shadow-2xs animate-pulse">
              Only 1 left in stock
            </span>
          ) : (
            <>
              {product.isEditorialPick && (
                <span className="bg-black text-white text-[9px] uppercase tracking-[0.2em] font-semibold px-2.5 py-0.5 rounded-full shadow-2xs">
                  Editorial
                </span>
              )}
              {product.occasion && (
                <span className="bg-white/95 backdrop-blur-md text-black border border-black/10 text-[9px] uppercase tracking-[0.2em] font-semibold px-2.5 py-0.5 rounded-full shadow-2xs">
                  {product.occasion}
                </span>
              )}
            </>
          )}
        </div>

        {/* Wishlist Button with rounded-full & motion */}
        <motion.button
          id={`wishlist-btn-${product.id}`}
          whileHover={{ scale: 1.15 }}
          whileTap={{ scale: 0.85 }}
          onClick={(e) => {
            e.stopPropagation();
            onToggleWishlist(product);
          }}
          className="absolute top-3 right-3 p-2 bg-white/90 backdrop-blur-xs rounded-full text-black hover:text-[#fc6018] transition-colors z-10 cursor-pointer shadow-xs border border-black/5"
          title={isWishlisted ? 'Remove from wishlist' : 'Save to wishlist'}
          aria-label="Wishlist"
        >
          <Heart
            className={`w-3.5 h-3.5 transition-colors ${
              isWishlisted ? 'fill-[#fc6018] text-[#fc6018]' : ''
            }`}
          />
        </motion.button>

        {/* Quick Add Overlay or Notify Me on Hover with rounded-xl */}
        <div
          className={`absolute bottom-3 inset-x-3 transition-all duration-300 z-10 ${
            isHovered ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-2 pointer-events-none'
          }`}
        >
          {isOutOfStock ? (
            <motion.button
              whileTap={{ scale: 0.96 }}
              id={`notify-btn-${product.id}`}
              onClick={handleNotifyMe}
              className={`w-full py-2.5 px-3 text-[11px] uppercase tracking-wider font-bold flex items-center justify-center space-x-1.5 transition-all rounded-xl cursor-pointer shadow-sm ${
                notified
                  ? 'bg-emerald-800 text-white'
                  : 'bg-black text-white hover:bg-neutral-800'
              }`}
            >
              {notified ? (
                <>
                  <Check className="w-3.5 h-3.5" />
                  <span>We'll Notify You</span>
                </>
              ) : (
                <>
                  <Bell className="w-3.5 h-3.5" />
                  <span>Notify Me</span>
                </>
              )}
            </motion.button>
          ) : quickSizeMenu ? (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-black/95 backdrop-blur-md p-2.5 rounded-2xl text-white shadow-lg"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between text-[10px] uppercase tracking-wider text-neutral-400 mb-1.5 px-1 font-bold">
                <span>Select Size</span>
                <button
                  onClick={() => setQuickSizeMenu(false)}
                  className="text-neutral-400 hover:text-white cursor-pointer"
                >
                  ✕
                </button>
              </div>
              <div className="flex flex-wrap gap-1 justify-center">
                {(product.sizes || ['Standard']).map((sz) => (
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    key={sz}
                    onClick={(e) => handleQuickAddClick(sz, e)}
                    className="px-2.5 py-1 bg-white/10 hover:bg-[#fc6018] text-[10px] transition-colors rounded-lg cursor-pointer font-mono"
                  >
                    {sz?.split(' ')?.[0] || sz}
                  </motion.button>
                ))}
              </div>
            </motion.div>
          ) : (
            <div className="flex gap-1.5" onClick={(e) => e.stopPropagation()}>
              {/* Button 1: Add to Bag */}
              <motion.button
                whileTap={{ scale: 0.96 }}
                id={`card-add-to-bag-${product.id}`}
                onClick={(e) => {
                  e.stopPropagation();
                  if ((product.sizes?.length || 0) > 1) {
                    setQuickSizeMenu(true);
                  } else {
                    handleQuickAddClick(product.sizes?.[0] || 'Standard', e);
                  }
                }}
                className={`flex-1 py-2 px-2 text-[10px] uppercase tracking-wider font-bold flex items-center justify-center space-x-1 transition-all rounded-xl cursor-pointer ${
                  justAdded
                    ? 'bg-black text-white'
                    : 'bg-white/95 text-black hover:bg-black hover:text-white border border-black/10 shadow-xs'
                }`}
                title="Add to Shopping Bag"
              >
                {justAdded ? (
                  <>
                    <Check className="w-3 h-3 text-emerald-400" />
                    <span>Added</span>
                  </>
                ) : (
                  <>
                    <ShoppingBag className="w-3 h-3" />
                    <span>Add to Bag</span>
                  </>
                )}
              </motion.button>

              {/* Button 2: Buy Now */}
              <motion.button
                whileTap={{ scale: 0.96 }}
                id={`card-buy-now-${product.id}`}
                onClick={(e) => handleBuyNowClick(product.sizes?.[0] || 'Standard', e)}
                className="flex-1 py-2 px-2 text-[10px] uppercase tracking-wider font-bold flex items-center justify-center space-x-1 transition-all rounded-xl cursor-pointer bg-[#fc6018] hover:bg-[#e05312] text-white shadow-xs"
                title="Proceed directly to checkout"
              >
                <CreditCard className="w-3 h-3" />
                <span>Buy Now</span>
              </motion.button>
            </div>
          )}
        </div>
      </div>

      {/* Product Metadata */}
      <div className="flex flex-col space-y-1 px-1.5 pb-1">
        
        {/* Designer / Brand & Category */}
        <div className="flex items-center justify-between">
          <span className="text-[10px] uppercase tracking-widest text-[#444748] font-bold">
            {product.brand || product.designer || 'LUXORA'} • {product.category}
          </span>
          
          {/* Color Dots */}
          {product.colors && product.colors.length > 0 && (
            <div className="flex items-center space-x-1" onClick={(e) => e.stopPropagation()}>
              {product.colors.map((color, idx) => (
                <button
                  key={color.name || idx}
                  onClick={() => setSelectedColorIndex(idx)}
                  title={color.name}
                  className={`w-2.5 h-2.5 rounded-full border transition-transform cursor-pointer ${
                    selectedColorIndex === idx
                      ? 'border-black scale-125'
                      : 'border-neutral-300'
                  }`}
                  style={{ backgroundColor: color.hex }}
                />
              ))}
            </div>
          )}
        </div>

        {/* Product Title */}
        <h3 className="text-[14px] font-bold tracking-tight text-black group-hover:text-[#a83900] transition-colors line-clamp-1">
          {product.name}
        </h3>

        {/* Color Description & Price / Stock note */}
        <div className="flex items-center justify-between pt-0.5">
          <span className="text-[11px] text-[#444748] truncate max-w-[150px]">
            {product.color || 'Standard'} • {product.composition ? product.composition.split('(')[0] : product.aiAttributes?.fabric || product.category}
          </span>
          <span className="text-[13px] font-bold text-black">
            ₹{(product.price || 0).toLocaleString('en-IN')}
          </span>
        </div>

        {/* Stock warning if exactly 1 left */}
        {isOnlyOneLeft && (
          <div className="pt-0.5 flex items-center gap-1 text-[10px] font-semibold text-amber-700">
            <AlertCircle className="w-3 h-3" />
            <span>Only 1 left in stock — order soon!</span>
          </div>
        )}
      </div>
    </motion.div>
  );
};


