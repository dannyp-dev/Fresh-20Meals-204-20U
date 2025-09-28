import RecommendedMeals from "@/components/RecommendedMeals";

export default function Index() {
  return (
    <main>
      <Hero />
      <RecommendedMeals />
    </main>
  );
}

function Hero() {
  return (
  <section className="relative overflow-hidden surface-hero rounded-none">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-10">
  <div className="rounded-2xl surface-hero border p-8 md:p-12 flex items-center gap-6 gradient-border">
          <div className="flex-1">
            <h1 className="text-2xl md:text-4xl font-extrabold tracking-tight mb-3">
              Plan meals faster. Shop smarter.
            </h1>
            <p className="text-muted-foreground max-w-2xl">
              Search ingredients in the center bar and add them to your grocery
              bag. Below are recommended meals chosen by our kitchen AI — meals
              you could make, even if you don't have every ingredient yet.
            </p>
          </div>
          <div className="w-80 hidden md:flex items-center justify-center">
            <div className="grid grid-cols-2 gap-2 w-full">
              <img
                src="/images/1.jpeg"
                onError={(e) => ((e.currentTarget as HTMLImageElement).src = '/placeholder.svg')}
                alt="photo-1"
                className="w-full h-36 object-cover rounded-lg shadow"
              />
              <img
                src="/images/2.jpeg"
                onError={(e) => ((e.currentTarget as HTMLImageElement).src = '/placeholder.svg')}
                alt="photo-2"
                className="w-full h-36 object-cover rounded-lg shadow"
              />
              <img
                src="/images/3.jpeg"
                onError={(e) => ((e.currentTarget as HTMLImageElement).src = '/placeholder.svg')}
                alt="photo-3"
                className="w-full h-36 object-cover rounded-lg shadow"
              />
              <img
                src="/images/4.jpeg"
                onError={(e) => ((e.currentTarget as HTMLImageElement).src = '/placeholder.svg')}
                alt="photo-4"
                className="w-full h-36 object-cover rounded-lg shadow"
              />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
