#!/usr/bin/env node
import {mkdir, readFile, writeFile} from 'node:fs/promises'
import {dirname, join} from 'node:path'
import {pathToFileURL} from 'node:url'
import {
  DEFAULT_LIFECYCLE_TRANSITIONS,
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
  modula module test <manifest.json>
  modula module build <manifest.json>
  modula module pack <manifest.json>
  modula module publish <manifest.json>
  modula module diff <old-manifest.json> <new-manifest.json>
  modula module migrate <manifest.json> --from <data-schema-version>
  modula module upgrade-standard <manifest.json>

The standalone binary also accepts the same commands without the "module" prefix:
  modula-module validate <manifest.json>
`

export async function run(rawArgs: string[]): Promise<CommandResult> {
  const args = normalizeArgs(rawArgs)
  const [command, first, second] = args
  if (!command || command === 'help' || command === '--help' || command === '-h') return ok(HELP_TEXT)

  try {
    if (command === 'create') return createCommand(args.slice(1))
    if (command === 'validate') return validateCommand(first)
    if (command === 'inspect') return inspectCommand(first)
    if (command === 'test') return testCommand(first)
    if (command === 'build') return buildCommand(first)
    if (command === 'pack') return packCommand(first)
    if (command === 'publish') return publishCommand(first)
    if (command === 'diff') return diffCommand(first, second)
    if (command === 'migrate') return migrateCommand(args.slice(1))
    if (command === 'upgrade-standard') return upgradeStandardCommand(first)
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
  const directory = args[0]
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
  const validation = await validateCommand(manifestPath)
  if (validation.exitCode !== 0) return validation
  return {
    exitCode: 1,
    stderr: `Publish is intentionally not configured in this foundation package.
Set a reviewed registry target and signing workflow before enabling modula module publish.
`,
  }
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

async function readManifestArg(path: string | undefined): Promise<unknown> {
  if (!path) throw new Error('Missing manifest path')
  const text = await readFile(path, 'utf8')
  return JSON.parse(text) as unknown
}

async function writeJson(path: string, value: unknown) {
  await mkdir(dirname(path), {recursive: true})
  await writeFile(path, `${JSON.stringify(value, null, 2)}\n`)
}

function createTemplateManifest(moduleId: string, slug: string, name: string): ModulaModuleManifest {
  const publisher = {id: 'example', name: 'Example Publisher', website: 'https://example.com'}
  const recordId = `${moduleId}.record.item`
  const functionId = `${moduleId}.function.create-item`
  return {
    schemaVersion: '1.0.0',
    standardVersion: '1.0.0',
    moduleVersion: '1.0.0',
    manifestSchemaVersion: '1.0.0',
    dataSchemaVersion: '1.0.0',
    id: moduleId,
    slug,
    name,
    description: `${name} generated module template.`,
    publisher,
    compatibility: {host: '^1.0.0', runtime: '^1.0.0', standard: '^1.0.0', platforms: ['web', 'ios', 'android']},
    lifecycle: {executionMode: 'declarative', defaultState: 'installed', allowedTransitions: DEFAULT_LIFECYCLE_TRANSITIONS, uninstall: {dataPolicy: 'retain', requiresConfirmation: true}},
    permissions: [{id: 'records:item:read', reason: 'Read module item records.', required: true, risk: 'low', policyMode: 'observe'}],
    capabilities: [
      {id: 'records', reason: 'Store module records.', required: true},
      {id: 'views', reason: 'Render declarative views.', required: true},
      {id: 'functions', reason: 'Expose declarative function contracts.', required: true},
      {id: 'search', reason: 'Index public-safe projections.', required: false, degradedBehavior: 'Module remains available without universal search.'},
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
  }
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

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  const result = await run(process.argv.slice(2))
  if (result.stdout) process.stdout.write(result.stdout)
  if (result.stderr) process.stderr.write(result.stderr)
  process.exitCode = result.exitCode
}
