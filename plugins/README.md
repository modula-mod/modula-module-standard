# Plugin standard

Plugins must declare:

- `type: plugin`
- `extends` contract to a parent module
- explicit `dependencies` with semantic version constraints
- `surfaces` with route bindings
- optional mount metadata (`mount`, `entry`) for parent-surface integration

A plugin should only render when:

1. parent module installed
2. dependency check passes
3. plugin installed and enabled
4. requested plugin surface is enabled

Use `plugins/example-plugin.json` as canonical reference.
