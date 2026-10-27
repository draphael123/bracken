// tools/oreroadcarts-shots.mjs - THE ORE ROAD's LAUNCHED CARTS (lane claude/oreroadminor, Daniel 10-26): pictures + a proof that the verbs WORK on the real page.
// usage: PORT=6604 node tools/oreroadcarts-shots.mjs <tag> [before]     (pictures to work/oreroadminor/<tag>/, a JSON line per probe to stdout)
//   'before' only takes the pictures that exist on master too (the same spots with no cart): run it from a checkout of master.
import { openPage, ROOT } from './cdp.mjs';
import { mkdirSync, writeFileSync } from 'fs';
import { join } from 'path';
const tag = process.argv[2] || 'carts', before = process.argv[3] === 'before';
const out = join(ROOT, 'work/oreroadminor', tag); mkdirSync(out, { recursive: true });
const pg = await openPage({ audio: false });
let n = 0;
const snap = `(() => { BK.step(1); const v = BK.view, c = document.createElement('canvas'); c.width = v.VW * 3; c.height = v.VH * 3; const g = c.getContext('2d'); g.imageSmoothingEnabled = false; g.drawImage(v.buf, 0, 0, c.width, c.height); return c.toDataURL('image/png'); })()`;
const save = async (name) => { const png = await pg.evalp(snap); const f = String(++n).padStart(2, '0') + '-' + name + '.png'; writeFileSync(join(out, f), Buffer.from(png.split(',')[1], 'base64')); console.log('shot', f); };
const cropJs = (wx, wy, ww, wh, sc) => `(() => { BK.step(1); const v = BK.view, c = document.createElement('canvas'); c.width = ${ww * sc}; c.height = ${wh * sc}; const g = c.getContext('2d'); g.imageSmoothingEnabled = false; g.drawImage(v.buf, ${wx} - v.x, ${wy} - v.y, ${ww}, ${wh}, 0, 0, c.width, c.height); return c.toDataURL('image/png'); })()`;
const crop = async (name, wx, wy, ww, wh, sc = 4) => { const png = await pg.evalp(cropJs(wx, wy, ww, wh, sc)); const f = String(++n).padStart(2, '0') + '-' + name + '.png'; writeFileSync(join(out, f), Buffer.from(png.split(',')[1], 'base64')); console.log('shot', f); };
const go = (x, y, frames = 60) => pg.evalp(`(async () => { BK.god = true; BK.tp(${x}, ${y}); for (let k = 0; k < ${frames}; k++) { BK.P.hp = BK.P.maxHp; BK.sim(1); } return true; })()`);
const probe = async (label, js) => { const r = await pg.evalp(js); console.log(label, JSON.stringify(r)); return r; };
try {
  await pg.evalp(`import('/src/level.js').then(M => { window.__i = M.LEVELS.findIndex(l => l.id === 'oreroad'); return true; })`);
  await pg.evalp(`(async () => { BK.setHero('knight'); BK.reset({ fresh: true }); BK.load(window.__i); BK.start(); BK.god = true; BK.sim(120); return true; })()`);
  /* TEACH: THE ORE STORE (the sorting floor) */
  await go(170, 36, 80); await save('teach-rest'); await crop('teach-rest-close', 2575, 505, 250, 95, 4); await crop('cart-closeup', 2625, 556, 60, 40, 12); await crop('barricade-closeup', 2776, 536, 48, 60, 12);
  if (!before) {
    await probe('teach shove', `(async () => { const W = BK.owk(), c = W.data().carts[0], P = BK.P; const g0 = BK.L.grid[35 * BK.L.W + 175]; P.face = 1; P.x = c.x - 22; P.y = 37 * 16; P.vx = 0; BK.sim(3); BK.press('atk'); BK.sim(5);
      const r = { st0: c.st, v0: Math.round(c.v), solid: g0 }; BK.sim(20); r.midX = Math.round(c.x); r.midSt = c.st; return r; })()`);
    await save('teach-roll'); await crop('teach-roll-close', 2575, 505, 250, 95, 4);
    await probe('teach smash', `(async () => { const W = BK.owk(), c = W.data().carts[0]; const P = BK.P; let k = 0; while (!c.broken && k++ < 200) { BK.sim(1); if (k === 30) { P.x = 2770; P.y = 37 * 16; } } return { broken: c.broken, frames: k, gridOpen: BK.L.grid[35 * BK.L.W + 175], smashed: W.n.smashed, x: Math.round(c.x) }; })()`);
    await crop('teach-smash-a', 2700, 505, 160, 95, 6); await pg.evalp('BK.sim(4)'); await crop('teach-smash-b', 2700, 505, 160, 95, 6); await pg.evalp('BK.sim(8)'); await crop('teach-smash-c', 2700, 505, 160, 95, 6); await save('teach-smash');
    await go(173, 36, 70); await save('teach-open'); await crop('teach-open-close', 2640, 505, 280, 95, 4);
    await probe('teach end + home', `(async () => { const W = BK.owk(), c = W.data().carts[0]; BK.sim(200); const a = { st: c.st, x: Math.round(c.x) }; BK.sim(500); return { ...a, after: c.st, xHome: Math.round(c.x), home: c.home }; })()`);
    await probe('teach reset mends', `(async () => { const W = BK.owk(), c = W.data().carts[0]; W.reset(); const c2 = BK.owk().data().carts[0]; return { solid: BK.L.grid[35 * BK.L.W + 175], broken: c2.broken, x: Math.round(c2.x), st: c2.st }; })()`);
    /* a bump: a shove from a standing start at the barricade is NOT slow; but a cart parked next to it with a weak roll thuds */
    await probe('teach weak bump', `(async () => { const W = BK.owk(), c = W.data().carts[0]; c.x = c.bar.l - 30; c.v = 60; c.st = 'roll'; BK.sim(120); return { broken: c.broken, st: c.st, x: Math.round(c.x) }; })()`);
  }
  /* TEST: THE SORTING RAIL (the middle deck, the dark stretch) */
  await pg.evalp(`(async () => { BK.reset(); return true; })()`);
  await go(183, 28, 100); await save('test-dark-rest'); await crop('test-dark-close', 2860, 380, 230, 100, 4);
  if (!before) {
    await probe('test foes', `(async () => BK.enemies().filter(e => e.alive && e.x > 2880 && e.x < 3040 && Math.abs(e.y - 464) < 14).map(e => e.t + '@' + Math.round(e.x)))()`);
    await probe('test shove', `(async () => { const W = BK.owk(), c = W.data().carts[1], P = BK.P; P.face = 1; P.x = c.x - 20; P.y = 29 * 16; P.vx = 0; BK.sim(3); BK.press('atk'); BK.sim(5); BK.sim(14); return { st: c.st, x: Math.round(c.x) }; })()`);
    await save('test-roll'); await crop('test-roll-close', 2860, 380, 230, 100, 4);
    await probe('test trip', `(async () => { const W = BK.owk(), c = W.data().carts[1], d = W.data(); let k = 0; while (!c.tripped && k++ < 300) BK.sim(1); BK.sim(30); return { tripped: c.tripped, frames: k, rams: W.n.rams, lit: d.lamps.map(l => l.id + ':' + l.lit), zoneDark: BK.L.darkZones.find(z => z.ow === 'deck').dark, x: Math.round(c.x) }; })()`);
    await save('test-lit'); await crop('test-lit-close', 2860, 380, 230, 100, 4);
    await go(184, 28, 60); await save('test-chain');
    /* the extra strikes: a ranger's arrow, a pyromancer's jet */
    await pg.evalp(`(async () => { BK.reset(); BK.setHero('ranger'); BK.start(); BK.god = true; BK.sim(30); return true; })()`);
    await probe('arrow lights lamp', `(async () => { const W = BK.owk(), lp = W.data().lamps[1], P = BK.P; BK.tp(150, 28); BK.sim(20); P.rgArrows = P.rgArrows || []; P.rgArrows.push({ state: 'fly', x: lp.x - 4, y: lp.y, vx: 300, vy: 0, g: 0, kind: 'tap', t: 0, hit: new Set(), dmg: 1 }); BK.sim(6); return { lit: lp.lit }; })()`);
    await pg.evalp(`(async () => { BK.reset(); BK.setHero('pyro'); BK.start(); BK.god = true; BK.sim(30); return true; })()`);
    await probe('jet lights the house lamp', `(async () => { const W = BK.owk(), lp = W.data().lamps[0], P = BK.P; BK.tp(Math.round(lp.x / 16) - 3, 36); BK.sim(10); P.face = 1; P.y = 37 * 16; const k = BK.keys; let hit = false;
      for (let i = 0; i < 90 && !lp.lit; i++) { P.cHeld = 1; P.face = 1; k.block = true; BK.sim(1); hit = hit || !!P.jet; } k.block = false; return { lit: lp.lit, jetOn: hit }; })()`);
    await probe('jet lights lamp', `(async () => { const W = BK.owk(), lp = W.data().lamps[1], P = BK.P; BK.tp(Math.round(lp.x / 16) - 2, 28); BK.sim(10); P.face = 1; P.y = 29 * 16; const k = BK.keys; k.block = true; let hit = false;
      for (let i = 0; i < 90 && !lp.lit; i++) { P.cHeld = 1; P.face = 1; k.block = true; BK.sim(1); hit = hit || !!P.jet; } k.block = false; return { lit: lp.lit, jetOn: hit, y: Math.round(P.y), lampY: lp.y }; })()`);
  }
  console.log('done');
} finally { await pg.close(); }
