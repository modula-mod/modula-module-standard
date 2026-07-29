# Module Validator

`@modula/module-validator` validates Standard 1.0 manifests.

Validator checks include:

- strict root manifest fields;
- four version fields;
- compatibility ranges;
- capability negotiation;
- permissions;
- lifecycle transitions;
- record/view/action/function/event/automation declarations;
- AI and search declarations;
- diagnostics and health;
- release and trust metadata;
- prohibited runtime and secret fields;
- duplicate IDs;
- checksum and commit evidence when supplied by the registry.

Example:

```ts
import {validateModulaModuleManifest} from '@modula/module-validator'

const result = validateModulaModuleManifest(manifest, {
  host: {hostVersion: '1.0.0', runtimeVersion: '1.0.0', standardVersion: '1.0.0', platform: 'web'},
  hostCapabilities: ['records', 'views', 'functions', 'events', 'search'],
})
```
