/** StarSight — tag command: manage tags on starred repos */

import chalk from 'chalk';
import { getRepos, getTags, addTag, removeTag, tagRepo, untagRepo } from '../services/config';

export function tagListCommand(): void {
  const tags = getTags();
  if (tags.length === 0) {
    console.log(chalk.yellow('No tags defined. Use: starsight tag add <name> <repo-id>'));
    return;
  }

  console.log(chalk.bold(`\n  ${chalk.cyan('🏷')} ${tags.length} tags\n`));
  for (const tag of tags) {
    const color = tag.color ? chalk.hex(tag.color) : chalk.blue;
    console.log(`  ${color(tag.name)} — ${tag.repoIds.length} repo(s)`);
  }
  console.log('');
}

export function tagAddCommand(name: string, repoIds: number[], color?: string): void {
  addTag(name, repoIds, color);
  console.log(chalk.green(`✓ Tag "${name}" added to ${repoIds.length} repo(s).`));
}

export function tagRemoveCommand(name: string): void {
  removeTag(name);
  console.log(chalk.green(`✓ Tag "${name}" removed.`));
}

export function tagSetCommand(name: string, repoId: number): void {
  tagRepo(name, repoId);
  console.log(chalk.green(`✓ Tag "${name}" set on repo #${repoId}.`));
}

export function tagUnsetCommand(name: string, repoId: number): void {
  untagRepo(name, repoId);
  console.log(chalk.green(`✓ Tag "${name}" removed from repo #${repoId}.`));
}

export function tagReposCommand(name: string, query: string): void {
  const repos = getRepos();
  const q = query.toLowerCase();
  const matched = repos.filter((r) => {
    const searchable = [r.name, r.fullName, r.description || '', r.owner, ...r.topics, r.language || '']
      .join(' ')
      .toLowerCase();
    return searchable.includes(q);
  });

  if (matched.length === 0) {
    console.log(chalk.yellow(`No repos match "${query}".`));
    return;
  }

  const repoIds = matched.map((r) => r.id);
  addTag(name, repoIds);
  console.log(chalk.green(`✓ Tag "${name}" added to ${matched.length} repo(s) matching "${query}".`));
}