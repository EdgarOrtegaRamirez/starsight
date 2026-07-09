/** StarSight — search command */

import chalk from 'chalk';
import { FilterOptions } from '../types';
import { searchRepos } from '../services/github';
import { getRepos, getTags } from '../services/config';
import { relativeTime, formatNumber, languageColor, truncate } from '../utils';

export function searchCommand(query: string, options: FilterOptions): void {
  if (!query) {
    console.log(chalk.yellow('Please provide a search query. Usage: starsight search <query>'));
    return;
  }

  const repos = getRepos();
  if (repos.length === 0) {
    console.log(chalk.yellow('No stars cached. Run: starsight sync'));
    return;
  }

  const results = searchRepos(repos, query, {
    language: options.language,
    topic: options.topic,
    tag: options.tag,
    minStars: options.minStars,
  });

  if (results.length === 0) {
    console.log(chalk.yellow(`No repos match "${query}".`));
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

  console.log(chalk.bold(`\n  ${chalk.cyan('★')} Found ${results.length} repos matching "${chalk.italic(query)}"\n`));

  for (const repo of results) {
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
      `  ${languageColor(repo.language)}  ·  ${chalk.gray('starred')} ${chalk.gray(relativeTime(repo.starredAt))}${tagStr}`
    );
    console.log('');
  }
}