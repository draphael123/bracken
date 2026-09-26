// tools/check.mjs — ONE COMMAND BEFORE EVERY COMMIT: npm run check
// Every audit that answers yes or no, in one pass, with one exit code. A convention nothing checks is a wish; a
// check nobody remembers to run is the same wish with extra steps.
//   syntax    every source file parses
//   tells     every ! and !! agrees with the blow behind it
//   comments  no code swallowed by a // comment
//   homepaths no tool defaults a path into somebody's home directory: green on one machine is not green
//   dangling-paths every repo path a document or a comment cites is one a FRESH CLONE can open - asked of git and
//             not of the disk, because a file that is present here and ignored is absent everywhere else
//   shop-gates every store lock and hero unlock names a real LEVEL ID: a gate on anything else never opens, and
//             the shop tells the player to go and clear a place that does not exist
//   occluders what crosses the lens is the place's own (no forest tree in a village or a desert) and never drawn indoors
//   swim-shrines a swimmer lights the shrines the main route swims over, as a walker lights the ones it passes
//   ground-depth the ground is shaded from the shallowest surface near it: no dark stripe down from every raised step
//   gob-priest the goblin priest's rite, censer and bell each fire when forced, each told, and every priest has a flock
//   architecture nothing a level says was BUILT (laid stone, a wall face, a post, a house) stands on nothing: a load path from
//             the bottom up, a lintel carries four tiles, an arch stands on its two springings (tools/architecture.mjs)
//   floaters  no prop standing on nothing
//   audit     signs, NPCs and ledges on ground; no one-way ledge no jump can reach
//   content   the gaps that fail silently (sprites, tables, names)
//   talents   every talent node is read somewhere
//   traps     you can always get back out
//   signs     no sign longer than two lines on the reading panel
//   killzones no reachable tile kills a hero who stands on it
//   collectables every silver, key, relic and quest item can be picked up from some ground
//   keys      every key comes before the gate it opens: each lock gate is rock until its key has been reached
//   ambush-reach every captain an ambush makes you kill can be reached from where the room shuts you in (stake walls and gates are rock)
//   elites    every elite can be reached, and every gate it holds is reached with it shut and really holds the route
//   spawns    no creature starts inside the rock, no eel, angler or urchin starts out of the water
//   pixels    (headless) no sprite floats, hangs from nothing or runs through a ledge, by its own pixels; no water
//             creature leaves its water over a tide (src/floatlab.js)
//   deadends  every dead end pays: loot, a heart or a coin cache at the far end of every pocket (land, water, up high)
//   textfit   (headless) no text runs past its plate or off the screen, is cut, clipped, smeared, overprinted or laid over the hero,
//             and no meter is drawn across a word (every boss plate is drawn in its fight: 'plates')
//   rafts     an empty raft returns slowly, keeps its toll and passengers, and can cross again
//   bells     every signed bell is live: a sentry runs for it, it drops its hall's gate (never on a lock gate), turns out the watch, and the gate lifts
//   arena-supplies a fight written for height is fought in a room that has some: every boss attack that only lands
//             within N px of the floor has ground in its own arena to stand above (A12)
//   burial-geometry the lower crypt and the Bone Stairs climb are the only ways on; pits poison; vents hurt only when puffing
//   undercrown-variety the Glitter Vein (crystal that breaks and grows back) and the Goblin Barrow are on the route; the Prince is a goblin
//   one-dodge the double tap and V are ONE dodge: its grace, its way, one cost, once in the air, the dash attack out of it
//   checkpoint-gaps no level walks more than 150 route tiles between checkpoints, measured along the route you walk (B6); the
//             filler keys a tall level on its rows and a switchback hid 162 tiles from it
//   hanging-hoist THE HANGING VILLAGE's machine: every hoist's well on the far side of its deck from its loads, its rules run, and the
//             Owl Reeve cuts the crown's rope once, told and fair, in phase two only (docs/briefs/hanging-village-rework.md)
//   moor-gusts GALE MOOR's wind is a mechanic: every gust told, one rhythm for the ones that shove, a ride wider than a jump and
//             inside its carry, a headwind crossing of stones to brace on, taught over the bog first (docs/briefs/gale-moor-rework.md)
//   bandits  THE SUNKEN CARAVAN's three bandits (Node): every told blow fires, the feint is told and throws nothing, the slingstone
//             lands on the spot it marked, the ambusher is harmless and untouchable buried, and each one is wired (docs/briefs/caravan-ruins-bandits.md)
//   dune-worm THE DUNE WORM in the page: his four tells forced and landed, the breach true to its spot, the storm his and phase two's,
//             the sun in his hollow, the gate after his death (docs/briefs/dune-worm.md)
//   spore-caps (headless) SPOREWOOD's rule in the page: the root step, the leaning cap, the dripping stair, the Gills' sprout and her jam
//   deep-rework THE DEEP: each depth's holds their own room, every deck on a strake, the tribute ship's hot hatches and their stones, the
//             knights by the ways down, the Bell Grave's hung racks, and a Diving Bell that opens only to a stone on his crown (docs/briefs/deep-rework-2.md)
//   longwater-river THE LONG WATER is a river to Saltreach: nothing of the sea in its fresh water, the Bore told before it is met and
//             a stone near every dry tile it runs over, the first swim pool empty, one thing to a rock, checkpoints 40-100 apart
//   deep-descent (headless) THE DEEP played down with the real keys, no god mode, knight and warden: every throat, and the tribute ship's
//             three hot hatches carried down with a stone, to the Glowing Drop (Daniel, 2026-09-25: "there is no way down")
//   knight-rework the perfect guard opens a heavy riposte, the third cut pays for where it throws, and holding the shield costs (docs/briefs/knight-rework.md)
// The labs (fight and boss) need the page: run BK.bossLab() in the browser after a combat change.
import { execSync, spawnSync } from 'child_process';
import { readdirSync, statSync } from 'fs';
import { join } from 'path';
import { fileURLToPath } from 'url';

import { portFor, newRunTag } from './ports.mjs';
const ROOT = fileURLToPath(new URL('..', import.meta.url));   /* not .pathname: a space in the folder name arrives as %20 */
/* A SUBSET, FOR THE BUILD LOOP. `npm run check` with no arguments is the GATE and is unchanged - all of it, and the
   only thing that may be called green. `npm run check -- tower,tome,elites` runs just the checks whose names contain
   one of those, which is seconds instead of half an hour, so a batch can be checked three times while it is being
   written instead of once when it is finished. A subset PRINTS THAT IT IS ONE, every time, and never says the suite
   passed: "8 of 101" is not a pass, and the difference between those two is the whole reason the gate exists. */
const WANT = process.argv.slice(2).flatMap(a => a.split(',')).map(x => x.trim()).filter(Boolean);
const SUBSET = WANT.length > 0, wanted = name => !SUBSET || WANT.some(w => name.includes(w));
let skipped = 0; const take = name => { const y = wanted(name); if (!y) skipped++; return y; };
const run = (name, cmd, args, env) => {
  const t0 = Date.now(), r = spawnSync(cmd, args, { cwd: ROOT, encoding: 'utf8', env: env ? { ...process.env, ...env } : process.env });
  const out = ((r.stdout || '') + (r.stderr || '')).trim().split('\n');
  return { name, ok: r.status === 0, ms: Date.now() - t0, last: out[out.length - 1] || '', out };
};
const files = [];
const walk = d => { for (const f of readdirSync(join(ROOT, d))) { const p = join(d, f); if (statSync(join(ROOT, p)).isDirectory()) walk(p); else if (/\.(m?js)$/.test(f)) files.push(p); } };
walk('src'); walk('tools');
/* ON A SUBSET, SYNTAX-CHECK ONLY WHAT CHANGED. The sweep spawns `node --check` once per file, and across ~150 files
   that was 55 of the 60 seconds a two-check subset took - the checks themselves were four and a half. The FULL run
   still parses everything, because that is the gate; a subset parses what git says you touched. */
if (SUBSET) { const ch = spawnSync('git', ['status', '--porcelain'], { cwd: ROOT, encoding: 'utf8' });
  const norm = f => f.replace(/\\/g, '/');
  const touched = new Set((ch.stdout || '').split(String.fromCharCode(10)).map(l => norm(l.slice(3).trim())).filter(f => /\.(js|mjs)$/.test(f)));
  for (let i = files.length - 1; i >= 0; i--) if (!touched.has(norm(files[i]))) files.splice(i, 1); }

const results = [];
/* THE TEMP FOLDER, before and after: abandoned BRACKEN browser profiles (idle 30 min, no live process on them) go first, and at
   the end anything THIS run made and did not take away again is a leak and fails the suite (tools/profile-sweep.mjs) */
/* THIS RUN'S OWN TAG. Children inherit it, browser-profile.mjs writes it into every profile directory name, and the
   leak check below counts only profiles wearing it - so another session's crashed browser can no longer be reported
   as this run's leak, which is exactly the false red that threw away a full run on 2026-09-22. */
process.env.BRACKEN_RUN = process.env.BRACKEN_RUN || newRunTag();
const SUITE_T0 = Date.now(); run('profile-sweep', process.execPath, ['tools/profile-sweep.mjs', '--kill-orphans']);
{ const bad = files.map(f => [f, spawnSync(process.execPath, ['--check', f], { cwd: ROOT, encoding: 'utf8' })]).filter(([, r]) => r.status !== 0);
  results.push({ name: 'syntax', ok: !bad.length, ms: 0, last: bad.length ? bad.map(([f]) => f).join(', ') : files.length + ' files parse', out: bad.map(([f, r]) => f + ': ' + r.stderr) }); }
for (const t of ['tells', 'hero-trials', 'ore-road', 'ore-ride', 'scree-rework', 'village-stakes', 'comments', 'homepaths', 'dangling-paths', 'shop-gates', 'floaters', 'audit', 'content-audit', 'talents', 'progression', 'progression-runtime', 'skill-menu', 'skill-passives', 'skill-balance-probe', 'starter-kits', 'reaper-input', 'traps', 'signs', 'killzones', 'collectables', 'keys', 'elites', 'spawns', 'deadends', 'rafts', 'raft-call', 'render-layers', 'room-patterns', 'heat', 'queen-comb', 'crown-route', 'crown-requests', 'gallery-runtime', 'waterfall-joins', 'paladin-enrage', 'spurs-runtime', 'map-grammar', 'checkpoints', 'additional-areas', 'additional-areas-runtime', 'keep', 'keep-runtime', 'keep-expansion', 'keep-passages', 'keep-expansion-runtime', 'storm-ship', 'storm-ship-runtime', 'haunted-coast', 'haunted-coast-runtime', 'tide-reaver', 'tome', 'false-abbot', 'tower-ascent', 'archmage-room', 'skins', 'threat-holes', 'one-new-foe', 'folly-runtime', 'deadly-water', 'burning-village', 'witchlight', 'sea-requests', 'sea-runtime', 'shop-theme', 'store-preview', 'dressing', 'runtime-footing', 'bridge-props', 'light-support', 'readability', 'town-live', 'waymeet-cleanup', 'owl-lamps', 'belfry', 'moor-wind', 'watchtowers', 'spore-loop', 'mother-cap', 'mother-pilot', 'salvage-captain', 'harbor-expansion', 'harbor-route', 'buried-dead', 'burial-route', 'burial-geometry', 'burial-rework', 'undercrown-variety', 'boss-openings', 'arena-supplies', 'undead-foes', 'buried-attacks', 'combat-feel', 'attack-animation', 'attack-buffer', 'normal-health', 'ambush-single', 'reed-island', 'lab-clock', 'combat-replay', 'combat-results-test', 'king-refill', 'pilot-actions', 'pyre-pilot', 'herald-pirate', 'boss-navigation', 'cdp-recovery', 'swim-chain', 'temperer', 'unburied', 'unburied-fights', 'ability-poses', 'knight-rework', 'levelling', 'levelling-runtime', 'boss-fight-end', 'geomancer', 'burial-variety', 'buried-dead-art', 'mini-names', 'slopes', 'one-dodge', 'queen-chandelier', 'ambush-reach', 'small-adds', 'occluders', 'swim-shrines', 'ground-depth', 'hanging-hoist', 'checkpoint-gaps', 'dune-worm', 'architecture', 'gob-priest', 'ore-work', 'spore-caps', 'bells', 'moor-gusts', 'tower-collapse', 'sexton', 'lance-support', 'footing-art', 'queen-pillars', 'reefmaw-land', 'reefmaw-art', 'reef-hulk', 'drowned-knights', 'whirlpools', 'keep-rework', 'deep-rework', 'deep-descent', 'longwater-river', 'bandits', 'class-spurs', 'mini-walls', 'checkpoint-stand', 'tower-cutouts', 'archmage-rings', 'uphill', 'desert-ledge-art']) if (take(t)) results.push(run(t, process.execPath, ['tools/' + t + '.mjs']));
/* THE PIXELS NEED THE PAGE: a headless Chrome on a port of its own, so a dev server left running from another checkout is never the one measured */
if (take('pixels')) results.push(run('pixels', process.execPath, ['tools/headless.mjs', 'floats'], { PORT: String(portFor(3)) }));
/* THE SLOPES SWAP, PROVED IN THE PAGE (docs/slopes-integration.md §8.3). tools/slopes.mjs above proves the two movers equal in Node;
   this one drives the real knight over four shipped levels and compares every frame with the trace recorded before the swap. It is the
   check standing between the slopes work and the thirty levels that ship on the old mover, so it runs in the suite, not by hand. */
if (take('slopes-trace')) results.push(run('slopes-trace', process.execPath, ['tools/slopes-trace.mjs'], { PORT: String(portFor(7)) }));
/* THE WORDS FIT: every hint, the bestiary, the store, the talent trees, the pause menu and every hero's HUD, drawn and measured (tools/textfit.mjs;
   the talk pages of every level and the boss fights are the long run: node tools/textfit.mjs --strict) */
if (take('textfit')) results.push(run('textfit', process.execPath, ['tools/textfit.mjs', 'hints,bestiary,store,tree,menu,hud,pick,practice,plates', '--strict'], { PORT: String(portFor(4)) }));
if (!SUBSET) results.push(run('profile-cleanup', process.execPath, ['tools/profile-cleanup.mjs']));   /* every way a tool can end leaves nothing in Temp */   /* the full run only: a subset did not make the mess and must not be failed by it */
if (!SUBSET) results.push(run('profile-leaks', process.execPath, ['tools/profile-sweep.mjs', '--kill-orphans', '--since', String(SUITE_T0), '--run', process.env.BRACKEN_RUN, '--check']));

let failed = 0;
for (const r of results) { if (!r.ok) failed++; console.log((r.ok ? ' ok  ' : 'FAIL ') + r.name.padEnd(14) + String(r.ms).padStart(6) + 'ms  ' + r.last.slice(0, 110)); }
for (const r of results) if (!r.ok) { console.log('\n---- ' + r.name + ' ----'); console.log(r.out.slice(-30).join('\n')); }
console.log(failed ? '\n' + failed + ' check(s) failed.'
  : SUBSET ? '\n' + results.length + ' of ' + (results.length + skipped) + ' checks pass - A SUBSET (' + WANT.join(', ') + '), NOT THE SUITE.'
      + '\nRun `npm run check` with no arguments before a commit that matters, and before any deploy.'
  : '\nall checks pass.');
process.exitCode = failed ? 1 : 0;



