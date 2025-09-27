import { useState } from "react";
import { useSearch } from "@/context/SearchContext";

export default function CalorieSelector() {
  const { calorieTarget, setCalorieTarget } = useSearch();
  const [open, setOpen] = useState(false);

  const options = [400, 500, 600, 700, 800];

  return (
    <div className="relative inline-block">
      <button className="px-3 py-2 rounded-md border text-sm" onClick={() => setOpen((o) => !o)}>
        Cal {calorieTarget ? `: ${calorieTarget}` : ''}
      </button>
      {open && (
        <div className="absolute right-0 mt-2 w-40 rounded-md border bg-card p-3 shadow-lg z-50">
          <div className="text-sm mb-2">Per-meal target</div>
          <div className="flex flex-col gap-2">
            {options.map((o) => (
              <button key={o} className={`text-sm p-2 rounded ${calorieTarget===o? 'bg-primary text-primary-foreground':''}`} onClick={() => { setCalorieTarget(o); setOpen(false); }}>
                {o} kcal
              </button>
            ))}
            <button className="text-sm p-2 rounded" onClick={() => { setCalorieTarget(null); setOpen(false); }}>Clear</button>
          </div>
        </div>
      )}
    </div>
  );
}
