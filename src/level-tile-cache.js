// Retain each key's original bake inputs while releasing inactive canvas values.
// Some existing keys share inputs: rebuilding must use the first successful factory.
const resets = new Set();
let activeLevel;
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
export function resetLevelTileCaches(levelKey) {
  if (levelKey !== undefined && levelKey === activeLevel) return;
  activeLevel = levelKey;
  for (const reset of resets) reset();
}
