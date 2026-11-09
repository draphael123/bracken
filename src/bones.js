// src/bones.js - THE SKELETON SET: SKELETON SOLDIER, ARCHER and MAGE (claude/beastsbones, plan scratch/lane-reports/wolves-plan.md section 2; Daniel approved 11-08 14:46-14:49).
// Pure, no DOM: tools/bones.mjs drives it headless; src/bones-hands.js binds it to the game (damage, marks, arrows, wisps, the grave row, sounds).
//
//   WHO     One human-size body (10x20) in three kits: grave-brown bone, rusted mail scraps, dark sockets with a faint green ember. NOT a goblin (bonegob throws its skull),
//           not the desert's Tomb Guard (khopesh, leap-chop), not the zombie (grab) nor the dead apprentice (ember): act IV's haunted places' own dead soldiers.
//   SOLDIER A round shield up. Blows into his FRONT are warded x0.4 (never immune, B15) with a clank. Broken by: a HEAVY blow (shield knocked aside 1.5 s), a PARRY of his thrust,
//           a blow from BEHIND (jump over him, a partner) or from above (a plunge). THRUST over the rim (yellow !, block, parry opens him 1.2 s); SHIELD RUSH (red !!, low:
//           jump it, land behind him: his back is open until he turns 0.6 s).
//   ARCHER  Keeps 100-200 px, backs off a hero who closes. AIMED SHOT (yellow !, a glint line, a flat arrow: block it or duck, HEIGHT high); ARC VOLLEY (red !!, three bone-dust
//           motes mark the landing spots, three lobbed arrows: step out of the marks).
//   MAGE    Keeps 120-180 px. BONE WISP (yellow !, a slow weakly-homing orb: block it or strike it, it pops); GRAVE ROW (red !!, low: a crack runs at you and bone hands burst up in
//           a travelling line: jump the crest); BACKSTEP (told green puff, then a blink 80-120 px away from ALL heroes, never off a ledge or into a wall). Any blow cancels a cast.
// BONES_SHIPS is the family flag: false = no live level places any of them (src/bones-placements.js) and no bestiary card; the spawn cases and the dev pen still work for tools.
// A foe's state is kept in e.st; the step sets s.vx (px/s) and the HOST moves the body and writes the real x back. Every attack is told (a '...Tell' mode with its mark) and answered
// (src/marks.js ANSWER / HEIGHT).
import { nearestHero } from './mummer.js';

export const BONES_SHIPS = false;
/* the short words that float over the set (src/main.js adds them to MOVE_WORDS) */
export const BONE_SAY = { ward: 'WARDED', broke: 'GUARD BROKEN', open: 'OPEN', popped: 'POPPED', behind: 'FROM BEHIND', blink: 'BACKSTEP' };

export const BONE_SOLDIER = { w: 10, h: 20, hp: 44, walk: 32, sight: 330, sightY: 110, ward: 0.4, wardBreak: 1.5, turn: 0.6,
  thrustReach: 30, thrustRange: 38, thrustTell: 0.5, thrust: 0.14, thrustDmg: 10, thrustRecover: 0.7, parryOpen: 1.2,
  rushMin: 50, rushMax: 110, rushTell: 0.7, rushDist: 80, rushSpeed: 230, rushDmg: 8, rushRecover: 0.6, rushShove: 60, cd: 1.6 };
export const BONE_ARCHER = { w: 10, h: 20, hp: 22, walk: 28, sight: 380, sightY: 130, keepMin: 100, keepMax: 200, backOff: 70,
  aimTell: 0.8, aimDmg: 9, arrowSpeed: 360, aimRecover: 0.6, glint: 0.8,
  volleyTell: 1.0, volleyDmg: 6, volleyN: 3, volleyFlight: 0.75, volleyStagger: 0.18, volleySpread: 34, volleyRecover: 0.8, cd: 1.7 };
export const BONE_MAGE = { w: 10, h: 20, hp: 18, walk: 24, sight: 380, sightY: 130, keepMin: 120, keepMax: 180, closeIn: 36,
  wispTell: 0.9, wispDmg: 9, wispSpeed: 70, wispLife: 2.5, wispTurn: 60, wispRecover: 0.6,
  graveTell: 0.8, graveDmg: 10, graveSpeed: 180, graveLen: 160, graveW: 10, graveRecover: 0.9,
  stepTell: 0.3, stepMin: 80, stepMax: 120, stepCd: 4, stepFarMin: 70, cd: 2.2 };

const rnd = s => { s.seed = (s.seed * 1664525 + 1013904223) >>> 0; return s.seed / 4294967296; };
const sgn = (a, b) => Math.sign(a - b);
const mk = (k, x, y, face, extra) => ({ kind: k, x, y, face, mode: 'stand', t: 0, vx: 0, cd: 1 + (Math.abs(x) % 7) * 0.1, seed: (Math.floor(x) * 7919 + k.length * 131 + 17) >>> 0, turnT: 0,
  open: false, wardOpenT: 0, last: '', ...extra });
export const newSkelSoldier = (x, y, face = -1) => mk('skelsoldier', x, y, face, { guard: 0 });
export const newSkelArcher = (x, y, face = -1) => mk('skelarcher', x, y, face, { shots: 0, aim: 0 });
export const newSkelMage = (x, y, face = -1) => mk('skelmage', x, y, face, { stepCdT: 0, blinkTo: 0, casts: 0 });

/* the nearest upright hero in sight (a hero object: { x, y, alive }) */
const seen = (s, w, C) => nearestHero(s, w.heroes, C.sight, C.sightY);
/* a hit box in front of a foe: reach px from his centre, the height of his body */
const frontBox = (s, reach, h, wd = 0) => { const x0 = s.face > 0 ? s.x - wd : s.x - reach, x1 = s.face > 0 ? s.x + reach : s.x + wd; return [x0, x1, s.y - h, s.y]; };

/* ------------------------------------------------------------------ SOLDIER ------------------------------------------------------------------ */
export function soldierStep(s, w, dt) {
  const evs = [], C = BONE_SOLDIER; s.vx = 0; s.cd = Math.max(0, s.cd - dt); s.guard = Math.max(0, s.guard - dt);
  const near = seen(s, w, C);
  switch (s.mode) {
    case 'stand': case 'walk': {
      if (!near) { s.mode = 'stand'; break; }
      const want = sgn(near.x, s.x) || s.face, d = Math.abs(near.x - s.x);
      if (want !== s.face) { s.turnT -= dt; if (s.turnT <= 0) { s.face = want; s.turnT = 0; } } else s.turnT = C.turn;   /* he turns in C.turn s: a hero that jumped over him is behind him that long */
      if (s.turnT > 0 && want !== s.face) { s.mode = 'stand'; break; }
      if (s.cd <= 0 && w.canAttack !== false) {
        const canThrust = d <= C.thrustRange && Math.abs((near.y || 0) - s.y) < 40, canRush = d >= C.rushMin && d <= C.rushMax && (w.canStep ? w.canStep(s.x, s.face) : true), wantRush = s.last !== 'rush';   /* thrust and rush take turns */
        if (canThrust && !(canRush && wantRush)) { s.last = 'thrust'; s.mode = 'thrustTell'; s.t = C.thrustTell; s.vx = 0; evs.push({ t: 'thrustTell', dur: C.thrustTell }); break; }
        if (canRush) { s.last = 'rush'; s.mode = 'rushTell'; s.t = C.rushTell; evs.push({ t: 'rushTell', dur: C.rushTell }); break; }
      }
      /* between blows he holds at the rush's range instead of walking up onto your sword */
      if (s.cd > 0.2 && d >= C.rushMin && d <= C.rushMax) { s.mode = 'stand'; break; }
      if (d > C.thrustRange - 6 && (!w.canStep || w.canStep(s.x, s.face))) { s.vx = s.face * C.walk; s.mode = 'walk'; } else s.mode = 'stand';
      break; }
    case 'thrustTell':
      s.t -= dt; if (s.t <= 0) { s.mode = 'thrust'; s.t = C.thrust; s.hit = false; evs.push({ t: 'thrust', dmg: C.thrustDmg, box: frontBox(s, C.thrustReach + C.w / 2, C.h - 4, 4) }); }
      break;
    case 'thrust': s.t -= dt; if (s.t <= 0) { s.mode = 'recover'; s.t = C.thrustRecover; s.cd = C.cd; } break;
    case 'rushTell': s.t -= dt; if (s.t <= 0) { s.mode = 'rush'; s.t = C.rushDist / C.rushSpeed; s.hit = false; s.run = 0; evs.push({ t: 'rush', dmg: C.rushDmg }); } break;
    case 'rush': {
      s.vx = s.face * C.rushSpeed; s.t -= dt; s.run += C.rushSpeed * dt;
      if (s.t <= 0 || (w.canStep && !w.canStep(s.x, s.face))) { s.mode = 'recover'; s.t = C.rushRecover; s.cd = C.cd; s.vx = 0; s.turnT = C.turn; evs.push({ t: 'rushEnd', hit: !!s.hit }); }   /* the rush ends: his back is to whoever jumped him, and he turns in C.turn s */
      break; }
    case 'recover': s.t -= dt; if (s.t <= 0) s.mode = 'stand'; break;
    case 'stunned': s.t -= dt; s.open = true; if (s.t <= 0) { s.mode = 'stand'; s.open = false; s.cd = Math.max(s.cd, 0.4); } break;   /* the arm thrown wide: open */
    default: s.mode = 'stand';
  }
  return evs;
}
/* a hero's blow came in. { fromX, heavy, plunge } -> { k: damage multiplier, why: 'front'|'heavy'|'behind'|'above'|'open'|'broken'|null, cancel: tell cancelled } */
export function soldierTake(s, b) {
  const C = BONE_SOLDIER, side = sgn(b.fromX, s.x) || 1, front = side === s.face;
  if (s.open || s.mode === 'stunned') return { k: 1, why: 'open' };
  if (s.guard > 0) return { k: 1, why: 'broken' };
  if (b.plunge) return { k: 1, why: 'above' };
  if (b.heavy && front) { s.guard = C.wardBreak; s.cancelTell = true; return { k: 1, why: 'heavy' }; }   /* the shield knocked aside */
  if (!front) return { k: 1, why: 'behind' };
  return { k: C.ward, why: 'front' };
}
/* a blow cancels his tell only when it broke his guard (or he is open): a shield does not flinch */
export function soldierStruck(s, why) {
  if (why === 'heavy' && (s.mode === 'thrustTell' || s.mode === 'rushTell')) { s.mode = 'stunned'; s.t = 0.6; s.open = true; s.cd = Math.max(s.cd, 1); return 'cancel'; }
  return null;
}
/* his thrust was PARRIED: the shield arm thrown wide, open C.parryOpen s */
export function soldierParried(s) { s.mode = 'stunned'; s.t = BONE_SOLDIER.parryOpen; s.open = true; s.guard = Math.max(s.guard, BONE_SOLDIER.parryOpen); return 'parry'; }

/* ------------------------------------------------------------------ ARCHER ------------------------------------------------------------------ */
export function archerStep(s, w, dt) {
  const evs = [], C = BONE_ARCHER; s.vx = 0; s.cd = Math.max(0, s.cd - dt);
  const near = seen(s, w, C);
  switch (s.mode) {
    case 'stand': case 'walk': {
      if (!near) { s.mode = 'stand'; break; }
      s.face = sgn(near.x, s.x) || s.face; const d = Math.abs(near.x - s.x);
      if (s.cd <= 0 && w.canAttack !== false && d >= 60 && d <= C.sight) {
        s.last = s.last === 'aim' ? 'volley' : s.last === 'volley' ? 'aim' : (rnd(s) < 0.5 ? 'aim' : 'volley');
        if (s.last === 'aim') { s.mode = 'aimTell'; s.t = C.aimTell; s.aimX = near.x; s.aimY = (near.y || s.y) - 11; evs.push({ t: 'aimTell', dur: C.aimTell }); }
        else { s.mode = 'volleyTell'; s.t = C.volleyTell; evs.push({ t: 'volleyTell', dur: C.volleyTell, spots: volleySpots(s, near, C) }); s.spots = evs[0].spots; }
        break; }
      const away = -s.face;
      if (d < C.keepMin && (!w.canStep || w.canStep(s.x, away))) { s.vx = away * C.walk * (d < C.backOff ? 1.4 : 1); s.mode = 'walk'; }   /* backs off a hero who closes */
      else if (d > C.keepMax && (!w.canStep || w.canStep(s.x, s.face))) { s.vx = s.face * C.walk; s.mode = 'walk'; }
      else s.mode = 'stand';
      break; }
    case 'aimTell':
      if (near) { s.face = sgn(near.x, s.x) || s.face; s.aimX = near.x; s.aimY = (near.y || s.y) - 11; }   /* the glint line follows you until the draw is full */
      s.t -= dt; if (s.t <= 0) { s.mode = 'aim'; s.t = C.aimRecover; s.shots++; s.cd = C.cd;
        const dx = s.aimX - s.x, dy = s.aimY - (s.y - 12), L = Math.hypot(dx, dy) || 1;
        evs.push({ t: 'aim', dmg: C.aimDmg, x: s.x + s.face * 6, y: s.y - 12, vx: dx / L * C.arrowSpeed, vy: dy / L * C.arrowSpeed }); }
      break;
    case 'volleyTell':
      s.t -= dt; if (s.t <= 0) { s.mode = 'volley'; s.t = C.volleyRecover; s.cd = C.cd;
        (s.spots || []).forEach((x, i) => evs.push({ t: 'volley', dmg: C.volleyDmg, x: s.x + s.face * 5, y: s.y - 18, toX: x, delay: i * C.volleyStagger, flight: C.volleyFlight })); }
      break;
    case 'aim': case 'volley': s.t -= dt; if (s.t <= 0) s.mode = 'stand'; break;
    case 'stunned': s.t -= dt; if (s.t <= 0) { s.mode = 'stand'; s.cd = Math.max(s.cd, 0.6); } break;
    default: s.mode = 'stand';
  }
  return evs;
}
/* three landing spots round the hero, kept at a lobbing distance from the archer */
export function volleySpots(s, hero, C = BONE_ARCHER) {
  const out = []; for (let i = -1; i <= 1; i++) { let x = hero.x + i * C.volleySpread; const d = x - s.x; if (Math.abs(d) < 40) x = s.x + (Math.sign(d) || s.face) * 40; out.push(Math.round(x)); }
  return out;
}
/* a blow on an archer or a mage in a cast: small, so any blow cancels it */
export function bonesStruck(s) {
  if (s.mode === 'aimTell' || s.mode === 'volleyTell') { s.mode = 'stunned'; s.t = 0.5; s.cd = Math.max(s.cd, 1.2); return 'cancel'; }
  if (s.mode === 'wispTell' || s.mode === 'graveTell' || s.mode === 'backstepTell') { s.mode = 'stunned'; s.t = 0.5; s.cd = Math.max(s.cd, 1.4); return 'cancel'; }
  return null;
}

/* ------------------------------------------------------------------- MAGE -------------------------------------------------------------------- */
export function mageStep(s, w, dt) {
  const evs = [], C = BONE_MAGE; s.vx = 0; s.cd = Math.max(0, s.cd - dt); s.stepCdT = Math.max(0, s.stepCdT - dt);
  const near = seen(s, w, C), heroes = (w.heroes || []).filter(h => h.alive !== false);
  switch (s.mode) {
    case 'stand': case 'walk': {
      if (!near) { s.mode = 'stand'; break; }
      s.face = sgn(near.x, s.x) || s.face; const d = Math.abs(near.x - s.x);
      if (s.stepCdT <= 0 && d <= C.closeIn) { const to = blinkSpot(s, heroes, w); if (to !== null) { s.mode = 'backstepTell'; s.t = C.stepTell; s.blinkTo = to; evs.push({ t: 'backstepTell', dur: C.stepTell, to }); break; } s.stepCdT = 1; }
      if (s.cd <= 0 && w.canAttack !== false && d <= C.sight) {
        s.last = s.last === 'wisp' ? 'grave' : s.last === 'grave' ? 'wisp' : 'wisp';
        if (s.last === 'wisp') { s.mode = 'wispTell'; s.t = C.wispTell; evs.push({ t: 'wispTell', dur: C.wispTell }); }
        else { s.mode = 'graveTell'; s.t = C.graveTell; evs.push({ t: 'graveTell', dur: C.graveTell }); }
        break; }
      if (d < C.keepMin && (!w.canStep || w.canStep(s.x, -s.face))) { s.vx = -s.face * C.walk; s.mode = 'walk'; }
      else if (d > C.keepMax && (!w.canStep || w.canStep(s.x, s.face))) { s.vx = s.face * C.walk; s.mode = 'walk'; }
      else s.mode = 'stand';
      break; }
    case 'wispTell':
      if (near) s.face = sgn(near.x, s.x) || s.face;
      s.t -= dt; if (s.t <= 0) { s.mode = 'wisp'; s.t = C.wispRecover; s.cd = C.cd; s.casts++; evs.push({ t: 'wisp', dmg: C.wispDmg, x: s.x + s.face * 6, y: s.y - 20, vx: s.face * C.wispSpeed, vy: 0 }); }
      break;
    case 'graveTell':
      if (near) s.face = sgn(near.x, s.x) || s.face;
      s.t -= dt; if (s.t <= 0) { s.mode = 'grave'; s.t = C.graveRecover; s.cd = C.cd; s.casts++; evs.push({ t: 'grave', dmg: C.graveDmg, x: s.x + s.face * 8, dir: s.face, speed: C.graveSpeed, len: C.graveLen, wd: C.graveW }); }
      break;
    case 'backstepTell':
      s.t -= dt; if (s.t <= 0) { const from = s.x; s.x = s.blinkTo; s.mode = 'stand'; s.stepCdT = C.stepCd; s.cd = Math.max(s.cd, 0.8); s.blinked = true; evs.push({ t: 'blink', from, to: s.x }); }
      break;
    case 'wisp': case 'grave': s.t -= dt; if (s.t <= 0) s.mode = 'stand'; break;
    case 'stunned': s.t -= dt; if (s.t <= 0) { s.mode = 'stand'; s.cd = Math.max(s.cd, 0.6); } break;
    default: s.mode = 'stand';
  }
  return evs;
}
/* WHERE A BACKSTEP LANDS: 80-120 px away from ALL heroes (the farthest of the candidate spots by nearest-hero distance), on floor (w.floorAt(x)), no wall between (w.wallBetween(a, b)). null = nowhere safe */
export function blinkSpot(s, heroes, w, C = BONE_MAGE) {
  const hs = heroes.filter(h => h.alive !== false); if (!hs.length) return null;
  const near = hs.reduce((a, b) => Math.abs(b.x - s.x) < Math.abs(a.x - s.x) ? b : a), away = Math.sign(s.x - near.x) || -s.face;
  let best = null, bd = Math.min(...hs.map(h => Math.abs(h.x - s.x)));
  for (const dir of [away, -away]) for (const d of [100, 120, 80, 90, 110]) {
    const x = s.x + dir * d; if (w.floorAt && !w.floorAt(x)) continue; if (w.wallBetween && w.wallBetween(s.x, x)) continue;
    const md = Math.min(...hs.map(h => Math.abs(h.x - x))); if (md > bd + 20 && md >= C.stepFarMin) { best = x; bd = md; }
  }
  return best;
}

/* -------------------------------------------------------------- THINGS IN THE AIR -------------------------------------------------------------- */
/* THE BONE WISP: slow, weakly homing (turns at most C.wispTurn deg/s), 2.5 s of life. Mutates and returns it; alive false when spent. */
export function wispStep(b, target, dt, C = BONE_MAGE) {
  b.t = (b.t || 0) + dt; if (b.t >= C.wispLife) { b.alive = false; return b; }
  if (target) { const want = Math.atan2(target.y - b.y, target.x - b.x), cur = Math.atan2(b.vy, b.vx), max = C.wispTurn * Math.PI / 180 * dt;
    let d = want - cur; while (d > Math.PI) d -= 2 * Math.PI; while (d < -Math.PI) d += 2 * Math.PI; d = Math.max(-max, Math.min(max, d));
    const a = cur + d, sp = Math.hypot(b.vx, b.vy) || C.wispSpeed; b.vx = Math.cos(a) * sp; b.vy = Math.sin(a) * sp; b.ang = a; }
  b.x += b.vx * dt; b.y += b.vy * dt; return b;
}
/* THE GRAVE ROW: a crest travelling at C.graveSpeed for C.graveLen px; the hands stand where the crest is. hits(b, hero) -> true when a hero on the floor is under the crest (a jump clears it) */
export const newGraveRow = (x, dir, C = BONE_MAGE) => ({ x0: x, x, dir, run: 0, alive: true, hit: new Set() });
export function graveStep(b, dt, C = BONE_MAGE) { const d = C.graveSpeed * dt; b.x += b.dir * d; b.run += d; if (b.run >= C.graveLen) b.alive = false; return b; }
export const graveHits = (b, hero, floorY, C = BONE_MAGE) => Math.abs(hero.x - b.x) <= C.graveW / 2 + 4 && (hero.y || 0) >= floorY - 6;
/* a lobbed arrow's position at time t of its flight (from (x,y) to (toX, floorY)) */
export const lobAt = (a, t) => { const k = Math.min(1, Math.max(0, t / a.flight)), x = a.x + (a.toX - a.x) * k, y = a.y + (a.floorY - a.y) * k - Math.sin(k * Math.PI) * 46; return { x, y, k }; };

/* the dispatcher the hands and the tools use */
export const bonesStep = (s, w, dt) => s.kind === 'skelsoldier' ? soldierStep(s, w, dt) : s.kind === 'skelarcher' ? archerStep(s, w, dt) : mageStep(s, w, dt);
export const BONES_HP = { skelsoldier: BONE_SOLDIER.hp, skelarcher: BONE_ARCHER.hp, skelmage: BONE_MAGE.hp };
export const BONES_SIZE = { skelsoldier: BONE_SOLDIER, skelarcher: BONE_ARCHER, skelmage: BONE_MAGE };
export const BONE_IDS = ['skelsoldier', 'skelarcher', 'skelmage'];
/* every told windup of the set and its mark / answer / height: the tables in src/marks.js are checked against this by tools/bones.mjs */
export const BONE_TELLS = {
  'skelsoldier|thrustTell': ['!', 'block', 'low'], 'skelsoldier|rushTell': ['!!', 'jump', 'low'],
  'skelarcher|aimTell': ['!', 'block', 'high'], 'skelarcher|volleyTell': ['!!', 'dodge', 'low'],
  'skelmage|wispTell': ['!', 'block', 'low'], 'skelmage|graveTell': ['!!', 'jump', 'low'], 'skelmage|backstepTell': ['', '', ''],
};
