// tools/pogo-chain.mjs — OFF THEIR HEADS, EVERY HERO (the combat pass, part 2, 2026-09-28; src/pogo-chain.js).
//
// A foe's head is ground only if every hero comes back up off it. In the page, headless, on the Stockade, for each of the seven
// heroes, a wasp hangs four tiles over the floor (nothing under it to stand on: a pit, as far as a spear is concerned) and the hero
// is dropped onto it from above:
//   THE PLUNGE  down and attack in the air: he must come back up off it, at least 300 px/s (the knight's pogo is 330; the Warden
//               VAULTS off a head over a drop, 300 or 345) - and a second wasp met on the way down again must bounce him again with the
//               chain counting 2 (not the Warden: she never bounces, she vaults, and a vault is not a chain)
//   THE STOMP   the same fall with no plunge: he must come back up off it (200 px/s or more), and it counts in the chain
//   node tools/pogo-chain.mjs
import assert from 'node:assert/strict';
import { openPage } from './cdp.mjs';

const HEROES = ['knight', 'pyro', 'reaper', 'pirate', 'paladin', 'geomancer', 'warden'];
const pg = await openPage({ audio: false, fonts: false });
let R;
try {
  await pg.reload();
  R = await pg.evalp(`(async()=>{
    const { LEVELS } = await import('/src/level.js');
    const out = [];
    for (const hero of ${JSON.stringify(HEROES)}) {
      BK.PROG.hero = hero; BK.load(LEVELS.findIndex(l => l.id === 'stockade')); BK.start(); BK.god = true;
      const L = BK.L, W = L.W, at = (x, y) => L.grid[y * W + x]; let spot = null;
      for (let x0 = Math.floor(BK.P.x / 16); x0 < W - 30 && !spot; x0++) for (let y = 12; y < L.H - 2 && !spot; y++) {
        let ok = true; for (let x = x0; x < x0 + 12 && ok; x++) ok = at(x, y + 1) === 1 && [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11].every(k => at(x, y - k) === 0);
        if (ok) spot = [x0 + 6, y]; }
      if (!spot) { out.push({ hero, err: 'no open floor' }); continue; }
      const P = BK.P, K = BK.keys, chain = () => (BK.combat2 ? BK.combat2().pogoChain() : null);
      const drop = (plunge, above) => {   /* a wasp four tiles up, the hero dropped onto it; returns the best rebound and the chain after */
        const [w] = BK.spawnFoe({ t: 'wasp', x: spot[0], y: spot[1] - 4 }); BK.sim(1);
        P.x = w.x; P.y = w.y - (above || 30); P.vx = 0; P.vy = 40; P.ground = false; P.plunge = false; P.atk = -1; P.dodge = 0; P.face = 1;
        if (plunge) { K.down = true; BK.press('atk'); }
        let best = 0, hit = false;
        for (let k = 0; k < 50; k++) { BK.sim(1); if (plunge && k > 2) K.down = false; if (P.vy < best) best = P.vy; if (best < -150) { hit = true; if (k > 3 && P.vy > best + 60) break; } if (P.ground) break; }
        K.down = false; return { vy: Math.round(best), hit, chain: chain(), ground: !!P.ground };
      };
      for (const e of BK.enemies()) e.alive = false; BK.tp(spot[0], spot[1]); BK.sim(20);
      const first = drop(true);
      /* the second head, met on the way down off the first: the chain */
      let second = null; if (first.hit) { for (let k = 0; k < 60 && P.vy < 30; k++) BK.sim(1); second = drop(true, 26); }
      for (const e of BK.enemies()) e.alive = false; BK.tp(spot[0], spot[1]); BK.sim(20);
      const stomp = drop(false);
      out.push({ hero, first, second, stomp });
    }
    return out;
  })()`, 900000);
  assert.deepEqual(pg.errors, [], 'page errors');
} finally { pg.close(); }
const bad = [];
for (const r of R) {
  console.log(JSON.stringify(r));
  if (r.err) { bad.push(`${r.hero}: ${r.err}`); continue; }
  if (r.first.vy > -300) bad.push(`${r.hero}: a plunge onto a head over a drop rebounded at ${-r.first.vy} px/s (a pogo is 330, a vault 300 or more)`);
  if (r.hero !== 'warden') {
    if (!r.second || r.second.vy > -300) bad.push(`${r.hero}: the second head did not throw him back up (${r.second ? -r.second.vy : 'never reached'})`);
    else if (r.second.chain !== 2) bad.push(`${r.hero}: two heads without the ground and the chain says ${r.second.chain}`);
  }
  if (r.stomp.vy > -200) bad.push(`${r.hero}: a stomp on a head rebounded at ${-r.stomp.vy} px/s`);
  else if (r.hero !== 'warden' && !(r.stomp.chain >= 1)) bad.push(`${r.hero}: a stomp was not counted in the chain (${r.stomp.chain})`);
}
assert.deepEqual(bad, [], 'pogo off heads:\n  ' + bad.join('\n  '));
console.log(`every one of ${R.length} heroes comes back up off a head, plunge or stomp, and chains two (the Warden vaults: she never bounces)`);
