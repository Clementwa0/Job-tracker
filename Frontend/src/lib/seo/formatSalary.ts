export function formatSalaryRange(
  min?: number,
  max?: number,
  currency = "USD",
): string | null {
  if (min == null && max == null) return null;

  const fmt = (n: number) =>
    new Intl.NumberFormat("en-US", {
      style: "currency",
      currency,
      maximumFractionDigits: 0,
    }).format(n);

  if (min != null && max != null) return `${fmt(min)} – ${fmt(max)}`;
  if (min != null) return `From ${fmt(min)}`;
  return `Up to ${fmt(max!)}`;
}

export function formatJobType(type: string): string {
  return type
    .split("-")
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join("-");
}

export function formatWorkMode(mode: string): string {
  if (mode === "onsite") return "On-site";
  return mode.charAt(0).toUpperCase() + mode.slice(1);
}
