// burial-expansion.js — THE BURIAL CAVERNS' MACHINE: GAS VENTS YOU LIGHT (claude/burial2, 2026-09-26; brief docs/briefs/burial-rework-2.md).
// The level is src/burial-caverns.js. This file is everything about the gas that MOVES, and nothing in it imports main.js, so the
// tools can drive it in Node.
//
//   A VENT       a grate in the floor on a cycle you can read: idle, then 0.9 s of hiss and rising wisps, then 1.1 s of poison standing
//                a hand higher than the hero. Standing in the column costs a little health and leaves the caverns' poison on you.
//   A CANDLE     a lit candle on an iron stand. Walk into its light and you take FIRE IN HAND (VENT.fire seconds). A blow puts it
//                out, and so does water. A BURNING VENT gives it too, so you can light your way vent to vent.
//   LIGHT IT     strike a vent with fire in hand and the gas catches: it burns as a lamp for VENT.lit seconds. It does not puff while
//                it burns (the gas is going up in flame), it lights the dark round it, the dead standing in its flame burn, and
//                THE DEAD WILL NOT RISE INSIDE ITS LIGHT (VENT.light px): a buried one stays buried, a summoned one comes up elsewhere.
//   THE BURIED DEAD  walks into a burning vent, or has one lit under him, and is SCORCHED: open (buried-dead.js), once per lighting.
export const VENT = { lit: 20, light: 96, fire: 14, take: 18, strike: 12, scorch: 3.4, scorchR: 26, flameR: 12 };

/* the cycle as a function of time: a burning vent is only ever 'lit' */
export function gasVentState(v, time) {
  if (v.litT > 0) return 'lit';
  const t = ((time + v.phase) % v.period + v.period) % v.period; return t > v.period - 1.1 ? 'puff' : t > v.period - 2 ? 'warn' : 'idle';
}
export const ventX = v => v.x * 16 + 8, ventY = v => v.y * 16;
/* IS THIS SPOT IN A BURNING VENT'S LIGHT? The one question the dead ask before they get up. */
export function inVentLight(L, x, y, r = VENT.light) {
  for (const v of L.gasVents || []) if (v.litT > 0 && Math.hypot(x - ventX(v), (y - 8) - (ventY(v) - 16)) < r) return v;
  return null;
}
/* THE FIRE IN YOUR HAND AND THE GAS IT LIGHTS, every frame.
   io: { strikes(v) -> bool (the hero's blow is on this grate this frame), fireAt(x, y) -> bool (another fire is on it: a flare, an
         ember), say(x, y, text, col), sound(k), lit(v), out(v), burn(v) (the flame's own column, for main.js to burn what stands in it),
         wet() -> bool (the hero is in water) } */
export function updateGraveFire(L, P, dt, time, io = {}) {
  const vents = L.gasVents || [], say = io.say || (() => {}), sound = io.sound || (() => {});
  if (P.candle > 0) { P.candle = Math.max(0, P.candle - dt);
    if (P.dead || (io.wet && io.wet())) { P.candle = 0; say(P.x, P.y - 30, 'THE FIRE GOES OUT', '#6a7a7a'); sound('puff'); }
    else if (P.candle <= 0) { say(P.x, P.y - 30, 'THE FIRE IS OUT', '#6a7a7a'); sound('puff'); } }
  if (P.dead) return;
  /* taking fire: a candle's light, or a burning vent's */
  const near = (x, y) => Math.abs(P.x - x) < VENT.take && P.y > y - 30 && P.y < y + 20;
  const src = (L.candles || []).some(c => near(c.x * 16 + 8, c.y * 16 + 16)) || vents.some(v => v.litT > 0 && near(ventX(v), ventY(v)));
  if (src && !(P.candle > VENT.fire - 4)) { if (!(P.candle > 0)) { say(P.x, P.y - 36, 'FIRE IN HAND', '#ffd36b'); sound('spark'); } P.candle = VENT.fire; }
  for (const v of vents) {
    const was = v.litT > 0; v.litT = Math.max(0, (v.litT || 0) - dt);
    if (was && v.litT <= 0) { v.burnt = false; if (io.out) io.out(v); }
    if (v.litT > 0) { if (io.burn) io.burn(v); continue; }
    const fire = (P.candle > 0 && io.strikes && io.strikes(v)) || (io.fireAt && io.fireAt(ventX(v), ventY(v) - 8));
    if (fire) { v.litT = VENT.lit; v.burnt = false; v.hitT = 0; say(ventX(v), ventY(v) - 30, 'THE GAS BURNS', '#ffd36b'); sound('throwWhoosh'); if (io.lit) io.lit(v); }
  }
}
export function updateGasVents(L, P, dt, time, hurt) {
  for (const v of L.gasVents || []) { v.hitT = Math.max(0, (v.hitT || 0) - dt); v.state = gasVentState(v, time);
    if (v.state === 'puff' && !P.dead && v.hitT <= 0 && Math.abs(P.x - ventX(v)) < 11 && P.y > ventY(v) - 52 && P.y <= ventY(v) + 2) { v.hitT = .7; hurt(ventX(v)); } }
}
const FLAME = ['#fff6c8', '#ffd36b', '#ff9a5c', '#e0602c'];
export function drawGasVents(g, L, cx, cy, time) {
  for (const v of L.gasVents || []) { const x = Math.round(v.x * 16 - cx), y = Math.round(v.y * 16 - cy); if (x < -40 || x > g.canvas.width + 40) continue;
    g.fillStyle = '#1c1a16'; g.fillRect(x + 2, y - 2, 12, 3); g.fillStyle = '#4a4436'; for (let k = 0; k < 4; k++) g.fillRect(x + 3 + k * 3, y - 2, 1, 3);
    const st = gasVentState(v, time);
    if (st === 'lit') {   /* A BURNING VENT: a tongue of fire off the grate, taller as it catches, guttering in its last three seconds */
      const k = Math.min(1, (VENT.lit - v.litT) / 0.4), gut = v.litT < 3 ? 0.55 + 0.45 * Math.abs(Math.sin(time * 9)) : 1, hgt = Math.round((20 + 6 * Math.sin(time * 7 + v.x)) * k * gut);
      g.globalAlpha = 0.22; g.fillStyle = '#ffb060'; g.beginPath(); g.ellipse(x + 8, y - 12, 22, 16, 0, 0, 7); g.fill(); g.globalAlpha = 1;
      for (let i = 0; i < 4; i++) { const w = 10 - i * 2, h = Math.round(hgt * (1 - i * 0.2)); g.fillStyle = FLAME[3 - i];
        g.fillRect(x + 8 - w / 2 + Math.round(Math.sin(time * 11 + i * 2 + v.x) * 1.5), y - 2 - h, w, h); }
      for (let i = 0; i < 3; i++) { const ph = (time * 1.7 + i * 0.33 + v.x * 0.1) % 1; g.globalAlpha = 0.7 * (1 - ph); g.fillStyle = '#ffd36b'; g.fillRect(x + 5 + ((i * 5) % 7), y - hgt - 2 - ph * 18, 1, 2); }
      g.globalAlpha = 1; continue; }
    if (st === 'warn') { for (let k = 0; k < 4; k++) { const ph = ((time * 1.6 + k * .27) % 1); g.globalAlpha = .55 * (1 - ph); g.fillStyle = '#a6e04a'; g.fillRect(x + 4 + ((k * 5) % 9), y - 4 - ph * 16, 2, 2); } g.globalAlpha = 1; }
    if (st === 'puff') { g.globalAlpha = .34; g.fillStyle = '#5c8a24'; g.fillRect(x + 1, y - 52, 14, 50); g.globalAlpha = .5; g.fillStyle = '#a6e04a';
      for (let k = 0; k < 7; k++) { const ph = ((time * 2.2 + k * .19) % 1); g.fillRect(x + 2 + ((k * 7) % 11), y - 4 - ph * 46, 2, 2); } g.globalAlpha = 1; } }
  /* THE CANDLES: a fat grave candle on an iron stand, a real flame on it */
  for (const c of L.candles || []) { const x = Math.round(c.x * 16 + 8 - cx), y = Math.round(c.y * 16 + 16 - cy); if (x < -20 || x > g.canvas.width + 20) continue;
    g.fillStyle = '#2a2622'; g.fillRect(x - 5, y - 2, 11, 2); g.fillRect(x - 1, y - 14, 3, 12); g.fillStyle = '#4a443a'; g.fillRect(x - 4, y - 15, 9, 2);
    g.fillStyle = '#d8ccb0'; g.fillRect(x - 2, y - 21, 5, 6); g.fillStyle = '#b8ac90'; g.fillRect(x + 1, y - 21, 2, 6); g.fillStyle = '#efe6cc'; g.fillRect(x - 2, y - 22, 3, 1);
    const f = Math.round(Math.sin(time * 13 + c.x) * 1); g.fillStyle = '#ff9a5c'; g.fillRect(x - 1 + f, y - 26, 3, 4); g.fillStyle = '#fff6c8'; g.fillRect(x + f, y - 25, 1, 2);
    g.globalAlpha = 0.18; g.fillStyle = '#ffd36b'; g.beginPath(); g.arc(x, y - 24, 9, 0, 7); g.fill(); g.globalAlpha = 1; }
}
/* the fire in the hero's hand, drawn over him: a candle stub held out in front, and a counter over his head for its last seconds */
export function drawHandFire(g, P, cx, cy, time) {
  if (!(P.candle > 0) || P.dead) return;
  const x = Math.round(P.x - cx) + (P.face || 1) * 7, y = Math.round(P.y - cy) - 13, f = Math.round(Math.sin(time * 14) * 1);
  g.fillStyle = '#d8ccb0'; g.fillRect(x - 1, y, 3, 5); g.fillStyle = '#ff9a5c'; g.fillRect(x - 1 + f, y - 4, 3, 4); g.fillStyle = '#fff6c8'; g.fillRect(x + f, y - 3, 1, 2);
  if (P.candle < 4 && Math.floor(time * 6) % 2) { g.fillStyle = '#ff9a5c'; g.fillRect(x - 3, y - 8, 7, 1); }
}
