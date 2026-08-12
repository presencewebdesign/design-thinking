---
title: Repository profile
generated: true
updatedAt: 1786546381012
---

```markdown
# Repository Profile: design-thinking-app

## Overview
A Vue.js application for UX researchers and designers to map user journeys using Design Thinking methodology. It supports phase-based organization across Thinking, Doing, and Feeling dimensions with drag-and-drop functionality and local data persistence.

## Tech Stack
- **Languages**: TypeScript, Vue 3 (Composition API)
- **Frameworks**: Vue Router, Pinia (state management)
- **Styling**: Tailwind CSS
- **Build Tool**: Vite
- **Dependencies**: vue@3.5.13, vue-router@4.5.0, pinia@3.0.1, vuedraggable@4.1.0
- **Dev Tools**: ESLint, Prettier, TypeScript compiler

## Directory Layout
```
src/              # Source code root
├── components/   # Vue components
├── views/        # Page components
├── router/       # Routing configuration
├── stores/       # Pinia store definitions
├── assets/       # Static assets
├── App.vue       # Root component
└── main.ts       # Entry point
public/           # Static assets
dist/             # Build output
```

## Entry Points
- `src/main.ts` - Application entry point
- `src/router/index.ts` - Route configuration
- `src/App.vue` - Root Vue component

## Commands
- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview built application
- `npm run lint` - Lint code with auto-fix
- `npm run format` - Format source code
```
