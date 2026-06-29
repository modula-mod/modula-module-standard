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
}

export type ModulaModuleUiConfig = {
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

export type ModulaModuleManifest = {
  mmsVersion: '0.1.0'
  id: string
  name: string
  version: string
  status: ModulaModuleStatus
  category: string
  description: string
  entry: {
    route: string
    component: string
  }
  ownerTypes: ModulaModuleOwnerType[]
  permissions: ModulaModulePermissionSet
  surfaces: ModulaModuleSurfaceConfig
  data: ModulaModuleDataConfig
  ui: ModulaModuleUiConfig
  minimumModulaVersion: string
  changelog: ModulaModuleVersion[]
  integrity: {
    hash: string | null
    signature: string | null
  }
}

export type ModulaModuleRegistry = {
  mmsVersion: '0.1.0'
  registryVersion: string
  source: string
  modules: ModulaModuleManifest[]
}

