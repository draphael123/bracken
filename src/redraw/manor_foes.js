// src/redraw/manor_foes.js - THE HOLLOW MANOR's foes (claude/manorart; MANOR_SHIPS stays false). The hands (src/manor-hands.js) run them and draw through here:
//   THE POSSESSED SUIT  (the `armour` in skin 'mnsuit'): a rusted, battered common suit with a plain longsword and a ghost-green visor. walk / RISE (it is built from the heap by a ghost, told) /
//                       told THRUST (the sword drawn back) and its release / told CLEAVE (overhead) and its release / STUCK (the blade in the floor: the opening) / recover
//   THE SHADE           (the `haunt` in skin 'mnshade'): a hooded smoke wraith; asleep in the wall it is only a green glint; chasing, a flat shadow; the told LUNGE (red eyes, claws up), the
//                       lunge itself (a stretched streak), the withdrawal (it thins out)
//   THE POLTERGEIST     (the one new foe): faint and phased between throws (drift: wavering, see-through, x0.5), LIFTING a chair / plate / candlestick / book (the sheet taut, arms up, eyes lit,
//                       the thing shaking in the air: told), SPENT after the throw (solid, slumped, dust)
// Rect-based (px.js primitives only). The suit draws into a scratch sheet so a hit can flash it white and a rising suit can be built up out of the heap.
import { canvas, px, rect, line, circle, ellipse } from '../px.js';
import { MA, itemSprite } from './manor_art.js';
import { suitArt, ghostBust } from './castellan_art.js';

const R = Math.round, GHOST = MA.ghost;
const al = (hexc, k) => { const h = hexc.slice(1); return 'rgba(' + parseInt(h.slice(0, 2), 16) + ',' + parseInt(h.slice(2, 4), 16) + ',' + parseInt(h.slice(4, 6), 16) + ',' + k.toFixed(2) + ')'; };
export const SUIT_POSE = {
  walk: { arm: 35, reach: 14, lean: 0 }, rise: { arm: 80, reach: 8, lean: 0, slump: 3 },
  thrustTell: { arm: 0, reach: 3, lean: -4, crouch: 1 }, thrust: { arm: 0, reach: 17, lean: 5 },
  cleaveTell: { arm: -100, reach: 17, lean: -4 }, cleave: { arm: 70, reach: 18, lean: 6, crouch: 2 },
  stuck: { arm: 85, reach: 22, lean: 7, crouch: 3 },
};
let SC = null;
const scratch = () => { if (!SC) SC = canvas(96, 80); return SC; };
const OX = 48, OY = 62;
/* THE POSSESSED SUIT (ex, ey = its feet on screen; e.mode, e.face, e.mnWas ('thrust' | 'cleave': what a recover follows), e.modeT) */
export function drawSuitFoe(g, e, ex, ey, time, rise = 1.0) {
  ex = R(ex); ey = R(ey); const f = e.face || 1, [sc, sg] = scratch(); sg.setTransform(1, 0, 0, 1, 0, 0); sg.globalAlpha = 1; sg.globalCompositeOperation = 'source-over'; sg.clearRect(0, 0, 96, 80);
  let m = e.mode, pose;
  if (m === 'recover') m = e.mnWas === 'cleave' ? 'cleave' : 'thrust'; pose = SUIT_POSE[m] || SUIT_POSE.walk;
  const risingK = e.mode === 'rise' ? 1 - Math.max(0, e.modeT) / rise : 1;
  if (e.mode === 'rise') {   /* built up out of the heap: the legs first, the helm last, a ghost's green swirl round it */
    const k = risingK, dy = R((1 - k) * 16);
    suitArt(sg, OX, OY + dy, f, 'common', pose, { lit: k > 0.75, time, rust: true });
    sg.globalCompositeOperation = 'destination-out'; sg.fillStyle = '#000'; sg.fillRect(0, 0, 96, OY - R(6 + k * 40) + dy); sg.globalCompositeOperation = 'source-over';
    for (let q = 0; q < 6; q++) { const a = time * 7 + q * 1.047, rr = 12 * (1 - k * 0.5); rect(sg, OX + Math.cos(a) * rr - 1, OY - 16 - k * 10 + Math.sin(a) * 6, 2, 2, al(GHOST, 0.8)); }
  } else suitArt(sg, OX, OY, f, 'common', pose, { lit: true, walk: e.mode === 'walk', frame: Math.floor((e.anim || 0) * 4), time, rust: true });
  if (e.flash > 0) { sg.globalCompositeOperation = 'source-in'; sg.fillStyle = '#ffffff'; sg.fillRect(0, 0, 96, 80); sg.globalCompositeOperation = 'source-over'; }
  g.drawImage(sc, ex - OX, ey - OY);
  if (e.mode === 'stuck') { const tip = ex + f * 21 + 4; rect(g, tip - 4, ey - 1, 11, 2, '#0c1010'); rect(g, tip - 1, ey + 1, 6, 1, '#1c2020'); if ((time * 10) % 2 < 1) px(g, tip + f * 2, ey - 3, '#ffe0a0'); for (let q = 0; q < 2; q++) px(g, ex - f * 4 + q * 3, ey - 36 + R(Math.sin(time * 14 + q) * 1), al(GHOST, 0.7));   /* the ghost shudders in the helm: x1.5 */ }
  if (e.mode === 'thrustTell' || e.mode === 'cleaveTell') { const k = 1 - Math.max(0, e.modeT) / (e.mode === 'thrustTell' ? 0.8 : 1.0); rect(g, ex - 5, ey - 36, 10, 1, al('#ff6b6b', 0.15 + 0.5 * k)); }
}
/* THE SHADE (ex, ey = its centre on screen; e.mode: hide / chase / lungeTell / lunge / back; alpha from the light it stands in) */
export function drawShade(g, e, ex, ey, time, alpha) {
  ex = R(ex); ey = R(ey); const f = e.face || 1;
  if (e.mode === 'hide') { const ph = (time + (e.hx || 0) * 0.017) % 4.6; if (ph < 0.22) { rect(g, ex - 3, ey - 5, 2, 1, al(GHOST, 0.55)); rect(g, ex + 2, ey - 5, 2, 1, al(GHOST, 0.55)); } return; }
  const tell = e.mode === 'lungeTell', lunge = e.mode === 'lunge', back = e.mode === 'back'; g.globalAlpha = lunge ? 0.9 : alpha * (back ? 0.7 : 1);
  const tail = lunge ? 26 : 0;
  if (lunge) for (let k = 0; k < tail; k += 2) rect(g, ex - f * (6 + k), ey - 5 + (k >> 3) - 1, 2, 6 - (k >> 2), al('#1a2824', 0.75 - k / 40));
  for (let r = 0; r < 18; r++) { const wv = r > 6 ? Math.sin(time * 6 + r * 0.55) * (r - 6) * 0.22 : 0, ww = r < 4 ? 4 + r : Math.max(1, 7 - (r - 6) * 0.4), x0 = ex - ww - f * (lunge ? 0 : (r > 6 ? (r - 6) * 0.3 : 0)) + wv;
    rect(g, x0, ey - 12 + r, ww * 2, 1, r < 3 ? '#16201e' : r % 3 === 0 ? '#14201c' : '#1a2824'); if (r > 3 && r % 2 === 0) { px(g, x0, ey - 12 + r, '#2c403a'); px(g, x0 + ww * 2 - 1, ey - 12 + r, '#0c1412'); } }
  rect(g, ex - 3, ey - 9, 7, 5, '#06100c');                                                       /* the hood's hollow */
  const ec = tell || lunge ? '#ff5a3a' : GHOST; rect(g, ex - 3 + (f > 0 ? 1 : 0), ey - 8, 2, 2, ec); rect(g, ex + 1 + (f > 0 ? 1 : 0), ey - 8, 2, 2, ec); px(g, ex - 3 + (f > 0 ? 1 : 0), ey - 8, '#ffffff'); px(g, ex + 1 + (f > 0 ? 1 : 0), ey - 8, '#ffffff');
  if (tell) { for (const s of [0, 1]) { const cy = ey - 14 - s * 3 + R(Math.sin(time * 30) * 1); rect(g, ex + f * (4 + s * 5) - 1, cy, 2, 7, '#1a2824'); for (let q = 0; q < 3; q++) px(g, ex + f * (4 + s * 5) - 1 + q - 1, cy - 1, '#ff5a3a'); } }   /* the claws go up */
  else if (!lunge) { rect(g, ex + f * 6 - 1, ey - 4, 2, 5, '#1a2824'); px(g, ex + f * 6, ey + 1, '#2c403a'); }
  g.globalAlpha = 1;
}
/* THE POLTERGEIST (ex, ey = its centre on screen; e.mode: drift / liftTell / spent; e.item while lifting) */
export function drawPoltergeist(g, e, ex, ey, time, lift = 0.8) {
  ex = R(ex); ey = R(ey); const f = e.face || 1, solid = e.mode !== 'drift', tell = e.mode === 'liftTell', spent = e.mode === 'spent';
  g.globalAlpha = solid ? 0.92 : 0.36; const sink = spent ? 3 : 0, sheet = '#c8d8cc', sh = '#8a9a90', sd = '#5a6a62';
  for (let r = 0; r < 20 - sink; r++) { const dome = r < 5, ww = dome ? 3 + r : 8 + (r > 14 ? 1 : 0), wv = r > 12 ? Math.sin(time * (solid ? 5 : 3) + r * 0.7) * 1.2 : 0, y0 = ey - 14 + r + sink;
    rect(g, ex - ww + wv, y0, ww * 2, 1, r < 2 ? '#e8f0ea' : sheet); rect(g, ex - ww + wv, y0, 2, 1, '#e8f0ea'); rect(g, ex + ww - 2 + wv, y0, 2, 1, sh); if (r > 8 && r % 4 === 1) rect(g, ex - ww + 3 + wv, y0, 3, 1, sh); }
  for (let q = -2; q <= 2; q++) rect(g, ex + q * 3 - 1, ey + 5 - sink + R(Math.sin(time * 6 + q) * 1), 3, 2, solid ? sheet : sh);   /* the scalloped hem */
  const eye = tell ? GHOST : '#141a18'; rect(g, ex - 4, ey - 8 + sink, 3, 4, '#141a18'); rect(g, ex + 1, ey - 8 + sink, 3, 4, '#141a18'); if (tell) { rect(g, ex - 3, ey - 7, 2, 2, GHOST); rect(g, ex + 2, ey - 7, 2, 2, GHOST); } else if (!spent) { px(g, ex - 3, ey - 7, al(GHOST, 0.5)); px(g, ex + 2, ey - 7, al(GHOST, 0.5)); void eye; }
  rect(g, ex - 2, ey - 2 + sink, 4, 2, '#141a18');   /* a gaping mouth */
  if (tell) { for (const s of [-1, 1]) { rect(g, ex + s * 9 - 1, ey - 16, 3, 9, sheet); rect(g, ex + s * 9 - 1, ey - 17, 3, 2, '#e8f0ea'); rect(g, ex + s * 9 - 1, ey - 8, 3, 3, sh); } g.globalAlpha = 1; for (let k = 0; k < 3; k++) px(g, ex - 8 + k * 8, ey - 22 - R(((time * 3 + k * 0.4) % 1) * 6), al(GHOST, 0.7)); }
  else { rect(g, ex - 11 + sink, ey - 4 + sink, 4, 6, sheet); rect(g, ex + 7 - sink, ey - 4 + sink, 4, 6, sheet); rect(g, ex - 11 + sink, ey + 1 + sink, 4, 1, sh); rect(g, ex + 7 - sink, ey + 1 + sink, 4, 1, sh); }
  g.globalAlpha = 1;
  if (spent) for (let k = 0; k < 3; k++) { const ph = (time * 2 + k * 0.33) % 1; rect(g, ex - 8 + k * 7, ey + 5 - R(ph * 6), 2, 2, al('#b8c8bc', 0.6 * (1 - ph))); }
  if (tell) { const k = 1 - Math.max(0, e.modeT) / lift, ix = ex + f * 10 + R(Math.sin(time * 40) * 1.5), iy = ey - 6 - R(k * 12); g.drawImage(itemSprite(e.item || 'CHAIR', (time * 8) % 2 < 1 ? 0 : 1), ix - 7, iy - 7); }
}
