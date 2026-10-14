// src/deacon.js - THE DEACON, LIT CHURCH 2's MINI (claude/church2; Daniel 10-10 brief section 3: "just a conception, we build next week" - built here).
// WHO: the church's lamplighter - a tall cleric with a long brass LAMPLIGHTER'S POLE (a snuffer hook one end, a flame the other). He keeps the lamps; the dark is
//   his enemy. PLACE: THE CROSSING, at the top of the crypt well - THE DARK RISES climb ends there, and he is waiting (a 4-lamp room: two floor sconces and two
//   chandeliers on chains). Before lamp three he tends them behind THE PARCLOSE (an iron grille off the piers): you only come into his room up the well.
// A DUELIST (B11): ALWAYS HITTABLE, GUARDS BY ANGLE - on guard he holds the pole crosswise HIGH: a blow from his front (at his height, or from a jump over him)
//   is turned (B15: x DC.guardTake, CLANK, "GUARDS HIGH: HIT LOW"); a LOW blow (the sweep: DOWN + X) or one from BEHIND lands whole; so does anything while he
//   is committed (his tells, his kindling, a reel).
// THE OPENING (B1, the level's rule - salvaged from the litchurch Paladin's light bar / falter): HIS LIGHT bar fills from his LIT LAMPS (DC.light.regen a second
//   each); SNUFF THEM (a blade through a sconce; a chandelier struck on its chain COMES DOWN - on him, if he stands under it) and blows that land drain it.
//   EMPTY, HE GROPES IN THE DARK: DC.gropeT s OPEN (B10: the gold ring + timer), x DC.gropeMul, at most DC.gropeCap of him; he stands still (B4); then a told
//   DC.wardT s WARD (B3) and his light comes back to DC.light.refill.
// MOVES (each told, one windup at a time; each its own windup + release pose - greybox shapes, the art lane draws them):
//   P1  POLE SWEEP   !   low along the floor (a shield turns it)                     answer: jump it
//       SNUFFER HOOK !   the hook out at your waist: it CATCHES and hauls you in, then the jab   answer: a shield, or roll / jump it
//       KINDLE       ~   (quiet: the word, a glow on the pole) he walks to a dark lamp and lights it again - committed: a blow that lands cuts it
//   P2 (< DC.p2) NEW MOVE: FLAME ARC !! he drags the pole's flame along the floor - a line of the church's HOLY FIRE for DC.arc.life s   answer: jump it, keep off it
// Mini numbers (B6): a duel ~40-75 s, modest health, 75-85% WITH FLASKS (self-tuned here: DIAL_EXEMPT), mash 0/6.
// PURE: no DOM, no main.js. The world is a context `c` (src/deacon-hands.js binds it). dcPlan is the boss lab's HUMAN bot (src/lab.js).

export const DC = {
  hp: 1500, w: 14, h: 40, markH: 58,
  walk: 58, keep: 48, turn: 0.45, gap: [0.5, 0.42],
  light: { max: 100, start: 85, regen: 2.2, drain: 8, drainHeavy: 14, lampDim: 18, refill: 60 },
  guardTake: 0.4, gropeT: 3.0, gropeMul: 1.8, gropeCap: 0.18, wardT: 3.0, reelT: 0.7,
  kindleT: 1.3, kindleCd: 6, kindleWalkT: 3,
  sweep: { tell: 0.55, t: 0.25, reach: 58, dmg: 26 },
  hook: { tell: 0.6, t: 0.3, reach: 92, dmg: 10, haul: 380, jabTell: 0.5, jab: 22 },
  arc: { tell: 0.8, t: 0.55, len: 128, life: 3.2, tick: 0.4, dmg: 9 },
  drop: { dmg: 0.07, stun: 1.2 },   /* a chandelier brought down on him: of his health, and the stagger (B4: he stands) */
  p2: 0.5,
};
export const CYCLES = { 1: [['sweep', 'hook', 'sweep'], ['hook', 'sweep', 'hook'], ['sweep', 'sweep', 'hook']], 2: [['arc', 'sweep', 'hook'], ['hook', 'arc', 'sweep'], ['sweep', 'hook', 'arc', 'sweep']] };
export const MOVES = { sweepTell: { mark: '!', answer: 'jump' }, hookTell: { mark: '!', answer: 'block' }, jabTell: { mark: '!', answer: 'block' }, arcTell: { mark: '!!', answer: 'jump' }, kindleTell: { mark: '', answer: '' } };
export const MOVE_NAME = { sweep: 'THE POLE SWEEP', hook: 'THE SNUFFER HOOK', jab: 'THE POLE', arc: 'THE FLAME ARC', fire: 'THE HOLY FIRE' };

/* ---------- ONE FIGHT ---------- */
export function newFight(G) { return { G, ph: 1, cycle: 0, step: 0, script: null, act: 0, light: DC.light.start, ward: 0, gropeTaken: 0, behindT: 0, starved: false, kindleCd: 2, fire: [], haul: null, told: {}, lastLight: DC.light.start,
  n: { gropes: 0, wards: 0, warded: 0, guarded: 0, landed: 0, low: 0, behind: 0, kindles: 0, kindlesCut: 0, lampsOut: 0, drops: 0, dropsOnHim: 0, sweeps: 0, hooks: 0, hauls: 0, arcs: 0, moves: {} } }; }
export const dPhase = e => (e.hp <= e.maxHp * DC.p2 ? 2 : 1);
export const dcOpen = e => !!e && e.mode === 'grope' && (e.open || 0) > 0;
const STRIKE = new Set(['sweep', 'hook', 'jab', 'arc']);
const GUARD_MODES = new Set(['walk', 'recover']);
/* HIS POLE, HIGH: a blow from his front at his height or from above him, while he is on guard - unless it is LOW (the sweep) */
export const guarded = (e, hx, hy, airborne, low) => !!e && !dcOpen(e) && !(e.broken > 0) && GUARD_MODES.has(e.mode) && (e.face || 1) * (hx - e.x) > -6 && !(low && !airborne) && Math.abs(hy - e.y) < 60;
const nextScript = S => { const set = CYCLES[S.ph]; return set[S.cycle % set.length].slice(); };
function setMode(e, m, t) { e.mode = m; e.modeT = t; }
const clampX = (G, x) => Math.max(G.x0 + 16, Math.min(G.x1 - 16, x));
const setLight = (S, v) => { S.light = Math.max(0, Math.min(DC.light.max, v)); };
function takeLight(S, n) { const was = S.light; setLight(S, S.light - n); if (S.light <= 0 && (was > 0 || true)) S.starved = true; }
function tell(e, S, c, mode, t) { setMode(e, mode, t); S.act++; S.n.moves[mode] = (S.n.moves[mode] || 0) + 1; const mv = MOVES[mode]; if (mv && mv.mark) c.mark(mv.mark); c.sound(mv && mv.mark === '!!' ? 'tellHard' : mv && mv.mark ? 'tell' : 'glow'); }
function grope(e, S, c) { setMode(e, 'grope', DC.gropeT + 0.05); e.open = DC.gropeT; S.gropeTaken = 0; S.starved = false; S.n.gropes++; S.haul = null; c.fx('open', e.x, e.y); c.sound('falter'); c.shake(3);
  c.number(e.x, e.y - 72, 'HIS LAMPS ARE OUT: HE GROPES IN THE DARK - STRIKE', '#8fd160'); }
function endGrope(e, S, c) { e.open = 0; S.ward = DC.wardT; S.n.wards++; setLight(S, DC.light.refill); c.fx('ward', e.x, e.y); c.sound('tell'); c.number(e.x, e.y - 72, 'HE FINDS HIS FLAME: HE IS WARDED', '#9ab0c0'); }

/* ---------- THE RULE ON HIM (the hands call these) ---------- */
/* A BLOW ON HIM from a hero at (hx, hy); low: the blow is a sweep. Returns { dmg, read } - 'guard' (his pole high turned it), 'ward', 'open', 'landed' */
export function blowOn(e, S, c, dmg, hx, hy, airborne, heavy, low) {
  if (!e || !e.alive || (e.mode === 'away' || e.mode === 'sleep') || e.mode === 'wake') return { dmg: 0, read: 'ward' };
  if (S.ward > 0) { S.n.warded++; return { dmg: 0, read: 'ward' }; }
  if (dcOpen(e)) { const cap = e.maxHp * DC.gropeCap - S.gropeTaken; const d = Math.max(0, Math.min(Math.round(dmg * DC.gropeMul), Math.round(cap))); S.gropeTaken += d; return { dmg: d, read: 'open' }; }
  if (guarded(e, hx, hy, airborne, low)) { S.n.guarded++; if (!S.told.guard || S.n.guarded % 4 === 0) { S.told.guard = 1; c.number(e.x, e.y - 64, 'HIS POLE GUARDS HIGH: HIT LOW', '#ffd36b'); } return { dmg: Math.max(1, Math.round(dmg * DC.guardTake)), read: 'guard' }; }
  S.n.landed++; if (low && !airborne) S.n.low++; else if ((e.face || 1) * (hx - e.x) < -6) S.n.behind++;
  takeLight(S, heavy ? DC.light.drainHeavy : DC.light.drain);
  if (e.mode === 'kindleTell') { S.n.kindlesCut++; setMode(e, 'recover', 0.5); S.kindleCd = DC.kindleCd * 0.5; c.number(e.x, e.y - 64, 'THE KINDLING IS CUT', '#8fd160'); }
  if (!S.told.land) { S.told.land = 1; c.number(e.x, e.y - 64, 'IT LANDS: HIS LIGHT GUTTERS', '#8fd160'); }
  return { dmg, read: 'landed' };
}
export function burnOn(e, S, dmg) { if (!e || !e.alive || (e.mode === 'away' || e.mode === 'sleep') || S.ward > 0) return { dmg: 0, read: 'ward' };
  if (dcOpen(e)) { const d = Math.max(0, Math.min(dmg, Math.round(e.maxHp * DC.gropeCap - S.gropeTaken))); S.gropeTaken += d; return { dmg: d, read: 'open' }; } return { dmg, read: 'burn' }; }
/* HIS BLOW TURNED: on the beat (a parry, a perfect guard) the sweep or the jab is a riposte - he reels */
export function blowTurned(e, S, c, perfect) { if (!e || !e.alive || dcOpen(e) || S.ward > 0) return;
  if (e.mode === 'hook') { S.haul = null; }   /* a shield turns the hook: nothing caught */
  if (perfect && (e.mode === 'sweep' || e.mode === 'jab' || e.mode === 'hook')) { setMode(e, 'reel', DC.reelT); c.number(e.x, e.y - 64, 'ON THE BEAT: HE REELS', '#8fd160'); } }
/* ONE OF HIS LAMPS SNUFFED (a blade through it): his light gutters; a CHANDELIER brought down ON HIM (dropped: true, under: he stood under it) staggers him */
export function lampOut(e, S, c, o = {}) { if (!e || !e.alive || (e.mode === 'away' || e.mode === 'sleep')) return 0; S.n.lampsOut++; takeLight(S, DC.light.lampDim);
  if (o.dropped) S.n.drops++;
  if (o.dropped && o.under && !dcOpen(e) && !(S.ward > 0)) { S.n.dropsOnHim++; const d = Math.round(e.maxHp * DC.drop.dmg); setMode(e, 'reel', DC.drop.stun); S.haul = null; c.number(e.x, e.y - 72, 'THE CHANDELIER COMES DOWN ON HIM', '#8fd160'); c.shake(5); return d; }
  if (e.mode === 'kindleTell' && o.id && o.id === S.kindleId) { setMode(e, 'recover', 0.4); }
  c.number(e.x, e.y - 64, S.told.lamp ? 'HIS LIGHT GUTTERS' : 'A LAMP OUT: HIS LIGHT GUTTERS', '#8fd160'); S.told.lamp = 1; return 0; }

/* ---------- ONE FRAME. h = heroes [{ x, y, ground, alive, pp }], c: hit(box, dmg, name, o) -> landed, haul(pp, x), number, mark, sound, fx, shake, lamps() -> [{ id, x, lit, hang }], kindle(id) ---------- */
export function stepDeacon(e, S, dt, h, c) {
  const G = S.G, P = h.filter(q => q.alive).sort((a, b) => Math.abs(a.x - e.x) - Math.abs(b.x - e.x))[0] || h[0];
  e.modeT -= dt; e.y = G.floorY; e.anim = (e.anim || 0) + dt; S.kindleCd = Math.max(0, S.kindleCd - dt);
  if (e.open > 0) e.open = Math.max(0, e.open - dt);
  if (S.ward > 0) S.ward = Math.max(0, S.ward - dt); e.ward = S.ward; e.dcLight = S.light;
  stepFire(e, S, dt, c);
  if ((e.mode === 'away' || e.mode === 'sleep')) return;
  if (e.mode === 'wake') { if (e.modeT <= 0) { S.script = nextScript(S); S.step = 0; setMode(e, 'walk', 0.5); } return; }
  const lamps = c.lamps ? c.lamps() : [], lit = lamps.filter(l => l.lit).length;
  if (S.starved && S.light <= 0 && e.mode !== 'grope' && S.ward <= 0 && !STRIKE.has(e.mode)) { grope(e, S, c); return; }
  if (S.light > 0) S.starved = false;
  if (!dcOpen(e) && S.ward <= 0) setLight(S, S.light + DC.light.regen * lit * dt);
  if (lit === 0 && S.light <= 0 && !dcOpen(e) && S.ward <= 0 && !STRIKE.has(e.mode)) S.starved = true;
  if (e.broken > 0 && !dcOpen(e) && (GUARD_MODES.has(e.mode) || /Tell$/.test(e.mode))) { e.modeT += dt; e.vx = 0; return; }
  const want = dPhase(e);
  if (want > S.ph && !dcOpen(e) && (e.mode === 'walk' || e.mode === 'recover')) { S.ph = want; S.cycle = 0; S.step = 0; S.script = null; e.phase = want;
    c.number((G.x0 + G.x1) / 2, G.floorY - 100, 'THE DEACON TURNS HIS POLE: THE FLAME END DOWN', '#ff6b6b'); c.sound('tellHard'); c.shake(3); setMode(e, 'recover', 0.7); return; }
  switch (e.mode) {
    case 'grope': e.vx = 0; if (e.open <= 0) { endGrope(e, S, c); setMode(e, 'recover', 0.4); } return;
    case 'recover': e.vx = 0; if (e.modeT <= 0) nextMove(e, S, P, c); return;
    case 'reel': e.vx = 0; if (e.modeT <= 0) setMode(e, 'recover', 0.3); return;
    case 'walk': { const d = P.x - e.x;
      if ((e.face || 1) * d < -8) { S.behindT += dt; if (S.behindT > DC.turn) { e.face = Math.sign(d) || e.face; S.behindT = 0; } } else S.behindT = 0;
      const x0 = e.x; if (Math.abs(d) > DC.keep + 6) e.x = clampX(G, e.x + Math.sign(d) * DC.walk * dt); else if (Math.abs(d) < 26) e.x = clampX(G, e.x - Math.sign(d) * DC.walk * 0.6 * dt); e.vx = (e.x - x0) / Math.max(1e-6, dt);
      if (e.modeT <= 0) nextMove(e, S, P, c); return; }
    case 'kindleWalk': { const l = lamps.find(q => q.id === S.kindleId); if (!l || l.lit) { setMode(e, 'walk', 0.3); return; }
      const d = l.x - e.x; e.face = Math.sign(d) || e.face; if (Math.abs(d) > (l.hang ? 22 : 14)) { const x0 = e.x; e.x = clampX(G, e.x + Math.sign(d) * DC.walk * 1.25 * dt); e.vx = (e.x - x0) / Math.max(1e-6, dt); if (e.modeT <= 0) setMode(e, 'walk', 0.3); return; }
      e.vx = 0; S.n.kindles++; tell(e, S, c, 'kindleTell', DC.kindleT); c.number(e.x, e.y - 64, 'HE KINDLES THE LAMP: CUT IT', '#ffd36b'); return; }
    case 'kindleTell': e.vx = 0; if (e.modeT <= 0) { if (c.kindle) c.kindle(S.kindleId); S.kindleCd = DC.kindleCd; setMode(e, 'recover', 0.35); } return;
  }
  stepMove(e, S, dt, P, c);
}
function nextMove(e, S, P, c) {
  const lamps = c.lamps ? c.lamps() : [], dark = lamps.filter(l => !l.lit), dx = P.x - e.x, ad = Math.abs(dx);
  e.face = Math.sign(dx) || e.face;
  /* THE DARK IS HIS ENEMY: a lamp out, and he goes to light it again (not in his ward; a beat between, so he always fights) */
  if (dark.length && S.ward <= 0 && S.kindleCd <= 0) { const l = dark.slice().sort((a, b) => Math.abs(a.x - e.x) - Math.abs(b.x - e.x))[0]; S.kindleId = l.id; S.kindleCd = DC.kindleCd; setMode(e, 'kindleWalk', DC.kindleWalkT); return; }
  if (!S.script || S.step >= S.script.length) { S.cycle++; S.script = nextScript(S); S.step = 0; }
  let m = S.script[S.step++];
  if (m === 'sweep' && ad > DC.sweep.reach + 30) m = ad < DC.hook.reach + 10 ? 'hook' : 'walk';
  if (m === 'hook' && ad > DC.hook.reach + 10) m = 'walk';
  if (m === 'arc' && ad > DC.arc.len + 20) m = 'walk';
  switch (m) {
    case 'sweep': S.n.sweeps++; tell(e, S, c, 'sweepTell', DC.sweep.tell); return;
    case 'hook': S.n.hooks++; tell(e, S, c, 'hookTell', DC.hook.tell); if (!S.told.hook) { S.told.hook = 1; c.number(e.x, e.y - 64, 'THE SNUFFER HOOK: A SHIELD, OR GET OUT OF ITS REACH', '#ffd36b'); } return;
    case 'arc': S.n.arcs++; tell(e, S, c, 'arcTell', DC.arc.tell); if (!S.told.arc) { S.told.arc = 1; c.number(e.x, e.y - 64, 'THE FLAME ARC: HOLY FIRE ALONG THE FLOOR - JUMP IT', '#ff6b6b'); } return;
  }
  setMode(e, 'walk', 0.45); if (m === 'walk') S.step--;
}
function stepMove(e, S, dt, P, c) {
  const G = S.G, f = e.face || 1, after = (t) => setMode(e, 'recover', t ?? DC.gap[S.ph - 1]);
  e.vx = 0;
  switch (e.mode) {
    case 'sweepTell': if (e.modeT <= 0) { setMode(e, 'sweep', DC.sweep.t); c.sound('whoosh'); } return;
    case 'sweep': c.hit([f > 0 ? e.x - 6 : e.x - DC.sweep.reach, f > 0 ? e.x + DC.sweep.reach : e.x + 6, G.floorY - 12, G.floorY + 2], DC.sweep.dmg, MOVE_NAME.sweep, { blockable: true, key: 'sw' + S.act, noKnock: true }); if (e.modeT <= 0) after(); return;
    case 'hookTell': if (e.modeT <= 0) { setMode(e, 'hook', DC.hook.t); c.sound('whoosh'); } return;
    case 'hook': { const tip = e.x + f * DC.hook.reach * Math.min(1, 1 - e.modeT / DC.hook.t + 0.2);
      if (!S.haul && c.hit([Math.min(e.x, tip) - 4, Math.max(e.x, tip) + 4, G.floorY - 28, G.floorY - 8], DC.hook.dmg, MOVE_NAME.hook, { blockable: true, key: 'hk' + S.act, noKnock: true })) { S.haul = { x: e.x + f * 24 }; S.n.hauls++; c.number(e.x, e.y - 64, 'HOOKED: HE HAULS YOU IN', '#ff6b6b'); }
      if (e.mode !== 'hook') return;   /* (a parry made him reel inside c.hit) */
      if (e.modeT <= 0) { if (S.haul) tell(e, S, c, 'jabTell', DC.hook.jabTell); else after(0.45); } return; }
    case 'jabTell': if (S.haul && c.haul) c.haul(S.haul.x, DC.hook.haul * dt); if (e.modeT <= 0) { setMode(e, 'jab', 0.2); S.haul = null; c.sound('slash'); } return;
    case 'jab': c.hit([f > 0 ? e.x - 4 : e.x - 40, f > 0 ? e.x + 40 : e.x + 4, G.floorY - 34, G.floorY], DC.hook.jab, MOVE_NAME.jab, { blockable: true, key: 'jb' + S.act }); if (e.modeT <= 0) after(); return;
    case 'arcTell': if (e.modeT <= 0) { setMode(e, 'arc', DC.arc.t); S.arcFrom = e.x + f * 10; S.arcDir = f; c.sound('fire'); } return;
    case 'arc': { const k = 1 - Math.max(0, e.modeT) / DC.arc.t, x = clampX(G, S.arcFrom + S.arcDir * DC.arc.len * k);   /* the flame dragged along the floor lays the fire as it goes */
      const last = S.fire.length ? S.fire[S.fire.length - 1] : null; if (!last || last.act !== S.act || Math.abs(last.x - x) >= 10) S.fire.push({ x, t: DC.arc.life, act: S.act, tick: 0 });
      if (e.modeT <= 0) after(0.55); return; }
    default: setMode(e, 'walk', 0.5);
  }
}
/* THE FLAME ARC's HOLY FIRE: each patch burns a hero standing on it every DC.arc.tick s */
function stepFire(e, S, dt, c) { for (const q of S.fire) { q.t -= dt; q.tick -= dt; if (q.tick <= 0) { q.tick = DC.arc.tick; c.hit([q.x - 6, q.x + 6, S.G.floorY - 14, S.G.floorY + 2], DC.arc.dmg, MOVE_NAME.fire, { key: 'fire' + Math.round(q.x) + '_' + Math.round(q.t * 10), noKnock: true }); } }
  S.fire = S.fire.filter(q => q.t > 0); }

/* ---------- THE BOT (src/lab.js): a human's reading. It jumps the sweep and the fire, takes the hook on a shield or steps out of its reach, cuts his kindling,
   snuffs his lamps when he is off them (a sconce with a cut, a chandelier from a jump), hits him LOW (the sweep: down + X) or from behind, and hard while he
   gropes; warded, it waits off him.
   s = { P: { x, y, face, ground, atk }, e, S, lamps: [{ id, x, y, lit, hang }], reach, shield, t, rng, mem, v2, rest } -> { gx, face, atk, jump, dodge, block, down, why } ---------- */
export const PLAN = { react: 0.25, miss: 0.12, lampR: 130 };
export function dcPlan(s) {
  const { P, e, S, reach } = s, G = S.G, out = { gx: null, face: P.face, atk: false, jump: false, dodge: false, block: false, down: false, why: '' };
  const mem = s.mem || {}, rng = s.rng || Math.random, t = s.t || 0;
  mem.seen = mem.seen || new Map(); mem.roll = mem.roll || new Map(); if (mem.seen.size > 600) { mem.seen.clear(); mem.roll.clear(); }
  const seenFor = (key, d = s.v2 ? 0 : PLAN.react) => { if (!mem.seen.has(key)) mem.seen.set(key, t); return t - mem.seen.get(key) >= d; };
  const roll = (key, pr) => { if (!mem.roll.has(key)) mem.roll.set(key, rng() < pr); return mem.roll.get(key); };
  const lo = G.x0 + 12, hi = G.x1 - 12, clamp = x => Math.max(lo, Math.min(hi, x));
  const kx = e.x, side = Math.sign(P.x - kx) || 1, dx = Math.abs(kx - P.x), hitR = reach + DC.w / 2 - 2;
  const swing = (low) => { out.face = Math.sign(kx - P.x) || out.face; out.atk = P.atk < 0; if (low && P.ground) out.down = true; };
  const onFire = x => (S.fire || []).some(q => Math.abs(q.x - x) < 12);
  const safe = x => { let q = clamp(x); for (let i = 0; i < 12 && onFire(q); i++) q = clamp(q + (q < kx ? -14 : 14)); return q; };
  if (onFire(P.x) && P.ground) { out.gx = safe(P.x + (P.x < kx ? -20 : 20)); out.jump = Math.abs(out.gx - P.x) < 6; out.why = 'off the holy fire'; return out; }
  if (/Tell$/.test(e.mode) || STRIKE.has(e.mode)) { const miss = s.v2 ? false : roll('m' + S.act + e.mode, PLAN.miss), seen = seenFor('a' + S.act + e.mode);
    if (seen && !miss) {
      if ((e.mode === 'sweepTell' || e.mode === 'sweep') && dx < DC.sweep.reach + 24) { if (e.mode === 'sweep' || e.modeT < 0.18) { if (s.shield && roll('sb' + S.act, 0.35)) { out.block = true; out.face = Math.sign(kx - P.x) || 1; out.why = 'block the sweep'; return out; } if (P.ground) out.jump = true; out.gx = P.x; out.why = 'jump the sweep'; return out; } out.gx = P.x; out.why = 'ready for the sweep'; return out; }
      if ((e.mode === 'hookTell' || e.mode === 'hook') && dx < DC.hook.reach + 16 && (e.face || 1) * (P.x - kx) > -6) { if (s.shield) { out.block = true; out.face = Math.sign(kx - P.x) || 1; out.why = 'the hook on the shield'; return out; }
        if (e.modeT < 0.2 && P.ground) { if (!s.noRoll && dx < 50) { out.dodge = true; out.gx = clamp(kx + (e.face || 1) * 50); out.why = 'roll under the hook'; return out; } out.jump = true; out.gx = P.x; out.why = 'jump the hook'; return out; }
        out.gx = clamp(kx + side * (DC.hook.reach + 24)); out.why = 'out of the hook\'s reach'; return out; }
      if ((e.mode === 'jabTell' || e.mode === 'jab') && dx < 60) { if (s.shield) { out.block = true; out.face = Math.sign(kx - P.x) || 1; out.why = 'block the jab'; return out; } if (!s.noRoll && P.ground && e.modeT < 0.2) { out.dodge = true; out.gx = clamp(kx + side * 60); } out.why = 'out of the jab'; return out; }
      if (e.mode === 'arcTell' && dx < DC.arc.len + 30 && (e.face || 1) * (P.x - kx) > -6) { out.gx = clamp(kx - (e.face || 1) * 40); out.why = 'behind him: the arc goes the other way'; return out; }
    } }
  if (dcOpen(e)) { out.gx = clamp(kx + side * 14); if (dx < hitR + 4) swing(false); out.why = 'hit him: he gropes'; return out; }
  if (S.ward > 0) { out.gx = clamp(kx + side * 70); out.why = 'his ward: wait'; return out; }
  if (e.mode === 'kindleTell' && !roll('cut' + S.act, 0.15)) { if (dx > hitR - 2) { out.gx = clamp(kx + side * (hitR - 8)); out.why = 'in to cut the kindling'; return out; } swing(false); out.gx = P.x; out.why = 'cut the kindling'; return out; }
  /* SNUFF HIS LAMPS: when he is off them (a chandelier: a jump and a cut under it) */
  const lit = (s.lamps || []).filter(l => l.lit);
  if (lit.length && (e.mode === 'walk' || e.mode === 'recover' || e.mode === 'kindleWalk') && dx > 50) { const l = lit.slice().sort((a, b) => Math.abs(a.x - P.x) - Math.abs(b.x - P.x))[0];
    if (Math.abs(l.x - P.x) < PLAN.lampR && Math.abs(l.x - kx) > 40) { const st = l.hang ? l.x - (Math.sign(l.x - P.x) || 1) * 4 : l.x - (Math.sign(l.x - P.x) || 1) * 14; if (Math.abs(P.x - st) > 6) { out.gx = clamp(st); out.why = 'to his lamp'; return out; }
      out.face = Math.sign(l.x - P.x) || P.face; out.gx = P.x; if (l.hang) { if (P.ground) { out.jump = true; out.why = 'up at the chandelier'; return out; } out.atk = P.atk < 0 && P.vy !== undefined ? true : P.atk < 0; out.why = 'cut the chandelier down'; return out; }
      out.atk = P.atk < 0; out.why = 'snuff his lamp'; return out; } }
  if (s.rest) { out.gx = safe(kx + side * (DC.hook.reach + 30)); out.face = Math.sign(kx - P.x) || 1; out.why = 'winded: off him'; return out; }
  /* FIGHT HIM: LOW (down + X) or from behind; in his tells he is committed */
  const committed = e.mode === 'reel' || e.mode === 'kindleWalk' || e.mode === 'arc' || e.mode === 'jab' || e.mode === 'sweep';
  if (dx < hitR + 30) { if (dx > hitR - 4) { out.gx = clamp(kx + side * (hitR - 8)); out.face = Math.sign(kx - P.x) || 1; out.why = 'in to him'; return out; }
    const back = (e.face || 1) * (P.x - kx) < -6; swing(!back && !committed); out.gx = P.x; out.why = back ? 'hit his back' : committed ? 'hit him: committed' : 'low, under his pole'; return out; }
  out.gx = safe(kx + side * Math.max(40, hitR + 14)); out.face = Math.sign(kx - P.x) || 1; out.why = 'close on him'; return out;
}
