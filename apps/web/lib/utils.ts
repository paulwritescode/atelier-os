import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/**
 * Generate a URL-friendly slug from a commission title.
 * e.g. "Wedding - James & Diana" → "wedding-james-and-diana-a1b2"
 *
 * Titles already follow "{Type} - {Client}" (Appendix §Naming Conventions), so
 * the type is not appended again — doing so produced slugs like
 * "gala-outfit-cor-galaoutfit-5a6a".
 *
 * A short random suffix keeps slugs unique without a DB roundtrip.
 */
export function generateProjectSlug(title: string): string {
  const base = title
    .toLowerCase()
    .replace(/&/g, "and")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    // Keep URLs readable
    .slice(0, 60)
    .replace(/-+$/, "")

  const suffix = Math.random().toString(16).slice(2, 6)
  return base ? `${base}-${suffix}` : `commission-${suffix}`
}
