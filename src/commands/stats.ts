/** StarSight — stats command: show insights about starred repos */

import chalk from 'chalk';
import { getRepos, getTags } from '../services/config';
import { getLanguageStats } from '../services/github';
import { formatNumber } from '../utils';

export function statsCommand(): void {
  const repos = getRepos();
  if (repos.length === 0) {
    console.log(chalk.yellow('No stars cached. Run: starsight sync'));
    return;
  }

  const tags = getTags();
  const languageStats = getLanguageStats(repos);

  // Calculate various stats
  const totalStars = repos.reduce((sum, r) => sum + r.stars, 0);
  const totalForks = repos.reduce((sum, r) => sum + r.forks, 0);
  const languages = new Set(repos.map((r) => r.language || 'Unknown'));
  const allTopics = new Set(repos.flatMap((r) => r.topics));
  const avgStars = totalStars / repos.length;
  const mostStarred = repos.reduce((max, r) => (r.stars > (max?.stars || 0) ? r : max), repos[0]);
  const oldestStar = repos.reduce((old, r) => (new Date(r.starredAt) < new Date(old.starredAt) ? r : old), repos[0]);

  console.log(chalk.bold(`\n  ${chalk.cyan('★')} StarSight Stats\n`));

  // Overview
  console.log(chalk.bold('  Overview'));
  console.log(`  Total repos:     ${chalk.white.bold(repos.length)}`);
  console.log(`  Total stars:     ${chalk.yellow(formatNumber(totalStars))}`);
  console.log(`  Total forks:     ${formatNumber(totalForks)}`);
  console.log(`  Avg stars/repo:  ${avgStars.toFixed(1)}`);
  console.log(`  Languages:       ${languages.size}`);
  console.log(`  Topics:          ${allTopics.size}`);
  console.log(`  Tags:            ${tags.length}`);
  console.log('');

  // Top languages
  console.log(chalk.bold('  Languages'));
  const maxCount = languageStats[0]?.count || 1;
  for (const { language, count } of languageStats.slice(0, 10)) {
    const barLen = Math.round((count / maxCount) * 30);
    const bar = '█'.repeat(barLen);
    const lang = language === 'Unknown' ? chalk.gray('Unknown') : chalk.white(language);
    console.log(`  ${lang.padEnd(18)} ${chalk.gray(bar)} ${count} (${((count / repos.length) * 100).toFixed(1)}%)`);
  }
  console.log('');

  // Top starred
  console.log(chalk.bold('  Most Starred'));
  console.log(`  ${chalk.cyan(mostStarred.fullName)} ${chalk.yellow(`★${formatNumber(mostStarred.stars)}`)}`);
  if (mostStarred.description) {
    console.log(`  ${mostStarred.description.slice(0, 80)}`);
  }
  console.log('');

  // Tags summary
  if (tags.length > 0) {
    console.log(chalk.bold('  Tags'));
    for (const tag of tags) {
      console.log(`  ${chalk.blue(tag.name)} — ${tag.repoIds.length} repo(s)`);
    }
    console.log('');
  }

  // Sync info
  console.log(chalk.bold('  Sync'));
  console.log(`  First starred:   ${oldestStar.starredAt.split('T')[0]} (${oldestStar.fullName})`);
  console.log(`  Last starred:    ${repos[0]?.starredAt.split('T')[0] || 'N/A'}`);
  console.log('');
}