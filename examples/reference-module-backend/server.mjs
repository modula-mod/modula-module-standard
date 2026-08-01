import {createHash, timingSafeEqual} from 'node:crypto'
import {createServer} from 'node:http'

const moduleId = 'com.example.reference-backend'
const port = Number(process.env.PORT ?? 8787)
const events = new Set()
const actions = new Map()

const discovery = {
  moduleId,
  moduleVersion: '1.0.0',
  standardVersion: '1.1.0',
  protocolVersion: '1.0.0',
  capabilities: ['actions', 'events', 'webhooks', 'health', 'diagnostics'],
  supportedActions: [`${moduleId}.action.read`, `${moduleId}.action.write`],
  supportedEvents: [`module.${moduleId}.item.created`],
  healthUrl: `http://localhost:${port}/v1/health`,
  documentationUrl: `http://localhost:${port}/docs`,
  deploymentId: 'reference-local',
  region: 'local',
}

const server = createServer(async (request, response) => {
  response.setHeader('content-type', 'application/json')
  try {
    if (request.method === 'GET' && request.url === '/.well-known/modula-module') return send(response, discovery)
    if (request.method === 'GET' && request.url === '/v1/health') return send(response, health('healthy'))
    if (request.method === 'GET' && request.url === '/v1/capabilities') return send(response, {capabilities: discovery.capabilities})
    if (request.method === 'GET' && request.url === '/v1/diagnostics') return send(response, diagnostics())
    if (request.method === 'POST' && request.url === '/v1/session/exchange') return exchangeSession(request, response)
    if (request.method === 'POST' && request.url?.startsWith('/v1/actions/')) return runAction(request, response)
    if (request.method === 'POST' && request.url === '/v1/events') return ingestEvent(request, response)
    if (request.method === 'POST' && request.url === '/v1/webhooks/modula') return receiveWebhook(request, response)
    response.statusCode = 404
    return send(response, {error: 'not_found'})
  } catch (error) {
    response.statusCode = 500
    return send(response, {error: 'server_error', message: error instanceof Error ? error.message : String(error)})
  }
})

async function exchangeSession(request, response) {
  const body = await readBody(request)
  if (!body.installationId || !body.moduleId || body.moduleId !== moduleId) {
    response.statusCode = 403
    return send(response, {error: 'invalid_installation_scope'})
  }
  return send(response, {
    token: signReferenceToken({moduleId, installationId: body.installationId, permissions: body.permissions ?? []}),
    expiresIn: 900,
  })
}

async function runAction(request, response) {
  const actionId = decodeURIComponent(request.url.split('/').at(-1) ?? '')
  const idempotencyKey = request.headers['idempotency-key']?.toString() ?? ''
  if (!discovery.supportedActions.includes(actionId)) {
    response.statusCode = 404
    return send(response, {ok: false, error: {code: 'ACTION_NOT_FOUND', message: 'Unsupported action'}})
  }
  if (!idempotencyKey) {
    response.statusCode = 400
    return send(response, {ok: false, error: {code: 'IDEMPOTENCY_REQUIRED', message: 'Idempotency key is required'}})
  }
  if (actions.has(idempotencyKey)) return send(response, actions.get(idempotencyKey))
  const body = await readBody(request)
  const result = {ok: true, idempotent: true, result: {actionId, echoed: actionId.endsWith('.read') ? null : body.input ?? {}}}
  actions.set(idempotencyKey, result)
  return send(response, result)
}

async function ingestEvent(request, response) {
  const body = await readBody(request)
  if (!body.eventId || events.has(body.eventId)) {
    response.statusCode = 409
    return send(response, {accepted: false, duplicate: true})
  }
  events.add(body.eventId)
  return send(response, {accepted: true})
}

async function receiveWebhook(request, response) {
  const body = await readBody(request)
  const signature = request.headers['x-modula-signature']?.toString() ?? ''
  const expected = createHash('sha256').update(JSON.stringify(body)).digest('hex')
  const valid =
    signature.length === expected.length &&
    timingSafeEqual(Buffer.from(signature), Buffer.from(expected))
  if (!valid) {
    response.statusCode = 401
    return send(response, {accepted: false, reason: 'invalid_signature'})
  }
  return send(response, {accepted: true})
}

function health(status) {
  return {
    status,
    components: [
      {id: 'api', status},
      {id: 'events', status: 'healthy'},
      {id: 'webhooks', status: 'healthy'},
    ],
    circuitState: 'closed',
    failureCount: 0,
  }
}

function diagnostics() {
  return {
    mode: 'module-managed',
    resolvedEndpoint: `http://localhost:${port}`,
    protocolVersion: '1.0.0',
    deploymentIdentity: 'reference-local',
    tokenExchangeStatus: 'available',
    failureCount: 0,
    circuitState: 'closed',
    webhookFailures: 0,
  }
}

function signReferenceToken(payload) {
  return Buffer.from(JSON.stringify({...payload, issuedAt: Math.floor(Date.now() / 1000)})).toString('base64url')
}

async function readBody(request) {
  let text = ''
  for await (const chunk of request) {
    text += chunk
    if (text.length > 1_000_000) throw new Error('body too large')
  }
  return text ? JSON.parse(text) : {}
}

function send(response, value) {
  response.end(JSON.stringify(value))
}

server.listen(port, () => {
  console.log(`Reference module backend listening on http://localhost:${port}`)
})
