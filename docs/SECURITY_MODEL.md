# Security Model

MMS v0.3 security defaults:

- Backend fetches GitHub packages; frontend never receives GitHub tokens.
- The registry is separate from installed state.
- Uninstall removes local install state, not registry discoverability.
- Host-rendered JSON is the only supported runtime mode today.
- Permission cards explain required access, reason, and risk.
- High-risk modules require review before activation.
- Module data is preserved on uninstall unless a future destructive flow is explicit.
- Future webviews require CSP, message bridge allowlists, and audit logs.
- Future bundles require signatures, version pinning, and rollback.

