/* src/route-insert.js - THE DESERT'S ROAD INSERTS, ONE RULE (claude/greatdune 11-06; plan-desert-1105 s3i: "ONE road-insert migration test for carpet /
   greatdune / kingspyramid / airship - a save past an insert keeps everything open; the new level shows unplayed, not a wall"). Pure: no DOM.

   WHY: the road grew five times before by hand (the palisade, the undercrown, the kitchen gate, the rookery, the hornet's nest - main.js progDefaults),
   each with its own PROG.xxxOpen flag, its own one-off migration and its own clause in levelLocked. Four desert inserts would be four more. This is the
   one shape for all of them:
     - the new level is APPENDED to LEVELS (saves and map nodes count levels by index: nothing moves) and NEEDS the level before it;
     - the level after it (before) NEEDS THE NEW ONE once the insert is LIVE;
     - ONCE, the first time a save is opened with the insert live: a save that had `before` open (it cleared `after`, or `before` itself) keeps it open
       (PROG.roadOpen[before] = 1). A fresh profile, or a save that reaches `after` later, walks the new level.
   An insert that ends the road (before: null) needs no migration: it only adds a level.
   LIVE = the level's own SHIPS flag (art before live). Until then the table is inert: applyInserts changes nothing and roadMigrate writes nothing - the
   flag-off game is master's, byte for byte. tools/route-insert.mjs proves the rule on master's LEVELS for all four, live and not.

   main.js: levelLocked reads roadKept(PROG, lv) beside the old per-level flags; progDefaults calls roadMigrate(PROG). level.js calls applyInserts(LEVELS). */
import { GD_SHIPS } from './great-dune.js';

/* the desert's four, in road order (plan s1 + Q1 rec). `live` is each level's SHIPS flag; the carpet / King's Pyramid / airship lanes flip their own. */
export const ROAD_INSERTS = [
  { id: 'carpet', after: 'glasssea', before: 'ksar', live: false },             /* THE FLYING CARPET + SPHINX (claude/carpet, not built yet) */
  { id: 'greatdune', after: 'buriedcity', before: 'sealedpyramid', live: GD_SHIPS },   /* THE GREAT DUNE (this lane: src/great-dune.js) */
  { id: 'kingspyramid', after: 'sealedpyramid', before: null, live: false },    /* THE KING'S PYRAMID (claude/kingspyramid: KP_SHIPS) */
  { id: 'airship', after: 'kingspyramid', before: null, live: false },          /* THE DESERT AIRSHIP (claude/airship, not built yet) */
];

const cleared = (PROG, id) => !!(PROG && PROG[id] && PROG[id].cleared);

/* REWIRE LEVELS for the live inserts whose rows exist: the insert needs `after`, `before` needs the insert. -> the inserts applied (ids) */
export function applyInserts(LEVELS, inserts = ROAD_INSERTS) {
  const done = [];
  for (const ins of inserts) {
    if (!ins.live) continue;
    const row = LEVELS.find(l => l.id === ins.id); if (!row) continue;
    row.needs = ins.after;
    if (ins.before) { const nx = LEVELS.find(l => l.id === ins.before); if (nx) nx.needs = ins.id; }
    done.push(ins.id);
  }
  return done;
}

/* THE ONE MIGRATION (once per insert, the first load with it live). -> the levels kept open by this call (ids) */
export function roadMigrate(PROG, inserts = ROAD_INSERTS) {
  const kept = [];
  for (const ins of inserts) {
    if (!ins.live || !ins.before) continue;
    PROG.roadMig = PROG.roadMig || {};
    if (PROG.roadMig[ins.id]) continue;
    PROG.roadMig[ins.id] = 1;
    if (cleared(PROG, ins.after) || cleared(PROG, ins.before) || cleared(PROG, ins.id)) { PROG.roadOpen = PROG.roadOpen || {}; PROG.roadOpen[ins.before] = 1; kept.push(ins.before); }
  }
  return kept;
}

/* a level a migration kept open (levelLocked's clause) */
export const roadKept = (PROG, lv) => !!(PROG && PROG.roadOpen && lv && PROG.roadOpen[lv.id]);

/* THE RULE AS A FUNCTION (the tool's model of levelLocked's needs clause: cleared `needs`, or the level itself cleared, or kept by the road) */
export const needsOpen = (PROG, lv) => !lv.needs || cleared(PROG, lv.needs) || cleared(PROG, lv.id) || roadKept(PROG, lv);
