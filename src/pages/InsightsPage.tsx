import React, { useState } from 'react';
import { ChevronDown, ChevronUp, Info, RotateCcw } from 'lucide-react';
import { CATALOG_PRODUCTS, DEFAULT_RECOMMENDATION_SETTINGS } from '../data/catalog';
import {
  Budget,
  RecommendationSettings,
  ShoppingAnalytics,
  ShoppingBasket,
} from '../types/smartcart';
import { formatINR } from '../services/formatters';

interface InsightsPageProps {
  analytics: ShoppingAnalytics;
  budget: Budget;
  basket: ShoppingBasket;
  settings: RecommendationSettings;
  onSettingsChange: (next: RecommendationSettings) => void;
}

export const InsightsPage: React.FC<InsightsPageProps> = ({
  analytics,
  budget,
  basket,
  settings,
  onSettingsChange,
}) => {
  const [advancedOpen, setAdvancedOpen] = useState(false);

  const productMap = new Map(CATALOG_PRODUCTS.map((p) => [p.id, p]));
  const maxCategoryAmount = Math.max(
    1000,
    ...analytics.sampleDemoInfo.categoryBreakdown.map((c) =>
      Math.max(c.amount, c.allocated)
    )
  );

  // Donut geometry for Budget Used vs Remaining
  const radius = 52;
  const circumference = 2 * Math.PI * radius;
  const usedFraction = Math.min(1, budget.usagePercent / 100);
  const strokeDashoffset = circumference * (1 - usedFraction);

  const basketProducts = basket.items
    .map((i) => productMap.get(i.productId))
    .filter((p): p is NonNullable<typeof p> => Boolean(p));

  const averageCatalogPrice = Math.round(
    CATALOG_PRODUCTS.reduce((sum, p) => sum + p.price, 0) / CATALOG_PRODUCTS.length
  );

  return (
    <div className="space-y-8">
      <div>
        <h1 className="font-display text-3xl font-bold text-[#131b2e] tracking-tight">
          Shopping Insights
        </h1>
        <p className="text-sm sm:text-base text-[#464555] mt-1">
          Clear overview separating your actual session activity from sample catalogue estimates.
        </p>
      </div>

      {/* SECTION A: Actual Activity in This Browser Demonstration */}
      <section className="space-y-4">
        <div>
          <h2 className="font-display text-lg font-bold text-[#131b2e]">
            A. Your Activity in This Browser Session
          </h2>
          <p className="text-xs text-[#464555]">
            Tracked directly from your clicks, basket updates, and budget limits in this browser.
          </p>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
          <div className="bg-white rounded-2xl border border-slate-900/[0.06] p-4">
            <p className="text-xs text-[#464555]">Products Viewed</p>
            <p className="font-metric text-2xl font-bold text-[#131b2e] mt-1">
              {analytics.actualActivity.productsViewedCount}
            </p>
          </div>
          <div className="bg-white rounded-2xl border border-slate-900/[0.06] p-4">
            <p className="text-xs text-[#464555]">Products Added</p>
            <p className="font-metric text-2xl font-bold text-[#131b2e] mt-1">
              {analytics.actualActivity.productsAddedCount}
            </p>
          </div>
          <div className="bg-white rounded-2xl border border-slate-900/[0.06] p-4">
            <p className="text-xs text-[#464555]">Current Basket Spending</p>
            <p className="font-metric text-2xl font-bold text-[#131b2e] mt-1">
              {formatINR(analytics.actualActivity.currentBasketSpending)}
            </p>
          </div>
          <div className="bg-white rounded-2xl border border-slate-900/[0.06] p-4">
            <p className="text-xs text-[#464555]">Current Budget Usage</p>
            <p className="font-metric text-2xl font-bold text-[#131b2e] mt-1">
              {analytics.actualActivity.currentBudgetUsagePercent}%
            </p>
          </div>
          <div className="bg-white rounded-2xl border border-slate-900/[0.06] p-4 col-span-2 sm:col-span-1">
            <p className="text-xs text-[#464555]">Added from Suggestions</p>
            <p className="font-metric text-2xl font-bold text-[#3525cd] mt-1">
              {analytics.actualActivity.selectedFromSuggestionsCount}
            </p>
          </div>
        </div>
      </section>

      {/* SECTION B: Sample Demonstration Information */}
      <section className="space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div>
            <h2 className="font-display text-lg font-bold text-[#131b2e]">
              B. Sample Demonstration Estimates
            </h2>
            <p className="text-xs text-[#464555]">
              Calculated using sample retail prices, sample category targets, and demonstration swaps.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="bg-white rounded-2xl border border-slate-900/[0.06] p-4">
            <p className="text-xs text-[#464555]">Average Basket Item Price</p>
            <p className="font-metric text-2xl font-bold text-[#131b2e] mt-1">
              {formatINR(analytics.sampleDemoInfo.averageProductPrice)}
            </p>
          </div>
          <div className="bg-white rounded-2xl border border-slate-900/[0.06] p-4">
            <p className="text-xs text-[#464555]">Estimated Sample Savings & Swaps</p>
            <p className="font-metric text-2xl font-bold text-[#047857] mt-1">
              {formatINR(analytics.sampleDemoInfo.moneySavedThroughAlternativesAndDiscounts)}
            </p>
          </div>
          <div className="bg-white rounded-2xl border border-slate-900/[0.06] p-4">
            <p className="text-xs text-[#464555]">Most Explored Category</p>
            <p className="font-display text-lg font-bold text-[#3525cd] mt-1.5 truncate">
              {analytics.sampleDemoInfo.mostExploredCategory}
            </p>
          </div>
        </div>
      </section>

      {/* 4 Clear Visualizations */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* 1. Spending by Category */}
        <section className="bg-white rounded-3xl border border-slate-900/[0.06] p-6 shadow-[0_4px_16px_-4px_rgba(15,23,42,0.04)]">
          <h2 className="font-display text-lg font-bold text-[#131b2e] mb-1">
            1. Spending by Category
          </h2>
          <p className="text-xs text-[#464555] mb-5">
            Actual basket spend compared against your planned category limit.
          </p>
          <div className="space-y-3.5">
            {analytics.sampleDemoInfo.categoryBreakdown.map((row) => {
              const barPct = Math.round((row.amount / maxCategoryAmount) * 100);
              return (
                <div key={row.category} className="space-y-1">
                  <div className="flex justify-between text-xs">
                    <span className="font-medium text-[#131b2e]">{row.category}</span>
                    <span className="font-metric text-[#464555]">
                      <strong className="text-[#131b2e]">{formatINR(row.amount)}</strong> / {formatINR(row.allocated)}
                    </span>
                  </div>
                  <div className="w-full h-2.5 bg-[#f2f3ff] rounded-full overflow-hidden">
                    <div
                      className="h-full rounded-full bg-[#4F46E5] transition-all duration-300"
                      style={{ width: `${Math.min(100, barPct)}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </section>

        {/* 2. Budget Used vs Remaining */}
        <section className="bg-white rounded-3xl border border-slate-900/[0.06] p-6 shadow-[0_4px_16px_-4px_rgba(15,23,42,0.04)] flex flex-col justify-between">
          <div>
            <h2 className="font-display text-lg font-bold text-[#131b2e] mb-1">
              2. Budget Used vs Remaining
            </h2>
            <p className="text-xs text-[#464555] mb-5">
              Visual breakdown of your {formatINR(budget.totalBudget)} shopping limit.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row items-center gap-8 my-auto">
            <div className="relative w-36 h-36 shrink-0">
              <svg viewBox="0 0 130 130" className="w-full h-full -rotate-90" role="img" aria-label={`Budget usage ${budget.usagePercent} percent`}>
                <circle
                  cx="65"
                  cy="65"
                  r={radius}
                  fill="none"
                  stroke="#E2E8F0"
                  strokeWidth="14"
                />
                <circle
                  cx="65"
                  cy="65"
                  r={radius}
                  fill="none"
                  stroke={
                    budget.status === 'over'
                      ? '#F43F5E'
                      : budget.status === 'approaching'
                      ? '#f97316'
                      : '#10B981'
                  }
                  strokeWidth="14"
                  strokeDasharray={circumference}
                  strokeDashoffset={strokeDashoffset}
                  strokeLinecap="round"
                />
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
                <span className="font-metric text-xl font-bold text-[#131b2e]">
                  {budget.usagePercent}%
                </span>
                <span className="text-[11px] text-[#464555]">Used</span>
              </div>
            </div>

            <div className="space-y-3 flex-1 w-full">
              <div className="flex items-center justify-between p-3 rounded-xl bg-[#faf8ff]">
                <span className="text-xs font-medium text-[#464555]">Amount Spent</span>
                <span className="font-metric text-sm font-bold text-[#131b2e]">
                  {formatINR(budget.spent)}
                </span>
              </div>
              <div className="flex items-center justify-between p-3 rounded-xl bg-[#ecfdf5]">
                <span className="text-xs font-medium text-[#047857]">
                  {budget.status === 'over' ? 'Over Budget' : 'Remaining'}
                </span>
                <span className="font-metric text-sm font-bold text-[#047857]">
                  {budget.status === 'over'
                    ? formatINR(budget.overAmount)
                    : formatINR(budget.remaining)}
                </span>
              </div>
            </div>
          </div>
        </section>

        {/* 3. Product Price Comparison */}
        <section className="bg-white rounded-3xl border border-slate-900/[0.06] p-6 shadow-[0_4px_16px_-4px_rgba(15,23,42,0.04)]">
          <h2 className="font-display text-lg font-bold text-[#131b2e] mb-1">
            3. Product Price Comparison (Sample Catalogue)
          </h2>
          <p className="text-xs text-[#464555] mb-5">
            Your basket items compared to the sample catalogue average ({formatINR(averageCatalogPrice)}).
          </p>

          {basketProducts.length === 0 ? (
            <p className="text-sm text-[#464555] py-6">
              Add products to your basket to compare their prices against the sample catalogue average.
            </p>
          ) : (
            <div className="space-y-3">
              {basketProducts.map((p) => {
                const maxVal = Math.max(averageCatalogPrice, ...basketProducts.map((x) => x.price));
                const pct = Math.round((p.price / maxVal) * 100);
                return (
                  <div key={p.id} className="space-y-1">
                    <div className="flex justify-between text-xs">
                      <span className="font-medium text-[#131b2e] truncate pr-3">{p.name}</span>
                      <span className="font-metric font-bold text-[#131b2e] shrink-0">
                        {formatINR(p.price)}
                      </span>
                    </div>
                    <div className="w-full h-2 bg-[#E2E8F0] rounded-full overflow-hidden">
                      <div
                        className="h-full rounded-full bg-[#4F46E5]"
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                  </div>
                );
              })}
              <div className="pt-2 text-xs text-[#464555]">
                Sample catalogue average price:{' '}
                <strong className="font-metric text-[#131b2e]">
                  {formatINR(averageCatalogPrice)}
                </strong>
              </div>
            </div>
          )}
        </section>

        {/* 4. Suggested Products vs Selected Products */}
        <section className="bg-white rounded-3xl border border-slate-900/[0.06] p-6 shadow-[0_4px_16px_-4px_rgba(15,23,42,0.04)] flex flex-col justify-between">
          <div>
            <h2 className="font-display text-lg font-bold text-[#131b2e] mb-1">
              4. Suggested Products vs Added From Suggestions
            </h2>
            <p className="text-xs text-[#464555] mb-6">
              Actual products added directly from the Recommended or Picked for You sections.
            </p>
          </div>

          <div className="space-y-4">
            <div className="space-y-1.5">
              <div className="flex justify-between text-xs">
                <span className="font-medium text-[#131b2e]">Top Demonstration Suggestions</span>
                <span className="font-metric font-bold text-[#131b2e]">
                  {analytics.sampleDemoInfo.recommendedCount} items
                </span>
              </div>
              <div className="w-full h-3 bg-[#eaedff] rounded-full overflow-hidden">
                <div className="h-full bg-[#4F46E5] rounded-full w-full" />
              </div>
            </div>

            <div className="space-y-1.5">
              <div className="flex justify-between text-xs">
                <span className="font-medium text-[#131b2e]">
                  Added to Basket from Suggestions
                </span>
                <span className="font-metric font-bold text-[#047857]">
                  {analytics.actualActivity.selectedFromSuggestionsCount} items
                </span>
              </div>
              <div className="w-full h-3 bg-[#ecfdf5] rounded-full overflow-hidden">
                <div
                  className="h-full bg-[#10B981] rounded-full transition-all duration-300"
                  style={{
                    width: `${Math.min(
                      100,
                      Math.round(
                        (analytics.actualActivity.selectedFromSuggestionsCount /
                          Math.max(1, analytics.sampleDemoInfo.recommendedCount)) *
                          100
                      )
                    )}%`,
                  }}
                />
              </div>
            </div>
          </div>
        </section>
      </div>

      {/* Future Backend Evaluation Readiness Note (No fabricated ML accuracy/Precision/Recall/NDCG) */}
      <div className="bg-[#f2f3ff] border border-[#4F46E5]/15 rounded-2xl p-4 flex items-start gap-3 text-xs text-[#464555]">
        <Info className="w-4 h-4 text-[#4F46E5] shrink-0 mt-0.5" aria-hidden="true" />
        <p className="leading-relaxed">
          <strong className="text-[#131b2e]">Recommendation Evaluation Readiness:</strong>{' '}
          Offline recommendation evaluation metrics are intentionally hidden until the Python backend is connected and returns measured evaluation results.
        </p>
      </div>

      {/* Expandable Advanced Recommendation Settings */}
      <section className="bg-white rounded-3xl border border-slate-900/[0.06] overflow-hidden shadow-[0_4px_16px_-4px_rgba(15,23,42,0.04)]">
        <button
          type="button"
          onClick={() => setAdvancedOpen((prev) => !prev)}
          aria-expanded={advancedOpen}
          className="w-full px-6 py-5 flex items-center justify-between text-left hover:bg-[#faf8ff] transition-colors cursor-pointer"
        >
          <div>
            <h2 className="font-display text-base font-bold text-[#131b2e]">
              Advanced Recommendation Settings
            </h2>
            <p className="text-xs text-[#464555] mt-0.5">
              Customize how SmartCart balances your interests, budget fit, and sample ratings.
            </p>
          </div>
          {advancedOpen ? (
            <ChevronUp className="w-5 h-5 text-[#464555]" />
          ) : (
            <ChevronDown className="w-5 h-5 text-[#464555]" />
          )}
        </button>

        {advancedOpen && (
          <div className="px-6 pb-6 pt-2 border-t border-slate-900/[0.06] space-y-5">
            <div className="flex justify-end">
              <button
                type="button"
                onClick={() => onSettingsChange(DEFAULT_RECOMMENDATION_SETTINGS)}
                className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#3525cd] hover:underline cursor-pointer"
              >
                <RotateCcw className="w-3.5 h-3.5" aria-hidden="true" />
                <span>Reset to Defaults</span>
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div>
                <div className="flex justify-between text-xs mb-1.5">
                  <label htmlFor="setting-similarity" className="font-semibold text-[#131b2e]">
                    Product Similarity
                  </label>
                  <span className="font-metric font-bold text-[#3525cd]">
                    {settings.similarity}%
                  </span>
                </div>
                <input
                  id="setting-similarity"
                  type="range"
                  min={0}
                  max={100}
                  value={settings.similarity}
                  onChange={(e) =>
                    onSettingsChange({ ...settings, similarity: Number(e.target.value) })
                  }
                  className="w-full smartcart-slider"
                />
                <p className="text-xs text-[#464555] mt-1.5">
                  How closely a product matches your interests and favorite categories.
                </p>
              </div>

              <div>
                <div className="flex justify-between text-xs mb-1.5">
                  <label htmlFor="setting-budget" className="font-semibold text-[#131b2e]">
                    Budget Fit
                  </label>
                  <span className="font-metric font-bold text-[#3525cd]">
                    {settings.budgetFit}%
                  </span>
                </div>
                <input
                  id="setting-budget"
                  type="range"
                  min={0}
                  max={100}
                  value={settings.budgetFit}
                  onChange={(e) =>
                    onSettingsChange({ ...settings, budgetFit: Number(e.target.value) })
                  }
                  className="w-full smartcart-slider"
                />
                <p className="text-xs text-[#464555] mt-1.5">
                  How well the product fits within your remaining spending limit.
                </p>
              </div>

              <div>
                <div className="flex justify-between text-xs mb-1.5">
                  <label htmlFor="setting-popularity" className="font-semibold text-[#131b2e]">
                    Popularity
                  </label>
                  <span className="font-metric font-bold text-[#3525cd]">
                    {settings.popularity}%
                  </span>
                </div>
                <input
                  id="setting-popularity"
                  type="range"
                  min={0}
                  max={100}
                  value={settings.popularity}
                  onChange={(e) =>
                    onSettingsChange({ ...settings, popularity: Number(e.target.value) })
                  }
                  className="w-full smartcart-slider"
                />
                <p className="text-xs text-[#464555] mt-1.5">
                  How highly rated the product is in the sample catalogue.
                </p>
              </div>
            </div>
          </div>
        )}
      </section>
    </div>
  );
};
