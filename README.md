# StarSight ⭐

**GitHub Star Manager CLI** — list, search, tag, and export your GitHub starred repos with style.

[![CI](https://github.com/EdgarOrtegaRamirez/starsight/actions/workflows/ci.yml/badge.svg)](https://github.com/EdgarOrtegaRamirez/starsight/actions/workflows/ci.yml)
[![npm version](https://img.shields.io/badge/npm-1.0.0-blue)](https://www.npmjs.com/package/starsight)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Node.js](https://img.shields.io/badge/Node.js-18%2B-339933)](https://nodejs.org/)

---

Tired of scrolling through thousands of GitHub stars? StarSight gives you superpowers to manage them:

- **Sync** your stars offline for fast browsing
- **Search** across names, descriptions, topics, and languages
- **Tag** repos with custom labels
- **Export** to JSON, CSV, or Markdown
- **Stats** — see your most-starred languages, top repos, and more

All cached locally — no network needed for everyday use.

## Installation

```bash
# Via npm
npm install -g starsight

# Or run directly with npx
npx starsight --help

# Or clone and run locally
git clone https://github.com/EdgarOrtegaRamirez/starsight.git
cd starsight
npm install && npm run build && node dist/index.js --help
```

## Quick Start

```bash
# 1. Authenticate (generate a token at https://github.com/settings/tokens)
starsight auth ghp_yourTokenHere --username yourGitHubUsername

# 2. Sync your starred repos
starsight sync

# 3. Browse your stars
starsight list

# 4. Find something specific
starsight search "machine learning"
starsight search "python" --language Python

# 5. See your stats
starsight stats

# 6. Tag repos
starsight tag add "learning" 123456 789012
starsight tag repos "ai" "language-model"

# 7. Export
starsight export json -o stars.json
starsight export markdown -o stars.md
```

## Usage

### Authentication

```bash
# Set token (required for sync)
starsight auth ghp_yourToken
starsight auth ghp_yourToken --username your-username

# Just set username (if token is in GITHUB_TOKEN env var)
starsight auth --username your-username

# View current auth status
starsight auth
```

### Syncing Stars

```bash
# Fetch all stars (paginated, may take a while)
starsight sync

# Re-sync from scratch
starsight sync --clear

# Sync for a specific user
starsight sync --username another-user
```

### Listing Stars

```bash
# List all cached stars
starsight list

# Filter by language
starsight list --language TypeScript

# Filter by topic
starsight list --topic "machine-learning"

# Filter by minimum stars
starsight list --min-stars 1000

# Filter by tag
starsight list --tag learning

# Search and filter
starsight list --query "rust" --min-stars 500
```

### Searching

```bash
# Full-text search (name, description, topics, owner)
starsight search "web framework"
starsight search "database" --language Go
starsight search "react" --topic "typescript" --min-stars 5000
```

### Tag Management

```bash
# List all tags
starsight tag list

# Add a tag to specific repos (by ID)
starsight tag add "learning" 123456 789012

# Add a tag with color
starsight tag add "favorites" 345678 --color "#ff6b6b"

# Tag a repo
starsight tag set "important" 123456

# Remove tag from a repo
starsight tag unset "wip" 123456

# Tag all repos matching a search query
starsight tag repos "ai" "machine-learning"

# Remove a tag entirely
starsight tag remove "old-tag"
```

> **Finding repo IDs**: Run `starsight list` — repo IDs are shown as part of the repo data. Or use `starsight export json` and look for the `id` field.

### Exporting

```bash
# Export all as JSON
starsight export json -o my-stars.json

# Export filtered as CSV
starsight export csv --language Python -o python-stars.csv

# Export as Markdown (beautiful README)
starsight export markdown -o STARS.md

# Print to stdout
starsight export json
```

### Statistics

```bash
# See language breakdown, top repos, tag summary
starsight stats
```

### Caching

```bash
# Clear all cached data
starsight clear
```

## Commands Reference

| Command | Description |
|---------|-------------|
| `auth [token]` | Configure GitHub authentication |
| `sync` | Fetch all starred repos from GitHub |
| `list` | List cached starred repos with filters |
| `search <query>` | Full-text search within stars |
| `tag` | Manage tags (subcommands: list, add, remove, set, unset, repos) |
| `export [format]` | Export stars (json, csv, markdown) |
| `stats` | Show statistics and insights |
| `clear` | Clear all cached data |
| `--help` | Show help |
| `--version` | Show version |

## Export Formats

### JSON
Full structured data — ideal for programmatic use.

### CSV
Spreadsheet-friendly — open in Excel/Google Sheets.

### Markdown
Beautiful README-style output with links, stars, and tags.

## Architecture

```
starsight/
├── src/
│   ├── index.ts          — CLI entry point
│   ├── types.ts          — TypeScript definitions
│   ├── utils.ts          — Utilities (formatting, validation)
│   ├── commands/
│   │   ├── list.ts       — List command
│   │   ├── search.ts     — Search command
│   │   ├── tag.ts        — Tag management
│   │   ├── export.ts     — Export to formats
│   │   ├── stats.ts      — Statistics
│   │   └── sync.ts       — GitHub sync
│   └── services/
│       ├── config.ts     — Local JSON config (~/.config/starsight/)
│       └── github.ts     — GitHub API client
├── tests/                — Jest test suite
├── .github/workflows/    — CI configuration
└── package.json          — Dependencies and scripts
```

### Key Design Decisions

- **Offline-first**: Stars are cached locally; only `sync` calls the GitHub API
- **Zero extra deps for config**: Uses raw `fs` + `JSON` instead of `conf` or similar
- **TypeScript strict mode**: Full type safety throughout
- **Pinned dependencies**: Every dependency version is locked
- **Token security**: Tokens are masked in CLI output, never logged

## Environment Variables

| Variable | Description |
|----------|-------------|
| `GITHUB_TOKEN` | GitHub personal access token (alternative to `starsight auth`) |

## Data Storage

Config and cache are stored at `~/.config/starsight/config.json`.

## Security

See [SECURITY.md](SECURITY.md) for full details.

## License

MIT — see [LICENSE](LICENSE).

## For AI Agents

See [AGENTS.md](AGENTS.md) for architecture and contribution guide.