const steps = [
  { n: "01", title: "Capture", desc: "Save any role from any job board with one click. Jobtrail auto-fills the details." },
  { n: "02", title: "Organize", desc: "Move applications through your pipeline. Add notes, contacts, and documents as you go." },
  { n: "03", title: "Follow up", desc: "Get reminded at the right moment. Track outcomes. Watch your response rate climb." },
  { n: "04", title: "Land it", desc: "Compare offers side-by-side. Negotiate with confidence. Sign the one that fits." },
];

export default function StepsSection() {
  return (
    <section className="bg-background py-24">
      <div className="container mx-auto px-6">
        <div className="mx-auto mb-16 max-w-2xl text-center">
          <p className="mb-3 text-sm font-semibold uppercase tracking-wider text-primary">How it works</p>
          <h2 className="text-4xl font-bold md:text-5xl">From scattered tabs to signed offer</h2>
        </div>

        <div className="relative mx-auto max-w-5xl">
          <div className="absolute left-1/2 top-0 hidden h-full w-px -translate-x-1/2 bg-gradient-to-b from-transparent via-border to-transparent md:block" />
          <div className="space-y-12">
            {steps.map((s, i) => (
              <div key={s.n} className={`flex flex-col gap-6 md:flex-row md:items-center ${i % 2 ? "md:flex-row-reverse" : ""}`}>
                <div className="flex-1">
                  <div className="rounded-2xl border border-border bg-card p-8 shadow-sm">
                    <div className="mb-3 font-mono text-xs text-primary">{s.n}</div>
                    <h3 className="mb-2 text-2xl font-semibold">{s.title}</h3>
                    <p className="text-muted-foreground">{s.desc}</p>
                  </div>
                </div>
                <div className="relative hidden h-12 w-12 shrink-0 items-center justify-center md:flex">
                  <div className="absolute inset-0 rounded-full bg-primary opacity-10 blur-md" />
                  <div className="relative h-3 w-3 rounded-full bg-primary shadow-sm" />
                </div>
                <div className="hidden flex-1 md:block" />
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
