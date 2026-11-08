// src/bones.js - THE SKELETON SET: SKELETON SOLDIER, SKELETON ARCHER, SKELETON MAGE (act IV haunted). claude/foes, 11-08 (scratch/lane-reports/wolves-plan.md, section 2).
// PURE, no DOM: tools/bones.mjs drives it headless; src/bones-hands.js binds it to the game. ONE human-size body (10x20) shared by three kits: grave-brown bone, rusted mail
// scraps, dark sockets with a faint green ember. NOT a goblin: bonegob throws its skull, bonearcher is the 8x10 goblin archer; NOT the desert tomb guard (khopesh, leap-chop).
// Every attack is TOLD (a windup mode ending 'Tell', its mark, a pose, a sound) and ANSWERED (src/marks.js ANSWER / HEIGHT):
//   SOLDIER  thrustTell !  (BLOCK; parry = shield arm thrown wide, open) | rushTell !! (JUMP over: he runs on, his back is open 0.6 s)   + a SHIELD GUARD: the front is warded x0.4
//   ARCHER   aimTell !     (BLOCK or DUCK: a flat shot, HIGH)           | volleyTell !! (DODGE out of three bone-dust marks; three lobbed arrows)
//   MAGE     wispTell !    (BLOCK, or strike the wisp: a weakly HOMING bolt) | graveTell !! (JUMP the crest of a travelling line of bone hands)  + a told BACKSTEP blink
// FLAG: BONES_SHIPS gates PLACEMENT only (src/bones-placements.js; no live level holds one while false, no bestiary card). The spawn cases and the dev pen work for tools.
import { nearestHero } from './mummer.js';

export const BONES_SHIPS = false;
export const BONE_IDS = ['skelsoldier', 'skelarcher', 'skelmage'];
export const isBone = t => BONE_IDS.includes(t);

/* NUMBERS (BASE: the act dial multiplies commons - act IV x3.0 dmg / x1.05 hp, foe-react.js ACTS) */
export const SOLDIER = { w: 10, h: 20, hp: 44, walk: 32, sight: 300, sightY: 120, first: 1.0, cd: [1.2, 2.2],
  thrustTell: 0.5, thrustReach: 30, thrustT: 0.14, thrustDmg: 10, thrustRest: 0.7, parried: 1.2,
  rushTell: 0.7, rushLen: 80, rushT: 0.36, rushDmg: 8, rushShove: 60, turn: 0.6, rushRest: 0.6,
  wardK: 0.4, broken: 1.5 };
export const ARCHER = { w: 10, h: 20, hp: 22, walk: 28, keepMin: 100, keepMax: 200, sight: 420, sightY: 130, first: 1.2, cd: [1.6, 2.6],
  aimTell: 0.8, shotDmg: 9, shotSpeed: 260, shotLife: 1.6, shotY: 13, rest: 0.5,
  volleyTell: 1.0, volleyN: 3, volleyGap: 0.18, volleyDmg: 6, volleySpread: 34, volleyFlight: 1.0, volleyRest: 0.7, g: 520, motes: 3 };
export const MAGE = { w: 10, h: 20, hp: 18, walk: 24, keepMin: 120, keepMax: 180, sight: 400, sightY: 130, first: 1.2, cd: [1.8, 2.8],
  wispTell: 0.9, wispDmg: 9, wispLife: 2.5, wispSpeed: 70, wispTurn: 60, wispR: 5, rest: 0.6,
  graveTell: 0.8, graveSpeed: 180, graveLen: 160, graveDmg: 10, graveRest: 0.8, graveH: 14,
  blinkR: 36, blinkTell: 0.3, blinkMin: 80, blinkMax: 120, blinkCd: 4 };
export const BONE_DMG = { skelThrust: SOLDIER.thrustDmg, skelRush: SOLDIER.rushDmg, skelShot: ARCHER.shotDmg, skelVolley: ARCHER.volleyDmg, skelWisp: MAGE.wispDmg, skelGrave: MAGE.graveDmg };
export const BONE_BODY = { skelsoldier: SOLDIER, skelarcher: ARCHER, skelmage: MAGE };
export const BONE_TELLS = { 'skelsoldier|thrustTell': '!', 'skelsoldier|rushTell': '!!', 'skelarcher|aimTell': '!', 'skelarcher|volleyTell': '!!', 'skelmage|wispTell': '!', 'skelmage|graveTell': '!!' };
/* the modes that ARE the blow (never one of src/duck.js AT_REST's resting names) */
export const BONE_BLOW_MODES = new Set(['thrust', 'rush', 'shoot', 'volley', 'cast', 'grave']);
export const BONE_OPEN_MODES = new Set(['parried', 'overshoot']);

const sgn = v => (v < 0 ? -1 : 1);
const pick = (r, [a, b]) => a + (b - a) * r();
const clamp = (v, a, b) => Math.max(a, Math.min(b, v));

export function newBone(kind, x, y, face = -1, o = {}) {
  const C = BONE_BODY[kind];
  return { kind, x, y, face, mode: 'stand', t: 0, vx: 0, open: 0, atk: 0, cd: C.first, guardDown: 0, turnT: 0, aim: null, spots: null, blinkCd: 0, ...o };
}
export const boneBusy = s => !!s && (/Tell$/.test(s.mode) || BONE_BLOW_MODES.has(s.mode) || s.mode === 'blink');

/* the soldier's SHIELD GUARD (src/bones-hands.js take): a blow into his FRONT is warded x0.4 (never immune, B15) while the shield is up. Broken by a HEAVY blow (the shield is knocked
   aside 1.5 s), a PARRY of his thrust (guardDown from beastParried), a blow from BEHIND (jump over him / a co-op partner) or from ABOVE (a plunge). Returns { k, say } */
export function soldierTake(s, fromX, o = {}) {
  const C = SOLDIER, front = sgn(fromX - s.x) === s.face || fromX === s.x;
  if (o.heavy) { s.guardDown = Math.max(s.guardDown, C.broken); return { k: 1, say: 'SHIELD KNOCKED ASIDE', broke: true }; }
  if (s.guardDown > 0) return { k: 1, say: '' };
  if (o.plunge) return { k: 1, say: 'FROM ABOVE' };
  if (!front) return { k: 1, say: 'FROM BEHIND' };
  return { k: C.wardK, say: 'WARDED', warded: true };
}

/* ONE FRAME. w = { heroes, canStep(x, dir), floorOk(x) -> bool (a floor under x, no wall in the way: for the blink), rand(), busy, tokWait, taken }.
   Events: tell {move, mark, dur, motes?}, strike {...}, shot {x,y,vx,vy,dmg}, volley {spots, ...}, wisp {x,y,dir}, grave {x,dir,len,speed}, blinkTell, blink {x0,x1}, open, cancel */
export function boneStep(s, w, dt) {
  const evs = [], C = BONE_BODY[s.kind]; s.vx = 0;
  if (s.open > 0) s.open = Math.max(0, s.open - dt);
  if (s.guardDown > 0) s.guardDown = Math.max(0, s.guardDown - dt);
  if (s.blinkCd > 0) s.blinkCd = Math.max(0, s.blinkCd - dt);
  const near = nearestHero(s, w.heroes, C.sight, C.sightY);
  const canStep = dir => !w.canStep || w.canStep(s.x, dir);
  const busyElse = !!w.busy || !!w.tokWait;
  if (s.kind === 'skelsoldier') soldierStep(s, w, dt, C, near, evs, canStep, busyElse);
  else if (s.kind === 'skelarcher') archerStep(s, w, dt, C, near, evs, canStep, busyElse);
  else mageStep(s, w, dt, C, near, evs, canStep, busyElse);
  return evs;
}

function soldierStep(s, w, dt, C, near, evs, canStep, busyElse) {
  const r = w.rand || Math.random;
  switch (s.mode) {
    case 'stand': case 'walk': {
      s.mode = 'stand'; if (s.turnT > 0) s.turnT -= dt;
      if (!near) break;
      if (s.turnT <= 0) s.face = sgn(near.x - s.x) || s.face;
      s.cd -= dt;
      const d = Math.abs(near.x - s.x), dy = Math.abs((near.y || 0) - s.y), ready = s.cd <= 0 && !busyElse && s.turnT <= 0;
      if (ready && d <= C.thrustReach + 8 && dy < 30) { s.mode = 'thrustTell'; s.t = C.thrustTell; s.atk++; evs.push({ t: 'tell', move: 'thrustTell', mark: '!', dur: C.thrustTell }); break; }
      if (ready && d >= 44 && d <= C.rushLen + 16 && dy < 30 && r() < 0.5) { s.mode = 'rushTell'; s.t = C.rushTell; s.atk++; evs.push({ t: 'tell', move: 'rushTell', mark: '!!', dur: C.rushTell }); break; }
      if (d > 26 && s.turnT <= 0 && canStep(s.face)) { s.vx = s.face * C.walk; s.mode = 'walk'; }
      break; }
    case 'thrustTell': s.t -= dt; if (near) s.face = sgn(near.x - s.x) || s.face; if (s.t <= 0) { s.mode = 'thrust'; s.t = C.thrustT; } break;
    case 'thrust': { s.t -= dt; const x0 = s.face > 0 ? s.x : s.x - (C.thrustReach + 6);
      evs.push({ t: 'strike', move: 'thrustTell', blow: 'THE THRUST', atk: s.atk, dmg: C.thrustDmg, box: [x0, x0 + C.thrustReach + 6, s.y - 16, s.y - 6], key: 'skelThrust' });
      if (s.t <= 0) { s.mode = 'thrustRest'; s.t = C.thrustRest; } break; }
    case 'thrustRest': s.t -= dt; if (s.t <= 0) { s.mode = 'stand'; s.cd = pick(r, C.cd); } break;
    case 'rushTell': s.t -= dt; if (near) s.face = sgn(near.x - s.x) || s.face; if (s.t <= 0) { s.mode = 'rush'; s.t = C.rushT; s.turnT = C.turn + C.rushT; } break;
    case 'rush': { s.t -= dt; if (canStep(s.face)) s.vx = s.face * (C.rushLen / C.rushT);
      evs.push({ t: 'strike', move: 'rushTell', blow: 'THE SHIELD RUSH', atk: s.atk, dmg: C.rushDmg, box: [s.x - 7, s.x + 7, s.y - 14, s.y], unblock: true, key: 'skelRush', shove: C.rushShove * s.face });
      if (s.t <= 0) { s.mode = 'overshoot'; s.t = C.turn + C.rushRest; } break; }
    case 'overshoot': s.t -= dt; if (s.turnT > 0) s.turnT -= dt; if (s.t <= 0) { s.mode = 'stand'; s.turnT = 0; s.cd = pick(r, C.cd); } break;   /* his back is open until he turns (turnT) */
    case 'parried': s.t -= dt; if (s.t <= 0) { s.mode = 'stand'; s.cd = pick(r, C.cd); } break;
    default: s.mode = 'stand';
  }
}

function archerStep(s, w, dt, C, near, evs, canStep, busyElse) {
  const r = w.rand || Math.random;
  switch (s.mode) {
    case 'stand': case 'walk': {
      s.mode = 'stand';
      if (!near) break;
      s.face = sgn(near.x - s.x) || s.face; s.cd -= dt;
      const d = Math.abs(near.x - s.x), ready = s.cd <= 0 && !busyElse;
      if (ready && d >= 60 && d <= C.keepMax + 60) {
        if (r() < 0.55) { s.mode = 'aimTell'; s.t = C.aimTell; s.atk++; s.aim = { x: near.x, y: (near.y || s.y) - 11 }; evs.push({ t: 'tell', move: 'aimTell', mark: '!', dur: C.aimTell }); break; }
        s.mode = 'volleyTell'; s.t = C.volleyTell; s.atk++; const base = near.x, sp = C.volleySpread;
        s.spots = [base - sp, base, base + sp].slice(0, C.volleyN);
        evs.push({ t: 'tell', move: 'volleyTell', mark: '!!', dur: C.volleyTell, spots: s.spots.slice() }); break; }
      /* he keeps his distance: backs off a hero who comes in, comes up to one who stands off */
      if (d < C.keepMin && canStep(-s.face)) { s.vx = -s.face * C.walk; s.mode = 'walk'; }
      else if (d > C.keepMax && canStep(s.face)) { s.vx = s.face * C.walk * 0.8; s.mode = 'walk'; }
      break; }
    case 'aimTell': s.t -= dt; if (near) { s.face = sgn(near.x - s.x) || s.face; s.aim = { x: near.x, y: (near.y || s.y) - 11 }; }
      if (s.t <= 0) { s.mode = 'shoot'; s.t = 0.12; const o = { x: s.x + s.face * 8, y: s.y - C.shotY }, a = s.aim || { x: s.x + s.face * 150, y: s.y - 7 };
        const dx = a.x - o.x, dy = a.y - o.y, len = Math.hypot(dx, dy) || 1;
        evs.push({ t: 'shot', x: o.x, y: o.y, vx: dx / len * C.shotSpeed, vy: dy / len * C.shotSpeed, dmg: C.shotDmg, key: 'skelShot', life: C.shotLife, atk: s.atk }); }
      break;
    case 'shoot': s.t -= dt; if (s.t <= 0) { s.mode = 'shootRest'; s.t = C.rest; } break;
    case 'shootRest': s.t -= dt; if (s.t <= 0) { s.mode = 'stand'; s.cd = pick(r, C.cd); s.aim = null; } break;
    case 'volleyTell': s.t -= dt; if (near) s.face = sgn(near.x - s.x) || s.face;
      if (s.t <= 0) { s.mode = 'volley'; s.t = C.volleyGap * C.volleyN + 0.1; s.fired = 0; s.volT = 0; } break;
    case 'volley': s.t -= dt; s.volT += dt;
      while (s.fired < C.volleyN && s.volT >= s.fired * C.volleyGap) {
        const sx = s.spots[s.fired], o = { x: s.x + s.face * 6, y: s.y - 18 }, T = C.volleyFlight;   /* a lob: it lands on its mote T s later (y: the floor line) */
        evs.push({ t: 'lob', x: o.x, y: o.y, spot: sx, vx: (sx - o.x) / T, vy: ((s.y - 2) - o.y - 0.5 * C.g * T * T) / T, g: C.g, dmg: C.volleyDmg, key: 'skelVolley', life: T + 0.4, atk: s.atk, i: s.fired });
        s.fired++; }
      if (s.t <= 0) { s.mode = 'volleyRest'; s.t = C.volleyRest; s.spots = null; } break;
    case 'volleyRest': s.t -= dt; if (s.t <= 0) { s.mode = 'stand'; s.cd = pick(r, C.cd); } break;
    default: s.mode = 'stand';
  }
}

/* THE BACKSTEP target: away from ALL heroes, 80-120 px, onto a floor (never off a ledge, never into a wall); tries the far side first, then the other; null if neither is clear */
export function blinkTarget(s, w, C = MAGE) {
  const r = w.rand || Math.random, heroes = (w.heroes || []).filter(h => h.alive !== false);
  const awayDir = heroes.length ? sgn(s.x - heroes.reduce((a, h) => a + h.x, 0) / heroes.length) : -s.face;
  for (const dir of [awayDir, -awayDir]) {
    for (let k = 0; k < 4; k++) { const dist = C.blinkMin + (C.blinkMax - C.blinkMin) * (k === 0 ? r() : (k - 1) / 2), x = s.x + dir * dist;
      if (w.floorOk && !w.floorOk(x, dir)) continue;
      if (heroes.every(h => Math.abs(h.x - x) > C.blinkR + 4)) return x; } }
  return null;
}

function mageStep(s, w, dt, C, near, evs, canStep, busyElse) {
  const r = w.rand || Math.random;
  switch (s.mode) {
    case 'stand': case 'walk': {
      s.mode = 'stand';
      if (!near) break;
      s.face = sgn(near.x - s.x) || s.face; s.cd -= dt;
      const d = Math.abs(near.x - s.x), dy = Math.abs((near.y || 0) - s.y), ready = s.cd <= 0 && !busyElse;
      /* THE BACKSTEP (not an attack): a hero inside 36 px -> a told green puff, then a blink clear of ALL heroes */
      if (s.blinkCd <= 0 && heroesWithin(w, s, C.blinkR) && !busyElse) { const tx = blinkTarget(s, w, C); if (tx != null) { s.mode = 'blinkTell'; s.t = C.blinkTell; s.blinkX = tx; evs.push({ t: 'blinkTell', x: s.x }); break; } }
      if (ready && d >= 60 && d <= C.keepMax + 50) {
        if (d <= 160 && dy < 30 && r() < 0.4) { s.mode = 'graveTell'; s.t = C.graveTell; s.atk++; evs.push({ t: 'tell', move: 'graveTell', mark: '!!', dur: C.graveTell }); break; }
        s.mode = 'wispTell'; s.t = C.wispTell; s.atk++; evs.push({ t: 'tell', move: 'wispTell', mark: '!', dur: C.wispTell }); break; }
      if (d < C.keepMin && canStep(-s.face)) { s.vx = -s.face * C.walk; s.mode = 'walk'; }
      else if (d > C.keepMax && canStep(s.face)) { s.vx = s.face * C.walk * 0.8; s.mode = 'walk'; }
      break; }
    case 'blinkTell': s.t -= dt;
      if (s.t <= 0) { const x1 = s.blinkX; evs.push({ t: 'blink', x0: s.x, x1 }); s.x = x1; s.mode = 'blinkRest'; s.t = 0.25; s.blinkCd = C.blinkCd; } break;
    case 'blinkRest': s.t -= dt; if (s.t <= 0) { s.mode = 'stand'; } break;
    case 'wispTell': s.t -= dt; if (near) s.face = sgn(near.x - s.x) || s.face;
      if (s.t <= 0) { s.mode = 'cast'; s.t = 0.15; evs.push({ t: 'wisp', x: s.x + s.face * 8, y: s.y - 20, dir: s.face, atk: s.atk, dmg: C.wispDmg, key: 'skelWisp', life: C.wispLife }); } break;
    case 'cast': s.t -= dt; if (s.t <= 0) { s.mode = 'castRest'; s.t = C.rest; } break;
    case 'castRest': s.t -= dt; if (s.t <= 0) { s.mode = 'stand'; s.cd = pick(r, C.cd); } break;
    case 'graveTell': s.t -= dt; if (near) s.face = sgn(near.x - s.x) || s.face;
      if (s.t <= 0) { s.mode = 'grave'; s.t = 0.2; evs.push({ t: 'grave', x: s.x + s.face * 8, dir: s.face, len: C.graveLen, speed: C.graveSpeed, atk: s.atk, dmg: C.graveDmg, key: 'skelGrave' }); } break;
    case 'grave': s.t -= dt; if (s.t <= 0) { s.mode = 'graveRest'; s.t = C.graveRest; } break;
    case 'graveRest': s.t -= dt; if (s.t <= 0) { s.mode = 'stand'; s.cd = pick(r, C.cd); } break;
    default: s.mode = 'stand';
  }
}
const heroesWithin = (w, s, R) => (w.heroes || []).some(h => h.alive !== false && Math.abs(h.x - s.x) <= R && Math.abs((h.y || 0) - s.y) < 40);

/* THE BONE WISP in flight: slow, WEAKLY homing (turns at most MAGE.wispTurn deg/s toward the nearest hero), dies at its life. {x,y,ang(rad),life}. Returns false when spent */
export function wispStep(p, heroes, dt, C = MAGE) {
  p.life -= dt; if (p.life <= 0) return false;
  let best = null, bd = 1e9; for (const h of heroes || []) { if (h.alive === false) continue; const d = Math.hypot(h.x - p.x, (h.y - 8) - p.y); if (d < bd) { bd = d; best = h; } }
  if (best) { const want = Math.atan2((best.y - 8) - p.y, best.x - p.x); let da = want - p.ang; while (da > Math.PI) da -= 2 * Math.PI; while (da < -Math.PI) da += 2 * Math.PI;
    const cap = C.wispTurn * Math.PI / 180 * dt; p.ang += clamp(da, -cap, cap); }
  p.x += Math.cos(p.ang) * C.wispSpeed * dt; p.y += Math.sin(p.ang) * C.wispSpeed * dt; return true;
}
/* THE GRAVE ROW: a crest of bone hands running along the floor at graveSpeed for graveLen. {x0,dir,run}. Returns the crest's x, or null when spent */
export function graveStep(g, dt, C = MAGE) { g.run += C.graveSpeed * dt; if (g.run > g.len) return null; return g.x0 + g.dir * g.run; }

/* A BLOW ON AN ARCHER OR A MAGE: any blow cancels what they are telling (the casting mage: any blow cancels a cast) */
export function boneStruck(s) {
  if (s.kind === 'skelsoldier') { if (s.mode === 'thrustTell' || s.mode === 'rushTell') { const m = s.mode; s.mode = 'stand'; s.cd = Math.max(s.cd, 1.0); return m; } return null; }
  const tells = s.kind === 'skelarcher' ? ['aimTell', 'volleyTell'] : ['wispTell', 'graveTell', 'blinkTell'];
  if (tells.includes(s.mode)) { const m = s.mode; s.mode = 'stand'; s.cd = Math.max(s.cd, 1.2); s.spots = null; s.aim = null; return m; }
  return null;
}
/* THE PARRY: his thrust parried - the shield arm is thrown wide, open 1.2 s with the guard down. (An archer or a mage has nothing to parry but an arrow / a wisp: those are the hands'.) */
export function boneParried(s) {
  if (s.kind !== 'skelsoldier') return null;
  s.mode = 'parried'; s.t = SOLDIER.parried; s.open = SOLDIER.parried; s.guardDown = SOLDIER.parried; return 'parried';
}
/* the draw's frame: 0-1 idle, 2-5 walk, 6 hurt, 7 collapse heap, then each kit's own */
export const BONE_FRAMES = {
  skelsoldier: { idle: 0, walk: 2, hurt: 6, death: 7, thrustTell: 8, thrust: 9, rushTell: 10, rush: 11, parried: 12, overshoot: 11 },
  skelarcher: { idle: 0, walk: 2, hurt: 6, death: 7, aimTell: 8, shoot: 9, volleyTell: 10, volley: 11 },
  skelmage: { idle: 0, walk: 2, hurt: 6, death: 7, wispTell: 8, cast: 9, graveTell: 10, grave: 11, blinkTell: 12, blinkRest: 13 },
};
export function boneFrame(s, anim = 0, hurt = false) {
  const F = BONE_FRAMES[s.kind];
  if (hurt) return F.hurt;
  if (F[s.mode] !== undefined && s.mode !== 'stand') return F[s.mode];
  if (s.mode === 'walk') return F.walk + Math.floor(anim * 6) % 4;
  return F.idle + (Math.floor(anim * 1.2) % 2);
}
