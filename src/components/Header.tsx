import React from 'react';
import { Menu, Search, ShoppingBasket, Wallet } from 'lucide-react';
import { Budget, PageId, User } from '../types/smartcart';
import { formatINR } from '../services/formatters';

interface HeaderProps {
  activePage: PageId;
  searchQuery: string;
  onSearchChange: (q: string) => void;
  onSearchSubmit: () => void;
  budget: Budget;
  basketCount: number;
  user: User;
  onNavigate: (page: PageId) => void;
  onOpenMobileMenu: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  activePage,
  searchQuery,
  onSearchChange,
  onSearchSubmit,
  budget,
  basketCount,
  user,
  onNavigate,
  onOpenMobileMenu,
}) => {
  const showSearch =
    activePage === 'home' ||
    activePage === 'explore' ||
    activePage === 'recommended';
  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSearchSubmit();
  };

  return (
    <header className="sticky top-0 z-30 bg-white/95 backdrop-blur-md border-b border-slate-900/[0.06]">
      <div className="px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-2.5 sm:gap-5">
        {/* Mobile Menu Trigger + Compact Brand */}
        <div className="flex items-center gap-2 lg:hidden shrink-0">
          <button
            type="button"
            onClick={onOpenMobileMenu}
            aria-label="Open navigation menu"
            className="min-w-[40px] min-h-[40px] flex items-center justify-center -ml-1 rounded-lg text-[#131b2e] hover:bg-[#f2f3ff] cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#4F46E5]"
          >
            <Menu className="w-5 h-5" />
          </button>
          <button
            type="button"
            onClick={() => onNavigate('home')}
            className="font-display text-base font-extrabold text-[#131b2e] whitespace-nowrap cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#4F46E5] rounded"
          >
            SmartCart ML
          </button>
        </div>

        {/* Global Search Bar (Desktop & Tablet) */}
        {showSearch && (
        <form
          onSubmit={handleFormSubmit}
          className="hidden sm:flex flex-1 max-w-xl relative"
        >
          <Search
            className="w-4 h-4 text-[#777587] absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none"
            aria-hidden="true"
          />
          <input
            type="search"
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder="Search for products, brands or categories..."
            aria-label="Search for products, brands or categories"
            className="w-full h-10 pl-10 pr-20 text-sm bg-[#faf8ff] border border-[#CBD5E1] rounded-lg placeholder:text-[#777587] focus:outline-none focus:bg-white focus:border-[#4F46E5] focus:ring-3 focus:ring-[#4F46E5]/15"
          />
          <button
            type="submit"
            className="absolute right-1.5 top-1/2 -translate-y-1/2 px-3 py-1 text-xs font-semibold text-[#3525cd] hover:bg-[#eaedff] rounded-md transition-colors cursor-pointer"
          >
            Search
          </button>
        </form>
        )}

        {/* Right Controls: Budget Indicator, Basket Button, Profile */}
        <div className="flex items-center gap-2 sm:gap-3 shrink-0 ml-auto">
          {/* Compact Mobile Search Button */}
          {showSearch && (
          <button
            type="button"
            onClick={() => onNavigate('explore')}
            aria-label="Search products"
            className="sm:hidden min-w-[40px] min-h-[40px] flex items-center justify-center rounded-lg text-[#464555] hover:bg-[#f2f3ff] cursor-pointer"
          >
            <Search className="w-4 h-4" />
          </button>
          )}

          {/* Budget Indicator (Visible on all breakpoints cleanly) */}
          <button
            type="button"
            onClick={() => onNavigate('planner')}
            title="Open Budget Planner"
            className={`inline-flex items-center gap-1.5 px-2.5 sm:px-3 min-h-[40px] text-xs font-medium rounded-lg border transition-colors whitespace-nowrap shrink-0 cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#4F46E5] ${
              budget.status === 'over'
                ? 'bg-[#fff1f2] border-[#F43F5E]/25 text-[#BE123C]'
                : budget.status === 'approaching'
                ? 'bg-[#fff7ed] border-[#f97316]/25 text-[#c2410c]'
                : 'bg-[#ecfdf5] border-[#10B981]/25 text-[#047857]'
            }`}
          >
            <Wallet className="w-3.5 h-3.5 shrink-0" aria-hidden="true" />
            <span className="font-metric font-semibold">
              {budget.status === 'over'
                ? `Over ${formatINR(budget.overAmount)}`
                : `Left ${formatINR(budget.remaining)}`}
            </span>
          </button>

          {/* Basket Action */}
          <button
            type="button"
            onClick={() => onNavigate('basket')}
            aria-label={`Open My Shopping Basket (${basketCount} items)`}
            className={`inline-flex items-center gap-2 px-3 sm:px-3.5 min-h-[40px] text-xs sm:text-sm font-semibold rounded-lg whitespace-nowrap shrink-0 transition-colors cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-[#4F46E5] ${
              budget.status === 'over'
                ? 'bg-[#BE123C] hover:bg-[#95002b] text-white'
                : 'bg-[#4F46E5] hover:bg-[#3525cd] text-white'
            }`}
          >
            <ShoppingBasket className="w-4 h-4 shrink-0" aria-hidden="true" />
            <span className="hidden sm:inline">Basket</span>
            <span className="font-metric text-xs px-1.5 py-0.5 rounded bg-white/15">
              {basketCount}
            </span>
          </button>

          {/* Profile Avatar Menu */}
          <button
            type="button"
            onClick={() => onNavigate('profile')}
            aria-label="Open My Profile and Preferences"
            title={`${user.name} — My Profile`}
            className="w-10 h-10 rounded-full bg-[#eaedff] hover:bg-[#dad7ff] text-[#3525cd] font-display text-xs font-bold flex items-center justify-center border border-[#4F46E5]/15 transition-colors shrink-0 cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#4F46E5]"
          >
            {user.avatarInitials}
          </button>
        </div>
      </div>
    </header>
  );
};
