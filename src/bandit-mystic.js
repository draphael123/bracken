// src/bandit-mystic.js - THE BANDIT MYSTICS (claude/djinn2: THE WELL TOWN's one new foe, Daniel 10-03). The Gang Leader's men fouled the windlass to
// keep the Djinn down; a CULT inside his band - the mystics - went under the Kasbah to the binding works and chant at the seals to FREE him. Two kinds,
// both the GOBLIN MAGE's proven AI (src/main.js updateGobMage: keep 90-150 px off you, a told bolt, a told rune; a blow in a windup throws it off)
// under a man's skin (cnSkin), with a twist that is the level's verb:
//   THE CASTER (cnSkin 'banditmystic')   throws a told SAND BOLT (yellow !: strike it back, or take it on a shield) and writes a sand RUNE under you
//                                        (red !!: step off). The mage's machine as it is.
//   THE LAMP-BEARER (cnSkin 'lampbearer') does not bolt: he holds up his LAMP, and its WARDING LIGHT halves every blow on any foe inside it (not on
//                                        himself: he is the one to kill first). Drawn: a warm circle on the world, and a WARD PIP over a warded foe.
//                                        He lifts it for a told FLARE (the mage's rune, red !!: a burst of lamp-fire under you). Two answers:
//                                          POUR on the lamp (the water verb: E with a sip, the lamp in front of you) - it goes out, the ward is gone;
//                                          KILL HIM - the lamp DROPS, still lit (still warding where it lies), and you can PICK IT UP (E) and THROW it
//                                          (ATTACK: src/throwables.js THROW_KIND.lamp) - it bursts where it lands: a blow to what it hits and a LAMP
//                                          FIRE on the floor that burns foes standing in it (and you). Water puts that out too. It foreshadows the
//                                          Djinn's fire phase.
// PURE: no DOM, no main.js. src/bandit-mystic-hands.js binds it; tools/bandit-mystic.mjs proves it.

export const MYSTIC_SKIN = 'banditmystic', BEARER_SKIN = 'lampbearer';
export const MYSTIC = {
  wardR: 72, wardMul: 0.5,                 /* THE WARDING LIGHT: px round the lamp; a blow on a foe inside it lands x wardMul */
  pourR: 60, takeR: 16,                    /* a pour reaches a lamp this far ahead; E picks a lying lamp up from this close */
  hitR: 12, hitDmg: 26, splashR: 26,       /* a thrown lamp: what it bursts on, and the blow (to it and within splashR) */
  fire: { life: 6, w: 30, tick: 0.5, foe: 7, hero: 3, heroTick: 0.6 },   /* THE LAMP FIRE where it bursts: burns foes (and you) standing in it */
};
/* the lamp's hanging point for a bearer facing `face` at (x, y feet) - held out, or lifted for the flare */
export const lampPoint = (e, LAMP_AT) => ({ x: e.x + (e.face || 1) * LAMP_AT.dx, y: e.y + (e.mode === 'runeTell' || e.mode === 'rune' ? LAMP_AT.up : LAMP_AT.dy) });
export function newLamp(bearer) { return { bearer, x: bearer.x, y: bearer.y - 20, lit: true, state: 'held', vx: 0, vy: 0, doused: false, thrKind: 'lamp' }; }
/* does this lamp ward right now: lit, and held up by its bearer or lying lit on the floor (carried by a hero or flying, it wards nobody) */
export const lampWards = l => l.lit && (l.state === 'held' || l.state === 'rest');
/* the lamp that wards foe e (its centre inside wardR of a warding lamp), or null. A bearer is never warded by his own lamp */
export function wardOf(lamps, e) {
  const cy = e.y - (e.h || 16) / 2;
  for (const l of lamps) { if (!lampWards(l) || l.bearer === e) continue; if (Math.hypot(e.x - l.x, cy - l.y) <= MYSTIC.wardR) return l; }
  return null;
}
export function wardDamage(lamps, e, dmg) { return wardOf(lamps, e) ? dmg * MYSTIC.wardMul : dmg; }
/* THE POUR: the near lit lamp in front of a hero facing `face` at (x, y feet), inside pourR, at his height (held up or lying) */
export function pourLamp(lamps, x, y, face) {
  let best = null, bd = 1e9;
  for (const l of lamps) { if (!l.lit || (l.state !== 'held' && l.state !== 'rest')) continue; const d = (l.x - x) * (face || 1); if (d < -6 || d > MYSTIC.pourR) continue; if (l.y < y - 46 || l.y > y + 6) continue; if (d < bd) { bd = d; best = l; } }
  return best;
}
/* E on a lamp at your feet: the near lying one */
export function takeLamp(lamps, x, y) { return lamps.find(l => l.state === 'rest' && Math.abs(l.x - x) <= MYSTIC.takeR && Math.abs(l.y - y) <= 14) || null; }
/* a lamp fire, one frame: who it burns (foes and heroes [{ x, y, w }]; a tick each, its own clock per kind) */
export function newFire(x, y) { return { x, y, t: MYSTIC.fire.life, life: MYSTIC.fire.life, foeK: 0, heroK: 0, out: false }; }
export function fireStep(f, foes, heroes, dt) {
  const F = MYSTIC.fire, res = { foes: [], heroes: [] }; if (f.out) return res; f.t -= dt; if (f.t <= 0) { f.out = true; return res; }
  const inIt = q => Math.abs(q.x - f.x) < F.w / 2 + (q.w || 10) / 2 - 2 && q.y > f.y - 16 && q.y <= f.y + 4;
  f.foeK -= dt; if (f.foeK <= 0) { res.foes = foes.filter(inIt); if (res.foes.length) f.foeK = F.tick; }
  f.heroK -= dt; if (f.heroK <= 0) { res.heroes = heroes.filter(inIt); if (res.heroes.length) f.heroK = F.heroTick; }
  return res;
}
