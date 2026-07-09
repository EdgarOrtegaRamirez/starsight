/**
 * StarSight — Tests for GitHub API service
 */

import { searchRepos, getLanguageStats } from '../src/services/github';
import { StarredRepo } from '../src/types';

const mockRepos: StarredRepo[] = [
  {
    id: 1,
    fullName: 'user/typescript-starter',
    name: 'typescript-starter',
    owner: 'user',
    description: 'A starter template for TypeScript projects',
    htmlUrl: 'https://github.com/user/typescript-starter',
    language: 'TypeScript',
    stars: 1500,
    forks: 200,
    topics: ['typescript', 'starter', 'template'],
    starredAt: '2026-01-15T10:00:00Z',
    updatedAt: '2026-06-01T10:00:00Z',
    tags: ['frontend'],
  },
  {
    id: 2,
    fullName: 'user/rust-toolkit',
    name: 'rust-toolkit',
    owner: 'user',
    description: 'A comprehensive Rust toolkit for CLI apps',
    htmlUrl: 'https://github.com/user/rust-toolkit',
    language: 'Rust',
    stars: 3500,
    forks: 450,
    topics: ['rust', 'cli', 'toolkit'],
    starredAt: '2026-02-20T10:00:00Z',
    updatedAt: '2026-05-15T10:00:00Z',
    tags: ['backend', 'favorite'],
  },
  {
    id: 3,
    fullName: 'user/ml-lib',
    name: 'ml-lib',
    owner: 'user',
    description: 'Machine learning library in Python',
    htmlUrl: 'https://github.com/user/ml-lib',
    language: 'Python',
    stars: 8500,
    forks: 1200,
    topics: ['machine-learning', 'python', 'ai'],
    starredAt: '2026-03-10T10:00:00Z',
    updatedAt: '2026-06-10T10:00:00Z',
    tags: ['ai', 'learning'],
  },
  {
    id: 4,
    fullName: 'user/go-server',
    name: 'go-server',
    owner: 'user',
    description: 'HTTP server framework in Go',
    htmlUrl: 'https://github.com/user/go-server',
    language: 'Go',
    stars: 2200,
    forks: 300,
    topics: ['go', 'http', 'server'],
    starredAt: '2026-04-05T10:00:00Z',
    updatedAt: '2026-06-05T10:00:00Z',
    tags: ['backend'],
  },
  {
    id: 5,
    fullName: 'user/react-ui',
    name: 'react-ui',
    owner: 'user',
    description: 'React component library',
    htmlUrl: 'https://github.com/user/react-ui',
    language: 'TypeScript',
    stars: 5200,
    forks: 800,
    topics: ['react', 'typescript', 'ui'],
    starredAt: '2026-05-01T10:00:00Z',
    updatedAt: '2026-06-12T10:00:00Z',
    tags: ['frontend', 'favorite'],
  },
];

describe('searchRepos', () => {
  it('returns all repos for empty query', () => {
    const results = searchRepos(mockRepos, '');
    expect(results).toHaveLength(5);
  });

  it('filters by search query in name', () => {
    const results = searchRepos(mockRepos, 'typescript');
    expect(results).toHaveLength(2); // typescript-starter + react-ui (has TypeScript in desc/topics)
  });

  it('filters by search query in description', () => {
    const results = searchRepos(mockRepos, 'starter');
    expect(results).toHaveLength(1);
    expect(results[0].name).toBe('typescript-starter');
  });

  it('filters by language', () => {
    const results = searchRepos(mockRepos, '', { language: 'TypeScript' });
    expect(results).toHaveLength(2);
    expect(results.every((r) => r.language === 'TypeScript')).toBe(true);
  });

  it('filters by topic', () => {
    const results = searchRepos(mockRepos, '', { topic: 'machine-learning' });
    expect(results).toHaveLength(1);
    expect(results[0].name).toBe('ml-lib');
  });

  it('filters by tag', () => {
    const results = searchRepos(mockRepos, '', { tag: 'favorite' });
    expect(results).toHaveLength(2);
    expect(results.map((r) => r.name).sort()).toEqual(['react-ui', 'rust-toolkit']);
  });

  it('filters by minimum stars', () => {
    const results = searchRepos(mockRepos, '', { minStars: 5000 });
    expect(results).toHaveLength(2);
    expect(results.map((r) => r.name).sort()).toEqual(['ml-lib', 'react-ui']);
  });

  it('combines multiple filters', () => {
    const results = searchRepos(mockRepos, '', {
      language: 'TypeScript',
      minStars: 1000,
    });
    expect(results).toHaveLength(2);
  });

  it('searches within query combined with filters', () => {
    const results = searchRepos(mockRepos, 'rust', { language: 'Rust' });
    expect(results).toHaveLength(1);
    expect(results[0].name).toBe('rust-toolkit');
  });

  it('sorts by starred date (newest first)', () => {
    const results = searchRepos(mockRepos, '');
    expect(results[0].starredAt).toBe('2026-05-01T10:00:00Z');
    expect(results[results.length - 1].starredAt).toBe('2026-01-15T10:00:00Z');
  });

  it('returns empty array when no matches', () => {
    const results = searchRepos(mockRepos, 'nonexistent');
    expect(results).toHaveLength(0);
  });
});

describe('getLanguageStats', () => {
  it('returns sorted language frequency', () => {
    const stats = getLanguageStats(mockRepos);
    expect(stats[0].language).toBe('TypeScript'); // 2 repos
    expect(stats[0].count).toBe(2);
    expect(stats).toHaveLength(4); // TS, Rust, Python, Go
  });

  it('includes all languages present', () => {
    const stats = getLanguageStats(mockRepos);
    const languages = stats.map((s) => s.language);
    expect(languages).toContain('TypeScript');
    expect(languages).toContain('Rust');
    expect(languages).toContain('Python');
    expect(languages).toContain('Go');
  });
});