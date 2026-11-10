// maker-library.js (claude/maker) - MY LEVELS: every level you make, kept in this browser and saved by itself.
// Daniel 2026-11-09: three numbered slots and a manual SAVE lost work (a closed tab, an opened link). Now each level has an id,
// the editor autosaves it a moment after every edit, and MY LEVELS lists them all (open, copy, delete).
// Storage: localStorage 'bracken.maker.lib' = [{ id, name, updated, W, H }] (newest first) and 'bracken.maker.lv.<id>' = the
// level as the share format's JSON (src/maker-palette.js docToJSON / docFromJSON). Every access is guarded: a private window or
// a full disk just means nothing is kept, never a crash.
import { docToJSON, docFromJSON } from './maker-palette.js';

const IDX = 'bracken.maker.lib', LV = id => 'bracken.maker.lv.' + id, MIGRATED = 'bracken.maker.migrated';
const read = k => { try { return localStorage.getItem(k); } catch (e) { return null; } };
const write = (k, v) => { try { localStorage.setItem(k, v); return true; } catch (e) { return false; } };
const drop = k => { try { localStorage.removeItem(k); } catch (e) {} };

let cache = null;
export function list() { if (cache) return cache; try { cache = JSON.parse(read(IDX) || '[]'); if (!Array.isArray(cache)) cache = []; } catch (e) { cache = []; } return cache; }
const saveIdx = () => write(IDX, JSON.stringify(cache || []));
let seq = 0;   /* never Math.random: that is the game's seeded stream (a UI roll shifted the foes' dice once) */
export const newId = () => Date.now().toString(36) + (seq++).toString(36);

/* put the level (it gets an id the first time); newest first. Returns its id, or null if the browser would not keep it. */
export function put(doc) {
  if (!doc) return null; if (!doc.libId) doc.libId = newId();
  if (!write(LV(doc.libId), JSON.stringify(docToJSON(doc)))) return null;
  const L = list().filter(e => e.id !== doc.libId); L.unshift({ id: doc.libId, name: doc.name || 'A WOOD', updated: Date.now(), W: doc.W, H: doc.H }); cache = L; saveIdx();
  return doc.libId;
}
export function get(id) { const raw = read(LV(id)); if (!raw) return null; try { const d = docFromJSON(JSON.parse(raw)); d.libId = id; return d; } catch (e) { return null; } }
export function remove(id) { drop(LV(id)); cache = list().filter(e => e.id !== id); saveIdx(); }
export function copy(id) { const d = get(id); if (!d) return null; d.libId = null; d.name = (d.name || 'A WOOD').slice(0, 17) + ' COPY'; d.cleared = null; return put(d); }
export const newest = () => list()[0] || null;

/* the old three numbered slots come in once, as levels of their own (the slots themselves are left as they were) */
export function migrateSlots(slotKey, n, loadSlot) {
  if (read(MIGRATED)) return 0; let k = 0;
  for (let i = n - 1; i >= 0; i--) { if (!read(slotKey(i))) continue; const d = loadSlot(i); if (!d) continue; d.libId = null; d.name = d.name || 'SLOT ' + (i + 1); if (put(d)) k++; }
  write(MIGRATED, '1'); return k;
}

/* (claude/maker) SETS: levels played in order with one hero. 'bracken.maker.sets' = [{ id, name, hero, ids: [level ids] }] */
const SETS = 'bracken.maker.sets';
let setCache = null;
export function sets() { if (setCache) return setCache; try { setCache = JSON.parse(read(SETS) || '[]'); if (!Array.isArray(setCache)) setCache = []; } catch (e) { setCache = []; } setCache.forEach(s => { s.ids = (s.ids || []).filter(id => list().some(e => e.id === id)); }); return setCache; }
const saveSets = () => write(SETS, JSON.stringify(setCache || []));
export function newSet(name, firstId) { const s = { id: newId(), name: name || 'A SET', hero: 'knight', ids: firstId ? [firstId] : [] }; sets().unshift(s); saveSets(); return s; }
export const getSet = id => sets().find(s => s.id === id) || null;
export function editSet(id, fn) { const s = getSet(id); if (!s) return null; fn(s); saveSets(); return s; }
export function removeSet(id) { setCache = sets().filter(s => s.id !== id); saveSets(); }
