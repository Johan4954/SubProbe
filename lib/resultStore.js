import { normalizeUrlPath } from './utils.js';

const store = new Map(); // clave -> resultado

export function addResult(entry) {
  const key = `${normalizeUrlPath(entry.value)}|${entry.source}`;
  if (!store.has(key)) {
    store.set(key, entry);
  }
}

export function getAllResults() {
  return [...store.values()];
}