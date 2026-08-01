# Migrating Module Manifests to Standard 2.0

Existing Standard 1.0, 1.1, and 1.2 modules do not need to change. Upgrade only when a module needs richer discovery, dependency graph resolution, services, APIs, hooks, jobs, storage, widgets, offline, realtime, marketplace, or engine metadata.

## Minimal Upgrade

1. Change `schemaVersion`, `standardVersion`, and `manifestSchemaVersion` to `2.0.0`.
2. Keep the existing identity, lifecycle, permissions, records, views, actions, functions, settings, events, automations, search, AI, diagnostics, health, migrations, release, trust, and backend sections.
3. Add `sectionVersions` with a semantic version for every Standard 2.0 section.
4. Add only the new declaration sections the module actually supports.

## Compatibility Notes

- Standard 2.0 hosts accept 1.x manifests unchanged.
- Standard 2.0 modules should set `compatibility.standard` to a `^2.0.0` range.
- If a module exposes APIs, every operation must live under `/api/modula/{module-id}/...`.
- If a module declares AI, declarations must remain provider-neutral.
- If a module uses background work, declare it in `jobRegistry`; Greenfield owns scheduling and execution.
- If a module provides reusable capabilities, declare them in `dependencyGraph.provides` so future modules can resolve against them without module-specific code.

## Vault Notes Example

The Standard package keeps the existing Vault Notes 1.0 fixture unchanged and adds `vaultNotesStandard20ManifestFixture` for the richer 2.0 shape. This proves the migration path without forcing current installed modules to rewrite their manifests.

