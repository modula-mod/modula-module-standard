# Module Versioning

Every module exposes four distinct versions.

- `standardVersion`: the Modula Module Standard contract version.
- `moduleVersion`: the version of the module package itself.
- `manifestSchemaVersion`: the schema version used to parse the manifest.
- `dataSchemaVersion`: the version of module-owned records.

Standard 1.0 requires:

```json
{
  "standardVersion": "1.0.0",
  "moduleVersion": "1.0.0",
  "manifestSchemaVersion": "1.0.0",
  "dataSchemaVersion": "1.0.0"
}
```

Data schema changes use module migrations. Manifest schema changes do not automatically imply data migrations.

Standard 1.1.0 is additive:

```json
{
  "standardVersion": "1.1.0",
  "moduleVersion": "1.0.0",
  "manifestSchemaVersion": "1.1.0",
  "dataSchemaVersion": "1.0.0"
}
```

Standard 1.0 modules remain valid. A manifest that omits `backend` is interpreted as `greenfield-managed`; `module-managed` and `hybrid` backend declarations require Standard 1.1.0.

Standard 1.2.0 is additive:

```json
{
  "schemaVersion": "1.2.0",
  "standardVersion": "1.2.0",
  "moduleVersion": "1.0.0",
  "manifestSchemaVersion": "1.2.0",
  "dataSchemaVersion": "1.0.0"
}
```

It adds provider-neutral `ai[].productActions[]` declarations for user-triggered AI workflows. Standard 1.0 and 1.1 manifests remain valid unchanged.
