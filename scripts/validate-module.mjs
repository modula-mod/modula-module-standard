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
  'backend/router.py',
  'backend/service.py',
  'backend/repository.py',
  'backend/schemas.py',
  'backend/models.py',
  'backend/permissions.py',
  'backend/migrations/0001_init.sql',
  'plugins/README.md',
  'scripts/build-module.mjs',
  'scripts/pack-module.mjs'
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

if (!fs.existsSync('frontend/dist/modula-entry.js') || !fs.existsSync('frontend/dist/modula-entry.css')) {
  console.error('Missing runtime artifacts: frontend/dist/modula-entry.js and frontend/dist/modula-entry.css');
  process.exit(1);
}

console.log('Module standard template validation passed.');
