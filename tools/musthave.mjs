// tools/musthave.mjs — WHAT YOU NEED, WITH NOTHING LEFT ALIVE TO BOUNCE OFF.
// A ledge a hero can only reach by pogoing off a wasp is fine for a coin: kill the wasp and you lose a coin. It is a dead
// run for a KEY, a quest stray, a lever that opens the way, or the way to the end - kill the wasp first and the level can
// no longer be finished. This fills the reach with every ride and machine but NO creatures, and asks each of those.
//   node tools/musthave.mjs            every level, failures only
//   node tools/musthave.mjs <id> -v    one level, every item
import { LEVELS, T } from '../src/level.js';
import { floodReach } from '../src/reachcore.js';

const TS = 16, want = process.argv[2] && !process.argv[2].startsWith('-') ? process.argv[2] : null, verbose = process.argv.includes('-v');
const JUMP_PX = 49;
/* pickup or strike box from the hero's feet: dx sideways, up above the feet, down below them */
const BOX = { key: { dx: 15, up: 28, down: 16 }, stray: { dx: 15, up: 22, down: 22 }, strike: { dx: 30, up: 30, down: 8 } };
const STRIKE = new Set(['lever', 'crank', 'winch', 'sluice', 'capstan', 'pump', 'firebox', 'sheet']);
let bad = 0;
for (const lv of LEVELS) {
  if (lv.hidden && !lv.secret) continue;
  if (want && lv.id !== want) continue;
  let L; try { L = lv.build(); } catch (e) { console.log('== ' + lv.id + ': build failed ' + e.message); bad++; continue; }
  const W = L.W;
  const { seen, footing: tf } = floodReach(L, T, { rides: true, noFoes: !process.argv.includes('--with-foes') });   /* --with-foes: the same fill with the wasps left in, to tell a creature-only ledge from a gap in the model */
  /* only footing the fill actually reaches counts: the question is the route, not whether some ground exists */
  const reach = new Set([...tf].filter(k => seen.has(k)));
  for (const e of (L.ents || [])) if (e.t === 'mover') for (let i = 0; i <= (e.vert ? (e.rise || e.range || 4) : (e.range || 0)); i++) for (let w = 0; w < (e.len || 2); w++) {
    const k = e.vert ? (e.x + w) + ',' + (e.y - i - 1) : (e.x + i + w) + ',' + (e.y - 1);
    const k0 = e.vert ? (e.x + w) + ',' + (e.y - 1) : (e.x + w) + ',' + (e.y - 1);
    if (seen.has(k0) || seen.has(k)) reach.add(k); }
  const rows = [];
  const canGet = (ix, iy, B) => { for (const k of reach) { const [x, y] = k.split(',').map(Number); if (Math.abs(x - ix / TS) > 5 || y < iy / TS - 3 || y > iy / TS + 6) continue;
      const px = x * TS + 8, feet = (y + 1) * TS, above = iy < feet; if (Math.abs(px - ix) > (above ? 3 * TS + B.dx : B.dx + 8)) continue;
      if (iy >= feet - JUMP_PX - B.up && iy <= feet + B.down) return k; } return null; };
  for (const e of L.ents) {
    let kind = null, B = null;
    if (e.t === 'key') { kind = 'key'; B = BOX.key; }
    else if (e.t === 'stray' && !['sheep', 'fisher', 'folk'].includes(e.kind)) { kind = 'stray:' + (e.kind || ''); B = BOX.stray; }
    else if (STRIKE.has(e.t)) { kind = e.t; B = BOX.strike; }
    if (!kind) continue;
    const ix = e.x * TS + 8, iy = e.y * TS + TS;
    rows.push({ kind, at: e.x + ',' + e.y, from: canGet(ix, iy, B) });
  }
  /* THE END: the boss arena's trigger if there is one, else any reached footing in the last twelve columns */
  const A = L.arena; let endOk;
  if (A) { const tx = Math.floor((A.trigger || A.x0) / TS); endOk = [...reach].some(k => { const x = +k.split(',')[0]; return x >= tx - 1 && x <= Math.floor(A.x1 / TS); }); rows.push({ kind: 'the arena', at: tx + '', from: endOk ? 'reached' : null }); }
  else { endOk = [...reach].some(k => +k.split(',')[0] >= W - 12); rows.push({ kind: 'the far end', at: (W - 12) + '+', from: endOk ? 'reached' : null }); }
  const fails = rows.filter(r => !r.from);
  for (const r of fails) { bad++; console.log('== ' + lv.id + ': ' + r.kind + ' at ' + r.at + ' - NOT REACHED WITHOUT BOUNCING OFF A CREATURE'); }
  if (verbose) for (const r of rows) console.log('  ' + r.kind.padEnd(16) + r.at.padEnd(9) + (r.from ? 'from ' + r.from : 'NOT REACHED'));
}
console.log(bad ? '\n' + bad + ' needed thing(s) out of reach once the creatures are dead.' : '\neverything a level needs is in reach with nothing to bounce off.');
process.exitCode = bad ? 1 : 0;
