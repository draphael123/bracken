// tools/duel-foes.mjs - THE DUEL PIT's GOBLINS setting + FRIENDLY FIRE (claude/duelfoes; src/duel-foes.js the pure schedule + doors, src/pvp-duel.js the runtime).
//   NODE ONLY, no browser. Runs the flag-ON proofs here and spawns itself once with 'off' for the flag-OFF identity proofs (the flag is read once at import).
//   ON : settings clean + remembered; foePlan (FEW max 2 / 14 s, MANY max 4 / 8 s, first at 10 s) + cap; doors (never within 6 tiles of a seat, farthest door); the told spawn,
//        first-of-match banner; none during the count / K.O. / winner screen / sudden death; flee at sudden death; cleared between rounds; a goblin blow = flat 6% of the duel health
//        (HEALTH scales it), never below 1, never a K.O., duel grace + anti-juggle hold; a goblin kill gives nothing (no heal, no points) but counts; teams neutral;
//        friendly fire both ways; bot targeting; a long simulated match always ends; the main.js hooks are present and the kill branch pays nothing.
//   OFF: the settings clean to goblins 'off' / friendlyFire false; no goblin is ever spawned; teammates cannot hurt each other; the RULES tab keeps its seven rows.
// node tools/duel-foes.mjs
import { spawnSync } from 'node:child_process';
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
const MODE = process.argv[2] === 'off' ? 'off' : 'on';
if (MODE === 'on') globalThis.__DUELFOES = true;
const { makeDuel, cleanSettings, defaultSettings, loadSettings, saveSettings, SETTING_CHOICES, DUEL, juggleGrace } = await import('../src/pvp-duel.js');
const FD = await import('../src/duel-foes.js');
const { buildDuelPit, DP } = await import('../src/duel-pit.js');
const fails = [], ok = (c, m) => { if (!c) { fails.push(m); console.log('  FAIL ' + m); } else console.log('  ok   ' + m); };
const TS = 16, text = f => readFileSync(fileURLToPath(new URL(f, import.meta.url)), 'utf8');

/* ---- a mock game (as tools/pvp-duel.mjs) + the three goblin hooks main.js lends ---- */
function mockGame() {
  let now = 0, cur = null, probe = { r: 'hit' }; const players = [], enemies = [], floats = [], spawned = [], sfx = [], keysOut = { v: null };
  const mk = (hero, extra = {}) => ({ hero, n: players.length + 1, x: 0, y: 272, down: 0, dead: 0, hp: 100, maxHp: 100, maxSt: 100, st: 100, flasks: 0, face: 1, ...extra });
  const api = { L: () => ({ duelPit: { floor: 17, spots: [5, 20, 9, 16] }, W: 26 }), players: () => players, time: () => now, TS, P: () => cur,
    asPlayer: (p, fn) => { const w = cur; cur = p; try { return fn(); } finally { cur = w; } }, passOn: () => cur, upright: p => !(p.down > 0) && !(p.dead > 0), enemies: () => enemies, owned: () => [],
    goDown: p => { p.down = 1; }, seatAdd: sp => { if (players.length >= 4) return null; const p = mk(sp.hero, { src: sp.src }); players.push(p); return p; },
    seatDrop: p => { const i = players.indexOf(p); if (i > 0) { players.splice(i, 1); players.forEach((q, k) => { q.n = k + 1; }); } },
    float: (x, y, t) => floats.push(t), callout() {}, hint() {}, sfx: k => sfx.push(k), colourOf: n => ({ c: '#fff', name: 'C' + n }), tagOf: p => 'P' + p.n, heroName: h => String(h).toUpperCase(), heroes: () => [], text() {}, board() {}, bar() {},
    damage: (v, fx, pr) => ({ r: 'hit', landed: pr }), norm: () => 1, hand: () => ({ base: 10, add: 0 }), rankOf: p => p === players[0] ? { key: 'slot1', name: 'SAVE 1' } : null, ls: () => null, leave() {}, enter() {},
    pressRead: () => ({}), eatPress() {}, keysWrite: o => { keysOut.v = o; }, pressWrite() {},
    foeSpawn: (col, row, kind, face) => { const e = { t: kind, x: col * TS + 8, y: (row + 1) * TS, face, alive: true, hp: 10 }; enemies.push(e); spawned.push(e); return e; },
    foeProbe: (v, fx, pr) => ({ r: probe.r, landed: probe.r === 'hit' ? pr : 0 }) };
  const D = makeDuel(api);
  const g = { D, api, players, enemies, floats, spawned, sfx, keysOut, setProbe: r => { probe = { r }; }, now: () => now,
    fresh: (settings, o = {}) => { players.length = 0; enemies.length = 0; spawned.length = 0; floats.length = 0; players.push(mk('knight')); now = 0; const r = D.begin({ settings, seed: 5, ...o }); return r; },
    step: secs => { for (let i = 0; i < Math.round(secs * 60); i++) { now += 1 / 60; D.tick(1 / 60); } },
    stepTo: (t) => { while (D.st.m.phase === 'fight' && D.st.m.clock < t - 1e-6) { now += 1 / 60; D.tick(1 / 60); } },
    gobs: () => enemies.filter(e => e.duelFoe && e.alive), place: (...xs) => players.forEach((p, i) => { if (xs[i] !== undefined) p.x = xs[i] * TS + 8; }) };
  return g;
}
const S = o => cleanSettings({ timeLimit: 0, rounds: 1, ...o });

if (MODE === 'on') {
  console.log('settings');
  ok(FD.DUEL_FOES === true, 'the flag is ON in this process (?duelfoes / __DUELFOES)');
  { const d = defaultSettings(); ok(d.goblins === 'off' && d.friendlyFire === false, 'default: GOBLINS off, FRIENDLY FIRE off (today\'s duel)'); }
  ok(['few', 'many', 'off'].every(v => cleanSettings({ goblins: v }).goblins === v) && cleanSettings({ goblins: 'swarm' }).goblins === 'off' && cleanSettings({ goblins: 7 }).goblins === 'off' && cleanSettings({ goblins: null }).goblins === 'off', 'goblins keeps off / few / many and cleans anything else to off');
  ok(cleanSettings({ friendlyFire: true }).friendlyFire === true && cleanSettings({ friendlyFire: 'yes' }).friendlyFire === false && cleanSettings({ friendlyFire: 1 }).friendlyFire === false, 'friendlyFire is true only for true');
  ok(SETTING_CHOICES.goblins.join() === 'off,few,many' && SETTING_CHOICES.friendlyFire.join() === 'false,true', 'the choice lists: goblins off/few/many, friendly fire off/on');
  { const store = {}, ls = { getItem: k => store[k] ?? null, setItem: (k, v) => { store[k] = v; } }; saveSettings(ls, 'slot1', cleanSettings({ goblins: 'many', friendlyFire: true, teams: true }));
    const back = loadSettings(ls, 'slot1'); ok(back.goblins === 'many' && back.friendlyFire === true && back.teams === true, 'remembered: GOBLINS MANY + FRIENDLY FIRE ON survive a save and a load');
    ls.setItem('bracken.duelSettings', JSON.stringify({ v: 1, slots: { slot2: { lives: 3, health: 150, teams: false } } })); const old = loadSettings(ls, 'slot2'); ok(old.goblins === 'off' && old.friendlyFire === false && old.lives === 3 && old.health === 150, 'a setting saved BEFORE this feature loads clean: goblins off, the rest kept'); }
  { const g = mockGame(); g.fresh(S({ goblins: 'many' })); g.D.setSettings({ goblins: 'few' }); ok(g.D.getSettings().goblins === 'few', 'setSettings({ goblins }) merges and cleans'); g.D.cycleOpt('goblins', 1); ok(g.D.getSettings().goblins === 'many', 'cycleOpt walks goblins few -> many'); g.D.cycleOpt('goblins', 1); ok(g.D.getSettings().goblins === 'off', '...many -> off (wraps)'); g.D.cycleOpt('friendlyFire', 1); ok(g.D.getSettings().friendlyFire === true, 'cycleOpt flips friendly fire'); }
  ok(FD.GOB_LINE.few.startsWith('GOBLINS: FEW - THEY HURT ANYONE, BUT ONLY A HERO CAN K.O. YOU.') && FD.GOB_LINE.many.includes('ONLY A HERO CAN K.O. YOU') && FD.GOB_NAME.off === 'OFF' && FD.FF_LINE.true.length > 10, 'the plain-words lines are written');

  console.log('schedule (foePlan, pure)');
  { const run = (mode, kills = 0) => { const st = { next: FD.FOE.first }, out = []; let alive = 0; for (let c = 0; c < 200 * 60; c++) { const clock = c / 60; if (kills && out.length && c % (kills * 60) === 0 && alive > 0) alive--; const p = FD.foePlan(mode, st, clock, alive, true); if (p.tell) { out.push(p.at); alive++; if (alive > FD.FOE[mode].max) return { out, over: true }; } } return { out, over: false }; };
    const few = run('few'), many = run('many');
    ok(few.out[0] === 10 && few.out.length === 2 && !few.over && Math.abs(few.out[1] - 24) < 1e-9, 'FEW with none killed: entries at 10 s and 24 s, then CAPPED at 2 alive for the rest of 200 s (' + few.out.join(', ') + ')');
    ok(many.out[0] === 10 && many.out.length === 4 && !many.over && many.out.every((t, i) => Math.abs(t - (10 + 8 * i)) < 1e-9), 'MANY with none killed: 10, 18, 26, 34 s, then CAPPED at 4 alive (' + many.out.join(', ') + ')');
    const fk = run('few', 5), mk = run('many', 3); ok(!fk.over && !mk.over, 'kills free a slot but the cap is never passed (FEW 2, MANY 4)');
    ok(fk.out.every((t, i, a) => !i || t - a[i - 1] >= 14 - 1e-9) && mk.out.every((t, i, a) => !i || t - a[i - 1] >= 8 - 1e-9), 'consecutive entries are at least 14 s (FEW) / 8 s (MANY) apart');
    ok(FD.foePlan('off', { next: 10 }, 99, 0).tell === false, "mode 'off' never tells");
    { const st = { next: 10 }; ok(!FD.foePlan('few', st, 8.9, 0).tell && FD.foePlan('few', st, 9.0, 0).tell && st.next === 24, 'the tell starts 1.0 s before the entry (first at 9.0 s, walks in at 10 s); the next entry is one interval on'); }
    { const st = { next: 10 }, p = FD.foePlan('many', st, 12, 0, false); ok(!p.tell && st.next > 12, 'no free door: nothing is told and it tries again a moment later'); }
    ok(FD.FOE.few.max === 2 && FD.FOE.few.every === 14 && FD.FOE.many.max === 4 && FD.FOE.many.every === 8 && FD.FOE.first === 10 && FD.FOE.tell === 1.0 && FD.FOE.minSeat === 6 && FD.FOE.blow === 0.06, 'the numbers are the plan\'s'); }
  ok(FD.foeAllowed('fight', 5, 90) && !FD.foeAllowed('count', 0, 90) && !FD.foeAllowed('ko', 5, 90) && !FD.foeAllowed('over', 5, 90) && !FD.foeAllowed('fight', 90, 90) && FD.foeAllowed('fight', 1000, Infinity), 'allowed only in the fight before sudden death (never the count, the K.O. banner, the winner screen)');

  console.log('doors + distance');
  { const cols = FD.foeDoorCols(26); ok(cols.join() === '2,23', 'the Pit\'s doors: the wall-edge floor columns 2 and 23 (W 26)');
    const T = { AIR: 0, SOLID: 1, ONEWAY: 2 }, painter = (W, H) => { const grid = new Uint8Array(W * H), ents = [], set = (x, y, v) => { if (x >= 0 && y >= 0 && x < W && y < H) grid[y * W + x] = v; }; return { W, H, grid, ents, block: (x0, x1, y0, y1) => { for (let y = y0; y <= y1; y++) for (let x = x0; x <= x1; x++) set(x, y, T.SOLID); }, plat: (x, y, l) => { for (let i = 0; i < l; i++) set(x + i, y, T.ONEWAY); }, ent: (t, x, y, e = {}) => ents.push({ t, x, y, ...e }) }; };
    const L = buildDuelPit({ painter, T }); ok(cols.every(c => L.grid[(DP.FLOOR - 1) * L.W + c] === T.AIR && L.grid[DP.FLOOR * L.W + c] === T.SOLID), 'each door is open air standing on the floor, inside the walls');
    const rnd = (() => { let a = 99; return () => { a = (a * 1664525 + 1013904223) >>> 0; return a / 4294967296; }; })(); let bad = 0, picked = 0, none = 0;
    for (let i = 0; i < 20000; i++) { const n = 2 + Math.floor(rnd() * 3), xs = Array.from({ length: n }, () => (2 + rnd() * 22) * TS), di = FD.pickDoor(cols, xs, TS);
      if (di < 0) { none++; if (cols.some(c => FD.doorFree(c, xs, TS))) bad++; } else { picked++; if (xs.some(q => Math.abs(q - (cols[di] * TS + 8)) < 6 * TS)) bad++; const dists = cols.map(c => Math.min(...xs.map(q => Math.abs(q - (c * TS + 8))))); if (dists[di] < Math.max(...dists) - 1e-9) bad++; } }
    ok(bad === 0 && picked > 100 && none > 100, 'doors over 20000 random seat layouts: a door is only ever picked at 6+ tiles from every seat, it is the FARTHEST one, and -1 when none is free (' + picked + ' picked, ' + none + ' blocked)');
    ok(FD.pickDoor(cols, [5 * TS + 8, 20 * TS + 8], TS) === -1, 'the round-start seats (cols 5 / 20) block both doors: no goblin walks in until a seat moves off its start'); }
  { const txt = text('../src/duel-foes.js').replace(/\/\*[\s\S]*?\*\//g, '').replace(/\/\/.*$/gm, ''); ok(!/\b(item|items|loot|drop|drops|coin|coins|xp)\b/i.test(txt), 'foePlan and the door data carry no item / loot / drop / coin / xp hooks (a later item drop reuses the doors and the told spawn)');
    ok(FD.FOE_ARENAS.pit.kinds.every(k => ['sprig', 'shield'].includes(k)) && !FD.FOE_ARENAS.pit.kinds.some(k => /brute|pike|mage|sapper|archer/.test(k)), 'the Pit\'s goblins are sprig + shield only (no archer, no brute, no pike, no mage, no sapper)');
    ok(FD.foeKind(0) === 'sprig' && FD.foeKind(0.99) === 'shield', 'foeKind rolls both kinds'); }

  console.log('runtime: the told spawn');
  { const g = mockGame(), D = g.D; ok(g.fresh(S({ goblins: 'many' })), 'a MANY duel begins on the mock'); g.step(DUEL.round.count + 0.1);
    g.place(10, 14); g.step(8.5); ok(D.debug().foe.pend === 0 && g.gobs().length === 0 && D.debug().m.clock < 9, 'nothing is told before 9 s of the fight clock');
    g.stepTo(9.05); ok(D.debug().foe.pend === 1 && g.gobs().length === 0, 'at 9 s the \'!\' goes up: one goblin told, none in yet');
    ok(g.sfx.includes('hornBlast') && D.st.banner && D.st.banner.txt === 'GOBLINS IN THE PIT', 'the horn sounds and the FIRST of the match says GOBLINS IN THE PIT');
    g.stepTo(9.9); ok(g.gobs().length === 0, '...and he is not in before the second is up'); g.stepTo(10.05);
    const e1 = g.gobs()[0]; ok(g.gobs().length === 1 && e1 && (e1.x === 2 * TS + 8 || e1.x === 23 * TS + 8) && e1.duelFoe === true && ['sprig', 'shield'].includes(e1.t), 'at 10 s he walks in at a DOOR (col ' + (e1 && (e1.x - 8) / TS) + ', a ' + (e1 && e1.t) + ')');
    ok(D.st.seats.every(p => Math.abs(p.x - e1.x) >= 6 * TS), 'and never within 6 tiles of any seat');
    D.st.banner = null; g.stepTo(17.05); ok(D.st.banner === null || D.st.banner.txt !== 'GOBLINS IN THE PIT', 'the second goblin does not say it again (once per match)');
    g.stepTo(18.5); ok(g.gobs().length === 2, 'MANY: the second walks in at 18 s'); g.stepTo(40); ok(g.gobs().length === 4 && D.debug().foe.alive === 4, 'MANY: four alive by 34 s and no more (cap 4) - checked at 40 s'); g.stepTo(80); ok(g.gobs().length === 4, '...still 4 at 80 s'); }
  { const g = mockGame(); g.fresh(S({ goblins: 'few' })); g.step(DUEL.round.count + 0.1); g.place(10, 14); g.stepTo(60); ok(g.gobs().length === 2, 'FEW: two alive and no more at 60 s'); }
  { const g = mockGame(); g.fresh(S({ goblins: 'many' })); g.step(DUEL.round.count + 0.1); g.stepTo(12); ok(g.gobs().length === 0 && g.D.debug().foe.pend === 0, 'seats still on their start cols 5 / 20 (both doors inside 6 tiles): nothing walks in'); g.place(10, 14); g.stepTo(14); ok(g.gobs().length === 1, '...the moment a seat clears the doors he is told and enters'); }
  { const g = mockGame(), D = g.D; g.fresh(S({ goblins: 'many' })); g.place(10, 14); g.step(DUEL.round.count - 0.5); ok(D.debug().m.phase === 'count' && D.debug().foe.pend === 0 && g.gobs().length === 0, 'none during the count'); }

  console.log('runtime: forbidden phases, sudden death, between rounds');
  { const g = mockGame(), D = g.D; g.fresh(cleanSettings({ goblins: 'many', timeLimit: 60, rounds: 3 })); g.step(DUEL.round.count + 0.1); g.place(10, 14); g.stepTo(30); const n = g.gobs().length; ok(n >= 3, 'time limit 60: goblins in by 30 s (' + n + ')');
    g.stepTo(59.9); const live = g.gobs(); g.stepTo(60.1); ok(live.length > 0 && live.every(e => e.duelFlee === true) && D.debug().foe.flee === true && D.debug().foe.pend === 0, 'SUDDEN DEATH: every live goblin flees, none is told');
    for (let i = 0; i < 600 && g.gobs().length; i++) { g.step(1 / 60); for (const e of live) if (e.alive && e.duelFlee) D.foeFlee(e, 1 / 60); }
    ok(g.gobs().length === 0 && live.every(e => !e.alive), 'the fleeing goblins reach a door and are gone (no death, no count)'); ok((D.st.seats.reduce((a, p) => a + (p.duelGobs || 0), 0)) === 0, '...a goblin that runs off scores nobody');
    const before = g.spawned.length; g.step(30); ok(g.spawned.length === before, 'none enters during sudden death (' + before + ' spawned before, ' + g.spawned.length + ' after 30 s more)'); }
  { const g = mockGame(), D = g.D; g.fresh(S({ goblins: 'many', rounds: 3 })); g.step(DUEL.round.count + 0.1); g.place(10, 14); g.stepTo(30); ok(g.gobs().length >= 3, 'round 1: goblins in'); const [A, B] = D.st.seats;
    B.duelHp = 0; B.duelLives = 0; B.down = 1; g.step(0.1); ok(D.debug().m.phase === 'ko' && g.gobs().length === 0 && D.debug().foe.pend === 0, 'K.O.: the goblins are gone at the banner');
    const spawnedBefore = g.spawned.length; g.step(1.5); ok(g.spawned.length === spawnedBefore, 'none during the K.O. banner');
    g.step(DUEL.round.ko); ok(D.debug().m.phase === 'count', 'round 2 counts down'); g.place(10, 14); g.step(DUEL.round.count + 0.2); ok(g.gobs().length === 0 && D.debug().foe.next === 10, 'cleared between rounds: round 2 starts with none and the first due at 10 s again');
    g.stepTo(10.5); ok(g.gobs().length === 1 && D.debug().foe.said === true, 'round 2: one walks in at 10 s (and the banner is not repeated: said stays for the match)'); }
  { const g = mockGame(), D = g.D; g.fresh(S({ goblins: 'many', rounds: 1 })); g.step(DUEL.round.count + 0.1); g.place(10, 14); g.stepTo(25); const [A, B] = D.st.seats; B.duelHp = 0; B.duelLives = 0; B.down = 1; g.step(0.1); g.step(DUEL.round.ko + 0.2);
    ok(D.debug().m.phase === 'over' && g.gobs().length === 0 && D.debug().foe.pend === 0, 'the winner screen: no goblins, none told'); const n = g.spawned.length; g.step(20); ok(g.spawned.length === n, '...and none walk in during it'); ok(D.debug().result.rows.every(r => 'gobs' in r) && D.debug().result.foes === true, 'the results card rows carry a GOBLINS count and the column is on'); }

  console.log('runtime: a goblin blow wounds, never K.O.s');
  { const g = mockGame(), D = g.D; g.fresh(S({ goblins: 'many' })); g.step(DUEL.round.count + 0.1); g.place(10, 14); g.stepTo(11); const [A, B] = D.st.seats, e = g.gobs()[0];
    A.duelGrace = 0; const r = D.foeBlow(A, e, e.x, {}); ok(r === 'hit' && A.duelHp === 94 && D.st.stats.foeBlows === 1, 'a goblin blow takes a flat 6% of 100 duel health = 6 (' + A.duelHp + ')');
    ok(A.inv > 0 && A.duelGrace > g.now(), 'and gives the duel grace (' + (A.duelGrace - g.now()).toFixed(2) + ' s)');
    ok(D.foeBlow(A, e, e.x, {}) === false && A.duelHp === 94, 'a second blow inside the grace does nothing (no chain-lock)');
    for (const [hp, want] of [[50, 3], [100, 6], [150, 9]]) { const gg = mockGame(); gg.fresh(S({ goblins: 'many', health: hp })); gg.step(DUEL.round.count + 0.1); gg.place(10, 14); gg.stepTo(11); const a = gg.D.st.seats[0], ge = gg.gobs()[0]; a.duelGrace = 0; const before = a.duelHp; gg.D.foeBlow(a, ge, ge.x, {}); ok(before - a.duelHp === want && a.duelMax === hp, 'HEALTH ' + hp + '%: a goblin blow costs ' + want + ' (6% of ' + hp + ')'); }
    A.duelHp = 7; A.duelGrace = 0; D.foeBlow(A, e, e.x, {}); ok(A.duelHp === 1, 'at 7 health a 6-blow leaves exactly 1 (never below 1)');
    A.duelGrace = 0; const k0 = D.st.stats.kos; D.foeBlow(A, e, e.x, {}); ok(A.duelHp === 1 && A.down === 0 && D.st.stats.kos === k0 && D.debug().m.phase === 'fight', 'at 1 health a goblin blow takes nothing and K.O.s nobody');
    A.duelHp = 100; B.duelHp = 100; let t = 0, hits = 0, min = 1e9; for (let i = 0; i < 60 * 40; i++) { g.step(1 / 60); A.duelGrace = A.duelGrace; const h0 = A.duelHp; if (D.foeBlow(A, e, e.x, {}) === 'hit') hits++; min = Math.min(min, A.duelHp); if (A.duelHp <= 1) { A.duelHp = 100; } t++; }
    ok(min >= 1 && A.down === 0 && D.st.stats.kos === k0, 'a goblin hammering a seat EVERY FRAME for 40 s never takes the last health point and K.O.s nobody (min ' + min + ')');
    { const g2 = mockGame(); g2.fresh(S({ goblins: 'many' })); g2.step(DUEL.round.count + 0.1); g2.place(10, 14); g2.stepTo(11); const a = g2.D.st.seats[0], ge = g2.gobs()[0]; let n = 0; const t0 = g2.now(); a.duelHp = 150; a.duelMax = 150; for (let i = 0; i < 60 * 10; i++) { g2.step(1 / 60); if (g2.D.foeBlow(a, ge, ge.x, {}) === 'hit') n++; } ok(n >= 6 && n <= 16, 'chain-lock: a goblin spamming every frame lands ' + n + ' blows in 10 s (grace 0.4 s + anti-juggle break 1.1 s => about 15 at most)'); ok(g2.D.st.stats.breaks >= 2, '...and the anti-juggle BREAK fires (' + g2.D.st.stats.breaks + ')'); }
    g.setProbe('blocked'); A.duelHp = 100; A.duelGrace = 0; ok(D.foeBlow(A, e, e.x, {}) === 'blocked' && A.duelHp === 100, 'a goblin blow the seat BLOCKS costs nothing'); g.setProbe('dodged'); ok(D.foeBlow(A, e, e.x, {}) === 'dodged' && A.duelHp === 100, '...a rolled-through one neither'); g.setProbe('hit');
    A.down = 1; ok(D.foeBlow(A, e, e.x, {}) === false, 'a downed seat is not hurt again'); A.down = 0;
    ok(D.foeBlow(A, { t: 'sprig' }, 0, {}) === null && D.foeBlow(A, null, 0, {}) === null, 'a blow from anything that is not a duel goblin falls through (null) to damagePlayer as before'); }
  { const g = mockGame(), D = g.D; g.fresh(S({ goblins: 'many' })); g.step(0.5); const A = D.st.seats[0], e = { t: 'sprig', duelFoe: true, x: 100, y: 272, alive: true }; A.duelGrace = 0; ok(D.foeBlow(A, e, 100, {}) === false && A.duelHp === 100, 'a goblin blow during the COUNT does nothing'); }
  { const g = mockGame(), D = g.D; g.fresh(S({ goblins: 'many', level: 'your' })); ok(g.D.on(), 'level YOUR still begins with goblins'); }

  console.log('runtime: a kill gives nothing');
  { const g = mockGame(), D = g.D; g.fresh(S({ goblins: 'many' })); g.step(DUEL.round.count + 0.1); g.place(10, 14); g.stepTo(11); const [A, B] = D.st.seats, e = g.gobs()[0]; A.duelHp = 40; B.duelHp = 70; const pts0 = JSON.stringify([A, B].map(p => [p.duelHp, p.duelDealt || 0])); e.alive = false; D.foeDied(e, A);
    ok(A.duelHp === 40 && B.duelHp === 70 && (A.duelDealt || 0) === 0 && A.hp === 100, 'killing a goblin heals NOBODY (duel health, real health and dealt are all untouched)'); ok(A.duelGobs === 1 && D.st.stats.gobKills === 1, '...it only counts: GOBLINS 1 for the killer'); D.foeDied(e, A); ok(A.duelGobs === 1, '...once per goblin');
    const e2 = g.spawned[1]; if (e2) { e2.alive = false; D.foeDied(e2, null); } ok(true, 'a kill with no seat named is credited to the nearest seat or to nobody (never a crash)');
    const m = D.debug().m; ok(Object.values(m.wins).every(v => v === 0), '...and no round is won by it'); }
  { const g = mockGame(), D = g.D; g.fresh(cleanSettings({ goblins: 'many', timeLimit: 0, rounds: 1, lives: 1 })); g.step(DUEL.round.count + 0.1); g.place(10, 14); g.stepTo(12); const [A, B] = D.st.seats; A.duelGobs = 3; B.duelHp = 0; B.duelLives = 0; B.down = 1; g.step(0.1); g.step(DUEL.round.ko + 0.2);
    const R = D.debug().result; ok(R.winner === A.n && R.rows[0].gobs === 3 && R.rows[0].pts === 12 && R.practice === true, 'results card: the GOBLINS count shows (3) and the points are the same as any duel (match 10 + round 2 = 12); a goblin kill added none'); }
  { const txt = text('../src/main.js'), i = txt.indexOf('if (e.hp <= 0 && e.duelFoe)'); const line = txt.slice(i, txt.indexOf('\n', i)).replace(/\/\*[\s\S]*?\*\//g, '');
    ok(i > 0 && /DUELO\.foeDied/.test(line) && !/xpKill|gainXp|dropCoin|killHeal|leaveBody|pirateSpoils|reaperRites|acorns|coins|gainLight|PROG\./.test(line) && /else if \(e\.hp <= 0\) \{/.test(txt.slice(txt.indexOf('\n', i), txt.indexOf('\n', i) + 40)), 'main.js hurtEnemy: a duel goblin\'s death is its own branch BEFORE the normal one and pays no XP, heal, coin, drop, rite or light');
    ok(/foeSpawn:[^\n]*noXp = true; e\.xpPaid = true; e\.elite = false; e\.affix = null/.test(txt) && !/foeSpawn:[^\n]*eliteMake/.test(txt), 'main.js foeSpawn: noXp, xpPaid, no elite, no affix (and it goes through spawnEnt only: foePassSpawn (affixes) is not called for it)');
    ok(/function damagePlayer\(fromX, dmg, o\) \{ \{ const fs0 = \(o && o\.who\) \|\| updFoe; if \(fs0 && fs0\.duelFoe && DUELO\)/.test(txt), 'main.js damagePlayer: the duel goblin hook is the first statement');
    ok(/if \(e\.duelFlee && DUELO\) \{ DUELO\.foeFlee\(e, dt\); continue; \}/.test(txt), 'main.js updateEnemies: a fleeing goblin skips the AI'); }

  console.log('teams + friendly fire');
  { const g = mockGame(), D = g.D; g.fresh(S({ goblins: 'many', teams: true, friendlyFire: false })); g.step(DUEL.round.count + 0.1); const [A, B, C, X] = D.st.seats; g.place(10, 14, 12, 8); const hitOf = (att, vic) => { const e = D.st.prox.get(vic); vic.duelGrace = 0; const h0 = vic.duelHp; g.api.asPlayer(att, () => D.hit(e, 20, att.x)); return h0 - vic.duelHp; };
    ok(A.duelTeam === B.duelTeam && A.duelTeam !== C.duelTeam, 'teams: seats 1+2 vs 3+4'); ok(hitOf(A, B) === 0 && hitOf(B, A) === 0, 'FRIENDLY FIRE off: a teammate\'s blow is nothing, both ways'); ok(hitOf(A, C) > 0 && hitOf(C, A) > 0, '...an enemy\'s blow lands, both ways');
    g.stepTo(11); const e = g.gobs()[0]; ok(!!e, 'teams + goblins: a goblin walks in'); A.duelGrace = 0; B.duelGrace = 0; C.duelGrace = 0; ok(D.foeBlow(A, e, e.x, {}) === 'hit' && D.foeBlow(C, e, e.x, {}) === 'hit', 'goblins are neutral: they wound a seat of EITHER team'); }
  { const g = mockGame(), D = g.D; g.fresh(S({ teams: true, friendlyFire: true })); g.step(DUEL.round.count + 0.1); const [A, B, C] = D.st.seats; g.place(10, 12, 14, 8); const hitOf = (att, vic) => { const e = D.st.prox.get(vic); vic.duelGrace = 0; const h0 = vic.duelHp; g.api.asPlayer(att, () => D.hit(e, 20, att.x)); return h0 - vic.duelHp; };
    ok(hitOf(A, B) > 0 && hitOf(B, A) > 0, 'FRIENDLY FIRE on: a teammate\'s blow lands, both ways'); ok(hitOf(A, C) > 0, '...and the enemy team still can be hit'); B.duelHp = 5; B.duelGrace = 0; const e = D.st.prox.get(B); g.api.asPlayer(A, () => D.hit(e, 40, A.x)); ok(B.duelHp <= 0 || B.down > 0, 'a teammate can K.O. a teammate with it on'); }
  { const g = mockGame(), D = g.D; g.fresh(S({ teams: false, friendlyFire: true })); g.step(DUEL.round.count + 0.1); const [A, B] = D.st.seats; g.place(10, 14); const e = D.st.prox.get(B); B.duelGrace = 0; const h0 = B.duelHp; g.api.asPlayer(A, () => D.hit(e, 20, A.x)); ok(h0 - B.duelHp > 0, 'with teams OFF, friendly fire changes nothing (a free-for-all hits as always)'); }

  console.log('bots');
  { const mkBots = (diff, enemyDx, gobDx, gobY = 0) => { const g = mockGame(), D = g.D; g.fresh(S({ goblins: 'many', botDifficulty: diff, seats: [{ hero: 'knight', isBot: true }, { hero: 'knight', isBot: true }] }), { bots: 'all' }); g.step(DUEL.round.count + 0.1); const [A, B] = D.st.seats; A.x = 12 * TS; B.x = A.x + enemyDx; A.y = B.y = 272; A.vx = 0; A.ground = true; const ge = { t: 'sprig', duelFoe: true, x: A.x + gobDx, y: 272 + gobY, alive: true }; D.st.foe.list.push(ge); return { g, D, A, B }; };
    const lefts = (diff, enemyDx, gobDx, gobY, n = 600) => { const { g, D, A } = mkBots(diff, enemyDx, gobDx, gobY); let l = 0; for (let i = 0; i < n; i++) { g.api.asPlayer(A, () => D.hands(A)); const k = g.keysOut.v; if (k && k.left) l++; g.step(1 / 60); A.x = 12 * TS; } return l / n; };
    const near = lefts('normal', 70, -36, 0), farGob = lefts('normal', 70, -60, 0), seatCloser = lefts('normal', 30, -36, 0);
    ok(near > 0.9, 'a normal bot turns on a goblin 36 px away that is nearer than the enemy seat (' + (near * 100).toFixed(0) + '% of frames walking at him)'); ok(farGob < 0.1, '...but not one 60 px away (beyond 40 px; it goes for the seat)'); ok(seatCloser < 0.1, '...nor when the enemy seat is closer than the goblin');
    const easy = lefts('easy', 70, -36, 0, 60 * 120); ok(easy > 0.25 && easy < 0.75, 'an EASY bot ignores goblins about half the time (' + (easy * 100).toFixed(0) + '% of 120 s on him)'); const hard = lefts('hard', 70, -36, 0); ok(hard > 0.9, 'a hard bot always does (' + (hard * 100).toFixed(0) + '%)'); }
  { const g = mockGame(), D = g.D; g.fresh(S({ goblins: 'off', seats: [{ hero: 'knight', isBot: true }, { hero: 'knight', isBot: true }] }), { bots: 'all' }); g.step(DUEL.round.count + 0.1); g.step(40); ok(g.spawned.length === 0 && D.debug().foe && D.debug().foe.alive === 0, "GOBLINS off with the flag on: no goblin is ever spawned"); }

  console.log('a long simulated match always ends');
  { let ended = 0, runs = 0; const rnd0 = (() => { let a = 12345; return () => { a = (a * 1664525 + 1013904223) >>> 0; return a / 4294967296; }; })(); const worst = { t: 0 };
    for (const [mode, teams, seats, tl, lives] of [['many', false, 2, 90, 1], ['many', true, 4, 60, 2], ['few', false, 4, 0, 3], ['many', false, 3, 120, 5], ['many', true, 4, 0, 1]]) for (let seed = 1; seed <= 4; seed++) {
      const g = mockGame(), D = g.D; runs++; g.fresh(cleanSettings({ goblins: mode, teams, timeLimit: tl, rounds: 3, lives, seats: Array.from({ length: seats }, (_, i) => ({ hero: 'knight', isBot: i > 0 })) }), { seed }); const P = D.st.seats; let goblinKo = 0;
      for (let f = 0; f < 60 * 60 * 25 && D.debug().m.phase !== 'over'; f++) { g.step(1 / 60); const m = D.st.m; if (!m) break;
        if (m.phase === 'fight' && f % 20 === 0) { P.forEach((p, i) => { p.x = (4 + ((i * 5 + Math.floor(f / 200)) % 18)) * TS; });
          if (rnd0() < 0.5) { const att = P[Math.floor(rnd0() * P.length)], vic = P[Math.floor(rnd0() * P.length)]; if (att !== vic && g.api.upright(vic)) { const e = D.st.prox.get(vic); g.api.asPlayer(att, () => D.hit(e, 14 + rnd0() * 20, att.x)); } }
          for (const ge of g.gobs()) if (rnd0() < 0.4) { const v = P[Math.floor(rnd0() * P.length)]; if (g.api.upright(v)) { const k0 = D.st.stats.kos, h0 = v.duelHp; v.duelGrace = 0; D.foeBlow(v, ge, ge.x, {}); if (v.duelHp < 1 || D.st.stats.kos !== k0) goblinKo++; } }
          if (rnd0() < 0.1 && g.gobs().length) { const ge = g.gobs()[0]; ge.alive = false; D.foeDied(ge, P[0]); }
          for (const ge of g.gobs()) if (ge.duelFlee) D.foeFlee(ge, 20 / 60); }
        if (m.phase === 'fight') for (const ge of g.gobs()) if (ge.duelFlee) D.foeFlee(ge, 1 / 60);
        for (const p of P) if (p.down > 0 && D.debug().m.phase !== 'ko') { /* a K.O.'d seat lies there (the duel keeps it down) */ } }
      const done = D.debug().m.phase === 'over'; if (done) ended++; worst.t = Math.max(worst.t, g.now()); ok(done && goblinKo === 0, 'match ' + mode + (teams ? ' teams' : '') + ' x' + seats + ' limit ' + tl + ' lives ' + lives + ' seed ' + seed + ': ends (' + g.now().toFixed(0) + ' s), no seat taken down by a goblin' ); }
    ok(ended === runs, 'all ' + runs + ' long simulated goblin matches end (longest ' + worst.t.toFixed(0) + ' s)'); }

  console.log('the RULES tab + the tavern card');
  { const g = mockGame(), D = g.D; g.fresh(S({})); const p = g.players[0]; D.roster.open(); D.roster.R.tab = 1; const keys = {}; let seen = new Set(); for (let i = 0; i < 12; i++) { D.roster.hands(p, { down: true }, keys); seen.add(D.roster.R.rrow); } ok(seen.size === 9, 'ON: the RULES tab walks NINE rows (seven + GOBLINS + FRIENDLY FIRE): ' + [...seen].join(','));
    D.roster.R.rrow = 7; D.roster.hands(p, { right: true }, keys); ok(D.getSettings().goblins === 'few', 'RIGHT on the GOBLINS row steps it off -> few'); D.roster.R.rrow = 8; D.roster.hands(p, { right: true }, keys); ok(D.getSettings().friendlyFire === true, 'RIGHT on FRIENDLY FIRE turns it on'); }
  { const txt = text('../src/pvp-duel.js'); ok(/id: 'goblins', name: 'GOBLINS'/.test(txt) && /id: 'friendlyFire', name: 'FRIENDLY FIRE'/.test(txt) && /\(!o\.foes \|\| DUEL_FOES\)/.test(txt), 'the tavern card has GOBLINS and FRIENDLY FIRE rows, shown only with the flag'); }
} else {
  console.log('flag OFF (identity with master)');
  ok(FD.DUEL_FOES === false && FD.DUEL_FOES_FLAG === false, 'the flag is OFF by default');
  { const d = cleanSettings({ goblins: 'many', friendlyFire: true, teams: true }); ok(d.goblins === 'off' && d.friendlyFire === false && d.teams === true, 'settings: goblins MANY / friendly fire true are cleaned to off / false, the rest kept (so an old or hand-edited save still loads)'); }
  { const store = {}, ls = { getItem: k => store[k] ?? null, setItem: (k, v) => { store[k] = v; } }; ls.setItem('bracken.duelSettings', JSON.stringify({ v: 1, slots: { slot1: { lives: 4, health: 150, goblins: 'many', friendlyFire: true } } })); const o = loadSettings(ls, 'slot1'); ok(o.lives === 4 && o.health === 150 && o.goblins === 'off' && o.friendlyFire === false, 'a save with goblins set loads clean and keeps the old options'); }
  { const g = mockGame(), D = g.D; g.fresh(cleanSettings({ goblins: 'many', timeLimit: 0, rounds: 1 })); g.step(DUEL.round.count + 0.1); g.place(10, 14); g.step(120); ok(g.spawned.length === 0 && g.enemies.every(e => !e.duelFoe) && D.debug().foe === null, 'a 120 s duel with GOBLINS MANY in the settings spawns NO goblin'); ok(D.debug().result === null, '...and the rest runs as before'); }
  { const g = mockGame(), D = g.D; g.fresh(cleanSettings({ goblins: 'many', teams: true, friendlyFire: true, timeLimit: 0 })); g.step(DUEL.round.count + 0.1); const [A, B] = D.st.seats; g.place(10, 12, 14, 8); const e = D.st.prox.get(B); B.duelGrace = 0; const h0 = B.duelHp; g.api.asPlayer(A, () => D.hit(e, 20, A.x)); ok(B.duelHp === h0, 'teams: a teammate\'s blow is still nothing (friendly fire cannot be switched on)'); }
  { const g = mockGame(), D = g.D; g.fresh(cleanSettings({})); const p = g.players[0]; D.roster.open(); D.roster.R.tab = 1; const keys = {}, seen = new Set(); for (let i = 0; i < 12; i++) { D.roster.hands(p, { down: true }, keys); seen.add(D.roster.R.rrow); } ok(seen.size === 7, 'the RULES tab keeps its SEVEN rows (lives .. teams): ' + [...seen].join(',')); }
  { const txt = text('../src/pvp-duel.js'); ok(/\(!o\.bots \|\| bots\) && \(!o\.foes \|\| DUEL_FOES\)/.test(txt), 'the tavern card hides the two new rows unless the flag is on'); }
}

if (MODE === 'on') {
  const r = spawnSync(process.execPath, [fileURLToPath(import.meta.url), 'off'], { encoding: 'utf8' });
  process.stdout.write(r.stdout || ''); if (r.stderr) process.stderr.write(r.stderr);
  if (r.status !== 0) fails.push('flag-OFF child exited ' + r.status);
}
console.log(fails.length ? '\nFAILS: ' + fails.length : '\nALL OK');
process.exit(fails.length ? 1 : 0);
