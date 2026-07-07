# UI Contract

Current mode: `host-rendered-json`.

The module owns declarative UI contracts under `ui/`. The Modula host renders those contracts using approved primitives and design tokens.

## Required Properties

- `schemaVersion`
- `moduleId`
- `entry`
- `screens`
- `actions`
- `resources`

## Rules

- No arbitrary JavaScript.
- No hardcoded colors, shadows, glass, frost, or neumorphism.
- Use semantic theme tokens and host surface inheritance.
- Keep route, board, profile, settings, and marketplace surfaces explicit.
- Prefer small reusable components under `ui/components/`.

