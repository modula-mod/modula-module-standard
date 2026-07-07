# MMS - Modula Module Standard

`mms.version = "0.3.0"`

MMS defines how a Modula module declares identity, GitHub source, runtime mode, shell mode, surfaces, navigation, UI contracts, permissions, hooks, events, actions, data ownership, versioning, documentation, and sandbox posture.

## Package Principle

A Modula module is a real app/plugin package, not a hardcoded host page.

The host owns:
- registry and package fetch;
- installed/enabled/disabled/uninstalled state;
- permission gates;
- theme/surface inheritance;
- safe rendering;
- lifecycle actions;
- marketplace presentation;
- rollback and future signatures.

The module repo owns:
- `modula.module.json`;
- README/changelog/docs;
- UI contracts;
- actions;
- hooks/events;
- data schemas and migrations;
- permissions;
- assets and screenshots;
- tests and agent context.

## Runtime Modes

- `host-rendered-json`: supported now. The backend fetches package JSON and the host renders safe primitives.
- `remote-ui-contract`: planned. Richer host-rendered primitives, no arbitrary module JavaScript.
- `sandboxed-webview`: planned. Isolated iframe/webview with CSP, strict permissions, and a message bridge.
- `signed-native-bundle`: future. Reviewed and signed bundles with versioning and rollback.

## Required Manifest Areas

- Identity: `id`, `slug`, `name`, `shortName`, `version`, `publisher`, `description`, `categories`, `tags`, `license`, `visibility`.
- Source: GitHub `owner`, `repo`, `ref`, `manifestPath`, and docs paths.
- Runtime: mode and support status.
- Shell: app experience mode such as `standard`, `editor`, `dashboard`, `media-player`, `map`, `secure`, `game`, or `immersive`.
- Surfaces: board, route, profile, settings, marketplace, chat, composer, notification, sidebar, bottom-bar, floating-player, share-sheet, team, and business.
- Navigation: module routes and optional module-owned bottom bar metadata.
- UI package: entry, screens, components, theme, and animations.
- Permissions: human-readable permission cards with reason, required flag, and risk.
- Hooks/events: declared extension points and lifecycle/user events.
- Actions: callable commands the host may expose.
- Data: collections, schemas, indexes, migrations, owner types, backup/export/sync posture.

## Current Host Rules

- Do not execute arbitrary remote module code.
- Fetch packages through Modula Core, never directly from the frontend with secrets.
- Keep uninstalled modules visible in registry and Available views.
- Hide uninstalled and disabled modules from Board unless the user explicitly enables a disabled view.
- Render README, changelog, docs, permissions, and previews as product surfaces, not raw diagnostics.
- Preserve module data on uninstall unless a future reviewed destructive flow explicitly says otherwise.

## Versioning

- MMS version: `mmsVersion`.
- Registry version: `registryVersion`.
- Module version: `version`.
- GitHub release ref: `source.ref`.
- Public release tag examples: `vault-notes-v0.3.0`, `tasks-v0.3.0`.

## Release Gate

A release-ready module package should include:
- manifest validation;
- UI contract validation;
- permissions review;
- install/update/disable/enable/uninstall/reinstall smoke tests;
- README/changelog/docs;
- screenshots or preview metadata;
- version bump and Git tag.
