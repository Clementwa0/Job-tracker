import { ArrowRight} from "lucide-react";
import { Button } from "@/components/ui/button";
import  TypingText  from "./TypingText";
import DashboardPreview from "./DashboardPreview";
import { Link } from "react-router-dom";

export default function HeroSection() {
  return (
    <section className="relative overflow-hidden bg-background pt-20 pb-24">
      <div className="container mx-auto px-6">
        <div className="mx-auto max-w-3xl text-center">
          <h1 className="text-5xl font-bold leading-[1.05] md:text-7xl">
            Track every job.<br />
            Land your{" "}
            <TypingText words={["dream role.", "next offer.", "perfect fit.", "career move."]} />
          </h1>
          <p className="mx-auto mt-6 max-w-xl text-lg text-muted-foreground">
            Jobtrail is the calm, beautifully organized way to manage your job search -
            from first application to signed offer.
          </p>
          <div className="mt-8 flex flex-wrap justify-center gap-3">
            <Button asChild size="lg" className="bg-primary text-primary-foreground shadow-md hover:bg-primary/90">
              <Link to="/register" className="flex items-center">
                Start tracking free
                <ArrowRight className="ml-1 h-4 w-4" />
              </Link>
            </Button>
            <Button asChild size="lg" variant="outline">
              <Link to="/jobs">Browse open jobs</Link>
            </Button>
          </div>
          <p className="mt-4 text-xs text-muted-foreground">Free forever · No credit card required</p>
        </div>
        <div className="mt-20">
          <DashboardPreview />
        </div>
      </div>
    </section>
  );
}
