# Module Records

Records are module-owned data contracts.

Every record definition must declare:

- JSON schema;
- ownership;
- visibility;
- indexes;
- uniqueness;
- retention;
- AI policy;
- search policy;
- audit policy;
- export policy.

Record bodies are never placed in audit events by default. Sensitive fields must be identified for search and AI use.
