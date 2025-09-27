import { useMemo, useState } from "react";
import { cn } from "@/lib/utils";
import { Checkbox } from "@/components/ui/checkbox";
import { Card } from "@/components/ui/card";
import { useSearch } from "@/context/SearchContext";

const BASE_INGREDIENTS = [
  "Tomato","Onion","Garlic","Basil","Olive Oil","Chicken Breast","Ground Beef","Salmon","Shrimp","Eggs","Milk","Butter","Greek Yogurt","Parmesan","Cheddar","Mozzarella","Rice","Quinoa","Pasta","Bread","Tortilla","Potato","Sweet Potato","Carrot","Broccoli","Spinach","Kale","Bell Pepper","Mushroom","Zucchini","Avocado","Lemon","Lime","Apple","Banana","Strawberry","Blueberry","Almonds","Peanuts","Walnuts","Chia Seeds","Oats","Honey","Maple Syrup","Soy Sauce","Coconut Milk","Curry Powder","Cumin","Paprika","Chili Flakes","Black Pepper","Sea Salt"
];

export default function IngredientList() {
  const { query } = useSearch();
  const [checked, setChecked] = useState<Record<string, boolean>>({});

  const items = useMemo(() => {
    const q = query.trim().toLowerCase();
    const arr = BASE_INGREDIENTS.map((name) => ({ name, key: name.toLowerCase() }));
    if (!q) return arr;
    return arr.filter((i) => i.key.includes(q));
  }, [query]);

  return (
    <section className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-6 flex items-baseline justify-between">
        <h2 className="text-xl font-semibold">Ingredients</h2>
        <p className="text-sm text-muted-foreground">{items.length} items</p>
      </div>
      <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
        {items.map((item) => (
          <Card
            key={item.name}
            className={cn(
              "p-4 flex items-center gap-3 border hover:shadow-sm transition-shadow",
              checked[item.name] && "ring-1 ring-primary/40 bg-secondary/60",
            )}
          >
            <Checkbox
              id={item.name}
              checked={!!checked[item.name]}
              onCheckedChange={(v) =>
                setChecked((s) => ({ ...s, [item.name]: Boolean(v) }))
              }
            />
            <label htmlFor={item.name} className="cursor-pointer select-none flex-1">
              {item.name}
            </label>
          </Card>
        ))}
      </div>
    </section>
  );
}
