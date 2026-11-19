import React, { useEffect } from 'react';
import { AlertTriangle, CheckCircle2, Star, X } from 'lucide-react';
import { Product } from '../types/smartcart';
import { formatINR } from '../services/formatters';

interface ComparisonModalProps {
  products: Product[];
  remainingBudget: number;
  onClose: () => void;
  onRemoveProduct: (productId: string) => void;
  onAddToBasket: (product: Product, variant?: string) => void;
}

export const ComparisonModal: React.FC<ComparisonModalProps> = ({
  products,
  remainingBudget,
  onClose,
  onRemoveProduct,
  onAddToBasket,
}) => {
  useEffect(() => {
    if (products.length === 0) return;
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [products.length, onClose]);

  if (products.length === 0) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-[#131b2e]/45 backdrop-blur-xs"
      role="dialog"
      aria-modal="true"
      aria-label="Compare selected products"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-3xl border border-slate-900/[0.08] max-w-5xl w-full max-h-[90vh] overflow-y-auto p-6 sm:p-8 shadow-[0_24px_48px_-12px_rgba(15,23,42,0.2)]"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between gap-4 mb-6">
          <div>
            <h2 className="font-display text-2xl font-bold text-[#131b2e]">
              Compare Products
            </h2>
            <p className="text-xs text-[#464555] mt-0.5">
              Side-by-side comparison against your remaining budget ({formatINR(remainingBudget)})
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close product comparison"
            className="w-9 h-9 rounded-lg flex items-center justify-center text-[#464555] hover:text-[#131b2e] hover:bg-[#f2f3ff] cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#4F46E5]"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse min-w-[560px]">
            <thead>
              <tr className="border-b border-slate-900/[0.08]">
                <th className="py-3 pr-4 text-xs font-semibold text-[#464555] w-40 align-top">
                  Attribute
                </th>
                {products.map((p) => (
                  <th key={p.id} className="py-3 px-4 align-top">
                    <div className="space-y-2">
                      <div className="flex items-start justify-between gap-2">
                        <img
                          src={p.image}
                          alt={p.name}
                          referrerPolicy="no-referrer"
                          className="w-20 h-16 rounded-xl object-cover bg-[#F8FAFC] border border-slate-900/[0.06]"
                        />
                        <button
                          type="button"
                          onClick={() => onRemoveProduct(p.id)}
                          aria-label={`Remove ${p.name} from comparison`}
                          className="text-xs text-[#777587] hover:text-[#BE123C] cursor-pointer"
                        >
                          Remove
                        </button>
                      </div>
                      <p className="font-display text-sm font-bold text-[#131b2e]">
                        {p.name}
                      </p>
                    </div>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-900/[0.06] text-xs">
              <tr>
                <td className="py-3.5 pr-4 font-semibold text-[#464555]">Price</td>
                {products.map((p) => (
                  <td key={p.id} className="py-3.5 px-4 font-metric text-base font-bold text-[#131b2e]">
                    {formatINR(p.price)}
                    {p.originalPrice > p.price && (
                      <span className="ml-2 text-xs font-normal text-[#777587] line-through">
                        {formatINR(p.originalPrice)}
                      </span>
                    )}
                  </td>
                ))}
              </tr>
              <tr>
                <td className="py-3.5 pr-4 font-semibold text-[#464555]">Brand & Category</td>
                {products.map((p) => (
                  <td key={p.id} className="py-3.5 px-4 text-[#131b2e]">
                    {p.brand} · {p.category}
                  </td>
                ))}
              </tr>
              <tr>
                <td className="py-3.5 pr-4 font-semibold text-[#464555]">Sample Rating</td>
                {products.map((p) => (
                  <td key={p.id} className="py-3.5 px-4">
                    <span className="inline-flex items-center gap-1 font-metric font-semibold text-[#131b2e]">
                      <Star className="w-3.5 h-3.5 text-amber-500 fill-amber-500" aria-hidden="true" />
                      {p.rating.toFixed(1)} ({p.reviewCount} sample)
                    </span>
                  </td>
                ))}
              </tr>
              <tr>
                <td className="py-3.5 pr-4 font-semibold text-[#464555]">Budget Suitability</td>
                {products.map((p) => {
                  const fits = p.price <= remainingBudget;
                  return (
                    <td key={p.id} className="py-3.5 px-4">
                      {fits ? (
                        <span className="inline-flex items-center gap-1.5 font-semibold text-[#047857]">
                          <CheckCircle2 className="w-3.5 h-3.5" aria-hidden="true" />
                          Fits remaining budget
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1.5 font-semibold text-[#BE123C]">
                          <AlertTriangle className="w-3.5 h-3.5" aria-hidden="true" />
                          {formatINR(p.price - remainingBudget)} over remaining
                        </span>
                      )}
                    </td>
                  );
                })}
              </tr>
              <tr>
                <td className="py-3.5 pr-4 font-semibold text-[#464555] align-top">Key Features</td>
                {products.map((p) => (
                  <td key={p.id} className="py-3.5 px-4 text-[#464555] align-top">
                    <ul className="space-y-1">
                      {p.features.slice(0, 3).map((f, idx) => (
                        <li key={idx}>• {f}</li>
                      ))}
                    </ul>
                  </td>
                ))}
              </tr>
              <tr>
                <td className="py-4 pr-4" />
                {products.map((p) => (
                  <td key={p.id} className="py-4 px-4">
                    <button
                      type="button"
                      onClick={() => onAddToBasket(p, p.variants[0])}
                      className="w-full py-2.5 px-3 text-xs font-semibold text-white bg-[#4F46E5] hover:bg-[#3525cd] rounded-lg transition-colors cursor-pointer"
                    >
                      Add to Basket
                    </button>
                  </td>
                ))}
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
