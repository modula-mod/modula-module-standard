import assert from 'node:assert/strict'
import {
  vaultFormattingStandard21ManifestFixture,
  vaultNotesManifestFixture,
  vaultNotesStandard20ManifestFixture,
  vaultNotesStandard21ManifestFixture,
} from '../packages/module-fixtures/dist/index.js'
import {validateModulaModuleManifest} from '../packages/module-validator/dist/index.js'

function codes(result) {
  return result.issues.map(issue => issue.code)
}

const unknownCapability = structuredClone(vaultNotesManifestFixture)
unknownCapability.capabilities.push({id: 'unknown-provider', required: true, reason: 'Escalate host behavior'})
assert.ok(codes(validateModulaModuleManifest(unknownCapability)).includes('UNKNOWN_CAPABILITY'), 'unknown capabilities are rejected')

const prohibitedField = structuredClone(vaultNotesManifestFixture)
prohibitedField.views[0].layout.code = 'return host.internalState'
assert.ok(codes(validateModulaModuleManifest(prohibitedField)).includes('PROHIBITED_FIELD'), 'arbitrary runtime fields are rejected')

const wildcardPermission = structuredClone(vaultNotesManifestFixture)
wildcardPermission.permissions.push({id: 'records:*', reason: 'Read every record', required: true, risk: 'low', policyMode: 'observe'})
assert.ok(codes(validateModulaModuleManifest(wildcardPermission)).includes('WILDCARD_PERMISSION'), 'wildcard permissions are rejected')

const permissionEscalation = structuredClone(vaultNotesManifestFixture)
permissionEscalation.permissions.push({id: 'dimon:transfer', reason: 'Move funds', required: true, risk: 'low', policyMode: 'observe'})
const escalationCodes = codes(validateModulaModuleManifest(permissionEscalation))
assert.ok(escalationCodes.includes('PERMISSION_ESCALATION_RISK_MISMATCH'), 'high-risk permission risk mismatch is rejected')
assert.ok(escalationCodes.includes('PERMISSION_ESCALATION_POLICY_MISMATCH'), 'high-risk permission policy mismatch is rejected')

const malformedSchema = structuredClone(vaultNotesManifestFixture)
delete malformedSchema.records[0].schema.type
assert.ok(codes(validateModulaModuleManifest(malformedSchema)).includes('INVALID_SCHEMA'), 'malformed schemas are rejected')

const tamperedChecksum = validateModulaModuleManifest(vaultNotesManifestFixture, {expectedChecksum: 'b'.repeat(64)})
assert.ok(codes(tamperedChecksum).includes('CHECKSUM_MISMATCH'), 'checksum mismatch is rejected')

const duplicateIds = structuredClone(vaultNotesManifestFixture)
duplicateIds.views[1].id = duplicateIds.views[0].id
assert.ok(codes(validateModulaModuleManifest(duplicateIds)).includes('DUPLICATE_ID'), 'duplicate IDs are rejected')

const unsafeBackend = structuredClone(vaultNotesManifestFixture)
unsafeBackend.schemaVersion = '1.1.0'
unsafeBackend.standardVersion = '1.1.0'
unsafeBackend.manifestSchemaVersion = '1.1.0'
unsafeBackend.backend = {
  mode: 'module-managed',
  protocolVersion: '1.0.0',
  endpoints: {baseUrlStrategy: 'registry', apiVersion: '1.0.0', healthPath: '/v1/health', allowedHosts: ['localhost']},
  authentication: {strategy: 'greenfield-signed-jwt', tokenExchangeRequired: false},
  deployment: {ownership: 'publisher-hosted', multiTenant: true, selfHostingSupported: false},
  data: {primaryStore: 'module-backend', categories: [], exportSupported: true, deletionSupported: true, backupResponsibility: 'publisher'},
  trust: {publisherId: 'modula', allowedOrigins: ['https://127.0.0.1']},
}
const unsafeCodes = codes(validateModulaModuleManifest(unsafeBackend))
assert.ok(unsafeCodes.includes('TOKEN_EXCHANGE_REQUIRED'), 'module-managed backends require token exchange')
assert.ok(unsafeCodes.includes('UNSAFE_BACKEND_HOST'), 'unsafe backend hosts are rejected')
assert.ok(unsafeCodes.includes('UNSAFE_BACKEND_ORIGIN'), 'unsafe backend origins are rejected')

const frontendOnlyBackend = structuredClone(vaultNotesManifestFixture)
frontendOnlyBackend.schemaVersion = '1.1.0'
frontendOnlyBackend.standardVersion = '1.1.0'
frontendOnlyBackend.manifestSchemaVersion = '1.1.0'
frontendOnlyBackend.backend = {mode: 'frontend-only', endpoints: {baseUrlStrategy: 'registry', apiVersion: '1.0.0', healthPath: '/v1/health'}}
assert.ok(codes(validateModulaModuleManifest(frontendOnlyBackend)).includes('FRONTEND_ONLY_BACKEND_DECLARATION'), 'frontend-only modules cannot declare backend endpoints')

const standard20OnLegacy = structuredClone(vaultNotesManifestFixture)
standard20OnLegacy.serviceRegistry = {version: '2.0.0', items: []}
assert.ok(codes(validateModulaModuleManifest(standard20OnLegacy)).includes('STANDARD_2_FIELDS_REQUIRE_2_0'), 'Standard 2.0 fields require Standard 2.0')

const missingSectionVersions = structuredClone(vaultNotesStandard20ManifestFixture)
delete missingSectionVersions.sectionVersions
assert.ok(codes(validateModulaModuleManifest(missingSectionVersions)).includes('MISSING_SECTION_VERSIONS'), 'Standard 2.0 section versions are required')

const badApiPath = structuredClone(vaultNotesStandard20ManifestFixture)
badApiPath.apiRegistry.items[0].path = '/api/modula/digital.modula.tasks/notes'
assert.ok(codes(validateModulaModuleManifest(badApiPath)).includes('INVALID_MODULE_API_PATH'), 'Standard 2.0 API paths stay inside module namespace')

const badPermissionCategory = structuredClone(vaultNotesStandard20ManifestFixture)
badPermissionCategory.permissionModel.categories.superuser = [{id: 'records:*', reason: 'Escalate'}]
const badPermissionCodes = codes(validateModulaModuleManifest(badPermissionCategory))
assert.ok(badPermissionCodes.includes('UNKNOWN_PERMISSION_CATEGORY'), 'unknown Standard 2.0 permission categories are rejected')
assert.ok(badPermissionCodes.includes('WILDCARD_PERMISSION'), 'Standard 2.0 wildcard permissions are rejected')

const extensionProductOn20 = structuredClone(vaultNotesStandard20ManifestFixture)
extensionProductOn20.extensionProduct = structuredClone(vaultNotesStandard21ManifestFixture.extensionProduct)
assert.ok(codes(validateModulaModuleManifest(extensionProductOn20)).includes('EXTENSION_PRODUCT_REQUIRES_STANDARD_2_1'), 'extension product contracts require Standard 2.1')

const missingPluginTarget = structuredClone(vaultFormattingStandard21ManifestFixture)
missingPluginTarget.extensionProduct.targets = []
assert.ok(codes(validateModulaModuleManifest(missingPluginTarget)).includes('MISSING_EXTENSION_TARGET'), 'targeted products cannot omit their parent')

const selfTarget = structuredClone(vaultFormattingStandard21ManifestFixture)
selfTarget.extensionProduct.targets[0].productId = selfTarget.id
assert.ok(codes(validateModulaModuleManifest(selfTarget)).includes('SELF_EXTENSION_TARGET'), 'extension products cannot target themselves')

const wildcardCapability = structuredClone(vaultFormattingStandard21ManifestFixture)
wildcardCapability.extensionProduct.targets[0].requiredCapabilities = ['notes.*']
assert.ok(codes(validateModulaModuleManifest(wildcardCapability)).includes('WILDCARD_CONTRACT'), 'extension capabilities cannot use wildcards')

const remoteRuntime = structuredClone(vaultFormattingStandard21ManifestFixture)
remoteRuntime.extensionProduct.contributions[0].remoteEntry = 'https://example.com/plugin.js'
assert.ok(codes(validateModulaModuleManifest(remoteRuntime)).includes('PROHIBITED_FIELD'), 'extension contributions cannot inject remote JavaScript')

const arbitraryTarget = structuredClone(vaultFormattingStandard21ManifestFixture)
arbitraryTarget.extensionProduct.contributions[0].serviceUrl = 'https://whatever-server.example'
assert.ok(codes(validateModulaModuleManifest(arbitraryTarget)).includes('UNKNOWN_EXTENSION_CONTRIBUTION_PROPERTY'), 'extension contributions cannot declare arbitrary service targets')

const coreCrossContribution = structuredClone(vaultNotesStandard21ManifestFixture)
coreCrossContribution.extensionProduct.contributions = [structuredClone(vaultFormattingStandard21ManifestFixture.extensionProduct.contributions[0])]
assert.ok(codes(validateModulaModuleManifest(coreCrossContribution)).includes('MODULE_CROSS_PRODUCT_CONTRIBUTION'), 'core modules cannot masquerade targeted contributions as core UI')

console.log('module-standard security tests passed')
