// tools/skyhook.mjs - SKYHOOK, MASTER OF THE HEAD STATION (claude/skyhook; src/skyhook.js + src/skyhook-hands.js). Node only, no browser, a few seconds:
//   1  B15: never invulnerable - every mode takes a blow at >= 0.4x outside his openings; DOWN x2 / JARRED x1.5 pay up to their purse, then he gets up
//   2  THE OPENINGS in BOTH phases: a lever struck while he rides slips his line (DOWN); a lever struck off the line only clanks; a dodged drop = JARRED
//   3  TELLS PRECEDE HITS: every blow he lands (hook, trolley, drop, sweep, shove, rise, swing) comes after its own tell, never inside a shorter one
//   4  NO SOFT-LOCK: 400 s of fight with heroes wandering - he never sticks in a mode, a ride (the opening) comes round in each phase, the slipped line restrings
//   5  EVERY HERO HAS A WAY TO HIT HIM: DOWN/JARRED/LANDED he is on the floor (inside the shortest melee reach); the levers stand on the floor; the swing's
//      top clears under a jump; the drop's ring can be left in its lock time; a full bot fight per hero (melee and ranged) brings him down
//   6  CO-OP: 1-4 seats - each hero is struck once a move (keyed), any seat's lever works, the nearest seat is the target
//   7  RESPAWN / RESET: a fresh fight, the high line strung again (the kit's lineRespawn and the hands' end), his levers come back with him
//   8  B16 two pictures a move, a pose for every mode; his lines are routed (hint-shown); the hands draw without throwing (a stub canvas)
//   9  THE ARENA: built from src/highlines.js - perches on the galleries, levers on the rock floor, the high line between the galleries, the winch tops at them
import assert from 'node:assert/strict';
import * as M from '../src/skyhook.js';
import { POSE, makeSkyhookHands } from '../src/skyhook-hands.js';
import { isCallout } from '../src/hint-lines.js';
import { HL_DATA, buildHighLines } from '../src/highlines.js';
import { lineInit, lineRespawn, lineCut } from '../src/line-kit.js';
import { MOVE, HERO_MOVE_IDS } from '../src/hero-move.js';
import { T } from '../src/level.js';
const { SH } = M, TS = 16, DT = 1 / 60;
let n = 0; const ok = (c, m) => { assert.ok(c, m); n++; };
const t0 = Date.now();
/* the arena as main.js gets it */
const painter = (W, H) => { const grid = new Uint8Array(W * H), ents = []; const set = (x, y, v) => { if (x >= 0 && y >= 0 && x < W && y < H) grid[y * W + x] = v; };
  return { W, H, grid, ents, set, block: (x0, x1, y0, y1) => { for (let y = y0; y <= y1; y++) for (let x = x0; x <= x1; x++) set(x, y, T.SOLID); }, ent: (t, x, y, o = {}) => ents.push({ t, x, y, ...o }) }; };
const B = buildHighLines({ painter, T, TS }), A = B.arena, at = (x, y) => B.grid[y * B.W + x];
const G = M.geom(A);
/* ---------- a small world: heroes as boxes on the station floor (they may stand on a gallery or hang on a line by hand) ---------- */
function mkWorld(heroes, o = {}) {
  const cut = {}, w = { log: [], hits: [], marks: [], sounds: [], said: [], t: 0, cut,
    number: (x, y, t) => w.said.push(t), sound: k => w.sounds.push(k), shake: () => {}, music: () => {}, mark: m => w.marks.push(m), fx: k => w.log.push('fx ' + k),
    lineUp: id => !(cut[id] > 0), cutLine: (id, s) => { if (cut[id] > 0) return false; cut[id] = s; for (const h of heroes) if (h.lk === id) { h.lk = null; h.fell = true; } return true; }, riders: id => heroes.filter(h => h.alive && h.lk === id),
    hit: (bx, d, name, op = {}) => { const out = [];
      for (const h of heroes) { if (!h.alive) continue; if (op.ridersOnly && h.lk !== op.ridersOnly) continue;
        const hb = { l: h.x - 5, r: h.x + 5, t: h.y - 14, b: h.y }; if (hb.r < bx[0] || hb.l > bx[1] || hb.b < bx[2] || hb.t > bx[3]) continue;
        h.keys = h.keys || new Set(); const key = op.key || name; if (h.keys.has(key)) continue; h.keys.add(key);
        let r; if (h.iframes > 0) r = 'miss'; else if (h.block && op.yellow) r = 'blocked'; else { r = 'hit'; h.hp -= d; h.taken = (h.taken || 0) + d; if (h.lk) h.lk = null;
          if (op.up) h.vy = op.up; if (op.push) h.vx = op.pushFrom !== undefined ? Math.sign(h.x - op.pushFrom) * op.push : op.push; if (op.pull) h.vx = Math.sign((op.pullTo ?? 0) - h.x) * op.pull; }
        out.push(r); w.hits.push({ t: w.t, name, r, hero: heroes.indexOf(h) }); }
      return out; } };
  return w;
}
const mkHero = (x, y = G.floorY) => ({ x, y, vx: 0, vy: 0, ground: true, alive: true, lk: null, hp: 1e9, iframes: 0, block: false, atkCd: 0 });
const mkBoss = () => ({ x: G.perch.E.x, y: G.perch.E.y, hp: SH.hp, maxHp: SH.hp, mode: 'sleep', modeT: 0, face: -1, alive: true });
function startFight(e, S, w) { e.mode = 'wake'; e.modeT = 1.6; }
/* hero physics on the station floor (+ the galleries as decks) */
const decks = [{ x0: A.x0, x1: A.x1, top: G.floorY }, { x0: 8 * TS, x1: 13 * TS, top: 40 * TS }, { x0: 35 * TS, x1: 40 * TS, top: 40 * TS }];
function heroPhys(h) {
  if (!h.alive || h.lk) return; const oy = h.y;
  h.vx -= Math.sign(h.vx) * Math.min(Math.abs(h.vx), (h.ground ? MOVE.FRIC_GROUND : MOVE.FRIC_AIR) * DT);
  if (!h.ground) { h.vy = Math.min(MOVE.MAX_FALL, h.vy + MOVE.GRAV * DT); }
  h.x = Math.max(A.x0 + 5, Math.min(A.x1 - 5, h.x + h.vx * DT)); h.y += h.vy * DT;
  if (h.vy >= 0) for (const d of decks) if (h.x >= d.x0 && h.x < d.x1 && oy <= d.top + 0.5 && h.y >= d.top) { h.y = d.top; h.vy = 0; h.ground = true; break; }
  if (h.ground && !decks.some(d => h.x >= d.x0 && h.x < d.x1 && Math.abs(h.y - d.top) < 1)) h.ground = false;
  if (h.y < G.floorY - 1 && h.vy === 0 && !decks.some(d => Math.abs(h.y - d.top) < 1)) h.ground = false;
  h.iframes = Math.max(0, h.iframes - DT); h.atkCd = Math.max(0, h.atkCd - DT);
}
const step = (e, S, heroes, w, s, each) => { for (let i = 0; i < Math.round(s / DT); i++) { w.t += DT; for (const k of Object.keys(w.cut)) w.cut[k] = Math.max(0, w.cut[k] - DT); M.stepSky(e, S, DT, heroes, w); for (const h of heroes) heroPhys(h); if (each && each(i) === false) break; } };

/* ---------- 1. B15 ---------- */
{ const S = M.newFight(G), e = mkBoss();
  const modes = ['sleep', 'wake', 'perch', 'phaseTell', 'rideTell', 'ride', 'dropTell', 'drop', 'landed', 'sweepTell', 'sweep', 'climbTell', 'climb', 'slip', 'rise', 'hookTell', 'hook', 'shoveTell', 'shove', 'cutTell', 'cut', 'swingTell', 'swing'];
  for (const m of modes) { e.mode = m; S.ward = 0; const [d, word] = M.takeBlow(e, S, 100); ok(d >= 40 && word, 'B15: ' + m + ' takes ' + d + ' of 100 (>= 0.4x, never invulnerable) and says why (' + word + ')'); }
  e.mode = 'perch'; S.ward = 2; ok(M.takeBlow(e, S, 100)[0] === 40 && M.takeBlow(e, S, 100)[1] === 'WARDED', 'warded: x0.4, told'); S.ward = 0;
  ok(SH.chip >= 0.4 && SH.wardMul >= 0.4, 'the floor numbers: coat x' + SH.chip + ', ward x' + SH.wardMul);
  ok(M.takeBlow(e, S, 100)[1] === M.SKY_SAY.guard, 'a turned blow says ' + M.SKY_SAY.guard);
  e.mode = 'downed'; e.modeT = 3; S.purse = e.maxHp * SH.downed.cap; ok(M.takeBlow(e, S, 50)[0] === 100, 'DOWN: x2');
  let got = 100; for (let i = 0; i < 40 && e.modeT > 0.05; i++) got += M.takeBlow(e, S, 50)[0];
  ok(e.modeT <= 0.05 && Math.abs(got - e.maxHp * SH.downed.cap) < 2, 'one downing is worth at most ' + SH.downed.cap + ' of him, then he gets up (' + got + ')');
  e.mode = 'jarred'; e.modeT = 1; S.purse = e.maxHp * SH.jarred.cap; ok(M.takeBlow(e, S, 40)[0] === 60, 'JARRED: x1.5'); }

/* ---------- 2. THE OPENINGS, both phases ---------- */
function rideOpen(ph) {
  const S = M.newFight(G), e = mkBoss(), h = mkHero(G.levers[0].x + 14), w = mkWorld([h]); S.ph = ph; e.hp = ph > 1 ? e.maxHp * 0.4 : e.maxHp; e.phase = ph; startFight(e, S, w);
  let downed = false, clank = 0, struck = false, notYet = false;
  step(e, S, [h], w, 40, () => { if (e.mode === 'perch' && !struck) { if (M.leverStruck(e, S, 'W', w) === false) clank++; }
    if (M.skyOnLine(e) && !M.skySlippable(e, S) && !struck && !notYet) notYet = M.leverStruck(e, S, 'W', w) === false;
    if (M.skySlippable(e, S) && !struck) { struck = M.leverStruck(e, S, 'W', w); }
    if (e.mode === 'downed') { downed = true; return false; } });
  return { downed, clank, S, e, w, notYet };
}
for (const ph of [1, 2]) { const r = rideOpen(ph);
  ok(r.downed && r.S.n.slip === 1 && r.S.n.downed === 1, 'P' + ph + ': a lever struck while he rides slips his line - he is DOWN on the rock (' + r.e.mode + ')');
  ok(r.clank > 0 && r.w.said.includes(M.SKY_SAY.offLine), 'P' + ph + ': a lever struck while he stands on a gallery only clanks (told once)');
  ok(r.notYet && r.w.said.includes(M.SKY_SAY.notYet), 'P' + ph + ': on his line but not yet over the middle, a lever clanks too (told once: ' + M.SKY_SAY.notYet + ')');
  ok(r.w.cut[G.line.id] > 0 && r.e.y === G.floorY, 'P' + ph + ': his line hangs parted (restrung in ' + SH.slip.restring + ' s); he lies on the floor');
  const S = r.S, e = r.e; step(e, S, [], r.w, SH.downed.t[ph - 1] + 0.1); ok(e.mode === 'rise' && r.w.marks.includes('!'), 'P' + ph + ': DOWN runs out into a told rise (a yellow !, a white ring)');
  step(e, S, [], r.w, SH.rise.tell + 0.05); ok(S.ward > 0 && (e.mode === 'climbTell' || e.mode === 'climb'), 'P' + ph + ': he gets up warded and grapples back up to a gallery'); }
/* the drop: a hero who steps out of the set ring leaves him JARRED; one who stays is struck */
function dropRun(stay) {
  const S = M.newFight(G), e = mkBoss(), h = mkHero(G.mid), w = mkWorld([h]); hangOn(e, S, G.mid); e.mode = 'dropTell'; e.modeT = SH.drop.tell[0]; e.locked = false; e.lockX = e.x; S.act = 5;
  step(e, S, [h], w, SH.drop.tell[0] + SH.drop.fall + 0.05, () => { if (!stay && e.locked) h.x = e.lockX + SH.drop.r + 12; });
  return { e, w, S };
}
function hangOn(e, S, x) { M.hangAt(e, S, x); }
{ const r = dropRun(false); ok(r.e.mode === 'jarred' && r.S.n.jarred === 1 && r.w.said.includes(M.SKY_SAY.jarred), 'step out of the drop\'s set ring and he lands on nothing: JARRED (an opening)'); }
{ const r = dropRun(true); ok(r.e.mode === 'landed' && r.w.hits.some(q => q.name === 'drop' && q.r === 'hit'), 'stay in the ring and the drop lands (' + SH.drop.dmg + ')'); }
{ const S = M.newFight(G), e = mkBoss(); e.mode = 'dropTell'; M.hangAt(e, S, G.mid); ok(M.skySlippable(e, S), 'while he sets his drop over the middle he still hangs from the line: a lever slips him there too'); }
{ const S = M.newFight(G), half = (G.end.E - G.end.W) / 2, win = (G.end.E - G.end.W) * SH.slip.span / 2; const tIn = 2 * win / SH.ride.v[1], tHook = (half - win) / SH.ride.v[1];
  ok(tIn >= 0.6 && SH.leverHook.tell[0] < (half - win) / SH.ride.v[0] + 0.01 && SH.leverHook.tell[1] < tHook + 0.01, 'the middle window lasts ' + tIn.toFixed(2) + ' s at his P2 speed (>= 0.6); the lever hook lands before it opens (P2 ' + SH.leverHook.tell[1] + ' s < ' + tHook.toFixed(2) + ' s)'); }

/* ---------- 3. TELLS PRECEDE HITS (and 4. no soft-lock) ---------- */
const TELL_OF = { hook: ['hookTell', 'leverHook'], trolley: ['rideTell'], drop: ['dropTell'], sweep: ['sweepTell'], shove: ['shoveTell'], rise: ['rise'], swing: ['swingTell'] };
const MIN_TELL = 0.5;
function wander(seed, ph, seats, secs) {
  let rs = seed; const rnd = () => ((rs = (rs * 1103515245 + 12345) & 0x7fffffff) / 0x7fffffff);
  const realRandom = Math.random; Math.random = rnd;
  try {
    const S = M.newFight(G), e = mkBoss(); if (ph > 1) { e.hp = e.maxHp * 0.45; }
    const hs = []; for (let s = 0; s < seats; s++) hs.push(mkHero(A.x0 + 40 + rnd() * (A.x1 - A.x0 - 80)));
    const w = mkWorld(hs); startFight(e, S, w);
    const tellAt = {}, modeSince = { m: e.mode, t: 0 }, stuck = [], rides = []; let lastMode = e.mode, maxIn = 0, lhSeen = false;
    step(e, S, hs, w, secs, () => {
      if (e.mode !== lastMode) { if (TELLS.includes(e.mode)) tellAt[e.mode] = w.t; if (e.mode === 'ride') rides.push(w.t); maxIn = Math.max(maxIn, w.t - modeSince.t); if (w.t - modeSince.t > 9 && modeSince.m !== 'perch') stuck.push(modeSince.m); modeSince.m = e.mode; modeSince.t = w.t; lastMode = e.mode; }
      if (S.leverHook && !lhSeen) { tellAt.leverHook = w.t; lhSeen = true; } if (!S.leverHook) lhSeen = false;
      for (const hh of hs) { if (rnd() < 0.02) hh.vx = (rnd() < 0.5 ? -1 : 1) * MOVE.RUN; if (hh.ground && rnd() < 0.004) { hh.vy = MOVE.JUMPV; hh.ground = false; } }
      if (ph > 1 && e.hp > e.maxHp * 0.45) e.hp = e.maxHp * 0.45;   /* (held in the phase) */
      if (e.mode === 'downed' || e.mode === 'jarred') e.modeT = Math.min(e.modeT, 0.5);
    });
    return { S, e, w, tellAt, stuck, rides, maxIn };
  } finally { Math.random = realRandom; }
}
const TELLS = ['rideTell', 'hookTell', 'dropTell', 'sweepTell', 'cutTell', 'swingTell', 'shoveTell', 'rise', 'climbTell', 'phaseTell'];
for (const ph of [1, 2]) for (const seats of [1, 2, 4]) for (const seed of [1, 7, 42]) {
  /* every blow: when it landed, how long before it its own tell began */
  const S = M.newFight(G), e = mkBoss(), hs = []; for (let s = 0; s < seats; s++) hs.push(mkHero(A.x0 + 60 + s * 90));
  let rs = seed * 31 + seats; const rnd = () => ((rs = (rs * 1103515245 + 12345) & 0x7fffffff) / 0x7fffffff); const realRandom = Math.random; Math.random = rnd;
  const w = mkWorld(hs); if (ph > 1) e.hp = e.maxHp * 0.45; startFight(e, S, w);
  const tStart = {}; let last = e.mode, lh = null; const bad = [];
  for (let i = 0; i < 60 * 200; i++) { w.t += DT; for (const k of Object.keys(w.cut)) w.cut[k] = Math.max(0, w.cut[k] - DT);
    const h0 = w.hits.length; M.stepSky(e, S, DT, hs, w); for (const hh of hs) heroPhys(hh);
    if (e.mode !== last) { tStart[e.mode] = w.t; last = e.mode; } if (S.leverHook && lh === null) { lh = w.t; tStart.leverHook = w.t; } if (!S.leverHook) lh = null;
    for (const q of w.hits.slice(h0)) { const tells = TELL_OF[q.name]; const since = Math.max(...tells.map(m => tStart[m] ?? -99)); if (w.t - since < MIN_TELL - 1e-6) bad.push(q.name + '@' + w.t.toFixed(2) + ' (' + (w.t - since).toFixed(2) + ' s)'); }
    for (const hh of hs) { if (rnd() < 0.02) hh.vx = (rnd() < 0.5 ? -1 : 1) * MOVE.RUN; if (hh.ground && rnd() < 0.004) { hh.vy = MOVE.JUMPV; hh.ground = false; } }
    if (ph > 1 && e.hp > e.maxHp * 0.45) e.hp = e.maxHp * 0.45; }
  Math.random = realRandom;
  ok(w.hits.length > 0 && !bad.length, 'P' + ph + ' x' + seats + ' seed ' + seed + ': ' + w.hits.length + ' blows landed, every one >= ' + MIN_TELL + ' s after its own tell ' + bad.slice(0, 4).join(' '));
}
for (const ph of [1, 2]) for (const seed of [3, 11, 29]) { const r = wander(seed, ph, 2, 400);
  ok(!r.stuck.length, 'P' + ph + ' seed ' + seed + ': no soft-lock - never stuck in a mode for 9 s (' + r.stuck.join(' ') + '), longest ' + r.maxIn.toFixed(1) + ' s');
  const gaps = r.rides.map((t, i) => t - (i ? r.rides[i - 1] : 0)); const worst = Math.max(...gaps);
  ok(r.rides.length >= 20 && worst < 20, 'P' + ph + ' seed ' + seed + ': THE OPENING COMES ROUND - ' + r.rides.length + ' rides in 400 s, the longest gap ' + worst.toFixed(1) + ' s');
  if (ph > 1) ok(r.S.n.swing > 0, 'P2 seed ' + seed + ': the low swing comes (' + r.S.n.swing + ')');
  else ok(r.S.n.swing === 0 && r.S.n.cut === 0, 'P1 seed ' + seed + ': no phase-two moves in phase one (the cut, the swing)'); }
{ const r = wander(5, 1, 1, 60); r.e.hp = r.e.maxHp * 0.49; let saw = false; step(r.e, r.S, [], r.w, 20, () => { if (r.e.mode === 'phaseTell') saw = true; });
  ok(r.S.ph === 2 && saw && r.w.said.includes(M.SKY_SAY.p2), 'at half he draws his cutter (phase two, told, warded through it)'); }
{ const S = M.newFight(G), e = mkBoss(), w = mkWorld([]); e.hp = e.maxHp * 0.45; e.mode = 'downed'; e.modeT = 1; M.stepSky(e, S, DT, [], w); ok(S.ph === 1, 'never through an opening: the phase waits for a gallery'); }

/* ---------- P2: HE CUTS YOUR LINE (told) - and a hero who tops out first is not cut ---------- */
{ const S = M.newFight(G), e = mkBoss(), h = mkHero(20 * TS), w = mkWorld([h]); S.ph = 2; e.hp = e.maxHp * 0.4; S.side = 'W'; M.atPerch(e, S); e.mode = 'perch'; S.restT = 0; h.lk = G.winch.W; h.y = G.floorY - 60; h.ground = false;
  let told = false; step(e, S, [h], w, SH.cut.tell + 0.5, () => { if (e.mode === 'cutTell') told = true; });
  ok(told && w.marks.includes('!!') && w.cut[G.winch.W] > 0 && h.fell && S.n.cut === 1, 'P2: a hero hauling up the winch to his gallery - HE CUTS YOUR LINE, told ' + SH.cut.tell + ' s (red !!)');
  ok(!w.hits.length, 'the cut itself is no blow (you drop to the station floor: lost height, no hp)'); }
{ const S = M.newFight(G), e = mkBoss(), h = mkHero(20 * TS), w = mkWorld([h]); S.ph = 2; e.hp = e.maxHp * 0.4; S.side = 'W'; M.atPerch(e, S); e.mode = 'perch'; S.restT = 0; h.lk = G.winch.W; h.y = G.floorY - 60;
  step(e, S, [h], w, SH.cut.tell * 0.5, () => {}); h.lk = null; h.y = G.perch.W.y; h.x = G.perch.W.x + 30; step(e, S, [h], w, SH.cut.tell, () => {});
  ok(!(w.cut[G.winch.W] > 0) && S.n.cut === 0, 'top out before the cut and the line is not cut (the race)'); }
/* P2: on a ride he hooks at whoever waits by a lever (told), and the lever still slips him */
{ const S = M.newFight(G), e = mkBoss(), h = mkHero(G.levers[1].x - 20), w = mkWorld([h]); S.ph = 2; e.hp = e.maxHp * 0.4; S.side = 'E'; e.mode = 'rideTell'; e.modeT = 0.01;
  const rr = Math.random; Math.random = () => 0.99;   /* (no drop on this ride: the hook is what is proved) */
  let hookSeen = false, slipped = false, thrown = false; step(e, S, [h], w, 4, () => { if (S.leverHook) hookSeen = true; if (hookSeen && !S.leverHook && S.hooks.length) thrown = true; if (thrown && M.skySlippable(e, S) && !slipped) slipped = M.leverStruck(e, S, 'E', w); });
  Math.random = rr; ok(thrown, 'the hook at the lever comes before he is over the middle (the read: answer it, then strike)');
  ok(hookSeen && S.n.leverHook === 1 && w.said.includes('!'), 'riding, he hooks at the hero by a lever - told ' + SH.leverHook.tell[1] + ' s in P2 (a yellow ! over the lever)');
  ok(slipped && e.mode !== 'ride', 'and the lever still slips him (the denial is read, not a wall)'); }
/* the shove: a hero beside him on his gallery is shoved off (yellow) */
{ const S = M.newFight(G), e = mkBoss(), h = mkHero(G.perch.E.x - 20, G.perch.E.y), w = mkWorld([h]); M.atPerch(e, S); e.mode = 'perch'; S.restT = 0;
  step(e, S, [h], w, SH.shove.tell + SH.shove.t + 0.05); ok(S.n.shove === 0 ? false : w.hits.some(q => q.name === 'shove'), 'a hero beside him on his gallery: THE SHOVE (told, yellow)');
  const S2 = M.newFight(G), e2 = mkBoss(), h2 = mkHero(G.perch.E.x - 20, G.perch.E.y), w2 = mkWorld([h2]); h2.block = true; M.atPerch(e2, S2); e2.mode = 'perch'; S2.restT = 0;
  step(e2, S2, [h2], w2, SH.shove.tell + SH.shove.t + 0.05); ok(w2.hits.some(q => q.name === 'shove' && q.r === 'blocked'), 'a shield turns the shove (a yellow blow)'); }

/* ---------- 5. EVERY HERO HAS A WAY TO HIT HIM ---------- */
const REACH = { knight: 26, warden: 15, pyro: 22, paladin: 24, pirate: 22, reaper: 24, geomancer: 24, berserker: 19, ranger: 17, rimebinder: 22, demonhunter: 22, desertpriest: 22 };   /* tools/highlines.mjs's row (src/main.js attackBox0) */
ok(HERO_MOVE_IDS.every(h => REACH[h] !== undefined), 'the row covers every hero on master');
{ for (const m of ['downed', 'jarred', 'landed', 'sweepTell', 'climbTell', 'rise']) { const S = M.newFight(G), e = mkBoss(); e.x = G.mid; e.y = G.floorY; e.mode = m; e.modeT = 0.5;
    M.stepSky(e, S, DT, [], mkWorld([])); ok(e.y === G.floorY, m + ': he is on the station floor - every melee reach meets him (shortest ' + Math.min(...Object.values(REACH)) + ' + ' + SH.w / 2 + ')'); }
  for (const l of G.levers) ok(l.x > A.x0 && l.x < A.x1 && at(Math.floor(l.x / TS), A.floor / TS) === T.SOLID && at(Math.floor(l.x / TS), A.floor / TS - 1) !== T.SOLID, 'lever ' + l.id + ' stands on the station floor (a blow from the floor or a shot along it)');
  const apex = MOVE.JUMPV * MOVE.JUMPV / (2 * MOVE.GRAV); ok(apex > SH.swing.low + SH.h, 'the low swing\'s top (' + (SH.swing.low + SH.h) + ' px) clears under a jump (feet ' + apex.toFixed(0) + ' px up)');
  const lockT = SH.drop.tell[1] - SH.drop.track; ok(MOVE.RUN * lockT > SH.drop.r + 5, 'the drop\'s ring (' + SH.drop.r + ' px) can be left in its lock time at a walk (' + (MOVE.RUN * lockT).toFixed(0) + ' px in ' + lockT.toFixed(2) + ' s, P2)');
  ok(Math.min(...SH.hook.tell) >= 0.6 && Math.min(...SH.sweep.tell) >= 0.6 && Math.min(...SH.drop.tell) >= 0.7 && SH.swing.tell >= 0.8 && SH.cut.tell >= 1.2, 'every tell at least its floor (hook 0.6, sweep 0.6, drop 0.7, swing 0.8, cut 1.2)'); }
/* a full bot fight per hero (skyPlan driving a crude body): melee and ranged heroes both bring him down; how long, and what he did to them */
function botFight(hero, seats = 1, seed = 9) {
  let rs = seed; const rnd = () => ((rs = (rs * 1103515245 + 12345) & 0x7fffffff) / 0x7fffffff); const realRandom = Math.random; Math.random = rnd;
  try {
    const S = M.newFight(G), e = mkBoss(), hs = []; for (let s = 0; s < seats; s++) hs.push(mkHero(A.x0 + 60 + s * 120)); const w = mkWorld(hs); startFight(e, S, w);
    const ranged = hero === 'ranger' || hero === 'pirate' || hero === 'pyro', reach = REACH[hero], shield = ['knight', 'paladin', 'reaper', 'geomancer', 'warden'].includes(hero);
    const mems = hs.map(() => ({})); let t = 0, swings = 0, landed = 0, opens = 0, wasOpen = false;
    for (let i = 0; i < 60 * 400 && e.hp > 0; i++) { t += DT; w.t = t; for (const k of Object.keys(w.cut)) w.cut[k] = Math.max(0, w.cut[k] - DT);
      hs.forEach((h, j) => { const pl = M.skyPlan({ P: { x: h.x, y: h.y, vy: h.vy, face: h.face || 1, ground: h.ground, atk: h.atkCd > 0 ? 1 : -1, lk: h.lk }, e, S, reach, ranged, shield, dodge: true, t, mem: mems[j], rng: rnd });
        h.block = !!pl.block; if (pl.gx != null && Math.abs(pl.gx - h.x) > 3 && !pl.block) { h.vx = Math.sign(pl.gx - h.x) * MOVE.RUN; h.face = Math.sign(pl.gx - h.x); } else if (h.ground) { h.vx = 0; h.face = pl.face || h.face; }
        if (pl.jump && h.ground) { h.vy = MOVE.JUMPV; h.ground = false; } if (pl.dodge && h.ground && !(h.iframes > 0)) { h.iframes = 0.25; h.x += Math.sign(pl.gx - h.x || 1) * 20; }
        if (pl.atk && h.atkCd <= 0) { h.atkCd = 0.4; swings++; h.face = pl.face || h.face; const f = h.face || 1, rr = ranged ? 200 : reach;
          const lev = G.levers.find(l => (l.x - h.x) * f >= -6 && Math.abs(l.x - h.x) <= rr + 6 && h.y > G.floorY - 4); if (lev) M.leverStruck(e, S, lev.id, w);
          const bx = e.x - h.x; if (bx * f >= -SH.w / 2 && Math.abs(bx) <= rr + SH.w / 2 && h.y - (ranged ? 8 : 0) >= e.y - SH.h - (ranged ? 0 : 22) && h.y - (ranged ? 8 : 22) <= e.y) { const [d] = M.takeBlow(e, S, 20); e.hp -= d; landed++; } } });
      M.stepSky(e, S, DT, hs, w); for (const h of hs) heroPhys(h); const o = M.skyOpen(e); if (o && !wasOpen) opens++; wasOpen = o; }
    return { won: e.hp <= 0, t, taken: hs.reduce((a, h) => a + (h.taken || 0), 0), swings, landed, opens, n: S.n, ph: S.ph };
  } finally { Math.random = realRandom; }
}
{ const rows = [];
  for (const h of HERO_MOVE_IDS) { const r = botFight(h); rows.push(h + ' ' + (r.won ? r.t.toFixed(0) + 's' : 'NO') + ' took ' + r.taken + ' opens ' + r.opens + ' slips ' + r.n.slip + (process.env.SK_N ? ' ' + JSON.stringify(r.n) : ''));
    ok(r.won && r.opens >= 2 && r.n.slip >= 1, h + ': the plan brings him down (' + r.t.toFixed(0) + ' s, ' + r.opens + ' openings, ' + r.n.slip + ' slips, took ' + r.taken + ')'); }
  console.log('  bot fights (crude body, infinite hp - NOT a win rate): ' + rows.join(' | ')); }

/* ---------- 6. CO-OP ---------- */
for (const seats of [1, 2, 3, 4]) { const S = M.newFight(G), e = mkBoss(), hs = []; for (let s = 0; s < seats; s++) hs.push(mkHero(G.mid - 30 + s * 6)); const w = mkWorld(hs);
  e.x = G.mid; e.y = G.floorY; e.mode = 'sweepTell'; e.modeT = 0.01; S.act = 3; step(e, S, hs, w, 0.5);
  const per = hs.map((h, j) => w.hits.filter(q => q.hero === j && q.name === 'sweep').length);
  ok(per.every(k => k === 1), seats + ' seat(s): the sweep strikes each hero once (' + per.join(',') + ')'); }
{ const S = M.newFight(G), e = mkBoss(), a = mkHero(G.mid + 150), b = mkHero(G.perch.E.x - 60), w = mkWorld([a, b]); M.atPerch(e, S); e.mode = 'perch'; S.restT = 0; S.sinceRide = -9;
  let tgt = null; for (let i = 0; i < 200 && !tgt; i++) { Math.random = () => 0.9; M.stepSky(e, S, DT, [a, b], w); if (e.mode === 'hookTell') tgt = e.target; } Math.random = globalThis.__rnd || Math.random;
  ok(!tgt || tgt === b, 'the nearest seat is the target of his hook'); }
{ const r = botFight('knight', 2, 4); ok(r.won, 'two seats bring him down too (' + r.t.toFixed(0) + ' s); either seat\'s lever slips him (' + r.n.slip + ')'); }
{ const r = botFight('ranger', 4, 6); ok(r.won, 'four seats bring him down (' + r.t.toFixed(0) + ' s)'); }

/* ---------- 7. RESPAWN / RESET ---------- */
{ const L0 = JSON.parse(JSON.stringify(HL_DATA)), kit = lineInit(L0); ok(lineCut(kit, 'HL', 5) && kit.lines.HL.cut > 0, 'the kit parts his line'); lineRespawn(kit, []); ok(!(kit.lines.HL.cut > 0), 'a wipe or a retry strings it again (the kit\'s lineRespawn)');
  const sfx = new Proxy({}, { get: () => () => {} }); const P = { x: 300, y: 768, hp: 100, dead: false, lk: null };
  const L = { arena: A, h: 240 }; let boss = null, active = false;
  const ctx = { get L() { return L; }, get players() { return [P]; }, get boss() { return boss; }, get bossActive() { return active; }, TS, EHP: {}, sfx, hero: () => P, time: () => 0, kit: () => kit,
    number: () => {}, text: () => {}, burst: () => {}, sparks: () => {}, shake: () => {}, ring: () => {}, damagePlayer: () => 'hit', asPlayer: (p, fn) => fn(), upright: () => true, overlap: () => false, box: b => ({ l: b.x - 5, r: b.x + 5, t: b.y - 14, b: b.y }), hint: () => {} };
  const Hh = makeSkyhookHands(ctx); boss = Hh.spawnBoss({ x: 0, y: 0, alive: true }); const props = Hh.props();
  ok(boss && boss.mode === 'sleep' && boss.hp === SH.hp && props.length === 2 && props.every(p => p.t === 'skylever' && p.maxHp && !p.harmless), 'spawnBoss: SKYHOOK asleep on his gallery at full health, his two levers as props (maxHp: the lab keeps them; not harmless: every shot reaches them)');
  active = true; boss.mode = 'wake'; boss.modeT = 0.01; for (let i = 0; i < 60 * 8 && !M.skyOnLine(boss); i++) { Hh.update(boss, DT); for (const k of Object.values(kit.lines)) k.cut = Math.max(0, k.cut - DT); }
  for (let i = 0; i < 60 * 4 && !M.skySlippable(boss, Hh.show()); i++) Hh.update(boss, DT); ok(M.skyOnLine(boss) && M.skySlippable(boss, Hh.show()), 'the hands run him out along his line'); Hh.lever(props[0], 0); ok(boss.mode === 'slip' && kit.lines.HL.cut > 0, 'a lever struck through the hands slips him and parts the kit\'s line');
  const d = Hh.take(boss, 100); ok(d === 50 || d === 40, 'the hands\' take: his coat (or ward) on a blow (' + d + ')');
  Hh.end(boss); ok(!(kit.lines.HL.cut > 0), 'his end strings the high line again');
  Hh.clear(); ok(!Hh.show() && !Hh.on(), 'clear: a retry starts a fresh fight'); const b2 = Hh.spawnBoss({ x: 0, y: 0, alive: true }); ok(b2.mode === 'sleep' && Hh.show().ph === 1 && Hh.show().n.slip === 0 && Hh.props().length === 2, 'and spawnBoss makes him (and his levers) again, phase one');
  /* 8b. the hands draw every pose and the overlay without throwing (a stub canvas) */
  const g = new Proxy({}, { get: (o, k) => (k in o ? o[k] : () => {}), set: (o, k, v) => { o[k] = v; return true; } });
  let threw = null; try { for (const m of Object.keys(POSE).concat(['downed', 'slip'])) { b2.mode = m; b2.modeT = 0.3; b2.lockX = b2.x; b2.aimX = 300; b2.aimY = 700; Hh.drawBoss(g, b2, 0, 0, 1); boss = b2; Hh.drawOver(g, 0, 0, 1); } for (const p of Hh.props()) Hh.drawBoss(g, p, 0, 0, 1); } catch (err) { threw = err; }
  ok(!threw, 'the greybox draws every pose, the levers and the overlay (' + (threw && threw.message) + ')'); }

/* ---------- 8. B16 + lines routed ---------- */
for (const [wu, rel] of M.MOVES) ok(POSE[wu] && POSE[rel] && JSON.stringify(POSE[wu]) !== JSON.stringify(POSE[rel]), 'B16: ' + wu + ' and ' + rel + ' are two pictures');
for (const m of ['perch', 'wake', 'ride', 'drop', 'landed', 'jarred', 'climb', 'slip', 'downed', 'rise', 'hook', 'cut', 'swing']) ok(POSE[m], 'a pose for ' + m);
for (const [k, t] of Object.entries(M.SKY_SAY)) if (k !== 'guard') ok(isCallout(t), 'routed (hint-lines): ' + t);
ok(Object.values(M.SKY_SAY).every(t => t.length <= 48), 'every line short enough for a callout');

/* ---------- 9. THE ARENA ---------- */
{ ok(A.boss === 'skyhook' && B.ents.some(e => e.t === 'skyhook'), 'the head station is his arena, and he is in the level');
  ok(A.x1 - A.x0 === 32 * TS, 'the stub is shrunk to 32 tiles across (' + (A.x1 - A.x0) / TS + ')');
  for (const s of ['W', 'E']) { const p = G.perch[s], tx = Math.floor(p.x / TS); ok(at(tx, p.y / TS) === T.ONEWAY && at(tx, p.y / TS - 1) !== T.SOLID, 'his ' + s + ' perch stands on its gallery deck'); }
  const L0 = JSON.parse(JSON.stringify(HL_DATA)), kit = lineInit(L0), hl = kit.lines[G.line.id];
  ok(hl && hl.cut === 0 && Math.abs(hl.xa - G.line.xa) < 1 && Math.abs(hl.xb - G.line.xb) < 1, 'his high line is a line-kit line (players may ride it too)');
  for (const s of ['W', 'E']) { const z = kit.lines[G.winch[s]], hy = Math.min(z.y0, z.y1), hx = z.y0 < z.y1 ? z.x0 : z.x1; ok(z.kind === 'winch' && z.d.cut && Math.abs(hx - G.perch[s].x) < 64 && hy < G.perch[s].y, 'the ' + s + ' winch line tops out at his ' + s + ' gallery (a melee hero\'s way up to him)'); }
  ok(G.ropeY(G.mid) + SH.hang < G.floorY - 80, 'riding, he hangs out of a melee hero\'s reach (feet ' + (G.floorY - G.ropeY(G.mid) - SH.hang).toFixed(0) + ' px up): the lever is how you get him'); }

console.log('skyhook: ' + n + ' checks OK (' + ((Date.now() - t0) / 1000).toFixed(1) + ' s)');
// batch189: touched so the QUICK gate runs this check beside the cave-backdrop draw change
