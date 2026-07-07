# Plugin Runtime

MMS v0.3 defines Modula modules as GitHub-backed app/plugin packages.

## Runtime Stages

### Stage 1 - host-rendered-json

Supported now. The backend fetches a module package, caches it, and returns JSON contracts. The host renders approved UI primitives and calls approved backend endpoints.

### Stage 2 - remote-ui-contract

Planned. Modules may declare richer UI primitives, composition, layout, controls, and state hints. The host still renders everything.

### Stage 3 - sandboxed-webview

Planned. Module UI may run inside an isolated webview/iframe with CSP, permissions, and a message bridge. No privileged direct host access.

### Stage 4 - signed-native-bundle

Future. Reviewed bundles signed by the Modula marketplace with versioned rollback.

## Host Responsibilities

- Resolve registry module metadata.
- Fetch package files through backend only.
- Cache package docs and runtime contracts.
- Enforce installed/enabled state.
- Render install gates for uninstalled or disabled modules.
- Apply user theme and surface mode.
- Enforce permissions before action execution.

