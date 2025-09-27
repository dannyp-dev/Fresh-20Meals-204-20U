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
  { name: "Chickpea Curry", tags: ["curry powder", "coconut milk", "chickpea"] },
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
  const listRef = useRef<HTMLDivElement | null>(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(true);

  useEffect(() => {
    const el = listRef.current;
    if (!el) return;
    const onScroll = () => {
      setCanScrollLeft(el.scrollLeft > 0);
      setCanScrollRight(el.scrollLeft + el.clientWidth < el.scrollWidth - 1);
    };
    onScroll();
    el.addEventListener("scroll", onScroll);
    window.addEventListener("resize", onScroll);
    return () => {
      el.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
    };
  }, []);

  const scored = useMemo(() => {
    return REC.map((r) => {
      const have = r.tags.filter((t) => bag.some((b) => b.toLowerCase().includes(t)) ).length;
      const score = have / r.tags.length;
      return { ...r, have, score };
    }).sort((a,b) => b.score - a.score);
  }, [bag]);

  const scroll = (dir: "left" | "right") => {
    const el = listRef.current;
    if (!el) return;
    const amount = el.clientWidth * 0.8;
    el.scrollBy({ left: dir === "left" ? -amount : amount, behavior: "smooth" });
  };

  return (
    <section className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8 relative">
      <div className="mb-4 flex items-center justify-between">
        <h2 className="text-xl font-semibold">Recommended Meals</h2>
      </div>

      <div className="relative">
        <button aria-label="prev" onClick={() => scroll("left")} disabled={!canScrollLeft} className={`absolute -left-4 top-1/2 -translate-y-1/2 z-20 rounded-full p-2 bg-card border ${!canScrollLeft ? 'opacity-40 pointer-events-none':''}`}>
          <ChevronLeft className="h-5 w-5" />
        </button>

        <div className="border rounded-lg p-4 overflow-hidden">
          <div ref={listRef} className="flex gap-4 overflow-x-auto scroll-smooth py-2">
            {scored.map((s) => (
              <div key={s.name} className="min-w-[260px] max-w-[260px] flex-shrink-0">
                <Card className="p-4 flex flex-col gap-3 h-full">
                  <div className="flex items-start justify-between">
                    <h3 className="font-semibold">{s.name}</h3>
                    <Badge variant={s.score > 0.5 ? "default" : "secondary"}>{Math.round(s.score * 100)}%</Badge>
                  </div>
                  <p className="text-sm text-muted-foreground">Needed: {s.tags.join(", ")}</p>
                  <div className="flex gap-2 mt-2">
                    <button className="px-3 py-1 rounded-md bg-primary text-primary-foreground text-sm" onClick={() => setModalMeal(s)}>View</button>
                    <button className="px-3 py-1 rounded-md border text-sm" onClick={() => window.dispatchEvent(new CustomEvent('schedule-meal', { detail: { meal: s.name } }))}>Schedule</button>
                  </div>
                </Card>
              </div>
            ))}
          </div>
        </div>

        <button aria-label="next" onClick={() => scroll("right")} disabled={!canScrollRight} className={`absolute -right-4 top-1/2 -translate-y-1/2 z-20 rounded-full p-2 bg-card border ${!canScrollRight ? 'opacity-40 pointer-events-none':''}`}>
          <ChevronRight className="h-5 w-5" />
        </button>
      </div>

      <MealModal open={!!modalMeal} onClose={() => setModalMeal(null)} meal={modalMeal} />
    </section>
  );
}
