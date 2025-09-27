import { useMemo, useState, useRef, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useSearch } from "@/context/SearchContext";
import MealModal from "@/components/MealModal";
import { ChevronLeft, ChevronRight } from "lucide-react";

const REC = [
  { name: "Lemon Garlic Salmon", tags: ["salmon", "lemon", "garlic"] },
  { name: "Pesto Pasta", tags: ["basil", "parmesan", "pasta"] },
  { name: "Chicken Caesar Wrap", tags: ["chicken", "lettuce", "tortilla"] },
  { name: "Veggie Stir Fry", tags: ["broccoli", "carrot", "soy sauce"] },
  {
    name: "Chickpea Curry",
    tags: ["curry powder", "coconut milk", "chickpea"],
  },
  { name: "Shrimp Tacos", tags: ["shrimp", "lime", "tortilla"] },
  { name: "Margherita Pizza", tags: ["tomato", "mozzarella", "basil"] },
  { name: "Ramen Bowl", tags: ["noodles", "egg", "miso"] },
  { name: "Beef Stir Fry", tags: ["beef", "soy sauce", "broccoli"] },
  { name: "Falafel Wrap", tags: ["chickpea", "tahini", "lettuce"] },
  { name: "Sushi Night", tags: ["rice", "nori", "fish"] },
  { name: "Mushroom Risotto", tags: ["mushroom", "rice", "parmesan"] },
];

export default function RecommendedMeals() {
  const { bag } = useSearch();
  const [modalMeal, setModalMeal] = useState<any | null>(null);
  const [page, setPage] = useState(0);
  const perPage = 8; // 2 rows x 4 cols

  const { favorites, toggleFavorite } = useSearch();

  const scored = useMemo(() => {
    return REC.map((r) => {
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
  }, [bag, favorites]);

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
      </div>

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
    </section>
  );
}
