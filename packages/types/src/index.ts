export type ModulaModuleStatus =
  | 'local'
  | 'core'
  | 'installed'
  | 'available'
  | 'planned'
  | 'disabled'
  | 'archived'

export type ModulaModuleOwnerType =
  | 'user'
  | 'team'
  | 'business'
  | 'community'
  | 'project'

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
  provider?: 'github'
  type?: 'github'
  owner?: string
  repo: string
  ref: string
  manifestPath?: string
  path?: string
  readmePath?: string
  changelogPath?: string
  filetreePath?: string
  contextPath?: string
  agentsPath?: string
  runtimePath?: string
  securityPath?: string
  testingPath?: string
  permissionsPath?: string
  apiPath?: string
  marketplacePath?: string
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

export type ModulaModulePermission = {
  id: string
  label: string
  reason: string
  required: boolean
  risk: 'low' | 'medium' | 'high'
  scope?: string
}

export type ModulaRuntimeMode =
  | 'host-rendered-json'
  | 'remote-ui-contract'
  | 'sandboxed-webview'
  | 'signed-native-bundle'

export type ModulaShellMode =
  | 'standard'
  | 'editor'
  | 'dashboard'
  | 'chat'
  | 'media-player'
  | 'map'
  | 'secure'
  | 'game'
  | 'immersive'

export type ModulaModuleSurface =
  | 'board'
  | 'route'
  | 'profile'
  | 'settings'
  | 'marketplace'
  | 'composer'
  | 'chat'
  | 'notification'
  | 'sidebar'
  | 'bottom-bar'
  | 'floating-player'
  | 'share-sheet'
  | 'team'
  | 'business'
  | 'secure-settings'

export type ModulaModuleAction = {
  id: string
  label: string
  icon?: string
  kind: 'create' | 'update' | 'delete' | 'open' | 'share' | 'export' | 'custom'
  confirm?: boolean
  destructive?: boolean
  permission?: string
}

export type ModulaModuleManifest = {
  mmsVersion: '0.3.0'
  id: string
  slug: string
  name: string
  shortName?: string
  version: string
  publisher: string
  description: string
  longDescription?: string
  tags: string[]
  license: 'open-source' | 'source-available' | 'commercial' | 'private'
  visibility: 'public' | 'private' | 'unlisted'
  status: ModulaModuleStatus
  category: string
  categories: string[]
  screenshots?: ModulaModuleScreenshot[]
  source: ModulaModuleSource
  runtime: {
    mode: ModulaRuntimeMode
    support: 'supported' | 'planned' | 'future'
    sandbox?: string
    entry?: string
  }
  shell: {
    mode: ModulaShellMode
  }
  entry: {
    type:
      | 'host-rendered'
      | 'modula-ui-contract'
      | 'package-rendered'
      | ModulaRuntimeMode
    route: string
    component?: string
  }
  ownerTypes: ModulaModuleOwnerType[]
  permissions: ModulaModulePermission[] | string[] | ModulaModulePermissionSet
  surfaces: ModulaModuleSurface[] | string[] | ModulaModuleSurfaceConfig
  navigation: {
    routes: Array<{
      id: string
      path: string
      title: string
      surface: string
    }>
    bottomBar?: {
      mode: 'inherit' | 'module-owned'
      items: Array<{
        id: string
        label: string
        icon: string
        route: string
      }>
    }
  }
  uiPackage: {
    entry: string
    screens: Record<string, string>
    components?: Record<string, string>
    theme?: string
    animations?: string
  }
  capabilities: string[]
  hooks: string[]
  events: string[]
  actions: ModulaModuleAction[]
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
  mmsVersion: '0.3.0'
  registryVersion: string
  source: string
  modules: ModulaModuleManifest[]
}
