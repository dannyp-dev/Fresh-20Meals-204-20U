import IngredientList from "@/components/IngredientList";

export default function Index() {
  return (
    <main>
      <Hero />
      <IngredientList />
    </main>
  );
}

function Hero() {
  return (
    <section className="relative overflow-hidden">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-10">
        <div className="rounded-2xl bg-gradient-to-br from-primary/10 to-accent/10 border p-8 md:p-12">
          <h1 className="text-2xl md:text-4xl font-extrabold tracking-tight mb-3">
            Plan meals faster. Shop smarter.
          </h1>
          <p className="text-muted-foreground max-w-2xl">
            Search ingredients in the center bar, tick what you have, and open the right-side planner to see recipe ideas by day.
          </p>
        </div>
      </div>
    </section>
  );
}
