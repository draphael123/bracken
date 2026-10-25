// pirate_skins.js - THE FLOTILLA 3's PIRATE CREWS (claude/flotilla3, GREYBOX recolours; the ART sonnet redraws them). The review's fix 3 (approved 10-18): the Admiral's
// kit taught on his crew, the act's stock sea crew gone. Each is the proven foe's own sheet tinted (frame order, anchors and boxes are the base set's, so the AI's frame
// picks are untouched and a body dies in its own skin - main.js reskinSet reads SPR[e.cnSkin]):
//   PISTOLEER     (the marine)        a red-coated pistol man in the tops: TWO told shots, then a slow told RELOAD (an opening) - BRACE OF PISTOLS in miniature
//   KEG ROLLER    (the powder monkey) a tar-black deckhand who ROLLS a lit keg down the deck at you: strike it and it rolls back at him - POWDER KEG in miniature
//   PLATED BOSUN  (the boarder)       a boarder bolted into a plate of salvaged hull iron: no blade throws him, a round shot does - the ADMIRAL'S ARMOUR in miniature
// and THE GRAPNEL BOARDER's own small sheet (the level's one new foe: src/flotilla3.js drawBoarder draws him live; this is his card and his body).
import { canvas, flipX, whiten } from '../px.js';
import { drawBoarder } from '../flotilla3.js';
const pack = (R, ax, ay, w, h) => ({ R, L: R.map(c => flipX(c)), white: { R: R.map(c => whiten(c)), L: R.map(c => flipX(whiten(c))) }, ax, ay, w, h });
const hex = h => [parseInt(h.slice(1, 3), 16), parseInt(h.slice(3, 5), 16), parseInt(h.slice(5, 7), 16)];
/* tint every lit pixel toward a colour by k (skin-ish pixels - warm and bright - are kept) */
const tint = (c, to, k) => { const [o, g] = canvas(c.width, c.height); g.drawImage(c, 0, 0); const img = g.getImageData(0, 0, c.width, c.height), d = img.data, T = hex(to);
  for (let i = 0; i < d.length; i += 4) { if (!d[i + 3]) continue; const r = d[i], gg = d[i + 1], b = d[i + 2], skin = r > 150 && r > gg + 25 && gg > b; if (skin) continue;
    d[i] = Math.round(r + (T[0] - r) * k); d[i + 1] = Math.round(gg + (T[1] - gg) * k); d[i + 2] = Math.round(b + (T[2] - b) * k); }
  g.putImageData(img, 0, 0); return o; };
const FOR = { pistoleer: ['marine', '#8a1c1e', 0.5], kegroller: ['powderboy', '#2a2018', 0.45], platedbosun: ['boarder', '#7a808e', 0.55] };
export function bakePirateSkins(SPR) {
  const out = {};
  for (const [skin, [base, col, k]] of Object.entries(FOR)) { const s = SPR[base] || (base === 'powderboy' ? SPR.dynamiter : null); if (!s || !s.R) continue;
    out[skin] = pack(s.R.map(c => tint(c, col, k)), s.ax, s.ay, s.w, s.h); }
  /* THE GRAPNEL BOARDER: stand, swing, cut, hurt */
  const fr = ['fight', 'swing', 'cut', 'fight'].map((m, i) => { const [c, g] = canvas(24, 28); drawBoarder(g, 12, 26, 1, m, 0.2 * i, false); return c; });
  out.grapnel = pack(fr, 12, 26, 12, 22);
  return out;
}
