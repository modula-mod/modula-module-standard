# MMS - Modula Module Standard

`mms.version = "0.2.0"`

MMS defines how a Modula module declares identity, permissions, compatible UI surfaces, package-owned UI contracts, data ownership, actions, versioning, and registry behavior.

## Module Manifest

```json
{
  "mmsVersion": "0.2.0",
  "id": "vault-notes",
  "name": "Vault Notes",
  "version": "0.2.0",
  "status": "available",
  "category": "productivity",
  "categories": ["productivity", "private", "notes"],
  "description": "Private notes for your Modula space.",
  "screenshots": [
    {
      "title": "Private notes runtime screen",
      "path": "screenshots/mobile-preview.json",
      "description": "Package-owned Vault Notes UI contract rendered by Modula.",
      "surface": "route"
    }
  ],
  "source": {
    "type": "github",
    "repo": "modula-mod/modula-module-vault-notes",
    "ref": "vault-notes-v0.2.0",
    "path": "modula.module.json"
  },
  "entry": {
    "type": "modula-ui-contract",
    "route": "/module/vault-notes"
  },
  "ownerTypes": ["user", "team", "business"],
  "permissions": ["local-storage"],
  "surfaces": ["board", "profile", "settings", "route", "marketplace"],
  "capabilities": ["notes.create", "notes.update", "notes.delete", "notes.search"],
  "data": {
    "provider": "modula-core",
    "storage": "json-file",
    "sync": "planned",
    "contract": {
      "schemaVersion": "0.2.0",
      "entry": "data/module.data.json"
    }
  },
  "ui": {
    "type": "modula-ui-contract",
    "schemaVersion": "0.2.0",
    "entry": "ui/module.ui.json",
    "usesDesignStandard": true,
    "supportsSurfaceTypes": true,
    "supportsTextScale": true,
    "supportsReduceMotion": true
  },
  "lifecycle": {
    "install": "manual",
    "update": "manual",
    "uninstall": "preserve-data",
    "installable": true,
    "updateable": true,
    "rollbackable": true
  },
  "compatibility": {
    "minimumModulaVersion": "0.2.0",
    "minModulaVersion": "0.2.0",
    "minHostVersion": "0.2.0",
    "hostRendered": true
  },
  "minimumModulaVersion": "0.2.0",
  "changelogSource": {
    "type": "github",
    "path": "CHANGELOG.md"
  },
  "changelog": [
    {
      "version": "0.2.0",
      "date": "2026-07-01",
      "notes": "Adds package-owned UI, screen, data, action, and permission contracts for the safe host-rendered module runtime."
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
- `categories`: optional category tags for store/library browsing.
- `description`: concise purpose statement.
- `screenshots`: optional preview descriptors for store/detail surfaces.
- `source`: GitHub repo/ref/path for the source package manifest.
- `entry`: host-rendered, package UI contract, or future package-rendered runtime entry metadata.
- `ownerTypes`: allowed owners.
- `permissions`: capability declaration.
- `surfaces`: surfaces where the module may appear.
- `capabilities`: named runtime capabilities exposed by the module.
- `data`: provider/storage/sync declaration and optional data contract pointer.
- `ui`: package UI contract pointer plus compatibility with Modula design/runtime settings.
- `lifecycle`: install, update, and uninstall behavior.
- `compatibility`: Modula runtime compatibility metadata.
- `minimumModulaVersion`: minimum compatible Modula app version.
- `changelogSource`: optional file-backed changelog source.
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

## Phase 18D Runtime Flow

1. Modula Core fetches the registry and GitHub module manifests.
2. The module manifest points to `ui/module.ui.json`, `data/module.data.json`, and `permissions/module.permissions.json`.
3. Modula Core fetches, hydrates, and caches the package runtime server-side.
4. Frontend asks Modula Core for registry, installed runtime state, and `/api/modula/modules/:moduleId/runtime`.
5. The Modula host renders the package-owned UI contract through the safe Module Renderer.
6. Module actions call approved backend endpoints declared in the resource contract.
7. Host fallback screens may be used only when the runtime package fails.
8. Future package-rendered runtimes may load reviewed/signed code only after trust/integrity controls are ready.

## Rules

- The manifest is the source of truth for module identity, permissions, and surfaces.
- Modules must use the Modula Design Standard.
- Module APIs should use `/api/modula/{module-id}/...`.
- Frontend clients must skip invalid manifests with a warning instead of crashing.
- Private registry fetching must be mediated by backend endpoints, not frontend tokens.
- MMS 0.2.0 does not permit arbitrary remote JavaScript or React Native code execution.
- Integrity hashes and signatures are reserved for a later standard revision.
