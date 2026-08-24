# Modula Module Standard

This repository contains the independently versioned Modula Module Standard developer platform.

Packages:

- `@modula/module-standard`: Standard 2.1 contracts, version constants, compatibility helpers, capability negotiation, lifecycle helpers, dependency graph resolution, extension-product contracts, and checksum utilities.
- `@modula/module-validator`: deterministic manifest, compatibility, lifecycle, health, diagnostics, and security validation.
- `@modula/module-sdk`: contract-only builders for records, views, actions, functions, events, permissions, diagnostics, search, health, automations, services, APIs, hooks, jobs, storage, widgets, offline, realtime, marketplace, and testing.
- `@modula/create-module`: CLI foundation for `modula module ...` developer workflows.
- `@modula/module-testing`: development sandbox for validation, capability simulation, event/search/diagnostic inspection, health preview, and migrations.
- `@modula/module-fixtures`: canonical Standard 1.0, 2.0, and 2.1 module/plugin fixtures.

Standard version: `2.1.0`

Build and verify:

```sh
pnpm install
pnpm verify
```

Modules must not call AI providers, run arbitrary host code, or bypass Modula permissions directly. They declare contracts; the Modula host negotiates capability, permission, policy, AI gateway, search, diagnostics, health, lifecycle, and trust behavior.
