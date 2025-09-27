import { Search } from "lucide-react";
import { cn } from "@/lib/utils";
import { useSearch } from "@/context/SearchContext";
import { useState, useRef, useEffect } from "react";

export default function ({ className }: { className?: string }) {
  const { query, setQuery, suggestions, addToBag } = useSearch();
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    setOpen(Boolean(query.trim()));
  }, [query]);

  useEffect(() => {
    function onClick(e: MouseEvent) {
      if (!ref.current) return;
      if (!ref.current.contains(e.target as Node)) setOpen(false);
    }
    window.addEventListener("click", onClick);
    return () => window.removeEventListener("click", onClick);
  }, []);

  return (
    <div ref={ref} className={cn("group relative flex items-center", className)}>
      <Search className="absolute left-3 h-4 w-4 text-muted-foreground transition-colors group-hover:text-foreground" />
      <input
        aria-label="Search ingredients"
        className={cn(
          "w-56 md:w-72 lg:w-96 group-hover:w-[32rem] focus:w-[32rem] transition-[width,box-shadow] duration-300 ease-out",
          "rounded-full bg-secondary/70 pl-9 pr-4 py-2 text-sm outline-none",
          "focus:ring-2 ring-offset-2 ring-primary/40 shadow-sm",
        )}
        placeholder="Search ingredients, recipes..."
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        onFocus={() => setOpen(Boolean(query.trim()))}
      />


      {open && suggestions.length > 0 && (
        <div className="absolute left-0 top-full mt-2 w-[28rem] max-h-80 overflow-auto rounded-xl border bg-card p-2 shadow-lg">
          {suggestions.slice(0, 10).map((s) => (
            <div
              key={s}
              className="flex items-center justify-between gap-3 px-3 py-2 rounded hover:bg-secondary/30 cursor-pointer"
              onClick={() => {
                addToBag(s);
                setQuery("");
                setOpen(false);
              }}
            >
              <div className="text-sm">{s}</div>
              <div className="text-xs text-muted-foreground">Add</div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
