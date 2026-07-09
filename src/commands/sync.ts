/** StarSight — sync command: fetch all starred repos from GitHub */

import chalk from 'chalk';
import { fetchAllStars, resetClient } from '../services/github';
import { getRepos, setRepos, setLastSync, getUsername, getToken, clearRepos } from '../services/config';
import { relativeTime, formatNumber } from '../utils';
import { StarredRepo } from '../types';

export async function syncCommand(options: { clear?: boolean; username?: string }): Promise<void> {
  const username = options.username || getUsername();
  const token = getToken();

  if (!username) {
    console.log(chalk.red('Error: No username configured.'));
    console.log('  Set username:  starsight auth --username <your-github-username>');
    console.log('  Or pass it:    starsight sync --username <your-github-username>');
    return;
  }

  if (!token) {
    console.log(chalk.red('Error: No GitHub token configured.'));
    console.log('  Set token:    starsight auth <github-token>');
    return;
  }

  if (options.clear) {
    clearRepos();
    resetClient();
    console.log(chalk.yellow('Cache cleared.'));
  }

  console.log(chalk.blue(`Fetching starred repos for ${chalk.bold(username)}...`));

  try {
    const before = getRepos().length;
    const repos = await fetchAllStars(username);
    setRepos(repos);
    setLastSync(new Date().toISOString());

    const after = repos.length;
    const newCount = after - before;

    console.log(chalk.green(`\n✓ Synced ${after} starred repos.`));
    if (newCount > 0 && before > 0) {
      console.log(chalk.gray(`  ${newCount} new, ${before} cached`));
    }

    // Summary
    const languages = new Set(repos.map((r) => r.language || 'Unknown'));
    const totalStars = repos.reduce((sum, r) => sum + r.stars, 0);
    console.log(chalk.gray(`  ${languages.size} languages, ★${formatNumber(totalStars)} total stars`));

    // Display the most recent stars
    if (repos.length > 0) {
      const recent = repos.slice(0, 5);
      console.log(chalk.bold('\n  Most recent stars:'));
      for (const r of recent) {
        console.log(`  ${chalk.cyan(r.fullName)} ${chalk.yellow(`★${formatNumber(r.stars)}`)}`);
      }
    }
  } catch (err: any) {
    if (err.status === 401) {
      console.log(chalk.red('\n✗ Authentication failed. Your token may be invalid.'));
      console.log('  Run: starsight auth <token>');
    } else if (err.status === 403) {
      console.log(chalk.red('\n✗ Rate limited. Try again later.'));
    } else if (err.status === 404) {
      console.log(chalk.red(`\n✗ User "${username}" not found.`));
    } else {
      console.log(chalk.red(`\n✗ Sync failed: ${err.message}`));
    }
  }
}

export async function syncIncremental(username: string): Promise<{ repos: StarredRepo[]; newCount: number }> {
  const repos = await fetchAllStars(username);
  const existing = getRepos();
  const existingIds = new Set(existing.map((r) => r.id));
  const newRepos = repos.filter((r) => !existingIds.has(r.id));

  if (newRepos.length > 0) {
    setRepos(repos);
    setLastSync(new Date().toISOString());
  }

  return { repos, newCount: newRepos.length };
}