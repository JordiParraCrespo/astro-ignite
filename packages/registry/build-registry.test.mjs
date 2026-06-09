import { describe, it, expect } from 'vitest';
import { readManifest, buildRegistryItems, NAMESPACE } from './scripts/build-registry.mjs';

const FILE_TYPES = new Set([
  'registry:lib',
  'registry:ui',
  'registry:component',
  'registry:hook',
  'registry:block',
  'registry:page',
  'registry:file',
  'registry:theme',
  'registry:style',
  'registry:base',
  'registry:item',
]);

describe('registry build emission', () => {
  it('emits exactly one registry-item per manifest item', async () => {
    const manifest = await readManifest();
    const items = await buildRegistryItems();
    const manifestNames = manifest.items.map((i) => i.name).sort();
    const emittedNames = items.map((i) => i.name).sort();
    expect(emittedNames).toEqual(manifestNames);
  });

  it('every emitted item is shadcn-schema-shaped (name, type, files with type + content)', async () => {
    const items = await buildRegistryItems();
    for (const item of items) {
      expect(item.$schema).toBe('https://ui.shadcn.com/schema/registry-item.json');
      expect(typeof item.name).toBe('string');
      expect(FILE_TYPES.has(item.type)).toBe(true);
      expect(Array.isArray(item.files) && item.files.length > 0).toBe(true);
      for (const file of item.files) {
        expect(typeof file.path).toBe('string');
        expect(FILE_TYPES.has(file.type)).toBe(true);
        expect(typeof file.content).toBe('string');
        expect(file.content.length).toBeGreaterThan(0);
      }
    }
  });

  it('every emitted file count matches the manifest (compound families ship all parts)', async () => {
    const manifest = await readManifest();
    const items = await buildRegistryItems();
    const byName = Object.fromEntries(items.map((i) => [i.name, i]));
    for (const m of manifest.items) {
      expect(byName[m.name].files.map((f) => f.path).sort()).toEqual(
        m.files.map((f) => f.path).sort()
      );
    }
  });

  it('cn ships as a lib item and resolves transitively (namespaced) for every ui atom', async () => {
    const items = await buildRegistryItems();
    const cn = items.find((i) => i.name === 'cn');
    expect(cn).toBeDefined();
    expect(cn.type).toBe('registry:lib');
    // Internal deps are rewritten to the namespaced form so a consumer's
    // @astro-ignite namespace resolves them against this registry (a bare
    // "cn" would resolve against shadcn's default registry).
    for (const item of items) {
      if (item.type !== 'registry:ui') continue;
      expect(item.registryDependencies ?? []).toContain(`${NAMESPACE}/cn`);
      expect(item.registryDependencies ?? []).not.toContain('cn');
    }
  });
});
