import React, { useEffect, useState } from 'react';
import {
  AlertTriangle,
  CheckCircle2,
  Heart,
  Package,
  Star,
  X,
} from 'lucide-react';
import { Product, RecommendationExplanation } from '../types/smartcart';
import { formatINR } from '../services/formatters';
import { productService } from '../services/productService';

interface ProductDetailModalProps {
  product: Product | null;
  explanation?: RecommendationExplanation;
  remainingBudget: number;
  isWishlisted: boolean;
  onClose: () => void;
  onAddToBasket: (product: Product, variant: string) => void;
  onToggleWishlist: (productId: string) => void;
  onSelectProduct: (product: Product) => void;
}

export const ProductDetailModal: React.FC<ProductDetailModalProps> = ({
  product,
  explanation,
  remainingBudget,
  isWishlisted,
  onClose,
  onAddToBasket,
  onToggleWishlist,
  onSelectProduct,
}) => {
  const [selectedVariant, setSelectedVariant] = useState<string>('');
  const [imgError, setImgError] = useState(false);

  useEffect(() => {
    if (product) {
      setSelectedVariant(product.variants[0]);
      setImgError(false);
    }
  }, [product]);

  useEffect(() => {
    if (!product) return;
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [product, onClose]);

  if (!product) return null;

  const activeVariant = selectedVariant || product.variants[0];
  const savings = Math.max(0, product.originalPrice - product.price);
  const postAddRemaining = remainingBudget - product.price;
  const fitsBudget = postAddRemaining >= 0;

  const similarProducts = productService.getSimilarProducts(product);
  const cheaperAlternatives = productService.getCheaperAlternatives(product);

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-[#131b2e]/45 backdrop-blur-xs"
      role="dialog"
      aria-modal="true"
      aria-labelledby="product-modal-title"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-3xl border border-slate-900/[0.08] max-w-4xl w-full max-h-[90vh] overflow-y-auto shadow-[0_24px_48px_-12px_rgba(15,23,42,0.2)]"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="grid grid-cols-1 md:grid-cols-12">
          {/* Left Column: Product Image & Budget Check */}
          <div className="md:col-span-5 bg-[#F8FAFC] p-6 sm:p-7 border-b md:border-b-0 md:border-r border-slate-900/[0.06] flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between text-xs text-[#464555] mb-3">
                <span className="font-medium">
                  {product.brand} · {product.category}
                </span>
                <span className="inline-flex items-center gap-1 text-[#131b2e] font-semibold">
                  <Star className="w-3.5 h-3.5 text-amber-500 fill-amber-500" aria-hidden="true" />
                  <span className="font-metric">{product.rating.toFixed(1)}</span>
                  <span className="text-[#777587]">({product.reviewCount} sample)</span>
                </span>
              </div>

              <div className="aspect-[4/3] rounded-2xl overflow-hidden bg-white border border-slate-900/[0.06]">
                {!imgError ? (
                  <img
                    src={product.image}
                    alt={product.name}
                    referrerPolicy="no-referrer"
                    onError={() => setImgError(true)}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full bg-[#f2f3ff] flex flex-col items-center justify-center p-4 text-center">
                    <Package className="w-10 h-10 text-[#4F46E5]/60 mb-2" aria-hidden="true" />
                    <span className="text-xs font-medium text-[#464555]">{product.name}</span>
                  </div>
                )}
              </div>

              {/* Why We Suggested This */}
              <div className="mt-5 p-4 rounded-2xl bg-white border border-slate-900/[0.06]">
                <h3 className="font-display text-sm font-bold text-[#131b2e] mb-2">
                  Why We Suggested This
                </h3>
                <ul className="space-y-1.5 text-xs text-[#464555] leading-relaxed">
                  {(explanation?.reasons && explanation.reasons.length > 0
                    ? explanation.reasons
                    : [
                        `Part of the ${product.category} sample catalogue.`,
                        `Sample rating of ${product.rating.toFixed(1)} out of 5.`,
                      ]
                  ).map((reason, idx) => (
                    <li key={idx} className="flex items-start gap-2">
                      <CheckCircle2
                        className="w-3.5 h-3.5 text-[#4F46E5] shrink-0 mt-0.5"
                        aria-hidden="true"
                      />
                      <span>{reason}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            {/* Budget Fit Preview */}
            <div
              className={`mt-5 p-3.5 rounded-xl flex items-center gap-2 text-xs font-medium ${
                fitsBudget
                  ? 'bg-[#ecfdf5] text-[#047857]'
                  : 'bg-[#fff1f2] text-[#BE123C]'
              }`}
            >
              {fitsBudget ? (
                <>
                  <CheckCircle2 className="w-4 h-4 shrink-0" aria-hidden="true" />
                  <span>
                    Fits your remaining budget — adding this leaves{' '}
                    <strong className="font-metric">{formatINR(postAddRemaining)}</strong>.
                  </span>
                </>
              ) : (
                <>
                  <AlertTriangle className="w-4 h-4 shrink-0" aria-hidden="true" />
                  <span>
                    Exceeds your remaining budget by{' '}
                    <strong className="font-metric">
                      {formatINR(Math.abs(postAddRemaining))}
                    </strong>
                    .
                  </span>
                </>
              )}
            </div>
          </div>

          {/* Right Column: Details, Features, Advantages, Actions */}
          <div className="md:col-span-7 p-6 sm:p-7 space-y-5">
            <div className="flex items-start justify-between gap-4">
              <div>
                <h2
                  id="product-modal-title"
                  className="font-display text-2xl font-bold text-[#131b2e] leading-tight"
                >
                  {product.name}
                </h2>
                <div className="flex items-baseline gap-3 mt-2">
                  <span className="font-metric text-2xl font-bold text-[#131b2e]">
                    {formatINR(product.price)}
                  </span>
                  {product.originalPrice > product.price && (
                    <>
                      <span className="font-metric text-sm text-[#777587] line-through">
                        {formatINR(product.originalPrice)}
                      </span>
                      <span className="font-metric text-xs font-semibold text-[#047857]">
                        Save {formatINR(savings)}
                      </span>
                    </>
                  )}
                </div>
              </div>

              <button
                type="button"
                onClick={onClose}
                aria-label="Close product details"
                className="w-9 h-9 rounded-lg flex items-center justify-center text-[#464555] hover:text-[#131b2e] hover:bg-[#f2f3ff] shrink-0 cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#4F46E5]"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <p className="text-sm text-[#464555] leading-relaxed">
              {product.description}
            </p>

            {/* Variants */}
            <div>
              <span className="block text-xs font-semibold text-[#131b2e] mb-2">
                Select Option
              </span>
              <div className="flex flex-wrap gap-2">
                {product.variants.map((variant) => (
                  <button
                    key={variant}
                    type="button"
                    onClick={() => setSelectedVariant(variant)}
                    aria-pressed={activeVariant === variant}
                    className={`px-3.5 py-2 text-xs font-medium rounded-lg border transition-colors cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#4F46E5] ${
                      activeVariant === variant
                        ? 'border-[#4F46E5] bg-[#f2f3ff] text-[#3525cd] font-semibold'
                        : 'border-slate-900/12 bg-white text-[#464555] hover:text-[#131b2e]'
                    }`}
                  >
                    {variant}
                  </button>
                ))}
              </div>
            </div>

            {/* Key Features & Advantages */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
              <div>
                <h3 className="text-xs font-semibold text-[#131b2e] mb-2">
                  Key Features
                </h3>
                <ul className="space-y-1.5 text-xs text-[#464555]">
                  {product.features.map((feat, i) => (
                    <li key={i} className="leading-snug">
                      • {feat}
                    </li>
                  ))}
                </ul>
              </div>
              <div>
                <h3 className="text-xs font-semibold text-[#131b2e] mb-2">
                  Everyday Advantages
                </h3>
                <ul className="space-y-1.5 text-xs text-[#464555]">
                  {product.advantages.map((adv, i) => (
                    <li key={i} className="leading-snug">
                      • {adv}
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            {/* Primary Actions */}
            <div className="flex items-center gap-3 pt-2">
              <button
                type="button"
                onClick={() => {
                  onAddToBasket(product, activeVariant);
                  onClose();
                }}
                className="flex-1 min-h-[44px] py-3 px-5 text-sm font-semibold text-white bg-[#4F46E5] hover:bg-[#3525cd] rounded-xl transition-colors cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#4F46E5]"
              >
                Add to Basket ({activeVariant}) · {formatINR(product.price)}
              </button>
              <button
                type="button"
                onClick={() => onToggleWishlist(product.id)}
                aria-label="Toggle wishlist"
                className={`min-h-[44px] py-3 px-4 rounded-xl border inline-flex items-center gap-2 text-xs font-semibold transition-colors cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#4F46E5] ${
                  isWishlisted
                    ? 'bg-[#fff1f2] border-[#F43F5E]/30 text-[#BE123C]'
                    : 'bg-white border-slate-900/12 text-[#131b2e] hover:bg-[#faf8ff]'
                }`}
              >
                <Heart
                  className={`w-4 h-4 ${isWishlisted ? 'fill-current' : ''}`}
                  aria-hidden="true"
                />
                <span>{isWishlisted ? 'Saved' : 'Wishlist'}</span>
              </button>
            </div>

            {/* Cheaper Alternatives */}
            {cheaperAlternatives.length > 0 && (
              <div className="pt-4 border-t border-slate-900/[0.06]">
                <h3 className="text-xs font-semibold text-[#131b2e] mb-2.5">
                  Cheaper Alternatives to Consider
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  {cheaperAlternatives.slice(0, 2).map((alt) => (
                    <button
                      key={alt.id}
                      type="button"
                      onClick={() => onSelectProduct(alt)}
                      className="flex items-center gap-3 p-2.5 rounded-xl border border-slate-900/[0.07] hover:border-[#4F46E5]/30 hover:bg-[#faf8ff] text-left transition-colors cursor-pointer"
                    >
                      <img
                        src={alt.image}
                        alt={alt.name}
                        referrerPolicy="no-referrer"
                        className="w-11 h-11 rounded-lg object-cover shrink-0 bg-[#F8FAFC]"
                      />
                      <div className="min-w-0 flex-1">
                        <p className="text-xs font-semibold text-[#131b2e] truncate">
                          {alt.name}
                        </p>
                        <p className="text-[11px] font-metric text-[#047857] font-semibold">
                          {formatINR(alt.price)} · Save {formatINR(product.price - alt.price)}
                        </p>
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Similar Products */}
            {similarProducts.length > 0 && (
              <div className="pt-3 border-t border-slate-900/[0.06]">
                <h3 className="text-xs font-semibold text-[#131b2e] mb-2.5">
                  Similar Products
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                  {similarProducts.map((sim) => (
                    <button
                      key={sim.id}
                      type="button"
                      onClick={() => onSelectProduct(sim)}
                      className="p-2.5 rounded-xl border border-slate-900/[0.07] hover:border-[#4F46E5]/30 hover:bg-[#faf8ff] text-left transition-colors cursor-pointer"
                    >
                      <p className="text-xs font-semibold text-[#131b2e] truncate">
                        {sim.name}
                      </p>
                      <p className="text-[11px] font-metric text-[#464555] mt-0.5">
                        {formatINR(sim.price)} · {sim.rating.toFixed(1)}★
                      </p>
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
