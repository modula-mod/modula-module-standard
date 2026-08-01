# Modula Module Standard 2.0.0 Release

Date: 2026-08-01
Version: `2.0.0`
Tag: `mms-v2.0.0`
Production deployment: not applicable

## Release Identity

Release commit: the immutable commit pointed to by `mms-v2.0.0`.
Tag commit: the same commit pointed to by `mms-v2.0.0`.

Verify after fetch:

```sh
git fetch --all --tags --prune
git rev-list -n 1 mms-v2.0.0
git log -1 --format=fuller mms-v2.0.0
```

The exact commit cannot be embedded into the same commit without changing that commit identity. The final release gate report must record the exact tag target after the tag is created.

## Compatibility Statement

Standard 1.0 manifests remain valid.
Standard 1.1 manifests remain valid.
Standard 1.2 manifests remain valid.
Standard 2.0 fields are opt-in.
A Standard 1.x manifest is normalized into the compatible runtime model.

## Release Contents

- Changelog: `changelog/CHANGELOG.md`
- Migration guide from 1.2: `docs/migration-standard-2.0.md`
- Compatibility statement: this document and `docs/module-standard-2.0.md`
- Schema package: `@modula/module-standard`
- Validator package: `@modula/module-validator`
- SDK package: `@modula/module-sdk`
- CLI package: `@modula/create-module`
- Fixtures: `@modula/module-fixtures`
- Conformance tests: `tests/module-standard.test.mjs`, `tests/security.test.mjs`
- Manifest schema: `schemas/module-manifest-2.0.schema.json`

## Supported Manifest Versions

- `1.0.0`
- `1.1.0`
- `1.2.0`
- `2.0.0`

## Breaking Changes

No Standard 1.x manifest breaking changes are introduced by Standard 2.0. Existing Standard 1.0, 1.1 and 1.2 manifests remain valid unchanged.

Standard 2.0 modules must satisfy the new 2.0 validation rules only when they opt into Standard 2.0 fields.

## Normalized Defaults

Hosts normalize legacy manifests by preserving the existing 1.x manifest fields and applying stable defaults for missing 2.0 sections:

- dependencies: no required, optional, recommended, conflicting or replacement dependencies unless declared by legacy `dependencies`;
- capabilities: no provided capability declarations unless present in manifest capabilities or Standard 2.0 `dependencyGraph.provides`;
- services, APIs, hooks, jobs, storage, widgets, navigation and UI contributions: empty registries;
- permissions: existing 1.x permissions remain the source of requested permissions;
- compatibility: existing host/runtime/platform compatibility remains authoritative;
- backend: omitted backend remains `greenfield-managed`;
- health and diagnostics: no additional 2.0 health or diagnostics declarations;
- marketplace and future engine metadata: unavailable unless declared.

## Unsupported Runtime Declarations

Standard 2.0 defines declarations that the host may validate before it can execute them. A validator accepting a declaration does not mean the declaration is operational.

Known unsupported or declarative-only runtime targets at release:

- unrestricted module code execution;
- arbitrary frontend component imports into the host;
- WebGPU runtime;
- Unity runtime;
- Godot runtime;
- spatial runtime;
- native binary loading;
- full offline synchronization;
- custom database provisioning for modules;
- complete automation orchestration;
- public marketplace publication;
- billing and money movement.

Hosts must disclose unsupported runtime declarations honestly through their runtime support matrix.

## Package Checksums

Generated from packed 2.0.0 package artifacts in `/tmp/modula-module-standard-2.0.0-package-packs.kfae3J` after `pnpm verify`:

| Package artifact | SHA-256 |
| --- | --- |
| `modula-create-module-2.0.0.tgz` | `8d3856b1a2c4951e800edbe9d6e82317b7fd05c0f77823cc211b3fcebc93a960` |
| `modula-module-backend-fixtures-2.0.0.tgz` | `918b9407cb7603d99f39fcf406203f425c269b56af0af519ce48bd386193f788` |
| `modula-module-backend-protocol-2.0.0.tgz` | `6f30c4985172f8cafe5dc4afc7b8f35a1d62aefcd1a04c65f0801fe56776a5d2` |
| `modula-module-backend-testing-2.0.0.tgz` | `f975857b6d52ba58ef7b11c0ac4f60d8d234f25a4342eff4e973da1072130504` |
| `modula-module-fixtures-2.0.0.tgz` | `4f689b92e32f0870e2383581afd4b8b65ec36ba58ed4501b8695703a822ad5c8` |
| `modula-module-sdk-2.0.0.tgz` | `8521e8115076f891bb9a4dc9283143330cfa0e1f34d218754928c9242c708118` |
| `modula-module-standard-2.0.0.tgz` | `59e090db41a7532c050330b4ab66bb2b276f889ff89317f77e1db070515e1440` |
| `modula-module-testing-2.0.0.tgz` | `73ab9debe1995174f30ab4f9fe06317936d208c5a1d4241f087c4f0688ce5f51` |
| `modula-module-validator-2.0.0.tgz` | `37b8965e682d796ef64b6d375bfc02ed7d0ad6804475e3cc4e02d1b9da06f869` |

Regenerate:

```sh
pnpm verify
pnpm -r --filter "./packages/**" pack --pack-destination /tmp/modula-module-standard-2.0.0-package-packs
sha256sum /tmp/modula-module-standard-2.0.0-package-packs/*.tgz
```
