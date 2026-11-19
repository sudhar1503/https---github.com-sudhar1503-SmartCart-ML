import { CATALOG_PRODUCTS } from '../data/catalog';
import {
  ApiResponse,
  BackendRecommendationRequest,
  BasketItem,
  Product,
  ProductFeedbackState,
  Recommendation,
  UserPreferences,
} from '../types/smartcart';
import { API_CONFIG } from './apiConfig';
import { formatINR } from './formatters';

export interface RecommendationSections {
  bestMatches: Recommendation[];
  withinBudget: Recommendation[];
  similarToLiked: Recommendation[];
  topRatedPopular: Recommendation[];
  affordableAlternatives: Recommendation[];
  discoverNew: Recommendation[];
}

function scoreProductForDemo(
  product: Product,
  preferences: UserPreferences,
  remainingBudget: number,
  basketItems: BasketItem[],
  wishlistIds: string[],
  feedback: ProductFeedbackState
): Recommendation {
  const settings = preferences.recommendationSettings;
  const totalWeight = settings.similarity + settings.budgetFit + settings.popularity || 1;

  const isFavoriteCategory = preferences.favoriteCategories.includes(product.category);
  const isPreferredBrand = preferences.preferredBrands.includes(product.brand);
  const isBoosted = feedback.boostedIds.includes(product.id);
  const isWishlisted = wishlistIds.includes(product.id);

  // 1. Preference & Category Similarity (0-100 demo heuristic)
  let similarityScore = 55;
  if (isFavoriteCategory) similarityScore += 25;
  if (isPreferredBrand) similarityScore += 10;
  if (isBoosted) similarityScore += 12;
  if (isWishlisted) similarityScore += 8;
  similarityScore = Math.min(98, similarityScore);

  // 2. Budget Fit (0-100)
  const fitsRemainingBudget = product.price <= remainingBudget;
  const overBudgetAmount = Math.max(0, product.price - remainingBudget);
  let budgetFitScore = 95;
  if (remainingBudget <= 0) {
    budgetFitScore = 35;
  } else if (!fitsRemainingBudget) {
    const overRatio = overBudgetAmount / Math.max(500, remainingBudget);
    budgetFitScore = Math.max(25, Math.round(80 - overRatio * 60));
  } else if (product.price <= remainingBudget * 0.6) {
    budgetFitScore = 98;
  }

  // 3. Sample Catalog Popularity & Rating (0-100)
  const popularityScore = Math.min(
    98,
    Math.round(product.popularityScore * 0.7 + product.rating * 6)
  );

  const weighted =
    (similarityScore * settings.similarity +
      budgetFitScore * settings.budgetFit +
      popularityScore * settings.popularity) /
    totalWeight;

  const suitabilityScore = Math.min(97, Math.max(52, Math.round(weighted)));
  const savingsAmount = Math.max(0, product.originalPrice - product.price);

  // Transparent explanations grounded strictly in product data & user preferences
  const reasons: string[] = [];
  if (isFavoriteCategory) {
    reasons.push(`Matches your selected interest in ${product.category}.`);
  }
  if (isPreferredBrand) {
    reasons.push(`From ${product.brand}, which is in your preferred brands.`);
  }
  if (isBoosted) {
    reasons.push('Boosted because you requested more items like this.');
  }
  if (fitsRemainingBudget) {
    reasons.push(`Fits within your remaining budget of ${formatINR(remainingBudget)}.`);
  } else {
    reasons.push(`Exceeds your remaining budget by ${formatINR(overBudgetAmount)}.`);
  }
  if (savingsAmount >= 400) {
    reasons.push(`Priced ${formatINR(savingsAmount)} below sample retail price.`);
  }
  if (product.rating >= 4.7) {
    reasons.push(`High sample catalog rating (${product.rating.toFixed(1)} out of 5).`);
  }

  const basketProducts = basketItems
    .map((b) => CATALOG_PRODUCTS.find((p) => p.id === b.productId))
    .filter((p): p is Product => Boolean(p));

  const expensiveInBasket = basketProducts.find(
    (bp) => bp.category === product.category && bp.price > product.price + 300
  );

  let summary = reasons[0] || `Included from the ${product.category} sample catalog.`;
  if (expensiveInBasket) {
    summary = `Costs ${formatINR(expensiveInBasket.price - product.price)} less than ${expensiveInBasket.name} in your basket.`;
  } else if (isFavoriteCategory && fitsRemainingBudget) {
    summary = `Matches your ${product.category} preference and fits your budget.`;
  } else if (fitsRemainingBudget) {
    summary = `Fits within your ${formatINR(remainingBudget)} remaining budget.`;
  }

  let badgeLabel: Recommendation['badgeLabel'];
  if (isFavoriteCategory && suitabilityScore >= 85) {
    badgeLabel = 'Recommended for You';
  } else if (fitsRemainingBudget && savingsAmount >= 400) {
    badgeLabel = 'Good Value';
  } else if (fitsRemainingBudget) {
    badgeLabel = 'Fits Your Budget';
  } else if (product.popularityScore >= 90) {
    badgeLabel = 'Popular Choice';
  }

  return {
    product,
    suitabilityScore,
    explanation: {
      summary,
      reasons,
    },
    badgeLabel,
    fitsRemainingBudget,
    overBudgetAmount,
    savingsAmount,
    isDemoData: true,
  };
}

export const recommendationService = {
  getRecommendations(
    preferences: UserPreferences,
    remainingBudget: number,
    basketItems: BasketItem[],
    wishlistIds: string[],
    feedback: ProductFeedbackState
  ): Recommendation[] {
    return CATALOG_PRODUCTS.filter(
      (p) =>
        !feedback.hiddenIds.includes(p.id) &&
        !feedback.avoidedBrands.includes(p.brand)
    )
      .map((product) =>
        scoreProductForDemo(
          product,
          preferences,
          remainingBudget,
          basketItems,
          wishlistIds,
          feedback
        )
      )
      .sort((a, b) => b.suitabilityScore - a.suitabilityScore);
  },

  getCategorizedRecommendations(
    preferences: UserPreferences,
    remainingBudget: number,
    basketItems: BasketItem[],
    wishlistIds: string[],
    feedback: ProductFeedbackState
  ): RecommendationSections {
    const all = this.getRecommendations(
      preferences,
      remainingBudget,
      basketItems,
      wishlistIds,
      feedback
    );

    const bestMatches = all.slice(0, 4);

    const withinBudget = all
      .filter((r) => r.fitsRemainingBudget)
      .sort((a, b) => b.suitabilityScore - a.suitabilityScore)
      .slice(0, 4);

    const likedReferenceIds = new Set<string>([
      ...wishlistIds,
      ...basketItems.map((b) => b.productId),
      ...feedback.boostedIds,
    ]);
    const similarIds = new Set<string>();
    likedReferenceIds.forEach((id) => {
      const prod = CATALOG_PRODUCTS.find((p) => p.id === id);
      prod?.similarProductIds.forEach((simId) => similarIds.add(simId));
    });

    const similarToLiked = all
      .filter((r) => similarIds.has(r.product.id) && !likedReferenceIds.has(r.product.id))
      .slice(0, 4);

    const fallbackSimilar =
      similarToLiked.length > 0
        ? similarToLiked
        : all.filter((r) => preferences.favoriteCategories.includes(r.product.category)).slice(0, 4);

    const topRatedPopular = [...all]
      .sort((a, b) => b.product.popularityScore - a.product.popularityScore)
      .map((rec) => ({
        ...rec,
        explanation: {
          ...rec.explanation,
          summary: `Top-rated sample item in ${rec.product.category} (${rec.product.rating.toFixed(1)}★ sample rating).`,
        },
      }))
      .slice(0, 4);

    const affordableAlternatives = [...all]
      .filter((r) => r.product.price <= 1499 || r.savingsAmount >= 500)
      .sort((a, b) => a.product.price - b.product.price)
      .slice(0, 4);

    const discoverNew = all
      .filter((r) => !preferences.favoriteCategories.includes(r.product.category))
      .slice(0, 4);

    return {
      bestMatches,
      withinBudget,
      similarToLiked: fallbackSimilar,
      topRatedPopular,
      affordableAlternatives,
      discoverNew: discoverNew.length > 0 ? discoverNew : all.slice(4, 8),
    };
  },

  /**
   * Future Python ML Backend Integration Point
   */
  async fetchRecommendationsFromBackend(
    request: BackendRecommendationRequest,
    fallbackArgs: {
      basketItems: BasketItem[];
      wishlistIds: string[];
      feedback: ProductFeedbackState;
    }
  ): Promise<ApiResponse<Recommendation[]>> {
    if (!API_CONFIG.useRemoteBackend) {
      return {
        success: true,
        source: 'demo-local',
        data: this.getRecommendations(
          request.preferences,
          request.remainingBudget,
          fallbackArgs.basketItems,
          fallbackArgs.wishlistIds,
          fallbackArgs.feedback
        ),
      };
    }

    try {
      const res = await fetch(`${API_CONFIG.baseUrl}${API_CONFIG.endpoints.recommendations}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(request),
      });
      if (!res.ok) throw new Error(`Backend responded with ${res.status}`);
      const data = (await res.json()) as Recommendation[];
      return { success: true, source: 'python-backend', data };
    } catch (err) {
      return {
        success: false,
        source: 'demo-local',
        errorMessage: err instanceof Error ? err.message : 'Could not reach backend',
        data: this.getRecommendations(
          request.preferences,
          request.remainingBudget,
          fallbackArgs.basketItems,
          fallbackArgs.wishlistIds,
          fallbackArgs.feedback
        ),
      };
    }
  },
};
