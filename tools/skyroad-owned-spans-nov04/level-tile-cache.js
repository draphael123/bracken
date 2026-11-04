// Retain each key's original bake inputs while releasing inactive canvas values.
// Some existing keys share inputs: rebuilding must use the first successful factory.
const resets = new Set();
export function levelTileCache() { const cache = new Map(); resets.add(() => cache.clear()); return cache; }
export function levelTileMemo() {
  const recipes = new Map(), live = new Map(); resets.add(() => live.clear());
  return (key, build) => {
    if (live.has(key)) return live.get(key);
    const recipe = recipes.get(key) || build, value = recipe();
    if (!recipes.has(key)) recipes.set(key, recipe);
    live.set(key, value); return value;
  };
}
export function resetLevelTileCaches() { for (const reset of resets) reset(); }

// Internal Skyroad provenance variant. Public constructors above remain byte-exact.
// Check before original dynamic operations; once tainted, execute the original path
// without renewed eligibility or additional probing of possibly foreign objects.
export function privateOwnedTileMemo(owner) {
  owner.beforeConstruct(resets);
  const recipes = new Map(), live = new Map();
  resets.add(() => { owner.beforeOperation('clear'); live.clear(); });
  return (key, build, permit = false) => {
    if(!permit)owner.beforeOperation('has');
    if (live.has(key)) { if(!permit)owner.beforeOperation('get'); return live.get(key); }
    if(!permit)owner.beforeOperation('get');
    const recipe = recipes.get(key) || build;
    if(!permit)owner.beforeBuild();
    const value = recipe();
    if(!permit)owner.beforeOperation('has');
    if (!recipes.has(key)) { if(!permit)owner.beforeOperation('set'); recipes.set(key, recipe); }
    if(!permit)owner.beforeOperation('set');
    live.set(key, value); return value;
  };
}
