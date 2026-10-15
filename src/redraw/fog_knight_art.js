// fog_knight_art.js - THE FOG KNIGHT 2, drawn (claude/towpath2art; the greybox was src/fog-knight-hands.js drawPlate). CRUSADER SCALE (src/main.js closedhelm: a 50 px figure): a great helm
// at -54, the plate to the floor - but the plate is CONSUMED BY FOG: rust-black iron gone red and pitted, barnacles and weed, a cracked great helm with the fog of the locks spilling from
// the eye slit, plates missing where the mist shows through, and no legs - the lower body is mist, he glides. The sword trails mist in its blows.
// THE STANCES (B11): HIGH - the shield up at the helm, the sword low behind;  LOW - the sword planted point-down in front of him, both hands on the pommel, the fog pooled at his feet;
// FULL - the shield across the chest and a column of fog wound round the whole of him.
// EVERY MOVE ITS OWN WINDUP AND RELEASE POSE (B16): cutTell (the sword drawn back over the shoulder, torso coiled) / cut (swung across, a crescent of mist) / cutRec (down in front, leaning);
// lungeTell (crouched, the blade levelled at you, mist gathering behind) / lunge (stretched full length, mist streaming) / lungeRec (the point stuck out, off balance);
// lashTell (the chain whirled over the helm, hook orbiting) / lash (the arm thrown) / lashRec (the arm down, the chain slack); surgeTell (two hands, the sword raised toward the gate, body arched)
// / surge (struck down into the stones, a ring of water) / surgeRec (kneeling on the pommel); spearTell (kneeling, the point in the canal, fog gathering) / spears (the blade torn up, rising) /
// spearRec (rising, off balance); sinkTell (melting into the bank from the feet up); plunge (falling point-down, both hands on the pommel) / plungeRec (STUCK: the blade buried to the guard,
// hunched over it, cracks in the stones, fog venting); shroudTell / stepTell / stepCut (the re-formed cut); doubleTell (the sword saluting, a mist copy peeling off); empty (OPEN: the plates
// sag and stand empty, fog swirling in the hollow); reel; sleep (kneeling on his sword, visor dark) / wake; dissolve; death (the plate falls in a heap, the fog going off over the water).
// Also: the towrope's CHAIN and HOOK, the wall of water with its gate crest, the fog lances and told spots, the plunge's shadow and glow, the double's MIST look.
// Pure drawing on a 2d context g at (x, y) = his feet on screen; a left-facing figure is the same drawing mirrored.
// SECOND PASS (claude/fogknightart2): the figure is drawn in three layers - the MIST he is made of (behind), the BODY (on a scratch canvas, then given a 1 px dark outline so the silhouette reads at game size, like the Crusader), and the FX (semi-transparent mist, trails, glow, in front). Proper proportions: a 34 px wide
// shoulder line (round pauldrons), a ridged breastplate with plackart bands, plate-segment tassets that break up into the mist, bracers with couters, a fist on the grip with the crossguard above it, a broad heater shield, a tattered pennon streaming from the helm - and a strong mist lower body (a swirling column that pools on the stones).
// THIRD PASS (claude/fogknightart3): THE KNIGHT IS NOW A HAND-DRAWN PIXEL SHEET. Helm, breastplate + faulds, pauldrons, shield, fists and the fog SHROUD are authored as palette-map rows below
// (one character = one pixel, '.' clear) and stamped, not built from stacked rects; limbs and the sword are pixel lines with a shaded round brush. The shroud is a tattered cloak that comes off the shoulders and breaks
// into drifting strips and single wisps at the legs (a row-by-row sway and a dissolve) - no pedestal. Pose keys, anchors, hands and the mist fx are the old ones.
const R = Math.round;
const rc = (g, x, y, w, h, c) => { g.fillStyle = c; g.fillRect(R(x), R(y), R(w), R(h)); };
const px1 = (g, x, y, c) => { g.fillStyle = c; g.fillRect(R(x), R(y), 1, 1); };
const rgba = (c, a) => 'rgba(' + c[0] + ',' + c[1] + ',' + c[2] + ',' + Math.max(0, Math.min(1, a)).toFixed(3) + ')';
/* a crisp pixel line (no antialiasing), w px square brush */
const line = (g, x0, y0, x1, y1, c, w = 1) => { g.fillStyle = c; x0 = R(x0); y0 = R(y0); x1 = R(x1); y1 = R(y1); const n = Math.max(Math.abs(x1 - x0), Math.abs(y1 - y0), 1), o = Math.floor((w - 1) / 2); for (let i = 0; i <= n; i++) g.fillRect(R(x0 + (x1 - x0) * i / n) - o, R(y0 + (y1 - y0) * i / n) - o, w, w); };
const FOG = [196, 208, 218], FOG_D = [120, 140, 156];
const PAL = { iron0: '#161a22', iron1: '#3e4a56', iron2: '#6c7c88', iron3: '#9aaab4', rust0: '#4a2a1a', rust1: '#7a4426', rust2: '#b06a38', edge: '#c8d8e0', edge2: '#f0f8fa', barn: '#8c948c', barn2: '#b8c0b8', weed0: '#1e3626', weed1: '#2e4e34', weed2: '#4a7a4c' };
/* the sheet's palette: a deepest, b dark steel, c steel, d light, e pale, f white-hot edge; r/R/o rust (dark/mid/bright); s slit black, w slit light; g fog-lit seam; shroud: m n p q z (dark to white) */
const PM = { a: '#161a22', b: '#3e4a56', c: '#6c7c88', d: '#9aaab4', e: '#c8d8e0', f: '#f0f8fa', r: '#4a2a1a', R: '#7a4426', o: '#b06a38', s: '#04060a', w: '#cfeaff', g: '#bfe6ff', m: '#34485a', n: '#52687c', p: '#7e96aa', q: '#b0c6d4', z: '#dcebf5', y: '#8c948c', Y: '#4a504a' };
/* the darker set the far-side pieces are drawn in */
const BACKMAP = { f: 'd', e: 'c', d: 'c', c: 'b', b: 'a', o: 'R', R: 'r', g: 'c' };
function stamp(g, rows, x, y, o = {}) {
  const { f, back, shear } = o; x = R(x); y = R(y);
  for (let r = 0; r < rows.length; r++) { const s = rows[r], sx = shear ? R(shear(r)) : 0;
    for (let c = 0; c < s.length; c++) { let ch = s[c]; if (ch === '.' || ch === ' ') continue; if (back && BACKMAP[ch]) ch = BACKMAP[ch]; g.fillStyle = f || PM[ch]; g.fillRect(x + c + sx, y + r, 1, 1); } }
}

/* THE GREAT HELM 16 x 20 (cols 0..15, the eye slit's centre at col 8, row 9). Flat crown, steel face in three planes, a rusted brim and chin band, the cross-slit, a breath column, a crack. */
const HELM = [
  '..abccddeeeeff..',
  '.abbcccddeeeffd.',
  'abbbcccdddeeefff',
  'abbbcccdddeeeffd',
  'abbbcccdddeeefff',
  'abbbcccdddeeefff',
  'aRRRRRRRRRRoooRo',
  'abbbbbbbbbbbbbbd',
  'assssssssssssssd',
  'asswwwwwwwwwwwsd',
  'assssssssssssssd',
  'aRRRRRRRRRRRRRRo',
  'abbbccrdddeeefff',
  'abbbcccdaeeeefff',
  'abbbcccdadeeeffd',
  'abbbcccdaddeeffd',
  'abbbcccdadeeeffd',
  '.abbccdddeeefff.',
  '..abbcccddeeff..',
  '...aabbcddeee...'];
/* THE BREASTPLATE + FAULDS 26 x 26 (centre col 12): a V of plate from the shoulder line to the belt, a ridge and a plackart seam, a rust belt, four lames of faulds the lower two split into tatters */
const TORSO = [
  '....abbcccddddeeeefffd',
  '..abbbccccdddddeeeeefffd',
  '.abbbbccccccddddeeeeeeffd',
  '.abbbbcccccdddddeeeeeeedd',
  '.abbbbccccccdddddeeeeeedd',
  '..abbbbcccccddddeeeeeedd',
  '..abbbbcccccddddeeeeeedd',
  '..abbbbccccccdddeeeeeed',
  '...abbbbcccccddeeeeeedd',
  '...abbbbccccccdeeeeeed',
  '...aaaaaaaaaaaaaaaaaaa',
  '...abbbcccccddddeeeeed',
  '...abbbccccccdddeeeeed',
  '...abbbbccccddddeeeed',
  '....abbbccccddddeeeed',
  '....abbbcccccdddeeed',
  '....RRRRRRRRRRRRRRRRR',
  '....rrrrroooorrrrrrrr',
  '...abbcccddddeeeeffd',
  '...abbcccddddeeeeffd',
  '...aaaaaaaaaaaaaaaaa',
  '..abbbcccddddeeeeffd',
  '..abbbcccddddeeeeffd',
  '..aaaa.aaaaa.aaaaaa',
  '.abbcc.cddd.deee.eff',
  '.ab.c..cd..d.ee..ef'];
/* THE NEAR PAULDRON 16 x 9 (centre col 8, row 4): a domed lame stack, a rust rim line; the far one is the same drawn in BACKMAP */
const PAULD = [
  '....aabcddeeff..',
  '..abbccdddeeeff.',
  '.abbcccddeeeeeff',
  'abbbccdddeeeefff',
  'aRRRRRRRRRRRRRod',
  'abbbcccdddeeeed.',
  '.aabbcccddeeed..',
  '...aaabbcdddd...',
  '......aaaaa.....'];
/* THE HEATER 15 x 20: pale rim, two-tone field (dark hoist, lit fly), the lock's sigil - a gate arch over water - in rust, the top-right corner broken away */
const SHIELD = [
  'eeeeeeeeeeeee..',
  'ebbbbbbcddddde.',
  'ebbbbbbcdddddde',
  'ebbbbboooddddde',
  'ebbbbRaaaRdddde',
  'ebbbRaaaaaRddde',
  'ebbbRaaaaaRddde',
  'ebbbRaaaaaRddde',
  'ebbbRaaaaaRddde',
  'ebbbRaaaaaRddde',
  'ebbbRaaaaaRddde',
  'ebbbRRRRRRRddde',
  'ebbbbcccccddde',
  '.ebbbcocococdde.',
  '..ebbbccdddde..',
  '...ebbbcddde...',
  '....ebbcdde....',
  '.....ebcde.....',
  '......ede......',
  '.......e.......'];
const FIST = ['.cddd.', 'bcddde', 'bccdde', 'bbccde', '.bbcd.', '..bb..'];
/* THE SHROUD 36 wide (cols 0..35, the body's centre at col 18), 36 rows from y = -38: the cloak off the shoulders, wide and dark at the top, then breaking into strips that thin to threads and single wisps */
const SHROUD = [
  '....mnnnppppppppppppppppppnnm',
  '...mnnnnppppppppppppppppppnnm',
  '...mnnnppppppppppppppppppppnnm',
  '..mmnnnppppppppppppppppppppnnm',
  '..mnnnnpppppppppppppppppppppnnm',
  '.mmnnnnppppppppppppppppppppppnnm',
  '.mnnnnnpppppppppppppppppppppppnnm',
  'mmnnnnnpppppppppppppppppppppppnnnm',
  'mnnnnnnppppppppppppppppppppppppnnm',
  'mnnnnnppppppppppppppppppppppppnnnm',
  'mnnnnnppppppppppppppppppppppppnnnm',
  'mmnnnnppppppppppppppppppppppppnnm',
  'mmnnnnpppppppppppppppppppppppnnnm',
  '.mnnnnppppppppqqqqqpppppppppnnnnm',
  '.mnnnnpppppppqqqzzqqpppppppnnnnm',
  '.mnnnnppppppqqqzzzqqppppppnnnnm',
  '.mmnnnpppppqqqqzzqqqpppppnnnnm',
  '..mnnnppppqqqqqzqqqqppppnnnnmm',
  '..mnnnpppqqqqqqzqqqqpppnnnnm',
  '..mnnnppppppqqqqqqqqqqqqppppppnnnm',
  '..mnnnnppppppqqqqqzqqqqqqpppppppnnnm',
  '..mnnnppppppqqqqqzzqqqqqqppppppnnnm',
  '..mnnnpppppqqqqqzzzqqqqqqpppppnnnm',
  '..mnnpppp.qqqqqqzzqqqqqqq.pppnnnm',
  '..mnnppp..qqqqqqzzqqqqqq..pppnnm',
  '..mnnppp...qqqqqzqqqqqq...ppnnm',
  '..mnnpp....qqqqqqqqqqq....ppnn',
  '..mnnp.....pqqqqqqqqq.....ppn',
  '..mnn......pqqqqqqqq......pn',
  '..mn.......ppqqqqqq.......pn',
  '..mn........pqqqqq........p',
  '..m.........pqqqq.........',
  '..m..........pqqq',
  '..n...........qq',
  '..n............q'];
/* the dither a strip dissolves through: 0..1 rising down the tail */
const dissolve = (x, y, k, time) => ((x * 7 + y * 13 + Math.floor(time * 3) * 5) % 11) / 11 < k;
function stampShroud(g, x0, y0, time, lean, a, wide) {
  g.globalAlpha = a;
  for (let r = 0; r < SHROUD.length; r++) { const s = SHROUD[r], dep = Math.max(0, (r - 13) / 24), sw = Math.round(lean * (1 - r / 40) + Math.sin(time * 1.9 + r * 0.33) * (0.4 + dep * 4.2) - dep * dep * 3 * (wide ? 0.5 : 1));
    for (let c = 0; c < s.length; c++) { const ch = s[c]; if (ch === '.') continue; if (r > 24 && dissolve(c, r, (r - 24) / 12 * 0.55, time)) continue;
      let col = PM[ch]; g.fillStyle = col; g.fillRect(x0 + c + sw, y0 + r, 1, 1);
      if (r > 20 && dep > 0.45 && (c + r) % 4 === 0) { g.fillStyle = PM.z; g.fillRect(x0 + c + sw, y0 + r - 1, 1, 1); } } }
  g.globalAlpha = 1;
}
/* ---------- the mist he is made of: the SHROUD behind, a few flat floor wisps and thread-streaks drifting up and away ---------- */
function lowerMist(g, time, P, dbl) {
  const a = dbl ? 0.85 : 1, lean = Math.round(P.lean * 0.4), fc = P.fogcol || 0;
  stampShroud(g, -22 + lean, -38, time, lean * 0.4, a, fc > 1);
  for (let i = 0; i < 5; i++) { const u = (time * 0.55 + i * 0.21) % 1, wx = -4 + ((i * 11) % 15) - u * 9 * (i % 2 ? 1 : -1) + Math.sin(time * 2 + i) * 2, wy = -3 - u * 20;
    g.fillStyle = rgba(i % 2 ? FOG : [226, 238, 248], (0.55 - u * 0.5) * a); g.fillRect(R(wx), R(wy), 3 - (u > 0.5 ? 1 : 0), 1); g.fillRect(R(wx + 1), R(wy - 1), 2, 1); }
  for (let i = 0; i < 4; i++) { const ph = time * 0.9 + i * 1.6, mx = Math.sin(ph) * (8 + fc * 4) + (i - 1.5) * 7, mw = 5 + (i % 3) * 3 + fc * 2;
    g.fillStyle = rgba(FOG_D, (0.28 + 0.08 * fc) * a); g.fillRect(R(mx - mw / 2), -1, mw, 1); g.fillStyle = rgba(FOG, 0.3 * a); g.fillRect(R(mx - mw / 4 + 1), -2, mw / 2, 1); }
}
/* a few ragged licks of mist over the foot of the faulds, in FRONT, so the plate melts into the shroud */
function frontMist(g, time, P, dbl) {
  const a = dbl ? 0.8 : 1;
  for (let i = 0; i < 6; i++) { const ph = time * 1.2 + i * 1.7, mx = Math.sin(ph) * 7 + (i - 2.5) * 4 + P.lean * 0.3, my = -19 + (i % 3) * 2 + Math.sin(ph * 1.3) * 1.2; g.fillStyle = rgba(FOG, (0.55 - (i % 3) * 0.12) * a); g.fillRect(R(mx - 3), R(my), 4 + (i % 2) * 3, 1); g.fillRect(R(mx - 1), R(my + 1), 3, 1); }
}
function weed(g, x, y, len, time, ph = 0) { for (let i = 0; i < len; i++) px1(g, x + Math.sin(time * 1.6 + ph + i * 0.5) * (0.6 + i * 0.12), y + i, i % 3 === 2 ? PAL.weed2 : PAL.weed1); }
function barnacles(g, x, y, n, seed) { for (let i = 0; i < n; i++) { const bx = x + ((seed * 7 + i * 5) % 8), by = y + ((seed * 3 + i * 3) % 5); px1(g, bx, by, PAL.barn); px1(g, bx + 1, by, PAL.barn2); px1(g, bx, by + 1, '#4a504a'); } }
/* THE GREAT HELM at (cx, cy) = the eye slit's centre, with the pennon streaming back from the crown */
function helm(g, cx, cy, o) {
  const { glow = 1, dark = false, flash, time = 0 } = o, top = cy - 9, f = flash ? '#fff' : null, x0 = cx - 8;
  if (!f) { /* the pennon: a two-pixel ribbon of rust cloth out of the crown, rippling, forked at the end */
    for (let i = 0; i < 13; i++) { const wv = Math.sin(time * 3.4 - i * 0.7) * (0.6 + i * 0.16), x = x0 + 4 - i, y = top - 2 + Math.round(i * 0.18 + wv + (i > 6 ? (i - 6) * 0.35 : 0)); const cc = i % 4 === 0 ? PAL.rust2 : PAL.rust1; px1(g, x, y, cc); px1(g, x, y + 1, i % 3 === 1 ? PAL.rust2 : PAL.rust0); if (i > 3 && i < 10) px1(g, x, y + 2, PAL.rust0); if (i === 12) px1(g, x - 1, y + 2, PAL.rust0); }
    rc(g, x0 + 5, top - 2, 3, 2, PAL.iron3); px1(g, x0 + 6, top - 3, PAL.edge2); }
  stamp(g, HELM, x0, top, { f });
  if (!f) { px1(g, x0 + 11, top + 2, PAL.iron0); px1(g, x0 + 12, top + 3, PAL.iron0); px1(g, x0 + 12, top + 4, PAL.iron0); px1(g, x0 + 11, top + 5, PAL.iron0);   /* the crack */
    barnacles(g, x0 + 2, top + 12, 1, 1); }
  if (dark) { rc(g, x0 + 3, top + 9, 11, 1, f || '#34404a'); }
  else if (!f) { g.fillStyle = rgba([180, 226, 255], 0.3 * glow); g.beginPath(); g.arc(R(cx + 1), R(cy), 9, 0, Math.PI * 2); g.fill(); px1(g, cx - 1, cy, '#ffffff'); px1(g, cx, cy, '#ffffff'); px1(g, cx + 1, cy, '#ffffff'); }
}
/* the fog spilling out of the slit, streaming forward and up then back */
function slitFog(g, cx, cy, time, a = 1) { for (let i = 0; i < 6; i++) { const u = (time * 0.9 + i / 6) % 1; g.fillStyle = rgba(FOG, (0.55 - u * 0.5) * a); rc(g, cx + 7 + u * 12, cy - 1 - u * 6 + Math.sin(time * 5 + i) * 1.2, 2 + u * 2, 2); } }
/* a pauldron: (cx, cy) its centre; `back` = the far one in shadow */
function pauldron(g, cx, cy, rx, ry, f, back) { stamp(g, PAULD, cx - 8, cy - 4, { f, back }); if (!f && !back) { px1(g, cx - 5, cy + 1, PAL.rust2); } }
/* a limb as a plated arm (shoulder -> elbow -> hand): a three-tone round brush, a couter at the elbow; `th` thick (4 or 5) */
function limb(g, S, H, o) { const { f, sag = 4, th = 5 } = o, E = [(S[0] + H[0]) / 2, (S[1] + H[1]) / 2 + sag];
  for (const [a, b] of [[S, E], [E, H]]) { if (!f) line(g, a[0], a[1], b[0], b[1], PAL.iron0, th + 2); line(g, a[0], a[1], b[0], b[1], f || PAL.iron1, th); if (!f) { line(g, a[0], a[1] - 1, b[0], b[1] - 1, PAL.iron2, th - 2); line(g, a[0] + 1, a[1] - 1, b[0] + 1, b[1] - 1, PAL.iron3, 1); } }
  if (!f) { rc(g, E[0] - 3, E[1] - 3, 7, 7, PAL.iron0); rc(g, E[0] - 2, E[1] - 2, 5, 5, PAL.iron2); rc(g, E[0] - 2, E[1] - 2, 5, 1, PAL.edge); rc(g, E[0] - 2, E[1] + 2, 5, 1, PAL.iron0); px1(g, E[0] + 1, E[1], PAL.edge2); px1(g, E[0] - 1, E[1] + 1, PAL.rust2); } else rc(g, E[0] - 2, E[1] - 2, 5, 5, f); }
/* a gauntlet fist at (x, y) */
function fist(g, x, y, f) { stamp(g, FIST, x - 3, y - 3, { f }); }
/* THE SWORD (unchanged): a bastard blade from the guard H to the tip T - 3 px (shade, steel, lit edge), a fuller, crossguard and wheel pommel */
function swordFist(H, T) { const dx = T[0] - H[0], dy = T[1] - H[1], L = Math.hypot(dx, dy) || 1; return [H[0] - dx / L * 3, H[1] - dy / L * 3]; }
function sword(g, H, T, o) {
  const { f, glow = 0 } = o, dx = T[0] - H[0], dy = T[1] - H[1], L = Math.hypot(dx, dy) || 1, ux = dx / L, uy = dy / L, nx = -uy, ny = ux, n = R(L);
  for (let i = 0; i < n; i++) { const t = i / n, x = H[0] + dx * t, y = H[1] + dy * t, taper = t > 0.8;
    if (!taper) px1(g, x - nx, y - ny, f || '#4a5658'); px1(g, x, y, f || '#8a949a'); px1(g, x + nx * (taper ? 0 : 1), y + ny * (taper ? 0 : 1), f || '#d8e4e8'); if (i % 4 === 1 && t < 0.8) px1(g, x, y, f || '#5a666a'); }
  px1(g, T[0], T[1], f || '#f4fafc');
  line(g, H[0] + nx * 5, H[1] + ny * 5, H[0] - nx * 5, H[1] - ny * 5, f || PAL.iron0, 3); line(g, H[0] + nx * 5, H[1] + ny * 5, H[0] - nx * 5, H[1] - ny * 5, f || PAL.rust2, 1);
  rc(g, H[0] + nx * 5 - 1, H[1] + ny * 5 - 1, 3, 3, f || PAL.iron3); rc(g, H[0] - nx * 5 - 1, H[1] - ny * 5 - 1, 3, 3, f || PAL.iron3);
  for (let i = 1; i <= 4; i++) px1(g, H[0] - ux * i, H[1] - uy * i, f || PAL.iron2);
  rc(g, H[0] - ux * 6 - 2, H[1] - uy * 6 - 2, 4, 4, f || PAL.rust1); px1(g, H[0] - ux * 6, H[1] - uy * 6, f || PAL.edge2);
}
/* the blade's glow and the mist trailing off it (semi-transparent: an FX layer) */
function swordFx(g, H, T, time, trail, glow) {
  const dx = T[0] - H[0], dy = T[1] - H[1];
  if (glow) { g.fillStyle = rgba([190, 230, 255], 0.22 * glow); g.beginPath(); g.arc(R(T[0]), R(T[1]), 6, 0, Math.PI * 2); g.fill(); }
  for (let i = 0; i < trail * 6; i++) { const u = (time * 2 + i / 6) % 1, t = 0.35 + 0.65 * ((i * 0.37) % 1); g.fillStyle = rgba(FOG, 0.5 * (1 - u) * Math.min(1, trail)); rc(g, H[0] + dx * t - Math.sign(dx || 1) * u * 12, H[1] + dy * t - u * 2 + Math.sin(time * 9 + i) * 1.5, 3, 2); }
}
/* THE SHIELD: the authored heater, centre (x, y) (the height argument only picks it small or large: the small ones are drawn clipped to the 17 rows nearest the point) */
function shield(g, x, y, h, o) {
  const f = o.flash ? '#fff' : null; stamp(g, SHIELD, x - 7, y - 10, { f });
  if (f) return;
  px1(g, x + 5, y - 9, '#06080a'); px1(g, x + 6, y - 8, rgba(FOG, 0.9)); px1(g, x + 6, y - 9, '#06080a');
  barnacles(g, x - 6, y - 7, 2, 3); weed(g, x - 3, y + 5, 4, o.time || 0, 1);
}
/* THE PLATE: the authored breastplate + faulds, sheared by the lean; the ridge, a rust bloom and the fog-lit seam are laid over it; `sag` for the empty armour */
function torso(g, lx, o) {
  const f = o.flash ? '#fff' : null, sag = o.sag || 0, time = o.time || 0, cx = R(lx * 0.5), y0 = -45 + sag;
  stamp(g, TORSO, cx - 12, y0, { f, shear: r => lx * (1 - r / 26) * 0.3 });
  if (f) return;
  const sh = r => R(lx * (1 - r / 26) * 0.3);
  for (let r = 3; r < 10; r++) { px1(g, cx + sh(r), y0 + r, PAL.edge2); px1(g, cx + sh(r) - 1, y0 + r, PAL.iron3); }   /* the ridge */
  for (let r = 11; r < 16; r++) { px1(g, cx + sh(r), y0 + r, PAL.edge); }
  px1(g, cx - 7 + sh(5), y0 + 5, PAL.rust1); px1(g, cx - 6 + sh(5), y0 + 6, PAL.rust2); px1(g, cx - 8 + sh(6), y0 + 6, PAL.rust0); px1(g, cx - 5 + sh(12), y0 + 12, PAL.rust1);
  g.fillStyle = rgba(FOG, 0.75 + 0.2 * Math.sin(time * 2)); g.fillRect(cx + 4 + sh(5), y0 + 4, 4, 1); g.fillRect(cx + 5 + sh(6), y0 + 5, 3, 1); px1(g, cx + 5 + sh(5), y0 + 3, '#04060a'); px1(g, cx + 8 + sh(5), y0 + 5, '#04060a');   /* the fog showing through a split in the plate */
  px1(g, cx + 6 + sh(5), y0 + 4, '#fff');
  weed(g, cx - 7, y0 + 19, 6, time, 0); barnacles(g, cx - 9, y0 + 3, 2, 2);
}


/* ---------- THE POSES: sword hand (the GUARD) / tip, shield, head, lean, crouch - by mode and stance (right-facing; y up negative) ---------- */
function pose(mode, stance, p, time) {
  const bob = Math.sin(time * 2) * 0.8;
  const D = { lean: 0, crouch: 0, head: [0, 0], hand: [-13, -26], tip: [-19, -3], shield: [13, -34, 22], two: false, front: false, trail: 0, glow: 0, arch: 0, fogcol: 0, wrap: false, dark: false, kneel: 0, flex: 0, shieldHide: false, armF: null };
  switch (mode) {
    case 'sleep': return { ...D, lean: 2, crouch: 6, kneel: 1, head: [3, 5], hand: [4, -22], tip: [4, 2], two: true, shieldHide: true, dark: true, glow: 0 };
    case 'wake': return { ...D, lean: 1 - p * 2, crouch: 6 * (1 - p), kneel: p < 0.7 ? 1 : 0, head: [3 * (1 - p), 5 * (1 - p)], hand: [4, -22], tip: [4, 2], two: true, shieldHide: p < 0.4, dark: p < 0.6 };
    case 'cutTell': return { ...D, lean: -3 - p * 2, hand: [-10, -52 + p * -2], tip: [-24 + p * -4, -66 + p * 2], shield: [12, -28, 22], glow: p, trail: 0.2 };
    case 'cut': return { ...D, lean: 5, hand: [12, -38], tip: [50, -30], shield: [5, -24, 22], trail: 1, glow: 0.6, flex: 1 };
    case 'cutRec': return { ...D, lean: 5, crouch: 2, head: [3, 3], hand: [14, -22], tip: [36, -4], shield: [0, -22, 22], flex: 1 };
    case 'stepTell': return { ...D, lean: -4, hand: [-10, -52], tip: [-26, -64], shield: [12, -28, 22], glow: 0.8, trail: 0.7 };
    case 'stepCut': return { ...D, lean: 5, hand: [12, -38], tip: [50, -30], shield: [5, -24, 22], trail: 1.3, glow: 0.9, flex: 1 };
    case 'lungeTell': return { ...D, lean: -5 - p * 2, crouch: 6 + p * 2, head: [2, 3], hand: [0, -26], tip: [40, -30], shield: [-4, -24, 22], front: true, trail: 0.4, glow: 0.7, fogcol: 1 };
    case 'lunge': return { ...D, lean: 9, crouch: 8, head: [4, 5], hand: [12, -30], tip: [54, -30], shield: [-12, -30, 18], trail: 1.6, glow: 1, flex: 1, fogcol: 2 };
    case 'lungeRec': return { ...D, lean: 8, crouch: 5, head: [4, 6], hand: [16, -26], tip: [46, -14], shield: [-10, -26, 18], flex: 1 };
    case 'lashTell': return { ...D, lean: -1, shield: [6, -52, 18], armF: [10, -58], glow: 0.3 };
    case 'lash': return { ...D, lean: 4, shield: [10, -40, 18], armF: [26, -40], flex: 1 };
    case 'lashRec': return { ...D, lean: 3, crouch: 2, head: [2, 3], shield: [16, -26, 18], armF: [22, -26] };
    case 'surgeTell': return { ...D, lean: -4 - p * 2, arch: 1, hand: [4, -58], tip: [14, -86], two: true, shieldHide: true, glow: p, trail: 0.2 };
    case 'surge': return { ...D, lean: 6, crouch: 6, head: [3, 4], hand: [8, -26], tip: [26, 2], two: true, shieldHide: true, trail: 1, glow: 1, flex: 1 };
    case 'surgeRec': return { ...D, lean: 4, crouch: 7, kneel: 1, head: [3, 6], hand: [10, -22], tip: [24, 2], two: true, shieldHide: true };
    case 'spearTell': return { ...D, lean: 2, crouch: 8, kneel: 1, head: [3, 6], hand: [8, -24], tip: [14, 3], two: true, shieldHide: true, fogcol: 1, glow: p };
    case 'spears': return { ...D, lean: -3, crouch: 2, hand: [6, -40], tip: [22, -68], two: true, shieldHide: true, glow: 1, trail: 1, flex: 1 };
    case 'spearRec': return { ...D, lean: 2, crouch: 3, head: [2, 3], hand: [8, -28], tip: [24, -8], shield: [6, -26, 18], flex: 1 };
    case 'sinkTell': return { ...D, lean: 0, crouch: 4 + p * 6, head: [0, 3], shield: [13, -30, 22], fogcol: 2 };
    case 'plunge': return { ...D, lean: 0, crouch: 0, head: [1, 6], hand: [1, -22], tip: [1, 4], two: true, shieldHide: true, plungeBody: true, trail: 1.2 };
    case 'plungeRec': return { ...D, lean: 4, crouch: 9, kneel: 1, head: [4, 8], hand: [6, -20], tip: [6, 6], two: true, shieldHide: true, fogcol: 2, stuck: true };
    case 'shroudTell': return { ...D, lean: 0, shield: [13, -34, 22], fogcol: 2, wrap: true, spread: 1, glow: 0.7 };
    case 'doubleTell': return { ...D, lean: -1, hand: [12, -42], tip: [12, -80], shield: [-2, -32, 18], glow: 1, fogcol: 1, salute: true };
    case 'empty': return { ...D, lean: 3, crouch: 2, head: [4, 6], hand: [-6, -20], tip: [-9, 3], shield: [13, -16, 22], dark: true, sag: 5, hollow: true, fogcol: 2 };
    case 'reel': return { ...D, lean: -6, crouch: 0, head: [-3, 0], hand: [-16, -34], tip: [-34, -22], shield: [13, -24, 22], flex: 1, fogcol: 1 };
    default: break;
  }
  /* guard (walk / recover / stanceTell / dissolve / reform): the three stances */
  if (stance === 'high') return { ...D, lean: 1, head: [1, 0], hand: [-14, -24 + bob * 0.3], tip: [-22, -2], shield: [18, -38, 24], glow: 0.4 };
  if (stance === 'low') return { ...D, lean: 2, crouch: 2, head: [2, 2], hand: [11, -26], tip: [12, 4], two: true, shield: [-5, -24, 22], fogcol: 2, glow: 0.4 };
  return { ...D, lean: 0, hand: [-13, -30], tip: [-28, -50], shield: [9, -32, 26], wrap: true, glow: 0.5, fogcol: 1 };   /* full */
}

/* ---------- THE KNIGHT: three layers ---------- */
function geo(o, time) {
  const { stance = 'high', mode = 'walk', sag = 0, p = 0 } = o, P = pose(mode, stance, p, time);
  const bob = (mode === 'walk' || mode === 'recover' || mode === 'stanceTell') ? Math.round(Math.sin(time * 2.2) * 1) : 0, sw = (P.sag || 0) + sag, lx = P.lean;
  return { P, bob, cr: P.crouch, lx, sw, hx: 1 + lx + P.head[0], hy: -52 + P.head[1] + sw, mode };
}
/* layer 1 (behind): the mist column + the wrap of fog */
function drawBack(g, G, o, time) {
  const { P } = G; if (!P.plungeBody) { g.save(); g.translate(0, G.cr * 0.6); lowerMist(g, time, P, o.double); g.restore(); }
  if (P.wrap) { for (let i = 0; i < 14; i++) { const a = time * 1.5 + i * 0.9, rr = 17 + (i % 3) * 2, yy = -26 + G.bob + Math.sin(a) * 24; g.fillStyle = rgba(i % 2 ? [226, 236, 244] : FOG, 0.5); g.fillRect(R(Math.cos(a) * rr), R(yy), 4 - (i % 2), 1); g.fillRect(R(Math.cos(a) * rr) + 1, R(yy) + 1, 2, 1); } }
}
/* layer 2: the plate (opaque; outlined afterwards) on a canvas whose origin is his feet */
function drawBody(g, G, o, time) {
  const { P, lx, sw } = G, fl = o.flash ? '#fff' : null, mode = G.mode;
  g.save(); g.translate(0, G.cr + G.bob);
  if (P.plungeBody) {   /* THE PLUNGE: falling point-down, head bowed between the shoulders, both fists stacked on the grip, the arms straight down from the pauldrons */
    const H = [1, -24], T = [1, 5];
    sword(g, H, T, { f: fl, time, glow: 1 });
    torso(g, 0, { flash: o.flash, sag: 3, time }); pauldron(g, -13, -38, 6, 5, fl, true); pauldron(g, 13, -38, 7, 6, fl, false);
    limb(g, [-12, -35], [-1, -22], { f: fl, sag: 2 }); limb(g, [12, -35], [3, -28], { f: fl, sag: 2 }); fist(g, 0, -20, fl); fist(g, 1, -26, fl);
    const hx = 1, hy = -46 + P.head[1]; helm(g, hx, hy, { glow: 1, flash: o.flash, time });
    g.restore(); return; }
  const sh = P.shield, front = P.flex || P.two || P.salute || P.stuck || P.front, cx = R(lx * 0.5);
  const rearS = [cx - 10, -40 + sw], frontS = [cx + 10, -40 + sw];
  /* the back arm: the shield's partner, or the sword hand in the guards */
  const fistAt = P.armF ? null : swordFist(P.hand, P.tip);
  if (!front && !P.armF) limb(g, rearS, fistAt, { f: fl, sag: 3 });
  if (!front && !P.armF) { sword(g, P.hand, P.tip, { f: fl, time, glow: P.glow }); fist(g, fistAt[0], fistAt[1], fl); }
  if (P.armF) { sword(g, P.hand, P.tip, { f: fl, time, glow: P.glow }); const fa = swordFist(P.hand, P.tip); limb(g, rearS, fa, { f: fl, sag: 3 }); fist(g, fa[0], fa[1], fl); }
  pauldron(g, cx - 13, -42 + sw, 6, 5, fl, true);
  torso(g, lx, { flash: o.flash, sag: sw, time });
  pauldron(g, cx + 13, -42 + sw, 7, 6, fl, false);
  /* the helm: set on a gorget; tilted forward when the plate is empty or hurt, bowed in a recovery */
  const hx = G.hx, hy = G.hy;
  rc(g, hx - 6, hy + 10, 13, 4, fl || PAL.iron2); rc(g, hx - 6, hy + 10, 13, 1, fl || PAL.edge);
  helm(g, hx, hy + 2, { tilt: P.head[0], glow: P.dark ? 0 : (o.visor === undefined ? 1 : o.visor), dark: P.dark || (o.visor !== undefined && o.visor < 0.5), flash: o.flash, time });
  if (front && !P.shieldHide && !P.armF) { limb(g, rearS, [sh[0] - 4, sh[1] + 2], { f: fl, sag: 3, th: 4 }); shield(g, sh[0], sh[1], sh[2], { flash: o.flash, time }); }
  if (front) {
    if (P.two) { const fa = swordFist(P.hand, P.tip); limb(g, [cx - 4, -40 + sw], [fa[0] - 2, fa[1] - 4], { f: fl, sag: 3 }); sword(g, P.hand, P.tip, { f: fl, time, glow: P.glow }); limb(g, frontS, fa, { f: fl, sag: 3 }); fist(g, fa[0] - 2, fa[1] - 4, fl); fist(g, fa[0], fa[1], fl); }
    else { const fa = swordFist(P.hand, P.tip); sword(g, P.hand, P.tip, { f: fl, time, glow: P.glow }); limb(g, frontS, fa, { f: fl, sag: P.flex ? 1 : 3 }); fist(g, fa[0], fa[1], fl); } }
  if (!P.shieldHide && !front) { if (!P.armF) { limb(g, frontS, [sh[0] - 4, sh[1] + 2], { f: fl, sag: 3, th: 4 }); shield(g, sh[0], sh[1], sh[2], { flash: o.flash, time }); } else { limb(g, frontS, P.armF, { f: fl, sag: P.flex ? 1 : 3 }); fist(g, P.armF[0], P.armF[1], fl); } }
  g.restore();
}
/* layer 3 (in front): the semi-transparent effects */
function drawFx(g, G, o, time) {
  const { P, mode } = G, flash = o.flash; g.save();
  if (!flash) frontMist(g, time, P, o.double);
  g.translate(0, G.cr + G.bob);
  if (flash) { g.restore(); return; }
  const visor = o.visor === undefined ? 1 : o.visor;
  if (P.plungeBody) { for (let i = 0; i < 10; i++) { const u = (time * 2.4 + i / 10) % 1; g.fillStyle = rgba(FOG, 0.55 * (1 - u)); rc(g, -12 + i * 2.6, -50 - u * 30, 2, 4 + u * 6); }
    for (let i = 0; i < 2; i++) for (let k = 0; k < 6; k++) { g.fillStyle = rgba([226, 238, 248], 0.55 - k * 0.08); rc(g, i ? 14 : -15, -42 - k * 7, 1, 5); }   /* the wind streaks */
    swordFx(g, [1, -24], [1, 5], time, 1.2, 1); g.restore(); return; }
  if (!P.dark && visor >= 0.5) slitFog(g, G.hx, G.hy + 2, time, 1);
  swordFx(g, P.hand, P.tip, time, P.trail, P.glow);
  if (P.stuck) { for (let i = 0; i < 5; i++) { const cx0 = P.tip[0] + (i - 2) * 5; line(g, cx0, 0, cx0 + (i % 2 ? 3 : -3), 2 + (i % 3), '#06080a'); } for (let i = 0; i < 6; i++) { const u = (time * 1.5 + i / 6) % 1; g.fillStyle = rgba(FOG, 0.6 * (1 - u)); rc(g, P.tip[0] - 5 + i * 2, -u * 14, 2, 2); } }
  if (P.hollow) { g.fillStyle = rgba(FOG, 0.55 + 0.2 * Math.sin(time * 3)); rc(g, G.hx + 3, G.hy + 5, 2, 8); for (let i = 0; i < 8; i++) { const u = (time * 0.8 + i / 8) % 1; g.fillStyle = rgba(FOG, 0.55 * (1 - u)); rc(g, -9 + i * 2.5 + G.lx * 0.5, -32 + G.sw - u * 14, 2, 2); }
    for (const [jx, jy] of [[G.hx - 5, G.hy + 12], [G.lx * 0.5 + 10, -28 + G.sw], [G.lx * 0.5 - 11, -28 + G.sw], [0, -20]]) for (let i = 0; i < 3; i++) { const u = (time * 1.2 + i / 3 + jx * 0.1) % 1; g.fillStyle = rgba(FOG, 0.55 * (1 - u)); rc(g, jx + i - 1, jy - u * 7, 2, 2); } }
  /* THE TOWROPE in the windup: whirled over the helm - its loops and the hook orbiting (the throw is drawn by drawChain) */
  if (mode === 'lashTell') { const a = time * 16 + G.P.armF[0] * 0 + (o.p || 0) * 10, hx0 = P.armF[0], hy0 = P.armF[1]; for (let i = 1; i <= 7; i++) { const t = i / 7, ang = a - t * 1.6, qx = hx0 + Math.cos(ang) * 16 * t, qy = hy0 + Math.sin(ang) * 7 * t; rc(g, qx - 1, qy - 1, 2, 2, i % 2 ? '#8a7a64' : '#5a4638'); }
    drawHook(g, hx0 + Math.cos(a - 1.6) * 16, hy0 + Math.sin(a - 1.6) * 7, a); }
  if (mode === 'cut' || mode === 'stepCut') for (let i = 0; i < 11; i++) { const a = -2.2 + i * 0.3; g.fillStyle = rgba(FOG, 0.6 - i * 0.04); rc(g, 12 + Math.cos(a) * 36, -36 + Math.sin(a) * 28, 4, 2); }
  if (mode === 'lunge') for (let i = 0; i < 9; i++) { g.fillStyle = rgba(FOG, 0.5 - i * 0.05); rc(g, -14 - i * 7, -34 + Math.sin(time * 14 + i) * 3 + (i % 3) * 3, 8, 2); }
  if (mode === 'surge') { g.fillStyle = rgba([210, 236, 246], 0.7); for (let i = 0; i < 8; i++) { const a = (i / 8) * Math.PI; rc(g, 26 + Math.cos(a) * 11, -Math.sin(a) * 7 - 1, 2, 2); } g.fillStyle = rgba([210, 236, 246], 0.4); g.beginPath(); g.ellipse(26, 0, 14, 3, 0, 0, Math.PI * 2); g.fill(); }
  if (mode === 'reel') for (let i = 0; i < 10; i++) { const a = i * 0.63 + time * 5; g.fillStyle = rgba(FOG, 0.6); rc(g, Math.cos(a) * 18, -32 + Math.sin(a) * 15, 2, 2); }
  if (mode === 'doubleTell') for (let i = 0; i < 12; i++) { const u = (time * 1.4 + i / 12) % 1; g.fillStyle = rgba(FOG, 0.5 * (1 - u)); rc(g, -18 - u * 12, -50 + (i * 5) % 40, 3, 2); }
  if (mode === 'shroudTell') for (let i = 0; i < 10; i++) { const u = (time * 1.1 + i / 10) % 1; g.fillStyle = rgba(FOG, 0.55 * (1 - u)); rc(g, -14 + (i * 7) % 28, -4 - u * 52, 3, 4); }
  g.restore();
}
/* the figure on scratch canvases: B = the plate, O = the plate with its outline; S = the composed picture for the effects that eat or wash it */
let SB = null, SO = null, SS = null; const CW = 132, CH = 124, OX = 66, OY = 104;
function scratch() { if (SB || typeof document === 'undefined') return !!SB; for (const k of ['SB', 'SO', 'SS']) { const c = document.createElement('canvas'); c.width = CW; c.height = CH; if (k === 'SB') SB = c; else if (k === 'SO') SO = c; else SS = c; } return true; }
function bakeBody(G, o, time) {
  const b = SB.getContext('2d'); b.imageSmoothingEnabled = false; b.setTransform(1, 0, 0, 1, 0, 0); b.globalCompositeOperation = 'source-over'; b.globalAlpha = 1; b.clearRect(0, 0, CW, CH);
  b.save(); b.translate(OX, OY); drawBody(b, G, o, time); b.restore();
  const s = SO.getContext('2d'); s.imageSmoothingEnabled = false; s.setTransform(1, 0, 0, 1, 0, 0); s.globalCompositeOperation = 'source-over'; s.globalAlpha = 1; s.clearRect(0, 0, CW, CH);
  if (!o.flash) { for (const [dx, dy] of [[-1, 0], [1, 0], [0, -1], [0, 1]]) s.drawImage(SB, dx, dy); s.globalCompositeOperation = 'source-in'; s.fillStyle = '#05070a'; s.fillRect(0, 0, CW, CH); s.globalCompositeOperation = 'source-over'; }
  s.drawImage(SB, 0, 0);
}
/* THE KNIGHT: mist behind, outlined plate, effects in front. sinkTell (melts him from the feet up) and the MIST DOUBLE (a pale wash over the whole figure - only the shape and the cold) are done on the composed scratch picture. */
export function drawKnight(g, x, y, f, o, time) {
  const G = geo(o, time), needs = o.mode === 'sinkTell' || o.double, a = o.alpha === undefined ? 1 : o.alpha;
  if (!scratch()) return;
  bakeBody(G, o, time);
  const place = (c, tx, ty) => { g.drawImage(c, tx, ty); };
  if (!needs) {
    g.save(); g.globalAlpha = a; g.translate(R(x), R(y)); if (f < 0) g.scale(-1, 1);
    drawBack(g, G, o, time); g.drawImage(SO, -OX, -OY); drawFx(g, G, o, time); g.restore(); return; }
  const s = SS.getContext('2d'); s.imageSmoothingEnabled = false; s.setTransform(1, 0, 0, 1, 0, 0); s.globalCompositeOperation = 'source-over'; s.globalAlpha = 1; s.clearRect(0, 0, CW, CH);
  s.save(); s.translate(OX, OY); drawBack(s, G, o, time); s.drawImage(SO, -OX, -OY); drawFx(s, G, o, time); s.restore();
  if (o.mode === 'sinkTell') { s.globalCompositeOperation = 'destination-out'; const p = o.p || 0; for (let r = 0; r < 60 * p; r += 2) { s.fillStyle = 'rgba(0,0,0,' + Math.max(0.1, 1 - r / 90).toFixed(2) + ')'; s.fillRect(0, OY + 6 - r, CW, 2); } s.globalCompositeOperation = 'source-over'; }
  if (o.double) { s.globalCompositeOperation = 'source-atop'; s.fillStyle = 'rgba(190,206,218,0.8)'; s.fillRect(0, 0, CW, CH); s.globalCompositeOperation = 'source-over'; for (let i = 0; i < 6; i++) { const u = (time * 1.2 + i / 6) % 1; s.fillStyle = rgba(FOG, 0.5 * (1 - u)); s.fillRect(R(56 + i * 4), R(48 + u * -10), 2, 2); } }
  g.save(); g.globalAlpha = a; g.translate(R(x), R(y)); if (f < 0) g.scale(-1, 1); g.drawImage(SS, -OX, -OY); g.restore();
}


/* THE HOOK: a barbed iron grapple; (x, y) the shank's head, ang the way it points */
export function drawHook(g, x, y, ang = 0, o = {}) {
  g.save(); g.translate(R(x), R(y)); g.rotate(ang);
  rc(g, -3, -1, 6, 2, PAL.iron2); rc(g, -3, -1, 6, 1, PAL.edge2); rc(g, 3, -2, 2, 4, PAL.rust1);   /* the shank and its ring */
  for (const s of [-1, 1]) { rc(g, 4, s * 3 - 1, 4, 2, PAL.iron1); rc(g, 7, s * 5 - (s > 0 ? 0 : 1), 2, 3, PAL.iron2); px1(g, 8, s * 6, '#d8e4e8'); }   /* two barbed flukes */
  rc(g, -5, -2, 2, 4, PAL.iron1); g.restore();
}
/* THE TOWROPE'S CHAIN: rusted links from his hand to its hook, hung with weed, the hook at the end */
export function drawChain(g, hx, hy, lx, ly, time, hooked) {
  const dx = lx - hx, dy = ly - hy, L = Math.hypot(dx, dy), n = Math.max(3, R(L / 4)), sag = hooked ? 0 : Math.min(8, L * 0.05);
  for (let i = 0; i < n; i++) { const t = i / n, x = hx + dx * t, y = hy + dy * t + Math.sin(t * Math.PI) * sag; g.fillStyle = i % 2 ? '#3a2a20' : '#6a5440'; g.fillRect(R(x) - 1, R(y) - 1, 3, 2); if (i % 2 === 0) { g.fillStyle = '#9a8468'; g.fillRect(R(x), R(y) - 1, 1, 1); } }
  if (L > 30) weed(g, hx + dx * 0.5, hy + dy * 0.5 + 2, 4, time, 3);
  drawHook(g, lx, ly, Math.atan2(dy, dx));
}
/* THE WALL OF WATER (the lock surge): a green-black wave with a white crest and a foam head, the canal in it, running up the towpath from the gate (x: its front, w: its length behind, h: its depth) */
export function drawWave(g, x, floorY, w, h, time) {
  g.fillStyle = 'rgba(30,76,92,0.9)'; g.fillRect(R(x - 10), R(floorY - h), R(w + 10), R(h));
  g.fillStyle = 'rgba(54,118,132,0.7)'; for (let i = 0; i < 5; i++) g.fillRect(R(x - 6 + i * (w / 5)), R(floorY - h + 6 + (i % 3) * 5 + Math.sin(time * 8 + i) * 2), R(w / 6), 3);
  g.fillStyle = 'rgba(8,24,32,0.5)'; g.fillRect(R(x - 10), R(floorY - 5), R(w + 10), 5);
  /* the crest: it curls over at the front */
  for (let i = 0; i < 12; i++) { const yy = floorY - h - 4 + i * (h / 11), curl = Math.sin((i / 11) * Math.PI) * 6; g.fillStyle = 'rgba(226,244,250,' + (0.95 - i * 0.04).toFixed(2) + ')'; g.fillRect(R(x - 12 - curl), R(yy), R(7 + curl * 0.4), 3); }
  g.fillStyle = 'rgba(240,252,255,0.95)'; g.fillRect(R(x - 12), R(floorY - h - 5), 18, 3); for (let i = 0; i < 8; i++) { g.fillStyle = 'rgba(232,248,252,0.85)'; g.fillRect(R(x - 18 - i * 3), R(floorY - h + Math.sin(time * 18 + i * 1.7) * 5 + i * 4), 3, 3); }   /* spray */
  for (let i = 0; i < 6; i++) { g.fillStyle = 'rgba(210,236,244,0.55)'; g.fillRect(R(x - 4 + i * 9), R(floorY - 2 - (i % 2) * 2), 7, 2); }   /* foam along the floor */
}
/* THE GATE'S CREST GAUGE in the surge's windup: the old tide-staff on the gate, a white crest climbing it (k 0..1) and a red !! */
export function drawGateCrest(g, gx, floorY, k, time, h = 70) {
  rc(g, gx - 5, floorY - h - 2, 10, h + 2, 'rgba(8,14,18,0.7)'); for (let i = 0; i < h; i += 8) rc(g, gx - 5, floorY - i - 1, i % 16 ? 4 : 7, 1, '#b8c8c8');   /* the tide staff's marks */
  g.fillStyle = 'rgba(200,232,244,0.85)'; g.fillRect(R(gx - 4), R(floorY - h * k), 8, R(h * k)); g.fillStyle = 'rgba(240,252,255,0.95)'; g.fillRect(R(gx - 5), R(floorY - h * k - 2), 10, 3);
  for (let i = 0; i < 6; i++) { const u = (time * 3 + i / 6) % 1; g.fillStyle = 'rgba(226,244,250,' + (0.7 * (1 - u)).toFixed(2) + ')'; g.fillRect(R(gx - 6 + i * 2.4), R(floorY - h * k - 3 - u * 8), 2, 2); }
}
/* A FOG LANCE (the spears): a spar of hard mist torn up out of the canal with a pale head and a frost rim; h its height (rising: 0..full) */
export function drawLance(g, x, floorY, h, time) {
  const w = 6; g.fillStyle = 'rgba(176,196,208,0.8)'; g.fillRect(R(x - w / 2), R(floorY - h), w, R(h)); g.fillStyle = 'rgba(232,244,250,0.95)'; g.fillRect(R(x - w / 2), R(floorY - h), 2, R(h)); g.fillStyle = 'rgba(96,120,136,0.8)'; g.fillRect(R(x + w / 2 - 2), R(floorY - h), 2, R(h));
  g.fillStyle = '#ffffff'; for (let i = 0; i < 3; i++) g.fillRect(R(x - 3 + i), R(floorY - h - 4 + i * 1.5), 6 - i * 2, 2); g.fillRect(R(x - 1), R(floorY - h - 7), 2, 3);   /* the head */
  for (let i = 0; i < 4; i++) { g.fillStyle = 'rgba(214,230,238,0.6)'; g.fillRect(R(x - 8 + i * 5 + Math.sin(time * 14 + i) * 1), R(floorY - 2 - ((time * 40 + i * 9) % Math.max(4, h))), 2, 3); }
  g.fillStyle = 'rgba(210,232,240,0.6)'; g.beginPath(); g.ellipse(R(x), R(floorY - 1), 9, 3, 0, 0, Math.PI * 2); g.fill();
}
/* THE TOLD SPOT where a lance will rise: a ring of ripples and fog threads in the canal, bright in a light (lt 0..1) */
export function drawSpearSpot(g, x, floorY, lt, time) {
  const a = Math.min(0.95, 0.24 + lt * 1.2), warm = lt > 0.15; g.globalAlpha = a;
  g.strokeStyle = warm ? '#ffd36b' : '#c8d8e8'; for (let i = 0; i < 2; i++) { const rr = 5 + i * 4 + ((time * 6) % 4); g.globalAlpha = a * (1 - i * 0.4); g.beginPath(); g.ellipse(R(x) + 0.5, R(floorY - 1) + 0.5, rr, rr * 0.3, 0, 0, Math.PI * 2); g.stroke(); }
  g.globalAlpha = a; g.fillStyle = warm ? '#ffe9a0' : '#dce8f0'; for (let i = 0; i < 3; i++) g.fillRect(R(x - 3 + i * 3), R(floorY - 7 - ((time * 12 + i * 4) % 5)), 1, 4); g.fillRect(R(x - 1), R(floorY - 3), 2, 2); g.globalAlpha = 1;
}
/* THE PLUNGE'S SHADOW and the glow of him above it (k 0..1 over the told beat) */
export function drawPlungeShadow(g, sx, floorY, k, time) {
  g.globalAlpha = 0.35 + 0.45 * k; g.fillStyle = '#04070b'; g.beginPath(); g.ellipse(R(sx), R(floorY - 1), 7 + 18 * k, 2 + 2 * k, 0, 0, Math.PI * 2); g.fill();
  g.globalAlpha = 0.5 * k; g.strokeStyle = '#cfe8ff'; g.beginPath(); g.ellipse(R(sx) + 0.5, R(floorY - 1) + 0.5, 12 + 14 * (1 - k), 3, 0, 0, Math.PI * 2); g.stroke();   /* the closing ring */
  const gy = floorY - 110 + 40 * k; g.globalAlpha = 0.25 + 0.5 * k; g.fillStyle = '#cfe8ff'; g.beginPath(); g.arc(R(sx), R(gy), 7 + 3 * k, 0, Math.PI * 2); g.fill(); g.globalAlpha = 0.3 * k; g.fillStyle = '#ffffff'; g.fillRect(R(sx - 1), R(gy), 2, R(floorY - gy)); g.globalAlpha = 1;
}
/* THE DEATH: the plate collapses where it stands and lies in a heap - helm rolled aside, the cuirass split, a pauldron, the sword across it - and the fog goes off over the water (u 0..1 over ~1.6 s, then the heap stays) */
export function drawDeadPlate(g, x, y, f, u, time) {
  g.save(); g.translate(R(x), R(y)); if (f < 0) g.scale(-1, 1);
  const k = Math.min(1, u), fall = k * k;
  /* the heap: iron on the stones */
  rc(g, -17, -3, 34, 3, '#0a0808');
  const piece = (px, py, w, h, c, hi) => { rc(g, px, py, w, h, c); rc(g, px, py, w, 1, hi || PAL.edge); rc(g, px, py + h - 1, w, 1, PAL.iron0); };
  piece(-15, -9 * fall, 12, 9, PAL.iron1); piece(-3 + 4 * (1 - fall), -8 * fall - 1, 14, 8, PAL.iron2); rc(g, 1, -9 * fall + 2, 8, 2, PAL.rust1);   /* the cuirass, split */
  piece(8 + 3 * (1 - fall), -5 * fall, 8, 5, PAL.iron1); piece(-17, -4 * fall, 6, 4, PAL.iron2);   /* a pauldron and a tasset */
  barnacles(g, -11, -9 * fall + 2, 4, 3); weed(g, -6, -3, 4, time, 1);
  /* the helm: it falls from the shoulders and rolls to rest on its side, the slit dark */
  const hx = 12 + 6 * fall, hy = -34 * (1 - fall) - 3 * fall;
  g.save(); g.translate(hx, hy - 6); g.rotate(fall * 1.5); rc(g, -6, -6, 12, 12, PAL.iron1); rc(g, -6, -6, 12, 1, PAL.edge); rc(g, -6, -6, 1, 12, PAL.iron0); rc(g, -5, -1, 10, 2, '#04060a'); line(g, 1, -6, 0, -1, '#06080a'); px1(g, 3, 3, PAL.rust2); g.restore();
  /* the sword lies across the heap, point to the water */
  line(g, -22, -2, 20 + 6 * fall, -4 * fall - 1, '#7a8a90', 2); line(g, -22, -3, 20, -4 * fall - 2, '#c8d4d8'); rc(g, -24, -5, 3, 5, PAL.rust1);
  /* the fog going off over the water: pale streams lifting and leaning away, thinning with time */
  const n = 14; for (let i = 0; i < n; i++) { const v = (time * 0.5 + i / n) % 1, a = (0.6 * (1 - v)) * (0.45 + 0.55 * (1 - k * 0.5)); g.fillStyle = rgba(FOG, a); rc(g, -10 + v * 60 + Math.sin(i * 3.1) * 4, -6 - v * 20 - (i % 4) * 4 + Math.sin(time * 2 + i) * 1.5, 4 + v * 5, 2 + (i % 2)); }
  g.restore();
}
