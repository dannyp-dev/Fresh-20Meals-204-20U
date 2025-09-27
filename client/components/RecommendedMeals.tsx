import { useMemo, useState } from "react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useSearch } from "@/context/SearchContext";
import MealModal from "@/components/MealModal";

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
  const [page, setPage] = useState(0);
  const [modalMeal, setModalMeal] = useState<any | null>(null);

  const perPage = 6;
  const pages = Math.ceil(REC.length / perPage);

  const scored = useMemo(() => {
    return REC.map((r) => {
      const have = r.tags.filter((t) => bag.some((b) => b.toLowerCase().includes(t)) ).length;
      const score = have / r.tags.length;
      return { ...r, have, score };
    }).sort((a,b) => b.score - a.score);
  }, [bag]);

  const pageItems = scored.slice(page * perPage, page * perPage + perPage);

  return (
    <section className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-6 flex items-baseline justify-between">
        <h2 className="text-xl font-semibold">Recommended Meals</h2>
        <div className="flex items-center gap-3">
          <button className="px-3 py-1 rounded border" onClick={() => history.back()}>Back</button>
          <button className="px-3 py-1 rounded border" onClick={() => setPage((p) => (p + 1) % pages)}>More</button>
        </div>
      </div>

      <div className="border rounded-lg p-4">
        <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
          {pageItems.map((s) => (
            <Card key={s.name} className="p-4 flex flex-col gap-3">
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
          ))}
        </div>
      </div>

      <MealModal open={!!modalMeal} onClose={() => setModalMeal(null)} meal={modalMeal} />
    </section>
  );
}
