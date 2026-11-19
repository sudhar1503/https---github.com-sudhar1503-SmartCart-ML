import React from 'react';
import {
  ArrowRight,
  BookOpen,
  Dumbbell,
  Laptop,
  Search,
  Shirt,
  ShoppingBasket,
  Sofa,
  Sparkles,
  Wallet,
} from 'lucide-react';
import { CATEGORY_SUMMARIES, PRODUCT_CATEGORIES } from '../data/catalog';
import {
  Budget,
  PageId,
  Product,
  ProductCategory,
  Recommendation,
  ShoppingBasket as ShoppingBasketType,
} from '../types/smartcart';
import { formatINR } from '../services/formatters';
import { ProductCard } from '../components/ProductCard';

interface HomePageProps {
  searchQuery: string;
  onSearchChange: (q: string) => void;
  onStartShopping: () => void;
  onSelectCategory: (category: ProductCategory) => void;
  onNavigate: (page: PageId) => void;
  budget: Budget;
  basket: ShoppingBasketType;
  pickedForYou: Recommendation[];
  popularProducts: Product[];
  recentlyViewedProducts: Product[];
  budgetFriendlyProducts: Product[];
  wishlistIds: string[];
  basketQuantities: Map<string, number>;
  primaryVariantByProductId: Map<string, string>;
  onAddToBasket: (product: Product, variant?: string, fromSuggestion?: boolean) => void;
  onIncrement: (productId: string, variant: string) => void;
  onDecrement: (productId: string, variant: string) => void;
  onViewDetails: (product: Product) => void;
  onToggleWishlist: (productId: string) => void;
}

const CATEGORY_ICONS: Record<
  ProductCategory,
  React.ComponentType<{ className?: string }>
> = {
  Electronics: Laptop,
  Fashion: Shirt,
  'Home and Kitchen': Sofa,
  'Beauty and Personal Care': Sparkles,
  'Sports and Fitness': Dumbbell,
  'Books and Accessories': BookOpen,
};

export const HomePage: React.FC<HomePageProps> = ({
  searchQuery,
  onSearchChange,
  onStartShopping,
  onSelectCategory,
  onNavigate,
  budget,
  basket,
  pickedForYou,
  popularProducts,
  recentlyViewedProducts,
  budgetFriendlyProducts,
  wishlistIds,
  basketQuantities,
  primaryVariantByProductId,
  onAddToBasket,
  onIncrement,
  onDecrement,
  onViewDetails,
  onToggleWishlist,
}) => {
  const handleHeroSearch = (e: React.FormEvent) => {
    e.preventDefault();
    onStartShopping();
  };

  return (
    <div className="space-y-10">
      {/* Hero + Shopping Budget Card */}
      <section className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
        {/* Welcome Banner */}
        <div className="lg:col-span-7 bg-white rounded-3xl border border-slate-900/[0.06] p-6 sm:p-8 flex flex-col justify-between shadow-[0_4px_20px_-4px_rgba(15,23,42,0.04)]">
          <div>
            <p className="text-xs font-semibold text-[#3525cd] mb-2">
              Shop Smarter. Spend Better.
            </p>
            <h1 className="font-display text-3xl sm:text-4xl font-extrabold text-[#131b2e] tracking-tight text-balance">
              Welcome to SmartCart!
            </h1>
            <p className="text-sm sm:text-base text-[#464555] mt-2.5 max-w-xl">
              Find the right products and stay within your budget.
            </p>

            {/* Prominent Search */}
            <form onSubmit={handleHeroSearch} className="mt-6 flex flex-col sm:flex-row gap-3">
              <div className="relative flex-1">
                <Search
                  className="w-4 h-4 text-[#777587] absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none"
                  aria-hidden="true"
                />
                <input
                  type="search"
                  value={searchQuery}
                  onChange={(e) => onSearchChange(e.target.value)}
                  placeholder="Search for products, brands or categories..."
                  aria-label="Search for products, brands or categories"
                  className="w-full h-11 pl-10 pr-4 text-sm bg-[#faf8ff] border border-[#CBD5E1] rounded-xl placeholder:text-[#777587] focus:outline-none focus:bg-white focus:border-[#4F46E5] focus:ring-3 focus:ring-[#4F46E5]/15"
                />
              </div>
              <button
                type="submit"
                className="h-11 px-6 inline-flex items-center justify-center gap-2 text-sm font-semibold text-white bg-[#4F46E5] hover:bg-[#3525cd] rounded-xl whitespace-nowrap shrink-0 transition-colors cursor-pointer"
              >
                <span>Start Shopping</span>
                <ArrowRight className="w-4 h-4" aria-hidden="true" />
              </button>
            </form>
          </div>

          {/* Continue Shopping Prompt if Basket Has Items */}
          {basket.totalQuantity > 0 && (
            <div className="mt-6 pt-5 border-t border-slate-900/[0.06] flex flex-wrap items-center justify-between gap-3">
              <div className="flex items-center gap-2.5 text-xs text-[#464555]">
                <ShoppingBasket className="w-4 h-4 text-[#4F46E5]" aria-hidden="true" />
                <span>
                  Continue shopping: You have{' '}
                  <strong className="text-[#131b2e]">
                    {basket.totalQuantity} item(s)
                  </strong>{' '}
                  in your basket ({formatINR(basket.subtotal)}).
                </span>
              </div>
              <button
                type="button"
                onClick={() => onNavigate('basket')}
                className="text-xs font-semibold text-[#3525cd] hover:underline cursor-pointer"
              >
                Open My Shopping Basket
              </button>
            </div>
          )}
        </div>

        {/* My Shopping Budget Card */}
        <div className="lg:col-span-5 bg-white rounded-3xl border border-slate-900/[0.06] p-6 sm:p-8 flex flex-col justify-between shadow-[0_4px_20px_-4px_rgba(15,23,42,0.04)]">
          <div>
            <div className="flex items-center justify-between gap-3 mb-5">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-[#f2f3ff] text-[#4F46E5] flex items-center justify-center">
                  <Wallet className="w-4 h-4" aria-hidden="true" />
                </div>
                <div>
                  <h2 className="font-display text-lg font-bold text-[#131b2e]">
                    My Shopping Budget
                  </h2>
                  <p className="text-xs text-[#464555]">Updates live with your basket</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => onNavigate('planner')}
                className="text-xs font-semibold text-[#3525cd] hover:underline cursor-pointer"
              >
                Edit Budget
              </button>
            </div>

            <div className="grid grid-cols-3 gap-2.5 sm:gap-3 mb-5">
              <div className="p-3 rounded-2xl bg-[#faf8ff]">
                <p className="text-[11px] text-[#464555]">Budget</p>
                <p className="font-metric text-sm sm:text-lg font-bold text-[#131b2e] mt-0.5">
                  {formatINR(budget.totalBudget)}
                </p>
              </div>
              <div className="p-3 rounded-2xl bg-[#faf8ff]">
                <p className="text-[11px] text-[#464555]">Spent</p>
                <p className="font-metric text-sm sm:text-lg font-bold text-[#131b2e] mt-0.5">
                  {formatINR(budget.spent)}
                </p>
              </div>
              <div className="p-3 rounded-2xl bg-[#faf8ff]">
                <p className="text-[11px] text-[#464555]">
                  {budget.status === 'over' ? 'Over by' : 'Remaining'}
                </p>
                <p
                  className={`font-metric text-sm sm:text-lg font-bold mt-0.5 ${
                    budget.status === 'over'
                      ? 'text-[#BE123C]'
                      : budget.status === 'approaching'
                      ? 'text-[#c2410c]'
                      : 'text-[#047857]'
                  }`}
                >
                  {budget.status === 'over'
                    ? formatINR(budget.overAmount)
                    : formatINR(budget.remaining)}
                </p>
              </div>
            </div>

            {/* Progress Bar */}
            <div className="space-y-2">
              <div
                role="progressbar"
                aria-valuenow={budget.usagePercent}
                aria-valuemin={0}
                aria-valuemax={100}
                aria-label="Shopping budget progress"
                className="w-full h-2.5 bg-[#E2E8F0] rounded-full overflow-hidden"
              >
                <div
                  className="h-full rounded-full transition-all duration-300"
                  style={{
                    width: `${budget.usagePercent}%`,
                    backgroundColor:
                      budget.status === 'over'
                        ? '#F43F5E'
                        : budget.status === 'approaching'
                        ? '#f97316'
                        : '#10B981',
                  }}
                />
              </div>
              <p
                className={`text-xs font-medium ${
                  budget.status === 'over'
                    ? 'text-[#BE123C]'
                    : budget.status === 'approaching'
                    ? 'text-[#c2410c]'
                    : 'text-[#047857]'
                }`}
              >
                {budget.statusMessage}
              </p>
            </div>
          </div>

          <div className="mt-6 pt-4 border-t border-slate-900/[0.06] flex items-center justify-between gap-3">
            <span className="text-xs text-[#464555]">
              Need a balanced basket?
            </span>
            <button
              type="button"
              onClick={() => onNavigate('planner')}
              className="px-3.5 py-2 text-xs font-semibold text-[#3525cd] bg-[#f2f3ff] hover:bg-[#eaedff] rounded-lg transition-colors cursor-pointer"
            >
              Find My Best Shopping Basket
            </button>
          </div>
        </div>
      </section>

      {/* Picked for You */}
      <section className="space-y-4">
        <div className="flex flex-wrap items-end justify-between gap-3">
          <div>
            <h2 className="font-display text-2xl font-bold text-[#131b2e]">
              Picked for You
            </h2>
            <p className="text-sm text-[#464555] mt-0.5">
              Demonstration suggestions matching your preferences and {formatINR(budget.remaining)} remaining budget.
            </p>
          </div>
          <button
            type="button"
            onClick={() => onNavigate('recommended')}
            className="text-sm font-semibold text-[#3525cd] hover:underline inline-flex items-center gap-1 cursor-pointer"
          >
            <span>See all recommendations</span>
            <ArrowRight className="w-4 h-4" aria-hidden="true" />
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {pickedForYou.slice(0, 4).map((rec) => (
            <ProductCard
              key={rec.product.id}
              product={rec.product}
              quantityInBasket={basketQuantities.get(rec.product.id) ?? 0}
              activeVariantInBasket={primaryVariantByProductId.get(rec.product.id)}
              isWishlisted={wishlistIds.includes(rec.product.id)}
              label={rec.badgeLabel}
              recommendationReason={rec.explanation.summary}
              onAddToBasket={(p, v) => onAddToBasket(p, v, true)}
              onIncrement={onIncrement}
              onDecrement={onDecrement}
              onViewDetails={onViewDetails}
              onToggleWishlist={onToggleWishlist}
            />
          ))}
        </div>
      </section>

      {/* Shopping Categories */}
      <section className="space-y-4">
        <div>
          <h2 className="font-display text-2xl font-bold text-[#131b2e]">
            Shop by Category
          </h2>
          <p className="text-sm text-[#464555] mt-0.5">
            Explore products across six everyday shopping categories.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {PRODUCT_CATEGORIES.map((category) => {
            const Icon = CATEGORY_ICONS[category];
            const summary = CATEGORY_SUMMARIES[category];
            return (
              <button
                key={category}
                type="button"
                onClick={() => onSelectCategory(category)}
                className="group bg-white hover:bg-[#f2f3ff]/60 rounded-2xl border border-slate-900/[0.07] hover:border-[#4F46E5]/30 p-5 flex items-center gap-4 text-left transition-all cursor-pointer"
              >
                <div className="w-11 h-11 rounded-xl bg-[#f2f3ff] text-[#4F46E5] flex items-center justify-center shrink-0 group-hover:bg-[#4F46E5] group-hover:text-white transition-colors">
                  <Icon className="w-5 h-5" aria-hidden="true" />
                </div>
                <div className="min-w-0 flex-1">
                  <h3 className="font-display text-base font-bold text-[#131b2e] truncate">
                    {category}
                  </h3>
                  <p className="text-xs text-[#464555] truncate mt-0.5">
                    {summary.subtitle} · {summary.countLabel}
                  </p>
                </div>
                <ArrowRight
                  className="w-4 h-4 text-[#777587] group-hover:text-[#4F46E5] shrink-0"
                  aria-hidden="true"
                />
              </button>
            );
          })}
        </div>
      </section>

      {/* Popular Products & Budget-Friendly Finds */}
      <section className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Popular Products */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="font-display text-xl font-bold text-[#131b2e]">
              Popular Products
            </h2>
            <button
              type="button"
              onClick={() => onNavigate('explore')}
              className="text-xs font-semibold text-[#3525cd] hover:underline cursor-pointer"
            >
              Explore all
            </button>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {popularProducts.slice(0, 2).map((product) => (
              <ProductCard
                key={product.id}
                product={product}
                quantityInBasket={basketQuantities.get(product.id) ?? 0}
                activeVariantInBasket={primaryVariantByProductId.get(product.id)}
                isWishlisted={wishlistIds.includes(product.id)}
                label="Popular Choice"
                onAddToBasket={(p, v) => onAddToBasket(p, v, false)}
                onIncrement={onIncrement}
                onDecrement={onDecrement}
                onViewDetails={onViewDetails}
                onToggleWishlist={onToggleWishlist}
              />
            ))}
          </div>
        </div>

        {/* Budget-Friendly Finds */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="font-display text-xl font-bold text-[#131b2e]">
              Budget-Friendly Finds
            </h2>
            <span className="text-xs text-[#047857] font-medium">
              Under {formatINR(Math.max(1500, budget.remaining))}
            </span>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {budgetFriendlyProducts.slice(0, 2).map((product) => (
              <ProductCard
                key={product.id}
                product={product}
                quantityInBasket={basketQuantities.get(product.id) ?? 0}
                activeVariantInBasket={primaryVariantByProductId.get(product.id)}
                isWishlisted={wishlistIds.includes(product.id)}
                label="Fits Your Budget"
                onAddToBasket={(p, v) => onAddToBasket(p, v, false)}
                onIncrement={onIncrement}
                onDecrement={onDecrement}
                onViewDetails={onViewDetails}
                onToggleWishlist={onToggleWishlist}
              />
            ))}
          </div>
        </div>
      </section>

      {/* Recently Viewed Strip */}
      {recentlyViewedProducts.length > 0 && (
        <section className="space-y-4">
          <h2 className="font-display text-xl font-bold text-[#131b2e]">
            Recently Viewed
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {recentlyViewedProducts.slice(0, 3).map((product) => (
              <div
                key={product.id}
                className="bg-white rounded-2xl border border-slate-900/[0.07] p-3.5 flex items-center gap-3.5"
              >
                <img
                  src={product.image}
                  alt={product.name}
                  referrerPolicy="no-referrer"
                  className="w-16 h-16 rounded-xl object-cover bg-[#F8FAFC] shrink-0"
                />
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-semibold text-[#131b2e] truncate">
                    {product.name}
                  </p>
                  <p className="font-metric text-xs font-bold text-[#3525cd] mt-0.5">
                    {formatINR(product.price)}
                  </p>
                  <button
                    type="button"
                    onClick={() => onViewDetails(product)}
                    className="text-xs font-medium text-[#464555] hover:text-[#131b2e] underline mt-1 cursor-pointer"
                  >
                    View Details
                  </button>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}
    </div>
  );
};
