import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const requiredFiles = [
  'manifest.json',
  'widget.json',
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
const widget = readJson('widget.json');
if (manifest.type !== 'widget' || widget.type !== 'widget') {
  throw new Error('Template must declare type widget in manifest.json and widget.json.');
}
if (manifest.id !== widget.id || manifest.version !== widget.version) {
  throw new Error('manifest.json and widget.json identity/version must match.');
}
if (!widget.renderer || !widget.data_source || !widget.preview || !widget.lifecycle) {
  throw new Error('widget.json must declare renderer, data_source, preview, and lifecycle.');
}
if (widget.preview.route !== '/builder/preview?template_id=widget-standard') {
  throw new Error('Widget template preview route must use the approved non-mutating runtime preview route.');
}
if (widget.preview.requires_install !== false || widget.preview.mutates_runtime !== false) {
  throw new Error('Widget preview must not require install or mutate runtime.');
}

console.log(JSON.stringify({ ok: true, package_type: 'widget', package_id: manifest.id }, null, 2));
