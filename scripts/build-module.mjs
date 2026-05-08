#!/usr/bin/env node
import { execSync } from 'node:child_process';

try {
	execSync('npm --prefix frontend run build', { stdio: 'inherit' });
	console.log('build-module: generated frontend/dist/modula-entry.js and frontend/dist/modula-entry.css');
} catch (error) {
	console.error('build-module: failed to build frontend runtime assets.');
	throw error;
}
