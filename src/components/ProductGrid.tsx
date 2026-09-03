import React, { useState, useMemo } from 'react';
import { Search, Sparkles, SlidersHorizontal, X, Eye, ShoppingBag, Heart, Check, ArrowRight, Filter, CreditCard } from 'lucide-react';
import { Product, Currency } from '../types';
import { ProductCard } from './ProductCard';

interface ProductGridProps {
  products: Product[];
  currency?: Currency;
  wishlistIds: string[];
  onToggleWishlist: (product: Product) => void;
  onSelectProduct: (product: Product) => void;
  onQuickAdd: (product: Product, size: string) => void;
  onBuyNow?: (product: Product, size?: string) => void;
  onOpenAtelierWithPrompt?: (prompt: string) => void;
  onOpenAtelier?: () => void;
}

export const ProductGrid: React.FC<ProductGridProps> = ({
  products,
  wishlistIds,
  onToggleWishlist,
  onSelectProduct,
  onQuickAdd,
  onBuyNow,
  onOpenAtelierWithPrompt,
  onOpenAtelier,
}) => {
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedOccasion, setSelectedOccasion] = useState<string>('all');
  const [selectedBudget, setSelectedBudget] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [justAddedId, setJustAddedId] = useState<string | null>(null);

  const CATEGORY_TABS = [
    { id: 'all', label: 'All Silhouettes' },
    { id: 'Dresses', label: 'Dresses' },
    { id: 'Tailoring', label: 'Tailoring' },
    { id: 'Outerwear', label: 'Outerwear' },
    { id: 'Accessories', label: 'Accessories' },
    { id: 'Footwear', label: 'Footwear' },
    { id: 'Jewelry', label: 'Jewelry' },
  ];

  const OCCASION_TABS = [
    { id: 'all', label: 'All Occasions' },
    { id: 'Evening', label: 'Evening & Gala' },
    { id: 'Formal', label: 'Formal & Office' },
    { id: 'Smart Casual', label: 'Smart Casual' },
    { id: 'Winter', label: 'Winter Luxury' },
  ];

  const BUDGET_TABS = [
    { id: 'all', label: 'Any Budget' },
    { id: 'under-10k', label: 'Under ₹10,000' },
    { id: 'under-15k', label: 'Under ₹15,000' },
    { id: 'under-20k', label: 'Under ₹20,000' },
    { id: 'above-20k', label: '₹20,000+' },
  ];

  const filteredProducts = useMemo(() => {
    return products.filter((p) => {
      // 1. Search Query
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matches = 
          p.name.toLowerCase().includes(q) ||
          p.brand.toLowerCase().includes(q) ||
          (p.designer && p.designer.toLowerCase().includes(q)) ||
          p.category.toLowerCase().includes(q) ||
          p.occasion.toLowerCase().includes(q) ||
          p.color.toLowerCase().includes(q) ||
          p.description.toLowerCase().includes(q);
        if (!matches) return false;
      }

      // 2. Category Filter
      if (selectedCategory !== 'all' && p.category.toLowerCase() !== selectedCategory.toLowerCase()) {
        return false;
      }

      // 3. Occasion Filter
      if (selectedOccasion !== 'all') {
        const occ = p.occasion.toLowerCase();
        const targetOcc = selectedOccasion.toLowerCase();
        if (targetOcc === 'evening' && !occ.includes('evening') && !occ.includes('occasion')) return false;
        if (targetOcc === 'formal' && !occ.includes('formal')) return false;
        if (targetOcc === 'smart casual' && !occ.includes('casual') && !occ.includes('smart')) return false;
        if (targetOcc === 'winter' && !occ.includes('winter')) return false;
      }

      // 4. Budget Filter
      if (selectedBudget === 'under-10k' && p.price > 10000) return false;
      if (selectedBudget === 'under-15k' && p.price > 15000) return false;
      if (selectedBudget === 'under-20k' && p.price > 20000) return false;
      if (selectedBudget === 'above-20k' && p.price < 20000) return false;

      return true;
    });
  }, [products, selectedCategory, selectedOccasion, selectedBudget, searchQuery]);

  const featuredProduct = products.find(p => p.id === 'LX-WD-001') || products[0];

  const handleHeroQuickAdd = (product: Product, e: React.MouseEvent) => {
    e.stopPropagation();
    onQuickAdd(product, product.sizes?.[0] || 'FR 36 (US 2)');
    setJustAddedId(product.id);
    setTimeout(() => setJustAddedId(null), 1800);
  };

  const handleHeroBuyNow = (product: Product, e: React.MouseEvent) => {
    e.stopPropagation();
    if (onBuyNow) {
      onBuyNow(product, product.sizes?.[0] || 'FR 36 (US 2)');
    } else {
      onQuickAdd(product, product.sizes?.[0] || 'FR 36 (US 2)');
    }
  };

  return (
    <section id="catalog-section" className="py-12 px-5 sm:px-8 md:px-16 max-w-[1440px] mx-auto space-y-8 font-['Archivo_Narrow']">
      
      {/* Search & AI Query Bar Header */}
      <div className="bg-white/70 backdrop-blur-md p-6 rounded-lg border border-black/10 shadow-xs space-y-5">
        <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4">
          
          {/* Natural Language Search Input */}
          <div className="relative flex-1">
            <input
              id="buyer-search-input"
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search or ask: 'black dress for wedding under ₹15,000' or 'tailored blazer'..."
              className="w-full bg-[#fbf9f4] border border-black/20 rounded-md px-4 py-3 pl-11 text-[14px] text-black focus:outline-none focus:border-black transition-colors"
            />
            <Search className="w-4 h-4 text-[#444748] absolute left-4 top-3.5" />
            {searchQuery && (
              <button 
                onClick={() => setSearchQuery('')}
                className="absolute right-4 top-3.5 text-[#444748] hover:text-black cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>

          {/* AI Stylist Button */}
          {(onOpenAtelierWithPrompt || onOpenAtelier) && (
            <button
              id="grid-ask-ai-stylist-btn"
              onClick={() => {
                if (searchQuery.trim() && onOpenAtelierWithPrompt) {
                  onOpenAtelierWithPrompt(searchQuery.trim());
                } else if (onOpenAtelier) {
                  onOpenAtelier();
                } else if (onOpenAtelierWithPrompt) {
                  onOpenAtelierWithPrompt('');
                }
              }}
              className="bg-black hover:bg-[#474746] text-white px-6 py-3 rounded-md text-[13px] font-semibold uppercase tracking-wider flex items-center justify-center gap-2 cursor-pointer shadow-sm hover:scale-[1.02] transition-all shrink-0"
            >
              <Sparkles className="w-4 h-4 text-[#fc6018]" />
              <span>Ask AI Stylist</span>
            </button>
          )}

        </div>

        {/* Filters Row: Categories, Occasions & Budget */}
        <div className="space-y-3 pt-2 border-t border-black/5">
          
          {/* Categories */}
          <div className="flex items-center gap-2 overflow-x-auto no-scrollbar pb-1">
            <span className="text-[11px] uppercase tracking-widest text-[#444748] font-bold shrink-0 mr-1">
              Category:
            </span>
            {CATEGORY_TABS.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setSelectedCategory(tab.id)}
                className={`px-4 py-1.5 rounded-full text-[12px] uppercase tracking-wider font-semibold transition-all cursor-pointer shrink-0 ${
                  selectedCategory === tab.id
                    ? 'bg-black text-white shadow-2xs'
                    : 'bg-white border border-black/15 text-[#444748] hover:border-black hover:text-black'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* Occasions & Budget */}
          <div className="flex flex-wrap items-center gap-4 text-xs">
            {/* Occasions */}
            <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar">
              <span className="text-[11px] uppercase tracking-widest text-[#444748] font-bold shrink-0 mr-1">
                Occasion:
              </span>
              {OCCASION_TABS.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setSelectedOccasion(tab.id)}
                  className={`px-3 py-1 rounded text-[11px] font-medium transition-all cursor-pointer shrink-0 ${
                    selectedOccasion === tab.id
                      ? 'bg-[#1b1c19] text-white font-bold'
                      : 'bg-[#f2efe9] text-[#444748] hover:text-black'
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>

            {/* Budget */}
            <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar">
              <span className="text-[11px] uppercase tracking-widest text-[#444748] font-bold shrink-0 mr-1">
                Budget:
              </span>
              {BUDGET_TABS.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setSelectedBudget(tab.id)}
                  className={`px-3 py-1 rounded text-[11px] font-medium transition-all cursor-pointer shrink-0 ${
                    selectedBudget === tab.id
                      ? 'bg-[#fc6018] text-white font-bold'
                      : 'bg-[#f2efe9] text-[#444748] hover:text-black'
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>

            {/* Reset All */}
            {(selectedCategory !== 'all' || selectedOccasion !== 'all' || selectedBudget !== 'all' || searchQuery) && (
              <button
                onClick={() => {
                  setSelectedCategory('all');
                  setSelectedOccasion('all');
                  setSelectedBudget('all');
                  setSearchQuery('');
                }}
                className="text-[11px] text-[#a83900] underline font-bold hover:text-black cursor-pointer ml-auto"
              >
                Reset All Filters
              </button>
            )}

          </div>

        </div>

      </div>



      {/* Bento Featured Header on Default View */}
      {selectedCategory === 'all' && selectedOccasion === 'all' && selectedBudget === 'all' && !searchQuery && featuredProduct && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          
          {/* Featured Hero Product Card */}
          <div 
            onClick={() => onSelectProduct(featuredProduct)}
            className="lg:col-span-8 bg-white border border-black/10 rounded-lg overflow-hidden group relative flex flex-col md:flex-row cursor-pointer shadow-xs hover:shadow-md transition-all"
          >
            <div className="md:w-1/2 relative h-[360px] md:h-[480px] bg-[#eae8e3] overflow-hidden">
              <img 
                src={featuredProduct.images?.[0] || featuredProduct.imageUrl || ''} 
                alt={featuredProduct.name} 
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" 
                referrerPolicy="no-referrer"
              />
              
              {/* Badges */}
              <div className="absolute top-4 left-4 flex flex-col gap-1.5 z-10">
                {(featuredProduct.stock === 0 || featuredProduct.availability === 'Out of Stock') ? (
                  <span className="bg-rose-700 text-white text-[10px] uppercase font-bold tracking-widest px-3 py-1 rounded shadow-2xs">
                    Out of Stock
                  </span>
                ) : featuredProduct.stock === 1 ? (
                  <span className="bg-amber-600 text-white text-[10px] uppercase font-bold tracking-widest px-3 py-1 rounded shadow-2xs animate-pulse">
                    Only 1 Left in Stock
                  </span>
                ) : (
                  <>
                    <span className="bg-black text-white text-[10px] uppercase font-bold tracking-widest px-3 py-1 rounded">
                      AI Editorial Curated
                    </span>
                    <span className="bg-white/90 backdrop-blur-md text-black text-[10px] uppercase font-bold tracking-widest px-3 py-1 rounded border border-black/10">
                      {featuredProduct.occasion}
                    </span>
                  </>
                )}
              </div>
            </div>

            <div className="md:w-1/2 p-6 sm:p-8 flex flex-col justify-between space-y-6">
              <div>
                <span className="text-[11px] uppercase tracking-widest text-[#a83900] font-bold block mb-1">
                  {featuredProduct.brand} • {featuredProduct.category}
                </span>
                <h3 className="text-2xl sm:text-3xl font-bold text-black mb-3">
                  {featuredProduct.name}
                </h3>
                <p className="text-[13px] text-[#444748] leading-relaxed mb-4">
                  {featuredProduct.description}
                </p>

                {featuredProduct.whyThisReason && (
                  <div className="bg-[#fbf9f4] p-3 border-l-2 border-black text-xs rounded-r mb-4">
                    <span className="font-bold text-black block mb-0.5">Stylist Insight:</span>
                    <span className="text-[#444748]">{featuredProduct.whyThisReason}</span>
                  </div>
                )}
                
                <div className="flex items-center justify-between">
                  <div className="text-2xl font-bold text-black">
                    ₹{featuredProduct.price.toLocaleString('en-IN')}
                  </div>
                  {(featuredProduct.stock === 0 || featuredProduct.availability === 'Out of Stock') && (
                    <span className="text-xs uppercase font-bold text-rose-700 bg-rose-50 px-2.5 py-1 rounded border border-rose-200">
                      Unavailable
                    </span>
                  )}
                </div>
              </div>

              <div className="space-y-3 pt-4 border-t border-black/10">
                <div className="flex flex-col sm:flex-row gap-3">
                  {(featuredProduct.stock === 0 || featuredProduct.availability === 'Out of Stock') ? (
                    <button
                      id="hero-bento-out-of-stock-btn"
                      onClick={(e) => {
                        e.stopPropagation();
                        onSelectProduct(featuredProduct);
                      }}
                      className="w-full py-3 px-4 bg-neutral-200 text-neutral-600 font-semibold text-xs rounded-xl cursor-pointer flex items-center justify-center gap-1.5 shadow-2xs"
                    >
                      <Sparkles className="w-3.5 h-3.5 text-neutral-500" />
                      <span>NOTIFY ON RESTOCK</span>
                    </button>
                  ) : (
                    <>
                      {/* Button 1: Add to Bag (First button) */}
                      <button
                        id="hero-bento-add-to-bag-btn"
                        onClick={(e) => handleHeroQuickAdd(featuredProduct, e)}
                        className={`flex-1 py-3 px-4 font-semibold text-xs rounded-xl transition-all active:scale-95 flex items-center justify-center gap-1.5 cursor-pointer shadow-2xs ${
                          justAddedId === featuredProduct.id
                            ? 'bg-neutral-800 text-white'
                            : 'bg-white border border-black text-black hover:bg-black hover:text-white'
                        }`}
                      >
                        {justAddedId === featuredProduct.id ? (
                          <>
                            <Check className="w-3.5 h-3.5 text-emerald-400" />
                            <span>ADDED TO BAG</span>
                          </>
                        ) : (
                          <>
                            <ShoppingBag className="w-3.5 h-3.5" />
                            <span>ADD TO BAG</span>
                          </>
                        )}
                      </button>

                      {/* Button 2: Buy Now (Side by side) */}
                      <button
                        id="hero-bento-buy-now-btn"
                        onClick={(e) => handleHeroBuyNow(featuredProduct, e)}
                        className="flex-1 py-3 px-4 bg-[#fc6018] hover:bg-[#e05312] active:scale-95 text-white font-semibold text-xs rounded-xl transition-all flex items-center justify-center gap-1.5 cursor-pointer shadow-2xs"
                      >
                        <CreditCard className="w-3.5 h-3.5" />
                        <span>BUY NOW</span>
                      </button>
                    </>
                  )}
                </div>

                {/* View Details Link */}
                <div className="pt-1 text-center">
                  <button
                    id="hero-bento-view-details-btn"
                    onClick={(e) => {
                      e.stopPropagation();
                      onSelectProduct(featuredProduct);
                    }}
                    className="text-[11px] text-neutral-600 hover:text-black font-semibold hover:underline inline-flex items-center gap-1 cursor-pointer transition-colors"
                  >
                    <Eye className="w-3.5 h-3.5" />
                    <span>View Specifications & Bespoke Silhouette</span>
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Secondary Spotlight Card */}
          {products[1] && (
            <div 
              onClick={() => onSelectProduct(products[1])}
              className="lg:col-span-4 bg-white border border-black/10 rounded-lg overflow-hidden group flex flex-col justify-between cursor-pointer shadow-xs hover:shadow-md transition-all"
            >
              <div className="relative h-[280px] bg-[#eae8e3] overflow-hidden">
                <img 
                  src={products[1].images?.[0] || products[1].imageUrl || ''} 
                  alt={products[1].name} 
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" 
                  referrerPolicy="no-referrer"
                />
                <div className="absolute top-4 left-4">
                  <span className="bg-black text-white text-[10px] uppercase font-bold tracking-widest px-3 py-1 rounded">
                    {products[1].category}
                  </span>
                </div>
              </div>

              <div className="p-6 space-y-4">
                <div className="flex justify-between items-baseline">
                  <div>
                    <span className="text-[10px] uppercase text-[#a83900] font-bold block">
                      {products[1].brand}
                    </span>
                    <h4 className="font-bold text-lg text-black">{products[1].name}</h4>
                  </div>
                  <span className="font-bold text-base text-black">
                    ₹{products[1].price.toLocaleString('en-IN')}
                  </span>
                </div>

                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onSelectProduct(products[1]);
                  }}
                  className="w-full py-2.5 bg-[#f2efe9] hover:bg-black hover:text-white text-black text-xs font-semibold rounded transition-colors flex items-center justify-center gap-1 cursor-pointer"
                >
                  <span>View Specifications</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          )}

        </div>
      )}

      {/* Main Grid View */}
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h3 className="text-xl font-bold text-black tracking-tight">
            {searchQuery 
              ? `Results for "${searchQuery}" (${filteredProducts.length})` 
              : selectedCategory !== 'all' 
                ? `${selectedCategory} (${filteredProducts.length})`
                : `Complete Collection (${filteredProducts.length})`}
          </h3>
          <span className="text-xs text-[#444748] font-mono">
            Prices in INR (₹)
          </span>
        </div>

        {filteredProducts.length === 0 ? (
          <div className="py-20 text-center space-y-4 bg-white border border-black/10 rounded-lg p-8">
            <p className="text-[#444748] text-sm">No silhouettes match the active filters.</p>
            <button
              onClick={() => {
                setSelectedCategory('all');
                setSelectedOccasion('all');
                setSelectedBudget('all');
                setSearchQuery('');
              }}
              className="px-6 py-2.5 bg-black text-white text-xs rounded font-semibold cursor-pointer"
            >
              Reset Filters
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-6">
            {filteredProducts.map((product) => (
              <ProductCard
                key={product.id}
                product={product}
                currency="INR"
                isWishlisted={wishlistIds.includes(product.id)}
                onToggleWishlist={onToggleWishlist}
                onSelectProduct={onSelectProduct}
                onQuickAdd={onQuickAdd}
                onBuyNow={onBuyNow}
              />
            ))}
          </div>
        )}
      </div>

    </section>
  );
};
