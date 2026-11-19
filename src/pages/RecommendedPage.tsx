import React from 'react';
import {
  Ban,
  Info,
  RotateCcw,
  Tag,
  ThumbsDown,
  ThumbsUp,
} from 'lucide-react';
import {
  Budget,
  FeedbackAction,
  Product,
  Recommendation,
} from '../types/smartcart';
import { RecommendationSections } from '../services/recommendationService';
import { formatINR } from '../services/formatters';
import { ProductCard } from '../components/ProductCard';

interface RecommendedPageProps {
  sections: RecommendationSections;
  budget: Budget;
  wishlistIds: string[];
  basketQuantities: Map<string, number>;
  primaryVariantByProductId: Map<string, string>;
  hasHiddenOrAvoided: boolean;
  onAddToBasket: (product: Product, variant?: string) => void;
  onIncrement: (productId: string, variant: string) => void;
  onDecrement: (productId: string, variant: string) => void;
  onViewDetails: (product: Product) => void;
  onToggleWishlist: (productId: string) => void;
  onFeedback: (product: Product, action: FeedbackAction) => void;
  onResetFeedback: () => void;
}

export const RecommendedPage: React.FC<RecommendedPageProps> = ({
  sections,
  budget,
  wishlistIds,
  basketQuantities,
  primaryVariantByProductId,
  hasHiddenOrAvoided,
  onAddToBasket,
  onIncrement,
  onDecrement,
  onViewDetails,
  onToggleWishlist,
  onFeedback,
  onResetFeedback,
}) => {
  const sectionConfigs: Array<{
    id: string;
    title: string;
    subtitle: string;
    items: Recommendation[];
  }> = [
    {
      id: 'best-matches',
      title: 'Best Matches for You',
      subtitle: 'Top demonstration picks ranked by your saved category preferences, brand preferences, and budget.',
      items: sections.bestMatches,
    },
    {
      id: 'within-budget',
      title: 'Best Products Within Your Budget',
      subtitle: `Every product here fits inside your remaining ${formatINR(budget.remaining)} budget.`,
      items: sections.withinBudget,
    },
    {
      id: 'similar-liked',
      title: 'Similar to Products You Like',
      subtitle: 'Matched by category and attributes to items in your wishlist, basket, or positive feedback.',
      items: sections.similarToLiked,
    },
    {
      id: 'top-rated-popular',
      title: 'Top-Rated Sample Picks',
      subtitle: 'Products with the highest sample catalog ratings across everyday categories.',
      items: sections.topRatedPopular,
    },
    {
      id: 'affordable-alts',
      title: 'Affordable Alternatives',
      subtitle: 'Lower-priced options with strong sample ratings and clear savings.',
      items: sections.affordableAlternatives,
    },
    {
      id: 'discover-new',
      title: 'Discover Something New',
      subtitle: 'Sample products outside your currently selected favorite categories.',
      items: sections.discoverNew,
    },
  ];

  return (
    <div className="space-y-9">
      {/* Header + Restore Trigger */}
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="font-display text-3xl font-bold text-[#131b2e] tracking-tight">
            Products Picked for You
          </h1>
          <p className="text-sm sm:text-base text-[#464555] mt-1">
            Discover products that match your interests and spending limit.
          </p>
        </div>

        {hasHiddenOrAvoided && (
          <button
            type="button"
            onClick={onResetFeedback}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-[#3525cd] bg-[#f2f3ff] hover:bg-[#eaedff] rounded-lg transition-colors cursor-pointer"
          >
            <RotateCcw className="w-3.5 h-3.5" aria-hidden="true" />
            <span>Restore Hidden Products</span>
          </button>
        )}
      </div>

      {/* Clear Demonstration Data Disclaimer */}
      <div className="bg-[#f2f3ff] border border-[#4F46E5]/15 rounded-2xl p-4 flex items-start gap-3 text-xs text-[#464555]">
        <Info className="w-4 h-4 text-[#4F46E5] shrink-0 mt-0.5" aria-hidden="true" />
        <p className="leading-relaxed">
          <strong className="text-[#131b2e]">Demonstration Suggestions (Frontend Preview):</strong>{' '}
          Match percentages and explanations shown here are calculated locally from your selected preferences, budget, and feedback buttons—not from a live trained model. When the Python backend is connected, this page will display server-generated recommendations.
        </p>
      </div>

      {/* 6 Structured Recommendation Sections */}
      {sectionConfigs.map((sec) => (
        <section key={sec.id} className="space-y-4">
          <div>
            <h2 className="font-display text-xl font-bold text-[#131b2e]">
              {sec.title}
            </h2>
            <p className="text-xs sm:text-sm text-[#464555] mt-0.5">
              {sec.subtitle}
            </p>
          </div>

          {sec.items.length === 0 ? (
            <div className="bg-white rounded-2xl border border-slate-900/[0.06] p-6 text-sm text-[#464555]">
              No products currently match this section under your remaining budget or hidden-item filters.
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
              {sec.items.map((rec) => (
                <div key={`${sec.id}-${rec.product.id}`} className="flex flex-col gap-2">
                  <ProductCard
                    product={rec.product}
                    quantityInBasket={basketQuantities.get(rec.product.id) ?? 0}
                    activeVariantInBasket={primaryVariantByProductId.get(rec.product.id)}
                    isWishlisted={wishlistIds.includes(rec.product.id)}
                    label={rec.badgeLabel}
                    recommendationReason={rec.explanation.summary}
                    matchPercentage={rec.suitabilityScore}
                    onAddToBasket={(p, v) => onAddToBasket(p, v)}
                    onIncrement={onIncrement}
                    onDecrement={onDecrement}
                    onViewDetails={onViewDetails}
                    onToggleWishlist={onToggleWishlist}
                  />

                  {/* Customer Preference Feedback Controls */}
                  <div className="grid grid-cols-2 gap-1.5 bg-white rounded-xl border border-slate-900/[0.06] p-1.5 text-[11px]">
                    <button
                      type="button"
                      onClick={() => onFeedback(rec.product, 'more-like-this')}
                      className="inline-flex items-center justify-center gap-1 py-1.5 px-2 rounded-lg text-[#464555] hover:text-[#3525cd] hover:bg-[#f2f3ff] transition-colors cursor-pointer"
                    >
                      <ThumbsUp className="w-3 h-3" aria-hidden="true" />
                      <span>More Like This</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => onFeedback(rec.product, 'find-cheaper')}
                      className="inline-flex items-center justify-center gap-1 py-1.5 px-2 rounded-lg text-[#464555] hover:text-[#047857] hover:bg-[#ecfdf5] transition-colors cursor-pointer"
                    >
                      <Tag className="w-3 h-3" aria-hidden="true" />
                      <span>Find Cheaper</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => onFeedback(rec.product, 'not-interested')}
                      className="inline-flex items-center justify-center gap-1 py-1.5 px-2 rounded-lg text-[#464555] hover:text-[#BE123C] hover:bg-[#fff1f2] transition-colors cursor-pointer"
                    >
                      <ThumbsDown className="w-3 h-3" aria-hidden="true" />
                      <span>Not Interested</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => onFeedback(rec.product, 'avoid-brand')}
                      className="inline-flex items-center justify-center gap-1 py-1.5 px-2 rounded-lg text-[#464555] hover:text-[#BE123C] hover:bg-[#fff1f2] transition-colors cursor-pointer"
                    >
                      <Ban className="w-3 h-3" aria-hidden="true" />
                      <span>Avoid Brand</span>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>
      ))}
    </div>
  );
};
