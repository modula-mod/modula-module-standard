import assert from 'node:assert/strict'
import {mkdtemp, readFile, rm} from 'node:fs/promises'
import {tmpdir} from 'node:os'
import {join} from 'node:path'
import {
  vaultFormattingStandard21ManifestFixture,
  vaultNotesManifestFixture,
  vaultNotesStandard20ManifestFixture,
  vaultNotesStandard21ManifestFixture,
} from '../packages/module-fixtures/dist/index.js'
import {referenceModuleBackendDefinition, referenceModuleBackendDiscovery} from '../packages/module-backend-fixtures/dist/index.js'
import {validateModuleBackendDiscovery} from '../packages/module-backend-protocol/dist/index.js'
import {createInMemoryModuleBackend, runModuleBackendConformancePlan} from '../packages/module-backend-testing/dist/index.js'
import {
  isLifecycleTransitionAllowed,
  negotiateCapabilities,
  negotiateCompatibility,
  resolveModuleDependencyGraph,
} from '../packages/module-standard/dist/index.js'
import {run as runCli} from '../packages/create-module/dist/cli.js'
import {runModuleStandardTestPlan} from '../packages/module-testing/dist/index.js'
import {validateModulaModuleManifest} from '../packages/module-validator/dist/index.js'

const templateManifest = JSON.parse(await readFile(new URL('../templates/basic-module/manifest.json', import.meta.url), 'utf8'))
const exampleManifest = JSON.parse(await readFile(new URL('../examples/vault-notes/manifest.json', import.meta.url), 'utf8'))
const frontendProfile = await readFile(new URL('../docs/module-frontend-profile.md', import.meta.url), 'utf8')

assert.match(frontendProfile, /application module owns its product-specific frontend/i)
assert.match(frontendProfile, /authoritative for the generic frontend schema/i)
assert.match(frontendProfile, /explicitly declares a\s+headless module/i)
assert.match(frontendProfile, /controlled TypeScript\/TSX/i)
assert.match(frontendProfile, /arbitrary executable\s+JavaScript\/JSX/i)
assert.doesNotMatch(frontendProfile, /VaultNotesEditor|if \(productId ===/)

assert.equal(validateModulaModuleManifest(vaultNotesManifestFixture).valid, true, 'fixture manifest validates')
assert.equal(validateModulaModuleManifest(vaultNotesStandard20ManifestFixture).valid, true, 'Standard 2.0 fixture manifest validates')
assert.equal(validateModulaModuleManifest(vaultNotesStandard21ManifestFixture).valid, true, 'Standard 2.1 extensible module fixture validates')
assert.equal(validateModulaModuleManifest(vaultFormattingStandard21ManifestFixture).valid, true, 'Standard 2.1 targeted plugin fixture validates')
assert.equal(validateModulaModuleManifest(templateManifest).valid, true, 'template manifest validates')
assert.equal(validateModulaModuleManifest(exampleManifest).valid, true, 'example manifest validates')

const standard20Graph = resolveModuleDependencyGraph(vaultNotesStandard20ManifestFixture.dependencyGraph, [
  {moduleId: 'digital.modula.notifications', version: '1.0.0', installed: true, provides: ['digital.modula.notifications']},
  {moduleId: 'digital.modula.search', version: '1.1.0', installed: true, provides: ['digital.modula.search']},
])
assert.equal(standard20Graph.installable, true, 'Standard 2.0 dependency graph resolves optional and recommended providers')
assert.equal(standard20Graph.provides.length, 2, 'Standard 2.0 provided contracts are discoverable')
assert.equal(vaultNotesStandard21ManifestFixture.extensionProduct.kind, 'module', 'module product kind is explicit')
assert.ok(
  vaultNotesStandard21ManifestFixture.extensionProduct.extensionPoints.some(point => point.id === 'digital.modula.vault-notes.editor.command'),
  'module declares namespaced extension points',
)
assert.equal(vaultFormattingStandard21ManifestFixture.extensionProduct.targets[0].productId, 'digital.modula.vault-notes', 'plugin target is explicit')
assert.equal(vaultFormattingStandard21ManifestFixture.extensionProduct.contributions[0].kind, 'editor.command', 'plugin contribution is declarative')

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

const aiProductManifest = structuredClone(vaultNotesManifestFixture)
aiProductManifest.schemaVersion = '1.2.0'
aiProductManifest.standardVersion = '1.2.0'
aiProductManifest.manifestSchemaVersion = '1.2.0'
aiProductManifest.capabilities = [
  ...aiProductManifest.capabilities,
  {id: 'ai', required: false, reason: 'Offer host-mediated user-triggered AI actions.', degradedBehavior: 'Module remains usable without AI.'},
]
aiProductManifest.permissions = [
  ...aiProductManifest.permissions,
  {id: 'ai.request', reason: 'Request host-mediated AI product actions.', required: false, risk: 'medium', policyMode: 'require-confirmation'},
  {id: 'ai.stream', reason: 'Stream AI product action suggestions.', required: false, risk: 'medium', policyMode: 'require-confirmation'},
  {id: 'ai.structured-output', reason: 'Validate structured AI product action results.', required: false, risk: 'medium', policyMode: 'require-confirmation'},
  {id: 'ai.context.private', reason: 'Use authorised private module records as AI context.', required: false, risk: 'high', policyMode: 'require-confirmation'},
]
aiProductManifest.ai = [{
  id: `${aiProductManifest.id}.ai.vault-actions`,
  features: ['summarize', 'extract', 'draft'],
  allowedContext: ['metadata', 'record-content', 'user-selected-text'],
  toolDefinitions: [],
  structuredOutputs: [
    {$id: 'schemas/note-summary-result.schema.json', type: 'object', required: ['summary', 'keyPoints'], properties: {summary: {type: 'string'}, keyPoints: {type: 'array', items: {type: 'string'}}}},
  ],
  permissions: ['ai.request', 'ai.stream', 'ai.structured-output', 'ai.context.private'],
  policyMode: 'require-confirmation',
  productActions: [{
    id: 'vault-notes.ai.summarise',
    name: 'Summarise note',
    description: 'Generate a preview-only summary from an authorised note revision.',
    promptId: 'vault-notes.summarise.v1',
    promptVersionRange: '^1.0.0',
    inputSchema: 'schemas/ai/summarise-input.schema.json',
    outputSchema: 'schemas/ai/note-summary-result.schema.json',
    requiredPermissions: ['ai.request', 'ai.stream', 'ai.structured-output', 'ai.context.private'],
    requiredCapabilities: ['text-generation', 'streaming', 'structured-output'],
    context: {
      sources: ['current-record', 'record-metadata'],
      maximumRecords: 1,
      maximumCharacters: 12000,
      allowedClassifications: ['private'],
    },
    execution: {streaming: true, structuredOutput: true, maximumToolCalls: 0, timeoutMs: 30000},
    application: {mode: 'preview-only', explicitConfirmation: true, createsRecordRevision: false},
  }],
}]
assert.equal(validateModulaModuleManifest(aiProductManifest).valid, true, 'Standard 1.2 AI product action manifest validates')

const providerBoundAiManifest = structuredClone(aiProductManifest)
providerBoundAiManifest.ai[0].productActions[0].providerId = 'provider:openai'
assert.ok(
  validateModulaModuleManifest(providerBoundAiManifest).issues.some(issue => issue.code === 'PROVIDER_BOUND_AI_PRODUCT_ACTION'),
  'Standard 1.2 rejects provider-bound AI product actions',
)

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
assert.equal(runModuleStandardTestPlan(vaultNotesStandard20ManifestFixture).standard20.services, 6, 'sandbox inspects Standard 2.0 services')

const tempDir = await mkdtemp(join(tmpdir(), 'modula-module-standard-'))
try {
  const createResult = await runCli(['module', 'create', tempDir, '--id', 'com.example.generated-module', '--name', 'Generated Module'])
  assert.equal(createResult.exitCode, 0, 'CLI create succeeds')
  const validateResult = await runCli(['module', 'validate', join(tempDir, 'manifest.json')])
  assert.equal(validateResult.exitCode, 0, 'CLI validates generated template')
  assert.match(validateResult.stdout, /standardVersion: 2\.1\.0/, 'CLI generated template uses Standard 2.1')
  const inspectResult = await runCli(['module', 'inspect', join(tempDir, 'manifest.json')])
  assert.equal(inspectResult.exitCode, 0, 'CLI inspect succeeds')
  assert.match(inspectResult.stdout, /apiOperations: 1/, 'CLI inspect reports Standard 2.0 API operations')
  const doctorResult = await runCli(['module', 'doctor', join(tempDir, 'manifest.json')])
  assert.equal(doctorResult.exitCode, 0, 'CLI doctor succeeds')
  const schemaResult = await runCli(['module', 'schema'])
  assert.equal(schemaResult.exitCode, 0, 'CLI schema succeeds')
  const testResult = await runCli(['module', 'test', join(tempDir, 'manifest.json')])
  assert.equal(testResult.exitCode, 0, 'CLI sandbox test succeeds')
  const backendValidateResult = await runCli(['module', 'backend', 'validate', join(tempDir, 'manifest.json')])
  assert.equal(backendValidateResult.exitCode, 0, 'CLI backend validate succeeds')
} finally {
  await rm(tempDir, {recursive: true, force: true})
}

console.log('module-standard tests passed')
