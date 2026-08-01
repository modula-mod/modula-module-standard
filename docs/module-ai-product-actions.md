# Module AI Product Actions

Modula Module Standard 1.2 defines AI product actions as provider-neutral module declarations. A module can describe a bounded user-triggered action, the immutable prompt it requires, schemas, permissions, context limits, execution constraints, and application mode.

Modules must not declare provider IDs, provider URLs, model IDs, model-specific payloads, API keys, credentials, or provider-specific response parsing. Hosts resolve providers and models through their own policy-controlled AI gateway.

AI product actions are optional capabilities. A host may install and run the rest of a module while AI permissions are denied, revoked, unavailable, or quota-limited.

Required flow:

1. Resolve installed module and declared product action.
2. Verify module state, permission grants, and context permission.
3. Resolve immutable prompt and schemas.
4. Construct minimum authorised context server-side.
5. Submit a provider-neutral request to the host AI gateway.
6. Stream or return a structured suggestion.
7. Require explicit user review before any record mutation.
8. Apply accepted results through normal module record actions and revisions.
9. Persist metadata without raw request or result content in ordinary audits/events.

See `specifications/module-ai-product-actions-1.0.md` for the normative field contract.
