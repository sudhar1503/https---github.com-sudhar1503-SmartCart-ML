import React, { useEffect, useMemo, useRef, useState } from 'react';
import { Check } from 'lucide-react';
import {
  CATALOG_PRODUCTS,
  DEFAULT_CATEGORY_ALLOCATIONS,
  DEFAULT_PREFERENCES,
  DEFAULT_USER,
  INITIAL_BASKET_ITEMS,
} from './data/catalog';
import {
  BasketItem,
  CategoryAllocations,
  FeedbackAction,
  PageId,
  Product,
  ProductCategory,
  ProductFeedbackState,
  RecommendationSettings,
  SmartSwapOption,
  User,
  UserPreferences,
} from './types/smartcart';
import { storageService } from './services/storageService';
import { basketService } from './services/basketService';
import { recommendationService } from './services/recommendationService';
import { formatINR } from './services/formatters';
import { Sidebar } from './components/Sidebar';
import { Header } from './components/Header';
import { ProductDetailModal } from './components/ProductDetailModal';
import { ComparisonModal } from './components/ComparisonModal';
import { HomePage } from './pages/HomePage';
import { ExplorePage } from './pages/ExplorePage';
import { RecommendedPage } from './pages/RecommendedPage';
import { BasketPage } from './pages/BasketPage';
import { BudgetPlannerPage } from './pages/BudgetPlannerPage';
import { InsightsPage } from './pages/InsightsPage';
import { ProfilePage } from './pages/ProfilePage';
import { HowItWorksPage } from './pages/HowItWorksPage';

export default function App() {
  const [activePage, setActivePage] = useState<PageId>('home');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Persistent Demo State (browser localStorage only)
  const [basketItems, setBasketItems] = useState<BasketItem[]>(() =>
    storageService.loadBasket()
  );
  const [totalBudget, setTotalBudget] = useState<number>(() =>
    storageService.loadBudget()
  );
  const [categoryAllocations, setCategoryAllocations] = useState<CategoryAllocations>(() =>
    storageService.loadAllocations()
  );
  const [wishlistIds, setWishlistIds] = useState<string[]>(() =>
    storageService.loadWishlist()
  );
  const [recentlyViewedIds, setRecentlyViewedIds] = useState<string[]>(() =>
    storageService.loadRecentlyViewed()
  );
  const [preferences, setPreferences] = useState<UserPreferences>(() =>
    storageService.loadPreferences()
  );
  const [user, setUser] = useState<User>(() => storageService.loadUser());
  const [feedback, setFeedback] = useState<ProductFeedbackState>(() =>
    storageService.loadFeedback()
  );
  const [swapSavings, setSwapSavings] = useState<number>(() =>
    storageService.loadSwapSavings()
  );
  const [selectedFromSuggestionsIds, setSelectedFromSuggestionsIds] = useState<string[]>(() =>
    storageService.loadSelectedFromSuggestions()
  );

  // Transient UI State
  const [searchQuery, setSearchQuery] = useState('');
  const [exploreCategory, setExploreCategory] = useState<'All' | ProductCategory>('All');
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [comparedIds, setComparedIds] = useState<string[]>([]);
  const [comparisonOpen, setComparisonOpen] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [budgetToast, setBudgetToast] = useState<string | null>(null);

  // Sync demo state to localStorage
  useEffect(() => storageService.saveBasket(basketItems), [basketItems]);
  useEffect(() => storageService.saveBudget(totalBudget), [totalBudget]);
  useEffect(() => storageService.saveAllocations(categoryAllocations), [categoryAllocations]);
  useEffect(() => storageService.saveWishlist(wishlistIds), [wishlistIds]);
  useEffect(() => storageService.saveRecentlyViewed(recentlyViewedIds), [recentlyViewedIds]);
  useEffect(() => storageService.savePreferences(preferences), [preferences]);
  useEffect(() => storageService.saveUser(user), [user]);
  useEffect(() => storageService.saveFeedback(feedback), [feedback]);
  useEffect(() => storageService.saveSwapSavings(swapSavings), [swapSavings]);
  useEffect(
    () => storageService.saveSelectedFromSuggestions(selectedFromSuggestionsIds),
    [selectedFromSuggestionsIds]
  );

  const showToast = (msg: string) => {
    setToastMessage(msg);
    window.setTimeout(() => {
      setToastMessage((prev) => (prev === msg ? null : prev));
    }, 3000);
  };

  // Derived Basket & Budget Models
  const basket = useMemo(
    () => basketService.calculateBasket(basketItems),
    [basketItems]
  );

  const budget = useMemo(
    () => basketService.calculateBudget(totalBudget, basket, categoryAllocations),
    [totalBudget, basket, categoryAllocations]
  );
  // Budget Exceeded Popup
  useEffect(() => {
  if (budget.status === 'over') {
    setBudgetToast(
      `You have exceeded your budget by ${formatINR(Math.abs(budget.remaining))}.`
    );

    const timer = window.setTimeout(() => {
      setBudgetToast(null);
    }, 4000);

    return () => window.clearTimeout(timer);
  }

  setBudgetToast(null);
}, [budget.status, budget.remaining]);
  

  const recommendations = useMemo(
    () =>
      recommendationService.getRecommendations(
        preferences,
        budget.remaining,
        basketItems,
        wishlistIds,
        feedback
      ),
    [preferences, budget.remaining, basketItems, wishlistIds, feedback]
  );

  const recommendationSections = useMemo(
    () =>
      recommendationService.getCategorizedRecommendations(
        preferences,
        budget.remaining,
        basketItems,
        wishlistIds,
        feedback
      ),
    [preferences, budget.remaining, basketItems, wishlistIds, feedback]
  );

  const recommendationMap = useMemo(
    () => new Map(recommendations.map((r) => [r.product.id, r])),
    [recommendations]
  );

  // Aggregate quantity per productId + track first variant in basket for card stepper
  const basketQuantities = useMemo(() => {
    const map = new Map<string, number>();
    basketItems.forEach((item) => {
      map.set(item.productId, (map.get(item.productId) ?? 0) + item.quantity);
    });
    return map;
  }, [basketItems]);

  const primaryVariantByProductId = useMemo(() => {
    const map = new Map<string, string>();
    basketItems.forEach((item) => {
      if (!map.has(item.productId)) {
        map.set(item.productId, item.selectedVariant);
      }
    });
    return map;
  }, [basketItems]);

  const popularProducts = useMemo(
    () => [...CATALOG_PRODUCTS].sort((a, b) => b.popularityScore - a.popularityScore),
    []
  );

  const budgetFriendlyProducts = useMemo(
    () =>
      CATALOG_PRODUCTS.filter((p) => p.price <= Math.max(1500, budget.remaining)).sort(
        (a, b) => a.price - b.price
      ),
    [budget.remaining]
  );

  const recentlyViewedProducts = useMemo(
    () =>
      recentlyViewedIds
        .map((id) => CATALOG_PRODUCTS.find((p) => p.id === id))
        .filter((p): p is Product => Boolean(p)),
    [recentlyViewedIds]
  );

  const comparedProducts = useMemo(
    () =>
      comparedIds
        .map((id) => CATALOG_PRODUCTS.find((p) => p.id === id))
        .filter((p): p is Product => Boolean(p)),
    [comparedIds]
  );

  const analytics = useMemo(
    () =>
      basketService.buildAnalytics(
        basket,
        budget,
        recentlyViewedIds,
        swapSavings,
        selectedFromSuggestionsIds,
        recommendations.slice(0, 6).length
      ),
    [basket, budget, recentlyViewedIds, swapSavings, selectedFromSuggestionsIds, recommendations]
  );

  // Navigation & Inspection Handlers
  const handleNavigate = (page: PageId) => {
    setActivePage(page);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleViewDetails = (product: Product) => {
    setSelectedProduct(product);
    setRecentlyViewedIds((prev) =>
      [product.id, ...prev.filter((id) => id !== product.id)].slice(0, 10)
    );
  };

  // Variant-Safe Basket Handlers: Every item is uniquely identified by (productId, selectedVariant)
  const handleAddToBasket = (
    product: Product,
    variant?: string,
    fromSuggestion = false
  ) => {
    const chosenVariant = variant || product.variants[0];
    setBasketItems((prev) => {
      const existingIdx = prev.findIndex(
        (i) => i.productId === product.id && i.selectedVariant === chosenVariant
      );
      if (existingIdx >= 0) {
        return prev.map((item, idx) =>
          idx === existingIdx
            ? { ...item, quantity: Math.max(1, item.quantity + 1) }
            : item
        );
      }
      return [
        ...prev,
        { productId: product.id, quantity: 1, selectedVariant: chosenVariant },
      ];
    });
    if (fromSuggestion) {
      setSelectedFromSuggestionsIds((prev) =>
        prev.includes(product.id) ? prev : [...prev, product.id]
      );
    }
    showToast(`Added ${product.name} (${chosenVariant}) to your basket`);
  };

  const handleIncrement = (productId: string, selectedVariant: string) => {
    setBasketItems((prev) =>
      prev.map((item) =>
        item.productId === productId && item.selectedVariant === selectedVariant
          ? { ...item, quantity: Math.max(1, item.quantity + 1) }
          : item
      )
    );
  };

  const handleDecrement = (productId: string, selectedVariant: string) => {
    setBasketItems((prev) =>
      prev.flatMap((item) => {
        if (item.productId !== productId || item.selectedVariant !== selectedVariant) {
          return [item];
        }
        if (item.quantity <= 1) {
          return [];
        }
        return [{ ...item, quantity: item.quantity - 1 }];
      })
    );
  };

  const handleRemoveFromBasket = (productId: string, selectedVariant: string) => {
    setBasketItems((prev) =>
      prev.filter(
        (item) =>
          !(item.productId === productId && item.selectedVariant === selectedVariant)
      )
    );
  };

  // Variant-Safe Smart Swap: Replaces ONLY (currentProduct.id, currentVariant) while preserving currentQuantity
  const handleConfirmSwap = (swap: SmartSwapOption) => {
    const altVariant = swap.alternativeProduct.variants[0];
    const preservedQty = Math.max(1, swap.currentQuantity);

    setBasketItems((prev) => {
      const remainingItems = prev.filter(
        (item) =>
          !(
            item.productId === swap.currentProduct.id &&
            item.selectedVariant === swap.currentVariant
          )
      );

      const existingAltIdx = remainingItems.findIndex(
        (item) =>
          item.productId === swap.alternativeProduct.id &&
          item.selectedVariant === altVariant
      );

      if (existingAltIdx >= 0) {
        return remainingItems.map((item, idx) =>
          idx === existingAltIdx
            ? { ...item, quantity: item.quantity + preservedQty }
            : item
        );
      }

      return [
        ...remainingItems,
        {
          productId: swap.alternativeProduct.id,
          quantity: preservedQty,
          selectedVariant: altVariant,
        },
      ];
    });

    setSwapSavings((prev) => prev + swap.totalSavings);
    showToast(
      `Replaced ${swap.currentProduct.name} (${swap.currentVariant}) with ${swap.alternativeProduct.name} — saved ${formatINR(swap.totalSavings)}`
    );
  };

  const handleToggleWishlist = (productId: string) => {
    setWishlistIds((prev) =>
      prev.includes(productId)
        ? prev.filter((id) => id !== productId)
        : [...prev, productId]
    );
  };

  const handleToggleCompare = (productId: string) => {
    setComparedIds((prev) => {
      if (prev.includes(productId)) {
        return prev.filter((id) => id !== productId);
      }
      if (prev.length >= 3) {
        showToast('You can compare up to 3 products at a time');
        return prev;
      }
      return [...prev, productId];
    });
  };

  const handleRecommendationFeedback = (product: Product, action: FeedbackAction) => {
    if (action === 'more-like-this') {
      setFeedback((prev) => ({
        ...prev,
        boostedIds: Array.from(new Set([...prev.boostedIds, product.id])),
      }));
      if (!preferences.favoriteCategories.includes(product.category)) {
        setPreferences((prev) => ({
          ...prev,
          favoriteCategories: [...prev.favoriteCategories, product.category],
        }));
      }
      showToast(`We will show more products like ${product.name}`);
    } else if (action === 'find-cheaper') {
      setExploreCategory(product.category);
      setActivePage('explore');
      showToast(`Showing ${product.category} options to compare prices`);
    } else if (action === 'not-interested') {
      setFeedback((prev) => ({
        ...prev,
        hiddenIds: Array.from(new Set([...prev.hiddenIds, product.id])),
      }));
      showToast(`Hid ${product.name} from recommendations`);
    } else if (action === 'avoid-brand') {
      setFeedback((prev) => ({
        ...prev,
        avoidedBrands: Array.from(new Set([...prev.avoidedBrands, product.brand])),
      }));
      showToast(`Excluded ${product.brand} from recommendations`);
    }
  };

  const handleResetDemoData = () => {
    storageService.resetAllDemoData();
    setBasketItems(INITIAL_BASKET_ITEMS);
    setTotalBudget(5000);
    setCategoryAllocations(DEFAULT_CATEGORY_ALLOCATIONS);
    setWishlistIds(['keyform-mechanical-keyboard', 'atelier-pour-kettle']);
    setRecentlyViewedIds([
      'aero-anc-headphones',
      'lumen-desk-lamp',
      'design-books-journal-set',
    ]);
    setPreferences(DEFAULT_PREFERENCES);
    setUser(DEFAULT_USER);
    setFeedback({
      boostedIds: [],
      hiddenIds: [],
      avoidedBrands: [],
      cheaperRequestedIds: [],
    });
    setSwapSavings(0);
    setSelectedFromSuggestionsIds([]);
    showToast('Demo preferences and basket reset to defaults');
  };

  const handleUpdateSettings = (nextSettings: RecommendationSettings) => {
    setPreferences((prev) => ({
      ...prev,
      recommendationSettings: nextSettings,
    }));
  };

 
return (
  <div className="min-h-screen flex bg-[#faf8ff] text-[#131b2e]">

    {/* Budget Exceeded Popup */}
    {budgetToast && (
      <div className="fixed top-5 left-1/2 -translate-x-1/2 z-[9999] w-[90%] max-w-sm">
        <div className="flex items-center gap-3 rounded-lg border border-gray-200 bg-white px-4 py-3 shadow-lg">

          <span className="text-red-600 text-2xl">⚠</span>

          <div className="flex-1">
            <p className="text-sm font-bold text-red-600">
              Budget Exceeded!
            </p>

            <p className="text-sm text-gray-700">
              {budgetToast}
            </p>
          </div>

          <button
            type="button"
            onClick={() => setBudgetToast(null)}
            className="text-gray-500 hover:text-gray-800 text-lg"
            aria-label="Close notification"
          >
            ✕
          </button>

        </div>
      </div>
    )}

    {/* Left Navigation Sidebar + Mobile Drawer */}
    <Sidebar
      activePage={activePage}
      onNavigate={handleNavigate}
      basketCount={basket.totalQuantity}
      budgetRemaining={budget.remaining}
      isOverBudget={budget.status === 'over'}
      isMobileOpen={mobileMenuOpen}
      onCloseMobile={() => setMobileMenuOpen(false)}
    />

    {/* Main Content Shell */}
    <div className="flex-1 min-w-0 flex flex-col">
      <Header
        activePage={activePage}
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        onSearchSubmit={() => handleNavigate('explore')}
        budget={budget}
        basketCount={basket.totalQuantity}
        user={user}
        onNavigate={handleNavigate}
        onOpenMobileMenu={() => setMobileMenuOpen(true)}
      />

      {/* Subtle Non-Intrusive Toast Notification */}
      {toastMessage && (
        <div className="px-4 sm:px-6 lg:px-8 pt-4">
          <div
            role="status"
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-[#ecfdf5] border border-[#10B981]/25 text-xs font-semibold text-[#047857]"
          >
            <Check className="w-3.5 h-3.5 shrink-0" aria-hidden="true" />
            <span>{toastMessage}</span>
          </div>
        </div>
      )}

        <main className="flex-1 px-4 sm:px-6 lg:px-8 py-7 max-w-[1200px] w-full mx-auto">
          {activePage === 'home' && (
            <HomePage
              searchQuery={searchQuery}
              onSearchChange={setSearchQuery}
              onStartShopping={() => handleNavigate('explore')}
              onSelectCategory={(cat) => {
                setExploreCategory(cat);
                handleNavigate('explore');
              }}
              onNavigate={handleNavigate}
              budget={budget}
              basket={basket}
              pickedForYou={recommendations}
              popularProducts={popularProducts}
              recentlyViewedProducts={recentlyViewedProducts}
              budgetFriendlyProducts={budgetFriendlyProducts}
              wishlistIds={wishlistIds}
              basketQuantities={basketQuantities}
              primaryVariantByProductId={primaryVariantByProductId}
              onAddToBasket={handleAddToBasket}
              onIncrement={handleIncrement}
              onDecrement={handleDecrement}
              onViewDetails={handleViewDetails}
              onToggleWishlist={handleToggleWishlist}
            />
          )}

          {activePage === 'explore' && (
            <ExplorePage
              searchQuery={searchQuery}
              onSearchChange={setSearchQuery}
              selectedCategory={exploreCategory}
              onCategoryChange={setExploreCategory}
              budget={budget}
              recommendations={recommendations}
              wishlistIds={wishlistIds}
              comparedIds={comparedIds}
              basketQuantities={basketQuantities}
              primaryVariantByProductId={primaryVariantByProductId}
              onAddToBasket={(p, v) => handleAddToBasket(p, v, false)}
              onIncrement={handleIncrement}
              onDecrement={handleDecrement}
              onViewDetails={handleViewDetails}
              onToggleWishlist={handleToggleWishlist}
              onToggleCompare={handleToggleCompare}
              onOpenComparison={() => setComparisonOpen(true)}
            />
          )}

          {activePage === 'recommended' && (
            <RecommendedPage
              sections={recommendationSections}
              budget={budget}
              wishlistIds={wishlistIds}
              basketQuantities={basketQuantities}
              primaryVariantByProductId={primaryVariantByProductId}
              hasHiddenOrAvoided={
                feedback.hiddenIds.length > 0 || feedback.avoidedBrands.length > 0
              }
              onAddToBasket={(p, v) => handleAddToBasket(p, v, true)}
              onIncrement={handleIncrement}
              onDecrement={handleDecrement}
              onViewDetails={handleViewDetails}
              onToggleWishlist={handleToggleWishlist}
              onFeedback={handleRecommendationFeedback}
              onResetFeedback={() =>
                setFeedback({
                  boostedIds: [],
                  hiddenIds: [],
                  avoidedBrands: [],
                  cheaperRequestedIds: [],
                })
              }
            />
          )}

          {activePage === 'basket' && (
            <BasketPage
              basket={basket}
              budget={budget}
              onIncrement={handleIncrement}
              onDecrement={handleDecrement}
              onRemove={handleRemoveFromBasket}
              onConfirmSwap={handleConfirmSwap}
              onViewDetails={handleViewDetails}
              onNavigate={handleNavigate}
            />
          )}

          {activePage === 'planner' && (
            <BudgetPlannerPage
              budget={budget}
              basket={basket}
              recommendations={recommendations}
              preferences={preferences}
              onBudgetChange={setTotalBudget}
              onAllocationsChange={setCategoryAllocations}
              onApplyOptimizedBasket={(items) => {
                setBasketItems(items);
                handleNavigate('basket');
                showToast('Applied suggested budget-friendly basket');
              }}
              onViewDetails={handleViewDetails}
            />
          )}

          {activePage === 'insights' && (
            <InsightsPage
              analytics={analytics}
              budget={budget}
              basket={basket}
              settings={preferences.recommendationSettings}
              onSettingsChange={handleUpdateSettings}
            />
          )}

          {activePage === 'profile' && (
            <ProfilePage
              user={user}
              preferences={preferences}
              onUpdateUser={setUser}
              onUpdatePreferences={(next) => {
                setPreferences(next);
                setTotalBudget(next.maxShoppingBudget);
              }}
              onResetDemoData={handleResetDemoData}
            />
          )}

          {activePage === 'how-it-works' && (
            <HowItWorksPage onNavigate={handleNavigate} />
          )}
        </main>

        {/* Clean Footer */}
        <footer className="border-t border-slate-900/[0.06] bg-white mt-12">
          <div className="max-w-[1200px] mx-auto px-4 sm:px-6 lg:px-8 py-6 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-[#464555]">
            <p className="font-medium text-[#131b2e]">
              SmartCart ML · Shop Smarter. Spend Better. (Academic Shopping Demonstration)
            </p>
            <div className="flex flex-wrap items-center gap-5">
              <button
                type="button"
                onClick={() => handleNavigate('explore')}
                className="hover:text-[#131b2e] cursor-pointer"
              >
                Explore Products
              </button>
              <button
                type="button"
                onClick={() => handleNavigate('planner')}
                className="hover:text-[#131b2e] cursor-pointer"
              >
                Budget Planner
              </button>
              <button
                type="button"
                onClick={() => handleNavigate('how-it-works')}
                className="hover:text-[#131b2e] cursor-pointer"
              >
                How SmartCart Works
              </button>
            </div>
          </div>
        </footer>
      </div>

      {/* Product Detail Modal */}
      <ProductDetailModal
        product={selectedProduct}
        explanation={
          selectedProduct
            ? recommendationMap.get(selectedProduct.id)?.explanation
            : undefined
        }
        remainingBudget={budget.remaining}
        isWishlisted={
          selectedProduct ? wishlistIds.includes(selectedProduct.id) : false
        }
        onClose={() => setSelectedProduct(null)}
        onAddToBasket={(p, v) => handleAddToBasket(p, v, false)}
        onToggleWishlist={handleToggleWishlist}
        onSelectProduct={(p) => handleViewDetails(p)}
      />

      {/* Product Comparison Modal */}
      {comparisonOpen && (
        <ComparisonModal
          products={comparedProducts}
          remainingBudget={budget.remaining}
          onClose={() => setComparisonOpen(false)}
          onRemoveProduct={(id) => {
            setComparedIds((prev) => prev.filter((x) => x !== id));
            if (comparedIds.length <= 1) setComparisonOpen(false);
          }}
          onAddToBasket={(p, v) => handleAddToBasket(p, v, false)}
        />
      )}
    </div>
  );
}
