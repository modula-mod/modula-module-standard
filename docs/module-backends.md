# Module Backend Runtime

Modula Module Standard 1.1.0 adds explicit backend ownership to the module manifest. Standard 1.0 manifests remain valid and are interpreted as `greenfield-managed` when they omit `backend`.

Supported modes:

- `greenfield-managed`: Modula owns records, actions, search, events, settings, permissions, exports, health, and storage.
- `module-managed`: the module owns its backend, persistence, workers, queues, APIs, files, search, domain events, migrations, and internal administration.
- `hybrid`: Modula provides identity, installation, settings, host, permissions, and integration bridges while the module owns specialized backend work.
- `frontend-only`: no dedicated backend; the module is a local/static frontend surface.

Module-managed and hybrid modules must declare endpoint, authentication, trust, data, and deployment sections. Frontends normally call Greenfield module action endpoints; Greenfield brokers the action, evaluates policy and permissions, issues a short-lived module session token, validates the response schema, redacts sensitive output, and audits the request.

The frontend must not receive raw Greenfield credentials, connector credentials, static module secrets, or permanent backend credentials.

## Backend Declaration

```json
{
  "standardVersion": "1.1.0",
  "manifestSchemaVersion": "1.1.0",
  "backend": {
    "mode": "module-managed",
    "protocolVersion": "1.0.0",
    "endpoints": {
      "baseUrlStrategy": "registry",
      "apiVersion": "1.0.0",
      "discoveryPath": "/.well-known/modula-module",
      "healthPath": "/v1/health",
      "actionsPath": "/v1/actions",
      "allowedHosts": ["api.example.com"]
    },
    "authentication": {
      "strategy": "greenfield-signed-jwt",
      "tokenExchangeRequired": true,
      "sessionExchangePath": "/v1/session/exchange",
      "tokenTtlSeconds": 900
    },
    "deployment": {
      "ownership": "publisher-hosted",
      "multiTenant": true,
      "regions": ["eu-west"],
      "dataResidency": ["GB", "EU"],
      "selfHostingSupported": true
    },
    "data": {
      "primaryStore": "module-backend",
      "categories": [{
        "id": "contacts",
        "description": "CRM contact records.",
        "location": "module-backend",
        "classification": "private",
        "exportable": true,
        "deletable": true
      }],
      "exportSupported": true,
      "deletionSupported": true,
      "backupResponsibility": "publisher"
    },
    "trust": {
      "publisherId": "example",
      "allowedOrigins": ["https://api.example.com"]
    }
  }
}
```

Endpoint declarations are by function and use one trusted origin resolved at installation. The manifest must not scatter arbitrary per-action URLs.

## Protocol

The protocol package is `@modula/module-backend-protocol`.

Required standard paths:

- `GET /.well-known/modula-module`
- `GET /v1/health`
- `GET /v1/capabilities`
- `POST /v1/session/exchange`
- `POST /v1/actions/:actionId`
- `GET /v1/views/:viewId`
- `GET /v1/records`
- `POST /v1/events`
- `POST /v1/webhooks/modula`

Not every endpoint is mandatory for every mode. Discovery must declare module identity, version, standard version, protocol version, capabilities, supported actions, supported events, and health URL.

## Security Rules

Module backend verification fails closed when:

- backend origin is undeclared;
- TLS is invalid;
- discovery module ID does not match;
- protocol version is unsupported;
- release identity does not match;
- required signing keys are unavailable;
- backend is quarantined.

Self-hosted endpoint validation must block SSRF, DNS rebinding, localhost unless development, link-local ranges, private ranges unless explicitly approved, metadata endpoints, untrusted redirects, unsupported ports, token audience confusion, replay, permission escalation, schema tampering, oversized responses, event spoofing, and disabled/quarantined backend access.
