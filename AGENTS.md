# AGENTS

This file is for AI agents working in this repository. Keep it stable and project-level.
Do not use it as a task log, review summary, changelog, or progress tracker.
Use Kanban, session notes, or files under `.hermes/` for task-specific state.

## Project Overview

Gallae Mallae is a React/Vite frontend prototype for group restaurant decision-making.
It helps a travel group collect food preferences, compare restaurant candidates, vote on options, and place the selected candidate into a simple schedule.
The current app is a clickable local MVP using mock/fallback data rather than a production backend.

## Build Commands

```bash
npm install
npm run dev -- --host 127.0.0.1
npm test
npm run build
```

Local note:

- `npm run build` can fail on this WSL/Windows checkout when existing `dist/assets` has a permission issue.
- If that happens, verify code buildability with:

```bash
node ./node_modules/vite/bin/vite.js build --outDir /tmp/gallae-mallae-build --emptyOutDir
```

There is currently no `typecheck` or `lint` script in `package.json`.

## Architecture

- Framework: React 19 + Vite.
- Entry points: `src/main.jsx`, `src/App.jsx`.
- App flow state: `src/app/useAppFlow.js`.
- Feature pages live under `src/features/`:
  - `landing/`
  - `groups/`
  - `taste/`
  - `analysis/`
  - `recommendation/`
  - `results/`
  - `auth/`
- Shared UI components live under `src/components/`.
- Mock/default data lives in `src/data/appData.js` and `src/flow.js`.
- API wrapper: `src/api.js`; without `VITE_API_BASE_URL`, the app currently falls back to mock behavior.
- Styling is currently centralized in `src/App.css`.

## Product Language

- Treat the product name as `Gallae Mallae` / `갈래 말래`.
- Do not invent or lock product copy in this file. Check the actual UI and product review docs before changing labels.
- If vote labels change, keep the UI, tests, and review notes consistent together.

## Oh My Hermes Usage

- Use OMH roles as operating lanes, not as permission to add unrelated automation.
- Designer: UX hierarchy, responsive behavior, visual/accessibility verification.
- Dev: implementation within the approved scope, with tests for changed behavior.
- QA: independent verification of the changed user journey.
- CTO/PM: scope, acceptance criteria, and handoff only when the task needs coordination.
- Security/Ops: only when credentials, external APIs, deployment, monitoring, or production operations are involved.

## Testing Policy

For behavior changes:

1. Prefer a focused failing test before implementation.
2. Run `npm test` after implementation.
3. Attempt `npm run build`.
4. If the default build is blocked only by local `dist/` permissions, run the `/tmp` outDir build and report both results.
5. For UI/layout changes, inspect the relevant flow in a browser before calling it done.

## Safety and Side Effects

- Do not commit, push, create GitHub issues/PRs, deploy, connect third-party services, or schedule recurring jobs unless explicitly requested.
- Do not add real secrets. Use placeholders only.
- Do not replace the framework, routing model, or state model unless that is the requested scope.
- Preserve existing artifacts unless regenerating them is part of verification.
