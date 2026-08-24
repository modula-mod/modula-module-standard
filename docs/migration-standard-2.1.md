# Migrating Module Manifests to Standard 2.1

Migration is optional. Existing 2.0 products stay valid until they need extension-platform metadata.

1. Set `schemaVersion`, `standardVersion`, and `manifestSchemaVersion` to `2.1.0`.
2. Set `compatibility.standard` to a compatible 2.1 range.
3. Keep all existing Standard 2.0 registries; do not create parallel capability, service, function, widget, or UI systems.
4. Add `extensionProduct`.
5. For a module, use `kind: module`, no targets, and declare the extension points that the core actually implements.
6. For an add-on or plugin, declare target version ranges and only the capabilities and extension points it consumes.
7. Reference declared action, function, view, or widget contracts from every contribution.
8. Declare retention behavior and a namespaced metadata owner.
9. Validate, build, test, and publish an immutable release before updating a registry record.

Changing to Standard 2.1 does not by itself require a product data migration. Product-owned data schema changes still follow the product migration chain.
