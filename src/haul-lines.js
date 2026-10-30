// src/haul-lines.js - STORMHOLD 4's HAUL LINES and THE CASTLE'S MANGONEL (claude/lance4, lane 2 STORMHOLD 4 LEVEL; scratch/brief-lance4-1029.md s4).
// THE HAUL LINES are the masons' ropes strung from the Wall Watch over THE KING'S DITCH to the BARBICAN TOWER on the gatehouse's outer face.
// They are ordinary zip lines (src/zipline.js: JUMP kicks off, a TOUCH in the air takes another rope, DOWN drops) tagged by the level:
//     z.haul: 'A' | 'B' | 'L1' ... 'L4'   which line it is (A and B: the teach, over the ditch's flat bottom; L1-L4: the test and the remix, over the spiked gorge)
//     z.stones: true                       the mangonel throws at a rider on it (none in the teach)
//     z.endsAir: true                      it ends in the air (A over the ditch, L1-L3 over the teeth): the way on is another line
//     z.cutAt / z.cutTrig (px)             THE REMIX: a rider passing cutTrig draws a stone at cutAt that PARTS the line (it whips down, re-strung in RESTRING s)
// THE MANGONEL (a DEVICE, not a foe: one-new-foe holds; the Stockade catapult is the precedent) stands on the barbican tower's top. Every stone
// passes the trebuchet test: a dotted arc and a red ring ON YOUR ROPE where you will be 1.3 s ahead at line speed. A stone at the ring = 12
// and it lets go of the rope. Never two in flight; one every 3.2 s while you ride a stone line. THE FAIRNESS RULE: a ring only lands where
// another line - one that goes on further - is in reach for at least 7 tiles before it, so the escape is always drawn. Climb the barbican
// and WRECK it: 5 blows (marks, as the Stockade engine).
// Pure of main.js: haulStep(c, dt) takes a small context (tools/stormhold4.mjs drives it in Node with stubs).
import { lineY, norm } from './zipline.js';
import * as SHA from './stormhold-art.js';

export const HAUL = { lead: 1.3, every: 3.2, first: 0.8, dmg: 12, hitR: 14, escape: 7, hp: 5, restring: 6, arc: 88, armT: 0.55, upLo: -40, upHi: 48 };   // s, s, s, hp, px, tiles, blows, s, px, s, px (another line within 2.5 rows over / 3 under)

/* WHAT IT SAYS (src/hint-lines.js routes the lines to the hint box; 'STONES' floats - a LANCE_WORD; 'THE MANGONEL: n MORE' is a CALL_COUNTS pattern) */
export const HAUL_SAY = { cut: 'THE STONE PARTS THE LINE', forLine: 'A STONE FOR THE LINE', wrecked: 'THE MANGONEL IS WRECKED', more: n => 'THE MANGONEL: ' + n + ' MORE' };
const lowEnd = z => (norm(z), (z.dir || 1) > 0 ? z.xb : z.xa);
/* can a rider on z at x reach w (kick up to it, or drop onto it), with ride left on both? */
export function inTransfer(z, w, x) {
  norm(z); norm(w); if (w === z || w.cut > 0 || (w.dir || 1) !== (z.dir || 1)) return false;
  if (x < Math.max(z.xa, w.xa) + 4 || x > Math.min(z.xb, w.xb) - 16) return false;
  const dy = lineY(w, x) - lineY(z, x); return dy >= HAUL.upLo && dy <= HAUL.upHi && Math.abs(dy) >= 8;
}
/* THE FAIRNESS RULE: px of z between x0 and x1 (in its run) in which a line that goes on further than z is in reach */
export function escapeRun(L, z, x0, x1) {
  const dir = z.dir || 1, lo = Math.min(x0, x1), hi = Math.max(x0, x1); let best = 0, run = 0;
  for (let x = lo; x <= hi; x += 4) { const ok = (L.zipLines || []).some(w => w.haul && inTransfer(z, w, x) && lowEnd(w) * dir > lowEnd(z) * dir);
    run = ok ? run + 4 : 0; best = Math.max(best, run); }
  return best;
}
export function haulState(L) { return L.haulState || (L.haulState = { stones: [], cd: HAUL.first, rodeOn: null, cutFor: null, m: null }); }

/* ONE FRAME. c = { P, L, hb, hitSet, overlap, damage(x, dmg), sfx(name), say(x, y, text, col), burst(x, y, n, cols), shake(n), marks } */
export function haulStep(c, dt) {
  const { P, L } = c, H = haulState(L), M = L.mangonel; if (!M) return;
  if (!H.m) H.m = { x: M.x * 16 + 8, y: (M.y + 1) * 16, hp: HAUL.hp, wrecked: !!(c.marks && c.marks.has('mang:' + M.x)), armT: 0 };
  const m = H.m; m.armT = Math.max(0, m.armT - dt);
  /* the parted line: the crew strings it again */
  for (const z of L.zipLines || []) if (z.haul) { if (z.whip > 0) z.whip = Math.max(0, z.whip - dt); if (z.cut > 0) z.cut = Math.max(0, z.cut - dt); }
  /* THE STONES IN FLIGHT */
  for (const s of H.stones) { s.t += dt; if (s.t < s.T) continue; s.done = true;
    c.sfx('thud'); c.burst(s.tx, s.ty, 10, ['#8a8478', '#b3aca0', '#5a5650']); c.shake(3);
    if (s.cut && s.z) { s.z.cut = HAUL.restring; s.z.cut0 = HAUL.restring; s.z.whip = 0.6; s.z.fray = 0; c.sfx('crack'); c.say(s.tx, s.ty - 20, HAUL_SAY.cut, '#ff9a5c'); }
    if (P && !P.dead && Math.abs(P.x - s.tx) < HAUL.hitR && Math.abs(P.y - 12 - s.ty) < HAUL.hitR) { c.damage(s.tx, HAUL.dmg); if (P.zip) { P.zip = null; P.zipRelease = 0.6; } } }
  H.stones = H.stones.filter(s => !s.done);
  /* A RIDER ON A STONE LINE: the mangonel throws (not while wrecked, never two in flight) */
  const z = P && !P.dead ? P.zip : null;
  if (!z || !z.stones) { H.rodeOn = null; H.cd = HAUL.first; }
  else {
    if (H.rodeOn !== z) { H.rodeOn = z; H.cd = Math.max(H.cd, z.cutAt !== undefined ? 0 : HAUL.first * 0.5); }
    H.cd -= dt; const dir = P.zipDir || z.dir || 1;
    if (!m.wrecked && !H.stones.length) {
      if (z.cutAt !== undefined) {   /* THE REMIX: past its trigger, the stone for the LINE (not for you): it parts ahead of you */
        if (!(z.cut > 0) && H.cutFor !== z && (P.x - z.cutTrig) * dir >= 0 && (z.cutAt - P.x) * dir > 0) { H.cutFor = z; fire(c, H, m, z, z.cutAt, true); } }
      else if (H.cd <= 0) { const tx = P.x + dir * z.speed * HAUL.lead;
        if ((lowEnd(z) - tx) * dir > 16 && escapeRun(L, z, P.x + dir * 8, tx - dir * 8) >= HAUL.escape * 16) { fire(c, H, m, z, tx, false); H.cd = HAUL.every; } }
    }
  }
  if (H.cutFor && (!P || !P.zip)) H.cutFor = P && P.ground ? null : H.cutFor;   /* a fresh ride on the remix line (after a fall, or a return) draws its stone again */
  /* WRECK IT: five blows on the engine */
  if (!m.wrecked && c.hb && !c.hitSet.has(m) && c.overlap(c.hb, { l: m.x - 18, r: m.x + 18, t: m.y - 30, b: m.y })) { c.hitSet.add(m); m.hp--;
    c.sfx('clank'); c.burst(m.x, m.y - 14, 6, ['#8a919c', '#c9b27c']);
    c.say(m.x, m.y - 40, m.hp > 0 ? HAUL_SAY.more(m.hp) : HAUL_SAY.wrecked, m.hp > 0 ? '#ffd36b' : '#8fd160');
    if (m.hp <= 0) { m.wrecked = true; if (c.marks) c.marks.add('mang:' + M.x); c.sfx('crack'); c.sfx('heavy'); c.shake(5); c.burst(m.x, m.y - 16, 16, ['#5a3a24', '#8a919c', '#c9b27c']); } }
}
function fire(c, H, m, z, tx, cut) {
  const ty = lineY(z, tx); H.stones.push({ x0: m.x - 6, y0: m.y - 34, tx, ty, t: 0, T: HAUL.lead, z, cut });
  m.armT = HAUL.armT; c.sfx('thud'); c.sfx('charge'); c.say(m.x, m.y - 44, cut ? HAUL_SAY.forLine : 'STONES', '#ff9a5c');
}
/* where a stone is, k of the way (a lob: HAUL.arc px over the straight line at its middle) */
export const stoneAt = (s, k) => [s.x0 + (s.tx - s.x0) * k, s.y0 + (s.ty - s.y0) * k - 4 * HAUL.arc * k * (1 - k)];

/* ---------------- DRAWN (claude/lance4art: the pictures are src/stormhold-art.js) ---------------- */
export function drawHaul(g, L, cx, cy, VW, time) {
  const H = L.haulState, M = L.mangonel;
  SHA.drawHaulTower(g, cx, cy, VW, time);   /* the haul tower's jib and winch, the barbican's corbels, banners and lantern */
  /* the lines are HEAVY HEMP: a twisted strand under the zip line's own, with splices; a parted line whips and is strung again (the same whip as the bridge's signal ropes) */
  for (const z of L.zipLines || []) { if (!z.haul) continue; norm(z); if (z.xb < cx - 40 || z.xa > cx + VW + 40) continue;
    const X0 = Math.round(z.x0 - cx), Y0 = Math.round(z.y0 - cy), X1 = Math.round(z.x1 - cx), Y1 = Math.round(z.y1 - cy);
    if (!(z.cut > 0)) { SHA.drawHaulHemp(g, z, cx, cy); continue; }
    for (const [px, py, gy] of (z.posts || [])) { const x = Math.round(px - cx), y0 = Math.round(py - cy); g.fillStyle = '#3a3c50'; g.fillRect(x - 2, y0 - 4, 4, gy - py + 4); g.fillStyle = '#7a7e96'; g.fillRect(x - 2, y0 - 4, 1, gy - py + 4); g.fillStyle = '#2a2e38'; g.fillRect(x - 4, y0 - 6, 8, 3); g.fillStyle = '#8590a0'; g.fillRect(x - 4, y0 - 6, 8, 1); }
    if (z.whip > 0) { const k = 1 - z.whip / 0.6, pts = [];
      for (let i = 0; i <= 18; i++) { const t = i / 18; pts.push([X0 + (X1 - X0) * t, Y0 + (Y1 - Y0) * t + Math.sin(t * 9 + time * 40) * 6 * (1 - k) + k * 34 * Math.sin(t * Math.PI)]); }
      for (let i = 1; i < pts.length; i++) SHA.hempLine(g, pts[i - 1][0], pts[i - 1][1], pts[i][0], pts[i][1], 2, 0, i * 2);
      const [lx, ly] = pts[pts.length - 1]; g.fillStyle = '#e8dcc0'; for (let q = 0; q < 5; q++) g.fillRect(Math.round(lx) + (q % 3) - 1, Math.round(ly) + q * 2 - 2, 1, 2); }
    const rk = 1 - z.cut / (z.cut0 || HAUL.restring); SHA.hempLine(g, X0, Y0, X0 + (X1 - X0) * rk, Y0 + (Y1 - Y0) * rk, 1); }
  if (!M || !H || !H.m) { if (M) drawMangonel(g, { x: M.x * 16 + 8, y: (M.y + 1) * 16, armT: 0, wrecked: false }, cx, cy, time); return; }
  drawMangonel(g, H.m, cx, cy, time);
  /* THE STONES: the dotted arc the whole way, the stone on it, and the red ring ON THE ROPE where it lands */
  for (const s of H.stones) { const k = Math.min(1, s.t / s.T), arc = [];
    for (let i = 1; i < 16; i++) { const [ax, ay] = stoneAt(s, i / 16); if (i / 16 > k) arc.push([Math.round(ax - cx), Math.round(ay - cy)]); }
    const [sx, sy] = stoneAt(s, k); SHA.drawStoneFlight(g, k, Math.round(sx - cx), Math.round(sy - cy), Math.round(s.tx - cx), Math.round(s.ty - cy), arc, time); }
}
/* THE MANGONEL: three states (cocked, loosing, wrecked) - src/stormhold-art.js drawMangonelArt */
export function drawMangonel(g, m, cx, cy, time) { SHA.drawMangonelArt(g, m, cx, cy, time, HAUL.armT); }
