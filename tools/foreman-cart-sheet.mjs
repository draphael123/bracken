// tools/foreman-cart-sheet.mjs (foreman2; pure node, no browser): the Foreman's cart at stomp 0 / 1 / 2 / 3 (plates knocked off), x4, to a PNG.
//   node tools/foreman-cart-sheet.mjs [out.png]
import { install, sheet, savePNG } from './node-canvas.mjs';
import * as MCA from '../src/redraw/deeprails3_art.js';
install();
/* (the lamp's glow sprite needs paths/gradients, which the shim lacks: no-op them - the glow is a faint extra, not the plates) */
const mk = document.createElement; globalThis.document.createElement = t => { const c = mk(t), gc = c.getContext.bind(c); c.getContext = (...a) => { const g = gc(...a); return new Proxy(g, { get: (o, k) => (!/^(beginPath|arc|fill|stroke|moveTo|lineTo|closePath|ellipse|quadraticCurveTo|bezierCurveTo|fillText)$/.test(String(k)) && k in o ? (typeof o[k] === 'function' ? o[k].bind(o) : o[k]) : (k === 'createRadialGradient' || k === 'createLinearGradient' ? () => ({ addColorStop() {} }) : () => {})), set: (o, k, v) => { try { o[k] = v; } catch {} return true; } }); }; return c; };
const cells = [];
for (let st = 0; st < 4; st++) {
  const c = document.createElement('canvas'); c.width = 72; c.height = 60; const g = c.getContext('2d');
  g.fillStyle = '#16121c'; g.fillRect(0, 0, 72, 60); g.fillStyle = '#3a3036'; g.fillRect(0, 50, 72, 3); g.fillStyle = '#6a5a4a'; g.fillRect(0, 53, 72, 2);
  const real = g.globalCompositeOperation; try { MCA.armourCart(g, 38, 50, 0.3, 0, st, false); } catch (e) { console.error('draw failed at stage', st, e.message); process.exit(1); }
  cells.push(c);
}
savePNG(sheet(cells, { maxW: 4 * 80, pad: 4, bg: '#0a0810', scale: 4 }), process.argv[2] || 'foreman-cart.png');
