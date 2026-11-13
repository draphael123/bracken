/* tools/sr-art-lint.mjs - SIREN ROCKS' ART, node-only lint (claude/srart, 2026-11-12), in the shape of tools/k2-art-lint.mjs. No page, no browser: a recording 2d stub stands in for the canvas.   node tools/sr-art-lint.mjs
   A  every move mode of the guard and the Queen resolves to a pose; every pose draws a body with no NaN rect / bad colour; facing -1 mirrors +1 exactly
   B  POSE-DISTINCT: every pose differs from every other; every TELL differs from its RELEASE and from idle; a told move shows >= 0.3 s
   B2 SILHOUETTE: the BODY only (no spear / effects: o.bodyOnly) as a 1-px mask; every tell must change >= 20% of union pixels against idle and >= 25% against its strike
   C  every draw stays inside a box round the feet; the falls, the kit pieces (stone states, song skins, blowhole, raft, bell, wreck, dressing, venom) draw clean
   E  PALETTE: every colour drawn is within the Reef set (reef.js / reef_tiles.js / reef_props.js literals) or the declared accents (distance <= LIMIT)
   F  files + wiring (no ad-block words, the hands use the art, the greybox rectangles are gone, SR_SHIPS stays false) */
import { readFileSync } from 'node:fs';
let n = 0, bad = 0; const ok = (c, m) => { n++; if (!c) { bad++; console.log('  FAIL ' + m); } };
const COLS = new Map(); let REC = null, BAD = []; const reset = () => { COLS.clear(); BAD = []; };
function makeCtx(w, h) {
  return { canvas: { width: w, height: h }, fillStyle: '#000000', globalAlpha: 1, strokeStyle: '#000', lineWidth: 1, beginPath() {}, arc() {}, stroke() {},
    fillRect(x, y, ww, hh) { const c = String(this.fillStyle); COLS.set(c, (COLS.get(c) || 0) + 1);
      if (![x, y, ww, hh].every(Number.isFinite)) BAD.push('NaN rect ' + [x, y, ww, hh] + ' ' + c); if (!/^#[0-9a-f]{6}$/i.test(c)) BAD.push('bad colour ' + c);
      if (REC) REC.push([x, y, ww, hh, c, this.globalAlpha].join(',')); } };
}
const U = f => new URL('../src/' + f, import.meta.url).href;
const GA = await import(U('redraw/naga_guard_art.js')), QA = await import(U('redraw/naga_queen_art.js')), SA = await import(U('redraw/siren_rocks_art.js')), SD = await import(U('redraw/sea_dial.js')),
  NG = await import(U('naga-guard.js')), NQ = await import(U('naga-queen.js'));
const printG = (o, f = 1, t = 0.4) => { reset(); REC = []; const g = makeCtx(200, 200); GA.drawGuard(g, 100, 100, f, { seed: 1, ...o }, t); const r = REC; REC = null; return r; };
const printQ = (o, f = 1, t = 0.4) => { reset(); REC = []; const g = makeCtx(300, 200); QA.drawQueen(g, 150, 100, f, { seed: 1, ...o }, t); const r = REC; REC = null; return r; };
const fp = r => r.join('|');
const SUITES = [
  { name: 'guard', print: printG, W: 200, X: 100, POSES: GA.G_POSE_SET, modes: ['idle', 'slither', 'spearTell', 'spear', 'rec', 'coilTell', 'lunge', 'spent', 'recoil'], pose: GA.poseOfGuard, tells: [['spearTell', 'spear'], ['coilTell', 'lunge']], dwell: { spearTell: NG.NG.spear.tell, coilTell: NG.NG.lunge.tell } },
  { name: 'queen', print: printQ, W: 300, X: 150, POSES: { ...QA.Q_POSE_SET, under: {} }, modes: ['sleep', 'wake', 'idle', 'slither', 'songTell', 'song', 'songRec', 'sweepTell', 'sweep', 'sweepRec', 'venomTell', 'venomSpit', 'venomRec', 'surfaceTell', 'reel', 'dragged', 'sinkTell', 'under', 'drownTell', 'drown', 'drownRec'], pose: QA.poseOfQueen,
    tells: [['songTell', 'song'], ['sweepTell', 'sweep'], ['venomTell', 'venomSpit'], ['surfaceTell', 'venomSpit'], ['drownTell', 'drown'], ['sinkTell', null]], dwell: { songTell: NQ.NQ.song.tell, sweepTell: NQ.NQ.sweep.tell, venomTell: NQ.NQ.venom.tell, surfaceTell: NQ.NQ.surface.tell, drownTell: NQ.NQ.drown.tell, sinkTell: NQ.NQ.sink.tell } },
];
/* ---- A ---- */
for (const S of SUITES) {
  for (const m of S.modes) { const k = S.pose(m, {}); ok(S.POSES[k], S.name + ' mode ' + m + ' -> pose ' + k); }
  ok(S.pose('idle', { hurtT: 0.2 }) === 'hurt', S.name + ': a flinch in idle is the hurt pose');
  for (const k of Object.keys(S.POSES)) { const r = S.print({ pose: k }); ok(r.length > 40, S.name + ' ' + k + ' draws a body (' + r.length + ' rects)'); ok(BAD.length === 0, S.name + ' ' + k + ': no bad rects ' + BAD.slice(0, 2)); }
  for (const k of ['idle', Object.keys(S.POSES).find(q => /Tell$/.test(q))]) { const A = S.print({ pose: k }, 1), B = S.print({ pose: k }, -1); ok(A.length === B.length, S.name + ' ' + k + ': both facings draw the same pieces');
    const mir = A.map(r => { const [x, y, w, h, c, a] = r.split(','); return [S.W - (+x + +w), y, w, h, c, a].join(','); }); ok(fp(mir) === fp(B), S.name + ': facing -1 mirrors +1 exactly (' + k + ')'); }
}
for (const m of Object.keys(NG.NG_TELLS)) ok(GA.G_POSE_SET[GA.G_MODE_POSE[m]], 'guard tell ' + m + ' has its own pose');
for (const m of NQ.NQ_TELLS.map(r => r[0])) ok(QA.Q_POSE_SET[QA.Q_MODE_POSE[m]], 'queen tell ' + m + ' has its own pose');
for (const m of Object.values(NQ.MOVES)) ok(QA.Q_POSE_SET[QA.Q_MODE_POSE[m.tell]] && QA.Q_POSE_SET[QA.Q_MODE_POSE[m.release]], 'queen move ' + m.tell + ' / ' + m.release + ' both have a pose');
/* ---- B ---- */
for (const S of SUITES) { const seen = new Map(); for (const k of Object.keys(S.POSES)) { const f = fp(S.print({ pose: k })); const pk = seen.get(f); ok(!pk, S.name + ' ' + k + ' differs from ' + (pk || 'all others')); seen.set(f, k); }
  for (const [tell, rel] of S.tells) { ok(S.dwell[tell] >= 0.3, S.name + ' ' + tell + ' shows ' + S.dwell[tell] + ' s (>= 0.3)'); ok(fp(S.print({ pose: tell })) !== fp(S.print({ pose: 'idle' })), S.name + ' ' + tell + ' differs from idle'); if (rel) ok(fp(S.print({ pose: tell })) !== fp(S.print({ pose: rel })), S.name + ' ' + tell + ' differs from ' + rel); } }
/* ---- B2 ---- */
const mask = (S, pose) => { const r = S.print({ pose, bodyOnly: true }), m = new Uint8Array(S.W * 200); for (const s of r) { const [x, y, w, h, , a] = s.split(',').map((v, i) => (i === 4 ? 0 : +v)); if (a < 0.5) continue; for (let j = Math.max(0, y); j < Math.min(200, y + h); j++) for (let i = Math.max(0, x); i < Math.min(S.W, x + w); i++) m[j * S.W + i] = 1; } return m; };
const diffShare = (A, B) => { let x = 0, u = 0; for (let i = 0; i < A.length; i++) { if (A[i] | B[i]) u++; if (A[i] ^ B[i]) x++; } return x / Math.max(1, u); };
const SIL_IDLE = 0.2, SIL_STRIKE = 0.25;
for (const S of SUITES) { const idle = mask(S, 'idle'); let a = 9, b = 9;
  for (const [tell, rel] of S.tells) { const mm = mask(S, tell), s = diffShare(mm, idle); a = Math.min(a, s); ok(s >= SIL_IDLE, S.name + ' ' + tell + ' BODY silhouette differs from idle by ' + (s * 100).toFixed(0) + '% (>= ' + SIL_IDLE * 100 + '%)');
    if (rel) { const s2 = diffShare(mm, mask(S, rel)); b = Math.min(b, s2); ok(s2 >= SIL_STRIKE, S.name + ' ' + tell + ' BODY differs from its strike ' + rel + ' by ' + (s2 * 100).toFixed(0) + '% (>= ' + SIL_STRIKE * 100 + '%)'); } }
  console.log('  silhouette ' + S.name + ': smallest tell-vs-idle ' + (a * 100).toFixed(0) + '%, smallest tell-vs-strike ' + (b * 100).toFixed(0) + '%'); }
/* ---- C: the box round the feet ---- */
for (const S of SUITES) { let out = 0; const box = S.name === 'guard' ? [-90, 70, -70, 8] : [-110, 110, -110, 10]; for (const k of Object.keys(S.POSES)) for (const r of S.print({ pose: k })) { const [x, y, w, h] = r.split(',').map(Number), dx = x - S.X, dy = y - 100; if (dx < box[0] || dx + w > box[1] || dy < box[2] || dy + h > box[3]) out++; }
  ok(out === 0, S.name + ': every pose inside the box round its feet (' + out + ' rects outside)'); }
for (const kq of [0, 0.3, 0.6, 0.9, 1]) { reset(); const g = makeCtx(300, 200); GA.drawGuardDead(g, 150, 100, 1, kq, 0.3); ok(BAD.length === 0, 'guard fall ' + kq + ' draws clean ' + BAD.slice(0, 2)); reset(); QA.drawQueenDead(g, 150, 100, 1, kq, 0.3); ok(BAD.length === 0, 'queen fall ' + kq + ' draws clean ' + BAD.slice(0, 2)); }
const drawKit = g => {
  for (const st of [{ state: 'idle' }, { state: 'hum', glow: 0.5 }, { state: 'song', glow: 1, chip: true }, { state: 'idle', struck: 0.6 }, { state: 'silent' }, { state: 'regrow' }]) SA.drawStone(g, 100, 100, st, 0.4);
  for (const sk of ['song', 'gust']) for (const fs of [{ f: { ring: [10, 5, 6] }, s: 1, ph: 'on' }, { f: { ring: [10, 5, 6] }, s: 0, ph: 'tell' }, { f: { box: [4, 4, 12, 8], at: [12, 6] }, s: 0.6, ph: 'on' }]) SA.drawSong(g, fs, 0, 0, 0.5, 400, sk);
  for (const ph of ['quiet', 'boom', 'spout']) SA.drawBlowhole(g, 100, 100, ph, 0.3, 40); SA.drawRaft(g, 10, 100, 48, 0.3); SA.drawBell(g, 100, 100, 0, 0.3); SA.drawBell(g, 100, 100, 1, 0.3);
  SA.drawWreck(g, 224 * 16 - 100, 27 * 16 - 150, 0.3, 320); SA.drawDressing(g, 3000, 300, 0.3, 320, 180, (x, y) => y >= 27, 410); QA.drawVenomGlob(g, 50, 50, 30, -20, 0.3); QA.drawVenomPool(g, 50, 50, 1, 0.3);
  SD.drawDial(g, 30, 30, { k: 0.5, ph: 'warn', t: 1, coming: 'in' }, 0.3, SA.SR_SKIN); SD.drawHud(g, 10, 10, { k: 0.3 }, 0.3, SA.SR_SKIN); SD.drawLever(g, 50, 50, { thrown: true }, 0.3, SA.SR_SKIN);
};
{ reset(); drawKit(makeCtx(400, 300)); ok(BAD.length === 0, 'the kit pieces and the pearl dial draw clean ' + BAD.slice(0, 3)); ok(SA.SR_SKIN.case.length === 5 && SA.SR_SKIN.water.length === 3, 'the dial skin is a plain object'); }
/* ---- E: palette ---- */
{ const hexRgb = c => [parseInt(c.slice(1, 3), 16), parseInt(c.slice(3, 5), 16), parseInt(c.slice(5, 7), 16)];
  const reef = new Set(); for (const f of ['redraw/reef.js', 'reef_tiles.js', 'reef_props.js']) for (const m of readFileSync(new URL('../src/' + f, import.meta.url), 'utf8').matchAll(/#[0-9a-fA-F]{6}\b/g)) reef.add(m[0].toLowerCase());
  const ACC = ['#c295d0', '#c9bde6', '#f0e8ff', '#96689f', '#64406e', '#8ef2da', '#3fb0a2', '#227058', '#86a648', '#9ab04e', '#cfe8a0', '#5d7d36', '#ffd36b', '#fff0a8', '#c8a24a', '#e8c24c', '#8a6a28', '#5c4527', '#ff6b6b', '#f6fbfc', '#dff7ee', '#9fd6c8', '#6fb8bc', '#f2f7ff'];
  const pal = [...reef, ...ACC].map(hexRgb), LIMIT = 30; let worst = 0, worstC = '';
  const near = c => { const [r, g, b] = hexRgb(c); let d = 1e9; for (const [R2, G2, B2] of pal) d = Math.min(d, Math.hypot(r - R2, g - G2, b - B2)); return d; };
  reset(); for (const S of SUITES) for (const k of Object.keys(S.POSES)) S.print({ pose: k });
  { const g = makeCtx(300, 200); for (const kq of [0.2, 0.9]) { GA.drawGuardDead(g, 150, 100, 1, kq, 0.3); QA.drawQueenDead(g, 150, 100, 1, kq, 0.3); } drawKit(makeCtx(400, 300)); }
  let off = 0; for (const c of COLS.keys()) { const d = near(c); if (d > worst) { worst = d; worstC = c; } if (d > LIMIT) { off++; console.log('  off-palette ' + c + ' (' + d.toFixed(0) + ')'); } }
  console.log('  palette: ' + COLS.size + ' colours drawn, ' + reef.size + ' reef literals + ' + ACC.length + ' accents, worst distance ' + worst.toFixed(0) + ' (' + worstC + ')'); ok(off === 0, off + ' colours outside the Reef set + accents (limit ' + LIMIT + ')'); ok(COLS.size <= 150, 'the art drew ' + COLS.size + ' distinct colours (<= 150)'); }
/* ---- F ---- */
{ const files = ['redraw/sr_draw.js', 'redraw/siren_rocks_art.js', 'redraw/naga_guard_art.js', 'redraw/naga_queen_art.js']; ok(files.every(f => !/ad|admiral|banner|track/i.test(f.split('/')[1].replace(/draw|art|rocks|siren|naga|guard|queen/gi, ''))), 'no ad-block words in the new filenames');
  const hands = readFileSync(new URL('../src/siren-rocks-hands.js', import.meta.url), 'utf8'), main = readFileSync(new URL('../src/main.js', import.meta.url), 'utf8');
  ok(/SKA\.drawStone/.test(hands) && /SKA\.drawSong/.test(hands) && /SKA\.drawBlowhole/.test(hands) && /SKA\.drawRaft/.test(hands) && /SKA\.drawBell/.test(hands) && /SKA\.drawWreck/.test(hands) && /SKA\.drawDressing/.test(hands), 'the hands draw the level kit');
  ok(/GAA\.drawGuard\(/.test(hands) && /GAA\.drawGuardDead/.test(hands) && /QAA\.drawQueen\(/.test(hands) && /QAA\.drawQueenDead/.test(hands), 'the hands draw both sheets and both falls');
  ok(!/'#2e5a4a'|'#3e7a62'|'#2e4a6a'|'#26232c'|'#b8b4ac'/.test(hands), 'no greybox rectangles left in the hands');
  ok(/SD\.drawHud\(g, 6, 30/.test(hands), 'the A3 gauge is the shared dial (sea_dial.js, pearl skin)');
  ok(/SR_SHIPS = false/.test(readFileSync(new URL('../src/siren-rocks.js', import.meta.url), 'utf8')), 'SR_SHIPS stays false (the flag is OFF)');
  ok(!/siren_rocks_art|naga_guard_art|naga_queen_art/.test(main), 'main.js is untouched by the art (the hands own the wiring: OFF = the base)'); }
console.log('sr-art-lint: ' + n + ' checks, ' + (bad ? bad + ' FAILED' : 'all ok'));
process.exit(bad ? 1 : 0);
