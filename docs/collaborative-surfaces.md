# Collaborative Surfaces

Phase 20 adds a workspace-owned collaboration layer to Modula.

The ownership stack is now:

- platform-owned infrastructure
- organization-owned packages and publisher governance
- workspace-owned shared surfaces
- identity-owned private surfaces and private state

## What a workspace owns

A workspace owns collaborative context such as:

- shared dashboards
- shared summary panels
- shared module surfaces
- member and role context
- visibility and access rules

A workspace is not just a folder or route label.
It is a first-class operating context that connects:

- identities
- roles
- shared surfaces
- linked packages and modules
- organization context when applicable

## Shared surfaces

A shared surface should be modeled explicitly.

Recommended fields:

- `surface_id`
- `workspace_id`
- `surface_type`
- `title`
- `module_id`
- `config`
- `visibility`
- `created_by_identity_id`

Examples:

- shared docs/resources panel
- shared package status panel
- shared automation summary panel
- shared notification summary panel
- shared board panel host
- live workspace activity stream
- shared knowledge and team memory panels

## Shared boards

Workspace boards should be explicit first-class shared surfaces.

Recommended board fields:

- `workspace_board_id`
- `workspace_id`
- `title`
- `layout`
- `created_by_identity_id`
- `updated_by_identity_id`
- `created_at`
- `updated_at`

Recommended panel fields:

- `panel_id`
- `workspace_id`
- `panel_type`
- `title`
- `module_id`
- `config`
- `position`
- `created_by_identity_id`
- `updated_by_identity_id`
- `created_at`
- `updated_at`

Recommended collaborative panel types:

- `workspace_summary`
- `shared_resources`
- `package_status`
- `automation_summary`
- `notification_summary`
- `board_widget_host`

## Important boundary

Do not silently convert identity-private surfaces into workspace state.

These remain identity-owned by default:

- personal Board
- personal mail
- personal notifications
- personal automations
- private settings

If Modula later introduces deliberately shared boards or shared automations, they should be introduced as explicit workspace-owned features, not by blurring existing personal ownership.

## Permissions

Workspace permissions should be separate from organization roles.

Recommended workspace roles:

- `owner`
- `admin`
- `editor`
- `contributor`
- `viewer`

Rules:

- org ownership of a package does not automatically grant workspace edit rights
- workspace membership does not automatically grant package publish or review rights
- collaboration rules should remain explicit and host-enforced

## Real-time collaboration

Live collaboration should reuse the platform's current real-time transport where possible instead of inventing a second unrelated stack.

Recommended live domains:

- workspace presence
- shared board panel updates
- shared board layout updates
- workspace automation run status
- workspace notifications
- workspace activity stream

Recommended event shapes:

- `workspace.presence.joined`
- `workspace.presence.left`
- `workspace.presence.updated`
- `workspace.board.panel.created`
- `workspace.board.panel.updated`
- `workspace.board.panel.removed`
- `workspace.board.layout.updated`
- `workspace.knowledge.created`
- `workspace.knowledge.updated`
- `workspace.knowledge.deleted`
- `workspace.memory.updated`
- `workspace.automation.started`
- `workspace.automation.completed`
- `workspace.automation.failed`
- `workspace.notification.created`

Conflict guidance:

- use revision-aware updates for board layout and panel edits
- avoid silent overwrites
- show editing cues when a member is currently editing shared state
- keep shared live state scoped to workspace members only

Important boundary:

- personal Board does not subscribe to workspace board events by default
- personal mail, notifications, and automations remain identity-scoped

## Package participation

Modules and packages can participate in workspace surfaces, but they should do so safely.

Rules for package authors:

- treat workspace context as explicit shared state
- do not assume access to identity-private data
- declare what shared surface types a package supports
- keep package ownership separate from workspace membership
- make shared state legible in docs and UI

## Workspace knowledge and memory

Workspace knowledge is explicit shared context for members.
It is not a dump of personal notes or private identity memory.

Use workspace knowledge for:

- shared notes
- shared references
- shared decisions
- shared summaries
- pinned resources

Use a derived team memory layer for:

- what matters here
- recent decisions
- relevant package and module context
- suggested next steps from workspace-shared state

Do not feed workspace memory from:

- personal Board state
- personal mail
- personal private notifications
- personal automations

## Shared intelligence and team agents

Phase 24 adds team-scoped planning and bounded execution inside the existing workspace surfaces.

Recommended workspace assistant context:

- `workspace_id`
- `available_skills`
- `available_templates`
- `available_actions`
- `memory_summary`
- `shared_surfaces`
- `role_context`
- `permission_summary`

Recommended rules:

- keep the assistant workspace-aware and memory-aware
- keep execution host-controlled and plan-based
- do not allow arbitrary freeform command execution
- require confirmation for shared-state writes
- keep shared execution history separate from personal execution history

Recommended live event additions:

- `workspace.agent.run.started`
- `workspace.agent.run.completed`
- `workspace.agent.run.failed`
- `workspace.agent.run.blocked`

Good starter cross-module proposals:

- summarize workspace memory and notify the workspace
- sync a shared intelligence panel from workspace memory
- refresh package status for org-owned workspace packages
- update workspace summaries when key shared knowledge changes
