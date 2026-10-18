// src/undead-priest.js - THE UNDEAD PRIEST (claude/church3; Daniel 10-17 "new undead foes, reusable in other levels"; scratch/brief-church3-1017.md 3).
//
// WHAT IT IS: a dead cleric in a rotted chasuble, a bone censer swinging cold blue smoke. A CASTER that serves the dark: he keeps off you, and he
//   RAISES THE DEAD (a told rite: a wight claws up out of the floor beside him - at most UPR.raise.cap of his up at once), MENDS THEM (a told prayer: the dead near
//   him knit), SNUFFS THE LIGHTS near him (a told pinch: a lit lamp in his reach goes out - more dark, more dead, where the level keeps that rule), and between
//   them throws a GRAVE BOLT (a yellow !: a slow cold bolt at your chest - a shield turns it, a jump clears it).
// HIS COUNTER (src/flame.js FIGHT - the church's taper, Waymeet's votive taper, any carried flame): BRING A FLAME NEAR HIM (FIGHT.scare px) - whatever he is
//   casting breaks off and he FLEES from it (UPR.flee s), and he cannot cast again while it is near. A blow that lands cuts a cast too (he is committed while he
//   casts). Without a flame you must run him down through his dead.
// Every cast has its own windup + release frame (B16); the bolt wears !, the rites are quiet-but-told (the word, the glow, the pose).
// PURE: no DOM, no main.js. step(e, dt, X) with X = { heroes(), flameNear(x, y, r) -> hero | null, foes(), raise(e, x) -> foe | null, mend(foe, n), undead(foe), lights(x, r) ->
//   [{ id, x }] (lit lamps a hand can put out), snuff(id), strike(e, box, dmg, name, o) -> 'parry' | 'block' | 'hit' | null, solid(x, y), walk(e, dx) -> moved px (never off an edge), fall(e, dt), number(x, y, line, col),
//   mark(e, m), sfx }; take(e, dmg, X) -> the damage that lands (a cast cut).
export const UPR = { hp: 46, w: 12, h: 24, notice: 220, keep: [96, 150], walk: 40, flee: 2.2, fleeV: 78, scareCd: 2.6,
  bolt: { tell: 0.7, t: 0.25, v: 150, dmg: 14, life: 2.2, cd: 2.6 },
  raise: { tell: 1.4, t: 0.4, cap: 2, cd: 9, first: 2.5 },
  mend: { tell: 1.0, t: 0.35, r: 120, k: 0.3, cd: 7 },
  snuff: { tell: 0.8, t: 0.3, r: 140, cd: 6 } };
export const isDeadPriest = e => !!e && e.t === 'deadpriest';
export const MOVES = { boltTell: { mark: '!', answer: 'jump' }, raiseTell: { mark: '', answer: '' }, mendTell: { mark: '', answer: '' }, snuffTell: { mark: '', answer: '' } };
export const NAME = { bolt: 'A GRAVE BOLT' };
/* FRAMES (src/redraw/church3_foes_art.js): 0 idle | 1,2 walk | 3 bolt windup | 4 bolt release | 5 raise windup (arms down, the censer low) | 6 raise release (arms up) |
   7 mend windup (hands together) | 8 mend release (hands spread) | 9 snuff windup (a hand out, the fingers open) | 10 snuff release (the pinch) | 11 flee (cowering) | 12 hurt */
export const FRAMES = 13;
export function uprFrame(e) { switch (e.mode) {
  case 'boltTell': return 3; case 'bolt': return 4; case 'raiseTell': return 5; case 'raise': return 6; case 'mendTell': return 7; case 'mend': return 8;
  case 'snuffTell': return 9; case 'snuff': return 10; case 'flee': return 11; }
  if (e.hurtT > 0) return 12; return Math.abs(e.vx || 0) > 3 ? 1 + Math.floor((e.anim || 0) * 6) % 2 : 0; }
export function newDeadPriest(e) { Object.assign(e, { mode: 'keep', modeT: 0, boltCd: 1.4, raiseCd: UPR.raise.first, mendCd: 3, snuffCd: 2, scared: 0, raised: [], hp0: e.hp, anim: Math.random() * 3,
  upr: { bolts: 0, raises: 0, mends: 0, snuffs: 0, cut: 0, fled: 0 } }); return e; }
const CASTS = new Set(['boltTell', 'raiseTell', 'mendTell', 'snuffTell']);
const nearest = (e, X) => { let b = null, d = 1e9; for (const p of X.heroes()) { if (p.dead) continue; const q = Math.abs(p.x - e.x) + Math.abs(p.y - e.y) * 2; if (q < d) { d = q; b = p; } } return b; };
function flee(e, X, from) { const was = CASTS.has(e.mode); e.mode = 'flee'; e.modeT = UPR.flee; e.fleeDir = Math.sign(e.x - from.x) || -(e.face || 1); e.scared = UPR.scareCd; e.upr.fled++; if (was) e.upr.cut++;
  X.number(e.x, e.y - 34, was ? 'THE FLAME: HE BREAKS OFF AND FLEES' : 'HE FLEES THE FLAME', '#8fd160'); }

export function stepDeadPriest(e, dt, X) {
  e.anim = (e.anim || 0) + dt; e.modeT -= dt; X.fall(e, dt);
  for (const k of ['boltCd', 'raiseCd', 'mendCd', 'snuffCd', 'scared']) e[k] = Math.max(0, (e[k] || 0) - dt);
  e.raised = (e.raised || []).filter(q => q.alive);
  /* HIS BOLTS in the air: cold, slow, at your chest - a shield turns one, a jump clears it, a wall stops it */
  for (const b of e.bolts || []) { b.life -= dt; b.x += b.vx * dt; if (X.solid && X.solid(b.x, b.y)) b.life = 0;
    if (b.life > 0) { const r = X.strike(e, [b.x - 5, b.x + 5, b.y - 5, b.y + 5], UPR.bolt.dmg, NAME.bolt, { blockable: true, key: b.k, noKnock: true }); if (r) b.life = 0; } }
  e.bolts = (e.bolts || []).filter(b => b.life > 0);
  if (e.stagger > 0) { e.vx = 0; if (CASTS.has(e.mode)) { e.mode = 'keep'; e.upr.cut++; } return; }
  const P = nearest(e, X); if (!P) { e.vx = 0; return; }
  /* THE COUNTER: a flame near him - he breaks off and flees (and casts nothing while it is near) */
  const fl = X.flameNear(e.x, e.y, 72);
  if (fl && e.mode !== 'flee') { flee(e, X, fl); return; }
  const dx = P.x - e.x, ad = Math.abs(dx), same = Math.abs(P.y - e.y) < 60;
  switch (e.mode) {
    case 'flee': { const m = X.walk(e, e.fleeDir * UPR.fleeV * dt); e.vx = m ? e.fleeDir * UPR.fleeV : 0; e.face = e.fleeDir; if (!m) e.fleeDir = -e.fleeDir; if (e.modeT <= 0 && !fl) { e.mode = 'keep'; e.boltCd = Math.max(e.boltCd, 0.8); } return; }
    case 'boltTell': e.vx = 0; if (e.modeT <= 0) { e.mode = 'bolt'; e.modeT = UPR.bolt.t; e.upr.bolts++; (e.bolts = e.bolts || []).push({ x: e.x + (e.face || 1) * 8, y: e.y - 14, vx: (e.face || 1) * UPR.bolt.v, life: UPR.bolt.life, k: 'ub' + e.upr.bolts + '_' + Math.round(e.x) }); if (X.sfx && X.sfx.zap) X.sfx.zap(); } return;
    case 'raiseTell': e.vx = 0; if (e.modeT <= 0) { e.mode = 'raise'; e.modeT = UPR.raise.t; const q = X.raise(e, e.x + (Math.sign(dx) || 1) * 22); if (q) { e.raised.push(q); e.upr.raises++; X.number(e.x, e.y - 34, 'THE DEAD GET UP', '#ff6b6b'); } } return;
    case 'mendTell': e.vx = 0; if (e.modeT <= 0) { e.mode = 'mend'; e.modeT = UPR.mend.t; let n = 0; for (const o of X.foes()) if (o !== e && o.alive && X.undead(o) && Math.abs(o.x - e.x) < UPR.mend.r && o.hp < X.maxOf(o)) { X.mend(o, UPR.mend.k); n++; } if (n) { e.upr.mends++; X.number(e.x, e.y - 34, 'HIS DEAD KNIT', '#ff9a5c'); } } return;
    case 'snuffTell': e.vx = 0; if (e.modeT <= 0) { e.mode = 'snuff'; e.modeT = UPR.snuff.t; if (e.snuffId && X.snuff(e.snuffId)) { e.upr.snuffs++; X.number(e.x, e.y - 34, 'HE PINCHES THE LIGHT OUT', '#ff9a5c'); } e.snuffId = null; } return;
    case 'bolt': case 'raise': case 'mend': case 'snuff': e.vx = 0; if (e.modeT <= 0) { e.mode = 'keep'; e.modeT = 0.35; } return;
  }
  if (ad > UPR.notice || !same) { e.vx = 0; return; }
  e.face = Math.sign(dx) || e.face;
  /* KEEP OFF YOU: back away inside his range, close outside it */
  const [k0, k1] = UPR.keep; let mv = 0; if (ad < k0) mv = -Math.sign(dx); else if (ad > k1) mv = Math.sign(dx);
  if (mv) { const m = X.walk(e, mv * UPR.walk * dt); e.vx = m ? mv * UPR.walk : 0; } else e.vx = 0;
  if (e.modeT > 0 || e.scared > 0) return;
  /* HIS CASTS, in their order of want: raise (few of his up), mend (one of them hurt), snuff (a light in his reach), the bolt */
  const tell = (m, t, line) => { e.mode = m; e.modeT = t; e.vx = 0; const mv2 = MOVES[m]; if (mv2 && mv2.mark) X.mark(e, mv2.mark); if (line && !(e.told && e.told[m])) { e.told = e.told || {}; e.told[m] = 1; X.number(e.x, e.y - 34, line, '#ffd36b'); } };
  if (e.raiseCd <= 0 && e.raised.length < UPR.raise.cap) { e.raiseCd = UPR.raise.cd; tell('raiseTell', UPR.raise.tell, 'HE RAISES THE DEAD: BRING A FLAME, OR CUT HIM'); return; }
  if (e.mendCd <= 0 && X.foes().some(o => o !== e && o.alive && X.undead(o) && Math.abs(o.x - e.x) < UPR.mend.r && o.hp < X.maxOf(o) * 0.8)) { e.mendCd = UPR.mend.cd; tell('mendTell', UPR.mend.tell, 'HE MENDS HIS DEAD: CUT HIM'); return; }
  if (e.snuffCd <= 0) { const l = (X.lights ? X.lights(e.x, UPR.snuff.r) : [])[0]; if (l) { e.snuffCd = UPR.snuff.cd; e.snuffId = l.id; e.face = Math.sign(l.x - e.x) || e.face; tell('snuffTell', UPR.snuff.tell, 'HE REACHES FOR THE LIGHT: CUT HIM'); return; } }
  if (e.boltCd <= 0 && ad < UPR.keep[1] + 40) { e.boltCd = UPR.bolt.cd; tell('boltTell', UPR.bolt.tell, null); }
}
/* A BLOW ON HIM: whole (he is a caster); while he casts it cuts the cast */
export function takeDeadPriest(e, dmg, X) { if (CASTS.has(e.mode)) { e.mode = 'keep'; e.modeT = 0.3; e.upr.cut++; X.number(e.x, e.y - 34, 'THE RITE IS BROKEN', '#8fd160'); } return dmg; }
