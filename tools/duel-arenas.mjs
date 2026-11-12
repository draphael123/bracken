// tools/duel-arenas.mjs - THE DUEL ARENAS (claude/duelarenas; src/duel-arenas.js the data + builders + the bots' climb, src/pvp-duel.js the runtime, src/main.js the level load).
//   NODE ONLY, no browser. Runs the flag-ON proofs here and spawns itself once with 'off' for the flag-OFF identity proofs (the flag is read once at import).
//   ON : per arena (ARENA_CASES): the hidden level builds, walls closed, floor wall to wall, every board reachable (the REAL jump model, src/reach-hero.js, all nine heroes) and
//        supported (a pole / a wall end within reach of every cell, no floating deck), 4 floor spots >= 4 columns apart, the music id exists, foeDoors are open floor, nothing hurts,
//        no level-runtime kit flag; the Pit's level hash is unchanged (mock painter AND the real LEVELS entry); the setting is clean, remembered, cycles, RANDOM never picks a missing arena;
//        the RULES row + the card row; a mock match on the Stockade (spawn spots, banner names the arena, rematch keeps it, goblins from its doors); the bots' climb (hopGoal + a
//        simulated bot, the real movement numbers, reaches the lookout from every start spot); main.js uses pitArt() at the art sites.
//   B (duelarenas-b): THE ROOTWAY HOLLOW (30x18, two spore vents: lift only - main.js vent block read, lift simulated; bots wait for the puff, reach the top with and without them; 4 seats fit the co-op frame) and THE KITCHEN
//        (20x14, solid ceiling, Kitchen Gate art via kgKit proven to paint without the Gate's rooms); both in the picker + RANDOM; THE PIT's own planks stand on posts (draw only).
//   OFF: no `arena` key in the settings, the Pit is the only arena, no extra level is registered, RULES keeps its rows, the bots get no hops.
// node tools/duel-arenas.mjs
import { spawnSync } from 'node:child_process';
import { readFileSync } from 'node:fs';
import { createHash } from 'node:crypto';
import { fileURLToPath } from 'node:url';
const MODE = process.argv[2] === 'off' ? 'off' : 'on';
if (MODE === 'on') { globalThis.__DUELARENAS = true; globalThis.__DUELFOES = true; }
const A = await import('../src/duel-arenas.js');
const PD = await import('../src/pvp-duel.js');
const FD = await import('../src/duel-foes.js');
const { buildDuelPit, DP } = await import('../src/duel-pit.js');
const { LEVELS, T } = await import('../src/level.js');
const { MOVE, HERO_MOVE_IDS } = await import('../src/hero-move.js');
const { heroJumps } = await import('../src/reach-hero.js');
const { musicKnown } = await import('../src/audio.js');
const { runsOf, floating, REACH } = await import('../src/demo-supports.js');
const { makeRoster, RULE_FMT, RULE_ROWS } = await import('../src/duel-roster.js');
const { makeDuel, cleanSettings, loadSettings, saveSettings, botThink, freshBot, rng, DUEL } = PD;
const fails = [], ok = (c, m) => { if (!c) { fails.push(m); console.log('  FAIL ' + m); } else console.log('  ok   ' + m); };
const TS = 16, text = f => readFileSync(fileURLToPath(new URL(f, import.meta.url)), 'utf8');
const PIT_HASH = '6f54950b97f808854666c98463ff6fb202219e70';   /* sha1 of the Pit's built level (mock painter; the real LEVELS entry gives the same) at claude/duelfoes: pinned, the Pit must not change */
const hashOf = L => createHash('sha1').update(JSON.stringify({ ...L, grid: Array.from(L.grid) })).digest('hex');
const levelOf = id => LEVELS.find(l => l.id === A.arenaLevelId(id));

/* ---- a mock game (as tools/duel-foes.mjs), standing in the REAL built arena level ---- */
function mockGame(arenaId, texts) {
  let now = 0, cur = null; const players = [], enemies = [], spawned = [], sfx = [];
  const Lv = levelOf(arenaId).build();
  const mk = (hero, extra = {}) => ({ hero, n: players.length + 1, x: 0, y: 0, down: 0, dead: 0, hp: 100, maxHp: 100, maxSt: 100, st: 100, flasks: 0, face: 1, ...extra });
  const api = { L: () => Lv, players: () => players, time: () => now, TS, P: () => cur,
    asPlayer: (p, fn) => { const w = cur; cur = p; try { return fn(); } finally { cur = w; } }, passOn: () => cur, upright: p => !(p.down > 0) && !(p.dead > 0), enemies: () => enemies, owned: () => [],
    goDown: p => { p.down = 1; }, seatAdd: sp => { if (players.length >= 4) return null; const p = mk(sp.hero, { src: sp.src }); players.push(p); return p; },
    seatDrop: p => { const i = players.indexOf(p); if (i > 0) { players.splice(i, 1); players.forEach((q, k) => { q.n = k + 1; }); } },
    float() {}, callout() {}, hint() {}, sfx: k => sfx.push(k), colourOf: n => ({ c: '#fff', name: 'C' + n }), tagOf: p => 'P' + p.n, heroName: h => String(h).toUpperCase(), heroes: () => [],
    text: (s, x, y) => { if (texts) texts.push(String(s)); }, board() {}, bar() {}, damage: (v, fx, pr) => ({ r: 'hit', landed: pr }), norm: () => 1, hand: () => ({ base: 10, add: 0 }),
    rankOf: p => p === players[0] ? { key: 'slot1', name: 'SAVE 1' } : null, ls: () => null, leave() {}, enter() {}, pressRead: () => ({}), eatPress() {}, keysWrite() {}, pressWrite() {},
    foeSpawn: (col, row, kind, face) => { const e = { t: kind, x: col * TS + 8, y: (row + 1) * TS, face, alive: true, hp: 10 }; enemies.push(e); spawned.push(e); return e; },
    foeProbe: (v, fx, pr) => ({ r: 'hit', landed: pr }) };
  const D = makeDuel(api);
  return { D, api, players, enemies, spawned, sfx, Lv, now: () => now,
    fresh: (settings, o = {}) => { players.length = 0; enemies.length = 0; spawned.length = 0; players.push(mk('knight')); now = 0; return D.begin({ settings, seed: 5, ...o }); },
    step: secs => { for (let i = 0; i < Math.round(secs * 60); i++) { now += 1 / 60; D.tick(1 / 60); } },
    stepTo: t => { while (D.st.m.phase === 'fight' && D.st.m.clock < t - 1e-6) { now += 1 / 60; D.tick(1 / 60); } } };
}
const S = o => cleanSettings({ timeLimit: 0, rounds: 1, ...o });

if (MODE === 'on') {
  console.log('the flag + the registry');
  ok(A.DUEL_ARENAS === true, 'the flag is ON in this process (?duelarenas / __DUELARENAS)');
  ok(A.ARENA_ORDER.join() === 'pit,stockade,rootway,kitchen' && A.ARENA_CHOICES.join() === 'pit,stockade,rootway,kitchen,random', 'the arenas: THE DUEL PIT, THE STOCKADE, THE ROOTWAY HOLLOW, THE KITCHEN; the picker adds RANDOM');
  ok(A.ARENA_ORDER.every(id => A.ARENAS[id].id === id && A.ARENAS[id].name && A.ARENAS[id].line && FD.FOE_ARENAS[id]) && A.ARENAS.pit.name === 'THE DUEL PIT' && A.ARENAS.stockade.name === 'THE STOCKADE', 'every arena has a name, a one-line plain description and foe doors');
  ok(LEVELS.find(l => l.id === 'duel_pit') && ['duel_stockade', 'duel_rootway', 'duel_kitchen'].every((id, i) => LEVELS[LEVELS.length - 3 + i].id === id && LEVELS[LEVELS.length - 3 + i].hidden === true), 'the Stockade, the Rootway Hollow and the Kitchen are each their own HIDDEN level, appended last in that order (saves count levels by index)');
  ok(LEVELS.findIndex(l => l.id === 'highlines') === LEVELS.length - 4, 'nothing before them moved: the High Lines is still the level before them');

  /* ===== per arena ===== */
  const ARENA_CASES = A.ARENA_ORDER;   /* the next slice adds its id to ARENA_ORDER and it is proven here with no new test code */
  for (const id of ARENA_CASES) {
    const AR = A.ARENAS[id], lv = levelOf(id);
    console.log('arena ' + id);
    ok(!!lv && typeof lv.build === 'function', id + ': its level is registered (' + AR.level + ')');
    const L = lv.build(), W = L.W, H = L.H, g = (x, y) => L.grid[y * W + x], F = L.duelPit.floor;
    ok(W === AR.W && H === AR.H && F === AR.floor && L.duelPit.spots.join() === AR.spots.join() && A.arenaOfLevel(L) === id, id + ': it builds ' + W + 'x' + H + ', floor row ' + F + ', and says which arena it is');
    ok(Array.from({ length: F }, (_, y) => [0, 1, W - 2, W - 1].every(x => g(x, y) === T.SOLID)).every(Boolean) && Array.from({ length: W }, (_, x) => g(x, F) === T.SOLID && g(x, H - 1) === T.SOLID).every(Boolean), id + ': walls closed both sides, floored wall to wall');
    if (id === 'kitchen') ok(Array.from({ length: 3 }, (_, y) => Array.from({ length: W }, (_, x) => g(x, y) === T.SOLID).every(Boolean)).every(Boolean) && Array.from({ length: W - 4 }, (_, i) => g(i + 2, 3) === T.AIR).every(Boolean), id + ': a solid low ceiling (rows 0-2 wall to wall) over an open hall - the only closed-lid arena, by design');
    else ok(Array.from({ length: W - 4 }, (_, i) => g(i + 2, 0) === T.AIR).every(Boolean) || id === 'pit', id + ': nothing solid inside the room on the top row (open above, no ceiling trap)');
    ok(L.openYard === true && L.duelPit && L.trial === undefined && L.noCoin === true && !L.ents.some(e => !['deco', 'torch'].concat(id === 'rootway' ? ['vent'] : []).includes(e.t)), id + ': openYard, NO trial flag (co-op stays on), no coin, no foe, no hazard in the ents');
    const bad = ['stkKit', 'stockade', 'rootway', 'wcKit', ...(id === 'kitchen' ? [] : ['kgKit']), 'kitchen', 'lumberKit', 'fenroad', 'arena', 'arenaYard', 'escapeGate', 'night', 'hornetsNest', 'custom', 'colosseum'].filter(k => L[k] !== undefined);
    ok(bad.length === 0, id + ': no level-runtime kit flag is set (' + (bad.join() || 'none') + ')');
    /* the floor spots */
    const sp = L.duelPit.spots; let apart = 99; for (let i = 0; i < sp.length; i++) for (let j = i + 1; j < sp.length; j++) apart = Math.min(apart, Math.abs(sp[i] - sp[j]));
    ok(sp.length === 4 && apart >= 4 && sp.every(c => c > 1 && c < W - 2 && g(c, F - 1) === T.AIR && g(c, F - 2) === T.AIR && g(c, F) === T.SOLID), id + ': 4 start spots on open floor, >= 4 columns apart (' + sp.join('/') + ', min gap ' + apart + ')');
    ok(musicKnown(L.music) && L.music === AR.music && !musicKnown(L.music + 'x'), id + ': the music id "' + L.music + '" exists (audio.js musicKnown)');
    const doors = FD.foeDoorCols(W, id);
    ok(doors.length >= 2 && doors.every(c => c >= 2 && c <= W - 3 && g(c, F - 1) === T.AIR && g(c, F - 2) === T.AIR && g(c, F) === T.SOLID) && (id === 'pit' || doors.join() === L.duelPit.foeDoors.map(c => c < 0 ? W + c : c).join()), id + ': foeDoors (cols ' + doors.join() + ') are open floor inside the walls');
    ok(FD.FOE_ARENAS[id].kinds.length === FD.FOE_ARENAS[id].weights.length && Math.abs(FD.FOE_ARENAS[id].weights.reduce((a, b) => a + b, 0) - 1) < 1e-9 && FD.FOE_ARENAS[id].kinds.every(k => ['sprig', 'shield', 'archer', 'hound', 'javelin'].includes(k)), id + ': goblin kinds are Act 1 fodder (' + FD.FOE_ARENAS[id].kinds.join('/') + ') and the weights sum to 1');
    /* the boards: runs of board tiles */
    const rows = []; for (let y = 0; y < H; y++) { let x = 0; while (x < W) { if (g(x, y) === T.ONEWAY || g(x, y) === T.PLANK) { let e = x; while (e + 1 < W && (g(e + 1, y) === T.ONEWAY || g(e + 1, y) === T.PLANK)) e++; rows.push({ y, x0: x, x1: e }); x = e + 1; } else x++; } }
    ok(rows.length >= 2, id + ': ' + rows.length + ' board runs: ' + rows.map(r => 'r' + r.y + ' x' + r.x0 + '-' + r.x1).join(', '));
    ok(AR.hops.length === 0 || (AR.hops[0][0] === F && AR.hops.length === rows.length + 1 && rows.every(r => AR.hops.some(h => h[0] === r.y && h[1] === r.x0 && h[2] === r.x1))), id + ': hops (the bots\' climbing map) match the built boards (' + AR.hops.length + ' footings)');
    /* REACH: the real jump model (src/reach-hero.js), a standing jump from the edge, every hero */
    const reachFor = hero => { const J = heroJumps(hero), fl = J.fly(J.run(1)), seen = new Set(), surf = [{ y: F, x0: 2, x1: W - 3 }, ...rows]; seen.add(surf[0]); let grew = true;
      while (grew) { grew = false; for (const U of rows) { if (seen.has(U)) continue; for (const Sx of seen) { const k = Sx.y - U.y; if (k < 1) continue; const up = fl.up[k]; if (up === null || up === undefined || up < 0) continue; const gap = Math.max(0, U.x0 - Sx.x1 - 1, Sx.x0 - U.x1 - 1); if (gap === 0 || up >= gap * TS + 4) { seen.add(U); grew = true; break; } } } }
      return { all: rows.every(r => seen.has(r)), rise: fl.rise, up3: fl.up[3] }; };
    if (id === 'pit') {   /* the Pit's own old rule (a 3-row rise, a gap up to 3 columns: tools/pvp-duel.mjs): unchanged, only restated */
      const reach = new Set([F]); let gr = true; while (gr) { gr = false; for (const r of rows) if (!reach.has(r.y) && [...reach].some(h => h - r.y <= 3 && h - r.y >= 1 && (h === F || rows.some(q => q.y === h && q.x1 + 4 >= r.x0 && q.x0 - 4 <= r.x1)))) { reach.add(r.y); gr = true; } }
      ok(rows.every(r => reach.has(r.y)), id + ': every plank is a jump from the floor or another plank (the Pit\'s old rule)'); }
    else {
      const res = HERO_MOVE_IDS.map(h => [h, reachFor(h)]);
      ok(res.every(([, r]) => r.all), id + ': EVERY board is reachable by the base jump from a standing take-off, all nine heroes (apex ' + res[0][1].rise.toFixed(1) + ' px, a 3-row rise lands up to ' + res[0][1].up3.toFixed(1) + ' px along)');
      const tiers = new Set(rows.map(r => r.y)); ok([...tiers].every(y => rows.concat([{ y: F }]).filter(r => r.y > y && r.y - y <= 3).length > 0), id + ': every tier is a flat jump (<= 3 rows) over another footing: none out of reach of the one below');
      const low = rows.filter(r => r.y > F - 4); ok(rows.every(r => F - r.y >= 3), id + ': no board is a step (every one is at least a flat jump up from the floor)');
      /* STAGGER: no board can be reached from the floor except the lowest tier (the climb has stages) */
      const J = heroJumps('knight'), floorReach = rows.filter(r => F - r.y <= Math.floor(J.fly(J.run(1)).rise / TS)); ok(floorReach.every(r => r.y === Math.max(...rows.map(q => q.y))), id + ': from the floor only the lowest tier is a jump: the rest is climbed tier by tier'); }
    /* SUPPORT: nothing floats */
    const runs = runsOf(L, T), flt = runs.filter(floating);
    if (id === 'pit') console.log('  info the Pit planks by the same measure: ' + runs.map(r => 'r' + r.y + ' ' + r.anchors + ' anchors').join(', ') + ' (the arena set draws its own oak stands; not touched: the Pit must draw identically)'); else
    ok(runs.length === rows.length && flt.length === 0 && runs.every(r => r.anchors >= 1 && r.worst <= REACH), (id === 'pit' ? 'THE PIT OWN planks are not measured here (arena-set art, unchanged): ' : '') + id + ': nothing floats - every deck has a pole / wall end within ' + REACH + ' columns of every cell (' + runs.map(r => 'r' + r.y + ': ' + r.anchors + ' anchors, worst ' + r.worst).join('; ') + ')');
    const poles = (L.routeSupports || []);
    if (id !== 'kitchen') ok(poles.every(p => rows.some(r => r.y === p.y && p.x >= r.x0 && p.x <= r.x1) && p.bottom > p.y + 1 && (g(p.x, p.bottom) === T.SOLID || rows.some(r => r.y === p.bottom && p.x >= r.x0 && p.x <= r.x1)) && Array.from({ length: p.bottom - p.y - 1 }, (_, i) => g(p.x, p.y + 1 + i)).every(t => t !== T.SOLID)), id + ': every pole (' + poles.length + ') stands under a board, runs down past no solid ground (a board it is lashed through is fine), and ends ON the floor or the board a tier down');
    const POLE_KIND = { stockade: 'stkpost', rootway: 'root', kitchen: 'demo' }, PAL_OK = { stockade: P => P.dress === 'camp' && P.ledges === 'lashed' && P.sky === 'night', rootway: P => P.myc === true && P.dress === 'myc' && P.near === 'mushroom' && !P.ledges, kitchen: P => P.hall === true && P.dress === 'none' && P.ledges === 'beam' };
    ok(id === 'pit' || poles.every(p => p.kind === POLE_KIND[id]), id + ': supports are the arena\'s own kind (' + POLE_KIND[id] + ': stkpost = src/redraw/stockade2_art.js, root = the Rootway\'s FOREST_KIT roots, demo = src/demo-supports-art.js braces + trestle)');
    ok(id === 'pit' || PAL_OK[id](L.palette), id + ': palette only (' + (id === 'pit' ? '-' : Object.keys(L.palette).join('/')) + ')');
  }

  console.log('the Pit is unchanged');
  { const painter = (W, H) => { const grid = new Uint8Array(W * H), ents = [], set = (x, y, v) => { if (x >= 0 && y >= 0 && x < W && y < H) grid[y * W + x] = v; }; return { W, H, grid, ents, set, block: (a, b, c, d) => { for (let y = c; y <= d; y++) for (let x = a; x <= b; x++) set(x, y, 1); }, plat: (x, y, l) => { for (let i = 0; i < l; i++) set(x + i, y, 2); }, ent: (t, x, y, e = {}) => ents.push({ t, x, y, ...e }) }; };
    ok(hashOf(buildDuelPit({ painter, T: { AIR: 0, SOLID: 1, ONEWAY: 2 } })) === PIT_HASH, 'the Pit built with the mock painter hashes to the pinned value (' + PIT_HASH.slice(0, 12) + ')');
    const real = LEVELS.find(l => l.id === 'duel_pit').build(); ok(hashOf(real) === PIT_HASH, 'the REAL registered duel_pit (after every level wrapper) hashes to the same value: no field, no tile, no entity changed');
    ok(real.duelPit.kit === undefined && A.arenaOfLevel(real) === 'pit', 'the Pit\'s duelPit object is untouched (no kit field): pitArt() reads it as the arena set'); }

  console.log('settings: the ARENA setting');
  { ok(cleanSettings(null).arena === 'pit' && PD.defaultSettings().arena === 'pit', 'default: THE DUEL PIT');
    ok(A.ARENA_CHOICES.every(v => cleanSettings({ arena: v }).arena === v) && cleanSettings({ arena: 'moon' }).arena === 'pit' && cleanSettings({ arena: 5 }).arena === 'pit' && cleanSettings({ arena: null }).arena === 'pit', 'every choice survives cleaning; anything else is the Pit');
    ok(PD.SETTING_CHOICES.arena.join() === 'pit,stockade,rootway,kitchen,random', 'the choice list the rows cycle: pit, stockade, rootway, kitchen, random');
    const store = {}, ls = { getItem: k => store[k] ?? null, setItem: (k, v) => { store[k] = v; } };
    saveSettings(ls, 'slot1', cleanSettings({ arena: 'stockade', lives: 3 })); ok(loadSettings(ls, 'slot1').arena === 'stockade' && loadSettings(ls, 'slot1').lives === 3, 'remembered per save slot (stockade, with the other settings)'); ok(loadSettings(ls, 'slot2').arena === 'pit', '...another slot has the Pit');
    saveSettings(ls, 'slot1', cleanSettings({ arena: 'random' })); ok(loadSettings(ls, 'slot1').arena === 'random', 'RANDOM is remembered as RANDOM (it is resolved at match start, never stored as a pick)');
    ls.setItem('bracken.duelSettings', JSON.stringify({ v: 1, slots: { slot3: { lives: 2, goblins: 'few' } } })); ok(loadSettings(ls, 'slot3').arena === 'pit' && loadSettings(ls, 'slot3').lives === 2, 'an old save (no arena) loads clean: the Pit');
    const g = mockGame('pit'); g.fresh(S({})); const seq = []; for (let i = 0; i < 5; i++) { g.D.cycleOpt('arena', 1); seq.push(g.D.getSettings().arena); } ok(seq.join() === 'stockade,rootway,kitchen,random,pit', 'cycleOpt(arena) walks THE DUEL PIT -> STOCKADE -> ROOTWAY HOLLOW -> KITCHEN -> RANDOM -> THE DUEL PIT (' + seq.join() + ')'); g.D.cycleOpt('arena', -1); ok(g.D.getSettings().arena === 'random', '...and back');
    ok(A.arenaName('pit') === 'THE DUEL PIT' && A.arenaName('stockade') === 'THE STOCKADE' && A.arenaName('rootway') === 'THE ROOTWAY HOLLOW' && A.arenaName('kitchen') === 'THE KITCHEN' && A.arenaName('random') === 'RANDOM' && A.ARENA_CHOICES.every(c => RULE_FMT.arena(c) === A.arenaName(c)), 'the picker names match src/duel-arenas.js (RULE_FMT.arena is a copy: no import in the roster)');
    ok(A.ARENA_CHOICES.every(c => A.arenaLine(c).length > 20 && A.arenaLine(c).length <= 52 && /^[A-Z0-9 .,'-]+$/.test(A.arenaLine(c))), 'each plain-words line is one short sentence in capitals (' + A.ARENA_CHOICES.map(c => A.arenaLine(c).length).join('/') + ' chars: textfit owed on the 196 px card / 300 px roster line)'); }

  console.log('RANDOM never picks a missing arena');
  { const have = new Set(A.ARENA_ORDER); const seen = {}; const r = rng(3); for (let i = 0; i < 4000; i++) { const a = A.resolveArena('random', r, id => have.has(id)); seen[a] = (seen[a] || 0) + 1; }
    ok(['pit', 'stockade', 'rootway', 'kitchen'].every(a => seen[a] > 800) && Object.keys(seen).length === 4, 'RANDOM covers all four built arenas about evenly (' + JSON.stringify(seen) + ')');
    ok(A.resolveArena('random', () => 0) === 'pit' && A.resolveArena('random', () => 0.9999999) === 'kitchen' && A.resolveArena('random', () => 1) === 'kitchen' && A.resolveArena('random', () => 0.3) === 'stockade' && A.resolveArena('random', () => 0.6) === 'rootway', 'the edges of the roll land on a built arena, each quarter on its own');
    ok(Array.from({ length: 500 }, (_, i) => A.resolveArena('random', rng(i + 1), id => id !== 'stockade')).every(a => a !== 'stockade'), 'with the Stockade\'s level missing RANDOM never picks it (500 rolls)');
    ok(A.resolveArena('random', Math.random, () => false) === 'pit' && A.resolveArena('stockade', Math.random, id => id !== 'stockade') === 'pit' && A.resolveArena('moon') === 'pit' && A.resolveArena(undefined) === 'pit' && A.resolveArena('stockade') === 'stockade' && A.resolveArena('pit') === 'pit', 'a named arena that is missing, an unknown name, nothing: the Pit; a built name stays'); }

  console.log('the RULES tab + the tavern card');
  { const calls = []; let rr = 0; const T2 = (s, x, y, c, a, z) => calls.push({ s: String(s), x, y, z });
    const ctxOf = (foes, arenas) => ({ get heroes() { return ['knight', 'warden']; }, heroName: h => h.toUpperCase(), owns: () => true, humans: () => [{ n: 1, ai: false, hero: 'knight' }], colourOf: () => ({ c: '#fff' }), getSettings: () => cleanSettings({ arena: 'stockade' }), setSettings() {}, setSeat() {}, setSeatCount() {}, cycleOpt: (id, d) => { calls.push({ cyc: id, d }); return true; }, submit() {}, close() {}, sfx() {},
      text: T2, board() {}, icon() {}, rect() {}, frame() {}, fit: s => s, inkW: s => String(s).length * 5, key: a => a, foes: () => foes, arenas: () => arenas, ruleLine: (id, S0) => id === 'arena' ? A.arenaLine(S0.arena) : 'LINE' });
    for (const [foes, arenas, want] of [[true, true, 10], [false, true, 8], [true, false, 9], [false, false, 7]]) { calls.length = 0; const R = makeRoster(ctxOf(foes, arenas)); R.open(); R.R.tab = 1; R.draw(320, 180);
      const hits = R.R.hits.filter(h => h.k === 'rule'); ok(hits.length === want, 'RULES rows with foes=' + foes + ' arenas=' + arenas + ': ' + hits.length + ' (want ' + want + ')');
      const names = calls.filter(c => /^[> ] [A-Z ]+$/.test(c.s)); if (arenas) { ok(names[0] && names[0].s.endsWith('ARENA') && calls.some(c => c.s === '< THE STOCKADE >'), '...ARENA is the first row and shows < THE STOCKADE >'); const last = names[names.length - 1]; ok(last.y + 9 <= 180 - 27 - 1 || last.y + 9 <= 152, '...the last row (y ' + last.y + ') clears the plain-words line (y 153)'); R.R.rrow = 0; calls.length = 0; R.draw(320, 180); ok(calls.some(c => c.s === A.arenaLine('stockade') && c.y >= 150), '...with the ARENA row selected the one-line description is under the rows'); }
      else ok(!calls.some(c => /ARENA/.test(c.s)), '...no ARENA row at all'); } }

  console.log('a match on the Stockade (mock game, the real built level)');
  { const texts = []; const g = mockGame('stockade', texts), D = g.D; ok(g.fresh(S({ arena: 'stockade' }), { seats: 4 }), 'begin() runs in the Stockade level with 4 seats');
    ok(D.debug().arena && D.debug().arena.id === 'stockade' && D.debug().arena.random === false, 'the match knows its arena (stockade, not random)');
    ok(g.players.map(p => Math.round((p.x - 8) / TS)).join() === '4,19,8,15' && g.players.every(p => p.y === 19 * TS), 'round start: the four seats stand on the floor at cols 4 / 19 / 8 / 15 (floor row 19)');
    texts.length = 0; D.drawHud(320, 180); ok(texts.includes('THE STOCKADE') && !texts.some(t => t.includes('RANDOM')), 'the count names the arena');
    g.step(DUEL.round.count + 0.1); texts.length = 0; D.drawHud(320, 180); ok(texts.includes('FIGHT!') && texts.includes('THE STOCKADE'), 'the FIGHT banner names the arena');
    D.st.cfg.teams = false; D.rematch(); ok(D.debug().arena.id === 'stockade' && g.Lv === g.api.L(), 'rematch keeps the arena (same level, same arena id)');
    /* respawn on the arena's own spots */
    D.st.seats.forEach(p => { p.duelLives = 2; }); }
  { const texts = []; const g = mockGame('stockade', texts), D = g.D; g.fresh(S({ arena: 'random' })); texts.length = 0; D.drawHud(320, 180); ok(D.debug().arena.random === true && texts.includes('THE STOCKADE (RANDOM)'), 'a RANDOM pick shows as "THE STOCKADE (RANDOM)" on the banner'); }
  { const g = mockGame('stockade'), D = g.D; g.fresh(S({ goblins: 'many' })); g.step(DUEL.round.count + 0.1); g.stepTo(12); const near = g.spawned.length;
    ok(near === 0 && D.debug().foe.pend === 0, 'seats on cols 4 / 19 are 2 tiles from the doors (2 / 21): no goblin yet (needs >= 3 tiles)'); g.players[0].x = 10 * TS + 8; g.players[1].x = 13 * TS + 8; g.stepTo(14); ok(g.spawned.length === 1 && [2 * TS + 8, 21 * TS + 8].includes(g.spawned[0].x) && g.spawned[0].y === 19 * TS, 'once a seat is clear a goblin walks in at a Stockade door (col ' + (g.spawned[0] && (g.spawned[0].x - 8) / TS) + ') on the floor');
    const kinds = new Set(); const r = rng(9); for (let i = 0; i < 400; i++) kinds.add(FD.foeKind(r(), 'stockade')); ok([...kinds].sort().join() === 'archer,hound,sprig', 'the Stockade\'s goblins are sprig / archer / hound (' + [...kinds].sort().join() + ')'); }

  console.log('the bots climb (hops)');
  { const hops = A.ARENAS.stockade.hops, me = (x, y, ground = true) => ({ x: x * TS + 8, y: y * TS, ground });
    ok(A.hopGoal(me(10, 19), { x: 12 * TS, y: 7 * TS }, hops).row === 16 && A.hopGoal(me(4, 19), { x: 12 * TS, y: 7 * TS }, hops).jump === true, 'on the floor, foe on the lookout: the next board is the low tier (row 16); under it already (col 4) -> jump');
    { const gg = A.hopGoal(me(10, 19), { x: 12 * TS, y: 7 * TS }, hops); ok(gg.jump === false && gg.tx < 10 * TS + 8 && gg.tx >= 2 * TS, 'from col 10 it walks to the nearest low board\'s span (tx col ' + (gg.tx / TS | 0) + ')'); }
    ok(A.hopGoal(me(4, 16), { x: 12 * TS, y: 7 * TS }, hops).row === 13, 'on a low ledge it takes the shelf (row 13)'); ok(A.hopGoal(me(12, 13), { x: 12 * TS, y: 7 * TS }, hops).row === 10, 'on the shelf it takes a high ledge (row 10), then the lookout');
    ok(A.hopGoal(me(10, 10), { x: 12 * TS, y: 7 * TS }, hops).row === 7 && A.hopGoal(me(10, 10), { x: 12 * TS, y: 7 * TS }, hops).jump && A.hopGoal(me(9, 10), { x: 12 * TS, y: 7 * TS }, hops).jump === false, 'on the high ledge under the lookout edge (col 10) it jumps to it; one column off it walks over first');
    ok(A.hopGoal(me(10, 19), { x: 12 * TS, y: 17 * TS }, hops) === null && A.hopGoal(me(10, 13), { x: 12 * TS, y: 19 * TS }, hops) === null && A.hopGoal(me(10, 19, false), { x: 12 * TS, y: 7 * TS }, hops) === null && A.hopGoal(me(10, 19), { x: 12 * TS, y: 7 * TS }, []) === null && A.hopGoal(me(10, 19), { x: 12 * TS, y: 7 * TS }, undefined) === null, 'nothing to climb: foe about level, foe below, in the air, no hops (the Pit) -> null'); }
  { /* A SIMULATED BOT with the game's own movement numbers (src/hero-move.js): walks, jumps through the one-way boards, lands, until it stands on the lookout */
    const L = levelOf('stockade').build(), W = L.W, g = (x, y) => L.grid[y * W + x], F = L.duelPit.floor, hops = L.duelPit.hops;
    const boardAt = (cx, row) => g(Math.floor(cx / TS), row) === T.ONEWAY;
    const run = (spot, seed, diff, useHops) => { const r = rng(seed), s = freshBot(diff), foe = { x: 12 * TS, y: 7 * TS, atk: -1, plunge: false }, b = { x: spot * TS + 8, y: F * TS, vx: 0, vy: 0, ground: true, jumpHeld: 0 }; let t = 0, top = F * TS;
      for (let i = 0; i < 180 * 60; i++) { t = i / 60; const o = botThink({ x: b.x, y: b.y, vx: b.vx, face: 1, ground: b.ground, atk: -1, hero: 'knight' }, foe, s, r, 1 / 60, useHops ? hops : undefined);
        const dir = (o.keys.right ? 1 : 0) - (o.keys.left ? 1 : 0), cap = MOVE.RUN, acc = b.ground ? MOVE.ACC_GROUND : MOVE.ACC_AIR;
        if (dir) { b.vx += dir * acc / 60; b.vx = Math.max(-cap, Math.min(cap, b.vx)); } else { const f = (b.ground ? MOVE.FRIC_GROUND : MOVE.FRIC_AIR) / 60; b.vx = Math.abs(b.vx) <= f ? 0 : b.vx - Math.sign(b.vx) * f; }
        if (o.press.jump && b.ground) { b.vy = MOVE.JUMPV; b.ground = false; }
        const apex = Math.abs(b.vy) < MOVE.APEX_VY, gk = apex ? MOVE.APEX_G : b.vy < 0 ? 1 : MOVE.FALL_G; if (!b.ground) { b.vy += MOVE.GRAV / 60 * gk; if (b.vy > MOVE.MAX_FALL) b.vy = MOVE.MAX_FALL; }
        b.x = Math.max(2 * TS + 5, Math.min((W - 2) * TS - 5, b.x + b.vx / 60)); const y0 = b.y; if (!b.ground) b.y += b.vy / 60;
        if (!b.ground && b.vy > 0) { const rowTop = Math.floor(y0 / TS), rowEnd = Math.floor(b.y / TS); for (let row = rowTop; row <= rowEnd + 1; row++) { const topY = row * TS; if (y0 <= topY + 1e-6 && b.y >= topY && (row === F || boardAt(b.x, row))) { b.y = topY; b.vy = 0; b.ground = true; break; } } }
        if (b.ground && !(b.y === F * TS) && !boardAt(b.x, Math.round(b.y / TS))) b.ground = false;   /* walked off an edge */
        top = Math.min(top, b.y); if (b.y <= 7 * TS + 0.5 && b.ground) return { t, ok: true }; }
      return { t, ok: false, top }; };
    const res = []; for (const spot of A.ARENAS.stockade.spots) for (const seed of [1, 2, 3, 4]) for (const diff of ['normal', 'easy']) res.push({ spot, seed, diff, ...run(spot, seed * 17, diff, true) });
    const wins = res.filter(r => r.ok), tmax = Math.max(...wins.map(r => r.t));
    const nmax = Math.max(...res.filter(r => r.diff === 'normal').map(r => r.t)); ok(nmax <= 20, 'a NORMAL bot gets there inside 20 s from every spot (slowest ' + nmax.toFixed(1) + ' s)');
    ok(wins.length === res.length, 'a simulated bot (real movement numbers) reaches the LOOKOUT from every start spot, normal and easy, 4 seeds: ' + wins.length + '/' + res.length + ' (slowest ' + tmax.toFixed(1) + ' s, median ' + wins.map(r => r.t).sort((a, b) => a - b)[wins.length >> 1].toFixed(1) + ' s)');
    const ctl = []; for (const spot of [4, 19]) ctl.push(run(spot, 5, 'normal', false)); console.log('  info the same bot WITHOUT hops: ' + ctl.map(r => r.ok ? 'reached in ' + r.t.toFixed(1) + ' s' : 'never got above row ' + (r.top / TS).toFixed(1)).join(' / '));
    /* the Pit's bot is exactly the old bot: hops undefined or [] change nothing */
    const a = rng(4), b = rng(4), sa = freshBot('normal'), sb = freshBot('normal'); let same = true; for (let i = 0; i < 3000; i++) { const me2 = { x: 100 + (i % 50), y: 272, vx: 0, face: 1, ground: true, atk: -1, hero: 'knight' }, foe2 = { x: 200 - (i % 70), y: 272 - ((i >> 4) % 3) * 48, atk: i % 40 < 14 ? 0 : -1 }; const o1 = botThink(me2, foe2, sa, a, 1 / 60), o2 = botThink(me2, foe2, sb, b, 1 / 60, []); if (JSON.stringify(o1) !== JSON.stringify(o2)) same = false; }
    ok(same, 'no hops ([] or undefined) = the old bot, step for step (3000 steps)'); }

  console.log('arenas B: THE ROOTWAY HOLLOW + THE KITCHEN (mock matches, the real built levels)');
  for (const id of ['rootway', 'kitchen']) {
    const AR = A.ARENAS[id], F = AR.floor, spots = AR.spots.join();
    { const texts = []; const g = mockGame(id, texts), D = g.D; ok(g.fresh(S({ arena: id }), { seats: 4 }), id + ': begin() runs in its level with 4 seats');
      ok(D.debug().arena && D.debug().arena.id === id && D.debug().arena.random === false, id + ': the match knows its arena');
      ok(g.players.map(p => Math.round((p.x - 8) / TS)).join() === spots && g.players.every(p => p.y === F * TS), id + ': round start: the four seats stand on the floor at cols ' + spots + ' (floor row ' + F + ')');
      texts.length = 0; D.drawHud(320, 180); ok(texts.includes(AR.name) && !texts.some(t => t.includes('RANDOM')), id + ': the count names the arena (' + AR.name + ')');
      g.step(DUEL.round.count + 0.1); texts.length = 0; D.drawHud(320, 180); ok(texts.includes('FIGHT!') && texts.includes(AR.name), id + ': the FIGHT banner names the arena');
      D.st.cfg.teams = false; D.rematch(); ok(D.debug().arena.id === id && g.Lv === g.api.L(), id + ': rematch keeps the arena'); }
    { const texts = []; const g = mockGame(id, texts), D = g.D; g.fresh(S({ arena: 'random' })); texts.length = 0; D.drawHud(320, 180); ok(D.debug().arena.random === true && texts.includes(AR.name + ' (RANDOM)'), id + ': a RANDOM pick shows as "' + AR.name + ' (RANDOM)" on the banner'); }
    { const g = mockGame(id), D = g.D, doors = FD.foeDoorCols(AR.W, id); g.fresh(S({ goblins: 'many' })); g.step(DUEL.round.count + 0.1); g.stepTo(12);
      const free = doors.filter(c => FD.doorFree(c, g.players.map(p => p.x), TS)), tiles = doors.map(c => Math.min(...g.players.map(p => Math.abs(p.x - (c * TS + 8)) / TS)));
      if (id === 'rootway') ok(free.length === 2 && (g.spawned.length > 0 || D.debug().foe.pend > 0), id + ': seats are exactly 3 tiles from the doors (' + tiles.join('/') + ' tiles): both doors qualify at once, a goblin is told / in by 12 s (' + g.spawned.length + ' in, ' + D.debug().foe.pend + ' told)');
      else { ok(free.length === 0 && g.spawned.length === 0 && D.debug().foe.pend === 0, id + ': seats at ' + spots + ' are ' + tiles.join('/') + ' tiles from the doors (' + doors.join('/') + '): no goblin yet (the >= 3 tiles rule; the hall is 16 columns wide)');
        g.players[0].x = 8 * TS + 8; g.players[1].x = 10 * TS + 8; g.stepTo(14); ok(g.spawned.length === 1 && doors.map(c => c * TS + 8).includes(g.spawned[0].x) && g.spawned[0].y === F * TS, id + ': once the seats are clear a goblin walks in at a door (col ' + (g.spawned[0] && (g.spawned[0].x - 8) / TS) + ') on the floor'); }
      ok(FD.doorFree(doors[0], [8 * TS + 8, 9 * TS + 8, 10 * TS + 8, 11 * TS + 8], TS) && FD.doorFree(doors[1], [8 * TS + 8, 9 * TS + 8, 10 * TS + 8, 11 * TS + 8], TS), id + ': the >= 3 tiles door rule is satisfiable (seats mid-floor: both doors free)');
      const kinds = new Set(); const r = rng(9); for (let i = 0; i < 400; i++) kinds.add(FD.foeKind(r(), id)); ok([...kinds].sort().join() === (id === 'rootway' ? 'javelin,sprig' : 'shield,sprig'), id + ': the goblins are ' + [...kinds].sort().join(' + ')); }
  }

  console.log('THE ROOTWAY HOLLOW: the spore vents lift and never hurt');
  { const L = levelOf('rootway').build(), F = L.duelPit.floor, V = L.ents.filter(e => e.t === 'vent'), W = L.W, m = text('../src/main.js');
    ok(V.length === 2 && V.every((e, i) => e.x === A.ROOT.VENTS[i].col && e.y === F - 1) && L.ents.length === 2, 'exactly two ents, both vents, standing on the floor (cols ' + V.map(e => e.x).join('/') + ')');
    const KEYS = ['t', 'x', 'y', 'period', 'on', 'h', 'phase']; ok(V.every(e => Object.keys(e).every(k => KEYS.includes(k))), 'a vent carries only t / x / y / period / on / h / phase: no heat, ember, glass, incense, gale, rune, thermal, crevice, wind, shaft, snuff or arena flag (' + Object.keys(V[0]).join('/') + ')');
    const a = m.indexOf("if (pr.t === 'vent') { // an updraft of spores on a timer"), b = m.indexOf("if (pr.t === 'roller' && pr.alive)", a); const blk = m.slice(a, b);
    ok(a > 0 && b > a && blk.length < 6000, 'main.js: the vent block is found (' + blk.length + ' chars)');
    const bare = blk.replace(/\/\/[^\n]*/g, '').replace(/\/\*[\s\S]*?\*\//g, '');
    ok(!/damagePlayer|DMG\.|hurt|\.hp\b|kill|die\(|P\.inv|stagger|ouch|poison|slow|stun/i.test(bare.replace(/pr\.heat|pr\.glass|pr\.incense|pr\.ember/g, '')), 'main.js: the vent block calls no damage / hurt / hp / kill / stun path (the only things it writes on a body: vy, ground, canCut, plunge)');
    const mut = [...bare.matchAll(/\bP\.([a-zA-Z]+)\s*=(?!=)/g)].map(x => x[1]).filter((v, i, a2) => a2.indexOf(v) === i).sort(); ok(mut.join() === 'canCut,ground,plunge,vy', 'main.js: the vent writes only P.vy / ground / canCut / plunge (' + mut.join() + ')');
    const sl = m.slice(m.indexOf('(duelarenas-b) THE ROOTWAY HOLLOW'), m.indexOf('(duelarenas-b) THE ROOTWAY HOLLOW') + 1) ; const seatLine = m.split('\n').find(l => l.includes('(duelarenas-b) THE ROOTWAY HOLLOW')) || '';
    ok(/DUEL_ARENAS && L\.duelPit/.test(seatLine) && !/damagePlayer|\.hp\b|DMG/.test(seatLine.replace(/\/\*.*$/, '')) && [...seatLine.replace(/\/\*.*$/, '').matchAll(/\bq\.([a-zA-Z]+)\s*=(?!=)/g)].map(x => x[1]).sort().join() === 'canCut,ground,plunge,vy', 'main.js: the lift for the OTHER seats (updateProps runs once, for player one) is flag + duel gated and writes only vy / ground / canCut / plunge');
    /* the lift, as the game does it: while a body is inside an active column its vy is held at <= -190; out of the top it coasts and falls (src/hero-move.js numbers) - from the floor and from the long root it must land on the crown, never above the room */
    const boardAt = (x, row) => L.grid[row * W + Math.floor(x / TS)] === T.ONEWAY;
    const lift = (x0, y0, phase0) => { const v = A.ROOT.VENTS[0], vx = v.col * TS + 8, vy0 = v.floor * TS; let x = x0, y = y0, vy = 0, ground = true, minY = y, t = 0, landed = null;
      for (let i = 0; i < 12 * 60; i++) { t = i / 60; const on = (((t + phase0) % v.period) + v.period) % v.period < v.on;
        if (on && Math.abs(x - vx) < 13 && y <= vy0 + 2 && y > vy0 - v.h) { vy = Math.min(vy, -190); ground = false; }
        if (!ground) { const gk = Math.abs(vy) < MOVE.APEX_VY ? MOVE.APEX_G : vy < 0 ? 1 : MOVE.FALL_G; vy = Math.min(MOVE.MAX_FALL, vy + MOVE.GRAV / 60 * gk); const yy = y; y += vy / 60;
          if (vy > 0) for (let row = Math.floor(yy / TS); row <= Math.floor(y / TS) + 1; row++) if (yy <= row * TS + 1e-6 && y >= row * TS && (row === v.floor || boardAt(x, row))) { y = row * TS; vy = 0; ground = true; landed = row; break; } }
        minY = Math.min(minY, y); if (landed !== null && t > 0.3 && landed < v.floor) break; if (ground && !on && t > 6) break; }
      return { landed, minY, t }; };
    const fromFloor = [0, 0.7, 1.4, 2.5, 3.9].map(p => lift(A.ROOT.VENTS[0].col * TS + 8, A.ROOT.FLOOR * TS, p)), fromRoot = lift(A.ROOT.VENTS[0].col * TS + 8, 9 * TS, 0);
    ok(fromFloor.every(r => r.landed === 6 || r.landed === 9) && [fromFloor[0], fromFloor[1], fromFloor[3], fromFloor[4]].every(r => r.landed === 6) && fromFloor[2].landed === 9 && fromFloor.every(r => r.minY > 3 * TS), 'a body on the floor over a vent at the START of a puff (>= 0.8 s of it left) is carried through the long root and lands on the CROWN (row 6, apex ' + Math.min(...fromFloor.map(r => r.minY)).toFixed(0) + ' px, row 6 top is 96); caught 1.4 s in, with 0.6 s left, it only reaches the long root (row ' + fromFloor[2].landed + '); never into the roof');
    ok(fromRoot.landed === 6, 'a body on the long root over a vent in a puff is lifted to the crown too (landed row ' + fromRoot.landed + ')');
    const off = lift(5 * TS + 8, A.ROOT.FLOOR * TS, 0); ok(off.landed === null || off.landed === A.ROOT.FLOOR, 'a body away from the vent columns is never lifted');
    const idle = lift(A.ROOT.VENTS[0].col * TS + 8, A.ROOT.FLOOR * TS, 3); ok(idle.minY >= A.ROOT.FLOOR * TS - 1 || idle.landed !== null, 'sanity: the lift is timed (a body standing there between puffs waits)');
  }

  console.log('the bots reach the top shelf, with and without the vents');
  { const SIM = (id, spot, seed, diff, o) => { const L = levelOf(id).build(), W = L.W, g = (x, y) => L.grid[y * W + x], F = L.duelPit.floor, hops = L.duelPit.hops, VS = L.duelPit.vents || [], topRow = Math.min(...hops.map(h => h[0])), tb = o.foe;
      const boardAt = (cx, row) => g(Math.floor(cx / TS), row) === T.ONEWAY, r = rng(seed), s = freshBot(diff), foe = { x: tb * TS + 8, y: topRow * TS, atk: -1, plunge: false }, b = { x: spot * TS + 8, y: F * TS, vx: 0, vy: 0, ground: true };
      const t0 = r() * 5; let t = 0, lifts = 0, waited = 0, wasLifted = false, jumpsOnVent = 0;
      for (let i = 0; i < 180 * 60; i++) { t = i / 60; const ventWaitBefore = !!s.ventWait, o2 = botThink({ x: b.x, y: b.y, vx: b.vx, face: 1, ground: b.ground, atk: -1, hero: 'knight' }, foe, s, r, 1 / 60, hops, o.vents ? VS : undefined);
        const onVentCol = VS.some(v => Math.abs(b.x - (v.col * TS + 8)) < 6);
        if (b.ground && b.y === F * TS && onVentCol && o.vents && ventWaitBefore) { waited += 1 / 60; if (o2.press.jump) jumpsOnVent++; }
        const dir = (o2.keys.right ? 1 : 0) - (o2.keys.left ? 1 : 0), cap = MOVE.RUN, acc = b.ground ? MOVE.ACC_GROUND : MOVE.ACC_AIR;
        if (dir) { b.vx += dir * acc / 60; b.vx = Math.max(-cap, Math.min(cap, b.vx)); } else { const f = (b.ground ? MOVE.FRIC_GROUND : MOVE.FRIC_AIR) / 60; b.vx = Math.abs(b.vx) <= f ? 0 : b.vx - Math.sign(b.vx) * f; }
        if (o2.press.jump && b.ground) { b.vy = MOVE.JUMPV; b.ground = false; }
        let inLift = false; if (o.physics) for (const v of VS) { const on = (((t + t0 + v.phase) % v.period) + v.period) % v.period < v.on; if (on && Math.abs(b.x - (v.col * TS + 8)) < 13 && b.y <= v.floor * TS + 2 && b.y > v.floor * TS - v.h) { inLift = true; b.vy = Math.min(b.vy, -190); b.ground = false; } } if (inLift && !wasLifted) lifts++; wasLifted = inLift;
        const apex = Math.abs(b.vy) < MOVE.APEX_VY, gk = apex ? MOVE.APEX_G : b.vy < 0 ? 1 : MOVE.FALL_G; if (!b.ground) { b.vy += MOVE.GRAV / 60 * gk; if (b.vy > MOVE.MAX_FALL) b.vy = MOVE.MAX_FALL; }
        b.x = Math.max(2 * TS + 5, Math.min((W - 2) * TS - 5, b.x + b.vx / 60)); const y0 = b.y; if (!b.ground) b.y += b.vy / 60;
        if (!b.ground && b.vy > 0) { const rowTop = Math.floor(y0 / TS), rowEnd = Math.floor(b.y / TS); for (let row = rowTop; row <= rowEnd + 1; row++) { const topY = row * TS; if (y0 <= topY + 1e-6 && b.y >= topY && (row === F || boardAt(b.x, row))) { b.y = topY; b.vy = 0; b.ground = true; break; } } }
        if (b.ground && !(b.y === F * TS) && !boardAt(b.x, Math.round(b.y / TS))) b.ground = false;
        if (b.y <= topRow * TS + 0.5 && b.ground) return { t, ok: true, lifts, waited, jumpsOnVent }; }
      return { t, ok: false, lifts, waited, jumpsOnVent }; };
    const sweep = (id, o) => { const res = []; for (const spot of A.ARENAS[id].spots) for (const seed of [1, 2, 3, 4]) for (const diff of ['normal', 'easy']) res.push({ spot, seed, diff, ...SIM(id, spot, seed * 17, diff, o) }); return res; };
    const sum = res => { const w = res.filter(r => r.ok); return w.length + '/' + res.length + ', normal slowest ' + Math.max(...res.filter(r => r.diff === 'normal').map(r => r.t)).toFixed(1) + ' s, easy slowest ' + Math.max(...w.map(r => r.t)).toFixed(1) + ' s'; };
    { const o = { foe: 6 }; const A1 = sweep('rootway', { ...o, vents: false, physics: false }), A2 = sweep('rootway', { ...o, vents: true, physics: true }), A3 = sweep('rootway', { ...o, vents: false, physics: true });
      ok(A1.every(r => r.ok) && Math.max(...A1.filter(r => r.diff === 'normal').map(r => r.t)) <= 25, 'ROOTWAY, vents ABSENT (no lift, no vent rule): a simulated bot reaches the top shelf from every spot, normal + easy, 4 seeds: ' + sum(A1));
      ok(A2.every(r => r.ok) && Math.max(...A2.filter(r => r.diff === 'normal').map(r => r.t)) <= 25, 'ROOTWAY, vents ON and used (lift + wait-for-puff): every run reaches the top shelf: ' + sum(A2));
      ok(A3.every(r => r.ok), 'ROOTWAY, vents ON but the bot ignores them (walks over them by accident): every run still gets there: ' + sum(A3));
      const used = A2.filter(r => r.lifts > 0).length; ok(used >= 8, 'with the vent rule the bots really ride a vent (' + used + '/' + A2.length + ' runs lifted), never jumping while they wait on one (jumps on a vent: ' + A2.reduce((a, r) => a + r.jumpsOnVent, 0) + ')');
      ok(A2.reduce((a, r) => a + r.jumpsOnVent, 0) === 0, 'a bot waiting on a vent never jumps off it (it waits for the puff)');
      const B2 = sweep('rootway', { foe: 22, vents: true, physics: true }); ok(B2.every(r => r.ok), 'foe on the OTHER top shelf (cols 20-25): every run reaches it: ' + sum(B2)); }
    { const K1 = sweep('kitchen', { foe: 4, vents: false, physics: false }), K2 = sweep('kitchen', { foe: 14, vents: false, physics: false });
      ok(K1.every(r => r.ok) && K2.every(r => r.ok) && Math.max(...K1.concat(K2).filter(r => r.diff === 'normal').map(r => r.t)) <= 20, 'KITCHEN: a simulated bot reaches a beam (r6) from every spot, normal + easy, both beams: ' + sum(K1.concat(K2))); }
  }

  console.log('the co-op camera: four seats on the wide arena');
  { const m = text('../src/main.js'), edge = +(m.match(/const COOP_EDGE = (\d+);/) || [])[1], { coopViewSize } = await import('../src/party.js');
    ok(edge === 10, 'COOP_EDGE is ' + edge + ' px (src/main.js: how near the frame edge a seat may walk)');
    const views = [[1280, 720], [1366, 768], [1920, 1080], [2560, 1440], [3840, 2160]].map(([w, h]) => [w + 'x' + h, ...coopViewSize(w, h)]);
    const spread = id => { const sp = A.ARENAS[id].spots; return (Math.max(...sp) - Math.min(...sp)) * TS; };
    const minView = Math.min(...views.map(v => v[1]));
    for (const id of ['pit', 'stockade', 'rootway', 'kitchen']) ok(spread(id) <= minView - 2 * edge, id + ': the four seats start ' + spread(id) + ' px apart; the narrowest co-op frame on a 720p - 4K display is ' + minView + ' px (' + views.map(v => v[0] + '=' + v[1]).join(' ') + '): fits with the ' + edge + ' px soft stop each side');
    ok((29 - 4) * TS > 400 - 2 * edge, 'why 30 wide, not 34: seats at 4 / 29 would be ' + (29 - 4) * TS + ' px apart, wider than even the 400 px frame (380 after the soft stop)');
    ok(A.ARENAS.rootway.W === 30 && A.ARENAS.rootway.W * TS - 2 * 2 * TS >= 400 - 2 * edge, 'the room itself (26 floor columns = ' + 26 * TS + ' px) is wider than the frame, so there is still room to kite and the camera follows'); }

  console.log('THE KITCHEN: Kitchen Gate art paints without the Gate\'s rooms');
  { const mkCtx = () => { const store = {}; let cv; const ctx = new Proxy(store, { get(t, k) { if (k in t) return t[k]; if (k === 'canvas') return cv; if (k === 'getImageData') return (x, y, w, h) => ({ data: new Uint8ClampedArray(Math.max(4, (w | 0) * (h | 0) * 4)), width: w, height: h }); if (k === 'measureText') return () => ({ width: 5 }); return () => ctx; }, set(t, k, v) { t[k] = v; return true; } });
      cv = { width: 1, height: 1, getContext: () => ctx, toDataURL: () => '' }; return cv; };
    globalThis.document = { createElement: () => mkCtx() };
    try {
      const KGT = await import('../src/redraw/kitchen_tiles.js'), KGA = await import('../src/redraw/kitchen_art.js');
      const L = levelOf('kitchen').build(), at = (x, y) => (x < 0 || y < 0 || x >= L.W || y >= L.H) ? T.SOLID : L.grid[y * L.W + x]; let n = 0, nul = 0, bad = 0;
      for (let y = 0; y < L.H; y++) for (let x = 0; x < L.W; x++) { const t = at(x, y); if (t === T.SOLID || t === T.ONEWAY) { n++; try { if (!KGT.kgTile(t, x, y, at, T, L)) nul++; } catch (e) { bad++; } } }
      ok(n > 100 && nul === 0 && bad === 0, 'kgTile gives a Kitchen Gate tile for every one of the ' + n + ' solid / board cells (no level rooms, no L.arena needed): ' + nul + ' blank, ' + bad + ' threw');
      const decor = []; KGA.dress(decor, L, at, T); ok(decor.length > 0 && decor.every(d => d.x >= 0 && d.x <= L.W * TS && d.y >= 3 * TS - 20 && d.y <= (L.duelPit.floor + 1) * TS), 'KGA.dress hangs ' + decor.length + ' pieces (hams, braids, lanterns...) inside the hall, none outside it');
      const g2 = mkCtx().getContext(); const [x0, x1, y0, y1, st] = L.interiors[0]; let painted; try { painted = KGA.paintRoom(g2, st, 0, 0, (x1 - x0 + 1) * TS, (y1 - y0 + 1) * TS, x0, y0, 1.5, 0, 0, 320, 180); } catch (e) { painted = 'threw ' + e.message; }
      ok(painted === true, 'KGA.paintRoom paints the one room rectangle (interiors [' + [x0, x1, y0, y1, st].join() + '], zone 0 = the undercellars) without the Gate\'s rooms: ' + painted);
      let amb = 'ok'; try { KGA.drawAmbient(g2, 0, 0, 320, 180, 1.5, at, T); } catch (e) { amb = 'threw ' + e.message; } ok(amb === 'ok', 'KGA.drawAmbient runs on the hall (' + amb + ')');
      const m = text('../src/main.js'); ok(/if \(L\.kgKit\) \{ const ts = KGT\.kgTile/.test(m) && /if \(L\.kgKit\) KGA\.dress/.test(m) && /L\.kgKit && KGA\.paintRoom/.test(m) && /if \(L\.kgKit\) KGA\.drawAmbient/.test(m), 'main.js reads kgKit at exactly the four art sites (tiles, dressing, ambient glow, room painter)');
      const others = ['src/main.js', 'src/level.js', 'src/pvp-duel.js', 'src/enemies.js'].map(f => { try { return text('../' + f); } catch { return ''; } }).join('\n'); ok((others.match(/\.kgKit/g) || []).length === 4, 'no other code reads kgKit anywhere (' + (others.match(/\.kgKit/g) || []).length + ' reads, all art)');
    } catch (e) { ok(false, 'Kitchen art in node: ' + e.message); }
    delete globalThis.document; }

  console.log('THE DUEL PIT: its own planks stand on posts (draw only, flag ON)');
  { const L = levelOf('pit').build(), W = L.W, g = (x, y) => L.grid[y * W + x], F = L.duelPit.floor, runs = [];
    for (let y = 0; y < L.H; y++) { let x = 0; while (x < W) { if (g(x, y) === T.ONEWAY) { let e = x; while (e + 1 < W && g(e + 1, y) === T.ONEWAY) e++; runs.push([y, x, e]); x = e + 1; } else x++; } }
    ok(runs.length === 3 && A.PIT_STANDS.length === 6 && runs.every(([y, x0, x1]) => [x0, x1].every(c => A.PIT_STANDS.some(s => s[0] === c && s[1] === y && s[2] === F))) && A.PIT_STANDS.every(s => runs.some(([y, x0, x1]) => s[1] === y && (s[0] === x0 || s[0] === x1)) && s[2] === F), 'PIT_STANDS = a post under both ends of each of the Pit\'s three planks, down to the sand (floor row ' + F + ')');
    const ARP = await import('../src/redraw/arena_props.js'), rects = [], gs = { set fillStyle(v) {}, fillRect: (x, y, w, h) => rects.push([x, y, w, h]) };
    ok(typeof ARP.drawPlankStands === 'function', 'src/redraw/arena_props.js exports drawPlankStands (the arena set\'s own oak post)');
    try { globalThis.document = { createElement: () => ({ width: 1, height: 1, getContext: () => ({}) }) }; } catch {}
    ARP.drawPlankStands(gs, A.PIT_STANDS, 0, 0); const per = A.PIT_STANDS.map(s => rects.filter(r => r[0] >= s[0] * TS + 4 && r[0] <= s[0] * TS + 12)); const lo = Math.max(...rects.map(r => r[1] + r[3])), hi = Math.min(...rects.map(r => r[1]));
    ok(rects.length >= 6 * 5 && hi >= 11 * TS && lo <= F * TS && A.PIT_STANDS.every(s => rects.some(r => r[0] === s[0] * TS + 6 && r[1] === s[1] * TS + 5 && r[1] + r[3] >= s[2] * TS - 1)), 'the stands draw ' + rects.length + ' rects, each post from its deck (row*16+5) down to the sand (bottom 17*16 = ' + F * TS + '), nothing above the highest plank or below the floor');
    delete globalThis.document;
    const m = text('../src/main.js'); ok(/if \(DUEL_ARENAS && L\.duelPit && !L\.duelPit\.arena\) ARP\.drawPlankStands\(g, PIT_STANDS, cx, cy\);/.test(m), 'main.js draws them only with DUEL_ARENAS on, and only in the Pit (no arena field), behind the tiles with the route supports');
    ok(hashOf(L) === PIT_HASH, 'the Pit\'s built level still hashes to the pinned value with the stands in (draw only: no collision, no ent, no hash change)'); }

  console.log('main.js wiring (source)');
  { const m = text('../src/main.js'), lv = text('../src/level.js');
    ok((m.match(/pitArt\(\)/g) || []).length >= 7 && /function pitArt\(\) \{ return !!\(L && L\.duelPit && \(L\.duelPit\.kit \|\| 'arena'\) === 'arena'\); \}/.test(m), 'pitArt() is defined (the Pit has no kit field = arena) and used at the art sites (' + (m.match(/pitArt\(\)/g) || []).length + ' uses)');
    const left = (m.match(/L.duelPit/g) || []).length; ok(left === 9, 'the only L.duelPit left in main.js: the three is-a-duel checks, pitArt (two), the backdrop floor line, the vent lift for every seat, the Pit stands (two) (' + left + ')');
    ok(/const duelIndex = \(arena = 'pit'\) =>/.test(m) && /duelResolveArena\(settings && settings\.arena/.test(m), 'duelIndex(arena) + duelEnter resolves the arena (RANDOM once, from the built levels)');
    ok(/if \(DUEL_ARENAS\) LEVELS\.push\(\{ id: 'duel_stockade'/.test(lv), 'level.js registers the Stockade only under DUEL_ARENAS');
    for (const f of ['duel-arenas.js', 'duel-arenas.mjs']) ok(!/(^|[-_.])(ad|ads|admiral|banner|track|tracker|promo)([-_.]|$)/i.test(f), 'filename ' + f + ' is not ad-block-looking'); }
}

if (MODE === 'off') {
  console.log('flag OFF (identity with claude/duelfoes)');
  ok(A.DUEL_ARENAS === false, 'the flag is OFF in this process');
  ok(!('arena' in cleanSettings(null)) && !('arena' in cleanSettings({ arena: 'stockade', lives: 3 })) && cleanSettings({ arena: 'stockade', lives: 3 }).lives === 3, 'the settings carry no arena key (a saved arena is dropped)');
  { const store = {}, ls = { getItem: k => store[k] ?? null, setItem: (k, v) => { store[k] = v; } }; saveSettings(ls, 'slot1', cleanSettings({ arena: 'random' })); ok(!/arena/.test(ls.getItem('bracken.duelSettings')), 'the saved settings JSON has no arena in it'); }
  ok(!LEVELS.some(l => l.id === 'duel_stockade') && LEVELS.some(l => l.id === 'duel_pit') && LEVELS[LEVELS.length - 1].id === 'highlines', 'no extra level is registered: the Pit is the only arena (the last level is still the High Lines)');
  ok(hashOf(LEVELS.find(l => l.id === 'duel_pit').build()) === PIT_HASH, 'the Pit\'s level hash is the pinned one');
  ok(A.resolveArena('stockade') === 'pit' && A.resolveArena('random', () => 0.99) === 'pit' && A.cleanArena('stockade') === 'pit', 'every pick resolves to the Pit');
  { const g = mockGame('pit'); g.fresh(S({ arena: 'stockade' })); ok(g.D.debug().arena && g.D.debug().arena.id === 'pit' && g.D.debug().arena.random === false, 'a match is always in the Pit, never random'); const t = []; g.api.text = (s) => t.push(String(s)); g.D.drawHud(320, 180); ok(!t.some(s => /PIT|STOCKADE|RANDOM/.test(s)), 'and the banner / count say nothing about an arena (as before)'); }
  { const calls = []; const R = makeRoster({ get heroes() { return ['knight']; }, heroName: h => h, owns: () => true, humans: () => [{ n: 1, ai: false, hero: 'knight' }], colourOf: () => ({ c: '#fff' }), getSettings: () => cleanSettings(null), setSettings() {}, setSeat() {}, setSeatCount() {}, cycleOpt: () => true, submit() {}, close() {}, sfx() {}, text: (s) => calls.push(String(s)), board() {}, icon() {}, rect() {}, frame() {}, fit: s => s, inkW: s => s.length * 5, key: a => a });
    R.open(); R.R.tab = 1; R.draw(320, 180); ok(R.R.hits.filter(h => h.k === 'rule').length === RULE_ROWS.length && RULE_ROWS.length === 7 && !calls.some(c => /ARENA/.test(c)), 'the RULES tab keeps its seven rows'); }
  ok(botThink({ x: 100, y: 272, vx: 0, face: 1, ground: true, atk: -1, hero: 'knight' }, { x: 100, y: 100, atk: -1 }, freshBot('normal'), rng(1), 1 / 60).keys !== undefined && !/DUEL_ARENAS && api\.L\(\)\.duelPit\.hops/.test('') && /DUEL_ARENAS && api\.L\(\)\.duelPit\.hops/.test(text('../src/pvp-duel.js')), 'hands() passes hops only under the flag');
  console.log('OFFJSON:' + JSON.stringify(cleanSettings({ lives: 3, goblins: 'few', arena: 'stockade' })));
}

if (MODE === 'on') {
  const r = spawnSync(process.execPath, [fileURLToPath(import.meta.url), 'off'], { encoding: 'utf8' });
  const out = r.stdout || ''; console.log('--- flag OFF child ---'); console.log(out.split('\n').filter(l => !l.startsWith('OFFJSON:')).join('\n').trimEnd());
  if (r.status !== 0) fails.push('the flag-OFF child failed (exit ' + r.status + ')');
  const off = JSON.parse((out.match(/^OFFJSON:(.*)$/m) || [, 'null'])[1]), on = cleanSettings({ lives: 3, goblins: 'few', arena: 'stockade' }); const strip = o => { const c = { ...o }; delete c.arena; delete c.goblins; delete c.friendlyFire; return JSON.stringify(c); };
  ok(off && strip(off) === strip(on) && off.arena === undefined && on.arena === 'stockade', 'flag ON vs OFF: the settings are identical except the arena key (and the duelfoes ones)');
}
console.log(fails.length ? '\nFAILS: ' + fails.length : '\nALL OK');
process.exit(fails.length ? 1 : 0);
