// ksar_set.js - THE BANDIT KSAR's SET (claude/ksar art pass): everything the fort is made of that is not a tile. It replaces the greybox's plain rectangles in src/ksar-hands.js.
//   THE WALLS      crenellated PARAPETS (tall merlons with arrow slits on the outer walls; low scuppered parapets on the roofs), weathered gong towers, arrow-slit turrets
//   THE LANDMARKS  THE HAWK TOWER (a mews of arched windows with perches and hooded hawks, machicolated top, a turret with a gilded hawk, the Hawk-Mistress's standard, a beacon),
//                  THE GREAT GONG'S TOWER (bannered, torch-flanked), THE MINARET (a banded shaft, a gallery over the balcony, a teal lantern cap), THE GATEHOUSE (a voussoir arch, murder holes,
//                  lamps, a lit guard room behind its grille), and far away on the horizon the fort's skyline with the Hawk Tower and its circling hawks (drawBack)
//   THE RULE'S PIECES  gongs (teak and brass, a cut one lies cracked), the great gong, the bricked arches (fresh brick in a stone frame), the portcullis (iron-bound, spiked), the winch (a capstan),
//                  the strongroom door (five seal sockets), kegs and flask racks, THE ROOF BRIDGE raised on its rope over a pulley beam to the gong - and lowered, the rope slack
//   DRESSING       awnings, stalls with goods, huts with bedrolls and lamps, barrels, crates, amphoras, sacks, carpets, banners, perches, a wrecked caravan cart, bone totems
//   LIGHTS         torches on the walls, braziers, hung lamps and lanterns (every one a light the game blooms; plan(...).lights)
// Everything is drawn from px.js-baked sprites (ksar_props.js) and plain fillRects, so tools/ksar-art-sheet.mjs can paint it in Node. A function draws one thing; the hands call them.
import * as P from './ksar_props.js';
import { KP, isAshlar, hash } from './ksar_tiles.js';
import { canvas, px, rect, line, fillPoly, ellipse, circle, outline } from '../px.js';

const R = Math.round, TS = 16;
const vis = (V, x0, x1, m = 60) => x1 > V.cx - m && x0 < V.cx + V.vw + m;
const put = (V, spr, wx, wy) => V.g.drawImage(spr, R(wx - V.cx), R(wy - V.cy));
const box = (V, x, y, w, h, c) => { V.g.fillStyle = c; V.g.fillRect(R(x - V.cx), R(y - V.cy), w, h); };
const glow = (V, x, y, r, a, warm = true) => { const g = V.g; if (V.noGlow || typeof g.createRadialGradient !== 'function') return; const sx = R(x - V.cx), sy = R(y - V.cy);
  const gr = g.createRadialGradient(sx, sy, 1, sx, sy, r); gr.addColorStop(0, (warm ? 'rgba(255,170,70,' : 'rgba(255,230,160,') + a + ')'); gr.addColorStop(1, 'rgba(255,120,40,0)');
  const o = g.globalCompositeOperation; g.globalCompositeOperation = 'lighter'; g.fillStyle = gr; g.fillRect(sx - r, sy - r, r * 2, r * 2); g.globalCompositeOperation = o; };
const cell = (V, x, y) => (x < 0 || y < 0 || x >= V.L.W || y >= V.L.H ? 1 : V.L.grid[y * V.L.W + x]);
/* the first solid or one-way row under (x, row) within `max` rows: where a pole stands */
const floorBelow = (V, x, row, max = 8) => { for (let y = row + 1; y <= row + max; y++) { const t = cell(V, x, y); if (t === V.T.SOLID || t === V.T.ONEWAY) return y; } return row + 3; };

/* ================================================================ THE PLAN: dressing and lights, from the level's own ents and tops */
export function plan(L, T) {
  const at = (x, y) => (x < 0 || y < 0 || x >= L.W || y >= L.H ? T.SOLID : L.grid[y * L.W + x]);
  const dress = [], lights = [], used = [];
  const free = (x, y, d = 2) => !L.ents.some(e => Math.abs(e.x - x) <= d && Math.abs(e.y - y) <= 3) && !(L.drops || []).some(([a, b]) => x >= a - 2 && x <= b + 2) && !(L.breaches || []).some(([a, b]) => x >= a - 2 && x <= b + 2)
    && !used.some(([ux, uy]) => uy === y && Math.abs(ux - x) < 4) && !(L.gate && x >= L.gate.x - 4 && x <= 272) && !(L.decor || []).some(d => d.kind === 'hut' && x >= d.x0 && x <= d.x1 && Math.abs(d.floor - y) < 7);
  const top = (x, y) => at(x, y) === T.SOLID && at(x, y - 1) === T.AIR && at(x, y - 2) === T.AIR && at(x, y - 3) === T.AIR;
  const zone = x => x < 72 ? 'road' : x < 232 ? 'wall' : x < 273 ? 'yard' : x < 358 ? 'souq' : x < 446 ? 'store' : x < 584 ? 'roofs' : 'court';
  const KINDS = { road: ['crate', 'sacks', 'bones', 'amphora'], wall: ['barrel', 'stones', 'crate', 'sacks', 'bones'], yard: ['barrel', 'crate', 'sacks', 'trough', 'amphora', 'rack'], souq: ['amphora', 'amphora', 'dates', 'sacks', 'carpet', 'barrel', 'crate'],
    store: ['powder', 'sacks', 'barrel', 'crate', 'powder'], roofs: ['amphora', 'barrel', 'carpet', 'dates', 'sacks', 'crate'] };
  const DENS = { road: 0.26, wall: 0.34, yard: 0.5, souq: 0.5, store: 0.4, roofs: 0.34 };
  for (let x = 6; x < 584; x++) { const z = zone(x); if (!KINDS[z] || hash(x, 91) % 100 >= DENS[z] * 100) continue;
    for (let y = 4; y < L.H - 4; y++) if (top(x, y) && free(x, y - 1)) { const k = KINDS[z][hash(x, y) % KINDS[z].length]; dress.push({ k, x, y: y - 1, v: hash(y, x) % 3 }); used.push([x, y - 1]); break; } }
  /* hand-placed: the wrecked cart on the road, a bone totem at the wall's foot, perches in the guard huts and on the tower roof, banners */
  const B = 34;
  dress.push({ k: 'wreck', x: 63, y: B - 1 }, { k: 'totem', x: 70, y: B - 1 }, { k: 'totem', x: 11, y: 35 }, { k: 'perch', x: 544, y: 20, v: 0 }, { k: 'perch', x: 551, y: 20, v: 1 }, { k: 'perch', x: 40, y: B - 1, v: 1 },
    { k: 'banner', x: 97, y: 21 }, { k: 'banner', x: 255, y: B - 1 }, { k: 'banner', x: 273, y: B - 1 }, { k: 'banner', x: 356, y: 24 }, { k: 'banner', x: 445, y: 24 }, { k: 'banner', x: 531, y: 20 }, { k: 'banner', x: 457, y: 24 });
  /* LIGHTS: [kind, tileX, floorRow, dx px] - the world pixel is (x*16+8+dx, (row+1)*16) at the floor */
  const L0 = (kind, x, row, r = 56, dx = 0, up = 0) => lights.push({ kind, wx: x * TS + 8 + dx, wy: (row + 1) * TS - up, x, row, r });
  for (const x of [92, 116, 140, 170, 188, 210, 228]) L0('torch', x, 27, 54);                       /* the outer wall's torches: one every 24 columns */
  L0('torch', 29, 33, 50); L0('torch', 52, 33, 50); L0('torch', 46, 33, 40, 0, 0);                  /* the road's: the first gong, the hut's door */
  L0('brazier', 233, 24, 70); L0('torch', 238, 24, 50); L0('brazier', 248, 25, 60);                                      /* the great gong's tower, the yard under it */
  L0('brazier', 247, 33, 70); L0('brazier', 255, 33, 62);                                           /* the yard, the gatehouse's foot */
  for (const x of [261, 266, 270]) lights.push({ kind: 'lamp', wx: x * TS + 8, wy: 30 * TS - 2, x, row: 29, r: 62 });   /* the gate passage: three hung lamps */
  lights.push({ kind: 'lamp', wx: 255 * TS + 8, wy: 29 * TS + 10, x: 255, row: 29, r: 58, arm: 2 }, { kind: 'lamp', wx: 255 * TS + 8, wy: 24 * TS + 6, x: 255, row: 24, r: 50, arm: 2 });        /* the gatehouse's outer lamp */
  L0('brazier', 262, 28, 66, 0, 0);                                                                 /* the guard room's brazier, glowing behind its grille */
  L0('brazier', 276, 33, 72); L0('brazier', 300, 33, 62); L0('brazier', 331, 33, 64); L0('brazier', 354, 33, 60);   /* the souq */
  for (const x of [311, 318, 324]) lights.push({ kind: 'lantern', wx: x * TS + 8, wy: 30 * TS + 2, x, row: 30, r: 58 });   /* the souq hall's lanterns */
  for (const x of [284, 292, 336]) lights.push({ kind: 'lantern', wx: x * TS + 8, wy: 31 * TS + 6, x, row: 31, r: 40 });   /* under the stalls' awnings */
  L0('brazier', 384, 24, 62); L0('brazier', 394, 24, 66); L0('brazier', 440, 24, 54);                                    /* the terrace and the powder store's door */
  for (const x of [419, 426]) lights.push({ kind: 'lantern', wx: x * TS + 8, wy: 27 * TS, x, row: 27, r: 56 });         /* the cellar */
  L0('torch', 463, 18, 50); L0('torch', 486, 18, 50); L0('torch', 504, 20, 50); L0('torch', 519, 20, 50); L0('torch', 537, 20, 50); /* the roofs */
  lights.push({ kind: 'lamp', wx: 545 * TS + 8, wy: 16 * TS + 8, x: 545, row: 16, r: 54 }, { kind: 'lamp', wx: 551 * TS + 8, wy: 16 * TS + 8, x: 551, row: 16, r: 54 });   /* the hut under the tower */
  L0('brazier', 566, 20, 74); L0('brazier', 571, 20, 74);                                           /* THE HAWK TOWER's room */
  lights.push({ kind: 'beacon', wx: 567 * TS + 8, wy: 9 * TS - 6, x: 567, row: 8, r: 88 });         /* its beacon on the roof */
  L0('torch', 572, 33, 50); lights.push({ ...{ kind: 'lantern', wx: 570 * TS + 8, wy: 34 * TS, x: 570, row: 33, r: 50 }, floor: true });                                              /* the strongroom's door */
  const G = L.arena; if (G) { const sx = G.hm.sx, Rr = G.hm.R; for (const c of [1, 10, 20, 29, 38]) L0('brazier', sx + c, Rr - 1, 80); }   /* her courtyard: braziers along the floor */
  return { dress, lights };
}

/* ================================================================ THE DECOR (back layer) */
const MERLON = { body: '#a5643f', lit: '#c8885a', sh: '#7a4429', cap: '#e6cf9e', slit: '#1d1218', mort: '#6a3a26' };
/* a tall PARAPET along the outer wall: merlons 20 wide with arrow slits, embrasures between, a low wall under; plus scuppers and a soot streak */
function parapet(V, d) {
  const x0 = Math.max(d.x0 * TS, Math.floor((V.cx - 40) / 32) * 32), x1 = Math.min((d.x1 + 1) * TS, V.cx + V.vw + 40), y = d.y * TS;
  box(V, x0, y - 5, x1 - x0, 5, MERLON.body); box(V, x0, y - 5, x1 - x0, 1, MERLON.cap); box(V, x0, y - 1, x1 - x0, 1, MERLON.mort);
  for (let x = Math.ceil(x0 / 32) * 32; x < x1; x += 32) { if ((L_breach(V, x))) continue;
    box(V, x, y - 17, 20, 13, MERLON.body); box(V, x, y - 17, 3, 13, MERLON.sh); box(V, x + 17, y - 17, 3, 13, MERLON.lit); box(V, x - 1, y - 19, 22, 3, MERLON.cap); box(V, x - 1, y - 17, 22, 1, MERLON.sh);
    box(V, x + 9, y - 14, 2, 7, MERLON.slit); box(V, x + 8, y - 15, 4, 1, MERLON.mort);
    if (hash(x >> 5, 5) % 3 === 0) { box(V, x + 5, y - 6, 2, 6, 'rgba(40,24,16,0.35)'); }   /* soot */
    if (hash(x >> 5, 9) % 4 === 0) { box(V, x + 1, y - 9, 4, 1, MERLON.mort); box(V, x + 12, y - 12, 3, 1, MERLON.mort); }
    if ((x >> 5) % 6 === 2) { box(V, x + 2, y - 3, 5, 3, '#8a8a7a'); box(V, x + 2, y - 3, 5, 1, '#b8b8a8'); }   /* a scupper's stone spout */ }
}
const L_breach = (V, x) => (V.L.breaches || []).some(([a, b]) => x >= (a - 1) * TS && x <= (b + 1) * TS + 8);
/* a LOW roof parapet along a stretch of flat roof: blocks with crenel notches and drain spouts */
function lowParapet(V, x0, x1, row) {
  const y = row * TS;
  for (let x = Math.max(x0 * TS, Math.floor((V.cx - 20) / 16) * 16); x < Math.min(x1 * TS, V.cx + V.vw + 20); x += 16) { const m = (x >> 4) & 1;
    if (hash(x >> 4, row) % 11 === 0) continue;   /* a gap: a broken block */
    box(V, x, y - 4, 16, 4, '#9a5a38'); box(V, x, y - 4, 16, 1, '#e0c898'); if (!m) { box(V, x + 1, y - 9, 11, 5, '#a5643f'); box(V, x + 1, y - 9, 11, 1, '#e6cf9e'); box(V, x + 1, y - 9, 2, 5, '#7a4429'); box(V, x + 6, y - 7, 1, 3, '#1d1218'); } }
}
/* the GUARD HUT: an interior - a plaster back wall, vigas, bedrolls, a lamp, a weapon rack, jars, curtains and palm-trunk door posts */
function hut(V, d) {
  const x0 = (d.x0 + 1) * TS, x1 = d.x1 * TS, y0 = (d.y + 1) * TS, y1 = d.floor * TS; if (!vis(V, x0, x1)) return;
  box(V, x0, y0, x1 - x0, y1 - y0, '#4a2e22'); box(V, x0, y0, x1 - x0, 6, '#2e1c16'); box(V, x0, y0 + 6, x1 - x0, 6, '#3a241c');
  for (let x = x0; x < x1; x += 20) { box(V, x, y0 + 12, 1, y1 - y0 - 18, '#3e271d'); }                                  /* board seams */
  for (let x = x0 + 4; x < x1 - 8; x += 16) { box(V, x, y0, 6, 4, '#6a4528'); box(V, x + 1, y0 + 1, 4, 2, '#b88a52'); }  /* viga ends under the roof */
  box(V, x0, y1 - 4, x1 - x0, 4, '#2a1a14'); box(V, x0, y1 - 5, x1 - x0, 1, '#5a3a28');
  const n = Math.max(1, Math.floor((x1 - x0) / 56));
  for (let i = 0; i < n; i++) { const cx0 = x0 + 14 + i * Math.floor((x1 - x0 - 28) / n) + (hash(i, d.x0) % 6);
    box(V, cx0, y1 - 9, 22, 5, '#c8a860'); box(V, cx0, y1 - 9, 22, 1, '#e0c880'); box(V, cx0 + 8, y1 - 10, 14, 4, i & 1 ? '#a8302a' : '#2a4a7a'); box(V, cx0 + 8, y1 - 10, 14, 1, i & 1 ? '#d85a3a' : '#4a6aa0'); box(V, cx0 - 2, y1 - 11, 5, 4, '#e8d8b0');   /* a bedroll, a blanket, a pillow */ }
  /* the weapon rack on the back wall: crossed curved blades and a quiver */
  const rx = x0 + Math.floor((x1 - x0) * 0.6); box(V, rx, y0 + 18, 22, 2, '#3a2014'); for (let k = 0; k < 4; k++) box(V, rx + 2 + k * 5, y0 + 20, 1, 9, k % 2 ? '#c8d0dc' : '#8a929e'); box(V, rx + 20, y0 + 18, 4, 10, '#6a4528');
  put(V, P.bakeAmphora(d.x0 % 3), x1 - 26, y1 - 22);
  const lamp = P.bakeLamp(Math.floor(V.time * 6) & 1); put(V, lamp, (x0 + x1) / 2 - 6, y0 + 4);
  for (const px0 of [x0 - 2, x1 - 2]) { box(V, px0, y0, 4, y1 - y0, '#5a3420'); box(V, px0, y0, 1, y1 - y0, '#8a5a34'); box(V, px0 - 1, y1 - 3, 6, 3, '#3a2014'); }   /* the door posts, palm trunks */
  for (const [cx0, dir] of [[x0 + 2, 1], [x1 - 10, -1]]) { for (let k = 0; k < 8; k++) { const sway = Math.round(Math.sin(V.time * 1.4 + k) * 1); box(V, cx0 + k + sway * (k > 4 ? 1 : 0), y0 + 1, 1, 18 + (k % 2) * 2, k % 2 ? '#8a2a24' : '#a8302a'); } box(V, cx0, y0 + 19, 8, 1, '#d8b050'); }   /* curtains looped back */
}
/* AWNINGS: striped canvas on poles that stand to the floor below, scalloped, with a sag; the shade underneath is the level's (shadeBox) */
const STRIPES = [['#a8302a', '#e8d8b0'], ['#2a4a7a', '#e8d8b0'], ['#c88a2a', '#a8302a'], ['#3a6a4a', '#e8d8b0']];
function awning(V, d) {
  const x0 = d.x0 * TS, x1 = (d.x1 + 1) * TS, y = d.y * TS; if (!vis(V, x0, x1)) return; const st = STRIPES[hash(d.x0, d.y) % 4];
  const fl = Math.min(floorBelow(V, d.x0, d.y) , floorBelow(V, d.x1, d.y)) * TS;
  for (const px0 of [x0 + 1, x1 - 4]) { box(V, px0, y + 2, 3, fl - y - 2, '#5a3420'); box(V, px0, y + 2, 1, fl - y - 2, '#8a5a34'); box(V, px0 - 1, y, 5, 3, '#d9b04a'); }
  box(V, x0 - 2, y + 4, x1 - x0 + 4, 1, '#3a2014');
  for (let x = x0 - 2; x < x1 + 2; x += 4) { const sag = Math.round(Math.sin((x - x0) / (x1 - x0) * Math.PI) * 2), c = st[((x - x0) >> 2) & 1];
    box(V, x, y + 5, 4, 5 + sag, c); box(V, x, y + 5, 4, 1, c === st[0] ? '#d85a3a' : '#fffff0'); box(V, x, y + 10 + sag, 4, 2, c); box(V, x + 1, y + 12 + sag, 2, 1, c); }   /* the scallops */
}
/* STALLS under a ledge: the counter on the floor with the goods; hung rugs on the back */
function stall(V, d) {
  const x0 = d.x0 * TS, x1 = (d.x1 + 1) * TS, fl = (floorBelow(V, d.x0, d.y + 1) ) * TS; if (!vis(V, x0, x1)) return;
  for (const px0 of [x0 + 1, x1 - 4]) { box(V, px0, d.y * TS + 2, 3, fl - d.y * TS - 2, '#5a3420'); box(V, px0, d.y * TS + 2, 1, fl - d.y * TS - 2, '#8a5a34'); }
  const cv = P.bakeCarpet(d.x0 & 1); for (let k = 0; k < 2; k++) put(V, cv, x0 + 6 + k * 24, d.y * TS + 10);                  /* rugs hung from the beam */
  box(V, x0 + 4, fl - 10, x1 - x0 - 8, 4, '#8a5a32'); box(V, x0 + 4, fl - 10, x1 - x0 - 8, 1, '#b88450'); box(V, x0 + 6, fl - 6, 3, 6, '#5a3a1e'); box(V, x1 - 10, fl - 6, 3, 6, '#5a3a1e');   /* the counter */
  put(V, P.bakeAmphora(d.x0 % 3), x0 + 8, fl - 26); put(V, P.bakeDates(), x0 + 24, fl - 19); if (x1 - x0 > 56) put(V, P.bakeAmphora((d.x0 + 1) % 3), x1 - 24, fl - 26);
}
/* the SOUQ HALL: posts with carved capitals, a covered roof of beams and hung cloth, lamps (the lantern lights are the plan's) */
function souqRoof(V, d) {
  const x0 = d.x0 * TS, x1 = (d.x1 + 1) * TS, y = (d.y + 1) * TS, fl = 34 * TS; if (!vis(V, x0, x1)) return;
  box(V, x0, y, x1 - x0, fl - y, 'rgba(30,18,14,0.38)');
  for (let x = x0 + 4; x < x1 - 6; x += 16) { box(V, x, y, 6, 4, '#6a4528'); box(V, x + 1, y + 1, 4, 2, '#b88a52'); }
  for (const px0 of [x0 + 6, Math.round((x0 + x1) / 2) - 2, x1 - 12]) { box(V, px0, y + 4, 5, fl - y - 4, '#5a3420'); box(V, px0, y + 4, 1, fl - y - 4, '#8a5a34'); box(V, px0 - 3, y + 4, 11, 4, '#d9b04a'); box(V, px0 - 2, y + 8, 9, 2, '#8a6a22'); box(V, px0 - 2, fl - 4, 9, 4, '#8a8a7a'); }
  for (let k = 0; k < 6; k++) { const cx0 = x0 + 20 + k * Math.floor((x1 - x0 - 40) / 5); const sway = Math.round(Math.sin(V.time * 1.2 + k * 1.7) * 1.5), c = ['#a8302a', '#2a4a7a', '#c88a2a'][k % 3];   /* hung cloths */
    for (let r = 0; r < 14; r++) box(V, cx0 + sway * (r > 8 ? 1 : 0), y + 10 + r, 7, 1, r % 4 === 0 ? '#d8b050' : c); box(V, cx0, y + 24, 7, 1, '#f0e0b0'); }
  for (const x of [x0 + 28, x1 - 40]) { put(V, P.bakeCarpet(1), x, fl - 12); put(V, P.bakeAmphora(1), x + 18, fl - 18); }
}
/* the MINARET: a banded shaft rising from the terrace, a teal lantern cap, a gallery out to the balcony deck with a balustrade */
function minaret(V, d) {
  const mx = d.x * TS - 6, top = d.top * TS, base = (d.y + 1) * TS; if (!vis(V, mx - 100, mx + 40)) return;
  const shaft = P.bakeMinaretShaft(), cap = P.bakeMinaretCap(), cxm = mx + 12;
  let n = 0; for (let y = top + 44; y < base; y += 16, n++) put(V, n % 3 === 1 ? P.bakeMinaretShaft(1) : shaft, mx, y);
  box(V, mx - 3, base - 10, 30, 10, '#e0b080'); box(V, mx - 3, base - 10, 30, 2, '#f0e0c0'); box(V, mx - 3, base - 2, 30, 2, '#8a6a4a');   /* the plinth */
  put(V, cap, cxm - 18, top);
  /* the gallery at the balcony deck (row 16): a deck reaching west, corbels from the shaft, a balustrade */
  const gy = 16 * TS, gx0 = 358 * TS, gx1 = mx + 4;
  box(V, gx0, gy - 11, gx1 - gx0, 2, '#f0e0c0'); for (let x = gx0 + 2; x < gx1 - 2; x += 6) box(V, x, gy - 9, 2, 8, '#c08a5c'); box(V, gx0, gy - 1, 2, 1, '#8a6a4a');
  for (let k = 0; k < 4; k++) { box(V, mx - 2 - k * 5, gy + 5 + k * 3, 4, 2, '#c08a5c'); }   /* the corbels under the shaft */
  box(V, gx0 + 4, gy + 6, gx1 - gx0 - 6, 2, '#6a4528');
  for (const x of [gx0 + 10, gx0 + 60]) put(V, P.bakeLantern(Math.floor(V.time * 4 + x) & 1), x, gy + 7);
}
/* a BANNER: a pole with the Hawk-Mistress's standard - madder red, a black hawk, tassels - swaying on columns */
const HAWK_EMBLEM = ['.....bb.', '..bbbbbb', 'bbbbbbb.', '.bbbbb..', '..bbb...', '...bb.b.', '..b..b..'];
function banner(V, x, y) {
  const wx = x * TS + 6, wy = (y + 1) * TS; if (!vis(V, wx, wx + 20)) return;
  box(V, wx, wy - 42, 2, 42, '#5a3420'); box(V, wx - 1, wy - 44, 4, 3, '#d9b04a'); box(V, wx - 1, wy - 41, 18, 2, '#3a2014');
  for (let c = 0; c < 14; c++) { const sw = Math.round(Math.sin(V.time * 3 + c * 0.5) * (c / 14) * 1.6), cx0 = wx + 3 + c, hang = 22 + (c % 3 === 0 ? 0 : 1) - Math.round(Math.abs(sw) * 0.5);
    box(V, cx0, wy - 39 + sw, 1, hang, c < 1 ? '#6a1e1e' : '#a8302a'); if (c > 1 && c < 13) box(V, cx0, wy - 39 + sw, 1, 1, '#d85a3a'); box(V, cx0, wy - 39 + sw + hang - 2, 1, 2, '#d8b050'); }
  for (let r = 0; r < HAWK_EMBLEM.length; r++) for (let c = 0; c < 8; c++) if (HAWK_EMBLEM[r][c] === 'b') box(V, wx + 6 + c, wy - 32 + r + Math.round(Math.sin(V.time * 3 + c) * 0.5), 1, 1, '#1b1626');
}
/* a bone totem: a pole with a hawk skull, feathers and a rag - the raiders' mark on the road to the fort */
function totem(V, x, y) { const wx = x * TS + 7, wy = (y + 1) * TS; if (!vis(V, wx, wx + 10)) return;
  box(V, wx, wy - 40, 3, 40, '#3e2616'); box(V, wx, wy - 40, 1, 40, '#6a4528'); put(V, P.bakeBones(), wx - 8, wy - 11);
  box(V, wx - 3, wy - 34, 9, 6, '#e8e0c8'); box(V, wx - 2, wy - 33, 2, 2, '#1b1626'); box(V, wx + 2, wy - 33, 2, 2, '#1b1626'); box(V, wx, wy - 30, 3, 3, '#d8b040'); box(V, wx - 3, wy - 28, 9, 1, '#b8a888');   /* the hawk's skull */
  for (let k = 0; k < 4; k++) { const sway = Math.round(Math.sin(V.time * 2 + k)); box(V, wx - 5 + sway, wy - 36 + k * 3, 3, 1, k % 2 ? '#8a5a32' : '#5a3a1e'); box(V, wx + 5 - sway, wy - 38 + k * 3, 3, 1, k % 2 ? '#e0caa0' : '#6a4428'); }
  box(V, wx + 3, wy - 22, 5, 9, '#a8302a'); box(V, wx + 3, wy - 22, 5, 1, '#d85a3a'); }
function palmStump(V, x, y) { const wx = x * TS + 4, wy = (y + 1) * TS; if (!vis(V, wx, wx + 30)) return;
  box(V, wx, wy - 22, 7, 22, '#6a4528'); for (let k = 0; k < 5; k++) box(V, wx, wy - 20 + k * 4, 7, 1, '#4a2e1a'); box(V, wx - 1, wy - 24, 9, 3, '#8a5a34'); box(V, wx + 7, wy - 26, 9, 2, '#6a8a4a'); box(V, wx - 9, wy - 25, 9, 2, '#4a6a3a'); box(V, wx + 14, wy - 25, 3, 5, '#6a8a4a'); box(V, wx - 11, wy - 24, 3, 6, '#4a6a3a'); }
function milestone(V, x, y) { const wx = x * TS + 3, wy = (y + 1) * TS; if (!vis(V, wx, wx + 14)) return;
  box(V, wx, wy - 18, 10, 18, '#b8a888'); box(V, wx - 1, wy - 20, 12, 3, '#d8c8a8'); box(V, wx, wy - 18, 2, 18, '#8a7a5a'); box(V, wx + 8, wy - 16, 2, 16, '#d8c8a8'); box(V, wx + 3, wy - 13, 4, 1, '#5a4a30'); box(V, wx + 5, wy - 13, 1, 5, '#5a4a30'); box(V, wx + 3, wy - 9, 5, 1, '#5a4a30'); }

/* the dressing list's sprites */
function dressItem(V, d) { const wx = d.x * TS, wy = (d.y + 1) * TS; if (!vis(V, wx - 20, wx + 40)) return;
  switch (d.k) {
    case 'barrel': put(V, P.bakeBarrel(d.v % 2), wx + 1, wy - 18); if (d.v === 2) put(V, P.bakeBarrel(0), wx + 12, wy - 18); break;
    case 'powder': put(V, P.bakeBarrel(2), wx + 1, wy - 18); put(V, P.bakeCrate(0), wx + 14, wy - 13); break;
    case 'crate': put(V, P.bakeCrate(1), wx, wy - 16); if (d.v) put(V, P.bakeCrate(0), wx + 14, wy - 13); break;
    case 'sacks': put(V, P.bakeSacks(), wx - 3, wy - 14); break;
    case 'amphora': put(V, P.bakeAmphora(d.v), wx + 2, wy - 18); if (d.v === 2) put(V, P.bakeAmphora(0), wx + 12, wy - 18); break;
    case 'dates': put(V, P.bakeDates(), wx, wy - 10); break;
    case 'carpet': put(V, P.bakeCarpet(d.v & 1), wx, wy - 12); break;
    case 'trough': put(V, P.bakeTrough(), wx - 7, wy - 12); break;
    case 'rack': put(V, P.bakeRack(), wx - 7, wy - 12); put(V, P.bakeFlask(), wx - 3, wy - 22); put(V, P.bakeFlask(), wx + 6, wy - 22); break;
    case 'bones': put(V, P.bakeBones(), wx - 2, wy - 9); break;
    case 'stones': for (let k = 0; k < 5; k++) { box(V, wx + 2 + k * 3 - (k > 2 ? 4 : 0), wy - 4 - (k > 2 ? 4 : 0), 4, 4, k & 1 ? '#8a8272' : '#a89a82'); box(V, wx + 2 + k * 3 - (k > 2 ? 4 : 0), wy - 4 - (k > 2 ? 4 : 0), 4, 1, '#d0c4a8'); } break;
    case 'wreck': put(V, P.bakeWreck(), wx, wy - 26); break;
    case 'totem': totem(V, d.x, d.y); break;
    case 'perch': put(V, P.bakePerch(Math.floor(V.time * 0.7 + d.x) & 1), wx - 4, wy - 30); break;
    case 'banner': banner(V, d.x, d.y); break;
  } }

/* ================================================================ THE LANDMARKS */
/* THE HAWK TOWER (columns 560-575, rows 9-20 of ashlar): the mews, the machicolated top, the turret and its gilded hawk, the standard and the beacon */
function hawkTower(V) {
  const x0 = 560 * TS, x1 = 576 * TS, top = 9 * TS; if (!vis(V, x0 - 40, x1 + 40, 80)) return;
  /* the crown: merlons on the roof with a corbel course under them */
  for (let x = x0; x < x1 - 16; x += 24) { box(V, x + 2, top - 12, 16, 12, '#c6c3b4'); box(V, x + 2, top - 12, 16, 2, '#ece9de'); box(V, x + 2, top - 12, 3, 12, '#8c8a7c'); box(V, x + 16, top - 12, 2, 12, '#ece9de'); box(V, x + 9, top - 9, 2, 6, '#1d1218'); }
  box(V, x0 - 2, top - 3, x1 - x0 + 4, 4, '#d2cfc2'); box(V, x0 - 2, top - 3, x1 - x0 + 4, 1, '#ece9de');
  for (let x = x0 + 2; x < x1 - 4; x += 8) { box(V, x, top + 4, 6, 3, '#9a9788'); box(V, x + 1, top + 7, 4, 3, '#8c8a7c'); box(V, x + 2, top + 10, 2, 2, '#6a685e'); }   /* machicolation corbels */
  /* the mews: three arched windows with a perch bar and a hooded hawk each, under a hood-mould */
  for (const [i, wxT] of [563.2, 567.4, 571.6].entries()) { const wx = R(wxT * TS), wy = 11 * TS + 2;
    box(V, wx - 3, wy - 2, 22, 40, '#ece9de'); box(V, wx - 2, wy - 1, 20, 38, '#58564e'); box(V, wx, wy + 1, 16, 34, '#1d1218'); box(V, wx + 2, wy - 1, 12, 2, '#1d1218'); box(V, wx + 1, wy, 14, 2, '#1d1218');
    box(V, wx, wy + 1, 2, 34, '#2e1f26'); for (let b = 0; b < 4; b++) box(V, wx + 3 + b * 4, wy + 3, 1, 30, '#4a4a52');   /* the grille */
    box(V, wx - 4, wy + 36, 24, 3, '#ece9de'); box(V, wx - 4, wy + 38, 24, 1, '#8c8a7c');
    const hx = wx + 5, hy = wy + 20; box(V, wx - 6, hy + 8, 28, 2, '#5a3420'); box(V, wx - 6, hy + 8, 28, 1, '#8a5a34');   /* the perch bar, through the window */
    box(V, hx, hy - 6, 7, 14, '#6a4428'); box(V, hx + 1, hy - 3, 5, 8, '#e0caa0'); box(V, hx, hy - 9, 7, 5, i & 1 ? '#a8302a' : '#1b1626'); box(V, hx + 3, hy - 11, 1, 2, '#d8b040'); box(V, hx - 1, hy + 6, 9, 2, '#3e2614');
    if (Math.floor(V.time * 0.5 + i * 2) % 5 === 0) { box(V, hx - 5, hy - 4, 5, 10, '#6a4428'); box(V, hx - 5, hy - 1, 5, 2, '#3e2614'); } }   /* a wing opens now and then */
  /* the turret and its gilded hawk, the standard and the beacon on the roof */
  box(V, x1 - 44, top - 36, 28, 36, '#c6c3b4'); box(V, x1 - 44, top - 36, 4, 36, '#8c8a7c'); box(V, x1 - 20, top - 36, 4, 36, '#ece9de'); box(V, x1 - 34, top - 28, 2, 9, '#1d1218'); box(V, x1 - 28, top - 16, 2, 9, '#1d1218');
  fillPoly(V.g, [[x1 - 46 - V.cx, top - 36 - V.cy], [x1 - 14 - V.cx, top - 36 - V.cy], [x1 - 30 - V.cx, top - 64 - V.cy]], '#3a7a82'); fillPoly(V.g, [[x1 - 30 - V.cx, top - 36 - V.cy], [x1 - 14 - V.cx, top - 36 - V.cy], [x1 - 30 - V.cx, top - 64 - V.cy]], '#4a9aa2');
  box(V, x1 - 31, top - 70, 2, 8, '#8a6a22'); put(V, P.bakeGildedHawk(), x1 - 41, top - 88);   /* the gilded hawk on its spike */
  box(V, x0 + 4, top - 52, 2, 40, '#5a3420'); banner(V, 560, 8);
  const bx = 567 * TS + 8; box(V, bx - 7, top - 12, 14, 4, '#3a3a42'); box(V, bx - 5, top - 8, 10, 3, '#2a2a32'); const fl = Math.floor(V.time * 9) % 3; box(V, bx - 5, top - 17 - fl, 10, 6, '#d8481a'); box(V, bx - 3, top - 21 - fl, 6, 5, '#ff8a2a'); box(V, bx - 1, top - 24 - fl, 3, 4, '#ffc84a'); box(V, bx, top - 25 - fl, 1, 2, '#fff4b0');   /* the beacon bowl */
  glow(V, bx, top - 14, 70, 0.34);
  /* a hawk wheels over it */
  const a = V.time * 0.8, hx = bx + Math.cos(a) * 52, hy = top - 44 + Math.sin(a * 1.3) * 12; box(V, hx - 4, hy, 9, 2, '#3e2614'); box(V, hx - 1, hy - 1, 3, 3, '#6a4428');
}
/* THE GREAT GONG'S TOWER (232-238, rows 25-36) - a bannered ashlar tower with torches either side and a lit gallery lintel */
function greatTower(V) { const x0 = 232 * TS, x1 = 239 * TS, top = 25 * TS; if (!vis(V, x0, x1)) return;
  for (let x = x0; x < x1 - 8; x += 24) { box(V, x + 2, top - 10, 16, 10, '#c6c3b4'); box(V, x + 2, top - 10, 16, 2, '#ece9de'); box(V, x + 2, top - 10, 3, 10, '#8c8a7c'); box(V, x + 9, top - 7, 2, 5, '#1d1218'); }
  box(V, x0 - 2, top - 2, x1 - x0 + 4, 3, '#d2cfc2'); box(V, x0 - 2, top - 2, x1 - x0 + 4, 1, '#ece9de');
  for (const x of [x0 + 10, x1 - 28]) { for (let c = 0; c < 14; c++) { const sw = Math.round(Math.sin(V.time * 2.4 + c * 0.5 + x) * (c / 14) * 1.4); box(V, x + c, top + 24 + sw, 1, 40 + (c % 2) * 2, c < 1 ? '#6a1e1e' : '#a8302a'); } box(V, x - 1, top + 22, 16, 2, '#d9b04a'); for (let r = 0; r < 5; r++) for (let c = 0; c < 8; c++) if (HAWK_EMBLEM[r][c] === 'b') box(V, x + 3 + c, top + 40 + r, 1, 1, '#1b1626'); } }
/* THE GATEHOUSE (257-272, rows 15-36): the roof's merlons, the voussoir arch round the passage's mouth, murder holes, a lit guard room behind the grille */
function gatehouse(V) { const x0 = 257 * TS, x1 = 273 * TS; if (!vis(V, x0 - 60, x1 + 20, 120)) return;
  for (let x = x0; x < x1 - 8; x += 24) { box(V, x + 2, 15 * TS - 12, 16, 12, '#c6c3b4'); box(V, x + 2, 15 * TS - 12, 16, 2, '#ece9de'); box(V, x + 2, 15 * TS - 12, 3, 12, '#8c8a7c'); box(V, x + 9, 15 * TS - 9, 2, 6, '#1d1218'); }
  box(V, x0 - 2, 15 * TS - 3, x1 - x0 + 4, 4, '#d2cfc2'); box(V, x0 - 2, 15 * TS - 3, x1 - x0 + 4, 1, '#ece9de');
  /* the voussoir arch round the portcullis (a pale ring of wedge stones) */
  const ay = 30 * TS, ax = 257 * TS; box(V, ax - 8, ay - 10, 4, 4 * TS + 10, '#ece9de'); box(V, ax - 8, ay - 10, 1, 4 * TS + 10, '#8c8a7c'); box(V, ax + TS, ay - 10, 4, 10, '#ece9de');
  for (let k = 0; k < 8; k++) { const w = 7 + (k & 1); box(V, ax - 8 + k * 3 - 1, ay - 12 + Math.abs(k - 3.5) * 1.4, 4, 4, k & 1 ? '#d2cfc2' : '#b9b5a4'); }
  /* murder holes in the passage's ceiling (row 29), and the slot over the gate */
  for (const x of [260, 264, 268]) { box(V, x * TS + 4, 30 * TS - 4, 8, 4, '#1d1218'); box(V, x * TS + 3, 30 * TS - 5, 10, 1, '#58564e'); }
  /* the guard room behind its grille (258-268, rows 24-28): a lit hall, a table, racks */
  const gx0 = 258 * TS, gy0 = 24 * TS, gw = 11 * TS, gh = 5 * TS; box(V, gx0, gy0, gw, gh, '#3a2418'); box(V, gx0, gy0, gw, 6, '#2a1810'); box(V, gx0, gy0 + gh - 5, gw, 5, '#241410');
  for (let x = gx0 + 8; x < gx0 + gw - 8; x += 24) { box(V, x, gy0, 6, 4, '#6a4528'); }
  box(V, gx0 + 80, gy0 + gh - 18, 40, 4, '#8a5a32'); box(V, gx0 + 84, gy0 + gh - 14, 3, 14, '#5a3a1e'); box(V, gx0 + 112, gy0 + gh - 14, 3, 14, '#5a3a1e');   /* the guards' table */
  for (let k = 0; k < 3; k++) box(V, gx0 + 20 + k * 6, gy0 + 22, 1, 12, k % 2 ? '#c8d0dc' : '#8a929e');
  glow(V, gx0 + 90, gy0 + 40, 70, 0.3); }

/* ================================================================ THE RULE'S PIECES */
export function drawGong(V, q, heroNear) {
  const x = gxOf(q), y = gyOf(q), big = q.great ? 1.4 : 1, fr = P.bakeGongFrame(!!q.great), fw = fr.width;
  if (!vis(V, x - 30, x + 30, 40)) return;
  put(V, fr, x - (fw >> 1), y - fr.height);
  const dy = q.great ? 38 : 24;   /* the disc's centre above the floor */
  if (!q.cut) { const sw = q.ring > 0 ? Math.sin(V.time * 30) * 2 * q.ring : 0, d = P.bakeGongDisc(!!q.great), top = y - fr.height + (q.great ? 8 : 8);
    if (q.great) { for (let yy = top; yy < y - dy - 12; yy += 3) box(V, x - 1 + (((yy - top) / 3) & 1), yy, 2, 2, ((yy - top) / 3) & 1 ? P.C.ironHi : P.C.iron); }   /* the great gong hangs on a chain */
    else { box(V, x - 1, top, 2, y - dy - 8 - top, P.C.rope); box(V, x, top, 1, y - dy - 8 - top, P.C.ropeLo); }
    put(V, d, x - (d.width >> 1) + sw, y - dy - (d.height >> 1));
    /* the mallet hangs on its cord */
    box(V, x + (q.great ? 14 : 11), y - 22, 2, 14, P.C.teak); box(V, x + (q.great ? 12 : 9), y - 10, 6, 4, P.C.teakHi); }
  else { box(V, x - 1, y - fr.height + 8, 1, 7, P.C.rope); box(V, x, y - fr.height + 14, 2, 1, P.C.ropeLo); box(V, x + 1, y - fr.height + 15, 1, 1, P.C.rope);   /* the cut rope's end */
    put(V, P.bakeGongFallen(!!q.great), x - (q.great ? 15 : 11), y - 9); }
}
const gxOf = g => g.x * TS + 8, gyOf = g => (g.y + 1) * TS;
/* THE BRICKED ARCH: a pale stone frame with chamfered head, fresh brick laid in rows with raw mortar, cracks; broken for good by a blast (the hands skip it then) */
export function drawArch(V, b) {
  const x0 = b.x0 * TS, y0 = b.y0 * TS, w = (b.x1 - b.x0 + 1) * TS, h = (b.y1 - b.y0 + 1) * TS; if (!vis(V, x0, x0 + w)) return;
  box(V, x0, y0, w, h, '#58564e');
  for (let r = 0; r < h / 6; r++) { const off = (r & 1) * 5; for (let x = -off; x < w; x += 10) { const c = ['#c8905e', '#d8a070', '#b8804e', '#d09a68'][hash(x + r * 7, b.x0) % 4], xx = Math.max(0, x), ww = Math.min(w, x + 9) - xx; if (ww > 0) { box(V, x0 + xx, y0 + r * 6, ww, 5, c); box(V, x0 + xx, y0 + r * 6, ww, 1, '#e8b88a'); } } }
  box(V, x0, y0, w, 3, '#ece9de'); box(V, x0, y0 + 2, w, 1, '#8c8a7c');   /* the lintel course */
  box(V, x0, y0, 3, h, '#d2cfc2'); box(V, x0 + w - 3, y0, 3, h, '#d2cfc2'); box(V, x0 + 2, y0, 1, h, '#8c8a7c');
  box(V, x0 + 3, y0 + 3, 2, h - 3, 'rgba(20,10,6,0.45)');   /* the dark gap: it was a door */
  box(V, x0, y0, 5, 5, '#d2cfc2'); box(V, x0 + w - 5, y0, 5, 5, '#d2cfc2');   /* chamfered head blocks */
  const mx = x0 + (w >> 1); line(V.g, mx - V.cx - 3, y0 - V.cy + 5, mx - V.cx + 2, y0 - V.cy + h / 2, '#4a2e1a'); line(V.g, mx - V.cx + 2, y0 - V.cy + h / 2, mx - V.cx - 2, y0 - V.cy + h - 4, '#4a2e1a');
}
/* THE PORTCULLIS: iron-bound timber bars with rivets and spiked feet, hung by two chains from the housing */
export function drawGate(V, G, braked) {
  const x = G.x * TS; if (!vis(V, x - 80, x + 80, 200)) return; const last = G.pinned ? G.y0 - 1 : G.y1 - G.notch;
  if (last >= G.y0) for (let y = G.y0; y <= last; y++) { const py = y * TS; box(V, x, py, TS, TS, '#2a2624');
    for (let k = 1; k < TS; k += 5) { box(V, x + k, py, 3, TS, '#4a4a52'); box(V, x + k, py, 1, TS, '#8a8a96'); }
    box(V, x, py + 6, TS, 3, '#3a3a42'); box(V, x, py + 6, TS, 1, '#8a8a96'); for (let k = 2; k < TS; k += 5) box(V, x + k, py + 7, 1, 1, '#d9b04a'); }
  if (last >= G.y0) { const yb = (last + 1) * TS; for (let k = 1; k < TS; k += 5) { box(V, x + k, yb, 3, 3, '#6a6a76'); box(V, x + k + 1, yb + 3, 1, 3, '#9a9aa6'); } box(V, x + 1, G.y0 * TS - 6, 2, 6 + (last - G.y0 + 1) * 0, '#8a8a96'); box(V, x + 12, G.y0 * TS - 6, 2, 6, '#8a8a96'); }
  /* the grille over the guard room: black bars, the lamp behind them lighting the gaps */
  const gr = G.grille; for (let y = gr.y0; y <= gr.y1; y++) { const py = y * TS; for (let k = 1; k < TS; k += 4) { box(V, gr.x * TS + k, py, 2, TS, '#1e1a18'); box(V, gr.x * TS + k, py, 1, TS, '#5a5650'); } if (y === gr.y0 || y === gr.y1) box(V, gr.x * TS, py + 7, TS, 2, '#1e1a18'); }
  /* the winch: a wooden capstan with four bars, a ratchet and a coil of chain, the gauge lamps beside it */
  const wx = G.winch[0] * TS + 8, wy = (G.winch[1] + 1) * TS, a = V.time * (braked ? 0 : 0.9) + G.notch * 1.2;
  box(V, wx - 10, wy - 4, 20, 4, '#3a2014'); box(V, wx - 7, wy - 22, 14, 18, '#6a4528'); box(V, wx - 7, wy - 22, 3, 18, '#8a5a34'); box(V, wx + 4, wy - 22, 3, 18, '#4a2e1a'); for (let k = 0; k < 3; k++) box(V, wx - 7, wy - 19 + k * 5, 14, 1, '#3a3a42');
  box(V, wx - 11, wy - 25, 22, 3, '#3a3a42'); box(V, wx - 11, wy - 25, 22, 1, '#8a8a96');
  for (let k = 0; k < 4; k++) { const ang = a + k * Math.PI / 2, ex = Math.round(Math.cos(ang) * 11), ey = Math.round(Math.sin(ang) * 2.2); box(V, wx + ex - 1, wy - 27 + ey, 3, 3, '#5a3a1e'); box(V, wx + Math.round(ex / 2), wy - 26 + Math.round(ey / 2), 2, 2, '#8a5a34'); }
  box(V, wx + 10, wy - 12, 4, 6, '#8a8a96'); box(V, wx + 11, wy - 12, 1, 6, '#d0d0dc'); for (let k = 0; k < 4; k++) box(V, wx - 14, wy - 10 + k * 2, 3, 1, k & 1 ? '#8a8a96' : '#4a4a52');
  /* the gauge: an iron plate with a lamp per notch, and the brake lamp */
  box(V, wx + 14, wy - 26, 9, 24, '#2a2a32'); box(V, wx + 14, wy - 26, 9, 1, '#8a8a96'); for (let i = 0; i < G.notches; i++) { const on = G.pinned || i < G.notch; box(V, wx + 16, wy - 7 - i * 5, 5, 4, on ? '#8fd160' : '#3a3430'); if (on) box(V, wx + 17, wy - 6 - i * 5, 2, 1, '#d8ffc0'); }
  const lc = G.pinned ? '#8fd160' : braked ? (Math.floor(V.time * 4) % 2 ? '#ff6b6b' : '#a83a3a') : '#ffd36b'; box(V, wx - 22, wy - 32, 7, 7, '#3a3a42'); box(V, wx - 21, wy - 31, 5, 5, lc); box(V, wx - 20, wy - 30, 1, 1, '#ffffff'); box(V, wx - 19, wy - 25, 1, 7, '#3a3a42');
  glow(V, wx - 18, wy - 28, 18, 0.2);
}
/* THE STRONGROOM'S DOOR: iron-banded oak, a ring, a lock plate, and five seal sockets that fill as the seals are carried */
export function drawVault(V, v, seals) {
  const x = v.x * TS; if (!vis(V, x, x + TS)) return;
  for (let y = v.y0; y <= v.y1; y++) { const py = y * TS; box(V, x, py, TS, TS, '#4a3020'); box(V, x, py, 2, TS, '#6a4528'); box(V, x + TS - 2, py, 2, TS, '#2a1a10'); box(V, x, py + 6, TS, 3, '#3a3a42'); box(V, x, py + 6, TS, 1, '#8a8a96'); for (let k = 3; k < TS; k += 5) box(V, x + k, py + 7, 1, 1, '#d9b04a'); }
  const my = (v.y0 + v.y1 - 1) * TS; box(V, x + 3, my - 2, 10, 10, '#2a2a32'); box(V, x + 3, my - 2, 10, 1, '#8a8a96');
  for (let i = 0; i < 5; i++) { const sx = x + 3 + (i % 3) * 3 + (i > 2 ? 1 : 0), sy = my - 1 + (i > 2 ? 4 : 0) + (i > 2 ? 0 : 0); box(V, sx, sy, 2, 2, i < seals ? '#ffd36b' : '#4a3a2a'); }
  box(V, x + 6, my + 8, 4, 4, '#d9b04a'); box(V, x + 7, my + 9, 2, 2, '#4a3a2a');
  if (seals >= 5) glow(V, x + 8, my + 4, 26, 0.3, false);
}
/* THE STACKS: kegs on a pallet, flasks on a rack; the count left */
export function drawStack(V, s) { const x = R(s.x * TS + 8), y = (s.y + 1) * TS; if (!vis(V, x, x, 30)) return;
  if (s.kind === 'flask') { put(V, P.bakeRack(), x - 15, y - 12); for (let i = 0; i < s.left; i++) put(V, P.bakeFlask(), x - 11 + i * 7, y - 22); if (s.left <= 0) box(V, x - 15, y - 3, 30, 2, 'rgba(0,0,0,0.3)'); return; }
  box(V, x - 14, y - 3, 28, 3, '#5a3a1e'); box(V, x - 14, y - 3, 28, 1, '#8a5a34');
  for (let i = 0; i < s.left; i++) put(V, P.bakeKeg(0), x - 18 + (i % 2) * 12 + (i >> 1) * 0, y - 22 - (i >> 1) * 11 + 3);
  if (s.left <= 0) box(V, x - 14, y - 2, 28, 2, 'rgba(0,0,0,0.3)'); }
export function drawKeg(V, x, y, lit, time) { put(V, P.bakeKeg(lit ? 1 + (Math.floor(time * 16) & 1) : 0), x - 7, y - 20); if (lit) glow(V, x, y - 14, 22, 0.35); }
export function drawFlask(V, x, y) { put(V, P.bakeFlask(), x - 5, y - 14); }

/* THE ROOF BRIDGE (gong 'bridge': [x0, x1, row]): a pulley post and arm on roof two's end; raised, the leaf stands hinged on the far lip, held by a rope from the gong over the pulley; cut, the rope hangs slack and the deck lies across */
export function drawBridge(V, g) {
  const [b0, b1, row] = g.bridge, hx = (b1 + 1) * TS, hy = row * TS, len = (b1 - b0 + 1) * TS; if (!vis(V, b0 * TS - 40, hx + 20, 80)) return;
  const px0 = (b0 - 1) * TS + 8, ptop = hy - 112, gx = gxOf(g), gtop = gyOf(g) - 50 + 3;
  box(V, px0 - 3, ptop, 6, hy - ptop, '#5a3420'); box(V, px0 - 3, ptop, 1, hy - ptop, '#8a5a34'); box(V, px0 - 6, hy - 6, 12, 6, '#3a2014');
  line(V.g, px0 - V.cx, hy - 40 - V.cy, px0 - V.cx + 14, ptop + 14 - V.cy, '#3a2014', 2);   /* the brace */
  const ax = px0 + 40; box(V, px0 - 3, ptop - 2, ax - px0 + 8, 5, '#5a3420'); box(V, px0 - 3, ptop - 2, ax - px0 + 8, 1, '#8a5a34');   /* the arm over the gap */
  circle(V.g, ax - V.cx, ptop + 5 - V.cy, 5, '#8a6a22'); circle(V.g, ax - V.cx, ptop + 5 - V.cy, 3, '#d9b04a'); px(V.g, ax - V.cx, ptop + 5 - V.cy, '#2a1a10');   /* the pulley */
  const rope = (x0, y0, x1, y1, slack) => { const n = Math.max(2, Math.ceil(Math.hypot(x1 - x0, y1 - y0) / 3)); for (let i = 0; i <= n; i++) { const t = i / n; const sx = x0 + (x1 - x0) * t, sy = y0 + (y1 - y0) * t + (slack ? Math.sin(t * Math.PI) * slack : 0); box(V, sx, sy, 2, 2, i & 1 ? P.C.rope : P.C.ropeLo); } };
  if (!g.cut) {
    /* RAISED: the leaf stands on the far lip, leaning back, held by the rope */
    const ang = 1.18, tx = hx - Math.cos(ang) * len, ty = hy - Math.sin(ang) * len, N = 8;
    const nx = Math.sin(ang) * 7, ny = Math.cos(ang) * 7, sx0 = hx - V.cx, sy0 = hy - V.cy, ex = tx - V.cx, ey = ty - V.cy;   /* the leaf: a plank slab 14 thick, drawn as a polygon, then its cross-planks and rails */
    fillPoly(V.g, [[sx0 - nx, sy0 - ny], [sx0 + nx, sy0 + ny], [ex + nx, ey + ny], [ex - nx, ey - ny]], '#8a5a32'); fillPoly(V.g, [[sx0 - nx, sy0 - ny], [sx0, sy0], [ex, ey], [ex - nx, ey - ny]], '#a06a3c');
    for (let i = 1; i < N; i++) { const t = i / N, qx = sx0 + (ex - sx0) * t, qy = sy0 + (ey - sy0) * t; line(V.g, qx - nx, qy - ny, qx + nx, qy + ny, '#3a2014'); }
    line(V.g, sx0 - nx, sy0 - ny, ex - nx, ey - ny, '#c89a62'); line(V.g, sx0 + nx, sy0 + ny, ex + nx, ey + ny, '#3a2014');
    for (let i = 0; i < 3; i++) { const t = 0.2 + i * 0.3; box(V, hx + (tx - hx) * t - 5, hy + (ty - hy) * t - 1, 3, 3, '#d9b04a'); }
    box(V, hx - 5, hy - 6, 10, 6, '#3a3a42');
    rope(gx, gtop, ax, ptop + 5, 0); rope(ax, ptop + 5, tx, ty - 4, 0);
  } else {
    /* LOWERED: the deck lies across the gap (the tiles are the planks); chains from the arm hang slack to its ends, and the cut rope drapes from the pulley down the post */
    rope(ax, ptop + 5, ax + 6, ptop + 70, 8); rope(gx, gtop, gx + 18, gtop + 22, 6); box(V, hx - 4, hy - 6, 8, 6, '#3a3a42'); box(V, b0 * TS, hy + 5, 4, 3, '#3a2014');
    for (const sx of [b0 * TS + 6, hx - 12]) rope(ax, ptop + 5, sx, hy - 2, 18);
  }
}

/* ================================================================ THE WHOLE SET, in one call (the hands call this each frame) */
export function paintWorld(V, plan0) {
  const L = V.L;
  for (const d of L.decor || []) { const x0 = (d.x0 ?? d.x) * TS, x1 = ((d.x1 ?? d.x) + 1) * TS; if (x1 < V.cx - 80 || x0 > V.cx + V.vw + 80) continue;
    switch (d.kind) { case 'parapet': parapet(V, d); break; case 'hut': hut(V, d); break; case 'minaret': minaret(V, d); break; case 'souqroof': souqRoof(V, d); break; case 'stall': stall(V, d); break;
      case 'awning': awning(V, d); break; case 'banner': banner(V, d.x, d.y); break; case 'palmstump': palmStump(V, d.x, d.y); break; case 'milestone': milestone(V, d.x, d.y); break; } }
  /* the roofs' low parapets: the long terrace and the three roofs */
  for (const [a, b, r] of [[356, 445, 25], [446, 458, 25], [459, 466, 19], [470, 478, 19], [482, 490, 19], [494, 523, 21], [531, 541, 21], [554, 575, 21]]) if (vis(V, a * TS, b * TS)) lowParapet(V, a, b + 1, r);
  if (plan0) for (const d of plan0.dress) dressItem(V, d);
  greatTower(V); gatehouse(V); hawkTower(V);
  /* lights and their glows */
  if (plan0) for (const l of plan0.lights) { if (!vis(V, l.wx - 30, l.wx + 30, 50)) continue; const f = Math.floor(V.time * 8 + l.x * 3) % 3;
    if (l.kind === 'torch') { put(V, P.bakeTorch(f), l.wx - 5, l.wy - 20); glow(V, l.wx, l.wy - 14, l.r * 0.5, 0.3); }
    else if (l.kind === 'brazier') { put(V, P.bakeBrazier(f), l.wx - 11, l.wy - 30); glow(V, l.wx, l.wy - 18, l.r * 0.6, 0.34); }
    else if (l.kind === 'lamp') { if (l.arm) { box(V, l.wx - 2, l.wy - 11, 12, 2, '#3a3a42'); box(V, l.wx + 6, l.wy - 11, 3, 14, '#3a3a42'); box(V, l.wx + 8, l.wy - 14, 4, 5, '#2a2a32'); } put(V, P.bakeLamp(f & 1), l.wx - 6, l.wy - 8); glow(V, l.wx, l.wy + 6, l.r * 0.5, 0.3); }
    else if (l.kind === 'lantern') { put(V, P.bakeLantern(f & 1), l.wx - 6, l.floor ? l.wy - 20 : l.wy - 4); glow(V, l.wx, l.wy + 6, l.r * 0.45, 0.28); }
    else if (l.kind === 'beacon') glow(V, l.wx, l.wy, l.r, 0.28); }
}

/* HER COURTYARD (the arena; arena.hm = { sx, R }): a shaded ashlar back wall with pilasters and a wall walk under the merlons, her hawk relief over the middle, the two guard doors, banners, perches */
export function drawCourtyard(V, A) {
  if (!A || !A.hm) return; const { sx, R: Rr } = A.hm, x0 = sx * TS, x1 = (sx + 40) * TS, y0 = (Rr - 18) * TS, fl = Rr * TS; if (!vis(V, x0, x1, 0)) return;
  const xa = Math.max(x0, V.cx - 40), xb = Math.min(x1, V.cx + V.vw + 40);
  box(V, xa, y0, xb - xa, fl - y0, '#4a4640');   /* the wall in shade */
  for (let y = y0; y < fl; y += 11) { const r = (y - y0) / 11 | 0, off = (r & 1) * 14; box(V, xa, y + 10, xb - xa, 1, '#35332e'); for (let x = Math.floor((xa - off) / 28) * 28 + off; x < xb; x += 28) if (x >= xa) box(V, x, y, 1, 11, '#35332e'); }
  for (let x = Math.floor(xa / 80) * 80; x < xb; x += 80) { box(V, x, y0, 10, fl - y0, '#5e5a52'); box(V, x, y0, 2, fl - y0, '#78746a'); box(V, x + 8, y0, 2, fl - y0, '#35332e'); box(V, x - 2, y0 + 26, 14, 4, '#78746a'); box(V, x - 2, fl - 8, 14, 8, '#6a665c'); }   /* pilasters with corbels and plinths */
  box(V, xa, y0, xb - xa, 22, '#6a665c'); box(V, xa, y0 + 20, xb - xa, 3, '#35332e'); box(V, xa, y0, xb - xa, 2, '#a8a496');   /* the wall walk's deck and parapet face */
  for (let x = Math.floor(xa / 16) * 16; x < xb; x += 16) { box(V, x + 2, y0 + 2, 12, 6, '#5e5a52'); box(V, x + 6, y0 + 8, 4, 12, '#35332e'); }
  const mx = (x0 + x1) / 2; put(V, P.bakeHawkRelief(), mx - 36, fl - 104);
  for (const q of [0.14, 0.3, 0.7, 0.86]) { const bx = Math.round(x0 + (x1 - x0) * q); for (let c = 0; c < 14; c++) { const sw = Math.round(Math.sin(V.time * 2.2 + c * 0.5 + bx) * (c / 14) * 1.4); box(V, bx + c, y0 + 24 + sw, 1, 54 + (c % 2) * 2, c < 1 ? '#6a1e1e' : '#a8302a'); box(V, bx + c, y0 + 76 + sw, 1, 2, '#d8b050'); } box(V, bx - 1, y0 + 22, 16, 2, '#d9b04a');
    for (let r = 0; r < 7; r++) for (let c = 0; c < 8; c++) if (HAWK_EMBLEM[r][c] === 'b') box(V, bx + 3 + c, y0 + 38 + r, 1, 1, '#1b1626'); }
  for (const dx of [(sx + 2) * TS + 8, (sx + 37) * TS + 8]) { box(V, dx - 14, fl - 40, 28, 40, '#35332e'); box(V, dx - 12, fl - 38, 24, 38, '#1d1218'); box(V, dx - 10, fl - 42, 20, 3, '#6a665c'); box(V, dx - 8, fl - 44, 16, 3, '#78746a'); box(V, dx - 6, fl - 46, 12, 3, '#8a867a');   /* an arch */
    box(V, dx - 10, fl - 34, 20, 34, '#4a3020'); for (let k = 0; k < 4; k++) box(V, dx - 10 + k * 5, fl - 34, 1, 34, '#3a2014'); box(V, dx - 10, fl - 24, 20, 2, '#3a3a42'); box(V, dx - 10, fl - 10, 20, 2, '#3a3a42'); box(V, dx + 5, fl - 18, 3, 3, '#d9b04a'); }
  for (const px0 of [(sx + 9) * TS + 8, (sx + 30) * TS + 8]) put(V, P.bakePerch(Math.floor(V.time * 0.7 + px0) & 1), px0 - 13, fl - 30);
}

/* THE FAR SKYLINE (src/main.js's backdrop calls drawBack): the fort on the horizon - its minaret, the great gong's tower, and the HAWK TOWER, tallest, with a beacon and circling hawks - in dusk haze, slow parallax */
export function drawBack(g, cx, cy, vw, vh, time, dy = 0) {
  const base = vh - 52 + dy, f = 0.1, ox = 3150;   /* the tower stands where the hero meets it at about column 480 */
  const sx = ox - cx * f - 4400 * f * 0;   /* screen x of the Hawk Tower */
  const haze = 'rgba(120,60,90,0.62)', haze2 = 'rgba(150,84,92,0.55)', lit = 'rgba(214,150,110,0.7)';
  const col = (x, y, w, h, c) => { g.fillStyle = c; g.fillRect(R(x), R(y), w, h); };
  const tx = sx - 8000 * f * 0;
  const at0 = ((ox - 4300 * f) - cx * f) + 4300 * f - 4300 * f;
  const X = (wx) => R(wx * f * 6.2 - cx * f + 60);   /* far layer: a world column 1/6 of the real distance */
  const tower = X(560 * 16);
  if (tower < -80 || tower > vw + 80) return;
  /* the far wall and its gatehouse */
  col(tower - 190, base - 22, 150, 22, haze2); for (let x = tower - 190; x < tower - 40; x += 8) col(x, base - 26, 4, 4, haze2);
  col(tower - 130, base - 40, 26, 40, haze2); col(tower - 132, base - 44, 30, 4, haze); col(tower - 100 + 6, base - 56, 3, 16, haze);   /* the great gong's tower, a mast */
  col(tower - 60, base - 34, 3, 34, haze); col(tower - 64, base - 36, 11, 3, haze); col(tower - 62, base - 44, 7, 8, haze); col(tower - 60, base - 49, 3, 5, haze);   /* the minaret */
  /* THE HAWK TOWER */
  col(tower - 6, base - 70, 34, 70, haze); col(tower - 9, base - 74, 40, 5, haze); for (let x = tower - 9; x < tower + 29; x += 8) col(x, base - 80, 5, 7, haze); col(tower + 14, base - 94, 12, 20, haze); col(tower + 11, base - 99, 18, 7, haze); col(tower + 19, base - 106, 2, 9, haze);
  col(tower - 6, base - 70, 4, 70, 'rgba(90,40,70,0.5)'); col(tower + 26, base - 70, 3, 70, lit);   /* its lit edge */
  for (const wy of [-58, -50]) for (const wx of [2, 11, 20]) col(tower + wx, base + wy, 3, 5, 'rgba(255,196,110,0.85)');   /* lit windows */
  const fl = Math.floor(time * 9) % 3; col(tower + 8, base - 86 - fl, 6, 4, 'rgba(255,190,90,0.95)'); col(tower + 9, base - 90 - fl, 4, 4, 'rgba(255,230,160,0.95)');   /* the beacon */
  for (let i = 0; i < 3; i++) { const a = time * (0.6 + i * 0.15) + i * 2.1, hx = tower + 14 + Math.cos(a) * (46 + i * 10), hy = base - 112 + Math.sin(a * 1.2) * (8 + i * 3); col(hx - 3, hy, 7, 1, 'rgba(50,24,40,0.9)'); col(hx - 1, hy - 1, 3, 1, 'rgba(50,24,40,0.9)'); }   /* circling hawks */
  col(tower - 220, base, 400, 60, haze);
}
export { gxOf, gyOf };
