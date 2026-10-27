// admiral_art.js - THE ADMIRAL, THE HAND-DRAWN SHEET (claude/flotilla3art; the greybox of claude/flotilla3 is replaced, the API and the pose keys are kept - the contract with src/admiral-hands.js).
// Pure drawing on a 2d context g at (x, y) = his feet on screen; f = facing (+1 right). o = { mode, p (the move's progress 0..1), flash, ward, off: [plate indices gone],
// list (the flagship's list, phase two) }.
// HE IS: a pirate admiral about 50 px tall with the hat - a long oxblood coat with gold frogging and gold cuffs, tall black boots, a black tricorn laced in gold with a red plume, a grey
// beard and a grey queue, a cold pale eye, the cutlass in the right hand and a brace of pistols across his chest on a baldric; bolted over the coat, three SALVAGED HULL PLATES (riveted iron,
// barnacled, rust-streaked, a gunport rim still on the chest plate):
//   0 CHEST (a curved breastplate cut from a hull strake)   1 BACK (a square of hull plate across the shoulders, behind)   2 PAULDRONS (two thick curved plates on the shoulders)
// A plate gone shows the coat where it was (the cloth under it NOT sun-faded, the bolt holes, a torn strap flapping). Phase two (bare) he has the BOARDING AXE in his left hand.
// EVERY MOVE HAS ITS OWN WINDUP AND ITS OWN RELEASE (B16) - the pose keys:
//   walk / recover / sleep / wake / card
//   cutTell (the cutlass drawn back high over the shoulder) -> cut (swung through, the arc) -> cutRec (the blade down, his weight forward)
//   pistolTell / pistol2Tell (arm out level, the pistol at the end, the other hand on his hip) -> reload (OPEN: pistol muzzle-up, ramrod in the barrel, head down, smoke)
//   kegTell (bent over, both hands on a keg low in front, the fuse lit)  -> kegRec (straightening, hands open)
//   whistleTell (the bosun's call to his lips, the other arm up, the hand open: the signal) -> whistleRec (arm down, pointing at the deck)
//   grapTell (the grapnel whirled over the hat, a loop of line) -> swing (both hands up on the line, legs tucked) -> fall (arms flung up) -> climb (hauling on the net)
//   landRec (one knee down) / stagger (OPEN: rocked back, arms out, sparks where the plate was) / soaked (OPEN: bent double, dripping)
//   flat (OPEN: on his back) / listTell (throwing the last iron off, arms wide)
//   flurryTell (cutlass and axe crossed in front) -> flurry / flurryGap (alternating cuts) -> axeTell (the axe two-handed over the hat) -> axe (struck down) -> axeStuck (OPEN:
//   hauling at the axe in the deck) -> axeRec
//   dead (drawDeadAdmiral): he goes to his knees, the hat rolls, and he lies on the lashings.
// THE FIGHT'S PIECES (drawShot, drawAim, drawKeg, drawCells, drawYard, drawLine, drawLandMark, drawPlateFall, drawList) and THE NIGHT (drawLanterns, drawFlagshipStern) are drawn here too.
const R = Math.round, D2R = Math.PI / 180;
const clamp = (v, a = 0, b = 1) => Math.max(a, Math.min(b, v)), lerp = (a, b, k) => a + (b - a) * k, ease = k => k * k * (3 - 2 * k);
const NORM = {
  /* the coat: oxblood, four steps */ c0: '#2a0a10', c1: '#4c141a', c2: '#74202a', c3: '#9a3434', c4: '#c4503e', cs: '#a8605a',
  /* gold lace */ g0: '#5e4216', g1: '#a07a28', g2: '#dcb44a', g3: '#fff0a4',
  /* hat, black felt */ h0: '#0a080e', h1: '#1a1620', h2: '#322d3c',
  /* skin */ s0: '#76462e', s1: '#b47852', s2: '#d89a70', s3: '#f0bd96',
  /* beard and queue */ b0: '#66666e', b1: '#979aa4', b2: '#c6c8cc', b3: '#eceae6',
  /* leather: boots, belts */ l0: '#120d0a', l1: '#2a1e16', l2: '#4a3626', l3: '#6e5238',
  /* breeches and shirt */ br: '#2c2230', br2: '#463a4c', sh: '#ece0c4', sh2: '#b8a888',
  /* hull iron */ i0: '#14161c', i1: '#2a2e38', i2: '#474d5a', i3: '#757d8c', i4: '#a8b0bc', rust: '#8a4a26', rust2: '#b86a34', barn: '#d2d0b4', barn2: '#9c9a82', weed: '#4a6a3c',
  /* steel */ st0: '#7e8a96', st1: '#b4c0ca', st2: '#e4ecf2', st3: '#ffffff', haft: '#5a3a20', haft2: '#8a6030',
  /* the rest */ line: '#cdb67e', line2: '#8e7a4c', keg: '#6c4a28', keg2: '#9a7444', keg3: '#4a301a', band: '#2e2e36', spark: '#ffd36b', fuse: '#8a7454', plume: '#d63a32', plume2: '#f08a6a',
  eye: '#e8f4ff', pupil: '#10141c', brass: '#d8b04a', brass2: '#8a6a28', smoke: '#cfcac2', smoke2: '#8e8a86', water: '#bfe6f5', deck: '#1a1410' };
const hex = h => [parseInt(h.slice(1, 3), 16), parseInt(h.slice(3, 5), 16), parseInt(h.slice(5, 7), 16)];
const mix = (a, b, k) => { const A = hex(a), B = hex(b); return '#' + A.map((v, i) => R(lerp(v, B[i], k)).toString(16).padStart(2, '0')).join(''); };
const tintPal = (p, to, k, keep = []) => { const o = {}; for (const key in p) o[key] = keep.includes(key) ? p[key] : mix(p[key], to, k); return o; };
const KEEP = ['eye', 'pupil', 'spark', 'water', 'deck', 'smoke', 'smoke2', 'plume2'];
const WARD = tintPal(NORM, '#9fb4c6', 0.55, KEEP), FLASH = tintPal(NORM, '#ffffff', 0.78, KEEP);
let C = NORM, g_, X_ = 0, Y_ = 0, F_ = 1, T_ = 0;
/* local space: u forward (along f), v up from his feet */
const fr = (u, v, w, h, col) => { u = R(u); v = R(v); g_.fillStyle = col; g_.fillRect(F_ > 0 ? X_ + u : X_ - u - w, Y_ - v - h, w, h); };
const pix = (u, v, col) => fr(u, v, 1, 1, col);
function pl(u0, v0, u1, v1, w, col) { const n = Math.max(1, Math.ceil(Math.max(Math.abs(u1 - u0), Math.abs(v1 - v0)))); for (let i = 0; i <= n; i++) fr(lerp(u0, u1, i / n) - w / 2, lerp(v0, v1, i / n) - w / 2, w, w, col); }
function disc(u, v, r, col) { u = R(u); v = R(v); for (let d = -r; d <= r; d++) { const hw = Math.floor(Math.sqrt(r * r - d * d + 0.5)); fr(u - hw, v + d, 2 * hw + 1, 1, col); } }
/* a limb outlined: a dark capsule one wider, then the colour on it, then a light seam on its lit side */
function limb(u0, v0, u1, v1, w, dark, base, lit) { pl(u0, v0, u1, v1, w + 2, dark); pl(u0, v0, u1, v1, w, base); if (lit) pl(u0 + 1, v0 + 1, u1 + 1, v1 + 1, 1, lit); }
/* the two-bone limb: the elbow / knee of a limb of lengths l1, l2 from (au, av) to (bu, bv); `side` picks the way it bends */
function bend(au, av, bu, bv, l1, l2, side) {
  const dx = bu - au, dv = bv - av, d = Math.max(0.01, Math.hypot(dx, dv)), m = Math.min(d, l1 + l2 - 0.01), a = (l1 * l1 - l2 * l2 + m * m) / (2 * m), h = Math.sqrt(Math.max(0, l1 * l1 - a * a));
  const ux = dx / d, uy = dv / d; let px = -uy, py = ux; if (px * side < 0) { px = -px; py = -py; }
  return [au + ux * a + px * h, av + uy * a + py * h];
}
const noise = (i, k = 7) => ((i * 2654435761 + k * 40503) >>> 0) % 1000 / 1000;

/* ---- THE POSE: where his hands, his lean and his knees are for each key at progress p ---- */
function pose(mode, p, time) {
  const q = { lean: 0, crouch: 0, hR: [10, 24], hL: [-6, 22], bladeA: -0.4, pistol: false, pa: 0, axe: false, keg: false, whistle: false, grap: false, knee: 0, back: 0, bob: 0, drip: false, sparks: false, ram: false, flat: false,
    bow: 0, stride: 0, smear: null, closed: false, feet: 0, hipFwd: 0, trill: false, lamp: false, tuck: false, cardLean: false };
  const k = ease(clamp(p));
  switch (mode) {
    case 'walk': q.bob = Math.abs(Math.sin(time * 7)) * 1.2; q.stride = Math.sin(time * 7) * 3.5; q.hR = [10, 22]; q.bladeA = -0.2; q.hL = [-5 + Math.sin(time * 7) * 2, 22]; break;
    case 'recover': q.hR = [10, 22]; q.bladeA = -0.1; q.bob = Math.sin(time * 3) * 0.5; break;
    case 'sleep': q.cardLean = true; q.closed = true; q.bow = 4; q.hR = [11, 22]; q.hL = [11, 20]; q.bladeA = 1.571; q.lean = 1; break;
    case 'card': q.cardLean = true; q.hR = [11, 23]; q.hL = [11, 21]; q.bladeA = 1.571; q.bow = 1; break;
    case 'wake': q.cardLean = k < 0.6; q.closed = k < 0.35; q.bow = lerp(4, 0, k); q.hR = [lerp(11, 12, k), lerp(22, 30, k)]; q.hL = [lerp(11, -4, k), lerp(20, 22, k)]; q.bladeA = lerp(1.571, -1.1, k); break;
    case 'cutTell': q.lean = -2 * k; q.hR = [lerp(10, -2, k), lerp(24, 42, k)]; q.bladeA = lerp(-0.4, -2.5, k); q.hL = [lerp(-6, -8, k), lerp(22, 26, k)]; q.feet = -2 * k; break;
    case 'cut': q.lean = 3; q.hR = [lerp(8, 18, k), lerp(40, 14, k)]; q.bladeA = lerp(-1.9, 0.9, k); q.smear = [-2.2, lerp(-1.9, 0.9, k)]; q.feet = 3; q.hL = [-9, 24]; break;
    case 'cutRec': q.lean = 3 * (1 - k); q.hR = [14, lerp(12, 20, k)]; q.bladeA = lerp(0.9, 0.2, k); q.feet = 3 * (1 - k); q.hL = [-7, 22]; break;
    case 'pistolTell': case 'pistol2Tell': q.pistol = true; q.hR = [lerp(10, 20, k), lerp(26, 33, k)]; q.hL = [-3, 20]; q.bladeA = 1.5; q.pa = lerp(0.3, 0, k); q.lean = 2 * k; q.feet = 2; break;
    case 'reload': q.ram = true; q.pistol = true; q.pa = -1.25; q.hR = [11, 24]; q.hL = [lerp(8, 14, (Math.sin(time * 10) + 1) / 2), lerp(36, 26, (Math.sin(time * 10) + 1) / 2)]; q.lean = 3; q.bow = 5; q.bladeA = 1.5; break;
    case 'kegTell': q.keg = true; q.crouch = lerp(0, 8, k); q.lean = 4 * k; q.hR = [15, lerp(20, 9, k)]; q.hL = [11, lerp(20, 9, k)]; q.bladeA = 1.5; q.bow = 2 * k; q.feet = 2; break;
    case 'kegRec': q.crouch = lerp(8, 0, k); q.lean = 3 * (1 - k); q.hR = [lerp(16, 12, k), lerp(8, 20, k)]; q.hL = [lerp(12, 4, k), lerp(8, 18, k)]; q.bladeA = 1.5; break;
    case 'whistleTell': q.whistle = true; q.trill = true; q.hL = [5, 36]; q.hR = [lerp(10, 6, k), lerp(24, 48, k)]; q.bladeA = -1.3; q.lean = -1; break;
    case 'whistleRec': q.hR = [lerp(6, 24, k), lerp(48, 14, k)]; q.hL = [lerp(5, -6, k), lerp(36, 22, k)]; q.bladeA = lerp(-1.3, 1.2, k); q.lean = 2 * k; break;
    case 'grapTell': q.grap = true; q.hR = [4 + 4 * Math.cos(time * 14), 46]; q.hL = [-4, 22]; q.bladeA = 1.4; q.crouch = 3 * k; q.feet = 1; break;
    case 'swing': q.hR = [5, 52]; q.hL = [8, 49]; q.knee = 8; q.tuck = true; q.bladeA = 0.6; q.lean = 2; break;
    case 'fall': q.hR = [8, 50]; q.hL = [-8, 48]; q.knee = 4; q.tuck = true; q.bladeA = -1.6; q.lean = -3; break;
    case 'climb': q.hR = [6, lerp(30, 42, (Math.sin(time * 8) + 1) / 2)]; q.hL = [-2, lerp(42, 30, (Math.sin(time * 8) + 1) / 2)]; q.drip = true; q.bladeA = 1.4; q.bow = 2; q.knee = 3; break;
    case 'landRec': q.crouch = lerp(9, 0, k); q.knee = lerp(7, 0, k); q.hR = [16, 12]; q.bladeA = 0.8; q.hL = [-6, 14]; break;
    case 'stagger': q.lean = -4 + Math.sin(time * 5) * 1.6; q.bob = Math.sin(time * 9) * 0.5; q.back = 3; q.hR = [16, 30]; q.hL = [-14, 28]; q.bladeA = -2.2; q.sparks = true; q.bow = -1; q.feet = -3; break;
    case 'soaked': q.crouch = 6 + Math.sin(time * 3) * 0.8; q.bob = Math.sin(time * 26) * 0.5; q.lean = 5 + Math.sin(time * 4) * 0.8; q.hR = [14, 10]; q.hL = [8, 12]; q.drip = true; q.bladeA = 1.2; q.bow = 6; break;
    case 'flat': q.flat = true; break;
    case 'listTell': q.hR = [lerp(10, 22, k), lerp(24, 36, k)]; q.hL = [lerp(-6, -18, k), lerp(22, 36, k)]; q.bladeA = -0.6; q.lean = -2; q.feet = 2; break;
    case 'flurryTell': q.axe = true; q.hR = [10, 30]; q.hL = [12, 30]; q.bladeA = -2.0; q.lean = -1; break;
    case 'flurry': case 'flurryGap': { q.axe = true; const s = Math.floor(time * 12) % 2; q.hR = s ? [18, 18] : [6, 34]; q.hL = s ? [4, 34] : [18, 18]; q.bladeA = s ? 0.8 : -1.8; q.lean = 3; q.feet = 3; q.smear = [s ? -1.4 : 0.2, s ? 0.8 : -1.8]; } break;
    case 'axeTell': q.axe = true; q.hL = [lerp(10, 0, k), lerp(26, 49, k)]; q.hR = [lerp(10, 2, k), lerp(26, 47, k)]; q.bladeA = 1.4; q.lean = -2 * k; break;
    case 'axe': q.axe = true; q.hL = [lerp(0, 20, k), lerp(49, 6, k)]; q.hR = [lerp(2, 18, k), lerp(47, 8, k)]; q.lean = 4; q.bladeA = 1.4; q.smear = [-1.5, lerp(-1.5, 1.5, k)]; q.feet = 3; q.bow = 2; break;
    case 'axeStuck': q.axe = true; q.hL = [22, 6]; q.hR = [20, 8]; q.crouch = 6; q.lean = 6 + Math.sin(time * 16); q.bladeA = 1.4; q.bow = 3; break;
    case 'axeRec': q.axe = true; q.hL = [lerp(20, -4, k), lerp(6, 22, k)]; q.hR = [lerp(18, 10, k), lerp(8, 22, k)]; q.bladeA = 0.2; q.lean = 2 * (1 - k); break;
    default: break;
  }
  return q;
}

/* ================= THE PIECES ================= */
/* one plate of salvaged hull: scanline-filled (edge dark, body, lit top-left, shaded bottom), a row of rivets, a hull seam, rust runs, barnacles; (u, v) its lower-left, w x h, rd the corner radius */
function iron(u, v, w, h, o = {}) {
  const rd = o.rd ?? 2;
  for (let j = 0; j < h; j++) { const e = j < rd ? rd - j : j >= h - rd ? rd - (h - 1 - j) : 0; fr(u + e, v + j, w - 2 * e, 1, C.i0); }
  for (let j = 1; j < h - 1; j++) { const e = j < rd ? rd - j : j >= h - rd ? rd - (h - 1 - j) : 0; fr(u + 1 + e, v + j, w - 2 - 2 * e, 1, j > h * 0.62 ? C.i3 : j > h * 0.3 ? C.i2 : C.i1); }
  fr(u + 2, v + h - 2, Math.max(2, w - 5), 1, C.i3); fr(u + 1, v + h - 3, 1, Math.max(1, h - 5), C.i3);   /* the light on the top and the left (lit from the front-above) */
  fr(u + 2, v + 1, Math.max(2, w - 4), 1, C.i0);   /* the shade along the bottom */
  if (o.seam !== false) fr(u + 1, v + R(h * 0.45), w - 2, 1, C.i0);   /* a strake seam */
  for (let i = 0; i < w - 3; i += 3) { pix(u + 2 + i, v + h - 3, C.i4); pix(u + 2 + i, v + 2, C.i3); }   /* rivets */
  const n = o.seed || 1;
  for (let i = 0; i < 2; i++) { const ru = u + 2 + R(noise(n + i) * (w - 6)); fr(ru, v + 2, 1, 2 + R(noise(n + 9 + i) * 3), C.rust); pix(ru, v + 2, C.rust2); }   /* rust running down */
  { const gl = ((T_ * 0.55 + (o.seed || 1) * 0.37) % 1.6) - 0.3, gx = Math.floor(gl * (w + h)); if (gx >= 1 && gx < w + h - 2 && C === NORM) for (let j = 2; j < h - 2; j++) { const gu = gx - j; if (gu >= 2 && gu < w - 2) pix(u + gu, v + j, C.i4); } }   /* a glint sweeping the steel */
  if (o.barn !== false) { const bu = u + 1 + R(noise(n + 5) * (w - 5)); fr(bu, v + 4, 2, 1, C.barn); pix(bu + 1, v + 5, C.barn2); pix(bu - 1, v + 4, C.barn2); if (w > 9) { fr(u + w - 4, v + 3, 2, 1, C.barn); pix(u + w - 3, v + 4, C.weed); } }
}
/* the torn strap and the cloth that was under a plate: paler than the coat round it, four bolt holes, a strap hanging */
function scar(u, v, w, h, time, sag = 4) {
  fr(u, v, w, h, C.c3); fr(u, v, w, 1, C.c2); fr(u, v + h - 1, w, 1, C.c4); pix(u + 1, v + 1, C.c0); pix(u + w - 2, v + 1, C.c0); pix(u + 1, v + h - 2, C.c0); pix(u + w - 2, v + h - 2, C.c0);
  const sw = Math.sin(time * 5 + u) > 0 ? 1 : 0; fr(u + 2 + sw, v - sag, 1, sag + 1, C.l1); pix(u + 2 + sw, v - sag, C.l3); fr(u + w - 3 - sw, v - sag + 1, 1, sag, C.l1);
}
function leg(hu, hv, fu, fv, front) {
  const [ku, kv] = bend(hu, hv, fu, fv + 3, 9, 9, 1);
  limb(hu, hv, ku, kv, 5, C.l0, C.br, C.br2);   /* the thigh in dark breeches */
  limb(ku, kv, fu, fv + 3, 5, C.l0, C.l1, front ? C.l3 : C.l2);   /* the boot, lit on its front */
  fr(ku - 3, kv - 3, 7, 4, C.l0); fr(ku - 2, kv - 2, 5, 3, C.l2); fr(ku - 2, kv, 5, 1, C.l3); pix(ku + 2, kv - 1, C.g2);   /* the turned-down boot top, a gold buckle */
  fr(fu - 3, fv, 10, 3, C.l0); fr(fu - 2, fv + 1, 8, 2, C.l1); fr(fu + 4, fv + 1, 3, 1, C.l3); fr(fu - 3, fv, 10, 1, C.l0);   /* the toe, the sole */
}
/* the coat's long skirts, from the waist to the knee; the back vent shows the red lining; the tails fly with his lean */
function skirts(su, hipV, lean, bob) {
  const top = hipV + 4, bot = hipV - 9;
  for (let v = bot; v <= top; v++) {
    const t = (v - bot) / (top - bot), back = -7 - (1 - t) * 3.5 + lean * 0.5 * (1 - t), front = 6 + (1 - t) * 3 + lean * 0.3 * (1 - t) - (v < hipV - 6 ? 1 : 0);
    fr(back, v, front - back, 1, v < bot + 1 ? C.c0 : C.c2);
    fr(back, v, 2, 1, C.c1); fr(front - 2, v, 2, 1, C.c3);
    if (v === bot) fr(back, v, front - back, 1, C.g1);   /* the gold hem */
    if (v === bot + 1) fr(back, v, front - back, 1, C.c1);
  }
  fr(-4, bot + 2, 1, top - bot - 2, C.c4 === C.c4 ? C.c0 : C.c0);   /* the vent */
  fr(-3, bot + 2, 1, top - bot - 2, C.c3);
}
/* the head: a face, a hooked nose, a cold eye, a grey beard and moustache, a grey queue, the tricorn laced in gold with a red plume; bow drops the head and tips the hat */
function head(u, v, o) {
  const bow = o.bow, hv = v - bow * 0.6, hu = u + bow * 0.5;
  fr(hu - 6, hv + 1, 4, 3, C.b1); fr(hu - 8, hv - 3, 3, 6, C.b0); pix(hu - 8, hv - 3, C.l1); fr(hu - 6, hv + 1, 2, 3, C.b2);   /* the queue, tied with a ribbon */
  pix(hu - 6, hv + 3, C.l1);
  fr(hu - 3, hv - 2, 6, 3, C.sh); pix(hu + 2, hv - 1, C.sh2); pix(hu - 2, hv - 2, C.sh2);   /* the cravat */
  fr(hu - 4, hv + 1, 8, 8, C.s2); fr(hu - 4, hv + 1, 3, 8, C.s1); fr(hu + 2, hv + 3, 2, 3, C.s3);   /* the face: shaded behind, lit on the cheek */
  fr(hu + 4, hv + 4, 2, 2, C.s2); pix(hu + 6, hv + 4, C.s1); pix(hu + 5, hv + 3, C.s3);   /* the hooked nose */
  fr(hu - 4, hv - 1, 10, 4, C.b1); fr(hu - 3, hv - 1, 9, 2, C.b2); fr(hu + 4, hv - 2, 3, 2, C.b1); pix(hu + 5, hv - 2, C.b0);   /* the beard, jutting forward at the chin */
  fr(hu - 4, hv, 10, 1, C.b0); pix(hu + 3, hv + 2, C.b3); pix(hu - 1, hv + 1, C.b3); pix(hu + 1, hv, C.b3);
  fr(hu + 1, hv + 4, 5, 1, C.b2); pix(hu + 6, hv + 3, C.b3);   /* the moustache */
  if (o.closed) { fr(hu + 1, hv + 6, 3, 1, C.l0); } else { fr(hu + 1, hv + 6, 3, 2, C.eye); pix(hu + 3, hv + 6, C.pupil); pix(hu + 3, hv + 7, C.pupil); fr(hu, hv + 8, 5, 1, C.s0); fr(hu + 4, hv + 8, 2, 1, C.s0); }   /* the cold eye under a heavy brow */
  /* the tricorn: the crown, the brim with its two upturned ends, the gold lace, the cockade and the plume */
  const bu = hu - 1, bv = hv + 8;
  fr(bu - 5, bv + 1, 11, 6, C.h1); fr(bu - 5, bv + 1, 3, 6, C.h0); fr(bu + 3, bv + 4, 3, 2, C.h2); fr(bu - 3, bv + 5, 7, 1, C.h2);
  fr(bu - 9, bv, 20, 2, C.h0); fr(bu - 8, bv + 1, 18, 1, C.h1);
  fr(bu - 10, bv + 1, 3, 3, C.h0); fr(bu + 9, bv + 1, 3, 4, C.h0); pix(bu - 10, bv + 3, C.h2); pix(bu + 11, bv + 4, C.h2);   /* the brim turned up, behind and in front */
  fr(bu - 9, bv, 20, 1, C.g1); fr(bu - 8, bv, 5, 1, C.g2); fr(bu + 2, bv, 7, 1, C.g2); pix(bu + 11, bv + 3, C.g1); pix(bu - 10, bv + 2, C.g1);   /* the lace along the brim */
  fr(bu - 5, bv + 2, 11, 1, C.g0); fr(bu + 5, bv + 3, 2, 2, C.g2); pix(bu + 5, bv + 4, C.g3);   /* the hat band and the button */
  const fw = Math.sin(T_ * 4) > 0.6 ? 1 : 0;
  pl(bu - 4, bv + 5, bu - 10, bv + 9 - fw, 2, C.plume); pl(bu - 5, bv + 6, bu - 11, bv + 8 - fw, 1, C.plume2); pix(bu - 12, bv + 7 - fw, C.plume);   /* the red plume curling back */
}
/* the cutlass: leather grip, a brass pommel and knuckle-bow guard, a curved blade with a dark back and a bright edge */
function cutlass(hx, hy, a, L = 21) {
  const ca = Math.cos(a), sa = -Math.sin(a);   /* u, v of the heading (v up: a>0 points down) */
  pl(hx - ca * 3, hy - sa * 3, hx + ca, hy + sa, 2, C.l1); pix(hx - ca * 4, hy - sa * 4, C.brass);
  const gu = hx + ca * 1.5, gv = hy + sa * 1.5, nu = -sa, nv = ca;   /* the guard: across the blade, a bow back to the pommel */
  pl(gu - nu * 3, gv - nv * 3, gu + nu * 3, gv + nv * 3, 1, C.brass); pix(gu + nu * 3, gv + nv * 3, C.g3); pl(gu + nu * 3, gv + nv * 3, hx - ca * 3 + nu * 2, hy - sa * 3 + nv * 2, 1, C.brass2);
  const cv = 0.18;
  for (let i = 2; i <= L; i++) { const t = i / L, off = cv * t * t * L * 0.5; const bu = hx + ca * i + nu * off, bv = hy + sa * i + nv * off;
    fr(bu - 1, bv - 1, 2, 2, C.st0); pix(bu + (nu > 0 ? 1 : -1) * 0, bv, C.st1); if (i % 3 !== 0) pix(bu, bv, C.st2); }
  const tu = hx + ca * L + nu * cv * L * 0.5, tv = hy + sa * L + nv * cv * L * 0.5; pix(tu, tv, C.st3);
}
/* a flintlock pistol: a walnut grip, a brass-furnished lock and cock, a blued barrel; a = its heading (0 forward, negative up) */
function flintlock(hx, hy, a, len = 10) {
  const ca = Math.cos(a), sa = -Math.sin(a), nu = -sa, nv = ca;
  pl(hx - ca * 1, hy - sa * 1 - 2, hx - ca * 3, hy - sa * 3 - 4, 3, C.l2); pl(hx - ca * 1, hy - sa * 1 - 2, hx - ca * 3, hy - sa * 3 - 4, 1, C.l3); pix(hx - ca * 3.5, hy - sa * 3.5 - 4, C.brass);
  pl(hx, hy, hx + ca * 3, hy + sa * 3, 3, C.brass2); pix(hx + ca * 1, hy + sa * 1 + 2, C.brass); pix(hx + ca * 0, hy + sa * 0 + 2, C.g3);
  for (let i = 3; i <= len; i++) { fr(hx + ca * i - 1, hy + sa * i - 1, 2, 2, C.i2); pix(hx + ca * i, hy + sa * i + 1, C.i4); }
  pix(hx + ca * len, hy + sa * len, C.i0);
}
function axe(hu, hv, ang) {   /* haft from the grip hu,hv out along ang; the head at the far end */
  const ca = Math.cos(ang), sa = -Math.sin(ang), L = 15;
  pl(hu - ca * 4, hv - sa * 4, hu + ca * L, hv + sa * L, 2, C.haft); pl(hu + ca * 2, hv + sa * 2, hu + ca * L, hv + sa * L, 1, C.haft2);
  const eu = hu + ca * (L - 1), ev = hv + sa * (L - 1), nu = -sa, nv = ca;
  pl(eu - nu * 5, ev - nv * 5, eu + nu * 5, ev + nv * 5, 3, C.i1); pl(eu + nu * 5 + ca * 1, ev + nv * 5 + sa * 1, eu + nu * 5 + ca * 1, ev + nv * 5 + sa * 1, 3, C.st1);
  pl(eu + ca * 2 - nu * 5, ev + sa * 2 - nv * 5, eu + ca * 2 + nu * 5, ev + sa * 2 + nv * 5, 1, C.st2); pl(eu - nu * 4, ev - nv * 4, eu + nu * 4, ev + nv * 4, 1, C.i3);
  pl(eu - ca * 2 + nu * 1, ev - sa * 2 + nv * 1, eu - ca * 4 + nu * 1, ev - sa * 4 + nv * 1, 2, C.i2);   /* the spike */
}
/* a crescent trail: the arc a blade just drew, pale, two bands, fading behind */
function smearArc(cu, cv, r, a0, a1) { for (let a = Math.min(a0, a1); a <= Math.max(a0, a1); a += 0.07) { const k = (a - Math.min(a0, a1)) / Math.max(0.01, Math.abs(a1 - a0)), u = cu + Math.cos(a) * r, v = cv - Math.sin(a) * r;
  g_.globalAlpha = (a1 > a0 ? k : 1 - k) * 0.7 + 0.15; pix(u, v, '#fff6dc'); pix(u - Math.cos(a) * 2, v + Math.sin(a) * 2, '#d8c8a0'); } g_.globalAlpha = 1; }
const keg = (u, v, s = 1) => { const w = 12 * s, h = 11 * s; fr(u - 1, v - 1, w + 2, h + 2, C.l0); fr(u, v, w, h, C.keg); fr(u, v, 2, h, C.keg3); fr(u + w - 3, v, 2, h, C.keg2); fr(u + 4, v, 1, h, C.keg3); fr(u + 8, v, 1, h, C.keg3);
  fr(u - 1, v + 2, w + 2, 2, C.band); fr(u - 1, v + h - 4, w + 2, 2, C.band); fr(u - 1, v + 2, w + 2, 1, C.i3); fr(u - 1, v + h - 4, w + 2, 1, C.i3); fr(u + 3, v + h, 3, 1, C.keg3); };

/* ================= HIM ================= */
export function drawAdmiral(g, x, y, f, o, time) {
  g_ = g; X_ = R(x); Y_ = R(y); F_ = f || 1; T_ = time || 0; C = o.flash ? FLASH : o.ward ? WARD : NORM;
  const off = o.off || [], bare = i => off.includes(i), q = pose(o.mode, o.p || 0, T_);
  if (q.flat) { drawFlat(o, off); return; }
  const cr = q.crouch, lean = q.lean, hipV = 17 - cr * 0.7 + q.bob, shV = hipV + 17, su = R(lean * 0.8), walk = o.mode === 'walk';
  /* ---- the legs ---- */
  const stand = q.cardLean ? [-3, 4] : q.tuck ? [-1, 3] : [-5 + q.stride - q.feet * 0.4, 4 - q.stride + q.feet * 0.4], lift = i => q.tuck ? (i ? q.knee : 2) : (walk ? Math.max(0, Math.sin(T_ * 7 + i * 3.14)) * 3 : 0);
  leg(-2, hipV, stand[0] + (q.knee ? -3 : 0), lift(0) + (q.tuck ? 6 : 0), false);
  leg(2, hipV, stand[1] + (q.tuck ? 3 : 0), lift(1) + (q.knee && !q.tuck ? q.knee * 0.4 : 0) + (q.tuck ? 6 : 0), true);
  /* ---- behind him: the BACK plate (its straps run over the shoulder) ---- */
  const fa = q.far = bend(su - 3, shV - 2, q.hL[0], q.hL[1] - cr, 8, 9, -1);
  limb(su - 3, shV - 3, fa[0], fa[1], 3, C.c0, C.c1); limb(fa[0], fa[1], q.hL[0], q.hL[1] - cr, 3, C.c0, C.c1); fr(q.hL[0] - 1, q.hL[1] - cr - 1, 3, 3, C.s1); fr(q.hL[0] - 1, q.hL[1] - cr + 1, 3, 1, C.g1);   /* the far arm, shaded */
  if (!bare(1)) { iron(su - 12, shV - 15, 6, 15, { seed: 3, rd: 2 }); pl(su - 7, shV, su - 3, shV - 4, 1, C.l1); }
  else { scar(su - 11, shV - 15, 5, 12, T_, 5); }
  /* ---- the coat ---- */
  skirts(su, hipV, lean, q.bob);
  for (let v = hipV + 3; v <= shV; v++) { const t = (v - (hipV + 3)) / (shV - hipV - 3), back = su - 8 - (1 - t) * 0, front = su + 5 + t * 3 + (1 - t) * 1;
    fr(back, v, front - back, 1, C.c2); fr(back, v, 2, 1, C.c1); fr(front - 3, v, 3, 1, C.c3); fr(front - 1, v, 1, 1, C.c4); }
  fr(su - 8, hipV + 3, 17, 2, C.l1); fr(su + 1, hipV + 3, 3, 2, C.brass); pix(su + 2, hipV + 3, C.g3);   /* the belt and its buckle */
  for (let i = 0; i < 4; i++) { const v = shV - 3 - i * 3; fr(su + 3, v, 6, 1, C.g2); pix(su + 8, v, C.g3); pix(su + 3, v, C.g1); fr(su + 4, v - 1, 1, 1, C.g0); }   /* the gold frogging down the front */
  fr(su - 7, shV - 1, 15, 2, C.c1); fr(su - 6, shV, 13, 1, C.g1);   /* the high gold-laced collar */
  /* ---- the brace of pistols on the baldric (phase one, holstered) ---- */
  if (!q.pistol || q.ram) { pl(su - 7, shV - 2, su + 7, hipV + 4, 2, C.l0); pl(su - 7, shV - 3, su + 7, hipV + 3, 1, C.l2); pix(su, shV - 8, C.brass); pix(su + 1, shV - 8, C.g3); }
  if (!q.pistol) { for (let i = 0; i < 2; i++) { const pu = su - 3 + i * 5, pv = shV - 9 - i * 2; fr(pu, pv, 3, 4, C.l2); fr(pu, pv + 3, 3, 1, C.l3); fr(pu - 1, pv + 4, 5, 1, C.brass2); } }
  /* ---- the head ---- */
  head(su + 2, shV + 1, { bow: q.bow, closed: q.closed });
  /* ---- the near arm: shoulder -> elbow -> hand, in the coat's gold-cuffed sleeve ---- */
  const sh = [su + 4, shV - 2], hnd = [q.hR[0], q.hR[1] - cr], el = bend(sh[0], sh[1], hnd[0], hnd[1], 8, 9, -1);
  limb(sh[0], sh[1], el[0], el[1], 4, C.c0, C.c3, C.c4); limb(el[0], el[1], hnd[0], hnd[1], 4, C.c0, C.c2, C.c3); fr(hnd[0] - 2, hnd[1] - 2, 5, 2, C.g1); fr(hnd[0] - 2, hnd[1] - 2, 5, 1, C.g2);
  fr(hnd[0] - 1, hnd[1], 3, 3, C.s2); pix(hnd[0] + 1, hnd[1] + 2, C.s3);
  /* ---- the CHEST plate (over the sleeve: the breastplate must read, and its loss must show) ---- */
  if (!bare(0)) { iron(su - 4, shV - 15, 14, 14, { seed: 11, rd: 3 }); const cu = su + 3, cv = shV - 9; disc(cu, cv, 3, C.rust); disc(cu, cv, 2, C.i0); pix(cu - 2, cv + 2, C.rust2); pix(cu + 2, cv - 2, C.brass2); pix(cu, cv + 3, C.i4); pix(cu - 1, cv, C.i2); }   /* the gunport rim still on it */
  else scar(su - 3, shV - 14, 12, 12, T_, 5);
  /* ---- the PAULDRONS: a dome on each shoulder ---- */
  if (!bare(2)) { iron(su - 8, shV - 3, 7, 7, { seed: 21, rd: 2, seam: false }); iron(su + 1, shV - 4, 9, 9, { seed: 27, rd: 3 }); }
  else { fr(su - 7, shV - 2, 5, 3, C.c3); fr(su + 2, shV - 3, 6, 4, C.c3); fr(su + 2, shV - 3, 6, 1, C.g1); pix(su + 3, shV - 2, C.c0); pix(su + 7, shV - 2, C.c0); }
  /* ---- what is in his hands ---- */
  const hx = hnd[0], hy = hnd[1];
  if (q.pistol) { flintlock(hx, hy + 1, q.pa, 10); if (q.ram) { pl(q.hL[0], q.hL[1] - cr, hx + Math.cos(q.pa) * 11, hy + 1 + -Math.sin(q.pa) * 11, 1, C.i4); const sm = (T_ * 1.5) % 1; g_.globalAlpha = 0.7 * (1 - sm); fr(hx + 6 + sm * 4, hy + 14 + sm * 10, 5, 3, C.smoke); fr(hx + 8 + sm * 3, hy + 18 + sm * 12, 3, 2, C.smoke2); g_.globalAlpha = 1; }
    else if (o.mode === 'pistol2Tell' || (o.mode === 'pistolTell')) { /* the other hand on his hip */ } }
  else if (q.keg) { keg(hx - 3, hy - 6); const fl = Math.floor(T_ * 16) % 2; pl(hx + 3, hy + 6, hx + 4, hy + 10, 1, C.fuse); fr(hx + 2, hy + 10, 3, 3, fl ? '#ffd36b' : '#ff8a3a'); pix(hx + 3, hy + 13, '#fff6c8'); }
  else if (q.whistle) { fr(su + 7, shV + 4, 3, 2, C.brass); pix(su + 9, shV + 5, C.g3); pl(su + 8, shV + 3, su + 3, shV - 5, 1, C.g1); if (q.trill) for (let i = 0; i < 3; i++) { const t = (T_ * 6 + i * 0.4) % 1; g_.globalAlpha = 1 - t * 0.8; fr(su + 11 + t * 8 + i * 3, shV + 5 + (i - 1) * 3, 2, 1, '#f2ead2'); } g_.globalAlpha = 1; }
  else if (q.grap) { const ph = T_ * 14, gu = hx + Math.cos(ph) * 9, gv = hy + 8 + Math.sin(ph) * 5; for (let a = 0; a < 6.3; a += 0.45) pix(hx + Math.cos(a + ph) * 9, hy + 8 + Math.sin(a + ph) * 5, a % 0.9 < 0.45 ? C.line : C.line2);
    pl(hx, hy, gu, gv, 1, C.line); fr(gu - 2, gv - 2, 5, 5, C.i1); fr(gu - 1, gv - 1, 3, 3, C.i3); pix(gu - 3, gv + 2, C.i4); pix(gu + 3, gv + 2, C.i4); pix(gu, gv - 3, C.i4); }
  else if (!q.tuck) cutlass(hx, hy + 1, q.bladeA);
  if (q.tuck) { pl(hx, hy + 3, hx, hy + 12, 1, C.line); }   /* the rope in his fists, going up */
  if (q.axe) { const ax = q.hL[0], ay = q.hL[1] - cr; axe(ax, ay, o.mode === 'axeTell' ? 1.9 : o.mode === 'axeStuck' ? -1.4 : o.mode === 'flurryTell' ? 1.2 : q.bladeA + 0.4); }
  if (q.smear) smearArc(hx - 4, hy - 4, 21, q.smear[0], q.smear[1]);
  if (q.sparks && Math.floor(T_ * 20) % 2) { pix(su + 4, shV - 8, C.spark); pix(su + 8, shV - 5, '#fff6c8'); pix(su - 2, shV - 6, C.spark); pix(su + 6, shV - 12, '#fff6c8'); }
  if (q.drip) for (let i = 0; i < 5; i++) { const t = (T_ * 1.7 + i * 0.23) % 1; fr(-6 + i * 3, shV - 4 - t * 24, 1, 2, C.water); }
}
/* on his back along the deck, head toward his back (-u), the hat beside him: the plates still on him are drawn on the coat */
function drawFlat(o, off, dead) {
  fr(-24, 0, 38, 3, C.l0); fr(-22, 3, 34, 4, C.c2); fr(-22, 3, 34, 1, C.c1); fr(-22, 6, 34, 1, C.c3); for (let i = 0; i < 4; i++) fr(-12 + i * 5, 5, 1, 1, C.g2);   /* the coat, the length of him */
  fr(14, 0, 3, 7, C.l1); fr(14, 0, 3, 7, C.l1); fr(16, 0, 6, 3, C.l0); fr(16, 1, 5, 2, C.l1); fr(10, 1, 6, 5, C.br);   /* the boots up in the air */
  fr(-34, 2, 11, 6, C.s2); fr(-34, 2, 11, 3, C.b1); fr(-32, 3, 8, 1, C.b2); pix(-28, 6, C.closed ? C.l0 : C.eye); pix(-27, 5, C.pupil); fr(-23, 2, 3, 4, C.sh);   /* the head on the planks, the beard to the sky */
  if (!off.includes(0)) iron(-14, 6, 14, 4, { seed: 11, rd: 1, seam: false }); if (!off.includes(2)) { iron(-22, 5, 7, 5, { seed: 21, rd: 1, seam: false }); iron(-2, 5, 8, 5, { seed: 27, rd: 1, seam: false }); }
  fr(-18, 0, 1, 1, C.deck);
  if (!dead) { fr(18, 8, 14, 1, C.st1); pix(32, 8, C.st3); fr(15, 7, 3, 3, C.brass); }   /* the cutlass loose in his hand, the point up */
  /* the hat rolled off, the plume trailing */
  fr(-46, 0, 10, 3, C.h1); fr(-44, 3, 6, 2, C.h0); fr(-46, 0, 10, 1, C.g1); pl(-47, 2, -52, 5, 2, C.plume);
  if (!dead && Math.floor(T_ * 8) % 3 === 0) { pix(-38, 14, C.spark); pix(-30, 17, '#fff6c8'); pix(-20, 14, C.spark); }   /* stars */
  if (!dead) { fr(-34, 11, 3, 1, C.spark); fr(-26, 13, 3, 1, C.spark); fr(-18, 12, 3, 1, C.spark); }
}
export function drawDeadAdmiral(g, x, y, f, k, time) { g_ = g; X_ = R(x); Y_ = R(y); F_ = f || 1; T_ = time || 0; C = NORM;
  if (k < 0.5) { /* to his knees: the coat folds, the head drops, the cutlass falls from the hand */
    const kk = k / 0.5, dr = ease(kk), v0 = 18 - dr * 7;
    fr(-8, 0, 17, 4, C.l0); fr(-7, 2, 7, 3, C.l1); fr(2, 0, 9, 3, C.l1);   /* the boots, one knee grounded */
    fr(-9, 3, 18, v0 - 3, C.c2); fr(-9, 3, 3, v0 - 3, C.c1); fr(6, 3, 3, v0 - 3, C.c3); fr(-9, 3, 18, 1, C.g1);
    const tv = v0 + 2; fr(-8 + dr * 2, tv, 15, 16 - dr * 4, C.c2); fr(-8 + dr * 2, tv, 3, 16 - dr * 4, C.c1); fr(4 + dr * 2, tv, 3, 16 - dr * 4, C.c3); for (let i = 0; i < 3; i++) fr(2 + dr * 2, tv + 3 + i * 3, 6, 1, C.g2);
    const hu = 1 + dr * 5, hv = tv + 14 - dr * 6; fr(hu - 4, hv, 8, 7, C.s2); fr(hu - 4, hv, 8, 3, C.b1); fr(hu - 3, hv, 3, 7, C.b0); pix(hu + 2, hv + 5, C.l0);
    if (kk < 0.7) { fr(hu - 9, hv + 7, 19, 2, C.h0); fr(hu - 5, hv + 9, 11, 5, C.h1); fr(hu - 9, hv + 7, 19, 1, C.g1); } else { /* the hat leaves his head */ const hk = (kk - 0.7) / 0.3; fr(hu - 9 - hk * 14, hv + 7 - hk * 10, 19, 2, C.h0); fr(hu - 5 - hk * 14, hv + 9 - hk * 10, 11, 4, C.h1); fr(hu - 9 - hk * 14, hv + 7 - hk * 10, 19, 1, C.g1); }
    fr(16, 0, 1, 18 * (1 - dr) + 4, C.st1); fr(14, 18 * (1 - dr) + 3, 5, 2, C.brass); }
  else { const kk = clamp((k - 0.5) * 2), e = ease(kk); drawFlat({}, [0, 1, 2], true); fr(-46 + R(e * 6), 0, 7, 1, C.deck);
    g_.globalAlpha = 1 - e * 0.3; fr(14, 0, 20, 2, C.st1); pix(34, 0, C.st3); fr(12, 0, 3, 3, C.brass); g_.globalAlpha = 1; } }
export function drawAdmiralCard(g, x, y, f, time) { drawAdmiral(g, x, y, f, { mode: 'card', p: 0, off: [] }, time); }

/* ---- THE FIGHT'S PIECES ---- */
/* his pistol ball in flight, trailing a thread of smoke, and the aim line while he levels it (dashed while it follows you, solid red when it locks, a cross where it will land) */
export function drawShot(g, x, y) { g.globalAlpha = 0.45; g.fillStyle = '#cfcac2'; g.fillRect(x - 9, y - 1, 6, 2); g.fillStyle = '#8e8a86'; g.fillRect(x - 15, y, 5, 1); g.globalAlpha = 1;
  g.fillStyle = '#0a080e'; g.fillRect(x - 2, y - 2, 4, 4); g.fillStyle = '#474d5a'; g.fillRect(x - 2, y - 2, 4, 1); g.fillStyle = '#fff2c8'; g.fillRect(x - 1, y - 2, 2, 1); }
export function drawAim(g, x0, y, x1, locked, time) { g.globalAlpha = locked ? 0.85 : 0.45; g.fillStyle = locked ? '#ff6b6b' : '#ffd36b'; const d = Math.sign(x1 - x0) || 1;
  for (let x = x0; d > 0 ? x < x1 : x > x1; x += d * (locked ? 3 : 6)) g.fillRect(R(x), R(y), 2, 1);
  if (locked) { g.fillStyle = '#fff2c8'; g.fillRect(R(x1) - 2, R(y) - 2, 5, 1); g.fillRect(R(x1) - 2, R(y) + 2, 5, 1); g.fillRect(R(x1) - 3, R(y) - 1, 1, 3); g.fillRect(R(x1) + 3, R(y) - 1, 1, 3); }
  g.globalAlpha = 1; }
/* his keg: rolling end over end, its iron bands turning, the fuse burning down (the spark climbs the fuse, smoke off it) */
export function drawKeg(g, x, y, fuse, max, time, back) { const r = R(time * 10) % 4; g.fillStyle = '#0a080e'; g.fillRect(x - 7, y - 13, 14, 14);
  g.fillStyle = NORM.keg; g.fillRect(x - 6, y - 12, 12, 12); g.fillStyle = NORM.keg3; g.fillRect(x - 6, y - 12, 2, 12); g.fillStyle = NORM.keg2; g.fillRect(x + 3, y - 12, 2, 12); g.fillStyle = NORM.keg3; g.fillRect(x - 1 + (r % 2), y - 12, 1, 12);
  g.fillStyle = NORM.band; g.fillRect(x - 7, y - 10, 14, 2); g.fillRect(x - 7, y - 4, 14, 2); g.fillStyle = NORM.i3; g.fillRect(x - 7, y - 10, 14, 1); g.fillRect(x - 7, y - 4, 14, 1);
  g.fillStyle = '#1c1612'; g.fillRect(x - 2, y - 13, 4, 1);   /* the bung */
  const k = clamp(fuse / max), fl = R(6 * k); g.fillStyle = NORM.fuse; g.fillRect(x - 1, y - 13 - fl, 1, fl); if (Math.floor(time * 16) % 2) { g.fillStyle = k < 0.3 ? '#ff6b6b' : '#ffd36b'; g.fillRect(x - 2, y - 15 - fl, 3, 3); g.fillStyle = '#fff6c8'; g.fillRect(x - 1, y - 14 - fl, 1, 1); }
  g.globalAlpha = 0.5; g.fillStyle = NORM.smoke; g.fillRect(x - 2 + R(Math.sin(time * 9)), y - 20 - fl - R((time * 14) % 5), 2, 2); g.globalAlpha = 1;
  if (back) { g.fillStyle = '#8fd160'; g.fillRect(x - 7, y - 17 - fl, 14, 1); g.fillRect(x - 7, y - 20 - fl, 1, 3); g.fillRect(x + 6, y - 20 - fl, 1, 3); } }
/* THE BROADSIDE'S CELLS: red hatched strips on the deck while marked (they pulse quicker as the shot comes) with a round-shot sign in each, and the shot coming down as a gold streak with a hard white core */
export function drawCells(g, cells, hit, y, k, fired, time, cx) { for (let i = 0; i < cells.length; i++) { if (!hit[i]) continue; const a = R(cells[i][0] - cx), b = R(cells[i][1] - cx);
    if (!fired) { const pul = 0.5 + 0.5 * Math.sin(time * (6 + 14 * k)); g.globalAlpha = 0.14 + 0.2 * pul; g.fillStyle = '#ff4a3a'; g.fillRect(a + 2, y - 46, b - a - 4, 46);
      g.globalAlpha = 0.9; g.fillRect(a + 2, y - 2, b - a - 4, 2); for (let xx = a + 6; xx < b - 6; xx += 10) { g.fillRect(xx, y - 6, 4, 1); g.fillRect(xx + 2, y - 8, 1, 1); }
      g.globalAlpha = 0.5 + 0.4 * pul; g.fillStyle = '#ff9a7a'; for (let yy = y - 44; yy < y - 6; yy += 6) { g.fillRect(a + 2, yy, 1, 3); g.fillRect(b - 3, yy, 1, 3); }
      const mx = R((a + b) / 2); g.globalAlpha = 0.9; g.fillStyle = '#0a080e'; g.fillRect(mx - 3, y - 20, 7, 7); g.fillStyle = '#ff6b6b'; g.fillRect(mx - 2, y - 19, 5, 5); g.fillStyle = '#0a080e'; g.fillRect(mx - 1, y - 18, 3, 3); g.globalAlpha = 1; }
    else { g.globalAlpha = 0.7; g.fillStyle = '#ffd36b'; g.fillRect(a + 2, y - 46, b - a - 4, 46); g.globalAlpha = 0.9; g.fillStyle = '#fff6c8'; g.fillRect(a + 8, y - 46, Math.max(2, b - a - 16), 46); g.globalAlpha = 1; } } }
/* THE GRAPNEL'S LINE from the main yard to his hands, and the MAIN YARD itself over the lashing: a spar on its mast with a furled sail lashed along it, the gaskets, a block and a lantern */
export function drawYard(g, x, y, time) {
  g.fillStyle = '#0a080e'; g.fillRect(x - 71, y - 1, 142, 7); g.fillStyle = '#4a3624'; g.fillRect(x - 70, y, 140, 5); g.fillStyle = '#6e5238'; g.fillRect(x - 70, y, 140, 1); g.fillStyle = '#2a1e16'; g.fillRect(x - 70, y + 4, 140, 1);
  g.fillStyle = '#2a1e16'; g.fillRect(x - 74, y - 1, 5, 7); g.fillRect(x + 70, y - 1, 5, 7); g.fillStyle = '#8a7454'; g.fillRect(x - 74, y - 1, 5, 1); g.fillRect(x + 70, y - 1, 5, 1);   /* the yardarm caps */
  g.fillStyle = '#9a8a6a'; g.fillRect(x - 56, y - 6, 112, 5); g.fillStyle = '#cdbf9c'; g.fillRect(x - 56, y - 6, 112, 1); g.fillStyle = '#6a5a40'; g.fillRect(x - 56, y - 2, 112, 1);   /* the sail furled along it */
  for (let i = -52; i <= 52; i += 13) { g.fillStyle = '#3a2e22'; g.fillRect(x + i, y - 7, 2, 8); g.fillStyle = '#8a7454'; g.fillRect(x + i, y - 7, 1, 1); }   /* the gaskets */
  g.fillStyle = '#2a1e16'; g.fillRect(x - 4, y - 40, 8, 46); g.fillStyle = '#4a3624'; g.fillRect(x - 3, y - 40, 5, 46); g.fillStyle = '#6e5238'; g.fillRect(x - 3, y - 40, 1, 46);   /* the mast */
  g.fillStyle = '#1a1410'; g.fillRect(x - 5, y + 1, 10, 2); g.fillRect(x - 5, y - 8, 10, 2);   /* the trestletrees */
  g.fillStyle = '#3a3a40'; g.fillRect(x + 8, y + 6, 3, 5); g.fillStyle = '#7a808e'; g.fillRect(x + 8, y + 6, 3, 1); g.fillStyle = '#4a3624'; g.fillRect(x + 9, y + 11, 1, 3);   /* a block under the yard, its fall */
  const sw = R(Math.sin(time * 1.6) * 1); g.fillStyle = '#16121a'; g.fillRect(x - 24 + sw, y + 6, 1, 8); g.fillStyle = '#3a2e22'; g.fillRect(x - 27 + sw, y + 13, 7, 8); g.fillStyle = '#ffd36b'; g.fillRect(x - 26 + sw, y + 14, 5, 6); g.fillStyle = '#fff6c8'; g.fillRect(x - 25 + sw, y + 15, 3, 3);   /* a ship's lantern */
  g.globalAlpha = 0.18; g.fillStyle = '#ffd36b'; g.fillRect(x - 33 + sw, y + 7, 19, 20); g.globalAlpha = 1; }
export function drawLine(g, x0, y0, x1, y1) { const n = Math.max(1, Math.ceil(Math.hypot(x1 - x0, y1 - y0) / 2)); for (let i = 0; i <= n; i++) { g.fillStyle = i % 3 ? NORM.line : NORM.line2; g.fillRect(R(lerp(x0, x1, i / n)), R(lerp(y0, y1, i / n)), 1, 1); }
  g.fillStyle = NORM.i3; g.fillRect(R(x0) - 2, R(y0) - 1, 5, 3); g.fillStyle = NORM.i0; g.fillRect(R(x0) - 2, R(y0) + 2, 5, 1); }   /* the iron ring at the yard */
export function drawLandMark(g, x, y, r, k, time) { g.globalAlpha = 0.35 + 0.4 * k; g.fillStyle = '#ff6b6b'; g.fillRect(R(x - r), y - 2, R(2 * r), 2); g.fillRect(R(x - r), y - 6, 2, 4); g.fillRect(R(x + r - 2), y - 6, 2, 4);
  for (let i = -2; i <= 2; i++) g.fillRect(R(x) + i * 4 - 1, y - 4 - Math.abs(i), 2, 1); g.fillStyle = '#fff2c8'; g.fillRect(R(x) - 1, y - 3, 3, 1); g.globalAlpha = 1; }
/* a PLATE blown off: it tumbles out as the very plate he wore (the one that went; turned end over end in quarter turns) and falls into the harbour, a streak of sparks behind it */
export function drawPlateFall(g, x, y, k, which) { const px = R(x + k * 50 * (which === 1 ? -1 : 1)), py = R(y - 30 + k * k * 90 - k * 40), turn = Math.floor(k * 9) % 4;
  for (let i = 1; i <= 4; i++) { const kk = Math.max(0, k - i * 0.04); g.globalAlpha = 0.5 - i * 0.1; g.fillStyle = i % 2 ? '#ffd36b' : '#fff6c8'; g.fillRect(R(x + kk * 50 * (which === 1 ? -1 : 1)), R(y - 30 + kk * kk * 90 - kk * 40), 2, 2); } g.globalAlpha = 1;
  g_ = g; X_ = px; Y_ = py; F_ = 1; C = NORM;
  const w0 = which === 2 ? 8 : which === 1 ? 8 : 14, h0 = which === 2 ? 8 : which === 1 ? 14 : 13, sw = turn % 2 === 1, w = sw ? h0 : w0, h = sw ? w0 : h0;
  iron(-w / 2, -h / 2, w, h, { seed: which * 7 + 3, rd: 2, seam: which !== 2 });
  if (which === 0 && !sw) { disc(0, 0, 3, NORM.rust); disc(0, 0, 2, NORM.i0); } }
/* THE LIST: her deck heeled toward the lashing - the planking drawn slanting down toward the gap, scuppers running, a hauled-taut hawser, and a slide of foam at the low end */
export function drawList(g, x0, x1, y, time) { const w = Math.max(1, x1 - x0);
  g.globalAlpha = 0.5; g.fillStyle = '#c9b27c'; for (let x = x0; x < x1; x += 2) g.fillRect(x, R(y - 1 - (x - x0) / w * 5), 2, 1);
  g.fillStyle = '#0a080e'; for (let x = x0; x < x1; x += 14) g.fillRect(x, R(y - 5 - (x - x0) / w * 5), 1, 4);   /* the plank seams leaning with the deck */
  g.globalAlpha = 1; g.fillStyle = '#ffd36b'; for (let i = 0; i < 3; i++) { const a = R(x0 + (((time * 30) + i * w / 3) % w)); g.fillRect(x1 - (a - x0) - 4, y - 3, 3, 1); g.fillRect(x1 - (a - x0) - 6, y - 4, 1, 1); g.fillRect(x1 - (a - x0) - 6, y - 2, 1, 1); }   /* chevrons running downhill */
  g.fillStyle = '#bfe6f5'; for (let i = 0; i < 4; i++) g.fillRect(x1 - 4 - ((i * 7 + R(time * 18)) % 22), y + 1 + (i % 2), 2, 1); }

/* ---- THE NIGHT (the lashings at the end of the day): ship's lanterns along his flagship's rail and a swung lantern at each mast; screen-space, over the scene, soft ---- */
export function drawLanterns(g, xs, y, time) { for (let i = 0; i < xs.length; i++) { const x = R(xs[i]), sw = R(Math.sin(time * 1.3 + i * 1.7) * 1), fl = 0.7 + 0.3 * Math.sin(time * 9 + i * 3);
    g.globalAlpha = 0.12 * fl; g.fillStyle = '#ffb84a'; g.fillRect(x - 18 + sw, y - 14, 38, 38); g.globalAlpha = 0.14 * fl; g.fillRect(x - 11 + sw, y - 7, 24, 24); g.globalAlpha = 1;
    g.fillStyle = '#16121a'; g.fillRect(x + sw, y - 14, 1, 7); g.fillStyle = '#3a2e22'; g.fillRect(x - 3 + sw, y - 7, 8, 10); g.fillStyle = '#ffd36b'; g.fillRect(x - 2 + sw, y - 6, 6, 8); g.fillStyle = '#fff6c8'; g.fillRect(x - 1 + sw, y - 5, 4, 4);
    g.fillStyle = '#1a1410'; g.fillRect(x - 3 + sw, y - 8, 8, 2); g.fillRect(x - 3 + sw, y + 2, 8, 2); g.fillStyle = '#8a6a28'; g.fillRect(x - 3 + sw, y - 8, 8, 1); } }
/* THE FLAGSHIP'S ENSIGN: a black ensign with the skull on a staff at her taffrail, hauled down by the dead man's end (k 0..1) */
export function drawEnsign(g, x, y, k, time) { g.fillStyle = '#2a1e16'; g.fillRect(x, y - 110, 3, 110); g.fillStyle = '#4a3624'; g.fillRect(x, y - 110, 1, 110); g.fillStyle = '#d8b04a'; g.fillRect(x - 1, y - 113, 5, 3);
  const ky = R(k * 66), fl = R(Math.sin(time * 5) * 1); g.fillStyle = '#16121a'; g.fillRect(x + 3, y - 106 + ky, 24, 15); g.fillStyle = '#ece2cc'; g.fillRect(x + 11 + fl, y - 103 + ky, 8, 6); g.fillRect(x + 13 + fl, y - 97 + ky, 4, 3); g.fillStyle = '#16121a'; g.fillRect(x + 13, y - 102 + ky, 2, 2); g.fillRect(x + 16, y - 102 + ky, 2, 2); g.fillStyle = '#d63a32'; g.fillRect(x + 3, y - 106 + ky, 24, 1); g.fillRect(x + 3, y - 92 + ky, 24, 1);
  g.fillStyle = '#b59a62'; g.fillRect(x + 4, y - 112, 1, 108); }
