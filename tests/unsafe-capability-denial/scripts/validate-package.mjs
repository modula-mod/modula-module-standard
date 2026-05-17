import fs from 'node:fs';

const manifest = JSON.parse(fs.readFileSync(new URL('../manifest.json', import.meta.url), 'utf8'));
const runtime = JSON.parse(fs.readFileSync(new URL('../profile-tab.json', import.meta.url), 'utf8'));

if (!manifest.capabilities?.includes('marketplace.write')) {
	throw new Error('denial fixture must request marketplace.write');
}
if (!runtime.capabilities?.includes('package.install')) {
	throw new Error('denial fixture must request package.install');
}

console.log('unsafe denial fixture shape is present');
