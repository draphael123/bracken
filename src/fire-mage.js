// src/fire-mage.js - THE GOBLIN FIRE MAGE (claude/pyroboss2, Daniel 11-01 09:05 #4 "NEW FOE: GOBLIN FIRE MAGE, usable in other levels too" + 09:07 recs
// approved; scratch/brief-pyroboss2-firemage-1101.md). The game had no pyro foe. He is the GOBLIN MAGE's proven AI (src/main.js updateGobMage: keeps
// MAGE.near-MAGE.far (90-150 px) off you, one told cast at a time, a blow in a windup throws it off) under a skin, cnSkin 'firemage' on t 'gobmage' -
// and, for the road past the Goblin Queen where no living goblin may stand (the THEME FIT rule), the same machine as a man: cnSkin 'cinderacolyte'.
//   THE FIRE BOLT   'lobTell' (a yellow !, FM.lobTell s: the staff drawn back, the flame gathering on its tip) -> a ball of fire LOBBED to where you stand.
//                   A shield takes it, the pyromancer's ward melts it. Where it lands: A BURNING PATCH (FM.patch) that burns foes and you standing in it.
//                   IT SPREADS ONLY ON WHAT BURNS: in the Burning Village it lights the village's fire grid (src/fire-spread.js: thatch, timber, hay -
//                   SPREADERS has 'firemage'); elsewhere it runs along open GRASSY ground a tile each way, FM.patch.hops at most (the rule her own fire
//                   follows, main.js THE GRASS CATCHES) - never indoors, never over water, never on stone. WATER puts a patch out.
//   THE FLAME WARD  'flameWard' (no windup: a guard). You rush him (inside FM.ward.near and coming at him or swinging) -> a dome of fire FM.ward.t s: your
//                   blows are TURNED (clank, WARDED) and touching it burns you once. Then it gutters and he is SPENT FM.ward.spent s: helpless, x FM.mul.
//   DOUSED          'doused' (FM.douse s): a thrown bucket/jug, the POUR, or wading into water - his staff goes out in steam, the word DOUSED, no casts,
//                   no ward, x FM.mul. Then it relights (told: a flare off the tip).
// PURE: numbers and the small rules. src/fire-mage-hands.js binds them (the bolt in flight, the patches, the water, the drawing); main.js updateGobMage
// runs the modes. tools/fire-mage.mjs proves it.
export const FIRE_SKINS = new Set(['firemage', 'cinderacolyte']);
export const FIRE_SKIN = 'firemage', ACOLYTE_SKIN = 'cinderacolyte';
export const isFireMage = e => !!e && e.t === 'gobmage' && FIRE_SKINS.has(e.cnSkin);
export const FM = {
  lobTell: 0.7, lobCd: 3.4, lobT: 0.75, lobG: 520, lobDmg: 9, lobR: 5,      // the bolt: its tell, its cooldown, its flight time (s), gravity, the blow, its radius
  patch: { w: 28, life: 5, tick: 0.5, foe: 5, hero: 4, heroTick: 0.6, hops: 3, hopT: 0.9 },   // the burning patch where it lands; on grass it runs a tile each way, hops times
  ward: { near: 44, t: 0.5, spent: 1.2, cd: 5, scorch: 5, gutter: 0.18 },   // the ward pop when rushed: its reach, how long, the spent window after, its cooldown, the burn
  douse: { t: 3 },                                                         // doused: this long
  mul: 1.5,                                                                // spent or doused: every blow x this
};
/* the lob's launch: a ballistic arc from (sx, sy) to (tx, ty) in T seconds under gravity g */
export function lobVel(sx, sy, tx, ty, g = FM.lobG, T = FM.lobT) { return { vx: (tx - sx) / T, vy: (ty - sy) / T - 0.5 * g * T }; }
/* the flight time for a target dx away: longer for further, so a near lob is not a flat line */
export const lobTime = dx => Math.max(0.5, Math.min(1.0, 0.45 + Math.abs(dx) / 300));
/* should he pop his ward? you are close, level with him, and coming at him or swinging */
export function rushed(e, P) {
  const dx = P.x - e.x, ad = Math.abs(dx);
  if (ad > FM.ward.near || Math.abs(P.y - e.y) > 30 || P.dead) return false;
  const coming = Math.sign(P.vx || 0) === -Math.sign(dx) && Math.abs(P.vx || 0) > 40;
  return coming || (P.atk >= 0 && P.atk < 0.12) || (P.dodge > 0);
}
/* a patch, one frame: who it burns ([{ x, y, w }] for foes and heroes; a tick each, its own clock per kind) - the bandit mystic's lamp fire's rule */
export function newPatch(x, y, gen = 0) { return { x, y, t: FM.patch.life, life: FM.patch.life, foeK: 0, heroK: 0, out: false, gen, hopK: FM.patch.hopT, hopped: false }; }
export function patchStep(f, foes, heroes, dt) {
  const F = FM.patch, res = { foes: [], heroes: [], hop: false }; if (f.out) return res; f.t -= dt; if (f.t <= 0) { f.out = true; return res; }
  const inIt = q => Math.abs(q.x - f.x) < F.w / 2 + (q.w || 10) / 2 - 2 && q.y > f.y - 16 && q.y <= f.y + 4;
  f.foeK -= dt; if (f.foeK <= 0) { res.foes = foes.filter(inIt); if (res.foes.length) f.foeK = F.tick; }
  f.heroK -= dt; if (f.heroK <= 0) { res.heroes = heroes.filter(inIt); if (res.heroes.length) f.heroK = F.heroTick; }
  if (!f.hopped && f.gen < F.hops) { f.hopK -= dt; if (f.hopK <= 0) { f.hopped = true; res.hop = true; } }
  return res;
}
/* the multiplier on a blow while he is helpless (spent or doused) */
export const takeMul = e => (e.mode === 'spent' || e.mode === 'doused') ? FM.mul : 1;
/* THE LINES HE SAYS (src/hint-lines.js routes them to the hint box) */
export const FM_SAY = ['DOUSED', 'WARDED', 'SPENT', 'GOBLIN FIRE MAGE: WATER PUTS HIS STAFF OUT', 'HIS FIRE CATCHES ON THE GRASS', 'HIS STAFF RELIGHTS', 'PUT OUT'];
