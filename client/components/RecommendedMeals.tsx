import { useMemo, useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useSearch } from "@/context/SearchContext";
import MealModal from "@/components/MealModal";
import { ChevronLeft, ChevronRight, ChefHat, ShoppingBasket } from "lucide-react";
import { Button } from "@/components/ui/button";

const MIN_INGREDIENTS = 3;

// Fallback recipes in case Gemini generation fails
const FALLBACK_RECIPES = [
  { name: "Lemon Garlic Salmon", description: "Roasted salmon with bright lemon and savory garlic.", tags: ["salmon", "lemon", "garlic"], calories: 620, timeMinutes: 28, servings: 2, source: 'fallback' },
  { name: "Pesto Pasta", description: "Al dente pasta tossed in fresh basil pesto.", tags: ["basil", "parmesan", "pasta"], calories: 740, timeMinutes: 25, servings: 3, source: 'fallback' },
  { name: "Chicken Caesar Wrap", description: "Grilled chicken, crisp lettuce and dressing wrapped.", tags: ["chicken", "lettuce", "tortilla"], calories: 540, timeMinutes: 18, servings: 2, source: 'fallback' },
  { name: "Veggie Stir Fry", description: "Quick stir-fried mixed veggies in a light sauce.", tags: ["broccoli", "carrot", "soy sauce"], calories: 410, timeMinutes: 20, servings: 2, source: 'fallback' },
];

export default function RecommendedMeals() {
  const { bag, favorites, toggleFavorite } = useSearch();
  const [modalMeal, setModalMeal] = useState<any | null>(null);
  const [page, setPage] = useState(0);
  const perPage = 8; // 2 rows x 4 cols
  const [recipes, setRecipes] = useState<typeof FALLBACK_RECIPES>(FALLBACK_RECIPES);
  const [isLoading, setIsLoading] = useState(false);
  const [lastModel, setLastModel] = useState<string | undefined>(undefined);
  const [error, setError] = useState<string | null>(null);

  // ...existing code...

  async function generateMeals() {
    setIsLoading(true);
    setError(null);
    try {
      const resp = await fetch('/api/meals/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ingredients: bag, maxMeals: 8 })
      });
      if (!resp.ok) throw new Error(`Request failed: ${resp.status}`);
      const data = await resp.json();
      if (!data.meals || !Array.isArray(data.meals) || data.meals.length === 0) {
        setRecipes(FALLBACK_RECIPES);
        setLastModel(data.model || 'fallback');
        return;
      }
      setRecipes(data.meals);
      setLastModel(data.model);
      setPage(0);
    } catch (e:any) {
      console.error('[generateMeals] error', e);
      setError(e.message || 'Failed to generate meals');
      setRecipes(FALLBACK_RECIPES);
      setLastModel('fallback:error');
    } finally {
      setIsLoading(false);
    }
  }

  const scored = useMemo(() => {
    return recipes.map((r) => {
      const have = r.tags.filter((t) =>
        bag.some((b) => b.toLowerCase().includes(t)),
      ).length;
      const score = have / r.tags.length;
      return { ...r, have, score };
    }).sort((a, b) => {
      const aFav = favorites.includes(a.name) ? 1 : 0;
      const bFav = favorites.includes(b.name) ? 1 : 0;
      if (aFav !== bFav) return bFav - aFav;
      return b.score - a.score;
    });
  }, [bag, favorites, recipes]);

  const pages = Math.max(1, Math.ceil(scored.length / perPage));

  // ensure page bounds
  useEffect(() => {
    if (page >= pages) setPage(pages - 1);
  }, [pages]);

  const pageItems = scored.slice(page * perPage, page * perPage + perPage);

  return (
    <section className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8 relative">
      <div className="mb-4 flex items-center justify-between">
        <h2 className="text-xl font-semibold">Recommended Meals</h2>
        <div className="flex items-center gap-4">
          {lastModel && (
            <span className="text-xs text-muted-foreground">Model: {lastModel}</span>
          )}
          {error && (
            <span className="text-xs text-destructive">{error}</span>
          )}
          {bag.length >= MIN_INGREDIENTS && (
            <Button onClick={generateMeals} disabled={isLoading} className="gap-2">
              <ChefHat className="h-4 w-4" />
              {isLoading ? 'Generating...' : 'Generate Meals'}
            </Button>
          )}
        </div>
      </div>

      {bag.length === 0 ? (
        <Card className="p-8 text-center">
          <ShoppingBasket className="mx-auto h-12 w-12 text-muted-foreground/50 mb-4" />
          <h3 className="text-lg font-semibold mb-2">Your grocery bag is empty</h3>
          <p className="text-muted-foreground mb-4">
            Start by adding some ingredients to your grocery bag to get meal recommendations
          </p>
        </Card>
      ) : bag.length < MIN_INGREDIENTS ? (
        <Card className="p-8 text-center">
          <ChefHat className="mx-auto h-12 w-12 text-muted-foreground/50 mb-4" />
          <h3 className="text-lg font-semibold mb-2">Add more ingredients</h3>
          <p className="text-muted-foreground mb-4">
            Add at least {MIN_INGREDIENTS} ingredients to start getting meal recommendations.
            Currently have: {bag.length} ingredient{bag.length === 1 ? '' : 's'}
          </p>
        </Card>
      ) : (
        <>
      <div className="relative">
        <button
          aria-label="prev"
          onClick={() => setPage((p) => Math.max(0, p - 1))}
          disabled={page === 0}
          className={`absolute -left-6 top-1/2 -translate-y-1/2 z-20 rounded-full p-2 bg-card border ${page === 0 ? "opacity-40 pointer-events-none" : ""}`}
        >
          <ChevronLeft className="h-6 w-6" />
        </button>

        <div className="border rounded-lg p-4 overflow-hidden">
          {/* carousel viewport */}
          <div className="relative w-full overflow-hidden">
            {/* sliding track */}
            <div
              className="flex transition-transform duration-300 ease-in-out"
              style={{ transform: `translateX(-${page * 100}%)` }}
            >
              {Array.from({ length: pages }).map((_, pi) => {
                const items = scored.slice(pi * perPage, pi * perPage + perPage);
                return (
                  <div key={pi} className="w-full flex-shrink-0">
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                      {items.map((s) => (
                        <Card
                          key={s.name}
                          className="p-4 flex flex-col gap-3 transform transition-all duration-150 ease-out hover:-translate-y-1 hover:shadow-xl"
                        >
                          <div className="flex items-start justify-between">
                            <h3 className="font-semibold">{s.name}</h3>
                            <Badge variant={s.score > 0.5 ? "default" : "secondary"}>
                              {Math.round(s.score * 100)}%
                            </Badge>
                          </div>
                          <p className="text-sm text-muted-foreground">
                            Needed: {s.tags.join(", ")}
                          </p>
                          <div className="flex items-center justify-between mt-2">
                            <div className="flex gap-2">
                              <button
                                className="px-3 py-1 rounded-md bg-primary text-primary-foreground text-sm"
                                onClick={() => setModalMeal(s)}
                              >
                                View
                              </button>
                              <button
                                className="px-3 py-1 rounded-md border text-sm"
                                onClick={() =>
                                  window.dispatchEvent(
                                    new CustomEvent("schedule-meal", {
                                      detail: { meal: s.name },
                                    }),
                                  )
                                }
                              >
                                Schedule
                              </button>
                            </div>
                            <button
                              onClick={() => toggleFavorite(s.name)}
                              className={`p-2 transition-colors duration-300 ease-in-out ${
                                favorites.includes(s.name) 
                                  ? "text-yellow-500" 
                                  : "text-muted-foreground hover:text-yellow-500"
                              }`}
                              title="Favorite"
                            >
                              <span className="text-lg transition-transform duration-300 ease-in-out inline-block">★</span>
                            </button>
                          </div>
                        </Card>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        <button
          aria-label="next"
          onClick={() => setPage((p) => Math.min(p + 1, pages - 1))}
          disabled={page >= pages - 1}
          className={`absolute -right-6 top-1/2 -translate-y-1/2 z-20 rounded-full p-2 bg-card border ${page >= pages - 1 ? "opacity-40 pointer-events-none" : ""}`}
        >
          <ChevronRight className="h-6 w-6" />
        </button>
      </div>
      
          <MealModal
            open={!!modalMeal}
            onClose={() => setModalMeal(null)}
            meal={modalMeal}
          />
        </>
      )}
    </section>
  );
}
