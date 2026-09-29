export function normalizePath(path: string) {
  if (!path) return "/";
  const stripped = path.split("?")[0].split("#")[0];
  return stripped.replace(/\/+$/, "") || "/";
}

export function isRouteActive(pathname: string, href: string, exact = false) {
  const current = normalizePath(pathname);
  const target = normalizePath(href);
  if (exact) return current === target;
  return current === target || current.startsWith(`${target}/`);
}

export function getInitials(name: string | undefined | null, fallback: string) {
  if (!name?.trim()) return fallback;
  return name
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((part) => part.charAt(0))
    .join("")
    .toUpperCase();
}
