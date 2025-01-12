import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

// Match domain names with wildcard (`*`)
export function matchDomain(domain: string, pattern: string): boolean {
  // Convert patterns to regex-safe strings and replace * with regex pattern
  const escapeRegex = (str: string) => str.replaceAll(/[.*+?^${}()|[\]\\]/g, '\\$&').replaceAll('\\*', '.*')
  
  // Create regex pattern from the wildcard pattern
  const regexPattern = `^${escapeRegex(pattern)}$`
  
  // Create RegExp object and test the domain
  const regex = new RegExp(regexPattern)
  return regex.test(domain)
}

// Compare semver version. Return true if v1 is greater than v2.
export function compareSemver(v1: string, v2: string): boolean {
  const [major1, minor1, patch1] = v1.split('.').map(Number);
  const [major2, minor2, patch2] = v2.split('.').map(Number);
  return major1 > major2 || (major1 === major2 && (minor1 > minor2 || (minor1 === minor2 && patch1 > patch2)));
}