/** StarSight — Utility functions */

import chalk from 'chalk';

/** Format a date string to a human-readable relative time */
export function relativeTime(dateStr: string): string {
  const date = new Date(dateStr);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffSec = Math.floor(diffMs / 1000);
  const diffMin = Math.floor(diffSec / 60);
  const diffHour = Math.floor(diffMin / 60);
  const diffDay = Math.floor(diffHour / 24);

  if (diffSec < 60) return 'just now';
  if (diffMin < 60) return `${diffMin}m ago`;
  if (diffHour < 24) return `${diffHour}h ago`;
  if (diffDay < 30) return `${diffDay}d ago`;
  if (diffDay < 365) return `${Math.floor(diffDay / 30)}mo ago`;
  return `${Math.floor(diffDay / 365)}y ago`;
}

/** Format a number with K/M suffix */
export function formatNumber(n: number): string {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1_000) return `${(n / 1_000).toFixed(1)}K`;
  return n.toString();
}

/** Language color mapping for terminal output */
const LANGUAGE_COLORS: Record<string, string> = {
  TypeScript: '#3178C6',
  JavaScript: '#F7DF1E',
  Python: '#3572A5',
  Go: '#00ADD8',
  Rust: '#DEA584',
  Java: '#B07219',
  'C++': '#F34B7D',
  C: '#555555',
  Ruby: '#701516',
  Shell: '#89E051',
  HTML: '#E34F26',
  CSS: '#563D7C',
  PHP: '#4F5D95',
  Swift: '#F05138',
  Kotlin: '#A97BFF',
  Dart: '#00B4AB',
  Scala: '#C22D40',
  Elixir: '#4E2A5E',
  Lua: '#000080',
  R: '#198CE7',
  Haskell: '#5E5086',
};

/** Get the chalk color for a language */
export function languageColor(lang: string | null): string {
  if (!lang) return chalk.gray('Unknown');
  const hex = LANGUAGE_COLORS[lang] || '#666666';
  return chalk.hex(hex)(lang);
}

/** Sanitize a string for CSV output */
export function sanitizeCSV(val: string): string {
  if (val.includes(',') || val.includes('"') || val.includes('\n')) {
    return `"${val.replace(/"/g, '""')}"`;
  }
  return val;
}

/** Validate a GitHub personal access token format */
export function validateToken(token: string): boolean {
  // GitHub PATs: classic (ghp_*) or fine-grained (github_pat_*)
  return /^(ghp_|github_pat_|gho_|ghu_|ghs_|ghr_)[a-zA-Z0-9]{36,}$/.test(token);
}

/** Truncate text with ellipsis */
export function truncate(text: string, maxLen: number): string {
  if (text.length <= maxLen) return text;
  return text.slice(0, maxLen - 3) + '...';
}