/* tools/line-kit.mjs - THE LINE KIT does what THE HIGH LINES asks (src/line-kit.js; work/claude/highlines-kit-plan.md; docs/linekit.md).
   NODE ONLY (no page, no browser). A small body physics flies the heroes' own numbers (src/hero-move.js) through the kit:
   1-9 the parts: grip winch (strike to haul, the ratchet never slides back), post winch (every seat on it), free/glide lines + brake, points,
       kick line to line, snap (told creak), the gondola set piece (falls onto the lower line, carries 1-4 seats), the counterweight (hopper
       stone, ride the weight down to send the cage up, home when empty), the wind (told, lee, tail/head, sway, air carry), foe hooks
       (lineCut drops a rider a level, foeRide, leadPoint, riderHit guard/knock), respawn (all home, winds calm >= LK.GRACE)
   10  every device back at rest on its own within 15 s (what the sweep assumes)
   11  THE SWEEP: every hero x 1-4 seats, from every checkpoint the exit is reached; from every state reached the exit is still reachable
       (or a pit = respawn) - no soft-lock, no stuck state; a drop from every point of every hand line lands on something
   12  lintLines: the lab is clean; every broken case is caught. */
import assert from 'node:assert/strict';
import { LK, TS, lineInit, riderStep, kitStep, kitStrike, windAt, windPush, platforms, lineRespawn, lineCut, foeRide, ridersOn, leadPoint, riderHit, lintLines, lineY, weightTops, cabFloor } from '../src/line-kit.js';
import { LINEKIT_LAB } from '../src/linekit-lab.js';
import { MOVE, HERO_MOVE_IDS, heroRunMul } from '../src/hero-move.js';

const DT = 1 / 60;
const lab = () => JSON.parse(JSON.stringify(LINEKIT_LAB)), labOK = lab;
let n = 0; const ok = (c, m) => { assert(c, m); n++; };
const t0 = Date.now();

/* ---------- the body physics (the heroes' own arc; landings are one-way tops) ---------- */
function statics(L) { return [...L.landings, ...(L.nets || [])].map((b, i) => ({ i, x0: b[0] * TS, x1: (b[2] + 1) * TS, top: b[1] * TS })); }
function mkBody(hero, x, y) { return { hero, x, y, vx: 0, vy: 0, ground: true, face: 1, atk: -1, dead: false, on: null }; }
function surfaces(kit, S) { return S.concat(platforms(kit).map(p => ({ i: p.id, x0: p.x0, x1: p.x1, top: p.top, plat: true }))); }
function phys(kit, b, inp, all) {
  if (b.lk || b.dead) return;
  const want = (inp.right ? 1 : 0) - (inp.left ? 1 : 0), cap = MOVE.RUN * heroRunMul(b.hero, b.ground);
  if (want) b.face = want;
  if (b.ground && inp.jumpPress) { b.vy = MOVE.JUMPV; b.ground = false; b.on = null; }
  const acc = b.ground ? MOVE.ACC_GROUND : MOVE.ACC_AIR, fr = b.ground ? MOVE.FRIC_GROUND : MOVE.FRIC_AIR;
  if (want) { const tg = want * cap; if (Math.abs(b.vx) > cap && Math.sign(b.vx) === want) b.vx -= Math.sign(b.vx) * Math.min(Math.abs(b.vx) - cap, MOVE.OVER_BLEED * DT); else b.vx += Math.sign(tg - b.vx) * Math.min(Math.abs(tg - b.vx), acc * DT); }
  else b.vx -= Math.sign(b.vx) * Math.min(Math.abs(b.vx), fr * DT);
  if (!b.ground) { const g = MOVE.GRAV * (Math.abs(b.vy) < MOVE.APEX_VY ? MOVE.APEX_G : b.vy > 0 ? MOVE.FALL_G : 1); b.vy = Math.min(MOVE.MAX_FALL, b.vy + g * DT); windPush(kit, b, DT); }
  const oy = b.y; b.x += b.vx * DT; if (!b.ground) b.y += b.vy * DT;
  if (!b.ground && b.vy >= 0) for (const s of all) if (b.x >= s.x0 && b.x < s.x1 && oy <= s.top + 0.5 && b.y >= s.top) { b.y = s.top; b.vy = 0; b.ground = true; b.on = s; break; }
  if (b.ground) { const s = all.find(q => b.x >= q.x0 && b.x < q.x1 && Math.abs(b.y - q.top) <= 1); if (!s) { b.ground = false; b.on = null; } else b.on = s; }
  if (b.y > kit.pitY) b.dead = true;
}
const hbOf = b => ({ l: b.face > 0 ? b.x : b.x - 26, r: b.face > 0 ? b.x + 26 : b.x, t: b.y - 22, b: b.y - 2 });
function tick(kit, bodies, inpOf, S, evs) {
  const ev = kitStep(kit, bodies, DT); const all = surfaces(kit, S);
  for (const b of bodies) { if (b.dead) continue; const inp = inpOf(b) || {};
    if (inp.strike) { inp.hb = hbOf(b); if (!b.lk) { const p = kitStrike(kit, inp.hb); if (p) ev.push({ t: 'strike', post: p.kind }); } }
    for (const e of riderStep(kit, b, inp, DT)) ev.push({ ...e, seat: bodies.indexOf(b) });
    phys(kit, b, inp, all); }
  if (evs) evs.push(...ev); return ev;
}
const run = (kit, bodies, s, inpOf, S, evs) => { for (let i = 0; i < Math.round(s / DT); i++) tick(kit, bodies, inpOf || (() => ({})), S, evs); };
const onLine = (kit, id, x, hero = 'knight') => { const z = kit.lines[id], b = mkBody(hero, x, lineY(z, x) + z.hang); b.ground = false; b.lk = { id, x, dir: z.dir, haul: 0, buf: 0, sway: 0, swayV: 0, v: 0 }; return b; };
const stand = (L, i, tx, hero = 'knight') => mkBody(hero, tx * TS + 8, L.landings[i][1] * TS);

/* 1. THE GRIP WINCH: no blow, no climb (the ratchet holds - it never slides back); each blow is a 40 px stroke; two buffer; the top puts you on the landing */
{ const L = lab(), S = statics(L), kit = lineInit(L), b = stand(L, 0, 12);
  run(kit, [b], 0.1, () => ({ up: true }), S); ok(b.lk && b.lk.id === 'W1', 'UP under W1 takes it standing');
  const x0 = b.lk.x, y0 = b.y; run(kit, [b], 5, () => ({}), S); ok(b.lk && b.lk.x === x0 && b.y === y0, 'five idle seconds on a winch: not a pixel back (the ratchet)');
  const ev = []; run(kit, [b], 1 / 60, () => ({ strike: true }), S, ev); run(kit, [b], 0.5, () => ({}), S, ev);
  ok(Math.abs(Math.abs(b.lk.x - x0) - LK.STROKE) < 1, 'one blow = one stroke (' + Math.abs(b.lk.x - x0).toFixed(1) + ' px)'); ok(ev.filter(e => e.t === 'stroke').length === 1, 'one stroke event (the crank SFX)');
  ok(b.lk.dir === 1 && lineY(kit.lines.W1, b.lk.x) < lineY(kit.lines.W1, x0), 'the stroke goes UP the line');
  const x1 = b.lk.x; for (let i = 0; i < 4; i++) run(kit, [b], 1 / 60, () => ({ strike: true }), S); run(kit, [b], 1.5, () => ({}), S);
  ok(Math.abs(Math.abs(b.lk.x - x1) - (1 + LK.STROKE_BUF) * LK.STROKE) < 1, 'four quick blows = ' + (1 + LK.STROKE_BUF) + ' strokes (one running + ' + LK.STROKE_BUF + ' buffered; the rest are lost)');
  const ev2 = []; run(kit, [b], 12, (q) => ({ strike: true }), S, ev2); ok(ev2.some(e => e.t === 'top' && e.id === 'W1'), 'striking all the way: the top');
  run(kit, [b], 1, () => ({}), S); ok(!b.lk && b.ground && b.on && b.on.i === 1, 'and the hop at the top lands you on L1'); }

/* 2. THE POST WINCH: strike the post at the low station and the line runs for every seat on it (1-4) */
{ const mk = () => { const L = lab(); L.lineKit.lines.find(d => d.id === 'W1').drive = 'post'; L.lineKit.lines.find(d => d.id === 'W1').posts = [[14, 75]]; return L; };
  ok(lintLines(mk()).length === 0, 'a post winch with its post at the station is clean: ' + lintLines(mk()));
  for (let seats = 1; seats <= 4; seats++) { const L = mk(), S = statics(L), kit = lineInit(L), bs = [];
    for (let i = 0; i < seats; i++) bs.push(onLine(kit, 'W1', 12 * TS + 6 + i * 3)); bs.forEach(b => (b.face = 1));
    const x0 = bs.map(b => b.lk.x); run(kit, bs, 1, () => ({}), S); ok(bs.every((b, i) => b.lk.x === x0[i]), seats + ' seat(s): no strike, no run');
    run(kit, bs, 1 / 60, (b) => (b === bs[0] ? { strike: true } : {}), S); run(kit, bs, LK.POST_RUN - 0.1, () => ({}), S);
    ok(bs.every((b, i) => b.lk && b.lk.x - x0[i] > LK.POST_SPEED * (LK.POST_RUN - 0.3)), seats + ' seat(s): one strike runs every seat up the line');
    run(kit, bs, 0.2, () => ({}), S); const x1 = bs.map(b => b.lk.x); run(kit, bs, 2, () => ({}), S); ok(bs.every((b, i) => b.lk.x === x1[i]), seats + ' seat(s): the run ends, the ratchet holds'); } }

/* 3. FREE / GLIDE LINES: downhill at their speed, a glide faster; BACK brakes; the low end lets you go onto the landing */
{ const L = lab(), S = statics(L), kit = lineInit(L);
  const g = onLine(kit, 'S1', 51 * TS); run(kit, [g], 0.2, () => ({}), S); ok(Math.abs(g.lk.v - LK.GLIDE) < 1e-6 && g.lk.dir === 1, 'a glide runs downhill at ' + LK.GLIDE);
  run(kit, [g], 0.2, () => ({ left: true }), S); ok(Math.abs(g.lk.v - LK.GLIDE * LK.BRAKE) < 1e-6, 'hold BACK: the brake');
  const f = onLine(kit, 'F_r', 67 * TS); run(kit, [f], 0.2, () => ({}), S); ok(f.lk.v === LK.FREE && f.lk.dir === -1, 'a free line runs downhill (west) at ' + LK.FREE);
  const ev = []; run(kit, [g], 3, () => ({}), S, ev); ok(ev.some(e => e.t === 'end') && g.ground && g.on.i === 8, 'S1 lets you go at its low end onto the secret ledge'); }

/* 4. POINTS: UP held past the board switches you to the branch; nothing held carries on; per seat */
{ const L = lab(), S = statics(L), kit = lineInit(L), a = onLine(kit, 'W2', 50 * TS), b = onLine(kit, 'W2', 50 * TS + 2);
  const ev = []; run(kit, [a, b], 1.2, (q) => (q === a ? { up: true, strike: true } : { strike: true }), S, ev);
  ok(a.lk && a.lk.id === 'S1' || ev.some(e => e.t === 'points' && e.seat === 0), 'seat 1 held UP: onto the side line S1');
  ok(b.lk && b.lk.id === 'W2', 'seat 2 held nothing: carried on up W2'); ok(ev.filter(e => e.t === 'points').length === 1, 'one points event (the clack)'); }

/* 5. KICK LINE TO LINE: a kick carries the line's speed; another line is caught by touch; the line just left is not (only by UP) */
{ const L = lab(); L.lineKit.lines.push({ id: 'K1', kind: 'free', a: [20, 30], b: [32, 33] }, { id: 'K2', kind: 'free', a: [30, 31.5], b: [44, 34.5] });
  L.lineKit.anchors.push([20, 30], [32, 33], [30, 31.5], [44, 34.5]); const S = statics(L), kit = lineInit(L), b = onLine(kit, 'K1', 22 * TS);
  run(kit, [b], 0.3, () => ({}), S); const ev = []; run(kit, [b], 1 / 60, () => ({ jumpPress: true }), S, ev); ok(ev.some(e => e.t === 'kick') && !b.lk && b.vy < LK.KICK_VY + 25 && b.vx > LK.FREE * 0.7, 'JUMP kicks off with the line\'s speed');
  run(kit, [b], 1.2, () => ({}), S, ev); ok(b.lk && b.lk.id === 'K2', 'and the next line down the way is caught by touch');
  ok(!ev.some(e => e.t === 'take' && e.id === 'K1'), 'the line just left is not re-caught by touch'); }

/* 6. SNAP: the creak is told >= LK.SNAP_TELL before it parts; a rider who jumps in the tell is safe, one who stays falls a level; restrung later */
{ const L = lab(); L.lineKit.lines.find(d => d.id === 'LO').snap = { at: 52 }; const S = statics(L), kit = lineInit(L), b = onLine(kit, 'LO', 38 * TS);
  const ev = []; let tCreak = -1, tSnap = -1; for (let i = 0; i < 600 && tSnap < 0; i++) { const e = tick(kit, [b], () => ({}), S, ev); if (tCreak < 0 && e.some(q => q.t === 'creak')) tCreak = i * DT; if (e.some(q => q.t === 'snap')) tSnap = i * DT; }
  ok(tCreak >= 0 && tSnap - tCreak >= LK.SNAP_TELL - DT - 1e-9, 'the creak comes ' + (tSnap - tCreak).toFixed(2) + ' s before the snap');
  run(kit, [b], 0.1, () => ({}), S, ev); ok(!b.lk && ev.some(e => e.t === 'parted'), 'a rider still on it falls'); run(kit, [b], 3, () => ({}), S, ev); ok(!b.dead, 'and is caught below (a level down, not a pit)');
  run(kit, [b], LK.RESTRING, () => ({}), S, ev); ok(ev.some(e => e.t === 'restrung' && e.id === 'LO'), 'strung again after ' + LK.RESTRING + ' s'); }

/* 7. THE GONDOLA SET PIECE, 1-4 seats: board, it goes, it creaks (told), it snaps, it falls and hooks onto LO, docks at L6 with everyone in it */
for (let seats = 1; seats <= 4; seats++) { const L = lab(), S = statics(L), kit = lineInit(L), bs = [];
  for (let i = 0; i < seats; i++) bs.push(stand(L, 5, 22 + i * 0.5)); const ev = [];
  let ph = 'walk'; run(kit, bs, 14, (b) => { const c = kit.cabs[0]; if (ph === 'walk' && bs.every(q => q.x > c.x - 18)) ph = 'ride'; return ph === 'walk' && b.x < c.x - 6 ? { right: true } : {}; }, S, ev);
  const t = ev.map(e => e.t), c = kit.cabs[0];
  ok(['cabBoard', 'cabGo', 'creak', 'snap', 'cabCatch', 'cabDock'].every((k, i, a) => t.indexOf(k) >= 0 && (i === 0 || t.indexOf(k) > t.indexOf(a[i - 1]))), seats + ' seat(s): board -> go -> creak -> snap -> catch -> dock (' + t.filter(k => k.startsWith('cab') || k === 'creak' || k === 'snap').join(',') + ')');
  ok(c.st === 'dock' && c.on === 'LO', seats + ' seat(s): docked on LO'); ok(bs.every(b => !b.dead && Math.abs(b.y - cabFloor(c)) <= 1), seats + ' seat(s): everyone rode it down in the cab');
  run(kit, bs, 0.6, () => ({ right: true }), S); run(kit, bs, 0.5, () => ({}), S); ok(bs.every(b => b.ground && b.on && b.on.i === 6), seats + ' seat(s): and walks off onto L6');
  run(kit, bs, LK.RESTRING, () => ({}), S, ev); ok(ev.some(e => e.t === 'cabHome'), seats + ' seat(s): empty, the cab is home again for the next one'); }
{ const L = lab(), S = statics(L), kit = lineInit(L), b = stand(L, 5, 24); const ev = []; let jumped = false;   /* jump out mid-fall: you leave the cab, the cab goes on */
  run(kit, [b], 12, (q) => { const c = kit.cabs[0]; if (!jumped && c.st === 'fall') { jumped = true; return { jumpPress: true }; } return q.x < c.x - 6 && c.st === 'rest' ? { right: true } : {}; }, S, ev);
  ok(jumped && !b.dead, 'jumping out of the falling cab: you fall clear and are caught (not a pit)'); }

/* 8. THE COUNTERWEIGHT: the hopper stone sends the cage (and 1-4 seats in it) up; a seat riding A down sends B up; empty, home */
for (let seats = 1; seats <= 4; seats++) { const L = lab(), S = statics(L), kit = lineInit(L), W = kit.weights[0], bs = [];
  for (let i = 0; i < seats; i++) bs.push(mkBody('knight', 8 * TS + 10 + i * 12, 41 * TS)); run(kit, bs, 0.2, () => ({}), S);
  run(kit, bs, 3, () => ({}), S); ok(W.k === 0, seats + ' seat(s) in the cage: it stays down (they are heavier than A\'s tare)');
  const last = bs[bs.length - 1]; last.face = 1; last.x = 11 * TS + 12; run(kit, bs, 1 / 60, (b) => (b === last ? { strike: true } : {}), S);
  ok(W.stones === LK.STONE, seats + ' seat(s): the hopper drops the stone'); run(kit, bs, 6, () => ({}), S);
  ok(W.k === 1 && bs.every(b => Math.abs(b.y - 25 * TS) <= 1), seats + ' seat(s): the stone outweighs the party - the cage is up at L5');
  run(kit, bs, 2, () => ({ right: true }), S); ok(bs.every(b => b.on && b.on.i === 5), seats + ' seat(s): everyone steps off onto L5');
  run(kit, bs, LK.CW_RETURN + 16 * TS / LK.CW_HOME + 0.5, () => ({}), S); ok(W.k === 0 && W.stones === 0, seats + ' seat(s): empty, the stones roll out and the pair goes home'); }
{ const L = lab(), S = statics(L), kit = lineInit(L), W = kit.weights[0];   /* co-op: one rides A down from LA1, the cage carries the other up */
  const a = mkBody('knight', 3 * TS + 8, 25 * TS), b = mkBody('knight', 9 * TS + 8, 41 * TS); run(kit, [a, b], 6, () => ({}), S);
  ok(W.k === 1 && Math.abs(b.y - 25 * TS) <= 1 && Math.abs(a.y - 41 * TS) <= 1, 'co-op: one seat rides weight A down and sends the other up in the cage');
  const c = mkBody('knight', 3 * TS + 8, 25 * TS), L2 = lab(), k2 = lineInit(L2); run(k2, [c], 6, () => ({}), statics(L2)); ok(k2.weights[0].k === 1, 'solo: riding A down sends the empty cage up'); }

/* 9. WIND: told >= MIN_TELL before every gust; a lee is calm; tail/head on a glide; riders sway in a gust and settle in calm; the air carries */
{ const L = lab(), S = statics(L), kit = lineInit(L), ev = []; run(kit, [], 12, () => ({}), S, ev);
  const seq = ev.filter(e => e.id === 'gorge').map(e => e.t); for (let i = 1; i < seq.length; i++) if (seq[i] === 'gust') ok(seq[i - 1] === 'gustTell', 'every gust is told');
  ok(seq.filter(s => s === 'gust').length >= 2, 'it blows on its period');
  const w = kit.winds[0]; ok(windAt(kit, 66 * TS, 47 * TS) === null && windAt(kit, 37 * TS, 50 * TS) === null, 'the lee rocks are calm');
  w.t = 0.1; ok(windAt(kit, 50 * TS, 45 * TS).blow, 'in the gorge mid-gust it blows');
  const g = onLine(kit, 'G1', 56 * TS); w.t = 0.05; tick(kit, [g], () => ({}), S); ok(Math.abs(g.lk.v - LK.GLIDE * LK.TAIL) < 1e-6, 'G1 runs west with a west wind: tailwind x' + LK.TAIL);
  const L2 = lab(); L2.lineKit.winds[0].dir = 1; const k2 = lineInit(L2), g2 = onLine(k2, 'G1', 56 * TS); k2.winds[0].t = 0.05; tick(k2, [g2], () => ({}), S); ok(Math.abs(g2.lk.v - LK.GLIDE * LK.HEAD) < 1e-6, 'against it: headwind x' + LK.HEAD);
  const k3 = lineInit(lab()), s = onLine(k3, 'G1', 56 * TS); s.lk.v = 0; k3.lines.G1.speed = 1; k3.winds[0].t = 0; let peak = 0;
  for (let i = 0; i < 60; i++) { tick(k3, [s], () => ({}), S); peak = Math.max(peak, Math.abs(s.lk.sway)); } ok(peak > 3 && peak <= 10, 'a gust swings the rider (' + peak.toFixed(1) + ' px, cap 10)');
  for (let i = 0; i < 150; i++) { k3.winds[0].t = 2.5; tick(k3, [s], () => ({}), S); } ok(Math.abs(s.lk.sway) < 1, 'and calm settles him');
  const k4 = lineInit(lab()), a = mkBody('knight', 50 * TS, 44 * TS); a.ground = false; k4.winds[0].t = 0; windPush(k4, a, 0.2); ok(a.vx < -30, 'an airborne body in the gust is carried with it'); }

/* 10. FOE HOOKS: THE HOOKJACK cuts W4 - the rider drops a level (onto LO), never a pit; foeRide; archers lead; guard pushes back, a hit knocks off */
{ const L = lab(), S = statics(L), kit = lineInit(L);
  for (const tx of [47, 52, 57, 62]) { const k = lineInit(lab()), b = onLine(k, 'W4', tx * TS); lineCut(k, 'W4'); const ev = []; run(k, [b], 3, () => ({}), S, ev);
    ok(!b.dead && ev.some(e => e.t === 'parted') && (b.ground || (b.lk && b.lk.id !== 'W4')), 'W4 cut under a rider at x ' + tx + ': he drops a level (' + (b.lk ? 'caught ' + b.lk.id : 'landed on ' + b.on.i) + ')'); }
  const e = { line: 'W4', x: 50 * TS, dir: 1 }; let turned = false; for (let i = 0; i < 600; i++) if (foeRide(kit, e, DT) === 'turn') turned = true; ok(turned && e.y === lineY(kit.lines.W4, e.x) + kit.lines.W4.hang, 'foeRide: a crank-trolley rides either way and turns at the ends');
  lineCut(kit, 'W4'); ok(foeRide(kit, e, DT) === 'fell' && e.off, 'a foe on a cut line falls too');
  const k2 = lineInit(lab()), r = onLine(k2, 'LO', 40 * TS); tick(k2, [r], () => ({}), S); const p = leadPoint(k2, r, 0.5); run(k2, [r], 0.5, () => ({}), S);
  ok(Math.abs(p.x - r.x) < 3 && Math.abs(p.y - r.y) < 3, 'leadPoint: where the rider is 0.5 s later (an archer\'s ring)'); ok(ridersOn(k2, [r], 'LO').length === 1, 'ridersOn finds him');
  const x0 = r.lk.x; ok(riderHit(k2, r, { guard: true }) === 'guarded' && r.lk && Math.abs(r.lk.x - (x0 - LK.GUARD_PUSH)) < 1e-6, 'a held guard keeps the grip, pushed back ' + LK.GUARD_PUSH + ' px');
  ok(riderHit(k2, r, {}) === 'knocked' && !r.lk && r.lkHard, 'a hit knocks him off (and he is not re-caught at once)');
  const k3 = lineInit(lab()), w = onLine(k3, 'W4', 60 * TS); tick(k3, [w], () => ({ strike: true }), S); const lp = leadPoint(k3, w, 5);
  ok(Math.abs((60 * TS - lp.x) - LK.STROKE * 1) <= LK.STROKE + 1, 'a winch rider\'s lead stops where his strokes end (no ring far up the line)'); }

/* 11. RESPAWN: every line strung, the cab and the weights home, every seat off the lines, every wind calm >= LK.GRACE and told before it blows */
{ const L = lab(), S = statics(L), kit = lineInit(L), bs = [onLine(kit, 'W2', 45 * TS), onLine(kit, 'G1', 60 * TS)];
  lineCut(kit, 'W4'); kit.cabs[0].st = 'gone'; kit.weights[0].k = 0.6; kit.weights[0].stones = LK.STONE; kit.winds[0].t = 0;
  lineRespawn(kit, bs); ok(!kit.lines.W4.cut && kit.cabs[0].st === 'rest' && kit.weights[0].k === 0 && !kit.weights[0].stones, 'respawn: lines strung, cab and weights home');
  ok(bs.every(b => !b.lk), 'respawn: no seat is left on a line'); const ev = []; let first = -1;
  for (let i = 0; i < 600 && first < 0; i++) { const e = tick(kit, [], () => ({}), S, ev); if (e.some(q => q.t === 'gust')) first = i * DT; }
  ok(first >= LK.GRACE - 0.05, 'respawn: the first gust after ' + first.toFixed(2) + ' s (>= ' + LK.GRACE + ')'); ok(ev.findIndex(e => e.t === 'gustTell') < ev.findIndex(e => e.t === 'gust'), 'and it is told first'); }

/* 12. EVERY DEVICE GOES HOME ON ITS OWN (the sweep's world-at-rest assumption): from its worst state, nobody on it, home within 15 s */
{ const L = lab(), S = statics(L), kit = lineInit(L), kit0 = lineInit(lab());
  lineCut(kit, 'W4'); kit.lines.GD.cut = LK.RESTRING; kit.cabs[0].st = 'dock'; kit.cabs[0].on = 'LO'; kit.weights[0].k = 1; kit.weights[0].stones = LK.STONE;
  run(kit, [], 15, () => ({}), S);
  ok(!kit.lines.W4.cut && !kit.lines.GD.cut && kit.cabs[0].st === 'rest' && kit.cabs[0].x === kit0.cabs[0].x && kit.weights[0].k === 0, 'every device is home within 15 s, nobody touching it'); }

/* 13. THE SWEEP: every hero x 1-4 seats. Nodes = landings (world at rest - proven in 12) and line catches (line, 32 px bucket).
   From a landing: stand UP, hop, run-jump L/R, walk off L/R, board a moving floor (strike or not, wait, then leave L/R); from a line: ride on
   (striking a grip winch, the post of a post winch) to 0/25/50/75% of what is left then kick / kick-back / kick-forward / drop, or ride to the end,
   with and without UP at points; each at two moments of every wind (calm, a gust). A pit is a respawn (fine); a stuck state is a failure. */
/* the graph read: who can still reach the exit, who can only die (a pit = respawn), who can do neither (A SOFT-LOCK) */
function analyze(edges, seen, exitKey) {
  const canExit = new Set([exitKey]); let grew = true;
  while (grew) { grew = false; for (const [k, s] of edges) if (!canExit.has(k) && [...s].some(t => canExit.has(t))) { canExit.add(k); grew = true; } }
  const canPit = new Set(); grew = true; while (grew) { grew = false; for (const [k, s] of edges) if (!canPit.has(k) && [...s].some(t => t === 'pit' || canPit.has(t))) { canPit.add(k); grew = true; } }
  return { canExit, lock: [...seen].filter(k => k !== exitKey && !canExit.has(k) && !canPit.has(k)), deathOnly: [...seen].filter(k => k !== exitKey && !canExit.has(k) && canPit.has(k)) };
}
function sweep(hero, seats, lab = labOK) {
  const L0 = lab(), S = statics(L0), edges = new Map(), seen = new Set(), queue = [], stuck = [];
  const exitI = L0.landings.findIndex(b => b[1] >= L0.exit[1] && b[1] <= L0.exit[3] + 1 && b[0] <= L0.exit[2] && b[2] >= L0.exit[0]);
  const add = (from, to) => { if (!edges.has(from)) edges.set(from, new Set()); edges.get(from).add(to); if (to !== 'pit' && to !== 'stuck' && !seen.has(to)) { seen.add(to); queue.push(to); } };
  const phases = (kit, k) => { for (const w of kit.winds) w.t = k ? 0.01 : w.on + 0.01; };
  function simulate(start, script, ph) {   /* -> node key | 'pit' | 'stuck' */
    const L = lab(), kit = lineInit(L); phases(kit, ph); const bs = start(kit);
    const st = { t: 0, armed: false }; let ground = 0;
    for (let i = 0; i < 60 * 30; i++) {
      st.t = i * DT; const ev = tick(kit, bs, (b) => script(b, st, kit, bs), S); const lead = bs[0];
      if (lead.dead) return 'pit';
      if (st.armed) { if (lead.lk) return 'Z:' + lead.lk.id + ':' + Math.floor(lead.lk.x / 32);
        if (lead.ground && lead.on && Math.abs(lead.vx) < 1 && (!lead.on.plat || lead.y === st.py)) { if (++ground > 15) { if (!lead.on.plat) return 'L:' + lead.on.i;
          /* still on a still moving floor: it is the landing it stands level with (walk across), or a dead end */
          const o = lead.on, j = S.findIndex(q => Math.abs(q.top - o.top) <= 1 && q.x0 <= o.x1 + 16 && q.x1 >= o.x0 - 16); if (j >= 0) return 'L:' + S[j].i; if (ground > 600) return 'stuck'; } } else ground = 0; st.py = lead.y; }
    }
    return 'stuck';
  }
  const party = (mk) => (kit) => { const bs = []; for (let s = 0; s < seats; s++) bs.push(mk(kit, s)); return bs; };
  function expandLanding(i) {
    const b = L0.landings[i] || L0.nets[i - L0.landings.length], isNet = i >= L0.landings.length;
    const y = b[1] * TS, xs = []; for (let x = b[0] * TS + 4; x < (b[2] + 1) * TS - 2; x += 16) xs.push(x);
    const startAt = (x) => party((kit, s) => mkBody(hero, Math.min((b[2] + 1) * TS - 2, x + s * 3), y));
    const scripts = [
      ['up', () => (q, st) => { st.armed = true; return st.t < 0.3 ? { up: true } : {}; }],
      ['hop', () => (q, st) => { st.armed = st.t > 0.05; return { up: true, jumpPress: st.t === 0 }; }],
      ['jumpL', () => (q, st) => { st.armed = st.t > 0.05; return { up: true, left: true, jumpPress: st.t === 0 }; }],
      ['jumpR', () => (q, st) => { st.armed = st.t > 0.05; return { up: true, right: true, jumpPress: st.t === 0 }; }],
      ['walkL', () => (q, st) => { st.armed = !q.ground || st.t > 4; return st.t < 4 && q.ground ? { left: true } : {}; }],
      ['walkR', () => (q, st) => { st.armed = !q.ground || st.t > 4; return st.t < 4 && q.ground ? { right: true } : {}; }],
    ];
    for (const ph of [0, 1]) for (const x of xs) for (const [, mk] of scripts) add('L:' + i, simulate(startAt(x), mk(), ph));
    /* the moving floors beside this landing: board, (strike), wait till it has carried you and stopped, leave either way (UP held for a line) */
    const kitR = lineInit(lab());
    for (const p of platforms(kitR)) { if (Math.abs(p.top - y) > 1 || !(p.x1 >= b[0] * TS - 16 && p.x0 <= (b[2] + 1) * TS + 16)) continue;
      const cx = (p.x0 + p.x1) / 2, ex = cx < b[0] * TS ? b[0] * TS + 4 : (b[2] + 1) * TS - 4;
      const post = kitR.posts.find(o => o.x > p.x0 - 48 && o.x < p.x1 + 48 && Math.abs(o.y - (p.top - 12)) < 40);
      for (const strike of post ? [false, true] : [false]) for (const wait of [1, 6, 12]) for (const out of ['L', 'R', 'jL', 'jR']) {
        const sc = (q, st, kit, bs) => { const P = platforms(kit).find(z => z.id === p.id); const pc = P ? (P.x0 + P.x1) / 2 : cx;
          const striker = strike && q === bs[seats - 1] && post, tx = striker ? Math.max(P.x0 + 3, Math.min(P.x1 - 3, post.x - Math.sign(post.x - pc) * 14)) : pc;
          if (!st.on) { if (bs.every(z => z.on && z.on.plat) && Math.abs(bs[seats - 1].x - (strike && post ? Math.max(P.x0 + 3, Math.min(P.x1 - 3, post.x - Math.sign(post.x - pc) * 14)) : bs[seats - 1].x)) <= 4) { st.on = st.t; } else { const d = tx - q.x; return Math.abs(d) > 3 ? (d > 0 ? { right: true } : { left: true }) : {}; } }
          const el = st.t - st.on; if (strike && el > 0.2 && el < 0.3) { if (striker) q.face = Math.sign(post.x - q.x) || 1; return { strike: !!striker }; }
          if (el < wait) return {}; st.armed = true; const side = out.endsWith('L') ? 'left' : 'right';
          return { [side]: el - wait < 0.6, up: true, jumpPress: out.startsWith('j') && Math.abs(el - wait) < DT / 2 }; };
        add('L:' + i, simulate(startAt(ex), sc, 0)); } }
  }
  function expandLine(key) {
    const [, id, bk] = key.split(':'); const L = lab(), kit0 = lineInit(L), z = kit0.lines[id]; const x0 = Math.max(z.xa + 9, Math.min(z.xb - 9, +bk * 32 + 16));
    const remain = Math.max(0, z.dir > 0 ? z.xb - LK.END_PAD - x0 : x0 - z.xa - LK.END_PAD);
    const start = party((kit, s) => onLine(kit, id, x0 - z.dir * s * 3, hero));
    const pts = z.points.length ? [false, true] : [false];
    const post = z.d.drive === 'post';
    for (const ph of [0, 1]) for (const up of pts) {
      for (const f of [0, 0.25, 0.5, 0.75]) for (const act of ['kick', 'kickB', 'kickF', 'drop']) {
        const sc = (q, st, kit, bs) => { const r = q.lk;
          if (!st.done) { const lead = bs[0]; const gone = !lead.lk || lead.lk.id !== id ? 1e9 : Math.abs(lead.lk.x - x0);
            if (gone >= f * remain || st.t > 20) { st.done = st.t; } else return { up, strike: (z.kind === 'winch' && !post && (Math.round(st.t * 60) % 9 === 0)) || (post && Math.round(st.t * 60) % 30 === 0) }; }
          const el = st.t - st.done; st.armed = el > 0.05; const fwd = (q.lk ? q.lk.dir : z.dir) > 0 ? 'right' : 'left', back = fwd === 'right' ? 'left' : 'right';
          if (act === 'drop') return el < DT / 2 ? { down: true } : {};
          const o = { up: true, jumpPress: el < DT / 2 }; if (act === 'kickB') o[back] = true; if (act === 'kickF') o[fwd] = true; return o; };
        add(key, simulate(start, sc, ph)); }
      const ride = (q, st) => { st.armed = !q.lk || q.lk.id !== id; return { up, strike: (z.kind === 'winch' && !post && Math.round(st.t * 60) % 9 === 0) || (post && Math.round(st.t * 60) % 30 === 0) }; };
      add(key, simulate(start, ride, ph)); }
  }
  for (const c of L0.checkpoints) { const i = L0.landings.findIndex(b => c.x >= b[0] && c.x <= b[2] && c.y === b[1]); seen.add('L:' + i); queue.push('L:' + i); }
  while (queue.length) { const k = queue.shift(); if (k.startsWith('L:')) expandLanding(+k.slice(2)); else expandLine(k); }
  for (const [k, s] of edges) if (s.has('stuck')) stuck.push(k);
  const { canExit, lock, deathOnly } = analyze(edges, seen, 'L:' + exitI);
  const cps = L0.checkpoints.map(c => 'L:' + L0.landings.findIndex(b => c.x >= b[0] && c.x <= b[2] && c.y === b[1]));
  return { nodes: seen.size, exitFrom: cps.filter(k => canExit.has(k)).length, cps: cps.length, lock, deathOnly, stuck, secret: seen.has('L:8'), edges };
}
{ const rows = [];
  for (const hero of HERO_MOVE_IDS) for (let seats = 1; seats <= 4; seats++) {
    const R = sweep(hero, seats); rows.push(hero + 'x' + seats + ' ' + R.nodes + 'n');
    ok(R.exitFrom === R.cps, hero + ' x' + seats + ': the exit from every checkpoint (' + R.exitFrom + '/' + R.cps + ')');
    ok(!R.lock.length, hero + ' x' + seats + ': no soft-lock (' + R.lock.join(' ') + ')'); ok(!R.stuck.length, hero + ' x' + seats + ': no stuck state (' + R.stuck.join(' ') + ')');
    ok(R.secret, hero + ' x' + seats + ': the side line reaches the secret ledge');
    if (R.deathOnly.length) console.log('  note ' + hero + ' x' + seats + ': states whose only way on is a pit (respawn): ' + R.deathOnly.join(' '));
  }
  console.log('  sweep: ' + rows.join(', '));
  /* and the sweep is not blind: a room with no hopper never gets past the weight house; a closed loop is a soft-lock */
  const noHopper = () => { const L = labOK(); delete L.lineKit.weights[0].hopper; L.lineKit.weights[0].free = true; return L; };
  const R1 = sweep('knight', 1, noHopper); ok(R1.exitFrom < R1.cps, 'the sweep sees a missing hopper: the exit from ' + R1.exitFrom + '/' + R1.cps + ' checkpoints');
  const E = new Map([['A', new Set(['B'])], ['B', new Set(['A', 'X'])], ['C', new Set(['D'])], ['D', new Set(['C'])], ['P', new Set(['pit'])]]);
  const G = analyze(E, new Set(['A', 'B', 'C', 'D', 'P']), 'X'); ok(G.lock.join() === 'C,D' && G.deathOnly.join() === 'P' && G.canExit.has('A'), 'the graph read finds a closed loop as a soft-lock, a pit-only state as respawn'); }

/* 14. EVERY DROP LANDS ON SOMETHING: DOWN at every 16 px of every hand line (calm and gust) - a line, a net or a landing, never the pit */
{ const L = lab(), S = statics(L), kit0 = lineInit(L); let drops = 0;
  for (const z of kit0.list) { if (z.cabLine || z.d.pitOk) continue;
    for (let x = z.xa + 12; x <= z.xb - 12; x += 16) for (const ph of [0, 1]) { const kit = lineInit(lab()); for (const w of kit.winds) w.t = ph ? 0.01 : w.on + 0.01;
      const b = onLine(kit, z.id, x); run(kit, [b], 1 / 60, () => ({ down: true }), S); let caught = false;
      for (let i = 0; i < 60 * 6 && !b.dead && !caught; i++) { tick(kit, [b], () => ({}), S); if (b.lk || b.ground) caught = true; }
      ok(caught && !b.dead, 'a drop off ' + z.id + ' at x ' + (x / TS).toFixed(1) + ' lands on something'); drops++; } }
  console.log('  drops: ' + drops + ' (every hand line, every 16 px, calm + gust)'); }

/* 15. LINT: the lab is clean; every broken case is caught */
{ ok(lintLines(lab()).length === 0, 'the lab lints clean: ' + lintLines(lab()).join(' | '));
  const cases = [
    ['an unknown kind', L => { L.lineKit.lines[0].kind = 'zip'; }, /unknown kind/],
    ['a duplicate id', L => { L.lineKit.lines[1].id = 'W1'; }, /duplicate/],
    ['a line end on nothing', L => { L.lineKit.lines.find(d => d.id === 'LO').a = [30, 14]; }, /hangs from nothing/],
    ['too steep', L => { L.lineKit.lines.push({ id: 'X', kind: 'free', a: [12, 75], b: [14, 62] }); }, /steeper/],
    ['a winch with no landing at the top', L => { L.lineKit.lines.find(d => d.id === 'W3').b = [20, 30]; L.lineKit.anchors.push([20, 30]); }, /step off/],
    ['a post winch with no post', L => { L.lineKit.lines.find(d => d.id === 'W1').drive = 'post'; }, /no post in reach/],
    ['points to a missing line', L => { L.lineKit.lines.find(d => d.id === 'W2').points[0].to = 'NOPE'; }, /missing line/],
    ['points where the lines do not meet', L => { L.lineKit.lines.find(d => d.id === 'W2').points[0].at = 58; }, /do not meet/],
    ['a gondola that falls into the pit', L => { L.lineKit.lines.find(d => d.id === 'GD').snap.at = 30; }, /gondola/],
    ['a gondola onto a missing line', L => { L.lineKit.lines.find(d => d.id === 'GD').cab.onto = 'NOPE'; }, /gondola/],
    ['a cut line with nothing under it', L => { L.lineKit.lines.find(d => d.id === 'G1').cut = true; L.lineKit.lines.find(d => d.id === 'W2').a = [40, 61]; L.nets = [L.nets[0]]; L.lineKit.lines = L.lineKit.lines.filter(d => d.id !== 'W2' && d.id !== 'S1' && d.id !== 'F_r' && d.id !== 'W1c'); }, /nothing under it/],
    ['a secret line to an empty ledge', L => { L.secrets = []; }, /secret/],
    ['a weight with uneven travel', L => { L.lineKit.weights[0].a.bot = 40; }, /travel differently/],
    ['a weight cab with no landing at a stop', L => { L.lineKit.weights[0].a.x0 = 3; L.lineKit.weights[0].a.x1 = 6; L.landings = L.landings.filter((b, i) => i !== 9 && i !== 10); }, /no landing beside/],
    ['a weight nothing works', L => { delete L.lineKit.weights[0].hopper; }, /no hopper/],
    ['an untold gust', L => { L.lineKit.winds[0].told = 0.5; }, /told/],
    ['a gust with no calm', L => { L.lineKit.winds[0].on = 3.5; }, /calm/],
    ['a wind section with no lee', L => { L.lineKit.lee = []; }, /no lee rock/],
    ['a winch into the wind', L => { L.lineKit.winds[0].box = [42, 38, 60, 56]; }, /winch .* wind section/],
    ['a checkpoint in the air', L => { L.checkpoints.push({ x: 30, y: 40 }); }, /does not stand/],
    ['a checkpoint in the wind', L => { L.landings.push([48, 44, 52, 45]); L.checkpoints.push({ x: 50, y: 44 }); }, /in the wind/],
    ['no exit', L => { delete L.exit; }, /no exit/],
  ];
  { const L = lab(); L.lineKit.winds[0].box = [42, 38, 60, 56]; L.lineKit.winds[0].exam = true; ok(!lintLines(L).some(q => /winch .* wind section/.test(q)), 'an EXAM wind section (exam: true) may carry a winch'); }
  for (const [nm, f, re] of cases) { const L = lab(); f(L); const bad = lintLines(L); ok(bad.some(s => re.test(s)), 'lint catches ' + nm + ' (got: ' + (bad.join(' | ') || 'nothing') + ')'); } }

/* 16. THE KIT NEVER TOUCHES THE SHARED ZIP LINE: no kit line in L.zipLines, and zipline.js is not imported */
{ const L = lab(); lineInit(L); ok(!L.zipLines, 'lineInit leaves L.zipLines alone (src/zipline.js and its six levels untouched)'); }

console.log('line-kit: ' + n + ' checks OK (' + ((Date.now() - t0) / 1000).toFixed(1) + ' s)');
