import { useState, useEffect, useRef } from "react";
import { Settings } from "lucide-react";

type Filters = {
  meals: Record<string, boolean>;
  diets: Record<string, boolean>;
  international: Record<string, boolean>;
};

const DEFAULT: Filters = {
  meals: { Breakfast: true, Lunch: true, Dinner: true, Snacks: true },
  diets: { Vegan: false, Vegetarian: false, "Gluten-Free": false, "Low Sodium": false },
  international: { Asian: false, Hispanic: false },
};

export default function MenuFilter() {
  const [open, setOpen] = useState(false);
  const [filters, setFilters] = useState<Filters>(() => {
    try {
      const raw = localStorage.getItem("menu_filters");
      return raw ? JSON.parse(raw) : DEFAULT;
    } catch { return DEFAULT; }
  });
  const rootRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    localStorage.setItem("menu_filters", JSON.stringify(filters));
    window.dispatchEvent(new CustomEvent('menu-filters-changed', { detail: { filters } }));
  }, [filters]);

  useEffect(() => {
    function onDoc(e: MouseEvent) {
      if (!open) return;
      if (!rootRef.current) return;
      if (e.target && rootRef.current.contains(e.target as Node)) return;
      setOpen(false);
    }
    document.addEventListener('mousedown', onDoc);
    return () => document.removeEventListener('mousedown', onDoc);
  }, [open]);

  const toggleMeal = (key: string) => setFilters(f => ({ ...f, meals: { ...f.meals, [key]: !f.meals[key] } }));
  const toggleDiet = (key: string) => setFilters(f => ({ ...f, diets: { ...f.diets, [key]: !f.diets[key] } }));
  const toggleIntl = (key: string) => setFilters(f => ({ ...f, international: { ...f.international, [key]: !f.international[key] } }));

  return (
    <div className="relative" ref={rootRef}>
      <button
        aria-label="menu-filters"
        onClick={() => setOpen((o) => !o)}
        className="inline-flex items-center justify-center h-10 px-3 rounded-md border hover:shadow-sm"
      >
        <Settings className="h-4 w-4" />
      </button>
      {open && (
        <div className="absolute right-0 mt-2 w-80 bg-card border rounded-md shadow-lg p-4 z-40">
          <div className="text-lg font-semibold mb-2">Menu</div>
          <div className="grid grid-cols-2 gap-2 mb-3">
            {Object.keys(filters.meals).map((m) => (
              <button
                key={m}
                onClick={() => toggleMeal(m)}
                className={`py-2 px-3 text-sm rounded-md border ${filters.meals[m] ? 'bg-primary text-primary-foreground' : 'bg-transparent'}`}
              >{m}</button>
            ))}
          </div>

          <div className="text-xs text-muted-foreground mb-2">Dietary Restrictions</div>
          <div className="grid grid-cols-2 gap-2 mb-3">
            {Object.keys(filters.diets).map((d) => (
              <button
                key={d}
                onClick={() => toggleDiet(d)}
                className={`py-2 px-3 text-sm rounded-md border ${filters.diets[d] ? 'bg-primary text-primary-foreground' : 'bg-transparent'}`}
              >{d}</button>
            ))}
          </div>

          <div className="text-xs text-muted-foreground mb-2">International Food</div>
          <div className="grid grid-cols-2 gap-2">
            {Object.keys(filters.international).map((i) => (
              <button
                key={i}
                onClick={() => toggleIntl(i)}
                className={`py-2 px-3 text-sm rounded-md border ${filters.international[i] ? 'bg-primary text-primary-foreground' : 'bg-transparent'}`}
              >{i}</button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
