/**
 * Browser-visible API origin. Empty string = same origin (Ingress routes /api to backend).
 * Local dev with split ports: set NEXT_PUBLIC_API_URL=http://localhost:4000
 */
export function apiBase(): string {
  if (typeof window !== "undefined") {
    return (process.env.NEXT_PUBLIC_API_URL ?? "").replace(/\/$/, "");
  }
  return (process.env.NEXT_PUBLIC_API_URL ?? "").replace(/\/$/, "");
}

export function apiUrl(path: string): string {
  const p = path.startsWith("/") ? path : `/${path}`;
  const base = apiBase();
  if (!base) return p;
  return `${base}${p}`;
}
