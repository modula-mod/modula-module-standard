# Modula Module Standard

MMS, the Modula Module Standard, defines how Modula modules are packaged, reviewed, installed, rendered, updated, disabled, uninstalled, and documented.

Current version: `0.3.0`.

MMS v0.3 treats every module as a real app/plugin package. The host app owns the shell, registry, install state, permissions, rendering, sandbox gates, and marketplace presentation. GitHub module repositories own manifests, docs, UI contracts, actions, data schemas, permissions, assets, tests, and release tags.

## Contents

- `MODULA_MODULE_STANDARD.md` - normative standard.
- `schemas/` - JSON schemas for manifests, permissions, UI contracts, screens, actions, data, and versions.
- `docs/` - runtime, package structure, permission, sandbox, marketplace, security, migration, and versioning guidance.
- `examples/` - example manifests and future app package notes.
- `registry/modules.json` - bundled registry seed for Modula Core.
- `packages/types/` - TypeScript types for consumers.

## Runtime Direction

- Stage 1: `host-rendered-json` is supported now.
- Stage 2: `remote-ui-contract` is planned next.
- Stage 3: `sandboxed-webview` is planned after explicit permission and bridge controls.
- Stage 4: `signed-native-bundle` is future only.

MMS v0.3 does not allow arbitrary remote JavaScript in the Modula host.
