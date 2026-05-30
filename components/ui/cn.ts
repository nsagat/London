// Minimal className combiner (no clsx dependency needed for the MVP).
export function cn(...parts: (string | false | null | undefined)[]): string {
  return parts.filter(Boolean).join(" ");
}
