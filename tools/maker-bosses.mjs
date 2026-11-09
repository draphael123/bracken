/* tools/maker-bosses.mjs (claude/maker) - EVERY BOSS IN THE MAKER'S PALETTE WORKS IN A MADE-BY-HAND ARENA.
   Each kind in src/maker-palette.js BOSSES is placed alone in a plain wood (its arena is built round it), and with the dice
   pinned to its name: walking over the trigger WAKES the fight, it stays in the world and moves or hurts the knight, a
   blow FINISHES it once it is down to its last point, and its fall OPENS THE GOAL. The page logs no errors.
   node tools/maker-bosses.mjs [kind,kind]   (a kind not in BOSSES is tried as a candidate) */
import assert from 'node:assert/strict';
import { openPage } from './cdp.mjs';
import { portFor } from './ports.mjs';

const only = (process.argv[2] || '').split(',').filter(Boolean);
const pg = await openPage({ port: portFor(6), audio: false, seed: 6 });
try {
  const res = await pg.evalp(`(async () => {
    const P = await import('/src/maker-palette.js'); MKR.enter(); (await import('/src/maker-ui.js')).closePanel();
    const list = ${JSON.stringify(only)}.length ? ${JSON.stringify(only)} : P.BOSSES, out = [];
    for (const t of list) {
      { let s = [...t].reduce((h, c) => Math.imul(h ^ c.charCodeAt(0), 16777619) >>> 0, 2166136261); Math.random = () => { s = (Math.imul(s, 1664525) + 1013904223) >>> 0; return s / 4294967296; }; }
      P.trialBoss(t, true); const d = MKR.blank(100, 28); d.ents = [{ t: 'gate', x: 95, y: 19 }, { t, x: 62, y: 19 }]; d.start = { x: 5, y: 19 }; MKR.doc = d; const r = { t };
      try {
        MKR.play(); BK.god = true; BK.step(20); const a = BK.L.arena; r.arena = !!(a && a.maker);
        BK.tp(Math.round(a.trigger / 16) + 2, 19); for (let i = 0; i < 300 && !BK.bossActive; i++) BK.step(1); r.woke = !!BK.bossActive;
        const b = BK.boss, x0 = b.x, y0 = b.y; let far = 0; for (let i = 0; i < 60; i++) { BK.step(10); far = Math.max(far, Math.hypot(b.x - x0, b.y - y0)); }
        r.moved = Math.round(far); r.inWorld = b.alive && isFinite(b.x) && isFinite(b.y) && b.y < 28 * 16 + 60;
        BK.god = false; const h0 = BK.P.hp; r.hurt = false; for (let i = 0; i < 40; i++) { BK.step(10); if (BK.P.hp < h0) r.hurt = true; BK.P.hp = Math.max(BK.P.hp, h0); } BK.god = true;
        b.hp = 1; for (let k = 0; k < 30 && b.alive; k++) { BK.tp(Math.round(b.x / 16) - 1, Math.min(19, Math.floor(b.y / 16))); BK.P.face = 1; dispatchEvent(new KeyboardEvent('keydown', { key: 'x' })); BK.step(1); dispatchEvent(new KeyboardEvent('keyup', { key: 'x' })); BK.step(20); }
        r.finished = !b.alive; for (let i = 0; i < 10 && !BK.L.gateOpen; i++) BK.step(60); r.gate = !!BK.L.gateOpen;
        r.ok = r.arena && r.woke && r.inWorld && (r.moved >= 4 || r.hurt) && r.finished && r.gate;
      } catch (e) { r.err = String(e && e.message || e).slice(0, 140); r.ok = false; }
      try { MKR.resume(); } catch (e) {} P.trialBoss(t, false); BK.god = false; out.push(r);
    }
    return out;
  })()`, 900000);
  const bad = res.filter(r => !r.ok);
  for (const r of bad) console.log('  FAIL', JSON.stringify(r));
  assert.equal(bad.length, 0, bad.length + ' palette boss(es) do not work in a made-by-hand arena: ' + bad.map(r => r.t).join(' '));
  assert.deepEqual(pg.errors, [], 'page errors: ' + pg.errors.join(' | '));
  console.log('maker-bosses: all ' + res.length + ' palette bosses wake, fight, fall to a blow and open the goal in a made-by-hand arena.');
} finally { pg.close(); }
