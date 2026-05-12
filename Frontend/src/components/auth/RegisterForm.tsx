import { register as registerFeatures } from "@/constants";

export default function RegisterFeatures({
  featureRefs,
}: {
  featureRefs: React.MutableRefObject<(HTMLDivElement | null)[]>;
}) {
  return (
    <div className="grid gap-3 pt-2">
      {registerFeatures.map((feature, index) => {
        const Icon = feature.icon;

        return (
          <div
            key={feature.title}
            ref={(el) => (featureRefs.current[index] = el)}
            className="flex items-center gap-3 glass-panel rounded-lg p-3"
          >
            <div className="w-9 h-9 flex items-center justify-center bg-white/10 rounded-md">
              <Icon className="w-4 h-4 text-white" />
            </div>

            <div>
              <h3 className="text-sm text-white font-medium">
                {feature.title}
              </h3>
              <p className="text-xs text-white/70 truncate">
                {feature.desc}
              </p>
            </div>
          </div>
        );
      })}
    </div>
  );
}