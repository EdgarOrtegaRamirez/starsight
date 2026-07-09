/** StarSight — Global type definitions */

/** A GitHub starred repository */
export interface StarredRepo {
  id: number;
  fullName: string;
  name: string;
  owner: string;
  description: string | null;
  htmlUrl: string;
  language: string | null;
  stars: number;
  forks: number;
  topics: string[];
  starredAt: string;
  updatedAt: string;
  tags: string[];
}

/** User-defined tag applied to repos */
export interface Tag {
  name: string;
  color?: string;
  repoIds: number[];
}

/** Local configuration schema */
export interface StarSightConfig {
  /** GitHub personal access token */
  token?: string;
  /** GitHub username */
  username?: string;
  /** Last sync timestamp */
  lastSync?: string;
  /** Cached repos */
  repos: StarredRepo[];
  /** User-defined tags */
  tags: Tag[];
  /** Filter preferences */
  defaultLanguage?: string;
}

/** Export output format */
export type ExportFormat = 'json' | 'csv' | 'markdown';

/** CLI filter options */
export interface FilterOptions {
  language?: string;
  topic?: string;
  tag?: string;
  starredBefore?: string;
  starredAfter?: string;
  minStars?: number;
  query?: string;
}