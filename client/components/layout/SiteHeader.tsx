import SearchBar from "@/components/SearchBar";
import { Leaf, CalendarDays } from "lucide-react";
import GroceryBag from "@/components/GroceryBag";

export default function SiteHeader() {
  return (
    <header className="sticky top-0 z-30 backdrop-blur supports-[backdrop-filter]:bg-background/70 bg-background/80 border-b">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        <div className="flex items-center gap-2 text-primary font-bold">
          <div className="h-8 w-8 rounded-md brand-gradient grid place-items-center text-primary-foreground">
            <Leaf className="h-5 w-5" />
          </div>
          <span className="hidden sm:block">Pantry Planner</span>
        </div>
        <SearchBar />
        <div className="flex items-center gap-3">
          <button
            onClick={() => window.dispatchEvent(new CustomEvent("open-grocery-bag"))}
            className="hidden sm:inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground"
          >
            🛍️ Grocery
          </button>
          <button onClick={() => window.dispatchEvent(new CustomEvent('open-full-calendar'))} className="hidden sm:flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground">
            <CalendarDays className="h-4 w-4" /> Planner
          </button>
        </div>
      </div>
      <GroceryBag />
    </header>
  );
}
