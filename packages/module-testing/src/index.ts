import {
  MODULA_MODULE_STANDARD_VERSION,
  type CapabilityNegotiationResult,
  type HostCapability,
  type HostCompatibility,
  type ModulaModuleManifest,
  negotiateCapabilities,
  negotiateCompatibility,
} from '@modula/module-standard'
import {validateModulaModuleManifest, type ModulaModuleValidationResult} from '@modula/module-validator'

export type ModuleSandboxOptions = {
  host?: Partial<HostCompatibility>
  capabilities?: Array<string | HostCapability>
  deniedCapabilities?: string[]
}

export type ModuleSandbox = {
  host: HostCompatibility
  capabilities: HostCapability[]
  validate(manifest: unknown): ModulaModuleValidationResult
  negotiate(manifest: ModulaModuleManifest): {
    compatibility: ReturnType<typeof negotiateCompatibility>
    capabilities: CapabilityNegotiationResult
  }
  inspectEvents(manifest: ModulaModuleManifest): {
    emitted: string[]
    consumed: string[]
    replayable: string[]
  }
  inspectSearch(manifest: ModulaModuleManifest): Array<{
    id: string
    recordId: string
    indexedFields: string[]
    sensitiveFields: string[]
  }>
  inspectDiagnostics(manifest: ModulaModuleManifest): ModulaModuleManifest['diagnostics']
  inspectBackend(manifest: ModulaModuleManifest): {
    mode: NonNullable<ModulaModuleManifest['backend']>['mode']
    protocolVersion: string
    primaryStore: string
    deploymentOwnership: string
    clientAccessAllowed: boolean
  }
  previewHealth(manifest: ModulaModuleManifest): ModulaModuleManifest['health']
  runMigrations(manifest: ModulaModuleManifest, fromVersion: string): {
    targetVersion: string
    steps: string[]
    reversible: boolean
  }
}

const DEFAULT_HOST: HostCompatibility = {
  hostVersion: '1.0.0',
  runtimeVersion: '1.0.0',
  standardVersion: MODULA_MODULE_STANDARD_VERSION,
  platform: 'web',
}

const DEFAULT_CAPABILITIES = [
  'records',
  'views',
  'actions',
  'functions',
  'events',
  'automations',
  'ai',
  'search',
  'settings',
  'diagnostics',
  'health',
  'migrations',
]

export function createModuleSandbox(options: ModuleSandboxOptions = {}): ModuleSandbox {
  const denied = new Set(options.deniedCapabilities ?? [])
  const declaredCapabilities = options.capabilities ?? DEFAULT_CAPABILITIES
  const capabilities = declaredCapabilities.map(capability => {
    if (typeof capability === 'string') return {id: capability, available: !denied.has(capability), reason: denied.has(capability) ? 'simulated missing capability' : undefined}
    return denied.has(capability.id) ? {...capability, available: false, reason: 'simulated missing capability'} : capability
  })
  const host: HostCompatibility = {
    ...DEFAULT_HOST,
    ...options.host,
  }

  return {
    host,
    capabilities,
    validate(manifest) {
      return validateModulaModuleManifest(manifest, {host, hostCapabilities: capabilities})
    },
    negotiate(manifest) {
      return {
        compatibility: negotiateCompatibility(manifest, host),
        capabilities: negotiateCapabilities(manifest, capabilities),
      }
    },
    inspectEvents(manifest) {
      return {
        emitted: manifest.events.filter(event => event.direction === 'emitted').map(event => event.type),
        consumed: manifest.events.filter(event => event.direction === 'consumed').map(event => event.type),
        replayable: manifest.events.filter(event => event.replaySupport).map(event => event.type),
      }
    },
    inspectSearch(manifest) {
      return manifest.search.map(search => ({
        id: search.id,
        recordId: search.recordId,
        indexedFields: search.indexedFields,
        sensitiveFields: search.sensitiveFields,
      }))
    },
    inspectDiagnostics(manifest) {
      return manifest.diagnostics
    },
    inspectBackend(manifest) {
      return {
        mode: manifest.backend?.mode ?? 'greenfield-managed',
        protocolVersion: manifest.backend?.protocolVersion ?? 'greenfield',
        primaryStore: manifest.backend?.data?.primaryStore ?? 'greenfield',
        deploymentOwnership: manifest.backend?.deployment?.ownership ?? 'modula-hosted',
        clientAccessAllowed: manifest.backend?.clientAccess?.allowed ?? false,
      }
    },
    previewHealth(manifest) {
      return manifest.health
    },
    runMigrations(manifest, fromVersion) {
      const steps = manifest.migrations.steps.filter(step => step.from === fromVersion || step.to === manifest.dataSchemaVersion)
      return {
        targetVersion: manifest.dataSchemaVersion,
        steps: steps.map(step => step.id),
        reversible: steps.every(step => step.reversible),
      }
    },
  }
}

export function runModuleStandardTestPlan(manifest: unknown, options: ModuleSandboxOptions = {}) {
  const sandbox = createModuleSandbox(options)
  const validation = sandbox.validate(manifest)
  if (!validation.valid || !validation.manifest) {
    return {valid: false, validation}
  }
  return {
    valid: true,
    validation,
    negotiation: sandbox.negotiate(validation.manifest),
    events: sandbox.inspectEvents(validation.manifest),
    search: sandbox.inspectSearch(validation.manifest),
    diagnostics: sandbox.inspectDiagnostics(validation.manifest),
    backend: sandbox.inspectBackend(validation.manifest),
    health: sandbox.previewHealth(validation.manifest),
    migrations: sandbox.runMigrations(validation.manifest, '0.0.0'),
  }
}
