// src/redraw/heart_art.js - THE HEART OF THE MOUNTAIN's ART PASS (claude/art4, over the greybox claude/heartlevel). DRAWING ONLY: no tile, entity, number or timer changes.
// src/heart-mountain-hands.js (drawWorld / drawFront / drawFoe / drawStructure / drawVent / drawBackdrop) calls these, each in try/catch (the greybox stays as the fallback).
// Plain fillRect pixels (no paths) so tools/heart-art.mjs renders everything in Node. The basalt is the caldera kit's (src/redraw/caldera_tiles.js: black basalt, ember
// cracks, red / fire / white-hot) so the tube, the lake and the drake's room are one rock.
//   THE CRUST        a cooled skin of plates over the magma: chipped lit lip, a glowing underside, an ember crack network that WAKES with the beat (k 0..1); HELD = slate
//                    grey with a frost rim and a rune-lit lip; the last seconds of a hold flicker; MELTED = the skin's last plates sinking, a heaving bright surface
//   A WARD-STONE     an obsidian standing stone of the old keepers on a three-step plinth: a cyan rune that breathes; HOLDING it burns bright with a frost halo and rune
//                    motes up the line to each crust; the last seconds flicker; SPENT it is dead grey and cracked, a wisp of smoke
//   THE CHAINS       the seal's chains: oval links, flat and edge-on, hot toward the seal (they run DOWN), a staple in the roof rock, hot veins running with the beat
//   A HEART VENT     a fumarole: a cracked basalt collar, glowing through its mouth as the beat nears; the SURGE = a column of fire, white-hot core, sparks; steam between
//   THE MAGMA        the pool's skin pulses with the beat (bright veins, bubbles, heave on the surge), drawn over the pool code's own (drawPools)
//   THE LEAPER       a magma eel-fish: basalt scales with a glowing dorsal comb and ember belly, a lamprey's jaw; under = a long shadow and a spine breaking the skin;
//                    TELL = a ring and bubbles; leap, thrash, bite (jaw wide), flop, hurt; bakeLeaper() renders the poses to a sprite set (card, corpse)
//   THE LEDGE COLUMNS basalt prisms under the caldera's ledges   THE SEAL'S DOOR   the carved arch over the caldera's door, the sigil ring pulsing, the slab when it is shut
//   THE BACKDROP     the caldera's sky + the cone's inside: hanging rock, far veins, the heart's red bloom low in the dark, breathing with the beat
import { canvas, rect, px, mulberry, outline, flipX, whiten } from '../px.js';
import { drawBackdrop as calderaBackdrop } from './fire_drake_set.js';

const R = rect, ri = Math.round, T = 16;
const K = { b0: '#0e0a0e', b1: '#181218', b2: '#241a20', b3: '#33262c', b4: '#4a3a3a', b5: '#6a5648', b6: '#8c7860', red: '#c8321a', fire: '#ff5a1a', em: '#ff9a3a', emH: '#ffe08a', white: '#fff6dc' };
const FROST = { d: '#4a5660', m: '#6a7680', l: '#9aa8b4', h: '#d8e4ec', w: '#f0f8ff' };
const RUNE = { d: '#2a4a6a', m: '#4a9ad8', l: '#9ad8ff', h: '#e8f8ff' };
const IRON = ['#1c1c22', '#33333c', '#4a4a56', '#6a6a78', '#9a9aa8'];
const wave = (t, f, p = 0) => 0.5 + 0.5 * Math.sin(t * f + p);
const hs = (a, b) => { let h = (Math.imul(a | 0, 73856093) ^ Math.imul(b | 0, 19349663)) >>> 0; h = Math.imul(h ^ (h >>> 13), 1274126177) >>> 0; return h; };
const memo = new Map(); const once = (k, fn) => { if (!memo.has(k)) memo.set(k, fn()); return memo.get(k); };
const pack = (frames, ax, ay, w, h) => { const white = frames.map(c => whiten(c)); return { R: frames, L: frames.map(flipX), white: { R: white, L: white.map(flipX) }, ax, ay, w, h }; };
const alpha = (g, a, fn) => { g.globalAlpha = a; fn(); g.globalAlpha = 1; };

// ---------------- THE CRUST ----------------
// x0, x1 = screen px of the span's left / right edge; y = screen y of its row's top; k = the beat's glow 0..1; st = 'cool' | 'held' | 'warn' (a hold's last seconds) | 'melted'; id seeds it
export function drawCrust(g, x0, x1, y, k, st, time, id = 0) {
  x0 = ri(x0); x1 = ri(x1); y = ri(y); const w = x1 - x0; if (w < 4) return;
  if (st === 'melted') {   // the skin's last plates: a few dark flakes riding the heave, bright slicks, a bubble
    for (let x = 0; x < w; x += 9) { const hh = hs(id, x), dx = (hh & 7), ly = y + 11 + ri(Math.sin(time * 3 + x) * 1.2); if (hh % 3 === 0) { R(g, x0 + x + dx, ly, 4, 1, K.b2); R(g, x0 + x + dx, ly, 2, 1, K.b4); } }
    alpha(g, 0.5, () => { for (let x = 0; x < w; x += 5) R(g, x0 + x + ((time * 20 + x) % 3 | 0), y + 12 + ((x * 7 + id) % 3), 3, 1, x % 10 ? K.em : K.emH); });
    for (let i = 0; i < 3; i++) { const f = (time * 1.4 + i * 0.33 + hs(id, i) % 7 * 0.1) % 1; alpha(g, 0.7 * (1 - f), () => R(g, x0 + 6 + ((hs(id, i + 9) % Math.max(1, w - 12))), y + 11 - ri(f * 7), 2, 2, K.emH)); }
    return;
  }
  const held = st === 'held' || (st === 'warn' && (time * 22) % 2 < 1);
  const body = held ? FROST.m : K.b3, lip = held ? FROST.h : K.b5, dark = held ? FROST.d : K.b1, mid = held ? FROST.l : K.b4;
  // the plate: 8 px of skin, a chipped lit lip, plate seams every ~11 px, a rim that is slightly ragged
  R(g, x0, y, w, 8, body); R(g, x0, y + 5, w, 3, dark); R(g, x0, y, w, 1, lip);
  for (let x = 0; x < w; x++) { const j = hs(id, x) % 7; if (j === 0) { R(g, x0 + x, y, 1, 1, mid); } if (j === 3 && x % 2) R(g, x0 + x, y + 1, 1, 1, mid); }
  for (let x = 9 + (id % 4); x < w - 3; x += 11 + hs(id, x) % 4) { R(g, x0 + x, y + 1, 1, 6, dark); R(g, x0 + x + 1, y + 1, 1, 1, lip); }
  R(g, x0, y + 1, 1, 6, dark); R(g, x1 - 1, y + 1, 1, 6, dark);   // the broken ends
  if (!held) {
    // the glowing UNDERSIDE: skin over fire shows red at its belly, and bleeds through the seams as the beat nears
    const a = 0.35 + 0.65 * k; alpha(g, a, () => { R(g, x0 + 1, y + 7, w - 2, 1, k > 0.66 ? K.emH : K.em); R(g, x0 + 1, y + 8, w - 2, 1, K.red); });
    for (let x = 6; x < w - 3; x += 11) { const jx = x + (hs(id, x) % 3); if (jx >= w - 2) continue;   // ember cracks: zig-zag down from the lip, brighter and whiter as k climbs
      const c = k > 0.8 ? K.emH : k > 0.45 ? K.em : K.red; alpha(g, 0.3 + 0.7 * k, () => { R(g, x0 + jx, y + 1, 1, 2, c); R(g, x0 + jx + 1, y + 3, 1, 2, c); R(g, x0 + jx, y + 5, 1, 2, c); if (k > 0.5) R(g, x0 + jx + 1, y + 6, 1, 1, K.emH); }); }
    if (k > 0.7) alpha(g, (k - 0.7) * 1.4, () => { for (let x = 3; x < w - 3; x += 7) R(g, x0 + x, y - 1 - ((time * 12 + x) % 3 | 0), 1, 1, K.emH); });   // sparks lifting off the skin just before it goes
  } else {
    // held: frosted, a rune-light running the lip, a sheen
    alpha(g, 0.55, () => { for (let x = 3; x < w - 2; x += 6) R(g, x0 + x, y + 2, 2, 1, FROST.w); });
    alpha(g, 0.35 + 0.25 * wave(time, 4, id), () => { R(g, x0 + 1, y, w - 2, 1, RUNE.l); });
    R(g, x0 + 1, y + 7, w - 2, 1, FROST.d);
  }
}

// ---------------- A WARD-STONE ----------------
// x = screen x of its centre, y = its foot; hold = seconds left of the hold (0 none); warn = HM.ward.warn; spent = seconds spent left; k = the beat's glow
export function drawWard(g, x, y, hold, warn, spent, time, k = 0) {
  x = ri(x); y = ri(y);
  const holding = hold > 0, flick = holding && hold < warn && (time * 22) % 2 < 1, dead = spent > 0;
  const lit = dead ? 0 : holding ? (flick ? 0.35 : 1) : 0.45 + 0.2 * wave(time, 2.4);
  // the plinth: three stepped slabs of the keepers' stone, chipped
  R(g, x - 8, y - 3, 17, 3, K.b3); R(g, x - 8, y - 3, 17, 1, K.b5); R(g, x - 6, y - 6, 13, 3, K.b2); R(g, x - 6, y - 6, 13, 1, K.b4); R(g, x - 5, y - 8, 11, 2, K.b3); R(g, x - 8, y - 1, 3, 1, K.b1); R(g, x + 6, y - 2, 2, 1, K.b1);
  // the stone: an obsidian shard, faceted, a lit left arris and a glassy highlight, narrowing to a broken point
  for (let r = 0; r < 24; r++) { const hw = r < 3 ? 2 + r : r > 20 ? 3 : 4; const yy = y - 9 - r; R(g, x - hw, yy, hw * 2 + 1, 1, r % 5 === 4 ? '#0e0814' : '#1a1224'); R(g, x - hw, yy, 1, 1, '#4a4060'); R(g, x + hw - 1, yy, 1, 1, '#0a0610'); if (r % 7 === 2) R(g, x - 1, yy, 2, 1, '#2a2038'); }
  R(g, x - 2, y - 32, 5, 1, '#2a2038'); R(g, x - 1, y - 33, 3, 1, '#4a4060'); R(g, x, y - 34, 1, 1, '#6a6088'); R(g, x - 3, y - 20, 1, 6, '#7a70a0');
  if (dead) { for (const [cx2, cy2] of [[0, 14], [1, 15], [0, 16], [-1, 17], [0, 18]]) R(g, x + cx2, y - cy2 - 8, 1, 1, '#5a4a40'); R(g, x - 2, y - 20, 4, 1, '#3a3448'); R(g, x - 1, y - 21, 2, 1, '#3a3448');
    for (let i = 0; i < 3; i++) { const f = (time * 0.5 + i / 3) % 1; alpha(g, 0.5 * (1 - f), () => R(g, x + ri(Math.sin(f * 6 + i) * 3), y - 36 - ri(f * 12), 1, 1, '#9a948a')); } return; }
  // the rune: a diamond, a stroke, a crossbar, a dot - lit cyan; bright and haloed while it holds
  const a = Math.max(0.3, lit);
  alpha(g, a, () => { R(g, x - 1, y - 28, 3, 1, RUNE.l); R(g, x - 2, y - 27, 1, 1, RUNE.m); R(g, x + 2, y - 27, 1, 1, RUNE.m); R(g, x - 1, y - 26, 3, 1, RUNE.l); R(g, x, y - 25, 1, 6, RUNE.l); R(g, x - 2, y - 22, 5, 1, RUNE.m); R(g, x, y - 18, 1, 1, RUNE.h); R(g, x - 1, y - 16, 3, 1, RUNE.m); R(g, x, y - 15, 1, 2, RUNE.l); });
  if (holding && !flick) {
    alpha(g, 0.16 + 0.07 * wave(time, 5), () => { for (let r = 3; r >= 0; r--) R(g, x - 9 - r * 2, y - 32 + r * 2, 19 + r * 4, 30 - r * 4, RUNE.m); });
    for (let i = 0; i < 6; i++) { const f = (time * 0.7 + i / 6) % 1; alpha(g, 1 - f, () => R(g, x + ri(Math.sin(f * 8 + i * 2) * 8), y - 10 - ri(f * 30), 1, 1, i % 2 ? RUNE.h : RUNE.l)); }
    R(g, x - 4, y - 9, 9, 1, FROST.h);
  } else if (!holding) alpha(g, 0.25 + 0.4 * k, () => R(g, x - 5, y - 1, 11, 1, RUNE.m));   // idle: a faint glow at the foot that answers the beat
}
// the rune-light line from a stone to the middle of a crust it holds: stepped motes, no stroke
export function drawWardLine(g, x1, y1, x2, y2, time) {
  const n = Math.max(2, ri(Math.hypot(x2 - x1, y2 - y1) / 5)); for (let i = 0; i <= n; i++) { const f = i / n, wob = Math.sin(f * 9 - time * 6) * 1.5; { const ph = ((((i / n) * 3 - time * 2) % 1) + 1) % 1; alpha(g, 0.25 + 0.5 * ph, () => R(g, ri(x1 + (x2 - x1) * f), ri(y1 + (y2 - y1) * f + wob), 2, 1, RUNE.l)); } }
}

// ---------------- THE SEAL'S CHAINS ----------------
// x = screen x; y0, y1 = screen y of the top and bottom (the roof, the pocket); heat0 = world fraction down the whole mountain (hotter lower); k = beat glow
export function drawHeartChain(g, x, y0, y1, heat0, k, time, id = 0) {
  x = ri(x); y0 = ri(y0); y1 = ri(y1); const n = Math.max(1, ri((y1 - y0) / 5));
  R(g, x - 4, y0, 9, 3, IRON[1]); R(g, x - 4, y0, 9, 1, IRON[3]); R(g, x - 2, y0 + 3, 5, 2, IRON[2]); px(g, x, y0 + 1, IRON[4]);   // the staple driven into the roof
  for (let i = 0; i < n; i++) { const y = y0 + 5 + i * 5; if (y > y1) break; const f = i / n, hot = Math.max(0, Math.min(1, heat0 + f * 0.6 + k * 0.25)), flat = i & 1;
    const lo = hot > 0.7 ? K.fire : hot > 0.4 ? K.red : IRON[1], mid = hot > 0.7 ? K.em : hot > 0.4 ? K.red : IRON[2], hi = hot > 0.7 ? K.emH : hot > 0.4 ? K.em : IRON[4];
    if (flat) { R(g, x - 3, y, 7, 4, IRON[0]); R(g, x - 2, y + 1, 5, 2, lo); R(g, x - 3, y, 6, 1, hi); R(g, x - 2, y + 3, 5, 1, mid); }
    else { R(g, x - 1, y - 1, 3, 6, IRON[0]); R(g, x, y, 1, 4, lo); R(g, x - 1, y - 1, 1, 5, hi); }
  }
  // a hot vein running down the links with the beat
  if (k > 0.05) { const sy = y0 + ri(((time * 40) % Math.max(1, y1 - y0))); alpha(g, Math.min(1, k + 0.2), () => R(g, x - 1, sy, 3, 5, K.emH)); }
  R(g, x - 3, y1 - 3, 7, 3, IRON[1]); R(g, x - 3, y1 - 3, 7, 1, IRON[3]);   // the last link, a shackle
}

// ---------------- A HEART VENT ----------------
// x = centre screen x, fy = the floor's screen y, w = half width, h = column height px; mode = 'still' | 'warm' (told) | 'blow'; warmK 0..1; time
export function drawHeartVent(g, x, fy, w, h, mode, warmK, time, id = 0) {
  x = ri(x); fy = ri(fy); w = w || 8;
  // the collar: broken basalt lips round a mouth, a glow in it
  R(g, x - w - 3, fy - 3, w * 2 + 6, 3, K.b2); R(g, x - w - 3, fy - 3, w * 2 + 6, 1, K.b4); R(g, x - w - 5, fy - 2, 3, 2, K.b3); R(g, x + w + 2, fy - 2, 3, 2, K.b3);
  R(g, x - w + 1, fy - 5, 3, 2, K.b3); R(g, x + w - 4, fy - 5, 4, 2, K.b2); R(g, x - w + 1, fy - 5, 3, 1, K.b5);
  const gl = mode === 'blow' ? 1 : mode === 'warm' ? 0.4 + 0.5 * warmK : 0.18 + 0.1 * wave(time, 2, id);
  alpha(g, 0.4 + 0.6 * gl, () => { for (let q = -w + 2; q <= w - 2; q += 3) R(g, x + q, fy - 2, 2, 1, gl > 0.8 ? K.emH : gl > 0.45 ? K.em : K.red); });
  if (mode === 'still') { for (let i = 0; i < 2; i++) { const f = (time * 0.35 + i * 0.5 + id * 0.13) % 1; alpha(g, 0.28 * (1 - f), () => R(g, x - 3 + i * 5 + ri(Math.sin(f * 5 + i) * 2), fy - 7 - ri(f * 14), 2, 2, '#8a8078')); } return; }   // steam between beats
  if (mode === 'warm') { alpha(g, 0.3 + 0.3 * warmK, () => { for (let r = 0; r < 3; r++) R(g, x - w - r * 2, fy - 4 - r, w * 2 + r * 4, 1, K.fire); });
    for (let i = 0; i < 4; i++) { const f = (time * 3 + i / 4) % 1; alpha(g, 0.9 * (1 - f) * warmK, () => R(g, x - 5 + i * 3, fy - 6 - ri(f * 9), 1, 2, i & 1 ? K.emH : K.fire)); } return; }
  // THE SURGE: a column of fire, white-hot core, ragged edges that lick, sparks flung off the top, a flare at the foot
  const hh = h; for (let yy = 0; yy < hh; yy += 2) { const f = yy / hh, ww = Math.max(2, ri(w * (1 - f * 0.35) + Math.sin(yy * 0.45 + time * 28) * 1.6)), cw = Math.max(1, ri(ww * 0.45));
    alpha(g, 0.95 - f * 0.45, () => { R(g, x - ww, fy - 6 - yy, ww * 2, 2, yy % 6 < 3 ? K.fire : K.em); R(g, x - cw, fy - 6 - yy, cw * 2, 2, yy % 8 < 4 ? K.emH : K.white); }); }
  for (let i = 0; i < 10; i++) { const f = (time * 2.2 + i * 0.1) % 1, sx = x + ri((i - 4.5) * 4 * f + Math.sin(i * 3 + time * 9) * 2), sy = fy - hh - ri(f * 18) + ri(f * f * 22); alpha(g, 1 - f, () => R(g, sx, sy, 1, 1, i & 1 ? K.emH : K.fire)); }
  alpha(g, 0.28, () => R(g, x - w - 6, fy - 8, w * 2 + 12, 8, K.fire));
}

// ---------------- THE MAGMA (a pool's skin, over the pool code's own) ----------------
// x0, x1 = screen px; ys = screen y of the surface; k = beat glow; surge = 0..1 (1 during a surge)
export function drawMagmaSkin(g, x0, x1, ys, k, surge, time, id = 0, depth = 40) {
  x0 = ri(x0); x1 = ri(x1); ys = ri(ys); const w = x1 - x0; if (w < 4) return;
  alpha(g, 0.35 + 0.35 * k, () => R(g, x0, ys, w, depth, K.fire));
  alpha(g, 0.5, () => { for (let x = 0; x < w; x += 3) { const hv = ri(Math.sin(x * 0.12 + time * (1.2 + surge * 3)) * (1 + surge * 3)); R(g, x0 + x, ys + hv, 3, 1, hv < 0 ? K.emH : K.em); } });
  for (let x = 7; x < w - 4; x += 19) { const f = (time * (0.4 + k) + hs(id, x) % 10 * 0.1) % 1; alpha(g, 0.6 * (1 - f) + 0.2, () => { R(g, x0 + x, ys + 2 + ri(f * 6), 6, 1, K.emH); R(g, x0 + x + 1, ys + 3 + ri(f * 6), 4, 1, K.em); }); }   // bright veins drifting on it
  for (let i = 0; i < Math.max(1, ri(w / 40)); i++) { const f = (time * (0.5 + surge) + i * 0.37 + hs(id, i) % 5 * 0.2) % 1, bx = x0 + 4 + (hs(id, i * 3) % Math.max(1, w - 8)); alpha(g, 0.8 * (1 - f), () => { R(g, bx, ys - ri(f * 5), 3, 1, K.emH); R(g, bx + 1, ys - 1 - ri(f * 5), 1, 1, K.white); }); }   // bubbles breaking
  if (surge > 0) alpha(g, 0.6 * surge, () => { for (let x = 0; x < w; x += 8) R(g, x0 + x, ys - 3 - ((hs(id, x + ri(time * 14)) % 4)), 2, 2, K.emH); });   // the surge's spatter
}

// ---------------- THE LEAPER ----------------
const LP = { d: '#1a0c0a', s: '#3a1a14', s2: '#52261a', hi: '#8a3a22', belly: '#c8461a', belly2: '#ff9a3a', eye: '#fff6c8', tooth: '#f0e4d0', throat: '#ff7a2a' };
// x, y = screen (y = the body's lower line, as the greybox did); f = facing; mode: under | leapTell | leap | fall | thrash | biteTell | bite | flop; vy; tellK 0..1; hurt
export function drawLeaper(g, x, y, f, mode, vy, time, hurt, homeY, tellK = 0) {
  x = ri(x); y = ri(y);
  if (mode === 'under') { const sy = ri(homeY) + 3; alpha(g, 0.5, () => { R(g, x - 12, sy, 24, 3, LP.d); R(g, x - 9, sy + 3, 18, 1, LP.s); }); const r = wave(time, 4); alpha(g, 0.35 + 0.3 * r, () => { R(g, x - 3 + ri(f * 9), sy - 1, 1, 2, K.em); });   // a long shadow under the skin, one glint of ember where the head is
    return; }
  if (mode === 'leapTell') { const sy = ri(homeY);
    for (let i = 0; i < 3; i++) { const r = (time * 2.4 + i / 3) % 1; alpha(g, 0.8 * (1 - r), () => { R(g, x - 4 - ri(r * 10), sy, 8 + ri(r * 20), 1, K.emH); R(g, x - 3 - ri(r * 8), sy + 1, 6 + ri(r * 16), 1, K.em); }); }
    for (let i = 0; i < 5; i++) { const bx = x - 8 + ((i * 7 + ri(time * 20)) % 17), by = sy - ((time * 30 + i * 5) % 9); R(g, bx, ri(by), 2, 2, i & 1 ? K.emH : K.em); }
    R(g, x - 1 + f * 4, sy - 5 - ri(tellK * 3), 3, 5 + ri(tellK * 3), LP.s2); R(g, x + f * 4, sy - 6 - ri(tellK * 3), 1, 2, K.fire);   // the dorsal comb breaking the skin, glowing
    alpha(g, 0.35 + 0.4 * wave(time, 18), () => R(g, x - 10, sy - 1, 20, 3, K.em)); return; }
  const air = mode === 'leap' || mode === 'fall' || mode === 'flop', arch = air ? Math.max(-1, Math.min(1, (vy || 0) / 300)) : 0, wig = mode === 'thrash' ? Math.sin(time * 26) * 2.2 : 0, open = mode === 'bite' ? 3 : mode === 'biteTell' ? 1 : 0;
  // eight segments, head first: the body arches over the leap (head high on the way up, nose-down on the way back), thrashes along the stone
  const segs = [];
  for (let i = 0; i < 8; i++) { const bx = x - f * (i * 3 - 7), by = y - 7 + ri(arch * (i - 3.5) * 1.7 + (i % 2 ? wig : -wig) * (mode === 'thrash' ? 1 : 0.2)); segs.push([bx, by, i]); }
  for (let i = segs.length - 1; i >= 0; i--) { const [bx, by] = segs[i], hh = Math.max(3, 8 - ri(i * 0.55)), top = by - hh + 4;
    R(g, bx - 2, top, 5, hh, i % 2 ? LP.s : LP.s2); R(g, bx - 2, top, 5, 1, LP.hi); R(g, bx - 2, top + hh - 2, 5, 2, i % 2 ? LP.belly : LP.belly2);   // scale, a lit back, an ember belly in bands
    if (i > 0 && i < 7) { R(g, bx, top - 1 - (i % 2), 1, 2 + (i % 2), LP.hi); px(g, bx, top - 1 - (i % 2), i % 3 ? K.em : K.emH); }   // the dorsal comb: glowing spines
    if (i === 6) { R(g, bx - f * 3 - 1, by - 2, 2, 6, LP.s); R(g, bx - f * 4 - 1, by - 1, 2, 4, LP.s2); }   // the tail fin
  }
  // the head: a wedge with a lamprey's mouth; the jaw drops for the bite, teeth bared, a white-hot throat
  const [hx, hy] = segs[0], fx = hx + f * 4;
  R(g, f > 0 ? hx : hx - 4, hy - 4, 5, 5, LP.s2); R(g, f > 0 ? hx : hx - 4, hy - 4, 5, 1, LP.hi); R(g, f > 0 ? hx + 2 : hx - 6, hy - 3, 4, 3 + open, LP.s);
  R(g, fx, hy - 4 + (f > 0 ? 0 : 0), 1, 1, LP.eye); px(g, fx - f, hy - 4, K.fire);   // the eye
  if (open > 0) { const jx = f > 0 ? hx + 2 : hx - 7; R(g, jx, hy - 1, 5, open + 1, LP.throat); for (let t2 = 0; t2 < 3; t2++) { R(g, jx + t2 * 2, hy - 1, 1, 1, LP.tooth); R(g, jx + t2 * 2, hy + open - 1, 1, 1, LP.tooth); } if (open > 1) alpha(g, 0.6, () => R(g, jx, hy, 5, open, K.emH)); }
  else { for (let t2 = 0; t2 < 2; t2++) R(g, (f > 0 ? hx + 3 : hx - 5) + t2 * 2, hy, 1, 1, LP.tooth); }
  R(g, hx - f, hy - 1, 1, 3, LP.d); R(g, hx - f * 2, hy - 1, 1, 3, LP.d);   // gill slits
  if (air) for (let i = 0; i < 4; i++) { const sx = segs[7][0] - f * (2 + i * 2), sy = segs[7][1] + 2 + ri(Math.sin(time * 20 + i) * 1.5); alpha(g, 0.8 - i * 0.18, () => R(g, sx, sy, 1, 1, i % 2 ? K.fire : K.emH)); }   // drips of magma off its flank
  if (hurt) alpha(g, 0.35, () => R(g, x - 9, y - 10, 18, 6, '#ffffff'));
}
export function bakeLeaper() {   // the poses on a sprite set: 0 thrash, 1 leap up, 2 leap down, 3 biteTell, 4 bite, 5 flop, 6 hurt (last) - 32 x 20, anchor (16, 18)
  return once('leaper', () => { const poses = [['thrash', 0], ['leap', -300], ['leap', 300], ['biteTell', 0], ['bite', 0], ['flop', 120], ['thrash', 0, false]], W = 32, H = 20;
    const frames = poses.map(([m, vy, hurt], i) => { const [c, g] = canvas(W, H); drawLeaper(g, 18, 18, 1, m, vy, 0.17 * i, !!hurt, 18); return outline(c, '#000000'); }); return pack(frames, 16, 18, 14, 8); });
}

// ---------------- THE LEDGE COLUMNS ----------------
export function drawColumn(g, l, r, t, b, time) {   // the screen box of one ledge's pedestal: basalt prisms, joints, ember seams, a chipped cap
  const w = r - l - 8; if (w < 4) return; const X = ri(l + 4), Y = ri(t + 6), H = ri(b - t - 6), n = Math.max(2, ri(w / 7));
  for (let i = 0; i < n; i++) { const px0 = X + ri(i * w / n), pw = ri((i + 1) * w / n) - ri(i * w / n);
    R(g, px0, Y, pw, H, i % 2 ? K.b2 : K.b3); R(g, px0, Y, 1, H, K.b5); R(g, px0 + pw - 1, Y, 1, H, K.b0);
    for (let yy = 8 + (i * 5) % 9; yy < H; yy += 17) R(g, px0, Y + yy, pw, 1, K.b1);   // the joints
    if ((i + ri(l)) % 3 === 0) { alpha(g, 0.5 + 0.4 * wave(time, 1.1, i), () => { R(g, px0 + 2, Y + 10, 1, 7, K.red); R(g, px0 + 3, Y + 17, 1, 5, K.em); }); } }
  R(g, X - 2, Y - 3, w + 4, 4, K.b4); R(g, X - 2, Y - 3, w + 4, 1, K.b6); R(g, X + 3, Y - 3, 2, 1, K.b3);
}

// ---------------- THE SEAL'S DOOR (the caldera's lintel: x = the door column's screen left, gap rows [top, bottom] in screen y) ----------------
export function drawSealDoor(g, x, yTop, yBot, shut, k, time) {
  x = ri(x); yTop = ri(yTop); yBot = ri(yBot); const cxm = x + 8, ringY = yTop - 18, pulse = 0.4 + 0.6 * k;
  // the jambs: two stout basalt posts with iron bands, standing a tile clear either side of the door
  for (const jx of [x - 20, x + 20]) { R(g, jx, yTop - 30, 12, yBot - yTop + 30, K.b2); R(g, jx, yTop - 30, 2, yBot - yTop + 30, K.b5); R(g, jx + 10, yTop - 30, 2, yBot - yTop + 30, K.b0);
    for (let yy = yTop - 20; yy < yBot - 6; yy += 22) { R(g, jx - 1, yy, 14, 3, IRON[1]); R(g, jx - 1, yy, 14, 1, IRON[3]); px(g, jx + 1, yy + 1, IRON[4]); px(g, jx + 10, yy + 1, IRON[4]); } }
  // the lintel: a heavy stone with the keepers' sigil ring set in it, burning with the beat
  R(g, x - 22, yTop - 34, 48, 8, K.b3); R(g, x - 22, yTop - 34, 48, 1, K.b6); R(g, x - 22, yTop - 27, 48, 1, K.b1); R(g, x - 4, yTop - 36, 24, 3, K.b4);
  for (let a = 0; a < 16; a++) { const th = a / 16 * Math.PI * 2, sx = cxm + ri(Math.cos(th) * 9), sy = ringY + ri(Math.sin(th) * 9) - 4; alpha(g, 0.35 + 0.65 * pulse, () => R(g, sx, sy, 1, 1, a % 4 === 0 ? K.emH : K.em)); }
  alpha(g, 0.4 + 0.6 * pulse, () => { R(g, cxm - 1, ringY - 8, 3, 9, K.fire); R(g, cxm - 4, ringY - 5, 9, 3, K.fire); R(g, cxm, ringY - 4, 1, 1, K.emH); });
  alpha(g, 0.1 + 0.18 * k, () => R(g, x - 22, yTop - 40, 48, 22, K.fire));
  if (shut) {   // the slab: a basalt door bound in iron, a split seam down it glowing, the same sigil scored deep
    R(g, x, yTop, 16, yBot - yTop, K.b2); R(g, x, yTop, 2, yBot - yTop, K.b4); R(g, x + 14, yTop, 2, yBot - yTop, K.b0);
    for (let yy = yTop + 6; yy < yBot - 4; yy += 22) { R(g, x, yy, 16, 3, IRON[1]); R(g, x, yy, 16, 1, IRON[3]); }
    alpha(g, 0.4 + 0.6 * pulse, () => { R(g, x + 7, yTop + 2, 1, yBot - yTop - 4, K.fire); R(g, x + 8, yTop + 8, 1, yBot - yTop - 16, K.emH); });
  } else alpha(g, 0.14 + 0.1 * k, () => R(g, x - 4, yTop, 24, yBot - yTop, K.fire));   // open: the dark passage, a warmth coming through
}

// ---------------- THE BACKDROP (the caldera's, plus the cone's inside) ----------------
// pulse = the beat's glow 0..1; zone = 0 (the throat) .. 1 (the seal): the nearer the heart, the redder the dark
export function drawHeartBackdrop(g, cx, cy, VW, VH, L, time, dY, full, pulse = 0, zone = 0) {
  calderaBackdrop(g, cx, cy, VW, VH, L, time, dY, full);
  // the cone's inside: stalactite rock hanging from the roof, near and far, black against the glow
  for (const [lyr, par, col, hmax] of [[0, 0.12, '#1a1014', 60], [1, 0.3, '#120a0e', 90]]) {
    const off = ri(cx * par), step = lyr ? 46 : 31;
    for (let x = -(off % step) - step; x < VW + step; x += step) { const wx = ri(x + off), h = 14 + hs(wx, lyr + 3) % hmax, bw = 9 + hs(wx, lyr + 9) % 13;
      for (let yy = 0; yy < h; yy += 2) { const w2 = Math.max(1, ri(bw * (1 - yy / h))); R(g, x + ri((bw - w2) / 2), yy, w2, 2, col); }
      if (lyr && hs(wx, 5) % 3 === 0) alpha(g, 0.4 + 0.5 * pulse, () => R(g, x + ri(bw / 2), h - 2, 1, 2, K.em)); } }   // a bead of magma on a tip, bright with the beat
  // veins in the far rock: slow red threads that run brighter and whiter with the beat
  for (let i = 0; i < 7; i++) { const vx = ((i * 131 - ri(cx * 0.2)) % (VW + 80) + VW + 80) % (VW + 80) - 40, vy = 30 + (i * 47) % (VH - 60); alpha(g, 0.15 + 0.5 * pulse, () => { for (let k2 = 0; k2 < 14; k2++) R(g, vx + k2 * 2, vy + ri(Math.sin(k2 * 0.7 + i) * 3) + ((k2 * 5) % 3), 2, 1, k2 % 5 === 0 ? K.emH : K.red); }); }
  // THE HEART: a red bloom low in the dark that grows toward the seal and swells on the beat; a vignette that closes in on it
  g.globalAlpha = Math.min(0.42, 0.05 + 0.16 * zone + 0.2 * pulse); const by = VH - 40; for (let r = 5; r >= 0; r--) { g.globalAlpha = Math.min(0.5, (0.04 + 0.14 * zone + 0.18 * pulse) * (1 - r / 7)); R(g, VW / 2 - 60 - r * 36, by - r * 8, 120 + r * 72, 80, K.fire); } g.globalAlpha = 1;
  g.globalAlpha = 0.26; for (let i = 0; i < 6; i++) { R(g, 0, i * 4, VW, 4, '#000'); R(g, 0, VH - 4 - i * 4, VW, 4, '#000'); g.globalAlpha = 0.26 * (1 - (i + 1) / 7); } g.globalAlpha = 1;
  if (pulse > 0.02) { g.globalAlpha = Math.min(0.2, pulse * 0.2); R(g, 0, 0, VW, VH, K.red); g.globalAlpha = 1; }
}
