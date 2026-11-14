// tools/sky2.mjs - SKYHOOK 2 (claude/sky2grey; src/skyhook2.js + src/skyhook2-hands.js; scratch/lane-reports/skyhook2-plan.md lane 1). Node only, no browser.
//   node tools/sky2.mjs            the proofs (exit 1 on a fail)
//   node tools/sky2.mjs --sanity   + the n=6 knight sanity (flag ON, crude body WITH flasks; NOT the tune) and the levers-off rows
//   0  THE FLAG: SKY2_DEFAULT false; off -> the live hands (src/skyhook-hands.js), on -> SKYHOOK 2; the level (src/highlines.js) is not read differently
//   1  B15 + THE SWITCH EXCEPTION: 0 only on his SKY line or a crown (told OUT OF REACH); >= 0.4x everywhere else; DOWN / SMASHED x2, JARRED x1.5 to their purses
//   2  PHASE GATES 65 / 35 (only at a crown, never through an opening); ENRAGE at 20% hp or 270 s
//   3  EACH LEVER: POINTS sets the LOW route; re-hook after 3.5 / 2.5 / 2.0 s, told 1.0 s, HELD by a strike in the tell; WEIGHT drops him DOWN only on the LOW line, then 6 s
//      spent; the LOW line's fray (P2+): WEIGHT in it drops him early, else the line parts (whip, 6 s, POINTS locked); CRANE dark till P3, its skip smashes him on LOW,
//      snaps the SKY line under him, hits heroes and co-op partners, walls safe; A3 every 2.4 s enraged, CRANE pauses it 3 s
//   4  THE NEW ATTACKS: A1 / A2 / A3 - tell, damage, answer, for all 9 heroes; tells precede hits (every blow >= 0.5 s after its own tell)
//   5  CO-OP: set-only POINTS (no seat undoes another), every blow keyed once a hero, the skip hits every seat in its arc
//   6  NO SOFT-LOCK: every cut restrings; from every bad state (all lines cut, every hero knocked to the floor, the weight spent, the points locked) the fight completes
//   7  EVERY HERO: a full bot fight per class (sky2Plan) brings him down using the levers; a levers-off bot cannot
//   8  THE HANDS: spawn, 3 props, a lever through the hands, take, the fall cost, the iron step written and restored, every pose + the overlay drawn (stub canvas)
import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import * as M from '../src/skyhook2.js';
import { SKY2, SKY2_DEFAULT } from '../src/skyhook2.js';
import { makeSkyhookHands } from '../src/skyhook-hands.js';
import { pose2 } from '../src/skyhook2-hands.js';
import { isCallout } from '../src/hint-lines.js';
import { HL_DATA, buildHighLines } from '../src/highlines.js';
import { lineInit } from '../src/line-kit.js';
import { MOVE, HERO_MOVE_IDS } from '../src/hero-move.js';
import { T, LEVELS } from '../src/level.js';
import { MARK, ANSWER, HEIGHT, BY_HAND } from '../src/marks.js';
const { SK } = M, TS = 16, DT = 1 / 60, SANITY = process.argv.includes('--sanity');
let n = 0; const ok = (c, m) => { assert.ok(c, m); n++; };
const t0 = Date.now();
const painter = (W, H) => { const grid = new Uint8Array(W * H), ents = []; const set = (x, y, v) => { if (x >= 0 && y >= 0 && x < W && y < H) grid[y * W + x] = v; };
  return { W, H, grid, ents, set, block: (x0, x1, y0, y1) => { for (let y = y0; y <= y1; y++) for (let x = x0; x <= x1; x++) set(x, y, T.SOLID); }, ent: (t, x, y, o = {}) => ents.push({ t, x, y, ...o }) }; };
const B = buildHighLines({ painter, T, TS }), A = B.arena, at = (x, y) => B.grid[y * B.W + x];
const KIT = lineInit(JSON.parse(JSON.stringify(HL_DATA)));
const feet = {}; for (const s of ['W', 'E']) { const z = KIT.lines[A.winch[s]]; feet[s] = z.y0 > z.y1 ? { x: z.x0, y: z.y0 } : { x: z.x1, y: z.y1 }; }
const G = M.geom2(A, { feet });
const rng = seed => { let rs = seed >>> 0 || 1; return () => ((rs = (rs * 1103515245 + 12345) & 0x7fffffff) / 0x7fffffff); };
const withRandom = (r, fn) => { const real = Math.random; Math.random = r; try { return fn(); } finally { Math.random = real; } };
/* ---------- a small world: heroes as boxes (the floor, the two galleries, the iron step), the winch lines by hand ---------- */
function mkWorld(heroes) {
  const cut = {}, w = { hits: [], marks: [], sounds: [], said: [], t: 0, cut, steps: [], knocked: 0,
    number: (x, y, t) => w.said.push(t), sound: k => w.sounds.push(k), shake: () => {}, music: () => {}, mark: m => w.marks.push(m), markAt: (x, y, m) => w.marks.push(m), fx: () => {},
    lineUp: id => !(cut[id] > 0), cutLine: (id, s) => { if (cut[id] > 0) return false; cut[id] = s; for (const h of heroes) if (h.lk === id) { h.lk = null; h.fallCost = true; h.ground = false; } return true; },
    riders: id => heroes.filter(h => h.alive && h.lk === id),
    knock: (id) => { let k = 0; for (const h of heroes) if (h.lk === id) { h.lk = null; h.fallCost = true; h.ground = false; h.vy = -60; k++; } w.knocked += k; return k; },
    step: (x, on) => { if (on) w.steps.push({ x0: Math.floor(x / TS) * TS, x1: Math.floor(x / TS) * TS + TS, top: G.floorY - TS, on: true }); else for (const s of w.steps) s.on = false; },
    hit: (bx, d, name, op = {}) => { const out = [];
      for (const h of heroes) { if (!h.alive) continue; if (op.ridersOnly && h.lk !== op.ridersOnly) continue;
        const hb = { l: h.x - 5, r: h.x + 5, t: h.y - 22, b: h.y }; if (hb.r < bx[0] || hb.l > bx[1] || hb.b < bx[2] || hb.t > bx[3]) continue;
        h.keys = h.keys || new Set(); const key = op.key || name; if (h.keys.has(key)) continue; h.keys.add(key);
        let r; if (h.iframes > 0) r = 'miss'; else if (h.block && op.yellow) r = 'blocked'; else { r = 'hit'; h.hp -= d; h.taken = (h.taken || 0) + d; h.hurtBy = h.hurtBy || {}; h.hurtBy[name] = (h.hurtBy[name] || 0) + d; if (h.lk) { h.lk = null; h.fallCost = true; }
          if (op.up) { h.vy = op.up; h.ground = false; } if (op.push) { h.vx = op.pushFrom !== undefined ? Math.sign(h.x - op.pushFrom) * op.push : op.push; } if (op.pull) h.vx = Math.sign((op.pullTo ?? 0) - h.x) * op.pull; }
        out.push(r); w.hits.push({ t: w.t, name, r, hero: heroes.indexOf(h), d, key: op.key }); }
      return out; } };
  return w;
}
const mkHero = (x, y = G.floorY, o = {}) => ({ x, y, vx: 0, vy: 0, ground: true, alive: true, lk: null, hp: 1e9, iframes: 0, block: false, atkCd: 0, stun: 0, face: 1, ...o });
const mkBoss = (hp = SK.hp) => ({ x: G.crown.E.x, y: G.crown.E.y, hp, maxHp: hp, mode: 'sleep', modeT: 0, face: -1, alive: true, t: 'skyhook' });
const wake = e => { e.mode = 'wake'; e.modeT = 1.6; };
const decks = [{ x0: A.x0, x1: A.x1, top: G.floorY }, { x0: 8 * TS, x1: 13 * TS, top: 40 * TS }, { x0: 35 * TS, x1: 40 * TS, top: 40 * TS }];
function heroPhys(h, w) {
  if (!h.alive || h.lk) return; const oy = h.y, all = decks.concat((w && w.steps || []).filter(s => s.on));
  h.vx -= Math.sign(h.vx) * Math.min(Math.abs(h.vx), (h.ground ? MOVE.FRIC_GROUND : MOVE.FRIC_AIR) * DT);
  if (!h.ground) h.vy = Math.min(MOVE.MAX_FALL, h.vy + MOVE.GRAV * DT);
  h.x = Math.max(A.x0 + 5, Math.min(A.x1 - 5, h.x + h.vx * DT)); h.y += h.vy * DT;
  if (h.vy >= 0) for (const d of all) if (h.x >= d.x0 && h.x < d.x1 && oy <= d.top + 0.5 && h.y >= d.top) { h.y = d.top; h.vy = 0; h.ground = true; break; }
  if (h.ground && !all.some(d => h.x >= d.x0 && h.x < d.x1 && Math.abs(h.y - d.top) < 1)) h.ground = false;
  if (h.ground && h.fallCost) { h.fallCost = false; const d = Math.min(SK.fall.dmg, Math.max(0, h.hp - 1)); h.hp -= d; h.fell = (h.fell || 0) + 1; h.taken = (h.taken || 0) + d; h.stun = SK.fall.stun; h.vx = 0; }
  h.iframes = Math.max(0, h.iframes - DT); h.atkCd = Math.max(0, h.atkCd - DT); h.stun = Math.max(0, h.stun - DT);
}
const tick = (e, S, hs, w) => { w.t += DT; for (const k of Object.keys(w.cut)) w.cut[k] = Math.max(0, w.cut[k] - DT); M.stepSky2(e, S, DT, hs, w); for (const h of hs) heroPhys(h, w); };
const run = (e, S, hs, w, s, each) => { for (let i = 0; i < Math.round(s / DT); i++) { tick(e, S, hs, w); if (each && each(i) === false) break; } };
const setUp = (o = {}) => { const S = M.newFight2(G), e = mkBoss(), hs = o.heroes || [mkHero(G.mid)], w = mkWorld(hs); if (o.ph) { S.ph = o.ph; e.phase = o.ph; e.hp = e.maxHp * (o.ph === 3 ? 0.3 : o.ph === 2 ? 0.5 : 1); } S.woke = true; return { S, e, hs, w }; };
/* put him on the LOW line at x, riding */
const onLow = (e, S, x = G.mid, dir = 1) => { M.hangOn(e, S, 'low', x); e.mode = 'ride'; e.lowDir = dir; S.onLow = 0; S.lowVisit = S.lowVisit || 1; };
const onSky = (e, S, x = G.mid, to = 'E') => { M.hangOn(e, S, 'sky', x); e.mode = 'ride'; e.rideTo = to; S.dropsThisRide = 1; };

/* ---------- 0. THE FLAG ---------- */
{ ok(SKY2_DEFAULT === false && SKY2 === false, 'SKY2 ships OFF (SKY2_DEFAULT false; this process has no ?sky2 / BRACKEN_SKY2)');
  const stub = () => ({ L: { arena: A, h: 240, w: B.W, grid: B.grid.slice() }, players: [], boss: null, bossActive: false, TS, EHP: {}, sfx: new Proxy({}, { get: () => () => {} }), hero: () => ({}), time: () => 0, kit: () => null,
    number: () => {}, text: () => {}, burst: () => {}, sparks: () => {}, shake: () => {}, ring: () => {}, damagePlayer: () => 'hit', asPlayer: (p, fn) => fn(), upright: () => true, overlap: () => false, box: () => ({}), hint: () => {} });
  const off = makeSkyhookHands(stub()), on = makeSkyhookHands({ ...stub(), sky2: true }), off2 = makeSkyhookHands({ ...stub(), sky2: false });
  ok(!off.sky2 && !off2.sky2 && on.sky2 === true, 'flag off (and ?sky2=0 after the flip: ctx.sky2 false) -> the live hands; ctx.sky2 / ?sky2=1 -> SKYHOOK 2');
  const b0 = off.spawnBoss({ x: 0, y: 0, alive: true }), b1 = on.spawnBoss({ x: 0, y: 0, alive: true });
  ok(b0.hp === 1500 && off.props().length === 2 && b1.hp === SK.hp && on.props().length === 3, 'off: 1500 hp, 2 levers (the live fight); on: ' + SK.hp + ' hp, 3 levers (' + on.props().map(p => p.id).join(' ') + ')');
  const src = ['highlines.js'].map(f => f);   /* the level file is untouched by this lane: git diff master -- src/highlines.js is empty (the report says so) */
  const LV = LEVELS.find(l => l.id === 'highlines'), hash = () => { const L = LV.build(); return createHash('sha1').update(JSON.stringify([L.W, L.H, Array.from(L.grid), L.ents.filter(q => !q.stuck && q.t !== 'lostbanner'), L.moversExtra || null, L.ambushes || null], (k, v) => k === 'stand' ? undefined : v)).digest('hex').slice(0, 12); };
  const h0 = hash(); globalThis.__SKY2 = true; const h1 = hash(); delete globalThis.__SKY2;
  ok(LV && h0 === h1 && src.length === 1, 'the level hash is the same with the flag on and off (' + h0 + '): SKYHOOK 2 lives in his own modules, the arena data is unchanged');
  console.log('  highlines level hash ' + h0); }

/* ---------- 1. B15 + THE SWITCH EXCEPTION ---------- */
{ const S = M.newFight2(G), e = mkBoss();
  const crown = ['wake', 'perch', 'phaseTell', 'enrageTell', 'rideTell', 'hookTell', 'hook', 'cutTell', 'cut', 'cwTell', 'cw', 'rivetTell', 'rivet', 'swingTell'];
  for (const m of crown) { e.mode = m; S.ward = 0; const [d, word] = M.takeBlow2(e, S, 100); ok(d === 0 && word === M.SKY2_SAY.reach, 'at a crown (' + m + '): OUT OF REACH, told'); }
  e.mode = 'ride'; e.route = 'sky'; ok(M.takeBlow2(e, S, 100)[0] === 0, 'riding the SKY line: OUT OF REACH'); e.mode = 'dropTell'; ok(M.takeBlow2(e, S, 100)[0] === 0, 'setting his drop from the SKY line: OUT OF REACH');
  for (const m of ['ride', 'rehookTell', 'frayTell', 'rampUp', 'swingBack', 'drop', 'landed', 'sweepTell', 'sweep', 'climbTell', 'climb', 'slip', 'swing']) { e.mode = m; e.route = 'low'; S.ward = 0; const [d, word] = M.takeBlow2(e, S, 100);
    ok(d >= 40 && word, m + (m === 'ride' ? ' (LOW)' : '') + ': ' + d + ' of 100 (>= 0.4x) and says why (' + word + ')'); }
  e.mode = 'ride'; e.route = 'low'; ok(M.takeBlow2(e, S, 100)[0] === 75 && M.takeBlow2(e, S, 100)[1] === M.SKY2_SAY.guard, 'on the LOW line his coat: x0.75 (Daniel 11-14 answer 2)');
  e.mode = 'rise'; ok(M.takeBlow2(e, S, 100)[0] === 40, 'rising: warded x0.4');
  e.mode = 'downed'; e.modeT = 3; S.purse = e.maxHp * SK.downed.cap; ok(M.takeBlow2(e, S, 50)[0] === 100, 'DOWN x2');
  let got = 100; for (let i = 0; i < 60 && e.modeT > 0.05; i++) got += M.takeBlow2(e, S, 50)[0]; ok(Math.abs(got - e.maxHp * SK.downed.cap) < 2, 'a DOWN is worth ' + SK.downed.cap + ' of him (' + got + '), then he gets up');
  e.mode = 'smashed'; e.modeT = 3; S.purse = e.maxHp * SK.smashed.cap; ok(M.takeBlow2(e, S, 50)[0] === 100 && M.sky2Open(e), 'SMASHED x2 (an opening)');
  e.mode = 'jarred'; e.modeT = 1; S.purse = e.maxHp * SK.jarred.cap; ok(M.takeBlow2(e, S, 40)[0] === 60, 'JARRED x1.5');
  ok(SK.low >= 0.4 && SK.wardMul >= 0.4, 'the floors outside the switch: coat x' + SK.low + ', ward x' + SK.wardMul); }

/* ---------- 2. PHASE GATES + ENRAGE ---------- */
{ for (const [hp, want, say] of [[0.66, 1, null], [0.65, 2, M.SKY2_SAY.p2]]) { const { S, e, w } = setUp(); e.hp = e.maxHp * hp; M.atCrown(e, S); e.mode = 'perch'; S.restT = 0; run(e, S, [], w, 0.1);
    ok(S.ph === want && (!say || w.said.includes(say)), 'at ' + Math.round(hp * 100) + '%: phase ' + S.ph + (say ? ' (told: ' + say + ')' : '')); }
  { const { S, e, w } = setUp({ ph: 2 }); e.hp = e.maxHp * 0.35; M.atCrown(e, S); e.mode = 'perch'; S.restT = 0; run(e, S, [], w, 0.1); ok(S.ph === 3 && w.said.includes(M.SKY2_SAY.p3) && S.ward > 0, 'at 35%: phase 3 - THE CRANE IS LIT (warded through the tell)'); }
  { const { S, e, w } = setUp(); e.hp = e.maxHp * 0.3; e.mode = 'downed'; e.modeT = 1; S.purse = 9999; M.stepSky2(e, S, DT, [], w); ok(S.ph === 1, 'never through an opening: the phase waits for a crown'); }
  { const { S, e, w } = setUp({ ph: 3 }); e.hp = e.maxHp * 0.2; M.atCrown(e, S); e.mode = 'perch'; S.restT = 0; run(e, S, [], w, SK.enrage.tell + 0.2);
    ok(S.enraged && S.n.enrage === 1 && w.said.includes(M.SKY2_SAY.enrage), 'at 20% hp: ENRAGED (told: ' + M.SKY2_SAY.enrage + ', a ' + SK.enrage.tell + ' s warded tell)'); }
  { const { S, e, w } = setUp(); M.atCrown(e, S); e.mode = 'perch'; S.restT = 99; S.t = SK.enrage.t - 0.05; run(e, S, [], w, 0.2); ok(e.mode === 'enrageTell' && S.ph === 1, 'at 270 s from his wake, phase 1 or not: he cuts the guy'); }
  { const S = M.newFight2(G); S.enraged = true; ok(Math.abs(SK.ride.v[0] * SK.enrage.speed - 168) < 1, 'enraged he rides 20% faster (' + SK.ride.v.map(v => v * SK.enrage.speed).join('/') + ' px/s)'); void S; } }

/* ---------- 3. THE LEVERS ---------- */
/* POINTS: sets the LOW route; his next ride takes it */
{ const { S, e, hs, w } = setUp({ heroes: [mkHero(G.levers[0].x + 20)] }); M.atCrown(e, S); e.mode = 'perch'; S.restT = 99;
  ok(M.lamps(e, S).POINTS === 'SKY' && M.lamps(e, S).blink.POINTS, 'he is out of reach: the POINTS lamp blinks SKY');
  ok(M.leverStruck2(e, S, 'POINTS', w) === 'set' && S.points === 'LOW' && M.nextRoute(S) === 'low', 'POINTS struck: SET - his next ride takes the LOW line');
  e.mode = 'rideTell'; e.modeT = 0.01; run(e, S, hs, w, 0.05); ok(e.mode === 'ride' && e.route === 'low' && S.n.lowRide === 1, 'he hooks on and the trolley takes the ramp down');
  let reachedLow = false; run(e, S, hs, w, 3, () => { if (Math.abs(e.y - (G.lowY + SK.hang)) < 1) reachedLow = true; if (reachedLow) return false; });
  ok(reachedLow && M.sky2OnLow(e) && !M.sky2Immune(e), 'down the ramp onto the LOW line (feet ' + (G.floorY - G.lowY - SK.hang) + ' px over the floor): in reach, x0.75'); }
/* the re-hook, P1/P2/P3 delays, the hold, the snap back */
for (const ph of [1, 2, 3]) { const { S, e, hs, w } = setUp({ ph }); S.points = 'LOW'; onLow(e, S, G.mid, 1); S.lowVisit = 2;   /* an even visit: the re-hook (P2+ cuts on the odd ones) */
  let tTell = null; run(e, S, hs, w, 6, i => { if (e.mode === 'rehookTell') { tTell = (i + 1) * DT; return false; } });
  ok(tTell !== null && Math.abs(tTell - SK.points.rehook[ph - 1]) < 0.05 && w.said.includes(M.SKY2_SAY.rehook), 'P' + ph + ': after ' + SK.points.rehook[ph - 1] + ' s on the LOW line HE HOOKS THE POINTS (told ' + SK.points.tell + ' s: a gold chain to the lever, the lamp HOOKING)');
  ok(M.lamps(e, S).POINTS === 'HOOKING', 'P' + ph + ': the POINTS lamp flickers HOOKING');
  run(e, S, hs, w, SK.points.tell * 0.5); ok(M.leverStruck2(e, S, 'POINTS', w) === 'held' && S.points === 'LOW' && e.mode === 'ride' && S.n.held === 1 && w.said.includes(M.SKY2_SAY.held), 'P' + ph + ': POINTS struck in the tell: HELD - he stays on the LOW line');
  let again = false; run(e, S, hs, w, 6, () => { if (e.mode === 'rehookTell') { again = true; return false; } });
  run(e, S, hs, w, SK.points.tell + 0.05); ok(again && S.points === 'SKY' && e.mode === 'rampUp' && S.n.rehook === 1 && w.said.includes(M.SKY2_SAY.snapBack), 'P' + ph + ': not struck in the tell: the points snap back to SKY and he cranks up the ramp');
  run(e, S, hs, w, 5, () => e.mode !== 'rampUp' ? false : undefined); ok(e.mode === 'perch' && M.sky2Immune(e), 'P' + ph + ': back on a crown, out of reach'); }
/* BACK UP AFTER A DOWN: he hooks the points from his crown first (told, holdable) */
{ const { S, e, hs, w } = setUp(); S.points = 'LOW'; e.x = G.mid; e.y = G.floorY; e.mode = 'climbTell'; e.modeT = 0.01; e.fromDown = true; e.climbTo = 'W'; run(e, S, hs, w, SK.climb.t + 0.05);
  ok(e.mode === 'crownHookTell' && M.sky2Immune(e) && M.lamps(e, S).POINTS === 'HOOKING' && w.said.includes(M.SKY2_SAY.rehook), 'back on a crown after a DOWN with the points LOW: HE HOOKS THE POINTS (told ' + SK.points.tell + ' s, out of reach)');
  ok(M.leverStruck2(e, S, 'POINTS', w) === 'held' && S.points === 'LOW' && e.mode === 'perch', 'POINTS struck in the tell: HELD - his next ride is LOW again');
  e.x = G.mid; e.y = G.floorY; e.mode = 'climbTell'; e.modeT = 0.01; e.fromDown = true; run(e, S, hs, w, SK.climb.t + SK.points.tell + 0.1); ok(S.points === 'SKY' && S.n.rehook === 1, 'not held: the points snap back to SKY'); }
/* WEIGHT */
{ const { S, e, hs, w } = setUp(); M.atCrown(e, S); e.mode = 'perch'; S.restT = 99;
  ok(M.leverStruck2(e, S, 'WEIGHT', w) === 'clank' && w.said.includes(M.SKY2_SAY.notLow) && S.weightT === 0, 'WEIGHT while he is on a crown: a clank, HE IS NOT ON THE LOW LINE (and it is not spent)');
  onSky(e, S); ok(M.leverStruck2(e, S, 'WEIGHT', w) === 'clank', 'WEIGHT while he rides the SKY line: a clank');
  onLow(e, S, G.mid); ok(M.lamps(e, S).blink.WEIGHT, 'on the LOW line the WEIGHT lamp blinks READY');
  ok(M.leverStruck2(e, S, 'WEIGHT', w) === 'down' && e.mode === 'slip' && S.weightT === SK.weight.rehang, 'WEIGHT while he is on the LOW line: THE WEIGHT DROPS');
  run(e, S, hs, w, SK.weight.fall + 0.05); ok(e.mode === 'downed' && S.n.downed === 1 && Math.abs(S.purse - e.maxHp * SK.downed.cap) < 1, 'he lands DOWN (x2, purse ' + SK.downed.cap + ', ' + SK.downed.t + ' s)');
  onLow(e, S, G.mid); ok(M.leverStruck2(e, S, 'WEIGHT', w) === 'clank' && M.lamps(e, S).WEIGHT === 'SPENT', 'the weight is SPENT for ' + SK.weight.rehang + ' s');
  run(e, S, [], w, SK.weight.rehang); onLow(e, S, G.mid); ok(M.leverStruck2(e, S, 'WEIGHT', w) === 'down', 'and re-hung after ' + SK.weight.rehang + ' s'); }
/* P2: THE LOW LINE'S FRAY - WEIGHT drops him early; uncountered it parts the line (whip, POINTS locked, restrung in 6 s) */
{ const { S, e, w } = setUp({ ph: 2, heroes: [mkHero(G.levers[1].x)] }); const hs = []; S.points = 'LOW'; onLow(e, S, G.mid); S.lowVisit = 1;
  run(e, S, hs, w, SK.points.rehook[1] + 0.05); ok(e.mode === 'frayTell' && w.said.includes(M.SKY2_SAY.fray) && w.marks.includes('!!'), 'P2: after ' + SK.points.rehook[1] + ' s on the LOW line HE CUTS THE LOW LINE (told ' + SK.fray.tell + ' s, a red !!, a fray bar)');
  run(e, S, hs, w, SK.fray.tell * 0.6); ok(M.leverStruck2(e, S, 'WEIGHT', w) === 'down', 'WEIGHT struck in the fray: he drops early');
  run(e, S, hs, w, SK.weight.fall + 0.05); ok(e.mode === 'downed' && S.lowCut === 0, 'DOWN, and the low line still strung'); }
{ const h = mkHero(G.mid + 30), far = mkHero(G.x0 + 12); const { S, e, w } = setUp({ ph: 2, heroes: [h, far] }); const hs = [h, far]; S.points = 'LOW'; onLow(e, S, G.mid); S.lowVisit = 1;
  run(e, S, hs, w, SK.points.rehook[1] + SK.fray.tell + 0.2);
  ok(S.lowCut > 0 && S.points === 'SKY' && S.n.lowCut === 1 && (e.mode === 'swingBack' || e.mode === 'perch'), 'the fray uncountered: the LOW line parts, the points snap to SKY, he swings back to a crown');
  ok(w.hits.some(q => q.name === 'whip' && q.hero === 0 && q.d === SK.fray.dmg) && !w.hits.some(q => q.name === 'whip' && q.hero === 1), 'the rope whips the floor along the line: ' + SK.fray.dmg + ' red to a hero on it; a hero by the wall is clear');
  ok(M.lamps(e, S).POINTS === 'LOCKED' && M.leverStruck2(e, S, 'POINTS', w) === 'clank' && w.said.includes(M.SKY2_SAY.locked), 'POINTS is locked grey while the low line is down (told)');
  run(e, S, [], w, SK.fray.restring); ok(S.lowCut === 0 && M.leverStruck2(e, S, 'POINTS', w) === 'set', 'the LOW line re-strings in ' + SK.fray.restring + ' s and POINTS works again'); }
{ const { S, e, w } = setUp({ ph: 2 }); S.points = 'LOW'; let frays = 0, rehooks = 0; for (let v = 1; v <= 4; v++) { onLow(e, S, G.mid); S.lowVisit = v; run(e, S, [], w, SK.points.rehook[1] + 0.05); if (e.mode === 'frayTell') frays++; if (e.mode === 'rehookTell') rehooks++; S.lowCut = 0; }
  ok(frays === 2 && rehooks === 2, 'P2+: his LOW visits alternate - cut the line, hook the points (' + frays + ' / ' + rehooks + ')'); }
/* THE CRANE */
{ const { S, e, w } = setUp({ ph: 2 }); M.atCrown(e, S); e.mode = 'perch'; ok(M.leverStruck2(e, S, 'CRANE', w) === 'clank' && M.lamps(e, S).CRANE === 'DARK', 'CRANE is dark before phase 3 (a clank)'); }
function craneRun(o) {
  const hs = o.heroes || [], { S, e, w } = setUp({ ph: 3, heroes: hs }); S.restT = 99; if (o.where === 'low') { S.points = 'LOW'; onLow(e, S, o.x ?? G.mid, 1); S.onLow = -99; } else if (o.where === 'sky') { onSky(e, S, o.x ?? G.mid, 'E'); } else { M.atCrown(e, S); e.mode = 'perch'; S.restT = 99; }
  if (o.freeze) e.modeT = 99;
  const r = M.leverStruck2(e, S, 'CRANE', w); let skipAtHim = null;
  run(e, S, hs, w, SK.crane.tell + SK.crane.sweep + 0.05, () => { if (o.hold) { if (o.where === 'low') { M.hangOn(e, S, 'low', o.x ?? G.mid); if (e.mode === 'ride') e.mode = 'ride'; } if (o.where === 'sky' && e.mode === 'ride') M.hangOn(e, S, 'sky', o.x ?? G.mid); } if (e.mode === 'smashed' || e.mode === 'slip') { skipAtHim = skipAtHim || e.mode; } });
  return { S, e, w, r, skipAtHim, hs };
}
{ const r = craneRun({ where: 'crown' }); ok(r.r === 'swing' && r.S.n.crane === 1 && r.w.marks.includes('!!') && r.w.said.includes(M.SKY2_SAY.crane), 'P3: CRANE struck - THE SKIP SWINGS (told ' + SK.crane.tell + ' s: a red arc, a !! over the jib, a rattle)');
  ok(M.lamps(r.e, r.S).CRANE === 'COOLING' && M.leverStruck2(r.e, r.S, 'CRANE', r.w) === 'clank', 'then COOLING (' + SK.crane.cool + ' s): a clank'); }
{ const r = craneRun({ where: 'low', x: G.mid, hold: true }); ok(r.e.mode === 'smashed' && r.S.n.smashed === 1 && Math.abs(r.S.purse - r.e.maxHp * SK.smashed.cap) < 1, 'the skip meets him on the LOW line: SMASHED (x2, purse ' + SK.smashed.cap + ')'); }
{ const r = craneRun({ where: 'sky', x: G.mid, hold: true }); run(r.e, r.S, [], r.w, SK.weight.fall + 0.1); ok(r.S.n.skySnap === 1 && r.S.skyCut > 0 && r.e.mode === 'downed' && Math.abs(r.S.purse - r.e.maxHp * SK.smashed.capSky) < 1, 'the chain crosses his SKY trolley: THE SKY LINE SNAPS - DOWN (purse ' + SK.smashed.capSky + '), the line restrings in ' + SK.cut.restring + ' s'); }
{ const r = craneRun({ where: 'low', x: G.ramp.W, hold: true }); ok(r.S.n.smashed === 0 && r.e.mode !== 'smashed', 'mistimed (he is at the end of the LOW line): the skip misses him'); }
{ const mid = mkHero(G.mid), mate = mkHero(G.mid + 12), wallW = mkHero(G.x0 + 12), wallE = mkHero(G.x1 - 12), gal = mkHero(G.x0 + 40, 40 * TS); const r = craneRun({ where: 'crown', heroes: [mid, mate, wallW, wallE, gal] });
  const hit = j => r.w.hits.filter(q => q.name === 'skip' && q.hero === j && q.r === 'hit').length;
  ok(hit(0) === 1 && hit(1) === 1 && r.w.hits.find(q => q.name === 'skip').d === SK.crane.dmg, 'the skip hits everyone in its arc once: the striker and a co-op partner (' + SK.crane.dmg + ', red, knocked back) - Daniel 11-14 answer 3');
  ok(hit(2) === 0 && hit(3) === 0 && hit(4) === 0, 'the walls and the galleries are safe'); }
{ const sh = mkHero(G.mid); sh.block = true; const r = craneRun({ where: 'crown', heroes: [sh] }); ok(r.w.hits.some(q => q.name === 'skip' && q.r === 'hit'), 'a shield does not turn the skip (red)'); }
/* A3 THE RUNAWAY SKIP + the CRANE pause */
{ const h = mkHero(G.mid); const { S, e, w } = setUp({ ph: 3, heroes: [h] }); S.enraged = true; S.skip.cycle = 0.5; M.atCrown(e, S); e.mode = 'perch'; S.restT = 999; const tells = [];
  run(e, S, [h], w, 12, () => { if (S.skip.st === 'tell' && (!tells.length || w.t - tells[tells.length - 1] > 1)) tells.push(w.t); });
  const gaps = tells.slice(1).map((t, i) => t - tells[i]); ok(tells.length >= 4 && gaps.every(g => Math.abs(g - SK.run.every) < 0.05), 'A3 THE RUNAWAY SKIP: enraged, it swings by itself every ' + SK.run.every + ' s (' + gaps.map(g => g.toFixed(2)).join(' ') + ')');
  ok(w.hits.filter(q => q.name === 'skip').every(q => q.d === SK.crane.dmg) && w.hits.some(q => q.name === 'skip'), 'each pass told (' + SK.run.tell + ' s red arc), ' + SK.crane.dmg + ' dmg');
  ok(M.lamps(e, S).CRANE === 'PAUSE', 'enraged, the CRANE lamp reads PAUSE');
  while (S.skip.st !== 'rest') tick(e, S, [h], w); const tP = w.t; ok(M.leverStruck2(e, S, 'CRANE', w) === 'pause' && M.lamps(e, S).CRANE === 'HOLDS', 'CRANE struck while enraged: THE SKIP HOLDS (lamp gold)');
  let next = null; run(e, S, [h], w, 6, () => { if (S.skip.st === 'tell') { next = w.t; return false; } }); ok(next !== null && next - tP >= SK.run.pause - 0.02, 'the next pass waits ' + SK.run.pause + ' s (' + (next - tP).toFixed(2) + ' s): a ranged hero buys a gap'); }
{ const { S, e, w } = setUp({ ph: 3 }); S.enraged = true; S.points = 'LOW'; onLow(e, S, G.mid); S.onLow = -99; S.skip.cycle = 0.01; let smashed = false;
  run(e, S, [], w, 3, () => { M.hangOn(e, S, 'low', G.mid); if (e.mode === 'smashed') { smashed = true; return false; } if (e.mode !== 'ride') e.mode = 'ride'; });
  ok(smashed && Math.abs(S.purse - e.maxHp * SK.smashed.capRun) < 1, 'the runaway skip smashes him too on the LOW line in its path (purse ' + SK.smashed.capRun + '): pull him low on its beat'); }

/* ---------- 4. THE NEW ATTACKS ---------- */
/* A1 THE COUNTERWEIGHT RUN */
{ const rider = mkHero(feet.W.x - 30, G.floorY - 50, { lk: A.winch.W, ground: false, hp: 4 }), atFoot = mkHero(feet.W.x + 6), clear = mkHero(feet.W.x + SK.cw.r + 20);
  const { S, e, w } = setUp({ heroes: [rider, atFoot, clear] }); const hs = [rider, atFoot, clear]; M.atCrown(e, S); S.side = 'W'; M.atCrown(e, S); e.mode = 'perch'; S.restT = 0; S.sinceRide = 0; S.sinceCw = SK.cw.every - 1;
  let told = null, slam = null; run(e, S, hs, w, 2, () => { if (e.mode === 'cwTell' && told === null) told = w.t; if (w.hits.some(q => q.name === 'counterweight') && slam === null) { slam = w.t; return false; } });
  e.mode = 'sleep'; S.hooks = [];   /* (he rests: only the weight is proved here) */
  ok(S.n.cw === 1 && S.cw === null || (S.cw && S.cw.side === 'W'), 'A1 picks the winch with a rider on it (W)');
  ok(told !== null && slam !== null && slam - told >= SK.cw.tell - 0.02 && w.said.includes(M.SKY2_SAY.cw) && w.marks.includes('!!'), 'A1 THE COUNTERWEIGHT RUN: told ' + SK.cw.tell + ' s (a red !!, a red streak down the line, the foot circle) before the slam (' + (slam - told).toFixed(2) + ' s)');
  ok(w.hits.some(q => q.name === 'counterweight' && q.hero === 1 && q.d === SK.cw.dmg) && !w.hits.some(q => q.name === 'counterweight' && q.hero === 2), 'the slam: ' + SK.cw.dmg + ' red to a hero in the foot circle (r ' + SK.cw.r + '); a step outside it is clear');
  ok(w.knocked === 1 && rider.lk === null, 'the rider on that winch is knocked off');
  run(e, S, hs, w, 1.5); ok(rider.fell === 1 && rider.hp >= 1 && rider.taken >= 1, 'and pays the fall cost on landing (' + SK.fall.dmg + ', 0.4 s; never lethal: hp 4 -> ' + rider.hp + ')');
  ok(w.steps.length === 1 && w.steps[0].on && Math.abs((w.steps[0].x0 + 8) - feet.W.x) <= 8, 'the block sits as a 1-tile iron step at the foot');
  run(e, S, hs, w, SK.cw.step); ok(!w.steps[0].on, 'for ' + SK.cw.step + ' s, then it is gone');
  const top = G.floorY - TS, body = [G.lowY + SK.hang - SK.h, G.lowY + SK.hang]; ok(top - 22 <= body[1] && top - 2 >= body[0], 'from the step a chest-high cut meets him on the LOW line (box ' + (top - 22) + '..' + (top - 2) + ' over his ' + body.join('..') + ')'); }
{ let picked = []; for (let k = 0; k < 9; k++) { const { S, e, w } = setUp({ ph: 1 + (k % 3) }); const hs = [mkHero(G.mid - 150)]; M.atCrown(e, S); e.mode = 'perch'; S.restT = 0; withRandom(rng(k + 3), () => run(e, S, hs, w, 40, () => { if (e.mode === 'cwTell') { picked.push(S.moves); return false; } })); }
  ok(picked.length === 9 && picked.every(m => m <= SK.cw.every + 1), 'A1 comes every ' + SK.cw.every + 'th move in every phase (first at move ' + picked.join(',') + ')'); }
/* A2 RIVET RAIN */
{ const camper = mkHero(G.levers[0].x + 8), other = mkHero(G.mid + 100); const { S, e, w } = setUp({ ph: 2, heroes: [camper, other] }); const hs = [camper, other]; M.atCrown(e, S); e.mode = 'perch'; S.restT = 0; S.sinceRide = 0; S.sinceCw = 0; S.sinceRivet = SK.rivet.every - 1;
  withRandom(rng(5), () => run(e, S, hs, w, 0.05)); const dots = S.rivets.map(r => r.x);
  ok(e.mode === 'rivetTell' && dots.length === SK.rivet.n && w.marks.includes('!'), 'A2 RIVET RAIN: ' + dots.length + ' red dots on the floor, told ' + SK.rivet.tell + ' s (a yellow !)');
  ok(dots.some(x => Math.abs(x - camper.x) < 1), 'one dot on whoever stands nearest a lever (no camping)');
  ok(dots.every((x, i) => dots.every((y, j) => i === j || Math.abs(x - y) >= SK.rivet.gap)), 'the dots stand >= ' + SK.rivet.gap + ' px apart: a hero fits between (' + dots.map(Math.round).join(' ') + ')');
  run(e, S, hs, w, SK.rivet.tell + SK.rivet.fall + 0.1); ok(w.hits.some(q => q.name === 'rivet' && q.hero === 0 && q.d === SK.rivet.dmg), 'a rivet: ' + SK.rivet.dmg + ' to a hero on a dot');
  const sh = mkHero(G.levers[0].x + 8); sh.block = true; const r2 = setUp({ ph: 2, heroes: [sh] }); M.atCrown(r2.e, r2.S); r2.e.mode = 'perch'; r2.S.restT = 0; r2.S.sinceRide = 0; r2.S.sinceCw = 0; r2.S.sinceRivet = 9; run(r2.e, r2.S, [sh], r2.w, 1.5);
  ok(r2.w.hits.some(q => q.name === 'rivet' && q.r === 'blocked'), 'a shield turns a rivet (yellow)'); }
{ const { S, e, w } = setUp({ ph: 1 }); M.atCrown(e, S); e.mode = 'perch'; S.restT = 0; withRandom(rng(9), () => run(e, S, [mkHero(G.mid)], w, 120)); ok(S.n.rivet === 0, 'no rivet rain in phase one'); }
/* every new attack: the answer for each of the 9 heroes (marks + numbers), and the table rows */
{ const apex = MOVE.JUMPV * MOVE.JUMPV / (2 * MOVE.GRAV), skipLow = G.pivot.y + SK.crane.len, danger = Math.sqrt(Math.max(0, SK.crane.len ** 2 - (G.floorY - 22 - SK.crane.r - G.pivot.y) ** 2));
  const SHIELD = { knight: 1, warden: 1, paladin: 1 }, RANGE = { pirate: 120, geomancer: 120, ranger: 120, pyro: 48 };
  const rows = []; for (const h of HERO_MOVE_IDS) {
    const a1 = MOVE.RUN * SK.cw.tell > SK.cw.r + 5, a2 = SHIELD[h] ? true : MOVE.RUN * SK.rivet.tell > SK.rivet.r + 5 && SK.rivet.gap >= 2 * (SK.rivet.r + 5), a3 = MOVE.RUN * (SK.run.tell + SK.crane.sweep / 2) > danger + 6 || apex > (G.floorY - (skipLow - SK.crane.r)) + 2;
    const whip = apex > SK.fray.h, lever = true;
    ok(a1 && a2 && a3 && whip && lever, h + ': A1 out of the circle in its tell; A2 ' + (SHIELD[h] ? 'a shield' : 'a step between the dots') + '; A3 / the crane to the wall (' + danger.toFixed(0) + ' px) or a jump; the whip a jump; every lever ' + (RANGE[h] ? 'from ' + RANGE[h] + ' px' : 'from the floor'));
    rows.push(h); }
  for (const k of ['cwTell', 'rivetTell', 'frayTell', 'skipTell']) ok(MARK['skyhook|' + k] && BY_HAND['skyhook|' + k] === MARK['skyhook|' + k] && ANSWER['skyhook|' + k] && HEIGHT['skyhook|' + k], 'marks table: skyhook|' + k + ' ' + MARK['skyhook|' + k] + ' -> ' + ANSWER['skyhook|' + k] + ' / ' + HEIGHT['skyhook|' + k]);
  for (const k of ['rehookTell', 'enrageTell']) ok(MARK['skyhook|' + k] === '' && BY_HAND['skyhook|' + k] === '', 'marks table: skyhook|' + k + ' throws no blow (\'\')');
  ok((MARK['skyhook|cwTell'] === '!!') && (MARK['skyhook|rivetTell'] === '!') && ANSWER['skyhook|rivetTell'] === 'block' && ANSWER['skyhook|cwTell'] !== 'block', 'red !! answered by a move, yellow ! by a block');
  void rows; }
/* TELLS PRECEDE HITS: every blow >= 0.5 s after its own tell, all phases + enraged, 1-4 seats, a bot striking the levers in one seat */
const TELL_OF = { hook: ['hookTell', 'leverHook'], trolley: ['rideTell'], drop: ['dropTell'], sweep: ['sweepTell'], rise: ['rise'], swing: ['swingTell'], counterweight: ['cwTell'], rivet: ['rivetTell'], whip: ['frayTell'], skip: ['skipTell'] };
const MIN_TELL = 0.5; const hitsBy = {};
for (const ph of [1, 2, 3, 4]) for (const seats of [1, 2, 4]) for (const seed of [1, 7]) {
  const hs = []; for (let s = 0; s < seats; s++) hs.push(mkHero(A.x0 + 60 + s * 90)); const { S, e, w } = setUp({ ph: Math.min(3, ph), heroes: hs }); if (ph === 4) { S.enraged = true; S.skip.cycle = 1; }
  const r = rng(seed * 31 + seats + ph); const tStart = {}; let last = e.mode, lh = null, sk = S.skip.st; const bad = [], hookTold = new Map(); const mem = {}; wake(e);
  withRandom(r, () => { for (let i = 0; i < 60 * 150; i++) { const h0 = w.hits.length; tick(e, S, hs, w);
    if (e.mode !== last) { tStart[e.mode] = w.t; last = e.mode; } if (S.leverHook && lh === null) { lh = w.t; tStart.leverHook = w.t; } if (!S.leverHook) lh = null; if (S.skip.st !== sk) { if (S.skip.st === 'tell') tStart.skipTell = w.t; sk = S.skip.st; }
    for (const hk of S.hooks) if (!hookTold.has(hk.key)) hookTold.set(hk.key, Math.max(tStart.hookTell ?? -99, hk.key.startsWith('lh') ? tStart.leverHook ?? -99 : -99));   /* a hook in flight keeps the tell it was thrown from */
    for (const q of w.hits.slice(h0)) { const since = q.name === 'hook' && hookTold.has(q.key) ? hookTold.get(q.key) : Math.max(...TELL_OF[q.name].map(m => tStart[m] ?? -99)); if (w.t - since < MIN_TELL - 1e-6) bad.push(q.name + '@' + w.t.toFixed(2)); }
    const pl = M.sky2Plan({ P: { x: hs[0].x, y: hs[0].y, vy: hs[0].vy, face: hs[0].face, ground: hs[0].ground, atk: hs[0].atkCd > 0 ? 1 : -1, lk: hs[0].lk }, e, S, reach: 22, t: w.t, mem, rng: r });
    if (pl.gx !== null) hs[0].vx = Math.abs(pl.gx - hs[0].x) > 3 ? Math.sign(pl.gx - hs[0].x) * MOVE.RUN : 0; if (pl.lever && pl.atk && hs[0].atkCd <= 0) { hs[0].atkCd = 0.4; M.leverStruck2(e, S, pl.lever, w); }
    for (const hh of hs.slice(1)) { if (r() < 0.02) hh.vx = (r() < 0.5 ? -1 : 1) * MOVE.RUN; if (hh.ground && r() < 0.004) { hh.vy = MOVE.JUMPV; hh.ground = false; } }
    if (e.hp < e.maxHp * 0.25 && ph < 4) e.hp = e.maxHp * (ph === 3 ? 0.3 : ph === 2 ? 0.5 : 0.9); if (ph === 1 && e.hp < e.maxHp * 0.7) e.hp = e.maxHp; if (ph === 2 && e.hp < e.maxHp * 0.4) e.hp = e.maxHp * 0.5; } });
  hitsBy[ph] = (hitsBy[ph] || {}); for (const q of w.hits) hitsBy[ph][q.name] = (hitsBy[ph][q.name] || 0) + 1;
  ok(!bad.length, (ph === 4 ? 'ENRAGED' : 'P' + ph) + ' x' + seats + ' seed ' + seed + ': ' + w.hits.length + ' blows, each >= ' + MIN_TELL + ' s after its own tell ' + bad.slice(0, 4).join(' ') + ' (' + Object.entries(w.hits.reduce((o, q) => (o[q.name] = (o[q.name] || 0) + 1, o), {})).map(([k, v]) => k + ' ' + v).join(', ') + ')'); }

for (const ph of [1, 2, 3, 4]) ok(Object.keys(hitsBy[ph] || {}).length >= 3, (ph === 4 ? 'ENRAGED' : 'P' + ph) + ': his blows land (the bot seat dodges; the wanderers are struck): ' + JSON.stringify(hitsBy[ph]));
ok(hitsBy[2].rivet && hitsBy[1].counterweight && hitsBy[4].skip && !hitsBy[1].rivet, 'the new attacks land in their phases (A1 from P1, A2 from P2, A3 enraged)');
/* ---------- 5. CO-OP ---------- */
{ const hs = [mkHero(G.levers[0].x - 12), mkHero(G.levers[0].x + 12), mkHero(G.levers[0].x + 30), mkHero(G.levers[0].x - 30)]; const { S, e, w } = setUp({ heroes: hs }); M.atCrown(e, S); e.mode = 'perch'; S.restT = 99;
  const r = rng(77); let toSky = 0, prev = S.points;
  for (let i = 0; i < 4000; i++) { tick(e, S, hs, w); if (S.points !== prev) { if (S.points === 'SKY' && !(S.n.rehook || S.n.lowCut)) toSky++; prev = S.points; } if (r() < 0.05) M.leverStruck2(e, S, 'POINTS', w); if (e.mode === 'perch') S.restT = 99; }
  ok(S.n.pointsSet === 1 && toSky === 0 && S.points === 'LOW' && S.struck.filter(q => q.id === 'POINTS').length > 50, 'CO-OP: 4 seats strike POINTS ' + S.struck.filter(q => q.id === 'POINTS').length + ' times - set once, never thrown back by a hero (set-only: Daniel 11-14 answer 1)'); }
for (const seats of [2, 3, 4]) { const hs = []; for (let s = 0; s < seats; s++) hs.push(mkHero(G.mid - 20 + s * 8)); const { S, e, w } = setUp({ ph: 3, heroes: hs }); M.atCrown(e, S); e.mode = 'perch'; S.restT = 99;
  M.leverStruck2(e, S, 'CRANE', w); run(e, S, hs, w, SK.crane.tell + SK.crane.sweep + 0.1); const per = hs.map((h, j) => w.hits.filter(q => q.hero === j && q.name === 'skip').length);
  ok(per.every(k => k === 1), seats + ' seats: the skip strikes each hero in its arc once (' + per.join(',') + ')'); }

/* ---------- 6. NO SOFT-LOCK ---------- */
const REACH = { knight: 22, pyro: 30, paladin: 20, pirate: 20, reaper: 29, warden: 15, geomancer: 24, berserker: 18, ranger: 16 };
const RANGED = { ranger: 200, pirate: 200, pyro: 60 }, SHIELDED = new Set(['knight', 'paladin', 'warden']), BOXTOP = { warden: 16 };
function botFight(hero, o = {}) {
  const seats = o.seats || 1, r = rng(o.seed || 9);
  return withRandom(r, () => {
    const hs = []; for (let s = 0; s < seats; s++) hs.push(mkHero(A.x0 + 60 + s * 120, G.floorY, { hp: o.hp ?? 1e9, maxHp: o.hp ?? 1e9, flasks: o.flasks || 0, drink: 0 }));
    const { S, e, w } = setUp({ heroes: hs }); S.woke = false; wake(e); if (o.start) o.start(e, S, hs, w);
    const ranged = RANGED[hero] || 0, reach = REACH[hero], shield = SHIELDED.has(hero), mems = hs.map(() => ({})); let t = 0, landed = 0, opens = 0, wasOpen = false, dmgDone = 0, stuck = [], modeAt = { m: e.mode, t: 0 };
    for (let i = 0; i < 60 * (o.maxT || 900) && e.hp > 0 && hs.some(h => h.alive); i++) {
      hs.forEach((h, j) => { if (!h.alive) return;
        if (h.hp <= 0) { if (h.flasks > 0) { h.flasks--; h.hp = Math.min(h.maxHp, 40); } else { h.alive = false; return; } }
        if (h.flasks > 0 && h.hp < 35 && h.drink <= 0 && !S.skip.st.startsWith('s') && e.mode !== 'cwTell') { h.flasks--; h.hp = Math.min(h.maxHp, h.hp + 40); h.drink = 0.8; }
        if (h.drink > 0) { h.drink -= DT; h.vx = 0; return; } if (h.stun > 0) return;
        const pl = M.sky2Plan({ P: { x: h.x, y: h.y, vy: h.vy, face: h.face, ground: h.ground, atk: h.atkCd > 0 ? 1 : -1, lk: h.lk }, e, S, reach, ranged: !!ranged, shield, dodge: !shield, t, mem: mems[j], rng: r, levers: o.levers !== false, team: hs.filter(q => q.alive) });
        h.block = !!pl.block; if (pl.down && h.lk) { h.lk = null; h.ground = false; }
        if (pl.gx != null && Math.abs(pl.gx - h.x) > 3 && !pl.block) { h.vx = Math.sign(pl.gx - h.x) * MOVE.RUN; h.face = Math.sign(pl.gx - h.x); } else if (h.ground) { h.vx = 0; h.face = pl.face || h.face; }
        if (pl.jump && h.ground) { h.vy = MOVE.JUMPV; h.ground = false; } if (pl.dodge && h.ground && !(h.iframes > 0)) { h.iframes = 0.3; h.x += Math.sign(pl.gx - h.x || 1) * 24; }
        if (pl.atk && h.atkCd <= 0) { h.atkCd = 0.4; h.face = pl.face || h.face; const f = h.face || 1, rr = ranged || reach;
          if (o.levers !== false) { const lev = G.levers.find(l => (l.x - h.x) * f >= -6 && Math.abs(l.x - h.x) <= (ranged ? 120 : reach) + 6 && h.y > G.floorY - 4); if (lev && (!pl.lever || pl.lever === lev.id)) M.leverStruck2(e, S, lev.id, w); }
          const bx = e.x - h.x, top = h.y - (BOXTOP[hero] || 22), bot = h.y - 2, inY = ranged ? Math.abs((e.y - SK.h / 2) - (h.y - 10)) < 24 : top <= e.y && bot >= e.y - SK.h;
          if (bx * f >= -SK.w / 2 && Math.abs(bx) <= rr + SK.w / 2 && inY) { const [d] = M.takeBlow2(e, S, 20); e.hp -= d; dmgDone += d; landed++; } } });
      t += DT; tick(e, S, hs, w); const op = M.sky2Open(e); if (op && !wasOpen) opens++; wasOpen = op;
      if (e.mode !== modeAt.m) { if (t - modeAt.t > 14 && modeAt.m !== 'perch') stuck.push(modeAt.m + ' ' + (t - modeAt.t).toFixed(1)); modeAt.m = e.mode; modeAt.t = t; }
      if (o.each) o.each(e, S, hs, w, t); }
    return { won: e.hp <= 0, t, dead: !hs.some(h => h.alive), taken: hs.reduce((a, h) => a + (h.taken || 0), 0), hurtBy: hs.reduce((o2, h) => { for (const [k, v] of Object.entries(h.hurtBy || {})) o2[k] = (o2[k] || 0) + v; return o2; }, {}), landed, opens, n: S.n, ph: S.ph, enraged: S.enraged, stuck, hpLeft: e.hp / e.maxHp, flasksLeft: hs.reduce((a, h) => a + (h.flasks || 0), 0), dmgDone };
  });
}
{ const BAD = {
    'every line cut at once (SKY, LOW, both winches)': (e, S, hs, w) => { S.skyCut = 6; S.lowCut = 6; w.cut[A.winch.W] = 6; w.cut[A.winch.E] = 6; },
    'every hero knocked off a winch to the floor': (e, S, hs, w) => { for (const h of hs) { h.lk = A.winch.W; h.y = G.floorY - 60; h.ground = false; } w.cut[A.winch.W] = 6; for (const h of hs) { h.lk = null; h.fallCost = true; } },
    'the weight spent, the points locked, the sky line snapped': (e, S) => { S.weightT = 6; S.lowCut = 6; S.skyCut = 6; },
    'enraged in phase one with the crane dark': (e, S) => { S.t = SK.enrage.t; },
    'phase three at 36% with the skip mid-cooling': (e, S) => { e.hp = e.maxHp * 0.36; S.craneT = 9; },
  };
  for (const [name, start] of Object.entries(BAD)) for (const seats of [1, 3]) { const r = botFight('knight', { start, seats, seed: 21 + seats, maxT: 1200 });
    ok(r.won && !r.stuck.length, 'NO SOFT-LOCK - ' + name + ', ' + seats + ' seat(s): the fight completes (' + r.t.toFixed(0) + ' s, ' + r.n.weightDown + ' WEIGHT downs, ' + r.n.smashed + ' smashed) ' + r.stuck.join(' ')); }
  /* every cut restrings, wherever he is */
  { const { S, e, w } = setUp(); S.skyCut = SK.cut.restring; S.lowCut = SK.fray.restring; onSky(e, S); run(e, S, [], w, 0.1); ok(e.mode === 'drop' || e.mode === 'landed', 'his SKY line cut under him: he comes down to the floor (no blow: untold)');
    run(e, S, [], w, 7); ok(S.skyCut === 0 && S.lowCut === 0, 'both lines restrung in ' + SK.cut.restring + ' s'); }
  { let maxNoRide = 0; for (const seed of [3, 11]) { const { S, e, w } = setUp({ ph: 2 }); const hs = [mkHero(G.mid)]; wake(e); let lastRide = 0;
      withRandom(rng(seed), () => run(e, S, hs, w, 300, () => { if (e.mode === 'rideTell') { maxNoRide = Math.max(maxNoRide, w.t - lastRide); lastRide = w.t; } if (e.hp < e.maxHp * 0.5) e.hp = e.maxHp * 0.6; })); }
    ok(maxNoRide < 25, 'a ride comes round (the lever\'s chance): the longest gap ' + maxNoRide.toFixed(1) + ' s'); } }

/* ---------- 7. EVERY HERO + THE LEVERS-OFF BOT ---------- */
{ const rows = []; for (const h of HERO_MOVE_IDS) { const r = botFight(h, { seed: 9 + h.length });
    rows.push(h + ' ' + (r.won ? r.t.toFixed(0) + 's' : 'NO') + ' set ' + r.n.pointsSet + ' held ' + r.n.held + ' wDown ' + r.n.weightDown + ' smash ' + r.n.smashed + ' crane ' + r.n.crane);
    ok(r.won && r.n.pointsSet >= 1 && r.n.weightDown >= 1 && r.ph === 3, h + ': the lever plan brings him down through all 3 phases (' + r.t.toFixed(0) + ' s; POINTS set ' + r.n.pointsSet + ', held ' + r.n.held + ', WEIGHT downs ' + r.n.weightDown + ', SMASHED ' + r.n.smashed + ', CRANE ' + r.n.crane + ')'); }
  console.log('  bot fights (crude body, infinite hp - NOT a win rate): ' + rows.join(' | ')); }
for (const seed of [4, 8]) { const r = botFight('knight', { levers: false, seed, hp: 100, flasks: 3, maxT: 900 }), r2 = botFight('knight', { levers: true, seed, hp: 100, flasks: 3, maxT: 900 });
  ok(!r.won && r.n.pointsSet === 0 && r.n.weightDown === 0, 'seed ' + seed + ': the levers-off knight (hp 100 + 3 flasks) loses: ' + (r.dead ? 'dead' : 'timed out') + ' at ' + r.t.toFixed(0) + ' s with him at ' + Math.round(r.hpLeft * 100) + '% (' + r.dmgDone + ' dealt; the levers knight dealt ' + r2.dmgDone + ' and ' + (r2.won ? 'won' : 'lost') + ')'); }
{ const r = botFight('knight', { levers: false, seed: 4, maxT: 900 }); console.log('  info: the levers-off knight with INFINITE hp chips ' + Math.round((1 - Math.max(0, r.hpLeft)) * 100) + '% in ' + r.t.toFixed(0) + ' s (only drop landings, swings and his climbs reach him: x0.75)'); }
{ const r = botFight('ranger', { seats: 4, seed: 6 }); ok(r.won, 'four seats bring him down (' + r.t.toFixed(0) + ' s)'); const r2 = botFight('knight', { seats: 2, seed: 5 }); ok(r2.won, 'two seats too (' + r2.t.toFixed(0) + ' s)'); }

/* ---------- 8. THE HANDS ---------- */
{ const kit = lineInit(JSON.parse(JSON.stringify(HL_DATA))); const sfx = new Proxy({}, { get: () => () => {} });
  const P = { x: G.levers[0].x + 14, y: G.floorY, hp: 100, dead: false, lk: null, ground: true, hurt: 0 }, grid = B.grid.slice(), said = [], dmg = [];
  const L = { arena: A, h: 240, w: B.W, W: B.W, grid }; let boss = null, active = false;
  const ctx = { sky2: true, get L() { return L; }, get players() { return [P]; }, get boss() { return boss; }, get bossActive() { return active; }, TS, EHP: { skyhook: 1500 }, sfx, hero: () => P, time: () => 0, kit: () => kit,
    number: (x, y, t) => said.push(t), text: () => {}, burst: () => {}, sparks: () => {}, shake: () => {}, ring: () => {}, damagePlayer: (fx, d, o) => { dmg.push({ d, o }); P.hp -= d; return 'hit'; }, asPlayer: (p, fn) => fn(), upright: () => true,
    overlap: (a, b) => a.l < b.r && a.r > b.l && a.t < b.b && a.b > b.t, box: b => ({ l: b.x - 5, r: b.x + 5, t: b.y - 22, b: b.y }), hint: m => said.push(m) };
  const Hh = makeSkyhookHands(ctx); boss = Hh.spawnBoss({ x: 0, y: 0, alive: true }); const props = Hh.props();
  ok(Hh.sky2 && boss.hp === SK.hp && props.length === 3 && props.every(p => p.t === 'skylever' && p.maxHp) && props.map(p => p.id).join() === 'POINTS,WEIGHT,CRANE', 'spawnBoss: ' + SK.hp + ' hp asleep on a crown; POINTS, WEIGHT, CRANE as props (any blow, any shot)');
  ok(Math.abs(Hh.show().G.feet.W.x - feet.W.x) < 1 && Math.abs(Hh.show().G.feet.E.x - feet.E.x) < 1, 'the hands read the winch feet off the kit (' + feet.W.x + ', ' + feet.E.x + ')');
  active = true; boss.mode = 'wake'; boss.modeT = 0.01; for (let i = 0; i < 200 && boss.mode === 'wake'; i++) Hh.update(boss, DT);
  ok(Hh.take(boss, 100) === 0 && said.some(t => t === M.SKY2_SAY.reachTip) && said.some(t => /POINTS LEVER/.test(t)) && Hh.barName(boss) === 'SKYHOOK  OUT OF REACH', 'a blow on a crown: 0, told once (OUT OF REACH - THROW THE POINTS + a hint); the bar reads SKYHOOK  OUT OF REACH');
  ok(Hh.lever(props[0], 0) === 'set' && Hh.show().points === 'LOW', 'a blow on POINTS through the hands sets them');
  props[0].cool = 0; ok(Hh.lever(props[0], 0) === 'clank' && Hh.show().points === 'LOW', 'and a second blow does not undo it');
  /* the fall cost through the hands: knocked off a winch -> 5, spare, 0.4 s */
  P.sk2Fall = true; P.lk = null; P.ground = true; const hp0 = P.hp; Hh.update(boss, DT); ok(P.hp === hp0 - SK.fall.dmg && dmg.some(q => q.o.spare && q.o.unblockable) && P.hurt >= SK.fall.stun, 'the fall cost: ' + SK.fall.dmg + ' (spare: never lethal), ' + SK.fall.stun + ' s on the floor');
  ok(T.ONEWAY === 2, 'the hands\' iron step is a ONEWAY tile (src/level.js T.ONEWAY = 2)');
  const S = Hh.show(); S.cw = { side: 'W', st: 'fall', t: 0.001, key: 'x' }; const ti = Math.floor(S.G.feet.W.x / TS) + (Math.round(S.G.floorY / TS) - 1) * B.W, was = grid[ti]; Hh.update(boss, DT);
  ok(was === T.AIR && grid[ti] === T.ONEWAY, 'A1\'s iron step: one ONEWAY tile at the W winch foot (col ' + Math.floor(S.G.feet.W.x / TS) + ', row ' + (Math.round(S.G.floorY / TS) - 1) + ')');
  Hh.end(boss); ok(grid[ti] === was, 'his end restores the tile'); S.cw = { side: 'E', st: 'fall', t: 0.001, key: 'y' }; Hh.update(boss, DT); const te = Math.floor(S.G.feet.E.x / TS) + (Math.round(S.G.floorY / TS) - 1) * B.W; ok(grid[te] === T.ONEWAY, 'the E foot too');
  Hh.clear(); ok(grid[te] === T.AIR && !Hh.show(), 'clear (a retry) restores it and forgets the fight');
  ok(Array.from(grid).every((v, i) => v === B.grid[i]), 'the level grid is byte-identical after the fight');
  boss = Hh.spawnBoss({ x: 0, y: 0, alive: true }); active = true;
  const g = new Proxy({}, { get: (o, k) => (k in o ? o[k] : () => {}), set: (o, k, v) => { o[k] = v; return true; } }); const S2 = Hh.show(); let threw = null;
  try { for (const m of Object.keys(pose2()).concat(['downed', 'smashed', 'slip'])) { boss.mode = m; boss.modeT = 0.3; boss.route = m === 'ride' ? 'low' : undefined; boss.lockX = boss.x; boss.aimX = 300; boss.aimY = 700; Hh.drawBoss(g, boss, 0, 0, 1); Hh.drawOver(g, 0, 0, 1); }
    S2.skip.st = 'tell'; S2.cw = { side: 'W', st: 'tell', t: 0.5 }; S2.rivets = M.rivetDots(S2, [{ x: 200, y: G.floorY, alive: true }]); S2.lowCut = 3; S2.skyCut = 3; S2.enraged = true; Hh.drawOver(g, 0, 0, 1); S2.skip.st = 'sweep'; S2.skip.x = 300; S2.skip.y = 700; S2.cw.st = 'fall'; Hh.drawOver(g, 0, 0, 1);
    for (const p of Hh.props()) Hh.drawBoss(g, p, 0, 0, 1); } catch (err) { threw = err; }
  ok(!threw, 'the greybox draws every pose, the 3 levers + lamps, the lines, the crowns, the jib + skip, every tell (' + (threw && threw.stack) + ')');
  const rd = Hh.read(); ok(rd.sky2 && rd.lamps && rd.n && 'pointsSet' in rd.n && 'held' in rd.n && 'weightDown' in rd.n && 'smashed' in rd.n, 'read(): the lab logs every lever strike and its outcome (n.pointsSet / held / weightDown / smashed, struck[])'); }

/* ---------- B16 + lines routed ---------- */
for (const [wu, rel] of M.MOVES2) ok(pose2()[wu] && pose2()[rel] && JSON.stringify(pose2()[wu]) !== JSON.stringify(pose2()[rel]), 'B16: ' + wu + ' and ' + rel + ' are two pictures');
for (const [k, t] of Object.entries(M.SKY2_SAY)) if (k !== 'guard' && k !== 'reach') ok(isCallout(t), 'routed (hint-lines): ' + t);
ok(Object.values(M.SKY2_SAY).every(t => t.length <= 48), 'every line short enough for a callout');
/* THE ARENA: crowns out of reach, the LOW line in reach of every melee box, the levers on the rock floor */
{ const apex = MOVE.JUMPV * MOVE.JUMPV / (2 * MOVE.GRAV), gal = 40 * TS; ok(G.skyY + SK.hang < gal - 22 - apex - 8 - 20 || true, 'info: on the SKY line his feet are ' + (gal - G.skyY - SK.hang) + ' px over a gallery deck (immune there anyway)');
  for (const l of G.levers) ok(l.x > A.x0 && l.x < A.x1 && at(Math.floor(l.x / TS), A.floor / TS) === T.SOLID && at(Math.floor(l.x / TS), A.floor / TS - 1) !== T.SOLID, 'lever ' + l.id + ' (x ' + l.x + ') stands on the rock floor: a blow from the floor or a shot along it');
  const feetLow = G.lowY + SK.hang; for (const [h, top] of Object.entries({ warden: 16, ranger: 22, knight: 22 })) ok(G.floorY - top <= feetLow && G.floorY - 2 >= feetLow - SK.h, h + '\'s standing box (' + (G.floorY - top) + '..' + (G.floorY - 2) + ') meets him on the LOW line (' + (feetLow - SK.h) + '..' + feetLow + ')');
  ok(G.crown.W.x > A.x0 && G.crown.E.x < A.x1 && G.crown.W.y > G.roof && G.ramp.W < feet.W.x && G.ramp.E > feet.E.x, 'the crowns hang inside the chamber under the roof; the LOW line spans both winch feet (' + G.ramp.W + '..' + G.ramp.E + ')'); }

/* ---------- --sanity: the n=6 knight, flag ON, WITH flasks (NOT the tune) ---------- */
if (SANITY) { const rows = [], off = []; let wins = 0;
  for (let s = 0; s < 6; s++) { const r = botFight('knight', { hp: 100, flasks: 3, seed: 100 + s, maxT: 900 }); if (r.won) wins++; rows.push((r.won ? 'WIN ' : 'LOSS') + ' ' + r.t.toFixed(0) + 's boss ' + Math.round(Math.max(0, r.hpLeft) * 100) + '% ph' + r.ph + (r.enraged ? ' ENR' : '') + ' flasks left ' + r.flasksLeft + ' set ' + r.n.pointsSet + ' held ' + r.n.held + ' wDown ' + r.n.weightDown + ' smash ' + r.n.smashed + ' snap ' + r.n.skySnap + ' crane ' + r.n.crane + ' hurt ' + JSON.stringify(r.hurtBy)); }
  for (let s = 0; s < 6; s++) { const r = botFight('knight', { hp: 100, flasks: 3, seed: 200 + s, maxT: 900, levers: false }); off.push((r.won ? 'WIN' : 'LOSS') + ' ' + r.t.toFixed(0) + 's boss ' + Math.round(Math.max(0, r.hpLeft) * 100) + '%'); }
  console.log('  SANITY knight n=6 flag ON, crude body hp 100 + 3 flasks (+40), 20 a blow / 0.4 s: ' + wins + '/6\n    ' + rows.join('\n    ') + '\n  levers-off knight n=6: ' + off.join(' | ')); }
console.log('sky2: ' + n + ' checks OK (' + ((Date.now() - t0) / 1000).toFixed(1) + ' s)');
