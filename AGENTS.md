# AGENTS.md — AI Agent Guide for StarSight

## Project Overview

StarSight is a CLI tool for managing GitHub starred repositories. It syncs, lists, searches, tags, and exports starred repos. Built with TypeScript and Node.js.

## Architecture

```
src/
  index.ts              — CLI entry point (Commander-based)
  types.ts              — Type definitions
  utils.ts              — Utility functions (formatting, validation)
  services/
    config.ts           — JSON file-based config in ~/.config/starsight/
    github.ts           — GitHub API client (Octokit)
  commands/
    list.ts             — List starred repos with filters
    search.ts           — Full-text search within stars
    tag.ts              — Tag management (add/remove/set/unset)
    export.ts           — Export to JSON/CSV/Markdown
    stats.ts            — Statistics and insights
    sync.ts             — Fetch stars from GitHub API
tests/
  commands/
    list.test.ts
    search.test.ts
    tag.test.ts
    export.test.ts
    stats.test.ts
    sync.test.ts
```

## Key Design Decisions

1. **Zero external config dependencies**: Uses `fs` + `JSON.parse` for config (not `conf` or similar npm packages).
2. **Offline-first**: Stars are cached locally and all list/search/tag operations work offline.
3. **No network on list/search**: Only `sync` calls GitHub. Everything else is local.
4. **TypeScript with strict mode**: Full type safety, ES2022 target.
5. **Pinned dependencies**: Every dependency is pinned to a specific version.

## CLI Commands

- `starsight auth [token]` — Set GitHub token
- `starsight sync` — Fetch all stars
- `starsight list` — List cached stars with filters
- `starsight search <query>` — Search within stars
- `starsight tag <subcommand>` — Manage tags
- `starsight export [format]` — Export to JSON/CSV/MD
- `starsight stats` — Show statistics
- `starsight clear` — Clear cached data

## Testing

Run `npm test` to execute Jest test suite. Tests use mocked or fixture data — no GitHub API calls during testing.

## Adding New Features

1. Add types to `types.ts` if needed
2. Create the command function in `src/commands/`
3. Wire it up in `src/index.ts` with Commander
4. Add tests in `tests/`
5. Run `npm run build && npm test`

## Publishing

```bash
npm run build
npm test
git add . && git commit -m "feat: description"
git push