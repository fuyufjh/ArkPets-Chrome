import { describe, it, expect } from 'vitest'
import { compareSemver, matchDomain } from './utils'

describe('match function', () => {
  it('returns true if domain matches pattern exactly', () => {
    expect(matchDomain('www.google.com', 'www.google.com')).toBe(true)
  })

  it('returns true if domain ends with pattern', () => {
    expect(matchDomain('www.google.com', 'google.com')).toBe(true)
    expect(matchDomain('www.google.com', 'com')).toBe(true)
  })

  it('returns false if domain does not match pattern', () => {
    expect(matchDomain('www.google.com', 'ogle.com')).toBe(false)
    expect(matchDomain('www.google.com', 'www.google')).toBe(false)
    expect(matchDomain('google.com', 'www.google.com')).toBe(false)
  })
}) 

describe('compareSemver', () => {
  it('returns true if v1 is greater than v2', () => {
    expect(compareSemver('1.0.0', '0.9.9')).toBe(true)
  })

  it('returns true if v1 is greater than v2', () => {
    expect(compareSemver('1.1.0', '1.0.0')).toBe(true)
  })

  it('returns true if v1 is greater than v2', () => {
    expect(compareSemver('1.1.0', '1.0.1')).toBe(true)
  })

  it('returns false if v1 is less than v2', () => {
    expect(compareSemver('0.9.9', '1.0.0')).toBe(false)
  })

  it('returns false if v1 is equal to v2', () => {
    expect(compareSemver('1.0.0', '1.0.0')).toBe(false)
  })
})
