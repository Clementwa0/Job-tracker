import { features } from "@/constants";

export default function FeaturesSection() {

  return (
    <section id="features" className="bg-background py-24">
      <div className="container mx-auto px-6">

        <div className="mx-auto mb-16 max-w-2xl text-center">
          <h2 className="text-4xl font-bold md:text-5xl">
            Everything you need, nothing you don’t
          </h2>
        </div>

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {features.map((f) => {
            const Icon = f.icon;

            return (
              <div
                key={f.title}
                className="rounded-2xl border border-border bg-card p-6 shadow-sm transition hover:-translate-y-1 hover:shadow-md"
              >
                <div className="mb-4 inline-flex h-11 w-11 items-center justify-center rounded-xl bg-primary text-primary-foreground">
                  <Icon className="h-5 w-5" />
                </div>

                <h3 className="mb-2 text-lg font-semibold">
                  {f.title}
                </h3>

                <p className="text-sm text-muted-foreground">
                  {f.description}
                </p>
              </div>
            );
          })}
        </div>

      </div>
    </section>
  );
}