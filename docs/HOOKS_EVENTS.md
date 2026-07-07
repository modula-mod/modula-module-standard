# Hooks and Events

Hooks are contribution points where modules attach UI or actions.

Supported hook IDs:
- `board.quickActions`
- `board.widgets`
- `profile.workspace`
- `composer.actions`
- `chat.header`
- `chat.composer`
- `settings.sections`
- `share.actions`
- `notification.actions`

Events are auditable runtime signals.

Supported event IDs:
- `module.installed`
- `module.updated`
- `module.disabled`
- `module.enabled`
- `module.uninstalled`
- `note.created`
- `task.completed`
- `identity.switched`

The host decides which hooks are active for each surface.

