/* tools/foe-tempo.mjs - TIGHTER, STILL TOLD (claude/combat3, the combat pass; Daniel 2026-10-01, src/foe-tempo.js).
   Each common foe is set down alone beside a hero standing still (god mode, so it keeps attacking) on the Stockade's flat floor for
   ten seconds, and every windup it throws is timed (BK.telling, the frames the mark is up), first with the tempo OFF and then ON.
     node tools/foe-tempo.mjs            the check: every kind|mode in TIGHT tells for TEMPO.tell of its old length (or TEMPO.tellFloor,
                                         never less), every windup ON still has its mark, and a kind|mode NOT in TIGHT is never shortened
     node tools/foe-tempo.mjs --probe    tighten EVERY granted windup (TEMPO.probeAll) and list the kind|modes that came out at
                                         TEMPO.tell (+-0.07) of their old length: the ones whose tell counts down on e.modeT (TIGHT's source)
   Red on master 3fd06c78: no src/foe-tempo.js (BK.tempo undefined). */
import { openPage } from './cdp.mjs';
import { ANSWER, HARMLESS } from '../src/marks.js';
import { TEMPO, TIGHT } from '../src/foe-tempo.js';
import { OPEN_RULE, NO_OPENING, MINI_EVERY_BLOW } from '../src/boss-greed.js';

const PROBE = process.argv.includes('--probe'), ONLY = (process.argv.find(a => a.startsWith('--only=')) || '').slice(7);
const NOT_COMMON = new Set([...Object.keys(OPEN_RULE), ...Object.keys(NO_OPENING), ...MINI_EVERY_BLOW, 'master', 'troll', 'masthead', 'roc', 'suncatcher', 'deathknight', 'whelp', 'familiar', 'magechase']);
let kinds = [...new Set(Object.keys(ANSWER).map(k => k.split('|')[0]))].filter(t => t !== '*' && !HARMLESS.has(t) && !NOT_COMMON.has(t));
if (ONLY) kinds = kinds.filter(t => ONLY.split(',').includes(t));

const pg = await openPage({ audio: false, fonts: false });
let runs;
try {
  runs = await pg.evalp(`(async()=>{
    const { LEVELS } = await import('/src/level.js'), { mulberry } = await import('/src/px.js');
    BK.manualSimulation = true; BK.SET.speed = 1; BK.setHero('knight'); BK.load(LEVELS.findIndex(l => l.id === 'stockade')); BK.state = 'play'; BK.start(); BK.god = true;
    const L = BK.L, W = L.W, at = (x, y) => L.grid[y * W + x]; let spot = null;
    for (let x0 = Math.floor(BK.P.x / 16); x0 < W - 30 && !spot; x0++) for (let y = 7; y < L.H - 2 && !spot; y++) {
      let ok = true; for (let x = x0; x < x0 + 26 && ok; x++) ok = at(x, y + 1) === 1 && [0, 1, 2, 3, 4, 5, 6].every(k => at(x, y - k) === 0); if (ok) spot = [x0 + 9, y]; }
    if (!spot) return { err: 'no flat floor' };
    const time1 = (t, on) => { const real = Math.random; Math.random = mulberry(t.split('').reduce((h, c) => (h * 31 + c.charCodeAt(0)) >>> 0, 7));
      const RXO = BK.tokens().RX; try { BK.tempo.on = on; BK.tempo.probeAll = ${PROBE} && on; if (RXO) RXO.REACT.on = false;   /* (claude/combat2) TEMPO ALONE: the varied held / quick / feinted swings of src/foe-react.js are timed by tools/combat-part2.mjs, not here */
        for (const e of BK.enemies()) e.alive = false; BK.tp(spot[0], spot[1]); BK.sim(60);
        const [f] = BK.spawnFoe({ t, x: spot[0] + 3, y: spot[1], face: -1 }); if (!f) return { err: 'did not spawn' };
        if (f.maxHp || f.mini || f.xpRole) { f.alive = false; return { skip: 'not common' }; }
        const by = {}; let was = false, n0 = 0, mode = null, unmarked = 0;
        for (let k = 0; k < 600; k++) { BK.P.hp = BK.P.maxHp; BK.P.x = spot[0] * 16 + 8; BK.P.vx = 0; BK.P.face = Math.sign(f.x - BK.P.x) || 1; BK.sim(1);
          const tel = f.alive && BK.telling(f);
          if (tel && !was) { n0 = k; mode = f.mode; if (!BK.markShown(f)) unmarked++; }
          if (!tel && was && mode) (by[t + '|' + mode] = by[t + '|' + mode] || []).push((k - n0) / 60);
          was = tel; }
        f.alive = false; return { by, unmarked };
      } finally { Math.random = real; BK.tempo.on = true; BK.tempo.probeAll = false; if (RXO) RXO.REACT.on = true; } };
    const out = {};
    for (const t of ${JSON.stringify(kinds)}) { try { out[t] = { off: time1(t, false), on: time1(t, true) }; } catch (err) { for (const e of BK.enemies()) e.alive = false; out[t] = { off: { err: 'needs its own level: ' + String(err.message).slice(0, 60) }, on: {} }; } }
    return out; })()`, 1800000);
} finally { pg.close(); }
if (runs.err) { console.log('foe-tempo: ' + runs.err); process.exit(1); }

/* THE SHORTEST of its windups: a foe-tactics HELD wind-up (src/foe-tactics.js TAC.HOLD) adds a random beat to some of them, so the plain
   tell is the shortest one thrown */
const med = a => (a.length ? Math.min(...a) : null);
const rows = [], bad = [], found = [];
for (const [t, r] of Object.entries(runs)) {
  if (r.off.err || r.off.skip) { rows.push(t + ': ' + (r.off.err || r.off.skip)); continue; }
  if (r.on.unmarked > r.off.unmarked) bad.push(t + ': ' + r.on.unmarked + ' windup(s) began with no mark over it with the tempo on, ' + r.off.unmarked + ' with it off');   /* (the tempo must never take a mark away; a mark that comes up a frame late is the foe's own, before and after) */
  for (const key of new Set([...Object.keys(r.off.by), ...Object.keys(r.on.by)])) {
    const a = med(r.off.by[key] || []), b = med(r.on.by[key] || []); if (a === null || b === null) { rows.push(key + ': off ' + a + ' / on ' + b + ' (too few to time)'); continue; }
    const ratio = b / a, want = Math.max(TEMPO.tellFloor, a * TEMPO.tell);
    rows.push(key + ': ' + a.toFixed(2) + ' s -> ' + b.toFixed(2) + ' s (x' + ratio.toFixed(2) + ', n ' + (r.off.by[key] || []).length + '/' + (r.on.by[key] || []).length + ')');
    if (PROBE) { if (a > TEMPO.tellFloor + 0.02 && Math.abs(b - want) <= Math.max(0.07 * a, 2 / 60)) found.push(key); continue; }
    if (b < Math.min(a, TEMPO.tellFloor) - 1.5 / 60) bad.push(key + ': its tell came out at ' + b.toFixed(2) + ' s, under the floor ' + TEMPO.tellFloor + ' (was ' + a.toFixed(2) + ')');
    if (TIGHT.has(key) && Math.abs(b - want) > Math.max(0.07 * a, 2 / 60)) bad.push(key + ': in TIGHT, but its tell went ' + a.toFixed(2) + ' -> ' + b.toFixed(2) + ' s (want ' + want.toFixed(2) + ')');
    if (!TIGHT.has(key) && b < a - Math.max(0.07 * a, 2 / 60)) bad.push(key + ': NOT in TIGHT, but its tell was shortened ' + a.toFixed(2) + ' -> ' + b.toFixed(2) + ' s');
  }
}
console.log(rows.join('\n'));
if (PROBE) { console.log('\nTIGHT candidates (' + found.length + '):\n' + JSON.stringify(found.sort())); process.exit(0); }
const missing = [...TIGHT].filter(k => !rows.some(r => r.startsWith(k + ':')));
if (missing.length) console.log('(not thrown in ten seconds on the flat, so not timed: ' + missing.join(', ') + ')');
if (bad.length) { console.log('foe-tempo: ' + bad.length + ' FAIL\n  ' + bad.join('\n  ')); process.exit(1); }
console.log('foe-tempo: ' + TIGHT.size + ' tightened windups tell for x' + TEMPO.tell + ' (floor ' + TEMPO.tellFloor + ' s), every one still marked; nothing else shortened');
