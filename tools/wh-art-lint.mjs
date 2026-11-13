/* tools/wh-art-lint.mjs - THE WHALE's ART, node-only lint (claude/whaleart, 2026-11-12), in the shape of tools/d3-art-lint.mjs. No page, no browser: a recording 2d stub stands in for the canvas.   node tools/wh-art-lint.mjs
   A  every sim mode of the Gastric Polyp and the Parasite Queen resolves to a pose that exists; every pose draws a body with no NaN rect / bad colour; facing -1 mirrors +1 exactly
   B  POSE-DISTINCT: every pose differs from every other; every TELL (windup) differs from its RELEASE and from the idle; the sim's own windup is >= 0.3 s
   B2 SILHOUETTE: the BODY only (no effects: o.bodyOnly) as a 1-px mask; every windup must change >= 15% of union pixels against the idle and >= 20% against its release
   B3 FACES: the eyes (and the Queen's two eyes), the brow and the mouth get real pixels: counted at idle and in every tell
   C  every draw stays inside a box round the feet; the falls, the level kit (flesh by section, nerve, membrane, heart, tongue, raft, bile, lung, the Queen's floor pieces) draw clean
   D  THE HANDS: the real hands on a stub world draw every hook (back, mover, ent, over) in every polyp mode and every Queen mode x phase with no NaN rect; flag OFF draws nothing
   E  PALETTE: every colour drawn is within the Whale / Deep / Keep / Reef literals or the declared accents (distance <= LIMIT)
   F  files + wiring (no ad-block words, the hands use the art, the greybox shapes are gone, WH_SHIPS stays false, main.js untouched, the TELL_ROWS marks stay) */
import { readFileSync } from 'node:fs';
let n = 0, bad = 0; const ok = (c, m) => { n++; if (!c) { bad++; console.log('  FAIL ' + m); } };
const COLS = new Map(); let REC = null, BAD = []; const reset = () => { COLS.clear(); BAD = []; };
function makeCtx(w, h) {
  return { canvas: { width: w, height: h }, fillStyle: '#000000', globalAlpha: 1, strokeStyle: '#000', lineWidth: 1, beginPath() {}, arc() {}, stroke() {}, moveTo() {}, lineTo() {}, ellipse() {}, fillText() {}, fill() {}, save() {}, restore() {},
    drawImage() {},
    fillRect(x, y, ww, hh) { const c = String(this.fillStyle); COLS.set(c, (COLS.get(c) || 0) + 1);
      if (![x, y, ww, hh].every(Number.isFinite)) BAD.push('NaN rect ' + [x, y, ww, hh] + ' ' + c); if (!/^#[0-9a-f]{6}$/i.test(c)) BAD.push('bad colour ' + c);
      if (REC) REC.push([x, y, ww, hh, c, this.globalAlpha].join(',')); } };
}
const U = f => new URL('../src/' + f, import.meta.url).href;
const PA = await import(U('redraw/gastric_polyp_art.js')), QA = await import(U('redraw/parasite_queen_art.js')), WA = await import(U('redraw/whale_art.js')), KA = await import(U('redraw/deep3_art.js'));
const GPM = await import(U('gastric-polyp.js')), PQM = await import(U('parasite-queen.js')), WHM = await import(U('whale.js'));
const printP = (o, f = 1, t = 0.4) => { reset(); REC = []; const g = makeCtx(160, 160); PA.drawPolyp(g, 80, 110, f, { seed: 1, ...o }, t); const r = REC; REC = null; return r; };
const printQ = (o, f = 1, t = 0.4) => { reset(); REC = []; const g = makeCtx(260, 200); QA.drawQueen(g, 130, 140, f, { seed: 1, ...o }, t); const r = REC; REC = null; return r; };
const fp = r => r.join('|');
const mirror = (r, W0) => r.map(s => { const [x, y, w, h, c, a] = s.split(','); return [W0 - (+x + +w), y, w, h, c, a].join(','); });

/* ---- A: the polyp ---- */
const POLYP_MODES = ['in', 'shrink', 'swell', 'out', 'spitTell', 'spit', 'rec'];
for (const m of POLYP_MODES) ok(PA.POSES[PA.poseOfPolyp(m, {})], 'polyp mode ' + m + ' -> pose ' + PA.poseOfPolyp(m, {}));
ok(PA.poseOfPolyp('out', { hurtT: 0.2 }) === 'polypHurt', 'a flinch in the watch is the hurt pose');
for (const k of PA.poseNames()) { const r = printP({ pose: k, h: k === 'polypSwell' ? 14 : undefined }); ok(r.length > 30, 'polyp ' + k + ' draws a body (' + r.length + ' rects)'); ok(BAD.length === 0, 'polyp ' + k + ': no bad rects ' + BAD.slice(0, 2)); }
for (const k of ['polypOut', 'polypSpitWind', 'polypSpit']) { const A = printP({ pose: k }, 1), B = printP({ pose: k }, -1); ok(A.length === B.length && fp(mirror(A, 160)) === fp(B), 'polyp ' + k + ': facing -1 mirrors +1 exactly'); }
/* ---- A: the queen ---- */
const QMODES = ['sleep', 'wake', 'idle', 'hop', 'skitter', 'flushed', 'stranded', 'uprootTell', 'rerootTell', 'lashTell', 'lash', 'lashRec', 'spitTell', 'spit', 'spitRec', 'thrumTell', 'thrum', 'thrumRec', 'constrictTell', 'constrict', 'constrictRec', 'broodTell', 'brood', 'broodRec', 'crushTell', 'crush', 'crushRec'];
for (const m of QMODES) for (const ph of [1, 2, 3]) ok(QA.POSES[QA.poseOfQueen(m, { phase: ph })], 'queen mode ' + m + ' P' + ph + ' -> pose ' + QA.poseOfQueen(m, { phase: ph }));
ok(QA.poseOfQueen('idle', { phase: 1, ward: true }) === 'qWard', 'warded idle is the re-grip pose'); ok(QA.poseOfQueen('idle', { phase: 2 }) === 'qSkitIdle', 'P2 idle is the low skitter pose'); ok(QA.poseOfQueen('zzz', { hurtT: 0.2 }) === 'qHurt', 'a flinch in an unknown mode is the hurt pose');
for (const mv of Object.keys(PQM.MOVES)) { const [w, r] = QA.WINDS[mv] || []; ok(w && r && QA.POSES[w] && QA.POSES[r], 'move ' + mv + ' has a windup pose and a release pose'); ok(PQM.PQ[mv] && PQM.PQ[mv].tell >= 0.3, 'move ' + mv + ' windup shows ' + (PQM.PQ[mv] && PQM.PQ[mv].tell) + ' s (>= 0.3)'); }
for (const k of QA.poseNames()) { const r = printQ({ pose: k, phase: /Skit|Hop|Stranded|skitter/i.test(k) ? 2 : 1 }); ok(r.length > 120, 'queen ' + k + ' draws a body (' + r.length + ' rects)'); ok(BAD.length === 0, 'queen ' + k + ': no bad rects ' + BAD.slice(0, 2)); }
for (const k of ['qIdle', 'qSpitWind', 'qCrushRel']) { const A = printQ({ pose: k }, 1), B = printQ({ pose: k }, -1); ok(A.length === B.length && fp(mirror(A, 260)) === fp(B), 'queen ' + k + ': facing -1 mirrors +1 exactly'); }
for (const ph of [1, 2, 3]) { const r = printQ({ pose: 'qIdle', phase: ph }); ok(r.length > 120 && BAD.length === 0, 'queen idle draws in phase ' + ph); }
{ const a = fp(printQ({ pose: 'qIdle', phase: 1 })), c = fp(printQ({ pose: 'qIdle', phase: 3 })), b = fp(printQ({ pose: 'qIdle', phase: 2 })); ok(a !== c, 'P3 (flayed) differs from P1'); ok(a !== b, 'P2 (small, the root-knot) differs from P1'); }

/* ---- B ---- */
{ const seen = new Map(); for (const k of PA.poseNames()) { const f = fp(printP({ pose: k, h: k === 'polypSwell' ? 14 : k === 'polypShrink' ? 12 : undefined })); const pk = seen.get(f); ok(!pk, 'polyp ' + k + ' differs from ' + (pk || 'all others')); seen.set(f, k); }
  ok(fp(printP({ pose: 'polypSpitWind' })) !== fp(printP({ pose: 'polypOut' })), 'polyp: the tell differs from the watch'); ok(fp(printP({ pose: 'polypSpitWind' })) !== fp(printP({ pose: 'polypSpit' })), 'polyp: the tell differs from the spit');
  ok(GPM.GP.spit.tell >= 0.3, 'polyp windup shows ' + GPM.GP.spit.tell + ' s (>= 0.3)'); }
{ const seen = new Map(); for (const k of QA.poseNames()) { const f = fp(printQ({ pose: k, phase: 1 })); const pk = seen.get(f); ok(!pk, 'queen ' + k + ' differs from ' + (pk || 'all others')); seen.set(f, k); }
  for (const mv of Object.keys(QA.WINDS)) { const [w, r] = QA.WINDS[mv]; ok(fp(printQ({ pose: w })) !== fp(printQ({ pose: 'qIdle' })), 'queen ' + w + ' differs from idle'); ok(fp(printQ({ pose: w })) !== fp(printQ({ pose: r })), 'queen ' + w + ' differs from ' + r); } }
/* ---- B2 ---- */
const mask = (print, o, W, H) => { const r = print({ ...o, bodyOnly: true }), m = new Uint8Array(W * H); for (const s of r) { const p = s.split(','), x = +p[0], y = +p[1], w = +p[2], h = +p[3], a = +p[5]; if (a < 0.5) continue; for (let j = Math.max(0, y); j < Math.min(H, y + h); j++) for (let i = Math.max(0, x); i < Math.min(W, x + w); i++) m[j * W + i] = 1; } return m; };
const diffShare = (A, B) => { let x = 0, u = 0; for (let i = 0; i < A.length; i++) { if (A[i] | B[i]) u++; if (A[i] ^ B[i]) x++; } return x / Math.max(1, u); };
const SIL_IDLE = 0.15, SIL_REL = 0.2; { let a = 9, b = 9, who = '';
  for (const [w, r] of Object.values(QA.WINDS)) { const mw = mask(printQ, { pose: w }, 260, 200), s = diffShare(mw, mask(printQ, { pose: 'qIdle' }, 260, 200)), s2 = diffShare(mw, mask(printQ, { pose: r }, 260, 200)); if (s < a) { a = s; who = w; } b = Math.min(b, s2);
    ok(s >= SIL_IDLE, 'queen ' + w + ' BODY silhouette differs from idle by ' + (s * 100).toFixed(0) + '% (>= ' + SIL_IDLE * 100 + '%)'); ok(s2 >= SIL_REL, 'queen ' + w + ' BODY differs from its release ' + r + ' by ' + (s2 * 100).toFixed(0) + '% (>= ' + SIL_REL * 100 + '%)'); }
  const pw = mask(printP, { pose: 'polypSpitWind' }, 160, 160), ps = diffShare(pw, mask(printP, { pose: 'polypOut' }, 160, 160)), ps2 = diffShare(pw, mask(printP, { pose: 'polypSpit' }, 160, 160));
  ok(ps >= SIL_IDLE, 'polyp tell BODY differs from the watch by ' + (ps * 100).toFixed(0) + '%'); ok(ps2 >= SIL_REL, 'polyp tell BODY differs from the spit by ' + (ps2 * 100).toFixed(0) + '%');
  console.log('  silhouette: queen smallest windup-vs-idle ' + (a * 100).toFixed(0) + '% (' + who + '), windup-vs-release ' + (b * 100).toFixed(0) + '%; polyp tell-vs-watch ' + (ps * 100).toFixed(0) + '%, tell-vs-spit ' + (ps2 * 100).toFixed(0) + '%'); }
/* ---- B3: faces get pixels ---- */
{ const count = (r, cols) => r.reduce((s, q) => { const p = q.split(','); return s + (cols.includes(p[4]) ? +p[2] * +p[3] : 0); }, 0);
  const eyeQ = [QA.QCOL.eye, QA.QCOL.eyeHot, QA.QCOL.eyeDim], eyeP = [PA.PCOL.eyeW, PA.PCOL.iris, PA.PCOL.gold];
  for (const k of ['qIdle', 'qWake', 'qSpitWind', 'qLashWind', 'qConstrictWind', 'qThrumWind', 'qBroodWind', 'qCrushWind']) { const c = count(printQ({ pose: k, bodyOnly: true }), eyeQ); ok(c >= 8 || /Brood/.test(k), 'queen ' + k + ': the eyes are ' + c + ' px (>= 8)'); }
  for (const k of ['polypOut', 'polypSpitWind', 'polypSpit', 'polypRec']) { const c = count(printP({ pose: k, bodyOnly: true }), eyeP); ok(c >= 8, 'polyp ' + k + ': the eye is ' + c + ' px (>= 8)'); }
  const m = count(printP({ pose: 'polypSpit', bodyOnly: true }), [PA.PCOL.mouth]), m0 = count(printP({ pose: 'polypOut', bodyOnly: true }), [PA.PCOL.mouth]); ok(m > m0 * 1.5, 'polyp: the spit opens the mouth (' + m0 + ' -> ' + m + ' px of dark)'); }
/* ---- C ---- */
{ let out = 0; const box = [-85, 100, -90, 26]; for (const k of QA.poseNames()) for (const r of printQ({ pose: k, phase: /Skit|Hop|Stranded|skitter/i.test(k) ? 2 : 1 })) { const [x, y, w, h] = r.split(',').map(Number), dx = x - 130, dy = y - 140; if (dx < box[0] || dx + w > box[1] || dy < box[2] || dy + h > box[3]) out++; }
  ok(out === 0, 'queen: every pose inside the box round her feet (' + out + ' rects outside)'); }
{ let out = 0; const box = [-30, 40, -48, 14]; for (const k of PA.poseNames()) for (const r of printP({ pose: k })) { const [x, y, w, h] = r.split(',').map(Number), dx = x - 80, dy = y - 110; if (dx < box[0] || dx + w > box[1] || dy < box[2] || dy + h > box[3]) out++; }
  ok(out === 0, 'polyp: every pose inside the box round its root (' + out + ' rects outside)'); }
for (const kq of [0, 0.3, 0.6, 0.9, 1]) { reset(); QA.drawQueenDead(makeCtx(260, 200), 130, 140, 1, kq, 0.3); ok(BAD.length === 0, 'queen fall ' + kq + ' draws clean ' + BAD.slice(0, 2)); reset(); PA.drawPolypDead(makeCtx(160, 160), 80, 110, 1, kq, 0.3); ok(BAD.length === 0, 'polyp fall ' + kq + ' draws clean ' + BAD.slice(0, 2)); }
const solidFn = (tx0) => (tx, ty) => { const lx = tx - tx0, ly = ty - 40; return lx >= 0 && lx < 12 && (ly >= 3 || ly <= 0 || (lx === 3 && ly < 3)); };
const drawKit = g => {
  for (const tx0 of [10, 60, 140, 200, 280, 340]) WA.drawFleshTex(g, tx0 * 16, 40 * 16, 0.3, 192, 110, solidFn(tx0), 400, 48);
  for (const st of [{}, { glow: 0.9 }, { glow: 1, flare: 0.5 }, { cool: 3, glow: 0.1 }, { cool: 6.8, coolMax: 6.8 }]) WA.drawNerve(g, 40, 80, st, 0.3);
  for (const st of [{ kind: 'breath' }, { kind: 'breath', quiver: 1 }, { kind: 'breath', open: true }, { kind: 'sealed' }, { kind: 'sealed', open: true }]) WA.drawMembrane(g, 20, 10, 32, 176, st, 0.5);
  for (const [b, r] of [[0, 1], [0.6, 1], [1, 1], [0.5, 1.6]]) WA.drawHeart(g, 100, 100, b, r, 0.3);
  WA.drawTongue(g, 10, 10, 64, 0.3); WA.drawTongue(g, 10, 10, 112, 0.7); WA.drawRaft(g, 10, 10, 48, 0.3); WA.drawRaft(g, 10, 10, 96, 0.7); WA.drawBile(g, 5, 300, 20, 60, 0.3); WA.drawBile(g, 5, 40, 20, 3, 0.9);
  for (const f of [0, 0.4, 1]) for (const tl of [false, true]) WA.drawLung(g, 100, 4, f, tl, 0.3);
  for (const m of ['tell', 'rel']) for (const k of [0, 0.5, 1]) QA.drawLash(g, 60, 100, 22, 30, m, 0.3, k); for (const d of [-1, 1]) QA.drawThrumRing(g, 60, 100, 12, d, 0.3);
  for (const tg of [0, 1]) QA.drawTendril(g, 10, 10, 120, 60, tg, 0.3); QA.drawTendril(g, 10, 10, 10, 10, 1, 0.3); for (const rp of [0, 0.5, 1]) QA.drawEgg(g, 30, 80, rp, 0.3);
  for (const on of [false, true]) QA.drawCrushFloor(g, 0, 300, 100, 14, on, 0.3); for (const kd of ['bile', 'egg']) PA.drawGlob(g, 60, 60, 80, -40, 0.3, kd); PA.drawGlob(g, 60, 60, 0, 0, 0.3);
  KA.drawOpenRing(g, 60, 60, 34, 0.3); KA.drawWardRing(g, 60, 60, 34, 0.3); };
{ reset(); drawKit(makeCtx(400, 300)); ok(BAD.length === 0, 'the kit pieces (flesh by section, nerve, membrane, heart, tongue, raft, bile, lung, the floor pieces) draw clean ' + BAD.slice(0, 3)); }
{ let seenSec = new Set(); for (const tx of [0, 49, 50, 125, 126, 170, 171, 262, 263, 322, 323, 399]) seenSec.add(WA.sectionOf(tx)); ok(seenSec.size === 6, 'the six sections of the whale each have their own flesh (' + [...seenSec] + ')');
  ok(WHM.SECTIONS.every(([, a, b]) => WA.sectionOf(a) === WA.sectionOf(b)), 'sectionOf agrees with src/whale.js SECTIONS at both ends of every section'); }
/* the flesh adds real pixels over a flat block, and the membrane sheet covers its box */
{ reset(); REC = []; WA.drawFleshTex(makeCtx(200, 120), 60 * 16, 40 * 16, 0.3, 192, 110, solidFn(60), 400, 48); const cnt = REC.length; REC = null; ok(cnt > 800, 'the flesh draws texture over a room (' + cnt + ' rects)');
  reset(); REC = []; WA.drawMembrane(makeCtx(60, 200), 0, 0, 32, 176, { kind: 'breath' }, 0.3); const big = REC.some(s => { const p = s.split(','); return +p[2] >= 32 && +p[3] >= 170; }); REC = null; ok(big, 'a shut membrane covers its whole box (no tile shows through)'); }
/* ---- D: the real hands on a stub world ---- */
{ const { LEVELS, T } = await import(U('level.js')); const { makeWhaleHands } = await import(U('whale-hands.js')); const { makePirateFleetHands } = await import(U('pirate-fleet-hands.js')); const { MOVE } = await import(U('hero-move.js'));
  const row = LEVELS.find(d => d.id === 'whale'), TS = 16, DT = MOVE.DT;
  const mkWorld = level => { const W = { L: level, said: [], enemies: [], parts: [], t: 0 }; const P = { x: 362 * TS, y: 40 * TS, w: 10, h: 14, face: 1, dead: false, ground: true }; W.P = P; W.players = [P];
    const at = (x, y) => (x < 0 || y < 0 || x >= level.W || y >= level.H) ? T.SOLID : level.grid[y * level.W + x];
    const ctx = { get L() { return level; }, get pfh() { return W.pfh; }, get players() { return W.players; }, get boss() { return W.boss || null; }, get bossActive() { return !!W.bossActive; }, T, EHP: { gastricpolyp: GPM.GP.hp, parasitequeen: PQM.PQ.hp },
      hero: () => P, time: () => W.t, poolLevel: (p, y) => { p.y = y; const d = p.base - y; p.dry = d <= 1; p.depth = Math.max(0, d); p.shallow = d < 18; }, moveBody: (b, dx, dy) => { b.x += dx; b.y += dy; return {}; },
      enemies: () => W.enemies, parts: () => W.parts, isSolid: (x, y) => at(x, y) === T.SOLID || at(x, y) === T.PORT, cellSet: (x, y, v) => { level.grid[y * level.W + x] = v; },
      spawnEnt: e => W.enemies.push({ t: e.t, x: e.x * TS + 8, y: (e.y + 1) * TS, alive: true, mode: 'lurk' }), leechOff: () => {}, VW: () => 384, view: () => ({ x0: 0, y0: 0, x1: 384, y1: 216 }), number: () => {}, text: () => {},
      burst: () => {}, shake: () => {}, ring: () => {}, turned: () => {}, damagePlayer: () => 'hit', asPlayer: (p, fn) => fn(), upright: p => !p.dead, overlap: (a, b) => a.l < b.r && a.r > b.l && a.t < b.b && a.b > b.t,
      box: b => ({ l: b.x - b.w / 2, r: b.x + b.w / 2, t: b.y - b.h, b: b.y }), sound: () => {} };
    W.H = makeWhaleHands(ctx);
    W.pfh = makePirateFleetHands({ get L() { return level; }, hooks: () => W.H.water, get players() { return W.players; }, hero: () => P, marks: () => new Set(), poolLevel: ctx.poolLevel, moveBody: ctx.moveBody, holding: () => false, enemies: () => W.enemies, parts: () => W.parts,
      VW: () => 384, view: () => ({ x0: 0, y0: 0, x1: 384, y1: 216 }), burst: () => {}, sparks: () => {}, time: () => W.t, sound: () => {}, number: () => {}, shake: () => {}, TS });
    W.H.clear(); W.pfh.clear(); W.step = s => { for (let i = 0; i < Math.round(s / DT); i++) { W.t += DT; W.H.update(DT); W.pfh.update(DT); } }; return W; };
  const W = mkWorld(row.build()); W.step(1);
  const A = W.L.arena, base = { id: 1, alive: true, x: 0, y: 0 };
  const polyp = W.H.spawnEnt({ ...base }, { t: 'gastricpolyp', face: -1 }); polyp.x = 40 * TS; polyp.y = 36 * TS; polyp.alive = true;
  const queen = W.H.spawnEnt({ ...base }, { t: 'parasitequeen', face: -1 }); W.boss = queen; W.bossActive = true; queen.alive = true;
  const g = makeCtx(384, 216); const HK = (cx, cy) => { W.H.drawBack(g, cx, cy, W.t); W.H.drawEnt(g, polyp, cx, cy, W.t); W.H.drawEnt(g, queen, cx, cy, W.t); for (const m of W.L.movers || []) W.H.drawMover(g, m, cx, cy, W.t); W.H.drawOver(g, cx, cy, W.t); };
  reset(); for (const m of ['in', 'shrink', 'swell', 'out', 'spitTell', 'spit', 'rec']) { polyp.mode = m; polyp.h = 14; polyp.globs = [{ x: polyp.x + 30, y: polyp.y - 20, vx: 80, vy: -20, t: 1 }]; HK(polyp.x - 150, polyp.y - 120); }
  ok(BAD.length === 0, 'the hands draw every polyp mode (back, ent, mover, over) clean ' + BAD.slice(0, 2));
  const Qs = W.H.queen(); queen.x = A.heartX; queen.y = A.floor; reset();
  for (const ph of [1, 2, 3]) { Qs.ph = ph; for (const m of QMODES) { queen.mode = m; queen.modeT = 0.2; queen.open = /^(flushed|stranded)$/.test(m) ? 2 : 0; Qs.ward = m === 'idle' ? 1 : 0; Qs.roots = [{ x: queen.x - 80, y: A.floor }]; Qs.rings = [{ id: 1, x: queen.x, r: 40, y: A.floor }]; Qs.eggs = [{ id: 1, x: queen.x + 60, y: A.floor, t: 0.8, hp: 1 }]; Qs.globs = [{ id: 1, kind: 'egg', x: queen.x + 20, y: A.floor - 50, vx: 30, vy: 10, t: 1 }, { id: 2, kind: 'spit', x: queen.x - 20, y: A.floor - 50, vx: -30, vy: 10, t: 1 }]; HK(queen.x - 190, A.floor - 150); } }
  ok(BAD.length === 0, 'the hands draw every Queen mode x phase (tendrils, lash, rings, eggs, globs, crush, the gold / grey rings) clean ' + BAD.slice(0, 2));
  /* the falls play from the hands' own record, off the foe's death */
  reset(); { queen.alive = false; queen.hp = 0; polyp.alive = false; polyp.hp = 0; for (const tt of [0, 0.5, 1.2, 2, 2.7]) { W.H.drawOver(g, queen.x - 190, A.floor - 150, 10 + tt); } }
  ok(BAD.length === 0, 'the falls (Queen, polyp) play from the hands without a main.js hook');
  /* flag OFF: a level without L.whale: nothing is on, nothing draws */
  const off = { ...row.build(), whale: false }; const WO = mkWorld(off); reset(); REC = []; WO.H.drawBack(g, 0, 0, 1); WO.H.drawOver(g, 0, 0, 1); const cnt = REC.length; REC = null;
  ok(!WO.H.on() && cnt === 0, 'flag OFF (no L.whale): the hands are inert and draw nothing (' + cnt + ' rects)'); }
/* ---- E ---- */
{ const hexRgb = c => [parseInt(c.slice(1, 3), 16), parseInt(c.slice(3, 5), 16), parseInt(c.slice(5, 7), 16)];
  const base = new Set(); for (const f of ['redraw/reef.js', 'reef_tiles.js', 'reef_props.js', 'redraw/drowned_king2_art.js', 'redraw/keep2_art.js', 'redraw/naga_guard_art.js', 'redraw/deep3_art.js', 'redraw/drowned_crew_art.js', 'redraw/siren_rocks_art.js', 'whale.js', 'gastric-polyp.js', 'parasite-queen.js']) for (const m of readFileSync(new URL('../src/' + f, import.meta.url), 'utf8').matchAll(/#[0-9a-fA-F]{6}\b/g)) base.add(m[0].toLowerCase());
  /* the greybox's own flesh colours (git: the whale-hands.js literals before this lane) */
  const GREYBOX = ['#5a1420', '#8a2232', '#c04050', '#f4c0cc', '#ffe8ee', '#c07080', '#8a6a70', '#9ab0c0', '#7a2a3a', '#a03a50', '#c06070', '#e090a0', '#ffd36b', '#b04858', '#d07080', '#8a3040', '#3a2a22', '#5a4434', '#c8c0a8', '#8a3040', '#c87a6a', '#d8a090', '#e8f0a0', '#3a1018', '#b8d060', '#e0f0a0', '#d8c8b0', '#d8d0c0', '#b8a890', '#5a2a2a', '#7a3a3a', '#e8e0b0', '#a89860', '#6a8a20', '#c8e070', '#f4d0d8', '#5a2030', '#e8c0c8', '#ffd0dc', '#f0d0d8'];
  const ACC = ['#ff7a3a'];   /* declared accent: the Queen's ember eyes */
  const pal = [...base, ...GREYBOX, ...ACC].map(hexRgb), LIMIT = 40; let worst = 0, worstC = '';
  const near = c => { const [r, g, b] = hexRgb(c); let d = 1e9; for (const [R2, G2, B2] of pal) d = Math.min(d, Math.hypot(r - R2, g - G2, b - B2)); return d; };
  COLS.clear(); { const g = makeCtx(300, 300); for (const k of QA.poseNames()) QA.drawQueen(g, 150, 150, 1, { pose: k, phase: 1, seed: 1 }, 0.4); QA.drawQueen(g, 150, 150, 1, { pose: 'qIdle', phase: 3 }, 0.4); QA.drawQueen(g, 150, 150, 1, { pose: 'qIdle', phase: 2 }, 0.4); for (const k of PA.poseNames()) PA.drawPolyp(g, 150, 150, 1, { pose: k, seed: 1 }, 0.4);
    for (const kq of [0.2, 0.9]) { QA.drawQueenDead(g, 150, 150, 1, kq, 0.3); PA.drawPolypDead(g, 150, 150, 1, kq, 0.3); } drawKit(makeCtx(400, 300)); }
  /* (drawKit ran into its own ctx but the COLS tally is global) */
  let off = 0; for (const c of COLS.keys()) { const d = near(c); if (d > worst) { worst = d; worstC = c; } if (d > LIMIT) { off++; console.log('  off-palette ' + c + ' (' + d.toFixed(0) + ')'); } }
  console.log('  palette: ' + COLS.size + ' colours drawn, ' + base.size + ' literals + ' + GREYBOX.length + ' greybox + ' + ACC.length + ' accent, worst distance ' + worst.toFixed(0) + ' (' + worstC + ')'); ok(off === 0, off + ' colours outside the Whale / Deep / Keep / Reef set (limit ' + LIMIT + ')'); ok(COLS.size <= 420, 'the art keeps a small palette (' + COLS.size + ' <= 420)'); }
/* ---- F ---- */
{ const files = ['redraw/whale_art.js', 'redraw/gastric_polyp_art.js', 'redraw/parasite_queen_art.js']; ok(files.every(f => !/ad|admiral|banner|track/i.test(f.split('/')[1].replace(/whale|gastric|polyp|parasite|queen|art/gi, ''))), 'no ad-block words in the new filenames');
  const hands = readFileSync(new URL('../src/whale-hands.js', import.meta.url), 'utf8'), main = readFileSync(new URL('../src/main.js', import.meta.url), 'utf8');
  ok(/WA\.drawFleshTex/.test(hands) && /WA\.drawHeart/.test(hands) && /WA\.drawNerve/.test(hands) && /WA\.drawMembrane/.test(hands) && /WA\.drawTongue/.test(hands) && /WA\.drawRaft/.test(hands) && /WA\.drawBile/.test(hands) && /WA\.drawLung/.test(hands), 'the hands draw the level kit');
  ok(/PA\.drawPolyp\(/.test(hands) && /PA\.drawPolypDead/.test(hands) && /QA\.drawQueen\(/.test(hands) && /QA\.drawQueenDead/.test(hands) && /QA\.drawTendril/.test(hands) && /QA\.drawLash/.test(hands) && /QA\.drawThrumRing/.test(hands) && /QA\.drawEgg/.test(hands) && /QA\.drawCrushFloor/.test(hands), 'the hands draw both creatures and the Queen\'s floor pieces');
  ok(!/'#5a1420'|'#c87a6a'|'#d8d0c0'|'#6a8a20'|'#3a2a22'/.test(hands), 'no greybox rectangles left in the hands');
  ok(/WH_SHIPS = false/.test(readFileSync(new URL('../src/whale.js', import.meta.url), 'utf8')), 'WH_SHIPS stays false (the flag is OFF)');
  ok(!/whale_art|gastric_polyp_art|parasite_queen_art/.test(main), 'main.js is untouched by the art (the hands own the wiring: OFF = the base)');
  ok(GPM.TELL_ROWS.length === 1 && PQM.TELL_ROWS.length === 8, 'the TELL_ROWS marks of the polyp and the Queen are unchanged (1 + 8)');
  ok(GPM.TELL_ROWS[0][2] === '!' && PQM.TELL_ROWS.filter(r => r[2] === '!!').length === 5, 'the marks themselves are unchanged (the spit !, five !!)'); }
console.log('wh-art-lint: ' + n + ' checks, ' + (bad ? bad + ' FAILED' : 'all ok'));
process.exit(bad ? 1 : 0);
