// src/act-cards.js - ACT CARDS and THE BOSS-KILL BEAT (claude/actcards; Daniel 10-18 B3 + B4). Pure logic, no canvas: main.js draws and applies.
//
// ACT CARD: "ACT II - THE CRAGS" for 2 s on the FIRST entry into an act's level, once per save (PROG.actSeen[act] = 1). It rides the level's
//   own iris-in (the card fades up as the iris opens, over the level, above the hero's head), never pauses, never takes a key. The act table
//   is src/foe-react.js ACTS ({ act, name, levels }); a level that is in no act (shop, trial, practice yard, editor) shows nothing.
// BOSS-KILL BEAT: one shared beat on the first frame bossWon goes up (every boss funnels through it, whichever death routine ran): ~0.5 s of
//   slow-mo, the camera easing toward the body, a stinger. The existing death FX + win card run on bossWon exactly as before - the beat
//   happens INSIDE their 2.2-4.2 s, so nothing waits on it (a bot that waits for the win card waits no longer).
//   Reduce motion keeps the stinger and drops the slow-mo and the push. One beat per level load (main.js clears it with bossWon);
//   a co-op pair is one level and one boss, so one beat. Minis do not set bossWon, so they are left as they were (named in the report).
import { ACTS } from './foe-react.js';

export const CARD = { hold: 2.0, fadeIn: 0.35, fadeOut: 0.5 };
export const BEAT = { t: 0.5, slow: 0.5, push: 0.45, zoom: 0.18 };   /* slow: seconds of slowT; push: how far the camera goes toward the boss (fraction of the gap); zoom: bossZoom added at the peak */
export const ROMAN = ['', 'I', 'II', 'III', 'IV', 'V', 'VI', 'VII', 'VIII', 'IX', 'X'];

export const actOfLevel = id => ACTS.find(a => a.levels.includes(id)) || null;
export const cardLabel = a => 'ACT ' + (ROMAN[a.act] || a.act);

/* the card owed on entering `id`, or null (not in an act, or already seen on this save). Does NOT mark it - markSeen does, so a caller that
   shows nothing (a boss-jump page, a rush) can leave the flag alone. */
export function cardFor(id, prog) {
  const a = actOfLevel(id); if (!a) return null;
  if (prog && prog.actSeen && prog.actSeen[a.act]) return null;
  if (prog && a.levels.some(l => prog[l] && prog[l].cleared)) return null;   /* an old save that already cleared a level of this act has seen it: no card for a veteran's first load after this ships */
  return { act: a.act, label: cardLabel(a), name: a.name, t: CARD.hold, hold: CARD.hold };
}
export function markSeen(prog, act) { prog.actSeen = prog.actSeen || {}; prog.actSeen[act] = 1; }

/* alpha of the card with `left` seconds still to run */
export function cardAlpha(left, hold = CARD.hold) {
  const el = hold - left; if (left <= 0 || el < 0) return 0;
  return Math.max(0, Math.min(1, el / CARD.fadeIn, left / CARD.fadeOut));
}

/* the beat's shape: 0 -> 1 -> 0 over BEAT.t (a sine hump). `left` counts down from BEAT.t. */
export function beatK(left) { const k = 1 - left / BEAT.t; return left <= 0 || k < 0 ? 0 : Math.sin(Math.PI * Math.min(1, k)); }
/* what to do on the kill: reduceMotion keeps the stinger only; `fast` (?nobeat=1, the bots' bypass) keeps the stinger and nothing that changes time or camera */
export function beatPlan({ reduceMotion = false, fast = false } = {}) { const calm = !!(reduceMotion || fast); return { stinger: true, slow: calm ? 0 : BEAT.slow, push: calm ? 0 : BEAT.push, zoom: calm ? 0 : BEAT.zoom }; }
