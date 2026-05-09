# Modula Module Standard

Phase 5.3 canonical template for building real Modula modules and plugins.

## Required template structure

```text
modula-module-standard/
├── manifest.json
├── module.json
├── package.json
├── README.md
├── frontend/
│   ├── package.json
│   ├── vite.config.ts
│   └── src/
│       ├── modula-entry.ts
│       ├── ModulaModule.svelte
│       ├── surfaces/
│       │   ├── FeedSurface.svelte
│       │   ├── ExploreSurface.svelte
│       │   └── SettingsSurface.svelte
│       ├── lib/
│       │   ├── api.ts
│       │   ├── types.ts
│       │   └── modulaContext.ts
│       └── styles/
│           └── module.css
├── backend/
│   ├── router.py
│   ├── service.py
│   ├── repository.py
│   ├── schemas.py
│   ├── models.py
│   ├── permissions.py
│   └── migrations/
│       └── 0001_init.sql
├── plugins/
│   └── README.md
└── scripts/
		├── validate-module.mjs
		├── build-module.mjs
		└── pack-module.mjs
```

## Plugin manifest standard

Use this as the canonical plugin runtime contract:

```json
{
	"id": "example-plugin",
	"type": "plugin",
	"version": "0.1.0",
	"extends": {
		"type": "module",
		"id": "example-module",
		"module_id": "example-module",
		"min_version": "0.1.0"
	},
	"runtime": {
		"mode": "svelte_component",
		"entry": "frontend/dist/modula-entry.js",
		"component_export": "default",
		"style": "frontend/dist/modula-entry.css"
	},
	"surfaces": [
		{
			"id": "plugin-surface",
			"title": "Plugin Surface",
			"type": "standalone_page",
			"route": "/example/plugin",
			"mount": "module.page"
		}
	],
	"dependencies": [
		{
			"type": "module",
			"id": "example-module",
			"min_version": "0.1.0",
			"required": true,
			"display": "Requires Example Module minimum version 0.1.0"
		}
	]
}
```

Canonical standard, starter reference, and review contract for Modula packages.

## Purpose

This repository defines the official structure and metadata contract for Modula creator packages, including:

- modules
- plugins
- docs packages
- automation packs
- future widget or component packs

Every package should exist in three forms:

1. source repo
2. published release artifact
3. installed runtime copy inside Modula

## Creator lifecycle

The canonical package lifecycle is:

1. create
2. validate
3. preview
4. build
5. publish
6. submit
7. review
8. install
9. update

The source repo is the editing surface.
The runtime copy is a deploy target.
The Marketplace is the controlled install and update layer.

## Release-ready vs review-ready

A package can be release-ready without being review-ready.

Release-ready means:

- valid package metadata
- valid release artifact
- valid runtime contract
- buildable and publishable from GitHub

Review-ready means release-ready plus:

- explicit publisher identity metadata
- support links and homepage
- clear source repository provenance
- clear public/private scope posture
- clear automation safety metadata when applicable
- sufficient docs for reviewers and installers

## Required root files

- `manifest.json`
- `module.json`
- `README.md`
- `CHANGELOG.md`
- `icon.svg`

## Required directories

- `backend/`
- `frontend/`
- `widgets/`
- `migrations/`
- `tests/`

## Strongly recommended

- `docs/`
- `scripts/`
- `shared/`
- `dist/`
- `package.json`
- `LICENSE`
- `cover.png`
- `.env.example`

## Supported package kinds

- `module`
- `plugin`
- `widget-pack`
- `component-pack`
- `service-pack`
- `automation-pack`

## Module classes

- `surface`
- `widget`
- `service`
- `hybrid`

## Publisher metadata

Packages should expose publisher and trust metadata explicitly.

Recommended fields:

- `publisher.id`
- `publisher.name`
- `publisher.handle`
- `publisher.type`
- `publisher.verified`
- `homepage`
- `support_url`
- `repository`
- `release.url`

This metadata helps distinguish draft packages from review-ready packages.

## Organization ownership

Packages can now be owned by:

- an identity publisher
- an organization publisher

Recommended ownership fields:

- `owner_type`
- `owner_id`
- `publisher_display`
- `publisher_handle_or_slug`

Rules:

- package ownership can be shared with organizations
- package roles should stay explicit per package
- organization ownership must not override identity-owned personal state such as mail, notifications, Board data, or saved automations
- organization-owned automation packs are publishable, but instantiated automations remain identity-owned unless a later phase introduces shared team automation instances

## Workspace-owned shared surfaces
See also:

- `docs/collaborative-surfaces.md`
- `docs/creator-lifecycle.md`


Workspaces are now the collaborative layer between identity state and organization-owned package governance.

Ownership layers:

- platform-owned infrastructure
- organization-owned packages and publisher governance
- workspace-owned shared surfaces and member context
- identity-owned private surfaces and private state

Rules:

- workspaces can surface packages and module summaries
- workspaces can host shared dashboards and shared panels
- workspaces can host shared knowledge, decision logs, and team memory summaries
- workspaces must not silently absorb personal Board, personal mail, personal notifications, or personal automations
- modules participating in workspace surfaces should treat workspace context as explicit shared state, not a shortcut to identity-private state
- org ownership of a package does not automatically imply workspace membership or workspace edit rights

## Workspace knowledge and team memory

Workspace knowledge is explicit shared context for workspace members.

Recommended shared items:

- notes
- references
- decisions
- summaries
- pinned resource links

Team memory should be retrieval-based over workspace-shared state.

Rules:

- only workspace-shared knowledge powers workspace memory
- workspace assistant surfaces should remain retrieval-based and permission-aware
- personal Board, mail, notifications, and personal automations must remain excluded
- live knowledge updates should stay workspace-scoped

## Shared boards and live collaboration

Workspace collaboration is now split from the personal Board deliberately.

Identity Board

- identity-owned
- private by default
- personal layout
- personal widgets

Workspace Board

- workspace-owned
- collaborative
- role-aware
- shared panels
- shared layout

Rules:

- do not reuse identity Board persistence keys for workspace board state
- shared board updates must remain permission-checked
- shared board updates should expose structured event types rather than opaque blobs when possible
- personal Board must not subscribe to workspace live state by default

## Conflict and live-update model

Collaborative surfaces should use a practical server-authoritative update model.

Recommended baseline:

- revision-aware board updates
- revision-aware panel updates
- last-write-wins only when the server has an explicit revision guard
- visible editing cues for shared panels or shared layout edits
- workspace-scoped notifications for shared changes

Real-time scope rules:

- workspace presence belongs to the workspace layer
- workspace automation status belongs to the workspace layer
- personal mail, personal notifications, and personal automations stay identity-scoped

## Public/private scope guidance

Modula is identity-first.

That means package authors should think in four layers:

- package scope
- identity scope
- public identity scope
- private identity scope

Rules:

- do not leak private identity state through public surfaces
- public identity pages must only expose explicitly public-safe surfaces
- private identity tooling such as mail and private automations must remain private by default
- release metadata must not imply access to private runtime state

## Automation-pack guidance

An automation pack is a shared package that publishes:

- `skills_provided`
- `workflow_templates_provided`
- `automation_pack_contents`

Important distinction:

- shared template or pack metadata is platform-shared
- instantiated automation state remains identity-owned

Automation packages should declare:

- `safe_by_default`
- `requires_confirmation`
- private-data implications
- configuration schema when relevant
- target modules

## UI composition guidance

Use small reusable components. Route files should assemble components instead of owning all markup and state.

```text
frontend/
├── routes/
├── components/
│   ├── layout/
│   ├── cards/
│   ├── forms/
│   ├── lists/
│   ├── states/
│   └── widgets/
├── stores/
├── lib/
├── styles/
└── assets/
```

Component rules:

- keep page files thin unless the page is genuinely trivial
- put shared shell wrappers in `components/layout/`
- put reusable cards, rows, tiles, and summaries in `components/cards/`
- put form sections and input groups in `components/forms/`
- put repeatable collections in `components/lists/`
- put loading, empty, and error handling in `components/states/`
- keep Board widgets separate from page components
- keep package-local stores, API helpers, and types out of route files

## Action/service/event/workflow guidance

When declaring runtime behavior:

- use stable ids
- declare required permissions explicitly
- declare required capabilities and services explicitly
- keep workflow steps structured and host-validated
- do not rely on arbitrary runtime code execution
- prefer deterministic action interfaces over hidden side effects

## Security checklist

Before release or submit:

- verify release artifacts come from the canonical GitHub repo
- verify support and source links are present
- verify permissions are minimal and declared
- verify private identity data is not exposed publicly
- verify automation templates declare safety and confirmation requirements
- verify plugin extension points are explicit
- verify public surfaces render safely without owner-only state

## Review checklist

Before Marketplace submission:

- package validates locally
- preview looks correct in Package Studio
- release artifact exists
- publisher metadata is present
- homepage and support URL are present
- source repository is canonical
- skills/templates/packs are documented if present
- safety flags are explicit if automation behavior exists
- README and docs explain user-facing behavior

## Starter kits

Creator tooling should support at least:

- `modula create module`
- `modula create plugin`
- `modula create docs`
- `modula create automation-pack`
- `modula submit --org <slug>`

The CLI starter kit is the preferred scaffold path.

## Release and sync discipline

- `module.json` is the package version source of truth
- Git tag and release version must match `module.json`
- Marketplace should install and update from release artifacts, not arbitrary local copies
- runtime copies are deploy targets, not authoring targets
- a package is release-ready only when it can publish a valid artifact
- a package is review-ready only when trust, provenance, and support metadata are present
- sync-ready means Marketplace can install or update the package and Modula can refresh runtime state safely

## Marketplace Install Flow

Canonical install flow is:

1. source repository
2. GitHub Release `module.zip` asset
3. Marketplace install action
4. user package pointer
5. runtime registry
6. shell surfaces/sidebar/settings/profile

Rules:

- Source repos are authoring surfaces.
- Marketplace installs from release assets, not local paths in production.
- Runtime cache is immutable installed package content.
- User state stores pointer/config only.

## GitHub Release Contract

Source repository should include editable source and metadata:

- `manifest.json`
- `module.json` or `plugin.json`
- `frontend/src/*`
- `backend/*` (when backend exists)
- `scripts/*`
- `README.md`
- `package.json` (when applicable)

Release artifact (`module.zip`) should include runtime payload:

- `manifest.json`
- `module.json` or `plugin.json`
- `frontend/dist/modula-entry.js`
- `frontend/dist/modula-entry.css`
- `backend/` (when backend exists)
- `README.md`

Policy:

- Prefer not tracking `module.zip` in source git history.
- Prefer not tracking `frontend/dist` in source git history unless a repo documents an explicit exception.
- GitHub release asset URL is production install contract.

## Backend Contract

When backend is present, package backend should be explicit and deterministic:

- expose validated APIs through module/plugin router scope
- declare permissions/capabilities explicitly
- avoid hidden runtime side effects
- keep migrations/versioning explicit
- preserve identity-first authorization boundaries

Backend is optional for purely frontend packages, but metadata and runtime contract are still required.

## Profile Extension Contract

Identity is canonical profile authority:

- `/profile` is canonical identity profile entry
- social surfaces extend identity profile behavior
- `/social/profile` is compatibility route only (redirect or compatibility wrapper)

Packages must not create a second independent profile authority that duplicates identity ownership.

## Plugin Contract

Plugins must extend a parent module explicitly:

- `type: "plugin"`
- `extends.module_id` required
- dependency contract declares compatible parent minimum version
- plugin surfaces mount into shell-owned surfaces

Rules:

- plugin install should fail clearly when parent dependency is unresolved
- plugin should not replace shell ownership (sidebar/profile dropdown/notifications/focus/settings shell)
- plugin runtime must remain compatible with Marketplace pointer-driven registry flow

## Related docs

- `docs/architecture.md`
- `docs/api.md`
- `docs/permissions.md`
- `docs/release-process.md`
- `docs/creator-lifecycle.md`
- `docs/automation-packs.md`
- `docs/security-checklist.md`

## Advanced package contracts

Modules generated from this standard should expose widgets, functions, permissions,
notifications, and events in both `module.json` and `manifest.json`. Runtime hosts
and Settings Modules can then explain what a module can render, call, require, and
emit before it is installed or enabled.

Release versions are immutable. If a published package archive is stale or missing
runtime features, do not overwrite the same tag. Bump the module version, rebuild,
pack, validate, publish a new release asset, then install/update from that artifact.
