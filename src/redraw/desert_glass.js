// desert_glass.js — creatures and bosses for THE GLASS SEA (level 4) and THE BURIED CITY (level 5), BRACKEN's desert arc.
// Not wired in: the level/boss batches add the spawn cases, frame tables, bestiary rows and the rest of A8's wiring
// points. px.js primitives only, so tools/desert-glass-art.mjs can render every frame in Node and look at them. The
// contract is desert_foes.js's / shore.js's: every frame faces RIGHT (L is the flip), every frame of a sprite shares one
// canvas, ax is the body's centre column, ay is the row under the lowest pixel (the same in every frame), w/h is the hit
// box. Tells follow the house marks: '!' yellow (the shield turns it), the red X (move); a tell's pose is always bigger
// and slower to read than the blow it warns of. Designs: docs/briefs/glass-sea.md, docs/briefs/buried-city.md. Attack
// tables: src/desert-bosses.js (COLOSSUS, STALKER, HOURGLASS_KING, SAND_WARDEN).
//
// bakeGlassScorpion() GLASS SCORPION  0,1 walk | 2 CLAW TELL (!, pincers up and open) | 3 CLAW (snapped forward) |
//                      4 STING TELL (X, tail cocked high, the barb lit) | 5 STING (tail over the head) | 6 hurt. The
//                      scorpion's kit re-cut in pale green-white glass: faceted highlight streaks on every segment, a
//                      brittle shine instead of a chitin sheen.
// bakeShard()          THE SHARD (a hazard, left standing in the sand by a STING that lands)  0,1 the sliver, its facet
//                      catching the light a pixel brighter on frame 1
// bakeNightHunter()    NIGHT HUNTER  0,1 prowl (a low crouching lope) | 2 POUNCE TELL (X, coiled low, eyes lit red) |
//                      3 POUNCE (lunged flat, limbs thrown wide) | 4 FROZEN (upright and rigid, an arm shielding the
//                      eyes — firelight stops it dead) | 5 hurt
// bakeSandDrowned()    SAND-DROWNED CITIZEN  0 buried (a hand and a head in the drift) | 1 rising (shouldering up
//                      through it, sand pouring off) | 2,3 shamble | 4 GRAB TELL (!, both arms flung wide) | 5 GRAB
//                      (arms closed in front) | 6 hurt
// bakeConstruct()      CLOCKWORK CONSTRUCT  0,1 walk | 2 POKE TELL (!, halberd drawn back and up) | 3 POKE (thrust
//                      low) | 4 WOUND DOWN (slumped forward, the lens dark, the key still in its back — the level uses
//                      it as a step) | 5 hurt
// bakeStalker()        THE GLASS STALKER (mini)  0,1 walk | 2 CLAW TELL (!) | 3 CLAW | 4 STING TELL (X) | 5 STING |
//                      6 TAIL TELL (X) | 7 TAIL (the low sweep) | 8 OPEN (its sting stuck fast in a glass overhang
//                      above it, cracked round the wound) | 9 hurt. A scorpion the size of a wagon, ~64 px nose to tail.
// bakeColossus()       THE GLASS COLOSSUS (boss)  0 idle | 1,2 walk | 3 LANCE TELL (X, chest gathering light) |
//                      4 LANCE (the beam let go) | 5 STOMP TELL (!) | 6 STOMP | 7 SHARDS TELL (!) | 8 SHARDS (glass off
//                      the shoulders) | 9 SWARM TELL (X, night: fist raised) | 10 SWARM (fist into the ground) |
//                      11 OPEN (its chest cracked by its own reflected lance) | 12 hurt | 13 NIGHT idle | 14,15 NIGHT
//                      walk (dark glass, only the veins faintly lit)
// bakeSunLance()       2 frames, a horizontal beam segment (no facing: the level scales/tiles it along the lance's line)
// bakeShelf()          a mirror-bright glass shelf, ~32 px, static
// bakeSandWarden()     THE SAND WARDEN (mini)  0,1 walk | 2 SLAM TELL (!) | 3 SLAM | 4 HALBERD TELL (X) | 5 HALBERD
//                      (the lunge-sweep) | 6 THROW TELL (!) | 7 THROW (sand) | 8 OPEN (pinned knee-deep in rising
//                      sand) | 9 hurt. Packed sand bound up in brass plates.
// bakeHourglassKing(sandLevel) THE HOURGLASS KING (boss; sandLevel 0 full / 1 half / 2 near-empty, drawn in the
//                      hourglass chest in every frame — default 0)  0 idle | 1,2 walk | 3 STREAM TELL (X, sceptre
//                      raised to the roof) | 4 STREAM | 5 GEAR TELL (!) | 6 GEAR (the toss) | 7 SLIP TELL (X, a
//                      ghostly afterimage) | 8 SLIP | 9 PENDULUM TELL (!) | 10 PENDULUM (the sweep) | 11 OPEN
//                      (STALLED: the glass empty, frozen mid-gesture) | 12 TURNING OVER (himself inverted) | 13 hurt
// bakeCog()            2 frames, a spinning brass cog (GEAR's projectile)
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
const thick = (g, x0, y0, x1, y1, col, w = 2) => { for (let k = 0; k < w; k++) line(g, x0 + (Math.abs(y1 - y0) > Math.abs(x1 - x0) ? k : 0), y0 + (Math.abs(y1 - y0) > Math.abs(x1 - x0) ? 0 : k), x1 + (Math.abs(y1 - y0) > Math.abs(x1 - x0) ? k : 0), y1 + (Math.abs(y1 - y0) > Math.abs(x1 - x0) ? 0 : k), col); };

// ================= GLASS SCORPION =================
/* the scorpion's own kit (desert_foes.js), re-cut in glass: the same body plan so the two read as kin, but pale
   green-white with a facet-highlight streak laid into every segment instead of the warm chitin shading. */
const GS = { a: '#bfe0cf', A: '#e8f7ee', d: '#8fbfa0', D: '#4f7a63', l: '#f5fff9', leg: '#7aa88f', barb: '#2a4a3a', red: '#e04030', redL: '#ff8a5c', eye: '#132018' };
export function bakeGlassScorpion() {
  const W = 34, H = 20, gy = 18;
  const body = (g, dy = 0) => { for (let s = 0; s < 4; s++) { const x = 11 + s * 4; ellipse(g, x, gy - 5 + dy, 3.4, 2.6, s % 2 ? GS.a : GS.A); rect(g, x - 2, gy - 8 + dy, 3, 1, GS.l); px(g, x + 1, gy - 6 + dy, GS.l); }
    ellipse(g, 26, gy - 5 + dy, 3.6, 2.8, GS.A); px(g, 27, gy - 7 + dy, GS.eye); px(g, 28, gy - 7 + dy, GS.eye); rect(g, 10, gy - 3 + dy, 18, 1, GS.d); px(g, 14, gy - 4 + dy, GS.l); px(g, 20, gy - 4 + dy, GS.l); };
  const legs = (g, ph) => { for (let i = 0; i < 4; i++) { const x = 12 + i * 4, k = (i + ph) % 2 ? 1 : -1; line(g, x, gy - 4, x - 2 + k, gy - 1, GS.leg); px(g, x - 2 + k, gy - 1, GS.D); } };
  const claw = (g, ox, oy, open) => { line(g, 27, gy - 5, ox - 3, oy, GS.a); ellipse(g, ox, oy, 2.6, 1.8, GS.A); px(g, ox - 1, oy - 1, GS.l); line(g, ox + 1, oy - 1, ox + 4, oy - 1 - open, GS.a); line(g, ox + 1, oy + 1, ox + 4, oy + 1 + open, GS.d); };
  /* the tail: five segments from the rump (x 8) curling up and forward; `cock` 0 low .. 1 high, `strike` flings it over */
  const tail = (g, cock, strike, lit) => { let x = 8, y = gy - 6; const pts = [];
    for (let s = 0; s < 5; s++) { const a = Math.PI * (0.95 - s * (0.18 + cock * 0.05) - strike * s * 0.1); x += Math.cos(a) * 3.2; y -= Math.abs(Math.sin(a)) * (2.6 + cock * 1.2); pts.push([x, y]); }
    pts.forEach(([tx, ty], i) => { ellipse(g, tx, ty, 1.9 - i * 0.12, 1.7 - i * 0.1, i % 2 ? GS.a : GS.A); if (i === 2) px(g, tx, ty - 1, GS.l); });
    const [bx, by] = pts[4]; line(g, bx, by, bx + 2 + strike * 2, by + 2, lit ? GS.red : GS.barb); if (lit) { px(g, bx + 2, by + 1, GS.redL); px(g, bx + 3 + strike * 2, by + 2, GS.redL); } };
  const F = frames(W, H, 7, (g, f) => {
    const dy = f === 6 ? 1 : 0;
    tail(g, f === 4 ? 1 : f === 5 ? 0.6 : 0.35, f === 5 ? 1 : 0, f === 4 || f === 5);
    legs(g, f === 1 ? 1 : 0); body(g, dy);
    if (f === 2) { claw(g, 30, gy - 11, 2); }                     // CLAW TELL: up and open
    else if (f === 3) { claw(g, 32, gy - 6, 0); }                 // CLAW: snapped forward, shut
    else claw(g, 30, gy - 6, f === 6 ? 2 : 1);
  });
  return pack(F, 18, H, 16, 9);
}

// ================= THE SHARD =================
export function bakeShard() {
  const W = 12, H = 10, gy = 9;
  const F = frames(W, H, 2, (g, f) => {
    rect(g, 1, gy - 1, 10, 1, GS.D);                                                            // the sand it stands in
    fillPoly(g, [[6, gy - 8], [8, gy - 4], [9, gy - 2], [5, gy - 1], [3, gy - 3]], GS.a);         // a jagged upright sliver, not a drop
    fillPoly(g, [[6, gy - 8], [7, gy - 4], [6, gy - 2]], GS.A);
    px(g, 8, gy - 3, GS.D);
    px(g, 6, gy - 6, f === 1 ? GS.l : GS.A);
  });
  return pack(F, 6, H, 8, 7);
}

// ================= NIGHT HUNTER =================
/* pale, thin, long-limbed - a crouching lope that only happens after dark. Firelight stops it dead: FROZEN, upright and
   rigid, an arm thrown up over its eyes. */
const NH = { skin: '#cfc8b6', skinD: '#a89e88', skinL: '#efe9da', cloth: '#7a6e58', clothD: '#564c3c', red: '#e04030', redL: '#ff8a5c', eye: '#1a1410' };
export function bakeNightHunter() {
  const W = 32, H = 28, gy = 26, cx = 15, ty = 6;
  /* a long ribby torso, tapering to the waist, with a scrap of wrap at the middle - not just a stick, so the limbs read
     as coming OFF a body rather than forking straight out of the head (the first bake's bug: a torso only 4 px wide
     read as nothing at all, and the whole thing was just a head sprouting legs). */
  const head = (g, x, y, cover = false, litEye = false) => { ellipse(g, x, y, 3, 3, NH.skin); px(g, x - 2, y + 1, NH.skinD);
    if (cover) rect(g, x - 2, y - 1, 5, 3, NH.skinD); else { px(g, x + 1, y - 1, litEye ? NH.red : NH.eye); if (litEye) px(g, x + 2, y - 1, NH.redL); } };
  const torso = (g, x, y, lean = 0) => { fillPoly(g, [[x - 3 + lean, y], [x + 3 + lean, y], [x + 2, y + 13], [x - 2, y + 13]], NH.skin);
    rect(g, x - 3 + lean * 0.6, y + 5, 6, 2, NH.cloth); px(g, x - 2 + lean * 0.4, y + 2, NH.skinD); px(g, x + 1, y + 10, NH.skinD); };
  const F = frames(W, H, 6, (g, f) => {
    if (f === 4) { // FROZEN: upright and rigid, an arm shielding the eyes from the firelight
      torso(g, cx, ty, 0); head(g, cx, ty - 4, true);
      line(g, cx - 2, ty + 2, cx - 6, ty - 3, NH.skin); line(g, cx - 6, ty - 3, cx - 3, ty - 7, NH.skinD);
      line(g, cx + 2, ty + 2, cx + 2, ty - 4, NH.skin);
      line(g, cx - 2, ty + 13, cx - 2, gy, NH.skinD); line(g, cx + 2, ty + 13, cx + 2, gy, NH.skinD); return; }
    if (f === 2) { // POUNCE TELL: coiled low, weight back, the eyes lit red
      torso(g, cx - 2, ty + 4, -4); head(g, cx - 5, ty + 1, false, true);
      line(g, cx - 5, ty + 6, cx - 11, ty + 10, NH.skin); line(g, cx + 1, ty + 6, cx + 6, ty + 4, NH.skin);
      line(g, cx - 4, ty + 17, cx - 9, ty + 22, NH.skinD); line(g, cx, ty + 17, cx + 2, ty + 22, NH.skinD); return; }
    if (f === 3) { // POUNCE: lunged flat, limbs thrown wide
      torso(g, cx + 4, ty + 3, 6); head(g, cx + 12, ty + 1, false, true);
      line(g, cx + 7, ty + 5, cx + 16, ty + 3, NH.skin); line(g, cx + 3, ty + 5, cx + 9, ty + 9, NH.skin);
      line(g, cx + 6, ty + 16, cx, ty + 20, NH.skinD); line(g, cx + 10, ty + 16, cx + 15, ty + 18, NH.skinD); return; }
    const ph = f === 1 ? 1 : 0, lean = ph ? 2 : -2;
    torso(g, cx, ty, lean); head(g, cx + lean * 0.5, ty - 4, false, false);
    const shx = cx + lean, hipx = cx;
    line(g, shx - 2, ty + 2, shx - 5 + ph * 6, ty + 14 - ph * 2, NH.skin);
    line(g, shx + 2, ty + 2, shx + 5 - ph * 6, ty + 14 + ph * 2, NH.skin);
    if (f === 5) { line(g, hipx - 2, ty + 13, hipx - 5, ty + 24, NH.skinD); line(g, hipx + 2, ty + 13, hipx + 4, ty + 22, NH.skinD); }   // hurt: staggered
    else { line(g, hipx - 2, ty + 13, hipx - 3 + ph * 5, gy, NH.skinD); line(g, hipx + 2, ty + 13, hipx + 3 - ph * 5, gy, NH.skinD); }
  });
  return pack(F, cx, H, 14, 22);
}

// ================= SAND-DROWNED CITIZEN =================
/* a townsperson caked in sand, rising out of a drift where it is deep - shallow floors are safe from them. */
const SD = { skin: '#c9a97a', skinD: '#a8845a', cloth: '#8a7458', clothD: '#6a5840', sand: '#e2bb7a', sandL: '#f2d79c', sandD: '#bf8f63', eye: '#241c14' };
export function bakeSandDrowned() {
  const W = 26, H = 26, gy = 24;
  const head = (g, x, y, reach = 0) => { ellipse(g, x, y, 3.8, 4, SD.skin); px(g, x - 2, y + 1, SD.skinD);
    rect(g, x - 3, y - 3, 6, 2, SD.cloth); px(g, x + 1, y - reach, SD.eye); px(g, x + 2, y - reach, SD.eye); px(g, x, y + 2, SD.skinD); };
  const bodyAt = (g, x, y, legs) => { rect(g, x - 3, y, 6, 7, SD.cloth); rect(g, x - 3, y, 6, 1, tint(SD.cloth, 0.2)); rect(g, x - 3, y + 6, 6, 1, SD.clothD);
    const [a, b] = legs; rect(g, x - 3 + a, y + 7, 2, 4, SD.skinD); rect(g, x + 1 + b, y + 7, 2, 4, SD.skinD); for (let i = 0; i < 3; i++) px(g, x - 2 + i * 2, y + 3, SD.sandD); };
  const mound = (g, cx, h) => { fillPoly(g, [[cx - 11, gy], [cx - 6, gy - h], [cx + 6, gy - h], [cx + 11, gy]], SD.sand); rect(g, cx - 6, gy - h, 12, 1, SD.sandL); for (let i = 0; i < 5; i++) px(g, cx - 8 + i * 4, gy - 1, SD.sandD); };
  const F = frames(W, H, 7, (g, f) => {
    const cx = 12;
    if (f === 0) { head(g, cx, gy - 3, 0); mound(g, cx, 3); return; }                                        // buried: a hand and a head in the drift
    if (f === 1) { bodyAt(g, cx, gy - 10, [0, 0]); head(g, cx, gy - 14); mound(g, cx, 4);                     // rising: half out, sand pouring off
      for (let i = 0; i < 6; i++) px(g, cx - 5 + i * 2, gy - 15 + (i % 3) * 3, SD.sandL); return; }
    const legs = f === 2 ? [0, 1] : f === 3 ? [1, 0] : [0, 0], by = gy - 12;
    bodyAt(g, cx, by, legs); head(g, cx + 1, by - 4);
    if (f === 4) { line(g, cx - 4, by + 1, cx - 9, by - 3, SD.skin); line(g, cx + 4, by + 1, cx + 9, by - 3, SD.skin); }        // GRAB TELL: both arms flung wide
    else if (f === 5) { line(g, cx - 4, by + 1, cx + 1, by - 1, SD.skin); line(g, cx + 4, by + 1, cx + 9, by - 1, SD.skin); }   // GRAB: arms closed in front
    else if (f === 6) { line(g, cx - 4, by + 1, cx - 6, by + 5, SD.skinD); line(g, cx + 4, by + 1, cx + 6, by + 5, SD.skinD); } // hurt: staggered
    else { line(g, cx - 4, by + 1, cx - 5, by + 5, SD.skin); line(g, cx + 4, by + 1, cx + 6, by + 3, SD.skin); }
  });
  return pack(F, 12, H, 10, 16);
}

// ================= CLOCKWORK CONSTRUCT =================
/* the city's brass guards, still keeping their rounds. A key sits in the back where the winder always is; wound down,
   it slumps over it and is still - the level uses it as a step. */
const CK = { brass: '#b8863c', brassL: '#e0b060', brassD: '#8a5e28', iron: '#5a5248', ironD: '#3a342c', lens: '#ffd36b', lensL: '#fff1c0', lensOff: '#4a463e', key: '#c9c0a8', keyD: '#8a8270', blade: '#c9d1dc', bladeL: '#f0f4f8', haft: '#6e4a2c' };
export function bakeConstruct() {
  const W = 34, H = 26, gy = 24, cx = 15;
  const head = (g, x, y, lit = true) => { ellipse(g, x, y, 3.6, 3.2, CK.brass); rect(g, x - 4, y - 3, 8, 1, CK.brassL); rect(g, x - 3, y, 7, 2, CK.brassD);
    px(g, x + 1, y - 1, lit ? CK.lens : CK.lensOff); if (lit) px(g, x + 2, y - 1, CK.lensL); };
  const torso = (g, x, y, bend = 0) => { rect(g, x - 4 + bend, y, 8, 9, CK.brass); rect(g, x - 4 + bend, y, 8, 1, CK.brassL); rect(g, x - 4 + bend, y + 8, 8, 1, CK.brassD);
    rect(g, x - 6, y + 2, 2, 3, CK.key); px(g, x - 6, y + 1, CK.keyD); line(g, x - 5, y + 5, x - 5, y + 8, CK.ironD); };   // the key, in its back
  const legs = (g, x, y, ph) => { const a = [0, 2, -2][ph], b = -a; rect(g, x - 3 + a, y, 2, 8, CK.iron); rect(g, x + 1 + b, y, 2, 8, CK.iron); rect(g, x - 4 + a, y + 7, 4, 2, CK.ironD); rect(g, x + b, y + 7, 4, 2, CK.ironD); };
  const arm = (g, x0, y0, x1, y1) => { thick(g, x0, y0, x1, y1, CK.brass, 2); px(g, x1, y1, CK.brassD); };
  const halberd = (g, hx, hy, tx, ty) => { thick(g, hx, hy, tx, ty, CK.haft, 1); const a = Math.atan2(ty - hy, tx - hx), bx = Math.cos(a), by = Math.sin(a);
    fillPoly(g, [[tx - by * 3, ty + bx * 3], [tx + by * 3, ty - bx * 3], [tx + bx * 8, ty + by * 8]], CK.blade); line(g, tx, ty, tx + bx * 7, ty + by * 7, CK.bladeL); };
  const F = frames(W, H, 6, (g, f) => {
    const hip = gy - 8;
    if (f === 4) { // WOUND DOWN: slumped forward over the key, the lens dark
      legs(g, cx, hip + 1, 0); torso(g, cx + 2, hip - 9, 5); head(g, cx + 10, hip - 5, false);
      arm(g, cx - 1, hip - 6, cx - 6, hip - 1); halberd(g, cx - 6, hip - 1, cx - 12, hip + 4); return; }
    const ph = f === 1 ? 1 : (f === 2 || f === 3) ? 2 : 0, dy = f === 5 ? 2 : 0, bend = f === 5 ? -3 : 0;
    legs(g, cx, hip + dy, ph); torso(g, cx, hip - 9 + dy, bend); head(g, cx + 1 + bend, hip - 13 + dy);
    const sh = [cx + 4 + bend, hip - 6 + dy];
    if (f === 2) { arm(g, ...sh, cx - 7, hip - 4); halberd(g, cx - 7, hip - 4, cx - 15, hip - 7); }           // POKE TELL: halberd drawn back, low
    else if (f === 3) { arm(g, ...sh, cx + 14, hip - 9); halberd(g, cx + 14, hip - 9, cx + 24, hip - 8); }    // POKE: thrust forward, level
    else { arm(g, ...sh, cx + 4, hip - 1 + dy); halberd(g, cx + 4, hip - 1 + dy, cx + 6, hip + 9 + dy); }
  });
  return pack(F, cx, H, 10, 16);
}

// ================= THE GLASS STALKER (mini) =================
/* a scorpion the size of a wagon, made of glass, ~64 px nose to tail. Its sting lances out on a long tell; baited into
   one of the crossing's glass overhangs it strikes the glass instead of you and sticks - the OPENING. */
const ST = { a: '#bfe0cf', A: '#e8f7ee', d: '#8fbfa0', D: '#4f7a63', l: '#f5fff9', leg: '#7aa88f', barb: '#2a4a3a', red: '#e04030', redL: '#ff8a5c', eye: '#132018', ov: '#a8d0e0', ovL: '#e8f7ee', crack: '#3a4a52' };
export function bakeStalker() {
  const W = 102, H = 56, gy = 50;
  const body = (g, dy = 0) => { for (let s = 0; s < 4; s++) { const x = 24 + s * 9; ellipse(g, x, gy - 12 + dy, 7, 5.4, s % 2 ? ST.a : ST.A); rect(g, x - 4, gy - 18 + dy, 6, 2, ST.l); }
    ellipse(g, 64, gy - 12 + dy, 8.2, 6.2, ST.A); px(g, 66, gy - 16 + dy, ST.eye); px(g, 69, gy - 16 + dy, ST.eye);
    rect(g, 18, gy - 6 + dy, 46, 3, ST.d); px(g, 32, gy - 8 + dy, ST.l); px(g, 50, gy - 8 + dy, ST.l); };
  const legs = (g, ph) => { for (let i = 0; i < 5; i++) { const x = 26 + i * 9, k = (i + ph) % 2 ? 3 : -3; line(g, x, gy - 9, x + k, gy - 1, ST.leg, 2); px(g, x + k, gy - 1, ST.D); } };
  const claw = (g, ox, oy, open) => { thick(g, 68, gy - 15, ox - 6, oy, ST.a, 3); ellipse(g, ox, oy, 5, 3.4, ST.A); px(g, ox - 2, oy - 2, ST.l);
    thick(g, ox + 2, oy - 2, ox + 8, oy - 2 - open, ST.a, 2); thick(g, ox + 2, oy + 2, ox + 8, oy + 2 + open, ST.d, 2); };
  /* the tail: six segments from the rump (x 14), curling high over the body for the STING */
  const tail = (g, cock, strike, lit) => { let x = 16, y = gy - 16; const pts = [];
    for (let s = 0; s < 6; s++) { const a = Math.PI * (0.95 - s * (0.16 + cock * 0.05) - strike * s * 0.09);
      x += Math.cos(a) * 5.4; y -= Math.abs(Math.sin(a)) * (4.2 + cock * 1.6); pts.push([x, y]); }
    pts.forEach(([tx, ty], i) => { ellipse(g, tx, ty, 3.2 - i * 0.25, 2.8 - i * 0.2, i % 2 ? ST.a : ST.A); if (i === 3) px(g, tx, ty - 1, ST.l); });
    const [bx, by] = pts[5]; const ex = bx + (strike ? 6 : 3), ey = by + 3; line(g, bx, by, ex, ey, lit ? ST.red : ST.barb, 2);
    if (lit) { px(g, ex - 1, ey - 1, ST.redL); px(g, ex, ey, ST.redL); } return [ex, ey]; };
  /* the TAIL sweep: not the tail's high arc - it drops to the ground and sweeps low and long, so it reads as a
     different weapon from the STING even in silhouette. TELL: bunched low behind the rump. STRIKE: a long low reach,
     out past the claws. */
  const tailSweep = (g, strike, lit) => { for (let i = 0; i < 4; i++) ellipse(g, 14 - i * 3.4, gy - 7 - i * 0.6, 2.8 - i * 0.2, 2.4 - i * 0.2, i % 2 ? ST.a : ST.A);
    const ex = strike ? 92 : 6; thick(g, 14, gy - 5, ex, gy - 3, lit ? ST.red : ST.barb, 3);
    if (lit) { px(g, ex - 2, gy - 3, ST.redL); px(g, 50, gy - 4, ST.redL); } };
  const F = frames(W, H, 10, (g, f) => {
    if (f === 8) { // OPEN: the sting jammed in a jagged glass overhang above it, cracked round the wound
      fillPoly(g, [[36, 2], [78, 2], [82, 9], [72, 14], [64, 8], [56, 14], [48, 8], [40, 13], [32, 8]], ST.ov);
      rect(g, 38, 3, 38, 2, ST.ovL);
      for (const [x0, y0] of [[50, 13], [64, 9], [72, 15]]) { line(g, x0, y0, x0 - 3, y0 + 8, ST.ov); line(g, x0, y0, x0 + 2, y0 + 7, ST.d); }   // icicle spikes hanging down
      for (const [x0, y0, x1, y1] of [[52, 13, 47, 22], [62, 10, 67, 19], [57, 12, 58, 18]]) line(g, x0, y0, x1, y1, ST.crack);
      body(g, 2); legs(g, 0); let x = 16, y = gy - 16; const pts = []; for (let s = 0; s < 6; s++) { const a = Math.PI * (0.9 - s * 0.11); x += Math.cos(a) * 5.6; y -= Math.abs(Math.sin(a)) * (5 + s * 0.6); pts.push([x, y]); }
      pts.forEach(([tx, ty], i) => ellipse(g, tx, ty, 3 - i * 0.2, 2.6 - i * 0.2, i % 2 ? ST.a : ST.A));
      claw(g, 76, gy - 20, 1); for (const [dx, dy] of [[64, -30], [70, -34], [58, -32]]) px(g, dx, gy + dy, ST.l); return; }
    const dy = f === 9 ? 2 : 0;
    if (f === 6 || f === 7) tailSweep(g, f === 7, f === 7);          // TAIL TELL / TAIL sweep: low, not the high STING arc
    else tail(g, f === 4 ? 1 : f === 5 ? 0.7 : 0.3, f === 5 ? 1 : 0, f === 4 || f === 5);
    legs(g, f === 1 ? 1 : 0); body(g, dy);
    if (f === 2) claw(g, 84, gy - 26, 3);                          // CLAW TELL: up and open
    else if (f === 3) claw(g, 92, gy - 12, 0);                     // CLAW: snapped forward, shut
    else claw(g, 82, gy - 14, f === 9 ? 3 : 1.5);
  });
  return pack(F, 52, H, 50, 24);
}

// ================= THE GLASS COLOSSUS (boss) =================
/* a giant of lightning-glass (fulgurite): pale gold-green, dark veins forking through it like the lightning that fused
   it. By day its chest gathers the sun into a lance along the ground; a lance that meets one of the arena's mirror
   shelves reflects into its own chest — the OPENING. Night (phase 2) drops the glass dark, the veins only faintly lit,
   and swaps the lance for the swarm call. */
const CO = { glass: '#cfe3a0', glassL: '#eef6c8', glassD: '#9db06a', glassS: '#6f8250', vein: '#3a3c1c', chest: '#fff6c8', chestGlow: '#ffe86b', crack: '#241c10', night: '#3c4630', nightL: '#4d5a3d', nightD: '#262e1c', nightVein: '#6ad88a', red: '#e04030', redL: '#ff8a5c', eye: '#ffe86b', eyeN: '#6ad88a' };
export function bakeColossus() {
  const W = 92, H = 78, cx = 42;
  const legs = (g, x, y, ph, night) => { const a = [0, 3, -3][ph] || 0, b = -a, base = night ? CO.night : CO.glass, deep = night ? CO.nightD : CO.glassD;
    thick(g, x - 8, y, x - 8 + a, y + 20, deep, 6); thick(g, x + 8, y, x + 8 + b, y + 20, deep, 6);
    thick(g, x - 8, y, x - 8 + a, y + 20, base, 4); thick(g, x + 8, y, x + 8 + b, y + 20, base, 4);
    rect(g, x - 12 + a, y + 19, 8, 3, deep); rect(g, x + 4 + b, y + 19, 8, 3, deep); };
  const torso = (g, x, y, bend = 0, night = false, glow = 0, crack = false) => { const base = night ? CO.night : CO.glass, lit = night ? CO.nightL : CO.glassL, deep = night ? CO.nightD : CO.glassD;
    fillPoly(g, [[x - 15 + bend, y], [x + 15 + bend, y], [x + 12, y + 28], [x - 12, y + 28]], base);
    fillPoly(g, [[x - 12 + bend, y + 1], [x + 12 + bend, y + 1], [x + 9, y + 20], [x - 9, y + 20]], lit);
    line(g, x - 10 + bend, y + 3, x - 3, y + 18, night ? CO.nightVein : CO.vein); line(g, x + 8 + bend, y + 4, x + 3, y + 24, night ? CO.nightVein : CO.vein);
    rect(g, x - 12, y + 26, 24, 2, deep);
    if (crack) { ellipse(g, x + bend, y + 13, 7, 7, CO.crack); ellipse(g, x + bend, y + 13, 4, 4, CO.red);
      for (const [x0, y0, x1, y1] of [[x - 5 + bend, y + 8, x + 5 + bend, y + 18], [x + 5 + bend, y + 8, x - 4 + bend, y + 19], [x + bend, y + 6, x + bend, y + 20]]) line(g, x0, y0, x1, y1, CO.chestGlow);
      px(g, x + bend, y + 13, CO.redL); }
    else if (glow > 0) { ellipse(g, x + bend, y + 13, 3 + glow * 3, 3 + glow * 3, CO.chestGlow); px(g, x + bend, y + 13, CO.chest); } };
  const head = (g, x, y, night = false) => { fillPoly(g, [[x - 8, y + 9], [x - 6, y - 6], [x + 6, y - 6], [x + 8, y + 9]], night ? CO.night : CO.glass);
    rect(g, x - 8, y + 7, 16, 3, night ? CO.nightD : CO.glassD); px(g, x - 3, y, night ? CO.eyeN : CO.eye); px(g, x + 3, y, night ? CO.eyeN : CO.eye); };
  const arm = (g, sx, sy, ex, ey, night, fist = true) => { thick(g, sx, sy, ex, ey, night ? CO.nightD : CO.glassD, 7); thick(g, sx, sy, ex, ey, night ? CO.night : CO.glass, 5);
    if (fist) ellipse(g, ex, ey, 5, 4.5, night ? CO.night : CO.glass); };
  const F = frames(W, H, 16, (g, f) => {
    const night = f >= 13 || f === 9 || f === 10, cxx = cx, hip = H - 4 - 20;
    if (f === 11) { // OPEN: chest cracked by its own reflected lance
      legs(g, cxx, hip, 0, false); torso(g, cxx, hip - 28, 0, false, 0, true); head(g, cxx, hip - 34); arm(g, cxx - 13, hip - 20, cxx - 20, hip - 4, false); arm(g, cxx + 13, hip - 20, cxx + 20, hip - 4, false);
      for (const [dx, dy] of [[10, -46], [16, -42], [-14, -44]]) px(g, cxx + dx, hip + dy, CO.chestGlow); return; }
    const ph = night ? (f === 15 ? 1 : f === 14 ? 2 : 0) : (f === 2 ? 1 : f === 1 ? 2 : 0);
    const bend = f === 6 ? 4 : (f === 5 || f === 9 || f === 10) ? -3 : 0;
    legs(g, cxx, hip, ph, night); torso(g, cxx, hip - 28, bend, night, f === 3 ? 0.5 : f === 4 ? 1 : 0);
    head(g, cxx + bend * 0.4, hip - 34, night); const sh = [cxx + 12 + bend, hip - 22];
    if (f === 3) { arm(g, ...sh, cxx + 26, hip - 30, night); for (let k = 0; k < 3; k++) px(g, cxx + 24 + k * 2, hip - 30 - k, CO.chestGlow); }         // LANCE TELL: arm out, chest gathering light
    else if (f === 4) { arm(g, ...sh, cxx + 34, hip - 8, night); rect(g, cxx + 20, hip - 10, 46, 2, CO.chest); }                                          // LANCE: released, low and flat
    else if (f === 5) { arm(g, cxx - 12 + bend, hip - 24, cxx - 22, hip - 40, night); arm(g, ...sh, cxx + 22, hip - 38, night); }                          // STOMP TELL: both arms raised
    else if (f === 6) { fillPoly(g, [[cxx - 20, hip + 24], [cxx + 20, hip + 24], [cxx + 14, hip + 14], [cxx - 14, hip + 14]], CO.glassD);   // STOMP: dust at the feet, and a shockwave ring running out
      for (const r of [12, 20, 28]) for (let a = 0; a < Math.PI * 2; a += 0.28) px(g, cxx + Math.cos(a) * r, hip + 20 + Math.sin(a) * r * 0.32, r > 20 ? CO.glassL : CO.glassD); }
    else if (f === 7) { arm(g, ...sh, cxx + 20, hip - 42, night); for (const [dx, dy] of [[16, -40], [22, -36], [12, -44]]) { ellipse(g, cxx + dx, hip + dy, 2, 2, CO.glassL); } }     // SHARDS TELL: raised, glass loosening off the shoulder
    else if (f === 8) { for (const [dx, dy] of [[6, -32], [14, -20], [-8, -30], [2, -10]]) { fillPoly(g, [[cxx + dx, hip + dy], [cxx + dx + 3, hip + dy + 4], [cxx + dx - 2, hip + dy + 5]], CO.glassL); } }   // SHARDS: falling
    else if (f === 9) { arm(g, ...sh, cxx + 18, hip - 36, night); px(g, cxx + 3, hip - 21, CO.eyeN); px(g, cxx - 3, hip - 21, CO.eyeN); }                 // SWARM TELL: night, fist raised
    else if (f === 10) { arm(g, ...sh, cxx + 14, hip + 4, night); for (let a = 0; a < Math.PI; a += 0.4) line(g, cxx + 14, hip + 4, cxx + 14 + Math.cos(a) * 14, hip + 4 + Math.sin(a) * 8, CO.nightVein); }   // SWARM: fist into the ground, cracks running out
    else if (f === 12) { arm(g, cxx - 13, hip - 18, cxx - 20, hip - 2, night); arm(g, cxx + 13, hip - 18, cxx + 20, hip - 2, night); }                    // hurt: arms dropped
    else { arm(g, cxx - 12 + bend, hip - 22, cxx - 18, hip - 2, night); arm(g, ...sh, cxx + 18, hip - 2, night); }
  });
  return pack(F, cx, H, 34, 54);
}
export function bakeSunLance() {
  const W = 24, H = 8;
  const F = [];
  for (let f = 0; f < 2; f++) { const [c, g] = canvas(W, H);
    rect(g, 0, 2, W, 4, CO.chestGlow); rect(g, 0, 3, W, 2, CO.chest);
    for (let x = f; x < W; x += 4) px(g, x, f ? 1 : 6, CO.glassL);
    F.push(outline(c, OUT)); }
  return F;
}
export function bakeShelf() {
  const [c, g] = canvas(32, 14);
  fillPoly(g, [[2, 12], [6, 2], [26, 2], [30, 12]], CO.glass);
  rect(g, 4, 3, 24, 2, CO.glassL);
  for (let x = 6; x < 28; x += 5) line(g, x, 4, x + 3, 10, CO.glassL);
  rect(g, 2, 11, 28, 2, CO.glassD);
  return outline(c, OUT);
}

// ================= THE SAND WARDEN (mini) =================
/* a guard-construct of packed sand bound in brass plates, ~40 px. Lured into the gate's hourglass room as it fills, the
   rising sand pins its legs - the OPENING. */
const WD = { sand: '#c9975c', sandL: '#e6bb82', sandD: '#9c7040', brass: '#b8863c', brassL: '#e0b060', brassD: '#8a5e28', halberd: '#c9d1dc', halberdL: '#f0f4f8', haft: '#6e4a2c', red: '#e04030', redL: '#ff8a5c', eye: '#ffd36b' };
export function bakeSandWarden() {
  const W = 48, H = 42, gy = 40;
  const legs = (g, x, y, ph) => { const a = [0, 3, -3][ph], b = -a; thick(g, x - 6, y, x - 6 + a, y + 15, WD.sandD, 6); thick(g, x + 6, y, x + 6 + b, y + 15, WD.sandD, 6);
    thick(g, x - 6, y, x - 6 + a, y + 14, WD.sand, 4); thick(g, x + 6, y, x + 6 + b, y + 14, WD.sand, 4);
    rect(g, x - 9 + a, y + 14, 6, 2, WD.brassD); rect(g, x + 3 + b, y + 14, 6, 2, WD.brassD); };
  const torso = (g, x, y, bend = 0, sunk = 0) => { fillPoly(g, [[x - 10 + bend, y], [x + 10 + bend, y], [x + 8, y + 18], [x - 8, y + 18]], WD.sand);
    rect(g, x - 8 + bend, y + 1, 16, 3, WD.sandL); rect(g, x - 9, y + 5, 18, 3, WD.brass); rect(g, x - 9, y + 5, 18, 1, WD.brassL);
    if (sunk) { fillPoly(g, [[x - 16, gy], [x - 10, gy - sunk], [x + 10, gy - sunk], [x + 16, gy]], WD.sandL); for (let i = 0; i < 5; i++) px(g, x - 12 + i * 5, gy - 1, WD.sandD); } };
  const head = (g, x, y, lit = true) => { ellipse(g, x, y, 5, 4.6, WD.brass); rect(g, x - 5, y - 4, 10, 2, WD.brassL); rect(g, x - 4, y + 2, 8, 2, WD.brassD); px(g, x + 1, y - 1, lit ? WD.eye : WD.brassD); px(g, x + 2, y - 1, lit ? WD.eye : WD.brassD); };
  const arm = (g, x0, y0, x1, y1) => { thick(g, x0, y0, x1, y1, WD.sand, 4); px(g, x1, y1, WD.brassD); };
  const halberd = (g, hx, hy, tx, ty) => { thick(g, hx, hy, tx, ty, WD.haft, 2); const a = Math.atan2(ty - hy, tx - hx), bx = Math.cos(a), by = Math.sin(a);
    fillPoly(g, [[tx - by * 4, ty + bx * 4], [tx + by * 4, ty - bx * 4], [tx + bx * 10, ty + by * 10]], WD.halberd); line(g, tx, ty, tx + bx * 9, ty + by * 9, WD.halberdL); };
  const F = frames(W, H, 10, (g, f) => {
    const cx = 22, hip = gy - 16;
    if (f === 8) { // OPEN: pinned knee-deep in rising sand
      torso(g, cx, hip, 0, 9); head(g, cx + 1, hip - 6); arm(g, cx - 8, hip + 4, cx - 14, hip + 10); arm(g, cx + 8, hip + 4, cx + 15, hip + 8);
      halberd(g, cx + 15, hip + 8, cx + 22, hip + 14); for (const [dx, dy] of [[6, -18], [12, -14], [-6, -16]]) px(g, cx + dx, hip + dy, WD.eye); return; }
    const ph = f === 1 ? 1 : (f === 4 || f === 5) ? 2 : 0, dy = f === 9 ? 2 : 0;
    legs(g, cx, hip + dy, ph); torso(g, cx, hip - 18 + dy, f === 9 ? -4 : 0); head(g, cx + 1 + (f === 9 ? -4 : 0), hip - 24 + dy);
    const sh = [cx + 8 + (f === 9 ? -4 : 0), hip - 15 + dy];
    if (f === 2) { arm(g, ...sh, cx + 4, hip - 30); }                                                            // SLAM TELL: fist drawn up high
    else if (f === 3) { arm(g, ...sh, cx + 18, hip - 6); }                                                       // SLAM: down and out in front
    else if (f === 4) { arm(g, ...sh, cx - 6, hip - 22); halberd(g, cx - 6, hip - 22, cx - 16, hip - 30); }      // HALBERD TELL: drawn back
    else if (f === 5) { arm(g, ...sh, cx + 16, hip - 10); halberd(g, cx + 16, hip - 10, cx + 30, hip - 6); }     // HALBERD: the lunge-sweep, low and long
    else if (f === 6) { arm(g, ...sh, cx + 6, hip - 26); for (let k = 0; k < 3; k++) px(g, cx + 4 + k * 2, hip - 26 - k, WD.sandL); }   // THROW TELL: a fistful raised
    else if (f === 7) { arm(g, ...sh, cx + 20, hip - 12); for (let i = 0; i < 6; i++) px(g, cx + 20 + i * 3, hip - 12 - (i % 3), WD.sandL); }   // THROW: sand flung out
    else { arm(g, ...sh, cx + 6, hip - 2 + dy); halberd(g, cx + 6, hip - 2 + dy, cx + 8, hip + 10 + dy); }
  });
  return pack(F, 22, H, 20, 26);
}

// ================= THE HOURGLASS KING (boss) =================
/* a clockwork king with an hourglass for a chest, the sand level in it (sandLevel: 0 full, 1 half, 2 near-empty) drawn
   the same in every frame. Empty, he STALLS - the OPENING - then turns himself over and it runs again. */
const HK = { robe: '#3e4a92', robeD: '#2a3268', robeL: '#5a68b8', brass: '#b8863c', brassL: '#e0b060', brassD: '#8a5e28', skin: '#c9a97a', glass: '#cfe3f0', glassL: '#eef8ff', sand: '#e2bb7a', sandD: '#bf8f63', ghost: 'rgba(140,160,220,0.45)', red: '#e04030', redL: '#ff8a5c', eye: '#ffd36b' };
function hourglassChest(g, x, y, level) {
  fillPoly(g, [[x - 6, y], [x + 6, y], [x + 3, y + 6], [x + 6, y + 12], [x - 6, y + 12], [x - 3, y + 6]], HK.glass);
  rect(g, x - 5, y + 1, 10, 1, HK.glassL);
  const fill = level === 0 ? 10 : level === 1 ? 6 : 2;
  if (fill > 6) rect(g, x - 5, y + 1, 10, Math.min(5, fill - 5), HK.sand);
  rect(g, x - 3, y + 12 - Math.min(5, fill), 6, Math.min(5, fill), HK.sand);
  px(g, x, y + 6, HK.sandD);
  rect(g, x - 5, y, 10, 1, HK.brassD); rect(g, x - 5, y + 11, 10, 1, HK.brassD);
}
export function bakeHourglassKing(sandLevel = 0) {
  const W = 60, H = 60, gy = 58;
  const legs = (g, x, y, ph) => { const a = [0, 2, -2][ph] || 0, b = -a; thick(g, x - 4, y, x - 4 + a, y + 16, HK.robeD, 5); thick(g, x + 4, y, x + 4 + b, y + 16, HK.robeD, 5);
    rect(g, x - 7 + a, y + 15, 5, 2, HK.brassD); rect(g, x + 2 + b, y + 15, 5, 2, HK.brassD); };
  const robe = (g, x, y, bend = 0, invert = false) => { fillPoly(g, [[x - 11 + bend, y], [x + 11 + bend, y], [x + 8, y + 22], [x - 8, y + 22]], HK.robe);
    fillPoly(g, [[x - 9 + bend, y + 1], [x + 9 + bend, y + 1], [x + 7, y + 8], [x - 7, y + 8]], HK.robeL);
    line(g, x - 7 + bend, y + 2, x - 3, y + 20, HK.robeD); rect(g, x - 11, y + 20, 22, 2, HK.robeD);
    hourglassChest(g, x + bend, y + (invert ? 14 : 6), sandLevel); };
  const head = (g, x, y) => { ellipse(g, x, y, 4.2, 4, HK.skin); rect(g, x - 5, y - 5, 10, 3, HK.brass); rect(g, x - 5, y - 5, 10, 1, HK.brassL); px(g, x - 6, y - 3, HK.brassL); px(g, x + 1, y - 1, '#241c14'); };
  const arm = (g, x0, y0, x1, y1) => thick(g, x0, y0, x1, y1, HK.robe, 4);
  const sceptre = (g, hx, hy, tx, ty) => { thick(g, hx, hy, tx, ty, HK.brass, 2); circle(g, tx, ty, 2.4, HK.brassL); px(g, tx, ty, HK.eye); };
  const F = frames(W, H, 14, (g, f) => {
    const cx = 28, hip = gy - 24;
    if (f === 11) { // OPEN / STALLED: the glass empty, frozen mid-gesture
      legs(g, cx, hip, 0); robe(g, cx, hip - 22, 0); head(g, cx + 1, hip - 30);
      arm(g, cx + 9, hip - 20, cx + 15, hip - 26); arm(g, cx - 9, hip - 18, cx - 15, hip - 22);
      sceptre(g, cx + 15, hip - 26, cx + 20, hip - 34);
      for (const [dx, dy] of [[6, -38], [12, -34], [0, -42]]) px(g, cx + dx, hip + dy, HK.eye); return; }
    if (f === 12) { // TURNING OVER: tumbling head-over-heels, legs kicked up, the head near the ground - a pose the
                     // standing frames can't make by reusing robe()/legs()/head() from the hip, so this is drawn on its own
      const bx = cx;
      thick(g, bx - 5, 16, bx - 8, 4, HK.robeD, 5); thick(g, bx + 5, 16, bx + 9, 5, HK.robeD, 5);
      rect(g, bx - 11, 1, 5, 2, HK.brassD); rect(g, bx + 6, 2, 5, 2, HK.brassD);
      fillPoly(g, [[bx - 10, 14], [bx + 10, 14], [bx + 8, 38], [bx - 8, 38]], HK.robe);
      fillPoly(g, [[bx - 8, 15], [bx + 8, 15], [bx + 6, 26], [bx - 6, 26]], HK.robeL);
      hourglassChest(g, bx, 20, sandLevel);
      head(g, bx + 2, gy - 6);
      arm(g, bx - 8, 18, bx - 14, 30); arm(g, bx + 8, 18, bx + 14, 30); return; }
    const ph = f === 1 ? 1 : f === 2 ? 2 : 0, dy = f === 13 ? 2 : 0;
    legs(g, cx, hip + dy, ph); robe(g, cx, hip - 22 + dy, f === 13 ? -3 : 0); head(g, cx + 1 + (f === 13 ? -3 : 0), hip - 30 + dy);
    const sh = [cx + 9 + (f === 13 ? -3 : 0), hip - 20 + dy], lh = [cx - 9 + (f === 13 ? -3 : 0), hip - 18 + dy];
    if (f === 3) { arm(g, ...sh, cx + 6, hip - 40); sceptre(g, cx + 6, hip - 40, cx + 2, hip - 52); arm(g, ...lh, cx - 10, hip - 10); }         // STREAM TELL: sceptre raised to the roof
    else if (f === 4) { arm(g, ...sh, cx + 4, hip - 38); sceptre(g, cx + 4, hip - 38, cx + 4, hip - 50); rect(g, cx + 1, hip - 50, 6, 46, HK.glassL); arm(g, ...lh, cx - 10, hip - 10); }   // STREAM: the column called down
    else if (f === 5) { arm(g, ...sh, cx + 4, hip - 30); arm(g, ...lh, cx - 12, hip - 8); }                                                     // GEAR TELL: drawn back
    else if (f === 6) { arm(g, ...sh, cx + 20, hip - 12); circle(g, cx + 24, hip - 10, 3, HK.brass); for (let a = 0; a < Math.PI * 2; a += Math.PI / 4) px(g, cx + 24 + Math.cos(a) * 4, hip - 10 + Math.sin(a) * 4, HK.brassD); arm(g, ...lh, cx - 10, hip - 10); }   // GEAR: tossed low
    else if (f === 7) { arm(g, ...sh, cx + 12, hip - 8); arm(g, ...lh, cx - 12, hip - 8); rect(g, cx - 14, hip - 24, 28, 24, HK.ghost); }        // SLIP TELL: a ghostly afterimage of himself
    else if (f === 8) { arm(g, ...sh, cx + 16, hip - 2); arm(g, ...lh, cx - 8, hip - 14); }                                                      // SLIP: struck at where you were
    else if (f === 9) { arm(g, ...sh, cx + 14, hip - 30); arm(g, ...lh, cx - 10, hip - 10); sceptre(g, cx + 14, hip - 30, cx + 20, hip - 20); }  // PENDULUM TELL: raised, heavy
    else if (f === 10) { arm(g, ...sh, cx + 4, hip + 2); arm(g, ...lh, cx - 10, hip - 10); sceptre(g, cx + 4, hip + 2, cx + 16, hip + 8); }      // PENDULUM: the sweep
    else if (f === 13) { arm(g, ...sh, cx + 14, hip - 4 + dy); arm(g, ...lh, cx - 12, hip - 2 + dy); }                                           // hurt: staggered
    else { arm(g, ...sh, cx + 8, hip - 4 + dy); arm(g, ...lh, cx - 10, hip - 10 + dy); }
  });
  return pack(F, 28, H, 22, 38);
}
export function bakeCog() {
  const F = [];
  for (let f = 0; f < 2; f++) { const [c, g] = canvas(14, 14);
    circle(g, 7, 7, 5, HK.brass);
    for (let k = 0; k < 8; k++) { const a = k * Math.PI / 4 + (f ? Math.PI / 8 : 0); px(g, Math.round(7 + Math.cos(a) * 6), Math.round(7 + Math.sin(a) * 6), HK.brassD); }
    circle(g, 7, 7, 2, HK.brassD); px(g, 7, 7, HK.brassL);
    F.push(outline(c, OUT)); }
  return F;
}
