// src/flame.js - THE FLAME IN YOUR HAND, shared (claude/towpathchurch, 10-16). It was THE LIT CHURCH's verb (src/lit-church-hands.js: E at a fire puts a taper in your hand, it burns FLAME.life s,
// a blow that lands on you puts it out, E at a dark lamp with it lights the lamp); WAYMEET'S VOTIVE LAMPS (src/votive-hands.js) are the same verb taught cheaply before the church, so the
// pieces live here and both levels' hands call them - one flame, not a copy. A hero carries it as `pp.lcFlame` (seconds left) and `pp.lcHp` (his health when it last burned: a drop is a blow).
export const FLAME = { life: 14, takeR: 24, useR: 26, glow: 70 };
/* is hero P at a thing standing at (x, y) (its foot), within r px along the road, on its footing */
export const flameNear = (P, x, y, r) => Math.abs(P.x - x) <= r && P.y > y - 40 && P.y < y + 20;
/* E at a fire: a flame in hand (say('flame') the first time is the caller's: it owns the 'once') */
export function takeFlame(P, ctx, say, life) {   /* life: a room with a draught (the chantry) hands a shorter taper (claude/church2) */
  P.lcFlame = life || FLAME.life; P.lcHp = P.hp; ctx.sfx.ignite ? ctx.sfx.ignite() : ctx.sfx.whoosh && ctx.sfx.whoosh(); ctx.burst(P.x, P.y - 30, 6, ['#ffd36b', '#ff9a3c'], 30, 0.4);
  if (say) say('flame', P); }
/* every frame: the flame burns down, and a blow that lands puts it out; say('died' | 'out', pp) tells the caller which (it counts and speaks) */
export function tickFlame(players, dt, say) {
  for (const pp of players) {
    if (pp.lcFlame > 0) { pp.lcFlame = Math.max(0, pp.lcFlame - dt);
      if (pp.lcFlame <= 0) say('died', pp);
      else if (pp.hp < (pp.lcHp ?? pp.hp) - 0.01 || pp.dead) { pp.lcFlame = 0; say('out', pp); } }
    pp.lcHp = pp.hp; } }
/* the light it throws on a dark pass: hole(x, y, r) for each carried flame */
export function flameHoles(hole, players, cx, cy) {
  for (const pp of players) if (pp.lcFlame > 0 && !pp.dead) hole(pp.x - cx, pp.y - 30 - cy, FLAME.glow * (0.6 + 0.4 * Math.min(1, pp.lcFlame / 4))); }
/* the taper in his hand and its burn-down bar, over everything */
export function drawFlameHand(g, players, cx, cy, time, lifeOf) {   /* lifeOf(pp) -> how long a taper lasts where he stands: given, the church's brass-dish taper that leans in a draught (church2art); omitted, WAYMEET's plain taper */
  const R = Math.round;
  for (const pp of players) { if (!(pp.lcFlame > 0) || pp.dead) continue; const x = R(pp.x - cx), y = R(pp.y - 30 - cy), k = Math.min(1, pp.lcFlame / FLAME.life), f = Math.sin(time * 13);
    if (lifeOf) { const dr = lifeOf(pp) < FLAME.life, lean = dr ? R(Math.sin(time * 17) * 1.2 + 1.5) : 0;   /* (church2art) a held taper: a brass dish and a wax stub that shortens; in the chantry's draught the flame leans downwind and streams sparks */
      g.fillStyle = '#7a5c1c'; g.fillRect(x + 4, y + 12, 6, 1); g.fillStyle = '#c9a040'; g.fillRect(x + 4, y + 11, 6, 1); g.fillStyle = '#e8e0c8'; g.fillRect(x + 6, y + 2, 2, R(2 + 8 * k)); g.fillStyle = '#b8ae90'; g.fillRect(x + 7, y + 3, 1, R(1 + 8 * k));
      g.fillStyle = pp.lcFlame < 3 && Math.floor(time * 8) % 2 ? '#ff6b2c' : '#ff9a3c'; g.fillRect(x + 6 + lean, y - 2 - R(f), 2, 4); g.fillStyle = '#fff6c8'; g.fillRect(x + 6 + lean, y - 1 - R(f), 1, 2); if (dr) for (let i = 0; i < 3; i++) { const q = (time * 2.4 + i / 3) % 1; g.globalAlpha = 1 - q; g.fillStyle = i & 1 ? '#ffd36b' : '#ff9a3c'; g.fillRect(x + 8 + lean + R(q * 14), y - 3 - R(Math.sin(q * 5 + i) * 2) - R(q * 3), 1, 1); g.globalAlpha = 1; }
      g.fillStyle = '#1b1626'; g.fillRect(x - 8, y - 8, 16, 2); g.fillStyle = '#ffd36b'; g.fillRect(x - 8, y - 8, R(16 * k), 2); continue; }
    g.fillStyle = '#e8e0c8'; g.fillRect(x + 6, y + 2, 2, R(2 + 8 * k)); g.fillStyle = pp.lcFlame < 3 && Math.floor(time * 8) % 2 ? '#ff6b2c' : '#ff9a3c'; g.fillRect(x + 6, y - 2 - R(f), 2, 4); g.fillStyle = '#fff6c8'; g.fillRect(x + 6, y - 1 - R(f), 1, 2);
    g.fillStyle = '#1b1626'; g.fillRect(x - 8, y - 8, 16, 2); g.fillStyle = '#ffd36b'; g.fillRect(x - 8, y - 8, R(16 * k), 2); } }
