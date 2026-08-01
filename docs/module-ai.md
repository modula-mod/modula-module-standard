# Module AI

Modules do not call AI providers directly.

AI flow:

```text
Module -> AI request contract -> Greenfield AI Gateway -> provider
```

Manifest AI declarations include:

- supported AI features;
- allowed context;
- tool definitions;
- structured outputs;
- permissions;
- policy mode.

High-risk or record-content AI use should require confirmation or blocking policy until reviewed.
