export const MODULA_MODULE_STANDARD_2_VERSION = '2.0.0' as const
export const MODULA_MANIFEST_SCHEMA_2_VERSION = '2.0.0' as const
export const MODULA_MODULE_STANDARD_2_SCHEMA_URI = 'https://modula.digital/schemas/module-standard/2.0.0/manifest.schema.json' as const

export const MODULE_STANDARD_20_SECTION_NAMES = [
  'identity',
  'lifecycle',
  'backend',
  'engines',
  'ai',
  'permissions',
  'settings',
  'routes',
  'views',
  'records',
  'actions',
  'functions',
  'jobs',
  'events',
  'notifications',
  'search',
  'exports',
  'imports',
  'synchronization',
  'dependencies',
  'optionalDependencies',
  'integrations',
  'billing',
  'telemetry',
  'diagnostics',
  'accessibility',
  'localization',
  'appearance',
  'onboarding',
  'migrations',
  'capabilities',
  'services',
  'apis',
  'hooks',
  'metrics',
  'storage',
  'widgets',
  'navigation',
  'ui',
  'automation',
  'offline',
  'realtime',
  'versioning',
  'compatibilityMatrix',
  'marketplace',
] as const

export type ModuleStandard20SectionName = (typeof MODULE_STANDARD_20_SECTION_NAMES)[number]
export type ModuleStandard20SectionVersions = Partial<Record<ModuleStandard20SectionName, string>>

export const MODULE_STANDARD_20_HEALTH_STATES = [
  'healthy',
  'warning',
  'error',
  'maintenance',
  'updating',
  'migration',
  'disabled',
  'quarantined',
  'broken',
  'version-mismatch',
  'host-incompatible',
  'backend-unavailable',
  'provider-unavailable',
  'ai-unavailable',
  'storage-full',
  'search-rebuilding',
] as const

export type ModuleStandard20HealthState = (typeof MODULE_STANDARD_20_HEALTH_STATES)[number]

export const MODULE_STANDARD_20_PERMISSION_CATEGORIES = [
  'data',
  'filesystem',
  'media',
  'ai',
  'automation',
  'dimon',
  'connectors',
  'notifications',
  'search',
  'background',
  'realtime',
  'widgets',
  'presence',
  'voice',
  'camera',
  'location',
  'bluetooth',
  'nfc',
  'clipboard',
  'health',
  'calendar',
  'contacts',
  'mail',
  'storage',
  'backend',
  'admin',
  'developer',
] as const

export type ModuleStandard20PermissionCategory = (typeof MODULE_STANDARD_20_PERMISSION_CATEGORIES)[number]

export type ModuleStandard20JsonObject = {[key: string]: unknown}

export type ModuleStandard20VersionedSection<T extends ModuleStandard20JsonObject = ModuleStandard20JsonObject> = {
  version: string
  items?: T[]
  metadata?: ModuleStandard20JsonObject
}

export type ModuleStandard20DependencyRef = {
  moduleId?: string
  provides?: string
  versionRange: string
  reason?: string
  capabilityIds?: string[]
}

export type ModuleStandard20ConflictRef = {
  moduleId: string
  versionRange?: string
  reason: string
}

export type ModuleStandard20ProvideRef = {
  id: string
  title: string
  version: string
  kind: 'service' | 'api' | 'record' | 'capability' | 'engine' | 'integration' | 'ui'
}

export type ModuleStandard20DependencyGraph = {
  version: string
  requires: ModuleStandard20DependencyRef[]
  optional: ModuleStandard20DependencyRef[]
  recommended: ModuleStandard20DependencyRef[]
  conflicts: ModuleStandard20ConflictRef[]
  replaces: ModuleStandard20ConflictRef[]
  provides: ModuleStandard20ProvideRef[]
}

export type ModuleStandard20Service = {
  id: string
  title: string
  version: string
  kind: 'search' | 'export' | 'autosave' | 'revision' | 'history' | 'markdown' | 'storage' | 'ai' | 'automation' | 'custom'
  contract: string
  permissions?: string[]
  capabilities?: string[]
}

export type ModuleStandard20ApiOperation = {
  id: string
  title: string
  version: string
  method: 'GET' | 'POST' | 'PATCH' | 'PUT' | 'DELETE'
  path: string
  inputSchema?: string
  outputSchema?: string
  permissions: string[]
  sideEffects: 'none' | 'read' | 'write' | 'destructive' | 'external' | 'financial'
  idempotent: boolean
}

export type ModuleStandard20Hook = {
  id: string
  hook: string
  phase: 'before' | 'after'
  target: string
  functionId?: string
  policyMode: 'observe' | 'warn' | 'require-confirmation' | 'block'
}

export type ModuleStandard20CapabilityDiscovery = {
  version: string
  supportsSearch?: boolean
  supportsExport?: boolean
  supportsAI?: boolean
  supportsOffline?: boolean
  supportsRealtime?: boolean
  supportsNotifications?: boolean
  supportsWidgets?: boolean
  supportsAutomation?: boolean
  supportsSync?: boolean
  supportsHistory?: boolean
  supportsSharing?: boolean
  supportsEncryption?: boolean
  supportsMedia?: boolean
  supportsComments?: boolean
  supportsPresence?: boolean
  supportsVoice?: boolean
  supportsVideo?: boolean
  supportsBackend?: boolean
  supportsCustomBackend?: boolean
  supportsSelfHosted?: boolean
  [key: string]: unknown
}

export type ModuleStandard20PermissionGrant = {
  id: string
  reason: string
  required: boolean
  risk: 'low' | 'medium' | 'high' | 'critical' | 'restricted'
  policyMode: 'observe' | 'warn' | 'require-confirmation' | 'block'
}

export type ModuleStandard20PermissionModel = {
  version: string
  categories: Partial<Record<ModuleStandard20PermissionCategory, ModuleStandard20PermissionGrant[]>>
}

export type ModuleStandard20Job = {
  id: string
  title: string
  kind: 'cron' | 'queue' | 'delayed' | 'recurring' | 'realtime' | 'repair' | 'migration' | 'cleanup' | 'reindex' | 'sync' | 'health'
  schedule?: string
  queue?: string
  functionId?: string
  permissions?: string[]
  retryPolicy?: ModuleStandard20JsonObject
}

export type ModuleStandard20StorageDeclaration = {
  id: string
  kind:
    | 'structured-records'
    | 'blob-storage'
    | 'attachments'
    | 'object-storage'
    | 'cache'
    | 'temporary-storage'
    | 'encrypted-storage'
    | 'secrets'
    | 'settings'
    | 'history'
    | 'search-index'
    | 'ai-memory'
  version: string
  encrypted?: boolean
  retention?: string
  quota?: ModuleStandard20JsonObject
}

export type ModuleStandard20Widget = {
  id: string
  title: string
  surface: 'board' | 'profile' | 'dashboard' | 'home' | 'settings' | 'search' | 'sidebar' | 'floating' | 'lock-screen'
  viewId?: string
  permissions?: string[]
}

export type ModuleStandard20NavigationContribution = {
  id: string
  title: string
  kind: 'route' | 'tab' | 'sheet' | 'dialog' | 'drawer' | 'menu-item' | 'composer-tool' | 'context-menu' | 'quick-action' | 'search-provider'
  target: string
  surface?: string
  permissions?: string[]
}

export type ModuleStandard20UiContribution = {
  id: string
  title: string
  kind:
    | 'board-card'
    | 'profile-tab'
    | 'settings-section'
    | 'composer-action'
    | 'feed-card'
    | 'notification-card'
    | 'context-menu'
    | 'toolbar-button'
    | 'overflow-menu'
    | 'action-sheet'
    | 'search-provider'
  target: string
  contract: string
}

export type ModuleStandard20Automation = {
  id: string
  title: string
  triggers: string[]
  actions: string[]
  conditions: string[]
  variables?: ModuleStandard20JsonObject
  outputs?: ModuleStandard20JsonObject
}

export type ModuleStandard20OfflineDeclaration = {
  version: string
  capable: boolean
  syncStrategy?: 'none' | 'manual' | 'background' | 'realtime'
  conflictStrategy?: 'client-wins' | 'server-wins' | 'merge' | 'manual-review'
  cache?: ModuleStandard20JsonObject
  mergePolicy?: string
  compression?: boolean
  encryption?: boolean
}

export type ModuleStandard20RealtimeDeclaration = {
  version: string
  events: string[]
  presence?: boolean
  typing?: boolean
  watchers?: boolean
  subscriptions?: string[]
  channels?: string[]
  reconnect?: ModuleStandard20JsonObject
  buffering?: ModuleStandard20JsonObject
}

export type ModuleStandard20VersioningDeclaration = {
  version: string
  moduleVersion: string
  standardVersion: string
  publisherVersion?: string
  protocolVersion?: string
  backendVersion?: string
  schemaVersion?: string
  manifestVersion?: string
  aiVersion?: string
  migrationVersion?: string
  searchVersion?: string
  runtimeVersion?: string
}

export type ModuleStandard20CompatibilityMatrix = {
  version: string
  modulaVersion?: string
  greenfieldVersion?: string
  moduleStandardVersion?: string
  runtimeVersion?: string
  backendRuntime?: string
  connectorRuntime?: string
  aiRuntime?: string
  engineRuntime?: string
  platforms: Array<'ios' | 'android' | 'web' | 'desktop' | 'server'>
}

export type ModuleStandard20MarketplaceDeclaration = {
  version: string
  publisherVerification?: string
  publisherProfile?: string
  verifiedBadge?: boolean
  license?: string
  source?: string
  repository?: string
  ciStatus?: string
  securityScore?: number
  downloads?: number
  ratings?: ModuleStandard20JsonObject
  reviews?: ModuleStandard20JsonObject
  changelog?: string
  roadmap?: string
  support?: string
  documentation?: string
  issueTracker?: string
  pricing?: string
  requiredRuntimes?: string[]
  aiSupport?: boolean
  backendMode?: string
}

export type ModuleStandard20EngineReadiness = {
  version: string
  engines: Array<
    | 'declarative-ui'
    | 'records'
    | 'actions'
    | 'functions'
    | 'ai'
    | 'automation'
    | 'media'
    | 'documents'
    | 'game'
    | 'webgpu'
    | 'spatial'
    | 'unity'
    | 'godot'
    | 'custom-native'
  >
}

export type ModuleStandard20ManifestExtensions = {
  sectionVersions?: ModuleStandard20SectionVersions
  identity?: ModuleStandard20VersionedSection
  dependencyGraph?: ModuleStandard20DependencyGraph
  serviceRegistry?: ModuleStandard20VersionedSection<ModuleStandard20Service>
  apiRegistry?: ModuleStandard20VersionedSection<ModuleStandard20ApiOperation>
  eventBus?: ModuleStandard20VersionedSection
  hookRegistry?: ModuleStandard20VersionedSection<ModuleStandard20Hook>
  capabilityDiscovery?: ModuleStandard20CapabilityDiscovery
  healthModel?: ModuleStandard20VersionedSection
  diagnosticsModel?: ModuleStandard20VersionedSection
  metrics?: ModuleStandard20VersionedSection
  permissionModel?: ModuleStandard20PermissionModel
  jobRegistry?: ModuleStandard20VersionedSection<ModuleStandard20Job>
  storageModel?: ModuleStandard20VersionedSection<ModuleStandard20StorageDeclaration>
  widgetRegistry?: ModuleStandard20VersionedSection<ModuleStandard20Widget>
  navigationRegistry?: ModuleStandard20VersionedSection<ModuleStandard20NavigationContribution>
  uiContributions?: ModuleStandard20VersionedSection<ModuleStandard20UiContribution>
  automationRegistry?: ModuleStandard20VersionedSection<ModuleStandard20Automation>
  offline?: ModuleStandard20OfflineDeclaration
  realtime?: ModuleStandard20RealtimeDeclaration
  versioning?: ModuleStandard20VersioningDeclaration
  compatibilityMatrix?: ModuleStandard20CompatibilityMatrix
  marketplace?: ModuleStandard20MarketplaceDeclaration
  engineReadiness?: ModuleStandard20EngineReadiness
  exports?: ModuleStandard20VersionedSection
  imports?: ModuleStandard20VersionedSection
  synchronization?: ModuleStandard20VersionedSection
  integrations?: ModuleStandard20VersionedSection
  billing?: ModuleStandard20VersionedSection
  telemetry?: ModuleStandard20VersionedSection
  accessibility?: ModuleStandard20VersionedSection
  localization?: ModuleStandard20VersionedSection
  appearance?: ModuleStandard20VersionedSection
  onboarding?: ModuleStandard20VersionedSection
}

export type ModuleStandard20Summary = {
  standardVersion: string
  sectionVersions: ModuleStandard20SectionVersions
  dependencies: Record<'requires' | 'optional' | 'recommended' | 'conflicts' | 'replaces' | 'provides', number>
  services: number
  apis: number
  hooks: number
  jobs: number
  storage: number
  widgets: number
  navigation: number
  ui: number
  automation: number
  metrics: number
  engines: string[]
  capabilityFlags: Record<string, boolean>
}

export type ModuleStandard20DependencyCandidate = {
  moduleId: string
  version: string
  installed?: boolean
  provides?: string[]
}

export type ModuleStandard20ResolvedDependency = {
  relation: 'requires' | 'optional' | 'recommended' | 'conflicts' | 'replaces'
  requested: ModuleStandard20DependencyRef | ModuleStandard20ConflictRef
  resolvedModuleId: string | null
  resolvedVersion: string | null
  installed: boolean
  satisfied: boolean
  blocking: boolean
  reason?: string
}

export type ModuleStandard20DependencyResolution = {
  installable: boolean
  provides: ModuleStandard20ProvideRef[]
  resolutions: ModuleStandard20ResolvedDependency[]
  errors: string[]
  warnings: string[]
}

const SEMVER_PATTERN = /^(0|[1-9]\d*)\.(0|[1-9]\d*)\.(0|[1-9]\d*)(?:-[0-9A-Za-z.-]+)?(?:\+[0-9A-Za-z.-]+)?$/
const SEMVER_RANGE_PATTERN =
  /^(\*|latest|(?:[\^~])?(?:0|[1-9]\d*)\.(?:0|[1-9]\d*)\.(?:0|[1-9]\d*)(?:-[0-9A-Za-z.-]+)?(?:\s+(?:>=|<=|>|<|=)?(?:0|[1-9]\d*)\.(?:0|[1-9]\d*)\.(?:0|[1-9]\d*)(?:-[0-9A-Za-z.-]+)?)*|(?:>=|<=|>|<|=)(?:0|[1-9]\d*)\.(?:0|[1-9]\d*)\.(?:0|[1-9]\d*)(?:-[0-9A-Za-z.-]+)?)$/

export function createDefaultModuleSectionVersions(version = MODULA_MODULE_STANDARD_2_VERSION): ModuleStandard20SectionVersions {
  return Object.fromEntries(MODULE_STANDARD_20_SECTION_NAMES.map(section => [section, version])) as ModuleStandard20SectionVersions
}

export function extractModuleStandard20Summary(manifest: Record<string, unknown>): ModuleStandard20Summary {
  const graph = asRecord(manifest.dependencyGraph)
  const capabilityDiscovery = asRecord(manifest.capabilityDiscovery)
  const engines = asRecord(manifest.engineReadiness)
  return {
    standardVersion: stringValue(manifest.standardVersion) ?? stringValue(manifest.versioning && asRecord(manifest.versioning).standardVersion) ?? 'unknown',
    sectionVersions: sectionVersionsForManifest(manifest),
    dependencies: {
      requires: arrayCount(graph.requires),
      optional: arrayCount(graph.optional),
      recommended: arrayCount(graph.recommended),
      conflicts: arrayCount(graph.conflicts),
      replaces: arrayCount(graph.replaces),
      provides: arrayCount(graph.provides),
    },
    services: versionedCount(manifest.serviceRegistry),
    apis: versionedCount(manifest.apiRegistry),
    hooks: versionedCount(manifest.hookRegistry),
    jobs: versionedCount(manifest.jobRegistry),
    storage: versionedCount(manifest.storageModel),
    widgets: versionedCount(manifest.widgetRegistry),
    navigation: versionedCount(manifest.navigationRegistry),
    ui: versionedCount(manifest.uiContributions),
    automation: versionedCount(manifest.automationRegistry),
    metrics: versionedCount(manifest.metrics),
    engines: Array.isArray(engines.engines) ? engines.engines.filter((item): item is string => typeof item === 'string') : [],
    capabilityFlags: Object.fromEntries(
      Object.entries(capabilityDiscovery)
        .filter(([key, value]) => key.startsWith('supports') && typeof value === 'boolean')
        .map(([key, value]) => [key, value]),
    ) as Record<string, boolean>,
  }
}

export function sectionVersionsForManifest(manifest: Record<string, unknown>): ModuleStandard20SectionVersions {
  const explicit = asRecord(manifest.sectionVersions)
  if (Object.keys(explicit).length > 0) {
    return Object.fromEntries(
      Object.entries(explicit).filter((entry): entry is [ModuleStandard20SectionName, string] =>
        MODULE_STANDARD_20_SECTION_NAMES.includes(entry[0] as ModuleStandard20SectionName) && typeof entry[1] === 'string',
      ),
    ) as ModuleStandard20SectionVersions
  }
  return {}
}

export function resolveModuleDependencyGraph(
  graph: ModuleStandard20DependencyGraph | undefined,
  availableModules: ModuleStandard20DependencyCandidate[],
): ModuleStandard20DependencyResolution {
  const empty: ModuleStandard20DependencyResolution = {
    installable: true,
    provides: graph?.provides ?? [],
    resolutions: [],
    errors: [],
    warnings: [],
  }
  if (!graph) return empty

  const candidates = availableModules.map(candidate => ({
    ...candidate,
    provides: candidate.provides ?? [],
  }))
  const resolutions: ModuleStandard20ResolvedDependency[] = []
  const errors: string[] = []
  const warnings: string[] = []

  for (const relation of ['requires', 'optional', 'recommended'] as const) {
    for (const dependency of graph[relation]) {
      const resolved = resolveDependencyRef(dependency, candidates)
      const blocking = relation === 'requires' && !resolved.satisfied
      if (blocking) errors.push(`Required dependency ${dependency.moduleId ?? dependency.provides ?? 'unknown'}@${dependency.versionRange} is unavailable`)
      if (relation === 'recommended' && !resolved.satisfied) warnings.push(`Recommended dependency ${dependency.moduleId ?? dependency.provides ?? 'unknown'} is unavailable`)
      resolutions.push({relation, requested: dependency, blocking, ...resolved})
    }
  }

  for (const relation of ['conflicts', 'replaces'] as const) {
    for (const dependency of graph[relation]) {
      const candidate = candidates.find(item => item.moduleId === dependency.moduleId)
      const satisfied = Boolean(candidate && candidate.installed && (!dependency.versionRange || satisfiesRange(candidate.version, dependency.versionRange)))
      if (relation === 'conflicts' && satisfied) errors.push(`Conflicting module ${dependency.moduleId}${dependency.versionRange ? `@${dependency.versionRange}` : ''} is installed`)
      resolutions.push({
        relation,
        requested: dependency,
        resolvedModuleId: candidate?.moduleId ?? null,
        resolvedVersion: candidate?.version ?? null,
        installed: Boolean(candidate?.installed),
        satisfied,
        blocking: relation === 'conflicts' && satisfied,
        reason: dependency.reason,
      })
    }
  }

  return {
    installable: errors.length === 0,
    provides: graph.provides,
    resolutions,
    errors,
    warnings,
  }
}

function resolveDependencyRef(
  dependency: ModuleStandard20DependencyRef,
  candidates: Array<Required<Pick<ModuleStandard20DependencyCandidate, 'moduleId' | 'version' | 'provides'>> & {installed?: boolean}>,
) {
  const matches = candidates.filter(candidate => {
    const identityMatch = dependency.moduleId ? candidate.moduleId === dependency.moduleId : true
    const providesMatch = dependency.provides ? candidate.provides.includes(dependency.provides) : true
    return identityMatch && providesMatch && satisfiesRange(candidate.version, dependency.versionRange)
  })
  const resolved = matches.sort((left, right) => compareVersions(right.version, left.version))[0]
  return {
    resolvedModuleId: resolved?.moduleId ?? null,
    resolvedVersion: resolved?.version ?? null,
    installed: Boolean(resolved?.installed),
    satisfied: Boolean(resolved),
    reason: dependency.reason,
  }
}

function satisfiesRange(version: string, range: string): boolean {
  if (!SEMVER_PATTERN.test(version) || !SEMVER_RANGE_PATTERN.test(range)) return false
  if (range === '*' || range === 'latest') return true
  if (range.startsWith('^')) {
    const base = range.slice(1)
    return tuple(version)[0] === tuple(base)[0] && compareVersions(version, base) >= 0
  }
  if (range.startsWith('~')) {
    const base = range.slice(1)
    const current = tuple(version)
    const required = tuple(base)
    return current[0] === required[0] && current[1] === required[1] && compareVersions(version, base) >= 0
  }
  const parts = range.trim().split(/\s+/).filter(Boolean)
  return parts.every(part => satisfiesComparator(version, part))
}

function satisfiesComparator(version: string, comparator: string): boolean {
  const match = /^(>=|<=|>|<|=)?(.+)$/.exec(comparator)
  if (!match || !SEMVER_PATTERN.test(match[2] ?? '')) return false
  const compared = compareVersions(version, match[2]!)
  const operator = match[1] ?? '='
  if (operator === '>=') return compared >= 0
  if (operator === '<=') return compared <= 0
  if (operator === '>') return compared > 0
  if (operator === '<') return compared < 0
  return compared === 0
}

function compareVersions(left: string, right: string): number {
  const a = tuple(left)
  const b = tuple(right)
  for (let index = 0; index < 3; index += 1) {
    const delta = a[index]! - b[index]!
    if (delta !== 0) return delta
  }
  return 0
}

function tuple(value: string): [number, number, number] {
  const match = SEMVER_PATTERN.exec(value)
  if (!match) return [0, 0, 0]
  return [Number(match[1]), Number(match[2]), Number(match[3])]
}

function asRecord(value: unknown): Record<string, unknown> {
  return value && typeof value === 'object' && !Array.isArray(value) ? value as Record<string, unknown> : {}
}

function arrayCount(value: unknown): number {
  return Array.isArray(value) ? value.length : 0
}

function versionedCount(value: unknown): number {
  const record = asRecord(value)
  return Array.isArray(record.items) ? record.items.length : 0
}

function stringValue(value: unknown): string | undefined {
  return typeof value === 'string' ? value : undefined
}
