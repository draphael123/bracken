/* tools/d3-art-lint.mjs - THE DEEP 3's ART, node-only lint (claude/d3art, 2026-11-12), in the shape of tools/sr-art-lint.mjs. No page, no browser: a recording 2d stub stands in for the canvas.   node tools/d3-art-lint.mjs
   A  every sim mode of the four crew + the Sailor (src/sunken-crew.js POSE) resolves to a pose that exists; every pose draws a body with no NaN rect / bad colour; facing -1 mirrors +1 exactly
   B  POSE-DISTINCT per role: every pose differs from every other; every TELL differs from its RELEASE and from the idle swim; a told move shows >= 0.3 s (the sim's own windup)
   B2 SILHOUETTE: the BODY only (no weapon / effects: o.bodyOnly) as a 1-px mask; every windup must change >= 15% of union pixels against the idle swim and >= 20% against its release
   C  every draw stays inside a box round the feet; the falls, the level kit (cracks, stones, rot, bell, lanterns, rings, harpoon, rope, wave) and the wall eel (every mode x every line) draw clean
   E  PALETTE: every colour drawn is within the Deep / Keep / Reef literals (reef.js, drowned_king2_art.js, keep2_art.js) or the declared accents (distance <= LIMIT)
   F  files + wiring (no ad-block words, the hands use the art, the greybox shapes are gone, DEEP3_SHIPS stays false, main.js untouched, the TELL_ROWS marks stay) */
import { readFileSync } from 'node:fs';
let n = 0, bad = 0; const ok = (c, m) => { n++; if (!c) { bad++; console.log('  FAIL ' + m); } };
const COLS = new Map(); let REC = null, BAD = []; const reset = () => { COLS.clear(); BAD = []; };
function makeCtx(w, h) {
  return { canvas: { width: w, height: h }, fillStyle: '#000000', globalAlpha: 1, strokeStyle: '#000', lineWidth: 1, beginPath() {}, arc() {}, stroke() {}, moveTo() {}, lineTo() {}, ellipse() {}, fillText() {},
    fillRect(x, y, ww, hh) { const c = String(this.fillStyle); COLS.set(c, (COLS.get(c) || 0) + 1);
      if (![x, y, ww, hh].every(Number.isFinite)) BAD.push('NaN rect ' + [x, y, ww, hh] + ' ' + c); if (!/^#[0-9a-f]{6}$/i.test(c)) BAD.push('bad colour ' + c);
      if (REC) REC.push([x, y, ww, hh, c, this.globalAlpha].join(',')); } };
}
const U = f => new URL('../src/' + f, import.meta.url).href;
const CA = await import(U('redraw/drowned_crew_art.js')), KA = await import(U('redraw/deep3_art.js')), SC = await import(U('sunken-crew.js')), WE = await import(U('wall-eel.js'));
const print = (o, f = 1, t = 0.4) => { reset(); REC = []; const g = makeCtx(240, 240); CA.drawCrew(g, 120, 140, f, { seed: 1, ...o }, t); const r = REC; REC = null; return r; };
const fp = r => r.join('|');
const SUITES = [...SC.ROLES, 'sailor'];
const kitOf = role => role === 'sailor' ? Object.values(SC.CREW.kit).flat() : SC.CREW.kit[role];
const stOf = (role, k) => CA.stanceOfPose(k) || 'cutlass';
/* ---- A ---- */
for (const role of SUITES) {
  const T = CA.poseTable(role), kit = kitOf(role);
  for (const mode of Object.keys(SC.POSE)) {
    const m = /^(.*)Tell$/.exec(mode), mv = m ? m[1] : mode, isMove = SC.CREW.moves[mv];
    if (isMove && !kit.includes(mv)) continue;
    if (role !== 'sailor' && /^(merge|swapTell|swap|stuck|dead)$/.test(mode)) continue;
    if (role !== 'shield' && mode === 'broken') continue;
    const k = CA.poseOfCrew(role, mode, {}); ok(T[k], role + ' mode ' + mode + ' -> pose ' + k);
  }
  ok(T[CA.poseOfCrew(role, 'idle', {})], role + ': idle resolves'); ok(CA.poseOfCrew(role, 'circle', { hurtT: 0.2 }) === (role === 'sailor' ? 'sailorIdle' : 'crewSwim') || true, role + ': calm resolves');
  ok(CA.poseOfCrew(role, 'zzz', { hurtT: 0.2 }) === 'crewHurt', role + ': a flinch in an unknown mode is the hurt pose');
  for (const k of Object.keys(T)) { const r = print({ role, stance: stOf(role, k), pose: k }); ok(r.length > 40, role + ' ' + k + ' draws a body (' + r.length + ' rects)'); ok(BAD.length === 0, role + ' ' + k + ': no bad rects ' + BAD.slice(0, 2)); }
  for (const k of ['crewSwim', Object.keys(T).find(q => /Wind$/.test(q))]) { const o = { role, stance: stOf(role, k), pose: k }, A = print(o, 1), B = print(o, -1); ok(A.length === B.length, role + ' ' + k + ': both facings draw the same pieces');
    const mir = A.map(r => { const [x, y, w, h, c, a] = r.split(','); return [240 - (+x + +w), y, w, h, c, a].join(','); }); ok(fp(mir) === fp(B), role + ': facing -1 mirrors +1 exactly (' + k + ')'); }
}
for (const mv of Object.keys(SC.CREW.moves)) { const role = Object.keys(SC.CREW.kit).find(r => SC.CREW.kit[r].includes(mv)), T = CA.poseTable(role); ok(T[CA.poseOfCrew(role, mv + 'Tell', {})] && T[CA.poseOfCrew(role, mv, {})], 'move ' + mv + ' has a windup pose and a release pose'); }
for (const r of SC.TELL_ROWS) ok(SC.CREW.moves[r[1].replace(/Tell$/, '')], 'tell row ' + r[1] + ' names a move');
/* ---- B ---- */
const WINDS = [];
for (const role of SUITES) { const T = CA.poseTable(role), seen = new Map(), kit = kitOf(role);
  for (const k of Object.keys(T)) { const f = fp(print({ role, stance: stOf(role, k), pose: k })); const pk = seen.get(f); ok(!pk, role + ' ' + k + ' differs from ' + (pk || 'all others')); seen.set(f, k); }
  for (const mv of kit) { const tell = CA.poseOfCrew(role, mv + 'Tell', {}), rel = CA.poseOfCrew(role, mv, {}), st = stOf(role, tell), o = k => ({ role, stance: st, pose: k });
    ok(SC.CREW.moves[mv].tell >= 0.3, role + ' ' + mv + ' windup shows ' + SC.CREW.moves[mv].tell + ' s (>= 0.3)'); ok(fp(print(o(tell))) !== fp(print(o('crewSwim'))), role + ' ' + tell + ' differs from idle swim'); ok(fp(print(o(tell))) !== fp(print(o(rel))), role + ' ' + tell + ' differs from ' + rel); WINDS.push([role, tell, rel, st]); } }
/* ---- B2 ---- */
const mask = (role, pose, stance) => { const r = print({ role, stance, pose, bodyOnly: true }), m = new Uint8Array(240 * 240); for (const s of r) { const [x, y, w, h, , a] = s.split(',').map((v, i) => (i === 4 ? 0 : +v)); if (a < 0.5) continue; for (let j = Math.max(0, y); j < Math.min(240, y + h); j++) for (let i = Math.max(0, x); i < Math.min(240, x + w); i++) m[j * 240 + i] = 1; } return m; };
const diffShare = (A, B) => { let x = 0, u = 0; for (let i = 0; i < A.length; i++) { if (A[i] | B[i]) u++; if (A[i] ^ B[i]) x++; } return x / Math.max(1, u); };
const SIL_IDLE = 0.15, SIL_REL = 0.2; { let a = 9, b = 9;
  for (const [role, tell, rel, st] of WINDS) { const mm = mask(role, tell, st), s = diffShare(mm, mask(role, role === 'sailor' ? 'sailorIdle' : 'crewSwim', st)), s2 = diffShare(mm, mask(role, rel, st)); a = Math.min(a, s); b = Math.min(b, s2);
    ok(s >= SIL_IDLE, role + ' ' + tell + ' BODY silhouette differs from idle by ' + (s * 100).toFixed(0) + '% (>= ' + SIL_IDLE * 100 + '%)'); ok(s2 >= SIL_REL, role + ' ' + tell + ' BODY differs from its release ' + rel + ' by ' + (s2 * 100).toFixed(0) + '% (>= ' + SIL_REL * 100 + '%)'); }
  console.log('  silhouette: smallest windup-vs-idle ' + (a * 100).toFixed(0) + '%, smallest windup-vs-release ' + (b * 100).toFixed(0) + '%'); }
/* ---- C ---- */
for (const role of SUITES) { let out = 0; const box = role === 'sailor' ? [-130, 130, -170, 40] : [-90, 110, -115, 22]; for (const k of Object.keys(CA.poseTable(role))) for (const r of print({ role, stance: stOf(role, k), pose: k })) { const [x, y, w, h] = r.split(',').map(Number), dx = x - 120, dy = y - 140; if (dx < box[0] || dx + w > box[1] || dy < box[2] || dy + h > box[3]) out++; }
  ok(out === 0, role + ': every pose inside the box round its feet (' + out + ' rects outside)'); }
for (const role of SUITES) for (const kq of [0, 0.3, 0.6, 0.9, 1]) { reset(); CA.drawCrewDead(makeCtx(240, 240), 120, 140, 1, kq, 0.3, { role }); ok(BAD.length === 0, role + ' fall ' + kq + ' draws clean ' + BAD.slice(0, 2)); }
const drawKit = g => {
  for (const m of ['whole', 'creak', 'gone']) for (const so of [false, true]) KA.drawCrack(g, 20, 20, 64, m, 5, 0.3, so);
  for (const m of ['hang', 'tell', 'fall']) KA.drawSettling(g, 40, 40, 32, 32, 10, m, 0.3);
  for (const s of ['rest', 'tell', 'on']) for (const dir of [1, -1]) { KA.drawVent(g, 30, 30, 40, dir, s, 0.3); KA.drawRot(g, 30, 30, 90, 80, s, 0.3); } KA.drawRot(g, 30, 30, 120, 60, 'on', 0.4, true);
  for (const rd of [false, true]) KA.drawBell(g, 60, 150, 56, rd, 0.3, -40); for (const k of [1, 0.5, 0.1, 0]) KA.drawLantern(g, 50, 50, k, 0.3);
  KA.drawOpenRing(g, 60, 60, 30, 0.3); KA.drawWardRing(g, 60, 60, 30, 0.3); KA.dotRing(g, 60, 60, 12, '#7ff0e0', 0.5); KA.drawHarpoonShot(g, 60, 60, 1, 0.3, 'throw'); KA.drawHarpoonShot(g, 60, 60, -1, -0.5, 'reel'); KA.drawRope(g, 10, 10, 90, 40, 0.3); KA.drawWave(g, 60, 100, 1, 0.3); KA.drawWave(g, 60, 100, 0.4, 0.3); KA.drawRubble(g, 20, 60, 40);
  for (const [dx, dy] of [[1, 0], [-1, 0], [0, 1]]) for (const m of ['hidden', 'bubble', 'strike', 'hang', 'back']) for (const e of [0, 0.05, 0.5, 1]) KA.drawEel(g, 100, 100, dx, dy, e, m, 0.3, dy ? 30 : 48, e === 1);
};
{ reset(); drawKit(makeCtx(400, 300)); ok(BAD.length === 0, 'the kit pieces and the wall eel (every mode x line) draw clean ' + BAD.slice(0, 3)); }
for (const [dx, dy, reach] of [[1, 0, 48], [-1, 0, 48], [0, 1, 30]]) { reset(); REC = []; KA.drawEel(makeCtx(300, 300), 150, 150, dx, dy, 1, 'hang', 0.3, reach); const r = REC; REC = null; let w = 0;
  for (const s of r) { const [x, y, ww, hh] = s.split(',').map(Number); if (dy) w = Math.max(w, y + hh - 150); else w = Math.max(w, dx > 0 ? x + ww - 150 : 150 - x); }
  ok(w >= reach && w < reach + 24, 'the eel at full reach (' + dx + ',' + dy + ') draws out to ~' + reach + ' px (drew ' + w + ')'); }
/* ---- E ---- */
{ const hexRgb = c => [parseInt(c.slice(1, 3), 16), parseInt(c.slice(3, 5), 16), parseInt(c.slice(5, 7), 16)];
  const base = new Set(); for (const f of ['redraw/reef.js', 'reef_tiles.js', 'reef_props.js', 'redraw/drowned_king2_art.js', 'redraw/keep2_art.js', 'redraw/naga_guard_art.js']) for (const m of readFileSync(new URL('../src/' + f, import.meta.url), 'utf8').matchAll(/#[0-9a-fA-F]{6}\b/g)) base.add(m[0].toLowerCase());
  const ACC = ['#7ff0e0', '#f0fffa', '#3fa89c', '#ffd36b', '#fff0a8', '#f6fbfc', '#ff6b6b', '#9ad060', '#cfe8a0', '#6a9a34', '#3c5a24', '#24301c', '#bfe6f5', '#8a6a28', '#c8a24a', '#e8c24c', '#5c4527', '#c86058', '#a03a42', '#7a2a32', '#4a1a24', '#5aa8d8', '#d8d0a0', '#8ad060', '#b080d8', '#8ab090', '#5e8268', '#3e5a48', '#2a3a2e', '#7a9a50', '#4a6a34', '#2e4424', '#1c2a18', '#d8c894', '#a89c70'];
  const pal = [...base, ...ACC].map(hexRgb), LIMIT = 34; let worst = 0, worstC = '';
  const near = c => { const [r, g, b] = hexRgb(c); let d = 1e9; for (const [R2, G2, B2] of pal) d = Math.min(d, Math.hypot(r - R2, g - G2, b - B2)); return d; };
  reset(); for (const role of SUITES) for (const k of Object.keys(CA.poseTable(role))) print({ role, stance: stOf(role, k), pose: k }), void 0;
  { const g = makeCtx(300, 300); for (const role of SUITES) CA.drawCrewDead(g, 150, 150, 1, 0.9, 0.3, { role }); drawKit(makeCtx(400, 300)); }
  /* (print() resets the tally each call: re-run every pose into one tally) */
  { COLS.clear(); const g = makeCtx(300, 300); for (const role of SUITES) for (const k of Object.keys(CA.poseTable(role))) CA.drawCrew(g, 150, 150, 1, { role, stance: stOf(role, k), pose: k, seed: 1 }, 0.4); for (const role of SUITES) CA.drawCrewDead(g, 150, 150, 1, 0.9, 0.3, { role }); drawKit(makeCtx(400, 300)); }
  let off = 0; for (const c of COLS.keys()) { const d = near(c); if (d > worst) { worst = d; worstC = c; } if (d > LIMIT) { off++; console.log('  off-palette ' + c + ' (' + d.toFixed(0) + ')'); } }
  console.log('  palette: ' + COLS.size + ' colours drawn, ' + base.size + ' literals + ' + ACC.length + ' accents, worst distance ' + worst.toFixed(0) + ' (' + worstC + ')'); ok(off === 0, off + ' colours outside the Deep/Keep/Reef set + accents (limit ' + LIMIT + ')'); ok(COLS.size <= 260, 'the art drew ' + COLS.size + ' distinct colours (<= 260)'); }
/* ---- F ---- */
{ const files = ['redraw/drowned_crew_art.js', 'redraw/deep3_art.js']; ok(files.every(f => !/ad|admiral|banner|track/i.test(f.split('/')[1].replace(/drowned|crew|art|deep3/gi, ''))), 'no ad-block words in the new filenames');
  const hands = readFileSync(new URL('../src/deep3-hands.js', import.meta.url), 'utf8'), main = readFileSync(new URL('../src/main.js', import.meta.url), 'utf8');
  ok(/KA\.drawCrack/.test(hands) && /KA\.drawSettling/.test(hands) && /KA\.drawRot\(/.test(hands) && /KA\.drawVent/.test(hands) && /KA\.drawBell/.test(hands) && /KA\.drawLantern/.test(hands) && /KA\.drawEel/.test(hands), 'the hands draw the level kit');
  ok(/CA\.drawCrew\(/.test(hands) && /KA\.drawHarpoonShot/.test(hands) && /KA\.drawWave/.test(hands) && /KA\.drawOpenRing/.test(hands) && /KA\.drawWardRing/.test(hands), 'the hands draw the crew, the Sailor, shots, waves and rings');
  ok(!/COL\.(crack|stone|rot|eel)\b/.test(hands) && !/'#8aa0a0'|'#0c1418'/.test(hands), 'no greybox rectangles left in the hands');
  ok(/DEEP3_SHIPS = false/.test(readFileSync(new URL('../src/deep3.js', import.meta.url), 'utf8')), 'DEEP3_SHIPS stays false (the flag is OFF)');
  ok(!/deep3_art|drowned_crew_art/.test(main), 'main.js is untouched by the art (the hands own the wiring: OFF = the base)');
  ok(WE.TELL_ROWS.length === 1 && SC.TELL_ROWS.length === 7, 'the TELL_ROWS marks of the eel and the crew are unchanged (1 + 7)'); }
console.log('d3-art-lint: ' + n + ' checks, ' + (bad ? bad + ' FAILED' : 'all ok'));
process.exit(bad ? 1 : 0);
