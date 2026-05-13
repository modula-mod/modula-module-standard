#!/usr/bin/env node
import fs from 'node:fs';

const requiredPaths = [
  'manifest.json',
  'module.json',
  'package.json',
  'README.md',
  'frontend/package.json',
  'frontend/vite.config.ts',
  'frontend/src/modula-entry.ts',
  'frontend/src/ModulaModule.svelte',
  'frontend/src/surfaces/FeedSurface.svelte',
  'frontend/src/surfaces/ExploreSurface.svelte',
  'frontend/src/surfaces/SettingsSurface.svelte',
  'frontend/src/widgets/SummaryWidget.svelte',
  'frontend/src/functions/exampleFunction.ts',
  'frontend/src/permissions/permissionHints.ts',
  'frontend/src/notifications/notificationHints.ts',
  'frontend/src/lib/api.ts',
  'frontend/src/lib/types.ts',
  'frontend/src/styles/module.css',
  'backend/router.py',
  'backend/service.py',
  'backend/repository.py',
  'backend/schemas.py',
  'backend/models.py',
  'backend/permissions.py',
  'backend/notifications.py',
  'backend/functions.py',
  'backend/widgets.py',
  'backend/migrations/0001_init.sql',
  'backend/tests',
  'widgets/example-widget.json',
  'functions/function.json',
  'permissions/permissions.json',
  'notifications/notifications.json',
  'board/board.json',
  'plugins/README.md',
  'plugins/example-plugin.json',
  'plugins/example-plugin/plugin.json',
  'plugins/example-plugin/frontend/src/modula-entry.ts',
  'plugins/example-plugin/frontend/src/PluginSurface.svelte',
  'plugins/example-plugin/backend/router.py',
  'plugins/example-plugin/widgets/widget.json',
  'plugins/example-plugin/functions/function.json',
  'plugins/example-plugin/permissions/permissions.json',
  'plugins/example-plugin/notifications/notifications.json',
  'examples/theme/theme.json',
  'examples/prompt/prompt.json',
  'examples/tool/tool.json',
  'examples/function/function.json',
  'examples/widget/widget.json',
  'examples/job/job.json',
  'examples/config/config.json',
  'examples/knowledge/knowledge.json',
  'examples/team/team.json',
  'examples/surface-style/surface-style.json',
  'scripts/build-module.mjs',
  'scripts/pack-module.mjs',
  'scripts/release-check.mjs'
];

const missing = requiredPaths.filter((p) => !fs.existsSync(p));
if (missing.length) {
  console.error(`Missing required paths: ${missing.join(', ')}`);
  process.exit(1);
}

const manifest = JSON.parse(fs.readFileSync('manifest.json', 'utf8'));
const runtimeManifest = JSON.parse(fs.readFileSync('module.json', 'utf8'));

if (manifest.id !== runtimeManifest.id) {
  console.error(`manifest.id (${manifest.id}) must match module.json id (${runtimeManifest.id})`);
  process.exit(1);
}

if (manifest.version !== runtimeManifest.version) {
  console.error(`manifest.version (${manifest.version}) must match module.json version (${runtimeManifest.version})`);
  process.exit(1);
}

for (const [name, value] of Object.entries({
  permissions: runtimeManifest.permissions,
  functions: runtimeManifest.functions,
  widgets: runtimeManifest.widgets,
  notifications: runtimeManifest.notifications,
  board: runtimeManifest.board,
  surfaces: runtimeManifest.surfaces
})) {
  if (!Array.isArray(value) || value.length === 0) {
    console.error(`module.json must define a non-empty ${name} array`);
    process.exit(1);
  }
}

if (!runtimeManifest.update_policy || runtimeManifest.update_policy.preserve_user_version_choice !== true) {
  console.error('module.json update_policy must preserve the user version choice');
  process.exit(1);
}

if (!runtimeManifest.runtime?.entry || !runtimeManifest.runtime?.style) {
  console.error('module.json runtime.entry and runtime.style are required');
  process.exit(1);
}

if (!fs.existsSync('frontend/dist/modula-entry.js') || !fs.existsSync('frontend/dist/modula-entry.css')) {
  console.error('Missing runtime artifacts: frontend/dist/modula-entry.js and frontend/dist/modula-entry.css');
  process.exit(1);
}

console.log('Module standard template validation passed.');
