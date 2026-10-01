/* tools/level-quality.mjs - THE QUALITY BAR A LEVEL MUST CLEAR (claude/levelq, 2026-09-30).
   Why: Daniel called the Harvest Fair "a prototype - just walk right" and it had passed ~20 checks. Every check asked whether a promise
   was kept; none asked whether the level was any good. This measures the DATA of a level against THE MAGE'S FOLLY, his benchmark.
     node tools/level-quality.mjs                 the gated levels (GATE below): fails if one misses the bar; a listed id that is not built yet is skipped, with a note
     node tools/level-quality.mjs <id> [<id>..]   just those levels (any id, gated or not), full detail
     node tools/level-quality.mjs --all           a REPORT of every campaign level as a table (exit 0: old levels that miss the bar are information, not failures)
   docs/LEVEL-QUALITY.md says what each number means and why the limit is where it is. Everything is read from the built level (grid, ents,
   moversExtra, arrays) and its walked main route (tools/pacing.mjs): no browser, ~10 s for the whole campaign. */
import { existsSync, readFileSync } from 'node:fs';
import { SLOPE, SLOPE_NAMES, heightAt } from '../src/slopes.js';
import { bakeSandSlopes } from '../src/redraw/slopes.js';
import { install } from './node-canvas.mjs';
import { LEVELS, T } from '../src/level.js';
import { THREAT } from '../src/threat.js';
import { floodReach } from '../src/reachcore.js';
import { pacing } from './pacing.mjs';
import { BOSS_SYNTH_BASE, splitTrack } from '../src/boss-music.js';
install();
const TS = 16;

/* WHICH LEVELS ARE HELD TO IT. New or reworked levels only: the old campaign misses the bar in places (--all shows where) and is not being reworked.
   Add a level id here in the lane that builds or reworks it. An id that is not in LEVELS yet is skipped with a note (the theatre lane lands later). */
export const GATE = ['theatre'];   /* fair re-gated when FAIRFIX2 ships (the OLD fair is live and is not a reworked level on this branch) */
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
  routeSpan: 8,         /* OR the walked route climbs/drops this many rows, or doubles back this many tiles (Folly 30 rows) */
};

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

export function measure(lv) {
  const L = built(lv), P = pacing(lv), W = L.W, H = L.H, ents = L.ents || [], route = P.route, A = arena(L), end = A ? Math.floor(A.x0 / TS) : W;
  const at = (x, y) => (x < 0 || y < 0 || x >= W || y >= H) ? T.SOLID : L.grid[y * W + x];
  const isFoe = e => !GENERIC.has(e.t) && !isGadget(e.t) && !e.boss && !(A && A.boss === e.t) && (e.t in THREAT ? THREAT[e.t] > 0 : true);
  const foes = ents.filter(isFoe);
  const waves = (L.ambushes || []).flatMap(q => q.waves.flat().map(w => ({ t: w[0], x: w[1], y: w[2] })));
  const allFoes = [...foes.map(e => ({ t: e.t, x: e.x, y: e.y })), ...waves];
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
      let brk = false;
      if (prevX !== null) { for (let xx = prevX + 1; xx < x; xx++) if (!supported(xx, prevY) && !supported(xx, y)) brk = true;   /* a gap crossed by a jump */
        if (!supported(x, y) || Math.abs(y - prevY) >= 2) brk = true; }   /* a step of 2+ */
      if (hazardAt(x, y) || near(gadgetXY, x, y, 6, 6) || inRoom(x)) brk = true;
      if (breakOnFoes && near(allFoes, x, y, 8, 6)) brk = true;
      if (lo !== null && !brk) { minY = Math.min(minY, y); maxY = Math.max(maxY, y); if (maxY - minY >= 2) brk = true; }
      if (brk) { cut(x); }
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
  const add = (k, x) => { if (!kinds.has(k)) kinds.set(k, []); kinds.get(k).push(x); };
  for (const e of gadgetEnts) add(e.t, e.x);
  for (const m of L.moversExtra || []) if (!MOVER_KINDS_SKIP.has(m.kind)) add('mv:' + (m.kind || 'mover'), Math.round(m.x / TS));
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
  const bodies = []; for (let x = 0; x + 24 <= end; x += 24) bodies.push(foes.filter(e => e.x >= x && e.x < x + 24).length + waves.filter(w => w.x >= x && w.x < x + 24).length);
  const occupied = []; for (let x = 0; x + 24 <= end; x += 24) occupied.push(bodies[occupied.length] > 0 || per[occupied.length] > 0);
  const mean = a => a.length ? a.reduce((p, q) => p + q, 0) / a.length : 0;
  const density = tall ? NaN : mean(per), bodyDensity = tall ? NaN : mean(bodies), emptyScreens = occupied.filter(o => !o).length, emptyShare = occupied.length ? emptyScreens / occupied.length : 0;

  // ---- 6. VERTICAL / BRANCHING ROUTE ----
  const ys = route.map(p => p[1]), span = Math.max(...ys) - Math.min(...ys), back = P.stats.backtrack, pockets = P.stats.pockets;

  // ---- 7. INVISIBLE SLOPES: every slope collision cell (ids 20-25) needs a drawn diagonal tile of its own kind ----
  let slopeCells = 0; for (let i = 0; i < L.grid.length; i++) if (L.grid[i] >= 20 && L.grid[i] <= 25) slopeCells++;
  const sa = slopeArt(), painted = slopeCells ? slopesPainted(L) : true;
  const m = { id: lv.id, tall, emptyShare, slopeCells, slopePainted: painted, slopeArtOk: sa.ok, slopeArtWhy: sa.why, W, routeTiles, flat: flat.n, flatAt: flat.at, flatShare: flat.long / Math.max(1, end), terrainShare: terrainFlat.long / Math.max(1, end), terrainFlat: terrainFlat.n, terrainFlatAt: terrainFlat.at, routeBands: bands.size, multiShare, gadgetKinds: gadgets.length, gadgetDeveloped: developed.length, gadgets, music, borrowedFrom, shared, trackFile: !!trackFile,
    encountersN: enc.length, bodyDensity, secrets: loot.length, secretEnts, checks, checkSpacing: checks ? routeTiles / checks : Infinity, density, emptyScreens, holes, span, back, pockets, per };
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
    ['route', (m.span >= LIM.routeSpan || m.back >= LIM.routeSpan) && m.pockets >= LIM.branches, 'route spans ' + m.span + ' rows, ' + m.back + ' tiles back, ' + m.pockets + ' branches/pockets (>=' + LIM.branches + ')'],
  ];
  m.bar = bar; m.pass = bar.every(b => b[1]); m.failed = bar.filter(b => !b[1]).map(b => b[0]);
  return m;
}

const args = process.argv.slice(2), ALL = args.includes('--all'), ids = args.filter(a => !a.startsWith('-'));
const isMain = process.argv[1] && import.meta.url.endsWith(process.argv[1].replace(/\\/g, '/').split('/').pop());
if (isMain) {
  const campaign = LEVELS.filter(d => !(d.hidden && !d.secret));
  if (ALL) {
    const cols = ['flat', 'terrain', 'bands', 'mechanics', 'music', 'secrets', 'checks', 'encounters', 'density', 'route'];
    console.log('LEVEL QUALITY, every campaign level (a report: nothing here fails the suite; the gated list is ' + GATE.join(', ') + ')\n');
    console.log('level'.padEnd(12) + 'flat% ground%   bands gadg/dev secr chk dens slope  fails');
    let clear = 0;
    for (const d of campaign) { let m; try { m = measure(d); } catch (e) { console.log(d.id.padEnd(12) + 'could not be measured: ' + e.message); continue; } if (m.pass) clear++;
      console.log(d.id.padEnd(12) + String(Math.round(m.flatShare * 100)).padStart(5) + String(Math.round(m.terrainShare * 100)).padStart(8) + (m.routeBands + '/' + Math.round(m.multiShare * 100) + '%').padStart(9) + (m.gadgetKinds + '/' + m.gadgetDeveloped).padStart(9) + String(m.secrets).padStart(5) + String(m.checks).padStart(5) + (m.tall ? '-' : m.density.toFixed(1)).padStart(5) + (m.slopeCells ? (m.slopePainted ? 'ok' : 'NONE') : '-').padStart(6) + '  ' + (m.pass ? 'PASS' : m.failed.join(','))); }
    console.log('\n' + clear + ' of ' + campaign.length + ' clear the bar. Columns: flat% = share of the route in long flat empty runs (limit ' + LIM.flatShareMax * 100 + '), ground% = share in long level-ground runs (' + LIM.terrainShareMax * 100 + '), bands = height bands on the route / % of width with a second height, gadg/dev = gadget kinds / those in 3+ places, secr = silver+relic off the route, chk = checkpoints, dens = designed encounters a screen.');
    process.exit(0);
  }
  const want = ids.length ? ids : GATE; let failed = 0;
  for (const id of want) {
    const lv = LEVELS.find(l => l.id === id);
    if (!lv) { console.log('== ' + id + ': not built on this branch - skipped' + (GATE.includes(id) ? ' (it is on the gated list: the lane that adds it must clear this bar)' : '')); continue; }
    const m = measure(lv);
    console.log('== ' + id.toUpperCase() + ' (' + m.W + ' columns, route ' + m.routeTiles + ' tiles): ' + (m.pass ? 'CLEARS THE BAR' : 'MISSES THE BAR: ' + m.failed.join(', ')));
    for (const [k, ok, msg] of m.bar) console.log('  ' + (ok ? 'ok   ' : 'FAIL ') + k.padEnd(11) + msg);
    if (!m.pass) failed++;
  }
  console.log(failed ? '\n' + failed + ' level(s) miss the quality bar (docs/LEVEL-QUALITY.md).' : '\nevery gated level clears the quality bar.');
  process.exitCode = failed ? 1 : 0;
}
