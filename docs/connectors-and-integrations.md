# Connectors and Integrations

## Ownership scopes

Modula connectors are explicitly scoped. They are not global data tunnels.

- `identity`
  - private by default
  - usable only by the owning identity unless explicitly shared by a later policy layer
  - never contributes to workspace memory automatically
- `workspace`
  - usable inside workspace surfaces, shared knowledge, and assistant context only when the workspace integration explicitly enables that behavior
  - requires workspace membership and the relevant workspace permission
- `organization`
  - usable only where org membership and org management policy allow it
  - does not bypass workspace or identity boundaries

## Secret handling model

Identity-linked and connector-linked secrets must be protected by default.

- credentials are encrypted at rest through the connector vault
- API responses return only masked credential metadata
- admin surfaces never render raw token values or encrypted blobs
- audit logs never store raw tokens or secret payloads
- connector sync summaries store references and structured summaries, not uncontrolled raw dumps

Connector definitions now also declare explicit protection metadata so the platform can enforce and surface the policy consistently:

- `provider_family`
- `secret_storage_mode`
- `data_retention_policy`
- `manual_sync_only`
- `requires_explicit_memory_opt_in`
- `tls_required`

This keeps the safety model declarative instead of relying on connector-specific heuristics.

## Sync model

Connector sync is host-controlled and bounded.

- manual sync is the default
- sync captures:
  - status
  - last sync time
  - last error
  - limited structured summary
- non-local external sync requires `https`
- sync output must be sanitized before persistence or audit emission

## External surfaces

Connector-powered surfaces are rendered by Modula, not by raw embedded third-party UI by default.

Examples:

- docs reference panel
- repo activity panel
- notification signal panel
- external summary panel

## Workspace memory rules

A workspace-owned integration may contribute to shared workspace memory only when explicitly enabled.

- allowed:
  - pinned resources
  - bounded summary snapshots
  - shared assistant context derived from workspace-owned integrations
- not allowed by default:
  - raw identity connector payloads
  - personal mail/calendar data becoming workspace-visible automatically
  - connector secrets appearing in workspace memory or admin surfaces

## Admin rendering rules

The admin control plane is metadata-safe.

- show:
  - scope
  - owner
  - health
  - last sync
  - masked credential presence
  - connector status
- never show:
  - raw tokens
  - raw encrypted credential blobs
  - unsafe third-party payload dumps

## CLI direction

The connector CLI should support:

- `modula connectors`
- `modula integrations`
- `modula integration inspect <id>`
- `modula integration sync <id>`

These commands are for inspection and controlled execution, not for bypassing ownership or policy boundaries.
