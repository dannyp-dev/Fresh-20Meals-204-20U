import {
  createContext,
  useContext,
  useMemo,
  useState,
  ReactNode,
  useEffect,
  useRef,
} from "react";

// Keep a small initial list for zero-query fast suggestions (warm state)
export const BASE_INGREDIENTS = [
  'Tomato','Onion','Garlic','Basil','Olive Oil','Chicken Breast','Ground Beef','Salmon','Shrimp','Eggs','Milk','Butter','Parmesan','Rice','Quinoa','Pasta','Bread','Potato','Carrot','Broccoli','Spinach','Lemon','Lime','Apple','Banana','Strawberry','Blueberry','Almonds','Oats','Honey','Soy Sauce','Coconut Milk','Cumin','Paprika','Black Pepper','Sea Salt'
];

interface SearchCtx {
  query: string;
  setQuery: (v: string) => void;
  suggestions: string[];
  bag: string[];
  addToBag: (item: string) => void;
  removeFromBag: (item: string) => void;
  decrementFromBag: (item: string) => void;
  toggleBag: (item: string) => void;
  favorites: string[];
  toggleFavorite: (item: string) => void;
  calorieTarget: number | null;
  setCalorieTarget: (v: number | null) => void;
  loadingSuggestions: boolean;
}

const Ctx = createContext<SearchCtx | null>(null);

export function SearchProvider({ children }: { children: ReactNode }) {
  const [query, setQuery] = useState("");
  const [bag, setBag] = useState<string[]>([]);
  const [favorites, setFavorites] = useState<string[]>([]);

  useEffect(() => {
    const stored = localStorage.getItem("grocery_bag");
    if (stored) setBag(JSON.parse(stored));
    const fav = localStorage.getItem("favorites");
    if (fav) setFavorites(JSON.parse(fav));
  }, []);
  useEffect(() => {
    localStorage.setItem("grocery_bag", JSON.stringify(bag));
  }, [bag]);
  useEffect(() => {
    localStorage.setItem("favorites", JSON.stringify(favorites));
  }, [favorites]);

  const addToBag = (item: string) => {
    setBag((s) => (s.includes(item) ? s : [...s, item]));
    // fire a small UI event so headers or other components can animate
    window.dispatchEvent(new CustomEvent('bag-item-added', { detail: { item } }));
  };

  const removeFromBag = (item: string) => {
    setBag((s) => s.filter((x) => x !== item));
  };

  const decrementFromBag = (item: string) => {
    // If item not in bag, do nothing. Otherwise remove it (we don't track qtys any more)
    setBag((s) => s.filter((x) => x !== item));
  };

  const toggleBag = (item: string) =>
    setBag((s) =>
      s.includes(item) ? s.filter((x) => x !== item) : [...s, item],
    );

  const toggleFavorite = (item: string) =>
    setFavorites((s) =>
      s.includes(item) ? s.filter((x) => x !== item) : [item, ...s],
    );

  const [suggestions, setSuggestions] = useState<string[]>(BASE_INGREDIENTS);
  const [loadingSuggestions, setLoadingSuggestions] = useState(false);
  const abortRef = useRef<AbortController | null>(null);

  // Debounced remote fetch
  useEffect(() => {
    const q = query.trim();
    // If no query, show base list
    if (!q) {
      setSuggestions(BASE_INGREDIENTS);
      return;
    }
    setLoadingSuggestions(true);
    const controller = new AbortController();
    abortRef.current?.abort();
    abortRef.current = controller;
    const t = setTimeout(async () => {
      try {
        const resp = await fetch(`/api/ingredients/search?q=${encodeURIComponent(q)}&limit=40`, { signal: controller.signal });
        if (!resp.ok) throw new Error('Search failed');
        const data = await resp.json();
        if (Array.isArray(data.results)) {
          setSuggestions(data.results.length ? data.results : BASE_INGREDIENTS.filter(i => i.toLowerCase().includes(q.toLowerCase())));
        }
      } catch (e) {
        if ((e as any).name !== 'AbortError') {
          // fallback gracefully
          setSuggestions(BASE_INGREDIENTS.filter(i => i.toLowerCase().includes(q.toLowerCase())));
        }
      } finally {
        setLoadingSuggestions(false);
      }
    }, 250);
    return () => { clearTimeout(t); controller.abort(); };
  }, [query]);

  const [calorieTarget, setCalorieTarget] = useState<number | null>(null);

  const value = useMemo(
    () => ({
      query,
      setQuery,
      suggestions,
      bag,
      addToBag,
      removeFromBag,
      decrementFromBag,
      toggleBag,
      favorites,
      toggleFavorite,
      calorieTarget,
      setCalorieTarget,
      loadingSuggestions,
    }),
    [query, bag, calorieTarget, favorites, suggestions, loadingSuggestions],
  );
  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export function useSearch() {
  const ctx = useContext(Ctx);
  if (!ctx) throw new Error("useSearch must be used within SearchProvider");
  return ctx;
}
