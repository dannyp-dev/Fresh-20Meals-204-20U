import { useMemo } from "react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useSearch } from "@/context/SearchContext";

const REC = [
  { name: "Lemon Garlic Salmon", tags: ["salmon", "lemon", "garlic"] },
  { name: "Pesto Pasta", tags: ["basil", "parmesan", "pasta"] },
  { name: "Chicken Caesar Wrap", tags: ["chicken", "lettuce", "tortilla"] },
  { name: "Veggie Stir Fry", tags: ["broccoli", "carrot", "soy sauce"] },
  { name: "Chickpea Curry", tags: ["curry powder", "coconut milk", "chickpea"] },
  { name: "Shrimp Tacos", tags: ["shrimp", "lime", "tortilla"] },
];

export default function RecommendedMeals() {
  const { bag } = useSearch();

  const scored = useMemo(() => {
    return REC.map((r) => {
      const have = r.tags.filter((t) => bag.some((b) => b.toLowerCase().includes(t)) ).length;
      const score = have / r.tags.length;
      return { ...r, have, score };
    }).sort((a,b) => b.score - a.score);
  }, [bag]);

  return (
    <section className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-6 flex items-baseline justify-between">
        <h2 className="text-xl font-semibold">Recommended Meals</h2>
        <p className="text-sm text-muted-foreground">Suggestions based on your bag</p>
      </div>
      <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
        {scored.map((s) => (
          <Card key={s.name} className="p-4 flex flex-col gap-3">
            <div className="flex items-start justify-between">
              <h3 className="font-semibold">{s.name}</h3>
              <Badge variant={s.score > 0.5 ? "default" : "secondary"}>{Math.round(s.score * 100)}%</Badge>
            </div>
            <p className="text-sm text-muted-foreground">Needed: {s.tags.join(", ")}</p>
            <div className="flex gap-2 mt-2">
              <button className="px-3 py-1 rounded-md bg-primary text-primary-foreground text-sm">View</button>
              <button className="px-3 py-1 rounded-md border text-sm" onClick={() => window.dispatchEvent(new CustomEvent('open-grocery-bag'))}>Add to bag</button>
            </div>
          </Card>
        ))}
      </div>
    </section>
  );
}
