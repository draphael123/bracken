// src/lesser-djinn.js - THE LESSER DJINN (claude/djinn3, Daniel 10-04: "MINI DJINN as a prelude ... they teach the boss's verbs"). Small whirling spirits
// loosed from the Great Well's djinn as the bandit mystics crack his seals - his two verbs, small, met on the way down to him:
//   THE SAND SPIRIT (cnSkin 'sanddjinn')   a little whirl of sand: a blade PASSES THROUGH it (told). POUR your skin on it and it turns to MUD - it drops to
//                                          the floor and crawls, and a blade cuts it. Left alone it dries back to sand (LD.openT) and whirls up again.
//   THE FIRE SPIRIT (cnSkin 'firedjinn')   a little whirl of flame: its fire TURNS a blade (told). POUR on it and it is DOUSED - smoke and clay on the floor,
//                                          and a blade cuts it; left alone it catches again.
// NOT A NEW FOE (the level's one-new-foe rule: the bandit mystic is the Well Town's): both are THE WILL-O'-THE-WISP's proven AI (src/canal-foes.js
// stepWisp - the canal's wisp, itself the ember wisp's body and AI: it drifts on a wide circle, stops close to you, gutters on a yellow ! and darts;
// only the dart hurts) under the djinn's skins, with the level's verb as the twist. The canal comes before the Well Town on the gate chain, so the AI is
// one the player has met (tools/one-new-foe.mjs). They die in their own skins (cnSkin + DF2_CORPSE), have their own bestiary cards, and are not goblins.
// PURE: no DOM, no main.js. src/lesser-djinn-hands.js binds it; no dedicated proof tool was committed with this lane (tools/djinn3-shots.mjs only photographs them); tools/one-new-foe.mjs checks the one-new-foe rule.

export const SAND_SKIN = 'sanddjinn', FIRE_SKIN = 'firedjinn';
export const LD = {
  hp: 30,           /* a cut or two once it is open: the spirit is a lesson, not a wall */
  openT: 5.0,       /* MUD / DOUSED: this long on the floor, cuttable, before it whirls up again */
  crawl: 14,        /* px/s: open, it crawls toward you along the floor (it cannot hurt you while it does) */
  fall: 420,        /* px/s^2: open, it drops to the floor */
  pourR: 60,        /* a pour reaches a spirit this far in front of you */
  rise: 0.6,        /* s: re-forming, it lifts back off the floor (no dart until it has) */
};
export const isLesser = e => !!e && e.t === 'willowisp' && (e.cnSkin === SAND_SKIN || e.cnSkin === FIRE_SKIN);
export const ldOpen = e => !!e && (e.ldOpen || 0) > 0;
/* A BLOW ON IT: whole while it is open (mud, doused), nothing otherwise */
export const ldTake = (e, dmg) => (ldOpen(e) ? dmg : 0);
/* THE POUR: the nearest living spirit in front of a hero at (x, y feet) facing `face` - not already open - inside LD.pourR, at about his height */
export function ldPourAim(foes, x, y, face) {
  let best = null, bd = 1e9;
  for (const e of foes) { if (!isLesser(e) || !e.alive || ldOpen(e)) continue; const d = (e.x - x) * (face || 1); if (d < -8 || d > LD.pourR) continue; if (Math.abs(e.y - (y - 12)) > 34) continue; if (d < bd) { bd = d; best = e; } }
  return best;
}
/* OPEN IT: the pour landed (it drops and crawls) */
export function ldOpenUp(e) { e.ldOpen = LD.openT; e.dartCd = 0; e.cd = 0; e.mode = e.cnSkin === SAND_SKIN ? 'mud' : 'doused'; e.modeT = 0; e.vx = 0; e.vy = 0; e.ldVy = 0; e.ldRise = 0; }
/* ONE FRAME WHILE IT IS OPEN (or re-forming). w = { solidBelow(x, y) -> floor y or null, heroX }. Returns true while it owns the frame (the wisp's AI waits) */
export function ldStep(e, dt, w) {
  if (e.ldRise > 0) { e.ldRise -= dt; e.y -= 30 * dt; if (e.ldRise <= 0) { e.ldRise = 0; e.mode = 'bob'; e.recoil = 0.8; e.dartCd = 1.6; e.hx = e.x; e.hy = e.y; } return true; }
  if (!ldOpen(e)) return false;
  e.ldOpen = Math.max(0, e.ldOpen - dt);
  const fy = w.solidBelow(e.x, e.y);
  if (fy == null || e.y < fy - 0.5) { e.ldVy = (e.ldVy || 0) + LD.fall * dt; e.y = fy == null ? e.y + e.ldVy * dt : Math.min(fy, e.y + e.ldVy * dt); }
  else { e.y = fy; e.ldVy = 0; const d = w.heroX - e.x; if (Math.abs(d) > 10) { const nx = e.x + Math.sign(d) * LD.crawl * dt; if (w.solidBelow(nx, e.y) != null && !w.wallAt(nx + Math.sign(d) * 5, e.y - 4)) e.x = nx; } }
  if (e.ldOpen <= 0) { e.mode = 'reform'; e.ldRise = LD.rise; }
  return true;
}
