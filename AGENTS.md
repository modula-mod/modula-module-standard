# Module frontend ownership

Module Standard is the module-specific profile layered on the Modula Product
Standard (MPS). The authoritative generic frontend contract belongs to MPS; do
not duplicate its schema here.

- A normal application module owns its frontend source, validated release
  artifact, assets, routes, views, actions and product settings.
- Do not put product-specific UI in `modula-latest`.
- Use MPS frontend primitives and host capabilities; never ship arbitrary
  remote JavaScript, JSX, HTML, CSS, native code or a generic WebView app.
- A user-facing module must declare an MPS frontend. `frontend.mode: none` is
  allowed only for an explicitly headless module profile.
- Host contributions are declared, versioned, permission/capability checked,
  installation scoped and lifecycle aware.
