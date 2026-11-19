import React, { useEffect } from 'react';
import {
  BarChart3,
  BookOpen,
  Compass,
  Home,
  ShoppingBasket,
  Sparkles,
  User,
  Wallet,
  X,
} from 'lucide-react';
import { PageId } from '../types/smartcart';
import { formatINR } from '../services/formatters';

interface SidebarProps {
  activePage: PageId;
  onNavigate: (page: PageId) => void;
  basketCount: number;
  budgetRemaining: number;
  isOverBudget: boolean;
  isMobileOpen: boolean;
  onCloseMobile: () => void;
}

const NAV_LINKS: Array<{
  id: PageId;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
}> = [
  { id: 'home', label: 'Home', icon: Home },
  { id: 'explore', label: 'Explore Products', icon: Compass },
  { id: 'recommended', label: 'Recommended for You', icon: Sparkles },
  { id: 'basket', label: 'My Shopping Basket', icon: ShoppingBasket },
  { id: 'planner', label: 'Budget Planner', icon: Wallet },
  { id: 'insights', label: 'Shopping Insights', icon: BarChart3 },
  { id: 'profile', label: 'My Profile', icon: User },
  { id: 'how-it-works', label: 'How SmartCart Works', icon: BookOpen },
];

export const Sidebar: React.FC<SidebarProps> = ({
  activePage,
  onNavigate,
  basketCount,
  budgetRemaining,
  isOverBudget,
  isMobileOpen,
  onCloseMobile,
}) => {
  useEffect(() => {
    if (!isMobileOpen) return;
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onCloseMobile();
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [isMobileOpen, onCloseMobile]);

  const handleSelect = (page: PageId) => {
    onNavigate(page);
    onCloseMobile();
  };

  const navContent = (
    <div className="flex flex-col h-full bg-white border-r border-slate-900/[0.06] px-4 py-6 overflow-y-auto">
      {/* Brand Lockup */}
      <div className="px-3 mb-7 flex items-center justify-between gap-2">
        <button
          type="button"
          onClick={() => handleSelect('home')}
          className="text-left cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#4F46E5] rounded-md"
        >
          <span className="font-display text-xl font-extrabold tracking-tight text-[#131b2e] block">
            SmartCart ML
          </span>
          <span className="text-xs text-[#464555] block mt-0.5">
            Shop Smarter. Spend Better.
          </span>
        </button>

        <button
          type="button"
          onClick={onCloseMobile}
          aria-label="Close navigation menu"
          className="lg:hidden min-w-[40px] min-h-[40px] flex items-center justify-center rounded-lg text-[#464555] hover:text-[#131b2e] hover:bg-[#f2f3ff] cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#4F46E5]"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      {/* Navigation Links */}
      <nav aria-label="Main navigation" className="flex-1 space-y-1">
        {NAV_LINKS.map((item) => {
          const Icon = item.icon;
          const isActive = activePage === item.id;
          return (
            <button
              key={item.id}
              type="button"
              onClick={() => handleSelect(item.id)}
              aria-current={isActive ? 'page' : undefined}
              className={`w-full min-h-[42px] flex items-center justify-between gap-3 px-3.5 py-2.5 text-sm rounded-xl transition-colors cursor-pointer whitespace-nowrap focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#4F46E5] ${
                isActive
                  ? 'bg-[#f2f3ff] text-[#3525cd] font-semibold'
                  : 'text-[#464555] hover:text-[#131b2e] hover:bg-[#faf8ff] font-medium'
              }`}
            >
              <span className="flex items-center gap-3 min-w-0">
                <Icon
                  className={`w-4 h-4 shrink-0 ${
                    isActive ? 'text-[#4F46E5]' : 'text-[#777587]'
                  }`}
                  aria-hidden="true"
                />
                <span className="truncate">{item.label}</span>
              </span>
              {item.id === 'basket' && basketCount > 0 && (
                <span
                  className={`font-metric text-xs px-2 py-0.5 rounded-full ${
                    isOverBudget
                      ? 'bg-[#fff1f2] text-[#BE123C]'
                      : 'bg-[#eaedff] text-[#3525cd]'
                  }`}
                >
                  {basketCount}
                </span>
              )}
            </button>
          );
        })}
      </nav>

      {/* Budget Quick Summary */}
      <div className="mt-6 pt-5 border-t border-slate-900/[0.06]">
        <button
          type="button"
          onClick={() => handleSelect('planner')}
          className="w-full text-left p-3.5 rounded-2xl bg-[#faf8ff] hover:bg-[#f2f3ff] border border-slate-900/[0.06] transition-colors cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#4F46E5]"
        >
          <p className="text-xs font-medium text-[#464555]">
            Your Remaining Budget
          </p>
          <p
            className={`font-metric text-lg font-bold mt-0.5 ${
              isOverBudget ? 'text-[#BE123C]' : 'text-[#047857]'
            }`}
          >
            {formatINR(budgetRemaining)}
          </p>
          <p className="text-[11px] text-[#3525cd] font-medium mt-1">
            Adjust in Budget Planner
          </p>
        </button>
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop Fixed Sidebar */}
      <aside className="hidden lg:block w-64 shrink-0 sticky top-0 h-screen">
        {navContent}
      </aside>

      {/* Mobile Slide-Over Drawer */}
      {isMobileOpen && (
        <div
          className="fixed inset-0 z-50 lg:hidden flex bg-[#131b2e]/40 backdrop-blur-xs"
          role="dialog"
          aria-modal="true"
          aria-label="Mobile navigation menu"
          onClick={onCloseMobile}
        >
          <div
            className="w-72 max-w-[85vw] h-full"
            onClick={(e) => e.stopPropagation()}
          >
            {navContent}
          </div>
        </div>
      )}
    </>
  );
};
