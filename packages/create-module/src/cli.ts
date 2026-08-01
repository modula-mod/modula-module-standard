#!/usr/bin/env node
import {get} from 'node:https'
import {mkdir, readFile, writeFile} from 'node:fs/promises'
import {dirname, isAbsolute, join} from 'node:path'
import {pathToFileURL} from 'node:url'
import {
  DEFAULT_LIFECYCLE_TRANSITIONS,
  MODULA_MANIFEST_SCHEMA_VERSION,
  MODULA_MODULE_STANDARD_2_SCHEMA_URI,
  MODULA_MODULE_STANDARD_VERSION,
  createDefaultModuleSectionVersions,
  extractModuleStandard20Summary,
  manifestChecksum,
  type ModulaModuleManifest,
} from '@modula/module-sdk'
import {runModuleStandardTestPlan} from '@modula/module-testing'
import {validateModulaModuleManifest} from '@modula/module-validator'

export type CommandResult = {
  exitCode: number
  stdout?: string
  stderr?: string
}

const HELP_TEXT = `Modula Module Standard CLI

Usage:
  modula module create <directory> --id <module-id> --name <name>
  modula module validate <manifest.json>
  modula module inspect <manifest.json>
  modula module doctor <manifest.json>
  modula module test <manifest.json>
  modula module benchmark <manifest.json>
  modula module generate <manifest.json>
  modula module schema
  modula module docs
  modula module build <manifest.json>
  modula module bundle <manifest.json>
  modula module pack <manifest.json>
  modula module release <manifest.json>
  modula module publish <manifest.json>
  modula module sign <manifest.json>
  modula module diff <old-manifest.json> <new-manifest.json>
  modula module migrate <manifest.json> --from <data-schema-version>
  modula module rollback <manifest.json> --to <data-schema-version>
  modula module upgrade <manifest.json>
  modula module upgrade-standard <manifest.json>
  modula module ai <manifest.json>
  modula module search <manifest.json>
  modula module events <manifest.json>
  modula module permissions <manifest.json>
  modula module health <manifest.json>
  modula module telemetry <manifest.json>
  modula module install <manifest.json>
  modula module backend validate <manifest.json>
  modula module backend discover <manifest.json> [--origin <https-origin>]
  modula module backend health <manifest.json> [--origin <https-origin>]
  modula module backend test <manifest.json>
  modula module backend mock <directory>

The standalone binary also accepts the same commands without the "module" prefix:
  modula-module validate <manifest.json>
`

const userCwd = process.env.INIT_CWD ?? process.cwd()

export async function run(rawArgs: string[]): Promise<CommandResult> {
  const args = normalizeArgs(rawArgs)
  const [command, first, second] = args
  if (!command || command === 'help' || command === '--help' || command === '-h') return ok(HELP_TEXT)

  try {
    if (command === 'create') return createCommand(args.slice(1))
    if (command === 'validate') return validateCommand(first)
    if (command === 'inspect') return inspectCommand(first)
    if (command === 'doctor') return doctorCommand(first)
    if (command === 'test') return testCommand(first)
    if (command === 'benchmark') return benchmarkCommand(first)
    if (command === 'generate') return generateCommand(first)
    if (command === 'schema') return schemaCommand()
    if (command === 'docs') return docsCommand()
    if (command === 'build') return buildCommand(first)
    if (command === 'bundle') return packCommand(first)
    if (command === 'pack') return packCommand(first)
    if (command === 'release') return releaseCommand(first)
    if (command === 'publish') return publishCommand(first)
    if (command === 'sign') return signCommand(first)
    if (command === 'diff') return diffCommand(first, second)
    if (command === 'migrate') return migrateCommand(args.slice(1))
    if (command === 'rollback') return rollbackCommand(args.slice(1))
    if (command === 'upgrade') return upgradeStandardCommand(first)
    if (command === 'upgrade-standard') return upgradeStandardCommand(first)
    if (command === 'ai') return sectionCommand(first, 'ai')
    if (command === 'search') return sectionCommand(first, 'search')
    if (command === 'events') return sectionCommand(first, 'events')
    if (command === 'permissions') return sectionCommand(first, 'permissions')
    if (command === 'health') return sectionCommand(first, 'health')
    if (command === 'telemetry') return sectionCommand(first, 'telemetry')
    if (command === 'install') return installCommand(first)
    if (command === 'backend') return backendCommand(args.slice(1))
    return {exitCode: 1, stderr: `Unknown command: ${rawArgs.join(' ')}\n\n${HELP_TEXT}`}
  } catch (error) {
    return {exitCode: 1, stderr: `${formatError(error)}\n`}
  }
}

function normalizeArgs(args: string[]): string[] {
  if (args[0] === 'module') return args.slice(1)
  if (args[0] === '--') return args.slice(1)
  return args
}

async function createCommand(args: string[]): Promise<CommandResult> {
  const directory = args[0] ? resolveUserPath(args[0]) : undefined
  if (!directory) return {exitCode: 1, stderr: 'Missing directory. Usage: modula module create <directory> --id <module-id> --name <name>\n'}
  const moduleId = flagValue(args, '--id') ?? 'com.example.module'
  const name = flagValue(args, '--name') ?? 'Example Module'
  const slug = flagValue(args, '--slug') ?? moduleId.split('.').at(-1) ?? 'module'
  const manifest = createTemplateManifest(moduleId, slug, name)
  await mkdir(directory, {recursive: true})
  await writeJson(join(directory, 'manifest.json'), manifest)
  await writeFile(
    join(directory, 'README.md'),
    `# ${name}

Generated Modula module template.

Validate with:
  modula module validate manifest.json
`,
  )
  return ok(`Created Modula module template
  directory: ${directory}
  manifest: ${join(directory, 'manifest.json')}
  standardVersion: ${manifest.standardVersion}
`)
}

async function validateCommand(manifestPath: string | undefined): Promise<CommandResult> {
  const manifest = await readManifestArg(manifestPath)
  const result = validateModulaModuleManifest(manifest)
  if (!result.valid) {
    return {
      exitCode: 1,
      stderr: `Invalid Modula Module Standard manifest: ${manifestPath}\n${formatIssues(result.issues)}\n`,
    }
  }
  return ok(`Valid Modula Module Standard manifest
  id: ${result.manifest!.id}
  standardVersion: ${result.manifest!.standardVersion}
  moduleVersion: ${result.manifest!.moduleVersion}
  manifestSchemaVersion: ${result.manifest!.manifestSchemaVersion}
  dataSchemaVersion: ${result.manifest!.dataSchemaVersion}
`)
}

async function inspectCommand(manifestPath: string | undefined): Promise<CommandResult> {
  const manifest = await readManifestArg(manifestPath)
  const result = validateModulaModuleManifest(manifest)
  if (!result.valid || !result.manifest) {
    return {exitCode: 1, stderr: `Cannot inspect invalid manifest: ${manifestPath}\n${formatIssues(result.issues)}\n`}
  }
  const item = result.manifest
  const summary = extractModuleStandard20Summary(item as unknown as Record<string, unknown>)
  return ok(`Modula module inspection
  id: ${item.id}
  name: ${item.name}
  publisher: ${item.publisher.name}
  standardVersion: ${item.standardVersion}
  moduleVersion: ${item.moduleVersion}
  records: ${item.records.length}
  views: ${item.views.length}
  actions: ${item.actions.length}
  functions: ${item.functions.length}
  events: ${item.events.length}
  automations: ${item.automations.length}
  ai: ${item.ai.length}
  search: ${item.search.length}
  health: ${item.health.status}
  trust: ${item.trust.level}
  services: ${summary.services}
  apiOperations: ${summary.apis}
  hooks: ${summary.hooks}
  jobs: ${summary.jobs}
  widgets: ${summary.widgets}
  engines: ${summary.engines.length ? summary.engines.join(', ') : 'none'}
`)
}

async function doctorCommand(manifestPath: string | undefined): Promise<CommandResult> {
  const manifest = await readManifestArg(manifestPath)
  const result = runModuleStandardTestPlan(manifest)
  if (!result.valid) return {exitCode: 1, stderr: `Module doctor failed\n${formatIssues(result.validation.issues)}\n`}
  if (!result.validation.manifest || !result.health || !result.diagnostics) return {exitCode: 1, stderr: 'Module doctor did not produce complete inspection output\n'}
  const validatedManifest = result.validation.manifest
  const summary = extractModuleStandard20Summary(validatedManifest as unknown as Record<string, unknown>)
  return ok(`Module doctor passed
  standardVersion: ${validatedManifest.standardVersion}
  services: ${summary.services}
  apiOperations: ${summary.apis}
  hooks: ${summary.hooks}
  capabilityFlags: ${Object.keys(summary.capabilityFlags).length}
  health: ${result.health.status}
  diagnostics: ${result.diagnostics.components.length}
`)
}

async function testCommand(manifestPath: string | undefined): Promise<CommandResult> {
  const manifest = await readManifestArg(manifestPath)
  const result = runModuleStandardTestPlan(manifest)
  if (!result.valid) {
    return {exitCode: 1, stderr: `Module sandbox test failed: ${manifestPath}\n${formatIssues(result.validation.issues)}\n`}
  }
  if (!result.negotiation || !result.events || !result.search || !result.health) {
    return {exitCode: 1, stderr: 'Module sandbox test did not produce complete inspection output\n'}
  }
  return ok(`Module sandbox test passed
  compatibility: ${result.negotiation.compatibility.compatible ? 'compatible' : 'incompatible'}
  canEnable: ${result.negotiation.capabilities.canEnable ? 'yes' : 'no'}
  emittedEvents: ${result.events.emitted.length}
  consumedEvents: ${result.events.consumed.length}
  searchDefinitions: ${result.search.length}
  health: ${result.health.status}
`)
}

async function benchmarkCommand(manifestPath: string | undefined): Promise<CommandResult> {
  const started = performance.now()
  const manifest = await readManifestArg(manifestPath)
  const result = validateModulaModuleManifest(manifest)
  const elapsedMs = Math.round((performance.now() - started) * 100) / 100
  if (!result.valid) return {exitCode: 1, stderr: `Module benchmark validation failed in ${elapsedMs}ms\n${formatIssues(result.issues)}\n`}
  return ok(`Module benchmark passed
  validationMs: ${elapsedMs}
  records: ${result.manifest!.records.length}
  functions: ${result.manifest!.functions.length}
  events: ${result.manifest!.events.length}
`)
}

async function generateCommand(manifestPath: string | undefined): Promise<CommandResult> {
  const manifest = await requireValidManifest(manifestPath)
  return ok(`Generated metadata preview
  openapi: /api/modula/${manifest.id}/openapi.json
  jsonSchema: ${MODULA_MODULE_STANDARD_2_SCHEMA_URI}
  typescript: ${manifest.id}.d.ts
  docs: ${manifest.id}.module-standard.md
  migrationGuide: ${manifest.id}.migration.md
`)
}

function schemaCommand(): CommandResult {
  return ok(`Modula Module Standard schema
  standardVersion: ${MODULA_MODULE_STANDARD_VERSION}
  manifestSchemaVersion: ${MODULA_MANIFEST_SCHEMA_VERSION}
  uri: ${MODULA_MODULE_STANDARD_2_SCHEMA_URI}
  file: schemas/module-manifest-2.0.schema.json
`)
}

function docsCommand(): CommandResult {
  return ok(`Modula Module Standard documentation
  standard: docs/module-standard.md
  standard20: docs/module-standard-2.0.md
  migration: docs/migration-standard-2.0.md
  sdk: docs/module-sdk.md
  validator: docs/module-validator.md
  backend: docs/module-backends.md
`)
}

async function buildCommand(manifestPath: string | undefined): Promise<CommandResult> {
  const validation = await validateCommand(manifestPath)
  if (validation.exitCode !== 0) return validation
  return ok(`${validation.stdout ?? ''}Build foundation passed
  output: declarative contracts only
  runtimeExecution: disabled
`)
}

async function packCommand(manifestPath: string | undefined): Promise<CommandResult> {
  const manifest = await readManifestArg(manifestPath)
  const validation = validateModulaModuleManifest(manifest)
  if (!validation.valid || !validation.manifest) {
    return {exitCode: 1, stderr: `Cannot pack invalid manifest: ${manifestPath}\n${formatIssues(validation.issues)}\n`}
  }
  return ok(`Module pack preview
  id: ${validation.manifest.id}
  checksum: ${manifestChecksum(validation.manifest)}
  publishable: ${validation.manifest.release.reviewStatus === 'approved' ? 'yes' : 'needs review'}
`)
}

async function publishCommand(manifestPath: string | undefined): Promise<CommandResult> {
  const manifest = await requireValidManifest(manifestPath)
  return ok(`Module publish preflight passed
  id: ${manifest.id}
  version: ${manifest.moduleVersion}
  checksum: ${manifestChecksum(manifest)}
  registryTarget: ${process.env.MODULA_REGISTRY_URL ? 'configured' : 'not configured'}
  sideEffects: none
`)
}

async function releaseCommand(manifestPath: string | undefined): Promise<CommandResult> {
  const manifest = await requireValidManifest(manifestPath)
  return ok(`Module release preflight passed
  id: ${manifest.id}
  version: ${manifest.moduleVersion}
  package: ${manifest.slug}-${manifest.moduleVersion}.tgz
  checksum: ${manifestChecksum(manifest)}
  reviewStatus: ${manifest.release.reviewStatus}
`)
}

async function signCommand(manifestPath: string | undefined): Promise<CommandResult> {
  const manifest = await requireValidManifest(manifestPath)
  return ok(`Module signing preflight passed
  id: ${manifest.id}
  checksum: ${manifestChecksum(manifest)}
  signed: ${manifest.release.signing.signed ? 'yes' : 'no'}
  keyId: ${manifest.release.signing.keyId ?? 'not configured'}
`)
}

async function diffCommand(leftPath: string | undefined, rightPath: string | undefined): Promise<CommandResult> {
  const left = await readManifestArg(leftPath)
  const right = await readManifestArg(rightPath)
  if (!isManifestLike(left) || !isManifestLike(right)) return {exitCode: 1, stderr: 'Both manifests must be JSON objects\n'}
  const changes = [
    compareField(left, right, 'standardVersion'),
    compareField(left, right, 'moduleVersion'),
    compareField(left, right, 'manifestSchemaVersion'),
    compareField(left, right, 'dataSchemaVersion'),
  ].filter(Boolean)
  return ok(`Module manifest diff
${changes.length > 0 ? changes.map(change => `  - ${change}`).join('\n') : '  no tracked version changes'}
`)
}

async function migrateCommand(args: string[]): Promise<CommandResult> {
  const manifest = await readManifestArg(args[0])
  const from = flagValue(args, '--from') ?? '0.0.0'
  const result = runModuleStandardTestPlan(manifest)
  if (!result.valid) return {exitCode: 1, stderr: `Cannot migrate invalid manifest\n${formatIssues(result.validation.issues)}\n`}
  if (!result.migrations) return {exitCode: 1, stderr: 'Module sandbox did not produce a migration plan\n'}
  return ok(`Module migration plan
  from: ${from}
  to: ${result.migrations.targetVersion}
  steps: ${result.migrations.steps.length > 0 ? result.migrations.steps.join(', ') : 'none'}
  reversible: ${result.migrations.reversible ? 'yes' : 'no'}
`)
}

async function rollbackCommand(args: string[]): Promise<CommandResult> {
  const manifest = await readManifestArg(args[0])
  const to = flagValue(args, '--to') ?? '0.0.0'
  const result = runModuleStandardTestPlan(manifest)
  if (!result.valid) return {exitCode: 1, stderr: `Cannot rollback invalid manifest\n${formatIssues(result.validation.issues)}\n`}
  if (!result.validation.manifest) return {exitCode: 1, stderr: 'Module rollback did not produce a validated manifest\n'}
  const validatedManifest = result.validation.manifest
  const reversible = validatedManifest.migrations.steps.every(step => step.reversible)
  return ok(`Module rollback plan
  from: ${validatedManifest.dataSchemaVersion}
  to: ${to}
  reversible: ${reversible ? 'yes' : 'no'}
  steps: ${validatedManifest.migrations.steps.map(step => step.id).join(', ') || 'none'}
`)
}

async function upgradeStandardCommand(manifestPath: string | undefined): Promise<CommandResult> {
  const manifest = await readManifestArg(manifestPath)
  const result = validateModulaModuleManifest(manifest)
  if (result.valid) {
    return ok(`Manifest already conforms to Modula Module Standard ${result.manifest!.standardVersion}
`)
  }
  return {
    exitCode: 1,
    stderr: `Automatic standard upgrades are not available for invalid or pre-1.0 manifests.
Run modula module inspect and migrate the four version fields plus missing contract sections manually.
${formatIssues(result.issues)}
`,
  }
}

async function sectionCommand(manifestPath: string | undefined, section: 'ai' | 'search' | 'events' | 'permissions' | 'health' | 'telemetry'): Promise<CommandResult> {
  const manifest = await requireValidManifest(manifestPath)
  const summary = extractModuleStandard20Summary(manifest as unknown as Record<string, unknown>)
  if (section === 'ai') return ok(`Module AI contracts
  integrations: ${manifest.ai.length}
  productActions: ${manifest.ai.reduce((count, item) => count + (item.productActions?.length ?? 0), 0)}
  supportsAI: ${summary.capabilityFlags.supportsAI === true ? 'yes' : 'no'}
`)
  if (section === 'search') return ok(`Module search contracts
  definitions: ${manifest.search.length}
  supportsSearch: ${summary.capabilityFlags.supportsSearch === true ? 'yes' : 'no'}
`)
  if (section === 'events') return ok(`Module event contracts
  emitted: ${manifest.events.filter(event => event.direction === 'emitted').length}
  consumed: ${manifest.events.filter(event => event.direction === 'consumed').length}
  eventBus: ${versionedItemCount((manifest as unknown as Record<string, unknown>).eventBus)}
`)
  if (section === 'permissions') return ok(`Module permission contracts
  legacyPermissions: ${manifest.permissions.length}
  permissionCategories: ${permissionCategoryCount((manifest as unknown as Record<string, unknown>).permissionModel)}
`)
  if (section === 'health') return ok(`Module health contracts
  status: ${manifest.health.status}
  checks: ${manifest.health.checkDefinitions.length}
  healthModel: ${versionedItemCount((manifest as unknown as Record<string, unknown>).healthModel)}
`)
  return ok(`Module telemetry contracts
  metrics: ${summary.metrics}
  telemetry: ${versionedItemCount((manifest as unknown as Record<string, unknown>).telemetry)}
`)
}

async function installCommand(manifestPath: string | undefined): Promise<CommandResult> {
  const manifest = await requireValidManifest(manifestPath)
  const summary = extractModuleStandard20Summary(manifest as unknown as Record<string, unknown>)
  return ok(`Module install preflight
  id: ${manifest.id}
  version: ${manifest.moduleVersion}
  requires: ${summary.dependencies.requires}
  optional: ${summary.dependencies.optional}
  recommended: ${summary.dependencies.recommended}
  conflicts: ${summary.dependencies.conflicts}
  permissions: ${manifest.permissions.length}
  sideEffects: none
`)
}

async function backendCommand(args: string[]): Promise<CommandResult> {
  const [command, first] = args
  if (command === 'validate') return backendValidateCommand(first)
  if (command === 'discover') return backendDiscoverCommand(first, flagValue(args, '--origin'))
  if (command === 'health') return backendHealthCommand(first, flagValue(args, '--origin'))
  if (command === 'test') return backendTestCommand(first)
  if (command === 'mock') return backendMockCommand(first)
  return {exitCode: 1, stderr: `Unknown backend command: ${command ?? ''}\n\n${HELP_TEXT}`}
}

async function backendValidateCommand(manifestPath: string | undefined): Promise<CommandResult> {
  const manifest = await readManifestArg(manifestPath)
  const result = validateModulaModuleManifest(manifest)
  if (!result.valid || !result.manifest) {
    return {exitCode: 1, stderr: `Invalid module backend declaration: ${manifestPath}\n${formatIssues(result.issues)}\n`}
  }
  const backend = result.manifest.backend
  return ok(`Valid module backend declaration
  mode: ${backend?.mode ?? 'greenfield-managed'}
  protocolVersion: ${backend?.protocolVersion ?? 'greenfield'}
  dataLocation: ${backend?.data?.primaryStore ?? 'greenfield'}
  deployment: ${backend?.deployment?.ownership ?? 'modula-hosted'}
  clientAccess: ${backend?.clientAccess?.allowed ? 'allowed' : 'not allowed'}
`)
}

async function backendDiscoverCommand(manifestPath: string | undefined, explicitOrigin: string | undefined): Promise<CommandResult> {
  const manifest = await requireValidBackendManifest(manifestPath)
  const discoveryUrl = resolveBackendUrl(manifest, explicitOrigin, manifest.backend?.endpoints?.discoveryPath ?? '/.well-known/modula-module')
  const discovery = await readHttpsJson(discoveryUrl)
  return ok(`Module backend discovery
  url: ${discoveryUrl}
  moduleId: ${String((discovery as any).moduleId ?? '')}
  standardVersion: ${String((discovery as any).standardVersion ?? '')}
  protocolVersion: ${String((discovery as any).protocolVersion ?? '')}
  capabilities: ${Array.isArray((discovery as any).capabilities) ? (discovery as any).capabilities.length : 0}
`)
}

async function backendHealthCommand(manifestPath: string | undefined, explicitOrigin: string | undefined): Promise<CommandResult> {
  const manifest = await requireValidBackendManifest(manifestPath)
  const healthUrl = resolveBackendUrl(manifest, explicitOrigin, manifest.backend?.endpoints?.healthPath ?? '/v1/health')
  const health = await readHttpsJson(healthUrl)
  return ok(`Module backend health
  url: ${healthUrl}
  status: ${String((health as any).status ?? (health as any).overall ?? 'unknown')}
`)
}

async function backendTestCommand(manifestPath: string | undefined): Promise<CommandResult> {
  const manifest = await readManifestArg(manifestPath)
  const result = runModuleStandardTestPlan(manifest)
  if (!result.valid || !result.backend) return {exitCode: 1, stderr: `Module backend conformance preflight failed\n${formatIssues(result.validation.issues)}\n`}
  return ok(`Module backend conformance preflight passed
  mode: ${result.backend.mode}
  protocolVersion: ${result.backend.protocolVersion}
  primaryStore: ${result.backend.primaryStore}
  deployment: ${result.backend.deploymentOwnership}
`)
}

async function backendMockCommand(directory: string | undefined): Promise<CommandResult> {
  const target = directory ? resolveUserPath(directory) : undefined
  if (!target) return {exitCode: 1, stderr: 'Missing directory. Usage: modula module backend mock <directory>\n'}
  await mkdir(target, {recursive: true})
  await writeFile(join(target, 'server.mjs'), REFERENCE_BACKEND_MOCK)
  return ok(`Created module backend mock
  directory: ${target}
  entry: ${join(target, 'server.mjs')}
`)
}

async function requireValidBackendManifest(manifestPath: string | undefined): Promise<ModulaModuleManifest> {
  const manifest = await requireValidManifest(manifestPath)
  if (!manifest.backend || manifest.backend.mode === 'greenfield-managed' || manifest.backend.mode === 'frontend-only') {
    throw new Error('Backend discovery requires a module-managed or hybrid backend declaration')
  }
  return manifest
}

async function requireValidManifest(manifestPath: string | undefined): Promise<ModulaModuleManifest> {
  const manifest = await readManifestArg(manifestPath)
  const result = validateModulaModuleManifest(manifest)
  if (!result.valid || !result.manifest) throw new Error(`Invalid manifest:\n${formatIssues(result.issues)}`)
  return result.manifest
}

function resolveBackendUrl(manifest: ModulaModuleManifest, explicitOrigin: string | undefined, path: string): string {
  const origin = explicitOrigin ?? manifest.backend?.trust?.allowedOrigins?.[0]
  if (!origin) throw new Error('No backend origin available. Provide --origin or backend.trust.allowedOrigins[0].')
  const url = new URL(path, origin)
  if (url.protocol !== 'https:') throw new Error('Module backend URL must use https')
  return url.toString()
}

async function readHttpsJson(url: string): Promise<unknown> {
  return new Promise((resolve, reject) => {
    get(url, {timeout: 10_000, headers: {'accept': 'application/json'}}, response => {
      let body = ''
      response.setEncoding('utf8')
      response.on('data', chunk => {
        body += chunk
        if (body.length > 1_000_000) {
          response.destroy(new Error('Backend response exceeded 1MB'))
        }
      })
      response.on('end', () => {
        if ((response.statusCode ?? 500) < 200 || (response.statusCode ?? 500) >= 300) {
          reject(new Error(`Backend request failed with HTTP ${response.statusCode ?? 0}`))
          return
        }
        try {
          resolve(JSON.parse(body))
        } catch (error) {
          reject(error)
        }
      })
    }).on('error', reject)
  })
}

async function readManifestArg(path: string | undefined): Promise<unknown> {
  if (!path) throw new Error('Missing manifest path')
  const text = await readFile(resolveUserPath(path), 'utf8')
  return JSON.parse(text) as unknown
}

function resolveUserPath(path: string): string {
  return isAbsolute(path) ? path : join(userCwd, path)
}

async function writeJson(path: string, value: unknown) {
  await mkdir(dirname(path), {recursive: true})
  await writeFile(path, `${JSON.stringify(value, null, 2)}\n`)
}

function createTemplateManifest(moduleId: string, slug: string, name: string): ModulaModuleManifest {
  const publisher = {id: 'example', name: 'Example Publisher', website: 'https://example.com'}
  const recordId = `${moduleId}.record.item`
  const functionId = `${moduleId}.function.create-item`
  const manifest = {
    schemaVersion: MODULA_MANIFEST_SCHEMA_VERSION,
    standardVersion: MODULA_MODULE_STANDARD_VERSION,
    moduleVersion: '1.0.0',
    manifestSchemaVersion: MODULA_MANIFEST_SCHEMA_VERSION,
    dataSchemaVersion: '1.0.0',
    id: moduleId,
    slug,
    name,
    description: `${name} generated Module Standard 2.0 template.`,
    publisher,
    compatibility: {host: '^1.0.0', runtime: '^1.0.0', standard: '^2.0.0', platforms: ['web', 'ios', 'android']},
    lifecycle: {executionMode: 'declarative', defaultState: 'installed', allowedTransitions: DEFAULT_LIFECYCLE_TRANSITIONS, uninstall: {dataPolicy: 'retain', requiresConfirmation: true}},
    permissions: [{id: 'records:item:read', reason: 'Read module item records.', required: true, risk: 'low', policyMode: 'observe'}],
    capabilities: [
      {id: 'records', reason: 'Store module records.', required: true},
      {id: 'views', reason: 'Render declarative views.', required: true},
      {id: 'functions', reason: 'Expose declarative function contracts.', required: true},
      {id: 'search', reason: 'Index public-safe projections.', required: false, degradedBehavior: 'Module remains available without universal search.'},
      {id: 'services', reason: 'Publish discoverable module services.', required: false, degradedBehavior: 'Other modules cannot discover service contracts.'},
      {id: 'apis', reason: 'Expose Greenfield-routed module API contracts.', required: false, degradedBehavior: 'Other modules use records and actions only.'},
      {id: 'hooks', reason: 'Declare lifecycle and record hooks.', required: false, degradedBehavior: 'No module hook subscriptions are registered.'},
      {id: 'jobs', reason: 'Declare host-managed background jobs.', required: false, degradedBehavior: 'Background work must be manually requested.'},
      {id: 'widgets', reason: 'Contribute profile and Board widgets.', required: false, degradedBehavior: 'Module opens through routes only.'},
    ],
    records: [{
      id: recordId,
      schema: {type: 'object', required: ['id', 'title'], properties: {id: {type: 'string'}, title: {type: 'string'}}},
      ownership: 'account',
      visibility: 'private',
      indexes: [{fields: ['title']}],
      uniqueness: {keys: ['id'], scope: 'account'},
      retention: {policy: 'retain'},
      aiPolicy: {allowed: false, context: 'none', policyMode: 'block'},
      searchPolicy: {searchable: true, indexedFields: ['title'], sensitiveFields: [], visibility: 'private'},
      auditPolicy: {events: ['item.created', 'item.updated'], includeRecordBody: false},
      exportPolicy: {allowed: true, formats: ['json']},
    }],
    views: [{id: `${moduleId}.view.collection`, type: 'collection', title: name, recordId, permissions: ['records:item:read'], layout: {kind: 'list', primaryField: 'title'}}],
    actions: [{id: `${moduleId}.action.create-item`, title: 'Create Item', functionId, permissions: [], confirmationPolicy: {required: false, policyMode: 'observe'}, sideEffects: ['record.create'], audit: {event: 'item.create-requested', includeInput: false}}],
    functions: [{id: functionId, title: 'Create Item', inputSchema: {type: 'object'}, outputSchema: {type: 'object'}, permissions: [], aiCallable: false, automationCallable: false, idempotent: true, sideEffects: ['record.create'], timeoutMs: 10000, rateLimit: {windowSeconds: 60, maxCalls: 30}, audit: {event: 'item.created', includeInput: false, includeOutput: false}, confirmationPolicy: {required: false, risk: 'low'}}],
    settings: [{id: `${moduleId}.settings.main`, scope: 'installation', schema: {type: 'object'}, defaults: {}}],
    events: [{id: `${moduleId}.event.item-created`, type: 'item.created', direction: 'emitted', schemaVersion: '1.0.0', schema: {type: 'object'}, permissions: [], replaySupport: true}],
    automations: [],
    search: [{id: `${moduleId}.search.items`, recordId, indexedFields: ['title'], rankingHints: {}, sensitiveFields: [], visibility: 'private', projectionHandler: {kind: 'declarative', projection: {title: 'title'}}}],
    ai: [],
    diagnostics: {components: ['startup', 'runtime', 'permissions', 'dependencies', 'search', 'ai', 'connector', 'health'], warnings: [], errors: [], startup: {}, runtime: {}, permissions: {}, dependencies: {}, search: {}, ai: {}, connector: {}, health: {}},
    health: {status: 'healthy', components: [{id: 'manifest', status: 'healthy'}], checkDefinitions: [{id: 'manifest-validate', component: 'startup', timeoutMs: 1000, required: true}]},
    migrations: {dataSchemaVersion: '1.0.0', steps: [{id: `${moduleId}.migration.1-0-0`, from: '0.0.0', to: '1.0.0', reversible: true, checksum: '1'.repeat(64)}]},
    release: {repository: `modula-mod/${slug}`, commitSha: '0123456789abcdef0123456789abcdef01234567', checksum: '2'.repeat(64), licenseEvidence: ['LICENSE'], signing: {signed: false}, channel: 'dev', reviewStatus: 'unreviewed', securityAdvisories: []},
    trust: {publisher, level: 'untrusted', provenance: {sourceVerified: false, checksumVerified: false, signatureVerified: false}, review: {status: 'unreviewed', evidence: []}, security: {advisories: []}},
    backend: {mode: 'greenfield-managed'},
    sectionVersions: createDefaultModuleSectionVersions(),
    identity: {version: '2.0.0', metadata: {moduleId, slug, publisherId: publisher.id}},
    dependencyGraph: {version: '2.0.0', requires: [], optional: [], recommended: [], conflicts: [], replaces: [], provides: [{id: `${moduleId}.records.item`, title: `${name} item records`, version: '1.0.0', kind: 'record'}]},
    serviceRegistry: {version: '2.0.0', items: [{id: `${moduleId}.service.search`, title: 'Search Service', version: '1.0.0', kind: 'search', contract: `${moduleId}.contract.search`, permissions: ['records:item:read'], capabilities: ['search']}]},
    apiRegistry: {version: '2.0.0', items: [{id: `${moduleId}.api.create-item`, title: 'Create Item API', version: '1.0.0', method: 'POST', path: `/api/modula/${moduleId}/items`, inputSchema: `${moduleId}.schema.item.input`, outputSchema: `${moduleId}.schema.item.output`, permissions: ['records:item:read'], sideEffects: 'write', idempotent: true}]},
    eventBus: {version: '2.0.0', items: [{id: `${moduleId}.event-contract.item-created`, title: 'Item Created', version: '1.0.0', status: 'healthy'}]},
    hookRegistry: {version: '2.0.0', items: [{id: `${moduleId}.hook.before-create-record`, hook: 'BeforeCreateRecord', phase: 'before', target: `${moduleId}.record.item`, policyMode: 'observe'}]},
    capabilityDiscovery: {version: '2.0.0', supportsSearch: true, supportsExport: true, supportsAI: false, supportsOffline: false, supportsRealtime: false, supportsNotifications: false, supportsWidgets: true, supportsAutomation: false, supportsSync: false, supportsHistory: true, supportsSharing: false, supportsEncryption: false, supportsMedia: false, supportsComments: false, supportsPresence: false, supportsVoice: false, supportsVideo: false, supportsBackend: true, supportsCustomBackend: false, supportsSelfHosted: false},
    healthModel: {version: '2.0.0', items: [{id: `${moduleId}.health.manifest`, status: 'healthy'}]},
    diagnosticsModel: {version: '2.0.0', items: [{id: `${moduleId}.diagnostics.manifest`, title: 'Manifest diagnostics'}]},
    metrics: {version: '2.0.0', items: [{id: `${moduleId}.metric.open-count`, title: 'Open count', version: '1.0.0'}]},
    permissionModel: {version: '2.0.0', categories: {data: [{id: 'records:item:read', reason: 'Read module item records.', required: true, risk: 'low', policyMode: 'observe'}]}},
    jobRegistry: {version: '2.0.0', items: [{id: `${moduleId}.job.reindex`, title: 'Reindex items', kind: 'reindex', functionId}]},
    storageModel: {version: '2.0.0', items: [{id: `${moduleId}.storage.records`, kind: 'structured-records', version: '1.0.0', encrypted: false, retention: 'retain'}]},
    widgetRegistry: {version: '2.0.0', items: [{id: `${moduleId}.widget.board`, title: `${name} Board`, surface: 'board', viewId: `${moduleId}.view.collection`, permissions: ['records:item:read']}]},
    navigationRegistry: {version: '2.0.0', items: [{id: `${moduleId}.navigation.route`, title: name, kind: 'route', target: `/module/${moduleId}`, surface: 'module'}]},
    uiContributions: {version: '2.0.0', items: [{id: `${moduleId}.ui.board-card`, title: `${name} card`, kind: 'board-card', target: 'board', contract: `${moduleId}.contract.board-card`}]},
    automationRegistry: {version: '2.0.0', items: []},
    offline: {version: '2.0.0', capable: false, syncStrategy: 'none'},
    realtime: {version: '2.0.0', events: ['item.created'], presence: false, typing: false, watchers: false},
    versioning: {version: '2.0.0', moduleVersion: '1.0.0', standardVersion: '2.0.0', schemaVersion: '1.0.0', manifestVersion: '2.0.0', runtimeVersion: '1.0.0'},
    compatibilityMatrix: {version: '2.0.0', modulaVersion: '^1.0.0', greenfieldVersion: '^1.0.0', moduleStandardVersion: '^2.0.0', platforms: ['web', 'ios', 'android']},
    marketplace: {version: '2.0.0', publisherProfile: publisher.website, verifiedBadge: false, license: 'UNLICENSED', repository: `modula-mod/${slug}`, pricing: 'free', requiredRuntimes: ['greenfield'], aiSupport: false, backendMode: 'greenfield-managed'},
    engineReadiness: {version: '2.0.0', engines: ['declarative-ui', 'records', 'actions', 'functions']},
    exports: {version: '2.0.0', items: []},
    imports: {version: '2.0.0', items: []},
    synchronization: {version: '2.0.0', items: []},
    integrations: {version: '2.0.0', items: []},
    billing: {version: '2.0.0', items: []},
    telemetry: {version: '2.0.0', items: []},
    accessibility: {version: '2.0.0', items: []},
    localization: {version: '2.0.0', items: []},
    appearance: {version: '2.0.0', items: []},
    onboarding: {version: '2.0.0', items: []},
  } as ModulaModuleManifest & Record<string, unknown>
  return manifest
}

function flagValue(args: string[], flag: string): string | undefined {
  const index = args.indexOf(flag)
  return index >= 0 ? args[index + 1] : undefined
}

function compareField(left: Record<string, unknown>, right: Record<string, unknown>, field: string): string | null {
  return left[field] === right[field] ? null : `${field}: ${String(left[field])} -> ${String(right[field])}`
}

function isManifestLike(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value)
}

function versionedItemCount(value: unknown): number {
  if (!isManifestLike(value)) return 0
  return Array.isArray(value.items) ? value.items.length : 0
}

function permissionCategoryCount(value: unknown): number {
  if (!isManifestLike(value)) return 0
  const categories = value.categories
  return isManifestLike(categories) ? Object.keys(categories).length : 0
}

function formatIssues(issues: Array<{path: string; code: string; message: string; severity?: string}>): string {
  return issues.map(issue => `  - ${issue.severity ?? 'error'} ${issue.path} ${issue.code}: ${issue.message}`).join('\n')
}

function ok(stdout: string): CommandResult {
  return {exitCode: 0, stdout}
}

function formatError(error: unknown): string {
  if (error instanceof Error) return error.message
  return String(error)
}

const REFERENCE_BACKEND_MOCK = `import {createServer} from 'node:http'

const discovery = {
  moduleId: 'com.example.module',
  moduleVersion: '1.0.0',
  standardVersion: '1.2.0',
  protocolVersion: '1.0.0',
  capabilities: ['actions', 'events', 'health'],
  supportedActions: ['com.example.module.action.read', 'com.example.module.action.write'],
  supportedEvents: ['module.com.example.module.item.created'],
  healthUrl: 'http://localhost:8787/v1/health',
  deploymentId: 'local-reference',
  region: 'local',
}

const server = createServer((request, response) => {
  response.setHeader('content-type', 'application/json')
  if (request.url === '/.well-known/modula-module') return response.end(JSON.stringify(discovery))
  if (request.url === '/v1/health') return response.end(JSON.stringify({status: 'healthy', components: [{id: 'api', status: 'healthy'}]}))
  if (request.url === '/v1/capabilities') return response.end(JSON.stringify({capabilities: discovery.capabilities}))
  if (request.url?.startsWith('/v1/actions/')) return response.end(JSON.stringify({ok: true, idempotent: true, result: {handled: true}}))
  response.statusCode = 404
  response.end(JSON.stringify({error: 'not_found'}))
})

server.listen(8787, () => {
  console.log('Reference Modula module backend mock listening on http://localhost:8787')
})
`

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  const result = await run(process.argv.slice(2))
  if (result.stdout) process.stdout.write(result.stdout)
  if (result.stderr) process.stderr.write(result.stderr)
  process.exitCode = result.exitCode
}
