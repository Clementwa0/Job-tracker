import { Link } from "react-router-dom";
import { ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { steps } from "@/constants";

const StepsSection = () => {
  return (
    <section className="py-16 sm:py-24 bg-gray-50 px-4 sm:px-6 lg:px-8">
      <div className="max-w-5xl mx-auto text-center">
        <div className="mb-16">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            How It Works
          </h2>

          <p className="text-gray-600">
            Three simple steps to get hired faster
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
          {steps.map((step, i) => (
            <div key={i}>
              <div className="w-16 h-16 mx-auto rounded-full bg-blue-900 text-white flex items-center justify-center text-2xl font-bold mb-6">
                {i + 1}
              </div>

              <h3 className="text-xl font-semibold mb-3">
                {step.title}
              </h3>

              <p className="text-gray-600">
                {step.description}
              </p>
            </div>
          ))}
        </div>

        <div className="mt-16 flex justify-center">
          <Button asChild size="lg">
            <Link to="/register" className="flex items-center gap-2">
              Start Free
              <ArrowRight className="h-5 w-5" />
            </Link>
          </Button>
        </div>
      </div>
    </section>
  );
};

export default StepsSection;