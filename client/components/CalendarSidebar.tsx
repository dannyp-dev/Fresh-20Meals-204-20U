import { useMemo, useState } from "react";
import { Calendar as CalendarIcon } from "lucide-react";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { Calendar } from "@/components/ui/calendar";
import { Separator } from "@/components/ui/separator";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";

const IDEAS = [
  "Grilled Chicken Salad",
  "Spaghetti Bolognese",
  "Tofu Stir-fry",
  "Shrimp Tacos",
  "Veggie Omelette",
  "Beef Buddha Bowl",
  "Lemon Garlic Salmon",
  "Chickpea Curry",
  "Pesto Pasta",
  "Sushi Night",
  "Margherita Pizza",
  "BBQ Pulled Pork",
  "Falafel Wraps",
  "Ramen",
  "Burrito Bowls",
  "Stuffed Peppers",
  "Pad Thai",
  "Cobb Salad",
  "Mushroom Risotto",
  "Fish and Chips",
];

function ideasForDate(d: Date) {
  const day = d.getDate();
  const a = IDEAS[(day * 3) % IDEAS.length];
  const b = IDEAS[(day * 5 + 1) % IDEAS.length];
  return [a, b];
}

export default function CalendarSidebar() {
  const [open, setOpen] = useState(false);
  const [selected, setSelected] = useState<Date | undefined>(new Date());
  const ideas = useMemo(() => (selected ? ideasForDate(selected) : []), [selected]);

  return (
    <div id="planner">
      <Sheet open={open} onOpenChange={setOpen}>
        <SheetTrigger asChild>
          <button
            aria-label="Open meal planner"
            className="fixed right-0 top-1/3 z-40 -mr-2 rounded-l-full brand-gradient text-primary-foreground shadow-lg px-3 py-3 hover:pr-4 transition-[padding]"
          >
            <CalendarIcon className="h-5 w-5" />
          </button>
        </SheetTrigger>
        <SheetContent side="right" className="w-[380px] sm:w-[420px] p-0">
          <SheetHeader className="px-6 py-4 border-b bg-secondary/50 backdrop-blur">
            <SheetTitle className="text-left">Meal Planner</SheetTitle>
          </SheetHeader>
          <div className="p-6 pt-4 space-y-4">
            <Calendar
              mode="single"
              selected={selected}
              onSelect={setSelected}
              className="rounded-md border"
            />
            <div>
              <h4 className="text-sm font-medium mb-2">Ideas for {selected?.toLocaleDateString()}</h4>
              <Separator />
              <ScrollArea className="h-40 mt-3 pr-3">
                <div className="space-y-2">
                  {ideas.map((name) => (
                    <div key={name} className="flex items-center justify-between rounded-md border p-3">
                      <span className="text-sm font-medium">{name}</span>
                      <Badge variant="secondary">Idea</Badge>
                    </div>
                  ))}
                </div>
              </ScrollArea>
            </div>
          </div>
        </SheetContent>
      </Sheet>
    </div>
  );
}
