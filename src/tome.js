// src/tome.js — THE TOME, a floating book (the Falling Tower's new foe, Daniel 2026-09-21: "floating books that attack the player").
// Pure: no DOM, no main.js. Proved by tools/tome.mjs. Not wired in: the build adds the spawn case, the frame table (src/redraw/tome.js),
// a bestiary row and the rest of A8's wiring points.
//
// WHAT IT DOES. It drifts near where it was shelved, riffling. When you come within 7 tiles it TELLS (a yellow ! : the covers flap
// open, the pages flare) for 0.6 s, LOCKING the spot you stood on as it starts, then DARTS there in a straight line - it does not
// steer, so a step under a steep one, or a jump over a flat one, answers it as surely as the shield. After the dart it is SPENT (0.8 s, hanging low: the time to hit it).
// THE SHIELD SHUTS IT: a dart blocked slams the book shut and it drops to the floor, SHUT for 1.5 s (2.5 s on a perfect block) and
// taking double damage - the answer that pays more than a dodge. It hurts only mid-dart (the touch rule).
// A SHELF OF THEM: tomes share one TOKEN, so only one is ever winding up or darting at a time (one windup at a time).
export const TOME = { hp: 18, notice: 7 * 16, tell: 0.6, dartSpeed: 260, dartMax: 0.5, spent: 0.8, shut: 1.5, shutPerfect: 2.5, shutMult: 2,
  drift: 18, bob: 5, speed: 34, cool: 1.4, box: [12, 10], dmg: 9 };
export function newTome(x, y) { return { x, y, hx: x, hy: y, hp: TOME.hp, mode: 'drift', t: 0, cd: 0.5 + Math.random() * 0.5, face: 1, lock: null, vx: 0, vy: 0, anim: Math.random() * 6, hitMult: 1, alive: true }; }
export const newToken = () => ({ holder: null });
export const tomeBox = e => [e.x - TOME.box[0] / 2, e.x + TOME.box[0] / 2, e.y - TOME.box[1], e.y];
/* one step. w = { px, py (the player's feet), floorY(x) -> the floor under x (for a shut book to drop to) }, token shared by the shelf.
   Returns events: tell / dart / hit { box, blockable } / spent / shut / dead */
export function tomeStep(e, w, dt, token) {
  const out = [], ev = (t, o = {}) => out.push({ t, ...o }); if (!e.alive) return out;
  e.t -= dt; e.cd -= dt; e.anim += dt; const dx = w.px - e.x, dy = (w.py - 8) - e.y, d = Math.hypot(dx, dy);
  const release = () => { if (token && token.holder === e) token.holder = null; };
  switch (e.mode) {
    case 'drift': {   /* riffling near its shelf, turning to face you */
      const tx = e.hx + Math.sin(e.anim * 0.9) * TOME.drift, ty = e.hy + Math.sin(e.anim * 2.1) * TOME.bob;
      e.x += Math.max(-1, Math.min(1, (tx - e.x) / 8)) * TOME.speed * dt; e.y += Math.max(-1, Math.min(1, (ty - e.y) / 8)) * TOME.speed * dt;
      if (d < TOME.notice * 1.5) e.face = Math.sign(dx) || e.face;
      if (d < TOME.notice && e.cd <= 0 && (!token || !token.holder)) { if (token) token.holder = e; e.mode = 'tell'; e.t = TOME.tell; e.lock = { x: w.px, y: w.py - 8 }; ev('tell', { mark: '!', lock: e.lock }); }
      break; }
    case 'tell': if (e.t <= 0) { const lx = e.lock.x - e.x, ly = e.lock.y - e.y, n = Math.hypot(lx, ly) || 1; e.vx = lx / n * TOME.dartSpeed; e.vy = ly / n * TOME.dartSpeed; e.mode = 'dart'; e.t = Math.min(TOME.dartMax, n / TOME.dartSpeed + 0.04); ev('dart'); } break;
    case 'dart': e.x += e.vx * dt; e.y += e.vy * dt; ev('hit', { box: tomeBox(e), blockable: true, dmg: TOME.dmg });
      if (e.t <= 0) { e.mode = 'spent'; e.t = TOME.spent; e.vx = e.vy = 0; release(); ev('spent'); } break;
    case 'spent': e.y += 10 * dt; if (e.t <= 0) { e.mode = 'drift'; e.cd = TOME.cool; } break;
    case 'shut': { const fy = w.floorY ? w.floorY(e.x) : e.y; if (e.y < fy) e.y = Math.min(fy, e.y + 220 * dt); if (e.t <= 0) { e.mode = 'drift'; e.cd = TOME.cool; e.hitMult = 1; } break; }
  }
  return out;
}
/* THE SHIELD SHUTS IT: call when its dart is blocked (perfect: on the beat) */
export function tomeBlocked(e, perfect, token) { if (e.mode !== 'dart') return; e.mode = 'shut'; e.t = perfect ? TOME.shutPerfect : TOME.shut; e.vx = e.vy = 0; e.hitMult = TOME.shutMult; if (token && token.holder === e) token.holder = null; }
export function tomeHurt(e, dmg, token) { if (!e.alive) return 0; const d = dmg * e.hitMult; e.hp -= d; if (e.hp <= 0) { e.alive = false; if (token && token.holder === e) token.holder = null; } return d; }
/* the frame table for src/redraw/tome.js */
export const TOME_F = { drift: [0, 1, 2], tell: 3, dart: 4, spent: 5, shut: 6, hurt: 7 };
export const tomeFrame = e => e.mode === 'drift' ? TOME_F.drift[Math.floor(e.anim * 8) % 3] : TOME_F[e.mode] ?? 0;
