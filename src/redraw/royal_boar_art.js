// src/redraw/royal_boar_art.js - THE ROYAL BOAR, painted (claude/gorm2art, Sonnet art pass; the AI is src/royal-boar.js, untouched). The King's own hunting beast: half again the woodsmen's boar, a heavy
// forequarter, a dark crest down its back tipped in the court's red, GILDED TUSKS, a red royal collar with gold studs and a chain. Baked frames (facing right, 52x34, feet on the bottom edge):
//   0-2 root (a three-step trot)   3-4 PAW (the told windup: head down, rump UP, a forehoof scraping the floor, dust)   5-6 CHARGE (stretched gallop / gathered stride, ears flat)   7 SKID (braced, rump low, mouth open)
//   8 DAZED (legs splayed, head down, tongue out, crossed eyes)   9 HURT (head thrown up, eyes shut, squealing)   10 DEAD (belly up, legs stiff, tongue out)
// SPR.royalboar is the standard set ({R, L, white, ax, ay, w, h}) so the bestiary card and the corpse use it; the bestiary cycles frames 0-3 (the card's walk).
import { canvas, rect, ellipse, circle, outline, flipX, whiten } from '../px.js';

const OUT = '#1b1626';
const C = { b: '#5c3c28', d: '#3a2416', dd: '#24160c', l: '#8a6040', ll: '#b0845a', t: '#f0e8d0', tG: '#e0b040', m: '#a83a2a', mD: '#6a1e18', g: '#e0b040', n: '#c9806a', e: '#1a0e08' };
export const NAMES = ['root0', 'root1', 'root2', 'paw0', 'paw1', 'charge0', 'charge1', 'skid', 'dazed', 'hurt', 'dead'];
export const IDX = Object.fromEntries(NAMES.map((n, i) => [n, i]));
const W = 52, H = 34;

/* one leg: from the hip (x, 24) to a foot at (x + dx, 32 - lift), 3 thick, a split hoof */
function leg(g, x, dx, lift, far) {
  const col = far ? '#2e1a0e' : '#52331f', fy = 31 - lift, fx = x + dx;
  for (let i = 0; i <= 7; i++) { const t = i / 7; rect(g, Math.round(x + (fx - x) * t) - 1, Math.round(24 + (fy - 24) * t), 3, 2, col); }
  rect(g, fx - 2, fy, 5, 2, C.e); if (!far) { rect(g, fx - 1, fy - 6, 1, 5, '#7a5236'); rect(g, fx - 2, fy - 1, 5, 1, '#8a8070'); }
}
function boar(g, o) {
  const rump = o.rump || 0, hd = o.hd || 0, L = o.legs || [0, 0, 0, 0, 0, 0, 0, 0];   /* [farHind x/lift, hind, farFront, front] as (dx, lift) pairs */
  const by = 19 + rump * 0.4;
  /* far legs and the tail, behind the body */
  leg(g, 13, L[0], L[1], true); leg(g, 31, L[4], L[5], true);
  rect(g, 6, by - 4 + (o.tail || 0), 3, 2, C.d); rect(g, 4, by - 6 + (o.tail || 0), 3, 3, C.d); rect(g, 3, by - 7 + (o.tail || 0), 2, 2, C.m);
  /* the body: a heavy barrel with the weight forward, belly dark, back lit */
  ellipse(g, 20, by + 1 + (rump > 0 ? 1 : 0), 15, 8, C.d); ellipse(g, 20, by, 15, 8, C.b); ellipse(g, 30, by - 1 + hd * 0.2, 9, 8.5, C.b); ellipse(g, 19, by + 4, 13, 3.5, C.d);
  ellipse(g, 18, by - 4, 11, 3, C.l); ellipse(g, 28, by - 6, 6, 2.2, C.ll); rect(g, 12, by - 7, 14, 1, C.ll);
  for (let i = 0; i < 5; i++) rect(g, 9 + i * 3 + (i > 2 ? 1 : 0), by + 1 + (i % 2) * 2, 1, 2, C.d);   /* the flank's ribs */
  /* the crest: a ridge of stiff bristles down the back, tipped red */
  for (let i = 0; i < 9; i++) { const x = 9 + i * 2.6, ty = by - 8 - (i < 6 ? 2 + (i % 2) : 1) + (i > 6 ? 1 : 0) + Math.round(Math.sin(i) * 0.5); rect(g, x, ty, 2, by - 6 - ty, C.dd); rect(g, x, ty, 2, 2, i % 2 ? C.m : C.mD); }
  /* near legs */
  leg(g, 9, L[2], L[3], false); leg(g, 27, L[6], L[7], false);
  /* the royal collar: a red band round the neck with gold studs and a chain */
  const nx = 31; rect(g, nx, by - 8 + hd * 0.4, 4, 15, C.m); rect(g, nx, by - 8 + hd * 0.4, 1, 15, '#d9583c'); rect(g, nx + 3, by - 8 + hd * 0.4, 1, 15, C.mD);
  for (let k = 0; k < 3; k++) rect(g, nx + 1, by - 5 + hd * 0.4 + k * 4, 2, 2, C.g);
  rect(g, nx - 1, by + 3 + hd * 0.4, 6, 1, C.g); rect(g, nx + 1, by + 5 + hd * 0.4, 2, 3, C.g);
  /* the head: low and heavy, a long snout, the ear, the eye, the TUSKS */
  const hx = 35, hy = by - 6 + hd;
  rect(g, hx, hy, 9, 10, C.b); rect(g, hx + 1, hy - 1, 7, 1, C.l); rect(g, hx + 2, hy + 8, 8, 3, C.d);   /* skull and jaw */
  rect(g, hx + 8, hy + 3, 7, 6, C.b); rect(g, hx + 8, hy + 3, 7, 1, C.l); rect(g, hx + 13, hy + 3, 3, 6, C.n); rect(g, hx + 14, hy + 4, 1, 2, C.e);   /* the snout and its flat nose */
  rect(g, hx + 1, hy - 5, 3, 5, C.d); rect(g, hx + 2, hy - 6, 2, 2, C.d); rect(g, hx + 1, hy - 3, 2, 2, C.m);   /* the ear, pricked (flat when told) */
  if (o.ears) { rect(g, hx + 1, hy - 5, 3, 5, C.b); rect(g, hx - 3, hy - 3, 5, 2, C.d); }
  if (o.eye === 'x') { rect(g, hx + 4, hy + 1, 1, 1, C.t); rect(g, hx + 6, hy + 1, 1, 1, C.t); rect(g, hx + 5, hy + 2, 1, 1, C.t); rect(g, hx + 4, hy + 3, 1, 1, C.t); rect(g, hx + 6, hy + 3, 1, 1, C.t); }
  else if (o.eye === 'shut') { rect(g, hx + 4, hy + 2, 3, 1, C.e); }
  else { rect(g, hx + 4, hy + 1, 3, 3, C.t); rect(g, hx + 5, hy + 2, 2, 2, C.e); rect(g, hx + 6, hy + 2, 1, 1, '#ff4a3c'); }
  rect(g, hx + 3, hy, 5, 1, C.dd);   /* the brow */
  /* the gilded tusks: ivory curved up out of the lower jaw, gold-capped */
  rect(g, hx + 9, hy + 7, 2, 3, C.t); rect(g, hx + 11, hy + 5, 2, 3, C.t); rect(g, hx + 13, hy + 2, 2, 4, C.t); rect(g, hx + 14, hy + 1, 2, 2, C.tG); rect(g, hx + 9, hy + 8, 2, 1, C.tG);
  if (o.mouth === 1) { rect(g, hx + 9, hy + 8, 6, 3, '#6a1e18'); rect(g, hx + 10, hy + 9, 4, 1, '#2a0a0a'); }
  if (o.mouth === 2) { rect(g, hx + 10, hy + 9, 4, 4, '#d9583c'); rect(g, hx + 10, hy + 12, 4, 1, '#a83a2a'); }   /* tongue out */
}
/* [farHind(dx, lift), nearHind, farFront, nearFront] -> flat list */
const pose = (a, b, c, d) => [...a, ...b, ...c, ...d];
const FR = {
  root0: { legs: pose([0, 0], [0, 0], [0, 0], [0, 0]) },
  root1: { legs: pose([-2, 0], [3, 2], [3, 2], [-2, 0]), rump: 0 },
  root2: { legs: pose([2, 2], [-3, 0], [-3, 0], [3, 2]), hd: 1 },
  paw0: { legs: pose([0, 0], [0, 0], [-1, 0], [8, 6]), hd: 5, rump: -4, tail: -1 },
  paw1: { legs: pose([0, 0], [0, 0], [-1, 0], [2, 0]), hd: 6, rump: -4, tail: 1 },
  charge0: { legs: pose([-8, 0], [-5, 2], [8, 3], [9, 1]), hd: 3, rump: 1, ears: true, tail: 1 },
  charge1: { legs: pose([2, 6], [-1, 6], [3, 6], [5, 5]), hd: 4, rump: -1, ears: true },
  skid: { legs: pose([3, 0], [4, 1], [9, 1], [10, 0]), hd: -2, rump: 5, mouth: 1 },
  dazed: { legs: pose([-4, 0], [-5, 0], [5, 0], [6, 0]), hd: 6, rump: 2, eye: 'x', mouth: 2 },
  hurt: { legs: pose([0, 0], [-1, 0], [1, 1], [2, 0]), hd: -4, rump: 1, eye: 'shut', mouth: 1 },
};
function bakeOne(name) {
  const [c, g] = canvas(W, H);
  if (name === 'dead') {   /* belly up: the standing boar turned over, legs stiff, an X eye, the tongue out */
    const [t, tg] = canvas(W, H); boar(tg, { legs: pose([2, 4], [0, 4], [4, 4], [3, 4]), eye: 'x', mouth: 2, hd: 3 });
    g.save(); g.translate(W, H + 4); g.rotate(Math.PI); g.drawImage(t, 0, 0); g.restore(); return outline(c, OUT); }
  boar(g, FR[name] || FR.root0); return outline(c, OUT);
}
let SET = null;
export function set() {
  if (SET) return SET;
  const R = NAMES.map(bakeOne), white = R.map(c => whiten(c));
  SET = { R, L: R.map(flipX), white: { R: white, L: white.map(flipX) }, ax: W / 2, ay: H, w: 36, h: 24 };
  return SET;
}
/* the bestiary card: the trot, four frames */
export function cardSet() { const s = set(), pick = [0, 1, 0, 2].map(i => s.R[i]), wh = pick.map(c => whiten(c)); return { R: pick, L: pick.map(flipX), white: { R: wh, L: wh.map(flipX) }, ax: s.ax, ay: s.ay, w: s.w, h: s.h }; }
/* the frame the AI's mode wants: e.mode root / enter / tell / charge / bolt / skid / dazed */
export function frameFor(e, time) {
  const md = e.mode, st = e.stagger > 0 && md === 'root';
  if (st) return IDX.hurt;
  if (md === 'charge' || md === 'bolt') return Math.floor(e.anim * 12) % 2 ? IDX.charge1 : IDX.charge0;
  if (md === 'tell') return Math.floor(time * 7) % 2 ? IDX.paw1 : IDX.paw0;
  if (md === 'skid') return IDX.skid;
  if (md === 'dazed') return IDX.dazed;
  if (md === 'enter') return [IDX.root0, IDX.root1, IDX.root0, IDX.root2][Math.floor(e.anim * 8) & 3];
  return Math.abs(e.vx) > 3 ? [IDX.root0, IDX.root1, IDX.root0, IDX.root2][Math.floor(e.anim * 7) & 3] : IDX.root0;
}
/* the told rim: the frame in the tell's gold (baked once per frame and side) */
const RIM = new Map(); export function rim(fr, dir) { const k = dir + fr; if (!RIM.has(k)) RIM.set(k, whiten(set()[dir][fr], '#ffd36b')); return RIM.get(k); }
