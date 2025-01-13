import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

// Test if domain matches pattern.
export function matchDomain(domain: string, pattern: string): boolean {
  return domain === pattern || domain.endsWith('.' + pattern);
}

// Compare semver version. Return true if v1 is greater than v2.
export function compareSemver(v1: string, v2: string): boolean {
  const [major1, minor1, patch1] = v1.split('.').map(Number);
  const [major2, minor2, patch2] = v2.split('.').map(Number);
  return major1 > major2 || (major1 === major2 && (minor1 > minor2 || (minor1 === minor2 && patch1 > patch2)));
}