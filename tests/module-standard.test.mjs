import assert from 'node:assert/strict'
import {mkdtemp, readFile, rm} from 'node:fs/promises'
import {tmpdir} from 'node:os'
import {join} from 'node:path'
import {vaultNotesManifestFixture} from '../packages/module-fixtures/dist/index.js'
import {referenceModuleBackendDefinition, referenceModuleBackendDiscovery} from '../packages/module-backend-fixtures/dist/index.js'
import {validateModuleBackendDiscovery} from '../packages/module-backend-protocol/dist/index.js'
import {createInMemoryModuleBackend, runModuleBackendConformancePlan} from '../packages/module-backend-testing/dist/index.js'
import {
  isLifecycleTransitionAllowed,
  negotiateCapabilities,
  negotiateCompatibility,
} from '../packages/module-standard/dist/index.js'
import {run as runCli} from '../packages/create-module/dist/cli.js'
import {runModuleStandardTestPlan} from '../packages/module-testing/dist/index.js'
import {validateModulaModuleManifest} from '../packages/module-validator/dist/index.js'

const templateManifest = JSON.parse(await readFile(new URL('../templates/basic-module/manifest.json', import.meta.url), 'utf8'))
const exampleManifest = JSON.parse(await readFile(new URL('../examples/vault-notes/manifest.json', import.meta.url), 'utf8'))

assert.equal(validateModulaModuleManifest(vaultNotesManifestFixture).valid, true, 'fixture manifest validates')
assert.equal(validateModulaModuleManifest(templateManifest).valid, true, 'template manifest validates')
assert.equal(validateModulaModuleManifest(exampleManifest).valid, true, 'example manifest validates')

const backendManifest = structuredClone(vaultNotesManifestFixture)
backendManifest.schemaVersion = '1.1.0'
backendManifest.standardVersion = '1.1.0'
backendManifest.manifestSchemaVersion = '1.1.0'
backendManifest.id = 'com.example.reference-backend'
backendManifest.slug = 'reference-backend'
backendManifest.name = 'Reference Backend'
backendManifest.description = 'Reference module-managed backend manifest.'
backendManifest.publisher = {id: 'example', name: 'Example Publisher', website: 'https://example.com'}
backendManifest.trust.publisher = backendManifest.publisher
backendManifest.records = []
backendManifest.views = []
backendManifest.actions = []
backendManifest.functions = []
backendManifest.settings = []
backendManifest.events = []
backendManifest.automations = []
backendManifest.search = []
backendManifest.ai = []
backendManifest.capabilities = [{id: 'module-backend', required: true, reason: 'Use an independently operated backend.'}]
backendManifest.permissions = [{id: 'reference:read', reason: 'Read reference backend data.', required: true, risk: 'low', policyMode: 'observe'}]
backendManifest.backend = referenceModuleBackendDefinition
assert.equal(validateModulaModuleManifest(backendManifest).valid, true, 'Standard 1.1 backend manifest validates')

const discoveryValidation = validateModuleBackendDiscovery(referenceModuleBackendDiscovery, {
  moduleId: 'com.example.reference-backend',
  standardVersion: '1.1.0',
  protocolVersion: '1.0.0',
})
assert.equal(discoveryValidation.valid, true, 'backend discovery fixture validates')

const conformance = await runModuleBackendConformancePlan(createInMemoryModuleBackend({discovery: referenceModuleBackendDiscovery}), {
  moduleId: 'com.example.reference-backend',
})
assert.equal(conformance.passed, true, 'in-memory backend passes conformance preflight')

const compatibility = negotiateCompatibility(vaultNotesManifestFixture, {
  hostVersion: '1.0.0',
  runtimeVersion: '1.0.0',
  standardVersion: '1.0.0',
  platform: 'web',
})
assert.equal(compatibility.compatible, true, 'compatible host accepted')

const incompatible = negotiateCompatibility(vaultNotesManifestFixture, {
  hostVersion: '2.0.0',
  runtimeVersion: '1.0.0',
  standardVersion: '1.0.0',
  platform: 'web',
})
assert.equal(incompatible.compatible, false, 'incompatible host rejected')

const capabilityResult = negotiateCapabilities(vaultNotesManifestFixture, [
  'records',
  'views',
  'functions',
  'events',
  {id: 'search', available: false, reason: 'search disabled in sandbox'},
])
assert.equal(capabilityResult.canEnable, true, 'optional missing capability does not block enablement')
assert.deepEqual(capabilityResult.unavailableOptional, ['search', 'ai', 'automations'], 'optional capabilities degrade')

const requiredCapabilityResult = negotiateCapabilities(vaultNotesManifestFixture, ['views', 'functions'])
assert.equal(requiredCapabilityResult.canEnable, false, 'missing required capability blocks enablement')
assert.ok(requiredCapabilityResult.missingRequired.includes('records'), 'required records capability reported')

assert.equal(isLifecycleTransitionAllowed(vaultNotesManifestFixture.lifecycle, 'installed', 'enabled'), true, 'valid lifecycle transition accepted')
assert.equal(isLifecycleTransitionAllowed(vaultNotesManifestFixture.lifecycle, 'enabled', 'uninstalled'), false, 'invalid lifecycle transition rejected')

const sandboxResult = runModuleStandardTestPlan(vaultNotesManifestFixture, {deniedCapabilities: ['ai', 'search']})
assert.equal(sandboxResult.valid, true, 'sandbox validates manifest with optional missing capabilities')
assert.equal(sandboxResult.negotiation.capabilities.canEnable, true, 'sandbox capability negotiation allows optional degradation')
assert.ok(sandboxResult.events.emitted.includes('note.created'), 'sandbox inspects emitted events')
assert.equal(sandboxResult.health.status, 'healthy', 'sandbox previews health')

const tempDir = await mkdtemp(join(tmpdir(), 'modula-module-standard-'))
try {
  const createResult = await runCli(['module', 'create', tempDir, '--id', 'com.example.generated-module', '--name', 'Generated Module'])
  assert.equal(createResult.exitCode, 0, 'CLI create succeeds')
  const validateResult = await runCli(['module', 'validate', join(tempDir, 'manifest.json')])
  assert.equal(validateResult.exitCode, 0, 'CLI validates generated template')
  assert.match(validateResult.stdout, /standardVersion: 1\.1\.0/, 'CLI generated template uses Standard 1.1')
  const inspectResult = await runCli(['module', 'inspect', join(tempDir, 'manifest.json')])
  assert.equal(inspectResult.exitCode, 0, 'CLI inspect succeeds')
  const testResult = await runCli(['module', 'test', join(tempDir, 'manifest.json')])
  assert.equal(testResult.exitCode, 0, 'CLI sandbox test succeeds')
  const backendValidateResult = await runCli(['module', 'backend', 'validate', join(tempDir, 'manifest.json')])
  assert.equal(backendValidateResult.exitCode, 0, 'CLI backend validate succeeds')
} finally {
  await rm(tempDir, {recursive: true, force: true})
}

console.log('module-standard tests passed')
