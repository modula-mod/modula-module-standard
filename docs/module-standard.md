# Module Standard

The Modula Module Standard is the public contract between a module and a Modula host.

Modules declare what they need and what they contribute. Hosts validate the manifest, negotiate compatibility, resolve capabilities, apply permissions and policy, then install or enable only when the contract is acceptable.

Standard 1.2.0 adds provider-neutral AI product action declarations. Standard 1.0 and 1.1 manifests remain valid. Standard 1.1.0 added module backend ownership declarations; if `backend` is omitted, hosts interpret the module as `greenfield-managed`. See [module-backends.md](module-backends.md) and [module-ai-product-actions.md](module-ai-product-actions.md).

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
- release and trust metadata.
- optional backend ownership metadata.

Manifests are strict. Unknown root fields and prohibited runtime fields are rejected.
