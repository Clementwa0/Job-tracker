import { steps } from "@/constants";

export default function StepsSection({ stepsRef }: any) {
  return (
    <section
      ref={stepsRef}
      className="py-16 sm:py-24 bg-gray-50 px-4 sm:px-6 lg:px-8"
    >
      <div className="max-w-5xl mx-auto text-center">
        <div className="mb-12 sm:mb-16">
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-gray-800 mb-4">
            How It Works
          </h2>
          <p className="text-gray-600 text-base sm:text-lg">
            Three simple steps to get hired faster
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 md:gap-10 relative">
          {steps.map((step: any, i: number) => (
            <div key={i} className="step-item text-center relative">
              {i < steps.length - 1 && (
                <div className="hidden md:block absolute top-8 left-[60%] w-[100%] h-0.5 bg-gray-300" />
              )}
              <div className="w-16 h-16 mx-auto rounded-full bg-blue-900 text-white flex items-center justify-center text-2xl font-bold mb-6 shadow-lg relative z-10">
                {i + 1}
              </div>
              <h3 className="text-lg sm:text-xl font-semibold text-gray-800 mb-3">
                {step.title}
              </h3>
              <p className="text-gray-600 text-sm sm:text-base leading-relaxed">
                {step.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}