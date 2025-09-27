import { useMemo, useState } from "react";
import { cn } from "@/lib/utils";
import { Checkbox } from "@/components/ui/checkbox";
import { Card } from "@/components/ui/card";
import { useSearch } from "@/context/SearchContext";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

const BASE_INGREDIENTS = [
  "Tomato","Onion","Garlic","Basil","Olive Oil","Chicken Breast","Ground Beef","Salmon","Shrimp","Eggs","Milk","Butter","Greek Yogurt","Parmesan","Cheddar","Mozzarella","Rice","Quinoa","Pasta","Bread","Tortilla","Potato","Sweet Potato","Carrot","Broccoli","Spinach","Kale","Bell Pepper","Mushroom","Zucchini","Avocado","Lemon","Lime","Apple","Banana","Strawberry","Blueberry","Almonds","Peanuts","Walnuts","Chia Seeds","Oats","Honey","Maple Syrup","Soy Sauce","Coconut Milk","Curry Powder","Cumin","Paprika","Chili Flakes","Black Pepper","Sea Salt"
];

export default function IngredientList() {
  const { query } = useSearch();
  const [checked, setChecked] = useState<Record<string, boolean>>({});
  const [productUrl, setProductUrl] = useState("");
  const [loading, setLoading] = useState(false);
  const [apiIngredients, setApiIngredients] = useState<string[] | null>(null);
  const [error, setError] = useState<string | null>(null);

  const mergedIngredients = useMemo(() => {
    const fromApi = apiIngredients ?? [];
    // merge and dedupe, keep BASE first then api extras
    const set = new Set<string>([...BASE_INGREDIENTS, ...fromApi]);
    return Array.from(set);
  }, [apiIngredients]);

  const items = useMemo(() => {
    const q = query.trim().toLowerCase();
    const arr = mergedIngredients.map((name) => ({ name, key: name.toLowerCase() }));
    if (!q) return arr;
    return arr.filter((i) => i.key.includes(q));
  }, [query, mergedIngredients]);

  // Fetch a product JSON from an OpenFoodFacts product URL (or full API URL).
  // Note: no Authorization header is needed for public data. Some environments
  // may have CORS restrictions — if you see network errors, try the browser
  // console to inspect the request/response.
  async function fetchProductUrl() {
    if (!productUrl) return;
    setLoading(true);
    setError(null);
    try {
      // allow either a full product API URL or a user-facing product page URL
      let url = productUrl.trim();
      // if user pasted a normal product page like https://world.openfoodfacts.org/product/3274080005003/...,
      // convert to the API v2 JSON endpoint
      if (/^https?:\/\//i.test(url) && !url.includes("/api/")) {
        // try to extract the barcode from the URL path
        const parts = url.split("/").filter(Boolean);
        const possible = parts.find((p) => /^[0-9]{8,13}$/.test(p));
        if (possible) {
          url = `https://world.openfoodfacts.net/api/v2/product/${possible}.json`;
        }
      }

      const res = await fetch(url, { method: "GET" });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const json = await res.json();
      console.debug("OpenFoodFacts product json:", json);
      const prod = json?.product ?? json;
      let names: string[] = [];
      if (Array.isArray(prod?.ingredients)) {
        names = prod.ingredients
          .map((ing: any) => {
            // prefer localized text if available (e.g., text_en)
            if (ing?.text) return String(ing.text);
            if (ing?.text_en) return String(ing.text_en);
            return null;
          })
          .filter(Boolean);
      }
      if (!names.length && typeof prod?.ingredients_text === "string") {
        names = prod.ingredients_text
          .split(/,|;/)
          .map((s: string) => s.replace(/\(.+?\)/g, "").trim())
          .filter(Boolean);
      }
      if (!names.length && Array.isArray(prod?.ingredients_analysis_tags)) {
        names = prod.ingredients_analysis_tags.map((s: any) => String(s).replace(/^en:/, "")).filter(Boolean);
      }
      // final fallback: try `labels` or `categories`
      if (!names.length && Array.isArray(prod?.labels)) {
        names = prod.labels.map((s: any) => String(s)).filter(Boolean);
      }
      setApiIngredients(names.length ? names : []);
    } catch (err: any) {
      setError(err?.message ?? String(err));
    } finally {
      setLoading(false);
    }
  }

  return (
    <section className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-6 flex items-baseline justify-between">
        <h2 className="text-xl font-semibold">Ingredients</h2>
        <p className="text-sm text-muted-foreground">{items.length} items</p>
      </div>
      <div className="mb-6 flex gap-2 items-center">
        <Input
          placeholder="Paste product URL or API URL (or barcode will be extracted)"
          value={productUrl}
          onChange={(e: any) => setProductUrl(e.target.value)}
        />
        <Button onClick={fetchProductUrl} disabled={loading}>
          {loading ? "Loading..." : "Fetch"}
        </Button>
      </div>
      {error && <p className="text-sm text-red-500 mb-4">Error: {error}</p>}
      {apiIngredients && (
        <p className="text-sm text-muted-foreground mb-4">Loaded {apiIngredients.length} ingredients from product</p>
      )}
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
