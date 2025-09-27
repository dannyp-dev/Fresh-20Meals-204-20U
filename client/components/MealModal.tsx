import { useEffect } from "react";
import { X } from "lucide-react";

export default function MealModal({ open, onClose, meal }: { open: boolean; onClose: () => void; meal?: { name: string; tags?: string[]; calories?: number } }) {
  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  if (!open || !meal) return null;

  const image = `https://source.unsplash.com/800x600/?${encodeURIComponent(meal.name)}&food`;

  return (
    <div className="fixed inset-0 z-60 grid place-items-center bg-black/40">
      <div className="w-full max-w-3xl bg-card rounded-lg overflow-hidden">
        <div className="flex items-center justify-between p-4 border-b">
          <h3 className="text-lg font-semibold">{meal.name}</h3>
          <button onClick={onClose} className="p-1 rounded hover:bg-secondary/40"><X /></button>
        </div>
        <div className="p-4 grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="md:col-span-1">
            <img src={image} alt={meal.name} className="w-full h-48 object-cover rounded" />
          </div>
          <div className="md:col-span-2">
            <div className="flex items-center justify-between mb-3">
              <div className="text-sm text-muted-foreground">Estimated calories</div>
              <div className="font-semibold">{meal.calories ?? Math.floor(400 + Math.random() * 400)} kcal</div>
            </div>
            <p className="text-sm text-muted-foreground mb-4">This recipe uses: {(meal.tags || []).join(", ")}.</p>
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <div className="text-sm">Time</div>
                <div className="text-sm text-muted-foreground">~30 mins</div>
              </div>
              <div className="flex items-center justify-between">
                <div className="text-sm">Difficulty</div>
                <div className="text-sm text-muted-foreground">Easy</div>
              </div>
              <div className="flex items-center justify-between">
                <div className="text-sm">Servings</div>
                <div className="text-sm text-muted-foreground">2</div>
              </div>
            </div>
            <div className="mt-4">
              <button className="px-4 py-2 bg-primary text-primary-foreground rounded mr-2">Start Cooking</button>
              <button className="px-4 py-2 border rounded" onClick={onClose}>Close</button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
