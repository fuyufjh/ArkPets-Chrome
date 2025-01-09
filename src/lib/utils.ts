import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

// Match domain names with wildcard (`*`)
export function matchDomain(domain: string, pattern: string): boolean {
  // Convert patterns to regex-safe strings and replace * with regex pattern
  const escapeRegex = (str: string) => str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&').replace('\\*', '.*')
  
  // Create regex pattern from the wildcard pattern
  const regexPattern = `^${escapeRegex(pattern)}$`
  
  // Create RegExp object and test the domain
  const regex = new RegExp(regexPattern)
  return regex.test(domain)
}
