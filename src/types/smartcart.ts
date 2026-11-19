export type ProductCategory =
  | 'Electronics'
  | 'Fashion'
  | 'Home and Kitchen'
  | 'Beauty and Personal Care'
  | 'Sports and Fitness'
  | 'Books and Accessories';

export type PageId =
  | 'home'
  | 'explore'
  | 'recommended'
  | 'basket'
  | 'planner'
  | 'insights'
  | 'profile'
  | 'how-it-works';

export type SortOption =
  | 'popularity'
  | 'price-asc'
  | 'price-desc'
  | 'rating';

export type SpendBracket =
  | '₹500–₹1,000'
  | '₹1,000–₹3,000'
  | '₹3,000–₹5,000'
  | 'Above ₹5,000';

export type FeedbackAction =
  | 'more-like-this'
  | 'find-cheaper'
  | 'not-interested'
  | 'avoid-brand';

export interface Product {
  id: string;
  name: string;
  brand: string;
  category: ProductCategory;
  price: number; // INR
  originalPrice: number; // INR
  rating: number; // Sample rating (1.0 - 5.0)
  reviewCount: number; // Sample rating count
  popularityScore: number; // Sample catalog score (0 - 100)
  image: string;
  shortDescription: string;
  description: string;
  features: string[];
  advantages: string[];
  variants: string[];
  cheaperAlternativeId?: string;
  similarProductIds: string[];
  tags: string[];
}

export interface User {
  id: string;
  name: string;
  email: string;
  avatarInitials: string;
  city: string;
}

export interface RecommendationSettings {
  similarity: number; // 0-100: How closely a product matches interests
  budgetFit: number; // 0-100: How well the product fits spending limit
  popularity: number; // 0-100: How popular the product is in sample catalog
}

export interface UserPreferences {
  favoriteCategories: ProductCategory[];
  preferredBrands: string[];
  preferredSpendBracket: SpendBracket;
  maxShoppingBudget: number;
  minPreferredRating: number;
  shoppingInterests: string[];
  recommendationSettings: RecommendationSettings;
}

export interface RecommendationExplanation {
  summary: string;
  reasons: string[];
}

export interface Recommendation {
  product: Product;
  suitabilityScore: number; // 0-99 frontend demonstration score
  explanation: RecommendationExplanation;
  badgeLabel?: 'Fits Your Budget' | 'Good Value' | 'Popular Choice' | 'Recommended for You';
  fitsRemainingBudget: boolean;
  overBudgetAmount: number;
  savingsAmount: number;
  isDemoData: boolean;
}

export interface BasketItem {
  productId: string;
  quantity: number;
  selectedVariant: string;
}

export interface ShoppingBasket {
  items: BasketItem[];
  totalProducts: number;
  totalQuantity: number;
  subtotal: number;
  originalTotal: number;
  estimatedSavings: number;
  categorySpend: Record<ProductCategory, number>;
}

export type CategoryAllocations = Record<ProductCategory, number>;

export interface Budget {
  totalBudget: number;
  spent: number;
  remaining: number;
  overAmount: number;
  usagePercent: number;
  status: 'within' | 'approaching' | 'over';
  statusMessage: string;
  categoryAllocations: CategoryAllocations;
}

export interface SmartSwapOption {
  currentProduct: Product;
  currentVariant: string;
  currentQuantity: number;
  alternativeProduct: Product;
  unitPriceDifference: number;
  totalSavings: number;
  reason: string;
  restoresBudget: boolean;
}

export interface OptimizedSelectionItem {
  product: Product;
  selectionReason: string;
}

export interface OptimizationResult {
  selectedItems: OptimizedSelectionItem[];
  combinedPrice: number;
  remainingBudget: number;
  estimatedSavings: number;
  selectionExplanation: string;
  algorithmType: 'frontend-greedy-demo' | 'backend-knapsack';
  isDemoOptimization: boolean;
}

export interface WhatIfScenario {
  baseBudget: number;
  targetBudget: number;
  additionalProducts: Product[];
  summary: string;
}

export interface ShoppingAnalytics {
  actualActivity: {
    productsViewedCount: number;
    productsAddedCount: number;
    currentBasketSpending: number;
    currentBudgetUsagePercent: number;
    selectedFromSuggestionsCount: number;
  };
  sampleDemoInfo: {
    averageProductPrice: number;
    moneySavedThroughAlternativesAndDiscounts: number;
    mostExploredCategory: ProductCategory;
    categoryBreakdown: Array<{
      category: ProductCategory;
      amount: number;
      allocated: number;
    }>;
    recommendedCount: number;
  };
}

export interface ProductFeedbackState {
  boostedIds: string[];
  hiddenIds: string[];
  avoidedBrands: string[];
  cheaperRequestedIds: string[];
}

// Future Python ML Backend Integration Contracts
export interface ApiResponse<T> {
  success: boolean;
  data: T;
  source: 'demo-local' | 'python-backend';
  errorMessage?: string;
}

export interface BackendRecommendationRequest {
  userId: string;
  preferences: UserPreferences;
  remainingBudget: number;
  basketProductIds: string[];
  excludedProductIds: string[];
  excludedBrands: string[];
}

export interface BackendOptimizationRequest {
  totalBudget: number;
  categoryAllocations: CategoryAllocations;
  preferences: UserPreferences;
  candidateProductIds: string[];
}
