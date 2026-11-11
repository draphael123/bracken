/* src/sand-skiff.js - THE SAND-SKIFF BANDIT (the Great Dune's one new foe, plan-desert-1105 s1.9 / Q8) and THE SKIFF CHIEF's race to the obelisk (the level's
   end: "a light CHASE-RACE vs a SAND-SKIFF BANDIT CHIEF on the dunes to the obelisk - no heavy boss between the Buried City and Sealed Pyramid bosses").
   Pure: no DOM, no main.js. src/dune-hands.js binds them; tools/great-dune.mjs proves them.

   THE SKIFF: a sand-sail sledge. The WIND drives it, not the hill - it runs the dune surface at one speed, up and down alike, back and forth over its
   stretch (bed). A bandit rides it. It is BIG (the board's bowl bounces off it: src/shield-board.js) - JUMP it, STOMP its rider, or cut him as it passes.
   Its moves, every one told (a windup with its own pose name, a release pose, its own sound key):
     SPEAR SWEEP  '!'   0.55 s: the skiff slows, the rider draws back - then a low sweep ahead of the skiff (jump it or block it).
     SAND POT     '!!'  0.75 s: he marks a spot on the sand where you stand, then lobs a pot of loose sand there: it bursts (hurts in a small ring) and leaves
                        a SAND TRAP for 3 s (a board that crosses it loses half its speed - jump it).
   THE CHIEF: the same skiff, bigger sail, and a RACE. He waits at the start line; you cross it and he sails for the obelisk. He is not a boss and not a
   mini: he never walls you, he never respawns into a fight, and he takes every blow (no armour at all). RUBBER BAND (told by his speed lines): far ahead
   of you he eases off, behind you he leans on the sail - but his best (catch) is below the board's top speed, so the fast line beats him. Behind him he
   throws SAND POTS back onto your line. CUT HIM DOWN (half his health) and he falls off his skiff: the race is yours on the spot.
   WIN = THE CHIEF'S PURSE (gold) at the obelisk; LOSE = he takes it and sails off (the level still finishes at the obelisk: no fail state). */

export const SKIFF = { w: 30, h: 18, speed: 120, tellSpeed: 50, sweepTell: 0.55, sweepAct: 0.16, sweepReach: 34, sweepCd: 1.6, potTell: 0.75, potFly: 0.8, potRing: 16,
  potRange: [90, 230], potCd: 3.0, recover: 0.5, sweepDmg: 10, potDmg: 8, trapT: 3.0, trapW: 28, hp: 46 };
export const RACE = { base: 140, slow: 120, catch: 170, ahead: 220, behind: 40, potEvery: 3.4, potTell: 0.8, potBack: [70, 130], downAt: 0.5, hp: 120, purse: 60, startLead: 48 };
export const SKIFF_POSES = { sweepTell: 'skSweepWind', sweep: 'skSweepRel', potTell: 'skPotWind', pot: 'skPotRel', chiefPotTell: 'chPotWind', chiefPot: 'chPotRel', down: 'chDown' };
export const SKIFF_SOUNDS = { sweepTell: 'skiffSweepTell', sweep: 'skiffSweep', potTell: 'skiffPotTell', pot: 'skiffPot', burst: 'potBurst', sail: 'skiffSail' };

export function newSkiff(x, y, bed) { return { x, y, vx: 0, dir: -1, bed: bed || [x - 120, x + 120], mode: 'ride', t: 0, sweepCd: 0.8, potCd: 1.5, mark: null, pose: 'ride' }; }

/* one step. w = { px, py, groundY(x) -> the surface y px at x, heroAir } -> events [{ ev, ... }] */
export function skiffStep(s, dt, w) {
  const ev = [], S = SKIFF;
  s.t += dt; s.sweepCd = Math.max(0, s.sweepCd - dt); s.potCd = Math.max(0, s.potCd - dt);
  const dx = w.px - s.x, ahead = Math.sign(dx) === s.dir, dist = Math.abs(dx);
  const sail = v => { s.x += s.dir * v * dt; if (s.x < s.bed[0]) { s.x = s.bed[0]; s.dir = 1; } if (s.x > s.bed[1]) { s.x = s.bed[1]; s.dir = -1; } s.vx = s.dir * v; if (w.groundY) s.y = w.groundY(s.x); };
  switch (s.mode) {
    case 'ride':
      s.pose = 'ride'; sail(S.speed);
      if (ahead && dist < S.sweepReach + 40 && Math.abs(w.py - s.y) < 30 && s.sweepCd <= 0) { s.mode = 'sweepTell'; s.t = 0; s.pose = SKIFF_POSES.sweepTell; ev.push({ ev: 'tell', move: 'sweep', mark: '!', sound: SKIFF_SOUNDS.sweepTell }); }
      else if (dist >= S.potRange[0] && dist <= S.potRange[1] && s.potCd <= 0) { s.mode = 'potTell'; s.t = 0; s.pose = SKIFF_POSES.potTell; s.mark = { x: w.px, y: w.groundY ? w.groundY(w.px) : w.py }; ev.push({ ev: 'tell', move: 'pot', mark: '!!', at: s.mark, sound: SKIFF_SOUNDS.potTell }); }
      break;
    case 'sweepTell':
      sail(S.tellSpeed); if (s.t >= S.sweepTell) { s.mode = 'sweep'; s.t = 0; s.pose = SKIFF_POSES.sweep; ev.push({ ev: 'release', move: 'sweep', sound: SKIFF_SOUNDS.sweep }); }
      break;
    case 'sweep': {
      sail(S.tellSpeed);
      const box = s.dir > 0 ? { l: s.x + 6, r: s.x + 6 + S.sweepReach, t: s.y - 12, b: s.y } : { l: s.x - 6 - S.sweepReach, r: s.x - 6, t: s.y - 12, b: s.y };
      ev.push({ ev: 'hit', move: 'sweep', box, dmg: S.sweepDmg, low: true });
      if (s.t >= S.sweepAct) { s.mode = 'recover'; s.t = 0; s.sweepCd = S.sweepCd; }
      break; }
    case 'potTell':
      sail(S.tellSpeed);
      if (s.t >= S.potTell) { s.mode = 'recover'; s.t = 0; s.potCd = S.potCd; s.pose = SKIFF_POSES.pot;
        ev.push({ ev: 'pot', from: { x: s.x, y: s.y - 14 }, to: s.mark, fly: S.potFly, dmg: S.potDmg, ring: S.potRing, sound: SKIFF_SOUNDS.pot }); s.mark = null; }
      break;
    case 'recover':
      sail(S.speed * 0.6); if (s.t >= S.recover) { s.mode = 'ride'; s.t = 0; }
      break;
  }
  return ev;
}

/* THE CHIEF */
export function newChief(x, y, finishX) { return { x, y, vx: 0, finishX, mode: 'wait', t: 0, raceT: 0, potCd: 2, mark: null, pose: 'wait', v: 0, result: null }; }
/* the speed he sails at, given the gap (his x - your x): ahead far -> slow, behind -> catch, between -> base */
export function chiefSpeed(gap) { return gap > RACE.ahead ? RACE.slow : gap < -RACE.behind ? RACE.catch : RACE.base; }
/* one step. w = { px, py, startX, groundY(x), heroDone } -> events. c.result: 'won' (you reached the obelisk first or cut him down) | 'lost' (he did) */
export function chiefStep(c, dt, w) {
  const ev = [];
  if (c.result) return ev;
  c.t += dt;
  if (c.mode === 'wait') { c.pose = 'wait'; if (w.px >= w.startX) { c.mode = 'race'; c.t = 0; ev.push({ ev: 'start', sound: SKIFF_SOUNDS.sail }); } return ev; }
  if (c.mode === 'down') return ev;
  if (w.heroDone) { c.result = 'won'; c.mode = 'beaten'; ev.push({ ev: 'won', how: 'obelisk' }); return ev; }
  c.raceT += dt; c.potCd = Math.max(0, c.potCd - dt);
  const gap = c.x - w.px, v = chiefSpeed(gap);
  const slowed = c.mode === 'potTell' ? 0.75 : 1;
  c.v = v * slowed; c.x += c.v * dt; c.vx = c.v; if (w.groundY) c.y = w.groundY(c.x);
  if (c.mode === 'race') {
    c.pose = 'race';
    if (gap > 30 && gap < 360 && c.potCd <= 0) { c.mode = 'potTell'; c.t = 0; c.pose = SKIFF_POSES.chiefPotTell;
      const bx = c.x - (RACE.potBack[0] + ((c.raceT * 37) % (RACE.potBack[1] - RACE.potBack[0])));
      c.mark = { x: Math.max(w.px + 24, bx), y: 0 }; if (w.groundY) c.mark.y = w.groundY(c.mark.x);
      ev.push({ ev: 'tell', move: 'pot', mark: '!!', at: c.mark, sound: SKIFF_SOUNDS.potTell }); }
  } else if (c.mode === 'potTell' && c.t >= RACE.potTell) {
    c.mode = 'race'; c.t = 0; c.potCd = RACE.potEvery; c.pose = SKIFF_POSES.chiefPot;
    if (c.mark) { if (w.groundY) c.mark.y = w.groundY(c.mark.x); ev.push({ ev: 'pot', from: { x: c.x, y: c.y - 18 }, to: c.mark, fly: SKIFF.potFly, dmg: SKIFF.potDmg, ring: SKIFF.potRing, sound: SKIFF_SOUNDS.pot }); }
    c.mark = null;
  }
  if (c.x >= c.finishX) { c.result = 'lost'; c.mode = 'finished'; ev.push({ ev: 'lost' }); }
  return ev;
}
/* a blow landed on him: hp is the game's (he takes every blow - no armour, no ward); at or below RACE.downAt of his health he falls off the skiff */
export function chiefStruck(c, hp, maxHp) { if (c.result || c.mode === 'wait') return null; if (hp <= maxHp * RACE.downAt) { c.mode = 'down'; c.pose = SKIFF_POSES.down; c.result = 'won'; return { ev: 'won', how: 'down' }; } return null; }

/* THE POT IN THE AIR: a told arc from `from` to `to` over `fly` s (the mark was shown for the whole tell, and stays while it flies) */
export function potAt(p, t) { const k = Math.min(1, t / p.fly); return { x: p.from.x + (p.to.x - p.from.x) * k, y: p.from.y + (p.to.y - p.from.y) * k - Math.sin(Math.PI * k) * 46 }; }
