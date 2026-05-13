#!/usr/bin/env node
import fs from 'node:fs';

const requiredArtifacts = ['module.zip', 'frontend/dist/modula-entry.js', 'frontend/dist/modula-entry.css'];
const missing = requiredArtifacts.filter((path) => !fs.existsSync(path));

if (missing.length) {
  console.error(`Release check failed. Missing: ${missing.join(', ')}`);
  process.exit(1);
}

const manifest = JSON.parse(fs.readFileSync('manifest.json', 'utf8'));
const moduleManifest = JSON.parse(fs.readFileSync('module.json', 'utf8'));

if (manifest.version !== moduleManifest.version) {
  console.error('Release check failed. manifest.json and module.json versions differ.');
  process.exit(1);
}

console.log(`Release check passed for ${manifest.id}@${manifest.version}.`);
