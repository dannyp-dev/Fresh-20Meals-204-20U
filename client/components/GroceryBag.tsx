import { useEffect, useState } from "react";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { useSearch } from "@/context/SearchContext";
import { Separator } from "@/components/ui/separator";
import { ShoppingBasket } from "lucide-react";

export default function GroceryBag() {
  const { bag, addToBag, removeFromBag, decrementFromBag } = useSearch();
  const [open, setOpen] = useState(false);
  const [showStars, setShowStars] = useState(false);

  useEffect(() => {
    function handler() {
      setOpen(true);
    }
    window.addEventListener("open-grocery-bag", handler);
    return () => window.removeEventListener("open-grocery-bag", handler);
  }, []);

  useEffect(() => {
    function onAdd(e: any) {
      // briefly show star animation near header
      setShowStars(true);
      setTimeout(() => setShowStars(false), 900);
    }
    window.addEventListener('bag-item-added', onAdd as EventListener);
    return () => window.removeEventListener('bag-item-added', onAdd as EventListener);
  }, []);

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <div />
      </SheetTrigger>
      <SheetContent side="right" className="w-[420px] p-0">
        <SheetHeader className="px-6 py-4 border-b bg-secondary/50 backdrop-blur flex items-center gap-3">
          <ShoppingBasket className="h-6 w-6 text-primary" />
          <SheetTitle>Grocery Bag</SheetTitle>
          {showStars && (
            <div className="ml-auto -mr-4">
              <div className="relative w-8 h-8">
                <div className="absolute -top-1 -right-1 animate-pop text-accent">✶</div>
                <div className="absolute -bottom-1 -left-1 animate-pop delay-150 text-accent">✶</div>
              </div>
            </div>
          )}
        </SheetHeader>
  <div className="p-6 pb-4 space-y-4 flex flex-col flex-1 min-h-0">
          <p className="text-sm text-muted-foreground font-semibold">Items you've added</p>
          <div className="relative -m-2 flex-1 min-h-0">
            <div
              className="space-y-2 h-full overflow-y-auto no-scrollbar smooth-scroll pr-4 pl-2 pb-2"
              style={{ WebkitOverflowScrolling: 'touch', scrollBehavior: 'smooth' }}
            >
              {bag.length === 0 && <div className="text-sm text-muted-foreground">Your bag is empty</div>}
              {bag.map((item) => (
                <div key={item} className="flex items-center justify-between rounded-md border p-3 hover:bg-primary/30 transition-colors duration-150">
                  <div className="flex items-center gap-3">
                    <div className="font-medium">{item}</div>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      title="Remove"
                      onClick={() => removeFromBag(item)}
                      className="h-6 w-6 rounded-full bg-transparent text-destructive grid place-items-center transition-colors duration-150 hover:bg-destructive hover:text-destructive-foreground"
                    >
                      ✕
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}
