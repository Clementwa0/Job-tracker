import { Link } from "react-router-dom";
import { ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";

const CTASection = () => {
  return (
    <section className="py-20 px-4 bg-white">
      <div className="max-w-5xl mx-auto">
        <div className="bg-gradient-to-r from-blue-600 to-green-500 rounded-3xl p-1 shadow-2xl">
          <div className="bg-white rounded-3xl px-8 py-10 md:px-12 md:py-14 flex flex-col md:flex-row items-center justify-between gap-6">
            <div>
              <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-3">
                Ready to transform your job search?
              </h2>

              <p className="text-gray-600 text-base md:text-lg">
                Start tracking applications, interviews, and offers in one
                place.
              </p>
            </div>

            <Button asChild size="lg" className="shrink-0">
              <Link
                to="/register"
                className="flex items-center gap-2"
              >
                Start Free
                <ArrowRight className="h-5 w-5" />
              </Link>
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
};

export default CTASection;