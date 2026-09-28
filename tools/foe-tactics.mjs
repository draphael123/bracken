// tools/foe-tactics.mjs — HELD WIND-UPS AND REACTIVE WAITING (the combat pass, part 2, 2026-09-28; src/foe-tactics.js).
//
// In Node, the rules themselves:
//   - braceHit: a brute standing about turns the THIRD light cut of a flurry off his front, and never a heavy blow, and never in his
//     windup, his recovery or broken
//   - the grant: a swing in TAC.HOLD is sometimes held (never shortened), a red !! and a swing already under way never are
// In the page, headless, a hero standing still in god mode:
//   - HELD: a lone sworn sword and a lone soldier swing for forty seconds each. Their tells are timed: some must be held at least
//     0.25 s past the plain tell, none may be shorter than it, and the mark must be over the foe on every frame of every tell
//   - THE ARCHER BACKS OFF: three sworn swords and an archer round the hero; while the archer waits on the ring it holds at bow
//     range (on average 90 px or more off), not at a sword's reach
//   - THE SHIELD TURNS AT ITS OWN PACE: a waiting shieldgob with the hero put behind it takes the shieldgob's own turn (0.6 s or more)
//     to bring the shield round, and does bring it round (within 2 s)
//   node tools/foe-tactics.mjs
import assert from 'node:assert/strict';
import { TAC, braceHit, installTactics } from '../src/foe-tactics.js';
import { openPage } from './cdp.mjs';

const bad = [];
/* ---- in Node ---- */
{ const b = { t: 'brute', mode: 'walk', face: 1 }; let turned = [];
  for (let i = 0; i < 6; i++) turned.push(braceHit(b, i * 0.4, false));
  if (JSON.stringify(turned) !== JSON.stringify([false, false, true, false, false, true])) bad.push('braceHit: a flurry of light cuts should have its third turned, got ' + JSON.stringify(turned));
  const h = { t: 'brute', mode: 'walk', face: 1 }; braceHit(h, 0, false); braceHit(h, 0.3, false); if (braceHit(h, 0.6, true)) bad.push('braceHit: a heavy blow was turned');
  const r = { t: 'brute', mode: 'rest', face: 1 }; braceHit(r, 0, false); braceHit(r, 0.3, false); if (braceHit(r, 0.6, false)) bad.push('braceHit: the brute covered up in his recovery (the hero\'s opening)');
  const s = { t: 'brute', mode: 'walk', face: 1 }; braceHit(s, 0, false); braceHit(s, 2, false); if (braceHit(s, 4, false)) bad.push('braceHit: three cuts two seconds apart are not a flurry');
  const fl = { t: 'brute', mode: 'walk', face: 1, stagger: 0.42 }; braceHit(fl, 0, false); braceHit(fl, 0.25, false); if (!braceHit(fl, 0.5, false)) bad.push('braceHit: the flinch of a cut (stagger 0.42) kept the brute from covering up');
  const o = { t: 'sprig', mode: 'walk' }; for (let i = 0; i < 4; i++) if (braceHit(o, i * 0.2, false)) bad.push('braceHit: a sprig covered up'); }
{ const board = { on: {}, stats: {} }, TOK = { waitMove: () => {}, perHero: 2 }; installTactics(board, TOK, {});
  let held = 0; const real = Math.random;
  try { for (let i = 0; i < 400; i++) { Math.random = () => (i % 20) / 20; const e = { t: 'swornsword', mode: 'cutTell', modeT: 0.55, tokSnap: { wu: false } }; board.on.grant(e); if (e.modeT < 0.55) bad.push('grant: a tell was shortened'); if (e.modeT > 0.55) held++; if (e.modeT > 0.55 + TAC.HOLD_MAX + 1e-9) bad.push('grant: held longer than HOLD_MAX'); }
    Math.random = () => 0; const red = { t: 'brute', mode: 'raise', modeT: 0.9, tokHeavy: true }; board.on.grant(red); if (red.modeT !== 0.9) bad.push('grant: a red !! was held');
    const mid = { t: 'swornsword', mode: 'cutTell', modeT: 0.2, tokSnap: { wu: true } }; board.on.grant(mid); if (mid.modeT !== 0.2) bad.push('grant: a swing already under way was held'); }
  finally { Math.random = real; }
  if (!held || held === 400) bad.push('grant: HOLD_CHANCE holds none or all (' + held + ' of 400)'); }

/* ---- in the page ---- */
const pg = await openPage({ audio: false, fonts: false });
let page;
try {
  await pg.reload();
  page = await pg.evalp(`(async()=>{
    const { LEVELS } = await import('/src/level.js');
    BK.load(LEVELS.findIndex(l => l.id === 'waymeet')); BK.start(); BK.god = true;
    const L = BK.L, W = L.W, at = (x, y) => L.grid[y * W + x];
    let spot = null;
    for (let x0 = Math.floor(BK.P.x / 16); x0 < W - 30 && !spot; x0++) for (let y = 4; y < L.H - 2 && !spot; y++) {
      let ok = true; for (let x = x0; x < x0 + 24 && ok; x++) ok = at(x, y + 1) === 1 && at(x, y) === 0 && at(x, y - 1) === 0 && at(x, y - 2) === 0;
      if (ok) spot = [x0 + 12, y]; }
    if (!spot) return { err: 'no flat floor' };
    const clear = () => { for (const e of BK.enemies()) e.alive = false; BK.tp(spot[0], spot[1]); BK.sim(30); };
    const out = { held: {}, archer: null, shield: null };
    for (const [t, base] of [['swornsword', 0.55], ['soldier', 0.5]]) {
      clear(); const [f] = BK.spawnFoe({ t, x: spot[0] + 3, y: spot[1], face: -1 });
      const lens = []; let run = 0, noMark = 0;
      for (let k = 0; k < 2400; k++) { BK.P.x = spot[0] * 16 + 8; BK.sim(1); const tel = f.alive && BK.telling(f);
        if (tel) { run++; if (!BK.markOf(f)) noMark++; } else if (run) { lens.push(run / 60); run = 0; } }
      out.held[t] = { base, lens: lens.map(v => +v.toFixed(2)), noMark }; }
    { clear(); const foes = [];
      for (const [t, dx] of [['swornsword', -3], ['swornsword', 3], ['swornsword', -5], ['archer', 6]]) foes.push(...BK.spawnFoe({ t, x: spot[0] + dx, y: spot[1], face: dx > 0 ? -1 : 1 }));
      const a = foes.find(e => e.t === 'archer'); let n = 0, sum = 0;
      for (let k = 0; k < 1200; k++) { BK.P.x = spot[0] * 16 + 8; BK.sim(1); if (a.alive && a.tokWait && a.tokRing > 0) { n++; sum += Math.abs(a.x - BK.P.x); } }
      out.archer = { waitFrames: n, meanD: n ? Math.round(sum / n) : null }; }
    { clear(); const foes = [];
      for (const [t, dx] of [['swornsword', -3], ['swornsword', 3], ['shield', 4]]) foes.push(...BK.spawnFoe({ t, x: spot[0] + dx, y: spot[1], face: dx > 0 ? -1 : 1 }));
      const s = foes.find(e => e.t === 'shield'); const turns = [];
      for (let k = 0; k < 1800 && turns.length < 3; k++) { BK.P.x = spot[0] * 16 + 8; BK.sim(1);
        if (s.alive && s.tokWait && s.tokRing > 0 && s.face === (Math.sign(BK.P.x - s.x) || s.face)) {
          /* put the hero behind it, and time the turn */
          const behind = s.x - s.face * 30; BK.P.x = behind; let f = 0;
          for (; f < 120; f++) { BK.P.x = behind; BK.sim(1); if (s.face === (Math.sign(BK.P.x - s.x) || s.face)) break; }
          turns.push(+(f / 60).toFixed(2)); k += f; } }
      out.shield = { turns }; }
    return out;
  })()`, 900000);
  assert.deepEqual(pg.errors, [], 'page errors');
} finally { pg.close(); }
console.log(JSON.stringify(page));
if (page.err) bad.push(page.err);
else {
  for (const [t, r] of Object.entries(page.held)) {
    if (r.lens.length < 5) bad.push(`${t}: only ${r.lens.length} tells in forty seconds - nothing to measure`);
    const plain = Math.min(...r.lens), long = r.lens.filter(v => v >= plain + 0.25);   /* (its plain tell, as the screen shows it: the windup the marks read runs longer than the tell's own timer) */
    if (plain < r.base - 0.03) bad.push(`${t}: a tell of ${plain} s, shorter than its own ${r.base} s`);
    if (!long.length) bad.push(`${t}: no tell was held (all of ${r.lens.join(', ')})`);
    if (long.length === r.lens.length) bad.push(`${t}: every tell was held - there is no plain one to read against`);
    if (r.noMark) bad.push(`${t}: ${r.noMark} frames of a tell with no mark over it`);
  }
  if (!page.archer.waitFrames) bad.push('the archer never waited on the ring - nothing to measure');
  else if (page.archer.meanD < 90) bad.push(`the waiting archer held ${page.archer.meanD} px off on average: at a sword's reach, not bow range`);
  if (!page.shield.turns.length) bad.push('the shield was never caught waiting and facing the hero - nothing to measure');
  for (const t of page.shield.turns) { if (t < 0.6) bad.push(`the waiting shield brought its shield round in ${t} s: faster than its own turn`); if (t >= 2) bad.push('the waiting shield never turned to face the hero behind it'); }
}
assert.deepEqual(bad, [], 'foe tactics:\n  ' + bad.join('\n  '));
console.log('held wind-ups: ' + Object.entries(page.held).map(([t, r]) => `${t} ${r.lens.filter(v => v >= Math.min(...r.lens) + 0.25).length} of ${r.lens.length} held`).join(', ') +
  `; the waiting archer ${page.archer.meanD} px off; the waiting shield turns in ${page.shield.turns.join(', ')} s`);
