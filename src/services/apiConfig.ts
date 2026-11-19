/**
 * Backend Integration Configuration
 * ---------------------------------
 * SmartCart ML is structured so all product, recommendation, basket optimization,
 * and analytics calls go through clean service modules. When the Python ML backend
 * is connected, set VITE_API_BASE_URL in `.env` and enable `USE_REMOTE_BACKEND`.
 */

const env = (import.meta as ImportMeta & { env?: Record<string, string | undefined> }).env;

export const API_CONFIG = {
  baseUrl: env?.VITE_API_BASE_URL || '',
  useRemoteBackend: Boolean(env?.VITE_API_BASE_URL),
  endpoints: {
    products: '/api/products',
    recommendations: '/api/recommendations',
    optimizeBasket: '/api/optimize-basket',
    smartSwap: '/api/smart-swap',
    analytics: '/api/analytics',
    preferences: '/api/preferences',
  },
};
