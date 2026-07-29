# Module Capabilities

Modules request capabilities. The host resolves them.

Required capabilities block enablement when unavailable. Optional capabilities degrade safely.

Example requested capabilities:

```json
[
  {"id": "search", "required": false, "reason": "Index module records", "degradedBehavior": "Module remains browsable without universal search."},
  {"id": "records", "required": true, "reason": "Persist module records"}
]
```

Capability negotiation produces:

- resolved capabilities;
- missing required capabilities;
- unavailable optional capabilities;
- final `canEnable` decision.
