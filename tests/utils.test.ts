/**
 * StarSight — Tests for utility functions
 */

import { relativeTime, formatNumber, validateToken, sanitizeCSV, truncate, languageColor } from '../src/utils';

describe('relativeTime', () => {
  it('returns "just now" for recent dates', () => {
    expect(relativeTime(new Date().toISOString())).toBe('just now');
  });

  it('returns minutes for recent times', () => {
    const fiveMinAgo = new Date(Date.now() - 5 * 60 * 1000).toISOString();
    expect(relativeTime(fiveMinAgo)).toBe('5m ago');
  });

  it('returns hours for older dates', () => {
    const threeHoursAgo = new Date(Date.now() - 3 * 60 * 60 * 1000).toISOString();
    expect(relativeTime(threeHoursAgo)).toBe('3h ago');
  });

  it('returns days for very old dates', () => {
    const fiveDaysAgo = new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString();
    expect(relativeTime(fiveDaysAgo)).toBe('5d ago');
  });

  it('returns months for dates over 30 days', () => {
    const twoMonthsAgo = new Date(Date.now() - 65 * 24 * 60 * 60 * 1000).toISOString();
    expect(relativeTime(twoMonthsAgo)).toBe('2mo ago');
  });
});

describe('formatNumber', () => {
  it('formats numbers under 1000 as-is', () => {
    expect(formatNumber(42)).toBe('42');
    expect(formatNumber(999)).toBe('999');
  });

  it('formats thousands with K suffix', () => {
    expect(formatNumber(1500)).toBe('1.5K');
    expect(formatNumber(10000)).toBe('10.0K');
  });

  it('formats millions with M suffix', () => {
    expect(formatNumber(2000000)).toBe('2.0M');
    expect(formatNumber(1500000)).toBe('1.5M');
  });
});

describe('validateToken', () => {
  it('validates classic ghp_ tokens', () => {
    expect(validateToken('ghp_' + 'a'.repeat(36))).toBe(true);
    expect(validateToken('ghp_' + 'A1b2C3d4E5f6G7h8I9j0K1l2M3n4O5p6Q7r8S9t0U1v2')).toBe(true);
  });

  it('validates fine-grained github_pat_ tokens', () => {
    expect(validateToken('github_pat_' + 'a'.repeat(36))).toBe(true);
  });

  it('rejects invalid tokens', () => {
    expect(validateToken('not-a-token')).toBe(false);
    expect(validateToken('')).toBe(false);
    expect(validateToken('ghp_too_short')).toBe(false);
  });
});

describe('sanitizeCSV', () => {
  it('wraps fields containing commas in quotes', () => {
    expect(sanitizeCSV('hello, world')).toBe('"hello, world"');
  });

  it('wraps fields containing double quotes', () => {
    expect(sanitizeCSV('say "hello"')).toBe('"say \"\"hello\"\""');
  });

  it('does not wrap simple fields', () => {
    expect(sanitizeCSV('hello')).toBe('hello');
  });
});

describe('truncate', () => {
  it('returns full text if within limit', () => {
    expect(truncate('hello', 10)).toBe('hello');
  });

  it('truncates with ellipsis', () => {
    expect(truncate('hello world this is long', 15)).toBe('hello world ...');
  });
});

describe('languageColor', () => {
  it('returns gray for unknown languages', () => {
    const result = languageColor(null);
    expect(result).toContain('Unknown');
  });

  it('returns colored output for known languages', () => {
    const result = languageColor('TypeScript');
    expect(result).toContain('TypeScript');
    expect(result).not.toContain('Unknown');
  });
});