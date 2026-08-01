import {createHash} from 'node:crypto'

export const MODULA_MODULE_STANDARD_VERSION = '2.0.0' as const
export const MODULA_MANIFEST_SCHEMA_VERSION = '2.0.0' as const
export const MODULA_DATA_SCHEMA_VERSION = '1.0.0' as const
export const MODULA_MODULE_STANDARD_SCHEMA_URI = 'https://modula.digital/schemas/module-standard/2.0.0/manifest.schema.json' as const
export const MODULA_MODULE_STANDARD_PREVIOUS_VERSION = '1.2.0' as const
export const MODULA_MODULE_STANDARD_1_1_VERSION = '1.1.0' as const
export const MODULA_MODULE_STANDARD_LEGACY_VERSION = '1.0.0' as const
export const MODULA_MANIFEST_SCHEMA_PREVIOUS_VERSION = '1.2.0' as const
export const MODULA_MANIFEST_SCHEMA_1_1_VERSION = '1.1.0' as const
export const MODULA_MANIFEST_SCHEMA_LEGACY_VERSION = '1.0.0' as const
export const MODULA_MODULE_BACKEND_PROTOCOL_VERSION = '1.0.0' as const
export const MODULA_MODULE_STANDARD_SUPPORTED_VERSIONS = [
  MODULA_MODULE_STANDARD_LEGACY_VERSION,
  MODULA_MODULE_STANDARD_1_1_VERSION,
  MODULA_MODULE_STANDARD_PREVIOUS_VERSION,
  MODULA_MODULE_STANDARD_VERSION,
] as const
export const MODULA_MANIFEST_SCHEMA_SUPPORTED_VERSIONS = [
  MODULA_MANIFEST_SCHEMA_LEGACY_VERSION,
  MODULA_MANIFEST_SCHEMA_1_1_VERSION,
  MODULA_MANIFEST_SCHEMA_PREVIOUS_VERSION,
  MODULA_MANIFEST_SCHEMA_VERSION,
] as const

export type JsonPrimitive = string | number | boolean | null
export type JsonValue = JsonPrimitive | JsonObject | JsonValue[]
export type JsonObject = {[key: string]: JsonValue}
export type JsonSchema = JsonObject

export type ModulaPlatform = 'ios' | 'android' | 'web' | 'server' | 'desktop'
export type ModulaRiskLevel = 'low' | 'medium' | 'high' | 'critical'
export type ModulaPolicyMode = 'observe' | 'warn' | 'require-confirmation' | 'block'
export type ModulaReviewStatus = 'unreviewed' | 'in-review' | 'approved' | 'rejected' | 'quarantined'
export type ModulaTrustLevel = 'first-party' | 'verified-publisher' | 'reviewed-community' | 'untrusted'
export type ModulaReleaseChannel = 'dev' | 'alpha' | 'beta' | 'stable' | 'lts'
export type ModulaHealthState =
  | 'healthy'
  | 'degraded'
  | 'failed'
  | 'disabled'
  | 'quarantined'
  | 'warning'
  | 'error'
  | 'maintenance'
  | 'updating'
  | 'migration'
  | 'broken'
  | 'version-mismatch'
  | 'host-incompatible'
  | 'backend-unavailable'
  | 'provider-unavailable'
  | 'ai-unavailable'
  | 'storage-full'
  | 'search-rebuilding'
export type ModulaLifecycleState = 'discovered' | 'installed' | 'enabled' | 'disabled' | 'updating' | 'failed' | 'quarantined' | 'uninstalled'
export type ModulaExecutionMode = 'declarative' | 'built-in' | 'hosted' | 'remote-http'
export type ModulaBackendMode = 'greenfield-managed' | 'module-managed' | 'hybrid' | 'frontend-only'
export type ModulaBackendLifecycleState =
  | 'unconfigured'
  | 'discovering'
  | 'verifying'
  | 'available'
  | 'degraded'
  | 'unreachable'
  | 'incompatible'
  | 'revoked'
  | 'quarantined'
  | 'disabled'
export type ModulaBackendDeploymentOwnership = 'publisher-hosted' | 'modula-hosted' | 'customer-hosted' | 'local-development'
export type ModulaBackendCapabilityProvider = 'greenfield' | 'module-backend' | 'external-connector' | 'local'
export type ModulaBackendDataStore = 'greenfield' | 'module-backend' | 'device' | 'mixed'
export type ModulaBackendDataClassification = 'public' | 'internal' | 'private' | 'sensitive' | 'restricted'
export type ModulaBackendBackupResponsibility = 'greenfield' | 'publisher' | 'customer' | 'shared'
export type ModulaBackendActionSideEffect = 'none' | 'internal-write' | 'external-write' | 'financial' | 'destructive'
export type ModulaBackendActionConfirmation = 'none' | 'user' | 'reauthentication' | 'operator'
export type ModulaCapabilityId =
  | 'records'
  | 'views'
  | 'actions'
  | 'functions'
  | 'events'
  | 'automations'
  | 'ai'
  | 'search'
  | 'files'
  | 'notifications'
  | 'settings'
  | 'diagnostics'
  | 'health'
  | 'migrations'
  | 'connectors'
  | 'module-backend'
  | 'services'
  | 'apis'
  | 'hooks'
  | 'metrics'
  | 'jobs'
  | 'storage'
  | 'widgets'
  | 'navigation'
  | 'ui-contributions'
  | 'offline'
  | 'realtime'
  | 'exports'
  | 'imports'
  | 'sync'
  | 'sharing'
  | 'history'
  | 'permissions-v2'
  | 'marketplace'
  | 'engines'

export type Publisher = {
  id: string
  name: string
  website?: string
  email?: string
  supportUrl?: string
}

export type Compatibility = {
  host: string
  runtime: string
  standard: string
  platforms: ModulaPlatform[]
  nativeTargets?: string[]
}

export type LifecycleTransition = {
  from: ModulaLifecycleState
  to: ModulaLifecycleState
  requiresConfirmation?: boolean
  auditEvent: string
}

export type Lifecycle = {
  executionMode: ModulaExecutionMode
  defaultState: ModulaLifecycleState
  allowedTransitions: LifecycleTransition[]
  uninstall: {
    dataPolicy: 'retain' | 'export-then-purge' | 'purge'
    requiresConfirmation: boolean
  }
}

export type Permission = {
  id: string
  reason: string
  required: boolean
  risk: ModulaRiskLevel
  scopes?: string[]
  policyMode?: ModulaPolicyMode
}

export type Capability = {
  id: ModulaCapabilityId | string
  required: boolean
  reason: string
  degradedBehavior?: string
}

export type ModuleSigningKeyReference = {
  keyId: string
  algorithm: 'Ed25519' | 'ES256' | 'RS256'
  publicKeyRef?: string
  jwksUrl?: string
}

export type ModuleBackendEndpointDefinition = {
  baseUrlStrategy: 'registry' | 'installation' | 'self-hosted' | 'user-configured'
  apiVersion: string
  discoveryPath?: string
  healthPath: string
  capabilitiesPath?: string
  actionsPath?: string
  eventsPath?: string
  webhooksPath?: string
  allowedHosts?: string[]
}

export type ModuleBackendAuthenticationDefinition = {
  strategy: 'greenfield-signed-jwt' | 'oauth-token-exchange' | 'hmac-signed-request'
  tokenExchangeRequired: boolean
  sessionExchangePath?: string
  audience?: string
  tokenTtlSeconds?: number
  signingAlg?: 'EdDSA' | 'ES256' | 'RS256'
  requiredClaims?: string[]
}

export type ModuleBackendHealthDefinition = {
  path?: string
  intervalSeconds?: number
  timeoutMs?: number
  degradedAfterFailures?: number
  unavailableAfterFailures?: number
  components?: Array<
    | 'discovery'
    | 'identity'
    | 'tls'
    | 'protocol'
    | 'authentication'
    | 'api'
    | 'database'
    | 'queue'
    | 'events'
    | 'webhooks'
    | 'search'
    | 'storage'
  >
}

export type ModuleBackendEventBridgeDefinition = {
  incoming?: string[]
  outgoing?: string[]
  signatureRequired?: boolean
  replayWindowSeconds?: number
  deadLetterSupported?: boolean
}

export type ModuleWebhookSubscription = {
  id: string
  eventType: string
  path: string
  signature: 'hmac-sha256' | 'ed25519'
  replayProtection: boolean
}

export type ModuleWebhookPublication = {
  id: string
  eventType: string
  target: 'greenfield' | 'module-backend' | 'external-connector'
  signature: 'hmac-sha256' | 'ed25519'
  retryPolicy: {
    maxAttempts: number
    backoffSeconds: number
  }
}

export type ModuleBackendWebhookDefinition = {
  incoming: ModuleWebhookSubscription[]
  outgoing: ModuleWebhookPublication[]
}

export type ModuleDataCategory = {
  id: string
  description: string
  location: 'greenfield' | 'module-backend' | 'device'
  classification: ModulaBackendDataClassification
  exportable: boolean
  deletable: boolean
}

export type ModuleBackendDataDefinition = {
  primaryStore: ModulaBackendDataStore
  categories: ModuleDataCategory[]
  exportSupported: boolean
  deletionSupported: boolean
  retentionPolicy?: string
  backupResponsibility: ModulaBackendBackupResponsibility
  residency?: string[]
}

export type ModuleBackendDeploymentDefinition = {
  ownership: ModulaBackendDeploymentOwnership
  multiTenant: boolean
  regions?: string[]
  dataResidency?: string[]
  selfHostingSupported: boolean
}

export type ModuleBackendTrustDefinition = {
  publisherId: string
  deploymentIdentity?: string
  allowedOrigins: string[]
  certificatePins?: string[]
  signingKeys?: ModuleSigningKeyReference[]
  attestation?: {
    required: boolean
    provider?: string
  }
  releaseChecksum?: string
  backendBuildChecksum?: string
}

export type ModuleBackendNetworkPolicy = {
  allowLocalhost?: boolean
  allowPrivateNetwork?: boolean
  allowedPorts?: number[]
  blockedCidrs?: string[]
  denyMetadataEndpoints?: boolean
  followRedirects?: boolean
}

export type ModuleBackendLifecycleDefinition = {
  initialState?: ModulaBackendLifecycleState
  supportedStates?: ModulaBackendLifecycleState[]
  reverifyOnEndpointChange?: boolean
  disableOnQuarantine?: boolean
}

export type ModuleBackendActionDefinition = {
  actionId: string
  method: 'POST'
  path: string
  inputSchema: string
  outputSchema: string
  permissions: string[]
  idempotent: boolean
  sideEffects: ModulaBackendActionSideEffect
  confirmation: ModulaBackendActionConfirmation
  timeoutMs: number
}

export type ModuleBackendClientAccessDefinition = {
  allowed: boolean
  protocols: Array<'https' | 'wss'>
  tokenExchangeRequired: boolean
  allowedOrigins: string[]
  maxSessionSeconds: number
}

export type ModuleBackendDefinition = {
  mode: ModulaBackendMode
  protocolVersion?: string
  endpoints?: ModuleBackendEndpointDefinition
  authentication?: ModuleBackendAuthenticationDefinition
  health?: ModuleBackendHealthDefinition
  events?: ModuleBackendEventBridgeDefinition
  webhooks?: ModuleBackendWebhookDefinition
  data?: ModuleBackendDataDefinition
  deployment?: ModuleBackendDeploymentDefinition
  trust?: ModuleBackendTrustDefinition
  network?: ModuleBackendNetworkPolicy
  lifecycle?: ModuleBackendLifecycleDefinition
  actions?: ModuleBackendActionDefinition[]
  clientAccess?: ModuleBackendClientAccessDefinition
}

export type ResolvedModuleCapability = {
  capability: string
  available: boolean
  granted: boolean
  provider: ModulaBackendCapabilityProvider
  reason?: string
}

export type ModuleSessionClaims = {
  issuer: string
  audience: string
  subject: string
  accountId: string
  actorId: string
  installationId: string
  moduleId: string
  permissions: string[]
  capabilities: string[]
  sessionId: string
  issuedAt: number
  expiresAt: number
  requestId?: string
}

export type ModuleBackendDiscovery = {
  moduleId: string
  moduleVersion: string
  standardVersion: string
  protocolVersion: string
  capabilities: string[]
  supportedActions: string[]
  supportedEvents: string[]
  healthUrl: string
  documentationUrl?: string
  deploymentId?: string
  region?: string
}

export type RecordOwnership = 'account' | 'profile' | 'team' | 'system'
export type RecordVisibility = 'private' | 'team' | 'followers' | 'public' | 'system'

export type RecordIndexDefinition = {
  fields: string[]
  unique?: boolean
  sparse?: boolean
}

export type RecordDefinitions = {
  id: string
  schema: JsonSchema
  ownership: RecordOwnership
  visibility: RecordVisibility
  indexes: RecordIndexDefinition[]
  uniqueness: {
    keys: string[]
    scope: RecordOwnership | 'global'
  }
  retention: {
    policy: 'retain' | 'ttl' | 'delete-on-uninstall' | 'archive-on-uninstall'
    ttlDays?: number
  }
  aiPolicy: {
    allowed: boolean
    context: 'none' | 'metadata-only' | 'record-content'
    policyMode: ModulaPolicyMode
  }
  searchPolicy: {
    searchable: boolean
    indexedFields: string[]
    sensitiveFields: string[]
    visibility: RecordVisibility
  }
  auditPolicy: {
    events: string[]
    includeRecordBody: boolean
  }
  exportPolicy: {
    allowed: boolean
    formats: Array<'json' | 'csv' | 'markdown'>
  }
}

export type ViewType = 'collection' | 'detail' | 'form' | 'dashboard' | 'settings' | 'empty-state' | 'error-state' | 'loading-state'

export type ViewDefinitions = {
  id: string
  type: ViewType
  title: string
  recordId?: string
  permissions: string[]
  layout: JsonObject
  stateViews?: {
    empty?: string
    loading?: string
    error?: string
  }
}

export type ActionDefinitions = {
  id: string
  title: string
  description?: string
  functionId?: string
  permissions: string[]
  confirmationPolicy: {
    required: boolean
    policyMode: ModulaPolicyMode
  }
  sideEffects: string[]
  audit: {
    event: string
    includeInput: boolean
  }
}

export type FunctionDefinitions = {
  id: string
  title: string
  inputSchema: JsonSchema
  outputSchema: JsonSchema
  permissions: string[]
  aiCallable: boolean
  automationCallable: boolean
  idempotent: boolean
  sideEffects: string[]
  timeoutMs: number
  rateLimit: {
    windowSeconds: number
    maxCalls: number
  }
  audit: {
    event: string
    includeInput: boolean
    includeOutput: boolean
  }
  confirmationPolicy: {
    required: boolean
    risk: ModulaRiskLevel
  }
}

export type SettingsDefinitions = {
  id: string
  scope: 'account' | 'profile' | 'installation' | 'team'
  schema: JsonSchema
  defaults: JsonObject
}

export type EventDirection = 'emitted' | 'consumed'

export type EventDefinitions = {
  id: string
  type: string
  direction: EventDirection
  schemaVersion: string
  schema: JsonSchema
  subscriber?: string
  permissions: string[]
  replaySupport: boolean
}

export type AutomationDefinitions = {
  id: string
  title: string
  triggers: JsonObject[]
  conditions: JsonObject[]
  actions: string[]
  recipes: JsonObject[]
  executionPolicy: {
    policyMode: ModulaPolicyMode
    maxRuntimeMs: number
  }
  confirmationPolicy: {
    required: boolean
    reason: string
  }
}

export type ModuleAIProductActionContextSource =
  | 'current-record'
  | 'selected-content'
  | 'record-metadata'
  | 'module-settings'

export type ModuleAIProductActionContextClassification =
  | 'public'
  | 'internal'
  | 'private'
  | 'sensitive'

export type ModuleAIProductActionApplicationMode =
  | 'preview-only'
  | 'replace-selection'
  | 'replace-document'
  | 'insert'
  | 'metadata-suggestion'

export type ModuleAIProductActionDefinition = {
  id: string
  name: string
  description: string
  promptId: string
  promptVersionRange: string
  inputSchema: string
  outputSchema: string
  requiredPermissions: string[]
  requiredCapabilities: string[]
  context: {
    sources: ModuleAIProductActionContextSource[]
    maximumRecords: number
    maximumCharacters: number
    allowedClassifications: ModuleAIProductActionContextClassification[]
  }
  execution: {
    streaming: boolean
    structuredOutput: boolean
    maximumToolCalls: number
    timeoutMs: number
  }
  application: {
    mode: ModuleAIProductActionApplicationMode
    explicitConfirmation: boolean
    createsRecordRevision: boolean
  }
}

export type AIIntegrationDefinitions = {
  id: string
  features: Array<'summarize' | 'classify' | 'extract' | 'draft' | 'search' | 'tool-use'>
  allowedContext: Array<'metadata' | 'record-content' | 'search-results' | 'user-selected-text'>
  toolDefinitions: JsonObject[]
  structuredOutputs: JsonSchema[]
  permissions: string[]
  policyMode: ModulaPolicyMode
  productActions?: ModuleAIProductActionDefinition[]
}

export type SearchDefinitions = {
  id: string
  recordId: string
  indexedFields: string[]
  rankingHints: JsonObject
  sensitiveFields: string[]
  visibility: RecordVisibility
  projectionHandler: {
    kind: 'declarative'
    projection: JsonObject
  }
}

export type DiagnosticComponent = 'startup' | 'runtime' | 'permissions' | 'dependencies' | 'search' | 'ai' | 'connector' | 'health'

export type DiagnosticsDefinitions = {
  components: DiagnosticComponent[]
  warnings: string[]
  errors: string[]
  startup: JsonObject
  runtime: JsonObject
  permissions: JsonObject
  dependencies: JsonObject
  search: JsonObject
  ai: JsonObject
  connector: JsonObject
  health: JsonObject
}

export type HealthDefinitions = {
  status: ModulaHealthState
  components: Array<{
    id: string
    status: ModulaHealthState
    message?: string
    checkedAt?: string
  }>
  checkDefinitions: Array<{
    id: string
    component: DiagnosticComponent
    timeoutMs: number
    required: boolean
  }>
}

export type MigrationDefinitions = {
  dataSchemaVersion: string
  steps: Array<{
    id: string
    from: string
    to: string
    reversible: boolean
    checksum: string
  }>
}

export type ReleaseMetadata = {
  repository: string
  commitSha: string
  checksum: string
  licenseEvidence: string[]
  signing: {
    signed: boolean
    keyId?: string
    signature?: string
  }
  channel: ModulaReleaseChannel
  reviewStatus: ModulaReviewStatus
  securityAdvisories: string[]
}

export type TrustMetadata = {
  publisher: Publisher
  level: ModulaTrustLevel
  provenance: {
    sourceVerified: boolean
    checksumVerified: boolean
    signatureVerified: boolean
  }
  review: {
    status: ModulaReviewStatus
    evidence: string[]
  }
  security: {
    lastReviewedAt?: string
    advisories: string[]
  }
}

export type ModulaModuleManifest = {
  schemaVersion: string
  standardVersion: string
  moduleVersion: string
  manifestSchemaVersion: string
  dataSchemaVersion: string
  id: string
  slug: string
  name: string
  description: string
  publisher: Publisher
  compatibility: Compatibility
  lifecycle: Lifecycle
  permissions: Permission[]
  capabilities: Capability[]
  records: RecordDefinitions[]
  views: ViewDefinitions[]
  actions: ActionDefinitions[]
  functions: FunctionDefinitions[]
  settings: SettingsDefinitions[]
  events: EventDefinitions[]
  automations: AutomationDefinitions[]
  search: SearchDefinitions[]
  ai: AIIntegrationDefinitions[]
  diagnostics: DiagnosticsDefinitions
  health: HealthDefinitions
  migrations: MigrationDefinitions
  release: ReleaseMetadata
  trust: TrustMetadata
  backend?: ModuleBackendDefinition
}

export type HostCapability = {
  id: string
  available: boolean
  reason?: string
}

export type CapabilityResolution = {
  id: string
  required: boolean
  available: boolean
  degraded: boolean
  reason: string
}

export type CapabilityNegotiationResult = {
  canEnable: boolean
  resolutions: CapabilityResolution[]
  missingRequired: string[]
  unavailableOptional: string[]
}

export type HostCompatibility = {
  hostVersion: string
  runtimeVersion: string
  standardVersion: string
  platform: ModulaPlatform
}

export type CompatibilityNegotiationResult = {
  compatible: boolean
  failures: string[]
}

export const DEFAULT_LIFECYCLE_TRANSITIONS: LifecycleTransition[] = [
  {from: 'discovered', to: 'installed', auditEvent: 'module.installed'},
  {from: 'installed', to: 'enabled', requiresConfirmation: true, auditEvent: 'module.enabled'},
  {from: 'enabled', to: 'disabled', auditEvent: 'module.disabled'},
  {from: 'disabled', to: 'enabled', requiresConfirmation: true, auditEvent: 'module.enabled'},
  {from: 'enabled', to: 'updating', auditEvent: 'module.update-started'},
  {from: 'updating', to: 'enabled', auditEvent: 'module.updated'},
  {from: 'updating', to: 'failed', auditEvent: 'module.update-failed'},
  {from: 'enabled', to: 'quarantined', auditEvent: 'module.quarantined'},
  {from: 'failed', to: 'disabled', auditEvent: 'module.disabled'},
  {from: 'disabled', to: 'uninstalled', requiresConfirmation: true, auditEvent: 'module.uninstalled'},
]

const SEMVER_PATTERN = /^(0|[1-9]\d*)\.(0|[1-9]\d*)\.(0|[1-9]\d*)(?:-[0-9A-Za-z.-]+)?(?:\+[0-9A-Za-z.-]+)?$/
const SEMVER_RANGE_PATTERN =
  /^(\*|latest|(?:[\^~])?(?:0|[1-9]\d*)\.(?:0|[1-9]\d*)\.(?:0|[1-9]\d*)(?:-[0-9A-Za-z.-]+)?(?:\s+(?:>=|<=|>|<|=)?(?:0|[1-9]\d*)\.(?:0|[1-9]\d*)\.(?:0|[1-9]\d*)(?:-[0-9A-Za-z.-]+)?)*|(?:>=|<=|>|<|=)(?:0|[1-9]\d*)\.(?:0|[1-9]\d*)\.(?:0|[1-9]\d*)(?:-[0-9A-Za-z.-]+)?)$/

export function isSemver(value: unknown): value is string {
  return typeof value === 'string' && SEMVER_PATTERN.test(value)
}

export function isSemverRange(value: unknown): value is string {
  return typeof value === 'string' && SEMVER_RANGE_PATTERN.test(value)
}

export function parseSemver(value: string): [number, number, number] | null {
  const match = SEMVER_PATTERN.exec(value)
  if (!match) return null
  return [Number(match[1]), Number(match[2]), Number(match[3])]
}

export function compareSemver(a: string, b: string): number {
  const left = parseSemver(a)
  const right = parseSemver(b)
  if (!left || !right) throw new Error('Invalid semantic version')
  for (let index = 0; index < 3; index += 1) {
    const delta = left[index]! - right[index]!
    if (delta !== 0) return delta
  }
  return 0
}

export function satisfiesSemverRange(version: string, range: string): boolean {
  if (!isSemver(version) || !isSemverRange(range)) return false
  if (range === '*' || range === 'latest') return true
  const trimmed = range.trim()
  if (trimmed.startsWith('^')) {
    const base = trimmed.slice(1)
    const versionTuple = parseSemver(version)!
    const baseTuple = parseSemver(base)!
    return versionTuple[0] === baseTuple[0] && compareSemver(version, base) >= 0
  }
  if (trimmed.startsWith('~')) {
    const base = trimmed.slice(1)
    const versionTuple = parseSemver(version)!
    const baseTuple = parseSemver(base)!
    return versionTuple[0] === baseTuple[0] && versionTuple[1] === baseTuple[1] && compareSemver(version, base) >= 0
  }
  const parts = trimmed.split(/\s+/).filter(Boolean)
  if (parts.length > 1) return parts.every(part => satisfiesComparator(version, part))
  return satisfiesComparator(version, trimmed)
}

function satisfiesComparator(version: string, comparator: string): boolean {
  const match = /^(>=|<=|>|<|=)?(.+)$/.exec(comparator)
  if (!match) return false
  const operator = match[1] ?? '='
  const target = match[2]!
  if (!isSemver(target)) return false
  const compared = compareSemver(version, target)
  if (operator === '>=') return compared >= 0
  if (operator === '<=') return compared <= 0
  if (operator === '>') return compared > 0
  if (operator === '<') return compared < 0
  return compared === 0
}

export function stableJson(value: unknown): string {
  if (value === null || typeof value !== 'object') return JSON.stringify(value)
  if (Array.isArray(value)) return `[${value.map(item => stableJson(item)).join(',')}]`
  const entries = Object.entries(value as Record<string, unknown>)
    .filter(([, entryValue]) => entryValue !== undefined)
    .sort(([left], [right]) => left.localeCompare(right))
  return `{${entries.map(([key, entryValue]) => `${JSON.stringify(key)}:${stableJson(entryValue)}`).join(',')}}`
}

export function sha256Hex(value: string | Buffer): string {
  return createHash('sha256').update(value).digest('hex')
}

export function manifestChecksum(manifest: unknown): string {
  return sha256Hex(stableJson(manifest))
}

export * from './standard-2.js'

export function negotiateCompatibility(manifest: Pick<ModulaModuleManifest, 'compatibility'>, host: HostCompatibility): CompatibilityNegotiationResult {
  const failures: string[] = []
  if (!satisfiesSemverRange(host.hostVersion, manifest.compatibility.host)) {
    failures.push(`host ${host.hostVersion} does not satisfy ${manifest.compatibility.host}`)
  }
  if (!satisfiesSemverRange(host.runtimeVersion, manifest.compatibility.runtime)) {
    failures.push(`runtime ${host.runtimeVersion} does not satisfy ${manifest.compatibility.runtime}`)
  }
  if (!satisfiesSemverRange(host.standardVersion, manifest.compatibility.standard) && !isBackwardCompatibleStandardRange(host.standardVersion, manifest.compatibility.standard)) {
    failures.push(`standard ${host.standardVersion} does not satisfy ${manifest.compatibility.standard}`)
  }
  if (!manifest.compatibility.platforms.includes(host.platform)) {
    failures.push(`platform ${host.platform} is not supported`)
  }
  return {compatible: failures.length === 0, failures}
}

export function negotiateCapabilities(
  manifest: Pick<ModulaModuleManifest, 'capabilities'>,
  hostCapabilities: Array<string | HostCapability>,
): CapabilityNegotiationResult {
  const availability = new Map<string, HostCapability>()
  for (const capability of hostCapabilities) {
    if (typeof capability === 'string') {
      availability.set(capability, {id: capability, available: true})
    } else {
      availability.set(capability.id, capability)
    }
  }

  const resolutions = manifest.capabilities.map(capability => {
    const host = availability.get(capability.id)
    const available = host?.available === true
    return {
      id: capability.id,
      required: capability.required,
      available,
      degraded: !available && !capability.required,
      reason: available ? 'available' : host?.reason ?? capability.degradedBehavior ?? 'capability unavailable',
    }
  })
  const missingRequired = resolutions.filter(item => item.required && !item.available).map(item => item.id)
  const unavailableOptional = resolutions.filter(item => !item.required && !item.available).map(item => item.id)
  return {
    canEnable: missingRequired.length === 0,
    resolutions,
    missingRequired,
    unavailableOptional,
  }
}

function isBackwardCompatibleStandardRange(hostStandardVersion: string, requestedRange: string): boolean {
  const host = parseSemver(hostStandardVersion)
  if (!host || host[0] < 2) return false
  return /(?:^|[<>=~^\s])1\.(?:0|1|2)\.0/.test(requestedRange) || requestedRange === '^1.0.0' || requestedRange === '^1.1.0' || requestedRange === '^1.2.0'
}

export function isLifecycleTransitionAllowed(
  lifecycle: Pick<Lifecycle, 'allowedTransitions'>,
  from: ModulaLifecycleState,
  to: ModulaLifecycleState,
): boolean {
  return lifecycle.allowedTransitions.some(transition => transition.from === from && transition.to === to)
}
