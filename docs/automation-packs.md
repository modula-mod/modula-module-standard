# Automation Packs

Automation packs are shared packages that publish reusable:

- skills
- workflow templates
- pack summaries

They do not make automation instances shared mutable state.

Shared template metadata is platform-scoped.
Configured automation instances remain identity-owned.

## Required concepts

- `skills_provided`
- `workflow_templates_provided`
- `automation_pack_contents`
- `safe_by_default`
- `requires_confirmation`
- private-data implications when applicable
