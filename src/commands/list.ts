/** StarSight — list command: display starred repos */

import chalk from 'chalk';
import { StarredRepo, FilterOptions } from '../types';
import { searchRepos } from '../services/github';
import { getRepos, getTags } from '../services/config';
import { relativeTime, formatNumber, languageColor, truncate } from '../utils';

export function listCommand(options: FilterOptions): void {
  const repos = getRepos();

  if (repos.length === 0) {
    console.log(chalk.yellow('No stars cached. Run: starsight sync'));
    return;
  }

  const filtered = options.query
    ? searchRepos(repos, options.query, {
        language: options.language,
        topic: options.topic,
        tag: options.tag,
        minStars: options.minStars,
      })
    : applyFilters(repos, options);

  if (filtered.length === 0) {
    console.log(chalk.yellow('No repos match your filters.'));
    return;
  }

  const tags = getTags();
  const tagMap = new Map<string, string[]>();
  for (const tag of tags) {
    for (const repoId of tag.repoIds) {
      if (!tagMap.has(repoId.toString())) tagMap.set(repoId.toString(), []);
      tagMap.get(repoId.toString())!.push(tag.name);
    }
  }

  console.log(chalk.bold(`\n  ${chalk.cyan('★')} ${filtered.length} starred repos\n`));

  for (const repo of filtered) {
    const tagsForRepo = tagMap.get(repo.id.toString()) || [];
    const tagStr = tagsForRepo.length > 0
      ? ' ' + tagsForRepo.map((t) => chalk.bgBlue.white(` ${t} `)).join(' ')
      : '';

    console.log(
      `  ${chalk.bold(chalk.cyan(repo.fullName))} ${chalk.yellow('★')}${formatNumber(repo.stars)}`
    );
    if (repo.description) {
      console.log(`  ${truncate(repo.description, 80)}`);
    }
    console.log(
      `  ${languageColor(repo.language)}  ·  ${chalk.gray('starred')} ${chalk.gray(relativeTime(repo.starredAt))}  ·  ${chalk.gray('updated')} ${chalk.gray(relativeTime(repo.updatedAt))}${tagStr}`
    );
    if (repo.topics.length > 0) {
      console.log(`  ${repo.topics.slice(0, 5).map((t) => chalk.hex('#0366d6')(`#${t}`)).join(' ')}`);
    }
    console.log('');
  }
}

function applyFilters(repos: StarredRepo[], options: FilterOptions): StarredRepo[] {
  return searchRepos(repos, '', {
    language: options.language,
    topic: options.topic,
    tag: options.tag,
    minStars: options.minStars,
  });
}