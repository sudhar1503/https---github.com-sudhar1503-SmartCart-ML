import React, { useMemo, useState } from 'react';
import { GitCompareArrows, Search, SlidersHorizontal } from 'lucide-react';
import { PRODUCT_CATEGORIES } from '../data/catalog';
import {
  Budget,
  Product,
  ProductCategory,
  Recommendation,
  SortOption,
} from '../types/smartcart';
import { formatINR } from '../services/formatters';
import { productService } from '../services/productService';
import { ProductCard } from '../components/ProductCard';

interface ExplorePageProps {
  searchQuery: string;
  onSearchChange: (q: string) => void;
  selectedCategory: 'All' | ProductCategory;
  onCategoryChange: (cat: 'All' | ProductCategory) => void;
  budget: Budget;
  recommendations: Recommendation[];
  wishlistIds: string[];
  comparedIds: string[];
  basketQuantities: Map<string, number>;
  primaryVariantByProductId: Map<string, string>;
  onAddToBasket: (product: Product, variant?: string) => void;
  onIncrement: (productId: string, variant: string) => void;
  onDecrement: (productId: string, variant: string) => void;
  onViewDetails: (product: Product) => void;
  onToggleWishlist: (productId: string) => void;
  onToggleCompare: (productId: string) => void;
  onOpenComparison: () => void;
}

export const ExplorePage: React.FC<ExplorePageProps> = ({
  searchQuery,
  onSearchChange,
  selectedCategory,
  onCategoryChange,
  budget,
  recommendations,
  wishlistIds,
  comparedIds,
  basketQuantities,
  primaryVariantByProductId,
  onAddToBasket,
  onIncrement,
  onDecrement,
  onViewDetails,
  onToggleWishlist,
  onToggleCompare,
  onOpenComparison,
}) => {
  const [selectedBrand, setSelectedBrand] = useState<'All' | string>('All');
  const [maxPrice, setMaxPrice] = useState<number>(7000);
  const [minRating, setMinRating] = useState<number>(0);
  const [sortBy, setSortBy] = useState<SortOption>('popularity');
  const [onlyRemainingBudget, setOnlyRemainingBudget] = useState(false);

  const brands = useMemo(() => productService.getAllBrands(), []);
  const recMap = useMemo(
    () => new Map(recommendations.map((r) => [r.product.id, r])),
    [recommendations]
  );

  const filteredProducts = useMemo(
    () =>
      productService.filterAndSortProducts({
        searchQuery,
        category: selectedCategory,
        brand: selectedBrand,
        maxPrice,
        minRating,
        onlyWithinRemainingBudget: onlyRemainingBudget,
        remainingBudget: budget.remaining,
        sortBy,
      }),
    [
      searchQuery,
      selectedCategory,
      selectedBrand,
      maxPrice,
      minRating,
      onlyRemainingBudget,
      budget.remaining,
      sortBy,
    ]
  );

  const resetFilters = () => {
    onSearchChange('');
    onCategoryChange('All');
    setSelectedBrand('All');
    setMaxPrice(7000);
    setMinRating(0);
    setOnlyRemainingBudget(false);
    setSortBy('popularity');
  };

  return (
    <div className="space-y-6">
      {/* Header + Compare Trigger */}
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="font-display text-3xl font-bold text-[#131b2e] tracking-tight">
            Explore Products
          </h1>
          <p className="text-sm text-[#464555] mt-1">
            Browse all {productService.getAllProducts().length} sample products, filter by price or rating, and check what fits your{' '}
            <span className="font-metric font-semibold text-[#131b2e]">
              {formatINR(budget.remaining)}
            </span>{' '}
            remaining budget.
          </p>
        </div>

        {comparedIds.length > 0 && (
          <button
            type="button"
            onClick={onOpenComparison}
            className="inline-flex items-center gap-2 px-4 py-2.5 text-xs font-semibold text-white bg-[#4F46E5] hover:bg-[#3525cd] rounded-xl transition-colors cursor-pointer"
          >
            <GitCompareArrows className="w-4 h-4" aria-hidden="true" />
            <span>Compare Selected ({comparedIds.length})</span>
          </button>
        )}
      </div>

      {/* Filters Panel */}
      <section
        aria-label="Product filters"
        className="bg-white rounded-2xl border border-slate-900/[0.06] p-4 sm:p-5 space-y-4 shadow-[0_4px_16px_-4px_rgba(15,23,42,0.04)]"
      >
        {/* Row 1: Search, Brand, Rating, Sort */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-12 gap-3">
          <div className="lg:col-span-5 relative">
            <Search
              className="w-4 h-4 text-[#777587] absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none"
              aria-hidden="true"
            />
            <input
              type="search"
              value={searchQuery}
              onChange={(e) => onSearchChange(e.target.value)}
              placeholder="Search products, brands or features..."
              aria-label="Search products"
              className="w-full h-10 pl-10 pr-4 text-sm bg-[#faf8ff] border border-[#CBD5E1] rounded-lg focus:outline-none focus:bg-white focus:border-[#4F46E5]"
            />
          </div>

          <div className="lg:col-span-2">
            <select
              aria-label="Filter by brand"
              value={selectedBrand}
              onChange={(e) => setSelectedBrand(e.target.value)}
              className="w-full h-10 px-3 text-xs sm:text-sm text-[#131b2e] bg-white border border-[#CBD5E1] rounded-lg focus:outline-none focus:border-[#4F46E5] cursor-pointer"
            >
              <option value="All">All Brands</option>
              {brands.map((brand) => (
                <option key={brand} value={brand}>
                  {brand}
                </option>
              ))}
            </select>
          </div>

          <div className="lg:col-span-2">
            <select
              aria-label="Minimum sample rating"
              value={minRating}
              onChange={(e) => setMinRating(Number(e.target.value))}
              className="w-full h-10 px-3 text-xs sm:text-sm text-[#131b2e] bg-white border border-[#CBD5E1] rounded-lg focus:outline-none focus:border-[#4F46E5] cursor-pointer"
            >
              <option value={0}>Any Rating</option>
              <option value={4.5}>4.5★ & above</option>
              <option value={4.7}>4.7★ & above</option>
            </select>
          </div>

          <div className="lg:col-span-3 flex items-center gap-2">
            <SlidersHorizontal className="w-4 h-4 text-[#464555] shrink-0" aria-hidden="true" />
            <select
              aria-label="Sort products"
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as SortOption)}
              className="w-full h-10 px-3 text-xs sm:text-sm font-medium text-[#131b2e] bg-white border border-[#CBD5E1] rounded-lg focus:outline-none focus:border-[#4F46E5] cursor-pointer"
            >
              <option value="popularity">Sort: Popularity</option>
              <option value="price-asc">Sort: Price Low to High</option>
              <option value="price-desc">Sort: Price High to Low</option>
              <option value="rating">Sort: Highest Rating</option>
            </select>
          </div>
        </div>

        {/* Row 2: Categories */}
        <div className="flex flex-wrap items-center gap-1.5 p-1 bg-[#f2f3ff] rounded-xl">
          {(['All', ...PRODUCT_CATEGORIES] as const).map((cat) => {
            const active = selectedCategory === cat;
            return (
              <button
                key={cat}
                type="button"
                onClick={() => onCategoryChange(cat)}
                className={`px-3 py-1.5 text-xs font-medium rounded-lg whitespace-nowrap transition-colors cursor-pointer ${
                  active
                    ? 'bg-white text-[#131b2e] font-semibold shadow-xs'
                    : 'text-[#464555] hover:text-[#131b2e]'
                }`}
              >
                {cat}
              </button>
            );
          })}
        </div>

        {/* Row 3: Max Price Slider + Fits Remaining Budget Toggle */}
        <div className="flex flex-wrap items-center justify-between gap-4 pt-1">
          <div className="flex items-center gap-3 min-w-[240px] flex-1 max-w-sm">
            <label htmlFor="max-price-slider" className="text-xs font-medium text-[#464555] whitespace-nowrap">
              Max Price: <strong className="font-metric text-[#131b2e]">{formatINR(maxPrice)}</strong>
            </label>
            <input
              id="max-price-slider"
              type="range"
              min={500}
              max={7000}
              step={250}
              value={maxPrice}
              onChange={(e) => setMaxPrice(Number(e.target.value))}
              className="flex-1 smartcart-slider"
            />
          </div>

          <div className="flex flex-wrap items-center gap-4">
            <label className="inline-flex items-center gap-2 text-xs font-medium text-[#131b2e] cursor-pointer select-none">
              <input
                type="checkbox"
                checked={onlyRemainingBudget}
                onChange={(e) => setOnlyRemainingBudget(e.target.checked)}
                className="w-4 h-4 rounded accent-[#4F46E5] cursor-pointer"
              />
              <span>Fits Remaining Budget ({formatINR(budget.remaining)})</span>
            </label>

            <span className="text-xs text-[#464555]">
              Showing <strong className="font-metric text-[#131b2e]">{filteredProducts.length}</strong> products
            </span>
          </div>
        </div>
      </section>

      {/* Product Grid or Empty State */}
      {filteredProducts.length === 0 ? (
        <div className="bg-white rounded-3xl border border-slate-900/[0.06] p-12 text-center">
          <h2 className="font-display text-lg font-bold text-[#131b2e]">
            No products match your filters
          </h2>
          <p className="text-sm text-[#464555] mt-1 mb-5">
            Try increasing your maximum price or clearing the category and budget filters.
          </p>
          <button
            type="button"
            onClick={resetFilters}
            className="px-4 py-2 text-xs font-semibold text-white bg-[#4F46E5] hover:bg-[#3525cd] rounded-lg cursor-pointer"
          >
            Reset All Filters
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredProducts.map((product) => {
            const rec = recMap.get(product.id);
            const label =
              product.price <= budget.remaining
                ? rec?.badgeLabel || 'Fits Your Budget'
                : product.popularityScore >= 90
                ? 'Popular Choice'
                : undefined;

            return (
              <ProductCard
                key={product.id}
                product={product}
                quantityInBasket={basketQuantities.get(product.id) ?? 0}
                activeVariantInBasket={primaryVariantByProductId.get(product.id)}
                isWishlisted={wishlistIds.includes(product.id)}
                isCompared={comparedIds.includes(product.id)}
                label={label}
                onAddToBasket={(p, v) => onAddToBasket(p, v)}
                onIncrement={onIncrement}
                onDecrement={onDecrement}
                onViewDetails={onViewDetails}
                onToggleWishlist={onToggleWishlist}
                onToggleCompare={onToggleCompare}
              />
            );
          })}
        </div>
      )}
    </div>
  );
};
