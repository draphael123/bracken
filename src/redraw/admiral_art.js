// admiral_art.js - THE ADMIRAL, GREYBOX SHEET (claude/flotilla3; the ART sonnet replaces the figure, the API and the pose keys are the contract with src/admiral-hands.js).
// Pure drawing on a 2d context g at (x, y) = his feet on screen; f = facing (+1 right). o = { mode, p (the move's progress 0..1), flash, ward, off: [plate indices gone],
// list (the flagship's list, phase two) }.
// HE IS: a pirate admiral about 52 px tall with the hat - a long red-black coat with gold frogging, a black tricorn with a gold edge, a grey beard, cutlass in the right
// hand, a brace of pistols across his chest; bolted over the coat, three SALVAGED HULL PLATES (riveted iron, barnacled, a gunport rim still on the chest plate):
//   0 CHEST (a curved breastplate cut from a hull strake)   1 BACK (a square of hull plate across the shoulders, behind)   2 PAULDRONS (two thick curved plates on the shoulders)
// A plate gone shows the coat (and a torn strap) where it was. Phase two (bare) he has the BOARDING AXE in his left hand.
// EVERY MOVE HAS ITS OWN WINDUP AND ITS OWN RELEASE (B16) - the pose keys:
//   walk / recover / sleep / wake / card
//   cutTell (the cutlass drawn back high over the shoulder) -> cut (swung through, the arc) -> cutRec (the blade down, his weight forward)
//   pistolTell / pistol2Tell (arm out level, the pistol at the end, the other hand on his hip) -> reload (OPEN: ramrod in the barrel, head down)
//   kegTell (bent over, both hands on a keg low in front)  -> kegRec (straightening, hands open)
//   whistleTell (the bosun's whistle to his lips, the other arm up, the hand open: the signal) -> whistleRec (arm down, pointing at the deck)
//   grapTell (the grapnel whirled over the hat, a loop of line) -> swing (one hand up on the line, legs tucked) -> fall (arms flung up) -> climb (hauling on the net)
//   landRec (one knee down) / stagger (OPEN: rocked back, arms out, sparks where the plate was) / soaked (OPEN: bent double, dripping)
//   flat (OPEN: on his back) / listTell (throwing the last iron off, arms wide)
//   flurryTell (cutlass and axe crossed in front) -> flurry / flurryGap (alternating cuts) -> axeTell (the axe two-handed over the hat) -> axe (struck down) -> axeStuck (OPEN:
//   hauling at the axe in the deck) -> axeRec
//   dead (drawDeadAdmiral): he goes to his knees, the hat rolls, and he lies on the lashings.
const R = Math.round;
const clamp = (v, a = 0, b = 1) => Math.max(a, Math.min(b, v)), lerp = (a, b, k) => a + (b - a) * k, ease = k => k * k * (3 - 2 * k);
const NORM = { coat: '#6a1c1e', coatD: '#3e0f12', coatL: '#8e2e2a', gold: '#d8b04a', goldD: '#8a6a28', hat: '#16121a', hatL: '#2c2632', skin: '#d8a07a', skinD: '#a8704e', beard: '#c8c4bc', beardD: '#8a867e',
  boot: '#1c1612', bootL: '#3a2e24', iron: '#4a4e58', ironL: '#7a808e', ironD: '#2a2c34', rivet: '#a8aeb8', rust: '#7a4a2a', barn: '#c8c8b0', blade: '#dfe6ec', bladeD: '#8a96a0', grip: '#4a2a18',
  pistol: '#2a2622', pistolL: '#6a5a44', axe: '#9aa4ae', haft: '#5a3a20', line: '#c9b27c', keg: '#6a4a2a', kegL: '#9a7a4a', band: '#3a3a40', eye: '#fff2c8', shirt: '#e8dcc0' };
const tint = (p, col, k) => { const o = {}; const hx = h => [parseInt(h.slice(1, 3), 16), parseInt(h.slice(3, 5), 16), parseInt(h.slice(5, 7), 16)];
  for (const key in p) { const A = hx(p[key]), B = hx(col); o[key] = '#' + A.map((v, i) => R(lerp(v, B[i], k)).toString(16).padStart(2, '0')).join(''); } return o; };
const WARD = tint(NORM, '#9fb4c6', 0.55), FLASH = tint(NORM, '#ffffff', 0.75);
let C = NORM, g_, X_ = 0, Y_ = 0, F_ = 1;
const fr = (u, v, w, h, col) => { u = R(u); v = R(v); g_.fillStyle = col; g_.fillRect(F_ > 0 ? X_ + u : X_ - u - w, Y_ - v - h, w, h); };
function pl(u0, v0, u1, v1, w, col) { const n = Math.max(1, Math.ceil(Math.max(Math.abs(u1 - u0), Math.abs(v1 - v0)))); for (let i = 0; i <= n; i++) fr(lerp(u0, u1, i / n) - w / 2, lerp(v0, v1, i / n) - w / 2, w, w, col); }
function disc(u, v, r, col) { for (let d = -r; d <= r; d++) { const hw = Math.floor(Math.sqrt(r * r - d * d + 0.5)); fr(u - hw, v + d, 2 * hw + 1, 1, col); } }

/* ---- THE POSE: where his hands, his lean and his knees are for each key at progress p ---- */
function pose(mode, p, time) {
  const q = { lean: 0, crouch: 0, hR: [10, 24], hL: [-6, 22], blade: 'cutlass', bladeA: -0.4, pistol: false, axe: false, keg: false, whistle: false, grap: false, knee: 0, back: 0, bob: 0, drip: false, sparks: false, ram: false, flat: false };
  const k = ease(clamp(p));
  switch (mode) {
    case 'walk': q.bob = Math.abs(Math.sin(time * 7)) * 1.5; q.hR = [10, 22]; q.bladeA = -0.2; break;
    case 'sleep': case 'card': q.hR = [8, 14]; q.bladeA = 1.35; q.hL = [-2, 26]; break;
    case 'wake': q.hR = [lerp(8, 12, k), lerp(14, 30, k)]; q.bladeA = lerp(1.35, -1.1, k); break;
    case 'cutTell': q.lean = -2 * k; q.hR = [lerp(10, -2, k), lerp(24, 40, k)]; q.bladeA = lerp(-0.4, -2.4, k); break;
    case 'cut': q.lean = 3; q.hR = [16, lerp(36, 14, k)]; q.bladeA = lerp(-1.6, 0.9, k); break;
    case 'cutRec': q.lean = 3 * (1 - k); q.hR = [14, lerp(12, 20, k)]; q.bladeA = lerp(0.9, 0.2, k); break;
    case 'pistolTell': case 'pistol2Tell': q.pistol = true; q.hR = [lerp(10, 22, k), 30]; q.hL = [-4, 20]; q.bladeA = 1.4; q.blade = mode === 'pistolTell' ? 'cutlass' : 'cutlass'; break;
    case 'reload': q.ram = true; q.pistol = true; q.hR = [8, 22]; q.hL = [6, lerp(34, 26, (Math.sin(time * 10) + 1) / 2)]; q.lean = 2; q.bladeA = 1.4; break;
    case 'kegTell': q.keg = true; q.crouch = lerp(0, 8, k); q.lean = 4 * k; q.hR = [14, lerp(20, 8, k)]; q.hL = [10, lerp(20, 8, k)]; q.bladeA = 1.5; break;
    case 'kegRec': q.crouch = lerp(8, 0, k); q.hR = [16, lerp(8, 20, k)]; q.hL = [12, lerp(8, 18, k)]; q.bladeA = 1.5; break;
    case 'whistleTell': q.whistle = true; q.hL = [4, 34]; q.hR = [lerp(10, 6, k), lerp(24, 46, k)]; q.bladeA = -1.3; break;
    case 'whistleRec': q.hR = [lerp(6, 24, k), lerp(46, 18, k)]; q.bladeA = lerp(-1.3, 0.4, k); break;
    case 'grapTell': q.grap = true; q.hR = [4 + 6 * Math.cos(time * 14), 44 + 4 * Math.sin(time * 14)]; q.hL = [-4, 22]; q.bladeA = 1.4; q.crouch = 3 * k; break;
    case 'swing': q.hR = [4, 46]; q.hL = [10, 28]; q.knee = 8; q.bladeA = 0.6; break;
    case 'fall': q.hR = [8, 44]; q.hL = [-8, 42]; q.knee = 4; q.bladeA = -1.6; break;
    case 'climb': q.hR = [6, 34]; q.hL = [-2, 30]; q.drip = true; q.bladeA = 1.4; break;
    case 'landRec': q.crouch = lerp(8, 0, k); q.knee = lerp(6, 0, k); q.hR = [16, 12]; q.bladeA = 0.8; break;
    case 'stagger': q.lean = -4; q.back = 3; q.hR = [16, 30]; q.hL = [-14, 28]; q.bladeA = -2.2; q.sparks = true; break;
    case 'soaked': q.crouch = 6; q.lean = 5; q.hR = [14, 10]; q.hL = [8, 12]; q.drip = true; q.bladeA = 1.2; break;
    case 'flat': q.flat = true; break;
    case 'listTell': q.hR = [lerp(10, 22, k), lerp(24, 36, k)]; q.hL = [lerp(-6, -18, k), lerp(22, 36, k)]; q.bladeA = -0.6; q.lean = -2; break;
    case 'flurryTell': q.axe = true; q.hR = [10, 30]; q.hL = [12, 30]; q.bladeA = -2.0; q.lean = -1; break;
    case 'flurry': case 'flurryGap': q.axe = true; { const s = Math.floor(time * 12) % 2; q.hR = s ? [18, 18] : [6, 34]; q.hL = s ? [4, 34] : [18, 18]; q.bladeA = s ? 0.8 : -1.8; q.lean = 3; } break;
    case 'axeTell': q.axe = true; q.hL = [lerp(10, 0, k), lerp(26, 48, k)]; q.hR = [lerp(10, 2, k), lerp(26, 46, k)]; q.bladeA = 1.4; q.lean = -2 * k; break;
    case 'axe': q.axe = true; q.hL = [lerp(0, 20, k), lerp(48, 6, k)]; q.hR = [lerp(2, 18, k), lerp(46, 8, k)]; q.lean = 4; q.bladeA = 1.4; break;
    case 'axeStuck': q.axe = true; q.hL = [22, 6]; q.hR = [20, 8]; q.crouch = 6; q.lean = 6 + Math.sin(time * 16); q.bladeA = 1.4; break;
    case 'axeRec': q.axe = true; q.hL = [lerp(20, -4, k), lerp(6, 22, k)]; q.bladeA = 0.2; break;
    default: break;
  }
  return q;
}
/* ---- one plate of salvaged hull ---- */
function plate(u, v, w, h) { fr(u, v, w, h, C.ironD); fr(u + 1, v + 1, w - 2, h - 2, C.iron); fr(u + 1, v + h - 2, w - 2, 1, C.ironL);
  for (let i = 0; i < w; i += 4) { fr(u + i + 1, v + 1, 1, 1, C.rivet); fr(u + i + 1, v + h - 2, 1, 1, C.rivet); } fr(u + 2, v + 2, 2, 1, C.rust); fr(u + w - 4, v + 3, 2, 1, C.barn); }
export function drawAdmiral(g, x, y, f, o, time) {
  g_ = g; X_ = R(x); Y_ = R(y); F_ = f || 1; C = o.flash ? FLASH : o.ward ? WARD : NORM;
  const off = o.off || [], bare = (i) => off.includes(i), q = pose(o.mode, o.p || 0, time || 0);
  if (q.flat) { drawFlat(o, off); return; }
  const cr = q.crouch, Ly = cr, lean = q.lean, top = 40 - cr + q.bob, sway = R(lean);
  /* legs and boots */
  fr(-6, 0, 5, 4, C.boot); fr(2 + q.knee * 0.5, 0, 5, 4, C.boot); fr(-5, 4, 4, 10 - Ly * 0.6, C.bootL); fr(3, 4, 4, 10 - Ly * 0.6, C.bootL);
  fr(-6, 13 - Ly * 0.6, 13, 5, C.coatD);
  /* the BACK plate (behind him) */
  if (!bare(1)) plate(-10 + sway - 2, top - 20, 6, 16);
  /* the coat: long skirts, the body */
  fr(-9 + sway * 0.5, 6 - Ly * 0.3, 18, 14, C.coat); fr(-9 + sway * 0.5, 6 - Ly * 0.3, 2, 14, C.coatD); fr(7 + sway * 0.5, 6 - Ly * 0.3, 2, 14, C.coatD);
  fr(-8 + sway, top - 22, 16, 18, C.coat); fr(-1 + sway, top - 22, 2, 18, C.gold); for (let i = 0; i < 4; i++) fr(-4 + sway, top - 20 + i * 4, 8, 1, C.goldD);
  fr(-2 + sway, top - 22, 4, 3, C.shirt);
  /* the CHEST plate */
  if (!bare(0)) { plate(-7 + sway, top - 21, 14, 12); fr(-2 + sway, top - 17, 4, 4, C.ironD); fr(-1 + sway, top - 16, 2, 2, '#1a1a20'); }   /* the gunport rim still on it */
  else { fr(-6 + sway, top - 18, 12, 1, C.rust); }   /* the torn strap where it was */
  /* the brace of pistols across his chest (phase one, holstered) */
  if (!q.pistol) { fr(-6 + sway, top - 8, 8, 2, C.pistol); fr(-6 + sway, top - 8, 2, 3, C.pistolL); }
  /* head: face, beard, tricorn */
  const hu = sway + 1, hv = top - 4;
  fr(hu - 4, hv, 8, 7, C.skin); fr(hu - 4, hv, 8, 3, C.beard); fr(hu - 3, hv - 2, 6, 2, C.beardD); fr(hu + 1, hv + 4, 2, 1, C.eye); fr(hu + 2, hv + 4, 1, 1, '#1a1010');
  fr(hu - 8, hv + 7, 16, 2, C.hat); fr(hu - 6, hv + 9, 12, 4, C.hat); fr(hu - 8, hv + 7, 16, 1, C.gold); fr(hu - 1, hv + 12, 2, 2, C.hatL);
  /* the PAULDRONS */
  if (!bare(2)) { plate(-11 + sway, top - 6, 7, 6); plate(4 + sway, top - 6, 7, 6); } else { fr(-10 + sway, top - 3, 5, 2, C.coatL); fr(5 + sway, top - 3, 5, 2, C.coatL); }
  /* the arms: shoulder -> hand */
  const sR = [6 + sway, top - 6], sL = [-6 + sway, top - 6];
  pl(sL[0], sL[1], q.hL[0], q.hL[1] - cr, 3, C.coatD); fr(q.hL[0] - 1, q.hL[1] - cr - 1, 3, 3, C.skin);
  pl(sR[0], sR[1], q.hR[0], q.hR[1] - cr, 3, C.coatL); fr(q.hR[0] - 1, q.hR[1] - cr - 1, 3, 3, C.skin);
  const hx = q.hR[0], hy = q.hR[1] - cr;
  /* what is in his hands */
  if (q.pistol) { fr(hx, hy, 9, 3, C.pistol); fr(hx, hy - 2, 3, 3, C.pistolL); if (q.ram) { pl(q.hL[0], q.hL[1] - cr, hx + 8, hy + 4, 1, C.bladeD); } }
  else if (q.keg) { fr(hx - 4, hy - 8, 12, 12, C.keg); fr(hx - 4, hy - 5, 12, 1, C.band); fr(hx - 4, hy + 1, 12, 1, C.band); fr(hx + 2, hy + 4, 1, 3, '#ffd36b'); }
  else if (q.whistle) { fr(hu + 3, hv + 1, 3, 2, C.gold); }
  else if (q.grap) { pl(hx, hy, hx + 6 * Math.cos(time * 14), hy + 10 + 6 * Math.sin(time * 14), 1, C.line); fr(hx + 6 * Math.cos(time * 14) - 2, hy + 10 + 6 * Math.sin(time * 14) - 2, 5, 5, C.iron); }
  else { const a = q.bladeA, L = 20, bx = hx + Math.cos(a) * L, by = hy - Math.sin(a) * L; pl(hx, hy, bx, by, 2, C.blade); pl(hx, hy, hx + Math.cos(a) * 4, hy - Math.sin(a) * 4, 2, C.grip); fr(hx - 1, hy - 1, 3, 2, C.gold); }
  if (q.axe) { const ax = q.hL[0], ay = q.hL[1] - cr; pl(ax, ay, ax + 3, ay + 14, 2, C.haft); fr(ax + 1, ay + 12, 7, 5, C.axe); fr(ax + 7, ay + 12, 1, 5, C.bladeD); }
  if (q.sparks && Math.floor(time * 20) % 2) { fr(sway - 2, top - 16, 2, 2, '#ffd36b'); fr(sway + 6, top - 10, 1, 1, '#fff6c8'); fr(sway - 8, top - 12, 1, 1, '#ffd36b'); }
  if (q.drip) for (let i = 0; i < 4; i++) { const k = ((time * 1.7 + i * 0.27) % 1); fr(-6 + i * 4, top - 10 - k * 18 * -1 - 10, 1, 2, '#bfe6f5'); }
}
function drawFlat(o, off) {
  /* on his back along the deck, head toward his back (-u), hat beside him */
  fr(-20, 0, 34, 6, C.coat); fr(-20, 6, 10, 4, C.beard); fr(-28, 0, 8, 6, C.skin); fr(-34, 0, 7, 4, C.hat); fr(14, 0, 8, 4, C.boot);
  if (!off.includes(0)) fr(-12, 6, 14, 3, C.iron); if (!off.includes(2)) { fr(-18, 6, 5, 3, C.iron); fr(-6, 6, 5, 3, C.iron); }
  fr(18, 6, 12, 1, C.blade);
}
export function drawDeadAdmiral(g, x, y, f, k, time) { g_ = g; X_ = R(x); Y_ = R(y); F_ = f || 1; C = NORM;
  if (k < 0.5) { const kk = k / 0.5; fr(-6, 0, 12, 10 - kk * 4, C.coat); fr(-4, 10 - kk * 4, 8, 7, C.skin); fr(-7, 17 - kk * 4, 14, 3, C.hat); }
  else { drawFlat({}, [0, 1, 2]); fr(-46 + R(clamp((k - 0.5) * 2) * 10), 0, 7, 4, C.hat); } }
export function drawAdmiralCard(g, x, y, f, time) { drawAdmiral(g, x, y, f, { mode: 'card', p: 0, off: [] }, time); }

/* ---- THE FIGHT'S PIECES ---- */
/* his pistol ball in flight, and the aim line while he levels it (dashed while it follows you, solid red when it locks) */
export function drawShot(g, x, y) { g.fillStyle = '#1b1626'; g.fillRect(x - 2, y - 2, 4, 4); g.fillStyle = '#fff2c8'; g.fillRect(x - 1, y - 2, 2, 1); }
export function drawAim(g, x0, y, x1, locked, time) { g.globalAlpha = locked ? 0.8 : 0.45; g.fillStyle = locked ? '#ff6b6b' : '#ffd36b'; const d = Math.sign(x1 - x0) || 1;
  for (let x = x0; d > 0 ? x < x1 : x > x1; x += d * (locked ? 3 : 6)) g.fillRect(R(x), R(y), 2, 1); g.globalAlpha = 1; }
/* his keg: rolling, its fuse burning down (the spark climbs the fuse) */
export function drawKeg(g, x, y, fuse, max, time, back) { const r = R(time * 8) % 4; g.fillStyle = NORM.keg; g.fillRect(x - 6, y - 12, 12, 12); g.fillStyle = NORM.kegL; g.fillRect(x - 6, y - 12, 12, 2);
  g.fillStyle = NORM.band; g.fillRect(x - 6, y - 9 + (r % 2), 12, 1); g.fillRect(x - 6, y - 4 + (r % 2), 12, 1);
  const k = clamp(fuse / max); g.fillStyle = '#8a7454'; g.fillRect(x - 1, y - 12 - R(6 * k), 1, R(6 * k)); if (Math.floor(time * 16) % 2) { g.fillStyle = k < 0.3 ? '#ff6b6b' : '#ffd36b'; g.fillRect(x - 2, y - 14 - R(6 * k), 3, 3); }
  if (back) { g.fillStyle = '#8fd160'; g.fillRect(x - 6, y - 16 - R(6 * k), 12, 1); } }
/* THE BROADSIDE'S CELLS: red strips on the deck while marked (they pulse quicker as the shot comes), and the shot coming down */
export function drawCells(g, cells, hit, y, k, fired, time, cx) { for (let i = 0; i < cells.length; i++) { if (!hit[i]) continue; const a = R(cells[i][0] - cx), b = R(cells[i][1] - cx);
    if (!fired) { g.globalAlpha = 0.22 + 0.25 * (0.5 + 0.5 * Math.sin(time * (6 + 14 * k))); g.fillStyle = '#ff4a3a'; g.fillRect(a + 2, y - 46, b - a - 4, 46); g.globalAlpha = 0.9; g.fillRect(a + 2, y - 2, b - a - 4, 2);
      for (let xx = a + 6; xx < b - 6; xx += 10) g.fillRect(xx, y - 6, 4, 1); g.globalAlpha = 1; }
    else { g.globalAlpha = 0.7; g.fillStyle = '#ffd36b'; g.fillRect(a + 2, y - 46, b - a - 4, 46); g.globalAlpha = 1; } } }
/* THE GRAPNEL'S LINE from the main yard to his hands, and the yard itself over the lashing */
export function drawYard(g, x, y, time) { g.fillStyle = '#5a4a34'; g.fillRect(x - 70, y, 140, 4); g.fillStyle = '#8a7454'; g.fillRect(x - 70, y, 140, 1); g.fillStyle = '#3a2e22'; g.fillRect(x - 3, y - 40, 6, 44); }
export function drawLine(g, x0, y0, x1, y1) { const n = Math.max(1, Math.ceil(Math.hypot(x1 - x0, y1 - y0) / 2)); g.fillStyle = NORM.line; for (let i = 0; i <= n; i++) g.fillRect(R(lerp(x0, x1, i / n)), R(lerp(y0, y1, i / n)), 1, 1); }
export function drawLandMark(g, x, y, r, k, time) { g.globalAlpha = 0.35 + 0.4 * k; g.fillStyle = '#ff6b6b'; g.fillRect(R(x - r), y - 2, R(2 * r), 2); g.fillRect(R(x - r), y - 6, 2, 4); g.fillRect(R(x + r - 2), y - 6, 2, 4); g.globalAlpha = 1; }
/* a PLATE blown off: it spins out and falls into the harbour */
export function drawPlateFall(g, x, y, k, which) { const px = R(x + k * 50 * (which === 1 ? -1 : 1)), py = R(y - 30 + k * k * 90 - k * 40), w = which === 2 ? 7 : 12, h = which === 2 ? 6 : 10;
  g.fillStyle = NORM.ironD; g.fillRect(px - w / 2, py - h / 2, w, h); g.fillStyle = NORM.iron; g.fillRect(px - w / 2 + 1, py - h / 2 + 1, w - 2, h - 2); g.fillStyle = NORM.rivet; g.fillRect(px - w / 2 + 1, py - h / 2 + 1, 1, 1); }
/* THE LIST: her deck heeled toward the lashing - a tilt line over the deck and the scuppers running */
export function drawList(g, x0, x1, y, time) { g.globalAlpha = 0.5; g.fillStyle = '#c9b27c'; for (let x = x0; x < x1; x += 2) g.fillRect(x, R(y - 1 - (x - x0) / (x1 - x0) * 5), 2, 1); g.globalAlpha = 1;
  g.fillStyle = '#ffd36b'; const a = R(x0 + ((time * 30) % Math.max(1, x1 - x0))); g.fillRect(x1 - (a - x0) - 4, y - 3, 3, 1); }
