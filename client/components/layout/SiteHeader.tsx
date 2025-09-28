import SearchBar from "@/components/SearchBar";
import { Leaf, Camera, CalendarDays } from "lucide-react";
import GroceryBag from "@/components/GroceryBag";
import { useEffect, useState, useRef } from "react";

function CameraUpload() {
  const inputRef = useRef<HTMLInputElement | null>(null);
  return (
    <div>
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={(e) => {
          const f = e.target.files?.[0];
          if (f) {
            window.dispatchEvent(new CustomEvent('image-uploaded', { detail: { fileName: f.name } }));
          }
        }}
      />
      <button
        onClick={() => inputRef.current?.click()}
        className="inline-flex items-center gap-2 h-10 px-3 rounded-md border hover:shadow-sm"
        title="Upload image to scan ingredients"
      >
        <Camera className="h-4 w-4" />
      </button>
    </div>
  );
}

export default function SiteHeader() {
  const [showStars, setShowStars] = useState(false);
  useEffect(() => {
    function onAdd() {
      setShowStars(true);
      setTimeout(() => setShowStars(false), 900);
    }
    window.addEventListener('bag-item-added', onAdd as EventListener);
    return () => window.removeEventListener('bag-item-added', onAdd as EventListener);
  }, []);

  return (
    <header className="sticky top-0 z-30 backdrop-blur supports-[backdrop-filter]:bg-background/70 bg-background/80 border-b">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        <div className="flex items-center gap-2 text-primary font-bold">
          <div className="h-8 w-8 rounded-md brand-gradient grid place-items-center text-primary-foreground">
            <Leaf className="h-5 w-5" />
          </div>
          <span className="hidden sm:block">Pantry Planner</span>
        </div>
        <div className="flex items-center gap-3 w-full justify-center">
          <SearchBar />
          <div className="ml-3">
            {/* Camera upload button (replaces Cal button) */}
            <CameraUpload />
          </div>
        </div>
        <div className="flex items-center gap-3">
          <div className="relative">
            <button
              onClick={() => window.dispatchEvent(new CustomEvent("open-grocery-bag"))}
              className="hidden sm:inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground"
            >
              🛍️ Grocery
            </button>
            {showStars && (
              <div className="absolute -top-2 -right-3 pointer-events-none">
                <div className="relative w-12 h-12">
                  <div className="absolute -top-2 -right-2 animate-pop text-accent">✶</div>
                  <div className="absolute -top-1 right-0 animate-pop delay-100 text-accent">✶</div>
                  <div className="absolute 0 left-0 animate-pop delay-200 text-accent">✶</div>
                  <div className="absolute -bottom-1 -left-1 animate-pop delay-300 text-accent">✶</div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
      <GroceryBag />
    </header>
  );
}
