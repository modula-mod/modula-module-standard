import {
  DEFAULT_LIFECYCLE_TRANSITIONS,
  MODULA_DATA_SCHEMA_VERSION,
  MODULA_MANIFEST_SCHEMA_VERSION,
  MODULA_MODULE_STANDARD_2_VERSION,
  MODULA_MODULE_STANDARD_VERSION,
  createDefaultModuleSectionVersions,
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
  type ModuleBackendActionDefinition,
  type ModuleBackendClientAccessDefinition,
  type ModuleBackendDataDefinition,
  type ModuleBackendDefinition,
  type ModuleBackendDeploymentDefinition,
  type ModuleBackendEndpointDefinition,
  type ModuleBackendTrustDefinition,
  type ModulaModuleManifest,
  type Permission,
  type Publisher,
  type RecordDefinitions,
  type ReleaseMetadata,
  type SearchDefinitions,
  type SettingsDefinitions,
  type TrustMetadata,
  type ViewDefinitions,
  type ModuleStandard20ApiOperation,
  type ModuleStandard20Automation,
  type ModuleStandard20CapabilityDiscovery,
  type ModuleStandard20CompatibilityMatrix,
  type ModuleStandard20DependencyGraph,
  type ModuleStandard20EngineReadiness,
  type ModuleStandard20Hook,
  type ModuleStandard20Job,
  type ModuleStandard20ManifestExtensions,
  type ModuleStandard20MarketplaceDeclaration,
  type ModuleStandard20NavigationContribution,
  type ModuleStandard20OfflineDeclaration,
  type ModuleStandard20PermissionModel,
  type ModuleStandard20RealtimeDeclaration,
  type ModuleStandard20Service,
  type ModuleStandard20StorageDeclaration,
  type ModuleStandard20UiContribution,
  type ModuleStandard20VersionedSection,
  type ModuleStandard20VersioningDeclaration,
  type ModuleStandard20Widget,
  manifestChecksum,
} from '@modula/module-standard'
import {validateModulaModuleManifest} from '@modula/module-validator'

export * from '@modula/module-standard'
export * from '@modula/module-validator'

export type DefineModuleInput = Omit<
  ModulaModuleManifest,
  'schemaVersion' | 'standardVersion' | 'manifestSchemaVersion' | 'dataSchemaVersion'
> & Partial<ModuleStandard20ManifestExtensions> & {
  standardVersion?: string
  manifestSchemaVersion?: string
  dataSchemaVersion?: string
}

export function defineModule(input: DefineModuleInput): ModulaModuleManifest {
  const standardVersion = input.standardVersion ?? MODULA_MODULE_STANDARD_VERSION
  const manifestSchemaVersion = input.manifestSchemaVersion ?? (standardVersion === MODULA_MODULE_STANDARD_2_VERSION ? MODULA_MANIFEST_SCHEMA_VERSION : standardVersion)
  const manifest: ModulaModuleManifest = {
    schemaVersion: manifestSchemaVersion,
    standardVersion,
    manifestSchemaVersion,
    dataSchemaVersion: input.dataSchemaVersion ?? MODULA_DATA_SCHEMA_VERSION,
    ...input,
  } as ModulaModuleManifest
  if (standardVersion === MODULA_MODULE_STANDARD_2_VERSION && (manifest as Record<string, unknown>).sectionVersions === undefined) {
    ;(manifest as Record<string, unknown>).sectionVersions = createDefaultModuleSectionVersions()
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

export function defineDependencyGraph(overrides: Partial<ModuleStandard20DependencyGraph> = {}): ModuleStandard20DependencyGraph {
  return {
    version: overrides.version ?? MODULA_MODULE_STANDARD_2_VERSION,
    requires: overrides.requires ?? [],
    optional: overrides.optional ?? [],
    recommended: overrides.recommended ?? [],
    conflicts: overrides.conflicts ?? [],
    replaces: overrides.replaces ?? [],
    provides: overrides.provides ?? [],
  }
}

export function defineService(moduleId: string, name: string, overrides: Partial<ModuleStandard20Service> = {}): ModuleStandard20Service {
  return {
    id: overrides.id ?? namespace(moduleId, 'service', name),
    title: overrides.title ?? titleize(name),
    version: overrides.version ?? '1.0.0',
    kind: overrides.kind ?? 'custom',
    contract: overrides.contract ?? namespace(moduleId, 'service-contract', name),
    permissions: overrides.permissions ?? [],
    capabilities: overrides.capabilities ?? [],
  }
}

export function defineApiOperation(moduleId: string, name: string, overrides: Partial<ModuleStandard20ApiOperation> = {}): ModuleStandard20ApiOperation {
  return {
    id: overrides.id ?? namespace(moduleId, 'api', name),
    title: overrides.title ?? titleize(name),
    version: overrides.version ?? '1.0.0',
    method: overrides.method ?? 'POST',
    path: overrides.path ?? `/api/modula/${moduleId}/${name.toLowerCase().replace(/[^a-z0-9]+/g, '-')}`,
    inputSchema: overrides.inputSchema,
    outputSchema: overrides.outputSchema,
    permissions: overrides.permissions ?? [],
    sideEffects: overrides.sideEffects ?? 'write',
    idempotent: overrides.idempotent ?? true,
  }
}

export function defineHook(moduleId: string, hook: string, overrides: Partial<ModuleStandard20Hook> = {}): ModuleStandard20Hook {
  const suffix = hook.toLowerCase().replace(/[^a-z0-9]+/g, '-')
  return {
    id: overrides.id ?? namespace(moduleId, 'hook', suffix),
    hook,
    phase: overrides.phase ?? (hook.toLowerCase().startsWith('after') ? 'after' : 'before'),
    target: overrides.target ?? moduleId,
    functionId: overrides.functionId,
    policyMode: overrides.policyMode ?? 'observe',
  }
}

export function defineCapabilityDiscovery(overrides: Partial<ModuleStandard20CapabilityDiscovery> = {}): ModuleStandard20CapabilityDiscovery {
  return {
    version: overrides.version ?? MODULA_MODULE_STANDARD_2_VERSION,
    supportsSearch: overrides.supportsSearch ?? false,
    supportsExport: overrides.supportsExport ?? false,
    supportsAI: overrides.supportsAI ?? false,
    supportsOffline: overrides.supportsOffline ?? false,
    supportsRealtime: overrides.supportsRealtime ?? false,
    supportsNotifications: overrides.supportsNotifications ?? false,
    supportsWidgets: overrides.supportsWidgets ?? false,
    supportsAutomation: overrides.supportsAutomation ?? false,
    supportsSync: overrides.supportsSync ?? false,
    supportsHistory: overrides.supportsHistory ?? false,
    supportsSharing: overrides.supportsSharing ?? false,
    supportsEncryption: overrides.supportsEncryption ?? false,
    supportsMedia: overrides.supportsMedia ?? false,
    supportsComments: overrides.supportsComments ?? false,
    supportsPresence: overrides.supportsPresence ?? false,
    supportsVoice: overrides.supportsVoice ?? false,
    supportsVideo: overrides.supportsVideo ?? false,
    supportsBackend: overrides.supportsBackend ?? false,
    supportsCustomBackend: overrides.supportsCustomBackend ?? false,
    supportsSelfHosted: overrides.supportsSelfHosted ?? false,
  }
}

export function definePermissionModel(categories: ModuleStandard20PermissionModel['categories'], version = MODULA_MODULE_STANDARD_2_VERSION): ModuleStandard20PermissionModel {
  return {version, categories}
}

export function defineJob(moduleId: string, name: string, overrides: Partial<ModuleStandard20Job> = {}): ModuleStandard20Job {
  return {
    id: overrides.id ?? namespace(moduleId, 'job', name),
    title: overrides.title ?? titleize(name),
    kind: overrides.kind ?? 'queue',
    schedule: overrides.schedule,
    queue: overrides.queue,
    functionId: overrides.functionId,
    permissions: overrides.permissions ?? [],
    retryPolicy: overrides.retryPolicy,
  }
}

export function defineStorage(moduleId: string, name: string, overrides: Partial<ModuleStandard20StorageDeclaration> = {}): ModuleStandard20StorageDeclaration {
  return {
    id: overrides.id ?? namespace(moduleId, 'storage', name),
    kind: overrides.kind ?? 'structured-records',
    version: overrides.version ?? '1.0.0',
    encrypted: overrides.encrypted ?? false,
    retention: overrides.retention,
    quota: overrides.quota,
  }
}

export function defineWidget(moduleId: string, name: string, overrides: Partial<ModuleStandard20Widget> = {}): ModuleStandard20Widget {
  return {
    id: overrides.id ?? namespace(moduleId, 'widget', name),
    title: overrides.title ?? titleize(name),
    surface: overrides.surface ?? 'board',
    viewId: overrides.viewId,
    permissions: overrides.permissions ?? [],
  }
}

export function defineNavigationContribution(moduleId: string, name: string, overrides: Partial<ModuleStandard20NavigationContribution> = {}): ModuleStandard20NavigationContribution {
  return {
    id: overrides.id ?? namespace(moduleId, 'navigation', name),
    title: overrides.title ?? titleize(name),
    kind: overrides.kind ?? 'route',
    target: overrides.target ?? `/module/${moduleId}`,
    surface: overrides.surface,
    permissions: overrides.permissions ?? [],
  }
}

export function defineUiContribution(moduleId: string, name: string, overrides: Partial<ModuleStandard20UiContribution> = {}): ModuleStandard20UiContribution {
  return {
    id: overrides.id ?? namespace(moduleId, 'ui', name),
    title: overrides.title ?? titleize(name),
    kind: overrides.kind ?? 'board-card',
    target: overrides.target ?? moduleId,
    contract: overrides.contract ?? namespace(moduleId, 'ui-contract', name),
  }
}

export function defineAutomationContract(moduleId: string, name: string, overrides: Partial<ModuleStandard20Automation> = {}): ModuleStandard20Automation {
  return {
    id: overrides.id ?? namespace(moduleId, 'automation-contract', name),
    title: overrides.title ?? titleize(name),
    triggers: overrides.triggers ?? [],
    actions: overrides.actions ?? [],
    conditions: overrides.conditions ?? [],
    variables: overrides.variables,
    outputs: overrides.outputs,
  }
}

export function defineVersionedSection<T extends Record<string, unknown>>(items: T[], version = MODULA_MODULE_STANDARD_2_VERSION): ModuleStandard20VersionedSection<T> {
  return {version, items}
}

export function defineOffline(overrides: Partial<ModuleStandard20OfflineDeclaration> = {}): ModuleStandard20OfflineDeclaration {
  return {
    version: overrides.version ?? MODULA_MODULE_STANDARD_2_VERSION,
    capable: overrides.capable ?? false,
    syncStrategy: overrides.syncStrategy ?? 'none',
    conflictStrategy: overrides.conflictStrategy,
    cache: overrides.cache,
    mergePolicy: overrides.mergePolicy,
    compression: overrides.compression,
    encryption: overrides.encryption,
  }
}

export function defineRealtime(overrides: Partial<ModuleStandard20RealtimeDeclaration> = {}): ModuleStandard20RealtimeDeclaration {
  return {
    version: overrides.version ?? MODULA_MODULE_STANDARD_2_VERSION,
    events: overrides.events ?? [],
    presence: overrides.presence ?? false,
    typing: overrides.typing ?? false,
    watchers: overrides.watchers ?? false,
    subscriptions: overrides.subscriptions ?? [],
    channels: overrides.channels ?? [],
    reconnect: overrides.reconnect,
    buffering: overrides.buffering,
  }
}

export function defineVersioning(overrides: Partial<ModuleStandard20VersioningDeclaration> = {}): ModuleStandard20VersioningDeclaration {
  return {
    version: overrides.version ?? MODULA_MODULE_STANDARD_2_VERSION,
    moduleVersion: overrides.moduleVersion ?? '1.0.0',
    standardVersion: overrides.standardVersion ?? MODULA_MODULE_STANDARD_VERSION,
    publisherVersion: overrides.publisherVersion,
    protocolVersion: overrides.protocolVersion,
    backendVersion: overrides.backendVersion,
    schemaVersion: overrides.schemaVersion,
    manifestVersion: overrides.manifestVersion,
    aiVersion: overrides.aiVersion,
    migrationVersion: overrides.migrationVersion,
    searchVersion: overrides.searchVersion,
    runtimeVersion: overrides.runtimeVersion,
  }
}

export function defineCompatibilityMatrix(overrides: Partial<ModuleStandard20CompatibilityMatrix> = {}): ModuleStandard20CompatibilityMatrix {
  return {
    version: overrides.version ?? MODULA_MODULE_STANDARD_2_VERSION,
    modulaVersion: overrides.modulaVersion ?? '^1.0.0',
    greenfieldVersion: overrides.greenfieldVersion ?? '^1.0.0',
    moduleStandardVersion: overrides.moduleStandardVersion ?? '^2.1.0',
    runtimeVersion: overrides.runtimeVersion,
    backendRuntime: overrides.backendRuntime,
    connectorRuntime: overrides.connectorRuntime,
    aiRuntime: overrides.aiRuntime,
    engineRuntime: overrides.engineRuntime,
    platforms: overrides.platforms ?? ['web'],
  }
}

export function defineMarketplace(overrides: Partial<ModuleStandard20MarketplaceDeclaration> = {}): ModuleStandard20MarketplaceDeclaration {
  return {
    version: overrides.version ?? MODULA_MODULE_STANDARD_2_VERSION,
    publisherVerification: overrides.publisherVerification,
    publisherProfile: overrides.publisherProfile,
    verifiedBadge: overrides.verifiedBadge ?? false,
    license: overrides.license,
    source: overrides.source,
    repository: overrides.repository,
    ciStatus: overrides.ciStatus,
    securityScore: overrides.securityScore,
    downloads: overrides.downloads,
    ratings: overrides.ratings,
    reviews: overrides.reviews,
    changelog: overrides.changelog,
    roadmap: overrides.roadmap,
    support: overrides.support,
    documentation: overrides.documentation,
    issueTracker: overrides.issueTracker,
    pricing: overrides.pricing,
    requiredRuntimes: overrides.requiredRuntimes ?? [],
    aiSupport: overrides.aiSupport ?? false,
    backendMode: overrides.backendMode,
  }
}

export function defineEngineReadiness(overrides: Partial<ModuleStandard20EngineReadiness> = {}): ModuleStandard20EngineReadiness {
  return {
    version: overrides.version ?? MODULA_MODULE_STANDARD_2_VERSION,
    engines: overrides.engines ?? ['declarative-ui', 'records', 'actions', 'functions'],
  }
}

export function defineModuleBackend(mode: ModuleBackendDefinition['mode'], overrides: Partial<ModuleBackendDefinition> = {}): ModuleBackendDefinition {
  return {
    mode,
    protocolVersion: overrides.protocolVersion ?? (mode === 'module-managed' || mode === 'hybrid' ? '1.0.0' : undefined),
    endpoints: overrides.endpoints,
    authentication: overrides.authentication,
    health: overrides.health,
    events: overrides.events,
    webhooks: overrides.webhooks,
    data: overrides.data,
    deployment: overrides.deployment,
    trust: overrides.trust,
    network: overrides.network,
    lifecycle: overrides.lifecycle,
    actions: overrides.actions,
    clientAccess: overrides.clientAccess,
  }
}

export function defineModuleBackendEndpoints(overrides: Partial<ModuleBackendEndpointDefinition> = {}): ModuleBackendEndpointDefinition {
  return {
    baseUrlStrategy: overrides.baseUrlStrategy ?? 'registry',
    apiVersion: overrides.apiVersion ?? '1.0.0',
    discoveryPath: overrides.discoveryPath ?? '/.well-known/modula-module',
    healthPath: overrides.healthPath ?? '/v1/health',
    capabilitiesPath: overrides.capabilitiesPath ?? '/v1/capabilities',
    actionsPath: overrides.actionsPath ?? '/v1/actions',
    eventsPath: overrides.eventsPath ?? '/v1/events',
    webhooksPath: overrides.webhooksPath ?? '/v1/webhooks/modula',
    allowedHosts: overrides.allowedHosts,
  }
}

export function defineModuleBackendData(overrides: Partial<ModuleBackendDataDefinition> = {}): ModuleBackendDataDefinition {
  return {
    primaryStore: overrides.primaryStore ?? 'module-backend',
    categories: overrides.categories ?? [],
    exportSupported: overrides.exportSupported ?? false,
    deletionSupported: overrides.deletionSupported ?? false,
    retentionPolicy: overrides.retentionPolicy,
    backupResponsibility: overrides.backupResponsibility ?? 'publisher',
    residency: overrides.residency,
  }
}

export function defineModuleBackendDeployment(overrides: Partial<ModuleBackendDeploymentDefinition> = {}): ModuleBackendDeploymentDefinition {
  return {
    ownership: overrides.ownership ?? 'publisher-hosted',
    multiTenant: overrides.multiTenant ?? true,
    regions: overrides.regions,
    dataResidency: overrides.dataResidency,
    selfHostingSupported: overrides.selfHostingSupported ?? false,
  }
}

export function defineModuleBackendTrust(publisherId: string, allowedOrigins: string[], overrides: Partial<ModuleBackendTrustDefinition> = {}): ModuleBackendTrustDefinition {
  return {
    publisherId,
    allowedOrigins,
    deploymentIdentity: overrides.deploymentIdentity,
    certificatePins: overrides.certificatePins,
    signingKeys: overrides.signingKeys,
    attestation: overrides.attestation,
    releaseChecksum: overrides.releaseChecksum,
    backendBuildChecksum: overrides.backendBuildChecksum,
  }
}

export function defineModuleBackendAction(actionId: string, path: string, overrides: Partial<ModuleBackendActionDefinition> = {}): ModuleBackendActionDefinition {
  return {
    actionId,
    method: 'POST',
    path,
    inputSchema: overrides.inputSchema ?? `${actionId}.input`,
    outputSchema: overrides.outputSchema ?? `${actionId}.output`,
    permissions: overrides.permissions ?? [],
    idempotent: overrides.idempotent ?? true,
    sideEffects: overrides.sideEffects ?? 'internal-write',
    confirmation: overrides.confirmation ?? 'user',
    timeoutMs: overrides.timeoutMs ?? 10000,
  }
}

export function defineModuleBackendClientAccess(overrides: Partial<ModuleBackendClientAccessDefinition> = {}): ModuleBackendClientAccessDefinition {
  return {
    allowed: overrides.allowed ?? false,
    protocols: overrides.protocols ?? ['https'],
    tokenExchangeRequired: overrides.tokenExchangeRequired ?? true,
    allowedOrigins: overrides.allowedOrigins ?? [],
    maxSessionSeconds: overrides.maxSessionSeconds ?? 900,
  }
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
    productActions: overrides.productActions ?? [],
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
