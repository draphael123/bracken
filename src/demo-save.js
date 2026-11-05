/* src/demo-save.js - A DEMO SAVE CARRIES OVER TO THE FULL GAME (claude/demoend, Daniel 11-03 18:50: "full game imports demo saves cleanly, tagged as demo (hero levels/skills/unlocks carry;
   past-Kingswood stays locked until reached)"). Pure: no page, no storage. The demo writes the same save shape as the full game plus ONE tag, `demoSave: 1`; the player exports it
   (end card KEEP YOUR PROGRESS, or SETTINGS > EXPORT SAVE) and the full game's SETTINGS > IMPORT SAVE reads it through prepareImport:
     - a save with no tag comes back UNCHANGED (the same string: the full game's own export / import is untouched);
     - a tagged one keeps everything the hero owns (xp, skills, loadouts, heroes, items, coins, the slice's clears and medals) and loses anything that is past the slice
       (a level record, a done-mark, a road-open flag), so the road beyond Kingswood opens only by reaching it. It gains `demoImported: 1` and keeps `demoSave: 1`: the tag. */
import { inSlice } from './demo-flag.js';
export const DEMO_TAG = 'demoSave', IMPORT_TAG = 'demoImported';
const KEEP_OPEN = new Set(['marshOpen', 'kingsOpen', 'palisadeOpen', 'underleafOpen', 'burningOpen']);   /* the road-open flags that sit INSIDE the slice */
const isObj = v => !!v && typeof v === 'object' && !Array.isArray(v);
/* the campaign levels the demo cannot reach */
export const pastSlice = levels => levels.filter(lv => !inSlice(lv));
/* a save that has cleared nothing past the slice is demo-shaped: the demo tags only those (a full-game save opened under ?demo=1 on a shared address is never tagged, so it is never stripped) */
export const demoShaped = (p, levels) => isObj(p) && pastSlice(levels).every(lv => !(isObj(p[lv.id]) && p[lv.id].cleared));
export function tag(p, levels) { if (demoShaped(p, levels)) p[DEMO_TAG] = 1; return p; }
export function prepareImport(raw, levels) {
  let p; try { p = JSON.parse(raw); } catch { return raw; }   /* unreadable: the importer's own error says so */
  if (!isObj(p) || !p[DEMO_TAG]) return raw;
  const gone = [];
  for (const lv of pastSlice(levels)) {
    if (p[lv.id] !== undefined) { delete p[lv.id]; gone.push(lv.id); }
    for (const h of Object.keys(isObj(p.done) ? p.done : {})) if (isObj(p.done[h]) && p.done[h][lv.id] !== undefined) { delete p.done[h][lv.id]; if (!gone.includes(lv.id)) gone.push(lv.id); }
  }
  for (const k of Object.keys(p)) if (/Open$/.test(k) && !KEEP_OPEN.has(k)) { delete p[k]; gone.push(k); }
  p[IMPORT_TAG] = 1;
  return JSON.stringify(p, null, 2);
}
