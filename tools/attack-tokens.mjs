// tools/attack-tokens.mjs — A CROWD TAKES TURNS, AND THE ONES WAITING ARE NOT STATUES (the combat pass, 2026-09-28; src/attack-tokens.js).
//
// In the page, headless: a level is loaded, everything in it is put away, and a crowd of six common foes is set down round a hero
// who stands still in god mode for twenty seconds. Every frame counts the foes ATTACKING him - winding up (the predicate the
// marks read) or inside the half second after a windup, which is the blow itself. It fails when:
//   - more than TWO are attacking at once (the purse is two), or the crowd never attacks at all (a vacuous pass)
//   - a WAITING foe near him stands still: over every second it spends waiting within 150 px, it must cover at least 4 px
//     (waiting is its plain walking mode: a recovery after a blow is the hero's opening, and the pike, who holds a line by
//     design, waits in his guard, which glances a cut - neither is counted)
// Proved red on master (before the tokens): the same crowd had up to five attacking at once.
//   node tools/attack-tokens.mjs            (PORT from tools/ports.mjs)
import assert from 'node:assert/strict';
import { openPage } from './cdp.mjs';

const CASES = [['stockade', ['brute', 'brute', 'pike', 'sprig', 'sprig', 'shield']], ['waymeet', ['swornsword', 'swornsword', 'hedgeknight', 'swornsword', 'hedgeknight', 'runner']]];
const pg = await openPage({ audio: false, fonts: false });
const out = [];
try {
  for (const [lvl, crowd] of CASES) {
    await pg.reload();
    const r = await pg.evalp(`(async()=>{
      const { LEVELS } = await import('/src/level.js');
      BK.load(LEVELS.findIndex(l => l.id === ${JSON.stringify(lvl)})); BK.start(); BK.god = true;
      const L = BK.L, W = L.W, at = (x, y) => L.grid[y * W + x];
      /* A FLAT FLOOR: sixteen columns of ground with three rows of air over them, the nearest to the start */
      let spot = null;
      for (let x0 = Math.floor(BK.P.x / 16); x0 < W - 20 && !spot; x0++) for (let y = 4; y < L.H - 2 && !spot; y++) {
        let ok = true; for (let x = x0; x < x0 + 16 && ok; x++) ok = at(x, y + 1) === 1 && at(x, y) === 0 && at(x, y - 1) === 0 && at(x, y - 2) === 0;
        if (ok) spot = [x0 + 8, y]; }
      if (!spot) return { err: 'no flat floor' };
      for (const e of BK.enemies()) e.alive = false;
      BK.tp(spot[0], spot[1]); BK.sim(2);
      const foes = []; ${JSON.stringify(crowd)}.forEach((t, i) => { const side = i % 2 ? 1 : -1, dx = side * (2 + (i >> 1) * 2);
        for (const f of BK.spawnFoe({ t, x: spot[0] + dx, y: spot[1], face: -side })) foes.push(f); });
      const IDLE = new Set(['walk', 'idle', 'stalk', 'patrol', 'chase']);   /* WAITING is standing about in its plain mode: a recovery (rest, reel) is the hero's opening, and the pike's guard turns a cut */
      const last = new Map(), path = new Map(), win = new Map(); let maxA = 0, frames = 0, attacks = 0, stills = [], waitSecs = 0, reds = 0, redWith = [], redEnd = new Map();
      for (let f = 0; f < 1200; f++) {
        const x0 = new Map(foes.map(e => [e, e.x]));
        BK.P.hp = BK.P.maxHp || BK.P.hp; BK.sim(1); frames++;
        const now = f / 60; let a = 0;
        for (const e of foes) { if (!e.alive) continue;
          const tel = BK.telling(e); if (tel) { if (!last.has(e) || now - last.get(e) > 0.6) attacks++; last.set(e, now); }
          const attacking = tel || (last.has(e) && now - last.get(e) < 0.5); if (attacking) a++;
          const waiting = !attacking && !e.tokHeld && Math.abs(e.x - BK.P.x) < 150 && IDLE.has(e.mode);   /* (the pike holds his line by design: he waits in his guard, which turns your cut) */
          const w = win.get(e) || { t: 0, d: 0 }; if (waiting) { w.t += 1 / 60; w.d += Math.abs(e.x - x0.get(e)); } else { w.t = 0; w.d = 0; }
          if (w.t >= 1) { waitSecs++; if (w.d < 4) stills.push(e.t + ' at ' + now.toFixed(1) + 's (' + e.mode + ')'); w.t = 0; w.d = 0; }
          win.set(e, w); }
        maxA = Math.max(maxA, a);
        /* HEAVIES COME ALONE (part 2): while a red !! is winding up, and for the 0.4 s of its blow after, nobody else winds up */
        for (const e of foes) if (e.alive && BK.telling(e) && BK.markOf(e) === '!!') { if (!(redEnd.get(e) > now)) reds++; redEnd.set(e, now + 0.4); }
        for (const e of foes) if (e.alive && redEnd.get(e) > now) for (const q of foes) if (q !== e && q.alive && BK.telling(q) && redWith.length < 40) redWith.push(e.t + ' !! with ' + q.t + ' ' + q.mode + ' at ' + now.toFixed(2) + 's'); }
      const tk = BK.tokens ? BK.tokens().board.stats : null;
      return { lvl: ${JSON.stringify(lvl)}, maxA, reds, nRedWith: redWith.length, redWith: redWith.slice(0, 4), attacks, waitSecs, stills: stills.slice(0, 8), nStill: stills.length, alive: foes.filter(e => e.alive).length, tk };
    })()`, 600000);
    out.push(r);
  }
  assert.deepEqual(pg.errors, [], 'page errors');
} finally { pg.close(); }
const bad = [];
for (const r of out) {
  console.log(JSON.stringify(r));
  if (r.err) { bad.push(r.lvl + ': ' + r.err); continue; }
  if (r.alive < 6) bad.push(`${r.lvl}: only ${r.alive} of the crowd of six stood the twenty seconds`);
  if (r.attacks < 6) bad.push(`${r.lvl}: the crowd attacked ${r.attacks} times in twenty seconds - nothing to measure`);
  if (r.maxA > 2) bad.push(`${r.lvl}: ${r.maxA} foes attacking the hero at once (the purse is two)`);
  if (r.waitSecs < 10) bad.push(`${r.lvl}: only ${r.waitSecs} foe-seconds of waiting near the hero - nothing to measure`);
  if (r.nRedWith) bad.push(`${r.lvl}: ${r.nRedWith} frames with another windup under a red !! (a heavy comes alone): ${r.redWith.join(', ')}`);
  if (r.nStill) bad.push(`${r.lvl}: ${r.nStill} of ${r.waitSecs} waiting foe-seconds stood still: ${r.stills.join(', ')}`);
}
{ const reds = out.reduce((n, r) => n + (r.reds || 0), 0); if (reds < 3) bad.push(`only ${reds} red !! blows over both crowds - nothing to measure (a heavy waits for the whole purse: it must still be thrown)`); }
assert.deepEqual(bad, [], 'attack tokens:\n  ' + bad.join('\n  '));
console.log(out.map(r => `${r.lvl}: at most ${r.maxA} of six attacking at once over ${r.attacks} attacks; ${r.waitSecs} waiting foe-seconds, none still`).join('\n'));
