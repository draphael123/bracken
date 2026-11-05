// src/demon-king.js - THE DEMON KING, THE SKY FIGHT (lane S2 DEMONKING, claude/demonking, 11-04). PURE: no DOM, no main.js.
// Design: scratch/lane-reports/heartplan.md section 3 (the reflect rule, the phases, the move list) + Daniel 11-04 (newest wins):
//   - he is NOT killed: he is KNOCKED DOWN. His bar empties into the scene (lane SC); hp never reaches 0 here ('beaten').
//   - ANY attack that meets a HELLBOLT returns it (1 PIP); a parry / guard ON THE BEAT returns it bigger and faster (2 PIPS, never batted back).
//     The per-kit table is src/reflect-kit.js. EVERY 3RD PIP KNOCKS HIM DOWN: he crashes onto the drake's back (src/sky-mount.js kingLandX:
//     between you and the neck) - DOWNED, blows x1.5 - then a told REPULSE and a 2 s ward while he flies back up.
//   - RESIST FLOOR kept (B15): outside the knockdown every blow lands x0.4 (the CHIP when he swoops / whips low); knockdowns are the main damage.
//     No invulnerability anywhere (a phase climb is him flying off-screen, not a shell).
//   - THREE PHASES, one new thing each: P1 plain bolts (+ the claw swoop) -> P2 FAKE-OUTS + DOUBLE BOLTS (+ the rally, the chain whip, high arcs)
//     -> P3 IMPS land on the drake's back while he fires (+ lava bombs from the eruption, rally 70%).
//   - you cannot fall off; a hit knocks you DOWN on the back (S1's knock-down rule in main.js damagePlayer0 - nothing here throws a hero).
// The fight is a state object `f` stepped by stepKing(f, dt, w). It talks to the world by EVENTS (f.events, returned by stepKing): the hands
// (src/demon-king-hands.js) turn them into damagePlayer calls, imps, sounds, words. What touches a bolt comes back in through meet() (a hero
// hand met it in flight) and resolveBody() (it reached a hero: damagePlayer's answer). Damage to him goes through take(f, dmg, tag).
// Every number is in DK (the tune lane S5's table: bosses are tuned WITH flasks to 60-70% later). Proved by tools/demon-king.mjs (node).
import { surfaceY, kingLandX, holdBank, beginClimb, walkable } from './sky-mount.js';

export const DK = {
  bar: 1000, phases: 3,                                     // EHP.demonking = 3 x 1200 (heartplan: Gorm pattern hp1/hp2/hp3)
  w: 24, h: 40, proneW: 40, proneH: 16,
  enter: 1.6,                                               // he flies in over the neck (no attack)
  hover: { up: 74, lead: 92, speed: 80, bob: 4, xPad: 40 }, // feet this far over the back; this far ahead of his mark; drift speed; over the back +- xPad
  rest: [1.05, 0.85, 0.7],                                  // s between moves per phase
  weights: [                                                 // what he picks, per phase (never the same move three times running)
    { bolt: 0.72, swoop: 0.28 },
    { bolt: 0.30, feint: 0.18, double: 0.20, swoop: 0.14, whip: 0.18 },
    { bolt: 0.26, feint: 0.14, double: 0.20, swoop: 0.10, whip: 0.14, summon: 0.16 } ],
  bolt: { r: 7, v: [150, 170, 185], tell: [0.70, 0.60, 0.55], release: 0.2, dmg: 22, life: 4.5, chestUp: 8, headUp: 16, g: 260, highK: 0.8 },
  ret: { v: 210, mul: 1.2, pips: 1, turn: 7, r: 14, life: 4 },          // a NORMAL return: pale gold, homing, swordDmg x1.2, one pip
  power: { v: 320, mul: 2.0, pips: 2, turn: 12 },                       // a POWER return: white-gold, swordDmg x2.0, two pips, never batted
  rally: { chance: [0, 0.4, 0.7], tell: 0.25, speedUp: 0.15, max: 3 },  // P1 none (rec Q8); +15% speed a volley; at most 3 volleys a rally
  feint: { tell: 0.6, real: 0.4 },
  double: { tell: 0.8, gap: 0.35, t: 0.5 },
  swoop: { tell: 0.9, t: 0.5, dmg: 30, band: [24, 10], rise: 22, reach: 14, hang: 0.4 },   // band: px over the surface (top, bottom) = head height: DUCK / roll / jump
  whip: { tell: 0.85, t: 0.3, dmg: 32, hang: 1.0, low: [6, 0], high: [24, 10], at: 30 },  // LOW = jump, HIGH = duck; he hangs low after (chip)
  knock: { pips: 3, tumble: 0.6, down: [5.0, 4.5, 4.0], repulse: 0.6, repR: 44, repDmg: 6, ward: 2.0, bankPad: 0.5 },
  imps: { tell: 1.0, cap: 2, cd: 7, n: 2, gap: 34, dmg: 3.5, hp: 20 },    // the existing 'imp' foe (20 hp), reskinned demon-red by S4
  bombs: { every: 5.0, jitter: 0.3, tell: 1.1, r: 14, dmg: 26, n: [1, 2] },
  fall: 1.2, climb: 5.0,                                     // the phase change: his last fall + scream, then the drake climbs (S1 beginClimb)
  mul: { downed: 1.5, chip: 0.4 },                           // B15: x0.4 everywhere outside the knockdown (never lower), x1.5 downed
  returnTag: 'reflect',                                      // a returned bolt lands through hurtAs('reflect', ...): whole, never chipped
};
const MOVES = ['bolt', 'feint', 'double', 'swoop', 'whip', 'summon'];
/* what each told move says, sounds like and looks like: the windup pose is never the release pose (B16). The hands look the sound ids up. */
export const TOLD = {
  bolt:   { mark: '!',  tell: 'boltTell',   release: 'boltRelease',  sTell: 'dkHum',     sRel: 'dkThrow' },
  feint:  { mark: '!',  tell: 'feintTell',  release: 'feintPull',    sTell: 'dkHumDim',  sRel: 'dkFizzle' },
  double: { mark: '!',  tell: 'doubleTell', release: 'double',       sTell: 'dkHumTwo',  sRel: 'dkThrow' },
  swoop:  { mark: '!!', tell: 'swoopTell',  release: 'swoop',        sTell: 'dkShriek',  sRel: 'dkSwoop' },
  whip:   { mark: '!!', tell: 'whipTell',   release: 'whip',         sTell: 'dkChain',   sRel: 'dkCrack' },
  summon: { mark: '!!', tell: 'summonTell', release: 'summon',       sTell: 'dkChant',   sRel: 'impShriek' },
  repulse:{ mark: '!!', tell: 'repulseTell', release: 'repulse',     sTell: 'dkGather',  sRel: 'dkBlast' },
  bat:    { mark: '!',  tell: 'batTell',    release: 'bat',          sTell: 'dkClaw',    sRel: 'dkBat' },
};
/* THE POSES (greybox now, S4's sprites later): body = float | low | flat | tumble | prone | rise; arm = the casting hand; orb = what is in it */
export const POSE = {
  enter: { body: 'float', arm: 'down', orb: null }, float: { body: 'float', arm: 'down', orb: null },
  boltTell: { body: 'float', arm: 'palmUp', orb: 'grow' }, boltRelease: { body: 'float', arm: 'thrown', orb: null },
  feintTell: { body: 'float', arm: 'palmUp', orb: 'dim' }, feintPull: { body: 'float', arm: 'pulled', orb: 'grow' },
  doubleTell: { body: 'float', arm: 'both', orb: 'two' }, double: { body: 'float', arm: 'thrownBoth', orb: null },
  batTell: { body: 'float', arm: 'clawUp', orb: null }, bat: { body: 'float', arm: 'swat', orb: null },
  swoopTell: { body: 'rise', arm: 'clawBack', orb: null, cape: 'flare' }, swoop: { body: 'flat', arm: 'clawFwd', orb: null },
  whipTell: { body: 'low', arm: 'chainBack', orb: null }, whip: { body: 'low', arm: 'chainLash', orb: null }, hang: { body: 'low', arm: 'down', orb: null },
  summonTell: { body: 'float', arm: 'both', orb: 'glyph' }, summon: { body: 'float', arm: 'spread', orb: null },
  tumble: { body: 'tumble', arm: 'flail', orb: null }, downed: { body: 'prone', arm: 'flat', orb: null },
  repulseTell: { body: 'prone', arm: 'out', orb: 'ring' }, repulse: { body: 'rise', arm: 'spread', orb: null }, rise: { body: 'rise', arm: 'down', orb: null },
  fall: { body: 'tumble', arm: 'flail', orb: null, scream: true }, climb: { body: 'float', arm: 'down', orb: null }, beaten: { body: 'prone', arm: 'flat', orb: null },
};
export const DK_SAY = { enter: 'THE DEMON KING', teach: 'STRIKE HIS BOLT BACK AT HIM', power: 'POWER RETURN', pip: 'STRUCK BACK', knock: 'HE FALLS ONTO THE BACK!',
  rally: 'HE BATS IT BACK!', block: 'BLOCKED', p2: 'HE FEINTS - WAIT FOR THE WHITE CORE', p3: 'IMPS ON THE BACK!', beaten: 'HE IS THROWN DOWN', ward: 'WARDED', climb: 'THE DRAKE CLIMBS' };

const clamp = (v, a, b) => (v < a ? a : v > b ? b : v);
const ph1 = f => clamp(f.ph, 1, 3) - 1;
export const floorOf = f => (f.ph >= DK.phases ? 1 : (DK.phases - f.ph) * f.bar);   /* hp never under this in a phase (P3: 1 - he is beaten, not killed) */
export const barOf = f => clamp(f.hp - (DK.phases - f.ph) * f.bar, 0, f.bar);
const OPEN = new Set(['downed']);
const NO_FALL = new Set(['enter', 'tumble', 'downed', 'repulseTell', 'repulse', 'fall', 'climb', 'beaten']);
const NO_BAT = new Set(['tumble', 'downed', 'repulseTell', 'repulse', 'fall', 'climb', 'beaten', 'swoop']);
export const kingOpen = f => OPEN.has(f.mode);
export const kingLow = f => ['swoop', 'whip', 'hang', 'whipTell'].includes(f.mode);
/* B15: the multiplier a hero blow lands with, now. x1.5 downed; x0.4 everywhere else (the chip) - never lower, never 0 */
export const mulOf = f => (kingOpen(f) ? DK.mul.downed : DK.mul.chip);

export function newFight(back, o = {}) {
  const ph = o.phase || 1, rnd = o.rnd || Math.random, bar = Math.round(DK.bar * (o.scale || 1));   /* scale: main.js's late-game boss health (1 + 0.25 x TIER_BOSS) */
  const f = { ph, bar, hp: DK.phases * bar - (ph - 1) * bar, mode: 'enter', mT: 0, T: DK.enter, t: 0, x: back.x1 + 40, y: back.y0 - DK.hover.up - 60, face: -1,
    pips: 0, bolts: [], rings: [], last: [], rest: 0, bombT: DK.bombs.every, impCd: 0, id: 0, tgt: 0, rnd, back, events: [], landX: null, side: 1, whipHi: false,
    swoop: null, said: {}, beaten: false, queue: [], heroes: [],
    n: { bolts: 0, feints: 0, doubles: 0, swoops: 0, whips: 0, summons: 0, bombs: 0, imps: 0, returns: 0, powers: 0, blocks: 0, bats: 0, knocks: 0, pips: 0,
      hits: {}, dealt: {}, moves: [], maxVolley: 0, phaseAt: [] } };
  return f;
}
const go = (f, mode, T = 0) => { f.mode = mode; f.mT = 0; f.T = T; };
const say = (ev, text, big = false) => ev.push({ k: 'say', text, big });
const snd = (ev, id) => ev.push({ k: 'sound', id });
const centre = f => ({ x: f.x, y: f.y - (f.mode === 'downed' || f.mode === 'repulseTell' ? DK.proneH / 2 : DK.h / 2) });
/* heroes: [{ x, y, h?, duck?, down?, dead? }] (feet x/y) - who he means: the nearest one on his feet (co-op: either) */
function markOf(f, heroes) {
  let best = -1, bd = 1e9; heroes.forEach((h, i) => { if (!h || h.dead) return; const d = Math.abs(h.x - f.x) + (h.down > 0 ? 400 : 0); if (d < bd) { bd = d; best = i; } });
  return best;
}
function hoverGoal(f, heroes) {
  const b = f.back, i = markOf(f, heroes), hx = i >= 0 ? heroes[i].x : b.cx, H = DK.hover;
  let tx = hx + H.lead * f.side; if (tx > b.x1 + H.xPad || tx < b.x0 - H.xPad) { f.side = -f.side; tx = hx + H.lead * f.side; }
  return { x: clamp(tx, b.x0 - H.xPad, b.x1 + H.xPad), y: surfaceY(b, clamp(tx, b.x0, b.x1)) - H.up + Math.sin(f.t * 2.2) * H.bob };
}
function drift(f, gx, gy, dt, sp = DK.hover.speed) {
  const dx = gx - f.x, dy = gy - f.y, d = Math.hypot(dx, dy); if (d < 0.5) { f.x = gx; f.y = gy; return true; }
  const s = Math.min(d, sp * dt); f.x += dx / d * s; f.y += dy / d * s; return false;
}

/* ---- HIS BOLTS ---- */
function fire(f, heroes, high, ev) {
  const i = markOf(f, heroes); if (i < 0) return null; const h = heroes[i], B = DK.bolt, v = B.v[ph1(f)];
  const ox = f.x + (h.x < f.x ? -10 : 10), oy = f.y - DK.h * 0.6;
  const b = { id: ++f.id, x: ox, y: oy, vx: 0, vy: 0, r: B.r, st: 'in', high: !!high, v, volley: 0, life: B.life, g: 0, touched: [], tgt: i };
  if (!high) { const tx = h.x, ty = h.y - B.chestUp, d = Math.hypot(tx - ox, ty - oy) || 1; b.vx = (tx - ox) / d * v; b.vy = (ty - oy) / d * v; }
  else {   /* A HIGH ARC (P2+): a lob that comes DOWN on his head - an up attack, an up-air or a jump cut meets it */
    const tx = h.x, ty = h.y - B.headUp, T = Math.max(0.6, Math.abs(tx - ox) / (v * B.highK)); b.g = B.g; b.vx = (tx - ox) / T; b.vy = (ty - oy - 0.5 * B.g * T * T) / T;
  }
  f.bolts.push(b); f.n.bolts++; ev.push({ k: 'bolt', bolt: b }); return b;
}
/* A HERO HAND MET A BOLT IN FLIGHT (src/reflect-kit.js classify -> 'normal' | 'power'). Only a bolt coming AT the heroes can be met. */
export function meet(f, bolt, how, hero = -1) {
  const b = typeof bolt === 'object' ? bolt : f.bolts.find(q => q.id === bolt);
  if (!b || b.st !== 'in' || (how !== 'normal' && how !== 'power')) return false;
  const pw = how === 'power', c = centre(f), a = Math.atan2(c.y - b.y, c.x - b.x);
  b.st = pw ? 'pow' : 'ret'; b.v = pw ? DK.power.v : DK.ret.v; b.a = a; b.vx = Math.cos(a) * b.v; b.vy = Math.sin(a) * b.v; b.g = 0; b.life = DK.ret.life; b.by = hero; b.rolled = false;
  f.n.returns++; if (pw) f.n.powers++;
  f.queue.push({ k: 'returned', bolt: b, power: pw, hero }); f.queue.push({ k: 'sound', id: pw ? 'dkPowerChime' : 'dkReturnCrack' });
  if (pw) say(f.queue, DK_SAY.power, true);
  return true;
}
/* THE BOLT REACHED A HERO (damagePlayer's answer, src/reflect-kit.js classify of via 'body'): 'power' (parried on the beat) | 'block' | 'hit' | 'miss' */
export function resolveBody(f, bolt, outcome, hero = -1) {
  const b = typeof bolt === 'object' ? bolt : f.bolts.find(q => q.id === bolt); if (!b || b.st !== 'in') return false;
  if (outcome === 'power') return meet(f, b, 'power', hero);
  if (outcome === 'block') { b.st = 'gone'; f.n.blocks++; f.queue.push({ k: 'pop', bolt: b, why: 'block' }); return true; }
  if (outcome === 'hit') { b.st = 'gone'; f.n.hits.bolt = (f.n.hits.bolt || 0) + 1; f.queue.push({ k: 'pop', bolt: b, why: 'hit' }); return true; }
  return false;   /* 'miss': i-frames, a roll, a duck - it flies on */
}
const boxOf = h => ({ l: h.x - 5, r: h.x + 5, t: h.y - (h.duck ? 7 : (h.h || 14)), b: h.y });
const circBox = (x, y, r, B) => { const cx = clamp(x, B.l, B.r), cy = clamp(y, B.t, B.b); return (x - cx) ** 2 + (y - cy) ** 2 <= r * r; };
function stepBolts(f, dt, heroes, ev) {
  const b0 = f.back, c = centre(f), R = DK.rally;
  for (const b of f.bolts) {
    if (b.st === 'gone') continue;
    b.life -= dt;
    if (b.st === 'in') {
      b.vy += b.g * dt; b.x += b.vx * dt; b.y += b.vy * dt;
      heroes.forEach((h, i) => { if (!h || h.dead || b.touched.includes(i)) return; if (circBox(b.x, b.y, b.r, boxOf(h))) { b.touched.push(i); ev.push({ k: 'boltAt', bolt: b, hero: i }); } });
      if (b.st !== 'in') continue;
      if (b.x > b0.x0 && b.x < b0.x1 && b.y >= surfaceY(b0, b.x) + 1) { b.st = 'gone'; ev.push({ k: 'pop', bolt: b, why: 'back' }); continue; }   /* into the drake's scales */
      if (b.life <= 0 || b.x < b0.x0 - 120 || b.x > b0.x1 + 160 || b.y > b0.y0 + 120) { b.st = 'gone'; continue; }
      continue;
    }
    if (f.mode === 'climb' || f.mode === 'beaten') { b.st = 'gone'; continue; }
    /* a return homes on him (the archmage's homeStep shape) */
    const turn = (b.st === 'pow' ? DK.power.turn : DK.ret.turn) * dt, want = Math.atan2(c.y - b.y, c.x - b.x);
    let d = want - b.a; while (d > Math.PI) d -= 2 * Math.PI; while (d < -Math.PI) d += 2 * Math.PI;
    b.a += clamp(d, -turn, turn); b.vx = Math.cos(b.a) * b.v; b.vy = Math.sin(b.a) * b.v; b.x += b.vx * dt; b.y += b.vy * dt;
    const dist = Math.hypot(c.x - b.x, c.y - b.y);
    /* THE RALLY (P2+): a NORMAL return near him may be batted back - told (he raises a claw, the bolt flashes red) */
    if (b.st === 'ret' && !b.rolled && dist < b.v * R.tell + DK.ret.r) {
      b.rolled = true;
      if (b.volley < R.max && !NO_BAT.has(f.mode) && f.rnd() < R.chance[ph1(f)]) { b.st = 'bat'; b.batT = R.tell; f.batT = R.tell; ev.push({ k: 'tell', move: 'bat' }); snd(ev, TOLD.bat.sTell); }
    }
    if (b.st === 'bat') { b.batT -= dt; if (b.batT <= 0 || dist < DK.ret.r) { batBack(f, b, heroes, ev); } continue; }
    if (dist < DK.ret.r) arrive(f, b, ev);
    else if (b.life <= 0) b.st = 'gone';
  }
  f.bolts = f.bolts.filter(b => b.st !== 'gone');
}
function batBack(f, b, heroes, ev) {
  const i = markOf(f, heroes); b.volley++; f.n.bats++; f.n.maxVolley = Math.max(f.n.maxVolley, b.volley);
  b.st = 'in'; b.v = DK.bolt.v[ph1(f)] * (1 + DK.rally.speedUp * b.volley); b.g = 0; b.high = false; b.touched = []; b.life = DK.bolt.life;
  const h = i >= 0 ? heroes[i] : { x: f.back.cx, y: f.back.y0 }, tx = h.x, ty = h.y - DK.bolt.chestUp, d = Math.hypot(tx - b.x, ty - b.y) || 1;
  b.vx = (tx - b.x) / d * b.v; b.vy = (ty - b.y) / d * b.v; f.batPose = 0.2;
  ev.push({ k: 'bat', bolt: b }); snd(ev, TOLD.bat.sRel); say(ev, DK_SAY.rally);
}
/* A RETURN LANDS: the damage goes through the hands (hurtAs('reflect') -> take, whole); the pips count here */
function arrive(f, b, ev) {
  const pw = b.st === 'pow'; b.st = 'gone';
  const pips = pw ? DK.power.pips : DK.ret.pips;
  ev.push({ k: 'returnHit', power: pw, mul: pw ? DK.power.mul : DK.ret.mul, x: b.x, y: b.y, hero: b.by });
  if (f.mode === 'beaten') return;
  f.pips += pips; f.n.pips += pips; snd(ev, pw ? 'dkPowerHit' : 'dkReturnHit');
  if (f.pips >= DK.knock.pips && !NO_FALL.has(f.mode)) knockdown(f, ev);
}
/* THREE PIPS: he tumbles out of the sky and crashes onto the drake's back between you and the neck (S1 kingLandX); no bank while he is down */
function knockdown(f, ev) {
  const K = DK.knock, b = f.back;
  f.pips = 0; f.n.knocks++;
  const land = kingLandX(b, (f.heroes || []).map(h => ({ x: h.x, dead: h.dead, down: h.down })));
  f.landX = land.x; f.landSide = land.side; f.from = { x: f.x, y: f.y };
  for (const q of f.bolts) if (q.st === 'in' || q.st === 'bat') q.st = 'gone';   /* what he was throwing goes out with him */
  holdBank(b, K.tumble + K.down[ph1(f)] + K.repulse + K.bankPad);
  go(f, 'tumble', K.tumble); f.swoop = null; ev.push({ k: 'knockdown', x: land.x, side: land.side }); snd(ev, 'dkTumble'); say(ev, DK_SAY.knock, true);
}

/* B15 + the phase gate: a hero blow on him lands x mulOf(f) (a return 'reflect' lands whole), never past the phase's floor. Returns what landed. */
export function take(f, dmg, tag) {
  if (!(dmg > 0) || f.mode === 'beaten') return 0;
  const m = tag === DK.returnTag ? 1 : mulOf(f);
  let d = Math.max(1, Math.round(dmg * m)); d = Math.min(d, Math.max(0, f.hp - floorOf(f)));
  f.hp -= d; const k = tag === DK.returnTag ? 'return' : f.mode; f.n.dealt[k] = (f.n.dealt[k] || 0) + d;
  return d;
}

/* ---- ONE STEP ----  w: { heroes: [{ x, y, h?, duck?, down?, dead? }], imps? (alive count) } -> events */
export function stepKing(f, dt, w = {}) {
  const ev = f.queue.splice(0); f.events = ev; const heroes = w.heroes || []; f.heroes = heroes; const b = f.back, K = DK.knock;
  f.t += dt; f.mT += dt; f.impCd = Math.max(0, f.impCd - dt); f.batT = Math.max(0, (f.batT || 0) - dt); f.batPose = Math.max(0, (f.batPose || 0) - dt);
  /* THE PHASE GATE: his bar for this phase is empty - a last fall, a scream, then the drake climbs */
  if (!['fall', 'climb', 'beaten'].includes(f.mode) && f.hp <= floorOf(f)) {
    for (const q of f.bolts) if (q.st === 'in' || q.st === 'bat') q.st = 'gone';
    f.rings = []; f.swoop = null; f.pips = 0;
    if (f.ph >= DK.phases) { go(f, 'beaten'); f.beaten = true; holdBank(b, 30); ev.push({ k: 'beaten' }); ev.push({ k: 'clearImps' }); say(ev, DK_SAY.beaten, true); snd(ev, 'dkScream'); }
    else { go(f, 'fall', DK.fall); holdBank(b, DK.fall + DK.climb + 1); ev.push({ k: 'phaseFall', phase: f.ph }); snd(ev, 'dkScream'); }
  }
  const g = hoverGoal(f, heroes), mk = markOf(f, heroes), mh = mk >= 0 ? heroes[mk] : null;
  if (mh) f.face = mh.x < f.x ? -1 : 1;
  switch (f.mode) {
    case 'enter': drift(f, g.x, g.y, dt, 140); if (f.mT >= f.T) { go(f, 'float'); f.rest = 0.6; say(ev, DK_SAY.enter, true); say(ev, DK_SAY.teach); } break;
    case 'float': {
      drift(f, g.x, g.y, dt); f.rest -= dt;
      if (f.rest <= 0 && mh) pick(f, heroes, w, ev);
      break; }
    case 'boltTell': drift(f, g.x, g.y, dt, 30); if (f.mT >= f.T) { fire(f, heroes, f.ph >= 2 && f.rnd() < (f.ph === 2 ? 0.25 : 0.35), ev); snd(ev, TOLD.bolt.sRel); go(f, 'boltRelease', DK.bolt.release); } break;
    case 'feintTell': drift(f, g.x, g.y, dt, 30); if (f.mT >= f.T) { go(f, 'feintPull', DK.feint.real); snd(ev, TOLD.feint.sRel); ev.push({ k: 'feint' }); } break;   /* the dim orb is pulled back: nothing flies */
    case 'feintPull': if (f.mT >= f.T) { fire(f, heroes, false, ev); snd(ev, TOLD.bolt.sRel); go(f, 'boltRelease', DK.bolt.release); } break;           /* the REAL bolt (white core) */
    case 'boltRelease': drift(f, g.x, g.y, dt); if (f.mT >= f.T) { go(f, 'float'); f.rest = DK.rest[ph1(f)]; } break;
    case 'doubleTell': drift(f, g.x, g.y, dt, 30); if (f.mT >= f.T) { fire(f, heroes, false, ev); snd(ev, TOLD.double.sRel); go(f, 'double', DK.double.t); f.second = DK.double.gap; } break;
    case 'double': f.second -= dt; if (f.second <= 0 && f.second > -9) { fire(f, heroes, f.ph >= 3, ev); snd(ev, TOLD.double.sRel); f.second = -99; } if (f.mT >= f.T && f.second < -9) { go(f, 'float'); f.rest = DK.rest[ph1(f)]; } break;
    case 'swoopTell': { const S = f.swoop; drift(f, S.sx, S.sy, dt, 280); if (f.mT >= f.T) { go(f, 'swoop', DK.swoop.t); snd(ev, TOLD.swoop.sRel); S.hit = []; } break; }
    case 'swoop': {   /* low across the back at head height: duck, roll or jump; he is LOW (chip) */
      const S = f.swoop, u = clamp(f.mT / f.T, 0, 1), x0 = f.x; f.x = S.sx + (S.ex - S.sx) * u; f.y = surfaceY(b, clamp(f.x, b.x0, b.x1)) - 6;
      const lo = Math.min(x0, f.x) - DK.swoop.reach, hi = Math.max(x0, f.x) + DK.swoop.reach, band = DK.swoop.band;
      heroes.forEach((h, i) => { if (!h || h.dead || S.hit.includes(i)) return; const s = surfaceY(b, h.x), B = boxOf(h);
        if (B.r > lo && B.l < hi && B.t < s - band[1] && B.b > s - band[0]) { S.hit.push(i); ev.push({ k: 'hit', hero: i, dmg: DK.swoop.dmg, name: 'CLAW SWOOP', x: f.x, move: 'swoop' }); } });
      if (f.mT >= f.T) { go(f, 'hang', DK.swoop.hang); f.swoop = null; } break; }
    case 'whipTell': drift(f, f.wx, surfaceY(b, clamp(f.wx, b.x0, b.x1)) - DK.whip.at, dt, 150); if (f.mT >= f.T) { go(f, 'whip', DK.whip.t); snd(ev, TOLD.whip.sRel); f.whipHit = []; } break;
    case 'whip': {   /* a lash along the whole back: LOW = jump, HIGH = duck */
      const band = f.whipHi ? DK.whip.high : DK.whip.low;
      heroes.forEach((h, i) => { if (!h || h.dead || f.whipHit.includes(i)) return; const s = surfaceY(b, h.x), B = boxOf(h);
        if (B.t < s - band[1] + (band[1] === 0 ? 1 : 0) && B.b > s - band[0]) { f.whipHit.push(i); ev.push({ k: 'hit', hero: i, dmg: DK.whip.dmg, name: f.whipHi ? 'CHAIN WHIP (HIGH)' : 'CHAIN WHIP (LOW)', x: f.x, move: 'whip' }); } });
      if (f.mT >= f.T) go(f, 'hang', DK.whip.hang); break; }
    case 'hang': if (f.mT >= f.T) { go(f, 'float'); f.rest = DK.rest[ph1(f)] * 0.6; } break;
    case 'summonTell': drift(f, g.x, g.y, dt, 30); if (f.mT >= f.T) {
        const room = Math.max(0, DK.imps.cap - (w.imps || 0)); let n = 0;
        for (const r of f.rings.filter(r => r.kind === 'glyph')) { if (n < room) { ev.push({ k: 'spawnImp', x: r.x, y: surfaceY(b, r.x) }); n++; f.n.imps++; } }
        f.rings = f.rings.filter(r => r.kind !== 'glyph'); snd(ev, TOLD.summon.sRel); f.impCd = DK.imps.cd; go(f, 'summon', 0.3); }
      break;
    case 'summon': if (f.mT >= f.T) { go(f, 'float'); f.rest = DK.rest[ph1(f)]; } break;
    case 'tumble': { const u = clamp(f.mT / f.T, 0, 1); f.x = f.from.x + (f.landX - f.from.x) * u; f.y = f.from.y + (surfaceY(b, f.landX) - f.from.y) * u * u;
      if (f.mT >= f.T) { f.x = f.landX; f.y = surfaceY(b, f.landX); go(f, 'downed', K.down[ph1(f)]); ev.push({ k: 'crash', x: f.x }); snd(ev, 'dkCrash'); } break; }
    case 'downed': f.y = surfaceY(b, f.x); if (f.mT >= f.T) { go(f, 'repulseTell', K.repulse); ev.push({ k: 'tell', move: 'repulse' }); snd(ev, TOLD.repulse.sTell); } break;
    case 'repulseTell': f.y = surfaceY(b, f.x); if (f.mT >= f.T) {
        heroes.forEach((h, i) => { if (!h || h.dead) return; if (Math.abs(h.x - f.x) < K.repR && h.y > surfaceY(b, h.x) - 40) ev.push({ k: 'hit', hero: i, dmg: K.repDmg, name: 'REPULSE', x: f.x, move: 'repulse' }); });
        snd(ev, TOLD.repulse.sRel); go(f, 'rise', K.ward); }
      break;
    case 'rise': drift(f, g.x, g.y, dt, 70); if (f.mT >= f.T) { go(f, 'float'); f.rest = DK.rest[ph1(f)]; } break;
    case 'fall': f.y = Math.min(f.y + 40 * dt, surfaceY(b, clamp(f.x, b.x0, b.x1))); if (f.mT >= f.T) { beginClimb(b, f.ph + 1); go(f, 'climb', DK.climb); ev.push({ k: 'climb', phase: f.ph + 1 }); ev.push({ k: 'clearImps' }); say(ev, DK_SAY.climb, true); } break;
    case 'climb': drift(f, b.x1 + 60, b.y0 - 170, dt, 120); if (f.mT >= f.T) { f.ph++; f.pips = 0; f.n.phaseAt.push(f.t); go(f, 'enter', DK.enter); say(ev, f.ph === 2 ? DK_SAY.p2 : DK_SAY.p3, true); ev.push({ k: 'phase', phase: f.ph }); f.bombT = DK.bombs.every; } break;
    case 'beaten': break;
  }
  /* glyph rings (imps) and lava-bomb rings: told, then they land */
  for (const r of f.rings) { r.t += dt; if (r.kind === 'bomb' && r.t >= r.T && !r.done) { r.done = true; f.n.bombs++; snd(ev, 'dkBomb');
      heroes.forEach((h, i) => { if (!h || h.dead) return; if (Math.abs(h.x - r.x) < DK.bombs.r + 5 && h.y > surfaceY(b, h.x) - 18) ev.push({ k: 'hit', hero: i, dmg: DK.bombs.dmg, name: 'LAVA BOMB', x: r.x, move: 'bomb' }); }); } }
  f.rings = f.rings.filter(r => !(r.kind === 'bomb' && r.done));
  /* P3 THE ERUPTION throws LAVA BOMBS onto the back (not in his fall, the climb, or once he is beaten) */
  if (f.ph >= 3 && !['fall', 'climb', 'beaten', 'enter'].includes(f.mode)) {
    f.bombT -= dt;
    if (f.bombT <= 0) { const B = DK.bombs, [a, z] = walkable(b, 2), n = B.n[0] + (f.rnd() < 0.5 ? 1 : 0) * (B.n[1] - B.n[0]);
      for (let i = 0; i < n; i++) { const x = i === 0 && mh ? clamp(mh.x + (f.rnd() * 2 - 1) * 20, a, z) : a + f.rnd() * (z - a); f.rings.push({ kind: 'bomb', x, t: 0, T: B.tell }); }
      ev.push({ k: 'tell', move: 'bomb' }); snd(ev, 'dkEruption'); f.bombT = B.every * (1 + (f.rnd() * 2 - 1) * B.jitter); }
  }
  stepBolts(f, dt, heroes, ev);
  return ev;
}
function pick(f, heroes, w, ev) {
  const W = { ...DK.weights[ph1(f)] }, l = f.last;
  if (W.summon !== undefined && (f.impCd > 0 || (w.imps || 0) >= DK.imps.cap)) delete W.summon;
  if (l.length >= 2 && l[l.length - 1] === l[l.length - 2]) delete W[l[l.length - 1]];   /* never the same move three times running */
  const keys = Object.keys(W), tot = keys.reduce((s, k) => s + W[k], 0); let r = f.rnd() * tot, m = keys[keys.length - 1];
  for (const k of keys) { r -= W[k]; if (r <= 0) { m = k; break; } }
  l.push(m); if (l.length > 4) l.shift(); f.n.moves.push(m);
  const P = ph1(f), b = f.back, mh = heroes[markOf(f, heroes)];
  ev.push({ k: 'tell', move: m, mark: TOLD[m].mark }); snd(ev, TOLD[m].sTell);
  if (m === 'bolt') go(f, 'boltTell', DK.bolt.tell[P]);
  else if (m === 'feint') { f.n.feints++; go(f, 'feintTell', DK.feint.tell); }
  else if (m === 'double') { f.n.doubles++; go(f, 'doubleTell', DK.double.tell); }
  else if (m === 'swoop') { f.n.swoops++; const fromNeck = mh ? mh.x < b.cx : true, sx = fromNeck ? b.x1 + 24 : b.x0 - 24, ex = fromNeck ? b.x0 - 24 : b.x1 + 24;
    f.swoop = { sx, ex, sy: surfaceY(b, clamp(sx, b.x0, b.x1)) - DK.hover.up - DK.swoop.rise, hit: [] }; go(f, 'swoopTell', DK.swoop.tell); }
  else if (m === 'whip') { f.n.whips++; f.whipHi = f.rnd() < 0.5; f.wx = clamp((mh ? mh.x : b.cx) + 50 * f.side, b.x0 + 10, b.x1 - 10); go(f, 'whipTell', DK.whip.tell); }
  else if (m === 'summon') { f.n.summons++; const [a, z] = walkable(b, 10); const xs = [];
    for (let k = 0; k < 24 && xs.length < DK.imps.n; k++) { const x = a + f.rnd() * (z - a); if (heroes.every(h => !h || h.dead || Math.abs(h.x - x) >= DK.imps.gap) && xs.every(q => Math.abs(q - x) > 20)) xs.push(x); }
    while (xs.length < DK.imps.n) xs.push(xs.length ? z - 10 : a + 10);
    for (const x of xs) f.rings.push({ kind: 'glyph', x, t: 0, T: DK.imps.tell });
    go(f, 'summonTell', DK.imps.tell); }
}
/* THE SHARED READ (B10): open = downed (gold ring + bar), ward = rising (pale), pips for the HUD */
export function readOf(f) { return { open: kingOpen(f), t: Math.max(0, f.T - f.mT), T: f.T, ward: f.mode === 'rise', low: kingLow(f), pips: f.pips, phase: f.ph, bar: barOf(f), mode: f.mode, beaten: f.beaten }; }
/* the pose a mode wears (bat-back overrides while it is told) */
export const poseOf = f => (f.batT > 0 ? POSE.batTell : f.batPose > 0 ? POSE.bat : POSE[f.mode] || POSE.float);

/* THE BOT'S PLAN (bossLab hands / the node lab): what a reading hero does now. hero = { x, y }, reach = his blow's reach px.
   -> { swing: boltId|null, parry: boltId|null, duck, jump, stepTo: x|null, hit: bool } */
export function dkPlan(f, hero, reach = 26) {
  const out = { swing: null, parry: null, duck: false, jump: false, stepTo: null, hit: false }, b = f.back, s = surfaceY(b, hero.x);
  for (const q of f.bolts) { if (q.st !== 'in') continue; const d = Math.hypot(q.x - hero.x, q.y - (hero.y - 8)); if (d < reach + q.r) { out.swing = q.id; out.parry = q.id; } }
  if (f.mode === 'swoopTell' && f.mT > f.T - 0.25) out.duck = true;
  if (f.mode === 'swoop') out.duck = true;
  if (f.mode === 'whipTell' && f.mT > f.T - 0.2) { if (f.whipHi) out.duck = true; else out.jump = true; }
  if (f.mode === 'whip') { if (f.whipHi) out.duck = true; else out.jump = true; }
  for (const r of f.rings) if (r.kind === 'bomb' && Math.abs(r.x - hero.x) < DK.bombs.r + 8) out.stepTo = r.x + (hero.x < r.x ? -1 : 1) * (DK.bombs.r + 14);
  if (kingOpen(f)) { out.stepTo = out.stepTo ?? f.x + (hero.x < f.x ? -18 : 18); out.hit = Math.abs(hero.x - f.x) < reach + 14; }
  if (f.mode === 'repulseTell' || (f.mode === 'downed' && f.mT > f.T - 0.4)) out.stepTo = f.x + (hero.x < f.x ? -1 : 1) * (DK.knock.repR + 8);
  if (kingLow(f) && Math.abs(hero.x - f.x) < reach + 12 && Math.abs((s - 30) - f.y) < 40) out.hit = true;
  return out;
}
export { MOVES };
