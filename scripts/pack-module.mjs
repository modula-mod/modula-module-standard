#!/usr/bin/env node
import { execSync } from 'node:child_process';
import { existsSync, rmSync } from 'node:fs';

const packageEntries = [
	'manifest.json',
	'module.json',
	'package.json',
	'README.md',
	'CHANGELOG.md',
	'LICENSE',
	'icon.svg',
	'cover.png',
	'backend',
	'frontend/dist',
	'frontend/src',
	'frontend/package.json',
	'frontend/vite.config.ts',
	'plugins',
	'scripts'
].filter((entry) => existsSync(entry));

if (existsSync('module.zip')) {
	rmSync('module.zip');
}

execSync('node scripts/build-module.mjs', { stdio: 'inherit' });

execSync(
	`zip -r module.zip ${packageEntries.join(' ')} -x "*.DS_Store" "*/.git/*" "*/node_modules/*" "*/__pycache__/*" "*.pyc"`,
	{ stdio: 'inherit' }
);

console.log(`pack-module: wrote module.zip with ${packageEntries.length} top-level entries`);
