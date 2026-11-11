# Contributing

Thanks for your interest in the Compact Lawn Mower Card! Bug reports, ideas and pull requests are very welcome.

## Before you start

- For bigger features, or changes that affect how the card looks or behaves for everyone, please open an issue first so we can agree on the approach.
- Keep pull requests focused: one feature or fix per PR. Unrelated changes (e.g. a redesign of an existing badge) belong in their own PR.
- Features for a specific mower integration should be opt-in and must not change the card for users of other integrations.

## Development

```bash
npm install
npm run format         # formats the code with Prettier
npm run format:check   # checks the formatting
```

Building `dist/`, version bumps and releases are done by the maintainer. If you want to try your changes in your own Home Assistant, you can build the card locally with `npm run build`, but please do not commit the result. Discard it with `git restore dist/` before committing.

In short, please **do not** include the following in your pull request:

- changes to `dist/`
- version bumps (`package.json`, `package-lock.json`, `manifest.json`, `CARD_VERSION` in `src/constants.ts`)

## Code style

- TypeScript and Lit, formatted with Prettier.
- New user-facing texts go into `src/localize/en.json`. Other languages fall back to English, translations are welcome.
- The mower animations have three size variants of their keyframes (normal, `...Medium`, `...Small`). A change to one variant needs to be made in all three.

### Comments

Comments are welcome where they explain **why** something is done, things the code itself cannot tell:

- quirks of a mower integration or of Home Assistant
- workarounds for browser bugs
- numbers and limits that are not obvious

Keep them short (one line if possible, at most two or three), written in English, as `//` in TypeScript and `/* */` in CSS.

Please avoid:

- comments that describe *what* the code does
- JSDoc blocks that only repeat the name of a function, the types already document it
- section separators like `// ----` in TypeScript. If a file needs them, it should be split up
- commented-out code and TODOs without an issue

In `src/styles.ts` the CSS blocks are structured with `/* === Section === */` headings, please keep them.

## Commits

Single-line commit messages in the form `type: short description`, for example:

```
fix: shorten returning status label on narrow cards
feat: add rotation option to the map view
```

Common types are `feat`, `fix`, `style`, `refactor`, `docs` and `deps`.

## Pull requests

- Describe what you changed and why.
- Mention which mower and integration you tested with.
- For visual changes, add screenshots, ideally in the light and dark theme and on a narrow card.
