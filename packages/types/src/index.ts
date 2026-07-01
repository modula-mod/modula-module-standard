export type ModulaModuleStatus =
  | 'local'
  | 'core'
  | 'installed'
  | 'available'
  | 'planned'
  | 'disabled'
  | 'archived'

export type ModulaModuleOwnerType = 'user' | 'team' | 'business'

export type ModulaModulePermissionSet = {
  storage: boolean
  network: boolean
  media: boolean
  notifications: boolean
  ai: boolean
}

export type ModulaModuleSurfaceConfig = {
  board: boolean
  profile: boolean
  settings: boolean
}

export type ModulaModuleDataConfig = {
  provider: string
  storage: string
  sync: string
  contract?: {
    schemaVersion: string
    entry: string
  }
}

export type ModulaModuleUiConfig = {
  type?: 'host-rendered' | 'modula-ui-contract' | 'package-rendered'
  schemaVersion?: string
  entry?: string
  usesDesignStandard: boolean
  supportsSurfaceTypes: boolean
  supportsTextScale: boolean
  supportsReduceMotion: boolean
}

export type ModulaModuleVersion = {
  version: string
  date?: string
  notes?: string
}

export type ModulaModuleSource = {
  type: 'github'
  repo: string
  ref: string
  path?: string
}

export type ModulaModuleScreenshot = {
  title: string
  path: string
  description?: string
  surface?: string
}

export type ModulaModuleChangelogSource = {
  type: 'github'
  path: string
}

export type ModulaModuleManifest = {
  mmsVersion: '0.2.0'
  id: string
  name: string
  version: string
  status: ModulaModuleStatus
  category: string
  categories?: string[]
  description: string
  screenshots?: ModulaModuleScreenshot[]
  source: ModulaModuleSource
  entry: {
    type: 'host-rendered' | 'modula-ui-contract' | 'package-rendered'
    route: string
    component?: string
  }
  ownerTypes: ModulaModuleOwnerType[]
  permissions: string[] | ModulaModulePermissionSet
  surfaces: string[] | ModulaModuleSurfaceConfig
  capabilities: string[]
  data: ModulaModuleDataConfig
  ui: ModulaModuleUiConfig
  lifecycle: {
    install: 'manual' | 'automatic' | 'core'
    update: 'manual' | 'automatic'
    uninstall: 'preserve-data' | 'delete-data-prohibited'
    installable?: boolean
    updateable?: boolean
    rollbackable?: boolean
  }
  compatibility: {
    minimumModulaVersion: string
    minModulaVersion?: string
    minHostVersion?: string
    hostRendered?: boolean
  }
  minimumModulaVersion: string
  changelogSource?: ModulaModuleChangelogSource
  changelog: ModulaModuleVersion[]
  integrity: {
    hash: string | null
    signature: string | null
  }
}

export type ModulaModuleRegistry = {
  mmsVersion: '0.2.0'
  registryVersion: string
  source: string
  modules: ModulaModuleManifest[]
}
