import { createContext, useContext, useMemo, useState, ReactNode, useEffect } from "react";

export const BASE_INGREDIENTS = [
  "Tomato","Onion","Garlic","Basil","Olive Oil","Chicken Breast","Ground Beef","Salmon","Shrimp","Eggs","Milk","Butter","Greek Yogurt","Parmesan","Cheddar","Mozzarella","Rice","Quinoa","Pasta","Bread","Tortilla","Potato","Sweet Potato","Carrot","Broccoli","Spinach","Kale","Bell Pepper","Mushroom","Zucchini","Avocado","Lemon","Lime","Apple","Banana","Strawberry","Blueberry","Almonds","Peanuts","Walnuts","Chia Seeds","Oats","Honey","Maple Syrup","Soy Sauce","Coconut Milk","Curry Powder","Cumin","Paprika","Chili Flakes","Black Pepper","Sea Salt"
];

interface SearchCtx {
  query: string;
  setQuery: (v: string) => void;
  suggestions: string[];
  bag: string[];
  addToBag: (item: string) => void;
  removeFromBag: (item: string) => void;
  toggleBag: (item: string) => void;
}

const Ctx = createContext<SearchCtx | null>(null);

export function SearchProvider({ children }: { children: ReactNode }) {
  const [query, setQuery] = useState("");
  const [bag, setBag] = useState<string[]>([]);

  useEffect(() => {
    const stored = localStorage.getItem("grocery_bag");
    if (stored) setBag(JSON.parse(stored));
  }, []);
  useEffect(() => {
    localStorage.setItem("grocery_bag", JSON.stringify(bag));
  }, [bag]);

  const addToBag = (item: string) => setBag((s) => (s.includes(item) ? s : [...s, item]));
  const removeFromBag = (item: string) => setBag((s) => s.filter((x) => x !== item));
  const toggleBag = (item: string) => setBag((s) => (s.includes(item) ? s.filter((x) => x !== item) : [...s, item]));

  const suggestions = BASE_INGREDIENTS.filter((i) => i.toLowerCase().includes(query.trim().toLowerCase()));

  const value = useMemo(() => ({ query, setQuery, suggestions, bag, addToBag, removeFromBag, toggleBag }), [query, bag]);
  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export function useSearch() {
  const ctx = useContext(Ctx);
  if (!ctx) throw new Error("useSearch must be used within SearchProvider");
  return ctx;
}
