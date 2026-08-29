# Module Standard

The Modula Module Standard is the public contract between a module and a Modula host.

Modules declare what they need and what they contribute. Hosts validate the manifest, negotiate compatibility, resolve capabilities, apply permissions and policy, then install or enable only when the contract is acceptable.

Standard 2.1.0 adds the optional extension-product taxonomy, target graph, extension points, declarative contributions, graph bounds, and retention semantics. Standard 2.0.0 added independently versioned sections, dependency graph resolution, service/API/hook registries, capability discovery, permissions 2.0, jobs, storage, widgets, navigation/UI contributions, offline/realtime declarations, compatibility matrix, marketplace readiness, and future engine readiness. Standard 1.0, 1.1, 1.2, and 2.0 manifests remain valid. See [module-standard-2.1.md](module-standard-2.1.md), [module-standard-2.0.md](module-standard-2.0.md), [module-backends.md](module-backends.md), and [module-ai-product-actions.md](module-ai-product-actions.md).

Required top-level areas:

- identity and publisher;
- four independent versions;
- compatibility;
- lifecycle;
- permissions and capabilities;
- records, views, actions, functions, settings, events, automations;
- AI and search integration;
- diagnostics and health;
- migrations;
- release and trust metadata;
- optional backend ownership metadata;
- optional Standard 2.0 discovery sections.

Manifests are strict. Unknown root fields and prohibited runtime fields are rejected.

The module's generic frontend contract is owned by MPS, not duplicated in this
manifest schema. A normal user-facing module publishes its own validated MPS
frontend artifact; only an explicitly headless module may use
`frontend.mode: none`. See [module-frontend-profile.md](module-frontend-profile.md).
