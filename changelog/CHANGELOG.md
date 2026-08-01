# Changelog

## 2.0.0

- Add independently versioned manifest sections through `sectionVersions`.
- Add dependency graph declarations for requires, optional, recommended, conflicts, replaces, and provides.
- Add service, API, event bus, hook, job, storage, widget, navigation, UI contribution, metrics, offline, realtime, marketplace, and engine-readiness contracts.
- Add dependency graph resolution and Standard 2.0 summary helpers.
- Expand the SDK and CLI with contract-only 2.0 builders and diagnostics commands.
- Keep Standard 1.0, 1.1, and 1.2 manifests valid unchanged.

## 1.2.0

- Add provider-neutral `ModuleAIProductActionDefinition` contracts.
- Validate AI product actions without provider IDs, model IDs, provider URLs, payloads, or credentials.
- Keep Standard 1.0 and 1.1 manifests valid.

## 1.0.0

- Defines the independent Modula Module Standard.
- Adds TypeScript contracts for manifests, compatibility, capabilities, records, views, actions, functions, settings, events, automations, AI, search, diagnostics, health, migrations, release metadata, and trust metadata.
- Adds deterministic validation and host negotiation helpers.
- Adds contract-only SDK builders.
- Adds module CLI, testing sandbox, fixtures, schema, examples, and public docs.
