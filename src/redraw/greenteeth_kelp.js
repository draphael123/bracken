// greenteeth_kelp.js - JENNY GREENTEETH's raft duel, drawn (claude/canal4art). Pure drawing: src/benched/jenny-greenteeth-hands.js calls these with the live state; nothing here moves a thing.
//   HER KELP, told apart by SHAPE and COLOUR as well as by the bar and the gold outline:
//     the KELP BODY (HIT HIGH) a blue-teal mantle round her hips and legs with a twisted-stipe belt and pale air bladders at the waist: her HEAD is bare. Wide at the foot, ragged fringe.
//     the KELP HOOD (HIT LOW)  a tall rust-brown cowl, peaked over her head, two lappets down her chest, amber bladders at the crown, her eyes burning in its shadow: her LEGS are bare.
//     both at once = she is WARY (a ring of weed also, hands.js); shifting (phase 3) the kelp streams sideways and a pair of swap chevrons runs between hood and hips.
//   THE RAFT: lashed timbers on iron straps with ring-bolts, hemp lashings at the ends, tarred barrel floats under the edges, a fender of rope at each end.
//   HER CLAWS, STUCK in the raft: three long hooked claws driven into the deck, the deck split round them and the lashings frayed.
const R = Math.round;
export const KC = { body0: '#10383c', body1: '#1c5a5c', body2: '#2a8a82', body3: '#7ad0b0', hood0: '#3a2410', hood1: '#6a4220', hood2: '#a8702c', hood3: '#e0a850', bladder: '#d8c070', bladderD: '#7a6a28', stipe: '#2a1c10' };

/* a drooping frond: a ribbon from (x, y0) down to y1, swaying, width w. cols = [dark, mid, light] */
function frond(g, x, y0, y1, w, time, ph, cols, sway = 1.4, stream = 0) {
  for (let y = y0; y < y1; y++) { const k = (y - y0) / Math.max(1, y1 - y0), sx = Math.sin(time * 1.9 + ph + y * 0.11) * sway * (0.3 + k) + stream * k * 5, xx = R(x + sx), ww = Math.max(1, R(w * (1 - k * 0.55)));
    g.fillStyle = cols[(y + ph | 0) % 5 === 0 ? 0 : 1]; g.fillRect(xx - (ww >> 1), y, ww, 1); g.fillStyle = cols[2]; g.fillRect(xx - (ww >> 1), y, 1, 1); }
}
const bladder = (g, x, y, r) => { g.fillStyle = KC.bladderD; g.fillRect(R(x) - r, R(y) - r, r * 2 + 1, r * 2 + 1); g.fillStyle = KC.bladder; g.fillRect(R(x) - r + 1, R(y) - r, r * 2 - 1, r * 2 - 1); g.fillStyle = '#fff6c8'; g.fillRect(R(x) - r + 1, R(y) - r + 1, 1, 1); };

/* THE KELP BODY: from the waist to the water, ey the water line. shift = a sideways stream (phase three's shift told) */
export function drawKelpBody(g, ex, waist, ey, time, stream = 0, alpha = 1) {
  g.globalAlpha = alpha;
  for (let i = -6; i <= 6; i++) { const x = ex + i * 2, len = ey - waist + ((i * 5) & 3) + 3; frond(g, x, waist + 1 + (Math.abs(i) >> 2), waist + len, 4, time, i * 1.3, [KC.body0, KC.body1, KC.body2], 1.2, stream); }
  /* the belt: a twisted stipe round the hips, bladders strung on it */
  g.fillStyle = KC.stipe; g.fillRect(ex - 13, waist - 1, 27, 3); g.fillStyle = '#5a4020'; for (let x = -13; x < 14; x += 3) g.fillRect(ex + x, waist - 1 + (x & 1), 2, 1);
  for (let i = -3; i <= 3; i++) bladder(g, ex + i * 4, waist, 1);
  /* the highlights: a pale edge along the lowest fringe, so the mantle's hem reads against the dark water */
  g.fillStyle = KC.body3; for (let i = -6; i <= 6; i += 2) g.fillRect(ex + i * 2 + R(Math.sin(time * 1.9 + i) * 1.2 + stream * 4), ey - 2 - ((i * 3) & 3), 2, 1);
  g.globalAlpha = 1;
}
/* THE KELP HOOD: from above her head down to the waist; fx her facing (+1 right). The face stays dark and the eyes burn */
export function drawKelpHood(g, ex, headY, waist, time, fx = 1, stream = 0, alpha = 1) {
  g.globalAlpha = alpha; const top = headY - 9;
  /* the cowl: peaked, widening to the shoulders */
  for (let y = top; y < headY + 18; y++) { const k = (y - top) / 27, hw = Math.min(12, 2 + R(k * 14)), sw = R(Math.sin(time * 1.6 + y * 0.2) * 0.8 + stream * k * 4);
    g.fillStyle = (y >> 1) & 1 ? KC.hood1 : KC.hood0; g.fillRect(ex - hw + sw, y, hw * 2 + 1, 1); g.fillStyle = KC.hood2; g.fillRect(ex - hw + sw, y, 1, 1); g.fillRect(ex + hw + sw, y, 1, 1); if (y % 5 === 0) { g.fillStyle = KC.hood3; g.fillRect(ex - 3 + ((y * 7) % 7) + sw, y, 2, 1); } }
  /* the face's opening, and her eyes in it */
  g.fillStyle = '#080c06'; g.fillRect(ex - 5, headY + 2, 11, 10); g.fillRect(ex - 4, headY + 12, 9, 2); g.fillStyle = '#b8ff8a'; g.fillRect(ex - 3 + (fx > 0 ? 1 : 0), headY + 6, 2, 2); g.fillRect(ex + 1 + (fx > 0 ? 1 : 0), headY + 6, 2, 2);
  g.fillStyle = '#1e3a14'; g.fillRect(ex - 2 + (fx > 0 ? 1 : 0), headY + 11, 5, 1);
  /* the lappets: two long fronds down her chest, and a frond over each shoulder */
  frond(g, ex - 8, headY + 16, waist + 3, 5, time, 0.5, [KC.hood0, KC.hood1, KC.hood2], 1.3, stream); frond(g, ex + 8, headY + 16, waist + 3, 5, time, 2.1, [KC.hood0, KC.hood1, KC.hood2], 1.3, stream);
  frond(g, ex - 3, headY + 16, waist - 2, 4, time, 3.3, [KC.hood0, KC.hood1, KC.hood2], 1.0, stream); frond(g, ex + 3, headY + 16, waist - 2, 4, time, 4.4, [KC.hood0, KC.hood1, KC.hood2], 1.0, stream);
  /* the crown: amber bladders on the peak, and a ragged tuft */
  for (const [dx, dy] of [[-2, 2], [1, 1], [3, 4], [-4, 5]]) bladder(g, ex + dx, top + dy, 1);
  g.fillStyle = KC.hood2; g.fillRect(ex - 1, top - 2, 3, 2); g.fillStyle = KC.hood3; g.fillRect(ex, top - 3, 1, 1);
  g.globalAlpha = 1;
}
/* the SWAP told in phase three: chevrons run between the hips and the head, gold, both ways, and flecks of both kelps fly */
export function drawKelpSwap(g, ex, headY, waist, time) {
  const p = (time * 2.2) % 1; g.fillStyle = '#ffd36b';
  for (const side of [-1, 1]) for (let i = 0; i < 3; i++) { const q = (p + i / 3) % 1, y = R(waist + 6 - q * (waist - headY + 14)), x = ex + side * 17; g.globalAlpha = Math.sin(q * Math.PI) * 0.9; g.fillRect(x - 2, y + 1, 5, 1); g.fillRect(x - 1, y, 3, 1); g.fillRect(x, y - 1, 1, 1); }
  g.globalAlpha = 1;
  for (let i = 0; i < 10; i++) { const q = (time * 1.4 + i * 0.37) % 1, a = i * 2.3 + time * 3; g.globalAlpha = 1 - q; g.fillStyle = i & 1 ? KC.body3 : KC.hood3; g.fillRect(R(ex + Math.cos(a) * (10 + q * 16)), R(waist - 14 + Math.sin(a) * (14 + q * 8)), 2, 1); }
  g.globalAlpha = 1;
}

/* ------------------------------ the raft ------------------------------ */
/* x, y the deck's top left, w its width (the raft's own: the heave tilts the whole in hands.js); low = it has been dragged lower */
export function drawRaft(g, x, y, w, time, hurt = 0) {
  /* the barrel floats under the edges: tarred, hooped in iron, half in the water, three at each end */
  for (const side of [0, 1]) for (let k = 0; k < 3; k++) { const bx = side ? x + w - 12 - k * 11 : x + 2 + k * 11, by = y + 7;
    g.fillStyle = '#10161a'; g.fillRect(bx, by, 10, 9); g.fillStyle = '#1e2a30'; g.fillRect(bx + 1, by + 1, 8, 7); g.fillStyle = '#34444c'; g.fillRect(bx + 2, by + 1, 1, 7);
    g.fillStyle = '#4a525a'; g.fillRect(bx, by + 2, 10, 1); g.fillRect(bx, by + 6, 10, 1); g.fillStyle = '#8a929a'; g.fillRect(bx + 4, by + 2, 1, 1); }
  /* the lashed timbers: pale lit tops, dark seams, nail rows */
  for (let i = 0; i < w; i += 16) { const k = (i / 16) | 0, ww = Math.min(16, w - i);
    g.fillStyle = k % 2 ? '#4a3a26' : '#54422c'; g.fillRect(x + i, y, ww, 6); g.fillStyle = '#8a7448'; g.fillRect(x + i, y, ww, 1); g.fillStyle = '#6a5636'; g.fillRect(x + i, y + 1, ww, 1);
    g.fillStyle = '#1c150e'; g.fillRect(x + i, y + 6, ww, 2); g.fillRect(x + i + 15, y + 1, 1, 5); g.fillStyle = '#2c2216'; g.fillRect(x + i + 5 + (k % 3) * 2, y + 3, 3, 1);
    g.fillStyle = '#9aa2aa'; g.fillRect(x + i + 2, y + 2, 1, 1); g.fillRect(x + i + 12, y + 2, 1, 1); }
  /* iron straps over the timbers every 48 px: a bar, its rivets, and a ring-bolt at each end of the raft */
  for (let i = 10; i < w - 8; i += 48) { g.fillStyle = '#2a3036'; g.fillRect(x + i, y - 1, 5, 9); g.fillStyle = '#6a747c'; g.fillRect(x + i, y - 1, 5, 1); g.fillRect(x + i, y - 1, 1, 9); g.fillStyle = '#c8d0d8'; g.fillRect(x + i + 2, y + 1, 1, 1); g.fillRect(x + i + 2, y + 5, 1, 1); }
  for (const rx of [x + 3, x + w - 8]) { g.fillStyle = '#2a3036'; g.fillRect(rx, y - 2, 5, 3); g.strokeStyle = '#8a929a'; g.lineWidth = 1; g.beginPath(); g.arc(rx + 2.5, y - 4, 2.5, 0, 6.3); g.stroke(); }
  /* the hemp lashings round the end timbers: crossed turns, frayed ends */
  for (const lx of [x + 8, x + w - 20]) { g.fillStyle = '#b8a070'; for (let k = 0; k < 4; k++) { g.fillRect(lx + k * 3, y + 1 + (k & 1), 2, 5); } g.fillStyle = '#6a5a3c'; for (let k = 0; k < 4; k++) g.fillRect(lx + k * 3 + 2, y + 1, 1, 6); g.fillStyle = '#d8c898'; g.fillRect(lx + 12, y + 3, 3, 1); g.fillRect(lx + 14, y + 4, 2, 1); }
  /* a rope fender hung at each end */
  for (const fx of [x - 3, x + w]) { g.fillStyle = '#7a6a48'; g.fillRect(fx, y + 1, 3, 7); g.fillStyle = '#a89868'; g.fillRect(fx, y + 1, 1, 7); g.fillStyle = '#4a3c28'; for (let k = 0; k < 7; k += 2) g.fillRect(fx + 1, y + 1 + k, 2, 1); }
  void time; void hurt;
}
/* HER CLAWS, STUCK: three long hooked claws driven into the deck at (x, y); the timber split round them, splinters, a frayed lashing. t = how long she has hung there (the deck cracks wider) */
export function drawStuckClaws(g, x, y, time) {
  g.fillStyle = '#0c0a08'; g.fillRect(R(x) - 7, R(y) - 1, 15, 2); g.fillStyle = '#7a6440'; for (const [dx, dy] of [[-8, -2], [-6, -3], [6, -3], [8, -1], [0, -3]]) g.fillRect(R(x) + dx, R(y) + dy, 1, 2);   /* the split and the splinters */
  g.fillStyle = '#d8c898'; g.fillRect(R(x) + 9, R(y), 3, 1); g.fillRect(R(x) + 11, R(y) + 1, 2, 1);                                                                                                    /* a frayed end of lashing */
  for (let i = -1; i <= 1; i++) { const cx = R(x) + i * 4; g.fillStyle = '#5e8a4a'; g.fillRect(cx - 1, R(y) - 6, 3, 5); g.fillStyle = '#e8e0c0'; g.fillRect(cx, R(y) - 9, 1, 4); g.fillRect(cx + (i >= 0 ? 1 : -1), R(y) - 11, 1, 2); g.fillStyle = '#fff'; g.fillRect(cx, R(y) - 10, 1, 1); }   /* long pale hooked claws */
  const p = 0.5 + 0.5 * Math.sin(time * 18); g.globalAlpha = 0.4 + 0.4 * p; g.fillStyle = '#ffd36b'; g.fillRect(R(x) - 9, R(y) + 2, 19, 1); g.globalAlpha = 1;                                           /* a gold line under them: they are STUCK */
}
