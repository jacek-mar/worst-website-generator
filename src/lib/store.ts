import type { Generation } from "@/lib/chaos";

type Store = Map<string, Generation>;

function getGlobalStore(): Store {
  const g = globalThis as unknown as { __wwgStore?: Store };
  if (!g.__wwgStore) g.__wwgStore = new Map();
  return g.__wwgStore;
}

export function putGeneration(gen: Generation) {
  const store = getGlobalStore();
  store.set(gen.id, gen);
}

export function getGeneration(id: string) {
  const store = getGlobalStore();
  return store.get(id) ?? null;
}

export function hasGeneration(id: string) {
  return getGeneration(id) !== null;
}

export function listGenerationIds() {
  const store = getGlobalStore();
  return Array.from(store.keys()).slice(-25).reverse();
}

