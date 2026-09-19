// tools/check.mjs — ONE COMMAND BEFORE EVERY COMMIT: npm run check
// Every audit that answers yes or no, in one pass, with one exit code. A convention nothing checks is a wish; a
// check nobody remembers to run is the same wish with extra steps.
//   syntax    every source file parses
//   tells     every ! and !! agrees with the blow behind it
//   comments  no code swallowed by a // comment
//   floaters  no prop standing on nothing
//   audit     signs, NPCs and ledges on ground; no one-way ledge no jump can reach
//   content   the gaps that fail silently (sprites, tables, names)
//   talents   every talent node is read somewhere
//   traps     you can always get back out
//   signs     no sign longer than two lines on the reading panel
//   killzones no reachable tile kills a hero who stands on it
//   collectables every silver, key, relic and quest item can be picked up from some ground
//   keys      every key comes before the gate it opens: each lock gate is rock until its key has been reached
//   elites    every elite can be reached, and every gate it holds is reached with it shut and really holds the route
//   spawns    no creature starts inside the rock, no eel, angler or urchin starts out of the water
//   pixels    (headless) no sprite floats, hangs from nothing or runs through a ledge, by its own pixels; no water
//             creature leaves its water over a tide (src/floatlab.js)
//   deadends  every dead end pays: loot, a heart or a coin cache at the far end of every pocket (land, water, up high)
//   textfit   (headless) no text runs past its plate or off the screen, is cut, clipped, smeared, overprinted or laid over the hero
//   rafts     an empty raft returns slowly, keeps its toll and passengers, and can cross again
// The labs (fight and boss) need the page: run BK.bossLab() in the browser after a combat change.
import { execSync, spawnSync } from 'child_process';
import { readdirSync, statSync } from 'fs';
import { join } from 'path';
import { fileURLToPath } from 'url';

const ROOT = fileURLToPath(new URL('..', import.meta.url));   /* not .pathname: a space in the folder name arrives as %20 */
const run = (name, cmd, args, env) => {
  const t0 = Date.now(), r = spawnSync(cmd, args, { cwd: ROOT, encoding: 'utf8', env: env ? { ...process.env, ...env } : process.env });
  const out = ((r.stdout || '') + (r.stderr || '')).trim().split('\n');
  return { name, ok: r.status === 0, ms: Date.now() - t0, last: out[out.length - 1] || '', out };
};
const files = [];
const walk = d => { for (const f of readdirSync(join(ROOT, d))) { const p = join(d, f); if (statSync(join(ROOT, p)).isDirectory()) walk(p); else if (/\.(m?js)$/.test(f)) files.push(p); } };
walk('src'); walk('tools');

const results = [];
{ const bad = files.map(f => [f, spawnSync(process.execPath, ['--check', f], { cwd: ROOT, encoding: 'utf8' })]).filter(([, r]) => r.status !== 0);
  results.push({ name: 'syntax', ok: !bad.length, ms: 0, last: bad.length ? bad.map(([f]) => f).join(', ') : files.length + ' files parse', out: bad.map(([f, r]) => f + ': ' + r.stderr) }); }
for (const t of ['tells', 'comments', 'floaters', 'audit', 'content-audit', 'talents', 'traps', 'signs', 'killzones', 'collectables', 'keys', 'elites', 'spawns', 'deadends', 'rafts', 'render-layers', 'room-patterns', 'heat', 'queen-comb', 'crown-requests', 'dressing', 'runtime-footing', 'bridge-props', 'light-support', 'readability', 'town-live', 'owl-lamps', 'belfry', 'moor-wind', 'watchtowers', 'spore-loop', 'combat-feel', 'ambush-single']) results.push(run(t, process.execPath, ['tools/' + t + '.mjs']));
/* THE PIXELS NEED THE PAGE: a headless Chrome on a port of its own, so a dev server left running from another checkout is never the one measured */
results.push(run('pixels', process.execPath, ['tools/headless.mjs', 'floats'], { PORT: '5993' }));
/* THE WORDS FIT: every hint, the bestiary, the store, the talent trees, the pause menu and every hero's HUD, drawn and measured (tools/textfit.mjs;
   the talk pages of every level and the boss fights are the long run: node tools/textfit.mjs --strict) */
results.push(run('textfit', process.execPath, ['tools/textfit.mjs', 'hints,bestiary,store,tree,menu,hud', '--strict'], { PORT: '5994' }));

let failed = 0;
for (const r of results) { if (!r.ok) failed++; console.log((r.ok ? ' ok  ' : 'FAIL ') + r.name.padEnd(14) + String(r.ms).padStart(6) + 'ms  ' + r.last.slice(0, 110)); }
for (const r of results) if (!r.ok) { console.log('\n---- ' + r.name + ' ----'); console.log(r.out.slice(-30).join('\n')); }
console.log(failed ? '\n' + failed + ' check(s) failed.' : '\nall checks pass.');
process.exitCode = failed ? 1 : 0;
