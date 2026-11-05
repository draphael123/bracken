// tools/colossus4.mjs - THE GLASS SEA + COLOSSUS 4 (claude/colossus4), Node only: no page, no port, no Chrome.
//   node tools/colossus4.mjs                 the checks (flag OFF = master, flag ON = the rework), then a short bot sim (n=6 a side)
//   node tools/colossus4.mjs --sim=12        the NODE BOT SIM only, n seeds per side (OFF vs ON), for a tune lane's quick read
//   node tools/colossus4.mjs --sim=6 --hp=300 --dmg=18 --flasks=3
// The sim is a FLOW SIM, not the rate: one point-hero with the knight's run/jump (92 px/s, 320 up, g 1000) on the arena's real holds, driven by the same
// colPlan the lab's bossLab uses (a quarter-second late, misreads one in eight). It proves every opening is reached with base movement and shows the
// rework's pace against master's on the same bot. THE RATE is bossLab's: BRACKEN_COL4=1 PORT=<port> node tools/boss-rates.mjs glasssea --seeds=6 (browser owed).
import assert from 'node:assert/strict';
import { install } from './node-canvas.mjs'; install();
import { LEVELS, T } from '../src/level.js';
import * as CG from '../src/glass-colossus.js';
import * as BP from '../src/beam-path.js';
import { STAGE4, COL4, LIGHT4, COL4_SHIPS } from '../src/colossus4.js';
import { lintSunRooms } from '../src/sun-puzzle.js';
import { makeOpaque } from '../src/light.js';
import { isSlope } from '../src/slopes.js';
const args = process.argv.slice(2), opt = (k, d) => { const a = args.find(x => x.startsWith('--' + k + '=')); return a ? a.slice(k.length + 3) : d; };
const TS = 16; let n = 0; const ok = (c, m) => { assert.ok(c, m); n++; };
const build = on => { if (on) process.env.BRACKEN_COL4 = '1'; else delete process.env.BRACKEN_COL4; return LEVELS.find(l => l.id === 'glasssea').build(); };

function checks() {
  /* ---------- THE FLAG ---------- */
  ok(COL4_SHIPS === false, 'COL4_SHIPS is false on the branch: master unchanged until Daniel flips it (art before live)');
  const off = build(false), A0 = off.arena;
  ok(off.W === 672 && A0.x1 - A0.x0 === 64 * TS && !off.col4 && !off.sunRooms && !off.hasCryst && CG.COL.w === 72 && CG.COL.h === 200 && CG.COLOSSUS_STAGE.W === 64 && !CG.COLOSSUS_STAGE.thigh,
    'flag OFF: the 672-wide level, the 64-wide arena, the 72x200 giant, no sun rooms or panes (master)');
  ok(off.ents.filter(e => e.t === 'check').length === 5, 'flag OFF: five checkpoints (master)');
  const on = build(true), A = on.arena;
  ok(on.W === 688 && A.x1 - A.x0 === 80 * TS && on.col4 && A.colossus.c4, 'flag ON: the arena is 80 wide (x1.6 needs room for his reach and four flank mirrors)');
  ok(on.ents.filter(e => e.t === 'check').length === 4, 'flag ON: one checkpoint fewer (Salt & Sanctuary death cost)');
  const offAgain = build(false); ok(offAgain.W === 672 && CG.COL.w === 72 && CG.COL.walkV === 54 && CG.COLOSSUS_STAGE.W === 64, 'flipping the flag back restores every number (no leak between the two)');
  build(true);
  /* ---------- x1.6 ---------- */
  ok(Math.abs(CG.COL.w / 72 - 1.6) < 0.01 && CG.COL.h / 200 === 1.6, 'he is x1.6 (' + CG.COL.w + ' x ' + CG.COL.h + ')');
  const G = CG.geom(A, TS);
  for (const s of [-1, 1]) { const lad = [...G.knee, ...G.hip, ...G.shoulder].filter(l => (s < 0 ? l.r <= G.cx + 1 : l.l >= G.cx - 1)).sort((a, b) => b.y - a.y);
    ok(lad.length === 5 && G.floor - lad[0].y === 3 * TS, (s < 0 ? 'west' : 'east') + ': five rows of holds, the first 3 rows off the floor');
    for (let i = 1; i < lad.length; i++) { const up = lad[i - 1].y - lad[i].y, ov = Math.min(lad[i - 1].r, lad[i].r) - Math.max(lad[i - 1].l, lad[i].l);
      ok(up === 3 * TS && ov >= 32, (s < 0 ? 'west' : 'east') + ' row ' + i + ': a plain 3-row jump straight up (every hero: JUMP_UP 3) with ' + ov + ' px to stand under it'); } }
  ok(G.crownY === G.floor - 19 * TS && G.hipY === G.floor - 9 * TS && G.shoulderY === G.floor - 12 * TS, 'the crown 19 rows up, the chest opening at the hip row (9), the top at the shoulder row (12)');
  ok(CG.zoneOf(G, G.floor) === 'legs' && CG.zoneOf(G, G.floor - 3 * TS) === 'legs' && CG.zoneOf(G, G.floor - 6 * TS) === 'chest' && CG.zoneOf(G, G.hipY) === 'chest' && CG.zoneOf(G, G.shoulderY) === 'top', 'the zones follow the size: floor + knee = legs, thigh + hip = chest, shoulder + collar = top');
  { const S = CG.newFight(G); for (const st of [0, 1, 2]) { CG.seat(G, Math.round(G.stations[st] / TS)); const cells = CG.holdCells(G), mc = S.mirrors.map(m => Math.floor(m.x / TS));
      ok(cells.every(([x]) => mc.every(c => Math.abs(c - x) >= 2) && x > A.wallL && x < A.wallR), 'station ' + st + ': no hold over a mirror (2+ columns clear) or past a wall'); }
    CG.seat(G, Math.round(G.stations[1] / TS)); }
  ok(on.machineCells.length === CG.holdCells(G).length, 'his hold cells are machine cells (no pedestals): ' + on.machineCells.length);
  /* ---------- THE LIGHT (the drawn path; the instant; he comes to it) ---------- */
  const W = (o = {}) => ({ hit: () => false, number: (x, y, t) => { (o.said || []).push(t); }, sound() {}, shake() {}, fx: (k) => { if (o.fxs) o.fxs.push(k); }, music() {}, held: () => false, slap() {}, reseat() {} });
  const mk = (ph) => { const G2 = CG.geom(A, TS), S = CG.newFight(G2), e = { x: G2.cx, y: G2.floor, w: CG.COL.w, h: CG.COL.h, hp: 680, maxHp: 680, mode: 'idle', modeT: 0, open: 0, face: -1, phase: ph };
    S.ph = ph; S.cd = 9; e.hp = ph === 1 ? 680 : ph === 2 ? 680 * 0.5 : 680 * 0.2; for (const m of S.mirrors) m.notch = 'face'; return { S, e, G: G2 }; };
  const hero = (x, G2) => [{ x, y: G2.floor, ground: true, alive: true, pp: { id: 1 } }];
  { const { S } = mk(2); for (const m of S.mirrors) m.notch = 'fire'; const L2 = CG.c4Lights(S);
    ok(L2.length === 4 && L2.every(l => l.st >= 0 && l.kind === 'fire') && L2.map(l => l.st).join() === '0,1,1,2', 'P2: every mirror TO THE FIRE throws its brazier inward onto a station (10->20, 30->40, 50->40, 70->60)');
    ok(L2.filter(l => l.on).length === 2 && L2.every(l => BP.path(l.pts).len > 100), 'P2: the two on his station are ON him; each path is drawn brazier -> mirror -> landing'); }
  { const { S } = mk(3); for (const m of S.mirrors) m.notch = 'sky'; const L3 = CG.c4Lights(S);
    ok(L3[0].wall && L3.slice(1).map(l => l.st).join() === '0,1,2', 'P3: the dawn (east) goes WEST: 30->20, 50->40, 70->60, and 10 falls on the wall (said so)');
    ok(L3.every(l => l.pts[0][1] < l.pts[1][1] && l.pts[0][0] > l.pts[1][0]), 'P3: the sun rays are parallel, from above-east - never through his body to a far mirror'); }
  { /* THE INSTANT: a dawn mirror lined up on him burns him the SAME frame, cutting a tell */
    const { S, e, G: G2 } = mk(3), said = [], fx = []; e.mode = 'gazeTell'; e.modeT = 0.8; S.gaze = { dir: -1, x: G2.x1 - 6, id: 1, live: false, caught: -1 }; S.mirrors[2].notch = 'sky';
    CG.stepColossus(e, S, 1 / 60, hero(G2.cx - 200, G2), W({ said, fxs: fx }));
    ok(e.mode === 'dazzled' && S.n.burn === 1 && said.includes(LIGHT4.burnWord) && fx.includes('burn') && S.gaze === null, 'P3: THE DAWN BURNS HIM the frame the light lands (a gaze tell cut; flash + shatter + the words)'); }
  { const { S, e, G: G2 } = mk(2), said = []; e.mode = 'crackTell'; e.modeT = 1; S.crack = { dir: -1, from: G2.cx - 40, to: G2.cx - 200, id: 1, front: null }; S.mirrors[1].notch = 'fire';
    CG.stepColossus(e, S, 1 / 60, hero(G2.cx - 200, G2), W({ said }));
    ok(e.mode === 'blazing' && said.includes(LIGHT4.fireWord) && S.crack === null, 'P2: THE FIRE BURNS HIM the frame it lands on his crack (no waiting for the crack line)'); }
  { /* HE COMES TO THE LIGHT: lined up on another station -> his next move is the walk there; he burns on arrival */
    const { S, e, G: G2 } = mk(3); S.mirrors[3].notch = 'sky'; S.cd = 0.2; let tt = 0, walked = false; const h = hero(G2.cx - 220, G2);
    while (tt < 12 && e.mode !== 'dazzled') { CG.stepColossus(e, S, 1 / 60, h, W()); tt += 1 / 60; if (e.mode === 'walk' || e.mode === 'walkTell') walked = true; }
    const need = 0.2 + CG.COL.walkTell + (G2.stations[2] - G2.stations[1]) / CG.COL.walkV + 0.1;
    ok(walked && e.mode === 'dazzled' && S.st === 2 && tt <= need + 0.05, 'P3: the dawn on station 60 - HE COMES TO THE LIGHT: walks there next and burns on arrival (' + tt.toFixed(2) + ' s, the walk itself is ' + need.toFixed(2) + ' s)'); }
  { /* the ward after knocks EVERY light still on him (two fires land on the middle station) */
    const { S, e, G: G2 } = mk(2); S.mirrors[1].notch = 'fire'; S.mirrors[2].notch = 'fire'; CG.stepColossus(e, S, 1 / 60, hero(G2.cx - 200, G2), W());
    ok(e.mode === 'blazing', 'two fires on him: open'); let tt = 0; while (tt < 12 && !(S.ward <= 0 && S.lock > 0)) { CG.stepColossus(e, S, 1 / 60, hero(G2.cx - 200, G2), W()); tt += 1 / 60; }
    ok(S.mirrors[1].notch === 'face' && S.mirrors[2].notch === 'face' && e.mode !== 'blazing', 'after the ward BOTH fire mirrors are knocked round: each opening wants a fresh TURN (no chain-lock)');
    S.mirrors[1].notch = 'fire'; CG.stepColossus(e, S, 1 / 60, hero(G2.cx - 200, G2), W()); ok(e.mode !== 'blazing', 'B12: no burn inside the lockout after the ward'); }
  { /* P1: a facing mirror on your side -> HIS LANCE COMES NEXT (once in C4_LANCE_GAP) */
    const { S, e, G: G2 } = mk(1); for (const m of S.mirrors) m.notch = 'sky'; S.mirrors[1].notch = 'face'; S.i = CG.COL.chain[1].indexOf('stomp'); S.cd = 0.01; S.t = 50;
    CG.stepColossus(e, S, 1 / 60, hero(G2.cx - 250, G2), W()); ok(e.mode === 'lanceTell' && S.lance.end.mirror === 1, 'P1: a mirror FACING him on your side - his LANCE comes next (it was the stomp\'s turn)');
    const S2 = mk(1); for (const m of S2.S.mirrors) m.notch = 'sky'; S2.S.i = CG.COL.chain[1].indexOf('stomp'); S2.S.cd = 0.01; S2.S.t = 50;
    CG.stepColossus(S2.e, S2.S, 1 / 60, hero(S2.G.cx - 250, S2.G), W()); ok(S2.e.mode === 'stompTell', 'P1: no facing mirror - the chain as it was (the stomp)'); }
  { /* B15 resist floor: never invulnerable outside the openings (the told ward after one is the house B3 ward) */
    const { S, e, G: G2 } = mk(1); S.legPurse = 0; const o = {}; const d = CG.takeBlow(e, S, 20, G2.floor, false, o);
    ok(Math.abs(d - 20 * COL4.floor) < 1e-9 && /GLAZED/.test(o.word), 'a spent knee still takes 0.4x with the word (was 0: B15)');
    const o2 = {}; const d2 = CG.takeBlow(e, S, 20, G2.hipY, false, o2); ok(Math.abs(d2 - 8) < 1e-9 && /SHUT/.test(o2.word), 'a shut chest takes 0.4x with the word');
    e.mode = 'dazzled'; e.open = 3; const o3 = {}; ok(Math.abs(CG.takeBlow(e, S, 20, G2.hipY, false, o3) - 8) < 1e-9 && /HIGHER/.test(o3.word), 'the wrong zone in an opening: 0.4x and HIGHER');
    const o4 = {}; ok(CG.takeBlow(e, S, 20, G2.shoulderY, false, o4) === 20 * CG.COL.openMul, 'the opening pays openMul (x' + CG.COL.openMul + ')');
    S.ward = 1; e.mode = 'idle'; ok(CG.takeBlow(e, S, 20, G2.hipY, false, {}) === 0, 'the told ward after an opening is the only wall (B3)'); }
  /* ---------- THE BOT reaches every opening with base movement (the sim below runs it end to end) ---------- */
  /* ---------- THE LEVEL ---------- */
  const at = (x, y) => (x < 0 || y < 0 || x >= on.W || y >= on.H ? T.SOLID : on.grid[y * on.W + x]);
  ok(on.grid.filter(t => t === T.CRYST).length === 15 && on.hasCryst, 'THE SHATTER-PANES: six crystal panes (15 cells) down the skull\'s chasm');
  ok(!on.ents.some(e => e.x >= 382 && e.x <= 413 && !['sign', 'gscrack', 'gsheap', 'stray', 'silver', 'coin'].includes(e.t)), 'no foe inside the panes section (382-413)');
  ok(on.cracks.some(c => c.id === 'skullPanes' && !c.soft && c.y === 34), 'a fall off the panes is THE CRACK (a blow, back to the crown), never a death');
  const lint = lintSunRooms(on, at, makeOpaque(T, isSlope)); ok(lint.length === 0, 'THE GLYPH COURT lints clean (lamp + an optional priest cache beamable from footing): ' + lint.join('; '));
  ok(on.sunRooms[0].doors.some(d => d.kind === 'cache' && d.optional) && !on.sunRooms[0].doors.some(d => d.kind === 'sun'), 'the glyph court locks nothing: a lamp (the Temple find) + one optional PRIEST CACHE (Q5)');
  ok(on.templeSpur && on.templeSpur.node === 'suntemple' && on.templeSpur.find[0] < 334, 'the SUN TEMPLE find is on the main road before the sunset (Q6: can\'t miss)');
  ok(on.ents.some(e => e.t === 'silver' && e.x === 302 && e.y === 35) && at(302, 34) === T.SOLID && at(302, 35) === T.AIR, 'the cache: a silver under a sun-seal in the floor (solid until his light opens it)');
  console.log('ok  colossus4  ' + n + ' checks: the flag both ways, x1.6, the light (drawn, instant, he comes to it), the ward, the lance, the floor, the level');
}

/* ================= THE NODE BOT SIM ================= */
function rng(seed) { let s = seed >>> 0; return () => { s = (Math.imul(s, 1664525) + 1013904223) >>> 0; return s / 4294967296; }; }
function fight(onFlag, seed, o) {
  const Lv = build(onFlag), A = Lv.arena, G = CG.geom(A, TS), S = CG.newFight(G), r = rng(seed * 7919 + (onFlag ? 1 : 0));
  const e = { x: G.cx, y: G.floor, w: CG.COL.w, h: CG.COL.h, hp: 680, maxHp: 680, mode: 'wake', modeT: 1.6, open: 0, face: -1, phase: 1 }; S.legPurse = e.maxHp * CG.COL.legPurse[0];
  const P = { x: G.x0 + 6 * TS, y: G.floor, vx: 0, vy: 0, ground: true, face: 1, atk: -1, hp: o.hp, flasks: o.flasks, grip: false, block: false, id: 1, hurtT: 0 }, mem = {};
  const RUN = 92, JV = 320, GR = 1000, DT = 1 / 60, ledges = () => [...G.knee, ...G.hip, ...G.shoulder];
  const taken = {}, opens = { cracked: 0, blazing: 0, dazzled: 0 }; let t = 0, talkF = -99, wasOpen = false, jumpHold = 0;
  const box = () => ({ l: P.x - 6, r: P.x + 6, t: P.y - 24, b: P.y });
  const c = { number() {}, sound() {}, shake() {}, fx() {}, music() {}, slap() {}, spear() {},
    hit: (bx, d, name, ob = {}) => { const b = box(); if (bx[1] < b.l || bx[0] > b.r || bx[3] < b.t || bx[2] > b.b) return false; const k = 'k' + (ob.key || name); if (mem[k]) return false; mem[k] = 1; if (P.block && ob.blockable) return false; P.hp -= d; taken[name] = (taken[name] || 0) + d; return true; },
    held: () => CG.relaying(S), surface: () => G.floor,
    throwOff: (h, dir) => { P.hp -= CG.COL.shakeDmg; taken['THE SHAKE'] = (taken['THE SHAKE'] || 0) + CG.COL.shakeDmg; P.vx = dir * 170; P.vy = -120; P.ground = false; P.drop = 0.45; },
    push: (h, vx, dt) => { P.x = Math.max(G.x0 + 10, Math.min(G.x1 - 10, P.x + vx * dt)); },
    reseat: (old, nw, d) => { if (P.ground && P.y < G.floor - 4) P.x += d * TS; } };
  while (t < o.secs && e.hp > 0 && P.hp > 0) {
    const pl = CG.colPlan({ P: { x: P.x, y: P.y, face: P.face, ground: P.ground, atk: P.atk, vy: P.vy }, e, S, reach: 30, shield: false, rng: r, mem, t });
    if (o.debug && CG.colOpen(e) && Math.round(t * 60) % 20 === 0) console.log(t.toFixed(1), e.mode, Math.round(P.x - G.cx), Math.round(G.floor - P.y), P.ground, pl.why, pl.gx && Math.round(pl.gx - G.cx), pl.jump, pl.atk);
    P.block = !!pl.block; P.grip = !!pl.grip;
    if (P.hp < o.hp * 0.35 && P.flasks > 0 && e.mode !== 'lance') { P.flasks--; P.hp = Math.min(o.hp, P.hp + o.hp * 0.4); }
    let vx = 0; if (!pl.block && !pl.grip && pl.gx != null && Math.abs(pl.gx - P.x) > 1) vx = Math.sign(pl.gx - P.x) * Math.min(RUN, Math.abs(pl.gx - P.x) * 60);
    if (pl.face) P.face = pl.face;
    if (pl.jump && P.ground) { P.vy = -JV; P.ground = false; jumpHold = 0.2; }
    if (P.drop > 0) { P.drop -= DT; vx = P.vx; } else P.vx = vx;
    if (pl.talk && t - talkF > 0.2) { talkF = t; const m = S.mirrors.find(q => Math.abs(q.x - P.x) <= 22 && Math.abs(G.floor - P.y) <= 20); if (m && CG.colOpen(e) === false) CG.turnMirror(S, m.i); else if (m) CG.turnMirror(S, m.i); }
    P.atk = P.atk >= 0 ? (P.atk - DT <= 0 ? -1 : P.atk - DT) : -1;
    if (pl.atk && P.atk < 0) { P.atk = 0.4; const reach = CG.COL.w / 2 + 30; if (Math.abs(e.x - P.x) < reach && P.y > G.floor - CG.COL.h) { const d = CG.takeBlow(e, S, o.dmg, P.y, false, {}); e.hp -= d; } }
    /* move: x, then gravity onto the floor or a one-way hold from above */
    P.x = Math.max(G.x0 + 8, Math.min(G.x1 - 8, P.x + vx * DT)); const y0 = P.y; P.vy += GR * DT; P.y += P.vy * DT; P.ground = false;
    if (P.y >= G.floor) { P.y = G.floor; P.vy = 0; P.ground = true; }
    else if (P.vy > 0) for (const l of ledges()) if (y0 <= l.y + 0.01 && P.y >= l.y && P.x >= l.l - 4 && P.x <= l.r + 4) { P.y = l.y; P.vy = 0; P.ground = true; break; }
    const hs = [{ x: P.x, y: P.y, ground: P.ground, alive: P.hp > 0, grip: P.grip, pp: P }];
    CG.stepColossus(e, S, DT, hs, c); if (CG.colOpen(e) && !wasOpen) opens[e.mode]++; wasOpen = CG.colOpen(e);
    for (const k of Object.keys(mem)) if (k[0] === 'k' && Object.keys(mem).length > 400) delete mem[k];
    t += DT;
  }
  return { win: e.hp <= 0, t: +t.toFixed(1), hp: Math.max(0, Math.round(P.hp)), flasks: P.flasks, opens, burns: S.n.burn || 0, ph: S.ph, taken, floorDmg: Math.round(S.n.floorDmg || 0) };
}
function sim(N, o) {
  for (const flag of [false, true]) {
    const rows = []; for (let s = 1; s <= N; s++) rows.push(fight(flag, s, o));
    const w = rows.filter(x => x.win).length, avgT = rows.reduce((a, x) => a + x.t, 0) / N, op = k => rows.reduce((a, x) => a + x.opens[k], 0);
    console.log((flag ? 'C4 ON ' : 'MASTER') + '  wins ' + w + '/' + N + '  avg ' + avgT.toFixed(0) + ' s  opens cracked/blazing/dazzled ' + op('cracked') + '/' + op('blazing') + '/' + op('dazzled') + (flag ? '  burns ' + rows.reduce((a, x) => a + x.burns, 0) + '  floor dmg ' + rows.reduce((a, x) => a + x.floorDmg, 0) : '') + '  reached P' + Math.max(...rows.map(x => x.ph)));
    for (const x of rows) console.log('   ' + (x.win ? 'WIN ' : 'loss') + ' ' + x.t + 's hp ' + x.hp + ' flasks ' + x.flasks + ' P' + x.ph + ' opens ' + JSON.stringify(x.opens) + ' top hits ' + Object.entries(x.taken).sort((a, b) => b[1] - a[1]).slice(0, 3).map(([k, v]) => k + ' ' + Math.round(v)).join(', '));
  }
  build(false);
}
const simN = +opt("sim", 0), so = { debug: args.includes("--debug"), hp: +opt('hp', 300), dmg: +opt('dmg', 18), flasks: +opt('flasks', 3), secs: +opt('secs', 300) };
if (!simN) { checks(); sim(6, so); } else sim(simN, so);
