import { Search } from "lucide-react";
import { cn } from "@/lib/utils";
import { useSearch } from "@/context/SearchContext";

export default function SearchBar({ className }: { className?: string }) {
  const { query, setQuery } = useSearch();
  return (
    <div className={cn("group relative flex items-center", className)}>
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
      />
    </div>
  );
}
