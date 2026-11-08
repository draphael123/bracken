// src/beasts.js - THE FROST BEASTS: SNOWRUNNER + GREYMANE (the wolf pair) and BRUIN (the bear). claude/foes, 11-08 (scratch/lane-reports/wolves-plan.md, sections 0-1).
// PURE, no DOM: tools/beasts.mjs drives it headless; src/beasts-hands.js binds it to the game. A foe's state is its own `s` (e.st); the step sets s.vx (px/s) and
// the HOST moves the body and writes the real x back (as src/hornsman.js). Every attack is TOLD (a windup mode ending 'Tell' with its mark, a windup pose, its own sound)
// and ANSWERED (src/marks.js ANSWER / HEIGHT rows): block, duck, dodge. Distinct from the goblin WAR HOUND (low leap, jump it) and THE GREAT HOUND (the act-I mini):
// wolves are pale frost beasts that CIRCLE as a pack and whose dangerous blow is HIGH.
//   SNOWRUNNER  snapTell !  (BLOCK, parry = yelps, flung open) | leapTell !!  (DUCK / roll; a miss skids open)       fast, weak, 2-3 at a time, hit-and-run
//   GREYMANE    biteTell !  (BLOCK, parry = staggered)        | pounceTell !! (DODGE out of the frost RING; a miss lands winded; a hit PINS)   heavy, slow, leads the pack
//   BRUIN       maulTell !  (stands up and ROARS; BLOCK, parry = on his back legs) | chargeTell !! (DODGE: roll through; a wall/drift dazes him)
// FLAG: BEASTS_SHIPS gates PLACEMENT only (no level spawns one while false; no bestiary card). The spawn cases and the dev pen still work for tools.
import { nearestHero } from './mummer.js';

export const BEASTS_SHIPS = false;
export const BEAST_IDS = ['snowrunner', 'greymane', 'bruin'];
export const isBeast = t => BEAST_IDS.includes(t);

/* NUMBERS (BASE, the act-I scale: hound 12, Hornsman 11; the act dial multiplies commons: foe-react.js ACTS_LATE act 6 x3.75 dmg / x1.15 hp) */
export const SNOWRUNNER = { w: 18, h: 10, hp: 18, run: 130, orbitNear: 60, orbitMid: 85, orbitFar: 110, sight: 380, sightY: 150, first: 0.9, cd: [1.3, 2.3], flip: [2.6, 4.4],
  snapTell: 0.40, snapReach: 40, snapT: 0.14, snapDmg: 6, runOut: 0.55, runOutK: 1.25, leapTell: 0.55, leapMin: 70, leapMax: 100, leapOver: 40, leapT: 0.42, leapLift: 8, leapDmg: 8,
  skid: 0.5, parried: 1.0, hesitate: 1.2, chill: 0.15, snapMax: 54 };
export const GREYMANE = { w: 26, h: 15, hp: 70, walk: 40, trot: 70, sight: 400, sightY: 150, first: 1.2, cd: [1.6, 2.6],
  biteTell: 0.65, biteReach: 60, biteT: 0.16, biteDmg: 12, biteRest: 0.8, blockPush: 20, parried: 1.2,
  pounceTell: 0.85, pounceMin: 90, pounceMax: 140, pounceT: 0.55, pounceLift: 22, pounceDmg: 14, ringR: 18, pin: 0.6, winded: 1.0, pinRest: 0.6 };
export const BRUIN = { w: 28, h: 16, hUp: 22, hp: 120, walk: 30, charge: 210, sight: 400, sightY: 150, first: 1.4, cd: [1.8, 2.8],
  maulTell: 0.9, maulReach: 40, maulT: 0.18, maulDmg: 14, maulRest: 0.9, parried: 1.5,
  chargeTell: 0.8, chargeLen: 200, chargeDmg: 16, dazed: 1.2, skid: 0.6, knock: 150 };
/* the damage rows main.js puts in DMG (and src/combat.js COMMON_BLOWS lists, so the act dial scales them) */
export const BEAST_DMG = { snowSnap: SNOWRUNNER.snapDmg, snowLeap: SNOWRUNNER.leapDmg, greyBite: GREYMANE.biteDmg, greyPounce: GREYMANE.pounceDmg, bruinMaul: BRUIN.maulDmg, bruinCharge: BRUIN.chargeDmg };
export const BEAST_BODY = { snowrunner: SNOWRUNNER, greymane: GREYMANE, bruin: BRUIN };
/* what each one says over its head while telling (mode -> [mark, word]) - the marks are the table's (src/marks.js MARK), these are the words */
export const BEAST_TELLS = { 'snowrunner|snapTell': '!', 'snowrunner|leapTell': '!!', 'greymane|biteTell': '!', 'greymane|pounceTell': '!!', 'bruin|maulTell': '!', 'bruin|chargeTell': '!!' };
/* the modes that are the BLOW itself (strike boxes run in them) - never one of the resting names in src/duck.js AT_REST */
export const BLOW_MODES = new Set(['snap', 'leap', 'bite', 'pounce', 'maul', 'charge']);
export const OPEN_MODES = new Set(['skid', 'parried', 'winded', 'staggered', 'dazed', 'rearOpen']);

const sgn = v => (v < 0 ? -1 : 1);
const pick = (r, [a, b]) => a + (b - a) * r();
const clamp = (v, a, b) => Math.max(a, Math.min(b, v));
/* a parabola in 0..1: 4u(1-u) */
const arc = u => { const c = clamp(u, 0, 1); return 4 * c * (1 - c); };

export function newBeast(kind, x, y, face = -1, o = {}) {
  const C = BEAST_BODY[kind];
  return { kind, x, y, face, mode: 'stand', t: 0, vx: 0, lift: 0, open: 0, atk: 0, cd: C.first, side: face || 1, flipT: 1.5, hesitate: 0, hadLeader: false, ringX: null, up: false, braced: false,
    pinned: false, hitX: 0, ...o };
}

/* is this beast in a windup or a blow (the pack's one-at-a-time rule reads it) */
export const beastBusy = s => !!s && (/Tell$/.test(s.mode) || BLOW_MODES.has(s.mode));

/* THE HERO IT HUNTS: the nearest upright one in sight; in co-op each runner prefers a hero no other runner has (w.taken = the x's the pack already hunts) */
function hunted(s, w, C) {
  const hs = (w.heroes || []).filter(h => h.alive !== false);
  let best = null, bd = 1e9;
  for (const h of hs) { if (Math.abs(h.x - s.x) > C.sight || Math.abs((h.y || 0) - (s.y || 0)) > C.sightY) continue;
    let d = Math.abs(h.x - s.x); if (s.kind === 'snowrunner' && hs.length > 1 && w.taken && w.taken.some(t => t && (t === h || (h.p !== undefined && t.p === h.p)))) d += 120;   /* SPREAD: a runner takes the hero its packmates have not */
    if (d < bd) { bd = d; best = h; } }
  return best;
}

/* ONE FRAME. w = { heroes:[{x,y,face,alive}], canStep(x, dir) -> bool, rand(), busy: another pack member is telling/striking, tokWait, leader: a live greymane near (or null), taken:[heroes] }.
   Events: tell {move, mark, dur}, strike {move, atk, dmg, box, unblock, ...}, ring {x}, land {x}, roar, hesitate, cancel {move}, open {mode}, wall */
export function beastStep(s, w, dt) {
  const evs = [], C = BEAST_BODY[s.kind]; s.vx = 0;
  if (s.open > 0) s.open = Math.max(0, s.open - dt);
  const near = hunted(s, w, C); s.hunt = near;
  const canStep = (dir) => !w.canStep || w.canStep(s.x, dir);
  const busyElse = !!w.busy || !!w.tokWait;
  const face = d => { s.face = sgn(d) || s.face; };
  if (s.kind === 'snowrunner') snowStep(s, w, dt, C, near, evs, canStep, busyElse, face);
  else if (s.kind === 'greymane') greyStep(s, w, dt, C, near, evs, canStep, busyElse, face);
  else bruinStep(s, w, dt, C, near, evs, canStep, busyElse, face);
  return evs;
}

/* ---------------------------------------------------------------- SNOWRUNNER */
function snowStep(s, w, dt, C, near, evs, canStep, busyElse, face) {
  const r = w.rand || Math.random;
  switch (s.mode) {
    case 'stand': case 'orbit': case 'walk': {
      s.mode = 'stand';
      if (s.hesitate > 0) { s.hesitate -= dt; break; }
      if (w.leader) s.hadLeader = true; else if (s.hadLeader) { s.hadLeader = false; s.hesitate = C.hesitate; evs.push({ t: 'hesitate' }); break; }
      if (!near) break;
      face(near.x - s.x); s.cd -= dt; s.flipT -= dt;
      if (s.flipT <= 0) { s.side = -s.side; s.flipT = pick(r, C.flip); }
      const d = Math.abs(near.x - s.x), ready = s.cd <= 0 && !busyElse;
      if (ready && d <= C.snapMax && Math.abs((near.y || 0) - s.y) < 30) { s.mode = 'snapTell'; s.t = C.snapTell; s.atk++; evs.push({ t: 'tell', move: 'snapTell', mark: '!', dur: C.snapTell }); break; }
      if (ready && d >= C.leapMin && d <= C.leapMax + 8 && Math.abs((near.y || 0) - s.y) < 30) { s.mode = 'leapTell'; s.t = C.leapTell; s.atk++; evs.push({ t: 'tell', move: 'leapTell', mark: '!!', dur: C.leapTell }); break; }
      /* the orbit: it holds a side of the hero at orbit range, and comes in to snap or leap range when its turn is up */
      const want = ready ? (r() < 0.5 ? 46 : 84) : C.orbitMid;
      const tx = near.x + s.side * want, dx = tx - s.x;
      if (Math.abs(dx) > 5) { const dir = sgn(dx); if (canStep(dir)) { s.vx = dir * C.run * (ready ? 1 : 0.8); s.mode = 'orbit'; } }
      break; }
    case 'snapTell': s.t -= dt; if (near) face(near.x - s.x);
      if (s.t <= 0) { s.mode = 'snap'; s.t = C.snapT; s.hitX = s.x; }
      break;
    case 'snap': { s.t -= dt; const dist = C.snapReach; if (canStep(s.face)) s.vx = s.face * (dist / C.snapT);
      const x0 = s.face > 0 ? s.x : s.x - (C.snapReach + 6);
      evs.push({ t: 'strike', move: 'snapTell', blow: 'THE SNAP', atk: s.atk, dmg: C.snapDmg, box: [x0, x0 + C.snapReach + 6, s.y - C.h - 2, s.y], key: 'snowSnap', chill: C.chill });
      if (s.t <= 0) { s.mode = 'runOut'; s.t = C.runOut; } break; }
    case 'runOut': s.t -= dt; if (canStep(-s.face)) s.vx = -s.face * C.run * C.runOutK;
      if (s.t <= 0) { s.mode = 'stand'; s.cd = pick(r, C.cd); } break;
    case 'leapTell': s.t -= dt; if (near) face(near.x - s.x); s.lift = 0;
      if (s.t <= 0) { const d = near ? Math.abs(near.x - s.x) : C.leapMin; s.mode = 'leap'; s.t = C.leapT; s.leapV = (clamp(d, C.leapMin, C.leapMax) + C.leapOver) / C.leapT; s.leapU = 0; s.hitX = s.x; }
      break;
    case 'leap': { s.t -= dt; s.leapU = clamp(1 - s.t / C.leapT, 0, 1); s.lift = C.leapLift * arc(s.leapU);
      if (canStep(s.face)) s.vx = s.face * s.leapV;
      const lo = s.y - s.lift, x0 = s.x - 10, x1 = s.x + 10;
      evs.push({ t: 'strike', move: 'leapTell', blow: 'THE THROAT LEAP', atk: s.atk, dmg: C.leapDmg, box: [x0, x1, lo - C.h - 6, lo + 1], unblock: true, high: true, key: 'snowLeap' });
      if (s.t <= 0) { s.mode = 'skid'; s.t = C.skid; s.lift = 0; s.open = C.skid; evs.push({ t: 'land', x: s.x }); } break; }
    case 'skid': s.t -= dt; s.vx = s.face * 40 * Math.max(0, s.t / C.skid); s.open = Math.max(s.open, s.t);
      if (s.t <= 0) { s.mode = 'stand'; s.cd = pick(r, C.cd); } break;
    case 'parried': s.t -= dt; s.vx = -s.face * 90 * Math.max(0, s.t / C.parried); s.open = Math.max(s.open, s.t);
      if (s.t <= 0) { s.mode = 'stand'; s.cd = pick(r, C.cd); } break;
    default: s.mode = 'stand';
  }
}

/* ---------------------------------------------------------------- GREYMANE */
function greyStep(s, w, dt, C, near, evs, canStep, busyElse, face) {
  const r = w.rand || Math.random;
  switch (s.mode) {
    case 'stand': case 'walk': case 'trot': {
      s.mode = 'stand';
      if (!near) break;
      face(near.x - s.x); s.cd -= dt;
      const d = Math.abs(near.x - s.x), dy = Math.abs((near.y || 0) - s.y), ready = s.cd <= 0 && !busyElse;
      if (ready && d <= C.biteReach + 6 && dy < 34) { s.mode = 'biteTell'; s.t = C.biteTell; s.atk++; evs.push({ t: 'tell', move: 'biteTell', mark: '!', dur: C.biteTell }); break; }
      if (ready && d >= 70 && d <= C.pounceMax + 10 && dy < 34 && r() < 0.65) {
        s.mode = 'pounceTell'; s.t = C.pounceTell; s.atk++; const land = clamp(d, C.pounceMin, C.pounceMax); s.ringX = s.x + s.face * land;
        evs.push({ t: 'tell', move: 'pounceTell', mark: '!!', dur: C.pounceTell }); evs.push({ t: 'ring', x: s.ringX, r: C.ringR }); break; }
      const want = d > 110 ? C.trot : C.walk;
      if (d > (ready ? 50 : 90) && canStep(s.face)) { s.vx = s.face * want; s.mode = d > 110 ? 'trot' : 'walk'; }
      break; }
    case 'biteTell': s.t -= dt; if (near) face(near.x - s.x);
      if (s.t <= 0) { s.mode = 'bite'; s.t = C.biteT; s.hitX = s.x; }
      break;
    case 'bite': { s.t -= dt; if (canStep(s.face)) s.vx = s.face * (C.biteReach / C.biteT);
      const x0 = s.face > 0 ? s.x : s.x - (C.biteReach + 10);
      evs.push({ t: 'strike', move: 'biteTell', blow: 'THE CRUSHING BITE', atk: s.atk, dmg: C.biteDmg, box: [x0, x0 + C.biteReach + 10, s.y - C.h - 4, s.y], key: 'greyBite', push: C.blockPush });
      if (s.t <= 0) { s.mode = 'biteRest'; s.t = C.biteRest; } break; }
    case 'biteRest': s.t -= dt; if (s.t <= 0) { s.mode = 'stand'; s.cd = pick(r, C.cd); } break;
    case 'pounceTell': s.t -= dt; if (near) face(near.x - s.x); if (s.ringX != null) s.face = sgn(s.ringX - s.x);
      if (s.t <= 0) { s.mode = 'pounce'; s.t = C.pounceT; s.hitX = s.x; s.pounceV = (s.ringX - s.x) / C.pounceT; s.pounceHit = false; }
      break;
    case 'pounce': { s.t -= dt; const u = clamp(1 - s.t / C.pounceT, 0, 1); s.lift = C.pounceLift * arc(u);
      if (!w.canStep || w.canStep(s.x, sgn(s.pounceV))) s.vx = s.pounceV;
      if (s.t <= 0) { s.lift = 0; evs.push({ t: 'land', x: s.x });
        evs.push({ t: 'strike', move: 'pounceTell', blow: 'THE POUNCE', atk: s.atk, dmg: C.pounceDmg, box: [s.x - C.ringR, s.x + C.ringR, s.y - C.h - 10, s.y + 2], unblock: true, key: 'greyPounce', pin: C.pin, land: true });
        s.mode = 'landed'; s.t = 0.12; s.ringX = null; }
      break; }
    case 'landed': s.t -= dt; if (s.t <= 0) { if (s.pounceHit) { s.mode = 'pin'; s.t = C.pin; s.pinned = true; } else { s.mode = 'winded'; s.t = C.winded; s.open = C.winded; evs.push({ t: 'open', mode: 'winded' }); } } break;
    case 'pin': s.t -= dt; if (s.t <= 0 || s.freed) { s.pinned = false; s.freed = false; s.mode = 'pinRest'; s.t = C.pinRest; } break;
    case 'pinRest': s.t -= dt; if (s.t <= 0) { s.mode = 'stand'; s.cd = pick(r, C.cd); } break;
    case 'winded': s.t -= dt; s.open = Math.max(s.open, s.t); if (s.t <= 0) { s.mode = 'stand'; s.cd = pick(r, C.cd); } break;
    case 'staggered': s.t -= dt; s.open = Math.max(s.open, s.t); if (s.t <= 0) { s.mode = 'stand'; s.cd = pick(r, C.cd); } break;
    default: s.mode = 'stand';
  }
}

/* ---------------------------------------------------------------- BRUIN */
function bruinStep(s, w, dt, C, near, evs, canStep, busyElse, face) {
  const r = w.rand || Math.random;
  s.braced = s.mode === 'charge';
  switch (s.mode) {
    case 'stand': case 'walk': {
      s.mode = 'stand'; s.up = false;
      if (!near) break;
      face(near.x - s.x); s.cd -= dt;
      const d = Math.abs(near.x - s.x), dy = Math.abs((near.y || 0) - s.y), ready = s.cd <= 0 && !busyElse;
      if (ready && d <= C.maulReach + 14 && dy < 36) { s.mode = 'maulTell'; s.t = C.maulTell; s.atk++; s.up = true; evs.push({ t: 'tell', move: 'maulTell', mark: '!', dur: C.maulTell }); evs.push({ t: 'roar' }); break; }
      if (ready && d >= 80 && d <= C.chargeLen + 20 && dy < 36 && r() < 0.7) { s.mode = 'chargeTell'; s.t = C.chargeTell; s.atk++; s.chargeX = s.x; evs.push({ t: 'tell', move: 'chargeTell', mark: '!!', dur: C.chargeTell }); evs.push({ t: 'lane', x0: s.x, x1: s.x + s.face * C.chargeLen }); break; }
      if (d > (ready ? 30 : 80) && canStep(s.face)) { s.vx = s.face * C.walk; s.mode = 'walk'; }
      break; }
    case 'maulTell': s.t -= dt; s.up = true; if (near) face(near.x - s.x);
      if (s.t <= 0) { s.mode = 'maul'; s.t = C.maulT; s.hitX = s.x; }
      break;
    case 'maul': { s.t -= dt; s.up = true;
      const x0 = s.face > 0 ? s.x : s.x - (C.maulReach + 8);
      evs.push({ t: 'strike', move: 'maulTell', blow: 'THE MAUL', atk: s.atk, dmg: C.maulDmg, box: [x0, x0 + C.maulReach + 8, s.y - C.hUp, s.y], key: 'bruinMaul', push: 26 });
      if (s.t <= 0) { s.mode = 'maulRest'; s.t = C.maulRest; } break; }
    case 'maulRest': s.t -= dt; if (s.t <= 0) { s.up = false; s.mode = 'stand'; s.cd = pick(r, C.cd); } break;
    case 'chargeTell': s.t -= dt; s.up = false; if (near) face(near.x - s.x); s.chargeX = s.x;
      if (s.t <= 0) { s.mode = 'charge'; s.t = C.chargeLen / C.charge; s.run = 0; s.hitX = s.x; }
      break;
    case 'charge': { s.t -= dt; s.braced = true;
      if (canStep(s.face)) { s.vx = s.face * C.charge; s.run += C.charge * dt; }
      else { s.mode = 'dazed'; s.t = C.dazed; s.open = C.dazed; s.braced = false; s.vx = 0; evs.push({ t: 'wall', x: s.x }); evs.push({ t: 'open', mode: 'dazed' }); break; }
      evs.push({ t: 'strike', move: 'chargeTell', blow: 'THE CHARGE', atk: s.atk, dmg: C.chargeDmg, box: [s.x - C.w / 2 - 2, s.x + C.w / 2 + 2, s.y - C.h - 4, s.y], unblock: true, key: 'bruinCharge', knock: C.knock });
      if (s.t <= 0) { s.mode = 'skid'; s.t = C.skid; s.braced = false; } break; }
    case 'skid': s.t -= dt; s.vx = s.face * C.charge * 0.5 * Math.max(0, s.t / C.skid) * (canStep(s.face) ? 1 : 0);
      if (s.t <= 0) { s.mode = 'stand'; s.cd = pick(r, C.cd); } break;
    case 'dazed': s.t -= dt; s.open = Math.max(s.open, s.t); if (s.t <= 0) { s.mode = 'stand'; s.cd = pick(r, C.cd); } break;
    case 'rearOpen': s.t -= dt; s.up = true; s.open = Math.max(s.open, s.t); if (s.t <= 0) { s.up = false; s.mode = 'stand'; s.cd = pick(r, C.cd); } break;
    default: s.mode = 'stand'; s.up = false;
  }
}

/* A BLOW THAT LANDS ON IT. A windup cut short is gone (a small one flinches: src/main.js flinch); Bruin is only braced while he charges (no cancel, full damage). Returns what was cancelled or null */
export function beastStruck(s) {
  const C = BEAST_BODY[s.kind];
  if (s.kind === 'bruin') { if (s.mode === 'maulTell') { s.mode = 'stand'; s.up = false; s.cd = Math.max(s.cd, 1.0); return 'maul'; } return null; }   /* the chargeTell is told for 0.8 s and a hero's blow does not stop a bear that has decided */
  if (s.mode === 'snapTell' || s.mode === 'leapTell') { const m = s.mode; s.mode = 'stand'; s.cd = Math.max(s.cd, 1.1); s.lift = 0; return m; }
  if (s.mode === 'biteTell' || s.mode === 'pounceTell') { const m = s.mode; s.mode = 'stand'; s.cd = Math.max(s.cd, 1.2); s.ringX = null; return m; }
  return null;
}
/* THE PARRY: a hero's shield raised as the blow lands turns the beast - the windfall (yelps, flung / staggered / on his back legs) */
export function beastParried(s) {
  const C = BEAST_BODY[s.kind];
  if (s.kind === 'snowrunner') { s.mode = 'parried'; s.t = C.parried; s.open = C.parried; s.lift = 0; return 'parried'; }
  if (s.kind === 'greymane') { s.mode = 'staggered'; s.t = C.parried; s.open = C.parried; return 'staggered'; }
  s.mode = 'rearOpen'; s.t = C.parried; s.open = C.parried; s.up = true; return 'rearOpen';
}
/* the pounce found its hero: he is held; any ally hit on the greymane frees him early */
export function greymanePinned(s) { s.pounceHit = true; }
export function greymaneFreed(s) { if (s.mode === 'pin') s.freed = true; }
/* the pack's leader died: every runner hesitates (told: ears down) */
export const runnerHesitate = s => { s.hesitate = SNOWRUNNER.hesitate; s.hadLeader = false; };
/* how a beast is read by the draw: the sprite frame index (0-based; the sheets list them in beasts_art.js) */
export const BEAST_FRAMES = {   /* snowrunner 13 frames, greymane 14, bruin 16 (src/redraw/beasts_art.js): idle 0-1, then the walk/run 2-5 */
  snowrunner: { idle: 0, run: 2, snapTell: 6, snap: 7, leapTell: 8, leap: 9, skid: 10, hurt: 11, death: 12, parried: 11 },
  greymane: { idle: 0, walk: 2, biteTell: 6, bite: 7, pounceTell: 8, pounce: 9, pin: 10, winded: 11, hurt: 12, death: 13, landed: 9, staggered: 12 },
  bruin: { idle: 0, walk: 2, maulTell: 6, maul: 8, chargeTell: 9, charge: 10, dazed: 13, hurt: 14, death: 15, rearOpen: 7 },   /* charge runs 10-12 */
};
export function beastFrame(s, anim = 0, hurt = false) {
  const F = BEAST_FRAMES[s.kind];
  if (hurt) return F.hurt;
  if (s.kind === 'bruin' && s.mode === 'charge') return F.charge + Math.floor(anim * 12) % 3;
  if (F[s.mode] !== undefined && s.mode !== 'stand') return F[s.mode];
  if (s.mode === 'orbit' || s.mode === 'walk' || s.mode === 'trot' || s.mode === 'runOut') return (s.kind === 'snowrunner' ? F.run : F.walk) + Math.floor(anim * (s.mode === 'orbit' || s.mode === 'runOut' ? 14 : 7)) % 4;
  return F.idle + (Math.floor(anim * 1.4) % 2);
}
