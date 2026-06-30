# MMS - Modula Module Standard

`mms.version = "0.1.2"`

MMS defines how a Modula module declares identity, permissions, compatible UI surfaces, data ownership, versioning, and registry behavior.

## Module Manifest

```json
{
  "mmsVersion": "0.1.2",
  "id": "vault-notes",
  "name": "Vault Notes",
  "version": "0.1.1",
  "status": "available",
  "category": "productivity",
  "description": "Private notes for your Modula space.",
  "source": {
    "type": "github",
    "repo": "modula-mod/modula-module-vault-notes",
    "ref": "vault-notes-v0.1.1",
    "path": "modula.module.json"
  },
  "entry": {
    "type": "host-rendered",
    "route": "/module/vault-notes"
  },
  "ownerTypes": ["user", "team", "business"],
  "permissions": [],
  "surfaces": ["board", "profile", "settings"],
  "capabilities": [],
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
  "lifecycle": {
    "install": "manual",
    "update": "manual",
    "uninstall": "preserve-data"
  },
  "compatibility": {
    "minimumModulaVersion": "0.1.0"
  },
  "minimumModulaVersion": "0.1.0",
  "changelog": [
    {
      "version": "0.1.1",
      "date": "2026-06-30",
      "notes": "Adds GitHub source and install runtime contract."
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
- `source`: GitHub repo/ref/path for the source package manifest.
- `entry`: host-rendered or package-rendered runtime entry metadata.
- `ownerTypes`: allowed owners.
- `permissions`: capability declaration.
- `surfaces`: surfaces where the module may appear.
- `capabilities`: named runtime capabilities exposed by the module.
- `data`: provider/storage/sync declaration.
- `ui`: compatibility with the Modula design/runtime settings.
- `lifecycle`: install, update, and uninstall behavior.
- `compatibility`: Modula runtime compatibility metadata.
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

## Phase 18B Fetch Flow

1. Modula Core fetches the registry and GitHub module manifests.
2. Modula Core validates and caches manifests server-side.
3. Frontend asks Modula Core for registry and installed runtime state.
4. Installs and updates go through Modula Core, not local UI state.
5. Module appears on Board/Profile/Settings according to installed state and manifest surfaces.
6. Future package-rendered runtimes may load remote UI bundles after trust/integrity controls are ready.

## Rules

- The manifest is the source of truth for module identity, permissions, and surfaces.
- Modules must use the Modula Design Standard.
- Module APIs should use `/api/modula/{module-id}/...`.
- Frontend clients must skip invalid manifests with a warning instead of crashing.
- Private registry fetching must be mediated by backend endpoints, not frontend tokens.
- Integrity hashes and signatures are reserved for a later standard revision.
