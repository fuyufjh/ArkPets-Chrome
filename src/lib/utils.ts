import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function matchDomain(domain: string, pattern: string) {
  // Convert pattern to regex by escaping special chars and converting * to .*
  const patternToRegex = (pattern: string): string => {
    return pattern
      .replace(/[.+?^${}()|[\]\\]/g, '\\$&') // Escape special regex chars
      .replace(/\*/g, '.*'); // Convert * to .*
  }

  // Handle the case where pattern doesn't start with * but should still match subdomain-less version
  if (!pattern.startsWith('*') && !pattern.startsWith('.')) {
    pattern = `(.*\\.)?${pattern}`;
  }

  const regex = new RegExp(`^${patternToRegex(pattern)}$`);
  return regex.test(domain);
}
