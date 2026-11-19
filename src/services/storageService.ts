import {
  DEFAULT_CATEGORY_ALLOCATIONS,
  DEFAULT_PREFERENCES,
  DEFAULT_USER,
  INITIAL_BASKET_ITEMS,
} from '../data/catalog';
import {
  BasketItem,
  CategoryAllocations,
  ProductFeedbackState,
  User,
  UserPreferences,
} from '../types/smartcart';

const STORAGE_KEYS = {
  basket: 'smartcart_demo_basket_v2',
  budget: 'smartcart_demo_budget_v2',
  allocations: 'smartcart_demo_allocations_v2',
  wishlist: 'smartcart_demo_wishlist_v2',
  recentlyViewed: 'smartcart_demo_recent_v2',
  preferences: 'smartcart_demo_prefs_v2',
  user: 'smartcart_demo_user_v2',
  feedback: 'smartcart_demo_feedback_v2',
  savedSavings: 'smartcart_demo_swap_savings_v2',
  selectedFromSuggestions: 'smartcart_demo_suggested_adds_v2',
};

function safeRead<T>(key: string, fallback: T): T {
  try {
    const raw = window.localStorage.getItem(key);
    if (!raw) return fallback;
    return JSON.parse(raw) as T;
  } catch {
    return fallback;
  }
}

function safeWrite<T>(key: string, value: T): void {
  try {
    window.localStorage.setItem(key, JSON.stringify(value));
  } catch {
    // Ignore storage quota errors in restricted preview modes
  }
}

export const storageService = {
  loadBasket: (): BasketItem[] => safeRead(STORAGE_KEYS.basket, INITIAL_BASKET_ITEMS),
  saveBasket: (items: BasketItem[]) => safeWrite(STORAGE_KEYS.basket, items),

  loadBudget: (): number => safeRead(STORAGE_KEYS.budget, 5000),
  saveBudget: (budget: number) => safeWrite(STORAGE_KEYS.budget, budget),

  loadAllocations: (): CategoryAllocations =>
    safeRead(STORAGE_KEYS.allocations, DEFAULT_CATEGORY_ALLOCATIONS),
  saveAllocations: (allocations: CategoryAllocations) =>
    safeWrite(STORAGE_KEYS.allocations, allocations),

  loadWishlist: (): string[] =>
    safeRead(STORAGE_KEYS.wishlist, ['keyform-mechanical-keyboard', 'atelier-pour-kettle']),
  saveWishlist: (ids: string[]) => safeWrite(STORAGE_KEYS.wishlist, ids),

  loadRecentlyViewed: (): string[] =>
    safeRead(STORAGE_KEYS.recentlyViewed, [
      'aero-anc-headphones',
      'lumen-desk-lamp',
      'design-books-journal-set',
    ]),
  saveRecentlyViewed: (ids: string[]) => safeWrite(STORAGE_KEYS.recentlyViewed, ids),

  loadPreferences: (): UserPreferences =>
    safeRead(STORAGE_KEYS.preferences, DEFAULT_PREFERENCES),
  savePreferences: (prefs: UserPreferences) => safeWrite(STORAGE_KEYS.preferences, prefs),

  loadUser: (): User => safeRead(STORAGE_KEYS.user, DEFAULT_USER),
  saveUser: (user: User) => safeWrite(STORAGE_KEYS.user, user),

  loadFeedback: (): ProductFeedbackState =>
    safeRead(STORAGE_KEYS.feedback, {
      boostedIds: [],
      hiddenIds: [],
      avoidedBrands: [],
      cheaperRequestedIds: [],
    }),
  saveFeedback: (feedback: ProductFeedbackState) => safeWrite(STORAGE_KEYS.feedback, feedback),

  loadSwapSavings: (): number => safeRead(STORAGE_KEYS.savedSavings, 0),
  saveSwapSavings: (amount: number) => safeWrite(STORAGE_KEYS.savedSavings, amount),

  loadSelectedFromSuggestions: (): string[] =>
    safeRead(STORAGE_KEYS.selectedFromSuggestions, []),
  saveSelectedFromSuggestions: (ids: string[]) =>
    safeWrite(STORAGE_KEYS.selectedFromSuggestions, ids),

  resetAllDemoData: () => {
    Object.values(STORAGE_KEYS).forEach((key) => {
      try {
        window.localStorage.removeItem(key);
      } catch {
        // Ignore
      }
    });
  },
};
