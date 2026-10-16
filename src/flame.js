// src/flame.js - THE FLAME IN YOUR HAND, shared (claude/towpathchurch, 10-16). It was THE LIT CHURCH's verb (src/lit-church-hands.js: E at a fire puts a taper in your hand, it burns FLAME.life s,
// a blow that lands on you puts it out, E at a dark lamp with it lights the lamp); WAYMEET'S VOTIVE LAMPS (src/votive-hands.js) are the same verb taught cheaply before the church, so the
// pieces live here and both levels' hands call them - one flame, not a copy. A hero carries it as `pp.lcFlame` (seconds left) and `pp.lcHp` (his health when it last burned: a drop is a blow).
export const FLAME = { life: 14, takeR: 24, useR: 26, glow: 70 };
/* is hero P at a thing standing at (x, y) (its foot), within r px along the road, on its footing */
export const flameNear = (P, x, y, r) => Math.abs(P.x - x) <= r && P.y > y - 40 && P.y < y + 20;
/* E at a fire: a flame in hand (say('flame') the first time is the caller's: it owns the 'once') */
export function takeFlame(P, ctx, say) {
  P.lcFlame = FLAME.life; P.lcHp = P.hp; ctx.sfx.ignite ? ctx.sfx.ignite() : ctx.sfx.whoosh && ctx.sfx.whoosh(); ctx.burst(P.x, P.y - 30, 6, ['#ffd36b', '#ff9a3c'], 30, 0.4);
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
export function drawFlameHand(g, players, cx, cy, time) {
  const R = Math.round;
  for (const pp of players) { if (!(pp.lcFlame > 0) || pp.dead) continue; const x = R(pp.x - cx), y = R(pp.y - 30 - cy), k = Math.min(1, pp.lcFlame / FLAME.life), f = Math.sin(time * 13);
    g.fillStyle = '#e8e0c8'; g.fillRect(x + 6, y + 2, 2, R(2 + 8 * k)); g.fillStyle = pp.lcFlame < 3 && Math.floor(time * 8) % 2 ? '#ff6b2c' : '#ff9a3c'; g.fillRect(x + 6, y - 2 - R(f), 2, 4); g.fillStyle = '#fff6c8'; g.fillRect(x + 6, y - 1 - R(f), 1, 2);
    g.fillStyle = '#1b1626'; g.fillRect(x - 8, y - 8, 16, 2); g.fillStyle = '#ffd36b'; g.fillRect(x - 8, y - 8, R(16 * k), 2); } }
