// src/order-paladin.js - THE ORDER PALADIN and THE UNDEAD PALADIN: ONE AI, TWO SKINS (claude/church3; Daniel 10-17 "new paladin/undead foes reused elsewhere";
// scratch/brief-church3-1017.md 3 + brief-crusader2-1016.md item 2 - the Crusader's rule taught on a common foe).
//
// WHAT IT IS: a shield-and-mace knight of the Paladins' order under a DIVINE SHIELD - a skin of light round him (drawn: a pale dome, his shield's boss lit).
//   'orderpaladin' (LIVING, the order's men on the road - Waymeet, the church road, Stormhold, Highcrown): his shield is WHOLE - nothing gets through it (x0: the
//      Crusader family's one exception to the resist floor, design standard B15 note) - but he OFFERS THE GLEAM every few seconds, so the break is always on offer.
//   'deadpaladin' (UNDEAD, the fallen of the order - the Lit Church's crypt and cellars, the Burial Caverns, Buried City, the Silk Undercroft, the haunted manor):
//      his shield is CRACKED - a blow bites through at OPL.cracked (B15: >= 0.4) - and the holy light he forswore hurts it.
// THE BREAK (his counter, both skins): the GLEAMED STRIKE - before his overhead a white star flashes on his shield (told: the gleam + a yellow !): PARRY IT (the
//   perfect guard, on the beat) and the shield SHATTERS - OPL.broken s whole (x1), staggered OPL.stun s at once (B4), then a told mend (OPL.mendT s: the light
//   creeping back over him) and it stands again. A plain shield block turns the blow but breaks nothing. THE UNDEAD's second door (holy light/flame,
//   src/flame.js FIGHT): a blow struck with a FLAME IN THE HAND (the church's taper, Waymeet's votive taper) cracks his shield open too.
// HIS MOVES (each its own windup + release frame - B16 - and a mark; one windup at a time):
//   SHIELD BASH  !   the shield driven out at your chest (a shield turns it)                    answer: block / back off
//   THE GLEAM    !   the overhead mace, the star on his shield first (a shield turns it; ON THE BEAT it is the break)   answer: PARRY it
// PURE: no DOM, no main.js. step(e, dt, X) with X = { heroes(), strike(e, box, dmg, name, o) -> 'parry' | 'block' | 'hit' | null, walk(e, dx) -> moved px (never off an
//   edge), fall(e, dt), number(x, y, line, col), mark(e, m), sfx, burst(...) }; take(e, dmg, X, o) -> the damage that lands (o: { flame }).
export const OPL = { hp: { orderpaladin: 110, deadpaladin: 64 }, w: 14, h: 26, notice: 190, walk: 38, keep: 28, cd: [1.1, 1.6],
  bash: { tell: 0.55, t: 0.2, reach: 30, dmg: 12 }, gleam: { tell: 0.8, t: 0.24, reach: 34, dmg: 18, every: 2, maxGap: 6 },
  cracked: 0.4, whole: 0, broken: 4.5, stun: 1.0, mendT: 0.9, recover: 0.5 };
export const OPL_T = new Set(['orderpaladin', 'deadpaladin']);
export const isPaladinFoe = e => !!e && OPL_T.has(e.t);
export const undead = e => !!e && e.t === 'deadpaladin';
export const MOVES = { bashTell: { mark: '!', answer: 'block' }, gleamTell: { mark: '!', answer: 'block' } };
export const NAME = { bash: 'A SHIELD BASH', gleam: 'THE GLEAMED MACE' };
/* FRAMES (src/redraw/church3_foes_art.js bakes them in this order; the last is his hurt): 0 idle | 1,2 walk | 3 bash windup | 4 bash release | 5 gleam windup (the mace
   up, the star on the shield) | 6 gleam release | 7 shattered (staggered, the shield arm flung wide) | 8 mending (kneeling, the light creeping back) | 9 hurt */
export const FRAMES = 10;
export function oplFrame(e) { switch (e.mode) {
  case 'bashTell': return 3; case 'bash': return 4; case 'gleamTell': return 5; case 'gleam': return 6; case 'shattered': return 7; case 'mend': return 8; }
  if (e.hurtT > 0) return 9; return Math.abs(e.vx || 0) > 3 ? 1 + Math.floor((e.anim || 0) * 6) % 2 : 0; }

export function newPaladinFoe(e) { Object.assign(e, { mode: 'keep', modeT: 0, cd: 1 + Math.random() * 0.6, swings: 0, sinceGleam: 0, shield: 1, brokenT: 0, anim: Math.random() * 3, opl: { breaks: 0, parryBreaks: 0, flameBreaks: 0, gleams: 0, bashes: 0 } }); return e; }
const nearest = (e, X) => { let b = null, d = 1e9; for (const p of X.heroes()) { if (p.dead) continue; const q = Math.abs(p.x - e.x) + Math.abs(p.y - e.y) * 2; if (q < d) { d = q; b = p; } } return b; };
function shatter(e, X, why) { e.shield = 0; e.brokenT = OPL.broken; e.mode = 'shattered'; e.modeT = OPL.stun; e.vx = 0; e.opl.breaks++; if (why === 'flame') e.opl.flameBreaks++; else e.opl.parryBreaks++;
  if (X.sfx) (X.sfx.crack || X.sfx.clank || (() => {}))(); if (X.burst) X.burst(e.x, e.y - 16, 12, ['#ffffff', '#fff6c8', '#c8d8ff'], 80, 0.5);
  X.number(e.x, e.y - 36, why === 'flame' ? 'THE FLAME CRACKS HIS SHIELD' : 'ON THE GLEAM: HIS SHIELD SHATTERS', '#8fd160'); }

export function stepPaladinFoe(e, dt, X) {
  e.anim = (e.anim || 0) + dt; e.modeT -= dt; e.sinceGleam = (e.sinceGleam || 0) + dt; X.fall(e, dt);
  if (e.brokenT > 0) { e.brokenT -= dt; if (e.brokenT <= 0 && e.mode !== 'mend') { e.mode = 'mend'; e.modeT = OPL.mendT; e.vx = 0; X.number(e.x, e.y - 36, 'THE LIGHT CREEPS BACK OVER HIM', '#ffd36b'); } }
  if (e.stagger > 0 && e.mode !== 'shattered') { e.vx = 0; return; }
  const P = nearest(e, X); if (!P) { e.vx = 0; return; }
  const dx = P.x - e.x, ad = Math.abs(dx), same = Math.abs(P.y - e.y) < 30, f = e.face || 1;
  const box = reach => [f > 0 ? e.x - 4 : e.x - reach, f > 0 ? e.x + reach : e.x + 4, e.y - 24, e.y];
  switch (e.mode) {
    case 'shattered': e.vx = 0; if (e.modeT <= 0) { e.mode = 'keep'; e.modeT = 0; e.cd = 0.6; } return;
    case 'mend': e.vx = 0; if (e.modeT <= 0) { e.shield = 1; e.brokenT = 0; e.mode = 'keep'; e.cd = 0.8; X.number(e.x, e.y - 36, 'HIS SHIELD STANDS AGAIN', '#9ab0c0'); } return;
    case 'bashTell': e.vx = 0; if (e.modeT <= 0) { e.mode = 'bash'; e.modeT = OPL.bash.t; if (X.sfx && X.sfx.slash) X.sfx.slash(); } return;
    case 'bash': e.vx = 0; X.strike(e, box(OPL.bash.reach), OPL.bash.dmg, NAME.bash, { blockable: true, key: 'ob' + e.swings }); if (e.modeT <= 0) { e.mode = 'keep'; e.modeT = OPL.recover; e.cd = OPL.cd[0] + Math.random() * (OPL.cd[1] - OPL.cd[0]); } return;
    case 'gleamTell': e.vx = 0; if (e.modeT <= 0) { e.mode = 'gleam'; e.modeT = OPL.gleam.t; if (X.sfx && X.sfx.heavy) X.sfx.heavy(); } return;
    case 'gleam': { e.vx = 0; const r = X.strike(e, box(OPL.gleam.reach), OPL.gleam.dmg, NAME.gleam, { blockable: true, key: 'og' + e.swings });
      if (r === 'parry' && e.shield) { shatter(e, X, 'parry'); return; }
      if (r === 'block' && e.shield && !e.toldBlock) { e.toldBlock = 1; X.number(e.x, e.y - 36, 'A SHIELD TURNS IT: PARRY THE GLEAM TO BREAK HIM', '#ffd36b'); }
      if (e.modeT <= 0) { e.mode = 'keep'; e.modeT = OPL.recover; e.cd = OPL.cd[0] + Math.random() * (OPL.cd[1] - OPL.cd[0]); } return; }
  }
  /* KEEP: close to a mace's reach and pick a blow - every OPL.gleam.every-th blow (or none in OPL.gleam.maxGap s) is the GLEAM, while his shield stands */
  if (ad > OPL.notice || !same) { e.vx = 0; return; }
  e.face = Math.sign(dx) || f; e.cd -= dt;
  if (ad > OPL.keep + 4) { const m = X.walk(e, Math.sign(dx) * OPL.walk * dt); e.vx = m ? Math.sign(dx) * OPL.walk : 0; } else e.vx = 0;
  if (e.cd > 0 || e.modeT > 0 || ad > OPL.gleam.reach + 12) return;
  e.swings++; const gl = e.shield && (e.swings % OPL.gleam.every === 0 || e.sinceGleam > OPL.gleam.maxGap);
  if (gl) { e.mode = 'gleamTell'; e.modeT = OPL.gleam.tell; e.sinceGleam = 0; e.opl.gleams++; X.mark(e, '!'); if (!e.toldGleam) { e.toldGleam = 1; X.number(e.x, e.y - 40, 'THE GLEAM ON HIS SHIELD: PARRY IT', '#ffd36b'); } }
  else { e.mode = 'bashTell'; e.modeT = OPL.bash.tell; e.opl.bashes++; X.mark(e, '!'); }
}
/* A BLOW ON HIM: his divine shield - whole (living: x0) or cracked (undead: x OPL.cracked); shattered, whole. A flame in the striking hand cracks the undead's open */
export function takePaladinFoe(e, dmg, X, o = {}) {
  if (!e.shield) return dmg;
  if (undead(e) && o.flame) { shatter(e, X, 'flame'); return dmg; }
  if (!e.toldShield) { e.toldShield = 1; X.number(e.x, e.y - 36, undead(e) ? 'HIS CRACKED SHIELD: PARRY THE GLEAM, OR BRING A FLAME' : 'HIS DIVINE SHIELD: PARRY THE GLEAM', '#ffd36b'); }
  return Math.round(dmg * (undead(e) ? OPL.cracked : OPL.whole));
}
