# Gallae Mallae Frontend MVP Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build a locally runnable React responsive MVP where the core Gallae Mallae flow is clickable from home through group creation, invite, taste input, voting, result, schedule, and A/B design variant.

**Architecture:** Use a small Vite React app with local state only. Keep service data and flow helpers in focused modules so the UI can be tested without a backend.

**Tech Stack:** React, Vite, Vitest, Testing Library, CSS media queries.

---

### Task 1: Project Skeleton

**Files:**
- Create: `package.json`
- Create: `index.html`
- Create: `vite.config.js`
- Create: `src/main.jsx`
- Create: `src/App.jsx`
- Create: `src/App.css`
- Create: `src/flow.js`
- Create: `src/App.test.jsx`

- [ ] Create Vite React scripts and test setup.
- [ ] Add a flow helper with ordered step IDs.
- [ ] Add a failing test that clicks through the MVP flow.

### Task 2: MVP Interaction

**Files:**
- Modify: `src/App.jsx`
- Modify: `src/App.css`
- Modify: `src/flow.js`
- Modify: `src/App.test.jsx`

- [ ] Implement local state for group form, taste choices, vote, and design variant.
- [ ] Render the active step and wire all primary CTAs.
- [ ] Add responsive layout and hover/focus states.
- [ ] Make the A/B variant switch visibly change the result screen composition.

### Task 3: Verification

**Commands:**
- `npm install`
- `npm test -- --run`
- `npm run build`
- `npm run dev -- --host 127.0.0.1`

- [ ] Run tests and build.
- [ ] Open local app, capture desktop and mobile screenshots.
- [ ] Inspect screenshots for hierarchy, spacing, contrast, readability, responsive layout, hover affordance, and click clarity.
- [ ] Click through home to schedule and A/B variant.
- [ ] Patch issues found in visual QA and rerun verification.
