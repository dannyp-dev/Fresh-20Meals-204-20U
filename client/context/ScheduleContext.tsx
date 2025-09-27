import { createContext, useContext, useEffect, useMemo, useState, ReactNode } from "react";

type DateKey = string; // yyyy-mm-dd

function toKey(d: Date) {
  return d.toISOString().slice(0, 10);
}

type MealSlot = "breakfast" | "lunch" | "dinner";

interface ScheduledItem {
  name: string;
  slot: MealSlot;
}

interface ScheduleCtx {
  scheduled: Record<DateKey, ScheduledItem[]>;
  addScheduledMeal: (date: Date, meal: string, slot: MealSlot) => void;
  removeScheduledMeal: (date: Date, meal: string, slot?: MealSlot) => void;
  getMealsForDate: (date: Date) => ScheduledItem[];
}

const Ctx = createContext<ScheduleCtx | null>(null);

export function ScheduleProvider({ children }: { children: ReactNode }) {
  const [scheduled, setScheduled] = useState<Record<DateKey, ScheduledItem[]>>({});

  useEffect(() => {
    const raw = localStorage.getItem("scheduled_meals");
    if (raw) setScheduled(JSON.parse(raw));
  }, []);

  useEffect(() => {
    localStorage.setItem("scheduled_meals", JSON.stringify(scheduled));
  }, [scheduled]);

  const addScheduledMeal = (date: Date, meal: string, slot: MealSlot) => {
    const key = toKey(date);
    setScheduled((s) => ({
      ...s,
      [key]: Array.from(new Set([...(s[key] || []), { name: meal, slot }].map((i) => JSON.stringify(i)))).map((j) => JSON.parse(j) as ScheduledItem),
    }));
  };

  const removeScheduledMeal = (date: Date, meal: string, slot?: MealSlot) => {
    const key = toKey(date);
    setScheduled((s) => ({
      ...s,
      [key]: (s[key] || []).filter((m) => !(m.name === meal && (slot ? m.slot === slot : true))),
    }));
  };

  const getMealsForDate = (date: Date) => scheduled[toKey(date)] || [];

  const value = useMemo(() => ({ scheduled, addScheduledMeal, removeScheduledMeal, getMealsForDate }), [scheduled]);

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export function useSchedule() {
  const ctx = useContext(Ctx);
  if (!ctx) throw new Error("useSchedule must be used within ScheduleProvider");
  return ctx;
}
