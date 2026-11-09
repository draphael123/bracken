// src/beasts.js - THE WOLF PAIR AND THE BEAR (claude/beastsbones, plan scratch/lane-reports/wolves-plan.md section 1; Daniel approved 11-08 14:46-14:49): SNOWRUNNER, GREYMANE, BRUIN.
// Pure, no DOM: tools/beasts.mjs drives it headless; src/beasts-hands.js binds it to the game (damage, pin, marks, sounds, the pack rules).
//
//   Not the goblin WAR HOUND (a brown dog that runs and leaps LOW, handler-released) nor THE GREAT HOUND (the act-I mini): these are pale frost beasts that CIRCLE as a pack,
//   never rush in a straight line, and whose dangerous blow is HIGH (duck), not low.
//   SNOWRUNNER (fast, weak): SNAP (yellow !, block/parry, then it RUNS OUT: hit and run) and THROAT LEAP (red !!, head height: DUCK or roll; a miss skids open 0.5 s).
//   GREYMANE (heavy, slow, leads): CRUSHING BITE (yellow !, block; a parry staggers him) and POUNCE-PIN (red !!, a frost RING marks the landing, dodge out; hit = PIN 0.6 s; miss = winded).
//   BRUIN (the heavy animal): MAUL (yellow !: he STANDS AND ROARS first; block, parry = staggered on his back legs) and CHARGE (red !!: a lane scraped on the floor, ROLL through;
//           dazed at a wall, a skid in the open). Too tall to jump, unlike the boar.
// BEASTS_SHIPS is the family flag: false = no live level places any of them and no bestiary card; the spawn cases and the dev pen still work for tools.
// A foe's state is kept in e.st; the step sets s.vx (px/s) and may set s.vy (a launch); the HOST moves the body, integrates gravity, and tells the step when it lands (beastLanded).
import { nearestHero } from './mummer.js';

export const BEASTS_SHIPS = false;
/* the short words that float over the beasts (src/main.js adds them to MOVE_WORDS) */
export const BEAST_SAY = { yelp: 'YELPS', winded: 'WINDED', pinned: 'PINNED', dazed: 'DAZED', hesitate: 'EARS DOWN', braced: 'BRACED', freed: 'FREED' };

export const SNOW = { w: 18, h: 10, hp: 18, run: 130, orbitMin: 60, orbitMax: 110, sight: 340, sightY: 90, flipMin: 0.8, flipMax: 1.6,
  snapTell: 0.40, snapRange: 70, snapReach: 40, snap: 0.12, snapSpeed: 330, snapDmg: 6, runOut: 0.7, yelp: 1.0,
  leapTell: 0.55, leapMin: 70, leapMax: 100, leapT: 0.4, leapOver: 40, leapDmg: 8, leapG: 900, skid: 0.5, hitRecover: 0.5, cd: 1.5, chill: 0.15, hesitate: 1.2 };
export const GREY = { w: 26, h: 15, hp: 70, walk: 40, trot: 70, sight: 380, sightY: 100, biteRange: 70, biteTell: 0.65, biteReach: 60, bite: 0.15, biteSpeed: 400, biteDmg: 12, biteRecover: 0.8, biteStagger: 1.2, biteBlockPush: 20,
  pounceMin: 90, pounceMax: 140, pounceTell: 0.85, pounceT: 0.6, pounceG: 900, pounceR: 24, pounceDmg: 14, pin: 0.6, winded: 1.0, pounceRecover: 0.7, cd: 2.2, poiseBar: 0.22, poiseDecay: 8, hold: 0.9 };
export const BRUIN = { w: 28, h: 16, hStand: 22, hp: 120, walk: 30, sight: 360, sightY: 100, mauls: 64, maulTell: 0.9, maulReach: 40, maul: 0.2, maulDmg: 14, maulRecover: 0.9, maulStagger: 1.5,
  chargeMin: 90, chargeMax: 220, chargeTell: 0.8, chargeSpeed: 210, chargeRun: 200, chargeDmg: 16, chargeDown: 0.9, dazed: 1.2, skid: 0.6, cd: 2.4, poise: 40 };

const rnd = s => { s.seed = (s.seed * 1664525 + 1013904223) >>> 0; return s.seed / 4294967296; };
const sgn = (a, b) => Math.sign(a - b);
const mk = (k, x, y, face, extra) => ({ kind: k, x, y, face, mode: 'stand', t: 0, vx: 0, vy: 0, air: false, cd: 0.6 + (Math.abs(x) % 5) * 0.15, seed: (Math.floor(x) * 6007 + k.length * 97 + 5) >>> 0,
  open: false, hit: false, hesitate: 0, last: '', ...extra });
export const newSnowrunner = (x, y, face = -1) => mk('snowrunner', x, y, face, { orbitDir: 1, orbitT: 1, orbitR: 85, tid: -1 });
export const newGreymane = (x, y, face = -1) => mk('greymane', x, y, face, { poise: 0, landX: 0, tid: -1 });
export const newBruin = (x, y, face = -1) => mk('bruin', x, y, face, { laneX0: 0, laneX1: 0, runDist: 0 });

/* THE TARGET: the nearest upright hero in sight; in co-op a pack member prefers a hero no other has chosen (w.taken: ids already picked), so the runners SPREAD */
export function pickTarget(s, w, C) {
  const hs = (w.heroes || []).filter(h => h.alive !== false && Math.abs(h.x - s.x) <= C.sight && Math.abs((h.y || 0) - (s.y || 0)) <= C.sightY);
  if (!hs.length) { s.tid = -1; return null; }
  const free = hs.filter(h => !(w.taken || []).includes(h.id)), pool = free.length ? free : hs;
  const keep = pool.find(h => h.id === s.tid); if (keep) return keep;
  const b = pool.reduce((a, h) => Math.abs(h.x - s.x) < Math.abs(a.x - s.x) ? h : a); s.tid = b.id; return b;
}
const frontBox = (s, reach, h, back = 4) => { const x0 = s.face > 0 ? s.x - back : s.x - reach, x1 = s.face > 0 ? s.x + reach : s.x + back; return [x0, x1, s.y - h, s.y]; };
const canGo = (w, s, dir) => !w.canStep || w.canStep(s.x, dir);

/* ------------------------------------------------------------------ SNOWRUNNER ------------------------------------------------------------------ */
export function snowStep(s, w, dt) {
  const evs = [], C = SNOW; s.vx = 0; s.cd = Math.max(0, s.cd - dt); s.hesitate = Math.max(0, s.hesitate - dt);
  const tgt = pickTarget(s, w, C);
  switch (s.mode) {
    case 'stand': case 'walk': {
      if (!tgt) { s.mode = 'stand'; break; }
      s.face = sgn(tgt.x, s.x) || s.face; const d = Math.abs(tgt.x - s.x), side = s.face;
      s.orbitT -= dt; if (s.orbitT <= 0) { s.orbitDir = -s.orbitDir; s.orbitT = C.flipMin + rnd(s) * (C.flipMax - C.flipMin); s.orbitR = C.orbitMin + 10 + rnd(s) * (C.orbitMax - C.orbitMin - 20); }
      if (s.hesitate > 0) { s.mode = 'stand'; s.ears = true; break; }   /* the leader is down: ears down, told */
      s.ears = false;
      if (s.cd <= 0 && w.canAttack !== false && !w.hold) {
        if (d <= C.snapRange && (s.last !== 'snap' || d < C.leapMin)) { s.last = 'snap'; s.mode = 'snapTell'; s.t = C.snapTell; evs.push({ t: 'snapTell', dur: C.snapTell }); break; }
        if (d >= C.leapMin && d <= C.leapMax) { s.last = 'leap'; s.mode = 'leapTell'; s.t = C.leapTell; evs.push({ t: 'leapTell', dur: C.leapTell }); break; }
      }
      /* circle: close to the orbit radius, then run along it, both sides of you (the pack's pincer) */
      let dir = 0;
      if (d > s.orbitR + 14) dir = side; else if (d < s.orbitR - 14) dir = -side; else dir = s.orbitDir * side * 0.6;   /* tangential: hold the ring, drift to one side then the other */
      if (dir && canGo(w, s, Math.sign(dir))) { s.vx = Math.sign(dir) * C.run * (Math.abs(dir) < 1 ? 0.6 : 1); s.mode = 'walk'; } else s.mode = 'stand';
      break; }
    case 'snapTell': if (tgt) s.face = sgn(tgt.x, s.x) || s.face; s.t -= dt; if (s.t <= 0) { s.mode = 'snap'; s.t = C.snap; s.hit = false; s.vx = s.face * C.snapSpeed; evs.push({ t: 'snap', dmg: C.snapDmg, box: frontBox(s, C.snapReach, C.h) }); } break;
    case 'snap': s.vx = s.face * C.snapSpeed; s.t -= dt; if (s.t <= 0 || !canGo(w, s, s.face)) { s.mode = 'recover'; s.t = C.runOut; s.run = true; s.cd = C.cd; s.vx = 0; } break;
    case 'recover':   /* after a snap it RUNS OUT to orbit range: hit and run; after a landed leap it just shakes itself */
      if (s.run && tgt) { const d = Math.abs(tgt.x - s.x); s.face = sgn(tgt.x, s.x) || s.face; if (d < s.orbitR + 10 && canGo(w, s, -s.face)) s.vx = -s.face * C.run; else s.t = Math.min(s.t, 0.1); }
      s.t -= dt; if (s.t <= 0) { s.mode = 'stand'; s.run = false; }
      break;
    case 'leapTell': if (tgt) s.face = sgn(tgt.x, s.x) || s.face; s.t -= dt; if (s.t <= 0) {
      const tx = tgt ? tgt.x + s.face * C.leapOver : s.x + s.face * 80, vx = Math.max(140, Math.min(340, Math.abs(tx - s.x) / C.leapT)) * s.face;
      s.mode = 'leap'; s.t = 0; s.hit = false; s.tried = false; s.vx = vx; s.vy = -0.5 * C.leapG * C.leapT; s.air = true; evs.push({ t: 'leap', dmg: C.leapDmg, vx, vy: s.vy }); }
      break;
    case 'leap': s.vx = s.vx; s.t += dt; break;   /* the host keeps the launch velocity and calls beastLanded() on touchdown */
    case 'skid': s.t -= dt; s.open = true; s.vx = s.face * Math.max(0, 80 * (s.t / C.skid)); if (s.t <= 0) { s.mode = 'stand'; s.open = false; s.cd = Math.max(s.cd, 0.5); } break;   /* a missed leap: skids, OPEN */
    case 'stunned': s.t -= dt; s.open = true; if (s.t <= 0) { s.mode = 'stand'; s.open = false; s.cd = Math.max(s.cd, 0.6); } break;   /* a parried snap: yelps, flung, open */
    default: s.mode = 'stand';
  }
  return evs;
}

/* ------------------------------------------------------------------- GREYMANE ------------------------------------------------------------------- */
export function greyStep(s, w, dt) {
  const evs = [], C = GREY; s.vx = 0; s.cd = Math.max(0, s.cd - dt); s.poise = Math.max(0, s.poise - C.poiseDecay * dt);
  const tgt = pickTarget(s, w, C);
  switch (s.mode) {
    case 'stand': case 'walk': {
      if (!tgt) { s.mode = 'stand'; break; }
      s.face = sgn(tgt.x, s.x) || s.face; const d = Math.abs(tgt.x - s.x);
      if (s.cd <= 0 && w.canAttack !== false) {
        if (d <= C.biteRange && Math.abs((tgt.y || 0) - s.y) < 40) { s.last = 'bite'; s.mode = 'biteTell'; s.t = C.biteTell; evs.push({ t: 'biteTell', dur: C.biteTell }); break; }
        if (d >= C.pounceMin - 10 && d <= C.pounceMax + 30) {
          const dist = Math.max(C.pounceMin, Math.min(C.pounceMax, d)); s.landX = s.x + s.face * dist; s.last = 'pounce'; s.mode = 'pounceTell'; s.t = C.pounceTell;
          evs.push({ t: 'pounceTell', dur: C.pounceTell, ring: { x: s.landX, r: C.pounceR } }); break; }
      }
      if (d > C.biteRange - 10 && canGo(w, s, s.face)) { s.vx = s.face * (d > 180 ? C.trot : C.walk); s.mode = 'walk'; } else s.mode = 'stand';
      break; }
    case 'biteTell': if (tgt) s.face = sgn(tgt.x, s.x) || s.face; s.t -= dt; if (s.t <= 0) { s.mode = 'bite'; s.t = C.bite; s.hit = false; s.vx = s.face * C.biteSpeed; evs.push({ t: 'bite', dmg: C.biteDmg, box: frontBox(s, C.biteReach, C.h, 6), push: C.biteBlockPush }); } break;
    case 'bite': s.vx = s.face * C.biteSpeed; s.t -= dt; if (s.t <= 0 || !canGo(w, s, s.face)) { s.mode = 'recover'; s.t = C.biteRecover; s.cd = C.cd; s.vx = 0; } break;
    case 'pounceTell': s.t -= dt; if (s.t <= 0) { const T = C.pounceT, vx = (s.landX - s.x) / T;
      s.mode = 'pounce'; s.t = 0; s.hit = false; s.vx = vx; s.vy = -0.5 * C.pounceG * T; s.air = true; evs.push({ t: 'pounce', dmg: C.pounceDmg, vx, vy: s.vy, ring: { x: s.landX, r: C.pounceR } }); } break;
    case 'pounce': s.t += dt; break;
    case 'pin': s.t -= dt; if (s.t <= 0) { s.mode = 'recover'; s.t = C.pounceRecover; s.cd = C.cd; } break;
    case 'winded': s.t -= dt; s.open = true; if (s.t <= 0) { s.mode = 'stand'; s.open = false; s.cd = Math.max(s.cd, 0.8); } break;   /* a missed pounce: lands WINDED, gold stars */
    case 'stunned': s.t -= dt; s.open = true; if (s.t <= 0) { s.mode = 'stand'; s.open = false; s.cd = Math.max(s.cd, 0.8); } break;   /* a parried bite */
    case 'recover': s.t -= dt; if (s.t <= 0) s.mode = 'stand'; break;
    default: s.mode = 'stand';
  }
  return evs;
}

/* --------------------------------------------------------------------- BRUIN --------------------------------------------------------------------- */
export function bruinStep(s, w, dt) {
  const evs = [], C = BRUIN; s.vx = 0; s.cd = Math.max(0, s.cd - dt);
  const tgt = pickTarget(s, w, C);
  switch (s.mode) {
    case 'stand': case 'walk': {
      if (!tgt) { s.mode = 'stand'; break; }
      s.face = sgn(tgt.x, s.x) || s.face; const d = Math.abs(tgt.x - s.x);
      if (s.cd <= 0 && w.canAttack !== false) {
        if (d <= C.mauls && Math.abs((tgt.y || 0) - s.y) < 40) { s.last = 'maul'; s.mode = 'maulTell'; s.t = C.maulTell; evs.push({ t: 'maulTell', dur: C.maulTell }); break; }
        if (d >= C.chargeMin && d <= C.chargeMax && canGo(w, s, s.face)) { s.last = 'charge'; s.mode = 'chargeTell'; s.t = C.chargeTell; s.laneX0 = s.x; s.laneX1 = s.x + s.face * C.chargeRun;
          evs.push({ t: 'chargeTell', dur: C.chargeTell, lane: [Math.min(s.laneX0, s.laneX1), Math.max(s.laneX0, s.laneX1)] }); break; }
      }
      if (d > C.mauls - 14 && canGo(w, s, s.face)) { s.vx = s.face * C.walk; s.mode = 'walk'; } else s.mode = 'stand';
      break; }
    case 'maulTell': if (tgt) s.face = sgn(tgt.x, s.x) || s.face; s.t -= dt; if (s.t <= 0) { s.mode = 'maul'; s.t = C.maul; s.hit = false; evs.push({ t: 'maul', dmg: C.maulDmg, box: frontBox(s, C.maulReach, C.hStand, 6) }); } break;
    case 'maul': s.t -= dt; if (s.t <= 0) { s.mode = 'recover'; s.t = C.maulRecover; s.cd = C.cd; } break;
    case 'chargeTell': s.t -= dt; if (s.t <= 0) { s.mode = 'charge'; s.t = 0; s.hit = false; s.tried = false; s.runDist = 0; evs.push({ t: 'charge', dmg: C.chargeDmg }); } break;
    case 'charge': {
      s.vx = s.face * C.chargeSpeed; s.runDist += C.chargeSpeed * dt;
      if (w.wallAhead && w.wallAhead(s.x, s.face)) { s.mode = 'dazed'; s.t = C.dazed; s.vx = 0; s.open = true; evs.push({ t: 'crash' }); }
      else if (s.runDist >= C.chargeRun || !canGo(w, s, s.face)) { s.mode = 'recover'; s.t = C.skid; s.cd = C.cd; s.vx = s.face * 60; s.open = true; evs.push({ t: 'skid' }); }
      break; }
    case 'dazed': s.t -= dt; s.open = true; if (s.t <= 0) { s.mode = 'stand'; s.open = false; s.cd = Math.max(s.cd, 0.8); } break;
    case 'stunned': s.t -= dt; s.open = true; if (s.t <= 0) { s.mode = 'stand'; s.open = false; s.cd = Math.max(s.cd, 0.8); } break;   /* a parried maul: on his back legs */
    case 'recover': s.t -= dt; if (s.open && s.t > 0) s.vx = s.face * 60 * (s.t / C.skid); if (s.t <= 0) { s.mode = 'stand'; s.open = false; } break;
    default: s.mode = 'stand';
  }
  return evs;
}

/* THE LANDING (the host says the body touched down after a leap / pounce). heroes: [{ x, y, alive, id }]. Returns events. */
export function beastLanded(s, heroes) {
  const evs = []; s.air = false; s.vy = 0; s.vx = 0;
  if (s.kind === 'snowrunner' && s.mode === 'leap') { s.mode = s.hit ? 'recover' : 'skid'; s.t = s.hit ? SNOW.hitRecover : SNOW.skid; s.run = false; s.cd = SNOW.cd; evs.push({ t: s.hit ? 'leapHit' : 'skid' }); }
  else if (s.kind === 'greymane' && s.mode === 'pounce') {
    const C = GREY, under = (heroes || []).filter(h => h.alive !== false && Math.abs(h.x - s.landX) <= C.pounceR && Math.abs((h.y || 0) - s.y) < 26);
    if (under.length && !s.hit) { s.hit = true; s.mode = 'pin'; s.t = C.pin; evs.push({ t: 'pounceHit', dmg: C.pounceDmg, pin: C.pin, heroes: under.map(h => h.id) }); }
    else { s.mode = 'winded'; s.t = C.winded; s.open = true; s.cd = C.cd; evs.push({ t: 'winded' }); }
  }
  return evs;
}
/* the airborne blow of a leap: the first hero whose body the beast's body overlaps, once per leap (the host sets s.hit when the blow LANDED; a duck or a roll through it leaves s.hit false, and the leap lands as a miss) */
export function airHit(s, heroes) {
  if (s.hit || s.tried || !s.air || s.mode !== 'leap') return null;
  const C = SNOW, hw = C.w / 2;
  for (const h of heroes || []) { if (h.alive === false) continue; const hx = h.w ? h.w / 2 : 5, hh = h.h || 14;
    if (Math.abs(h.x - s.x) <= hw + hx && s.y - C.h < h.y && s.y > h.y - hh) { s.tried = true; return h; } }
  return null;
}
/* the charge's body blow: once per charge, the first hero under the front half of the body */
export function chargeHit(s, heroes) {
  if (s.hit || s.tried || s.mode !== 'charge') return null; const C = BRUIN;
  for (const h of heroes || []) { if (h.alive === false) continue; const hx = h.w ? h.w / 2 : 5;
    const front = s.x + s.face * C.w / 2; if (Math.abs(h.x - front) <= hx + 8 && Math.abs((h.y || 0) - s.y) < 22) { s.tried = true; return h; } }
  return null;
}

/* A BLOW THAT LANDS ON A BEAST. b = { dmg, heavy }, hpMax. Returns 'cancel' when a tell was cut, 'flinch' for a small flinch, null otherwise.
   SNOWRUNNER (small): any blow flinches and cancels a tell. GREYMANE (medium bar): light cuts do not flinch him; the bar breaks (22% of his health, decaying) or a heavy blow staggers
   him and cancels a tell. BRUIN (heavy bar): braced (no flinch, FULL damage) while charging; a heavy blow in a tell staggers him. */
export function beastStruck(s, b, hpMax) {
  const told = /Tell$/.test(s.mode);
  if (s.kind === 'snowrunner') {
    if (told) { s.mode = 'recover'; s.t = 0.5; s.run = false; s.cd = Math.max(s.cd, 1.2); return 'cancel'; }
    if (s.mode === 'leap' || s.mode === 'snap') return null;   /* committed in the air or the dart: the blow lands, the beast goes on */
    return 'flinch';
  }
  if (s.kind === 'greymane') {
    s.poise += b.dmg; const broke = s.poise >= GREY.poiseBar * hpMax;
    if (broke || b.heavy) { s.poise = 0; if (told || s.mode === 'stand' || s.mode === 'walk') { const wasTold = told; s.mode = 'stunned'; s.t = 0.7; s.open = true; s.cd = Math.max(s.cd, 1.2); return wasTold ? 'cancel' : 'flinch'; } }
    return null;
  }
  if (s.kind === 'bruin') {
    if (s.mode === 'charge') return null;
    if (b.heavy && told) { s.mode = 'stunned'; s.t = 0.8; s.open = true; s.cd = Math.max(s.cd, 1.4); return 'cancel'; }
    return null;
  }
  return null;
}
/* A PARRY (the hero's shield on the beat): who is staggered, and for how long */
export function beastParried(s) {
  if (s.kind === 'snowrunner' && (s.mode === 'snap' || s.mode === 'recover' || s.mode === 'snapTell')) { s.mode = 'stunned'; s.t = SNOW.yelp; s.open = true; s.vx = -s.face * 120; return 'parry'; }
  if (s.kind === 'greymane' && (s.mode === 'bite' || s.mode === 'recover')) { s.mode = 'stunned'; s.t = GREY.biteStagger; s.open = true; s.vx = 0; return 'parry'; }
  if (s.kind === 'bruin' && (s.mode === 'maul' || s.mode === 'recover')) { s.mode = 'stunned'; s.t = BRUIN.maulStagger; s.open = true; return 'parry'; }
  return null;
}
/* Greymane down: the runners hesitate (ears down, told) */
export function beastHesitate(s, secs = SNOW.hesitate) { s.hesitate = Math.max(s.hesitate, secs); }

export const beastStep = (s, w, dt) => s.kind === 'snowrunner' ? snowStep(s, w, dt) : s.kind === 'greymane' ? greyStep(s, w, dt) : bruinStep(s, w, dt);
export const BEAST_HP = { snowrunner: SNOW.hp, greymane: GREY.hp, bruin: BRUIN.hp };
export const BEAST_SIZE = { snowrunner: SNOW, greymane: GREY, bruin: BRUIN };
export const BEAST_IDS = ['snowrunner', 'greymane', 'bruin'];
/* every told windup of the three and its mark / answer / height (checked against src/marks.js by tools/beasts.mjs) */
export const BEAST_TELLS = {
  'snowrunner|snapTell': ['!', 'block', 'low'], 'snowrunner|leapTell': ['!!', 'duck', 'high'],
  'greymane|biteTell': ['!', 'block', 'low'], 'greymane|pounceTell': ['!!', 'dodge', 'low'],
  'bruin|maulTell': ['!', 'block', 'low'], 'bruin|chargeTell': ['!!', 'dodge', 'low'],
};
