import { useEffect, useState } from "react";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { useSearch } from "@/context/SearchContext";
import { Separator } from "@/components/ui/separator";

export default function GroceryBag() {
  const { bag, removeFromBag } = useSearch();
  const [open, setOpen] = useState(false);

  useEffect(() => {
    function handler() {
      setOpen(true);
    }
    window.addEventListener("open-grocery-bag", handler);
    return () => window.removeEventListener("open-grocery-bag", handler);
  }, []);

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <div />
      </SheetTrigger>
      <SheetContent side="right" className="w-[420px] p-0">
        <SheetHeader className="px-6 py-4 border-b bg-secondary/50 backdrop-blur">
          <SheetTitle>Grocery Bag</SheetTitle>
        </SheetHeader>
        <div className="p-6 space-y-4">
          <p className="text-sm text-muted-foreground">Items you've added</p>
          <div className="space-y-2">
            {bag.length === 0 && <div className="text-sm text-muted-foreground">Your bag is empty</div>}
            {bag.map((item) => (
              <div key={item} className="flex items-center justify-between rounded-md border p-3">
                <span>{item}</span>
                <button className="text-sm text-destructive" onClick={() => removeFromBag(item)}>Remove</button>
              </div>
            ))}
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}
