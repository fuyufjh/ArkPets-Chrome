# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
# Install dependencies (after cloning)
npm install
git submodule update --init --recursive
cd ArkPets-Web && npm install && npm run build && cd ..

# Development (watch mode, generates dist/ for loading as unpacked extension)
npm run watch

# Production build
npm run build

# Lint
npm run lint

# Tests
npm test

# Build distribution zips (chrome/edge/firefox)
./build.sh                    # Chrome (default)
./build.sh -t edge            # Edge
./build.sh -t firefox         # Firefox (also generates source_code.zip)
```

## Architecture

This is a **Manifest V3 browser extension** with two entry points compiled by Webpack:

- **`src/index.tsx`** → `dist/index.html` + `dist/popup.js`: The popup UI (React + Tailwind + shadcn/ui). Single component `src/components/settings.tsx` manages all state.
- **`src/content.ts`** → `dist/content.js`: Content script injected into every webpage. Manages `Character` instances from the `arkpets` package that render Spine 2D models on pages.

### Data flow

Settings are persisted in `chrome.storage.local`. The popup writes to storage; the content script reads from storage on load and listens for `onChanged` events to update live characters on the page without reload.

Storage keys: `characters` (array of `CharacterItem`), `allowInteraction` (bool), `websiteFilter` (`'all'|'blacklist'|'whitelist'`), `domainList` (newline-separated string), `models` (cached remote model list), `modelsLastUpdated` (timestamp), `modelsVersion` (semver), `modelsSource`.

### Key modules

- **`src/lib/common.ts`**: Shared types (`CharacterItem`, `CharacterModel`, `WebsiteFilterType`) and `getEmbeddedModels()` which returns the 2 bundled models (Pepe and Lappland the Decadenza).
- **`src/lib/resource.ts`**: Fetches the full Arknights model list from `isHarryh/Ark-Models` (GitHub or the official mirror at `arkpets.ericfu.me`). Uses `Promise.any()` race between both sources by default.
- **`src/lib/utils.ts`**: `matchDomain()` for suffix-based domain matching, `compareSemver()` for version comparison.

### `arkpets` dependency

`arkpets` is a local package (`file:ArkPets-Web`) — a git submodule at `ArkPets-Web/`. It provides the `Character` class (Spine 2D renderer) and `showContextMenu`. The submodule must be built before the extension can be built.

### Multi-browser targeting

`build.sh` runs `npm run build` then patches `dist/manifest.json` for Edge (renames "Chrome" → "Edge") or Firefox (strips " Chrome" from name). The manifest includes `browser_specific_settings.gecko` for Firefox compatibility. The code uses `webextension-polyfill` for cross-browser API compatibility.

### Version management

`build.sh` checks that `src/manifest.json` and `package.json` versions match before building. Both must be updated in sync when releasing.
