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
/* ---------- THROWN FIRE (claude/lamplit3, Daniel 10-18: "throw fire to ignite oil like other levels"). ADDITIVE: nothing above changes. ----------
   The flame in a hand can be THROWN: a told arc (src/carry-throw.js's aim - UP lobs, DOWN tosses short, neither is the plain throw), the same integration
   flown as told. It lands on what it meets: the caller decides what that means (oil catches, a dead lamp lights, a foe burns, water takes it); left on bare
   stone it LIES burning FLAME_THROW.lie s (a fire you can take up again). Pure: the caller owns the list and the world.
     FLAME_THROW                          its numbers (aims px/s, g, r = its half-size against walls, hit = the burn on a foe, lie s, light px)
     throwFlame(x, y, face, keys)         -> a thrown flame { x, y, vx, vy, t, st: 'fly' } from a hand at (x, y)
     stepThrownFlame(f, dt, solidAt)      one step; solidAt(px, py, falling) as carry-throw's predictArc. -> 'fly' | 'land' | 'wall' (it then lies: st 'lie')
     thrownHoles(hole, list, cx, cy)      its light in a dark pass                      drawThrownFlame(g, list, cx, cy, time)   in flight, and lying */
export const FLAME_THROW = { aims: { low: { vx: 100, vy: -110 }, mid: { vx: 175, vy: -180 }, high: { vx: 125, vy: -290 } }, g: 600, r: 3, ring: 9, dots: 14, hit: 14, lie: 6, light: 50 };
export function throwFlame(x, y, face, keys) { const a = FLAME_THROW.aims[keys && keys.up ? 'high' : keys && keys.down ? 'low' : 'mid'];
  return { x, y, vx: (face || 1) * a.vx, vy: a.vy, t: 0, st: 'fly' }; }
export function stepThrownFlame(f, dt, solidAt) {
  if (f.st !== 'fly') { f.t += dt; return f.st; }
  const px0 = f.x, py0 = f.y; f.vy += FLAME_THROW.g * dt; f.x += f.vx * dt; f.y += f.vy * dt; f.t += dt;
  if (solidAt(f.x + Math.sign(f.vx) * FLAME_THROW.r, py0, false) && !solidAt(px0, py0, false)) { f.x = px0; f.y = py0; f.st = 'lie'; f.t = 0; f.vx = 0; f.vy = 0; f.fall = true; return 'wall'; }
  if (f.vy < 0 && solidAt(f.x, f.y - FLAME_THROW.r, false)) f.vy = 0;
  if (f.vy >= 0 && solidAt(f.x, f.y + FLAME_THROW.r, true)) { f.st = 'lie'; f.t = 0; f.vx = 0; f.vy = 0; return 'land'; }
  return 'fly'; }
export function thrownHoles(hole, list, cx, cy) { for (const f of list || []) hole(f.x - cx, f.y - 4 - cy, FLAME_THROW.light * (f.st === 'lie' ? Math.max(0.4, 1 - f.t / FLAME_THROW.lie) : 1)); }
export function drawThrownFlame(g, list, cx, cy, time) {
  for (const f of list || []) { const x = Math.round(f.x - cx), y = Math.round(f.y - cy), fl = Math.floor(time * 14 + f.x) % 2, k = f.st === 'lie' ? Math.max(0.3, 1 - f.t / FLAME_THROW.lie) : 1;
    if (f.st === 'lie') { g.fillStyle = '#2a1a10'; g.fillRect(x - 3, y + 1, 6, 1); }
    g.globalAlpha = 0.35 * k; g.fillStyle = '#ff9a3c'; g.beginPath(); g.arc(x, y - 2, 5 + fl, 0, 7); g.fill(); g.globalAlpha = 1;
    g.fillStyle = fl ? '#ff6b2c' : '#ff9a3c'; g.fillRect(x - 1, y - 4 - Math.round(2 * k), 3, 3 + Math.round(2 * k)); g.fillStyle = '#fff6c8'; g.fillRect(x, y - 3, 1, 2); } }
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
/* ---------- THE FLAME IN A FIGHT (claude/church3, Daniel 10-17: "flames in the boss and the mini"; new undead foes that fear it) ----------
   The same taper, read by the fights and the foes - one verb, not four copies:
     THE DEACON (src/deacon.js)        a lamp HE DOUSED, lit again by your flame: the light comes back on him and he FALTERS (open)
     THE PALADIN (src/paladin-boss.js) a brazier lit BESIDE him (FIGHT.beside px): the holy fire breaks his LIGHT-WARD (his opening)
     THE UNDEAD PRIEST (src/undead-priest.js)  a hero carrying a flame near him (FIGHT.scare px): his casting breaks off and he FLEES
     THE UNDEAD PALADIN (src/order-paladin.js) a blow struck with a flame in the hand cracks his DIVINE SHIELD open (as a gleamed parry does)
   FIGHT.beside: how close to a foe a lamp / brazier must be lit to count as "beside him"; FIGHT.scare: how near a carried flame frightens the dead */
export const FIGHT = { beside: 64, scare: 72 };
/* does this hero carry a burning flame */
export const carrying = pp => !!pp && !pp.dead && (pp.lcFlame || 0) > 0;
/* the nearest hero carrying a flame within r px of (x, y) (y: the foe's feet), or null */
export function flameBy(players, x, y, r) { let best = null, bd = 1e9;
  for (const pp of players || []) { if (!carrying(pp)) continue; const d = Math.abs(pp.x - x); if (d <= r && Math.abs(pp.y - y) <= 48 && d < bd) { bd = d; best = pp; } } return best; }
/* is a light at lampX "beside" a foe at foeX */
export const beside = (lampX, foeX, r = FIGHT.beside) => Math.abs(lampX - foeX) <= r;
