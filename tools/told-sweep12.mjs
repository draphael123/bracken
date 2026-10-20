// tools/told-sweep12.mjs - THE SEVEN NEW TOLD ATTACKS ANSWER (claude/sweepact12, the act I-II sweep; scratch/brief-foepass-1016.md 4b).
// In the page, headless, on a flat floor: each family that was on TOLD_TODO (thief, spitcap, sapper, emberwisp, stormshaman, clinger, shardling) is set down
// beside a god-mode-off hero. Its new windup (src/marks.js MARK) must show, and then
//   - the hero who does NOTHING loses what the blow takes (health; for the thief, a purse: e.loot moves)
//   - the hero who gives its ANSWER - a jump over the thief's swipe and the shardling's flick, a duck under the spitcap's spit and the clinger's lash, a held
//     shield against the sapper's shove, the wisp's dart and the shaman's jab - is not touched.
// A family whose windup never shows, or whose blow takes the answering hero, fails.
//   PORT=8751 node tools/told-sweep12.mjs
import assert from 'node:assert/strict';
import { openPage } from './cdp.mjs';

const CASES = [
  { t: 'thief', tell: 'swipeTell', blow: 'swipe', answer: 'jump', dx: 3, dy: 0 },
  { t: 'spitcap', tell: 'spitTell', answer: 'duck', dx: 6, dy: 0 },
  { t: 'sapper', tell: 'shoveTell', blow: 'shove', answer: 'block', dx: 1.5, dy: 0 },
  { t: 'emberwisp', tell: 'dartTell', answer: 'block', dx: 5, dy: 0 },
  { t: 'stormshaman', tell: 'jabTell', blow: 'jab', answer: 'block', dx: 1.5, dy: 0 },
  { t: 'clinger', tell: 'lashTell', blow: 'lash', answer: 'duck', dx: 1, dy: -4 },
  { t: 'shardling', tell: 'flickTell', answer: 'jump', ranged: true, dx: 5, dy: 0 },
];
const pg = await openPage({ audio: false, fonts: false });
let R;
try {
  await pg.reload();
  R = await pg.evalp(`(async()=>{ const { LEVELS } = await import('/src/level.js'); const out = {};
    BK.PROG.hero = 'knight'; BK.load(LEVELS.findIndex(l => l.id === 'wood')); BK.start(); BK.god = true;
    const L = BK.L, W = L.W, at = (x, y) => L.grid[y * W + x]; let spot = null;
    for (let x0 = Math.floor(BK.P.x / 16); x0 < W - 40 && !spot; x0++) for (let y = 8; y < L.H - 2 && !spot; y++) {
      let ok = true; for (let x = x0; x < x0 + 28 && ok; x++) ok = at(x, y + 1) === 1 && [0, 1, 2, 3, 4, 5, 6, 7].every(k => at(x, y - k) === 0);
      if (ok) spot = [x0 + 6, y]; }
    for (const e of BK.enemies()) e.alive = false; BK.tp(spot[0], spot[1]); BK.sim(20);
    const K = BK.keys, P = BK.P;
    const trial = (c, act) => { for (const e of BK.enemies()) e.alive = false; for (const s of BK.seeds()) s.dead = true; BK.clouds().length = 0; for (const k in K) K[k] = false;
      BK.god = true; BK.tp(spot[0], spot[1]); P.vx = 0; P.face = 1; BK.sim(8);
      const [f] = BK.spawnFoe({ t: c.t, x: spot[0] + c.dx, y: spot[1] + c.dy, face: -1 }); BK.sim(2); f.hp = 999; f.hp0 = 999; f.loot = 0;
      BK.god = false; P.hp = P.maxHp; P.st = P.maxSt; P.face = Math.sign(f.x - P.x) || 1; let seen = false, rel = false, jumpN = 0, hp0 = P.hp, tr = [], lm = '', lh = P.hp, fr = 0; const rec = () => { if (f.mode !== lm || P.hp !== lh) { tr.push(fr + ':' + f.mode + ':' + P.hp + ':' + Math.round(f.x - P.x)); lm = f.mode; lh = P.hp; } fr++; };
      for (let k = 0; k < 900 && !rel; k++) {
        if (f.mode === c.tell) { if (!seen) { seen = true; if (act === 'duck') K.down = true; if (act === 'block') K.block = true; } P.face = Math.sign(f.x - P.x) || P.face; }
        else if (seen) { rel = true; if (act === 'jump' && !c.ranged) { BK.press('jump'); K.jump = true; } }
        rec(); BK.sim(1); }
      /* THE BLOW LANDS: a body blow (the swipe, the shove, the jab, the lash) is watched while its mode runs; a flung one (spit, dart, shard) while it flies */
      for (let n = 0; n < (c.blow ? 140 : 160); n++) {
        if (act === 'jump' && c.ranged && !K.jump) { const s = BK.seeds().find(q => q.owner === f || q.from === f); if (s && Math.abs(s.x - P.x) < 30) { BK.press('jump'); K.jump = true; } }
        if (K.jump && ++jumpN > 12) K.jump = false;
        if (c.blow && n > 4 && f.mode !== c.blow) break;
        rec(); BK.sim(1); }
      for (const k in K) K[k] = false; BK.sim(4);
      return { seen, rel, lost: hp0 - P.hp, took: f.loot !== 0 || f.mode === 'flee', mode: f.mode, trace: tr.slice(-8).join(' ') }; };
    for (const c of ${JSON.stringify(CASES)}) { out[c.t] = { stand: trial(c, 'stand'), answered: trial(c, c.answer) }; }
    return out; })()`, 900000);
  assert.deepEqual(pg.errors, [], 'page errors');
} finally { pg.close(); }
console.log(JSON.stringify(R));
const bad = [], must = (ok, msg) => { if (!ok) bad.push(msg); };
for (const c of CASES) { const r = R[c.t];
  must(r.stand.seen && r.stand.rel, c.t + ': its ' + c.tell + ' windup never showed / never released (' + JSON.stringify(r.stand) + ')');
  must(c.t === 'thief' ? r.stand.took : r.stand.lost > 0, c.t + ': standing there, the ' + c.tell + ' blow took nothing (' + JSON.stringify(r.stand) + ')');
  must(r.answered.seen && r.answered.rel, c.t + ': the answered run never saw the windup (' + JSON.stringify(r.answered) + ')');
  must(c.t === 'thief' ? !r.answered.took : r.answered.lost === 0, c.t + ': answered with a ' + c.answer + ', the blow still took (' + JSON.stringify(r.answered) + ')'); }
assert.deepEqual(bad, [], 'the new told attacks:\n  ' + bad.join('\n  '));
console.log('the seven new told attacks answer: thief (jump), spitcap (duck), sapper (shield), ember wisp (shield), storm shaman (shield), clinger (duck), shardling (jump).');
