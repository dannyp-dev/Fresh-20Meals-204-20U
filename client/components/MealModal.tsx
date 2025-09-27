import { useEffect, useState } from "react";
import { X } from "lucide-react";

export default function MealModal({ open, onClose, meal }: { open: boolean; onClose: () => void; meal?: { name: string; description?: string; tags?: string[]; calories?: number } }) {
  const [imgState, setImgState] = useState<{ url?: string; loading: boolean; error?: string; debug?: any; cached?: boolean }>({ loading: false });
  const [showDebug, setShowDebug] = useState(false);

  // In-memory cache (module-level static via closure). Key: meal name lowercased
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const memoryCache = (globalThis as any).__MEAL_IMAGE_CACHE__ || ((globalThis as any).__MEAL_IMAGE_CACHE__ = new Map<string,string>());

  function getLocalKey(name: string) { return `meal_image_${name.toLowerCase()}`; }

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  // Fetch AI-generated image when meal changes & modal opens
  useEffect(() => {
    if (!open || !meal) return;
    let cancelled = false;
    async function load() {
      const key = meal.name.toLowerCase();
      // 1. Memory cache first
      if (memoryCache.has(key)) {
        setImgState({ loading: false, url: memoryCache.get(key), cached: true });
        return;
      }
      // 2. localStorage cache
      try {
        const stored = localStorage.getItem(getLocalKey(meal.name));
        if (stored) {
          memoryCache.set(key, stored);
          setImgState({ loading: false, url: stored, cached: true });
          return;
        }
      } catch {/* ignore quota / access errors */}

      setImgState({ loading: true });
      try {
        const resp = await fetch('/api/meals/image', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ mealName: meal.name, description: meal.description })
        });
        const data = await resp.json();
        if (cancelled) return;
        if (data.imageDataUrl) {
          // persist caches
            memoryCache.set(key, data.imageDataUrl);
            try { localStorage.setItem(getLocalKey(meal.name), data.imageDataUrl); } catch {/* ignore quota */}
          setImgState({ loading: false, url: data.imageDataUrl, cached: false });
        } else {
          setImgState({ loading: false, error: data.error || 'No image generated', debug: data.debug });
        }
      } catch (err: any) {
        if (cancelled) return;
        setImgState({ loading: false, error: err?.message || 'Failed to load image' });
      }
    }
    load();
    return () => { cancelled = true; };
  }, [open, meal?.name]);

  if (!open || !meal) return null;

  return (
    <div className="fixed inset-0 z-60 grid place-items-center bg-black/40">
      <div className="w-full max-w-3xl bg-card rounded-lg overflow-hidden">
        <div className="flex items-center justify-between p-4 border-b">
          <h3 className="text-lg font-semibold">{meal.name}</h3>
          <button onClick={onClose} className="p-1 rounded hover:bg-secondary/40"><X /></button>
        </div>
        <div className="p-4 grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="md:col-span-1">
            {imgState.loading && (
              <div className="w-full h-48 flex items-center justify-center text-sm text-muted-foreground border rounded animate-pulse">Generating image...</div>
            )}
            {!imgState.loading && imgState.url && (
              <div className="relative">
                <img src={imgState.url} alt={meal.name} className="w-full h-48 object-cover rounded" />
              </div>
            )}
            {!imgState.loading && !imgState.url && (
              <div className="w-full h-48 flex flex-col items-center justify-center text-xs text-muted-foreground border rounded p-2 text-center gap-2">
                <div>{imgState.error ? `Image unavailable: ${imgState.error}` : 'No image'}</div>
                {imgState.debug && (
                  <button className="underline" onClick={() => setShowDebug(v => !v)}>
                    {showDebug ? 'Hide debug' : 'Show debug'}
                  </button>
                )}
              </div>
            )}
          </div>
          <div className="md:col-span-2">
            <div className="flex items-center justify-between mb-3">
              <div className="text-sm text-muted-foreground">Estimated calories</div>
              <div className="font-semibold">{meal.calories ?? Math.floor(400 + Math.random() * 400)} kcal</div>
            </div>
            <p className="text-sm text-muted-foreground mb-4">This recipe uses: {(meal.tags || []).join(", ")}</p>
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
            {showDebug && imgState.debug && (
              <pre className="mt-4 max-h-48 overflow-auto text-[10px] bg-muted p-2 rounded border">
                {JSON.stringify(imgState.debug, null, 2)}
              </pre>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
