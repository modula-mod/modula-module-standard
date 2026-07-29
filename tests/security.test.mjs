import assert from 'node:assert/strict'
import {vaultNotesManifestFixture} from '../packages/module-fixtures/dist/index.js'
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

console.log('module-standard security tests passed')
