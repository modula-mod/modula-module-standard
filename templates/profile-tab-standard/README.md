# Profile Tab Standard

Declarative `profile_tab` package-root template for Modula Builder readiness.

This template defines the package contract for a simple `timeline` tab. It is not a full Timeline feature and is not installed into production runtime by default.

## Contract

- `manifest.json` owns marketplace/package metadata.
- `profile-tab.json` owns profile tab metadata, declarative layout, preview metadata, settings metadata, and lifecycle metadata.
- `permissions/permissions.json` declares host-mediated profile permissions.
- `styles/profile-tab.css` demonstrates scoped CSS only under the native Modula root.
- `preview/preview.json` records that browser preview is structural-only until a runtime preview route exists.

## Validate

```sh
npm run validate
```
