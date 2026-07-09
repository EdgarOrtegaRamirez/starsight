#!/usr/bin/env node

/**
 * StarSight — GitHub Star Manager CLI
 *
 * List, search, tag, and export your GitHub starred repos with style.
 */

import { Command } from 'commander';
import chalk from 'chalk';
import { listCommand } from './commands/list';
import { searchCommand } from './commands/search';
import { tagListCommand, tagAddCommand, tagRemoveCommand, tagSetCommand, tagUnsetCommand, tagReposCommand } from './commands/tag';
import { exportCommand } from './commands/export';
import { statsCommand } from './commands/stats';
import { syncCommand } from './commands/sync';
import { setToken, setUsername, getToken, getUsername, clearCache } from './services/config';
import { testToken, resetClient } from './services/github';

const program = new Command();

program
  .name('starsight')
  .description('GitHub Star Manager CLI — manage your starred repos with style')
  .version('1.0.0');

// ── auth ──────────────────────────────────────────────
program
  .command('auth')
  .description('Configure GitHub authentication')
  .argument('[token]', 'GitHub personal access token')
  .option('-u, --username <username>', 'GitHub username')
  .action(async (token: string | undefined, options: { username?: string }) => {
    if (token) {
      console.log(chalk.blue('Validating token...'));
      const user = await testToken(token);
      if (user) {
        setToken(token);
        if (!getUsername() || options.username) {
          setUsername(options.username || user.login);
        }
        console.log(chalk.green(`✓ Authenticated as ${chalk.bold(user.login)}${user.name ? ` (${user.name})` : ''}`));
      } else {
        console.log(chalk.red('✗ Invalid token. Generate one at https://github.com/settings/tokens'));
      }
    } else if (options.username) {
      setUsername(options.username);
      console.log(chalk.green(`✓ Username set to ${chalk.bold(options.username)}`));
    } else {
      const tok = getToken();
      const user = getUsername();
      if (tok) {
        const masked = tok.slice(0, 8) + '...' + tok.slice(-4);
        console.log(chalk.gray(`Token: ${masked}`));
      } else {
        console.log(chalk.yellow('No token configured.'));
      }
      console.log(chalk.gray(`Username: ${user || chalk.yellow('not set')}`));
      console.log('\n  Set token:    starsight auth <github-token>');
      console.log('  Set username: starsight auth --username <github-username>');
    }
  });

// ── sync ──────────────────────────────────────────────
program
  .command('sync')
  .description('Fetch all starred repos from GitHub')
  .option('-c, --clear', 'Clear cache before syncing')
  .option('-u, --username <username>', 'GitHub username')
  .action(async (options) => {
    await syncCommand(options);
  });

// ── list ──────────────────────────────────────────────
program
  .command('list')
  .description('List cached starred repos')
  .option('-l, --language <language>', 'Filter by language')
  .option('-t, --topic <topic>', 'Filter by topic')
  .option('--tag <tag>', 'Filter by tag')
  .option('-m, --min-stars <number>', 'Minimum stars', parseInt)
  .option('-q, --query <query>', 'Search query')
  .action((options) => {
    listCommand(options);
  });

// ── search ────────────────────────────────────────────
program
  .command('search')
  .description('Search within starred repos')
  .argument('<query>', 'Search query')
  .option('-l, --language <language>', 'Filter by language')
  .option('-t, --topic <topic>', 'Filter by topic')
  .option('--tag <tag>', 'Filter by tag')
  .option('-m, --min-stars <number>', 'Minimum stars', parseInt)
  .action((query: string, options) => {
    searchCommand(query, options);
  });

// ── tag ───────────────────────────────────────────────
const tagCmd = program
  .command('tag')
  .description('Manage tags on starred repos');

tagCmd
  .command('list')
  .description('List all tags')
  .action(tagListCommand);

tagCmd
  .command('add')
  .description('Add a tag to repos')
  .argument('<name>', 'Tag name')
  .argument('<repo-ids...>', 'Repository IDs (space-separated)')
  .option('-c, --color <color>', 'Tag color (hex)')
  .action((name: string, repoIds: string[], options) => {
    tagAddCommand(name, repoIds.map(Number), options.color);
  });

tagCmd
  .command('remove')
  .description('Remove a tag')
  .argument('<name>', 'Tag name')
  .action(tagRemoveCommand);

tagCmd
  .command('set')
  .description('Tag a specific repo')
  .argument('<name>', 'Tag name')
  .argument('<repo-id>', 'Repository ID', parseInt)
  .action(tagSetCommand);

tagCmd
  .command('unset')
  .description('Remove a tag from a repo')
  .argument('<name>', 'Tag name')
  .argument('<repo-id>', 'Repository ID', parseInt)
  .action(tagUnsetCommand);

tagCmd
  .command('repos')
  .description('Tag all repos matching a query')
  .argument('<name>', 'Tag name')
  .argument('<query>', 'Search query to match repos')
  .action(tagReposCommand);

// ── export ────────────────────────────────────────────
program
  .command('export')
  .description('Export starred repos')
  .argument('[format]', 'Export format: json, csv, markdown', 'json')
  .option('-o, --output <file>', 'Output file path')
  .option('-q, --query <query>', 'Filter by search query')
  .option('-l, --language <language>', 'Filter by language')
  .option('-t, --topic <topic>', 'Filter by topic')
  .option('--tag <tag>', 'Filter by tag')
  .option('-m, --min-stars <number>', 'Minimum stars', parseInt)
  .action((format: string, options) => {
    exportCommand(format, options.output, options);
  });

// ── stats ─────────────────────────────────────────────
program
  .command('stats')
  .description('Show statistics about starred repos')
  .action(statsCommand);

// ── clear ─────────────────────────────────────────────
program
  .command('clear')
  .description('Clear all cached data')
  .action(() => {
    clearCache();
    resetClient();
    console.log(chalk.green('✓ All cached data cleared.'));
  });

program.parse();

// Show help if no command given
if (!process.argv.slice(2).length) {
  program.outputHelp();
}