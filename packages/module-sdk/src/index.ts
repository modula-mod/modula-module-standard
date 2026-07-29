import {
  DEFAULT_LIFECYCLE_TRANSITIONS,
  MODULA_DATA_SCHEMA_VERSION,
  MODULA_MANIFEST_SCHEMA_VERSION,
  MODULA_MODULE_STANDARD_VERSION,
  type ActionDefinitions,
  type AIIntegrationDefinitions,
  type AutomationDefinitions,
  type Capability,
  type DiagnosticsDefinitions,
  type EventDefinitions,
  type FunctionDefinitions,
  type HealthDefinitions,
  type JsonObject,
  type JsonSchema,
  type Lifecycle,
  type ModulaModuleManifest,
  type Permission,
  type Publisher,
  type RecordDefinitions,
  type ReleaseMetadata,
  type SearchDefinitions,
  type SettingsDefinitions,
  type TrustMetadata,
  type ViewDefinitions,
  manifestChecksum,
} from '@modula/module-standard'
import {validateModulaModuleManifest} from '@modula/module-validator'

export * from '@modula/module-standard'
export * from '@modula/module-validator'

export type DefineModuleInput = Omit<
  ModulaModuleManifest,
  'schemaVersion' | 'standardVersion' | 'manifestSchemaVersion' | 'dataSchemaVersion'
> & {
  standardVersion?: string
  manifestSchemaVersion?: string
  dataSchemaVersion?: string
}

export function defineModule(input: DefineModuleInput): ModulaModuleManifest {
  const manifest: ModulaModuleManifest = {
    schemaVersion: MODULA_MANIFEST_SCHEMA_VERSION,
    standardVersion: input.standardVersion ?? MODULA_MODULE_STANDARD_VERSION,
    manifestSchemaVersion: input.manifestSchemaVersion ?? MODULA_MANIFEST_SCHEMA_VERSION,
    dataSchemaVersion: input.dataSchemaVersion ?? MODULA_DATA_SCHEMA_VERSION,
    ...input,
  }
  const result = validateModulaModuleManifest(manifest)
  if (!result.valid) {
    throw new Error(`Invalid Modula module manifest: ${result.issues.map(issue => `${issue.path} ${issue.code}`).join('; ')}`)
  }
  return manifest
}

export function definePermission(id: string, reason: string, overrides: Partial<Permission> = {}): Permission {
  return {
    id,
    reason,
    required: overrides.required ?? true,
    risk: overrides.risk ?? 'medium',
    scopes: overrides.scopes,
    policyMode: overrides.policyMode ?? 'warn',
  }
}

export function defineCapability(id: Capability['id'], reason: string, required = true, degradedBehavior?: string): Capability {
  return {id, reason, required, degradedBehavior}
}

export function defineLifecycle(overrides: Partial<Lifecycle> = {}): Lifecycle {
  return {
    executionMode: overrides.executionMode ?? 'declarative',
    defaultState: overrides.defaultState ?? 'installed',
    allowedTransitions: overrides.allowedTransitions ?? DEFAULT_LIFECYCLE_TRANSITIONS,
    uninstall: overrides.uninstall ?? {dataPolicy: 'retain', requiresConfirmation: true},
  }
}

export function defineRecord(moduleId: string, name: string, schema: JsonSchema, overrides: Partial<RecordDefinitions> = {}): RecordDefinitions {
  const id = namespace(moduleId, 'record', name)
  return {
    id,
    schema,
    ownership: overrides.ownership ?? 'account',
    visibility: overrides.visibility ?? 'private',
    indexes: overrides.indexes ?? [],
    uniqueness: overrides.uniqueness ?? {keys: ['id'], scope: 'account'},
    retention: overrides.retention ?? {policy: 'retain'},
    aiPolicy: overrides.aiPolicy ?? {allowed: false, context: 'none', policyMode: 'block'},
    searchPolicy: overrides.searchPolicy ?? {searchable: false, indexedFields: [], sensitiveFields: [], visibility: overrides.visibility ?? 'private'},
    auditPolicy: overrides.auditPolicy ?? {events: [`${id}.created`, `${id}.updated`, `${id}.deleted`], includeRecordBody: false},
    exportPolicy: overrides.exportPolicy ?? {allowed: true, formats: ['json']},
  }
}

export function defineView(moduleId: string, name: string, type: ViewDefinitions['type'], overrides: Partial<ViewDefinitions> = {}): ViewDefinitions {
  return {
    id: namespace(moduleId, 'view', name),
    type,
    title: overrides.title ?? titleize(name),
    recordId: overrides.recordId,
    permissions: overrides.permissions ?? [],
    layout: overrides.layout ?? {kind: type},
    stateViews: overrides.stateViews,
  }
}

export function defineAction(moduleId: string, name: string, overrides: Partial<ActionDefinitions> = {}): ActionDefinitions {
  return {
    id: namespace(moduleId, 'action', name),
    title: overrides.title ?? titleize(name),
    description: overrides.description,
    functionId: overrides.functionId,
    permissions: overrides.permissions ?? [],
    confirmationPolicy: overrides.confirmationPolicy ?? {required: false, policyMode: 'observe'},
    sideEffects: overrides.sideEffects ?? [],
    audit: overrides.audit ?? {event: `${namespace(moduleId, 'action', name)}.requested`, includeInput: false},
  }
}

export function defineFunction(moduleId: string, name: string, inputSchema: JsonSchema, outputSchema: JsonSchema, overrides: Partial<FunctionDefinitions> = {}): FunctionDefinitions {
  return {
    id: namespace(moduleId, 'function', name),
    title: overrides.title ?? titleize(name),
    inputSchema,
    outputSchema,
    permissions: overrides.permissions ?? [],
    aiCallable: overrides.aiCallable ?? false,
    automationCallable: overrides.automationCallable ?? false,
    idempotent: overrides.idempotent ?? true,
    sideEffects: overrides.sideEffects ?? [],
    timeoutMs: overrides.timeoutMs ?? 10000,
    rateLimit: overrides.rateLimit ?? {windowSeconds: 60, maxCalls: 60},
    audit: overrides.audit ?? {event: `${namespace(moduleId, 'function', name)}.invoked`, includeInput: false, includeOutput: false},
    confirmationPolicy: overrides.confirmationPolicy ?? {required: false, risk: 'low'},
  }
}

export function defineSettings(moduleId: string, name: string, schema: JsonSchema, defaults: JsonObject, overrides: Partial<SettingsDefinitions> = {}): SettingsDefinitions {
  return {
    id: namespace(moduleId, 'settings', name),
    scope: overrides.scope ?? 'installation',
    schema,
    defaults,
  }
}

export function defineEvent(moduleId: string, name: string, direction: EventDefinitions['direction'], schema: JsonSchema, overrides: Partial<EventDefinitions> = {}): EventDefinitions {
  return {
    id: namespace(moduleId, 'event', name),
    type: overrides.type ?? namespace(moduleId, 'event-type', name),
    direction,
    schemaVersion: overrides.schemaVersion ?? '1.0.0',
    schema,
    subscriber: overrides.subscriber,
    permissions: overrides.permissions ?? [],
    replaySupport: overrides.replaySupport ?? false,
  }
}

export function defineAutomation(moduleId: string, name: string, overrides: Partial<AutomationDefinitions> = {}): AutomationDefinitions {
  return {
    id: namespace(moduleId, 'automation', name),
    title: overrides.title ?? titleize(name),
    triggers: overrides.triggers ?? [],
    conditions: overrides.conditions ?? [],
    actions: overrides.actions ?? [],
    recipes: overrides.recipes ?? [],
    executionPolicy: overrides.executionPolicy ?? {policyMode: 'require-confirmation', maxRuntimeMs: 30000},
    confirmationPolicy: overrides.confirmationPolicy ?? {required: true, reason: 'Automation execution may change module data'},
  }
}

export function defineSearch(moduleId: string, name: string, recordId: string, indexedFields: string[], overrides: Partial<SearchDefinitions> = {}): SearchDefinitions {
  return {
    id: namespace(moduleId, 'search', name),
    recordId,
    indexedFields,
    rankingHints: overrides.rankingHints ?? {},
    sensitiveFields: overrides.sensitiveFields ?? [],
    visibility: overrides.visibility ?? 'private',
    projectionHandler: overrides.projectionHandler ?? {kind: 'declarative', projection: {fields: indexedFields}},
  }
}

export function defineAIIntegration(moduleId: string, name: string, overrides: Partial<AIIntegrationDefinitions> = {}): AIIntegrationDefinitions {
  return {
    id: namespace(moduleId, 'ai', name),
    features: overrides.features ?? [],
    allowedContext: overrides.allowedContext ?? ['metadata'],
    toolDefinitions: overrides.toolDefinitions ?? [],
    structuredOutputs: overrides.structuredOutputs ?? [],
    permissions: overrides.permissions ?? [],
    policyMode: overrides.policyMode ?? 'require-confirmation',
  }
}

export function defineDiagnostics(overrides: Partial<DiagnosticsDefinitions> = {}): DiagnosticsDefinitions {
  return {
    components: overrides.components ?? ['startup', 'runtime', 'permissions', 'dependencies', 'search', 'ai', 'connector', 'health'],
    warnings: overrides.warnings ?? [],
    errors: overrides.errors ?? [],
    startup: overrides.startup ?? {},
    runtime: overrides.runtime ?? {},
    permissions: overrides.permissions ?? {},
    dependencies: overrides.dependencies ?? {},
    search: overrides.search ?? {},
    ai: overrides.ai ?? {},
    connector: overrides.connector ?? {},
    health: overrides.health ?? {},
  }
}

export function defineHealth(overrides: Partial<HealthDefinitions> = {}): HealthDefinitions {
  return {
    status: overrides.status ?? 'healthy',
    components: overrides.components ?? [{id: 'manifest', status: 'healthy'}],
    checkDefinitions: overrides.checkDefinitions ?? [{id: 'manifest-validate', component: 'startup', timeoutMs: 1000, required: true}],
  }
}

export function defineRelease(input: Omit<ReleaseMetadata, 'checksum'> & {checksum?: string}, manifestWithoutRelease?: unknown): ReleaseMetadata {
  return {
    ...input,
    checksum: input.checksum ?? manifestChecksum(manifestWithoutRelease ?? input),
  }
}

export function defineTrust(publisher: Publisher, overrides: Partial<TrustMetadata> = {}): TrustMetadata {
  return {
    publisher,
    level: overrides.level ?? 'untrusted',
    provenance: overrides.provenance ?? {sourceVerified: false, checksumVerified: false, signatureVerified: false},
    review: overrides.review ?? {status: 'unreviewed', evidence: []},
    security: overrides.security ?? {advisories: []},
  }
}

export function namespace(moduleId: string, group: string, name: string): string {
  return `${moduleId}.${group}.${name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '')}`
}

function titleize(value: string): string {
  return value
    .split(/[-_.\s]+/)
    .filter(Boolean)
    .map(part => `${part.slice(0, 1).toUpperCase()}${part.slice(1)}`)
    .join(' ')
}
