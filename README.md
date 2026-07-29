# Taskflow — ElectroPi Front-end Technical Task

A polished task-management mini app built for the ElectroPi front-end evaluation. It covers every functional requirement and includes all three suggested bonuses: Nuxt, TypeScript, and Vitest tests.

## Quick start

### Prerequisites

- Node.js `^22.19.0`, `^24.11.0`, or `>=26.0.0`
- npm 11+

Node 24 LTS is recommended. The repository includes an `.nvmrc` for Node `24.14.0`.

### Install and run

```bash
npm install
npm run dev
```

Open `http://localhost:3000`.

For a production check:

```bash
npm run build
npm run preview
```

## Requirements coverage

| Requirement                                   | Implementation                                                       |
| --------------------------------------------- | -------------------------------------------------------------------- |
| List title, description, status, and due date | Responsive task cards and a dedicated details route                  |
| Grid and board layouts                        | Persistent view switch plus a Trello-style three-column board        |
| Add a task                                    | Accessible create-task modal                                         |
| Title required                                | Inline validation with a clear error message                         |
| Due date in the future                        | Native minimum date plus a timezone-safe validation function         |
| Edit and delete                               | Card/detail actions, pre-filled edit form, and confirmation dialog   |
| Filter by status                              | All, Pending, In progress, and Done filters                          |
| Search by title                               | Case-insensitive, live title search                                  |
| Mock REST API                                 | Nuxt server routes for complete GET, POST, PUT, and DELETE CRUD      |
| Loading state                                 | Skeleton dashboard and task cards                                    |
| Error state                                   | Dedicated error alert with retry support                             |
| Vue 3 Composition API                         | `<script setup lang="ts">` throughout                                |
| State management                              | Composition-style Pinia store                                        |
| Tailwind CSS                                  | Tailwind CSS 4 through the official Vite integration                 |
| Reusable components                           | Forms, dialogs, grid/board cards, toolbar, stats, alerts, and toast  |
| Router                                        | Nuxt file-based route at `/tasks/:id`                                |
| TypeScript bonus                              | Strict TypeScript across app, API, store, and tests                  |
| Nuxt bonus                                    | Nuxt 4 SSR application with server API routes and SEO metadata       |
| Vitest bonus                                  | Unit coverage for validation, filtering, counts, and API-backed CRUD |

## Verified dependency versions

The direct dependencies are pinned exactly for reproducible installs rather than using floating ranges.

| Package             | Version |
| ------------------- | ------: |
| Nuxt                |   4.5.1 |
| Vue                 |  3.5.40 |
| Vue Router          |   5.2.0 |
| Pinia               |   4.0.2 |
| `@pinia/nuxt`       |   1.0.1 |
| Tailwind CSS        |   4.3.3 |
| `@tailwindcss/vite` |   4.3.3 |
| TypeScript          |   6.0.3 |
| Vitest              |  4.1.10 |
| ESLint              |  10.8.0 |

The exact resolved dependency tree is recorded in `package-lock.json`.

TypeScript 7.0.2 is the newest registry release, but it is not yet compatible with the current
`vue-tsc` and Nuxt ESLint toolchain. Version 6.0.3 is the newest release supported by the
toolchain's `<6.1.0` peer range, so it is intentionally used here.

## Available scripts

| Command                | Purpose                                  |
| ---------------------- | ---------------------------------------- |
| `npm run dev`          | Start the local development server       |
| `npm run build`        | Create the production build              |
| `npm run preview`      | Preview the production build             |
| `npm run typecheck`    | Run Nuxt/Vue TypeScript checks           |
| `npm run lint`         | Run ESLint                               |
| `npm test`             | Run the Vitest suite once                |
| `npm run test:watch`   | Run tests in watch mode                  |
| `npm run format`       | Format source files with Prettier        |
| `npm run format:check` | Verify formatting without changing files |

## Project structure

```text
app/
├── assets/css/          Tailwind theme and global styles
├── components/          Reusable UI building blocks
├── layouts/             Shared application shell
├── pages/               Task list and task details routes
├── stores/              Pinia task state and actions
├── types/               Domain types and status metadata
└── utils/               Date formatting and validation
server/api/              Complete delayed mock REST endpoints
server/utils/            In-memory repository and request validation
tests/                   Vitest unit tests
```

## REST API

Every read and mutation goes through a Nuxt server endpoint. The API validates task payloads
server-side and returns standard HTTP errors for invalid input or missing records.

| Method   | Endpoint         | Purpose                   |
| -------- | ---------------- | ------------------------- |
| `GET`    | `/api/tasks`     | List every task           |
| `GET`    | `/api/tasks/:id` | Read one task             |
| `POST`   | `/api/tasks`     | Create and return a task  |
| `PUT`    | `/api/tasks/:id` | Replace and return a task |
| `DELETE` | `/api/tasks/:id` | Delete a task             |

The repository is intentionally in memory because this is a mock API; its seed data is restored
when the Nuxt server restarts.

## Implementation notes

- Initial records and every create, edit, status change, and delete operation use the REST API.
- Initial route data is resolved through the list or single-task API during Nuxt server rendering
  and serialized into Pinia state for hydration, avoiding a client-only loading waterfall.
- The workspace and dynamic task routes provide titles, descriptions, Open Graph metadata,
  canonical links, sensible indexing directives, and a real HTTP 404 for missing tasks.
- Dates are parsed as local date-only values rather than UTC timestamps. This prevents the common “selected day changed by one” timezone bug.
- Search and status filters are combined and exposed as a Pinia getter.
- Users can switch between the original responsive grid and a Trello-style board; the preference
  is remembered in local storage.
- Board cards support native drag-and-drop between status columns plus a status selector for
  keyboard and mobile users.
- The interface includes keyboard focus styles, semantic labels, modal dialog roles, live status feedback, responsive layouts, and reduced ambiguity around destructive actions.
- Task details use Nuxt routing without adding router boilerplate.

## Quality checks

Run the complete verification set before submitting:

```bash
npm run format:check
npm run lint
npm run typecheck
npm test
npm run build
```
