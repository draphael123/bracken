// sea_dial.js - THE SHARED SEA "A3" DIAL (claude/k2art, 2026-11-12): the water-line gauge and the lever it sits beside, drawn ONCE for every sea level and SKINNABLE.
// The data is the water kit's gauge row (src/tide-kit.js gauge(kit, id) = { k 0..1 water height, ph, t, tell, coming: 'in'|'out'|null }); nothing here reads a level, a hand or main.js, so any level's
// H.water hooks (src/pirate-fleet-hands.js: gauge(g, t, P), foam, verb art) can call it, and a skin is a plain object - the whale's LUNG icon is the 'flesh' skin of drawHud with shape 'lung'.
//   drawDial(g, x, y, gg, t, skin)    the WORLD dial (x, y = its centre): a round glass in a ringed case, the water standing in it (a waterline with a bright lip), a three-mark scale,
//                                     three toll pips under it (lit as the tolls come), a coming arrow (in = rising, red-gold / out = falling, pale), the whole glass pulsing on a tell.
//   drawLever(g, x, y, st, t, skin)   a LEVER on a floor plate (x, y = the plate's top centre): bedplate, slotted quadrant, an arm that throws left or right, a gold knob; st = { thrown, swing 0..1, near }.
//   drawHud(g, x, y, gg, t, skin)     the HUD gauge (x, y = top-left): the tall glass of src/redraw/pirate_fleet_art.js drawGauge in a skin, or shape 'lung' = two lobes that fill.
// Pure drawing on a 2d context (fillRect only). Palette discipline: each skin is one case ramp + a water ramp; nothing else is invented here.
const R = Math.round;
const rect = (g, x, y, w, h, c, a = 1) => { if (a !== 1) g.globalAlpha = a; g.fillStyle = c; g.fillRect(R(x), R(y), R(w), R(h)); if (a !== 1) g.globalAlpha = 1; };
export const SKINS = {
  /* the fleet's: brass case, deep-sea water (what pirate_fleet_art.js drawGauge wears) */
  brass: { name: 'brass', case: ['#4a3410', '#8a6a1c', '#c9a340', '#f0d070', '#fff0b0'], glass: '#06121a', glassHi: '#1a2e3a', water: ['#0e3a48', '#1a5868', '#4f8aa0'], lip: '#c4e4ee', pip: '#ffd36b', arrowIn: '#ffd36b', arrowOut: '#c9a340', knob: '#ffd36b', plate: ['#14161a', '#2c3038', '#4a505c'], arm: '#80889a', shape: 'dial' },
  /* the keep's: green-gone copper and iron, the keep's own teal water */
  verdigris: { name: 'verdigris', case: ['#0a1c18', '#16403a', '#2a6e5e', '#3f8f7d', '#78c8b0'], glass: '#06121a', glassHi: '#1a3438', water: ['#14505a', '#2a8a8e', '#7ff0e0'], lip: '#dffffa', pip: '#ffd36b', arrowIn: '#ff6b6b', arrowOut: '#8fd160', knob: '#c9a83a', plate: ['#12161c', '#2a303a', '#3a4452'], arm: '#6e7e8e', shape: 'dial' },
  /* the whale's (art owed, the skin is here so the lung is a skin and not a second drawing): pink flesh, bile water */
  flesh: { name: 'flesh', case: ['#2a0c14', '#5a1c2a', '#8a3040', '#b85868', '#e08a98'], glass: '#1a0a10', glassHi: '#3a1822', water: ['#4a5a1c', '#7a8a2a', '#b8c458'], lip: '#e8f0a0', pip: '#f0d0d8', arrowIn: '#ff6b6b', arrowOut: '#b8c458', knob: '#f0d0d8', plate: ['#2a0c14', '#4a1824', '#6a2a38'], arm: '#e08a98', shape: 'lung' },
};
const skinOf = s => (typeof s === 'string' ? SKINS[s] : s) || SKINS.verdigris;

/* THE WORLD DIAL: a 15 px glass. (x, y) = its centre. */
export function drawDial(g, x, y, gg, t, skin) {
  const S = skinOf(skin), r = 7, k = Math.max(0, Math.min(1, (gg && gg.k) || 0)); x = R(x); y = R(y);
  const hot = gg && gg.tell && Math.sin(t * 16) > 0;
  /* the case: a ring one pixel proud of the glass, lit from the top left */
  for (let j = -r - 2; j <= r + 2; j++) for (let i = -r - 2; i <= r + 2; i++) { const d = Math.hypot(i, j); if (d > r + 2.2) continue;
    const c = d > r + 1 ? S.case[0] : d > r ? (i + j < 0 ? S.case[4] : S.case[2]) : (d > r - 1 ? S.case[1] : null);
    if (c) rect(g, x + i, y + j, 1, 1, c); else rect(g, x + i, y + j, 1, 1, S.glass); }
  /* the water: every row below the waterline, with a bright lip on the first one and a ripple on it */
  const lineY = y + r - R(2 * r * k);
  for (let j = -r + 1; j < r; j++) { const yy = y + j; if (yy < lineY) continue; const half = Math.floor(Math.sqrt((r - 0.6) ** 2 - j * j));
    for (let i = -half; i <= half; i++) { const lip = yy === lineY, c = lip ? ((i + R(t * 6)) & 3 ? S.lip : S.water[2]) : (yy < lineY + 2 ? S.water[2] : yy < lineY + 5 ? S.water[1] : S.water[0]); rect(g, x + i, yy, 1, 1, hot && !lip ? S.lip : c); } }
  /* the scale: three ticks on the left of the glass; the glass's glint on the right */
  for (let q = 1; q < 4; q++) rect(g, x - r + 1, y + r - R(2 * r * q / 4), 3, 1, S.case[3]);
  rect(g, x + 2, y - r + 2, 2, 1, S.glassHi); rect(g, x + 3, y - r + 3, 1, 2, S.glassHi);
  /* the three tolls under it: lit as they come (warn) or all on the tell */
  const tolls = gg && gg.ph === 'warn' ? Math.min(3, 1 + R((gg.t || 0) * 2) % 3) : 0;
  for (let i = 0; i < 3; i++) { const on = i < tolls || hot; rect(g, x - 5 + i * 4, y + r + 4, 3, 2, S.case[0]); rect(g, x - 5 + i * 4, y + r + 4, 3, 1, on ? S.pip : S.case[1]); if (on) rect(g, x - 5 + i * 4 + 1, y + r + 4, 1, 1, S.lip); }
  /* the coming arrow, to the right of the case: in = up, out = down */
  if (gg && gg.coming === 'in') { rect(g, x + r + 4, y - 4, 1, 7, S.arrowIn); rect(g, x + r + 3, y - 3, 3, 1, S.arrowIn); rect(g, x + r + 2, y - 2, 5, 1, S.arrowIn); }
  else if (gg && gg.coming === 'out') { rect(g, x + r + 4, y - 3, 1, 7, S.arrowOut); rect(g, x + r + 3, y + 2, 3, 1, S.arrowOut); rect(g, x + r + 2, y + 1, 5, 1, S.arrowOut); }
}

/* THE LEVER: a plate in the floor, a slotted quadrant, an arm, a gold knob. thrown = the arm is over to the right. */
export function drawLever(g, x, y, st = {}, t = 0, skin) {
  const S = skinOf(skin); x = R(x); y = R(y); const sw = Math.max(0, Math.min(1, st.swing || 0)), thrown = !!st.thrown;
  rect(g, x - 8, y - 3, 17, 3, S.plate[0]); rect(g, x - 8, y - 4, 17, 1, S.plate[2]); rect(g, x - 7, y - 3, 15, 1, S.plate[1]);     /* the bedplate, with its lit edge */
  for (const dx of [-6, 6]) { rect(g, x + dx, y - 3, 2, 2, S.case[3]); rect(g, x + dx, y - 3, 1, 1, S.case[4]); }                   /* two rivets */
  rect(g, x - 5, y - 7, 11, 3, S.plate[1]); rect(g, x - 5, y - 7, 11, 1, S.plate[2]); rect(g, x - 4, y - 6, 9, 1, S.plate[0]);        /* the quadrant housing with its slot */
  rect(g, x - 1, y - 10, 3, 3, S.case[2]); rect(g, x, y - 10, 1, 1, S.case[4]);                                                     /* the pivot */
  /* the arm: from the pivot to one side or the other, mid-swing between */
  const from = thrown ? -1 : 1, to = thrown ? 1 : -1, d = from + (to - from) * sw, ax = R(x + d * 7), ay = R(y - 21 + Math.abs(d) * 4);
  const n = 14; for (let i = 0; i <= n; i++) { const px = x + (ax - x) * i / n, py = y - 9 + (ay - (y - 9)) * i / n; rect(g, px, py, 2, 2, S.plate[0]); rect(g, px, py, 1, 1, S.arm); }
  rect(g, ax - 2, ay - 2, 5, 5, S.case[0]); rect(g, ax - 1, ay - 1, 3, 3, S.knob); rect(g, ax - 1, ay - 1, 1, 1, '#fff0b0');       /* the knob */
  /* a thrown lever is a verdigris'd lever: a drip of green from the quadrant */
  if (thrown) rect(g, x + 4, y - 4 + R((t * 5) % 3), 1, 2, S.case[3], 0.7);
  if (st.near) { rect(g, x - 1, y - 32 + Math.sin(t * 4) * 2, 3, 3, '#ffd36b', 0.8); }
}

/* THE HUD GAUGE (x, y = top-left): the tall glass of the fleet's gauge, in any skin; or shape 'lung' = two lobes. */
export function drawHud(g, x, y, gg, t, skin) {
  const S = skinOf(skin), k = Math.max(0, Math.min(1, (gg && gg.k) || 0)); x = R(x); y = R(y); const hot = gg && gg.tell && Math.sin(t * 16) > 0;
  if (S.shape === 'lung') {                                                                                                         /* two lobes of lung, a windpipe over them, filling from the base */
    rect(g, x + 7, y, 2, 6, S.case[3]); rect(g, x + 6, y + 5, 4, 1, S.case[4]);
    for (const [lx, w] of [[x, 7], [x + 9, 7]]) { for (let j = 0; j < 24; j++) { const half = Math.round(Math.sin((j + 2) / 26 * Math.PI) * w / 2 + 2); const c0 = lx + (w >> 1) + 1 - half, ww = half * 2;
      rect(g, c0 - 1, y + 6 + j, 1, 1, S.case[1]); rect(g, c0 + ww, y + 6 + j, 1, 1, S.case[1]); rect(g, c0, y + 6 + j, ww, 1, 24 - j <= Math.round(24 * k) ? (hot ? S.lip : S.water[(j & 1) + 1]) : S.glass); } }
    for (let q = 1; q < 4; q++) rect(g, x + 7, y + 6 + R(24 * q / 4), 2, 1, S.case[3]);
  } else {
    const h = 26; rect(g, x - 1, y - 1, 14, h + 8, S.case[0]); rect(g, x, y, 12, h + 6, S.case[2]); rect(g, x, y, 12, 1, S.case[4]); rect(g, x, y + h + 5, 12, 1, S.case[0]);
    rect(g, x + 2, y + 2, 8, h + 2, S.glass); rect(g, x + 2, y + 2, 1, h + 2, S.glassHi);
    const fh = Math.max(1, R(h * k)); rect(g, x + 3, y + 3 + h - fh, 6, fh, hot ? S.lip : S.water[1]); rect(g, x + 3, y + 3 + h - fh, 6, 1, S.lip);
    for (let i = 1; i < 4; i++) rect(g, x + 2, y + 2 + R((h + 2) * i / 4), 3, 1, S.case[3]);
    const tolls = gg && gg.ph === 'warn' ? Math.min(3, 1 + R((gg.t || 0) * 2) % 3) : 0; for (let i = 0; i < 3; i++) rect(g, x + 2 + i * 3, y + h + 4, 2, 1, i < tolls || hot ? S.pip : S.case[0]);
    if (gg && gg.coming === 'in') { rect(g, x + 14, y + 2, 3, 1, S.arrowIn); rect(g, x + 15, y + 1, 1, 3, S.arrowIn); } else if (gg && gg.coming === 'out') { rect(g, x + 14, y + h, 3, 1, S.arrowOut); rect(g, x + 15, y + h - 1, 1, 3, S.arrowOut); } }
}
