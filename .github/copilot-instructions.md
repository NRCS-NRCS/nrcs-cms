# NRCS CMS - AI Agent Guidelines

## Project Overview
This is a **React 19 + TypeScript + Vite** frontend application using rolldown-vite (Vite 7) as the build tool. It's a minimal, modern setup focused on fast development and production builds. The project is managed with **pnpm** and uses **ES2022** as the compilation target.

## Architecture & Structure

### Key Directories
- **`src/`** - React application source code
  - `main.tsx` - Entry point; creates React root and mounts `App` component
  - `App.tsx` - Root component (currently a demo counter)
  - `index.css`, `App.css` - Global and component-level styles
  - `assets/` - Static assets (SVGs, images)
- **`public/`** - Static files served as-is (e.g., `vite.svg`)
- **Configuration files** - `vite.config.ts`, `tsconfig.*.json`, `eslint.config.js`

### No Major Services/Backends
This is a **frontend-only** application. There is no API layer, database integration, or backend services currently configured. Any future API integration should follow React patterns (custom hooks, context, or a state management library).

## Build & Development Workflow

### Commands
```bash
pnpm dev       # Start Vite dev server with HMR (Hot Module Replacement)
pnpm build     # Type-check (tsc -b) then build with Vite
pnpm lint      # Run ESLint with TypeScript support
pnpm preview   # Preview production build locally
```

### Build Pipeline
1. **Type Check**: `tsc -b` runs incremental TypeScript compilation using build info cache
2. **Vite Build**: Bundles with rolldown, outputs to `dist/`
3. **Never skip type-check** - it's part of the build command and catches errors early

## TypeScript Configuration

### Key Strictness Settings
- `strict: true` - Enables all strict type-checking options
- `noUnusedLocals`, `noUnusedParameters` - Catches dead code
- `noFallthroughCasesInSwitch` - Prevents switch statement bugs
- `noUncheckedSideEffectImports` - Warns on side-effect imports without explicit intent

### Target & Module Resolution
- **App code** (`tsconfig.app.json`): ES2022 target, `jsx: "react-jsx"` (auto JSX transform)
- **Build config** (`tsconfig.node.json`): ES2023 target for Vite config
- **Module resolution**: `"bundler"` mode for ESM with Node-like resolution

## ESLint & Code Quality

### Configuration
- Extends: ESLint recommended, TypeScript ESLint recommended, React Hooks recommended, React Refresh plugin
- File scope: `**/*.{ts,tsx}`
- No custom rules currently; follows community standards for React + TypeScript

### Typical Patterns to Enforce
- React Hooks rules: `useEffect` dependencies, hook ordering
- React Refresh: Ensure exported components can hot-refresh
- Remove unused imports/variables before commits

## React-Specific Conventions

### Current Patterns (from `App.tsx`)
1. **Functional Components Only** - No class components
2. **Hooks-Based State** - `useState` for local state; consider custom hooks for reusable logic
3. **Component Export** - Default export of the main component (e.g., `export default App`)
4. **JSX with TS** - Always use `.tsx` for files with JSX; `.ts` for pure TypeScript

### Future Expansion Points
- **State Management**: As the app grows, consider a library (Redux, Zustand) or Context for global state
- **Routing**: Add React Router if multiple pages/views are needed
- **HTTP Client**: Add a library like `axios` or `fetch` wrapper for API calls
- **Component Library**: Consider a UI component library or establish local component patterns in `src/components/`

## Development Tips for AI Agents

### Safe Changes
- Modify component logic in `src/App.tsx` and related components
- Update styles in CSS files
- Add new components following the functional + hooks pattern
- Update ESLint rules if stricter checks are needed

### High-Risk Changes
- **Vite config**: Affects build behavior; test with `pnpm build` after changes
- **TypeScript config**: Can break type-checking; verify with `tsc -b`
- **Package upgrades**: React 19 and rolldown-vite are relatively new; test thoroughly
- **ESLint rules**: May cause existing code to fail linting; review impacts

### Testing Strategy
1. Run `pnpm lint` to catch issues early
2. Run `pnpm build` to verify type-safety and bundling
3. Run `pnpm dev` to test HMR during development
4. Manual testing in browser for UI/UX verification

### When Adding Dependencies
- Use `pnpm add` (or `pnpm add -D` for dev dependencies)
- Check `pnpm-lock.yaml` is updated
- Verify no ESLint conflicts with new packages
- Update this guide if new architectural patterns emerge
