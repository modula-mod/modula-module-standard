# Modula Module Standard 2.1.0 Release

Date: 2026-08-24
Version: `2.1.0`
Tag: `mms-v2.1.0`
Production deployment: not applicable

## Release identity

Validated source commit before this evidence record: `9184c90665baf116f465fdd059c93003dd3bd0c5`.

The immutable release commit is the target of `mms-v2.1.0`. The tag target cannot be embedded into the commit it identifies without changing that identity.

Verify after fetch:

```sh
git fetch --all --tags --prune
git rev-list -n 1 mms-v2.1.0
git log -1 --format=fuller mms-v2.1.0
```

## Semver decision

This is a minor release. `extensionProduct` is additive and optional. Standard 1.0, 1.1, 1.2, and 2.0 manifests remain valid unchanged. Existing Standard 2.0 section contracts retain their meaning.

## Release contents

- Universal registry product taxonomy.
- Typed target relationships and required target capabilities/extension points.
- Namespaced extension points and declarative contributions.
- Bounded extension graph policy.
- Explicit extension-owned retention and metadata namespace.
- Conjunctive semantic version range support.
- Validator security gates and 2.1 fixtures.
- Schema: `schemas/module-manifest-2.1.schema.json`.
- Architecture: `docs/module-standard-2.1.md`.
- Migration: `docs/migration-standard-2.1.md`.

Schema SHA-256: `bd0cedc93cab989b9213eaa52db1577db47b96fee606e07ca60e25ba3a30d493`.

## Verification

The release source passed:

```sh
CI=true pnpm install --frozen-lockfile
pnpm verify
pnpm typecheck
git diff --check
```

`module-standard tests passed`

`module-standard security tests passed`

## Package checksums

Generated from packed 2.1.0 package artifacts in `/tmp/modula-module-standard-2.1.0-packs.ykM5Q1`:

| Package artifact | SHA-256 |
| --- | --- |
| `modula-create-module-2.1.0.tgz` | `af980cc4bdb814872f1d27abc9fa18a1c6b3a206a74977dc338fb7aa4c3ec99c` |
| `modula-module-backend-fixtures-2.1.0.tgz` | `17e8d95d2a8decc783c674f32beee0f2bdf633ef34c446b18bec42b2569c5869` |
| `modula-module-backend-protocol-2.1.0.tgz` | `c78e2b5895bbf0c2d1d8c3ed68458cce90302bd2d0477edf5753a9f40bff7054` |
| `modula-module-backend-testing-2.1.0.tgz` | `21cd421f200f470113ddd32bc31bc48d0b531b80ae8a5f52506aa518c25fb239` |
| `modula-module-fixtures-2.1.0.tgz` | `0a0ae4a0c9c1cf3ee4ebcb4acb87c3564e7b2e184469a150aea68b07e2b96d57` |
| `modula-module-sdk-2.1.0.tgz` | `34d04202fd7c1db1ed2c781dfb283714829cf08c694cff70f14d5129f3b7fb27` |
| `modula-module-standard-2.1.0.tgz` | `11085b500bfba93e4d25e11ab91d5455227e09b4b61f2355f22cfcc4c2d180d8` |
| `modula-module-testing-2.1.0.tgz` | `a82e2eb3098860bc3a71ea3dbb00545b3a89792c25ac279e3a9f9f5a04d18dc2` |
| `modula-module-validator-2.1.0.tgz` | `440c45349a3fa580ffabe5662b0c1e4302c19a6f54fcf086ff24e92af076a08c` |

## Security result

- Arbitrary runtime code and remote JavaScript: rejected.
- Arbitrary extension service targets: rejected.
- Wildcard capability requests: rejected.
- Missing targeted-product parent: rejected.
- Self-targeting product: rejected.
- Core module cross-product contribution masquerading: rejected.
- Raw bearer forwarding: not introduced; Standard 2.1 continues to require the existing Greenfield token-exchange path.
