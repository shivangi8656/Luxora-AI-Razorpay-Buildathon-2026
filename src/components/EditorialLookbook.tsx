import React, { useState, useEffect, useRef } from 'react';
import { Sparkles, Eye, ArrowRight, ShoppingBag, ChevronLeft, ChevronRight, Check, Play, Pause } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { Product, Currency, EditorialStory } from '../types';
import { EDITORIAL_STORIES } from '../data/editorials';
import { PRODUCTS, CURRENCIES } from '../data/products';

interface EditorialLookbookProps {
  currency: Currency;
  onSelectProduct: (product: Product) => void;
  onAddToCart?: (product: Product, size: string, colorIndex: number) => void;
  onQuickAdd?: (product: Product, size?: string) => void;
  onOpenAtelier?: (prompt?: string) => void;
  products?: Product[];
}

export const EditorialLookbook: React.FC<EditorialLookbookProps> = ({
  currency,
  onSelectProduct,
  onAddToCart,
  onQuickAdd,
  onOpenAtelier,
  products,
}) => {
  const [activeStoryIndex, setActiveStoryIndex] = useState(0);
  const [hoveredHotspotProduct, setHoveredHotspotProduct] = useState<Product | null>(null);
  const [isAutoPlay, setIsAutoPlay] = useState(true);
  const [addedItemMap, setAddedItemMap] = useState<Record<string, boolean>>({});

  const autoPlayRef = useRef<NodeJS.Timeout | null>(null);

  // Auto transition every 3 seconds
  useEffect(() => {
    if (isAutoPlay) {
      autoPlayRef.current = setInterval(() => {
        setActiveStoryIndex((prev) => (prev + 1) % EDITORIAL_STORIES.length);
      }, 3000);
    }
    return () => {
      if (autoPlayRef.current) clearInterval(autoPlayRef.current);
    };
  }, [isAutoPlay]);

  const handleNextStory = () => {
    setActiveStoryIndex((prev) => (prev + 1) % EDITORIAL_STORIES.length);
  };

  const handlePrevStory = () => {
    setActiveStoryIndex((prev) => (prev - 1 + EDITORIAL_STORIES.length) % EDITORIAL_STORIES.length);
  };

  const handleQuickBuy = (product: Product, e: React.MouseEvent) => {
    e.stopPropagation();
    const size = product.sizes?.[0] || 'Standard';
    if (typeof onAddToCart === 'function') {
      onAddToCart(product, size, 0);
    } else if (typeof onQuickAdd === 'function') {
      onQuickAdd(product, size);
    }
    setAddedItemMap((prev) => ({ ...prev, [product.id]: true }));
    setTimeout(() => {
      setAddedItemMap((prev) => ({ ...prev, [product.id]: false }));
    }, 2000);
  };

  const availableProducts = (products && products.length > 0) ? products : PRODUCTS;
  const story = EDITORIAL_STORIES[activeStoryIndex] || EDITORIAL_STORIES[0];
  const cur = CURRENCIES[currency] || { symbol: '₹', rate: 1.0 };

  return (
    <section 
      id="lookbook-section" 
      className="pt-28 md:pt-32 pb-16 bg-[#ECE8DF]/40 border-t border-[#121212]/10 font-['Archivo_Narrow'] min-h-screen"
      onMouseEnter={() => setIsAutoPlay(false)}
      onMouseLeave={() => setIsAutoPlay(true)}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-8 gap-4">
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <div className="flex items-center gap-2 mb-1">
              <span className="text-[10px] uppercase tracking-[0.3em] font-semibold text-[#a83900]">
                Editorial Spreads & Lookbook
              </span>
              <span className="inline-flex items-center gap-1 text-[10px] uppercase font-mono px-2 py-0.5 rounded-full bg-black/5 text-neutral-600">
                <span className={`w-1.5 h-1.5 rounded-full ${isAutoPlay ? 'bg-emerald-500 animate-pulse' : 'bg-amber-500'}`} />
                <span>{isAutoPlay ? 'Auto-Slide 3s' : 'Paused'}</span>
              </span>
            </div>
            <h2 className="text-3xl sm:text-4xl font-bold tracking-tight text-black font-sans">
              {story.title}
            </h2>
            <p className="text-sm text-neutral-600 font-light mt-1 max-w-xl">
              {story.subtitle}
            </p>
          </motion.div>

          {/* Story Selector Pills and Carousel Controls */}
          <div className="flex items-center space-x-2">
            <motion.button
              whileTap={{ scale: 0.92 }}
              onClick={handlePrevStory}
              aria-label="Previous Story"
              className="p-2 rounded-full bg-white hover:bg-black hover:text-white text-black border border-neutral-300 transition-colors cursor-pointer shadow-xs"
              title="Previous Story"
            >
              <ChevronLeft className="w-4 h-4" />
            </motion.button>

            {EDITORIAL_STORIES.map((s, idx) => (
              <motion.button
                key={s.id}
                whileTap={{ scale: 0.95 }}
                onClick={() => setActiveStoryIndex(idx)}
                className={`text-xs uppercase tracking-[0.2em] px-3.5 py-1.5 rounded-full transition-all cursor-pointer ${
                  activeStoryIndex === idx
                    ? 'bg-black text-white font-semibold shadow-xs scale-105'
                    : 'bg-white/90 hover:bg-white text-neutral-700 border border-neutral-300'
                }`}
              >
                Story 0{idx + 1}
              </motion.button>
            ))}

            <motion.button
              whileTap={{ scale: 0.92 }}
              onClick={handleNextStory}
              aria-label="Next Story"
              className="p-2 rounded-full bg-white hover:bg-black hover:text-white text-black border border-neutral-300 transition-colors cursor-pointer shadow-xs"
              title="Next Story"
            >
              <ChevronRight className="w-4 h-4" />
            </motion.button>

            <motion.button
              whileTap={{ scale: 0.92 }}
              onClick={() => setIsAutoPlay(!isAutoPlay)}
              className="p-2 rounded-full bg-white hover:bg-neutral-100 text-neutral-600 border border-neutral-300 transition-colors cursor-pointer shadow-xs ml-1"
              title={isAutoPlay ? "Pause Auto-Slide" : "Resume Auto-Slide"}
            >
              {isAutoPlay ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
            </motion.button>
          </div>
        </div>

        {/* Lookbook Hero Visual with Interactive Shoppable Hotspots */}
        <div className="relative aspect-16/9 sm:aspect-21/9 w-full overflow-hidden bg-neutral-200/50 mb-8 rounded-2xl group shadow-md border border-black/5">
          <AnimatePresence mode="wait">
            <motion.img
              key={story.id}
              src={story.heroImage}
              alt={story.title}
              initial={{ opacity: 0, scale: 1.04 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.98 }}
              transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
              className="w-full h-full object-cover object-center"
              referrerPolicy="no-referrer"
            />
          </AnimatePresence>

          {/* Shoppable Hotspot Tags */}
          {story.hotspots.map((spot) => {
            const product = availableProducts.find((p) => p.id === spot.productId || p.sku === spot.productId);
            if (!product) return null;

            return (
              <div
                key={spot.productId}
                className="absolute z-20"
                style={{ top: `${spot.y}%`, left: `${spot.x}%` }}
                onMouseEnter={() => setHoveredHotspotProduct(product)}
                onMouseLeave={() => setHoveredHotspotProduct(null)}
              >
                {/* Hotspot Pulsing Pin */}
                <motion.button
                  whileHover={{ scale: 1.2 }}
                  whileTap={{ scale: 0.9 }}
                  onClick={() => onSelectProduct(product)}
                  className="relative group/pin flex items-center justify-center -translate-x-1/2 -translate-y-1/2 cursor-pointer"
                  title={`Shop ${product.name}`}
                >
                  <span className="absolute w-7 h-7 rounded-full bg-white/60 animate-ping" />
                  <span className="relative w-4 h-4 rounded-full bg-black border-2 border-white flex items-center justify-center text-[8px] text-white shadow-lg" />
                  
                  {/* Floating Tag */}
                  <span className="hidden sm:inline-block absolute left-6 whitespace-nowrap bg-black/90 text-white backdrop-blur-md px-3 py-1 text-[11px] uppercase tracking-wider font-mono rounded-lg shadow-md opacity-0 group-hover/pin:opacity-100 transition-opacity pointer-events-none">
                    {spot.label}
                  </span>
                </motion.button>
              </div>
            );
          })}

          {/* Quick Nav Arrow overlays on Hero image */}
          <motion.button
            whileTap={{ scale: 0.9 }}
            onClick={(e) => { e.stopPropagation(); handlePrevStory(); }}
            className="absolute left-4 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-white/80 hover:bg-white text-black flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all cursor-pointer shadow-lg z-20 hover:scale-110"
            aria-label="Previous"
          >
            <ChevronLeft className="w-5 h-5" />
          </motion.button>
          <motion.button
            whileTap={{ scale: 0.9 }}
            onClick={(e) => { e.stopPropagation(); handleNextStory(); }}
            className="absolute right-4 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-white/80 hover:bg-white text-black flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all cursor-pointer shadow-lg z-20 hover:scale-110"
            aria-label="Next"
          >
            <ChevronRight className="w-5 h-5" />
          </motion.button>

          {/* Quote Badge Overlay */}
          <motion.div 
            key={`quote-${story.id}`}
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="absolute bottom-6 left-6 max-w-lg bg-[#fbf9f4]/90 backdrop-blur-md p-4 sm:p-6 border border-black/10 rounded-2xl hidden md:block shadow-sm"
          >
            <p className="italic text-sm sm:text-base text-neutral-800 leading-relaxed mb-2 font-serif">
              "{story.quote}"
            </p>
            <span className="text-[10px] uppercase tracking-[0.25em] text-[#a83900] font-bold">
              LUXORA Atelier Curation • SS26
            </span>
          </motion.div>
        </div>

        {/* Narrative & Featured Story Pieces */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="lg:col-span-4 space-y-4 bg-white/60 p-6 rounded-3xl border border-black/5"
          >
            <h3 className="text-xl font-bold text-neutral-900 font-sans">
              The Design Narrative
            </h3>
            <p className="text-xs text-neutral-600 font-light leading-relaxed">
              {story.narrative}
            </p>
            <div className="pt-2">
              <span className="text-[11px] uppercase tracking-widest text-[#a83900] font-semibold flex items-center space-x-1.5">
                <Sparkles className="w-3.5 h-3.5" />
                <span>Hover hotspots above or click "Buy" below to add to bag</span>
              </span>
            </div>
          </motion.div>

          {/* Shoppable Story Pieces Grid with Direct Buy Buttons */}
          <div className="lg:col-span-8">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {story.featuredProductIds.map((id, index) => {
                const prod = availableProducts.find((p) => p.id === id || p.sku === id);
                if (!prod) return null;
                const isAdded = !!addedItemMap[prod.id];

                return (
                  <motion.div
                    key={prod.id}
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.5, delay: index * 0.1 }}
                    whileHover={{ y: -3 }}
                    onClick={() => onSelectProduct(prod)}
                    className="group/story-item bg-white p-3.5 rounded-2xl border border-neutral-200 hover:border-black transition-all cursor-pointer flex flex-col justify-between shadow-2xs hover:shadow-md"
                  >
                    <div className="aspect-3/4 w-full bg-neutral-100 rounded-xl overflow-hidden mb-3 relative">
                      <img
                        src={prod.images?.[0] || prod.imageUrl || ''}
                        alt={prod.name}
                        className="w-full h-full object-cover group-hover/story-item:scale-105 transition-transform duration-500"
                        referrerPolicy="no-referrer"
                      />
                      <span className="absolute top-2 left-2 bg-black/80 backdrop-blur-xs text-white text-[9px] uppercase tracking-wider font-semibold px-2 py-0.5 rounded-full">
                        {prod.category}
                      </span>
                    </div>

                    <div className="space-y-2">
                      <div>
                        <span className="text-[9px] uppercase tracking-widest text-neutral-500 block truncate font-bold">
                          {prod.brand || prod.designer || 'LUXORA'}
                        </span>
                        <h4 className="text-xs font-bold text-neutral-900 truncate group-hover/story-item:text-[#a83900]">
                          {prod.name}
                        </h4>
                      </div>

                      <div className="flex items-center justify-between pt-1 border-t border-neutral-100">
                        <span className="text-xs font-bold font-mono text-neutral-900">
                          ₹{(prod.price || 0).toLocaleString('en-IN')}
                        </span>
                        
                        {/* Direct Buy / Add to Bag Button */}
                        <motion.button
                          whileTap={{ scale: 0.92 }}
                          onClick={(e) => handleQuickBuy(prod, e)}
                          className={`px-3 py-1.5 rounded-full text-[10px] uppercase font-bold tracking-wider flex items-center gap-1 transition-all cursor-pointer ${
                            isAdded
                              ? 'bg-emerald-700 text-white'
                              : 'bg-black text-white hover:bg-[#a83900]'
                          }`}
                          title="Instant Add to Bag"
                        >
                          {isAdded ? (
                            <>
                              <Check className="w-3 h-3" />
                              <span>Added</span>
                            </>
                          ) : (
                            <>
                              <ShoppingBag className="w-3 h-3" />
                              <span>Buy</span>
                            </>
                          )}
                        </motion.button>
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          </div>

        </div>

      </div>
    </section>
  );
};


