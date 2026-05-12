import { register as registerFeatures } from "@/constants/features";

type Props = {
  featureRefs: React.MutableRefObject<(HTMLDivElement | null)[]>;
};

export default function RegisterFeatures({ featureRefs }: Props) {
  return (
    <ul className="space-y-8 mt-10">
      {registerFeatures.map((item, index) => {
        const Icon = item.icon;
        return (
          <li key={item.title} className="flex items-start space-x-4">
            <div
              ref={(el) => {
                featureRefs.current[index] = el;
              }}
              className="flex items-start space-x-4"
            >
              <Icon className="w-6 h-6 mt-0.5 text-white shrink-0" />
              <div>
                <h3 className="font-semibold text-white">{item.title}</h3>
                <p className="text-white/70 text-sm">{item.desc}</p>
              </div>
            </div>
          </li>
        );
      })}
    </ul>
  );
}
