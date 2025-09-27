import { useMemo, useState, useEffect } from "react";
import { Calendar as CalendarIcon, X } from "lucide-react";
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

  useEffect(() => {
    function handler() {
      setOpen(true);
    }
    window.addEventListener("open-full-calendar", handler);
    return () => window.removeEventListener("open-full-calendar", handler);
  }, []);

  return (
    <div id="planner">
      <button
        aria-label="Open meal planner"
        className="fixed right-0 top-1/3 z-40 -mr-2 rounded-l-full brand-gradient text-primary-foreground shadow-lg px-3 py-3 hover:pr-4 transition-[padding]"
        onClick={() => setOpen(true)}
      >
        <CalendarIcon className="h-5 w-5" />
      </button>

      {open && (
        <div className="fixed inset-0 z-50 bg-background/95 backdrop-blur">
          <div className="mx-auto max-w-6xl h-full p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-2xl font-semibold">Full Calendar - Meal Ideas</h2>
              <div className="flex items-center gap-2">
                <button className="px-3 py-1 rounded border" onClick={() => setOpen(false)}>
                  <X />
                </button>
              </div>
            </div>
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-[calc(100%-72px)]">
              <div className="col-span-1 lg:col-span-1">
                <Calendar
                  mode="single"
                  selected={selected}
                  onSelect={setSelected}
                  className="rounded-md border"
                />
              </div>
              <div className="col-span-2 overflow-auto">
                <h3 className="font-medium mb-3">Ideas for {selected?.toLocaleDateString()}</h3>
                <Separator />
                <div className="mt-4 grid gap-3">
                  {ideas.map((name) => (
                    <div key={name} className="flex items-center justify-between rounded-md border p-3">
                      <div>
                        <h4 className="font-semibold">{name}</h4>
                        <p className="text-sm text-muted-foreground">A tasty recipe idea for the day.</p>
                      </div>
                      <Badge variant="secondary">Idea</Badge>
                    </div>
                  ))}
                </div>

                <div className="mt-8">
                  <h4 className="font-semibold mb-2">All days this month</h4>
                  <ScrollArea className="h-56 p-2 border rounded">
                    <div className="grid grid-cols-2 gap-2">
                      {Array.from({ length: 28 }).map((_, i) => {
                        const d = new Date();
                        d.setDate(i + 1);
                        const forDay = ideasForDate(d);
                        return (
                          <div key={i} className="p-3 border rounded">
                            <div className="flex items-center justify-between mb-2">
                              <div className="text-sm font-medium">{d.toLocaleDateString()}</div>
                              <Badge variant="outline">{forDay.length} ideas</Badge>
                            </div>
                            <div className="text-sm text-muted-foreground">
                              {forDay.join(", ")}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </ScrollArea>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
