# Semantic Releases Design

## Goal

Automate versioning, changelogs, and GitHub releases on pushes to `dev` (staging) and `main` (production). Expo GitHub App tracks releases to trigger EAS builds.

## Release Channels

| Branch | Channel | Version Example | GitHub Release |
|--------|---------|----------------|----------------|
| `main` | `latest` | `v1.2.0` | Full release |
| `dev` | `beta` | `v1.3.0-beta.1` | Pre-release |

## Tools

- **semantic-release** -- version bumps, changelogs, git tags, GitHub releases from conventional commits
- **commitlint** (`@commitlint/cli` + `@commitlint/config-conventional`) -- enforces conventional commit format
- **husky** -- runs commitlint via commit-msg git hook

## GitHub Actions

Single workflow (`.github/workflows/release.yml`) triggered on push to `main` or `dev`:
1. Checkout, `npm ci`
2. `npx semantic-release`
3. semantic-release creates version bump, changelog, git tag, GitHub Release
4. Expo GitHub App detects the release and triggers EAS builds

Permissions: `GITHUB_TOKEN` (automatic) with `contents: write`.

## Commit Convention

All commits follow [Conventional Commits](https://www.conventionalcommits.org/):

- `feat:` -- minor version bump
- `fix:` -- patch version bump
- `feat!:` or `BREAKING CHANGE:` footer -- major version bump
- `chore:`, `docs:`, `ci:`, `refactor:`, `test:`, `style:`, `perf:` -- no release

Enforced locally by husky + commitlint.

## Files

| File | Purpose |
|------|---------|
| `.github/workflows/release.yml` | CI workflow |
| `.releaserc.json` | semantic-release branch/plugin config |
| `commitlint.config.js` | commitlint config |
| `.husky/commit-msg` | git hook running commitlint |
| `package.json` | devDependencies + husky prepare script |
| `CLAUDE.md` | commit message convention docs |
