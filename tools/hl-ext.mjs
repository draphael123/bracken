/* tools/hl-ext.mjs - THE HIGH LINES EXTENSION (flag HL_EXT: the ore line band + the cave apron + THE DRUM HALL), proven in NODE (no page, no browser). claude/hlext1 + claude/hlext2, 11-14.
   src/highlines-ext.js (shiftRows + the additions), src/highlines.js (the flag, default OFF, ?hlext=1). Plan: scratch/lane-reports/hlcart-plan.md lane 1.
     node tools/hl-ext.mjs [--full]     runs BOTH halves, one process after the other (src/highlines.js reads the flag when it is imported):
     FLAG OFF (this process)   the live level is BYTE-IDENTICAL to master 668af984f: HL_DATA / rule / sections hash, the built grid + ents + movers + every field of the build (full hash) and the
                               level-quality hash the stamped pilot / curve / mash rows are keyed to (b165e11737da); the default is off and the flag only turns on by the test door; the extension data is a copy
                               (building it never touched HL_DATA); then tools/highlines.mjs (the existing High Lines proofs) as is
     FLAG ON  (a child: --on)  globalThis.__HLEXT (HL_EXT implies the switch rule: the hall's route board is a lever; claude/hlext2 added THE DRUM HALL: 48 rows, the gondola group moved down, three-state lever JB, ceiling rail + 3 branches, 2 hanging catwalks, 4 foes, a shrine, a silver; the proofs in tools/highlines.mjs section 9): the level is 80 x 324, the data are the base data shifted (shiftRows: every row of every landing, net, line, anchor, weight, wind box, lee box, shrine,
                               silver, ent and grid cell moved by its cut's rows and nothing else - the rope-to-deck relations all kept; rows above the apron, i.e. the cave mouth and SKYHOOK's arena, did not move),
                               the additions (ore line: 3 stations + 3 provisional legs + 1 crossbowman; apron: foot + 4 long steps, told rockfall, 1 gale harpy) are where the plan says, every ore leg rises 8-10
                               rows and is held at both ends, every apron step is a jump the whole hero set makes, nothing sits over a shrine ledge, three shrines (no new one), two silvers; then tools/highlines.mjs
                               --ext: the SAME proofs on the extended level (lint, grid, bands, every drop lands on something, the sweep for the hero move set from every checkpoint to the exit: no soft-lock,
                               no stuck state, both silvers, every new landing reached)
   --full: the sweeps run every hero and 1-4 seats (about 2 min each way); default is the quick sweep (the knight x1). */
import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
const { install } = await import('./node-canvas.mjs'); install();
let n = 0; const ok = (c, m) => { assert.ok(c, m); n++; };
const FULL = process.argv.includes('--full'), ON = process.argv.includes('--on');
const sha = o => createHash('sha1').update(JSON.stringify(o, (k, v) => (v instanceof Uint8Array ? Array.from(v) : v))).digest('hex').slice(0, 12);
const HL = await import('../src/highlines.js'), EX = await import('../src/highlines-ext.js');
const { LEVELS, T } = await import('../src/level.js');
const { TS, lintLines, lineInit } = await import('../src/line-kit.js');
const { MOVE, HERO_MOVE_IDS, heroRunMul } = await import('../src/hero-move.js');
const lv = LEVELS.find(l => l.id === 'highlines');
const run = (file, args, env) => { const r = spawnSync(process.execPath, [fileURLToPath(new URL(file, import.meta.url)), ...args], { encoding: 'utf8', env: { ...process.env, ...env } }); return r; };

/* what master 668af984f builds (recorded 11-14): the data, the rule + sections, the whole build, and the level-quality hash */
const OFF = { data: '25fd0ada9ec0', meta: '0c5ee7abc944', full: 'c74165de9c28', quality: 'b165e11737da' };
const qhash = L => createHash('sha1').update(JSON.stringify([L.W, L.H, Array.from(L.grid), L.ents.filter(e => !e.stuck && e.t !== 'lostbanner'), L.moversExtra || null, L.ambushes || null], (k, v) => (k === 'stand' ? undefined : v))).digest('hex').slice(0, 12);

if (!ON) {
  /* ---------- FLAG OFF: byte-identical ---------- */
  ok(HL.HL_EXT_DEFAULT === false && HL.HL_EXT === false, 'HL_EXT is off by default (and nothing in this process turned it on)');
  ok(sha(HL.HL_DATA) === OFF.data, 'HL_DATA is byte-identical to master (the extension copy never touched it): ' + sha(HL.HL_DATA));
  ok(sha([HL.RULE, HL.SECTIONS, HL.HL]) === OFF.meta, 'the rule, the sections and the size are unchanged');
  const L = lv.build();
  ok(L.H === 240 && L.W === 80 && !L.ext, 'the built level is 80 x 240');
  ok(sha(L) === OFF.full, 'the whole build (grid, ents, movers, kit, supports, sections, every field) is byte-identical to master: ' + sha(L));
  ok(qhash(L) === OFF.quality, 'the level-quality hash is the stamped one (the pilot / curve / mash rows stay valid): ' + qhash(L));
  const painter = (W, H) => { const grid = new Uint8Array(W * H), ents = []; const set = (x, y, v) => { if (x >= 0 && y >= 0 && x < W && y < H) grid[y * W + x] = v; };
    return { W, H, grid, ents, set, block: (x0, x1, y0, y1) => { for (let y = y0; y <= y1; y++) for (let x = x0; x <= x1; x++) set(x, y, T.SOLID); }, ent: (t, x, y, o = {}) => ents.push({ t, x, y, ...o }) }; };
  ok(sha(HL.buildHighLines({ painter, T, TS })) === sha(HL.buildHighLines({ painter, T, TS, ext: false })), 'the builder with no argument is the flag-off builder');
  ok(HL.HL_DATA_EXT.h === 324 && HL.HL_EXT_H === 324 && sha(HL.HL_DATA) === OFF.data && sha(HL.HL_DATA_SW) !== OFF.data, 'the extension data are a separate copy, 84 rows taller (and built on the switch-patched copy, never on HL_DATA)');
  console.log('  flag OFF: ' + n + ' checks (parity with master: data ' + OFF.data + ', build ' + OFF.full + ', quality ' + OFF.quality + ')');
  const r0 = run('highlines.mjs', FULL ? [] : ['--quick']); process.stdout.write(r0.stdout.split('\n').filter(l => /^highlines:|sweep:/.test(l)).join('\n') + '\n'); ok(r0.status === 0, 'tools/highlines.mjs (the existing proofs) is green with the flag off:\n' + (r0.stderr || '').split('\n').slice(0, 8).join('\n'));
  const child = spawnSync(process.execPath, ['--import', new URL('./hl-ext-on.mjs', import.meta.url).href, fileURLToPath(import.meta.url), '--on', ...(FULL ? ['--full'] : [])], { encoding: 'utf8' });
  process.stdout.write(child.stdout); if (child.status !== 0) { process.stderr.write(child.stderr); process.exit(1); }
  console.log('hl-ext: flag OFF ' + n + ' checks, flag ON (child) green');
}
else {
  /* ---------- FLAG ON ---------- */
  const B = HL.HL_DATA_SW, X = HL.HL_DATA_EXT, { dRow, dRowG, rowMap, rowMapG, EXT_ADD, EXT_ROCK, EXT_ROWS, I, G_LANDINGS, G_LINES, HALL, EXT_SHRINES } = EX;
  ok(HL.HL_EXT === true && lv.build().H === 324 && lv.build().ext !== false, 'the flag is on in this process: the level is 80 x 324');
  const mkP = (W, H) => { const grid = new Uint8Array(W * H), ents = []; const set = (x, y, v) => { if (x >= 0 && y >= 0 && x < W && y < H) grid[y * W + x] = v; };
    return { W, H, grid, ents, set, block: (x0, x1, y0, y1) => { for (let y = y0; y <= y1; y++) for (let x = x0; x <= x1; x++) set(x, y, T.SOLID); }, ent: (t, x, y, o = {}) => ents.push({ t, x, y, ...o }) }; };
  const L = lv.build(), at = (x, y) => L.grid[y * L.W + x], baseL = HL.buildHighLines({ painter: mkP, T, TS, ext: false, sw: true });   /* the switch-patched, unextended build: what the extension moves */
  ok(EXT_ROWS === 84 && L.H === baseL.H + 84 && L.W === 80 && L.tall && L.climbCam && L.highlines && L.lineKit.rule === 'switch', 'the level is 84 rows taller (26 ore line + 10 apron + 48 hall), still a tall climb-cam High Lines, and the switch rule is on (the hall\'s board is a lever)');
  /* THE SHIFT: every row moved by its cut's rows and nothing else; the gondola group by the apron + the hall */
  ok(dRow(58) === 0 && dRow(59) === 10 && dRow(104) === 10 && dRow(105) === 58 && dRow(188) === 58 && dRow(189) === 84 && dRow(239) === 84 && dRowG(85) === 58 && dRowG(104) === 58, 'the cuts: rows < 59 stay, 59-104 move 10, 105-188 move 58, 189+ move 84; the gondola group (rows 85-104) moves 58 with the rows below it');
  B.landings.forEach((b, i) => { const d = G_LANDINGS.includes(i) ? dRowG(b[1]) : dRow(b[1]); ok(X.landings[i].join() === [b[0], b[1] + d, b[2], b[3] + d].join(), 'landing ' + i + ' moved rigidly by ' + d); });
  ok(JSON.stringify(G_LANDINGS) === '[23,24,26]' && [23, 24, 26].every(i => X.landings[i][1] - B.landings[i][1] === 58), 'the gondola station, LA1 and THE DOCK (landings 23, 24, 26) travel 58 rows with the gondola');
  ok(X.landings.length === B.landings.length + EXT_ADD.landings.length && B.landings.length === 38 && EXT_ADD.landings.every((b, i) => X.landings[B.landings.length + i].join() === b.join()), 'the new landings are APPENDED after the switch patch\'s 38 (every existing landing index, the art tables, keep their meaning): ore 38-40, apron 41-45, hall 46-53');
  B.nets.forEach((b, i) => ok(X.nets[i][1] === b[1] + dRow(b[1]) && X.nets[i][0] === b[0] && X.nets[i][2] === b[2], 'net ' + i + ' moved'));
  B.lineKit.lines.forEach(d => { const x = X.lineKit.lines.find(q => q.id === d.id), g = G_LINES.includes(d.id); ok(x, 'line ' + d.id + ' kept'); ok(Math.abs((x.b[1] - x.a[1]) - (d.b[1] - d.a[1])) < 1e-9 && x.a[0] === d.a[0] && x.b[0] === d.b[0] && x.kind === d.kind, d.id + ': the same run and rise');
    ok(Math.min(x.a[1] - d.a[1], x.b[1] - d.b[1]) === Math.max(x.a[1] - d.a[1], x.b[1] - d.b[1]) && (!g || x.a[1] - d.a[1] === dRowG(d.a[1])), d.id + ': both ends moved together' + (g ? ' (with the gondola group)' : '')); });
  { const base = new Set(B.lineKit.lines.map(d => d.id)), hall = ['DW1', 'DW2', 'HW1', 'CR', 'B1', 'B2', 'B3', 'HW3', 'SR'];
    ok(X.lineKit.lines.length === B.lineKit.lines.length + 3 + hall.length && X.lineKit.lines.every(d => base.has(d.id) || /^OL\d$/.test(d.id) || hall.includes(d.id)) && hall.every(id => X.lineKit.lines.some(d => d.id === id)), 'three ore legs and the hall\'s nine lines added, no other line'); }
  /* every rope end keeps its deck: for each (end, landing) pair within 4 rows over a deck in the base, the same distance in the extension (W5.a over L5 is re-held by the head station, E3.b by the apron foot, E1.a by the exit adit HX: the old dock's very spot) */
  { let pairs = 0; for (const d of B.lineKit.lines) for (const e of ['a', 'b']) B.landings.forEach((b, i) => { const [x, y] = d[e]; if (x >= b[0] - 1 && x <= b[2] + 1 && b[1] - y >= 0 && b[1] - y <= 4) { const q = X.lineKit.lines.find(z => z.id === d.id)[e], b2 = X.landings[i]; pairs++;
      const special = (id, end, land) => { if (d.id !== id || e !== end) return false; ok(land[1] - q[1] === 1 && q[0] >= land[0] && q[0] <= land[2], id + '.' + end + ' sits 1 row over ' + (land === X.landings[I.HX] ? 'the exit adit HX (the old dock\'s spot: E1 still starts where it did)' : 'its new deck')); return true; };
      if (special('W5', 'a', X.landings[I.OT]) || special('E3', 'b', X.landings[I.AF]) || special('E1', 'a', X.landings[I.HX])) return;
      ok(b2[1] - q[1] === b[1] - y && x >= b2[0] - 1 && x <= b2[2] + 1, d.id + '.' + e + ' still ' + (b[1] - y) + ' rows over landing ' + i); } }); ok(pairs > 20, pairs + ' rope-end / deck pairs kept'); }
  ok(X.checkpoints.length === 3 + EXT_SHRINES.length && EXT_SHRINES.length === 1, 'the plan allows ONE new shrine (the hall\'s): four shrines, not more');
  { const cps = X.checkpoints; ok(cps[0].x === B.checkpoints[0].x && cps[0].y === B.checkpoints[0].y + 84 && cps[3].x === B.checkpoints[2].x && cps[3].y === B.checkpoints[2].y && cps[1].x === 77 && cps[1].y === rowMap(184) && cps[2].x === 62 && cps[2].y === 137, 'shrines in route order: the line-yard (moved), L7\'s east end (moved), the hall floor by the door (62,137), the cave mouth ledge (did not move)'); }
  B.secrets.forEach((s, i) => ok(X.secrets[i][1] === s[1] + dRow(s[1]) && X.secrets[i][0] === s[0], 'silver ' + (i + 1) + ' moved'));
  ok(X.secrets.length === 3 && X.secrets[2].join() === '8,113', 'the third silver is in the hall (the side ledge SL)');
  ok(X.exit.join() === B.exit.join() && JSON.stringify(B.arena) === JSON.stringify(X.arena), 'the exit and SKYHOOK\'s arena did not move (rows 30-48 keep their numbers)');
  ok(JSON.stringify(X.hookjacks.slice(0, B.hookjacks.length)) === JSON.stringify(B.hookjacks) && X.hookjacks.length === B.hookjacks.length + 3, 'the Hookjacks are the same list (by line id and column) plus the hall\'s three');
  B.lineKit.winds.forEach((w, i) => ok(X.lineKit.winds[i].box[1] - w.box[1] === dRow(w.box[1]) && X.lineKit.winds[i].box[3] - w.box[3] === dRow(w.box[1]), 'wind ' + w.id + ' moved rigidly'));
  B.lineKit.lee.forEach((l, i) => ok(X.lineKit.lee[i][1] - l[1] === dRow(l[1]) && X.lineKit.lee[i][3] - l[3] === dRow(l[1]), 'lee box ' + i + ' moved rigidly'));
  ok(JSON.stringify(X.lineKit.weights.map(w => [w.a.top - w.a.bot, w.hopper[1] - w.a.top])) === JSON.stringify(B.lineKit.weights.map(w => [w.a.top - w.a.bot, w.hopper[1] - w.a.top])) && X.lineKit.weights[0].a.top === B.lineKit.weights[0].a.top + 58, 'the counterweight keeps its shape and travels with the gondola group');
  ok(JSON.stringify(X.lineKit.switches.slice(0, 3).map(s => [s.id, s.at[0], s.at[1]])) === JSON.stringify(B.lineKit.switches.map(s => [s.id, s.at[0], s.at[1] + dRow(s.at[1])])) && X.lineKit.switches.length === 4, 'the three base levers moved with their decks; the fourth is the hall\'s route board JB');
  /* THE GRID: every base cell is where the shift puts it (the gondola group's two old decks and the hall's rock footprint aside); the new rows are two cliff walls and air plus what the extension builds */
  { const gDeck = new Set(); for (const [x0, top, x1] of [[13, 102, 25], [1, 102, 2]]) for (let x = x0; x <= x1; x++) gDeck.add(x + ',' + top);
    const [rx0, ry0, rx1, ry1] = HALL.rock; let bad = 0; for (let y = 0; y < baseL.H; y++) for (let x = 0; x < baseL.W; x++) { if (gDeck.has(x + ',' + y)) continue; const my = rowMap(y); if (my >= ry0 && my <= ry1 && x >= rx0 && x <= rx1) continue; if (baseL.grid[y * baseL.W + x] !== at(x, my)) bad++; }
    ok(bad === 0, 'every grid cell of the (switch-patched) live level is where the shift puts it (' + bad + ' off)'); }
  { const exp = (x, y) => { const [rx0, ry0, rx1, ry1] = HALL.rock, [cx0, cy0, cx1, cy1] = HALL.cavity; if (x === 0 || x === L.W - 1) return T.SOLID; let v = T.AIR;
      if (y >= ry0 && y <= ry1 && x >= rx0 && x <= rx1) v = T.SOLID; if (y >= cy0 && y <= cy1 && x >= cx0 && x <= cx1) v = T.AIR; for (const [x0, y0, x1, y1] of HALL.doors) if (x >= x0 && x <= x1 && y >= y0 && y <= y1) v = T.AIR;
      for (const [x0, top, x1] of EXT_ADD.landings) if (x >= x0 && x <= x1 && y === top) v = T.ONEWAY; for (const i of G_LANDINGS) { const [x0, top, x1] = X.landings[i]; if (x >= x0 && x <= x1 && y === top) v = T.ONEWAY; }
      if (y === HALL.floorRow && x >= 5 && x <= 66) v = T.SOLID; return v; };
    let stray = 0; const newRows = y => (y >= 59 && y < 69) || (y >= 115 && y < 163) || (y >= 247 && y < 273); for (let y = 0; y < L.H; y++) if (newRows(y) || (y >= 101 && y <= 114)) for (let x = 0; x < L.W; x++) { if (y <= 114 && y >= 101 && x > 66 && x < L.W - 1) continue; if (at(x, y) !== exp(x, y)) stray++; }   /* rows 101-114 east of the hall are the exam's own (L16 and the lee) */
    ok(stray === 0, 'the new rows (apron 59-68, hall 115-162, ore 247-272) and the hall\'s top rows are the shaft (walls, air) plus exactly the extension\'s rock, doors and one-way decks (' + stray + ' stray)'); }
  { const [x0, top, x1] = X.landings[I.HF]; let rock = 0, deckN = 0; for (let x = x0; x <= x1; x++) { if (at(x, top) === T.SOLID) rock++; if (at(x, top) === T.ONEWAY) deckN++; } ok(rock === 62 && deckN === 12, 'the hall floor HF: rock inside the hall (x 5-66, 62 tiles), a one-way deck on the east strip (x 67-78, 12 tiles)'); }
  ok(JSON.stringify(Array.from(baseL.ents.filter(e => e.t !== 'check').map(e => [e.t, e.x, (e.t !== 'hookjack' && e.y >= 85 && e.y < 105 && e.x < 63 ? rowMapG : rowMap)(e.y)]))) === JSON.stringify(L.ents.slice(0, baseL.ents.length - 3).map(e => [e.t, e.x, e.y])), 'every ent of the live level moved with its row (the gondola\'s sign, harpy and crossbowman with the gondola), in order');
  /* WHAT WAS ADDED */
  const cnt = (list, t) => list.filter(e => e.t === t).length;
  ok(cnt(L.ents, 'check') === 4 && cnt(L.ents, 'silver') === 3 && L.checkpoints.length === 4 && cnt(L.ents, 'hookjack') === cnt(baseL.ents, 'hookjack') + 3 && cnt(L.ents, 'hllever') === cnt(baseL.ents, 'hllever') + 1, 'four shrines (the hall\'s the only new one), three silvers, three more Hookjacks, one more lever prop');
  ok(cnt(L.ents, 'crossbow') === cnt(baseL.ents, 'crossbow') + 2 && cnt(L.ents, 'galeharpy') === cnt(baseL.ents, 'galeharpy') + 1 && cnt(L.ents, 'rockfall') === cnt(baseL.ents, 'rockfall') + 2 && cnt(HL.buildHighLines({ painter: mkP, T, TS, ext: true }).ents, 'coin') === cnt(baseL.ents, 'coin') + 3 + 3 + 8, 'ore line +1 crossbowman, apron +1 gale harpy +2 rockfalls, hall +1 crossbowman; the builder coins +14 (ore 3, apron 3, hall 8); the level.js wrapper sprinkles the rest of the ' + cnt(L.ents, 'coin') + ' (the live level has ' + cnt(baseL.ents, 'coin') + ' there)');
  { const kinds = new Set(baseL.ents.map(e => e.t)), Bx = HL.buildHighLines({ painter: mkP, T, TS, ext: true }); ok(Bx.ents.every(e => kinds.has(e.t)), 'no new foe family, no new ent kind (every kind the extension builds is one the live level builds)'); }
  ok(!L.ents.some(e => /gob|goblin/.test(e.t)) && !L.ents.some(e => e.t === 'hookjack' && !X.lineKit.lines.some(d => d.id === e.line)), 'no goblin ent (the crossbowmen reskin as before), every Hookjack on a real line');
  const ck = L.ents.filter(e => e.t === 'check').map(e => [e.x, e.y + 1]); ok(ck.every(([x, y]) => X.landings.some(b => x >= b[0] && x <= b[2] && b[1] === y)), 'every shrine stands on a deck');
  ok(X.checkpoints[1].x === 77 && X.landings[8][1] === X.checkpoints[1].y && X.landings[8][0] <= 77 && X.landings[8][2] >= 77, 'shrine 2 is on L7\'s east end (the foot of W6): the ore line adds 51 route tiles, L8 would be 211 from the start');
  { const lvs = X.lineKit.lines.filter(d => /^OL\d$/.test(d.id)), S0 = X.landings[6], OE = X.landings[I.OE], OW = X.landings[I.OW], OT = X.landings[I.OT], seq = [[S0, OE], [OE, OW], [OW, OT]];
    ok(S0[1] === 273 && OE[1] === 265 && OW[1] === 257 && OT[1] === 247, 'THE ORE LINE: four stations 8 rows apart (273, 265, 257, then the head at 247)');
    lvs.forEach((d, i) => { const [lo, hi] = seq[i], rise = d.a[1] - d.b[1], on = (p, k) => p[0] >= k[0] && p[0] <= k[2];
      ok(d.kind === 'winch' && d.cartLeg === i + 1 && rise >= 8 && rise <= 10, d.id + ': a provisional winch leg rising ' + rise + ' rows (the cart plan: ~8)');
      ok(on(d.a, lo) && lo[1] - d.a[1] === 1 && on(d.b, hi) && hi[1] - d.b[1] === 2 || (i === 2 && on(d.a, lo) && d.b[0] >= hi[0] && d.b[0] <= hi[2] && hi[1] - d.b[1] === 1), d.id + ' starts on its station and tops over the next'); });
    ok(OT[2] >= 43 && OT[1] - X.lineKit.lines.find(d => d.id === 'W5').a[1] === 1, 'the head station is under W5\'s foot and wide enough for S4\'s tall pylon (it held S4 to L3 before the cut)');
    ok(L.ents.some(e => e.t === 'crossbow' && e.x >= OE[0] && e.x <= OE[2] && e.y + 1 === OE[1]) && L.ents.some(e => e.t === 'sign' && /ORE LINE/.test(e.text) && e.y + 1 === S0[1]), 'one crossbowman on the east station, a sign on the foot station'); }
  { const [AF, A, Bs, C, D] = [I.AF, I.A, I.B, I.C, I.D].map(i => X.landings[i]), led = X.landings[29], E3 = X.lineKit.lines.find(d => d.id === 'E3');
    ok(led[1] === 58 && AF[1] === 68 && E3.b[1] === 67 && AF[1] - E3.b[1] === 1 && E3.b[0] >= AF[0] && E3.b[0] <= AF[2], 'THE CAVE APRON: E3 tops onto the new rock foot (row 68); the shrine ledge (row 58) did not move');
    ok(JSON.stringify(EXT_ROCK) === '[41,42,43,44,45]' && [A, Bs, C, D].every(b => b[2] - b[0] + 1 === 7), 'five rock lips (foot + four long steps, 7 tiles each)');
    /* the whole hero set makes each step: the arc from src/hero-move.js, the slowest runner */
    const arc = (() => { let vy = MOVE.JUMPV, y = 0, t = 0, best = 0, win = []; for (let i = 0; i < 240; i++) { const g = MOVE.GRAV * (Math.abs(vy) < MOVE.APEX_VY ? MOVE.APEX_G : vy > 0 ? MOVE.FALL_G : 1); vy = Math.min(MOVE.MAX_FALL, vy + g / 60); y += vy / 60; t += 1 / 60; best = Math.min(best, y); win.push([t, y]); } return { rise: -best, win }; })();
    const slow = Math.min(...HERO_MOVE_IDS.map(h => MOVE.RUN * heroRunMul(h, false))), above = dy => arc.win.filter(([, y]) => -y >= dy).length / 60;
    const steps = [[AF, A], [A, Bs], [Bs, C], [C, D], [D, led]];
    for (const [lo, hi] of steps) { const rise = (lo[1] - hi[1]) * TS, gap = Math.max(0, Math.max(lo[0], hi[0]) - Math.min(lo[2], hi[2]) - 1) * TS;
      ok(rise === 32 && arc.rise >= rise + 8, 'step ' + lo[1] + ' -> ' + hi[1] + ': a ' + (rise / TS) + '-row rise (the jump rises ' + arc.rise.toFixed(0) + ' px)'); ok(gap <= above(rise) * slow, 'step ' + lo[1] + ' -> ' + hi[1] + ': the gap (' + gap + ' px) is inside the slowest hero\'s reach (' + (above(rise) * slow).toFixed(0) + ' px)'); }
    ok(D[0] >= led[0] && D[2] <= led[2] + 0 && D[1] - led[1] === 2, 'the last step lands under the ledge it climbs onto (straight up 2 rows)');
    const rock = L.ents.filter(e => e.t === 'rockfall').slice(-2); ok(rock.length === 2 && rock.every(e => e.seen && e.tell >= 1 && e.x >= 16 && e.x <= 22 && !(e.x >= led[0] && e.x <= led[2])), 'rockfall is told (>= 1 s, on screen) and falls only over the A / C steps, never the shrine ledge');
    ok(X.checkpoints[3].y === 58 && L.ents.some(e => e.t === 'galeharpy' && e.y > 58 && e.y < 68), 'checkpoint 3 stays on the ledge, the gale harpy circles the steps'); }
  /* THE DRUM HALL (static) */
  { const [HF, M, RH, T1, T2, T3, HX, SL] = [I.HF, I.M, I.RH, I.T1, I.T2, I.T3, I.HX, I.SL].map(i => X.landings[i]), dock = X.landings[26], E1 = X.lineKit.lines.find(d => d.id === 'E1'), GD = X.lineKit.lines.find(d => d.id === 'GD'), ln = id => X.lineKit.lines.find(d => d.id === id);
    const [rx0, ry0, rx1, ry1] = HALL.rock, [cx0, cy0, cx1, cy1] = HALL.cavity, gale = X.lineKit.winds.find(w => w.id === 'examGale');
    ok(cx1 - cx0 + 1 === 58 && cy1 - cy0 + 1 === 33 && ry1 - ry0 + 1 === 40, 'THE DRUM HALL: a cavity 58 x 33 tiles in a rock mass 66 x 40 (plan: ~50 x 36), on the east cliff above the dock');
    ok(ry0 > gale.box[3] && gale.box[3] === 100 && !X.lineKit.winds.some(w => w.box[1] <= ry1 && w.box[3] >= ry0 && w.box[0] <= rx1 && w.box[2] >= rx0), 'no wind box touches the hall (the exam\'s gale ends at row 100, the rock starts at 101): gale-free');
    ok(GD.b[1] - 3 >= ry1 && GD.b[1] === 143, 'the gondola\'s top (GD at row ' + GD.b[1] + ') clears the hall\'s floor rock (row ' + ry1 + ') by 3 rows: the cab runs under it');
    ok(dock[1] === 162 && HX[1] === 114 && HX[0] === 63 && HX[2] === 72 && E1.a[1] === 113 && E1.a[0] === 67, 'THE DOCK moved to row 162 with the gondola; the exit adit HX stands on its old spot (row 114, x 63-72) and E1, the cutter\'s race, starts there as before');
    ok(M[1] === 149 && HF[1] === 137 && HF[0] === 5 && HF[2] === 78 && RH[1] === 110 && T1[1] === 124 && T2[1] === 124 && T3[1] === 124 && SL[1] === 114, 'stations: floor 137, strip mid station M 149, rail head RH 110, the three galleries at one height (124), the silver ledge SL 114');
    ok(['DW1', 'DW2', 'HW1', 'HW3', 'SR'].every(id => ln(id).kind === 'winch' && Math.abs((ln(id).b[1] - ln(id).a[1]) / (ln(id).b[0] - ln(id).a[0])) <= 1.5) && ['CR', 'B1', 'B2', 'B3'].every(id => ln(id).kind === 'glide' && ln(id).purpose), 'the way in: DW1 (dock to M) and DW2 (M to the floor), HW1 (the climb to the rail head), HW3 (the last winch), SR (silver): grip-free winches under the 1.5 slope cap; the rail and its branches are glides taken only with UP');
    ok(ln('CR').hold === true && ln('CR').points.length === 3, 'the ceiling rail is a held glide: parked until one blow, so a hero can read the three lamps first');
    ok(X.lineKit.catwalks.length === 2 && X.lineKit.catwalks.every(c => c.top === T1[1] && c.w === 3 && c.rest >= 3 && c.told >= 1), 'two hanging catwalks at the gallery height between the three galleries');
    ok(L.moversExtra.filter(m => /^cw:/.test(m.lk)).length === 2 && L.moversExtra.every(m => m.lk), 'the catwalks are movers of the level (lk cw:C1, cw:C2: the kit carries them like the cab)');
    ok(L.ents.some(e => e.t === 'hllever' && e.sw === 'JB' && e.x === 18 && e.y + 1 === RH[1] && e.from === 'foot') && L.lever.length === 4, 'the route board lever is a prop on the rail head and listed in the level\'s lever data');
    ok(L.ents.some(e => e.t === 'crossbow' && e.x >= T3[0] && e.x <= T3[2] && e.y + 1 === T3[1]) && L.ents.some(e => e.t === 'hookjack' && e.line === 'HW1') && L.ents.some(e => e.t === 'hookjack' && e.line === 'HW3') && L.ents.some(e => e.t === 'hookjack' && e.line === 'DW2' && e.role === 'cutter' && e.y + 1 === HF[1]), 'foes: a crossbowman on the east gallery, a Hookjack on HW1, a Hookjack on HW3, the saw rigger at the door (DW2) on the floor');
    ok(L.ents.some(e => e.t === 'silver' && e.x >= SL[0] && e.x <= SL[2] && e.y + 1 === SL[1]) && L.ents.some(e => e.t === 'check' && e.x === 62 && e.y + 1 === HF[1]), 'the third silver on SL; the hall\'s shrine on the floor at x 62'); }
  /* NO SOFT-LOCK, STATICALLY */
  { const bad = lintLines(JSON.parse(JSON.stringify(X))); ok(bad.length === 0, 'the line kit lints the extended level clean (catwalks, switches, points, supports):\n  ' + bad.join('\n  ')); }
  { const kit = lineInit(JSON.parse(JSON.stringify(X))); ok(kit.list.length === X.lineKit.lines.length && kit.pitY / TS >= 323 && kit.cws.length === 2, 'the kit builds on the taller level (pit at row ' + (kit.pitY / TS).toFixed(0) + ', two catwalks)'); }
  { const sec = L.sections.map(s => s.id); ok(sec.includes('the-ore-line') && sec.includes('the-drum-hall') && sec.includes('the-cave-apron') && L.sections.every(s => s.y0 < s.y1) && L.sections[0].y1 === L.H, 'the section bands: ' + sec.join(' ')); }
  console.log('  flag ON: ' + n + ' checks (level hash ' + qhash(L) + ', ' + L.H + ' rows, ' + cnt(L.ents, 'coin') + ' coins)');
  const hx = run('highlines.mjs', FULL ? ['--ext'] : ['--quick', '--ext'], { HL_DEBUG: '1' });
  const out = hx.stdout || ''; process.stdout.write(out.split('\n').filter(l => /^highlines:|sweep:|unreached|board state|catwalks:/.test(l)).join('\n') + '\n');
  ok(hx.status === 0, 'tools/highlines.mjs --ext (every existing High Lines proof on the extended level + THE DRUM HALL section: each board state, 864 catwalk crossings, the lever, the foes) is green:\n' + ((hx.stderr || '').split('\n').filter(l => !/^\s+at /.test(l)).slice(0, 8).join('\n')));
  ok(/unreached landings: *\n/.test(out) && !/unreached landings: \S/.test(out), 'the sweep reached EVERY landing, the ore stations, the apron steps and all eight hall landings included (start to end), in every board state');
  /* THE CATWALK ROAD IS THE ROAD: with no kick off any hall line, every state of the board still reaches the exit from every shrine (the walk-and-hop road: catwalks) - and with the catwalk hops taken away the far state is a dead end (the ablation: the proof can fail) */
  const hw = run('highlines.mjs', ['--quick', '--ext', '--hallwalk'], {}); ok(hw.status === 0, 'tools/highlines.mjs --ext --hallwalk (no kick off any hall line: the catwalk road alone) reaches the exit in every board state:\n' + ((hw.stderr || '').split('\n').filter(l => !/^\s+at /.test(l)).slice(0, 6).join('\n')));
  const ab = run('highlines.mjs', ['--quick', '--ext', '--hallwalk'], { HL_NOCW: '1' }); ok(ab.status !== 0 && /the exit from every checkpoint/.test(ab.stderr || ''), 'ablation: take the catwalk hops away (HL_NOCW) and the board\'s state 0 has no way to the exit - the catwalks carry the road, the proof can fail');
  console.log('hl-ext (flag ON): ' + n + ' checks');
}
