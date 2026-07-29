# Module Standard

The Modula Module Standard is the public contract between a module and a Modula host.

Modules declare what they need and what they contribute. Hosts validate the manifest, negotiate compatibility, resolve capabilities, apply permissions and policy, then install or enable only when the contract is acceptable.

Standard 1.1.0 adds module backend ownership declarations. Standard 1.0 manifests remain valid; if `backend` is omitted, hosts interpret the module as `greenfield-managed`. See [module-backends.md](module-backends.md).

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
