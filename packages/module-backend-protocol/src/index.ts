export const MODULA_MODULE_BACKEND_PROTOCOL_VERSION = '1.0.0' as const
export const MODULA_MODULE_BACKEND_DISCOVERY_PATH = '/.well-known/modula-module' as const
export const MODULA_MODULE_BACKEND_HEALTH_PATH = '/v1/health' as const
export const MODULA_MODULE_BACKEND_CAPABILITIES_PATH = '/v1/capabilities' as const
export const MODULA_MODULE_BACKEND_SESSION_EXCHANGE_PATH = '/v1/session/exchange' as const
export const MODULA_MODULE_BACKEND_ACTIONS_PATH = '/v1/actions' as const
export const MODULA_MODULE_BACKEND_EVENTS_PATH = '/v1/events' as const
export const MODULA_MODULE_BACKEND_WEBHOOK_PATH = '/v1/webhooks/modula' as const

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

export type ModuleBackendHealthStatus = 'healthy' | 'degraded' | 'unreachable' | 'incompatible' | 'quarantined' | 'disabled'

export type ModuleBackendHealthComponent = {
  id: string
  status: ModuleBackendHealthStatus
  message?: string
  checkedAt?: string
}

export type ModuleBackendHealth = {
  status: ModuleBackendHealthStatus
  components: ModuleBackendHealthComponent[]
  latencyMs?: number
  failureCount?: number
  circuitState?: 'closed' | 'open' | 'half-open'
}

export type ModuleBackendActionRequest = {
  actionId: string
  installationId: string
  moduleId: string
  input: unknown
  idempotencyKey: string
  requestId: string
  token: string
}

export type ModuleBackendActionResponse = {
  ok: boolean
  result?: unknown
  error?: {
    code: string
    message: string
  }
  idempotent?: boolean
}

export type ModuleBackendEventEnvelope = {
  eventId: string
  eventType: string
  moduleId: string
  installationId: string
  occurredAt: string
  payload: unknown
  signature?: string
  nonce?: string
}

export type ModuleBackendWebhookEnvelope = {
  webhookId: string
  eventType: string
  moduleId: string
  installationId: string
  deliveredAt: string
  payload: unknown
  signature: string
  nonce: string
}

export type ModuleBackendDiagnostics = {
  mode: string
  resolvedEndpoint?: string
  protocolVersion?: string
  deploymentIdentity?: string
  lastSuccessfulHealthCheck?: string
  latencyMs?: number
  failureCount?: number
  circuitState?: 'closed' | 'open' | 'half-open'
  tokenExchangeStatus?: 'not-attempted' | 'available' | 'failed'
  eventLagMs?: number
  webhookFailures?: number
}

export type ModuleBackendDiscoveryExpectation = {
  moduleId?: string
  moduleVersion?: string
  standardVersion?: string
  protocolVersion?: string
}

export type ModuleBackendProtocolIssue = {
  path: string
  code: string
  message: string
}

export type ModuleBackendProtocolValidationResult = {
  valid: boolean
  issues: ModuleBackendProtocolIssue[]
}

export function validateModuleBackendDiscovery(
  input: unknown,
  expected: ModuleBackendDiscoveryExpectation = {},
): ModuleBackendProtocolValidationResult {
  const issues: ModuleBackendProtocolIssue[] = []
  const add = (path: string, code: string, message: string) => issues.push({path, code, message})
  if (!isRecord(input)) {
    add('$', 'DISCOVERY_NOT_OBJECT', 'Discovery response must be an object')
    return {valid: false, issues}
  }
  checkString(input.moduleId, '$.moduleId', add)
  checkString(input.moduleVersion, '$.moduleVersion', add)
  checkString(input.standardVersion, '$.standardVersion', add)
  checkString(input.protocolVersion, '$.protocolVersion', add)
  checkString(input.healthUrl, '$.healthUrl', add)
  for (const field of ['capabilities', 'supportedActions', 'supportedEvents'] as const) {
    if (!Array.isArray(input[field])) add(`$.${field}`, 'INVALID_ARRAY', `${field} must be an array`)
  }
  if (expected.moduleId && input.moduleId !== expected.moduleId) add('$.moduleId', 'MODULE_ID_MISMATCH', 'Discovery moduleId does not match expected module')
  if (expected.moduleVersion && input.moduleVersion !== expected.moduleVersion) add('$.moduleVersion', 'MODULE_VERSION_MISMATCH', 'Discovery moduleVersion does not match expected version')
  if (expected.standardVersion && input.standardVersion !== expected.standardVersion) add('$.standardVersion', 'STANDARD_VERSION_MISMATCH', 'Discovery standardVersion does not match expected standard')
  if ((expected.protocolVersion ?? MODULA_MODULE_BACKEND_PROTOCOL_VERSION) !== input.protocolVersion) {
    add('$.protocolVersion', 'PROTOCOL_VERSION_MISMATCH', 'Discovery protocolVersion is unsupported')
  }
  return {valid: issues.length === 0, issues}
}

export function createModuleBackendDiscovery(input: ModuleBackendDiscovery): ModuleBackendDiscovery {
  return {
    moduleId: input.moduleId,
    moduleVersion: input.moduleVersion,
    standardVersion: input.standardVersion,
    protocolVersion: input.protocolVersion,
    capabilities: [...input.capabilities],
    supportedActions: [...input.supportedActions],
    supportedEvents: [...input.supportedEvents],
    healthUrl: input.healthUrl,
    documentationUrl: input.documentationUrl,
    deploymentId: input.deploymentId,
    region: input.region,
  }
}

function checkString(value: unknown, path: string, add: (path: string, code: string, message: string) => void) {
  if (typeof value !== 'string' || value.length < 1 || value.length > 300) add(path, 'INVALID_STRING', `${path} must be a non-empty string`)
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value)
}
