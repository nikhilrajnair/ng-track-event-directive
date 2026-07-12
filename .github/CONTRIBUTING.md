# Contributing to ng-track-event-directive

Thanks for your interest in contributing! This project is a lightweight Angular
directive for declarative analytics event tracking. Contributions of all kinds
are welcome — bug reports, feature requests, documentation, and code.

## Code of Conduct

This project and everyone participating in it is governed by our
[Code of Conduct](./CODE_OF_CONDUCT.md). By participating, you are expected to
uphold it. Please report unacceptable behavior as described there.

## Getting started

1. **Fork** the repository and **clone** your fork.
2. Install dependencies (Node.js `^22.22.3 || ^24.15.0 || ^26.0.0` is required):
   ```bash
   npm ci
   ```
3. Create a branch off `main`:
   ```bash
   git checkout -b feat/my-change
   ```

## Development workflow

Common scripts:

| Command                 | What it does                         |
| ----------------------- | ------------------------------------ |
| `npm run test`          | Run the unit tests once              |
| `npm run test:coverage` | Run tests with coverage              |
| `npm run build`         | Build the `tracking` library         |
| `npm run demo:start`    | Serve the demo app                   |
| `npm run docs:dev`      | Serve the documentation site locally |
| `npm run prettier`      | Check formatting                     |
| `npm run prettier:fix`  | Auto-format the codebase             |

Before opening a pull request, please make sure the same checks that run in CI
pass locally:

```bash
npm run prettier
npm run test
npm run build
```

## Commit messages

This project uses [Conventional Commits](https://www.conventionalcommits.org/)
and [semantic-release](https://semantic-release.gitbook.io/). The commit history
drives the version number and changelog, so please format your commits
accordingly. Examples:

- `feat: add view trigger threshold option`
- `fix: prevent duplicate events on rapid hover`
- `docs: clarify adapter setup`
- `chore(deps): bump rxjs`

Types like `feat` and `fix` trigger releases; `docs`, `chore`, `test`, `refactor`
and `ci` do not. Use a `!` or a `BREAKING CHANGE:` footer for breaking changes.

## Pull requests

- Keep PRs focused; one logical change per PR.
- Fill out the pull request template.
- Add or update tests for any behavior change.
- Update the documentation under `docs/` when relevant.
- Ensure CI is green. All PRs require a passing CI run and maintainer review
  before they can be merged into `main`.

## Reporting bugs and requesting features

Please use the [issue templates](https://github.com/nikhilrajnair/ng-track-event-directive/issues/new/choose).
For security issues, do **not** open a public issue — see our
[Security Policy](./SECURITY.md).

Thanks again for contributing! 💙
