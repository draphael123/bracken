/* tools/hl-ext.mjs - THE HIGH LINES EXTENSION (flag HL_EXT: the ore line band + the cave apron), proven in NODE (no page, no browser). claude/hlext1, 11-14.
   src/highlines-ext.js (shiftRows + the additions), src/highlines.js (the flag, default OFF, ?hlext=1). Plan: scratch/lane-reports/hlcart-plan.md lane 1.
     node tools/hl-ext.mjs [--full]     runs BOTH halves, one process after the other (src/highlines.js reads the flag when it is imported):
     FLAG OFF (this process)   the live level is BYTE-IDENTICAL to master 668af984f: HL_DATA / rule / sections hash, the built grid + ents + movers + every field of the build (full hash) and the
                               level-quality hash the stamped pilot / curve / mash rows are keyed to (b165e11737da); the default is off and the flag only turns on by the test door; the extension data is a copy
                               (building it never touched HL_DATA); then tools/highlines.mjs (the existing High Lines proofs) as is
     FLAG ON  (a child: --on)  globalThis.__HLEXT: the level is 80 x 276, the data are the base data shifted (shiftRows: every row of every landing, net, line, anchor, weight, wind box, lee box, shrine,
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
  ok(HL.HL_DATA_EXT.h === 276 && HL.HL_EXT_H === 276 && sha(HL.HL_DATA) === OFF.data, 'the extension data are a separate copy, 36 rows taller');
  console.log('  flag OFF: ' + n + ' checks (parity with master: data ' + OFF.data + ', build ' + OFF.full + ', quality ' + OFF.quality + ')');
  const r0 = run('highlines.mjs', FULL ? [] : ['--quick']); process.stdout.write(r0.stdout.split('\n').filter(l => /^highlines:|sweep:/.test(l)).join('\n') + '\n'); ok(r0.status === 0, 'tools/highlines.mjs (the existing proofs) is green with the flag off:\n' + (r0.stderr || '').split('\n').slice(0, 8).join('\n'));
  const child = spawnSync(process.execPath, ['--import', new URL('./hl-ext-on.mjs', import.meta.url).href, fileURLToPath(import.meta.url), '--on', ...(FULL ? ['--full'] : [])], { encoding: 'utf8' });
  process.stdout.write(child.stdout); if (child.status !== 0) { process.stderr.write(child.stderr); process.exit(1); }
  console.log('hl-ext: flag OFF ' + n + ' checks, flag ON (child) green');
}
else {
  /* ---------- FLAG ON ---------- */
  const B = HL.HL_DATA, X = HL.HL_DATA_EXT, { dRow, rowMap, EXT_ADD, EXT_ROCK, EXT_ROWS } = EX;
  ok(HL.HL_EXT === true && lv.build().H === 276 && lv.build().ext !== false, 'the flag is on in this process: the level is 80 x 276');
  const L = lv.build(), at = (x, y) => L.grid[y * L.W + x], baseL = HL.buildHighLines({ painter: (W, H) => { const grid = new Uint8Array(W * H), ents = []; const set = (x, y, v) => { if (x >= 0 && y >= 0 && x < W && y < H) grid[y * W + x] = v; };
    return { W, H, grid, ents, set, block: (x0, x1, y0, y1) => { for (let y = y0; y <= y1; y++) for (let x = x0; x <= x1; x++) set(x, y, T.SOLID); }, ent: (t, x, y, o = {}) => ents.push({ t, x, y, ...o }) }; }, T, TS, ext: false });
  ok(EXT_ROWS === 36 && L.H === baseL.H + 36 && L.W === 80 && L.tall && L.climbCam && L.highlines, 'the level is 36 rows taller (26 ore line + 10 apron), still a tall climb-cam High Lines');
  /* THE SHIFT: every row moved by its cut's rows and nothing else */
  ok(dRow(58) === 0 && dRow(59) === 10 && dRow(188) === 10 && dRow(189) === 36 && dRow(275) === 36, 'the cuts: rows < 59 stay, 59-188 move 10, 189+ move 36');
  B.landings.forEach((b, i) => { const d = dRow(b[1]); ok(X.landings[i].join() === [b[0], b[1] + d, b[2], b[3] + d].join(), 'landing ' + i + ' moved rigidly by ' + d); });
  ok(X.landings.length === B.landings.length + EXT_ADD.landings.length && EXT_ADD.landings.every((b, i) => X.landings[B.landings.length + i].join() === b.join()), 'the new landings are APPENDED (every existing landing index, the art tables, keep their meaning)');
  B.nets.forEach((b, i) => ok(X.nets[i][1] === b[1] + dRow(b[1]) && X.nets[i][0] === b[0] && X.nets[i][2] === b[2], 'net ' + i + ' moved'));
  B.lineKit.lines.forEach(d => { const x = X.lineKit.lines.find(q => q.id === d.id); ok(x, 'line ' + d.id + ' kept'); ok(Math.abs((x.b[1] - x.a[1]) - (d.b[1] - d.a[1])) < 1e-9 && x.a[0] === d.a[0] && x.b[0] === d.b[0] && x.kind === d.kind, d.id + ': the same rope (shape, kind, columns), moved ' + (x.a[1] - d.a[1]));
    ok(Math.min(x.a[1] - d.a[1], x.b[1] - d.b[1]) === Math.max(x.a[1] - d.a[1], x.b[1] - d.b[1]), d.id + ': both ends moved together'); });
  ok(X.lineKit.lines.length === B.lineKit.lines.length + 3, 'three legs added');
  { const base = new Set(B.lineKit.lines.map(d => d.id)); ok(X.lineKit.lines.every(d => base.has(d.id) || /^OL\d$/.test(d.id)), 'no other line was added'); }
  /* every rope end keeps its deck: for each (end, landing) pair within 4 rows over a deck in the base, the same distance in the extension (W5.a over L5 is re-held by the head station) */
  { let pairs = 0; for (const d of B.lineKit.lines) for (const e of ['a', 'b']) B.landings.forEach((b, i) => { const [x, y] = d[e]; if (x >= b[0] - 1 && x <= b[2] + 1 && b[1] - y >= 0 && b[1] - y <= 4) { const q = X.lineKit.lines.find(z => z.id === d.id)[e], b2 = X.landings[i]; pairs++;
      if (d.id === 'W5' && e === 'a') { ok(q[1] === rowMap(y) && X.landings[39][1] - q[1] === 1 && q[0] >= X.landings[39][0] && q[0] <= X.landings[39][2], 'W5 starts over the new head station (the old L5 spot), as it did over L5'); return; }
      if (d.id === 'E3' && e === 'b') { const af = X.landings[40]; ok(af[1] - q[1] === 1 && q[0] >= af[0] && q[0] <= af[2], 'E3 tops onto the apron foot (1 row over it), as it topped onto the cave mouth ledge'); return; }
      ok(b2[1] - q[1] === b[1] - y && x >= b2[0] - 1 && x <= b2[2] + 1, d.id + '.' + e + ' still ' + (b[1] - y) + ' rows over landing ' + i); } }); ok(pairs > 20, pairs + ' rope-end / deck pairs kept'); }
  B.checkpoints.forEach((c, i) => { if (i === 1) return; ok(X.checkpoints[i].x === c.x && X.checkpoints[i].y === c.y + dRow(c.y), 'shrine ' + (i + 1) + ' moved with its deck'); });
  B.secrets.forEach((s, i) => ok(X.secrets[i][1] === s[1] + dRow(s[1]) && X.secrets[i][0] === s[0], 'silver ' + (i + 1) + ' moved'));
  ok(X.exit.join() === B.exit.join() && JSON.stringify(B.arena) === JSON.stringify(X.arena), 'the exit and SKYHOOK\'s arena did not move (rows 30-48 keep their numbers)');
  ok(X.hookjacks.length === B.hookjacks.length && JSON.stringify(X.hookjacks) === JSON.stringify(B.hookjacks), 'the Hookjacks are the same list (by line id and column)');
  B.lineKit.winds.forEach((w, i) => ok(X.lineKit.winds[i].box[1] - w.box[1] === dRow(w.box[1]) && X.lineKit.winds[i].box[3] - w.box[3] === dRow(w.box[1]), 'wind ' + w.id + ' moved rigidly'));
  B.lineKit.lee.forEach((l, i) => ok(X.lineKit.lee[i][1] - l[1] === dRow(l[1]) && X.lineKit.lee[i][3] - l[3] === dRow(l[1]), 'lee box ' + i + ' moved rigidly'));
  ok(JSON.stringify(X.lineKit.weights.map(w => [w.a.top - w.a.bot, w.hopper[1] - w.a.top])) === JSON.stringify(B.lineKit.weights.map(w => [w.a.top - w.a.bot, w.hopper[1] - w.a.top])), 'the counterweight keeps its shape');
  /* THE GRID: every base cell is where rowMap says; the new rows are two cliff walls and air plus the new decks */
  { let bad = 0; for (let y = 0; y < baseL.H; y++) for (let x = 0; x < baseL.W; x++) if (baseL.grid[y * baseL.W + x] !== at(x, rowMap(y))) bad++; ok(bad === 0, 'every grid cell of the live level is where the shift puts it (' + bad + ' off)'); }
  { const newRow = y => y >= 59 && y < 69 || y >= 199 && y < 225; let stray = 0; const decks = new Set(); for (const [x0, top, x1] of EXT_ADD.landings) for (let x = x0; x <= x1; x++) decks.add(x + ',' + top);
    for (let y = 0; y < L.H; y++) if (newRow(y)) for (let x = 0; x < L.W; x++) { const v = at(x, y), wall = x === 0 || x === L.W - 1; if (wall ? v !== T.SOLID : decks.has(x + ',' + y) ? v !== T.ONEWAY : v !== T.AIR) stray++; }
    ok(stray === 0, 'the new rows are the shaft (walls, air) and the new one-way decks only (' + stray + ' stray)'); }
  ok(JSON.stringify(Array.from(baseL.ents.filter(e => !['check'].includes(e.t)).map(e => [e.t, e.x, rowMap(e.y)]))) === JSON.stringify(L.ents.slice(0, baseL.ents.length - 3).map(e => [e.t, e.x, e.y])), 'every ent of the live level moved with its row, in order');
  /* WHAT WAS ADDED */
  const cnt = (list, t) => list.filter(e => e.t === t).length;
  ok(cnt(L.ents, 'check') === 3 && cnt(L.ents, 'silver') === 2 && cnt(L.ents, 'hookjack') === cnt(baseL.ents, 'hookjack') && L.checkpoints.length === 3, 'three shrines (no new one: the plan\'s budget), two silvers, the same Hookjacks');
  ok(cnt(L.ents, 'crossbow') === cnt(baseL.ents, 'crossbow') + 1 && cnt(L.ents, 'galeharpy') === cnt(baseL.ents, 'galeharpy') + 1 && cnt(L.ents, 'rockfall') === cnt(baseL.ents, 'rockfall') + 2 && cnt(L.ents, 'coin') === 42 + 6 /* the live level has 42 (the level.js wrapper sprinkles 27 past the builder's 15) */, 'foes: +1 crossbowman (ore line east station), +1 gale harpy (apron); +2 rockfall, +6 coins');
  ok(!L.ents.some(e => /gob|goblin/.test(e.t)) && !L.ents.some(e => e.t === 'hookjack' && !X.lineKit.lines.some(d => d.id === e.line)), 'no new foe family, no goblin ent (the crossbowmen reskin as before)');
  const ck = L.ents.filter(e => e.t === 'check').map(e => [e.x, e.y + 1]); ok(ck.every(([x, y]) => X.landings.some(b => x >= b[0] && x <= b[2] && b[1] === y)), 'every shrine stands on a deck');
  ok(X.checkpoints[1].x === 77 && X.landings[8][1] === X.checkpoints[1].y && X.landings[8][0] <= 77 && X.landings[8][2] >= 77, 'shrine 2 moved onto L7\'s east end (the foot of W6): the ore line adds 51 route tiles, L8 would be 211 from the start');
  { const lvs = X.lineKit.lines.filter(d => /^OL\d$/.test(d.id)), st = [X.landings[24 + 13 + 0], X.landings[37], X.landings[38], X.landings[39]];   /* S0 = the shifted L5 (index 6) */
    const S0 = X.landings[6], OE = X.landings[37], OW = X.landings[38], OT = X.landings[39], seq = [[S0, OE], [OE, OW], [OW, OT]]; void st;
    ok(S0[1] === 225 && OE[1] === 217 && OW[1] === 209 && OT[1] === 199, 'THE ORE LINE: four stations 8 rows apart (225, 217, 209, then the head at 199)');
    lvs.forEach((d, i) => { const [lo, hi] = seq[i], rise = d.a[1] - d.b[1], on = (p, k) => p[0] >= k[0] && p[0] <= k[2];
      ok(d.kind === 'winch' && d.cartLeg === i + 1 && rise >= 8 && rise <= 10, d.id + ': a provisional winch leg rising ' + rise + ' rows (the cart plan: ~8)');
      ok(on(d.a, lo) && lo[1] - d.a[1] === 1 && on(d.b, hi) && hi[1] - d.b[1] === 2 || (i === 2 && on(d.a, lo) && d.b[0] >= hi[0] && d.b[0] <= hi[2] && hi[1] - d.b[1] === 1), d.id + ' starts on its station and tops over the next'); });
    ok(OT[2] >= 43 && OT[1] - X.lineKit.lines.find(d => d.id === 'W5').a[1] === 1, 'the head station is under W5\'s foot and wide enough for S4\'s tall pylon (it held S4 to L3 before the cut)');
    ok(L.ents.some(e => e.t === 'crossbow' && e.x >= OE[0] && e.x <= OE[2] && e.y + 1 === OE[1]) && L.ents.some(e => e.t === 'sign' && /ORE LINE/.test(e.text) && e.y + 1 === S0[1]), 'one crossbowman on the east station, a sign on the foot station'); }
  { const [AF, A, Bs, C, D] = [40, 41, 42, 43, 44].map(i => X.landings[i]), led = X.landings[29], E3 = X.lineKit.lines.find(d => d.id === 'E3');
    ok(led[1] === 58 && AF[1] === 68 && E3.b[1] === 67 && AF[1] - E3.b[1] === 1 && E3.b[0] >= AF[0] && E3.b[0] <= AF[2], 'THE CAVE APRON: E3 tops onto the new rock foot (row 68); the shrine ledge (row 58) did not move');
    ok(JSON.stringify(EXT_ROCK) === '[40,41,42,43,44]' && [A, Bs, C, D].every(b => b[2] - b[0] + 1 === 7), 'five rock lips (foot + four long steps, 7 tiles each)');
    /* the whole hero set makes each step: the arc from src/hero-move.js, the slowest runner */
    const arc = (() => { let vy = MOVE.JUMPV, y = 0, t = 0, best = 0, win = []; for (let i = 0; i < 240; i++) { const g = MOVE.GRAV * (Math.abs(vy) < MOVE.APEX_VY ? MOVE.APEX_G : vy > 0 ? MOVE.FALL_G : 1); vy = Math.min(MOVE.MAX_FALL, vy + g / 60); y += vy / 60; t += 1 / 60; best = Math.min(best, y); win.push([t, y]); } return { rise: -best, win }; })();
    const slow = Math.min(...HERO_MOVE_IDS.map(h => MOVE.RUN * heroRunMul(h, false))), above = dy => arc.win.filter(([, y]) => -y >= dy).length / 60;
    const steps = [[AF, A], [A, Bs], [Bs, C], [C, D], [D, led]];
    for (const [lo, hi] of steps) { const rise = (lo[1] - hi[1]) * TS, gap = Math.max(0, Math.max(lo[0], hi[0]) - Math.min(lo[2], hi[2]) - 1) * TS, rs = hi[1] === 58 ? 0 : 0;
      ok(rise === 32 && arc.rise >= rise + 8, 'step ' + lo[1] + ' -> ' + hi[1] + ': a ' + (rise / TS) + '-row rise (the jump rises ' + arc.rise.toFixed(0) + ' px)'); ok(gap <= above(rise) * slow, 'step ' + lo[1] + ' -> ' + hi[1] + ': the gap (' + gap + ' px) is inside the slowest hero\'s reach (' + (above(rise) * slow).toFixed(0) + ' px)'); void rs; }
    ok(D[0] >= led[0] && D[2] <= led[2] + 0 && D[1] - led[1] === 2, 'the last step lands under the ledge it climbs onto (straight up 2 rows)');
    const rock = L.ents.filter(e => e.t === 'rockfall').slice(-2); ok(rock.length === 2 && rock.every(e => e.seen && e.tell >= 1 && e.x >= 16 && e.x <= 22 && !(e.x >= led[0] && e.x <= led[2])), 'rockfall is told (>= 1 s, on screen) and falls only over the A / C steps, never on the shrine ledge (x ' + rock.map(e => e.x) + ')');
    const ck3 = X.checkpoints[2]; ok(ck3.y === 58 && L.ents.some(e => e.t === 'galeharpy' && e.y > 58 && e.y < 68), 'checkpoint 3 stays on the ledge, the gale harpy circles the steps'); }
  /* NO SOFT-LOCK, STATICALLY */
  { const bad = lintLines(JSON.parse(JSON.stringify(X))); ok(bad.length === 0, 'the line kit lints the extended level clean:\n  ' + bad.join('\n  ')); }
  { const kit = lineInit(JSON.parse(JSON.stringify(X))); ok(kit.list.length === X.lineKit.lines.length && kit.pitY / TS >= 275, 'the kit builds on the taller level (pit at row ' + (kit.pitY / TS).toFixed(0) + ')'); }
  { const sec = L.sections.map(s => s.id); ok(sec.includes('the-ore-line') && sec.includes('the-cave-apron') && L.sections.every(s => s.y0 < s.y1) && L.sections[0].y1 === L.H, 'the section bands: ' + sec.join(' ')); }
  console.log('  flag ON: ' + n + ' checks (level hash ' + qhash(L) + ', ' + L.H + ' rows, ' + cnt(L.ents, 'coin') + ' coins)');
  const hx = run('highlines.mjs', FULL ? ['--ext'] : ['--quick', '--ext'], { HL_DEBUG: '1' });
  const out = hx.stdout || ''; process.stdout.write(out.split('\n').filter(l => /^highlines:|sweep:|unreached/.test(l)).join('\n') + '\n');
  ok(hx.status === 0, 'tools/highlines.mjs --ext (every existing High Lines proof on the extended level) is green:\n' + ((hx.stderr || '').split('\n').filter(l => !/^\s+at /.test(l)).slice(0, 8).join('\n')));
  ok(/unreached landings: *\n/.test(out) && !/unreached landings: \S/.test(out), 'the sweep reached EVERY landing, the new ore stations and apron steps included (start to end)');
  console.log('hl-ext (flag ON): ' + n + ' checks');
}
