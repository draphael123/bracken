/* tools/maker-sweep.mjs (claude/maker) - EVERY FOE IN THE MAKER'S PALETTE WORKS IN A PLAIN WOOD.
   Each kind in src/maker-palette.js FOES is placed alone in a fresh made-by-hand wood (a WATER_FOES kind inside a pool) (MKR, src/main.js), played with
   the knight walking up to it, and must: spawn, keep finite coordinates, stay in the world, throw nothing - and,
   if it never moves, still hurt the knight standing beside it (a foe that does neither is waiting on machinery the
   maker cannot build, and belongs out of the palette). The page must log no errors.
   node tools/maker-sweep.mjs            (all)       node tools/maker-sweep.mjs sprig,wight   (some) */
import assert from 'node:assert/strict';
import { openPage } from './cdp.mjs';
import { portFor } from './ports.mjs';

const only = (process.argv[2] || '').split(',').filter(Boolean);
const pg = await openPage({ port: portFor(7), audio: false, seed: 20261109 });
try {
  const res = await pg.evalp(`(async () => {
    const P = await import('/src/maker-palette.js'); const list = ${JSON.stringify(only)}.length ? ${JSON.stringify(only)} : P.FOES;
    const E = () => (typeof BK.enemies === 'function' ? BK.enemies() : BK.enemies), out = [];
    for (const t of list) {
      /* PIN THE DICE PER KIND: a foe's rolls (when to dive, which way to turn) come from a stream seeded by its own name, so its
         result is the same every run and the same alone or in the full list (the gale harpy passed one run and failed the next) */
      { let s = [...t].reduce((h, c) => Math.imul(h ^ c.charCodeAt(0), 16777619) >>> 0, 2166136261); Math.random = () => { s = (Math.imul(s, 1664525) + 1013904223) >>> 0; return s / 4294967296; }; }
      const wet = P.WATER_FOES.includes(t), d = MKR.blank(60, 28);   /* a water kind is swept in a pool (rows 14-25), the rest on dry ground */
      if (wet) { for (let x = 15; x <= 45; x++) for (let y = 14; y <= 25; y++) d.grid[y * 60 + x] = 0; d.water = [{ kind: 'water', x0: 15, x1: 45, y0: 14, y1: 25 }]; }
      const fy = wet ? 22 : 19; d.ents = [{ t: 'gate', x: 55, y: 19 }, P.entFor(t, 30, fy)];   /* exactly what the editor would place (its defaults: a spider's drop) */ d.start = { x: 5, y: 19 }; MKR.doc = d;
      const r = { t };
      try {
        MKR.play(); BK.god = true; BK.step(30);
        const es0 = E().filter(e => e.t === t); r.spawned = es0.length; const at = es0.map(e => [e.x, e.y]);
        /* HOW FAR IT EVER GOT from where it stood, sampled all along: a patroller that walks out and back ends where it began,
           and measuring only the end called it a statue (the drowned knight, 2026-11-09) */
        r.moved = 0; const far = () => { E().filter(e => e.t === t).forEach((e, i) => { if (at[i]) r.moved = Math.max(r.moved, Math.hypot(e.x - at[i][0], e.y - at[i][1])); }); };
        BK.tp(25, fy); for (let k = 0; k < 24; k++) { BK.step(10); far(); } BK.tp(29, fy); for (let k = 0; k < 24; k++) { BK.step(10); far(); }
        const es = E().filter(e => e.t === t);
        r.bad = es.some(e => !Number.isFinite(e.x) || !Number.isFinite(e.y)); r.fell = es.some(e => e.y > 28 * 16 + 40);   /* (a water kind may sink to the bed; the world's floor is the line) */
        if (r.moved < 4) {   /* stands (nearly) still: then it must fight from where it stands */
          MKR.play(); BK.god = false; BK.step(30); let lost = 0;
          for (const tx of [26, 28, 31, 33]) { BK.tp(tx, fy); const h0 = BK.P.hp; BK.step(150); lost += Math.max(0, h0 - BK.P.hp); BK.P.hp = Math.max(BK.P.hp, 5); if (wet) BK.P.breath = 99; }
          r.hurt = lost;
        }
        r.ok = r.spawned > 0 && !r.bad && !r.fell && (r.moved >= 4 || r.hurt > 0);   /* 4 px: a breath or a bob is not a move */
      } catch (e) { r.err = String(e && e.message || e).slice(0, 160); r.ok = false; }
      try { MKR.resume(); } catch (e) {}
      out.push(r);
    }
    BK.god = false; return out;
  })()`, 600000);
  const bad = res.filter(r => !r.ok);
  for (const r of bad) console.log('  FAIL', JSON.stringify(r));
  assert.equal(bad.length, 0, bad.length + ' palette foe(s) do not work in a plain wood: ' + bad.map(r => r.t).join(' '));
  assert.deepEqual(pg.errors, [], 'page errors: ' + pg.errors.join(' | '));
  console.log('maker-sweep: all ' + res.length + ' palette foes spawn, stay in the world and fight in a plain made-by-hand wood.');
} finally { pg.close(); }
