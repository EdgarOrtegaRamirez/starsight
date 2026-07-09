/** StarSight — GitHub API service */

import { Octokit } from '@octokit/rest';
import { StarredRepo } from '../types';
import { getToken } from './config';
import { validateToken } from '../utils';

let octokit: Octokit | null = null;

function getClient(): Octokit {
  if (!octokit) {
    const token = getToken();
    if (!token) {
      console.error('Error: No GitHub token configured. Run: starsight auth <token>');
      process.exit(1);
    }
    if (!validateToken(token)) {
      console.error('Error: Invalid GitHub token format. Use a classic (ghp_*) or fine-grained (github_pat_*) token.');
      process.exit(1);
    }
    octokit = new Octokit({ auth: token });
  }
  return octokit;
}

/** Reset the client (e.g., after auth change) */
export function resetClient(): void {
  octokit = null;
}

/** Test the provided token by fetching the authenticated user */
export async function testToken(token: string): Promise<{ login: string; name: string | null } | null> {
  try {
    const testOcto = new Octokit({ auth: token });
    const { data } = await testOcto.rest.users.getAuthenticated();
    return { login: data.login, name: data.name };
  } catch {
    return null;
  }
}

/** Fetch all starred repos for a user with pagination */
export async function fetchAllStars(username: string): Promise<StarredRepo[]> {
  const client = getClient();
  const repos: StarredRepo[] = [];
  let page = 1;
  let hasMore = true;

  while (hasMore) {
    const { data, headers } = await client.rest.activity.listReposStarredByUser({
      username,
      per_page: 100,
      page,
      direction: 'desc',
      sort: 'created',
    });

    if (!Array.isArray(data)) break;

    for (const item of data) {
      if ('full_name' in item) {
        repos.push({
          id: item.id,
          fullName: item.full_name,
          name: item.name,
          owner: item.owner?.login || 'unknown',
          description: item.description || null,
          htmlUrl: item.html_url,
          language: item.language || null,
          stars: item.stargazers_count || 0,
          forks: item.forks_count || 0,
          topics: item.topics || [],
          starredAt: (item as any).starred_at || new Date().toISOString(),
          updatedAt: item.updated_at || new Date().toISOString(),
          tags: [],
        });
      }
    }

    hasMore = headers.link?.includes('rel="next"') ?? false;
    page++;
  }

  return repos;
}

/** Search repos from cached data with filters */
export function searchRepos(
  repos: StarredRepo[],
  query: string,
  filters: {
    language?: string;
    topic?: string;
    tag?: string;
    minStars?: number;
  } = {}
): StarredRepo[] {
  const q = query.toLowerCase();

  let filtered = repos.filter((r) => {
    // Full text search
    if (q) {
      const searchable = [
        r.name,
        r.fullName,
        r.description || '',
        r.owner,
        ...r.topics,
        r.language || '',
      ]
        .join(' ')
        .toLowerCase();
      if (!searchable.includes(q)) return false;
    }

    // Language filter
    if (filters.language && r.language?.toLowerCase() !== filters.language.toLowerCase()) {
      return false;
    }

    // Topic filter
    if (filters.topic) {
      const topicLower = filters.topic.toLowerCase();
      if (!r.topics.some((t) => t.toLowerCase().includes(topicLower))) return false;
    }

    // Tag filter
    if (filters.tag) {
      const tagLower = filters.tag.toLowerCase();
      if (!r.tags.some((t) => t.toLowerCase().includes(tagLower))) return false;
    }

    // Min stars filter
    if (filters.minStars && r.stars < filters.minStars) return false;

    return true;
  });

  // Sort by starred date (newest first)
  filtered.sort((a, b) => new Date(b.starredAt).getTime() - new Date(a.starredAt).getTime());

  return filtered;
}

/** Get language statistics */
export function getLanguageStats(repos: StarredRepo[]): Array<{ language: string; count: number }> {
  const stats = new Map<string, number>();
  for (const r of repos) {
    const lang = r.language || 'Unknown';
    stats.set(lang, (stats.get(lang) || 0) + 1);
  }
  return Array.from(stats.entries())
    .map(([language, count]) => ({ language, count }))
    .sort((a, b) => b.count - a.count);
}