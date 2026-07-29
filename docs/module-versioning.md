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
