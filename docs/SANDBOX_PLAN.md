# Sandbox Plan

## Stage 1 - host-rendered JSON UI

Current and supported. Safest mode. No remote code. The backend fetches package JSON and the host renders approved primitives.

## Stage 2 - remote UI contract

Richer UI primitives and composition. Still host-rendered. No arbitrary JavaScript.

## Stage 3 - sandboxed webview

Isolated iframe/webview with:
- strict permissions;
- message bridge;
- CSP;
- limited host APIs;
- origin isolation;
- audit logs.

## Stage 4 - signed native bundle

Reviewed module bundles signed by Modula marketplace. Versions are immutable and rollback-capable.

## Stage 5 - marketplace review

Security scanning, permission review, signatures, trust labels, and public listing checks.

MMS v0.3 prepares the standard. It does not implement arbitrary remote code.

