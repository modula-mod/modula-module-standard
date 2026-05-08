import { mount as svelteMount } from 'svelte';
import ModulaModule from './ModulaModule.svelte';

function isLegacyClassComponent(candidate: unknown): candidate is new (options: {
  target: HTMLElement;
  props?: Record<string, unknown>;
}) => { $destroy?: () => void } {
  if (typeof candidate !== 'function') return false;
  const proto = (candidate as { prototype?: Record<string, unknown> }).prototype ?? {};
  return Boolean((proto as { $destroy?: unknown }).$destroy || (proto as { $set?: unknown }).$set);
}

function mountNative(target: HTMLElement, props?: Record<string, unknown>): () => void {
  const component = ModulaModule as unknown;

  if (isLegacyClassComponent(component)) {
    const instance = new component({ target, props: props ?? {} });
    return () => instance.$destroy?.();
  }

  const mounted = svelteMount(component as object, { target, props: props ?? {} });
  return () => (mounted as { $destroy?: () => void } | null)?.$destroy?.();
}

export default {
  mount: mountNative
};
