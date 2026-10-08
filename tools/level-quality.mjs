/* tools/level-quality.mjs - THE QUALITY BAR A LEVEL MUST CLEAR (claude/levelq, 2026-09-30).
   Why: Daniel called the Harvest Fair "a prototype - just walk right" and it had passed ~20 checks. Every check asked whether a promise
   was kept; none asked whether the level was any good. This measures the DATA of a level against THE MAGE'S FOLLY, his benchmark.
     node tools/level-quality.mjs                 the gated levels (GATE below): fails if one misses the bar; a listed id that is not built yet is skipped, with a note
     node tools/level-quality.mjs <id> [<id>..]   just those levels (any id, gated or not), full detail
     node tools/level-quality.mjs --all           a REPORT of every campaign level as a table (exit 0: old levels that miss the bar are information, not failures)
   docs/LEVEL-QUALITY.md says what each number means and why the limit is where it is. Everything is read from the built level (grid, ents,
   moversExtra, arrays) and its walked main route (tools/pacing.mjs): no browser, ~10 s for the whole campaign. */
import { existsSync, readFileSync } from 'node:fs';
import { createHash } from 'node:crypto';
import { fileURLToPath } from 'node:url';
import { SLOPE, SLOPE_NAMES, heightAt } from '../src/slopes.js';
import { bakeSandSlopes } from '../src/redraw/slopes.js';
import { install } from './node-canvas.mjs';
import { LEVELS, T } from '../src/level.js';
import { THREAT } from '../src/threat.js';
import { floodReach } from '../src/reachcore.js';
import { pacing } from './pacing.mjs';
import { BOSS_SYNTH_BASE, splitTrack } from '../src/boss-music.js';
import { clearsAt, MASH_HELD } from './mash-rows.mjs';
import { ruleFights, curveVerdict, CURVE_REPORT_ONLY } from './rule-state.mjs';
/* (claude/combat2) REPORT-ONLY FOR EVERY LEVEL: the combat pass part 2's level-side rows - fights during the rule, and the level-1 curve by act
   (tools/rule-fights.mjs). Printed (WARN) and listed by node tools/rule-fights.mjs; never failing the gate until Daniel lifts them. */
export const REPORT_ALL = ['ruleFight'];   /* (the curve row is per level: tools/rule-state.mjs CURVE_REPORT_ONLY, the list the level sweep shrinks) */
install();
const TS = 16;

/* WHICH LEVELS ARE HELD TO IT. New or reworked levels only: the old campaign misses the bar in places (--all shows where) and is not being reworked.
   Add a level id here in the lane that builds or reworks it. An id that is not in LEVELS yet is skipped with a note (the theatre lane lands later). */
export const GATE = ['theatre', 'fair', 'canal', 'welltown', 'redgorge', 'underwell', 'skyroad', 'glasssea', 'ksar', 'church'];   /* (claude/litchurch: THE LIT CHURCH gated from its greybox) */   /* (claude/ksar: THE BANDIT KSAR gated from its greybox) */   /* (claude/skyroad: THE SKY ROAD gated from its greybox) */   /* the fair re-gated by claude/fairfix2 (the rework it waited for); THE FOG CANAL gated by claude/canalfix */
/* A MEASURE THAT IS REPORT-ONLY FOR ONE LEVEL: { levelId: ['measure', ..] }. It is still printed (WARN) and counted in --all, but does not fail the gate.
   Daniel decides when it is lifted; each row carries the TODO and the reason. */
export const REPORT_ONLY = {
  /* (claude/theatre3: the theatre's roles row is lifted - THE PROMPTER, the goblin priest reskinned, is its support; THE FLYMAN, the archer reskinned, throws) */
  skyroad: ['music'],   /* (claude/skyroad, the greybox) TODO: THE SKY ROAD plays the retired sky ship's track and THE ROC her old track (the Monastery's arena still plays it) as placeholders - Daniel picks the level's own CC0/CC-BY track (no download until he says yes) */
};
/* Tracks two levels may share on purpose (none today: every campaign level has its own). Trial rooms and shops are not compared. */
export const SHARED_MUSIC = [];
/* STOCK TRACKS: a tune that is in audio/ but was not written for any level - a stand-in. A level that plays one has borrowed its music as surely as one that plays a
   neighbour's (claude/fairfix, Daniel 2026-09-30: the fair's music passed this lint on 'marketday', a stock market tune, and a boss arena on another boss's track) */
/* THE BOSS POOL: the generic boss tracks many arenas share by design (a boss room may play one; it may not play another boss's OWN track, as the fair's green once played the Houndmaster's) */
export const BOSS_POOL = ['boss', 'boss2', 'boss3', 'boss4'];
export const STOCK_MUSIC = { marketday: 'a stock CC0 market tune (RandomMind "Market Day"): the stand-in the fair wore before it had its own band organ' };

/* THE LIMITS. Each is set so THE MAGE'S FOLLY clears it with margin and the Harvest Fair (the old 672-column corridor) does not; the Folly's number is in the comment. */
export const LIM = {
  longRun: 20,          /* a flat run this long counts toward the flat SHARE below */
  chasm: 5,             /* a gap wider than this (columns: more than a jump) ends a flat run where the floor ends; a narrower one is a pit the run jumps (claude/skyroad, ratified 10-05) */
  flatShareMax: 0.30,   /* share of the route columns that lie in long runs that are flat AND empty: no jump, gap, hazard, foe or gadget (Folly 0.11) */
  terrainShareMax: 0.60, /* the same ignoring foes: level ground with nothing but enemies on it (Folly 0.33) */
  routeBands: 5,        /* distinct 4-row height bands the walked route uses (Folly 8) */
  multiHeightShare: 0.40, /* share of the columns that offer footing in more than one band (Folly 0.61) */
  gadgetKinds: 5,       /* level-specific gadget kinds (Folly 12) */
  gadgetDeveloped: 3,   /* ... of which appear in 3+ separate places, a place being a cluster of columns 12 apart (Folly 4) */
  secrets: 2,           /* silvers / relics off the route (Folly 3) */
  checksMin: 2,         /* checkpoints; the max is a spacing (below), not a count: a 700-column level cannot keep 4 */
  checkSpacing: 90,     /* route tiles per checkpoint at least (Folly 103): fewer, further apart, as Daniel wants */
  densityLo: 0.8, densityHi: 2.5,   /* DESIGNED ENCOUNTERS a screen (24 columns), not bodies (claude/fairfix): the Folly reads 1.03; the campaign's walking levels 0.68-1.56; THE MASKWRIGHT'S THEATRE (gated, built and merged under the old bodies bar at 2.7 foes a screen) reads 2.13, so the ceiling is 2.5 (claude/fairfix2) */
  clump: 8,             /* foes that are not a squad or an elite and stand within this many columns of each other are ONE encounter */
  emptyShareMax: 0.30,  /* share of the screens with no foe at all (Folly 0.23) */
  section: 200,         /* a designed encounter in every stretch of this many columns */
  branches: 2,          /* dead-end pockets / branches off the route (Folly 5) */
  pilotHits: 2,         /* a fresh level-1 hero with no abilities, walked by the pilot bot with no god mode, takes at least this many blows over 3 runs summed (tools/level1-pilot.mjs). A FLOOR, NOT A TARGET: the bot cannot work the Folly's runes and is lifted ~48 times a run, so the Folly reads only a few; a level that costs the bot nothing is a walk */
  roles: 3,             /* distinct foe roles (melee, ranged, support, heavy, runner) among the level's foes and ambush waves */
  routeSpan: 8,         /* OR the walked route climbs/drops this many rows, or doubles back this many tiles (Folly 30 rows) */
};

/* FOE ROLES. The game has no role field on a foe, so the roles are named here, by what the foe DOES to you; a foe not listed is MELEE. Keep the lists to kinds whose AI
   was read (a thrown or shot attack; a bomb or net; a heal/horn/banner/snuff; plate or a big swing; a fast chase or a grab). Add a kind when a lane builds one. */
export const ROLES = {
  ranged: ['archer', 'crossbow', 'javelin', 'spit', 'spitter', 'spitcap', 'thorn', 'shaman', 'stormshaman', 'bonearcher', 'slinger', 'scout', 'rockgoblin', 'netter', 'drunk', 'tippler', 'scalder', 'skybolt', 'catapult', 'towertop', 'pyromancer', 'apprentice', 'gobmage', 'undeadmage', 'seawitch', 'merrowcaller', 'priest', 'wickerman', 'wallslinger', 'smokethrower'],   /* (claude/fairfix6) THE WICKER MAN bowls its own fire */   /* (claude/ksar) the wall slinger's stones, the smoke thrower's pots */
  support: ['barker', 'gobpriest', 'bannerbearer', 'horn', 'snuffer', 'priest', 'acolyte', 'merrowcaller', 'bearer'],
  heavy: ['heavy', 'brute', 'troll', 'golem', 'merrowbrute', 'tideguard', 'hedgeknight', 'armour', 'bloodknight', 'berserker', 'drownedknight', 'bellguard', 'holdfast', 'gaffer', 'barrowrider', 'shield', 'wickerman', 'shieldsentry'],
  runner: ['hobbyhorse', 'runner', 'thief', 'hound', 'greathound', 'assassin', 'sapper', 'acolyte', 'dog', 'grindylow', 'waterthief', 'raptor', 'thirstscorpion', 'kiterider', 'skitter', 'gonglookout', 'hawkscout'],   /* (claude/ksar) the gong lookout runs for his gong; the hawk scout stoops and climbs away */   /* (claude/skyroad: the goblin kite-rider swoops from his thermal and climbs away - a hit and run) */   /* (claude/redgorge: the cliff raptor stoops on you from over its bridge and is gone again - a hit and run) (claude/welltown: the water-thief cuts your skin and RUNS for a well) (claude/canalfix: the grindylow is a grab - it comes for your ankle, and aboard) */
};
const rolesOf = (t, skin) => { const of = k => Object.keys(ROLES).filter(r => ROLES[r].includes(k)); const r = skin && of(skin).length ? of(skin) : of(t); return r.length ? r : ['melee']; };   /* (claude/underwell: a reskin listed by its own skin - the thirsty scorpion runs - is judged by what it does; an unlisted skin is its AI's) */
/* COLLECTIBLES AND INTERACTIVES THAT MUST UNLOCK SOMETHING. A pickup or a lever that opens nothing is clutter. What each kind can open is named here; a level states its own
   in L.unlocks = [{ kind, opens: 'gate'|'relic'|'shortcut'|'secret'|'lift'|.., hud: 'the line the HUD or a callout shows' }] (a collectible a level invents - a candle stub, a cog - goes
   there). The tool then asks: is every collectible kind in the level either known here or declared, and does an interactive have something in the level to work. */
export const COLLECT_KNOWN = { silver: 'a hero or upgrade in the shop (the HUD counts them)', relic: 'itself (a relic)', key: 'a lock gate', stray: 'a quest relic', pickup: 'a pickup', chest: 'its contents', heart: 'health', coin: 'the shop' };
const COLLECT_KINDS = new Set(['key', 'stray', 'quest', 'pickup', 'chest']);
const INTERACTIVE_KINDS = new Set(['lever', 'crank', 'winch', 'flatwinch', 'cuelever', 'capstan', 'pump', 'sluice', 'plate', 'pushblock', 'lockrune', 'rune', 'glyph', 'valve', 'siphon', 'pulley']);
const TARGET_ENTS = new Set(['lockgate', 'door', 'doorway', 'ringdoor', 'gate', 'bridge', 'cart', 'plank', 'lift', 'hoist', 'cage', 'dropcage', 'deadfall', 'felltree', 'mover', 'pad', 'sluice', 'cargowall', 'bulkhead', 'davit', 'flylock', 'stagetrap', 'startrap', 'timber', 'weight']);
const TARGET_ARRAYS = ['bridges', 'locks', 'hoists', 'risers', 'crumbles', 'glyphBridges', 'cableBridges', 'carousels', 'masts', 'pits', 'seams', 'sluices', 'stagetraps', 'flies'];
const GENERIC = new Set(['coin', 'deco', 'sign', 'check', 'silver', 'relic', 'stray', 'mend', 'torch', 'npc', 'guest', 'shop', 'shrine', 'gate', 'captive', 'folk', 'stal', 'web', 'quest', 'pickup', 'chest', 'heart', 'key']);
/* A GADGET is something the hero works or rides, not something that hits him: non-foe, non-generic ent kinds that are level-specific (used by <= 3 levels), the set-piece and
   platform kinds pacing.mjs recognises everywhere, moving platforms (moversExtra kinds), and the level's own machine arrays. */
const ALWAYS_GADGET = new Set(['mover', 'pad', 'vent', 'balloon', 'lever', 'crank', 'winch', 'sluice', 'capstan', 'pump', 'firebox', 'sheet', 'cannon', 'bell', 'seabell', 'lockgate', 'key', 'felltree', 'deadfall', 'ram', 'cart', 'plank', 'keg', 'loosegun', 'cargowall', 'bulkhead', 'davit', 'stormkite', 'resonance', 'mirror', 'weight', 'support', 'rod', 'boiler', 'roller', 'cage', 'plate', 'timber', 'sail', 'bridge', 'gas', 'tbell', 'pwheel']);
const SYSTEM_ARRAYS = ['gusts', 'hoists', 'crumbles', 'bridges', 'vines', 'perches', 'flips', 'glyphBridges', 'zipLines', 'ropes', 'cableBridges', 'thermals', 'airRails', 'roosts', 'winds', 'siphons', 'whirlpools', 'gasVents', 'locks', 'carousels', 'masts', 'risers', 'callers', 'pegs', 'seams', 'pits', 'cable', 'veins', 'quicksand', 'looseRock', 'heaps', 'emberPits', 'stillFires', 'beams', 'spiral', 'chases', 'rot', 'graves', 'candles'];
const MOVER_KINDS_SKIP = new Set(['lane']);   /* a lane is the track a platform runs on, not a second gadget */

/* a kind is a gadget when it is a known machine kind, reads like one (rune, lock, plate, glyph, lever...), or the threat table says it is worth ZERO (a thing that is not a foe) and few levels use it. A kind the table does not know is a foe. */
const GADGET_WORD = /rune|lock|plate|glyph|lever|switch|lift|hoist|winch|carousel|crank|valve|siphon|pulley|weight/;
const isGadget = t => ALWAYS_GADGET.has(t) || GADGET_WORD.test(t) || (t in THREAT && THREAT[t] === 0 && (kindUsers().get(t) || 0) <= 3);
const arena = L => L.arena || null;
const setSpan = (xs, gap = 12) => { xs = [...xs].sort((a, b) => a - b); let n = 0, last = -1e9; for (const x of xs) { if (x - last > gap) n++; last = x; } return n; };

/* LEVEL-SPECIFIC ENT KINDS: how many campaign levels place each kind, once, for the whole run */
const BUILT = new Map(); const built = d => { if (!BUILT.has(d.id)) BUILT.set(d.id, d.build()); return BUILT.get(d.id); };   /* every level is built once, not once per question asked of it */
let KIND_USERS = null;
function kindUsers() { if (KIND_USERS) return KIND_USERS; KIND_USERS = new Map();
  for (const d of LEVELS) { if (d.hidden && !d.secret) continue; let L; try { L = built(d); } catch { continue; } for (const k of new Set((L.ents || []).map(e => e.t))) KIND_USERS.set(k, (KIND_USERS.get(k) || 0) + 1); }
  return KIND_USERS; }

/* INVISIBLE SLOPES. A slope tile (T ids 20-25) is walkable but has no drawing of its own in the general tile painter: src/main.js paints it only through
   cvTile(), for the levels its guard names (today L.caravan). So (a) the baked art must really be a diagonal per kind: the topmost opaque pixel of each column
   of the sprite follows slopes.js heightAt (a flat or empty sprite is what Daniel saw), and (b) the level must be one the painter reaches. (b) is read from the
   guard in main.js itself, so widening the guard (or drawing slopes for every level) is seen here with no edit to this tool. */
let SLOPE_ART = null;
function slopeArt() { if (SLOPE_ART) return SLOPE_ART; const why = [];
  try { const S = bakeSandSlopes(); for (const kind of Object.values(SLOPE)) { const c = S[kind][0], g = c.getContext('2d'), d = g.getImageData(0, 0, TS, TS).data; let worst = 0, any = false;
      for (let x = 0; x < TS; x++) { let top = TS; for (let y = 0; y < TS; y++) if (d[(y * TS + x) * 4 + 3] > 0) { top = y; break; } if (top < TS) any = true; worst = Math.max(worst, Math.abs(top - heightAt(kind, x + 0.5))); }
      if (!any || worst > 2) why.push(SLOPE_NAMES[kind] + (any ? ' surface off by ' + worst.toFixed(1) + ' px' : ' is empty')); } }
  catch (e) { why.push('could not bake: ' + e.message); }
  return SLOPE_ART = { ok: !why.length, why: why.join('; ') }; }
/* THE TRACKS src/audio.js COMPOSES ITSELF (no file): the names its synth plays, read off its own source (`wantTrack === 'name'`) */
let SYNTH = null;
function synthTracks() { if (SYNTH) return SYNTH; const src = readFileSync(new URL('../src/audio.js', import.meta.url), 'utf8'); SYNTH = new Set([...src.matchAll(/wantTrack === '([a-z0-9]+)'/g)].map(m => m[1])); for (const b of Object.keys(BOSS_SYNTH_BASE)) SYNTH.add(b); return SYNTH; }   /* + the boss themes src/boss-music.js composes (a 'name:variant' plays the base's theme) */
let GATE_SRC = null;
function slopeGate() { if (GATE_SRC !== null) return GATE_SRC; const src = readFileSync(new URL('../src/main.js', import.meta.url), 'utf8'), m = src.match(/if \(([^\n]*?) && cvTile\(x, y, t\)\) continue;/);
  return GATE_SRC = m ? m[1] : ''; }
const slopeGateName = () => slopeGate() || 'nothing (no guard found)';
function slopesPainted(L) { const g = slopeGate(); if (!g) return false; try { return !!new Function('L', 'return !!(' + g + ')')(L); } catch { return true; /* a guard that reads more than L: assume it reaches everything */ } }

/* A HASH OF THE LEVEL'S DATA: the pilot cache (docs/level1-pilot.json) is stamped with it, so a level edit makes the cached pilot row stale. */
export function levelHash(lv) { const L = built(lv); return createHash('sha1').update(JSON.stringify([L.W, L.H, Array.from(L.grid), L.ents.filter(e => !e.stuck), L.moversExtra || null, L.ambushes || null])).digest('hex').slice(0, 12); }
export const PILOT_FILE = fileURLToPath(new URL('../docs/level1-pilot.json', import.meta.url));
export const MASH_FILE = fileURLToPath(new URL('../docs/mash-bot.json', import.meta.url));
export const CURVE_FILE = fileURLToPath(new URL('../docs/level1-curve.json', import.meta.url));   /* (claude/combat2) the level-1 knight pilot over EVERY campaign level: the measured difficulty curve (tools/rule-fights.mjs) */
/* THE MASH GATE (claude/mashbot, 2026-10-01; tools/mash-bot.mjs, docs/BOSS-AUDIT.md). A player who ONLY MASHES ATTACK must lose to the level's boss (all three heroes) and
   must die or drop under MASH_HP percent health in the level. Read from the cache docs/mash-bot.json (hash-stamped like the pilot's), never run live. REPORT-ONLY (WARN) until
   MASH_ENFORCE is set: the combat pass and the boss fixes turn it on; the target rule is already in docs/NEW-LEVEL-CHECKLIST.md. */
export const MASH_ENFORCE = true, MASH_HP = 40;
/* PER LEVEL, PER PART (claude/combat3, the combat pass; Daniel 2026-10-01: "MASH_ENFORCE per boss as fixed - enforce for every boss that now passes;
   new levels/bosses enforced from day one; the rest stay report-only until their wave"). MASH_ENFORCE was one switch. Now every part of every
   campaign level - its boss, its mini, its level run - is ENFORCED by mashGate (the mash row here, and tools/mash-gate.mjs for every level),
   a level with no row from day one, EXCEPT the parts listed below: the ones the mash bot still beats after the combat pass (the boss waves'
   TODO list, docs/BOSS-AUDIT.md). The list may only SHRINK: a listed part that now holds fails until its entry is taken out. */
/* (measured 2026-10-01 after the combat pass, docs/mash-bot.json: 9 bosses, 12 minis and 4 level runs the mash bot still beats) */
export const MASH_REPORT_ONLY = { fallingtower: ['mini'] };   /* (claude/sweep1: the Mother Cap's boss row holds 0/6 now - enforced) */   /* (claude/sweep3: the Ploughman and the Barrow Rider hold now - enforced) */   /* (claude/combat2 10-05: the storm, keep and longwater LEVEL runs hold with knight/warden/pyro - src/foe-react.js's reactive foes and act tier, and the mash bot no longer lifts over an elite's gate or out of a room it could not finish (tools/mash-rows.mjs MASH_HELD) - taken out; their rows re-stamped level then boss) */   /* (claude/weight 10-04, WEIGHT-T on the harness: the hanging mini + run, crown/lamplit/burial minis, causeway/spire/theatre/redgorge runs hold now - taken out; docs/mash-bot.json re-stamped by --all) */   /* HARNESSCARD 2026-10-04: the bot heroes now carry an even level-up card (real-play stats), and the mash bot clears the hanging and redgorge LEVEL runs with them (hanging 81% lowest hp, redgorge 42%): ADDED here so the gate stays green until the coordinator retunes; the list should shrink again */   /* (Daniel 10-03: the per-hero sweep (claude/mashmachines) found the MONASTERY, LONG WATER and THE THEATRE run mashable by warden / pyro; COMBAT PART 2 fixes them. DEEP stays OFF the list: it holds.) */
/* THE GATE ON ONE LEVEL: { ok, hard: parts beaten and not listed, stale: listed parts that hold now, msg } */
export function mashGate(lv) {
  const v = mashVerdict(lv), soft = MASH_REPORT_ONLY[lv.id] || [];
  if (v.state === 'missing' || v.state === 'stale') return { ok: false, hard: [v.state], stale: [], msg: v.msg };
  const why = v.why.concat(v.levelRun ? [] : ['level']), hard = why.filter(p => !soft.includes(p)), stale = soft.filter(p => !why.includes(p));
  return { ok: !hard.length && !stale.length, hard, stale, msg: v.msg + (hard.length ? ' - ENFORCED: ' + hard.join(', ') : '') + (soft.length ? ' [report-only for the boss waves: ' + soft.join(', ') + ']' : '') + (stale.length ? ' - ' + stale.join(', ') + ' HOLDS NOW: take it out of MASH_REPORT_ONLY.' + lv.id : '') };
}
let MASHC = null; const mashCache = () => MASHC || (MASHC = existsSync(MASH_FILE) ? JSON.parse(readFileSync(MASH_FILE, 'utf8')) : {});
export function mashVerdict(lv) {
  const row = mashCache()[lv.id], gated = GATE.includes(lv.id), cmd = 'node tools/mash-bot.mjs ' + lv.id + ' --level ' + lv.id + ' --write';
  if (!row) return { ok: false, state: 'missing', msg: 'no mash-bot row in docs/mash-bot.json (' + (gated ? 'gated' : 'not gated') + '): run ' + cmd };
  if (row.hash !== levelHash(lv)) return { ok: false, state: 'stale', msg: 'the level changed since the mash bot ran: re-run ' + cmd };
  const why = [], parts = [];
  for (const key of ['boss', 'mini']) { const b = row[key]; if (!b) continue; const wonBy = Object.entries(b.byHero).filter(([, v]) => v.some(x => x.startsWith('win'))).map(([h]) => h);
    parts.push(key + ' ' + (wonBy.length ? 'BEATEN by mashing (' + wonBy.join(',') + '; ' + b.wins + '/' + b.fights + ' fights won)' : 'holds (0/' + b.fights + ' mash wins)')); if (wonBy.length) why.push(key); }
  if (row.level) { const worst = Object.entries(row.level).sort((a, b) => (clearsAt(b[1], MASH_HP) - clearsAt(a[1], MASH_HP)) || (b[1].minHpPct - a[1].minHpPct))[0], r = worst[1], cleared = clearsAt(r, MASH_HP);   /* (claude/combat2: a run HELD in a room it could not finish is not a clear - tools/mash-rows.mjs MASH_HELD) */
    const have = ['knight', 'warden', 'pyro'].filter(h => row.level[h]);
    parts.push((have.length < 3 ? '(level judged by ' + have.join('+') + ' only: re-run --level for all three starter heroes) ' : '') + 'level: best mash hero ' + worst[0] + ' lowest hp ' + r.minHpPct + '%, ' + r.deaths + ' deaths, walked ' + r.walked + '%, ' + (r.rides !== undefined ? r.rides + ' rides, ' + (r.pulls || 0) + ' pulls, ' : '') + r.lifts + ' lifts' + ((r.held || 0) >= MASH_HELD ? ', HELD in a room it could not finish (' + r.held + ' lifts put back)' : '') + (cleared ? ' (CLEARED without dropping under ' + MASH_HP + '%)' : '')); if (cleared) why.push('level'); }
  else parts.push('level mode not run: ' + cmd);
  return { ok: !why.length && !!row.level, why, levelRun: !!row.level, state: why.length ? 'beaten' : 'ok', msg: parts.join('; ') + (why.length ? ' - THE MASH BOT BEATS THE ' + why.join(' AND ').toUpperCase() : '') };
}
let PILOT = null; const pilotCache = () => PILOT || (PILOT = existsSync(PILOT_FILE) ? JSON.parse(readFileSync(PILOT_FILE, 'utf8')) : {});

export function measure(lv) {
  const L = built(lv), P = pacing(lv), W = L.W, H = L.H, ents = L.ents || [], route = P.route, A = arena(L), end = A ? Math.floor(A.x0 / TS) : W;
  const at = (x, y) => (x < 0 || y < 0 || x >= W || y >= H) ? T.SOLID : L.grid[y * W + x];
  const isFoe = e => !GENERIC.has(e.t) && !isGadget(e.t) && !e.boss && !(A && A.boss === e.t) && (e.t in THREAT ? THREAT[e.t] > 0 : true);
  const foes = ents.filter(isFoe);
  const waves = (L.ambushes || []).flatMap(q => q.waves.flat().map(w => ({ t: w[0], x: w[1], y: w[2] })));
  const allFoes = [...foes.map(e => ({ t: e.t, x: e.x, y: e.y, skin: e.cnSkin })), ...waves];
  const gadgetEnts = ents.filter(e => !GENERIC.has(e.t) && isGadget(e.t) && e.t !== 'deco');

  // ---- 1. FLATNESS: walk the route column by column; a stretch ends at a height change, a gap, a hazard, a foe or a gadget ----
  const cols = new Map(); for (const [x, y] of route) if (!cols.has(x)) cols.set(x, y);    /* the first route point in each column is the floor it stands on */
  const supported = (x, y) => { const t = at(x, y + 1); return t !== T.AIR && t !== T.SPIKE && t !== T.NET && t !== T.CLIMB; };
  const near = (list, x, y, rx, ry) => list.some(e => Math.abs(e.x - x) <= rx && Math.abs(e.y - y) <= ry);
  const hazardAt = (x, y) => { for (let dx = -1; dx <= 1; dx++) for (let dy = -1; dy <= 2; dy++) if (at(x + dx, y + dy) === T.SPIKE) return true; return false; };
  const gadgetXY = [...gadgetEnts.map(e => ({ x: e.x, y: e.y })), ...(L.moversExtra || []).filter(m => !MOVER_KINDS_SKIP.has(m.kind)).map(m => ({ x: Math.round(m.x / TS), y: Math.round(m.y / TS) }))];
  const regions = []; if (A) regions.push([A.x0 / TS, A.x1 / TS]); for (const q of L.ambushes || []) regions.push([q.wallL, q.wallR]); if (L.mini) regions.push([L.mini.x0 / TS, L.mini.x1 / TS]);
  const inRoom = x => regions.some(([a, b]) => x >= a && x <= b);
  const scan = (breakOnFoes) => { let best = { n: 0, at: 0, long: 0 }, lo = null, minY = 0, maxY = 0, start = 0, prevX = null, prevY = null;
    const cut = x => { if (lo !== null) { const n = x - start; best.long += n >= LIM.longRun ? n : 0; if (n > best.n) best = { n, at: start, long: best.long }; } lo = null; };
    for (const x of [...cols.keys()].sort((a, b) => a - b)) { if (x >= end) break; const y = cols.get(x);
      let brk = false, gapAt = null, gapW = 0;
      if (prevX !== null) { for (let xx = prevX + 1; xx < x; xx++) if (!supported(xx, prevY) && !supported(xx, y)) { brk = true; gapW++; if (gapAt === null) gapAt = xx; }   /* a gap crossed by a jump (or a glide): the run ends where the floor ends, not on the far side (claude/skyroad: a flight over a chasm with no footing in it read as 30-40 columns of flat empty ground) */
        if (!supported(x, y) || Math.abs(y - prevY) >= 2) brk = true; }   /* a step of 2+ */
      if (hazardAt(x, y) || near(gadgetXY, x, y, 6, 6) || inRoom(x)) brk = true;
      if (breakOnFoes && near(allFoes, x, y, 8, 6)) brk = true;
      if (lo !== null && !brk) { minY = Math.min(minY, y); maxY = Math.max(maxY, y); if (maxY - minY >= 2) brk = true; }
      if (brk) { cut(gapAt !== null && gapW > LIM.chasm ? gapAt : x); }   /* (RATIFIED by the coordinator 10-05, narrowed per the skyroad review: only a gap WIDER THAN A JUMP - more than LIM.chasm columns - ends the run where the floor ends; a jump-sized pit cuts on its far side, as it always did) */
      if (lo === null && !brk) { lo = x; start = x; minY = maxY = y; }
      else if (lo === null && brk) { lo = x; start = x; minY = maxY = y; }
      prevX = x; prevY = y; }
    cut(end); return best; };   /* long: how many columns lie in runs of LIM.longRun+ */
  const tall = !!P.tall, flat = tall ? { n: 0, at: 0, long: 0 } : scan(true), terrainFlat = tall ? { n: 0, at: 0, long: 0 } : scan(false);   /* a tall level is floors, not a walk: flatness and screens do not apply */

  // ---- 2. HEIGHT BANDS ----
  const bands = new Set(route.map(([, y]) => Math.floor(y / 4)));
  const R = floodReach(L, T, { rides: true }), colBands = new Map();
  for (const k of R.footing) { const c = k.indexOf(','), x = +k.slice(0, c), y = +k.slice(c + 1); if (x < 0 || x >= end) continue; let s = colBands.get(x); if (!s) colBands.set(x, s = new Set()); s.add(Math.floor(y / 4)); }
  let multi = 0; for (let x = 0; x < end; x++) if ((colBands.get(x) || new Set()).size > 1) multi++;
  const multiShare = multi / Math.max(1, end);

  // ---- 3. MECHANICS: kinds and places ----
  const kinds = new Map();   /* name -> xs (tile columns) */
  /* (claude/redgorge) ON A TALL LEVEL A PLACE IS A CLUSTER OF ROWS, not of columns: a climb's machines stand one over another, and THE RED GORGE's wheels (columns 20-28,
     rows 21-135) read as one place by column. Only the ents and movers carry a row; the system arrays stay by column */
  const add = (k, x, y) => { if (!kinds.has(k)) kinds.set(k, []); kinds.get(k).push(tall && y !== undefined ? y : x); };
  for (const e of gadgetEnts) add(e.t, e.x, e.y);
  for (const m of L.moversExtra || []) if (!MOVER_KINDS_SKIP.has(m.kind)) add('mv:' + (m.kind || 'mover'), Math.round(m.x / TS), Math.round(m.y / TS));
  for (const k of SYSTEM_ARRAYS) { const v = L[k]; if (!Array.isArray(v) || !v.length) continue; for (const it of v) { const x = it && (it.x !== undefined ? it.x : it.x0 !== undefined ? it.x0 / TS : Array.isArray(it) ? it[0] : undefined); if (x !== undefined && Number.isFinite(x)) add('arr:' + k, Math.round(x)); } }
  if (L.mage && Array.isArray(L.mage.locks)) for (const k of L.mage.locks) add('mage:lock', Math.round((k.x !== undefined ? k.x : k.x0 || 0)));
  const gadgets = [...kinds].map(([k, xs]) => ({ k, n: xs.length, places: setSpan(xs) })).sort((a, b) => b.places - a.places || b.n - a.n);
  const developed = gadgets.filter(g => g.places >= 3);

  // ---- 4. MUSIC ----
  /* THE LEVEL'S TRACK AND ITS BOSS ROOM'S: each must be a real track (a file in audio/, or one src/audio.js composes itself: a synth track it plays by name), its own, and not a stock
     stand-in. BORROWED = another campaign level (or its boss arena) plays it, or it is on STOCK_MUSIC. The level's arena may play the level's own track (the Unburied Field carries
     its Night on Bald Mountain into its boss) but not another level's. */
  const music = L.music || null, arenaMusic = (A && A.music) || null, others = LEVELS.filter(d => d.id !== lv.id && !(d.hidden && !d.secret) && !/^trial_|^shop/.test(d.id));
  const usedBy = t => others.filter(d => { let o; try { o = built(d); } catch { return false; } return o.music === t || (o.arena && o.arena.music === t) || (o.mini && o.mini.music === t); }).map(d => d.id);
  const borrowedFrom = music ? usedBy(music).concat(STOCK_MUSIC[music] ? ['STOCK (' + STOCK_MUSIC[music].split(':')[0] + ')'] : []) : [];
  const arenaBorrowed = arenaMusic && arenaMusic !== music && !BOSS_POOL.includes(arenaMusic) ? usedBy(arenaMusic).concat(STOCK_MUSIC[arenaMusic] ? ['STOCK'] : []) : [];
  const shared = SHARED_MUSIC.includes(music);
  const real = t => !!t && (existsSync(new URL('../audio/' + t + '.ogg', import.meta.url)) || existsSync(new URL('../audio/' + t + '.mp3', import.meta.url)) || synthTracks().has(splitTrack(t)[0]));
  const trackFile = real(music), arenaReal = !arenaMusic || real(arenaMusic);

  // ---- 5. SECRETS, CHECKPOINTS, ENCOUNTERS, DENSITY ----
  const loot = P.stats.offLoot.filter(s => /^(silver|relic)@/.test(s));
  const checks = ents.filter(e => e.t === 'check').length, routeTiles = P.stats.routeTiles;
  const secretEnts = ents.filter(e => e.t === 'silver' || e.t === 'relic').length;
  const designed = e => e.squad || e.elite;
  const sectionsN = Math.ceil(end / LIM.section), holes = [];
  for (let s = 0; s < sectionsN; s++) { const x0 = s * LIM.section, x1 = Math.min(end, x0 + LIM.section);
    const inSec = e => e.x >= x0 && e.x < x1;
    let n = ents.filter(e => inSec(e) && (designed(e))).length + (L.ambushes || []).filter(q => q.wallL >= x0 && q.wallL < x1).length + (L.mini && L.mini.x0 / TS >= x0 && L.mini.x0 / TS < x1 ? 1 : 0);
    const f = foes.filter(inSec).sort((a, b) => a.x - b.x);   /* or a knot of three foes within ten columns: authored by hand */
    for (let i = 0; i + 2 < f.length && !n; i++) if (f[i + 2].x - f[i].x <= 10) n++;
    if (x1 - x0 >= 60 && !n) holes.push(x0 + '-' + x1); }
  /* DENSITY COUNTS ENCOUNTERS, NOT BODIES (claude/fairfix, Daniel 2026-09-30). Counting bodies made "fewer, better foes" and this bar pull against each other: the fair
     failed it with every foe in a designed encounter, and the cheap way to pass was padding. An ENCOUNTER is one squad (every member of a squad name), one elite, one
     ambush room (its waves are one fight), the mini, or a clump of the other foes - any foes within LIM.clump columns of each other are one fight, whether a hand-placed
     knot or a sprinkle's clump. Each is counted once, at its middle column. */
  const enc = [], bySquad = new Map(), loose = [];
  for (const e of foes) { if (e.squad) { if (!bySquad.has(e.squad)) bySquad.set(e.squad, []); bySquad.get(e.squad).push(e.x); } else if (e.elite) enc.push({ x: e.x, k: 'elite' }); else loose.push(e.x); }
  for (const [k, xs] of bySquad) enc.push({ x: (Math.min(...xs) + Math.max(...xs)) / 2, k: 'squad ' + k });
  for (const q of L.ambushes || []) enc.push({ x: (q.wallL + q.wallR) / 2, k: 'ambush' });
  if (L.mini) enc.push({ x: (L.mini.x0 + L.mini.x1) / 2 / TS, k: 'mini' });
  loose.sort((a, b) => a - b); for (let i = 0; i < loose.length;) { let j = i; while (j + 1 < loose.length && loose[j + 1] - loose[j] <= LIM.clump) j++; enc.push({ x: (loose[i] + loose[j]) / 2, k: 'clump' }); i = j + 1; }
  const per = []; for (let x = 0; x + 24 <= end; x += 24) per.push(enc.filter(e => e.x >= x && e.x < x + 24).length);
  const ruleFight = ruleFights(L, enc, TS), curveV = curveVerdict(lv.id, levelHash(lv));   /* (claude/combat2, tools/rule-fights.mjs) */
  const bodies = []; for (let x = 0; x + 24 <= end; x += 24) bodies.push(foes.filter(e => e.x >= x && e.x < x + 24).length + waves.filter(w => w.x >= x && w.x < x + 24).length);
  const occupied = []; for (let x = 0; x + 24 <= end; x += 24) occupied.push(bodies[occupied.length] > 0 || per[occupied.length] > 0);
  const mean = a => a.length ? a.reduce((p, q) => p + q, 0) / a.length : 0;
  const density = tall ? NaN : mean(per), bodyDensity = tall ? NaN : mean(bodies), emptyScreens = occupied.filter(o => !o).length, emptyShare = occupied.length ? emptyScreens / occupied.length : 0;

  // ---- 6. VERTICAL / BRANCHING ROUTE ----
  const ys = route.map(p => p[1]), span = Math.max(...ys) - Math.min(...ys), back = P.stats.backtrack, pockets = P.stats.pockets;

  // ---- 7. INVISIBLE SLOPES: every slope collision cell (ids 20-25) needs a drawn diagonal tile of its own kind ----
  let slopeCells = 0; for (let i = 0; i < L.grid.length; i++) if (L.grid[i] >= 20 && L.grid[i] <= 25) slopeCells++;
  // ---- 8. ROLES: ranged present, role mix ----
  const roleCount = {}; for (const f of allFoes) for (const r of rolesOf(f.t, f.skin)) roleCount[r] = (roleCount[r] || 0) + 1;
  const roleKinds = Object.keys(roleCount).sort(), rangedN = roleCount.ranged || 0;

  // ---- 9. COLLECTIBLES / INTERACTIVES UNLOCK SOMETHING ----
  const declared = new Map((Array.isArray(L.unlocks) ? L.unlocks : []).map(u => [u.kind, u]));
  const collectKinds = [...new Set(ents.filter(e => COLLECT_KINDS.has(e.t) || e.collect).map(e => e.t))];
  const mageLocks = !!(L.mage && Array.isArray(L.mage.locks) && L.mage.locks.length);
  const interactKinds = [...new Set([...ents.filter(e => INTERACTIVE_KINDS.has(e.t)).map(e => e.t), ...(mageLocks ? ['mage:lock'] : [])])];
  const hasTarget = ents.some(e => TARGET_ENTS.has(e.t)) || TARGET_ARRAYS.some(k => Array.isArray(L[k]) && L[k].length) || (L.moversExtra || []).length > 0 || mageLocks;
  const unmapped = collectKinds.filter(k => !(k in COLLECT_KNOWN) && !declared.has(k));
  const badDecl = [...declared.values()].filter(u => !u.opens || !u.hud || !(ents.some(e => e.t === u.kind) || (Array.isArray(L[u.kind]) && L[u.kind].length)));
  const keyNoGate = collectKinds.includes('key') && !ents.some(e => e.t === 'lockgate' || (e.t === 'gate' && (e.lock || e.needs))) && !(L.locks || []).length;
  const deadInteract = interactKinds.length && !hasTarget ? interactKinds : [];
  const unlockOk = !unmapped.length && !badDecl.length && !keyNoGate && !deadInteract.length;
  const unlockMsg = (collectKinds.length + interactKinds.length + declared.size === 0 ? 'no collectible or interactive kinds beyond silver/relic' : collectKinds.length + ' collectible kinds [' + collectKinds.join(',') + '], ' + interactKinds.length + ' interactive kinds [' + interactKinds.join(',') + '], ' + declared.size + ' declared in L.unlocks')
    + (unmapped.length ? '; NO UNLOCK NAMED for ' + unmapped.join(',') + ' (declare it in L.unlocks)' : '') + (badDecl.length ? '; L.unlocks entry missing opens/hud or not in the level: ' + badDecl.map(u => u.kind).join(',') : '') + (keyNoGate ? '; a key with no lock gate' : '') + (deadInteract.length ? '; ' + deadInteract.join(',') + ' with nothing in the level to open' : '');

  // ---- 10. THE LEVEL-1 NO-ABILITY PILOT (cached; tools/level1-pilot.mjs) ----
  const gated = GATE.includes(lv.id), prow = pilotCache()[lv.id], phash = prow ? levelHash(lv) : null;
  const pilotState = !prow ? (gated ? 'missing' : 'none') : phash !== prow.hash ? 'stale' : !prow.bare ? 'notbare' : prow.hits >= LIM.pilotHits ? 'ok' : 'soft';
  const pilotOk = pilotState === 'ok' || (!gated && (pilotState === 'none' || pilotState === 'stale'));
  const pilotMsg = pilotState === 'none' ? 'not run (required for gated levels only; node tools/level1-pilot.mjs ' + lv.id + ' --write)'
    : pilotState === 'missing' ? 'NO PILOT ROW in docs/level1-pilot.json: run node tools/level1-pilot.mjs ' + lv.id + ' --write and commit it'
    : pilotState === 'stale' ? 'the level changed since its pilot ran (hash ' + prow.hash + ' now ' + phash + '): re-run node tools/level1-pilot.mjs ' + lv.id + ' --write'
    : pilotState === 'notbare' ? 'the pilot ran with talents or skills present: it must be a fresh level-1 hero'
    : prow.hits + ' blows taken by a fresh level-1 ' + prow.hero + ' (' + prow.deaths + ' deaths, walked ' + prow.walked + '%) (>=' + LIM.pilotHits + (pilotState === 'soft' ? '): A WALK, NOT A LEVEL' : ')') + (prow.lifts !== undefined ? ', ' + prow.lifts + ' lifts' : '');
  const mashV = gated ? mashGate(lv) : { ok: true, msg: '' };   /* (claude/combat3: per part, MASH_REPORT_ONLY) */
  const sa = slopeArt(), painted = slopeCells ? slopesPainted(L) : true;
  const m = { id: lv.id, tall, emptyShare, slopeCells, slopePainted: painted, slopeArtOk: sa.ok, slopeArtWhy: sa.why, W, routeTiles, flat: flat.n, flatAt: flat.at, flatShare: flat.long / Math.max(1, end), terrainShare: terrainFlat.long / Math.max(1, end), terrainFlat: terrainFlat.n, terrainFlatAt: terrainFlat.at, routeBands: bands.size, multiShare, gadgetKinds: gadgets.length, gadgetDeveloped: developed.length, gadgets, music, borrowedFrom, shared, trackFile: !!trackFile,
    encountersN: enc.length, bodyDensity, roleKinds, roleCount, rangedN, unmapped, collectKinds, interactKinds, pilotState, pilotHits: prow ? prow.hits : null, secrets: loot.length, secretEnts, checks, checkSpacing: checks ? routeTiles / checks : Infinity, density, emptyScreens, holes, span, back, pockets, per };
  const bar = [
    ['flat', m.flatShare <= LIM.flatShareMax && m.terrainShare <= LIM.terrainShareMax, Math.round(m.flatShare * 100) + '% of the route is long flat empty runs (<=' + Math.round(LIM.flatShareMax * 100) + '%), ' + Math.round(m.terrainShare * 100) + '% is long level ground (<=' + Math.round(LIM.terrainShareMax * 100) + '%); longest ' + m.flat + ' / ' + m.terrainFlat + ' columns'],
        ['bands', m.routeBands >= LIM.routeBands && m.multiShare >= LIM.multiHeightShare, m.routeBands + ' height bands on the route (>=' + LIM.routeBands + '), ' + Math.round(m.multiShare * 100) + '% of the width offers a second height (>=' + Math.round(LIM.multiHeightShare * 100) + '%)'],
    ['mechanics', m.gadgetKinds >= LIM.gadgetKinds && m.gadgetDeveloped >= LIM.gadgetDeveloped, m.gadgetKinds + ' gadget kinds (>=' + LIM.gadgetKinds + '), ' + m.gadgetDeveloped + ' in 3+ places (>=' + LIM.gadgetDeveloped + '): ' + gadgets.slice(0, 8).map(g => g.k + 'x' + g.places).join(' ')],
    ['music', !!music && m.trackFile && (m.shared || !borrowedFrom.length) && arenaReal && !arenaBorrowed.length, music ? music + (m.trackFile ? '' : ' (NO SUCH TRACK: no file in audio/ and no synth track of that name)') + (borrowedFrom.length && !m.shared ? ' BORROWED: also ' + borrowedFrom.join(',') : '')
      + (arenaMusic ? '; boss room ' + arenaMusic + (arenaReal ? '' : ' (NO SUCH TRACK)') + (arenaBorrowed.length ? ' BORROWED: also ' + arenaBorrowed.join(',') : '') : '') : 'no track'],
    ['secrets', m.secrets >= LIM.secrets, m.secrets + ' silver/relic off the route (>=' + LIM.secrets + ')'],
    ['checks', m.checks >= LIM.checksMin && m.checkSpacing >= LIM.checkSpacing, m.checks + ' checkpoints, one per ' + Math.round(m.checkSpacing) + ' route tiles (>=' + LIM.checkSpacing + ')'],
    ['encounters', !m.holes.length, m.holes.length ? 'no designed encounter in columns ' + m.holes.join(', ') : 'a designed encounter in every ' + LIM.section + ' columns'],
    ['density', m.tall || (m.density >= LIM.densityLo && m.density <= LIM.densityHi && m.emptyShare <= LIM.emptyShareMax), m.tall ? 'a tall level: not measured' : m.density.toFixed(2) + ' encounters a screen (' + LIM.densityLo + '-' + LIM.densityHi + '; ' + m.encountersN + ' encounters, ' + m.bodyDensity.toFixed(1) + ' foes a screen), ' + m.emptyScreens + ' empty screens = ' + Math.round(m.emptyShare * 100) + '% (<=' + Math.round(LIM.emptyShareMax * 100) + '%)'],
    ['slopes', m.slopeArtOk && m.slopePainted, !m.slopeCells ? 'no slope tiles' : m.slopeCells + ' slope cells: ' + (m.slopeArtOk ? (m.slopePainted ? 'drawn (diagonal tiles, guard: ' + slopeGateName() + ')' : 'INVISIBLE - the tile painter draws slope art only where ' + slopeGateName() + ', so these walkable slopes have no texture') : 'the slope tiles are not diagonal: ' + m.slopeArtWhy)],
    ['ranged', m.rangedN > 0, m.rangedN ? m.rangedN + ' ranged foes: ' + [...new Set(allFoes.filter(f => rolesOf(f.t, f.skin).includes('ranged')).map(f => f.t))].join(',') : 'NO RANGED FOE: nothing in this level shoots, throws or casts (ROLES.ranged in tools/level-quality.mjs)'],
    ['roles', m.roleKinds.length >= LIM.roles, m.roleKinds.length + ' foe roles (>=' + LIM.roles + '): ' + m.roleKinds.map(r => r + 'x' + roleCount[r]).join(' ')],
    ['unlocks', unlockOk, unlockMsg],
    ['pilot', pilotOk, pilotMsg],
    ['mash', !gated || mashV.ok, gated ? mashV.msg : 'not gated (node tools/mash-bot.mjs ' + lv.id + ' to measure)'],
    ['ruleFight', ruleFight.ok, ruleFight.msg],
    ['curve', !!curveV.soft || (!CURVE_REPORT_ONLY[lv.id] && curveV.ok), curveV.msg + (CURVE_REPORT_ONLY[lv.id] ? (curveV.ok && !curveV.soft ? ' - BACK IN ITS BAND: take it out of CURVE_REPORT_ONLY (tools/rule-state.mjs)' : ' [report-only: CURVE_REPORT_ONLY]') : '')],
    ['route', (m.span >= LIM.routeSpan || m.back >= LIM.routeSpan) && m.pockets >= LIM.branches, 'route spans ' + m.span + ' rows, ' + m.back + ' tiles back, ' + m.pockets + ' branches/pockets (>=' + LIM.branches + ')'],
  ];
  m.ruleFight = ruleFight; m.curve = curveV;
  const soft = (REPORT_ONLY[lv.id] || []).concat(MASH_ENFORCE ? [] : ['mash'], REPORT_ALL, CURVE_REPORT_ONLY[lv.id] && !curveV.ok ? ['curve'] : []);   /* (the mash row is per part now: mashGate reads MASH_REPORT_ONLY) */
  m.bar = bar; m.pass = bar.every(b => b[1] || soft.includes(b[0])); m.failed = bar.filter(b => !b[1] && !soft.includes(b[0])).map(b => b[0]); m.reportOnly = bar.filter(b => !b[1] && soft.includes(b[0])).map(b => b[0]);
  return m;
}

const args = process.argv.slice(2), ALL = args.includes('--all'), ids = args.filter(a => !a.startsWith('-'));
const isMain = process.argv[1] && import.meta.url.endsWith(process.argv[1].replace(/\\/g, '/').split('/').pop());
if (isMain) {
  const campaign = LEVELS.filter(d => !(d.hidden && !d.secret));
  if (ALL) {
    const cols = ['flat', 'terrain', 'bands', 'mechanics', 'music', 'secrets', 'checks', 'encounters', 'density', 'route'];
    console.log('LEVEL QUALITY, every campaign level (a report: nothing here fails the suite; the gated list is ' + GATE.join(', ') + ')\n');
    console.log('level'.padEnd(12) + 'flat% ground%   bands gadg/dev secr chk dens slope rng roles unlk pilot  fails');
    let clear = 0;
    for (const d of campaign) { let m; try { m = measure(d); } catch (e) { console.log(d.id.padEnd(12) + 'could not be measured: ' + e.message); continue; } if (m.pass) clear++;
      console.log(d.id.padEnd(12) + String(Math.round(m.flatShare * 100)).padStart(5) + String(Math.round(m.terrainShare * 100)).padStart(8) + (m.routeBands + '/' + Math.round(m.multiShare * 100) + '%').padStart(9) + (m.gadgetKinds + '/' + m.gadgetDeveloped).padStart(9) + String(m.secrets).padStart(5) + String(m.checks).padStart(5) + (m.tall ? '-' : m.density.toFixed(1)).padStart(5) + (m.slopeCells ? (m.slopePainted ? 'ok' : 'NONE') : '-').padStart(6) + String(m.rangedN).padStart(4) + String(m.roleKinds.length).padStart(6) + (m.bar.find(b => b[0] === 'unlocks')[1] ? 'ok' : 'NO').padStart(5) + (m.pilotHits === null ? '-' : String(m.pilotHits)).padStart(6) + '  ' + (m.pass ? 'PASS' : m.failed.join(','))); }
    console.log('\n' + clear + ' of ' + campaign.length + ' clear the bar. Columns: flat% = share of the route in long flat empty runs (limit ' + LIM.flatShareMax * 100 + '), ground% = share in long level-ground runs (' + LIM.terrainShareMax * 100 + '), bands = height bands on the route / % of width with a second height, gadg/dev = gadget kinds / those in 3+ places, secr = silver+relic off the route, chk = checkpoints, dens = designed encounters a screen.');
    process.exit(0);
  }
  const want = ids.length ? ids : GATE; let failed = 0;
  for (const id of want) {
    const lv = LEVELS.find(l => l.id === id);
    if (!lv) { console.log('== ' + id + ': not built on this branch - skipped' + (GATE.includes(id) ? ' (it is on the gated list: the lane that adds it must clear this bar)' : '')); continue; }
    const m = measure(lv);
    console.log('== ' + id.toUpperCase() + ' (' + m.W + ' columns, route ' + m.routeTiles + ' tiles): ' + (m.pass ? 'CLEARS THE BAR' : 'MISSES THE BAR: ' + m.failed.join(', ')));
    for (const [k, ok, msg] of m.bar) console.log('  ' + (ok ? 'ok   ' : m.reportOnly.includes(k) ? 'WARN ' : 'FAIL ') + k.padEnd(11) + msg + (!ok && m.reportOnly.includes(k) ? '   [REPORT-ONLY for ' + id + ': see REPORT_ONLY in tools/level-quality.mjs]' : ''));
    if (!m.pass) failed++;
  }
  console.log(failed ? '\n' + failed + ' level(s) miss the quality bar (docs/LEVEL-QUALITY.md).' : '\nevery gated level clears the quality bar.');
  process.exitCode = failed ? 1 : 0;
}
