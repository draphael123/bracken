// src/theatre-foes.js - THE STAGEHAND (claude/theatre, THEATRE2: Daniel's pick C, the level's one new common foe). Pure step + a greybox sprite.
// A crew brute in a leather apron with a sandbag on a line. Slow, heavy, and dangerous one-on-one by what he does, not by his health:
//   THE SWING (red !!, told 0.8 s: the sandbag goes up over his shoulder): it comes down in front of him - nothing turns it. Step back out of it, then
//     cut him while he hauls it in (1.1 s open).
//   THE DROP (red !!, told 1.0 s: he hauls on a line and a shadow grows under YOU): when you are above him - on a gallery, a balcony, a box - he lets a
//     sandbag go from the flies onto the spot you stood on when he started. Move off the shadow.
// The hands (src/theatre-hands.js updateStagehand) move him and land the blows; the mark table rows are in src/marks.js (BY_HAND, ANSWER, HEIGHT).
import { canvas, px, rect, fillPoly, line, outline, flipX, whiten } from './px.js';
import { OUT } from './art.js';
export const STAGEHAND = { w: 14, h: 24, hp: 56, walk: 30, sight: 260, reach: 34, swingT: 0.8, strikeT: 0.2, swingDmg: 18, recover: 1.1,
  dropRange: 80, dropT: 1.0, dropDmg: 16, dropCd: 5, dropFall: 96 };
export const newStagehand = (x, y, face = -1) => ({ x, y, face, mode: 'walk', t: 0, vx: 0, dropCd: 2 });
/* one frame: w = { hero: { x, y, alive } | null (the nearest), canStep(dir) }. Sets s.vx; returns events: swingTell, swing { box, dmg }, dropTell { x, y },
   drop { x, y, dmg } */
export function stagehandStep(s, w, dt) {
  const C = STAGEHAND, evs = [], h = w.hero; s.vx = 0; s.dropCd = Math.max(0, (s.dropCd || 0) - dt);
  const dx = h ? h.x - s.x : 0, dy = h ? h.y - s.y : 0, same = h && Math.abs(dy) < 24 && Math.abs(dx) < C.sight;
  switch (s.mode) {
    case 'walk':
      if (!h) break;
      if (same) { s.face = Math.sign(dx) || s.face;
        if (Math.abs(dx) <= C.reach) { s.mode = 'swingTell'; s.t = C.swingT; evs.push({ t: 'swingTell' }); break; }
        if (!w.canStep || w.canStep(s.face)) s.vx = s.face * C.walk; break; }
      if (dy < -40 && dy > -200 && Math.abs(dx) < C.dropRange && s.dropCd <= 0) { s.mode = 'dropTell'; s.t = C.dropT; s.aimX = h.x; s.aimY = h.y; s.face = Math.sign(dx) || s.face; evs.push({ t: 'dropTell', x: s.aimX, y: s.aimY }); }
      break;
    case 'swingTell': s.t -= dt; if (s.t <= 0) { s.mode = 'swing'; s.t = C.strikeT; const x0 = s.face > 0 ? s.x : s.x - C.reach - 8; evs.push({ t: 'swing', dmg: C.swingDmg, box: [x0, x0 + C.reach + 8, s.y - 30, s.y] }); } break;
    case 'swing': s.t -= dt; if (s.t <= 0) { s.mode = 'recover'; s.t = C.recover; } break;
    case 'recover': s.t -= dt; if (s.t <= 0) s.mode = 'walk'; break;
    case 'dropTell': s.t -= dt; if (s.t <= 0) { s.mode = 'recover'; s.t = C.recover * 0.6; s.dropCd = C.dropCd; evs.push({ t: 'drop', x: s.aimX, y: s.aimY, dmg: C.dropDmg }); } break;
    default: s.mode = 'walk';
  }
  return evs;
}

/* THE SPRITE (greybox, but a figure): every frame faces RIGHT; 0 stand, 1-2 walk, 3 SWING TELL (the sack over his shoulder), 4 swing (the sack down in
   front), 5 hurt, 6 DROP TELL (both hands on a line overhead) */
const K = { apron: '#6a4a30', apronL: '#8a6a44', shirt: '#b8a888', shirtD: '#8a7a60', skin: '#c8966a', skinD: '#9a6a48', hair: '#3a2a1e', trouser: '#3e3a44', boot: '#241c18',
  sack: '#a88a5a', sackD: '#6e5634', rope: '#d8c8a0', cap: '#4a3e34' };
export function bakeStagehand() {
  const W = 40, H = 40, cx = 18, n = 7;
  const F = Array.from({ length: n }, (_, f) => { const [c, g] = canvas(W, H);
    const walk = f === 1 || f === 2, tell = f === 3, sw = f === 4, hurt = f === 5, drop = f === 6, st = f === 1 ? 1 : f === 2 ? -1 : 0, lean = hurt ? -2 : sw ? 3 : 0, y0 = 12;
    rect(g, cx - 5 + st, y0 + 18, 4, 9, K.trouser); rect(g, cx + 1 - st, y0 + 18, 4, 9, K.trouser); rect(g, cx - 6 + st, y0 + 26, 6, 2, K.boot); rect(g, cx + 1 - st, y0 + 26, 6, 2, K.boot);
    fillPoly(g, [[cx - 6 + lean, y0 + 5], [cx + 6 + lean, y0 + 5], [cx + 7, y0 + 19], [cx - 7, y0 + 19]], K.shirt);
    fillPoly(g, [[cx - 4 + lean, y0 + 8], [cx + 5 + lean, y0 + 8], [cx + 6, y0 + 20], [cx - 5, y0 + 20]], K.apron); line(g, cx - 3 + lean, y0 + 9, cx - 4, y0 + 19, K.apronL);
    rect(g, cx - 3 + lean, y0 - 2, 7, 7, K.skin); rect(g, cx - 3 + lean, y0 - 3, 7, 2, K.cap); px(g, cx + 2 + lean, y0 + 1, '#1a1210'); rect(g, cx - 3 + lean, y0 + 4, 7, 1, K.skinD);
    const arm = (sx, sy, ex, ey) => { line(g, sx, sy, ex, ey, K.shirt); line(g, sx, sy + 1, ex, ey + 1, K.shirtD); rect(g, ex - 1, ey - 1, 3, 3, K.skin); };
    const sack = (x, y) => { rect(g, x - 4, y, 9, 8, K.sack); rect(g, x - 4, y + 6, 9, 2, K.sackD); rect(g, x - 1, y - 2, 3, 2, K.rope); };
    if (tell) { arm(cx + 4, y0 + 7, cx - 2, y0 - 6); arm(cx - 4, y0 + 7, cx - 8, y0 - 4); sack(cx - 8, y0 - 12); }
    else if (sw) { arm(cx + 5 + lean, y0 + 7, cx + 14, y0 + 14); sack(cx + 17, y0 + 14); }
    else if (drop) { arm(cx + 4, y0 + 7, cx + 3, y0 - 8); arm(cx - 4, y0 + 7, cx - 1, y0 - 8); line(g, cx + 1, y0 - 12, cx + 1, 0, K.rope); }
    else if (hurt) { arm(cx - 5, y0 + 7, cx - 10, y0 + 12); arm(cx + 5, y0 + 7, cx + 9, y0 + 13); }
    else { arm(cx + 5, y0 + 7, cx + 9 + st, y0 + 15); arm(cx - 5, y0 + 7, cx - 8 - st, y0 + 15); sack(cx - 9 - st, y0 + 16); }
    outline(c, OUT); return c; });
  const L = F.map(c => flipX(c)), wh = F.map(c => whiten(c));
  return { R: F, L, white: { R: wh, L: wh.map(c => flipX(c)) }, ax: cx, ay: H - 1, w: STAGEHAND.w, h: STAGEHAND.h };
}
