import React, { useState } from 'react';
import { ChevronDown, ChevronUp } from 'lucide-react';
import { PageId } from '../types/smartcart';

interface HowItWorksPageProps {
  onNavigate: (page: PageId) => void;
}

const FIVE_SIMPLE_STEPS = [
  {
    step: '01',
    title: 'You tell us what you like',
    description:
      'Pick your favorite categories, brands, and usual price range in My Profile, or interact with products you like.',
  },
  {
    step: '02',
    title: 'We understand your shopping preferences',
    description:
      'SmartCart keeps track of what you explore, save to your wishlist, or mark as "Not Interested".',
  },
  {
    step: '03',
    title: 'We find products that match your interests',
    description:
      'You receive clear, easy-to-read product suggestions along with simple reasons why each item may suit you.',
  },
  {
    step: '04',
    title: 'We check your budget',
    description:
      'Every product and basket update is checked against your rupee spending limit in real time.',
  },
  {
    step: '05',
    title: 'We help you build a suitable shopping basket',
    description:
      'Use "Find a Cheaper Alternative" or the Budget Planner to replace costly items and save money.',
  },
];

const TECHNICAL_CONCEPTS = [
  {
    name: 'Collaborative Filtering',
    plain: 'Suggestions Based on Similar Shoppers',
    detail:
      'Analyzes patterns across shoppers with overlapping product interactions to surface relevant items you have not explored yet.',
  },
  {
    name: 'Content-Based Filtering',
    plain: 'Suggestions Based on Your Interests',
    detail:
      'Compares product attributes such as category, brand, price tier, and features against your personal preference profile.',
  },
  {
    name: 'Hybrid Recommendations',
    plain: 'Smart Product Suggestions',
    detail:
      'Combines collaborative and content-based signals so new shoppers and returning shoppers both receive balanced suggestions.',
  },
  {
    name: 'K-Means Clustering',
    plain: 'Shopping Groups',
    detail:
      'Groups products or shopping profiles into natural segments (for example, budget-focused desk setups or fitness essentials).',
  },
  {
    name: 'Budget Optimization (0/1 Knapsack)',
    plain: 'Best Combination Within Your Budget',
    detail:
      'Selects a subset of products that maximizes overall suitability and value without exceeding your total rupee budget constraint.',
  },
  {
    name: 'Explainable AI',
    plain: 'Why This Product?',
    detail:
      'Translates underlying recommendation factors into transparent, human-readable reasons shown beside every suggested item.',
  },
];

export const HowItWorksPage: React.FC<HowItWorksPageProps> = ({ onNavigate }) => {
  const [techOpen, setTechOpen] = useState(false);

  return (
    <div className="space-y-8">
      <div>
        <h1 className="font-display text-3xl font-bold text-[#131b2e] tracking-tight">
          How SmartCart Works
        </h1>
        <p className="text-sm sm:text-base text-[#464555] mt-1 max-w-2xl">
          SmartCart ML handles complex budget and product matching behind the scenes so shopping feels effortless.
        </p>
      </div>

      {/* 5 Simple Steps */}
      <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {FIVE_SIMPLE_STEPS.map((item) => (
          <article
            key={item.step}
            className="bg-white rounded-3xl border border-slate-900/[0.06] p-6 shadow-[0_4px_16px_-4px_rgba(15,23,42,0.04)]"
          >
            <span className="font-metric text-xs font-bold text-[#3525cd]">
              Step {item.step}
            </span>
            <h2 className="font-display text-lg font-bold text-[#131b2e] mt-1.5">
              {item.title}
            </h2>
            <p className="text-sm text-[#464555] mt-2 leading-relaxed">
              {item.description}
            </p>
          </article>
        ))}

        {/* Quick Start Card */}
        <article className="bg-[#f2f3ff] rounded-3xl border border-[#4F46E5]/15 p-6 flex flex-col justify-between">
          <div>
            <h2 className="font-display text-lg font-bold text-[#131b2e]">
              Ready to try it out?
            </h2>
            <p className="text-sm text-[#464555] mt-2 leading-relaxed">
              Set your budget in the planner or explore products tailored to your interests.
            </p>
          </div>
          <div className="flex flex-wrap gap-2 mt-5">
            <button
              type="button"
              onClick={() => onNavigate('planner')}
              className="min-h-[40px] px-4 py-2.5 text-xs font-semibold text-white bg-[#4F46E5] hover:bg-[#3525cd] rounded-lg cursor-pointer"
            >
              Open Budget Planner
            </button>
            <button
              type="button"
              onClick={() => onNavigate('recommended')}
              className="min-h-[40px] px-4 py-2.5 text-xs font-semibold text-[#3525cd] bg-white hover:bg-[#faf8ff] rounded-lg cursor-pointer"
            >
              View Recommendations
            </button>
          </div>
        </article>
      </section>

      {/* Expandable Behind the Technology Section */}
      <section className="bg-white rounded-3xl border border-slate-900/[0.06] overflow-hidden shadow-[0_4px_16px_-4px_rgba(15,23,42,0.04)]">
        <button
          type="button"
          onClick={() => setTechOpen((prev) => !prev)}
          aria-expanded={techOpen}
          className="w-full px-6 py-5 flex items-center justify-between text-left hover:bg-[#faf8ff] transition-colors cursor-pointer"
        >
          <div>
            <h2 className="font-display text-lg font-bold text-[#131b2e]">
              Behind the Technology
            </h2>
            <p className="text-xs text-[#464555] mt-0.5">
              Academic overview of the Python ML architecture this frontend is designed to connect with.
            </p>
          </div>
          {techOpen ? (
            <ChevronUp className="w-5 h-5 text-[#464555]" />
          ) : (
            <ChevronDown className="w-5 h-5 text-[#464555]" />
          )}
        </button>

        {techOpen && (
          <div className="px-6 pb-6 pt-3 border-t border-slate-900/[0.06] space-y-4">
            <p className="text-xs text-[#464555] leading-relaxed">
              Note: While this browser preview uses local demonstration logic and sample ratings, the service layer is structured to integrate directly with a Python backend implementing these techniques:
            </p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {TECHNICAL_CONCEPTS.map((concept) => (
                <div
                  key={concept.name}
                  className="p-4 rounded-2xl bg-[#faf8ff] border border-slate-900/[0.06]"
                >
                  <p className="text-xs font-semibold text-[#3525cd]">
                    Customer view: {concept.plain}
                  </p>
                  <h3 className="font-display text-base font-bold text-[#131b2e] mt-0.5">
                    {concept.name}
                  </h3>
                  <p className="text-xs text-[#464555] mt-1.5 leading-relaxed">
                    {concept.detail}
                  </p>
                </div>
              ))}
            </div>
          </div>
        )}
      </section>
    </div>
  );
};
