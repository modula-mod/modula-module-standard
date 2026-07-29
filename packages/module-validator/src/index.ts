import {
  MODULA_DATA_SCHEMA_VERSION,
  MODULA_MANIFEST_SCHEMA_VERSION,
  MODULA_MODULE_STANDARD_VERSION,
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
])

const PLATFORMS = new Set<ModulaPlatform>(['ios', 'android', 'web', 'server'])
const HEALTH_STATES = new Set(['healthy', 'degraded', 'failed', 'disabled', 'quarantined'])
const LIFECYCLE_STATES = new Set(['discovered', 'installed', 'enabled', 'disabled', 'updating', 'failed', 'quarantined', 'uninstalled'])
const EXECUTION_MODES = new Set(['declarative', 'built-in', 'hosted', 'remote-http'])
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
  const required = [
    ['schemaVersion', MODULA_MANIFEST_SCHEMA_VERSION],
    ['standardVersion', MODULA_MODULE_STANDARD_VERSION],
    ['manifestSchemaVersion', MODULA_MANIFEST_SCHEMA_VERSION],
    ['dataSchemaVersion', MODULA_DATA_SCHEMA_VERSION],
  ] as const
  for (const [field, expected] of required) {
    if (!isSemver(input[field])) add(`$.${field}`, 'INVALID_SEMVER', `${field} must be semantic version`)
    if (input[field] !== expected) add(`$.${field}`, 'UNSUPPORTED_VERSION', `${field} must be ${expected} for Module Standard 1.0`)
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
    validateNamespacedId(ai.id, `${path}[${index}].id`, moduleId, add)
    for (const field of ['features', 'allowedContext', 'toolDefinitions', 'structuredOutputs', 'permissions'] as const) {
      if (!Array.isArray(ai[field])) add(`${path}[${index}].${field}`, 'INVALID_ARRAY', `${field} must be an array`)
    }
    if (!POLICY_MODES.has(String(ai.policyMode))) add(`${path}[${index}].policyMode`, 'INVALID_POLICY_MODE', 'AI policyMode is required')
  }
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
