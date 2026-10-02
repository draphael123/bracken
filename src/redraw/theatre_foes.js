// theatre_foes.js - THE MASKWRIGHT'S THEATRE's CAST, drawn (claude/theatreart). Made from px.js primitives in the contract the game's other foes keep: every frame
// faces RIGHT (L is the flip), every frame of a set shares one canvas, ax = the body's centre column, ay = the row under the lowest pixel, w/h = the hit box.
//   bakeStagehand()  THE STAGEHAND   a crew brute: rolled sleeves, a leather apron, a red neckerchief, a flat cap, a sandbag on a line. 40x40, ax 18, ay 39
//                    0 stand | 1,2 walk | 3 SWING TELL (the sack hauled up over both shoulders) | 4 swing (the sack down in front) | 5 hurt | 6 DROP TELL (both hands on the line overhead)
//   bakeUsher()      THE USHER        a player in the house's oxblood livery: gilt frogging, a pillbox cap with a chin strap and a bell, white gloves, a porcelain half-mask, a shuttered
//                    lantern. The mummer's own frames (0 FROZEN, 1,2 creep, 3 GLOW: the mask burning and the lantern up, 4 strike, 5 hurt)
//   bakeGhost()      THE HOUSE'S SHY DEAD  a sheeted dead patron in an opera mask and a ruff; the boo's frames (0,1 drift | 2,3 faced: both hands over the mask | 4 hurt)
//   bakeHauntProp()  THE FLYING PROPS  a stage dagger nobody is holding, hilt wrapped in ribbon, in a pale ring (the haunt's frames: 0,1 hover | 2 TELL | 3 thrown (points right) | 4 hurt)
//   the PATRON (the box drunks' masked look) is waymeet.js's bakeDrunk('patron'): the drunk's own frames in evening black behind a porcelain mask.
//   foeSet(e) picks the set for a creature in this level; main.js calls it for every creature it draws here.
import { canvas, px, rect, fillPoly, line, ellipse, circle, outline, flipX, whiten } from '../px.js';
import { OUT } from '../art.js';
import { bakeDrunk } from './waymeet.js';

function pack(frames, ax, ay, w, h) { const R = frames, L = frames.map(c => flipX(c)), white = frames.map(c => whiten(c)); return { R, L, white: { R: white, L: white.map(c => flipX(c)) }, ax, ay, w, h }; }
function settleFrame(c) { const g = c.getContext('2d'), img = g.getImageData(0, 0, c.width, c.height), d = img.data; let low = -1;
  for (let y = c.height - 1; y >= 0 && low < 0; y--) for (let x = 0; x < c.width; x++) if (d[(y * c.width + x) * 4 + 3]) { low = y; break; }
  const n = c.height - 1 - low; if (low < 0 || n === 0) return c; g.clearRect(0, 0, c.width, c.height); g.putImageData(img, 0, n); return c; }
const frames = (W, H, n, fn, settle = true) => Array.from({ length: n }, (_, f) => { const [c, g] = canvas(W, H); fn(g, f); outline(c, OUT); return settle ? settleFrame(c) : c; });

// ================= THE STAGEHAND =================
const K = { apron: '#7a5232', apronL: '#a87a4a', apronD: '#4e321c', shirt: '#7a8a9a', shirtL: '#9aaaba', shirtD: '#56647a', skin: '#c8966a', skinL: '#e0b088', skinD: '#9a6a48', hair: '#2a1c14', trouser: '#3a3a46', trouserD: '#26262e', boot: '#221a16',
  sack: '#b8986a', sackL: '#d4b88a', sackD: '#7a5e38', rope: '#d8c8a0', ropeD: '#9a8a5a', cap: '#3a3440', capL: '#56506a', neck: '#c03038', neckD: '#7a1820', brass: '#c8a040', steel: '#9aa0aa' };
export function bakeStagehand() {
  const W = 44, H = 44, cx = 20, y0 = 14;
  const F = frames(W, H, 7, (g, f) => {
    const walk = f === 1 || f === 2, tell = f === 3, sw = f === 4, hurt = f === 5, drop = f === 6, st = f === 1 ? 2 : f === 2 ? -2 : 0, lean = hurt ? -3 : sw ? 4 : tell ? -2 : 0;
    // legs: heavy, apron-hem over the knees, boots
    for (const [lx, back] of [[cx - 6 - st, 1], [cx + 1 + st, 0]]) { rect(g, lx, y0 + 18, 5, 9, back ? K.trouserD : K.trouser); rect(g, lx, y0 + 18, 1, 9, back ? K.trouser : K.shirtD); rect(g, lx - 1, y0 + 26, 7, 3, K.boot); rect(g, lx - 1, y0 + 26, 7, 1, '#3a2c22'); }
    // the body: broad, a work shirt, an apron to the knee with a tool pocket
    fillPoly(g, [[cx - 8 + lean, y0 + 4], [cx + 8 + lean, y0 + 4], [cx + 9, y0 + 20], [cx - 9, y0 + 20]], K.shirt); rect(g, cx - 8 + lean, y0 + 4, 3, 16, K.shirtD); rect(g, cx + 4 + lean, y0 + 5, 2, 14, K.shirtL);
    fillPoly(g, [[cx - 6 + lean, y0 + 8], [cx + 7 + lean, y0 + 8], [cx + 8, y0 + 25], [cx - 7, y0 + 25]], K.apron); rect(g, cx - 6 + lean, y0 + 8, 13, 1, K.apronL); rect(g, cx - 7, y0 + 24, 15, 1, K.apronD); rect(g, cx - 4, y0 + 14, 6, 5, K.apronD); rect(g, cx - 4, y0 + 14, 6, 1, K.apronL); px(g, cx - 3, y0 + 12, K.steel); px(g, cx - 3, y0 + 13, K.steel);   // a tape and a hammer in the pocket
    line(g, cx - 5 + lean, y0 + 4, cx - 4 + lean, y0 + 9, K.apronD); line(g, cx + 6 + lean, y0 + 4, cx + 5 + lean, y0 + 9, K.apronD);   // the apron's straps
    rect(g, cx - 7, y0 + 18, 15, 2, K.apronD); px(g, cx + 1, y0 + 18, K.brass);                                                          // the belt
    // the head: a flat cap, a thick jaw, stubble, a red neckerchief
    const hx = cx + lean, hy = y0 - 4;
    rect(g, hx - 4, hy + 6, 9, 3, K.neck); rect(g, hx - 4, hy + 8, 9, 1, K.neckD); px(g, hx + 4, hy + 9, K.neck); px(g, hx + 4, hy + 10, K.neck);
    rect(g, hx - 4, hy, 9, 8, K.skin); rect(g, hx - 4, hy, 2, 8, K.skinD); rect(g, hx - 1, hy + 4, 6, 4, K.skin); rect(g, hx - 3, hy + 6, 8, 2, '#7a6050'); px(g, hx + 2, hy + 3, '#1a1210'); px(g, hx + 4, hy + 3, '#1a1210'); rect(g, hx + 1, hy + 2, 5, 1, K.hair); px(g, hx + 5, hy + 4, K.skinL);
    rect(g, hx - 5, hy - 2, 11, 3, K.cap); rect(g, hx - 5, hy - 2, 11, 1, K.capL); rect(g, hx + 1, hy, 7, 1, K.cap);   // the cap and its peak
    if (hurt) { rect(g, hx + 1, hy + 7, 3, 2, '#5a1a1a'); }
    const arm = (sx, sy, ex, ey, back) => { line(g, sx, sy, ex, ey, back ? K.shirtD : K.shirt, 4); line(g, sx + 1, sy + 1, ex + 1, ey + 1, back ? K.skinD : K.skin, 2); rect(g, ex - 1, ey - 1, 4, 4, back ? K.skinD : K.skin); px(g, ex, ey, K.skinL); };   // a forearm bare to the elbow
    const sack = (x, y, big) => { const w = big ? 14 : 12, h = big ? 12 : 10; rect(g, x - w / 2, y + 3, w, h - 2, K.sack); rect(g, x - w / 2 + 1, y + 2, w - 2, 2, K.sackL); rect(g, x - w / 2, y + h - 1, w, 2, K.sackD); rect(g, x - w / 2, y + 3, 2, h - 2, K.sackD); rect(g, x - 2, y + 6, 4, 3, K.sackD); rect(g, x - 1, y, 3, 3, K.rope); px(g, x, y - 1, K.ropeD); };   // the sack, the neck tied
    if (tell) { arm(cx + 6, y0 + 7, cx - 1, y0 - 8, false); arm(cx - 5, y0 + 7, cx - 7, y0 - 8, true); sack(cx - 4, y0 - 20, true); }
    else if (sw) { arm(cx + 7 + lean, y0 + 7, cx + 15, y0 + 14, false); arm(cx - 4, y0 + 8, cx + 9, y0 + 13, true); line(g, cx + 14, y0 + 13, cx + 15, y0 + 15, K.rope); sack(cx + 18, y0 + 13, true); }
    else if (drop) { arm(cx + 5, y0 + 6, cx + 4, y0 - 9, false); arm(cx - 4, y0 + 6, cx - 2, y0 - 12, true); line(g, cx + 1, y0 - 14, cx + 1, 0, K.rope); line(g, cx + 2, y0 - 14, cx + 2, 0, K.ropeD); px(g, cx + 1, y0 - 12, K.brass); }
    else if (hurt) { arm(cx - 7, y0 + 8, cx - 12, y0 + 13, true); arm(cx + 7, y0 + 8, cx + 10, y0 + 15, false); sack(cx + 14, y0 + 20, false); }
    else { arm(cx + 7, y0 + 8, cx + 11 + st, y0 + 16, false); arm(cx - 7, y0 + 8, cx - 10 - st, y0 + 17, true); line(g, cx - 10 - st, y0 + 17, cx - 11 - st, y0 + 20, K.rope); sack(cx - 11 - st, y0 + 20, false); }   // trailing the sack by its neck
  });
  return pack(F, 20, 43, 14, 24);
}

// ================= THE USHER =================
const U = { coat: '#8a1a2a', coatL: '#b83a48', coatD: '#5a0e1a', gold: '#e0b840', goldD: '#9a7a1c', trouser: '#22182a', trouserD: '#140e1a', glove: '#f0e8d8', gloveD: '#b8b0a0', mask: '#efe6d2', maskD: '#b8a888', maskL: '#fffaec', ink: '#120e14',
  paint: '#c23a30', red: '#ff2a1a', redD: '#a01410', redL: '#ffd0a0', hot: '#fff4c8', bell: '#f0c840', bellL: '#fff2a0', lamp: '#3a3440', lampL: '#8a8498', beam: '#ffe08a', boot: '#100c12', skin: '#c89a70' };
export function bakeUsher() {
  const W = 34, H = 40, cx = 14;
  const F = frames(W, H, 6, (g, f) => {
    const creep = f === 1 || f === 2, glow = f === 3, strike = f === 4, hurt = f === 5, frozen = f === 0;
    const lean = creep ? 2 : strike ? 3 : hurt ? -2 : frozen ? 1 : 0, swing = f === 1 ? -1 : f === 2 ? 1 : 0, y0 = 8, top = y0 + 10, hem = y0 + 22;
    const up = frozen ? 3 : 0;
    for (const [lx, u] of [[cx - 4 + (creep ? swing * 2 : 0), frozen ? up : creep ? (f === 1 ? 2 : 0) : 0], [cx + 1 - (creep ? swing * 2 : 0), creep ? (f === 1 ? 0 : 2) : 0]]) { rect(g, lx, hem - 1, 4, 10 - u, U.trouser); rect(g, lx, hem - 1, 1, 10 - u, '#3a2c44'); rect(g, lx - 1, hem + 8 - u, 6, 2, U.boot); px(g, lx, hem + 8 - u, '#4a4050'); }   // a stripe down the trouser
    // the livery: a long oxblood coat to the knee, a double row of gilt buttons, frogging at the chest, a gold cuff
    fillPoly(g, [[cx - 5 + lean, top], [cx + 6 + lean, top], [cx + 9, hem + 2], [cx - 8, hem + 2]], U.coat); rect(g, cx - 5 + lean, top, 3, hem - top + 2, U.coatD); rect(g, cx + 3 + lean, top + 1, 2, hem - top, U.coatL);
    line(g, cx + 1 + lean, top + 1, cx, hem + 1, U.coatD); for (let k = 0; k < 4; k++) { px(g, cx - 2 + lean * (1 - k / 4), top + 2 + k * 4, U.gold); px(g, cx + 3 + lean * (1 - k / 4), top + 2 + k * 4, U.gold); }
    for (let k = 0; k < 3; k++) rect(g, cx - 4 + lean, top + 1 + k * 2, 9, 1, U.goldD); rect(g, cx - 6 + lean, top, 13, 1, U.gold);                   // the braid over the chest, the gold collar
    rect(g, cx - 8, hem + 1, 18, 1, U.gold); rect(g, cx - 8, hem + 2, 18, 1, U.coatD);                                                                   // the hem's gold line
    // the head: a pillbox cap with a chin strap and a bell, and over the face a porcelain half-mask with a painted smile
    const hx = cx + lean + (hurt ? -1 : 0), hy = y0 - 2;
    rect(g, hx - 4, hy - 4, 10, 4, U.coat); rect(g, hx - 4, hy - 4, 10, 1, U.coatL); rect(g, hx - 4, hy - 1, 10, 1, U.gold); px(g, hx + 1, hy - 5, U.goldD); px(g, hx + 1, hy - 6, U.bell); px(g, hx, hy - 6, U.bellL);   // the pillbox, the bell on its button
    ellipse(g, hx + 1, hy + 5, 5, 6, glow ? U.red : U.mask); rect(g, hx - 4, hy + 1, 2, 9, glow ? U.redD : U.maskD); rect(g, hx + 2, hy + 1, 3, 9, glow ? U.red : U.maskD); rect(g, hx - 1, hy + 1, 2, 2, glow ? U.redL : U.maskL);
    for (const ex of [hx - 2, hx + 2]) { rect(g, ex, hy + 3, 3, 3, glow ? U.hot : U.ink); if (!glow) px(g, ex + 1, hy + 4, '#f0ead8'); }   // the eye holes, white-ringed (and white-hot when it glows)
    rect(g, hx - 2, hy + 8, 6, 1, glow ? U.redD : U.paint); px(g, hx - 3, hy + 7, glow ? U.redD : U.paint); px(g, hx + 4, hy + 7, glow ? U.redD : U.paint);   // the painted grin
    line(g, hx - 4, hy + 6, hx - 3, hy + 10, U.goldD);                                                                                                  // the chin strap
    const arm = (sx, sy, ex, ey) => { line(g, sx, sy, ex, ey, U.coat, 3); line(g, sx, sy + 1, ex, ey + 1, U.coatD); rect(g, ex - 1, ey - 1, 3, 3, U.glove); px(g, ex, ey - 1, U.gloveD); rect(g, ex - 2, ey - 2, 4, 1, U.gold); };
    const lantern = (x, y, lit) => { rect(g, x - 3, y, 7, 7, U.lamp); rect(g, x - 3, y, 7, 1, U.lampL); rect(g, x - 2, y + 2, 5, 4, lit ? U.beam : '#20182a'); if (lit) { px(g, x, y + 3, '#fff'); } rect(g, x - 1, y - 2, 3, 2, U.lampL); };   // a shuttered house lantern
    if (glow) { arm(cx - 4, top + 2, cx - 9, y0 + 2); arm(cx + 5, top + 2, cx + 12, y0 + 1); lantern(cx + 12, y0 - 7, true); }
    else if (strike) { arm(cx + 5 + lean, top + 2, cx + 14, top + 4); lantern(cx + 16, top + 2, false); arm(cx - 4, top + 2, cx - 6, top + 9); }
    else if (creep) { arm(cx + 5 + lean, top + 2, cx + 11 + swing, top + 6); lantern(cx + 13 + swing, top + 4, false); arm(cx - 4, top + 2, cx + 2, top + 8 - swing); }
    else if (frozen) { arm(cx + 5 + lean, top + 2, cx + 10, top + 5); lantern(cx + 12, top + 3, false); arm(cx - 4, top + 2, cx - 8, top + 9); }
    else if (hurt) { arm(cx - 4, top + 2, cx - 9, top + 7); arm(cx + 5, top + 2, cx + 8, top + 8); lantern(cx + 9, top + 9, false); }
  });
  return pack(F, cx, F[0].height - 1, 12, 34);
}

// ================= THE HOUSE'S GHOST (the shy dead, dressed for the theatre) =================
export function bakeGhost() {
  const W = 30, H = 34, X = 15, F0 = 31;
  const G = { sheet: '#ece6fa', sheetL: '#ffffff', sheetD: '#b0a4d4', sheetDD: '#6a5a98', hollow: '#120f22', mask: '#d8b848', maskD: '#8a6a1c', maskL: '#fff0a0', ruff: '#f6f0ff', ruffD: '#b8b0d8', glow: '#cfc8f4', ribbon: '#c02a30' };
  const frame = o => { const [c, g] = canvas(W, H), cy = F0 - 16;
    // the sheet: a body like a bell, a hem that curls into a tail
    const sw = o.swirl || 1;
    fillPoly(g, [[X - 9, cy - 4], [X - 6, cy - 12], [X, cy - 15], [X + 6, cy - 12], [X + 9, cy - 4], [X + 10 + sw, cy + 8], [X + 6 + sw * 2, F0 - 3], [X + 1 + sw * 3, F0], [X - 5 + sw, F0 - 3], [X - 10, cy + 9]], G.sheet);
    fillPoly(g, [[X - 9, cy - 4], [X - 5, cy - 11], [X - 4, cy + 6], [X - 10, cy + 9]], G.sheetD); rect(g, X + 4, cy - 12, 3, 14, G.sheetL);
    for (let k = 0; k < 3; k++) px(g, X - 6 + k * 5, F0 - 4 + (k & 1), G.sheetDD);
    // the ruff: a pleated collar, the one thing of a dead man's best clothes left on him
    for (let k = -3; k <= 3; k++) { rect(g, X + k * 2 - 1, cy - 4 + (Math.abs(k) > 2 ? 1 : 0), 2, 3, k & 1 ? G.ruff : G.ruffD); }
    // the face: an opera mask, gilt, with hollow eyes
    if (!o.cover) { ellipse(g, X + 1, cy - 8, 6, 5, G.mask); rect(g, X - 4, cy - 12, 10, 1, G.maskL); rect(g, X - 5, cy - 9, 2, 4, G.maskD); px(g, X + 1, cy - 11, G.ribbon); rect(g, X - 3, cy - 9, 3, 3, G.hollow); rect(g, X + 2, cy - 9, 3, 3, G.hollow); px(g, X - 2, cy - 8, '#ffd0d0'); px(g, X + 3, cy - 8, '#ffd0d0');
      rect(g, X - 2, cy - 4, 6, 1, G.maskD); rect(g, X + 5, cy - 7, 2, 4, G.mask); px(g, X + 6, cy - 4, G.maskD);
      rect(g, X - 8, cy - 2, 3, 6, G.sheet); rect(g, X + 7, cy - 2, 3, 6, G.sheet); }                      // stubby arms at rest
    else { rect(g, X - 6, cy - 12, 13, 9, G.sheet); ellipse(g, X - 3, cy - 8, 3, 3.5, G.sheetL); ellipse(g, X + 5, cy - 8, 3, 3.5, G.sheetL); rect(g, X - 6, cy - 10, 1, 1, G.sheetDD); ellipse(g, X - 3 + (o.shiver || 0), cy - 7, 1.5, 2, G.sheetD); ellipse(g, X + 5, cy - 7 - (o.shiver || 0), 1.5, 2, G.sheetD); px(g, X + 1, cy - 12, G.ribbon); }  // BOTH PAWS OVER THE MASK: the whole tell
    if (o.hurt) for (const [dx, dy] of [[-8, -15], [9, -13], [-10, -2], [8, 4]]) { px(g, X + dx, cy + dy, '#ffffff'); px(g, X + dx + 1, cy + dy, G.glow); }
    // a pale halo round the edge
    const img = g.getImageData(0, 0, W, H), d = img.data, solid = (x, y) => x >= 0 && y >= 0 && x < W && y < H && d[(y * W + x) * 4 + 3] > 0, pts = [];
    for (let y = 0; y < H; y++) for (let x = 0; x < W; x++) if (!solid(x, y) && (solid(x + 1, y) || solid(x - 1, y) || solid(x, y + 1) || solid(x, y - 1)) && (o.bright || (x + y) % 2 === 0)) pts.push([x, y]);
    for (const [x, y] of pts) px(g, x, y, o.bright ? '#b0a4f0' : '#6a5aa8');
    return c; };
  const fr = [{ swirl: 1 }, { swirl: -1 }, { cover: true, bright: true }, { cover: true, bright: true, shiver: 1 }, { swirl: -1, hurt: true }].map(frame);
  let ay = 0; { const g = fr[0].getContext('2d'), d = g.getImageData(0, 0, W, H).data; for (let y = 0; y < H; y++) for (let x = 0; x < W; x++) if (d[(y * W + x) * 4 + 3]) ay = y; }
  return pack(fr, X, ay, 14, 20);
}

// ================= THE FLYING PROPS (the haunt): a stage dagger =================
export function bakeHauntProp() {
  const W = 28, H = 28, X = 14;
  const P = { blade: '#d8dee8', bladeL: '#ffffff', bladeD: '#8a92a4', guard: '#e0b840', guardD: '#9a7a1c', grip: '#7a1a24', gripL: '#c02a30', pommel: '#f0d070', ring: '#9ab8e0', ringL: '#eaf4ff', eye: '#141824' };
  const frame = o => { const [c, g] = canvas(W, H); const a = (o.deg * Math.PI) / 180, ux = Math.cos(a), uy = Math.sin(a), nx = -uy, ny = ux, bx = o.butt[0], by = o.butt[1];
    const at = (t, s = 0) => [bx + ux * t + nx * s, by + uy * t + ny * s];
    const quad = (t0, t1, s0, s1, col) => { const p = [at(t0, -s0), at(t1, -s1), at(t1, s1), at(t0, s0)]; fillPoly(g, p, col); };
    quad(0, 4, 2, 2, P.pommel); quad(3, 9, 1.4, 1.4, P.grip); quad(5, 6.4, 1.6, 1.6, P.gripL); quad(9, 10.6, 4, 4, P.guard); quad(9, 9.8, 4, 4, P.guardD);
    quad(10.6, 21, 2.1, 1.6, P.blade); quad(10.6, 21, 0.4, 0.2, P.bladeL); quad(21, 24, 1.6, 0.2, P.blade); quad(10.6, 21, -0.2, -2, P.bladeD);
    // the ribbon tied to the hilt, trailing
    for (let k = 0; k < 5; k++) { const p = at(1 - k * 1.6, 2 + k * 0.6 + Math.sin(k + (o.phase || 0)) * 1.2); px(g, p[0], p[1], P.gripL); }
    // a ring of pale light round the blade's root, and a face in it - hollow eyes and a mouth
    const rc = at(12, 0); for (let i = 0; i < 26; i++) { const t = (i / 26) * Math.PI * 2, rr = o.bright ? 7 : 6; px(g, rc[0] + Math.cos(t) * rr, rc[1] + Math.sin(t) * rr * 0.9, (i + (o.phase ? 1 : 0)) % 2 ? P.ring : P.ringL); }
    px(g, rc[0] - 2, rc[1] - 1, P.eye); px(g, rc[0] + 2, rc[1] - 1, P.eye); px(g, rc[0], rc[1] + 2, P.eye);
    if (o.shake) for (const [sx, sy, col] of o.shake) px(g, sx, sy, col);
    return outline(c, '#0c0810'); };
  const hoverA = { butt: [X, 25], deg: -90 }, hoverB = { butt: [X - 3, 24], deg: -74, phase: 1 };
  const tell = { butt: [X + 1, 25], deg: -138, bright: true, phase: 1, shake: [[X - 12, 12, '#c8dcf5'], [X - 12, 14, '#9ab8e0'], [X - 11, 23, '#c8dcf5'], [X + 2, 4, '#eef6ff'], [X + 6, 26, '#eef6ff']] };
  const thrown = { butt: [X - 12, 14], deg: 0 }, hurt = { butt: [X - 2, 25], deg: -80, phase: 1 };
  const fr = [hoverA, hoverB, tell, thrown, hurt].map(frame);
  return pack(fr, X, 26, 8, 22);
}

// ================= THE FLYMAN (claude/theatre3): the archer's reskin - a stagehand up on the catwalks who throws =================
//   bakeFlyman()  shirt sleeves, a flat cap, a tool belt; the archer's frames: 0 stand | 1 DRAW (a hammer back over his shoulder) | 2,3 walk | 4 a look down |
//                 5 the throw coming | 6 loosed (arm through) | 7 SANDBAG TELL (a sack hoisted over his head, both hands: red, no shield turns it). 30x36, ax 14
export function bakeFlyman() {
  const W = 30, H = 36, cx = 14, y0 = 12;
  const F = frames(W, H, 8, (g, f) => {
    const walk = f === 2 || f === 3, st = f === 2 ? 2 : f === 3 ? -2 : 0, draw = f === 1 || f === 5, loose = f === 6, bag = f === 7, look = f === 4, lean = draw ? -2 : loose ? 3 : look ? 1 : 0;
    for (const [lx, back] of [[cx - 4 - st, 1], [cx + 1 + st, 0]]) { rect(g, lx, y0 + 13, 4, 8, back ? K.trouserD : K.trouser); rect(g, lx - 1, y0 + 20, 6, 2, K.boot); }
    fillPoly(g, [[cx - 5 + lean, y0 + 2], [cx + 5 + lean, y0 + 2], [cx + 6, y0 + 14], [cx - 6, y0 + 14]], K.shirt); rect(g, cx - 5 + lean, y0 + 2, 2, 12, K.shirtD); rect(g, cx + 3 + lean, y0 + 3, 1, 10, K.shirtL);
    rect(g, cx - 6, y0 + 12, 13, 2, K.apronD); px(g, cx - 3, y0 + 13, K.steel); px(g, cx + 2, y0 + 13, K.brass); rect(g, cx + 3, y0 + 13, 2, 3, K.apron);   // the tool belt, a pouch
    const hx = cx + lean, hy = y0 - 6;
    rect(g, hx - 3, hy, 7, 7, K.skin); rect(g, hx - 3, hy, 2, 7, K.skinD); px(g, hx + 2, hy + 3, '#1a1210'); rect(g, hx - 2, hy + 5, 6, 1, '#7a6050'); rect(g, hx - 3, hy + 6, 7, 2, K.neck);
    rect(g, hx - 4, hy - 2, 9, 3, K.cap); rect(g, hx - 4, hy - 2, 9, 1, K.capL); rect(g, hx + 1, hy, 5, 1, K.cap);
    const arm = (sx, sy, ex, ey, back) => { line(g, sx, sy, ex, ey, back ? K.shirtD : K.shirt, 3); rect(g, ex - 1, ey - 1, 3, 3, back ? K.skinD : K.skin); };
    const hammer = (x, y, up) => { line(g, x, y, x + (up ? -2 : 3), y + (up ? -6 : -5), '#7a5232', 2); rect(g, x + (up ? -4 : 2), y + (up ? -8 : -7), 5, 3, K.steel); px(g, x + (up ? -4 : 2), y + (up ? -8 : -7), '#d8dee8'); };
    if (bag) { arm(cx + 4, y0 + 3, cx + 2, y0 - 10, false); arm(cx - 4, y0 + 3, cx - 4, y0 - 10, true); const sx = cx - 1, sy = y0 - 21;
      rect(g, sx - 6, sy + 3, 12, 9, K.sack); rect(g, sx - 5, sy + 2, 10, 2, K.sackL); rect(g, sx - 6, sy + 11, 12, 2, K.sackD); rect(g, sx - 1, sy, 3, 3, K.rope); px(g, sx - 3, sy + 6, '#c03038'); px(g, sx + 2, sy + 6, '#c03038'); }   // the sack over his head, a red stencil on it
    else if (draw) { arm(cx + 4, y0 + 3, cx - 3, y0 - 6, false); hammer(cx - 3, y0 - 6, true); arm(cx - 4, y0 + 4, cx + 6, y0 + 8, true); }
    else if (loose) { arm(cx + 4 + lean, y0 + 3, cx + 12, y0 + 6, false); arm(cx - 4, y0 + 4, cx - 7, y0 + 10, true); }
    else { arm(cx + 4, y0 + 3, cx + 7 + st, y0 + 11, false); hammer(cx + 7 + st, y0 + 12, false); arm(cx - 4, y0 + 3, cx - 7 - st, y0 + 11, true); }
  });
  return pack(F, cx, F[0].height - 1, 10, 22);
}

// ================= THE PROMPTER (claude/theatre3): the goblin priest's reskin - the support who keeps the cast on its lines =================
//   bakePrompter()  a stooped man in rusty black, half-spectacles, a prompt book and a candle on a stick; the priest's frames: 0 stand | 1,2 walk | 3,4 THE RITE
//                   (the book held up open, the candle high: the cast mends) | 5 book drawn back to throw | 6 thrown | 7 hand bell up | 8 rung | 9 knocked back
export function bakePrompter() {
  const W = 30, H = 36, cx = 14, y0 = 12;
  const P2 = { coat: '#2a2430', coatL: '#4a4054', coatD: '#16121c', shirt: '#e8e0d0', book: '#7a1a24', bookL: '#a83a40', page: '#f0e8d0', candle: '#f0e8c8', flame: '#ffd36b', flameL: '#fff6c8', skin: '#d8b090', skinD: '#a88060', hair: '#c8c0b8', glass: '#c8e0f0', bell: '#e0b840' };
  const F = frames(W, H, 10, (g, f) => {
    const walk = f === 1 || f === 2, st = f === 1 ? 2 : f === 2 ? -2 : 0, rite = f === 3 || f === 4, back = f === 5, thrown = f === 6, bellUp = f === 7, rung = f === 8, broken = f === 9;
    const lean = broken ? -3 : thrown ? 3 : back ? -2 : 1;
    for (const [lx, b] of [[cx - 4 - st, 1], [cx + 1 + st, 0]]) { rect(g, lx, y0 + 14, 4, 7, b ? P2.coatD : P2.coat); rect(g, lx - 1, y0 + 20, 5, 2, '#100c10'); }
    fillPoly(g, [[cx - 4 + lean, y0 + 2], [cx + 5 + lean, y0 + 2], [cx + 7, y0 + 17], [cx - 6, y0 + 17]], P2.coat); rect(g, cx - 4 + lean, y0 + 2, 2, 15, P2.coatD); rect(g, cx + 3 + lean, y0 + 3, 1, 13, P2.coatL); rect(g, cx - 1 + lean, y0 + 2, 3, 3, P2.shirt);   // a long black coat, a white stock
    const hx = cx + lean + 1, hy = y0 - 6;
    rect(g, hx - 3, hy, 7, 7, P2.skin); rect(g, hx - 3, hy, 2, 7, P2.skinD); rect(g, hx - 4, hy - 1, 9, 2, P2.hair); rect(g, hx - 4, hy, 2, 4, P2.hair); rect(g, hx + 1, hy + 3, 4, 1, P2.glass); px(g, hx + 2, hy + 3, '#1a1a24'); rect(g, hx, hy + 5, 4, 1, '#8a6050');   // grey hair, half-spectacles
    const arm = (sx, sy, ex, ey, b) => { line(g, sx, sy, ex, ey, b ? P2.coatD : P2.coat, 3); rect(g, ex - 1, ey - 1, 3, 3, P2.skin); };
    const book = (x, y, open) => { if (open) { rect(g, x - 5, y, 11, 6, P2.page); rect(g, x, y, 1, 6, P2.bookL); for (let k = 0; k < 3; k++) { rect(g, x - 4, y + 1 + k * 2, 3, 1, '#7a7068'); rect(g, x + 2, y + 1 + k * 2, 3, 1, '#7a7068'); } rect(g, x - 5, y + 6, 11, 1, P2.book); }
      else { rect(g, x - 3, y, 6, 8, P2.book); rect(g, x - 3, y, 6, 1, P2.bookL); rect(g, x + 2, y + 1, 1, 6, P2.page); } };
    const candle = (x, y, lit) => { rect(g, x, y, 1, 8, '#6a5a48'); rect(g, x - 1, y - 3, 3, 3, P2.candle); if (lit) { px(g, x, y - 5, P2.flame); px(g, x, y - 4, P2.flameL); } };
    if (rite) { arm(cx + 4, y0 + 4, cx + 6, y0 - 3, false); book(cx + 6, y0 - 9, true); arm(cx - 3, y0 + 4, cx - 6, y0 - 2, true); candle(cx - 6, y0 - 4 - (f === 4 ? 1 : 0), true); }
    else if (back) { arm(cx + 4, y0 + 4, cx - 4, y0 - 4, false); book(cx - 5, y0 - 10, false); arm(cx - 3, y0 + 5, cx + 5, y0 + 9, true); }
    else if (thrown) { arm(cx + 4 + lean, y0 + 4, cx + 13, y0 + 4, false); arm(cx - 3, y0 + 5, cx - 6, y0 + 11, true); }
    else if (bellUp || rung) { arm(cx + 4, y0 + 4, cx + 8, rung ? y0 + 4 : y0 - 4, false); rect(g, cx + 7, (rung ? y0 + 4 : y0 - 4) - 1, 4, 4, P2.bell); px(g, cx + 8, rung ? y0 + 7 : y0 - 1, '#8a6a1c'); arm(cx - 3, y0 + 5, cx - 5, y0 + 11, true); book(cx - 5, y0 + 9, false); }
    else if (broken) { arm(cx - 3, y0 + 4, cx - 9, y0 + 8, true); arm(cx + 4, y0 + 4, cx + 8, y0 + 11, false); book(cx + 9, y0 + 12, true); }
    else { arm(cx + 4, y0 + 4, cx + 7 + st, y0 + 10, false); book(cx + 8 + st, y0 + 7, false); arm(cx - 3, y0 + 4, cx - 6, y0 + 10, true); candle(cx - 6, y0 + 3, true); }
  });
  return pack(F, cx, F[0].height - 1, 10, 22);
}

// ================= the set a creature wears in this level =================
let SETS = null;
export function bakeTheatreCast() {
  if (SETS) return SETS;
  SETS = { patron: bakeDrunk('patron'), usher: bakeUsher(), ghost: bakeGhost(), haunt: bakeHauntProp(), flyman: bakeFlyman(), prompter: bakePrompter() };
  return SETS;
}
export function foeSet(e) {
  if (!SETS) bakeTheatreCast();
  if (e.t === 'archer' && e.flyman) return SETS.flyman;
  if (e.t === 'gobpriest' && e.prompter) return SETS.prompter;
  if (e.t === 'drunk' && (e.footlights || e.patron)) return SETS.patron;
  if (e.t === 'mummer' && e.usher) return SETS.usher;
  if (e.t === 'boo') return SETS.ghost;
  if (e.t === 'haunt') return SETS.haunt;
  return null;
}
export const hauntThrown = () => (SETS ? SETS.haunt.R[3] : null);
