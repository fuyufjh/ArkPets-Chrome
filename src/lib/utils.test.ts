import { describe, it, expect } from 'vitest'
import { matchDomain } from './utils'

describe('match function', () => {
  it('matches exact domains', () => {
    expect(matchDomain('www.google.com', 'www.google.com')).toBe(true)
  })

  it('matches wildcard subdomains', () => {
    expect(matchDomain('www.google.com', '*.google.com')).toBe(true)
  })

  it('does not match when subdomain is missing', () => {
    expect(matchDomain('www.google.com', 'google.com')).toBe(false)
  })

  it('matches multiple wildcards', () => {
    expect(matchDomain('www.google.com', '*.google.*')).toBe(true)
    expect(matchDomain('www.google.com', 'www.*.com')).toBe(true)
  })

  it('does not match different TLDs', () => {
    expect(matchDomain('www.google.com', 'google.us')).toBe(false)
  })

  it('matches wildcard TLD', () => {
    expect(matchDomain('www.google.com', '*.com')).toBe(true)
  })

  it('matches universal wildcard', () => {
    expect(matchDomain('www.google.com', '*')).toBe(true)
  })
}) 