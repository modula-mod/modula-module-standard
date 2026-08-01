import {
  MODULA_DATA_SCHEMA_VERSION,
  MODULA_MANIFEST_SCHEMA_VERSION,
  MODULA_MODULE_BACKEND_PROTOCOL_VERSION,
  MODULA_MODULE_STANDARD_LEGACY_VERSION,
  MODULA_MODULE_STANDARD_VERSION,
  MODULA_MANIFEST_SCHEMA_SUPPORTED_VERSIONS,
  MODULA_MODULE_STANDARD_2_VERSION,
  MODULA_MODULE_STANDARD_SUPPORTED_VERSIONS,
  MODULE_STANDARD_20_HEALTH_STATES,
  MODULE_STANDARD_20_PERMISSION_CATEGORIES,
  MODULE_STANDARD_20_SECTION_NAMES,
  type ActionDefinitions,
  type AIIntegrationDefinitions,
  type AutomationDefinitions,
  type Capability,
  type Compatibility,
  type DiagnosticsDefinitions,
  type EventDefinitions,
  type FunctionDefinitions,
  type HealthDefinitions,
  type HostCapability,
  type HostCompatibility,
  type Lifecycle,
  type ModulaBackendLifecycleState,
  type ModulaBackendMode,
  type ModulaLifecycleState,
  type ModulaModuleManifest,
  type ModulaPlatform,
  type Permission,
  type RecordDefinitions,
  type SearchDefinitions,
  type SettingsDefinitions,
  type ViewDefinitions,
  isLifecycleTransitionAllowed,
  isSemver,
  isSemverRange,
  negotiateCapabilities,
  negotiateCompatibility,
} from '@modula/module-standard'

export type ModulaModuleValidationIssue = {
  path: string
  code: string
  message: string
  severity: 'error' | 'warning'
}

export type ModulaModuleValidationResult = {
  valid: boolean
  manifest?: ModulaModuleManifest
  issues: ModulaModuleValidationIssue[]
}

export type ModulaModuleValidationOptions = {
  host?: HostCompatibility
  hostCapabilities?: Array<string | HostCapability>
  expectedChecksum?: string
  expectedCommitSha?: string
  firstPartyPublisherIds?: string[]
}

const ROOT_KEYS = new Set([
  'schemaVersion',
  'standardVersion',
  'moduleVersion',
  'manifestSchemaVersion',
  'dataSchemaVersion',
  'id',
  'slug',
  'name',
  'description',
  'publisher',
  'compatibility',
  'lifecycle',
  'permissions',
  'capabilities',
  'records',
  'views',
  'actions',
  'functions',
  'settings',
  'events',
  'automations',
  'search',
  'ai',
  'diagnostics',
  'health',
  'migrations',
  'release',
  'trust',
  'backend',
  'sectionVersions',
  'identity',
  'dependencyGraph',
  'serviceRegistry',
  'apiRegistry',
  'eventBus',
  'hookRegistry',
  'capabilityDiscovery',
  'healthModel',
  'diagnosticsModel',
  'metrics',
  'permissionModel',
  'jobRegistry',
  'storageModel',
  'widgetRegistry',
  'navigationRegistry',
  'uiContributions',
  'automationRegistry',
  'offline',
  'realtime',
  'versioning',
  'compatibilityMatrix',
  'marketplace',
  'engineReadiness',
  'exports',
  'imports',
  'synchronization',
  'integrations',
  'billing',
  'telemetry',
  'accessibility',
  'localization',
  'appearance',
  'onboarding',
])

const PLATFORMS = new Set<ModulaPlatform>(['ios', 'android', 'web', 'server', 'desktop'])
const SUPPORTED_STANDARD_VERSIONS = new Set<string>(MODULA_MODULE_STANDARD_SUPPORTED_VERSIONS)
const SUPPORTED_MANIFEST_SCHEMA_VERSIONS = new Set<string>(MODULA_MANIFEST_SCHEMA_SUPPORTED_VERSIONS)
const HEALTH_STATES = new Set(['healthy', 'degraded', 'failed', 'disabled', 'quarantined', ...MODULE_STANDARD_20_HEALTH_STATES])
const LIFECYCLE_STATES = new Set(['discovered', 'installed', 'enabled', 'disabled', 'updating', 'failed', 'quarantined', 'uninstalled'])
const EXECUTION_MODES = new Set(['declarative', 'built-in', 'hosted', 'remote-http'])
const BACKEND_MODES = new Set<ModulaBackendMode>(['greenfield-managed', 'module-managed', 'hybrid', 'frontend-only'])
const BACKEND_ENDPOINT_STRATEGIES = new Set(['registry', 'installation', 'self-hosted', 'user-configured'])
const BACKEND_AUTH_STRATEGIES = new Set(['greenfield-signed-jwt', 'oauth-token-exchange', 'hmac-signed-request'])
const BACKEND_DEPLOYMENT_OWNERSHIP = new Set(['publisher-hosted', 'modula-hosted', 'customer-hosted', 'local-development'])
const BACKEND_DATA_STORES = new Set(['greenfield', 'module-backend', 'device', 'mixed'])
const BACKEND_DATA_CLASSIFICATIONS = new Set(['public', 'internal', 'private', 'sensitive', 'restricted'])
const BACKEND_BACKUP_RESPONSIBILITY = new Set(['greenfield', 'publisher', 'customer', 'shared'])
const BACKEND_LIFECYCLE_STATES = new Set<ModulaBackendLifecycleState>([
  'unconfigured',
  'discovering',
  'verifying',
  'available',
  'degraded',
  'unreachable',
  'incompatible',
  'revoked',
  'quarantined',
  'disabled',
])
const BACKEND_ACTION_SIDE_EFFECTS = new Set(['none', 'internal-write', 'external-write', 'financial', 'destructive'])
const BACKEND_ACTION_CONFIRMATIONS = new Set(['none', 'user', 'reauthentication', 'operator'])
const BACKEND_HEALTH_COMPONENTS = new Set(['discovery', 'identity', 'tls', 'protocol', 'authentication', 'api', 'database', 'queue', 'events', 'webhooks', 'search', 'storage'])
const AI_PROVIDER_KEYS = new Set(['provider', 'providerId', 'providerKind', 'providerUrl', 'model', 'modelId', 'modelProvider', 'apiKey', 'providerPayload', 'providerOptions', 'openai', 'anthropic', 'google', 'ollama', 'lmStudio', 'azureOpenAI'])
const AI_PRODUCT_CONTEXT_SOURCES = new Set(['current-record', 'selected-content', 'record-metadata', 'module-settings'])
const AI_CONTEXT_CLASSIFICATIONS = new Set(['public', 'internal', 'private', 'sensitive'])
const AI_APPLICATION_MODES = new Set(['preview-only', 'replace-selection', 'replace-document', 'insert', 'metadata-suggestion'])
const RISK_LEVELS = new Set(['low', 'medium', 'high', 'critical'])
const POLICY_MODES = new Set(['observe', 'warn', 'require-confirmation', 'block'])
const VIEW_TYPES = new Set(['collection', 'detail', 'form', 'dashboard', 'settings', 'empty-state', 'error-state', 'loading-state'])
const REQUIRED_DIAGNOSTIC_COMPONENTS = ['startup', 'runtime', 'permissions', 'dependencies', 'search', 'ai', 'connector', 'health'] as const
const TRUST_LEVELS = new Set(['first-party', 'verified-publisher', 'reviewed-community', 'untrusted'])
const REVIEW_STATUSES = new Set(['unreviewed', 'in-review', 'approved', 'rejected', 'quarantined'])
const RELEASE_CHANNELS = new Set(['dev', 'alpha', 'beta', 'stable', 'lts'])
const EVENT_DIRECTIONS = new Set(['emitted', 'consumed'])
const RECORD_OWNERSHIP = new Set(['account', 'profile', 'team', 'system'])
const RECORD_VISIBILITY = new Set(['private', 'team', 'followers', 'public', 'system'])
const ALLOWED_CAPABILITIES = new Set([
  'records',
  'views',
  'actions',
  'functions',
  'events',
  'automations',
  'ai',
  'search',
  'files',
  'notifications',
  'settings',
  'diagnostics',
  'health',
  'migrations',
  'connectors',
  'module-backend',
  'services',
  'apis',
  'hooks',
  'metrics',
  'jobs',
  'storage',
  'widgets',
  'navigation',
  'ui-contributions',
  'offline',
  'realtime',
  'exports',
  'imports',
  'sync',
  'sharing',
  'history',
  'permissions-v2',
  'marketplace',
  'engines',
])
const HIGH_RISK_PERMISSION_PREFIXES = ['admin:', 'dimon:', 'wallet:', 'billing:', 'identity:', 'security:', 'medical:', 'legal:', 'finance:']
const SHA256_PATTERN = /^[0-9a-f]{64}$/i
const GIT_SHA_PATTERN = /^[0-9a-f]{40}$/i
const ID_PATTERN = /^[a-z][a-z0-9]*(?:[.-][a-z0-9]+)+$/
const SLUG_PATTERN = /^[a-z][a-z0-9-]{1,80}$/
const PROHIBITED_KEYS = new Set([
  'code',
  'script',
  'runtimeCode',
  'eval',
  'providerApiKey',
  'accessToken',
  'refreshToken',
  'clientSecret',
  'privateKey',
  'secret',
  'password',
  'html',
  'componentCode',
  'render',
  'remoteEntry',
  'sourceCode',
  'dangerouslySetInnerHTML',
])

export function validateModulaModuleManifest(input: unknown, options: ModulaModuleValidationOptions = {}): ModulaModuleValidationResult {
  const issues: ModulaModuleValidationIssue[] = []
  const add = (path: string, code: string, message: string, severity: 'error' | 'warning' = 'error') => {
    issues.push({path, code, message, severity})
  }

  if (!isRecord(input)) {
    add('$', 'MANIFEST_NOT_OBJECT', 'Manifest must be a JSON object')
    return {valid: false, issues}
  }

  for (const key of Object.keys(input)) {
    if (!ROOT_KEYS.has(key)) add(`$.${key}`, 'UNKNOWN_ROOT_PROPERTY', `Unknown root property ${key}`)
  }
  scanProhibitedFields(input, '$', add)

  validateVersionFields(input, add)
  checkString(input.id, '$.id', 1, 180, add)
  if (typeof input.id === 'string' && !ID_PATTERN.test(input.id)) add('$.id', 'INVALID_MODULE_ID', 'Module ID must be a lowercase reverse-domain identifier')
  checkString(input.slug, '$.slug', 2, 80, add)
  if (typeof input.slug === 'string' && !SLUG_PATTERN.test(input.slug)) add('$.slug', 'INVALID_SLUG', 'Slug must be lowercase kebab-case')
  checkString(input.name, '$.name', 1, 120, add)
  checkString(input.description, '$.description', 1, 2000, add)
  validatePublisher(input.publisher, '$.publisher', add)
  validateCompatibility(input.compatibility, '$.compatibility', add)
  validateLifecycle(input.lifecycle, '$.lifecycle', add)
  validatePermissions(input.permissions, '$.permissions', add)
  validateCapabilities(input.capabilities, '$.capabilities', add)

  const moduleId = typeof input.id === 'string' ? input.id : ''
  const recordIds = validateRecords(input.records, '$.records', moduleId, add)
  validateViews(input.views, '$.views', moduleId, recordIds, add)
  validateActions(input.actions, '$.actions', moduleId, add)
  validateFunctions(input.functions, '$.functions', moduleId, add)
  validateSettings(input.settings, '$.settings', moduleId, add)
  validateEvents(input.events, '$.events', moduleId, add)
  validateAutomations(input.automations, '$.automations', moduleId, add)
  validateSearch(input.search, '$.search', moduleId, recordIds, add)
  validateAi(input.ai, '$.ai', moduleId, add)
  validateDiagnostics(input.diagnostics, '$.diagnostics', add)
  validateHealth(input.health, '$.health', add)
  validateMigrations(input.migrations, '$.migrations', add)
  validateRelease(input.release, '$.release', add)
  validateTrust(input.trust, '$.trust', input.publisher, add)
  validateBackend(input.backend, '$.backend', input, add)
  validateStandard20Extensions(input, moduleId, add)
  validateProvenanceEvidence(input.release, options, add)
  validateIdUniqueness(input, add)
  validateCrossContracts(input, add)

  if (options.host && isRecord(input.compatibility)) {
    const compatibility = negotiateCompatibility({compatibility: input.compatibility as Compatibility}, options.host)
    for (const failure of compatibility.failures) add('$.compatibility', 'HOST_INCOMPATIBLE', failure)
  }

  if (options.hostCapabilities && Array.isArray(input.capabilities)) {
    const result = negotiateCapabilities({capabilities: input.capabilities as Capability[]}, options.hostCapabilities)
    for (const capability of result.missingRequired) add('$.capabilities', 'REQUIRED_CAPABILITY_UNAVAILABLE', `Required capability ${capability} is unavailable`)
    for (const capability of result.unavailableOptional) add('$.capabilities', 'OPTIONAL_CAPABILITY_DEGRADED', `Optional capability ${capability} will degrade`, 'warning')
  }

  const errorCount = issues.filter(issue => issue.severity === 'error').length
  return {
    valid: errorCount === 0,
    manifest: errorCount === 0 ? (input as ModulaModuleManifest) : undefined,
    issues,
  }
}

export {isLifecycleTransitionAllowed, negotiateCapabilities, negotiateCompatibility}

function validateVersionFields(input: Record<string, unknown>, add: AddIssue) {
  for (const field of ['schemaVersion', 'standardVersion', 'manifestSchemaVersion', 'dataSchemaVersion'] as const) {
    if (!isSemver(input[field])) add(`$.${field}`, 'INVALID_SEMVER', `${field} must be semantic version`)
  }
  if (typeof input.standardVersion === 'string' && !SUPPORTED_STANDARD_VERSIONS.has(input.standardVersion)) {
    add('$.standardVersion', 'UNSUPPORTED_VERSION', `standardVersion must be one of ${Array.from(SUPPORTED_STANDARD_VERSIONS).join(', ')}`)
  }
  if (typeof input.schemaVersion === 'string' && !SUPPORTED_MANIFEST_SCHEMA_VERSIONS.has(input.schemaVersion)) {
    add('$.schemaVersion', 'UNSUPPORTED_VERSION', `schemaVersion must be one of ${Array.from(SUPPORTED_MANIFEST_SCHEMA_VERSIONS).join(', ')}`)
  }
  if (typeof input.manifestSchemaVersion === 'string' && !SUPPORTED_MANIFEST_SCHEMA_VERSIONS.has(input.manifestSchemaVersion)) {
    add('$.manifestSchemaVersion', 'UNSUPPORTED_VERSION', `manifestSchemaVersion must be one of ${Array.from(SUPPORTED_MANIFEST_SCHEMA_VERSIONS).join(', ')}`)
  }
  if (input.dataSchemaVersion !== MODULA_DATA_SCHEMA_VERSION) {
    add('$.dataSchemaVersion', 'UNSUPPORTED_VERSION', `dataSchemaVersion must be ${MODULA_DATA_SCHEMA_VERSION}`)
  }
  if (
    typeof input.standardVersion === 'string' &&
    typeof input.manifestSchemaVersion === 'string' &&
    SUPPORTED_STANDARD_VERSIONS.has(input.standardVersion) &&
    SUPPORTED_MANIFEST_SCHEMA_VERSIONS.has(input.manifestSchemaVersion) &&
    input.standardVersion !== input.manifestSchemaVersion
  ) {
    add('$.manifestSchemaVersion', 'VERSION_MISMATCH', 'manifestSchemaVersion must match standardVersion for supported manifests')
  }
  if (!isSemver(input.moduleVersion)) add('$.moduleVersion', 'INVALID_SEMVER', 'moduleVersion must be semantic version')
}

function validatePublisher(value: unknown, path: string, add: AddIssue) {
  if (!isRecord(value)) {
    add(path, 'MISSING_PUBLISHER', 'publisher is required')
    return
  }
  checkString(value.id, `${path}.id`, 1, 160, add)
  checkString(value.name, `${path}.name`, 1, 120, add)
  optionalUrl(value.website, `${path}.website`, add)
  optionalString(value.email, `${path}.email`, 1, 320, add)
  optionalUrl(value.supportUrl, `${path}.supportUrl`, add)
}

function validateCompatibility(value: unknown, path: string, add: AddIssue) {
  if (!isRecord(value)) {
    add(path, 'MISSING_COMPATIBILITY', 'compatibility is required')
    return
  }
  for (const field of ['host', 'runtime', 'standard'] as const) {
    if (!isSemverRange(value[field])) add(`${path}.${field}`, 'INVALID_SEMVER_RANGE', `${field} must be a semantic version range`)
  }
  if (!Array.isArray(value.platforms) || value.platforms.length < 1) {
    add(`${path}.platforms`, 'INVALID_PLATFORMS', 'compatibility.platforms must contain at least one platform')
  } else {
    for (const [index, platform] of value.platforms.entries()) {
      if (!PLATFORMS.has(platform as ModulaPlatform)) add(`${path}.platforms[${index}]`, 'UNSUPPORTED_PLATFORM', `Unsupported platform ${String(platform)}`)
    }
  }
}

function validateLifecycle(value: unknown, path: string, add: AddIssue) {
  if (!isRecord(value)) {
    add(path, 'MISSING_LIFECYCLE', 'lifecycle is required')
    return
  }
  if (!EXECUTION_MODES.has(String(value.executionMode))) add(`${path}.executionMode`, 'INVALID_EXECUTION_MODE', 'Unsupported lifecycle execution mode')
  if (!LIFECYCLE_STATES.has(String(value.defaultState))) add(`${path}.defaultState`, 'INVALID_LIFECYCLE_STATE', 'Unsupported lifecycle default state')
  if (!Array.isArray(value.allowedTransitions) || value.allowedTransitions.length < 1) {
    add(`${path}.allowedTransitions`, 'INVALID_LIFECYCLE_TRANSITIONS', 'allowedTransitions must be a non-empty array')
  } else {
    for (const [index, transition] of value.allowedTransitions.entries()) {
      if (!isRecord(transition)) {
        add(`${path}.allowedTransitions[${index}]`, 'INVALID_LIFECYCLE_TRANSITION', 'Transition must be an object')
        continue
      }
      if (!LIFECYCLE_STATES.has(String(transition.from))) add(`${path}.allowedTransitions[${index}].from`, 'INVALID_LIFECYCLE_STATE', 'Invalid transition source state')
      if (!LIFECYCLE_STATES.has(String(transition.to))) add(`${path}.allowedTransitions[${index}].to`, 'INVALID_LIFECYCLE_STATE', 'Invalid transition target state')
      checkString(transition.auditEvent, `${path}.allowedTransitions[${index}].auditEvent`, 1, 160, add)
    }
  }
  if (!isRecord(value.uninstall)) {
    add(`${path}.uninstall`, 'MISSING_UNINSTALL_POLICY', 'uninstall policy is required')
  } else {
    if (!['retain', 'export-then-purge', 'purge'].includes(String(value.uninstall.dataPolicy))) {
      add(`${path}.uninstall.dataPolicy`, 'INVALID_UNINSTALL_POLICY', 'Unsupported uninstall data policy')
    }
    if (typeof value.uninstall.requiresConfirmation !== 'boolean') add(`${path}.uninstall.requiresConfirmation`, 'INVALID_BOOLEAN', 'requiresConfirmation must be boolean')
  }
}

function validatePermissions(value: unknown, path: string, add: AddIssue) {
  if (!Array.isArray(value)) {
    add(path, 'INVALID_PERMISSIONS', 'permissions must be an array')
    return
  }
  for (const [index, permission] of value.entries()) {
    if (!isRecord(permission)) {
      add(`${path}[${index}]`, 'INVALID_PERMISSION', 'Permission must be an object')
      continue
    }
    const permissionId = typeof permission.id === 'string' ? permission.id : ''
    checkString(permission.id, `${path}[${index}].id`, 1, 160, add)
    if (permissionId.includes('*')) add(`${path}[${index}].id`, 'WILDCARD_PERMISSION', 'Wildcard permissions are prohibited')
    checkString(permission.reason, `${path}[${index}].reason`, 1, 500, add)
    if (typeof permission.required !== 'boolean') add(`${path}[${index}].required`, 'INVALID_BOOLEAN', 'required must be boolean')
    if (!RISK_LEVELS.has(String(permission.risk))) add(`${path}[${index}].risk`, 'INVALID_RISK', 'Unsupported permission risk')
    if (permission.policyMode !== undefined && !POLICY_MODES.has(String(permission.policyMode))) add(`${path}[${index}].policyMode`, 'INVALID_POLICY_MODE', 'Unsupported policy mode')
    if (HIGH_RISK_PERMISSION_PREFIXES.some(prefix => permissionId.startsWith(prefix))) {
      if (!['high', 'critical'].includes(String(permission.risk))) add(`${path}[${index}].risk`, 'PERMISSION_ESCALATION_RISK_MISMATCH', 'High-risk permissions require high or critical risk')
      if (!['require-confirmation', 'block'].includes(String(permission.policyMode))) {
        add(`${path}[${index}].policyMode`, 'PERMISSION_ESCALATION_POLICY_MISMATCH', 'High-risk permissions require confirmation or block policy')
      }
    }
  }
}

function validateCapabilities(value: unknown, path: string, add: AddIssue) {
  if (!Array.isArray(value)) {
    add(path, 'INVALID_CAPABILITIES', 'capabilities must be an array')
    return
  }
  for (const [index, capability] of value.entries()) {
    if (!isRecord(capability)) {
      add(`${path}[${index}]`, 'INVALID_CAPABILITY', 'Capability must be an object')
      continue
    }
    checkString(capability.id, `${path}[${index}].id`, 1, 120, add)
    if (typeof capability.id === 'string' && !ALLOWED_CAPABILITIES.has(capability.id)) add(`${path}[${index}].id`, 'UNKNOWN_CAPABILITY', `Unknown capability ${capability.id}`)
    checkString(capability.reason, `${path}[${index}].reason`, 1, 500, add)
    if (typeof capability.required !== 'boolean') add(`${path}[${index}].required`, 'INVALID_BOOLEAN', 'required must be boolean')
    if (capability.required === false) checkString(capability.degradedBehavior, `${path}[${index}].degradedBehavior`, 1, 500, add)
  }
}

function validateRecords(value: unknown, path: string, moduleId: string, add: AddIssue): Set<string> {
  const ids = new Set<string>()
  if (!Array.isArray(value)) {
    add(path, 'INVALID_RECORDS', 'records must be an array')
    return ids
  }
  for (const [index, record] of value.entries()) {
    if (!isRecord(record)) {
      add(`${path}[${index}]`, 'INVALID_RECORD', 'Record definition must be an object')
      continue
    }
    validateNamespacedId(record.id, `${path}[${index}].id`, moduleId, add)
    if (typeof record.id === 'string') ids.add(record.id)
    if (!isJsonSchema(record.schema)) add(`${path}[${index}].schema`, 'INVALID_SCHEMA', 'record schema must be a JSON schema object with a type')
    if (!RECORD_OWNERSHIP.has(String(record.ownership))) add(`${path}[${index}].ownership`, 'INVALID_OWNERSHIP', 'Unsupported record ownership')
    if (!RECORD_VISIBILITY.has(String(record.visibility))) add(`${path}[${index}].visibility`, 'INVALID_VISIBILITY', 'Unsupported record visibility')
    if (!Array.isArray(record.indexes)) add(`${path}[${index}].indexes`, 'INVALID_INDEXES', 'indexes must be an array')
    if (!isRecord(record.uniqueness) || !Array.isArray(record.uniqueness.keys)) add(`${path}[${index}].uniqueness`, 'INVALID_UNIQUENESS', 'uniqueness keys are required')
    if (!isRecord(record.retention)) add(`${path}[${index}].retention`, 'INVALID_RETENTION', 'retention policy is required')
    if (!isRecord(record.aiPolicy)) add(`${path}[${index}].aiPolicy`, 'INVALID_AI_POLICY', 'AI policy is required')
    if (!isRecord(record.searchPolicy)) add(`${path}[${index}].searchPolicy`, 'INVALID_SEARCH_POLICY', 'Search policy is required')
    if (!isRecord(record.auditPolicy)) add(`${path}[${index}].auditPolicy`, 'INVALID_AUDIT_POLICY', 'Audit policy is required')
    if (!isRecord(record.exportPolicy)) add(`${path}[${index}].exportPolicy`, 'INVALID_EXPORT_POLICY', 'Export policy is required')
  }
  return ids
}

function validateViews(value: unknown, path: string, moduleId: string, recordIds: Set<string>, add: AddIssue) {
  const values = validateDefinitionArray<ViewDefinitions>(value, path, 'views', add)
  for (const [index, view] of values.entries()) {
    validateNamespacedId(view.id, `${path}[${index}].id`, moduleId, add)
    if (!VIEW_TYPES.has(String(view.type))) add(`${path}[${index}].type`, 'INVALID_VIEW_TYPE', 'Unsupported declarative view type')
    if (view.recordId !== undefined && !recordIds.has(String(view.recordId))) add(`${path}[${index}].recordId`, 'UNKNOWN_RECORD', 'View recordId must reference a declared record')
    if (!isRecord(view.layout)) add(`${path}[${index}].layout`, 'INVALID_VIEW_LAYOUT', 'Views must use declarative layout objects')
    if (!Array.isArray(view.permissions)) add(`${path}[${index}].permissions`, 'INVALID_PERMISSIONS', 'View permissions must be an array')
  }
}

function validateActions(value: unknown, path: string, moduleId: string, add: AddIssue) {
  const values = validateDefinitionArray<ActionDefinitions>(value, path, 'actions', add)
  for (const [index, action] of values.entries()) {
    validateNamespacedId(action.id, `${path}[${index}].id`, moduleId, add)
    checkString(action.title, `${path}[${index}].title`, 1, 120, add)
    if (!Array.isArray(action.permissions)) add(`${path}[${index}].permissions`, 'INVALID_PERMISSIONS', 'Action permissions must be an array')
    if (!isRecord(action.confirmationPolicy)) add(`${path}[${index}].confirmationPolicy`, 'INVALID_CONFIRMATION_POLICY', 'Action confirmation policy is required')
    if (!Array.isArray(action.sideEffects)) add(`${path}[${index}].sideEffects`, 'INVALID_SIDE_EFFECTS', 'Action sideEffects must be an array')
    if (!isRecord(action.audit)) add(`${path}[${index}].audit`, 'INVALID_AUDIT_POLICY', 'Action audit policy is required')
  }
}

function validateFunctions(value: unknown, path: string, moduleId: string, add: AddIssue) {
  const values = validateDefinitionArray<FunctionDefinitions>(value, path, 'functions', add)
  for (const [index, fn] of values.entries()) {
    validateNamespacedId(fn.id, `${path}[${index}].id`, moduleId, add)
    if (!isJsonSchema(fn.inputSchema)) add(`${path}[${index}].inputSchema`, 'INVALID_SCHEMA', 'Function input schema must be an object with a type')
    if (!isJsonSchema(fn.outputSchema)) add(`${path}[${index}].outputSchema`, 'INVALID_SCHEMA', 'Function output schema must be an object with a type')
    if (!Array.isArray(fn.permissions)) add(`${path}[${index}].permissions`, 'INVALID_PERMISSIONS', 'Function permissions must be an array')
    for (const field of ['aiCallable', 'automationCallable', 'idempotent'] as const) {
      if (typeof fn[field] !== 'boolean') add(`${path}[${index}].${field}`, 'INVALID_BOOLEAN', `${field} must be boolean`)
    }
    if (!Number.isInteger(fn.timeoutMs) || fn.timeoutMs < 1 || fn.timeoutMs > 300000) add(`${path}[${index}].timeoutMs`, 'INVALID_TIMEOUT', 'Function timeout must be 1..300000 ms')
    if (!isRecord(fn.rateLimit) || !Number.isInteger(fn.rateLimit.windowSeconds) || !Number.isInteger(fn.rateLimit.maxCalls)) add(`${path}[${index}].rateLimit`, 'INVALID_RATE_LIMIT', 'Function rate limit is required')
    if (!isRecord(fn.audit)) add(`${path}[${index}].audit`, 'INVALID_AUDIT_POLICY', 'Function audit policy is required')
    if (!isRecord(fn.confirmationPolicy)) add(`${path}[${index}].confirmationPolicy`, 'INVALID_CONFIRMATION_POLICY', 'Function confirmation policy is required')
  }
}

function validateSettings(value: unknown, path: string, moduleId: string, add: AddIssue) {
  const values = validateDefinitionArray<SettingsDefinitions>(value, path, 'settings', add)
  for (const [index, settings] of values.entries()) {
    validateNamespacedId(settings.id, `${path}[${index}].id`, moduleId, add)
    if (!['account', 'profile', 'installation', 'team'].includes(String(settings.scope))) add(`${path}[${index}].scope`, 'INVALID_SCOPE', 'Unsupported settings scope')
    if (!isJsonSchema(settings.schema)) add(`${path}[${index}].schema`, 'INVALID_SCHEMA', 'Settings schema must be an object with a type')
    if (!isRecord(settings.defaults)) add(`${path}[${index}].defaults`, 'INVALID_DEFAULTS', 'Settings defaults must be an object')
  }
}

function validateEvents(value: unknown, path: string, moduleId: string, add: AddIssue) {
  const values = validateDefinitionArray<EventDefinitions>(value, path, 'events', add)
  for (const [index, event] of values.entries()) {
    validateNamespacedId(event.id, `${path}[${index}].id`, moduleId, add)
    checkString(event.type, `${path}[${index}].type`, 1, 160, add)
    if (!EVENT_DIRECTIONS.has(String(event.direction))) add(`${path}[${index}].direction`, 'INVALID_EVENT_DIRECTION', 'Event direction must be emitted or consumed')
    if (!isSemver(event.schemaVersion)) add(`${path}[${index}].schemaVersion`, 'INVALID_SEMVER', 'Event schemaVersion must be semantic version')
    if (!isJsonSchema(event.schema)) add(`${path}[${index}].schema`, 'INVALID_SCHEMA', 'Event schema must be an object with a type')
    if (!Array.isArray(event.permissions)) add(`${path}[${index}].permissions`, 'INVALID_PERMISSIONS', 'Event permissions must be an array')
    if (typeof event.replaySupport !== 'boolean') add(`${path}[${index}].replaySupport`, 'INVALID_BOOLEAN', 'replaySupport must be boolean')
  }
}

function validateAutomations(value: unknown, path: string, moduleId: string, add: AddIssue) {
  const values = validateDefinitionArray<AutomationDefinitions>(value, path, 'automations', add)
  for (const [index, automation] of values.entries()) {
    validateNamespacedId(automation.id, `${path}[${index}].id`, moduleId, add)
    for (const field of ['triggers', 'conditions', 'actions', 'recipes'] as const) {
      if (!Array.isArray(automation[field])) add(`${path}[${index}].${field}`, 'INVALID_ARRAY', `${field} must be an array`)
    }
    if (!isRecord(automation.executionPolicy)) add(`${path}[${index}].executionPolicy`, 'INVALID_EXECUTION_POLICY', 'Automation execution policy is required')
    if (!isRecord(automation.confirmationPolicy)) add(`${path}[${index}].confirmationPolicy`, 'INVALID_CONFIRMATION_POLICY', 'Automation confirmation policy is required')
  }
}

function validateSearch(value: unknown, path: string, moduleId: string, recordIds: Set<string>, add: AddIssue) {
  const values = validateDefinitionArray<SearchDefinitions>(value, path, 'search', add)
  for (const [index, search] of values.entries()) {
    validateNamespacedId(search.id, `${path}[${index}].id`, moduleId, add)
    if (!recordIds.has(String(search.recordId))) add(`${path}[${index}].recordId`, 'UNKNOWN_RECORD', 'Search definition must reference a declared record')
    for (const field of ['indexedFields', 'sensitiveFields'] as const) {
      if (!Array.isArray(search[field])) add(`${path}[${index}].${field}`, 'INVALID_ARRAY', `${field} must be an array`)
    }
    if (!RECORD_VISIBILITY.has(String(search.visibility))) add(`${path}[${index}].visibility`, 'INVALID_VISIBILITY', 'Unsupported search visibility')
    if (!isRecord(search.projectionHandler) || search.projectionHandler.kind !== 'declarative') add(`${path}[${index}].projectionHandler`, 'INVALID_SEARCH_PROJECTION', 'Search projection handler must be declarative')
  }
}

function validateAi(value: unknown, path: string, moduleId: string, add: AddIssue) {
  const values = validateDefinitionArray<AIIntegrationDefinitions>(value, path, 'ai', add)
  for (const [index, ai] of values.entries()) {
    const aiPath = `${path}[${index}]`
    validateNamespacedId(ai.id, `${aiPath}.id`, moduleId, add)
    for (const key of Object.keys(ai as Record<string, unknown>)) {
      if (AI_PROVIDER_KEYS.has(key)) add(`${aiPath}.${key}`, 'PROVIDER_BOUND_AI_DECLARATION', 'AI declarations must not include provider, model, URL, payload or credential fields')
    }
    for (const field of ['features', 'allowedContext', 'toolDefinitions', 'structuredOutputs', 'permissions'] as const) {
      if (!Array.isArray(ai[field])) add(`${aiPath}.${field}`, 'INVALID_ARRAY', `${field} must be an array`)
    }
    if (!POLICY_MODES.has(String(ai.policyMode))) add(`${aiPath}.policyMode`, 'INVALID_POLICY_MODE', 'AI policyMode is required')
    if (ai.productActions !== undefined) validateAIProductActions(ai.productActions, `${aiPath}.productActions`, moduleId, ai, add)
  }
}

function validateAIProductActions(value: unknown, path: string, moduleId: string, parent: AIIntegrationDefinitions, add: AddIssue) {
  const actions = validateDefinitionArray<Record<string, unknown>>(value, path, 'ai_product_actions', add)
  void parent
  for (const [index, action] of actions.entries()) {
    const actionPath = `${path}[${index}]`
    void moduleId
    checkString(action.id, `${actionPath}.id`, 1, 220, add)
    if (typeof action.id === 'string' && !ID_PATTERN.test(action.id)) add(`${actionPath}.id`, 'INVALID_AI_PRODUCT_ACTION_ID', 'AI product action ID must be lowercase and dot/kebab separated')
    checkString(action.name, `${actionPath}.name`, 1, 120, add)
    checkString(action.description, `${actionPath}.description`, 1, 800, add)
    checkString(action.promptId, `${actionPath}.promptId`, 1, 220, add)
    if (typeof action.promptId === 'string' && !ID_PATTERN.test(action.promptId)) add(`${actionPath}.promptId`, 'INVALID_PROMPT_ID', 'promptId must be a lowercase dotted immutable identifier')
    checkString(action.promptVersionRange, `${actionPath}.promptVersionRange`, 1, 80, add)
    if (typeof action.promptVersionRange === 'string' && !isSemverRange(action.promptVersionRange)) add(`${actionPath}.promptVersionRange`, 'INVALID_PROMPT_VERSION_RANGE', 'promptVersionRange must be a semver range')
    checkString(action.inputSchema, `${actionPath}.inputSchema`, 1, 240, add)
    checkString(action.outputSchema, `${actionPath}.outputSchema`, 1, 240, add)
    validateStringArray(action.requiredPermissions, `${actionPath}.requiredPermissions`, 40, add)
    validateStringArray(action.requiredCapabilities, `${actionPath}.requiredCapabilities`, 40, add)
    validateAIProductContext(action.context, `${actionPath}.context`, add)
    validateAIProductExecution(action.execution, `${actionPath}.execution`, add)
    validateAIProductApplication(action.application, `${actionPath}.application`, add)
    for (const key of Object.keys(action)) {
      if (AI_PROVIDER_KEYS.has(key)) add(`${actionPath}.${key}`, 'PROVIDER_BOUND_AI_PRODUCT_ACTION', 'AI product actions must not bind to providers or models')
    }
  }
}

function validateAIProductContext(value: unknown, path: string, add: AddIssue) {
  if (!isRecord(value)) {
    add(path, 'INVALID_AI_PRODUCT_CONTEXT', 'AI product action context is required')
    return
  }
  validateStringEnumArray(value.sources, `${path}.sources`, AI_PRODUCT_CONTEXT_SOURCES, 8, add)
  validateIntegerRange(value.maximumRecords, `${path}.maximumRecords`, 1, 20, add)
  validateIntegerRange(value.maximumCharacters, `${path}.maximumCharacters`, 1, 200_000, add)
  validateStringEnumArray(value.allowedClassifications, `${path}.allowedClassifications`, AI_CONTEXT_CLASSIFICATIONS, 4, add)
}

function validateAIProductExecution(value: unknown, path: string, add: AddIssue) {
  if (!isRecord(value)) {
    add(path, 'INVALID_AI_PRODUCT_EXECUTION', 'AI product action execution is required')
    return
  }
  if (typeof value.streaming !== 'boolean') add(`${path}.streaming`, 'INVALID_BOOLEAN', 'streaming must be boolean')
  if (typeof value.structuredOutput !== 'boolean') add(`${path}.structuredOutput`, 'INVALID_BOOLEAN', 'structuredOutput must be boolean')
  validateIntegerRange(value.maximumToolCalls, `${path}.maximumToolCalls`, 0, 8, add)
  validateIntegerRange(value.timeoutMs, `${path}.timeoutMs`, 1000, 120_000, add)
}

function validateAIProductApplication(value: unknown, path: string, add: AddIssue) {
  if (!isRecord(value)) {
    add(path, 'INVALID_AI_PRODUCT_APPLICATION', 'AI product action application is required')
    return
  }
  if (!AI_APPLICATION_MODES.has(String(value.mode))) add(`${path}.mode`, 'INVALID_AI_APPLICATION_MODE', 'Unsupported AI application mode')
  if (typeof value.explicitConfirmation !== 'boolean') add(`${path}.explicitConfirmation`, 'INVALID_BOOLEAN', 'explicitConfirmation must be boolean')
  if (typeof value.createsRecordRevision !== 'boolean') add(`${path}.createsRecordRevision`, 'INVALID_BOOLEAN', 'createsRecordRevision must be boolean')
  if (value.explicitConfirmation !== true) add(`${path}.explicitConfirmation`, 'AI_APPLICATION_CONFIRMATION_REQUIRED', 'AI product action application must require explicit confirmation')
}

function validateDiagnostics(value: unknown, path: string, add: AddIssue) {
  if (!isRecord(value)) {
    add(path, 'MISSING_DIAGNOSTICS', 'diagnostics are required')
    return
  }
  if (!Array.isArray(value.components)) {
    add(`${path}.components`, 'INVALID_DIAGNOSTICS', 'diagnostic components must be an array')
  } else {
    for (const component of REQUIRED_DIAGNOSTIC_COMPONENTS) {
      if (!value.components.includes(component)) add(`${path}.components`, 'MISSING_DIAGNOSTIC_COMPONENT', `${component} diagnostic component is required`)
    }
  }
  for (const field of REQUIRED_DIAGNOSTIC_COMPONENTS) {
    if (!isRecord(value[field])) add(`${path}.${field}`, 'MISSING_DIAGNOSTIC_SECTION', `${field} diagnostic section is required`)
  }
  if (!Array.isArray(value.warnings)) add(`${path}.warnings`, 'INVALID_WARNINGS', 'diagnostics warnings must be an array')
  if (!Array.isArray(value.errors)) add(`${path}.errors`, 'INVALID_ERRORS', 'diagnostics errors must be an array')
}

function validateHealth(value: unknown, path: string, add: AddIssue) {
  if (!isRecord(value)) {
    add(path, 'MISSING_HEALTH', 'health is required')
    return
  }
  if (!HEALTH_STATES.has(String(value.status))) add(`${path}.status`, 'INVALID_HEALTH_STATE', 'Unsupported module health state')
  if (!Array.isArray(value.components) || value.components.length < 1) add(`${path}.components`, 'INVALID_HEALTH_COMPONENTS', 'At least one health component is required')
  if (!Array.isArray(value.checkDefinitions) || value.checkDefinitions.length < 1) add(`${path}.checkDefinitions`, 'INVALID_HEALTH_CHECKS', 'At least one health check is required')
}

function validateMigrations(value: unknown, path: string, add: AddIssue) {
  if (!isRecord(value)) {
    add(path, 'MISSING_MIGRATIONS', 'migrations are required')
    return
  }
  if (!isSemver(value.dataSchemaVersion)) add(`${path}.dataSchemaVersion`, 'INVALID_SEMVER', 'migration dataSchemaVersion must be semantic')
  if (!Array.isArray(value.steps)) add(`${path}.steps`, 'INVALID_MIGRATION_STEPS', 'migration steps must be an array')
}

function validateRelease(value: unknown, path: string, add: AddIssue) {
  if (!isRecord(value)) {
    add(path, 'MISSING_RELEASE', 'release metadata is required')
    return
  }
  checkString(value.repository, `${path}.repository`, 1, 240, add)
  if (typeof value.commitSha !== 'string' || !GIT_SHA_PATTERN.test(value.commitSha)) add(`${path}.commitSha`, 'INVALID_COMMIT_SHA', 'release commitSha must be a full Git SHA')
  if (typeof value.checksum !== 'string' || !SHA256_PATTERN.test(value.checksum)) add(`${path}.checksum`, 'INVALID_CHECKSUM', 'release checksum must be SHA-256 hex')
  if (!Array.isArray(value.licenseEvidence) || value.licenseEvidence.length < 1) add(`${path}.licenseEvidence`, 'MISSING_LICENSE_EVIDENCE', 'release license evidence is required')
  if (!isRecord(value.signing)) add(`${path}.signing`, 'MISSING_SIGNING_STATE', 'release signing state is required')
  if (!RELEASE_CHANNELS.has(String(value.channel))) add(`${path}.channel`, 'INVALID_RELEASE_CHANNEL', 'Unsupported release channel')
  if (!REVIEW_STATUSES.has(String(value.reviewStatus))) add(`${path}.reviewStatus`, 'INVALID_REVIEW_STATUS', 'Unsupported review status')
  if (!Array.isArray(value.securityAdvisories)) add(`${path}.securityAdvisories`, 'INVALID_SECURITY_ADVISORIES', 'security advisories must be an array')
}

function validateTrust(value: unknown, path: string, publisher: unknown, add: AddIssue) {
  if (!isRecord(value)) {
    add(path, 'MISSING_TRUST', 'trust metadata is required')
    return
  }
  if (!TRUST_LEVELS.has(String(value.level))) add(`${path}.level`, 'INVALID_TRUST_LEVEL', 'Unsupported trust level')
  validatePublisher(value.publisher, `${path}.publisher`, add)
  if (isRecord(publisher) && isRecord(value.publisher) && publisher.id !== value.publisher.id) {
    add(`${path}.publisher.id`, 'TRUST_PUBLISHER_MISMATCH', 'trust.publisher must match publisher')
  }
  if (!isRecord(value.provenance)) add(`${path}.provenance`, 'MISSING_PROVENANCE', 'trust provenance is required')
  if (!isRecord(value.review)) add(`${path}.review`, 'MISSING_REVIEW', 'trust review is required')
  if (!isRecord(value.security)) add(`${path}.security`, 'MISSING_SECURITY', 'trust security metadata is required')
}

function validateBackend(value: unknown, path: string, manifest: Record<string, unknown>, add: AddIssue) {
  if (value === undefined) return
  if (!isRecord(value)) {
    add(path, 'INVALID_BACKEND', 'backend must be an object when provided')
    return
  }
  if (manifest.standardVersion === MODULA_MODULE_STANDARD_LEGACY_VERSION) {
    add(path, 'BACKEND_REQUIRES_STANDARD_1_1', 'backend declarations require Modula Module Standard 1.1.0')
  }
  if (!BACKEND_MODES.has(value.mode as ModulaBackendMode)) {
    add(`${path}.mode`, 'INVALID_BACKEND_MODE', 'backend.mode must be greenfield-managed, module-managed, hybrid, or frontend-only')
  }
  if (value.protocolVersion !== undefined && !isSemver(value.protocolVersion)) {
    add(`${path}.protocolVersion`, 'INVALID_SEMVER', 'backend protocolVersion must be semantic version')
  }
  if (value.protocolVersion !== undefined && value.protocolVersion !== MODULA_MODULE_BACKEND_PROTOCOL_VERSION) {
    add(`${path}.protocolVersion`, 'UNSUPPORTED_BACKEND_PROTOCOL', `backend protocolVersion must be ${MODULA_MODULE_BACKEND_PROTOCOL_VERSION}`)
  }

  const mode = String(value.mode)
  const ownsBackend = mode === 'module-managed' || mode === 'hybrid'
  if (ownsBackend) {
    requireBackendSection(value.endpoints, `${path}.endpoints`, 'endpoints', add)
    requireBackendSection(value.authentication, `${path}.authentication`, 'authentication', add)
    requireBackendSection(value.trust, `${path}.trust`, 'trust', add)
    requireBackendSection(value.data, `${path}.data`, 'data', add)
    requireBackendSection(value.deployment, `${path}.deployment`, 'deployment', add)
  }
  if (mode === 'frontend-only') {
    for (const field of ['endpoints', 'authentication', 'trust', 'actions', 'clientAccess'] as const) {
      if (value[field] !== undefined) add(`${path}.${field}`, 'FRONTEND_ONLY_BACKEND_DECLARATION', `frontend-only modules must not declare backend.${field}`)
    }
  }
  if (mode === 'greenfield-managed' && isRecord(value.data) && value.data.primaryStore === 'module-backend') {
    add(`${path}.data.primaryStore`, 'BACKEND_DATA_STORE_MISMATCH', 'greenfield-managed modules cannot use module-backend as primaryStore')
  }

  validateBackendEndpoints(value.endpoints, `${path}.endpoints`, add)
  validateBackendAuthentication(value.authentication, `${path}.authentication`, ownsBackend, add)
  validateBackendHealth(value.health, `${path}.health`, add)
  validateBackendEvents(value.events, `${path}.events`, add)
  validateBackendWebhooks(value.webhooks, `${path}.webhooks`, add)
  validateBackendData(value.data, `${path}.data`, ownsBackend, add)
  validateBackendDeployment(value.deployment, `${path}.deployment`, add)
  validateBackendTrust(value.trust, `${path}.trust`, value.network, ownsBackend, add)
  validateBackendNetwork(value.network, `${path}.network`, add)
  validateBackendLifecycle(value.lifecycle, `${path}.lifecycle`, add)
  validateBackendActions(value.actions, `${path}.actions`, ownsBackend, add)
  validateBackendClientAccess(value.clientAccess, `${path}.clientAccess`, add)
}

function requireBackendSection(value: unknown, path: string, label: string, add: AddIssue) {
  if (!isRecord(value)) add(path, 'MISSING_BACKEND_SECTION', `${label} is required for module-managed and hybrid backends`)
}

function validateBackendEndpoints(value: unknown, path: string, add: AddIssue) {
  if (value === undefined) return
  if (!isRecord(value)) {
    add(path, 'INVALID_BACKEND_ENDPOINTS', 'backend.endpoints must be an object')
    return
  }
  const allowed = new Set(['baseUrlStrategy', 'apiVersion', 'discoveryPath', 'healthPath', 'capabilitiesPath', 'actionsPath', 'eventsPath', 'webhooksPath', 'allowedHosts'])
  for (const key of Object.keys(value)) {
    if (!allowed.has(key)) add(`${path}.${key}`, 'UNKNOWN_BACKEND_ENDPOINT_PROPERTY', `Unknown backend endpoint property ${key}`)
    if (/url$/i.test(key)) add(`${path}.${key}`, 'ARBITRARY_BACKEND_URL', 'Backend declarations must use one resolved origin, not arbitrary URL fields')
  }
  if (!BACKEND_ENDPOINT_STRATEGIES.has(String(value.baseUrlStrategy))) {
    add(`${path}.baseUrlStrategy`, 'INVALID_BACKEND_ENDPOINT_STRATEGY', 'Unsupported backend baseUrlStrategy')
  }
  if (!isSemver(value.apiVersion)) add(`${path}.apiVersion`, 'INVALID_SEMVER', 'backend endpoint apiVersion must be semantic')
  for (const field of ['discoveryPath', 'healthPath', 'capabilitiesPath', 'actionsPath', 'eventsPath', 'webhooksPath'] as const) {
    const required = field === 'healthPath'
    validateBackendPath(value[field], `${path}.${field}`, required, add)
  }
  if (value.allowedHosts !== undefined) {
    if (!Array.isArray(value.allowedHosts) || value.allowedHosts.length > 40) {
      add(`${path}.allowedHosts`, 'INVALID_ALLOWED_HOSTS', 'allowedHosts must be a bounded array')
    } else {
      value.allowedHosts.forEach((host, index) => validateBackendHost(host, `${path}.allowedHosts[${index}]`, add))
    }
  }
}

function validateBackendAuthentication(value: unknown, path: string, ownsBackend: boolean, add: AddIssue) {
  if (value === undefined) return
  if (!isRecord(value)) {
    add(path, 'INVALID_BACKEND_AUTHENTICATION', 'backend.authentication must be an object')
    return
  }
  if (!BACKEND_AUTH_STRATEGIES.has(String(value.strategy))) add(`${path}.strategy`, 'INVALID_BACKEND_AUTH_STRATEGY', 'Unsupported backend authentication strategy')
  if (typeof value.tokenExchangeRequired !== 'boolean') add(`${path}.tokenExchangeRequired`, 'INVALID_BOOLEAN', 'tokenExchangeRequired must be boolean')
  if (ownsBackend && value.tokenExchangeRequired !== true) add(`${path}.tokenExchangeRequired`, 'TOKEN_EXCHANGE_REQUIRED', 'module-managed and hybrid backends must use token exchange')
  validateBackendPath(value.sessionExchangePath, `${path}.sessionExchangePath`, false, add)
  optionalString(value.audience, `${path}.audience`, 1, 180, add)
  if (
    value.tokenTtlSeconds !== undefined &&
    (typeof value.tokenTtlSeconds !== 'number' || !Number.isInteger(value.tokenTtlSeconds) || value.tokenTtlSeconds < 30 || value.tokenTtlSeconds > 3600)
  ) {
    add(`${path}.tokenTtlSeconds`, 'INVALID_TOKEN_TTL', 'module session token TTL must be 30..3600 seconds')
  }
  if (value.signingAlg !== undefined && !['EdDSA', 'ES256', 'RS256'].includes(String(value.signingAlg))) add(`${path}.signingAlg`, 'INVALID_SIGNING_ALGORITHM', 'Unsupported signing algorithm')
  if (value.requiredClaims !== undefined) validateStringArray(value.requiredClaims, `${path}.requiredClaims`, 40, add)
}

function validateBackendHealth(value: unknown, path: string, add: AddIssue) {
  if (value === undefined) return
  if (!isRecord(value)) {
    add(path, 'INVALID_BACKEND_HEALTH', 'backend.health must be an object')
    return
  }
  validateBackendPath(value.path, `${path}.path`, false, add)
  for (const [field, min, max] of [
    ['intervalSeconds', 5, 86400],
    ['timeoutMs', 100, 60000],
    ['degradedAfterFailures', 1, 100],
    ['unavailableAfterFailures', 1, 100],
  ] as const) {
    const numberValue = value[field]
    if (numberValue !== undefined && (typeof numberValue !== 'number' || !Number.isInteger(numberValue) || numberValue < min || numberValue > max)) {
      add(`${path}.${field}`, 'INVALID_BACKEND_HEALTH_NUMBER', `${field} must be ${min}..${max}`)
    }
  }
  if (value.components !== undefined) {
    if (!Array.isArray(value.components) || value.components.length > 40) {
      add(`${path}.components`, 'INVALID_BACKEND_HEALTH_COMPONENTS', 'components must be a bounded array')
    } else {
      value.components.forEach((component, index) => {
        if (!BACKEND_HEALTH_COMPONENTS.has(String(component))) add(`${path}.components[${index}]`, 'INVALID_BACKEND_HEALTH_COMPONENT', 'Unsupported backend health component')
      })
    }
  }
}

function validateBackendEvents(value: unknown, path: string, add: AddIssue) {
  if (value === undefined) return
  if (!isRecord(value)) {
    add(path, 'INVALID_BACKEND_EVENTS', 'backend.events must be an object')
    return
  }
  if (value.incoming !== undefined) validateStringArray(value.incoming, `${path}.incoming`, 80, add)
  if (value.outgoing !== undefined) validateStringArray(value.outgoing, `${path}.outgoing`, 80, add)
  for (const field of ['incoming', 'outgoing'] as const) {
    if (!Array.isArray(value[field])) continue
    value[field].forEach((eventType, index) => {
      if (typeof eventType === 'string' && !eventType.startsWith('module.')) {
        add(`${path}.${field}[${index}]`, 'UNNAMESPACED_BACKEND_EVENT', 'Module backend events must use the module.* namespace')
      }
    })
  }
  if (value.signatureRequired !== undefined && typeof value.signatureRequired !== 'boolean') add(`${path}.signatureRequired`, 'INVALID_BOOLEAN', 'signatureRequired must be boolean')
  if (value.deadLetterSupported !== undefined && typeof value.deadLetterSupported !== 'boolean') add(`${path}.deadLetterSupported`, 'INVALID_BOOLEAN', 'deadLetterSupported must be boolean')
  if (
    value.replayWindowSeconds !== undefined &&
    (typeof value.replayWindowSeconds !== 'number' || !Number.isInteger(value.replayWindowSeconds) || value.replayWindowSeconds < 30 || value.replayWindowSeconds > 86400)
  ) {
    add(`${path}.replayWindowSeconds`, 'INVALID_REPLAY_WINDOW', 'replayWindowSeconds must be 30..86400')
  }
}

function validateBackendWebhooks(value: unknown, path: string, add: AddIssue) {
  if (value === undefined) return
  if (!isRecord(value)) {
    add(path, 'INVALID_BACKEND_WEBHOOKS', 'backend.webhooks must be an object')
    return
  }
  if (!Array.isArray(value.incoming)) add(`${path}.incoming`, 'INVALID_WEBHOOKS', 'incoming webhooks must be an array')
  else {
    value.incoming.forEach((webhook, index) => {
      if (!isRecord(webhook)) {
        add(`${path}.incoming[${index}]`, 'INVALID_WEBHOOK', 'incoming webhook must be an object')
        return
      }
      checkString(webhook.id, `${path}.incoming[${index}].id`, 1, 180, add)
      checkString(webhook.eventType, `${path}.incoming[${index}].eventType`, 1, 180, add)
      validateBackendPath(webhook.path, `${path}.incoming[${index}].path`, true, add)
      if (!['hmac-sha256', 'ed25519'].includes(String(webhook.signature))) add(`${path}.incoming[${index}].signature`, 'INVALID_WEBHOOK_SIGNATURE', 'Unsupported webhook signature')
      if (webhook.replayProtection !== true) add(`${path}.incoming[${index}].replayProtection`, 'WEBHOOK_REPLAY_PROTECTION_REQUIRED', 'Webhook replay protection is required')
    })
  }
  if (!Array.isArray(value.outgoing)) add(`${path}.outgoing`, 'INVALID_WEBHOOKS', 'outgoing webhooks must be an array')
  else {
    value.outgoing.forEach((webhook, index) => {
      if (!isRecord(webhook)) {
        add(`${path}.outgoing[${index}]`, 'INVALID_WEBHOOK', 'outgoing webhook must be an object')
        return
      }
      checkString(webhook.id, `${path}.outgoing[${index}].id`, 1, 180, add)
      checkString(webhook.eventType, `${path}.outgoing[${index}].eventType`, 1, 180, add)
      if (!['greenfield', 'module-backend', 'external-connector'].includes(String(webhook.target))) add(`${path}.outgoing[${index}].target`, 'INVALID_WEBHOOK_TARGET', 'Unsupported webhook target')
      if (!['hmac-sha256', 'ed25519'].includes(String(webhook.signature))) add(`${path}.outgoing[${index}].signature`, 'INVALID_WEBHOOK_SIGNATURE', 'Unsupported webhook signature')
      if (!isRecord(webhook.retryPolicy)) add(`${path}.outgoing[${index}].retryPolicy`, 'INVALID_RETRY_POLICY', 'Webhook retry policy is required')
    })
  }
}

function validateBackendData(value: unknown, path: string, ownsBackend: boolean, add: AddIssue) {
  if (value === undefined) return
  if (!isRecord(value)) {
    add(path, 'INVALID_BACKEND_DATA', 'backend.data must be an object')
    return
  }
  if (!BACKEND_DATA_STORES.has(String(value.primaryStore))) add(`${path}.primaryStore`, 'INVALID_BACKEND_DATA_STORE', 'Unsupported backend data store')
  if (ownsBackend && value.primaryStore !== 'module-backend' && value.primaryStore !== 'mixed') {
    add(`${path}.primaryStore`, 'BACKEND_DATA_STORE_MISMATCH', 'module-managed and hybrid backends must declare module-backend or mixed primaryStore')
  }
  if (!Array.isArray(value.categories) || value.categories.length < (ownsBackend ? 1 : 0) || value.categories.length > 80) {
    add(`${path}.categories`, 'INVALID_DATA_CATEGORIES', 'data categories must be a bounded array')
  } else {
    value.categories.forEach((category, index) => {
      if (!isRecord(category)) {
        add(`${path}.categories[${index}]`, 'INVALID_DATA_CATEGORY', 'data category must be an object')
        return
      }
      checkString(category.id, `${path}.categories[${index}].id`, 1, 120, add)
      checkString(category.description, `${path}.categories[${index}].description`, 1, 500, add)
      if (!['greenfield', 'module-backend', 'device'].includes(String(category.location))) add(`${path}.categories[${index}].location`, 'INVALID_DATA_LOCATION', 'Unsupported data category location')
      if (!BACKEND_DATA_CLASSIFICATIONS.has(String(category.classification))) add(`${path}.categories[${index}].classification`, 'INVALID_DATA_CLASSIFICATION', 'Unsupported data classification')
      if (typeof category.exportable !== 'boolean') add(`${path}.categories[${index}].exportable`, 'INVALID_BOOLEAN', 'exportable must be boolean')
      if (typeof category.deletable !== 'boolean') add(`${path}.categories[${index}].deletable`, 'INVALID_BOOLEAN', 'deletable must be boolean')
    })
  }
  if (typeof value.exportSupported !== 'boolean') add(`${path}.exportSupported`, 'INVALID_BOOLEAN', 'exportSupported must be boolean')
  if (typeof value.deletionSupported !== 'boolean') add(`${path}.deletionSupported`, 'INVALID_BOOLEAN', 'deletionSupported must be boolean')
  optionalString(value.retentionPolicy, `${path}.retentionPolicy`, 1, 500, add)
  if (!BACKEND_BACKUP_RESPONSIBILITY.has(String(value.backupResponsibility))) add(`${path}.backupResponsibility`, 'INVALID_BACKUP_RESPONSIBILITY', 'Unsupported backup responsibility')
  if (value.residency !== undefined) validateStringArray(value.residency, `${path}.residency`, 40, add)
}

function validateBackendDeployment(value: unknown, path: string, add: AddIssue) {
  if (value === undefined) return
  if (!isRecord(value)) {
    add(path, 'INVALID_BACKEND_DEPLOYMENT', 'backend.deployment must be an object')
    return
  }
  if (!BACKEND_DEPLOYMENT_OWNERSHIP.has(String(value.ownership))) add(`${path}.ownership`, 'INVALID_BACKEND_DEPLOYMENT_OWNERSHIP', 'Unsupported backend deployment ownership')
  if (typeof value.multiTenant !== 'boolean') add(`${path}.multiTenant`, 'INVALID_BOOLEAN', 'multiTenant must be boolean')
  if (typeof value.selfHostingSupported !== 'boolean') add(`${path}.selfHostingSupported`, 'INVALID_BOOLEAN', 'selfHostingSupported must be boolean')
  if (value.regions !== undefined) validateStringArray(value.regions, `${path}.regions`, 40, add)
  if (value.dataResidency !== undefined) validateStringArray(value.dataResidency, `${path}.dataResidency`, 40, add)
}

function validateBackendTrust(value: unknown, path: string, network: unknown, ownsBackend: boolean, add: AddIssue) {
  if (value === undefined) return
  if (!isRecord(value)) {
    add(path, 'INVALID_BACKEND_TRUST', 'backend.trust must be an object')
    return
  }
  checkString(value.publisherId, `${path}.publisherId`, 1, 160, add)
  optionalString(value.deploymentIdentity, `${path}.deploymentIdentity`, 1, 240, add)
  if (!Array.isArray(value.allowedOrigins) || value.allowedOrigins.length < (ownsBackend ? 1 : 0) || value.allowedOrigins.length > 40) {
    add(`${path}.allowedOrigins`, 'INVALID_ALLOWED_ORIGINS', 'allowedOrigins must be a bounded array')
  } else {
    const allowLocalhost = isRecord(network) && network.allowLocalhost === true
    value.allowedOrigins.forEach((origin, index) => validateBackendOrigin(origin, `${path}.allowedOrigins[${index}]`, {allowLocalhost}, add))
  }
  if (value.certificatePins !== undefined) validateStringArray(value.certificatePins, `${path}.certificatePins`, 20, add)
  if (value.signingKeys !== undefined) {
    if (!Array.isArray(value.signingKeys) || value.signingKeys.length > 20) add(`${path}.signingKeys`, 'INVALID_SIGNING_KEYS', 'signingKeys must be a bounded array')
    else {
      value.signingKeys.forEach((key, index) => {
        if (!isRecord(key)) {
          add(`${path}.signingKeys[${index}]`, 'INVALID_SIGNING_KEY', 'signing key reference must be an object')
          return
        }
        checkString(key.keyId, `${path}.signingKeys[${index}].keyId`, 1, 160, add)
        if (!['Ed25519', 'ES256', 'RS256'].includes(String(key.algorithm))) add(`${path}.signingKeys[${index}].algorithm`, 'INVALID_SIGNING_ALGORITHM', 'Unsupported signing key algorithm')
        optionalString(key.publicKeyRef, `${path}.signingKeys[${index}].publicKeyRef`, 1, 500, add)
        optionalUrl(key.jwksUrl, `${path}.signingKeys[${index}].jwksUrl`, add)
      })
    }
  }
  if (value.attestation !== undefined) {
    if (!isRecord(value.attestation)) add(`${path}.attestation`, 'INVALID_ATTESTATION', 'attestation must be an object')
    else {
      if (typeof value.attestation.required !== 'boolean') add(`${path}.attestation.required`, 'INVALID_BOOLEAN', 'attestation.required must be boolean')
      optionalString(value.attestation.provider, `${path}.attestation.provider`, 1, 120, add)
    }
  }
  for (const field of ['releaseChecksum', 'backendBuildChecksum'] as const) {
    if (value[field] !== undefined && (typeof value[field] !== 'string' || !SHA256_PATTERN.test(value[field]))) {
      add(`${path}.${field}`, 'INVALID_CHECKSUM', `${field} must be SHA-256 hex when provided`)
    }
  }
}

function validateBackendNetwork(value: unknown, path: string, add: AddIssue) {
  if (value === undefined) return
  if (!isRecord(value)) {
    add(path, 'INVALID_BACKEND_NETWORK', 'backend.network must be an object')
    return
  }
  for (const field of ['allowLocalhost', 'allowPrivateNetwork', 'denyMetadataEndpoints', 'followRedirects'] as const) {
    if (value[field] !== undefined && typeof value[field] !== 'boolean') add(`${path}.${field}`, 'INVALID_BOOLEAN', `${field} must be boolean`)
  }
  if (value.denyMetadataEndpoints === false) add(`${path}.denyMetadataEndpoints`, 'METADATA_ENDPOINTS_MUST_BE_DENIED', 'metadata endpoint blocking must not be disabled')
  if (value.followRedirects === true) add(`${path}.followRedirects`, 'UNTRUSTED_REDIRECTS_NOT_ALLOWED', 'module backend verification must not follow untrusted redirects by default')
  if (value.allowedPorts !== undefined) {
    if (!Array.isArray(value.allowedPorts) || value.allowedPorts.length > 20) add(`${path}.allowedPorts`, 'INVALID_ALLOWED_PORTS', 'allowedPorts must be a bounded array')
    else {
      value.allowedPorts.forEach((port, index) => {
        if (!Number.isInteger(port) || port < 1 || port > 65535) add(`${path}.allowedPorts[${index}]`, 'INVALID_PORT', 'port must be 1..65535')
      })
    }
  }
  if (value.blockedCidrs !== undefined) validateStringArray(value.blockedCidrs, `${path}.blockedCidrs`, 80, add)
}

function validateBackendLifecycle(value: unknown, path: string, add: AddIssue) {
  if (value === undefined) return
  if (!isRecord(value)) {
    add(path, 'INVALID_BACKEND_LIFECYCLE', 'backend.lifecycle must be an object')
    return
  }
  if (value.initialState !== undefined && !BACKEND_LIFECYCLE_STATES.has(value.initialState as ModulaBackendLifecycleState)) add(`${path}.initialState`, 'INVALID_BACKEND_LIFECYCLE_STATE', 'Unsupported backend lifecycle state')
  if (value.supportedStates !== undefined) {
    if (!Array.isArray(value.supportedStates) || value.supportedStates.length < 1) add(`${path}.supportedStates`, 'INVALID_BACKEND_LIFECYCLE_STATES', 'supportedStates must be a non-empty array')
    else {
      value.supportedStates.forEach((state, index) => {
        if (!BACKEND_LIFECYCLE_STATES.has(state as ModulaBackendLifecycleState)) add(`${path}.supportedStates[${index}]`, 'INVALID_BACKEND_LIFECYCLE_STATE', 'Unsupported backend lifecycle state')
      })
    }
  }
  if (value.reverifyOnEndpointChange !== undefined && typeof value.reverifyOnEndpointChange !== 'boolean') add(`${path}.reverifyOnEndpointChange`, 'INVALID_BOOLEAN', 'reverifyOnEndpointChange must be boolean')
  if (value.disableOnQuarantine !== undefined && typeof value.disableOnQuarantine !== 'boolean') add(`${path}.disableOnQuarantine`, 'INVALID_BOOLEAN', 'disableOnQuarantine must be boolean')
}

function validateBackendActions(value: unknown, path: string, ownsBackend: boolean, add: AddIssue) {
  if (value === undefined) return
  if (!Array.isArray(value) || value.length > 120) {
    add(path, 'INVALID_BACKEND_ACTIONS', 'backend actions must be a bounded array')
    return
  }
  if (ownsBackend && value.length < 1) add(path, 'MISSING_BACKEND_ACTIONS', 'module-managed and hybrid action backends must declare actions')
  value.forEach((action, index) => {
    if (!isRecord(action)) {
      add(`${path}[${index}]`, 'INVALID_BACKEND_ACTION', 'backend action must be an object')
      return
    }
    checkString(action.actionId, `${path}[${index}].actionId`, 1, 220, add)
    if (action.method !== 'POST') add(`${path}[${index}].method`, 'INVALID_BACKEND_ACTION_METHOD', 'backend actions must use POST')
    validateBackendPath(action.path, `${path}[${index}].path`, true, add)
    checkString(action.inputSchema, `${path}[${index}].inputSchema`, 1, 240, add)
    checkString(action.outputSchema, `${path}[${index}].outputSchema`, 1, 240, add)
    if (!Array.isArray(action.permissions)) add(`${path}[${index}].permissions`, 'INVALID_PERMISSIONS', 'permissions must be an array')
    if (typeof action.idempotent !== 'boolean') add(`${path}[${index}].idempotent`, 'INVALID_BOOLEAN', 'idempotent must be boolean')
    if (!BACKEND_ACTION_SIDE_EFFECTS.has(String(action.sideEffects))) add(`${path}[${index}].sideEffects`, 'INVALID_BACKEND_ACTION_SIDE_EFFECTS', 'Unsupported backend action sideEffects')
    if (!BACKEND_ACTION_CONFIRMATIONS.has(String(action.confirmation))) add(`${path}[${index}].confirmation`, 'INVALID_BACKEND_ACTION_CONFIRMATION', 'Unsupported backend action confirmation')
    if (typeof action.timeoutMs !== 'number' || !Number.isInteger(action.timeoutMs) || action.timeoutMs < 100 || action.timeoutMs > 60000) add(`${path}[${index}].timeoutMs`, 'INVALID_TIMEOUT', 'backend action timeout must be 100..60000 ms')
    if (action.sideEffects === 'financial' && !['reauthentication', 'operator'].includes(String(action.confirmation))) {
      add(`${path}[${index}].confirmation`, 'FINANCIAL_ACTION_CONFIRMATION_REQUIRED', 'financial backend actions require reauthentication or operator confirmation')
    }
    if (action.sideEffects === 'destructive' && action.confirmation === 'none') {
      add(`${path}[${index}].confirmation`, 'DESTRUCTIVE_ACTION_CONFIRMATION_REQUIRED', 'destructive backend actions require confirmation')
    }
  })
}

function validateBackendClientAccess(value: unknown, path: string, add: AddIssue) {
  if (value === undefined) return
  if (!isRecord(value)) {
    add(path, 'INVALID_CLIENT_ACCESS', 'backend.clientAccess must be an object')
    return
  }
  if (typeof value.allowed !== 'boolean') add(`${path}.allowed`, 'INVALID_BOOLEAN', 'clientAccess.allowed must be boolean')
  if (!Array.isArray(value.protocols)) add(`${path}.protocols`, 'INVALID_CLIENT_PROTOCOLS', 'clientAccess.protocols must be an array')
  else {
    value.protocols.forEach((protocol, index) => {
      if (!['https', 'wss'].includes(String(protocol))) add(`${path}.protocols[${index}]`, 'INVALID_CLIENT_PROTOCOL', 'Only https and wss client access are supported')
    })
  }
  if (value.tokenExchangeRequired !== true) add(`${path}.tokenExchangeRequired`, 'TOKEN_EXCHANGE_REQUIRED', 'direct client access requires token exchange')
  if (!Array.isArray(value.allowedOrigins) || value.allowedOrigins.length < 1 || value.allowedOrigins.length > 40) add(`${path}.allowedOrigins`, 'INVALID_ALLOWED_ORIGINS', 'client access allowedOrigins must be a bounded array')
  else value.allowedOrigins.forEach((origin, index) => validateBackendOrigin(origin, `${path}.allowedOrigins[${index}]`, {allowLocalhost: false}, add))
  if (typeof value.maxSessionSeconds !== 'number' || !Number.isInteger(value.maxSessionSeconds) || value.maxSessionSeconds < 30 || value.maxSessionSeconds > 900) {
    add(`${path}.maxSessionSeconds`, 'INVALID_CLIENT_SESSION_TTL', 'client access sessions must be 30..900 seconds')
  }
}

const STANDARD_20_EXTENSION_KEYS = [
  'identity',
  'dependencyGraph',
  'serviceRegistry',
  'apiRegistry',
  'eventBus',
  'hookRegistry',
  'capabilityDiscovery',
  'healthModel',
  'diagnosticsModel',
  'metrics',
  'permissionModel',
  'jobRegistry',
  'storageModel',
  'widgetRegistry',
  'navigationRegistry',
  'uiContributions',
  'automationRegistry',
  'offline',
  'realtime',
  'versioning',
  'compatibilityMatrix',
  'marketplace',
  'engineReadiness',
  'exports',
  'imports',
  'synchronization',
  'integrations',
  'billing',
  'telemetry',
  'accessibility',
  'localization',
  'appearance',
  'onboarding',
] as const

const STANDARD_20_SERVICE_KINDS = new Set(['search', 'export', 'autosave', 'revision', 'history', 'markdown', 'storage', 'ai', 'automation', 'custom'])
const STANDARD_20_API_METHODS = new Set(['GET', 'POST', 'PATCH', 'PUT', 'DELETE'])
const STANDARD_20_API_SIDE_EFFECTS = new Set(['none', 'read', 'write', 'destructive', 'external', 'financial'])
const STANDARD_20_HOOK_PHASES = new Set(['before', 'after'])
const STANDARD_20_JOB_KINDS = new Set(['cron', 'queue', 'delayed', 'recurring', 'realtime', 'repair', 'migration', 'cleanup', 'reindex', 'sync', 'health'])
const STANDARD_20_STORAGE_KINDS = new Set(['structured-records', 'blob-storage', 'attachments', 'object-storage', 'cache', 'temporary-storage', 'encrypted-storage', 'secrets', 'settings', 'history', 'search-index', 'ai-memory'])
const STANDARD_20_WIDGET_SURFACES = new Set(['board', 'profile', 'dashboard', 'home', 'settings', 'search', 'sidebar', 'floating', 'lock-screen'])
const STANDARD_20_NAVIGATION_KINDS = new Set(['route', 'tab', 'sheet', 'dialog', 'drawer', 'menu-item', 'composer-tool', 'context-menu', 'quick-action', 'search-provider'])
const STANDARD_20_UI_KINDS = new Set(['board-card', 'profile-tab', 'settings-section', 'composer-action', 'feed-card', 'notification-card', 'context-menu', 'toolbar-button', 'overflow-menu', 'action-sheet', 'search-provider'])
const STANDARD_20_OFFLINE_SYNC = new Set(['none', 'manual', 'background', 'realtime'])
const STANDARD_20_CONFLICT_STRATEGIES = new Set(['client-wins', 'server-wins', 'merge', 'manual-review'])
const STANDARD_20_COMPAT_PLATFORMS = new Set(['ios', 'android', 'web', 'desktop', 'server'])
const STANDARD_20_ENGINES = new Set(['declarative-ui', 'records', 'actions', 'functions', 'ai', 'automation', 'media', 'documents', 'game', 'webgpu', 'spatial', 'unity', 'godot', 'custom-native'])

function validateStandard20Extensions(input: Record<string, unknown>, moduleId: string, add: AddIssue) {
  const isStandard20 = input.standardVersion === MODULA_MODULE_STANDARD_2_VERSION
  const hasStandard20Extensions = input.sectionVersions !== undefined || STANDARD_20_EXTENSION_KEYS.some(key => input[key] !== undefined)
  if (!isStandard20) {
    if (hasStandard20Extensions) {
      add('$.standardVersion', 'STANDARD_2_FIELDS_REQUIRE_2_0', 'Standard 2.0 extension sections require standardVersion 2.0.0')
    }
    return
  }

  validateSectionVersions(input.sectionVersions, add)
  validateVersionedSection(input.identity, '$.identity', add)
  validateDependencyGraph(input.dependencyGraph, '$.dependencyGraph', moduleId, add)
  validateVersionedSection(input.serviceRegistry, '$.serviceRegistry', add, (item, itemPath) => validateService(item, itemPath, moduleId, add))
  validateVersionedSection(input.apiRegistry, '$.apiRegistry', add, (item, itemPath) => validateApiOperation(item, itemPath, moduleId, add))
  validateVersionedSection(input.eventBus, '$.eventBus', add, (item, itemPath) => validateGenericNamedItem(item, itemPath, moduleId, add))
  validateVersionedSection(input.hookRegistry, '$.hookRegistry', add, (item, itemPath) => validateHook(item, itemPath, moduleId, add))
  validateCapabilityDiscovery(input.capabilityDiscovery, '$.capabilityDiscovery', add)
  validateVersionedSection(input.healthModel, '$.healthModel', add, (item, itemPath) => {
    if (isRecord(item) && item.status !== undefined && !HEALTH_STATES.has(String(item.status))) {
      add(`${itemPath}.status`, 'INVALID_HEALTH_STATE', 'Unsupported Standard 2.0 health state')
    }
  })
  validateVersionedSection(input.diagnosticsModel, '$.diagnosticsModel', add)
  validateVersionedSection(input.metrics, '$.metrics', add, (item, itemPath) => validateGenericNamedItem(item, itemPath, moduleId, add))
  validatePermissionModel(input.permissionModel, '$.permissionModel', add)
  validateVersionedSection(input.jobRegistry, '$.jobRegistry', add, (item, itemPath) => validateJob(item, itemPath, moduleId, add))
  validateVersionedSection(input.storageModel, '$.storageModel', add, (item, itemPath) => validateStorage(item, itemPath, moduleId, add))
  validateVersionedSection(input.widgetRegistry, '$.widgetRegistry', add, (item, itemPath) => validateWidget(item, itemPath, moduleId, add))
  validateVersionedSection(input.navigationRegistry, '$.navigationRegistry', add, (item, itemPath) => validateNavigation(item, itemPath, moduleId, add))
  validateVersionedSection(input.uiContributions, '$.uiContributions', add, (item, itemPath) => validateUiContribution(item, itemPath, moduleId, add))
  validateVersionedSection(input.automationRegistry, '$.automationRegistry', add, (item, itemPath) => validateAutomation20(item, itemPath, moduleId, add))
  validateOffline(input.offline, '$.offline', add)
  validateRealtime(input.realtime, '$.realtime', add)
  validateVersioning(input.versioning, '$.versioning', add)
  validateCompatibilityMatrix(input.compatibilityMatrix, '$.compatibilityMatrix', add)
  validateMarketplace(input.marketplace, '$.marketplace', add)
  validateEngineReadiness(input.engineReadiness, '$.engineReadiness', add)
  for (const key of ['exports', 'imports', 'synchronization', 'integrations', 'billing', 'telemetry', 'accessibility', 'localization', 'appearance', 'onboarding'] as const) {
    validateVersionedSection(input[key], `$.${key}`, add)
  }
}

function validateSectionVersions(value: unknown, add: AddIssue) {
  if (!isRecord(value)) {
    add('$.sectionVersions', 'MISSING_SECTION_VERSIONS', 'Standard 2.0 manifests must version every manifest section')
    return
  }
  const seen = new Set(Object.keys(value))
  for (const section of MODULE_STANDARD_20_SECTION_NAMES) {
    if (!seen.has(section)) {
      add(`$.sectionVersions.${section}`, 'MISSING_SECTION_VERSION', `Section ${section} must declare a semantic version`)
      continue
    }
    if (!isSemver(value[section])) add(`$.sectionVersions.${section}`, 'INVALID_SEMVER', `Section ${section} version must be semantic`)
  }
  for (const section of seen) {
    if (!MODULE_STANDARD_20_SECTION_NAMES.includes(section as any)) add(`$.sectionVersions.${section}`, 'UNKNOWN_SECTION_VERSION', `Unknown Standard 2.0 section ${section}`)
  }
}

function validateVersionedSection(
  value: unknown,
  path: string,
  add: AddIssue,
  validateItem?: (item: Record<string, unknown>, itemPath: string) => void,
) {
  if (value === undefined) return
  if (!isRecord(value)) {
    add(path, 'INVALID_VERSIONED_SECTION', 'Standard 2.0 sections must be objects')
    return
  }
  if (!isSemver(value.version)) add(`${path}.version`, 'INVALID_SEMVER', 'Section version must be semantic')
  if (value.items !== undefined) {
    if (!Array.isArray(value.items) || value.items.length > 500) {
      add(`${path}.items`, 'INVALID_SECTION_ITEMS', 'Section items must be a bounded array')
      return
    }
    value.items.forEach((item, index) => {
      if (!isRecord(item)) {
        add(`${path}.items[${index}]`, 'INVALID_SECTION_ITEM', 'Section items must be objects')
        return
      }
      validateItem?.(item, `${path}.items[${index}]`)
    })
  }
}

function validateDependencyGraph(value: unknown, path: string, moduleId: string, add: AddIssue) {
  if (value === undefined) return
  if (!isRecord(value)) {
    add(path, 'INVALID_DEPENDENCY_GRAPH', 'dependencyGraph must be an object')
    return
  }
  if (!isSemver(value.version)) add(`${path}.version`, 'INVALID_SEMVER', 'dependencyGraph version must be semantic')
  for (const group of ['requires', 'optional', 'recommended'] as const) {
    validateDependencyRefs(value[group], `${path}.${group}`, moduleId, add)
  }
  for (const group of ['conflicts', 'replaces'] as const) {
    validateConflictRefs(value[group], `${path}.${group}`, moduleId, add)
  }
  if (!Array.isArray(value.provides)) {
    add(`${path}.provides`, 'INVALID_PROVIDES', 'dependencyGraph.provides must be an array')
  } else {
    value.provides.forEach((item, index) => {
      if (!isRecord(item)) {
        add(`${path}.provides[${index}]`, 'INVALID_PROVIDE', 'provides entries must be objects')
        return
      }
      checkString(item.id, `${path}.provides[${index}].id`, 1, 220, add)
      checkString(item.title, `${path}.provides[${index}].title`, 1, 160, add)
      if (!isSemver(item.version)) add(`${path}.provides[${index}].version`, 'INVALID_SEMVER', 'provided contract version must be semantic')
      if (!['service', 'api', 'record', 'capability', 'engine', 'integration', 'ui'].includes(String(item.kind))) add(`${path}.provides[${index}].kind`, 'INVALID_PROVIDE_KIND', 'Unsupported provides kind')
    })
  }
}

function validateDependencyRefs(value: unknown, path: string, moduleId: string, add: AddIssue) {
  if (!Array.isArray(value) || value.length > 120) {
    add(path, 'INVALID_DEPENDENCY_REFS', `${path} must be a bounded array`)
    return
  }
  value.forEach((dependency, index) => {
    if (!isRecord(dependency)) {
      add(`${path}[${index}]`, 'INVALID_DEPENDENCY_REF', 'Dependency references must be objects')
      return
    }
    const hasModule = typeof dependency.moduleId === 'string'
    const hasProvides = typeof dependency.provides === 'string'
    if (!hasModule && !hasProvides) add(`${path}[${index}]`, 'MISSING_DEPENDENCY_TARGET', 'Dependency requires moduleId or provides')
    if (hasModule) {
      if (!ID_PATTERN.test(String(dependency.moduleId))) add(`${path}[${index}].moduleId`, 'INVALID_MODULE_ID', 'Dependency moduleId must be a lowercase dotted identifier')
      if (dependency.moduleId === moduleId) add(`${path}[${index}].moduleId`, 'SELF_DEPENDENCY', 'Module cannot depend on itself')
    }
    if (hasProvides) checkString(dependency.provides, `${path}[${index}].provides`, 1, 220, add)
    if (!isSemverRange(dependency.versionRange)) add(`${path}[${index}].versionRange`, 'INVALID_SEMVER_RANGE', 'Dependency versionRange must be semantic')
    if (dependency.capabilityIds !== undefined) validateStringArray(dependency.capabilityIds, `${path}[${index}].capabilityIds`, 80, add)
  })
}

function validateConflictRefs(value: unknown, path: string, moduleId: string, add: AddIssue) {
  if (!Array.isArray(value) || value.length > 120) {
    add(path, 'INVALID_DEPENDENCY_REFS', `${path} must be a bounded array`)
    return
  }
  value.forEach((dependency, index) => {
    if (!isRecord(dependency)) {
      add(`${path}[${index}]`, 'INVALID_DEPENDENCY_REF', 'Dependency references must be objects')
      return
    }
    checkString(dependency.moduleId, `${path}[${index}].moduleId`, 1, 220, add)
    if (dependency.moduleId === moduleId) add(`${path}[${index}].moduleId`, 'SELF_DEPENDENCY', 'Module cannot depend on itself')
    if (dependency.versionRange !== undefined && !isSemverRange(dependency.versionRange)) add(`${path}[${index}].versionRange`, 'INVALID_SEMVER_RANGE', 'Dependency versionRange must be semantic')
    checkString(dependency.reason, `${path}[${index}].reason`, 1, 500, add)
  })
}

function validateService(item: Record<string, unknown>, path: string, moduleId: string, add: AddIssue) {
  validateNamespacedId(item.id, `${path}.id`, moduleId, add)
  checkString(item.title, `${path}.title`, 1, 160, add)
  if (!isSemver(item.version)) add(`${path}.version`, 'INVALID_SEMVER', 'Service version must be semantic')
  if (!STANDARD_20_SERVICE_KINDS.has(String(item.kind))) add(`${path}.kind`, 'INVALID_SERVICE_KIND', 'Unsupported service kind')
  checkString(item.contract, `${path}.contract`, 1, 240, add)
  if (item.permissions !== undefined) validateStringArray(item.permissions, `${path}.permissions`, 80, add)
  if (item.capabilities !== undefined) validateStringArray(item.capabilities, `${path}.capabilities`, 80, add)
}

function validateApiOperation(item: Record<string, unknown>, path: string, moduleId: string, add: AddIssue) {
  validateNamespacedId(item.id, `${path}.id`, moduleId, add)
  checkString(item.title, `${path}.title`, 1, 160, add)
  if (!isSemver(item.version)) add(`${path}.version`, 'INVALID_SEMVER', 'API operation version must be semantic')
  if (!STANDARD_20_API_METHODS.has(String(item.method))) add(`${path}.method`, 'INVALID_API_METHOD', 'Unsupported API method')
  checkString(item.path, `${path}.path`, 1, 240, add)
  if (typeof item.path === 'string' && !item.path.startsWith(`/api/modula/${moduleId}/`)) {
    add(`${path}.path`, 'INVALID_MODULE_API_PATH', `Module APIs must be exposed under /api/modula/${moduleId}/`)
  }
  optionalString(item.inputSchema, `${path}.inputSchema`, 1, 240, add)
  optionalString(item.outputSchema, `${path}.outputSchema`, 1, 240, add)
  if (!Array.isArray(item.permissions)) add(`${path}.permissions`, 'INVALID_PERMISSIONS', 'API operation permissions must be an array')
  if (!STANDARD_20_API_SIDE_EFFECTS.has(String(item.sideEffects))) add(`${path}.sideEffects`, 'INVALID_API_SIDE_EFFECTS', 'Unsupported API sideEffects')
  if (typeof item.idempotent !== 'boolean') add(`${path}.idempotent`, 'INVALID_BOOLEAN', 'idempotent must be boolean')
}

function validateHook(item: Record<string, unknown>, path: string, moduleId: string, add: AddIssue) {
  validateNamespacedId(item.id, `${path}.id`, moduleId, add)
  checkString(item.hook, `${path}.hook`, 1, 160, add)
  if (!STANDARD_20_HOOK_PHASES.has(String(item.phase))) add(`${path}.phase`, 'INVALID_HOOK_PHASE', 'Hook phase must be before or after')
  checkString(item.target, `${path}.target`, 1, 220, add)
  optionalString(item.functionId, `${path}.functionId`, 1, 220, add)
  if (!POLICY_MODES.has(String(item.policyMode))) add(`${path}.policyMode`, 'INVALID_POLICY_MODE', 'Hook policyMode is required')
}

function validateCapabilityDiscovery(value: unknown, path: string, add: AddIssue) {
  if (value === undefined) return
  if (!isRecord(value)) {
    add(path, 'INVALID_CAPABILITY_DISCOVERY', 'capabilityDiscovery must be an object')
    return
  }
  if (!isSemver(value.version)) add(`${path}.version`, 'INVALID_SEMVER', 'capabilityDiscovery version must be semantic')
  for (const [key, entry] of Object.entries(value)) {
    if (key.startsWith('supports') && typeof entry !== 'boolean') add(`${path}.${key}`, 'INVALID_BOOLEAN', `${key} must be boolean`)
  }
}

function validatePermissionModel(value: unknown, path: string, add: AddIssue) {
  if (value === undefined) return
  if (!isRecord(value)) {
    add(path, 'INVALID_PERMISSION_MODEL', 'permissionModel must be an object')
    return
  }
  if (!isSemver(value.version)) add(`${path}.version`, 'INVALID_SEMVER', 'permissionModel version must be semantic')
  if (!isRecord(value.categories)) {
    add(`${path}.categories`, 'INVALID_PERMISSION_CATEGORIES', 'permissionModel.categories must be an object')
    return
  }
  for (const [category, grants] of Object.entries(value.categories)) {
    if (!MODULE_STANDARD_20_PERMISSION_CATEGORIES.includes(category as any)) add(`${path}.categories.${category}`, 'UNKNOWN_PERMISSION_CATEGORY', `Unknown permission category ${category}`)
    if (!Array.isArray(grants) || grants.length > 120) {
      add(`${path}.categories.${category}`, 'INVALID_PERMISSION_GRANTS', 'Permission category grants must be a bounded array')
      continue
    }
    grants.forEach((grant, index) => {
      if (!isRecord(grant)) {
        add(`${path}.categories.${category}[${index}]`, 'INVALID_PERMISSION_GRANT', 'Permission grants must be objects')
        return
      }
      checkString(grant.id, `${path}.categories.${category}[${index}].id`, 1, 220, add)
      if (typeof grant.id === 'string' && grant.id.includes('*')) add(`${path}.categories.${category}[${index}].id`, 'WILDCARD_PERMISSION', 'Wildcard permissions are prohibited')
      checkString(grant.reason, `${path}.categories.${category}[${index}].reason`, 1, 500, add)
      if (typeof grant.required !== 'boolean') add(`${path}.categories.${category}[${index}].required`, 'INVALID_BOOLEAN', 'required must be boolean')
      if (!['low', 'medium', 'high', 'critical', 'restricted'].includes(String(grant.risk))) add(`${path}.categories.${category}[${index}].risk`, 'INVALID_RISK', 'Unsupported permission risk')
      if (!POLICY_MODES.has(String(grant.policyMode))) add(`${path}.categories.${category}[${index}].policyMode`, 'INVALID_POLICY_MODE', 'Unsupported permission policyMode')
    })
  }
}

function validateJob(item: Record<string, unknown>, path: string, moduleId: string, add: AddIssue) {
  validateNamespacedId(item.id, `${path}.id`, moduleId, add)
  checkString(item.title, `${path}.title`, 1, 160, add)
  if (!STANDARD_20_JOB_KINDS.has(String(item.kind))) add(`${path}.kind`, 'INVALID_JOB_KIND', 'Unsupported background job kind')
  optionalString(item.schedule, `${path}.schedule`, 1, 120, add)
  optionalString(item.queue, `${path}.queue`, 1, 120, add)
  optionalString(item.functionId, `${path}.functionId`, 1, 220, add)
  if (item.permissions !== undefined) validateStringArray(item.permissions, `${path}.permissions`, 80, add)
}

function validateStorage(item: Record<string, unknown>, path: string, moduleId: string, add: AddIssue) {
  validateNamespacedId(item.id, `${path}.id`, moduleId, add)
  if (!STANDARD_20_STORAGE_KINDS.has(String(item.kind))) add(`${path}.kind`, 'INVALID_STORAGE_KIND', 'Unsupported storage kind')
  if (!isSemver(item.version)) add(`${path}.version`, 'INVALID_SEMVER', 'Storage declaration version must be semantic')
  if (item.encrypted !== undefined && typeof item.encrypted !== 'boolean') add(`${path}.encrypted`, 'INVALID_BOOLEAN', 'encrypted must be boolean')
  optionalString(item.retention, `${path}.retention`, 1, 500, add)
}

function validateWidget(item: Record<string, unknown>, path: string, moduleId: string, add: AddIssue) {
  validateNamespacedId(item.id, `${path}.id`, moduleId, add)
  checkString(item.title, `${path}.title`, 1, 160, add)
  if (!STANDARD_20_WIDGET_SURFACES.has(String(item.surface))) add(`${path}.surface`, 'INVALID_WIDGET_SURFACE', 'Unsupported widget surface')
  optionalString(item.viewId, `${path}.viewId`, 1, 220, add)
  if (item.permissions !== undefined) validateStringArray(item.permissions, `${path}.permissions`, 80, add)
}

function validateNavigation(item: Record<string, unknown>, path: string, moduleId: string, add: AddIssue) {
  validateNamespacedId(item.id, `${path}.id`, moduleId, add)
  checkString(item.title, `${path}.title`, 1, 160, add)
  if (!STANDARD_20_NAVIGATION_KINDS.has(String(item.kind))) add(`${path}.kind`, 'INVALID_NAVIGATION_KIND', 'Unsupported navigation contribution kind')
  checkString(item.target, `${path}.target`, 1, 240, add)
  optionalString(item.surface, `${path}.surface`, 1, 120, add)
  if (item.permissions !== undefined) validateStringArray(item.permissions, `${path}.permissions`, 80, add)
}

function validateUiContribution(item: Record<string, unknown>, path: string, moduleId: string, add: AddIssue) {
  validateNamespacedId(item.id, `${path}.id`, moduleId, add)
  checkString(item.title, `${path}.title`, 1, 160, add)
  if (!STANDARD_20_UI_KINDS.has(String(item.kind))) add(`${path}.kind`, 'INVALID_UI_CONTRIBUTION_KIND', 'Unsupported UI contribution kind')
  checkString(item.target, `${path}.target`, 1, 240, add)
  checkString(item.contract, `${path}.contract`, 1, 240, add)
}

function validateAutomation20(item: Record<string, unknown>, path: string, moduleId: string, add: AddIssue) {
  validateNamespacedId(item.id, `${path}.id`, moduleId, add)
  checkString(item.title, `${path}.title`, 1, 160, add)
  for (const field of ['triggers', 'actions', 'conditions'] as const) validateStringArray(item[field], `${path}.${field}`, 120, add)
}

function validateOffline(value: unknown, path: string, add: AddIssue) {
  if (value === undefined) return
  if (!isRecord(value)) {
    add(path, 'INVALID_OFFLINE_DECLARATION', 'offline must be an object')
    return
  }
  if (!isSemver(value.version)) add(`${path}.version`, 'INVALID_SEMVER', 'offline version must be semantic')
  if (typeof value.capable !== 'boolean') add(`${path}.capable`, 'INVALID_BOOLEAN', 'offline.capable must be boolean')
  if (value.syncStrategy !== undefined && !STANDARD_20_OFFLINE_SYNC.has(String(value.syncStrategy))) add(`${path}.syncStrategy`, 'INVALID_SYNC_STRATEGY', 'Unsupported offline sync strategy')
  if (value.conflictStrategy !== undefined && !STANDARD_20_CONFLICT_STRATEGIES.has(String(value.conflictStrategy))) add(`${path}.conflictStrategy`, 'INVALID_CONFLICT_STRATEGY', 'Unsupported conflict strategy')
  if (value.compression !== undefined && typeof value.compression !== 'boolean') add(`${path}.compression`, 'INVALID_BOOLEAN', 'compression must be boolean')
  if (value.encryption !== undefined && typeof value.encryption !== 'boolean') add(`${path}.encryption`, 'INVALID_BOOLEAN', 'encryption must be boolean')
}

function validateRealtime(value: unknown, path: string, add: AddIssue) {
  if (value === undefined) return
  if (!isRecord(value)) {
    add(path, 'INVALID_REALTIME_DECLARATION', 'realtime must be an object')
    return
  }
  if (!isSemver(value.version)) add(`${path}.version`, 'INVALID_SEMVER', 'realtime version must be semantic')
  validateStringArray(value.events, `${path}.events`, 200, add)
  for (const field of ['presence', 'typing', 'watchers'] as const) {
    if (value[field] !== undefined && typeof value[field] !== 'boolean') add(`${path}.${field}`, 'INVALID_BOOLEAN', `${field} must be boolean`)
  }
  if (value.subscriptions !== undefined) validateStringArray(value.subscriptions, `${path}.subscriptions`, 120, add)
  if (value.channels !== undefined) validateStringArray(value.channels, `${path}.channels`, 120, add)
}

function validateVersioning(value: unknown, path: string, add: AddIssue) {
  if (value === undefined) return
  if (!isRecord(value)) {
    add(path, 'INVALID_VERSIONING_DECLARATION', 'versioning must be an object')
    return
  }
  if (!isSemver(value.version)) add(`${path}.version`, 'INVALID_SEMVER', 'versioning section version must be semantic')
  for (const field of ['moduleVersion', 'standardVersion', 'publisherVersion', 'protocolVersion', 'backendVersion', 'schemaVersion', 'manifestVersion', 'aiVersion', 'migrationVersion', 'searchVersion', 'runtimeVersion'] as const) {
    if (value[field] !== undefined && !isSemver(value[field])) add(`${path}.${field}`, 'INVALID_SEMVER', `${field} must be semantic when provided`)
  }
}

function validateCompatibilityMatrix(value: unknown, path: string, add: AddIssue) {
  if (value === undefined) return
  if (!isRecord(value)) {
    add(path, 'INVALID_COMPATIBILITY_MATRIX', 'compatibilityMatrix must be an object')
    return
  }
  if (!isSemver(value.version)) add(`${path}.version`, 'INVALID_SEMVER', 'compatibilityMatrix version must be semantic')
  for (const field of ['modulaVersion', 'greenfieldVersion', 'moduleStandardVersion', 'runtimeVersion', 'backendRuntime', 'connectorRuntime', 'aiRuntime', 'engineRuntime'] as const) {
    if (value[field] !== undefined && !isSemverRange(value[field])) add(`${path}.${field}`, 'INVALID_SEMVER_RANGE', `${field} must be a semantic version range`)
  }
  validateStringEnumArray(value.platforms, `${path}.platforms`, STANDARD_20_COMPAT_PLATFORMS, 5, add)
}

function validateMarketplace(value: unknown, path: string, add: AddIssue) {
  if (value === undefined) return
  if (!isRecord(value)) {
    add(path, 'INVALID_MARKETPLACE_DECLARATION', 'marketplace must be an object')
    return
  }
  if (!isSemver(value.version)) add(`${path}.version`, 'INVALID_SEMVER', 'marketplace version must be semantic')
  for (const field of ['publisherProfile', 'source', 'repository', 'changelog', 'roadmap', 'support', 'documentation', 'issueTracker'] as const) {
    optionalString(value[field], `${path}.${field}`, 1, 500, add)
  }
  if (value.verifiedBadge !== undefined && typeof value.verifiedBadge !== 'boolean') add(`${path}.verifiedBadge`, 'INVALID_BOOLEAN', 'verifiedBadge must be boolean')
  if (value.securityScore !== undefined && (typeof value.securityScore !== 'number' || value.securityScore < 0 || value.securityScore > 100)) {
    add(`${path}.securityScore`, 'INVALID_SECURITY_SCORE', 'securityScore must be 0..100')
  }
  if (value.downloads !== undefined && (typeof value.downloads !== 'number' || !Number.isInteger(value.downloads) || value.downloads < 0)) add(`${path}.downloads`, 'INVALID_DOWNLOADS', 'downloads must be a non-negative integer')
  if (value.requiredRuntimes !== undefined) validateStringArray(value.requiredRuntimes, `${path}.requiredRuntimes`, 80, add)
  if (value.aiSupport !== undefined && typeof value.aiSupport !== 'boolean') add(`${path}.aiSupport`, 'INVALID_BOOLEAN', 'aiSupport must be boolean')
}

function validateEngineReadiness(value: unknown, path: string, add: AddIssue) {
  if (value === undefined) return
  if (!isRecord(value)) {
    add(path, 'INVALID_ENGINE_READINESS', 'engineReadiness must be an object')
    return
  }
  if (!isSemver(value.version)) add(`${path}.version`, 'INVALID_SEMVER', 'engineReadiness version must be semantic')
  validateStringEnumArray(value.engines, `${path}.engines`, STANDARD_20_ENGINES, 20, add)
}

function validateGenericNamedItem(item: Record<string, unknown>, path: string, moduleId: string, add: AddIssue) {
  validateNamespacedId(item.id, `${path}.id`, moduleId, add)
  if (item.title !== undefined) checkString(item.title, `${path}.title`, 1, 160, add)
  if (item.version !== undefined && !isSemver(item.version)) add(`${path}.version`, 'INVALID_SEMVER', 'Item version must be semantic')
}

function validateProvenanceEvidence(release: unknown, options: ModulaModuleValidationOptions, add: AddIssue) {
  if (!isRecord(release)) return
  if (options.expectedChecksum && release.checksum !== options.expectedChecksum) {
    add('$.release.checksum', 'CHECKSUM_MISMATCH', 'Release checksum does not match expected provenance evidence')
  }
  if (options.expectedCommitSha && release.commitSha !== options.expectedCommitSha) {
    add('$.release.commitSha', 'COMMIT_SHA_MISMATCH', 'Release commit SHA does not match expected provenance evidence')
  }
}

function validateIdUniqueness(input: Record<string, unknown>, add: AddIssue) {
  const seen = new Map<string, string>()
  const groups = ['records', 'views', 'actions', 'functions', 'settings', 'events', 'automations', 'search', 'ai'] as const
  for (const group of groups) {
    const values = input[group]
    if (!Array.isArray(values)) continue
    values.forEach((item, index) => {
      if (!isRecord(item) || typeof item.id !== 'string') return
      const previous = seen.get(item.id)
      if (previous) add(`$.${group}[${index}].id`, 'DUPLICATE_ID', `Duplicate definition ID also used at ${previous}`)
      seen.set(item.id, `$.${group}[${index}].id`)
    })
  }
}

function validateCrossContracts(input: Record<string, unknown>, add: AddIssue) {
  const capabilities = new Set<string>()
  if (Array.isArray(input.capabilities)) {
    for (const capability of input.capabilities) {
      if (isRecord(capability) && typeof capability.id === 'string') capabilities.add(capability.id)
    }
  }
  if (Array.isArray(input.functions)) {
    for (const [index, fn] of input.functions.entries()) {
      if (!isRecord(fn)) continue
      if (fn.aiCallable === true && !capabilities.has('ai')) add(`$.functions[${index}].aiCallable`, 'AI_CAPABILITY_NOT_DECLARED', 'AI-callable functions require ai capability')
      if (fn.automationCallable === true && !capabilities.has('automations')) {
        add(`$.functions[${index}].automationCallable`, 'AUTOMATION_CAPABILITY_NOT_DECLARED', 'Automation-callable functions require automations capability')
      }
    }
  }
  if (Array.isArray(input.ai) && input.ai.length > 0 && !capabilities.has('ai')) add('$.ai', 'AI_CAPABILITY_NOT_DECLARED', 'AI integrations require ai capability')
  if (Array.isArray(input.search) && input.search.length > 0 && !capabilities.has('search')) add('$.search', 'SEARCH_CAPABILITY_NOT_DECLARED', 'Search definitions require search capability')
}

function scanProhibitedFields(value: unknown, path: string, add: AddIssue) {
  if (!isRecord(value)) {
    if (Array.isArray(value)) value.forEach((item, index) => scanProhibitedFields(item, `${path}[${index}]`, add))
    return
  }
  for (const [key, child] of Object.entries(value)) {
    const childPath = `${path}.${key}`
    if (PROHIBITED_KEYS.has(key)) add(childPath, 'PROHIBITED_FIELD', `Prohibited manifest field ${key}`)
    scanProhibitedFields(child, childPath, add)
  }
}

function validateDefinitionArray<T>(value: unknown, path: string, label: string, add: AddIssue): T[] {
  if (!Array.isArray(value)) {
    add(path, `INVALID_${label.toUpperCase()}`, `${label} must be an array`)
    return []
  }
  const records: T[] = []
  for (const [index, item] of value.entries()) {
    if (!isRecord(item)) {
      add(`${path}[${index}]`, `INVALID_${label.toUpperCase()}_ENTRY`, `${label} entry must be an object`)
      continue
    }
    records.push(item as T)
  }
  return records
}

function validateNamespacedId(value: unknown, path: string, moduleId: string, add: AddIssue) {
  checkString(value, path, 1, 220, add)
  if (typeof value !== 'string') return
  if (!ID_PATTERN.test(value)) add(path, 'INVALID_ID', 'Definition ID must be lowercase and dot/kebab separated')
  if (moduleId && !value.startsWith(`${moduleId}.`)) add(path, 'ID_OUTSIDE_NAMESPACE', `Definition ID must begin with ${moduleId}.`)
}

type AddIssue = (path: string, code: string, message: string, severity?: 'error' | 'warning') => void

function checkString(value: unknown, path: string, min: number, max: number, add: AddIssue) {
  if (typeof value !== 'string' || value.trim().length < min || value.length > max) {
    add(path, 'INVALID_STRING', `${path} must be a string between ${min} and ${max} characters`)
  }
}

function optionalString(value: unknown, path: string, min: number, max: number, add: AddIssue) {
  if (value !== undefined && (typeof value !== 'string' || value.trim().length < min || value.length > max)) {
    add(path, 'INVALID_STRING', `${path} must be a string between ${min} and ${max} characters when provided`)
  }
}

function optionalUrl(value: unknown, path: string, add: AddIssue) {
  if (value === undefined) return
  if (typeof value !== 'string' || !/^https:\/\/[^\s]+$/.test(value)) add(path, 'INVALID_URL', `${path} must be an https URL when provided`)
}

function validateStringArray(value: unknown, path: string, maxItems: number, add: AddIssue) {
  if (!Array.isArray(value) || value.length > maxItems) {
    add(path, 'INVALID_STRING_ARRAY', `${path} must be a bounded string array`)
    return
  }
  value.forEach((item, index) => {
    if (typeof item !== 'string' || item.trim().length < 1 || item.length > 300) add(`${path}[${index}]`, 'INVALID_STRING', `${path}[${index}] must be a non-empty string`)
  })
}

function validateStringEnumArray(value: unknown, path: string, allowed: Set<string>, maxItems: number, add: AddIssue) {
  if (!Array.isArray(value) || value.length < 1 || value.length > maxItems) {
    add(path, 'INVALID_STRING_ARRAY', `${path} must be a non-empty bounded string array`)
    return
  }
  const seen = new Set<string>()
  value.forEach((item, index) => {
    if (typeof item !== 'string' || !allowed.has(item)) add(`${path}[${index}]`, 'INVALID_ENUM_VALUE', `${path}[${index}] is not supported`)
    if (typeof item === 'string' && seen.has(item)) add(`${path}[${index}]`, 'DUPLICATE_VALUE', `${path}[${index}] must be unique`)
    if (typeof item === 'string') seen.add(item)
  })
}

function validateIntegerRange(value: unknown, path: string, min: number, max: number, add: AddIssue) {
  if (typeof value !== 'number' || !Number.isInteger(value) || value < min || value > max) {
    add(path, 'INVALID_INTEGER', `${path} must be an integer between ${min} and ${max}`)
  }
}

function validateBackendPath(value: unknown, path: string, required: boolean, add: AddIssue) {
  if (value === undefined) {
    if (required) add(path, 'MISSING_BACKEND_PATH', `${path} is required`)
    return
  }
  if (
    typeof value !== 'string' ||
    value.length < 1 ||
    value.length > 240 ||
    !value.startsWith('/') ||
    value.includes('://') ||
    value.includes('\\') ||
    value.includes('..')
  ) {
    add(path, 'INVALID_BACKEND_PATH', 'Backend paths must be safe absolute paths under the trusted backend origin')
  }
}

function validateBackendHost(value: unknown, path: string, add: AddIssue) {
  if (typeof value !== 'string' || value.length < 1 || value.length > 253 || value.includes('*') || value.includes('/') || value.includes(':')) {
    add(path, 'INVALID_BACKEND_HOST', 'allowedHosts must contain exact hostnames without scheme, port, wildcard, or path')
    return
  }
  if (isUnsafeHost(value, false)) add(path, 'UNSAFE_BACKEND_HOST', 'localhost, metadata, link-local, and private hosts are not allowed in manifests')
}

function validateBackendOrigin(value: unknown, path: string, options: {allowLocalhost: boolean}, add: AddIssue) {
  if (typeof value !== 'string' || value.length > 300) {
    add(path, 'INVALID_BACKEND_ORIGIN', 'backend origin must be an https origin')
    return
  }
  let url: URL
  try {
    url = new URL(value)
  } catch {
    add(path, 'INVALID_BACKEND_ORIGIN', 'backend origin must be a valid https origin')
    return
  }
  if (url.protocol !== 'https:' || url.pathname !== '/' || url.search || url.hash || url.username || url.password) {
    add(path, 'INVALID_BACKEND_ORIGIN', 'backend origin must be an https origin without path, credentials, query, or fragment')
  }
  if (isUnsafeHost(url.hostname, options.allowLocalhost)) {
    add(path, 'UNSAFE_BACKEND_ORIGIN', 'backend origins must not use localhost, metadata, link-local, or private hosts')
  }
}

function isUnsafeHost(host: string, allowLocalhost: boolean): boolean {
  const normalized = host.toLowerCase().replace(/^\[|\]$/g, '')
  if (!allowLocalhost && (normalized === 'localhost' || normalized.endsWith('.localhost'))) return true
  if (normalized === '169.254.169.254' || normalized === 'metadata.google.internal') return true
  const ipv4 = /^(\d{1,3})\.(\d{1,3})\.(\d{1,3})\.(\d{1,3})$/.exec(normalized)
  if (ipv4) {
    const octets = ipv4.slice(1).map(Number)
    if (octets.some(octet => octet > 255)) return true
    const [a, b] = octets
    if (a === 127 || a === 0 || a === 10 || a === 169 && b === 254 || a === 172 && b >= 16 && b <= 31 || a === 192 && b === 168) return true
  }
  if (normalized === '::1' || normalized.startsWith('fe80:') || normalized.startsWith('fc') || normalized.startsWith('fd')) return true
  return false
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value)
}

function isJsonSchema(value: unknown): value is Record<string, unknown> {
  return isRecord(value) && typeof value.type === 'string'
}

export function assertValidLifecycleTransition(lifecycle: Lifecycle, from: ModulaLifecycleState, to: ModulaLifecycleState): void {
  if (!isLifecycleTransitionAllowed(lifecycle, from, to)) {
    throw Object.assign(new Error(`Invalid module lifecycle transition ${from} -> ${to}`), {code: 'INVALID_LIFECYCLE_TRANSITION'})
  }
}
