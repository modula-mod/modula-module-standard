# Module Package Structure

Recommended MMS v0.3 package layout:

```text
modula.module.json
README.md
CHANGELOG.md
FILETREE.md
CONTEXT.md
AGENTS.md
SECURITY.md
TESTING.md
API.md
RUNTIME.md
PERMISSIONS.md
MARKETPLACE.md
ui/
  module.ui.json
  screens/
  components/
  theme/
  animations/
data/
  schema.json
  indexes.json
  migrations/
permissions/
  permissions.json
actions/
  actions.json
hooks/
  hooks.json
events/
  events.json
assets/
screenshots/
tests/
examples/
```

The host repo may keep fallback renderers, but package UI/data/actions/docs belong in module repos.

