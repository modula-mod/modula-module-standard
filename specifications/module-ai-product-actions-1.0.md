# Module AI Product Actions 1.0

```ts
interface ModuleAIProductActionDefinition {
  id: string;
  name: string;
  description: string;
  promptId: string;
  promptVersionRange: string;
  inputSchema: string;
  outputSchema: string;
  requiredPermissions: string[];
  requiredCapabilities: string[];
  context: {
    sources: Array<
      | "current-record"
      | "selected-content"
      | "record-metadata"
      | "module-settings"
    >;
    maximumRecords: number;
    maximumCharacters: number;
    allowedClassifications: Array<
      | "public"
      | "internal"
      | "private"
      | "sensitive"
    >;
  };
  execution: {
    streaming: boolean;
    structuredOutput: boolean;
    maximumToolCalls: number;
    timeoutMs: number;
  };
  application: {
    mode:
      | "preview-only"
      | "replace-selection"
      | "replace-document"
      | "insert"
      | "metadata-suggestion";
    explicitConfirmation: boolean;
    createsRecordRevision: boolean;
  };
}
```

Normative constraints:

- `explicitConfirmation` must be `true`.
- `maximumToolCalls` must be `0` unless the action has a separately declared and authorised tool contract.
- `promptId` refers to an immutable prompt identity registered by the host or module release process.
- `inputSchema` and `outputSchema` are schema references, not provider payload schemas.
- Context content is untrusted user data and must not become system or developer instruction material.
- Product actions never include provider IDs, provider URLs, model IDs, API keys, credentials, provider payloads, or provider-specific response parsing.
