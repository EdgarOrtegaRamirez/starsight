/**
 * StarSight — Tests for config service
 */

import * as fs from 'node:fs';
import * as path from 'node:path';
import * as os from 'node:os';
import {
  getToken, setToken, getUsername, setUsername,
  getRepos, setRepos, addRepos, clearRepos,
  getTags, setTags, addTag, removeTag, tagRepo, untagRepo,
  getLastSync, setLastSync, clearCache,
} from '../src/services/config';

// Clean up config between tests
beforeEach(() => {
  clearCache();
});

afterAll(() => {
  clearCache();
});

describe('config token management', () => {
  const savedToken = process.env.GITHUB_TOKEN;
  const configDir = path.join(os.homedir(), '.config', 'starsight');
  const configFile = path.join(configDir, 'config.json');

  beforeAll(() => {
    delete process.env.GITHUB_TOKEN;
  });

  beforeEach(() => {
    clearCache();
    if (fs.existsSync(configFile)) {
      const cfg = JSON.parse(fs.readFileSync(configFile, 'utf-8'));
      delete cfg.token;
      delete cfg.username;
      fs.writeFileSync(configFile, JSON.stringify(cfg, null, 2));
    }
  });

  afterEach(() => {
    if (savedToken !== undefined && savedToken !== null) {
      process.env.GITHUB_TOKEN=savedToken   }
  });

  it('starts with empty token', () => {
    expect(getToken()).toBe('');
  });

  it('stores and retrieves token', () => {
    setToken('ghp_te...8901');
    expect(getToken()).toBe('ghp_te...8901');
  });

  it('reads GITHUB_TOKEN env var', () => {
    process.env.GITHUB_TOKEN = 'ghp_en...9012';
    clearCache(); // reset stored token
    expect(getToken()).toBe('ghp_en...9012');
    delete process.env.GITHUB_TOKEN;
  });
});

describe('config username management', () => {
  beforeEach(() => {
    clearCache();
  });

  it('stores and retrieves username', () => {
    setUsername('testuser');
    expect(getUsername()).toBe('testuser');
  });

  it('overwrites existing username', () => {
    setUsername('first');
    setUsername('second');
    expect(getUsername()).toBe('second');
  });
});

describe('config repo management', () => {
  const sampleRepo = {
    id: 1,
    fullName: 'test/repo',
    name: 'repo',
    owner: 'test',
    description: 'A test repo',
    htmlUrl: 'https://github.com/test/repo',
    language: 'TypeScript',
    stars: 100,
    forks: 10,
    topics: ['testing'],
    starredAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-01-02T00:00:00Z',
    tags: [],
  };

  beforeEach(() => {
    clearCache();
  });

  it('starts with empty repos', () => {
    expect(getRepos()).toEqual([]);
  });

  it('stores and retrieves repos', () => {
    setRepos([sampleRepo]);
    const repos = getRepos();
    expect(repos).toHaveLength(1);
    expect(repos[0].id).toBe(1);
  });

  it('adds new repos without duplicates', () => {
    setRepos([sampleRepo]);
    addRepos([sampleRepo]);  // duplicate
    expect(getRepos()).toHaveLength(1);

    addRepos([{ ...sampleRepo, id: 2, fullName: 'test/repo2', name: 'repo2' }]);
    expect(getRepos()).toHaveLength(2);
  });
});

describe('config tag management', () => {
  beforeEach(() => {
    clearCache();
  });

  it('starts with empty tags', () => {
    expect(getTags()).toEqual([]);
  });

  it('adds a tag with repo IDs', () => {
    addTag('learning', [1, 2, 3]);
    const tags = getTags();
    expect(tags).toHaveLength(1);
    expect(tags[0].name).toBe('learning');
    expect(tags[0].repoIds).toEqual([1, 2, 3]);
  });

  it('merges repo IDs when adding existing tag', () => {
    addTag('learning', [1, 2]);
    addTag('learning', [3, 4]);
    const tags = getTags();
    expect(tags).toHaveLength(1);
    expect(tags[0].repoIds.sort()).toEqual([1, 2, 3, 4]);
  });

  it('removes a tag', () => {
    addTag('learning', [1]);
    addTag('work', [2]);
    removeTag('learning');
    expect(getTags()).toHaveLength(1);
    expect(getTags()[0].name).toBe('work');
  });

  it('tags and untags a specific repo', () => {
    tagRepo('urgent', 42);
    expect(getTags()[0].repoIds).toContain(42);

    untagRepo('urgent', 42);
    expect(getTags()).toHaveLength(0);
  });
});

describe('config sync timestamps', () => {
  beforeEach(() => {
    clearCache();
  });

  it('stores last sync timestamp', () => {
    setLastSync('2024-06-01T00:00:00Z');
    expect(getLastSync()).toBe('2024-06-01T00:00:00Z');
  });
});