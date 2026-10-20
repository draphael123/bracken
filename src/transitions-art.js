/* src/transitions-art.js - THE PICTURES OF THE TRANSITION SYSTEM (claude/transwm), GREYBOX-PLUS: rectangles, gradients and the game's own sprites (the heroes, the ferryman).
   An ART PASS replaces what is drawn here, never the timing (src/transitions.js): see the report's ART NOTES for exactly what it should paint.
   drawFerryScene: the whole screen, scene 'ferry' (the Wood's jetty -> the Marsh), at scene time s. drawArrivalFerry: the ferry the Marsh begins on, in WORLD space.
   drawBars: the letterbox. Nothing here allocates per frame beyond a few gradients; every loop is bounded (reeds are a fixed ring, hashed, never random). */
import { FERRY, sceneScroll, heroOnScene, ferryX } from './transitions.js';

const hash = n => { const v = Math.sin(n * 127.1 + 311.7) * 43758.5453; return v - Math.floor(v); };
const COL = { skyT: '#a9bcb0', skyB: '#e4dfbd', waterT: '#5f7f6e', waterB: '#2c4538', farPine: '#3f5a46', farMarsh: '#6f8a72', mist: '#e8efe0', bank: '#3b2f22', bankTop: '#566a38',
  deck: '#6e4d2c', deckTop: '#94683a', hull: '#34261a', hullLo: '#241a11', rope: '#cdb98a', reed: '#7f8f4a', reedD: '#55633a', reedHead: '#6b4a2c', post: '#4a3722', plank: '#7a5632', plankD: '#5a3e22' };

export function drawBars(g, VW, VH, bar) { if (bar <= 0.5) return; g.fillStyle = '#05040a'; g.fillRect(0, 0, VW, Math.round(bar)); g.fillRect(0, VH - Math.round(bar), VW, Math.round(bar)); }

/* a hull with a deck, `w` wide, its deck's top edge at y (the feet line). bob: px up and down; the stem and stern rise a little. */
function ferryBody(g, x, y, w, bob = 0) {
  y += bob;
  g.fillStyle = COL.hullLo; g.fillRect(x + 2, y + 8, w - 4, 3);
  g.fillStyle = COL.hull; g.fillRect(x, y + 2, w, 7);
  for (let i = 8; i < w - 6; i += 12) { g.fillStyle = COL.hullLo; g.fillRect(x + i, y + 3, 1, 5); }   /* the strakes' lap lines */
  g.fillStyle = COL.deck; g.fillRect(x, y, w, 3); g.fillStyle = COL.deckTop; g.fillRect(x, y, w, 1);
  g.fillStyle = COL.hull; g.fillRect(x - 4, y - 3, 6, 5); g.fillRect(x + w - 2, y - 4, 6, 6);   /* the stern and the bow rise */
  g.fillStyle = COL.rope; g.fillRect(x + 1, y - 1, 8, 1); g.fillRect(x + w - 9, y - 1, 8, 1);   /* the gunwale rope at stern and bow, bundled reed (the deck between is clear for the feet) */
  g.fillStyle = COL.reedD; for (let i = 0; i < 4; i++) g.fillRect(x + w - 10 + i * 2, y - 8 - (i & 1) * 2, 1, 8);   /* a reed bundle lashed at the bow */
}

function reedClump(g, x, base, h, sway, dark) {
  for (let k = 0; k < 5; k++) {
    const hh = h * (0.6 + hash(x + k * 7) * 0.5), dx = (k - 2) * 2.2 + sway * (hh / h), x0 = Math.round(x + (k - 2) * 2);
    g.fillStyle = dark ? COL.reedD : COL.reed; g.fillRect(x0, Math.round(base - hh), 1, Math.round(hh));
    g.fillStyle = dark ? COL.reedD : COL.reed; g.fillRect(Math.round(x0 + dx * 0.5), Math.round(base - hh) - 1, 1, 2);
    if (k % 2 === 0) { g.fillStyle = COL.reedHead; g.fillRect(Math.round(x0 + dx * 0.6), Math.round(base - hh) - 4, 2, 4); }
  }
}

/* THE FERRY SCENE. env: { g, VW, VH, time, n (heroes), drawHero(i, x, y, face, key, frame), drawFerryman(x, y, face, frame), reduce, alpha (the scene's own fade, 0..1 = black over it) } */
export function drawFerryScene(env, s) {
  const { g, VW, VH, time, n, reduce } = env, calm = !!reduce;
  const wl = Math.round(VH * 0.62), scroll = sceneScroll(s, calm), P = FERRY.parallax, sway = calm ? 0 : Math.sin(time * 1.6) * 1.2;
  const prog = Math.min(1, Math.max(0, (s - FERRY.poleAt) / 8));   /* how far on the crossing: the mist thickens at the very end into the fade */
  /* sky and the far water */
  let gr = g.createLinearGradient(0, 0, 0, wl); gr.addColorStop(0, COL.skyT); gr.addColorStop(1, COL.skyB); g.fillStyle = gr; g.fillRect(0, 0, VW, wl);
  /* FAR: the Wood's treeline (the last level recedes to the left) and then the Marsh's stilts and reed-beds arriving from the right */
  const far = scroll * P.far;
  g.fillStyle = COL.farPine;
  for (let i = 0; i < 24; i++) { const px = i * 13 + 4 - far, hh = 22 + hash(i) * 20; if (px < -20 || px > VW + 20) continue; g.beginPath(); g.moveTo(px - 8, wl - 3); g.lineTo(px, wl - 3 - hh); g.lineTo(px + 8, wl - 3); g.fill(); }
  g.fillStyle = COL.farMarsh;
  for (let i = 0; i < 14; i++) { const px = VW + 40 + i * 24 - far, hh = 6 + hash(i + 40) * 7; if (px < -30 || px > VW + 30) continue;
    g.fillRect(Math.round(px), Math.round(wl - 3 - hh), 2, Math.round(hh));   /* reed spires */
    if (i % 4 === 1) { g.fillRect(Math.round(px - 7), Math.round(wl - 14), 16, 5); g.fillRect(Math.round(px - 5), Math.round(wl - 9), 1, 7); g.fillRect(Math.round(px + 5), Math.round(wl - 9), 1, 7); } }   /* a stilt hut */
  /* the water */
  gr = g.createLinearGradient(0, wl - 3, 0, VH); gr.addColorStop(0, COL.waterT); gr.addColorStop(1, COL.waterB); g.fillStyle = gr; g.fillRect(0, wl - 3, VW, VH - wl + 3);
  g.fillStyle = 'rgba(232,239,224,0.18)'; for (let i = 0; i < 12; i++) { const y = wl + 4 + i * 6, x = ((hash(i + 9) * VW * 1.6 - scroll * (0.6 + i * 0.07) - (calm ? 0 : time * 6)) % (VW + 40) + VW + 40) % (VW + 40) - 20; g.fillRect(Math.round(x), y, 14 + (i % 3) * 6, 1); }
  /* MID: reed beds along the far bank of the channel (parallax 0.8) */
  const mid = scroll * P.mid;
  for (let i = 0; i < 16; i++) { const px = i * 38 + 20 - mid + (i % 3) * 5; if (px < -12 || px > VW + 12) continue; reedClump(g, px, wl + 1, 15 + hash(i + 3) * 6, sway, true); }
  /* the jetty and the bank (parallax 1: they are the ground the ferry leaves) */
  const ground = scroll, jx1 = VW * FERRY.dockAt + 6 - ground, jy = wl + 6;
  if (jx1 > -40) {
    g.fillStyle = COL.bank; g.fillRect(-2, jy - 5, Math.max(0, Math.min(VW, 30 - ground)), VH);   /* the Wood's bank, left of the jetty */
    g.fillStyle = COL.bankTop; g.fillRect(-2, jy - 5, Math.max(0, Math.min(VW, 30 - ground)), 3);
    g.fillStyle = COL.plank; g.fillRect(Math.round(24 - ground), jy - 5, Math.round(jx1 - 24 + ground), 3); g.fillStyle = COL.plankD; g.fillRect(Math.round(24 - ground), jy - 2, Math.round(jx1 - 24 + ground), 1);
    for (let x = 28; x < jx1 + ground - 2; x += 9) { g.fillStyle = COL.plankD; g.fillRect(Math.round(x - ground), jy - 5, 1, 3); }   /* the plank joints */
    for (let x = 34; x <= jx1 + ground; x += 30) { g.fillStyle = COL.post; g.fillRect(Math.round(x - ground), jy - 9, 3, 18); g.fillStyle = COL.rope; g.fillRect(Math.round(x - ground), jy - 9, 3, 1); }   /* bog-oak piles, rope-bound */
    g.fillStyle = COL.post; g.fillRect(Math.round(jx1 - 2), jy - 14, 3, 20); g.fillStyle = COL.rope; g.fillRect(Math.round(jx1 - 2), jy - 14, 3, 2);   /* the mooring post: the ferry's line goes to it */
  }
  /* the ferry: it does not move on the screen (the world slides under it); it rocks a little, and the mooring line drops when the ferryman poles off */
  const fx = Math.round(ferryX(VW)), fy = jy - 4 + 5, bob = calm ? 0 : Math.round(Math.sin(time * 2.2) * 0.7 + (s > FERRY.poleAt ? Math.sin(time * 3.1) * 0.4 : 0));
  ferryBody(g, fx, fy, FERRY.deckW, bob);
  if (s < FERRY.poleAt + 0.2 && jx1 > fx - 4) { g.fillStyle = COL.rope; g.fillRect(Math.round(jx1), fy - 8, Math.max(0, fx - Math.round(jx1)), 1); }
  /* the ferryman at the stern, poling: he leans on the pole and drives it down, then drags it, in time with her slide */
  const fmx = fx + 80, pole = s >= FERRY.poleAt - 0.2, ph = calm ? 0 : Math.sin(Math.max(0, s - FERRY.poleAt) * 2.4);
  env.drawFerryman(fmx, fy + bob, -1, 0);
  if (pole) { g.strokeStyle = '#5a4630'; g.lineWidth = 1; g.beginPath(); g.moveTo(fmx - 3, fy + bob - 11); g.lineTo(fmx - 16 - ph * 6, fy + bob + 15); g.stroke();
    g.fillStyle = 'rgba(232,239,224,0.35)'; g.fillRect(Math.round(fmx - 18 - ph * 6), fy + bob + 14, 5, 1); }   /* a ring where the pole bites */
  /* the heroes: they walk in over the jetty and step aboard (the ferryman's side), then stand */
  for (let i = 0; i < n; i++) {
    const h = heroOnScene(i, n, s, VW);
    const onJetty = h.x < fx - 2, yy = onJetty ? jy - 5 : fy + bob, hop = !h.aboard && h.x > fx - 14 && h.x < fx + 4 ? -3 : 0;   /* a hop over the gap at the gunwale */
    env.drawHero(i, h.x, yy + hop, 1, h.walking ? 'run' : 'idle', h.walking ? Math.floor(time * 12) : Math.floor(time * 4.5));
  }
  /* NEAR: reeds in front, parallax 1.25, sliding past (and over the bow) - they are what says "moving" */
  const near = scroll * P.near;
  for (let i = 0; i < 9; i++) { const px = ((i * 71 + 30 - near) % (VW + 90) + VW + 90) % (VW + 90) - 30; if (s < FERRY.poleAt + 0.5 && i < 4) continue; reedClump(g, px, VH - 12 + (i % 2) * 4, 24 + hash(i + 20) * 12, sway * 1.6, false); }
  /* MIST: two drifting bands over the water, thickening toward the end */
  const ma = (0.16 + 0.34 * prog) * (calm ? 0.8 : 1);
  for (let b = 0; b < 2; b++) { const my = wl - 14 + b * 22, mg = g.createLinearGradient(0, my, 0, my + 26); mg.addColorStop(0, 'rgba(232,239,224,0)'); mg.addColorStop(0.5, 'rgba(232,239,224,' + ma.toFixed(3) + ')'); mg.addColorStop(1, 'rgba(232,239,224,0)'); g.fillStyle = mg; g.fillRect(0, my, VW, 26); }
  if (prog > 0.6) { g.fillStyle = 'rgba(232,239,224,' + (((prog - 0.6) / 0.4) * 0.38).toFixed(3) + ')'; g.fillRect(0, 0, VW, VH); }
  /* the scene's own fade in at the start (out of the dark the walk left on) */
  const a = s < 0.45 ? 1 - s / 0.45 : 0; if (a > 0) { g.fillStyle = 'rgba(8,6,14,' + (a * a).toFixed(3) + ')'; g.fillRect(0, 0, VW, VH); }
}

/* THE ARRIVAL FERRY, in the Marsh's world: beached at the bank's west end, the heroes stand on it at the start, then walk off. cx/cy: the camera. floorY: the bank's top (px). */
export function drawArrivalFerry(env, cx, cy, floorY, time, mooredAt) {
  const { g, reduce } = env, bob = reduce ? 0 : Math.round(Math.sin(time * 2.2) * 0.6), x = -28 - cx, y = floorY - cy;
  if (x > env.VW + 10 || x < -140) return;
  ferryBody(g, x, y + bob, 84, 0);
    env.drawFerryman(Math.round(x + 8), y + bob, 1, 0);
}
