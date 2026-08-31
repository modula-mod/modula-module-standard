# Module frontend ownership

Module Standard is the module-specific profile layered on the Modula Product
Standard (MPS). The authoritative generic frontend contract belongs to MPS; do
not duplicate its schema here.

- A normal application module owns its frontend source, validated release
  artifact, assets, routes, views, actions and product settings. Developers
  normally author controlled `@modula/product-ui` TypeScript/TSX source; the
  MPS compiler deterministically lowers it to the validated frontend artifact.
- Do not put product-specific UI in `modula-latest`.
- Use MPS frontend primitives and host capabilities. Never ship arbitrary
  executable JavaScript/JSX, HTML, CSS, native code or a generic WebView app
  in the remotely installed release artifact.
- A user-facing module must declare an MPS frontend. `frontend.mode: none` is
  allowed only for an explicitly headless module profile.
- Host contributions are declared, versioned, permission/capability checked,
  installation scoped and lifecycle aware.
