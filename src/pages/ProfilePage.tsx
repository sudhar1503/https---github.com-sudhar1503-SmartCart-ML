import React, { useEffect, useState } from 'react';
import { Check, Info, RotateCcw } from 'lucide-react';
import { PRODUCT_CATEGORIES } from '../data/catalog';
import {
  ProductCategory,
  SpendBracket,
  User,
  UserPreferences,
} from '../types/smartcart';
import { productService } from '../services/productService';
import { formatINR } from '../services/formatters';

interface ProfilePageProps {
  user: User;
  preferences: UserPreferences;
  onUpdateUser: (user: User) => void;
  onUpdatePreferences: (prefs: UserPreferences) => void;
  onResetDemoData: () => void;
}

const SPEND_BRACKETS: SpendBracket[] = [
  '₹500–₹1,000',
  '₹1,000–₹3,000',
  '₹3,000–₹5,000',
  'Above ₹5,000',
];

const INTEREST_OPTIONS = [
  'Home Office Setup',
  'Daily Audio',
  'Minimalist Living',
  'Travel & Commute',
  'Fitness & Wellness',
  'Gifting & Books',
];

export const ProfilePage: React.FC<ProfilePageProps> = ({
  user,
  preferences,
  onUpdateUser,
  onUpdatePreferences,
  onResetDemoData,
}) => {
  const [draftUser, setDraftUser] = useState<User>(user);
  const [draftPrefs, setDraftPrefs] = useState<UserPreferences>(preferences);
  const [savedBanner, setSavedBanner] = useState(false);

  useEffect(() => {
    setDraftUser(user);
  }, [user]);

  useEffect(() => {
    setDraftPrefs(preferences);
  }, [preferences]);

  const allBrands = productService.getAllBrands();

  const toggleCategory = (cat: ProductCategory) => {
    setDraftPrefs((prev) => {
      const exists = prev.favoriteCategories.includes(cat);
      return {
        ...prev,
        favoriteCategories: exists
          ? prev.favoriteCategories.filter((c) => c !== cat)
          : [...prev.favoriteCategories, cat],
      };
    });
  };

  const toggleBrand = (brand: string) => {
    setDraftPrefs((prev) => {
      const exists = prev.preferredBrands.includes(brand);
      return {
        ...prev,
        preferredBrands: exists
          ? prev.preferredBrands.filter((b) => b !== brand)
          : [...prev.preferredBrands, brand],
      };
    });
  };

  const toggleInterest = (interest: string) => {
    setDraftPrefs((prev) => {
      const exists = prev.shoppingInterests.includes(interest);
      return {
        ...prev,
        shoppingInterests: exists
          ? prev.shoppingInterests.filter((i) => i !== interest)
          : [...prev.shoppingInterests, interest],
      };
    });
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    const initials = draftUser.name
      .split(' ')
      .filter(Boolean)
      .slice(0, 2)
      .map((s) => s[0].toUpperCase())
      .join('') || 'SC';

    onUpdateUser({ ...draftUser, avatarInitials: initials });
    onUpdatePreferences(draftPrefs);
    setSavedBanner(true);
    window.setTimeout(() => setSavedBanner(false), 2500);
  };

  return (
    <div className="space-y-8">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="font-display text-3xl font-bold text-[#131b2e] tracking-tight">
            My Profile & Preferences
          </h1>
          <p className="text-sm sm:text-base text-[#464555] mt-1">
            Tell us what you usually shop for so your product suggestions stay relevant.
          </p>
        </div>

        <button
          type="button"
          onClick={onResetDemoData}
          className="inline-flex items-center gap-1.5 min-h-[40px] px-3.5 py-2 text-xs font-semibold text-[#464555] hover:text-[#BE123C] bg-white border border-slate-900/12 rounded-lg transition-colors cursor-pointer"
        >
          <RotateCcw className="w-3.5 h-3.5" aria-hidden="true" />
          <span>Reset Demo Storage</span>
        </button>
      </div>

      {/* Browser Demo Storage Distinction */}
      <div className="bg-[#f2f3ff] border border-[#4F46E5]/15 rounded-2xl p-4 flex items-start gap-3 text-xs text-[#464555]">
        <Info className="w-4 h-4 text-[#4F46E5] shrink-0 mt-0.5" aria-hidden="true" />
        <p>
          <strong className="text-[#131b2e]">Demo Persistence Notice:</strong>{' '}
          Your profile and preferences are stored locally in your browser (localStorage) for this demonstration rather than a permanent user account database.
        </p>
      </div>

      <form onSubmit={handleSave} className="space-y-6">
        {/* Profile Card */}
        <section className="bg-white rounded-3xl border border-slate-900/[0.06] p-6 shadow-[0_4px_16px_-4px_rgba(15,23,42,0.04)]">
          <h2 className="font-display text-lg font-bold text-[#131b2e] mb-4">
            Account Overview (Demo)
          </h2>

          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-5">
            <div className="w-16 h-16 rounded-full bg-[#eaedff] text-[#3525cd] font-display text-xl font-bold flex items-center justify-center shrink-0">
              {draftUser.avatarInitials}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 flex-1 w-full">
              <div>
                <label htmlFor="profile-name" className="block text-xs font-medium text-[#464555] mb-1">
                  Name
                </label>
                <input
                  id="profile-name"
                  type="text"
                  value={draftUser.name}
                  onChange={(e) => setDraftUser({ ...draftUser, name: e.target.value })}
                  className="w-full h-10 px-3 text-sm bg-white border border-[#CBD5E1] rounded-lg focus:outline-none focus:border-[#4F46E5]"
                />
              </div>
              <div>
                <label htmlFor="profile-email" className="block text-xs font-medium text-[#464555] mb-1">
                  Email Address (Demo)
                </label>
                <input
                  id="profile-email"
                  type="email"
                  value={draftUser.email}
                  onChange={(e) => setDraftUser({ ...draftUser, email: e.target.value })}
                  className="w-full h-10 px-3 text-sm bg-white border border-[#CBD5E1] rounded-lg focus:outline-none focus:border-[#4F46E5]"
                />
              </div>
              <div>
                <label htmlFor="profile-city" className="block text-xs font-medium text-[#464555] mb-1">
                  City
                </label>
                <input
                  id="profile-city"
                  type="text"
                  value={draftUser.city}
                  onChange={(e) => setDraftUser({ ...draftUser, city: e.target.value })}
                  className="w-full h-10 px-3 text-sm bg-white border border-[#CBD5E1] rounded-lg focus:outline-none focus:border-[#4F46E5]"
                />
              </div>
            </div>
          </div>
        </section>

        {/* Shopping Preferences */}
        <section className="bg-white rounded-3xl border border-slate-900/[0.06] p-6 space-y-6 shadow-[0_4px_16px_-4px_rgba(15,23,42,0.04)]">
          <div>
            <h2 className="font-display text-lg font-bold text-[#131b2e]">
              What do you usually shop for?
            </h2>
            <p className="text-xs text-[#464555] mt-0.5">
              Select your favorite product categories.
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5 mt-3">
              {PRODUCT_CATEGORIES.map((category) => {
                const checked = draftPrefs.favoriteCategories.includes(category);
                return (
                  <label
                    key={category}
                    className={`flex items-center gap-2.5 p-3 rounded-xl border text-xs font-medium cursor-pointer transition-colors ${
                      checked
                        ? 'border-[#4F46E5] bg-[#f2f3ff] text-[#3525cd]'
                        : 'border-slate-900/10 bg-white text-[#131b2e]'
                    }`}
                  >
                    <input
                      type="checkbox"
                      checked={checked}
                      onChange={() => toggleCategory(category)}
                      className="accent-[#4F46E5] w-4 h-4"
                    />
                    <span>{category}</span>
                  </label>
                );
              })}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4 border-t border-slate-900/[0.06]">
            {/* Typical Spend Bracket */}
            <div>
              <h3 className="text-sm font-bold text-[#131b2e] mb-2">
                How much do you usually spend?
              </h3>
              <div className="grid grid-cols-2 gap-2">
                {SPEND_BRACKETS.map((bracket) => (
                  <button
                    key={bracket}
                    type="button"
                    onClick={() =>
                      setDraftPrefs({ ...draftPrefs, preferredSpendBracket: bracket })
                    }
                    className={`min-h-[40px] py-2.5 px-3 text-xs font-metric font-semibold rounded-xl border transition-colors cursor-pointer ${
                      draftPrefs.preferredSpendBracket === bracket
                        ? 'bg-[#4F46E5] text-white border-[#4F46E5]'
                        : 'bg-white text-[#131b2e] border-slate-900/12 hover:bg-[#faf8ff]'
                    }`}
                  >
                    {bracket}
                  </button>
                ))}
              </div>
            </div>

            {/* Maximum Budget & Rating */}
            <div className="space-y-4">
              <div>
                <div className="flex justify-between text-xs mb-1.5">
                  <label htmlFor="pref-max-budget" className="font-semibold text-[#131b2e]">
                    Preferred Maximum Shopping Budget
                  </label>
                  <span className="font-metric font-bold text-[#3525cd]">
                    {formatINR(draftPrefs.maxShoppingBudget)}
                  </span>
                </div>
                <input
                  id="pref-max-budget"
                  type="range"
                  min={1000}
                  max={15000}
                  step={500}
                  value={draftPrefs.maxShoppingBudget}
                  onChange={(e) =>
                    setDraftPrefs({
                      ...draftPrefs,
                      maxShoppingBudget: Number(e.target.value),
                    })
                  }
                  className="w-full smartcart-slider"
                />
              </div>

              <div>
                <div className="flex justify-between text-xs mb-1.5">
                  <label htmlFor="pref-min-rating" className="font-semibold text-[#131b2e]">
                    Preferred Minimum Star Rating
                  </label>
                  <span className="font-metric font-bold text-[#131b2e]">
                    {draftPrefs.minPreferredRating.toFixed(1)}★
                  </span>
                </div>
                <input
                  id="pref-min-rating"
                  type="range"
                  min={3.5}
                  max={4.8}
                  step={0.1}
                  value={draftPrefs.minPreferredRating}
                  onChange={(e) =>
                    setDraftPrefs({
                      ...draftPrefs,
                      minPreferredRating: Number(e.target.value),
                    })
                  }
                  className="w-full smartcart-slider"
                />
              </div>
            </div>
          </div>

          {/* Preferred Brands & Shopping Interests */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4 border-t border-slate-900/[0.06]">
            <div>
              <h3 className="text-sm font-bold text-[#131b2e] mb-2">
                Preferred Brands
              </h3>
              <div className="flex flex-wrap gap-2">
                {allBrands.map((brand) => {
                  const active = draftPrefs.preferredBrands.includes(brand);
                  return (
                    <button
                      key={brand}
                      type="button"
                      onClick={() => toggleBrand(brand)}
                      className={`min-h-[40px] px-3 py-2 text-xs font-medium rounded-lg border transition-colors cursor-pointer ${
                        active
                          ? 'bg-[#f2f3ff] border-[#4F46E5] text-[#3525cd] font-semibold'
                          : 'bg-white border-slate-900/12 text-[#464555]'
                      }`}
                    >
                      {brand}
                    </button>
                  );
                })}
              </div>
            </div>

            <div>
              <h3 className="text-sm font-bold text-[#131b2e] mb-2">
                Shopping Interests
              </h3>
              <div className="flex flex-wrap gap-2">
                {INTEREST_OPTIONS.map((interest) => {
                  const active = draftPrefs.shoppingInterests.includes(interest);
                  return (
                    <button
                      key={interest}
                      type="button"
                      onClick={() => toggleInterest(interest)}
                      className={`min-h-[40px] px-3 py-2 text-xs font-medium rounded-lg border transition-colors cursor-pointer ${
                        active
                          ? 'bg-[#f2f3ff] border-[#4F46E5] text-[#3525cd] font-semibold'
                          : 'bg-white border-slate-900/12 text-[#464555]'
                      }`}
                    >
                      {interest}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          <div className="flex flex-wrap items-center justify-between gap-4 pt-4 border-t border-slate-900/[0.06]">
            <button
              type="submit"
              className="px-6 py-3 text-sm font-semibold text-white bg-[#4F46E5] hover:bg-[#3525cd] rounded-xl transition-colors cursor-pointer"
            >
              Save Preferences & Update Suggestions
            </button>

            {savedBanner && (
              <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#047857]">
                <Check className="w-4 h-4" aria-hidden="true" />
                <span>Preferences saved in your browser!</span>
              </span>
            )}
          </div>
        </section>
      </form>
    </div>
  );
};
