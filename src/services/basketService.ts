import { CATALOG_PRODUCTS, PRODUCT_CATEGORIES } from '../data/catalog';
import {
  ApiResponse,
  BackendOptimizationRequest,
  BasketItem,
  Budget,
  CategoryAllocations,
  OptimizationResult,
  OptimizedSelectionItem,
  Product,
  ProductCategory,
  Recommendation,
  ShoppingAnalytics,
  ShoppingBasket,
  SmartSwapOption,
  UserPreferences,
  WhatIfScenario,
} from '../types/smartcart';
import { API_CONFIG } from './apiConfig';
import { formatINR } from './formatters';

export const basketService = {
  calculateBasket(items: BasketItem[]): ShoppingBasket {
    const productMap = new Map(CATALOG_PRODUCTS.map((p) => [p.id, p]));
    const categorySpend: Record<ProductCategory, number> = {
      Electronics: 0,
      Fashion: 0,
      'Home and Kitchen': 0,
      'Beauty and Personal Care': 0,
      'Sports and Fitness': 0,
      'Books and Accessories': 0,
    };

    let totalQuantity = 0;
    let subtotal = 0;
    let originalTotal = 0;

    for (const item of items) {
      const product = productMap.get(item.productId);
      if (!product) continue;
      const safeQty = Math.max(1, item.quantity);
      totalQuantity += safeQty;
      subtotal += product.price * safeQty;
      originalTotal += product.originalPrice * safeQty;
      categorySpend[product.category] += product.price * safeQty;
    }

    return {
      items,
      totalProducts: items.length,
      totalQuantity,
      subtotal,
      originalTotal,
      estimatedSavings: Math.max(0, originalTotal - subtotal),
      categorySpend,
    };
  },

  calculateBudget(
    totalBudget: number,
    basket: ShoppingBasket,
    categoryAllocations: CategoryAllocations
  ): Budget {
    const spent = basket.subtotal;
    const remaining = totalBudget - spent;
    const overAmount = Math.max(0, spent - totalBudget);
    const usagePercent =
      totalBudget > 0 ? Math.min(100, Math.round((spent / totalBudget) * 100)) : 100;

    let status: Budget['status'] = 'within';
    let statusMessage = 'Great! Your basket is within your budget.';

    if (spent > totalBudget) {
      status = 'over';
      statusMessage = 'Your basket exceeds your budget. Try replacing a few products.';
    } else if (totalBudget > 0 && spent / totalBudget >= 0.8) {
      status = 'approaching';
      statusMessage = "You're getting close to your spending limit.";
    }

    return {
      totalBudget,
      spent,
      remaining,
      overAmount,
      usagePercent,
      status,
      statusMessage,
      categoryAllocations,
    };
  },

  /**
   * Variant-aware Smart Swap finder: generates alternative suggestions per (productId, selectedVariant)
   */
  findCheaperAlternativesForBasket(
    items: BasketItem[],
    budget: Budget
  ): SmartSwapOption[] {
    const productMap = new Map(CATALOG_PRODUCTS.map((p) => [p.id, p]));
    const inBasketIds = new Set(items.map((i) => i.productId));
    const swaps: SmartSwapOption[] = [];

    for (const item of items) {
      const current = productMap.get(item.productId);
      if (!current) continue;

      const candidates = CATALOG_PRODUCTS.filter(
        (p) => !inBasketIds.has(p.id) && p.price < current.price
      ).sort((a, b) => {
        if (a.id === current.cheaperAlternativeId) return -1;
        if (b.id === current.cheaperAlternativeId) return 1;
        const aSameCat = a.category === current.category ? 1 : 0;
        const bSameCat = b.category === current.category ? 1 : 0;
        if (aSameCat !== bSameCat) return bSameCat - aSameCat;
        return b.rating - a.rating;
      });

      if (candidates.length > 0) {
        const alt = candidates[0];
        const unitPriceDifference = current.price - alt.price;
        const totalSavings = unitPriceDifference * item.quantity;
        const restoresBudget =
          budget.status === 'over' && totalSavings >= budget.overAmount;

        const reason =
          alt.category === current.category
            ? `Similar ${alt.category.toLowerCase()} option with a ${alt.rating.toFixed(1)}★ sample rating that saves ${formatINR(unitPriceDifference)} per item.`
            : `Lower-priced option with a ${alt.rating.toFixed(1)}★ sample rating that saves ${formatINR(unitPriceDifference)} per item.`;

        swaps.push({
          currentProduct: current,
          currentVariant: item.selectedVariant,
          currentQuantity: item.quantity,
          alternativeProduct: alt,
          unitPriceDifference,
          totalSavings,
          reason,
          restoresBudget,
        });
      }
    }

    return swaps.sort((a, b) => b.totalSavings - a.totalSavings);
  },

  /**
   * Frontend Demonstration Basket Selection (Greedy Preview)
   * Note: Exact 0/1 Knapsack optimization belongs in the future Python ML backend.
   */
  optimizeBasketDemo(
    recommendations: Recommendation[],
    totalBudget: number,
    preferences: UserPreferences,
    categoryAllocations: CategoryAllocations
  ): OptimizationResult {
    const candidates = [...recommendations].sort((a, b) => {
      const valueScoreA = a.suitabilityScore + a.savingsAmount / 200;
      const valueScoreB = b.suitabilityScore + b.savingsAmount / 200;
      return valueScoreB - valueScoreA;
    });

    const selectedItems: OptimizedSelectionItem[] = [];
    const seenProductIds = new Set<string>();
    let runningTotal = 0;
    const catSpend: Record<ProductCategory, number> = {
      Electronics: 0,
      Fashion: 0,
      'Home and Kitchen': 0,
      'Beauty and Personal Care': 0,
      'Sports and Fitness': 0,
      'Books and Accessories': 0,
    };

    for (const rec of candidates) {
      const p = rec.product;
      if (seenProductIds.has(p.id)) continue;
      if (runningTotal + p.price > totalBudget) continue;

      const catLimit = categoryAllocations[p.category];
      if (catLimit <= 0 || catSpend[p.category] + p.price > catLimit) {
        continue;
      }

      seenProductIds.add(p.id);
      runningTotal += p.price;
      catSpend[p.category] += p.price;

      const isFavCat = preferences.favoriteCategories.includes(p.category);
      const selectionReason = isFavCat
        ? `Matches your ${p.category} preference and fits within your ${formatINR(catLimit)} category limit.`
        : `Good value (${p.rating.toFixed(1)}★ sample rating) fitting within your ${formatINR(catLimit)} ${p.category} limit.`;

      selectedItems.push({ product: p, selectionReason });
    }

    const estimatedSavings = selectedItems.reduce(
      (sum, item) => sum + Math.max(0, item.product.originalPrice - item.product.price),
      0
    );

    const remainingBudget = Math.max(0, totalBudget - runningTotal);

    return {
      selectedItems,
      combinedPrice: runningTotal,
      remainingBudget,
      estimatedSavings,
      selectionExplanation:
        selectedItems.length > 0
          ? `Frontend demo preview picked ${selectedItems.length} unique products respecting your ${formatINR(totalBudget)} budget and category limits.`
          : 'No products fit within your current total budget and category allocation limits. Try increasing a category limit or total budget.',
      algorithmType: 'frontend-greedy-demo',
      isDemoOptimization: true,
    };
  },

  /**
   * Future Python Backend Exact Knapsack Endpoint Adapter
   */
  async optimizeBasketViaBackend(
    request: BackendOptimizationRequest,
    recommendations: Recommendation[]
  ): Promise<ApiResponse<OptimizationResult>> {
    if (!API_CONFIG.useRemoteBackend) {
      return {
        success: true,
        source: 'demo-local',
        data: this.optimizeBasketDemo(
          recommendations,
          request.totalBudget,
          request.preferences,
          request.categoryAllocations
        ),
      };
    }

    try {
      const res = await fetch(`${API_CONFIG.baseUrl}${API_CONFIG.endpoints.optimizeBasket}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(request),
      });
      if (!res.ok) throw new Error(`Backend responded with ${res.status}`);
      const data = (await res.json()) as OptimizationResult;
      return { success: true, source: 'python-backend', data };
    } catch (err) {
      return {
        success: false,
        source: 'demo-local',
        errorMessage: err instanceof Error ? err.message : 'Backend unavailable',
        data: this.optimizeBasketDemo(
          recommendations,
          request.totalBudget,
          request.preferences,
          request.categoryAllocations
        ),
      };
    }
  },

  exploreWhatIfBudget(
    baseBudget: number,
    targetBudget: number,
    recommendations: Recommendation[],
    currentBasketProductIds: string[]
  ): WhatIfScenario {
    const inBasket = new Set(currentBasketProductIds);
    const extraHeadroom = Math.max(0, targetBudget - baseBudget);

    const additionalProducts = recommendations
      .map((r) => r.product)
      .filter(
        (p) =>
          !inBasket.has(p.id) &&
          p.price <= targetBudget &&
          p.price > Math.max(0, baseBudget - 2000)
      )
      .slice(0, 3);

    const fallbackExtras =
      additionalProducts.length > 0
        ? additionalProducts
        : recommendations
            .map((r) => r.product)
            .filter((p) => !inBasket.has(p.id) && p.price <= Math.max(targetBudget, 2000))
            .slice(0, 3);

    return {
      baseBudget,
      targetBudget,
      additionalProducts: fallbackExtras,
      summary:
        targetBudget >= baseBudget
          ? `If your budget increases from ${formatINR(baseBudget)} to ${formatINR(targetBudget)} (+${formatINR(extraHeadroom)}), you may be able to include these additional products.`
          : `At a tighter budget of ${formatINR(targetBudget)}, focusing on lower-priced essentials keeps your basket comfortable.`,
    };
  },

  buildAnalytics(
    basket: ShoppingBasket,
    budget: Budget,
    recentlyViewedIds: string[],
    swapSavings: number,
    selectedFromSuggestionsIds: string[],
    recommendedCount: number
  ): ShoppingAnalytics {
    const productMap = new Map(CATALOG_PRODUCTS.map((p) => [p.id, p]));
    const viewedCategories: Record<ProductCategory, number> = {
      Electronics: 0,
      Fashion: 0,
      'Home and Kitchen': 0,
      'Beauty and Personal Care': 0,
      'Sports and Fitness': 0,
      'Books and Accessories': 0,
    };

    recentlyViewedIds.forEach((id) => {
      const p = productMap.get(id);
      if (p) viewedCategories[p.category] += 1;
    });

    basket.items.forEach((item) => {
      const p = productMap.get(item.productId);
      if (p) viewedCategories[p.category] += item.quantity;
    });

    let mostExploredCategory: ProductCategory = 'Electronics';
    let topCount = -1;
    PRODUCT_CATEGORIES.forEach((cat) => {
      if (viewedCategories[cat] > topCount) {
        topCount = viewedCategories[cat];
        mostExploredCategory = cat;
      }
    });

    const averageProductPrice =
      basket.totalQuantity > 0
        ? Math.round(basket.subtotal / basket.totalQuantity)
        : 0;

    const basketIdSet = new Set(basket.items.map((i) => i.productId));
    const trackedSelectedCount = selectedFromSuggestionsIds.filter((id) =>
      basketIdSet.has(id)
    ).length;

    return {
      actualActivity: {
        productsViewedCount: recentlyViewedIds.length,
        productsAddedCount: basket.totalQuantity,
        currentBasketSpending: basket.subtotal,
        currentBudgetUsagePercent: budget.usagePercent,
        selectedFromSuggestionsCount: trackedSelectedCount,
      },
      sampleDemoInfo: {
        averageProductPrice,
        moneySavedThroughAlternativesAndDiscounts: swapSavings + basket.estimatedSavings,
        mostExploredCategory,
        categoryBreakdown: PRODUCT_CATEGORIES.map((category) => ({
          category,
          amount: basket.categorySpend[category],
          allocated: budget.categoryAllocations[category],
        })),
        recommendedCount,
      },
    };
  },
};
