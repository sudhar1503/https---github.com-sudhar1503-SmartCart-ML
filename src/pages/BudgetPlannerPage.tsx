import React, { useMemo, useState } from 'react';
import {
  CheckCircle2,
  Info,
  Sparkles,
  Trash2,
  TrendingUp,
} from 'lucide-react';
import { BUDGET_PRESETS_INR, PRODUCT_CATEGORIES } from '../data/catalog';
import {
  BasketItem,
  Budget,
  CategoryAllocations,
  OptimizationResult,
  Product,
  ProductCategory,
  Recommendation,
  ShoppingBasket,
  UserPreferences,
} from '../types/smartcart';
import { basketService } from '../services/basketService';
import { formatINR } from '../services/formatters';

interface BudgetPlannerPageProps {
  budget: Budget;
  basket: ShoppingBasket;
  recommendations: Recommendation[];
  preferences: UserPreferences;
  onBudgetChange: (amount: number) => void;
  onAllocationsChange: (allocations: CategoryAllocations) => void;
  onApplyOptimizedBasket: (items: BasketItem[]) => void;
  onViewDetails: (product: Product) => void;
}

export const BudgetPlannerPage: React.FC<BudgetPlannerPageProps> = ({
  budget,
  basket,
  recommendations,
  preferences,
  onBudgetChange,
  onAllocationsChange,
  onApplyOptimizedBasket,
  onViewDetails,
}) => {
  const [optimization, setOptimization] = useState<OptimizationResult | null>(null);
  const [isOptimizing, setIsOptimizing] = useState(false);
  const [optimizerError, setOptimizerError] = useState<string | null>(null);
  const [whatIfIncrease, setWhatIfIncrease] = useState<number>(1000);

  const totalAllocated = PRODUCT_CATEGORIES.reduce(
    (sum, cat) => sum + budget.categoryAllocations[cat],
    0
  );

  const handleRunOptimizer = async () => {
    setIsOptimizing(true);
    setOptimizerError(null);
    try {
      const response = await basketService.optimizeBasketViaBackend(
        {
          totalBudget: budget.totalBudget,
          categoryAllocations: budget.categoryAllocations,
          preferences,
          candidateProductIds: recommendations.map((r) => r.product.id),
        },
        recommendations
      );
      setOptimization(response.data);
      if (!response.success && response.errorMessage) {
        setOptimizerError(
          `Using local demo preview (${response.errorMessage}).`
        );
      }
    } catch {
      setOptimizerError('Could not generate a suggested basket right now.');
    } finally {
      setIsOptimizing(false);
    }
  };

  const handleRemoveFromOptimized = (productId: string) => {
    if (!optimization) return;
    const remainingItems = optimization.selectedItems.filter(
      (item) => item.product.id !== productId
    );
    const combinedPrice = remainingItems.reduce((s, item) => s + item.product.price, 0);
    const estimatedSavings = remainingItems.reduce(
      (s, item) => s + Math.max(0, item.product.originalPrice - item.product.price),
      0
    );
    setOptimization({
      ...optimization,
      selectedItems: remainingItems,
      combinedPrice,
      remainingBudget: Math.max(0, budget.totalBudget - combinedPrice),
      estimatedSavings,
    });
  };

  const handleAllocationChange = (category: ProductCategory, val: number) => {
    onAllocationsChange({
      ...budget.categoryAllocations,
      [category]: Math.max(0, Math.min(15000, val)),
    });
  };

  const whatIfTarget = budget.totalBudget + whatIfIncrease;
  const whatIfScenario = useMemo(
    () =>
      basketService.exploreWhatIfBudget(
        budget.totalBudget,
        whatIfTarget,
        recommendations,
        basket.items.map((i) => i.productId)
      ),
    [budget.totalBudget, whatIfTarget, recommendations, basket.items]
  );

  return (
    <div className="space-y-8">
      <div>
        <h1 className="font-display text-3xl font-bold text-[#131b2e] tracking-tight">
          Smart Budget Planner
        </h1>
        <p className="text-sm sm:text-base text-[#464555] mt-1">
          Set your spending limit, divide your budget across categories, and preview a balanced basket.
        </p>
      </div>

      {/* Budget Input + Category Allocation */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left: Total Budget Control */}
        <section className="lg:col-span-5 bg-white rounded-3xl border border-slate-900/[0.06] p-6 space-y-5 shadow-[0_4px_20px_-4px_rgba(15,23,42,0.04)]">
          <div>
            <h2 className="font-display text-lg font-bold text-[#131b2e]">
              1. Set Your Shopping Budget
            </h2>
            <p className="text-xs text-[#464555] mt-0.5">
              Enter a custom limit or pick a suggested preset below.
            </p>
          </div>

          <div className="flex items-center justify-between gap-3">
            <label htmlFor="planner-budget-input" className="text-sm font-medium text-[#131b2e]">
              Total Budget (₹)
            </label>
            <div className="relative w-36">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 font-metric text-sm font-bold text-[#464555]">
                ₹
              </span>
              <input
                id="planner-budget-input"
                type="number"
                min={500}
                max={50000}
                step={100}
                value={budget.totalBudget}
                onChange={(e) => onBudgetChange(Math.max(0, Number(e.target.value)))}
                className="w-full h-10 pl-7 pr-3 text-right font-metric text-base font-bold text-[#131b2e] border border-[#CBD5E1] rounded-lg focus:outline-none focus:border-[#4F46E5]"
              />
            </div>
          </div>

          <input
            type="range"
            min={500}
            max={15000}
            step={250}
            value={Math.min(15000, Math.max(500, budget.totalBudget))}
            onChange={(e) => onBudgetChange(Number(e.target.value))}
            aria-label="Adjust total shopping budget"
            className="w-full smartcart-slider"
          />

          <div className="grid grid-cols-4 gap-2">
            {BUDGET_PRESETS_INR.map((preset) => {
              const active = budget.totalBudget === preset;
              return (
                <button
                  key={preset}
                  type="button"
                  onClick={() => onBudgetChange(preset)}
                  className={`py-2 text-xs font-metric font-bold rounded-xl transition-colors cursor-pointer ${
                    active
                      ? 'bg-[#4F46E5] text-white'
                      : 'bg-[#f2f3ff] text-[#464555] hover:bg-[#eaedff] hover:text-[#131b2e]'
                  }`}
                >
                  {formatINR(preset)}
                </button>
              );
            })}
          </div>

          <div className="pt-4 border-t border-slate-900/[0.06] space-y-2">
            <button
              type="button"
              onClick={handleRunOptimizer}
              disabled={isOptimizing}
              className="w-full py-3.5 px-5 inline-flex items-center justify-center gap-2 text-sm font-semibold text-white bg-[#4F46E5] hover:bg-[#3525cd] disabled:opacity-60 rounded-xl shadow-[0_2px_8px_rgba(79,70,229,0.25)] transition-colors cursor-pointer"
            >
              <Sparkles className="w-4 h-4" aria-hidden="true" />
              <span>{isOptimizing ? 'Finding Basket...' : 'Find My Best Shopping Basket'}</span>
            </button>
            <p className="text-[11px] text-[#464555] text-center">
              Uses a frontend demonstration selector while backend exact optimization is disconnected.
            </p>
          </div>
        </section>

        {/* Right: Category Allocation & Simple Chart */}
        <section className="lg:col-span-7 bg-white rounded-3xl border border-slate-900/[0.06] p-6 space-y-5 shadow-[0_4px_20px_-4px_rgba(15,23,42,0.04)]">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div>
              <h2 className="font-display text-lg font-bold text-[#131b2e]">
                2. Category Allocation
              </h2>
              <p className="text-xs text-[#464555] mt-0.5">
                Set spending limits per category (sum of limits: {formatINR(totalAllocated)}).
              </p>
            </div>
          </div>

          <div className="space-y-4">
            {PRODUCT_CATEGORIES.map((category) => {
              const allocated = budget.categoryAllocations[category];
              const spent = basket.categorySpend[category];
              const pct =
                allocated > 0
                  ? Math.min(100, Math.round((spent / allocated) * 100))
                  : spent > 0
                  ? 100
                  : 0;
              const over = spent > allocated;

              return (
                <div key={category} className="space-y-1.5">
                  <div className="flex flex-wrap items-center justify-between gap-2 text-xs">
                    <span className="font-semibold text-[#131b2e]">{category}</span>
                    <div className="flex items-center gap-3">
                      <span className={over ? 'text-[#BE123C] font-semibold' : 'text-[#464555]'}>
                        Spent: <strong className="font-metric">{formatINR(spent)}</strong>
                      </span>
                      <div className="relative w-24">
                        <span className="absolute left-2 top-1/2 -translate-y-1/2 font-metric text-[11px] text-[#464555]">
                          ₹
                        </span>
                        <input
                          type="number"
                          min={0}
                          max={15000}
                          step={100}
                          aria-label={`${category} allocation`}
                          value={allocated}
                          onChange={(e) =>
                            handleAllocationChange(category, Number(e.target.value))
                          }
                          className="w-full h-8 pl-5 pr-2 text-right font-metric text-xs font-bold text-[#131b2e] border border-[#CBD5E1] rounded-lg focus:outline-none focus:border-[#4F46E5]"
                        />
                      </div>
                    </div>
                  </div>
                  <div className="w-full h-2 bg-[#E2E8F0] rounded-full overflow-hidden">
                    <div
                      className="h-full rounded-full transition-all duration-300"
                      style={{
                        width: `${pct}%`,
                        backgroundColor: over ? '#F43F5E' : '#4F46E5',
                      }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </section>
      </div>

      {/* Suggested Basket Preview Results */}
      {optimizerError && (
        <div className="p-3.5 rounded-2xl bg-[#fff7ed] border border-[#f97316]/25 text-xs text-[#c2410c]">
          {optimizerError}
        </div>
      )}

      {optimization && (
        <section className="bg-white rounded-3xl border-2 border-[#4F46E5]/20 p-6 sm:p-7 space-y-6 shadow-[0_8px_24px_-6px_rgba(79,70,229,0.1)]">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div>
              <div className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#3525cd]">
                <Info className="w-3.5 h-3.5" aria-hidden="true" />
                <span>
                  {optimization.algorithmType === 'frontend-greedy-demo'
                    ? 'Demonstration Preview (Simple Greedy Selection — Not Backend Exact Solver)'
                    : 'Server-Optimized Basket'}
                </span>
              </div>
              <h2 className="font-display text-2xl font-bold text-[#131b2e] mt-1">
                Suggested Basket Within Your Budget
              </h2>
              <p className="text-sm text-[#464555] mt-1">
                {optimization.selectionExplanation}
              </p>
            </div>

            <button
              type="button"
              onClick={() =>
                onApplyOptimizedBasket(
                  optimization.selectedItems.map((item) => ({
                    productId: item.product.id,
                    quantity: 1,
                    selectedVariant: item.product.variants[0],
                  }))
                )
              }
              disabled={optimization.selectedItems.length === 0}
              className="px-5 py-2.5 text-sm font-semibold text-white bg-[#10B981] hover:bg-[#059669] disabled:opacity-45 rounded-xl transition-colors cursor-pointer"
            >
              Use This Basket
            </button>
          </div>

          {/* Side-by-side comparison: Suggested vs Current Basket */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="p-4 rounded-2xl bg-[#ecfdf5] border border-[#10B981]/20">
              <p className="text-xs font-semibold text-[#047857]">
                Suggested Basket Preview
              </p>
              <div className="flex flex-wrap items-baseline justify-between gap-2 mt-1">
                <span className="font-metric text-2xl font-bold text-[#131b2e]">
                  {formatINR(optimization.combinedPrice)}
                </span>
                <span className="text-xs font-metric font-semibold text-[#047857]">
                  {formatINR(optimization.remainingBudget)} remaining · Save {formatINR(optimization.estimatedSavings)}
                </span>
              </div>
            </div>

            <div className="p-4 rounded-2xl bg-[#faf8ff] border border-slate-900/[0.06]">
              <p className="text-xs font-semibold text-[#464555]">
                Your Current Basket
              </p>
              <div className="flex flex-wrap items-baseline justify-between gap-2 mt-1">
                <span className="font-metric text-2xl font-bold text-[#131b2e]">
                  {formatINR(basket.subtotal)}
                </span>
                <span className="text-xs font-metric text-[#464555]">
                  {basket.totalQuantity} item(s) ·{' '}
                  {budget.status === 'over'
                    ? `Over by ${formatINR(budget.overAmount)}`
                    : `${formatINR(budget.remaining)} remaining`}
                </span>
              </div>
            </div>
          </div>

          {optimization.selectedItems.length === 0 ? (
            <p className="text-sm text-[#464555]">
              No products fit within your current total budget and category limits. Try increasing a category limit or raising your total budget.
            </p>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {optimization.selectedItems.map(({ product, selectionReason }) => (
                <div
                  key={product.id}
                  className="p-4 rounded-2xl border border-slate-900/[0.07] flex items-start justify-between gap-3"
                >
                  <div className="flex items-start gap-3 min-w-0">
                    <img
                      src={product.image}
                      alt={product.name}
                      referrerPolicy="no-referrer"
                      className="w-14 h-14 rounded-xl object-cover bg-[#F8FAFC] shrink-0"
                    />
                    <div className="min-w-0">
                      <button
                        type="button"
                        onClick={() => onViewDetails(product)}
                        className="text-sm font-bold text-[#131b2e] hover:text-[#3525cd] text-left cursor-pointer"
                      >
                        {product.name}
                      </button>
                      <p className="text-xs text-[#464555] mt-0.5">
                        {product.category} · <strong className="font-metric text-[#131b2e]">{formatINR(product.price)}</strong>
                      </p>
                      <p className="text-[11px] text-[#3525cd] mt-1 leading-snug">
                        {selectionReason}
                      </p>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => handleRemoveFromOptimized(product.id)}
                    aria-label={`Remove ${product.name} from suggestion`}
                    className="p-2 text-[#777587] hover:text-[#BE123C] rounded-lg cursor-pointer shrink-0"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
          )}
        </section>
      )}

      {/* What-If Budget Explorer */}
      <section className="bg-white rounded-3xl border border-slate-900/[0.06] p-6 sm:p-7 space-y-5 shadow-[0_4px_20px_-4px_rgba(15,23,42,0.04)]">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-[#f2f3ff] text-[#4F46E5] flex items-center justify-center">
              <TrendingUp className="w-4 h-4" aria-hidden="true" />
            </div>
            <div>
              <h2 className="font-display text-lg font-bold text-[#131b2e]">
                What-If Budget Explorer
              </h2>
              <p className="text-xs text-[#464555]">
                See how increasing your budget changes what you can include.
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {[500, 1000, 2000, 3000].map((inc) => (
              <button
                key={inc}
                type="button"
                onClick={() => setWhatIfIncrease(inc)}
                className={`px-3 py-1.5 text-xs font-metric font-semibold rounded-lg transition-colors cursor-pointer ${
                  whatIfIncrease === inc
                    ? 'bg-[#4F46E5] text-white'
                    : 'bg-[#f2f3ff] text-[#464555] hover:text-[#131b2e]'
                }`}
              >
                +{formatINR(inc)}
              </button>
            ))}
          </div>
        </div>

        <p className="text-sm text-[#131b2e] bg-[#faf8ff] p-4 rounded-2xl border border-slate-900/[0.06]">
          {whatIfScenario.summary}
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {whatIfScenario.additionalProducts.map((p) => (
            <button
              key={p.id}
              type="button"
              onClick={() => onViewDetails(p)}
              className="p-4 rounded-2xl border border-slate-900/[0.07] hover:border-[#4F46E5]/30 text-left flex items-center gap-3 transition-colors cursor-pointer"
            >
              <img
                src={p.image}
                alt={p.name}
                referrerPolicy="no-referrer"
                className="w-12 h-12 rounded-xl object-cover bg-[#F8FAFC] shrink-0"
              />
              <div className="min-w-0">
                <p className="text-xs font-bold text-[#131b2e] truncate">{p.name}</p>
                <p className="font-metric text-xs font-semibold text-[#047857] mt-0.5">
                  {formatINR(p.price)}
                </p>
                <span className="inline-flex items-center gap-1 text-[11px] text-[#464555] mt-0.5">
                  <CheckCircle2 className="w-3 h-3 text-[#10B981]" aria-hidden="true" />
                  <span>Fits expanded budget</span>
                </span>
              </div>
            </button>
          ))}
        </div>
      </section>
    </div>
  );
};
