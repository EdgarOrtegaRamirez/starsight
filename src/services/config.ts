/** StarSight — JSON file-based config storage (zero dependencies) */

import * as fs from 'node:fs';
import * as path from 'node:path';
import * as os from 'node:os';
import { StarSightConfig, StarredRepo, Tag } from '../types';

const CONFIG_DIR = path.join(os.homedir(), '.config', 'starsight');
const CONFIG_FILE = path.join(CONFIG_DIR, 'config.json');

function ensureDir(): void {
  if (!fs.existsSync(CONFIG_DIR)) {
    fs.mkdirSync(CONFIG_DIR, { recursive: true });
  }
}

function load(): StarSightConfig {
  ensureDir();
  try {
    if (fs.existsSync(CONFIG_FILE)) {
      const raw = fs.readFileSync(CONFIG_FILE, 'utf-8');
      return JSON.parse(raw) as StarSightConfig;
    }
  } catch {
    // Corrupted config — start fresh
  }
  return { repos: [], tags: [] };
}

function save(config: StarSightConfig): void {
  ensureDir();
  fs.writeFileSync(CONFIG_FILE, JSON.stringify(config, null, 2), 'utf-8');
}

export function getToken(): string {
  return process.env.GITHUB_TOKEN || load().token || '';
}

export function setToken(token: string): void {
  const config = load();
  config.token = token;
  save(config);
}

export function getUsername(): string {
  return load().username || '';
}

export function setUsername(username: string): void {
  const config = load();
  config.username = username;
  save(config);
}

export function getRepos(): StarredRepo[] {
  return load().repos || [];
}

export function setRepos(repos: StarredRepo[]): void {
  const config = load();
  config.repos = repos;
  save(config);
}

export function addRepos(newRepos: StarredRepo[]): void {
  const config = load();
  const existingIds = new Set((config.repos || []).map((r) => r.id));
  const toAdd = newRepos.filter((r) => !existingIds.has(r.id));
  config.repos = [...(config.repos || []), ...toAdd];
  save(config);
}

export function clearRepos(): void {
  const config = load();
  config.repos = [];
  save(config);
}

export function getTags(): Tag[] {
  return load().tags || [];
}

export function setTags(tags: Tag[]): void {
  const config = load();
  config.tags = tags;
  save(config);
}

export function addTag(name: string, repoIds: number[], color?: string): void {
  const config = load();
  const tags = config.tags || [];
  const existing = tags.findIndex((t) => t.name === name);
  if (existing >= 0) {
    // Merge repo IDs
    const merged = new Set([...tags[existing].repoIds, ...repoIds]);
    tags[existing].repoIds = Array.from(merged);
    if (color) tags[existing].color = color;
  } else {
    tags.push({ name, repoIds, color });
  }
  config.tags = tags;
  save(config);
}

export function removeTag(name: string): void {
  const config = load();
  config.tags = (config.tags || []).filter((t) => t.name !== name);
  save(config);
}

export function tagRepo(tagName: string, repoId: number): void {
  const config = load();
  const tags = config.tags || [];
  const tag = tags.find((t) => t.name === tagName);
  if (tag) {
    if (!tag.repoIds.includes(repoId)) {
      tag.repoIds.push(repoId);
    }
  } else {
    tags.push({ name: tagName, repoIds: [repoId] });
  }
  config.tags = tags;
  save(config);
}

export function untagRepo(tagName: string, repoId: number): void {
  const config = load();
  const tags = config.tags || [];
  const tag = tags.find((t) => t.name === tagName);
  if (tag) {
    tag.repoIds = tag.repoIds.filter((id) => id !== repoId);
    // Clean up empty tags
    config.tags = tags.filter((t) => t.repoIds.length > 0);
  }
  save(config);
}

export function getLastSync(): string {
  return load().lastSync || '';
}

export function setLastSync(date: string): void {
  const config = load();
  config.lastSync = date;
  save(config);
}

export function clearCache(): void {
  const config = load();
  config.repos = [];
  config.tags = [];
  config.lastSync = '';
  save(config);
}