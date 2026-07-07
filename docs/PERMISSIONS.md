# Permissions

Permissions must be explicit, human-readable, and visible before install/update.

## Permission Object

```json
{
  "id": "local-storage",
  "label": "Local storage",
  "reason": "Stores module-owned records in Modula Core.",
  "required": true,
  "risk": "low"
}
```

## Risk Levels

- `low`: local/user-owned data with no external transfer.
- `medium`: network, notifications, team data, or external sync.
- `high`: wallet, identity, finance, keys, location history, irreversible actions, or privileged workspace controls.

Updates that add permissions should require user review.

