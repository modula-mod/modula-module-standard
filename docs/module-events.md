# Module Events

Modules declare emitted and consumed events.

Each event declares:

- event type;
- direction;
- schema version;
- JSON schema;
- subscriber when consumed;
- permissions;
- replay support.

The host owns event delivery, replay, retries, and subscriber isolation.
