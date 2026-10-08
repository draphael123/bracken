// canal_props.js - THE FOG CANAL's machines, drawn (claude/canalart). Pure drawing: src/canal-hands.js calls these with the live state. Nothing here moves a thing.
//   the BARGE: a painted narrowboat (roses and castles on the cabin side, a tarred bow, a rust rubbing strake, a hatch cloth and a rope coil on the deck), the lantern
//     pole at her stern with a caged lantern, and her TILLER: a rudder post at the STERN and a long tiller bar that sweeps up (the mill cut) or down (the weir) to a
//     grip amidships - the strike point is where it always was (src/canal-hands.js), the bar only reaches back to the stern. On the OFFSIDE she is darker (the bank's shade),
//     with a bow wave and a wake: she is the far side of the pound.
//   the LOCK GATES' balance beams, the paddle gear (a rack and a wheel, the rack up when the paddle is), the swing bridges' white railing and pivot drum, the capstans,
//     the foghorns (brass, a bellows box and a wind-up gauge), the lantern posts (an iron post and a caged lantern: steady AMBER, a pool of light on the ground)
//   the WATER: a sheen, and every lantern's reflection (amber for the real ones, a cold green shimmer under a wisp: the false lantern is told apart from a real one on the water too)
//   the FOG is feathered here: banks draw in soft-edged columns (a baked gradient) and drift; the extents they cover (the gameplay) are untouched.
import { canvas, rect, px, outline } from '../px.js';
import { paintTunnelRoom } from './canal_tunnel.js';   /* (claude/canal4art) the legging tunnel's vault */
const TS = 16;
const memo = new Map(); const once = (k, fn) => { if (!memo.has(k)) memo.set(k, fn()); return memo.get(k); };
const R = Math.round;
export const P = { amber: '#ffcf6a', amberD: '#b8862e', cold: '#a0ffd2', coldD: '#2a8a6a', iron: '#3a3e44', iron2: '#6a7078', iron3: '#9aa2aa', white: '#cfd8d4', brass: '#c8a040', brass2: '#f0d070', brassD: '#7a5a1c',
  wood0: '#1e1610', wood1: '#2e2218', wood2: '#46321f', wood3: '#684a2c', wood4: '#8a6a3e', cream: '#e8dcc0' };

/* ============================== THE BARGE ============================== */
const BW = 96;
/* the hull and deck, baked once: 96 wide (+4 for the prow), the deck line at y = 6 so the gunwale and the tiller have room above */
function hull(w) {
  return once('hull' + w, () => { const [c, g] = canvas(w + 8, 32), ox = 3, dy = 18;
    const body = (x0, x1, y0, y1, col) => { g.fillStyle = col; g.beginPath(); g.moveTo(ox + x0, y0); g.lineTo(ox + x1, y0); g.lineTo(ox + x1 - 5, y1); g.lineTo(ox + x0 + 4, y1); g.closePath(); g.fill(); };
    body(0, w + 2, dy, dy + 10, '#241810');                                                              /* the tarred hull */
    rect(g, ox + 0, dy, w + 2, 3, '#7a5a36'); rect(g, ox, dy, w + 2, 1, '#b8a070');                       /* the deck planks and their lit lip */
    for (let x = 6; x < w - 4; x += 11) rect(g, ox + x, dy + 1, 1, 2, '#3a2a18');
    rect(g, ox + 2, dy + 3, w - 2, 1, '#1a1008');                                                         /* the sheer line */
    for (let x = 6; x < w - 4; x += 1) { px(g, ox + x, dy + 4, x % 5 === 0 ? '#3a2a1c' : '#2c1e14'); }                    /* the tarred side boards */
    for (let x = 6; x < w - 8; x += 6) { px(g, ox + x, dy + 5, '#e8dcc0'); px(g, ox + x + 1, dy + 5, x % 12 ? '#c04040' : '#ffd060'); px(g, ox + x + 2, dy + 5, '#3a8a3a'); }   /* the painted edge, dashed in the boatman's colours */
    rect(g, ox + 4, dy + 6, w - 8, 1, '#6a3a28');                                                          /* the rust-red rubbing strake */
    /* the CABIN (the bow end, cut low: the hero rides in front of it): deep green side, cream trim, roses and castles painted on it, a tarred roof, a stove chimney */
    const cx0 = ox + 62, cw = 30, ch = 10;
    rect(g, cx0, dy - ch, cw, ch, '#1f4038'); rect(g, cx0, dy - ch, cw, 1, '#e8dcc0'); rect(g, cx0, dy - 1, cw, 1, '#e8dcc0'); rect(g, cx0 - 1, dy - ch - 2, cw + 2, 2, '#2c3238'); rect(g, cx0 - 1, dy - ch - 2, cw + 2, 1, '#5a6870');
    rect(g, cx0 + 24, dy - ch - 6, 3, 5, '#14100c'); rect(g, cx0 + 23, dy - ch - 7, 5, 1, '#3a3028');
    const rose = x => { rect(g, cx0 + x, dy - 8, 3, 3, '#c04040'); px(g, cx0 + x + 1, dy - 7, '#ffd060'); px(g, cx0 + x - 1, dy - 6, '#3a8a3a'); px(g, cx0 + x + 3, dy - 6, '#3a8a3a'); };
    const castle = x => { rect(g, cx0 + x, dy - 6, 6, 4, '#ffd060'); for (const k of [0, 2, 4]) px(g, cx0 + x + k, dy - 7, '#ffd060'); rect(g, cx0 + x + 2, dy - 4, 2, 3, '#6a3a1c'); };
    rose(3); castle(9); rose(19); rect(g, cx0 + 25, dy - 7, 4, 4, '#0c1214'); rect(g, cx0 + 26, dy - 6, 2, 2, '#ffcf6a');                        /* a lit window */
    rect(g, ox + 0, dy + 10, w, 2, '#0c0806');                                                            /* the waterline shadow */
    poly(g, [[ox + w + 2, dy], [ox + w + 5, dy - 1], [ox + w + 3, dy + 7]], '#2a1c10');                    /* the prow, lifted */
    rect(g, ox + w + 4, dy - 2, 1, 2, '#e8dcc0');
    rect(g, ox + 2, dy - 1, 8, 1, '#4a3a2a'); rect(g, ox - 2, dy + 2, 3, 6, '#2a1c10');                    /* the stern counter and its coaming */
    /* the deck's furniture: a hatch cloth over the fore hold (a low, tarred hump), a rope coil, a mooring bollard at each end */
    rect(g, ox + 50, dy - 2, 6, 2, '#6a5a40'); rect(g, ox + 51, dy - 3, 4, 1, '#8a7a58'); px(g, ox + 52, dy - 1, '#3a2c1c'); px(g, ox + 54, dy - 1, '#3a2c1c');
    rect(g, ox + w - 6, dy - 3, 2, 3, '#14100c'); rect(g, ox + w - 7, dy - 3, 4, 1, '#14100c'); rect(g, ox + 8, dy - 3, 2, 3, '#14100c');
    return c; });
}
/* the offside hull: the same boat seen through the pound's haze, a shade bluer and darker at the waterline */
function hullHazed(w) { return once('hullH' + w, () => { const [c, g] = canvas(w + 8, 32); g.drawImage(hull(w), 0, 0); g.globalCompositeOperation = 'source-atop'; g.globalAlpha = 0.45; g.fillStyle = '#6a8a9c'; g.fillRect(0, 0, w + 8, 32); g.globalAlpha = 0.3; g.fillStyle = '#05090c'; g.fillRect(0, 24, w + 8, 8); g.globalAlpha = 1; g.globalCompositeOperation = 'source-over'; return c; }); }
function poly(g, pts, col) { g.fillStyle = col; g.beginPath(); pts.forEach(([x, y], i) => i ? g.lineTo(x, y) : g.moveTo(x, y)); g.closePath(); g.fill(); }
export function drawBarge(g, x, y, w, st, time) {
  const b = st && st.barge, off = !!(b && st.D && st.sideOff);
  g.drawImage(off ? hullHazed(w) : hull(w), x - 3, y - 18);
  if (off) { g.globalAlpha = 0.3; g.fillStyle = '#05090c'; g.fillRect(x - 4, y + 5, w + 10, 5); g.globalAlpha = 0.15; g.fillRect(x - 8, y + 10, w + 18, 4); g.globalAlpha = 1; }          /* the offside: the towpath's shade lies across the near water (the hull itself is hazed) */
  /* the lantern pole at her stern: iron pole, a hook arm, a caged lantern (hinged low: it folds under a beam), a warm light on the deck */
  const fl = 0.82 + 0.18 * Math.sin(time * 9) + 0.06 * Math.sin(time * 23);
  g.fillStyle = '#2a2420'; g.fillRect(x + 5, y - 34, 2, 34); g.fillStyle = '#4a4036'; g.fillRect(x + 5, y - 34, 1, 34); g.fillStyle = '#6a6058'; g.fillRect(x + 4, y - 12, 4, 2);
  g.fillStyle = '#2a2420'; g.fillRect(x + 5, y - 38, 8, 1); g.fillRect(x + 12, y - 38, 1, 3);
  const ang = (st && st.lampAng) || 0, dim = !!(st && st.lampDim); g.save(); g.translate(x + 12, y - 37); g.rotate(ang); g.translate(-(x + 12), -(y - 37));   /* (claude/canalfix3) her lantern swings toward what holds her */
  if (!dim) { const gr = g.createRadialGradient(x + 12, y - 33, 2, x + 12, y - 33, 30); gr.addColorStop(0, 'rgba(255,207,106,' + (0.34 * fl).toFixed(3) + ')'); gr.addColorStop(1, 'rgba(255,207,106,0)'); g.fillStyle = gr; g.fillRect(x - 18, y - 63, 60, 60); }
  g.fillStyle = '#3a2c1c'; g.fillRect(x + 9, y - 36, 7, 1); g.fillRect(x + 9, y - 28, 7, 1); g.fillRect(x + 9, y - 35, 1, 7); g.fillRect(x + 15, y - 35, 1, 7); g.fillRect(x + 12, y - 35, 1, 7);
  if (dim) { g.fillStyle = '#2a1a10'; g.fillRect(x + 10, y - 35, 5, 7); g.fillStyle = '#a04a20'; g.fillRect(x + 12, y - 30, 1, 1); }   /* (claude/canal4) DIMMED in the tunnel: the wick turned down to an ember */
  else { g.globalAlpha = fl; g.fillStyle = P.amber; g.fillRect(x + 10, y - 35, 2, 7); g.fillRect(x + 13, y - 35, 2, 7); g.fillStyle = '#fff2b0'; g.fillRect(x + 11, y - 33, 3, 3); g.globalAlpha = 1; }
  g.restore();
  /* THE TILLER: the rudder post at the stern, the bar from its head to the grip amidships; the bar sweeps with the helm (up: the mill cut; down: the weir) */
  const hx = x + (w >> 1), px0 = x + 14, up = b && b.helm === 'cut', flash = st && st.tiller && st.tiller.flash > 0, gy = up ? y - 13 : y - 3;
  g.fillStyle = '#2a1c10'; g.fillRect(px0 - 1, y - 11, 3, 11); g.fillStyle = P.brass; g.fillRect(px0 - 2, y - 12, 5, 2); g.fillStyle = P.brass2; g.fillRect(px0 - 2, y - 12, 5, 1);       /* the rudder post, a brass head */
  const n = hx - px0; for (let i = 0; i <= n; i++) { const k = i / n, yy = R(y - 9 + (gy + 1 - (y - 9)) * k * k * (3 - 2 * k)); g.fillStyle = i % 5 === 4 ? '#8a6a3e' : '#684a2c'; g.fillRect(px0 + i, yy, 1, 2); g.fillStyle = '#a88a58'; g.fillRect(px0 + i, yy, 1, 1); }
  g.fillStyle = flash ? '#ffffff' : P.brass; g.fillRect(hx - 2, gy - 1, 5, 5); g.fillStyle = flash ? '#ffffff' : P.brass2; g.fillRect(hx - 1, gy - 1, 3, 1);                                     /* the grip: a brass knob you can see and strike */
  g.fillStyle = '#2a1c10'; g.fillRect(hx - 2, gy + 4, 5, 1);
  if (b) { g.fillStyle = up ? '#8fd160' : '#ff9a5c'; const ay = gy - 15;   /* the helm's arrow over the grip: UP is the mill cut / the offside, DOWN the weir / the towpath */
    if (up) { g.fillRect(hx, ay, 1, 1); g.fillRect(hx - 1, ay + 1, 3, 1); g.fillRect(hx - 2, ay + 2, 5, 1); g.fillRect(hx - 1, ay + 3, 3, 4); } else { g.fillRect(hx - 1, ay, 3, 4); g.fillRect(hx - 2, ay + 4, 5, 1); g.fillRect(hx - 1, ay + 5, 3, 1); g.fillRect(hx, ay + 6, 1, 1); } }
  /* THE OFFSIDE: a bow wave and a wake on the near water, and the rope-less drift (she is the far side of the pound) */
  if (off) { g.globalAlpha = 0.65; g.fillStyle = '#bfe6f5'; for (let k = 0; k < w; k += 9) g.fillRect(x + 3 + k, y + 3 + ((k / 9 + (time * 2) | 0) % 2), 4, 1);
    g.globalAlpha = 0.8; g.fillRect(x + w, y + 1, 5, 1); g.fillRect(x + w + 2, y + 2, 4, 1); g.fillRect(x + w + 4, y + 3, 3, 1); g.globalAlpha = 0.45; g.fillRect(x - 10, y + 3, 9, 1); g.fillRect(x - 16, y + 4, 8, 1); g.globalAlpha = 1; }
}
/* the wake of a barge on the TOWPATH side: a thin line at the bow only (so the shade and the wake are what tells the sides apart) */
export function bargeWake(g, x, y, w, time) { g.globalAlpha = 0.4; g.fillStyle = '#bfe6f5'; g.fillRect(x + w + 1, y + 4, 4, 1); g.fillRect(x - 6, y + 4, 5, 1); g.globalAlpha = 1; }

/* ============================== THE LOCK GATE: its balance beam and its paddle ============================== */
export function drawGateTop(g, gt, sx, sy, h, time) {
  /* the balance beam: a long white-ended timber over the gate's head, the weight end out over the bank */
  rect(g, sx - 24, sy - 5, 32, 4, '#46321f'); rect(g, sx - 24, sy - 5, 32, 1, '#8a6a3e'); rect(g, sx - 28, sy - 6, 7, 6, P.white); rect(g, sx - 28, sy - 6, 7, 1, '#ffffff'); rect(g, sx - 28, sy - 1, 7, 1, '#8a9894');
  rect(g, sx + 2, sy - 8, 4, 5, '#2a2018'); rect(g, sx + 1, sy - 9, 6, 1, P.iron2);       /* the heel post and its cap */
  /* wet seep down the shut leaf: a pale streak or two */
  g.globalAlpha = 0.35; g.fillStyle = '#7ad0c8'; for (let k = 0; k < 2; k++) { const yy = sy + 6 + ((time * 6 + k * 21) % Math.max(8, h - 10)); g.fillRect(sx + 4 + k * 7, R(yy), 1, 4); } g.globalAlpha = 1;
}
export function drawGateOpen(g, sx, sy) { rect(g, sx, sy, 3, 6, '#2a1c10'); rect(g, sx, sy, 3, 1, P.white); rect(g, sx, sy + 6, 3, 1, '#0c0806'); }

/* ============================== THE SWING BRIDGE: white railing, a pivot drum ============================== */
export function drawBridge(g, br, sy, sx, len, px0, k, time) {
  rect(g, sx, sy, Math.max(4, len), 6, '#3a4048'); rect(g, sx, sy, Math.max(4, len), 1, '#a8b4bc'); rect(g, sx, sy + 5, Math.max(4, len), 1, '#14181c'); for (let q = 3; q < len - 1; q += 5) px(g, sx + q, sy + 3, '#c8d0d6');   /* (claude/canalfix3) cast iron, riveted: no boards */
  rect(g, sx, sy - 9, Math.max(4, len), 1, P.white); rect(g, sx, sy - 5, Math.max(4, len), 1, '#a8b4b0');                    /* the white rails */
  for (let q = 0; q < len; q += 14) rect(g, sx + q, sy - 9, 2, 9, P.white);
  if (len > 8) rect(g, sx + len - 2, sy - 9, 2, 9, P.white);
  /* the pivot drum: an iron-banded drum on the bank, a cap, rivets */
  const dx = R(px0) - (br.pivot === 'R' ? 0 : 0) + (br.pivot === 'R' ? 0 : 0); const drum = br.pivot === 'R' ? px0 - 6 : px0 - 6;
  rect(g, drum, sy - 2, 12, 9, '#34383e'); rect(g, drum, sy - 2, 12, 1, P.iron3); rect(g, drum + 1, sy + 1, 10, 1, '#1c1e22'); rect(g, drum + 1, sy + 4, 10, 1, '#1c1e22'); px(g, drum + 3, sy, P.iron3); px(g, drum + 8, sy, P.iron3); rect(g, drum + 3, sy - 4, 6, 2, '#44484e'); void dx; void k; void time;
}

/* ============================== THE MACHINES ============================== */
export function drawSluice(g, x, y, up, flash, r) {
  rect(g, x - 7, y - 3, 14, 3, '#2a2c32'); rect(g, x - 7, y - 3, 14, 1, P.iron2);                                       /* the base plate, bolted to the walkway */
  rect(g, x - 2, y - 24, 4, 21, '#32363c'); rect(g, x - 2, y - 24, 1, 21, P.iron2);                                      /* the rack post */
  const rackY = up ? y - 24 : y - 17; for (let k = 0; k < 6; k++) rect(g, x - 3, rackY + k * 2, 1, 1, P.iron3);          /* the rack's teeth, higher when the paddle is up */
  const wy = y - 15, a = (r ? r.y : 0) / 6; g.strokeStyle = flash ? '#ffffff' : up ? '#8fd160' : '#c8a040'; g.lineWidth = 2; g.beginPath(); g.arc(x + 6, wy, 6, 0, Math.PI * 2); g.stroke();               /* the wheel: green when the paddle is up (the chamber fills) */
  g.fillStyle = '#6a7078'; g.fillRect(x + 5, wy - 1, 2, 2); for (let k = 0; k < 4; k++) { const an = a + k * Math.PI / 2; g.fillRect(x + 6 + R(Math.cos(an) * 4), wy + R(Math.sin(an) * 4), 1, 1); }
  rect(g, x + 2, wy - 8, 4, 1, '#c8c0a0'); rect(g, x + 2, wy - 8, 1, 3, P.iron3);                                        /* the pawl */
  rect(g, x + 10, wy - 2, 5, 2, P.iron2);                                                                              /* the crank handle */
}
export function drawCapstan(g, x, y, holds, flash) {
  rect(g, x - 8, y - 4, 16, 4, '#2a2c32'); rect(g, x - 8, y - 4, 16, 1, P.iron2); rect(g, x - 6, y - 10, 12, 6, '#34383e'); rect(g, x - 6, y - 10, 12, 1, P.iron3); for (const dx of [-4, 0, 4]) px(g, x + dx, y - 7, '#14100c');
  rect(g, x - 7, y - 12, 14, 2, flash ? '#ffffff' : holds ? '#c8a040' : '#8fd160'); rect(g, x - 1, y - 16, 2, 5, P.iron2); rect(g, x - 8, y - 14, 5, 1, P.iron2); rect(g, x + 4, y - 14, 5, 1, P.iron2);   /* the bars: amber while the bridge stands across, green when it is swung */
}
export function drawHorn(g, x, y, flash, k) {
  rect(g, x - 5, y - 6, 10, 6, '#34383e'); rect(g, x - 5, y - 6, 10, 1, P.iron2); rect(g, x - 4, y - 14, 8, 8, '#3c3236'); rect(g, x - 4, y - 14, 8, 1, P.iron2); px(g, x - 2, y - 10, '#14100c'); px(g, x + 2, y - 10, '#14100c');    /* the bellows box */
  g.fillStyle = flash ? '#ffffff' : P.brass; g.beginPath(); g.moveTo(x + 3, y - 20); g.lineTo(x + 15, y - 27); g.lineTo(x + 15, y - 13); g.lineTo(x + 3, y - 16); g.closePath(); g.fill(); rect(g, x + 14, y - 27, 2, 14, flash ? '#ffffff' : P.brass2); rect(g, x + 4, y - 19, 6, 1, P.brass2);
  rect(g, x - 8, y - 33, 16, 3, '#1b1626'); rect(g, x - 7, y - 32, R(14 * k), 1, k >= 1 ? '#8fd160' : '#c8a040');         /* the wind-up gauge: green, it will sound */
}
export function drawPost(g, p, x, y, time) {
  const lit = p.lit, fl = lit ? 0.85 + 0.15 * Math.sin(time * 7 + p.x) : 0;
  rect(g, x - 2, y - 3, 5, 3, '#2a2c32'); rect(g, x - 1, y - 27, 2, 24, '#2a2c32'); rect(g, x - 1, y - 27, 1, 24, '#44484e'); rect(g, x - 3, y - 26, 6, 1, '#44484e');        /* an iron post on a plinth */
  rect(g, x - 4, y - 34, 8, 1, '#1b1b20'); rect(g, x - 3, y - 35, 6, 1, '#1b1b20'); rect(g, x - 4, y - 27, 8, 1, '#1b1b20'); rect(g, x - 4, y - 33, 1, 6, '#1b1b20'); rect(g, x + 3, y - 33, 1, 6, '#1b1b20'); rect(g, x, y - 33, 1, 6, '#1b1b20');   /* the cage */
  if (lit) { g.globalAlpha = fl; g.fillStyle = P.amber; g.fillRect(x - 3, y - 33, 3, 6); g.fillRect(x + 1, y - 33, 2, 6); g.fillStyle = '#fff2b0'; g.fillRect(x - 2, y - 31, 3, 3); g.globalAlpha = 1;
    g.globalAlpha = 0.22 * fl; g.fillStyle = P.amber; g.beginPath(); g.ellipse(x, y + 1, 22, 3, 0, 0, Math.PI * 2); g.fill(); g.globalAlpha = 1; }                     /* a pool of warm light on the stones */
  else { g.fillStyle = '#3a3226'; g.fillRect(x - 3, y - 33, 3, 6); g.fillRect(x + 1, y - 33, 2, 6); g.globalAlpha = 0.5; g.fillStyle = '#8a8a8a'; for (let k = 0; k < 3; k++) g.fillRect(x + ((time * 3 + k * 5) % 7 | 0) - 3, y - 36 - k * 3, 1, 2); g.globalAlpha = 1; }    /* doused: a thread of smoke */
}

/* ============================== THE WATER ============================== */
export function drawWater(g, st, pools, cx, cy, VW, VH, time, lanterns, wisps) {
  /* (claude/canalfix3, Daniel: "GREEN = HERS") a SAFE SWIM is clear dark blue, a clean sheen and no weed: it reads apart from her murky green at night, in the fog */
  for (const p of pools) { if (!p.safeSwim || p.x1 < cx || p.x0 > cx + VW || p.y > cy + VH || (p.bottom ?? p.y) < cy) continue; const x0 = Math.max(p.x0, cx) - cx, x1 = Math.min(p.x1, cx + VW) - cx, sy = R(p.y - cy), h = (p.bottom ?? p.y + 64) - p.y;
    g.fillStyle = 'rgba(20,70,150,0.55)'; g.fillRect(x0, sy, x1 - x0, h); g.fillStyle = 'rgba(120,190,255,0.5)'; g.fillRect(x0, sy, x1 - x0, 1);
    g.fillStyle = 'rgba(170,220,255,0.35)'; for (let x = p.x0 - (p.x0 % 12); x < p.x1; x += 12) { const xx = x - cx + R(Math.sin(time * 1.1 + x * 0.2) * 2); if (xx > x0 && xx < x1 - 3) g.fillRect(xx, sy + 3 + ((x / 12) % 3) * 4, 3, 1); } }
  for (const p of pools) { if (!p.canal || p.canal === 'dock' || p.dry) continue; if (p.x1 < cx || p.x0 > cx + VW || p.y > cy + VH || p.y < cy - 20) continue;
    const x0 = Math.max(p.x0, cx), x1 = Math.min(p.x1, cx + VW), sy = R(p.y - cy), bot = p.bottom !== undefined ? p.bottom - cy : VH;
    g.save(); g.beginPath(); g.rect(x0 - cx, sy, x1 - x0, Math.max(2, Math.min(bot, VH) - sy)); g.clip();
    g.fillStyle = 'rgba(46,90,40,0.34)'; g.fillRect(x0 - cx, sy, x1 - x0, Math.min(bot, VH) - sy); g.fillStyle = 'rgba(120,170,70,0.25)'; for (let x = x0 - (x0 % 23); x < x1; x += 23) g.fillRect(x - cx + R(Math.sin(time * 0.5 + x) * 3), sy + 1, 6, 1);   /* (claude/canalfix3) HER water: murky green, a scum of weed on it */
    g.fillStyle = 'rgba(150,196,210,0.22)'; for (let x = x0 - (x0 % 14); x < x1; x += 14) { const w = 5 + ((x / 14) % 3) * 3; g.fillRect(x - cx + R(Math.sin(time * 0.9 + x * 0.13) * 2), sy + 2 + ((x / 14) % 4) * 3, w, 1); }   /* a sheen */
    for (const l of lanterns) { if (l.x < x0 - 30 || l.x > x1 + 30) continue; const lx = l.x - cx;
      for (let i = 0; i < 9; i++) { const yy = sy + 2 + i * 3, wob = Math.sin(time * 3 + i * 1.3 + l.x) * (1 + i * 0.25), w = Math.max(2, 7 - i * 0.6 + Math.sin(time * 5 + i) * 1.2); g.globalAlpha = (0.55 - i * 0.055) * (l.k || 1); g.fillStyle = l.col || P.amber; g.fillRect(R(lx + wob - w / 2), yy, R(w), 1); }
      g.globalAlpha = 1; }
    for (const wp of wisps) { if (wp.x < x0 - 30 || wp.x > x1 + 30) continue; const lx = wp.x - cx;
      for (let i = 0; i < 6; i++) { const yy = sy + 2 + i * 3, wob = Math.sin(time * 4 + i * 2 + wp.x) * (1.5 + i * 0.3); g.globalAlpha = (0.5 - i * 0.07) * (wp.k || 1); g.fillStyle = (i + R(time * 6)) % 2 ? P.cold : '#dcffe8'; g.fillRect(R(lx + wob - 2), yy, 4, 1); } g.globalAlpha = 1; }
    g.restore(); }
}

/* ============================== THE FOG, feathered ============================== */
const FEATHER = 16, FEATHER_TOP = 26;   /* px of soft edge inside each bank: the extents a bank covers (the gameplay) are untouched, only its edge is softened inward */
let TMP = null;
/* one bank drawn soft: the body in its colour, a few puffs drifting through it, then the four edges ERASED in gradients (the left and right edges billow a little, row by row), a lip along the top of a thick one */
export function featherBank(fg, mkCanvas, f, X0, X1, Y0, Y1, a, time, VW, VH) {
  if (!TMP || TMP.width !== VW || TMP.height !== VH) TMP = mkCanvas(VW, VH); if (!TMP) return; const t = TMP.getContext('2d'), col = f.thick ? '176,190,188' : '150,168,166', w = X1 - X0, h = Y1 - Y0; if (w <= 0 || h <= 0 || a < 0.02) return;
  const cx0 = Math.max(0, X0 - 4), cx1 = Math.min(VW, X1 + 4), cy0 = Math.max(0, Y0 - 4), cy1 = Math.min(VH, Y1 + 4); if (cx1 <= cx0 || cy1 <= cy0) return;
  t.globalCompositeOperation = 'source-over'; t.clearRect(cx0, cy0, cx1 - cx0, cy1 - cy0); t.globalAlpha = 1;
  t.fillStyle = 'rgba(' + col + ',' + a.toFixed(3) + ')'; t.fillRect(X0, Y0, w, h);
  /* puffs: lighter soft ellipses sliding slowly through the bank (clipped by the erase below, and by the bank itself) */
  t.save(); t.beginPath(); t.rect(X0, Y0, w, h); t.clip(); const n = Math.max(2, Math.min(7, (w / 70) | 0)); for (let i = 0; i < n; i++) { const sd = (i * 61 + (f.x0 | 0) * 7) % 97, px0 = X0 + ((sd * 5 + time * (3 + sd % 4) + i * w / n) % (w + 80)) - 40, py = Y0 + h * (0.3 + 0.55 * ((sd % 11) / 11)), r = 26 + sd % 22;
    const gr = t.createRadialGradient(px0, py, 2, px0, py, r); gr.addColorStop(0, 'rgba(210,224,222,' + (0.2 * a).toFixed(3) + ')'); gr.addColorStop(1, 'rgba(210,224,222,0)'); t.fillStyle = gr; t.fillRect(px0 - r, py - r, r * 2, r * 0.9 + r); } t.restore();
  t.globalCompositeOperation = 'destination-out';
  const fe = Math.min(FEATHER, w >> 1), ft = Math.min(FEATHER_TOP, h >> 1);
  for (let y = Y0; y < Y1; y += 6) { const hh = Math.min(6, Y1 - y), o = Math.round(Math.sin(time * 0.35 + y * 0.09 + f.x0) * 2.5 + Math.sin(time * 0.2 + y * 0.03 + f.x1) * 1.5), ro = Math.round(Math.sin(time * 0.3 + y * 0.08 + f.x1 * 3) * 2.5);
    let gl = t.createLinearGradient(X0 + o, 0, X0 + o + fe, 0); gl.addColorStop(0, 'rgba(0,0,0,1)'); gl.addColorStop(1, 'rgba(0,0,0,0)'); t.fillStyle = gl; t.fillRect(X0, y, fe + Math.max(0, o), hh);
    let gr2 = t.createLinearGradient(X1 - fe + ro, 0, X1 + ro, 0); gr2.addColorStop(0, 'rgba(0,0,0,0)'); gr2.addColorStop(1, 'rgba(0,0,0,1)'); t.fillStyle = gr2; t.fillRect(X1 - fe + Math.min(0, ro), y, fe + 4, hh); }
  { const gt = t.createLinearGradient(0, Y0, 0, Y0 + ft); gt.addColorStop(0, 'rgba(0,0,0,1)'); gt.addColorStop(1, 'rgba(0,0,0,0)'); t.fillStyle = gt; t.fillRect(X0, Y0, w, ft);
    const gb = t.createLinearGradient(0, Y1 - 8, 0, Y1); gb.addColorStop(0, 'rgba(0,0,0,0)'); gb.addColorStop(1, 'rgba(0,0,0,1)'); t.fillStyle = gb; t.fillRect(X0, Y1 - 8, w, 8); }
  t.globalCompositeOperation = 'source-over';
  /* THE LIP of a thick bank: a rolled, lighter crest along its top edge (scalloped, drifting), so it reads as a wall of fog and not a tint */
  if (f.thick) { t.fillStyle = 'rgba(214,226,224,' + (0.34 * a).toFixed(3) + ')'; for (let x = X0 + fe; x < X1 - fe; x += 7) { const bump = 2 + Math.round(Math.sin(time * 0.5 + x * 0.21 + f.x0) * 1.2); t.fillRect(x, Y0 + ft - 6 - bump, 8, bump + 3); } }
  fg.drawImage(TMP, cx0, cy0, cx1 - cx0, cy1 - cy0, cx0, cy0, cx1 - cx0, cy1 - cy0);
}

/* ============================== THE WEED, THE BOOMS, THE SKIFF, THE SILL, THE SHOE ============================== */
/* BRIGHT blanket weed: springy, fresh green, pale frond tips, little air bubbles (it will hold you a moment); DARK weed: rotting, flat, a dull brown-green skin with no sheen (it is only water) */
export function drawWeed(g, kind, sx, sy, w, k0, shake, time) {
  const bright = kind === 'bright';
  if (bright) { rect(g, sx + shake, sy + 1, w, 4, '#3a7a30'); rect(g, sx + shake, sy + 4, w, 1, '#24501e');
    for (let k = 0; k < w; k += 4) { const h = 2 + ((k * 7) % 3), up = Math.round(Math.sin(time * 3 + k * 0.7) * 0.8); rect(g, sx + k + shake, sy - h + 1 + up, 2, h + 1, (k / 4) % 2 ? '#8ad060' : '#6ab048'); rect(g, sx + k + shake, sy - h + 1 + up, 2, 1, k0 > 0.6 ? '#f0ff90' : '#c8f080'); }
    g.globalAlpha = 0.55; g.fillStyle = '#d8ffe8'; for (let k = 5; k < w - 3; k += 11) { const ph = (time * 0.6 + k * 0.17) % 1; g.fillRect(sx + k + shake, sy - 3 - Math.round(ph * 4), 1, 1); } g.globalAlpha = 1; }
  else { rect(g, sx, sy + 1, w, 3, '#1a2a1e'); rect(g, sx, sy + 3, w, 1, '#0e1a12');
    for (let k = 0; k < w; k += 5) { rect(g, sx + k, sy + ((k / 5) % 2), 4, 2, '#26382a'); if ((k / 5) % 3 === 0) rect(g, sx + k + 1, sy + 3, 1, 3, '#16241a'); }
    g.globalAlpha = 0.5; g.fillStyle = '#4a4a30'; for (let k = 2; k < w; k += 9) g.fillRect(sx + k, sy + 1, 2, 1); g.globalAlpha = 1; }
}
/* the boom: a chained log, bark and end-grain, iron bands, a chain draped to a ring on each bank, a red-and-white lane mark when it is live */
export function drawBoom(g, sx, y, live, bargeFloat, time) {
  rect(g, sx - 8, y - 6, 16, 6, '#2c3238'); rect(g, sx - 8, y - 6, 16, 1, '#7a848c'); rect(g, sx - 8, y - 1, 16, 1, '#101416'); for (const q of [-4, 1, 6]) rect(g, sx + q, y - 6, 1, 6, '#181c20');   /* (claude/canalfix3) an iron boom: a riveted spar, black-painted, no log */
  rect(g, sx - 9, y - 5, 2, 4, '#4a525a'); rect(g, sx + 7, y - 5, 2, 4, '#4a525a'); px(g, sx - 8, y - 4, '#9aa2aa'); px(g, sx + 8, y - 4, '#9aa2aa');
  rect(g, sx - 5, y - 7, 2, 8, '#3a3e44'); rect(g, sx + 4, y - 7, 2, 8, '#3a3e44'); g.fillStyle = '#8a929c'; for (let q = 0; q < 4; q++) { g.fillRect(sx - 12 - q * 3, y - 3 + (q % 2), 2, 1); g.fillRect(sx + 10 + q * 3, y - 3 + (q % 2), 2, 1); }
  if (live && bargeFloat === false) { const fl = Math.floor(time * 8) % 2; g.fillStyle = fl ? '#ff6b6b' : '#ffffff'; for (const o of [-2, 2]) { g.fillRect(sx + o, y - 18, 1, 6); g.fillRect(sx + o, y - 10, 1, 1); } } }
export function drawSkiff(g, sx, y, time) { const bob = Math.round(Math.sin(time * 2.2) * 0.6); y += bob; poly(g, [[sx, y - 1], [sx + 32, y - 1], [sx + 27, y + 5], [sx + 4, y + 5]], '#2a1a10'); rect(g, sx, y - 1, 32, 1, '#8a6a3e'); rect(g, sx + 6, y + 2, 20, 1, '#6a3a28'); rect(g, sx + 10, y - 3, 1, 3, '#3a2a1a'); rect(g, sx + 22, y - 3, 1, 3, '#3a2a1a'); rect(g, sx + 2, y - 3, 6, 2, '#1c2428'); rect(g, sx + 28, y - 5, 5, 2, '#684a2c'); }
/* the arch's "too low" sill: a stone lip with a yellow-and-black chevron band */
export function drawSill(g, ax, ay) { rect(g, ax - 3, ay - 6, 10, 7, '#3a464c'); rect(g, ax - 3, ay - 6, 10, 1, '#7a8e94'); for (let q = 0; q < 10; q += 4) { g.fillStyle = (q / 4) % 2 ? '#1b1626' : '#ffd36b'; g.fillRect(ax - 3 + q, ay - 3, 3, 3); } rect(g, ax - 3, ay, 10, 1, '#14181c'); }
/* Jenny's child's shoe: a small red-brown buckle shoe, one lace strap, a brass buckle */
export function drawShoe(g, x, y) { rect(g, x, y - 3, 6, 3, '#6a3a2a'); rect(g, x, y - 4, 3, 1, '#8a5a3a'); rect(g, x + 3, y - 2, 3, 1, '#4a2418'); px(g, x + 2, y - 3, '#e0b84a'); rect(g, x, y, 6, 1, '#2a1410'); }

/* (claude/canalfix3) THE STREET'S IRONWORK: railings along the backs of the street, the towpaths and the high footbridges (spear-topped posts, two rails), bollards on the quays */
export function drawRailing(g, sx, top, w) { for (let x = 0; x <= w; x += 8) { rect(g, sx + x, top - 11, 1, 11, '#20262c'); px(g, sx + x, top - 12, '#6a747c'); } rect(g, sx, top - 10, w + 1, 1, '#3a4048'); rect(g, sx, top - 9, w + 1, 1, '#14181c'); rect(g, sx, top - 4, w + 1, 1, '#2c3238'); }
export function drawBollard(g, x, top) { rect(g, x - 3, top - 7, 7, 7, '#22272c'); rect(g, x - 4, top - 9, 9, 2, '#3a4048'); rect(g, x - 4, top - 9, 9, 1, '#7a848c'); rect(g, x - 2, top - 6, 1, 5, '#4a525a'); }
/* A SIGN on the canal: a cast-iron plaque, white-edged, on an iron post (the game's wooden board belongs to the woods) - the same 18 x 18 and anchor as PROP.sign */
export function canalSign() { return once('sign', () => { const [c, g] = canvas(18, 18); rect(g, 8, 8, 2, 10, '#22272c'); rect(g, 8, 8, 1, 10, '#4a525a'); rect(g, 6, 16, 6, 2, '#2a3036');
  rect(g, 1, 1, 16, 8, '#2a3036'); rect(g, 1, 1, 16, 1, '#cfd8d4'); rect(g, 1, 8, 16, 1, '#cfd8d4'); rect(g, 1, 1, 1, 8, '#cfd8d4'); rect(g, 16, 1, 1, 8, '#cfd8d4'); rect(g, 3, 3, 8, 1, '#a8b4b0'); rect(g, 3, 5, 11, 1, '#a8b4b0'); return outline(c, '#0c0e10'); }); }
/* a barrel: staves, two iron hoops, a lit edge (the warehouse's stores; the street's) */
export function barrel(g, x, floorY, w, h) { const y = floorY - h; rect(g, x + 1, y, w - 2, h, '#3e2e1e'); rect(g, x, y + 2, w, h - 4, '#4a3624'); rect(g, x + 2, y + 1, 1, h - 2, '#6a5034'); rect(g, x, y + 3, w, 1, '#2a2e34'); rect(g, x, y + h - 4, w, 1, '#2a2e34'); rect(g, x + 1, y, w - 2, 1, '#5a4430'); }
/* ============================== THE ROOMS (what stands behind the tiles): the warehouse, the mill, Jenny's door ============================== */
const BRICKS = (w, h, a, b, mort) => once('rbr' + w + h + a + b, () => { const [c, g] = canvas(w, h); rect(g, 0, 0, w, h, mort); for (let y = 0, row = 0; y < h; y += 5, row++) for (let x = -(row & 1) * 6; x < w; x += 12) { const t = ((x * 7 + y * 13) % 11) / 11; rect(g, x + 1, y + 1, 10, 3, t < 0.2 ? b : a); } return c; });
export function paintRoom(g, rs, sx, sy, w, h, time) {
  if (rs === 'cnTunnel') return paintTunnelRoom(g, sx, sy, w, h, time);   /* (claude/canal4art) the legging tunnel: a brick barrel vault with iron lining rings (src/redraw/canal_tunnel.js) */
  const room = { cnWarehouse: 1, cnMill: 2, cnDoor: 3, cnCellar: 4, cnCistern: 4, cnTunnel: 4 }[rs]; if (!room) return false;   /* 4: (claude/canalfix3) the safe swims' vaults - bare wet brick */
  g.save(); g.beginPath(); g.rect(sx, sy, w, h); g.clip();
  if (room === 4) { for (let y = sy; y < sy + h; y += 96) for (let x = sx; x < sx + w; x += 96) g.drawImage(BRICKS(96, 96, '#1a2228', '#222c34', '#0e1418'), x, y); g.restore(); return true; }
  if (room === 1 || room === 3) { g.drawImage(BRICKS(96, 96, room === 1 ? '#2a2224' : '#1c2426', room === 1 ? '#34292b' : '#242e30', room === 1 ? '#161213' : '#10181a'), 0, 0, 96, 96, sx, sy, 96, 96); for (let y = sy; y < sy + h; y += 96) for (let x = sx; x < sx + w; x += 96) g.drawImage(BRICKS(96, 96, room === 1 ? '#2a2224' : '#1c2426', room === 1 ? '#34292b' : '#242e30', room === 1 ? '#161213' : '#10181a'), x, y); }
  else { for (let y = sy; y < sy + h; y += 96) for (let x = sx; x < sx + w; x += 96) g.drawImage(BRICKS(96, 96, '#2c2426', '#382c2c', '#171314'), x, y); }   /* (claude/canalfix3) the mill is brick inside too, not planking */
  /* (claude/canalfix3, Daniel: TOO MUCH WOOD) a fireproof frame: cast-iron columns with a capital, iron beams riveted along */
  const post = x => { rect(g, x + 1, sy, 4, h, '#2c3238'); rect(g, x + 1, sy, 1, h, '#5a646c'); rect(g, x + 4, sy, 1, h, '#121518'); for (let y = sy + 4; y < sy + h; y += 80) { rect(g, x - 1, y + 5, 8, 2, '#3a4048'); rect(g, x - 1, y + 5, 8, 1, '#6a747c'); } };
  if (room !== 3) { for (let x = sx + 2; x < sx + w; x += room === 1 ? 64 : 112) post(x); for (let y = sy + 4; y < sy + h; y += 80) { rect(g, sx, y, w, 5, '#2c3238'); rect(g, sx, y, w, 1, '#5a646c'); rect(g, sx, y + 5, w, 1, '#0c0e10'); for (let x = sx + 3; x < sx + w; x += 6) px(g, x, y + 2, '#8a929a'); } }
  /* a moonlit window and its shaft */
  if (room !== 3) for (let x = sx + 22; x < sx + w - 14; x += room === 1 ? 60 : 96) { const y = sy + 22; rect(g, x, y, 12, 18, '#0a1218'); rect(g, x + 1, y + 1, 10, 16, '#4a6a82'); rect(g, x + 1, y + 1, 10, 3, '#8aa8bc'); rect(g, x + 5, y + 1, 1, 16, '#14202a'); rect(g, x + 1, y + 8, 10, 1, '#14202a');
    g.globalAlpha = 0.07; g.fillStyle = '#a8c8e0'; g.beginPath(); g.moveTo(x + 1, y + 17); g.lineTo(x + 11, y + 17); g.lineTo(x + 40, y + 120); g.lineTo(x + 10, y + 120); g.closePath(); g.fill(); g.globalAlpha = 1; }
  /* what is kept here: crates and sacks on the floor, a hoist rope with a hook, a lit lantern */
  const fl = sy + h;
  if (room === 1) { for (let x = sx + 8; x < sx + w - 20; x += 46) { barrel(g, x, fl, 10, 14); barrel(g, x + 11, fl, 10, 14); barrel(g, x + 5, fl - 14, 10, 12); }   /* (claude/canalfix3) barrels stacked, not crates */
    for (let x = sx + 40; x < sx + w - 8; x += 70) { rect(g, x, fl - 10, 10, 10, '#6a5a3a'); rect(g, x + 1, fl - 11, 8, 2, '#8a7a52'); rect(g, x + 3, fl - 6, 4, 1, '#3a2c18'); }
    rect(g, sx + 16, sy, 1, 60, '#6a5a3a'); rect(g, sx + 14, sy + 60, 5, 2, '#9aa2aa'); rect(g, sx + 18, sy + 60, 1, 4, '#9aa2aa'); }
  if (room === 2) { /* the mill: a great millstone on edge, a gear train, hanging sacks */
    for (let x = sx + 30; x < sx + w - 30; x += 130) { g.fillStyle = '#4a4a4c'; g.beginPath(); g.arc(x, fl - 26, 24, 0, 6.3); g.fill(); g.fillStyle = '#5a5a5c'; g.beginPath(); g.arc(x, fl - 26, 20, 0, 6.3); g.fill(); g.strokeStyle = '#34343a'; g.lineWidth = 1; for (let k = 0; k < 8; k++) { const a = k * Math.PI / 4; g.beginPath(); g.moveTo(x, fl - 26); g.lineTo(x + Math.cos(a) * 19, fl - 26 + Math.sin(a) * 19); g.stroke(); } g.fillStyle = '#2a2a2e'; g.beginPath(); g.arc(x, fl - 26, 4, 0, 6.3); g.fill(); }
    for (let x = sx + 70; x < sx + w - 40; x += 150) { const a = time * 0.5 + x; g.strokeStyle = '#3a4048'; g.lineWidth = 2; g.beginPath(); g.arc(x, sy + 50, 16, 0, 6.3); g.stroke(); g.lineWidth = 1; for (let k = 0; k < 6; k++) { const an = a + k * Math.PI / 3; g.beginPath(); g.moveTo(x, sy + 50); g.lineTo(x + Math.cos(an) * 16, sy + 50 + Math.sin(an) * 16); g.stroke(); } }
    for (let x = sx + 50; x < sx + w - 20; x += 90) { rect(g, x, sy + 30, 1, 22, '#6a5a3a'); rect(g, x - 4, sy + 52, 9, 12, '#8a7a52'); rect(g, x - 4, sy + 52, 9, 2, '#a89868'); } }
  const lx = sx + (room === 3 ? 20 : 44), ly = sy + 60; rect(g, lx, ly - 22, 1, 22, '#2a2420'); rect(g, lx - 3, ly - 6, 7, 7, '#1b1b20'); rect(g, lx - 2, ly - 5, 5, 5, '#ffcf6a');
  const gr = g.createRadialGradient(lx, ly - 2, 1, lx, ly - 2, 40); gr.addColorStop(0, 'rgba(255,207,106,0.30)'); gr.addColorStop(1, 'rgba(255,207,106,0)'); g.fillStyle = gr; g.fillRect(lx - 40, ly - 42, 80, 80);
  if (room === 3) { for (let x = sx + 4; x < sx + w - 3; x += 8) rect(g, x, fl - 26, 2, 22, '#3a3e44'); rect(g, sx, fl - 28, w, 2, '#3a3e44'); g.globalAlpha = 0.3; g.fillStyle = '#2e5a3a'; for (let x = sx; x < sx + w; x += 9) g.fillRect(x, fl - 5, 5, 5); g.globalAlpha = 1; }
  g.restore(); return true;
}

/* ============================== JENNY'S LOCK, dressed (the chamber: slimed stone, weed, the sunken narrowboat that is her lair) ============================== */
export function drawLair(g, lk, cx, cy, VW, VH, time) {
  const sx = lk.sx * TS, ex = (lk.sx + 39) * TS, bed = lk.R * TS, x0 = sx - cx, x1 = ex - cx; if (x1 < -20 || x0 > VW + 20) return;
  /* weed in curtains hanging from the gate walkways and the walls, swaying slow, longer toward the corners */
  for (const side of [0, 1]) for (let i = 0; i < 9; i++) { const wx = (side ? ex - 8 - i * 11 : sx + TS + 4 + i * 11) - cx; if (wx < -10 || wx > VW + 10) continue; const top = bed - 6 * TS - 4 - cy + ((i * 5) % 7), len = 14 + ((i * 7) % 5) * 7;
    for (let k = 0; k < len; k++) { const sw = Math.round(Math.sin(time * 0.9 + i * 1.7 + k * 0.12 + side) * (1 + k * 0.05)); g.fillStyle = k % 6 === 5 ? '#4a8a4a' : k % 3 ? '#1e4a28' : '#2e6a34'; g.fillRect(wx + sw, top + k, 2, 1); } }
  /* slime sliding down the wall faces */
  g.globalAlpha = 0.5; g.fillStyle = '#6aa860'; for (let i = 0; i < 10; i++) { const wx = (i < 5 ? sx + TS - 1 - 0 : ex) - cx + (i < 5 ? 0 : 0), ph = (time * 5 + i * 13) % 40; if (wx < -4 || wx > VW + 4) continue; g.fillRect(wx + ((i * 3) % 12) * (i < 5 ? 1 : -1) - (i < 5 ? 0 : 3), bed - 12 * TS - cy + ((i * 17) % 90) + Math.round(ph * 0.4), 1, 3); } g.globalAlpha = 1;
  /* THE LAIR: the sunken narrowboat on the bed - a rotted cabin frame over its deck (ribs, a torn tarpaulin, a snapped tiller), weed streaming off it, two cold-green eyes in the dark of its hatch */
  if (lk.raft) return;   /* (claude/canal4: the raft duel - no sunken narrowboat on her bed; the raft is drawn by src/benched/jenny-greenteeth-hands.js) */
  const wx0 = (lk.sx + 15) * TS - cx, wx1 = (lk.sx + 25) * TS - cx, deck = (lk.R - 2) * TS - cy; if (wx1 < -10 || wx0 > VW + 10) return;
  g.fillStyle = '#18120c'; g.fillRect(wx0 + 8, deck - 24, 3, 24); g.fillRect(wx0 + 22, deck - 22, 3, 22); g.fillRect(wx0 + 38, deck - 26, 3, 26); g.fillRect(wx0 + 54, deck - 20, 3, 20); g.fillRect(wx0 + 8, deck - 24, 50, 3);
  g.fillStyle = '#26301c'; g.fillRect(wx0 + 8, deck - 24, 50, 1); for (let k = 0; k < 50; k += 3) g.fillRect(wx0 + 8 + k, deck - 23, 2, 2 + ((k * 7) % 5));
  g.fillStyle = '#0c1210'; g.fillRect(wx0 + 24, deck - 18, 13, 18);                                                                   /* the hatch */
  const bl = (Math.floor(time * 0.35) % 5) === 0 ? 0 : 1; if (bl) { g.fillStyle = '#b8ff8a'; g.fillRect(wx0 + 27, deck - 11, 2, 1); g.fillRect(wx0 + 32, deck - 11, 2, 1); g.globalAlpha = 0.18; g.beginPath(); g.fillStyle = '#b8ff8a'; g.arc(wx0 + 30, deck - 10, 9, 0, 6.3); g.fill(); g.globalAlpha = 1; }
  g.fillStyle = '#3a2c1c'; g.fillRect(wx1 - 12, deck - 14, 2, 14); g.fillRect(wx1 - 14, deck - 15, 6, 2);                                /* the snapped tiller */
  for (let i = 0; i < 6; i++) { const ox = wx0 + 4 + i * 16; for (let k = 0; k < 16; k++) { const sw = Math.round(Math.sin(time * 1.2 + i + k * 0.2) * (1 + k * 0.1)); g.fillStyle = k % 4 ? '#1e4a28' : '#3a7a3c'; g.fillRect(ox + sw, deck - 24 - k + ((i % 2) * 6), 1, 1); } }   /* weed streaming up off her */
}
