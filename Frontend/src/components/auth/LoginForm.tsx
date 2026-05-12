import { loginFeatures } from "@/constants/features";

export default function LoginFeatures() {
  return (
    <ul className="space-y-6">
      {loginFeatures.map((item) => {
        const Icon = item.icon;

        return (
          <li key={item.title} className="flex items-start space-x-3">
            <Icon className="w-5 h-5 mt-1 text-white" />

            <div>
              <h3 className="font-semibold">{item.title}</h3>
              <p className="text-white/70 text-sm">{item.description}</p>
            </div>
          </li>
        );
      })}
    </ul>
  );
}