# Widget Standard

Declarative `widget` package-root template for Modula Builder readiness.

This template defines the package contract for a simple `stats-card` widget. It is not a full widget runtime and is not installed into production runtime by default.

## Contract

- `manifest.json` owns marketplace/package metadata.
- `widget.json` owns renderer metadata, data contract, preview metadata, settings metadata, and lifecycle metadata.
- `permissions/permissions.json` declares host-mediated profile permissions.
- `styles/widget.css` demonstrates scoped CSS only under the native Modula root.
- `preview/preview.json` records that browser preview is structural-only until a runtime preview route exists.

## Validate

```sh
npm run validate
```
