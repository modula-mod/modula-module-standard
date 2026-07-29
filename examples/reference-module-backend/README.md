# Reference Module Backend

Minimal independently operated backend for Modula Module Standard 1.1.0.

Run:

```sh
node server.mjs
```

It exposes:

- `GET /.well-known/modula-module`
- `GET /v1/health`
- `GET /v1/capabilities`
- `POST /v1/session/exchange`
- `POST /v1/actions/:actionId`
- `POST /v1/events`
- `POST /v1/webhooks/modula`
- `GET /v1/diagnostics`

The implementation is intentionally local and dependency-free. Production module backends must validate Greenfield signatures, enforce permissions, reject replay, and use TLS.
