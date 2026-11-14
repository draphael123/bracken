// src/gob-geomancer.js - THE GOBLIN GEOMANCER, THE RULES (claude/gobgeo, Daniel 11-08 11:54: "Highcrown needs a GOBLIN GEOMANCER foe before the Queen, and level
// mechanics tied to REFLECTING ROCKS like the boss fight"). PURE: no ctx, no drawing, no Math.random (a seeded roll comes in) - src/gobgeo-hands.js binds it to
// the game and tools/gobgeo.mjs drives it in Node.
//
// WHO HE IS. The Goblin Queen's court earth-mage: purple and gold robes, a stone staff with an amethyst geode on it, and THREE ROCK CHUNKS that float round him.
// HOW HE READS NEXT TO THE HERO GEOMANCER (src/geomancer.js). She BUILDS - stone that stands in the grid, a fault line along the floor, a fist, a recall.
// He never touches the grid: he THROWS. His stone is in the air (the orbit), it is his ammunition and his guard, and every throw can be SENT BACK.
//
// THE KIT (every move told; a yellow ! = a shield turns it, and every one of them can be turned):
//   ROCK LOB     rockTell 0.75 s: the staff goes up and a chunk rises over his head, glowing; then he lobs it in an arc at you. 11. A PARRY (any hero's: the knight's
//                guard, the warden's deflect, the pyro's ward... - the shared parry counter) or A BLOW THAT MEETS THE ROCK sends it straight BACK at him: it smashes
//                whatever it meets first - a cracked seal, a bell, a chandelier, a goblin's shield, a goblin - and him: x1 his blow + STAGGERED 1.4 s, his orbit dropped.
//   SLATE VOLLEY slateTell 0.9 s: the staff is planted, three slates tear up out of the floor in front of him; they fly flat and fast in a fan (the Queen's own
//                slate shards, small). 8 each. Each one can be sent back the same way.
//   SHELL BURST  shellTell 0.5 s (close, < 52 px, only with stone in his orbit): the chunks pull in tight and rattle, then burst out round him. 8 and a shove.
//                After it his orbit is EMPTY and he is SPENT 1.4 s (x1.5).
// WEAK SPOT AND GUARD. While a chunk orbits him, a blow into his FRONT is taken by a chunk (x0.35, the chunk is knocked away: WARDED); his BACK, a blow from
//   above, an empty orbit, and his own rock sent back are taken whole. The rock held over his head in the tell is his weak spot: strike him then and it
//   falls on his own head (x1 + 6, staggered 1 s).
// He keeps his distance (90-170 px), never steps off his ledge, and never leaves his post by more than `leash` px. No contact damage: told blows only.
import { G6CALL, GCALL } from './gq6geo.js';   /* (claude/gq6geo, GQ6CALL_SHIPS) THE GEODE CALL: his second attack, behind its own flag (default OFF) */
export const GG = {
  hp: 44, w: 12, h: 22, speed: 34,
  keep: [90, 170], leash: 72, sight: 260, sightUp: 260, sightDown: 120,
  orbit: { max: 3, regen: 2.4, r: 13 },
  cd: [1.9, 2.6], first: 0.9,
  rock: { tell: 0.75, dmg: 11, g: 520, tMin: 0.55, tMax: 0.95, v: 200, r: 4, life: 3.2 },
  slate: { tell: 0.9, n: 3, spread: 10, v: 230, dmg: 8, r: 3, life: 2.2, every: 3 },
  shell: { tell: 0.5, near: 52, r: 44, dmg: 8, push: 170, spent: 1.4, spentMul: 1.5, cd: 4 },
  ward: { mul: 0.35 },
  held: { bonus: 6, stagger: 1.0 },
  /* the rock SENT BACK: it homes on its thrower at v px/s; dmg to him = max(dmg, share of his bar); to another goblin `foe`; stagger s */
  back: { v: 320, life: 2.2, share: 0.36, dmg: 14, foe: 14, stagger: 1.4, foeStagger: 0.6, shard: 8, shardStagger: 0.6, step: 4 },
  /* a shielded goblin hit FROM THE FRONT by a sent-back rock: his shield is knocked aside (off balance) s */
  shieldAside: 2.4,
  /* the chandelier a sent-back rock knocks down: what it lands on (px either side of its column) and how hard */
  lamp: { r: 36, dmg: 20, stagger: 1.2 },
  /* a seal whose Geomancer is dead with the seal still whole fails on its own after this many s (never a soft-lock) */
  sealFail: 4,
};
export const GG_SAY = { back: 'SENT BACK', warded: 'WARDED', held: 'HIS ROCK FALLS ON HIM', stagger: 'STAGGERED', seal: 'THE SEAL SHATTERS', sealFail: 'WITH HIM GONE THE SEAL FAILS',
  stone: 'ONLY STONE BREAKS IT', shield: 'SHIELD KNOCKED ASIDE', lamp: 'THE CHANDELIER FALLS', bell: 'THE BELL RINGS', secret: 'THE OLD STONE GIVES', spent: 'SPENT' };
export const GG_MODES = ['rockTell', 'slateTell', 'shellTell', ...(G6CALL ? ['callTell'] : [])];   /* every windup (src/marks.js BY_HAND: all three a yellow !; the Geode Call's too, flag GQ6CALL) */
/* THE GEODE CALL (flag GQ6CALL_SHIPS): the Queen's portal boulder, borrowed. callTell 0.8 s (the staff goes up, a small violet ring over you, a landing ring on the floor that LOCKS 0.5 s in), then the stone
   falls 0.6 s, 9 within 14 px, and bursts into two HANGING SHARDS: any blow or hero shot sends one home to him (STAGGERED 1.4 s, his own rock's damage). It takes the throw where n % 4 == 2, and only when he sees
   you, you are 60+ px off and have 4+ rows of air over your head, with at most one live call each and two in the level (w.air, w.callFree). Never the teach Geomancer's or an early sighting's (s.callOk). */
export function callWanted(s, w, adx) {
  return !!(G6CALL && s.callOk && s.n % GCALL.every === GCALL.phase && adx >= GCALL.minDist && (w.air || 0) >= GCALL.air && w.callFree);
}

const clamp = (v, a, b) => Math.max(a, Math.min(b, v));

/* a fresh foe state on top of main.js's spawn base */
export function newGeo(o = {}) {
  return { mode: 'idle', modeT: 0, cd: GG.first, orbit: GG.orbit.max, regenT: 0, n: 0, spent: 0, shellCd: 0, held: false, post: o.post ?? null, leash: o.leash ?? GG.leash, ...(G6CALL ? { callOk: !!o.callOk, aim: null } : {}) };
}

/* THE BRAIN, one frame. s: the foe (it carries the fields newGeo made plus x, y, face, stagger). w: { tx, ty: the hero he means (feet); ahead(dir): true if
   there is floor a step ahead that way; roll(): 0..1; tokWait: the attack-token board says wait }. Returns { vx, events: [...] }:
   { ev: 'tell', move } as a windup starts; { ev: 'rock' } { ev: 'slate' } { ev: 'shell' } as a move lands; { ev: 'cancel', move } a tell broken by a blow. */
export function geoStep(s, dt, w) {
  const out = { vx: 0, events: [] };
  s.shellCd = Math.max(0, s.shellCd - dt); if (s.spent > 0) s.spent = Math.max(0, s.spent - dt);
  /* the orbit comes back a chunk at a time (never while he is hurt or casting) */
  if (s.orbit < GG.orbit.max && !(s.stagger > 0) && !s.mode.endsWith('Tell')) { s.regenT += dt; if (s.regenT >= GG.orbit.regen) { s.regenT = 0; s.orbit++; } } else if (s.orbit >= GG.orbit.max) s.regenT = 0;
  if (s.stagger > 0) { if (s.mode.endsWith('Tell')) { out.events.push({ ev: 'cancel', move: s.mode }); s.held = false; } if (G6CALL) s.aim = null; s.mode = 'stagger'; s.modeT = 0; return out; }
  if (s.mode === 'stagger') { s.mode = 'idle'; s.cd = Math.max(s.cd, 0.6); }
  const dx = w.tx - s.x, adx = Math.abs(dx), dy = w.ty - s.y;
  const sees = adx < (s.sight || GG.sight) && dy > -GG.sightUp && dy < GG.sightDown + (s.perch ? 200 : 0);
  if (sees) s.face = Math.sign(dx) || s.face;
  /* a move in its tell */
  if (s.mode.endsWith('Tell')) { s.modeT -= dt;
    if (G6CALL && s.mode === 'callTell' && s.aim && !s.aim.locked) { s.aim.x = w.tx; s.aim.y = w.ty; if (GCALL.tell - s.modeT >= GCALL.lockAt) { s.aim.locked = true; out.events.push({ ev: 'lock', x: s.aim.x, y: s.aim.y }); } }   /* the landing ring follows you until it locks */
    if (s.modeT <= 0) { const m = s.mode; s.mode = 'release'; s.modeT = 0.3; s.held = false;
      if (m === 'rockTell') { s.orbit = Math.max(0, s.orbit - 1); out.events.push({ ev: 'rock' }); }
      else if (m === 'slateTell') out.events.push({ ev: 'slate' });
      else if (m === 'callTell') { const a = s.aim || { x: w.tx, y: w.ty }; s.aim = null; out.events.push({ ev: 'call', x: a.x, y: a.y }); }
      else if (m === 'shellTell') { s.orbit = 0; s.spent = GG.shell.spent; s.shellCd = GG.shell.cd; out.events.push({ ev: 'shell' }); }
      s.cd = GG.cd[0] + (GG.cd[1] - GG.cd[0]) * w.roll(); s.relMove = m; }
    return out; }
  if (s.mode === 'release') { s.modeT -= dt; if (s.modeT <= 0) s.mode = 'idle'; return out; }
  /* walking: keep his distance, inside his leash, never off his ledge */
  s.cd -= dt;
  if (sees) {
    let want = 0;
    if (adx < GG.keep[0]) want = -Math.sign(dx); else if (adx > GG.keep[1]) want = Math.sign(dx);
    if (want && s.post !== null && Math.abs(s.x + want * 4 - s.post) > s.leash && Math.sign(s.x - s.post) === want) want = 0;
    if (want && !w.ahead(want)) want = 0;
    out.vx = want * GG.speed; s.mode = want ? 'walk' : 'idle';
    if (s.cd <= 0 && !w.tokWait) {
      let m = null;
      if (adx < GG.shell.near && Math.abs(dy) < 30 && s.orbit > 0 && s.shellCd <= 0) m = 'shellTell';
      else if (adx >= 40) { s.n++; m = (s.n % GG.slate.every === 0 || s.orbit === 0) ? 'slateTell' : 'rockTell'; if (callWanted(s, w, adx)) m = 'callTell'; }   /* (GQ6CALL) the call takes this throw */
      if (m) { s.mode = m; s.modeT = m === 'callTell' ? GCALL.tell : GG[m === 'rockTell' ? 'rock' : m === 'slateTell' ? 'slate' : 'shell'].tell; s.held = m === 'rockTell'; out.vx = 0; if (m === 'callTell') s.aim = { x: w.tx, y: w.ty, locked: false }; out.events.push({ ev: 'tell', move: m }); }
    }
  } else { s.mode = 'idle'; if (s.post !== null && Math.abs(s.x - s.post) > 6) { const d = Math.sign(s.post - s.x); if (w.ahead(d)) { out.vx = d * GG.speed * 0.6; s.mode = 'walk'; } } }
  return out;
}

/* THE LOB: the velocity that lands a rock from (x0, y0) on (x1, y1) under g; flight time from the distance, clamped */
export function lob(x0, y0, x1, y1, R = GG.rock, minT = 0) {
  const d = Math.hypot(x1 - x0, y1 - y0), T = Math.max(minT, clamp(d / R.v, R.tMin, R.tMax));   /* minT: a high arc (from a roof, over its merlons) */
  return { vx: (x1 - x0) / T, vy: (y1 - y0) / T - 0.5 * R.g * T, T };
}
/* THE VOLLEY: n slates aimed at (x1, y1), spread deg apart, at v */
export function fan(x0, y0, x1, y1, S = GG.slate) {
  const a0 = Math.atan2(y1 - y0, x1 - x0), out = [];
  for (let k = 0; k < S.n; k++) { const a = a0 + (k - (S.n - 1) / 2) * S.spread * Math.PI / 180; out.push({ vx: Math.cos(a) * S.v, vy: Math.sin(a) * S.v }); }
  return out;
}
/* SENT BACK: a rock's velocity toward (hx, hy) at the return speed */
export function homeVel(r, hx, hy, v = GG.back.v) { const dx = hx - r.x, dy = hy - r.y, d = Math.hypot(dx, dy) || 1; return { vx: dx / d * v, vy: dy / d * v, d }; }

/* WHAT A BLOW ON HIM IS WORTH (src/gobgeo-hands.js take): tag is the blow's name (hurtAs's first argument); fromX the hero's x. Returns { dmg, say, chip, held }. */
export function geoTake(s, dmg, { tag = '', fromX = s.x, above = false } = {}) {
  const t = String(tag || '');
  if (t.includes('reflect') || t.includes('geoBack')) return { dmg, say: null };
  if (s.held && s.mode === 'rockTell') { s.held = false; s.mode = 'idle'; s.orbit = Math.max(0, s.orbit - 1); return { dmg: dmg + GG.held.bonus, say: GG_SAY.held, held: true, stagger: GG.held.stagger }; }
  if (s.spent > 0) return { dmg: Math.round(dmg * GG.shell.spentMul), say: null };
  const front = Math.sign(fromX - s.x) === (s.face || 1);
  if (s.orbit > 0 && front && !above && !t.includes('plunge')) { s.orbit--; return { dmg: Math.max(1, Math.round(dmg * GG.ward.mul)), say: GG_SAY.warded, chip: true }; }
  return { dmg, say: null };
}
/* HIS OWN ROCK, SENT BACK, reaches him: the damage (a share of his bar, never less than back.dmg) and the stagger; his orbit falls */
export function geoStruck(s, shard = false) {
  const B = GG.back; s.orbit = 0; s.held = false; s.regenT = 0;
  const dmg = shard ? B.shard : Math.max(B.dmg, Math.round((s.maxHp || GG.hp) * B.share));
  return { dmg, stagger: shard ? B.shardStagger : B.stagger };
}

/* ---------- THE SENT-BACK ROCK'S PATH: what it meets first ---------- */
export const inBox = (x, y, b) => x >= b.l && x <= b.r && y >= b.t && y <= b.b;
/* step a sent-back rock from (x, y) by (vx, vy) dt in `step` px pieces; hit(x, y) returns a target or null; solid(x, y) true stops it. -> { x, y, hit, wall } */
export function sweep(x, y, vx, vy, dt, hit, solid, step = GG.back.step) {
  const len = Math.hypot(vx, vy) * dt, n = Math.max(1, Math.ceil(len / step));
  for (let k = 1; k <= n; k++) { const px = x + vx * dt * k / n, py = y + vy * dt * k / n; const h = hit(px, py); if (h) return { x: px, y: py, hit: h }; if (solid(px, py)) return { x: px, y: py, wall: true }; }
  return { x: x + vx * dt, y: y + vy * dt };
}
