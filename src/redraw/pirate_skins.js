// pirate_skins.js - THE FLOTILLA 3's PIRATE CREWS (claude/flotilla3 greybox -> claude/flotilla3art: REAL REDRAWS, no longer tinted recolours). The review's fix 3 (approved 10-18): the Admiral's kit taught on his crew, the act's stock sea
// crew gone. Frame order, anchors and boxes are the base sets', so the AI's frame picks are untouched and a body dies in its own skin (main.js reskinSet reads SPR[e.cnSkin]):
//   PISTOLEER     (the marine's frames, redrawn by pirates.js bakeMarine({ pistoleer })) an oxblood coat laced in gold, a black tricorn with a red plume, black breeches and boots, a flintlock in the fist:
//                 0,1 perched | 2 aim tell | 3 shoot | 4,5 THE RELOAD (pistol stood muzzle-up, head down, the ramrod going in: the opening) | 6 hurt
//   KEG ROLLER    (the powder monkey's frames) a tar-black deckhand in a striped jersey and a red scarf with a keg of his own on his hip; frame 6 (the shove) has both hands on the keg, heaving it; 4,5 running off, the keg gone
//   PLATED BOSUN  (the boarder's frames) the boarder bolted into hull iron: a riveted breastplate with a gunport rim, a barnacled pauldron, an iron-grey jerkin and a dull straw hat; the AI's frames unchanged (0-3 walk, 4-6 throw, 7 hurt)
// and THE GRAPNEL BOARDER's own small sheet (the level's one new foe: src/flotilla3.js drawBoarder draws him live; this is his card and his body).
import { canvas, flipX, whiten, px, rect, outline } from '../px.js';
import { OUT } from '../art.js';
import { drawBoarder } from '../flotilla3.js';
import { bakeMarine } from './pirates.js';
import { bakeGull } from './flotilla3_world.js';
const pack = (R, ax, ay, w, h) => ({ R, L: R.map(c => flipX(c)), white: { R: R.map(c => whiten(c)), L: R.map(c => flipX(whiten(c))) }, ax, ay, w, h });
const hex = h => [parseInt(h.slice(1, 3), 16), parseInt(h.slice(3, 5), 16), parseInt(h.slice(5, 7), 16)];
/* tint every lit pixel toward a colour by k (skin-ish pixels - warm and bright - are kept) */
const tint = (c, to, k, keepSkin = true) => { const [o, g] = canvas(c.width, c.height); g.drawImage(c, 0, 0); const img = g.getImageData(0, 0, c.width, c.height), d = img.data, T = hex(to);
  for (let i = 0; i < d.length; i += 4) { if (!d[i + 3]) continue; const r = d[i], gg = d[i + 1], b = d[i + 2], skin = r > 150 && r > gg + 25 && gg > b; if (skin && keepSkin) continue;
    d[i] = Math.round(r + (T[0] - r) * k); d[i + 1] = Math.round(gg + (T[1] - gg) * k); d[i + 2] = Math.round(b + (T[2] - b) * k); }
  g.putImageData(img, 0, 0); return o; };
/* lay a drawing over a frame, then give the whole figure a fresh outline (the dark edge the base set's frames carry) */
const over = (c, fn) => { const [o, g] = canvas(c.width, c.height); g.drawImage(c, 0, 0); fn(g); return outline(o, OUT); };
const IRON = { d: '#1c1e26', m: '#3a3e4a', l: '#5c6270', h: '#8a92a0', rv: '#b4bcc8', rust: '#8a4a26', barn: '#d2d0b4', weed: '#4a6a3c' };
/* THE PLATED BOSUN: a plate of hull strake over the chest (dx follows the frame's lean) and a barnacled pauldron over the near shoulder */
function platedFrame(c, i, ax, ay) {
  const dx = [0, 0, 0, 0, -3, 2, -1, -3][i] || 0, dy = [0, 1, 0, 1, 0, 0, 1, 2][i] || 0;
  return over(tint(c, '#6a7080', 0.5, true), g => {
    const x = ax - 4 + dx, y = ay - 17 + dy;
    rect(g, x, y, 9, 11, IRON.d); rect(g, x + 1, y + 1, 7, 9, IRON.m); rect(g, x + 1, y + 1, 7, 1, IRON.h); rect(g, x + 1, y + 1, 1, 8, IRON.l); rect(g, x + 1, y + 9, 7, 1, IRON.d);
    rect(g, x + 1, y + 5, 7, 1, IRON.d);   /* the strake seam */
    px(g, x + 2, y + 2, IRON.rv); px(g, x + 6, y + 2, IRON.rv); px(g, x + 2, y + 8, IRON.l); px(g, x + 6, y + 8, IRON.l);   /* rivets */
    rect(g, x + 3, y + 3, 3, 3, IRON.rust); px(g, x + 4, y + 4, IRON.d); px(g, x + 3, y + 3, '#b86a34');   /* the gunport rim still on it */
    px(g, x + 6, y + 6, IRON.rust); px(g, x + 6, y + 7, IRON.rust); px(g, x + 2, y + 7, IRON.barn); px(g, x + 3, y + 7, IRON.barn); px(g, x + 7, y + 4, IRON.weed);
    rect(g, x + 4, y - 2, 6, 3, IRON.d); rect(g, x + 5, y - 1, 4, 2, IRON.m); px(g, x + 5, y - 1, IRON.h); px(g, x + 8, y - 1, IRON.barn);   /* the pauldron */ }); }
/* THE KEG ROLLER: a keg of his own at the hip while he walks, both hands on it when he shoves; the jersey and the scarf recoloured from the powder boy's */
function kegFrame(c, i, ax, ay) {
  return over(tint(c, '#1c1814', 0.4, true), g => {
    const keg = (kx, ky, s) => { rect(g, kx, ky, 8 * s, 8 * s, '#4a301a'); rect(g, kx + 1, ky + 1, 6 * s, 6 * s, '#6c4a28'); rect(g, kx + 1, ky + 1, 1, 6 * s, '#9a7444'); rect(g, kx, ky + 2, 8 * s, 1, '#2e2e36'); rect(g, kx, ky + 5 * s, 8 * s, 1, '#2e2e36'); px(g, kx + 3, ky - 1, '#8a7454'); px(g, kx + 3, ky - 2, '#ffd36b'); };
    if (i <= 3) keg(ax + 2, ay - 13, 1);
    else if (i === 6) { keg(ax + 6, ay - 12, 1); rect(g, ax + 3, ay - 12, 4, 2, '#d8a07a'); rect(g, ax + 3, ay - 8, 4, 2, '#d8a07a'); }
    rect(g, ax - 3, ay - 20, 5, 1, '#c9463d'); px(g, ax - 4, ay - 19, '#8e2b26'); px(g, ax - 5, ay - 18, '#8e2b26'); }); }
export function bakePirateSkins(SPR) {
  const out = {};
  out.pistoleer = bakeMarine({ pistoleer: true });
  const pb = SPR.powderboy || SPR.dynamiter; if (pb && pb.R) out.kegroller = pack(pb.R.map((c, i) => kegFrame(c, i, pb.ax, pb.ay)), pb.ax, pb.ay, pb.w, pb.h);
  const bo = SPR.boarder; if (bo && bo.R) out.platedbosun = pack(bo.R.map((c, i) => platedFrame(c, i, bo.ax, bo.ay)), bo.ax, bo.ay, bo.w, bo.h);
  out.gull = bakeGull();   /* THE HARBOUR'S GULLS: the petrel's frames redrawn white (main.js reskinSet wears it on the flotilla's petrels) */
  /* THE GRAPNEL BOARDER: stand, swing, cut, hurt */
  const fr = ['fight', 'swing', 'cut', 'landed'].map((m, i) => { const [c, g] = canvas(36, 34); drawBoarder(g, 12, 32, 1, m, 0.2 * i, false); return outline(c, OUT); });
  out.grapnel = pack(fr, 12, 33, 12, 22);
  return out;
}
