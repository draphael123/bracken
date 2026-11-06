/* src/scenes-gallery.js - THE SCENES GALLERY (claude/scenes-gallery; Daniel 11-06 15:37). Pure data and rules, no canvas, no page.
   Every level-to-level transition (src/transitions.js TABLE) is a SCENE a player can watch again: the title menu's SCENES row and the inn's THE STORYTELLER open one card that lists them.
   - ROAD ORDER is the TABLE's own order (rows() walks TABLE; there is no second list to keep in step).
   - A row is UNLOCKED when the save has SEEN it (PROG.transSeen['from>to'], written when the transition plays or is skipped) or, for saves from before that flag, when the road has been walked past it
     (back-fill: the 'from' or the 'to' level is cleared). A locked row shows as '???'. ?scenes=all unlocks every row (review).
   - CINEMATIC rows (a scene on top of the walk: the ferry, the laid road, the smoke) are marked.
   - A REPLAY is self-contained: main.js (scenesPlay) loads the 'from' level behind the playtest save lock (bossJumpOn: saveProgress writes nothing), runs the row's own beats through the same runner,
     and returns to the card. No clear is credited, no save is written; 'seen' is only ever written by a real transition, never by a replay.
   NAMES are short and player-facing (the card's panel is ~158 px at size 6: <= NAME_MAX characters). */
import { TABLE } from './transitions.js';

export const NAME_MAX = 28;
export const keyOf = e => e.from + '>' + e.to;
export const NAMES = {
  'wood>hornetsnest': 'OUT OF THE LUMBER TRAIL',
  'hornetsnest>marsh': 'THE FERRY TO THE MARSH',
  'marsh>fenroad': 'THE BOG GATE FALLS',
  'fenroad>stockade': 'THE ROAD TO THE STOCKADE',
  'stockade>spore': 'OUT OF THE BURNING HALL',
  'spore>rootway': 'THE KNOT OPENS',
  'rootway>underleaf': 'THE HUNTMASTER\'S GATE',
  'underleaf>palisadewood': 'THE HEDGE-GATE PARTS',
  'palisadewood>kings': 'THROUGH THE BREACHED WALL',
  'kings>burning': 'SMOKE OVER THE KINGSWOOD',
  'kings>scree': 'THE ROAD TO THE SCREE PATH',
};
export const nameOf = e => NAMES[keyOf(e)] || ('ON FROM ' + String(e.from).toUpperCase());
export const isCinematic = e => !!(e && e.scene);

const cleared = (prog, id) => !!(prog && prog[id] && prog[id].cleared);
/* the road has been walked past this row (for an old save with no transSeen). Rows that depend on the Kingswood spur follow the flag the save carries. */
export function walkedPast(prog, e) {
  if (!prog || !(cleared(prog, e.from) || cleared(prog, e.to))) return false;
  if (e.when && 'burningOpen' in e.when) return !!e.when.burningOpen === !!prog.burningOpen;
  return true;
}
export const seenKey = (prog, key) => !!(prog && prog.transSeen && prog.transSeen[key]);
export const isUnlocked = (prog, e, { all = false } = {}) => !!all || seenKey(prog, keyOf(e)) || walkedPast(prog, e);

/* the card's rows, in road order. hide(e): rows left off the list entirely (the demo's locked ends). */
export function rows(prog, { all = false, hide = null } = {}) {
  const out = [];
  for (const e of TABLE) {
    if (hide && !all && hide(e)) continue;
    out.push({ n: out.length + 1, key: keyOf(e), entry: e, name: nameOf(e), cinematic: isCinematic(e), unlocked: isUnlocked(prog, e, { all }) });
  }
  return out;
}
export const countUnlocked = (prog, o) => rows(prog, o).filter(r => r.unlocked).length;
export const anyUnlocked = (prog, o) => countUnlocked(prog, o) > 0;

/* a transition just played or was skipped (a real one: never a replay). Returns true when it changed the flag (the caller saves). */
export function markSeen(prog, key) {
  if (!prog) return false;
  prog.transSeen = prog.transSeen || {};
  if (prog.transSeen[key]) return false;
  prog.transSeen[key] = 1; return true;
}

/* where the heroes stand for a replay, as a column: nine tiles short of the way out (the gate's wall, or the end the party walks to), inside the level */
export function standCol(e, LW) {
  const out = e.open ? e.open.col : e.walk && e.walk.to ? e.walk.to : LW;
  return Math.max(4, Math.min(LW - 4, out - 9));
}
