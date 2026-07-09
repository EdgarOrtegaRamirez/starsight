/** StarSight — export command: export starred repos to various formats */

import chalk from 'chalk';
import * as fs from 'node:fs';
import { getRepos, getTags } from '../services/config';
import { FilterOptions } from '../types';
import { searchRepos } from '../services/github';
import { sanitizeCSV, formatNumber } from '../utils';

export function exportCommand(format: string, output: string | undefined, options: FilterOptions): void {
  let repos = getRepos();
  if (repos.length === 0) {
    console.log(chalk.yellow('No stars cached. Run: starsight sync'));
    return;
  }

  if (options.query) {
    repos = searchRepos(repos, options.query, {
      language: options.language,
      topic: options.topic,
      tag: options.tag,
      minStars: options.minStars,
    });
  }

  const tags = getTags();
  const tagMap = new Map<string, string[]>();
  for (const tag of tags) {
    for (const repoId of tag.repoIds) {
      if (!tagMap.has(repoId.toString())) tagMap.set(repoId.toString(), []);
      tagMap.get(repoId.toString())!.push(tag.name);
    }
  }

  let content: string;
  switch (format) {
    case 'json':
      content = exportJSON(repos, tagMap);
      break;
    case 'csv':
      content = exportCSV(repos, tagMap);
      break;
    case 'markdown':
    case 'md':
      content = exportMarkdown(repos, tagMap);
      break;
    default:
      console.log(chalk.red(`Unsupported format: ${format}. Use: json, csv, markdown`));
      return;
  }

  if (output) {
    const outPath = output;
    fs.writeFileSync(outPath, content, 'utf-8');
    console.log(chalk.green(`✓ Exported ${repos.length} repos to ${outPath}`));
  } else {
    console.log(content);
  }
}

function exportJSON(repos: any[], tagMap: Map<string, string[]>): string {
  const data = repos.map((r) => ({
    name: r.fullName,
    url: r.htmlUrl,
    description: r.description,
    language: r.language,
    stars: r.stars,
    forks: r.forks,
    topics: r.topics,
    starredAt: r.starredAt,
    tags: tagMap.get(r.id.toString()) || [],
  }));
  return JSON.stringify(data, null, 2);
}

function exportCSV(repos: any[], tagMap: Map<string, string[]>): string {
  const header = 'name,url,description,language,stars,forks,topics,tags,starred_at';
  const rows = repos.map((r) => {
    const tags = (tagMap.get(r.id.toString()) || []).join(';');
    return [
      sanitizeCSV(r.fullName),
      sanitizeCSV(r.htmlUrl),
      sanitizeCSV(r.description || ''),
      sanitizeCSV(r.language || ''),
      r.stars.toString(),
      r.forks.toString(),
      sanitizeCSV(r.topics.join(';')),
      sanitizeCSV(tags),
      r.starredAt,
    ].join(',');
  });
  return [header, ...rows].join('\n');
}

function exportMarkdown(repos: any[], tagMap: Map<string, string[]>): string {
  const lines: string[] = [
    '# StarSight Export\n',
    `Exported on ${new Date().toISOString().split('T')[0]}\n`,
    `Total: ${repos.length} repos\n`,
    '---\n',
  ];

  for (const repo of repos) {
    const tags = tagMap.get(repo.id.toString()) || [];
    const tagStr = tags.length > 0 ? ` *[${tags.join(', ')}]*` : '';
    lines.push(`## [${repo.fullName}](${repo.htmlUrl})${tagStr}`);
    if (repo.description) lines.push(`\n${repo.description}`);
    lines.push(`\n- ⭐ ${formatNumber(repo.stars)}  ·  🍴 ${formatNumber(repo.forks)}  ·  🔤 ${repo.language || 'N/A'}`);
    if (repo.topics.length > 0) lines.push(`- 🏷 ${repo.topics.join(', ')}`);
    lines.push('');
  }

  return lines.join('\n');
}