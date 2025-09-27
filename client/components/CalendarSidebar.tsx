import { useMemo, useState, useEffect, useRef } from "react";
import {
  Calendar as CalendarIcon,
  X,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { Separator } from "@/components/ui/separator";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { useSchedule } from "@/context/ScheduleContext";

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

function ideasForDate(d?: Date | null) {
  if (!d) return [];
  const day = d.getDate();
  const a = IDEAS[(day * 3) % IDEAS.length];
  const b = IDEAS[(day * 5 + 1) % IDEAS.length];
  return [a, b];
}

function startOfMonth(d: Date) {
  const t = new Date(d.getFullYear(), d.getMonth(), 1);
  return t;
}

function endOfMonth(d: Date) {
  return new Date(d.getFullYear(), d.getMonth() + 1, 0);
}

function startOfWeek(d: Date) {
  const day = d.getDay();
  const diff = d.getDate() - day;
  return new Date(d.getFullYear(), d.getMonth(), diff);
}

export default function CalendarSidebar() {
  const [open, setOpen] = useState(false);
  const [viewDate, setViewDate] = useState(new Date()); // month view
  const [selected, setSelected] = useState<Date | undefined>(new Date());
  const [pendingMeal, setPendingMeal] = useState<string | null>(null);
  const [pendingDate, setPendingDate] = useState<Date | null>(null);

  const { getMealsForDate, addScheduledMeal, scheduled } = useSchedule();

  useEffect(() => {
    function handler() {
      setOpen(true);
    }
    function scheduleHandler(e: Event) {
      const detail = (e as CustomEvent).detail as { meal: string } | undefined;
      if (detail?.meal) {
        setPendingMeal(detail.meal);
        setOpen(true);
      }
    }
    const names = [
      "open-full-calendar",
      "open-fullcalendar",
      "open-calendar",
      "openCalendar",
    ];
    for (const n of names) window.addEventListener(n, handler as EventListener);
    window.addEventListener("schedule-meal", scheduleHandler as EventListener);
    return () => {
      for (const n of names)
        window.removeEventListener(n, handler as EventListener);
      window.removeEventListener(
        "schedule-meal",
        scheduleHandler as EventListener,
      );
    };
  }, []);

  const today = new Date();

  // ref to the calendar grid (used to scroll to today's cell)
  const gridRef = useRef<HTMLDivElement | null>(null);

  const monthStart = startOfMonth(viewDate);
  const monthEnd = endOfMonth(viewDate);
  const daysInMonth = monthEnd.getDate();
  const leadingEmpty = monthStart.getDay();

  // build grid rows - each row is 7 cells
  const cells: (Date | null)[] = [];
  for (let i = 0; i < leadingEmpty; i++) cells.push(null);
  for (let d = 1; d <= daysInMonth; d++)
    cells.push(new Date(viewDate.getFullYear(), viewDate.getMonth(), d));
  // pad trailing
  while (cells.length % 7 !== 0) cells.push(null);

  const weeks: (Date | null)[][] = [];
  for (let i = 0; i < cells.length; i += 7) weeks.push(cells.slice(i, i + 7));

  const prevMonth = () =>
    setViewDate((d) => new Date(d.getFullYear(), d.getMonth() - 1, 1));
  const nextMonth = () =>
    setViewDate((d) => new Date(d.getFullYear(), d.getMonth() + 1, 1));

  function onDateClick(d: Date) {
    if (pendingMeal) {
      // set a pending date and let user choose slot
      setPendingDate(d);
      setSelected(new Date(d));
      return;
    }
    setSelected(new Date(d));
  }

  // When the calendar opens, snap the view to the current month and
  // scroll the today's cell (or selected cell) into center view.
  useEffect(() => {
    if (!open) return;

    // Ensure the month shown contains today (so today's cell is present)
    setViewDate(new Date());

    // Wait a tick for layout to settle, then scroll the element into view
    const t = setTimeout(() => {
      const root = gridRef.current;
      if (!root) return;
      // Prefer today's cell, fallback to selected cell
      const el =
        (root.querySelector('[data-today="true"]') as HTMLElement) ||
        (root.querySelector('[data-selected="true"]') as HTMLElement);
      if (el && typeof el.scrollIntoView === "function") {
        el.scrollIntoView({ behavior: "smooth", block: "center", inline: "center" });
      }
    }, 80);

    return () => clearTimeout(t);
  }, [open]);

  // Prevent the page behind the modal from scrolling while open
  useEffect(() => {
    if (open) {
      const prev = document.body.style.overflow;
      document.body.style.overflow = "hidden";
      return () => {
        document.body.style.overflow = prev || "";
      };
    }
    return;
  }, [open]);

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
        <div className="fixed inset-0 z-50 bg-background/100">
          <div className="mx-auto max-w-7xl h-full p-8">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-2xl font-semibold">
                Full Calendar - Meal Ideas
              </h2>
              <div className="flex items-center gap-2">
                {pendingMeal && (
                  <div className="text-sm text-muted-foreground">
                    Scheduling: {pendingMeal}
                  </div>
                )}
                <button
                  className="px-3 py-1 rounded border"
                  onClick={() => setOpen(false)}
                >
                  <X />
                </button>
              </div>
            </div>

            {/* On large screens show calendar left and details right */}
            <div className="flex flex-col lg:flex-row gap-6 h-[calc(100%-72px)]">
              {/* calendar column (left) */}
              <div className="lg:w-3/4 w-full overflow-visible">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <button
                      onClick={prevMonth}
                      className="px-2 py-1 rounded border"
                    >
                      <ChevronLeft />
                    </button>
                    <div className="font-medium">
                      {viewDate.toLocaleString(undefined, {
                        month: "long",
                        year: "numeric",
                      })}
                    </div>
                    <button
                      onClick={nextMonth}
                      className="px-2 py-1 rounded border"
                    >
                      <ChevronRight />
                    </button>
                  </div>
                </div>


                {/* weekday labels (separate row so they don't inherit the large auto-rows) */}
                <div className="grid grid-cols-7 gap-x-1 gap-y-0 text-sm">
                  {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map(
                    (d) => (
                      <div
                        key={d}
                        className="text-center text-xs text-muted-foreground py-0"
                      >
                        {d}
                      </div>
                    ),
                  )}
                </div>

                {/* day cells (use auto-rows for equal-height cells) */}
                <div ref={gridRef} className="grid grid-cols-7 gap-x-1 gap-y-1 text-sm auto-rows-[6.5rem]">
                  {weeks.map((week, wi) =>
                    week.map((day, di) => {
                      if (!day)
                        return (
                          <div
                            key={`empty-${wi}-${di}`}
                            className="min-h-[48px] p-2 rounded border bg-transparent"
                          />
                        );
                      const isToday =
                        day.toDateString() === new Date().toDateString();
                      const isSelected =
                        selected &&
                        day.toDateString() === selected.toDateString();
                      const meals = getMealsForDate(day);
                      return (
                        <div
                          key={day.toISOString()}
                          onClick={() => onDateClick(day)}
                          data-today={isToday}
                          data-selected={isSelected}
                          className={`p-1 rounded border ${isSelected ? "ring-2 ring-primary" : ""} ${isToday ? "bg-accent/20" : ""} cursor-pointer overflow-hidden h-full flex flex-col justify-between`}
                        >
                          <div className="flex items-center justify-between">
                            <div className="text-sm font-medium">
                              {day.getDate()}
                            </div>
                          </div>
                          <div className="mt-2 text-xs text-muted-foreground space-y-1">
                            {meals.slice(0, 2).map((m) => (
                              <div key={`${m.name}-${m.slot}`} className="truncate" title={m.name}>
                                {m.name}
                              </div>
                            ))}
                          </div>
                        </div>
                      );
                    }),
                  )}
                </div>
              </div>

              <div className="w-full overflow-auto flex-1">
                <h3 className="font-medium mb-3">
                  Details for {selected?.toLocaleDateString()}
                </h3>
                <Separator />
                <div className="mt-4 grid gap-3">
                  {/* show sloted meals */}
                  {selected &&
                    (() => {
                      const meals = getMealsForDate(selected);
                      const bySlot: Record<string, any[]> = {
                        breakfast: [],
                        lunch: [],
                        dinner: [],
                      };
                      meals.forEach((m) => bySlot[m.slot]?.push(m));
                      return (
                        <div className="space-y-3">
                          {(["breakfast", "lunch", "dinner"] as const).map(
                            (slot) => (
                              <div key={slot} className="rounded-md border p-3">
                                <div className="flex items-center justify-between">
                                  <h4 className="font-semibold">
                                    {slot[0].toUpperCase() + slot.slice(1)}
                                  </h4>
                                  <div className="text-sm text-muted-foreground">
                                    {bySlot[slot].length} items
                                  </div>
                                </div>
                                <div className="mt-2 space-y-2">
                                  {bySlot[slot].length === 0 && (
                                    <div className="text-sm text-muted-foreground">
                                      No meal
                                    </div>
                                  )}
                                  {bySlot[slot].map((m: any) => (
                                    <div
                                      key={m.name}
                                      className="flex items-center justify-between"
                                    >
                                      <div>
                                        <div className="font-medium">
                                          {m.name}
                                        </div>
                                        <div className="text-xs text-muted-foreground">
                                          {m.slot}
                                        </div>
                                      </div>
                                      <Badge variant="secondary">Planned</Badge>
                                    </div>
                                  ))}
                                </div>
                              </div>
                            ),
                          )}
                        </div>
                      );
                    })()}

                  {/* slot selection when pendingDate/pendingMeal */}
                  {pendingMeal && pendingDate && (
                    <div className="p-3 border rounded bg-secondary/20">
                      <div className="flex items-center justify-between mb-2">
                        <div>
                          <div className="text-sm font-medium">
                            Add "{pendingMeal}" to{" "}
                            {pendingDate.toLocaleDateString()}
                          </div>
                          <div className="text-xs text-muted-foreground">
                            Choose slot
                          </div>
                        </div>
                        <div className="flex gap-2">
                          <button
                            className="px-3 py-1 rounded bg-primary text-primary-foreground"
                            onClick={() => {
                              addScheduledMeal(
                                pendingDate,
                                pendingMeal,
                                "breakfast",
                              );
                              setPendingMeal(null);
                              setPendingDate(null);
                            }}
                          >
                            Breakfast
                          </button>
                          <button
                            className="px-3 py-1 rounded bg-primary text-primary-foreground"
                            onClick={() => {
                              addScheduledMeal(
                                pendingDate,
                                pendingMeal,
                                "lunch",
                              );
                              setPendingMeal(null);
                              setPendingDate(null);
                            }}
                          >
                            Lunch
                          </button>
                          <button
                            className="px-3 py-1 rounded bg-primary text-primary-foreground"
                            onClick={() => {
                              addScheduledMeal(
                                pendingDate,
                                pendingMeal,
                                "dinner",
                              );
                              setPendingMeal(null);
                              setPendingDate(null);
                            }}
                          >
                            Dinner
                          </button>
                          <button
                            className="px-3 py-1 rounded border"
                            onClick={() => {
                              setPendingMeal(null);
                              setPendingDate(null);
                            }}
                          >
                            Cancel
                          </button>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* This month's ideas removed per request */}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
