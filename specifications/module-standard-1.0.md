# Modula Module Standard 1.0

Modula Module Standard 1.0 defines the public contract for first-party and third-party modules.

A module is a versioned package that declares records, views, actions, functions, permissions, settings, events, automations, AI integration points, search projections, diagnostics, health checks, migrations, release evidence, and trust metadata. The host decides whether the module can install or enable.

Required manifest version fields:

```json
{
  "standardVersion": "1.0.0",
  "moduleVersion": "1.0.0",
  "manifestSchemaVersion": "1.0.0",
  "dataSchemaVersion": "1.0.0"
}
```

The standard is independently versioned from Modula itself. Module versions, manifest schema versions, and data schema versions evolve independently.

Standard 1.0 is declarative by default. Runtime execution is mediated by trusted host providers and policy gates.
