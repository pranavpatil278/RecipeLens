import React from 'react';
import { ChefHat, ArrowRight, Sparkles, Clock, UtensilsCrossed } from 'lucide-react';
import { ImagePlaceholder } from './ImagePlaceholder';
import { mockDiscoveryRecipes } from '../data/mockData';
import { IngredientRecipeFinder } from './IngredientRecipeFinder';

interface FavoritesSectionProps {
  onSelectRecipe: (title: string) => void;
}

export const FavoritesSection: React.FC<FavoritesSectionProps> = ({ onSelectRecipe }) => {
  return (
    <section id="discover" className="w-full bg-transparent py-12 sm:py-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
        {/* Section Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-6">
          <div>
            {/* Eyebrow */}
            <div className="flex items-center gap-2 mb-2">
              <Sparkles className="w-4 h-4 text-white" />
              <span className="text-xs font-bold uppercase tracking-wider text-white/70">
                Community Recipes
              </span>
            </div>

            {/* Title */}
            <h2 className="font-serif font-bold text-2xl sm:text-4xl text-white">
              Signature Dish Inspirations
            </h2>
            <p className="text-xs sm:text-sm text-white/60 mt-1 max-w-md">
              Explore frequently scanned dishes and curated chef recipes ready for guided cooking.
            </p>
          </div>

          {/* View All Button */}
          <button
            type="button"
            onClick={() => onSelectRecipe(mockDiscoveryRecipes[0].title)}
            className="border border-white/30 hover:border-white px-5 py-2.5 rounded-full flex items-center gap-2 hover:bg-white/10 transition-colors cursor-pointer self-start sm:self-auto text-xs font-medium text-white"
            aria-label="View all recipes"
          >
            <span>Explore All Recipes</span>
            <ArrowRight className="w-3.5 h-3.5 text-white" />
          </button>
        </div>

        {/* 4-Column Fluid Grid reusing the exact existing card design */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {mockDiscoveryRecipes.map((card) => {
            return (
              <div
                key={card.id}
                className="bg-white/10 backdrop-blur-sm border border-white/15 rounded-2xl p-4 sm:p-5 flex flex-col justify-between hover:border-white/35 transition-all shadow-xs hover:shadow-sm group"
              >
                {/* Visual Area with Badge & Food Image */}
                <div className="relative w-full mb-4">
                  {/* Badge */}
                  {card.badge && (
                    <div className="absolute top-3 right-3 z-20 px-2.5 py-0.5 rounded-full bg-white text-[#263A20] text-[10px] font-semibold tracking-wider uppercase shadow-xs flex items-center gap-1">
                      <span>{card.badge}</span>
                    </div>
                  )}

                  {/* Dish Food Image / Placeholder */}
                  {card.imageUrl ? (
                    <div className="relative aspect-4/5 w-full overflow-hidden rounded-xl bg-[#EDE5DA] border border-[#263A20]/15 shadow-2xs">
                      <img
                        src={card.imageUrl}
                        alt={card.title}
                        referrerPolicy="no-referrer"
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 ease-out"
                        loading="lazy"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-[#263A20]/30 via-transparent to-transparent opacity-40 group-hover:opacity-15 transition-opacity duration-300 pointer-events-none" />
                    </div>
                  ) : (
                    <ImagePlaceholder
                      aspectRatio="aspect-4/5"
                      type={card.category === 'Beverages' ? 'drink' : 'generic'}
                      variant="cream"
                      className="group-hover:scale-[1.01] transition-transform"
                    />
                  )}
                </div>

                {/* Card Content Footer */}
                <div className="space-y-3">
                  <div className="space-y-1">
                    <div className="flex items-center justify-between text-[11px] text-white/60">
                      <span>{card.cuisine}</span>
                      <span className="font-semibold text-white/90">{card.category}</span>
                    </div>

                    <h3 className="font-serif font-bold text-base text-white leading-snug line-clamp-2">
                      {card.title}
                    </h3>

                    <div className="flex items-center gap-3 text-xs text-white/60 pt-1">
                      <span className="flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        {card.prepTime}
                      </span>
                      <span>•</span>
                      <span className="flex items-center gap-1">
                        <UtensilsCrossed className="w-3 h-3" />
                        {card.difficulty}
                      </span>
                    </div>
                  </div>

                  {/* Action Row */}
                  <div className="pt-2 border-t border-white/10">
                    <button
                      type="button"
                      onClick={() => onSelectRecipe(card.title)}
                      className="w-full bg-white/20 hover:bg-white/30 text-white py-2 px-3 rounded-full text-xs font-medium transition-all flex items-center justify-center gap-1.5 shadow-2xs cursor-pointer border border-white/30"
                    >
                      <ChefHat className="w-3.5 h-3.5 text-white" />
                      <span>View Recipe</span>
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Integrated Pantry & Produce Ingredient Discovery Tool */}
        <div id="recipes" className="pt-6">
          <IngredientRecipeFinder onSelectRecipeTitle={onSelectRecipe} />
        </div>
      </div>
    </section>
  );
};
