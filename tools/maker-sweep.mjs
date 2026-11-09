/* tools/maker-sweep.mjs (claude/maker) - EVERY FOE IN THE MAKER'S PALETTE WORKS IN A PLAIN WOOD.
   Each kind in src/maker-palette.js FOES is placed alone in a fresh made-by-hand wood (MKR, src/main.js), played with
   the knight walking up to it, and must: spawn, keep finite coordinates, stay in the world, throw nothing - and,
   if it never moves, still hurt the knight standing beside it (a foe that does neither is waiting on machinery the
   maker cannot build, and belongs out of the palette). The page must log no errors.
   node tools/maker-sweep.mjs            (all)       node tools/maker-sweep.mjs sprig,wight   (some) */
import assert from 'node:assert/strict';
import { openPage } from './cdp.mjs';
import { portFor } from './ports.mjs';

const only = (process.argv[2] || '').split(',').filter(Boolean);
const pg = await openPage({ port: portFor(7), audio: false });
try {
  const res = await pg.evalp(`(async () => {
    const P = await import('/src/maker-palette.js'); const list = ${JSON.stringify(only)}.length ? ${JSON.stringify(only)} : P.FOES;
    const E = () => (typeof BK.enemies === 'function' ? BK.enemies() : BK.enemies), out = [];
    for (const t of list) {
      const d = MKR.blank(60, 28); d.ents = [{ t: 'gate', x: 55, y: 19 }, { t, x: 30, y: 19 }]; d.start = { x: 5, y: 19 }; MKR.doc = d;
      const r = { t };
      try {
        MKR.play(); BK.god = true; BK.step(30);
        const es0 = E().filter(e => e.t === t); r.spawned = es0.length; const at = es0.map(e => [e.x, e.y]);
        BK.tp(25, 19); BK.step(240); BK.tp(29, 19); BK.step(240);
        const es = E().filter(e => e.t === t);
        r.bad = es.some(e => !Number.isFinite(e.x) || !Number.isFinite(e.y)); r.fell = es.some(e => e.y > 28 * 16 + 40);
        r.moved = es.length && at.length ? Math.max(...es.map((e, i) => at[i] ? Math.hypot(e.x - at[i][0], e.y - at[i][1]) : 0)) : 0;
        if (r.moved < 1) {   /* stands still: then it must fight from where it stands */
          MKR.play(); BK.god = false; BK.step(30); let lost = 0;
          for (const tx of [26, 28, 31, 33]) { BK.tp(tx, 19); const h0 = BK.P.hp; BK.step(150); lost += Math.max(0, h0 - BK.P.hp); BK.P.hp = Math.max(BK.P.hp, 5); }
          r.hurt = lost;
        }
        r.ok = r.spawned > 0 && !r.bad && !r.fell && (r.moved >= 1 || r.hurt > 0);
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
