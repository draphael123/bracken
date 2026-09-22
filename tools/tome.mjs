// tools/tome.mjs — THE TOME (src/tome.js) proved in Node, and its sprite (src/redraw/tome.js) rendered to docs/tome.png:
// every dart told (!) >= 0.5 s ahead; answerable in a human quarter-second two ways (the shield, or a step aside: it does not steer);
// it hurts only mid-dart; the shield SHUTS it (down, double damage) and that pays more than the dodge; a shelf of them winds up one
// at a time. usage: node tools/tome.mjs
import { install, newCanvas, sheet, savePNG } from './node-canvas.mjs';
install();
const { TOME, newTome, newToken, tomeStep, tomeBlocked, tomeHurt, tomeBox, tomeFrame } = await import('../src/tome.js');
const { bakeTome } = await import('../src/redraw/tome.js');
let fails = 0; const ok = (c, m) => { console.log((c ? '  ok   ' : '  FAIL ') + m); if (!c) fails++; };
const DT = 1 / 60, REACT = 0.25, FLOOR = 200, over = (b, x, y) => x + 5 > b[0] && x - 5 < b[1] && y - 14 < b[3] && y > b[2];
const hAt = s => s < 0 || s > 0.64 ? 0 : 320 * s - 500 * s * s;   /* the knight's jump: JUMPV 320, GRAV 1000 */

/* a fight: the player stands at px, the tome starts 5 tiles off. how: 'block' (holds the shield from tell + REACT), 'dodge' (steps 24 px
   aside from tell + REACT), 'stand' (does nothing), 'swing' (swings at it whenever it is in reach, never defends) */
/* THE DODGE PLANNER: at tell + REACT, the first of a player's moves (a step either way, or a jump at some moment) that the rest of the
   dart misses, found by running the tome forward with each */
function planDodge(e0, tok, px, t0) {
  const tries = [];
  for (const dx of [-28, 28, -44, 44]) tries.push({ dx, jump: null });
  for (let j = 0; j <= 0.9; j += 0.05) tries.push({ dx: 0, jump: t0 + j });
  for (const pl of tries) { const e = { ...e0, lock: e0.lock && { ...e0.lock } }, tk = { holder: tok.holder === e0 ? e : tok.holder }; let x = px, hit = false;
    for (let t = t0; t < t0 + 1.4 && !hit; t += DT) { for (const v of tomeStep(e, { px: x, py: FLOOR }, DT, tk)) if (v.t === 'hit' && over(v.box, x, FLOOR - (pl.jump !== null ? hAt(t - pl.jump) : 0))) hit = true;
      if (pl.dx) x += Math.sign(pl.dx) * Math.min(Math.abs(px + pl.dx - x), 92 * DT); if (e.mode === 'spent' || e.mode === 'drift') break; }
    if (!hit) return pl; }
  return null;
}
function fight(how, secs = 30, seed = 0) {
  const e = newTome(100 + seed * 7, FLOOR - 30), tok = newToken(); e.cd = 0.3; let noAnswer = 0, hitThis = false, flat = false, jumpAt = null, px = 180, py = FLOOR, hits = 0, blocks = 0, tells = [], dealt = 0, t = 0, told = null, touchHits = 0, swingCd = 0, target = px;
  for (; t < secs && e.alive; t += DT) {
    const evs = tomeStep(e, { px, py, floorY: () => FLOOR }, DT, tok);
    for (const v of evs) { if (v.t === 'tell') { told = t; tells.push({ t, dartAt: null }); hitThis = false; flat = Math.abs(v.lock.y - e.y) < 24; jumpAt = null; if (how === 'dodge') target = null; }
       if (v.t === 'dart') tells[tells.length - 1].dartAt = t;
      if (v.t === 'hit' && !hitThis && over(v.box, px, py - (jumpAt !== null ? hAt(t - jumpAt) : 0))) { hitThis = true; if (how === 'block' && told !== null && t - told >= REACT) { blocks++; tomeBlocked(e, false, tok); } else { hits++; } } }
    if (e.mode !== 'dart' && over(tomeBox(e), px, py)) touchHits += 0;                                      /* (touching it outside the dart: counted as nothing, by the rule) */
    if (how === 'dodge' && told !== null && t - told >= REACT && target === null) { const pl = planDodge(e, tok, px, t); if (!pl) noAnswer++; target = px + (pl ? pl.dx : 0); jumpAt = pl ? pl.jump : null; }
    if (how === 'dodge' && target !== null) px += Math.sign(target - px) * Math.min(Math.abs(target - px), 92 * DT);
    if (e.mode === 'drift' || e.mode === 'spent') told = null;
    swingCd -= DT; const inReach = Math.abs(e.x - px) < 26 && Math.abs(e.y - (py - 8)) < 18;
    if ((how === 'swing' || (how !== 'stand' && e.mode !== 'tell' && e.mode !== 'dart')) && inReach && swingCd <= 0) { dealt += tomeHurt(e, 8, tok); swingCd = 0.45; }
  }
  return { hits, blocks, tells, dealt, t, dead: !e.alive, noAnswer };
}
console.log('THE TOME');
{ const s = fight('stand', 20); const leads = s.tells.filter(x => x.dartAt).map(x => x.dartAt - x.t);
  ok(s.tells.length >= 3 && leads.every(l => l >= 0.5), `every dart is told first: ${s.tells.length} darts, each ${Math.min(...leads).toFixed(2)} s after its ! (>= 0.5)`);
  ok(s.hits >= 3, `stood still, it finds you: ${s.hits} hits in 20 s (so the answers below are answers)`); }
{ let h = 0, b = 0; for (let k = 0; k < 7; k++) { const s = fight('block', 20, k); h += s.hits; b += s.blocks; }
  ok(h === 0 && b > 0, `THE SHIELD answers it in ${REACT} s: ${h} hits, ${b} blocked in 7 fights`); }
{ let h = 0, na = 0; for (let k = 0; k < 7; k++) { const f = fight('dodge', 20, k); h += f.hits; na += f.noAnswer; }
  ok(h === 0, `A STEP OR A JUMP answers it too (it darts at the spot, it does not steer: a step or a jump found for every dart, ${na} without one): ${h} hits in 7 fights`); }
{ const e = newTome(100, FLOOR - 30), tok = newToken(); e.mode = 'dart'; e.modeT = 0.3; tomeBlocked(e, false, tok); let fell = 0;
  for (let i = 0; i < 60 * 1.2; i++) { tomeStep(e, { px: 400, py: FLOOR, floorY: () => FLOOR }, DT, tok); } fell = e.y;
  const d = tomeHurt(e, 8, tok); ok(e.mode === 'shut' && fell === FLOOR && d === 16, `the shield SHUTS it: down on the floor (y ${fell}), still shut after 1.2 s, a blow does double (${d})`);
  const p = newTome(100, FLOOR - 30); p.mode = 'dart'; tomeBlocked(p, true, tok); ok(p.modeT === TOME.shutPerfect, `a perfect block keeps it shut longer (${TOME.shutPerfect} s against ${TOME.shut})`); }
{ const b = [], d = []; for (let k = 0; k < 7; k++) { b.push(fight('block', 60, k).t); d.push(fight('dodge', 60, k).t); } const med = a => a.sort((x, y) => x - y)[3];
  ok(med(b) < med(d), `the shield pays more than the dodge: ${med(b).toFixed(1)} s to kill it blocking, ${med(d).toFixed(1)} s dodging (median of 7)`);
  const light = Math.ceil(TOME.hp / 8), shut = Math.ceil(TOME.hp / 16); ok(light >= 3 && shut <= 2, `not a one-hit foe: ${light} light blows standing, ${shut} once it is shut`); }
{ const tok = newToken(), shelf = [0, 1, 2, 3].map(k => { const e = newTome(90 + k * 20, FLOOR - 30); e.cd = 0; return e; }); let worst = 0;
  for (let i = 0; i < 60 * 30; i++) { for (const e of shelf) tomeStep(e, { px: 150, py: FLOOR }, DT, tok); worst = Math.max(worst, shelf.filter(e => e.mode === 'tell' || e.mode === 'dart').length); }
  ok(worst === 1, `A SHELF OF FOUR winds up one at a time: at most ${worst} telling or darting at once`); }
{ const e = newTome(100, FLOOR - 30); e.mode = 'drift'; const n = tomeStep(e, { px: 100, py: FLOOR - 22 }, DT, newToken()).filter(v => v.t === 'hit').length;
  ok(n === 0, 'touching it outside a dart hurts nothing (the touch rule)'); }
// the sprite: 8 frames, one size, and a sheet
const S = bakeTome(); ok(S.R.length === 8 && S.R.every(c => c.width === S.R[0].width && c.height === S.R[0].height), `sprite: ${S.R.length} frames ${S.R[0].width}x${S.R[0].height}, ax ${S.ax}, hit box ${S.w}x${S.h}`);
const sh = sheet([...S.R, ...S.L.slice(0, 4)], { maxW: 200, bg: '#3a3058', pad: 6 }), big = newCanvas(sh.width * 4, sh.height * 4); big.getContext('2d').drawImage(sh, 0, 0, big.width, big.height);
savePNG(big, new URL('../docs/tome.png', import.meta.url));
console.log(fails ? `\n${fails} FAILED` : '\nall tome checks pass'); process.exit(fails ? 1 : 0);
