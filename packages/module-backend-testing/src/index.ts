import {
  validateModuleBackendDiscovery,
  type ModuleBackendActionResponse,
  type ModuleBackendDiscovery,
  type ModuleBackendDiscoveryExpectation,
  type ModuleBackendHealth,
  type ModuleBackendProtocolIssue,
} from '@modula/module-backend-protocol'

export type ModuleBackendConformanceAdapter = {
  discover(): Promise<unknown> | unknown
  health?(): Promise<unknown> | unknown
  exchangeSession?(): Promise<unknown> | unknown
  runAction?(actionId: string, input: unknown, idempotencyKey: string): Promise<unknown> | unknown
  emitEvent?(): Promise<unknown> | unknown
  receiveWebhook?(): Promise<unknown> | unknown
  diagnostics?(): Promise<unknown> | unknown
}

export type ModuleBackendConformanceCheck = {
  id: string
  passed: boolean
  issues: ModuleBackendProtocolIssue[]
}

export type ModuleBackendConformanceResult = {
  passed: boolean
  checks: ModuleBackendConformanceCheck[]
}

export async function runModuleBackendConformancePlan(
  adapter: ModuleBackendConformanceAdapter,
  expected: ModuleBackendDiscoveryExpectation = {},
): Promise<ModuleBackendConformanceResult> {
  const checks: ModuleBackendConformanceCheck[] = []
  const discovery = await adapter.discover()
  const discoveryValidation = validateModuleBackendDiscovery(discovery, expected)
  checks.push({id: 'discovery', passed: discoveryValidation.valid, issues: discoveryValidation.issues})
  if (adapter.health) checks.push(checkObject('health', await adapter.health(), ['status', 'components']))
  else checks.push({id: 'health', passed: false, issues: [{path: '$.health', code: 'MISSING_HEALTH_CHECK', message: 'health adapter is required'}]})
  if (adapter.exchangeSession) checks.push(checkObject('session-exchange', await adapter.exchangeSession(), ['token']))
  if (adapter.runAction) {
    const first = await adapter.runAction('conformance.read', {}, 'conformance-key')
    const duplicate = await adapter.runAction('conformance.read', {}, 'conformance-key')
    checks.push(checkActionPair(first, duplicate))
  }
  if (adapter.emitEvent) checks.push(checkObject('event-emission', await adapter.emitEvent(), ['eventId', 'eventType']))
  if (adapter.receiveWebhook) checks.push(checkObject('webhook-receipt', await adapter.receiveWebhook(), ['accepted']))
  if (adapter.diagnostics) checks.push(checkObject('diagnostics-redaction', await adapter.diagnostics(), ['mode']))
  return {passed: checks.every(check => check.passed), checks}
}

export function createInMemoryModuleBackend(input: {
  discovery: ModuleBackendDiscovery
  health?: ModuleBackendHealth
  token?: string
  actionResult?: ModuleBackendActionResponse
}): ModuleBackendConformanceAdapter {
  const idempotency = new Map<string, unknown>()
  return {
    discover: () => input.discovery,
    health: () => input.health ?? {status: 'healthy', components: [{id: 'api', status: 'healthy'}]},
    exchangeSession: () => ({token: input.token ?? 'mock-scoped-module-token', expiresIn: 900}),
    runAction: (_actionId, _payload, idempotencyKey) => {
      if (idempotency.has(idempotencyKey)) return idempotency.get(idempotencyKey)
      const result = input.actionResult ?? {ok: true, result: {handled: true}, idempotent: true}
      idempotency.set(idempotencyKey, result)
      return result
    },
    emitEvent: () => ({eventId: 'evt_mock', eventType: 'module.com.example.mock.created'}),
    receiveWebhook: () => ({accepted: true}),
    diagnostics: () => ({mode: 'module-managed', tokenExchangeStatus: 'available'}),
  }
}

function checkObject(id: string, value: unknown, requiredFields: string[]): ModuleBackendConformanceCheck {
  const issues: ModuleBackendProtocolIssue[] = []
  if (!value || typeof value !== 'object' || Array.isArray(value)) {
    issues.push({path: '$', code: 'NOT_OBJECT', message: `${id} response must be an object`})
  } else {
    for (const field of requiredFields) {
      if (!Object.prototype.hasOwnProperty.call(value, field)) issues.push({path: `$.${field}`, code: 'MISSING_FIELD', message: `${id} response missing ${field}`})
    }
  }
  return {id, passed: issues.length === 0, issues}
}

function checkActionPair(first: unknown, duplicate: unknown): ModuleBackendConformanceCheck {
  const base = checkObject('action-idempotency', first, ['ok'])
  if (base.issues.length === 0 && JSON.stringify(first) !== JSON.stringify(duplicate)) {
    base.issues.push({path: '$', code: 'IDEMPOTENCY_MISMATCH', message: 'duplicate idempotency key returned a different action result'})
  }
  return {...base, passed: base.issues.length === 0}
}
