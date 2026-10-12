// src/save-safety.js - A SAVE IS NEVER LOST IN SILENCE (claude/shipfix, Daniel 10-11).
// Pure: every function takes the storage it works on, so tools/save-safety.mjs drives it with a fake and a full disk, no page needed.
//   slotHealth   what a slot's raw text IS: empty / ok / newer (a save from a later BRACKEN) / corrupt - and why, in words.
//   A CORRUPT slot used to read as EMPTY (NEW GAME), refuse every write with no reason, and say "already empty" to an erase. Now it is
//   shown as CORRUPT, its raw text is kept in key + '.corrupt', and the picker offers RESTORE / EXPORT / ERASE.
//   lastgood     key + '.lastgood': the raw text of the last time the slot opened clean - the thing RESTORE puts back first.
//   safeSet      the everyday write. A full disk is not swallowed: it prunes what is only a safety copy, retries once, and tells the caller.
//   pruneBackups the migration backups (key + '.before-progression-vN.<checksum>') were never removed; one is kept (the newest write).
import { migrateProgress } from './progression.js';

export const MIG = '.before-progression-', CORRUPT = '.corrupt', LASTGOOD = '.lastgood';

/* the slot's raw text, judged. raw === null (nothing stored) is empty; a text migrateProgress cannot take is corrupt, or 'newer' when it
   only says the save is from a later version (that one is NOT damaged: restoring over it would throw a good save away). */
export function slotHealth(raw, campaignIds = []) {
  if (raw === null || raw === undefined || raw === '') return { state: 'empty', reason: '' };
  try { migrateProgress(raw, campaignIds); return { state: 'ok', reason: '' }; }
  catch (e) { const m = String((e && e.message) || e); return { state: /newer version/i.test(m) ? 'newer' : 'corrupt', reason: m }; }
}

export const keysOf = storage => { const out = []; try { for (let i = 0; i < storage.length; i++) { const k = storage.key(i); if (k !== null) out.push(k); } } catch {} return out; };
const get = (storage, k) => { try { return storage.getItem(k); } catch { return null; } };
const del = (storage, k) => { try { storage.removeItem(k); return true; } catch { return false; } };

/* a copy of damaged text, once (an identical copy is not rewritten). Returns true when the copy is there afterwards. */
export function keepCorruptCopy(storage, key, raw) {
  if (raw === null || raw === undefined) return false;
  try { if (get(storage, key + CORRUPT) !== raw) storage.setItem(key + CORRUPT, raw); return get(storage, key + CORRUPT) === raw; } catch { return false; }
}
export function keepLastGood(storage, key, raw, campaignIds = []) {
  if (!raw || get(storage, key + LASTGOOD) === raw) return false;
  if (slotHealth(raw, campaignIds).state !== 'ok') return false;
  try { storage.setItem(key + LASTGOOD, raw); return true; } catch { return false; }
}
/* every text this slot could be put back to that still reads clean: the last good copy first, then the migration backups */
export function backupCandidates(storage, key, campaignIds = []) {
  const out = [], names = [key + LASTGOOD, ...keysOf(storage).filter(k => k.startsWith(key + MIG)).sort().reverse()];
  for (const k of names) { const raw = get(storage, k); if (raw && slotHealth(raw, campaignIds).state === 'ok') out.push({ key: k, raw, kind: k.endsWith(LASTGOOD) ? 'last good copy' : 'before an update' }); }
  return out;
}
/* put a candidate back; the damaged text goes to key + '.corrupt' first so the restore itself loses nothing */
export function restoreSlot(storage, key, cand, legacyRaw = null) {
  const cur = get(storage, key) || legacyRaw; if (cur) keepCorruptCopy(storage, key, cur);
  storage.setItem(key, cand.raw); if (get(storage, key) !== cand.raw) throw Error('Could not verify the restore.');
  return true;
}
/* the migration backups of one slot, all but `keep` (the one the migration just wrote). Returns how many went. */
export function pruneBackups(storage, key, keep = '') { let n = 0; for (const k of keysOf(storage)) if (k.startsWith(key + MIG) && k !== keep && del(storage, k)) n++; return n; }

const isFull = e => !!e && (e.name === 'QuotaExceededError' || e.name === 'NS_ERROR_DOM_QUOTA_REACHED' || e.code === 22 || e.code === 1014 || /quota/i.test(String(e.message || '')));
/* THE EVERYDAY WRITE. Tries; on a failure frees the safety copies in the order they matter least (every migration backup, the corrupt copies,
   then this slot's last-good copy) and retries after each; never touches another slot's save. Returns { ok, full, pruned }. */
export function safeSet(storage, key, text, slotKeys = []) {
  let first = null;
  try { storage.setItem(key, text); return { ok: true, full: false, pruned: 0 }; } catch (e) { first = e; }
  let pruned = 0;
  const steps = [
    () => keysOf(storage).filter(k => k.includes(MIG)),
    () => keysOf(storage).filter(k => k.endsWith(CORRUPT)),
    () => [key + LASTGOOD],
  ];
  for (const step of steps) {
    for (const k of step()) if (k !== key && !slotKeys.includes(k) && del(storage, k)) pruned++;
    try { storage.setItem(key, text); return { ok: true, full: false, pruned }; } catch (e) { first = e; }
  }
  return { ok: false, full: isFull(first), pruned, error: String((first && first.message) || first) };
}
