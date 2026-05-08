import { features } from "@/constants";

export default function FeaturesSection({ featuresRef }: any) {
  return (
    <section
      ref={featuresRef}
      className="py-16 sm:py-20 bg-white px-4 sm:px-6 lg:px-8"
    >
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-12 sm:mb-14">
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold mb-4 text-slate-900">
            Everything You Need to Stay Organized
          </h2>
          <p className="text-gray-600 max-w-2xl mx-auto text-base sm:text-lg">
            Built to keep your job hunt clean, focused, and stress-free.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
          {features.map((f: any, i: number) => (
            <div
              key={i}
              className="feature-card p-6 rounded-xl border border-gray-200 hover:shadow-xl transition-all duration-300 bg-white hover:-translate-y-1 hover:border-blue-300"
            >
              {f.icon && (
                <div className="w-12 h-12 bg-gradient-to-br from-blue-100 to-blue-50 rounded-lg flex items-center justify-center mb-4">
                  <f.icon className="h-6 w-6 text-blue-600" />
                </div>
              )}
              <h3 className="text-lg sm:text-xl font-semibold mb-3 text-slate-800">
                {f.title}
              </h3>
              <p className="text-gray-600 text-sm sm:text-base leading-relaxed">
                {f.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}