import type { ModulaContext, SurfaceId } from './types';

export function resolveApiBase(modula: ModulaContext | null | undefined): string {
  const value = String(modula?.apiBase || '').trim();
  if (value) {
    if (value.endsWith('/example-module')) return value;
    if (value.endsWith('/modules')) return `${value}/example-module`;
    if (value.endsWith('/modula')) return `${value}/modules/example-module`;
  }
  return '/api/modula/modules/example-module';
}

export function resolveSurfaceId(modula: ModulaContext | null | undefined): SurfaceId {
  const id = String(modula?.surface?.id || '').toLowerCase();
  const route = String(modula?.surface?.route || '').toLowerCase();

  if (id === 'explore' || route === '/example/explore') return 'explore';
  if (id === 'settings' || route === '/example/settings') return 'settings';
  return 'main';
}
