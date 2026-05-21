import { ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function CTASection() {
  return (
    <section className="py-24">
      <div className="container mx-auto px-6">
        <div className="relative mx-auto max-w-4xl overflow-hidden rounded-3xl border border-border bg-gradient-to-br from-primary/10 via-background to-muted p-12 text-center shadow-xl md:p-16">

          {/* subtle glow background */}
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(0,0,0,0.05),transparent_60%)] dark:bg-[radial-gradient(circle_at_top,rgba(255,255,255,0.06),transparent_60%)]" />

          <div className="relative">
            <h2 className="text-3xl font-bold text-foreground md:text-5xl">
              Your next role is closer than you think.
            </h2>

            <p className="mx-auto mt-4 max-w-lg text-muted-foreground">
              Join 12,000+ job seekers who turned chaos into clarity with JobTrail.
            </p>

            <div className="mt-8 flex justify-center">
              <Button size="lg" className="gap-2">
                Start tracking free
                <ArrowRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}