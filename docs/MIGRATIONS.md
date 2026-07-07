# Migrations

Modules declare migrations under `data/migrations/`.

Migration rules:

- Migrations must be deterministic.
- They should be append-only and versioned.
- They must not silently delete user data.
- They should be idempotent where possible.
- They should declare owner scope: user, team, business, community, or project.

DIMON/ledger-style modules must use append-only events and projections, never history mutation.
