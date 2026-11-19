import { CATALOG_PRODUCTS } from '../data/catalog';
import { ApiResponse, Product, ProductCategory, SortOption } from '../types/smartcart';
import { API_CONFIG } from './apiConfig';

export interface ProductFilterParams {
  searchQuery?: string;
  category?: 'All' | ProductCategory;
  brand?: 'All' | string;
  maxPrice?: number;
  minRating?: number;
  onlyWithinRemainingBudget?: boolean;
  remainingBudget?: number;
  sortBy?: SortOption;
}

export const productService = {
  getAllProducts(): Product[] {
    return CATALOG_PRODUCTS;
  },

  getProductById(id: string): Product | undefined {
    return CATALOG_PRODUCTS.find((p) => p.id === id);
  },

  getAllBrands(): string[] {
    return Array.from(new Set(CATALOG_PRODUCTS.map((p) => p.brand))).sort();
  },

  filterAndSortProducts(params: ProductFilterParams): Product[] {
    const q = (params.searchQuery || '').trim().toLowerCase();

    const filtered = CATALOG_PRODUCTS.filter((product) => {
      if (params.category && params.category !== 'All' && product.category !== params.category) {
        return false;
      }
      if (params.brand && params.brand !== 'All' && product.brand !== params.brand) {
        return false;
      }
      if (typeof params.maxPrice === 'number' && product.price > params.maxPrice) {
        return false;
      }
      if (typeof params.minRating === 'number' && product.rating < params.minRating) {
        return false;
      }
      if (
        params.onlyWithinRemainingBudget &&
        typeof params.remainingBudget === 'number' &&
        product.price > params.remainingBudget
      ) {
        return false;
      }
      if (q) {
        const haystack = `${product.name} ${product.brand} ${product.category} ${product.shortDescription} ${product.tags.join(' ')}`.toLowerCase();
        if (!haystack.includes(q)) return false;
      }
      return true;
    });

    const sortBy = params.sortBy || 'popularity';
    return [...filtered].sort((a, b) => {
      if (sortBy === 'price-asc') return a.price - b.price;
      if (sortBy === 'price-desc') return b.price - a.price;
      if (sortBy === 'rating') return b.rating - a.rating;
      return b.popularityScore - a.popularityScore;
    });
  },

  getSimilarProducts(product: Product): Product[] {
    const direct = product.similarProductIds
      .map((id) => CATALOG_PRODUCTS.find((p) => p.id === id))
      .filter((p): p is Product => Boolean(p));

    if (direct.length >= 2) return direct.slice(0, 3);

    const sameCategory = CATALOG_PRODUCTS.filter(
      (p) => p.id !== product.id && p.category === product.category
    );
    return Array.from(new Set([...direct, ...sameCategory])).slice(0, 3);
  },

  getCheaperAlternatives(product: Product): Product[] {
    const candidates = CATALOG_PRODUCTS.filter(
      (p) => p.id !== product.id && p.price < product.price
    );

    return candidates
      .sort((a, b) => {
        if (a.id === product.cheaperAlternativeId) return -1;
        if (b.id === product.cheaperAlternativeId) return 1;
        const aSameCat = a.category === product.category ? 1 : 0;
        const bSameCat = b.category === product.category ? 1 : 0;
        if (aSameCat !== bSameCat) return bSameCat - aSameCat;
        return b.rating - a.rating;
      })
      .slice(0, 3);
  },

  /**
   * Backend-ready product catalogue adapter.
   * Falls back cleanly to the local demonstration catalogue when no backend URL is configured.
   */
  async fetchProductsFromBackend(): Promise<ApiResponse<Product[]>> {
    if (API_CONFIG.useRemoteBackend && API_CONFIG.baseUrl) {
      try {
        const res = await fetch(`${API_CONFIG.baseUrl}${API_CONFIG.endpoints.products}`);
        if (res.ok) {
          const payload = (await res.json()) as Product[];
          return {
            success: true,
            data: payload,
            source: 'python-backend',
          };
        }
      } catch (err) {
        return {
          success: false,
          data: CATALOG_PRODUCTS,
          source: 'demo-local',
          errorMessage:
            err instanceof Error
              ? err.message
              : 'Unable to reach product backend; showing local demo catalogue.',
        };
      }
    }

    return {
      success: true,
      data: CATALOG_PRODUCTS,
      source: 'demo-local',
    };
  },
};
