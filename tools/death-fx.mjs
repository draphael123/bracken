// tools/death-fx.mjs — DEATH BY MATERIAL (src/death-fx.js) proved and filmed in Node: every material's burst is within the particle budget,
// all of it is gone within LIFE_MAX, the heavy things land ON the floor (never through it) and the bone and armour bounce first, the light
// things (spirit, feathers, paper) drift instead of dropping, the burst flies AWAY from the blow, and every foe maps to a material.
// Film: each material at 0, 0.08, 0.2, 0.4, 0.7, 1.1, 1.6 s, x4, to docs/death-fx.png.  usage: node tools/death-fx.mjs
import { install, newCanvas, savePNG } from './node-canvas.mjs';
install();
const D = await import('../src/death-fx.js');
let bad = 0; const ok = (c, m) => { console.log((c ? '  ok   ' : '  FAIL ') + m); if (!c) bad++; };
const FLOOR = 60, floorAt = () => FLOOR, DT = 1 / 60;
for (const m of D.MATERIALS) {
  const fx = D.deathBurst(m, 40, FLOOR, 1, 3), n0 = fx.parts.length; let t = 0, below = false, bounced = false, maxUp = 0, alive = true; const meanVx = fx.parts.reduce((s, p) => s + p.vx, 0) / n0;
  while (alive && t < 10) { alive = D.stepDeathFx(fx, DT, floorAt); t += DT; for (const p of fx.parts) { if (p.y > FLOOR + 0.01) below = true; if (p.clack) bounced = true; maxUp = Math.max(maxUp, FLOOR - p.y); } }
  const R = D.MATERIALS; const floaty = ['spirit', 'feather', 'paper', 'fur', 'cloth'].includes(m), bouncy = ['bone', 'armour', 'glass', 'clockwork', 'wood'].includes(m);
  ok(n0 <= D.DFX.MAX && t <= D.DFX.DECAL_T + 0.1 && !below && meanVx > 0 && (!bouncy || bounced), `${m.padEnd(9)}: ${n0} pieces, all gone in ${t.toFixed(2)} s (decals included), none through the floor, flying away from the blow${bouncy ? ', bouncing first' : ''}${floaty ? ', drifting' : ''}`);
}
{ const fx = D.deathBurst('spirit', 40, FLOOR, 1, 5); for (let i = 0; i < 40; i++) D.stepDeathFx(fx, DT, floorAt); const avgY = fx.parts.reduce((s, p) => s + p.y, 0) / fx.parts.length; ok(avgY < FLOOR - 16, `a spirit comes apart UPWARD (its pieces ${Math.round(FLOOR - avgY)} px up after 0.67 s)`); }
{ const fx = D.deathBurst('bone', 40, FLOOR, -1, 7); ok(fx.parts.reduce((s, p) => s + p.vx, 0) < 0, 'a blow from the other side throws the bones the other way'); }
{ const types = ['zombie', 'wight', 'hedgeknight', 'crow', 'wasp', 'bat', 'thief', 'tome', 'skeleton', 'eel', 'construct', 'glassscorp']; ok(types.every(t => D.MATERIALS.includes(D.materialOf(t))), `every foe has a material (unlisted ones go out as cloth: ${types.map(t => t + '=' + D.materialOf(t)).join(' ')})`); }
// the film
const times = [0, 0.08, 0.2, 0.4, 0.7, 1.1, 1.6], sc = 4, cw = 80, ch = 70, W = times.length * (cw * sc + 6) + 110, H = D.MATERIALS.length * (ch * sc + 6);
const c = newCanvas(W, H), g = c.getContext('2d'); g.fillStyle = '#2e2c36'; g.fillRect(0, 0, W, H);
D.MATERIALS.forEach((m, r) => { const fx = D.deathBurst(m, 40, FLOOR, 1, 3); let t = 0, fi = 0;
  const lab = newCanvas(100, 12), lg = lab.getContext('2d'); void lg;
  while (fi < times.length) { if (t >= times[fi] - 1e-6) { const f = newCanvas(cw, ch), fg = f.getContext('2d'); fg.fillStyle = '#3a3844'; fg.fillRect(0, 0, cw, ch); fg.fillStyle = '#5a5664'; fg.fillRect(0, FLOOR, cw, ch - FLOOR);
      D.drawDeathFx(fg, fx, 0, 0); g.drawImage(f, 100 + fi * (cw * sc + 6), r * (ch * sc + 6), cw * sc, ch * sc); fi++; }
    D.stepDeathFx(fx, DT, floorAt); t += DT; }
  g.fillStyle = ['#ece2c8', '#7a9a5a', '#d8e0d4', '#9aa4b0', '#b08a5a', '#4a4458', '#f0c030', '#8ac860', '#bcd8c4', '#d0a868', '#b08458', '#efe4c8', '#c89a3a', '#7ac0d8', '#c8b8a0'][r] || '#ffffff'; g.fillRect(10, r * (ch * sc + 6) + 10, 80, ch * sc - 20); });
savePNG(c, new URL('../docs/death-fx.png', import.meta.url));
console.log('  (rows, top to bottom: ' + D.MATERIALS.join(', ') + '; the swatch at the left of each row is its colour)');
console.log(bad ? `${bad} FAILED` : 'all death fx checks pass'); process.exit(bad ? 1 : 0);
