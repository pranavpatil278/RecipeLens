import React, { useState } from 'react';
import { Camera, Menu, X, Bookmark, ChefHat } from 'lucide-react';
import { Recipe } from '../types';

interface HeaderProps {
  onScanClick: () => void;
  onAskChef: () => void;
  savedRecipes: Recipe[];
  onSelectSavedRecipe: (recipe: Recipe) => void;
}

export const Header: React.FC<HeaderProps> = ({ onScanClick, onAskChef, savedRecipes, onSelectSavedRecipe }) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <header className="w-full bg-black/30 backdrop-blur-md border-b border-white/10 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
        {/* Brand Logo */}
        <a href="#home" className="flex items-center gap-2.5 cursor-pointer no-underline">
          <div className="w-9 h-9 rounded-full bg-white/10 flex items-center justify-center text-white">
            <Camera className="w-5 h-5 text-white" />
          </div>
          <div className="flex flex-col">
            <span className="font-serif font-bold text-lg tracking-wider text-white">
              RecipeLens
            </span>
            <span className="text-[9px] tracking-widest uppercase text-white/70 font-semibold">
              Your Camera Becomes Your AI Chef
            </span>
          </div>
        </a>

        {/* Center Nav Links (Desktop) */}
        <nav aria-label="Main Navigation" className="hidden md:flex items-center gap-8 text-xs font-semibold uppercase tracking-wider text-white/80">
          <a
            href="#home"
            className="flex flex-col items-center gap-1 text-white transition-colors"
          >
            <span>Home</span>
            <div className="w-6 h-0.5 bg-white rounded-full" />
          </a>

          <a href="#discover" className="hover:text-white transition-colors">
            Discover
          </a>

          <a href="#how-it-works" className="hover:text-white transition-colors">
            How It Works
          </a>

          <a href="#features" className="hover:text-white transition-colors">
            Features
          </a>

          <a href="#recipes" className="hover:text-white transition-colors">
            Recipes
          </a>
        </nav>

        {/* Right CTA and Menu Button */}
        <div className="flex items-center gap-3">
          {/* Ask AI Chef Primary Action */}
          <button
            type="button"
            onClick={onAskChef}
            className="hidden sm:flex items-center gap-2 bg-[#263A20] hover:bg-[#1C2C17] text-white px-5 py-2.5 rounded-full shadow-xs transition-colors duration-300 cursor-pointer text-xs font-medium"
            aria-label="Ask AI Chef button"
          >
            <span>Ask AI Chef</span>
          </button>

          {/* Menu / Hamburger button */}
          <button
            type="button"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="w-10 h-10 rounded-full border border-white/25 flex items-center justify-center text-white hover:bg-white/10 transition-colors cursor-pointer"
            aria-label="Toggle navigation menu"
          >
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {mobileMenuOpen && (
        <div className="absolute right-4 top-[calc(100%-0.5rem)] z-50 w-[min(22rem,calc(100vw-2rem))] rounded-2xl border border-white/15 bg-[#172112]/95 p-4 text-white shadow-2xl backdrop-blur-md">
          <div className="flex items-center justify-between border-b border-white/10 pb-3">
            <div className="flex items-center gap-2 text-sm font-semibold">
              <Bookmark className="h-4 w-4 text-[#A3B89D]" />
              Bookmarked Recipes
            </div>
            <span className="text-[11px] text-white/55">{savedRecipes.length}</span>
          </div>
          {savedRecipes.length === 0 ? (
            <p className="py-5 text-xs leading-relaxed text-white/65">
              Bookmark a recipe to keep it here for quick access.
            </p>
          ) : (
            <div className="max-h-72 space-y-2 overflow-y-auto pt-3">
              {savedRecipes.map((recipe) => (
                <button
                  key={recipe.recipeId}
                  type="button"
                  onClick={() => {
                    onSelectSavedRecipe(recipe);
                    setMobileMenuOpen(false);
                  }}
                  className="flex w-full items-center gap-3 rounded-xl border border-white/10 bg-white/5 p-3 text-left transition-colors hover:bg-white/10"
                >
                  <ChefHat className="h-4 w-4 shrink-0 text-[#A3B89D]" />
                  <span className="min-w-0">
                    <span className="block truncate text-xs font-semibold">{recipe.title}</span>
                    <span className="block pt-0.5 text-[10px] text-white/55">{recipe.cuisine}</span>
                  </span>
                </button>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Mobile navigation drawer */}
      {mobileMenuOpen && (
        <div className="md:hidden bg-black/50 backdrop-blur-md border-b border-white/10 px-6 py-6 space-y-4 animate-in fade-in duration-200">
          <div className="flex flex-col gap-3 text-sm font-medium text-white">
            <a
              href="#home"
              onClick={() => setMobileMenuOpen(false)}
              className="flex items-center justify-between py-2 border-b border-white/10"
            >
              <span>Home</span>
              <div className="w-2 h-2 rounded-full bg-white" />
            </a>
            <a
              href="#discover"
              onClick={() => setMobileMenuOpen(false)}
              className="py-2 border-b border-white/10"
            >
              Discover Recipes
            </a>
            <a
              href="#how-it-works"
              onClick={() => setMobileMenuOpen(false)}
              className="py-2 border-b border-white/10"
            >
              How It Works
            </a>
            <a
              href="#features"
              onClick={() => setMobileMenuOpen(false)}
              className="py-2 border-b border-white/10"
            >
              AI Features
            </a>
            <a
              href="#recipes"
              onClick={() => setMobileMenuOpen(false)}
              className="py-2 border-b border-white/10"
            >
              Signature Recipes
            </a>
          </div>
          <div className="pt-2">
            <button
              type="button"
              onClick={() => {
                setMobileMenuOpen(false);
                onAskChef();
              }}
              className="w-full flex items-center justify-center gap-2 bg-[#263A20] text-white py-3 rounded-full text-xs font-medium shadow-xs"
            >
              <span>Ask AI Chef</span>
              <Camera className="w-4 h-4 text-[#A3B89D]" />
            </button>
          </div>
        </div>
      )}
    </header>
  );
};
