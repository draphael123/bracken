// src/hints.js - THE ONE DOOR EVERY HELP BOX GOES THROUGH (claude/hintlevel; Daniel 10-16: "we have a lot of help boxes and reminders - fine for new
// levels / new players, but the menu should choose how many").  Settings > Gameplay > Hints: NONE / LOW / MEDIUM / HIGH.  Pure: no DOM, no main.js.
//
// A hint is one of four TIERS:
//   mechanic  the first time a verb or mechanic shows itself (a guard that turns a light blow, a bucket, the shrine, the first plunge)
//   tip       a useful extra: how to hurt a boss or a foe, a level's field hint, the flask objective line, a teaching line that floats up
//   reminder  a repeat or a refresher (the same lesson again, "TOO EARLY", a nag)
//   stall     the nudge (and the glint / way arrow) when the route has had no headway for a while
// A NOTICE (level up, XP catch-up, a gate opening, "THE FIELD REMEMBERS") is not a hint: main.js sets it directly and no level touches it.
//
//   HIGH    = everything, as it always was (every tier, every repeat, the nudge after 10 s, the glint always)
//   MEDIUM  = mechanic + tip, each line once per save; reminders at most one a level; the nudge after 20 s
//   LOW     = mechanic only, each line once per save; the nudge after 45 s and the glint only once that long has passed
//   NONE    = no hint box, no nudge, no glint (a placed sign still reads when you press talk: it is level dressing, it never pops up by itself)
// "Once per save" is kept in PROG.hintSeen (a plain map of line -> 1), only while the level is below HIGH, so turning it back up to HIGH loses nothing.
// A NEW save defaults to MEDIUM, an existing one to HIGH (main.js readSettings, SET.hintsV1).
export const HINT_LEVELS = ['none', 'low', 'medium', 'high'];
export const HINT_TIERS = ['mechanic', 'tip', 'reminder', 'stall'];
export const STALL_AFTER = { high: 10, medium: 20, low: 45, none: Infinity };   /* s with no headway before the nudge */
export const GLINT_AFTER = { high: 0, medium: 0, low: 45, none: Infinity };      /* s of stall before the glint shows (high / medium: as it always did) */
export const LABEL = { none: 'NONE', low: 'LOW', medium: 'MEDIUM', high: 'HIGH' };

const S = { level: 'high', seen: null, levelKey: '', reminders: 0, stall: false, denied: 0, shown: 0 };
const norm = l => (HINT_LEVELS.includes(l) ? l : 'high');

export const hintLevel = () => S.level;
export function setHintLevel(l) { S.level = norm(l); }
/* the save's "already told" map: main.js hands it PROG.hintSeen after every load of a save (a missing map is made) */
export function setSeenStore(o) { S.seen = o && typeof o === 'object' ? o : {}; return S.seen; }
/* a new level (or a new life): the per-level reminder allowance starts again */
export function newLevel(key) { S.levelKey = String(key); S.reminders = 0; S.stall = false; }

/* THE GATE. tier: one of HINT_TIERS; id: the line (its words) - the same line is the same hint. True = put it in the hint box. */
export function hintAllowed(tier, id) {
  const l = S.level; if (l === 'high') { S.shown++; return true; }
  if (l === 'none') { S.denied++; return false; }
  if (tier === 'stall') { if (l === 'low' || l === 'medium') { S.shown++; return true; } }   /* (its timing is the gate: STALL_AFTER) */
  if (tier === 'reminder') { if (l === 'medium' && S.reminders < 1) { S.reminders++; S.shown++; return true; } S.denied++; return false; }
  if (tier === 'mechanic' || (tier === 'tip' && l === 'medium')) {
    const k = String(id); if (!S.seen) S.seen = {}; if (S.seen[k]) { S.denied++; return false; }
    S.seen[k] = 1; S.shown++; return true; }
  S.denied++; return false;
}
/* the stall clock (src/stuck-guide.js stallTick) says "the nudge is due now"; the next number() line that comes out of it is a stall line, not a tip */
export function markStall(due) { S.stall = !!due; }
export function takeStall() { const v = S.stall; S.stall = false; return v; }
export const stallAfter = () => STALL_AFTER[S.level];
/* the glint (the star over what the route needs next): t = seconds the route has stood still */
export const glintOn = t => (S.level === 'high' || S.level === 'medium') ? true : (S.level === 'low' && t >= GLINT_AFTER.low);
export const hintStats = () => ({ level: S.level, shown: S.shown, denied: S.denied, reminders: S.reminders });
export const nextLevel = (l, dir = 1) => HINT_LEVELS[(HINT_LEVELS.indexOf(norm(l)) + dir + HINT_LEVELS.length * 2) % HINT_LEVELS.length];
