import React, { useMemo, useRef, useState } from 'react';
import {
  AlertTriangle,
  ArrowRightLeft,
  CheckCircle2,
  Info,
  Minus,
  Plus,
  Trash2,
} from 'lucide-react';
import { CATALOG_PRODUCTS } from '../data/catalog';
import {
  Budget,
  PageId,
  Product,
  ShoppingBasket,
  SmartSwapOption,
} from '../types/smartcart';
import { basketService } from '../services/basketService';
import { formatINR } from '../services/formatters';

interface BasketPageProps {
  basket: ShoppingBasket;
  budget: Budget;
  onIncrement: (productId: string, selectedVariant: string) => void;
  onDecrement: (productId: string, selectedVariant: string) => void;
  onRemove: (productId: string, selectedVariant: string) => void;
  onConfirmSwap: (swap: SmartSwapOption) => void;
  onViewDetails: (product: Product) => void;
  onNavigate: (page: PageId) => void;
}

export const BasketPage: React.FC<BasketPageProps> = ({
  basket,
  budget,
  onIncrement,
  onDecrement,
  onRemove,
  onConfirmSwap,
  onViewDetails,
  onNavigate,
}) => {
  const [pendingSwapKey, setPendingSwapKey] = useState<string | null>(null);
  const confirmSectionRef = useRef<HTMLElement | null>(null);
  const productMap = useMemo(
    () => new Map(CATALOG_PRODUCTS.map((p) => [p.id, p])),
    []
  );

  const availableSwaps = useMemo(
    () => basketService.findCheaperAlternativesForBasket(basket.items, budget),
    [basket.items, budget]
  );

  // Key swaps strictly by (productId, selectedVariant)
  const swapByItemKey = useMemo(
    () =>
      new Map(
        availableSwaps.map((s) => [`${s.currentProduct.id}::${s.currentVariant}`, s])
      ),
    [availableSwaps]
  );

  const pendingSwap = pendingSwapKey ? swapByItemKey.get(pendingSwapKey) ?? null : null;

  const handleOpenSwapConfirmation = (itemKey: string) => {
    setPendingSwapKey(itemKey);
    window.requestAnimationFrame(() => {
      confirmSectionRef.current?.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    });
  };

  return (
    <div className="space-y-8">
      <div>
        <h1 className="font-display text-3xl font-bold text-[#131b2e] tracking-tight">
          My Shopping Basket
        </h1>
        <p className="text-sm text-[#464555] mt-1">
          Adjust quantities per option, check your remaining budget, or switch to a cheaper alternative.
        </p>
      </div>

      {/* Explicit Budget Status Banner */}
      <div
        className={`rounded-2xl p-4 border flex flex-wrap items-center justify-between gap-3 ${
          budget.status === 'over'
            ? 'bg-[#fff1f2] border-[#F43F5E]/25 text-[#BE123C]'
            : budget.status === 'approaching'
            ? 'bg-[#fff7ed] border-[#f97316]/25 text-[#c2410c]'
            : 'bg-[#ecfdf5] border-[#10B981]/25 text-[#047857]'
        }`}
      >
        <div className="flex items-center gap-2.5 text-sm font-semibold">
          {budget.status === 'within' ? (
            <CheckCircle2 className="w-5 h-5 shrink-0" aria-hidden="true" />
          ) : (
            <AlertTriangle className="w-5 h-5 shrink-0" aria-hidden="true" />
          )}
          <span>{budget.statusMessage}</span>
        </div>

        <span className="font-metric text-xs font-bold">
          {budget.status === 'over'
            ? `Over by ${formatINR(budget.overAmount)}`
            : `${formatINR(budget.remaining)} remaining of ${formatINR(budget.totalBudget)}`}
        </span>
      </div>

      {/* Confirmation Panel for Smart Swap */}
      {pendingSwap && (
        <section
          ref={confirmSectionRef}
          aria-label="Confirm cheaper alternative swap"
          className="bg-white rounded-3xl border-2 border-[#4F46E5]/30 p-6 shadow-[0_12px_28px_-6px_rgba(79,70,229,0.12)]"
        >
          <div className="flex items-center gap-2 text-sm font-bold text-[#3525cd] mb-3">
            <ArrowRightLeft className="w-4 h-4" aria-hidden="true" />
            <span>Confirm Cheaper Alternative Replacement</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-center bg-[#faf8ff] p-4 rounded-2xl border border-slate-900/[0.06] mb-4">
            <div>
              <p className="text-[11px] text-[#464555]">
                Current Product ({pendingSwap.currentVariant} × {pendingSwap.currentQuantity})
              </p>
              <p className="text-sm font-semibold text-[#131b2e]">
                {pendingSwap.currentProduct.name}
              </p>
              <p className="font-metric text-base font-bold text-[#131b2e] mt-0.5">
                {formatINR(pendingSwap.currentProduct.price * pendingSwap.currentQuantity)}
                {pendingSwap.currentQuantity > 1 && (
                  <span className="text-xs font-normal text-[#464555] ml-1.5">
                    ({formatINR(pendingSwap.currentProduct.price)} each)
                  </span>
                )}
              </p>
            </div>

            <div>
              <p className="text-[11px] text-[#047857] font-semibold">
                Suggested Alternative ({pendingSwap.alternativeProduct.variants[0]} × {pendingSwap.currentQuantity})
              </p>
              <p className="text-sm font-semibold text-[#131b2e]">
                {pendingSwap.alternativeProduct.name}
              </p>
              <p className="font-metric text-base font-bold text-[#047857] mt-0.5">
                {formatINR(pendingSwap.alternativeProduct.price * pendingSwap.currentQuantity)}
                {pendingSwap.currentQuantity > 1 && (
                  <span className="text-xs font-normal text-[#464555] ml-1.5">
                    ({formatINR(pendingSwap.alternativeProduct.price)} each)
                  </span>
                )}
              </p>
            </div>

            <div className="md:text-right">
              <p className="text-[11px] text-[#464555]">Total You Save</p>
              <p className="font-metric text-xl font-bold text-[#047857]">
                {formatINR(pendingSwap.totalSavings)}
              </p>
            </div>
          </div>

          <p className="text-xs text-[#464555] mb-4">{pendingSwap.reason}</p>

          <div className="flex flex-wrap items-center gap-3">
            <button
              type="button"
              onClick={() => {
                onConfirmSwap(pendingSwap);
                setPendingSwapKey(null);
              }}
              className="min-h-[40px] px-5 py-2.5 text-xs font-semibold text-white bg-[#4F46E5] hover:bg-[#3525cd] rounded-xl transition-colors cursor-pointer"
            >
              Confirm Replacement & Save {formatINR(pendingSwap.totalSavings)}
            </button>
            <button
              type="button"
              onClick={() => setPendingSwapKey(null)}
              className="min-h-[40px] px-4 py-2.5 text-xs font-semibold text-[#464555] hover:text-[#131b2e] bg-[#f2f3ff] rounded-xl transition-colors cursor-pointer"
            >
              Keep Current Product
            </button>
          </div>
        </section>
      )}

      {basket.items.length === 0 ? (
        <div className="bg-white rounded-3xl border border-slate-900/[0.06] p-12 text-center">
          <h2 className="font-display text-xl font-bold text-[#131b2e]">
            Your shopping basket is empty
          </h2>
          <p className="text-sm text-[#464555] mt-1 mb-6">
            Explore products or check your personalized picks to start building a budget-friendly basket.
          </p>
          <div className="flex flex-wrap justify-center gap-3">
            <button
              type="button"
              onClick={() => onNavigate('explore')}
              className="px-5 py-2.5 text-sm font-semibold text-white bg-[#4F46E5] hover:bg-[#3525cd] rounded-xl cursor-pointer"
            >
              Explore Products
            </button>
            <button
              type="button"
              onClick={() => onNavigate('planner')}
              className="px-5 py-2.5 text-sm font-semibold text-[#3525cd] bg-[#f2f3ff] hover:bg-[#eaedff] rounded-xl cursor-pointer"
            >
              Find My Best Shopping Basket
            </button>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Left 8 Columns: Basket Items */}
          <div className="lg:col-span-8 space-y-4">
            {basket.items.map((item) => {
              const product = productMap.get(item.productId);
              if (!product) return null;
              const itemKey = `${item.productId}::${item.selectedVariant}`;
              const swap = swapByItemKey.get(itemKey);
              const lineTotal = product.price * item.quantity;

              return (
                <article
                  key={itemKey}
                  className="bg-white rounded-2xl border border-slate-900/[0.07] p-4 sm:p-5 flex flex-col sm:flex-row gap-4 justify-between shadow-[0_4px_16px_-4px_rgba(15,23,42,0.04)]"
                >
                  <div className="flex gap-4">
                    <button
                      type="button"
                      onClick={() => onViewDetails(product)}
                      className="w-24 h-20 rounded-xl overflow-hidden bg-[#F8FAFC] shrink-0 border border-slate-900/[0.06] cursor-pointer"
                    >
                      <img
                        src={product.image}
                        alt={product.name}
                        referrerPolicy="no-referrer"
                        className="w-full h-full object-cover"
                      />
                    </button>

                    <div className="min-w-0">
                      <p className="text-xs text-[#464555]">
                        {product.brand} · {product.category}
                      </p>
                      <button
                        type="button"
                        onClick={() => onViewDetails(product)}
                        className="text-left cursor-pointer"
                      >
                        <h3 className="font-display text-base font-bold text-[#131b2e] hover:text-[#3525cd]">
                          {product.name}
                        </h3>
                      </button>
                      <p className="text-xs text-[#464555] mt-0.5">
                        Option: <strong className="text-[#131b2e]">{item.selectedVariant}</strong> · Unit price:{' '}
                        <span className="font-metric font-semibold text-[#131b2e]">
                          {formatINR(product.price)}
                        </span>
                      </p>

                      {swap && (
                        <button
                          type="button"
                          onClick={() => handleOpenSwapConfirmation(itemKey)}
                          className="mt-2.5 inline-flex items-center gap-1.5 min-h-[40px] px-3 py-2 text-xs font-semibold text-[#3525cd] bg-[#f2f3ff] hover:bg-[#eaedff] rounded-lg transition-colors cursor-pointer"
                        >
                          <ArrowRightLeft className="w-3.5 h-3.5" aria-hidden="true" />
                          <span>
                            Find a Cheaper Alternative (Save {formatINR(swap.totalSavings)})
                          </span>
                        </button>
                      )}
                    </div>
                  </div>

                  {/* Quantity & Line Subtotal strictly for (productId, selectedVariant) */}
                  <div className="flex sm:flex-col items-center sm:items-end justify-between gap-3 shrink-0 pt-2 sm:pt-0 border-t sm:border-t-0 border-slate-900/[0.05]">
                    <span className="font-metric text-lg font-bold text-[#131b2e]">
                      {formatINR(lineTotal)}
                    </span>

                    <div className="flex items-center gap-2">
                      <div className="inline-flex items-center border border-slate-900/12 rounded-lg">
                        <button
                          type="button"
                          disabled={item.quantity <= 1}
                          onClick={() => onDecrement(item.productId, item.selectedVariant)}
                          aria-label={`Decrease quantity of ${product.name} (${item.selectedVariant})`}
                          className="w-10 h-10 flex items-center justify-center text-[#464555] hover:text-[#131b2e] disabled:opacity-35 disabled:cursor-not-allowed cursor-pointer"
                        >
                          <Minus className="w-3.5 h-3.5" />
                        </button>
                        <span className="font-metric text-xs font-bold w-8 text-center text-[#131b2e]">
                          {item.quantity}
                        </span>
                        <button
                          type="button"
                          onClick={() => onIncrement(item.productId, item.selectedVariant)}
                          aria-label={`Increase quantity of ${product.name} (${item.selectedVariant})`}
                          className="w-10 h-10 flex items-center justify-center text-[#464555] hover:text-[#131b2e] cursor-pointer"
                        >
                          <Plus className="w-3.5 h-3.5" />
                        </button>
                      </div>

                      <button
                        type="button"
                        onClick={() => onRemove(item.productId, item.selectedVariant)}
                        aria-label={`Remove ${product.name} (${item.selectedVariant}) from basket`}
                        className="w-10 h-10 flex items-center justify-center text-[#777587] hover:text-[#BE123C] rounded-lg transition-colors cursor-pointer"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </article>
              );
            })}
          </div>

          {/* Right 4 Columns: Shopping Summary */}
          <aside className="lg:col-span-4 bg-white rounded-3xl border border-slate-900/[0.06] p-6 space-y-5 shadow-[0_4px_20px_-4px_rgba(15,23,42,0.04)] lg:sticky lg:top-24">
            <h2 className="font-display text-lg font-bold text-[#131b2e]">
              Shopping Summary
            </h2>

            <dl className="space-y-2.5 text-sm">
              <div className="flex justify-between">
                <dt className="text-[#464555]">Basket Line Items</dt>
                <dd className="font-metric font-semibold text-[#131b2e]">
                  {basket.totalProducts}
                </dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-[#464555]">Total Quantity</dt>
                <dd className="font-metric font-semibold text-[#131b2e]">
                  {basket.totalQuantity}
                </dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-[#464555]">Basket Total</dt>
                <dd className="font-metric font-bold text-[#131b2e]">
                  {formatINR(basket.subtotal)}
                </dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-[#464555]">Your Budget</dt>
                <dd className="font-metric font-semibold text-[#131b2e]">
                  {formatINR(budget.totalBudget)}
                </dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-[#464555]">
                  {budget.status === 'over' ? 'Over Budget By' : 'Your Remaining Budget'}
                </dt>
                <dd
                  className={`font-metric font-bold ${
                    budget.status === 'over' ? 'text-[#BE123C]' : 'text-[#047857]'
                  }`}
                >
                  {budget.status === 'over'
                    ? formatINR(budget.overAmount)
                    : formatINR(budget.remaining)}
                </dd>
              </div>
              <div className="flex justify-between pt-2.5 border-t border-slate-900/[0.06]">
                <dt className="text-[#047857] font-medium">Estimated Retail Savings</dt>
                <dd className="font-metric font-bold text-[#047857]">
                  {formatINR(basket.estimatedSavings)}
                </dd>
              </div>
            </dl>

            {/* Quick Smart Swap Trigger if available */}
            {availableSwaps.length > 0 && !pendingSwap && (
              <button
                type="button"
                onClick={() =>
                  handleOpenSwapConfirmation(
                    `${availableSwaps[0].currentProduct.id}::${availableSwaps[0].currentVariant}`
                  )
                }
                className="w-full min-h-[40px] py-2.5 px-4 text-xs font-semibold text-[#3525cd] bg-[#f2f3ff] hover:bg-[#eaedff] rounded-xl transition-colors cursor-pointer"
              >
                Find a Cheaper Alternative (Save {formatINR(availableSwaps[0].totalSavings)})
              </button>
            )}

            <button
              type="button"
              onClick={() => onNavigate('planner')}
              className="w-full min-h-[40px] py-2.5 px-4 text-xs font-semibold text-white bg-[#4F46E5] hover:bg-[#3525cd] rounded-xl transition-colors cursor-pointer"
            >
              Open Smart Budget Planner
            </button>

            <div className="p-3 rounded-xl bg-[#faf8ff] border border-slate-900/[0.06] flex items-start gap-2 text-[11px] text-[#464555]">
              <Info className="w-3.5 h-3.5 text-[#4F46E5] shrink-0 mt-0.5" aria-hidden="true" />
              <span>
                Academic shopping demonstration: SmartCart ML helps you plan and optimize your basket without processing real payments.
              </span>
            </div>
          </aside>
        </div>
      )}
    </div>
  );
};
