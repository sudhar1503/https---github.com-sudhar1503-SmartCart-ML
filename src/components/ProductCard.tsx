import React, { useState } from 'react';
import {
  Check,
  Heart,
  Minus,
  Package,
  Plus,
  Star,
} from 'lucide-react';
import { Product } from '../types/smartcart';
import { formatINR } from '../services/formatters';

interface ProductCardProps {
  product: Product;
  quantityInBasket: number;
  activeVariantInBasket?: string;
  isWishlisted: boolean;
  isCompared?: boolean;
  label?: string;
  recommendationReason?: string;
  matchPercentage?: number;
  onAddToBasket: (product: Product, variant?: string) => void;
  onIncrement: (productId: string, variant: string) => void;
  onDecrement: (productId: string, variant: string) => void;
  onViewDetails: (product: Product) => void;
  onToggleWishlist: (productId: string) => void;
  onToggleCompare?: (productId: string) => void;
}

export const ProductCard: React.FC<ProductCardProps> = ({
  product,
  quantityInBasket,
  activeVariantInBasket,
  isWishlisted,
  isCompared = false,
  label,
  recommendationReason,
  matchPercentage,
  onAddToBasket,
  onIncrement,
  onDecrement,
  onViewDetails,
  onToggleWishlist,
  onToggleCompare,
}) => {
  const [imgError, setImgError] = useState(false);
  const savings = Math.max(0, product.originalPrice - product.price);
  const targetVariant = activeVariantInBasket || product.variants[0];

  return (
    <article className="group bg-white rounded-2xl border border-slate-900/[0.07] p-4 flex flex-col justify-between shadow-[0_4px_16px_-4px_rgba(15,23,42,0.04)] hover:shadow-[0_12px_28px_-6px_rgba(79,70,229,0.09)] hover:border-[#4F46E5]/25 transition-all duration-200">
      <div>
        {/* Image Container + Wishlist Heart */}
        <div className="relative mb-3.5">
          <button
            type="button"
            onClick={() => onViewDetails(product)}
            className="w-full aspect-[4/3] rounded-xl bg-[#F8FAFC] overflow-hidden block cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#4F46E5]"
            aria-label={`View details for ${product.name}`}
          >
            {!imgError ? (
              <img
                src={product.image}
                alt={product.name}
                referrerPolicy="no-referrer"
                onError={() => setImgError(true)}
                className="w-full h-full object-cover transition-transform duration-300 ease-out group-hover:scale-[1.03]"
              />
            ) : (
              <div className="w-full h-full bg-[#f2f3ff] flex flex-col items-center justify-center p-4 text-center">
                <Package className="w-8 h-8 text-[#4F46E5]/60 mb-2" aria-hidden="true" />
                <span className="text-xs font-medium text-[#464555]">{product.name}</span>
              </div>
            )}
          </button>

          <button
            type="button"
            onClick={() => onToggleWishlist(product.id)}
            aria-label={isWishlisted ? `Remove ${product.name} from wishlist` : `Save ${product.name} to wishlist`}
            className={`absolute top-2.5 right-2.5 w-9 h-9 rounded-full flex items-center justify-center backdrop-blur-sm border transition-colors cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#4F46E5] ${
              isWishlisted
                ? 'bg-[#fff1f2] border-[#F43F5E]/30 text-[#BE123C]'
                : 'bg-white/90 border-slate-900/10 text-[#464555] hover:text-[#BE123C]'
            }`}
          >
            <Heart
              className={`w-4 h-4 ${isWishlisted ? 'fill-current' : ''}`}
              aria-hidden="true"
            />
          </button>
        </div>

        {/* Brand & Clean Single Status Text */}
        <div className="flex items-center justify-between gap-2 text-xs mb-1">
          <span className="text-[#464555] font-medium truncate">
            {product.brand} · {product.category}
          </span>
          {label && (
            <span
              className={`font-semibold whitespace-nowrap shrink-0 ${
                label === 'Fits Your Budget' || label === 'Good Value'
                  ? 'text-[#047857]'
                  : 'text-[#3525cd]'
              }`}
            >
              {label}
            </span>
          )}
        </div>

        {/* Product Name */}
        <button
          type="button"
          onClick={() => onViewDetails(product)}
          className="text-left w-full cursor-pointer focus-visible:outline-none focus-visible:underline"
        >
          <h3 className="font-display text-base font-semibold text-[#131b2e] leading-snug group-hover:text-[#3525cd] transition-colors line-clamp-2">
            {product.name}
          </h3>
        </button>

        {/* Sample Rating + Demo Match Percentage */}
        <div className="flex items-center justify-between gap-2 mt-1.5 text-xs">
          <span
            className="inline-flex items-center gap-1 text-[#131b2e] font-medium"
            title="Sample catalogue rating"
          >
            <Star className="w-3.5 h-3.5 text-amber-500 fill-amber-500" aria-hidden="true" />
            <span className="font-metric font-semibold">{product.rating.toFixed(1)}</span>
            <span className="text-[#777587]">({product.reviewCount} sample)</span>
          </span>
          {typeof matchPercentage === 'number' && (
            <span className="font-metric font-semibold text-[#3525cd]">
              Demo match: {matchPercentage}%
            </span>
          )}
        </div>

        {/* Short Description */}
        <p className="text-xs text-[#464555] mt-2 line-clamp-2 leading-relaxed">
          {product.shortDescription}
        </p>

        {/* Why We Suggested This */}
        {recommendationReason && (
          <p className="mt-2.5 text-xs text-[#3525cd] bg-[#f2f3ff] rounded-lg px-2.5 py-1.5 leading-snug">
            <span className="font-semibold">Why we suggested this: </span>
            {recommendationReason}
          </p>
        )}
      </div>

      {/* Price & Actions Footer */}
      <div className="mt-4 pt-3.5 border-t border-slate-900/[0.06] space-y-3">
        <div className="flex items-baseline justify-between gap-2">
          <div className="flex items-baseline gap-2">
            <span className="font-metric text-lg font-bold text-[#131b2e]">
              {formatINR(product.price)}
            </span>
            {product.originalPrice > product.price && (
              <span className="font-metric text-xs text-[#777587] line-through">
                {formatINR(product.originalPrice)}
              </span>
            )}
          </div>
          {savings > 0 && (
            <span className="font-metric text-xs font-semibold text-[#047857]">
              Save {formatINR(savings)}
            </span>
          )}
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-2">
          {quantityInBasket === 0 ? (
            <button
              type="button"
              onClick={() => onAddToBasket(product, targetVariant)}
              className="flex-1 min-h-[38px] py-2 px-3 text-xs font-semibold text-white bg-[#4F46E5] hover:bg-[#3525cd] rounded-lg transition-colors whitespace-nowrap cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#4F46E5]"
            >
              Add to Basket
            </button>
          ) : (
            <div className="flex-1 min-h-[38px] inline-flex items-center justify-between bg-[#f2f3ff] border border-[#4F46E5]/20 rounded-lg p-0.5">
              <button
                type="button"
                onClick={() => onDecrement(product.id, targetVariant)}
                aria-label={`Remove one ${product.name} (${targetVariant})`}
                className="w-8 h-8 flex items-center justify-center rounded-md text-[#131b2e] hover:bg-white cursor-pointer"
              >
                <Minus className="w-3.5 h-3.5" />
              </button>
              <span className="font-metric text-xs font-bold text-[#3525cd] px-1">
                {quantityInBasket} in basket
              </span>
              <button
                type="button"
                onClick={() => onIncrement(product.id, targetVariant)}
                aria-label={`Add one more ${product.name} (${targetVariant})`}
                className="w-8 h-8 flex items-center justify-center rounded-md text-[#131b2e] hover:bg-white cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" />
              </button>
            </div>
          )}

          <button
            type="button"
            onClick={() => onViewDetails(product)}
            className="min-h-[38px] py-2 px-3 text-xs font-semibold text-[#131b2e] bg-white hover:bg-[#faf8ff] border border-slate-900/12 rounded-lg transition-colors whitespace-nowrap shrink-0 cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#4F46E5]"
          >
            View Details
          </button>
        </div>

        {/* Optional Compare Toggle */}
        {onToggleCompare && (
          <button
            type="button"
            onClick={() => onToggleCompare(product.id)}
            className={`w-full min-h-[34px] py-1.5 px-2.5 text-xs font-medium rounded-lg border inline-flex items-center justify-center gap-1.5 transition-colors cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#4F46E5] ${
              isCompared
                ? 'bg-[#f2f3ff] border-[#4F46E5]/30 text-[#3525cd]'
                : 'bg-transparent border-slate-900/[0.06] text-[#464555] hover:text-[#131b2e]'
            }`}
          >
            {isCompared && <Check className="w-3.5 h-3.5" aria-hidden="true" />}
            <span>{isCompared ? 'Added to Compare' : 'Compare Product'}</span>
          </button>
        )}
      </div>
    </article>
  );
};
