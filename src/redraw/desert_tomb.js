// desert_tomb.js — THE SEALED PYRAMID (level 6) and THE KING'S PYRAMID (level 7)'s undead court, plus THE SUN TEMPLE
// (4b)'s FALLEN HIGH PRIEST. Not wired in: the level batches add the spawn cases, frame tables and the rest of A8.
// Looks from docs/briefs/sealed-pyramid.md, kings-pyramid.md, sun-temple.md; attack tables from src/desert-bosses.js
// (HIGH_PRIEST, SCARAB_MOTHER, EMBALMER). px.js primitives only, so tools/desert-tomb-art.mjs renders every frame in
// Node. Contract (desert_foes.js's, copied below): every frame faces RIGHT (L is the flip), one canvas per sprite,
// ax = the body's centre column, ay = the row under the lowest pixel (grounded sprites SETTLE to it), w/h = the hit
// box. Tells follow the house marks: '!' yellow (blockable), red X (move) — always bigger and slower than the blow.
//
// FOES
//   bakeMummy()          MUMMY               0,1 shamble | 2 GRAB TELL (!) | 3 GRAB | 4 hurt
//   bakeScarabSwarm()    SCARAB SWARM        0,1,2 flow | 3 REAR TELL (X) | 4 SURGE | 5 hurt (scatters, flashes)
//   bakeJackalGuard()    JACKAL-HEADED GUARD 0,1 walk | 2 CUT TELL (!) | 3 CUT | 4 GUARD (stance) | 5 hurt
//   bakeSkeletonGuard()  GILDED SKELETON GUARD 0,1 walk | 2 SHIELD UP | 3 GUARD DROPPED (dazzled) | 4 THRUST TELL (!)
//                        | 5 THRUST | 6 hurt
//   bakePriestOfKing()   PRIEST OF THE KING  0,1 walk | 2 RE-WRAP (bent to a fallen body) | 3 CAST TELL (X) | 4 CAST
//                        | 5 hurt
//   bakeShadowThing()    SHADOW THING (flyer) 0,1,2 drift | 3 LUNGE TELL (X) | 4 LUNGE | 5 FLEEING/BURNING
//   bakeFallenPriest()   FALLEN PRIEST       0,1 walk | 2 SNUFF (arms to a window) | 3 hurt
//
// BOSS (4b, arena src/desert-bosses.js HIGH_PRIEST)
//   bakeFallenHighPriest() THE FALLEN HIGH PRIEST, canvas 60x66, ~54 px drawn
//                        0 idle | 1,2 walk | 3 BOLT TELL (!) | 4 BOLT | 5 SWEEP TELL (X) | 6 SWEEP | 7 GRASP TELL (X)
//                        | 8 GRASP | 9 SNUFF TELL (X) | 10 SNUFF | 11 OPEN (burning in the beam, staggered) | 12 hurt
//   bakeShadowHands()    3 frames, a floor effect: hands rising from a dark tile (GRASP's mark / SNUFF's dark floor)
//   bakeShadowBolt()     3-frame flight bolt, { R, L }
//
// MINI (level 6, arena src/desert-bosses.js EMBALMER)
//   bakeEmbalmer()       THE EMBALMER, canvas 46x48, ~44 px drawn
//                        0,1 walk | 2 HOOK TELL (!) | 3 HOOK | 4 JAR TELL (X) | 5 JAR THROW | 6 WRAP TELL (X)
//                        | 7 WRAP | 8 OPEN (drenched, blinded, clawing) | 9 hurt
//   bakeEmbalmerJar()    { jar: { R, L } a 2-frame spinning jar in flight, splash: 3-frame spreading fluid patch }
//
// BOSS (level 6, arena src/desert-bosses.js SCARAB_MOTHER)
//   bakeScarabMother()   THE SCARAB MOTHER, canvas 96x58, ~86x50 drawn
//                        0 idle | 1,2 walk | 3 CHARGE TELL (X) | 4 CHARGE | 5 SPIT TELL (!) | 6 SPIT | 7 SWARM TELL (!)
//                        | 8 SWARM | 9 BURROW TELL (X, sinking) | 10 BURROW (mostly under) | 11 OPEN (pinned/darted)
//                        | 12 hurt
//   bakeScarabFX()       { hump: 2-frame sand mound (BURROW's marker), glob: { R, L } 2-frame acid glob in flight }
import { canvas, px, rect, fillPoly, line, ellipse, circle, outline, flipX, whiten, shade as tint } from '../px.js';
import { OUT } from '../art.js';

function pack(frames, ax, ay, w, h) {
  const R = frames, L = frames.map(c => flipX(c)), white = frames.map(c => whiten(c)), whiteL = white.map(c => flipX(c));
  return { R, L, white: { R: white, L: whiteL }, ax, ay, w, h };
}
function settleFrame(c) { const g = c.getContext('2d'), img = g.getImageData(0, 0, c.width, c.height), d = img.data; let low = -1;
  for (let y = c.height - 1; y >= 0 && low < 0; y--) for (let x = 0; x < c.width; x++) if (d[(y * c.width + x) * 4 + 3]) { low = y; break; }
  const n = c.height - 1 - low; if (low < 0 || n === 0) return c; g.clearRect(0, 0, c.width, c.height); g.putImageData(img, 0, n); return c; }
const frames = (W, H, n, fn, ground = true) => Array.from({ length: n }, (_, f) => { const [c, g] = canvas(W, H); fn(g, f); outline(c, OUT); return ground ? settleFrame(c) : c; });
const thick = (g, x0, y0, x1, y1, col, w = 2) => { const horiz = Math.abs(y1 - y0) > Math.abs(x1 - x0); for (let k = 0; k < w; k++) line(g, x0 + (horiz ? k : 0), y0 + (horiz ? 0 : k), x1 + (horiz ? k : 0), y1 + (horiz ? 0 : k), col); };

// house tell colours
const BANG = '#ffd36b', BANGL = '#fff1c0';   // '!' yellow
const XRED = '#e04030', XREDL = '#ff8a5c';   // red X

// ================= MUMMY (both pyramids) =================
// A full body/head/raised-arm budget needs more than the ~24 px "humanoid" guideline leaves: the canvas is generous
// (H=34) so no pose clips off the top before settleFrame() brings the feet down to row ay-1.
const LI = { l: '#d9cba0', L: '#f0e6c4', d: '#b8a97e', D: '#8f7f58', stain: '#5e4e34', dk: '#332a1e', eye: '#171210', skin: '#6e5a46' };
export function bakeMummy() {
  const W = 22, H = 34, cx = 11, hip = 30;
  const band = (g, x0, y0, x1, y1, tone) => { line(g, x0, y0, x1, y1, tone ? LI.d : LI.l, 3); line(g, x0, y0, x1, y1, tone ? LI.D : LI.d, 1); };
  const F = frames(W, H, 5, (g, f) => {
    const lean = f === 1 ? 1 : f === 3 ? 2 : 0, back = f === 4 ? -2 : 0;
    rect(g, cx - 5, hip, 9, 2, LI.dk);                                            // the trailing wrap, dragging at the feet
    // legs, bound close, barely stepping
    rect(g, cx - 4 + back, hip - 9, 3, 9, LI.l); rect(g, cx + 1 + back + (f === 1 ? 1 : 0), hip - 8, 3, 8, LI.d);
    for (let y = hip - 8; y < hip; y += 3) { rect(g, cx - 4 + back, y, 3, 1, LI.D); rect(g, cx + 1 + back, y, 3, 1, LI.D); }
    // torso: wound bands, tapering to the shoulders, tilted forward when reaching
    fillPoly(g, [[cx - 5 + lean + back, hip - 9], [cx + 4 + lean + back, hip - 9], [cx + 5 + back, hip - 17], [cx - 5 + back, hip - 17]], LI.l);
    for (let k = 0; k < 3; k++) { const t = lean * (1 - k / 3); band(g, cx - 5 + t + back, hip - 10 - k * 2.4, cx + 5 + t + back, hip - 11 - k * 2.4, k % 2); }
    px(g, cx - 3 + back, hip - 12, LI.stain); px(g, cx + 2 + back, hip - 15, LI.stain);
    // the head: wound in its own bands (not a smooth helmet), one socket lit only when it means to grab, a loose
    // end trailing off it — the one silhouette detail that says MUMMY before anything else does
    const hx = cx + lean + back, hy = hip - 20;
    ellipse(g, hx, hy, 4, 3.6, LI.l);
    line(g, hx - 4, hy - 2, hx + 4, hy - 1, LI.d, 2); line(g, hx - 3, hy + 2, hx + 3, hy + 3, LI.D, 1);
    rect(g, hx - 2, hy - 1, 2, 1, LI.eye); rect(g, hx + 1, hy - 1, 2, 1, (f === 2 || f === 3) ? BANG : LI.eye);
    for (let k = 0; k < 3; k++) px(g, hx - 5 - k, hy - 5 + k * 2, k % 2 ? LI.d : LI.l);
    const sh = [cx + 3 + lean + back, hip - 14];
    if (f === 2) {   // GRAB TELL: both arms flung up and wide, wraps streaming loose — big, slow, unmistakable
      line(g, sh[0], sh[1], cx + 9 + back, hip - 24, LI.d, 3); line(g, cx - 3 + back, hip - 14, cx - 9 + back, hip - 23, LI.d, 3);
      rect(g, cx + 8 + back, hip - 26, 2, 2, LI.skin); rect(g, cx - 10 + back, hip - 25, 2, 2, LI.skin);
      for (let k = 0; k < 3; k++) { px(g, cx + 9 + back - k, hip - 26 + k, LI.l); px(g, cx - 9 + back + k, hip - 25 + k, LI.l); }
    } else if (f === 3) {   // GRAB: both arms thrust together, hands hooked into claws
      line(g, sh[0], sh[1], cx + 13 + back, hip - 13, LI.d, 3); line(g, cx - 3 + back, hip - 14, cx + 11 + back, hip - 11, LI.d, 3);
      rect(g, cx + 12 + back, hip - 14, 2, 2, LI.skin); rect(g, cx + 10 + back, hip - 12, 2, 2, LI.skin);
    } else if (f === 4) {   // hurt: reeling back, a band torn loose and flapping
      line(g, sh[0], sh[1], cx + 6 + back, hip - 6, LI.d, 3); line(g, cx - 3 + back, hip - 14, cx - 7 + back, hip - 7, LI.d, 3);
      line(g, cx + 6 + back, hip - 11, cx + 11 + back, hip - 15, LI.D, 1);
    } else {   // shamble: arms hang forward, loose, the classic reach
      line(g, sh[0], sh[1], cx + 7 + lean, hip - 4, LI.d, 3); line(g, cx - 3 + back, hip - 14, cx - 6, hip - 4, LI.d, 3);
      rect(g, cx + 6 + lean, hip - 5, 2, 2, LI.skin);
    }
  });
  return pack(F, cx, H, 10, 22);
}

// ================= SCARAB SWARM (both pyramids) =================
const SW = { a: '#2e3a1e', A: '#4a5e2a', l: '#7a8f42', gold: '#c9a840', shell: '#1c2414', eye: '#ff5030' };
export function bakeScarabSwarm() {
  const W = 32, H = 8, cy = 6;
  const beetle = (g, x, tone, up = 0) => { ellipse(g, x, cy - up, 2.2, 1.6, tone ? SW.A : SW.a); px(g, x - 1, cy - up - 1, SW.l); px(g, x + 1, cy - 1 - up, SW.shell); };
  const F = frames(W, H, 6, (g, f) => {
    if (f === 5) {   // hurt: the carpet scatters, a bright gap torn through the middle
      for (let i = 0; i < 10; i++) { const x = 2 + i * 3 + (i % 2 ? 2 : -2); if (Math.abs(x - 16) < 4) continue; beetle(g, x, i % 2); }
      for (let i = 0; i < 4; i++) px(g, 13 + i, cy - 3 - (i % 2), '#f0eee0'); return; }
    if (f === 3) {   // REAR TELL: the middle rises up, red glints along the raised line — big and slow to read
      for (let i = 0; i < 11; i++) { const x = 1 + i * 3, up = Math.abs(i - 5) < 3 ? 3 - Math.abs(i - 5) : 0; beetle(g, x, i % 2, up); }
      for (let i = 0; i < 3; i++) px(g, 14 + i, cy - 5, SW.eye); return; }
    if (f === 4) {   // SURGE: the wave breaks forward, wider and lower, a red edge leading it
      for (let i = 0; i < 12; i++) { const x = 1 + i * 2.6; beetle(g, x, i % 2); }
      for (let i = 0; i < 4; i++) px(g, 24 + i, cy - 1 - (i % 2), SW.eye); return; }
    const shift = f * 1.2;   // FLOW: the same carpet, the beetles' lit backs crawling along it
    for (let i = 0; i < 11; i++) { const x = 1 + i * 3; beetle(g, x, ((i + Math.floor(shift)) % 2)); }
    for (let i = 0; i < 3; i++) px(g, ((2 + i * 9 + Math.floor(shift * 2)) % 30) + 1, cy - 2, SW.gold);
  });
  return pack(F, 16, H, 28, 5);
}

// ================= JACKAL-HEADED GUARD (sealed pyramid: the trap guards) =================
// Anubis, not a pirate: bare bronze skin (no coat), a white linen kilt (no red sash), a broad gold collar, and a
// gold-and-blue striped nemes headcloth with the jackal's ears and long black snout coming out of it (no tricorn).
const JG = { skin: '#8a5a34', skinL: '#a8754a', skinD: '#5e3c22', snout: '#18141c', snoutL: '#332c3a', nose: '#0a0810',
  cloth: '#3a5a88', clothL: '#5c8ab8', clothD: '#22344e', gold: '#d4a83e', goldL: '#f2cf72', goldD: '#6e5218',
  linen: '#e8ddc0', linenL: '#f6efd8', linenD: '#c0b28e', blade: '#c9d1dc', bladeL: '#f0f4f8', bronze: '#8a7040', eye: '#ffd36b' };
export function bakeJackalGuard() {
  const W = 26, H = 38, cx = 13, hip = 34;
  // a curved sickle, not a straight-edged quad: an arc of shrinking circles from the hilt to a point (the SCORPION
  // tail's technique), so it tapers smoothly into a hook instead of a jagged shard
  const khopesh = (g, hx, hy, mode, glow) => {
    const [sx, sy, a0, sweep] = mode === 'up' ? [hx - 2, hy - 8, Math.PI * 1.12, -1.9] : mode === 'fwd' ? [hx + 6, hy + 1, -0.3, 1.25] : [hx + 5, hy + 5, 0.05, 1.35];
    thick(g, hx, hy, sx, sy, JG.bronze, 2);
    let prev = null;
    for (let i = 0; i <= 6; i++) { const t = i / 6, a = a0 + sweep * t, len = 3 + t * 8, r = 2.3 - t * 1.6;
      const x = sx + Math.cos(a) * len, y = sy + Math.sin(a) * len;
      ellipse(g, x, y, Math.max(0.7, r), Math.max(0.7, r), JG.blade);
      if (prev) line(g, prev[0], prev[1], x, y, glow ? JG.eye : JG.bladeL, i > 3 ? 1 : 2);
      prev = [x, y]; }
  };
  const F = frames(W, H, 6, (g, f) => {
    const ph = f === 1 ? 1 : 0, guard = f === 4;
    // bare legs, sandalled feet
    rect(g, cx - 3, hip - 12, 2, 12, JG.skin); rect(g, cx + 1 + (ph ? 2 : 0), hip - 12, 2, 12, JG.skinD);
    rect(g, cx - 4, hip - 1, 3, 2, JG.linenD); rect(g, cx + 2 + (ph ? 2 : 0), hip - 1, 3, 2, JG.linenD);
    // the white linen kilt, belted in gold
    rect(g, cx - 5, hip - 17, 10, 6, JG.linen); rect(g, cx - 5, hip - 12, 10, 1, JG.linenD); rect(g, cx - 5, hip - 17, 10, 1, JG.gold);
    for (let k = 0; k < 4; k++) line(g, cx - 4 + k * 3, hip - 16, cx - 5 + k * 3, hip - 11, JG.linenD, 1);   // pleats
    // the bare bronze chest, a broad gold collar across the shoulders (the clear seam under the head)
    fillPoly(g, [[cx - 5, hip - 17], [cx + 5, hip - 17], [cx + 4, hip - 25], [cx - 4, hip - 25]], JG.skin);
    line(g, cx - 3, hip - 19, cx + 3, hip - 21, JG.skinL); px(g, cx - 2, hip - 22, JG.skinD);
    rect(g, cx - 5, hip - 26, 10, 3, JG.gold); rect(g, cx - 5, hip - 26, 10, 1, JG.goldL);
    for (let k = 0; k < 4; k++) px(g, cx - 4 + k * 3, hip - 24, JG.goldD);   // the collar's bead courses
    // the nemes: gold-and-blue striped cloth falling past the shoulders in two lappets, then the crown between the ears
    const hx = cx, hy = hip - 31;
    for (const s of [-1, 1]) { for (let y = 0; y < 9; y++) { const w = 3 - (y > 5 ? 1 : 0); rect(g, hx + s * 5 - (s > 0 ? 0 : w - 1), hy + y, w, 1, y % 3 === 1 ? JG.gold : JG.cloth); } }
    fillPoly(g, [[hx - 6, hy + 2], [hx - 5, hy - 5], [hx - 1, hy - 8], [hx + 4, hy - 4], [hx + 5, hy + 2]], JG.cloth);
    for (let y = -6; y < 2; y += 2) line(g, hx - 6 + (y + 8) * 0.25, hy + y, hx + 5 - (y + 8) * 0.25, hy + y, JG.gold, 1);
    // the ears, tall and pointed, gold-lined, through the crown
    fillPoly(g, [[hx - 4, hy - 3], [hx - 5, hy - 11], [hx - 1, hy - 4]], JG.snout); line(g, hx - 5, hy - 11, hx - 1, hy - 4, JG.gold);
    fillPoly(g, [[hx, hy - 4], [hx, hy - 12], [hx + 3, hy - 5]], JG.snout); line(g, hx, hy - 12, hx + 3, hy - 5, JG.gold);
    // the long black snout, forward (right), a black nose at its tip
    fillPoly(g, [[hx - 4, hy + 5], [hx - 4, hy - 1], [hx - 1, hy - 1], [hx + 9, hy + 2], [hx + 10, hy + 4], [hx + 8, hy + 6], [hx - 1, hy + 6]], JG.snout);
    line(g, hx - 3, hy + 1, hx + 8, hy + 3, JG.snoutL);
    rect(g, hx + 8, hy + 3, 2, 2, JG.nose); px(g, hx + 1, hy + 1, JG.eye);
    const sh = [cx - 5, hip - 22];
    if (f === 2) { khopesh(g, sh[0], sh[1], 'up', true); line(g, sh[0], sh[1], cx - 9, hip - 24, JG.skinD, 2); }        // CUT TELL: high overhead, blade lit
    else if (f === 3) { khopesh(g, sh[0], sh[1], 'fwd', false); line(g, sh[0], sh[1], cx - 10, hip - 21, JG.skinD, 2); } // CUT: swept down and out
    else if (guard) { khopesh(g, sh[0], sh[1], 'low', false); line(g, sh[0], sh[1], cx - 9, hip - 24, JG.skinD, 2);
      circle(g, cx - 12, hip - 15, 6, JG.blade); circle(g, cx - 12, hip - 15, 4, JG.bladeL); }                          // GUARD: a shield up on the near arm
    else { khopesh(g, sh[0], sh[1], 'low', false); line(g, sh[0], sh[1], cx - 9, hip - 24, JG.skinD, 2); }              // patrol
    if (f === 5) px(g, hx + 1, hy + 1, JG.snoutL);   // hurt: the eye dims
  });
  return pack(F, cx, H, 14, 26);
}

// ================= GILDED SKELETON GUARD (king's pyramid court) =================
const SK = { b: '#e0d6bc', m: '#c2b696', d: '#9c8f70', s: '#6e6350', gold: '#a67e28', goldL: '#d4a83e', goldD: '#6e5218',
  shield: '#c9a840', shieldD: '#8a6e28', shieldL: '#fff1c0', eye: '#9ae0ff', dim: '#3e4650', neck: '#3a2f22' };
export function bakeSkeletonGuard() {
  const W = 30, H = 38, cx = 15, hip = 34;
  // the skull: pale bone, boxed BLACK eye sockets (not single pixels on gold) and a dark neck line so it does not
  // read as one gold block with the cuirass under it
  const skull = (g, x, y, lit) => { ellipse(g, x, y, 4, 3.6, SK.b); rect(g, x - 2, y + 2, 4, 2, SK.d); rect(g, x - 2, y + 3, 4, 1, SK.neck);
    rect(g, x - 2, y - 1, 2, 2, '#171210'); rect(g, x + 1, y - 1, 2, 2, '#171210'); px(g, x - 1, y - 1, lit ? SK.eye : SK.dim); px(g, x + 2, y - 1, lit ? SK.eye : SK.dim); px(g, x, y - 3, SK.m); };
  const F = frames(W, H, 7, (g, f) => {
    const ph = f === 1 ? 1 : 0;
    rect(g, cx - 3, hip - 12, 2, 12, SK.b); rect(g, cx + 1 + (ph ? 1 : 0), hip - 11, 2, 11, SK.m);
    rect(g, cx - 4, hip - 1, 3, 2, SK.goldD); rect(g, cx + 2, hip - 1, 3, 2, SK.goldD);
    // gold scale cuirass over ribs
    fillPoly(g, [[cx - 5, hip - 17], [cx + 5, hip - 17], [cx + 4, hip - 25], [cx - 4, hip - 25]], SK.gold);
    for (let y = hip - 24; y < hip - 17; y += 2) for (let x = cx - 4 + (((hip - 24 - y) / 2 | 0) % 2); x < cx + 4; x += 2) rect(g, x, y, 1, 1, SK.goldD);
    rect(g, cx - 4, hip - 25, 8, 1, SK.goldL);
    skull(g, cx, hip - 29, f !== 3);
    const sh = [cx + 5, hip - 22];
    if (f === 2 || f === 3) {   // SHIELD UP / GUARD DROPPED: a round gold shield on the near arm, lowered when dazzled
      const dy = f === 3 ? 4 : 0; line(g, cx - 5, hip - 22, cx - 8, hip - 16 + dy, SK.b, 2);
      circle(g, cx - 9, hip - 15 + dy, 5, f === 3 ? SK.shieldD : SK.shield); circle(g, cx - 9, hip - 15 + dy, 3, f === 3 ? SK.shieldD : SK.shieldL);
      if (f === 3) for (let k = 0; k < 3; k++) px(g, cx - 12 + k * 2, hip - 21 + dy - k, SK.shieldL);   // dazzled: light glancing off, the shield sagging
      line(g, sh[0], sh[1], cx + 12, hip - 6, SK.b, 2);
    } else if (f === 4) { line(g, sh[0], sh[1], cx + 4, hip - 34, SK.b, 2); rect(g, cx + 2, hip - 36, 2, 8, '#c9d1dc'); px(g, cx + 3, hip - 36, '#fff1c0'); line(g, cx - 5, hip - 22, cx - 8, hip - 17, SK.b, 2); }   // THRUST TELL: spear up, glinting
    else if (f === 5) { line(g, sh[0], sh[1], cx + 15, hip - 20, SK.b, 2); rect(g, cx + 13, hip - 21, 4, 1, '#c9d1dc'); line(g, cx - 5, hip - 22, cx - 8, hip - 17, SK.b, 2); }   // THRUST: level, driven out
    else { line(g, sh[0], sh[1], cx + 3, hip - 30, SK.b, 2); rect(g, cx + 1, hip - 32, 2, 7, '#c9d1dc'); line(g, cx - 5, hip - 22, cx - 8, hip - 16, SK.b, 2); circle(g, cx - 9, hip - 15, 5, SK.shield); circle(g, cx - 9, hip - 15, 3, SK.shieldL); }
    if (f === 6) skull(g, cx, hip - 29, false);   // hurt: the light in the sockets goes out
  });
  return pack(F, cx, H, 14, 26);
}

// ================= PRIEST OF THE KING (king's pyramid court) =================
// A person, not a box: a skull face inside a hood that reads darker than the robe body, and arms in a sleeve tone
// that contrasts with both, so they never blend into whatever they cross in front of.
const PK = { robe: '#4a4058', robeL: '#655a78', robeD: '#241f2e', robeS: '#150f1c', sleeve: '#726790',
  bone: '#dcd2ba', boneD: '#9c8f70', brass: '#a68840', brassL: '#d4b868', smoke: '#8a7fa0', eyeLit: '#9ae0ff' };
export function bakePriestOfKing() {
  const W = 24, H = 30, cx = 12, hip = 27;
  const F = frames(W, H, 6, (g, f) => {
    const ph = f === 1 ? 1 : 0;
    if (f === 2) {   // RE-WRAP: bent low over a fallen guard, both hands drawing linen back over it
      rect(g, cx - 9, hip - 1, 14, 2, LI.l); rect(g, cx - 9, hip - 1, 14, 1, LI.d);   // the body on the ground
      fillPoly(g, [[cx - 4, hip - 2], [cx + 6, hip - 2], [cx + 3, hip - 14], [cx - 6, hip - 12]], PK.robe);
      line(g, cx - 4, hip - 10, cx - 9, hip - 3, PK.sleeve, 2); line(g, cx + 2, hip - 12, cx + 6, hip - 3, PK.sleeve, 2);
      rect(g, cx - 9, hip - 4, 2, 2, PK.bone); rect(g, cx + 5, hip - 4, 2, 2, PK.bone);   // bone hands, gripping the linen
      ellipse(g, cx - 5, hip - 16, 2.6, 2.4, PK.bone); rect(g, cx - 6, hip - 17, 1, 2, '#171210');
      return; }
    // legs, just visible under the hem
    rect(g, cx - 3 + ph, hip - 3, 2, 3, PK.robeD); rect(g, cx + 1, hip - 3, 2, 3, PK.robeD);
    // the robe: hangs to the floor, widening at the hem — a shadowed side and vertical creases, not rings round a jar
    fillPoly(g, [[cx - 6, hip - 18], [cx + 6, hip - 18], [cx + 8, hip], [cx - 8, hip]], PK.robe);
    fillPoly(g, [[cx, hip - 18], [cx + 6, hip - 18], [cx + 8, hip], [cx + 2, hip]], PK.robeD);
    for (let k = 0; k < 3; k++) line(g, cx - 5 + k * 4, hip - 15, cx - 6 + k * 4, hip - 2, PK.robeS, 1);
    rect(g, cx - 8, hip - 1, 16, 2, PK.robeS);
    fillPoly(g, [[cx - 6, hip - 18], [cx, hip - 21], [cx + 6, hip - 18]], PK.robeL);
    // the arms, in a lighter sleeve tone so they never vanish into the robe or the censer
    const sh = [cx - 6, hip - 15], sh2 = [cx + 6, hip - 15];
    // the head: a hood a clear step darker than the robe, and inside it a bone skull, not a shadow
    const hx = cx, hy = hip - 22;
    fillPoly(g, [[hx - 5, hy + 3], [hx - 4, hy - 7], [hx, hy - 9], [hx + 4, hy - 6], [hx + 5, hy + 3], [hx + 2, hy + 4], [hx - 2, hy + 4]], PK.robeD);
    ellipse(g, hx, hy, 3, 2.8, PK.bone); rect(g, hx - 2, hy + 1, 4, 2, PK.boneD);
    rect(g, hx - 2, hy - 1, 2, 2, '#171210'); rect(g, hx + 1, hy - 1, 2, 2, '#171210');
    px(g, hx - 1, hy - 1, f === 3 || f === 4 ? XRED : PK.eyeLit); px(g, hx + 2, hy - 1, f === 3 || f === 4 ? XRED : PK.eyeLit);
    // the censer, swinging on its chain from the near hand
    if (f === 3) {   // CAST TELL: censer raised high, smoke gathering, both arms up — big and slow
      line(g, sh[0], sh[1], cx - 10, hip - 24, PK.sleeve, 2); line(g, sh2[0], sh2[1], cx + 10, hip - 24, PK.sleeve, 2);
      rect(g, cx - 12, hip - 27, 4, 3, PK.brass); px(g, cx - 12, hip - 27, PK.brassL);
      for (let k = 0; k < 4; k++) px(g, cx - 12 + (k % 2), hip - 29 - k, PK.smoke);
    } else if (f === 4) {   // CAST: arms thrown forward, a burst of grave-smoke released
      line(g, sh[0], sh[1], cx + 12, hip - 16, PK.sleeve, 2); line(g, sh2[0], sh2[1], cx + 13, hip - 12, PK.sleeve, 2);
      for (let k = 0; k < 6; k++) { const a = -0.3 + k * 0.25; px(g, cx + 13 + Math.cos(a) * k, hip - 14 + Math.sin(a) * k, k % 2 ? PK.smoke : XREDL); }
    } else {   // walk: censer swinging low at the side, the far arm at the robe
      const sw = ph ? 2 : -2; line(g, sh[0], sh[1], cx - 8 + sw, hip - 6, PK.sleeve, 2); rect(g, cx - 9 + sw, hip - 6, 3, 3, PK.brass); px(g, cx - 9 + sw, hip - 6, PK.brassL);
      line(g, sh2[0], sh2[1], cx + 9, hip - 7, PK.sleeve, 2);
    }
    if (f === 5) { px(g, hx - 1, hy - 1, PK.robeS); px(g, hx + 2, hy - 1, PK.robeS); }   // hurt: no light left in the hood
  });
  return pack(F, cx, H, 12, 21);
}

// ================= SHADOW THING (king's pyramid; a flyer) =================
const SD = { s: '#1c1830', S: '#302850', s2: '#100c22', eye: '#eaf6ff', eyeD: '#9fc4e0', flee: '#3a3358', burn: '#ff9a4c' };
export function bakeShadowThing() {
  const W = 18, H = 15;
  const wisp = (g, cx, cy, stretch, tail) => {
    fillPoly(g, [[cx - 5, cy], [cx - 3 - tail, cy - 3], [cx - 1, cy - 4 * stretch], [cx + 3, cy - 3], [cx + 5, cy], [cx + 2, cy + 3], [cx - 2, cy + 3]], SD.s);
    fillPoly(g, [[cx - 2, cy - 1], [cx - 1, cy - 3 * stretch], [cx + 1, cy - 2], [cx, cy + 1]], SD.S);
    for (let k = 0; k < 3; k++) px(g, cx - 6 - tail - k, cy + (k % 2), SD.s2);   // the tail trailing behind
  };
  const F = frames(W, H, 6, (g, f) => {
    const cx = 9, cy = 7;
    if (f === 5) {   // FLEEING/BURNING: caught in a beam, pulled thin and bright, coming apart
      wisp(g, cx, cy, 1.6, 1); for (let k = 0; k < 5; k++) px(g, cx - 2 + k, cy - 5 - k, SD.burn); px(g, cx, cy - 2, SD.burn); return; }
    if (f === 3) { wisp(g, cx, cy, 1.3, 2); px(g, cx + 3, cy - 1, XRED); px(g, cx + 4, cy - 1, XREDL); px(g, cx - 3, cy - 1, XRED); return; }   // LUNGE TELL: drawn long toward its mark, eyes flare red
    if (f === 4) { wisp(g, cx + 2, cy, 0.7, 5); px(g, cx + 5, cy, SD.eye); return; }   // LUNGE: compressed, shot forward
    const bob = [0, 1, 0][f % 3]; wisp(g, cx, cy - bob, 1, 1 + (f % 3));
    px(g, cx - 1, cy - 1 - bob, SD.eye); px(g, cx + 1, cy - 1 - bob, SD.eye);
  }, false);   // a flyer: frames hang from one box
  return pack(F, 9, H, 10, 10);
}

// ================= FALLEN PRIEST (sun temple: SNUFF a window) =================
// Once white-and-gold sun robes, gone the grey of ash: the base tone is lifted (was a near-black purple that read
// as a jar), a dark stain sits on the chest, and the arms are a sleeve tone that contrasts with the robe on either
// side of it — the old bug drew them the same colour as the robe, so they vanished.
const FP = { r: '#8c8796', R: '#a8a2b0', rd: '#5c5766', sleeve: '#6e6878', gold: '#a08a44', goldD: '#6b5a2c',
  skin: '#b09a86', skinD: '#7a6656', eye: '#3a3444', stain: '#302a38' };
export function bakeFallenPriest() {
  const W = 20, H = 27, cx = 10;
  const F = frames(W, H, 4, (g, f) => {
    const gy = 25, hip = gy - 2, ph = f === 1 ? 1 : 0, reach = f === 2;
    rect(g, cx - 3 + ph, hip - 3, 2, 3, FP.rd); rect(g, cx + 1, hip - 3, 2, 3, FP.rd);   // legs, under the hem
    fillPoly(g, [[cx - 5, hip - 17], [cx + 5, hip - 17], [cx + 6, hip], [cx - 6, hip]], FP.r);
    fillPoly(g, [[cx, hip - 17], [cx + 5, hip - 17], [cx + 6, hip], [cx + 1, hip]], FP.rd);   // the shadowed side
    for (let k = 0; k < 2; k++) line(g, cx - 4 + k * 5, hip - 14, cx - 5 + k * 5, hip - 2, FP.R, 1);   // creases
    rect(g, cx - 6 + ph, hip - 1, 12, 2, FP.rd);
    rect(g, cx - 2, hip - 9, 5, 4, FP.stain); px(g, cx - 1, hip - 9, FP.stain);          // the dark stain, low on the robe
    rect(g, cx - 2, hip - 21, 4, 5, FP.gold); rect(g, cx - 2, hip - 21, 4, 1, '#d8c068'); // the sash, once bright gold, gone dull
    const hx = cx, hy = hip - 23;
    ellipse(g, hx, hy, 3.4, 3.2, FP.skin); rect(g, hx - 2, hy - 4, 4, 2, FP.rd);
    px(g, hx - 1, hy - 1, FP.eye); px(g, hx + 1, hy - 1, FP.eye); rect(g, hx - 1, hy + 2, 2, 1, FP.skinD);   // a mouth line
    if (reach) {   // SNUFF: arms both thrown up toward a window, drawing the light out of the room — big, slow, unmistakable
      line(g, cx - 5, hip - 15, cx - 9, hip - 26, FP.sleeve, 2); line(g, cx + 5, hip - 15, cx + 9, hip - 26, FP.sleeve, 2);
      rect(g, cx - 10, hip - 28, 2, 2, FP.skin); rect(g, cx + 8, hip - 28, 2, 2, FP.skin);
      for (let k = 0; k < 3; k++) { px(g, cx - 9 - k, hip - 27 + k, XRED); px(g, cx + 9 + k, hip - 27 + k, XRED); }
    } else { line(g, cx - 5, hip - 15, cx - 8, hip - 6, FP.sleeve, 2); line(g, cx + 5, hip - 15, cx + 8 + (ph ? -1 : 1), hip - 6, FP.sleeve, 2); }
    if (f === 3) { px(g, hx - 1, hy - 1, FP.skinD); px(g, hx + 1, hy - 1, FP.skinD); }   // hurt: the eyes go dark
  });
  return pack(F, cx, H, 10, 21);
}

// ================= THE FALLEN HIGH PRIEST (boss, 4b) =================
// Tall and thin (never wider than ~22 px at the shoulders), a staff taller than he is, a sun-disc crown cracked in
// half over the hood, and dark tatters at the hem that trail smoke. The sleeves are a lighter violet than the robe
// body so the arms read as limbs, not more robe — the bug that sank the first pass.
const HP = { robe: '#241f38', robeL: '#3c3358', robeD: '#161228', robeS: '#0c0a18', sleeve: '#584a78', sleeveD: '#3c3358',
  shadow: '#120e22', tendril: '#2e2650', bone: '#dcd2ba', gold: '#a68840', goldL: '#e8c868', goldD: '#4e4020',
  eye: '#8fd6ff', eyeL: '#eaf6ff', flame: '#ff9a4c', flameL: '#ffe0a0' };
export function bakeFallenHighPriest() {
  const W = 46, H = 80, cx = 23, hip = 74;
  // a sun-disc, CRACKED: the two halves drawn a pixel apart across a bright seam, so "broken" reads even small
  const crackedDisc = (g, x, y, r, lit) => {
    for (let a = -Math.PI * 0.94; a < -0.06; a += 0.16) px(g, x + Math.cos(a) * r, y - 2 + Math.sin(a) * r, HP.goldL);
    for (let a = 0.06; a < Math.PI * 0.94; a += 0.16) px(g, x + Math.cos(a) * r, y + 2 + Math.sin(a) * r, HP.gold);
    px(g, x - r, y - 1, HP.robeS); px(g, x - r, y + 1, HP.robeS); px(g, x + r, y - 1, HP.robeS); px(g, x + r, y + 1, HP.robeS);   // the gap where the two halves no longer meet
    line(g, x - r * 0.85, y, x + r * 0.85, y, lit ? HP.flame : HP.robeS);
    if (lit) { px(g, x, y - 1, HP.flameL); px(g, x, y + 1, HP.flame); px(g, x - 2, y, HP.flameL); px(g, x + 2, y, HP.flame); }
  };
  // the staff: TALLER than him, straight up from the hand to a broken disc well above the crown
  const staffAt = (g, hx, hy, tx, ty, lit) => { thick(g, hx, hy, tx, ty, HP.goldD, 2); crackedDisc(g, tx, ty, 5, lit); };
  // the body, shared by every pose: `crouch` lowers the shoulders (GRASP), `sway` shifts the whole figure (walk),
  // `hoodTilt` tips the head back (OPEN). Returns the shoulder row and head centre so callers can hang arms off it.
  const body = (g, o = {}) => {
    const sway = o.sway || 0, crouch = o.crouch || 0, shY = hip - 34 + crouch;
    for (let i = 0; i < 5; i++) { const x = cx - 8 + i * 4, len = 5 + ((i * 3) % 4) + crouch * 0.4;   // tattered hem
      fillPoly(g, [[x, hip - 2], [x + 3, hip - 2], [x + 2, hip - 2 + len], [x + 1, hip - 2 + len]], i % 2 ? HP.robeD : HP.robe);
      if (o.smoke) for (let k = 0; k < 3; k++) px(g, x + 1 - (k > 1 ? 1 : 0), hip - 2 + len + k, HP.tendril); }
    ellipse(g, cx, hip - 1, 10, 3, HP.shadow);
    fillPoly(g, [[cx - 8 + sway, shY], [cx + 8 + sway, shY], [cx + 7, hip - 2], [cx - 7, hip - 2]], HP.robe);       // the robe: slender, tall
    fillPoly(g, [[cx - 8 + sway, shY], [cx - 1 + sway, shY], [cx - 2, hip - 6], [cx - 7, hip - 6]], HP.robeL);
    rect(g, cx - 3, hip - 16, 6, 2, HP.robeS);
    for (let k = 0; k < 3; k++) { const a = -0.7 + k * 0.6, x0 = cx + sway + Math.cos(a) * 8, y0 = shY + 6 + Math.sin(a) * 4; line(g, x0, y0, x0 + Math.cos(a) * 3, y0 - 4 - k, HP.tendril); }
    const hx = cx + sway, hy = shY - 10 + (o.hoodTilt || 0);
    fillPoly(g, [[hx - 5, hy + 4], [hx - 4, hy - 6], [hx, hy - 9], [hx + 4, hy - 5], [hx + 5, hy + 4], [hx + 2, hy + 5], [hx - 2, hy + 5]], HP.robe);
    if (o.burn) { fillPoly(g, [[hx - 3, hy - 2], [hx + 3, hy - 3], [hx + 3, hy + 1], [hx - 3, hy + 1]], HP.flame); px(g, hx - 1, hy - 1, HP.flameL); px(g, hx + 1, hy - 1, HP.flameL); }
    else { fillPoly(g, [[hx - 3, hy - 2], [hx + 3, hy - 3], [hx + 3, hy + 1], [hx - 3, hy + 1]], HP.robeS); const e = o.eyeLit ? HP.eyeL : HP.eye; px(g, hx - 2, hy - 1, e); px(g, hx + 2, hy - 1, e); }
    crackedDisc(g, hx, hy - 12, 6, false);                                                                         // the cracked sun-disc crown
    return { hx, hy, shY, cx2: cx + sway };
  };
  const F = frames(W, H, 13, (g, f) => {
    if (f === 11) {   // OPEN: the SAME figure, staggered in the beam — not a different silhouette
      const crouch0 = 3, hy0 = hip - 34 + crouch0 - 10;
      rect(g, cx - 3, hy0 - 10, 6, hip - (hy0 - 10), HP.flameL);   // the beam, sized to him: floor to well above the crown
      const { hx, hy, shY, cx2 } = body(g, { crouch: crouch0, burn: true, smoke: true });
      for (let k = 0; k < 8; k++) { const y = hip - 6 - k * 4; px(g, cx - 6 + (k % 3), y, HP.flame); px(g, cx + 6 - (k % 3), y, HP.flameL); }
      line(g, cx2 - 7, shY + 2, cx2 - 13, shY + 12, HP.sleeve, 2); line(g, cx2 + 7, shY + 2, cx2 + 13, shY + 12, HP.sleeve, 2);   // arms hanging slack
      staffAt(g, cx2 + 13, shY + 12, cx2 + 17, shY + 18, false); return; }
    const ph = f === 1 ? 1 : f === 2 ? -1 : 0, crouch = f === 7 || f === 8 ? 8 : 0, hoodTilt = f === 9 || f === 10 ? -2 : 0;
    const { hx, hy, shY, cx2 } = body(g, { sway: ph, crouch, hoodTilt, eyeLit: f === 9 || f === 10 });
    const sh = [cx2 - 8, shY + 4], sh2 = [cx2 + 8, shY + 4];
    if (f === 3) {   // BOLT TELL: the staff thrown straight up, well above the crown — the tallest silhouette he makes
      line(g, sh[0], sh[1], cx2 - 4, shY - 14, HP.sleeve, 2); staffAt(g, cx2 - 4, shY - 14, cx2 - 1, shY - 30, true);
      line(g, sh2[0], sh2[1], cx2 + 10, shY + 12, HP.sleeve, 2);
    } else if (f === 4) {   // BOLT: the staff levelled and thrust out, a bolt away from the tip
      line(g, sh[0], sh[1], cx2 + 12, shY + 2, HP.sleeve, 2); staffAt(g, cx2 + 12, shY + 2, cx2 + 26, shY - 2, false);
      for (let k = 0; k < 5; k++) px(g, cx2 + 28 + k * 3, shY - 2, HP.flame);
      line(g, sh2[0], sh2[1], cx2 + 11, shY + 14, HP.sleeve, 2);
    } else if (f === 5) {   // SWEEP TELL: staff drawn back and held LOW, near the ground — a wide, low silhouette
      line(g, sh[0], sh[1], cx2 - 16, shY + 20, HP.sleeve, 2); staffAt(g, cx2 - 16, shY + 20, cx2 - 24, shY + 24, false);
      line(g, sh2[0], sh2[1], cx2 + 10, shY + 14, HP.sleeve, 2);
      for (let k = 0; k < 3; k++) px(g, cx2 + 6 + k * 3, shY - 8 - k, HP.tendril);
    } else if (f === 6) {   // SWEEP: swept low in a wide arc, dark dust kicked along the floor
      line(g, sh[0], sh[1], cx2 + 18, shY + 24, HP.sleeve, 2); staffAt(g, cx2 + 18, shY + 24, cx2 + 26, shY + 22, false);
      for (let k = 0; k < 8; k++) px(g, cx2 - 8 + k * 4, hip - 4, XREDL);
      line(g, sh2[0], sh2[1], cx2 + 9, shY + 13, HP.sleeve, 2);
    } else if (f === 7) {   // GRASP TELL: he crouches, one hand pressed to the floor — a red patch, unmissable
      line(g, sh[0], sh[1], cx2 - 10, hip - 4, HP.sleeve, 3); rect(g, cx2 - 13, hip - 5, 6, 3, HP.shadow);
      for (let k = 0; k < 3; k++) { px(g, cx2 - 13 + k * 2, hip - 4, XRED); px(g, cx2 - 12 + k * 2, hip - 3, XREDL); }
      line(g, sh2[0], sh2[1], cx2 + 12, shY + 14, HP.sleeve, 2); staffAt(g, cx2 + 12, shY + 14, cx2 + 16, shY + 4, false);
    } else if (f === 8) {   // GRASP: the hand closes, low, crouched
      line(g, sh[0], sh[1], cx2 - 4, hip - 8, HP.sleeve, 3); rect(g, cx2 - 6, hip - 10, 3, 3, HP.bone);
      line(g, sh2[0], sh2[1], cx2 + 12, shY + 14, HP.sleeve, 2); staffAt(g, cx2 + 12, shY + 14, cx2 + 16, shY + 4, false);
    } else if (f === 9) {   // SNUFF TELL: both arms flung up toward a window — the tallest reach besides BOLT
      line(g, sh[0], sh[1], cx2 - 13, shY - 16, HP.sleeve, 3); line(g, sh2[0], sh2[1], cx2 + 12, shY - 16, HP.sleeve, 3);
      for (let k = 0; k < 3; k++) { px(g, cx2 - 13 - k, shY - 16 - k, XRED); px(g, cx2 - 12 - k, shY - 17 - k, XREDL); px(g, cx2 + 12 + k, shY - 16 - k, XRED); px(g, cx2 + 13 + k, shY - 17 - k, XREDL); }
    } else if (f === 10) {   // SNUFF: the light drawn back down and in, both hands at the chest
      line(g, sh[0], sh[1], cx2 - 2, shY + 6, HP.sleeve, 2); line(g, sh2[0], sh2[1], cx2 + 4, shY + 6, HP.sleeve, 2);
      for (let k = 0; k < 4; k++) px(g, cx2 - k, shY - 6 + k, HP.tendril);
    } else if (f === 12) {   // hurt: staggered, the staff dipped, the light in the hood guttering
      line(g, sh[0], sh[1], cx2 - 14, shY + 16, HP.sleeve, 2); staffAt(g, cx2 - 14, shY + 16, cx2 - 20, shY + 20, false);
      line(g, sh2[0], sh2[1], cx2 + 10, shY + 14, HP.sleeve, 2); px(g, hx - 2, hy - 1, HP.robeS); px(g, hx + 2, hy - 1, HP.robeS);
    } else {   // idle / walk: staff planted at his side, taller than he is
      line(g, sh[0], sh[1], cx2 - 9, shY + 20, HP.sleeve, 2); staffAt(g, cx2 - 9, shY + 20, cx2 - 12, shY - 12, false);
      line(g, sh2[0], sh2[1], cx2 + 10, shY + 14, HP.sleeve, 2);
    }
  });
  return pack(F, cx, H, 16, 50);
}
/* THE GRASP / SNUFF floor mark: hands rising from a dark tile, 0 low .. 2 nearly out. A prop, not a creature: no L/R. */
export function bakeShadowHands() {
  const W = 20, H = 14;
  return frames(W, H, 3, (g, f) => {
    const rise = f * 3;
    rect(g, 2, 12, 16, 2, HP.shadow);
    for (const dx of [-4, 3]) { for (let k = 0; k < 6 + rise; k++) { const y = 12 - k; if (y < 0) break; px(g, 10 + dx + (k > 7 ? 1 : 0), y, k > 8 ? HP.bone : HP.robe); }
      if (rise > 3) { px(g, 10 + dx - 1, 12 - (6 + rise), HP.bone); px(g, 10 + dx + 2, 12 - (6 + rise) + 1, HP.bone); } }
  });
}
/* THE SHADOW BOLT, in flight: 3 frames of flicker, { R, L } (it travels, so it needs a direction). */
export function bakeShadowBolt() {
  const R = frames(14, 8, 3, (g, f) => {
    ellipse(g, 5, 4, 4 + (f % 2), 2.4, HP.tendril); ellipse(g, 6, 4, 3, 1.8, HP.robeL);
    for (let k = 0; k < 4; k++) px(g, 1 - k, 4 + (k % 2 ? 1 : -1), HP.shadow);
  }, false);
  return { R, L: R.map(flipX) };
}

// ================= THE EMBALMER (mini, sealed pyramid) =================
// A gaunt tomb-keeper, not a plain man: a hunched back, arms so long the hands hang near his knees, a linen-wrapped
// head with only the eyes showing, a stained leather apron, a hook on the end of a long pole (not a stretched bare
// arm), and a copper basin at his belt.
const EM = { robe: '#3e3428', robeL: '#5c4e38', robeD: '#241e16', skin: '#8a6a52', skinD: '#5e4432',
  leather: '#5c3a24', leatherL: '#7a5232', leatherD: '#3a2416', stain: '#241812',
  pole: '#6e5a40', hook: '#8a8478', hookL: '#c8c2b4', copper: '#b87333', copperL: '#e0955a', copperD: '#7a4a20',
  fluid: '#8fae3e', fluidL: '#c8e070', eye: '#f0d060' };
export function bakeEmbalmer() {
  const W = 50, H = 47, cx = 24;
  // the arm: skin to a wrist, then (poled) a long thin haft carrying the hook well past the hand
  const arm = (g, x0, y0, x1, y1, poled) => { thick(g, x0, y0, (x0 + x1) / 2, (y0 + y1) / 2 + 2, EM.skin, 2); thick(g, (x0 + x1) / 2, (y0 + y1) / 2 + 2, x1, y1, EM.skinD, 2);
    if (poled) { const a = Math.atan2(y1 - y0, x1 - x0), px2 = x1 + Math.cos(a) * 8, py2 = y1 + Math.sin(a) * 8; thick(g, x1, y1, px2, py2, EM.pole, 1);
      for (let k = 0; k < 5; k++) { const t = k / 5, hx = px2 + Math.cos(a + t * 1.7) * 5, hy = py2 + Math.sin(a + t * 1.7) * 5; px(g, hx, hy, EM.hook); } px(g, px2, py2, EM.hookL); } };
  const F = frames(W, H, 10, (g, f) => {
    if (f === 8) {   // OPEN: drenched, blinded, clawing at his face — the opening the player made
      const gy = 45, hip = gy - 3; rect(g, cx - 8, hip - 20, 16, 24, EM.robe); rect(g, cx - 8, hip - 20, 16, 3, EM.fluidL);
      for (let i = 0; i < 8; i++) px(g, cx - 8 + i * 2, hip - 20 - (i % 3), EM.fluid);
      fillPoly(g, [[cx - 5, hip - 24], [cx + 5, hip - 24], [cx + 4, hip - 16], [cx - 4, hip - 16]], LI.l);
      arm(g, cx - 5, hip - 18, cx - 2, hip - 22, false); arm(g, cx + 5, hip - 18, cx + 2, hip - 22, false);
      rect(g, cx - 8, hip - 6, 16, 6, EM.leatherD); rect(g, cx - 3, hip, 3, 5, EM.skinD); rect(g, cx + 1, hip, 3, 5, EM.skin);
      return; }
    const gy = 45, hip = gy - 3, ph = f === 1 ? 1 : 0;
    rect(g, cx - 4, hip - 14, 3, 14, EM.robe); rect(g, cx + 1 + (ph ? 2 : 0), hip - 14, 3, 14, EM.robeD);
    rect(g, cx - 5, hip - 1, 4, 2, EM.robeD); rect(g, cx + 2 + (ph ? 2 : 0), hip - 1, 4, 2, EM.robeD);
    // the torso, HUNCHED: the spine bulges out behind (left), the chest drops away in front — not a straight column
    fillPoly(g, [[cx - 9, hip - 13], [cx - 2, hip - 30], [cx + 2, hip - 32], [cx + 6, hip - 22], [cx + 5, hip - 13]], EM.robe);
    fillPoly(g, [[cx - 9, hip - 13], [cx - 6, hip - 24], [cx - 2, hip - 30], [cx - 4, hip - 15]], EM.robeD);   // the hump of the hunch, in shadow
    rect(g, cx - 6, hip - 29, 8, 1, EM.robeL);
    // the leather apron, stained, over the front
    rect(g, cx - 4, hip - 20, 9, 15, EM.leather); rect(g, cx - 4, hip - 20, 9, 2, EM.leatherL); rect(g, cx - 4, hip - 6, 9, 1, EM.leatherD);
    ellipse(g, cx + 1, hip - 11, 2.4, 2, EM.stain); px(g, cx + 3, hip - 8, EM.stain);
    // the copper basin, at his belt
    ellipse(g, cx - 11, hip - 12, 4, 3, EM.copper); rect(g, cx - 13, hip - 14, 5, 2, EM.copperL); px(g, cx - 9, hip - 10, EM.copperD);
    // the head: wound in linen, only the eyes showing — no face
    const hx = cx - 1, hy = hip - 36;
    ellipse(g, hx, hy, 3.6, 3.4, LI.l);
    line(g, hx - 3, hy - 2, hx + 3, hy - 1, LI.d, 1); line(g, hx - 3, hy + 2, hx + 3, hy + 2, LI.D, 1);
    rect(g, hx - 3, hy - 1, 2, 1, EM.eye); rect(g, hx + 1, hy - 1, 2, 1, EM.eye);
    for (let k = 0; k < 2; k++) px(g, hx + 4 + k, hy - 4 + k, LI.d);   // a loose end, trailing off the wrap
    const sh = [cx + 5, hip - 24];
    if (f === 2) { arm(g, ...sh, cx + 20, hip - 17, true); }                                             // HOOK TELL: the pole drawn back, hook lit at reach
    else if (f === 3) { arm(g, ...sh, cx + 24, hip - 10, true); px(g, cx + 24, hip - 10, EM.hookL); }    // HOOK: the reach, out to its full length
    else if (f === 4) { arm(g, ...sh, cx + 12, hip - 32, false); const [jx, jy] = [cx + 12, hip - 34]; ellipse(g, jx, jy, 2, 3, '#8a6a44'); px(g, jx, jy - 3, XREDL); }   // JAR TELL: raised overhead
    else if (f === 5) { arm(g, ...sh, cx + 20, hip - 9, false); for (let k = 0; k < 5; k++) px(g, cx + 22 + k * 2, hip - 9 + (k % 2), XRED); }   // JAR THROW: arm swept out, releasing
    else if (f === 6) { arm(g, ...sh, cx + 10, hip - 5, false); arm(g, cx - 6, hip - 22, cx - 15, hip - 6, false); for (let k = 0; k < 3; k++) px(g, cx - 3 + k * 5, hip - 6, XREDL); }   // WRAP TELL: both long arms wide, gathering linen
    else if (f === 7) { arm(g, ...sh, cx + 15, hip - 3, false); arm(g, cx - 6, hip - 22, cx - 1, hip - 1, false); for (let k = 0; k < 4; k++) rect(g, cx - 6 + k * 4, hip - 2, 3, 2, LI.l); }   // WRAP: linen thrown round the target
    else { arm(g, ...sh, cx + 7, hip - 9, false); arm(g, cx - 6, hip - 22, cx - 8, hip - 8, false); }   // walk: both very long arms hanging near the knees
    if (f === 9) { rect(g, hx - 3, hy - 1, 2, 1, LI.D); rect(g, hx + 1, hy - 1, 2, 1, LI.D); }   // hurt: the eyes shut
  });
  return pack(F, cx, H, 18, 38);
}
/* THE JAR IN FLIGHT (2-frame spin, { R, L }) and its SPLASH where it breaks (3 frames, spreading and fading). */
export function bakeEmbalmerJar() {
  const jar = frames(10, 12, 2, (g, f) => { ellipse(g, 5, 7 + (f ? 1 : 0), 3, 4, '#8a6a44'); rect(g, 3, 2 + (f ? 1 : 0), 4, 3, '#8a6a44'); rect(g, 3, 1 + (f ? 1 : 0), 4, 1, '#c8a878'); px(g, 6, 6, EM.fluidL); }, false);
  const splash = frames(28, 10, 3, (g, f) => { const r = 6 + f * 5; ellipse(g, 14, 8, r, 2 + f, f === 0 ? EM.fluidL : EM.fluid);
    for (let k = 0; k < 6; k++) px(g, 14 - r + k * (r * 2 / 6), 7 - f - (k % 2), EM.fluidL); }, false);
  return { jar: { R: jar, L: jar.map(flipX) }, splash };
}

// ================= THE SCARAB MOTHER (boss, sealed pyramid) =================
// A beetle, not a turtle: a TALL domed glossy shell with a split down the wing cases, a pronotum plate behind the
// head, a curved horn and big mandibles, antennae, and six jointed spindly legs SPLAYED out to the sides (a
// two-segment >< silhouette), never straight thick pillars.
const SM = { shell: '#141c10', shellL: '#3a5a1e', shellD: '#0a0e08', gloss: '#5aa860', iri: '#4fd0b0',
  gold: '#c9a840', goldL: '#e8ca70', leg: '#242e16', legL: '#3e5024', legD: '#0c1006', horn: '#c9a840',
  mand: '#7a6a3a', mandL: '#b8a860', eye: '#ff5030', acid: '#c8e070', acidD: '#7a8f30', dust: '#e2bb7a', dustL: '#f2d79c', dustD: '#bf8f63' };
export function bakeScarabMother() {
  const W = 96, H = 64, cx = 48;
  // a two-segment leg, splayed OUT from the body: hip -> a joint kicked out to the side -> a foot back under her.
  // `dir` -1 splays toward the tail, 0 straight down and slightly out, 1 splays toward the head — spindly (1-2 px).
  const legAt = (g, bx, by, gy, dir) => {
    const kx = bx + dir * 14, ky = by + (gy - by) * 0.4;
    const fx = bx + dir * 7, fy = gy;
    thick(g, bx, by, kx, ky, SM.leg, 2); thick(g, kx, ky, fx, fy, SM.legL, 1);
    px(g, kx, ky, SM.legD); px(g, fx, fy, SM.legD);
  };
  const shellAt = (g, x0, x1, y, open) => {
    const midx = (x0 + x1) / 2, topY = y - 25;                                   // TALL and domed, not flat and wide
    fillPoly(g, [[x0, y], [x0 + 5, y - 18], [midx, topY], [x1 - 5, y - 18], [x1, y]], SM.shell);
    fillPoly(g, [[x0 + 7, y - 4], [x0 + 12, y - 17], [midx, topY + 2], [x1 - 12, y - 17], [x1 - 7, y - 4]], SM.shellL);
    const gap = open ? 5 : 1;                                                    // the wing cases: always split, wider when open
    line(g, midx - gap, topY + 1, midx - gap, y - 2, SM.shellD, 1); line(g, midx + gap, topY + 1, midx + gap, y - 2, SM.shellD, 1);
    if (open) for (let k = 0; k < 4; k++) { px(g, midx - 7 - k * 4, y - 12, SM.gold); px(g, midx + 7 + k * 4, y - 12, SM.gold); }
    for (let k = 0; k < 6; k++) { const t = k / 5, sx = x0 + 8 + t * (x1 - x0 - 16), sy = y - 16 + Math.round(Math.abs(t - 0.5) * 10); px(g, sx, sy, k % 2 ? SM.gold : SM.iri); }   // gold/iridescent streaks
    px(g, x0 + 10, y - 6, SM.gloss);
    ellipse(g, x1 - 11, y - 18, 7, 5, SM.shellD); ellipse(g, x1 - 11, y - 19, 5, 3, SM.shell);   // the pronotum, a smaller plate behind the head
    line(g, x1 - 16, y - 18, x1 - 6, y - 18, SM.gold);
  };
  const headAt = (g, x, y, open, spit) => {
    ellipse(g, x, y, 8, 6.4, SM.shell); ellipse(g, x - 2, y - 2, 5.5, 3.6, SM.shellL);
    for (let k = 0; k < 6; k++) { const t = k / 5; px(g, x + 3 + t * 7, y - 5 - t * t * 7, SM.horn); }            // the horn, curving up off the front
    fillPoly(g, [[x + 5, y - 2], [x + 15, y - 6 - (open ? 3 : 0)], [x + 14, y - 2], [x + 6, y + 1]], SM.mand);    // the mandibles, big and curved
    fillPoly(g, [[x + 5, y + 2], [x + 14, y + 5 + (open ? 3 : 0)], [x + 12, y + 7], [x + 6, y + 5]], SM.mandL);
    if (spit) { px(g, x + 14, y, SM.acid); px(g, x + 16, y - 1, SM.acidD); }
    for (const s of [-1, 1]) { let ax = x - 2, ay = y - 5; for (let k = 0; k < 4; k++) { px(g, ax - k, ay - k * 0.7 + s * k * 0.5, SM.leg); } }   // antennae, thin, curling back
    px(g, x - 2, y - 3, SM.eye); px(g, x + 2, y - 3, SM.eye);
  };
  const F = frames(W, H, 13, (g, f) => {
    if (f === 9 || f === 10) {   // BURROW TELL / BURROW: sinking into the sand, a hump left to mark her
      const gy = 62, sink = f === 9 ? 8 : 24;
      for (let x = 6; x < 90; x++) { const h = 4 + Math.round(3 * Math.sin(x * 0.1)); for (let y = gy - h; y < gy; y++) px(g, x, y, y === gy - h ? SM.dustL : SM.dust); }
      shellAt(g, 30, 76, gy - sink, false); if (f === 9) headAt(g, 78, gy - sink - 8, false, false);
      for (let k = 0; k < 6; k++) px(g, 20 + k * 8, gy - sink - 16 - (k % 2), SM.dustL);
      return; }
    if (f === 11) {   // OPEN: pinned under a fallen block, darts in her flank — the opening
      const gy = 62, y = gy - 25;
      const dirs = [1, 0, -1]; for (let i = 0; i < 3; i++) legAt(g, 32 + i * 20, y + 17, gy, dirs[i]);
      shellAt(g, 26, 82, y + 19, false); headAt(g, 84, y + 8, false, false);
      rect(g, 30, y - 12, 40, 16, '#8a8478'); rect(g, 30, y - 12, 40, 3, '#c8c2b4');   // the fallen block, across her shell
      for (let k = 0; k < 4; k++) { line(g, 22 + k * 16, y + 4, 30 + k * 16, y - 4, SM.mandL); px(g, 22 + k * 16, y + 4, SM.mandL); }   // dart shafts, if it's the dart trap instead
      return; }
    const gy = 62, y = gy - 25 + (f === 3 || f === 4 ? -4 : 0), ph = f === 1 ? 1 : f === 2 ? -1 : 0;
    // six legs, splayed: a forward one, a middle one, a rearward one, near side shown
    const dirs = [1, 0, -1]; for (let i = 0; i < 3; i++) legAt(g, 32 + i * 20 + ph * 2, y + 17, gy, dirs[i]);
    shellAt(g, 22, 82, y + 19, f === 7 || f === 8);
    headAt(g, 84, y + 6, f === 5 || f === 6, f === 6);
    if (f === 3) { for (let k = 0; k < 5; k++) px(g, 18 - k * 3, y + 15 - (k % 2), XRED); }                        // CHARGE TELL: braced, low, a red line ahead of her
    else if (f === 4) { for (let k = 0; k < 8; k++) px(g, 90 - k * 4, y + 15, SM.dust); }                          // CHARGE: sand kicked up behind the rush
    else if (f === 7) { for (let k = 0; k < 5; k++) { const a = -0.6 + k * 0.3; px(g, 60 + Math.cos(a) * 22, y + 12 + Math.sin(a) * 8, BANGL); } }   // SWARM TELL: the shell lifted apart, light in the gap
    else if (f === 8) { for (let k = 0; k < 10; k++) { const bx = 15 + k * 7; ellipse(g, bx, gy - 2, 2, 1.4, SM.shell); px(g, bx, gy - 3, SM.gold); } }   // SWARM: beetles pouring out along the floor
    else if (f === 6) { for (let k = 0; k < 4; k++) px(g, 92 + k * 3, y + 8 + k, SM.acid); px(g, 92, y + 8, SM.acidD); }   // SPIT: an arc released
  });
  return pack(F, cx, H, 68, 46);
}
/* THE SAND HUMP marker: two frames, a slow breathing mound over where she's burrowed. And the ACID GLOB, in flight. */
export function bakeScarabFX() {
  const hump = frames(24, 8, 2, (g, f) => { const h = 4 + f; for (let x = 2; x < 22; x++) { const yy = 8 - h + Math.round(Math.sin((x - 2) / 20 * Math.PI) * h * 0.6); for (let y = yy; y < 8; y++) px(g, x, y, y === yy ? SM.dustL : SM.dust); }
    for (let k = 0; k < 3; k++) px(g, 8 + k * 4, 8 - h - 1, SM.dustD); });
  const glob = frames(10, 9, 2, (g, f) => { ellipse(g, 5, 5, 3 + (f ? 0.5 : 0), 3, SM.acid); px(g, 4, 4, '#e8f4b0'); for (let k = 0; k < 3; k++) px(g, 5 - k, 8 + (k % 2), SM.acidD); }, false);
  return { hump, glob: { R: glob, L: glob.map(flipX) } };
}
