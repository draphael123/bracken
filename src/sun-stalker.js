// src/sun-stalker.js - THE SUN-SHADE STALKER, THE BANDIT KSAR 3's ONE NEW FOE (claude/ksar3, the OPUS GREYBOX, 11-06). Pure: no DOM, no main.js;
// src/ksar3-hands.js binds it. Plan: scratch/plan-desert-1105.md s1.7 + s3c (Daniel approved 11-05 14:07): the lategame2 SHADE counter = THE MIRAGE RULE WIRED
// (src/desert-rules.js MIRAGE via src/mirage-kit.js stalkerLook): INVISIBLE IN THE GLARE, PLAIN IN AWNING SHADE, A 0.4 s SHIMMER BEFORE IT COMMITS.
//
// WHO: a ksar knife-man in sun-bleached robes who waits on the white roofs where the glare hides him (a heat-haze outline, alpha 0.08). He comes at you
// along his roof; he NEVER strikes untold - first he SHIMMERS for STALK.commit s (the haze thickens round him: the read), then he lunges. Under cloth (an
// awning's shade, a roof over you) he is a plain man, readable at any distance, and slower to commit (STALK.shadeCommit - he does not like being seen).
// THE PLAY: fight him under the awnings (lure him into the shade) or watch the glare for the shimmer and answer it (block / step back / strike first).
// He keeps to his roof (x0..x1 from the level data): never walks off a lip. No mash: one told lunge at a time, a recover after each.
// AI is its own (A9: the level's one new foe). Its numbers sit at a fort bandit's weight (the Ksar hits hard: L.foeHit).
import { stalkerLook, MIRAGEKIT } from './mirage-kit.js';

export const STALK = {
  hp: 64, w: 10, h: 18, markH: 30,
  sight: 130, sightY: 40, walk: 54, keep: 20, reach: 30, lungeV: 210, lunge: 0.16, commit: MIRAGEKIT.stalker.commit, shadeCommit: 0.55, recover: 0.7, cd: 0.6,
  dmg: 22, glareDmgK: 1.0,
};
export const MOVES = { commit: { mark: '!', answer: 'block', pose: ['skCommit', 'skLunge'], sound: 'shimmer' } };

export function newStalker(x, y, o = {}) { return { x, y, face: o.face || -1, x0: o.x0 ?? x - 80, x1: o.x1 ?? x + 80, mode: 'lurk', t: 0, commitT: 0, cd: 0, key: 0, seen: false, n: { commits: 0, lunges: 0, hits: 0, inShade: 0, inGlare: 0 } }; }

/* ONE FRAME. st = its machine, e = the ent (e.x, e.y, e.alive, e.hurt), hero = { x, y, alive }, c = { exposure(x, y) -> 'shade' | 'sun' | 'hot' | 'none',
   hit(box, dmg, o) -> landed, number, sound } . Returns its look { alpha, shimmer, telling } for the draw */
export function stepStalker(st, e, dt, hero, c) {
  const exp = c.exposure ? c.exposure(e.x, e.y - 9) : 'sun', shade = exp === 'shade' || exp === 'none' || exp === 'water';
  if (shade) st.n.inShade += dt; else st.n.inGlare += dt;
  st.t -= dt; st.cd = Math.max(0, st.cd - dt);
  const dx = hero && hero.alive ? hero.x - e.x : 1e9, ad = Math.abs(dx), sees = hero && hero.alive && ad < STALK.sight && Math.abs(hero.y - e.y) < STALK.sightY;
  const clampRoof = x => Math.max(st.x0, Math.min(st.x1, x));
  if (e.hurt > 0 && st.mode === 'commit') { st.mode = 'recover'; st.t = STALK.recover * 0.6; st.commitT = 0; }   /* struck in the shimmer: it breaks his lunge (strike first is an answer) */
  switch (st.mode) {
    case 'lurk': if (sees) { st.mode = 'stalk'; st.t = 0.4; if (!st.seen) { st.seen = true; if (c.said) c.said(shade ? 'shade' : 'glare', e); } } break;
    case 'stalk': {
      if (!sees) { st.mode = 'lurk'; break; }
      st.face = Math.sign(dx) || st.face;
      if (ad > STALK.keep) e.x = clampRoof(e.x + Math.sign(dx) * STALK.walk * dt);
      if (ad < STALK.reach + 8 && st.cd <= 0 && st.t <= 0) { st.mode = 'commit'; st.t = shade ? STALK.shadeCommit : STALK.commit; st.commitT = 0; st.n.commits++; st.key++; if (c.sound) c.sound('shimmer'); if (c.mark) c.mark('!'); }
      break; }
    case 'commit': st.commitT += dt; if (st.t <= 0) { st.mode = 'lunge'; st.t = STALK.lunge; st.commitT = 0; st.n.lunges++; if (c.sound) c.sound('slash'); } break;
    case 'lunge': {
      e.x = clampRoof(e.x + st.face * STALK.lungeV * dt);
      const f = st.face, box = [f > 0 ? e.x - 4 : e.x - STALK.reach, f > 0 ? e.x + STALK.reach : e.x + 4, e.y - 18, e.y];
      if (c.hit && c.hit(box, STALK.dmg, { key: 'sk' + st.key, blockable: true, name: 'THE STALKER' })) st.n.hits++;
      if (st.t <= 0) { st.mode = 'recover'; st.t = STALK.recover; st.cd = STALK.cd; }
      break; }
    case 'recover': if (st.t <= 0) st.mode = sees ? 'stalk' : 'lurk'; break;
  }
  e.face = st.face;
  return look(st, exp);
}
/* HIS LOOK: mirage-kit's stalkerLook (0.08 in the glare, 1 in shade, partly in plain sun) - and he is PLAIN while he recovers (a man who just lunged) */
export function look(st, exp) {
  const L = stalkerLook(exp === 'none' ? 'shade' : exp, st.mode === 'commit' ? Math.max(0.01, st.commitT) : 0);
  if (st.mode === 'recover' || st.mode === 'lunge') return { alpha: Math.max(L.alpha, 0.85), shimmer: 0, telling: false };
  return L;
}
