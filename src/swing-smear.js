// src/swing-smear.js - THE LIGHT-CUT SMEAR (claude/juice2, J2; Daniel 11-10 "hit like Ocarina of Time 3D"; scratch/lane-reports/juice-plan.md J2).
// ART ONLY, behind JUICE2_SHIPS (off = smearOf returns null and nothing is drawn). One thin crescent (or, for a thrust, a streak) in the weapon's colour on frames 1-2 of
// EVERY hero's light cut: from the strike beat to the extended beat of the hero's own beat table (src/attack-animation.js beatsFor), so it rides the pose, not a second clock.
// Alpha .55 -> 0 over the cut; on a LANDED blow it SNAPS to full for the whole freeze (a hit reads brighter than a whiff). Pure maths here, the canvas calls are main.js drawLightSmear.
import { JUICE2_SHIPS } from './juice.js';
import { beatsFor } from './attack-animation.js';
/* per hero: col = [core, body] (weapon colour), r = the crescent's radius from his middle, w = the body's line width at its fattest (1-3 px), line = true when every cut is a thrust (a spear) */
export const SMEAR = {
  knight:    { col: ['#ffffff', '#dfe8ff'], r: 20, w: 3 },
  warden:    { col: ['#f2fff0', '#a8d89a'], r: 26, w: 2, line: true },
  pyro:      { col: ['#fff6c8', '#ff9a5c'], r: 19, w: 3 },
  paladin:   { col: ['#fff6c8', '#ffd36b'], r: 24, w: 3 },
  pirate:    { col: ['#ffffff', '#9fd6ff'], r: 18, w: 2 },
  reaper:    { col: ['#eef4fa', '#c0283a'], r: 28, w: 3 },
  geomancer: { col: ['#fff1c8', '#c9a05a'], r: 21, w: 3 },
  berserker: { col: ['#ffffff', '#ff7a3a'], r: 22, w: 3 },
  ranger:    { col: ['#f4fff0', '#7fd06a'], r: 15, w: 2 },
};
export const SMEAR_ALPHA = 0.55;   /* the whiff's peak; a hit holds 1 */
export const smearTable = hero => SMEAR[hero] || SMEAR.knight;
/* p = the hero's swing state { atk, combo, heavy, heavySwing, swingKind, swingRiposte, plunge, dashCut, dead }; hit = a blow of this swing landed (it snaps bright).
   Returns null (nothing to draw) or { k 0-1 through the smear, alpha, geom 'arc' | 'arcUp' | 'line', r, w, col, a0, head, tail, hit }. */
export function smearOf(hero, p, hit = false) {
  if (!JUICE2_SHIPS || !p || p.dead || !(p.atk >= 0) || p.heavy || p.heavySwing || p.swingKind || p.swingRiposte || p.plunge || p.dashCut) return null;
  const b = beatsFor(hero, p), t0 = b[0], t1 = b[2];
  if (p.atk < t0 || p.atk >= t1) return null;
  const S = smearTable(hero), k = (p.atk - t0) / (t1 - t0), cm = (p.combo || 1) % 3;
  const geom = cm === 0 || S.line ? 'line' : cm === 2 ? 'arcUp' : 'arc';
  const a0 = -1.25, head = a0 + 2.25 * Math.min(1, k * 1.6), tail = Math.max(a0, head - 1.3);
  return { k, alpha: hit ? 1 : SMEAR_ALPHA * (1 - k), geom, r: S.r, w: S.w, col: S.col, a0, head, tail, hit: !!hit };
}
/* the recovery's follow-through frame (art only): frame 0 (the spent weapon carried low) in the first half of the recovery, 1 after; a LANDED blow holds frame 0 about one frame longer */
export const followFrame = (ratio, hit = false) => ratio > (JUICE2_SHIPS && hit ? 0.35 : 0.5) ? 0 : 1;
/* did a blow of this swing land: the stamp main.js sets in the hit branch, still fresh, and not from an earlier swing */
export const swingHit = (p, now) => !!(p && p.smearHitT != null && now - p.smearHitT < 0.35 && p.atk >= (p.smearHitAtk || 0) - 0.001);
