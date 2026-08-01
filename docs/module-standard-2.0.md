# Modula Module Standard 2.0

Standard 2.0 makes modules contract-driven instead of host-patched. First-party, third-party, AI, automation, backend-hosted, and game modules declare what they are, what they provide, what they need, and how Greenfield should route access.

## Backward Compatibility

Standard 1.0, 1.1, and 1.2 manifests remain valid. A Standard 2.0 host accepts legacy manifests unchanged and treats missing 2.0 sections as unavailable metadata, not as install blockers.

## Required Versioning

Standard 2.0 manifests keep the existing root version fields and add `sectionVersions`. Every section in the standard has its own semantic version entry:

- `identity`, `lifecycle`, `backend`, `engines`, `ai`, `permissions`, `settings`, `routes`, `views`
- `records`, `actions`, `functions`, `jobs`, `events`, `notifications`, `search`, `exports`, `imports`
- `synchronization`, `dependencies`, `optionalDependencies`, `integrations`, `billing`, `telemetry`
- `diagnostics`, `accessibility`, `localization`, `appearance`, `onboarding`, `migrations`, `capabilities`
- `services`, `apis`, `hooks`, `metrics`, `storage`, `widgets`, `navigation`, `ui`, `automation`
- `offline`, `realtime`, `versioning`, `compatibilityMatrix`, `marketplace`

## New Contract Sections

- `dependencyGraph`: declares `requires`, `optional`, `recommended`, `conflicts`, `replaces`, and `provides`.
- `serviceRegistry`: declares discoverable services such as search, export, autosave, revision, history, markdown, storage, AI, and automation.
- `apiRegistry`: declares Greenfield-routed module APIs under `/api/modula/{module-id}/...`.
- `eventBus`: publishes event contracts such as created, updated, deleted, opened, viewed, shared, archived, health changed, settings changed, and AI completed.
- `hookRegistry`: declares before/after hooks for record and lifecycle operations without patching another module.
- `capabilityDiscovery`: publishes boolean `supports...` flags for search, export, AI, offline, realtime, widgets, automation, sync, history, sharing, encryption, media, presence, voice, video, backend, custom backend, and self-hosting.
- `permissionModel`: splits permissions into data, filesystem, media, AI, automation, DIMON, connectors, notifications, search, background, realtime, widgets, presence, voice, camera, location, Bluetooth, NFC, clipboard, health, calendar, contacts, mail, storage, backend, admin, and developer.
- `jobRegistry`: declares cron, queue, delayed, recurring, realtime, repair, migration, cleanup, reindex, sync, and health jobs for Greenfield management.
- `storageModel`: declares structured records, blobs, attachments, object storage, cache, temp storage, encrypted storage, secrets, settings, history, search index, and AI memory.
- `widgetRegistry`, `navigationRegistry`, and `uiContributions`: make UI placement declarative for Board, profile, dashboard, home, settings, search, sidebar, floating, route, tab, sheet, dialog, drawer, menu, composer, context, toolbar, overflow, and action sheet surfaces.
- `automationRegistry`: declares triggers, actions, conditions, variables, and outputs.
- `offline` and `realtime`: declare sync, conflict, cache, compression, encryption, events, presence, typing, watchers, subscriptions, channels, reconnect, and buffering behavior.
- `versioning`, `compatibilityMatrix`, `marketplace`, and `engineReadiness`: describe runtime, marketplace, and future engine compatibility without implementing those engines.

## Safety Rules

Manifest declarations remain metadata-only. Provider keys, credentials, executable source, raw HTML, render functions, remote entries, and arbitrary code fields are rejected. Module APIs must route through Greenfield. AI declarations stay provider-neutral and must not include provider IDs, model IDs, API keys, or provider payloads.

