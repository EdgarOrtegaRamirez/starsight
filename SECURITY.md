# Security Policy

## Supported Versions

| Version | Supported          |
| ------- | ------------------ |
| 1.0.x   | :white_check_mark: |

## Reporting a Vulnerability

**Do not open a public GitHub issue for security vulnerabilities.**

Instead, contact the repository owner directly through GitHub or open a [private security advisory](https://github.com/EdgarOrtegaRamirez/starsight/security/advisories/new).

## Security Practices

- **No secrets in code**: API tokens are stored in `~/.config/starsight/config.json` or the `GITHUB_TOKEN` environment variable. Never commit real tokens.
- **Input validation**: All CLI arguments and API responses are validated before processing.
- **Token validation**: GitHub tokens are validated for correct format before use.
- **Safe file operations**: Config file paths are restricted to user home directory. No symlink following.
- **Dependency management**: Dependencies are pinned to specific versions in `package.json`.