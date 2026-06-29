# MMS - Modula Module Standard

`mms.version = "0.1.0"`

MMS defines how a Modula module declares identity, permissions, compatible UI surfaces, data ownership, versioning, and registry behavior.

## Module Manifest

```json
{
  "mmsVersion": "0.1.0",
  "id": "vault-notes",
  "name": "Vault Notes",
  "version": "0.1.0",
  "status": "local",
  "category": "productivity",
  "description": "Private notes for your Modula space.",
  "entry": {
    "route": "/module/vault-notes",
    "component": "VaultNotesModule"
  },
  "ownerTypes": ["user", "team", "business"],
  "permissions": {
    "storage": true,
    "network": false,
    "media": false,
    "notifications": false,
    "ai": false
  },
  "surfaces": {
    "board": true,
    "profile": true,
    "settings": true
  },
  "data": {
    "provider": "modula-core",
    "storage": "json-file",
    "sync": "planned"
  },
  "ui": {
    "usesDesignStandard": true,
    "supportsSurfaceTypes": true,
    "supportsTextScale": true,
    "supportsReduceMotion": true
  },
  "minimumModulaVersion": "0.1.0",
  "changelog": [
    {
      "version": "0.1.0",
      "date": "2026-06-29",
      "notes": "Initial local module manifest."
    }
  ],
  "integrity": {
    "hash": null,
    "signature": null
  }
}
```

## Required Fields

- `mmsVersion`: MMS standard version used by the manifest.
- `id`: stable kebab-case module ID.
- `name`: user-facing module name.
- `version`: semver module version.
- `status`: current module availability state.
- `category`: product category.
- `description`: concise purpose statement.
- `entry`: route/component entry metadata.
- `ownerTypes`: allowed owners.
- `permissions`: capability declaration.
- `surfaces`: surfaces where the module may appear.
- `data`: provider/storage/sync declaration.
- `ui`: compatibility with the Modula design/runtime settings.
- `minimumModulaVersion`: minimum compatible Modula app version.
- `changelog`: auditable version notes.
- `integrity`: reserved hash/signature fields.

## Statuses

- `local`: shipped locally in the app.
- `core`: required system module.
- `installed`: installed by the user or owner.
- `available`: available for install.
- `planned`: visible roadmap item, not installable.
- `disabled`: present but disabled.
- `archived`: no longer active.

## Versioning

- Standard version: `mmsVersion`, semver.
- Registry version: `registryVersion`, semver.
- Module version: manifest `version`, semver.
- Modula app version: `minimumModulaVersion`, semver compatibility gate.

## Future Fetch Flow

1. App fetches registry.
2. App/backend validates manifest.
3. App compares module version, registry version, and standard version.
4. App installs or updates module through a trusted provider.
5. Module appears on Board/Profile/Settings according to manifest surfaces.
6. Rollback is possible by selecting a previous module version.

## Rules

- The manifest is the source of truth for module identity, permissions, and surfaces.
- Modules must use the Modula Design Standard.
- Module APIs should use `/api/modula/{module-id}/...`.
- Frontend clients must skip invalid manifests with a warning instead of crashing.
- Private registry fetching must be mediated by backend endpoints, not frontend tokens.
- Integrity hashes and signatures are reserved for a later standard revision.

