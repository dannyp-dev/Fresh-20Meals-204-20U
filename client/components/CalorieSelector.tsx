import { useState } from "react";
import { useSearch } from "@/context/SearchContext";

export default function CalorieSelector() {
  const { calorieTarget, setCalorieTarget } = useSearch();
  const [open, setOpen] = useState(false);
  const [input, setInput] = useState(calorieTarget ? String(calorieTarget) : "");

  return (
    <div className="relative inline-block">
      <button className="px-3 py-2 rounded-md border text-sm" onClick={() => setOpen((o) => !o)}>
        Cal {calorieTarget ? `: ${calorieTarget}` : ''}
      </button>
      {open && (
        <div className="absolute right-0 mt-2 w-56 rounded-md border bg-card p-3 shadow-lg z-50">
          <div className="text-sm mb-2">Per-meal target (kcal)</div>
          <div className="flex gap-2">
            <input
              className="flex-1 rounded border px-2 py-1 text-sm"
              value={input}
              onChange={(e) => setInput(e.target.value.replace(/[^0-9]/g, ""))}
              placeholder="e.g. 600"
              inputMode="numeric"
            />
            <button className="px-3 py-1 rounded bg-primary text-primary-foreground" onClick={() => { const v = input ? parseInt(input,10) : null; setCalorieTarget(v); setOpen(false); }}>
              Set
            </button>
          </div>
          <div className="mt-2 text-right">
            <button className="text-sm text-muted-foreground" onClick={() => { setCalorieTarget(null); setInput(""); setOpen(false); }}>Clear</button>
          </div>
        </div>
      )}
    </div>
  );
}
