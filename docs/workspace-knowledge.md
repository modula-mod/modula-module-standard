# Workspace Knowledge And Team Memory

Phase 23 adds workspace-scoped shared knowledge, team memory summaries, and AI-ready assistant surfaces.

This layer is collaborative, but it is not a shortcut into identity-private state.

## Workspace-shared knowledge

Workspace knowledge is explicit shared context for workspace members.

Recommended item fields:

- `knowledge_item_id`
- `workspace_id`
- `item_type`
- `title`
- `content`
- `source_module`
- `tags`
- `pinned`
- `visibility`
- `created_by_identity_id`
- `updated_by_identity_id`
- `created_at`
- `updated_at`

Recommended starter item types:

- `note`
- `reference`
- `decision`
- `summary`
- `resource_link`

## Team memory

Team memory should start as a derived summary layer over workspace-shared state.

Useful inputs:

- pinned workspace knowledge items
- recent workspace decisions
- shared notes and summaries
- recent workspace activity
- workspace notifications
- linked package and module context

Useful outputs:

- what matters here
- recent decisions
- pinned resources
- module and package context
- suggested next steps

## Assistant surface

The first assistant surface should be retrieval-based, not a freeform all-access agent.

Safe behavior:

- read workspace-shared knowledge
- read workspace activity summaries
- read workspace package/module context
- produce structured summaries and next-step hints

Unsafe behavior:

- reading personal mail
- reading personal Board state
- reading personal private automations
- bypassing workspace membership or role checks

## Boundary rules

Workspace knowledge and team memory must remain workspace-scoped.

Do not leak into workspace memory:

- personal mail
- personal Board data
- personal notifications
- personal private notes
- personal automations

That data stays identity-owned unless another feature introduces an explicit shared handoff.

## Live updates

Shared knowledge should participate in workspace real-time updates with explicit event types.

Recommended events:

- `workspace.knowledge.created`
- `workspace.knowledge.updated`
- `workspace.knowledge.deleted`
- `workspace.memory.updated`

These events should be workspace-scoped and permission-checked like other collaborative workspace updates.

## Phase 24 shared intelligence

Phase 24 adds a bounded workspace assistant layer on top of shared knowledge and team memory.

The workspace assistant should use:

- workspace knowledge items
- pinned resources
- decision logs
- shared board and panel context
- workspace automation status
- recent workspace activity and notifications

The workspace assistant should not use by default:

- personal mail
- personal Board state
- personal private automations
- personal private notifications
- identity-only notes or settings

Recommended assistant endpoints:

- `POST /api/modula/workspaces/{slug}/agent/plan`
- `POST /api/modula/workspaces/{slug}/agent/execute`
- `GET /api/modula/workspaces/{slug}/agent/history`
- `GET /api/modula/workspaces/{slug}/agent/history/{run_id}`

Recommended planning behavior:

- accept a goal and optional target module
- resolve relevant templates and skills
- produce bounded workflow suggestions
- mark suggestions as `planned`, `confirmation_required`, or `blocked`
- include the workspace memory context that informed the plan

Recommended execution behavior:

- accept only approved structured plans
- enforce workspace role and permission checks
- require confirmation for shared-state writes
- persist shared run history and trace summaries
- emit workspace notifications for high-signal outcomes only
