import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const requiredFiles = [
  'manifest.json',
  'profile-tab.json',
  'README.md',
  'package.json',
  'preview/preview.json',
  'lifecycle.json',
  'permissions/permissions.json'
];

function readJson(relativePath) {
  return JSON.parse(fs.readFileSync(path.join(root, relativePath), 'utf8'));
}

const missing = requiredFiles.filter((file) => !fs.existsSync(path.join(root, file)));
if (missing.length) {
  throw new Error(`Missing required files: ${missing.join(', ')}`);
}

const manifest = readJson('manifest.json');
const profileTab = readJson('profile-tab.json');
if (manifest.type !== 'profile_tab' || profileTab.type !== 'profile_tab') {
  throw new Error('Template must declare type profile_tab in manifest.json and profile-tab.json.');
}
if (manifest.id !== profileTab.id || manifest.version !== profileTab.version) {
  throw new Error('manifest.json and profile-tab.json identity/version must match.');
}
if (!profileTab.profile_surface || !profileTab.layout || !profileTab.preview || !profileTab.lifecycle) {
  throw new Error('profile-tab.json must declare profile_surface, layout, preview, and lifecycle.');
}
if (profileTab.preview.route !== '/builder/preview?template_id=profile-tab-standard') {
  throw new Error('Profile tab template preview route must use the approved non-mutating runtime preview route.');
}
if (profileTab.preview.requires_install !== false || profileTab.preview.mutates_runtime !== false) {
  throw new Error('Profile tab preview must not require install or mutate runtime.');
}

console.log(JSON.stringify({ ok: true, package_type: 'profile_tab', package_id: manifest.id }, null, 2));
